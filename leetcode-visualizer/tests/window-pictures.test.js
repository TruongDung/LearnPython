'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const samples = {
  340: [['eceba', { k: 2 }], ['aaabbcc', { k: 1 }], ['abc', { k: 0 }], ['', { k: 2 }], ['😀a😀b', { k: 2 }]],
  424: [['AABABBA', { k: 1 }], ['ABAB', { k: 2 }], ['ABCDE', { k: 0 }], ['', { k: 0 }], ['AAABCDEF', { k: 1 }]],
  438: [['cbaebabacd', { p: 'abc' }], ['abab', { p: 'ab' }], ['baa', { p: 'aa' }], ['abcdef', { p: 'z' }], ['', { p: 'a' }]],
  480: [[[1, 3, -1, -3, 5, 3, 6, 7], { k: 3 }], [[1, 4, 2, 3], { k: 2 }], [[2, 2, 2], { k: 1 }], [[-9, -2, -5, -3], { k: 4 }]],
  487: [[[1, 0, 1, 1, 0], {}], [[1, 1, 1], {}], [[0, 0, 0], {}], [[], {}]],
  567: [['eidbaooo', { s1: 'ab' }], ['eidboaoo', { s1: 'ab' }], ['aaab', { s1: 'aab' }], ['ab', { s1: 'abcd' }], ['😀b😀a', { s1: 'a😀' }]],
  632: [['4,10,15,24,26|0,9,12,20|5,18,22,30', {}], ['1,2,3|1,2,3|1,2,3', {}], ['-5,-1|0,3|-2,4', {}], ['1,1,2|1,2|1,1', {}], ['4,8,9', {}]],
};
function oracle(id, input, params) {
  const items = typeof input === 'string' ? [...input] : input;
  const windows = []; for (let l = 0; l < items.length; l++) for (let r = l + 1; r <= items.length; r++) windows.push(items.slice(l, r));
  if (id === 340) return Math.max(0, ...windows.filter(w => new Set(w).size <= params.k).map(w => w.length));
  if (id === 424) return Math.max(0, ...windows.filter(w => w.length - Math.max(...w.map(ch => w.filter(c => c === ch).length)) <= params.k).map(w => w.length));
  if (id === 487) return Math.max(0, ...windows.filter(w => w.filter(n => n === 0).length <= 1).map(w => w.length));
  if (id === 480) return Array.from({ length: items.length - params.k + 1 }, (_, l) => { const sorted = items.slice(l, l + params.k).sort((a, b) => a - b); return sorted[Math.floor((params.k - 1) / 2)] / 2 + sorted[Math.floor(params.k / 2)] / 2; });
  if (id === 438 || id === 567) { const pattern = [...(params.p || params.s1)], key = pattern.sort().join(''); const starts = items.flatMap((_, l) => items.slice(l, l + pattern.length).sort().join('') === key ? [l] : []); return id === 567 ? starts.length > 0 : starts; }
  const lists = input.split('|').map(s => s.split(',').map(Number)), values = [...new Set(lists.flat())].sort((a, b) => a - b);
  let answer = null;
  for (const lo of values) for (const hi of values) if (hi >= lo && lists.every(list => list.some(value => value >= lo && value <= hi)) && (!answer || hi - lo < answer[1] - answer[0] || hi - lo === answer[1] - answer[0] && lo < answer[0])) answer = [lo, hi];
  return answer;
}
function renderer() {
  const host = { innerHTML: '', dataset: {} }, context = { lang: 'vi', $: () => host };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-window-pictures.js'), 'utf8'), context);
  return { host, context };
}
const plain = object => JSON.parse(JSON.stringify(object));

test('seven window lessons match independent brute force on examples and seeded cases', () => {
  let seed = 340; const rand = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  for (const id of Object.keys(samples).map(Number)) {
    const cases = [...samples[id]];
    for (let i = 0; i < 35; i++) {
      const n = 1 + rand(9), s = Array.from({ length: n }, () => 'abc'[rand(3)]).join('');
      if ([340, 424].includes(id)) cases.push([s, { k: rand(5) }]);
      if ([438, 567].includes(id)) cases.push([s, { [id === 438 ? 'p' : 's1']: Array.from({ length: 1 + rand(4) }, () => 'abc'[rand(3)]).join('') }]);
      if (id === 480) cases.push([Array.from({ length: n }, () => rand(15) - 7), { k: 1 + rand(n) }]);
      if (id === 487) cases.push([Array.from({ length: n }, () => rand(2)), {}]);
      if (id === 632) cases.push([Array.from({ length: 1 + rand(4) }, () => Array.from({ length: 1 + rand(5) }, () => rand(16) - 8).sort((a, b) => a - b).join(',')).join('|'), {}]);
    }
    for (const [input, params] of cases) {
      const result = SUPPORTED[id].builder(input, params);
      assert.deepEqual(result.answer, oracle(id, input, params), `${id}: ${input}`);
      assert.ok(result.steps.at(-1).final);
      assert.ok(result.steps.every(step => step.codeLines.every(line => line >= 1 && line <= SUPPORTED[id].code.length)));
    }
  }
});

