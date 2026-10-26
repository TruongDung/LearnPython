"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { prepareDesignLiveRun } = require("../live-args");
const problem = require("../problems").SUPPORTED[295];
const WATCHES = ["num", "len(small)", "len(large)", "-small[0]", "large[0]", "median"];
const CASES = [[5], [1, 2], [5, 15, 1, 3, 8, 7, 9, 10, 20, 2], [5, 5, 5, 5, 5, 5], [-5, -10, 0, -5, 8, 3],
  [1, 2, 3, 4, 5, 6], [6, 5, 4, 3, 2, 1], [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0, -1]];
const medians = nums => nums.map((_, i) => {
  const sorted = nums.slice(0, i + 1).sort((a, b) => a - b), middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
});

test("295 preserves prefix medians, occurrence identities and transient two-heap invariants", () => {
  let seed = 295;
  const random = max => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % max; };
  const cases = [...CASES, ...Array.from({ length: 50 }, () => Array.from({ length: 1 + random(40) }, () => random(31) - 15))];
  const movements = new Set();
  for (const nums of cases) {
    const original = Object.freeze([...nums]), run = problem.builder(original), expected = medians(nums);
    assert.deepEqual(run.original, nums);
    assert.equal(run.answer, expected.at(-1));
    assert.deepEqual(run.steps.at(-1).medianFinder295View.medianHistory, expected);
    assert.equal(run.steps.filter(step => step.final).length, 1);
    let previousHistory = [];
    for (const step of run.steps) {
      const v = step.medianFinder295View, a = v.heaps.after.lower, b = v.heaps.after.upper, entries = [...a.entries, ...b.entries];
      assert.equal(step.codeLines.length, 1);
      assert.equal(step.codeLines[0], v.sourceLine);
      assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);
      assert.equal(entries.length, v.input.insertedCount);
      entries.forEach(entry => assert.equal(entry.value, nums[entry.inputIndex]));
      assert.deepEqual(a.storage.map(value => value === 0 ? 0 : value), a.entries.map(entry => entry.value === 0 ? 0 : -entry.value));
      assert.deepEqual(b.storage, b.entries.map(entry => entry.value));
      assert.ok(a.heapProperty && b.heapProperty);
      assert.deepEqual(step.vars.map(variable => variable.name), WATCHES);
      assert.deepEqual(step.vars.map(variable => variable.value), [v.operation.name === "addNum" ? v.operation.args[0] : "—",
        a.initialized ? a.size : "—", b.initialized ? b.size : "—", a.top ?? "—", b.top ?? "—", v.medianHistory.at(-1) ?? "—"]);
      if (v.movement.kind === "transfer") {
        const m = v.movement;
        movements.add(m.reason);
        assert.equal(m.storageBefore, m.from === "lower" ? -m.value : m.value);
        assert.equal(m.storageAfter, m.to === "lower" ? -m.value : m.value);
        assert.ok(v.heaps.before[m.from].entries.some(entry => entry.id === m.occurrence.id));
        assert.ok(v.heaps.after[m.to].entries.some(entry => entry.id === m.occurrence.id));
      }
      if (v.median.returned) {
        assert.ok(v.invariants.all);
        assert.equal(v.median.value, expected[v.input.operationIndex]);
        assert.equal(v.medianHistory.length, previousHistory.length + 1);
      } else assert.deepEqual(v.medianHistory, previousHistory);
      previousHistory = [...v.medianHistory];
    }
  }
  assert.deepEqual(movements, new Set(["partition-order", "small-too-large", "large-too-large"]));
});

