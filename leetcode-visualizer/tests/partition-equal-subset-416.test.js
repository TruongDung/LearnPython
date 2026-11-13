const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');
const { readFrontendJavaScript, readFrontendStyles, readFrontendIndex } = require('./helpers/frontend-source');
const problem = SUPPORTED[416];
const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : process.platform === 'win32' ? 'python' : 'python3');

function oracle(nums) {
  const total = nums.reduce((sum, num) => sum + num, 0);
  if (total % 2) return false;
  for (let mask = 0; mask < 2 ** nums.length; mask++) {
    let sum = 0;
    nums.forEach((num, index) => { if (mask & (1 << index)) sum += num; });
    if (sum === total / 2) return true;
  }
  return false;
}

function checkPartition(input, view) {
  assert.equal(view.answer, true);
  const { a, b } = view.partition;
  assert.deepEqual([...a, ...b].sort((x, y) => x - y), input.map((_, i) => i));
  assert.equal(new Set([...a, ...b]).size, input.length);
  assert.equal(a.reduce((sum, i) => sum + input[i], 0), view.target);
  assert.equal(b.reduce((sum, i) => sum + input[i], 0), view.target);
}

test('416 keeps the DP learning category and supplies validated line-by-line Python arguments', () => {
  assert.equal(problem.category.key, 'dp');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.deepEqual(problem.liveArgs([1, 5, 11, 5]), [[1, 5, 11, 5]]);
  assert.equal(problem.code[10], '        return dp[target]');
  for (const input of [[], [0], [-1], [101], [1.2], [Infinity], null, {}, Array(201).fill(1)]) {
    assert.throws(() => problem.builder(input));
    assert.throws(() => problem.liveArgs(input));
  }
});

test('416 bitset approach matches subset enumeration and exposes the shift-OR Python solution', () => {
  const approach = problem.extraParams.find(param => param.key === 'approach');
  assert.equal(approach.default, 1);
  assert.deepEqual(approach.options.map(option => option.value), [1, 2, 3]);
  assert.equal(problem.builder2(problem.defaultInput, { approach: 2 }).answer, true);
  assert.match(problem.code2Label.vi, /Cách 2/);
  assert.match(problem.code2Label.en, /Approach 2/);
  assert.match(problem.code2.join('\n'), /bits \|= bits << num/);
  assert.deepEqual(problem.liveArgs([1, 5, 11, 5]), [[1, 5, 11, 5]]);
  for (const [nums, answer] of [
    [[1, 5, 11, 5], true], [[1, 2, 3, 5], false], [[2, 6], false],
    [[1, 1], true], [[100], false], [[2, 2, 2, 2], true],
  ]) {
    assert.equal(problem.builder2(nums).answer, answer, String(nums));
    assert.equal(problem.builder2(nums).steps.at(-1).equalSubset416BitsetView.answer, answer);
  }
  let seed = 9416;
  for (let sample = 0; sample < 120; sample++) {
    const nums = Array.from({ length: 1 + sample % 10 }, () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return 1 + seed % 10;
    });
    assert.equal(problem.builder2(nums).answer, oracle(nums), String(nums));
  }
  for (const input of [null, {}, [0], [-1], [101], [1.2], [Infinity], Array(201).fill(1)]) {
    assert.throws(() => problem.builder2(input));
  }
});

test('416 bitset snapshots model shift-OR without reusing an occurrence and execute as Python', () => {
  const cases = [problem.defaultInput, [1, 2, 3, 5], [2, 6], [1, 1], [100, 100]];
  const source = `import json, sys
namespace = {}
exec(compile(${JSON.stringify(problem.code2.join('\n'))}, 'solution416bitset.py', 'exec'), namespace)
print(json.dumps([namespace['Solution']().canPartition(nums) for nums in json.load(sys.stdin)]))
`;
  const run = spawnSync(python, ['-c', source], { encoding: 'utf8', input: JSON.stringify(cases) });
  assert.equal(run.status, 0, run.stderr);
  const actual = JSON.parse(run.stdout);
  cases.forEach((nums, index) => {
    const visual = problem.builder2(nums);
    assert.equal(visual.answer, actual[index]);
    let reachable = 1n;
    for (const step of visual.steps) {
      assert.equal(step.codeLines.length, 1);
      assert.ok(problem.code2[step.codeLines[0] - 1]?.trim());
      const view = step.equalSubset416BitsetView;
      if (view.target === null) continue;
      const shifted = view.phase === 'shift-or' ? reachable << BigInt(view.num) : 0n;
      const next = view.phase === 'shift-or' ? reachable | shifted : reachable;
      view.sums.forEach((sum, cell) => {
        assert.equal(view.before[cell], Number((reachable >> BigInt(sum)) & 1n));
        assert.equal(view.shifted[cell], Number((shifted >> BigInt(sum)) & 1n));
        assert.equal(view.after[cell], Number((next >> BigInt(sum)) & 1n));
      });
      if (view.phase === 'shift-or') reachable = next;
    }
  });
  const twice = problem.builder2([2, 6]);
  assert.equal(twice.answer, false, 'one occurrence of 2 cannot be reused to make 4');
});

