"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs"), vm = require("node:vm");
const p = require("../problems").SUPPORTED[68];
const run = (words, maxWidth) => p.builder(words, { maxWidth });
const examples = [
  [p.defaultInput, 16, ["This    is    an", "example  of text", "justification.  "]],
  [["What", "must", "be", "acknowledgment", "shall", "be"], 16, ["What   must   be", "acknowledgment  ", "shall be        "]],
  [["Science", "is", "what", "we", "understand", "well", "enough", "to", "explain", "to", "a", "computer.", "Art", "is", "everything", "else", "we", "do"], 20,
    ["Science  is  what we", "understand      well", "enough to explain to", "a  computer.  Art is", "everything  else  we", "do                  "]],
  [["ab", "c", "d", "efghi"], 7, ["ab  c d", "efghi  "]],
  [["a"], 1, ["a"]], [["a", "bb", "c"], 8, ["a bb c  "]], [["a", "b", "c"], 1, ["a", "b", "c"]],
  [["longword", "a", "b"], 8, ["longword", "a b     "]],
];
function oracle(words, width) {
  const result = [];
  for (let start = 0; start < words.length;) {
    const end = Math.max(...Array.from({ length: words.length - start }, (_, i) => start + i + 1)
      .filter(end => words.slice(start, end).join(" ").length <= width));
    const row = words.slice(start, end);
    if (end === words.length || row.length === 1) result.push(row.join(" ").padEnd(width));
    else {
      const gaps = Array(row.length - 1).fill("");
      for (let space = 0; space < width - row.join("").length; space++) gaps[space % gaps.length] += " ";
      result.push(row.map((word, index) => word + (gaps[index] ?? "")).join(""));
    }
    start = end;
  }
  return result;
}

test("68 matches official outputs and an independent round-robin spacing oracle", () => {
  const cases = examples.map(([w, n, expected]) => { assert.deepEqual(oracle(w, n), expected); return [w, n]; });
  let seed = 68;
  const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  for (let sample = 0; sample < 90; sample++) {
    const width = 1 + random(24), words = [];
    for (let n = 1 + random(12); n > 0; n--) {
      const length = 1 + random(Math.min(width, 8));
      words.push(String.fromCharCode(65 + random(26)).repeat(length));
    }
    cases.push([words, width]);
  }
  cases.push([Array(20).fill("abcdef"), 24], [Array(20).fill("a"), 1], [["x".repeat(24)], 24]);
  for (const [words, width] of cases) {
    const original = JSON.stringify(words), r = run(words, width);
    assert.deepEqual(r.answer, oracle(words, width)); assert.ok(r.answer.every(line => line.length === width));
    assert.deepEqual(r.answer.flatMap(line => line.split(" ").filter(Boolean)), words);
    assert.equal(JSON.stringify(words), original); assert.equal(r.steps.filter(step => step.final).length, 1);
    assert.equal(r.steps.at(-1).textJustification68View.trace.truncated, false);
    assert.deepEqual(r.steps.at(-1).textJustification68View.answer, r.answer);
  }
});

test("68 every snapshot shows real parts or line text, and clearly separates draft packing from construction", () => {
  let sawStaleLocals = false, sawUnwrittenWidth = false;
  for (const [words, width] of examples) {
    const r = run(words, width), saved = JSON.stringify(r.steps[0]);
    for (const step of r.steps) {
      const v = step.textJustification68View, x = v.locals;
      assert.deepEqual(step.codeLines, [v.source.line]); assert.equal(v.source.text, p.code[v.source.line - 1].trim());
      assert.equal(v.source.timing, "after"); assert.deepEqual(v.output, x.lines);
      assert.equal(v.text, v.cells.map(cell => cell.char).join("")); assert.ok(v.cells.length <= width);
      if (v.boardMode === "draft") assert.equal(v.text, v.lineWords.join(" "));
      if (v.boardMode === "parts") assert.equal(v.text, x.parts.join(""));
      if (v.boardMode === "line") { assert.equal(v.text, x.line); assert.equal(v.text.length, width); }
      for (const variable of step.vars) assert.deepEqual(variable.rawValue, x[variable.name] ?? null);
      if (v.source.line === 7 && v.branch) {
        assert.equal(v.plan, null); assert.equal(v.partsReady, false); assert.equal(v.lineReady, false);
        assert.equal(v.text, ""); assert.equal(v.currentWidth, null);
        if (Object.hasOwn(x, "line")) sawStaleLocals = true;
      }
      if (v.source.line === 19 && v.branch) { assert.equal(v.currentWidth, null); if (Object.hasOwn(x, "width")) sawUnwrittenWidth = true; }
      if (v.source.line === 21) assert.equal(v.currentWidth, x.spaces + (x.gap < x.extra ? 1 : 0));
      if (v.fit) { assert.equal(v.fit.needed, v.fit.letters + v.fit.wordLength + v.fit.gaps); assert.equal(v.fit.fits, v.fit.needed <= width); }
      if (v.mode === "left") assert.equal(v.plan, null);
      if (v.plan) assert.equal(v.plan.total, v.plan.gaps * v.plan.base + v.plan.extra);
    }
    assert.equal(JSON.stringify(r.steps[0]), saved);
  }
  assert.ok(sawStaleLocals && sawUnwrittenWidth);
});

