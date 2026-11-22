"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {spawnSync} = require('node:child_process');
const problem = require('../problems').SUPPORTED[1653];
const oracle = s => Math.min(...Array.from({length:s.length+1}, (_, split) => [...s.slice(0,split)].filter(c=>c==='b').length + [...s.slice(split)].filter(c=>c==='a').length));

test('1653 matches all small strings and reconstructs balanced optimal prefixes', () => {
  for (let n=1;n<=8;n++) for(let mask=0;mask<2**n;mask++) {
    const s=mask.toString(2).padStart(n,'0').replaceAll('0','a').replaceAll('1','b');
    const result=problem.builder(s);
    assert.equal(result.answer,oracle(s),s);
    for(const step of result.steps) {
      const v=step.balancedString1653View;
      const kept=[...s.slice(0,v.processed)].filter((_,i)=>!v.removed.includes(i)).join('');
      assert.ok(!kept.includes('ba'),JSON.stringify(v));
      assert.equal(v.removed.length,v.deletions);
      assert.equal(v.deletions,oracle(s.slice(0,v.processed)));
      if(v.candidates) for(const [removed,cost] of [[v.candidates.removeA,v.candidates.deleteA],[v.candidates.removeB,v.candidates.deleteB]]) {
        if(removed===null) continue;
        assert.equal(removed.length,cost);
        assert.ok(![...s.slice(0,v.i+1)].filter((_,i)=>!removed.includes(i)).join('').includes('ba'));
      }
    }
  }
});

test('1653 chooses both alternatives, preserves snapshots, and can restore earlier a', () => {
  const result=problem.builder('bbaaa');
  const choices=result.steps.filter(step=>step.balancedString1653View.phase==='choose');
  assert.deepEqual(choices.map(step=>step.balancedString1653View.candidates.choice),['a','a','b']);
  assert.deepEqual(choices[1].balancedString1653View.removed,[2,3]);
  assert.deepEqual(choices[2].balancedString1653View.removed,[0,1]);
  assert.deepEqual(result.steps[0].balancedString1653View.removed,[]);
  assert.equal(problem.builder('aababbab').answer,2);
  assert.equal(problem.builder('bbaaaaabb').answer,2);
  for(const entry of result.steps.at(-1).balancedString1653View.history) {
    const frame=result.steps[entry.step].balancedString1653View;
    assert.equal(frame.processed,entry.i+1);
    assert.equal(frame.deletions,entry.deletions);
  }
});

test('1653 trace matches Python lines and live locals, including stale candidate variables', () => {
  const cases=['a','b','ba','aababbab','bbaaa','aaabbb','abababab','a'.repeat(50)+'b'.repeat(50)];
  const runner=`import sys,json
source,cases=json.load(sys.stdin)
ns={}
exec(compile(source,'<solution>','exec'),ns)
out=[]
for s in cases:
    events=[]
    def trace(frame,event,arg):
        if frame.f_code.co_name=='minimumDeletions' and event in ('line','return'):
            events.append({'line':frame.f_lineno,'vars':{k:v for k,v in frame.f_locals.items() if k not in ('s','self')}})
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().minimumDeletions(s)
    sys.settrace(None)
    out.append({'answer':answer,'trace':[{'line':events[j]['line'],'vars':events[j+1]['vars']} for j in range(len(events)-1)]})
assert ns['Solution']().minimumDeletions('b'*50000+'a'*50000)==50000
print(json.dumps(out))`;
  const run=spawnSync('python3',['-c',runner],{input:JSON.stringify([problem.code.join('\n'),cases]),encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  JSON.parse(run.stdout).forEach((python,index)=>{
    const result=problem.builder(cases[index]);
    assert.equal(result.answer,python.answer);
    assert.deepEqual(result.steps.map(step=>({line:step.codeLines[0],vars:Object.fromEntries(step.vars.map(v=>[v.name,v.value]))})),python.trace,cases[index]);
  });
});

test('1653 validates input and supports the maximum visual length', () => {
  for(const s of ['', 'a'.repeat(101), 'AB', 'abc','a b','ab\n',null,42]) assert.throws(()=>problem.builder(s),/1653/);
  for(const s of ['a'.repeat(100),'b'.repeat(100),'ba'.repeat(50)]) assert.equal(problem.builder(s).answer,oracle(s));
  assert.deepEqual(problem.liveArgs('aababbab'),['aababbab']);
});

test('1653 renderer shows both choices, cost, deletions, result, and replay in VI/EN', () => {
  const host={innerHTML:'',querySelector:()=>({querySelector:()=>null}),querySelectorAll:()=>[]};
  const context={lang:'vi',$:()=>host,escapeHtml:String,stepIndex:0,steps:[]};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-balanced-string-1653.js'),'utf8'),context);
  for(const lang of ['vi','en']) for(const s of ['aababbab','bbaaa','a','b','ba'.repeat(50)]) {
    context.lang=lang; context.steps=problem.builder(s).steps;
    context.steps.forEach((step,index)=>{
      context.stepIndex=index; context.renderBalancedString1653View(step);
      assert.doesNotMatch(host.innerHTML,/undefined|NaN/);
      assert.equal((host.innerHTML.match(/class="bs1653-cell /g)||[]).length,s.length);
      assert.match(host.innerHTML,new RegExp(`(?:Dòng|Line) ${step.codeLines[0]}`));
      if(step.balancedString1653View.phase==='choose') assert.match(host.innerHTML,/bs1653-branch selected/);
    });
    assert.match(host.innerHTML,/bs1653-kept final/);
    assert.match(host.innerHTML,/data-bs1653-history/);
  }
});
