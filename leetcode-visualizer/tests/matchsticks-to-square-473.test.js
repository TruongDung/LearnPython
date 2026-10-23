"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { SUPPORTED, KNAPSACK_SUBTABS, KNAPSACK_TAG } = require("../problems");

const problem = SUPPORTED[473];

test("473 is available as an illustrated line-by-line backtracking problem", () => {
  assert.ok(problem);
  assert.equal(problem.debugMode, "line-by-line");
  assert.equal(problem.slug, "matchsticks-to-square");
  assert.ok(problem.tags.some((tag) => tag.key === KNAPSACK_TAG.key));
  assert.equal(KNAPSACK_SUBTABS[0].roster.find((item) => item.id === 473).available, true);
});

test("473 returns the expected result for both LeetCode examples and a too-long stick", () => {
  assert.equal(problem.builder("1,1,2,2,2").answer, true);
  assert.equal(problem.builder("3,3,3,3,4").answer, false);
  assert.equal(problem.builder("1,1,1,5").answer, false);
});

test("473 displayed Python solves the examples and a backtracking case", () => {
  const harness = `
cases = [([1,1,2,2,2], True), ([3,3,3,3,4], False), ([2,2,2,2,3,3,7,7], True)]
for sticks, expected in cases:
    assert Solution().makesquare(sticks) is expected, (sticks, expected)
print("473-python-ok")
`;
  const localPython = path.resolve(__dirname, "../../.venv/Scripts/python.exe");
  const python = process.env.PYTHON || (process.platform === "win32" && fs.existsSync(localPython) ? localPython : "python3");
  const run = spawnSync(python, ["-c", `${problem.code.join("\n")}\n${harness}`], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /473-python-ok/);
});

test("473 trace shows placement, overflow, symmetry pruning, backtracking, and a valid square", () => {
  const result = problem.builder(problem.defaultInput);
  assert.equal(result.answer, true);
  const frames = result.steps.map((step) => step.matchsticks473View);
  assert.ok(frames.every(Boolean));
  assert.ok(frames.some((frame) => frame.phase === "place-stick"));
  assert.ok(frames.some((frame) => frame.phase === "over-target"));
  assert.ok(frames.some((frame) => frame.phase === "skip-symmetric-side"));
  assert.ok(frames.some((frame) => frame.phase === "undo-stick"));
  assert.deepEqual(frames.at(-1).sides, [7, 7, 7, 7]);
  assert.equal(frames.at(-1).placements.length, 8);

  for (const step of result.steps) {
    const frame = step.matchsticks473View;
    const line = step.codeLines?.[0];
    if (!Number.isInteger(line)) continue;
    assert.equal(frame.source, problem.code[line - 1].trim());
    assert.equal(frame.sides.length, 4);
    assert.deepEqual(frame.sides, [0, 1, 2, 3].map((side) =>
      frame.placements.filter((item) => item.side === side).reduce((sum, item) => sum + item.value, 0)));
  }
});

test("473 rejects invalid lengths and does not mutate the supplied array", () => {
  const sticks = [1, 1, 2, 2, 2];
  assert.equal(problem.builder(sticks).answer, true);
  assert.deepEqual(sticks, [1, 1, 2, 2, 2]);
  assert.throws(() => problem.builder(""), /473/);
  assert.throws(() => problem.builder("1,0,2,3"), /473/);
  assert.throws(() => problem.builder("1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16"), /473/);
});

test("473 renderer draws four edges and highlights overflow, duplicate sides, and undo", () => {
  const result = problem.builder(problem.defaultInput);
  const frames = result.steps.map((step) => step.matchsticks473View);
  const edgeNodes = Array.from({ length: 4 }, () => ({ classList: { add() {} } }));
  const host = {
    innerHTML: "",
    querySelectorAll(selector) { return selector === ".ms473-edge" ? edgeNodes : []; },
  };
  const context = {
    lang: "vi",
    escapeHtml: (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;"),
    $: () => host,
    runViz() {},
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-matchsticks-473.js"), "utf8"), context);

  const renderPhase = (phase, expectedClass) => {
    const step = result.steps.find((item) => item.matchsticks473View.phase === phase);
    context.renderMatchsticks473View(step);
    assert.equal((host.innerHTML.match(/class="ms473-edge ms473-edge-/g) || []).length, 4);
    assert.match(host.innerHTML, new RegExp(`active ${expectedClass}`));
  };
  renderPhase("over-target", "rejected");
  renderPhase("skip-symmetric-side", "duplicate");
  renderPhase("undo-stick", "undo");
  context.renderMatchsticks473View(result.steps.at(-1));
  assert.match(host.innerHTML, /ms473-result yes/);
  assert.match(host.innerHTML, /(?:MỤC TIÊU|TARGET)[\s\S]*?7[\s\S]*?🪵 ✓/);
});