test('416 agrees with subset enumeration and published examples without reusing an occurrence', () => {
  for (const [nums, answer] of [
    [[1, 5, 11, 5], true], [[1, 2, 3, 5], false], [[2, 6], false],
    [[1, 2, 5], false], [[2, 2, 3, 5], false], [[1, 1], true], [[100], false],
    [[2, 2, 2, 2], true], [[3, 3, 3, 3], true], [[1], false],
  ]) assert.equal(problem.builder(nums).answer, answer, String(nums));
  let seed = 416;
  for (let sample = 0; sample < 120; sample++) {
    const nums = Array.from({ length: 1 + sample % 10 }, () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return 1 + seed % 10; });
    const run = problem.builder(nums);
    assert.equal(run.answer, oracle(nums), String(nums));
    if (run.answer) checkPartition(nums, run.steps.at(-1).equalSubset416View);
  }
});

test('416 initializes dp only on its Python line and returns odd totals before allocating it', () => {
  const run = problem.builder([1, 5, 11, 5]);
  const target = run.steps.find(s => s.equalSubset416View.event === 'target');
  assert.equal(target.equalSubset416View.current, null);
  const init = run.steps.find(s => s.equalSubset416View.event === 'init-dp');
  assert.ok(init.equalSubset416View.current.every(value => !value));
  const zero = run.steps.find(s => s.equalSubset416View.event === 'zero');
  assert.deepEqual(zero.equalSubset416View.current, [true, ...Array(11).fill(false)]);
  assert.ok(init.equalSubset416View.current.every(value => !value), 'zero must not mutate the previous snapshot');
  const odd = problem.builder([1, 2, 3, 5]);
  assert.equal(odd.steps.at(-1).codeLines[0], 4);
  assert.equal(odd.steps.at(-1).equalSubset416View.target, null);
  assert.equal(odd.steps.at(-1).equalSubset416View.current, null);
  assert.ok(odd.steps.at(-1).final);
});

test('416 transitions read the frozen previous row and display valid source subsets', () => {
  const run = problem.builder(problem.defaultInput);
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    const view = step.equalSubset416View;
    assert.equal(view.source, problem.code[step.codeLines[0] - 1]);
    if (!view.transition) continue;
    const tr = view.transition;
    assert.equal(tr.destination - tr.source, view.num);
    assert.equal(view.before[view.sums.indexOf(tr.source)], tr.from);
    assert.equal(view.current[view.sums.indexOf(tr.destination)], view.event === 'inspect' ? tr.before : tr.after);
    assert.equal(new Set(tr.sourceWitness).size, tr.sourceWitness.length);
    assert.ok(tr.sourceWitness.every(index => index < view.itemIndex));
    if (tr.from) assert.equal(tr.sourceWitness.reduce((sum, index) => sum + view.nums[index], 0), tr.source);
  }
  const twice = problem.builder([2, 6]);
  const afterTwo = twice.steps.find(s => s.equalSubset416View.itemIndex === 0 && s.equalSubset416View.event === 'update' && s.equalSubset416View.transition.destination === 2).equalSubset416View;
  assert.equal(afterTwo.current[afterTwo.sums.indexOf(2)], true);
  assert.equal(afterTwo.current[afterTwo.sums.indexOf(4)], false);
  assert.equal(afterTwo.before[afterTwo.sums.indexOf(2)], false);
});

test('416 reconstructs disjoint groups and explains each completed number without mutating input', () => {
  const nums = [1, 5, 11, 5];
  const run = problem.builder(nums);
  const final = run.steps.at(-1);
  assert.equal(final.codeLines[0], 11);
  assert.equal(run.steps.filter(s => s.final).length, 1);
  checkPartition(nums, final.equalSubset416View);
  assert.deepEqual(nums, [1, 5, 11, 5]);
  assert.deepEqual(final.equalSubset416View.history.map(row => row.num), nums);
  assert.deepEqual(final.equalSubset416View.history[0].added, [1]);
  assert.deepEqual(final.equalSubset416View.history[1].added, [5, 6]);
  assert.deepEqual(final.equalSubset416View.history[2].added, [11]);
  assert.deepEqual(final.equalSubset416View.history[3].added, [10]);
  const skip = problem.builder([100]).steps.find(s => s.equalSubset416View.event === 'skip-large');
  assert.equal(skip.equalSubset416View.num, 100);
  assert.equal(skip.equalSubset416View.transition, null);
});

