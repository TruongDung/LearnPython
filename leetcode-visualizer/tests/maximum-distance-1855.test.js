const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { readFrontendJavaScript, readFrontendStyles, readFrontendIndex } = require('./helpers/frontend-source');
const problem = SUPPORTED[1855];
const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');

function bruteForce(nums1, nums2) {
  let best = 0;
  let found = false;
  nums1.forEach((value, i) => nums2.forEach((other, j) => {
    if (i <= j && value <= other) { found = true; best = Math.max(best, j - i); }
  }));
  return { best, found };
}

test('1855 validates descending positive arrays with disclosed visualization limits and live args', () => {
  assert.equal(problem.category.key, 'two-pointer');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.deepEqual(problem.liveArgs('5,3,1', { nums2: '[6,4,2]' }), [[5, 3, 1], [6, 4, 2]]);
  for (const bad of [[], [0], [100001], [2, 3], [1.5], [null], 'abc', Array(101).fill(1)]) {
    assert.throws(() => problem.builder(bad, { nums2: [1] }));
    assert.throws(() => problem.builder([1], { nums2: bad }));
    assert.throws(() => problem.liveArgs([1], { nums2: bad }));
  }
  assert.throws(() => problem.builder([1], null));
  assert.throws(() => problem.builder([1], {}));
  assert.equal(problem.builder(Array(100).fill(100000), { nums2: Array(100).fill(100000) }).answer, 99);
});

test('1855 matches examples, unequal lengths, catch-up, and both meanings of zero', () => {
  for (const [nums1, nums2, expected] of [
    [[55, 30, 5, 4, 2], [100, 20, 10, 10, 5], 2],
    [[2, 2, 2], [10, 10, 1], 1], [[30, 29, 19, 5], [25, 25, 25, 25, 25], 2],
    [[1], [5, 4, 3, 2, 1], 4], [[5, 4, 3, 2, 1], [1], 0],
    [[9, 8, 2], [7, 3, 2, 1], 0], [[1], [1], 0], [[2], [1], 0],
  ]) {
    const a = [...nums1]; const b = [...nums2];
    const run = problem.builder(nums1, { nums2 });
    assert.equal(run.answer, expected);
    assert.deepEqual(nums1, a); assert.deepEqual(nums2, b);
    const view = run.steps.at(-1).maximumDistance1855View;
    const brute = bruteForce(nums1, nums2);
    assert.equal(Boolean(view.bestPair), brute.found);
    if (view.bestPair) {
      const [i, j] = view.bestPair;
      assert.ok(i <= j && nums1[i] <= nums2[j]);
      assert.equal(j - i, expected);
    }
  }
});

test('1855 agrees with every valid pair for all short non-increasing three-value arrays', () => {
  const arrays = [];
  function generate(prefix, upper) {
    if (prefix.length) arrays.push(prefix);
    if (prefix.length === 5) return;
    for (let next = upper; next >= 1; next--) generate([...prefix, next], next);
  }
  generate([], 3);
  for (const nums1 of arrays) for (const nums2 of arrays) {
    const run = problem.builder(nums1, { nums2 });
    const expected = bruteForce(nums1, nums2);
    assert.equal(run.answer, expected.best, JSON.stringify([nums1, nums2]));
    assert.equal(Boolean(run.steps.at(-1).maximumDistance1855View.bestPair), expected.found);
  }
});

test('1855 skips updates for i > j, snapshots moves before rechecking, and exits without reading END', () => {
  const run = problem.builder([9, 8, 2], { nums2: [7, 3, 2, 1] });
  assert.equal(run.steps.filter(step => step.final).length, 1);
  const catchup = run.steps.filter(step => step.maximumDistance1855View.event === 'index-check' && !step.maximumDistance1855View.indexCheck);
  assert.ok(catchup.length >= 2);
  catchup.forEach(step => {
    assert.equal(step.maximumDistance1855View.candidate, null);
    assert.equal(step.maximumDistance1855View.nextLine, 9);
  });
  run.steps.forEach((step, index) => {
    const view = step.maximumDistance1855View;
    assert.equal(view.source, problem.code[view.line - 1]);
    assert.equal(view.nextLine, run.steps[index + 1]?.codeLines[0] ?? null);
    if (view.event.startsWith('move-')) {
      assert.equal(view.valueCheck, null);
      assert.equal(view.indexCheck, null);
      assert.equal(view.nextLine, 5);
    }
    if (view.event === 'value-check' && !view.valueCheck) assert.equal(view.nextLine, 11);
  });
  const end = run.steps.at(-2).maximumDistance1855View;
  assert.equal(end.event, 'loop-end');
  assert.equal(end.i, end.nums1.length);
  assert.equal(end.valueCheck, null);
  assert.equal(end.nextLine, 12);
});

