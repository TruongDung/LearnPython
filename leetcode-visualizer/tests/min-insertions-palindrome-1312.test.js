"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[1312];

function oracle(s) {
  const dp = Array.from({ length: s.length }, () => Array(s.length).fill(0));
  for (let i = s.length - 1; i >= 0; i -= 1) {
    for (let j = i + 1; j < s.length; j += 1) {
      dp[i][j] = s[i] === s[j] ? (dp[i + 1]?.[j - 1] || 0) : 1 + Math.min(dp[i + 1][j], dp[i][j - 1]);
    }
  }
  return s.length ? dp[0][s.length - 1] : 0;
}

function isPalindrome(s) {
  return s === [...s].reverse().join("");
}

function isSubsequence(needle, haystack) {
  let i = 0;
  for (const char of haystack) if (needle[i] === char) i += 1;
  return i === needle.length;
}

function createRenderer(language) {
  const host = { innerHTML: "" };
  const context = { escapeHtml: value => String(value ?? "") };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-min-insertions-palindrome-1312.js"), "utf8"), context);
  const Visualizer = vm.runInContext("MinInsertionsPalindrome1312Visualizer", context);
  return { host, visualizer: new Visualizer({ host, language }) };
}

test("1312 interval DP matches the recurrence and reconstructs a minimum palindrome", () => {
  const cases = ["mbadm", "leetcode", "a", "aa", "ab", "abc", "race", "google", "agbcba", ""];
  for (let length = 1; length <= 5; length += 1) {
    for (let mask = 0; mask < 3 ** length; mask += 1) {
      let value = mask;
      let s = "";
      for (let i = 0; i < length; i += 1, value = Math.floor(value / 3)) s += "abc"[value % 3];
      cases.push(s);
    }
  }
  for (const s of cases) {
    const run = problem.builder(s);
    assert.equal(run.answer, oracle(s), s);
    assert.ok(isPalindrome(run.palindrome), `${s} -> ${run.palindrome}`);
    assert.ok(isSubsequence(s, run.palindrome), `${s} is not a subsequence of ${run.palindrome}`);
    assert.equal(run.palindrome.length - s.length, run.answer);
    assert.equal(run.insertionOps.length, run.answer);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test("1312 snapshots expose every executed solution line and interval dependency", () => {
  const run = problem.builder("mbadm");
  const lines = new Set(run.steps.flatMap(step => step.codeLines));
  for (let line = 3; line <= 11; line += 1) assert.ok(lines.has(line), `line ${line} is never visualized`);

  const equal = run.steps.find(step => step.palindrome1312View.phase === "match");
  const mismatch = run.steps.find(step => step.palindrome1312View.phase === "choose");
  const updated = run.steps.find(step => step.palindrome1312View.phase === "update");
  assert.deepEqual(equal.codeLines, [8]);
  assert.deepEqual(mismatch.codeLines, [9]);
  assert.deepEqual(updated.codeLines, [10]);
  assert.equal(mismatch.palindrome1312View.same, false);
  assert.notEqual(mismatch.palindrome1312View.leftOption, null);
  assert.notEqual(mismatch.palindrome1312View.rightOption, null);
  assert.equal(updated.grid.dp[updated.palindrome1312View.i + 1][updated.palindrome1312View.j + 1], 1 + Math.min(
    updated.palindrome1312View.leftOption,
    updated.palindrome1312View.rightOption,
  ));
});

test("1312 visualization draws endpoint choices, DP cells, and inserted palindrome tiles", () => {
  const run = problem.builder("mbadm");
  for (const language of ["en", "vi"]) {
    const { host, visualizer } = createRenderer(language);
    for (const step of run.steps) {
      visualizer.render(step);
      assert.match(host.innerHTML, /mi1312-viz/);
      assert.match(host.innerHTML, /mi1312-table/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|object Object/);
    }
    const final = run.steps.at(-1);
    visualizer.render(final);
    assert.equal((host.innerHTML.match(/class="inserted"/g) || []).length, run.answer);
    assert.match(host.innerHTML, new RegExp(`<output>${run.answer}<\\/output>`));
    visualizer.render(run.steps.find(step => step.palindrome1312View.phase === "choose"));
    assert.match(host.innerHTML, /mi1312-choices/);
    assert.equal((host.innerHTML.match(/<div class="/g) || []).length > 0, true);
  }
});

test("1312 renderer assets are lazy-loaded and connected to the step registry", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  assert.match(html, /renderer-min-insertions-palindrome-1312\.js/);
  assert.match(html, /min-insertions-palindrome-1312\.css/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /renderer-min-insertions-palindrome-1312\.(?:js|css)/);
  assert.match(script, /Boolean\(step\.palindrome1312View\)/);
});
