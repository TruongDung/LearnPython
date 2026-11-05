'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[743];

function oracle(times,n,k) {
  const dist=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?0:Infinity));
  for(const[u,v,w]of times)dist[u-1][v-1]=w;
  for(let mid=0;mid<n;mid++)for(let u=0;u<n;u++)for(let v=0;v<n;v++)dist[u][v]=Math.min(dist[u][v],dist[u][mid]+dist[mid][v]);
  const answer=Math.max(...dist[k-1]);return Number.isFinite(answer)?answer:-1;
}

function checkDistances(times,n,k,result) {
  const view=result.steps.at(-1).network743View;
  assert.equal(view.answer,result.answer);assert.equal(view.final,true);assert.equal(view.heapSize,0);
  assert.equal(view.distances[k-1].value,0);
  for(const[child,parent]of view.parents) {
    const edge=times.find(([u,v])=>u===parent&&v===child);assert.ok(edge);
    assert.equal(view.distances[parent-1].value+edge[2],view.distances[child-1].value);
  }
  if(result.answer===-1)assert.ok(view.unreachable.length>0);
  else {assert.equal(view.unreachable.length,0);assert.equal(view.settled.length,n);assert.equal(Math.max(...view.distances.map(item=>item.value)),result.answer);}
}

test('743 models simultaneous signals, directed edges, zero weights and unreachable nodes',()=>{
  const cases=[
    [[[2,1,1],[2,3,1],[3,4,1]],4,2,2],
    [[[1,2,1],[1,3,1]],3,1,1],
    [[[1,2,1]],2,1,1],[[[1,2,1]],2,2,-1],
    [[[1,2,0],[2,1,0],[2,3,0]],3,1,0],
    [[[1,2,9],[1,3,1],[3,2,2]],3,1,3],
    [[],1,1,0],[[],3,1,-1],
  ];
  for(const[times,n,k,answer]of cases) {
    const original=JSON.stringify(times),result=problem.builder(times,{n,k});
    assert.equal(result.answer,answer);assert.equal(JSON.stringify(times),original);checkDistances(times,n,k,result);
    assert.equal(result.steps.filter(step=>step.final).length,1);
    for(const step of result.steps) {assert.deepEqual(step.codeLines,[step.network743View.source.line]);assert.equal(step.network743View.source.text,problem.code[step.codeLines[0]-1]);assert.equal(step.network743View.source.timing,'after');assert.equal(step.note.vi,'');}
  }
});

let seed=743;
const rand=max=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%max;};
const randomCases=Array.from({length:35},()=>{const n=2+rand(6),k=1+rand(n),times=[];for(let u=1;u<=n;u++)for(let v=1;v<=n;v++)if(u!==v&&rand(3)===0)times.push([u,v,rand(10)]);return{times,n,k};});

test('743 actual Python Dijkstra agrees with Floyd-Warshall on varied directed networks',()=>{
  for(const{times,n,k}of randomCases) {const result=problem.builder(times,{n,k});assert.equal(result.answer,oracle(times,n,k),JSON.stringify({times,n,k}));checkDistances(times,n,k,result);}
});

test('743 snapshots match completed heap operations, relaxations and stale-entry checks',()=>{
  const result=problem.builder('1-2-9,1-3-1,3-2-2',{n:3,k:1}),views=result.steps.map(step=>step.network743View);
  assert.ok(views.some(view=>view.phase==='stale'&&view.locals.time===9));
  assert.ok(views.some(view=>view.changed.some(change=>change.node===2&&change.before===9&&change.after===3)));
  for(const view of views) {
    const source=view.source.text.trim();
    if(view.phase==='calculate')assert.equal(view.candidate,view.locals.time+view.activeEdge.w);
    if(view.phase==='compare') {assert.equal(view.distances[view.activeEdge.v-1].value,view.oldDistance);assert.equal(view.improves,view.oldDistance==='∞'||view.candidate<view.oldDistance);}
    if(view.phase==='update')assert.equal(view.distances[view.activeEdge.v-1].value,view.candidate);
    if(source.startsWith('heapq.heappush')&&view.heapSize<=15)assert.ok(view.heap.some(([time,node])=>time===view.candidate&&node===view.activeEdge.v));
    for(let i=1;i<view.heap.length;i++) {const parent=view.heap[(i-1)>>1],child=view.heap[i];assert.ok(parent[0]<child[0]||parent[0]===child[0]&&parent[1]<=child[1]);}
  }
  const first=JSON.stringify(result.steps[0]);views.at(-1).distances[0].value=123;assert.equal(JSON.stringify(result.steps[0]),first);
});

