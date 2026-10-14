"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[2585];

const sampleTypes = [[6, 1], [3, 2], [2, 3]];
const expectedCode = [
  "class Solution:",
  "    def waysToReachTarget(self, target, types):",
  "        MOD = 10**9 + 7",
  "",
  "        dp = [0] * (target + 1)",
  "        dp[0] = 1",
  "",
  "        for count, points in types:",
  "            next_dp = [0] * (target + 1)",
  "",
  "            for score in range(target + 1):",
  "                next_dp[score] = dp[score]",
  "",
  "                if score >= points:",
  "                    next_dp[score] += next_dp[score - points]",
  "",
  "                if score >= (count + 1) * points:",
  "                    next_dp[score] -= dp[score - (count + 1) * points]",
  "",
  "                next_dp[score] %= MOD",
  "",
  "            dp = next_dp",
  "",
  "        return dp[target]",
];
const eventLines = {
  "bind-class": 1,
  "enter-method": 2,
  "set-modulo": 3,
  "allocate-dp": 5,
  "seed-empty-choice": 6,
  "select-type": 8,
  "allocate-next": 9,
  "select-score": 11,
  "copy-current": 12,
  "check-include": 14,
  "include-previous": 15,
  "check-expire": 17,
  "subtract-expired": 18,
  "normalize-modulo": 20,
  "commit-type": 22,
  "return-answer": 24,
};

function oracle(target, types) {
  let dp = Array(target + 1).fill(0);
  dp[0] = 1;
  for (const [count, points] of types) {
    const next = Array(target + 1).fill(0);
    for (let score = 0; score <= target; score += 1) {
      for (let used = 0; used <= Math.min(count, Math.floor(score / points)); used += 1) {
        next[score] = (next[score] + dp[score - used * points]) % 1000000007;
      }
    }
    dp = next;
  }
  return dp[target];
}

function createRenderer(language = "en") {
  const host = { innerHTML: "" };
  const context = { escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char])) };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(require.resolve("../public/renderer-ways-earn-points-2585.js"), "utf8"),
    context,
  );
  const Visualizer = vm.runInContext("WaysToEarnPoints2585Visualizer", context);
  return { host, renderer: new Visualizer({ host, language, escape: context.escapeHtml }) };
}

test("2585 counts bounded quiz choices for the official example and edge cases", () => {
  const cases = [
    [6, sampleTypes, 7],
    [5, [[2, 2], [2, 3]], 1],
    [7, [[2, 2], [2, 4]], 0],
    [1, [[50, 1]], 1],
    [5, [[50, 1]], 1],
  ];
  for (const [target, types, expected] of cases) {
    assert.equal(problem.builder(target, { types }).answer, expected);
    assert.equal(problem.builder(target, { types }).answer, oracle(target, types));
  }
});

test("2585 counts ways modulo 1e9+7 against bounded brute force", () => {
  let seed = 2585;
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  for (let trial = 0; trial < 80; trial += 1) {
    const target = 1 + random() % 14;
    const types = Array.from({ length: 1 + random() % 5 }, () => [
      1 + random() % 5,
      1 + random() % 8,
    ]);
    assert.equal(problem.builder(target, { types }).answer, oracle(target, types));
  }
  const large = problem.builder(1000, { types: Array.from({ length: 50 }, () => [50, 1]) });
  assert.equal(large.answer, oracle(1000, Array.from({ length: 50 }, () => [50, 1])));
});

test("2585 Python snippet and snapshots step through every executable line", () => {
  const run = problem.builder(6, { types: sampleTypes });
  const expirationRun = problem.builder(8, { types: [[1, 2]] });
  const visitedLines = new Set();
  for (const step of [...run.steps, ...expirationRun.steps]) {
    const view = step.waysToEarnPoints2585View;
    assert.ok(view);
    assert.deepEqual(step.codeLines, [eventLines[view.event]]);
    visitedLines.add(eventLines[view.event]);
    assert.ok(view.cells.length <= 20);
    if (view.event === "include-previous") {
      const { before, ways, after, score, source } = view.transition;
      assert.equal(after, before + ways);
      assert.equal(score - source, view.types[view.typeIndex].points);
    }
    if (view.event === "subtract-expired") {
      const { before, ways, after, score, source } = view.transition;
      const { count, points } = view.types[view.typeIndex];
      assert.equal(after, before - ways);
      assert.equal(score - source, (count + 1) * points);
    }
    if (view.event === "normalize-modulo") {
      assert.equal(view.transition.after, ((view.transition.before % view.modulo) + view.modulo) % view.modulo);
    }
  }
  assert.deepEqual(problem.code, expectedCode);
  for (let line = 1; line <= problem.code.length; line += 1) {
    if (problem.code[line - 1].trim()) assert.ok(visitedLines.has(line), `line ${line} is not stepped`);
  }
  assert.ok(expirationRun.steps.some(step => step.waysToEarnPoints2585View.event === "subtract-expired"));
  assert.equal(run.steps.at(-1).waysToEarnPoints2585View.answer, 7);
});

test("2585 renderer shows bounded question groups and DP transitions in Vietnamese and English", () => {
  const run = problem.builder(6, { types: sampleTypes });
  const step = run.steps.find(item => item.waysToEarnPoints2585View.event === "include-previous");
  for (const language of ["vi", "en"]) {
    const { host, renderer } = createRenderer(language);
    for (const current of run.steps) {
      renderer.render(JSON.parse(JSON.stringify(current)));
      assert.match(host.innerHTML, /wep2585-viz/);
      assert.match(host.innerHTML, /wep2585-types/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
    }
    renderer.render(step);
    assert.match(host.innerHTML, /wep2585-transfer/);
    assert.match(host.innerHTML, /next_dp\[/);
  }
});

test("2585 routes lazy assets, supported problem and line-by-line renderer", () => {
  assert.ok(problem);
  assert.equal(problem.debugMode, "line-by-line");
  assert.deepEqual(problem.liveArgs(6, { types: "6,1;3,2;2,3" }), [6, sampleTypes]);

  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const index = fs.readFileSync(require.resolve("../problems/index.js"), "utf8");
  assert.match(html, /renderer-ways-earn-points-2585\.js/);
  assert.match(html, /ways-earn-points-2585\.css/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /(?:renderer-)?ways-earn-points-2585\.(?:js|css)/);
  assert.match(script, /waysToEarnPoints2585View[\s\S]*?renderWaysToEarnPoints2585View\(step\)/);
  assert.match(index, /require\("\.\/number-of-ways-earn-points-2585"\)/);
});

test("2585 parser enforces target and official type bounds", () => {
  for (const [target, types] of [[0, [[1, 1]]], [1001, [[1, 1]]], [1, []], [1, [[0, 1]]], [1, [[1, 0]]], [1, [[51, 1]]], [1, [[1, 1001]]]]) {
    assert.throws(() => problem.builder(target, { types }));
  }
  assert.equal(problem.builder(6, { types: "[[6,1],[3,2],[2,3]]" }).answer, 7);
});
