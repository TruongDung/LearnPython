"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[2440];
const watches = ["parts", "target", "node", "carry", "subtotal[node]", "groups"];
const cases = [
  { nums: [6, 2, 2, 2, 6], edges: [[0, 1], [1, 2], [1, 3], [3, 4]], answer: 2 },
  { nums: [2], edges: [], answer: 0 },
  { nums: [1, 1, 1, 1], edges: [[0, 1], [1, 2], [2, 3]], answer: 3 },
  { nums: [1, 2, 1, 1, 1], edges: [[0, 1], [1, 2], [2, 3], [3, 4]], answer: 1 },
  { nums: [2, 1, 1, 1, 1, 2], edges: [[0, 1], [1, 2], [1, 3], [1, 4], [0, 5]], answer: 1 },
  { nums: [2, 2, 1, 1, 1], edges: [[0, 1], [1, 2], [2, 3], [3, 4]], answer: 0 },
  { nums: [50, 50], edges: [[1, 0]], answer: 1 },
];
const solve = item => problem.builder(item.nums, { edges: item.edges });

function exhaustive(nums, edges) {
  let answer = 0;
  for (let mask = 0; mask < 2 ** edges.length; mask++) {
    const parent = nums.map((_, node) => node);
    const find = node => { while (parent[node] !== node) node = parent[node]; return node; };
    edges.forEach(([a, b], index) => { if (!(mask & (1 << index))) parent[find(a)] = find(b); });
    const sums = new Map();
    nums.forEach((value, node) => { const root = find(node); sums.set(root, (sums.get(root) || 0) + value); });
    if (new Set(sums.values()).size === 1) answer = Math.max(answer, sums.size - 1);
  }
  return answer;
}

test("2440 maximizes removed edges, verified against every cut combination on small trees", () => {
  let seed = 2440;
  const random = bound => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % bound; };
  const items = [...cases];
  for (let trial = 0; trial < 120; trial++) {
    const n = random(8) + 1;
    items.push({ nums: Array.from({ length: n }, () => random(8) + 1), edges: Array.from({ length: n - 1 }, (_, i) => [i + 1, random(i + 1)]) });
  }
  for (const item of items) {
    const run = solve(item), final = run.steps.at(-1).equalComponents2440View;
    assert.equal(run.answer, exhaustive(item.nums, item.edges), JSON.stringify(item));
    if (item.answer !== undefined) assert.equal(run.answer, item.answer);
    assert.equal(final.closedGroups.length, run.answer + 1);
    assert.equal(final.cuts.length, run.answer);
    assert.deepEqual(final.closedGroups.flatMap(group => group.members).sort((a, b) => a - b), item.nums.map((_, node) => node));
    for (const group of final.closedGroups) {
      assert.equal(group.sum, final.target);
      assert.equal(group.members.reduce((sum, node) => sum + item.nums[node], 0), final.target);
      // Every displayed component remains connected after the displayed cuts.
      const members = new Set(group.members), reached = new Set([group.root]), queue = [group.root];
      for (const node of queue) for (const [a, b] of item.edges) {
        const other = a === node ? b : b === node ? a : -1;
        if (members.has(other) && !reached.has(other)) { reached.add(other); queue.push(other); }
      }
      assert.equal(reached.size, group.members.length);
    }
  }
});

