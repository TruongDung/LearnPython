"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[78];
const canonical = subsets => subsets.map(row => [...row].sort((a, b) => a - b).join(",")).sort();
const approaches = [["builder", 1], ["builder2", 2]];

test("78 retains both approaches and enumerates the entire power set without changing input", () => {
  let seed = 78;
  const random = max => { seed = (1664525 * seed + 1013904223) >>> 0; return seed % max; };
  const cases = [[0], [-1], [1, 2, 3], [-3, 0, 4], [9, -1, 3, 0],
    ...Array.from({ length: 25 }, () => [...new Set(Array.from({ length: 1 + random(5) }, () => random(31) - 15))])];
  assert.equal(problem.extraParams[0].options.length, 2);
  for (const nums of cases) {
    const before = [...nums], expected = nums.reduce((rows, value) => [...rows, ...rows.map(row => [...row, value])], [[]]);
    for (const [builder, codeBlock] of approaches) {
      const run = problem[builder](nums);
      assert.deepEqual(canonical(run.answer), canonical(expected));
      assert.equal(new Set(canonical(run.answer)).size, 2 ** nums.length);
      assert.deepEqual(nums, before);
      assert.deepEqual(run.answer[0], []);
      assert.ok(run.steps.every(step => step.codeBlock === codeBlock && step.codeLines.length === 1));
      assert.equal(run.steps.filter(step => step.final).length, 1);
      assert.ok(run.steps.at(-1).final);
    }
  }
});

test("78 bit switches add values only after append and keep all saved subsets frozen", () => {
  const run = problem.builder([0, -2, 5]), watches = ["mask", "i", "1 << i", "mask & (1 << i)", "subset", "len(result)"];
  let previous = null;
  for (const step of run.steps) {
    const v = step.subsets78View;
    assert.deepEqual(step.vars.map(x => x.name), watches);
    assert.deepEqual(v.selected.map(i => v.nums[i]), v.subset || []);
    if (previous && v.line === 8) assert.deepEqual(v.subset, previous.subset);
    if (previous && v.line === 9) assert.deepEqual(v.subset, [...previous.subset, v.nums[v.i]]);
    if (v.line === 10) assert.deepEqual(v.result.at(-1), v.subset);
    if (v.result.length && previous?.result.length) assert.deepEqual(v.result.slice(0, previous.result.length), previous.result);
    previous = v;
  }
  assert.deepEqual(run.answer.at(-1), [0, -2, 5]);
});

test("78 backtracking exposes actual recursive frames and restores current after every pop", () => {
  const run = problem.builder2([1, 2, 3]), watches = ["start", "i", "nums[i]", "current", "depth", "len(result)"];
  let previous = null;
  for (const step of run.steps) {
    const v = step.subsets78View;
    assert.deepEqual(step.vars.map(x => x.name), watches);
    assert.deepEqual(v.selected.map(i => v.nums[i]), v.current || []);
    assert.equal(v.tree.nodes.filter(node => node.saved).length, v.result.length);
    assert.equal(new Set(v.stack.map(f => f.id)).size, v.stack.length);
    v.stack.forEach((f, i) => {
      assert.equal(v.tree.nodes[f.id].depth, i);
      if (i) assert.equal(v.tree.nodes[f.id].parentId, v.stack[i - 1].id);
    });
    if (v.action?.kind === "pop") {
      assert.deepEqual(v.current, previous.current.slice(0, -1));
      assert.deepEqual(v.current, v.tree.nodes[v.currentId].indices.map(i => v.nums[i]));
    }
    if (v.action?.kind === "save") assert.deepEqual(v.result.at(-1), v.current);
    previous = v;
  }
  const final = run.steps.at(-1).subsets78View;
  assert.deepEqual(final.current, []);
  assert.deepEqual(final.stack, []);
  assert.ok(final.tree.nodes.every(node => node.status === "done" && node.saved));
});

