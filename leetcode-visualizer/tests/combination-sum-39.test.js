"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[39];
const cases=[[[2,3,6,7],7],[[2,3,5],8],[[2],1],[[7,2,3,6],7],[[1],40],[[40],1],[[1,2,3],12]];
const build=(nums,target)=>problem.builder(nums,{target});
const keys=rows=>rows.map(row=>JSON.stringify(row)).sort();
function oracle(nums,target){
  let rows=[{sum:0,values:[]}];
  for(const value of nums){const next=[];for(const row of rows)for(let k=0;k<=Math.floor((target-row.sum)/value);k++)next.push({sum:row.sum+k*value,values:[...row.values,...Array(k).fill(value)]});rows=next;}
  return rows.filter(row=>row.sum===target).map(row=>row.values);
}

test('39 returns every combination exactly once, preserving input and allowing repeated values',()=>{
  let seed=39;const rand=n=>(seed=(Math.imul(seed,1664525)+1013904223)>>>0)%n;
  const samples=[...cases];for(let j=0;j<25;j++){const values=[1,2,3,4,5,6].sort((a,b)=>((a+j)%6)-((b+j)%6)).slice(0,1+rand(4));samples.push([values,1+rand(12)]);}
  for(const [nums,target] of samples){const before=[...nums],run=build(nums,target);
    assert.deepEqual(keys(run.answer),keys(oracle(nums,target)));assert.equal(new Set(keys(run.answer)).size,run.answer.length);assert.deepEqual(nums,before);
    assert.ok(run.answer.every(row=>row.reduce((a,b)=>a+b,0)===target&&row.every((n,i)=>nums.indexOf(n)>=(i?nums.indexOf(row[i-1]):-1))));
    assert.equal(run.steps.filter(step=>step.final).length,1);assert.deepEqual(run.steps.at(-1).combination39View.results,run.answer);
  }
  assert.deepEqual(build([2,3,6,7],7).answer,[[2,2,3],[7]]);
  assert.deepEqual(build([2],1).answer,[]);
});

