const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const problem = require('../problems').SUPPORTED[1137];
const values = [0, 1, 1];
for (let i = 3; i <= 37; i++) values[i] = values[i - 3] + values[i - 2] + values[i - 1];

function renderer(width) {
  const host = { innerHTML: '', clientWidth: width };
  const context = { lang: 'vi', $: () => host, escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderers-05.js'), 'utf8'), context);
  return { host, context };
}

test('1137 both approaches return every supported term and matching source values', () => {
  for (let n = 0; n <= 37; n++) for (const approach of [1, 2, '2']) {
    const run = problem.builder([n], { approach });
    assert.equal(run.answer, values[n]);
    assert.equal(run.steps[0].tribonacciView.approach, Number(approach));
    for (const step of run.steps) {
      const view = step.tribonacciView;
      for (const term of view.terms) if (term.value !== null) assert.equal(term.value, values[term.step]);
      if (view.formula) {
        assert.deepEqual(view.formula.values, values.slice(view.target - 3, view.target));
        assert.equal(view.formula.values.reduce((a, b) => a + b), view.formula.result);
      }
    }
  }
});

test('1137 every picture renders without expanding large values or mutating steps', () => {
  for (const width of [244, 550]) for (const n of [0, 1, 2, 3, 6, 10, 37]) for (const approach of [1, 2]) {
    const { host, context } = renderer(width);
    const run = problem.builder([n], { approach });
    const snapshot = JSON.stringify(run);
    for (const language of ['vi', 'en']) for (const step of run.steps) {
      context.lang = language;
      context.renderTribonacciView(step);
      assert.match(host.innerHTML, /<svg/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
      assert.ok((host.innerHTML.match(/class="tri1137-unit /g) || []).length <= 72);
      assert.ok((host.innerHTML.match(/class="tri1137-term /g) || []).length <= 7);
    }
    assert.equal(JSON.stringify(run), snapshot);
  }
});

test('1137 T(6) merges 2, 4, 7 blocks into 13 and slides b,c,next into a,b,c', () => {
  const { host, context } = renderer(550);
  const step = problem.builder([6], { approach: 2 }).steps.find(s => s.tribonacciView.target === 6 && !s.final);
  context.renderTribonacciView(step);
  const target = host.innerHTML.match(/<g class="tri1137-pool target"[\s\S]*?<\/g>/)[0];
  for (const [color, count] of [['first', 2], ['second', 4], ['third', 7]]) {
    assert.equal((target.match(new RegExp(`tri1137-unit ${color}`, 'g')) || []).length, count);
  }
  assert.match(host.innerHTML, /aria-label="a = 4, b = 7, c = 13"/);
  assert.equal((host.innerHTML.match(/class="tri1137-unit /g) || []).length, 26);
  assert.deepEqual(problem.defaultInput, [6]);
});
