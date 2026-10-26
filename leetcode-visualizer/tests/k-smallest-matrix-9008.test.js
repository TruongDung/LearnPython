"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const p = require("../problems").SUPPORTED[9008];
const watches = ["k", "value", "r", "c", "len(heap)", "len(answer)"];
const less = (a, b) => a[0] < b[0] || a[0] === b[0] && (a[1] < b[1] || a[1] === b[1] && a[2] < b[2]);

test("9008 returns the k smallest values for ragged rows, duplicates and unsorted columns", () => {
  let seed = 9008;
  const random = n => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % n; };
  const cases = [[[7]], [[3, 4], [-9, -1, 2]], [[1, 1, 1], [1], [1, 2]], [[-1.5, 2.5], [-2, 0]],
    ...Array.from({ length: 40 }, () => Array.from({ length: 1 + random(5) }, () => Array.from({ length: 1 + random(6) }, () => random(17) - 8).sort((a, b) => a - b)))];
  for (const matrix of cases) {
    const before = JSON.stringify(matrix), flat = matrix.flat().sort((a, b) => a - b);
    for (const k of [...new Set([1, flat.length, 1 + random(flat.length)])]) {
      const run = p.builder(matrix, { k });
      assert.deepEqual(run.answer, flat.slice(0, k));
      assert.equal(run.steps.filter(s => s.final).length, 1);
      for (const step of run.steps) {
        const v = step.matrixMerge9008View;
        assert.deepEqual(step.vars.map(w => w.name), watches);
        assert.deepEqual(v.answer, flat.slice(0, v.answer.length));
        assert.equal(new Set(v.taken.map(e => `${e.r},${e.c}`)).size, v.taken.length);
        assert.deepEqual(v.taken.map(e => matrix[e.r][e.c]), v.answer);
        assert.equal(new Set(v.heap.map(e => e[1])).size, v.heap.length);
        if (v.heapReady) v.heap.forEach((e, i) => { if (i) assert.ok(!less(e, v.heap[Math.floor((i - 1) / 2)])); });
      }
    }
    assert.equal(JSON.stringify(matrix), before);
  }
  assert.deepEqual(p.builder(p.defaultInput, { k: 5 }).answer, [1, 5, 9, 10, 11]);
});

test("9008 separates pop, append, neighbor check and push without changing earlier snapshots", () => {
  const run = p.builder("1,1,4;1;0,3", { k: 6 });
  run.steps.forEach((step, i) => {
    const v = step.matrixMerge9008View, previous = run.steps[i - 1]?.matrixMerge9008View;
    if (v.phase === "pop") {
      assert.deepEqual(v.answer, previous.answer);
      assert.deepEqual([v.value, v.r, v.c], previous.heap[0]);
      assert.equal(v.heap.length, previous.heap.length - 1);
    } else if (v.phase === "append") {
      assert.deepEqual(v.answer, [...previous.answer, v.value]);
      assert.deepEqual(v.heap, previous.heap);
    } else if (v.phase === "push") {
      assert.equal(v.heap.length, previous.heap.length + 1);
      assert.ok(v.heap.some(e => e[1] === v.r && e[2] === v.c + 1));
    }
  });
  const first = JSON.stringify(run.steps[0]);
  run.steps.at(-1).matrixMerge9008View.matrix[0][0] = 999;
  assert.equal(JSON.stringify(run.steps[0]), first);
  assert.deepEqual(run.answer, [0, 1, 1, 1, 3, 4]);
  const short = p.builder("1,2;3,4", { k: 1 }).steps.at(-1).matrixMerge9008View;
  assert.deepEqual(short.heap, [[2, 0, 1], [3, 1, 0]], "last push must still run before returning");
});

