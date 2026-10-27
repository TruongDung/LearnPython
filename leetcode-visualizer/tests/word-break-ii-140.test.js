"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[140];
const cases = [
  ["catsanddog", ["cat", "cats", "and", "sand", "dog"]],
  ["pineapplepenapple", ["apple", "pen", "applepen", "pine", "pineapple"]],
  ["catsandog", ["cats", "dog", "sand", "and", "cat"]],
  ["a", ["a"]], ["a", []], ["ab", ["a", "b", "ab"]],
  ["aaaaab", ["a", "aa", "aaa"]], ["aaaa", ["a", "aa", "a"]],
];

function oracle(s, words) {
  const dictionary = new Set(words), answers = [];
  for (let mask = 0; mask < 2 ** (s.length - 1); mask++) {
    const pieces = []; let start = 0;
    for (let end = 1; end <= s.length; end++) if (end === s.length || mask & 2 ** (end - 1)) {
      pieces.push(s.slice(start, end)); start = end;
    }
    if (pieces.every(word => dictionary.has(word))) answers.push(pieces.join(" "));
  }
  return answers.sort();
}

test("140 returns every valid partition in source order without duplicates or input mutation", () => {
  let seed = 140;
  const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  const samples = [...cases];
  for (let i = 0; i < 35; i++) {
    const s = Array.from({ length: 1 + random(7) }, () => "abc"[random(3)]).join("");
    const words = ["a", "b", "c", "ab", "bc", "abc", "aa", "bb", "cc"].filter(() => random(3) !== 0);
    samples.push([s, words]);
  }
  for (const [s, words] of samples) {
    const frozen = Object.freeze([...words]), run = problem.builder(s, Object.freeze({ wordDict: frozen }));
    assert.deepEqual([...run.answer].sort(), oracle(s, words));
    assert.equal(new Set(run.answer).size, run.answer.length);
    assert.deepEqual(frozen, words);
    assert.equal(run.steps.filter(step => step.final).length, 1);
    assert.deepEqual(run.steps.at(-1).wordBreak140View.answer, run.answer);
    assert.ok(run.answer.every(sentence => sentence.replaceAll(" ", "") === s));
  }
});

