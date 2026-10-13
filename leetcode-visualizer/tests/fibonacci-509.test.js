const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript, JAVASCRIPT_ASSETS, STYLESHEET_ASSETS } = require('./helpers/frontend-source');
const problem = SUPPORTED[509];
const values = [0, 1];
for (let i = 2; i <= 30; i++) values.push(values[i - 2] + values[i - 1]);

test('509 both approaches compute every supported n, including string selection', () => {
  for (let n = 0; n <= 30; n++) for (const approach of [1, 2, '2']) {
    const run = problem.builder([n], { approach });
    assert.equal(run.answer, values[n]);
    assert.equal(run.steps.at(-1).final, true);
    assert.equal(run.steps.at(-1).fibonacciView.stairs[n].ways, values[n]);
    assert.equal(run.steps[0].fibonacciView.approach, Number(approach));
  }
});

test('509 initialization and preview hide future values instead of showing false results', () => {
  for (const approach of [1, 2]) {
    const run = problem.builder([6], { approach });
    const first = run.steps[0];
    assert.equal(first.fibonacciView.phase, 'base');
    assert.ok(first.fibonacciView.stairs.slice(approach === 1 ? 1 : 2).every(term => term.ways === null));
    if (approach === 2) {
      assert.deepEqual(first.codeLines, [6]);
      assert.deepEqual(first.fibonacciView.rolling, { prev2: { step: 0, value: 0 }, prev1: { step: 1, value: 1 }, curr: null });
    }
    for (const step of run.steps) {
      const view = step.fibonacciView;
      if (view.phase === 'preview') assert.equal(view.stairs[view.target].ways, null);
      if (view.phase === 'calculate') {
        assert.equal(view.formula.result, view.formula.oneValue + view.formula.twoValue);
        assert.deepEqual(view.sources, [view.target - 2, view.target - 1]);
      }
      assert.ok(view.stairs.every(term => term.ways !== undefined));
    }
  }
});

test('509 rolling registers reflect assignments and retain curr after copies', () => {
  for (const step of problem.builder([10], { approach: 2 }).steps) {
    const view = step.fibonacciView;
    const { rolling, phase } = view;
    if (phase === 'shift-prev2') {
      assert.deepEqual(rolling.prev2, rolling.prev1);
      assert.equal(rolling.curr.value, values[rolling.curr.step]);
    }
    if (['shift-prev1', 'done'].includes(phase)) assert.deepEqual(rolling.prev1, rolling.curr);
    if (phase === 'preview' && view.target > 2) assert.deepEqual(rolling.curr, rolling.prev1);
    for (const item of Object.values(rolling)) if (item) assert.equal(item.value, values[item.step]);
  }
});

test('509 displayed Python matches both visual algorithms', () => {
  for (const approach of [1, 2]) {
    const code = approach === 1 ? problem.code : problem.code2;
    const cases = [0, 1, 2, 6, 10, 30].map(n => ({ n, expected: values[n] }));
    const source = `${code.join('\n')}\nimport json, sys\nfor case in json.load(sys.stdin):\n    assert Solution().fib(case['n']) == case['expected']`;
    const result = spawnSync('python3', ['-c', source], { input: JSON.stringify(cases), encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  }
});

function renderer(width = 260) {
  const host = { innerHTML: '', clientWidth: width };
  const context = { lang: 'en', $: () => host, escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-fibonacci-509.js'), 'utf8'), context);
  return { host, context };
}

test('509 pictures handle all phases, languages and large numbers with bounded dots', () => {
  const { host, context } = renderer();
  for (const approach of [1, 2]) for (const n of [0, 1, 2, 6, 30]) {
    const run = problem.builder([n], { approach });
    const original = JSON.stringify(run);
    for (const language of ['en', 'vi']) for (const step of run.steps) {
      context.lang = language;
      context.renderFibonacci509View(step);
      assert.match(host.innerHTML, /<svg/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object|<p>/);
      assert.ok((host.innerHTML.match(/<circle/g) || []).length <= 100);
      assert.ok((host.innerHTML.match(/class="fib509-term /g) || []).length <= 7);
      if (step.fibonacciView.phase === 'preview') {
        const target = host.innerHTML.match(/<g class="fib509-pool target [\s\S]*?<\/g>/)[0];
        assert.match(target, /data-value="\?"/);
        assert.doesNotMatch(target, /<circle|group-bar/);
      }
      if (step.fibonacciView.phase.startsWith('shift-')) {
        assert.match(host.innerHTML, /marker-end="url\(#fib509-copy-head\)"/);
        assert.doesNotMatch(host.innerHTML, /class="fib509-scene"/);
      }
    }
    assert.equal(JSON.stringify(run), original);
  }
});

test('509 default final picture combines three blue and five purple dots into eight', () => {
  const { host, context } = renderer(526);
  for (const approach of [1, 2]) {
    context.renderFibonacci509View(problem.builder([6], { approach }).steps.at(-1));
    assert.match(host.innerHTML, /F\(6\) = 8/);
    const target = host.innerHTML.match(/<g class="fib509-pool target [\s\S]*?<\/g>/)[0];
    assert.equal((target.match(/fib509-unit left/g) || []).length, 3);
    assert.equal((target.match(/fib509-unit right/g) || []).length, 5);
    assert.equal((host.innerHTML.match(/<circle/g) || []).length, 16);
  }
  context.renderFibonacci509View(problem.builder([30], { approach: 1 }).steps.at(-1));
  assert.match(host.innerHTML, /F\(30\) = 832040/);
  assert.match(host.innerHTML, /fib509-group-bar/);
});

test('509 dedicated assets remain lazy and use a short illustrated default', () => {
  assert.deepEqual(problem.defaultInput, [6]);
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-fibonacci-509.js'));
  assert.ok(STYLESHEET_ASSETS.includes('fibonacci-509.css'));
  assert.match(readFrontendJavaScript(), /renderFibonacci509View\(step\)/);
  assert.doesNotMatch(readFrontendIndex().replace(/<template[\s\S]*?<\/template>/g, ''), /(?:renderer-)?fibonacci-509\.(?:js|css)/);
});
