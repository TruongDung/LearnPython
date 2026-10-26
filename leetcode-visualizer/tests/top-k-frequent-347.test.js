"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[347];
const WATCHES = ["k", "v", "f", "len(heap)", "heap[0]"];
const CASES = [
  { nums: [1, 1, 1, 2, 2, 3], k: 2 }, { nums: [7], k: 1 },
  { nums: [5, 4, 3, 2, 1, 0], k: 3 }, { nums: [-2, -2, 0, 0, 3, 3, -5], k: 2 },
  { nums: [8, 8, 8, 1, 1, 1, 4, 4, 4], k: 1 }, { nums: [3, 1, 2, 3, 2], k: 3 },
  { nums: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0, 0], k: 2 },
];
const frequency = nums => { const map = new Map(); nums.forEach(v => map.set(v, (map.get(v) || 0) + 1)); return map; };
const less = (a, b) => a.f < b.f || a.f === b.f && a.v < b.v;

test("347 agrees with frequency ranking and maintains a bounded tuple min-heap at every source line", () => {
  let seed = 347;
  const random = max => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % max; };
  const cases = [...CASES];
  for (let sample = 0; sample < 70; sample++) {
    const nums = Array.from({ length: 1 + random(60) }, () => random(15) - 7);
    cases.push({ nums, k: 1 + random(new Set(nums).size) });
  }
  for (const { nums, k } of cases) {
    const counts = frequency(nums), rank = [...counts].sort((a, b) => b[1] - a[1] || b[0] - a[0]).slice(0, k).map(([v]) => v);
    const run = problem.builder(Object.freeze([...nums]), { k });
    assert.deepEqual(run.original, nums);
    assert.deepEqual([...run.answer].sort((a, b) => a - b), rank.sort((a, b) => a - b));
    assert.equal(new Set(run.answer).size, k);
    assert.equal(run.steps.filter(step => step.final).length, 1);
    let previous = null;
    for (const step of run.steps) {
      const v = step.topK347View, line = step.codeLines[0];
      assert.equal(step.codeLines.length, 1);
      assert.ok(v.heap.length <= k + 1);
      assert.equal(new Set(v.heap.map(entry => entry.v)).size, v.heap.length);
      assert.deepEqual(v.heap.map(entry => [entry.f, entry.v]), v.locals.heap || []);
      v.heap.forEach((entry, i) => {
        assert.equal(entry.f, counts.get(entry.v));
        if (i) assert.ok(!less(entry, v.heap[Math.floor((i - 1) / 2)]));
      });
      assert.deepEqual(step.vars.map(variable => variable.name), WATCHES);
      assert.deepEqual(step.vars.map(variable => variable.value), [k, v.locals.v ?? "—", v.locals.f ?? "—", v.heapReady ? v.heap.length : "—", v.heap.length ? `(${v.heap[0].f}, ${v.heap[0].v})` : "—"]);
      if (v.action?.kind === "pop") {
        assert.equal(line, 10); assert.ok(previous.heap.length > k);
        assert.deepEqual(v.action, { kind: "pop", ...previous.heap[0] });
        assert.equal(v.heap.length, k);
      } else if (v.action?.kind === "push") {
        assert.equal(line, 8); assert.equal(v.heap.length, previous.heap.length + 1);
        assert.equal(v.action.v, v.locals.v); assert.equal(v.action.f, v.locals.f);
      } else if (previous) assert.deepEqual(v.heap, previous.heap);
      if (v.heap.length > k) assert.ok([8, 9].includes(line));
      if (line === 9) assert.equal(v.check, v.heap.length > k);
      if (v.counterReady) assert.deepEqual(v.frequencies.map(({ value, count }) => [value, count]), [...counts]);
      else assert.equal(v.frequencies.length, 0);
      previous = v;
    }
    assert.deepEqual(run.answer, run.steps.at(-1).topK347View.heap.map(entry => entry.v));
  }
});

