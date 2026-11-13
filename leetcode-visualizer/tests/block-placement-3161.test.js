'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript } = require('./helpers/frontend-source');

const problem = SUPPORTED[3161];
const internals = problem.__internals3161;
const RENDERER = fs.readFileSync(require.resolve('../public/renderer-block-placement-3161.js'), 'utf8');
const CSS = fs.readFileSync(require.resolve('../public/block-placement-3161.css'), 'utf8');

function renderer(lang) {
  const host = { innerHTML: '' };
  const context = { lang, document: { getElementById: () => host } };
  vm.createContext(context);
  vm.runInContext(RENDERER, context);
  return {
    cases: vm.runInContext('BP3161_CASES', context),
    render(step, steps, index) {
      context.steps = steps;
      context.stepIndex = index;
      context.renderBlockPlacement3161View(step);
      return host.innerHTML;
    },
  };
}

const parse = (text) => text.split(';').map((row) => row.split(',').map(Number));

// Brute force: for each type-2 query, the obstacles placed so far below x plus 0 and x; any gap >= sz fits.
function bruteForce(queries) {
  const placed = [];
  const out = [];
  for (const q of queries) {
    if (q[0] === 1) {
      placed.push(q[1]);
      continue;
    }
    const points = [0, ...placed.filter((p) => p < q[1]).sort((a, b) => a - b), q[1]];
    out.push(points.slice(1).some((p, t) => p - points[t] >= q[2]));
  }
  return out;
}

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

// Random inputs inside the visualizer limits: 1-8 queries, x and sz 1-15, distinct type-1 x.
function randomInputs(count, seed = 3161) {
  const random = seeded(seed);
  const draw = () => 1 + Math.floor(random() * 15);
  const out = [];
  for (let t = 0; t < count; t++) {
    const m = 1 + Math.floor(random() * 8);
    const used = new Set();
    const rows = [];
    for (let r = 0; r < m; r++) {
      if (random() < 0.5 && used.size < 15) {
        let x = draw();
        while (used.has(x)) x = draw();
        used.add(x);
        rows.push(`1,${x}`);
      } else {
        rows.push(`2,${draw()},${1 + Math.floor(random() * (random() < 0.5 ? 5 : 15))}`);
      }
    }
    out.push(rows.join(';'));
  }
  return out;
}

const EXTREMES = ['1,1;1,2;1,3;1,4;1,5;1,6;1,7;2,15,1', '2,15,15', '1,15;2,15,15', '1,8;2,15,7;2,15,8'];
const EXECUTABLE = Array.from({ length: 40 }, (_, t) => t + 1).filter((line) => ![3, 7, 12, 19].includes(line));
const vars = (step) => Object.fromEntries(step.vars.map((v) => [v.name, v.value]));
const presets = (cases) => cases.map((preset) => preset[0]);

test('3161 id is a number, keeps its category and tags, and has one source of default queries', () => {
  assert.equal(typeof problem.id, 'number');
  assert.equal(problem.id, 3161);
  assert.equal(problem.category.key, 'binary-search');
  const keys = problem.tags.map((tag) => tag.key);
  for (const key of ['binary-search', 'segment-tree', 'sorted-set']) assert.ok(keys.includes(key), key);
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.extraParams, undefined);
  assert.equal(problem.inputKind, 'string');
  assert.equal(problem.defaultInput, internals.DEFAULT_QUERIES_3161);
  assert.deepEqual(problem.liveArgs(problem.defaultInput, {}), [parse(internals.DEFAULT_QUERIES_3161)]);
  assert.deepEqual(problem.builder(undefined, {}).answer, problem.builder(problem.defaultInput, {}).answer);
  assert.deepEqual(problem.liveArgs('[1]', { queries: '1,2;2,3,1' }), [[[1, 2], [2, 3, 1]]]);
  assert.deepEqual(problem.liveArgs('[[1,2],[2,3,1]]', {}), [[[1, 2], [2, 3, 1]]]);
});

