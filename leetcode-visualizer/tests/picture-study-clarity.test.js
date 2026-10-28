"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { SUPPORTED } = require("../problems");
const ids = [378, 3619, 2407, 977, 2353];
const run = (id, input = SUPPORTED[id].defaultInput, params = Object.fromEntries(SUPPORTED[id].extraParams.map(p => [p.key, p.default]))) => SUPPORTED[id].builder(input, params);
function renderer() {
  const cuisineListeners = new Map();
  const host = {
    innerHTML: "",
    querySelector: () => null,
    querySelectorAll: selector => selector === "[data-study-cuisine]"
      ? [...host.innerHTML.matchAll(/data-study-cuisine="([^"]+)"/g)].map(([, cuisine]) => ({
        dataset: { studyCuisine: cuisine },
        addEventListener: (event, listener) => cuisineListeners.set(cuisine, listener)
      }))
      : [],
    clickCuisine: cuisine => cuisineListeners.get(cuisine)?.()
  };
  const context = { lang: "vi", $: () => host, escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-picture-study.js"), "utf8"), context);
  return { context, clickCuisine: host.clickCuisine, render: step => { context.renderPictureStudy(step); return host.innerHTML; } };
}

test("five picture lessons keep eight stable watches and expose the actual candidate values", () => {
  for (const id of ids) {
    const built = run(id), names = built.steps[0].vars.map(v => v.name);
    assert.equal(names.length, 8);
    for (const step of built.steps) {
      assert.deepEqual(step.vars.map(v => v.name), names);
      const v = step.pictureStudyView, w = Object.fromEntries(step.vars.map(v => [v.name, v.value]));
      if (id === 378) {
        assert.equal(w["heap[0][0]"], v.heap[0]?.[0] ?? "—");
        assert.equal(w["matrix[r][c+1]"], v.cursor ? v.matrix[v.cursor[0]][v.cursor[1] + 1] ?? "—" : "—");
      }
      if (id === 977) {
        const valid = v.left <= v.right;
        assert.equal(w["nums[left]"], valid ? v.nums[v.left] : "—");
        assert.equal(w["nums[right]"], valid ? v.nums[v.right] : "—");
      }
      if (id === 2407) {
        assert.equal(w["[x-k, x-1]"], v.leftValue === null ? "—" : `[${v.leftValue}, ${v.rightValue}]`);
        assert.equal(w.predecessor, v.queryLength === null ? "—" : v.predecessorIndex);
      }
      if (id === 2353) {
        const heap = v.heaps[v.local.cuisine];
        assert.equal(w["live rating"], heap?.length ? v.food[heap[0][1]][0] : "—");
        assert.equal(w.stale, heap?.length ? -heap[0][0] !== v.food[heap[0][1]][0] : "—");
      }
    }
  }
});

