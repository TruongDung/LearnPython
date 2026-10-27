"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[52];
const cases=[1,2,3,4,5,6,7,8],build=n=>p.builder([n]);
function oracle(n){const a=Array.from({length:n},(_,i)=>i);let count=0;function permute(k){if(k===n){if(a.every((c,r)=>a.every((d,s)=>r===s||Math.abs(c-d)!==Math.abs(r-s))))count++;return;}for(let j=k;j<n;j++){[a[k],a[j]]=[a[j],a[k]];permute(k+1);[a[k],a[j]]=[a[j],a[k]];}}permute(0);return count;}
const rows=(n,placement)=>Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>placement[r]===c?'Q':'.').join(''));

test('52 returns only the integer count for all supported boards, including zero-solution cases and n=8',()=>{
  const expected=[0,1,0,0,2,10,4,40,92];
  for(const n of cases){const run=build(n);assert.equal(run.answer,expected[n]);assert.equal(run.answer,oracle(n));assert.equal(typeof run.answer,'number');assert.equal(run.steps.filter(s=>s.final).length,1);assert.equal(run.steps.at(-1).nQueens52View.count,expected[n]);assert.equal(run.steps.filter(s=>s.nQueens52View.phase==='count').length,expected[n]);}
  assert.doesNotMatch(p.code.join('\n'),/result|board|append\(\[|\.join/);assert.equal(p.complexity.space,'O(n)');
});

test('52 matches every completed CPython line, actual local, live nonlocal count, occupied set and recursive frame through n=8',()=>{
  const python=`import sys,json,copy
payload=json.load(sys.stdin);scope={};filename='<nq52>';exec(compile(payload['source'],filename,'exec'),scope);runs=[]
for n in payload['cases']:
 events=[];pending={}
 def trace(frame,event,arg):
  if frame.f_code.co_filename!=filename or frame.f_code.co_name not in ('totalNQueens','backtrack'):return trace
  if event in ('line','return'):
   if frame in pending:
    x=frame.f_locals;frames=[];cursor=frame
    while cursor:
     if cursor.f_code.co_filename==filename and cursor.f_code.co_name=='backtrack':
      z=cursor.f_locals;frames.append({'row':z['row'],**({'col':z['col']} if 'col' in z else {}),'queenCount':len(z['placement']),'count':z['count']})
     cursor=cursor.f_back
    events.append({'line':pending.pop(frame),'scope':frame.f_code.co_name,'locals':copy.deepcopy({k:x[k] for k in ('n','row','col','count','placement') if k in x}),'sets':{k:sorted(x[k]) if k in x else None for k in ('cols','diag_down','diag_up')},'stack':list(reversed(frames))})
   if event=='line':pending[frame]=frame.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().totalNQueens(n);sys.settrace(None);runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const proc=spawnSync('python3',['-c',python],{input:JSON.stringify({source:p.code.join('\n'),cases}),encoding:'utf8',maxBuffer:128*1024*1024});assert.equal(proc.status,0,proc.stderr);
  JSON.parse(proc.stdout).forEach((reference,c)=>{const n=cases[c],run=build(n);assert.equal(run.answer,reference.answer);assert.equal(run.steps.length,reference.events.length,`n=${n}`);
    run.steps.forEach((step,i)=>{const v=step.nQueens52View,e=reference.events[i],x=e.locals;
      assert.deepEqual(step.codeLines,[e.line],`n=${n}, event=${i}`);assert.notEqual(e.line,9,'nonlocal is a compile-time declaration');assert.equal(v.scope,e.scope);assert.deepEqual(v.locals,x);assert.deepEqual(v.sets,e.sets);assert.deepEqual(v.stack.map(({id,...frame})=>frame),e.stack);
      assert.equal(v.count,x.count);assert.deepEqual(v.board,x.placement?rows(n,x.placement):null);assert.deepEqual(v.queens,(x.placement||[]).map((col,row)=>[row,col]));
      assert.deepEqual(step.vars.map(w=>w.value),[x.row??'—',x.col??'—',e.sets.cols??'—',e.sets.diag_down??'—',e.sets.diag_up??'—',x.count]);
      assert.equal(v.activeRow,x.row!==undefined&&x.row<n?x.row:null);assert.equal(v.source.line,e.line);assert.equal(v.source.text,p.code[e.line-1]);assert.equal(v.source.timing,'after');
    });
  });
});

test('52 increments exactly once per complete arrangement and never decrements count during undo or recursive returns',()=>{
  const run=build(4),before=JSON.stringify(run);let previous;
  for(const step of run.steps){const v=step.nQueens52View,a=v.active;
    if(v.phase==='count'){assert.equal(v.locals.row,v.n);assert.equal(v.active,null);assert.equal(v.activeRow,null);assert.equal(v.queens.length,v.n);assert.equal(v.count,previous.count+1);assert.deepEqual(v.increment,{from:previous.count,to:v.count});}
    else {assert.equal(v.increment,null);if(previous)assert.equal(v.count,previous.count);}
    if(v.check){const column=!v.sets.cols.includes(a.col),down=column?!v.sets.diag_down.includes(a.row-a.col):null,up=column&&down?!v.sets.diag_up.includes(a.row+a.col):null;assert.deepEqual(v.check,{column,down,up,allowed:Boolean(column&&down&&up)});}
    if(v.phase==='place'){assert.deepEqual(v.locals.placement,[...previous.locals.placement,a.col]);assert.deepEqual(v.sets,previous.sets);}
    if(v.phase==='remove'){assert.deepEqual(v.locals.placement,previous.locals.placement.slice(0,-1));assert.deepEqual(v.sets,previous.sets);}
    if(['allow','blocked','up-add','up-remove','root-return','done'].includes(v.phase)){assert.deepEqual(v.sets.cols,v.queens.map(q=>q[1]).sort((a,b)=>a-b));assert.deepEqual(v.sets.diag_down,v.queens.map(([r,c])=>r-c).sort((a,b)=>a-b));assert.deepEqual(v.sets.diag_up,v.queens.map(([r,c])=>r+c).sort((a,b)=>a-b));}
    previous=v;
  }
  assert.equal(JSON.stringify(run),before);const first=run.steps.find(s=>s.nQueens52View.phase==='count').nQueens52View;assert.equal(first.count,1);assert.equal(first.samples.length,1);
  const final=run.steps.at(-1).nQueens52View;assert.equal(final.count,2);assert.deepEqual(final.locals.placement,[]);assert.deepEqual(final.sets,{cols:[],diag_down:[],diag_up:[]});assert.deepEqual(final.stack,[]);
});

test('52 keeps complete traces and only a bounded visual history while validating the same input as live Python',()=>{
  assert.deepEqual(p.liveArgs([4]),[4]);assert.deepEqual(p.liveArgs(4),[4]);assert.equal(p.maxInput,8);
  for(const input of [0,9,-1,1.5,NaN,Infinity,null,undefined,'4',{},[],[4,5],[true]]){assert.throws(()=>p.builder(input),/52/);assert.throws(()=>p.liveArgs(input),/52/);}
  const run=build(8);assert.ok(run.steps.length>54000);assert.equal(run.answer,92);assert.deepEqual(run.steps.at(-1).nQueens52View.samples.map(s=>s.number),[90,91,92]);
  for(const step of run.steps){const v=step.nQueens52View;assert.ok(v.samples.length<=3);for(const sample of v.samples){assert.ok(sample.number<=v.count);assert.equal(sample.placement.length,8);assert.equal(new Set(sample.placement).size,8);assert.ok(sample.placement.every((col,r)=>sample.placement.every((c,s)=>r===s||Math.abs(col-c)!==Math.abs(r-s))));}}
});
function renderer(lang,extra={}){const host={innerHTML:'',querySelector:()=>null},context={lang,$:()=>host,escapeHtml:x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),...extra};vm.createContext(context);for(const file of ['renderer-n-queens-51.js','renderer-n-queens-52.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),context);return {context,render:step=>{context.renderNQueens52Pictures(step);return host.innerHTML;}};}

test('52 pictures show the actual counter change, placement, trial cells, attackers and counted examples without mutating snapshots',()=>{
  for(const lang of ['vi','en']){const {render}=renderer(lang);
    for(const n of [1,2,3,4]){const run=build(n),before=JSON.stringify(run);
      for(const step of run.steps){const v=step.nQueens52View,html=render(step);assert.match(html,/nq52-viz/);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object|#51|<p\b|<table\b/);
        assert.equal(Number(html.match(/data-count="(\d+)"/)[1]),v.count);assert.equal(html.match(/data-increment="(true|false)"/)[1],String(v.phase==='count'));
        if(v.increment)assert.equal(Number(html.match(/data-from="(\d+)"/)[1]),v.increment.from);else assert.doesNotMatch(html,/data-from=/);
        assert.deepEqual([...html.matchAll(/data-counted="(\d+)" data-placement="([\d,]+)"/g)].map(m=>({number:Number(m[1]),placement:m[2].split(',').map(Number)})),v.samples);
        assert.deepEqual([...html.matchAll(/data-frame="(\d+)"/g)].map(m=>Number(m[1])),v.stack.map(f=>f.id));
        const cells=[...html.matchAll(/data-cell="(\d+)-(\d+)" data-value="([.Q])" data-preview="(true|false)" data-attacker="(true|false)"/g)];
        if(!step.final&&v.board){assert.equal(cells.length,n*n);assert.equal(cells.map(m=>m[3]).join(''),v.board.join(''));assert.deepEqual(cells.filter(m=>m[5]==='true').map(m=>[Number(m[1]),Number(m[2])]),v.phase==='blocked'?v.attacks:[]);assert.deepEqual(cells.filter(m=>m[4]==='true').map(m=>[Number(m[1]),Number(m[2])]),v.active&&['choose','allow','blocked'].includes(v.phase)?[[v.active.row,v.active.col]]:[]);assert.deepEqual([...html.matchAll(/data-placement-row="(\d+)" data-placement-col="(\d+)"/g)].map(m=>Number(m[2])),v.locals.placement);}
        else assert.equal(cells.length,0);
      }
      const first=render(run.steps[0]);render(run.steps.at(-1));assert.equal(render(run.steps[0]),first);assert.equal(JSON.stringify(run),before);
    }
    const final=render(build(8).steps.at(-1));assert.match(final,/data-count="92"/);assert.equal((final.match(/data-counted=/g)||[]).length,3);
  }
});

test('52 next-increment navigation visits real counter updates, preserves actual count and handles boards with no solution',()=>{
  let handler,stopped=0,rendered=0;const button={addEventListener:(event,fn)=>{handler=fn;}},host={innerHTML:'',querySelector:s=>s==='#nq52NextCount'?button:null},run=build(4);
  const {context,render}=renderer('vi',{$:()=>host,steps:run.steps,stepIndex:0,stopPlay:()=>stopped++,renderStep:()=>rendered++});render(run.steps[0]);handler();assert.equal(context.steps[context.stepIndex].nQueens52View.phase,'count');assert.equal(context.steps[context.stepIndex].nQueens52View.count,1);handler();assert.equal(context.steps[context.stepIndex].nQueens52View.count,2);handler();assert.equal(context.stepIndex,context.steps.length-1);assert.equal(stopped,3);assert.equal(rendered,3);
  context.steps=build(2).steps;context.stepIndex=0;render(context.steps[0]);handler();assert.equal(context.stepIndex,context.steps.length-1);assert.equal(context.steps[context.stepIndex].nQueens52View.count,0);
});

test('52 lazily loads shared board helpers before its counter renderer and inherits light/dark, sticky watches and horizontal source scrolling',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/n-queens-51.css'),'utf8'),script=fs.readFileSync(require.resolve('../public/script.js'),'utf8');
  assert.equal(p.debugMode,'line-by-line');assert.match(html,/n-queens-51\.css[^\n]*data-problem-ids="51 52"/);assert.match(html,/renderer-n-queens-51\.js[^\n]*data-problem-ids="51 52"/);assert.match(html,/n-queens-52\.css[^\n]*data-problem-ids="52"/);assert.match(html,/renderer-n-queens-52\.js[^\n]*data-problem-ids="52"/);assert.ok(html.indexOf('src="renderer-n-queens-51.js')<html.indexOf('src="renderer-n-queens-52.js'));assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/(?:renderer-)?n-queens-52\.(?:css|js)/);
  assert.match(script,/Boolean\(step.nQueens52View\)[^\n]*renderNQueens52Pictures\(step\)/);assert.match(css,/\[data-theme="light"\] \.nq51-viz/);assert.match(css,/#varsPanel[^}]*position:sticky/);assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);assert.match(css,/\.code-line\s*\{[^}]*white-space:pre/);
});
