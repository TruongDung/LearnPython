'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const lessons=require('../problems/flood-batch-2026'),{SUPPORTED,FLOOD_FILL_SUBTABS}=require('../problems');
const ids=[529,1034,1992,2658,711,1559,407,4003,3310,261,305,310,675,947,990,1284,1466];
const defaults=ids.map(id=>({id,input:lessons[id].defaultInput,params:{}}));
const cases=[...defaults,
 {id:529,input:'M',params:{sr:0,sc:0}},{id:529,input:'1',params:{sr:0,sc:0}},{id:529,input:'EE|EE',params:{sr:0,sc:0}},
 {id:1034,input:'2,2|2,2',params:{row:0,col:0,color:2}},{id:1034,input:'1,2|2,2',params:{row:0,col:0,color:3}},
 {id:1992,input:'0'},{id:1992,input:'1,1,0,1|1,1,0,1'},
 {id:2658,input:'0'},{id:2658,input:'3,0,4|2,0,1'},
 {id:711,input:'0'},{id:711,input:'1,0,1|1,0,1'},{id:711,input:'1,0,0,1,1|1,1,0,1,0'},
 {id:1559,input:'a'},{id:1559,input:'aa|aa'},{id:1559,input:'ab|ba'},{id:1559,input:'aaa|bca|aaa'},
 {id:407,input:'5,5,5|5,1,5|5,5,5'},{id:407,input:'1,1,1|1,5,1|1,1,1'},{id:407,input:'1'},
 {id:4003,input:'0'},{id:4003,input:'0,0,0'},{id:4003,input:'0,3|5,0'},
 {id:3310,input:'0-1,1-2',params:{n:4,k:0}},{id:3310,input:'0-1,1-0,2-3',params:{n:4,k:0}},{id:3310,input:'[]',params:{n:1,k:0}},
 {id:261,input:'[]',params:{n:1}},{id:261,input:'0,1',params:{n:3}},{id:261,input:'0,1;1,2;2,0',params:{n:4}},
 {id:305,input:'1,1;0,0;0,0'},{id:305,input:'2,2;0,0;1,1;0,1;1,0'},
 {id:310,input:'[]',params:{n:1}},{id:310,input:'0-1',params:{n:2}},{id:310,input:'0-1,1-2,2-3,3-4',params:{n:5}},
 {id:675,input:'0,2'},{id:675,input:'1,2,3|0,0,0|7,6,5'},{id:675,input:'0'},{id:675,input:'2'},
 {id:947,input:'[]'},{id:947,input:'0,0;1,1'},{id:947,input:'0,0;0,1;0,2'},
 {id:990,input:'a!=a'},{id:990,input:'a==b,b==c,a!=c'},{id:990,input:'a==a,b!=c'},{id:990,input:'[]'},
 {id:1284,input:'0'},{id:1284,input:'1'},{id:1284,input:'0,1'},{id:1284,input:'1,0|0,0'},
 {id:1466,input:[1],params:{connections:'[]'}},{id:1466,input:[3],params:{connections:'[[1,0],[2,0]]'}},{id:1466,input:[3],params:{connections:'[[0,1],[1,2]]'}},
];
let seed=20261029;const random=n=>(seed=(Math.imul(seed,1664525)+1013904223)>>>0)%n;
for(let j=0;j<8;j++)for(const id of [1034,1992,2658,711,1559,407,4003,1284]){const r=2+random(2),c=2+random(2),grid=Array.from({length:r},()=>Array.from({length:c},()=>id===1559?'abc'[random(3)]:[1992,711,1284].includes(id)?random(2):random(6)));cases.push({id,input:JSON.stringify(grid),params:id===1034?{row:0,col:0,color:7}:{}});}
function executePython(cmd,payload,maxBuffer=128*1024*1024){const p=spawnSync('python3',cmd,{input:JSON.stringify(payload),encoding:'utf8',maxBuffer});assert.equal(p.status,0,p.stderr);return JSON.parse(p.stdout);}
test('all 17 lessons are registered, load exact complete snippets, and the Flood Fill roster now has no disabled gaps',()=>{
 for(const id of ids){assert.equal(SUPPORTED[id],lessons[id]);assert.equal(lessons[id].debugMode,'line-by-line');assert.ok(lessons[id].code.length>5);assert.equal(lessons[id].pictureBatch,true);}
 assert.equal(FLOOD_FILL_SUBTABS[0].roster.length,33);assert.ok(FLOOD_FILL_SUBTABS[0].roster.every(x=>x.available));
 assert.match(lessons[1284].code.join('\n'),/flips\.append\(flip\)/);assert.doesNotMatch(lessons[1284].code.join('\n'),/flip_mask\(/);assert.match(lessons[3310].code.join('\n'),/from collections import deque/);
});
test('all algorithms agree with independent reference solvers on samples, random grids and edge cases',()=>{
 const expected=executePython([require.resolve('./flood-batch-oracles.py')],cases.map(c=>({id:c.id,args:lessons[c.id].liveArgs(c.input,c.params??{})})));
 cases.forEach((c,j)=>{const p=lessons[c.id],args=p.liveArgs(c.input,c.params??{}),before=JSON.stringify(args),run=p.builder(c.input,c.params??{});if(c.id===310)assert.deepEqual([...run.answer].sort((a,b)=>a-b),expected[j],JSON.stringify(c));else assert.deepEqual(run.answer,expected[j],JSON.stringify(c));assert.equal(JSON.stringify(args),before);assert.equal(run.steps.filter(s=>s.final).length,1);assert.equal(run.steps.at(-1).floodBatchView.done,true);assert.ok(run.steps.length>=2);assert.ok(run.steps.every(s=>s.codeLines.length===1&&s.codeLines[0]>=1&&s.codeLines[0]<=p.code.length));});
});
test('WASM Python records each completed statement and helper frame like native CPython, including heap and union-find mutations',()=>{
 const payload=defaults.map(c=>({id:c.id,code:lessons[c.id].code.join('\n'),args:lessons[c.id].liveArgs(c.input),method:lessons[c.id].code.find(s=>/^    def /.test(s)).match(/def (\w+)/)[1]}));
 const refs=executePython(['-c',`import sys,json,types,collections,math
cases=json.load(sys.stdin);runs=[]
def enc(v):
 if v is None or isinstance(v,(str,bool,int)):return v
 if isinstance(v,float):return v if math.isfinite(v) else ('∞' if v>0 else '−∞')
 if isinstance(v,dict):return {k:enc(x) for k,x in v.items()} if all(isinstance(k,str) for k in v) else {'__pairs__':[[enc(k),enc(x)] for k,x in v.items()]}
 if isinstance(v,(set,frozenset)):return [enc(x) for x in sorted(v)]
 if isinstance(v,(list,tuple,collections.deque)):return [enc(x) for x in v]
 return repr(v)
def loc(f):return {k:enc(v) for k,v in f.f_locals.items() if k!='self' and not callable(v) and not isinstance(v,types.ModuleType)}
for c in cases:
 scope={};filename='<native>';exec(compile(c['code'],filename,'exec'),scope);events=[];pending={}
 def trace(f,event,arg):
  if f.f_code.co_filename!=filename or f.f_code.co_name.startswith('<'):return trace
  if event in ('line','return'):
   if f in pending:
    cursor=f;outer=f;frames=[]
    while cursor:
     if cursor.f_code.co_filename==filename and not cursor.f_code.co_name.startswith('<'):outer=cursor;frames.append({'name':cursor.f_code.co_name,'locals':loc(cursor)})
     cursor=cursor.f_back
    events.append({'line':pending.pop(f),'scope':f.f_code.co_name,'locals':loc(f),'outer':loc(outer),'frames':list(reversed(frames)),'returning':event=='return','returned':enc(arg) if event=='return' else None})
   if event=='line':pending[f]=f.f_lineno
  return trace
 sys.settrace(trace);answer=getattr(scope['Solution'](),c['method'])(*c['args']);sys.settrace(None);runs.append({'answer':enc(answer),'events':events})
print(json.dumps(runs))`],payload);
 defaults.forEach((c,j)=>{const run=lessons[c.id].builder(c.input),reference=refs[j];assert.deepEqual(run.answer,reference.answer);/* CPython 3.9 omits optimized continue-line events (PEP 626 fixes this in 3.10+). */const actual=run.steps.filter(s=>lessons[c.id].code[s.codeLines[0]-1].trim()!=='continue'),events=reference.events.filter(e=>lessons[c.id].code[e.line-1].trim()!=='continue');assert.equal(actual.length,events.length,'events #'+c.id);actual.forEach((s,k)=>{const v=s.floodBatchView,e=events[k],label=`#${c.id} event ${k} L${e.line}`;assert.deepEqual(s.codeLines,[e.line],label);assert.equal(v.scope,e.scope,label);assert.deepEqual(v.locals,e.locals,label);assert.deepEqual(v.outer,e.outer,label);assert.deepEqual(v.frames,e.frames,label);assert.equal(v.returning,e.returning,label);assert.deepEqual(v.returned,e.returned,label);assert.equal(v.source.timing,'after');for(const w of s.vars)assert.deepEqual(w.value,e.locals[w.name]??'—',label+' '+w.name);});});
});
test('pictures expose only real coloring, counts, bounds, signatures, water, routes, and bitmask transitions',()=>{
 for(const c of defaults){const run=lessons[c.id].builder(c.input);let before;for(const s of run.steps){const v=s.floodBatchView,x={...v.outer,...v.locals};assert.equal(v.answer===null,!s.final);if(c.id===407){assert.equal(v.state.waterAt.flat().reduce((a,b)=>a+b,0),x.water??0);assert.equal(v.state.settled.flat().filter(Boolean).length,run.steps.slice(0,run.steps.indexOf(s)+1).filter(a=>a.floodBatchView.source.text.includes('heappop')).length);}
  if(before&&c.id===1034&&JSON.stringify(v.outer.grid)!==JSON.stringify(before.outer.grid))assert.ok(v.source.text.startsWith('grid[r][c] = color'));if(c.id===1992&&v.event==='answer')assert.equal(x.q.length,0);if(c.id===711&&v.event==='signature')assert.equal(x.forms.length,8);if(c.id===1284&&v.state.flipPreview){const p=v.state.flipPreview;assert.equal(p.from^p.flip,p.to);}
  if(c.id===1559&&v.state.cycle.length){assert.equal(s.final,true);assert.equal(v.answer,true);assert.ok(v.state.cycle.length>=5);assert.deepEqual(v.state.cycle[0],v.state.cycle.at(-1));}
  if(c.id===305&&v.source.text==='islands -= 1')assert.ok(x.islands>=1);before=v;
 }}
 const p=lessons[529];assert.equal(p.builder('M',{sr:0,sc:0}).answer[0][0],'X');assert.equal(lessons[1034].builder('1,1,1|1,1,1|1,1,1',{row:1,col:1,color:9}).answer[1][1],1);
});
function renderer(lang,extra={}){const host={innerHTML:'',querySelector:()=>null},ctx={lang,$:()=>host,escapeHtml:x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),...extra};vm.createContext(ctx);for(const file of ['renderer-flood-pictures.js','renderer-flood-batch-2026.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);return {ctx,host,render:s=>{ctx.renderFloodBatchPictures(s);return host.innerHTML;}};}
test('every lesson renders numeric/letter states in both languages without paragraphs, undefined values, mutation, or replay drift',()=>{
 const runs=defaults.map(c=>lessons[c.id].builder(c.input));
 for(const lang of ['vi','en']){const {ctx,render}=renderer(lang);for(const run of runs){const saved=JSON.stringify(run);for(const step of run.steps){const v=step.floodBatchView,html=render(step);assert.match(html,/ffp-viz fb-viz/);assert.doesNotMatch(html,/NaN|undefined|Infinity|object Object|<p\b|<table\b/);if(v.originalGrid||v.id===305){const data=ctx.fbData(v),board=ctx.fbGrid(v);assert.deepEqual([...board.matchAll(/data-cell="(\d+),(\d+)" data-value="([^"]*)"/g)].map(m=>[+m[1],+m[2],m[3]]),JSON.parse(JSON.stringify(data.grid.flatMap((row,r)=>row.map((value,c)=>[r,c,String(value)])))));}assert.equal(v.source.text,lessons[v.id].code[v.source.line-1].trim());}const first=render(run.steps[0]);render(run.steps.at(-1));assert.equal(render(run.steps[0]),first);assert.equal(JSON.stringify(run),saved);}}
});
test('next-pop, state-change and result controls navigate actual recorded events and remain safe at the end',()=>{
 for(const c of defaults){const run=lessons[c.id].builder(c.input),handlers={},host={innerHTML:'',querySelector:s=>({addEventListener:(_,fn)=>handlers[s]=fn})},{ctx,render}=renderer('vi',{$:()=>host,steps:run.steps,stepIndex:0,stopPlay(){},renderStep(){}});render(run.steps[0]);handlers['#fbNextChange']();assert.ok(ctx.stepIndex>0);handlers['#fbNextPop']();assert.ok(ctx.stepIndex>0);for(let j=0;j<100;j++)handlers['#fbNextAnswer']();assert.equal(ctx.stepIndex,run.steps.length-1);assert.ok(ctx.steps[ctx.stepIndex].final);}
});
test('cache results are independent, input validation is typed, and all lesson assets load lazily with day/night and horizontal code',()=>{
 for(const c of defaults){const p=lessons[c.id],first=p.builder(c.input),saved=JSON.stringify(first);first.steps[0].floodBatchView.locals.__test='mutation';const next=p.builder(c.input);assert.equal(JSON.stringify(next),saved);assert.throws(()=>p.liveArgs(null));}
 assert.throws(()=>lessons[1034].builder('1,2|3',{row:0,col:0,color:2}));assert.throws(()=>lessons[529].builder('E',{sr:2,sc:0}));assert.throws(()=>lessons[1466].builder([3],{connections:'[[0,1],[1,0]]'}));assert.throws(()=>lessons[1284].builder('1,0,1,0'));
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/flood-pictures.css'),'utf8'),script=fs.readFileSync(require.resolve('../public/script.js'),'utf8');
 for(const asset of ['flood-batch-2026.css','renderer-flood-batch-2026.js']){const line=html.split('\n').find(s=>s.includes(asset));assert.ok(line.includes(`data-problem-ids="${ids.join(' ')}"`));}
 assert.match(script,/Boolean\(step.floodBatchView\)[^\n]*renderFloodBatchPictures\(step\)/);assert.ok(html.indexOf('src="renderer-flood-pictures.js')<html.indexOf('src="renderer-flood-batch-2026.js'));assert.match(css,/\[data-theme="light"\] \.ffp-viz/);assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);assert.match(css,/#varsPanel[^}]*position:sticky/);
});
