const assert = require("node:assert/strict");
const { test } = require("node:test");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const vm = require("node:vm");
const problem = require("../problems").SUPPORTED[2416];

const cases = [["abc", "ab", "bc", "b"], ["abcd"], ["a", "a", "ab"], ["ab", "abc", "a"], ["x", "y", "z"], ["b", "aa", "ab", "abc"], ["a"]];
function oracle(words) {
  return words.map(word => Array.from({ length: word.length }, (_, index) => word.slice(0, index + 1)).reduce((total, prefix) => total + words.filter(other => other.startsWith(prefix)).length, 0));
}

test("2416 all scores match a prefix-scan oracle, including duplicates and prefixes that are complete words", () => {
  let seed = 2416;
  const samples = [...cases];
  function random(n) { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % n; }
  for (let trial = 0; trial < 100; trial++) samples.push(Array.from({ length: 1 + random(6) }, () => Array.from({ length: 1 + random(5) }, () => "abc"[random(3)]).join("")));
  for (const words of samples) {
    const before = [...words], run = problem.builder(words);
    assert.deepEqual(run.answer, oracle(words));
    assert.deepEqual(words, before);
    assert.equal(run.steps.at(-1).final, true);
    for (const step of run.steps) {
      assert.equal(step.codeLines.length, 1);
      const view = step.prefixScore2416View;
      assert.equal(view.source, problem.code[step.codeLines[0] - 1].trim());
      view.nodes.filter(node => node.parent !== null).forEach(node => {
        assert.equal(node.count, node.members.length);
        assert.ok(node.members.every(index => words[index].startsWith(node.prefix)));
      });
    }
    const final = run.steps.at(-1).prefixScore2416View;
    assert.equal(final.nodes[0].count, 0);
    assert.deepEqual(final.wordResults.map(result => result.terms.reduce((sum, term) => sum + term.count, 0)), run.answer);
  }
});

test("2416 every executed line, constructor and local variable matches CPython", () => {
  const source = `import sys, json
data = json.load(sys.stdin)
ns = {}
exec(compile(data['code'], '<ps2416>', 'exec'), ns)
def encode(value):
    if isinstance(value, (str, int, bool)) or value is None: return value
    if isinstance(value, list): return [encode(v) for v in value]
    if isinstance(value, dict): return {k: encode(v) for k, v in value.items()}
    return encode(vars(value))
output = []
for words in data['cases']:
    events, pending = [], {}
    def trace(frame, event, arg):
        if frame.f_code.co_filename != '<ps2416>': return trace
        key = id(frame)
        if event in ('line', 'return'):
            if key in pending:
                scope = 'TrieNode.__init__' if frame.f_code.co_name == '__init__' else frame.f_code.co_name
                events.append({'line': pending[key], 'scope': scope, 'locals': encode(dict(frame.f_locals))})
            if event == 'line': pending[key] = frame.f_lineno
            else: pending.pop(key, None)
        return trace
    sys.settrace(trace)
    answer = ns['Solution']().sumPrefixScores(list(words))
    sys.settrace(None)
    output.append({'answer': answer, 'events': events})
print(json.dumps(output))
`;
  const execution = spawnSync(process.env.PYTHON || "python", ["-c", source], { input: JSON.stringify({ code: problem.code.join("\n"), cases }), encoding: "utf8" });
  assert.equal(execution.status, 0, execution.stderr);
  JSON.parse(execution.stdout).forEach((actual, index) => {
    const run = problem.builder(cases[index]);
    assert.deepEqual(run.answer, actual.answer);
    const events = run.steps.map(step => ({ line: step.codeLines[0], scope: step.prefixScore2416View.scope,
      locals: Object.fromEntries(step.vars.map(variable => [variable.name, Object.hasOwn(variable, "rawValue") ? variable.rawValue : variable.value])) }));
    assert.deepEqual(events, actual.events, JSON.stringify(cases[index]));
  });
});

