'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const P=require('../problems').SUPPORTED[63];
const cases=[[[0]],[[1]],[[0,0,0],[0,1,0],[0,0,0]],[[1,0],[0,0]],[[0,0],[0,1]],[[0,1,0]],[[0],[1],[0]],[[0,0,1],[0,1,0],[0,0,0]],[[0,0,0],[1,1,0],[0,0,0]],Array.from({length:6},()=>Array(6).fill(0))];
function count(grid,row=0,col=0){if(row>=grid.length||col>=grid[0].length||grid[row][col])return 0;if(row===grid.length-1&&col===grid[0].length-1)return 1;return count(grid,row+1,col)+count(grid,row,col+1);}
function context(){const host={innerHTML:'',dataset:{},querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang:'vi',$:()=>host};vm.createContext(ctx);for(const file of ['grid-path-pictures','unique-paths-memo-62'])vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-'+file+'.js'),'utf8'),ctx);return {host,ctx};}

test('63 cached DFS agrees with exhaustive routes, visits each reachable cell once and checks obstacles before the goal',()=>{
 for(const grid of cases){const before=JSON.stringify(grid),result=P.builder2(grid),written=new Map();assert.equal(result.answer,count(grid));
  for(const step of result.steps){const v=step.gridPathPictureView;assert.equal(v.id,63);assert.equal(v.method,2);assert.equal(v.source,P.code2[v.line-1].trim());assert.deepEqual(step.codeLines,[v.line]);assert.equal(step.codeBlock,2);assert.equal(v.trace.truncated,false);
   if(v.phase==='write'){const key=v.active.join(':');assert.ok(!written.has(key));assert.equal(v.returned,count(grid,...v.active));written.set(key,v.returned);}
   for(let row=0;row<grid.length;row++)for(let col=0;col<grid[0].length;col++){const value=written.get(row+':'+col)??null;assert.equal(v.rawDP[row][col],value);assert.equal(v.known[row][col][0],value!==null);}
   if(v.blocked){assert.equal(v.goal,false);assert.equal(v.neighbors.length,0);if(v.phase==='write')assert.equal(v.returned,0);}
  }
  assert.equal(JSON.stringify(grid),before);
 }
 const blocked=P.builder2([[0,1,0]]).steps.at(-1).gridPathPictureView;assert.equal(blocked.rawDP[0][2],null);assert.equal(blocked.known[0][2][0],false);
});

test('63 cache hits reuse zero correctly, and no result is assigned before a child call returns',()=>{
 let zeroHits=0;
 for(const grid of cases){const result=P.builder2(grid);let hits=0;for(let i=0;i<result.steps.length;i++){const step=result.steps[i],v=step.gridPathPictureView;
  if(v.pendingCall){assert.equal(v.execution.timing,'before');assert.equal(v.received,null);if(v.pendingCall.variable)assert.equal(v.neighbors.find(n=>n.direction===v.pendingCall.variable).value,null);}
  if(v.cacheHit){const previous=result.steps[i-1].gridPathPictureView;hits++;if(v.cacheHit.value===0)zeroHits++;assert.ok(previous.pendingCall.cached);assert.deepEqual(previous.pendingCall.cell,v.cacheHit.cell);assert.equal(previous.stack.length,v.stack.length);assert.equal(previous.writes.length,v.writes.length);assert.equal(v.rawDP[v.cacheHit.cell[0]][v.cacheHit.cell[1]],v.cacheHit.value);}
  assert.equal(v.cacheHits,hits);
 }}assert.ok(zeroHits>0);
});

test('63 call sites, waiting stack lines and actual returns match an independent CPython debugger',()=>{
 const script=`import ast,json,sys
p=json.load(sys.stdin);filename='<oracle63>';ns={};exec(compile(p['code'],filename,'exec'),ns)
targets={node.lineno:compile(ast.fix_missing_locations(ast.Expression(ast.Tuple(elts=node.args,ctx=ast.Load()))),filename,'eval') for node in ast.walk(ast.parse(p['code'])) if isinstance(node,ast.Call) and isinstance(node.func,ast.Name) and node.func.id=='dfs'}
out=[]
for grid in p['cases']:
 calls=[];returns=[]
 def observe(frame,event,arg):
  if frame.f_code.co_filename!=filename:return observe
  if event=='line' and frame.f_lineno in targets:
   stack=[];cursor=frame
   while cursor:
    if cursor.f_code.co_filename==filename and cursor.f_code.co_name=='dfs':stack.append([cursor.f_locals['row'],cursor.f_locals['col'],cursor.f_lineno])
    cursor=cursor.f_back
   calls.append({'line':frame.f_lineno,'target':list(eval(targets[frame.f_lineno],frame.f_globals,frame.f_locals)),'down':frame.f_locals.get('down'),'right':frame.f_locals.get('right'),'stack':stack[::-1]})
  if event=='return' and frame.f_code.co_name=='dfs':returns.append({'cell':[frame.f_locals['row'],frame.f_locals['col']],'value':arg})
  return observe
 sys.settrace(observe)
 try:answer=ns['Solution']().uniquePathsWithObstacles(grid)
 finally:sys.settrace(None)
 out.append({'answer':answer,'calls':calls,'returns':returns})
print(json.dumps(out))`;
 const py=spawnSync('python3',['-c',script],{input:JSON.stringify({code:P.code2.join('\n'),cases}),encoding:'utf8'});assert.equal(py.status,0,py.stderr);
 const oracle=JSON.parse(py.stdout);cases.forEach((grid,i)=>{const result=P.builder2(grid),calls=[],returns=[];for(const step of result.steps){const v=step.gridPathPictureView;if(v.pendingCall){const vars=Object.fromEntries(step.vars.map(x=>[x.name,x.value==='—'?null:x.value]));calls.push({line:v.line,target:v.pendingCall.cell,down:vars.down,right:vars.right,stack:v.stack.map(frame=>[...frame.cell,frame.line])});}if(v.execution.event==='return'&&v.execution.scope==='dfs')returns.push({cell:v.active??v.outside,value:v.returned});}assert.equal(result.answer,oracle[i].answer);assert.deepEqual(calls,oracle[i].calls);assert.deepEqual(returns,oracle[i].returns);});
});

test('63 renders both grids and every native snapshot without mutation; every final route avoids obstacles',()=>{
 for(const grid of cases){const result=P.builder2(grid),before=JSON.stringify(result),{host,ctx}=context();ctx.steps=result.steps;
  for(const lang of ['vi','en']){ctx.lang=lang;result.steps.forEach((step,index)=>{ctx.stepIndex=index;ctx.renderGridPathPictures(step);assert.match(host.innerHTML,/gp63-memo/);assert.match(host.innerHTML,/gp-grid-pair/);assert.match(host.innerHTML,/memo\[row\]\[col\]/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);const values=Array.from(host.innerHTML.matchAll(/data-gp-dp="[^\"]+" data-gp-value="([^\"]*)"/g),m=>m[1]);assert.deepEqual(values,step.gridPathPictureView.rawDP.flat().map(value=>value===null?'':String(value)));});}
  const end=result.steps.at(-1).gridPathPictureView,paths=[];for(let rank=0;rank<result.answer;rank++){const path=Array.from(ctx.gpMemoPath(end,rank),cell=>Array.from(cell));assert.deepEqual(path[0],[0,0]);assert.deepEqual(path.at(-1),[grid.length-1,grid[0].length-1]);assert.equal(path.length,grid.length+grid[0].length-1);for(let i=0;i<path.length;i++){assert.equal(grid[path[i][0]][path[i][1]],0);if(i)assert.ok(path[i][0]-path[i-1][0]===1&&path[i][1]===path[i-1][1]||path[i][1]-path[i-1][1]===1&&path[i][0]===path[i-1][0]);}paths.push(JSON.stringify(path));}assert.equal(new Set(paths).size,result.answer);if(!result.answer){assert.match(host.innerHTML,/Destination unreachable/);assert.doesNotMatch(host.innerHTML,/data-gp62-range/);}assert.equal(JSON.stringify(result),before);
 }
});

test('63 saved Python matches the snippet, runs at full dimensions and keeps existing input validation',()=>{
 const saved=fs.readFileSync(require.resolve('../../Leetcode-sln/dynamic-programming/Leetcode_63_memo.py'),'utf8');assert.equal(saved.trim(),P.code2.join('\n'));
 const py=spawnSync('python3',['-c',"import json,sys,math\nns={};exec(json.load(sys.stdin),ns)\ngrid=[[0]*100 for _ in range(100)]\nassert ns['Solution']().uniquePathsWithObstacles(grid)==math.comb(198,99)\ngrid[-1][-1]=1\nassert ns['Solution']().uniquePathsWithObstacles(grid)==0\nprint('ok')"],{input:JSON.stringify(saved),encoding:'utf8'});assert.equal(py.status,0,py.stderr);
 for(const input of [[[2]],[[0],[]],[],Array.from({length:7},()=>[0]),'0,,1'])assert.throws(()=>P.builder2(input),/63/);
 assert.equal(P.extraParams.find(p=>p.key==='approach').default,1);assert.equal(P.builder(P.defaultInput).answer,P.builder2(P.defaultInput).answer);
});
