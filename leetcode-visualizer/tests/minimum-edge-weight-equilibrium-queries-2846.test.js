"use strict";

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const vm = require("node:vm");
const { SUPPORTED, COMPANY_SUBTABS } = require("../problems");
const { prepareGenericLiveArgs } = require("../live-args");
const { readFrontendIndex, readFrontendJavaScript, readFrontendStyles } = require("./helpers/frontend-source");

const problem = SUPPORTED[2846];

function brute(n, edges, queries) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v, weight] of edges) {
    graph[u].push([v, weight]);
    graph[v].push([u, weight]);
  }
  return queries.map(([start, target]) => {
    const parent = Array(n).fill(null);
    parent[start] = [-1, 0];
    const queue = [start];
    for (const node of queue) {
      if (node === target) break;
      for (const [neighbor, weight] of graph[node]) {
        if (parent[neighbor] !== null) continue;
        parent[neighbor] = [node, weight];
        queue.push(neighbor);
      }
    }
    const counts = Array(27).fill(0);
    let length = 0;
    let node = target;
    while (node !== start) {
      const [previous, weight] = parent[node];
      counts[weight] += 1;
      length += 1;
      node = previous;
    }
    return length - Math.max(0, ...counts);
  });
}

test("2846 is registered as a Google binary-lifting interview lesson", () => {
  assert.equal(problem.id, 2846);
  assert.equal(problem.slug, "minimum-edge-weight-equilibrium-queries-in-a-tree");
  assert.equal(problem.difficulty, "hard");
  assert.equal(problem.category.key, "binary-lifting");
  assert.deepEqual(problem.tags.map((tag) => tag.key), ["tree", "lowest-common-ancestor", "prefix-frequency", "binary-lifting"]);
  assert.ok(problem.companies.includes("google"));
  const google = COMPANY_SUBTABS.find((company) => company.key === "google");
  assert.equal(google.roster.find((entry) => entry.id === 2846).available, true);
  assert.match(problem.code.join("\n"), /prefix\[u\]\[w\] \+ prefix\[v\]\[w\] - 2 \* prefix\[ancestor\]\[w\]/);
  assert.match(problem.code.join("\n"), /a = up\[bit\]\[a\]/);
  assert.equal(problem.complexity.time, "O((n + q) log n + 26q)");
});

test("2846 matches the published example and executes its displayed Python", () => {
  const edges = [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 2], [4, 5, 2], [5, 6, 2]];
  const queries = [[0, 3], [3, 6], [2, 6], [4, 4]];
  const expected = [0, 0, 1, 0];
  const run = problem.builder(JSON.stringify(edges), { n: 7, queries: JSON.stringify(queries) });
  assert.deepEqual(run.answer, expected);
  assert.equal(run.steps.at(-1).final, true);

  const source = problem.code.join("\n");
  const harness = `\nassert Solution().minOperationsQueries(7, ${JSON.stringify(edges)}, ${JSON.stringify(queries)}) == ${JSON.stringify(expected)}\n`;
  const executed = spawnSync(process.env.PYTHON || "python3", ["-c", `${source}${harness}`], { encoding: "utf8" });
  assert.equal(executed.status, 0, executed.stderr);
});

test("2846 agrees with an independent path oracle on deterministic random trees", () => {
  let seed = 2846;
  const random = (max) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };
  for (let trial = 0; trial < 100; trial += 1) {
    const n = 2 + random(11);
    const edges = [];
    for (let node = 1; node < n; node += 1) edges.push([node, random(node), 1 + random(6)]);
    const queries = Array.from({ length: 1 + random(10) }, () => [random(n), random(n)]);
    const expected = brute(n, edges, queries);
    const run = problem.builder(JSON.stringify(edges), { n, queries: JSON.stringify(queries) });
    assert.deepEqual(run.answer, expected, JSON.stringify({ n, edges, queries }));
  }
});

