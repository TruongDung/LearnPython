"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[491];
const cases = [[4, 6, 7, 7], [4, 4, 3, 2, 1], [7, 7, 7], [0], [-100, -1, -1, 100], [3, 1, 2, 1], [5, 4, 3, 2], [-2, 0, -1, 0]];
const canonical = rows => rows.map(row => JSON.stringify(row)).sort();

test("491 matches independent subsequence enumeration without sorting, duplicates or input changes", () => {
  let seed = 491;
  const random = max => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % max; };
  const samples = [...cases, ...Array.from({ length: 45 }, () => Array.from({ length: 1 + random(7) }, () => random(7) - 3))];
  for (const nums of samples) {
    const original = [...nums], expected = new Set();
    for (let mask = 0; mask < 1 << nums.length; mask++) {
      const row = nums.filter((_, i) => mask & 1 << i);
      if (row.length >= 2 && row.every((value, i) => !i || value >= row[i - 1])) expected.add(JSON.stringify(row));
    }
    const run = problem.builder(nums);
    assert.deepEqual(canonical(run.answer), [...expected].sort());
    assert.equal(new Set(canonical(run.answer)).size, run.answer.length);
    assert.deepEqual(nums, original);
    assert.equal(run.steps.filter(s => s.final).length, 1);
    assert.ok(run.steps.at(-1).final);
    assert.deepEqual(run.steps.at(-1).subsequences491View.results.map(r => r.values), run.answer);
  }
});

