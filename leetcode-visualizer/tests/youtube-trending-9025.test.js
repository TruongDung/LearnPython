'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript } = require('./helpers/frontend-source');

const problem = SUPPORTED[9025];
const internals = problem.__internals9025;
const RENDERER = fs.readFileSync(require.resolve('../public/renderer-youtube-trending-9025.js'), 'utf8');
const CSS = fs.readFileSync(require.resolve('../public/youtube-trending-9025.css'), 'utf8');
const APPROACHES = [1, 2, 3];
const build = (input, approach) => (approach === 3 ? problem.builder3(input) : approach === 2 ? problem.builder2(input) : problem.builder(input));
const codeOf = (approach) => (approach === 3 ? problem.code3 : approach === 2 ? problem.code2 : problem.code);

// The user's code, verbatim (approach 1 must never drift from it).
const USER_CODE = `from collections import defaultdict
import heapq

class YT:
    def __init__(self, k):
        self.k = k
        self.videos = defaultdict(int)

    def records(self, video_id):
        self.videos[video_id] += 1

        min_heap = []

        for id, score in self.videos.items():
            heapq.heappush(min_heap,(score, id))

            if len(min_heap) > self.k:
                heapq.heappop(min_heap)

        res = []
        while min_heap:
            score, id = heapq.heappop(min_heap)
            res.append(id)

        return reversed(res)`;

function renderer(lang) {
  const host = { innerHTML: '' };
  const context = { lang, document: { getElementById: () => host } };
  vm.createContext(context);
  vm.runInContext(RENDERER, context);
  return {
    cases: vm.runInContext('YT9025_CASES', context),
    render(step, steps, index) {
      context.steps = steps;
      context.stepIndex = index;
      context.renderYouTubeTrending9025View(step);
      return host.innerHTML;
    },
  };
}

// Brute force: count every interaction (warm-up first), then sort all videos by the (score, id) tuple, largest first,
// and keep k. This is the order approach 1's min-heap + reversed() produces.
function bruteForce(k, scores, calls) {
  const count = {};
  for (const [id, s] of scores) count[id] = s;
  return calls.map((id) => {
    count[id] = (count[id] || 0) + 1;
    const ids = Object.keys(count);
    ids.sort((a, b) => (count[a] !== count[b] ? count[b] - count[a] : a > b ? -1 : 1));
    return ids.slice(0, k);
  });
}

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

// Random operation sequences inside the visualizer limits: k 1-5, <= 8 videos, start scores 1-9, 1-8 calls.
// Few distinct scores, so ties are common.
function randomCases(count, seed = 9025) {
  const random = seeded(seed);
  const pool = ['1', '2', '3', '4', '5', '9', '10', 'a', 'b', 'B', 'zz', 'v7'];
  const out = [];
  for (let t = 0; t < count; t++) {
    const k = 1 + Math.floor(random() * 5);
    const ids = pool.slice().sort(() => random() - 0.5).slice(0, 1 + Math.floor(random() * 8));
    const scores = ids.filter(() => random() < 0.6).map((id) => [id, 1 + Math.floor(random() * (random() < 0.5 ? 3 : 9))]);
    const calls = Array.from({ length: 1 + Math.floor(random() * 8) }, () => ids[Math.floor(random() * ids.length)]);
    out.push({ input: `${k} | ${scores.map(([id, s]) => `${id}:${s}`).join(', ')} | ${calls.join(', ')}`, k, scores, calls });
  }
  return out;
}

const parseCase = (input) => ({ input, ...internals.parse9025(input) });
const EXTREMES = ['5 | 1:9, 2:9, 3:9, 4:9, 5:9, 6:9, 7:9, 8:9 | 8, 8, 8, 8, 8, 8, 8, 8', '1 |  | a', '5 | a:1 | a, b, c, d, e, f, g, h',
  '1 | 10:5, 9:5 | 9', '3 | x:1, y:1, z:1 | z, y, x', '2 | a:1, b:2, c:3 | a, a, a, a, b, b, b, b'];
