'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[432];
function renderer() {
  const host = { innerHTML: '', dataset: {} }, ctx = { lang: 'vi', document: { getElementById: () => host } };
  vm.createContext(ctx); vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-all-one-432.js'), 'utf8'), ctx);
  return { ctx, host, cases: Array.from(vm.runInContext('AO432_CASES', ctx), item => item[0]) };
}
function states(input) {
  const counts = new Map(), result = [new Map()];
  for (const part of input.split('|')) {
    const [op, key] = part.trim().split(/\s+/);
    if (op === 'inc') counts.set(key, (counts.get(key) || 0) + 1);
    if (op === 'dec' && counts.has(key)) { if (counts.get(key) === 1) counts.delete(key); else counts.set(key, counts.get(key) - 1); }
    result.push(new Map(counts));
  }
  return result;
}
const extra = [
  'getMinKey | getMaxKey | dec missing',
  'inc hello | inc hello | inc leet | getMaxKey | getMinKey | dec hello | dec leet | getMinKey',
  'inc z | dec z | getMaxKey | inc z | getMinKey | dec z | getMinKey',
  Array(24).fill('inc abcdefghij').join(' | '),
];

test('432 operation pictures use the pre-operation count even while maps and buckets are updating', () => {
  const { ctx, cases } = renderer();
  for (const input of [...cases, ...extra]) {
    const run = problem.builder(input), expected = states(input);
    for (const step of run.steps) {
      const state = ctx.ao432Normalize(step), change = ctx.ao432OperationChange(state, run.steps);
      if (!state.operation.key) { assert.equal(change, null); continue; }
      assert.equal(change.before, expected[state.operation.index - 1].get(state.operation.key) || 0);
      assert.equal(change.after, expected[state.operation.index].get(state.operation.key) || 0);
      assert.equal(change.complete, step.allOne432View.operation.status === 'complete');
    }
  }
});

test('432 operation navigation lands on exact stable completion snapshots, including initialization and empty queries', () => {
  const { ctx, cases } = renderer();
  for (const input of [...cases, ...extra]) {
    const run = problem.builder(input), expected = states(input);
    let previous = -1;
    for (let op = 0; op < expected.length; op++) {
      const index = ctx.ao432CompletedIndex(run.steps, op); assert.ok(index > previous);
      const v = run.steps[index].allOne432View; assert.equal(v.operation.index, op); assert.ok(v.invariants.stable);
      assert.deepEqual(new Map(v.maps.keyCount.map(entry => [entry.key, entry.count])), expected[op]); previous = index;
    }
    assert.equal(ctx.ao432CompletedIndex(run.steps, expected.length), -1);
  }
});

test('432 main group cards retain exact key membership, actual reciprocal links and immutable replay', () => {
  const { ctx, host, cases } = renderer();
  for (const input of [...cases, ...extra]) {
    const run = problem.builder(input), before = JSON.stringify(run); ctx.steps = run.steps;
    for (const language of ['vi', 'en']) {
      ctx.lang = language;
      run.steps.forEach((step, index) => {
        ctx.stepIndex = index; ctx.renderAllOne432View(step);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
        const v = step.allOne432View, groups = [...host.innerHTML.matchAll(/data-ao432-group-id="([^"]+)" data-linked="(true|false)" data-count="([^"]*)">([\s\S]*?)<\/section>/g)];
        assert.deepEqual(groups.filter(([, , linked]) => linked === 'true').map(([, id]) => id), v.structure.order);
        for (const [, id, linked, count, html] of groups) {
          const bucket = v.structure.buckets.find(bucket => bucket.id === id);
          assert.equal(count, bucket.count === null ? '' : String(bucket.count));
          assert.deepEqual([...html.matchAll(/data-ao432-key="([^"]+)"/g)].map(([, key]) => key), bucket.keys);
          if (v.invariants.stable) assert.equal(linked, 'true');
        }
        for (const [, from, next, reciprocal] of host.innerHTML.matchAll(/data-ao432-link-from="([^"]+)" data-next="([^"]+)" data-reciprocal="(true|false)"/g)) {
          assert.equal(v.structure.buckets.find(bucket => bucket.id === from).next, next);
          assert.equal(reciprocal === 'true', v.structure.buckets.find(bucket => bucket.id === next).prev === from);
        }
      });
    }
    assert.equal(JSON.stringify(run), before);
    ctx.stepIndex = 0; ctx.renderAllOne432View(run.steps[0]); const first = host.innerHTML;
    ctx.renderAllOne432View(run.steps.at(-1)); ctx.renderAllOne432View(run.steps[0]); assert.equal(host.innerHTML, first);
    assert.ok(Object.isFrozen(run.steps[0].allOne432View));
  }
});

test('432 displayed Python matches every completed operation and accepts the displayed tied-query answer', () => {
  const { cases } = renderer(), inputs = [...cases, ...extra];
  const python = "import json,sys\np=json.load(sys.stdin)\nscope={}\nexec(p['code'],scope)\nall_results=[]\nfor text in p['inputs']:\n obj=scope['AllOne']()\n results=[]\n for part in text.split('|'):\n  args=part.strip().split()\n  results.append(getattr(obj,args[0])(*args[1:]))\n all_results.append(results)\nprint(json.dumps(all_results))";
  const out = spawnSync(process.env.PYTHON || 'python3', ['-c', python], { encoding: 'utf8', input: JSON.stringify({ code: problem.code.join('\n'), inputs }) });
  assert.equal(out.status, 0, out.stderr); assert.deepEqual(JSON.parse(out.stdout), inputs.map(input => problem.builder(input).answer));
});

test('432 malformed frames remain safe and show no invented counts', () => {
  const { ctx, host } = renderer();
  for (const step of [null, {}, { allOne432View: { operation: { key: '<img>', name: 'inc' }, structure: { order: ['<img>'], buckets: [{ id: '<img>', count: NaN }] } } }]) {
    ctx.renderAllOne432View(step); assert.doesNotMatch(host.innerHTML, /<img>|NaN|Infinity|undefined/);
  }
});
