'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript } = require('./helpers/frontend-source');

const problem = SUPPORTED[1854];
const RENDERER = fs.readFileSync(require.resolve('../public/renderer-max-population-1854.js'), 'utf8');
const CSS = fs.readFileSync(require.resolve('../public/max-population-1854.css'), 'utf8');

function renderer(lang) {
  const host = { innerHTML: '' };
  const context = { lang, document: { getElementById: () => host } };
  vm.createContext(context);
  vm.runInContext(RENDERER, context);
  return {
    cases: vm.runInContext('MP1854_CASES', context),
    render(step, steps, index) {
      context.steps = steps;
      context.stepIndex = index;
      context.renderMaxPopulation1854View(step);
      return host.innerHTML;
    },
  };
}

// Brute force: count people alive (birth <= year < death) in every year 1950..2050; earliest max wins.
function bruteForce(logs) {
  let best = -1;
  let year = null;
  for (let y = 1950; y <= 2050; y++) {
    const alive = logs.filter(([birth, death]) => birth <= y && y < death).length;
    if (alive > best) {
      best = alive;
      year = y;
    }
  }
  return year;
}

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

// Random inputs inside the visualizer limits (n <= 10, max(death) - min(birth) <= 31), some touching 2050.
function randomInputs(count) {
  const random = seeded(1854);
  const out = [];
  for (let k = 0; k < count; k++) {
    const n = 1 + Math.floor(random() * 10);
    const base = random() < 0.25 ? 2019 : 1950 + Math.floor(random() * 70);
    const width = 1 + Math.floor(random() * 31);
    const logs = Array.from({ length: n }, () => {
      const birth = base + Math.floor(random() * width);
      const death = birth + 1 + Math.floor(random() * (base + width - birth));
      return [birth, death];
    });
    out.push(JSON.stringify(logs));
  }
  return out;
}

test('1854 problem id is a number (the active-chip highlight compares numbers)', () => {
  assert.equal(typeof problem.id, 'number');
  assert.equal(problem.id, 1854);
  assert.equal(problem.category.key, 'prefix-sum');
  assert.equal(problem.debugMode, 'line-by-line');
});

test('1854 answer equals brute force on presets and random inputs; bars equal people alive; notes <= 28 chars', () => {
  const { cases } = renderer('en');
  for (const input of [...cases.map((preset) => preset[0]), ...randomInputs(300)]) {
    const logs = JSON.parse(input);
    const result = problem.builder(input);
    assert.equal(result.answer, bruteForce(logs), input);
    const last = result.steps.at(-1);
    assert.ok(last.final);
    assert.equal(result.steps.filter((step) => step.final).length, 1);
    const view = last.maxPop1854View;
    assert.equal(view.ans, result.answer);
    view.prefix.forEach((curr, cell) => {
      const year = view.lo + cell;
      assert.equal(curr, logs.filter(([birth, death]) => birth <= year && year < death).length, `${input}: ${year}`);
    });
    assert.equal(view.maxPop, view.peak, 'max_pop is the bar-chart scale');
    result.steps.forEach((step) => {
      assert.equal(step.codeLines.length, 1);
      assert.ok(step.note.en.length <= 28, `en note: ${step.note.en}`);
      assert.ok(step.note.vi.length <= 28, `vi note: ${step.note.vi}`);
    });
  }
});

test('1854 default example walks every code line, shows a tie, and a short preset exists', () => {
  const { cases } = renderer('en');
  assert.equal(cases[0][0], problem.defaultInput);
  const nonBlank = problem.code.flatMap((text, index) => (text.trim() ? [index + 1] : []));
  const result = problem.builder(problem.defaultInput);
  const lines = new Set(result.steps.map((step) => step.codeLines[0]));
  assert.deepEqual(nonBlank.filter((line) => !lines.has(line)), []);
  assert.ok(JSON.parse(problem.defaultInput).length >= 8);
  const views = result.steps.map((step) => step.maxPop1854View);
  assert.ok(views.some((v) => v.event === 'check' && v.condition === false && v.curr === v.maxPop && v.curr > 0), 'a tie keeps the earlier year');
  assert.ok(views.some((v) => v.event === 'check' && v.condition === false && v.curr < v.maxPop), 'a smaller year');
  assert.ok(views.filter((v) => v.event === 'set-max').length >= 3, 'max_pop climbs several times');
  assert.ok(cases.some(([input]) => JSON.parse(input).length <= 3), 'a short preset');
});

