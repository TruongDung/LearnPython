"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const p = require("../problems").SUPPORTED[494];
const watches = ["target", "P", "num", "j", "sourceWays", "dp[j]"];
function oracle(nums, target) {
  let counts = new Map([[0, 1]]);
  for (const num of nums) {
    const next = new Map();
    for (const [sum, ways] of counts) { next.set(sum + num, (next.get(sum + num) || 0) + ways); next.set(sum - num, (next.get(sum - num) || 0) + ways); }
    counts = next;
  }
  return counts.get(target) || 0;
}

test("494 counts signed paths, including duplicate values, zero signs and negative targets", () => {
  let seed = 494;
  const random = n => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % n; };
  const cases = [[[0], 0], [[0, 0, 1], 1], [[1, 2, 1], -2], [[2, 4], 0], [[], 0], [[], 1], [[1], -1], [[1000], 1000], [[1000], -1000],
    ...Array.from({ length: 80 }, () => [Array.from({ length: 1 + random(8) }, () => random(8)), random(51) - 25])];
  for (const [nums, target] of cases) {
    const original = [...nums], run = p.builder(nums, { target });
    assert.equal(run.answer, oracle(nums, target));
    assert.deepEqual(nums, original);
    assert.equal(run.steps.filter(step => step.final).length, 1);
    for (const step of run.steps) assert.deepEqual(step.vars.map(v => v.name), watches);
    const end = run.steps.at(-1).targetSum494View;
    assert.equal(end.answer, run.answer);
    assert.equal(new Set(end.sampleAssignments.map(row => row.join(","))).size, end.sampleAssignments.length);
    end.sampleAssignments.forEach(signs => { assert.equal(signs.length, nums.length); assert.equal(signs.reduce((sum, sign, i) => sum + sign * nums[i], 0), target); });
  }
  assert.equal(p.builder(Array(20).fill(0), { target: 0 }).answer, 2 ** 20);
});

test("494 reads a frozen previous row and zero values double the previous count once", () => {
  for (const nums of [[1, 1, 1, 1, 1], [0, 0, 1], [2, 3, 0, 1]]) {
    const run = p.builder(nums, { target: nums.includes(0) ? 0 : 3 });
    let previous = null;
    for (const step of run.steps) {
      const v = step.targetSum494View, t = v.transition;
      if (t) {
        assert.equal(t.before, v.previous[t.destination]);
        assert.equal(t.sourceWays, v.previous[t.source]);
        if (v.phase === "consider-sum") assert.equal(v.dp[t.destination], t.before);
        if (v.phase === "update-sum") {
          assert.equal(v.dp[t.destination], t.before + t.sourceWays);
          assert.deepEqual(v.dp, previous.dp.map((value, i) => i === t.destination ? value + t.sourceWays : value));
          if (v.num === 0) assert.equal(v.dp[t.destination], 2 * t.before);
        }
      }
      previous = v;
    }
  }
  const zero = p.builder([0], { target: 0 }).steps.at(-1).targetSum494View;
  assert.deepEqual(zero.sampleAssignments, [[-1], [1]]);
});

test("494 displayed source and local state agree with CPython after each executed line", () => {
  const cases = [[[1, 1, 1, 1, 1], 3], [[0, 0, 1], 1], [[1, 2, 1], -2], [[1], 0], [[1], 3], [[5, 1], -4], [[], 0], [[1000], -1000]];
  const python = `import sys,json,copy\npayload=json.load(sys.stdin);out=[]\nfor nums,target in payload['cases']:\n scope={};filename='<target494>';exec(compile(payload['code'],filename,'exec'),scope);events=[];pending=None\n def trace(frame,event,arg):\n  global pending\n  if frame.f_code.co_filename!=filename or frame.f_code.co_name!='findTargetSumWays':return trace\n  if event in ('line','return'):\n   if pending is not None:events.append([pending,copy.deepcopy({k:frame.f_locals[k] for k in ['target','total','P','dp','num','j'] if k in frame.f_locals})])\n   pending=frame.f_lineno if event=='line' else None\n  return trace\n sys.settrace(trace);answer=scope['Solution']().findTargetSumWays(nums,target);sys.settrace(None);out.append({'events':events,'answer':answer})\nprint(json.dumps(out))`;
  const run = spawnSync(process.env.PYTHON || "python3", ["-c", python], { input: JSON.stringify({ code: p.code.join("\n"), cases }), encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  assert.equal(run.status, 0, run.stderr);
  JSON.parse(run.stdout).forEach((reference, i) => {
    const result = p.builder(cases[i][0], { target: cases[i][1] });
    const actual = result.steps.map(step => {
      const v = step.targetSum494View;
      return [v.line, { target: v.target, total: v.total, ...(v.subsetTarget === null ? {} : { P: v.subsetTarget }), ...(v.dp.length ? { dp: v.dp } : {}), ...(v.num === null ? {} : { num: v.num }), ...(v.currentSum === null ? {} : { j: v.currentSum }) }];
    });
    assert.equal(result.answer, reference.answer);
    assert.deepEqual(actual, reference.events, JSON.stringify(cases[i]));
  });
});

test("494 validates inputs and computes the full answer for larger visualizations", () => {
  for (const input of [[-1], [1.5], [Infinity], Array(21).fill(0), [1001], [1000, 1], "1,2", null]) assert.throws(() => p.builder(input, { target: 0 }), /#494/);
  for (const target of [1.2, "", true, 1001, -1001]) assert.throws(() => p.builder([1], { target }), /#494/);
  assert.deepEqual(p.liveArgs([0, 1], { target: -1 }), [[0, 1], -1]);
  const run = p.builder(Array(20).fill(50), { target: 0 }), final = run.steps.at(-1).targetSum494View;
  assert.equal(run.answer, 184756);
  assert.equal(final.detailed, false);
  assert.equal(final.dp[500], 184756);
  assert.equal(final.history.length, 20);
  assert.ok(run.steps.length < 100);
  assert.ok(final.sampleAssignments.every(signs => signs.filter(sign => sign === 1).length === 10));
});

test("494 renders small and large states in both languages without changing snapshots", () => {
  const source = fs.readFileSync(require.resolve("../public/renderer-target-sum-494.js"), "utf8");
  for (const lang of ["vi", "en"]) {
    const host = { innerHTML: "", querySelector: () => null, querySelectorAll: () => [] }, context = { lang, $: () => host };
    vm.createContext(context); vm.runInContext(source, context);
    for (const [nums, target] of [[[1, 1, 1, 1, 1], 3], [[0], 0], [[1], 0], [Array(20).fill(50), 0]]) {
      const run = p.builder(nums, { target }), original = JSON.stringify(run);
      for (const step of run.steps) {
        context.renderTargetSum494View(step);
        assert.match(host.innerHTML, /class="ts494p-viz"/);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|<p\b|<table\b/);
      }
      assert.equal(JSON.stringify(run), original);
    }
  }
  const css = fs.readFileSync(require.resolve("../public/target-sum-494.css"), "utf8");
  assert.match(css, /\[data-theme="light"\] \.ts494p-viz/);
  assert.match(css, /#varsPanel[^}]*position:sticky/);
});