test("3619 neighbor and seen watches agree with Python at every state-changing instruction", () => {
  const p = SUPPORTED[3619];
  const cases = [[[[0]], 5], [[[5]], 5], [[[2, 3, 0], [0, 0, 5]], 5], p.liveArgs(p.defaultInput, { k: 5 })];
  const python = `import sys,json
${p.code.join("\n")}
out=[]
for grid,k in json.load(sys.stdin):
    events,pending=[],None
    def snapshot(frame,line):
        s=frame.f_locals
        events.append({'line':line-1,'watches':[s.get('total','—'),s.get('answer','—'),len(s['queue']) if 'queue' in s else '—',len(s['seen']) if 'seen' in s else '—','('+str(s['nx'])+','+str(s['ny'])+')' if 'nx' in s else '—']})
    def trace(frame,event,arg):
        global pending
        if frame.f_code.co_name!='countIslands': return trace
        if event in ('line','return'):
            if pending is not None: snapshot(frame,pending)
            pending=frame.f_lineno if event=='line' else None
        return trace
    sys.settrace(trace)
    Solution().countIslands(grid,k)
    sys.settrace(None)
    out.append(events)
print(json.dumps(out))`;
  const proc = spawnSync("python3", ["-c", python], { input: JSON.stringify(cases), encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  assert.equal(proc.status, 0, proc.stderr);
  JSON.parse(proc.stdout).forEach((events, i) => {
    const [grid, k] = cases[i]; let cursor = 0;
    for (const step of run(3619, grid, { k }).steps.filter(s => [4, 5, 6, 11, 12, 13, 15, 16, 18, 20, 21, 23, 24].includes(s.codeLines[0]))) {
      while (cursor < events.length && events[cursor].line !== step.codeLines[0]) cursor++;
      assert.ok(cursor < events.length, `case ${i}, expected source line ${step.codeLines[0]}, event count ${events.length}`);
      const w = Object.fromEntries(step.vars.map(v => [v.name, v.value]));
      assert.deepEqual([w.total, w.answer, w["len(queue)"], w["len(seen)"], w["(nx, ny)"]], events[cursor++].watches, `case ${i}, line ${step.codeLines[0]}`);
    }
  });
});

test("island bucket pictures conserve the total and only give a verdict once the island is complete", () => {
  const { context, render } = renderer();
  for (const [total, k] of [[0, 5], [8, 5], [5, 5], [1000000, 1], [17, 1000000]]) {
    const html = context.study3619Buckets(total, k, false, false);
    assert.doesNotMatch(html, /NaN|Infinity|study-division accepted|study-division rejected/);
    assert.ok(html.includes(`${total} = ${Math.floor(total / k)} × ${k} + ${total % k}`));
    const completed = context.study3619Buckets(total, k, true, total % k === 0);
    assert.match(completed, total % k === 0 ? /study-division accepted/ : /study-division rejected/);
    assert.ok((completed.match(/data-bucket-value=/g) || []).length <= 4);
  }
  const steps = run(3619).steps;
  for (const step of steps.filter(s => ["add", "test"].includes(s.pictureStudyView.action?.kind))) {
    const html = render(step), v = step.pictureStudyView;
    assert.equal((html.match(/data-grid-cell=/g) || []).length, v.grid.length * v.grid[0].length);
    if (!v.islands[v.island].complete) assert.doesNotMatch(html, /study-division accepted|study-division rejected/);
  }
});

test("977 only fills written slots and shows the two endpoint squares; 2407 excludes equal and future predecessors", () => {
  const { render } = renderer();
  for (const step of run(977).steps) {
    const v = step.pictureStudyView, html = render(step);
    for (const match of html.matchAll(/data-result-index="(\d+)" data-written="(true|false)">[\s\S]*?<b>([^<]*)<\/b>/g)) {
      const i = Number(match[1]); assert.equal(match[2], String(v.written[i]));
      assert.equal(match[3], v.written[i] ? String(v.result[i]) : "·");
    }
    if (v.action?.kind === "compare") {
      assert.match(html, /study-square-compare/);
      assert.ok(html.includes(`(${v.nums[v.left]})² = ${v.nums[v.left] ** 2}`));
      assert.ok(html.includes(`(${v.nums[v.right]})² = ${v.nums[v.right] ** 2}`));
    }
  }
  for (const step of run(2407).steps) {
    const v = step.pictureStudyView, html = render(step);
    const eligible = [...html.matchAll(/class="study-lis-column ([^"]*)" data-sequence-index="(\d+)"/g)].filter(m => /\beligible\b/.test(m[1])).map(m => Number(m[2]));
    const expected = v.nums.map((_, i) => i).filter(i => v.currentIndex >= 0 && i < v.currentIndex && v.nums[i] < v.currentValue && v.nums[i] >= v.currentValue - v.k);
    assert.deepEqual(eligible, expected);
    const edges = [...html.matchAll(/data-tree-edge="(\d+),(\d+)"/g)].map(m => [Number(m[1]), Number(m[2])]);
    assert.equal(edges.length, v.coverage.filter(Boolean).length - 1);
    for (const [parent, child] of edges) {
      assert.ok(v.coverage[parent][0] <= v.coverage[child][0] && v.coverage[parent][1] >= v.coverage[child][1]);
      assert.ok(v.tree[parent] >= v.tree[child]);
    }
  }
});

test("2353 stale roots show the old entry against the authoritative live rating and keep tie ordering", () => {
  const { render } = renderer(), steps = run(2353).steps;
  const check = steps.find(s => s.pictureStudyView.action?.kind === "check" && s.pictureStudyView.action.pass);
  assert.ok(check);
  const v = check.pictureStudyView, root = v.heaps[v.local.cuisine][0], html = render(check);
  assert.ok(html.includes(`★ ${-root[0]}`));
  assert.ok(html.includes(`★ ${v.food[root[1]][0]}`));
  assert.match(html, /study-stale-cross/); assert.match(html, /≠/);
  const tie = steps.find(s => s.pictureStudyView.action?.kind === "return" && s.pictureStudyView.history.at(-1).rating === 16 && s.pictureStudyView.food.ramen[0] === 16);
  assert.match(render(tie), /ramen &lt; sushi/);
});

test("2353 shows every cuisine heap together and preserves each heap's entries", () => {
  const { render } = renderer();
  for (const step of run(2353).steps) {
    const v = step.pictureStudyView, html = render(step);
    for (const cuisine of new Set(v.cuisines)) assert.ok(html.includes(`data-cuisine-heap="${cuisine}"`));
    assert.equal((html.match(/<section class="study-cuisine-heap/g) || []).length, new Set(v.cuisines).size);
    assert.equal((html.match(/data-heap-index=/g) || []).length, Object.values(v.heaps).reduce((total, heap) => total + heap.length, 0));
    assert.equal((html.match(/class="study-cuisine-heap focus(?: |")/g) || []).length, v.local.cuisine ? 1 : 0);
  }
});

test("2353 clicking a cuisine selects and scrolls to that cuisine's heap", () => {
  const { render, clickCuisine } = renderer(), step = run(2353).steps.find(s => s.pictureStudyView.local.cuisine === "japanese");
  assert.ok(step);
  const before = render(step);
  assert.match(before, /data-study-cuisine="japanese" aria-pressed="true"/);
  clickCuisine("korean");
  const after = render(step);
  assert.match(after, /data-study-cuisine="korean" aria-pressed="true"/);
  assert.match(after, /class="study-cuisine-heap [^"]*selected" data-cuisine-heap="korean"/);
  assert.match(after, /class="study-cuisine-heap focus [^"]*" data-cuisine-heap="japanese"/);
});

test("all five diagrams stay deterministic in both languages and source snippets retain horizontal scrolling", () => {
  const { context, render } = renderer();
  for (const lang of ["vi", "en"]) for (const id of ids) {
    context.lang = lang;
    const built = run(id), before = JSON.stringify(built), first = render(built.steps[0]);
    render(built.steps.at(-1)); assert.equal(render(built.steps[0]), first);
    assert.equal(JSON.stringify(built), before);
  }
  const css = fs.readFileSync(require.resolve("../public/picture-study.css"), "utf8");
  assert.match(css, /\[data-theme="light"\] \.study-viz/);
  assert.match(css, /#codePanel\s*\{[^}]*overflow-x:auto/);
  assert.match(css, /#codePanel \.code-line\s*\{[^}]*white-space:pre;/);
  assert.doesNotMatch(css, /#codePanel \.txt\s*\{[^}]*pre-wrap/);
});