test('3161 answer equals brute force; BIT only grows and every gap is visible to a query at its end; notes <= 28 chars', () => {
  const { cases } = renderer('en');
  const inputs = [...presets(cases), ...randomInputs(400), ...EXTREMES];
  for (const input of inputs) {
    const result = problem.builder(input);
    const queries = parse(input);
    assert.deepEqual(result.answer, bruteForce(queries), input);
    assert.equal(result.steps.filter((step) => step.final).length, 1);
    assert.ok(result.steps.at(-1).final);
    assert.equal(result.steps.at(-1).codeLines[0], 40);
    const last = result.steps.at(-1).blockPlace3161View;
    assert.deepEqual(last.answer, last.ans.slice().reverse());
    assert.deepEqual(last.answer, result.answer);
    let built = false;
    let previous = null;
    result.steps.forEach((step, index) => {
      const view = step.blockPlace3161View;
      const at = `${input} #${index}`;
      assert.equal(step.codeLines.length, 1);
      assert.ok(step.note.en.length <= 28, `en note: ${step.note.en}`);
      assert.ok(step.note.vi.length <= 28, `vi note: ${step.note.vi}`);
      if (view.obs) {
        assert.equal(view.obs[0], 0);
        assert.equal(view.obs.at(-1), view.n);
        view.obs.forEach((p, t) => t && assert.ok(p > view.obs[t - 1], `${at}: obs sorted`));
      }
      if (previous && view.bit) view.bit.forEach((value, j) => assert.ok(value >= previous[j], `${at}: t[${j}] decreased`));
      if (view.bit) previous = view.bit;
      view.path.forEach((j) => assert.ok(j >= 1 && j <= view.n, `${at}: path ${j}`));
      if (view.event === 'for-gap-done') built = true;
      if (built && !view.frame && ![35, 36].includes(view.line)) {
        for (let t = 1; t < view.obs.length; t++) {
          const [a, b] = [view.obs[t - 1], view.obs[t]];
          let best = 0;
          for (let j = b; j > 0; j -= j & -j) best = Math.max(best, view.bit[j]);
          assert.ok(best >= b - a, `${at}: gap ${a}→${b} visible`);
        }
      }
    });
  }
});

test('3161 default example walks every executable line; every preset does; a short preset exists', () => {
  const { cases } = renderer('en');
  assert.equal(cases[0][0], problem.defaultInput);
  const nonBlank = problem.code.flatMap((text, index) => (text.trim() ? [index + 1] : []));
  assert.deepEqual(nonBlank, EXECUTABLE);
  const linesOf = (input) => new Set(problem.builder(input).steps.map((step) => step.codeLines[0]));
  for (const input of presets(cases)) {
    const seen = linesOf(input);
    assert.deepEqual(EXECUTABLE.filter((line) => !seen.has(line)), [], input);
  }
  assert.ok(cases.some(([input]) => input.split(';').length <= 4), 'a short preset');
  assert.ok(problem.defaultInput.split(';').length >= 5);
});

test('3161 displayed Python returns the builder answers', (t) => {
  const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
  const { cases } = renderer('en');
  const inputs = [...presets(cases), ...randomInputs(60, 7), ...EXTREMES];
  const args = inputs.map((input) => problem.liveArgs(input, {}));
  const script = "import json,sys\npayload=json.load(sys.stdin)\nexec(payload['code'])\nprint(json.dumps([Solution().getResults(*a) for a in payload['cases']]))";
  const result = spawnSync(python, ['-c', script], { input: JSON.stringify({ code: problem.code.join('\n'), cases: args }), encoding: 'utf8' });
  if (result.error) {
    t.skip(`no python to run: ${result.error.message}`);
    return;
  }
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), inputs.map((input) => problem.builder(input).answer));
});

