const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const { readFrontendIndex, readFrontendJavaScript, readFrontendStyles } = require('./helpers/frontend-source');
const problem = require('../problems').SUPPORTED[22];

const build = n => problem.builder([n]);
const buildBitmask = n => problem.builder2([n], { approach: 2 });

function isValid(value, n) {
  if (value.length !== 2 * n) return false;
  let balance = 0;
  for (const char of value) {
    balance += char === '(' ? 1 : -1;
    if (balance < 0) return false;
  }
  return balance === 0;
}

test('22 is registered with line-by-line backtracking and bitmask approaches', () => {
  assert.equal(problem.id, 22);
  assert.equal(problem.slug, 'generate-parentheses');
  assert.equal(problem.category.key, 'backtracking');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.match(problem.complexity.time, /4ⁿ/);
  assert.equal(problem.code[1], '    def generateParenthesis(self, n: int) -> list[str]:');
  assert.equal(problem.code2[1], '    def generateParenthesis(self, n: int) -> list[str]:');
  assert.equal(typeof problem.builder2, 'function');
  assert.deepEqual(problem.extraParams[0].options.map(option => option.value), ['1', '2']);
});

test('22 matches the published examples in deterministic DFS order', () => {
  assert.deepEqual(build(1).answer, ['()']);
  assert.deepEqual(build(2).answer, ['(())', '()()']);
  assert.deepEqual(build(3).answer, ['((()))', '(()())', '(())()', '()(())', '()()()']);
});

test('22 produces every Catalan result exactly once', () => {
  const catalan = [0, 1, 2, 5, 14, 42];
  for (let n = 1; n <= 5; n++) {
    const answer = build(n).answer;
    assert.equal(answer.length, catalan[n]);
    assert.equal(new Set(answer).size, answer.length);
    assert.ok(answer.every(value => isValid(value, n)));
  }
});

test('22 bitmask approach produces the same Catalan set', () => {
  for (let n = 1; n <= 4; n++) {
    const expected = [...build(n).answer].sort();
    const answer = buildBitmask(n).answer;
    assert.deepEqual([...answer].sort(), expected);
    assert.equal(new Set(answer).size, answer.length);
    assert.ok(answer.every(value => isValid(value, n)));
  }
});

test('22 trace keeps every state valid and debugs one source line at a time', () => {
  const run = build(3);
  assert.ok(run.steps.some(step => step.generateParentheses22View.phase === 'blocked'));
  assert.ok(run.steps.some(step => step.generateParentheses22View.event === 'save-result'));
  assert.ok(run.steps.some(step => step.generateParentheses22View.event === 'pop-open'));
  assert.ok(run.steps.some(step => step.generateParentheses22View.event === 'pop-close'));

  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(step.codeLines[0] >= 2 && step.codeLines[0] <= problem.code.length);
    const view = step.generateParentheses22View;
    assert.ok(view);
    assert.ok(view.closed <= view.opened);
    assert.ok(view.opened <= view.n);
    assert.equal(view.path.length, view.opened + view.closed);
    for (const node of view.nodes) {
      assert.ok(node.closed <= node.opened);
      assert.ok(node.opened <= view.n);
      assert.equal(node.path.length, node.opened + node.closed);
    }
  }

  const final = run.steps.at(-1);
  assert.equal(final.final, true);
  assert.deepEqual(final.generateParentheses22View.results, run.answer);
  assert.equal(final.generateParentheses22View.stack.length, 0);
});

test('22 bitmask trace decodes bits, rejects bad prefixes, and debugs one line per frame', () => {
  const run = buildBitmask(3);
  assert.ok(run.steps.some(step => step.generateParentheses22View.event === 'read-bit'));
  assert.ok(run.steps.some(step => step.generateParentheses22View.event === 'mark-invalid'));
  assert.ok(run.steps.some(step => step.generateParentheses22View.event === 'save-result'));

  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(step.codeLines[0] >= 2 && step.codeLines[0] <= problem.code2.length);
    const view = step.generateParentheses22View;
    assert.equal(view.approach, 2);
    assert.equal(view.width, 6);
    assert.equal(view.totalMasks, 64);
    assert.ok(view.path.length <= view.width);
    assert.ok(view.inspected.length <= 10);
  }

  const final = run.steps.at(-1);
  assert.equal(final.final, true);
  assert.deepEqual(final.generateParentheses22View.results, run.answer);
  assert.equal(final.generateParentheses22View.inspected.length, 10);
});

test('22 validates the visualization range', () => {
  for (const value of [0, 6, -1, 1.5, NaN, 'abc']) {
    assert.throws(() => problem.builder([value]));
    assert.throws(() => problem.builder2([value], { approach: 2 }));
  }
});

test('22 renderer covers every step in English and Vietnamese', () => {
  const rendererPath = path.resolve(__dirname, '../public/renderer-generate-parentheses-22.js');
  const source = fs.readFileSync(rendererPath, 'utf8');
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;'),
    pick: value => typeof value === 'object' && value !== null
      ? (value[context.lang] || value.en || value.vi || '')
      : String(value ?? ''),
  };
  vm.createContext(context);
  vm.runInContext(source, context);

  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of build(3).steps) {
      context.renderGenerateParentheses22View(step);
      assert.match(element.innerHTML, /gp22-viz/);
      assert.match(element.innerHTML, /gp22-slots/);
      assert.match(element.innerHTML, /gp22-tree/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
    for (const step of buildBitmask(3).steps) {
      context.renderGenerateParentheses22View(step);
      assert.match(element.innerHTML, /gp22-viz/);
      assert.match(element.innerHTML, /gp22-bitmask-viz/);
      assert.match(element.innerHTML, /gp22-bit-rules/);
      assert.match(element.innerHTML, /gp22-mask-window/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('22 frontend assets, renderer registry, and responsive styles are wired', () => {
  const html = readFrontendIndex();
  const javascript = readFrontendJavaScript();
  const css = readFrontendStyles();
  assert.match(html, /generate-parentheses-22\.css/);
  assert.match(html, /renderer-generate-parentheses-22\.js/);
  assert.match(javascript, /step\.generateParentheses22View/);
  assert.match(javascript, /renderGenerateParentheses22View\(step\)/);
  assert.match(css, /\.gp22-viz \{/);
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /@container gp22 \(max-width:\s*650px\)/);
  assert.match(css, /\.gp22-bit-rules/);
  assert.match(css, /\.gp22-mask-window/);
});

