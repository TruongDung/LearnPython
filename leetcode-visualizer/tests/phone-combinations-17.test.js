"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[17];
const map = { 2: "abc", 3: "def", 4: "ghi", 5: "jkl", 6: "mno", 7: "pqrs", 8: "tuv", 9: "wxyz" };
const cases = ["", "2", "7", "9", "23", "22", "79", "234", "9999"];
const product = digits => digits ? [...digits].reduce((rows, key) => rows.flatMap(prefix => [...map[key]].map(letter => prefix + letter)), [""]) : [];

test("17 returns the complete Cartesian product in keypad order, including repeated digits and empty input", () => {
  let seed = 17;
  const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  const samples = [...cases, "2222", "2349", ...Object.keys(map),
    ...Array.from({ length: 25 }, () => Array.from({ length: 1 + random(4) }, () => String(2 + random(8))).join(""))];
  for (const digits of samples) {
    const run = problem.builder(digits);
    assert.deepEqual(run.answer, product(digits));
    assert.equal(new Set(run.answer).size, run.answer.length);
    assert.equal(run.steps.filter(step => step.final).length, 1);
    assert.deepEqual(run.steps.at(-1).phone17View.results, run.answer);
    assert.ok(run.answer.every(word => [...word].every((letter, i) => map[digits[i]].includes(letter))));
  }
  assert.ok(problem.builder("22").answer.includes("aa"));
  assert.equal(problem.builder("9999").answer.length, 256);
});