test('39 matches every completed Python statement, actual local variables and the shared current list across recursive frames',()=>{
  const python=`import sys,json,copy
payload=json.load(sys.stdin);s={};filename='<cs39>';exec(compile(payload['source'],filename,'exec'),s);runs=[]
for nums,target in payload['cases']:
 events=[];pending={}
 def trace(frame,event,arg):
  if frame.f_code.co_filename!=filename or frame.f_code.co_name not in ('combinationSum','backtrack'):return trace
  if event in ('line','return'):
   if frame in pending:
    x=frame.f_locals;frames=[];cursor=frame
    while cursor:
     if cursor.f_code.co_filename==filename and cursor.f_code.co_name=='backtrack':frames.append({'start':cursor.f_locals['start'],'remain':cursor.f_locals['remain'],**({'i':cursor.f_locals['i']} if 'i' in cursor.f_locals else {}),'currentLength':len(cursor.f_locals['current'])})
     cursor=cursor.f_back
    events.append({'line':pending.pop(frame),'scope':frame.f_code.co_name,'locals':copy.deepcopy({k:x[k] for k in ('candidates','target','current','start','remain','i') if k in x}),'result':copy.deepcopy(x['result']),'stack':list(reversed(frames))})
   if event=='line':pending[frame]=frame.f_lineno
  return trace
 sys.settrace(trace);answer=s['Solution']().combinationSum(nums,target);sys.settrace(None);runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const proc=spawnSync('python3',['-c',python],{input:JSON.stringify({source:problem.code.join('\n'),cases}),encoding:'utf8',maxBuffer:32*1024*1024});
  assert.equal(proc.status,0,proc.stderr);
  JSON.parse(proc.stdout).forEach((reference,c)=>{
    const [nums,target]=cases[c],run=build(nums,target);assert.deepEqual(run.answer,reference.answer);assert.equal(run.steps.length,reference.events.length,`case ${c}`);
    run.steps.forEach((step,i)=>{const v=step.combination39View,e=reference.events[i],x=e.locals;
      assert.deepEqual(step.codeLines,[e.line],`case ${c} event ${i}`);assert.equal(v.scope,e.scope);assert.deepEqual(v.locals,x);
      assert.deepEqual(v.stack.map(({id,...f})=>f),e.stack);assert.equal(v.currentReady,'current' in x);
      assert.deepEqual(v.results,e.result.slice(v.shownFrom));assert.equal(v.resultCount,e.result.length);
      assert.deepEqual(step.vars.map(w=>w.value),[x.start??'—',x.i??'—',x.remain??'—',x.current??'—',x.current?x.current.reduce((a,b)=>a+b,0):'—',e.result.length]);
      assert.equal(v.source.text,problem.code[e.line-1]);assert.equal(v.source.timing,'after');
    });
  });
});

test('39 changes current only on append/pop, reuses index i, copies solutions and keeps real overshoot states',()=>{
  const run=build([2,3,6,7],7),before=JSON.stringify(run);let previous;
  for(const step of run.steps){const v=step.combination39View,x=v.locals;
    assert.deepEqual(v.indices.map(i=>v.candidates[i]),x.current||[]);
    assert.ok(v.tree.length<=64);assert.ok(v.tree.every(node=>node.id<v.visitedCount));
    if(v.phase==='append'){assert.deepEqual(x.current,[...previous.locals.current,v.candidates[x.i]]);assert.equal(x.remain,previous.locals.remain);}
    if(v.phase==='pop')assert.deepEqual(x.current,previous.locals.current.slice(0,-1));
    if(v.phase==='choose')assert.deepEqual(x.current,previous.locals.current);
    if(v.phase==='zero-check'&&v.stack.length>1){const parent=v.stack.at(-2);assert.equal(x.start,parent.i);assert.equal(x.remain,parent.remain-v.candidates[parent.i]);}
    if(v.phase==='save'){assert.equal(x.remain,0);assert.deepEqual(v.results.at(-1),x.current);}
    if(v.phase==='return-overshoot')assert.ok(x.remain<0);
    previous=v;
  }
  const first=run.steps.find(s=>s.combination39View.phase==='save');assert.deepEqual(first.combination39View.results,[[2,2,3]]);
  assert.equal(run.steps.at(-1).combination39View.stack.length,0);assert.equal(JSON.stringify(run),before);
});

test('39 shares strict validation with live arguments and rejects oversized traces instead of returning partial results',()=>{
  assert.deepEqual(problem.liveArgs([2,3,7],{target:7}),[[2,3,7],7]);
  for(const nums of [null,undefined,{},[],[2,2],[0,2],[-1,2],[1.5,2],[NaN],[Infinity],['2'],[41],Array(31).fill(2)]){
    assert.throws(()=>build(nums,7),/39/);assert.throws(()=>problem.liveArgs(nums,{target:7}),/39/);
  }
  for(const target of [undefined,null,0,-1,41,1.1,NaN,Infinity,'7',true]){
    assert.throws(()=>build([2,3],target),/39/);assert.throws(()=>problem.liveArgs([2,3],{target}),/39/);
  }
  assert.throws(()=>build([1,2,3,4,5,6,7,8],40),/trace too long/);
  assert.equal(build([1],40).answer[0].length,40);
});

function renderer(lang){
  const host={innerHTML:'',querySelector:()=>null},context={lang,$:()=>host,escapeHtml:x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-combination-39.js'),'utf8'),context);
  return step=>{context.renderCombination39Pictures(step);return host.innerHTML;};
}

test('39 renders number pips, a true current-sum bar, available index range, actual tree frames and every saved combination in both languages',()=>{
  for(const lang of ['vi','en']){const render=renderer(lang);
    for(const [nums,target] of cases){const run=build(nums,target),original=JSON.stringify(run);
      for(const step of run.steps){const html=render(step),v=step.combination39View,f=v.stack.at(-1),sum=(v.locals.current||[]).reduce((a,b)=>a+b,0);
        assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object|<p\b|<table\b/);
        assert.deepEqual([...html.matchAll(/data-combination="([\d,]+)"/g)].map(m=>m[1]),v.results.map(row=>row.join(',')));
        assert.equal((html.match(/data-node=/g)||[]).length,v.tree.length);
        assert.deepEqual([...html.matchAll(/data-frame="(\d+)"/g)].map(m=>Number(m[1])),v.stack.map(f=>f.id));
        if(!step.final){assert.match(html,new RegExp(`data-sum="${sum}" data-goal="${target}"`));
          assert.deepEqual([...html.matchAll(/data-segment-value="(\d+)"/g)].map(m=>Number(m[1])),v.locals.current||[]);
          assert.deepEqual([...html.matchAll(/data-candidate-index="(\d+)" data-locked="true"/g)].map(m=>Number(m[1])),nums.map((_,i)=>i).filter(i=>f&&i<f.start));
        }
      }
      const first=render(run.steps[0]);render(run.steps.at(-1));assert.equal(render(run.steps[0]),first);assert.equal(JSON.stringify(run),original);
    }
  }
  const run=build([1,2,3],12);assert.ok(run.answer.length>12);assert.deepEqual(run.steps.at(-1).combination39View.results,run.answer);
});

test('39 loads scoped assets lazily and supports light/dark, sticky watches, long current values and horizontal code scrolling',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/combination-39.css'),'utf8'),script=fs.readFileSync(require.resolve('../public/script.js'),'utf8');
  assert.equal(problem.debugMode,'line-by-line');assert.match(html,/combination-39\.css[^\n]*data-problem-ids="39(?: 40)?"/);assert.match(html,/renderer-combination-39\.js[^\n]*data-problem-ids="39(?: 40)?"/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/(?:renderer-)?combination-39\.(?:css|js)/);
  assert.match(script,/Boolean\(step.combination39View\)[^\n]*renderCombination39Pictures\(step\)/);assert.match(css,/\[data-theme="light"\] \.cs39-viz/);
  assert.match(css,/#varsPanel[^}]*position:sticky/);assert.match(css,/\.var-value\s*\{[^}]*overflow-x:auto; white-space:nowrap/);
  assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);assert.match(css,/\.code-line\s*\{[^}]*white-space:pre/);
});
