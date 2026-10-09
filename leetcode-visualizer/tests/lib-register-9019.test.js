"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const { readFrontendIndex, readFrontendJavaScript, readFrontendStyles } = require("./helpers/frontend-source");
const problem = require("../problems").SUPPORTED[9019];

test("9019 is registered with immutable single-line trace views", () => {
  assert.equal(problem.id, 9019);
  assert.equal(problem.debugMode, "line-by-line");
  assert.equal(problem.category.key, "design");

  const run = problem.builder(problem.defaultInput, { template: "%GREETING%! Registered on %DATE%." });
  assert.equal(run.answer, "Hello Ada! Registered on 10/08.");
  assert.equal(run.error, null);
  assert.ok(run.steps.length > 100);
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
  assert.ok(run.steps.every((step) => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  assert.ok(run.steps.every((step) => Object.isFrozen(step.libRegister9019View)));
  assert.equal(run.steps.filter((step) => step.final).length, 1);
  assert.equal(run.steps.at(-1).final, true);
});

test("9019 expands nested and repeated placeholders with last registration winning", () => {
  const run = problem.builder("NAME=first|NAME=Ada|HELLO=Hello %NAME%|PAIR=%NAME% + %NAME%", {
    template: "%HELLO%; %PAIR%.",
  });
  assert.equal(run.answer, "Hello Ada; Ada + Ada.");
  assert.equal(run.error, null);

  const finalMap = run.steps.at(-1).libRegister9019View.registrations;
  assert.deepEqual(finalMap, [
    { name: "NAME", value: "Ada" },
    { name: "HELLO", value: "Hello %NAME%" },
    { name: "PAIR", value: "%NAME% + %NAME%" },
  ]);
});

test("9019 matches original missing and unmatched placeholder behavior", () => {
  const missing = problem.builder("KNOWN=value", { template: "before %MISSING% after" });
  assert.equal(missing.answer, "before  after");
  assert.ok(missing.steps.some((step) => step.libRegister9019View.event === "lookup-miss"));

  const unmatched = problem.builder("KNOWN=value", { template: "keep %unfinished" });
  assert.equal(unmatched.answer, "keep ");
  assert.match(unmatched.steps.findLast((step) => step.libRegister9019View.event === "return-frame").note.en, /unmatched opening/);
});

test("9019 visualizes cycle detection on the active recursion path", () => {
  const cycle = problem.builder("A=%B%|B=%C%|C=%A%", { template: "%A%" });
  assert.equal(cycle.answer, null);
  assert.equal(cycle.error, "Cycle detected: A → B → C → A");
  assert.equal(cycle.steps.filter((step) => step.final).length, 1);
  const final = cycle.steps.at(-1);
  assert.equal(final.codeLines[0], 20);
  assert.equal(final.libRegister9019View.phase, "error");
  assert.deepEqual(final.libRegister9019View.visiting, ["A", "B", "C"]);

  const safeReuse = problem.builder("A=x|PAIR=%A%%A%", { template: "%PAIR%" });
  assert.equal(safeReuse.answer, "xx");
  assert.equal(safeReuse.error, null);
});

test("9019 validates registration syntax and prepares live runner arguments", () => {
  for (const input of ["", "NO_EQUALS", "1BAD=x", "A=x||B=y"]) {
    assert.throws(() => problem.builder(input, { template: "%A%" }));
  }
  assert.throws(() => problem.builder("A=x", { template: "" }));
  assert.deepEqual(problem.liveArgs("A=x|B=%A%y", { template: "%B%" }), [
    [["A", "x"], ["B", "%A%y"]],
    "%B%",
  ]);
});

test("9019 dedicated renderer covers registry, scanner, stack, guard, and results in both languages", () => {
  const rendererPath = path.resolve(__dirname, "../public/renderer-lib-register-9019.js");
  const source = fs.readFileSync(rendererPath, "utf8");
  const element = {};
  const context = { lang: "en", $: () => element };
  vm.createContext(context);
  vm.runInContext(source, context);

  const possible = problem.builder("NAME=Ada|GREETING=Hello %NAME%", { template: "%GREETING%!" });
  const cycle = problem.builder("A=%B%|B=%A%", { template: "%A%" });
  const samples = [possible.steps[0], possible.steps.find((step) => step.libRegister9019View.frames.length > 1), possible.steps.at(-1), cycle.steps.at(-1)];
  for (const language of ["en", "vi"]) {
    context.lang = language;
    for (const step of samples) {
      context.renderLibRegister9019View(step);
      assert.match(element.innerHTML, /lr9019-viz/);
      assert.match(element.innerHTML, /lr9019-registry/);
      assert.match(element.innerHTML, /lr9019-scanner/);
      assert.match(element.innerHTML, /lr9019-stack/);
      assert.match(element.innerHTML, /lr9019-guard/);
      assert.match(element.innerHTML, /lr9019-result/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
  context.lang = "en";
  context.renderLibRegister9019View(cycle.steps.at(-1));
  assert.match(element.innerHTML, /CYCLE DETECTED/);
});

test("9019 frontend loads its renderer and responsive scoped styles", () => {
  const html = readFrontendIndex();
  const javascript = readFrontendJavaScript();
  const css = readFrontendStyles();

  assert.match(html, /lib-register-9019\.css/);
  assert.match(html, /renderer-lib-register-9019\.js/);
  assert.match(javascript, /step\.libRegister9019View/);
  assert.match(javascript, /renderLibRegister9019View\(step\)/);
  assert.match(css, /\.lr9019-viz \{/);
  assert.match(css, /\[data-theme="light"\] \.lr9019-viz/);
  assert.match(css, /@container \(max-width: 600px\)/);
});
