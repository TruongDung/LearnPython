'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[2203],common={n:4,src1:0,src2:1,dest:3};
const build=(edges,params,method=Number(params.approach??1))=>problem[method===1?'builder':`builder${method}`](edges,params);
function connected(edges,ids,source,dest) {
  const seen=new Set([source]),queue=[source],adj=new Map();
  for(const id of ids){const[u,v]=edges[id];if(!adj.has(u))adj.set(u,[]);adj.get(u).push(v);}
  for(const node of queue)for(const v of adj.get(node)||[])if(!seen.has(v)){seen.add(v);queue.push(v);}
  return seen.has(dest);
}
function oracle(edges,{src1,src2,dest}) {
  let best=Infinity;
  for(let mask=0;mask<2**edges.length;mask++) {
    const ids=edges.map((_,i)=>i).filter(i=>mask&2**i),weight=ids.reduce((sum,i)=>sum+edges[i][2],0);
    if(weight<best&&connected(edges,ids,src1,dest)&&connected(edges,ids,src2,dest))best=weight;
  }
  return best===Infinity?-1:best;
}
function checkSubgraph(edges,params,result) {
  const v=result.steps.at(-1).subgraph2203View;
  assert.equal(v.answer,result.answer);assert.equal(v.phase,'done');assert.equal(v.final,true);
  if(result.answer===-1){assert.equal(v.bestMeeting,null);assert.ok(v.routes.every(route=>!route.length));return;}
  const ids=[...new Set(v.routes.flat())];assert.equal(ids.reduce((sum,i)=>sum+edges[i][2],0),result.answer);
  assert.ok(connected(edges,ids,params.src1,params.dest));assert.ok(connected(edges,ids,params.src2,params.dest));
  for(const[route,start,end]of [[v.routes[0],params.src1,v.bestMeeting],[v.routes[1],params.src2,v.bestMeeting],[v.routes[2],v.bestMeeting,params.dest]]) {
    let node=start;for(const id of route){assert.equal(edges[id][0],node);node=edges[id][1];}assert.equal(node,end);
  }
}
let seed=2203;const rand=max=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%max;};
const randomCases=Array.from({length:15},()=>{const n=3+rand(3),edges=[];for(let u=0;u<n;u++)for(let v=0;v<n;v++)if(u!==v&&rand(3)===0&&edges.length<9)edges.push([u,v,1+rand(8)]);return{edges,params:{n,src1:0,src2:1,dest:n-1}};});
test('2203 all five traced algorithms agree with exhaustive edge-subset enumeration',()=>{
  const cases=[...randomCases,{edges:[[0,2,2],[1,2,3],[2,3,4],[0,3,10],[1,3,9]],params:common},{edges:[],params:common},{edges:[[0,2,8],[0,2,2],[1,2,3],[2,3,4],[3,2,1]],params:common}];
  for(const{edges,params}of cases)for(let method=1;method<=5;method++) {
    const original=JSON.stringify(edges),result=build(edges,params,method);assert.equal(result.answer,oracle(edges,params));assert.equal(JSON.stringify(edges),original);checkSubgraph(edges,params,result);assert.equal(result.steps.filter(s=>s.final).length,1);
    for(const s of result.steps){const v=s.subgraph2203View;assert.equal(s.codeBlock,method);assert.deepEqual(s.codeLines,[v.source.line]);assert.equal(v.source.text,problem[method===1?'code':`code${method}`][v.source.line-1]);assert.equal(v.source.timing,'after');assert.equal(s.note.vi,'');}
  }
});
test('2203 snapshots match nested Python frames, reversed edges, heap order and relaxations',()=>{
  const edges=[[0,2,9],[0,4,1],[4,2,1],[1,2,1],[2,3,1]],params={n:5,src1:0,src2:1,dest:3},result=build(edges,params),views=result.steps.map(s=>s.subgraph2203View);
  assert.ok(views.some(v=>v.source.scope==='dijkstra'));assert.ok(views.some(v=>v.phase==='stale'));
  assert.ok(views.some(v=>v.activeRun==='dest'&&v.activeEdge?.originalU===2&&v.activeEdge.originalV===3&&v.activeEdge.u===3&&v.activeEdge.v===2));
  for(const v of views) {
    if(v.phase==='calculate')assert.equal(v.candidate,v.locals.distance+v.activeEdge.w);
    if(v.phase==='compare')assert.equal(v.improves,v.candidate<v.oldDistance||v.oldDistance==='∞');
    if(v.phase==='update'){const key=v.activeRun==='src1'?'d1':v.activeRun==='src2'?'d2':'dt';assert.equal(v.rows.find(r=>r.node===v.activeEdge.v)[key],v.candidate);}
    if(v.phase==='push'&&v.heapSize<=15)assert.ok(v.heap.some(([d,node])=>d===v.candidate&&node===v.activeEdge.v));
    for(let i=1;i<v.heap.length;i++){const p=v.heap[(i-1)>>1],c=v.heap[i];assert.ok(p[0]<c[0]||p[0]===c[0]&&p[1]<=c[1]);}
  }
  checkSubgraph(edges,params,result);
});
test('2203 displayed sources run in native CPython',()=>{
  const source="import json,sys\np=json.load(sys.stdin)\nresult=[]\nfor code in p['codes']:\n scope={}\n exec(code,scope)\n result.append([scope['Solution']().minimumWeight(c['params']['n'],c['edges'],c['params']['src1'],c['params']['src2'],c['params']['dest']) for c in p['cases']])\nprint(json.dumps(result))";
  const run=spawnSync('python3',['-c',source],{input:JSON.stringify({codes:[problem.code,problem.code2,problem.code3,problem.code4,problem.code5].map(code=>code.join('\n')),cases:randomCases}),encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);for(const answers of JSON.parse(run.stdout))assert.deepEqual(answers,randomCases.map(c=>oracle(c.edges,c.params)));
});
test('2203 finishes 100000 nodes and edges with bounded pictures and costs above 32 bits',()=>{
  const n=100000,edges=[[0,2,100000],[1,2,100000]];for(let node=2;node<n-1;node++)edges.push([node,node+1,100000]);edges.push([0,2,100000]);
  const params={n,src1:0,src2:1,dest:n-1},result=build(edges,params),v=result.steps.at(-1).subgraph2203View;
  assert.equal(edges.length,100000);assert.equal(result.answer,9999900000);assert.ok(result.steps.length<=1601);assert.equal(v.trace.truncated,true);assert.equal(v.cropped,true);assert.ok(v.nodes.length<=6);assert.ok(v.edges.length<=18);checkSubgraph(edges,params,result);
});
test('2203 alternative methods keep complete results after the picture budget',()=>{
  const n=12,edges=[];for(let u=0;u<n;u++)for(let v=0;v<n;v++)if(u!==v)edges.push([u,v,1+(u+v)%7]);const params={n,src1:0,src2:1,dest:11},expected=build(edges,params).answer;
  for(let method=2;method<=5;method++){const result=build(edges,params,method);assert.equal(result.answer,expected);assert.ok(result.steps.length<=1601);checkSubgraph(edges,params,result);}
});
test('2203 validates input, permits parallel edges and prepares live arguments',()=>{
  assert.deepEqual(problem.liveArgs('0,2,2;1,2,3',common),[4,[[0,2,2],[1,2,3]],0,1,3]);assert.deepEqual(problem.liveArgs('[[0,2,2],[0,2,3]]',common),[4,[[0,2,2],[0,2,3]],0,1,3]);
  for(const input of ['0,0,1','0,4,1','0,2,0','0,2,-1','0,2,1.1','0,2,100001','0,2,3,4','0,2,','[[0,2]','[[0,2,"3"]]'])assert.throws(()=>build(input,common),/2203/);
  for(const params of [{...common,n:2},{...common,n:100001},{...common,src1:1},{...common,dest:4}])assert.throws(()=>build('',params),/2203/);
  assert.throws(()=>problem.builder('',{...common,approach:6}),/2203/);assert.throws(()=>build('',{n:41,src1:0,src2:1,dest:40},3),/2203/);
  assert.ok(JSON.parse(fs.readFileSync(require.resolve('../vercel.json'),'utf8')).functions['server.js'].includeFiles.includes('problems/minimum-subgraph-trace.py'));
});
test('2203 renderer illustrates all methods, reversals, a shared suffix and failure in VI/EN',()=>{
  const host={innerHTML:''},context={lang:'vi',$:()=>host,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-minimum-subgraph-2203.js'),'utf8'),context);
  for(let method=1;method<=5;method++) {
    const result=build(problem.defaultInput,common,method);
    for(const language of ['vi','en'])for(const step of [result.steps[0],result.steps.find(s=>s.subgraph2203View.activeRun==='dest'||s.subgraph2203View.phase==='floyd'),result.steps.at(-1)]){context.lang=language;context.renderSubgraph2203Pictures(step);assert.match(host.innerHTML,/sg2203-graph-svg/);assert.match(host.innerHTML,/sg2203-table/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|object Object/);}
    assert.match(host.innerHTML,/data-answer="9"/);assert.match(host.innerHTML,/sg2203-merge/);assert.match(host.innerHTML,/sg2203-edge shared/);
  }
  context.renderSubgraph2203Pictures(build('',common).steps.at(-1));assert.match(host.innerHTML,/data-answer="-1"/);assert.match(host.innerHTML,/Cannot connect both/);
});
