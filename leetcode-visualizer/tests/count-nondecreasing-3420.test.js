'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED, SEGMENT_TREE_TAG } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript } = require('./helpers/frontend-source');

const problem = SUPPORTED[3420];
const RENDERER = fs.readFileSync(require.resolve('../public/renderer-count-nondecreasing-3420.js'), 'utf8');
const CSS = fs.readFileSync(require.resolve('../public/count-nondecreasing-3420.css'), 'utf8');

function renderer(lang) {
  const host = { innerHTML: '' };
  const context = { lang, document: { getElementById: () => host } };
  vm.createContext(context);
  vm.runInContext(RENDERER, context);
  return {
    cases: vm.runInContext('ND3420_CASES', context),
    render(step, steps, index) {
      context.steps = steps;
      context.stepIndex = index;
      context.renderNonDecreasing3420View(step);
      return host.innerHTML;
    },
  };
}

// Brute force: for each l, extend r keeping the running max; the cost to raise nums[r] up to it accumulates.
function bruteForce(nums, k) {
  let count = 0;
  for (let l = 0; l < nums.length; l++) {
    let max = 0;
    let cost = 0;
    for (let r = l; r < nums.length; r++) {
      max = Math.max(max, nums[r]);
      cost += max - nums[r];
      if (cost <= k) count++;
    }
  }
  return count;
}

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

// Random inputs inside the visualizer limits (n <= 10, values 1-20), k small enough that the window shrinks often.
function randomInputs(count, seed = 3420) {
  const random = seeded(seed);
  const out = [];
  for (let t = 0; t < count; t++) {
    const n = 1 + Math.floor(random() * 10);
    const nums = Array.from({ length: n }, () => 1 + Math.floor(random() * 20));
    out.push([nums.join(','), 1 + Math.floor(random() * 40)]);
  }
  return out;
}

const EXTREMES = [
  ['20,1,1,1,1,1,1,1,1,1', 999],
  ['20', 1],
  ['1,20,1,20,1,20,1,20,1,20', 1],
  ['1,1,1,1,1,1,1,1,1,1', 1],
  ['20,19,18,17,16,15,14,13,12,11', 999],
];

const presetInputs = (cases) => cases.map((preset) => [preset[0], preset[1]]);
const vars = (step) => Object.fromEntries(step.vars.map((v) => [v.name, v.value]));
const leftEdge = (view) => (view.event === 'for-i' ? view.i + 1 : view.i === null ? view.n : view.i);

test('3420 id is a number (the active-chip highlight compares numbers) and the page keeps the Segment Tree tag', () => {
  assert.equal(typeof problem.id, 'number');
  assert.equal(problem.id, 3420);
  assert.equal(problem.category.key, 'sliding');
  assert.ok(problem.tags.includes(SEGMENT_TREE_TAG));
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.extraParams[0].key, 'k');
});

test('3420 answer equals brute force; cost equals the shaded area; deque and spans stay consistent; notes <= 28 chars', () => {
  const { cases } = renderer('en');
  const inputs = [...presetInputs(cases), ...randomInputs(300), ...EXTREMES];
  let shrinks = 0;
  for (const [input, k] of inputs) {
    const nums = input.split(',').map(Number);
    const result = problem.builder(input, { k });
    const at = `${input} k ${k}`;
    assert.equal(result.answer, bruteForce(nums, k), at);
    assert.equal(result.steps.filter((step) => step.final).length, 1);
    assert.ok(result.steps.at(-1).final);
    assert.equal(result.steps.at(-1).codeLines[0], 23);
    assert.equal(result.steps.at(-1).nonDec3420View.answer, result.answer);
    result.steps.forEach((step, index) => {
      const view = step.nonDec3420View;
      assert.equal(step.codeLines.length, 1);
      assert.ok(step.note.en.length <= 28, `en note: ${step.note.en}`);
      assert.ok(step.note.vi.length <= 28, `vi note: ${step.note.vi}`);
      const area = view.lvl.reduce((sum, top, t) => sum + (top === null ? 0 : top - nums[t]), 0);
      assert.equal(view.cost ?? 0, area, `${at} #${index}: cost is the shaded area`);
      if (!view.dq) return;
      for (let g = 1; g < view.dq.length; g++) assert.ok(view.dq[g - 1][0] < view.dq[g][0], `${at} #${index}: levels increase`);
      let start = leftEdge(view);
      for (const span of view.spans) {
        assert.equal(span.start, start, `${at} #${index}: spans are contiguous`);
        start += span.count;
      }
      if (view.j !== null && view.spans.length) assert.ok(start <= view.j + 1, `${at} #${index}: spans end by j`);
      assert.deepEqual(view.dq.map((g) => g[1]), view.spans.filter((s) => s.kind === 'group').map((s) => s.count));
      if (view.event === 'drop') shrinks++;
    });
  }
  assert.ok(shrinks > 50, 'random inputs shrink the window');
});

