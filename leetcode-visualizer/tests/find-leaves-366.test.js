const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');

const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[366];

test('366 is registered with both the postorder and literal leaf-stripping approaches', () => {
  assert.equal(problem.id, 366);
  assert.equal(problem.slug, 'find-leaves-of-binary-tree');
  assert.equal(problem.category.key, 'binary-tree');
  assert.equal(problem.builder instanceof Function, true);
  assert.equal(problem.builder2 instanceof Function, true);
  assert.match(problem.code.join('\n'), /h = 1 \+ max\(dfs\(node\.left\), dfs\(node\.right\)\)/);
  assert.match(problem.code2.join('\n'), /while root:/);
});

test('366 groups leaves correctly for balanced, uneven, and single-node trees', () => {
  const cases = [
    ['1,2,3,4,5', [[4, 5, 3], [2], [1]]],
    ['1,2,3,4,null,null,5', [[4, 5], [2, 3], [1]]],
    ['1', [[1]]],
  ];
  for (const [input, expected] of cases) {
    assert.deepEqual(JSON.parse(problem.builder(input).answer), expected, input);
    assert.deepEqual(JSON.parse(problem.builder2(input).answer), expected, `${input} literal stripping`);
  }
});

test('366 postorder assigns each node its height-above-leaves group in one traversal', () => {
  const run = problem.builder('1,2,3,4,5');
  const views = run.steps.map((step) => step.leaves366View);
  const final = views.at(-1);

  assert.deepEqual(views.map((view) => view.phase), ['intro', 'visit', 'visit', 'visit', 'visit', 'visit', 'done']);
  assert.deepEqual(final.groups, [[4, 5, 3], [2], [1]]);
  assert.equal(final.counters.visits, 5);
  assert.equal(final.counters.passes, 1);
  assert.equal(final.resolved.length, 5);
  assert.deepEqual(
    views.filter((view) => view.phase === 'visit').map((view) => view.cur.h),
    [0, 0, 1, 0, 2],
  );
  assert.ok(run.steps.every((step) => step.codeLines.every((line) => line >= 1 && line <= problem.code.length)));
});

test('366 literal stripping removes one complete leaf group per round and matches postorder', () => {
  const fast = problem.builder('1,2,3,4,5');
  const literal = problem.builder2('1,2,3,4,5');
  const views = literal.steps.map((step) => step.leaves366View);
  const rounds = views.filter((view) => view.phase === 'round');
  const final = views.at(-1);

  assert.equal(literal.answer, fast.answer);
  assert.deepEqual(rounds.map((view) => view.groups.at(-1)), [[4, 5, 3], [2], [1]]);
  assert.equal(final.removed.length, 5);
  assert.equal(final.counters.passes, 3);
  assert.ok(final.counters.visits > final.counters.nodes);
  assert.ok(literal.steps.every((step) => step.codeLines.every((line) => line >= 1 && line <= problem.code2.length)));
});

test('366 validates empty and oversized tree input', () => {
  assert.throws(() => problem.builder(''), /at least one node/);
  assert.throws(() => problem.builder2(''), /at least one node/);
  assert.throws(() => problem.builder(Array.from({ length: 21 }, () => 1).join(',')), /at most 20 nodes/);
});

test('366 renderer covers both approaches in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('const LV366_GEOM =');
  const end = script.indexOf('\n// ---- 359 Logger Rate Limiter ----', start);
  assert.ok(start >= 0 && end > start);
  assert.match(script, /step\.leaves366View[\s\S]*renderLeaves366View\(step\)/);

  const elements = new Map();
  const elementFor = (id) => {
    if (!elements.has(id)) elements.set(id, { innerHTML: '' });
    return elements.get(id);
  };
  const context = {
    lang: 'en',
    $: elementFor,
    escapeHtml: (value) => String(value ?? ''),
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of [problem.builder('1,2,3,4,5'), problem.builder2('1,2,3,4,5')]) {
      for (const step of run.steps) {
        context.renderLeaves366View(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /lv366-viz/);
        assert.match(html, /lv366-tree/);
        assert.match(html, /lv366-groups/);
        assert.doesNotMatch(html, /undefined|NaN|Infinity/);
      }
    }
  }
});

test('366 ships the scoped responsive visualization styles', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.lv366-viz/);
  assert.match(css, /\.lv366-node\.removed/);
  assert.match(css, /\[data-theme="light"\] \.lv366-viz/);
});
