const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const vm = require('node:vm');
const { readFrontendJavaScript } = require('./helpers/frontend-source');
const { SUPPORTED } = require('../problems');
const { prepareDesignLiveRun } = require('../live-args');
const problem = SUPPORTED[2336];

function oracle(ops) {
  const present = new Set(Array.from({ length: 1100 }, (_, i) => i + 1));
  return ops.map(([name, value]) => {
    if (name === 'addBack') { present.add(value); return null; }
    const result = Math.min(...present);
    present.delete(result);
    return result;
  });
}

test('2336 exposes a second approach with the same design-runner interface', () => {
  const approach = problem.extraParams.find(param => param.key === 'approach');
  assert.equal(approach.default, 1);
  assert.deepEqual(approach.options.map(option => option.value), [1, 2]);
  assert.match(problem.code2.join('\n'), /class SmallestInfiniteSet:/);
  assert.match(problem.code2.join('\n'), /free_bit = \(self.removed \+ 1\) & ~self.removed/);
  assert.equal(prepareDesignLiveRun(problem, problem.defaultInput).className, 'SmallestInfiniteSet');
  assert.deepEqual(problem.builder2(problem.defaultInput).answer, [1, 2, 3, null, null, null, 1, 2, 3, 4]);
});

test('2336 bitmask agrees with an independent set oracle and heap on randomized calls', () => {
  let seed = 2336;
  for (let sample = 0; sample < 40; sample++) {
    const ops = Array.from({ length: 40 }, () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed % 3 ? ['popSmallest'] : ['addBack', 1 + seed % 1000];
    });
    const result = problem.builder2(ops);
    assert.deepEqual(result.answer, oracle(ops));
    assert.deepEqual(result.answer, problem.builder(ops).answer);
    assert.doesNotThrow(() => JSON.stringify(result));
  }
});

test('2336 bitmask keeps bits above 32 and implicit infinite zeros', () => {
  const result = problem.builder2(Array.from({ length: 40 }, () => ['popSmallest']));
  assert.deepEqual(result.answer, Array.from({ length: 40 }, (_, i) => i + 1));
  const last = result.steps.at(-1).infiniteSet2336BitmaskView;
  assert.equal(last.removed, String((1n << 40n) - 1n));
  assert.equal(last.minimum, 41);
  assert.equal(last.width, 44);
});

test('2336 addBack handles duplicate restores and untouched high numbers', () => {
  const ops = [['addBack', 1000], ['popSmallest'], ['addBack', 1], ['addBack', 1], ['popSmallest']];
  const result = problem.builder2(ops);
  assert.deepEqual(result.answer, [null, 1, null, null, 1]);
  const checks = result.steps.filter(s => s.infiniteSet2336BitmaskView.event === 'check-removed');
  assert.deepEqual(checks.map(s => s.infiniteSet2336BitmaskView.operation.accepted), [false, true, false]);
  assert.equal(checks[0].infiniteSet2336BitmaskView.removed, '0');
  assert.equal(checks[0].infiniteSet2336BitmaskView.outputs.length, 1);
  const cleared = result.steps.find(s => s.infiniteSet2336BitmaskView.event === 'clear-removed');
  assert.equal(cleared.infiniteSet2336BitmaskView.removed, '0');
  assert.equal(cleared.infiniteSet2336BitmaskView.minimum, 1);
});

test('2336 snapshots show the state after each executed Python statement', () => {
  const result = problem.builder2(problem.defaultInput);
  assert.ok(result.steps.every(s => s.codeBlock === 2 && s.codeLines.length === 1));
  for (const step of result.steps) {
    const view = step.infiniteSet2336BitmaskView;
    assert.equal(view.source, problem.code2[step.codeLines[0] - 1]);
    const mask = BigInt(view.removed);
    const calc = view.calculation;
    if (view.event === 'find-zero') {
      assert.equal(step.codeLines[0], 6);
      assert.equal(mask, BigInt(calc.mask));
      assert.equal(BigInt(calc.bit), (mask + 1n) & ~mask);
    }
    if (view.event === 'set-removed') {
      assert.equal(step.codeLines[0], 8);
      assert.equal(mask, BigInt(calc.mask) | BigInt(calc.bit));
    }
    if (view.event === 'clear-removed') {
      assert.equal(step.codeLines[0], 14);
      assert.equal(mask, BigInt(calc.mask) & ~BigInt(calc.bit));
    }
  }
  assert.equal(result.steps[0].infiniteSet2336BitmaskView.removed, '0');
  assert.deepEqual(result.steps[0].infiniteSet2336BitmaskView.history, []);
  assert.equal(result.steps.filter(s => s.final).length, 1);
  assert.deepEqual(result.steps.at(-1).infiniteSet2336BitmaskView.outputs, result.answer);
});

