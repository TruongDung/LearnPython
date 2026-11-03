"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const problem = require("../problems").SUPPORTED[1697];

function run(input, approach) {
  const builder = problem[`builder${approach}`];
  return builder ? builder(input) : problem.builder(input, { approach: String(approach) });
}

function oracle({ n, edgeList, queries }) {
  return queries.map(([source, target, limit]) => {
    const graph = Array.from({ length: n }, () => []);
    for (const [a, b, weight] of edgeList) {
      if (weight < limit) {
        graph[a].push(b);
        graph[b].push(a);
      }
    }
    const seen = new Set([source]);
    const queue = [source];
    for (let i = 0; i < queue.length; i++) {
      for (const next of graph[queue[i]]) {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
    return seen.has(target);
  });
}

test("1697 exposes six approaches and recommends sorting plus DSU", () => {
  assert.equal(problem.extraParams[0].default, "3");
  assert.equal(problem.extraParams[0].options.length, 6);
  assert.match(problem.extraParams[0].options[2].label.en, /recommended/i);
  assert.equal(problem.code3.length > 0, true);
  assert.equal(problem.code6.length > 0, true);
});

test("all six 1697 approaches agree on boundary and disconnected cases", () => {
  const cases = [
    JSON.parse(problem.defaultInput),
    { n: 2, edgeList: [[0, 1, 5]], queries: [[0, 1, 5], [0, 1, 6], [0, 0, 1]] },
    { n: 4, edgeList: [[0, 1, 0], [1, 2, 3], [0, 2, 7]], queries: [[0, 2, 4], [0, 3, 10], [3, 3, 2]] },
    { n: 1, edgeList: [], queries: [[0, 0, 1]] },
    { n: 3, edgeList: [], queries: [[0, 1, 1], [1, 1, 3]] },
    { n: 4, edgeList: [[0, 1, 2], [1, 2, 2], [2, 3, 2], [0, 3, 2]], queries: [[0, 3, 2], [0, 3, 3]] },
  ];
  let seed = 1697;
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  for (let trial = 0; trial < 80; trial++) {
    const n = 1 + (random() % 8);
    const edgeList = [];
    for (let a = 0; a < n; a++) {
      for (let b = a + 1; b < n; b++) {
        if (random() % 3 === 0) edgeList.push([a, b, random() % 12]);
      }
    }
    const queries = Array.from({ length: 1 + (random() % 6) }, () => [random() % n, random() % n, 1 + (random() % 13)]);
    cases.push({ n, edgeList, queries });
  }
  for (const input of cases) {
    const expected = oracle(input);
    for (let approach = 1; approach <= 6; approach++) {
      const result = run(input, approach);
      assert.deepEqual(result.answer, expected, `approach ${approach}, input ${JSON.stringify(input)}`);
      assert.deepEqual(result.steps.at(-1).distanceLimited1697View.answer, expected);
      assert.ok(result.steps.every((step) => step.codeBlock === approach));
      assert.ok(result.steps.every((step) => step.codeLines[0] >= 1 && step.codeLines[0] <= problem[`code${approach === 1 ? "" : approach}`].length));
    }
  }
});

test("1697 visualization renders method comparison and every strategy without invalid output", () => {
  const context = {};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-distance-limited-paths-1697.js"), "utf8"), context);
  const Visualizer = vm.runInContext("DistanceLimited1697Visualizer", context);
  for (const language of ["vi", "en"]) {
    const host = { innerHTML: "" };
    const renderer = new Visualizer({ host, language });
    for (let approach = 1; approach <= 6; approach++) {
      const result = run(problem.defaultInput, approach);
      for (const step of [result.steps[0], result.steps[Math.floor(result.steps.length / 2)], result.steps.at(-1)]) {
        renderer.render(step);
        assert.match(host.innerHTML, /dl1697-methods/);
        assert.match(host.innerHTML, /recommended|Nên học/);
        assert.match(host.innerHTML, /<svg/);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
      }
    }
  }
});

test("1697 rejects malformed graphs and registers its renderer", () => {
  assert.throws(() => problem.parser("{"), /valid JSON/);
  assert.throws(() => problem.parser({ n: 2, edgeList: [[0, 2, 1]], queries: [] }), /endpoints/);
  assert.throws(() => problem.parser({ n: 2, edgeList: [], queries: [[0, 2, 1]] }), /endpoints/);
  const source = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  assert.match(source, /distanceLimited1697View/);
  const renderer = fs.readFileSync(require.resolve("../public/renderer-distance-limited-paths-1697.js"), "utf8");
  assert.match(renderer, /ORDERED_RENDERER_REGISTRY\.unshift/);
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  assert.match(html, /data-problem-ids="1697"/);
});
