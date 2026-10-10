"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const vm = require("node:vm");
const { SUPPORTED, COMPANY_SUBTABS } = require("../problems");
const { prepareGenericLiveArgs } = require("../live-args");
const { readFrontendIndex, readFrontendJavaScript, readFrontendStyles } = require("./helpers/frontend-source");

const problem = SUPPORTED[1915];

function brute(word) {
  let answer = 0;
  for (let left = 0; left < word.length; left += 1) {
    const counts = Array(10).fill(0);
    for (let right = left; right < word.length; right += 1) {
      counts[word.charCodeAt(right) - 97] += 1;
      if (counts.filter((count) => count % 2 === 1).length <= 1) answer += 1;
    }
  }
  return answer;
}

test("1915 is registered as a Google prefix-XOR interview lesson", () => {
  assert.equal(problem.id, 1915);
  assert.equal(problem.slug, "number-of-wonderful-substrings");
  assert.equal(problem.difficulty, "medium");
  assert.equal(problem.category.key, "bitmask");
  assert.deepEqual(problem.tags.map((tag) => tag.key), ["string", "prefix-xor", "frequency-counter", "bitmask"]);
  assert.ok(problem.companies.includes("google"));
  const google = COMPANY_SUBTABS.find((company) => company.key === "google");
  assert.equal(google.roster.find((entry) => entry.id === 1915).available, true);
  assert.equal(problem.complexity.time, "O(10n) = O(n)");
  assert.equal(problem.complexity.space, "O(2^10) = O(1)");
  assert.match(problem.code.join("\n"), /frequency = \[0\] \* \(1 << 10\)/);
  assert.match(problem.code.join("\n"), /answer \+= frequency\[mask \^ \(1 << bit\)\]/);
});

test("1915 matches examples and executes the displayed Python", () => {
  for (const [word, expected] of [["aba", 4], ["aabb", 9], ["he", 2], ["j", 1]]) {
    assert.equal(problem.builder(word).answer, expected);
    const harness = `\nassert Solution().wonderfulSubstrings(${JSON.stringify(word)}) == ${expected}\n`;
    const executed = spawnSync(process.env.PYTHON || "python3", ["-c", `${problem.code.join("\n")}${harness}`], { encoding: "utf8" });
    assert.equal(executed.status, 0, executed.stderr);
  }
});

test("1915 agrees with an independent O(n^2) oracle", () => {
  let seed = 1915;
  const random = (max) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };
  for (let trial = 0; trial < 150; trial += 1) {
    const word = Array.from({ length: 1 + random(14) }, () => String.fromCharCode(97 + random(10))).join("");
    assert.equal(problem.builder(word).answer, brute(word), word);
  }
});

test("1915 trace proves the query-before-insert invariant", () => {
  const run = problem.builder("aba");
  assert.equal(run.answer, 4);
  assert.ok(run.steps.every((step) => step.codeLines.length === 1 && step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  assert.ok(run.steps.every((step) => step.wonderful1915View?.problemId === 1915));
  const events = new Set(run.steps.map((step) => step.wonderful1915View.event));
  for (const event of ["init-counter", "start-char", "flip-bit", "exact-lookup", "one-bit-lookup", "store-prefix", "done"]) {
    assert.ok(events.has(event), `missing ${event}`);
  }
  assert.equal(run.steps.filter((step) => step.wonderful1915View.event === "one-bit-lookup").length, 30);
  const firstLookup = run.steps.find((step) => step.wonderful1915View.event === "exact-lookup").wonderful1915View;
  assert.equal(firstLookup.frequencyEntries.reduce((total, bucket) => total + bucket.count, 0), 1);
  const stores = run.steps.filter((step) => step.wonderful1915View.event === "store-prefix");
  stores.forEach((step, index) => {
    const view = step.wonderful1915View;
    assert.equal(view.frequencyEntries.reduce((total, bucket) => total + bucket.count, 0), index + 2);
    assert.equal(view.answer - view.answerBefore, view.exactContribution + view.oneBitContribution);
    assert.equal(view.probes.reduce((total, probe) => total + probe.count, 0), view.exactContribution + view.oneBitContribution);
  });
  assert.equal(run.steps.at(-1).wonderful1915View.answer, 4);
  assert.equal(run.steps.at(-1).final, true);
});

test("1915 validates input and prepares live arguments", () => {
  assert.throws(() => problem.builder(""), /1\.\.24/);
  assert.throws(() => problem.builder("ak"), /only a\.\.j/);
  assert.throws(() => problem.builder("A"), /only a\.\.j/);
  assert.throws(() => problem.builder("a".repeat(25)), /1\.\.24/);
  assert.deepEqual(prepareGenericLiveArgs(problem, "aba", {}), ["aba"]);
});

test("1915 custom renderer is wired, bilingual, and complete", () => {
  const index = readFrontendIndex();
  const styles = readFrontendStyles();
  const script = readFrontendJavaScript();
  assert.match(index, /renderer-wonderful-substrings-1915\.js/);
  assert.match(index, /wonderful-substrings-1915\.css/);
  assert.match(styles, /\.ws1915-probes/);
  assert.match(script, /wonderful1915View/);

  const start = script.indexOf("const WS1915_COPY");
  const end = script.indexOf("\n\"use strict\";", start + 20);
  const renderer = end > start ? script.slice(start, end) : script.slice(start);
  const elements = new Map();
  const elementFor = (id) => {
    if (!elements.has(id)) elements.set(id, { innerHTML: "" });
    return elements.get(id);
  };
  const context = { lang: "en", $: elementFor };
  vm.createContext(context);
  vm.runInContext(renderer, context);
  const run = problem.builder("aba");
  for (const language of ["en", "vi"]) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderWonderful1915View(step);
      const html = elementFor("treeView").innerHTML;
      assert.match(html, /ws1915-viz/);
      assert.match(html, /ws1915-probes/);
      assert.match(html, /ws1915-counter/);
      assert.doesNotMatch(html, /NaN|undefined|Infinity/);
    }
  }
  context.lang = "en";
  context.renderWonderful1915View(run.steps.find((step) => step.wonderful1915View.event === "one-bit-lookup" && step.wonderful1915View.probes.some((probe) => probe.active && probe.count)));
  assert.match(elementFor("treeView").innerHTML, /hit ×1/);
});

test("standalone 1915 solution stays identical to the visualized source", () => {
  const file = path.resolve(__dirname, "../../Leetcode-sln/string/Leetcode_1915.py");
  assert.equal(fs.readFileSync(file, "utf8").trimEnd(), problem.code.join("\n"));
});
