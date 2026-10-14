const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const problem = require("../problems").SUPPORTED[1416];

function brute(s, k) {
  if (!s.length) return [[]];
  if (s[0] === "0") return [];
  const result = [];
  for (let end = 1; end <= s.length; end++) {
    if (Number(s.slice(0, end)) > k) break;
    for (const tail of brute(s.slice(end), k)) result.push([s.slice(0, end), ...tail]);
  }
  return result;
}

test("1416 counts and pictured arrays agree with exhaustive splits", () => {
  const cases = [["1317", 2000], ["1000", 10000], ["1000", 10], ["101", 100], ["123", 12], ["9", 1]];
  let seed = 1416;
  for (let trial = 0; trial < 80; trial++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const s = String(seed % 900000 + 100000);
    cases.push([s, seed % 1000 + 1]);
  }
  for (const [s, k] of cases) {
    const expected = brute(s, k);
    const run = problem.builder(s, { k });
    assert.equal(run.answer, expected.length);
    const final = run.steps.at(-1).restoreArray1416View;
    assert.equal(final.targetExamples.length, Math.min(8, expected.length));
    const actual = final.targetExamples.map(parts => JSON.stringify(parts));
    assert.equal(new Set(actual).size, actual.length);
    for (const parts of actual) assert.ok(expected.some(p => JSON.stringify(p) === parts));
  }
});

test("1416 snapshots preserve source cuts and distinguish reads from writes", () => {
  const run = problem.builder("1317", { k: 2000 });
  assert.deepEqual(run.steps[0].restoreArray1416View.targetExamples, [[]]);
  for (const step of run.steps) {
    const v = step.restoreArray1416View;
    for (const parts of v.sourceExamples) assert.equal(parts.join(""), v.s.slice(0, v.start));
    const target = v.end === null ? v.start : v.end + 1;
    for (const parts of v.targetExamples) {
      assert.equal(parts.join(""), v.s.slice(0, target));
      assert.ok(parts.every(p => p[0] !== "0" && Number(p) >= 1 && Number(p) <= v.k));
    }
    if (v.phase === 2) assert.equal(v.after, null);
    if (v.updated) assert.equal(v.after, (v.before + v.sourceWays) % 1000000007);
  }
  const blocked = problem.builder("101", { k: 10 });
  assert.ok(blocked.steps.some(s => s.restoreArray1416View.phase === 4 && s.restoreArray1416View.end === null));
  assert.ok(problem.builder("131", { k: 10 }).steps.some(s => s.restoreArray1416View.phase === 4 && s.restoreArray1416View.value > 10));
});

test("1416 bounds large traces and examples while keeping modulo counts correct", () => {
  const s = "1".repeat(120);
  const run = problem.builder(s, { k: 1000000000 });
  const expected = Array(121).fill(0); expected[0] = 1;
  for (let i = 1; i <= 120; i++) for (let size = 1; size <= 9 && size <= i; size++) expected[i] = (expected[i] + expected[i - size]) % 1000000007;
  assert.equal(run.answer, expected[120]);
  assert.ok(run.steps.length <= 241);
  assert.equal(run.steps.at(-1).restoreArray1416View.traceTruncated, true);
  for (const { restoreArray1416View: v } of run.steps) {
    assert.ok(v.cells.length <= 18);
    assert.ok(v.sourceExamples.length <= 8 && v.targetExamples.length <= 8);
  }
});

test("1416 renders both languages, failures, final arrays and restores earlier steps", () => {
  const context = { escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-restore-array-1416.js"), "utf8"), context);
  const Klass = vm.runInContext("RestoreArray1416Visualizer", context);
  for (const language of ["vi", "en"]) {
    const host = { innerHTML: "" }, renderer = new Klass({ host, language });
    for (const [s, k] of [["1317", 2000], ["101", 10], ["9", 1], ["1".repeat(120), 1000000000]]) {
      const run = problem.builder(s, { k });
      for (const step of run.steps) {
        renderer.render(JSON.parse(JSON.stringify(step)));
        assert.match(host.innerHTML, /ra1416-viz/);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
      }
      renderer.render(run.steps[0]); const first = host.innerHTML;
      renderer.render(run.steps.at(-1)); renderer.render(run.steps[0]);
      assert.equal(host.innerHTML, first);
    }
    renderer.render(problem.builder("1317", { k: 2000 }).steps.at(-1));
    assert.equal((host.innerHTML.match(/class="ra1416-result"/g) || []).length, 8);
  }
});