const executable = (approach) => codeOf(approach).flatMap((text, index) => (text.trim() ? [index + 1] : []));
const BRANCH_LINES = { 1: [17, 21], 2: [12], 3: [18, 25, 27, 31] };
const VAR_NAMES = {
  1: ['video_id', 'self.k', 'self.videos', 'min_heap', 'id', 'score', 'res'],
  2: ['video_id', 'self.k', 'self.videos', 'self.ranked', 'score', 'res'],
  3: ['video_id', 'self.k', 'self.where', 'cur', 'nxt', 'node', 'id', 'res'],
};
const FRESH = { 1: ['min_heap', 'id', 'score', 'res'], 2: ['score', 'res'], 3: ['cur', 'nxt', 'node', 'id', 'res'] };
const vars = (step) => Object.fromEntries(step.vars.map((v) => [v.name, v.value]));
const presets = (cases) => cases.map((preset) => preset[0]);

test('9025 id is a number in the interview category with three approaches and one default input', () => {
  assert.equal(typeof problem.id, 'number');
  assert.equal(problem.id, 9025);
  assert.equal(problem.category.key, 'interview');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.inputKind, 'string');
  assert.equal(problem.defaultInput, internals.DEFAULT_INPUT_9025);
  assert.deepEqual(problem.extraParams.map((p) => p.key), ['approach']);
  assert.deepEqual(problem.extraParams[0].options.map((o) => o.value), [1, 2, 3]);
  assert.equal(problem.extraParams[0].default, 1);
  for (const n of ['', '2', '3']) {
    assert.ok(problem[`code${n}`] && problem[`code${n}Label`] && problem[`complexity${n}`], `code${n}`);
    assert.equal(typeof problem[`builder${n}`], 'function');
  }
  assert.equal(problem.code.join('\n'), USER_CODE, 'approach 1 is the user code, verbatim');
  assert.match(problem.code2.join('\n'), /from sortedcontainers import SortedList/);
  assert.match(problem.code3.join('\n'), /class Bucket:/);
  for (const approach of APPROACHES) assert.match(codeOf(approach).join('\n'), /class YT:\n    def __init__\(self, k\):[\s\S]*    def records\(self, video_id\):/);
  assert.deepEqual(build(undefined, 1).answer, build(problem.defaultInput, 1).answer);
  assert.deepEqual(problem.prepareLiveDesign(internals.SCREENSHOT_INPUT_9025), {
    className: 'YT',
    constructorArgs: [2],
    operations: ['1', '1', '1', '2', '2', '2', '3', '3', '3', '3', '1'].map((id) => ({ name: 'records', args: [id] })),
    resultSkip: 10,
  });
  assert.equal(problem.liveArgs, undefined, 'the live editor uses prepareLiveDesign');
});

test('9025 screenshot example: k = 2, {1: 3, 2: 3, 3: 4}, records("1") returns 3 then 1 (the set {1, 3}) in every approach', () => {
  for (const approach of APPROACHES) {
    const result = build(internals.SCREENSHOT_INPUT_9025, approach);
    assert.deepEqual(result.answer, [['3', '1']]);
    assert.deepEqual(new Set(result.answer[0]), new Set(['1', '3']));
    assert.deepEqual(result.steps.at(-1).yt9025View.results, [['3', '1']]);
  }
});

