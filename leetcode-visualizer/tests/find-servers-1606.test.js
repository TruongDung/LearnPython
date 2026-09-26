const test = require('node:test');
const assert = require('node:assert/strict');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[1606];
const solve = (k, arrival, load) => problem.builder(arrival, { k, load });

function bruteForce(k, arrival, load) {
  const availableAt = Array(k).fill(0);
  const handled = Array(k).fill(0);
  for (let i = 0; i < arrival.length; i++) {
    for (let offset = 0; offset < k; offset++) {
      const server = (i + offset) % k;
      if (availableAt[server] > arrival[i]) continue;
      handled[server]++;
      availableAt[server] = arrival[i] + load[i];
      break;
    }
  }
  const best = Math.max(...handled);
  return handled.flatMap((count, server) => count === best ? [server] : []);
}

test('1606 is registered as a heap/simulation lesson', () => {
  assert.equal(problem.id, 1606);
  assert.equal(problem.slug, 'find-servers-that-handled-most-number-of-requests');
  assert.equal(problem.category.key, 'heap');
  assert.ok(problem.tags.some((tag) => tag.key === 'simulation'));
});

test('1606 matches the published examples and wraparound boundaries', () => {
  assert.deepEqual(solve(3, [1, 2, 3, 4, 5], [5, 2, 3, 3, 3]).answer, [1]);
  assert.deepEqual(solve(3, [1, 2, 3, 4], [1, 2, 1, 2]).answer, [0]);
  assert.deepEqual(solve(3, [1, 2, 3], [10, 12, 11]).answer, [0, 1, 2]);
  assert.deepEqual(solve(2, [1, 2, 3, 4], [10, 10, 10, 10]).answer, [0, 1]);
  assert.deepEqual(solve(1, [1, 2, 3], [1, 1, 1]).answer, [0]);
  assert.deepEqual(solve(3, [1, 2, 3, 4], '5,2,3,3').answer, bruteForce(3, [1, 2, 3, 4], [5, 2, 3, 3]));
});

test('1606 agrees with an independent scan oracle on small random inputs', () => {
  let seed = 1606;
  const rand = (max) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };
  for (let trial = 0; trial < 150; trial++) {
    const k = 1 + rand(6);
    const n = 1 + rand(12);
    let time = 0;
    const arrival = Array.from({ length: n }, () => (time += 1 + rand(3)));
    const load = Array.from({ length: n }, () => 1 + rand(9));
    assert.deepEqual(solve(k, arrival, load).answer, bruteForce(k, arrival, load),
      `k=${k}, arrival=${arrival}, load=${load}`);
  }
});

test('1606 trace reflects release, drop, virtual-slot selection, and final counts', () => {
  const run = solve(3, [1, 2, 3, 4, 5], [5, 2, 3, 3, 3]);
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(step.codeLines[0] >= 5 && step.codeLines[0] <= problem.code.length);
    assert.ok(step.serverHeap1606View);
    const view = step.serverHeap1606View;
    if (view.phase === 'pick-server') assert.equal(view.server, view.slot % view.k);
    if (view.phase === 'requeue') assert.equal(view.slot % view.k, view.released);
    if (view.freeCount !== null && view.busyCount !== null) assert.equal(view.freeCount + view.busyCount,
      view.phase === 'release' ? view.k - 1 : view.phase === 'pick-slot' || view.phase === 'pick-server' || view.phase === 'count' ? view.k - 1 : view.k);
  }
  assert.ok(run.steps.some((step) => step.serverHeap1606View.phase === 'release'));
  assert.ok(run.steps.some((step) => step.serverHeap1606View.phase === 'drop'));
  const final = run.steps.at(-1);
  assert.equal(final.final, true);
  assert.equal(final.serverHeap1606View.best, 2);
  assert.equal(final.serverHeap1606View.dropped, false);
  assert.deepEqual(final.serverHeap1606View.answer, run.answer);
});

test('1606 rejects malformed or out-of-range inputs', () => {
  assert.throws(() => solve(0, [1], [1]));
  assert.throws(() => solve(1.5, [1], [1]));
  assert.throws(() => solve(1, [1, 1], [1, 1]));
  assert.throws(() => solve(1, [0], [1]));
  assert.throws(() => solve(1, [1, 2], [1]));
  assert.throws(() => solve(1, [1], [0]));
  assert.throws(() => solve(1, [1], 'oops'));
});

test('1606 caps the trace while computing all requests and supports large k', () => {
  const arrival = Array.from({ length: 200 }, (_, index) => index + 1);
  const run = solve(1, arrival, Array(200).fill(1));
  assert.deepEqual(run.answer, [0]);
  assert.ok(run.steps.length <= 701);
  assert.equal(run.steps.at(-1).serverHeap1606View.omitted, true);
  assert.deepEqual(solve(100000, [1], [1]).answer, [0]);
});
