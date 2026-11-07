"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs"), vm = require("node:vm");
const p = require("../problems").SUPPORTED[87];
const run = (a, b) => p.builder(a, { s2: b });
const cases = [["great", "rgeat", true], ["abcde", "caebd", false], ["a", "a", true], ["ab", "ba", true],
  ["abc", "abd", false], ["aab", "aba", true], ["abcd", "bdac", false], ["abcdefgh", "hgfedcba", true], ["aabbccdd", "ddbbccaa", true]];

// Independent bottom-up DP, without recursion, Counter pruning or memo reads.
function oracle(a, b) {
  const n = a.length, dp = Array.from({ length: n + 1 }, () => Array.from({ length: n }, () => Array(n).fill(false)));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) dp[1][i][j] = a[i] === b[j];
  for (let length = 2; length <= n; length++) for (let i = 0; i + length <= n; i++) for (let j = 0; j + length <= n; j++) {
    for (let cut = 1; cut < length; cut++) {
      if (dp[cut][i][j] && dp[length - cut][i + cut][j + cut] || dp[cut][i][j + length - cut] && dp[length - cut][i + cut][j]) { dp[length][i][j] = true; break; }
    }
  }
  return dp[n][0][0];
}
function proof(node, s1, s2) {
  assert.equal(node.a, s1.slice(node.i, node.i + node.length)); assert.equal(node.b, s2.slice(node.j, node.j + node.length));
  if (node.mode === "equal") { assert.equal(node.a, node.b); assert.deepEqual(node.children, []); return; }
  assert.ok(node.cut > 0 && node.cut < node.length); assert.equal(node.children.length, 2);
  const [a, b] = node.children; assert.equal(a.length, node.cut); assert.equal(b.length, node.length - node.cut);
  assert.equal(a.a + b.a, node.a); assert.equal(node.mode === "swap" ? b.b + a.b : a.b + b.b, node.b);
  assert.equal(a.i, node.i); assert.equal(b.i, node.i + node.cut);
  assert.equal(a.j, node.mode === "swap" ? node.j + node.length - node.cut : node.j);
  assert.equal(b.j, node.mode === "swap" ? node.j : node.j + node.cut);
  proof(a, s1, s2); proof(b, s1, s2);
}

