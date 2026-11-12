'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendStyles } = require('./helpers/frontend-source');

const problem = SUPPORTED[432];
const RENDERER = fs.readFileSync(require.resolve('../public/renderer-all-one-432.js'), 'utf8');

function renderer(lang) {
  const host = { innerHTML: '' };
  const context = { lang, document: { getElementById: () => host } };
  vm.createContext(context);
  vm.runInContext(RENDERER, context);
  return {
    cases: vm.runInContext('AO432_CASES', context),
    render(step, steps, index) {
      context.steps = steps;
      context.stepIndex = index;
      context.renderAllOne432View(step);
      return host.innerHTML;
    },
  };
}

function oracle(input) {
  const counts = new Map();
  return input.split('|').map((part) => part.trim().split(/\s+/)).map(([op, key]) => {
    if (op === 'inc') counts.set(key, (counts.get(key) || 0) + 1);
    if (op === 'dec' && counts.has(key)) {
      if (counts.get(key) === 1) counts.delete(key);
      else counts.set(key, counts.get(key) - 1);
    }
    if (op === 'getMaxKey' || op === 'getMinKey') {
      if (!counts.size) return [''];
      const values = [...counts.values()];
      const best = op === 'getMaxKey' ? Math.max(...values) : Math.min(...values);
      return [...counts].filter(([, count]) => count === best).map(([name]) => name);
    }
    return null;
  });
}

test('432 presets return valid answers and the full-tour preset executes every non-blank source line', () => {
  const { cases } = renderer('en');
  assert.equal(cases[0][0], problem.defaultInput);
  for (const [input] of cases) {
    const result = problem.builder(input);
    oracle(input).forEach((expected, index) => {
      if (expected === null) assert.equal(result.answer[index], null);
      else assert.ok(expected.includes(result.answer[index]), `${input} #${index}`);
    });
    assert.equal(result.steps.filter((step) => step.final).length, 1);
  }
  const visited = new Set(problem.builder(cases[1][0]).steps.map((step) => step.codeLines[0]));
  const missing = problem.code.flatMap((text, index) => (text.trim() && !visited.has(index + 1) ? [index + 1] : []));
  assert.deepEqual(missing, []);
});

test('432 default example shows several buckets, several of them holding multiple keys', () => {
  const views = problem.builder(problem.defaultInput).steps.map((step) => step.allOne432View);
  const real = (view) => view.structure.order.map((id) => view.structure.buckets.find((b) => b.id === id)).filter((b) => !b.sentinel);
  assert.ok(Math.max(...views.map((view) => real(view).length)) >= 4, 'at least 4 linked buckets at once');
  assert.ok(Math.max(...views.map((view) => real(view).filter((b) => b.keys.length >= 2).length)) >= 3, '3 multi-key buckets at once');
  assert.ok(Math.max(...views.map((view) => Math.max(0, ...real(view).map((b) => b.keys.length)))) >= 3, 'a bucket with 3+ keys');
  const events = new Set(views.map((view) => view.event));
  for (const event of ['insert-call', 'remove-call', 'count-one-present', 'dec-complete', 'extreme-key-return']) {
    assert.ok(events.has(event), event);
  }
});

test('432 renders every frame in both languages with the executed line number and short notes', () => {
  for (const lang of ['vi', 'en']) {
    const ui = renderer(lang);
    for (const [input] of ui.cases) {
      const { steps } = problem.builder(input);
      const saved = JSON.stringify(steps);
      steps.forEach((step, index) => {
        const html = ui.render(step, steps, index);
        const view = step.allOne432View;
        const line = step.codeLines[0];
        assert.ok(step.note[lang].length <= 40, `short note: ${step.note[lang]}`);
        assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object/, `${lang} ${input} #${index}`);
        assert.ok(html.includes(`data-source-line="${line}"`));
        assert.ok(html.includes(`<div class="ao432-now" data-code-line="${line}" aria-current="step"><span class="ao432-lineno">L${line}</span>`), `line ${line} shown`);
        assert.equal((html.match(/data-code-line=/g) || []).length, 1);
        assert.doesNotMatch(html, /ao432-lines|def inc\(self/, 'source is shown only in the shared #codePanel');
        for (const id of view.structure.order) assert.ok(html.includes(`data-bucket-id="${id}"`), `bucket ${id} drawn`);
        for (const { key } of view.maps.keyCount) assert.ok(html.includes(`data-map-key="${key}"`));
        if (view.condition.result !== null) assert.match(html, /ao432-branch is-(true|false)/);
        if (view.mutation.kind === 'pointer-write' && view.mutation.to) {
          assert.ok(html.includes(`ao432-ptr is-${view.mutation.field} is-written`), `written pointer at #${index}`);
        }
      });
      assert.equal(JSON.stringify(steps), saved, 'rendering does not mutate steps');
    }
  }
});

test('432 assets are wired with light and dark theme tokens', () => {
  const index = readFrontendIndex();
  const css = readFrontendStyles();
  assert.match(index, /all-one-432\.css\?v=all-one-432-v5/);
  assert.match(index, /renderer-all-one-432\.js\?v=all-one-432-v5/);
  assert.match(css, /\.ao432-viz \{[^}]*--ao432-bg:/s);
  assert.match(css, /\[data-theme="light"\] \.ao432-viz \{[^}]*--ao432-bg:/s);
  assert.equal(problem.debugMode, 'line-by-line');
});
