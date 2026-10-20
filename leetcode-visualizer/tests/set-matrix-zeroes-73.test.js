const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs"), vm = require("node:vm");
const problem = require("../problems").SUPPORTED[73];
const cases = [ [[1,1,1],[1,0,1],[1,1,1]], [[0,1,2,0],[3,4,5,2],[1,3,1,5]], [[1,0],[3,4]], [[1,2],[0,4]],
  [[0,2],[3,4]], [[1,2],[3,4]], [[0,0],[0,0]], [[0]], [[7]], [[1,0,3]], [[1],[0],[3]], [[-1,2,0],[3,4,-5]] ];
let seed = 73;
function random(n) { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % n; }
for (let i = 0; i < 80; i++) cases.push(Array.from({ length: random(5) + 1 }, () => Array(random(1) + 1)));
// Generate rectangular random cases, including many repeated zeroes.
for (let i = 12; i < cases.length; i++) { const m = random(5) + 1, n = random(6) + 1; cases[i] = Array.from({ length: m }, () => Array.from({ length: n }, () => random(5) - 2)); }
const build = (matrix, approach) => problem[approach === 1 ? "builder" : "builder2"](JSON.stringify(matrix));
function oracle(matrix) {
  const rows = new Set(), cols = new Set();
  matrix.forEach((row, r) => row.forEach((value, c) => { if (value === 0) { rows.add(r); cols.add(c); } }));
  return matrix.map((row, r) => row.map((value, c) => rows.has(r) || cols.has(c) ? 0 : value));
}

