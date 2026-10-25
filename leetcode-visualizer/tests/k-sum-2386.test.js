const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');

const problem = require('../problems').SUPPORTED[2386];
const {
  JAVASCRIPT_ASSETS,
  STYLESHEET_ASSETS,
  readFrontendIndex,
  readFrontendJavaScript,
  readFrontendStyles,
} = require('./helpers/frontend-source');

function allSums(nums) {
  const sums = [];
  for (let mask = 0; mask < 2 ** nums.length; mask += 1) {
    let total = 0;
    for (let index = 0; index < nums.length; index += 1) {
      if (mask & (1 << index)) total += nums[index];
    }
    sums.push(total);
  }
  return sums.sort((left, right) => right - left);
}

test('2386 solves both official examples and preserves duplicate ranks', () => {
  const first = problem.builder([2, 4, -2], { k: 5 });
  assert.equal(first.answer, 2);
  assert.deepEqual(first.history.map((entry) => entry.sum), [6, 4, 4, 2, 2]);
  assert.equal(problem.builder([1, -2, 3, 4, -10, 12], { k: 16 }).answer, 10);
  assert.deepEqual(problem.builder([0, 0], { k: 4 }).history.map((entry) => entry.sum), [0, 0, 0, 0]);
});

test('2386 agrees with exhaustive subset enumeration on deterministic random arrays', () => {
  let seed = 2386;
  for (let sample = 0; sample < 120; sample += 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const n = 1 + (seed % 10);
    const nums = [];
    for (let index = 0; index < n; index += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      nums.push((seed % 17) - 8);
    }
    const expected = allSums(nums);
    for (const k of [1, 2, Math.min(expected.length, 3 + (seed % expected.length)), expected.length]) {
      assert.equal(problem.builder(nums, { k }).answer, expected[k - 1], `nums=${nums}, k=${k}`);
    }
  }
});

test('2386 trace proves the loss transform, monotone pop order, branches, and witness sums', () => {
  const run = problem.builder([2, 4, -2], { k: 5 });
  assert.equal(run.steps[0].kSum2386View.phase, 'maximum');
  assert.equal(run.steps[0].kSum2386View.maximum, 6);
  assert.ok(run.steps.some((step) => step.kSum2386View.phase === 'normalize'));
  assert.ok(run.steps.some((step) => step.kSum2386View.phase === 'branch-add'));
  assert.ok(run.steps.some((step) => step.kSum2386View.phase === 'branch-replace'));

  const losses = run.history.map((entry) => entry.loss);
  assert.deepEqual(losses, [...losses].sort((left, right) => left - right));
  for (const entry of run.history) {
    assert.equal(entry.selectedIndices.reduce((sum, index) => sum + run.original[index], 0), entry.sum);
    assert.equal(entry.sum, run.steps[0].kSum2386View.maximum - entry.loss);
  }
  const final = run.steps.at(-1);
  assert.equal(final.final, true);
  assert.equal(final.kSum2386View.answer, 2);
  assert.equal(final.kSum2386View.rank, 5);
  assert.equal(final.kSum2386View.selectedValues.reduce((sum, value) => sum + value, 0), 2);
});

test('2386 handles k=1, full small rank ranges, and a capped large trace', () => {
  const one = problem.builder([-5, 0, 8], { k: 1 });
  assert.equal(one.answer, 8);
  assert.equal(one.steps.some((step) => step.kSum2386View.phase === 'seed'), false);
  assert.equal(one.steps.at(-1).kSum2386View.answer, 8);

  const large = problem.builder(Array(100000).fill(0), { k: 2000 });
  assert.equal(large.answer, 0);
  assert.equal(large.history.length, 2000);
  assert.ok(large.steps.length <= 420);
  assert.equal(large.steps.at(-1).kSum2386View.traceTruncated, true);
  assert.equal(large.steps.at(-1).kSum2386View.answer, 0);
});

test('2386 validates nums, bounds, and k against min(2000, 2^n)', () => {
  for (const [input, params] of [
    [[], { k: 1 }],
    [[1.5], { k: 1 }],
    [[1000000001], { k: 1 }],
    [[1], { k: 0 }],
    [[1], { k: 3 }],
    [[1, 2], { k: 5 }],
    [[1, 2, 3], { k: 1.5 }],
    ['[1,bad]', { k: 1 }],
  ]) assert.throws(() => problem.builder(input, params));
});

