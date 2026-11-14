'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problems = require('../problems').SUPPORTED;
function renderer() {
  const host = { innerHTML: '', dataset: {} }, ctx = { $: () => host, lang: 'vi' };
  vm.createContext(ctx); vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-added-interval-array.js'), 'utf8'), ctx);
  return { host, ctx };
}
const freeCases = [
  [[1, 2, 6], [1, 9, 10], [2, 2, 7]], [], [[1, 0, 3], [2, 3, 6]],
  [[1, 1, 9], [2, 3, 4], [3, 4, 8]], [[1, 9, 10], [2, 2, 7], [1, 2, 6]],
  [[1, 0, 1000000000]],
];
const positiveCases = [
  [[3, -2, 1, 4], 2, 3, 1], [[-2, 2, -3, 1], 2, 3, -1], [[1, 2, 3, 4], 2, 4, 3],
  [[0], 1, 1, -1], [[1000], 1, 1, 1000], [[-4, 5, -2], 1, 3, 1],
];
function positiveOracle(nums, l, r) {
  let best = Infinity;
  for (let start = 0; start < nums.length; start++) for (let finish = start + l; finish <= Math.min(nums.length, start + r); finish++) {
    const sum = nums.slice(start, finish).reduce((a, b) => a + b, 0);
    if (sum > 0) best = Math.min(best, sum);
  }
  return best === Infinity ? -1 : best;
}

test('9031 reproduces the photo, keeps the initial/final gaps and merges touching half-open blocks', () => {
  const run = blocks => problems[9031].builder(blocks);
  assert.deepEqual(run(freeCases[0]).answer, [[0, 2], [7, 9], [10, '∞']]);
  assert.deepEqual(run([]).answer, [[0, '∞']]);
  assert.deepEqual(run(freeCases[2]).answer, [[6, '∞']]);
  assert.deepEqual(run(freeCases[3]).answer, [[0, 1], [9, '∞']]);
  assert.deepEqual(run(freeCases[4]).answer, run(freeCases[0]).answer);
  assert.deepEqual(run({ blocks: [{ personId: 1, unavailable_date: { startDay: 2, endDay: 6 } }] }).answer, [[0, 2], [6, '∞']]);
  for (const bad of [[[1, -1, 3]], [[1, 2, 2]], [[1, 5, 2]], [[1, 0, Infinity]], 'bad']) assert.throws(() => run(bad), /9031/);
});

test('3364 rolling windows match a brute-force oracle and exclude sums equal to zero', () => {
  let seed = 3364;
  const rand = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  const cases = [...positiveCases];
  for (let sample = 0; sample < 55; sample++) {
    const n = 1 + rand(8), nums = Array.from({ length: n }, () => rand(15) - 7), l = 1 + rand(n), r = l + rand(n - l + 1);
    cases.push([nums, l, r, positiveOracle(nums, l, r)]);
  }
  for (const [nums, l, r, answer] of cases) {
    const run = problems[3364].builder(nums, { l, r }); assert.equal(run.answer, answer);
    for (const step of run.steps) {
      const v = step.minPositive3364View;
      assert.equal(v.source, problems[3364].code[step.codeLines[0] - 1]);
      if (v.window) assert.equal(v.total, nums.slice(v.window[0], v.window[1] + 1).reduce((a, b) => a + b, 0));
      if (v.bestWindow) { const size = v.bestWindow[1] - v.bestWindow[0] + 1; assert.ok(size >= l && size <= r); assert.equal(nums.slice(v.bestWindow[0], v.bestWindow[1] + 1).reduce((a, b) => a + b, 0), v.best); }
    }
  }
  for (const [nums, params] of [[[], {}], [[1], { l: 0, r: 1 }], [[1, 2], { l: 2, r: 1 }], [[1001], { l: 1, r: 1 }]]) assert.throws(() => problems[3364].builder(nums, params), /3364/);
});

