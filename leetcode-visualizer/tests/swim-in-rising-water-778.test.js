const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const problem = require('../problems').SUPPORTED[778];
const encode = grid => grid.map(row => row.join(',')).join('|');
const source = fs.readFileSync(path.join(__dirname, '../public/renderers-02.js'), 'utf8');
const start = source.indexOf('function renderSwimWater778View(step)');
const end = source.indexOf('// ---- 1293 Shortest Path', start);
const element = { innerHTML: '' };
const context = {
  lang: 'vi', $: () => element,
  escapeHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;'),
};
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);
function render(step, lang = 'vi') {
  context.lang = lang;
  context.renderSwimWater778View(JSON.parse(JSON.stringify(step)));
  return element.innerHTML;
}
function cells(html) {
  return [...html.matchAll(/<div class="(sw778-cell[^"\n]*)" data-r="(\d+)" data-c="(\d+)"/g)]
    .map(([, classes, r, c]) => ({ classes: new Set(classes.split(' ')), r: Number(r), c: Number(c) }));
}
function reachableAt(grid, level) {
  if (grid[0][0] > level) return false;
  const n = grid.length;
  const seen = new Set(['0,0']);
  const queue = [[0, 0]];
  for (let i = 0; i < queue.length; i++) {
    const [r, c] = queue[i];
    if (r === n - 1 && c === n - 1) return true;
    for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] <= level && !seen.has(key)) {
        seen.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  return false;
}

test('778 answers and final route match an independent water-threshold flood fill', () => {
  const cases = [[[0]], [[0, 2], [1, 3]], [[3, 0], [1, 2]], [[4, 8, 0], [5, 7, 1], [6, 3, 2]]];
  let seed = 778;
  for (let sample = 0; sample < 24; sample++) {
    const n = 2 + sample % 4;
    const values = Array.from({ length: n * n }, (_, i) => i);
    for (let i = values.length - 1; i > 0; i--) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const j = seed % (i + 1);
      [values[i], values[j]] = [values[j], values[i]];
    }
    cases.push(Array.from({ length: n }, (_, r) => values.slice(r * n, (r + 1) * n)));
  }
  for (const grid of cases) {
    const run = problem.builder(encode(grid));
    const expected = Array.from({ length: grid.length ** 2 }, (_, t) => t).find(t => reachableAt(grid, t));
    assert.equal(run.answer, expected);
    const final = run.steps.at(-1).swimWater778View;
    assert.deepEqual(final.path[0].slice(0, 2), [0, 0]);
    assert.deepEqual(final.path.at(-1).slice(0, 2), [grid.length - 1, grid.length - 1]);
    assert.equal(Math.max(...final.path.map(cell => cell[2])), expected);
    final.path.slice(1).forEach(([r, c], i) => {
      const [pr, pc] = final.path[i];
      assert.equal(Math.abs(pr - r) + Math.abs(pc - c), 1);
    });
  }
});

test('778 wet, heap, and settled colors reflect each algorithm snapshot in both languages', () => {
  for (const input of ['0', '0,2|1,3', '3,0|1,2', problem.defaultInput]) {
    for (const step of problem.builder(input).steps) {
      const v = step.swimWater778View;
      const queued = new Set(v.heap.map(({ r, c }) => `${r},${c}`));
      for (const lang of ['vi', 'en']) {
        const html = render(step, lang);
        assert.doesNotMatch(html, /undefined|NaN/);
        const rendered = cells(html);
        assert.equal(rendered.length, v.n ** 2);
        for (const cell of rendered) {
          const model = v.cells[cell.r][cell.c];
          assert.equal(cell.classes.has('wet'), v.level !== null && model.elev <= v.level);
          assert.equal(cell.classes.has('dry'), !cell.classes.has('wet'));
          assert.equal(cell.classes.has('inheap'), queued.has(`${cell.r},${cell.c}`));
          assert.equal(cell.classes.has('settled'), model.finalized);
          assert.equal(cell.classes.has('cur'), Boolean(model.cur && !step.final));
          if (model.finalized) assert.ok(model.best <= v.level);
          assert.ok(!(model.finalized && model.inHeap));
        }
      }
    }
  }
});

