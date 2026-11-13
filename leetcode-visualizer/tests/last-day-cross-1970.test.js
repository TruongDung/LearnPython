'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript } = require('./helpers/frontend-source');

const problem = SUPPORTED[1970];
const internals = problem.__internals1970;
const RENDERER = fs.readFileSync(require.resolve('../public/renderer-last-day-cross-1970.js'), 'utf8');
const CSS = fs.readFileSync(require.resolve('../public/last-day-cross-1970.css'), 'utf8');

function renderer(lang) {
  const host = { innerHTML: '' };
  const context = { lang, document: { getElementById: () => host } };
  vm.createContext(context);
  vm.runInContext(RENDERER, context);
  return {
    cases: vm.runInContext('LC1970_CASES', context),
    render(step, steps, index) {
      context.steps = steps;
      context.stepIndex = index;
      context.renderLastDayCross1970View(step);
      return host.innerHTML;
    },
  };
}

function parse(input) {
  const [size, list] = input.split('|');
  const [row, col] = size.split(',').map(Number);
  return { row, col, cells: list.split(';').map((cell) => cell.split(',').map(Number)) };
}

// Brute force: for each day d = 0..n flood cells[0..d-1], BFS from the land cells of row 0; keep the last d that
// reaches the last row.
function bruteForce({ row, col, cells }) {
  let best = 0;
  for (let d = 0; d <= cells.length; d++) {
    const water = new Set(cells.slice(0, d).map(([r, c]) => (r - 1) * col + (c - 1)));
    const seen = new Set();
    const queue = [];
    for (let c = 0; c < col; c++) if (!water.has(c)) { seen.add(c); queue.push(c); }
    let ok = false;
    while (queue.length) {
      const id = queue.shift();
      const r = Math.floor(id / col);
      const c = id % col;
      if (r === row - 1) { ok = true; break; }
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        const k = nr * col + nc;
        if (nr >= 0 && nr < row && nc >= 0 && nc < col && !water.has(k) && !seen.has(k)) { seen.add(k); queue.push(k); }
      }
    }
    if (ok) best = d;
  }
  return best;
}

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

function permutationInput(row, col, random) {
  const cells = [];
  for (let r = 1; r <= row; r++) for (let c = 1; c <= col; c++) cells.push([r, c]);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return `${row},${col} | ${cells.map((cell) => cell.join(',')).join(';')}`;
}

// Random inputs inside the visualizer limits: R, C in 2..6 with R·C <= 24, cells a random permutation of the grid.
function randomInputs(count, seed = 1970) {
  const random = seeded(seed);
  const out = [];
  while (out.length < count) {
    const row = 2 + Math.floor(random() * 5);
    const col = 2 + Math.floor(random() * 5);
    if (row * col > 24) continue;
    out.push(permutationInput(row, col, random));
  }
  return out;
}

const EXTREMES = [[6, 4], [4, 6], [6, 2], [2, 6], [2, 2]].map(([row, col]) => permutationInput(row, col, seeded(row * 10 + col)));
const EXECUTABLE = Array.from({ length: 31 }, (_, t) => t + 1).filter((line) => ![2, 8, 14, 17].includes(line));
const VAR_NAMES = ['top', 'bottom', 'day', 'r', 'c', 'cell', 'dr', 'dc', 'nr', 'nc', 'a', 'b', 'x', 'parent'];
const BRANCH_EVENTS = ['find-check', 'top-check', 'bottom-check', 'nb-check', 'cross-check'];
const vars = (step) => Object.fromEntries(step.vars.map((v) => [v.name, v.value]));
const presets = (cases) => cases.map((preset) => preset[0]);

test('1970 id is a number, the page is line-by-line, the code is real Python and the input has one source', () => {
  assert.equal(typeof problem.id, 'number');
  assert.equal(problem.id, 1970);
  assert.equal(problem.category.key, 'union-find');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.extraParams, undefined);
  assert.equal(problem.inputKind, 'string');
  assert.equal(problem.defaultInput, internals.DEFAULT_INPUT_1970);
  assert.deepEqual(problem.code, [...internals.SOURCE_1970]);
  assert.ok(!problem.code.some((line) => /top\/bottom\/neighbors/.test(line)), 'no pseudo-code line');
  assert.deepEqual(problem.liveArgs(problem.defaultInput, {}), [3, 3, [[1, 2], [2, 1], [3, 3], [2, 2], [1, 1], [1, 3], [2, 3], [3, 2], [3, 1]]]);
  assert.equal(problem.builder('1,1;2,1;1,2;2,2').answer, 2);
  assert.deepEqual(problem.liveArgs('1,1;1,2;2,1;2,2', { rows: 2, cols: 2 }), [2, 2, [[1, 1], [1, 2], [2, 1], [2, 2]]]);
  assert.equal(problem.builder('').answer, problem.builder(problem.defaultInput).answer);
});

