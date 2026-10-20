const assert = require("node:assert/strict");
const { test } = require("node:test");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const vm = require("node:vm");
const problem = require("../problems").SUPPORTED[211];
const { prepareDesignLiveRun } = require("../live-args");

const cases = [
  ["bad,dad,mad", ".ad"], ["bad,dad,mad", "pad"], ["bad,dad,mad", "bad"], ["bad,dad,mad", "b.."],
  ["bat,dad,mad", ".ad"], ["bad", "ba"], ["a,ab,abc", "a."], ["a", "a."], ["a", ".."],
  ["dad,bad,mad", ".ad"], ["bad,bad,bag", "ba."], ["ab,ac", ".."], ["a", "b"],
];

function oracle(input, pattern) {
  return input.split(",").some(word => word.length === pattern.length && [...pattern].every((ch, i) => ch === "." || ch === word[i]));
}

test("211 agrees with a word-scan oracle, including prefixes, failed wildcards and insertion order", () => {
  let seed = 211;
  function random(n) { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % n; }
  const samples = [...cases];
  for (let trial = 0; trial < 100; trial++) {
    const words = Array.from({ length: 1 + random(5) }, () => Array.from({ length: 1 + random(5) }, () => "abc"[random(3)]).join(""));
    let dots = 0;
    const pattern = Array.from({ length: 1 + random(5) }, () => {
      if (dots < 2 && random(3) === 0) { dots++; return "."; }
      return "abc"[random(3)];
    }).join("");
    samples.push([words.join(","), pattern]);
  }
  for (const [input, pattern] of samples) {
    const run = problem.builder(input, { search: pattern });
    assert.equal(run.answer, oracle(input, pattern), `${input} / ${pattern}`);
    assert.equal(run.steps.at(-1).final, true);
    for (const step of run.steps) {
      assert.equal(step.codeLines.length, 1);
      assert.equal(step.wordDictionary211View.source, problem.code[step.codeLines[0] - 1].trim());
      const nodes = step.wordDictionary211View.nodes;
      for (const node of nodes) if (node.parent !== null) assert.ok(nodes.some(parent => parent.id === node.parent));
    }
  }
  const ordered = problem.builder("dad,bad,mad", { search: ".ad" }).steps.at(-1).wordDictionary211View;
  assert.deepEqual(ordered.branchLog.map(item => item.ch), ["d"]);
  const backtracked = problem.builder("bat,dad,mad", { search: ".ad" }).steps.at(-1).wordDictionary211View;
  assert.deepEqual(backtracked.branchLog.map(item => [item.ch, item.result]), [["b", false], ["d", true]]);
});

test("211 every constructor, addWord, search and recursive DFS line and local matches CPython", () => {
  const script = `import sys, json
data = json.load(sys.stdin)
ns = {}
exec(compile(data['source'], '<wd211>', 'exec'), ns)
def encode(value):
    if isinstance(value, (str, int, bool)) or value is None: return value
    if isinstance(value, dict): return {k: encode(v) for k, v in value.items()}
    if callable(value): return value.__name__
    return encode(vars(value))
results = []
for words, pattern in data['cases']:
    events, pending = [], {}
    def trace(frame, event, arg):
        if frame.f_code.co_filename != '<wd211>': return trace
        key = id(frame)
        if event in ('line', 'return'):
            if key in pending:
                scope = frame.f_code.co_name
                if scope == '__init__': scope = type(frame.f_locals['self']).__name__ + '.__init__'
                events.append({'line': pending[key], 'scope': scope, 'locals': encode(dict(frame.f_locals))})
            if event == 'line': pending[key] = frame.f_lineno
            else: pending.pop(key, None)
        return trace
    sys.settrace(trace)
    wd = ns['WordDictionary']()
    for word in words.split(','): wd.addWord(word)
    answer = wd.search(pattern)
    sys.settrace(None)
    results.append({'answer': answer, 'events': events})
print(json.dumps(results))
`;
  const execution = spawnSync(process.env.PYTHON || "python", ["-c", script], { input: JSON.stringify({ source: problem.code.join("\n"), cases }), encoding: "utf8" });
  assert.equal(execution.status, 0, execution.stderr);
  JSON.parse(execution.stdout).forEach((expected, index) => {
    const [input, pattern] = cases[index], run = problem.builder(input, { search: pattern });
    assert.equal(run.answer, expected.answer);
    assert.deepEqual(run.steps.map(step => ({ line: step.codeLines[0], scope: step.wordDictionary211View.scope,
      locals: Object.fromEntries(step.vars.map(variable => [variable.name, Object.hasOwn(variable, "rawValue") ? variable.rawValue : variable.value])) })), expected.events, `${input} / ${pattern}`);
  });
});

