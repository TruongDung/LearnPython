const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const problem = require("../problems").SUPPORTED[151];

const oracle = (s) => s.trim().split(/ +/).reverse().join(" ");

test("151 is registered and reverses words while normalizing spaces", () => {
  assert.equal(problem.id, 151);
  assert.equal(problem.slug, "reverse-words-in-a-string");
  assert.equal(problem.debugMode, "line-by-line");
  const examples = [
    ["the sky is blue", "blue is sky the"],
    ["  hello world  ", "world hello"],
    ["a good   example", "example good a"],
    ["single", "single"],
    ["  <one>   two & three!  ", "three! & two <one>"],
  ];
  for (const [input, answer] of examples) {
    const result = problem.builder(input);
    assert.equal(result.answer, answer);
    assert.equal(result.answer, oracle(input));
    assert.deepEqual(problem.liveArgs(input), [input]);
    assert.equal(result.steps.at(-1).final, true);
    assert.equal(result.steps.at(-1).reverseWords151View.output, answer);
  }
});

test("151 trace swaps mirrored word pairs and follows displayed code lines", () => {
  const result = problem.builder("  one  two three   four ");
  const swaps = result.steps.filter((step) => step.reverseWords151View.phase === "swap");
  assert.deepEqual(swaps.map((step) => [step.reverseWords151View.swap.left, step.reverseWords151View.swap.right]), [[0, 3], [1, 2]]);
  assert.deepEqual(swaps.map((step) => step.reverseWords151View.words), [["four", "two", "three", "one"], ["four", "three", "two", "one"]]);
  assert.deepEqual(swaps.map((step) => step.codeLines), [[6], [6]]);
  assert.deepEqual(result.steps.map((step) => step.reverseWords151View.swaps).filter((count, index, all) => index === 0 || count !== all[index - 1]), [0, 1, 2]);
  assert.deepEqual(result.steps.at(-1).codeLines, [9]);
});

test("151 rejects empty, whitespace-only, nonprintable and oversized inputs", () => {
  for (const input of ["", "   ", "a".repeat(121), "a\nb", "a\tb", "café", null]) {
    assert.throws(() => problem.builder(input), /151/);
  }
});

test("151 displayed Python matches the repository solution", () => {
  const repository = fs.readFileSync(require.resolve("../../Leetcode-sln/string/Leetcode_151.py"), "utf8").trimEnd();
  assert.equal(repository, problem.code.join("\n"));
});

test("151 renderer safely renders every state in Vietnamese and English", () => {
  const element = { innerHTML: "" };
  const escapeHtml = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  const context = { lang: "en", $: () => element, escapeHtml, pick: (value) => value[context.lang] };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-reverse-words-151.js"), "utf8"), context);
  for (const language of ["vi", "en"]) {
    context.lang = language;
    for (const step of problem.builder("  <one>   two & three!  ").steps) {
      context.renderReverseWords151View(step);
      assert.match(element.innerHTML, /rw151-viz/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|<one>|<script/i);
    }
    assert.match(element.innerHTML, /complete/);
    assert.match(element.innerHTML, /three!/);
  }
});
