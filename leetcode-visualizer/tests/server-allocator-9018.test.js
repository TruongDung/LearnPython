const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[9018];

function oracle(inventory, operations) {
  const occupied = new Map();
  for (const name of inventory) {
    const separator = name.lastIndexOf('-');
    const type = name.slice(0, separator);
    if (!occupied.has(type)) occupied.set(type, new Set());
    occupied.get(type).add(Number(name.slice(separator + 1)));
  }
  return operations.split('|').map(call => {
    const [kind, arg] = call.trim().split(/\s+/);
    if (kind === 'deallocate') {
      const separator = arg.lastIndexOf('-');
      occupied.get(arg.slice(0, separator))?.delete(Number(arg.slice(separator + 1)));
      return null;
    }
    if (!occupied.has(arg)) occupied.set(arg, new Set());
    let id = 1;
    while (occupied.get(arg).has(id)) id++;
    occupied.get(arg).add(id);
    return `${arg}-${id}`;
  });
}

function harness(locale = 'vi') {
  const source = fs.readFileSync(path.join(__dirname, '..', 'public', 'renderer-server-allocator-9018.js'), 'utf8');
  const element = {};
  const context = { lang: locale, $: () => element };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, element };
}

const demo = () => problem.builder(problem.defaultInput, { operations: problem.extraParams[0].default });

test('9018 demo shows initial gaps, deallocation into a multi-node heap, reuse, and fresh IDs', () => {
  const run = demo();
  assert.deepEqual(run.answer, ['api-1', null, null, 'api-2', 'db-2', 'api-3', 'api-4', 'api-5', 'api-7']);
  assert.deepEqual(run.answer, oracle(JSON.parse(problem.defaultInput), problem.extraParams[0].default));
  const ready = run.steps.find(step => step.serverAllocator9018View.event === 'init-complete');
  assert.deepEqual(ready.serverAllocator9018View.types.find(type => type.serverType === 'api').heap, [1, 3, 5]);
  const release = run.steps.find(step => step.serverAllocator9018View.event === 'push-gap');
  assert.deepEqual(release.serverAllocator9018View.types.find(type => type.serverType === 'api').heap, [2, 5, 3]);
  assert.equal(run.steps.filter(step => step.final).length, 1);
});

test('9018 selects the smallest available number independently per type', () => {
  const inventory = ['api-v2-3', 'db-2'];
  const operations = 'allocate api-v2 | allocate db | deallocate api-v2-1 | deallocate api-v2-1 | deallocate unknown-1 | allocate api-v2 | allocate new-type';
  assert.deepEqual(problem.builder(JSON.stringify(inventory), { operations }).answer, oracle(inventory, operations));
});