test('2336 displayed Python bitmask works beyond a fixed 1000-bit prefix', () => {
  const local = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(local) ? local : 'python');
  const cases = [JSON.parse(problem.defaultInput), [['addBack', 1000], ['popSmallest'], ['addBack', 1], ['addBack', 1], ['popSmallest']]];
  const source = `${problem.code2.join('\n')}
import json, sys
for case in json.load(sys.stdin):
    instance = SmallestInfiniteSet()
    actual = [getattr(instance, op[0])(*op[1:]) for op in case['ops']]
    assert actual == case['expected'], (actual, case['expected'])
instance = SmallestInfiniteSet()
assert [instance.popSmallest() for _ in range(1101)] == list(range(1, 1102))
instance.addBack(1000)
instance.addBack(1000)
assert instance.popSmallest() == 1000
assert instance.popSmallest() == 1102
`;
  const run = spawnSync(python, ['-c', source], { encoding: 'utf8', input: JSON.stringify(cases.map(ops => ({ ops, expected: oracle(ops) }))) });
  assert.equal(run.status, 0, run.stderr);
});

function rendererHarness() {
  const source = readFrontendJavaScript();
  const start = source.indexOf('function renderInfiniteSet2336BitmaskView(step)');
  const end = source.indexOf('const PRIMARY_VISUALIZATION_SURFACES', start);
  const element = { querySelector: () => ({ querySelector: () => null }) };
  const context = { lang: 'vi', $: () => element, escapeHtml: String };
  context.pick = value => value[context.lang];
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  return { context, element };
}

test('2336 bitmask renders every frame with correct membership in both languages', () => {
  const { context, element } = rendererHarness();
  const steps = problem.builder2(problem.defaultInput).steps;
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const step of steps) {
      context.renderInfiniteSet2336BitmaskView(step);
      assert.match(element.innerHTML, /inf2336-bm-calculation/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
      const view = step.infiniteSet2336BitmaskView;
      for (let k = 1; k <= view.width; k++) {
        const bit = Number((BigInt(view.removed) >> BigInt(k - 1)) & 1n);
        assert.ok(element.innerHTML.includes(`data-value="${k}" data-bit="${bit}" data-present="${!bit}"`));
      }
      if (view.event === 'set-removed') assert.match(element.innerHTML, /just-popped/);
      if (view.event === 'clear-removed') assert.match(element.innerHTML, /just-added/);
    }
  }
});

test('2336 renderer explains cropped high-bit calculations without creating 1000 cells', () => {
  const { context, element } = rendererHarness();
  context.lang = 'en';
  const step = problem.builder2([['addBack', 1000]]).steps.find(s => s.infiniteSet2336BitmaskView.event === 'check-removed');
  context.renderInfiniteSet2336BitmaskView(step);
  assert.match(element.innerHTML, /Already present/);
  assert.match(element.innerHTML, /Bit 999 for number 1000 is outside the preview/);
  assert.match(element.innerHTML, /2\^999/);
  assert.equal((element.innerHTML.match(/data-value=/g) || []).length, 16);
  assert.equal((element.innerHTML.match(/class="inf2336-bm-digit/g) || []).length, 24);
  const registry = readFrontendJavaScript().slice(readFrontendJavaScript().indexOf('const ORDERED_RENDERER_REGISTRY'));
  assert.ok(registry.indexOf('step.infiniteSet2336BitmaskView') < registry.indexOf('step.hardProblemView'));
});
