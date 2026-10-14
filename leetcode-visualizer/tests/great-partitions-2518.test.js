"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[2518];
function oracle(nums, k) {
  let answer = 0;
  const total = nums.reduce((a, b) => a + b, 0);
  for (let mask = 0; mask < 2 ** nums.length; mask++) {
    let sum = 0;
    nums.forEach((x, i) => { if (mask & (1 << i)) sum += x; });
    if (sum >= k && total - sum >= k) answer++;
  }
  return answer;
}
const cases = [[[1, 2, 3, 4], 4], [[3, 3, 3], 4], [[6, 6], 2], [[1], 1], [[1, 1], 1], [[1, 1, 1, 1], 2], [[1000000000, 1000000000], 1000]];
test("2518 matches exhaustive ordered partitions including duplicates and empty groups", () => {
  let seed = 2518;
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  for (const [nums, k] of [...cases, ...Array.from({ length: 100 }, () => [Array.from({ length: 1 + random() % 9 }, () => 1 + random() % 8), 1 + random() % 16])]) assert.equal(problem.builder(nums, { k }).answer, oracle(nums, k));
});
test("2518 displayed Python agrees with the implementation", () => {
  const result = spawnSync("python3", ["-c", problem.code.join("\n") + "\nimport json,sys\nfor nums,k,expected in json.load(sys.stdin):\n    assert Solution().countPartitions(nums,k)==expected\n"], { encoding: "utf8", input: JSON.stringify(cases.map(([nums, k]) => [nums, k, oracle(nums, k)])) });
  assert.equal(result.status, 0, result.stderr);
});
test("2518 scans down and reads subsets from earlier indices only", () => {
  const steps = problem.builder([1, 1, 2, 3], { k: 4 }).steps;
  let lastIndex = -1, lastSum = Infinity;
  for (const step of steps) {
    const v = step.greatPartitions2518View;
    assert.equal(step.codeLines.length, 1);
    for (const cell of v.cells) for (const indices of cell.examples) {
      assert.equal(new Set(indices).size, indices.length);
      assert.equal(indices.reduce((sum, i) => sum + v.nums[i], 0), cell.sum);
    }
    if (v.phase !== "read") continue;
    const tr = v.transition;
    if (v.index !== lastIndex) { lastIndex = v.index; lastSum = Infinity; }
    assert.ok(tr.destination < lastSum); lastSum = tr.destination;
    assert.equal(tr.after, null);
    assert.equal(v.cells.find(c => c.sum === tr.destination).count, tr.before);
    if (tr.indices.length) { assert.equal(tr.indices.at(-1), v.index); assert.ok(tr.indices.slice(0, -1).every(i => i < v.index)); }
  }
});
test("2518 snapshots remain immutable and computed values are not revealed early", () => {
  const run = problem.builder([1, 2, 3, 4], { k: 4 });
  assert.equal(run.steps[0].greatPartitions2518View.total, null);
  assert.equal(run.steps.find(s => s.greatPartitions2518View.phase === "read").greatPartitions2518View.transition.after, null);
  for (const step of run.steps.slice(0, -1)) { assert.equal(step.greatPartitions2518View.answer, null); assert.equal(step.greatPartitions2518View.samples, null); }
  const final = run.steps.at(-1).greatPartitions2518View;
  assert.equal(final.bad, 5); assert.equal(final.answer, 6);
  assert.deepEqual(final.cells.map(c => c.count), [1, 1, 1, 2]);
  assert.equal(final.samples.good.length, 6);
});
test("2518 early guard avoids subtracting overlapping bad groups", () => {
  const run = problem.builder([1, 2], { k: 4 });
  assert.equal(run.answer, 0); assert.equal(run.steps.length, 2);
  assert.equal(run.steps.at(-1).greatPartitions2518View.bad, null);
});
test("2518 supports full constraints, modular arithmetic and bounded traces", () => {
  const expected = Number((2n ** 1000n - 2n) % 1000000007n);
  assert.equal(problem.builder(Array(1000).fill(1000000000), { k: 1 }).answer, expected);
  const run = problem.builder(Array(1000).fill(2), { k: 1000 });
  const expectedEqualSplit = (() => { let c = 1n; for (let i = 1; i <= 500; i++) c = c * BigInt(501 + i - 1) / BigInt(i); return Number(c % 1000000007n); })();
  assert.equal(run.answer, expectedEqualSplit);
  assert.ok(run.steps.length <= 501); assert.equal(run.steps.at(-1).greatPartitions2518View.truncated, true);
  assert.ok(run.steps.every(s => s.greatPartitions2518View.cells.length <= 24));
});
test("2518 input and live arguments enforce positive official constraints", () => {
  for (const [nums, k] of [[[], 1], [[0], 1], [[-1], 1], [[1.5], 1], [[1000000001], 1], [[1], 0], [[1], 1001]]) assert.throws(() => problem.builder(nums, { k }));
  assert.deepEqual(problem.liveArgs([1, 2], { k: 1 }), [[1, 2], 1]);
});
function renderer(language) {
  const host = { innerHTML: "" }, context = { escapeHtml: String };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-great-partitions-2518.js"), "utf8"), context);
  const Klass = vm.runInContext("GreatPartitions2518Visualizer", context);
  return { host, visualizer: new Klass({ host, language }) };
}
test("2518 class renders every JSON snapshot in both languages and Prev restores the picture", () => {
  for (const language of ["vi", "en"]) {
    const { host, visualizer } = renderer(language);
    for (const [nums, k] of cases) {
      const run = problem.builder(nums, { k });
      for (const step of run.steps) { visualizer.render(JSON.parse(JSON.stringify(step))); assert.match(host.innerHTML, /gp2518-viz/); assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/); }
      visualizer.render(run.steps[0]); const first = host.innerHTML;
      visualizer.render(run.steps.at(-1)); visualizer.render(run.steps[0]); assert.equal(host.innerHTML, first);
    }
  }
});
test("2518 pictures assign each index once and respect both thresholds", () => {
  const { host, visualizer } = renderer("vi");
  const final = problem.builder([1, 2, 3, 4], { k: 4 }).steps.at(-1);
  visualizer.render(final);
  assert.match(host.innerHTML, /data-answer="ready"/);
  assert.equal((host.innerHTML.match(/class="gp2518-partition"/g) || []).length, 10);
  for (const sample of final.greatPartitions2518View.samples.good) { assert.ok(sample.sumA >= 4 && sample.sumB >= 4); assert.equal(new Set(sample.a).size, sample.a.length); }
  assert.match(host.innerHTML, /Ví dụ cách chia hợp lệ/);
});
test("2518 lazy assets and registry route to the dedicated class", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  assert.match(html, /renderer-great-partitions-2518\.js/); assert.match(html, /great-partitions-2518\.css/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /(?:renderer-)?great-partitions-2518\.(?:js|css)/);
  assert.match(fs.readFileSync(require.resolve("../public/script.js"), "utf8"), /greatPartitions2518View[\s\S]*?renderGreatPartitions2518View\(step\)/);
});