test('1970 answer equals brute force; parent changes only on halve/link; roots, crossing and route are consistent; notes <= 28 chars', () => {
  const { cases } = renderer('en');
  const inputs = [...presets(cases), ...randomInputs(400), ...EXTREMES];
  for (const input of inputs) {
    const result = problem.builder(input);
    const parsed = parse(input);
    const { row, col } = parsed;
    const n = row * col;
    assert.equal(result.answer, bruteForce(parsed), input);
    assert.equal(result.steps.filter((step) => step.final).length, 1, input);
    assert.ok(result.steps.at(-1).final);
    assert.equal(result.steps.at(-1).codeLines[0], 31);
    assert.equal(result.steps.at(-1).cross1970View.answer, result.answer);
    let previous = null;
    result.steps.forEach((step, index) => {
      const view = step.cross1970View;
      const at = `${input} #${index}`;
      assert.equal(step.codeLines.length, 1);
      assert.ok(step.note.en.length <= 28, `en note: ${step.note.en}`);
      assert.ok(step.note.vi.length <= 28, `vi note: ${step.note.vi}`);
      if (previous && view.parent && JSON.stringify(previous) !== JSON.stringify(view.parent)) {
        assert.ok(view.event === 'halve' || view.event === 'link', `${at}: parent changed on ${view.event}`);
      }
      if (view.parent) {
        previous = view.parent;
        const rootOf = (i) => {
          let k = i;
          for (let guard = 0; view.parent[k] !== k; guard++) {
            assert.ok(guard <= n + 2, `${at}: parent cycle`);
            k = view.parent[k];
          }
          return k;
        };
        view.land.forEach((isLand, id) => assert.equal(view.roots[id], isLand ? rootOf(id) : null, `${at}: root of ${id}`));
        assert.equal(view.rootTop, rootOf(n));
        assert.equal(view.rootBottom, rootOf(n + 1));
      }
      const crossing = (view.event === 'cross-check' && view.condition === true) || step.final;
      assert.equal(view.crossed, crossing, `${at}: crossed`);
      if (view.crossed) {
        const route = view.route;
        assert.ok(Array.isArray(route) && route.length >= row, `${at}: route`);
        assert.ok(route.every((id) => view.land[id]), `${at}: route on land`);
        assert.equal(Math.floor(route[0] / col), 0);
        assert.equal(Math.floor(route.at(-1) / col), row - 1);
        route.forEach((id, k) => {
          if (!k) return;
          const p = route[k - 1];
          const dist = Math.abs(Math.floor(id / col) - Math.floor(p / col)) + Math.abs((id % col) - (p % col));
          assert.equal(dist, 1, `${at}: route step ${p}→${id}`);
        });
      } else {
        assert.equal(view.route, null);
      }
    });
  }
});

test('1970 default example and every preset walk every executable line; a short preset exists', () => {
  const { cases } = renderer('en');
  assert.equal(cases[0][0], problem.defaultInput);
  const nonBlank = problem.code.flatMap((text, index) => (text.trim() ? [index + 1] : []));
  assert.deepEqual(nonBlank, EXECUTABLE);
  for (const input of presets(cases)) {
    const seen = new Set(problem.builder(input).steps.map((step) => step.codeLines[0]));
    assert.deepEqual(EXECUTABLE.filter((line) => !seen.has(line)), [], input);
  }
  assert.ok(parse(cases[1][0]).cells.length <= 4, 'a short preset');
});

test('1970 displayed Python returns the builder answers', (t) => {
  const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
  const { cases } = renderer('en');
  const inputs = [...presets(cases), ...randomInputs(60, 7), ...EXTREMES];
  const args = inputs.map((input) => problem.liveArgs(input, {}));
  const script = "import json,sys\npayload=json.load(sys.stdin)\nexec(payload['code'])\nprint(json.dumps([Solution().latestDayToCross(*a) for a in payload['cases']]))";
  const result = spawnSync(python, ['-c', script], { input: JSON.stringify({ code: problem.code.join('\n'), cases: args }), encoding: 'utf8', timeout: 60000 });
  if (result.error) {
    t.skip(`no python to run: ${result.error.message}`);
    return;
  }
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), inputs.map((input) => problem.builder(input).answer));
});

