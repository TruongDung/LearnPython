"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[40];
const cases=[[[10,1,2,7,6,1,5],8],[[2,5,2,1,2],5],[[1,1,1,1],2],[[1],2],[[9,10],2],[[3,1,3,2],4],[[2,2],4],[[1,2],3]];
const build=(nums,target)=>p.builder(nums,{target});
const keys=rows=>rows.map(row=>row.join(',')).sort();
function oracle(nums,target){const out=new Set();for(let mask=0;mask<2**nums.length;mask++){const row=nums.filter((_,i)=>mask&(1<<i));if(row.reduce((a,b)=>a+b,0)===target)out.add(row.sort((a,b)=>a-b).join(','));}return [...out].sort();}

test('40 returns all unique subsets with the correct sum while preserving original input and multiplicities',()=>{
  let seed=40;const rand=n=>(seed=(Math.imul(seed,1664525)+1013904223)>>>0)%n;
  const samples=[...cases,...Array.from({length:35},()=>[Array.from({length:1+rand(8)},()=>1+rand(6)),1+rand(15)])];
  for(const [nums,target] of samples){const before=[...nums],run=build(nums,target);assert.deepEqual(keys(run.answer),oracle(nums,target));assert.equal(new Set(keys(run.answer)).size,run.answer.length);assert.deepEqual(nums,before);assert.deepEqual(run.original,before);assert.deepEqual(run.steps.at(-1).combination40View.results,run.answer);assert.equal(run.steps.filter(s=>s.final).length,1);}
  assert.deepEqual(build(...cases[0]).answer,[[1,1,6],[1,2,5],[1,7],[2,6]]);
  assert.deepEqual(build(...cases[1]).answer,[[1,2,2],[5]]);
  assert.deepEqual(build([1],2).answer,[]);assert.deepEqual(build([1,1,1,1],2).answer,[[1,1]]);
});

