"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[74];
const WATCHES = ["target", "lo", "hi", "mid", "value"];
const cases = [
  [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]],
  [[5]], [[-5, -2, 0, 8, 19]], [[-5], [-2], [0], [8], [19]],
  [[-8, -8, -2], [0, 0, 6]], [[1, 2], [4, 6], [8, 10], [12, 14]],
];

test("74 agrees with a linear membership oracle across rectangular shapes and preserves search invariants", () => {
  const matrices = [...cases];
  for (let rows = 1; rows <= 8; rows++) for (let cols = 1; cols <= 8; cols++) {
    matrices.push(Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => r * (cols * 2 + 1) + c * 2 - 50)));
  }
  for (const matrix of matrices) {
    const flat = matrix.flat(), targets = new Set([flat[0], flat.at(-1), flat[Math.floor(flat.length / 2)], flat[0] - 1, flat.at(-1) + 1, flat[0] + 1]);
    for (const target of targets) {
      const immutable = Object.freeze(matrix.map(row => Object.freeze([...row])));
      const run = problem.builder(immutable, { target });
      assert.equal(run.answer, flat.includes(target));
      assert.deepEqual(run.original, matrix);
      assert.equal(run.steps.filter(step => step.final).length, 1);
      assert.ok(run.steps.at(-1).final);
      let previous = null;
      for (const step of run.steps) {
        const v = step.search74View, line = step.codeLines[0];
        assert.equal(step.codeLines.length, 1);
        assert.deepEqual(v.matrix, matrix);
        assert.equal(v.remaining, v.lo === null ? flat.length : Math.max(0, v.hi - v.lo + 1));
        assert.deepEqual(step.vars.map(variable => variable.name), WATCHES);
        assert.deepEqual(step.vars.map(variable => variable.value), WATCHES.map(name => v.locals[name] ?? "—"));
        if (v.mid !== null) assert.deepEqual(v.activeCell, [Math.floor(v.mid / v.cols), v.mid % v.cols]);
        if (line === 6) assert.equal(v.mid, Math.floor((v.lo + v.hi) / 2));
        if (line === 7) {
          assert.equal(v.value, flat[v.mid]);
          assert.equal(v.lastReadIndex, v.mid);
          assert.equal(v.inspected.length, previous.inspected.length + 1);
          assert.deepEqual(v.inspected.at(-1), { index: v.mid, row: Math.floor(v.mid / v.cols), col: v.mid % v.cols, value: flat[v.mid] });
        } else if (previous) {
          assert.deepEqual(v.inspected, previous.inspected);
          assert.equal(v.value, previous.value);
        }
        if (v.removed) {
          const d = v.removed;
          assert.deepEqual(d.before, [previous.lo, previous.hi]);
          assert.deepEqual(d.after, [v.lo, v.hi]);
          assert.equal(v.remaining, previous.remaining - (d.to - d.from + 1));
          assert.ok(v.remaining <= Math.floor(previous.remaining / 2));
          if (line === 11) { assert.ok(v.value < target); assert.equal(v.lo, v.mid + 1); }
          else { assert.equal(line, 13); assert.ok(v.value > target); assert.equal(v.hi, v.mid - 1); }
          assert.ok(flat.slice(d.from, d.to + 1).every(value => value !== target));
        } else if (previous && line !== 4) {
          assert.equal(v.lo, previous.lo); assert.equal(v.hi, previous.hi);
        }
        if (v.comparison) assert.equal(v.comparison.pass, v.comparison.operator === "==" ? v.value === target : v.value < target);
        previous = v;
      }
      assert.ok(run.steps.at(-1).search74View.inspected.length <= Math.floor(Math.log2(flat.length)) + 1);
    }
  }
});

