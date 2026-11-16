'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const P=require('../problems').SUPPORTED[62];
const sizes=[[1,1],[1,8],[8,1],[3,2],[3,7],[4,4],[8,8]];
function choose(n,k){let value=1;for(let i=1;i<=k;i++)value=value*(n-k+i)/i;return Math.round(value);}
function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);Object.values(value).forEach(freeze);}return value;}
function renderer(){
 const host={innerHTML:'',dataset:{},querySelector:()=>null,querySelectorAll:()=>[]};
 const context={lang:'vi',$:()=>host};vm.createContext(context);
 for(const name of ['grid-path-pictures','unique-paths-memo-62'])vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-'+name+'.js'),'utf8'),context);
 return {host,context};
}

test('62 bottom-up shows every initialized 1 and changes a cell only after its real assignment',()=>{
 for(const [rows,cols] of sizes){
  const result=P.builder([rows],{n:cols}),views=result.steps.map(s=>s.gridPathPictureView);
  assert.equal(result.answer,choose(rows+cols-2,rows-1));
  assert.equal(views[0].line,3);
  assert.deepEqual(views[0].counts,Array.from({length:rows},()=>Array.from({length:cols},()=>[1])));
  for(const view of views){
   assert.deepEqual(view.counts.map(row=>row.map(([value])=>value)),view.rawDP);
   assert.ok(view.known.flat(2).every(Boolean));
   for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const done=view.completed[row][col][0];
    assert.equal(done,!row||!col||view.writes.some(w=>w.cell[0]===row&&w.cell[1]===col));
    assert.equal(view.counts[row][col][0],done?choose(row+col,row):1);
   }
  }
  assert.ok(views.at(-1).completed.flat(2).every(Boolean));
 }
 const result=P.builder([3],{n:7}),{host,context}=renderer();context.steps=result.steps;
 context.stepIndex=0;context.renderGridPathPictures(result.steps[0]);
 assert.equal((host.innerHTML.match(/<b>1<\/b>/g)||[]).length,21);
 assert.match(host.innerHTML,/DP <b>9\/21<\/b>/);
 const preview=result.steps.findIndex(s=>s.gridPathPictureView.phase==='choose');
 context.stepIndex=preview;context.renderGridPathPictures(result.steps[preview]);
 assert.match(host.innerHTML,/1 ＋ 1 ＝ <strong>…<\/strong>/);
 context.stepIndex=preview+1;context.renderGridPathPictures(result.steps[preview+1]);
 assert.match(host.innerHTML,/1 ＋ 1 ＝ <strong>2<\/strong>/);
 context.stepIndex=0;context.renderGridPathPictures(result.steps[0]);
 assert.equal((host.innerHTML.match(/<b>1<\/b>/g)||[]).length,21);
});

test('62 memo reveals suffix path counts exactly once per cell, including base cases and cache hits',()=>{
 for(const [rows,cols] of sizes){
  const result=P.builder2([rows],{n:cols}),written=new Map();let hits=0;
  assert.equal(result.answer,choose(rows+cols-2,rows-1));
  for(let i=0;i<result.steps.length;i++){
   const step=result.steps[i],v=step.gridPathPictureView;
   assert.equal(step.codeBlock,2);assert.deepEqual(step.codeLines,[v.line]);
   assert.equal(v.source,P.code2[v.line-1].trim());assert.equal(v.trace.truncated,false);
   if(v.phase==='write'){
    const [row,col]=v.active,key=v.active.join(':');assert.ok(!written.has(key));
    assert.equal(v.returned,choose(rows+cols-row-col-2,rows-row-1));
    assert.ok([13,18].includes(v.line));
    if(v.line===18)assert.equal(v.returned,v.neighbors[0].value+v.neighbors[1].value);
    written.set(key,v.returned);
   }
   for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const expected=written.get(`${row}:${col}`)??null;
    assert.equal(v.counts[row][col][0],expected);assert.equal(v.known[row][col][0],expected!==null);
   }
   assert.equal(v.writes.length,written.size);
   if(v.outside){assert.equal(v.active,null);if(v.phase==='outside-return')assert.equal(v.returned,0);}
   if(v.pendingCall){
    assert.equal(v.execution.timing,'before');assert.equal(v.received,null);
    if(v.pendingCall.variable)assert.equal(v.neighbors.find(n=>n.direction===v.pendingCall.variable).value,null);
   }
   if(v.cacheHit){
    const previous=result.steps[i-1].gridPathPictureView;hits++;
    assert.ok(previous.pendingCall?.cached);assert.equal(v.stack.length,previous.stack.length);
    assert.equal(v.writes.length,previous.writes.length);
    assert.deepEqual(v.cacheHit.cell,previous.pendingCall.cell);
    assert.equal(written.get(v.cacheHit.cell.join(':')),v.cacheHit.value);
   }
   assert.equal(v.cacheHits,hits);
  }
  assert.equal(written.size,rows*cols);
  assert.equal(hits,(rows-1)*(cols-1));
 }
});