test("211 node creation, shared prefixes, word-end flags and DFS stack are immutable snapshots", () => {
  const run = problem.builder("bad,bag,bad", { search: "ba." });
  assert.equal(run.steps[0].wordDictionary211View.nodes.length, 0);
  assert.deepEqual(run.steps[0].vars[0].rawValue, { children: {} });
  const final = run.steps.at(-1).wordDictionary211View;
  assert.equal(final.nodes.length, 5);
  assert.deepEqual(final.nodes.filter(node => node.isWord).map(node => node.prefix), ["bad", "bag"]);
  assert.deepEqual(final.stack, []);
  const terminal = run.steps.find(step => step.wordDictionary211View.event === "terminal");
  assert.equal(terminal.wordDictionary211View.stack.length, 4);
  const reused = run.steps.filter(step => step.wordDictionary211View.event === "add-check" && step.title.en.startsWith("Line 13 · Reuse"));
  assert.ok(reused.length >= 5);
  const prefix = problem.builder("bad", { search: "ba" });
  assert.equal(prefix.steps.find(step => step.wordDictionary211View.event === "terminal").wordDictionary211View.result, false);
});

test("211 Edit & Run receives real WordDictionary operations and explicit visualization bounds", () => {
  const config = prepareDesignLiveRun(problem, "bat,dad,mad", { search: ".ad" });
  assert.equal(config.className, "WordDictionary");
  assert.deepEqual(config.operations, [{ name: "addWord", args: ["bat"] }, { name: "addWord", args: ["dad"] }, { name: "addWord", args: ["mad"] }, { name: "search", args: [".ad"] }]);
  for (const [input, pattern] of [["", ".ad"], ["a,,b", "a"], ["A", "a"], ["a.b", "a"], ["a", "..."], ["a", ""], ["a", "a*"], ["a".repeat(11), "a"]]) assert.throws(() => problem.builder(input, { search: pattern }), /#211/);
  assert.equal(problem.debugMode, "line-by-line");
});

test("211 all constructor, insertion, wildcard and return frames render in both languages", () => {
  const host = { innerHTML: "", querySelectorAll: () => [] };
  const context = { lang: "vi", $: () => host, escapeHtml: value => String(value).replaceAll("<", "&lt;").replaceAll(">", "&gt;") };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-word-dictionary-211.js"), "utf8"), context);
  for (const lang of ["vi", "en"]) for (const [input, pattern] of cases) {
    context.lang = lang;
    const run = problem.builder(input, { search: pattern });
    for (const step of run.steps) {
      context.renderWordDictionary211View(step);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
      assert.match(host.innerHTML, /w211-line/);
      if (step.wordDictionary211View.event === "backtrack") assert.match(host.innerHTML, /w211-branch failure/);
      if (step.wordDictionary211View.event === "mark-end") assert.match(host.innerHTML, /w211-terminal/);
    }
    assert.match(host.innerHTML, run.answer ? /✓ True/ : /× False/);
    assert.match(host.innerHTML, /data-w211-example="backtrack"/);
  }
});
