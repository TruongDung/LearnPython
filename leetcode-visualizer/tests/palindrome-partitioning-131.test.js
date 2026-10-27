"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[131];
const cases = ["aab", "abba", "aba", "abc", "a", "aabaa", "banana", "abab", "aaaaa"];
const canonical = rows => rows.map(row => JSON.stringify(row)).sort();
function palindrome(s) {
  for (let l = 0, r = s.length - 1; l < r; l++, r--) if (s[l] !== s[r]) return false;
  return true;
}
function oracle(s) {
  const rows = [];
  for (let mask = 0; mask < 2 ** (s.length - 1); mask++) {
    const row = []; let start = 0;
    for (let end = 1; end <= s.length; end++) if (end === s.length || mask & 2 ** (end - 1)) {
      row.push(s.slice(start, end)); start = end;
    }
    if (row.every(palindrome)) rows.push(row);
  }
  return rows;
}

test("131 enumerates every valid cut pattern with no duplicate partitions", () => {
  let seed = 131;
  const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  const samples = [...cases, ...Array.from({ length: 35 }, () => Array.from({ length: 1 + random(7) }, () => "abc"[random(3)]).join(""))];
  for (const s of samples) {
    const run = problem.builder(s);
    assert.deepEqual(canonical(run.answer), canonical(oracle(s)));
    assert.equal(new Set(canonical(run.answer)).size, run.answer.length);
    assert.ok(run.answer.every(row => row.join("") === s && row.every(palindrome)));
    assert.equal(run.steps.filter(step => step.final).length, 1);
    assert.deepEqual(run.steps.at(-1).palindrome131View.results, run.answer);
  }
});

