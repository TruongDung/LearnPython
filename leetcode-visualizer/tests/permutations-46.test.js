"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[46];
const cases=[[1],[0,1],[-10,0,10],[3,1,2],[1,2,3,4],[1,2,3,4,5,6]];
const factorial=n=>n<2?1:n*factorial(n-1),key=rows=>rows.map(row=>JSON.stringify(row)).sort();
function oracle(nums){const out=[],a=[...nums];function swap(k){if(k===a.length){out.push([...a]);return;}for(let j=k;j<a.length;j++){[a[k],a[j]]=[a[j],a[k]];swap(k+1);[a[k],a[j]]=[a[j],a[k]];}}swap(0);return out;}

test('46 returns all n! ordered permutations without changing the input, including six values and safe-integer extremes',()=>{
  for(const nums of [...cases,[Number.MIN_SAFE_INTEGER,0,Number.MAX_SAFE_INTEGER]]){const before=[...nums],run=p.builder(nums);assert.equal(run.answer.length,factorial(nums.length));assert.equal(new Set(key(run.answer)).size,run.answer.length);assert.deepEqual(key(run.answer),key(oracle(nums)));assert.deepEqual(nums,before);assert.deepEqual(run.original,before);assert.deepEqual(run.steps.at(-1).permutations46View.results,run.answer);assert.equal(run.steps.filter(s=>s.final).length,1);}
  assert.deepEqual(p.builder([1,2,3]).answer,[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]);
});