test("491 traces every completed Python line with actual locals, recursive calls and exhausted loops", () => {
  const python = `import sys,json,copy
scope={};filename='<subsequences491>'
exec(compile(json.load(sys.stdin),filename,'exec'),scope)
runs=[]
for nums in ${JSON.stringify(cases)}:
 events=[];pending={}
 def trace(frame,event,arg):
  if frame.f_code.co_filename!=filename or frame.f_code.co_name not in ('findSubsequences','backtrack'):return trace
  if event in ('line','return'):
   if frame in pending:
    s=frame.f_locals
    events.append({'line':pending.pop(frame),'scope':frame.f_code.co_name,'current':copy.deepcopy(s.get('current')), 'result':copy.deepcopy(s.get('result',[])), 'start':s.get('start'), 'i':s.get('i'), 'used':sorted(s['used']) if 'used' in s else None})
   if event=='line':pending[frame]=frame.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().findSubsequences(nums);sys.settrace(None)
 runs.append({'events':events,'answer':answer})
print(json.dumps(runs))`;
  const proc = spawnSync("python3", ["-c", python], { input: JSON.stringify(problem.code.join("\n")), encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  assert.equal(proc.status, 0, proc.stderr);
  JSON.parse(proc.stdout).forEach((reference, index) => {
    const run = problem.builder(cases[index]);
    assert.deepEqual(run.answer, reference.answer);
    assert.equal(run.steps.length, reference.events.length);
    run.steps.forEach((step, i) => {
      const v = step.subsequences491View, e = reference.events[i];
      assert.deepEqual(step.codeLines, [e.line]);
      assert.equal(v.scope, e.scope); assert.deepEqual(v.current, e.current);
      assert.equal(v.start, e.start); assert.equal(v.i, e.i);
      assert.deepEqual(v.used === null ? null : [...v.used].sort((a, b) => a - b), e.used);
      assert.equal(v.resultCount, e.result.length);
      assert.deepEqual(v.results.map(r => r.values), e.result.slice(v.shownFrom));
      assert.deepEqual(step.vars.map(w => w.name), ["start", "i", "nums[i]", "current", "used", "len(result)"]);
      assert.deepEqual(step.vars.slice(0, 4).map(w => w.value), [e.start ?? "—", e.i ?? "—", e.i === null ? "—" : cases[index][e.i], e.current ?? "—"]);
    });
  });
});

test("491 keeps used local to each frame, allows equal values deeper down and restores current after pop", () => {
  const run = problem.builder([4, 6, 7, 7]); let previous;
  for (const step of run.steps) {
    const v = step.subsequences491View, f = v.stack.at(-1);
    assert.deepEqual(v.selected.map(i => v.nums[i]), v.current || []);
    assert.ok(v.selected.every((index, p) => !p || index > v.selected[p - 1]));
    if (v.action === "used-init") assert.deepEqual(f.used, []);
    if (v.action === "pop") {
      assert.deepEqual(v.current, previous.current.slice(0, -1));
      assert.deepEqual(v.used, previous.used);
    }
    if (v.action === "save") assert.deepEqual(v.results.at(-1).values, v.current);
    if (v.action === "candidate") assert.deepEqual(v.gates, { duplicate: null, order: null });
    if (v.action === "duplicate") assert.equal(v.gates.order, null);
    if (v.action === "skip-duplicate") assert.equal(v.gates.duplicate.pass, false);
    previous = v;
  }
  assert.ok(run.answer.some(row => JSON.stringify(row) === "[7,7]"));
  assert.ok(run.steps.some(s => s.subsequences491View.action === "skip-duplicate"));
  assert.equal(run.steps.filter(s => s.codeLines[0] === 6).length, 1);
  assert.deepEqual(run.steps.at(-1).subsequences491View.stack, []);
});

test("491 boundary input has a complete trace and accepts a frozen array; invalid inputs fail consistently", () => {
  const nums = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7]), run = problem.builder(nums);
  assert.equal(run.answer.length, 247);
  assert.ok(run.steps.length > 600);
  assert.equal(run.steps.at(-1).subsequences491View.results.length, 247);
  assert.deepEqual(problem.liveArgs(nums), [nums]);
  for (const invalid of [null, "4,6,7,7", [], [1.5], [Infinity], [NaN], ["7"], [Number.MAX_SAFE_INTEGER + 1], Array(9).fill(1)]) {
    assert.throws(() => problem.builder(invalid), /#491/); assert.throws(() => problem.liveArgs(invalid), /#491/);
  }
});

function renderer(lang) {
  const host = { innerHTML: "", querySelector: () => null }, context = { lang, $: () => host,
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-subsequences-491.js"), "utf8"), context);
  return step => { context.renderSubsequences491Pictures(step); return host.innerHTML; };
}

test("491 pictures preserve source indices, selected wires, local frames and saved sequences in both languages", () => {
  for (const lang of ["vi", "en"]) {
    const render = renderer(lang);
    for (const nums of cases) {
      const run = problem.builder(nums), before = JSON.stringify(run);
      for (const step of run.steps) {
        const v = step.subsequences491View, html = render(step);
        assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object|<p\b|<table\b/);
        assert.equal((html.match(/data-source-index=/g) || []).length, nums.length);
        assert.deepEqual([...html.matchAll(/data-selection-wire="(\d+)"/g)].map(m => Number(m[1])), v.selected);
        assert.deepEqual([...html.matchAll(/data-frame-id="(\d+)"/g)].map(m => Number(m[1])), v.stack.map(f => f.id));
        assert.deepEqual([...html.matchAll(/data-result-number="(\d+)"/g)].map(m => Number(m[1])), v.results.map(r => r.number));
        assert.deepEqual([...html.matchAll(/data-path-index="(\d+)" data-preview="false"/g)].map(m => Number(m[1])), v.selected);
      }
      const first = render(run.steps[0]); render(run.steps.at(-1)); assert.equal(render(run.steps[0]), first);
      assert.equal(JSON.stringify(run), before);
    }
  }
});

test("491 lazy assets, explicit line debug and scoped themes keep source lines horizontally scrollable", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8"), script = fs.readFileSync(require.resolve("../public/script.js"), "utf8"), css = fs.readFileSync(require.resolve("../public/subsequences-491.css"), "utf8");
  assert.equal(problem.debugMode, "line-by-line");
  assert.match(html, /subsequences-491\.css[^\n]*data-problem-ids="491"/);
  assert.match(html, /renderer-subsequences-491\.js[^\n]*data-problem-ids="491"/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /(?:renderer-)?subsequences-491\.(?:css|js)/);
  assert.match(script, /Boolean\(step.subsequences491View\)[^\n]*renderSubsequences491Pictures\(step\)/);
  assert.match(css, /\[data-theme="light"\] \.sq491-viz/);
  assert.match(css, /\.code-panel\s*\{[^}]*overflow-x:auto/);
  assert.match(css, /\.code-line\s*\{[^}]*white-space:pre/);
});
