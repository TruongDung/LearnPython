"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const vm = require("node:vm");

const { SUPPORTED, KNAPSACK_SUBTABS } = require("../problems");
const { readFrontendIndex, readFrontendJavaScript, readFrontendStyles } = require("./helpers/frontend-source");

const problem = SUPPORTED[2915];
const python = process.env.PYTHON || "python3";

function oracle(nums, target) {
  let best = -1;
  for (let mask = 0; mask < 2 ** nums.length; mask++) {
    let sum = 0;
    let length = 0;
    for (let index = 0; index < nums.length; index++) {
      if (!(mask & (1 << index))) continue;
      sum += nums[index];
      length++;
    }
    if (sum === target) best = Math.max(best, length);
  }
  return best;
}

function checkWitness(nums, target, view) {
  assert.equal(view.answer > 0, true);
  assert.ok(Array.isArray(view.solutionIndices));
  assert.equal(view.solutionIndices.length, view.answer);
  assert.equal(new Set(view.solutionIndices).size, view.solutionIndices.length);
  assert.deepEqual([...view.solutionIndices].sort((a, b) => a - b), view.solutionIndices);
  assert.equal(view.solutionIndices.reduce((sum, index) => sum + nums[index], 0), target);
}

test("2915 is an interview-ready 0/1 Knapsack lesson with validated live arguments", () => {
  assert.ok(problem);
  assert.equal(problem.category.key, "dp");
  assert.ok(problem.tags.some((tag) => tag.key === "0-1-knapsack"));
  assert.equal(problem.debugMode, "line-by-line");
  assert.deepEqual(problem.liveArgs([1, 2, 3, 4, 5], { target: 9 }), [[1, 2, 3, 4, 5], 9]);
  assert.equal(problem.code[10], "        return dp[target]");
  assert.equal(KNAPSACK_SUBTABS[0].roster.find((entry) => entry.id === 2915).available, true);

  for (const [input, params] of [
    [[], { target: 1 }], [[0], { target: 1 }], [[-1], { target: 1 }],
    [[1001], { target: 1 }], [[1.5], { target: 1 }], [[1], {}],
    [[1], { target: 0 }], [[1], { target: 1001 }], [null, { target: 1 }],
  ]) {
    assert.throws(() => problem.builder(input, params));
    assert.throws(() => problem.liveArgs(input, params));
  }
});

test("2915 matches the published examples and never reuses one occurrence", () => {
  for (const [nums, target, expected] of [
    [[1, 2, 3, 4, 5], 9, 3],
    [[4, 1, 3, 2, 1, 5], 7, 4],
    [[1, 1, 5, 4, 5], 3, -1],
    [[2], 4, -1],
    [[2, 2], 4, 2],
    [[1, 1, 1, 1], 3, 3],
    [[9, 1, 2, 3], 6, 3],
  ]) {
    const run = problem.builder(nums, { target });
    assert.equal(run.answer, expected, `${nums}; target=${target}`);
    if (expected !== -1) checkWitness(nums, target, run.steps.at(-1).longestSubsequence2915View);
  }
});

test("2915 agrees with brute force on deterministic random cases", () => {
  let state = 2915;
  const random = (limit) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % limit;
  };
  for (let sample = 0; sample < 160; sample++) {
    const nums = Array.from({ length: 1 + random(11) }, () => 1 + random(9));
    const target = 1 + random(30);
    const run = problem.builder(nums, { target });
    assert.equal(run.answer, oracle(nums, target), `${nums}; target=${target}`);
    if (run.answer !== -1) checkWitness(nums, target, run.steps.at(-1).longestSubsequence2915View);
  }
});

test("2915 trace keeps source states in the previous 0/1 row", () => {
  const run = problem.builder([1, 2, 3, 4, 5], { target: 9 });
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    const view = step.longestSubsequence2915View;
    assert.equal(view.source, problem.code[step.codeLines[0] - 1] || "");
    if (!view.transition) continue;
    const transition = view.transition;
    assert.equal(transition.destination - transition.source, view.num);
    assert.equal(view.before[view.sums.indexOf(transition.source)], transition.sourceLength);
    assert.ok(transition.sourceWitness.every((index) => index < view.itemIndex));
    if (transition.reachable) {
      assert.equal(transition.candidate, transition.sourceLength + 1);
      assert.equal(transition.candidateWitness.at(-1), view.itemIndex);
      assert.equal(transition.candidateWitness.reduce((sum, index) => sum + view.nums[index], 0), transition.destination);
    }
  }

  const oneTwo = problem.builder([2], { target: 4 });
  const final = oneTwo.steps.at(-1).longestSubsequence2915View;
  assert.equal(final.answer, -1);
  assert.equal(final.current[final.sums.indexOf(2)], 1);
  assert.equal(final.current[final.sums.indexOf(4)], -1);
});

