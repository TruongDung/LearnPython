'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[1971],encode=edges=>edges.map(e=>e.join(',')).join(';'),build=(input,params,mode)=>mode===2?p.builder2(input,params):mode===3?p.builder3(input,params):p.builder(input,params);
const cases=[{input:p.defaultInput,params:{n:6,source:0,destination:5}},{input:p.defaultInput,params:{n:6,source:0,destination:2}},{input:'',params:{n:1,source:0,destination:0}},{input:'',params:{n:3,source:0,destination:2}},{input:'0,1;1,2;2,3',params:{n:4,source:0,destination:3}},{input:'0,1;1,2;2,0;1,3;3,4',params:{n:5,source:0,destination:4}},{input:'0,0;0,1;0,1',params:{n:3,source:0,destination:2}},{input:'0,1;1,2',params:{n:4,source:2,destination:2}}];
function closure(n,edges){const connected=Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>r===c));for(const[a,b]of edges)connected[a][b]=connected[b][a]=true;for(let k=0;k<n;k++)for(let a=0;a<n;a++)for(let b=0;b<n;b++)connected[a][b]||=connected[a][k]&&connected[k][b];return connected;}
test('1971 all three approaches match transitive closure for all 4-vertex undirected graphs and source/destination pairs',()=>{
 const pairs=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
 for(let mask=0;mask<64;mask++){const edges=pairs.filter((_,j)=>mask>>j&1),expected=closure(4,edges);for(let source=0;source<4;source++)for(let destination=0;destination<4;destination++)for(const mode of [1,2,3]){const run=build(encode(edges),{n:4,source,destination},mode);assert.equal(run.answer,expected[source][destination]);assert.equal(run.steps.at(-1).final,true);assert.equal(run.steps.filter(s=>s.final).length,1);assert.ok(run.steps.every(s=>s.codeBlock===mode));}}
});
test('1971 matches every completed Python statement, exact adjacency, visited, worklist and recursive frame locals',()=>{
 const runs=[1,2,3].flatMap(mode=>cases.map(c=>({...c,mode}))),payload=runs.map(r=>({source:p[r.mode===1?'code':'code'+r.mode].join('\n'),args:p.liveArgs(r.input,r.params)}));
 const python=`import sys,json,copy
from collections import deque
payload=json.load(sys.stdin);runs=[];keys=['n','edges','source','destination','adj','visited','stack','q','node','nb','a','b']
def normalize(value):
 if isinstance(value,set):return sorted(value)
 if isinstance(value,deque):return list(value)
 return copy.deepcopy(value)
def local(frame):return {k:normalize(frame.f_locals[k]) for k in keys if k in frame.f_locals}
for case in payload:
 scope={};filename='<path1971>';exec(compile(case['source'],filename,'exec'),scope);events=[];pending={}
 def trace(frame,event,arg):
  if frame.f_code.co_filename!=filename or frame.f_code.co_name not in ('validPath','dfs'):return trace
  if event in ('line','return'):
   if frame in pending:
    cursor=frame;outer=frame;frames=[]
    while cursor:
     if cursor.f_code.co_filename==filename:
      if cursor.f_code.co_name=='validPath':outer=cursor
      if cursor.f_code.co_name=='dfs':frames.append({k:cursor.f_locals[k] for k in ('node','nb') if k in cursor.f_locals})
     cursor=cursor.f_back
    events.append({'line':pending.pop(frame),'scope':frame.f_code.co_name,'locals':local(frame),'methodLocals':local(outer),'frames':list(reversed(frames))})
   if event=='line':pending[frame]=frame.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().validPath(*case['args']);sys.settrace(None);runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
 const proc=spawnSync('python3',['-c',python],{input:JSON.stringify(payload),encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(proc.status,0,proc.stderr);
 JSON.parse(proc.stdout).forEach((ref,j)=>{const r=runs[j],run=build(r.input,r.params,r.mode);assert.equal(run.answer,ref.answer);assert.equal(run.steps.length,ref.events.length,JSON.stringify(r));run.steps.forEach((s,i)=>{const e=ref.events[i],v=s.path1971View,label=`${JSON.stringify(r)} event ${i} L${e.line}`;assert.deepEqual(s.codeLines,[e.line],label);assert.equal(v.scope,e.scope,label);assert.deepEqual(v.locals,e.locals,label);assert.deepEqual(v.methodLocals,e.methodLocals,label);assert.deepEqual(v.frames.map(({id,...f})=>f),e.frames,label);assert.equal(v.sourceLine.text,payload[j].source.split('\n')[e.line-1]);assert.equal(v.sourceLine.timing,'after');assert.deepEqual(v.adj,e.locals.adj??null,label);if(e.locals.visited!==undefined){const visited=r.mode===2?e.locals.visited:e.locals.visited.flatMap((b,k)=>b?[k]:[]);assert.deepEqual(v.visited,visited,label);}if(r.mode!==2)assert.deepEqual(v.work,e.locals[r.mode===1?'stack':'q']??null,label);for(const w of s.vars)assert.deepEqual(w.value,e.locals[w.name]??'—',label+' watch '+w.name);});});
});
test('1971 does not mark, queue, return a final answer or reveal a successful route before the matching source statement',()=>{
 for(const mode of [1,2,3])for(const c of cases){const run=build(c.input,c.params,mode),beforeRun=JSON.stringify(run);let before;for(const step of run.steps){const v=step.path1971View;assert.equal(v.answer===null,!step.final);if(v.foundPath){assert.equal(v.foundPath[0],v.source);assert.equal(v.foundPath.at(-1),v.destination);for(let j=1;j<v.foundPath.length;j++)assert.ok(v.edges.some(([a,b])=>a===v.foundPath[j-1]&&b===v.foundPath[j]||b===v.foundPath[j-1]&&a===v.foundPath[j]));}
  if(before){if(v.visited.length>before.visited.length)assert.equal(v.phase,'visit');if(JSON.stringify(v.adj)!==JSON.stringify(before.adj))assert.ok(['adj-init','arc'].includes(v.phase));if(mode!==2&&JSON.stringify(v.work)!==JSON.stringify(before.work))assert.ok(['work-init','append','take'].includes(v.phase));if(!before.foundPath&&v.foundPath)assert.equal(v.phase,'return-true');}
  if(v.phase==='arc'){const b=v.building;assert.equal(v.arcs[b.index][b.direction],true);assert.equal(v.adj[v.active].at(-1),v.neighbor);}if(v.phase==='return-false'&&v.scope==='dfs')assert.equal(v.answer,null);before=v;
 }assert.equal(JSON.stringify(run),beforeRun);}
 const same=cases[2];for(const mode of [1,3]){const run=build(same.input,same.params,mode);assert.equal(run.steps.length,2);assert.equal(run.steps.at(-1).path1971View.adj,null);assert.deepEqual(run.steps.at(-1).path1971View.visited,[]);}const rec=build(same.input,same.params,2);assert.equal(rec.answer,true);assert.deepEqual(rec.steps.at(-1).path1971View.visited,[]);
 const recFail=build(cases[0].input,cases[0].params,2);assert.ok(recFail.steps.some(s=>s.path1971View.phase==='return-false'&&s.path1971View.frames.length>1));assert.equal(recFail.answer,false);
});
function renderer(lang,extra={}){const host={innerHTML:'',querySelector:()=>null},ctx={lang,$:()=>host,escapeHtml:x=>String(x),...extra};vm.createContext(ctx);for(const file of ['renderer-flood-pictures.js','renderer-find-path-1971.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);return {ctx,render:step=>{ctx.renderPath1971Pictures(step);return host.innerHTML;}};}
test('1971 renders truthful graph, built arcs, visited chips, actual work and answers in both themes/languages and after rewind',()=>{
 for(const lang of ['vi','en']){const {render}=renderer(lang);for(const mode of [1,2,3])for(const c of cases){const run=build(c.input,c.params,mode),before=JSON.stringify(run);for(const s of run.steps){const v=s.path1971View,html=render(s);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object|<p\b|<table\b/);assert.equal(html.match(/data-answer="([^"]*)"/)[1],v.answer===null?'unknown':String(v.answer));assert.deepEqual([...html.matchAll(/data-node="(\d+)" data-visited="(true|false)" data-pending="(true|false)"/g)].map(m=>[+m[1],m[2],m[3]]),Array.from({length:v.n},(_,id)=>[id,String(v.visited.includes(id)),String(mode===2?v.frames.some(f=>f.node===id):(v.work??[]).includes(id))]));assert.deepEqual([...html.matchAll(/data-edge="(\d+)" data-built="([012])"/g)].map(m=>[+m[1],+m[2]]),v.edges.map((e,j)=>[j,v.arcs[j].filter(Boolean).length]));assert.deepEqual([...html.matchAll(/data-work-node="(\d+)"/g)].map(m=>+m[1]),mode===2?v.frames.map(f=>f.node):v.work??[]);assert.deepEqual([...html.matchAll(/data-route-node="(\d+)"/g)].map(m=>+m[1]),v.foundPath??v.route);}
 const initial=render(run.steps[0]);render(run.steps.at(-1));assert.equal(render(run.steps[0]),initial);assert.equal(JSON.stringify(run),before);}}
 const {ctx}=renderer('vi');const large=build('',{n:30,source:0,destination:29},1).steps[0].path1971View,positions=ctx.g1971Positions(large);assert.equal(positions.points.length,30);assert.ok(positions.points.flat().every(Number.isFinite));
});
test('1971 navigation jumps to real visit/neighbor/return events, handles early return and preserves expanded adjacency lists',()=>{
 for(const mode of [1,2,3]){const handlers={},host={innerHTML:'',querySelector:s=>s==='.g1971-details'?{open:true}:{addEventListener:(event,fn)=>handlers[s]=fn}},c=cases[0],run=build(c.input,c.params,mode),{ctx,render}=renderer('vi',{$:()=>host,steps:run.steps,stepIndex:0,stopPlay:()=>{},renderStep:()=>{}});render(run.steps[0]);assert.match(host.innerHTML,/g1971-details" open/);handlers['#g1971NextVisit']();assert.equal(ctx.steps[ctx.stepIndex].path1971View.phase,'visit');handlers['#g1971NextEdge']();assert.equal(ctx.steps[ctx.stepIndex].path1971View.phase,'neighbor');handlers['#g1971NextReturn']();assert.ok(['return-true','return-false','done'].includes(ctx.steps[ctx.stepIndex].path1971View.phase));for(let i=0;i<30;i++)handlers['#g1971NextReturn']();assert.equal(ctx.stepIndex,run.steps.length-1);ctx.steps=build('',{n:1,source:0,destination:0},mode).steps;ctx.stepIndex=0;render(ctx.steps[0]);handlers['#g1971NextVisit']();assert.equal(ctx.stepIndex,ctx.steps.length-1);assert.equal(ctx.steps.at(-1).path1971View.answer,true);}
});
test('1971 validates vertex ranges and live arguments and lazily loads light/dark, sticky watches and horizontal code',()=>{
 assert.equal(p.debugMode,'line-by-line');assert.deepEqual(p.liveArgs('0,1;1,2',{n:'3',source:'0',destination:'2'}),[3,[[0,1],[1,2]],0,2]);for(const input of [null,{},[],[[0,1]],'0,','0,a','0,1,2','-1,0','0,6','1.5,2'])for(const fn of [p.builder,p.builder2,p.builder3,p.liveArgs])assert.throws(()=>fn(input));for(const params of [{n:0},{n:2.5},{source:-1},{destination:6},{n:2,source:0,destination:2}])assert.throws(()=>p.builder('',params));for(const mode of [2,3])assert.deepEqual(p.builder(cases[0].input,{...cases[0].params,approach:mode}),build(cases[0].input,cases[0].params,mode));
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/flood-pictures.css'),'utf8'),script=fs.readFileSync(require.resolve('../public/script.js'),'utf8');assert.match(html,/flood-pictures\.css[^\n]*data-problem-ids="733 200 695 1020 1905 463 1971"/);assert.match(html,/renderer-flood-pictures\.js[^\n]*data-problem-ids="733 200 695 1020 1905 463 1971"/);assert.match(html,/find-path-1971\.css[^\n]*data-problem-ids="1971"/);assert.match(html,/renderer-find-path-1971\.js[^\n]*data-problem-ids="1971"/);assert.ok(html.indexOf('src="renderer-flood-pictures.js')<html.indexOf('src="renderer-find-path-1971.js'));assert.match(script,/Boolean\(step.path1971View\)[^\n]*renderPath1971Pictures\(step\)/);assert.match(css,/\[data-theme="light"\] \.ffp-viz/);assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);assert.match(css,/\.code-line\s*\{[^}]*white-space:pre/);assert.match(css,/#varsPanel[^}]*position:sticky/);
});
