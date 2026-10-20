const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs"), vm = require("node:vm");
const problem = require("../problems").SUPPORTED[215];
const cases = [{ nums: [3, 2, 1, 5, 6, 4], k: 2 }, { nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 },
  { nums: [-5, -2, -8, -2, 0], k: 3 }, { nums: [7], k: 1 }, { nums: [2, 2, 2, 2], k: 2 },
  { nums: [9, 8, 7, 6, 5, 4], k: 6 }, { nums: [1, 2, 3, 4, 5, 6], k: 1 }];
let seed = 215;
const random = n => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % n; };
for (let i = 0; i < 100; i++) { const nums = Array.from({ length: random(30) + 1 }, () => random(21) - 10); cases.push({ nums, k: random(nums.length) + 1 }); }

test("215 answers and every completed iteration agree with a descending-sort oracle", () => {
  for (const { nums, k } of cases) {
    const run = problem.builder(nums.join(","), { k });
    assert.equal(run.answer, [...nums].sort((a, b) => b - a)[k - 1]);
    for (const step of run.steps) {
      const v = step.kthLargest215View;
      assert.equal(v.source, problem.code[v.line - 1].trim());
      assert.equal(step.codeLines.length, 1);
      for (let i = 1; i < v.heap.length; i++) assert.ok(v.heap[(i - 1) >> 1].value <= v.heap[i].value);
      if (v.event === "pop" || v.event === "check" && !v.overflow) {
        assert.deepEqual(v.heap.map(item => item.value).sort((a, b) => b - a), nums.slice(0, v.cursor + 1).sort((a, b) => b - a).slice(0, k));
        assert.equal(new Set([...v.heap.map(item => item.index), ...v.discarded]).size, v.cursor + 1);
      }
    }
    assert.equal(run.steps.at(-1).final, true);
    assert.deepEqual(run.steps[1].kthLargest215View.heap, []);
  }
});

test("215 each executed source line and all locals match CPython heapq, including equal children", () => {
  const python = `import sys, json, types
data = json.load(sys.stdin)
ns = {}
exec(compile(data['code'], '<k215>', 'exec'), ns)
def encode(value):
    if isinstance(value, (str, int, bool)) or value is None: return value
    if isinstance(value, list): return [encode(v) for v in value]
    if isinstance(value, dict): return {k: encode(v) for k, v in value.items()}
    if isinstance(value, types.ModuleType): return "<module 'heapq'>"
    return encode(vars(value))
out = []
for case in data['cases']:
    events, pending = [], None
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_filename != '<k215>': return trace
        if event in ('line', 'return'):
            if pending is not None: events.append({'line':pending, 'locals':encode(dict(frame.f_locals))})
            pending = frame.f_lineno if event == 'line' else None
        return trace
    sys.settrace(trace)
    answer = ns['Solution']().findKthLargest(case['nums'], case['k'])
    sys.settrace(None)
    out.append({'events':events, 'answer':answer})
print(json.dumps(out))
`;
  const process = spawnSync("python", ["-c", python], { input: JSON.stringify({ code: problem.code.join("\n"), cases }), encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  assert.equal(process.status, 0, process.stderr);
  JSON.parse(process.stdout).forEach((actual, i) => {
    const { nums, k } = cases[i], run = problem.builder(nums.join(","), { k });
    assert.equal(run.answer, actual.answer);
    assert.deepEqual(run.steps.map(s => ({ line: s.codeLines[0], locals: Object.fromEntries(s.vars.map(v => [v.name, v.rawValue])) })), actual.events, JSON.stringify(cases[i]));
  });
});

test("215 input validation and live arguments are consistent; large arrays compute complete answers", () => {
  for (const [input, k] of [["", 1], ["1,,2", 1], ["1,2", 0], ["1,2", 3], ["1,2", 1.5], ["10001", 1], ["[1,null]", 1]]) {
    assert.throws(() => problem.builder(input, { k }));
    assert.throws(() => problem.liveArgs(input, { k }));
  }
  assert.deepEqual(problem.liveArgs("[3,2,1]", { k: "2" }), [[3, 2, 1], 2]);
  for (const n of [41, 100000]) {
    const nums = Array.from({ length: n }, (_, i) => i % 100 - 50), k = 30;
    const run = problem.builder(nums.join(","), { k });
    assert.equal(run.answer, [...nums].sort((a, b) => b - a)[k - 1]);
    assert.equal(run.steps.length, 1);
    assert.deepEqual(run.steps[0].codeLines, []);
    assert.equal(run.steps[0].kthLargest215View.mode, "summary");
    assert.ok(run.steps[0].kthLargest215View.heap.length <= 24);
  }
});

test("215 renderer covers every frame in both languages and navigation jumps to actual trace steps", () => {
  const listeners = {}, host = { innerHTML: "", querySelector: selector => ({ addEventListener: (_, cb) => { listeners[selector] = cb; } }), querySelectorAll: () => [] };
  const context = { lang: "vi", $: () => host, escapeHtml: s => String(s).replaceAll("<", "&lt;").replaceAll('"', "&quot;"), stopPlay() {}, renderStep() {}, steps: [], stepIndex: 0 };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-kth-largest-215.js"), "utf8"), context);
  for (const lang of ["vi", "en"]) for (const { nums, k } of [...cases.slice(0, 7), { nums: Array(41).fill(2), k: 3 }]) {
    context.lang = lang;
    const run = problem.builder(nums.join(","), { k });
    for (const step of run.steps) {
      context.renderKthLargest215Pictures(step);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
      assert.match(host.innerHTML, /k215-tree/);
      if (step.kthLargest215View.removed) assert.match(host.innerHTML, /k215-decision removed/);
    }
    assert.match(host.innerHTML, /k215-answer/);
  }
  context.steps = problem.builder(problem.defaultInput, { k: 2 }).steps;
  context.stepIndex = context.steps.findIndex(s => s.kthLargest215View.cursor === 2);
  context.renderKthLargest215Pictures(context.steps[context.stepIndex]);
  listeners["[data-k215-finish]"]();
  assert.equal(context.steps[context.stepIndex].kthLargest215View.event, "pop");
  listeners["[data-k215-result]"]();
  assert.equal(context.stepIndex, context.steps.length - 1);
});