test("140 matches every completed Python line, bound local, memo update and loop exhaustion", () => {
  const python = `import sys,json,copy
scope={};filename='<wordbreak140>';exec(compile(json.load(sys.stdin),filename,'exec'),scope)
runs=[]
for s,wordDict in ${JSON.stringify(cases)}:
 events=[];pending={}
 def trace(frame,event,arg):
  if frame.f_code.co_filename!=filename or frame.f_code.co_name not in ('wordBreak','dfs'):return trace
  if event in ('line','return'):
   if frame in pending:
    x=frame.f_locals
    events.append({'line':pending.pop(frame),'scope':frame.f_code.co_name,'locals':copy.deepcopy({k:x[k] for k in ('start','end','word','tail','sentences') if k in x}),'memoReady':'memo' in x,'memo':[{'start':key,'count':len(value),'preview':value[:2]} for key,value in x.get('memo',{}).items()]})
   if event=='line':pending[frame]=frame.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().wordBreak(s,wordDict);sys.settrace(None)
 runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const proc = spawnSync("python3", ["-c", python], { input: JSON.stringify(problem.code.join("\n")), encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  assert.equal(proc.status, 0, proc.stderr);
  JSON.parse(proc.stdout).forEach((reference, c) => {
    const [s, words] = cases[c], run = problem.builder(s, { wordDict: words });
    assert.deepEqual(run.answer, reference.answer); assert.equal(run.steps.length, reference.events.length, s);
    run.steps.forEach((step, i) => {
      const v = step.wordBreak140View, e = reference.events[i], x = e.locals;
      assert.deepEqual(step.codeLines, [e.line]); assert.equal(v.scope, e.scope); assert.deepEqual(v.locals, x);
      assert.deepEqual(v.memo, e.memo); assert.equal(v.memoReady, e.memoReady);
      assert.equal(v.source.text, problem.code[e.line - 1]); assert.equal(v.source.timing, "after");
      assert.deepEqual(step.vars.map(w => w.name), ["start", "end", "word", "tail", "len(sentences)", "len(memo)"]);
      assert.deepEqual(step.vars.map(w => w.value), [x.start ?? "—", x.end ?? "—", x.word ?? "—", x.tail === undefined ? "—" : x.tail || "''", x.sentences ? x.sentences.length : "—", e.memoReady ? e.memo.length : "—"]);
    });
  });
});

test("140 only reveals dictionary checks after line 13 and builds copies with correct prefix and suffix boundaries", () => {
  for (const [s, words] of cases) {
    const run = problem.builder(s, { wordDict: words }), byFrame = new Map(); let previous;
    for (const step of run.steps) {
      const v = step.wordBreak140View, x = v.locals;
      assert.equal(v.stack.slice(1).map(frame => frame.via.word).join(""), s.slice(0, x.start ?? 0));
      v.stack.forEach((frame, depth) => { if (depth) assert.ok(frame.start > v.stack[depth - 1].start); });
      if (v.phase === "end" || v.phase === "slice") assert.equal(v.candidate.member, null);
      if (v.phase === "dictionary") assert.equal(v.candidate.member, words.includes(x.word));
      if (v.phase === "tail") assert.deepEqual(x.sentences, byFrame.get(v.stack.at(-1).id).sentences);
      if (v.phase === "append") {
        assert.deepEqual(x.sentences, [...previous.locals.sentences, x.word + (x.tail ? " " + x.tail : "")]);
        assert.ok(x.sentences.every(sentence => sentence.replaceAll(" ", "") === s.slice(x.start)));
      }
      if (v.phase === "base-return") {
        assert.equal(x.start, s.length); assert.equal(Object.hasOwn(x, "sentences"), false);
      }
      if (!step.final) assert.equal(v.answer, null);
      if (v.stack.length) byFrame.set(v.stack.at(-1).id, x);
      previous = v;
    }
  }
});

test("140 reuses the shared dog suffix and caches unsuccessful suffixes as empty lists", () => {
  const positive = problem.builder("catsanddog"), hits = positive.steps.filter(s => s.wordBreak140View.phase === "memo-return");
  assert.equal(hits.length, 1);
  assert.deepEqual(hits[0].wordBreak140View.cache, { start: 7, count: 1, preview: ["dog"] });
  assert.deepEqual(positive.answer, ["cat sand dog", "cats and dog"]);
  const negative = problem.builder("aaaaab", { wordDict: ["a", "aa", "aaa"] });
  assert.deepEqual(negative.answer, []);
  assert.ok(negative.steps.some(s => s.wordBreak140View.phase === "memo-return" && s.wordBreak140View.cache.count === 0));
  assert.ok(negative.steps.at(-1).wordBreak140View.memo.every(entry => entry.count === 0));
});

test("140 accepts comma-separated/JSON dictionaries and checks visual limits before tracing without dropping output", () => {
  const words = ["cat", "cats", "and", "sand", "dog"];
  for (const dict of [words, words.join(","), JSON.stringify(words)]) assert.deepEqual(problem.liveArgs("catsanddog", { wordDict: dict }), ["catsanddog", words]);
  for (const wordDict of ["", "[]", []]) assert.deepEqual(problem.builder("abc", { wordDict }).answer, []);
  assert.equal(problem.extraParams[0].allowEmpty, true);
  const full = problem.builder("aaaaaaaa", { wordDict: Array.from({ length: 8 }, (_, i) => "a".repeat(i + 1)) });
  assert.equal(full.answer.length, 128); assert.equal(full.steps.at(-1).wordBreak140View.answer.length, 128);
  const boundary = problem.builder("a".repeat(24), { wordDict: "a" });
  assert.deepEqual(boundary.answer, [Array(24).fill("a").join(" ")]); assert.ok(boundary.steps.length > 600);
  for (const [s, params] of [["", {}], ["a".repeat(25), {}], [null, {}], [1, {}], ["Cats", {}], ["a b", {}], ["abc", null], ["abc", []], ["abc", { wordDict: [""] }], ["abc", { wordDict: ["A"] }], ["abc", { wordDict: "a,,b" }], ["abc", { wordDict: 3 }], ["aaaaaaaaa", { wordDict: Array.from({ length: 9 }, (_, i) => "a".repeat(i + 1)) }]]) {
    assert.throws(() => problem.builder(s, params), /140/); assert.throws(() => problem.liveArgs(s, params), /140/);
  }
});

function renderer(lang) {
  const host = { innerHTML: "", querySelector: () => null }, context = { lang, $: () => host,
    escapeHtml: x => String(x).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]) };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-word-break-140.js"), "utf8"), context);
  return step => { context.renderWordBreak140Pictures(step); return host.innerHTML; };
}

test("140 drawings preserve all characters, selected ranges, memo counts and sentences in Vietnamese and English", () => {
  for (const lang of ["vi", "en"]) {
    const render = renderer(lang);
    for (const [s, words] of cases) {
      const run = problem.builder(s, { wordDict: words }), original = JSON.stringify(run);
      for (const step of run.steps) {
        const v = step.wordBreak140View, html = render(step);
        assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object|<p\b|<table\b/);
        const chars = [...html.matchAll(/data-char="(\d+)" data-selected="(true|false)"/g)];
        assert.equal(chars.length, s.length);
        assert.deepEqual(chars.filter(c => c[2] === "true").map(c => Number(c[1])), v.candidate ? Array.from({ length: v.candidate.end - v.candidate.start }, (_, i) => v.candidate.start + i) : []);
        assert.deepEqual([...html.matchAll(/data-frame-id="(\d+)"/g)].map(m => Number(m[1])), v.stack.map(f => f.id));
        for (const [, start, count] of html.matchAll(/data-memo-start="(\d+)" data-memo-count="(\d+|unknown)"/g)) {
          const entry = v.memo.find(entry => entry.start === Number(start)); assert.equal(count, entry ? String(entry.count) : "unknown");
        }
        const shown = [...html.matchAll(/data-sentence="([a-z ]*)"/g)].map(m => m[1]);
        assert.deepEqual(shown, step.final ? v.answer : (v.locals.sentences || []).slice(-12));
        if (v.phase === "base-return") assert.match(html, /1 tail ✓/);
        if (v.phase === "memo-return") assert.match(html, /data-cache-start=/);
        if (v.phase === "end" || v.phase === "slice") assert.match(html, /data-membership="null"/);
      }
      const first = render(run.steps[0]); render(run.steps.at(-1)); assert.equal(render(run.steps[0]), first);
      assert.equal(JSON.stringify(run), original);
    }
    const boundary = problem.builder("aaaaaaaa", { wordDict: Array.from({ length: 8 }, (_, i) => "a".repeat(i + 1)) });
    assert.equal((render(boundary.steps.at(-1)).match(/data-sentence=/g) || []).length, 128);
  }
});

test("140 lazy assets and scoped day/night colors retain explicit line debug and horizontal code scrolling", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8"), script = fs.readFileSync(require.resolve("../public/script.js"), "utf8"), css = fs.readFileSync(require.resolve("../public/word-break-140.css"), "utf8");
  assert.equal(problem.debugMode, "line-by-line");
  assert.match(html, /word-break-140\.css[^\n]*data-problem-ids="140"/);
  assert.match(html, /renderer-word-break-140\.js[^\n]*data-problem-ids="140"/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /(?:renderer-)?word-break-140\.(?:css|js)/);
  assert.match(script, /Boolean\(step.wordBreak140View\)[^\n]*renderWordBreak140Pictures\(step\)/);
  assert.match(css, /\[data-theme="light"\] \.wb2-viz/);
  assert.match(css, /\.code-panel\s*\{[^}]*overflow-x:auto/);
  assert.match(css, /\.code-line\s*\{[^}]*white-space:pre/);
});
