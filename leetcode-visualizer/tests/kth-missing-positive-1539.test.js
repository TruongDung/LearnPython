"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { SUPPORTED, CATEGORY_ORDER } = require("../problems");

const problem = SUPPORTED[1539];
const requestedCode = [
  "class Solution:",
  "    def findKthPositive(self, arr: list[int], k: int) -> int:",
  "        left, right = 0, len(arr)",
  "",
  "        while left < right:",
  "            mid = (left + right) // 2",
  "",
  "            missing = arr[mid] - (mid + 1)",
  "",
  "            if missing < k:",
  "                left = mid + 1",
  "            else:",
  "                right = mid",
  "",
  "        return left + k",
];

function oracle(arr, k) {
  const present = new Set(arr);
  let found = 0;
  for (let value = 1; ; value += 1) {
    if (!present.has(value)) found += 1;
    if (found === k) return value;
  }
}

test("1539 is registered with the exact requested code snippet", () => {
  assert.ok(problem);
  assert.equal(problem.slug, "kth-missing-positive-number");
  assert.deepEqual(problem.code, requestedCode);
  assert.ok(CATEGORY_ORDER["binary-search"].order.includes(1539));
  assert.equal(problem.complexity.time, "O(log n)");
  assert.equal(problem.complexity.space, "O(1)");
});

test("1539 matches examples, edge cases, and an independent oracle", () => {
  const cases = [
    [[2, 3, 4, 7, 11], 5, 9],
    [[1, 2, 3, 4], 2, 6],
    [[5, 6, 7], 1, 1],
    [[1], 100, 101],
    [[2], 1, 1],
  ];
  for (const [arr, k, answer] of cases) assert.equal(problem.builder(arr, { k }).answer, answer);

  let seed = 1539;
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  for (let trial = 0; trial < 150; trial += 1) {
    const length = 1 + random() % 12;
    const values = new Set();
    while (values.size < length) values.add(1 + random() % 45);
    const arr = [...values].sort((a, b) => a - b);
    const k = 1 + random() % 30;
    assert.equal(problem.builder(arr, { k }).answer, oracle(arr, k));
  }
});

test("1539 trace preserves the missing-count invariant and shrinks the half-open range", () => {
  const run = problem.builder([2, 3, 4, 7, 11], { k: 5 });
  const countSteps = run.steps.filter((step) => step.kthMissing1539View.action === "count-holes");
  assert.ok(countSteps.length > 0);
  for (const step of run.steps) {
    const view = step.kthMissing1539View;
    assert.equal(view.source.text, problem.code[view.source.line - 1]);
    assert.ok(view.search.left <= view.search.right);
    if (view.search.mid !== null && view.search.missing !== null) {
      assert.equal(view.search.missing, view.input.arr[view.search.mid] - (view.search.mid + 1));
    }
  }
  for (const step of countSteps) {
    const view = step.kthMissing1539View;
    assert.equal(view.search.missing, view.input.arr[view.search.mid] - view.search.mid - 1);
  }
  const final = run.steps.at(-1).kthMissing1539View;
  assert.equal(final.answer, final.insertionIndex + 5);
  assert.equal(final.answer, 9);
});

test("1539 renderer uses holes, a number rail, and a visual mid marker in both languages", () => {
  const source = fs.readFileSync(require.resolve("../public/renderer-kth-missing-positive-1539.js"), "utf8");
  for (const language of ["vi", "en"]) {
    const host = { innerHTML: "" };
    const context = { lang: language, document: { getElementById: (id) => id === "treeView" ? host : null } };
    vm.createContext(context);
    vm.runInContext(source, context);
    const run = problem.builder([2, 3, 4, 7, 11], { k: 5 });
    for (const step of run.steps) {
      context.renderKthMissing1539View(JSON.parse(JSON.stringify(step)));
      assert.match(host.innerHTML, /km1539-indices/);
      assert.match(host.innerHTML, /km1539-line/);
      assert.match(host.innerHTML, /km1539-slot/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
      assert.doesNotMatch(host.innerHTML, /<table|event-rail|invariant-list|counter-grid/);
    }
  }
});

test("1539 final picture marks the fifth missing number as 9", () => {
  const host = { innerHTML: "" };
  const context = { lang: "vi", document: { getElementById: () => host } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-kth-missing-positive-1539.js"), "utf8"), context);
  const final = problem.builder([2, 3, 4, 7, 11], { k: 5 }).steps.at(-1);
  context.renderKthMissing1539View(final);
  assert.match(host.innerHTML, /Ô trống #5 = 9/);
  assert.match(host.innerHTML, /class="km1539-slot missing target/);
  assert.match(host.innerHTML, /data-number="9"/);
  assert.match(host.innerHTML, /<strong>9<\/strong>/);
});

test("1539 validates sorted positive input and returns typed live arguments", () => {
  for (const arr of [[], [0], [-1], [1.5], [2, 2], [3, 2], [10001], Array(25).fill(1)]) {
    assert.throws(() => problem.builder(arr, { k: 1 }), /1539: arr/);
  }
  for (const k of [0, -1, 1.5, true, null, "", "2.5", 10001]) {
    assert.throws(() => problem.builder([1, 2, 3], { k }), /1539: k/);
  }
  assert.deepEqual(problem.liveArgs([2, 3, 4, 7, 11], { k: "5" }), [[2, 3, 4, 7, 11], 5]);
});

test("1539 assets are lazy and its dedicated renderer is routed", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const activeHtml = html.replace(/<template[\s\S]*?<\/template>/g, "");
  assert.match(html, /kth-missing-positive-1539\.css/);
  assert.match(html, /renderer-kth-missing-positive-1539\.js/);
  assert.doesNotMatch(activeHtml, /kth-missing-positive-1539\.(?:css|js)/);
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  assert.match(script, /step\.kthMissing1539View/);
});
