"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs"), vm = require("node:vm");
const problem = require("../problems").SUPPORTED[65];
const run = input => problem.builder(input);
const valid = ["2", "0089", "-0.1", "+3.14", "4.", "-.9", "2e10", "-90E3", "3e+7", "+6e-1", "53.5e93", "-123.456e789", "0", "46.e3", ".1e-2"];
const invalid = ["abc", "1a", "1e", "e3", "99e2.5", "--6", "-+3", "95a54e53", ".", "e", "", "+", "-.", "1e+", "1ee2", "1e2e3", " 1", "1 ", "1\t", "\n", "١", "１２", "💡", "0x10", "Infinity", "NaN", "1_0"];
const oracle = s => /^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/u.exec(s)?.[0] === s;
const samples = [...valid, ...invalid];
for (const sign of ["", "+", "-"]) for (const mantissa of ["0", "12", "0.", "12.34", ".7"]) for (const exponent of ["", "e0", "E-2", "e+9"]) samples.push(sign + mantissa + exponent);
let seed = 65;
const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
for (let count = 0; count < 100; count++) {
  let value = "";
  for (let length = random(9); length > 0; length--) value += "01.+-eEx "[random(9)];
  samples.push(value);
}

test("65 agrees with official examples and an independent full-string grammar oracle", () => {
  for (const input of valid) assert.ok(oracle(input), input);
  for (const input of invalid) assert.equal(oracle(input), false, input);
  for (const input of samples) {
    const result = run(input), last = result.steps.at(-1).validNumber65View;
    assert.equal(result.answer, oracle(input), JSON.stringify(input)); assert.equal(last.answer, result.answer);
    assert.equal(result.steps.filter(s => s.final).length, 1);
    assert.equal(last.source.line, result.answer || last.reason === "incomplete" ? 29 : 27);
    if (result.answer) { assert.ok(last.accepting.includes(last.state)); assert.equal(last.trail.length, [...input].length); }
    if (last.reason === "blocked") assert.ok(last.errorIndex < [...input].length);
  }
});

