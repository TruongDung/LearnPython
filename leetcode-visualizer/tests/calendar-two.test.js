const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const { prepareDesignLiveRun } = require('../live-args');
const p = SUPPORTED[731];

test('731 example, duplicates, touching boundaries and rejected-state preservation', () => {
  assert.deepEqual(p.builder(p.defaultInput).answer, [true,true,true,false,true,true]);
  assert.deepEqual(p.builder('[[10,20],[10,20],[10,20],[20,30],[0,10],[5,25]]').answer, [true,true,false,true,true,false]);
  assert.deepEqual(p.builder('[[0,1000000000],[0,1000000000],[1,2]]').answer, [true,true,false]);
  assert.deepEqual(p.builder('[]').answer, []);
  // Rejected [5,15) must not leave a spurious [5,10) double region.
  const r = p.builder('[[0,10],[10,20],[10,20],[5,15],[0,10]]');
  assert.deepEqual(r.answer, [true,true,true,false,true]);
  for (let i=1;i<r.steps.length;i++) if (r.steps[i].calendarView.phase === 'rejected') {
    assert.deepEqual(r.steps[i].calendarView.calendar,r.steps[i-1].calendarView.calendar);
    assert.deepEqual(r.steps[i].calendarView.doubles,r.steps[i-1].calendarView.doubles);
  }
  assert.deepEqual(r.steps[0].calendarView.doubles, []);
});

test('731 deterministic random traces match independent per-unit occupancy', () => {
  let seed = 731;
  const random = () => { seed = (Math.imul(seed,1664525) + 1013904223) >>> 0; return seed; };
  for(let trial=0;trial<100;trial++) {
    const occupancy = Array(20).fill(0), bookings = [], expected = [];
    for(let i=0;i<40;i++) {
      const start=random()%20, end=start+1+random()%(20-start);
      bookings.push([start,end]);
      const accepted=occupancy.slice(start,end).every(n=>n<2);
      expected.push(accepted);
      if(accepted)for(let t=start;t<end;t++)occupancy[t]++;
    }
    const r=p.builder(JSON.stringify(bookings));
    assert.deepEqual(r.answer,expected);
    const final=r.steps.at(-1).calendarView;
    for(let t=0;t<20;t++)assert.equal(final.doubles.some(([s,e])=>s<=t&&t<e),occupancy[t]===2);
    for(const step of r.steps) assert.ok(step.codeLines.every(n=>n>=1&&n<=p.code.length));
  }
});

test('731 validates input and configures the correct Python design class', () => {
  for(const input of ['no','{}','[[1,1]]','[[0,1.5]]','[[0,1000000001]]',JSON.stringify(Array(101).fill([0,1]))]) assert.throws(()=>p.builder(input));
  const config=prepareDesignLiveRun(p,p.defaultInput);
  assert.equal(config.className,'MyCalendarTwo');
  assert.deepEqual(config.constructorArgs,[]);
  assert.deepEqual(config.operations.map(o=>o.args),JSON.parse(p.defaultInput));
  assert.ok(config.operations.every(o=>o.name==='book'));
  const source=p.code.join('\n')+'\nc=MyCalendarTwo()\nassert [c.book(s,e) for s,e in '+p.defaultInput+'] == [True,True,True,False,True,True]\n';
  const run=spawnSync('python',['-c',source],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
});

test('shared timeline renders every example phase in both languages for 729 and 731', () => {
  const source=fs.readFileSync(require.resolve('../public/script.js'),'utf8');
  const element={}; const context={lang:'en',$:()=>element,escapeHtml:String};
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('function renderCalendarView(step)')),context);
  for(const id of [729,731])for(const lang of ['en','vi'])for(const step of SUPPORTED[id].builder(SUPPORTED[id].defaultInput).steps) {
    context.lang=lang;context.step=step;
    vm.runInContext('renderCalendarView(step)',context);
    assert.ok(element.innerHTML.includes(id===731?'My Calendar II':'My Calendar I'));
    assert.ok(!element.innerHTML.includes('undefined'));
    if(id===731)assert.ok(element.innerHTML.includes('doubles'));
  }
});
