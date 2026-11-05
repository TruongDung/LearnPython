'use strict';
const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[547],build=(matrix,method)=>p[method===1?'builder':'builder2'](matrix,{approach:method});
const matrix=(n,edges=[])=>{const a=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>Number(i===j)));edges.forEach(([i,j])=>a[i][j]=a[j][i]=1);return a;};
const fixtures=[JSON.parse(p.defaultInput),matrix(4,[[0,1],[1,2]]),matrix(4),matrix(3,[[0,1],[0,2],[1,2]]),matrix(1),matrix(6,[[0,1],[1,2],[3,4],[4,5],[3,5]]),matrix(7,[[0,4],[1,2],[1,3],[2,5],[4,5],[5,6]]),matrix(10,[[0,8],[1,6],[2,7],[6,7],[7,9],[8,9]])];
function oracle(a){const reach=a.map(row=>[...row]);for(let k=0;k<a.length;k++)for(let i=0;i<a.length;i++)for(let j=0;j<a.length;j++)reach[i][j]=Number(reach[i][j]||reach[i][k]&&reach[k][j]);const groups=[];for(let i=0;i<a.length;i++)if(!groups.some(g=>g.includes(i)))groups.push(reach[i].flatMap((v,j)=>v?[j]:[]));return groups;}
const python=(source,payload)=>{const r=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify(payload),encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);};
test('547 retains Union-Find/recursive DFS, direct method selection and prepared matrix arguments',()=>{
 assert.equal(p.debugMode,'line-by-line');assert.deepEqual(p.extraParams[0].options.map(o=>Number(o.value)),[1,2]);assert.equal(p.builder(p.defaultInput,{approach:2}).steps[0].codeBlock,2);
 assert.deepEqual(p.liveArgs('1,1,0;1,1,0;0,0,1'),[fixtures[0]]);assert.deepEqual(p.liveArgs('110|110|001'),[fixtures[0]]);for(const m of[1,2])assert.equal(build(fixtures[0],m).answer,2);
});
test('both displayed Python methods match independent transitive closure on every four-city graph and 100 random matrices',()=>{
 const cases=[...fixtures],edges=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];for(let mask=0;mask<64;mask++)cases.push(matrix(4,edges.filter((_,i)=>mask>>i&1)));
 let seed=547;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};for(let s=0;s<100;s++){const n=1+rand(9),pairs=[];for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(rand(4)===0)pairs.push([i,j]);cases.push(matrix(n,pairs));}
 const result=python(`import json,sys
p=json.load(sys.stdin)
out=[]
for code in p['codes']:
    scope={}
    exec(code,scope)
    out.append([scope['Solution']().findCircleNum(a) for a in p['cases']])
print(json.dumps(out))`,{codes:[p.code.join('\n'),p.code2.join('\n')],cases});result.forEach(out=>assert.deepEqual(out,cases.map(a=>oracle(a).length)));
 for(const a of cases.slice(0,80))for(const method of[1,2]){const before=JSON.stringify(a),run=build(a,method),v=run.steps.at(-1).province547View;assert.equal(run.answer,oracle(a).length);assert.deepEqual(v.groups.map(g=>g.members),oracle(a));assert.equal(v.count,run.answer);assert.equal(JSON.stringify(a),before);}
});
test('native Python confirms every source line, local, partial UnionFind attribute and DFS visited/frame state',()=>{
 const items=fixtures.flatMap(a=>[1,2].map(m=>({m,code:(m===1?p.code:p.code2).join('\n'),method:'findCircleNum',args:[a],stateClasses:m===1?['UnionFind']:[]})));
 const native=python(`import json,sys,runpy
p=json.load(sys.stdin)
trace=runpy.run_path(p['path'])['picture_trace']
print(json.dumps([json.loads(trace(item)) for item in p['items']]))`,{path:require.resolve('../problems/picture-trace.py'),items});
 native.forEach((n,i)=>{const item=items[i],run=build(item.args[0],item.m);assert.equal(run.steps.length,n.events.length);let state={};n.events.forEach((event,j)=>{const s=run.steps[j],v=s.province547View,x={...event.outer,...event.locals};assert.deepEqual(s.codeLines,[event.line]);assert.equal(s.codeBlock,item.m);assert.equal(v.scope,event.scope);s.vars.forEach(w=>assert.deepEqual(w.value,x[w.name]??'—'));
  if(item.m===1){if(event.locals.self)state=event.locals.self;assert.deepEqual(v.parent,state.parent??null);assert.deepEqual(v.rank,state.rank??null);assert.equal(v.count,state.components??null);assert.equal(v.findCity,event.scope==='find'?event.locals.x:null);}
  else{assert.deepEqual(v.visited,event.outer.visited??[]);assert.equal(v.count,event.outer.provinces??null);assert.deepEqual(v.stack,event.frames.filter(f=>f.name==='dfs').map(f=>f.locals.city));for(let city=0;city<v.n;city++)assert.equal(v.owners[city]!==null,Boolean(event.outer.visited?.[city]));}
  if(v.event==='matrix')assert.deepEqual(v.cell,item.m===1?[event.outer.i,event.outer.j]:[event.locals.city,event.locals.neighbor]);
 });});
});
test('DSU grouping follows actual parent writes, rank swaps and compression, while redundant cycle edges never decrease count',()=>{
 let compressed=0,swapped=0,redundant=0,lag=0;
 for(const a of fixtures){const run=build(a,1);let previousParent=null,previousCount=null;
  for(const s of run.steps){const v=s.province547View;if(v.parent){const actual=new Map();v.parent.forEach((_,city)=>{let root=city;for(let guard=0;v.parent[root]!==root&&guard<v.n;guard++)root=v.parent[root];assert.equal(v.parent[root],root);if(!actual.has(root))actual.set(root,[]);actual.get(root).push(city);});assert.deepEqual(v.groups.map(g=>g.members),[...actual.values()].sort((a,b)=>a[0]-b[0]));if(v.count!==null&&v.groups.length!==v.count)lag++;
   if(previousParent&&JSON.stringify(previousParent)!==JSON.stringify(v.parent))assert.ok(v.event==='link'||v.event==='compress');}
   if(v.event==='compress'&&v.change.before!==v.change.after)compressed++;
   if(v.source==='rx, ry = ry, rx')swapped++;
   if(v.event==='same'){assert.equal(v.roots[0],v.roots[1]);assert.equal(v.count,previousCount);redundant++;}
   if(previousCount!==null&&v.count<previousCount){assert.equal(v.event,'merge');assert.equal(v.count,previousCount-1);}
   for(const[i,j]of v.used)assert.equal(a[i][j],1);previousParent=v.parent;previousCount=v.count;
  }
 }assert.ok(compressed&&swapped&&redundant&&lag);
});
test('DFS marks cities only when visited is written and treats indirect connections as one province',()=>{
 const a=fixtures[1],run=build(a,2);let previous=Array(4).fill(null),visits=0;
 for(const [index,s]of run.steps.entries()){const v=s.province547View;if(JSON.stringify(v.owners)!==JSON.stringify(previous)){assert.equal(v.event,'visit');assert.equal(v.source,'visited[city] = True');visits++;}for(const h of v.history)assert.equal(run.steps[h.step].province547View.event,'province');for(const[i,j]of v.used)assert.equal(a[i][j],1);previous=v.owners;}
 const v=run.steps.at(-1).province547View;assert.equal(visits,4);assert.equal(a[0][2],0);assert.equal(v.colorOf[0],v.colorOf[2]);assert.notEqual(v.colorOf[0],v.colorOf[3]);assert.equal(v.answer,2);
});
test('12-city complete, isolated and chain graphs retain exact counts, groups and the full DFS stack',()=>{
 const complete=Array.from({length:12},()=>Array(12).fill(1)),chain=matrix(12,Array.from({length:11},(_,i)=>[i,i+1]));
 for(const[a,count]of[[complete,1],[matrix(12),12],[chain,1]])for(const method of[1,2]){const run=build(a,method),v=run.steps.at(-1).province547View;assert.equal(run.answer,count);assert.equal(v.groups.flatMap(g=>g.members).length,12);assert.equal(v.matrix.flat().length,144);}
 assert.equal(Math.max(...build(chain,2).steps.map(s=>s.province547View.stack.length)),12);
});
test('both languages draw only original roads, every matrix cell and actual parent/visited state, and preserve replay',()=>{
 const host={innerHTML:''},context={lang:'vi',$:()=>host,escapeHtml:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-provinces-547.js'),'utf8'),context);
 for(const lang of['vi','en'])for(const method of[1,2])for(const a of fixtures.slice(0,6)){context.lang=lang;const run=build(a,method),before=JSON.stringify(run),roadCount=a.reduce((n,row,i)=>n+row.filter((value,j)=>value&&j>i).length,0);context.steps=run.steps;for(const[index,s]of run.steps.entries()){context.stepIndex=index;const v=s.province547View;context.renderProvince547View(s);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);assert.equal((host.innerHTML.match(/data-pv-city=/g)||[]).length,v.n);assert.equal((host.innerHTML.match(/data-pv-edge=/g)||[]).length,roadCount);assert.equal((host.innerHTML.match(/data-pv-cell=/g)||[]).length,v.n*v.n);assert.equal((host.innerHTML.match(/data-pv-parent=/g)||[]).length,v.parent?.length??0);assert.equal((host.innerHTML.match(/data-pv-member=/g)||[]).length,v.groups.reduce((n,g)=>n+g.members.length,0));assert.equal((host.innerHTML.match(/data-pv-active=/g)||[]).length,v.cell?1:0);if(v.final)assert.match(host.innerHTML,new RegExp(`data-pv-answer="${v.answer}"`));}
  context.stepIndex=0;context.renderProvince547View(run.steps[0]);const first=host.innerHTML;context.stepIndex=run.steps.length-1;context.renderProvince547View(run.steps.at(-1));context.stepIndex=0;context.renderProvince547View(run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run),before);
 }
});
test('matrix validation rejects asymmetry, non-one diagonals, ragged/nonbinary data and oversized demos',()=>{
 for(const a of[null,{},[],[[0]],[[1,0],[1,1]],[[1,1],[1]],[[1,true],[true,1]],[[1,2],[2,1]],[[1,'1'],['1',1]],matrix(13),'1,;0,1'])for(const method of[1,2])assert.throws(()=>build(a,method));
});
