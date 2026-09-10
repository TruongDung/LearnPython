const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[407];

const examples = [
  { input: '1,4,3,1,3,2;3,2,1,3,2,4;2,3,3,2,3,1', map: [[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]], answer: 4 },
  { input: '3,3,3,3,3;3,2,2,2,3;3,2,1,2,3;3,2,2,2,3;3,3,3,3,3', map: [[3,3,3,3,3],[3,2,2,2,3],[3,2,1,2,3],[3,2,2,2,3],[3,3,3,3,3]], answer: 10 },
  { input: '5,5,5;5,1,5;5,5,5', map: [[5,5,5],[5,1,5],[5,5,5]], answer: 4 },
  { input: '1,1,1;1,3,1;1,1,1', map: [[1,1,1],[1,3,1],[1,1,1]], answer: 0 },
];

test('407 returns the expected water for examples and simple basins', () => {
  assert.equal(problem.debugMode, 'line-by-line');
  for (const example of examples) {
    const result = problem.builder(example.input);
    assert.equal(result.answer, example.answer);
    assert.deepEqual(result.original, example.map);
    assert.equal(result.steps.at(-1).final, true);
    const final = result.steps.at(-1).trapRain2View;
    assert.equal(final.total, example.answer);
    assert.equal(final.processedCount, example.map.length * example.map[0].length);
    assert.equal(final.heapSize, 0);
  }
});

test('407 trace distinguishes frontier, processed cells, and each water decision', () => {
  const result = problem.builder(examples[0].input);
  for (const step of result.steps) {
    const view = step.trapRain2View;
    assert.ok(view, 'every normal-grid step has the custom view');
    assert.equal(view.frontier.length, view.heapSize);
    assert.equal(new Set(view.frontier.map(cell => `${cell.r},${cell.c}`)).size, view.heapSize);
    assert.equal(view.waterAt.flat().reduce((sum, value) => sum + value, 0), view.total);
    assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
    for (const cell of view.frontier) assert.equal(view.processed[cell.r][cell.c], false);

    if (!['trap', 'push'].includes(view.phase)) continue;
    assert.equal(view.trapped, Math.max(0, view.wall - view.cellHeight));
    assert.equal(view.newWall, Math.max(view.wall, view.cellHeight));
    assert.equal(view.waterBefore + view.trapped, view.total);
    assert.equal(view.surfaceAt[view.neighbor.r][view.neighbor.c], view.newWall);
  }
});

test('407 displayed Python matches the visualizer answers', () => {
  const source = `${problem.code.join('\n')}
import json, sys
for case in json.load(sys.stdin):
    assert Solution().trapRainWater(case['map']) == case['answer'], case
`;
  const python = spawnSync('python', ['-c', source], {
    input: JSON.stringify(examples), encoding: 'utf8',
  });
  assert.equal(python.status, 0, python.stderr);
});

test('407 simplified renderer teaches one rule in every phase and language', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderTrapRain2View(step)');
  const end = source.indexOf('\nfunction renderMissingIntegerView', start);
  const element = {};
  const context = { lang: 'en', $: () => element, escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);

  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of problem.builder(examples[0].input).steps) {
      context.renderTrapRain2View(step);
      assert.match(element.innerHTML, /rain2-story/);
      assert.match(element.innerHTML, /rain2-cell-state/);
      assert.match(element.innerHTML, /MIN-HEAP/);
      assert.match(element.innerHTML, /trw407-rule/);
      assert.match(element.innerHTML, /trw407-focus/);
      assert.match(element.innerHTML, /water = max\(0,/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('407 compact cell CSS keeps the level visible instead of clipping it', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.trw407-viz\.simple \.trw407-grid \{[\s\S]*?minmax\(78px, 1fr\)/);
  assert.match(css, /\.trw407-viz\.simple \.trw407-cell \{[\s\S]*?overflow: visible;/);
  assert.match(css, /\.trw407-viz\.simple \.trw407-cell > footer \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) auto;/);
});

test('407 expands semantic snapshots so only one code line is active per debug step', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function shouldUseLineByLineDebug()');
  const end = source.indexOf('\n// ---- Run algorithm ----', start);
  const context = {
    problemData: { id: 407, debugMode: problem.debugMode },
    debugBreakpoints: new Set(),
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);

  const raw = problem.builder(examples[0].input).steps;
  const expanded = context.expandStepsLineByLine(raw);
  assert.equal(context.shouldUseLineByLineDebug(), true);
  assert.ok(expanded.length > raw.length);
  assert.ok(expanded.every(step => !step.codeLines || step.codeLines.length <= 1));
  assert.equal(expanded.filter(step => step.final).length, 1);
});
