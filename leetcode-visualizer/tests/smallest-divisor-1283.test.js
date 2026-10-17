"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { SUPPORTED, CATEGORY_ORDER } = require("../problems");

const problem = SUPPORTED[1283];
const view = (step) => step.smallestDivisor1283View;

function totalAt(nums, divisor) {
  return nums.reduce((sum, num) => sum + Math.ceil(num / divisor), 0);
}

function oracle(nums, threshold) {
  for (let divisor = 1; divisor <= Math.max(...nums); divisor += 1) {
    if (totalAt(nums, divisor) <= threshold) return divisor;
  }
  throw new Error("unreachable");
}

function render(step, language = "vi") {
  const host = { innerHTML: "" };
  const context = { lang: language, document: { getElementById: (id) => id === "treeView" ? host : null } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-smallest-divisor-1283.js"), "utf8"), context);
  context.renderSmallestDivisor1283View(JSON.parse(JSON.stringify(step)));
  return host.innerHTML;
}

test("1283 is registered as an interview-ready binary-search-on-answer problem", () => {
  assert.ok(problem);
  assert.equal(problem.slug, "find-the-smallest-divisor-given-a-threshold");
  assert.equal(problem.debugMode, "line-by-line");
  assert.equal(problem.complexity.time, "O(n log M)");
  assert.equal(problem.complexity.space, "O(1)");
  assert.ok(problem.tags.some((tag) => tag.key === "binary-search-on-answer"));
  assert.ok(CATEGORY_ORDER["binary-search"].order.includes(1283));
});

test("1283 matches official examples, edge cases, and an independent oracle", () => {
  const cases = [
    [[1, 2, 5, 9], 6, 5],
    [[44, 22, 33, 11, 1], 5, 44],
    [[21212, 10101, 12121], 1000000, 1],
    [[1], 1, 1],
    [[2, 3], 3, 2],
  ];
  for (const [nums, threshold, answer] of cases) {
    assert.equal(problem.builder(nums, { threshold }).answer, answer);
  }

  let seed = 1283;
  const random = () => seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  for (let sample = 0; sample < 160; sample += 1) {
    const length = 1 + random() % 10;
    const nums = Array.from({ length }, () => 1 + random() % 80);
    const threshold = length + random() % 100;
    assert.equal(problem.builder(nums, { threshold }).answer, oracle(nums, threshold));
  }
});

test("1283 displayed Python runs and agrees with the JavaScript builder", () => {
  const cases = [
    [[1, 2, 5, 9], 6],
    [[44, 22, 33, 11, 1], 5],
    [[21212, 10101, 12121], 1000000],
    [[7, 13, 19], 7],
  ];
  const program = `${problem.code.join("\n")}\nimport json,sys\nprint(json.dumps([Solution().smallestDivisor(nums, threshold) for nums, threshold in json.load(sys.stdin)]))`;
  const run = spawnSync("python3", ["-c", program], { input: JSON.stringify(cases), encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(JSON.parse(run.stdout), cases.map(([nums, threshold]) => oracle(nums, threshold)));
});

test("1283 trace preserves ceiling sums, first-true bounds, and source lines", () => {
  const run = problem.builder([1, 2, 5, 9], { threshold: 6 });
  assert.equal(run.answer, 5);
  assert.ok(run.steps.some((step) => view(step).action === "add-ceiling"));
  assert.ok(run.steps.some((step) => view(step).action === "feasible"));
  assert.ok(run.steps.some((step) => view(step).action === "too-small"));
  for (const step of run.steps) {
    const current = view(step);
    assert.deepEqual(step.codeLines, [current.source.line]);
    assert.equal(current.source.text, problem.code[current.source.line - 1]);
    assert.ok(current.search.left >= 1);
    assert.ok(current.search.left <= current.search.right);
    assert.ok(current.search.right <= Math.max(...current.input.nums));
    assert.equal(current.scan.total, current.scan.total === null ? null : current.scan.quotients.reduce((sum, value) => sum + value, 0));
  }
  const final = view(run.steps.at(-1));
  assert.equal(final.answer, 5);
  assert.ok(final.scan.total <= final.input.threshold);
  assert.ok(final.previousTotal > final.input.threshold);
});

test("1283 picture-first renderer shows range, rounded groups, sum, and minimality proof", () => {
  const run = problem.builder([1, 2, 5, 9], { threshold: 6 });
  const samples = [
    run.steps.find((step) => view(step).action === "choose-mid"),
    run.steps.find((step) => view(step).action === "add-ceiling"),
    run.steps.find((step) => view(step).action === "feasible"),
    run.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    for (const step of samples) {
      const html = render(step, language);
      assert.match(html, /sd1283-viz/);
      assert.match(html, /sd1283-range/);
      assert.match(html, /sd1283-machine/);
      assert.match(html, /sd1283-total/);
      assert.doesNotMatch(html, /undefined|NaN|Infinity/);
      assert.doesNotMatch(html, /<table|long explanation|invariant-list/);
    }
  }
  const final = render(run.steps.at(-1), "vi");
  assert.match(final, /sd1283-proof/);
  assert.match(final, /d = 4/);
  assert.match(final, /d = 5/);
  assert.match(final, /Ước số nhỏ nhất = 5/);
});

test("1283 validates input and returns typed live arguments", () => {
  for (const nums of [[], [0], [-1], [1.5], [1000001], Array(61).fill(1)]) {
    assert.throws(() => problem.builder(nums, { threshold: 100 }), /1283: nums/);
  }
  for (const threshold of [0, 2, 2.5, true, null, "", "3.5", 1000001]) {
    assert.throws(() => problem.builder([1, 2, 3], { threshold }), /1283: threshold/);
  }
  assert.deepEqual(problem.liveArgs([1, 2, 5, 9], { threshold: "6" }), [[1, 2, 5, 9], 6]);
});

test("1283 responsive light/dark assets are lazy and routed before generic renderers", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/smallest-divisor-1283.css"), "utf8");
  const activeHtml = html.replace(/<template[\s\S]*?<\/template>/g, "");
  assert.match(html, /smallest-divisor-1283\.css\?v=smallest-divisor-1283-v1/);
  assert.match(html, /renderer-smallest-divisor-1283\.js\?v=smallest-divisor-1283-v1/);
  assert.match(html, /smallestDivisor=1283-v1/);
  assert.doesNotMatch(activeHtml, /(?:renderer-)?smallest-divisor-1283\.(?:js|css)/);
  assert.ok(script.indexOf("step.smallestDivisor1283View") < script.indexOf("step.bfsGrid"));
  assert.match(css, /\[data-theme="light"\] \.sd1283-viz/);
  assert.match(css, /@container sd1283 \(max-width: 430px\)/);
});