test("87 matches official examples, repeated letters, reversals and independent bottom-up DP", () => {
  const inputs = cases.map(([a, b, expected]) => { assert.equal(oracle(a, b), expected); return [a, b]; });
  for (let n = 1; n <= 4; n++) for (let a = 0; a < 2 ** n; a++) for (let b = 0; b < 2 ** n; b++) {
    const word = value => Array.from({ length: n }, (_, i) => "ab"[(value >> i) & 1]).join(""); inputs.push([word(a), word(b)]);
  }
  let seed = 87; const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  for (let k = 0; k < 50; k++) {
    const n = 5 + random(4), a = Array.from({ length: n }, () => "abcd"[random(4)]).join("");
    const chars = [...a]; for (let i = chars.length - 1; i > 0; i--) { const j = random(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
    inputs.push([a, chars.join("")]);
  }
  for (const [a, b] of inputs) {
    const r = run(a, b), last = r.steps.at(-1).scramble87View;
    assert.equal(r.answer, oracle(a, b), `${a} / ${b}`); assert.equal(last.answer, r.answer);
    assert.equal(r.steps.filter(s => s.final).length, 1); assert.equal(last.trace.truncated, false);
    if (r.answer) proof(last.witness, a, b); else assert.equal(last.witness, null);
  }
});

test("87 records real recursive calls, parent edges, stack frames and completed return values", () => {
  for (const [a, b] of cases) {
    const r = run(a, b), saved = JSON.stringify(r.steps[0]); let previousResults = [];
    for (const step of r.steps) {
      const v = step.scramble87View;
      assert.deepEqual(step.codeLines, [v.source.line]); assert.equal(v.source.text, p.code[v.source.line - 1].trim()); assert.equal(v.source.timing, "after");
      assert.equal(v.activeId, v.stack.at(-1) ?? null);
      const frames = v.frames.filter(frame => frame.name === "dfs"); assert.equal(v.stack.length, frames.length);
      v.stack.forEach((id, depth) => { const node = v.tree[id], x = frames[depth].locals; assert.deepEqual([node.i, node.j, node.length], [x.i, x.j, x.length]); });
      for (const node of v.tree) {
        assert.equal(node.id, v.tree.indexOf(node));
        if (node.parent !== null) {
          const parent = v.tree[node.parent], cut = node.cut; assert.ok(node.parent < node.id); assert.equal(node.depth, parent.depth + 1);
          assert.equal(node.i, parent.i + (node.side ? cut : 0)); assert.equal(node.length, node.side ? parent.length - cut : cut);
          const expectedJ = node.branch === "keep" ? parent.j + (node.side ? cut : 0) : parent.j + (node.side ? 0 : parent.length - cut);
          assert.equal(node.j, expectedJ);
        }
        if (previousResults[node.id] !== undefined && previousResults[node.id] !== null) assert.equal(node.result, previousResults[node.id]);
      }
      previousResults = v.tree.map(node => node.result);
      if (v.returning && v.scope === "dfs") assert.equal(v.tree[v.activeId].result, v.returned);
      if (v.source.line === 13) assert.equal(v.focus.same, v.branch);
      assert.deepEqual(v.memo, (v.outer.memo?.__pairs__ ?? []).map(([key, result]) => ({ key, result })));
      assert.deepEqual(step.vars.map(item => item.rawValue), step.vars.map(item => v.locals[item.name] ?? null));
    }
    assert.equal(JSON.stringify(r.steps[0]), saved);
    const final = r.steps.at(-1).scramble87View; assert.ok(final.tree.every(node => node.result !== null));
  }
});

test("87 short-circuits the second child, distinguishes keep from swap and reads cached values without reevaluation", () => {
  const r = run("great", "rgeat"); let sawSkip = false, sawKeep = false, sawSwap = false, sawHit = false;
  for (const step of r.steps) {
    const v = step.scramble87View;
    if (v.scope === "dfs" && [20, 23].includes(v.source.line)) {
      const branch = v.source.line === 20 ? "keep" : "swap", attempt = v.split[branch]; assert.ok(attempt.checked);
      assert.equal(attempt.result, v.branch); assert.notEqual(attempt.children[0], null);
      if (attempt.result) { assert.ok(attempt.children.every(child => child?.result === true)); if (branch === "keep") sawKeep = true; else sawSwap = true; }
      if (attempt.skipped) { sawSkip = true; assert.equal(attempt.children[0].result, false); assert.equal(attempt.children[1], null); }
      assert.ok(!v.memo.some(item => item.key.join(",") === [v.locals.i, v.locals.j, v.locals.length].join(",")));
    }
    if (v.source.line === 9 && v.branch) { sawHit = true; assert.ok(v.memo.some(item => item.key.join(",") === v.locals.key.join(","))); }
  }
  const last = r.steps.at(-1).scramble87View;
  for (const node of last.tree.filter(node => node.memoHit)) {
    const ownSteps = r.steps.filter(s => s.scramble87View.activeId === node.id);
    assert.deepEqual(ownSteps.map(s => s.codeLines[0]), [8, 9, 10]);
    assert.ok(ownSteps.every(s => !Object.hasOwn(s.scramble87View.locals, "a")));
  }
  assert.ok(sawSkip && sawKeep && sawSwap && sawHit); assert.equal(last.cacheHits, last.tree.filter(node => node.memoHit).length);
});

test("87 nested physical source lines, frame locals, memo, branches and returns agree with CPython", () => {
  const args = cases.map(([a, b]) => [a, b]);
  const source = "import json,sys,runpy\np=json.load(sys.stdin)\ntrace=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(trace({'code':p['code'],'method':'isScramble','args':a})) for a in p['args']]))";
  const native = spawnSync(process.env.PYTHON || "python3", ["-c", source], { input: JSON.stringify({ path: require.resolve("../problems/picture-trace.py"), code: p.code.join("\n"), args }), encoding: "utf8", maxBuffer: 48e6 });
  assert.equal(native.status, 0, native.stderr);
  JSON.parse(native.stdout).forEach((ref, index) => {
    const r = run(...args[index]); assert.equal(r.answer, ref.answer); assert.equal(r.steps.length, ref.events.length);
    ref.events.forEach((event, i) => { const v = r.steps[i].scramble87View; assert.deepEqual(r.steps[i].codeLines, [event.line]);
      for (const key of ["locals", "outer", "frames", "scope", "branch", "returned", "returning"]) assert.deepEqual(v[key], event[key]); });
  });
});

test("87 validates lowercase equal-length inputs and exposes a bounded, complete lesson with live arguments", () => {
  for (const a of [null, 87, [], "", "ABC", "a ", " a", "a\n", "a".repeat(9)]) assert.throws(() => run(a, "a"), RangeError);
  for (const b of [null, 87, [], "", "ABC", "a ", "a\n", "a".repeat(9)]) assert.throws(() => run("a", b), RangeError);
  assert.throws(() => run("ab", "a"), /equal length/);
  for (const params of [null, [], "ab"]) assert.throws(() => p.builder("ab", params), RangeError);
  assert.deepEqual(p.liveArgs("great", { s2: "rgeat" }), ["great", "rgeat"]);
  assert.equal(p.extraParams[0].key, "s2"); assert.equal(p.extraParams[0].type, "string"); assert.equal(p.debugMode, "line-by-line");
  assert.equal(p.visualizationLimits.maxLength, 8); assert.equal(p.visualizationLimits.completeTrace, true);
});

function renderer(language, extra = {}) {
  const host = { innerHTML: "", querySelector: () => null, querySelectorAll: () => [] };
  const context = { lang: language, document: { getElementById: () => host }, ...extra };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-scramble-string-87.js"), "utf8"), context);
  return { context, host, render: step => { context.renderScramble87Pictures(step); return host.innerHTML; } };
}

test("87 pictures show actual calls, complete memo entries, branch results and proof rows in VI/EN", () => {
  for (const language of ["vi", "en"]) for (const [a, b] of cases.slice(0, 6)) {
    const r = run(a, b), saved = JSON.stringify(r), ui = renderer(language), initial = ui.render(r.steps[0]);
    for (const step of r.steps) {
      const v = step.scramble87View, html = ui.render(step); assert.doesNotMatch(html, /NaN|undefined|Infinity/);
      const nodes = [...html.matchAll(/data-sc87-node="(\d+)" data-call-parent="(null|\d+)" data-call-result="(true|false|null)"/g)];
      assert.deepEqual(nodes.map(m => [+m[1], m[2] === "null" ? null : +m[2], m[3]]), v.tree.map(node => [node.id, node.parent, String(node.result)]));
      assert.deepEqual([...html.matchAll(/data-memo-key="([^"]*)" data-memo-result="(true|false)"/g)].map(m => [m[1], m[2] === "true"]), v.memo.map(item => [item.key.join(","), item.result]));
      if (v.split) for (const branch of ["keep", "swap"]) { assert.ok(html.includes(`data-branch-kind="${branch}" data-branch-result="${v.split[branch].result}"`)); if (v.split[branch].skipped) assert.ok(html.includes(`data-skipped="${branch}"`)); }
      if (v.witness) assert.ok(html.includes(`data-proof-a="${a}" data-proof-b="${b}"`));
    }
    assert.equal(ui.render(r.steps[0]), initial); assert.equal(JSON.stringify(r), saved);
    assert.equal(ui.context.sc87Escape('<script>"&'), "&lt;script&gt;&quot;&amp;");
  }
});

test("87 jump controls select real calls, cuts, cache hits and the final outer return", () => {
  const r = run("great", "rgeat");
  for (const [kind, line] of [["call", 8], ["cut", 19], ["memo", 9], ["result", 29]]) {
    let stopped = 0, rendered = 0; const ui = renderer("vi", { steps: r.steps, stepIndex: 0, stopPlay: () => stopped++, renderStep: () => rendered++ });
    ui.context.sc87Jump(kind); assert.equal(r.steps[ui.context.stepIndex].codeLines[0], line); assert.equal(stopped, 1); assert.equal(rendered, 1);
    ui.context.stepIndex = r.steps.length - 1; ui.context.sc87Jump(kind); assert.equal(ui.context.stepIndex, r.steps.length - 1);
  }
});

test("87 Enter/Space tree navigation opens the real first statement of a selected call", () => {
  const r = run("great", "rgeat");
  for (const key of ["Enter", " "]) {
    const node = r.steps.at(-1).scramble87View.tree.find(n => n.memoHit), handlers = {};
    const element = { dataset: { sc87Node: String(node.id) }, addEventListener: (name, fn) => { handlers[name] = fn; } };
    const host = { querySelectorAll: selector => selector === "[data-sc87-node]" ? [element] : [] };
    const ui = renderer("vi", { steps: r.steps, stepIndex: r.steps.length - 1, renderStep() {} }); let prevented = 0, stopped = 0;
    ui.context.sc87Bind(host); handlers.keydown({ key, preventDefault: () => prevented++, stopPropagation: () => stopped++ });
    assert.equal(ui.context.stepIndex, node.firstStep); assert.equal(r.steps[ui.context.stepIndex].scramble87View.activeId, node.id);
    assert.equal(prevented, 1); assert.equal(stopped, 1);
  }
});