test('416 snapshots match Python after every executed statement', () => {
  const cases = [problem.defaultInput, [1, 2, 3, 5], [2, 6], [100], [1, 2, 5], [1, 1]];
  const source = `import json, sys, copy
namespace = {}
exec(compile(${JSON.stringify(problem.code.join('\n'))}, 'solution416.py', 'exec'), namespace)
results = []
for nums in json.load(sys.stdin):
    records = []
    pending = None
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_filename != 'solution416.py' or frame.f_code.co_name != 'canPartition':
            return trace
        if event in ('line', 'return'):
            if pending is not None:
                records.append({'line':pending, 'locals':copy.deepcopy({k:v for k,v in frame.f_locals.items() if k != 'self'})})
            pending = frame.f_lineno if event == 'line' else None
        return trace
    sys.settrace(trace)
    answer = namespace['Solution']().canPartition(nums)
    sys.settrace(None)
    results.append({'answer':answer, 'records':records})
print(json.dumps(results))
`;
  const run = spawnSync(python, ['-c', source], { encoding: 'utf8', input: JSON.stringify(cases) });
  assert.equal(run.status, 0, run.stderr);
  const actual = JSON.parse(run.stdout);
  // Lines 1-2 (class/def) run outside canPartition's frame; 8-9 are loop headers Python re-visits on exhaustion.
  const ignored = new Set([1, 2, 8, 9]);
  cases.forEach((nums, index) => {
    const visual = problem.builder(nums);
    assert.equal(visual.answer, actual[index].answer);
    const frames = visual.steps.filter(s => !ignored.has(s.codeLines[0]));
    const records = actual[index].records.filter(r => !ignored.has(r.line));
    assert.equal(frames.length, records.length);
    frames.forEach((frame, i) => {
      assert.equal(frame.codeLines[0], records[i].line);
      assert.deepEqual(Object.fromEntries(frame.vars.map(v => [v.name, v.value])), records[i].locals, `input ${nums}, line ${records[i].line}`);
    });
  });
});

test('416 caps long traces and previews cells while still solving the maximum official input', () => {
  const nums = Array(200).fill(100);
  const run = problem.builder(nums);
  assert.equal(run.answer, true);
  assert.ok(run.steps.length <= 451);
  assert.equal(run.steps.at(-1).equalSubset416View.shortened, true);
  assert.ok(run.steps.every(s => s.equalSubset416View.sums.length <= 30));
  assert.ok(JSON.stringify(run).length < 2000000);
  checkPartition(nums, run.steps.at(-1).equalSubset416View);
});

// ---------- Picture-first renderer (DP grid, bitset rows, DFS call path) ----------

const RENDERER = fs.readFileSync(path.join(__dirname, '..', 'public', 'renderer-partition-equal-subset-416.js'), 'utf8');
const NOTE_CAP = 28;
const APPROACHES = [
  { builder: 'builder', code: 'code', render: 'renderEqualSubset416View', view: 'equalSubset416View', method: 1 },
  { builder: 'builder2', code: 'code2', render: 'renderEqualSubset416BitsetView', view: 'equalSubset416BitsetView', method: 2 },
  { builder: 'builder3', code: 'code3', render: 'renderEqualSubset416DfsView', view: 'equalSubset416DfsView', method: 3 },
];

function renderer(language) {
  const host = { innerHTML: '' };
  const context = { lang: language, $: () => host };
  vm.createContext(context);
  vm.runInContext(RENDERER, context);
  return {
    context,
    cases: vm.runInContext('PE416_CASES', context).map(([input]) => input.split(',').map(Number)),
    render(approach, step, steps, index) {
      context.steps = steps;
      context.stepIndex = index;
      context[approach.render](step);
      return host.innerHTML;
    },
  };
}

const executable = (code) => code.flatMap((text, index) => (text.trim() && !text.trim().startsWith('#') ? [index + 1] : []));

