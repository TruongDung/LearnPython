const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript, readFrontendStyles } = require('./helpers/frontend-source');

const problem = SUPPORTED[2787];

function bruteForce(n, x) {
  const values = [];
  for (let base = 1; base ** x <= n; base += 1) values.push(base ** x);
  function count(index, total) {
    if (total === n) return 1;
    if (index === values.length || total > n) return 0;
    return count(index + 1, total) + count(index + 1, total + values[index]);
  }
  return count(0, 0);
}

function rendererHarness() {
  const host = { innerHTML: '' };
  const context = {
    lang: 'vi',
    $: () => host,
    escapeHtml: (value) => String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;'),
  };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '..', 'public', 'renderer-ways-to-express-powers-2787.js'), 'utf8'),
    context,
  );
  return { context, host };
}

test('2787 is registered and matches examples plus small brute-force cases', () => {
  assert.ok(problem);
  assert.equal(problem.builder(10, { x: 2 }).answer, 1);
  assert.equal(problem.builder(4, { x: 1 }).answer, 2);
  assert.equal(problem.builder(2, { x: 2 }).answer, 0);

  for (let x = 1; x <= 4; x += 1) {
    for (let n = 1; n <= 24; n += 1) {
      assert.equal(problem.builder(n, { x }).answer, bruteForce(n, x), `n=${n}, x=${x}`);
    }
  }
});

test('2787 validates n and x and exposes live arguments', () => {
  assert.deepEqual(problem.liveArgs(10, { x: 2 }), [10, 2]);
  assert.throws(() => problem.builder(0, { x: 2 }), /n must be an integer/);
  assert.throws(() => problem.builder(301, { x: 2 }), /n must be an integer/);
  assert.throws(() => problem.builder(10, { x: 0 }), /x must be an integer/);
  assert.throws(() => problem.builder(10, { x: 6 }), /x must be an integer/);
});

test('2787 trace shows a descending one-use update and a concrete witness', () => {
  const run = problem.builder(10, { x: 2 });
  const updatesForOne = run.steps
    .filter((step) => step.waysToExpressPowers2787View.event === 'move-ways')
    .map((step) => step.waysToExpressPowers2787View)
    .filter((view) => view.transition.base === 1);

  assert.deepEqual(updatesForOne.map((view) => view.total), [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
  assert.equal(updatesForOne.find((view) => view.total === 2).cells.find((cell) => cell.total === 2).ways, 0);
  assert.equal(updatesForOne.find((view) => view.total === 1).cells.find((cell) => cell.total === 1).ways, 1);
  assert.deepEqual(run.witness.map(({ base, value }) => [base, value]), [[1, 1], [3, 9]]);
  assert.equal(run.steps.at(-1).final, true);
});

test('2787 renderer remains picture-first in both languages', () => {
  const { context, host } = rendererHarness();
  const run = problem.builder(10, { x: 2 });
  const sample = [run.steps[0], run.steps.find((step) => step.waysToExpressPowers2787View.event === 'move-ways'), run.steps.at(-1)];

  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const step of sample) {
      context.renderWaysToExpressPowers2787View(step);
      assert.match(host.innerHTML, /wsp2787-stage/);
      assert.match(host.innerHTML, /wsp2787-powers/);
      assert.match(host.innerHTML, /wsp2787-map/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
      assert.doesNotMatch(host.innerHTML, /<table|<p[ >]/);
    }
  }

  context.renderWaysToExpressPowers2787View(run.steps.at(-1));
  assert.match(host.innerHTML, /wsp2787-equation/);
  assert.match(host.innerHTML, /wsp2787-answer/);
  assert.match(host.innerHTML, /<b>1<sup>2<\/sup><\/b>/);
  assert.match(host.innerHTML, /<b>3<sup>2<\/sup><\/b>/);
});

test('2787 assets, renderer registry, theme, and cache key are wired', () => {
  const html = readFrontendIndex();
  const js = readFrontendJavaScript();
  const css = readFrontendStyles();

  assert.match(html, /ways-to-express-powers-2787\.css\?v=ways-to-express-powers-2787-v1/);
  assert.match(html, /renderer-ways-to-express-powers-2787\.js\?v=ways-to-express-powers-2787-v1/);
  assert.match(html, /powers2787=picture-v1/);
  assert.match(js, /step\.waysToExpressPowers2787View/);
  assert.match(js, /renderWaysToExpressPowers2787View/);
  assert.match(css, /@container wsp2787 \(max-width: 620px\)/);
  assert.match(css, /\[data-theme="light"\] \.wsp2787-viz/);
});