test("295 heap storage at each executable line agrees with CPython and keeps design None results", () => {
  const payload = CASES.map(nums => ({ nums, code: problem.code.join("\n") }));
  const program = `
import copy, json, sys
runs = []
for case in json.load(sys.stdin):
    namespace = {}
    exec(case['code'], namespace)
    events, pending = [], None
    def snapshot(frame, line):
        obj = frame.f_locals['self']
        events.append({'line': line, 'method': frame.f_code.co_name, 'num': frame.f_locals.get('num'), 'small': copy.deepcopy(getattr(obj, 'small', None)), 'large': copy.deepcopy(getattr(obj, 'large', None))})
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_name not in ('__init__', 'addNum', 'findMedian'):
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
    finder = namespace['MedianFinder']()
    results = []
    for num in case['nums']:
        results.append(finder.addNum(num))
        results.append(finder.findMedian())
    sys.settrace(None)
    runs.append({'events': events, 'results': results})
print(json.dumps(runs))
`;
  const python = spawnSync(process.env.PYTHON || "python3", ["-c", program], { input: JSON.stringify(payload), encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  assert.equal(python.status, 0, python.stderr);
  JSON.parse(python.stdout).forEach((reference, index) => {
    const run = problem.builder(CASES[index]);
    // Definition-line frames mark method entry; actual Python execution starts at each method's body.
    const frames = run.steps.filter(step => ![3, 6, 14].includes(step.codeLines[0]));
    assert.equal(frames.length, reference.events.length);
    frames.forEach((step, i) => {
      const e = reference.events[i], v = step.medianFinder295View, a = v.heaps.after.lower, b = v.heaps.after.upper;
      assert.deepEqual(step.codeLines, [e.line]);
      assert.deepEqual(a.initialized ? a.storage.map(value => value === 0 ? 0 : value) : null, e.small, `small: case ${index}, event ${i}`);
      assert.deepEqual(b.initialized ? b.storage.map(value => value === 0 ? 0 : value) : null, e.large, `large: case ${index}, event ${i}`);
      assert.equal(step.vars[0].value, e.method === "addNum" ? e.num : "—");
    });
    assert.deepEqual(run.steps.at(-1).medianFinder295View.designResults, reference.results);
  });
});

test("295 validates 1–40 safe integers and preserves the class-based live runner", () => {
  assert.equal(problem.liveArgs, undefined);
  const nums = [1, 2, 3], config = prepareDesignLiveRun(problem, nums);
  assert.deepEqual(config, { className: "MedianFinder", constructorArgs: [], operations: nums.flatMap(num => [
    { name: "addNum", args: [num] }, { name: "findMedian", args: [] },
  ]) });
  assert.equal(problem.builder().answer, 7.5);
  assert.deepEqual(problem.parseMedianFinder295Input([-0, 0]), [0, 0]);
  for (const input of [null, "1,2", [], [NaN], [Infinity], [1.5], [true], ["1"], [null], [Number.MAX_SAFE_INTEGER + 1], Array(2), Array(41).fill(1)]) {
    assert.throws(() => problem.builder(input));
    assert.throws(() => prepareDesignLiveRun(problem, input));
  }
  const run = problem.builder(Array.from({ length: 40 }, (_, i) => i - 20));
  assert.equal(run.answer, -.5);
  assert.equal(run.steps.at(-1).medianFinder295View.medianHistory.length, 40);
});

function renderer(language) {
  const host = { innerHTML: "", querySelector: () => null };
  const context = { lang: language, $: () => host, escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-median-finder-295.js"), "utf8"), context);
  return { host, context };
}

test("295 pictures show actual heap nodes, the moved occurrence, sorted median positions and returned history", () => {
  for (const language of ["vi", "en"]) for (const nums of CASES) {
    const { host, context } = renderer(language), run = problem.builder(nums);
    for (const step of run.steps) {
      const before = JSON.stringify(step), v = step.medianFinder295View;
      context.renderMedianFinder295View(step);
      assert.match(host.innerHTML, /class="mf295p-viz/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object|<p[ >]|<table/);
      assert.equal((host.innerHTML.match(/class="mf295p-node /g) || []).length, v.input.insertedCount);
      assert.equal((host.innerHTML.match(/class="mf295p-sorted-token /g) || []).length, v.input.insertedCount);
      assert.equal((host.innerHTML.match(/class="mf295p-sorted-token [^"]* median"/g) || []).length, v.median.returned ? v.median.kind === "odd" ? 1 : 2 : 0);
      if (v.movement.kind === "transfer") {
        assert.match(host.innerHTML, new RegExp(`mf295p-direction">${v.movement.from === "lower" ? "→" : "←"}`));
        assert.ok(host.innerHTML.indexOf('<code class="lower">small</code>') < host.innerHTML.indexOf('<code class="upper">large</code>'));
        assert.ok(host.innerHTML.includes(`#${v.movement.occurrence.inputIndex + 1}`));
      }
      assert.equal(JSON.stringify(step), before);
    }
    context.renderMedianFinder295View(run.steps[0]); const first = host.innerHTML;
    context.renderMedianFinder295View(run.steps.at(-1)); context.renderMedianFinder295View(run.steps[0]);
    assert.equal(host.innerHTML, first);
  }
});

test("295 keeps its existing renderer registry and lazy theme assets", () => {
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const prefix = script.slice(0, script.indexOf("\nfunction ", script.indexOf("const ORDERED_RENDERER_REGISTRY")));
  const context = { renderMedianFinder295View: step => { context.rendered = step; } };
  vm.createContext(context); vm.runInContext(prefix + "\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;", context);
  const step = problem.builder([1]).steps[0], entry = context.registry.find(item => item.predicate(step));
  assert.equal(entry.surface, "treeView"); entry.render(step); assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  for (const asset of ["median-finder-295.css", "renderer-median-finder-295.js"]) {
    assert.equal(html.split(asset + "?").length - 1, 1);
    assert.ok(!html.replace(/<template[\s\S]*?<\/template>/g, "").includes(asset));
  }
  const css = fs.readFileSync(require.resolve("../public/median-finder-295.css"), "utf8");
  assert.match(css, /\[data-theme="light"\] \.mf295p-viz/);
  assert.match(css, /#varsPanel\.vars-panel[^}]*position: sticky/);
});
