"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[9014];

function renderer() {
  const element = { innerHTML: "" };
  const context = {
    lang: "en", $: () => element,
    escapeHtml: (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, "../public/renderer-requested-visualizations.js"), "utf8"), context);
  return { context, element };
}

test("9014 exposes a new user's daily set before the union mutation and deduplicates videos", () => {
  const run = problem.builder("ann:A,ann:A||ann:A");
  const firstAdd = run.steps.find((step) => step.loyal9014View.operation === "per-day-add").loyal9014View;
  assert.deepEqual(firstAdd.users[0].day1, ["A"]);
  assert.deepEqual(firstAdd.users[0].union, []);
  const firstUnion = run.steps.find((step) => step.loyal9014View.operation === "union-add").loyal9014View;
  assert.deepEqual(firstUnion.users[0].union, ["A"]);
  const final = run.steps.at(-1).loyal9014View.users[0];
  assert.equal(final.presentBoth, true);
  assert.equal(final.distinctCount, 1);
  assert.equal(final.qualifies, false);
  assert.equal(final.reason, "needs-two-distinct");
  assert.deepEqual(run.answer, []);
});

test("9014 delays the verdict and answer until their respective instructions", () => {
  const run = problem.builder("ann:A,bob:A,bob:B||ann:B,cam:C");
  assert.deepEqual(run.answer, ["ann"]);
  const { context, element } = renderer();
  for (const language of ["en", "vi"]) {
    context.lang = language;
    for (const step of run.steps) {
      const view = step.loyal9014View;
      context.renderLoyal9014View(step);
      assert.doesNotMatch(element.innerHTML, /NaN|undefined|rv-loyal-table|rv-log-flow/);
      if (view.activeUser === "ann" && view.phase === "evaluate") {
        const row = view.users.find((user) => user.user === "ann");
        if (view.operation === "check-days") {
          assert.equal(row.presentBoth, true);
          assert.equal(row.distinctEnough, null);
        }
        if (["check-days", "check-distinct"].includes(view.operation)) {
          assert.equal(row.qualifies, null);
          assert.doesNotMatch(element.innerHTML, /class="pass">LOYAL/);
          assert.deepEqual(view.answer, []);
        }
        if (view.operation === "loyal-check") {
          assert.equal(row.qualifies, true);
          assert.deepEqual(view.answer, []);
        }
        if (view.operation === "answer-append") assert.deepEqual(view.answer, ["ann"]);
      }
      if (view.phase === "done") {
        assert.match(element.innerHTML, /rv-loyal-answer done/);
        assert.doesNotMatch(element.innerHTML, /rv-loyal-current|rv-loyal-logs/);
        assert.equal(view.users.find((row) => row.user === "bob").reason, "missing-day");
      }
    }
  }
});

test("9014 keeps long names, current records and large answers accessible", () => {
  const names = Array.from({ length: 12 }, (_, i) => i === 0 ? "<user&name>" : `long_user_${i}_abcdefghijklmnopqrst`);
  const run = problem.builder(`${names.map((user) => `${user}:A`).join(",")}||${names.map((user) => `${user}:B`).join(",")}`);
  const { context, element } = renderer();
  for (const step of run.steps) {
    context.renderLoyal9014View(step);
    if (step.loyal9014View.current) assert.match(element.innerHTML, /rv-loyal-record active/);
    assert.doesNotMatch(element.innerHTML, /<user&name>/);
  }
  assert.equal(run.answer.length, 12);
  assert.match(element.innerHTML, /\+4 users/);
  assert.match(element.innerHTML, /&lt;user&amp;name&gt;/);
  for (const user of names.slice(1)) assert.ok(element.innerHTML.includes(user));
});
