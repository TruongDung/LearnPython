const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');

const { SUPPORTED, CATEGORY_ORDER } = require('../problems');

test('545, 549 and 742 are registered with dedicated metadata', () => {
  assert.equal(SUPPORTED[545].slug, 'boundary-of-binary-tree');
  assert.equal(SUPPORTED[549].slug, 'binary-tree-longest-consecutive-sequence-ii');
  assert.equal(SUPPORTED[742].slug, 'closest-leaf-in-a-binary-tree');
  assert.ok(CATEGORY_ORDER['binary-tree'].order.includes(545));
  assert.ok(CATEGORY_ORDER['binary-tree'].order.includes(549));
  assert.ok(CATEGORY_ORDER['binary-tree'].order.includes(742));
});

test('545 returns the anti-clockwise boundary without duplicate leaves', () => {
  const p = SUPPORTED[545];
  assert.deepEqual(p.builder('1,2,3,4,5,6,7').answer, [1, 2, 4, 5, 6, 7, 3]);
  assert.deepEqual(p.builder('1,2,null,3,null,4').answer, [1, 2, 3]);
  assert.deepEqual(p.builder('1').answer, [1]);
  assert.ok(p.builder(p.defaultInput).steps.some(step => step.boundary545View.operation === 'add-left'));
  assert.ok(p.builder(p.defaultInput).steps.some(step => step.boundary545View.operation === 'add-right'));
});

test('549 computes increasing/decreasing paths through a node', () => {
  const p = SUPPORTED[549];
  assert.equal(p.builder('1,2,3,3,4,2,4').answer, 3);
  assert.equal(p.builder('2,1,3').answer, 3);
  assert.equal(p.builder('1').answer, 1);
  assert.ok(p.builder(p.defaultInput).steps.some(step => step.consecutive549View.operation === 'update-best'));
});

test('742 finds the closest leaf using parent-aware BFS', () => {
  const p = SUPPORTED[742];
  assert.equal(p.builder('1,2,3,null,4,5,6', { k: 2 }).answer, 4);
  assert.equal(p.builder('1,2,3,null,4,5,6', { k: 1 }).answer, 4);
  assert.equal(p.builder('1,2,3,null,4,5,6', { k: 3 }).answer, 5);
  assert.equal(p.builder('1', { k: 1 }).answer, 1);
  assert.throws(() => p.builder('1,2', { k: 9 }), /exists in the tree/);
});

test('545/549/742 renderers cover all states in both languages', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderTreeFamilyView(step, id, key');
  const end = source.indexOf('\nfunction renderClosestBst272View(step)', start);
  assert.ok(start >= 0 && end > start);
  const elements = new Map();
  const elementFor = id => { if (!elements.has(id)) elements.set(id, { innerHTML: '', classList: { add() {}, remove() {} } }); return elements.get(id); };
  const context = { lang: 'en', $: elementFor, escapeHtml: value => String(value ?? ''), pick: value => value?.en ?? value?.vi ?? value ?? '', renderTree: (_step, id) => { elementFor(id).innerHTML = '<svg class="tree-svg"></svg>'; } };
  vm.createContext(context); vm.runInContext(source.slice(start, end), context);
  const cases = [
    [545, 'boundary545View', 'renderBoundary545View', SUPPORTED[545].builder('1,2,3,4,5,6,7')],
    [549, 'consecutive549View', 'renderConsecutive549View', SUPPORTED[549].builder('1,2,3,3,4,2,4')],
    [742, 'closestLeaf742View', 'renderClosestLeaf742View', SUPPORTED[742].builder('1,2,3,null,4,5,6', { k: 2 })],
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const [id, key, fn, run] of cases) {
      for (const step of run.steps) { context[fn](step); const html = elementFor('treeView').innerHTML; assert.match(html, new RegExp(`bt${id}-viz`)); assert.match(html, /tree-family/); assert.doesNotMatch(html, /undefined|NaN|Infinity/); assert.match(elementFor(`bt${id}Tree`).innerHTML, /tree-svg/); }
    }
  }
});
