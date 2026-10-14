"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[1774];

function bruteForce(baseCosts, toppingCosts, target) {
  let best = Infinity;
  for (const base of baseCosts) {
    function search(index, cost) {
      if (Math.abs(cost - target) < Math.abs(best - target)
        || (Math.abs(cost - target) === Math.abs(best - target) && cost < best)) best = cost;
      if (index === toppingCosts.length || cost >= target) return;
      for (let count = 0; count < 3; count++) {
        search(index + 1, cost + count * toppingCosts[index]);
      }
    }
    search(0, base);
  }
  return best;
}

test("1774 registers the supplied interview solution with per-line debug", () => {
  assert.equal(problem.id, 1774);
  assert.equal(problem.slug, "closest-dessert-cost");
  assert.equal(problem.difficulty, "medium");
  assert.equal(problem.debugMode, "line-by-line");
  assert.equal(problem.code[2], '        best = float("inf")');
  assert.equal(problem.code[7], "            if (abs(cost - target), cost) < (abs(best - target), best):");
  assert.equal(problem.code[21], "                dfs(i + 1, cost + count * toppingCosts[i])");
  const result = problem.builder(problem.defaultInput, { target: 10 });
  assert.equal(result.answer, 10);
  assert.ok(result.steps.length > 20);
  assert.ok(result.steps.every((step) => step.codeLines.length === 1
    && step.codeLines[0] >= 1
    && step.codeLines[0] <= problem.code.length));
  assert.equal(result.steps.at(-1).codeLines[0], 27);
  assert.equal(result.steps.filter((step) => step.final).length, 1);
});

test("1774 chooses the lower cost on ties and prunes branches at target", () => {
  const tied = problem.builder("4,6;2", { target: 5 });
  assert.equal(tied.answer, 4);
  const tieStep = tied.steps.find((step) => step.dessert1774View.phase === "compare"
    && step.dessert1774View.cost === 6
    && step.dessert1774View.bestBefore === 4);
  assert.equal(tieStep.dessert1774View.improved, false);

  const pruned = problem.builder("10;3,4", { target: 10 });
  assert.equal(pruned.answer, 10);
  assert.ok(pruned.steps.some((step) => step.dessert1774View.phase === "pruned"));
  assert.equal(pruned.visited, 1);
});

test("1774 DFS matches an independent exhaustive oracle for varied inputs", () => {
  const cases = [
    [[3], [2, 3], 18],
    [[2, 3], [4, 5, 100], 18],
    [[10, 12], [1, 2, 3], 8],
    [[7, 9], [2, 6], 15],
  ];
  for (let seed = 1; seed <= 30; seed++) {
    let value = seed;
    const next = (max) => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value % max + 1;
    };
    cases.push([
      Array.from({ length: next(4) }, () => next(15)),
      Array.from({ length: next(5) }, () => next(10)),
      next(40),
    ]);
  }
  for (const [baseCosts, toppingCosts, target] of cases) {
    const output = problem.builder(`${baseCosts.join(",")};${toppingCosts.join(",")}`, { target });
    assert.equal(output.answer, bruteForce(baseCosts, toppingCosts, target));
  }
});

test("1774 validates inputs and exposes the arrays and target to the live editor", () => {
  assert.deepEqual(problem.liveArgs("1,7;3,4", { target: 10 }), [[1, 7], [3, 4], 10]);
  assert.deepEqual(problem.liveArgs("[[1,7],[3,4]]", { target: 10 }), [[1, 7], [3, 4], 10]);
  for (const input of ["", "1,0;2", "1,2", "1;;2", "[invalid]"]) {
    assert.throws(() => problem.builder(input, { target: 10 }), /1774:/);
  }
});

test("1774 renderer is visual in both languages and escapes displayed text", () => {
  const html = { innerHTML: "" };
  const head = { appendChild() {} };
  const document = {
    getElementById(id) {
      if (id === "treeView") return html;
      return null;
    },
    createElement() {
      return { id: "", textContent: "" };
    },
    head,
  };
  const context = { document, lang: "en", $: (id) => id === "treeView" ? html : null };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-closest-dessert-cost-1774.js"), "utf8"), context);
  const step = problem.builder("1,7;3,4", { target: 10 }).steps.find((item) => item.dessert1774View.phase === "choice-loop");
  for (const language of ["en", "vi"]) {
    context.lang = language;
    context.renderClosestDessertCost1774View(step);
    assert.match(html.innerHTML, /cd1774-path/);
    assert.match(html.innerHTML, /cd1774-option/);
    assert.match(html.innerHTML, /DFS calls|Lời gọi DFS/);
    assert.doesNotMatch(html.innerHTML, /undefined|NaN|\[object Object\]/);
  }
  const malicious = {
    ...step,
    title: { en: "<img src=x onerror=alert(1)>", vi: "<img src=x onerror=alert(1)>" },
  };
  context.renderClosestDessertCost1774View(malicious);
  assert.doesNotMatch(html.innerHTML, /<img/);
  assert.match(html.innerHTML, /&lt;img/);
});
