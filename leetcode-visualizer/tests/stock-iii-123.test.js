"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs"), vm = require("node:vm");
const p = require("../problems").SUPPORTED[123], fields = ["buy1", "sell1", "buy2", "sell2"];
const cases = [[3, 3, 5, 0, 0, 3, 1, 4], [1, 2, 3, 4, 5], [7, 6, 4, 3, 1], [3, 3, 3, 3], [0], [5], [0, 100000, 0, 100000], [5, 1, 5], [3, 5, 0, 4], [2, 1, 2, 0, 1]];
const run = prices => p.builder(prices);
function oracle(prices) {
  let answer = 0;
  for (let a = 0; a < prices.length; a++) for (let b = a + 1; b < prices.length; b++) {
    const first = prices[b] - prices[a]; answer = Math.max(answer, first);
    for (let c = b; c < prices.length; c++) for (let d = c + 1; d < prices.length; d++) answer = Math.max(answer, first + prices[d] - prices[c]);
  }
  return answer;
}
function checkPath(path, value, prices, day, hold, limit) {
  if (value === null) { assert.equal(path, null); return; }
  let cash = 0, sales = 0, previous = -1;
  path.forEach((action, index) => {
    assert.equal(action.kind, index % 2 ? "sell" : "buy"); assert.ok(action.day >= previous && action.day <= day);
    assert.equal(action.price, prices[action.day]); cash += action.kind === "buy" ? -action.price : action.price;
    if (action.kind === "sell") sales++; previous = action.day;
  });
  assert.equal(cash, value); assert.ok(sales <= limit);
  assert.equal(path.length % 2, hold ? 1 : 0); assert.ok(Math.ceil(path.length / 2) <= limit);
}

test("123 matches published cases and a brute-force enumeration of all valid trade pairs", () => {
  const inputs = [...cases];
  for (let n = 1; n <= 4; n++) for (let mask = 0; mask < 3 ** n; mask++) {
    let code = mask; inputs.push(Array.from({ length: n }, () => { const value = code % 3; code = Math.floor(code / 3); return value; }));
  }
  let seed = 123; const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  for (let k = 0; k < 100; k++) inputs.push(Array.from({ length: 1 + random(12) }, () => random(20)));
  for (const prices of inputs) {
    const original = [...prices], r = run(prices), last = r.steps.at(-1).stock123View;
    assert.equal(r.answer, oracle(prices), prices.join(",")); assert.equal(last.answer, r.answer);
    assert.equal(r.steps.filter(s => s.final).length, 1); assert.equal(last.trace.truncated, false);
    assert.equal(last.transactions.reduce((sum, t) => sum + t.profit, 0), r.answer); assert.ok(last.transactions.length <= 2);
    for (let i = 0; i < last.transactions.length; i++) { const t = last.transactions[i]; assert.ok(t.buy < t.sell); if (i) assert.ok(last.transactions[i - 1].sell <= t.buy); }
    assert.deepEqual(prices, original);
  }
  assert.equal(run(cases[0]).answer, 6); assert.equal(run(cases[1]).steps.at(-1).stock123View.transactions.length, 1);
  assert.deepEqual(run(cases[2]).steps.at(-1).stock123View.transactions, []);
});

test("123 each state uses today's already-updated predecessor and changes only on its physical assignment", () => {
  let freshSell = false, freshBuy = false;
  for (const prices of cases) {
    const r = run(prices); let previous = null;
    for (const step of r.steps) {
      const v = step.stock123View, x = v.locals, o = v.operation;
      assert.deepEqual(step.codeLines, [v.source.line]); assert.equal(v.source.text, p.code[v.source.line - 1].trim()); assert.equal(v.source.timing, "after");
      assert.deepEqual(v.values, Object.fromEntries(fields.map(name => [name, x[name] ?? null])));
      assert.deepEqual(step.vars.map(w => w.rawValue), step.vars.map(w => x[w.name] ?? null));
      if (o) {
        assert.equal(o.before, previous.values[o.target]); assert.equal(o.sourceValue, o.source ? v.values[o.source] : 0);
        assert.equal(o.candidate, o.sourceValue + (o.kind === "buy" ? -v.price : v.price));
        assert.equal(o.after, Math.max(o.before, o.candidate)); assert.equal(o.improved, o.candidate > o.before);
        for (const name of fields.filter(name => name !== o.target)) assert.equal(v.values[name], previous.values[name]);
        if (!o.improved) assert.deepEqual(v.paths[o.target], previous.paths[o.target]);
        if (o.target === "buy2" && o.sourceValue !== v.ledger[v.day - 1].values.sell1) freshSell = true;
        if (o.target === "sell2" && o.sourceValue !== v.ledger[v.day - 1].values.buy2) freshBuy = true;
      }
      previous = v;
    }
  }
  assert.ok(freshSell && freshBuy);
});