test('1970 renders every frame in both languages with the executed line and one picture per state', () => {
  for (const lang of ['vi', 'en']) {
    const ui = renderer(lang);
    for (const input of presets(ui.cases)) {
      const { steps } = problem.builder(input);
      const saved = JSON.stringify(steps);
      steps.forEach((step, index) => {
        const html = ui.render(step, steps, index);
        const view = step.cross1970View;
        const line = step.codeLines[0];
        const at = `${lang} ${input} #${index}`;
        assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object/, at);
        assert.ok(html.includes(`data-source-line="${line}"`), at);
        assert.ok(html.includes(`<div class="lc1970-now" data-code-line="${line}" aria-current="step"><span class="lc1970-lineno">L${line}</span>`), at);
        assert.equal((html.match(/data-code-line=/g) || []).length, 1);
        assert.doesNotMatch(html, /def latestDayToCross|def find/, 'source is shown only in the shared #codePanel');
        assert.equal((html.match(/data-cell="/g) || []).length, view.n, at);
        assert.equal((html.match(/data-day="/g) || []).length, view.n, at);
        assert.equal((html.match(/<rect class="lc1970-bar /g) || []).length, 2, at);
        const links = view.parent ? view.parent.filter((p, i) => p !== i).length : 0;
        assert.equal((html.match(/class="lc1970-link/g) || []).length, links, `${at}: one arrow per non-root node`);
        assert.equal((html.match(/data-lc1970-case="/g) || []).length, ui.cases.length);
        const branch = BRANCH_EVENTS.includes(view.event);
        assert.equal(/class="lc1970-branch/.test(html), branch, `${at}: badge on ${view.event}`);
        if (branch) {
          assert.ok([10, 22, 24, 28, 30].includes(line), at);
          assert.ok(html.includes(`lc1970-branch is-${view.condition}">${view.condition ? 'True' : 'False'}`), at);
        }
        assert.equal(/is-route/.test(html), view.crossed, `${at}: route only when crossed`);
      });
      assert.equal(JSON.stringify(steps), saved, 'rendering does not mutate steps');
    }
  }
});

// Approximate boxes from the SVG attributes. Monospace glyphs are ~0.6em wide.
function svgBoxes(html) {
  const svg = html.match(/<svg class="lc1970-svg" width="([\d.]+)" height="([\d.]+)"/);
  const rects = (name) => [...html.matchAll(new RegExp(`<rect class="lc1970-${name}[^"]*" data-[\\w-]+="(\\d+)" x="([\\d.]+)" y="([\\d.]+)" width="([\\d.]+)" height="([\\d.]+)"`, 'g'))]
    .map((m) => ({ name: `${name}#${m[1]}`, id: +m[1], x: +m[2], y: +m[3], w: +m[4], h: +m[5] }));
  const size = { 'lc1970-cell-label': 14, 'lc1970-answer-mark': 12 };
  const texts = [...html.matchAll(/<text class="(lc1970-[\w-]+)[^"]*" x="([\d.]+)" y="([\d.]+)">([^<]*)<\/text>/g)].map((m) => {
    const [, kind, tx, ty, label] = m;
    const px = size[kind] || 11;
    const w = [...label].length * px * 0.6;
    const x = kind === 'lc1970-caption' ? +tx : +tx - w / 2;
    return { kind, name: `${kind}:${label}@${tx},${ty}`, x, y: +ty - px * 0.9, w, h: px * 1.1, cx: +tx };
  });
  const lines = [...html.matchAll(/<line class="lc1970-link[^"]*"[^>]* x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/g)]
    .map((m) => m.slice(1, 5).map(Number));
  return { width: Number(svg[1]), height: Number(svg[2]), cells: rects('cell'), boxes: rects('daybox'), bars: rects('bar'), texts, lines };
}

const hit = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;
const inside = (a, b) => a.x >= b.x && a.x + a.w <= b.x + b.w && a.y >= b.y - 0.5 && a.y + a.h <= b.y + b.h + 0.5;

test('1970 picture: labels sit inside their cells, boxes and bars, nothing overlaps, everything stays inside the viewBox', () => {
  const ui = renderer('vi');
  for (const input of [...presets(ui.cases), ...randomInputs(60, 99), ...EXTREMES]) {
    const { steps } = problem.builder(input);
    steps.forEach((step, index) => {
      const { width, height, cells, boxes, bars, texts, lines } = svgBoxes(ui.render(step, steps, index));
      const at = `${input} #${index}`;
      const shapes = [...cells, ...boxes, ...bars];
      for (const b of [...shapes, ...texts]) {
        assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.w <= width && b.y + b.h <= height, `${at}: ${b.name} clipped`);
      }
      for (const [x1, y1, x2, y2] of lines) {
        assert.ok(Math.min(x1, x2) >= 0 && Math.min(y1, y2) >= 0 && Math.max(x1, x2) <= width && Math.max(y1, y2) <= height, `${at}: link clipped`);
      }
      const owner = (t) => {
        if (t.kind === 'lc1970-cell-label' || t.kind === 'lc1970-cell-id') return cells.find((s) => t.cx > s.x && t.cx < s.x + s.w && t.y >= s.y - 1 && t.y < s.y + s.h);
        if (t.kind === 'lc1970-day-label') return boxes.find((s) => t.cx > s.x && t.cx < s.x + s.w);
        if (t.kind === 'lc1970-bar-label') return bars.find((s) => t.y >= s.y - 1 && t.y < s.y + s.h);
        return null;
      };
      texts.forEach((t, a) => {
        const mine = owner(t);
        if (['lc1970-cell-label', 'lc1970-cell-id', 'lc1970-day-label', 'lc1970-bar-label'].includes(t.kind)) {
          assert.ok(mine && inside(t, mine), `${at}: ${t.name} outside its shape`);
        }
        for (let b = a + 1; b < texts.length; b++) assert.ok(!hit(t, texts[b], -0.5), `${at}: ${t.name} overlaps ${texts[b].name}`);
        for (const s of shapes) if (s !== mine) assert.ok(!hit(t, s, -0.5), `${at}: ${t.name} overlaps ${s.name}`);
      });
      for (let a = 0; a < shapes.length; a++) {
        for (let b = a + 1; b < shapes.length; b++) assert.ok(!hit(shapes[a], shapes[b], -0.5), `${at}: ${shapes[a].name} overlaps ${shapes[b].name}`);
      }
      assert.ok(width <= 500, `${at}: svg ${width} wide`);
    });
  }
});

test('1970 picture colors differ from the status colors and each other in both themes; water and neighbor are dashed', () => {
  const hex = (block, name) => (block.match(new RegExp(`--lc1970-${name}: (#[0-9a-f]{6});`, 'i')) || [])[1];
  const rgb = (value) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
  const distance = (a, b) => Math.hypot(...rgb(a).map((v, i) => v - rgb(b)[i]));
  const dark = CSS.match(/^\.lc1970-viz \{[^}]*\}/m)[0];
  const light = CSS.match(/\[data-theme="light"\] \.lc1970-viz \{[^}]*\}/)[0];
  for (const block of [dark, light]) {
    const picture = ['water', 'top', 'bottom', 'c0', 'c1', 'c2', 'c3', 'link', 'route'];
    for (const name of picture) {
      for (const status of ['green', 'red', 'amber']) {
        assert.ok(distance(hex(block, name), hex(block, status)) > 60, `${name} vs ${status}`);
      }
    }
    for (let a = 0; a < picture.length; a++) {
      for (let b = a + 1; b < picture.length; b++) {
        assert.ok(distance(hex(block, picture[a]), hex(block, picture[b])) > 60, `${picture[a]} vs ${picture[b]}`);
      }
    }
    for (const fill of ['water', 'top', 'bottom', 'c0', 'c1', 'c2', 'c3']) assert.ok(distance(hex(block, 'on-cell'), hex(block, fill)) > 150, `on-cell vs ${fill}`);
    assert.ok(distance(hex(block, 'on-water'), hex(block, 'water')) > 200, 'on-water vs water');
  }
  assert.match(CSS, /\.lc1970-cell\.is-water \{[^}]*stroke-dasharray/s);
  assert.match(CSS, /\.lc1970-cell\.is-nb \{[^}]*stroke-dasharray/s);
});

test('1970 aria-labels follow the page language', () => {
  const { steps } = problem.builder(problem.defaultInput);
  const last = steps.length - 1;
  const vi = renderer('vi');
  const en = renderer('en');
  assert.ok(vi.render(steps[last], steps, last).includes('role="img" aria-label="Đáp án: ngày 3"'));
  assert.ok(en.render(steps[last], steps, last).includes('role="img" aria-label="Answer: day 3"'));
  assert.ok(vi.render(steps[last], steps, last).includes('aria-label="LeetCode 1970 · dòng 31"'));
  assert.ok(en.render(steps[last], steps, last).includes('aria-label="LeetCode 1970 · line 31"'));
  assert.ok(vi.render(steps[0], steps, 0).includes('role="img" aria-label="Lưới 3×3, ngày 9"'));
  assert.ok(en.render(steps[0], steps, 0).includes('role="img" aria-label="3×3 grid, day 9"'));
  assert.ok(vi.render(steps[0], steps, 0).includes('aria-label="LeetCode 1970 · dòng 1"'));
  assert.ok(en.render(steps[0], steps, 0).includes('aria-label="LeetCode 1970 · line 1"'));
  const mid = steps.findIndex((step) => step.cross1970View.event === 'for-day');
  assert.ok(en.render(steps[mid], steps, mid).includes('role="img" aria-label="3×3 grid, day 8"'));
  assert.ok(vi.render(steps[mid], steps, mid).includes('role="img" aria-label="Lưới 3×3, ngày 8"'));
});

test('1970 shows locals once, in the shared Variables panel, with Python scoping', () => {
  const ui = renderer('en');
  for (const input of presets(ui.cases)) {
    const { steps } = problem.builder(input);
    let last = { day: '—', dr: '—', dc: '—' };
    let unionDepth = false;
    let findDepth = false;
    steps.forEach((step, index) => {
      const v = vars(step);
      const view = step.cross1970View;
      const at = `${input} #${index}`;
      assert.deepEqual(step.vars.map((item) => item.name), VAR_NAMES);
      if (view.event === 'find-call') findDepth = true;
      if (view.event === 'union-call') unionDepth = true;
      assert.equal(v.x !== '—', findDepth, `${at}: x only inside find`);
      assert.equal(v.a !== '—' && v.b !== '—', unionDepth, `${at}: a, b only inside union`);
      if (view.event === 'find-return') findDepth = false;
      if (view.event === 'link') unionDepth = false;
      if (view.event === 'for-day') last.day = v.day;
      if (view.event === 'for-dir') last = { ...last, dr: v.dr, dc: v.dc };
      assert.equal(v.day, last.day, `${at}: day keeps its value`);
      assert.equal(v.dr, last.dr, `${at}: dr keeps its value`);
      assert.equal(v.dc, last.dc, `${at}: dc keeps its value`);
      assert.doesNotMatch(ui.render(step, steps, index), /lc1970-locals|parent:/);
    });
  }
});

test('1970 rejects inputs outside the visualizer limits', () => {
  const bad = [
    'x',
    '1,3 | 1,1;1,2;1,3',
    '7,2 | 1,1;1,2',
    '5,5 | 1,1',
    '2,2 | 1,1;1,2;2,1',
    '2,2 | 1,1;1,1;2,1;2,2',
    '2,2 | 1,1;1,2;2,1;3,2',
    '2,2 | [[1,1],[1,2',
    '2,2 | 1,a;1,2;2,1;2,2',
    '2,a | 1,1;1,2;2,1;2,2',
    '2.5,2 | 1,1;1,2;2,1;2,2',
  ];
  for (const input of bad) assert.throws(() => problem.builder(input), /1970/, JSON.stringify(input));
  assert.doesNotThrow(() => problem.builder(''));
  assert.equal(problem.builder('2,2 | [[1,1],[2,1],[1,2],[2,2]]').answer, 2);
  assert.doesNotThrow(() => problem.builder(EXTREMES[0]));
});

test('1970 assets are wired with light/dark tokens, no code-panel height cap and a hanging indent', () => {
  const index = readFrontendIndex();
  assert.match(index, /last-day-cross-1970\.css\?v=last-day-cross-1970-v1" data-problem-ids="1970"/);
  assert.match(index, /renderer-last-day-cross-1970\.js\?v=last-day-cross-1970-v1" data-problem-ids="1970"/);
  assert.match(readFrontendJavaScript(), /step\.cross1970View\), surface: "treeView", render: \(step\) => \{\s*renderLastDayCross1970View\(step\)/);
  assert.match(CSS, /\.lc1970-viz \{[^}]*--lc1970-bg:/s);
  assert.match(CSS, /\[data-theme="light"\] \.lc1970-viz \{[^}]*--lc1970-bg:/s);
  assert.match(CSS, /\.lc1970-viz\) #codePanel \{[^}]*max-height: none;/s);
  assert.match(CSS, /\.lc1970-viz\) #codePanel \.code-line \{[^}]*white-space: pre-wrap;/s);
  assert.match(CSS, /\.lc1970-viz\) #codePanel \.code-line \.txt \{[^}]*white-space: pre-wrap;[^}]*overflow-wrap: anywhere;[^}]*--lc1970-hang/s);
});
