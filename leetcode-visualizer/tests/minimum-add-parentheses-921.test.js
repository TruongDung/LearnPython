"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[921];
const watches = ["i", "ch", "additions", "len(stack)", "additions + len(stack)"];
const cases = [["())", 1], ["(((", 3], ["()))((", 4], ["()()", 0], ["(()())", 0], [")(", 2], ["))", 2], ["()", 0], ["", 0]];
function depthOf(s) {
  let depth = 0;
  for (const ch of s) { depth += ch === "(" ? 1 : -1; if (depth < 0) return -1; }
  return depth;
}
function oracle(s) {
  // Grammar DP: a balanced result is a concatenation, or wraps an inner result.
  // Unmatched single characters each require one insertion. This uses no stack.
  if (!s.length) return 0;
  const dp = Array.from({ length: s.length }, () => Array(s.length).fill(0));
  for (let i = 0; i < s.length; i++) dp[i][i] = 1;
  for (let length = 2; length <= s.length; length++) for (let i = 0; i + length <= s.length; i++) {
    const j = i + length - 1;
    dp[i][j] = s[i] === "(" && s[j] === ")" ? length === 2 ? 0 : dp[i + 1][j - 1] : length;
    for (let split = i; split < j; split++) dp[i][j] = Math.min(dp[i][j], dp[i][split] + dp[split + 1][j]);
  }
  return dp[0][s.length - 1];
}

test("921 matches the examples and an independent grammar DP on all strings up to eight characters", () => {
  for (const [s, answer] of cases) assert.equal(problem.builder(s).answer, answer, s);
  for (let length = 0; length <= 8; length++) for (let mask = 0; mask < 2 ** length; mask++) {
    const s = Array.from({ length }, (_, i) => mask & (1 << i) ? "(" : ")").join("");
    const run = problem.builder(s), v = run.steps.at(-1).parentheses921View;
    assert.equal(run.answer, oracle(s), s);
    assert.equal(depthOf(v.repaired), 0, s);
    assert.equal(v.tokens.filter(token => !token.inserted).map(token => token.ch).join(""), s);
    assert.equal(v.tokens.filter(token => token.inserted).length, run.answer);
    assert.equal(v.tokens.length - s.length, run.answer);
    assert.equal(v.pairs.length * 2, v.tokens.length);
    const expectedOpen = new Map(v.pairs.map(pair => [pair.close, pair.open])), open = [];
    for (const token of v.tokens) {
      if (token.ch === "(") open.push(token.id);
      else assert.equal(expectedOpen.get(token.id), open.pop(), `${s}: displayed pair`);
    }
    assert.deepEqual(open, []);
  }
});

test("921 every source line, local variable and fixed watch agrees with CPython", () => {
  const program = problem.code.join("\n") + `
import copy, json, sys
runs = []
for s in json.load(sys.stdin):
    events, pending = [], None
    def snapshot(frame, line):
        events.append({'line': line, 'state': copy.deepcopy({name: value for name, value in frame.f_locals.items() if name != 'self'})})
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_name != 'minAddToMakeValid':
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
    answer = Solution().minAddToMakeValid(s)
    sys.settrace(None)
    runs.append({'answer': answer, 'events': events})
assert Solution().minAddToMakeValid('(' * 1000) == 1000
assert Solution().minAddToMakeValid(')' * 1000) == 1000
print(json.dumps(runs))
`;
  const python = spawnSync("python3", ["-c", program], { input: JSON.stringify(cases.map(([s]) => s)), encoding: "utf8" });
  assert.equal(python.status, 0, python.stderr);
  JSON.parse(python.stdout).forEach((expected, index) => {
    const run = problem.builder(cases[index][0]);
    assert.equal(run.answer, expected.answer);
    assert.equal(run.steps.length, expected.events.length);
    run.steps.forEach((step, i) => {
      const v = step.parentheses921View, e = expected.events[i], s = e.state;
      assert.deepEqual(step.codeLines, [e.line]);
      assert.equal(v.source.text, problem.code[e.line - 1]);
      assert.equal(v.source.timing, "after");
      assert.deepEqual(v.locals, s);
      assert.deepEqual(step.vars.map(variable => variable.name), watches);
      assert.deepEqual(step.vars.map(variable => variable.value), [s.i ?? "—", s.ch ?? "—", s.additions ?? "—", s.stack.length,
        s.additions === undefined ? "—" : s.additions + s.stack.length]);
    });
  });
});

