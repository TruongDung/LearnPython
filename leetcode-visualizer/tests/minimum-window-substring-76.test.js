"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs"), vm = require("node:vm"), path = require("node:path");
const problem = require("../problems").SUPPORTED[76];
const build = (s, t) => problem.builder(s, { t });

// Independent oracle: enumerate substrings and compare complete frequencies.
function oracle(s, t) {
  if (!s || !t) return "";
  const want = new Map(); for (const c of t) want.set(c, (want.get(c) ?? 0) + 1);
  let best = "";
  for (let left = 0; left < s.length; left++) {
    const have = new Map();
    for (let right = left; right < s.length; right++) {
      const c = s[right]; have.set(c, (have.get(c) ?? 0) + 1);
      if (![...want].every(([c, n]) => (have.get(c) ?? 0) >= n)) continue;
      const candidate = s.slice(left, right + 1);
      if (!best || candidate.length < best.length) best = candidate;
      break;
    }
  }
  return best;
}
const cases = [["ADOBECODEBANC", "ABC", "BANC"], ["a", "a", "a"], ["a", "aa", ""],
  ["aa", "aa", "aa"], ["bba", "ab", "ba"], ["AAAB", "AAB", "AAB"], ["cabwefgewcwaefgcf", "cae", "cwae"],
  ["Ab", "ab", ""], ["ABC", "", ""], ["", "A", ""], ["", "", ""]];

test("76 t stays a text field, supports the real empty guard, and preserves the Counter algorithm", () => {
  const param = problem.extraParams.find(p => p.key === "t");
  assert.equal(param.type, "string"); assert.equal(param.default, "ABC"); assert.ok(param.allowEmpty);
  assert.equal(problem.id, 76); assert.equal(problem.slug, "minimum-window-substring");
  assert.equal(problem.difficulty, "hard"); assert.equal(problem.category.key, "sliding");
  assert.equal(problem.debugMode, "line-by-line"); assert.equal(problem.complexity.time, "O(|s| + |t|)");
  assert.match(problem.code.join("\n"), /def minWindow\(self, s: str, t: str\) -> str:/);
  assert.match(problem.code.join("\n"), /need\[char\] -= 1/); assert.match(problem.code.join("\n"), /while missing == 0:/);
  assert.match(problem.approach.map(a => a.en).join(" "), /NEGATIVE.*surplus/);
  assert.deepEqual(problem.liveArgs("ADOBECODEBANC", { t: "ABC" }), ["ADOBECODEBANC", "ABC"]);
});

test("76 matches published examples, duplicate quotas, case-sensitive inputs and a full-frequency oracle", () => {
  for (const [s, t, expected] of cases) {
    const r = build(s, t); assert.equal(r.answer, expected); assert.equal(r.steps.at(-1).minWindow76View.answer, expected);
    assert.equal(r.steps.filter(step => step.final).length, 1);
  }
  let seed = 76;
  const random = max => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % max; };
  for (let trial = 0; trial < 400; trial++) {
    const s = Array.from({ length: 1 + random(18) }, () => "abcd"[random(4)]).join("");
    const t = Array.from({ length: 1 + random(4) }, () => "abcd"[random(4)]).join("");
    const answer = build(s, t).answer, expected = oracle(s, t);
    assert.equal(answer.length, expected.length, `${s} / ${t}`);
    if (answer) { assert.ok(s.includes(answer)); assert.equal(oracle(answer, t).length, answer.length); }
  }
});