test("2440 all executed lines, locals, and six fixed watches match CPython", () => {
  const program = problem.code.join("\n") + `
import copy, json, sys
runs = []
for case in json.load(sys.stdin):
    events, pending = [], None
    def snapshot(frame, line):
        state = copy.deepcopy({name: value for name, value in frame.f_locals.items() if name != 'self'})
        events.append({'line': line, 'state': state})
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_name != 'componentValue':
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
    answer = Solution().componentValue(case['nums'], case['edges'])
    sys.settrace(None)
    runs.append({'answer': answer, 'events': events})
assert Solution().componentValue([1] * 20000, [[i, i + 1] for i in range(19999)]) == 19999
print(json.dumps(runs))
`;
  const python = spawnSync("python3", ["-c", program], { input: JSON.stringify(cases), encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  assert.equal(python.status, 0, python.stderr);
  JSON.parse(python.stdout).forEach((expected, index) => {
    const run = solve(cases[index]);
    assert.equal(run.answer, expected.answer);
    assert.equal(run.steps.length, expected.events.length, `case ${index}`);
    run.steps.forEach((step, i) => {
      const v = step.equalComponents2440View, event = expected.events[i], s = event.state;
      assert.deepEqual(step.codeLines, [event.line], `case ${index}, step ${i}`);
      assert.equal(v.source.text, problem.code[event.line - 1]);
      assert.equal(v.source.timing, "after");
      assert.deepEqual(v.locals, s, `case ${index}, line ${event.line}`);
      assert.deepEqual(step.vars.map(variable => variable.name), watches);
      assert.deepEqual(step.vars.map(variable => variable.value), [s.parts ?? "—", s.target ?? "—", s.node ?? "—", s.carry ?? "—", s.subtotal?.[s.node] ?? "—", s.groups ?? "—"]);
    });
  });
});

test("2440 separates counting, cutting, and transferring; rejected trial cuts are reset", () => {
  for (const item of cases) {
    const run = solve(item);
    for (let i = 0; i < run.steps.length; i++) {
      const v = run.steps[i].equalComponents2440View;
      if (v.phase === "count") {
        const before = run.steps[i - 1].equalComponents2440View;
        assert.equal(v.groups, before.groups + 1);
        assert.deepEqual(v.cuts, before.cuts);
        assert.equal(v.closedGroups.length, v.groups - 1);
      }
      if (v.phase === "close") {
        assert.equal(v.carry, v.target);
        assert.equal(v.subtotal[v.node], 0);
        assert.equal(v.closedGroups.length, v.groups);
        assert.equal(v.closedGroups.at(-1).sum, v.target);
      }
      if (v.transfer) {
        assert.equal(v.transfer.before + v.transfer.amount, v.transfer.after);
        assert.equal(v.subtotal[v.transfer.to], v.transfer.after);
        assert.equal(v.subtotal[v.transfer.from], v.transfer.amount);
      }
      if (v.stage === "candidate") {
        assert.deepEqual(v.cuts, []);
        assert.deepEqual(v.closedGroups, []);
      }
    }
  }
  const oversized = solve(cases[4]);
  assert.ok(oversized.steps.some(step => {
    const v = step.equalComponents2440View;
    return v.phase === "overflow" && v.condition && v.carry === 4 && v.target === 2;
  }));
  assert.deepEqual(oversized.steps.at(-1).equalComponents2440View.attempts.map(item => item.status), ["failed", "indivisible", "success"]);
});

test("2440 retains full instruction traces at the visualization size limit", () => {
  for (const star of [false, true]) for (const uniform of [false, true]) {
    const item = { nums: Array.from({ length: 32 }, (_, i) => uniform ? 50 : i + 1), edges: Array.from({ length: 31 }, (_, i) => [star ? 0 : i, i + 1]) };
    const run = solve(item), v = run.steps.at(-1).equalComponents2440View;
    assert.ok(run.steps.length < problem.visualizationLimits.maxTraceSteps);
    assert.equal(v.traceTruncated, false);
    assert.equal(run.steps.filter(step => step.final).length, 1);
    if (uniform) assert.equal(run.answer, 31);
  }
});

test("2440 renderer shows transfers, scissors, exact-sum groups and reversible states in both languages", () => {
  const host = { innerHTML: "", querySelector: () => null };
  const context = { lang: "vi", $: () => host, escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-equal-value-components-2440.js"), "utf8"), context);
  for (const language of ["vi", "en"]) for (const item of cases) {
    context.lang = language;
    const run = solve(item);
    for (const step of run.steps) {
      context.renderEqualComponents2440View(step);
      const v = step.equalComponents2440View;
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object|<p[ >]|<table/);
      assert.equal((host.innerHTML.match(/class="ec2440-node[ "]/g) || []).length, item.nums.length);
      assert.equal((host.innerHTML.match(/class="ec2440-cut"/g) || []).length, v.cuts.length);
      assert.equal((host.innerHTML.match(/class="ec2440-component /g) || []).length, v.closedGroups.length);
      if (v.transfer?.amount > 0) assert.match(host.innerHTML, /class="ec2440-flow"/);
      if (v.phase === "overflow" && v.condition) assert.match(host.innerHTML, /ec2440-bucket overflow/);
      if (step.final) assert.match(host.innerHTML, new RegExp(`ec2440-result"><strong>✂ ${run.answer}`));
    }
    context.renderEqualComponents2440View(run.steps[0]);
    const first = host.innerHTML;
    context.renderEqualComponents2440View(run.steps.at(-1));
    context.renderEqualComponents2440View(run.steps[0]);
    assert.equal(host.innerHTML, first);
  }
});

test("2440 validates a positive-valued tree and prepares matching live arguments", () => {
  for (const [nums, edges] of [
    [[], []], [[0], []], [[51], []], [[1.5], []], [Array(33).fill(1), []],
    [[1, 2], []], [[1, 2], [[0, 0]]], [[1, 2], [[0, 2]]], [[1, 2], [[0, 1.5]]],
    [[1, 2, 3], [[0, 1], [1, 0]]], [[1, 2, 3, 4], [[0, 1], [1, 2], [2, 0]]],
  ]) assert.throws(() => problem.builder(nums, { edges }));
  assert.throws(() => problem.builder("[1]", null));
  assert.throws(() => problem.builder("[1]", { edges: "not json" }));
  assert.deepEqual(problem.liveArgs("6,2,2,2,6", { edges: "0,1;1,2;1,3;3,4" }), [cases[0].nums, cases[0].edges]);
  assert.equal(problem.builder().answer, 2);
});

test("2440 is registered with a dedicated renderer and lazy day/night assets", () => {
  assert.equal(problem.debugMode, "line-by-line");
  assert.equal(problem.slug, "create-components-with-same-value");
  assert.equal(problem.extraParams.find(param => param.key === "edges").type, "string");
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const prefix = script.slice(0, script.indexOf("\nfunction ", script.indexOf("const ORDERED_RENDERER_REGISTRY")));
  const context = { renderEqualComponents2440View: step => { context.rendered = step; } };
  vm.createContext(context);
  vm.runInContext(prefix + "\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;", context);
  const step = problem.builder().steps[0], entry = context.registry.find(item => item.predicate(step));
  assert.equal(entry.surface, "treeView");
  entry.render(step);
  assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  for (const asset of ["equal-value-components-2440.css", "renderer-equal-value-components-2440.js"]) {
    assert.equal(html.split(asset + "?").length - 1, 1);
    assert.ok(!html.replace(/<template[\s\S]*?<\/template>/g, "").includes(asset));
  }
});
