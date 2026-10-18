const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');

const problem = require('../problems').SUPPORTED[913];

function render(step, language = 'vi') {
  const treeView = { innerHTML: '' };
  const context = {
    lang: language,
    $: id => { assert.equal(id, 'treeView'); return treeView; },
    pick: value => value?.[language] ?? value?.en ?? value?.vi,
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-hard-problems.js'), 'utf8'), context);
  context.renderHardProblemView(step);
  return treeView.innerHTML;
}

test('913 solves the LeetCode examples', () => {
  assert.equal(problem.builder([[2, 5], [3], [0, 4, 5], [1, 4, 5], [2, 3], [0, 2, 3]]).answer, 0);
  assert.equal(problem.builder([[1, 3], [0], [3], [0, 2]]).answer, 1);
  assert.equal(problem.builder([[2], [2], [0, 1]]).answer, 2);
});

test('913 renders a complete mouse-row and cat-column state grid', () => {
  const graph = [[1, 2], [0, 2], [0, 1]];
  const result = problem.builder(graph);
  const seed = result.steps.find((step) => step.codeLines[0] === 23);
  const board = seed.hardProblemView.table;

  assert.equal(board.rows.length, graph.length);
  assert.equal(board.columns.length, 2 * (graph.length - 1));
  assert.deepEqual(board.columns.map((column) => column.vi), [
    '🐱1 · 🐭', '🐱1 · 🐱',
    '🐱2 · 🐭', '🐱2 · 🐱',
  ]);
  assert.equal(board.rows[0].cells[0].value, '🐭 2');
  assert.equal(board.rows[0].cells[0].state, 'info');
});

test('913 trace highlights one source line per step with matching line labels', () => {
  const result = problem.builder(problem.defaultInput);

  assert.equal(result.answer, 0);
  assert.ok(result.steps.length > 20);
  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  for (const step of result.steps) {
    const line = step.codeLines[0];
    assert.ok(line >= 1 && line <= problem.code.length);
    assert.notEqual(problem.code[line - 1].trim().startsWith('#'), true);
    assert.ok(step.title.vi.startsWith(`Dòng ${line}:`));
    assert.ok(step.title.en.startsWith(`Line ${line}:`));
  }
  assert.equal(result.steps.filter((step) => step.final).length, 1);
  assert.equal(result.steps.at(-1).codeLines[0], 53);
  assert.equal(result.steps.at(-1).hardProblemView.answer, 0);
});

test('913 emits illustrated game events and compact raw state data', () => {
  const result = problem.builder(problem.defaultInput);
  assert.deepEqual(
    result.steps[0].hardProblemView.catMouse913.activeChild,
    { mouse: 1, cat: 2, turn: 0, winner: 0, degree: 1 },
  );
  const events = new Set(result.steps.map(step => step.hardProblemView.catMouse913.event));
  for (const event of ['setup', 'mouse-hole', 'cat-catch', 'dequeue', 'skip', 'winning-move', 'prune-move', 'forced-loss', 'draws', 'result']) {
    assert.ok(events.has(event), event);
  }
  for (const step of result.steps) {
    const game = step.hardProblemView.catMouse913;
    assert.equal(game.nodeCount, 6);
    assert.ok(Array.isArray(game.edges));
    assert.ok(Array.isArray(game.queue));
    assert.ok(game.queue.length <= 10);
  }
  const propagation = result.steps.find(step => step.hardProblemView.catMouse913.event === 'winning-move');
  assert.ok(propagation.hardProblemView.catMouse913.activeChild);
  assert.ok(propagation.hardProblemView.catMouse913.activeParent);
  assert.ok(propagation.hardProblemView.catMouse913.activeEdge);
});

test('913 renderer is picture-first for propagation and draw result', () => {
  const result = problem.builder(problem.defaultInput);
  const propagation = result.steps.find(step => step.hardProblemView.catMouse913.event === 'winning-move');
  for (const language of ['vi', 'en']) {
    const html = render(propagation, language);
    assert.match(html, /safe913-viz/);
    assert.match(html, /safe913-board/);
    assert.match(html, /safe913-edge active/);
    assert.match(html, /safe913-transition/);
    assert.match(html, /safe913-queue/);
    assert.match(html, /safe913-matrices/);
    assert.doesNotMatch(html, /hp-banner|hp-table-scroll|undefined|NaN|object Object/);
  }
  const finalHtml = render(result.steps.at(-1), 'vi');
  assert.match(finalHtml, /safe913-result draw/);
  assert.match(finalHtml, />∞</);
  assert.match(finalHtml, />0</);
});

test('913 picture renderer and no-scroll styles are cache-busted', () => {
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  const css = fs.readFileSync(require.resolve('../public/hard-problems.css'), 'utf8');
  const renderer = fs.readFileSync(require.resolve('../public/renderer-hard-problems.js'), 'utf8');
  assert.match(html, /hard-problems\.css[^"\n]*cat913=picture-v1/);
  assert.match(html, /renderer-hard-problems\.js[^"\n]*cat913=picture-v1/);
  assert.match(css, /\.safe913-viz\s*\{/);
  assert.match(css, /body:has\(\.safe913-viz\) #stepNote/);
  assert.match(renderer, /function renderCatMouse913View\(step, view\)/);
  assert.match(renderer, /Number\(view\.problemId\) === 913/);
});