test('9025 all three approaches equal brute force on random operation sequences; notes <= 28 chars; one final step', () => {
  const { cases } = renderer('en');
  const all = [...presets(cases).map(parseCase), ...randomCases(400), ...EXTREMES.map(parseCase)];
  for (const { input, k, scores, calls } of all) {
    const want = bruteForce(k, scores, calls);
    for (const approach of APPROACHES) {
      const result = build(input, approach);
      assert.deepEqual(result.answer, want, `${approach}: ${input}`);
      assert.deepEqual(result.steps.at(-1).yt9025View.results, want, `${approach}: traced results ${input}`);
      assert.equal(result.steps.filter((step) => step.final).length, 1);
      assert.ok(result.steps.at(-1).final);
      result.steps.forEach((step, index) => {
        const at = `${approach}: ${input} #${index}`;
        const view = step.yt9025View;
        assert.equal(step.codeLines.length, 1);
        assert.equal(step.codeBlock, approach);
        assert.ok(step.note.en.length <= 28, `${at} en note: ${step.note.en}`);
        assert.ok(step.note.vi.length <= 28, `${at} vi note: ${step.note.vi}`);
        if (view.heap) {
          assert.ok(view.heap.length <= k + 1, `${at}: heap holds at most k + 1`);
          view.heap.forEach((t, i) => i && assert.ok(view.heap[(i - 1) >> 1][0] < t[0] || (view.heap[(i - 1) >> 1][0] === t[0] && view.heap[(i - 1) >> 1][1] < t[1]), `${at}: heap order`));
        }
        if (view.ranked) view.ranked.forEach((t, j) => j && assert.ok(view.ranked[j - 1][0] < t[0] || (view.ranked[j - 1][0] === t[0] && view.ranked[j - 1][1] < t[1]), `${at}: SortedList order`));
        if (view.chain && view.chain.length > 1) {
          assert.equal(view.chain[0].score, 0, `${at}: head`);
          assert.equal(view.chain.at(-1).score, null, `${at}: tail`);
          for (let j = 2; j < view.chain.length - 1; j++) assert.ok(view.chain[j].score > view.chain[j - 1].score, `${at}: buckets ascend`);
        }
      });
    }
  }
});

test('9025 default example walks every executable line in every approach; presets do too; a short preset exists', () => {
  const { cases } = renderer('en');
  assert.equal(cases[0][0], problem.defaultInput);
  for (const approach of APPROACHES) {
    const lines = executable(approach);
    const seen = new Set(build(problem.defaultInput, approach).steps.map((step) => step.codeLines[0]));
    assert.deepEqual(lines.filter((line) => !seen.has(line)), [], `default, approach ${approach}`);
    for (const line of seen) assert.ok(lines.includes(line), `approach ${approach}: line ${line} is not blank`);
    const union = new Set(presets(cases).flatMap((input) => build(input, approach).steps.map((step) => step.codeLines[0])));
    assert.deepEqual(lines.filter((line) => !union.has(line)), [], `presets, approach ${approach}`);
  }
  assert.ok(cases.some(([input]) => input === internals.SCREENSHOT_INPUT_9025), 'the screenshot preset');
  assert.ok(internals.parse9025(problem.defaultInput).calls.length >= 5);
});

test('9025 displayed Python (real heapq and sortedcontainers) returns the builder answers', (t) => {
  const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
  const wheel = path.join(__dirname, '..', 'public', 'vendor', 'sortedcontainers-2.4.0-py2.py3-none-any.whl');
  assert.ok(fs.existsSync(wheel), 'vendored sortedcontainers wheel');
  const { cases } = renderer('en');
  const inputs = [...presets(cases), ...randomCases(60, 7).map((c) => c.input), ...EXTREMES];
  const runs = inputs.map((input) => ({ ...problem.prepareLiveDesign(input), skip: internals.parse9025(input).scores.reduce((sum, [, s]) => sum + s, 0) }));
  const script = [
    'import json,sys',
    'payload=json.load(sys.stdin)',
    "sys.path.insert(0, payload['wheel'])",
    'out=[]',
    "for code in payload['codes']:",
    '    ns={}',
    '    exec(code, ns)',
    "    for run in payload['runs']:",
    "        obj=ns['YT'](*run['constructorArgs'])",
    "        got=[list(getattr(obj, op['name'])(*op['args'])) for op in run['operations']]",
    "        out.append(got[run['skip']:])",
    'print(json.dumps(out))',
  ].join('\n');
  const result = spawnSync(python, ['-c', script], {
    input: JSON.stringify({ wheel, codes: APPROACHES.map((a) => codeOf(a).join('\n')), runs }),
    encoding: 'utf8',
  });
  if (result.error) {
    t.skip(`no python to run: ${result.error.message}`);
    return;
  }
  assert.equal(result.status, 0, result.stderr);
  const expected = APPROACHES.flatMap((approach) => inputs.map((input) => build(input, approach).answer));
  assert.deepEqual(JSON.parse(result.stdout), expected);
});

