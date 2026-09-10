const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[2360];

const cases = [
  ['[3,3,4,2,3]', [3, 3, 4, 2, 3], 3],
  ['[2,-1,3,1]', [2, -1, 3, 1], -1],
  ['1,2,0', [1, 2, 0], 3],
  ['0', [0], 1],
  ['-1', [-1], -1],
];

test('2360 returns the longest cycle for examples and edge cases', () => {
  assert.equal(problem.debugMode, 'line-by-line');
  for (const [input, edges, answer] of cases) {
    const result = problem.builder(input);
    assert.deepEqual(result.original, edges);
    assert.equal(result.answer, answer);
    assert.equal(result.steps.at(-1).cycle2360View.longest, answer);
    assert.equal(result.steps.at(-1).final, true);
  }
});

test('2360 trace separates global visited state from the current path', () => {
  const result = problem.builder(cases[0][0]);
  assert.ok(result.steps.every(step => step.cycle2360View));
  assert.ok(result.steps.every(step => step.codeLines.every(line => line >= 1 && line <= problem.code.length)));

  const found = result.steps.find(step => step.cycle2360View.event === 'cycle');
  assert.ok(found);
  assert.deepEqual(found.cycle2360View.cycle, [3, 2, 4]);
  assert.equal(found.cycle2360View.path.length, 4);
  assert.equal(found.cycle2360View.repeatAt, 1);
  assert.equal(found.cycle2360View.cycleLength, 3);
  assert.equal(found.cycle2360View.path.length - found.cycle2360View.repeatAt, found.cycle2360View.cycleLength);
});

test('2360 displayed Python agrees with the visualization', () => {
  const source = `from typing import List\n${problem.code.join('\n')}\n` + cases.map(([, edges, answer]) => (
    `assert Solution().longestCycle(${JSON.stringify(edges)}) == ${answer}`
  )).join('\n');
  const python = spawnSync('python', ['-c', source], { encoding: 'utf8' });
  assert.equal(python.status, 0, python.stderr);
});

test('2360 custom renderer explains every event in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderCycle2360View(step)');
  const end = source.indexOf('\n// ---- Graph renderer', start);
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: String,
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);

  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const [input] of cases.slice(0, 2)) {
      for (const step of problem.builder(input).steps) {
        context.renderCycle2360View(step);
        assert.match(element.innerHTML, /lc2360-viz/);
        assert.match(element.innerHTML, /lc2360-rule/);
        assert.match(element.innerHTML, /lc2360-path/);
        assert.match(element.innerHTML, /lc2360-node/);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
      }
    }
  }
});

test('2360 line-by-line expansion activates at most one code line', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function shouldUseLineByLineDebug()');
  const end = source.indexOf('\n// ---- Run algorithm ----', start);
  const context = {
    problemData: { id: 2360, debugMode: problem.debugMode },
    debugBreakpoints: new Set(),
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);

  const raw = problem.builder(cases[0][0]).steps;
  const expanded = context.expandStepsLineByLine(raw);
  assert.ok(expanded.length > raw.length);
  assert.ok(expanded.every(step => !step.codeLines || step.codeLines.length <= 1));
  assert.equal(expanded.filter(step => step.final).length, 1);
});

test('2360 has responsive, scoped styles for path, cycle, and node states', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.lc2360-viz \{/);
  assert.match(css, /\.lc2360-path > div \{[\s\S]*?overflow-x: auto;/);
  assert.match(css, /\.lc2360-node\.cycle \{/);
  assert.match(css, /@container \(max-width: 430px\)/);
  assert.match(css, /\.code-mode-bar \{[\s\S]*?padding:\s*4px 4px 0;/);
});
