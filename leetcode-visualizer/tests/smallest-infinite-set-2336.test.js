const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const vm = require('node:vm');
const { readFrontendJavaScript, readFrontendStyles, readFrontendIndex } = require('./helpers/frontend-source');

const { SUPPORTED } = require('../problems');
const { prepareDesignLiveRun } = require('../live-args');

const problem = SUPPORTED[2336];

function oracle(operations) {
  const present = new Set(Array.from({ length: 1100 }, (_, index) => index + 1));
  return operations.map(([name, value]) => {
    if (name === 'addBack') {
      present.add(value);
      return null;
    }
    const smallest = Math.min(...present);
    present.delete(smallest);
    return smallest;
  });
}

test('2336 is registered as a line-by-line heap allocator', () => {
  assert.equal(problem.slug, 'smallest-number-in-infinite-set');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.ok(problem.tags.some((tag) => tag.key === 'heap'));
  assert.ok(problem.tags.some((tag) => tag.key === 'hash-set'));
});

test('2336 matches the demo, published sequence and repeated addBack semantics', () => {
  assert.deepEqual(problem.builder(problem.defaultInput).answer, [1, 2, 3, null, null, null, 1, 2, 3, 4]);
  assert.deepEqual(problem.builder([["popSmallest"], ["popSmallest"], ["addBack", 1], ["popSmallest"], ["popSmallest"], ["popSmallest"]]).answer, [1, 2, null, 1, 3, 4]);
  const operations = [
    ['popSmallest'], ['popSmallest'], ['addBack', 1], ['addBack', 1],
    ['addBack', 8], ['popSmallest'], ['popSmallest'], ['addBack', 2], ['popSmallest'],
  ];
  assert.deepEqual(problem.builder(JSON.stringify(operations)).answer, oracle(operations));
});

test('2336 agrees with an independent finite-prefix oracle', () => {
  let seed = 2336;
  for (let sample = 0; sample < 30; sample += 1) {
    const operations = [];
    for (let index = 0; index < 35; index += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      if (seed % 3 === 0) operations.push(['addBack', 1 + (seed % 20)]);
      else operations.push(['popSmallest']);
    }
    assert.deepEqual(problem.builder(JSON.stringify(operations)).answer, oracle(operations));
  }
});

