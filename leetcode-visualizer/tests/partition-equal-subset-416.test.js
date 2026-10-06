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
const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');

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
  const run = problem.builder(problem.defaultInput);
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
  const ignored = new Set([8, 9]);
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

function rendererHarness() {
  const source = fs.readFileSync(path.join(__dirname, '..', 'public', 'renderer-partition-equal-subset-416.js'), 'utf8');
  const element = { querySelector: () => ({ querySelector: () => null }) };
  const context = { lang: 'vi', $: () => element, escapeHtml: String };
  context.pick = value => value[context.lang];
  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, element };
}

test('416 renderer shows exact DP values, source arrows, and partition groups in both languages', () => {
  const { context, element } = rendererHarness();
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const nums of [problem.defaultInput, [1, 2, 3, 5], [2, 6], [100], [1, 1]]) {
      for (const step of problem.builder(nums).steps) {
        context.renderEqualSubset416View(step);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
        const view = step.equalSubset416View;
        if (view.current) view.sums.forEach((sum, i) => {
          assert.ok(element.innerHTML.includes(`data-row="now" data-sum="${sum}" data-reachable="${view.current[i]}"`));
          if (view.itemIndex !== null) assert.ok(element.innerHTML.includes(`data-row="before" data-sum="${sum}" data-reachable="${view.before[i]}"`));
        });
        if (view.transition) assert.match(element.innerHTML, /marker-end="url\(#pe416-arrow\)"/);
        if (view.partition) assert.equal((element.innerHTML.match(/class="pe416-group"/g) || []).length, 2);
      }
    }
  }
  context.lang = 'en';
  const cropped = problem.builder([100, 100]).steps.find(s => s.equalSubset416View.transition);
  context.renderEqualSubset416View(cropped);
  assert.match(element.innerHTML, /collapses other cells/);
  assert.match(element.innerHTML, /same occurrence of 2 is used twice/);
});

test('416 renderer assets are loaded ahead of the generic renderer with responsive light-theme support', () => {
  const source = readFrontendJavaScript();
  const registry = source.slice(source.indexOf('const ORDERED_RENDERER_REGISTRY'));
  assert.ok(registry.indexOf('step.equalSubset416View') < registry.indexOf('step.hardProblemView'));
  assert.match(readFrontendIndex(), /renderer-partition-equal-subset-416\.js/);
  assert.match(readFrontendIndex(), /partition-equal-subset-416\.css/);
  assert.match(readFrontendStyles(), /\[data-theme="light"\] \.pe416-viz/);
  assert.match(readFrontendStyles(), /\.pe416-table-scroll \{[^}]*overflow-x: auto/);
});
