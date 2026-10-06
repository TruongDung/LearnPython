const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[9018];
const { prepareDesignLiveRun } = require('../live-args');

const build = (inventory, operations) => problem.builder2(JSON.stringify(inventory), { operations });
const demo = () => problem.builder2(problem.defaultInput, { operations: problem.extraParams[0].default });

function oracle(inventory, operations) {
  const used = new Map();
  for (const name of inventory) {
    const split = name.lastIndexOf('-');
    const type = name.slice(0, split);
    if (!used.has(type)) used.set(type, new Set());
    used.get(type).add(Number(name.slice(split + 1)));
  }
  return operations.split('|').map(call => {
    const [kind, name] = call.trim().split(/\s+/);
    if (kind === 'deallocate') {
      const split = name.lastIndexOf('-');
      used.get(name.slice(0, split))?.delete(Number(name.slice(split + 1)));
      return null;
    }
    if (!used.has(name)) used.set(name, new Set());
    let id = 1;
    while (used.get(name).has(id)) id++;
    used.get(name).add(id);
    return `${name}-${id}`;
  });
}

test('9018 exposes an independently selectable second approach and live design runner', () => {
  assert.ok(problem.tags.some(tag => tag.key === 'bitmask'));
  const selector = problem.extraParams.find(param => param.key === 'approach');
  assert.deepEqual(selector.options.map(option => option.value), [1, 2]);
  assert.match(problem.code2.join('\n'), /free_bit = \(mask \+ 1\) & ~mask/);
  const config = prepareDesignLiveRun(problem, problem.defaultInput, { operations: problem.extraParams[0].default, approach: 2 }, 2);
  assert.equal(config.className, 'ServerAllocator');
  assert.deepEqual(config.constructorArgs, [JSON.parse(problem.defaultInput)]);
});

test('9018 bitmask agrees with the heap approach and an independent smallest-ID oracle', () => {
  let seed = 9018;
  for (let sample = 0; sample < 40; sample++) {
    const inventory = ['api-2', 'api-6', 'db-3'];
    const calls = [];
    for (let index = 0; index < 20; index++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const type = ['api', 'db', 'new-type'][seed % 3];
      calls.push(seed % 4 === 0 ? `deallocate ${type}-${1 + seed % 12}` : `allocate ${type}`);
    }
    const operations = calls.join(' | ');
    const run = build(inventory, operations);
    assert.deepEqual(run.answer, oracle(inventory, operations));
    assert.deepEqual(run.answer, problem.builder(JSON.stringify(inventory), { operations }).answer);
  }
});

test('9018 bitmask crosses 32 bits without wrapping and carries to the next available ID', () => {
  const inventory = Array.from({ length: 18 }, (_, index) => `api-${index + 1}`);
  const operations = Array(20).fill('allocate api').join(' | ');
  const run = build(inventory, operations);
  assert.deepEqual(run.answer, Array.from({ length: 20 }, (_, index) => `api-${index + 19}`));
  assert.equal(run.steps.at(-1).serverAllocator9018BitmaskView.types[0].mask, String((1n << 38n) - 1n));
  assert.equal(run.steps.at(-1).serverAllocator9018BitmaskView.types[0].minimum, 39);
});

test('9018 bitmask supports empty inventory, unknown types, repeated releases, and bit 51', () => {
  const operations = 'deallocate unknown-52 | allocate api-v2 | deallocate api-v2-1 | deallocate api-v2-1 | allocate api-v2';
  const run = build([], operations);
  assert.deepEqual(run.answer, [null, 'api-v2-1', null, null, 'api-v2-1']);
  assert.deepEqual(run.steps.at(-1).serverAllocator9018BitmaskView.types.map(type => type.serverType), ['api-v2']);
  const unknown = run.steps.find(step => step.serverAllocator9018BitmaskView.event === 'make-bit');
  assert.equal(unknown.serverAllocator9018BitmaskView.calculation.bit, String(1n << 51n));
  assert.deepEqual(build([], 'deallocate unknown-1').steps.at(-1).codeLines, [26]);
});