test('9025 live editor (real TRACER_PY) shows list results for real calls only, without consuming live iterators', (t) => {
  const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
  const wheel = path.join(__dirname, '..', 'public', 'vendor', 'sortedcontainers-2.4.0-py2.py3-none-any.whl');
  const source = fs.readFileSync(require.resolve('../public/live-editor.js'), 'utf8');
  const tracer = vm.runInNewContext(source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1]);
  const inputs = [internals.SCREENSHOT_INPUT_9025, problem.defaultInput, '1 |  | a', '3 | x:1, y:1, z:1 | z, y, x'];
  const runs = APPROACHES.flatMap((approach) => inputs.map((input) => ({ code: codeOf(approach).join('\n'), design: problem.prepareLiveDesign(input) })));
  // A design whose first call returns an iterator that the second call still reads: the display must not drain it first.
  const keep = [
    'class Keep:',
    '    def make(self):',
    '        self.it = reversed([1, 2, 3])',
    '        return self.it',
    '    def drain(self):',
    '        it = iter([7, 8])',
    '        return list(self.it) + [next(it)]',
  ].join('\n');
  const program = `${tracer}
import json, sys
payload = json.load(sys.stdin)
sys.path.insert(0, payload['wheel'])
out = [__viz_run_trace(run['code'], 'YT', [], run['design'])['result'] for run in payload['runs']]
keep = __viz_run_trace(payload['keep'], 'Keep', [], {'className': 'Keep', 'constructorArgs': [], 'operations': [{'name': 'make', 'args': []}, {'name': 'drain', 'args': []}]})
plain = __viz_run_trace('class Solution:\\n    def f(self, n):\\n        return reversed(list(range(n)))', 'f', [3])
print(json.dumps({'out': out, 'keep': keep, 'plain': plain['result']}))
`;
  const result = spawnSync(python, ['-c', program], { input: JSON.stringify({ wheel, runs, keep }), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.error) {
    t.skip(`no python to run: ${result.error.message}`);
    return;
  }
  assert.equal(result.status, 0, result.stderr);
  const { out, keep: kept, plain } = JSON.parse(result.stdout);
  assert.deepEqual(out, APPROACHES.flatMap((approach) => inputs.map((input) => build(input, approach).answer)));
  assert.deepEqual(out[0], [['3', '1']], 'screenshot preset, approach 1: one real call, shown as a list');
  assert.doesNotMatch(JSON.stringify(out), /iterator|object at/);
  assert.deepEqual(kept.result, [[], [3, 2, 1, 7]], 'drain() still read the iterator make() returned');
  const local = kept.trace.find((entry) => entry.vars.it !== undefined);
  assert.match(local.vars.it, /^<list_iterator object/, 'line snapshots never expand (consume) a local iterator');
  assert.deepEqual(plain, [2, 1, 0]);
});

test('9025 complexity text is language-neutral and matches the code', () => {
  for (const n of ['', '2', '3']) {
    const cx = problem[`complexity${n}`];
    for (const key of ['time', 'space']) assert.match(cx[key], /^[ -~]+$/, `complexity${n}.${key} has no language-specific text`);
    assert.ok(cx.note.vi && cx.note.en && cx.note.vi !== cx.note.en, `complexity${n}.note is localized`);
  }
  assert.equal(problem.complexity3.time, 'O(1) + O(n log n) / call');
  assert.match(problem.code3.join('\n'), /sorted\(node\.ids, reverse=True\)/, 'the read sorts a whole bucket');
  assert.match(problem.complexity3.note.en, /O\(n log n\)/);
  assert.match(problem.complexity3.note.vi, /O\(n log n\)/);
});

