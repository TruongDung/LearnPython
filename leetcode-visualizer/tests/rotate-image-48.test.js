"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[48];
const clone = matrix => matrix.map(row => [...row]);
const expected = matrix => matrix.map((row, r) => row.map((_, c) => matrix[matrix.length - 1 - c][r]));
const cases = [
  [[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]],
  [[8]], [[1, 1], [1, 1]], [[-1, 0], [2.5, -4]], [[0, 2, 0], [2, 0, 2], [0, 2, 0]],
];
const names = approach => approach === 1 ? ["n", "i", "j", "row"] : ["n", "i", "j", "n - 1 - j"];

test("48 both approaches agree with independent coordinate relocation and preserve the caller's input", () => {
  let seed = 48;
  const random = bound => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % bound; };
  const matrices = [...cases];
  for (let trial = 0; trial < 80; trial++) {
    const n = random(7) + 1;
    matrices.push(Array.from({ length: n }, () => Array.from({ length: n }, () => random(9) - 4)));
  }
  for (const matrix of matrices) for (const approach of [1, 2]) {
    const input = Object.freeze(matrix.map(row => Object.freeze([...row]))), run = problem.builder(input, { approach });
    assert.deepEqual(run.original, matrix);
    assert.deepEqual(run.answer, expected(matrix));
    assert.equal(run.steps.filter(step => step.final).length, 1);
    const final = run.steps.at(-1).rotate48View, n = matrix.length;
    assert.equal(final.transposeSwaps, n * (n - 1) / 2);
    assert.deepEqual(final.reversedRows, matrix.map((_, r) => r));
    final.ids.forEach((row, r) => row.forEach((id, c) => assert.equal(id, (n - 1 - c) * n + r)));
  }
  for (const matrix of cases) for (const approach of [1, 2]) {
    let current = clone(matrix);
    for (let i = 0; i < 4; i++) current = problem.builder(current, { approach }).answer;
    assert.deepEqual(current, matrix);
  }
});

