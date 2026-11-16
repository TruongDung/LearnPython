'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript } = require('./helpers/frontend-source');

const problem = SUPPORTED[2218];
const internals = problem.__internals2218;
const RENDERER = fs.readFileSync(require.resolve('../public/renderer-max-coins-2218.js'), 'utf8');
const CSS = fs.readFileSync(require.resolve('../public/max-coins-2218.css'), 'utf8');
const BUILDERS = [[1, problem.builder], [2, problem.builder2]];
const ALL_BUILDERS = [...BUILDERS, [3, problem.builder3]];

// The user's approach 3 exactly as sent (blank lines included).
const USER_CODE_2218 = `from functools import lru_cache

class Solution:
    def maxValueOfCoins(self, piles, k):
        n = len(piles)

        @lru_cache(None)
        def dfs(i, remaining):
            if remaining == 0:
                return 0

            if i == n:
                return float('-inf')

            best = dfs(i + 1, remaining)

            total = 0

            for take in range(1, min(len(piles[i]), remaining) + 1):
                total += piles[i][take - 1]

                best = max(best,total + dfs(i + 1, remaining - take))

            return best

        return dfs(0, k)`;

function renderer(lang) {
  const host = { innerHTML: '' };
  const context = { lang, document: { getElementById: () => host } };
  vm.createContext(context);
  vm.runInContext(RENDERER, context);
  return {
    cases: vm.runInContext('LC2218_CASES', context),
    render(step, steps, index) {
      context.steps = steps;
      context.stepIndex = index;
      context.renderMaxCoins2218View(step);
      return host.innerHTML;
    },
  };
}

// Independent oracle: try every vector of take counts (one prefix per pile) whose sum is k.
function bruteForce(piles, k) {
  let best = -Infinity;
  const walk = (i, left, value) => {
    if (i === piles.length) {
      if (left === 0) best = Math.max(best, value);
      return;
    }
    let sum = 0;
    for (let t = 0; t <= Math.min(left, piles[i].length); t++) {
      if (t) sum += piles[i][t - 1];
      walk(i + 1, left - t, value + sum);
    }
  };
  walk(0, k, 0);
  return best;
}

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

// Random inputs inside the visualizer limits: 1-7 piles of 1-7 coins (1-999), k from 1 to min(8, total).
function randomInputs(count, seed = 2218) {
  const random = seeded(seed);
  const out = [];
  for (let s = 0; s < count; s++) {
    const n = 1 + Math.floor(random() * 5);
    const piles = Array.from({ length: n }, () => Array.from({ length: 1 + Math.floor(random() * 5) }, () => 1 + Math.floor(random() * (random() < 0.3 ? 999 : 60))));
    const total = piles.reduce((sum, pile) => sum + pile.length, 0);
    const k = 1 + Math.floor(random() * Math.min(8, total));
    out.push([JSON.stringify(piles), k]);
  }
  return out;
}

const EXTREMES = [
  [JSON.stringify(Array.from({ length: 7 }, (_, p) => Array.from({ length: 7 }, (_, c) => 999 - p * 7 - c))), 8],
  [JSON.stringify([[999, 999, 999, 999, 999, 999, 999]]), 7],
  [JSON.stringify([[5]]), 1],
  [JSON.stringify([[1], [2], [3], [4], [5], [6], [7]]), 7],
  [JSON.stringify([[1, 1, 1, 1, 1, 1, 999], [2, 2], [3]]), 8],
];
const EXECUTABLE = Array.from({ length: 18 }, (_, i) => i + 1).filter((line) => line !== 2);
const VAR_NAMES = { 1: ['n', 'i', 'pile', 'coin', 'prefix', 'j', 't'], 2: ['pile', 'coin', 'prefix', 'j', 't'] };
const TABLE_LINES = { 1: [7, 8, 17], 2: [6, 7, 12, 16, 17] };
const CHECK_LINE = { 1: 16, 2: 15 };
const UPDATE_LINE = { 1: 17, 2: 16 };
const vars = (step) => Object.fromEntries(step.vars.map((v) => [v.name, v.value]));
const presetInputs = (cases) => cases.map((preset) => [preset[0], preset[1]]);

test('2218 config: two real Python approaches, line-by-line, piles input plus k and approach params', () => {
  assert.equal(problem.id, 2218);
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.category.key, 'dp');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.inputKind, 'string');
  assert.equal(problem.defaultInput, internals.DEFAULT_INPUT_2218);
  assert.deepEqual(problem.code, [...internals.SOURCE_2218_A]);
  assert.deepEqual(problem.code2, [...internals.SOURCE_2218_B]);
  assert.deepEqual(problem.extraParams.map((p) => p.key), ['k', 'approach']);
  assert.equal(problem.extraParams[0].default, internals.DEFAULT_K_2218);
  assert.deepEqual(problem.extraParams[1].options.map((o) => o.value), ['1', '2', '3']);
  for (const option of problem.extraParams[1].options) assert.ok(option.label.vi && option.label.en);
  assert.deepEqual(problem.code3, [...internals.SOURCE_2218_C]);
  assert.equal(problem.code3.join('\n'), USER_CODE_2218, 'approach 3 is the user code, character for character');
  assert.equal(problem.complexity3.time, 'O(n · k · m)');
  assert.equal(problem.complexity3.space, 'O(n · k) + O(n)');
  for (const c of [problem.complexity3.note, problem.code3Label, problem.extraParams[1].options[2].label]) assert.ok(c.vi && c.en);
  assert.equal(problem.builder3([[1, 100, 3], [7, 8, 9]], { k: 2 }).answer, 101);
  assert.deepEqual(problem.liveArgs('[[1,100,3],[7,8,9]]', { k: 2 }), [[[1, 100, 3], [7, 8, 9]], 2]);
  assert.deepEqual(problem.liveArgs('1,100,3;7,8,9', { k: '2' }), [[[1, 100, 3], [7, 8, 9]], 2]);
  for (const key of ['time', 'space']) {
    assert.equal(typeof problem.complexity[key], 'string');
    assert.equal(typeof problem.complexity2[key], 'string');
  }
  for (const c of [problem.complexity.note, problem.complexity2.note, problem.statement, problem.titleVi, problem.codeLabel, problem.code2Label]) {
    assert.ok(c.vi && c.en);
  }
  assert.equal(problem.builder([[1, 100, 3], [7, 8, 9]], { k: 2 }).answer, 101);
  assert.equal(problem.builder2([[100], [100], [100], [100], [100], [100], [1, 1, 1, 1, 1, 1, 700]], { k: 7 }).answer, 706);
});

