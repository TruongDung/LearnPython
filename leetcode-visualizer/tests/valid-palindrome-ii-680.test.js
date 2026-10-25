"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[680];
const watches = ["left", "right", "s[left]", "s[right]", "skip_left", "skip_right"];
const cases = [
  ["aba", true], ["abca", true], ["abc", false], ["eeeed", true], ["deeee", true],
  ["racecar", true], ["a", true], ["ab", true], ["abba", true], ["abcda", false],
  ["abcddcxba", true], ["AaA", true], ["abccbxba", false],
];
const palindrome = s => s === [...s].reverse().join("");
const oracle = s => palindrome(s) || [...s].some((_, index) => palindrome(s.slice(0, index) + s.slice(index + 1)));

test("680 matches examples and an independent exhaustive deletion oracle", () => {
  const inputs = cases.map(([s, expected]) => {
    assert.equal(oracle(s), expected, s);
    return s;
  });
  for (let length = 1; length <= 6; length++) {
    for (let code = 0; code < 3 ** length; code++) {
      let value = code, s = "";
      for (let i = 0; i < length; i++) { s += "abc"[value % 3]; value = Math.floor(value / 3); }
      inputs.push(s);
    }
  }
  for (const s of inputs) {
    const run = problem.builder(s), final = run.steps.at(-1).palindrome680View;
    assert.equal(run.answer, oracle(s), s);
    assert.equal(final.answer, run.answer);
    assert.equal(run.steps.filter(step => step.final).length, 1);
    if (run.answer) {
      assert.ok(palindrome(final.witness), s);
      assert.equal(final.witness, [...s].filter((_, index) => index !== final.deletedIndex).join(""));
      assert.ok(s.length - final.witness.length <= 1);
    } else assert.equal(final.witness, null);
  }
});

test("680 source lines, helper frames, locals and six fixed watches match CPython", () => {
  const program = problem.code.join("\n") + `
import copy, json, sys
runs = []
for s in json.load(sys.stdin):
    events, pending = [], {}
    def snapshot(frame, line):
        state = copy.deepcopy({name: value for name, value in frame.f_locals.items() if name not in ('self', 'is_palindrome')})
        events.append({'line': line, 'method': frame.f_code.co_name, 'state': state})
    def trace(frame, event, arg):
        if frame.f_code.co_name not in ('validPalindrome', 'is_palindrome'):
            return trace
        key = id(frame)
        if event == 'line':
            if key in pending:
                snapshot(frame, pending[key])
            pending[key] = frame.f_lineno
        elif event == 'return':
            snapshot(frame, pending[key])
            del pending[key]
        return trace
    sys.settrace(trace)
    answer = Solution().validPalindrome(s)
    sys.settrace(None)
    runs.append({'answer': answer, 'events': events})
print(json.dumps(runs))
`;
  const python = spawnSync("python3", ["-c", program], { input: JSON.stringify(cases.map(([s]) => s)), encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  assert.equal(python.status, 0, python.stderr);
  JSON.parse(python.stdout).forEach((expected, index) => {
    const s = cases[index][0], run = problem.builder(s);
    assert.equal(run.answer, expected.answer, s);
    assert.equal(run.steps.length, expected.events.length, s);
    let outer = {};
    run.steps.forEach((step, i) => {
      const v = step.palindrome680View, e = expected.events[i];
      if (e.method === "validPalindrome") outer = e.state;
      assert.deepEqual(step.codeLines, [e.line], `${s}: step ${i}`);
      assert.equal(v.source.text, problem.code[e.line - 1]);
      assert.equal(v.source.timing, "after");
      assert.equal(v.method, e.method);
      assert.deepEqual(v.locals, e.state, `${s}: line ${e.line}`);
      assert.deepEqual(step.vars.map(variable => variable.name), watches);
      assert.deepEqual(step.vars.map(variable => variable.value), [
        e.state.left ?? "—", e.state.right ?? "—", s[e.state.left] ?? "—", s[e.state.right] ?? "—",
        outer.skip_left ?? "—", outer.skip_right ?? "—",
      ], `${s}: watches at line ${e.line}`);
    });
  });
});

test("680 checks candidates independently and skips the right call when the left succeeds", () => {
  const left = problem.builder("abca");
  const final = left.steps.at(-1).palindrome680View;
  assert.deepEqual(final.branches.map(branch => [branch.status, branch.result]), [["done", true], ["skipped", null]]);
  assert.ok(left.steps.every(step => step.palindrome680View.activeSide !== "right"));
  assert.equal(left.steps.at(-1).vars.find(variable => variable.name === "skip_right").value, "—");
  for (const s of ["eeeed", "abc"]) {
    const run = problem.builder(s);
    const branches = run.steps.at(-1).palindrome680View.branches;
    assert.equal(branches[0].result, false);
    assert.equal(branches[1].result, s === "eeeed");
    for (const step of run.steps) {
      const v = step.palindrome680View;
      if (v.activeSide !== null) {
        const branch = v.branches.find(item => item.side === v.activeSide);
        assert.equal(v.removedIndex, branch.index);
        if (v.source.line === 5 && v.condition) {
          assert.notEqual(s[v.left], s[v.right]);
          assert.equal(v.branches.find(item => item.side === v.activeSide).result, null);
        }
      }
    }
  }
});

test("680 renderer illustrates mirrored pairs and both deletion candidates in both languages", () => {
  const host = { innerHTML: "" };
  const context = { lang: "vi", $: () => host, escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-valid-palindrome-ii-680.js"), "utf8"), context);
  for (const language of ["vi", "en"]) for (const [s] of cases) {
    context.lang = language;
    const run = problem.builder(s);
    for (const step of run.steps) {
      context.renderPalindrome680View(step);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object|<p[ >]|<table/);
      assert.equal((host.innerHTML.match(/class="vp680-node[ "]/g) || []).length, s.length);
      if (step.palindrome680View.branches.length) assert.equal((host.innerHTML.match(/class="vp680-branch /g) || []).length, 2);
      if (step.final) assert.match(host.innerHTML, run.answer ? /vp680-result passed/ : /vp680-result failed/);
    }
    context.renderPalindrome680View(run.steps[0]);
    const first = host.innerHTML;
    context.renderPalindrome680View(run.steps.at(-1));
    context.renderPalindrome680View(run.steps[0]);
    assert.equal(host.innerHTML, first);
  }
});

test("680 preserves accepted inputs and validates the visualization size", () => {
  for (const input of ["", null, "abc1", "a b", "a\n", "<tag>", "a".repeat(19)]) assert.throws(() => problem.builder(input));
  assert.equal(problem.builder("a".repeat(18)).answer, true);
  assert.equal(problem.builder("AaA").original, "AaA");
  assert.deepEqual(problem.liveArgs("abca"), ["abca"]);
});

test("680 dedicated renderer and lazy assets are registered", () => {
  const source = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const prefix = source.slice(0, source.indexOf("\nfunction ", source.indexOf("const ORDERED_RENDERER_REGISTRY")));
  const context = { renderPalindrome680View: step => { context.rendered = step; } };
  vm.createContext(context);
  vm.runInContext(prefix + "\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;", context);
  const step = problem.builder("abca").steps[0];
  const entry = context.registry.find(item => item.predicate(step));
  assert.equal(entry.surface, "treeView");
  entry.render(step);
  assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  for (const name of ["valid-palindrome-ii-680.css", "renderer-valid-palindrome-ii-680.js"]) {
    assert.equal(html.split(name + "?").length - 1, 1);
    assert.ok(!html.replace(/<template[\s\S]*?<\/template>/g, "").includes(name));
  }
});
