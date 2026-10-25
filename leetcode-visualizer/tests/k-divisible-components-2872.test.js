"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[2872];
const watchNames = ["node", "k", "subtotal", "subtotal % k", "contribution[node]", "components"];
const examples = [
  { edges: [[0, 2], [1, 2], [1, 3], [2, 4]], values: [1, 8, 1, 4, 4], k: 6, answer: 2 },
  { edges: [], values: [6], k: 3, answer: 1 },
  { edges: [[0, 1], [1, 2], [2, 3]], values: [1, 1, 1, 1], k: 4, answer: 1 },
  { edges: [[0, 1], [0, 2], [0, 3], [0, 4]], values: [3, 3, 3, 3, 3], k: 3, answer: 5 },
];
const solve = item => problem.builder(item.edges, { values: item.values, k: item.k });

function exhaustive(edges, values, k) {
  let best = 0;
  for (let mask = 0; mask < 2 ** edges.length; mask++) {
    const parent = values.map((_, node) => node);
    const find = node => { while (parent[node] !== node) node = parent[node]; return node; };
    for (let i = 0; i < edges.length; i++) if (!(mask & (1 << i))) {
      const [a, b] = edges[i]; parent[find(a)] = find(b);
    }
    const sums = new Map();
    values.forEach((value, node) => { const root = find(node); sums.set(root, (sums.get(root) || 0) + value); });
    if ([...sums.values()].every(sum => sum % k === 0)) best = Math.max(best, sums.size);
  }
  return best;
}

test("2872 still maximizes the number of components, checked against every possible cut", () => {
  let seed = 2872;
  const random = bound => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % bound; };
  const cases = [...examples];
  for (let trial = 0; trial < 100; trial++) {
    const n = random(7) + 1, k = random(6) + 1;
    const edges = Array.from({ length: n - 1 }, (_, i) => [i + 1, random(i + 1)]);
    const values = Array.from({ length: n }, () => random(9) + 1);
    values[n - 1] += (k - values.reduce((sum, value) => sum + value, 0) % k) % k;
    cases.push({ edges, values, k });
  }
  for (const item of cases) {
    const run = solve(item);
    assert.equal(run.answer, exhaustive(item.edges, item.values, item.k));
    if (item.answer !== undefined) assert.equal(run.answer, item.answer);
    const last = run.steps.at(-1).kDivisible2872View;
    assert.equal(last.closedGroups.length, run.answer);
    assert.equal(last.cuts.length, run.answer - 1);
    assert.deepEqual(last.closedGroups.flatMap(group => group.members).sort((a, b) => a - b), item.values.map((_, node) => node));
    for (const group of last.closedGroups) {
      assert.equal(group.sum, group.members.reduce((sum, node) => sum + item.values[node], 0));
      assert.equal(group.sum % item.k, 0);
    }
  }
});

test("2872 pictures and six fixed watches follow merges, cuts, and zero contributions", () => {
  const run = solve(examples[0]);
  for (const step of run.steps) {
    const v = step.kDivisible2872View;
    assert.deepEqual(step.vars.map(variable => variable.name), watchNames);
    assert.equal(step.codeLines.length, 1);
    assert.ok(step.codeLines[0] > 0 && step.codeLines[0] <= problem.code.length);
    assert.equal(v.components, v.closedGroups.length + (v.phase === "count" ? 1 : 0));
    for (const group of v.closedGroups) assert.ok(group.members.every(node => v.processed.includes(node)));
    if (v.transfer) {
      assert.equal(v.transfer.before + v.transfer.amount, v.transfer.after);
      assert.equal(v.transfer.amount, v.contribution[v.transfer.from]);
      assert.equal(v.transfer.after, v.subtotal[v.transfer.to]);
    }
    if (v.phase === "cut") {
      assert.equal(v.remainder[v.activeNode], 0);
      assert.equal(v.contribution[v.activeNode], 0);
      assert.ok(v.cuts.some(cut => cut.child === v.activeNode));
    }
  }
  const zeroMerge = run.steps.find(step => step.kDivisible2872View.transfer?.amount === 0);
  assert.ok(zeroMerge);
  assert.equal(zeroMerge.kDivisible2872View.transfer.from, 1);
  assert.deepEqual(run.steps[0].kDivisible2872View.closedGroups, []);
  assert.ok(run.steps[0].kDivisible2872View.subtotal.every(sum => sum === null));
  assert.deepEqual(run.steps.at(-1).vars.map(variable => variable.value), [0, 6, 6, 0, 0, 2]);
});