test("68 applies gap spaces only on append, colors exactly one extra cell per left gap, and right-pads only left-aligned lines", () => {
  const r = run(["ab", "c", "d", "efghi"], 7), first = line => r.steps.find(s => s.codeLines[0] === line).textJustification68View;
  assert.deepEqual(first(17).plan, { total: 3, gaps: 2, base: 1, extra: 1, widths: [2, 1] });
  assert.equal(first(18).text, ""); assert.equal(first(20).text, "ab"); assert.equal(first(21).text, "ab");
  assert.deepEqual(first(21).allocated, [null, null]); assert.equal(first(21).currentWidth, 2);
  assert.equal(first(22).text, "ab  "); assert.deepEqual(first(22).allocated, [2, null]);
  assert.deepEqual(first(22).cells.map(c => c.kind), ["letter", "letter", "gap", "extra"]);
  assert.equal(first(24).text, "ab  c d"); assert.equal(first(24).cells.filter(c => c.kind === "extra").length, 1);
  const final = r.steps.at(-1).textJustification68View;
  assert.equal(final.reason, "last"); assert.equal(final.text, "efghi  "); assert.equal(final.cells.filter(c => c.kind === "padding").length, 2);
  assert.equal(final.cells.filter(c => c.kind === "extra").length, 0);
  const single = run(["abcdef", "aa", "b"], 8).steps.find(s => s.codeLines[0] === 15).textJustification68View;
  assert.equal(single.reason, "single"); assert.equal(single.text, "abcdef  "); assert.equal(single.plan, null);
});

test("68 line events, actual locals, branches and returned values agree with CPython", () => {
  const args = examples.map(([words, width]) => [words, width]);
  const source = "import json,sys,runpy\np=json.load(sys.stdin)\ntrace=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(trace({'code':p['code'],'method':'fullJustify','args':a})) for a in p['args']]))";
  const native = spawnSync(process.env.PYTHON || "python3", ["-c", source], {
    input: JSON.stringify({ path: require.resolve("../problems/picture-trace.py"), code: p.code.join("\n"), args }), encoding: "utf8", maxBuffer: 32e6,
  });
  assert.equal(native.status, 0, native.stderr);
  JSON.parse(native.stdout).forEach((ref, index) => {
    const r = run(...args[index]); assert.deepEqual(r.answer, ref.answer); assert.equal(r.steps.length, ref.events.length);
    ref.events.forEach((event, i) => {
      const v = r.steps[i].textJustification68View; assert.deepEqual(r.steps[i].codeLines, [event.line]);
      for (const key of ["locals", "outer", "frames", "scope", "branch", "returned", "returning"]) assert.deepEqual(v[key], event[key]);
    });
  });
});

test("68 validates bounded words and width and prepares typed live-editor arguments without coercing words", () => {
  for (const words of [null, 5, {}, [], [12], [null], [""], ["a b"], [" a"], ["a\n"], ["đ"], Array(21).fill("a"), Array(20).fill("1234567")]) assert.throws(() => run(words, 8), RangeError);
  for (const width of [0, 25, -1, 1.5, "8", null, Infinity, NaN]) assert.throws(() => run(["a"], width), RangeError);
  assert.throws(() => run(["long"], 3), RangeError);
  for (const params of [null, [], "8"]) assert.throws(() => p.builder(["a"], params), RangeError);
  assert.deepEqual(p.liveArgs('["a","b"]', { maxWidth: 5 }), [["a", "b"], 5]);
  assert.deepEqual(p.liveArgs("a,b", { maxWidth: 5 }), [["a", "b"], 5]);
  assert.equal(p.debugMode, "line-by-line");
});

