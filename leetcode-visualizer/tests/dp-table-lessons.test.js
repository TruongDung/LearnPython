'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const P=require('../problems').SUPPORTED,blocks={1277:1,1035:1,518:2,416:4,494:2};
const run=(id,input=P[id].defaultInput,params={})=>P[id][blocks[id]===1?'builder':'builder'+blocks[id]](input,params);
const code=id=>P[id][blocks[id]===1?'code':'code'+blocks[id]];
function squareCount(grid){let count=0;for(let r=0;r<grid.length;r++)for(let c=0;c<grid[0].length;c++)for(let side=1;r+side<=grid.length&&c+side<=grid[0].length;side++)if(grid.slice(r,r+side).every(row=>row.slice(c,c+side).every(n=>n===1)))count++;return count;}
function lines(a,b){const memo=new Map();function dfs(i,j){if(i===a.length||j===b.length)return 0;const key=i+':'+j;if(!memo.has(key))memo.set(key,Math.max(dfs(i+1,j),dfs(i,j+1),a[i]===b[j]?1+dfs(i+1,j+1):0));return memo.get(key);}return dfs(0,0);}
function coinsWays(coins,amount){function dfs(i,left){if(i===coins.length)return Number(left===0);let ways=0;for(let n=0;n*coins[i]<=left;n++)ways+=dfs(i+1,left-n*coins[i]);return ways;}return dfs(0,amount);}
function signedWays(nums,target){let ways=0;for(let mask=0;mask<2**nums.length;mask++){const sum=nums.reduce((s,n,i)=>s+((mask>>i)&1?n:-n),0);if(sum===target)ways++;}return ways;}
function partition(nums){const total=nums.reduce((a,b)=>a+b,0);if(total%2)return false;for(let mask=0;mask<2**nums.length;mask++)if(nums.reduce((s,n,i)=>s+((mask>>i)&1?n:0),0)===total/2)return true;return false;}
function frozen(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);Object.values(value).forEach(frozen);}return value;}
function renderContext(){const host={innerHTML:'',dataset:{},querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang:'vi',$:()=>host};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-dp-table-lessons.js'),'utf8'),ctx);return {host,ctx};}

test('1277 counts squares of every size and 1035 maximizes order-preserving matches',()=>{
 const grids=[[[0]],[[1]],[[1,1,1]],[[1],[1],[0]],[[0,1,1,1],[1,1,1,1],[0,1,1,1]],[[1,0,1],[1,1,0],[1,1,0]],Array.from({length:6},()=>Array(6).fill(1))];
 let seed=1277;for(let i=0;i<18;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const rows=1+seed%4,cols=1+(seed>>>4)%4;grids.push(Array.from({length:rows},()=>Array.from({length:cols},()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%2;})));}
 for(const grid of grids){const result=run(1277,grid);assert.equal(result.answer,squareCount(grid));assert.equal(result.steps.at(-1).dpTableLessonView.writes.length,grid.length*grid[0].length);}
 for(const [a,b] of [[[1,4,2],[1,2,4]],[[2,5,1,2,5],[10,5,2,1,5,2]],[[1,1,1],[1,1]],[[1],[2]],[[5],[5]],[[1,2,3,4],[4,3,2,1]],[[1,3,7,1,7,5],[1,9,2,5,1]]]){
  const result=run(1035,a,{nums2:JSON.stringify(b)});assert.equal(result.answer,lines(a,b));const {ctx}=renderContext(),route=ctx.dtpRoute(result.steps.at(-1).dpTableLessonView);
  assert.equal(route.pairs.length,result.answer);for(let i=0;i<route.pairs.length;i++){const [r,c]=route.pairs[i];assert.equal(a[r],b[c]);if(i){assert.ok(r>route.pairs[i-1][0]);assert.ok(c>route.pairs[i-1][1]);}}
 }
});

test('2D knapsack solutions agree with independent enumeration, including reuse, impossible sums, zeroes and negative targets',()=>{
 for(const [coins,amount] of [[[1,2,5],5],[[2],4],[[2],3],[[1,2],0],[[3,5,7],19],[[1,2,3,4,5,6,7,8],30]])assert.equal(run(518,coins,{amount}).answer,coinsWays(coins,amount));
 for(const nums of [[1,5,11,5],[1,2,3,5],[2,6],[1],[1,1],[3,1,5,9,4,2],[6,6,6,6,6,6,6,6,6,6]])assert.equal(run(416,nums).answer,partition(nums));
 for(const [nums,target] of [[[1,1,1,1,1],3],[[0],0],[[0,0,1],1],[[0,0,1],-1],[[1,2,1],-2],[[1],0],[[1],1000],[Array(10).fill(0),0],[Array(10).fill(6),0]])assert.equal(run(494,nums,{target}).answer,signedWays(nums,target));
 const reuse=run(518,[2],{amount:4}).steps.find(s=>s.dpTableLessonView.phase==='write'&&s.dpTableLessonView.active[1]===4).dpTableLessonView;
 assert.deepEqual(reuse.neighbors.find(n=>n.role==='take').cell,[1,2]);
 const zero=run(494,[0,0,1],{target:1}).steps.filter(s=>s.dpTableLessonView.phase==='write'&&s.dpTableLessonView.active[1]===0);
 assert.deepEqual(zero.slice(0,2).map(s=>s.dpTableLessonView.result),[2,4]);
 for(const id of [416,494])for(const step of run(id).steps){const v=step.dpTableLessonView;if(v.active&&v.phase==='write')assert.ok(v.neighbors.every(n=>n.cell[0]===v.active[0]-1));}
});