test('9031 and 3364 displayed Python returns the same answers in native CPython', () => {
  const cases = [
    ...freeCases.map(blocks => ({ id: 9031, args: [blocks] })),
    ...positiveCases.map(([nums, l, r]) => ({ id: 3364, args: [nums, l, r] })),
  ];
  const python = `import json,sys,math\np=json.load(sys.stdin)\ndef norm(x):\n if isinstance(x,float) and math.isinf(x): return '∞'\n if isinstance(x,list): return [norm(v) for v in x]\n return x\nout=[]\nfor c in p['cases']:\n scope={}\n exec(p['codes'][str(c['id'])],scope)\n method='findAvailability' if c['id']==9031 else 'minimumSumSubarray'\n out.append(norm(getattr(scope['Solution'](),method)(*c['args'])))\nprint(json.dumps(out))`;
  const result = spawnSync(process.env.PYTHON || 'python3', ['-c', python], { encoding: 'utf8', input: JSON.stringify({ codes: { 9031: problems[9031].code.join('\n'), 3364: problems[3364].code.join('\n') }, cases }) });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), cases.map(c => c.id === 9031 ? problems[9031].builder(c.args[0]).answer : problems[3364].builder(c.args[0], { l: c.args[1], r: c.args[2] }).answer));
});

test('3 preserves both algorithms, exact window bounds and longest witnesses', () => {
  const { ctx, host } = renderer();
  for (const s of ['', 'abcabcbb', 'abba', 'bbbbb', 'pwwkew', 'a < a']) for (const approach of [1, 2]) {
    const result = problems[3].builder(s, { approach }), before = JSON.stringify(result);
    for (const step of result.steps) {
      const v = step.charWindow3View;
      assert.equal(v.approach, approach); assert.equal(v.chars.join(''), s);
      assert.equal(v.best, v.bestWindow[1] - v.bestWindow[0] + 1);
      assert.equal(new Set(s.slice(v.bestWindow[0], v.bestWindow[1] + 1)).size, v.best);
      ctx.renderCharWindow3Pictures(step);
      assert.equal((host.innerHTML.match(/data-char3-index="/g) || []).length, s.length);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|< a/);
    }
    assert.equal(JSON.stringify(result), before);
    assert.equal(result.steps.at(-1).charWindow3View.best, result.answer);
  }
});

test('30 word tiles preserve duplicate requirements and final selected matches', () => {
  const { ctx, host } = renderer();
  for (const [s, words, answer] of [['barfoothefoobarman', 'foo,bar', [0, 9]], ['wordgoodgoodgoodbestword', 'word,good,best,good', [8]], ['barfoofoobarthefoobarman', 'bar,foo,the', [6, 9, 12]]]) {
    const result = problems[30].builder(s, { words }), before = JSON.stringify(result);
    assert.deepEqual([...result.answer].sort((a, b) => a - b), answer);
    for (const step of result.steps) { ctx.renderWordBlocks30Pictures(step); assert.doesNotMatch(host.innerHTML, /undefined|NaN/); }
    const last = result.steps.at(-1);
    for (let i = 0; i < result.answer.length; i++) {
      host.dataset.words30Selected = String(i); ctx.renderWordBlocks30Pictures(last);
      const counts = [...host.innerHTML.matchAll(/data-word30-count="([^"]+)" data-have="(\d+)" data-need="(\d+)"/g)];
      counts.forEach(([, , have, need]) => assert.equal(have, need));
    }
    assert.equal(JSON.stringify(result), before);
  }
});

test('new 9031 and 3364 pictures replay in both languages without changing source states', () => {
  const { ctx, host } = renderer();
  const runs = [problems[9031].builder(problems[9031].defaultInput), ...positiveCases.map(([nums, l, r]) => problems[3364].builder(nums, { l, r }))];
  for (const result of runs) {
    const before = JSON.stringify(result);
    for (const language of ['vi', 'en']) {
      ctx.lang = language;
      for (const step of result.steps) { if (step.commonFree9031View) ctx.renderCommonFree9031Pictures(step); else ctx.renderMinPositive3364Pictures(step); assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/); }
    }
    assert.equal(JSON.stringify(result), before);
  }
});