test('every picture keeps exact counts, sorted membership, range coverage and source history', () => {
  const { context: ctx, host } = renderer();
  for (const id of Object.keys(samples).map(Number)) for (const [input, params] of samples[id]) {
    const result = SUPPORTED[id].builder(input, params), before = JSON.stringify(result);
    for (const language of ['vi', 'en']) {
      ctx.lang = language;
      for (const step of result.steps) {
        ctx.renderWindowStudyPictures(step);
        const v = ctx.wsScene(ctx.wsRead(step), Number(host.dataset.wsSelected || 0));
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
        if (v.kind === 'range') {
          assert.ok(v.lists.every((list, row) => list[v.selected[row]] >= v.current[0] && list[v.selected[row]] <= v.current[1]));
          assert.equal((host.innerHTML.match(/data-ws-row=/g) || []).length, v.lists.reduce((sum, list) => sum + new Set(list).size, 0));
        } else {
          assert.equal((host.innerHTML.match(/data-ws-index=/g) || []).length, v.items.length);
          const active = v.items.slice(v.left, v.right + 1).filter((_, i) => v.left + i !== v.pending && v.left + i !== v.removed);
          if (v.count) {
            const expected = plain(ctx.wsCounts(active));
            const actual = Object.fromEntries(Object.entries(v.count).filter(([, n]) => n > 0));
            assert.deepEqual(actual, expected, `${id}: ${v.phase} L${v.line}`);
          }
          if (v.kind === 'median') assert.deepEqual(Array.from(v.sorted, entry => entry.index).sort((a, b) => a - b), Array.from({ length: active.length }, (_, i) => i + v.left));
          if (v.best && v.answer) {
            const window = v.items.slice(v.best[0], v.best[1] + 1);
            assert.equal(window.length, v.answer);
            if (id === 424) assert.ok(window.length - Math.max(...Object.values(ctx.wsCounts(window))) <= v.k);
          }
        }
      }
    }
    assert.equal(JSON.stringify(result), before);
    ctx.renderWindowStudyPictures(result.steps[0]); const first = host.innerHTML;
    ctx.renderWindowStudyPictures(result.steps.at(-1)); ctx.renderWindowStudyPictures(result.steps[0]); assert.equal(host.innerHTML, first);
  }
});

test('424 shows actual change cost when the historical max_freq is stale; 487 highlights actual zeros', () => {
  const { context: ctx, host } = renderer();
  const stale = SUPPORTED[424].builder('AABABBA', { k: 1 }).steps.find(step => { const v = step.windowStudyView; return !v.final && v.maxFreq > Math.max(0, ...Object.values(v.count)); });
  assert.ok(stale); ctx.renderWindowStudyPictures(stale); assert.match(host.innerHTML, /ws-history-bound/); assert.match(host.innerHTML, /data-ws-needed="2"/);
  const final = SUPPORTED[487].builder([1, 0, 1, 1, 0]).steps.at(-1); ctx.renderWindowStudyPictures(final);
  assert.match(host.innerHTML, /data-ws-needed="1"/); assert.match(host.innerHTML, /data-ws-answer="4"/);
});

test('every final median/range selection recreates the historical window and preserves the answer', () => {
  const { context: ctx } = renderer();
  for (const id of [480, 632]) for (const [input, params] of samples[id]) {
    const result = SUPPORTED[id].builder(input, params), final = ctx.wsRead(result.steps.at(-1));
    final.history.forEach((entry, index) => {
      const scene = ctx.wsScene(final, index);
      if (id === 480) { assert.equal(scene.median, entry.median); assert.equal(scene.left, entry.left); assert.equal(scene.right, entry.right); }
      else { assert.deepEqual(plain(scene.current), entry.range); assert.deepEqual(plain(scene.selected), entry.selected); }
    });
  }
});

test('displayed Python produces the same results for the changed window lessons', () => {
  const executable = [340, 424, 480, 487, 567];
  const payload = executable.map(id => ({ id, code: SUPPORTED[id].code.join('\n'), cases: samples[id], method: { 340: 'lengthOfLongestSubstringKDistinct', 424: 'characterReplacement', 480: 'medianSlidingWindow', 487: 'findMaxConsecutiveOnes', 567: 'checkInclusion' }[id] }));
  const python = `import json,sys,bisect\nfrom collections import Counter,defaultdict\nclass SortedList(list):\n def add(self,x): bisect.insort(self,x)\ndef remove_from(d,ch):\n d[ch]-=1\n if d[ch]==0: del d[ch]\nresults=[]\nfor p in json.load(sys.stdin):\n scope=dict(Counter=Counter,defaultdict=defaultdict,SortedList=SortedList,remove_from=remove_from)\n exec(p['code'],scope)\n fn=getattr(scope['Solution'](),p['method'])\n answers=[]\n for a,params in p['cases']:\n  answers.append(fn(params['s1'],a) if p['id']==567 else fn(a,params['k']) if 'k' in params else fn(a))\n results.append(answers)\nprint(json.dumps(results))`;
  const out = spawnSync(process.env.PYTHON || 'python3', ['-c', python], { encoding: 'utf8', input: JSON.stringify(payload) });
  assert.equal(out.status, 0, out.stderr); assert.deepEqual(JSON.parse(out.stdout), executable.map(id => samples[id].map(([a, p]) => oracle(id, a, p))));
});

test('invalid window parameters are rejected and the shared assets are registered for all seven lessons', () => {
  for (const id of [340, 424]) for (const k of [-1, 1.5, NaN]) assert.throws(() => SUPPORTED[id].builder('abc', { k }));
  for (const k of [0, 4, 1.5]) assert.throws(() => SUPPORTED[480].builder([1, 2, 3], { k }));
  assert.throws(() => SUPPORTED[487].builder([1, 2])); assert.throws(() => SUPPORTED[632].builder('2,1|3'));
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  for (const name of ['window-pictures.css', 'renderer-window-pictures.js']) assert.match(html, new RegExp(name.replace('.', '\\.') + '[^>]+data-problem-ids="304 340 424 438 480 487 567 632"'));
});