test("131 matches every executed Python line, local binding and shared path across all active frames", () => {
  const python = `import sys,json,copy
scope={};filename='<palindrome131>';exec(compile(json.load(sys.stdin),filename,'exec'),scope)
runs=[]
for s in ${JSON.stringify(cases)}:
 events=[];pending={}
 def trace(frame,event,arg):
  if frame.f_code.co_filename!=filename or frame.f_code.co_name not in ('partition','bt'):return trace
  if event in ('line','return'):
   if frame in pending:
    x=frame.f_locals;callers=[];cursor=frame
    while cursor:
     if cursor.f_code.co_filename==filename and cursor.f_code.co_name=='bt':callers.append({'start':cursor.f_locals['start'],'pathLength':len(cursor.f_locals['path'])})
     cursor=cursor.f_back
    events.append({'line':pending.pop(frame),'scope':frame.f_code.co_name,'locals':copy.deepcopy({k:x[k] for k in ('start','end','piece','path') if k in x}),'res':copy.deepcopy(x['res']),'stack':list(reversed(callers))})
   if event=='line':pending[frame]=frame.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().partition(s);sys.settrace(None)
 runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const proc = spawnSync("python3", ["-c", python], { input: JSON.stringify(problem.code.join("\n")), encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  assert.equal(proc.status, 0, proc.stderr);
  JSON.parse(proc.stdout).forEach((reference, c) => {
    const run = problem.builder(cases[c]), reverseByFrame = new Map();
    assert.deepEqual(run.answer, reference.answer); assert.equal(run.steps.length, reference.events.length);
    run.steps.forEach((step, i) => {
      const v = step.palindrome131View, e = reference.events[i], x = e.locals, frame = v.stack.at(-1);
      assert.deepEqual(step.codeLines, [e.line]); assert.equal(v.scope, e.scope); assert.deepEqual(v.locals, x);
      assert.deepEqual(v.stack.map(({ start, pathLength }) => ({ start, pathLength })), e.stack);
      assert.equal(v.resultCount, e.res.length); assert.deepEqual(v.results, e.res.slice(v.shownFrom));
      assert.equal(v.source.text, problem.code[e.line - 1]); assert.equal(v.source.timing, "after");
      if (v.phase === "end") reverseByFrame.delete(frame.id);
      if (e.line === 10) reverseByFrame.set(frame.id, [...x.piece].reverse().join(""));
      assert.deepEqual(step.vars.map(w => w.name), ["start", "end", "piece", "piece[::-1]", "len(path)", "len(res)"]);
      assert.deepEqual(step.vars.map(w => w.value), [x.start ?? "—", x.end ?? "—", x.piece ?? "—", frame ? reverseByFrame.get(frame.id) ?? "—" : "—", x.path ? x.path.length : "—", e.res.length]);
    });
  });
});

test("131 compares only on line 10, appends and pops once, and saves an independent path copy", () => {
  for (const s of cases) {
    const run = problem.builder(s); let previous;
    for (const step of run.steps) {
      const v = step.palindrome131View, x = v.locals;
      if (v.phase === "end" || v.phase === "piece") assert.equal(v.candidate.checked, null);
      if (v.phase === "check") assert.equal(v.candidate.checked, palindrome(x.piece));
      if (v.phase === "append") assert.deepEqual(x.path, [...previous.locals.path, x.piece]);
      if (v.phase === "pop") assert.deepEqual(x.path, previous.locals.path.slice(0, -1));
      if (v.phase === "save") {
        assert.equal(x.start, s.length); assert.deepEqual(v.results.at(-1), x.path);
      }
      if (previous && v.phase !== "save") assert.equal(v.resultCount, previous.resultCount);
      if (x.path) assert.ok(s.startsWith(x.path.join("")) && x.path.every(palindrome));
      previous = v;
    }
    assert.deepEqual(run.steps.at(-1).palindrome131View.stack, []);
  }
  const run = problem.builder("aab"), saved = run.steps.find(s => s.palindrome131View.phase === "save");
  assert.deepEqual(saved.palindrome131View.results, [["a", "a", "b"]]);
  assert.ok(run.steps.some(s => s.palindrome131View.phase === "pop" && s.palindrome131View.locals.path.length === 0));
  assert.deepEqual(saved.palindrome131View.results, [["a", "a", "b"]]);
});

test("131 traces accepted boundary inputs completely and rejects oversized output before building a partial trace", () => {
  const full = problem.builder("aaaaaaaa");
  assert.equal(full.answer.length, 128); assert.ok(full.steps.length > 240);
  assert.equal(full.steps.at(-1).palindrome131View.results.length, 128);
  const unique = "abcdefghijklmnopqrstuvwx", boundary = problem.builder(unique);
  assert.deepEqual(boundary.answer, [[...unique]]); assert.ok(boundary.steps.length > 240);
  assert.deepEqual(problem.liveArgs("aab"), ["aab"]);
  for (const invalid of ["", "a".repeat(25), "a".repeat(9), "Aab", "a b", " a", null, 131, ["aab"], {}, "a1"]) {
    assert.throws(() => problem.builder(invalid), /131/); assert.throws(() => problem.liveArgs(invalid), /131/);
  }
});

function renderer(lang) {
  const host = { innerHTML: "", querySelector: () => null }, context = { lang, $: () => host,
    escapeHtml: x => String(x).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]) };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-palindrome-131.js"), "utf8"), context);
  return step => { context.renderPalindrome131Pictures(step); return host.innerHTML; };
}

test("131 pictures preserve each character, mirror comparison, current path and saved cuts in both languages", () => {
  for (const lang of ["vi", "en"]) {
    const render = renderer(lang);
    for (const s of cases) {
      const run = problem.builder(s), original = JSON.stringify(run);
      for (const step of run.steps) {
        const v = step.palindrome131View, html = render(step), chars = [...html.matchAll(/data-source-index="(\d+)" data-chosen="(true|false)" data-candidate="(true|false)"/g)];
        assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object|<p\b|<table\b/);
        assert.equal(chars.length, s.length);
        const length = (v.locals.path || []).join("").length;
        assert.deepEqual(chars.filter(c => c[2] === "true").map(c => Number(c[1])), Array.from({ length }, (_, i) => i));
        assert.deepEqual(chars.filter(c => c[3] === "true").map(c => Number(c[1])), v.candidate ? Array.from({ length: v.candidate.end - v.candidate.start }, (_, i) => v.candidate.start + i) : []);
        const pairs = [...html.matchAll(/data-pair="(\d+)" data-match="(true|false|unknown)"/g)];
        assert.equal(pairs.length, v.candidate?.text.length || 0);
        for (const [, i, match] of pairs) assert.equal(match, v.candidate.checked === null ? "unknown" : String(v.candidate.text[Number(i)] === v.candidate.text.at(-1 - Number(i))));
        const shown = [...html.matchAll(/data-partition="([a-z|]+)"/g)].map(m => m[1].split("|"));
        assert.deepEqual(shown, v.results);
        if (!step.final) {
          assert.match(html, new RegExp(`data-path="${v.locals.path ? v.locals.path.join("\\|") : "unbound"}"`));
          assert.deepEqual([...html.matchAll(/data-frame-id="(\d+)"/g)].map(m => Number(m[1])), v.stack.map(f => f.id));
        }
      }
      const first = render(run.steps[0]); render(run.steps.at(-1)); assert.equal(render(run.steps[0]), first);
      assert.equal(JSON.stringify(run), original);
    }
    assert.equal((render(problem.builder("aaaaaaaa").steps.at(-1)).match(/data-partition=/g) || []).length, 128);
  }
});

test("131 has runnable standalone Python, lazy assets, fixed watches, day/night colors and horizontal source scrolling", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8"), script = fs.readFileSync(require.resolve("../public/script.js"), "utf8"), css = fs.readFileSync(require.resolve("../public/palindrome-131.css"), "utf8");
  assert.equal(problem.debugMode, "line-by-line"); assert.doesNotMatch(problem.code.join("\n"), /List\[/);
  assert.match(html, /palindrome-131\.css[^\n]*data-problem-ids="131"/);
  assert.match(html, /renderer-palindrome-131\.js[^\n]*data-problem-ids="131"/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /(?:renderer-)?palindrome-131\.(?:css|js)/);
  assert.match(script, /Boolean\(step.palindrome131View\)[^\n]*renderPalindrome131Pictures\(step\)/);
  assert.match(css, /\[data-theme="light"\] \.pal131-viz/);
  assert.match(css, /#varsPanel[^}]*position:sticky/);
  assert.match(css, /\.code-panel\s*\{[^}]*overflow-x:auto/);
  assert.match(css, /\.code-line\s*\{[^}]*white-space:pre/);
});
