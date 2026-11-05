'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../problems').SUPPORTED;
const gridCases=[[[0,1,3,2],[5,1,2,5],[4,3,8,6]],[[0,4],[4,4]],[[0,1],[1,4]],[[0,1],[1,5]],[[0,0,0],[0,0,0]],[[0,2],[2,0]]];
function gridOracle(grid,id){const rows=grid.length,cols=grid[0].length,max=Math.max(...grid.flat())+rows*cols*4+10,states=Array.from({length:max+1},()=>new Set());states[0].add('0,0,0');for(let time=0;time<=max;time++)for(const key of states[time]){const[r,c,parity]=key.split(',').map(Number);if(r===rows-1&&c===cols-1)return time;if(id!==2577&&time<max)states[time+1].add(key);for(const[dr,dc]of[[0,1],[1,0],[0,-1],[-1,0]]){const nr=r+dr,nc=c+dc,duration=id===3342?parity?2:1:1,arrival=time+duration;if(nr<0||nr>=rows||nc<0||nc>=cols||arrival>max)continue;if(id===2577?arrival<grid[nr][nc]:time<grid[nr][nc])continue;states[arrival].add(`${nr},${nc},${id===3342?parity^1:0}`);}}return-1;}
function distances(n,edges,source,directed=false){const d=Array(n).fill(Infinity);d[source]=0;for(let round=0;round<n;round++)for(const[a,b,w]of edges){d[b]=Math.min(d[b],d[a]+w);if(!directed)d[a]=Math.min(d[a],d[b]+w);}return d;}
function feasible(n,edges,source,destination,target){const work=edges.map(e=>[...e]),unknown=edges.flatMap((e,i)=>e[2]===-1?[i]:[]);function dfs(i){if(i===unknown.length)return distances(n,work,source)[destination]===target;for(let w=1;w<=target+1;w++){work[unknown[i]][2]=w;if(dfs(i+1))return true;}return false;}return dfs(0);}
const graphCases=[{n:4,edges:[[0,1,-1],[1,3,2],[0,2,2],[2,3,5]],source:0,destination:3,target:6},{n:3,edges:[[0,1,-1],[0,2,5]],source:0,destination:2,target:6},{n:3,edges:[[0,1,-1],[1,2,7]],source:0,destination:2,target:3},{n:5,edges:[[4,1,-1],[2,0,-1],[0,3,-1],[4,3,-1]],source:0,destination:1,target:5},{n:4,edges:[[1,0,4],[1,2,3],[2,3,5],[0,3,-1]],source:0,destination:2,target:6}];
test('five lessons expose real Python line debugging and typed parsers',()=>{
 for(const id of[2577,3341,3342,2699,9030]){assert.equal(p[id].debugMode,'line-by-line');assert.ok(p[id].code.length>15);assert.equal(typeof p[id].liveArgs,'function');}
 for(const id of[2577,3341,3342])for(const bad of['',[[0]],[[0,1],[2]],[[0,-1],[0,0]],Array.from({length:9},()=>[0,0])])assert.throws(()=>p[id].builder(bad));assert.throws(()=>p[2577].builder([[1,0],[0,0]]));
 for(const input of['0-1--1','0-4-1','0-1-1000001'])assert.throws(()=>p[9030].builder(input,{n:3,start:0}));
 assert.deepEqual(p[9030].builder('[]',{n:1,start:0}).answer,[0]);
});
test('2577/3341/3342 displayed algorithms match an independent time-expanded search with explicit waiting and move turns',()=>{
 const cases=[];let seed=2577;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};for(const id of[2577,3341,3342]){for(const grid of gridCases)cases.push({id,grid});for(let i=0;i<90;i++){const rows=2+rand(3),cols=2+rand(3),grid=Array.from({length:rows},()=>Array.from({length:cols},()=>rand(10)));if(id===2577)grid[0][0]=0;cases.push({id,grid});}}
 const source=`import json,sys
p=json.load(sys.stdin)
solvers={}
for key,code in p['codes'].items():
    scope={}
    exec(code,scope)
    solvers[int(key)]=scope['Solution']()
print(json.dumps([getattr(solvers[c['id']], 'minimumTime' if c['id']==2577 else 'minTimeToReach')(c['grid']) for c in p['cases']]))`;
 const result=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify({codes:Object.fromEntries([2577,3341,3342].map(id=>[id,p[id].code.join('\n')])),cases}),encoding:'utf8'});assert.equal(result.status,0,result.stderr);JSON.parse(result.stdout).forEach((answer,i)=>assert.equal(answer,gridOracle(cases[i].grid,cases[i].id),JSON.stringify(cases[i])));
});
test('2699 reaches exactly target when possible, preserves known weights, and rejects only infeasible small graphs',()=>{
 const cases=[...graphCases];let seed=2699;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};for(let sample=0;sample<80;sample++){const n=2+rand(3),edges=[];for(let v=1;v<n;v++)edges.push([rand(v),v,rand(3)?1+rand(4):-1]);for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)if(rand(4)===0&&!edges.some(e=>e[0]===a&&e[1]===b)&&edges.filter(e=>e[2]===-1).length<3)edges.push([a,b,rand(2)?-1:1+rand(4)]);cases.push({n,edges,source:0,destination:n-1,target:1+rand(8)});}
 const source=`import json,sys
p=json.load(sys.stdin)
scope={}
exec(p['code'],scope)
print(json.dumps([scope['Solution']().modifiedGraphEdges(c['n'],[e[:] for e in c['edges']],c['source'],c['destination'],c['target']) for c in p['cases']]))`;
 const result=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify({code:p[2699].code.join('\n'),cases}),encoding:'utf8'});assert.equal(result.status,0,result.stderr);JSON.parse(result.stdout).forEach((answer,i)=>{const c=cases[i];if(answer.length){assert.equal(answer.length,c.edges.length);answer.forEach((edge,j)=>{assert.deepEqual(edge.slice(0,2),c.edges[j].slice(0,2));assert.ok(edge[2]>=1&&edge[2]<=2000000000);if(c.edges[j][2]>0)assert.equal(edge[2],c.edges[j][2]);});assert.equal(distances(c.n,answer,c.source)[c.destination],c.target);}else assert.equal(feasible(c.n,c.edges,c.source,c.destination,c.target),false,JSON.stringify(c));});
});
test('grid route certificates obey every gate, never stand still in 2577, and alternate durations independently of waiting in 3342',()=>{
 for(const id of[2577,3341,3342])for(const grid of gridCases){const before=JSON.stringify(grid),run=p[id].builder(grid);assert.equal(JSON.stringify(grid),before);assert.equal(run.answer,gridOracle(grid,id));const v=run.steps.at(-1).timeRoomView;if(run.answer<0){assert.equal(v.winner,null);continue;}let time=0,index=0,cell=[0,0];
  for(const leg of v.winner.legs){assert.deepEqual(leg.from,cell);assert.equal(leg.start,time);assert.equal(Math.abs(leg.to[0]-cell[0])+Math.abs(leg.to[1]-cell[1]),1);
   if(id===2577){assert.equal(leg.wait%2,0);assert.equal(leg.duration,1);for(let wait=0;wait<leg.wait;wait+=2){assert.equal(Math.abs(leg.buddy[0]-cell[0])+Math.abs(leg.buddy[1]-cell[1]),1);assert.ok(grid[leg.buddy[0]][leg.buddy[1]]<=time+1);assert.ok(grid[cell[0]][cell[1]]<=time+2);time+=2;}assert.ok(grid[leg.to[0]][leg.to[1]]<=time+1);time++;}
   else{assert.ok(leg.depart>=time&&leg.depart>=grid[leg.to[0]][leg.to[1]]);assert.equal(leg.duration,id===3342?index%2?2:1:1);time=leg.depart+leg.duration;}
   assert.equal(leg.arrival,time);cell=leg.to;index++;
  }assert.equal(time,run.answer);
 }
 assert.equal(p[3341].builder([[0,1000000000],[1000000000,0]]).answer,1000000002);assert.equal(p[3342].builder([[0,1000000000],[1000000000,0]]).answer,1000000003);
});
test('every source line and watched local, all heap arrays, distances and edge assignments agree with native CPython',()=>{
 const items=[2577,3341,3342,2699,9030].map(id=>({id,code:p[id].code.join('\n'),method:id===2577?'minimumTime':id===2699?'modifiedGraphEdges':id===9030?'shortestPaths':'minTimeToReach',args:p[id].liveArgs(p[id].defaultInput,{})}));
 const source=`import json,sys,runpy
p=json.load(sys.stdin)
trace=runpy.run_path(p['path'])['picture_trace']
print(json.dumps([json.loads(trace(item))['events'] for item in p['items']]))`;
 const result=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:64*1024*1024});assert.equal(result.status,0,result.stderr);
 JSON.parse(result.stdout).forEach((events,i)=>{const item=items[i],run=p[item.id].builder(p[item.id].defaultInput),viewName=item.id===2699||item.id===9030?'shortestGraphView':'timeRoomView';assert.equal(run.steps.length,events.length);let previous=null;run.steps.forEach((s,j)=>{const e=events[j],x={...e.outer,...e.locals},v=s[viewName];assert.deepEqual(s.codeLines,[e.line]);assert.equal(v.source,item.code.split('\n')[e.line-1].trim());s.vars.forEach(w=>assert.deepEqual(w.value,x[w.name]??'—'));
  if(viewName==='timeRoomView'){assert.deepEqual(v.dist,x.dist??null);assert.deepEqual(v.heap,x.heap??null);}
  else if(item.id===2699){assert.deepEqual(v.edges,e.outer.edges);if(previous&&JSON.stringify(v.edges)!==JSON.stringify(previous.edges))assert.equal(v.event,'assign-edge');}
  previous=v;
 });});
});
test('9030 keeps directed and zero-weight semantics and shows genuine stale entries',()=>{
 for(const[n,edges,start]of[[5,[[0,1,4],[0,2,1],[2,1,2],[1,3,1],[2,3,5],[3,4,3]],0],[4,[[0,1,0],[1,2,2]],0],[3,[[0,1,4],[1,2,1]],2]]){const run=p[9030].builder(edges,{n,start});assert.deepEqual(run.answer,distances(n,edges,start,true).map(v=>v===Infinity?'∞':v));}
 const run=p[9030].builder('0-1-8,0-2-1,2-1-1',{n:3,start:0});assert.ok(run.steps.some(s=>s.shortestGraphView.event==='stale'));assert.deepEqual(run.answer,[0,2,1]);
});
test('successful relaxations retain the previous distance after dist is written',()=>{
 for(const id of[2699,9030]){const run=p[id].builder(p[id].defaultInput);let writes=0;for(const s of run.steps){const v=s.shortestGraphView;if(v.event!=='write')continue;const q=v.proposal;assert.ok(q.oldDistance==='∞'||q.candidate<q.oldDistance);assert.equal(v.dist[q.to],q.candidate);assert.equal(q.accepted,true);writes++;}assert.ok(writes>0);}
});
test('all five picture renderers preserve inputs/replay and show actual state values in Vietnamese and English',()=>{
 const host={innerHTML:'',querySelector:()=>null},ctx={lang:'vi',$:()=>host,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;')};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-shortest-path-lessons.js'),'utf8'),ctx);
 for(const language of['vi','en']){ctx.lang=language;for(const id of[2577,3341,3342,2699,9030]){const run=p[id].builder(p[id].defaultInput),before=JSON.stringify(run),renderer=id===2699||id===9030?'renderShortestGraphPictures':'renderTimeRoomPictures';for(const s of run.steps){ctx[renderer](s);const html=host.innerHTML;assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object|<p>/);assert.match(html,/tp-viz/);if(s.timeRoomView){const v=s.timeRoomView;assert.equal((html.match(/data-room=/g)||[]).length,v.rows*v.cols);assert.deepEqual([...html.matchAll(/data-heap-entry="([^"]+)"/g)].map(m=>m[1].split(',').map(Number)),v.heap??[]);}else{const v=s.shortestGraphView;assert.deepEqual([...html.matchAll(/data-edge-id="\d+" data-edge-weight="(-?\d+)"/g)].map(m=>Number(m[1])),v.edges.map(e=>e[2]));}}
  ctx[renderer](run.steps[0]);const first=host.innerHTML;ctx[renderer](run.steps.at(-1));ctx[renderer](run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run),before);
 }}
});
