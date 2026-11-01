const assert = require("node:assert/strict");
const { test } = require("node:test");
const { spawnSync } = require("node:child_process");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const vm = require("node:vm");
const problem = require("../problems").SUPPORTED[2203];

const builders = [
  problem.builder,
  problem.builder2,
  problem.builder3,
  problem.builder4,
  problem.builder5,
];
const sampleEdges = [
  [0, 2, 2], [0, 5, 6], [1, 0, 3], [1, 4, 5], [2, 1, 1],
  [2, 3, 3], [2, 3, 4], [3, 4, 2], [4, 5, 1],
];
const params = { n: 6, src1: 0, src2: 1, dest: 5 };
const encode = (edges) => edges.map((edge) => edge.join(",")).join(";");

test("2203 exposes five approaches and matching builders", () => {
  const selector = problem.extraParams.find((item) => item.key === "approach");
  assert.equal(selector.type, "select");
  assert.deepEqual(selector.options.map((option) => Number(option.value)), [1, 2, 3, 4, 5]);
  for (const builder of builders) assert.equal(typeof builder, "function");
  for (let approach = 2; approach <= 5; approach += 1) {
    assert.ok(problem[`code${approach}`].length > 0);
    assert.match(problem[`code${approach}Label`].en, /Approach/);
  }
});

test("all five approaches solve reachable, unreachable, and cyclic graphs", () => {
  const cases = [
    { edges: sampleEdges, params, expected: 9 },
    { edges: [[0, 1, 1], [2, 1, 1]], params: { n: 3, src1: 0, src2: 1, dest: 2 }, expected: -1 },
    {
      edges: [[0, 1, 8], [0, 2, 2], [2, 1, 2], [1, 3, 2], [2, 3, 9], [3, 0, 1], [1, 4, 3], [4, 5, 1]],
      params: { n: 6, src1: 0, src2: 2, dest: 5 },
      expected: 8,
    },
  ];
  for (const { edges, params: caseParams, expected } of cases) {
    for (const [index, builder] of builders.entries()) {
      const result = builder(encode(edges), caseParams);
      assert.equal(result.answer, expected, `approach ${index + 1}`);
      assert.equal(result.steps.at(-1).final, true);
      assert.equal(result.steps.at(-1).multiDijkstra2203View.phase, "done");
    }
  }
});

test("all approaches agree on deterministic weighted directed graphs", () => {
  let seed = 2203;
  const random = (limit) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % limit;
  };
  for (let sample = 0; sample < 20; sample += 1) {
    const n = 5;
    const edges = [];
    for (let u = 0; u < n; u += 1) {
      for (let v = 0; v < n; v += 1) {
        if (u !== v && random(4) === 0) edges.push([u, v, 1 + random(12)]);
      }
    }
    if (!edges.length) edges.push([0, 1, 1]);
    const input = encode(edges);
    const common = { n, src1: 0, src2: 1, dest: 4 };
    const expected = problem.builder(input, common).answer;
    for (const [index, builder] of builders.entries()) {
      assert.equal(builder(input, common).answer, expected, `approach ${index + 1}, sample ${sample}`);
    }
  }
});

test("displayed Python implementations return the sample answers", () => {
  for (let approach = 1; approach <= 5; approach += 1) {
    const source = `${problem[`code${approach === 1 ? "" : approach}`].join("\n")}\n`
      + `solution = Solution()\n`
      + `print(solution.minimumWeight(6, ${JSON.stringify(sampleEdges)}, 0, 1, 5))\n`
      + `print(solution.minimumWeight(3, [[0, 1, 1], [2, 1, 1]], 0, 1, 2))`;
    const run = spawnSync("python3", ["-c", source], { encoding: "utf8" });
    assert.equal(run.status, 0, `approach ${approach}: ${run.stderr}`);
    assert.deepEqual(run.stdout.trim().split("\n"), ["9", "-1"], `approach ${approach}`);
  }
});

test("2203 visualization names the active approach and explains its strategy", () => {
  const treeHost = { innerHTML: "" };
  const graphHost = { innerHTML: "" };
  const context = {
    lang: "en",
    escapeHtml: String,
    escapeXml: String,
    pick: (value) => value && typeof value === "object" ? value.en : value,
    $: (id) => id === "multi2203Graph" ? graphHost : treeHost,
  };
  vm.createContext(context);
  vm.runInContext(readFileSync(join(__dirname, "..", "public", "renderers-01.js"), "utf8"), context);
  const step = problem.builder3(encode(sampleEdges), params).steps.find((item) => item.multiDijkstra2203View.phase === "floyd-relax");
  context.renderMultiDijkstra2203View(step);
  assert.match(treeHost.innerHTML, /Floyd–Warshall/);
  assert.match(treeHost.innerHTML, /allow each node as an intermediate/);
  assert.match(treeHost.innerHTML, /dist\[\d+\]\[\d+\] = min/);
  assert.match(treeHost.innerHTML, /TRY EVERY MEETING NODE/);
  assert.match(graphHost.innerHTML, /graph-svg/);
});
