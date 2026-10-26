"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const { spawnSync } = require("node:child_process");
const { SUPPORTED } = require("../problems");
const { prepareDesignLiveRun } = require("../live-args");
const ids = [378, 3619, 2407, 977, 2353];
const defaults = id => Object.fromEntries((SUPPORTED[id].extraParams || []).map(p => [p.key, p.default]));
const build = (id, input = SUPPORTED[id].defaultInput, params = defaults(id)) => SUPPORTED[id].builder(input, params);
const refs = [];
let seed = 378;
const random = n => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % n; };

function islandOracle(grid, k) {
  const seen = new Set(); let answer = 0;
  grid.forEach((row, r) => row.forEach((v, c) => {
    if (!v || seen.has(`${r},${c}`)) return;
    const stack = [[r, c]]; let sum = 0; seen.add(`${r},${c}`);
    while (stack.length) {
      const [x, y] = stack.pop(); sum += grid[x][y];
      for (const [a, b] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (grid[a]?.[b] > 0 && !seen.has(`${a},${b}`)) { seen.add(`${a},${b}`); stack.push([a, b]); }
      }
    }
    if (sum % k === 0) answer++;
  }));
  return answer;
}

test("378 merges sorted rows correctly at every k, including duplicates, negatives and one cell", () => {
  for (let sample = 0; sample < 35; sample++) {
    const n = 1 + random(5), matrix = Array.from({ length: n }, () => Array(n).fill(0));
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) matrix[r][c] = Math.max(r ? matrix[r - 1][c] : -9, c ? matrix[r][c - 1] : -9) + random(3);
    const flat = matrix.flat().sort((a, b) => a - b);
    for (const k of [...new Set([1, n * n, 1 + random(n * n)])]) {
      const run = build(378, JSON.stringify(matrix), { k });
      assert.equal(run.answer, flat[k - 1]);
      assert.deepEqual(run.steps.at(-1).pictureStudyView.taken.map(e => e.val), flat.slice(0, k));
      refs.push({ id: 378, args: [matrix, k], answer: run.answer });
    }
  }
  assert.equal(build(378).answer, 13);
});

test("977 fills each result position once and matches a sorting oracle", () => {
  for (const nums of [[0], [-5], [-2, -2, 0, 2, 2], [-9, -5, -1], [1, 4, 9],
    ...Array.from({ length: 50 }, () => Array.from({ length: 1 + random(20) }, () => random(51) - 25).sort((a, b) => a - b))]) {
    const copy = [...nums], run = build(977, nums);
    assert.deepEqual(run.answer, nums.map(x => x ** 2).sort((a, b) => a - b));
    assert.deepEqual(nums, copy);
    const writes = run.steps.map(s => s.pictureStudyView).filter(v => v.action?.kind === "write");
    assert.deepEqual(writes.map(v => v.action.to), Array.from({ length: nums.length }, (_, i) => nums.length - i - 1));
    assert.equal(new Set(writes.map(v => v.action.from)).size, nums.length);
    assert.ok(run.steps.at(-1).pictureStudyView.written.every(Boolean));
    refs.push({ id: 977, args: [nums], answer: run.answer });
  }
});

test("3619 counts four-connected positive islands and enqueues each cell once", () => {
  const cases = [ [[[0]], 5], [[[3]], 3], [[[2]], 3], [[[3, 0, 3], [0, 3, 0]], 3],
    ...Array.from({ length: 40 }, () => [Array.from({ length: 1 + random(5) }, () => Array.from({ length: 4 }, () => random(8))), 1 + random(8)]) ];
  assert.equal(build(3619).answer, 2);
  for (const [grid, k] of cases) {
    const before = JSON.stringify(grid), run = build(3619, JSON.stringify(grid), { k });
    assert.equal(run.answer, islandOracle(grid, k));
    assert.equal(JSON.stringify(grid), before);
    const end = run.steps.at(-1).pictureStudyView;
    assert.equal(new Set(end.seen).size, grid.flat().filter(x => x > 0).length);
    assert.equal(end.islands.filter(i => i.accepted).length, run.answer);
    assert.equal(end.islands.reduce((sum, i) => sum + i.total, 0), grid.flat().reduce((a, b) => a + b, 0));
    for (const step of run.steps) assert.equal(new Set(step.pictureStudyView.queue.map(c => c.join(","))).size, step.pictureStudyView.queue.length);
    refs.push({ id: 3619, args: [grid, k], answer: run.answer });
  }
});