test('46 matches every completed Python line and local value, including all 720 results and shared current lists in six-element recursion',()=>{
  const python=`import sys,json,copy
payload=json.load(sys.stdin);scope={};filename='<p46>';exec(compile(payload['source'],filename,'exec'),scope);runs=[]
for nums in payload['cases']:
 events=[];pending={}
 def trace(frame,event,arg):
  if frame.f_code.co_filename!=filename or frame.f_code.co_name not in ('permute','backtrack'):return trace
  if event in ('line','return'):
   if frame in pending:
    x=frame.f_locals;frames=[];cursor=frame
    while cursor:
     if cursor.f_code.co_filename==filename and cursor.f_code.co_name=='backtrack':frames.append({**({'i':cursor.f_locals['i']} if 'i' in cursor.f_locals else {}),'currentLength':len(cursor.f_locals['current'])})
     cursor=cursor.f_back
    events.append({'line':pending.pop(frame),'scope':frame.f_code.co_name,'locals':copy.deepcopy({k:x[k] for k in ('nums','current','used','i') if k in x}),'count':len(x['result']),'tail':copy.deepcopy(x['result'][-12:]),'stack':list(reversed(frames))})
   if event=='line':pending[frame]=frame.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().permute(nums);sys.settrace(None);runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const proc=spawnSync('python3',['-c',python],{input:JSON.stringify({source:p.code.join('\n'),cases}),encoding:'utf8',maxBuffer:64*1024*1024});
  assert.equal(proc.status,0,proc.stderr);
  JSON.parse(proc.stdout).forEach((reference,c)=>{const run=p.builder(cases[c]);assert.deepEqual(run.answer,reference.answer);assert.equal(run.steps.length,reference.events.length,`case ${c}`);
    run.steps.forEach((step,i)=>{const v=step.permutations46View,e=reference.events[i],x=e.locals;
      assert.deepEqual(step.codeLines,[e.line],`case ${c}, event ${i}`);assert.equal(v.scope,e.scope);assert.deepEqual(v.locals,x);assert.deepEqual(v.stack.map(({id,...f})=>f),e.stack);
      assert.equal(v.currentReady,'current' in x);assert.equal(v.usedReady,'used' in x);assert.equal(v.resultCount,e.count);assert.deepEqual(v.results,step.final?reference.answer:e.tail);
      const indexed=x.i!==undefined;
      assert.deepEqual(step.vars.map(w=>w.value),[x.i??'—',indexed?x.nums[x.i]:'—',indexed?x.used[x.i]:'—',x.current??'—',x.used??'—',e.count]);
      assert.equal(v.source.line,e.line);assert.equal(v.source.text,p.code[e.line-1]);assert.equal(v.source.timing,'after');
    });
  });
});

test('46 marks used before append, pops before release, skips locked choices and copies each completed order',()=>{
  const run=p.builder([1,2,3]),before=JSON.stringify(run);let previous;
  for(const step of run.steps){const v=step.permutations46View,x=v.locals,i=x.i;
    assert.deepEqual(v.indices.map(i=>v.nums[i]),x.current||[]);assert.equal(new Set(v.indices).size,v.indices.length);assert.ok(v.indices.every(i=>x.used[i]));
    assert.ok(v.tree.length<=16);assert.ok(v.tree.every(node=>node.id<v.visitedCount));
    if(v.phase==='reserve'){assert.deepEqual(x.current,previous.locals.current);assert.equal(x.used[i],true);assert.ok(!v.indices.includes(i));}
    if(v.phase==='append'){assert.deepEqual(x.current,[...previous.locals.current,v.nums[i]]);assert.deepEqual(x.used,previous.locals.used);}
    if(v.phase==='pop'){assert.deepEqual(x.current,previous.locals.current.slice(0,-1));assert.equal(x.used[i],true);assert.ok(!v.indices.includes(i));}
    if(v.phase==='release'){assert.equal(x.used[i],false);assert.deepEqual(x.current,previous.locals.current);}
    if(v.phase==='blocked'){assert.equal(x.used[i],true);assert.deepEqual(x.current,previous.locals.current);assert.equal(v.visitedCount,previous.visitedCount);}
    if(v.phase==='save'){assert.deepEqual(v.results.at(-1),x.current);assert.ok(x.used.every(Boolean));}
    previous=v;
  }
  assert.deepEqual(run.steps.find(s=>s.permutations46View.phase==='save').permutations46View.results,[[1,2,3]]);assert.equal(JSON.stringify(run),before);
  const final=run.steps.at(-1).permutations46View;assert.deepEqual(final.locals.current,[]);assert.deepEqual(final.locals.used,[false,false,false]);assert.deepEqual(final.stack,[]);
});

test('46 supports the entire six-element trace and shares strict duplicate, length and numeric validation with live arguments',()=>{
  assert.deepEqual(p.liveArgs([-5,0,9]),[[-5,0,9]]);
  for(const input of [null,undefined,{},[],[1,1],[0,-0],[1,2,3,4,5,6,7],['1'],[1.2],[NaN],[Infinity],[Number.MAX_SAFE_INTEGER+1]]){assert.throws(()=>p.builder(input),/46/);assert.throws(()=>p.liveArgs(input),/46/);}
  const run=p.builder([1,2,3,4,5,6]);assert.equal(run.answer.length,720);assert.ok(run.steps.length>29000);assert.equal(run.steps.at(-1).permutations46View.results.length,720);
});
function renderer(lang){const host={innerHTML:'',querySelector:()=>null},context={lang,$:()=>host,escapeHtml:x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-permutations-46.js'),'utf8'),context);return step=>{context.renderPermutations46Pictures(step);return host.innerHTML;};}

test('46 diagrams show actual used flags and current slots, dashed pending moves, ordered results and real branch frames in both languages',()=>{
  for(const lang of ['vi','en']){const render=renderer(lang);
    for(const nums of [[1,2,3],[-10,0,10],[Number.MIN_SAFE_INTEGER,Number.MAX_SAFE_INTEGER]]){const run=p.builder(nums),before=JSON.stringify(run);
      for(const step of run.steps){const v=step.permutations46View,html=render(step),x=v.locals;
        assert.match(html,/p46-viz/);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object|<p\b|<table\b/);
        assert.deepEqual([...html.matchAll(/data-permutation="([\d,-]+)"/g)].map(m=>m[1]),v.results.map(row=>row.join(',')));
        assert.deepEqual([...html.matchAll(/data-frame="(\d+)"/g)].map(m=>Number(m[1])),v.stack.map(f=>f.id));assert.equal((html.match(/data-node=/g)||[]).length,v.tree.length);
        if(!step.final){const pool=[...html.matchAll(/data-pool-index="(\d+)" data-used="(true|false|pending)" data-in-current="(true|false)"/g)];assert.equal(pool.length,nums.length);assert.deepEqual(pool.map(m=>m[2]),v.usedReady?x.used.map(String):nums.map(()=>'pending'));assert.deepEqual(pool.filter(m=>m[3]==='true').map(m=>Number(m[1])).sort((a,b)=>a-b),[...v.indices].sort((a,b)=>a-b));
          const slots=[...html.matchAll(/data-current-slot="(\d+)" data-current-value="([\d-]*)" data-preview="(true|false)"/g)];assert.equal(slots.length,nums.length);assert.deepEqual(slots.filter(m=>m[2]).map(m=>Number(m[2])),x.current||[]);
          assert.deepEqual(slots.filter(m=>m[3]==='true').map(m=>Number(m[1])),['allow','reserve'].includes(v.phase)?[x.current.length]:[]);
          assert.deepEqual([...html.matchAll(/data-link="(\d+)-(\d+)"/g)].map(m=>[Number(m[1]),Number(m[2])]),v.indices.map((index,position)=>[index,position]));
        }
      }
      const first=render(run.steps[0]);render(run.steps.at(-1));assert.equal(render(run.steps[0]),first);assert.equal(JSON.stringify(run),before);
    }
    const final=render(p.builder([1,2,3,4,5,6]).steps.at(-1));assert.equal((final.match(/data-permutation=/g)||[]).length,720);
  }
});

test('46 assets are scoped, lazy and prioritized over the legacy renderer with light/dark and horizontal code scrolling',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/permutations-46.css'),'utf8'),script=fs.readFileSync(require.resolve('../public/script.js'),'utf8');
  assert.equal(p.debugMode,'line-by-line');assert.match(html,/permutations-46\.css[^\n]*data-problem-ids="46"/);assert.match(html,/renderer-permutations-46\.js[^\n]*data-problem-ids="46"/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/(?:renderer-)?permutations-46\.(?:css|js)/);
  assert.ok(script.indexOf('Boolean(step.permutations46View)')<script.indexOf('renderPermutation46View(step)'));
  assert.match(css,/\[data-theme="light"\] \.p46-viz/);assert.match(css,/#varsPanel[^}]*position:sticky/);assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);assert.match(css,/\.code-line\s*\{[^}]*white-space:pre/);
});
