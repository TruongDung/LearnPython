"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[54];
const WATCHES = ["top", "bottom", "left", "right", "r", "c"];
const cases = [
  [[1]], [[1, 2, 3, 4, 5]], [[1], [2], [3], [4], [5]],
  [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
  [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]],
  [[1, 2], [3, 4], [5, 6], [7, 8]],
  [[1, 1, 1], [1, 1, 1]], [[-1, 0, 2.5], [0, -4, 2.5]],
];

// Independent walker: turn when the next cell is outside or already visited.
// This does not use the algorithm's shrinking top/bottom/left/right bounds.
function walk(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const moves = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const seen = new Set(), cells = [];
  let r = 0, c = 0, direction = 0;
  while (cells.length < rows * cols) {
    seen.add(`${r},${c}`);
    cells.push({ row: r, col: c, value: matrix[r][c] });
    let nr = r + moves[direction][0], nc = c + moves[direction][1];
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen.has(`${nr},${nc}`)) {
      direction = (direction + 1) % moves.length;
      nr = r + moves[direction][0]; nc = c + moves[direction][1];
    }
    r = nr; c = nc;
  }
  return cells;
}

test("54 visits each coordinate exactly once in spiral order for all thin and rectangular shapes", () => {
  const matrices = [...cases];
  for (let rows = 1; rows <= 8; rows++) for (let cols = 1; cols <= 8; cols++) {
    matrices.push(Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => (r * cols + c) % 7 - 3)));
  }
  for (const matrix of matrices) {
    const immutable = Object.freeze(matrix.map(row => Object.freeze([...row])));
    const run = problem.builder(immutable), expected = walk(matrix);
    assert.deepEqual(run.original, matrix);
    assert.deepEqual(run.answer, expected.map(cell => cell.value));
    assert.equal(run.steps.filter(step => step.final).length, 1);
    assert.ok(run.steps.at(-1).final);
    let count = 0, previous = null;
    for (const step of run.steps) {
      const v = step.spiral54View;
      assert.deepEqual(v.matrix, matrix);
      assert.equal(v.rows, matrix.length); assert.equal(v.cols, matrix[0].length);
      assert.ok(v.visitedCells.length === count || v.visitedCells.length === count + 1);
      if (v.visitedCells.length > count) {
        assert.ok([8, 11, 15, 19].includes(step.codeLines[0]));
        const last = v.visitedCells.at(-1);
        assert.deepEqual(v.activeCell, [last.row, last.col]);
        assert.equal(last.direction, ({ 8: "top", 11: "right", 15: "bottom", 19: "left" })[step.codeLines[0]]);
      }
      count = v.visitedCells.length;
      assert.deepEqual(v.visitedCells.map(({ row, col, value }) => ({ row, col, value })), expected.slice(0, count));
      assert.deepEqual(v.visitedCells.map(cell => cell.order), Array.from({ length: count }, (_, i) => i + 1));
      assert.deepEqual(v.result, expected.slice(0, count).map(cell => cell.value));
      assert.equal(v.remainingCount, expected.length - count);
      if (v.activeCell) {
        const [r, c] = v.activeCell;
        assert.ok(r >= 0 && r < v.rows && c >= 0 && c < v.cols);
      }
      if (v.boundaryChange) {
        const { name, from, to } = v.boundaryChange;
        assert.equal(from, previous.bounds[name]); assert.equal(to, v.bounds[name]);
        assert.equal(to - from, name === "top" || name === "left" ? 1 : -1);
      }
      if (v.guard) {
        const { top, bottom, left, right } = v.bounds;
        const conditions = { "top <= bottom": top <= bottom, "left <= right": left <= right,
          "top <= bottom and left <= right": top <= bottom && left <= right };
        assert.equal(v.guard.pass, conditions[v.guard.expression]);
      }
      previous = v;
    }
    assert.equal(count, matrix.length * matrix[0].length);
  }
});

