"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { SUPPORTED, CATEGORY_ORDER } = require("../problems");

const problem = SUPPORTED[1231];

function bruteForce(sweetness, k) {
  const pieces = k + 1;
  let answer = 0;
  for (let mask = 0; mask < 2 ** (sweetness.length - 1); mask += 1) {
    if (mask.toString(2).replace(/0/g, "").length !== pieces - 1) continue;
    const sums = [];
    let current = sweetness[0];
    for (let index = 1; index < sweetness.length; index += 1) {
      if (mask & (1 << (index - 1))) {
        sums.push(current);
        current = 0;
      }
      current += sweetness[index];
    }
    sums.push(current);
    answer = Math.max(answer, Math.min(...sums));
  }
  return answer;
}

test("1231 is registered in the binary-search learning path", () => {
  assert.ok(problem);
  assert.equal(problem.slug, "divide-chocolate");
  assert.ok(CATEGORY_ORDER["binary-search"].order.includes(1231));
  assert.equal(problem.defaultInput.length, 9);
});

test("1231 matches published examples and exhaustive ordered partitions", () => {
  const cases = [
    [[1, 2, 3, 4, 5, 6, 7, 8, 9], 5, 6],
    [[5, 6, 7, 8, 9, 1, 2, 3, 4], 8, 1],
    [[1, 2, 2, 1, 2, 2, 1, 2, 2], 2, 5],
    [[9], 0, 9],
  ];
  for (const [sweetness, k, answer] of cases) {
    assert.equal(problem.builder(sweetness, { k }).answer, answer);
  }

  let seed = 1231;
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  for (let trial = 0; trial < 100; trial += 1) {
    const length = 1 + random() % 8;
    const sweetness = Array.from({ length }, () => 1 + random() % 12);
    const k = random() % length;
    assert.equal(problem.builder(sweetness, { k }).answer, bruteForce(sweetness, k));
  }
});

test("1231 final picture has exactly k + 1 pieces and k cuts", () => {
  const sweetness = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const k = 5;
  const run = problem.builder(sweetness, { k });
  const final = run.steps.at(-1).divideChocolate1231View;
  assert.equal(final.final, true);
  assert.equal(final.partition.length, k + 1);
  assert.equal(final.scan.cuts.length, k);
  assert.deepEqual(final.partition.flatMap((piece) => piece.values), sweetness);
  assert.ok(final.partition.every((piece) => piece.sum >= run.answer));
  assert.equal(Math.min(...final.partition.map((piece) => piece.sum)), run.answer);
});

test("1231 trace shows greedy cuts and monotonically shrinking search", () => {
  const run = problem.builder([1, 2, 3, 4, 5, 6, 7, 8, 9], { k: 5 });
  assert.ok(run.steps.some((step) => step.divideChocolate1231View.action === "make-cut"));
  assert.ok(run.steps.some((step) => step.divideChocolate1231View.action === "shareable"));
  assert.ok(run.steps.some((step) => step.divideChocolate1231View.action === "not-shareable"));
  for (const step of run.steps) {
    const view = step.divideChocolate1231View;
    assert.equal(view.source.text, problem.code[view.source.line - 1]);
    assert.ok(view.search.left <= view.search.right);
    assert.equal(view.scan.groupOf.length, view.input.sweetness.length);
    assert.ok(view.scan.processed >= 0 && view.scan.processed <= view.input.sweetness.length);
  }
});

test("1231 renderer is pictorial, concise, bilingual, and stable on every frame", () => {
  const source = fs.readFileSync(require.resolve("../public/renderer-divide-chocolate-1231.js"), "utf8");
  for (const language of ["vi", "en"]) {
    const host = { innerHTML: "" };
    const context = { lang: language, document: { getElementById: (id) => id === "treeView" ? host : null } };
    vm.createContext(context);
    vm.runInContext(source, context);
    const run = problem.builder([1, 2, 3, 4, 5, 6, 7, 8, 9], { k: 5 });
    for (const step of run.steps) {
      context.renderDivideChocolate1231View(JSON.parse(JSON.stringify(step)));
      assert.match(host.innerHTML, /dc1231-chocolate-face/);
      assert.match(host.innerHTML, /dc1231-ruler/);
      assert.match(host.innerHTML, /dc1231-person/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
      assert.doesNotMatch(host.innerHTML, /table|event-rail|invariant-list|counter-grid/);
    }
  }
});

test("1231 final renderer shows six shares, five scissors, and the optimum", () => {
  const host = { innerHTML: "" };
  const context = { lang: "vi", document: { getElementById: () => host } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-divide-chocolate-1231.js"), "utf8"), context);
  const final = problem.builder([1, 2, 3, 4, 5, 6, 7, 8, 9], { k: 5 }).steps.at(-1);
  context.renderDivideChocolate1231View(final);
  assert.match(host.innerHTML, /Tối ưu = 6/);
  assert.match(host.innerHTML, />6 \/ 6</);
  assert.equal((host.innerHTML.match(/class="dc1231-piece piece-/g) || []).length, 6);
  assert.equal((host.innerHTML.match(/class="dc1231-scissors"/g) || []).length, 5);
});

test("1231 validates inputs and exposes typed live arguments", () => {
  for (const input of [[], [0], [-1], [1.5], [100001], Array(25).fill(1)]) {
    assert.throws(() => problem.builder(input, { k: 0 }), /1231: sweetness/);
  }
  for (const k of [-1, 3, 1.5, true, null, "", "1.2"]) {
    assert.throws(() => problem.builder([1, 2, 3], { k }), /1231: k/);
  }
  assert.deepEqual(problem.liveArgs([1, 2, 3], { k: "1" }), [[1, 2, 3], 1]);
});

test("1231 dedicated assets are lazy and routed before generic renderers", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const activeHtml = html.replace(/<template[\s\S]*?<\/template>/g, "");
  assert.match(html, /divide-chocolate-1231\.css/);
  assert.match(html, /renderer-divide-chocolate-1231\.js/);
  assert.doesNotMatch(activeHtml, /divide-chocolate-1231\.(?:css|js)/);
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  assert.match(script, /step\.divideChocolate1231View/);
});