test('778 keeps the bottleneck color when the target or start is the highest route cell', () => {
  for (const input of ['0', '0,2|1,3', '3,0|1,2']) {
    const step = problem.builder(input).steps.at(-1);
    const v = step.swimWater778View;
    const rendered = cells(render(step));
    const bottleneck = rendered.find(({ r, c }) => r === v.bottleneck[0] && c === v.bottleneck[1]);
    assert.ok(bottleneck.classes.has('path'));
    assert.ok(bottleneck.classes.has('bottleneck'));
    assert.ok(!bottleneck.classes.has('cur'));
    assert.equal(rendered.filter(c => c.classes.has('bottleneck')).length, 1);
    assert.equal(rendered.filter(c => c.classes.has('path')).length, v.path.length);
  }
  assert.match(render(problem.builder('0').steps.at(-1)), /S\/T/);
});

test('778 distinguishes submerged, unreached cells from finalized cells', () => {
  const run = problem.builder('4,8,0|5,7,1|6,3,2');
  const step = run.steps.find(s => s.swimWater778View.phase === 'pop');
  const unvisited = step.swimWater778View.cells[0][2];
  assert.equal(unvisited.wet, true);
  assert.equal(unvisited.best, null);
  assert.equal(unvisited.finalized, false);
  const html = render(step);
  assert.match(html, /đã ngập, chưa chắc đã tới/);
  assert.match(html, /\(0,2\), độ cao 0, best = ∞; đã ngập/);
  const view = cells(html).find(c => c.r === 0 && c.c === 2);
  assert.ok(view.classes.has('wet'));
  assert.ok(!view.classes.has('settled'));
});

test('778 probe rings preserve the queue border, and light theme uses distinct readable colors', () => {
  const css = fs.readFileSync(path.join(__dirname, '../public/style-09.css'), 'utf8');
  for (const verdict of ['improved', 'noImprove']) {
    const rule = css.match(new RegExp(`\\.sw778-cell\\.probe\\.v-${verdict} \\{([^}]+)\\}`))[1];
    assert.match(rule, /outline: 2px solid var/);
    assert.doesNotMatch(rule, /border-color|box-shadow/);
  }
  const light = css.match(/\[data-theme="light"\] \.sw778-viz \{([^}]+)\}/)[1];
  for (const token of ['--sw-current', '--sw-heap', '--sw-bottleneck', '--sw-settled']) assert.ok(light.includes(token));
  for (const step of problem.builder('0,2|1,3').steps.filter(s => s.swimWater778View.probe?.verdict === 'improved')) {
    const v = step.swimWater778View;
    const cell = cells(render(step)).find(c => c.r === v.probe.r && c.c === v.probe.c);
    assert.ok(cell.classes.has('probe') && cell.classes.has('v-improved'));
    assert.equal(cell.classes.has('inheap'), step.codeLines[0] === 25);
  }
});

test('778 only colors a cell as queued after heappush, not when calculating or updating best', () => {
  const run = problem.builder('0,2|1,3');
  for (const step of run.steps.filter(s => s.swimWater778View.probe?.verdict === 'candidate')) {
    assert.deepEqual(step.codeLines, [22, 23]);
    const v = step.swimWater778View;
    const cell = v.cells[v.probe.r][v.probe.c];
    assert.equal(cell.best, v.probe.oldBest);
    assert.equal(cell.inHeap, false);
    assert.ok(!cells(render(step)).find(c => c.r === v.probe.r && c.c === v.probe.c).classes.has('inheap'));
  }
  for (const step of run.steps.filter(s => s.codeLines[0] === 24 || s.codeLines[0] === 25)) {
    const v = step.swimWater778View;
    const cell = v.cells[v.probe.r][v.probe.c];
    assert.equal(cell.best, v.probe.newTime);
    assert.equal(cell.inHeap, step.codeLines[0] === 25);
  }
  assert.deepEqual(run.steps.at(-1).codeLines, [17]);
});