test("123 illustration paths obey holding constraints and exactly reproduce every real scalar state", () => {
  for (const prices of cases) {
    const r = run(prices), saved = JSON.stringify(r.steps[0]);
    for (const step of r.steps) {
      const v = step.stock123View;
      fields.forEach((name, index) => checkPath(v.paths[name], v.values[name], prices, v.day, index % 2 === 0, index < 2 ? 1 : 2));
      assert.deepEqual(v.focusPath, v.paths[v.focus]);
      assert.equal(v.transactions.length, Math.floor(v.focusPath.length / 2));
      if (v.answer !== null) { assert.equal(v.focus, "sell2"); assert.equal(v.answer, v.values.sell2); }
      assert.ok(!Object.hasOwn(v.locals, "paths")); assert.ok(!Object.hasOwn(v.locals, "transactions"));
    }
    assert.equal(JSON.stringify(r.steps[0]), saved);
  }
  const first = run([3, 5]).steps[0].stock123View;
  assert.equal(first.values.sell1, null); assert.equal(first.values.sell2, null); assert.equal(first.locals.i, undefined);
});

test("123 daily log waits for each actual update and never invents a day on loop exhaustion", () => {
  const r = run(cases[0]);
  for (const step of r.steps) {
    const v = step.stock123View, line = v.source.line, row = v.ledger.at(-1);
    if (line === 3) { assert.deepEqual(row.values, { buy1: -3, sell1: null, buy2: -3, sell2: null }); assert.equal(row.done, false); }
    if (line === 4) assert.ok(row.done);
    if (line === 5 && v.branch) assert.ok(Object.values(row.values).every(value => value === null));
    if (line >= 6 && line <= 9) fields.forEach((name, index) => assert.equal(row.values[name], index <= line - 6 ? v.values[name] : null));
    if (line === 9) assert.ok(row.done);
    if (line === 5 && !v.branch) assert.equal(v.ledger.length, v.prices.length);
  }
  assert.ok(r.steps.at(-1).stock123View.ledger.every(row => row.done));
});

test("123 line events, locals, loop branches and returns agree with native CPython", () => {
  const source = "import json,sys,runpy\np=json.load(sys.stdin)\ntrace=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(trace({'code':p['code'],'method':'maxProfit','args':[a]})) for a in p['inputs']]))";
  const native = spawnSync(process.env.PYTHON || "python3", ["-c", source], { input: JSON.stringify({ path: require.resolve("../problems/picture-trace.py"), code: p.code.join("\n"), inputs: cases }), encoding: "utf8", maxBuffer: 16e6 });
  assert.equal(native.status, 0, native.stderr);
  JSON.parse(native.stdout).forEach((ref, index) => {
    const r = run(cases[index]); assert.equal(r.answer, ref.answer); assert.equal(r.steps.length, ref.events.length);
    ref.events.forEach((event, j) => { const v = r.steps[j].stock123View; assert.deepEqual(r.steps[j].codeLines, [event.line]);
      for (const key of ["locals", "outer", "frames", "scope", "branch", "returned", "returning"]) assert.deepEqual(v[key], event[key]); });
  });
});

test("123 validates official price bounds and completely replays up to 100 days", () => {
  for (const input of [null, 123, "1,2", {}, [], [NaN], [Infinity], [-1], [100001], [1.5], [null], Array(2), Array(101).fill(1)]) assert.throws(() => run(input), RangeError);
  for (const [prices, expected] of [[Array(100).fill(0), 0], [Array.from({ length: 100 }, (_, i) => i % 2 ? 100000 : 0), 200000]]) {
    const r = run(prices), last = r.steps.at(-1).stock123View;
    assert.equal(r.answer, expected); assert.equal(last.ledger.length, 100); assert.ok(last.ledger.every(row => row.done));
    assert.equal(last.trace.truncated, false); assert.equal(last.trace.captured, r.steps.length);
  }
  assert.deepEqual(p.liveArgs([0, 3, 1]), [[0, 3, 1]]); assert.equal(p.inputKind, "nonneg"); assert.equal(p.debugMode, "line-by-line");
});

