"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const p = require("../problems").SUPPORTED[474];
const watches = ["zeros", "ones", "z", "o", "skip", "take"];
function brute(strs, m, n) {
  let best = 0;
  for (let mask = 0; mask < 2 ** strs.length; mask++) {
    let zeros = 0, ones = 0, size = 0;
    strs.forEach((s, i) => { if (mask & (1 << i)) { size++; zeros += [...s].filter(c => c === "0").length; ones += [...s].filter(c => c === "1").length; } });
    if (zeros <= m && ones <= n) best = Math.max(best, size);
  }
  return best;
}

test("474 agrees with exhaustive subsets and returns a valid set of input positions", () => {
  let seed = 474;
  const random = n => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % n; };
  const pool = ["", "0", "1", "00", "11", "01", "001"];
  const cases = [[p.defaultInput, 5, 3], [["", "", "0"], 0, 0], [["0", "0", "1"], 1, 1], [[], 0, 0],
    ...Array.from({ length: 55 }, () => [Array.from({ length: 1 + random(7) }, () => pool[random(pool.length)]), random(6), random(6)])];
  for (const [strs, m, n] of cases) {
    const before = [...strs], run = p.builder(strs, { m, n }), end = run.steps.at(-1).onesZeros474View;
    assert.equal(run.answer, brute(strs, m, n));
    assert.deepEqual(strs, before);
    assert.equal(run.steps.filter(step => step.final).length, 1);
    assert.equal(end.witness.length, run.answer);
    assert.equal(new Set(end.witness).size, run.answer);
    const chars = end.witness.map(i => strs[i]).join("");
    assert.ok([...chars].filter(c => c === "0").length <= m);
    assert.ok([...chars].filter(c => c === "1").length <= n);
    for (const step of run.steps) assert.deepEqual(step.vars.map(v => v.name), watches);
  }
});

test("474 source values come from the previous item and every cell updates once per item", () => {
  for (const strs of [["10", "0", "1"], ["", "", "0"], ["0", "0"], ["000", "1"]]) {
    const run = p.builder(strs, { m: 2, n: 2 }), visited = new Set();
    for (const step of run.steps) {
      const v = step.onesZeros474View, t = v.transition;
      if (!t) continue;
      assert.equal(t.skip, v.previous[t.z][t.o]);
      if (t.takeFrom !== null) assert.equal(t.takeFrom, v.previous[t.sourceZ][t.sourceO]);
      if (v.phase === "update") {
        const key = `${v.activeIndex},${t.z},${t.o}`;
        assert.ok(!visited.has(key)); visited.add(key);
        assert.equal(v.dp[t.z][t.o], Math.max(t.skip, t.takeFrom + 1));
      }
    }
  }
});

test("474 source and locals match CPython after each executable line", () => {
  const cases = [[p.defaultInput, 5, 3], [["10"], 1, 1], [["000", "1"], 2, 1], [["", "0"], 1, 0], [["1", "0"], 0, 0], [[], 0, 0]];
  const python = `import sys,json,copy\npayload=json.load(sys.stdin);out=[]\nfor args in payload['cases']:\n scope={};filename='<ones474>';exec(compile(payload['code'],filename,'exec'),scope);events=[];pending=None\n def trace(frame,event,arg):\n  global pending\n  if frame.f_code.co_filename!=filename or frame.f_code.co_name!='findMaxForm':return trace\n  if event in ('line','return'):\n   if pending is not None:events.append([pending,copy.deepcopy({k:frame.f_locals[k] for k in ['m','n','rows','cols','dp','s','zeros','ones','z','o','skip','take'] if k in frame.f_locals})])\n   pending=frame.f_lineno if event=='line' else None\n  return trace\n sys.settrace(trace);answer=scope['Solution']().findMaxForm(*args);sys.settrace(None);out.append({'events':events,'answer':answer})\nprint(json.dumps(out))`;
  const pythonRun = spawnSync(process.env.PYTHON || "python3", ["-c", python], { input: JSON.stringify({ code: p.code.join("\n"), cases }), encoding: "utf8", maxBuffer: 12 * 1024 * 1024 });
  assert.equal(pythonRun.status, 0, pythonRun.stderr);
  JSON.parse(pythonRun.stdout).forEach((reference, i) => {
    const [strs, m, n] = cases[i], run = p.builder(strs, { m, n });
    const actual = run.steps.map(step => {
      const v = step.onesZeros474View;
      return [v.line, { m, n, rows: m + 1, cols: n + 1, ...(v.dp.length ? { dp: v.dp } : {}), ...(v.activeIndex !== null ? { s: strs[v.activeIndex] } : {}),
        ...Object.fromEntries(step.vars.filter(w => w.value !== "—").map(w => [w.name, w.value])) }];
    });
    assert.equal(run.answer, reference.answer);
    assert.deepEqual(actual, reference.events, JSON.stringify(cases[i]));
  });
});

test("474 validates capacities and binary strings while computing full large-input answers", () => {
  for (const strs of [["2"], ["01x"], [0], ["0".repeat(101)], Array(601).fill("0"), "0,1", null]) assert.throws(() => p.builder(strs, { m: 1, n: 1 }), /#474/);
  for (const value of [-1, 101, 1.5, "", true]) assert.throws(() => p.builder(["0"], { m: value, n: 0 }), /#474/);
  assert.deepEqual(p.liveArgs(["", "01"], { m: 1, n: 1 }), [["", "01"], 1, 1]);
  for (const [strs, m, n, answer] of [[Array(600).fill("0"), 100, 100, 100], [Array(600).fill(""), 0, 0, 600]]) {
    const run = p.builder(strs, { m, n }), end = run.steps.at(-1).onesZeros474View;
    assert.equal(run.answer, answer);
    assert.equal(end.dp[m][n], answer);
    assert.equal(end.history.length, 600);
    assert.ok(run.steps.length < 120);
    assert.equal(end.detailed, false);
  }
});

test("474 picture renderer handles initial, empty, oversized and final states in both languages", () => {
  const source = fs.readFileSync(require.resolve("../public/renderer-ones-and-zeroes-474.js"), "utf8");
  for (const lang of ["vi", "en"]) {
    const host = { innerHTML: "", querySelector: () => null }, context = { lang, $: () => host, escapeHtml: x => String(x) };
    vm.createContext(context); vm.runInContext(source, context);
    for (const [strs, m, n] of [[p.defaultInput, 5, 3], [["", "0"], 1, 0], [["000", "1"], 2, 1], [Array(40).fill("01"), 20, 20]]) {
      const run = p.builder(strs, { m, n }), original = JSON.stringify(run);
      for (const step of run.steps) {
        context.renderOnesAndZeroes474View(step);
        assert.match(host.innerHTML, /class="ozp-viz"/);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|<p\b|<table\b/);
      }
      assert.equal(JSON.stringify(run), original);
    }
  }
  const css = fs.readFileSync(require.resolve("../public/ones-and-zeroes-474.css"), "utf8");
  assert.match(css, /\[data-theme="light"\] \.ozp-viz/);
  assert.match(css, /#varsPanel[^}]*position:sticky/);
});