test("2846 trace exposes preprocessing, LCA jumps, prefix subtraction, and the mode", () => {
  const run = problem.builder(problem.defaultInput, Object.fromEntries(problem.extraParams.map((param) => [param.key, param.default])));
  const views = run.steps.map((step) => step.edgeEquilibrium2846View);
  assert.ok(views.every((view) => view?.problemId === 2846));
  assert.ok(run.steps.every((step) => step.codeLines.length === 1 && step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  const events = new Set(views.map((view) => view.event));
  for (const event of ["build-graph", "orient-edge", "build-jump-level", "start-query", "lca-found", "subtract-prefixes", "answer-query", "done"]) {
    assert.ok(events.has(event), `missing ${event}`);
  }
  const counted = views.find((view) => view.event === "subtract-prefixes" && view.query[0] === 2 && view.query[1] === 6);
  assert.equal(counted.ancestor, 2);
  assert.equal(counted.pathLength, 4);
  assert.deepEqual(counted.frequencies.slice(0, 2), [1, 3]);
  const answered = views.find((view) => view.event === "answer-query" && view.query[0] === 2 && view.query[1] === 6);
  assert.equal(answered.pathLength - answered.maxFrequency, 1);
});

test("2846 validates tree/query constraints and prepares live arguments", () => {
  assert.throws(() => problem.builder("[[0,1,27]]", { n: 2, queries: "[[0,1]]" }), /weights must be in \[1,26\]/);
  assert.throws(() => problem.builder("[[0,1,1],[1,2,2]]", { n: 4, queries: "[[0,1]]" }), /n-1 edges/);
  assert.throws(() => problem.builder("[[0,1,1],[1,2,2],[2,0,3]]", { n: 4, queries: "[[0,1]]" }), /cycle/);
  assert.throws(() => problem.builder("[[0,1,1]]", { n: 2, queries: "[[0,2]]" }), /query endpoints/);
  assert.deepEqual(prepareGenericLiveArgs(problem, problem.defaultInput, { n: 7, queries: "[[0,3]]" }), [
    7,
    [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 2], [4, 5, 2], [5, 6, 2]],
    [[0, 3]],
  ]);
});

test("2846 custom renderer is wired, bilingual, and complete for every trace step", () => {
  const index = readFrontendIndex();
  const styles = readFrontendStyles();
  const script = readFrontendJavaScript();
  assert.match(index, /renderer-edge-equilibrium-2846\.js/);
  assert.match(index, /edge-equilibrium-2846\.css/);
  assert.match(styles, /\.ew2846-frequency/);
  assert.match(script, /edgeEquilibrium2846View/);

  const start = script.indexOf("const EW2846_COPY");
  const end = script.indexOf("\n\"use strict\";", start + 20);
  const renderer = end > start ? script.slice(start, end) : script.slice(start);
  const elements = new Map();
  const elementFor = (id) => {
    if (!elements.has(id)) elements.set(id, { innerHTML: "" });
    return elements.get(id);
  };
  const context = { lang: "en", $: elementFor, pick: (value) => value?.en ?? value?.vi ?? value ?? "" };
  vm.createContext(context);
  vm.runInContext(renderer, context);
  const run = problem.builder(problem.defaultInput, { n: 7, queries: "[[0,3],[3,6],[2,6]]" });
  for (const language of ["en", "vi"]) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderEdgeEquilibrium2846View(step);
      const html = elementFor("treeView").innerHTML;
      assert.match(html, /ew2846-viz/);
      assert.match(html, /ew2846-tree/);
      assert.match(html, /ew2846-frequency/);
      assert.match(html, /ew2846-answers/);
      assert.doesNotMatch(html, /NaN|undefined|Infinity/);
    }
  }
  const frequencyStep = run.steps.find((step) => step.edgeEquilibrium2846View.event === "subtract-prefixes" && step.edgeEquilibrium2846View.queryIndex === 2);
  context.lang = "en";
  context.renderEdgeEquilibrium2846View(frequencyStep);
  assert.match(elementFor("treeView").innerHTML, /w=2/);
  assert.match(elementFor("treeView").innerHTML, /largest bucket/);
});
