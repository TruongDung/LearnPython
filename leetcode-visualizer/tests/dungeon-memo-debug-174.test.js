'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const P=require('../problems').SUPPORTED[174];
const grids=[[[-2,-3,3],[-5,-10,1],[10,30,-5]],[[5]],[[-5]],[[-1,-100],[100,-1]],[[1,-4,2]],[[1],[-4],[2]],Array.from({length:6},()=>Array(6).fill(-1))];
function nativeOracle(){
 const script=`import ast,json,sys,math
p=json.load(sys.stdin);filename='<independent-dfs>'
ns={};exec(compile(p['code'],filename,'exec'),ns)
targets={node.lineno:compile(ast.fix_missing_locations(ast.Expression(ast.Tuple(elts=node.args,ctx=ast.Load()))),filename,'eval') for node in ast.walk(ast.parse(p['code'])) if isinstance(node,ast.Call) and isinstance(node.func,ast.Name) and node.func.id=='dfs'}
def value(x):
 return '∞' if isinstance(x,float) and math.isinf(x) else x
results=[]
for grid in p['grids']:
 calls=[];returns=[]
 def observe(frame,event,arg):
  if frame.f_code.co_filename!=filename:return observe
  if event=='line' and frame.f_lineno in targets:
   stack=[];cursor=frame
   while cursor:
    if cursor.f_code.co_filename==filename and cursor.f_code.co_name=='dfs':stack.append([cursor.f_locals['row'],cursor.f_locals['col'],cursor.f_lineno])
    cursor=cursor.f_back
   calls.append({'line':frame.f_lineno,'scope':frame.f_code.co_name,'target':list(eval(targets[frame.f_lineno],frame.f_globals,frame.f_locals)),'down':value(frame.f_locals.get('down')),'right':value(frame.f_locals.get('right')),'stack':stack[::-1]})
  if event=='return' and frame.f_code.co_name=='dfs':returns.append({'cell':[frame.f_locals['row'],frame.f_locals['col']],'value':value(arg)})
  return observe
 sys.settrace(observe)
 try:answer=ns['Solution']().calculateMinimumHP(grid)
 finally:sys.settrace(None)
 results.append({'answer':answer,'calls':calls,'returns':returns})
print(json.dumps(results))`;
 const result=spawnSync('python3',['-c',script],{input:JSON.stringify({code:P.code2.join('\n'),grids}),encoding:'utf8'});assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);
}
test('174 DFS call lines, suspended stack lines and returns match an independent Python debugger',()=>{
 const expected=nativeOracle();grids.forEach((grid,i)=>{const result=P.builder2(grid),calls=[],returns=[];assert.equal(result.answer,expected[i].answer);
  for(const step of result.steps){const v=step.healthGameView;if(v.pendingCall){const vars=Object.fromEntries(step.vars.map(x=>[x.name,x.value==='—'?null:x.value]));assert.equal(v.execution.timing,'before');assert.equal(v.phase,'call');calls.push({line:v.line,scope:v.execution.scope,target:v.pendingCall.cell,down:vars.down,right:vars.right,stack:v.stack.map(f=>[...f.cell,f.line])});}
   if(v.execution.event==='return'&&v.execution.scope==='dfs')returns.push({cell:v.active??v.outside,value:v.returned});
   for(const f of v.stack.slice(0,-1)){assert.equal(f.status,'waiting');assert.ok([15,16].includes(f.line));}
  }
  assert.deepEqual(calls,expected[i].calls);assert.deepEqual(returns,expected[i].returns);assert.equal(result.steps.at(-1).healthGameView.trace.truncated,false);
 });
});
test('174 never assigns a DFS result or evaluates min/max before the corresponding source statement',()=>{
 for(const grid of grids){const result=P.builder2(grid),views=result.steps.map(s=>s.healthGameView);let hits=0;
  for(let i=0;i<views.length;i++){const v=views[i];if(v.pendingCall){assert.equal(v.nextNeed,null);assert.equal(v.required,null);assert.equal(v.rawNeed,null);assert.equal(v.received,null);if(v.pendingCall.variable){const n=v.neighbors.find(n=>n.direction===v.pendingCall.variable);assert.equal(n.need,null);}if(v.stack.length)assert.equal(v.stack.at(-1).status,'calling');}
   if(v.received){assert.equal(v.nextNeed,null);assert.equal(v.rawNeed,null);assert.equal(v.required,null);assert.equal(v.neighbors.find(n=>n.direction===v.received.variable).need,v.received.need);}
   if(v.cacheHit){hits++;const previous=views[i-1];assert.ok(previous.pendingCall?.cached);assert.equal(v.stack.length,previous.stack.length);assert.deepEqual(v.cacheHit.cell,previous.pendingCall.cell);assert.equal(v.dp[v.cacheHit.cell[0]][v.cacheHit.cell[1]],v.cacheHit.need);}
   if(v.phase==='write'){assert.ok([13,18].includes(v.line));assert.equal(v.execution.timing,'after');assert.equal(v.required,v.returned);assert.equal(v.required,Math.max(1,v.nextNeed-v.delta));}
   else if(!v.final){assert.equal(v.nextNeed,null);assert.equal(v.rawNeed,null);}
  }
  assert.equal(hits,views.at(-1).cacheHits);
 }
 const sample=P.builder2(grids[0]).steps.map(s=>s.healthGameView);assert.equal(sample.filter(v=>v.pendingCall).length,17);assert.equal(sample.at(-1).cacheHits,4);assert.equal(sample.at(-1).writes.length,9);
});