test("76 every Counter value agrees with the characters actually counted, including transient frames", () => {
  let sawExpandTransient = false, sawShrinkTransient = false, sawSurplus = false, sawIncidental = false;
  for (const [s, t] of cases) {
    const r = build(s, t), initial = JSON.stringify(r.steps[0]); let previousBest = null;
    for (const step of r.steps) {
      const v = step.minWindow76View, x = v.locals, frequency = {};
      for (const index of v.counted) frequency[s[index]] = (frequency[s[index]] ?? 0) + 1;
      if (x.need) for (const c of new Set([...s, ...t])) assert.equal(x.need[c] ?? 0, (v.want[c] ?? 0) - (frequency[c] ?? 0));
      for (const item of v.need) {
        assert.equal(item.count, x.need ? x.need[item.char] ?? 0 : null);
        assert.equal(item.inside, x.need ? frequency[item.char] ?? 0 : null);
        assert.equal(item.required, [...t].filter(c => c === item.char).length);
        if (item.count < 0) sawSurplus = true;
      }
      assert.equal(v.left, x.left ?? null); assert.equal(v.right, x.right ?? null); assert.equal(v.missing, x.missing ?? null);
      assert.equal(v.windowText, x.left === undefined || x.right === undefined ? null : s.slice(x.left, x.right + 1));
      assert.equal(v.covered, v.debt === 0 && v.missing !== null && v.inSync);
      if (v.source.line === 13) { sawExpandTransient = true; assert.equal(v.debt, v.missing + 1); assert.ok(v.pending); assert.equal(v.covered, false); }
      if (v.source.line === 18 && v.change.after > 0) { sawShrinkTransient = true; assert.equal(v.debt, v.missing + 1); assert.equal(v.inSync, false); }
      if ([14, 21].includes(v.source.line)) { assert.equal(v.debt, v.missing); assert.equal(v.inSync, true); }
      if (v.change?.char && !Object.hasOwn(v.want, v.change.char)) sawIncidental = true;
      if (v.best) { assert.equal(v.best.text, s.slice(v.best.start, v.best.end)); if (previousBest) assert.ok(v.best.length <= previousBest.length); }
      if (v.source.line === 17) { assert.equal(v.best.text, v.windowText); assert.equal(v.missing, 0); assert.ok(v.inSync); }
      else assert.deepEqual(v.best, previousBest);
      previousBest = v.best;
      assert.deepEqual(step.vars.map(item => item.rawValue), step.vars.map(item => x[item.name] ?? null));
      assert.deepEqual(step.codeLines, [v.source.line]); assert.equal(v.source.text, problem.code[v.source.line - 1].trim()); assert.equal(v.source.timing, "after");
    }
    assert.equal(JSON.stringify(r.steps[0]), initial);
  }
  assert.ok(sawExpandTransient && sawShrinkTransient && sawSurplus && sawIncidental);
});

test("76 missing, need, best and left change on their own physical source lines", () => {
  const r = build("ADOBECODEBANC", "ABC"), at = (line, right = 0) => r.steps.find(s => s.codeLines[0] === line && s.minWindow76View.right === right).minWindow76View;
  assert.equal(r.steps[0].minWindow76View.counter, null); assert.equal(r.steps[0].minWindow76View.missing, null);
  assert.equal(at(13).missing, 2); assert.equal(at(13).counter.A, 1); assert.deepEqual(at(13).counted, []);
  assert.equal(at(14).counter.A, 0); assert.deepEqual(at(14).counted, [0]);
  assert.equal(at(16, 5).best, null); assert.equal(at(17, 5).best.text, "ADOBEC");
  assert.equal(at(18, 5).left, 0); assert.equal(at(18, 5).counter.A, 1); assert.equal(at(18, 5).missing, 0);
  assert.equal(at(20, 5).left, 0); assert.equal(at(20, 5).missing, 1); assert.equal(at(21, 5).left, 1);
  const final = r.steps.at(-1).minWindow76View; assert.equal(final.best.text, "BANC"); assert.equal(final.windowText, "ANC");
  const requiredAt = r.steps.filter(s => s.codeLines[0] === 13).map(s => s.minWindow76View.right);
  assert.deepEqual(requiredAt, [0, 3, 5, 10, 12]);
  const surplus = build("AAAB", "AAB").steps.find(s => s.codeLines[0] === 14 && s.minWindow76View.right === 2).minWindow76View;
  assert.equal(surplus.counter.A, -1); assert.equal(surplus.need.find(item => item.char === "A").inside, 3);
});

test("76 physical lines, locals, branches and returned values match native CPython", () => {
  const args = cases.map(([s, t]) => [s, t]);
  const program = "import json,sys,runpy\np=json.load(sys.stdin)\ntrace=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(trace({'code':p['code'],'method':'minWindow','args':a})) for a in p['args']]))";
  const native = spawnSync(process.env.PYTHON || "python3", ["-c", program], { input: JSON.stringify({ path: require.resolve("../problems/picture-trace.py"), code: problem.code.join("\n"), args }), encoding: "utf8", maxBuffer: 32e6 });
  assert.equal(native.status, 0, native.stderr);
  JSON.parse(native.stdout).forEach((ref, index) => {
    const r = build(...args[index]); assert.equal(r.answer, ref.answer); assert.equal(r.steps.length, ref.events.length);
    ref.events.forEach((event, i) => {
      const v = r.steps[i].minWindow76View; assert.deepEqual(r.steps[i].codeLines, [event.line]);
      for (const key of ["locals", "outer", "frames", "scope", "branch", "returned", "returning"]) assert.deepEqual(v[key], event[key]);
    });
  });
  const solution = spawnSync(process.env.PYTHON || "python3", [path.resolve(__dirname, "../../Leetcode-sln/string/Leetcode_76.py")], { encoding: "utf8" });
  assert.equal(solution.status, 0, solution.stderr);
});

