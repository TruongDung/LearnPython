"use strict";
const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const{SUPPORTED,TOPOLOGICAL_SORT_SUBTABS}=require('../problems'),problem=SUPPORTED[2204],view=s=>s.distanceCycle2204View;
const run=(n,edges)=>problem.builder(edges,{n}),cycleEdges=n=>Array.from({length:n},(_,i)=>[i,(i+1)%n]);
const examples=[
 [7,[[1,2],[2,4],[4,3],[3,1],[0,1],[5,2],[6,5]],[1,0,0,0,0,1,2]],
 [9,[[0,1],[1,2],[0,2],[2,6],[6,7],[6,8],[0,3],[3,4],[3,5]],[0,0,0,1,2,2,1,2,2]],
 [3,cycleEdges(3),[0,0,0]],[5,cycleEdges(5),[0,0,0,0,0]],
 [8,[[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,6],[6,7]],[0,0,0,1,2,3,4,5]],
 [6,[[0,4],[4,2],[2,0],[1,4],[3,1],[5,1]],[0,1,0,2,0,2]],
];
function reach(n,edges,start,omitted=-1){const d=Array(n).fill(-1),queue=[start];d[start]=0;for(let h=0;h<queue.length;h++)edges.forEach(([a,b],i)=>{if(i===omitted)return;const u=queue[h],v=a===u?b:b===u?a:-1;if(v>=0&&d[v]<0){d[v]=d[u]+1;queue.push(v);}});return d;}
function oracle(n,edges){const cycle=new Set();edges.forEach(([u,v],i)=>{if(reach(n,edges,u,i)[v]>=0){cycle.add(u);cycle.add(v);}});return{cycle:[...cycle].sort((a,b)=>a-b),answer:Array.from({length:n},(_,u)=>{const d=reach(n,edges,u);return Math.min(...[...cycle].map(v=>d[v]));})};}
test('2204 official examples, pure cycles, long tails and irregular labels',()=>{
 for(const[n,edges,answer]of examples){const r=run(n,edges);assert.deepEqual(r.answer,answer);assert.deepEqual(view(r.steps.at(-1)).cycle,answer.flatMap((d,u)=>d===0?[u]:[]));}
 assert.deepEqual(problem.liveArgs('0-1,1-2,2-0',{n:3}),[3,cycleEdges(3)]);
});
test('2204 every highlighted line, loop exhaustion and bound local matches CPython',()=>{
 const script=String.raw`import sys,json,types
from collections import deque
p=json.load(sys.stdin);ns={}
exec(compile(p['code'],'lesson','exec'),ns)
def normal(v):
    if isinstance(v,(list,tuple,deque)): return [normal(x) for x in v]
    if isinstance(v,dict): return {str(k):normal(x) for k,x in v.items()}
    return v
output=[]
for n,edges in p['cases']:
    events=[];pending={}
    def trace(f,event,arg):
        if f.f_code.co_filename!='lesson' or f.f_code.co_name!='distanceToCycle': return None
        if event in ('line','return'):
            if f in pending: events.append({'line':pending.pop(f),'scope':f.f_code.co_name,'locals':{k:normal(v) for k,v in f.f_locals.items() if k!='self' and not callable(v) and not isinstance(v,types.GeneratorType)}})
            if event=='line': pending[f]=f.f_lineno
        return trace
    sys.settrace(trace);answer=ns['Solution']().distanceToCycle(n,edges);sys.settrace(None)
    output.append({'answer':answer,'events':events})
print(json.dumps(output))`;
 const out=spawnSync(process.env.PYTHON||'python',['-X','utf8','-c',script],{input:JSON.stringify({code:problem.code.join('\n'),cases:examples.map(([n,edges])=>[n,edges])}),encoding:'utf8',maxBuffer:24*1024*1024});assert.equal(out.status,0,out.stderr||String(out.error));
 JSON.parse(out.stdout).forEach((ref,i)=>{const[n,edges]=examples[i],r=run(n,edges);assert.deepEqual(r.answer,ref.answer);assert.equal(r.steps.length,ref.events.length,`case ${i} frame count`);r.steps.forEach((s,j)=>{assert.deepEqual({line:s.codeLines[0],scope:s.source.scope,locals:s.locals},ref.events[j],`case ${i} frame ${j+1}`);assert.equal(s.codeLines.length,1);assert.equal(s.source.text,problem.code[s.source.line-1]);});});
});
test('2204 matches edge-removal cycle detection and independent per-node BFS on ALL 222 connected five-node graphs with five edges',()=>{
 const possible=[];for(let u=0;u<5;u++)for(let v=u+1;v<5;v++)possible.push([u,v]);let checked=0;
 for(let mask=0;mask<1<<possible.length;mask++){const edges=possible.filter((_,i)=>mask&1<<i);if(edges.length!==5||reach(5,edges,0).some(d=>d<0))continue;const ref=oracle(5,edges),r=run(5,edges);assert.deepEqual(r.answer,ref.answer);assert.deepEqual(view(r.steps.at(-1)).cycle,ref.cycle);checked++;}assert.equal(checked,222);
});
test('2204 handles random trees with one extra edge, keeps all cycle seeds, and assigns each branch distance once',()=>{
 let seed=23;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
 for(let k=0;k<65;k++){const n=3+rand(14),edges=Array.from({length:n-1},(_,i)=>[i+1,rand(i+1)]),missing=[];for(let u=0;u<n;u++)for(let v=u+1;v<n;v++)if(!edges.some(([a,b])=>(u===a&&v===b)||(u===b&&v===a)))missing.push([u,v]);edges.push(missing[rand(missing.length)]);
  const r=run(n,edges),ref=oracle(n,edges),assigned=new Set();assert.deepEqual(r.answer,ref.answer);
  for(const s of r.steps){const v=view(s);if(v.event==='seed-queue')assert.deepEqual(v.queue,ref.cycle);if(v.event==='assign'){assert.equal(v.change.from,-1);assert.equal(v.dist[v.change.node],v.dist[v.change.parent]+1);assert.ok(!assigned.has(v.change.node));assigned.add(v.change.node);}}
  assert.equal(assigned.size,n-ref.cycle.length);
 }
});
test('2204 every selectable final path has exactly dist[node] input edges and ends on the cycle',()=>{
 for(const[n,edges]of examples){const r=run(n,edges),v=view(r.steps.at(-1));v.analysis.paths.forEach((path,u)=>{assert.equal(path[0],u);assert.equal(path.length-1,r.answer[u]);assert.ok(v.cycle.includes(path.at(-1)));for(let i=1;i<path.length;i++){assert.ok(edges.some(([a,b])=>(a===path[i-1]&&b===path[i])||(b===path[i-1]&&a===path[i])));assert.equal(r.answer[path[i]],r.answer[path[i-1]]-1);}});}
});
test('2204 renders all input nodes and exact distances safely in both languages without altering snapshots',()=>{
 const host={innerHTML:'',dataset:{},clientWidth:560},ctx={$:()=>host,lang:'vi'};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-distance-cycle-2204.js'),'utf8'),ctx);
 for(const[n,edges]of examples){const r=run(n,edges),before=JSON.stringify(r);for(const lang of['vi','en']){ctx.lang=lang;for(const s of r.steps){ctx.renderDistanceCycle2204Pictures(s);assert.match(host.innerHTML,/class="d2204-viz"/);assert.doesNotMatch(host.innerHTML,/undefined|NaN/);assert.equal((host.innerHTML.match(/data-node="/g)||[]).length,n);}}
  for(let u=0;u<n;u++){host.dataset.d2204Selected=String(u);ctx.renderDistanceCycle2204Pictures(r.steps.at(-1));assert.equal((host.innerHTML.match(/data-edge="/g)||[]).length,edges.length+r.answer[u]);}assert.equal(JSON.stringify(r),before);
 }
});
test('2204 validates a connected graph with exactly one cycle and retains every step at the size limit',()=>{
 for(const[n,edges]of [[2,[[0,1]]],[4,[[0,1],[1,2],[2,3]]],[3,[[0,1],[1,2],[0,0]]],[3,[[0,1],[1,2],[1,0]]],[6,[[0,1],[1,2],[2,0],[3,4],[4,5],[5,3]]]])assert.throws(()=>run(n,edges),/2204/);
 const edges=[[0,1],[1,2],[2,0],...Array.from({length:13},(_,i)=>[i+2,i+3])],r=run(16,edges);assert.equal(r.answer[15],13);assert.equal(r.steps.length,view(r.steps.at(-1)).frame);
 assert.ok(TOPOLOGICAL_SORT_SUBTABS[0].roster.find(p=>p.id===2204).available);assert.ok(problem.tags.some(t=>t.key==='topological-sort'));
});