test('416 default is a richer example; it walks every line of DP and bitset, DFS misses only the odd return, presets cover all', () => {
  const { cases } = renderer('en');
  assert.deepEqual(cases[0], problem.defaultInput);
  assert.ok(cases.some((nums) => nums.join() === '1,5,11,5'), 'the old short example is kept as a preset');
  assert.ok(problem.defaultInput.length >= 6);
  assert.equal(problem.builder(problem.defaultInput).answer, true);
  for (const approach of APPROACHES) {
    const lines = executable(problem[approach.code]);
    const seen = new Set();
    for (const nums of cases) problem[approach.builder](nums).steps.forEach((step) => seen.add(step.codeLines[0]));
    assert.deepEqual(lines.filter((line) => !seen.has(line)), [], `${approach.builder}: presets cover every line`);
    const byDefault = new Set(problem[approach.builder](problem.defaultInput).steps.map((step) => step.codeLines[0]));
    assert.deepEqual(lines.filter((line) => !byDefault.has(line)), approach.method === 3 ? [6] : [], `${approach.builder}: default coverage`);
  }
});

test('416 renders every frame of every approach in both languages: executed line, short notes, source and locals shown once', () => {
  for (const language of ['vi', 'en']) {
    const ui = renderer(language);
    for (const approach of APPROACHES) {
      for (const nums of ui.cases) {
        const { steps } = problem[approach.builder](nums);
        const saved = JSON.stringify(steps);
        steps.forEach((step, index) => {
          const html = ui.render(approach, step, steps, index);
          const view = step[approach.view];
          const line = step.codeLines[0];
          assert.ok(step.note[language].length <= NOTE_CAP, `short note: ${step.note[language]}`);
          assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object/, `${approach.builder} ${nums} #${index}`);
          assert.ok(html.includes(`data-method="${approach.method}" data-source-line="${line}"`));
          assert.doesNotMatch(html, /canPartition|range\(target|bits \|=|def dfs/, 'source is shown only in the shared #codePanel');
          assert.doesNotMatch(html, /pe416-locals|pe416-vars/, 'locals are shown only in the shared Variables panel');
          assert.ok(Array.isArray(step.vars));
          if (approach.method === 1 && view.rows.length) {
            view.rows.forEach((row, r) => row.cells.forEach((on, c) => assert.ok(html.includes(`data-row="${r}" data-sum="${view.sums[c]}" data-on="${on}"`))));
            assert.equal(view.rows.filter((row) => row.active).length, view.itemIndex !== null || view.event === 'init-dp' || view.event === 'zero' ? 1 : 0);
            if (view.transition) {
              assert.match(html, /data-arrow="keep"/);
              assert.match(html, /data-arrow="take"/);
            }
          }
          if (approach.method === 2 && view.ready) {
            view.sums.forEach((sum, c) => assert.ok(html.includes(`data-row="after" data-sum="${sum}" data-bit="${view.after[c]}"`)));
            if (view.phase === 'shift-or') {
              assert.match(html, /data-row="before"/);
              assert.match(html, /data-row="shifted"/);
              if (view.sums.includes(view.num)) assert.match(html, /data-arrow="shift"/);
            }
          }
          if (view.partition) {
            const groups = html.split('<div class="pe416-group"').slice(1).map((g) => [...g.split('</div></div>')[0].matchAll(/data-index="(\d+)"/g)].map((m) => Number(m[1])));
            assert.deepEqual(groups, [view.partition.a, view.partition.b]);
          } else assert.doesNotMatch(html, /pe416-group/);
          if (step.final) assert.match(html, view.answer ? /pe416-badge is-true">✓ True/ : /pe416-badge is-false">× False/);
        });
        assert.equal(JSON.stringify(steps), saved, 'rendering does not mutate steps');
      }
    }
  }
});

test('416 keeps every step note within the cap for custom inputs on all three approaches (both languages)', () => {
  let seed = 41628;
  const rand = (max) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return 1 + seed % max; };
  const edges = [
    [1], [100], [1, 2], [2, 4, 7], [3, 5], [99, 1], [100, 100], [1, 1, 1, 1, 100],
    [97, 89, 83, 79, 73, 71, 67, 61, 59, 53, 47, 43], Array(12).fill(100), [100, 1, 100, 1, 100, 1, 100, 1, 100, 1, 100, 1],
    Array.from({ length: 100 }, (_, i) => i + 1), Array(200).fill(100), Array(199).fill(100).concat(1),
    Array.from({ length: 200 }, (_, i) => 100 - (i % 100)),
  ];
  const randoms = Array.from({ length: 40 }, (_, k) => Array.from({ length: k < 20 ? 1 + k % 12 : 1 + rand(200) - 1 }, () => rand(k % 2 ? 100 : 10)));
  const inputs = [...edges, ...randoms];
  let checked = 0;
  for (const approach of APPROACHES) {
    for (const nums of inputs) {
      if (approach.method === 3 && nums.length > 12) continue;
      for (const step of problem[approach.builder](nums).steps) {
        for (const language of ['vi', 'en']) {
          const note = step.note[language];
          assert.equal(typeof note, 'string');
          assert.ok(note.length <= NOTE_CAP, `${approach.builder} [${nums.slice(0, 8)}${nums.length > 8 ? ',…' : ''}] ${language}: "${note}" (${note.length})`);
          checked++;
        }
      }
    }
  }
  assert.ok(checked > 1000);
});