test("921 only commits a push, match or insertion on its own source instruction", () => {
  for (const [s] of cases) {
    const run = problem.builder(s);
    for (let i = 1; i < run.steps.length; i++) {
      const v = run.steps[i].parentheses921View, before = run.steps[i - 1].parentheses921View;
      if (["read", "branch", "stack-check", "exhausted"].includes(v.phase)) {
        assert.deepEqual(v.stack, before.stack);
        assert.deepEqual(v.tokens, before.tokens);
        assert.equal(v.missingOpen, before.missingOpen);
      }
      if (v.phase === "push") assert.deepEqual(v.stack, [...before.stack, v.index]);
      if (v.phase === "pop") {
        assert.equal(v.popped, before.stack.at(-1));
        assert.deepEqual(v.stack, before.stack.slice(0, -1));
        assert.equal(v.focusPair.left, v.popped);
        assert.equal(v.tokens.length, before.tokens.length + 1);
      }
      if (v.phase === "insert") {
        assert.deepEqual(v.stack, []);
        assert.equal(v.missingOpen, before.missingOpen + 1);
        assert.equal(v.tokens.length, before.tokens.length + 2);
        assert.equal(v.tokens.at(-2).ch, "(");
        assert.equal(v.tokens.at(-2).before, v.index);
      }
      if (!run.steps[i].final) {
        assert.equal(v.tokens.filter(token => token.inserted).length, v.missingOpen);
        assert.equal(depthOf(v.tokens.map(token => token.ch).join("")), v.stack.length);
      } else {
        assert.deepEqual(v.locals, before.locals);
        assert.deepEqual(v.stack, before.stack);
        assert.equal(v.tokens.length - before.tokens.length, v.stack.length);
      }
      assert.deepEqual(v.tokens.filter(token => !token.inserted).map(token => token.index), Array.from({ length: v.processed }, (_, index) => index));
    }
  }
  const final = problem.builder("()))((").steps.at(-1).parentheses921View;
  assert.deepEqual(final.stack, [4, 5]);
  assert.deepEqual(final.pairs.filter(pair => pair.kind === "insert-close").map(pair => pair.left), [5, 4]);
});

test("921 renderer shows pairs, inserted parentheses and the true LIFO stack in both languages", () => {
  const host = { innerHTML: "" }, context = { lang: "vi", $: () => host, escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-minimum-add-parentheses-921.js"), "utf8"), context);
  for (const language of ["vi", "en"]) for (const s of [...cases.map(([input]) => input), "(".repeat(80), ")".repeat(80), "()".repeat(40)]) {
    context.lang = language;
    const run = problem.builder(s);
    for (const step of run.steps) {
      context.renderParentheses921View(step);
      const v = step.parentheses921View;
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object|<p[ >]|<table/);
      assert.equal((host.innerHTML.match(/class="pa921-input-token /g) || []).length, Math.min(s.length, 18));
      if (v.focusPair) assert.match(host.innerHTML, /pa921-bridge/);
      if (v.stack.length) {
        assert.match(host.innerHTML, new RegExp(`pa921-stack-item top.*?#${v.stack.at(-1)}`, "s"));
      }
      if (step.final) assert.match(host.innerHTML, /pa921-equation done/);
    }
    context.renderParentheses921View(run.steps[0]);
    const first = host.innerHTML;
    if (s.length > 18) assert.match(first, /s\[0\.\.17\]/);
    context.renderParentheses921View(run.steps.at(-1));
    context.renderParentheses921View(run.steps[0]);
    assert.equal(host.innerHTML, first);
  }
});

test("921 validates parentheses, trims surrounding whitespace and keeps live input at the original limit", () => {
  assert.equal(problem.builder("  ())  ").answer, 1);
  assert.equal(problem.builder(" ").answer, 0);
  for (const input of [null, 12, [], {}, "a", "[]", "() ()", "(".repeat(81)]) assert.throws(() => problem.builder(input));
  assert.equal(problem.builder("(".repeat(80)).answer, 80);
  assert.deepEqual(problem.liveArgs("(".repeat(1000)), ["(".repeat(1000)]);
  assert.throws(() => problem.liveArgs("(".repeat(1001)));
  assert.equal(problem.builder().answer, 4);
});

test("921 dedicated renderer and scoped day/night assets are registered", () => {
  assert.equal(problem.debugMode, "line-by-line");
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const prefix = script.slice(0, script.indexOf("\nfunction ", script.indexOf("const ORDERED_RENDERER_REGISTRY")));
  const context = { renderParentheses921View: step => { context.rendered = step; } };
  vm.createContext(context);
  vm.runInContext(prefix + "\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;", context);
  const step = problem.builder().steps[0], entry = context.registry.find(item => item.predicate(step));
  assert.equal(entry.surface, "treeView");
  entry.render(step);
  assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  for (const asset of ["minimum-add-parentheses-921.css", "renderer-minimum-add-parentheses-921.js"]) {
    assert.equal(html.split(asset + "?").length - 1, 1);
    assert.ok(!html.replace(/<template[\s\S]*?<\/template>/g, "").includes(asset));
  }
});
