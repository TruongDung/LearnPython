"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const vm = require("node:vm");

const { readFrontendJavaScript } = require("./helpers/frontend-source");
const problem = require("../problems").SUPPORTED[1570];

test("1570 debugs both approaches one source line at a time", () => {
  assert.equal(problem.debugMode, "line-by-line");

  const source = readFrontendJavaScript();
  const start = source.indexOf("function shouldUseLineByLineDebug()");
  const end = source.indexOf("\n// ---- Run algorithm ----", start);
  const context = {
    problemData: { id: 1570, debugMode: problem.debugMode },
    debugBreakpoints: new Set(),
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);

  const runs = [
    problem.builder(problem.defaultInput),
    problem.builder2(problem.defaultInput, { approach: 2 }),
  ];

  for (const run of runs) {
    const expanded = context.expandStepsLineByLine(run.steps);
    assert.equal(context.shouldUseLineByLineDebug(), true);
    assert.ok(expanded.length > run.steps.length);
    assert.ok(expanded.every((step) => !step.codeLines || step.codeLines.length <= 1));
    assert.equal(expanded.filter((step) => step.final).length, 1);
    assert.equal(expanded.at(-1).final, true);
  }
});
