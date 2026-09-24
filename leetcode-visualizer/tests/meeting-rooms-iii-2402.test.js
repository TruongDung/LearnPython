const test = require('node:test');
const assert = require('node:assert/strict');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[2402];
const solve = (n, meetings) => problem.builder(meetings, { n });

function oracle(n, meetings) {
  const availableAt = Array(n).fill(0);
  const counts = Array(n).fill(0);
  const assignments = [];
  for (const [start, end] of [...meetings].sort((a, b) => a[0] - b[0])) {
    let room = -1;
    for (let id = 0; id < n; id++) {
      if (availableAt[id] <= start) { room = id; break; }
    }
    if (room === -1) {
      room = 0;
      for (let id = 1; id < n; id++) {
        if (availableAt[id] < availableAt[room]) room = id;
      }
    }
    const actualStart = Math.max(start, availableAt[room]);
    const finish = actualStart + end - start;
    availableAt[room] = finish;
    counts[room]++;
    assignments.push({ start, end, room, actualStart, finish });
  }
  let answer = 0;
  for (let id = 1; id < n; id++) if (counts[id] > counts[answer]) answer = id;
  return { answer, assignments, counts };
}

test('2402 is registered under Heap with sorting and simulation', () => {
  assert.equal(problem.id, 2402);
  assert.equal(problem.slug, 'meeting-rooms-iii');
  assert.equal(problem.category.key, 'heap');
  assert.ok(problem.tags.some((tag) => tag.key === 'sorting'));
  assert.ok(problem.tags.some((tag) => tag.key === 'simulation'));
});

test('2402 matches published examples, half-open reuse, delay, and tie-breaks', () => {
  const first = solve(2, [[0, 10], [1, 5], [2, 7], [3, 4]]);
  assert.equal(first.answer, 0);
  assert.deepEqual(first.assignments.map(({ room, actualStart, finish }) => [room, actualStart, finish]),
    [[0, 0, 10], [1, 1, 5], [1, 5, 10], [0, 10, 11]]);
  assert.equal(solve(3, [[1, 20], [2, 10], [3, 5], [4, 9], [6, 8]]).answer, 1);
  assert.equal(solve(2, '0,2;1,2;2,3').assignments[2].room, 0);
  assert.equal(solve(2, [[0, 5], [1, 5], [2, 3]]).assignments[2].room, 0);
  assert.equal(solve(1, [[0, 2], [1, 3]]).assignments[1].finish, 4);
  assert.equal(solve(2, '[[0,10],[1,5],[2,7],[3,4]]').answer, 0);
});

test('2402 agrees with an independent room-scan oracle on unsorted random cases', () => {
  let seed = 2402;
  const rand = (max) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };
  for (let trial = 0; trial < 180; trial++) {
    const n = 1 + rand(5);
    const count = 1 + rand(12);
    const starts = Array.from({ length: count }, (_, index) => index * 2 + rand(2));
    const meetings = starts.map((start) => [start, start + 1 + rand(8)]);
    meetings.sort(() => rand(3) - 1);
    const expected = oracle(n, meetings);
    const actual = solve(n, meetings);
    assert.equal(actual.answer, expected.answer, `n=${n}, meetings=${JSON.stringify(meetings)}`);
    assert.deepEqual(actual.assignments.map(({ originalStart, originalEnd, room, actualStart, finish }) =>
      ({ start: originalStart, end: originalEnd, room, actualStart, finish })), expected.assignments);
  }
});

test('2402 trace distinguishes original and actual time and preserves heap states', () => {
  const run = solve(2, [[3, 4], [0, 10], [10, 11], [2, 7], [1, 5]]);
  assert.ok(run.steps.some((step) => step.meetingRooms2402View.phase === 'delay'));
  assert.ok(run.steps.some((step) => step.meetingRooms2402View.phase === 'release'));
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(step.codeLines[0] >= 4 && step.codeLines[0] <= problem.code.length);
    const view = step.meetingRooms2402View;
    assert.ok(view);
    if (view.phase === 'delay') {
      assert.ok(view.actualStart > view.meeting.start);
      assert.equal(view.finish - view.actualStart, view.meeting.end - view.meeting.start);
    }
    if (view.phase === 'schedule' || view.phase === 'count') assert.equal(view.freeCount + view.busyCount, run.n);
  }
  const final = run.steps.at(-1);
  assert.equal(final.final, true);
  assert.equal(final.meetingRooms2402View.answer, run.answer);
  assert.equal(final.meetingRooms2402View.assignmentCount, run.original.length);
});

test('2402 validates rooms, meeting shape, bounds, and unique starts', () => {
  assert.throws(() => solve(0, [[0, 1]]));
  assert.throws(() => solve(101, [[0, 1]]));
  assert.throws(() => solve(2, []));
  assert.throws(() => solve(2, [[0, 1, 2]]));
  assert.throws(() => solve(2, [[1, 1]]));
  assert.throws(() => solve(2, [[-1, 1]]));
  assert.throws(() => solve(2, [[0, 500001]]));
  assert.throws(() => solve(2, [[0, 1], [0, 2]]));
  assert.throws(() => solve(2, '0,1;bad,2'));
});

test('2402 caps a long trace without losing the final answer or large room count', () => {
  const meetings = Array.from({ length: 200 }, (_, start) => [start, 500000]);
  const run = solve(1, meetings);
  assert.equal(run.answer, 0);
  assert.equal(run.assignments.length, 200);
  assert.ok(run.steps.length <= 701);
  assert.equal(run.steps.at(-1).meetingRooms2402View.omitted, true);
  assert.equal(solve(100, [[0, 1]]).answer, 0);
});
