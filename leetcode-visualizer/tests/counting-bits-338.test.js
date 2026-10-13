const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript, JAVASCRIPT_ASSETS, STYLESHEET_ASSETS } = require('./helpers/frontend-source');
const problem = SUPPORTED[338];
const ones = n => [...n.toString(2)].filter(bit => bit === '1').length;
const source = fs.readFileSync(require.resolve('../public/renderer-counting-bits-338.js'), 'utf8');
function renderer(width = 340) {
  const host = { innerHTML: '', clientWidth: width };
  const context = { lang: 'en', $: () => host };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { host, context };
}

test('338 counts every supported number correctly, including zero without fallback', () => {
  assert.deepEqual(problem.builder([0]).answer, [0]);
  assert.deepEqual(problem.builder('0').answer, [0]);
  assert.deepEqual(problem.builder(0).answer, [0]);
  assert.deepEqual(problem.builder([5]).answer, [0, 1, 1, 2, 1, 2]);
  const run = problem.builder([256]);
  assert.deepEqual(run.answer, Array.from({ length: 257 }, (_, n) => ones(n)));
  assert.equal(run.steps.at(-1).final, true);
  assert.equal(run.steps[0].countBitsView.cells[0].value, 0);
  assert.ok(run.steps[0].countBitsView.cells.slice(1).every(cell => cell.value === null));
  for (const step of run.steps) {
    const view = step.countBitsView;
    assert.ok(view.cells.every(cell => cell.binary === cell.num.toString(2).padStart(view.width, '0')));
    if (view.phase === 'compute') {
      const f = view.formula;
      assert.equal(f.half, Math.floor(f.i / 2));
      assert.equal(f.lastBit, f.i % 2);
      assert.equal(f.halfValue, ones(f.half));
      assert.equal(f.result, f.halfValue + f.lastBit);
      assert.ok(view.cells.slice(f.i + 1).every(cell => cell.value === null));
    }
  }
});

test('338 rejects invalid numbers, multi-value input and oversized visualizations', () => {
  for (const input of [[], [1, 2], [-1], [1.2], [257], [NaN], [Infinity], [null], [true], '', 'bad', '1,2', null]) assert.throws(() => problem.builder(input), /338:/);
  assert.equal(problem.singleInput, true);
  assert.equal(problem.maxInput, 256);
});

test('338 displayed Python agrees with the visualization', () => {
  const cases = [0, 1, 5, 13, 64, 255, 256].map(n => ({ n, expected: problem.builder([n]).answer }));
  const code = `${problem.code.join('\n')}\nimport json,sys\nfor case in json.load(sys.stdin):\n    assert Solution().countBits(case['n']) == case['expected']`;
  const result = spawnSync('python3', ['-c', code], { input: JSON.stringify(cases), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('338 pictures handle zero, even/odd numbers, powers of two and all phases', () => {
  for (const width of [274, 340, 526]) {
    const { host, context } = renderer(width);
    for (const n of [0, 1, 5, 13, 64, 255, 256]) {
      const run = problem.builder([n]);
      const before = JSON.stringify(run);
      for (const language of ['en', 'vi']) for (const step of run.steps) {
        context.lang = language;
        context.renderCountingBits338View(step);
        assert.match(host.innerHTML, /<svg/);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object|CORE RULE|<p>/);
        assert.ok((host.innerHTML.match(/class="b338-term /g) || []).length <= 10);
        const i = step.countBitsView.currentIndex;
        if (i > 0) {
          assert.match(host.innerHTML, new RegExp(`aria-label="${i}: ${ones(i >> 1)} \\+ ${i & 1} = ${ones(i)}"`));
          const target = host.innerHTML.match(/<g class="b338-card target"[\s\S]*?<\/g>/)[0];
          assert.equal((target.match(/b338-dot left/g) || []).length, ones(i >> 1));
          assert.equal((target.match(/b338-dot right/g) || []).length, i & 1);
          assert.equal((host.innerHTML.match(/<circle/g) || []).length, ones(i) * 2);
        } else {
          assert.match(host.innerHTML, /dp\[0\] = 0/);
          assert.equal((host.innerHTML.match(/<circle/g) || []).length, 0);
        }
        if (step.countBitsView.phase === 'init' && n > 0) assert.match(host.innerHTML, /data-index="1" data-value="\?"/);
      }
      assert.equal(JSON.stringify(run), before);
    }
  }
});

test('338 reuses one resize observer and recomputes SVG geometry when width changes', () => {
  const { host, context } = renderer(526);
  let observations = 0;
  let callback;
  context.ResizeObserver = class { constructor(cb) { callback = cb; } observe() { observations++; } };
  host.querySelector = () => true;
  const step = problem.builder([13]).steps.at(-1);
  context.renderCountingBits338View(step);
  context.renderCountingBits338View(step);
  assert.equal(observations, 1);
  assert.match(host.innerHTML, /viewBox="0 0 500 /);
  host.clientWidth = 274;
  callback();
  assert.match(host.innerHTML, /viewBox="0 0 248 /);
  assert.equal(observations, 1);
});

test('338 loads its diagram assets lazily and wraps long answer/code text', () => {
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-counting-bits-338.js'));
  assert.ok(STYLESHEET_ASSETS.includes('counting-bits-338.css'));
  assert.match(readFrontendJavaScript(), /renderCountingBits338View\(step\)/);
  assert.doesNotMatch(readFrontendIndex().replace(/<template[\s\S]*?<\/template>/g, ''), /(?:renderer-)?counting-bits-338\.(?:js|css)/);
  const css = fs.readFileSync(require.resolve('../public/counting-bits-338.css'), 'utf8');
  assert.match(css, /#answer[^}]+white-space:pre-wrap;overflow-wrap:anywhere/);
});