test('9018 bit snapshots isolate finding, setting, and clearing the selected bit', () => {
  const run = build(['api-1', 'api-2', 'api-4'], 'allocate api | deallocate api-2');
  const at = event => run.steps.find(step => step.serverAllocator9018BitmaskView.event === event);
  assert.equal(at('find-zero').serverAllocator9018BitmaskView.types[0].mask, '11');
  assert.equal(at('find-zero').serverAllocator9018BitmaskView.calculation.freeBit, '4');
  assert.equal(at('set-used').serverAllocator9018BitmaskView.types[0].mask, '15');
  assert.equal(at('make-bit').serverAllocator9018BitmaskView.calculation.bit, '2');
  assert.equal(at('check-used').serverAllocator9018BitmaskView.types[0].mask, '15');
  assert.equal(at('clear-used').serverAllocator9018BitmaskView.types[0].mask, '13');
  assert.equal(run.steps.filter(step => step.final).length, 1);
  for (const step of run.steps) {
    assert.equal(step.codeBlock, 2);
    assert.equal(step.codeLines.length, 1);
    assert.equal(step.serverAllocator9018BitmaskView.source, problem.code2[step.codeLines[0] - 1]);
  }
  assert.doesNotThrow(() => JSON.stringify(run));
});

test('9018 displayed bitmask Python matches the simulation and handles arbitrary-precision IDs', () => {
  const cases = [
    { inventory: JSON.parse(problem.defaultInput), operations: problem.extraParams[0].default },
    { inventory: [], operations: 'deallocate unknown-52 | allocate api-v2 | deallocate api-v2-1 | allocate api-v2' },
    { inventory: Array.from({ length: 18 }, (_, index) => `api-${index + 1}`), operations: Array(20).fill('allocate api').join(' | ') },
  ];
  const assertions = cases.map(({ inventory, operations }) => ({
    inventory, calls: operations.split('|').map(call => call.trim().split(/\s+/)), expected: build(inventory, operations).answer,
  }));
  const source = `${problem.code2.join('\n')}
import json, sys
for case in json.load(sys.stdin):
    allocator = ServerAllocator(case['inventory'])
    result = [getattr(allocator, method)(arg) for method, arg in case['calls']]
    assert result == case['expected'], (result, case['expected'])
allocator = ServerAllocator(['api-1000'])
assert allocator.allocate('api') == 'api-1'
allocator.deallocate('api-1000')
assert allocator.used_masks['api'] == 1
`;
  const local = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(local) ? local : 'python');
  const run = spawnSync(python, ['-c', source], { encoding: 'utf8', input: JSON.stringify(assertions) });
  assert.equal(run.status, 0, run.stderr || String(run.error));
});

test('9018 bitmask renderer displays every mutation and calculation in both languages', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'public', 'renderer-server-allocator-9018.js'), 'utf8');
  const element = {};
  const context = { lang: 'vi', $: () => element };
  vm.createContext(context);
  vm.runInContext(source, context);
  const steps = [...demo().steps, ...build([], 'deallocate unknown-52 | allocate api').steps];
  for (const locale of ['vi', 'en']) {
    context.lang = locale;
    for (const step of steps) {
      context.renderServerAllocator9018BitmaskView(step);
      assert.match(element.innerHTML, /sa9018-bitmask/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
      const view = step.serverAllocator9018BitmaskView;
      if (view.types.length) assert.match(element.innerHTML, /data-id="1" data-bit="[01]"/);
      if (view.calculation?.kind === 'allocate') assert.match(element.innerHTML, /free_bit = \(mask \+ 1\) & ~mask/);
      if (view.event === 'clear-used') assert.match(element.innerHTML, /mask & ~bit/);
    }
  }
});

test('9018 invalid inputs use the same validation for heap and bitmask', () => {
  for (const [input, params] of [['bad', {}], ['["api-0"]', { operations: 'allocate api' }], ['[]', { operations: 'bad' }]]) {
    assert.throws(() => problem.builder2(input, params));
  }
});
