"use strict";
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const {SUPPORTED,TOPOLOGICAL_SORT_SUBTABS}=require('../problems'),problem=SUPPORTED[3383];
const view=s=>s.runes3383View;
const examples=[
 [6,[0],[[0,1],[1,2],[2,3],[3,0]],2],
 [7,[3,5],[[0,1],[1,2],[2,0],[3,4],[5,6]],1],
 [4,[0],[[0,1],[1,2],[2,3]],0],
 [2,[0],[],1], [2,[0,1],[],0],
 [5,[0],[[1,2],[1,3],[2,3],[3,1]],2],
 [6,[0],[[1,3],[2,3],[3,4],[4,3],[5,2]],2],
 [4,[3,3],[[0,1],[1,2],[2,0]],1],
];
const run=(n,crystals,edges)=>problem.builder(JSON.stringify(edges),{n,crystals});
function covers(n,roots,edges){const seen=new Set(),stack=[...roots];while(stack.length){const u=stack.pop();if(seen.has(u))continue;seen.add(u);for(const[a,b]of edges)if(a===u)stack.push(b);}return seen.size===n;}
test('3383 official examples, empty graphs, cycles, overlapping sources and already powered graphs',()=>{
 for(const[n,crystals,edges,answer]of examples){const r=run(n,crystals,edges);assert.equal(r.answer,answer);assert.ok(view(r.steps.at(-1)).powered.every(Boolean));assert.equal(view(r.steps.at(-1)).added.length,answer);assert.ok(covers(n,crystals,[...edges,...r.steps.at(-1).locals.added]));}
 assert.deepEqual(problem.liveArgs('0-1,1-2',{n:3,crystals:'[0]'}),[3,[0],[0,1],[1,2]]);
});
test('3383 every highlighted line and bound local matches CPython in main, BFS and explicit-stack DFS',()=>{
 const script=String.raw`import sys,json,types
from collections import deque
p=json.load(sys.stdin);ns={}
exec(compile(p['code'],'lesson','exec'),ns)
def normal(v):
    if isinstance(v,(list,tuple,deque)): return [normal(x) for x in v]
    if isinstance(v,dict): return {str(k):normal(x) for k,x in v.items()}
    return v
output=[]
for args in p['cases']:
    pending={};events=[]
    def trace(f,event,arg):
        if f.f_code.co_filename!='lesson' or f.f_code.co_name not in ('minRunesToAdd','spread','finish'): return None
        if event in ('line','return'):
            if f in pending: events.append({'line':pending.pop(f),'scope':f.f_code.co_name,'locals':{k:normal(v) for k,v in f.f_locals.items() if k!='self' and not callable(v) and not isinstance(v,types.GeneratorType)}})
            if event=='line': pending[f]=f.f_lineno
        return trace
    sys.settrace(trace);answer=ns['Solution']().minRunesToAdd(*args);sys.settrace(None)
    output.append({'answer':answer,'events':events})
print(json.dumps(output))`;
 const cases=examples.map(([n,crystals,edges])=>[n,crystals,edges.map(e=>e[0]),edges.map(e=>e[1])]);
 const out=spawnSync(process.env.PYTHON||'python',['-X','utf8','-c',script],{input:JSON.stringify({code:problem.code.join('\n'),cases}),encoding:'utf8',maxBuffer:24*1024*1024});assert.equal(out.status,0,out.stderr||String(out.error));
 JSON.parse(out.stdout).forEach((ref,i)=>{const[n,crystals,edges]=examples[i],r=run(n,crystals,edges);assert.equal(r.answer,ref.answer);assert.equal(r.steps.length,ref.events.length,`case ${i} count`);
  r.steps.forEach((s,j)=>{assert.deepEqual({line:s.codeLines[0],scope:s.source.scope,locals:s.locals},ref.events[j],`case ${i} frame ${j+1}`);assert.equal(s.codeLines.length,1);assert.equal(s.source.text,problem.code[s.source.line-1]);assert.equal(view(s).frame,j+1);});
 });
});
test('3383 agrees with brute-force NEW EDGE subsets for all 448 graphs/source sets on three nodes',()=>{
 const possible=[];for(let u=0;u<3;u++)for(let v=0;v<3;v++)if(u!==v)possible.push([u,v]);
 for(let mask=0;mask<64;mask++)for(let sources=1;sources<8;sources++){
  const edges=possible.filter((_,i)=>mask&1<<i),crystals=[0,1,2].filter(u=>sources&1<<u),missing=possible.filter((_,i)=>!(mask&1<<i));let best=3;
  for(let additions=0;additions<1<<missing.length;additions++){const picked=missing.filter((_,i)=>additions&1<<i);if(picked.length<best&&covers(3,crystals,[...edges,...picked]))best=picked.length;}
  assert.equal(run(3,crystals,edges).answer,best,JSON.stringify({edges,crystals}));
 }
});
test('3383 reaches every node with actual new edges and never adds an unnecessary second edge into a lit cycle',()=>{
 let seed=49;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
 for(let iter=0;iter<45;iter++){
  const n=2+rand(6),crystals=[rand(n)],edges=[];for(let u=0;u<n;u++)for(let v=0;v<n;v++)if(u!==v&&rand(4)===0)edges.push([u,v]);
  let best=n;for(let mask=0;mask<1<<n;mask++){const roots=Array.from({length:n},(_,i)=>i).filter(i=>mask&1<<i);if(roots.length<best&&covers(n,[...crystals,...roots],edges))best=roots.length;}
  const r=run(n,crystals,edges);assert.equal(r.answer,best);
  for(const s of r.steps)if(view(s).event==='new-rune'){const[u,v]=view(s).added.at(-1);assert.equal(view(s).powered[u],true);assert.equal(view(s).powered[v],false);assert.ok(!edges.some(([a,b])=>a===u&&b===v));}
 }
});
test('3383 pictures show exact input/new arrows, queue, DFS stack and order in both languages without changing state',()=>{
 const host={innerHTML:'',clientWidth:560,dataset:{}},ctx={$:()=>host,lang:'vi'};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-minimum-runes-3383.js'),'utf8'),ctx);
 for(const[n,crystals,edges]of examples){const r=run(n,crystals,edges),before=JSON.stringify(r);
  for(const lang of ['vi','en']){ctx.lang=lang;for(const s of r.steps){ctx.renderRunes3383Pictures(s);assert.match(host.innerHTML,/class="r3383-viz"/);assert.doesNotMatch(host.innerHTML,/undefined|NaN/);assert.equal((host.innerHTML.match(/data-node="/g)||[]).length,n);assert.equal((host.innerHTML.match(/data-edge="/g)||[]).length,edges.length+view(s).added.length);}}
  assert.equal(JSON.stringify(r),before);
 }
});
test('3383 keeps the entire dense trace, validates inputs, and is available in the catalog',()=>{
 const edges=[];for(let u=1;u<12;u++)for(let v=u+1;v<12;v++)edges.push([u,v]);const r=run(12,[0],edges);assert.equal(r.answer,1);assert.equal(r.steps.length,view(r.steps.at(-1)).frame);assert.ok(r.steps.length<4000);
 for(const[input,p]of [['0-0',{n:2,crystals:[1]}],['0-1,0-1',{n:2,crystals:[0]}],['0-1',{n:2,crystals:[]}],['0-1',{n:13,crystals:[0]}],['0-2',{n:2,crystals:[0]}],['0-',{n:2,crystals:[0]}]])assert.throws(()=>problem.builder(input,p),/3383/);
 assert.ok(TOPOLOGICAL_SORT_SUBTABS[0].roster.find(p=>p.id===3383).available);assert.ok(problem.tags.some(t=>t.key==='topological-sort'));
});
