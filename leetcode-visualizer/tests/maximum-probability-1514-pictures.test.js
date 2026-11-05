'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[1514];

function oracle(edges,n,start,end) {
  const best=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0));
  for(const[a,b,p]of edges)best[a][b]=best[b][a]=p;
  for(let k=0;k<n;k++)for(let a=0;a<n;a++)for(let b=0;b<n;b++)best[a][b]=Math.max(best[a][b],best[a][k]*best[k][b]);
  return best[start][end];
}
function near(actual,expected) {assert.ok(Math.abs(actual-expected)<=1e-12*Math.max(1,Math.abs(expected)),`${actual} != ${expected}`);}
function checkPath(edges,result,start,end) {
  const view=result.steps.at(-1).probability1514View;
  assert.equal(view.final,true);assert.equal(view.answer,result.answer);
  if(!result.answer){assert.deepEqual(view.path,[]);return;}
  assert.equal(view.path[0],start);assert.equal(view.path.at(-1),end);assert.equal(new Set(view.path).size,view.path.length);
  let product=1;
  for(let i=1;i<view.path.length;i++) {const a=view.path[i-1],b=view.path[i],edge=edges.find(([u,v])=>u===a&&v===b||u===b&&v===a);assert.ok(edge);product*=edge[2];}
  near(product,result.answer);
}

test('1514 computes products, both edge directions, zero/one probabilities and disconnected graphs',()=>{
  const cases=[
    [[[0,1,.5],[1,2,.5],[0,2,.2]],3,0,2,.25],
    [[[0,1,.5],[1,2,.5],[0,2,.3]],3,0,2,.3],
    [[[0,1,.5]],3,0,2,0],[[[0,1,.5]],2,1,0,.5],
    [[[0,1,1],[1,2,1],[0,2,0]],3,0,2,1],[[[0,1,0]],2,0,1,0],
    [[],2,0,1,0],[[[0,1,1e-300]],2,0,1,1e-300],
  ];
  for(const[edges,n,start,end,answer]of cases) {
    const original=JSON.stringify(edges),result=problem.builder(edges,{n,start_node:start,end_node:end});
    assert.equal(result.answer,answer);assert.equal(JSON.stringify(edges),original);checkPath(edges,result,start,end);
    assert.equal(result.steps.filter(step=>step.final).length,1);
    for(const step of result.steps) {const v=step.probability1514View;assert.deepEqual(step.codeLines,[v.source.line]);assert.equal(v.source.text,problem.code[v.source.line-1]);assert.equal(v.source.timing,'after');assert.equal(step.note.vi,'');}
  }
});

let seed=1514;
const rand=max=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%max;};
const randomCases=Array.from({length:35},()=>{const n=2+rand(6),start=rand(n),end=(start+1+rand(n-1))%n,edges=[];for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)if(rand(3)===0)edges.push([a,b,rand(11)/10]);return{edges,n,start,end};});

test('1514 traced Python agrees with max-product Floyd-Warshall',()=>{
  for(const{edges,n,start,end}of randomCases) {const result=problem.builder(edges,{n,start_node:start,end_node:end});near(result.answer,oracle(edges,n,start,end));checkPath(edges,result,start,end);}
});

test('1514 records actual after-line heap operations, relaxation and stale entries',()=>{
  const result=problem.builder('0-1-0.1,0-2-0.9,2-1-0.9',{n:4,start_node:0,end_node:3}),views=result.steps.map(step=>step.probability1514View);
  assert.ok(views.some(v=>v.phase==='stale'&&v.locals.prob===.1));
  assert.ok(views.some(v=>v.changed.some(item=>item.node===1&&item.before===.1&&item.after===.81)));
  for(const v of views) {
    if(v.phase==='calculate')assert.equal(v.candidate,v.locals.prob*v.activeEdge.p);
    if(v.phase==='compare') {assert.equal(v.best.find(item=>item.node===v.activeEdge.v).value,v.oldBest);assert.equal(v.improves,v.candidate>v.oldBest);}
    if(v.phase==='update')assert.equal(v.best.find(item=>item.node===v.activeEdge.v).value,v.candidate);
    if(v.phase==='push'&&v.heapSize<=15)assert.ok(v.heap.some(item=>item.raw[0]===-v.candidate&&item.raw[1]===v.activeEdge.v));
    for(let i=1;i<v.heap.length;i++) {const parent=v.heap[(i-1)>>1].raw,child=v.heap[i].raw;assert.ok(parent[0]<child[0]||parent[0]===child[0]&&parent[1]<=child[1]);}
  }
  const first=JSON.stringify(result.steps[0]);views.at(-1).best[0].value=123;assert.equal(JSON.stringify(result.steps[0]),first);
});