test("54 after-line debugging agrees with CPython, including empty ranges, guards and retained loop variables", () => {
  const payload = cases.map(matrix => ({ matrix, code: problem.code.join("\n") }));
  const program = `
import copy, json, sys
runs = []
for case in json.load(sys.stdin):
    namespace = {}
    exec(case['code'], namespace)
    events, pending = [], None
    def snapshot(frame, line):
        events.append({'line': line, 'locals': copy.deepcopy({name: value for name, value in frame.f_locals.items() if name != 'self'})})
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_name != 'spiralOrder':
            return trace
        if event == 'line':
            if pending is not None:
                snapshot(frame, pending)
            pending = frame.f_lineno
        elif event == 'return':
            snapshot(frame, pending)
            pending = None
        return trace
    matrix = copy.deepcopy(case['matrix'])
    sys.settrace(trace)
    answer = namespace['Solution']().spiralOrder(matrix)
    sys.settrace(None)
    runs.append({'answer': answer, 'matrix': matrix, 'events': events})
print(json.dumps(runs))
`;
  const python = spawnSync(process.env.PYTHON || "python3", ["-c", program], {
    input: JSON.stringify(payload), encoding: "utf8", maxBuffer: 16 * 1024 * 1024,
  });
  assert.equal(python.status, 0, python.stderr);
  JSON.parse(python.stdout).forEach((reference, index) => {
    const run = problem.builder(payload[index].matrix);
    assert.deepEqual(reference.matrix, payload[index].matrix);
    assert.deepEqual(run.answer, reference.answer);
    assert.equal(run.steps.length, reference.events.length);
    run.steps.forEach((step, i) => {
      const event = reference.events[i], v = step.spiral54View;
      assert.deepEqual(step.codeLines, [event.line]);
      assert.deepEqual(v.locals, event.locals, `case ${index}, event ${i}, line ${event.line}`);
      assert.deepEqual(v.source, { line: event.line, text: problem.code[event.line - 1], timing: "after" });
      assert.deepEqual(step.vars.map(variable => variable.name), WATCHES);
      assert.deepEqual(step.vars.map(variable => variable.value), WATCHES.map(name => event.locals[name] ?? "—"));
      for (const name of WATCHES.slice(0, 4)) assert.equal(v.bounds[name], event.locals[name] ?? null);
      assert.deepEqual(v.result, event.locals.res);
    });
  });
});

test("54 accepts rectangular CSV, pipe, newline, JSON and array input and validates numeric shapes", () => {
  const expected = [[1, 2, 3], [4, 5, 6]];
  for (const input of ["1,2,3;4,5,6", "1,2,3|4,5,6", "1,2,3\n4,5,6", JSON.stringify(expected), expected]) {
    assert.deepEqual(problem.liveArgs(input), [expected]);
    assert.deepEqual(problem.builder(input).answer, [1, 2, 3, 6, 5, 4]);
  }
  for (const input of ["", null, [], [[]], [[1, 2], [3]], [[NaN]], [[Infinity]], [["1"]], "1,,2;3,4,5", "[[1]", "1e999", [[true]], [[null]], Array.from({ length: 21 }, () => [1]), [Array(21).fill(1)]]) {
    assert.throws(() => problem.builder(input));
    assert.throws(() => problem.liveArgs(input));
  }
  for (const [rows, cols] of [[1, 20], [20, 1], [20, 20]]) {
    const matrix = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => r * cols + c));
    const run = problem.builder(matrix);
    assert.deepEqual(run.answer, walk(matrix).map(cell => cell.value));
    assert.equal(run.steps.at(-1).spiral54View.remainingCount, 0);
  }
});

function renderer() {
  const host = { innerHTML: "", querySelectorAll: () => [], querySelector: () => null };
  const context = {
    lang: "vi", $: () => host, pick: value => typeof value === "object" ? value?.[context.lang] : value,
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-spiral-matrix-54.js"), "utf8"), context);
  return { host, context };
}

test("54 pictures render every cell in both languages and stepping backward reproduces the same diagram", () => {
  const { host, context } = renderer();
  for (const language of ["vi", "en"]) for (const matrix of cases) {
    context.lang = language;
    const run = problem.builder(matrix);
    for (const step of run.steps) {
      context.renderSpiral54Pictures(step);
      assert.match(host.innerHTML, /class="sp54-viz/);
      assert.match(host.innerHTML, /sp54-output/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object|<p[ >]|<table/);
      assert.equal((host.innerHTML.match(/class="sp54-cell(?:[ "])/g) || []).length, matrix.length * matrix[0].length);
    }
    context.renderSpiral54Pictures(run.steps[0]); const first = host.innerHTML;
    context.renderSpiral54Pictures(run.steps.at(-1)); context.renderSpiral54Pictures(run.steps[0]);
    assert.equal(host.innerHTML, first);
  }
});

test("54 wires its dedicated pictures and lazy assets with line-by-line debugging", () => {
  assert.equal(problem.debugMode, "line-by-line");
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const prefix = script.slice(0, script.indexOf("\nfunction ", script.indexOf("const ORDERED_RENDERER_REGISTRY")));
  const context = { renderSpiral54Pictures: step => { context.rendered = step; } };
  vm.createContext(context);
  vm.runInContext(prefix + "\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;", context);
  const step = problem.builder("8").steps[0], entry = context.registry.find(item => item.predicate(step));
  assert.equal(entry.surface, "treeView"); entry.render(step); assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  for (const asset of ["spiral-matrix-54.css", "renderer-spiral-matrix-54.js"]) {
    assert.equal(html.split(asset + "?").length - 1, 1);
    assert.ok(!html.replace(/<template[\s\S]*?<\/template>/g, "").includes(asset));
  }
});