test('9025 renders every frame in both languages with the executed line and one picture per state', () => {
  for (const lang of ['vi', 'en']) {
    const ui = renderer(lang);
    for (const approach of APPROACHES) {
      for (const input of presets(ui.cases)) {
        const { steps } = build(input, approach);
        const saved = JSON.stringify(steps);
        steps.forEach((step, index) => {
          const html = ui.render(step, steps, index);
          const view = step.yt9025View;
          const line = step.codeLines[0];
          const at = `${lang} ${approach} ${input} #${index}`;
          const count = (re) => (html.match(re) || []).length;
          assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object/, at);
          assert.ok(html.includes(`data-source-line="${line}"`), at);
          assert.ok(html.includes(`data-approach="${approach}"`), at);
          assert.ok(html.includes(`<div class="yt9025-now" data-code-line="${line}" aria-current="step"><span class="yt9025-lineno">L${line}</span>`), at);
          assert.equal(count(/data-code-line=/g), 1);
          assert.doesNotMatch(html, /def records\(self|def __init__\(self/, 'source is shown only in the shared #codePanel');
          assert.equal(count(/data-call="/g), view.calls.length, at);
          assert.equal(count(/data-yt9025-case="/g), ui.cases.length);
          assert.equal(/class="yt9025-branch/.test(html), BRANCH_LINES[approach].includes(line), `${at}: badge on line ${line}`);
          if (view.condition !== null) assert.ok(html.includes(`yt9025-branch is-${view.condition}">${view.condition ? 'True' : 'False'}`), at);
          if (approach !== 3) {
            assert.equal(count(/class="yt9025-id/g), view.videos.length, at);
            assert.equal(count(/data-plus="/g), view.bumped ? 1 : 0, `${at}: +1 only on the touched video`);
          }
          if (approach === 1) {
            assert.equal(count(/data-heap="/g), (view.heap || []).length, `${at}: one node per heap item`);
            assert.equal(count(/data-popped="/g), ['drop', 'take'].includes(view.event) ? 1 : 0, at);
          }
          if (approach === 2) {
            assert.equal(count(/data-ranked="/g), (view.ranked || []).length, `${at}: one chip per entry`);
            assert.equal(count(/data-lifted="/g), view.removed && ['remove', 'bump'].includes(view.event) ? 1 : 0, at);
            assert.equal(count(/class="yt9025-move"/g), view.event === 'add' ? 1 : 0, `${at}: the moved entry animates on add`);
          }
          if (approach === 3) {
            const extra = (view.ghost ? 1 : 0) + (view.making || view.floating ? 1 : 0);
            assert.equal(count(/data-bucket="/g), (view.chain || []).length + extra, `${at}: buckets`);
            assert.equal(count(/data-chip="/g), (view.chain || []).reduce((sum, b) => sum + b.ids.length, 0), `${at}: chips`);
          }
        });
        assert.equal(JSON.stringify(steps), saved, 'rendering does not mutate steps');
      }
    }
  }
});

// Boxes from the SVG markup. Text is 11px monospace: ~0.6em per glyph; anchors come from the text-anchor attribute.
function svgBoxes(html) {
  const svg = html.match(/<svg class="yt9025-svg" width="([\d.]+)" height="([\d.]+)"/);
  const rects = [...html.matchAll(/<rect class="([^"]+)" x="(-?[\d.]+)" y="(-?[\d.]+)" width="([\d.]+)" height="([\d.]+)" rx="4"([^>]*)\/>/g)].map((m) => ({
    name: `${m[1]}@${m[2]},${m[3]}`, x: +m[2], y: +m[3], w: +m[4], h: +m[5],
    key: (m[6].match(/data-key="([^"]+)"/) || [])[1] || null, bg: /data-layer="bg"/.test(m[6]),
  }));
  const texts = [...html.matchAll(/<text class="([^"]+)" x="(-?[\d.]+)" y="(-?[\d.]+)" text-anchor="(start|middle|end)"(?: data-own="([^"]+)")?>([^<]*)<\/text>/g)].map((m) => {
    const label = m[6].replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<');
    const w = [...label].length * 11 * 0.6;
    const x = m[4] === 'end' ? +m[2] - w : m[4] === 'middle' ? +m[2] - w / 2 : +m[2];
    return { name: `${m[1]}:${label}@${m[2]},${m[3]}`, x, y: +m[3] - 10, w, h: 12, own: m[5] || null };
  });
  return { width: Number(svg[1]), height: Number(svg[2]), rects, texts, textCount: (html.match(/<text /g) || []).length, rectCount: (html.match(/<rect /g) || []).length };
}

const hit = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
const inside = (a, b) => a.x >= b.x && a.x + a.w <= b.x + b.w && a.y >= b.y - 0.5 && a.y + a.h <= b.y + b.h + 0.5;

test('9025 picture: labels sit on their own shapes, nothing overlaps, everything stays inside the viewBox', () => {
  const ui = renderer('en');
  const inputs = [...presets(ui.cases), ...randomCases(80, 99).map((c) => c.input), ...EXTREMES];
  for (const approach of APPROACHES) {
    for (const input of inputs) {
      const { steps } = build(input, approach);
      steps.forEach((step, index) => {
        const { width, height, rects, texts, textCount, rectCount } = svgBoxes(ui.render(step, steps, index));
        const at = `${approach} ${input} #${index}`;
        assert.equal(texts.length, textCount, `${at}: every text parsed`);
        assert.equal(rects.length, rectCount, `${at}: every rect parsed`);
        for (const b of [...rects, ...texts]) assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.w <= width && b.y + b.h <= height, `${at}: ${b.name} clipped`);
        const solid = rects.filter((r) => !r.bg);
        for (let a = 0; a < texts.length; a++) {
          const t = texts[a];
          if (t.own) {
            const owner = solid.filter((r) => r.key === t.own);
            assert.equal(owner.length, 1, `${at}: ${t.name} owner`);
            assert.ok(inside(t, owner[0]), `${at}: ${t.name} outside ${owner[0].name}`);
          }
          for (let b = a + 1; b < texts.length; b++) assert.ok(!hit(t, texts[b]), `${at}: ${t.name} overlaps ${texts[b].name}`);
          for (const r of solid) if (r.key !== t.own || !t.own) assert.ok(!hit(t, r), `${at}: ${t.name} overlaps ${r.name}`);
        }
        for (let a = 0; a < solid.length; a++) {
          for (let b = a + 1; b < solid.length; b++) assert.ok(!hit(solid[a], solid[b]), `${at}: ${solid[a].name} overlaps ${solid[b].name}`);
        }
        assert.ok(rects.filter((r) => r.bg).length <= 1, `${at}: one highlight band`);
        assert.ok(width <= 500, `${at}: svg ${width} wide`);
      });
    }
  }
});

test('9025 picture colors differ from the status colors and each other in both themes', () => {
  const hex = (block, name) => (block.match(new RegExp(`--yt9025-${name}: (#[0-9a-f]{6});`, 'i')) || [])[1];
  const rgb = (value) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
  const distance = (a, b) => Math.hypot(...rgb(a).map((v, i) => v - rgb(b)[i]));
  const dark = CSS.match(/^\.yt9025-viz \{[^}]*\}/m)[0];
  const light = CSS.match(/\[data-theme="light"\] \.yt9025-viz \{[^}]*\}/)[0];
  for (const block of [dark, light]) {
    const picture = ['bar', 'plus', 'node', 'bucket', 'cut', 'scan'];
    for (const name of picture) {
      for (const status of ['green', 'red', 'amber']) assert.ok(distance(hex(block, name), hex(block, status)) > 60, `${name} vs ${status}`);
    }
    for (let a = 0; a < picture.length; a++) {
      for (let b = a + 1; b < picture.length; b++) assert.ok(distance(hex(block, picture[a]), hex(block, picture[b])) > 60, `${picture[a]} vs ${picture[b]}`);
    }
    for (const name of [...picture, 'text', 'muted', 'green', 'red', 'amber']) assert.ok(distance(hex(block, name), hex(block, 'bg')) > 120, `${name} vs bg`);
  }
  assert.match(CSS, /\.yt9025-node\.is-drop \{[^}]*stroke-dasharray/s);
  assert.match(CSS, /\.yt9025-bucket\.is-ghost \{[^}]*stroke-dasharray/s);
  assert.match(CSS, /@keyframes yt9025-slide/);
  assert.match(CSS, /prefers-reduced-motion: reduce\) \{\s*\.yt9025-move \{\s*animation: none;/);
});

test('9025 aria-labels follow the page language', () => {
  const vi = renderer('vi');
  const en = renderer('en');
  for (const approach of APPROACHES) {
    const { steps } = build(problem.defaultInput, approach);
    const last = steps.length - 1;
    const line = steps[last].codeLines[0];
    assert.ok(vi.render(steps[last], steps, last).includes('role="img" aria-label="Kết quả: 3, 2"'), `vi ${approach}`);
    assert.ok(en.render(steps[last], steps, last).includes('role="img" aria-label="Result: 3, 2"'), `en ${approach}`);
    assert.ok(vi.render(steps[last], steps, last).includes(`aria-label="9025 Videos — Top K · dòng ${line}"`));
    assert.ok(en.render(steps[last], steps, last).includes(`aria-label="9025 Videos — Top K · line ${line}"`));
    assert.ok(vi.render(steps[0], steps, 0).includes('aria-label="Lượt gọi"'));
    assert.ok(en.render(steps[0], steps, 0).includes('aria-label="Calls"'));
  }
  const { steps } = build(problem.defaultInput, 1);
  const warm = steps.findLastIndex((step) => step.yt9025View.event === 'warmup');
  assert.ok(en.render(steps[warm], steps, warm).includes('role="img" aria-label="3 videos, k = 2"'));
  assert.ok(vi.render(steps[warm], steps, warm).includes('role="img" aria-label="3 video, k = 2"'));
  const three = build(problem.defaultInput, 3).steps;
  const w3 = three.findLastIndex((step) => step.yt9025View.event === 'warmup');
  assert.ok(en.render(three[w3], three, w3).includes('role="img" aria-label="4 buckets, k = 2"'));
  assert.ok(vi.render(three[w3], three, w3).includes('role="img" aria-label="4 xô, k = 2"'));
});

test('9025 shows locals once, in the shared Variables panel, with Python scoping', () => {
  const ui = renderer('en');
  for (const approach of APPROACHES) {
    const { steps } = build(problem.defaultInput, approach);
    steps.forEach((step, index) => {
      const v = vars(step);
      assert.deepEqual(step.vars.map((item) => item.name), VAR_NAMES[approach]);
      const event = step.yt9025View.event;
      if (event === 'call') for (const name of FRESH[approach]) assert.equal(v[name], '—', `${approach}: ${name} is fresh at each call`);
      if (step.yt9025View.ci === null) assert.equal(v.video_id, '—');
      assert.doesNotMatch(ui.render(step, steps, index), /yt9025-locals/);
    });
    assert.equal(vars(steps.at(-1)).video_id, "'3'");
  }
  const one = build(problem.defaultInput, 1).steps.at(-1);
  assert.equal(vars(one).res, "['2', '3']", 'res is ascending; reversed(res) is the answer');
  assert.equal(vars(one)['self.videos'], "{'1': 4, '2': 5, '3': 5, '4': 1}");
  assert.equal(vars(one).min_heap, '[]');
  const two = build(problem.defaultInput, 2).steps.at(-1);
  assert.equal(vars(two)['self.ranked'], "SortedList([(1, '4'), (4, '1'), (5, '2'), (5, '3')])");
  const three = build(problem.defaultInput, 3).steps.at(-1);
  assert.equal(vars(three).res, "['3', '2']");
});

test('9025 rejects inputs outside the visualizer limits', () => {
  const bad = ['', 'x', '2 | 1:3', '0 | 1:3 | 1', '6 | 1:3 | 1', '2 | 1:10 | 1', '2 | 1:0 | 1', '2 | 1:3, 1:4 | 1', '2 | 1:3 |', '2 | 1-3 | 1',
    '2 | abcd:1 | 1', '2 | 1:3 | 1, 2, 3, 4, 5, 6, 7, 8, 9', '2 | a:1, b:1, c:1, d:1, e:1, f:1, g:1, h:1 | i', '2 | 1:3 | 1 | 2', '2.5 | 1:3 | 1', '2 | 1:-1 | 1'];
  for (const input of bad) {
    for (const approach of APPROACHES) assert.throws(() => build(input, approach), /9025/, `${approach} ${JSON.stringify(input)}`);
  }
  assert.throws(() => problem.builder(42), /9025/);
  assert.deepEqual(problem.builder('1 |  | a').answer, [['a']]);
});

test('9025 assets are wired with light/dark tokens and no code-panel height cap', () => {
  const index = readFrontendIndex();
  assert.match(index, /youtube-trending-9025\.css\?v=youtube-trending-9025-v2" data-problem-ids="9025"/);
  assert.match(index, /renderer-youtube-trending-9025\.js\?v=youtube-trending-9025-v2" data-problem-ids="9025"/);
  assert.match(readFrontendJavaScript(), /step\.yt9025View\), surface: "treeView", render: \(step\) => \{\s*renderYouTubeTrending9025View\(step\)/);
  assert.match(CSS, /\.yt9025-viz \{[^}]*--yt9025-bg:/s);
  assert.match(CSS, /\[data-theme="light"\] \.yt9025-viz \{[^}]*--yt9025-bg:/s);
  assert.match(CSS, /\.yt9025-viz\) #codePanel \{[^}]*max-height: none;/s);
  assert.match(CSS, /\.yt9025-viz\) #codePanel \.code-line \{[^}]*white-space: pre-wrap;/s);
  assert.match(CSS, /\.yt9025-viz\) #codePanel \.code-line \.txt \{[^}]*white-space: pre-wrap;[^}]*overflow-wrap: anywhere;/s);
  // Hanging indent: wrapped text continues 4 columns past the line's own indent (one 4ch .indent-guide per level).
  assert.match(CSS, /\.yt9025-viz\) #codePanel \.code-line \.txt \{[^}]*--yt9025-hang: 4ch;[^}]*padding-left: var\(--yt9025-hang\);[^}]*text-indent: calc\(-1 \* var\(--yt9025-hang\)\);/s);
  assert.match(CSS, /\.yt9025-viz\) #codePanel \.code-line \.txt \.indent-guide \{\s*text-indent: 0;/);
  const maxIndent = Math.max(...APPROACHES.flatMap((a) => codeOf(a).map((line) => line.match(/^ */)[0].length)));
  for (let level = 1; level <= maxIndent / 4; level++) {
    assert.match(CSS, new RegExp(`\\.txt:has\\(> \\.indent-guide:nth-child\\(${level}\\)\\) \\{\\s*--yt9025-hang: ${4 * level + 4}ch;`), `indent level ${level}`);
  }
  assert.equal(SUPPORTED[9024], undefined, '9024 stays retired (see tests/lis-300.test.js)');
});