test('1514 source runs in native CPython and exposes all five live-debug arguments',()=>{
  const source="import json,sys\np=json.load(sys.stdin)\nscope={}\nexec(p['code'],scope)\nprint(json.dumps([scope['Solution']().maxProbability(c['n'],[e[:2] for e in c['edges']],[e[2] for e in c['edges']],c['start'],c['end']) for c in p['cases']]))";
  const result=spawnSync(process.env.PYTHON||'python3',['-c',source],{input:JSON.stringify({code:problem.code.join('\n'),cases:randomCases}),encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);JSON.parse(result.stdout).forEach((answer,i)=>{const c=randomCases[i];near(answer,oracle(c.edges,c.n,c.start,c.end));});
  assert.deepEqual(problem.liveArgs('0-1-5e-1',{n:2,start_node:1,end_node:0}),[2,[[0,1]],[.5],1,0]);
});

test('1514 completes 10000 nodes / 20000 edges after limiting picture capture',()=>{
  const edges=Array.from({length:9999},(_,i)=>[i,i+1,1]);
  for(let a=0;edges.length<20000;a++)for(let b=a+2;b<10000&&edges.length<20000;b++)edges.push([a,b,.1]);
  const result=problem.builder(edges,{n:10000,start_node:0,end_node:9999}),view=result.steps.at(-1).probability1514View;
  assert.equal(result.answer,1);checkPath(edges,result,0,9999);
  assert.ok(result.steps.length<=1601);assert.equal(view.trace.truncated,true);assert.equal(view.trace.events,view.trace.captured+view.trace.omitted);
  assert.equal(view.builtCount,40000);assert.equal(view.edgeCount,20000);assert.equal(view.cropped,true);assert.ok(view.nodes.length<=6);assert.ok(view.edges.length<=15);
  assert.equal(view.path.length,10000);
});

test('1514 rejects malformed graphs and bundles its Python helper',()=>{
  for(const input of ['0-0-0.5','0-3-0.5','0-1--1','0-1-1.1','0-1-0.5-4','0-1-0.5,1-0-0.4','[[0,1]','[[0,1,"0.5"]]','0-1-NaN'])assert.throws(()=>problem.builder(input,{n:3,start_node:0,end_node:2}),/1514/);
  for(const params of [{n:1},{n:10001},{n:3,start_node:0,end_node:0},{n:3,start_node:-1},{n:3,end_node:3}])assert.throws(()=>problem.builder('',params),/1514/);
  assert.ok(JSON.parse(fs.readFileSync(require.resolve('../vercel.json'),'utf8')).functions['server.js'].includeFiles.includes('problems/maximum-probability-trace.py'));
});

test('1514 renderer shows a graph, true heap tree, probability bars and final path in both languages',()=>{
  const result=problem.builder(problem.defaultInput,{n:3,start_node:0,end_node:2}),host={innerHTML:''};
  const context={lang:'vi',$:()=>host,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-maximum-probability-1514.js'),'utf8'),context);
  for(const language of ['vi','en'])for(const step of [result.steps[0],result.steps.find(s=>s.probability1514View.phase==='compare'),result.steps.at(-1)]) {
    context.lang=language;context.renderProbability1514Pictures(step);assert.match(host.innerHTML,/mp1514-graph-svg/);assert.match(host.innerHTML,/mp1514-heap-svg/);assert.match(host.innerHTML,/mp1514-bars-svg/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|object Object/);
  }
  assert.match(host.innerHTML,/data-answer="0.25"/);assert.match(host.innerHTML,/mp1514-route-strip/);assert.match(host.innerHTML,/25%/);assert.doesNotMatch(host.innerHTML,/marker-end/);
  context.renderProbability1514Pictures(problem.builder('0-1-0',{n:2,start_node:0,end_node:1}).steps.at(-1));assert.match(host.innerHTML,/data-answer="0"/);assert.match(host.innerHTML,/No positive-probability route/);
  assert.equal(context.probability1514Number(1e-300),'1e-300');assert.notEqual(context.probability1514Percent(1e-300),'0%');
});