test("9008 watches and exact heap layout match CPython after every source line", () => {
  const cases = [[[ [5, 8], [-3, 7], [1, 1] ], 5], [[[1, 1], [1], [1, 1, 2]], 6], [[[7]], 1], [[[-1.5, 0, 2.5]], 2]];
  const python = `import sys,json,copy\npayload=json.load(sys.stdin);out=[]\nfor args in payload['cases']:\n scope={};filename='<merge9008>';exec(compile(payload['code'],filename,'exec'),scope);events=[];pending=None\n def trace(frame,event,arg):\n  global pending\n  if frame.f_code.co_filename!=filename or frame.f_code.co_name!='k_smallest':return trace\n  if event in ('line','return'):\n   if pending is not None:events.append([pending,copy.deepcopy({k:frame.f_locals[k] for k in ['matrix','k','heap','answer','_','value','r','c'] if k in frame.f_locals})])\n   pending=frame.f_lineno if event=='line' else None\n  return trace\n sys.settrace(trace);answer=scope['k_smallest'](*args);sys.settrace(None);out.append({'events':events,'answer':answer})\nprint(json.dumps(out))`;
  const reference = spawnSync(process.env.PYTHON || "python3", ["-c", python], { input: JSON.stringify({ code: p.code.join("\n"), cases }), encoding: "utf8" });
  assert.equal(reference.status, 0, reference.stderr);
  JSON.parse(reference.stdout).forEach((expected, i) => {
    const [matrix, k] = cases[i], run = p.builder(matrix, { k });
    const actual = run.steps.map(step => {
      const v = step.matrixMerge9008View;
      const locals = { matrix, k, heap: v.heap, ...(v.answerReady ? { answer: v.answer } : {}),
        ...(v.iteration !== undefined ? { _: v.iteration } : {}), ...(v.value !== undefined ? { value: v.value, r: v.r, c: v.c } : {}) };
      const watched = { k, value: v.value, r: v.r, c: v.c, "len(heap)": v.heap.length, "len(answer)": v.answerReady ? v.answer.length : undefined };
      assert.deepEqual(step.vars, watches.map(name => ({ name, value: watched[name] ?? "—" })));
      return [step.codeLines[0], locals];
    });
    assert.deepEqual(run.answer, expected.answer);
    assert.deepEqual(actual, expected.events);
  });
});

test("9008 rejects malformed inputs and keeps every cell at its visual limit", () => {
  for (const matrix of ["", "1,", "1;;2", "2,1", "NaN", "Infinity", "[[]]", "null", [[true]], [[null]], [[1e10]], Array(13).fill([1]), [Array(17).fill(1)]]) {
    assert.throws(() => p.builder(matrix, { k: 1 }), /#9008/);
    assert.throws(() => p.liveArgs(matrix, { k: 1 }), /#9008/);
  }
  for (const k of [0, -1, 3, 1.5, "", true]) assert.throws(() => p.builder("1;2", { k }));
  assert.deepEqual(p.liveArgs("3,4;-2,0,2.5", { k: "3" }), [[[3, 4], [-2, 0, 2.5]], 3]);
  const matrix = Array.from({ length: 12 }, (_, r) => Array.from({ length: 16 }, (_, c) => r + c * 12));
  const run = p.builder(matrix, { k: 192 });
  assert.deepEqual(run.answer, Array.from({ length: 192 }, (_, i) => i));
  assert.equal(run.steps.at(-1).matrixMerge9008View.taken.length, 192);
  assert.ok(run.steps.length < 1000);
});

test("9008 pictures render both languages, preserve rewind state and load only for this lesson", () => {
  const source = fs.readFileSync(require.resolve("../public/renderer-k-smallest-matrix-9008.js"), "utf8");
  for (const lang of ["vi", "en"]) {
    const host = { innerHTML: "", querySelector: () => null }, context = { lang, $: () => host, escapeHtml: value => String(value) };
    vm.createContext(context); vm.runInContext(source, context);
    for (const [input, k] of [[p.defaultInput, 5], ["1,1;1", 3], ["5,6;-9,2,7", 1]]) {
      const run = p.builder(input, { k }), before = JSON.stringify(run), pictures = [];
      for (const step of run.steps) {
        context.renderMatrixMerge9008(step); pictures.push(host.innerHTML);
        assert.match(host.innerHTML, /class="km8-viz"/);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|<p\b/);
        assert.equal([...host.innerHTML.matchAll(/data-cell=/g)].length, run.original.flat().length);
        assert.equal([...host.innerHTML.matchAll(/data-result-cell=/g)].length, step.matrixMerge9008View.answer.length);
      }
      run.steps.forEach((_, i) => {
        const index = run.steps.length - 1 - i;
        context.renderMatrixMerge9008(run.steps[index]); assert.equal(host.innerHTML, pictures[index]);
      });
      assert.equal(JSON.stringify(run), before);
    }
  }
  const css = fs.readFileSync(require.resolve("../public/k-smallest-matrix-9008.css"), "utf8");
  assert.match(css, /\[data-theme="light"\] \.km8-viz/);
  assert.match(css, /#varsPanel[^}]*position:sticky/);
  assert.match(css, /\.code-panel[^}]*max-height:none/);
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  assert.match(html, /k-smallest-matrix-9008\.css/);
  assert.match(html, /renderer-k-smallest-matrix-9008\.js/);
  assert.match(fs.readFileSync(require.resolve("../public/script.js"), "utf8"), /Boolean\(step.matrixMerge9008View\)/);
});
