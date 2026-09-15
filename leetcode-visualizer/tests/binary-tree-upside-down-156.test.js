const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const { SUPPORTED } = require('../problems');

test('156 is registered as a dedicated recursive pointer-rewiring lesson', () => {
  const problem = SUPPORTED[156];
  assert.equal(problem.slug, 'binary-tree-upside-down');
  assert.equal(problem.debugMode, 'semantic');
  assert.ok(problem.tags.some(tag => tag.key === 'dfs'));
  assert.equal(problem.approach.length, 3);
});

test('156 returns the expected upside-down trees', () => {
  const problem = SUPPORTED[156];
  assert.deepEqual(problem.builder('1,2,3,4,5').answer, [4, 5, 2, null, null, 3, 1]);
  assert.deepEqual(problem.builder('1,2,3').answer, [2, 3, 1]);
  assert.deepEqual(problem.builder('1').answer, [1]);
  assert.deepEqual(problem.builder('').answer, []);
});

test('156 trace separates descent, base case, preparation, rewiring, and completion', () => {
  const run = SUPPORTED[156].builder('1,2,3,4,5');
  const views = run.steps.map(step => step.upsideDown156View);
  assert.deepEqual(views.map(view => view.operation), [
    'explain', 'descend', 'descend', 'base',
    'prepare', 'rewired', 'prepare', 'rewired', 'done',
  ]);
  assert.deepEqual(views.find(view => view.operation === 'base').stack, [1, 2, 4]);
  assert.deepEqual(views.filter(view => view.operation === 'rewired').map(view => view.pivot), [
    { parent: 2, parentId: 1, left: 4, leftId: 3, right: 5, rightId: 4 },
    { parent: 1, parentId: 0, left: 2, leftId: 1, right: 3, rightId: 2 },
  ]);
  assert.deepEqual(views.at(-1).currentValues, [4, 5, 2, null, null, 3, 1]);
  assert.ok(run.steps.every(step => step.codeLines.every(line => line >= 1 && line <= SUPPORTED[156].code.length)));
});

test('156 custom renderer handles every state in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderUpsideDown156View(step)');
  const end = script.indexOf('\nfunction renderTree(step, targetId = "treeView")', start);
  assert.ok(start >= 0 && end > start);
  assert.match(script, /step\.upsideDown156View[\s\S]*renderUpsideDown156View\(step\)/);

  const elements = new Map();
  const elementFor = id => {
    if (!elements.has(id)) elements.set(id, { innerHTML: '' });
    return elements.get(id);
  };
  const context = {
    lang: 'en',
    $: elementFor,
    escapeHtml: value => String(value ?? ''),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
    renderTree: (_step, targetId) => { elementFor(targetId).innerHTML = '<svg class="tree-svg"></svg>'; },
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  const run = SUPPORTED[156].builder(SUPPORTED[156].defaultInput);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderUpsideDown156View(step);
      const html = elementFor('treeView').innerHTML;
      assert.match(html, /ud156-viz/);
      assert.match(html, /ud156-phases/);
      assert.match(html, /ud156-tree-panel/);
      assert.match(html, /RECURSION STACK/);
      assert.doesNotMatch(html, /undefined|NaN|Infinity/);
    }
  }
});

test('156 includes scoped responsive styles for the teaching states', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.ud156-viz/);
  assert.match(css, /\.ud156-rotation/);
  assert.match(css, /\.ud156-tree/);
  assert.match(css, /\[data-theme="light"\] \.ud156-viz/);
  assert.match(css, /@container \(max-width: 430px\)[\s\S]*\.ud156-rotation/);
});