function renderer(language, extra = {}) {
  const host = { dataset: {}, innerHTML: "", querySelector: () => null, querySelectorAll: () => [] };
  const context = { lang: language, document: { getElementById: () => host }, ...extra };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-text-justification-68.js"), "utf8"), context);
  return { context, host, render: step => { context.renderTextJustification68View(step); return host.innerHTML; } };
}

test("68 draws exact character cells and gap allocation, with lossless output spaces in Vietnamese and English", () => {
  for (const language of ["vi", "en"]) for (const [words, width] of examples.slice(0, 6)) {
    const r = run(words, width), saved = JSON.stringify(r), ui = renderer(language), initial = ui.render(r.steps[0]);
    for (const step of r.steps) {
      const v = step.textJustification68View, html = ui.render(step);
      assert.doesNotMatch(html, /undefined|NaN|Infinity/);
      const cells = [...html.matchAll(/data-col="(\d+)" data-char="([^"]*)" data-cell-kind="([^"]*)"/g)];
      assert.equal(cells.length, width);
      assert.equal(cells.map(m => m[2]).join(""), v.text);
      assert.deepEqual(cells.filter(m => m[3] !== "empty").map(m => m[3]), v.cells.map(c => c.kind));
      if (v.plan) for (let gap = 0; gap < v.plan.gaps; gap++) assert.ok(html.includes(`data-gap-index="${gap}" data-gap-planned="${v.plan.widths[gap]}" data-gap-applied="${v.allocated[gap]}"`));
      for (const [index, line] of (v.output ?? []).entries()) assert.ok(html.includes(`data-output-index="${index}" data-output-value="${line}"`));
    }
    assert.equal(ui.render(r.steps[0]), initial); assert.equal(JSON.stringify(r), saved);
    const last = r.steps.at(-1); ui.host.dataset.tj68Spaces = "hidden";
    assert.ok(ui.render(last).includes(`data-output-value="${r.answer[0]}"`));
  }
  const ui = renderer("vi"); assert.equal(ui.context.tj68Escape('<script>"&'), "&lt;script&gt;&quot;&amp;");
  assert.doesNotMatch(ui.render(run(["<script>", "&"], 10).steps.at(-1)), /<script>/);
});

test("68 jumps use actual word range advances, gap appends and return statements", () => {
  const r = run(p.defaultInput, 16);
  for (const [kind, lines] of [["word", [8, 12]], ["gap", [22]], ["result", [27]]]) {
    let stopped = 0, rendered = 0;
    const ui = renderer("vi", { steps: r.steps, stepIndex: 0, stopPlay: () => stopped++, renderStep: () => rendered++ });
    ui.context.tj68Jump(kind); assert.ok(lines.includes(r.steps[ui.context.stepIndex].codeLines[0]));
    assert.equal(stopped, 1); assert.equal(rendered, 1);
    ui.context.stepIndex = r.steps.length - 1; ui.context.tj68Jump(kind); assert.equal(ui.context.stepIndex, r.steps.length - 1);
  }
});

test("68 Enter/Space navigation and visible-space toggles do not change trace state", () => {
  for (const key of ["Enter", " "]) {
    const handlers = {}, node = { dataset: { j68Jump: "gap" }, addEventListener: (name, fn) => { handlers[name] = fn; } };
    const host = { querySelectorAll: selector => selector === "[data-j68-jump]" ? [node] : [] };
    const r = run(p.defaultInput, 16), ui = renderer("vi", { steps: r.steps, stepIndex: 0, renderStep() {} });
    let prevented = 0, stopped = 0;
    ui.context.tj68Bind(host); handlers.keydown({ key, preventDefault: () => prevented++, stopPropagation: () => stopped++ });
    assert.equal(r.steps[ui.context.stepIndex].codeLines[0], 22); assert.equal(prevented, 1); assert.equal(stopped, 1);
  }
  const handlers = {}, node = { addEventListener: (name, fn) => { handlers[name] = fn; } };
  const host = { dataset: {}, querySelectorAll: selector => selector === "[data-j68-spaces]" ? [node] : [] };
  const ui = renderer("en", { renderStep() {} }); ui.context.tj68Bind(host);
  handlers.click(); assert.equal(host.dataset.tj68Spaces, "hidden"); handlers.click(); assert.equal(host.dataset.tj68Spaces, "visible");
});