test('2218 both approaches equal brute force; DP changes only on its own lines; notes <= 28 chars', () => {
  const { cases } = renderer('en');
  const inputs = [...presetInputs(cases), ...randomInputs(300), ...EXTREMES];
  for (const [input, k] of inputs) {
    const piles = JSON.parse(input);
    const expected = bruteForce(piles, k);
    for (const [approach, build] of BUILDERS) {
      const run = build(input, { k });
      const at = `A${approach} ${input} k=${k}`;
      assert.equal(run.answer, expected, at);
      assert.equal(run.steps.filter((step) => step.final).length, 1, at);
      const last = run.steps.at(-1);
      assert.ok(last.final);
      assert.equal(last.codeLines[0], 18);
      assert.equal(last.maxCoins2218View.answer, expected);
      const picks = last.maxCoins2218View.picks;
      assert.equal(picks.reduce((a, b) => a + b, 0), k, at);
      assert.equal(picks.reduce((sum, t, p) => sum + piles[p].slice(0, t).reduce((a, b) => a + b, 0), 0), expected, `${at}: picks add up`);
      let previous = null;
      run.steps.forEach((step, index) => {
        const view = step.maxCoins2218View;
        const where = `${at} #${index}`;
        assert.equal(step.codeLines.length, 1);
        assert.equal(step.codeBlock, approach);
        assert.equal(view.approach, approach);
        assert.ok(step.note.vi.length <= 28, `vi note: ${step.note.vi}`);
        assert.ok(step.note.en.length <= 28, `en note: ${step.note.en}`);
        const table = JSON.stringify(view.table);
        if (previous !== null && table !== previous) assert.ok(TABLE_LINES[approach].includes(view.line), `${where}: table changed on line ${view.line}`);
        previous = table;
        assert.ok(view.choices.filter((c) => c.state === 'win').length <= 1, `${where}: one winner`);
        if (view.line === CHECK_LINE[approach]) assert.equal(view.condition, view.prev !== null, where);
        if (view.line === UPDATE_LINE[approach]) {
          assert.equal(view.total, view.prev + view.gain, where);
          assert.equal(view.best, Math.max(view.total, view.best), where);
        }
      });
    }
  }
});

test('2218 default example and every preset walk every executable line of both approaches; a short preset exists', () => {
  const { cases } = renderer('en');
  assert.equal(cases[0][0], problem.defaultInput);
  assert.equal(cases[0][1], internals.DEFAULT_K_2218);
  for (const code of [problem.code, problem.code2]) {
    assert.deepEqual(code.flatMap((text, index) => (text.trim() ? [index + 1] : [])), EXECUTABLE);
  }
  for (const [input, k] of presetInputs(cases)) {
    for (const [approach, build] of BUILDERS) {
      const run = build(input, { k });
      const seen = new Set(run.steps.map((step) => step.codeLines[0]));
      assert.deepEqual(EXECUTABLE.filter((line) => !seen.has(line)), [], `A${approach} ${input}`);
      const view = (line) => run.steps.filter((step) => step.codeLines[0] === line).map((step) => step.maxCoins2218View);
      assert.ok(view(CHECK_LINE[approach]).some((v) => v.condition === false), `A${approach} ${input}: a False branch`);
      assert.ok(view(UPDATE_LINE[approach]).some((v) => v.updated === false), `A${approach} ${input}: a kept value`);
    }
  }
  const short = JSON.parse(cases[1][0]);
  assert.ok(short.flat().length <= 6 && problem.builder(cases[1][0], { k: cases[1][1] }).steps.length <= 70);
});

test('2218 displayed Python (all three approaches) returns the builder answers', (t) => {
  const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
  const { cases } = renderer('en');
  const inputs = [...presetInputs(cases), ...randomInputs(60, 7), ...EXTREMES];
  const args = inputs.map(([input, k]) => problem.liveArgs(input, { k }));
  const script = "import json,sys\npayload=json.load(sys.stdin)\nout=[]\nfor code in payload['codes']:\n    ns={}\n    exec(code, ns)\n    out.append([ns['Solution']().maxValueOfCoins(*a) for a in payload['cases']])\nprint(json.dumps(out))";
  const result = spawnSync(python, ['-c', script], {
    input: JSON.stringify({ codes: [problem.code.join('\n'), problem.code2.join('\n'), problem.code3.join('\n')], cases: args }),
    encoding: 'utf8',
    timeout: 60000,
  });
  if (result.error) {
    t.skip(`no python to run: ${result.error.message}`);
    return;
  }
  assert.equal(result.status, 0, result.stderr);
  const expected = inputs.map(([input, k]) => problem.builder(input, { k }).answer);
  assert.deepEqual(JSON.parse(result.stdout), [expected, expected, expected]);
  assert.deepEqual(inputs.map(([input, k]) => problem.builder3(input, { k }).answer), expected, 'approach 3 builder');
});

