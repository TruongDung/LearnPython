'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[146];
const cases = [
  [problem.defaultInput, 2], ['put 1 10 | put 2 20 | put 1 99 | get 1 | put 3 30 | get 2', 2],
  ['get 1 | put 1 0 | get 1 | get 2', 1], ['put 1 1 | put 2 2 | get 1 | get 2 | put 3 3 | get 2 | get 3', 1],
  ['put 0 0 | get 0 | put 2 0 | get 2 | put 3 100 | get 0', 2],
  ['put 1 1 | put 2 2 | put 3 3 | get 2 | put 4 4 | get 1', 3],
];
function oracle(input, capacity) {
  const cache = new Map(), states = [[]], outputs = [];
  for (const command of input.split('|')) {
    const [type, k, v] = command.trim().split(/\s+/), key = Number(k), value = Number(v);
    if (type === 'get') { if (!cache.has(key)) outputs.push(-1); else { const found = cache.get(key); outputs.push(found); cache.delete(key); cache.set(key, found); } }
    else { cache.delete(key); cache.set(key, value); if (cache.size > capacity) cache.delete(cache.keys().next().value); outputs.push(null); }
    states.push([...cache].map(([key, value]) => ({ key, value })));
  }
  return { states, outputs };
}
function renderer() {
  const host = { innerHTML: '', dataset: {} }, ctx = { lang: 'vi', $: () => host };
  vm.createContext(ctx); vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-lru-cache-146.js'), 'utf8'), ctx);
  return { host, ctx };
}
const plain = value => JSON.parse(JSON.stringify(value));

test('146 operation navigation matches independent recency and value state after every get/put', () => {
  const { ctx } = renderer(); let seed = 146;
  const rand = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  const samples = [...cases];
  for (let i = 0; i < 12; i++) samples.push([Array.from({ length: 12 }, () => rand(3) ? `put ${rand(5)} ${rand(15)}` : `get ${rand(5)}`).join(' | '), 1 + rand(4)]);
  for (const [input, capacity] of samples) {
    const run = problem.builder(input, { capacity }), expected = oracle(input, capacity);
    assert.deepEqual(run.answer, expected.outputs);
    let previous = -1;
    expected.states.forEach((state, ordinal) => {
      const index = ctx.lr146CompletedIndex(run.steps, ordinal); assert.ok(index > previous);
      const v = ctx.lr146View(run.steps[index]); assert.deepEqual(plain(v.order), state); assert.equal(v.entries.length, state.length); assert.ok(v.entries.length <= capacity);
      assert.equal(v.completedOps, ordinal); previous = index;
    });
    assert.deepEqual(plain(ctx.lr146View(run.steps.at(-1)).order), expected.states.at(-1));
  }
});

test('146 before pictures and evictions stay attached to their exact operation, including a hit with value 0', () => {
  const { ctx } = renderer();
  for (const [input, capacity] of cases) {
    const run = problem.builder(input, { capacity }), expected = oracle(input, capacity);
    for (const step of run.steps) {
      const v = ctx.lr146Normalize(step), action = ctx.lr146OperationState(v, run.steps);
      if (v.activeOpIndex === null) { assert.equal(action, null); continue; }
      assert.deepEqual(plain(action.before), expected.states[v.activeOpIndex]);
      if (action.command.type === 'get') assert.equal(action.hit, expected.states[v.activeOpIndex].some(entry => entry.key === action.command.key));
      if (action.done) action.removed.forEach(entry => { assert.equal(entry.key, expected.states[v.activeOpIndex][0].key); assert.ok(!v.entries.some(node => node.key === entry.key)); });
    }
  }
  const run = problem.builder(cases[2][0], { capacity: 1 });
  const hit = run.steps[ctx.lr146CompletedIndex(run.steps, 3)]; assert.equal(ctx.lr146View(hit).results.at(-1), 0);
  assert.equal(ctx.lr146OperationState(ctx.lr146Normalize(hit), run.steps).hit, true);
});

test('146 draws every current node in order, keeps detached map entries and supports immutable replay in both languages', () => {
  const { ctx, host } = renderer();
  for (const [input, capacity] of cases) {
    const run = problem.builder(input, { capacity }), before = JSON.stringify(run); ctx.steps = run.steps;
    for (const language of ['vi', 'en']) {
      ctx.lang = language;
      run.steps.forEach((step, i) => {
        ctx.stepIndex = i; ctx.renderLruCache146Pictures(step); assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
        const v = ctx.lr146View(step), current = host.innerHTML.match(/class="lr146-card lr146-current">([\s\S]*?)<\/section>/)[1];
        assert.deepEqual([...current.matchAll(/data-lru146-node="([^"]+)" data-value="([^"]+)"/g)].map(([, key, value]) => ({ key: Number(key), value: Number(value) })), plain(v.order));
        assert.equal((host.innerHTML.match(/data-lru146-map-key=/g) || []).length, v.entries.length);
      });
    }
    assert.equal(JSON.stringify(run), before);
    ctx.stepIndex = 0; ctx.renderLruCache146Pictures(run.steps[0]); const first = host.innerHTML;
    ctx.renderLruCache146Pictures(run.steps.at(-1)); ctx.renderLruCache146Pictures(run.steps[0]); assert.equal(host.innerHTML, first);
  }
});

test('146 displayed Python matches the illustrated output sequence', () => {
  const script = "import json,sys\np=json.load(sys.stdin)\nscope={}\nexec(p['code'],scope)\nall_results=[]\nfor text,cap in p['cases']:\n obj=scope['LRUCache'](cap)\n out=[]\n for part in text.split('|'):\n  op,*args=part.strip().split()\n  out.append(getattr(obj,op)(*map(int,args)))\n all_results.append(out)\nprint(json.dumps(all_results))";
  const out = spawnSync(process.env.PYTHON || 'python3', ['-c', script], { encoding: 'utf8', input: JSON.stringify({ code: problem.code.join('\n'), cases }) });
  assert.equal(out.status, 0, out.stderr); assert.deepEqual(JSON.parse(out.stdout), cases.map(([input, capacity]) => oracle(input, capacity).outputs));
});

test('146 validates integer capacity and loads its scoped theme-aware renderer', () => {
  for (const capacity of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => problem.builder('put 1 1', { capacity }), /146/);
  const { ctx, host } = renderer();
  for (const step of [{}, { lruCacheView: { entries: [{ key: '<img>', value: NaN }], pointerAction: '<img>' } }]) { ctx.renderLruCache146Pictures(step); assert.doesNotMatch(host.innerHTML, /<img>|NaN|Infinity|undefined/); }
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8'), source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  assert.match(html, /lru-cache-146\.css[^>]+data-problem-ids="146"/); assert.match(html, /renderer-lru-cache-146\.js[^>]+data-problem-ids="146"/); assert.match(source, /step\.lruCacheView[\s\S]*renderLruCache146Pictures\(step\)/);
});
