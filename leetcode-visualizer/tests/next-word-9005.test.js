"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[9005];
const { prepareDesignLiveRun } = require("../live-args");
const watchNames = ["word", "nxt", "counts[word][nxt]", "winner[word]", "query"];
const cases = [
  { input: problem.defaultInput, query: "love", answer: "coding" },
  { input: "a zebra|a apple|a apple|a zebra", query: "a", answer: "apple" },
  { input: "I LOVE Coding | i love COFFEE", query: " LOVE ", answer: "coding" },
  { input: "one two|two three", query: "two", answer: "three" },
  { input: "one two", query: "two", answer: null },
  { input: "one two", query: "unknown", answer: null },
  { input: "hello", query: "hello", answer: null },
  { input: "a z|a ä", query: "a", answer: "z" },
  { input: "a 😀|a \ue000", query: "a", answer: "\ue000" },
  { input: "__proto__ constructor|__proto__ x", query: "__proto__", answer: "constructor" },
  { input: "x <tag>|x constructor", query: "x", answer: "<tag>" },
];

function reference(input, query) {
  const frequencies = new Map();
  for (const sentence of input.toLowerCase().split("|")) {
    const words = sentence.trim().split(/\s+/).filter(Boolean);
    for (let i = 1; i < words.length; i++) if (words[i - 1] === query.trim().toLowerCase()) {
      frequencies.set(words[i], (frequencies.get(words[i]) || 0) + 1);
    }
  }
  return [...frequencies.keys()].sort().sort((a, b) => frequencies.get(b) - frequencies.get(a))[0] ?? null;
}

test("9005 predicts by frequency, handles missing successors, and never crosses sentence boundaries", () => {
  for (const item of cases) assert.equal(problem.builder(item.input, { word: item.query }).answer, item.answer);
  const run = problem.builder("one two|two three", { word: "two" });
  assert.deepEqual(run.counts, { one: { two: 1 }, two: { three: 1 } });
  assert.equal(run.steps.at(-1).nextWord9005View.processedPairs, 2);
  let seed = 9005;
  const random = bound => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % bound; };
  const vocabulary = ["a", "bee", "cat", "dog", "egg"];
  for (let trial = 0; trial < 100; trial++) {
    const input = Array.from({ length: random(5) + 1 }, () => Array.from({ length: random(7) + 1 }, () => vocabulary[random(vocabulary.length)]).join(" ")).join("|");
    const query = random(6) === 5 ? "missing" : vocabulary[random(vocabulary.length)];
    assert.equal(problem.builder(input, { word: query }).answer, reference(input, query));
  }
});

