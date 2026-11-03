"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const problem = require("../problems").SUPPORTED[3108];

function run(input, approach) {
  const builder = problem[`builder${approach}`];
  return builder ? builder(input) : problem.builder(input, { approach: String(approach) });
}

function oracle({ n, edges, queries }) {
  const graph = Array.from({ length: n }, () => []);
  edges.forEach(([u, v, weight], id) => {
    graph[u].push([v, id]);
    graph[v].push([u, id]);
  });
  return queries.map(([source, target]) => {
    const seen = new Set([source]), edgeIds = new Set(), queue = [source];
    for (let i = 0; i < queue.length; i++) {
      for (const [next, id] of graph[queue[i]]) {
        edgeIds.add(id);
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
    if (!seen.has(target)) return -1;
    let cost = -1;
    for (const id of edgeIds) cost &= edges[id][2];
    return cost;
  });
}

test("3108 offers all five approaches with one-pass DSU selected by default", () => {
  assert.equal(problem.extraParams[0].options.length, 5);
  assert.equal(problem.extraParams[0].default, "5");
  assert.match(problem.complexity.time, /E\+Q/);
  assert.match(problem.code5.join("\n"), /cost\[root_a\].*&= cost\[root_b\].*& weight/);
});

test("all five 3108 approaches match component-edge AND on boundary and randomized graphs", () => {
  const cases = [
    JSON.parse(problem.defaultInput),
    { n: 1, edges: [], queries: [[0, 0]] },
    { n: 4, edges: [], queries: [[0, 0], [0, 1]] },
    { n: 4, edges: [[0, 1, 7], [1, 2, 3], [0, 2, 5], [2, 2, 1]], queries: [[0, 2], [1, 1], [3, 3]] },
    { n: 5, edges: [[0, 1, 12], [1, 2, 10], [3, 4, 7]], queries: [[0, 2], [0, 4], [3, 4], [2, 2]] },
  ];
  let seed = 3108;
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  for (let trial = 0; trial < 100; trial++) {
    const n = 1 + (random() % 9), edges = [];
    for (let u = 0; u < n; u++) {
      for (let v = u + 1; v < n; v++) {
        if (random() % 3 === 0) edges.push([u, v, random() % 128]);
      }
    }
    const queries = Array.from({ length: 1 + (random() % 8) }, () => [random() % n, random() % n]);
    cases.push({ n, edges, queries });
  }
  for (const input of cases) {
    const expected = oracle(input);
    for (let approach = 1; approach <= 5; approach++) {
      const result = run(input, approach);
      assert.deepEqual(result.answer, expected, `approach ${approach}; ${JSON.stringify(input)}`);
      assert.deepEqual(result.steps.at(-1).minimumCostWalk3108View.answer, expected);
      assert.ok(result.steps.every((step) => step.codeBlock === approach));
      const snippet = problem[`code${approach === 1 ? "" : approach}`];
      assert.ok(result.steps.every((step) => step.codeLines[0] >= 1 && step.codeLines[0] <= snippet.length));
      for (const step of result.steps) {
        const view = step.minimumCostWalk3108View;
        if (approach === 5 && ["merge", "same-component"].includes(view.phase)) {
          const [u] = input.edges[view.activeEdge];
          const root = view.component[u];
          assert.equal(view.currentCost, view.dsuCost[root]);
        }
      }
    }
  }
});

test("3108 visualization renders graph, query table, and five methods in both languages", () => {
  const context = {};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-minimum-cost-walk-3108.js"), "utf8"), context);
  const Visualizer = vm.runInContext("MinimumCostWalk3108Visualizer", context);
  for (const language of ["vi", "en"]) {
    const host = { innerHTML: "" }, renderer = new Visualizer({ host, language });
    for (let approach = 1; approach <= 5; approach++) {
      const result = run(problem.defaultInput, approach);
      for (const step of [result.steps[0], result.steps[Math.floor(result.steps.length / 2)], result.steps.at(-1)]) {
        renderer.render(step);
        assert.match(host.innerHTML, /mcw3108-methods/);
        assert.equal((host.innerHTML.match(/<tr/g) || []).length, 6);
        assert.match(host.innerHTML, /<svg/);
        assert.match(host.innerHTML, /Q1/);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
      }
    }
  }
});

test("3108 rejects invalid input and registers browser assets and renderer", () => {
  assert.throws(() => problem.parser("{"), /valid JSON/);
  assert.throws(() => problem.parser({ n: 2, edges: [[0, 2, 1]], queries: [] }), /endpoints/);
  assert.throws(() => problem.parser({ n: 2, edges: [], queries: [[0, 2]] }), /endpoints/);
  assert.match(fs.readFileSync(require.resolve("../public/script.js"), "utf8"), /minimumCostWalk3108View/);
  const renderer = fs.readFileSync(require.resolve("../public/renderer-minimum-cost-walk-3108.js"), "utf8");
  assert.match(renderer, /ORDERED_RENDERER_REGISTRY\.unshift/);
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  assert.match(html, /data-problem-ids="3108"/);
});
