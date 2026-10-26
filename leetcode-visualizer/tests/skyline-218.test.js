"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const problem = require("../problems").SUPPORTED[218];
const publicDir = path.join(__dirname, "..", "public");

const escape = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function renderer(language = "vi") {
  const treeView = { innerHTML: "", querySelector: () => null };
  const context = {
    lang: language,
    console,
    $: (id) => id === "treeView" ? treeView : null,
    escapeHtml: escape,
    escapeXml: escape,
    pick: (field) => field && typeof field === "object" ? field[language] : field,
  };
  vm.createContext(context);
  const source = fs.readFileSync(path.join(publicDir, "renderer-skyline-218.js"), "utf8");
  vm.runInContext(source, context);
  return { treeView, context };
}

function render(step, language = "vi") {
  const { treeView, context } = renderer(language);
  context.renderSkyline218Pictures(step);
  return treeView.innerHTML;
}

test("218 solves the published skyline example and edge cases", () => {
  assert.deepEqual(problem.builder(problem.defaultInput).answer, [
    [2, 10], [3, 15], [7, 12], [12, 0], [15, 10], [20, 8], [24, 0],
  ]);
  assert.deepEqual(problem.builder("0,2,3;2,5,3").answer, [[0, 3], [5, 0]]);
  assert.deepEqual(problem.builder("1,5,3;2,4,6").answer, [[1, 3], [2, 6], [4, 3], [5, 0]]);
  assert.deepEqual(problem.builder("1,4,4;1,4,7").answer, [[1, 7], [4, 0]]);
});