test('2336 trace owns one valid Python line per frame and preserves heap/set parity', () => {
  const run = problem.builder(problem.defaultInput);
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
  assert.ok(run.steps.every((step) => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  assert.equal(run.steps.filter((step) => step.final).length, 1);
  assert.equal(run.steps.at(-1).hardProblemView.answer.join(','), run.answer.join(','));
  const popLine = problem.code.findIndex((line) => line.includes('heappop(self.added_back)')) + 1;
  const pushLine = problem.code.findIndex((line) => line.includes('heappush(self.added_back')) + 1;
  for (const step of run.steps) {
    const view = step.hardProblemView;
    const heapText = view.groups[0].items[0].value;
    const setText = view.groups[0].items[1].value;
    const heapValues = heapText === '[]' ? [] : heapText.slice(1, -1).split(', ').map(Number);
    const setValues = setText === '[]' ? [] : setText.slice(1, -1).split(', ').map(Number);
    if (step.codeLines[0] === popLine) {
      assert.equal(setValues.length, heapValues.length + 1, 'set removal executes on the next line');
    } else if (step.codeLines[0] === pushLine) {
      assert.equal(heapValues.length, setValues.length + 1, 'set insertion executes on the next line');
    } else {
      assert.deepEqual([...heapValues].sort((a, b) => a - b), setValues);
    }
  }
});

test('2336 validates operations and prepares the Python design runner', () => {
  for (const input of ['bad', '[]', 'null', '{}', '[[]]', '[["popSmallest",1]]', '[["addBack"]]', '[["addBack",0]]', '[["unknown"]]']) {
    assert.throws(() => problem.builder(input));
    assert.throws(() => prepareDesignLiveRun(problem, input));
  }
  const config = prepareDesignLiveRun(problem, problem.defaultInput);
  assert.equal(config.className, 'SmallestInfiniteSet');
  assert.deepEqual(config.constructorArgs, []);
  assert.deepEqual(config.operations, problem.builder(problem.defaultInput).operations);
});

test('2336 displayed Python implementation matches the visualization', () => {
  const operationSets = [
    JSON.parse(problem.defaultInput),
    [['addBack', 1], ['popSmallest'], ['popSmallest'], ['addBack', 1], ['popSmallest']],
  ];
  const cases = operationSets.map((operations) => ({
    config: prepareDesignLiveRun(problem, JSON.stringify(operations)),
    expected: problem.builder(JSON.stringify(operations)).answer,
  }));
  const source = `${problem.code.join('\n')}
import json, sys
for case in json.load(sys.stdin):
    config = case['config']
    instance = SmallestInfiniteSet(*config['constructorArgs'])
    actual = [getattr(instance, op['name'])(*op['args']) for op in config['operations']]
    assert actual == case['expected'], (actual, case['expected'])
`;
  const run = spawnSync('python', ['-c', source], { input: JSON.stringify(cases), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('2336 supplies independent heap and infinite-tail snapshots at each mutation', () => {
  const steps = problem.builder(problem.defaultInput).steps;
  assert.ok(steps.every(step => step.infiniteSet2336View));
  const inserted = steps.find(step => step.infiniteSet2336View.event === 'push-heap');
  assert.deepEqual(inserted.infiniteSet2336View.heap, [3]);
  assert.deepEqual(inserted.infiniteSet2336View.addedSet, []);
  assert.equal(inserted.infiniteSet2336View.nextSmallest, 4);
  const tree = steps.find(step => step.infiniteSet2336View.heap.length === 3);
  assert.deepEqual(tree.infiniteSet2336View.heap, [1, 3, 2]);
  const popped = steps.find(step => step.infiniteSet2336View.event === 'pop-heap');
  assert.deepEqual(popped.infiniteSet2336View.heap, [2, 3]);
  assert.deepEqual(popped.infiniteSet2336View.addedSet, [1, 2, 3]);
  assert.equal(popped.infiniteSet2336View.operation.value, 1);
  assert.equal(popped.infiniteSet2336View.operation.source, 'heap');
  const fresh = steps.find(step => step.infiniteSet2336View.event === 'pop-fresh');
  assert.equal(fresh.infiniteSet2336View.nextSmallest, 2);
  assert.equal(fresh.infiniteSet2336View.operation.value, 1);
  assert.equal(fresh.infiniteSet2336View.operation.source, 'tail');
  // Later mutations must not leak into the first frames.
  assert.deepEqual(steps[0].infiniteSet2336View.heap, []);
  assert.deepEqual(steps[0].infiniteSet2336View.history, []);
});

function rendererHarness() {
  const source = readFrontendJavaScript();
  const start = source.indexOf('function renderInfiniteSet2336View(step)');
  const end = source.indexOf('const PRIMARY_VISUALIZATION_SURFACES', start);
  const element = { querySelector: () => ({ querySelector: () => null }) };
  const context = { lang: 'vi', $: () => element, escapeHtml: String };
  context.pick = value => value[context.lang];
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  return { context, element };
}

test('2336 draws a number strip, binary heap edges, and transitions in both languages', () => {
  const { context, element } = rendererHarness();
  const steps = problem.builder(problem.defaultInput).steps;
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const step of steps) {
      context.renderInfiniteSet2336View(step);
      const html = element.innerHTML;
      assert.match(html, /inf2336-strip/);
      assert.match(html, /… → ∞/);
      assert.doesNotMatch(html, /undefined|NaN|Infinity/);
      const view = step.infiniteSet2336View;
      assert.equal((html.match(/<circle /g) || []).length, view.heap.length);
      assert.equal((html.match(/<line /g) || []).length, Math.max(0, view.heap.length - 1));
      for (let value = 1; value <= view.displayUpper; value++) {
        const present = view.heap.includes(value) || value >= view.nextSmallest;
        assert.ok(html.includes(`data-value="${value}" data-present="${present}"`));
      }
      if (view.event === 'pop-heap') assert.match(html, /data-value="1" data-present="false"/);
      if (view.event === 'push-heap') assert.match(html, /just-added/);
      if (view.event === 'pop-fresh') assert.match(html, /just-popped/);
    }
  }
});

test('2336 shows ignored duplicate and untouched numbers without changing the heap', () => {
  const { context, element } = rendererHarness();
  context.lang = 'en';
  const steps = problem.builder([['popSmallest'], ['addBack', 1], ['addBack', 1], ['addBack', 1000]]).steps;
  const ignored = steps.filter(step => step.infiniteSet2336View.event === 'add-check' && step.infiniteSet2336View.operation.accepted === false);
  assert.equal(ignored.length, 2);
  for (const step of ignored) {
    assert.deepEqual(step.infiniteSet2336View.heap, [1]);
    context.renderInfiniteSet2336View(step);
    assert.match(element.innerHTML, /Already present/);
  }
});

test('2336 number strip follows the cursor beyond the old fourteen-number preview', () => {
  const run = problem.builder(Array.from({ length: 40 }, () => ['popSmallest']));
  const final = run.steps.at(-1).infiniteSet2336View;
  assert.equal(final.nextSmallest, 41);
  assert.equal(final.displayUpper, 49);
  assert.equal(final.outputs.length, 40);
  const { context, element } = rendererHarness();
  context.renderInfiniteSet2336View(run.steps.at(-1));
  assert.match(element.innerHTML, /data-value="40" data-present="false"/);
  assert.match(element.innerHTML, /data-value="41" data-present="true"/);
});

test('2336 dedicated renderer precedes the generic renderer and loads responsive theme styles', () => {
  const source = readFrontendJavaScript();
  const registry = source.slice(source.indexOf('const ORDERED_RENDERER_REGISTRY'));
  assert.ok(registry.indexOf('step.infiniteSet2336View') < registry.indexOf('step.hardProblemView'));
  const index = readFrontendIndex();
  assert.match(index, /renderer-smallest-infinite-set-2336\.js/);
  assert.match(index, /smallest-infinite-set-2336\.css/);
  const css = readFrontendStyles();
  assert.match(css, /\.inf2336-strip \{[^}]*overflow-x: auto/);
  assert.match(css, /@container \(max-width: 540px\)/);
  assert.match(css, /\[data-theme="light"\] \.inf2336-viz/);
  assert.match(css, /prefers-reduced-motion/);
});