test('2386 displayed Python and live args agree with exhaustive sums', () => {
  const cases = [
    { nums: [2, 4, -2], k: 5 },
    { nums: [1, -2, 3, 4, -10, 12], k: 16 },
    { nums: [0, 0, 0], k: 8 },
    { nums: [-4, -1, 7, 7], k: 11 },
  ];
  assert.deepEqual(problem.liveArgs('2,4,-2', { k: 5 }), [[2, 4, -2], 5]);
  const source = `${problem.code.join('\n')}
import json, sys
cases = json.loads(sys.stdin.read())
solution = Solution()
actual = [solution.kSum(case['nums'], case['k']) for case in cases]
print(json.dumps(actual))
`;
  const run = spawnSync('python3', ['-c', source], { input: JSON.stringify(cases), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(JSON.parse(run.stdout), cases.map(({ nums, k }) => allSums(nums)[k - 1]));
});

test('2386 is registered as a Google hard heap and best-first-search lesson', () => {
  assert.equal(problem.id, 2386);
  assert.equal(problem.slug, 'find-the-k-sum-of-an-array');
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.category.key, 'heap');
  assert.ok(problem.tags.some((tag) => tag.key === 'sorting'));
  assert.ok(problem.tags.some((tag) => tag.key === 'best-first-search'));
  assert.ok(problem.tags.some((tag) => tag.key === 'subset-sum'));
  assert.ok(problem.companies.includes('google'));
  assert.equal(problem.debugMode, 'line-by-line');
});

test('2386 detailed renderer and responsive assets are wired before script.js', () => {
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-k-sum-2386.js'));
  assert.ok(STYLESHEET_ASSETS.includes('k-sum-2386.css'));
  const javascript = readFrontendJavaScript();
  const styles = readFrontendStyles();
  const index = readFrontendIndex();
  assert.match(javascript, /function renderKSum2386View\(step\)/);
  assert.match(javascript, /ks2386-fork/);
  assert.match(javascript, /ks2386-heap/);
  assert.match(styles, /\.ks2386-state\.root/);
  assert.match(styles, /@container \(max-width:480px\)/);
  assert.ok(index.indexOf('renderer-k-sum-2386.js') < index.indexOf('script.js?'));
});

test('2386 debug lines and six watches agree with CPython, including duplicate heap tuples', () => {
  const cases = [
    { nums: [2, 4, -2], k: 5 }, { nums: [1, -2, 3, 4, -10, 12], k: 16 },
    { nums: [0, 0, 0], k: 8 }, { nums: [-4, -1, 7, 7], k: 11 },
    { nums: [3], k: 1 }, { nums: [-3], k: 2 }, { nums: [1e9, -1e9, 0], k: 8 },
  ];
  const source = problem.code.join('\n') + `
import copy, json, sys
cases = json.load(sys.stdin)
runs = []
for case in cases:
    events, returned = [], []
    def trace(frame, event, arg):
        if frame.f_code.co_name == 'kSum':
            state = frame.f_locals
            snapshot = {
                'maximum': state.get('maximum', '—'), 'k': state['k'],
                'loss': state.get('loss', '—'), 'index': state.get('index', '—'),
                'size': len(state['heap']) if 'heap' in state else '—',
                'heap': sorted(state.get('heap', [])),
            }
            if event == 'line':
                events.append({'line': frame.f_lineno, 'state': copy.deepcopy(snapshot)})
            elif event == 'return':
                returned.append(copy.deepcopy(snapshot))
        return trace
    sys.settrace(trace)
    answer = Solution().kSum(case['nums'], case['k'])
    sys.settrace(None)
    runs.append({'answer': answer, 'events': [
        {'line': before['line'], 'state': events[index + 1]['state'] if index + 1 < len(events) else returned[0]}
        for index, before in enumerate(events)
    ]})
print(json.dumps(runs))
`;
  const python = spawnSync('python3', ['-c', source], { input: JSON.stringify(cases), encoding: 'utf8' });
  assert.equal(python.status, 0, python.stderr);
  JSON.parse(python.stdout).forEach((expected, index) => {
    const run = problem.builder(cases[index].nums, { k: cases[index].k });
    assert.equal(run.answer, expected.answer);
    assert.deepEqual(run.steps.map(step => step.codeLines), expected.events.map(event => [event.line]));
    let rank = 1;
    run.steps.forEach((step, eventIndex) => {
      const event = expected.events[eventIndex], s = event.state, v = step.kSum2386View;
      if (event.line === 13) rank++;
      assert.deepEqual(step.vars.map(variable => variable.name), ['maximum', 'k', 'rank', 'loss', 'index', 'heap size']);
      assert.deepEqual(step.vars.map(variable => variable.value), [s.maximum, s.k, rank, s.loss, s.index, s.size]);
      assert.deepEqual(v.frontier.map(entry => [entry.loss, entry.index]).sort((a, b) => a[0] - b[0] || a[1] - b[1]), s.heap);
      assert.equal(v.source.text, problem.code[event.line - 1]);
    });
  });
});

test('2386 branch previews become queued only on their own heappush line', () => {
  const run = problem.builder([2, 4, -2], { k: 5 });
  for (let index = 0; index < run.steps.length; index++) {
    const v = run.steps[index].kSum2386View;
    if (v.expansion) {
      const x = v.expansion;
      assert.deepEqual(x.add.state.chosen, [...x.parent.chosen, x.next.sortedIndex]);
      assert.deepEqual(x.replace.state.chosen, [...x.parent.chosen.slice(0, -1), x.next.sortedIndex]);
      for (const child of [x.add, x.replace]) assert.equal(child.state.chosenValues.reduce((sum, value) => sum + value, 0), child.state.loss);
    }
    if (v.phase === 'branch-add') {
      assert.equal(v.source.line, 16);
      assert.equal(v.frontierSize, run.steps[index - 1].kSum2386View.frontierSize + 1);
      assert.equal(v.expansion.add.queued, true);
      assert.equal(v.expansion.replace.queued, false);
    }
    if (v.phase === 'branch-replace') {
      assert.equal(v.source.line, 17);
      assert.equal(v.frontierSize, run.steps[index - 1].kSum2386View.frontierSize + 1);
      assert.equal(v.expansion.add.queued, true);
      assert.equal(v.expansion.replace.queued, true);
    }
  }
});

test('2386 pictures show the heap tree, two branches, signed flips and separate duplicate ranks', () => {
  const host = { innerHTML: '' };
  const context = { lang: 'vi', $: () => host, escapeHtml: value => String(value).replace(/[&<>"']/g, '_') };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-k-sum-2386.js'), 'utf8'), context);
  const cases = [
    { nums: [2, 4, -2], k: 5 }, { nums: [-2, 2], k: 4 }, { nums: [-5], k: 1 }, { nums: [0, 0], k: 4 },
    { nums: Array(201).fill(0), k: 2 },
  ];
  for (const language of ['vi', 'en']) for (const item of cases) {
    context.lang = language;
    const run = problem.builder(item.nums, { k: item.k });
    for (const step of run.steps) {
      context.renderKSum2386View(step);
      const html = host.innerHTML, v = step.kSum2386View;
      assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object|<p[ >]|<table|<details/);
      if (v.expansion) assert.match(html, /class="ks2386-fork"/);
      if (v.frontierSize) assert.match(html, /class="ks2386-state root/);
      for (const number of v.numbers.slice(0, 12)) if (number.flipped) {
        const classes = number.value > 0 ? 'skipped removed' : 'selected added';
        assert.ok(html.includes(`class="ks2386-number ${classes}" data-original-index="${number.index}"`));
      }
    }
    if (item.k === 5) assert.equal((host.innerHTML.match(/data-rank="/g) || []).length, 5);
    context.renderKSum2386View(run.steps[0]);
    const first = host.innerHTML;
    context.renderKSum2386View(run.steps.at(-1));
    context.renderKSum2386View(run.steps[0]);
    assert.equal(host.innerHTML, first);
  }
});
