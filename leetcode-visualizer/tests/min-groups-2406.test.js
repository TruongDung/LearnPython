'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript } = require('./helpers/frontend-source');

const problem = SUPPORTED[2406];
const RENDERER = fs.readFileSync(require.resolve('../public/renderer-min-groups-2406.js'), 'utf8');
const CSS = fs.readFileSync(require.resolve('../public/min-groups-2406.css'), 'utf8');

function renderer(lang) {
  const host = { innerHTML: '' };
  const context = { lang, document: { getElementById: () => host } };
  vm.createContext(context);
  vm.runInContext(RENDERER, context);
  return {
    cases: vm.runInContext('MG2406_CASES', context),
    render(step, steps, index) {
      context.steps = steps;
      context.stepIndex = index;
      context.renderMinGroups2406View(step);
      return host.innerHTML;
    },
  };
}

// Brute force: the most intervals covering one integer point.
function maxOverlap(intervals) {
  let best = 0;
  const lo = Math.min(...intervals.map((pair) => pair[0]));
  const hi = Math.max(...intervals.map((pair) => pair[1]));
  for (let point = lo; point <= hi; point++) {
    best = Math.max(best, intervals.filter(([left, right]) => left <= point && point <= right).length);
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

// Random inputs inside the visualizer limits (n <= 10, span <= 40), some near 10^6 so notes carry long numbers.
function randomInputs(count) {
  const random = seeded(2406);
  const out = [];
  for (let k = 0; k < count; k++) {
    const n = 1 + Math.floor(random() * 10);
    const base = random() < 0.25 ? 1_000_000 - 39 : 1;
    const width = 1 + Math.floor(random() * 40);
    const intervals = Array.from({ length: n }, () => {
      const a = base + Math.floor(random() * width);
      const b = base + Math.floor(random() * width);
      return [Math.min(a, b), Math.max(a, b)];
    });
    out.push(JSON.stringify(intervals));
  }
  return out;
}

function assertValidGrouping(view, input) {
  const byGroup = new Map();
  for (const item of view.intervals) {
    assert.ok(Number.isInteger(item.group), `${input}: every interval gets a group`);
    if (!byGroup.has(item.group)) byGroup.set(item.group, []);
    byGroup.get(item.group).push(item);
  }
  assert.equal(byGroup.size, view.groups, `${input}: groups used`);
  for (const items of byGroup.values()) {
    items.sort((a, b) => a.left - b.left);
    for (let i = 1; i < items.length; i++) assert.ok(items[i - 1].right < items[i].left, `${input}: no overlap inside a group`);
  }
}

test('2406 answer equals brute-force max overlap on presets and random inputs; groups are valid', () => {
  const { cases } = renderer('en');
  for (const input of [...cases.map((preset) => preset[0]), ...randomInputs(300)]) {
    const result = problem.builder(input);
    const intervals = JSON.parse(input);
    assert.equal(result.answer, maxOverlap(intervals), input);
    const last = result.steps.at(-1);
    assert.ok(last.final);
    assert.equal(result.steps.filter((step) => step.final).length, 1);
    assert.equal(last.minGroups2406View.groups, result.answer);
    assert.equal(last.minGroups2406View.peak.count, result.answer);
    assertValidGrouping(last.minGroups2406View, input);
    result.steps.forEach((step) => {
      assert.equal(step.codeLines.length, 1);
      assert.ok(step.note.en.length <= 28, `en note: ${step.note.en}`);
      assert.ok(step.note.vi.length <= 28, `vi note: ${step.note.vi}`);
      // heap invariant: ends[i] <= children
      const ends = step.minGroups2406View.heap.map((entry) => entry.end);
      ends.forEach((end, i) => { if (i) assert.ok(ends[(i - 1) >> 1] <= end); });
    });
  }
});

test('2406 default example walks every code line and is rich (>= 8 intervals, >= 3 groups)', () => {
  const { cases } = renderer('en');
  assert.equal(cases[0][0], problem.defaultInput);
  const nonBlank = problem.code.flatMap((text, index) => (text.trim() ? [index + 1] : []));
  const result = problem.builder(problem.defaultInput);
  const lines = new Set(result.steps.map((step) => step.codeLines[0]));
  assert.deepEqual(nonBlank.filter((line) => !lines.has(line)), []);
  assert.ok(JSON.parse(problem.defaultInput).length >= 8);
  assert.ok(result.answer >= 3);
  const events = new Set(result.steps.map((step) => step.minGroups2406View.event));
  for (const event of ['push-new', 'push-reuse', 'pop']) assert.ok(events.has(event), event);
  assert.ok(result.steps.some((step) => step.minGroups2406View.event === 'check' && step.minGroups2406View.condition === false && step.minGroups2406View.heap.length), 'a non-empty heap that still overlaps');
  assert.ok(cases.some(([input]) => JSON.parse(input).length <= 5), 'a short preset');
});

test('2406 renders every frame in both languages with the executed line and one picture per state', () => {
  for (const lang of ['vi', 'en']) {
    const ui = renderer(lang);
    for (const [input] of ui.cases) {
      const { steps } = problem.builder(input);
      const saved = JSON.stringify(steps);
      steps.forEach((step, index) => {
        const html = ui.render(step, steps, index);
        const view = step.minGroups2406View;
        const line = step.codeLines[0];
        assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object/, `${lang} ${input} #${index}`);
        assert.ok(html.includes(`data-source-line="${line}"`));
        assert.ok(html.includes(`<div class="mg2406-now" data-code-line="${line}" aria-current="step"><span class="mg2406-lineno">L${line}</span>`));
        assert.equal((html.match(/data-code-line=/g) || []).length, 1);
        assert.doesNotMatch(html, /def minGroups|heapq\.heappush/, 'source is shown only in the shared #codePanel');
        for (const item of view.intervals) assert.ok(html.includes(`data-chip="${item.id}"`));
        const placed = view.intervals.filter((item) => item.group !== null).length;
        assert.equal((html.match(/data-interval="/g) || []).length, placed, 'one bar per placed interval');
        assert.equal((html.match(/data-lane="/g) || []).length, view.groups, 'one lane per group');
        assert.equal((html.match(/data-heap-index="/g) || []).length, view.heap.length, 'one slot per heap entry');
        const waiting = view.current !== null && view.intervals.find((item) => item.id === view.current).group === null;
        assert.equal(html.includes('data-current="'), waiting, 'the interval being placed waits on the top row');
        if (view.condition !== null) assert.match(html, /mg2406-branch is-(true|false)/);
        if (view.event === 'check' && view.heap.length) assert.ok(html.includes(`data-endmark="${view.heap[0].group}"`));
        if (view.event === 'pop') assert.ok(html.includes(`data-popped="${view.popped.group}"`));
        if (view.final) assert.ok(html.includes(`data-peak="${view.peak.count}"`));
      });
      assert.equal(JSON.stringify(steps), saved, 'rendering does not mutate steps');
    }
  }
});

// Approximate boxes from the SVG attributes: bars are rects; text is ~7px per glyph at 11–14px.
function svgBoxes(html) {
  const svg = html.match(/<svg class="mg2406-svg" width="(\d+(?:\.\d+)?)" height="(\d+(?:\.\d+)?)"/);
  const width = Number(svg[1]);
  const height = Number(svg[2]);
  const boxes = [];
  for (const m of html.matchAll(/<rect class="mg2406-bar[^"]*"[^>]* x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)) {
    boxes.push({ name: `bar@${m[1]},${m[2]}`, x: +m[1], y: +m[2], w: +m[3], h: +m[4] });
  }
  for (const m of html.matchAll(/<text class="(mg2406-[\w-]+)[^"]*"[^>]* x="([\d.]+)" y="([\d.]+)"[^>]*>([^<]*)<\/text>/g)) {
    const w = [...m[4]].length * (m[1] === 'mg2406-peak' ? 8.5 : 7.2);
    const h = m[1] === 'mg2406-peak' ? 14 : 12;
    const anchor = m[1] === 'mg2406-lane-label' ? 'end' : 'middle';
    const x = anchor === 'end' ? +m[2] - w : +m[2] - w / 2;
    boxes.push({ name: `${m[1]}:${m[4]}`, x, y: +m[3] - h + 2, w, h });
  }
  return { width, height, boxes };
}

test('2406 picture: bars and labels never overlap and stay inside the viewBox', () => {
  const ui = renderer('en');
  const inputs = [...ui.cases.map((preset) => preset[0]), ...randomInputs(60), '[[1,40]]', JSON.stringify(Array.from({ length: 10 }, () => [999961, 1000000]))];
  for (const input of inputs) {
    const { steps } = problem.builder(input);
    steps.forEach((step, index) => {
      const { width, height, boxes } = svgBoxes(ui.render(step, steps, index));
      for (const b of boxes) assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.w <= width && b.y + b.h <= height, `${input} #${index}: ${b.name} clipped`);
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i];
          const b = boxes[j];
          const hit = a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
          assert.ok(!hit, `${input} #${index}: ${a.name} overlaps ${b.name}`);
        }
      }
    });
  }
});

test('2406 shows locals once: in the shared Variables panel, not in the line strip', () => {
  const ui = renderer('en');
  const { steps } = problem.builder(problem.defaultInput);
  steps.forEach((step, index) => {
    assert.deepEqual(step.vars.map((v) => v.name), ['left', 'right', 'ends', 'len(ends)']);
    assert.doesNotMatch(ui.render(step, steps, index), /mg2406-locals|chip-/);
  });
});

test('2406 rejects inputs outside the visualizer limits', () => {
  for (const bad of ['', '[]', '[[2,1]]', '[[0,3]]', '[[1,2,3]]', '[[1,41]]', JSON.stringify(Array.from({ length: 11 }, () => [1, 2])), 'nope']) {
    assert.throws(() => problem.builder(bad), /2406/, bad);
  }
  assert.deepEqual(problem.liveArgs('[[1,2],[3,4]]'), [[[1, 2], [3, 4]]]);
});

test('2406 is listed under Heap and its assets are wired with light/dark tokens and no code-panel height cap', () => {
  assert.equal(problem.category.key, 'heap');
  assert.equal(problem.debugMode, 'line-by-line');
  const index = readFrontendIndex();
  assert.match(index, /min-groups-2406\.css\?v=min-groups-2406-v1" data-problem-ids="2406"/);
  assert.match(index, /renderer-min-groups-2406\.js\?v=min-groups-2406-v1" data-problem-ids="2406"/);
  assert.match(readFrontendJavaScript(), /step\.minGroups2406View\), surface: "treeView", render: \(step\) => \{\s*renderMinGroups2406View\(step\)/);
  assert.match(CSS, /\.mg2406-viz \{[^}]*--mg2406-bg:/s);
  assert.match(CSS, /\[data-theme="light"\] \.mg2406-viz \{[^}]*--mg2406-bg:/s);
  assert.match(CSS, /\.mg2406-viz\) #codePanel \{[^}]*max-height: none;/s);
});
