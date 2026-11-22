"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[2124];

test("2124 handles every a/b string up to length 8 and maximum length", () => {
  for (let length = 1; length <= 8; length += 1) {
    for (let mask = 0; mask < 2 ** length; mask += 1) {
      const s = mask.toString(2).padStart(length, "0").replaceAll("0", "a").replaceAll("1", "b");
      assert.equal(problem.builder(s).answer, !s.includes("ba"), s);
    }
  }
  for (const s of ["a".repeat(100), "b".repeat(100), "a".repeat(50) + "b".repeat(50), "b".repeat(99) + "a"]) {
    const result = problem.builder(s);
    assert.equal(result.answer, !s.includes("ba"));
    assert.ok(result.steps.every(step => step.codeLines.length === 1));
    assert.equal(result.steps.at(-1).final, true);
  }
});

test("2124 trace agrees with executed Python lines and local variables", () => {
  const cases = ["a", "b", "ba", "ab", "aaabbb", "abab", "aababb", "bbba", "a".repeat(50) + "b".repeat(50)];
  const runner = `import sys, json
source, cases = json.load(sys.stdin)
namespace = {}
exec(compile(source, '<solution>', 'exec'), namespace)
results = []
for s in cases:
    events = []
    def trace(frame, event, arg):
        if frame.f_code.co_name == 'checkString' and event in ('line', 'return'):
            events.append({'event': event, 'line': frame.f_lineno, 'vars': {k:v for k,v in frame.f_locals.items() if k in ('i', 'ch', 'seen_b')}})
        return trace
    sys.settrace(trace)
    answer = namespace['Solution']().checkString(s)
    sys.settrace(None)
    executed = [{'line': events[j]['line'], 'vars': events[j+1]['vars']} for j in range(len(events)-1)]
    results.append({'answer': answer, 'executed': executed})
print(json.dumps(results))
`;
  const run = spawnSync("python3", ["-c", runner], { input: JSON.stringify([problem.code.join("\n"), cases]), encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  JSON.parse(run.stdout).forEach((python, index) => {
    const result = problem.builder(cases[index]);
    assert.equal(result.answer, python.answer);
    assert.deepEqual(result.steps.map(step => ({ line: step.codeLines[0], vars: Object.fromEntries(step.vars.map(variable => [variable.name, variable.value])) })), python.executed, cases[index]);
  });
});

test("2124 preserves earlier states and stops at the first a after b", () => {
  const result = problem.builder("aababb");
  const remembered = result.steps.find(step => step.aBeforeB2124View.phase === "remember-b");
  assert.equal(result.steps[0].aBeforeB2124View.seenB, false);
  assert.equal(remembered.aBeforeB2124View.firstB, 2);
  assert.equal(remembered.aBeforeB2124View.conflict, null);
  assert.deepEqual(result.steps.at(-1).aBeforeB2124View.conflict, { b: 2, a: 3 });
  assert.equal(result.steps.at(-1).aBeforeB2124View.processed, 4);
  assert.ok(result.steps.every(step => step.aBeforeB2124View.i === null || step.aBeforeB2124View.i <= 3));
  assert.deepEqual(result.steps.at(-1).codeLines, [8]);
  assert.equal(result.steps.filter(step => step.final).length, 1);
  assert.deepEqual(problem.liveArgs("aabb"), ["aabb"]);
});

test("2124 rejects invalid characters and length without trimming input", () => {
  for (const input of ["", "a".repeat(101), "AB", "abc", "a b", "ab\n", "\tab", null, ["a"]]) {
    assert.throws(() => problem.builder(input), /2124/);
    assert.throws(() => problem.liveArgs(input), /2124/);
  }
});

test("2124 renders both languages, both results, and long strings", () => {
  const host = { innerHTML: "", querySelector: () => ({ querySelector: () => null }), querySelectorAll: () => [] };
  const context = { lang: "vi", $: () => host, escapeHtml: String, stepIndex: 0, steps: [] };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-a-before-b-2124.js"), "utf8"), context);
  for (const language of ["vi", "en"]) {
    context.lang = language;
    for (const s of ["aaabbb", "aababb", "b", "a".repeat(100)]) {
      context.steps = problem.builder(s).steps;
      context.steps.forEach((step, index) => {
        context.stepIndex = index;
        context.renderABeforeB2124View(step);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
        assert.equal((host.innerHTML.match(/class="ab2124-cell /g) || []).length, s.length);
        assert.match(host.innerHTML, new RegExp(`(?:Dòng|Line) ${step.codeLines[0]}`));
      });
      assert.match(host.innerHTML, /ab2124-answer/);
      assert.match(host.innerHTML, /data-ab2124-preset="ba"/);
    }
  }
});