test("2915 displayed Python agrees with brute force", () => {
  const cases = [
    { nums: [1, 2, 3, 4, 5], target: 9 },
    { nums: [4, 1, 3, 2, 1, 5], target: 7 },
    { nums: [1, 1, 5, 4, 5], target: 3 },
    { nums: [2], target: 4 },
    { nums: [2, 2], target: 4 },
  ];
  const source = `${problem.code.join("\n")}\n\nimport json, sys\ncases = json.load(sys.stdin)\nprint(json.dumps([Solution().lengthOfLongestSubsequence(case[\"nums\"], case[\"target\"]) for case in cases]))`;
  const run = spawnSync(python, ["-c", source], { encoding: "utf8", input: JSON.stringify(cases) });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(JSON.parse(run.stdout), cases.map(({ nums, target }) => oracle(nums, target)));
});

test("2915 caps long traces while solving official-size input", () => {
  const nums = Array(1000).fill(1);
  const run = problem.builder(nums, { target: 1000 });
  assert.equal(run.answer, 1000);
  assert.ok(run.steps.length <= 601);
  const final = run.steps.at(-1).longestSubsequence2915View;
  assert.equal(final.traceTruncated, true);
  assert.equal(final.witnessTracked, false);
  assert.equal(final.solutionIndices, null);
  assert.ok(final.sums.length <= 30);
  assert.ok(JSON.stringify(run).length < 2500000);
});

function rendererHarness() {
  const source = fs.readFileSync(path.join(__dirname, "..", "public", "renderer-longest-subsequence-target-2915.js"), "utf8");
  const element = { innerHTML: "", querySelector: () => null };
  const context = {
    lang: "vi",
    $: () => element,
    escapeHtml: String,
    pick: (value) => value?.vi ?? value,
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, element };
}

test("2915 renderer explains Skip/Take, exact sums, direction, and witness in both languages", () => {
  const { context, element } = rendererHarness();
  for (const language of ["vi", "en"]) {
    context.lang = language;
    context.pick = (value) => value?.[language] ?? value;
    for (const { nums, target } of [
      { nums: [1, 2, 3, 4, 5], target: 9 },
      { nums: [1, 1, 5, 4, 5], target: 3 },
      { nums: [20, 1], target: 3 },
    ]) {
      for (const step of problem.builder(nums, { target }).steps) {
        context.renderLongestSubsequence2915View(step);
        assert.match(element.innerHTML, /lst2915-viz/);
        assert.match(element.innerHTML, /0\/1 KNAPSACK/);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
        const view = step.longestSubsequence2915View;
        view.sums.forEach((sum, index) => {
          assert.ok(element.innerHTML.includes(`data-row="now" data-sum="${sum}" data-length="${view.current[index]}"`));
        });
      }
    }
  }
  context.lang = "en";
  context.pick = (value) => value?.en ?? value;
  context.renderLongestSubsequence2915View(problem.builder([1, 2, 3, 4, 5], { target: 9 }).steps.at(-1));
  assert.match(element.innerHTML, /One optimal subsequence/);
  assert.match(element.innerHTML, /Google-style question/);
});

test("2915 renderer assets are loaded before the generic fallback", () => {
  const script = readFrontendJavaScript();
  const registry = script.slice(script.indexOf("const ORDERED_RENDERER_REGISTRY"));
  assert.ok(registry.indexOf("step.longestSubsequence2915View") < registry.indexOf("step.hardProblemView"));
  assert.match(readFrontendIndex(), /renderer-longest-subsequence-target-2915\.js/);
  assert.match(readFrontendIndex(), /longest-subsequence-target-2915\.css/);
  assert.match(readFrontendStyles(), /\[data-theme="light"\] \.lst2915-viz/);
  assert.match(readFrontendStyles(), /\.lst2915-table-scroll\s*\{[^}]*overflow-x:auto/);
});