test("2872 retains every executed line even for 96 nodes", () => {
  for (const star of [false, true]) {
    const item = { values: Array(96).fill(1), k: star ? 1 : 3, edges: Array.from({ length: 95 }, (_, i) => [star ? 0 : i, i + 1]) };
    const run = solve(item);
    assert.equal(run.answer, star ? 96 : 32);
    assert.ok(run.steps.length <= problem.visualizationLimits.maxTraceSteps);
    assert.ok(run.steps.length > 220);
    for (const step of run.steps) {
      assert.equal(step.codeLines.length, 1);
      assert.equal(step.kDivisible2872View.traceTruncated, false);
    }
    const last = run.steps.at(-1).kDivisible2872View;
    assert.equal(last.traceTruncated, false);
    assert.equal(last.processed.length, 96);
    assert.equal(last.closedGroups.length, run.answer);
    assert.equal(last.cuts.length, run.answer - 1);
  }
});

test("2872 renderer shows a tree, transfers, severed edges, and separate component pictures", () => {
  const host = { innerHTML: "", querySelector: () => null };
  const context = { lang: "vi", $: () => host, escapeHtml: value => String(value).replace(/[&<>"']/g, "_") };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-k-divisible-components-2872.js"), "utf8"), context);
  const run = solve(examples[0]);
  for (const language of ["vi", "en"]) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderKDivisibleComponents2872View(step);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
      assert.equal((host.innerHTML.match(/class="kd2872-node[ "]/g) || []).length, 5);
      assert.match(host.innerHTML, /class="kd2872-debugger"/);
      const v = step.kDivisible2872View;
      if (v.source.line === 7) assert.equal((host.innerHTML.match(/ pending/g) || []).length, 4);
      if (v.source.line === 9) {
        assert.match(host.innerHTML, /kd2872-indexed/);
        assert.match(host.innerHTML, / partial/);
      }
      if (v.stage === "dfs" && v.traversalParent) assert.match(host.innerHTML, /<code>parent<\/code>/);
      if (step.kDivisible2872View.phase === "carry") assert.match(host.innerHTML, /kd2872-flow/);
      if (step.kDivisible2872View.phase === "cut") assert.match(host.innerHTML, /class="kd2872-cut"/);
      if (step.kDivisible2872View.transfer?.amount === 0) assert.doesNotMatch(host.innerHTML, /<g class="kd2872-flow">/);
    }
    assert.equal((host.innerHTML.match(/class="kd2872-component /g) || []).length, 2);
    assert.match(host.innerHTML, /12 = 2 × 6/);
    assert.match(host.innerHTML, /6 = 1 × 6/);
    context.renderKDivisibleComponents2872View(run.steps[0]);
    const first = host.innerHTML;
    context.renderKDivisibleComponents2872View(run.steps.at(-1));
    context.renderKDivisibleComponents2872View(run.steps[0]);
    assert.equal(host.innerHTML, first);
  }
  const single = solve(examples[1]);
  context.renderKDivisibleComponents2872View(single.steps.at(-1));
  assert.doesNotMatch(host.innerHTML, /class="kd2872-cut"/);
});

test("2872 checks, increments, and cuts are separate reversible steps", () => {
  const run = solve(examples[0]);
  const cutIndex = run.steps.findIndex(step => step.kDivisible2872View.phase === "cut");
  const [check, count, cut] = run.steps.slice(cutIndex - 2, cutIndex + 1);
  assert.deepEqual([check, count, cut].map(step => step.codeLines), [[31], [32], [33]]);
  assert.equal(check.kDivisible2872View.condition, true);
  assert.equal(count.kDivisible2872View.components, check.kDivisible2872View.components + 1);
  assert.deepEqual(count.kDivisible2872View.cuts, check.kDivisible2872View.cuts);
  assert.equal(cut.kDivisible2872View.cuts.length, count.kDivisible2872View.cuts.length + 1);
  assert.equal(cut.kDivisible2872View.components, count.kDivisible2872View.components);
  assert.deepEqual(check.kDivisible2872View.closedGroups, []);
  assert.deepEqual(count.kDivisible2872View.closedGroups, []);
  assert.equal(cut.kDivisible2872View.closedGroups.length, 1);
  assert.equal(check.kDivisible2872View.cuts.length, 0);
});