test('9018 displayed Python agrees with the demo and duplicate deallocations', () => {
  const cases = [
    { inventory: JSON.parse(problem.defaultInput), operations: problem.extraParams[0].default },
    { inventory: [], operations: 'allocate api-v2 | deallocate api-v2-1 | deallocate api-v2-1 | allocate api-v2 | allocate db' },
  ];
  const inputs = cases.map(({ inventory, operations }) => ({
    inventory,
    calls: operations.split('|').map(call => call.trim().split(/\s+/)),
    expected: oracle(inventory, operations),
  }));
  const source = `${problem.code.join('\n')}
import json, sys
for case in json.load(sys.stdin):
    instance = ServerAllocator(case['inventory'])
    outputs = [getattr(instance, name)(arg) for name, arg in case['calls']]
    assert outputs == case['expected'], (outputs, case['expected'])
`;
  const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
  const run = spawnSync(python, ['-c', source], { input: JSON.stringify(inputs), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr || String(run.error));
});

test('9018 renderer draws every number line and exact binary heap shape in both languages', () => {
  const { context, element } = harness();
  for (const locale of ['vi', 'en']) {
    context.lang = locale;
    for (const step of demo().steps) {
      context.renderServerAllocator9018View(step);
      const html = element.innerHTML;
      const types = step.serverAllocator9018View.types;
      assert.doesNotMatch(html, /undefined|NaN|Infinity/);
      assert.equal((html.match(/<circle /g) || []).length, types.reduce((count, type) => count + type.heap.length, 0));
      assert.equal((html.match(/<line /g) || []).length, types.reduce((count, type) => count + Math.max(0, type.heap.length - 1), 0));
      if (types.length) assert.match(html, /… → ∞/);
      for (const type of types) {
        const normalized = context.sa9018Normalize(step);
        const normalizedType = normalized.types.find(row => row.serverType === type.serverType);
        const tree = context.sa9018HeapTree(normalizedType, normalized, {});
        type.heap.forEach((number, index) => assert.ok(tree.includes(`data-number="${number}" data-index="${index}"`)));
      }
    }
  }
});

test('9018 visualizes IDs in flight between used, heap, and the fresh cursor', () => {
  const { context, element } = harness('en');
  const steps = demo().steps;
  for (const event of ['pop-gap', 'remove-used', 'take-fresh', 'advance-next-id']) {
    const step = steps.find(step => step.serverAllocator9018View.event === event);
    const state = context.sa9018Normalize(step);
    const type = state.types.find(row => row.serverType === state.operation.serverType);
    const strip = context.sa9018IdLine(type, state, {});
    assert.ok(strip.includes(`data-number="${state.operation.number}" data-status="transit"`), event);
  }
  const added = steps.find(step => step.serverAllocator9018View.event === 'push-gap');
  context.renderServerAllocator9018View(added);
  assert.match(element.innerHTML, /sa9018-heap-node(?: root)? inserted/);
  assert.match(element.innerHTML, /deallocate\(&quot;api-2&quot;\)/);
  assert.match(element.innerHTML, /data-number="2" data-status="free"/);
  const allocated = steps.find(step => step.serverAllocator9018View.event === 'mark-used');
  context.renderServerAllocator9018View(allocated);
  assert.match(element.innerHTML, /data-number="1" data-status="used"/);
});

test('9018 all IDs beyond next_id are fresh and the strip follows high cursors', () => {
  const { context } = harness('en');
  const run = problem.builder('["api-32"]', { operations: Array(20).fill('allocate api').join(' | ') });
  const state = context.sa9018Normalize(run.steps.at(-1));
  const strip = context.sa9018IdLine(state.types[0], state, {});
  assert.match(strip, /data-number="33" data-status="fresh"/);
  assert.match(strip, /data-number="41" data-status="fresh"/);
  assert.match(strip, /… → ∞/);
});

test('9018 ignored deallocation leaves the heap unchanged and shows no transfer', () => {
  const { context, element } = harness('en');
  const run = problem.builder('["api-1"]', { operations: 'deallocate api-1 | deallocate api-1' });
  const step = run.steps.find(row => row.serverAllocator9018View.event === 'ignore-missing');
  assert.deepEqual(step.serverAllocator9018View.types[0].heap, [1]);
  context.renderServerAllocator9018View(step);
  assert.match(element.innerHTML, /Not allocated → ignore/);
  assert.match(element.innerHTML, /↛/);
  assert.doesNotMatch(element.innerHTML, /sa9018-heap-node inserted/);
});

test('9018 prioritizes the simulation and supplies responsive tree and strip styles', () => {
  const { context, element } = harness();
  context.renderServerAllocator9018View(demo().steps.at(-1));
  assert.ok(element.innerHTML.indexOf('sa9018-types') < element.innerHTML.indexOf('sa9018-source'));
  assert.match(element.innerHTML, /<details class="sa9018-details">/);
  const css = fs.readFileSync(path.join(__dirname, '..', 'public', 'server-allocator-9018.css'), 'utf8');
  assert.match(css, /\.sa9018-heap-scroll \{ overflow-x: auto/);
  assert.match(css, /\.sa9018-id-line li\.used strong \{ text-decoration: line-through/);
  assert.match(css, /@container sa9018 \(max-width: 590px\)/);
  assert.match(css, /\[data-theme="light"\] \.sa9018-viz/);
});