test('62 DFS calls, suspended stack source lines and returns match an independent CPython debugger',()=>{
 const source=`import ast,json,sys
p=json.load(sys.stdin);filename='<independent-62>'
ns={};exec(compile(p['code'],filename,'exec'),ns)
targets={node.lineno:compile(ast.fix_missing_locations(ast.Expression(ast.Tuple(elts=node.args,ctx=ast.Load()))),filename,'eval') for node in ast.walk(ast.parse(p['code'])) if isinstance(node,ast.Call) and isinstance(node.func,ast.Name) and node.func.id=='dfs'}
results=[]
for rows,cols in p['sizes']:
 calls=[];returns=[]
 def observe(frame,event,arg):
  if frame.f_code.co_filename!=filename:return observe
  if event=='line' and frame.f_lineno in targets:
   stack=[];cursor=frame
   while cursor:
    if cursor.f_code.co_filename==filename and cursor.f_code.co_name=='dfs':stack.append([cursor.f_locals['row'],cursor.f_locals['col'],cursor.f_lineno])
    cursor=cursor.f_back
   calls.append({'line':frame.f_lineno,'scope':frame.f_code.co_name,'target':list(eval(targets[frame.f_lineno],frame.f_globals,frame.f_locals)),'down':frame.f_locals.get('down'),'right':frame.f_locals.get('right'),'stack':stack[::-1]})
  if event=='return' and frame.f_code.co_name=='dfs':returns.append({'cell':[frame.f_locals['row'],frame.f_locals['col']],'value':arg})
  return observe
 sys.settrace(observe)
 try:answer=ns['Solution']().uniquePaths(rows,cols)
 finally:sys.settrace(None)
 results.append({'answer':answer,'calls':calls,'returns':returns})
print(json.dumps(results))`;
 const python=spawnSync('python3',['-c',source],{input:JSON.stringify({code:P.code2.join('\n'),sizes}),encoding:'utf8'});
 assert.equal(python.status,0,python.stderr);const expected=JSON.parse(python.stdout);
 sizes.forEach(([rows,cols],i)=>{
  const result=P.builder2([rows],{n:cols}),calls=[],returns=[];assert.equal(result.answer,expected[i].answer);
  for(const step of result.steps){const v=step.gridPathPictureView;
   if(v.pendingCall){const vars=Object.fromEntries(step.vars.map(x=>[x.name,x.value==='—'?null:x.value]));calls.push({line:v.line,scope:v.execution.scope,target:v.pendingCall.cell,down:vars.down,right:vars.right,stack:v.stack.map(f=>[...f.cell,f.line])});}
   if(v.execution.event==='return'&&v.execution.scope==='dfs')returns.push({cell:v.active??v.outside,value:v.returned});
   for(const frame of v.stack.slice(0,-1)){assert.equal(frame.status,'waiting');assert.ok([15,16].includes(frame.line));}
  }
  assert.deepEqual(calls,expected[i].calls);assert.deepEqual(returns,expected[i].returns);
 });
});

test('62 renders immutable memo history in both languages and enumerates legal final routes',()=>{
 const result=freeze(P.builder2([3],{n:7})),before=JSON.stringify(result),{host,context}=renderer();context.steps=result.steps;
 for(const locale of ['vi','en']){
  context.lang=locale;
  result.steps.forEach((step,index)=>{
   context.stepIndex=index;context.renderGridPathPictures(step);
   const v=step.gridPathPictureView;
   assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);
   const values=Array.from(host.innerHTML.matchAll(/data-gp-memo-value="([^"]*)"/g),match=>match[1]);
   assert.deepEqual(values,v.counts.flatMap(row=>row.map(([value])=>value===null?'':String(value))));
   const sum=host.innerHTML.match(/data-gp62-sum="([^"]*)"/);
   if(sum)assert.equal(sum[1],v.phase==='write'?String(v.returned):'');
  });
 }
 assert.equal(JSON.stringify(result),before);
 const paths=Array.from({length:result.answer},(_,rank)=>JSON.parse(JSON.stringify(context.gpUnrank(3,7,rank))));
 assert.equal(new Set(paths.map(path=>JSON.stringify(path))).size,28);
 for(const path of paths){assert.deepEqual(path[0],[0,0]);assert.deepEqual(path.at(-1),[2,6]);assert.equal(path.length,9);for(let i=1;i<path.length;i++)assert.ok(path[i][0]-path[i-1][0]===1&&path[i][1]===path[i-1][1]||path[i][1]-path[i-1][1]===1&&path[i][0]===path[i-1][0]);}
});

test('62 saved lru_cache solution matches the snippet and runs at full problem dimensions',()=>{
 const saved=fs.readFileSync(require.resolve('../../Leetcode-sln/dynamic-programming/Leetcode_62_memo.py'),'utf8');
 assert.equal(saved.trim(),P.code2.join('\n').trim());
 const python=spawnSync('python3',['-c',"import json,sys,math\nns={};exec(json.load(sys.stdin),ns)\nfor rows,cols in [(1,100),(100,1),(3,7),(100,100)]:\n assert ns['Solution']().uniquePaths(rows,cols)==math.comb(rows+cols-2,rows-1)\nprint('ok')"],{input:JSON.stringify(saved),encoding:'utf8'});
 assert.equal(python.status,0,python.stderr);
 for(const [input,params] of [[[0],{}],[[9],{}],[[3],{n:0}],[[3],{n:9}],[[2,3],{n:2}]])assert.throws(()=>P.builder2(input,params),/62/);
 assert.equal(P.extraParams.find(p=>p.key==='approach').default,1);
});