test('1854 renders every frame in both languages with the executed line and one picture per state', () => {
  for (const lang of ['vi', 'en']) {
    const ui = renderer(lang);
    for (const [input] of ui.cases) {
      const { steps } = problem.builder(input);
      const saved = JSON.stringify(steps);
      steps.forEach((step, index) => {
        const html = ui.render(step, steps, index);
        const view = step.maxPop1854View;
        const line = step.codeLines[0];
        assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object/, `${lang} ${input} #${index}`);
        assert.ok(html.includes(`data-source-line="${line}"`));
        assert.ok(html.includes(`<div class="mp1854-now" data-code-line="${line}" aria-current="step"><span class="mp1854-lineno">L${line}</span>`));
        assert.equal((html.match(/data-code-line=/g) || []).length, 1);
        assert.doesNotMatch(html, /def maximumPopulation|range\(len\(diff\)\)/, 'source is shown only in the shared #codePanel');
        assert.equal((html.match(/data-life="/g) || []).length, view.logs.length, 'one life bar per person');
        assert.equal((html.match(/data-death="/g) || []).length, view.logs.length, 'one death dot per person');
        assert.equal((html.match(/data-cell="/g) || []).length, view.diff ? view.diff.length : 0, 'one diff cell per year');
        assert.equal((html.match(/data-pop-value="/g) || []).length, view.prefix.length, 'one population label per finished year');
        assert.equal((html.match(/data-pop="/g) || []).length, view.prefix.filter((v) => v > 0).length);
        assert.equal(html.includes('data-delta="'), view.event === 'plus' || view.event === 'minus');
        assert.equal(html.includes('data-max="'), Boolean(view.maxPop));
        assert.equal(html.includes('data-band="'), view.i !== null, 'current year column during the second loop');
        if (view.condition !== null) assert.match(html, /mp1854-branch is-(true|false)/);
        if (view.final) assert.ok(html.includes(`data-best-band="${view.ans - view.start}"`));
      });
      assert.equal(JSON.stringify(steps), saved, 'rendering does not mutate steps');
    }
  }
});

// Approximate boxes from the SVG attributes. Text is monospace: ~0.6em per glyph (11px text, 12px for deltas/max).
function svgBoxes(html) {
  const svg = html.match(/<svg class="mp1854-svg" width="(\d+(?:\.\d+)?)" height="(\d+(?:\.\d+)?)"/);
  const width = Number(svg[1]);
  const height = Number(svg[2]);
  const shapes = [];
  for (const m of html.matchAll(/<rect class="(mp1854-(?:life|pop))[^"]*"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)) {
    shapes.push({ name: `${m[1]}@${m[2]},${m[3]}`, x: +m[2], y: +m[3], w: +m[4], h: +m[5] });
  }
  for (const m of html.matchAll(/<circle class="mp1854-death[^"]*"[^>]* cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)) {
    const r = +m[3] + 1;
    shapes.push({ name: `death@${m[1]},${m[2]}`, x: +m[1] - r, y: +m[2] - r, w: r * 2, h: r * 2 });
  }
  const cells = [];
  for (const m of html.matchAll(/<rect class="mp1854-cell[^"]*"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)) {
    cells.push({ name: `cell@${m[1]}`, x: +m[1], y: +m[2], w: +m[3], h: +m[4] });
  }
  const texts = [];
  for (const m of html.matchAll(/<text class="(mp1854-[\w-]+)([^"]*)"[^>]* x="([\d.]+)" y="([\d.]+)"[^>]*>([^<]*)<\/text>/g)) {
    const [, kind, extra, tx, ty, label] = m;
    const size = kind === 'mp1854-delta' || kind === 'mp1854-max-label' ? 12 : / is-wide/.test(extra) ? 10 : 11;
    const w = [...label].length * size * 0.6;
    const anchor = kind === 'mp1854-row-label' ? 'end' : kind === 'mp1854-max-label' ? 'start' : 'middle';
    const x = anchor === 'end' ? +tx - w : anchor === 'start' ? +tx : +tx - w / 2;
    texts.push({ name: `${kind}:${label}`, x, y: +ty - size, w, h: size + 2 });
  }
  const marks = [];
  for (const m of html.matchAll(/<line class="mp1854-max"[^>]* x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="[\d.]+"/g)) {
    marks.push({ name: 'max-line', x: +m[1], y: +m[2] - 0.75, w: +m[3] - +m[1], h: 1.5 });
  }
  return { width, height, shapes, cells, texts, marks };
}

const hit = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;

test('1854 picture: bars, dots, labels and the max_pop line never overlap and stay inside the viewBox', () => {
  const ui = renderer('en');
  const wide = JSON.stringify(Array.from({ length: 10 }, (_, k) => [1950 + k, 1980]));
  const allSame = JSON.stringify(Array.from({ length: 10 }, () => [2049, 2050]));
  const inputs = [...ui.cases.map((preset) => preset[0]), ...randomInputs(80), wide, allSame, '[[1950,1981]]', '[[2019,2050]]'];
  for (const input of inputs) {
    const { steps } = problem.builder(input);
    steps.forEach((step, index) => {
      const { width, height, shapes, cells, texts, marks } = svgBoxes(ui.render(step, steps, index));
      const at = `${input} #${index}`;
      for (const b of [...shapes, ...cells, ...texts, ...marks]) {
        assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.w <= width && b.y + b.h <= height, `${at}: ${b.name} clipped`);
      }
      for (let i = 0; i < texts.length; i++) {
        for (let j = i + 1; j < texts.length; j++) assert.ok(!hit(texts[i], texts[j], -0.5), `${at}: ${texts[i].name} overlaps ${texts[j].name}`);
        for (const s of shapes) assert.ok(!hit(texts[i], s, -0.5), `${at}: ${texts[i].name} overlaps ${s.name}`);
        for (const m of marks) assert.ok(!hit(texts[i], m, 0.5), `${at}: ${texts[i].name} touches the max_pop line`);
      }
      for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) assert.ok(!hit(shapes[i], shapes[j], -0.5), `${at}: ${shapes[i].name} overlaps ${shapes[j].name}`);
      }
      for (let i = 1; i < cells.length; i++) assert.ok(!hit(cells[i - 1], cells[i], -0.5), `${at}: diff cells overlap`);
      // Every diff value fits inside its own cell.
      texts.filter((t) => t.name.startsWith('mp1854-cell-value')).forEach((t, k) => {
        assert.ok(t.x >= cells[k].x && t.x + t.w <= cells[k].x + cells[k].w, `${at}: ${t.name} wider than its cell`);
      });
    });
  }
});

test('1854 picture colors differ from the True/False and best-year colors in both themes; False is also dashed', () => {
  const hex = (block, name) => (block.match(new RegExp(`--mp1854-${name}: (#[0-9a-f]{6});`, 'i')) || [])[1];
  const rgb = (value) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
  const distance = (a, b) => Math.hypot(...rgb(a).map((v, i) => v - rgb(b)[i]));
  const dark = CSS.match(/^\.mp1854-viz \{[^}]*\}/m)[0];
  const light = CSS.match(/\[data-theme="light"\] \.mp1854-viz \{[^}]*\}/)[0];
  for (const block of [dark, light]) {
    const picture = ['life', 'plus', 'minus', 'cur', 'pop'];
    for (const name of picture) {
      for (const status of ['green', 'red', 'amber']) {
        assert.ok(distance(hex(block, name), hex(block, status)) > 60, `${name} vs ${status}`);
      }
    }
    for (let i = 0; i < picture.length; i++) {
      for (let j = i + 1; j < picture.length; j++) {
        if (picture[i] === 'life' && picture[j] === 'pop') continue; // both are neutral "people" tones in different rows
        assert.ok(distance(hex(block, picture[i]), hex(block, picture[j])) > 60, `${picture[i]} vs ${picture[j]}`);
      }
    }
  }
  assert.match(CSS, /\.mp1854-pop\.is-false \{[^}]*stroke-dasharray/s);
  assert.doesNotMatch(CSS.match(/\.mp1854-pop\.is-true \{[^}]*\}/s)[0], /stroke-dasharray/);
});

test('1854 aria-labels follow the page language', () => {
  const { steps } = problem.builder(problem.defaultInput);
  const last = steps.at(-1);
  const vi = renderer('vi').render(last, steps, steps.length - 1);
  const en = renderer('en').render(last, steps, steps.length - 1);
  assert.ok(vi.includes(`role="img" aria-label="năm đông nhất: ${last.maxPop1854View.ans}"`));
  assert.ok(en.includes(`role="img" aria-label="best year: ${last.maxPop1854View.ans}"`));
  assert.ok(vi.includes('aria-label="LeetCode 1854 · dòng 18"'));
  assert.ok(en.includes('aria-label="LeetCode 1854 · line 18"'));
  const first = renderer('vi').render(steps[0], steps, 0);
  assert.ok(first.includes(`role="img" aria-label="${last.maxPop1854View.logs.length} người"`));
});

test('1854 shows locals once: in the shared Variables panel, not in the line strip', () => {
  const ui = renderer('en');
  const { steps } = problem.builder(problem.defaultInput);
  steps.forEach((step, index) => {
    assert.deepEqual(step.vars.map((v) => v.name), ['lo', 'hi', 'birth', 'death', 'diff', 'i', 'curr', 'max_pop', 'ans']);
    assert.doesNotMatch(ui.render(step, steps, index), /mp1854-locals|max_pop:|curr:/);
  });
});

test('1854 rejects inputs outside the visualizer limits', () => {
  const bad = ['', '[]', 'nope', '[[1960,1960]]', '[[1970,1960]]', '[[1949,1960]]', '[[2000,2051]]', '[[1950,1960,1]]',
    '[[1950,1982]]', JSON.stringify(Array.from({ length: 11 }, () => [1950, 1951]))];
  for (const input of bad) assert.throws(() => problem.builder(input), /1854/, input);
  assert.doesNotThrow(() => problem.builder('[[1950,1981]]'));
  assert.deepEqual(problem.liveArgs('[[1950,1961],[1960,1971]]'), [[[1950, 1961], [1960, 1971]]]);
});

test('1854 assets are wired with light/dark tokens and no code-panel height cap', () => {
  const index = readFrontendIndex();
  assert.match(index, /max-population-1854\.css\?v=max-population-1854-v1" data-problem-ids="1854"/);
  assert.match(index, /renderer-max-population-1854\.js\?v=max-population-1854-v1" data-problem-ids="1854"/);
  assert.match(readFrontendJavaScript(), /step\.maxPop1854View\), surface: "treeView", render: \(step\) => \{\s*renderMaxPopulation1854View\(step\)/);
  assert.match(CSS, /\.mp1854-viz \{[^}]*--mp1854-bg:/s);
  assert.match(CSS, /\[data-theme="light"\] \.mp1854-viz \{[^}]*--mp1854-bg:/s);
  assert.match(CSS, /\.mp1854-viz\) #codePanel \{[^}]*max-height: none;/s);
});