test('3420 default example walks every line; presets cover it; a short preset exists', () => {
  const { cases } = renderer('en');
  assert.equal(cases[0][0], problem.defaultInput.join(','));
  assert.equal(cases[0][1], problem.extraParams[0].default);
  const nonBlank = problem.code.flatMap((text, index) => (text.trim() ? [index + 1] : []));
  assert.equal(nonBlank.length, 22);
  const linesOf = (input, k) => new Set(problem.builder(input, { k }).steps.map((step) => step.codeLines[0]));
  const main = linesOf(problem.defaultInput, problem.extraParams[0].default);
  assert.deepEqual(nonBlank.filter((line) => !main.has(line)), []);
  const all = new Set(presetInputs(cases).flatMap(([input, k]) => [...linesOf(input, k)]));
  assert.deepEqual(nonBlank.filter((line) => !all.has(line)), []);
  assert.ok(cases.some(([input]) => input.split(',').length <= 3), 'a short preset');
  assert.ok(problem.defaultInput.length >= 6);
});

test('3420 displayed Python returns the builder answers', (t) => {
  const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
  const { cases } = renderer('en');
  const inputs = [...presetInputs(cases), ...randomInputs(50, 7), ...EXTREMES];
  const args = inputs.map(([input, k]) => problem.liveArgs(input, { k }));
  const script = "import json,sys\npayload=json.load(sys.stdin)\nexec(payload['code'])\nprint(json.dumps([Solution().countNonDecreasingSubarrays(*a) for a in payload['cases']]))";
  const result = spawnSync(python, ['-c', script], { input: JSON.stringify({ code: problem.code.join('\n'), cases: args }), encoding: 'utf8' });
  if (result.error) {
    t.skip(`no python to run: ${result.error.message}`);
    return;
  }
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), inputs.map(([input, k]) => problem.builder(input, { k }).answer));
});