test('2218 renders every frame in both languages with the executed line and one picture per state', () => {
  for (const lang of ['vi', 'en']) {
    const ui = renderer(lang);
    for (const [input, k] of presetInputs(ui.cases)) {
      for (const [approach, build] of BUILDERS) {
        const { steps } = build(input, { k });
        const saved = JSON.stringify(steps);
        steps.forEach((step, index) => {
          const html = ui.render(step, steps, index);
          const view = step.maxCoins2218View;
          const line = step.codeLines[0];
          const at = `${lang} A${approach} ${input} #${index}`;
          assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object/, at);
          assert.ok(html.includes(`data-source-line="${line}"`), at);
          assert.ok(html.includes(`data-approach="${approach}"`), at);
          assert.ok(html.includes(`<div class="lc2218-now" data-code-line="${line}" aria-current="step"><span class="lc2218-lineno">L${line}</span>`), at);
          assert.equal((html.match(/data-code-line=/g) || []).length, 1);
          assert.doesNotMatch(html, /def maxValueOfCoins|for coin in pile/, 'source is shown only in the shared #codePanel');
          assert.equal((html.match(/<rect class="lc2218-coin/g) || []).length, view.piles.flat().length, at);
          const cells = view.table ? view.table.length * (view.k + 1) : 0;
          assert.equal((html.match(/data-cell="/g) || []).length, cells, at);
          assert.equal((html.match(/data-lc2218-case="/g) || []).length, ui.cases.length);
          assert.equal(/class="lc2218-branch/.test(html), view.event === 'check', `${at}: badge`);
          if (view.event === 'check') assert.ok(html.includes(`lc2218-branch is-${view.condition}">${view.condition ? 'True' : 'False'}`), at);
          const comparing = ['for-t', 'check', 'update'].includes(view.event);
          assert.equal(/class="lc2218-cut"/.test(html), comparing, `${at}: cut line only while trying t`);
          if (comparing) {
            assert.equal((html.match(/<rect class="lc2218-coin is-take"/g) || []).length, view.t, `${at}: top t coins taken`);
            assert.ok(html.includes(`data-cut="${view.t}"`), at);
            assert.ok(html.includes('is-src') && html.includes('is-dst'), `${at}: source and target cells`);
          }
          if (step.final) {
            assert.equal((html.match(/<rect class="lc2218-coin is-chosen"/g) || []).length, view.k, `${at}: chosen coins`);
            assert.ok(html.includes('is-answer'), at);
            if (approach === 1) assert.equal((html.match(/class="lc2218-arrow is-path"/g) || []).length, view.n, at);
          }
          const winners = (html.match(/class="lc2218-choice-mark is-win/g) || []).length;
          assert.ok(winners <= 1, at);
        });
        assert.equal(JSON.stringify(steps), saved, 'rendering does not mutate steps');
      }
    }
  }
});

// Approximate boxes from the SVG attributes. Monospace glyphs are ~0.6em wide.
function svgBoxes(html) {
  const svg = html.match(/<svg class="lc2218-svg" width="([\d.]+)" height="([\d.]+)"/);
  const attr = (tag, name) => Number((tag.match(new RegExp(` ${name}="([\\d.-]+)"`)) || [])[1]);
  const rects = [...html.matchAll(/<rect class="(lc2218-[\w-]+)([^"]*)"[^>]*>/g)]
    .filter((m) => m[1] !== 'lc2218-col')
    .map((m) => ({ kind: m[1], name: `${m[1]}${m[2]}@${attr(m[0], 'x')},${attr(m[0], 'y')}`, x: attr(m[0], 'x'), y: attr(m[0], 'y'), w: attr(m[0], 'width'), h: attr(m[0], 'height') }));
  const size = { 'lc2218-eq': 12 };
  const texts = [...html.matchAll(/<text class="(lc2218-[\w-]+)[^"]*" x="([\d.]+)" y="([\d.]+)">(.*?)<\/text>/g)].map((m) => {
    const [, kind, tx, ty, inner] = m;
    const label = inner.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/g, 'x');
    const px = size[kind] || 11;
    const w = [...label].length * px * 0.6;
    const start = ['lc2218-caption', 'lc2218-ch-head', 'lc2218-choice-label', 'lc2218-eq'].includes(kind);
    return { kind, name: `${kind}:${label}@${tx},${ty}`, x: start ? +tx : +tx - w / 2, y: +ty - px * 0.9, w, h: px * 1.1, cx: +tx, cy: +ty - px * 0.35 };
  });
  return { width: Number(svg[1]), height: Number(svg[2]), rects, texts };
}

const hit = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;
const inside = (a, b) => a.x >= b.x && a.x + a.w <= b.x + b.w && a.y >= b.y - 0.5 && a.y + a.h <= b.y + b.h + 0.5;
const OWNED = { 'lc2218-coin-label': 'lc2218-coin', 'lc2218-cell-label': 'lc2218-cell', 'lc2218-choice-label': 'lc2218-choice', 'lc2218-choice-mark': 'lc2218-choice', 'lc2218-chip-label': 'lc2218-chip' };

test('2218 picture: labels sit inside their coins, cells, rows and stack chips; nothing overlaps; everything stays inside the viewBox', () => {
  const ui = renderer('vi');
  const inputs = [...presetInputs(ui.cases), ...randomInputs(40, 99), ...EXTREMES];
  for (const [input, k] of inputs) {
    for (const [approach, build] of ALL_BUILDERS) {
      const { steps } = build(input, { k });
      steps.forEach((step, index) => {
        const { width, height, rects, texts } = svgBoxes(ui.render(step, steps, index));
        const at = `A${approach} ${input} k=${k} #${index}`;
        for (const b of [...rects, ...texts]) {
          assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.w <= width && b.y + b.h <= height, `${at}: ${b.name} clipped`);
        }
        texts.forEach((t, a) => {
          const ownerKind = OWNED[t.kind];
          const mine = ownerKind ? rects.find((r) => r.kind === ownerKind && t.cx > r.x && t.cx < r.x + r.w && t.cy > r.y && t.cy < r.y + r.h) : null;
          if (ownerKind) assert.ok(mine && inside(t, mine), `${at}: ${t.name} outside its shape`);
          for (let b = a + 1; b < texts.length; b++) assert.ok(!hit(t, texts[b], -0.5), `${at}: ${t.name} overlaps ${texts[b].name}`);
          for (const r of rects) if (r !== mine) assert.ok(!hit(t, r, -0.5), `${at}: ${t.name} overlaps ${r.name}`);
        });
        for (let a = 0; a < rects.length; a++) {
          for (let b = a + 1; b < rects.length; b++) assert.ok(!hit(rects[a], rects[b], -0.5), `${at}: ${rects[a].name} overlaps ${rects[b].name}`);
        }
        assert.ok(width <= 520, `${at}: svg ${width} wide`);
      });
    }
  }
});

test('2218 picture: no empty table row; the equation sits right under the last drawn row', () => {
  const ui = renderer('vi');
  for (const [input, k] of [...presetInputs(ui.cases), ...EXTREMES]) {
    for (const [approach, build] of BUILDERS) {
      const { steps } = build(input, { k });
      const seen = new Set();
      steps.forEach((step, index) => {
        const html = ui.render(step, steps, index);
        const { height, rects } = svgBoxes(html);
        const cells = rects.filter((r) => r.kind === 'lc2218-cell');
        if (!cells.length) return;
        const at = `A${approach} ${input} k=${k} #${index}`;
        const bottom = Math.max(...cells.map((r) => r.y + r.h));
        assert.equal(height - bottom, 32, `${at}: ${height - bottom}px under the table`);
        const view = step.maxCoins2218View;
        if (view.event === 'commit' || step.final) seen.add(view.event === 'commit' ? 'commit' : 'final');
        assert.doesNotMatch(html, /<text class="lc2218-foot/, `${at}: SVG pile footer has its own class`);
      });
      if (approach === 2) assert.deepEqual([...seen].sort(), ['commit', 'final'], `A2 ${input}: covers dp = new_dp and the final step`);
    }
  }
});

test('2218 picture colors differ from the status colors and each other in both themes; −∞ is dashed', () => {
  const hex = (block, name) => (block.match(new RegExp(`--lc2218-${name}: (#[0-9a-f]{6});`, 'i')) || [])[1];
  const rgb = (value) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
  const distance = (a, b) => Math.hypot(...rgb(a).map((v, i) => v - rgb(b)[i]));
  const dark = CSS.match(/^\.lc2218-viz \{[^}]*\}/m)[0];
  const light = CSS.match(/\[data-theme="light"\] \.lc2218-viz \{[^}]*\}/)[0];
  for (const block of [dark, light]) {
    const picture = ['coin', 'take', 'src', 'dst', 'neg', 'memo'];
    for (const name of picture) {
      for (const status of ['green', 'red', 'amber']) assert.ok(distance(hex(block, name), hex(block, status)) > 60, `${name} vs ${status}`);
    }
    for (let a = 0; a < picture.length; a++) {
      for (let b = a + 1; b < picture.length; b++) assert.ok(distance(hex(block, picture[a]), hex(block, picture[b])) > 60, `${picture[a]} vs ${picture[b]}`);
    }
    for (const fill of ['coin', 'take']) assert.ok(distance(hex(block, 'on-coin'), hex(block, fill)) > 150, `on-coin vs ${fill}`);
  }
  assert.match(CSS, /\.lc2218-cell\.is-neg \{[^}]*stroke-dasharray/s);
  assert.match(CSS, /\.lc2218-cut \{[^}]*stroke-dasharray/s);
});

test('2218 aria-labels follow the page language', () => {
  const vi = renderer('vi');
  const en = renderer('en');
  for (const [, build] of BUILDERS) {
    const { steps } = build(problem.defaultInput, { k: 3 });
    const last = steps.length - 1;
    assert.ok(vi.render(steps[last], steps, last).includes('role="img" aria-label="Đáp án: 121"'));
    assert.ok(en.render(steps[last], steps, last).includes('role="img" aria-label="Answer: 121"'));
    assert.ok(vi.render(steps[last], steps, last).includes('aria-label="LeetCode 2218 · dòng 18"'));
    assert.ok(en.render(steps[last], steps, last).includes('aria-label="LeetCode 2218 · line 18"'));
    assert.ok(vi.render(steps[0], steps, 0).includes('role="img" aria-label="3 chồng, lấy đúng 3 xu"'));
    assert.ok(en.render(steps[0], steps, 0).includes('role="img" aria-label="3 piles, take exactly 3 coins"'));
    assert.ok(vi.render(steps[0], steps, 0).includes('aria-label="LeetCode 2218 · dòng 1"'));
    assert.ok(en.render(steps[0], steps, 0).includes('aria-label="LeetCode 2218 · line 1"'));
  }
});

test('2218 shows locals once, in the shared Variables panel, with Python scoping', () => {
  const ui = renderer('en');
  for (const [input, k] of presetInputs(ui.cases)) {
    for (const [approach, build] of BUILDERS) {
      const { steps } = build(input, { k });
      let last = Object.fromEntries(VAR_NAMES[approach].map((name) => [name, '—']));
      steps.forEach((step, index) => {
        const v = vars(step);
        const at = `A${approach} ${input} #${index}`;
        assert.deepEqual(step.vars.map((item) => item.name), VAR_NAMES[approach], at);
        // A local keeps its value until a line assigns it again (loop variables leak in Python).
        for (const name of VAR_NAMES[approach]) {
          if (v[name] !== last[name]) assert.notEqual(v[name], '—', `${at}: ${name} reset`);
        }
        if (approach === 1 && step.codeLines[0] >= 5) assert.notEqual(v.n, '—', at);
        if (step.codeLines[0] === 15 && approach === 1) assert.equal(v.t, step.maxCoins2218View.t);
        if (step.codeLines[0] === 14 && approach === 2) assert.equal(v.t, step.maxCoins2218View.t);
        last = v;
        assert.doesNotMatch(ui.render(step, steps, index), /lc2218-locals|prefix:/);
      });
    }
  }
});

// Independent full DP table: rows[i][j] = best from exactly j coins of the first i piles (null = −∞).
function dpRows(piles, k) {
  const rows = [[0, ...Array(k).fill(null)]];
  piles.forEach((pile, p) => {
    const prefix = [0];
    for (const coin of pile) prefix.push(prefix.at(-1) + coin);
    rows.push(Array.from({ length: k + 1 }, (_, j) => {
      let best = null;
      for (let t = 0; t <= Math.min(j, pile.length); t++) {
        const prev = rows[p][j - t];
        if (prev !== null && (best === null || prev + prefix[t] > best)) best = prev + prefix[t];
      }
      return best;
    }));
  });
  return rows;
}

const FX_GENERAL = { 1: 'dp[i][j] = max(dp[i][j], dp[i-1][j-t] + prefix[t])', 2: 'new_dp[j] = max(new_dp[j], dp[j-t] + prefix[t])' };
const fxText = (html) => html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ');

test('2218 DP formula: general recurrence always shown; this step filled in with the real dp and prefix values', () => {
  const inputs = [[problem.defaultInput, internals.DEFAULT_K_2218], ...randomInputs(60, 4242), ...EXTREMES];
  for (const lang of ['vi', 'en']) {
    const ui = renderer(lang);
    for (const [input, k] of inputs) {
      const piles = JSON.parse(input);
      const rows = dpRows(piles, k);
      const prefixes = piles.map((pile) => pile.reduce((acc, coin) => [...acc, acc.at(-1) + coin], [0]));
      const g = (v) => (v === null ? '−∞' : String(v));
      const d = (v) => (v === null ? '-inf' : String(v));
      for (const [approach, build] of BUILDERS) {
        const { steps } = build(input, { k });
        const running = new Map();
        let updates = 0;
        steps.forEach((step, index) => {
          const view = step.maxCoins2218View;
          const html = ui.render(step, steps, index);
          const at = `${lang} A${approach} ${input} k=${k} #${index} ${view.event}`;
          const block = html.match(/<div class="lc2218-formula"[\s\S]*?<\/div><div class="lc2218-legend"/);
          assert.ok(block, `${at}: formula block`);
          const text = fxText(block[0]);
          assert.ok(text.includes(FX_GENERAL[approach]), `${at}: general formula`);
          assert.ok(text.includes(approach === 1 ? 'dp[0][0] = 0' : 'dp[0] = 0'), `${at}: base case`);
          assert.ok(text.includes(approach === 1 ? '= dp[n][k]' : '= dp[k]'), `${at}: answer`);
          assert.match(block[0], /^<div class="lc2218-formula" role="group" aria-label="(Công thức DP|DP formula): /);
          const now = html.match(/<div class="lc2218-fx-now"([^>]*)>([\s\S]*?)<\/div><\/div><div class="lc2218-legend"/);
          const attrs = now ? Object.fromEntries([...now[1].matchAll(/ data-([a-z]+)="([^"]*)"/g)].map((m) => [m[1], m[2]])) : {};
          const nowText = now ? fxText(now[2]) : '';
          if (!['for-t', 'check', 'update'].includes(view.event)) {
            if (step.final) {
              assert.equal(attrs.result, String(rows[piles.length][k]), at);
              assert.ok(nowText.includes(`${approach === 1 ? `dp[${piles.length}][${k}]` : `dp[${k}]`} = ${rows[piles.length][k]}`), at);
            }
            if (approach === 2 && view.event === 'for-j') {
              const [, j] = view.dst;
              assert.equal(attrs.prev, d(rows[view.pileIndex][j]), at);
              running.set(`${view.pileIndex},${j}`, rows[view.pileIndex][j]);
            }
            return;
          }
          const p = view.pileIndex;
          const i = p + 1;
          const j = view.dst[1];
          const t = view.t;
          const key = `${p},${j}`;
          if (!running.has(key)) running.set(key, null);
          const old = running.get(key);
          const prev = rows[p][j - t];
          const gain = prefixes[p][t];
          const dst = approach === 1 ? `dp[${i}][${j}]` : `new_dp[${j}]`;
          const src = approach === 1 ? `dp[${i - 1}][${j - t}]` : `dp[${j - t}]`;
          assert.equal(attrs.dst, dst, at);
          assert.equal(attrs.src, src, at);
          assert.equal(attrs.old, d(old), at);
          assert.equal(attrs.prev, d(prev), at);
          assert.equal(attrs.gain, String(gain), at);
          assert.ok(nowText.includes(`${dst} = max(${g(old)}, ${src} + prefix[${t}])`), `${at}: ${nowText}`);
          if (prev === null) {
            if (view.event === 'check') assert.ok(nowText.includes(`${src} = −∞ →`) && /fx-bad/.test(now[2]), `${at}: skipped`);
            assert.equal(attrs.total, undefined, at);
            return;
          }
          if (view.event === 'for-t') return;
          assert.equal(attrs.total, String(prev + gain), at);
          assert.ok(nowText.includes(`= max(${g(old)}, ${prev} + ${gain})`), `${at}: ${nowText}`);
          if (view.event !== 'update') return;
          const result = old === null || prev + gain > old ? prev + gain : old;
          running.set(key, result);
          updates++;
          assert.equal(attrs.result, String(result), at);
          assert.ok(nowText.includes(`= ${result}`), `${at}: ${nowText}`);
          const winners = [...now[2].matchAll(/class="(fx-[a-z]+) fx-win">([^<]*)</g)].map((m) => [m[1], m[2]]);
          const won = old === null || prev + gain > old;
          assert.deepEqual(winners, won ? [['fx-src', String(prev)], ['fx-take', String(gain)]] : [['fx-dst', String(old)]], `${at}: winner`);
        });
        assert.ok(updates > 0, `A${approach} ${input}: has update steps`);
        piles.forEach((_, p) => {
          for (let j = approach === 1 ? 0 : 1; j <= k; j++) assert.equal(running.get(`${p},${j}`), rows[p + 1][j], `A${approach} ${input}: cell ${p + 1},${j}`);
        });
      }
    }
  }
});

test('2218 rejects inputs outside the visualizer limits', () => {
  const bad = [
    ['x', 1],
    ['[]', 1],
    ['[[1],[]]', 1],
    ['[[0]]', 1],
    ['[[1000]]', 1],
    ['[[1.5]]', 1],
    ['[[1,2', 1],
    [JSON.stringify(Array.from({ length: 8 }, () => [1])), 1],
    [JSON.stringify([[1, 2, 3, 4, 5, 6, 7, 8]]), 1],
    ['[[1,2]]', 0],
    ['[[1,2]]', 3],
    ['[[1,2],[3,4],[5,6],[7,8],[9,9]]', 9],
    ['[[1,2]]', 1.5],
    ['[[1,2]]', 'a'],
    ['1,,2', 1],
  ];
  for (const [input, k] of bad) {
    for (const [, build] of ALL_BUILDERS) assert.throws(() => build(input, { k }), /2218/, JSON.stringify([input, k]));
  }
  assert.equal(problem.builder('', {}).answer, 121);
  assert.equal(problem.builder2('5,4,3', { k: 2 }).answer, 9);
});

test('2218 assets are dedicated files, registered once; the shared requested-visualizations files no longer carry 2218', () => {
  const index = readFrontendIndex();
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  assert.match(index, /max-coins-2218\.css\?v=max-coins-2218-v3" data-problem-ids="2218"/);
  assert.match(index, /renderer-max-coins-2218\.js\?v=max-coins-2218-v3" data-problem-ids="2218"/);
  assert.match(index, /&lc2218=formula-v2/);
  assert.match(readFrontendJavaScript(), /step\.maxCoins2218View\), surface: "treeView", render: \(step\) => \{\s*renderMaxCoins2218View\(step\)/);
  assert.doesNotMatch(script, /coins2218View|renderCoins2218View/);
  const shared = fs.readFileSync(require.resolve('../public/renderer-requested-visualizations.js'), 'utf8');
  const sharedCss = fs.readFileSync(require.resolve('../public/requested-visualizations.css'), 'utf8');
  assert.doesNotMatch(shared, /2218/);
  assert.doesNotMatch(sharedCss, /2218/);
  assert.match(CSS, /\.lc2218-viz \{[^}]*--lc2218-bg:/s);
  assert.match(CSS, /\[data-theme="light"\] \.lc2218-viz \{[^}]*--lc2218-bg:/s);
  assert.match(CSS, /\.lc2218-viz\) #codePanel \{[^}]*max-height: none;/s);
  assert.match(CSS, /\.lc2218-viz\) #codePanel \.code-line \{[^}]*white-space: pre-wrap;/s);
  assert.match(CSS, /\.lc2218-viz\) #codePanel \.code-line \.txt \{[^}]*white-space: pre-wrap;[^}]*overflow-wrap: anywhere;[^}]*--lc2218-hang/s);
});

// ---------- Approach 3: the user's top-down DFS with lru_cache ----------

// Independent oracle for the user's dfs: the value of every (i, remaining) state it reaches (-Infinity = dead end).
function dfsOracle(piles, k) {
  const n = piles.length;
  const memo = new Map();
  const dfs = (i, r) => {
    const key = `${i},${r}`;
    if (memo.has(key)) return memo.get(key);
    let best;
    if (r === 0) best = 0;
    else if (i === n) best = -Infinity;
    else {
      best = dfs(i + 1, r);
      let total = 0;
      for (let t = 1; t <= Math.min(piles[i].length, r); t++) {
        total += piles[i][t - 1];
        best = Math.max(best, total + dfs(i + 1, r - t));
      }
    }
    memo.set(key, best);
    return best;
  };
  const answer = dfs(0, k);
  return { answer, value: (i, r) => memo.get(`${i},${r}`), size: memo.size };
}

const enc3 = (v) => (v === -Infinity ? '-inf' : v);
const g3 = (v) => (v === -Infinity || v === '-inf' ? '−∞' : String(v));
const A3_EXECUTABLE = [1, 3, 4, 5, 7, 8, 9, 10, 12, 13, 15, 17, 19, 20, 22, 24, 26];
const A3_VARS = ['n', 'i', 'remaining', 'best', 'total', 'take'];
const filled = (memo) => (memo ? memo.flat().filter((v) => v !== null).length : 0);

test('2218 approach 3 equals brute force and approaches 1-2; memo fills only on returns; a cached state is never entered again', () => {
  const { cases } = renderer('en');
  const inputs = [...presetInputs(cases), ...randomInputs(300), ...EXTREMES];
  for (const [input, k] of inputs) {
    const piles = JSON.parse(input);
    const n = piles.length;
    const expected = bruteForce(piles, k);
    const oracle = dfsOracle(piles, k);
    const run = problem.builder3(input, { k });
    const at = `A3 ${input} k=${k}`;
    assert.equal(oracle.answer, expected, at);
    assert.equal(run.answer, expected, at);
    assert.equal(problem.builder(input, { k }).answer, run.answer, at);
    assert.equal(problem.builder2(input, { k }).answer, run.answer, at);
    const { steps } = run;
    assert.equal(steps.filter((step) => step.final).length, 1, at);
    const last = steps.at(-1);
    assert.ok(last.final && last.codeLines[0] === 26, at);
    const picks = last.maxCoins2218View.picks;
    assert.equal(picks.reduce((a, b) => a + b, 0), k, at);
    assert.equal(picks.reduce((sum, t, p) => sum + piles[p].slice(0, t).reduce((a, b) => a + b, 0), 0), expected, `${at}: picks add up`);
    const entered = new Set();
    let hits = 0;
    let previous = null;
    steps.forEach((step, index) => {
      const view = step.maxCoins2218View;
      const where = `${at} #${index} L${view.line} ${view.event}`;
      assert.equal(step.codeLines.length, 1);
      assert.equal(step.codeBlock, 3);
      assert.equal(view.approach, 3);
      assert.ok(step.note.vi.length <= 28, `vi note: ${step.note.vi}`);
      assert.ok(step.note.en.length <= 28, `en note: ${step.note.en}`);
      if (previous !== null && filled(view.memo) !== filled(previous)) {
        assert.equal(view.event, 'ret', `${where}: memo changed off a return`);
        assert.ok([10, 13, 24].includes(view.line), where);
        assert.equal(filled(view.memo), filled(previous) + 1, where);
      }
      if (view.event === 'ret') {
        const [i, r] = view.stored;
        assert.deepEqual(view.stored, view.frame, where);
        assert.equal(view.memo[i][r], enc3(oracle.value(i, r)), where);
        assert.equal(view.value, enc3(oracle.value(i, r)), where);
        if (view.line === 13) assert.ok(i === n && r > 0 && view.value === '-inf', `${where}: dead end`);
        if (view.line === 10) assert.ok(r === 0 && view.value === 0, `${where}: base`);
      }
      previous = view.memo;
      if (view.stack.length) {
        assert.ok(view.stack.length <= n + 1, where);
        view.stack.forEach((cell, s) => { if (s) assert.equal(cell[0], view.stack[s - 1][0] + 1, `${where}: one pile deeper per frame`); });
        assert.deepEqual(view.frame, view.stack.at(-1), where);
      }
      if (view.event === 'enter') {
        const key = view.frame.join(',');
        assert.ok(!entered.has(key), `${where}: ${key} entered twice`);
        assert.equal(view.memo[view.frame[0]][view.frame[1]], null, `${where}: entered a cached state`);
        entered.add(key);
      }
      if (view.event === 'call') {
        assert.equal(view.memo[view.call[0]][view.call[1]], null, `${where}: called a cached state`);
        assert.equal(steps[index + 1].maxCoins2218View.event, 'enter', where);
        assert.deepEqual(steps[index + 1].maxCoins2218View.frame, view.call, where);
      }
      if (view.event === 'hit') {
        hits++;
        assert.ok(view.hit, where);
        assert.equal(view.memo[view.call[0]][view.call[1]], enc3(oracle.value(...view.call)), `${where}: resolved from the memo`);
        assert.equal(view.value, enc3(oracle.value(...view.call)), where);
        assert.notEqual(steps[index + 1].maxCoins2218View.event, 'enter', `${where}: no step into a cached call`);
      }
      if (view.line === 9) assert.equal(view.condition, view.frame[1] === 0, where);
      if (view.line === 12) assert.equal(view.condition, view.frame[0] === n, where);
      if (view.line === 22 && (view.event === 'back' || view.event === 'hit')) {
        const old = view.old === '-inf' ? -Infinity : view.old;
        const sub = view.value === '-inf' ? -Infinity : view.value;
        const sum = view.total + sub;
        assert.equal(view.updated, sum > old, where);
        assert.equal(view.best, enc3(Math.max(old, sum)), where);
        assert.ok(view.choices.filter((c) => c.state === 'win').length <= 1, `${where}: one winner`);
      }
    });
    assert.equal(hits, last.maxCoins2218View.hits, at);
    assert.equal(run.memoHits, hits, at);
    assert.equal(entered.size, oracle.size, `${at}: every state computed exactly once`);
  }
});

test('2218 approach 3 walks every line on the default and every preset; the default shows memo hits and dead ends', () => {
  const { cases } = renderer('en');
  assert.deepEqual(problem.code3.flatMap((text, index) => (text.trim() ? [index + 1] : [])), A3_EXECUTABLE);
  for (const [input, k] of presetInputs(cases)) {
    const { steps } = problem.builder3(input, { k });
    const seen = new Set(steps.map((step) => step.codeLines[0]));
    assert.deepEqual(A3_EXECUTABLE.filter((line) => !seen.has(line)), [], `A3 ${input}`);
    const views = steps.map((step) => step.maxCoins2218View);
    assert.ok(views.some((v) => v.event === 'hit'), `${input}: memo hit`);
    assert.ok(views.some((v) => v.line === 13), `${input}: dead end`);
    assert.ok(views.some((v) => v.line === 22 && v.updated === false), `${input}: a kept best`);
    assert.ok(views.some((v) => v.line === 22 && v.updated === true), `${input}: a new best`);
  }
  const def = problem.builder3(problem.defaultInput, { k: internals.DEFAULT_K_2218 });
  assert.equal(def.answer, 121);
  assert.equal(def.memoHits, 10);
  // Readable: about as long as approach 1 on the same input (131 steps).
  assert.ok(def.steps.length <= 140, `${def.steps.length} steps`);
});

test('2218 approach 3 renders every frame in both languages: memo grid, stack chips, memo hits and −∞ dead ends', () => {
  for (const lang of ['vi', 'en']) {
    const ui = renderer(lang);
    for (const [input, k] of [...presetInputs(ui.cases), ...EXTREMES]) {
      const { steps } = problem.builder3(input, { k });
      const saved = JSON.stringify(steps);
      steps.forEach((step, index) => {
        const html = ui.render(step, steps, index);
        const view = step.maxCoins2218View;
        const line = step.codeLines[0];
        const at = `${lang} A3 ${input} #${index} L${line} ${view.event}`;
        assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object/, at);
        assert.ok(html.includes(`data-source-line="${line}"`) && html.includes('data-approach="3"'), at);
        assert.ok(html.includes(`<div class="lc2218-now" data-code-line="${line}" aria-current="step"><span class="lc2218-lineno">L${line}</span>`), at);
        assert.doesNotMatch(html, /for take in range|return float|best = max\(best,total/, `${at}: source only in the shared #codePanel`);
        assert.equal((html.match(/<rect class="lc2218-coin/g) || []).length, view.piles.flat().length, at);
        assert.equal((html.match(/data-cell="/g) || []).length, view.memo ? (view.n + 1) * (view.k + 1) : 0, at);
        const chips = view.final ? 0 : view.stack.length + (view.event === 'call' || view.event === 'hit' ? 1 : 0);
        assert.equal((html.match(/<rect class="lc2218-chip/g) || []).length, chips, `${at}: one chip per frame`);
        assert.equal(/class="lc2218-branch/.test(html), view.line === 9 || view.line === 12, `${at}: badge`);
        const hitCells = (html.match(/<rect class="lc2218-cell[^"]* is-hit/g) || []).length;
        assert.equal(hitCells, view.event === 'hit' ? 1 : 0, `${at}: memo hit cell`);
        if (view.event === 'hit') {
          const [i, r] = view.call;
          assert.match(html, new RegExp(`<rect class="lc2218-cell[^"]* is-hit" data-cell="${i},${r}"`), at);
          assert.match(html, /<rect class="lc2218-chip is-hit"/, at);
          assert.match(html, /class="lc2218-arrow is-hit"/, at);
          assert.match(html, /class="fx-memo"/, at);
        }
        if (view.memo) {
          view.memo.forEach((row, i) => row.forEach((value, r) => {
            if (value !== '-inf') return;
            assert.match(html, new RegExp(`<rect class="lc2218-cell is-dead[^"]*" data-cell="${i},${r}"`), `${at}: −∞ cell ${i},${r}`);
          }));
          assert.equal((html.match(/class="lc2218-cell-label is-dead[^"]*"[^>]*>−∞</g) || []).length, view.memo.flat().filter((v) => v === '-inf').length, at);
        }
        if (view.line === 13 || (view.line === 12 && view.condition)) {
          assert.match(html, /<rect class="lc2218-chip is-top is-dead"/, `${at}: dead-end chip`);
          assert.match(html, /class="lc2218-ch-head is-dead"[^>]*>dfs\(\d,\d\) = −∞ ✗</, `${at}: dead-end header`);
        }
        const pileOpen = !view.final && view.frame && view.frame[0] < view.n;
        assert.equal(/class="lc2218-cut"/.test(html), Boolean(pileOpen && view.take !== null), `${at}: cut at take`);
        if (pileOpen) assert.equal((html.match(/<rect class="lc2218-coin is-take"/g) || []).length, view.taken, `${at}: coins in total`);
        if (step.final) {
          assert.equal((html.match(/<rect class="lc2218-coin is-chosen"/g) || []).length, view.k, `${at}: chosen coins`);
          assert.ok(html.includes('is-answer'), at);
          assert.equal((html.match(/class="lc2218-arrow is-path"/g) || []).length, view.path.length - 1, at);
        }
        assert.ok((html.match(/class="lc2218-choice-mark is-win/g) || []).length <= 1, at);
      });
      assert.equal(JSON.stringify(steps), saved, 'rendering does not mutate steps');
    }
  }
});

const FX_GENERAL3 = 'dfs(i, r) = max(dfs(i+1, r), prefix[t] + dfs(i+1, r−t)) t = 1…min(len(piles[i]), r)';
const fxText3 = (html) => fxText(html).replace(/&gt;/g, '>').replace(/&lt;/g, '<');

test('2218 approach 3 DP formula: recurrence and base cases always shown; this step filled in with the real dfs values', () => {
  const inputs = [[problem.defaultInput, internals.DEFAULT_K_2218], ...randomInputs(60, 4243), ...EXTREMES];
  for (const lang of ['vi', 'en']) {
    const ui = renderer(lang);
    for (const [input, k] of inputs) {
      const piles = JSON.parse(input);
      const oracle = dfsOracle(piles, k);
      const prefixes = piles.map((pile) => pile.reduce((acc, coin) => [...acc, acc.at(-1) + coin], [0]));
      // best before trying `take` = max(skip, every earlier take), exactly as the loop builds it.
      const bestBefore = (i, r, take) => {
        let best = oracle.value(i + 1, r);
        for (let t = 1; t < take; t++) best = Math.max(best, prefixes[i][t] + oracle.value(i + 1, r - t));
        return best;
      };
      const { steps } = problem.builder3(input, { k });
      let checked = 0;
      steps.forEach((step, index) => {
        const view = step.maxCoins2218View;
        const html = ui.render(step, steps, index);
        const at = `${lang} A3 ${input} k=${k} #${index} L${view.line} ${view.event}`;
        const block = html.match(/<div class="lc2218-formula"[\s\S]*?<\/div><div class="lc2218-legend"/);
        assert.ok(block, `${at}: formula block`);
        const text = fxText3(block[0]);
        assert.ok(text.includes(FX_GENERAL3), `${at}: general formula: ${text}`);
        assert.ok(text.includes('dfs(i, 0) = 0') && text.includes('dfs(n, r > 0) = −∞') && text.includes('= dfs(0, k)'), `${at}: base cases`);
        const now = html.match(/<div class="lc2218-fx-now"([^>]*)>([\s\S]*?)<\/div><\/div><div class="lc2218-legend"/);
        const attrs = now ? Object.fromEntries([...now[1].matchAll(/ data-([a-z]+)="([^"]*)"/g)].map((m) => [m[1], m[2]])) : {};
        const nowText = now ? fxText3(now[2]) : '';
        if (step.final) {
          assert.equal(attrs.result, String(oracle.answer), at);
          assert.ok(nowText.includes(`dfs(0, ${k}) = ${oracle.answer}`), at);
          return;
        }
        if (view.event === 'ret') {
          assert.equal(attrs.result, String(enc3(oracle.value(...view.frame))), at);
          assert.ok(nowText.includes(`dfs(${view.frame[0]}, ${view.frame[1]}) = ${g3(oracle.value(...view.frame))}`), `${at}: ${nowText}`);
          return;
        }
        if (view.line === 13 || (view.line === 12 && view.condition)) {
          assert.ok(nowText.includes('= −∞') && /fx-bad/.test(now[2]), `${at}: dead end`);
          return;
        }
        if ((view.event === 'back' || view.event === 'hit') && view.line === 15) {
          const [i, r] = view.frame;
          assert.equal(attrs.result, String(enc3(oracle.value(i + 1, r))), at);
          assert.ok(nowText.includes(`best = dfs(${i + 1}, ${r}) = ${g3(oracle.value(i + 1, r))}`), `${at}: ${nowText}`);
          assert.equal(/class="fx-memo"/.test(now[2]), view.event === 'hit', `${at}: memo tag`);
          checked++;
          return;
        }
        if ((view.event === 'back' || view.event === 'hit') && view.line === 22) {
          const [i, r] = view.frame;
          const t = view.take;
          const old = bestBefore(i, r, t);
          const gain = prefixes[i][t];
          const sub = oracle.value(i + 1, r - t);
          const sum = gain + sub;
          const won = sum > old;
          assert.equal(attrs.call, `dfs(${i + 1}, ${r - t})`, at);
          assert.equal(attrs.old, String(enc3(old)), at);
          assert.equal(attrs.gain, String(gain), at);
          assert.equal(attrs.sub, String(enc3(sub)), at);
          assert.equal(attrs.sum, String(enc3(sum)), at);
          assert.equal(attrs.result, String(enc3(Math.max(old, sum))), at);
          assert.ok(nowText.includes(`best = max(${g3(old)}, ${gain} + dfs(${i + 1}, ${r - t}))`), `${at}: ${nowText}`);
          assert.ok(nowText.includes(`= max(${g3(old)}, ${gain} + ${g3(sub)})`), `${at}: ${nowText}`);
          assert.ok(nowText.includes(`= ${g3(Math.max(old, sum))}`), `${at}: ${nowText}`);
          const winners = [...now[2].matchAll(/class="(fx-[a-z]+) fx-win">([^<]*)</g)].map((m) => [m[1], m[2]]);
          assert.deepEqual(winners, won ? [['fx-take', String(gain)], [sub === -Infinity ? 'fx-bad' : 'fx-src', g3(sub)]] : [['fx-dst', g3(old)]], `${at}: kept value marked`);
          assert.equal(/class="fx-memo"/.test(now[2]), view.event === 'hit', `${at}: memo tag`);
          checked++;
        }
      });
      assert.ok(checked > 0, `${input}: compared some steps`);
    }
  }
});

test('2218 approach 3 shows the current frame locals once, in the shared Variables panel', () => {
  const ui = renderer('en');
  for (const [input, k] of presetInputs(ui.cases)) {
    const { steps } = problem.builder3(input, { k });
    steps.forEach((step, index) => {
      const v = vars(step);
      const view = step.maxCoins2218View;
      const at = `A3 ${input} #${index} L${view.line}`;
      assert.deepEqual(step.vars.map((item) => item.name), A3_VARS, at);
      if (view.line >= 5) assert.equal(v.n, view.n, at);
      if (!view.frame) {
        for (const name of ['i', 'remaining', 'best', 'total', 'take']) assert.equal(v[name], '—', at);
      } else {
        assert.equal(v.i, view.frame[0], at);
        assert.equal(v.remaining, view.frame[1], at);
        assert.equal(v.best, view.best === null ? '—' : String(view.best), at);
        assert.equal(v.take, view.take === null ? '—' : view.take, at);
      }
      if (view.event === 'enter') for (const name of ['best', 'total', 'take']) assert.equal(v[name], '—', `${at}: fresh frame`);
      assert.doesNotMatch(ui.render(step, steps, index), /lc2218-locals/);
    });
  }
});

test('2218 approach 3 aria-labels follow the page language', () => {
  const vi = renderer('vi');
  const en = renderer('en');
  const { steps } = problem.builder3(problem.defaultInput, { k: 3 });
  const last = steps.length - 1;
  assert.ok(vi.render(steps[last], steps, last).includes('role="img" aria-label="Đáp án: 121"'));
  assert.ok(en.render(steps[last], steps, last).includes('role="img" aria-label="Answer: 121"'));
  assert.ok(vi.render(steps[last], steps, last).includes('aria-label="LeetCode 2218 · dòng 26"'));
  assert.ok(en.render(steps[last], steps, last).includes('aria-label="LeetCode 2218 · line 26"'));
  assert.ok(vi.render(steps[0], steps, 0).includes('aria-label="Chồng xu, memo và ngăn xếp gọi"'));
  assert.ok(en.render(steps[0], steps, 0).includes('aria-label="Coin piles, memo and call stack"'));
  assert.ok(vi.render(steps[0], steps, 0).includes('aria-label="Công thức DP: dfs(i, r)'));
  assert.ok(en.render(steps[0], steps, 0).includes('aria-label="DP formula: dfs(i, r)'));
});