test("65 classification, lookup and state mutation happen on separate real source statements", () => {
  const seenGroups = new Set(), seenStates = new Set(); let sawRetainedGroup = false, sawSelfLoop = false;
  for (const input of ["+3.14e-2", "-.9", "99e2.5", "abc", "", "123", "1e", "1 ", "💡1"]) {
    let previous = null, moves = 0;
    const result = run(input), saved = JSON.stringify(result.steps[0]);
    for (const step of result.steps) {
      const v = step.validNumber65View, x = v.locals;
      assert.deepEqual(step.codeLines, [v.source.line]); assert.equal(v.source.text, problem.code[v.source.line - 1].trim());
      assert.equal(v.source.timing, "after"); assert.equal(v.state, x.state ?? null);
      assert.deepEqual(step.vars, ["i", "ch", "g", "state"].map(name => ({ name, value: x[name] ?? "—", rawValue: x[name] ?? null })));
      assert.equal(v.machineReady, Array.isArray(x.states));
      if (v.machineReady) assert.deepEqual(v.machine, x.states);
      if (v.state !== null) seenStates.add(v.state);
      if (v.classified) seenGroups.add(v.classified);
      if (v.source.line === 15 && v.branch) {
        assert.equal(v.cursor, x.i); assert.equal(v.classified, null); assert.equal(v.lookup, null); assert.equal(v.move, null);
        if (x.i > 0) { assert.equal(x.g, previous.locals.g); sawRetainedGroup = true; }
      }
      if (v.source.line === 26) {
        assert.equal(v.state, previous.state); assert.equal(v.lookup.allowed, !v.branch);
        assert.equal(v.lookup.to, v.machine[v.state][x.g] ?? null); assert.equal(v.lookup.index, x.i);
        assert.equal(v.move, null);
      }
      if (v.source.line === 28) {
        moves++; assert.equal(v.move.from, previous.state); assert.equal(v.state, previous.lookup.to);
        assert.equal(v.consumed[x.i], x.g === "e" || previous.state >= 5 ? "exponent" : x.g);
        sawSelfLoop ||= previous.state === v.state;
      } else if (previous && v.source.line !== 14) assert.equal(v.state, previous.state);
      if (v.source.line === 15 && !v.branch) assert.equal(v.cursor, v.chars.length);
      if (v.reason === "blocked") { assert.equal(v.state, previous.state); assert.equal(v.consumed[v.errorIndex], null); }
      assert.equal(v.trail.length, moves); previous = v;
    }
    assert.equal(JSON.stringify(result.steps[0]), saved);
  }
  assert.deepEqual([...seenStates].sort(), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual([...seenGroups].sort(), ["digit", "dot", "e", "invalid", "sign"]);
  assert.ok(sawRetainedGroup && sawSelfLoop);
});

test("65 complete physical line events, locals, branches and returns agree with native Python", () => {
  const inputs = [...valid, ...invalid];
  const source = "import json,sys,runpy\np=json.load(sys.stdin)\ntrace=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(trace({'code':p['code'],'method':'isNumber','args':[s]})) for s in p['inputs']]))";
  const native = spawnSync(process.env.PYTHON || "python3", ["-c", source], {
    input: JSON.stringify({ path: require.resolve("../problems/picture-trace.py"), code: problem.code.join("\n"), inputs }),
    encoding: "utf8", maxBuffer: 48e6,
  });
  assert.equal(native.status, 0, native.stderr);
  JSON.parse(native.stdout).forEach((ref, index) => {
    const result = run(inputs[index]); assert.equal(result.answer, ref.answer);
    assert.equal(result.steps.length, ref.events.length, inputs[index]);
    ref.events.forEach((event, i) => {
      const step = result.steps[i], v = step.validNumber65View; assert.deepEqual(step.codeLines, [event.line]);
      for (const key of ["locals", "outer", "frames", "scope", "branch", "returned", "returning"]) assert.deepEqual(v[key], event[key]);
    });
  });
});

test("65 accepts at most twenty characters, preserves whitespace, and leaves invalid text for the DFA to reject", () => {
  for (const value of [null, 65, [], {}, "1".repeat(21)]) assert.throws(() => run(value), RangeError);
  for (const value of ["1".repeat(20), "1e" + "9".repeat(18), "+.1E-" + "8".repeat(15)]) {
    const result = run(value); assert.ok(result.answer); assert.equal(result.steps.at(-1).validNumber65View.trace.truncated, false);
    assert.equal(result.steps.length, result.steps.at(-1).validNumber65View.trace.captured);
  }
  for (const value of ["", " 1 ", "1\n", "<script>", "💡"]) {
    assert.equal(run(value).answer, false); assert.deepEqual(problem.liveArgs(value), [value]);
  }
  assert.equal(problem.preserveInputWhitespace, true); assert.equal(problem.allowEmptyInput, true);
  assert.equal(problem.debugMode, "line-by-line");
});

function renderer(language, extra = {}) {
  const host = { innerHTML: "", querySelector: () => null, querySelectorAll: () => [] };
  const context = { lang: language, document: { getElementById: () => host }, ...extra };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-valid-number-65.js"), "utf8"), context);
  return { context, host, render: step => { context.renderValidNumber65Pictures(step); return host.innerHTML; } };
}

test("65 draws the actual machine, selected category, active state, checked edge and committed edge in VI/EN", () => {
  for (const language of ["vi", "en"]) for (const input of ["+3.14e-2", "1e", "99e2.5", "<script>", "💡", ""]) {
    const result = run(input), saved = JSON.stringify(result), ui = renderer(language), initial = ui.render(result.steps[0]);
    for (const step of result.steps) {
      const v = step.validNumber65View, html = ui.render(step);
      assert.doesNotMatch(html, /NaN|undefined|Infinity|<script>/);
      assert.equal([...html.matchAll(/data-state-id="(\d+)"/g)].length, 8);
      const active = [...html.matchAll(/data-state-id="(\d+)" data-state-current="true"/g)].map(m => +m[1]);
      assert.deepEqual(active, v.state === null ? [] : [v.state]);
      const edges = [...html.matchAll(/data-edge-from="(\d+)" data-edge-to="(\d+)" data-edge-group="([^"]+)"/g)].map(m => [+m[1], +m[2], m[3]]);
      assert.deepEqual(edges, v.machine.flatMap((row, from) => Object.entries(row).map(([group, to]) => [from, to, group])));
      if (v.move) assert.ok(html.includes(`data-edge-from="${v.move.from}" data-edge-to="${v.move.to}" data-edge-group="${v.move.group}" data-edge-active="move"`));
      if (v.lookup?.allowed && !v.move) assert.ok(html.includes(`data-edge-from="${v.lookup.from}" data-edge-to="${v.lookup.to}" data-edge-group="${v.lookup.group}" data-edge-active="check"`));
      assert.equal([...html.matchAll(/data-kind-picked="true"/g)].length, v.classified ? 1 : 0);
      assert.ok(html.includes(`data-answer="${v.answer}"`));
    }
    assert.equal(ui.render(result.steps[0]), initial); assert.equal(JSON.stringify(result), saved);
  }
});

test("65 navigation reaches the next character, actual update and real final return", () => {
  for (const input of ["+3.14e-2", "abc", ""]) for (const kind of ["char", "move", "result"]) {
    const result = run(input); let stopped = 0, rendered = 0;
    const ui = renderer("vi", { steps: result.steps, stepIndex: 0, stopPlay: () => stopped++, renderStep: () => rendered++ });
    ui.context.num65Jump(kind); const step = result.steps[ui.context.stepIndex], v = step.validNumber65View;
    assert.ok(v.answer !== null || (kind === "char" ? v.source.line === 15 && v.branch : v.source.line === 28));
    assert.equal(stopped, 1); assert.equal(rendered, 1);
    ui.context.stepIndex = result.steps.length - 1; ui.context.num65Jump(kind); assert.equal(ui.context.stepIndex, result.steps.length - 1);
  }
});

test("65 keyboard navigation handles Enter and Space exactly once without global playback", () => {
  for (const key of ["Enter", " "]) {
    const handlers = {}, node = { dataset: { num65Jump: "move" }, addEventListener: (name, fn) => { handlers[name] = fn; } };
    const host = { querySelectorAll: selector => selector === "[data-num65-jump]" ? [node] : [] };
    const result = run("+2"), ui = renderer("vi", { steps: result.steps, stepIndex: 0, renderStep() {} });
    let prevented = 0, stopped = 0;
    ui.context.num65Bind(host); handlers.keydown({ key, preventDefault: () => prevented++, stopPropagation: () => stopped++ });
    assert.equal(result.steps[ui.context.stepIndex].codeLines[0], 28); assert.equal(prevented, 1); assert.equal(stopped, 1);
  }
});
