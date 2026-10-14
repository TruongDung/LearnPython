const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const problem = require('../problems').SUPPORTED[1293];
const source = fs.readFileSync(path.join(__dirname, '../public/renderers-02.js'), 'utf8');
const start = source.indexOf('function renderGridElim1293View(step)');
const end = source.indexOf('// ---- 1627 Graph Connectivity', start);
const element = { innerHTML: '' };
const context = {
  lang: 'vi',
  $: () => element,
  escapeHtml: value => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;'),
};
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);

function render(step, language = 'vi') {
  context.lang = language;
  context.renderGridElim1293View(JSON.parse(JSON.stringify(step)));
  return element.innerHTML;
}

function encode(grid) {
  return grid.map(row => row.join(',')).join('|');
}

function independentBfs(grid, k) {
  const rows = grid.length;
  const cols = grid[0].length;
  const queue = [[0, 0, k, 0]];
  const seen = new Set([`0,0,${k}`]);
  for (let head = 0; head < queue.length; head += 1) {
    const [r, c, rem, distance] = queue[head];
    if (r === rows - 1 && c === cols - 1) return distance;
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const nextRem = rem - grid[nr][nc];
      const key = `${nr},${nc},${nextRem}`;
      if (nextRem >= 0 && !seen.has(key)) {
        seen.add(key);
        queue.push([nr, nc, nextRem, distance + 1]);
      }
    }
  }
  return -1;
}

test('1293 answers and illustrated final routes agree with an independent BFS', () => {
  const cases = [
    { grid: [[0]], k: 0 },
    { grid: [[0, 1, 0], [0, 1, 0], [0, 0, 0]], k: 0 },
    { grid: [[0, 1, 1], [1, 1, 1], [1, 0, 0]], k: 1 },
    { grid: [[0, 1, 0], [1, 1, 0], [0, 0, 0]], k: 4 },
    { grid: [[0, 0, 0], [1, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 0]], k: 1 },
  ];
  for (const { grid, k } of cases) {
    const run = problem.builder(encode(grid), { k });
    const expected = independentBfs(grid, k);
    assert.equal(run.answer, expected);
    const final = run.steps.at(-1).gridElim1293View;
    assert.equal(final.answer, expected);
    if (expected === -1) continue;
    assert.equal(final.path.length, expected + 1);
    assert.deepEqual(final.path[0].slice(0, 2), [0, 0]);
    assert.deepEqual(final.path.at(-1).slice(0, 2), [grid.length - 1, grid[0].length - 1]);
    final.path.slice(1).forEach(([r, c], index) => {
      const [pr, pc] = final.path[index];
      assert.equal(Math.abs(pr - r) + Math.abs(pc - c), 1);
    });
    assert.ok(final.eliminated.length <= k);
  }
});

test('1293 renders every step as a compact picture in Vietnamese and English', () => {
  const run = problem.builder(problem.defaultInput, { k: 1 });
  for (const step of run.steps) {
    for (const language of ['vi', 'en']) {
      const html = render(step, language);
      assert.doesNotMatch(html, /undefined|NaN/);
      assert.match(html, /class="ge1293-board"/);
      assert.match(html, /class="ge1293-queue-track"/);
      assert.match(html, /class="ge1293-wave-track"/);
      assert.match(html, /class="ge1293-budget"/);
      assert.equal((html.match(/class="ge1293-cell /g) || []).length, 15);
      assert.doesNotMatch(html, /ge1293-idea|ge1293-decision|ge1293-cols2/);
    }
  }
});

test('1293 move pictures cover accepted, dominated, blocked, and outside probes', () => {
  const steps = problem.builder(problem.defaultInput, { k: 1 }).steps;
  for (const verdict of ['enqueued', 'dominated', 'noK', 'oob']) {
    const step = steps.find(item => item.gridElim1293View.probe?.verdict === verdict);
    assert.ok(step, `missing ${verdict} step`);
    const html = render(step);
    assert.match(html, new RegExp(`ge1293-move v-${verdict}`));
    if (verdict !== 'oob') assert.match(html, new RegExp(`ge1293-cell[^\"]*probe[^\"]*v-${verdict}`));
  }
});

test('1293 final picture numbers the route and cracks eliminated walls', () => {
  const final = problem.builder(problem.defaultInput, { k: 1 }).steps.at(-1);
  const view = final.gridElim1293View;
  const html = render(final);
  assert.equal((html.match(/ge1293-route-step/g) || []).length, view.path.length);
  assert.equal((html.match(/ge1293-cell wall[^\"]*broken/g) || []).length, view.eliminated.length);
  assert.match(html, /ge1293-answer/);
  assert.match(html, new RegExp(`<strong>${view.answer}</strong>`));
});

test('1293 visual assets hide duplicate prose and carry a dedicated cache version', () => {
  const css = fs.readFileSync(path.join(__dirname, '../public/style-09.css'), 'utf8');
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  assert.match(css, /#vizPanel:has\(\.ge1293-viz\) #stepNote \{ display: none; \}/);
  assert.match(css, /\.ge1293-bricks/);
  assert.match(css, /\.ge1293-runner/);
  assert.match(css, /\.ge1293-queue-track/);
  assert.match(css, /\.ge1293-wave-track/);
  assert.equal((html.match(/grid-1293-pictures-v3/g) || []).length, 2);
});
