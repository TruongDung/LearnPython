"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const vm = require("node:vm");
const problem = require("../problems").SUPPORTED[10];
const run = (s, p) => problem.builder(s, { p });
const cases = [
  ["aa", "a", false], ["aa", "a*", true], ["ab", ".*", true],
  ["aab", "c*a*b", true], ["mississippi", "mis*is*p*.", false],
  ["", "", true], ["", "a*b*", true], ["", ".", false], ["a", "", false],
  ["ab", ".", false], ["ab", "b", false], ["aaa", "a*a", true],
  ["ab", ".*c", false], ["a", "ab*", true], ["aaa", "ab*a*c*a", true],
  ["a", "a*a*", true], ["abc", "...", true], ["a", ".*a*", true],
];
let seed = 10;
const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
for (let k = 0; k < 60; k++) {
  let s = "", p = "";
  for (let i = random(7); i > 0; i--) s += "abc"[random(3)];
  for (let i = random(6); i > 0; i--) p += "abc."[random(4)] + (random(2) ? "*" : "");
  cases.push([s, p, new RegExp(`^(?:${p})$`).test(s)]);
}

function checkWitness(v) {
  if (!v.answer) { assert.equal(v.witness, null); return; }
  assert.equal(v.witness.map(g => g.text).join(""), v.s);
  assert.equal(v.witness.map(g => g.pattern).join(""), v.p);
  let cursor = 0;
  for (const g of v.witness) {
    assert.equal(g.from, cursor); assert.equal(g.to, g.from + g.text.length);
    assert.equal(g.text, v.s.slice(g.from, g.to));
    assert.equal(g.pattern, v.p.slice(g.start, g.end));
    assert.ok(new RegExp(`^(?:${g.pattern})$`).test(g.text)); cursor = g.to;
  }
}

test("10 matches official cases, empty bases and a seeded independent regex oracle", () => {
  for (const [s, p, expected] of cases) {
    const result = run(s, p), last = result.steps.at(-1);
    assert.equal(result.answer, expected, `${s} / ${p}`);
    assert.equal(last.regexMatch10View.answer, expected);
    assert.equal(last.regexMatch10View.dp[s.length][p.length], expected);
    assert.equal(result.steps.filter(step => step.final).length, 1);
    assert.equal(last.codeLines[0], 17); checkWitness(last.regexMatch10View);
  }
});

test("10 exposes actual writes and DP read arrows, including Python short-circuiting", () => {
  const seen = new Set(); let short = false, unchanged = false, exhausted = false;
  for (const [s, p] of cases.slice(0, 18)) {
    let previous = null;
    for (const step of run(s, p).steps) {
      const v = step.regexMatch10View, { i, j } = v.cursor;
      assert.deepEqual(step.codeLines, [v.source.line]);
      assert.equal(v.source.text, problem.code[v.source.line - 1].trim());
      assert.equal(v.source.timing, "after"); assert.deepEqual(v.dp, v.locals.dp ?? null);
      assert.deepEqual(step.vars, ["m", "n", "i", "j"].map(name => ({ name, value: v.locals[name] ?? "—" })));
      if (v.write) {
        assert.equal(v.write.after, v.dp[i][j]); assert.equal(v.write.before, previous[i][j]);
        if (v.write.before === v.write.after) unchanged = true;
      }
      for (const r of v.reads) {
        seen.add(r.role);
        assert.ok(r.i >= 0 && r.j >= 0 && r.i <= s.length && r.j <= p.length);
        assert.equal(r.value, (v.source.line === 16 && r.role === "keep" ? previous : v.dp)[r.i][r.j]);
        if (r.role === "diagonal") assert.deepEqual([r.i, r.j], [i - 1, j - 1]);
        if (r.role === "skip") assert.deepEqual([r.i, r.j], [i, j - 2]);
        if (r.role === "repeat") assert.deepEqual([r.i, r.j], [i - 1, j]);
      }
      if (v.source.line === 16) {
        assert.equal(v.shortCircuit, previous[i][j]);
        assert.equal(v.reads.length, previous[i][j] ? 1 : 2);
        assert.equal(v.dp[i][j], previous[i][j] || previous[i - 1][j]);
        short ||= v.shortCircuit;
      }
      if (v.exhausted) { exhausted = true; assert.equal(v.condition, false); assert.equal(i, null); assert.equal(j, null); }
      previous = v.dp;
    }
  }
  for (const role of ["skip", "diagonal", "repeat", "keep", "answer"]) assert.ok(seen.has(role));
  assert.ok(short && unchanged && exhausted);
});

test("10 replays every Python event with the same lines, locals, branches and return values as CPython", () => {
  const samples = cases.slice(0, 18).map(([s, p]) => [s, p]);
  const source = "import json,sys,runpy\np=json.load(sys.stdin)\ntrace=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(trace({'code':p['code'],'method':'isMatch','args':a})) for a in p['cases']]))";
  const native = spawnSync(process.env.PYTHON || "python3", ["-c", source], {
    input: JSON.stringify({ path: require.resolve("../problems/picture-trace.py"), code: problem.code.join("\n"), cases: samples }),
    encoding: "utf8", maxBuffer: 32e6,
  });
  assert.equal(native.status, 0, native.stderr);
  JSON.parse(native.stdout).forEach((ref, index) => {
    const result = run(...samples[index]); assert.equal(result.answer, ref.answer);
    assert.equal(result.steps.length, ref.events.length);
    ref.events.forEach((e, i) => {
      const step = result.steps[i], v = step.regexMatch10View;
      assert.deepEqual(step.codeLines, [e.line]);
      for (const key of ["locals", "outer", "frames", "scope", "branch", "returned", "returning"]) assert.deepEqual(v[key], e[key]);
    });
  });
});