test("347 matches CPython after each line, including equal-frequency tuple ties and loop exhaustion", () => {
  const payload = CASES.map(item => ({ ...item, code: problem.code.join("\n") }));
  const program = `
import copy, json, sys
runs = []
for case in json.load(sys.stdin):
    namespace = {}
    exec(case['code'], namespace)
    events, pending = [], None
    def snapshot(frame, line):
        events.append({'line': line, 'locals': copy.deepcopy({name: value for name, value in frame.f_locals.items() if name not in ('self', 'Counter', 'heapq')})})
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_name != 'topKFrequent':
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
    answer = namespace['Solution']().topKFrequent(case['nums'], case['k'])
    sys.settrace(None)
    runs.append({'answer': answer, 'events': events})
print(json.dumps(runs))
`;
  const python = spawnSync(process.env.PYTHON || "python3", ["-c", program], { input: JSON.stringify(payload), encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  assert.equal(python.status, 0, python.stderr);
  JSON.parse(python.stdout).forEach((reference, index) => {
    const run = problem.builder(CASES[index].nums, { k: CASES[index].k });
    assert.deepEqual(run.answer, reference.answer);
    assert.equal(run.steps.length, reference.events.length);
    run.steps.forEach((step, i) => {
      const e = reference.events[i], v = step.topK347View;
      assert.deepEqual(step.codeLines, [e.line]);
      assert.deepEqual(v.locals, e.locals, `case ${index}, event ${i}, line ${e.line}`);
      assert.deepEqual(v.source, { line: e.line, text: problem.code[e.line - 1], timing: "after" });
    });
  });
});

test("347 accepts CSV, JSON and arrays, validates k and traces all 100 distinct values", () => {
  for (const input of ["1,1,1,2,2,3", "[1,1,1,2,2,3]", [1, 1, 1, 2, 2, 3]]) {
    assert.deepEqual(problem.liveArgs(input, { k: "2" }), [[1, 1, 1, 2, 2, 3], 2]);
    assert.deepEqual(problem.builder(input, { k: "2" }).answer, [2, 1]);
  }
  assert.deepEqual(problem.builder("5").answer, [5]);
  assert.deepEqual(problem.liveArgs([-0, 0], { k: 1 }), [[0, 0], 1]);
  for (const input of ["", null, [], [NaN], [Infinity], [1.5], [true], [null], [Number.MAX_SAFE_INTEGER + 1], Array(2), "1,,2", "[1,2", Array(101).fill(1)]) {
    assert.throws(() => problem.builder(input)); assert.throws(() => problem.liveArgs(input));
  }
  for (const params of [null, [], new Date(), { k: 0 }, { k: -1 }, { k: 4 }, { k: 1.5 }, { k: Infinity }, { k: true }, { k: null }, { k: "" }]) {
    assert.throws(() => problem.builder("1,2,3", params)); assert.throws(() => problem.liveArgs("1,2,3", params));
  }
  const nums = Array.from({ length: 100 }, (_, i) => 100 - i);
  for (const k of [1, 20, 100]) {
    const run = problem.builder(nums, { k });
    assert.equal(run.steps.filter(step => step.topK347View.phase === "push").length, 100);
    assert.equal(run.answer.length, k);
    assert.deepEqual([...run.answer].sort((a, b) => b - a), nums.slice(0, k));
  }
});

function renderer(language) {
  const host = { innerHTML: "", querySelector: () => null };
  const context = { lang: language, $: () => host, escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-top-k-frequent-347.js"), "utf8"), context);
  return { host, context };
}

test("347 pictures show every frequency and actual heap node, including temporary k+1 and popped entries", () => {
  for (const language of ["vi", "en"]) for (const { nums, k } of CASES) {
    const { host, context } = renderer(language), run = problem.builder(nums, { k });
    for (const step of run.steps) {
      const v = step.topK347View, before = JSON.stringify(step);
      context.renderTopKFrequent347Pictures(step);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object|<p[ >]|<table/);
      assert.equal((host.innerHTML.match(/class="tk347p-bar /g) || []).length, v.frequencies.length);
      assert.equal((host.innerHTML.match(/class="tk347p-node /g) || []).length, v.heap.length);
      assert.equal((host.innerHTML.match(/class="tk347p-kept-token"/g) || []).length, v.heap.length);
      if (v.phase === "select") assert.match(host.innerHTML, /class="tk347p-bar pending focus/);
      if (v.action?.kind === "pop") assert.match(host.innerHTML, /class="tk347p-drop-mark"/);
      if (v.heap.length > k) assert.match(host.innerHTML, /tk347p-capacity over/);
      if (v.phase === "check" && v.check) assert.match(host.innerHTML, /class="tk347p-node root [^"]*preview/);
      assert.equal(JSON.stringify(step), before);
    }
    context.renderTopKFrequent347Pictures(run.steps[0]); const first = host.innerHTML;
    context.renderTopKFrequent347Pictures(run.steps.at(-1)); context.renderTopKFrequent347Pictures(run.steps[0]);
    assert.equal(host.innerHTML, first);
  }
  const { host, context } = renderer("vi"), run = problem.builder(Array.from({ length: 100 }, (_, i) => i), { k: 100 });
  context.renderTopKFrequent347Pictures(run.steps.at(-1));
  assert.equal((host.innerHTML.match(/class="tk347p-bar /g) || []).length, 100);
  assert.equal((host.innerHTML.match(/class="tk347p-node /g) || []).length, 100);
});

test("347 uses its dedicated renderer, fixed line debugger and lazy day/night assets", () => {
  assert.equal(problem.debugMode, "line-by-line");
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const prefix = script.slice(0, script.indexOf("\nfunction ", script.indexOf("const ORDERED_RENDERER_REGISTRY")));
  const context = { renderTopKFrequent347Pictures: step => { context.rendered = step; } };
  vm.createContext(context); vm.runInContext(prefix + "\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;", context);
  const step = problem.builder().steps[0], entry = context.registry.find(item => item.predicate(step));
  assert.equal(entry.surface, "treeView"); entry.render(step); assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  for (const asset of ["top-k-frequent-347.css", "renderer-top-k-frequent-347.js"]) {
    assert.equal(html.split(asset + "?").length - 1, 1);
    assert.ok(!html.replace(/<template[\s\S]*?<\/template>/g, "").includes(asset));
  }
  const css = fs.readFileSync(require.resolve("../public/top-k-frequent-347.css"), "utf8");
  assert.match(css, /\[data-theme="light"\] \.tk347p-viz/);
  assert.match(css, /#varsPanel\.vars-panel[^}]*position: sticky/);
});