test("73 both approaches match an independent oracle without cascading newly written zeroes", () => {
  for (const matrix of cases) for (const approach of [1, 2]) {
    const run = build(matrix, approach), source = approach === 1 ? problem.code : problem.code2;
    assert.deepEqual(run.answer, oracle(matrix));
    assert.deepEqual(run.original, matrix);
    for (const step of run.steps) {
      const v = step.matrixZero73View;
      assert.equal(step.codeBlock, approach);
      assert.equal(v.source, source[v.line - 1].trim());
      assert.deepEqual(v.original, matrix);
      assert.deepEqual(step.vars.find(v => v.name === "matrix").rawValue, v.matrix);
    }
    assert.deepEqual(run.steps[0].matrixZero73View.matrix, matrix);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test("73 every method line and complete locals match CPython for both algorithms", () => {
  const python = `import sys, json
data = json.load(sys.stdin)
def encode(value):
    if isinstance(value, (str, int, bool)) or value is None: return value
    if isinstance(value, list): return [encode(v) for v in value]
    if isinstance(value, set): return sorted(value)
    if isinstance(value, dict): return {k: encode(v) for k, v in value.items()}
    return encode(vars(value))
out = []
for source in data['sources']:
    ns = {}
    exec(compile(source, '<m73>', 'exec'), ns)
    for matrix in data['cases']:
        matrix = [row[:] for row in matrix]
        events, pending = [], None
        def trace(frame, event, arg):
            global pending
            if frame.f_code.co_filename != '<m73>' or frame.f_code.co_name != 'setZeroes': return trace
            if event in ('line', 'return'):
                if pending is not None: events.append({'line':pending, 'locals':encode(dict(frame.f_locals))})
                pending = frame.f_lineno if event == 'line' else None
            return trace
        sys.settrace(trace)
        returned = ns['Solution']().setZeroes(matrix)
        sys.settrace(None)
        out.append({'events':events, 'matrix':matrix, 'returned':returned})
print(json.dumps(out))
`;
  const execution = spawnSync("python", ["-c", python], { input: JSON.stringify({ sources: [problem.code.join("\n"), problem.code2.join("\n")], cases }), encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.equal(execution.status, 0, execution.stderr);
  JSON.parse(execution.stdout).forEach((actual, index) => {
    const approach = index < cases.length ? 1 : 2, matrix = cases[index % cases.length], run = build(matrix, approach);
    assert.equal(actual.returned, null);
    assert.deepEqual(run.answer, actual.matrix);
    assert.deepEqual(run.steps.map(s => ({ line: s.codeLines[0], locals: Object.fromEntries(s.vars.map(v => [v.name, v.rawValue])) })), actual.events, JSON.stringify({ approach, matrix }));
  });
});

test("73 marker writes happen on separate lines and original edge flags never change", () => {
  const run = build(cases[0], 2), rowWrite = run.steps.find(s => s.matrixZero73View.line === 10), colWrite = run.steps.find(s => s.matrixZero73View.line === 11);
  assert.deepEqual(rowWrite.matrixZero73View.matrix, [[1,1,1],[0,0,1],[1,1,1]]);
  assert.deepEqual(colWrite.matrixZero73View.matrix, [[1,0,1],[0,0,1],[1,1,1]]);
  assert.deepEqual(rowWrite.matrixZero73View.cause, [1,1]);
  assert.deepEqual(rowWrite.matrixZero73View.active, [1,0]);
  for (const step of run.steps.filter(s => s.matrixZero73View.line >= 5)) {
    assert.equal(step.matrixZero73View.firstRow, false);
    assert.equal(step.matrixZero73View.firstCol, false);
  }
  const setRun = build(cases[0], 1), rowSet = setRun.steps.find(s => s.matrixZero73View.line === 8);
  assert.deepEqual(rowSet.matrixZero73View.markerRows, [1]);
  assert.deepEqual(rowSet.matrixZero73View.markerCols, []);
  assert.deepEqual(rowSet.matrixZero73View.matrix, cases[0]);
});

test("73 validation, live arguments and full answers for large matrices are consistent", () => {
  assert.deepEqual(problem.liveArgs("1,0;2,3"), [[[1,0],[2,3]]]);
  assert.deepEqual(problem.liveArgs("1,0|2,3"), [[[1,0],[2,3]]]);
  for (const input of ["", "1,,2;3,4,5", "1,2;3", "[[]]", "[[1,null]]", "2147483648", "1.5"]) {
    assert.throws(() => problem.builder(input));
    assert.throws(() => problem.liveArgs(input));
  }
  for (const size of [9, 200]) for (const approach of [1,2]) {
    const matrix = Array.from({ length: size }, () => Array(size).fill(2)); matrix[size - 1][size - 1] = 0;
    const run = build(matrix, approach), view = run.steps[0].matrixZero73View;
    assert.deepEqual(run.answer, oracle(matrix));
    assert.equal(run.steps.length, 1);
    assert.deepEqual(run.steps[0].codeLines, []);
    assert.equal(view.mode, "summary");
    assert.ok(view.matrix.length <= 6 && view.matrix[0].length <= 8);
  }
});

test("73 every frame renders in both languages, with mutation arrows and explicit previews", () => {
  const host = { innerHTML: "", querySelector: () => ({ addEventListener() {} }), querySelectorAll: () => [] };
  const context = { lang: "vi", $: () => host, escapeHtml: s => String(s).replaceAll('<', '&lt;').replaceAll('"', '&quot;') };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-set-matrix-zeroes-73.js"), "utf8"), context);
  for (const language of ["vi", "en"]) for (const matrix of [...cases.slice(0, 12), Array.from({ length: 9 }, () => Array(9).fill(0))]) for (const approach of [1,2]) {
    context.lang = language;
    const run = build(matrix, approach);
    for (const step of run.steps) {
      context.renderMatrixZero73Pictures(step);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
      assert.match(host.innerHTML, /m73-compare/);
      if (step.matrixZero73View.cause && step.matrixZero73View.changed) assert.match(host.innerHTML, /class="m73-arrow"/);
      if (step.matrixZero73View.changed) assert.match(host.innerHTML, /m73-change/);
    }
    assert.match(host.innerHTML, /m73-done/);
  }
});
