'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript } = require('./helpers/frontend-source');

const problem = SUPPORTED[1094];
const RENDERER = fs.readFileSync(require.resolve('../public/renderer-car-pooling-1094.js'), 'utf8');
const CSS = fs.readFileSync(require.resolve('../public/car-pooling-1094.css'), 'utf8');

function renderer(lang) {
  const host = { innerHTML: '' };
  const context = { lang, document: { getElementById: () => host } };
  vm.createContext(context);
  vm.runInContext(RENDERER, context);
  return {
    cases: vm.runInContext('CP1094_CASES', context),
    render(step, steps, index) {
      context.steps = steps;
      context.stepIndex = index;
      context.renderCarPooling1094View(step);
      return host.innerHTML;
    },
  };
}

// Brute force: riders in the car at every stop 0..16 (on [from, to)); never above capacity -> true.
function ridersAt(trips, stop) {
  return trips.reduce((sum, [num, from, to]) => sum + (from <= stop && stop < to ? num : 0), 0);
}

function bruteForce(trips, capacity) {
  for (let stop = 0; stop <= 16; stop++) {
    if (ridersAt(trips, stop) > capacity) return false;
  }
  return true;
}

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

// Random inputs inside the visualizer limits (n <= 8, num <= 9, to <= 16), capacity near the peak so both answers occur.
function randomInputs(count) {
  const random = seeded(1094);
  const out = [];
  for (let k = 0; k < count; k++) {
    const n = 1 + Math.floor(random() * 8);
    const trips = Array.from({ length: n }, () => {
      const from = Math.floor(random() * 16);
      const to = from + 1 + Math.floor(random() * (16 - from));
      return [1 + Math.floor(random() * 9), from, to];
    });
    let peak = 0;
    for (let stop = 0; stop <= 16; stop++) peak = Math.max(peak, ridersAt(trips, stop));
    const capacity = Math.max(1, Math.min(99, peak + Math.floor(random() * 5) - 2));
    out.push([JSON.stringify(trips), capacity]);
  }
  return out;
}

const presetInputs = (cases) => cases.map((preset) => [preset[0], preset[1]]);

test('1094 and 1854 problem ids are numbers (the active-chip highlight compares numbers)', () => {
  for (const id of [1094, 1854]) {
    assert.equal(typeof SUPPORTED[id].id, 'number', `${id}`);
    assert.equal(SUPPORTED[id].id, id);
  }
  assert.equal(problem.category.key, 'prefix-sum');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.extraParams[0].key, 'capacity');
});

test('1094 answer equals brute force on presets and random inputs; bars equal riders; notes <= 28 chars', () => {
  const { cases } = renderer('en');
  const inputs = [...presetInputs(cases), ...randomInputs(300)];
  const answers = new Set();
  for (const [input, capacity] of inputs) {
    const trips = JSON.parse(input);
    const result = problem.builder(input, { capacity });
    const expected = bruteForce(trips, capacity);
    assert.equal(result.answer, expected, `${input} cap ${capacity}`);
    answers.add(expected);
    const last = result.steps.at(-1);
    assert.ok(last.final);
    assert.equal(result.steps.filter((step) => step.final).length, 1);
    assert.equal(last.codeLines[0], expected ? 15 : 14);
    const view = last.carPool1094View;
    assert.equal(view.answer, expected);
    view.prefix.forEach((curr, stop) => assert.equal(curr, ridersAt(trips, stop), `${input}: stop ${stop}`));
    if (!expected) assert.ok(view.prefix.at(-1) > capacity && view.prefix.slice(0, -1).every((v) => v <= capacity), 'stops at the first overflow');
    result.steps.forEach((step) => {
      assert.equal(step.codeLines.length, 1);
      assert.ok(step.note.en.length <= 28, `en note: ${step.note.en}`);
      assert.ok(step.note.vi.length <= 28, `vi note: ${step.note.vi}`);
    });
  }
  assert.deepEqual([...answers].sort(), [false, true], 'random inputs cover both answers');
});