test("78 checks distinct integer input and fully renders the six-value boundary", () => {
  for (const invalid of [[], [1, 1], [1.5], [NaN], [Infinity], [Number.MAX_SAFE_INTEGER + 1], [1, 2, 3, 4, 5, 6, 7], "1,2", null]) {
    for (const [builder] of approaches) assert.throws(() => problem[builder](invalid), /#78/);
    assert.throws(() => problem.liveArgs(invalid), /#78/);
  }
  for (const [builder] of approaches) {
    const run = problem[builder]([-3, -2, -1, 0, 1, 2]);
    assert.equal(run.answer.length, 64);
    assert.equal(run.steps.at(-1).subsets78View.result.length, 64);
  }
  assert.deepEqual(problem.liveArgs([0, 1]), [[0, 1]]);
});

test("78 displayed Python matches the state after each line, including nested calls and returns", () => {
  const cases = [];
  for (const nums of [[0], [1, 2, 3], [-2, 0, 7], [5, -3, 1, 0]]) {
    for (const [builder, block] of approaches) cases.push({ nums, builder, block, code: (block === 1 ? problem.code : problem.code2).join("\n") });
  }
  const python = `import sys,json,copy\noutput=[]\nfor case in json.load(sys.stdin):\n scope={};filename='<subsets78>';exec(compile(case['code'],filename,'exec'),scope);events=[];pending={}\n keys=['result','n','mask','subset','i'] if case['block']==1 else ['result','current','start','i']\n def trace(frame,event,arg):\n  if frame.f_code.co_filename!=filename or frame.f_code.co_name not in ('subsets','backtrack'):return trace\n  if event in ('line','return'):\n   if frame in pending:\n    snapshot=copy.deepcopy({k:frame.f_locals[k] for k in keys if k in frame.f_locals})\n    events.append([pending.pop(frame),frame.f_code.co_name,snapshot])\n   if event=='line':pending[frame]=frame.f_lineno\n  return trace\n sys.settrace(trace);answer=scope['Solution']().subsets(case['nums']);sys.settrace(None)\n output.append({'events':events,'answer':answer})\nprint(json.dumps(output))`;
  const result = spawnSync(process.env.PYTHON || "python3", ["-c", python], { input: JSON.stringify(cases), encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr);
  JSON.parse(result.stdout).forEach((reference, index) => {
    const { nums, builder, block } = cases[index], run = problem[builder](nums);
    const actual = run.steps.map(step => {
      const v = step.subsets78View, scope = block === 1 ? "subsets" : v.scope;
      const locals = block === 1 ? { result: v.result, ...(v.line === 3 ? {} : { n: nums.length }),
        ...Object.fromEntries(["mask", "subset", "i"].filter(key => Object.hasOwn(v, key)).map(key => [key, v[key]])) }
        : { result: v.result, ...(v.current === null ? {} : { current: v.current }), ...Object.fromEntries(["start", "i"].filter(key => Object.hasOwn(v.stack.at(-1) || {}, key)).map(key => [key, v.stack.at(-1)[key]])) };
      return [v.line, scope, locals];
    });
    assert.deepEqual(run.answer, reference.answer);
    assert.deepEqual(actual, reference.events, `${builder} ${nums}`);
  });
});

test("78 both picture modes render all states in Vietnamese and English without modifying snapshots", () => {
  const source = fs.readFileSync(require.resolve("../public/renderer-subsets-78.js"), "utf8");
  for (const lang of ["vi", "en"]) {
    const host = { innerHTML: "", querySelector: () => null }, context = { lang, $: () => host,
      escapeHtml: value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;") };
    vm.createContext(context); vm.runInContext(source, context);
    for (const [builder] of approaches) {
      const run = problem[builder]([0, -1, 3]), original = JSON.stringify(run);
      for (const step of run.steps) {
        context.renderSubsets78Pictures(step);
        assert.match(host.innerHTML, /class="s78-viz"/);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|<p\b|<table\b/);
        assert.equal((host.innerHTML.match(/data-result-index=/g) || []).length, step.subsets78View.result.length);
        if (builder === "builder2") assert.equal((host.innerHTML.match(/data-node-id=/g) || []).length, 8);
      }
      assert.equal(JSON.stringify(run), original);
    }
  }
});

test("78 lazy assets and scoped day/night styles keep watches visible and code free of inner vertical scrolling", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8"), script = fs.readFileSync(require.resolve("../public/script.js"), "utf8"), css = fs.readFileSync(require.resolve("../public/subsets-78.css"), "utf8");
  assert.match(html, /renderer-subsets-78\.js[^\n]*data-problem-ids="78"/);
  assert.match(html, /subsets-78\.css[^\n]*data-problem-ids="78"/);
  assert.match(script, /step\.subsets78View[\s\S]*renderSubsets78Pictures\(step\)/);
  assert.match(css, /\[data-theme="light"\] \.s78-viz/);
  assert.match(css, /#varsPanel[^}]*position:sticky/);
  assert.match(css, /\.code-panel[^}]*overflow-y:hidden/);
});
