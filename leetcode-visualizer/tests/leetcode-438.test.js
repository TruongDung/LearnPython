const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[438];
const bruteForce = (s, p) => {
  const expected = [...p].sort().join("");
  return Array.from({ length: Math.max(0, s.length - p.length + 1) }, (_, start) => start)
    .filter((start) => [...s.slice(start, start + p.length)].sort().join("") === expected);
};

test("438 uses the fixed 26-letter counter and returns every anagram start", () => {
  for (const [s, p, expected] of [
    ["cbaebabacd", "abc", [0, 6]],
    ["abab", "ab", [0, 1, 2]],
    ["baa", "aa", [1]],
    ["aaaaaaaa", "aaa", [0, 1, 2, 3, 4, 5]],
    ["abcdef", "z", []],
    ["", "a", []],
  ]) {
    assert.deepEqual(problem.builder(s, { p }).answer, expected);
    assert.deepEqual(problem.liveArgs(s, { p }), [s, p]);
  }

  for (let length = 0; length <= 6; length++) {
    for (let value = 0; value < 3 ** length; value++) {
      let s = "";
      let digits = value;
      for (let index = 0; index < length; index++) {
        s += "abc"[digits % 3];
        digits = Math.floor(digits / 3);
      }
      for (const p of ["a", "ab", "aa", "abc", "aab", "abcd"]) {
        assert.deepEqual(problem.builder(s, { p }).answer, bruteForce(s, p), `${s} / ${p}`);
      }
    }
  }
});

test("438 snapshots follow valid Python source lines and keep matches accurate", () => {
  const result = problem.builder("cbaebabacd", { p: "abc" });
  assert.equal(problem.debugMode, "line-by-line");
  assert.equal(result.steps.at(-1).final, true);
  assert.ok(result.steps.some((step) => step.codeLines.includes(21)));
  assert.ok(result.steps.some((step) => step.codeLines.includes(29)));
  assert.ok(result.steps.some((step) => step.codeLines.includes(37)));
  for (const step of result.steps) {
    const view = step.anagram438View;
    assert.ok(step.codeLines.length);
    assert.ok(step.codeLines.every((line) => line >= 1 && line <= problem.code.length));
    if (!["window-count", "compare", "check-over", "remove-match", "outgoing-index", "compare-remove", "lose-match", "check-remove-over", "restore-match"].includes(view.event)) {
      const expectedMatches = Object.keys(view.need)
        .filter((letter) => view.need[letter] > 0 && view.need[letter] === view.window[letter]).length;
      assert.equal(view.matches, expectedMatches);
    }
  }
  assert.ok(result.steps.some((step) => step.anagram438View.event === "restore-match"));
  assert.ok(result.steps.some((step) => step.anagram438View.event === "lose-match"));
  assert.deepEqual(problem.code, [
    "class Solution:",
    "    def findAnagrams(self, s: str, p: str) -> list[int]:",
    "        if len(p) > len(s):",
    "            return []",
    "",
    "        need = [0] * 26",
    "        window = [0] * 26",
    "",
    "        for ch in p:",
    "            need[ord(ch) - ord('a')] += 1",
    "",
    "        left = 0",
    "        ans = []",
    "        matches = 0",
    "        required = sum(1 for x in need if x > 0)",
    "",
    "        for right, ch in enumerate(s):",
    "            idx = ord(ch) - ord('a')",
    "            window[idx] += 1",
    "",
    "            if need[idx] > 0 and window[idx] == need[idx]:",
    "                matches += 1",
    "            elif need[idx] > 0 and window[idx] == need[idx] + 1:",
    "                matches -= 1",
    "",
    "            if right - left + 1 > len(p):",
    "                idx = ord(s[left]) - ord('a')",
    "",
    "                if need[idx] > 0 and window[idx] == need[idx]:",
    "                    matches -= 1",
    "                elif need[idx] > 0 and window[idx] == need[idx] + 1:",
    "                    matches += 1",
    "",
    "                window[idx] -= 1",
    "                left += 1",
    "",
    "            if right - left + 1 == len(p) and matches == required:",
    "                ans.append(left)",
    "",
    "        return ans",
  ]);
});

test("438 renderer and UI assets are registered and work in both languages", () => {
  const element = {
    innerHTML: "",
    querySelector: () => ({ clientWidth: 100, scrollLeft: 0, querySelector: () => null }),
  };
  const context = {
    lang: "en",
    $: () => element,
    escapeHtml: (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-find-anagrams-438.js"), "utf8"), context);

  for (const language of ["en", "vi"]) {
    context.lang = language;
    for (const step of problem.builder("cbaebabacd", { p: "abc" }).steps) {
      context.renderFindAnagrams438View(step);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|object Object/);
      assert.equal((element.innerHTML.match(/class="ana438-cell(?: |")/g) || []).length, 10);
      assert.equal(
        (element.innerHTML.match(/class="ana438-counter(?: |")/g) || []).length,
        Object.keys(step.anagram438View.need).length,
      );
    }
  }

  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  assert.ok(html.includes('find-anagrams-438.css?v=find-anagrams-438-v2" data-problem-ids="438"'));
  assert.ok(html.includes('renderer-find-anagrams-438.js?v=find-anagrams-438-v3" data-problem-ids="438"'));
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  assert.ok(script.includes("renderFindAnagrams438View(step)"));
});

test("438 rejects unsupported characters and oversized visualization input", () => {
  for (const [s, p] of [["ABC", "A"], ["a b", "a"], ["a".repeat(101), "a"], ["abc", ""], ["abc", "A"], ["abc", "a".repeat(101)]]) {
    assert.throws(() => problem.builder(s, { p }), /438/);
  }
});