test("2416 count changes and score additions are recorded only after their Python assignment", () => {
  const run = problem.builder(cases[0]);
  const first = run.steps.find(step => step.prefixScore2416View.event === "increment");
  const previous = run.steps[run.steps.indexOf(first) - 1];
  assert.equal(previous.prefixScore2416View.nodes.find(node => node.prefix === "a").count, 0);
  assert.equal(first.prefixScore2416View.nodes.find(node => node.prefix === "a").count, 1);
  assert.deepEqual(first.prefixScore2416View.transition, { id: 1, before: 0, after: 1 });
  const scoreSteps = run.steps.filter(step => step.prefixScore2416View.wordIndex === 0 && step.prefixScore2416View.event === "add-score");
  assert.deepEqual(scoreSteps.map(step => step.prefixScore2416View.total), [2, 4, 5]);
  assert.deepEqual(scoreSteps.at(-1).prefixScore2416View.terms.map(term => term.count), [2, 2, 1]);
  assert.deepEqual(run.steps[0].vars[0].rawValue, { children: {} });
  assert.equal(run.steps[0].prefixScore2416View.nodes.length, 0);
});

test("2416 large inputs keep complete answers with an explicit summary and no fabricated debug lines", () => {
  for (const words of [Array(9).fill("abc"), ["a".repeat(41)], Array(1000).fill("a".repeat(1000))]) {
    const run = problem.builder(words);
    assert.equal(run.answer.length, words.length);
    assert.ok(run.answer.every(score => score === words.length * words[0].length));
    assert.equal(run.steps.length, 1);
    assert.equal(run.steps[0].prefixScore2416View.mode, "summary");
    assert.deepEqual(run.steps[0].codeLines, []);
    assert.ok(run.steps[0].prefixScore2416View.nodes.length <= 28);
  }
});

test("2416 keeps JSON, comma and semicolon inputs and real live-code arguments", () => {
  for (const input of ['["abc","ab","bc","b"]', "abc,ab,bc,b", "abc;ab;bc;b"]) {
    assert.deepEqual(problem.builder(input).answer, [5, 4, 3, 2]);
    assert.deepEqual(problem.liveArgs(input), [cases[0]]);
  }
  for (const input of [[], "", "a,,b", '["a",', ["A"], ["a.b"], Array(1001).fill("a"), ["a".repeat(1001)]]) assert.throws(() => problem.builder(input), /#2416/);
});

test("2416 all frames render without future score additions, in both languages and summary mode", () => {
  const host = { innerHTML: "", querySelectorAll: () => [] };
  const context = { lang: "vi", $: () => host, escapeHtml: value => String(value).replaceAll("<", "&lt;").replaceAll(">", "&gt;") };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-prefix-scores-2416.js"), "utf8"), context);
  for (const language of ["vi", "en"]) for (const words of [...cases, Array(9).fill("abc")]) {
    context.lang = language;
    const run = problem.builder(words);
    for (const step of run.steps) {
      context.renderPrefixScores2416Pictures(step);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
      assert.match(host.innerHTML, /p2416-tree/);
      if (step.prefixScore2416View.mode === "trace") assert.match(host.innerHTML, /p2416-line/);
      else assert.match(host.innerHTML, /p2416-summary/);
      if (step.prefixScore2416View.event === "increment") assert.match(host.innerHTML, /p2416-counter/);
    }
    assert.match(host.innerHTML, /p2416-answer/);
  }
  context.lang = "vi";
  const run = problem.builder(cases[0]);
  context.renderPrefixScores2416Pictures(run.steps.at(-1));
  assert.match(host.innerHTML, /\[5, 4, 3, 2\]/);
  const firstScoreMove = run.steps.find(step => step.prefixScore2416View.event === "score-move");
  context.renderPrefixScores2416Pictures(firstScoreMove);
  assert.match(host.innerHTML, /<code>total<\/code><span>0<\/span><span>=<\/span><b>0<\/b>/);
  const firstAdd = run.steps[run.steps.indexOf(firstScoreMove) + 1];
  context.renderPrefixScores2416Pictures(firstAdd);
  assert.match(host.innerHTML, /<code>total<\/code><span>2<\/span><span>=<\/span><b>2<\/b>/);
});