test("10 validates the pattern grammar and live editor inputs without silently trimming", () => {
  for (const s of [null, 5, [], "A", " a", "a ", "a".repeat(21), "a\n"]) assert.throws(() => run(s, "a*"), RangeError);
  for (const p of [null, [], 8, "*", "a**", ".**", "a+", "[a]", " a", "a\n", ".".repeat(21)]) assert.throws(() => run("a", p), RangeError);
  assert.deepEqual(problem.liveArgs("", { p: "" }), ["", ""]);
  assert.deepEqual(problem.liveArgs("aab", {}), ["aab", "c*a*b"]);
  assert.throws(() => problem.liveArgs("a", { p: "*a" }), RangeError);
  for (const params of [null, [], "a*"]) assert.throws(() => problem.builder("a", params), RangeError);
  assert.ok(problem.allowEmptyInput); assert.equal(problem.debugMode, "line-by-line");
  assert.ok(problem.extraParams.find(param => param.key === "p").allowEmpty);
});

test("10 keeps a complete 20 by 20 replay and an immutable earlier table", () => {
  for (const [s, p] of [["a".repeat(20), ".*".repeat(10)], ["a".repeat(19) + "b", "a*".repeat(10)]]) {
    const result = run(s, p), first = result.steps.find(s => s.codeLines[0] === 4).regexMatch10View;
    assert.ok(first.dp.every(row => row.every(v => v === false)));
    assert.equal(result.answer, new RegExp(`^(?:${p})$`).test(s));
    assert.equal(result.steps.at(-1).regexMatch10View.trace.truncated, false);
    assert.equal(result.steps.length, result.steps.at(-1).regexMatch10View.trace.captured);
    checkWitness(result.steps.at(-1).regexMatch10View);
  }
});

function ui(locale, extra = {}) {
  const host = { innerHTML: "", querySelector: () => null, querySelectorAll: () => [] };
  const context = { lang: locale, document: { getElementById: () => host }, ...extra };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-regex-match-10.js"), "utf8"), context);
  return { context, host, render: step => { context.renderRegexMatch10View(step); return host.innerHTML; } };
}

test("10 draws actual DP cells, dependency arrows and witness groups in Vietnamese and English", () => {
  for (const locale of ["vi", "en"]) {
    const view = ui(locale), result = run("aab", "c*a*b"), saved = JSON.stringify(result);
    const initial = view.render(result.steps[0]);
    for (const step of result.steps) {
      const v = step.regexMatch10View, html = view.render(step);
      assert.doesNotMatch(html, /undefined|NaN|Infinity/);
      const cells = [...html.matchAll(/data-rx-cell="(\d+),(\d+)" data-dp-value="(true|false)"/g)].map(m => [+m[1], +m[2], m[3] === "true"]);
      assert.deepEqual(cells, v.dp?.flatMap((row, i) => row.map((value, j) => [i, j, value])) ?? []);
      for (const r of v.reads.filter(r => r.i !== v.cursor.i || r.j !== v.cursor.j)) {
        assert.ok(html.includes(`data-read-from="${r.i},${r.j}" data-read-to="${v.cursor.i},${v.cursor.j}"`));
      }
      if (v.witness) for (const g of v.witness) assert.ok(html.includes(`data-witness-pattern="${g.pattern}" data-witness-text="${g.text}"`));
    }
    assert.equal(view.render(result.steps[0]), initial); assert.equal(JSON.stringify(result), saved);
    assert.equal(view.context.regex10Escape('<script>"&'), "&lt;script&gt;&quot;&amp;");
  }
});

test("10 jump controls reach actual writes, star transitions and the final answer", () => {
  const result = run("aab", "c*a*b");
  for (const predicate of [v => Boolean(v.write), v => v.source.line === 14 || v.source.line === 8, v => v.answer !== null]) {
    let stopped = 0, rendered = 0;
    const view = ui("vi", { steps: result.steps, stepIndex: 0, stopPlay: () => stopped++, renderStep: () => rendered++ });
    view.context.regex10Jump(predicate);
    assert.ok(predicate(result.steps[view.context.stepIndex].regexMatch10View));
    assert.equal(stopped, 1); assert.equal(rendered, 1);
    view.context.stepIndex = result.steps.length - 1;
    view.context.regex10Jump(predicate); assert.equal(view.context.stepIndex, result.steps.length - 1);
  }
});

test("10 cell controls also reach False cells that never receive an explicit assignment", () => {
  const result = run("aab", "c*a*b");
  for (const [cell, line] of [["0,2", 8], ["1,1", 10], ["0,1", 4]]) {
    const handlers = {}, node = { dataset: { rxCell: cell }, addEventListener: (name, fn) => { handlers[name] = fn; } };
    const host = { querySelectorAll: selector => selector === "[data-rx-cell]" ? [node] : [] };
    const view = ui("vi", { steps: result.steps, stepIndex: result.steps.length - 1, renderStep() {} });
    view.context.regex10Bind(host);
    for (const key of ["Enter", " "]) {
      let prevented = false, stopped = false;
      handlers.keydown({ key, preventDefault: () => { prevented = true; }, stopPropagation: () => { stopped = true; } });
      assert.equal(result.steps[view.context.stepIndex].regexMatch10View.source.line, line);
      assert.ok(prevented && stopped);
    }
  }
});
