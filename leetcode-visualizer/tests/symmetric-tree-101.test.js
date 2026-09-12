const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

test('101 Symmetric Tree handles value, shape, single-node, and empty cases', () => {
  const problem = SUPPORTED[101];
  assert.equal(problem.slug, 'symmetric-tree');
  assert.equal(problem.builder('1,2,2,3,4,4,3').answer, true);
  assert.equal(problem.builder('1,2,2,null,3,null,3').answer, false);
  assert.equal(problem.builder('1,2,2,3,4,3,4').answer, false);
  assert.equal(problem.builder('1').answer, true);
  assert.equal(problem.builder('[]').answer, true);
});

test('101 exposes each mirror comparison and the OUTER/INNER child pairs', () => {
  const problem = SUPPORTED[101];
  const run = problem.builder(problem.defaultInput);
  assert.ok(run.steps.length > 10);
  assert.ok(run.steps.every(step => step.treeEssentialsView?.problemId === 101));
  assert.ok(run.steps.every(step => step.treeEssentialsView.mode === 'symmetric-tree'));
  assert.ok(run.steps.every(step => step.treeEssentialsView.panels.length === 1));
  assert.ok(run.steps.every(step => step.treeEssentialsView.mirror?.current));
  assert.ok(run.steps.every(step => step.codeLines.every(line => line >= 1 && line <= problem.code.length)));

  const events = new Set(run.steps.map(step => step.treeEssentialsView.event));
  for (const event of ['intro', 'compare', 'expand', 'both-empty', 'return-pair', 'done']) assert.ok(events.has(event), event);

  const firstExpand = run.steps.find(step => step.treeEssentialsView.event === 'expand');
  const pairs = firstExpand.treeEssentialsView.mirror.nextPairs;
  assert.deepEqual(pairs.map(pair => pair.role), ['OUTER', 'INNER']);
  assert.equal(pairs[0].left.path, 'root.left.left');
  assert.equal(pairs[0].right.path, 'root.right.right');
  assert.equal(pairs[1].left.path, 'root.left.right');
  assert.equal(pairs[1].right.path, 'root.right.left');
  assert.equal(run.steps.at(-1).final, true);
  assert.equal(run.steps.at(-1).treeEssentialsView.status, 'match');
});

test('101 identifies the first concrete mismatch and shows short-circuiting', () => {
  const run = SUPPORTED[101].builder('1,2,2,null,3,null,3');
  assert.equal(run.answer, false);
  assert.ok(run.steps.some(step => step.treeEssentialsView.event === 'shape-mismatch'));
  assert.ok(run.steps.some(step => step.treeEssentialsView.event === 'short-circuit'));
  const last = run.steps.at(-1);
  assert.equal(last.treeEssentialsView.status, 'mismatch');
  assert.equal(last.treeEssentialsView.mirror.current.verdict, 'mismatch');
});

test('101 mirror renderer is readable in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderTreeEssentialsView(step)');
  const end = script.indexOf('\nfunction renderSortedListBstView(step)', start);
  assert.ok(start >= 0 && end > start);

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

  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of SUPPORTED[101].builder(SUPPORTED[101].defaultInput).steps) {
      context.renderTreeEssentialsView(step);
      const html = elementFor('treeView').innerHTML;
      assert.match(html, /te-viz te-symmetric-tree/);
      assert.match(html, /te-mirror-guide/);
      assert.match(html, /te-mirror-pair/);
      assert.match(html, /OUTER: L\.left ↔ R\.right/);
      assert.doesNotMatch(html, /NaN|undefined|Infinity/);
    }
  }

  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.te-mirror-guide/);
  assert.match(css, /\.te-mirror-branches/);
});