test("9005 every source line, local variable and cached winner matches CPython", () => {
  const parsed = cases.map(item => problem.parseNextWord9005Input(item.input, { word: item.query }));
  const program = problem.code.join("\n") + `
import copy, json, sys
cases = json.load(sys.stdin)
runs = []
for case in cases:
    events, pending = [], {}
    def snapshot(frame, line):
        state = copy.deepcopy({name: value for name, value in frame.f_locals.items() if name != 'self'})
        cache = copy.deepcopy(getattr(frame.f_locals['self'], 'winner', None))
        events.append({'line': line, 'method': frame.f_code.co_name, 'state': state, 'cache': cache})
    def trace(frame, event, arg):
        if frame.f_code.co_name not in ('train', 'predict'):
            return trace
        if event == 'line':
            if id(frame) in pending:
                snapshot(frame, pending[id(frame)])
            pending[id(frame)] = frame.f_lineno
        elif event == 'return':
            snapshot(frame, pending[id(frame)])
            del pending[id(frame)]
        return trace
    instance = Predictor()
    sys.settrace(trace)
    instance.train(case['sentences'])
    answer = instance.predict(case['query'])
    sys.settrace(None)
    runs.append({'answer': answer, 'events': events})
print(json.dumps(runs))
`;
  const python = spawnSync("python3", ["-c", program], { input: JSON.stringify(parsed), encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  assert.equal(python.status, 0, python.stderr);
  JSON.parse(python.stdout).forEach((expected, caseIndex) => {
    const item = cases[caseIndex], run = problem.builder(item.input, { word: item.query });
    assert.equal(run.answer, expected.answer);
    assert.equal(run.steps.length, expected.events.length);
    run.steps.forEach((step, index) => {
      const v = step.nextWord9005View, e = expected.events[index], s = e.state;
      assert.deepEqual(step.codeLines, [e.line]);
      assert.equal(v.source.text, problem.code[e.line - 1]);
      assert.equal(v.source.timing, "after");
      assert.equal(v.method, e.method);
      assert.deepEqual(v.locals, s, `case ${caseIndex}, step ${index}`);
      assert.equal(v.cacheReady, e.cache !== null);
      assert.deepEqual(step.vars.map(variable => variable.name), watchNames);
      const own = (object, key) => object && Object.prototype.hasOwnProperty.call(object, key);
      const choices = own(s.counts, s.word) ? s.counts[s.word] : {};
      const winners = e.method === "predict" ? e.cache : s.winner;
      assert.deepEqual(step.vars.map(variable => variable.value), [
        s.word ?? "—", s.nxt ?? "—", own(choices, s.nxt) ? choices[s.nxt] : "—",
        own(winners, s.word) ? winners[s.word] : "—", parsed[caseIndex].query,
      ]);
      if (e.cache !== null) assert.deepEqual(Object.fromEntries(v.winners.map(entry => [entry.word, entry.next])), e.cache);
    });
  });
});

test("9005 pairs are selected before incrementing and cached only after training", () => {
  const run = problem.builder(problem.defaultInput, { word: "love" });
  for (let i = 0; i < run.steps.length; i++) {
    const v = run.steps[i].nextWord9005View;
    if (v.phase === "count") {
      const before = run.steps[i - 1].nextWord9005View;
      assert.equal(before.phase, "pair");
      assert.equal(v.increment.after, v.increment.before + 1);
      assert.equal(v.locals.counts[v.increment.word][v.increment.nxt], v.increment.after);
      assert.equal(v.processedPairs, before.processedPairs + 1);
      assert.deepEqual(v.activePair, before.activePair);
    }
    if (v.source.line < 9) assert.equal(v.cacheReady, false);
  }
  const final = run.steps.at(-1);
  assert.equal(final.final, true);
  assert.deepEqual(final.codeLines, [12]);
  assert.equal(final.nextWord9005View.prediction, "coding");
  assert.deepEqual(run.winner, { i: "love", love: "coding", we: "love" });
});

test("9005 validates visualization bounds and keeps a complete trace at the maximum word count", () => {
  for (const [input, params] of [
    ["", {}], ["|  |", {}], [[], {}], ["a b", { word: "" }], ["a b", { word: "two words" }],
    ["a b", { word: 2 }], ["a b", null], ["a".repeat(65), { word: "a" }],
    [Array(41).fill("a b").join("|"), { word: "a" }], [Array(241).fill("a").join(" "), { word: "a" }],
  ]) assert.throws(() => problem.builder(input, params));
  const run = problem.builder(Array(240).fill("echo").join(" "), { word: "echo" });
  assert.equal(run.answer, "echo");
  assert.equal(run.counts.echo.echo, 239);
  assert.ok(run.steps.length < problem.visualizationLimits.maxTraceSteps);
  assert.equal(run.steps.filter(step => step.nextWord9005View.phase === "count").length, 239);
});

test("9005 renderer illustrates adjacent pairs, tallies, ties and cache lookup in both languages", () => {
  const host = { innerHTML: "" };
  const context = { lang: "vi", $: () => host, escapeHtml: value => String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-next-word-9005.js"), "utf8"), context);
  for (const language of ["vi", "en"]) for (const item of cases) {
    context.lang = language;
    const run = problem.builder(item.input, { word: item.query });
    for (const step of run.steps) {
      context.renderNextWord9005View(step);
      const html = host.innerHTML, v = step.nextWord9005View;
      assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object|<p[ >]|<table|<tag>/);
      assert.match(html, /class="np9005-branches"/);
      if (v.phase === "count") assert.match(html, /fresh/);
      if (v.focusWinner !== null && v.choices.filter(choice => choice.count === v.choices[0].count).length > 1) assert.match(html, /class="np9005-tie"/);
      if (step.final && v.prediction !== null) {
        assert.match(html, /class="predicted"/);
        assert.match(html, /np9005-cache-entry lookup/);
      }
      if (step.final && v.prediction === null) assert.match(html, /class="missing"/);
    }
    context.renderNextWord9005View(run.steps[0]);
    const first = host.innerHTML;
    context.renderNextWord9005View(run.steps.at(-1));
    context.renderNextWord9005View(run.steps[0]);
    assert.equal(host.innerHTML, first);
  }
  const large = problem.builder(Array(30).fill("a").join(" "), { word: "a" });
  context.renderNextWord9005View(large.steps.at(-1));
  assert.match(host.innerHTML, /class="np9005-bar"/);
});

test("9005 snippet runs train then predict through the real live design tracer", () => {
  const source = fs.readFileSync(require.resolve("../public/live-editor.js"), "utf8");
  const tracer = vm.runInNewContext(source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1]);
  const payload = cases.map(item => ({
    code: problem.code.join("\n"), config: prepareDesignLiveRun(problem, item.input, { word: item.query }), answer: item.answer,
  }));
  for (const item of payload) {
    assert.equal(item.config.className, "Predictor");
    assert.equal(item.config.resultMode, "last");
    assert.deepEqual(item.config.operations.map(operation => operation.name), ["train", "predict"]);
  }
  const program = tracer + `
import json, sys
payload = json.load(sys.stdin)
answers = []
for case in payload:
    result = __viz_run_trace(case['code'], 'Predictor', [], case['config'])
    assert result['result'] == case['answer'], result
    assert result['trace']
    answers.append(result['result'])
print(json.dumps(answers))
`;
  const python = spawnSync("python3", ["-c", program], { input: JSON.stringify(payload), encoding: "utf8" });
  assert.equal(python.status, 0, python.stderr);
  assert.deepEqual(JSON.parse(python.stdout), cases.map(item => item.answer));
});

test("9005 lazy assets and dedicated renderer are registered", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  for (const name of ["next-word-9005.css", "renderer-next-word-9005.js"]) assert.ok(html.includes(name));
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /(?:renderer-)?next-word-9005\.(?:css|js)/);
  const source = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const registry = source.slice(0, source.indexOf("\nfunction ", source.indexOf("const ORDERED_RENDERER_REGISTRY")));
  const context = { renderNextWord9005View: step => { context.rendered = step; } };
  vm.createContext(context);
  vm.runInContext(registry + "\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;", context);
  const step = problem.builder(problem.defaultInput, { word: "love" }).steps[0];
  const renderer = context.registry.find(entry => entry.predicate(step));
  renderer.render(step);
  assert.equal(renderer.surface, "treeView");
  assert.equal(context.rendered, step);
});
