"use strict";

const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const { readFrontendJavaScript } = require("./helpers/frontend-source");
// Retain coverage of the legacy semantic renderer; native replay is tested separately.
const problem = require("../problems/sparse-vector")[1570];

function renderStep(step, language = "en") {
  const treeHost = { innerHTML: "" };
  const context = {
    lang: language,
    pick: (value) => value && typeof value === "object" ? value[language] || value.en || value.vi : value,
    escapeHtml: (value) => String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;"),
    $: (id) => id === "treeView" ? treeHost : null,
  };
  vm.createContext(context);
  vm.runInContext(
    readFileSync(join(__dirname, "..", "public", "renderer-sparse-vector-1570.js"), "utf8"),
    context,
  );
  context.renderSparseVector1570View(step);
  return treeHost.innerHTML;
}

test("1570 debugs all five approaches one source line at a time", () => {
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
    problem.builder3(problem.defaultInput, { approach: 3 }),
    problem.builder4(problem.defaultInput, { approach: 4 }),
    problem.builder5(problem.defaultInput, { approach: 5 }),
  ];

  for (const [index, run] of runs.entries()) {
    const expanded = context.expandStepsLineByLine(run.steps);
    assert.equal(context.shouldUseLineByLineDebug(), true);
    assert.ok(expanded.length > run.steps.length);
    assert.ok(expanded.every((step) => !step.codeLines || step.codeLines.length <= 1));
    assert.equal(expanded.filter((step) => step.final).length, 1);
    assert.equal(expanded.at(-1).final, true);
    assert.ok(run.steps.every((step) => (step.codeBlock || 1) === index + 1));
  }
});

test("1570 illustrates zero skipping and storing nonzero vector entries", () => {
  const result = problem.builder3(problem.defaultInput);
  const zeroStep = result.steps.find((step) => step.sparseVector1570View.build.action === "skip-zero");
  const storeStep = result.steps.find((step) => step.sparseVector1570View.build.action === "store");
  const zeroHtml = renderStep(zeroStep, "vi");
  const storeHtml = renderStep(storeStep, "vi");

  assert.match(zeroHtml, /sv1570-dense-building/);
  assert.match(zeroHtml, /sv1570-visual-value is-zero/);
  assert.match(zeroHtml, /sv1570-visual-output is-empty/);
  assert.match(zeroHtml, /Bỏ số 0/);
  assert.match(storeHtml, /sv1570-visual-output/);
  assert.match(storeHtml, /Lưu cặp/);
  assert.doesNotMatch(storeHtml, /sv1570-action-note/);
});