// Samples the renderer's arrow paths (M, L and V commands only) into points about 1px apart.
function samplePath(d) {
  const tokens = d.match(/[MLV]|-?\d+(?:\.\d+)?/g);
  const points = [];
  let x = 0;
  let y = 0;
  const lineTo = (x1, y1) => {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x, y1 - y)));
    for (let k = 1; k <= n; k++) points.push([x + (x1 - x) * k / n, y + (y1 - y) * k / n]);
    x = x1;
    y = y1;
  };
  for (let i = 0; i < tokens.length;) {
    const cmd = tokens[i++];
    const num = () => Number(tokens[i++]);
    if (cmd === 'M') { x = num(); y = num(); points.push([x, y]); }
    if (cmd === 'L') { const x1 = num(); lineTo(x1, num()); }
    if (cmd === 'V') lineTo(x, num());
  }
  return points;
}

function arrows(html) {
  return [...html.matchAll(/<path class="(pe416-(?:arrow|edge)[^"]*)" d="([^"]+)"/g)].map((m) => ({ name: m[1], points: samplePath(m[2]) }));
}

test('416 arrows never lie on top of each other and DFS take labels stay off their edges (both languages)', () => {
  for (const language of ['vi', 'en']) {
    const ui = renderer(language);
    for (const approach of APPROACHES) {
      for (const nums of [...ui.cases, [10, 11, 12, 13, 2, 2, 7, 3]]) {
        const { steps } = problem[approach.builder](nums);
        steps.forEach((step, index) => {
          const html = ui.render(approach, step, steps, index);
          const paths = arrows(html);
          for (const a of paths) for (const b of paths) {
            if (a === b) continue;
            const near = a.points.filter(([x, y]) => b.points.some(([u, v]) => Math.hypot(x - u, y - v) <= 2)).length / a.points.length;
            assert.ok(near < 0.1, `${approach.builder} ${nums} #${index}: ${a.name} on ${b.name} (${near.toFixed(2)})`);
          }
          // Take labels are right-aligned (text-anchor end) at (x, y): approximate the glyph box at 12px monospace.
          for (const m of html.matchAll(/<text class="pe416-edge-label" x="([\d.-]+)" y="([\d.-]+)" text-anchor="end">([^<]+)<\/text>/g)) {
            const [x, y, w] = [Number(m[1]), Number(m[2]), 7.3 * m[3].length];
            for (const p of paths) assert.ok(!p.points.some(([u, v]) => u > x - w && u < x && v > y - 10 && v < y + 2), `${nums} #${index}: label ${m[3]} on ${p.name}`);
          }
        });
      }
    }
  }
});

test('416 assets are wired with light and dark tokens, per-approach code sections and no code-panel height cap', () => {
  const source = readFrontendJavaScript();
  const registry = source.slice(source.indexOf('const ORDERED_RENDERER_REGISTRY'));
  for (const name of ['equalSubset416View', 'equalSubset416BitsetView', 'equalSubset416DfsView']) {
    assert.ok(registry.indexOf(`step.${name}`) >= 0 && registry.indexOf(`step.${name}`) < registry.indexOf('step.hardProblemView'));
  }
  const index = readFrontendIndex();
  assert.match(index, /partition-equal-subset-416\.css\?v=equal-subset-416-v5/);
  assert.match(index, /renderer-partition-equal-subset-416\.js\?v=equal-subset-416-v5/);
  assert.match(index, /equalSubset=equal-subset-416-v5/);
  const css = fs.readFileSync(path.join(__dirname, '..', 'public', 'partition-equal-subset-416.css'), 'utf8');
  assert.match(readFrontendStyles(), /\[data-theme="light"\] \.pe416-viz/);
  assert.match(css, /\.pe416-viz \{[^}]*--pe-bg:/s);
  assert.match(css, /\[data-theme="light"\] \.pe416-viz \{[^}]*--pe-bg:/s);
  assert.match(css, /\.pe416-viz\) #codePanel \{[^}]*max-height: none;/s);
  assert.match(css, /data-method="1".*data-block="1".*data-method="2".*data-block="2".*data-method="3".*data-block="3"/s);
  assert.doesNotMatch(css, /\.note \{\s*display: ?none/, 'the short step note stays visible');
  assert.equal(problem.debugMode, 'line-by-line');
});
