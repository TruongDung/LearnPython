"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[282];
const cases = [["123", 6], ["105", 5], ["00", 0], ["232", 8], ["123", 7], ["123", -5], ["0", 0], ["7", -7], ["1005", 5], ["345", 100], ["1234", 10], ["210", 2]];

// Evaluate products inside signed additive groups, independently of the
// backtracking implementation's cur - last + last * operand recurrence.
function evaluate(expression) {
  return (expression.match(/[+-]?\d+(?:\*\d+)*/g) || []).reduce((sum, term) => {
    const sign = term.startsWith("-") ? -1 : 1, core = term.replace(/^[+-]/, "");
    return sum + sign * core.split("*").reduce((product, value) => product * Number(value), 1);
  }, 0);
}
function oracle(num, target) {
  let expressions = [num[0]];
  for (const digit of num.slice(1)) expressions = expressions.flatMap(prefix => ["", "+", "-", "*"].map(op => prefix + op + digit));
  return expressions.filter(expr => (expr.match(/\d+/g) || []).every(piece => piece.length === 1 || piece[0] !== "0") && evaluate(expr) === target).sort();
}

test("282 enumerates all legal gap choices with correct precedence and no leading-zero operands", () => {
  let seed = 282;
  const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  const samples = [...cases, ["123456", 21], ["000000", 0], ["999999", 2147483647],
    ...Array.from({ length: 30 }, () => [Array.from({ length: 1 + random(5) }, () => random(5)).join(""), random(31) - 15])];
  for (const [num, target] of samples) {
    const run = problem.builder(num, Object.freeze({ target }));
    assert.deepEqual([...run.answer].sort(), oracle(num, target), `${num} → ${target}`);
    assert.equal(new Set(run.answer).size, run.answer.length);
    assert.equal(run.steps.filter(s => s.final).length, 1);
    assert.deepEqual(run.steps.at(-1).expression282View.results, run.answer);
    assert.ok(run.answer.every(expr => expr.replace(/[+*-]/g, "") === num));
  }
});

test("282 matches all completed Python lines, recursive frames' locals and saved results", () => {
  const source = problem.code.join("\n");
  const python = `import sys,json,copy
scope={};filename='<expression282>';exec(compile(json.load(sys.stdin),filename,'exec'),scope)
runs=[]
for num,target in ${JSON.stringify(cases)}:
 events=[];pending={}
 def trace(frame,event,arg):
  if frame.f_code.co_filename!=filename or frame.f_code.co_name not in ('addOperators','bt'):return trace
  if event in ('line','return'):
   if frame in pending:
    s=frame.f_locals
    events.append({'line':pending.pop(frame),'scope':frame.f_code.co_name,'locals':copy.deepcopy({k:s[k] for k in ('num','target','i','expr','cur','last','j','piece','operand') if k in s}),'results':list(s.get('result',[]))})
   if event=='line':pending[frame]=frame.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().addOperators(num,target);sys.settrace(None)
 runs.append({'events':events,'answer':answer})
print(json.dumps(runs))`;
  const proc = spawnSync("python3", ["-c", python], { input: JSON.stringify(source), encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  assert.equal(proc.status, 0, proc.stderr);
  JSON.parse(proc.stdout).forEach((reference, c) => {
    const [num, target] = cases[c], run = problem.builder(num, { target });
    assert.deepEqual(run.answer, reference.answer); assert.equal(run.steps.length, reference.events.length, num);
    run.steps.forEach((step, i) => {
      const v = step.expression282View, e = reference.events[i], s = e.locals;
      assert.deepEqual(step.codeLines, [e.line]); assert.equal(v.scope, e.scope); assert.deepEqual(v.locals, s);
      assert.equal(v.source.text, problem.code[e.line - 1]); assert.equal(v.source.timing, "after");
      assert.equal(v.resultCount, e.results.length); assert.deepEqual(v.results, e.results.slice(v.shownFrom));
      assert.deepEqual(step.vars.map(w => w.name), ["i", "j", "piece", "operand", "cur", "last", "expr", "len(result)"]);
      assert.deepEqual(step.vars.map(w => w.value), [s.i ?? "—", s.j ?? "—", s.piece ?? "—", s.operand ?? "—", s.cur ?? "—", s.last ?? "—", s.expr === undefined ? "—" : s.expr || "''", e.results.length]);
    });
  });
});

test("282 multiplication replaces the signed last term; concatenation and leading-zero breaks preserve actual bindings", () => {
  const coverage = new Set();
  for (const [num, target] of cases) {
    const run = problem.builder(num, { target }); let previous;
    for (const step of run.steps) {
      const v = step.expression282View, f = v.stack.at(-1);
      if (f?.expr) assert.equal(evaluate(f.expr), f.cur);
      v.stack.forEach((frame, depth) => {
        assert.equal(frame.expr.replace(/[+*-]/g, ""), num.slice(0, frame.i));
        if (depth) assert.ok(frame.i > v.stack[depth - 1].i);
      });
      if (v.phase === "enter" && v.transition?.operator === "*") {
        const change = v.transition;
        assert.equal(v.cur, change.fromCur - change.fromLast + change.fromLast * change.operand);
        assert.equal(v.last, change.fromLast * change.operand || 0);
        coverage.add(Math.sign(change.fromLast));
      }
      if (v.phase === "break") {
        assert.ok(v.j > v.i && num[v.i] === "0");
        assert.deepEqual(v.locals, previous.locals, "break never reads or converts the invalid candidate");
      }
      if (v.phase === "save") {
        assert.equal(v.cur, target); assert.equal(v.i, num.length); assert.equal(v.results.at(-1), v.expr);
      }
      if (v.phase === "range" && previous?.stack.at(-1)?.id === f.id) {
        assert.equal(v.piece, previous.piece); assert.equal(v.operand, previous.operand);
      }
      previous = v;
    }
  }
  assert.deepEqual([...coverage].sort(), [-1, 0, 1]);
  assert.ok(problem.builder("123", { target: 7 }).answer.includes("1+2*3"));
  assert.ok(problem.builder("123", { target: -5 }).answer.includes("1-2*3"));
  assert.ok(problem.builder("105", { target: 5 }).answer.includes("10-5"));
});

test("282 traces all six-digit branches beyond the old cutoff and validates solve/live inputs consistently", () => {
  const run = problem.builder("000000", { target: 0 });
  assert.equal(run.answer.length, 243); assert.ok(run.steps.length > 600);
  assert.equal(run.steps.at(-1).expression282View.results.length, 243);
  assert.deepEqual(run.steps.at(-1).expression282View.stack, []);
  assert.deepEqual(problem.liveArgs("105", { target: "5" }), ["105", 5]);
  assert.deepEqual(problem.liveArgs("123"), ["123", 6]);
  assert.equal(problem.extraParams.find(p => p.key === "target").allowNegative, true, "the solve API must accept negative targets too");
  for (const [num, params] of [["", {}], ["1234567", {}], [123, {}], [null, {}], ["1a", {}], [" 12", {}], ["1.2", {}], ["123", null], ["123", []], ["123", { target: NaN }], ["123", { target: Infinity }], ["123", { target: 1.5 }], ["123", { target: 2147483648 }], ["123", { target: -2147483649 }], ["123", { target: "5bad" }]]) {
    assert.throws(() => problem.builder(num, params), /282/); assert.throws(() => problem.liveArgs(num, params), /282/);
  }
});

function renderer(lang) {
  const host = { innerHTML: "", querySelector: () => null }, context = { lang, $: () => host,
    escapeHtml: x => String(x).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]) };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-expression-282.js"), "utf8"), context);
  return step => { context.renderExpression282Pictures(step); return host.innerHTML; };
}