test("76 validates letter inputs and bounds, and fully replays both empty-input guard branches", () => {
  for (const s of [5, null, [], "A ", " A", "a\n", "ADOBE 1"]) assert.throws(() => build(s, "A"), /only English letters/);
  for (const t of [0, null, [], "A-C", " A", "a\n"]) assert.throws(() => build("ABC", t), /only English letters/);
  assert.throws(() => build("a".repeat(25), "a"), /up to 24 characters in s/); assert.throws(() => build("abc", "a".repeat(13)), /up to 12 characters in t/);
  for (const params of [null, [], 2]) assert.throws(() => problem.builder("ABC", params), RangeError);
  for (const [s, t] of [["", "A"], ["ABC", ""], ["", ""]]) {
    const r = build(s, t); assert.deepEqual(r.steps.map(s => s.codeLines[0]), [5, 6]);
    assert.equal(r.answer, ""); assert.equal(r.steps.at(-1).minWindow76View.resultReason, "empty-input");
    assert.deepEqual(problem.liveArgs(s, { t }), [s, t]);
  }
  const max = build("A".repeat(12) + "B".repeat(12), "A".repeat(6) + "B".repeat(6));
  assert.equal(max.answer.length, 12); assert.equal(max.steps.at(-1).minWindow76View.trace.truncated, false);
});

function renderer(language, extra = {}) {
  const host = { innerHTML: "", querySelector: () => null, querySelectorAll: () => [] };
  const context = { lang: language, document: { getElementById: () => host }, ...extra };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-minimum-window-76.js"), "utf8"), context);
  return { context, host, render: step => { context.renderMinimumWindow76Pictures(step); return host.innerHTML; } };
}

test("76 pictures show actual quotas, counted characters, pointers and cached best in VI/EN", () => {
  for (const language of ["vi", "en"]) for (const [s, t] of cases) {
    const r = build(s, t), saved = JSON.stringify(r), ui = renderer(language), initial = ui.render(r.steps[0]);
    for (const step of r.steps) {
      const v = step.minWindow76View, html = ui.render(step); assert.doesNotMatch(html, /NaN|undefined|Infinity/);
      assert.equal([...html.matchAll(/data-source-index="\d+"/g)].length, s.length + 1);
      assert.deepEqual([...html.matchAll(/data-source-index="(\d+)" data-source-char="[^"]*" data-counted="true"/g)].map(m => +m[1]), v.counted);
      assert.equal([...html.matchAll(/class="mn76-l"/g)].length, v.left === null ? 0 : 1);
      assert.equal([...html.matchAll(/class="mn76-r"/g)].length, v.right === null ? 0 : 1);
      assert.ok(html.includes(`data-best-text="${v.best?.text ?? ""}"`));
      for (const item of v.need) assert.ok(html.includes(`data-need-char="${item.char}" data-need-count="${item.count}"`));
      assert.ok(html.includes(`data-missing="${v.missing}"`));
    }
    assert.equal(ui.render(r.steps[0]), initial); assert.equal(JSON.stringify(r), saved);
    assert.equal(ui.context.mn76Escape('<script>"&'), "&lt;script&gt;&quot;&amp;");
  }
});

test("76 jump controls and keyboard actions select real R/L moves, best writes and returns", () => {
  const r = build("ADOBECODEBANC", "ABC");
  for (const [kind, line] of [["right", 11], ["left", 21], ["best", 17], ["result", 22]]) {
    let stopped = 0, rendered = 0;
    const ui = renderer("vi", { steps: r.steps, stepIndex: 0, stopPlay: () => stopped++, renderStep: () => rendered++ });
    ui.context.mn76Jump(kind); assert.equal(r.steps[ui.context.stepIndex].codeLines[0], line); assert.equal(stopped, 1); assert.equal(rendered, 1);
    ui.context.stepIndex = r.steps.length - 1; ui.context.mn76Jump(kind); assert.equal(ui.context.stepIndex, r.steps.length - 1);
  }
  for (const key of ["Enter", " "]) {
    const handlers = {}, node = { dataset: { mn76Jump: "left" }, addEventListener: (name, fn) => { handlers[name] = fn; } };
    const host = { querySelectorAll: selector => selector === "[data-mn76-jump]" ? [node] : [] };
    const ui = renderer("vi", { steps: r.steps, stepIndex: 0, renderStep() {} }); let prevented = 0, stopped = 0;
    ui.context.mn76Bind(host); handlers.keydown({ key, preventDefault: () => prevented++, stopPropagation: () => stopped++ });
    assert.equal(r.steps[ui.context.stepIndex].codeLines[0], 21); assert.equal(prevented, 1); assert.equal(stopped, 1);
  }
});