test("1570 draws matching values, product, and hash lookup probe", () => {
  const hashRun = problem.builder3(problem.defaultInput);
  const twoPointerRun = problem.builder4(problem.defaultInput, { approach: 4 });
  const hashMatch = renderStep(hashRun.steps.find((step) => step.sparseVector1570View.phase === "match"));
  const pointerMatch = renderStep(twoPointerRun.steps.find((step) => (
    step.sparseVector1570View.phase === "compare" && step.sparseVector1570View.current.relation === "match"
  )));
  const probe = renderStep(hashRun.steps.find((step) => step.sparseVector1570View.phase === "probe"));

  for (const html of [hashMatch, pointerMatch]) {
    assert.match(html, /sv1570-comparison-visual/);
    assert.match(html, /sv1570-visual-left/);
    assert.match(html, /sv1570-visual-right/);
    assert.match(html, /sv1570-visual-product/);
  }
  assert.match(probe, /sv1570-lookup-visual/);
  assert.match(probe, /lookup\[/);
});

test("1570 maps five methods and their stated dot-product complexity", () => {
  const options = problem.extraParams.find((item) => item.key === "approach").options;
  assert.equal(options.length, 5);
  assert.deepEqual(options.map((option) => option.value), ["1", "2", "3", "4", "5"]);
  assert.match(problem.approach[0].en, /O\(n\).*O\(n\) storage per vector/);
  assert.match(problem.approach[1].en, /O\(L1\) average/);
  assert.match(problem.approach[2].en, /O\(min\(L1, L2\)\) average/);
  assert.match(problem.approach[3].en, /O\(L1 \+ L2\)/);
  assert.match(problem.approach[4].en, /O\(L1 log L2\)/);
  assert.match(problem.complexity.time, /O\(n\).*O\(L1\).*O\(min\(L1, L2\)\).*O\(L1 \+ L2\).*O\(L1 log L2\)/);
  assert.match(problem.complexity.note.en, /O\(n\) storage per vector/);
});

test("1570 membership-map code and highlights match the requested method", () => {
  const expectedCode = `from typing import List

class SparseVector:
    def __init__(self, nums: List[int]):
        self.nums = {}

        for i, num in enumerate(nums):
            if num != 0:
                self.nums[i] = num

    def dotProduct(self, vec: 'SparseVector') -> int:
        result = 0

        for i, num in self.nums.items():
            if i in vec.nums:
                result += num * vec.nums[i]

        return result`;
  const result = problem.builder2("1,0,2,0|0,3,2,0", { approach: 2 });
  const probe = result.steps.find((step) => step.sparseVector1570View.phase === "probe");
  const miss = result.steps.find((step) => step.sparseVector1570View.phase === "miss");
  const match = result.steps.find((step) => step.sparseVector1570View.phase === "match");
  const probeHtml = renderStep(probe, "vi");

  assert.equal(problem.code2.join("\n"), expectedCode);
  assert.equal(result.answer, 4);
  assert.equal(result.steps.at(-1).codeBlock, 2);
  assert.ok(result.steps.every((step) => step.codeLines.every((line) => line >= 1 && line <= problem.code2.length)));
  assert.deepEqual(probe.codeLines, [14, 15]);
  assert.deepEqual(miss.codeLines, [15]);
  assert.deepEqual(match.codeLines, [16]);
  assert.equal(probe.sparseVector1570View.strategy, "hash-membership");
  assert.match(probeHtml, /Hash map/);
  assert.match(probeHtml, /vec\.nums/);
  assert.match(probeHtml, /index 0/);
});

test("1570 brute-force multiplies every dense index, including zeros", () => {
  const result = problem.builder("1,0,-2|3,4,5");
  const zeroProduct = result.steps.find((step) => (
    step.sparseVector1570View.strategy === "brute-force"
    && step.sparseVector1570View.current.index === 1
    && step.sparseVector1570View.phase === "brute-force"
  ));
  const html = renderStep(zeroProduct);

  assert.equal(result.answer, -7);
  assert.equal(result.steps.at(-1).codeBlock || 1, 1);
  assert.match(html, /FULL ARRAYS/);
  assert.match(html, /Keep zeros too/);
  assert.match(html, /0 × 4/);
  assert.match(html, /sv1570-dense-zero/);
});

test("1570 binary search narrows sorted pairs and handles a missing index", () => {
  const result = problem.builder5("1,0,2,0,3,0,4|0,5,0,6,0,7,8", { approach: 5 });
  const comparisons = result.steps.filter((step) => step.sparseVector1570View.phase === "compare");
  const miss = result.steps.find((step) => step.sparseVector1570View.phase === "miss");
  const html = renderStep(comparisons[0]);

  assert.equal(result.answer, 32);
  assert.equal(result.steps.at(-1).codeBlock, 5);
  assert.ok(comparisons.length > 0);
  assert.ok(result.steps.every((step) => step.codeLines.every((line) => line >= 1 && line <= problem.code5.length)));
  assert.equal(miss.sparseVector1570View.current.index, 0);
  assert.match(html, /Binary search/);
  assert.match(html, /sv1570-visual-relation/);
});

test("1570 all approaches agree across sparse vectors with negative and zero values", () => {
  const builders = [
    { build: problem.builder, code: problem.code },
    { build: problem.builder2, code: problem.code2 },
    { build: problem.builder3, code: problem.code3 },
    { build: problem.builder4, code: problem.code4 },
    { build: problem.builder5, code: problem.code5 },
  ];
  let seed = 1570;
  const randomValue = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % 7 - 3;
  };

  for (let trial = 0; trial < 30; trial++) {
    const length = 1 + trial % 12;
    const left = Array.from({ length }, randomValue);
    const right = Array.from({ length }, randomValue);
    const input = `${left.join(",")}|${right.join(",")}`;
    const expected = left.reduce((total, value, index) => total + value * right[index], 0);

    for (const [approach, { build, code }] of builders.entries()) {
      const result = build(input, { approach: approach + 1 });
      assert.equal(result.answer, expected, `trial ${trial}, approach ${approach + 1}`);
      assert.ok(result.steps.at(-1).final);
      assert.ok(result.steps.every((step) => (
        step.codeLines.every((line) => line >= 1 && line <= code.length)
      )), `invalid code line in trial ${trial}, approach ${approach + 1}`);
    }
  }
});