test("74 snapshots match actual Python after every source line, including retained value after mid changes", () => {
  const payload = cases.flatMap(matrix => [matrix.flat()[0], matrix.flat().at(-1), matrix.flat()[0] - 1, matrix.flat()[0] + 1]
    .map(target => ({ matrix, target, code: problem.code.join("\n") })));
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
        if frame.f_code.co_name != 'searchMatrix':
            return trace
        if event == 'line':
            if pending is not None:
                snapshot(frame, pending)
            pending = frame.f_lineno
        elif event == 'return':
            snapshot(frame, pending)
            pending = None
        return trace
    sys.settrace(trace)
    answer = namespace['Solution']().searchMatrix(case['matrix'], case['target'])
    sys.settrace(None)
    runs.append({'answer': answer, 'events': events})
print(json.dumps(runs))
`;
  const python = spawnSync(process.env.PYTHON || "python3", ["-c", program], { input: JSON.stringify(payload), encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  assert.equal(python.status, 0, python.stderr);
  JSON.parse(python.stdout).forEach((reference, index) => {
    const run = problem.builder(payload[index].matrix, { target: payload[index].target });
    assert.equal(run.answer, reference.answer);
    assert.equal(run.steps.length, reference.events.length);
    run.steps.forEach((step, i) => {
      const event = reference.events[i], v = step.search74View;
      assert.deepEqual(step.codeLines, [event.line]);
      assert.deepEqual(v.locals, event.locals, `case ${index}, event ${i}, line ${event.line}`);
      assert.deepEqual(v.source, { line: event.line, text: problem.code[event.line - 1], timing: "after" });
    });
  });
});

test("74 validates sorted rectangular integer input and supplies matching live arguments", () => {
  const matrix = [[1, 1, 3], [5, 7, 9]];
  for (const input of [matrix, "1,1,3;5,7,9", "1,1,3|5,7,9", "1,1,3\n5,7,9", JSON.stringify(matrix)]) {
    assert.deepEqual(problem.liveArgs(input, { target: "7" }), [matrix, 7]);
    assert.equal(problem.builder(input, { target: "7" }).answer, true);
  }
  assert.equal(problem.builder().answer, true);
  for (const input of [null, "", [], [[]], [[1], [2, 3]], [[3, 1]], [[1, 4], [4, 5]], [[1, 4], [2, 5]], [[NaN]], [[Infinity]], [[1.5]], [["1"]], [[true]], [[null]], [[Number.MAX_SAFE_INTEGER + 1]], "1,,3", "[[1]", [Array(2)], Array(2), [Array(101).fill(1)], Array.from({ length: 101 }, (_, r) => [r])]) {
    assert.throws(() => problem.builder(input));
    assert.throws(() => problem.liveArgs(input));
  }
  for (const params of [null, [], { target: "" }, { target: true }, { target: null }, { target: 1.5 }, { target: Infinity }, { target: Number.MAX_SAFE_INTEGER + 1 }]) {
    assert.throws(() => problem.builder(matrix, params));
    assert.throws(() => problem.liveArgs(matrix, params));
  }
  const maximum = Array.from({ length: 100 }, (_, r) => Array.from({ length: 100 }, (_, c) => (r * 100 + c) * 2));
  for (const target of [0, 19998, 15151, 20000]) assert.equal(problem.builder(maximum, { target }).answer, maximum.flat().includes(target));
});

function renderer() {
  const canvas = { clientWidth: 200, clientHeight: 200, scrollTop: 0, scrollLeft: 0 };
  const host = { innerHTML: "", querySelector: () => canvas };
  const context = { lang: "vi", $: () => host, escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-search-matrix-74.js"), "utf8"), context);
  return { host, canvas, context };
}

test("74 pictures link matrix and flat indexes, reveal eliminated halves and reverse without losing state", () => {
  const { host, canvas, context } = renderer();
  for (const language of ["vi", "en"]) for (const matrix of cases) for (const target of [matrix.flat()[0], matrix.flat().at(-1), matrix.flat()[0] - 1]) {
    context.lang = language;
    const run = problem.builder(matrix, { target });
    for (const step of run.steps) {
      const before = JSON.stringify(step);
      context.renderSearchMatrix74Pictures(step);
      assert.match(host.innerHTML, /class="s74p-viz/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object|<p[ >]|<table/);
      assert.equal((host.innerHTML.match(/class="s74p-cell /g) || []).length, matrix.flat().length);
      assert.equal((host.innerHTML.match(/class="s74p-flat-cell /g) || []).length, matrix.flat().length);
      if (step.search74View.removed) assert.match(host.innerHTML, /s74p-drop-range/);
      if (step.search74View.phase === "found") assert.match(host.innerHTML, /s74p-return yes">True/);
      if (step.search74View.phase === "missing") assert.match(host.innerHTML, /s74p-return no">False/);
      assert.equal(JSON.stringify(step), before);
    }
    context.renderSearchMatrix74Pictures(run.steps[0]); const first = host.innerHTML;
    context.renderSearchMatrix74Pictures(run.steps.at(-1)); context.renderSearchMatrix74Pictures(run.steps[0]);
    assert.equal(host.innerHTML, first);
  }
  const matrix = Array.from({ length: 20 }, (_, r) => Array.from({ length: 20 }, (_, c) => r * 20 + c));
  context.renderSearchMatrix74Pictures(problem.builder(matrix, { target: 399 }).steps.at(-1));
  assert.equal((host.innerHTML.match(/class="s74p-flat-cell /g) || []).length, 18);
  assert.match(host.innerHTML, /s74p-ellipsis/);
  assert.ok(canvas.scrollTop > 0 && canvas.scrollLeft > 0);
});

test("74 dedicated renderer and its styles are selected through lazy assets", () => {
  assert.equal(problem.debugMode, "line-by-line");
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const prefix = script.slice(0, script.indexOf("\nfunction ", script.indexOf("const ORDERED_RENDERER_REGISTRY")));
  const context = { renderSearchMatrix74Pictures: step => { context.rendered = step; } };
  vm.createContext(context);
  vm.runInContext(prefix + "\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;", context);
  const step = problem.builder().steps[0], entry = context.registry.find(item => item.predicate(step));
  assert.equal(entry.surface, "treeView"); entry.render(step); assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  for (const asset of ["search-matrix-74.css", "renderer-search-matrix-74.js"]) {
    assert.equal(html.split(asset + "?").length - 1, 1);
    assert.ok(!html.replace(/<template[\s\S]*?<\/template>/g, "").includes(asset));
  }
});