test('1094 default example walks every line but return False; presets cover it; a short preset exists', () => {
  const { cases } = renderer('en');
  assert.equal(cases[0][0], problem.defaultInput);
  assert.equal(cases[0][1], problem.extraParams[0].default);
  const nonBlank = problem.code.flatMap((text, index) => (text.trim() ? [index + 1] : []));
  const linesOf = (input, capacity) => new Set(problem.builder(input, { capacity }).steps.map((step) => step.codeLines[0]));
  const main = linesOf(problem.defaultInput, problem.extraParams[0].default);
  assert.deepEqual(nonBlank.filter((line) => !main.has(line)), [14], 'default returns True after every stop');
  const all = new Set(presetInputs(cases).flatMap(([input, capacity]) => [...linesOf(input, capacity)]));
  assert.deepEqual(nonBlank.filter((line) => !all.has(line)), []);
  assert.ok(JSON.parse(problem.defaultInput).length >= 6);
  const views = problem.builder(problem.defaultInput).steps.map((step) => step.carPool1094View);
  assert.ok(views.some((v) => v.event === 'check' && v.condition === false && v.curr === v.capacity), 'exactly full still fits');
  assert.ok(views.some((v) => v.event === 'plus' && v.diff[v.changed] !== v.delta), 'a pick-up adds onto an earlier drop-off');
  assert.ok(cases.some(([input]) => JSON.parse(input).length <= 2), 'a short preset');
});

