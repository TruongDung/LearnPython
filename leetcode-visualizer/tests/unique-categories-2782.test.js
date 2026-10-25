"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[2782];
const cases = [[1], [1, 1, 2, 2, 3, 3], [1, 2, 3, 4, 5], [1, 1, 1, 1, 1, 1], [9, 2, 9, 4, 2, 4], [0, -2, 0, -2], problem.defaultInput];

test("2782 discovers exactly one representative per category for all small partitions", () => {
  const inputs = [...cases];
  for (let n = 1; n <= 5; n++) {
    for (let mask = 0; mask < 3 ** n; mask++) {
      inputs.push(Array.from({ length: n }, (_, i) => Math.floor(mask / 3 ** i) % 3 + 1));
    }
  }
  for (const input of inputs) {
    const run = problem.builder(input);
    assert.equal(run.answer, new Set(input).size);
    assert.ok(run.calls <= input.length * (input.length - 1) / 2);
    const final = run.steps.at(-1);
    assert.equal(final.final, true);
    assert.equal(final.categories2782View.processed, input.length);
    const discovered = final.categories2782View.groups;
    assert.equal(discovered.length, run.answer);
    assert.equal(new Set(discovered.map(group => input[group.representative])).size, run.answer);
    for (const group of discovered) {
      assert.equal(group.representative, group.members[0]);
      assert.ok(group.members.every(index => input[index] === input[group.representative]));
    }
  }
});

test("2782 snapshots keep five watches and never reveal hidden labels", () => {
  const input = [8123, 4567, 8123, 9999, 4567];
  const run = problem.builder(input);
  for (const step of run.steps) {
    const v = step.categories2782View;
    assert.deepEqual(step.vars.map(variable => variable.name), ["i", "rep", "same", "reps", "count"]);
    assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
    assert.doesNotMatch(JSON.stringify(v), /8123|4567|9999/);
    const members = v.groups.flatMap(group => group.members).sort((a, b) => a - b);
    assert.deepEqual(members, Array.from({ length: v.processed }, (_, index) => index));
    for (let groupId = 0; groupId < v.groups.length; groupId++) {
      for (const index of v.groups[groupId].members) assert.equal(v.owners[index], groupId);
    }
    if (v.count !== null) assert.equal(v.count, v.groups.length - (v.phase === "new" ? 1 : 0));
    if (v.phase === "reply") {
      assert.ok(v.rep < v.i);
      assert.equal(v.feedback, input[v.i] === input[v.rep]);
    }
  }
  assert.deepEqual(run.steps[0].categories2782View.groups, []);
  assert.deepEqual(run.steps[0].vars.find(variable => variable.name === "reps").value, []);
});

test("2782 computes all 4950 worst-case queries but keeps large traces compact", () => {
  for (const input of [Array.from({ length: 100 }, (_, i) => i + 1), Array(100).fill(1)]) {
    const run = problem.builder(input);
    assert.equal(run.answer, new Set(input).size);
    assert.ok(run.steps.length <= 400);
    assert.ok(JSON.stringify(run).length < 1500000);
    assert.equal(run.steps.at(-1).categories2782View.detailed, false);
    assert.equal(run.calls, run.answer === 100 ? 4950 : 99);
  }
  for (const input of [[], null, "1,2", [1.5], [true], ["1"], [NaN], [Infinity], [Number.MAX_SAFE_INTEGER + 1], Array(101).fill(1)]) {
    assert.throws(() => problem.builder(input), /2782/);
    assert.throws(() => problem.liveArgs(input), /2782/);
  }
});

test("2782 renderer illustrates the oracle and groups in both languages and supports replay", () => {
  const host = { innerHTML: "" };
  const context = { lang: "vi", $: id => { assert.equal(id, "treeView"); return host; }, escapeHtml: value => String(value).replace(/[&<>"']/g, "_") };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-unique-categories-2782.js"), "utf8"), context);
  const run = problem.builder(problem.defaultInput);
  for (const language of ["vi", "en"]) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderUniqueCategories2782View(step);
      assert.match(host.innerHTML, /uc2782-viz/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|object Object/);
      if (step.categories2782View.phase === "reply") assert.match(host.innerHTML, step.categories2782View.feedback ? /is-same/ : /is-different/);
      if (step.categories2782View.phase === "count") assert.equal((host.innerHTML.match(/class="uc2782-group [^"]* selected"/g) || []).length, 1);
    }
    assert.equal((host.innerHTML.match(/class="uc2782-group tone-/g) || []).length, 3);
    context.renderUniqueCategories2782View(run.steps[0]);
    const initial = host.innerHTML;
    assert.match(initial, /unknown/);
    context.renderUniqueCategories2782View(run.steps.at(-1));
    context.renderUniqueCategories2782View(run.steps[0]);
    assert.equal(host.innerHTML, initial);
  }
});

test("2782 displayed Python runs through the real live tracer and CategoryHandler", () => {
  const liveSource = fs.readFileSync(require.resolve("../public/live-editor.js"), "utf8");
  const tracer = vm.runInNewContext(liveSource.match(/const TRACER_PY = (`[\s\S]*?`);/)[1]);
  const payload = { code: problem.code.join("\n"), cases: cases.map(input => ({ args: problem.liveArgs(input), answer: new Set(input).size })) };
  const program = tracer + `
import json, sys
payload = json.load(sys.stdin)
results = []
for case in payload['cases']:
    result = __viz_run_trace(payload['code'], 'numberOfCategories', case['args'])
    assert result['result'] == case['answer'], result
    assert result['trace']
    results.append(result['result'])
assert '8123' not in repr(CategoryHandler([8123, 4567]))
assert CategoryHandler([1, 2, 1]).haveTheSameCategory(0, 2)
assert not CategoryHandler([1, 2, 1]).haveTheSameCategory(0, 1)
ordinary = __viz_run_trace('class Solution:\\n    def twice(self, n):\\n        return n * 2', 'twice', [4])
assert ordinary['result'] == 8
guess = __viz_run_trace('class Solution:\\n    def probe(self, n):\\n        return guess(n)', 'probe', [6], None, {'type':'guess-number', 'n':10, 'pick':6})
assert guess['result'] == 0
print(json.dumps(results))
`;
  const run = spawnSync(process.env.PYTHON || (process.platform === "win32" ? "python" : "python3"), ["-c", program], { input: JSON.stringify(payload), encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(JSON.parse(run.stdout), cases.map(input => new Set(input).size));
});

test("2782 is registered with dedicated lazy assets and a renderer", () => {
  assert.equal(problem.premium, true);
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  assert.match(html, /unique-categories-2782\.css/);
  assert.match(html, /renderer-unique-categories-2782\.js/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /(?:renderer-)?unique-categories-2782\.(?:js|css)/);
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const prefix = script.slice(0, script.indexOf("\nfunction ", script.indexOf("const ORDERED_RENDERER_REGISTRY")));
  const context = { renderUniqueCategories2782View: step => { context.rendered = step; } };
  vm.createContext(context);
  vm.runInContext(prefix + "\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;", context);
  const step = problem.builder(problem.defaultInput).steps[0];
  const renderer = context.registry.find(entry => entry.predicate(step));
  assert.equal(renderer.surface, "treeView");
  renderer.render(step);
  assert.equal(context.rendered, step);
});