test("218 is a true one-line-at-a-time debugger", () => {
  const result = problem.builder(problem.defaultInput);
  assert.equal(problem.debugMode, "line-by-line");
  assert.ok(result.steps.length > 80);
  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  assert.ok(result.steps.every((step) => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  assert.ok(result.steps.every((step) => problem.code[step.codeLines[0] - 1].trim().length > 0));
  assert.equal(result.steps.filter((step) => step.final).length, 1);
  assert.equal(result.steps.at(-1).codeLines[0], 23);

  const phases = new Set(result.steps.map((step) => step.skylineView.phase));
  for (const phase of ["events", "sweep", "start-check", "push", "expire-check", "pop", "height", "compare", "append", "done"]) {
    assert.ok(phases.has(phase), `missing phase ${phase}`);
  }
  assert.ok(result.steps.every((step) => Array.isArray(step.skylineView.events)));
  assert.ok(result.steps.some((step) => step.skylineView.focusBuildingId !== null));
});

test("218 displayed Python agrees with the visualization", () => {
  const source = `${problem.code.join("\n")}\nprint(Solution().getSkyline([[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]]))\n`;
  const run = spawnSync("python3", ["-c", source], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout.trim(), "[[2, 10], [3, 15], [7, 12], [12, 0], [15, 10], [20, 8], [24, 0]]");
});

test("218 renderer is picture-first in both languages", () => {
  const result = problem.builder(problem.defaultInput);
  const samples = [
    result.steps[0],
    result.steps.find((step) => step.skylineView.phase === "push"),
    result.steps.find((step) => step.skylineView.phase === "pop"),
    result.steps.find((step) => step.skylineView.phase === "append"),
    result.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    for (const step of samples) {
      const html = render(step, language);
      for (const className of ["sk218-viz", "sk218-city", "sk218-heap-svg", "sk218-output", "sk218-operation"]) {
        assert.match(html, new RegExp(className));
      }
      assert.match(html, /HEAP/);
      assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object|<p[ >]|<table/);
    }
  }
});

test("218 ships responsive, theme-aware picture styles and cache busting", () => {
  const css = fs.readFileSync(path.join(publicDir, "skyline-218.css"), "utf8");
  const html = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");
  assert.match(css, /\.sk218-heap-node\.expired/);
  assert.match(css, /\.sk218-heap-node\.root/);
  assert.match(css, /#varsPanel\.vars-panel[^}]*position: sticky/);
  assert.match(css, /\[data-theme="light"\] \.sk218-viz/);
  assert.match(css, /@container skyline218 \(max-width: 350px\)/);
  for (const asset of ["skyline-218.css", "renderer-skyline-218.js"]) {
    assert.equal(html.split(asset + "?").length - 1, 1);
    assert.ok(!html.replace(/<template[\s\S]*?<\/template>/g, "").includes(asset));
  }
});

const CASES = [
  [[2, 9, 10], [3, 7, 15], [5, 12, 12], [15, 20, 10], [19, 24, 8]],
  [[0, 2, 3], [2, 5, 3]], [[0, 2, 3], [2, 5, 7]],
  [[1, 10, 10], [2, 3, 5], [4, 5, 4]],
  [[0, 9, 7], [0, 9, 7], [1, 8, 7], [2, 3, 9]],
  [[1, 6, 10], [2, 4, 10], [2, 5, 10], [3, 4, 12]],
  [[-6, -2, 3], [-3, 4, 7], [9, 12, 5]], [[2147483640, 2147483647, 2147483647]],
];

function oracle(buildings) {
  const events = [...new Set(buildings.flatMap(([left, right]) => [left, right]))].sort((a, b) => a - b), result = [];
  for (const x of events) {
    const height = Math.max(0, ...buildings.filter(([left, right]) => left <= x && x < right).map(building => building[2]));
    if (!result.length || result.at(-1)[1] !== height) result.push([x, height]);
  }
  return result;
}

test("218 matches an independent height-envelope oracle and keeps expired entries until heap-root removal", () => {
  let seed = 218;
  const random = max => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % max; };
  const cases = [...CASES];
  for (let sample = 0; sample < 100; sample++) cases.push(Array.from({ length: 1 + random(12) }, () => {
    const left = random(20) - 5; return [left, left + 1 + random(8), 1 + random(15)];
  }));
  let buriedExpired = false;
  for (const buildings of cases) {
    const immutable = Object.freeze(buildings.map(building => Object.freeze([...building])));
    const run = problem.builder(immutable);
    assert.deepEqual(run.answer, oracle(buildings));
    let previous = null;
    for (const step of run.steps) {
      const v = step.skylineView, line = step.codeLines[0];
      assert.deepEqual(v.skyline, v.locals.answer || []);
      assert.equal(v.heap.length, v.locals.heap?.length || 0);
      v.heap.forEach((entry, i) => {
        assert.equal(entry.expired, v.sweepX !== null && entry.right <= v.sweepX);
        assert.deepEqual([entry.height, entry.right], [v.buildings[entry.id][2], v.buildings[entry.id][1]]);
        if (i) {
          const parent = v.heap[Math.floor((i - 1) / 2)];
          assert.ok(parent.height > entry.height || parent.height === entry.height && parent.right <= entry.right);
          if (entry.expired && !v.heap[0].expired) buriedExpired = true;
        }
      });
      if (previous && line !== 13 && line !== 17) assert.deepEqual(v.heap.map(({ id, height, right }) => ({ id, height, right })), previous.heap.map(({ id, height, right }) => ({ id, height, right })));
      if (line === 17) {
        assert.equal(v.action.id, previous.heap[0].id);
        assert.ok(v.action.right <= v.sweepX);
        assert.equal(v.heap.length, previous.heap.length - 1);
      }
      if (line === 13) assert.equal(v.heap.length, previous.heap.length + 1);
      if ([19, 20, 21].includes(line)) {
        assert.ok(!v.heap.length || v.heap[0].right > v.sweepX);
        const expected = Math.max(0, ...v.activeBuildingIds.map(id => v.buildings[id][2]));
        assert.equal(v.currentHeight, expected);
      }
      if (previous && line !== 21) assert.deepEqual(v.skyline, previous.skyline);
      if (line === 21) assert.ok(!previous.skyline.length || previous.skyline.at(-1)[1] !== v.skyline.at(-1)[1]);
      previous = v;
    }
  }
  assert.ok(buriedExpired);
});

test("218 matches CPython after every line, including heapq tuple ties, stale height and for-loop exhaustion", () => {
  const cases = CASES.map(buildings => ({ buildings: problem.liveArgs(buildings)[0], code: problem.code.join("\n") }));
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
        if frame.f_code.co_name != 'getSkyline':
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
    answer = namespace['Solution']().getSkyline(case['buildings'])
    sys.settrace(None)
    runs.append({'answer': answer, 'events': events})
print(json.dumps(runs))
`;
  const python = spawnSync(process.env.PYTHON || "python3", ["-c", program], { input: JSON.stringify(cases), encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  assert.equal(python.status, 0, python.stderr);
  JSON.parse(python.stdout).forEach((reference, index) => {
    const run = problem.builder(cases[index].buildings);
    assert.deepEqual(run.answer, reference.answer);
    assert.equal(run.steps.length, reference.events.length);
    run.steps.forEach((step, i) => {
      const event = reference.events[i], v = step.skylineView, s = event.locals;
      assert.deepEqual(step.codeLines, [event.line]);
      assert.deepEqual(v.locals, s, `case ${index}, event ${i}, line ${event.line}`);
      assert.deepEqual(v.source, { line: event.line, text: problem.code[event.line - 1], timing: "after" });
      assert.deepEqual(step.vars.map(variable => variable.name), ["x", "i", "height", "heap[0]", "answer[-1]"]);
      assert.deepEqual(step.vars.map(variable => variable.value), [s.x ?? "—", s.i ?? "—", s.height ?? "—",
        s.heap?.length ? `(${s.heap[0].join(", ")})` : "—", s.answer?.length ? `[${s.answer.at(-1).join(", ")}]` : "—"]);
    });
  });
});

test("218 accepts sorted CSV/JSON/array live arguments, rejects malformed input and traces all 100 buildings", () => {
  const expected = [[1, 3, 4], [2, 5, 6]];
  for (const input of ["2,5,6;1,3,4", "2,5,6|1,3,4", "2,5,6\n1,3,4", [[2, 5, 6], [1, 3, 4]], "[[2,5,6],[1,3,4]]"]) {
    assert.deepEqual(problem.liveArgs(input), [expected]);
    assert.deepEqual(problem.builder(input).answer, oracle(expected));
  }
  for (const input of ["", null, [], [[]], [[1, 1, 4]], [[2, 1, 4]], [[1, 2, 0]], [[1, 2, -1]], [[1.5, 2, 4]], [[1, Infinity, 4]], [[1, 2, NaN]], [[1, 2, "4"]], [[1, 2, true]], [[1, 2, null]], [Array(3)], Array(2), "1,,4", "[[1,2,3]", Array.from({ length: 101 }, () => [1, 2, 3])]) {
    assert.throws(() => problem.builder(input)); assert.throws(() => problem.liveArgs(input));
  }
  const buildings = Array.from({ length: 100 }, (_, i) => [i * 2, i * 2 + 1, i + 1]);
  const run = problem.builder(buildings);
  assert.deepEqual(run.answer, oracle(buildings));
  assert.ok(run.steps.length > 1000);
  assert.equal(run.steps.filter(step => step.skylineView.phase === "push").length, 100);
  assert.equal(run.steps.filter(step => step.skylineView.phase === "pop").length, 100);
});

test("218 pictures preserve every heap node, identify expired entries and rewind without changing snapshots", () => {
  for (const language of ["vi", "en"]) for (const buildings of CASES) {
    const { treeView, context } = renderer(language), run = problem.builder(buildings);
    for (const step of run.steps) {
      const before = JSON.stringify(step), v = step.skylineView;
      context.renderSkyline218Pictures(step);
      assert.doesNotMatch(treeView.innerHTML, /undefined|NaN|Infinity|object Object|<p[ >]|<table/);
      assert.equal((treeView.innerHTML.match(/class="sk218-heap-node /g) || []).length, v.heap.length);
      assert.equal((treeView.innerHTML.match(/class="sk218-heap-node [^"]* expired /g) || []).length, v.heap.filter(entry => entry.expired).length);
      assert.equal((treeView.innerHTML.match(/class="sk218-key-point /g) || []).length, v.skyline.length);
      if (v.phase === "expire-done" && v.heap.length) assert.ok(treeView.innerHTML.includes(`R ${v.heap[0].right} &gt; x ${v.sweepX}`));
      assert.equal(JSON.stringify(step), before);
    }
    context.renderSkyline218Pictures(run.steps[0]); const first = treeView.innerHTML;
    context.renderSkyline218Pictures(run.steps.at(-1)); context.renderSkyline218Pictures(run.steps[0]);
    assert.equal(treeView.innerHTML, first);
  }
  const script = fs.readFileSync(path.join(publicDir, "script.js"), "utf8");
  const crowded = problem.builder(Array.from({ length: 100 }, (_, i) => [0, 100 + i, 100 - i]));
  const fullHeap = crowded.steps.find(step => step.skylineView.heap.length === 100);
  const fullHtml = render(fullHeap);
  assert.equal((fullHtml.match(/class="sk218-heap-node /g) || []).length, 100);
  assert.doesNotMatch(fullHtml, /undefined|NaN|Infinity/);
  const prefix = script.slice(0, script.indexOf("\nfunction ", script.indexOf("const ORDERED_RENDERER_REGISTRY")));
  const context = { renderSkyline218Pictures: step => { context.rendered = step; } };
  vm.createContext(context); vm.runInContext(prefix + "\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;", context);
  const step = problem.builder().steps[0], entry = context.registry.find(item => item.predicate(step));
  assert.equal(entry.surface, "treeView"); entry.render(step); assert.equal(context.rendered, step);
});