test("282 pictures preserve digit order, expression terms, recursive frames and saved answers in both themes' languages", () => {
  for (const lang of ["vi", "en"]) {
    const render = renderer(lang);
    for (const [num, target] of cases.slice(0, 9)) {
      const run = problem.builder(num, { target }), original = JSON.stringify(run);
      for (const step of run.steps) {
        const v = step.expression282View, html = render(step);
        assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object|<p\b|<table\b/);
        assert.equal((html.match(/data-digit=/g) || []).length, num.length);
        assert.deepEqual([...html.matchAll(/data-frame-id="(\d+)"/g)].map(m => Number(m[1])), v.stack.map(f => f.id));
        assert.deepEqual([...html.matchAll(/data-result-number="(\d+)"/g)].map(m => Number(m[1])), v.results.map((_, i) => v.shownFrom + i + 1));
        const current = html.match(/<section class="ex282-current">(.*?)<\/section>/)[1];
        const terms = [...current.matchAll(/data-term="([\d+*-]+)"/g)].map(m => m[1]);
        assert.equal(terms.join(""), v.expr);
        assert.equal((current.match(/class="ex282-term last"/g) || []).length, v.expr ? 1 : 0);
        if (v.phase === "enter" && v.transition?.operator === "*") assert.match(html, /data-multiply=/);
        if (v.phase === "break") assert.match(html, /ex282-joined crossed/);
      }
      const first = render(run.steps[0]); render(run.steps.at(-1)); assert.equal(render(run.steps[0]), first);
      assert.equal(JSON.stringify(run), original);
    }
    assert.equal((render(problem.builder("000000", { target: 0 }).steps.at(-1)).match(/data-result-number=/g) || []).length, 243);
  }
});

test("282 has complete runnable Python, lazy assets, scoped light/dark colors and unwrapped horizontal code scrolling", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8"), script = fs.readFileSync(require.resolve("../public/script.js"), "utf8"), css = fs.readFileSync(require.resolve("../public/expression-282.css"), "utf8");
  assert.equal(problem.debugMode, "line-by-line");
  assert.ok(problem.code.includes("        result = []")); assert.ok(problem.code.includes("        bt(0, '', 0, 0)"));
  assert.match(html, /expression-282\.css[^\n]*data-problem-ids="282"/);
  assert.match(html, /renderer-expression-282\.js[^\n]*data-problem-ids="282"/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /(?:renderer-)?expression-282\.(?:css|js)/);
  assert.match(script, /Boolean\(step.expression282View\)[^\n]*renderExpression282Pictures\(step\)/);
  assert.match(css, /\[data-theme="light"\] \.ex282-viz/);
  assert.match(css, /\.code-panel\s*\{[^}]*overflow-x:auto/);
  assert.match(css, /\.code-line\s*\{[^}]*white-space:pre/);
});