test('1855 trace and before/after variables match Python after every executed line', () => {
  const cases = [
    [[55, 30, 5, 4, 2], [100, 20, 10, 10, 5]], [[9, 8, 2], [7, 3, 2, 1]],
    [[1], [1]], [[2], [1]], [[1], [5, 4, 3, 2, 1]],
    [Array(100).fill(1), Array(100).fill(1)],
  ];
  const source = `import json, sys, copy
namespace = {}
exec(compile(${JSON.stringify(problem.code.join('\n'))}, 'distance1855.py', 'exec'), namespace)
results = []
for nums1, nums2 in json.load(sys.stdin):
    records = []
    pending = None
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_filename != 'distance1855.py' or frame.f_code.co_name != 'maxDistance':
            return trace
        if event in ('line', 'return'):
            if pending is not None:
                records.append({'line':pending, 'locals':copy.deepcopy({k:v for k,v in frame.f_locals.items() if k != 'self'})})
            pending = frame.f_lineno if event == 'line' else None
        return trace
    sys.settrace(trace)
    answer = namespace['Solution']().maxDistance(nums1, nums2)
    sys.settrace(None)
    results.append({'answer':answer, 'records':records})
assert namespace['Solution']().maxDistance([1] * 100000, [1] * 100000) == 99999
print(json.dumps(results))
`;
  const executed = spawnSync(python, ['-c', source], { encoding: 'utf8', input: JSON.stringify(cases), maxBuffer: 3 * 1024 * 1024 });
  assert.equal(executed.status, 0, executed.stderr);
  const results = JSON.parse(executed.stdout);
  cases.forEach(([nums1, nums2], index) => {
    const run = problem.builder(nums1, { nums2 });
    const actual = results[index];
    assert.equal(run.answer, actual.answer);
    assert.equal(run.steps.length, actual.records.length);
    run.steps.forEach((step, i) => {
      assert.equal(step.codeLines[0], actual.records[i].line);
      assert.deepEqual(Object.fromEntries(step.vars.map(v => [v.name, v.value])), actual.records[i].locals);
      assert.deepEqual(Object.fromEntries(step.maximumDistance1855View.beforeVars.map(v => [v.name, v.value])), i === 0 ? { nums1, nums2 } : actual.records[i - 1].locals);
    });
  });
});

test('1855 renderer aligns unequal arrays and shows guards, zero witnesses, and END in VI and EN', () => {
  const element = { querySelector: () => ({ querySelector: () => ({ querySelector: () => null }) }) };
  const context = { lang: 'vi', $: () => element, escapeHtml: String };
  context.pick = value => value[context.lang];
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'public', 'renderer-maximum-distance-1855.js'), 'utf8'), context);
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const [nums1, nums2] of [[[55, 30, 5, 4, 2], [100, 20, 10, 10, 5]], [[9, 8, 2], [7, 3, 2, 1]], [[1], [1]], [[2], [1]]]) {
      for (const step of problem.builder(nums1, { nums2 }).steps) {
        context.renderMaximumDistance1855View(step);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
        assert.match(element.innerHTML, /md1855-debug/);
        assert.equal((element.innerHTML.match(/data-present=/g) || []).length, (Math.max(nums1.length, nums2.length) + 1) * 2);
        assert.match(element.innerHTML, /END/);
      }
    }
  }
});

test('1855 frontend loads the dedicated renderer with common scrolling and responsive themes', () => {
  const registry = readFrontendJavaScript().split('const ORDERED_RENDERER_REGISTRY')[1];
  assert.ok(registry.indexOf('step.maximumDistance1855View') < registry.indexOf('step.hardProblemView'));
  assert.match(readFrontendIndex(), /renderer-maximum-distance-1855\.js/);
  assert.match(readFrontendIndex(), /maximum-distance-1855\.css/);
  assert.match(readFrontendStyles(), /\[data-theme="light"\] \.md1855-viz/);
  assert.match(readFrontendStyles(), /\.md1855-strips \{[^}]*overflow-x: auto/);
});