function renderer(language, extra = {}) {
  const host = { innerHTML: "", querySelector: () => null, querySelectorAll: () => [] };
  const context = { lang: language, document: { getElementById: () => host }, ...extra };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-stock-iii-123.js"), "utf8"), context);
  return { context, host, render: step => { context.renderStock123Pictures(step); return host.innerHTML; } };
}

test("123 pictures show actual scalar values, selected plans, markers and partial daily cells in VI/EN", () => {
  for (const language of ["vi", "en"]) for (const prices of cases.slice(0, 7)) {
    const r = run(prices), saved = JSON.stringify(r), ui = renderer(language), initial = ui.render(r.steps[0]);
    for (const step of r.steps) {
      const v = step.stock123View, html = ui.render(step); assert.doesNotMatch(html, /NaN|undefined|Infinity/);
      assert.deepEqual([...html.matchAll(/data-state-name="([^"]*)" data-state-value="([^"]*)"/g)].map(m => [m[1], m[2]]), fields.map(name => [name, String(v.values[name])]));
      assert.deepEqual([...html.matchAll(/data-st123-day="(\d+)" data-point-price="(\d+)"/g)].map(m => [+m[1], +m[2]]), prices.map((price, i) => [i, price]));
      assert.deepEqual([...html.matchAll(/data-action-kind="(buy|sell)" data-action-day="(\d+)"/g)].map(m => [m[1], +m[2]]), v.focusPath.map(action => [action.kind, action.day]));
      const cells = [...html.matchAll(/data-ledger-day="(\d+)" data-ledger-field="([^"]*)" data-ledger-value="([^"]*)"/g)].map(m => [+m[1], m[2], m[3]]);
      assert.deepEqual(cells, v.ledger.flatMap(row => fields.map(name => [row.day, name, String(row.values[name])])));
      if (v.answer !== null) assert.ok(html.includes(`data-answer="${v.answer}"`));
    }
    assert.equal(ui.render(r.steps[0]), initial); assert.equal(JSON.stringify(r), saved);
    assert.equal(ui.context.st123Escape('<script>"&'), "&lt;script&gt;&quot;&amp;");
  }
});

test("123 day/update/result jumps and keyboard chart selection target real Python statements", () => {
  const r = run(cases[0]);
  for (const [kind, predicate] of [["day", v => v.source.line === 5 && v.branch], ["update", v => v.operation?.improved], ["result", v => v.source.line === 10]]) {
    let rendered = 0, stopped = 0; const ui = renderer("vi", { steps: r.steps, stepIndex: 0, renderStep: () => rendered++, stopPlay: () => stopped++ });
    ui.context.st123Jump(kind); assert.ok(predicate(r.steps[ui.context.stepIndex].stock123View)); assert.equal(rendered, 1); assert.equal(stopped, 1);
    ui.context.stepIndex = r.steps.length - 1; ui.context.st123Jump(kind); assert.equal(ui.context.stepIndex, r.steps.length - 1);
  }
  for (const key of ["Enter", " "]) {
    const handlers = {}, node = { dataset: { st123Day: "3" }, addEventListener: (name, fn) => { handlers[name] = fn; } };
    const host = { querySelectorAll: selector => selector === "[data-st123-day]" ? [node] : [] };
    const ui = renderer("vi", { steps: r.steps, stepIndex: 0, renderStep() {} }); let prevented = 0, stopped = 0;
    ui.context.st123Bind(host); handlers.keydown({ key, preventDefault: () => prevented++, stopPropagation: () => stopped++ });
    assert.equal(r.steps[ui.context.stepIndex].stock123View.day, 3); assert.equal(r.steps[ui.context.stepIndex].codeLines[0], 5);
    assert.equal(prevented, 1); assert.equal(stopped, 1);
  }
});