test("2353 matches an independent sort oracle for ties, decreases and repeated updates", () => {
  for (let sample = 0; sample < 35; sample++) {
    const foods = ["aa", "ab", "b", "c"], cuisines = ["asian", "asian", "asian", "other"], ratings = [4, 4, 9, 2];
    const operations = [["highestRated", "asian"], ["changeRating", "b", 1], ["highestRated", "asian"],
      ...Array.from({ length: 25 }, () => random(2) ? ["changeRating", foods[random(4)], 1 + random(10)] : ["highestRated", random(2) ? "asian" : "other"])];
    const p = { foods, cuisines, ratings, operations }, scores = [...ratings], expected = [];
    for (const [name, arg, rating] of operations) {
      if (name === "changeRating") { scores[foods.indexOf(arg)] = rating; expected.push(null); }
      else expected.push(foods.filter((f, i) => cuisines[i] === arg).sort((a, b) => scores[foods.indexOf(b)] - scores[foods.indexOf(a)] || (a < b ? -1 : a > b ? 1 : 0))[0]);
    }
    const run = build(2353, JSON.stringify(p));
    assert.deepEqual(run.designResults, expected);
    assert.equal(run.answer, expected.filter(x => x !== null).at(-1));
    for (const s of run.steps) {
      const v = s.pictureStudyView;
      if (v.action?.kind === "return") {
        const heap = v.heaps[v.local.cuisine]; assert.equal(-heap[0][0], v.food[heap[0][1]][0]);
      }
    }
    refs.push({ id: 2353, args: [foods, cuisines, ratings], operations, answer: run.designResults });
  }
  const p = SUPPORTED[2353], design = prepareDesignLiveRun(p, p.defaultInput);
  assert.equal(design.className, "FoodRatings");
  assert.equal(design.constructorArgs.length, 3);
  assert.deepEqual(design.operations, p.parseFoodRatings2353(p.defaultInput).operations);
  assert.ok(build(2353).steps.some(s => s.pictureStudyView.action?.kind === "remove"));
});

test("all five lessons keep fixed watches, immutable snapshots and source highlighting", () => {
  for (const id of ids) {
    const p = SUPPORTED[id], run = build(id), names = run.steps[0].vars.map(v => v.name), before = JSON.stringify(run);
    assert.equal(run.steps.filter(s => s.final).length, 1);
    for (const step of run.steps) {
      assert.deepEqual(step.vars.map(v => v.name), names);
      assert.equal(step.codeLines.length, 1);
      assert.ok(p.code[step.codeLines[0] - 1]);
      assert.equal(step.pictureStudyView.id, id);
    }
    assert.equal(JSON.stringify(run), before);
  }
  const run = build(2407);
  assert.equal(run.answer, 5);
  for (const s of run.steps.filter(s => s.pictureStudyView.operation === "dp")) {
    const v = s.pictureStudyView; assert.equal(v.dp[v.currentIndex], v.queryLength + 1);
  }
});

test("visualization limits and malformed inputs fail explicitly", () => {
  for (const [input, k] of [["", 1], ["1,2;3", 1], ["1,2,3", 1], ["1,0;2,3", 1], ["1,3;0,4", 1], ["1", 0], ["1", 2]]) assert.throws(() => build(378, input, { k }));
  for (const nums of [[], [2, 1], [0.5], [10001], Array(41).fill(0)]) assert.throws(() => build(977, nums));
  for (const grid of ["1,-1", "1,", "[[1],[2,3]]", "null"]) assert.throws(() => build(3619, grid, { k: 1 }));
  assert.throws(() => build(3619, "1", { k: 0 }));
  for (const patch of [{ foods: ["a", "a"] }, { ratings: [0, 1] }, { operations: [["highestRated", "missing"]] }, { operations: [["changeRating", "missing", 3]] }, { operations: [["wrong"]] }]) {
    assert.throws(() => build(2353, JSON.stringify({ foods: ["a", "b"], cuisines: ["x", "y"], ratings: [1, 2], operations: [], ...patch })));
  }
});

test("visualization boundaries retain all cells and food entries", () => {
  const matrix = Array.from({ length: 10 }, (_, r) => Array.from({ length: 10 }, (_, c) => 10 * r + c));
  const kth = build(378, JSON.stringify(matrix), { k: 100 });
  assert.equal(kth.answer, 99);
  assert.equal(kth.steps.at(-1).pictureStudyView.taken.length, 100);
  const islands = build(3619, JSON.stringify(Array.from({ length: 10 }, () => Array(10).fill(1))), { k: 10 });
  assert.equal(islands.answer, 1);
  assert.equal(islands.steps.at(-1).pictureStudyView.seen.length, 100);
  const foods = Array.from({ length: 30 }, (_, i) => `f${String.fromCharCode(97 + Math.floor(i / 26))}${String.fromCharCode(97 + i % 26)}`);
  const input = { foods, cuisines: foods.map(() => "same"), ratings: foods.map(() => 1), operations: Array.from({ length: 60 }, (_, i) => ["changeRating", foods[i % foods.length], i + 1]) };
  const food = build(2353, JSON.stringify(input)).steps.at(-1).pictureStudyView;
  assert.equal(Object.keys(food.food).length, 30);
  assert.equal(food.heaps.same.length, 90);
  assert.equal(build(977, Array.from({ length: 40 }, (_, i) => i - 20)).answer.length, 40);
});

