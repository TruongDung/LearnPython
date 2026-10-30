'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[695],encode=grid=>grid.map(row=>row.join(',')).join('|');
const cases=['00100|01110|00100|00011','0','1','11|11','10|01','0000|0000','11111','1|0|1','110011|000000|111100','101|010|101'];
const build=(input,mode=1)=>mode===2?p.builder2(input):p.builder(input);
function oracle(grid){const rows=grid.length,cols=grid[0].length,parent=Array.from({length:rows*cols},(_,i)=>i),find=i=>parent[i]===i?i:parent[i]=find(parent[i]);for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(grid[r][c])for(const [dr,dc]of [[1,0],[0,1]]){const nr=r+dr,nc=c+dc;if(nr<rows&&nc<cols&&grid[nr][nc])parent[find(r*cols+c)]=find(nr*cols+nc);}const areas=new Map();grid.forEach((row,r)=>row.forEach((x,c)=>{if(x){const key=find(r*cols+c);areas.set(key,(areas.get(key)||0)+1);}}));return [...areas.values()].sort((a,b)=>a-b);}
test('695 both approaches find the largest area for all 512 binary 3×3 grids and preserve four-edge connectivity',()=>{
 for(let mask=0;mask<512;mask++){const grid=Array.from({length:3},(_,r)=>Array.from({length:3},(_,c)=>mask>>r*3+c&1)),areas=oracle(grid),expected=Math.max(0,...areas);for(const mode of [1,2]){const input=encode(grid),run=build(input,mode),v=run.steps.at(-1).maxIsland695View;assert.equal(run.answer,expected,`${mode} ${mask}`);assert.deepEqual(v.history.map(h=>h.area).sort((a,b)=>a-b),areas);assert.equal(v.maxArea,expected);assert.ok(v.image.flat().every(x=>x===0));assert.equal(run.steps.filter(s=>s.final).length,1);assert.deepEqual(run.original,grid);assert.deepEqual(v.history.map(h=>h.units),v.history.map(h=>h.area));if(expected)assert.equal(v.history.find(h=>h.id===v.bestOwner).area,expected);else assert.equal(v.bestOwner,null);}}
});
test('695 five added approaches match every 3×3 binary grid and preserve their own visited, label and union-find state',()=>{
 for(let mask=0;mask<512;mask++){
  const grid=Array.from({length:3},(_,r)=>Array.from({length:3},(_,c)=>mask>>r*3+c&1)),input=encode(grid),areas=oracle(grid),expected=Math.max(0,...areas);
  for(let approach=3;approach<=7;approach++){
   const run=p.builder(input,{approach}),v=run.steps.at(-1).maxIsland695View,code=p[`code${approach}`];
   assert.equal(run.answer,expected,`approach ${approach}, mask ${mask}`);
   assert.equal(v.approach,approach);
   assert.equal(v.maxArea,expected);
   assert.equal(v.source.text,code[v.source.line-1]);
   assert.equal(run.steps.at(-1).final,true);
   assert.deepEqual(v.history.map(h=>h.area).sort((a,b)=>a-b),areas);
   grid.forEach((row,r)=>row.forEach((land,c)=>{
    assert.equal(v.owners[r][c]>0,Boolean(land),`approach ${approach}, mask ${mask}, cell ${r},${c}`);
    assert.equal(v.counted[r][c],Boolean(land),`counted ${approach}, mask ${mask}, cell ${r},${c}`);
    assert.equal(v.image[r][c],approach===3?0:land);
   }));
   if(approach===4||approach===5)assert.deepEqual(v.visited,grid.map(row=>row.map(Boolean)));
   if(approach===7)assert.deepEqual(v.labels,v.owners);
   if(approach===6){
    const root=id=>{let current=id;while(v.parent[current]!==current)current=v.parent[current];return current;};
    for(let r=0;r<3;r++)for(let c=0;c<3;c++)if(grid[r][c])for(const[dr,dc]of [[1,0],[0,1]]){const nr=r+dr,nc=c+dc;if(nr<3&&nc<3&&grid[nr][nc])assert.equal(root(r*3+c),root(nr*3+nc));}
   }
  }
 }
});
test('695 all seven Python code blocks execute to the same largest-area answer',()=>{
 const grid=[[1,0,1,1],[1,1,0,0],[0,1,1,0]],payload=Array.from({length:7},(_,i)=>({source:p[`code${i+1===1?'':i+1}`].join('\n'),grid}));
 const python=`import json,sys\ncases=json.load(sys.stdin)\nfor case in cases:\n scope={};exec(case['source'],scope);print(scope['Solution']().maxAreaOfIsland([row[:] for row in case['grid']]))`;
 const result=spawnSync('python3',['-c',python],{input:JSON.stringify(payload),encoding:'utf8'});assert.equal(result.status,0,result.stderr);assert.deepEqual(result.stdout.trim().split('\n').map(Number),Array(7).fill(Math.max(...oracle(grid))));
});
test('695 matches every completed CPython line, live grid, local area, outer maximum and recursive return across both approaches',()=>{
 const runs=[1,2].flatMap(mode=>cases.map(input=>({mode,input}))),keys=['grid','rows','cols','directions','max_area','r','c','stack','area','cr','cc','dr','dc','nr','nc'];
 const payload=runs.map(r=>({source:p[r.mode===1?'code':'code2'].join('\n'),args:p.liveArgs(r.input)}));
 const python=`import sys,json,copy
payload=json.load(sys.stdin);runs=[];keys=${JSON.stringify(keys)}
for case in payload:
 scope={};filename='<area695>';exec(compile(case['source'],filename,'exec'),scope);events=[];pending={}
 def trace(frame,event,arg):
  if frame.f_code.co_filename!=filename or frame.f_code.co_name not in ('maxAreaOfIsland','dfs'):return trace
  if event in ('line','return'):
   if frame in pending:
    x=frame.f_locals;cursor=frame;frames=[];outer=frame
    while cursor:
     if cursor.f_code.co_filename==filename:
      if cursor.f_code.co_name=='dfs':frames.append({k:cursor.f_locals[k] for k in ('r','c','area') if k in cursor.f_locals})
      if cursor.f_code.co_name=='maxAreaOfIsland':outer=cursor
     cursor=cursor.f_back
    events.append({'line':pending.pop(frame),'scope':frame.f_code.co_name,'locals':copy.deepcopy({k:x[k] for k in keys if k in x}),'methodLocals':copy.deepcopy({k:outer.f_locals[k] for k in keys if k in outer.f_locals}),'frames':copy.deepcopy(list(reversed(frames)))})
   if event=='line':pending[frame]=frame.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().maxAreaOfIsland(*case['args']);sys.settrace(None);runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
 const proc=spawnSync('python3',['-c',python],{input:JSON.stringify(payload),encoding:'utf8',maxBuffer:64*1024*1024});assert.equal(proc.status,0,proc.stderr);
 JSON.parse(proc.stdout).forEach((ref,j)=>{const r=runs[j],run=build(r.input,r.mode);assert.equal(run.answer,ref.answer);assert.equal(run.steps.length,ref.events.length,JSON.stringify(r));run.steps.forEach((step,i)=>{const v=step.maxIsland695View,e=ref.events[i],label=`${r.mode} ${r.input} event ${i} L${e.line}`;assert.deepEqual(step.codeLines,[e.line],label);assert.equal(v.scope,e.scope,label);assert.deepEqual(v.locals,e.locals,label);assert.deepEqual(v.methodLocals,e.methodLocals,label);assert.deepEqual(v.image,e.locals.grid,label);assert.deepEqual(v.frames.map(({id,...f})=>f),e.frames,label);assert.equal(v.area,e.locals.area??null,label);assert.equal(v.maxArea,e.methodLocals.max_area??null,label);for(const w of step.vars)assert.equal(w.value,(w.name==='max_area'?e.methodLocals.max_area:e.locals[w.name])??'—',label+' watch '+w.name);assert.equal(v.source.timing,'after');assert.equal(v.source.text,payload[j].source.split('\n')[e.line-1]);});});
});
test('695 separates discovery, unit counting and maximum updates, preserves first best on ties and never invents a recursive zero local',()=>{
 for(const mode of [1,2]){const run=build('11011|00000|11100',mode),beforeRun=JSON.stringify(run);let before;for(const step of run.steps){const v=step.maxIsland695View;
  if(before){const changed=v.image.flatMap((row,r)=>row.flatMap((x,c)=>x!==before.image[r][c]?[[r,c]]:[]));assert.deepEqual(changed,v.paint?[[v.paint.r,v.paint.c]]:[]);const counted=v.counted.flatMap((row,r)=>row.flatMap((x,c)=>x!==before.counted[r][c]?[[r,c]]:[]));assert.deepEqual(counted,v.areaDelta?.unit?[v.areaDelta.unit]:[]);if(v.phase==='best-init')assert.equal(v.maxArea,0);else if(v.bestDelta){assert.equal(v.bestDelta.from,before.maxArea);assert.equal(v.bestDelta.candidate,v.methodLocals.area);assert.equal(v.maxArea,Math.max(before.maxArea,v.methodLocals.area));if(!v.bestDelta.improved)assert.equal(v.bestOwner,before.bestOwner);}else assert.equal(v.maxArea,before.maxArea);}
  if(v.phase==='return-outside'||v.phase==='return-water'){assert.equal(v.returned,0);assert.equal(v.area,null);assert.equal('area' in v.locals,false);}
  if(v.phase==='resume'){assert.equal(v.area,v.areaDelta.from+v.returned);assert.equal(v.areaDelta.add,v.returned);}
  if(v.guard){if(!v.guard.row)assert.equal(v.guard.col,null);if(!v.guard.row||!v.guard.col)assert.equal(v.guard.match,null);}
  const units=new Map();v.counted.forEach((row,r)=>row.forEach((x,c)=>{if(x)units.set(v.owners[r][c],(units.get(v.owners[r][c])||0)+1);}));for(const h of v.history){assert.equal(h.units,units.get(h.id)||0);assert.ok(h.units<=h.discovered);if(h.complete)assert.equal(h.area,h.units);}
  before=v;
 }const bests=run.steps.filter(s=>s.maxIsland695View.phase==='best').map(s=>s.maxIsland695View);assert.deepEqual(bests.map(v=>v.maxArea),[2,2,3]);assert.deepEqual(bests.map(v=>v.bestOwner),[1,1,3]);assert.equal(JSON.stringify(run),beforeRun);}
});
function renderer(lang,extra={}){const host={innerHTML:'',querySelector:()=>null},ctx={lang,$:()=>host,escapeHtml:x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),...extra};vm.createContext(ctx);for(const file of ['renderer-flood-pictures.js','renderer-max-area-island-695.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);return {ctx,render:step=>{ctx.renderMaxIsland695Pictures(step);return host.innerHTML;}};}
test('695 renders real per-frame counters, counted squares, live numeric grid and maximum island in both languages and after rewind',()=>{
 for(const lang of ['vi','en']){const {render}=renderer(lang);for(const mode of [1,2])for(const input of cases){const run=build(input,mode),before=JSON.stringify(run);for(const step of run.steps){const v=step.maxIsland695View,html=render(step);assert.match(html,/ff695-viz/);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object|<p\b|<table\b/);assert.equal(html.match(/data-area="([^"]*)"/)[1],v.area===null?'':String(v.area));assert.equal(html.match(/data-max="([^"]*)"/)[1],v.maxArea===null?'':String(v.maxArea));assert.equal((html.match(/data-counted="true"/g)||[]).length,v.counted.flat().filter(Boolean).length);const cells=[...html.matchAll(/data-cell="(\d+),(\d+)" data-value="([01])" data-owner="(\d+)"/g)];assert.equal(cells.length,v.image.length*v.image[0].length);for(const m of cells){assert.equal(Number(m[3]),v.image[Number(m[1])][Number(m[2])]);assert.equal(Number(m[4]),v.owners[Number(m[1])][Number(m[2])]);}assert.deepEqual([...html.matchAll(/data-island="(\d+)" data-units="(\d+)"/g)].map(m=>[Number(m[1]),Number(m[2])]),v.history.map(h=>[h.id,h.units]));if(v.phase==='island-return'){assert.match(html,/area = dfs/);assert.doesNotMatch(html,/<code>return 0/);}}
 const first=render(run.steps[0]);render(run.steps.at(-1));assert.equal(render(run.steps[0]),first);assert.equal(JSON.stringify(run),before);}}
});
test('695 added approaches render their own work state and rewind in both languages',()=>{
 for(const lang of ['vi','en']){const {render}=renderer(lang);for(let approach=3;approach<=7;approach++){const run=p.builder('110|010|001',{approach}),before=JSON.stringify(run);for(const step of run.steps){const html=render(step);assert.match(html,/ff695-viz/);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object/);assert.match(html,new RegExp(['BFS queue · in-place','DFS stack · visited','BFS queue · visited','Union-Find','Component labels'][approach-3]));if(approach===6)assert.match(html,/data-parent=/);if(approach===7)assert.match(html,/component labels/);}const first=render(run.steps[0]);render(run.steps.at(-1));assert.equal(render(run.steps[0]),first);assert.equal(JSON.stringify(run),before);}}
});
test('695 unit and maximum navigation visits only actual completed source updates, including the smaller second island and all-water input',()=>{
 for(const mode of [1,2]){const handlers={},host={innerHTML:'',querySelector:selector=>({addEventListener:(event,fn)=>handlers[selector]=fn})},run=build('00100|01110|00100|00011',mode);const {ctx,render}=renderer('vi',{$:()=>host,steps:run.steps,stepIndex:0,stopPlay:()=>{},renderStep:()=>{}});render(run.steps[0]);handlers['#ff695NextArea']();assert.ok(ctx.steps[ctx.stepIndex].maxIsland695View.areaDelta.unit);handlers['#ff695NextBest']();assert.equal(ctx.steps[ctx.stepIndex].maxIsland695View.maxArea,5);handlers['#ff695NextBest']();assert.deepEqual(ctx.steps[ctx.stepIndex].maxIsland695View.bestDelta,{from:5,candidate:2,to:5,improved:false,owner:2});handlers['#ff695NextBest']();assert.equal(ctx.stepIndex,run.steps.length-1);ctx.steps=build('00|00',mode).steps;ctx.stepIndex=0;render(ctx.steps[0]);handlers['#ff695NextArea']();assert.equal(ctx.stepIndex,ctx.steps.length-1);assert.equal(ctx.steps[ctx.stepIndex].maxIsland695View.maxArea,0);}
});
test('695 validates the same typed grid for all seven code blocks, correctly labels approaches and lazily shares day/night boards with horizontal code',()=>{
 assert.equal(p.debugMode,'line-by-line');assert.deepEqual(p.liveArgs('10|01'),[[[1,0],[0,1]]]);assert.deepEqual(p.liveArgs('"1","0"'),[[[1,0]]]);for(const input of ['',null,{},[],[[1]],'1|10','2','-1','0,a']){assert.throws(()=>p.builder(input));assert.throws(()=>p.liveArgs(input));for(let approach=3;approach<=7;approach++)assert.throws(()=>p[`builder${approach}`](input));}assert.deepEqual(p.builder('11',{approach:2}),p.builder2('11'));assert.equal(p.extraParams[0].options.length,7);assert.ok(p.code7.length);assert.match(JSON.stringify(p.extraParams),/BFS/);
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),script=fs.readFileSync(require.resolve('../public/script.js'),'utf8'),css=fs.readFileSync(require.resolve('../public/flood-pictures.css'),'utf8');assert.match(html,/flood-pictures\.css[^\n]*data-problem-ids="733 200 695(?: 1020)?(?: 1905)?(?: 463)?(?: 1971)?(?: 1973 2003)?(?: 529 1034 1992 2658 711 1559 407 4003 3310 261 305 310 675 947 990 1284 1466)?"/);assert.match(html,/renderer-flood-pictures\.js[^\n]*data-problem-ids="733 200 695(?: 1020)?(?: 1905)?(?: 463)?(?: 1971)?(?: 1973 2003)?(?: 529 1034 1992 2658 711 1559 407 4003 3310 261 305 310 675 947 990 1284 1466)?"/);assert.match(html,/max-area-island-695\.css[^\n]*data-problem-ids="695"/);assert.match(html,/renderer-max-area-island-695\.js[^\n]*data-problem-ids="695"/);assert.ok(html.indexOf('src="renderer-flood-pictures.js')<html.indexOf('src="renderer-max-area-island-695.js'));assert.match(script,/Boolean\(step.maxIsland695View\)[^\n]*renderMaxIsland695Pictures\(step\)/);assert.match(css,/\[data-theme="light"\] \.ffp-viz/);assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);assert.match(css,/\.code-line\s*\{[^}]*white-space:pre/);assert.match(css,/#varsPanel[^}]*position:sticky/);
});
