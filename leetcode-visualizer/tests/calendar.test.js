const assert = require('node:assert/strict');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { prepareDesignLiveRun } = require('../live-args');
const p = SUPPORTED[729];
test('example, adjacent endpoints, duplicate and containment bookings', () => {
  assert.deepEqual(p.builder(p.defaultInput).answer, [true, false, true]);
  assert.deepEqual(p.builder('[[10,20],[10,20],[12,18],[0,30],[0,10],[20,30],[5,15]]').answer, [true,false,false,false,true,true,false]);
  assert.deepEqual(p.builder('[]').answer, []);
  assert.deepEqual(p.builder('[[0,1],[1,1000000000]]').answer, [true,true]);
});
test('trace matches an independent occupied-unit oracle and preserves snapshots', () => {
  const bookings = [];
  for (let s = 0; s < 12; s++) for (let e = s + 1; e <= 12; e++) bookings.push([s,e]);
  const occupied = new Set();
  const expected = bookings.map(([s,e]) => {
    const units = Array.from({length:e-s}, (_,i) => s+i);
    if (units.some(t => occupied.has(t))) return false;
    units.forEach(t => occupied.add(t)); return true;
  });
  const result = p.builder(JSON.stringify(bookings));
  assert.deepEqual(result.answer, expected);
  assert.deepEqual(result.steps[0].calendarView.calendar, []);
  for (let i=1; i<result.steps.length; i++) {
    const step = result.steps[i];
    assert.ok(step.codeLines.every(n => n >= 1 && n <= p.code.length));
    if (step.calendarView.phase === 'rejected') assert.deepEqual(step.calendarView.calendar, result.steps[i-1].calendarView.calendar);
  }
});
test('validation and design runner use the same booking input', () => {
  for (const input of ['bad','null','{}','[[]]','[[1,1]]','[[-1,2]]','[[2,1]]','[[0,1.5]]','[[0,1000000001]]',JSON.stringify(Array(101).fill([0,1]))]) assert.throws(() => p.builder(input));
  assert.deepEqual(prepareDesignLiveRun(p,p.defaultInput), {className:'MyCalendar',constructorArgs:[],operations:[{name:'book',args:[10,20]},{name:'book',args:[15,25]},{name:'book',args:[20,30]}]});
});