test("displayed Python agrees with randomized oracles for all new algorithms", () => {
  const methods = { 378: "kthSmallest", 977: "sortedSquares", 3619: "countIslands" };
  const payload = refs.map(ref => ({ ...ref, code: SUPPORTED[ref.id].code.join("\n"), method: methods[ref.id] }));
  const python = `import json,sys\nfor case in json.load(sys.stdin):\n scope={}\n exec(case['code'],scope)\n if case['id']==2353:\n  obj=scope['FoodRatings'](*case['args'])\n  actual=[getattr(obj,op[0])(*op[1:]) for op in case['operations']]\n else:\n  actual=getattr(scope['Solution'](),case['method'])(*case['args'])\n assert actual==case['answer'],(case['id'],actual,case['answer'])\nprint('ok')`;
  const run = spawnSync(process.env.PYTHON || "python3", ["-c", python], { input: JSON.stringify(payload), encoding: "utf8", maxBuffer: 4 * 1024 * 1024 });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout.trim(), "ok");
});

test("378 and 977 trace the actual Python state after each executable line", () => {
  const cases = [ [378, "1,5,9;10,11,13;12,13,15", { k: 8 }], [378, "1,1;1,1", { k: 4 }], [378, "-9", { k: 1 }], [977, [-4, -1, 0, 3, 10], {}], [977, [-2, -2, 2, 2], {}], [977, [0], {}] ];
  const payload = cases.map(([id, input, params]) => ({ id, code: SUPPORTED[id].code.join("\n"), args: SUPPORTED[id].liveArgs(input, params), method: id === 378 ? "kthSmallest" : "sortedSquares" }));
  const python = `import sys,json,copy\nout=[]\nfor case in json.load(sys.stdin):\n scope={};filename='<study>';exec(compile(case['code'],filename,'exec'),scope);events=[];pending=None\n keys=['n','heap','rank','val','r','c'] if case['id']==378 else ['n','result','left','right','pos']\n def trace(frame,event,arg):\n  global pending\n  if frame.f_code.co_filename!=filename or frame.f_code.co_name!=case['method']:return trace\n  if event in ('line','return'):\n   if pending is not None:events.append([pending,copy.deepcopy({k:frame.f_locals[k] for k in keys if k in frame.f_locals})])\n   pending=frame.f_lineno if event=='line' else None\n  return trace\n sys.settrace(trace);getattr(scope['Solution'](),case['method'])(*case['args']);sys.settrace(None)\n out.append([e for e in events if e[0]>=4] if case['id']==378 else [e for e in events if e[0]>=3])\nprint(json.dumps(out))`;
  const run = spawnSync(process.env.PYTHON || "python3", ["-c", python], { input: JSON.stringify(payload), encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const reference = JSON.parse(run.stdout);
  cases.forEach(([id, input, params], i) => {
    const actual = build(id, input, params).steps.map(s => {
      const v = s.pictureStudyView, vars = Object.fromEntries(s.vars.filter(x => x.value !== "—").map(x => [x.name, x.value]));
      if (id === 378) return [s.codeLines[0], { n: v.matrix.length, ...(v.heapReady ? { heap: v.heap } : {}), ...Object.fromEntries(["rank", "val", "r", "c"].filter(k => Object.hasOwn(vars, k)).map(k => [k, vars[k]])) }];
      return [s.codeLines[0], { n: v.nums.length, ...(s.codeLines[0] === 3 ? {} : { result: v.result }), ...Object.fromEntries(["left", "right", "pos"].filter(k => Object.hasOwn(vars, k)).map(k => [k, vars[k]])) }];
    });
    assert.deepEqual(actual, reference[i], `#${id}`);
  });
});

test("all picture renderers work in day/night languages without changing trace state", () => {
  const source = fs.readFileSync(require.resolve("../public/renderer-picture-study.js"), "utf8");
  for (const lang of ["vi", "en"]) {
    const host = { innerHTML: "", querySelector: () => null, querySelectorAll: () => [] }, context = { lang, $: () => host, escapeHtml: x => String(x).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;") };
    vm.createContext(context); vm.runInContext(source, context);
    for (const id of ids) {
      const run = build(id), before = JSON.stringify(run);
      for (const step of run.steps) {
        context.renderPictureStudy(step);
        assert.match(host.innerHTML, /class="study-viz"/);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|<p\b|<table\b/);
      }
      assert.equal(JSON.stringify(run), before);
    }
  }
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8"), css = fs.readFileSync(require.resolve("../public/picture-study.css"), "utf8");
  assert.match(html, /renderer-picture-study\.js[^\n]*data-problem-ids="378 3619 2407 977 2353"/);
  const assetIds = html.match(/renderer-picture-study\.js[^\n]*data-problem-ids="([^"]+)"/)[1].split(/\s+/);
  for (const id of ids) assert.ok(assetIds.includes(String(id)), `lazy loader must match #${id}`);
  assert.match(css, /\[data-theme="light"\] \.study-viz/);
  assert.match(css, /position:sticky/);
});