test('all five traces match actual CPython locals and full DP contents after every executed statement',()=>{
 const cases=[{id:1277,input:[[1,1],[1,0]],args:[[[1,1],[1,0]]]},{id:1035,input:[1,4,2],params:{nums2:'1,2,4'},args:[[1,4,2],[1,2,4]]},{id:518,input:[1,2],params:{amount:4},args:[4,[1,2]]},{id:416,input:[2,6],args:[[2,6]]},{id:416,input:[1,2],args:[[1,2]]},{id:494,input:[0,0,1],params:{target:1},args:[[0,0,1],1]},{id:494,input:[1],params:{target:0},args:[[1],0]}];
 const names=['rows','cols','row','col','coin','num','skip','take','total','target','positive'];
 const script=`import json,sys,copy
p=json.load(sys.stdin);out=[]
for case in p['cases']:
 filename='<independent-dp>';scope={};exec(compile(case['code'],filename,'exec'),scope);events=[];pending=None
 method=next(name for name in vars(scope['Solution']) if not name.startswith('_'))
 def trace(frame,event,arg):
  global pending
  if frame.f_code.co_filename!=filename or frame.f_code.co_name!=method:return trace
  if event in ('line','return'):
   if pending is not None:events.append({'line':pending,'vars':copy.deepcopy({name:frame.f_locals[name] for name in p['names'] if name in frame.f_locals}),'dp':copy.deepcopy(frame.f_locals.get('dp'))})
   pending=frame.f_lineno if event=='line' else None
  return trace
 sys.settrace(trace)
 try:answer=getattr(scope['Solution'](),method)(*case['args'])
 finally:sys.settrace(None)
 out.append({'answer':answer,'events':events})
print(json.dumps(out))`;
 const python=spawnSync('python3',['-c',script],{input:JSON.stringify({names,cases:cases.map(c=>({...c,code:code(c.id).join('\n')}))}),encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(python.status,0,python.stderr);
 const oracle=JSON.parse(python.stdout);cases.forEach((c,i)=>{const result=run(c.id,c.input,c.params);assert.equal(result.answer,oracle[i].answer);const actual=result.steps.map(step=>({line:step.dpTableLessonView.line,vars:Object.fromEntries(step.vars.map(v=>[v.name,v.value])),dp:step.dpTableLessonView.dp}));assert.deepEqual(actual,oracle[i].events,'#'+c.id);});
});

test('2D snapshots initialize every cell accurately and expose formula results only on a real write',()=>{
 for(const id of Object.keys(blocks).map(Number)){
  const result=run(id),before=JSON.stringify(result);let lastWrites=0;
  for(const step of result.steps){const v=step.dpTableLessonView;assert.equal(v.source,code(id)[v.line-1].trim());assert.deepEqual(step.codeLines,[v.line]);assert.equal(step.codeBlock,blocks[id]);assert.equal(v.trace.truncated,false);assert.ok(v.writes.length>=lastWrites);lastWrites=v.writes.length;
   if(v.phase==='allocate'){const initial=id===416?false:0;assert.ok(v.dp.flat().every(value=>value===initial));}
   if(v.phase==='write'){assert.equal(v.result,v.dp[v.active[0]][v.active[1]]);if([518,416,494].includes(id))assert.equal(v.result,id===416?v.skip||v.take:v.skip+v.take);}
   else assert.equal(v.result,null);
   assert.equal(v.final,step.final);if(!v.final)assert.equal(v.answer,null);
  }
  frozen(result);const {host,ctx}=renderContext();ctx.steps=result.steps;
  for(const lang of ['vi','en']){ctx.lang=lang;result.steps.forEach((step,index)=>{ctx.stepIndex=index;ctx.renderDPTableLesson(step);const v=step.dpTableLessonView;assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);const displayed=Array.from(host.innerHTML.matchAll(/data-dtp-value="([^"]*)"/g),m=>m[1]);assert.deepEqual(displayed,v.dp?v.dp.flat().map(String):[]);const formula=host.innerHTML.match(/data-dtp-result="([^"]*)"/);if(formula)assert.equal(formula[1],['write','base'].includes(v.phase)?String(v.dp[v.active[0]][v.active[1]]):'');});}
  assert.equal(JSON.stringify(result),before);
 }
});

test('final diagrams unrank every counted solution without reusing a 0/1 occurrence or double-counting coin order',()=>{
 for(const [id,input,params] of [[518,[1,2,5],{amount:5}],[518,[1,2],{amount:0}],[494,[0,0,1],{target:1}],[494,[1,2,1],{target:-2}],[416,[1,5,11,5],{}]]){
  const result=run(id,input,params),v=result.steps.at(-1).dpTableLessonView,{ctx}=renderContext(),paths=[];
  for(let rank=0;rank<Number(v.answer);rank++){
   const chosen=Array.from(ctx.dtpRoute(v,rank).chosen);paths.push(chosen.join(':'));
   if(id===518)assert.equal(chosen.reduce((s,i)=>s+input[i],0),params.amount);
   else{assert.equal(new Set(chosen).size,chosen.length);if(id===416)assert.equal(chosen.reduce((s,i)=>s+input[i],0),input.reduce((a,b)=>a+b,0)/2);else assert.equal(input.reduce((s,n,i)=>s+(chosen.includes(i)?n:-n),0),params.target);}
  }
  assert.equal(new Set(paths).size,Number(v.answer));
 }
 const result=run(1277),{host,ctx}=renderContext();ctx.steps=result.steps;ctx.stepIndex=result.steps.length-1;ctx.renderDPTableLesson(result.steps.at(-1));
 assert.equal((host.innerHTML.match(/data-dtp-square-member="true"/g)||[]).length,9);for(const [side,count] of [[1,10],[2,4],[3,1]])assert.match(host.innerHTML,new RegExp('data-dtp-size-count="'+side+'">'+count+'<'));
});

test('odd totals and impossible signed targets return before allocating a DP table',()=>{
 for(const [id,input,params,reason] of [[416,[1,2],{},/3 % 2 = 1/],[494,[1],{target:3},/\|3\| &gt; 1/],[494,[1],{target:0},/\(1 \+ 0\) % 2 = 1/]]){
  const result=run(id,input,params),{host,ctx}=renderContext();ctx.steps=result.steps;
  assert.equal(result.answer,id===416?false:0);
  for(const step of result.steps){assert.equal(step.dpTableLessonView.dp,null);ctx.renderDPTableLesson(step);assert.doesNotMatch(host.innerHTML,/data-dtp-cell=|undefined|NaN/);}
  assert.match(host.innerHTML,/dtp-infeasible/);assert.match(host.innerHTML,reason);
 }
});

test('new inputs reject malformed and oversized tables, while saved Python runs at official dimensions',()=>{
 const invalid=[[1277,'1,0;1',{}],[1277,[[2]],{}],[1277,Array.from({length:7},()=>[1]),{}],[1035,[1],{nums2:''}],[1035,[0],{}],[1035,[1],{nums2:'[1,2,3,4,5,6,7,8,9]'}],[518,[2,2],{}],[518,[1],{amount:31}],[518,[0],{}],[416,[31,31],{}],[416,Array(11).fill(1),{}],[494,[-1],{}],[494,[1],{target:true}]];
 for(const [id,input,params] of invalid)assert.throws(()=>run(id,input,params),new RegExp('#'+id));
 const payload={};for(const id of Object.keys(blocks).map(Number)){const suffix=[518,416,494].includes(id)?'_2d':'',saved=fs.readFileSync(require.resolve('../../Leetcode-sln/dynamic-programming/Leetcode_'+id+suffix+'.py'),'utf8');assert.equal(saved.trim(),code(id).join('\n'));payload[id]=saved;}
 const script=`import json,sys
p=json.load(sys.stdin)
for id,code in p.items():
 ns={};exec(code,ns);solution=ns['Solution']()
 if id=='1277':assert solution.countSquares([[1]*300 for _ in range(300)])==sum((301-side)**2 for side in range(1,301))
 if id=='1035':assert solution.maxUncrossedLines([1]*500,[1]*500)==500
 if id=='518':assert solution.change(5000,[1,2])==2501
 if id=='416':assert solution.canPartition([100]*200)
 if id=='494':assert solution.findTargetSumWays([0]*20,0)==2**20
print('ok')`;
 const python=spawnSync('python3',['-c',script],{input:JSON.stringify(payload),encoding:'utf8'});assert.equal(python.status,0,python.stderr);
 for(const id of [518,416,494])assert.equal(Number(P[id].extraParams.find(p=>p.key==='approach').default),blocks[id]);
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');assert.match(html,/renderer-dp-table-lessons\.js[^>]+data-problem-ids="1277 1035 518 416 494"/);assert.match(fs.readFileSync(require.resolve('../public/script.js'),'utf8'),/dpTableLessonView/);
});