test('40 matches every completed Python line, initialized variable, loop exhaustion, recursive frame and copied result',()=>{
  const python=`import sys,json,copy
payload=json.load(sys.stdin);scope={};filename='<cs40>';exec(compile(payload['source'],filename,'exec'),scope);runs=[]
for nums,target in payload['cases']:
 events=[];pending={}
 def trace(frame,event,arg):
  if frame.f_code.co_filename!=filename or frame.f_code.co_name not in ('combinationSum2','backtrack'):return trace
  if event in ('line','return'):
   if frame in pending:
    x=frame.f_locals;frames=[];cursor=frame
    while cursor:
     if cursor.f_code.co_filename==filename and cursor.f_code.co_name=='backtrack':frames.append({'start':cursor.f_locals['start'],'remain':cursor.f_locals['remain'],**({'i':cursor.f_locals['i']} if 'i' in cursor.f_locals else {}),'currentLength':len(cursor.f_locals['current'])})
     cursor=cursor.f_back
    events.append({'line':pending.pop(frame),'scope':frame.f_code.co_name,'locals':copy.deepcopy({k:x[k] for k in ('candidates','target','current','start','remain','i') if k in x}),'result':copy.deepcopy(x.get('result',[])),'resultReady':'result' in x,'stack':list(reversed(frames))})
   if event=='line':pending[frame]=frame.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().combinationSum2(nums,target);sys.settrace(None);runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const result=spawnSync('python3',['-c',python],{input:JSON.stringify({source:p.code.join('\n'),cases}),encoding:'utf8',maxBuffer:32*1024*1024});
  assert.equal(result.status,0,result.stderr);
  JSON.parse(result.stdout).forEach((reference,c)=>{const run=build(...cases[c]);assert.deepEqual(run.answer,reference.answer);assert.equal(run.steps.length,reference.events.length,`case ${c}`);
    run.steps.forEach((step,i)=>{const v=step.combination40View,e=reference.events[i],x=e.locals;
      assert.deepEqual(step.codeLines,[e.line],`case ${c} event ${i}`);assert.equal(v.scope,e.scope);assert.deepEqual(v.locals,x);assert.deepEqual(v.stack.map(({id,...f})=>f),e.stack);
      assert.equal(v.currentReady,'current' in x);assert.equal(v.resultReady,e.resultReady);assert.equal(v.resultCount,e.resultReady?e.result.length:null);assert.deepEqual(v.results,e.result.slice(v.shownFrom));
      assert.deepEqual(step.vars.map(w=>w.value),[x.start??'—',x.i??'—',x.remain??'—',x.current??'—',x.current?x.current.reduce((a,b)=>a+b,0):'—',e.resultReady?e.result.length:'—']);
      assert.equal(v.source.line,e.line);assert.equal(v.source.text,p.code[e.line-1]);assert.equal(v.source.timing,'after');
    });
  });
});

test('40 allows equal values at different indices and skips equal siblings without reading a short-circuited comparison',()=>{
  const run=build(...cases[0]);let previous;let sawSibling=false,sawChild=false;
  for(const step of run.steps){const v=step.combination40View,x=v.locals;
    if(v.phase==='skip-duplicate'){assert.ok(x.i>x.start);assert.equal(v.candidates[x.i],v.candidates[x.i-1]);assert.deepEqual(v.duplicate,{first:false,different:false,allowed:false});assert.equal(v.tooLarge,null);assert.ok(v.skipped.includes(x.i));assert.deepEqual(x.current,previous.locals.current);assert.equal(v.visitedCount,previous.visitedCount);if(x.start===0&&x.i===1)sawSibling=true;}
    if(v.phase==='allow'&&x.i===x.start){assert.deepEqual(v.duplicate,{first:true,different:null,allowed:true});if(x.i===1&&v.indices.includes(0))sawChild=true;}
    if(v.phase==='choose')assert.equal(v.duplicate,null);
    previous=v;
  }
  assert.ok(sawSibling&&sawChild);
});

test('40 never reuses an index, prunes sorted tails before append and keeps copied solutions after pop',()=>{
  const run=build(...cases[0]),before=JSON.stringify(run);let previous;
  for(const step of run.steps){const v=step.combination40View,x=v.locals;
    assert.deepEqual(v.indices.map(i=>v.candidates[i]),x.current||[]);assert.ok(v.indices.every((n,i)=>!i||n>v.indices[i-1]));assert.ok((x.current||[]).reduce((a,b)=>a+b,0)<=v.target);
    assert.ok(v.tree.length<=36);assert.ok(v.tree.every(n=>n.id<v.visitedCount&&n.remain>=0));
    if(v.phase==='zero-check'&&v.stack.length>1){const parent=v.stack.at(-2);assert.equal(x.start,parent.i+1);assert.equal(x.remain,parent.remain-v.candidates[parent.i]);}
    if(v.phase==='append'){assert.deepEqual(x.current,[...previous.locals.current,v.candidates[x.i]]);assert.equal(x.remain,previous.locals.remain);}
    if(v.phase==='pop')assert.deepEqual(x.current,previous.locals.current.slice(0,-1));
    if(v.phase==='return-pruned'){assert.ok(v.candidates[x.i]>x.remain);assert.ok(v.candidates.slice(x.i).every(n=>n>x.remain));assert.deepEqual(x.current,previous.locals.current);}
    if(v.phase==='save'){assert.equal(x.remain,0);assert.deepEqual(v.results.at(-1),x.current);}
    previous=v;
  }
  assert.deepEqual(run.steps.find(s=>s.combination40View.phase==='save').combination40View.results,[[1,1,6]]);assert.equal(JSON.stringify(run),before);
});

test('40 accepts 100 repeated values and preserves every result beyond the preview window; oversized traces fail explicitly',()=>{
  const full=build(Array(100).fill(1),50);assert.deepEqual(full.answer,[Array(50).fill(1)]);assert.ok(full.steps.length>1000);assert.equal(full.steps.at(-1).combination40View.stack.length,0);
  const many=build([1,1,2,2,3,3,4,4,5,5,6,6],15);assert.ok(many.answer.length>12);assert.deepEqual(many.steps.at(-1).combination40View.results,many.answer);
  assert.throws(()=>build(Array.from({length:50},(_,i)=>i+1),50),/trace too long/);
});

test('40 shares shape, value and target validation with live Python arguments while accepting duplicate candidates',()=>{
  assert.deepEqual(p.liveArgs([2,1,1],{target:2}),[[2,1,1],2]);
  for(const nums of [null,undefined,{},[],[0],[-1],[1.1],[NaN],[Infinity],['2'],[51],Array(101).fill(1)]){assert.throws(()=>build(nums,8),/40/);assert.throws(()=>p.liveArgs(nums,{target:8}),/40/);}
  for(const target of [undefined,null,0,-1,51,1.2,NaN,Infinity,'8',true]){assert.throws(()=>build([1,1],target),/40/);assert.throws(()=>p.liveArgs([1,1],{target}),/40/);}
});

function renderer(lang){const host={innerHTML:'',querySelector:()=>null},context={lang,$:()=>host,escapeHtml:x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))};vm.createContext(context);for(const file of ['renderer-combination-39.js','renderer-combination-40.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),context);return step=>{context.renderCombination40Pictures(step);return host.innerHTML;};}

test('40 pictures preserve positional identity, used/skipped/cut flags, true current sum, branch frames and all solutions in both languages',()=>{
  for(const lang of ['vi','en']){const render=renderer(lang);
    for(const [nums,target] of cases){const run=build(nums,target),before=JSON.stringify(run);
      for(const step of run.steps){const v=step.combination40View,f=v.stack.at(-1),html=render(step);
        assert.match(html,/cs40-viz/);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object|<p\b|<table\b/);
        assert.deepEqual([...html.matchAll(/data-combination="([\d,]+)"/g)].map(m=>m[1]),v.results.map(row=>row.join(',')));
        assert.deepEqual([...html.matchAll(/data-frame="(\d+)"/g)].map(m=>Number(m[1])),v.stack.map(f=>f.id));assert.equal((html.match(/data-node=/g)||[]).length,v.tree.length);
        if(!step.final){const cards=[...html.matchAll(/data-candidate-index="(\d+)" data-used="(true|false)" data-skipped="(true|false)" data-cut="(true|false)"/g)];assert.equal(cards.length,nums.length);
          assert.deepEqual(cards.filter(m=>m[2]==='true').map(m=>Number(m[1])),v.indices);
          assert.deepEqual(cards.filter(m=>m[3]==='true').map(m=>Number(m[1])),v.skipped);
          assert.deepEqual(cards.filter(m=>m[4]==='true').map(m=>Number(m[1])),v.tooLarge===true?nums.map((_,j)=>j).filter(j=>j>=f.i):[]);
          if(v.currentReady){assert.match(html,new RegExp(`data-sum="${v.locals.current.reduce((a,b)=>a+b,0)}" data-goal="${target}"`));assert.deepEqual([...html.matchAll(/data-segment-value="(\d+)"/g)].map(m=>Number(m[1])),v.locals.current);}
          else assert.doesNotMatch(html,/data-sum=/);
        }
      }
      const first=render(run.steps[0]);render(run.steps.at(-1));assert.equal(render(run.steps[0]),first);assert.equal(JSON.stringify(run),before);
    }
  }
});

test('40 loads shared drawing helpers before its renderer and inherits scoped day/night, sticky variables and horizontal code scrolling',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/combination-39.css'),'utf8'),script=fs.readFileSync(require.resolve('../public/script.js'),'utf8');
  assert.equal(p.debugMode,'line-by-line');
  assert.match(html,/combination-39\.css[^\n]*data-problem-ids="39 40"/);assert.match(html,/renderer-combination-39\.js[^\n]*data-problem-ids="39 40"/);
  assert.match(html,/combination-40\.css[^\n]*data-problem-ids="40"/);assert.match(html,/renderer-combination-40\.js[^\n]*data-problem-ids="40"/);
  assert.ok(html.indexOf('src="renderer-combination-39.js')<html.indexOf('src="renderer-combination-40.js'));
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/(?:renderer-)?combination-40\.(?:css|js)/);
  assert.match(script,/Boolean\(step.combination40View\)[^\n]*renderCombination40Pictures\(step\)/);assert.match(css,/\[data-theme="light"\] \.cs39-viz/);
  assert.match(css,/#varsPanel[^}]*position:sticky/);assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);assert.match(css,/\.code-line\s*\{[^}]*white-space:pre/);
});