test('3420 renders every frame in both languages with the executed line and one picture per state', () => {
  for (const lang of ['vi', 'en']) {
    const ui = renderer(lang);
    for (const [input, k] of presetInputs(ui.cases)) {
      const { steps } = problem.builder(input, { k });
      const saved = JSON.stringify(steps);
      steps.forEach((step, index) => {
        const html = ui.render(step, steps, index);
        const view = step.nonDec3420View;
        const line = step.codeLines[0];
        assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object/, `${lang} ${input} #${index}`);
        assert.ok(html.includes(`data-source-line="${line}"`));
        assert.ok(html.includes(`<div class="nd3420-now" data-code-line="${line}" aria-current="step"><span class="nd3420-lineno">L${line}</span>`));
        assert.equal((html.match(/data-code-line=/g) || []).length, 1);
        assert.doesNotMatch(html, /def countNonDecreasingSubarrays|appendleft/, 'source is shown only in the shared #codePanel');
        assert.equal((html.match(/data-bar="/g) || []).length, view.n);
        assert.equal((html.match(/data-cell="/g) || []).length, view.n);
        assert.equal((html.match(/data-fill="/g) || []).length, view.lvl.filter((top, t) => top !== null && top > view.nums[t]).length);
        assert.equal((html.match(/data-chip="/g) || []).length, view.spans.length);
        assert.equal((html.match(/class="nd3420-meter /g) || []).length, 1);
        assert.equal((html.match(/data-nd3420-case="/g) || []).length, ui.cases.length);
        assert.equal(/class="nd3420-branch/.test(html), [11, 16, 19].includes(line), `badge on line ${line}`);
        if (line === 16) assert.match(html, view.condition ? /nd3420-branch is-over is-true">True/ : /nd3420-branch is-ok is-false">False/);
        assert.equal(html.includes('class="nd3420-added"'), line === 22);
      });
      assert.equal(JSON.stringify(steps), saved, 'rendering does not mutate steps');
    }
  }
});

// Approximate boxes from the SVG attributes. Text is 11px monospace: ~0.6em per glyph.
function svgBoxes(html) {
  const svg = html.match(/<svg class="nd3420-svg" width="([\d.]+)" height="([\d.]+)"/);
  const width = Number(svg[1]);
  const height = Number(svg[2]);
  const rects = (name) => [...html.matchAll(new RegExp(`<rect class="nd3420-${name}[^"]*"[^>]* x="([\\d.]+)" y="([\\d.]+)" width="([\\d.]+)" height="([\\d.]+)"`, 'g'))]
    .map((m) => ({ name: `${name}@${m[1]},${m[2]}`, x: +m[1], y: +m[2], w: +m[3], h: +m[4] }));
  const bars = rects('bar');
  const fills = rects('fill');
  const cells = rects('cell');
  const chips = rects('chip');
  const windows = rects('window');
  const levels = [...html.matchAll(/<line class="nd3420-level[^"]*"[^>]* x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="[\d.]+"/g)]
    .map((m) => ({ name: `level@${m[1]},${m[2]}`, x: +m[1], y: +m[2] - 1.5, w: +m[3] - +m[1], h: 3 }));
  const texts = [...html.matchAll(/<text class="(nd3420-[\w-]+)[^"]*"[^>]* x="([\d.]+)" y="([\d.]+)"[^>]*>([^<]*)<\/text>/g)].map((m) => {
    const [, kind, tx, ty, label] = m;
    const w = [...label].length * 11 * 0.6;
    const x = kind === 'nd3420-row-label' ? +tx - w : +tx - w / 2;
    return { kind, name: `${kind}:${label}@${tx},${ty}`, x, y: +ty - 11, w, h: 13 };
  });
  return { width, height, bars, fills, cells, chips, windows, levels, texts };
}

const hit = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;
const inside = (a, b) => a.x >= b.x && a.x + a.w <= b.x + b.w && a.y >= b.y - 0.5 && a.y + a.h <= b.y + b.h + 2;

test('3420 picture: texts, bars, chips, levels and the bracket never overlap and stay inside the viewBox', () => {
  const ui = renderer('en');
  for (const [input, k] of [...presetInputs(ui.cases), ...randomInputs(80, 99), ...EXTREMES]) {
    const { steps } = problem.builder(input, { k });
    steps.forEach((step, index) => {
      const { width, height, bars, fills, cells, chips, windows, levels, texts } = svgBoxes(ui.render(step, steps, index));
      const at = `${input} k ${k} #${index}`;
      for (const b of [...bars, ...fills, ...cells, ...chips, ...windows, ...levels, ...texts]) {
        assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.w <= width && b.y + b.h <= height, `${at}: ${b.name} clipped`);
      }
      const values = texts.filter((t) => t.kind === 'nd3420-cell-value');
      const labels = texts.filter((t) => t.kind === 'nd3420-chip-label');
      assert.equal(values.length, cells.length);
      assert.equal(labels.length, chips.length);
      values.forEach((t, c) => assert.ok(inside(t, cells[c]), `${at}: ${t.name} outside its cell`));
      labels.forEach((t, c) => assert.ok(inside(t, chips[c]), `${at}: ${t.name} outside its chip`));
      for (let a = 0; a < texts.length; a++) {
        for (let b = a + 1; b < texts.length; b++) assert.ok(!hit(texts[a], texts[b], -0.5), `${at}: ${texts[a].name} overlaps ${texts[b].name}`);
        for (const s of [...bars, ...fills, ...levels, ...windows]) assert.ok(!hit(texts[a], s, -0.5), `${at}: ${texts[a].name} overlaps ${s.name}`);
        if (texts[a].kind !== 'nd3420-chip-label') for (const s of chips) assert.ok(!hit(texts[a], s, -0.5), `${at}: ${texts[a].name} overlaps ${s.name}`);
        if (texts[a].kind !== 'nd3420-cell-value') for (const s of cells) assert.ok(!hit(texts[a], s, -0.5), `${at}: ${texts[a].name} overlaps ${s.name}`);
      }
      for (let a = 0; a < chips.length; a++) {
        for (let b = a + 1; b < chips.length; b++) assert.ok(!hit(chips[a], chips[b], -0.5), `${at}: chips overlap`);
      }
      for (let a = 0; a < bars.length; a++) {
        for (let b = a + 1; b < bars.length; b++) assert.ok(!hit(bars[a], bars[b], -0.5), `${at}: bars overlap`);
      }
      assert.ok(width <= 500, `${at}: svg ${width} wide`);
    });
  }
});

test('3420 picture colors differ from the status colors and each other in both themes; popped is dashed', () => {
  const hex = (block, name) => (block.match(new RegExp(`--nd3420-${name}: (#[0-9a-f]{6});`, 'i')) || [])[1];
  const rgb = (value) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
  const distance = (a, b) => Math.hypot(...rgb(a).map((v, i) => v - rgb(b)[i]));
  const dark = CSS.match(/^\.nd3420-viz \{[^}]*\}/m)[0];
  const light = CSS.match(/\[data-theme="light"\] \.nd3420-viz \{[^}]*\}/)[0];
  for (const block of [dark, light]) {
    const picture = ['bar', 'out', 'fill', 'level', 'cur', 'j'];
    for (const name of picture) {
      for (const status of ['green', 'red', 'amber']) {
        assert.ok(distance(hex(block, name), hex(block, status)) > 60, `${name} vs ${status}`);
      }
    }
    for (let a = 0; a < picture.length; a++) {
      for (let b = a + 1; b < picture.length; b++) {
        if (picture[a] === 'bar' && picture[b] === 'out') continue; // the same bar, in and out of the window
        assert.ok(distance(hex(block, picture[a]), hex(block, picture[b])) > 60, `${picture[a]} vs ${picture[b]}`);
      }
    }
    for (const fill of ['level', 'cur']) assert.ok(distance(hex(block, 'on-bar'), hex(block, fill)) > 150, `on-bar vs ${fill}`);
  }
  assert.match(CSS, /\.nd3420-level\.is-popped \{[^}]*stroke-dasharray/s);
  assert.match(CSS, /\.nd3420-chip\.is-popped,[^{]*\{[^}]*stroke-dasharray/s);
});

test('3420 aria-labels follow the page language', () => {
  const { steps } = problem.builder(problem.defaultInput, { k: 5 });
  const last = steps.length - 1;
  const vi = renderer('vi');
  const en = renderer('en');
  assert.ok(vi.render(steps[last], steps, last).includes('role="img" aria-label="Kết quả 21"'));
  assert.ok(en.render(steps[last], steps, last).includes('role="img" aria-label="Answer 21"'));
  assert.ok(vi.render(steps[last], steps, last).includes('aria-label="LeetCode 3420 · dòng 23"'));
  assert.ok(en.render(steps[last], steps, last).includes('aria-label="LeetCode 3420 · line 23"'));
  assert.ok(vi.render(steps[0], steps, 0).includes('role="img" aria-label="8 số, k = 5"'));
  assert.ok(en.render(steps[0], steps, 0).includes('role="img" aria-label="8 nums, k = 5"'));
  assert.ok(vi.render(steps[0], steps, 0).includes('aria-label="LeetCode 3420 · dòng 1"'));
  assert.ok(en.render(steps[0], steps, 0).includes('aria-label="LeetCode 3420 · line 1"'));
});

test('3420 shows locals once: in the shared Variables panel, not in the view', () => {
  const ui = renderer('en');
  const { steps } = problem.builder(problem.defaultInput, { k: 5 });
  steps.forEach((step, index) => {
    assert.deepEqual(step.vars.map((v) => v.name), ['k', 'i', 'j', 'cnt', 'level', 'c', 'cost', 'dq', 'ans']);
    assert.doesNotMatch(ui.render(step, steps, index), /nd3420-locals|cost:|cnt:/);
  });
});

test('3420 level and c keep their last popped values, as Python does', () => {
  const { steps } = problem.builder('3,1,2', { k: 1 });
  const first = steps.findIndex((step) => step.nonDec3420View.event === 'pop');
  assert.ok(first > 0);
  steps.slice(0, first).forEach((step) => assert.deepEqual([vars(step).level, vars(step).c], ['—', '—']));
  let expected = null;
  steps.slice(first).forEach((step) => {
    if (step.nonDec3420View.event === 'pop') expected = [vars(step).level, vars(step).c];
    assert.deepEqual([vars(step).level, vars(step).c], expected);
  });
  assert.deepEqual(expected, [2, 1], 'the last popleft took [2, 1]');
  assert.equal(vars(steps.at(-1)).i, 0, 'i keeps its last value after the loop');
});

test('3420 rejects inputs outside the visualizer limits', () => {
  const bad = ['', [], 'x', [0], [21], [1.5], Array.from({ length: 11 }, () => 1), '1,,2', '[1,2'];
  for (const input of bad) assert.throws(() => problem.builder(input, { k: 3 }), /3420/, JSON.stringify(input));
  for (const k of [0, 1000, 2.5, 'x']) assert.throws(() => problem.builder([1, 2], { k }), /3420/, String(k));
  assert.doesNotThrow(() => problem.builder('[20,1,1]', { k: 999 }));
  assert.deepEqual(problem.liveArgs('3,1,2', { k: 1 }), [[3, 1, 2], 1]);
});

test('3420 budget meter pins an off-scale k and keeps the fill visible', () => {
  const ui = renderer('en');
  for (const [k, pinned] of [[999, true], [1, false], [5, false]]) {
    const { steps } = problem.builder('3,1,2', { k });
    const index = steps.findIndex((step) => step.nonDec3420View.cost > 0);
    const html = ui.render(steps[index], steps, index);
    assert.equal(/nd3420-k-tick is-off-scale/.test(html), pinned, `k ${k}`);
    assert.equal(html.includes(`/ k →${k}</span>`), pinned);
    const fill = Number(html.match(/nd3420-meter-fill" style="width: ([\d.]+)%/)[1]);
    assert.ok(fill >= 20, `k ${k}: fill ${fill}% visible`);
  }
});

test('3420 assets are wired with light/dark tokens and no code-panel height cap', () => {
  const index = readFrontendIndex();
  assert.match(index, /count-nondecreasing-3420\.css\?v=count-nondecreasing-3420-v1" data-problem-ids="3420"/);
  assert.match(index, /renderer-count-nondecreasing-3420\.js\?v=count-nondecreasing-3420-v1" data-problem-ids="3420"/);
  assert.match(readFrontendJavaScript(), /step\.nonDec3420View\), surface: "treeView", render: \(step\) => \{\s*renderNonDecreasing3420View\(step\)/);
  assert.match(CSS, /\.nd3420-viz \{[^}]*--nd3420-bg:/s);
  assert.match(CSS, /\[data-theme="light"\] \.nd3420-viz \{[^}]*--nd3420-bg:/s);
  assert.match(CSS, /\.nd3420-viz\) #codePanel \{[^}]*max-height: none;/s);
  assert.match(CSS, /\.nd3420-viz\) #codePanel \.code-line \{[^}]*white-space: pre-wrap;/s);
  assert.match(CSS, /\.nd3420-viz\) #codePanel \.code-line \.txt \{[^}]*white-space: pre-wrap;[^}]*overflow-wrap: anywhere;/s);
});
