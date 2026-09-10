const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const problem = require('../problems').SUPPORTED[994];

test('994 solves the standard, impossible, and already-finished cases', () => {
  const cases = [
    ['2,1,1|1,1,0|0,1,1', 4],
    ['2,1,1|0,1,1|1,0,1', -1],
    ['0,2', 0],
  ];

  for (const [input, answer] of cases) {
    const result = problem.builder(input);
    assert.equal(result.answer, answer);
    assert.ok(result.steps.every(step => step.rottingOrangesView));
  }
});

test('994 light theme keeps labels, empty cells, and state panels legible', () => {
  const css = fs.readFileSync(path.join(__dirname, '../public/style.css'), 'utf8');

  assert.match(css, /\[data-theme="light"\] \.rotting-phases span \{ color: #475569; \}/);
  assert.match(css, /\[data-theme="light"\] \.rotting-status small,[\s\S]*?\.rotting-action span \{ color: #475569; \}/);
  assert.match(css, /\[data-theme="light"\] \.rotting-cell\.is-empty \{ opacity: 1; background: #f1f5f9; \}/);
  assert.match(css, /\[data-theme="light"\] \.rotting-checks > span strong \{ color: #1e293b; \}/);
  assert.match(css, /\.rotting-direction small,[\s\S]*?font-size: 8px;/);
});