test('743 source executes in native CPython with the existing numbered steps',()=>{
  const source="import json,sys\np=json.load(sys.stdin)\nscope={}\nexec(p['code'],scope)\nprint(json.dumps([scope['Solution']().networkDelayTime(c['times'],c['n'],c['k']) for c in p['cases']]))";
  const result=spawnSync(process.env.PYTHON||'python3',['-c',source],{input:JSON.stringify({code:problem.code.join('\n'),cases:randomCases}),encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),randomCases.map(c=>oracle(c.times,c.n,c.k)));
});

test('743 finishes a 100-node, 6000-edge network after the picture budget is exhausted',()=>{
  const times=[];for(let u=1;u<=100&&times.length<6000;u++)for(let v=1;v<=100&&times.length<6000;v++)if(u!==v)times.push([u,v,1]);
  const result=problem.builder(times,{n:100,k:1}),view=result.steps.at(-1).network743View;
  assert.equal(result.answer,1);checkDistances(times,100,1,result);
  assert.ok(result.steps.length<=1601);assert.equal(view.trace.truncated,true);assert.equal(view.trace.events,view.trace.captured+view.trace.omitted);
  assert.equal(view.builtCount,6000);assert.equal(view.edgeCount,6000);assert.equal(view.cropped,true);assert.ok(view.nodes.length<=6);assert.ok(view.edges.length<=18);
});

test('743 validates network input and exposes the three live-debug arguments',()=>{
  assert.deepEqual(problem.liveArgs('[[1,2,0]]',{n:2,k:1}),[[[1,2,0]],2,1]);
  assert.equal(problem.builder('',{n:1,k:1}).answer,0);
  for(const[input,params]of[['1-1-0',{n:2,k:1}],['1-3-0',{n:2,k:1}],['1-2--1',{n:2,k:1}],['1-2-1.5',{n:2,k:1}],['1-2-101',{n:2,k:1}],['1-2-1-2',{n:2,k:1}],['1-2-1,1-2-2',{n:2,k:1}],['[[1,2]',{n:2,k:1}],['1-2-1',{n:101,k:1}],['1-2-1',{n:2,k:0}],['1-2-1',{n:2,k:3}]])assert.throws(()=>problem.builder(input,params),/743/);
  assert.ok(JSON.parse(fs.readFileSync(require.resolve('../vercel.json'),'utf8')).functions['server.js'].includeFiles.includes('problems/network-delay-trace.py'));
});

test('743 picture renderer shows the directed network, heap tree, timeline and outcomes in both languages',()=>{
  const result=problem.builder('1-2-9,1-3-1,3-2-2',{n:3,k:1}),host={innerHTML:''};
  const context={lang:'vi',$:()=>host,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-network-delay-743.js'),'utf8'),context);
  for(const language of ['vi','en'])for(const step of [result.steps[0],result.steps.find(s=>s.network743View.phase==='compare'),result.steps.find(s=>s.network743View.phase==='stale'),result.steps.at(-1)]) {
    context.lang=language;context.renderNetwork743Pictures(step);
    assert.match(host.innerHTML,/nd743-network-svg/);assert.match(host.innerHTML,/nd743-heap-svg/);assert.match(host.innerHTML,/nd743-timeline-svg/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|object Object/);
  }
  assert.match(host.innerHTML,/data-answer="3"/);assert.match(host.innerHTML,/nd743-node [^"]*last/);
  const unreachable=problem.builder('1-2-1',{n:3,k:1});context.renderNetwork743Pictures(unreachable.steps.at(-1));assert.match(host.innerHTML,/data-answer="-1"/);assert.match(host.innerHTML,/nd743-node [^"]*unreachable/);
});
