"use strict";
const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const{SUPPORTED,TOPOLOGICAL_SORT_SUBTABS}=require('../problems'),problem=SUPPORTED[2603],view=s=>s.coins2603View;
const pathEdges=n=>Array.from({length:n-1},(_,i)=>[i,i+1]),run=(coins,edges)=>problem.builder(coins,{edges});
const examples=[[[1,0,0,0,0,1],pathEdges(6),2],[[0,0,0,1,1,0,0,1],[[0,1],[0,2],[1,3],[1,4],[2,5],[5,6],[5,7]],2],[[1],[],0],[[0],[],0],[[1,1],[[0,1]],0],[[1,0,0,0,1],pathEdges(5),0],[Array(6).fill(0),pathEdges(6),0],[[1,0,0,0,0,0,0,0,1],pathEdges(9),8]];
function oracle(coins,edges){
 const n=coins.length,g=Array.from({length:n},()=>[]);edges.forEach(([u,v])=>{g[u].push(v);g[v].push(u);});
 const cover=Array.from({length:n},(_,u)=>{const d=Array(n).fill(-1),q=[u];d[u]=0;let mask=0;for(let i=0;i<q.length;i++){const v=q[i];if(coins[v])mask|=1<<v;if(d[v]<2)for(const w of g[v])if(d[w]<0){d[w]=d[v]+1;q.push(w);}}return mask;});
 const all=coins.reduce((mask,coin,u)=>mask|(coin<<u),0),states=1<<n;let best=2*(n-1);
 for(let start=0;start<n;start++){const queue=[[start,cover[start],0]],seen=new Set([start*states+cover[start]]);for(let i=0;i<queue.length;i++){const[u,mask,dist]=queue[i];if(u===start&&mask===all){best=Math.min(best,dist);break;}if(dist>=best)continue;for(const v of g[u]){const next=mask|cover[v],key=v*states+next;if(!seen.has(key)){seen.add(key);queue.push([v,next,dist+1]);}}}}
 return best;
}
test('2603 official examples, singleton trees, no coins and zero-walk solutions',()=>{
 for(const[coins,edges,answer]of examples){const r=run(coins,edges);assert.equal(r.answer,answer);assert.equal(view(r.steps.at(-1)).remaining*2,answer);}
 assert.deepEqual(problem.liveArgs('100001',{edges:'0-1,1-2,2-3,3-4,4-5'}),[[1,0,0,0,0,1],pathEdges(6)]);
});
test('2603 every executed Python line and bound local matches the visualization',()=>{
 const script=String.raw`import sys,json,types
from collections import deque
p=json.load(sys.stdin);ns={}
exec(compile(p['code'],'lesson','exec'),ns)
def normal(v):
    if isinstance(v,(list,tuple,deque)): return [normal(x) for x in v]
    if isinstance(v,dict): return {str(k):normal(x) for k,x in v.items()}
    return v
output=[]
for coins,edges in p['cases']:
    events=[];pending={}
    def trace(f,event,arg):
        if f.f_code.co_filename!='lesson' or f.f_code.co_name!='collectTheCoins': return None
        if event in ('line','return'):
            if f in pending: events.append({'line':pending.pop(f),'scope':f.f_code.co_name,'locals':{k:normal(v) for k,v in f.f_locals.items() if k!='self' and not callable(v) and not isinstance(v,types.GeneratorType)}})
            if event=='line': pending[f]=f.f_lineno
        return trace
    sys.settrace(trace);answer=ns['Solution']().collectTheCoins(coins,edges);sys.settrace(None)
    output.append({'answer':answer,'events':events})
print(json.dumps(output))`;
 const out=spawnSync(process.env.PYTHON||'python',['-X','utf8','-c',script],{input:JSON.stringify({code:problem.code.join('\n'),cases:examples.map(([coins,edges])=>[coins,edges])}),encoding:'utf8',maxBuffer:20*1024*1024});assert.equal(out.status,0,out.stderr||String(out.error));
 JSON.parse(out.stdout).forEach((ref,i)=>{const[coins,edges]=examples[i],r=run(coins,edges);assert.equal(r.answer,ref.answer);assert.equal(r.steps.length,ref.events.length,`case ${i} count`);r.steps.forEach((s,j)=>{assert.deepEqual({line:s.codeLines[0],scope:s.source.scope,locals:s.locals},ref.events[j],`case ${i} frame ${j+1}`);assert.equal(s.codeLines.length,1);assert.equal(s.source.text,problem.code[s.source.line-1]);});});
});
test('2603 matches shortest CLOSED WALK BFS for all 256 coin patterns on an eight-node path and random branching trees',()=>{
 const answers=new Set();for(let mask=0;mask<256;mask++){const coins=Array.from({length:8},(_,u)=>(mask>>u)&1),edges=pathEdges(8),r=run(coins,edges),answer=oracle(coins,edges);assert.equal(r.answer,answer,`mask ${mask}`);answers.add(answer);}
 assert.deepEqual([...answers].sort((a,b)=>a-b),[0,2,4,6]);
 let seed=93;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};for(let i=0;i<50;i++){const n=2+rand(7),edges=Array.from({length:n-1},(_,i)=>[i+1,rand(i+1)]),coins=Array.from({length:n},()=>rand(2));assert.equal(run(coins,edges).answer,oracle(coins,edges));}
});
test('2603 freezes each batch, prunes only TWO layers and leaves the third frontier in the core',()=>{
 const r=run([1,0,0,0,0,0,0,0,1],pathEdges(9)),end=view(r.steps.at(-1));
 assert.deepEqual(end.removed,[true,true,false,false,false,false,false,true,true]);assert.deepEqual(r.steps.at(-1).locals.queue,[2,6]);assert.equal(end.remaining,4);
 for(const s of r.steps){const v=view(s);if(v.phase==='layers'){assert.deepEqual(v.queue.slice(0,v.pending.length),v.pending);assert.deepEqual(v.queue.slice(v.pending.length),v.next);}if(v.event==='leaf-remove')assert.ok(v.round===1||v.round===2);if(v.event==='empty-remove')assert.equal(v.coins[v.active],0);}
 const stop=r.steps.find(s=>view(s).layersFinished);assert.ok(stop);assert.equal(view(stop).round,2);
});
test('2603 final route returns to its start, uses each core edge twice, and reaches every coin within two edges',()=>{
 for(const[coins,edges]of examples){const r=run(coins,edges),a=view(r.steps.at(-1)).analysis;assert.equal(a.walk.length-1,r.answer);assert.equal(a.walk[0],a.walk.at(-1));
  for(const[u,v]of a.coreEdges)assert.equal(a.walk.slice(1).filter((w,i)=>(a.walk[i]===u&&w===v)||(a.walk[i]===v&&w===u)).length,2);
  coins.forEach((coin,u)=>{if(coin)assert.ok(a.walk.some(w=>a.distances[u][w]<=2));});
 }
});
test('2603 pictures render all nodes, coin markers, both leaf layers and the replay without mutating snapshots',()=>{
 const host={innerHTML:'',dataset:{},clientWidth:560},ctx={$:()=>host,lang:'vi'};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-collect-coins-2603.js'),'utf8'),ctx);
 for(const[coins,edges]of examples){const r=run(coins,edges),before=JSON.stringify(r);for(const lang of['vi','en']){ctx.lang=lang;for(const s of r.steps){ctx.renderCoins2603Pictures(s);assert.match(host.innerHTML,/class="c2603-viz"/);assert.doesNotMatch(host.innerHTML,/undefined|NaN/);assert.equal((host.innerHTML.match(/data-node="/g)||[]).length,coins.length);}}
  const last=r.steps.at(-1);for(let i=0;i<view(last).analysis.walk.length;i++){host.dataset.coins2603Position=String(i);ctx.renderCoins2603Pictures(last);assert.doesNotMatch(host.innerHTML,/undefined|NaN/);}
  assert.equal(JSON.stringify(r),before);
 }
});
test('2603 validates tree inputs, retains every step at the size limit and becomes selectable in the catalog',()=>{
 for(const[coins,edges]of [[[1,0],[]],[[1,2],[[0,1]]],[[1,0,1],[[0,1],[1,0]]],[[1,0,1,0],[[0,1],[1,2],[2,0]]],[[1,0],[[0,0]]],[[],[]],[Array(17).fill(1),pathEdges(17)]])assert.throws(()=>run(coins,edges),/2603/);
 const r=run(Array(16).fill(1),pathEdges(16));assert.equal(r.answer,22);assert.equal(r.steps.length,view(r.steps.at(-1)).frame);
 assert.ok(TOPOLOGICAL_SORT_SUBTABS[0].roster.find(p=>p.id===2603).available);assert.ok(problem.tags.some(t=>t.key==='topological-sort'));
});