test('3161 renders every frame in both languages with the executed line and one picture per state', () => {
  for (const lang of ['vi', 'en']) {
    const ui = renderer(lang);
    for (const input of presets(ui.cases)) {
      const { steps } = problem.builder(input);
      const saved = JSON.stringify(steps);
      steps.forEach((step, index) => {
        const html = ui.render(step, steps, index);
        const view = step.blockPlace3161View;
        const line = step.codeLines[0];
        const at = `${lang} ${input} #${index}`;
        assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object/, at);
        assert.ok(html.includes(`data-source-line="${line}"`), at);
        assert.ok(html.includes(`<div class="bp3161-now" data-code-line="${line}" aria-current="step"><span class="bp3161-lineno">L${line}</span>`), at);
        assert.equal((html.match(/data-code-line=/g) || []).length, 1);
        assert.doesNotMatch(html, /def getResults|bisect_right\(/, 'source is shown only in the shared #codePanel');
        assert.equal((html.match(/data-post="/g) || []).length, view.obs ? view.obs.length : 0, at);
        assert.equal((html.match(/data-gap="/g) || []).length, view.obs ? view.obs.length - 1 : 0, at);
        assert.equal((html.match(/data-node="/g) || []).length, view.bit ? view.n : 0, at);
        assert.equal((html.match(/data-q="/g) || []).length, view.queries.length, at);
        assert.equal((html.match(/data-bp3161-case="/g) || []).length, ui.cases.length);
        assert.equal(/class="bp3161-branch/.test(html), [9, 15, 25, 33].includes(line), `${at}: badge on line ${line}`);
        if (view.condition !== null) assert.ok(html.includes(`bp3161-branch is-${view.condition}">${view.condition ? 'True' : 'False'}`), at);
        assert.equal(/data-block="/.test(html), view.event === 'append', `${at}: block only on append`);
        if (view.event === 'append') assert.ok(html.includes(`bp3161-block ${view.fit ? 'is-fit' : 'is-nofit'}`), at);
      });
      assert.equal(JSON.stringify(steps), saved, 'rendering does not mutate steps');
    }
  }
});

// Approximate boxes from the SVG attributes. Text is 11px monospace: ~0.6em per glyph.
function svgBoxes(html) {
  const svg = html.match(/<svg class="bp3161-svg" width="([\d.]+)" height="([\d.]+)"/);
  const rects = (name) => [...html.matchAll(new RegExp(`<rect class="bp3161-${name}[^"]*"[^>]* x="([\\d.]+)" y="([\\d.]+)" width="([\\d.]+)" height="([\\d.]+)"`, 'g'))]
    .map((m) => ({ name: `${name}@${m[1]},${m[2]}`, x: +m[1], y: +m[2], w: +m[3], h: +m[4] }));
  const texts = [...html.matchAll(/<text class="(bp3161-[\w-]+)[^"]*" x="([\d.]+)" y="([\d.]+)">([^<]*)<\/text>/g)].map((m) => {
    const [, kind, tx, ty, label] = m;
    const w = [...label].length * 11 * 0.6;
    const x = kind === 'bp3161-row-label' ? +tx - w : +tx - w / 2;
    return { kind, name: `${kind}:${label}@${tx},${ty}`, x, y: +ty - 10, w, h: 12 };
  });
  return {
    width: Number(svg[1]),
    height: Number(svg[2]),
    posts: rects('post'),
    gaps: rects('gap'),
    tails: rects('tail'),
    nodes: rects('node'),
    blocks: rects('block'),
    prefix: rects('prefix'),
    ghostAt: new Set([...html.matchAll(/<rect class="bp3161-post is-ghost[^"]*"[^>]* x="([\d.]+)" y="([\d.]+)"/g)].map((m) => `post@${m[1]},${m[2]}`)),
    texts,
  };
}

const hit = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;
const inside = (a, b) => a.x >= b.x && a.x + a.w <= b.x + b.w && a.y >= b.y - 0.5 && a.y + a.h <= b.y + b.h + 0.5;

test('3161 picture: labels sit inside their bars and nodes, nothing overlaps, everything stays inside the viewBox', () => {
  const ui = renderer('en');
  for (const input of [...presets(ui.cases), ...randomInputs(80, 99), ...EXTREMES]) {
    const { steps } = problem.builder(input);
    steps.forEach((step, index) => {
      const boxes = svgBoxes(ui.render(step, steps, index));
      const { width, height, posts, gaps, tails, nodes, blocks, prefix, texts } = boxes;
      const at = `${input} #${index}`;
      for (const b of [...posts, ...gaps, ...tails, ...nodes, ...blocks, ...prefix, ...texts]) {
        assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.w <= width && b.y + b.h <= height, `${at}: ${b.name} clipped`);
      }
      const own = { 'bp3161-gap-label': gaps, 'bp3161-node-label': nodes, 'bp3161-block-label': blocks };
      for (const [kind, shapes] of Object.entries(own)) {
        const labels = texts.filter((t) => t.kind === kind);
        assert.equal(labels.length, shapes.length, `${at}: one ${kind} per shape`);
        labels.forEach((t, c) => assert.ok(inside(t, shapes[c]), `${at}: ${t.name} outside ${shapes[c].name}`));
      }
      const tailLabels = texts.filter((t) => t.kind === 'bp3161-tail-label');
      if (tails.length) assert.ok(inside(tailLabels[0], tails[0]), `${at}: tail label`);
      for (let a = 0; a < texts.length; a++) {
        for (let b = a + 1; b < texts.length; b++) assert.ok(!hit(texts[a], texts[b], -0.5), `${at}: ${texts[a].name} overlaps ${texts[b].name}`);
        for (const s of posts) assert.ok(!hit(texts[a], s, -0.5), `${at}: ${texts[a].name} overlaps ${s.name}`);
        const mine = own[texts[a].kind] || (texts[a].kind === 'bp3161-tail-label' ? tails : []);
        for (const s of [...gaps, ...tails, ...nodes, ...blocks]) {
          if (!mine.includes(s)) assert.ok(!hit(texts[a], s, -0.5), `${at}: ${texts[a].name} overlaps ${s.name}`);
        }
      }
      const solids = [[gaps, 'gaps'], [nodes, 'nodes'], [posts, 'posts']];
      for (const [list, name] of solids) {
        for (let a = 0; a < list.length; a++) {
          for (let b = a + 1; b < list.length; b++) assert.ok(!hit(list[a], list[b], -0.5), `${at}: ${name} overlap`);
        }
      }
      // Live posts never touch a bar; ghost posts (removed obstacles) are dashed outlines drawn over the merged gap.
      const live = posts.filter((p) => !boxes.ghostAt.has(p.name));
      for (const p of live) for (const g of [...gaps, ...tails, ...nodes, ...blocks]) assert.ok(!hit(p, g, -0.5), `${at}: ${p.name} overlaps ${g.name}`);
      assert.ok(width <= 500, `${at}: svg ${width} wide`);
    });
  }
});

test('3161 picture colors differ from the status colors and each other in both themes; ghost and cut are dashed', () => {
  const hex = (block, name) => (block.match(new RegExp(`--bp3161-${name}: (#[0-9a-f]{6});`, 'i')) || [])[1];
  const rgb = (value) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
  const distance = (a, b) => Math.hypot(...rgb(a).map((v, i) => v - rgb(b)[i]));
  const dark = CSS.match(/^\.bp3161-viz \{[^}]*\}/m)[0];
  const light = CSS.match(/\[data-theme="light"\] \.bp3161-viz \{[^}]*\}/)[0];
  for (const block of [dark, light]) {
    const picture = ['post', 'gap', 'prefix', 'tail', 'node', 'path', 'block'];
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
    for (const fill of ['gap', 'node', 'path']) assert.ok(distance(hex(block, 'on-bar'), hex(block, fill)) > 150, `on-bar vs ${fill}`);
  }
  assert.match(CSS, /\.bp3161-post\.is-ghost \{[^}]*stroke-dasharray/s);
  assert.match(CSS, /\.bp3161-block\.is-cut \{[^}]*stroke-dasharray/s);
});

test('3161 aria-labels follow the page language', () => {
  const { steps } = problem.builder(problem.defaultInput);
  const last = steps.length - 1;
  const vi = renderer('vi');
  const en = renderer('en');
  assert.ok(vi.render(steps[last], steps, last).includes('role="img" aria-label="Kết quả [T, T, F]"'));
  assert.ok(en.render(steps[last], steps, last).includes('role="img" aria-label="Answer [T, T, F]"'));
  assert.ok(vi.render(steps[last], steps, last).includes('aria-label="LeetCode 3161 · dòng 40"'));
  assert.ok(en.render(steps[last], steps, last).includes('aria-label="LeetCode 3161 · line 40"'));
  assert.ok(vi.render(steps[0], steps, 0).includes('role="img" aria-label="5 truy vấn"'));
  assert.ok(en.render(steps[0], steps, 0).includes('role="img" aria-label="5 queries"'));
  assert.ok(vi.render(steps[0], steps, 0).includes('aria-label="LeetCode 3161 · dòng 1"'));
  assert.ok(en.render(steps[0], steps, 0).includes('aria-label="LeetCode 3161 · line 1"'));
  const mid = steps.findIndex((step) => step.blockPlace3161View.event === 'init-t');
  assert.ok(en.render(steps[mid], steps, mid).includes('role="img" aria-label="8 positions, 2 obstacles"'));
  assert.ok(vi.render(steps[mid], steps, mid).includes('role="img" aria-label="8 vị trí, 2 vật cản"'));
});

test('3161 shows locals once, in the shared Variables panel, with Python scoping', () => {
  const ui = renderer('en');
  const { steps } = problem.builder(problem.defaultInput);
  let lastA = '—';
  let lastB = '—';
  steps.forEach((step, index) => {
    const v = vars(step);
    const line = step.codeLines[0];
    assert.deepEqual(step.vars.map((item) => item.name), ['q', 'n', 'obs', 'k', 'a', 'b', 'bit.t', 'i', 'v', 'best', 'ans']);
    if (line < 8 || line > 11) assert.equal(v.v, '—', `v on line ${line}`);
    if (line < 13 || line > 18) assert.equal(v.best, '—', `best on line ${line}`);
    if (!(line >= 8 && line <= 11) && !(line >= 13 && line <= 18)) assert.equal(v.i, '—', `i on line ${line}`);
    if (line >= 8 && line <= 11) assert.notEqual(v.i, '—');
    if ([28, 34, 38].includes(line) && step.blockPlace3161View.event !== 'for-gap-done') {
      lastA = v.a;
      if (line !== 38) lastB = v.b;
    } else {
      assert.equal(v.a, lastA, `a keeps its value on line ${line}`);
      assert.equal(v.b, lastB, `b keeps its value on line ${line}`);
    }
    if (line === 22) assert.equal(v.q, '—', 'the generator q does not leak');
    assert.doesNotMatch(ui.render(step, steps, index), /bp3161-locals|obs:|bit\.t/);
  });
  assert.equal(vars(steps.at(-1)).ans, '[False, True, True]');
});

test('3161 rejects inputs outside the visualizer limits', () => {
  const bad = ['', 'x', '3,1', '1', '1,2,3', '2,5', '1,0', '1,16', '2,5,0', '2,5,16', '1,2;1,2', Array.from({ length: 9 }, (_, t) => `1,${t + 1}`).join(';'), '[[1,2', '1,,2', '1.5,2'];
  for (const input of bad) assert.throws(() => problem.builder(input), /3161/, JSON.stringify(input));
  assert.deepEqual(problem.builder('1,3;1,5').answer, []);
  assert.doesNotThrow(() => problem.builder('1,1;1,2;1,3;1,4;1,5;1,6;1,7;2,15,15'));
});

test('3161 assets are wired with light/dark tokens and no code-panel height cap', () => {
  const index = readFrontendIndex();
  assert.match(index, /block-placement-3161\.css\?v=block-placement-3161-v1" data-problem-ids="3161"/);
  assert.match(index, /renderer-block-placement-3161\.js\?v=block-placement-3161-v1" data-problem-ids="3161"/);
  assert.match(readFrontendJavaScript(), /step\.blockPlace3161View\), surface: "treeView", render: \(step\) => \{\s*renderBlockPlacement3161View\(step\)/);
  assert.match(CSS, /\.bp3161-viz \{[^}]*--bp3161-bg:/s);
  assert.match(CSS, /\[data-theme="light"\] \.bp3161-viz \{[^}]*--bp3161-bg:/s);
  assert.match(CSS, /\.bp3161-viz\) #codePanel \{[^}]*max-height: none;/s);
  assert.match(CSS, /\.bp3161-viz\) #codePanel \.code-line \{[^}]*white-space: pre-wrap;/s);
  assert.match(CSS, /\.bp3161-viz\) #codePanel \.code-line \.txt \{[^}]*white-space: pre-wrap;[^}]*overflow-wrap: anywhere;/s);
});
