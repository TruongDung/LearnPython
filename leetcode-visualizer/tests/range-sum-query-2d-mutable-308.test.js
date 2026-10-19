"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const problem = require("../problems").SUPPORTED[308];
const publicDir = path.join(__dirname, "..", "public");

function render(step, language = "vi") {
  const treeView = { innerHTML: "" };
  const context = {
    lang: language,
    console,
    $: (id) => id === "treeView" ? treeView : null,
    escapeHtml: (value) => String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;"),
  };
  vm.createContext(context);
  const source = fs.readFileSync(path.join(publicDir, "renderers-04.js"), "utf8");
  vm.runInContext(`${source}\nglobalThis.__render308 = renderRangeSum308View;`, context);
  context.__render308(step);
  return treeView.innerHTML;
}

function brute(matrix, operations) {
  const current = matrix.map((row) => [...row]);
  return operations.map((operation) => {
    if (operation[0] === "update") {
      current[operation[1]][operation[2]] = operation[3];
      return null;
    }
    let total = 0;
    for (let row = operation[1]; row <= operation[3]; row += 1) {
      for (let col = operation[2]; col <= operation[4]; col += 1) total += current[row][col];
    }
    return total;
  });
}

test("308 supports mutable rectangle sums", () => {
  const cases = [
    {
      matrix: [[3, 0, 1, 4, 2], [5, 6, 3, 2, 1], [1, 2, 0, 1, 5], [4, 1, 0, 1, 7], [1, 0, 3, 0, 5]],
      operations: [["sumRegion", 2, 1, 4, 3], ["update", 3, 2, 2], ["sumRegion", 2, 1, 4, 3]],
    },
    {
      matrix: [[1]],
      operations: [["sumRegion", 0, 0, 0, 0], ["update", 0, 0, -4], ["sumRegion", 0, 0, 0, 0]],
    },
    {
      matrix: [[2, -1, 3], [0, 5, 4]],
      operations: [["sumRegion", 0, 0, 1, 2], ["update", 0, 1, 7], ["sumRegion", 0, 1, 1, 2]],
    },
  ];
  for (const { matrix, operations } of cases) {
    const encoded = operations.map((operation) => `${operation[0]} ${operation.slice(1).join(" ")}`).join(" | ");
    const result = problem.builder(JSON.stringify(matrix), { operations: encoded });
    assert.deepEqual(result.answer, brute(matrix, operations));
  }
});

test("308 is a true one-line-at-a-time debugger", () => {
  const result = problem.builder(problem.defaultInput, { operations: problem.extraParams[0].default });
  assert.equal(problem.debugMode, "line-by-line");
  assert.equal(result.steps.length, 140);
  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  assert.ok(result.steps.every((step) => problem.code[step.codeLines[0] - 1]?.trim()));
  assert.ok(result.steps.every((step) => step.segmentTreeView?.variant === "range-sum-2d-308"));
  assert.deepEqual([...new Set(result.steps.map((step) => step.segmentTreeView.phase))], ["build", "query", "answer", "update"]);
  assert.deepEqual(result.answer, [8, null, 10]);
  assert.equal(result.steps.at(-1).segmentTreeView.answer, 10);
  assert.equal(result.steps.at(-1).final, true);
});

test("308 displayed Python agrees with the visualization", () => {
  const code = problem.code.join("\n");
  assert.match(code, /self\.bit\[i\]\[j\] \+= delta/);
  assert.match(code, /j \+= j & -j/);
  assert.match(code, /j -= j & -j/);
  assert.match(code, /self\.prefix\(row2, col2\)/);
  const script = `${code}\nobj = NumMatrix([[3,0,1],[5,6,3],[1,2,0]])\nprint(obj.sumRegion(0,1,2,2))\nobj.update(1,1,4)\nprint(obj.sumRegion(0,1,2,2))`;
  const run = spawnSync("python3", ["-c", script], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(run.stdout.trim().split("\n").map(Number), [12, 10]);
});

test("308 renderer is picture-first in Vietnamese and English", () => {
  const result = problem.builder(problem.defaultInput, { operations: problem.extraParams[0].default });
  const samples = [
    result.steps[0],
    result.steps.find((step) => step.segmentTreeView.phase === "update" && step.segmentTreeView.activeBit.length),
    result.steps.find((step) => step.segmentTreeView.phase === "query" && step.segmentTreeView.visitedBit.length),
    result.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    for (const step of samples) {
      const html = render(step, language);
      assert.match(html, /rs308-viz/);
      assert.match(html, /rs308-flow/);
      assert.match(html, /rs308-board matrix/);
      assert.match(html, /rs308-board bit/);
      assert.match(html, /rs308-grid/);
      assert.match(html, /rs308-action/);
      assert.doesNotMatch(html, /undefined|NaN|\?\?\?/);
    }
  }
  assert.match(render(samples.at(-1)), /rs308-corners/);
  assert.match(render(samples.at(-1)), />10<\/output>/);
});

test("308 ships responsive, theme-aware visuals and fresh assets", () => {
  const css = fs.readFileSync(path.join(publicDir, "style-02.css"), "utf8");
  const html = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");
  assert.match(css, /picture-first 2D Fenwick debugger/);
  assert.match(css, /container: rs308 \/ inline-size/);
  assert.match(css, /@container rs308 \(max-width: 440px\)/);
  assert.match(css, /\[data-theme="light"\] \.rs308-viz/);
  assert.match(css, /body:has\(\.rs308-viz\) #stepNote/);
  assert.match(html, /rs308=range-sum-2d-308-v1/g);
  assert.equal((html.match(/rs308=range-sum-2d-308-v1/g) || []).length, 2);
  assert.equal(problem.complexity.space, "O(mn)");
});

