'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { test } = require('node:test');
const supported = require('../problems').SUPPORTED;
const build = (id, n, edges) => supported[id].builder(JSON.stringify(edges), { n });
function renderer(language) {
  const host = {}, context = vm.createContext({ lang: language, $: () => host, escapeHtml: String });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/renderer-graph-coloring-886-1042.js'), 'utf8'), context);
  return (id, step) => { context[id === 886 ? 'renderPossibleBipartition886View' : 'renderFlowerGardens1042View'](step); return host.innerHTML; };
}
const bipartitions = [
  [4, [[1,2],[1,3],[2,4]], true], [3, [[1,2],[1,3],[2,3]], false],
  [5, [[1,2],[2,3],[3,4],[4,5],[1,5]], false],
  [6, [[1,2],[3,4]], true], [6, [[1,2],[3,4],[4,5],[3,5]], false],
  [1, [], true], [12, [], true],
];
const gardens = [
  [3, [[1,2],[2,3],[1,3]]], [4, [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]],
  [4, [[1,2],[3,4]]], [1, []], [12, Array.from({ length: 11 }, (_, i) => [i + 1, i + 2])],
];

test('886 returns correct bipartitions and an actual odd-cycle witness on failure', () => {
  for (const [n, edges, expected] of bipartitions) {
    const run = build(886, n, edges), v = run.steps.at(-1).partition886View;
    assert.equal(run.answer, expected);
    assert.equal(v.colors.length, n);
    if (expected) {
      assert.ok(v.colors.every(c => c === 0 || c === 1));
      for (const [u, w] of edges) assert.notEqual(v.colors[u - 1], v.colors[w - 1]);
    } else {
      assert.equal(v.cycle[0], v.cycle.at(-1));
      assert.equal((v.cycle.length - 1) % 2, 1);
      for (let i = 1; i < v.cycle.length; i++) assert.ok(edges.some(([a, b]) => (a === v.cycle[i-1] && b === v.cycle[i]) || (b === v.cycle[i-1] && a === v.cycle[i])));
      assert.equal(v.colors[v.conflict[0] - 1], v.colors[v.conflict[1] - 1]);
    }
  }
});

test('1042 chooses valid flower types, including a case requiring all four', () => {
  for (const [n, edges] of gardens) {
    const run = build(1042, n, edges);
    assert.equal(run.answer.length, n);
    assert.ok(run.answer.every(c => Number.isInteger(c) && c >= 1 && c <= 4));
    for (const [a, b] of edges) assert.notEqual(run.answer[a - 1], run.answer[b - 1]);
    for (const step of run.steps) {
      const v = step.garden1042View;
      assert.ok(!v.used.includes(0));
      if (v.event === 'plant') assert.ok(!v.used.includes(v.colors[v.garden - 1]));
    }
  }
  assert.deepEqual(build(1042, ...gardens[1]).answer, [1,2,3,4]);
});

test('886 and 1042 render every native Python line in both languages', () => {
  for (const language of ['en', 'vi']) {
    const render = renderer(language);
    for (const id of [886, 1042]) {
      const examples = id === 886 ? bipartitions : gardens;
      for (const [n, edges] of examples) {
        const run = build(id, n, edges);
        for (const step of run.steps) {
          const v = id === 886 ? step.partition886View : step.garden1042View;
          assert.equal(step.codeLines.length, 1);
          assert.equal(supported[id].code[step.codeLines[0] - 1].trim(), v.source);
          const html = render(id, step);
          assert.doesNotMatch(html, /undefined|NaN|Infinity/);
          assert.match(html, /role="img"/);
          if (id === 1042 && !step.final) assert.equal((html.match(/data-flower=/g) || []).length, 4);
        }
        assert.match(render(id, run.steps.at(-1)), /gc-lesson-status (good|bad)/);
      }
    }
  }
});

test('886 shows two distinct groups and keeps the conflict edge inside its original group', () => {
  const render = renderer('en');
  const pass = render(886, build(886, ...bipartitions[0]).steps.at(-1));
  assert.match(pass, /GROUP A/); assert.match(pass, /GROUP B/);
  assert.equal((pass.match(/data-node=/g) || []).length, 4);
  const fail = render(886, build(886, ...bipartitions[1]).steps.at(-1));
  assert.match(fail, /gc-lesson-edge bad conflict/);
  assert.match(fail, /Odd cycle/);
  assert.match(fail, /2 → 1 → 3 → 2/);
});

test('1042 shows exactly the blocked colors and the chosen fourth flower', () => {
  const render = renderer('en'), run = build(1042, ...gardens[1]);
  const step = run.steps.find(s => s.garden1042View.event === 'plant' && s.garden1042View.garden === 4);
  const html = render(1042, step);
  for (const c of [1,2,3]) assert.match(html, new RegExp(`class="c${c} blocked" data-flower="${c}"`));
  assert.match(html, /class="c4 chosen" data-flower="4"/);
  assert.match(html, /4 − 3 ≥ 1/);
});

test('graph coloring input validation enforces simple graphs and garden degree limit', () => {
  for (const id of [886,1042]) {
    for (const [n, edges] of [[0,[]],[13,[]],[3,[[1,1]]],[3,[[1,4]]],[3,[[1,2],[2,1]]]]) assert.throws(() => build(id, n, edges), new RegExp(`${id}:`));
    assert.deepEqual(supported[id].liveArgs('[[1,2]]', { n:3 }), [3,[[1,2]]]);
  }
  assert.throws(() => build(1042, 5, [[1,2],[1,3],[1,4],[1,5]]), /at most 3 neighbors/);
});

test('886 matches exhaustive two-group assignments on deterministic small graphs', () => {
  let state = 886;
  const random = () => { state = (Math.imul(state,1664525) + 1013904223) >>> 0; return state / 2 ** 32; };
  for (let i = 0; i < 15; i++) {
    const n = 2 + i % 5, edges = [];
    for (let a=1;a<=n;a++) for(let b=a+1;b<=n;b++) if(random()<.4) edges.push([a,b]);
    const expected = Array.from({ length: 1 << n }, (_, mask) => mask).some(mask => edges.every(([a,b]) => ((mask >> (a-1)) & 1) !== ((mask >> (b-1)) & 1)));
    assert.equal(build(886,n,edges).answer,expected);
  }
});
