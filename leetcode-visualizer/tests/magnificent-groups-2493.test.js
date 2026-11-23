'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const problem = require('../problems').SUPPORTED[2493];

const fixtures = [
  [6, [[1,2],[1,4],[1,5],[2,6],[2,3],[4,6]], 4],
  [3, [[1,2],[2,3],[3,1]], -1],
  [6, [[1,2],[2,3],[4,5]], 6],
  [4, [[1,2],[2,3],[3,4],[4,1]], 3],
  [5, [[1,2],[1,3],[1,4],[1,5]], 3],
  [6, [[1,2],[3,4],[4,5],[5,3]], -1],
  [1, [], 1],
  [12, [], 12],
  [12, Array.from({ length: 11 }, (_, i) => [i + 1, i + 2]), 12],
  [12, Array.from({ length: 6 }, (_, i) => Array.from({ length: 6 }, (_, j) => [i + 1, j + 7])).flat(), 3],
];

function build(n, edges) { return problem.builder(JSON.stringify(edges), { n }); }
function makeRenderer(language = 'en') {
  const elements = { treeView: {} };
  const context = vm.createContext({
    lang: language,
    $: id => elements[id],
    escapeHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;'),
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/renderer-magnificent-groups-2493.js'), 'utf8'), context);
  return step => { context.renderMagnificentGroups2493View(step); return elements.treeView.innerHTML; };
}

test('2493 traces the actual Python solution and returns the expected answers', () => {
  assert.equal(problem.debugMode, 'line-by-line');
  for (const [n, edges, expected] of fixtures) {
    const run = build(n, edges);
    assert.equal(run.answer, expected);
    assert.equal(run.steps.at(-1).final, true);
    for (const step of run.steps) {
      assert.equal(step.codeLines.length, 1);
      assert.equal(problem.code[step.codeLines[0] - 1].trim(), step.magnificent2493View.source);
    }
  }
});

test('2493 reports each root separately and keeps maxima per component', () => {
  const run = build(...fixtures[0]);
  const final = run.steps.at(-1).magnificent2493View;
  assert.deepEqual(final.trials.map(t => t.groups), [3, 3, 4, 4, 4, 4]);
  assert.equal(final.winners[0].start, 3);
  assert.equal(final.total, 4);
  for (const trial of final.trials) {
    assert.equal(run.steps[trial.step].magnificent2493View.event, 'record');
    assert.equal(Object.keys(trial.distances).length, 6);
  }
  const split = build(...fixtures[2]).steps.at(-1).magnificent2493View;
  assert.deepEqual(split.winners.map(w => w.groups), [3, 2, 1]);
  assert.equal(split.total, 6);
  // An early snapshot must not gain later trials or distance assignments.
  const firstAssigned = run.steps.find(s => s.magnificent2493View.event === 'assign').magnificent2493View;
  assert.deepEqual(firstAssigned.distances, { 1: 0, 2: 1 });
  assert.equal(firstAssigned.trials.length, 0);
});

test('2493 visualizes the winning assignment, including separate components and isolated nodes', () => {
  const render = makeRenderer();
  for (const [n, edges, expected] of fixtures.filter(row => row[2] !== -1)) {
    const html = render(build(n, edges).steps.at(-1));
    const assignment = new Map([...html.matchAll(/data-node="(\d+)" data-group="(\d+)"/g)].map(m => [Number(m[1]), Number(m[2])]));
    assert.equal(assignment.size, n);
    assert.equal(new Set(assignment.values()).size, expected);
    assert.deepEqual([...new Set(assignment.values())].sort((a, b) => a - b), Array.from({ length: expected }, (_, i) => i + 1));
    for (const [u, v] of edges) assert.equal(Math.abs(assignment.get(u) - assignment.get(v)), 1);
  }
  const html = render(build(...fixtures[2]).steps.at(-1));
  assert.match(html, /3 \+ 2 \+ 1 = 6/);
});

test('2493 keeps the offending edge visible within one group on failure', () => {
  const run = build(...fixtures[1]);
  const render = makeRenderer();
  const conflictStep = run.steps.find(s => s.magnificent2493View.event === 'conflict');
  assert.ok(conflictStep);
  for (const step of [conflictStep, run.steps.at(-1)]) {
    const v = step.magnificent2493View, [u, w] = v.conflict;
    assert.equal(v.distances[u], v.distances[w]);
    const html = render(step);
    assert.match(html, /mg2493-edge bad/);
    assert.match(html, /Same group → -1/);
    assert.match(html, /\|2 − 2\| = 0/);
  }
});

test('2493 renders every frame in both languages without invalid geometry or future results', () => {
  for (const language of ['vi', 'en']) {
    const render = makeRenderer(language);
    for (const fixture of fixtures.slice(0, 4)) {
      const run = build(...fixture);
      for (const step of run.steps) {
        const html = render(step);
        assert.doesNotMatch(html, /undefined|NaN|Infinity|__pairs__/);
        if (!step.magnificent2493View.final) assert.match(html, /data-mg2493-finish/);
      }
    }
  }
});

test('2493 validates graph input and keeps live editor arguments aligned', () => {
  assert.deepEqual(problem.liveArgs('[[1,2]]', { n: 3 }), [3, [[1,2]]]);
  for (const [input, n] of [['{}', 3], ['broken', 3], ['[[1,1]]', 3], ['[[0,2]]', 3], ['[[1,4]]', 3], ['[[1,2],[2,1]]', 3], ['[]', 0], ['[]', 13], ['[]', 2.5]]) {
    assert.throws(() => problem.builder(input, { n }), /2493:/);
  }
});

test('2493 matches an independent Floyd-Warshall diameter oracle on varied small graphs', () => {
  let seed = 2493;
  const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
  for (let sample = 0; sample < 18; sample++) {
    const n = 2 + sample % 5, edges = [];
    for (let u = 1; u <= n; u++) for (let v = u + 1; v <= n; v++) if (rand() < .34) edges.push([u, v]);
    const d = Array.from({ length: n }, (_, u) => Array.from({ length: n }, (_, v) => u === v ? 0 : Infinity));
    for (const [u, v] of edges) d[u - 1][v - 1] = d[v - 1][u - 1] = 1;
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
    const seen = new Set(); let expected = 0;
    for (let root = 0; root < n; root++) {
      if (seen.has(root)) continue;
      const nodes = Array.from({ length: n }, (_, i) => i).filter(i => d[root][i] < Infinity);
      nodes.forEach(i => seen.add(i));
      if (edges.some(([u, v]) => d[root][u - 1] < Infinity && d[root][u - 1] % 2 === d[root][v - 1] % 2)) { expected = -1; break; }
      expected += 1 + Math.max(...nodes.flatMap(u => nodes.map(v => d[u][v])));
    }
    assert.equal(build(n, edges).answer, expected, JSON.stringify({ n, edges }));
  }
});