test("48 traces agree with CPython line by line, including row aliases and implicit loop exhaustion", () => {
  const payload = [1, 2].flatMap(approach => cases.map(matrix => ({ approach, matrix, code: (approach === 1 ? problem.code : problem.code2).join("\n") })));
  const program = `
import copy, json, sys
runs = []
for case in json.load(sys.stdin):
    namespace = {}
    exec(case['code'], namespace)
    matrix = copy.deepcopy(case['matrix'])
    alias, rows = matrix, list(matrix)
    events, pending = [], None
    def snapshot(frame, line):
        events.append({'line': line, 'state': copy.deepcopy({name: value for name, value in frame.f_locals.items() if name != 'self'})})
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_name != 'rotate':
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
    result = namespace['Solution']().rotate(matrix)
    sys.settrace(None)
    assert result is None
    assert matrix is alias
    assert all(row is matrix[i] for i, row in enumerate(rows))
    runs.append({'matrix': matrix, 'events': events})
print(json.dumps(runs))
`;
  const python = spawnSync("python3", ["-c", program], { input: JSON.stringify(payload), encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  assert.equal(python.status, 0, python.stderr);
  JSON.parse(python.stdout).forEach((reference, index) => {
    const { matrix, approach } = payload[index], run = problem.builder(matrix, { approach });
    assert.deepEqual(run.answer, reference.matrix);
    assert.equal(run.steps.length, reference.events.length);
    run.steps.forEach((step, i) => {
      const v = step.rotate48View, e = reference.events[i], s = e.state;
      assert.deepEqual(step.codeLines, [e.line]);
      assert.equal(step.codeBlock, approach);
      assert.equal(v.source.text, payload[index].code.split("\n")[e.line - 1]);
      assert.equal(v.source.timing, "after");
      assert.deepEqual(v.locals, s, `approach ${approach}, line ${e.line}`);
      assert.deepEqual(v.matrix, s.matrix);
      assert.deepEqual(step.vars.map(variable => variable.name), names(approach));
      const mirror = s.j === undefined ? undefined : s.n - 1 - s.j;
      assert.deepEqual(step.vars.map(variable => variable.value), [s.n, s.i ?? "—", s.j ?? "—", ...(approach === 1
        ? [s.row ? `[${s.row.join(", ")}]` : "—"]
        : [mirror ?? "—"])]);
    });
  });
});

test("48 selects before swapping and tracks original cell identities even when values repeat", () => {
  for (const matrix of cases) for (const approach of [1, 2]) {
    const run = problem.builder(matrix, { approach }), n = matrix.length;
    for (let index = 0; index < run.steps.length; index++) {
      const v = run.steps[index].rotate48View, before = index ? run.steps[index - 1].rotate48View : null;
      v.ids.forEach((row, r) => row.forEach((id, c) => assert.equal(v.matrix[r][c], matrix[Math.floor(id / n)][id % n])));
      assert.equal(new Set(v.ids.flat()).size, n * n);
      if (before && !v.swap) {
        assert.deepEqual(v.matrix, before.matrix);
        assert.deepEqual(v.ids, before.ids);
      }
      if (v.swap?.a) {
        assert.equal(before.phase, "pair");
        const [ar, ac] = v.swap.a, [br, bc] = v.swap.b, result = clone(before.matrix), ids = clone(before.ids);
        [result[ar][ac], result[br][bc]] = [result[br][bc], result[ar][ac]];
        [ids[ar][ac], ids[br][bc]] = [ids[br][bc], ids[ar][ac]];
        assert.deepEqual(v.matrix, result); assert.deepEqual(v.ids, ids);
        assert.deepEqual(v.swap.before, [before.matrix[ar][ac], before.matrix[br][bc]]);
        if (v.swap.kind === "transpose") assert.ok(ar < ac && ar === bc && ac === br);
      }
      if (v.swap?.kind === "row-reverse") {
        const result = clone(before.matrix), ids = clone(before.ids);
        result[v.swap.row].reverse(); ids[v.swap.row].reverse();
        assert.deepEqual(v.matrix, result); assert.deepEqual(v.ids, ids);
      }
      if (v.stage === "transpose") for (let i = 0; i < n; i++) assert.equal(v.matrix[i][i], matrix[i][i]);
    }
  }
});

function renderer() {
  const host = { innerHTML: "", querySelectorAll: () => [], querySelector: () => null };
  const context = { lang: "vi", $: () => host, escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-rotate-image-48.js"), "utf8"), context);
  return { host, context };
}

test("48 pictures show both matrices, diagonal reflection, pair arrows and whole-row reversals", () => {
  const { host, context } = renderer();
  for (const language of ["vi", "en"]) for (const matrix of cases) for (const approach of [1, 2]) {
    context.lang = language;
    const run = problem.builder(matrix, { approach });
    for (const step of run.steps) {
      context.renderRotateImage48Pictures(step);
      const v = step.rotate48View;
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object|<p[ >]|<table/);
      assert.equal((host.innerHTML.match(/class="ri48-cell /g) || []).length, matrix.length ** 2 * 2);
      if (v.stage === "transpose") assert.match(host.innerHTML, /class="ri48-diagonal"/);
      else assert.doesNotMatch(host.innerHTML, /class="ri48-diagonal"/);
      if (v.swap?.a) assert.match(host.innerHTML, /ri48-arrows/);
      if (v.swap?.kind === "row-reverse") assert.match(host.innerHTML, /ri48-row-change/);
    }
    context.renderRotateImage48Pictures(run.steps[0]); const first = host.innerHTML;
    context.renderRotateImage48Pictures(run.steps.at(-1)); context.renderRotateImage48Pictures(run.steps[0]);
    assert.equal(host.innerHTML, first);
  }
});

test("48 clicking or keyboard-selecting a cell follows its origin without changing the debug snapshot", () => {
  const { host, context } = renderer(), listeners = {};
  const cell = { dataset: { ri48Id: "8", ri48Board: "current" }, addEventListener: (name, callback) => { listeners[name] = callback; } };
  host.querySelectorAll = () => [cell];
  const step = problem.builder(cases[0]).steps.at(-1), before = JSON.stringify(step);
  context.renderRotateImage48Pictures(step);
  const event = { preventDefault() {}, stopPropagation() {} };
  listeners.click(event);
  assert.match(host.innerHTML, /<code>\(2,2\)<\/code>/);
  assert.match(host.innerHTML, /<code>\(2,0\)<\/code>/);
  cell.dataset.ri48Id = "2";
  listeners.keydown({ ...event, key: "Enter" });
  assert.match(host.innerHTML, /<code>\(0,2\)<\/code>/);
  assert.match(host.innerHTML, /<code>\(2,2\)<\/code>/);
  assert.equal(JSON.stringify(step), before);
});

test("48 accepts square CSV, pipe, newline, JSON and array input and rejects invalid shapes", () => {
  for (const input of ["1,2;3,4", "1,2|3,4", "1,2\n3,4", "[[1,2],[3,4]]", [[1, 2], [3, 4]]]) {
    assert.deepEqual(problem.liveArgs(input), [[[1, 2], [3, 4]]]);
    assert.deepEqual(problem.builder(input).answer, [[3, 1], [4, 2]]);
  }
  for (const input of ["", null, [], [[1, 2]], [[1], [2]], [[NaN]], [[Infinity]], [["1"]], "1,,2;3,4,5", "[[1]", Array.from({ length: 21 }, () => Array(21).fill(1))]) assert.throws(() => problem.builder(input));
  for (const params of [null, { approach: 0 }, { approach: 3 }]) assert.throws(() => problem.builder("8", params));
  const matrix = Array.from({ length: 20 }, (_, r) => Array.from({ length: 20 }, (_, c) => r * 20 + c));
  for (const approach of [1, 2]) {
    const run = problem.builder(matrix, { approach });
    assert.deepEqual(run.answer, expected(matrix));
    assert.ok(run.steps.length < 1000);
  }
});

test("48 dedicated renderer replaces the shared view and its assets load only for problem 48", () => {
  assert.equal(problem.debugMode, "line-by-line");
  assert.equal(problem.extraParams.find(param => param.key === "approach").options.length, 2);
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const prefix = script.slice(0, script.indexOf("\nfunction ", script.indexOf("const ORDERED_RENDERER_REGISTRY")));
  const context = { renderRotateImage48Pictures: step => { context.rendered = step; } };
  vm.createContext(context);
  vm.runInContext(prefix + "\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;", context);
  const step = problem.builder("8").steps[0], entry = context.registry.find(item => item.predicate(step));
  assert.equal(entry.surface, "treeView"); entry.render(step); assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  for (const asset of ["rotate-image-48.css", "renderer-rotate-image-48.js"]) {
    assert.equal(html.split(asset + "?").length - 1, 1);
    assert.ok(!html.replace(/<template[\s\S]*?<\/template>/g, "").includes(asset));
  }
});
