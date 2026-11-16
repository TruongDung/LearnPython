'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[1463],encode=grid=>grid.map(row=>row.join(',')).join(';');
const sample=[[3,1,1],[2,5,1],[1,5,5],[2,1,1]];
const inputs=[sample,[[0,0],[0,0]],[[1,2],[3,4]],[[0,0,0],[0,100,0],[0,100,0]],Array.from({length:5},()=>Array(5).fill(100))];
function oracle(grid){
 const memo=new Map();function visit(row,a,b){
  if(row===grid.length)return 0;const key=[row,a,b].join(':');if(memo.has(key))return memo.get(key);
  let best=0;for(let x=Math.max(0,a-1);x<=Math.min(grid[0].length-1,a+1);x++)for(let y=Math.max(0,b-1);y<=Math.min(grid[0].length-1,b+1);y++)best=Math.max(best,visit(row+1,x,y));
  const result=grid[row][a]+(a===b?0:grid[row][b])+best;memo.set(key,result);return result;
 }return visit;
}
test('complete debug visits every DP state and reveals gains and writes only after their source statement',()=>{
 for(const grid of inputs){
  const run=p.builder(encode(grid)),best=oracle(grid),writes=new Set();assert.equal(run.answer,best(0,0,grid[0].length-1));
  for(const step of run.steps){
   const v=step.cherryPickup1463View;assert.equal(v.debug,true);assert.equal(v.trace.truncated,false);assert.equal(v.source.text,p.code[v.source.line-1].trim());assert.deepEqual(step.codeLines,[v.source.line]);
   if(v.pairActive){
    if(v.gainReady)assert.equal(v.gain,grid[v.row][v.c1]+(v.c1===v.c2?0:grid[v.row][v.c2]));
    if(v.phase==='read-a')assert.equal(v.gain,grid[v.row][v.c1]);
    if(v.bestNext!==null)assert.equal(v.bestNext,Math.max(0,...v.candidates.filter(c=>c.checked).map(c=>c.future)));
    for(const c of v.candidates){if(c.checked)assert.equal(c.future,best(v.row+1,c.c1,c.c2));else assert.equal(c.future,null);}
   }
   if(v.candidate?.future!==null&&v.candidate?.future!==undefined){assert.equal(v.source.line,20);assert.equal(v.candidate.after,Math.max(v.candidate.before,v.candidate.future));}
   if(v.matrix)for(let a=0;a<v.cols;a++)for(let b=0;b<v.cols;b++)assert.equal(v.matrix.cells[a][b],v.matrix.known[a][b]?best(v.matrix.row,a,b):0);
   if(v.nextMatrix)for(let a=0;a<v.cols;a++)for(let b=0;b<v.cols;b++)assert.equal(v.nextMatrix.cells[a][b],best(v.nextMatrix.row,a,b));
   if(v.phase==='write'){
    assert.equal(v.source.line,21);assert.equal(v.total,best(v.row,v.c1,v.c2));const key=[v.row,v.c1,v.c2].join(':');assert.ok(!writes.has(key));writes.add(key);
   }
   assert.equal(v.written,writes.size);
  }
  assert.equal(writes.size,grid.length*grid[0].length**2);
  const last=run.steps.at(-1).cherryPickup1463View;assert.equal(last.path.length,grid.length);assert.equal(last.path.at(-1).collected,run.answer);
  for(let i=1;i<last.path.length;i++){assert.ok(Math.abs(last.path[i].c1-last.path[i-1].c1)<=1);assert.ok(Math.abs(last.path[i].c2-last.path[i-1].c2)<=1);}
 }
});
test('every Python assignment snapshot matches independently instrumented CPython',()=>{
 const cases=[sample,[[0,0],[0,0]],[[1,2],[3,4]]],names=['rows','cols','row','c1','c2','cherries','best_next','n1','n2'];
 const script=`import ast,copy,json,sys
p=json.load(sys.stdin);names=p['names'];records=[]
def capture(line,values):
 records.append({'line':line,'vars':{name:copy.deepcopy(values.get(name)) for name in names},'current':copy.deepcopy(values.get('current')),'next_dp':copy.deepcopy(values.get('next_dp'))})
class Instrument(ast.NodeTransformer):
 def visit_Assign(self,node):
  self.generic_visit(node)
  probe=ast.Expr(value=ast.Call(func=ast.Name(id='capture',ctx=ast.Load()),args=[ast.Constant(value=node.lineno),ast.Call(func=ast.Name(id='locals',ctx=ast.Load()),args=[],keywords=[])],keywords=[]))
  return [node,ast.copy_location(probe,node)]
 def visit_AugAssign(self,node):
  return self.visit_Assign(node)
tree=ast.fix_missing_locations(Instrument().visit(ast.parse(p['code'])))
ns={'capture':capture};exec(compile(tree,'<independent-1463>','exec'),ns)
results=[]
for grid in p['cases']:
 records=[];ns['Solution']().cherryPickup(grid);results.append(records)
print(json.dumps(results))`;
 const result=spawnSync(process.env.PYTHON||'python3',['-c',script],{encoding:'utf8',maxBuffer:8*1024*1024,input:JSON.stringify({code:p.code.join('\n'),cases,names})});assert.equal(result.status,0,result.stderr);
 const expected=JSON.parse(result.stdout),assignments=new Set([5,7,10,13,15,17,20,21,22]);
 cases.forEach((grid,i)=>{
  const actual=p.builder(encode(grid)).steps.filter(s=>assignments.has(s.cherryPickup1463View.source.line)).map(s=>({line:s.cherryPickup1463View.source.line,vars:Object.fromEntries(s.vars.map(variable=>[variable.name,variable.value==='—'?null:variable.value])),current:s.cherryPickup1463View.matrix?.cells??null,next_dp:s.cherryPickup1463View.nextMatrix?.cells??null}));
  assert.deepEqual(actual,expected[i]);
 });
});
test('debug snapshots stay immutable in both languages and returning to Prev restores the exact state',()=>{
 const context={escapeHtml:String};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-cherry-pickup-1463.js'),'utf8'),context);const Klass=vm.runInContext('CherryPickup1463Visualizer',context);
 function freeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);Object.values(x).forEach(freeze);}return x;}
 for(const grid of inputs.slice(0,4)){
  const run=freeze(p.builder(encode(grid))),before=JSON.stringify(run);
  for(const language of['vi','en']){
   const host={innerHTML:'',dataset:{}},renderer=new Klass({host,language});
   for(const step of run.steps){renderer.render(step);assert.match(host.innerHTML,/data-debug="line-by-line"/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);}
   renderer.render(run.steps[0]);const first=host.innerHTML;renderer.render(run.steps.at(-1));renderer.render(run.steps[0]);assert.equal(host.innerHTML,first);
  }
  assert.equal(JSON.stringify(run),before);
 }
});
test('debug has an explicit size limit and overview retains the full original problem range',()=>{
 assert.equal(p.extraParams.find(param=>param.key==='traceMode').default,1);
 assert.throws(()=>p.builder(encode(Array.from({length:6},()=>Array(2).fill(1)))),/5×5/);
 assert.throws(()=>p.builder(encode(sample),{traceMode:3}),/1463/);
 const large=encode(Array.from({length:70},()=>Array(70).fill(100))),run=p.builder(large,{traceMode:2});assert.equal(run.answer,14000);assert.ok(run.steps.length<300);
 assert.equal(p.liveArgs(large)[0].length,70);
});
