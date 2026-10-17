"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { SUPPORTED, CATEGORY_ORDER } = require("../problems");

const problem = SUPPORTED[1482];
const view = (step) => step.bouquets1482View;

function countBouquets(bloomDay, day, k) {
  let bouquets = 0;
  let consecutive = 0;
  for (const bloom of bloomDay) {
    if (bloom <= day) {
      consecutive += 1;
      if (consecutive === k) {
        bouquets += 1;
        consecutive = 0;
      }
    } else {
      consecutive = 0;
    }
  }
  return bouquets;
}

function oracle(bloomDay, m, k) {
  if (m * k > bloomDay.length) return -1;
  for (const day of [...new Set(bloomDay)].sort((a, b) => a - b)) {
    if (countBouquets(bloomDay, day, k) >= m) return day;
  }
  throw new Error("unreachable");
}

function render(step, language = "vi") {
  const host = { innerHTML: "" };
  const context = { lang: language, document: { getElementById: (id) => id === "treeView" ? host : null } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-min-days-bouquets-1482.js"), "utf8"), context);
  context.renderMinDaysBouquets1482View(JSON.parse(JSON.stringify(step)));
  return host.innerHTML;
}

test("1482 is registered as a Google-style binary-search-on-answer lesson", () => {
  assert.ok(problem);
  assert.equal(problem.slug, "minimum-number-of-days-to-make-m-bouquets");
  assert.equal(problem.debugMode, "line-by-line");
  assert.equal(problem.complexity.time, "O(n log D)");
  assert.equal(problem.complexity.space, "O(1)");
  assert.ok(problem.tags.some((tag) => tag.key === "binary-search-on-answer"));
  assert.ok(problem.companies.includes("google"));
  assert.ok(CATEGORY_ORDER["binary-search"].order.includes(1482));
});

test("1482 matches official examples, edge cases, and an independent oracle", () => {
  const cases = [
    [[1, 10, 3, 10, 2], 3, 1, 3],
    [[1, 10, 3, 10, 2], 3, 2, -1],
    [[7, 7, 7, 7, 12, 7, 7], 2, 3, 12],
    [[1000000000, 1000000000], 1, 1, 1000000000],
    [[1, 1, 1], 1, 2, 1],
  ];
  for (const [bloomDay, m, k, answer] of cases) {
    assert.equal(problem.builder(bloomDay, { m, k }).answer, answer);
  }

  let seed = 1482;
  const random = () => seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  for (let sample = 0; sample < 180; sample += 1) {
    const length = 1 + random() % 12;
    const bloomDay = Array.from({ length }, () => 1 + random() % 40);
    const m = 1 + random() % 8;
    const k = 1 + random() % 6;
    assert.equal(problem.builder(bloomDay, { m, k }).answer, oracle(bloomDay, m, k));
  }
});

test("1482 displayed Python runs and agrees with the JavaScript builder", () => {
  const cases = [
    [[1, 10, 3, 10, 2], 3, 1],
    [[1, 10, 3, 10, 2], 3, 2],
    [[7, 7, 7, 7, 12, 7, 7], 2, 3],
    [[1, 10, 3, 10, 2, 4, 8, 6], 2, 2],
  ];
  const program = `${problem.code.join("\n")}\nimport json,sys\nprint(json.dumps([Solution().minDays(days, m, k) for days, m, k in json.load(sys.stdin)]))`;
  const run = spawnSync("python3", ["-c", program], { input: JSON.stringify(cases), encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(JSON.parse(run.stdout), cases.map(([days, m, k]) => oracle(days, m, k)));
});

test("1482 trace preserves contiguous bouquets, first-true bounds, and source lines", () => {
  const run = problem.builder([1, 10, 3, 10, 2, 4, 8, 6], { m: 2, k: 2 });
  assert.equal(run.answer, 8);
  assert.ok(run.steps.some((step) => view(step).action === "make-bouquet"));
  assert.ok(run.steps.some((step) => view(step).action === "barrier"));
  assert.ok(run.steps.some((step) => view(step).action === "enough"));
  assert.ok(run.steps.some((step) => view(step).action === "not-enough"));
  for (const step of run.steps) {
    const current = view(step);
    assert.deepEqual(step.codeLines, [current.source.line]);
    assert.equal(current.source.text, problem.code[current.source.line - 1]);
    assert.ok(current.search.left <= current.search.right);
    assert.ok(current.search.left >= current.search.initialLeft);
    assert.ok(current.search.right <= current.search.initialRight);
    assert.equal(current.scan.bouquets, current.scan.groups.length);
    for (const group of current.scan.groups) {
      assert.equal(group.length, current.input.k);
      assert.deepEqual(group, Array.from({ length: current.input.k }, (_, offset) => group[0] + offset));
      assert.ok(group.every((index) => current.input.bloomDay[index] <= current.search.day));
    }
  }
  const final = view(run.steps.at(-1));
  assert.equal(final.answer, 8);
  assert.ok(final.previousBouquets < final.input.m);
  assert.ok(final.scan.bouquets >= final.input.m);
});

test("1482 picture-first renderer shows day range, flowers, bouquets, and minimality proof", () => {
  const run = problem.builder([1, 10, 3, 10, 2, 4, 8, 6], { m: 2, k: 2 });
  const samples = [
    run.steps.find((step) => view(step).action === "choose-mid"),
    run.steps.find((step) => view(step).action === "grow-streak"),
    run.steps.find((step) => view(step).action === "make-bouquet"),
    run.steps.find((step) => view(step).action === "barrier"),
    run.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    for (const step of samples) {
      const html = render(step, language);
      assert.match(html, /bq1482-viz/);
      assert.match(html, /bq1482-range/);
      assert.match(html, /bq1482-garden/);
      assert.match(html, /bq1482-meter/);
      assert.doesNotMatch(html, /undefined|NaN|Infinity/);
      assert.doesNotMatch(html, /<table|long explanation|invariant-list/);
    }
  }
  const final = render(run.steps.at(-1), "vi");
  assert.match(final, /bq1482-proof/);
  assert.match(final, /ngày 7/);
  assert.match(final, /ngày 8/);
  assert.match(final, /Sớm nhất: ngày 8/);

  const impossibleRun = problem.builder([1, 2, 3], { m: 2, k: 2 });
  const impossible = render(impossibleRun.steps.at(-1), "vi");
  assert.match(impossible, /is-impossible/);
  assert.match(impossible, /−1/);
});

test("1482 validates input and returns typed live arguments", () => {
  for (const days of [[], [0], [-1], [1.5], [1000000001], Array(61).fill(1)]) {
    assert.throws(() => problem.builder(days, { m: 1, k: 1 }), /1482: bloomDay/);
  }
  for (const key of ["m", "k"]) {
    for (const value of [0, -1, 1.5, true, null, "", "2.5", 1000001]) {
      assert.throws(() => problem.builder([1, 2, 3], { m: 1, k: 1, [key]: value }), new RegExp(`1482: ${key}`));
    }
  }
  assert.deepEqual(problem.liveArgs([1, 10, 3], { m: "2", k: "1" }), [[1, 10, 3], 2, 1]);
});

test("1482 responsive light/dark assets are lazy and routed before generic renderers", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/min-days-bouquets-1482.css"), "utf8");
  const activeHtml = html.replace(/<template[\s\S]*?<\/template>/g, "");
  assert.match(html, /min-days-bouquets-1482\.css\?v=min-days-bouquets-1482-v2/);
  assert.match(html, /renderer-min-days-bouquets-1482\.js\?v=min-days-bouquets-1482-v2/);
  assert.match(html, /bouquets=1482-v2/);
  assert.doesNotMatch(activeHtml, /(?:renderer-)?min-days-bouquets-1482\.(?:js|css)/);
  assert.ok(script.indexOf("step.bouquets1482View") < script.indexOf("step.bfsGrid"));
  assert.match(css, /\[data-theme="light"\] \.bq1482-viz/);
  assert.match(css, /@container bq1482 \(max-width: 430px\)/);
});
