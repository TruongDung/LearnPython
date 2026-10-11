"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[9022];

const view = (step) => step.underpaidManagers9022View;

test("9022 evaluates each manager against all direct and indirect reports", () => {
  const run = problem.builder(problem.defaultInput);
  assert.equal(run.answer, 2);
  assert.equal(run.totalSalary, 500);
  assert.equal(run.totalEmployees, 4);
  assert.deepEqual(run.steps.at(-1).underpaidManagers9022View.unpaid, ["C", "A"]);

  const indirectOnly = problem.builder({
    root: "A",
    employees: [
      { name: "A", salary: 100, reports: ["B", "C"] },
      { name: "B", salary: 80, reports: [] },
      { name: "C", salary: 100, reports: ["D"] },
      { name: "D", salary: 200, reports: [] },
    ],
  });
  assert.equal(indirectOnly.answer, 2);
  const rootAverage = view(indirectOnly.steps.find((step) => view(step).event === "average" && step.title.en.startsWith("Report average = 380")));
  assert.ok(rootAverage);
  assert.equal(rootAverage.aggregates.find((row) => row.name === "A").descendantSalary, 380);
  assert.equal(rootAverage.aggregates.find((row) => row.name === "A").descendantCount, 3);
});

test("9022 uses strict comparison and skips employees without reports", () => {
  const equal = problem.builder({
    root: "A",
    employees: [
      { name: "A", salary: 100, reports: ["B", "C"] },
      { name: "B", salary: 100, reports: [] },
      { name: "C", salary: 100, reports: [] },
    ],
  });
  assert.equal(equal.answer, 0);
  assert.equal(view(equal.steps.find((step) => view(step).event === "fair")).aggregates[0].decision, "not-underpaid");

  const noReports = problem.builder({
    root: "solo",
    employees: [{ name: "solo", salary: 100, reports: [] }],
  });
  assert.equal(noReports.answer, 0);
  assert.ok(noReports.steps.some((step) => view(step).event === "no-reports"));
});

test("9022 validates the reporting tree, records and salary bounds", () => {
  const valid = JSON.parse(problem.defaultInput);
  for (const employees of [
    [],
    [{ name: "A", salary: 1, reports: ["missing"] }],
    [
      { name: "A", salary: 1, reports: ["B", "C"] },
      { name: "B", salary: 1, reports: [] },
      { name: "C", salary: 1, reports: ["B"] },
    ],
    [
      { name: "A", salary: 1, reports: ["B"] },
      { name: "B", salary: 1, reports: ["A"] },
    ],
  ]) {
    assert.throws(() => problem.builder({ root: "A", employees }), /9022:/);
  }
  assert.throws(() => problem.builder("not json"), /9022:/);
  assert.throws(() => problem.builder({ ...valid, employees: [{ ...valid.employees[0], salary: Infinity }] }), /9022:/);
  assert.throws(() => problem.builder({ ...valid, employees: Array(13).fill(valid.employees[0]) }), /9022:/);
});

test("9022 provides valid code-line mappings and returns every subtree aggregate", () => {
  const run = problem.builder(problem.defaultInput);
  for (const step of run.steps) {
    assert.ok(step.codeLines.length > 0);
    for (const line of step.codeLines) assert.ok(line >= 1 && line <= problem.code.length, `invalid line ${line}`);
  }
  const returned = run.steps.filter((step) => view(step).event === "return");
  assert.deepEqual(returned.map((step) => step.title.en), [
    "Return (100, 1) from B",
    "Return (200, 1) from D",
    "Return (300, 2) from C",
    "Return (500, 4) from A",
  ]);
  assert.equal(problem.liveArgs(problem.defaultInput)[1], "A");
});

test("9022 renderer displays the tree, partial aggregates and final verdict in both languages", () => {
  const host = { innerHTML: "" };
  const context = {
    lang: "en",
    $: () => host,
    escapeHtml: (value) => String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]),
    pick: (value) => value[context.lang],
  };
  vm.createContext(context);
  const source = fs.readFileSync(
    path.join(__dirname, "../public/renderer-underpaid-managers-9022.js"),
    "utf8",
  );
  vm.runInContext(source, context);
  const run = problem.builder(problem.defaultInput);
  for (const language of ["vi", "en"]) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderUnderpaidManagers9022View(step);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
      assert.equal((host.innerHTML.match(/class="um9022-node /g) || []).length, 4);
      assert.equal((host.innerHTML.match(/<tr class=/g) || []).length, 4);
    }
  }
  assert.match(host.innerHTML, /2/);
  assert.equal((host.innerHTML.match(/class="um9022-node underpaid/g) || []).length, 2);
});

test("9022 is registered with lazily loaded renderer assets", () => {
  const root = path.resolve(__dirname, "..");
  const html = fs.readFileSync(path.join(root, "public/index.html"), "utf8");
  const activeHtml = html.replace(/<template[\s\S]*?<\/template>/g, "");
  const script = fs.readFileSync(path.join(root, "public/script.js"), "utf8");
  const problemIndex = fs.readFileSync(path.join(root, "problems/index.js"), "utf8");
  assert.match(html, /<template id="problemVisualizationStyles"[\s\S]*underpaid-managers-9022\.css[\s\S]*<\/template>/);
  assert.match(html, /<template id="problemVisualizationScripts"[\s\S]*renderer-underpaid-managers-9022\.js[\s\S]*<\/template>/);
  assert.doesNotMatch(activeHtml, /underpaid-managers-9022\.(?:css|js)/);
  assert.match(script, /step\.underpaidManagers9022View[\s\S]*renderUnderpaidManagers9022View\(step\)/);
  assert.match(problemIndex, /require\("\.\/underpaid-managers-9022"\)/);
});
