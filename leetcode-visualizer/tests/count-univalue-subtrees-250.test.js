const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const { SUPPORTED } = require('../problems');

test('250 is registered as a postorder DFS and tree-DP lesson', () => {
  const problem = SUPPORTED[250];
  assert.equal(problem.slug, 'count-univalue-subtrees');
  assert.equal(problem.debugMode, 'semantic');
  assert.ok(problem.tags.some(tag => tag.key === 'dfs'));
  assert.ok(problem.tags.some(tag => tag.key === 'tree-dp'));
  assert.equal(problem.approach.length, 3);
});

test('250 matches representative univalue-subtree counts', () => {
  const problem = SUPPORTED[250];
  assert.equal(problem.builder('5,1,5,5,5,null,5').answer, 4);
  assert.equal(problem.builder('1').answer, 1);
  assert.equal(problem.builder('').answer, 0);
  assert.equal(problem.builder('1,1,1,1,1').answer, 5);
  assert.equal(problem.builder('5,5,5,5,5,5,5').answer, 7);
});

test('250 trace explains every postorder verdict and count increment', () => {
  const run = SUPPORTED[250].builder('5,1,5,5,5,null,5');
  const views = run.steps.map(step => step.univalue250View);
  assert.equal(views.filter(view => view.operation === 'enter').length, 6);
  assert.equal(views.filter(view => view.operation === 'evaluate').length, 6);
  assert.equal(views.filter(view => view.operation === 'count').length, 4);
  assert.equal(views.filter(view => view.operation === 'reject').length, 2);
  assert.equal(views.at(-1).answer, 4);
  assert.equal(views.at(-1).statuses.filter(item => item.state === 'univalue').length, 4);
  assert.ok(run.steps.every(step => step.codeLines.every(line => line >= 1 && line <= SUPPORTED[250].code.length)));
});

test('250 custom renderer handles every state in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderUnivalue250View(step)');
  const end = script.indexOf('\nfunction renderUpsideDown156View(step)', start);
  assert.ok(start >= 0 && end > start);
  assert.match(script, /step\.univalue250View[\s\S]*renderUnivalue250View\(step\)/);

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

  const run = SUPPORTED[250].builder(SUPPORTED[250].defaultInput);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderUnivalue250View(step);
      const html = elementFor('treeView').innerHTML;
      assert.match(html, /uv250-viz/);
      assert.match(html, /uv250-phases/);
      assert.match(html, /uv250-tree-card/);
      assert.match(html, /RECURSION STACK/);
      assert.doesNotMatch(html, /undefined|NaN|Infinity/);
    }
  }
});

test('250 includes scoped responsive styles for decision states', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.uv250-viz/);
  assert.match(css, /\.uv250-checks/);
  assert.match(css, /\.uv250-tree \.tree-annotation\.reject/);
  assert.match(css, /\[data-theme="light"\] \.uv250-viz/);
  assert.match(css, /@container \(max-width: 440px\)[\s\S]*\.uv250-checks/);
});
