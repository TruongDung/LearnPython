"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

const problem = require("../problems").SUPPORTED[9011];

test("9011 is registered with a true single-line debug trace", () => {
  assert.equal(problem.id, 9011);
  assert.equal(problem.debugMode, "line-by-line");

  const run = problem.builder(problem.defaultInput);
  assert.ok(run.steps.length > 0);
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
  assert.ok(run.steps.every((step) => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  assert.equal(run.steps.filter((step) => step.final).length, 1);
  assert.equal(run.steps.at(-1).final, true);
});

test("9011 keeps the newest live values and scans keys in order", () => {
  const run = problem.builder("PUT z old|PUT a 1|UPDATE z newest value|DELETE a|PUT m 2|SCAN");
  assert.deepEqual(run.answer, [["m", "2"], ["z", "newest value"]]);

  const finalView = run.steps.at(-1).diskKv9011View;
  assert.deepEqual(finalView.scan, [
    { key: "m", value: "2" },
    { key: "z", value: "newest value" },
  ]);
  assert.deepEqual(finalView.index, [
    { key: "z", offset: 2 },
    { key: "m", offset: 4 },
  ]);
  assert.equal(finalView.records[3].deleted, true);
});

test("9011 rejects malformed commands and does not append a missing UPDATE", () => {
  for (const input of ["", "GET a", "PUT a", "DELETE", "SCAN extra"]) {
    assert.throws(() => problem.builder(input));
  }

  const run = problem.builder("UPDATE missing 1|SCAN");
  assert.deepEqual(run.answer, []);
  assert.equal(run.steps.at(-1).diskKv9011View.records.length, 0);
  assert.ok(run.steps.some((step) => step.codeLines[0] === 13 && step.diskKv9011View.result === false));
});
