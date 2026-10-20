const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex } = require('./helpers/frontend-source');

const problem = SUPPORTED[2267];

function rendererHarness() {
  const host = { innerHTML: '' };
  const context = { lang: 'vi', $: () => host };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '..', 'public', 'renderer-valid-parentheses-path-2267.js'), 'utf8'),
    context,
  );
  return { context, host };
}

test('2267 visual renderer stays pictorial and complete in Vietnamese and English', () => {
  const { context, host } = rendererHarness();
  const runs = [problem.builder(problem.defaultInput), problem.builder('();()')];

  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const run of runs) for (const step of run.steps) {
      context.renderValidParenthesesPath2267View(step);
      assert.match(host.innerHTML, /vpp2267-stage/);
      assert.match(host.innerHTML, /vpp2267-grid-card/);
      if (!step.final && step.validParenthesesPath2267View.state.coordinate) {
        assert.match(host.innerHTML, /vpp2267-token-stack/);
        assert.match(host.innerHTML, /vpp2267-move/);
      }
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
      assert.doesNotMatch(host.innerHTML, /vpp2267-runtime-grid|vpp2267-memo-scroll|vpp2267-stack-scroll/);
    }
  }
});

test('2267 final frame draws the witness directly on the grid and as a balance strip', () => {
  const { context, host } = rendererHarness();
  const run = problem.builder(problem.defaultInput);
  const final = run.steps.at(-1);
  context.renderValidParenthesesPath2267View(final);

  assert.equal(run.answer, true);
  assert.equal((host.innerHTML.match(/vpp2267-is-witness/g) || []).length, run.witness.cells.length);
  assert.equal((host.innerHTML.match(/class="vpp2267-step"/g) || []).length, run.witness.cells.length);
  assert.equal((host.innerHTML.match(/<li><span>[()]<\/span><small>/g) || []).length, run.witness.cells.length);
  assert.match(host.innerHTML, /vpp2267-answer-true/);
  assert.match(host.innerHTML, /✓/);
});

test('2267 visual assets use the revised cache key and responsive layout', () => {
  const html = readFrontendIndex();
  const css = fs.readFileSync(path.join(__dirname, '..', 'public', 'valid-parentheses-path-2267.css'), 'utf8');
  assert.match(html, /valid-parentheses-path-2267\.css\?v=valid-parentheses-path-2267-v3/);
  assert.match(html, /renderer-valid-parentheses-path-2267\.js\?v=valid-parentheses-path-2267-v3/);
  assert.match(html, /ac=valid-parentheses-path-2267-v3/);
  assert.match(css, /@container vpp2267 \(max-width: 760px\)/);
  assert.match(css, /\[data-theme="light"\] \.vpp2267-viz/);
});