test("17 matches every completed Python line, actual locals, shared current list and initialized variables", () => {
  const python = `import sys,json,copy
scope={};filename='<phone17>';exec(compile(json.load(sys.stdin),filename,'exec'),scope)
runs=[]
for digits in ${JSON.stringify(cases)}:
 events=[];pending={}
 def trace(frame,event,arg):
  if frame.f_code.co_filename!=filename or frame.f_code.co_name not in ('letterCombinations','backtrack'):return trace
  if event in ('line','return'):
   if frame in pending:
    x=frame.f_locals;callers=[];cursor=frame
    while cursor:
     if cursor.f_code.co_filename==filename and cursor.f_code.co_name=='backtrack':callers.append({'idx':cursor.f_locals['idx'],'currentLength':len(cursor.f_locals['current'])})
     cursor=cursor.f_back
    events.append({'line':pending.pop(frame),'scope':frame.f_code.co_name,'locals':copy.deepcopy({k:x[k] for k in ('digits','idx','letter','current') if k in x}),'mappingReady':'mapping' in x,'resultReady':'result' in x,'currentReady':'current' in x,'result':list(x.get('result',[])),'stack':list(reversed(callers))})
   if event=='line':pending[frame]=frame.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().letterCombinations(digits);sys.settrace(None)
 runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const proc = spawnSync("python3", ["-c", python], { input: JSON.stringify(problem.code.join("\n")), encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.equal(proc.status, 0, proc.stderr);
  JSON.parse(proc.stdout).forEach((reference, c) => {
    const digits = cases[c], run = problem.builder(digits);
    assert.deepEqual(run.answer, reference.answer); assert.equal(run.steps.length, reference.events.length, digits);
    run.steps.forEach((step, i) => {
      const v = step.phone17View, e = reference.events[i], x = e.locals;
      assert.deepEqual(step.codeLines, [e.line]); assert.equal(v.scope, e.scope); assert.deepEqual(v.locals, x);
      assert.equal(v.mappingReady, e.mappingReady); assert.equal(v.resultReady, e.resultReady); assert.equal(v.currentReady, e.currentReady);
      assert.deepEqual(v.stack.map(({ idx, currentLength }) => ({ idx, currentLength })), e.stack);
      assert.equal(v.resultCount, e.result.length); assert.deepEqual(v.results, e.result.slice(v.shownFrom));
      assert.equal(v.source.text, problem.code[e.line - 1]); assert.equal(v.source.timing, "after");
      const valid = x.idx !== undefined && x.idx < digits.length;
      assert.deepEqual(step.vars.map(w => w.name), ["idx", "digits[idx]", "mapping[digits[idx]]", "letter", "current", "len(result)"]);
      assert.deepEqual(step.vars.map(w => w.value), [x.idx ?? "—", valid ? digits[x.idx] : "—", valid && e.mappingReady ? map[digits[x.idx]] : "—", x.letter ?? "—", x.current ?? "—", e.resultReady ? e.result.length : "—"]);
    });
  });
});

test("17 previews before append, mutates current on the right lines and preserves saved strings after pop", () => {
  for (const digits of cases) {
    const run = problem.builder(digits), byFrame = new Map(); let previous;
    for (const step of run.steps) {
      const v = step.phone17View, x = v.locals, frame = v.stack.at(-1);
      if (v.phase === "choose") assert.deepEqual(x.current, byFrame.get(frame.id).current);
      if (v.phase === "append") assert.deepEqual(x.current, [...previous.locals.current, x.letter]);
      if (v.phase === "pop") assert.deepEqual(x.current, previous.locals.current.slice(0, -1));
      if (v.phase === "save") {
        assert.equal(x.idx, digits.length); assert.equal(v.results.at(-1), x.current.join(""));
      }
      if (x.current) assert.ok(x.current.every((letter, i) => map[digits[i]].includes(letter)));
      if (x.idx === digits.length) assert.equal(v.activeIndex, null, "base case must not pretend the last key is active");
      if (previous && v.phase !== "save") assert.equal(v.resultCount, previous.resultCount);
      if (frame) byFrame.set(frame.id, x);
      previous = v;
    }
  }
  const run = problem.builder("23"), first = run.steps.find(step => step.phone17View.phase === "save");
  assert.deepEqual(first.phone17View.results, ["ad"]);
  assert.ok(run.steps.some(step => step.phone17View.phase === "pop" && step.phone17View.locals.current.length === 0));
  assert.deepEqual(first.phone17View.results, ["ad"]);
});

test("17 accepts all official input lengths including empty input, rejects invalid keys and never truncates four-digit runs", () => {
  assert.equal(problem.allowEmptyInput, true);
  assert.deepEqual(problem.liveArgs(""), [""]); assert.deepEqual(problem.builder("").answer, []);
  assert.deepEqual(problem.builder("").steps.map(step => step.codeLines), [[3], [4]]);
  const full = problem.builder("7777");
  assert.equal(full.answer.length, 256); assert.ok(full.steps.length > 1000);
  assert.equal(full.steps.at(-1).phone17View.results.length, 256);
  for (const invalid of [null, undefined, 23, ["23"], {}, "1", "0", "20", "*", "#", "abc", " 23", "23 ", "23456", "2.3"]) {
    assert.throws(() => problem.builder(invalid), /17/); assert.throws(() => problem.liveArgs(invalid), /17/);
  }
});

function renderer(lang) {
  const host = { innerHTML: "", querySelector: () => null }, context = { lang, $: () => host,
    escapeHtml: x => String(x).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]) };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-phone-17.js"), "utf8"), context);
  return step => { context.renderPhone17Pictures(step); return host.innerHTML; };
}

test("17 pictures preserve keypad mappings, positions, preview slots, recursive frames and all saved strings", () => {
  for (const lang of ["vi", "en"]) {
    const render = renderer(lang);
    for (const digits of cases.filter(s => s.length < 4)) {
      const run = problem.builder(digits), original = JSON.stringify(run);
      for (const step of run.steps) {
        const v = step.phone17View, html = render(step), f = v.stack.at(-1);
        assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object|<p\b|<table\b/);
        assert.equal((html.match(/data-key=/g) || []).length, 12);
        assert.equal((html.match(/data-position=/g) || []).length, digits.length);
        assert.equal((html.match(/data-choice=/g) || []).length, [...digits].reduce((n, digit) => n + map[digit].length, 0));
        assert.deepEqual([...html.matchAll(/data-combination="([a-z]+)"/g)].map(m => m[1]), v.results);
        if (!step.final && digits) {
          const slots = [...html.matchAll(/data-current-position="(\d+)" data-current-value="([a-z]?)" data-preview="(true|false)"/g)];
          assert.equal(slots.length, digits.length);
          assert.deepEqual(slots.filter(m => m[2]).map(m => m[2]), v.locals.current || []);
          assert.deepEqual(slots.filter(m => m[3] === "true").map(m => Number(m[1])), v.phase === "choose" ? [f.idx] : []);
          assert.deepEqual([...html.matchAll(/data-frame-id="(\d+)"/g)].map(m => Number(m[1])), v.stack.map(f => f.id));
        }
      }
      const first = render(run.steps[0]); render(run.steps.at(-1)); assert.equal(render(run.steps[0]), first);
      assert.equal(JSON.stringify(run), original);
    }
    assert.equal((render(problem.builder("9999").steps.at(-1)).match(/data-combination=/g) || []).length, 256);
  }
});

test("17 loads scoped assets lazily, keeps debug watches fixed and supports day/night and horizontal source scrolling", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8"), script = fs.readFileSync(require.resolve("../public/script.js"), "utf8"), css = fs.readFileSync(require.resolve("../public/phone-17.css"), "utf8");
  assert.equal(problem.debugMode, "line-by-line");
  assert.match(html, /phone-17\.css[^\n]*data-problem-ids="17"/);
  assert.match(html, /renderer-phone-17\.js[^\n]*data-problem-ids="17"/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /(?:renderer-)?phone-17\.(?:css|js)/);
  assert.match(script, /Boolean\(step.phone17View\)[^\n]*renderPhone17Pictures\(step\)/);
  assert.match(css, /\[data-theme="light"\] \.ph17-viz/);
  assert.match(css, /#varsPanel[^}]*position:sticky/);
  assert.match(css, /\.code-panel\s*\{[^}]*overflow-x:auto/);
  assert.match(css, /\.code-line\s*\{[^}]*white-space:pre/);
});