test('1094 renders every frame in both languages with the executed line and one picture per state', () => {
  for (const lang of ['vi', 'en']) {
    const ui = renderer(lang);
    for (const [input, capacity] of presetInputs(ui.cases)) {
      const { steps } = problem.builder(input, { capacity });
      const saved = JSON.stringify(steps);
      steps.forEach((step, index) => {
        const html = ui.render(step, steps, index);
        const view = step.carPool1094View;
        const line = step.codeLines[0];
        assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object/, `${lang} ${input} #${index}`);
        assert.ok(html.includes(`data-source-line="${line}"`));
        assert.ok(html.includes(`<div class="cp1094-now" data-code-line="${line}" aria-current="step"><span class="cp1094-lineno">L${line}</span>`));
        assert.equal((html.match(/data-code-line=/g) || []).length, 1);
        assert.doesNotMatch(html, /def carPooling|range\(last/, 'source is shown only in the shared #codePanel');
        assert.equal((html.match(/data-trip="/g) || []).length, view.trips.length, 'one bar per trip');
        assert.equal((html.match(/data-trip-num="/g) || []).length, view.trips.length);
        assert.equal((html.match(/data-drop="/g) || []).length, view.trips.length, 'one drop-off dot per trip');
        assert.equal((html.match(/data-cell="/g) || []).length, view.diff ? view.diff.length : 0, 'one diff cell per stop');
        assert.equal((html.match(/data-curr-value="/g) || []).length, view.prefix.length, 'one curr cell per visited stop');
        assert.equal((html.match(/data-load="/g) || []).length, view.prefix.filter((v) => v > 0).length);
        assert.equal((html.match(/data-cap="/g) || []).length, 1, 'the capacity line is always drawn');
        assert.equal(html.includes('data-delta="'), view.event === 'plus' || view.event === 'minus');
        assert.equal(html.includes('data-band="'), view.i !== null, 'current stop column during the second loop');
        assert.equal((html.match(/class="cp1094-load[^"]*is-over/g) || []).length, view.prefix.filter((v) => v > view.capacity).length);
        if (view.condition !== null) assert.match(html, view.condition ? /cp1094-branch is-over">True/ : /cp1094-branch is-ok">False/);
        if (view.final) assert.match(html, view.answer ? /cp1094-viz is-final is-ok/ : /cp1094-viz is-final is-over/);
      });
      assert.equal(JSON.stringify(steps), saved, 'rendering does not mutate steps');
    }
  }
});

// Approximate boxes from the SVG attributes. Text is monospace: ~0.6em per glyph (11px text, 12px for deltas/capacity).
function svgBoxes(html) {
  const svg = html.match(/<svg class="cp1094-svg" width="([\d.]+)" height="([\d.]+)"/);
  const width = Number(svg[1]);
  const height = Number(svg[2]);
  const shapes = [];
  const trips = [];
  for (const m of html.matchAll(/<rect class="(cp1094-(?:trip|load))[^"]*"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)) {
    const box = { name: `${m[1]}@${m[2]},${m[3]}`, x: +m[2], y: +m[3], w: +m[4], h: +m[5] };
    shapes.push(box);
    if (m[1] === 'cp1094-trip') trips.push(box);
  }
  for (const m of html.matchAll(/<circle class="cp1094-drop[^"]*"[^>]* cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)) {
    const r = +m[3] + 1;
    shapes.push({ name: `drop@${m[1]},${m[2]}`, x: +m[1] - r, y: +m[2] - r, w: r * 2, h: r * 2 });
  }
  const cells = [];
  for (const m of html.matchAll(/<rect class="cp1094-(?:cell|curr)[^"]*"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)) {
    cells.push({ name: `cell@${m[1]},${m[2]}`, x: +m[1], y: +m[2], w: +m[3], h: +m[4] });
  }
  const texts = [];
  for (const m of html.matchAll(/<text class="(cp1094-[\w-]+)([^"]*)"[^>]* x="([\d.]+)" y="([\d.]+)"[^>]*>([^<]*)<\/text>/g)) {
    const [, kind, , tx, ty, label] = m;
    const size = kind === 'cp1094-delta' || kind === 'cp1094-cap-label' ? 12 : 11;
    const w = [...label].length * size * 0.6;
    const anchor = kind === 'cp1094-row-label' ? 'end' : kind === 'cp1094-cap-label' ? 'start' : 'middle';
    const x = anchor === 'end' ? +tx - w : anchor === 'start' ? +tx : +tx - w / 2;
    texts.push({ kind, name: `${kind}:${label}@${tx},${ty}`, x, y: +ty - size, w, h: size + 2 });
  }
  const marks = [];
  for (const m of html.matchAll(/<line class="cp1094-cap[^"]*"[^>]* x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="[\d.]+"/g)) {
    marks.push({ name: 'cap-line', x: +m[1], y: +m[2] - 0.75, w: +m[3] - +m[1], h: 1.5 });
  }
  return { width, height, shapes, trips, cells, texts, marks };
}

const hit = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;
const inside = (a, b) => a.x >= b.x && a.x + a.w <= b.x + b.w && a.y >= b.y - 0.5 && a.y + a.h <= b.y + b.h + 2;

test('1094 picture: bars, dots, labels and the capacity line never overlap and stay inside the viewBox', () => {
  const ui = renderer('en');
  const extra = [
    [JSON.stringify(Array.from({ length: 8 }, (_, k) => [9, k, 16])), 99], // tallest stack, widest diff values
    [JSON.stringify(Array.from({ length: 8 }, () => [9, 15, 16])), 1], // +72/-72 in one cell, instant overflow
    ['[[1,0,1]]', 1], ['[[1,0,16]]', 99], ['[[9,0,1]]', 9],
  ];
  for (const [input, capacity] of [...presetInputs(ui.cases), ...randomInputs(80), ...extra]) {
    const { steps } = problem.builder(input, { capacity });
    steps.forEach((step, index) => {
      const { width, height, shapes, trips, cells, texts, marks } = svgBoxes(ui.render(step, steps, index));
      const at = `${input} cap ${capacity} #${index}`;
      for (const b of [...shapes, ...cells, ...texts, ...marks]) {
        assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.w <= width && b.y + b.h <= height, `${at}: ${b.name} clipped`);
      }
      // Rider counts sit inside their own trip bar; every other label stays clear of shapes.
      const nums = texts.filter((t) => t.kind === 'cp1094-trip-num');
      nums.forEach((t, k) => assert.ok(inside(t, trips[k]), `${at}: ${t.name} outside its trip bar`));
      for (let i = 0; i < texts.length; i++) {
        for (let j = i + 1; j < texts.length; j++) assert.ok(!hit(texts[i], texts[j], -0.5), `${at}: ${texts[i].name} overlaps ${texts[j].name}`);
        for (const s of shapes) {
          if (texts[i].kind === 'cp1094-trip-num' && trips.includes(s) && trips.indexOf(s) === nums.indexOf(texts[i])) continue;
          assert.ok(!hit(texts[i], s, -0.5), `${at}: ${texts[i].name} overlaps ${s.name}`);
        }
        for (const m of marks) assert.ok(!hit(texts[i], m, 0.5), `${at}: ${texts[i].name} touches the capacity line`);
      }
      for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) assert.ok(!hit(shapes[i], shapes[j], -0.5), `${at}: ${shapes[i].name} overlaps ${shapes[j].name}`);
      }
      for (let i = 0; i < cells.length; i++) {
        for (let j = i + 1; j < cells.length; j++) assert.ok(!hit(cells[i], cells[j], -0.5), `${at}: ${cells[i].name} overlaps ${cells[j].name}`);
      }
      // Every diff / curr value fits inside its own cell.
      const values = texts.filter((t) => t.kind === 'cp1094-cell-value' || t.kind === 'cp1094-curr-value');
      assert.equal(values.length, cells.length);
      values.forEach((t, k) => assert.ok(t.x >= cells[k].x && t.x + t.w <= cells[k].x + cells[k].w, `${at}: ${t.name} wider than its cell`));
      // Natural width stays near the picture card so labels are not scaled below their CSS size on a desktop window.
      assert.ok(width <= 500, `${at}: svg ${width} wide`);
    });
  }
});

test('1094 picture colors differ from the fits/over/capacity colors in both themes; over is also dashed', () => {
  const hex = (block, name) => (block.match(new RegExp(`--cp1094-${name}: (#[0-9a-f]{6});`, 'i')) || [])[1];
  const rgb = (value) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
  const distance = (a, b) => Math.hypot(...rgb(a).map((v, i) => v - rgb(b)[i]));
  const dark = CSS.match(/^\.cp1094-viz \{[^}]*\}/m)[0];
  const light = CSS.match(/\[data-theme="light"\] \.cp1094-viz \{[^}]*\}/)[0];
  for (const block of [dark, light]) {
    const picture = ['trip', 'plus', 'minus', 'cur', 'load'];
    for (const name of picture) {
      for (const status of ['green', 'red', 'amber']) {
        assert.ok(distance(hex(block, name), hex(block, status)) > 60, `${name} vs ${status}`);
      }
    }
    for (let i = 0; i < picture.length; i++) {
      for (let j = i + 1; j < picture.length; j++) {
        if (picture[i] === 'trip' && picture[j] === 'load') continue; // both neutral "riders" tones in different rows
        assert.ok(distance(hex(block, picture[i]), hex(block, picture[j])) > 60, `${picture[i]} vs ${picture[j]}`);
      }
    }
    // The rider count is readable on a trip bar and on the current (purple) trip bar.
    for (const fill of ['trip', 'cur']) assert.ok(distance(hex(block, 'on-trip'), hex(block, fill)) > 150, `on-trip vs ${fill}`);
  }
  assert.match(CSS, /\.cp1094-load\.is-check-over \{[^}]*stroke-dasharray/s);
  assert.doesNotMatch(CSS.match(/\.cp1094-load\.is-check-ok \{[^}]*\}/s)[0], /stroke-dasharray/);
});

test('1094 load bars stay readable when capacity is far above the load; the capacity line is then pinned above them', () => {
  const ui = renderer('en');
  for (const [input, capacity, pinned] of [['[[1,0,16]]', 99, true], ['[[9,0,1]]', 99, true], ['[[2,1,5],[3,3,7]]', 4, false], ['[[2,1,5],[3,3,7]]', 6, false]]) {
    const { steps } = problem.builder(input, { capacity });
    const html = ui.render(steps.at(-1), steps, steps.length - 1);
    const heights = [...html.matchAll(/<rect class="cp1094-load[^"]*"[^>]* y="([\d.]+)" width="[\d.]+" height="([\d.]+)"/g)].map((m) => [+m[1], +m[2]]);
    const capY = +html.match(/<line class="cp1094-cap[^"]*"[^>]* y1="([\d.]+)"/)[1];
    assert.ok(heights.length > 0);
    assert.ok(Math.max(...heights.map(([, h]) => h)) >= 14, `${input} cap ${capacity}: tallest bar readable`);
    assert.equal(/cp1094-cap is-off-scale/.test(html), pinned, `${input} cap ${capacity}`);
    assert.equal(html.includes(`>↑${capacity}</text>`), pinned);
    if (pinned) assert.ok(heights.every(([y]) => y > capY), 'pinned line sits above every bar');
  }
});

test('1094 aria-labels follow the page language', () => {
  const { steps } = problem.builder(problem.defaultInput);
  const last = steps.at(-1);
  const vi = renderer('vi').render(last, steps, steps.length - 1);
  const en = renderer('en').render(last, steps, steps.length - 1);
  assert.ok(vi.includes('role="img" aria-label="Không quá tải"'));
  assert.ok(en.includes('role="img" aria-label="Never over capacity"'));
  assert.ok(vi.includes('aria-label="LeetCode 1094 · dòng 15"'));
  assert.ok(en.includes('aria-label="LeetCode 1094 · line 15"'));
  const first = renderer('vi').render(steps[0], steps, 0);
  assert.ok(first.includes(`role="img" aria-label="${last.carPool1094View.trips.length} chuyến, chứa 6"`));
  const over = problem.builder('[[2,1,5],[3,3,7]]', { capacity: 4 }).steps;
  assert.ok(renderer('vi').render(over.at(-1), over, over.length - 1).includes('aria-label="Quá tải ở điểm 3"'));
  assert.ok(renderer('en').render(over.at(-1), over, over.length - 1).includes('aria-label="Over at stop 3"'));
});

test('1094 shows locals once: in the shared Variables panel, not in the line strip', () => {
  const ui = renderer('en');
  const { steps } = problem.builder(problem.defaultInput);
  steps.forEach((step, index) => {
    assert.deepEqual(step.vars.map((v) => v.name), ['capacity', 'last', 'num', 'start', 'end', 'diff', 'i', 'curr']);
    assert.doesNotMatch(ui.render(step, steps, index), /cp1094-locals|curr:|capacity:/);
  });
});

test('1094 keeps the last trip in num/start/end after the first loop, as Python does', () => {
  const { steps } = problem.builder('[[2,1,5],[3,3,7]]', { capacity: 9 });
  const vars = (step) => Object.fromEntries(step.vars.map((v) => [v.name, v.value]));
  const done = steps.findIndex((step) => step.carPool1094View.event === 'for-trip-done');
  for (const step of steps.slice(done)) assert.deepEqual([vars(step).num, vars(step).start, vars(step).end], [3, 3, 7]);
  assert.equal(steps[done + 1].carPool1094View.trip, null, 'the picture no longer marks a current trip');
  assert.deepEqual([vars(steps[0]).num, vars(steps[0]).start, vars(steps[0]).end], ['—', '—', '—']);
});

test('1094 rejects inputs outside the visualizer limits', () => {
  const bad = ['', '[]', 'nope', '[[1,2,2]]', '[[1,3,2]]', '[[0,1,2]]', '[[10,1,2]]', '[[1,-1,2]]', '[[1,0,17]]', '[[1,0]]',
    JSON.stringify(Array.from({ length: 9 }, () => [1, 0, 1]))];
  for (const input of bad) assert.throws(() => problem.builder(input, { capacity: 4 }), /1094/, input);
  for (const capacity of [0, 100, 2.5, 'x']) assert.throws(() => problem.builder('[[1,0,1]]', { capacity }), /1094/, String(capacity));
  assert.doesNotThrow(() => problem.builder('[[9,0,16]]', { capacity: 99 }));
  assert.deepEqual(problem.liveArgs('[[2,1,5],[3,3,7]]', { capacity: 4 }), [[[2, 1, 5], [3, 3, 7]], 4]);
});

test('1094 assets are wired with light/dark tokens and no code-panel height cap', () => {
  const index = readFrontendIndex();
  assert.match(index, /car-pooling-1094\.css\?v=car-pooling-1094-v1" data-problem-ids="1094"/);
  assert.match(index, /renderer-car-pooling-1094\.js\?v=car-pooling-1094-v1" data-problem-ids="1094"/);
  assert.match(readFrontendJavaScript(), /step\.carPool1094View\), surface: "treeView", render: \(step\) => \{\s*renderCarPooling1094View\(step\)/);
  assert.match(CSS, /\.cp1094-viz \{[^}]*--cp1094-bg:/s);
  assert.match(CSS, /\[data-theme="light"\] \.cp1094-viz \{[^}]*--cp1094-bg:/s);
  assert.match(CSS, /\.cp1094-viz\) #codePanel \{[^}]*max-height: none;/s);
  assert.match(CSS, /\.cp1094-viz\) #codePanel \.code-line \{[^}]*white-space: pre-wrap;/s, 'long code lines wrap instead of being cut off');
  assert.match(CSS, /\.cp1094-viz\) #codePanel \.code-line \.txt \{[^}]*white-space: pre-wrap;[^}]*overflow-wrap: anywhere;/s);
});