test("2872 matches CPython line events and all local variables after every line", () => {
  const program = problem.code.join("\n") + `
import copy, json, sys
cases = json.load(sys.stdin)
runs = []
for args in cases:
    events = []
    returned = []
    def trace(frame, event, arg):
        if frame.f_code.co_name == 'maxKDivisibleComponents':
            state = copy.deepcopy({name: value for name, value in frame.f_locals.items() if name != 'self'})
            if event == 'line':
                events.append({'line': frame.f_lineno, 'locals': state})
            elif event == 'return':
                returned.append(state)
        return trace
    sys.settrace(trace)
    answer = Solution().maxKDivisibleComponents(*args)
    sys.settrace(None)
    runs.append({'answer': answer, 'steps': [
        {'line': before['line'], 'locals': events[index + 1]['locals'] if index + 1 < len(events) else returned[0]}
        for index, before in enumerate(events)
    ]})
print(json.dumps(runs))
`;
  // Unsorted, reversed edges catch accidental use of the layout's sorted DFS order.
  const cases = [...examples, { edges: [[3, 0], [1, 0], [4, 1], [2, 0]], values: [2, 3, 4, 5, 6], k: 5 }];
  const run = spawnSync(process.env.PYTHON || (process.platform === "win32" ? "python" : "python3"), ["-c", program], {
    input: JSON.stringify(cases.map(item => problem.liveArgs(item.edges, { values: item.values, k: item.k }))), encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stderr);
  const expectedRuns = JSON.parse(run.stdout);
  cases.forEach((item, index) => {
    const actual = solve(item), expected = expectedRuns[index];
    assert.equal(actual.answer, expected.answer);
    assert.deepEqual(actual.steps.map(step => step.codeLines[0]), expected.steps.map(step => step.line));
    actual.steps.forEach((step, eventIndex) => {
      const v = step.kDivisible2872View, line = step.codeLines[0];
      assert.deepEqual(v.locals, expected.steps[eventIndex].locals, `case ${index}, event ${eventIndex}, line ${line}`);
      assert.equal(v.source.line, line);
      assert.equal(v.source.text, problem.code[line - 1]);
      assert.equal(v.source.timing, "after");
      assert.equal(v.nextLine, expected.steps[eventIndex + 1]?.line ?? null);
      assert.equal(v.nextSource, v.nextLine === null ? null : problem.code[v.nextLine - 1]);
      const state = v.locals;
      assert.deepEqual(step.vars.map(variable => variable.value), [
        state.node ?? "—", state.k, state.subtotal ?? "—", state.subtotal === undefined ? "—" : state.subtotal % state.k,
        state.contribution?.[state.node] ?? "—", state.components ?? "—",
      ]);
    });
  });
});

test("2872 dedicated renderer is selected before the generic text-heavy view", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  for (const name of ["k-divisible-components-2872.css", "renderer-k-divisible-components-2872.js"]) assert.ok(html.includes(name));
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /(?:renderer-)?k-divisible-components-2872\.(?:css|js)/);
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const prefix = script.slice(0, script.indexOf("\nfunction ", script.indexOf("const ORDERED_RENDERER_REGISTRY")));
  const context = { renderKDivisibleComponents2872View: step => { context.rendered = step; } };
  vm.createContext(context);
  vm.runInContext(prefix + "\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;", context);
  const step = solve(examples[0]).steps[0];
  const renderer = context.registry.find(entry => entry.predicate(step));
  renderer.render(step);
  assert.equal(renderer.surface, "treeView");
  assert.equal(context.rendered, step);
});
