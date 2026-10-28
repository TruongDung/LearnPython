const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const {test}=require('node:test');
const problem=require('../problems').SUPPORTED[2360];
const examples=[[3,3,4,2,3],[2,-1,3,1],[1,2,0],[0],[-1],[2,2,3,-1],[1,0,3,4,2],[1,2,3,-1],Array(12).fill(-1),Array.from({length:12},(_,i)=>i)];

test('2360 every executed line and bound local matches CPython, including skipped starts',()=>{
 const python=`import sys,json
from typing import List
data=json.load(sys.stdin)
ns={'List':List}
exec(data['code'],ns)
names={'edges','visited','longest','start','position','node'}
def clean(value):
    if isinstance(value,list): return [clean(v) for v in value]
    if isinstance(value,dict): return {str(k):clean(v) for k,v in value.items()}
    return value
results=[]
for edges in data['inputs']:
    rows=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_name!='longestCycle': return None
        def snapshot(line):
            rows.append({'line':line,'locals':{key:clean(value) for key,value in frame.f_locals.items() if key in names}})
        if event=='line':
            if frame in pending: snapshot(pending[frame])
            pending[frame]=frame.f_lineno
        elif event=='return':
            snapshot(pending.pop(frame))
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().longestCycle(edges)
    sys.settrace(None)
    results.append({'answer':answer,'rows':rows})
print(json.dumps(results))`;
 const output=spawnSync(process.env.PYTHON||'python3',['-c',python],{input:JSON.stringify({code:problem.code.join('\n'),inputs:examples}),encoding:'utf8',maxBuffer:16*1024*1024});
 assert.equal(output.status,0,output.stderr);const expected=JSON.parse(output.stdout);
 examples.forEach((edges,index)=>{
  const run=problem.builder(JSON.stringify(edges)),reference=expected[index];assert.equal(run.answer,reference.answer);assert.equal(run.steps.length,reference.rows.length,`frames ${edges}`);
  run.steps.forEach((step,i)=>{
   const row=reference.rows[i],v=step.cycle2360View;
   assert.deepEqual(step.codeLines,[row.line],`${edges} frame ${i}`);assert.deepEqual(v.locals,row.locals,`${edges} frame ${i} line ${row.line}`);
   assert.equal(v.source.timing,'after');assert.deepEqual(v.visited,row.locals.visited);
  });
 });
});

function reference(edges){
 let best=-1;
 for(let start=0;start<edges.length;start++){
  const path=new Map();let node=start;
  while(node!==-1&&!path.has(node)){path.set(node,path.size);node=edges[node];}
  if(node!==-1)best=Math.max(best,path.size-path.get(node));
 }
 return best;
}
test('2360 agrees with independent walks on randomized graphs and records each node once',()=>{
 let seed=2360;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
 for(let i=0;i<220;i++){
  const n=1+Math.floor(random()*12),edges=Array.from({length:n},()=>Math.floor(random()*(n+1))-1),run=problem.builder(edges);
  assert.equal(run.answer,reference(edges),edges);
  assert.equal(run.steps.filter(step=>step.cycle2360View.event==='visit').length,n);
  assert.equal(run.steps.filter(step=>step.cycle2360View.event==='record').length,n);
  const last=run.steps.at(-1);assert.equal(last.final,true);assert.ok(last.cycle2360View.visited.every(Boolean));
  const cycle=last.cycle2360View.bestCycle;
  assert.equal(cycle.length,Math.max(0,run.answer));assert.equal(new Set(cycle).size,cycle.length);
  cycle.forEach((node,j)=>assert.equal(edges[node],cycle[(j+1)%cycle.length]));
 }
});

test('2360 marks visited before position and distinguishes old walks from a cycle suffix',()=>{
 const run=problem.builder(problem.defaultInput);
 for(const step of run.steps){
  const v=step.cycle2360View;
  if(v.event==='visit'){assert.equal(v.visited[v.current],true);assert.ok(!v.path.some(item=>item.node===v.current));}
  if(v.event==='record')assert.equal(v.path.at(-1).node,v.current);
  if(v.move)assert.equal(v.current,v.move.to);
 }
 const found=run.steps.find(step=>step.cycle2360View.event==='check-cycle').cycle2360View;
 assert.equal(found.longest,-1);assert.deepEqual(found.path.map(item=>item.node),[0,3,2,4]);assert.deepEqual(found.cycle,[3,2,4]);assert.equal(found.repeatAt,1);
 const saved=run.steps.find(step=>step.cycle2360View.event==='cycle').cycle2360View;assert.equal(saved.longest,3);
 const old=problem.builder('2,2,3,-1').steps.find(step=>step.cycle2360View.event==='stop'&&step.cycle2360View.reason==='old-walk').cycle2360View;
 assert.equal(old.current,2);assert.equal(old.visited[2],true);assert.deepEqual(old.path,[{node:1,depth:0}]);assert.deepEqual(old.cycle,[]);assert.equal(old.condition.result,false);
});

test('2360 pictures draw exactly the input arrows and current position values without changing snapshots',()=>{
 const host={innerHTML:'',clientWidth:240},context={lang:'vi',$:()=>host};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-longest-cycle-2360.js'),'utf8'),context);
 for(const edges of examples){
  const run=problem.builder(edges),before=JSON.stringify(run);
  for(const language of ['vi','en'])for(const step of run.steps){
   context.lang=language;context.renderLongestCycle2360Pictures(step);const v=step.cycle2360View;
   assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);
   assert.equal((host.innerHTML.match(/data-node=/g)||[]).length,edges.length);
   assert.equal((host.innerHTML.match(/data-edge=/g)||[]).length,edges.filter(node=>node!==-1).length);
   assert.equal((host.innerHTML.match(/data-visited-node=/g)||[]).length,edges.length);
   v.path.forEach(item=>assert.ok(host.innerHTML.includes(`data-position-node="${item.node}" data-value="${item.depth}"`)));
   if(!step.final)assert.equal((host.innerHTML.match(/data-path-node=/g)||[]).length,v.path.length);
   const model=context.cycle2360PictureLayout(edges,220);model.positions.forEach(p=>assert.ok([p.x,p.y,p.nx,p.ny].every(Number.isFinite)));
  }
  assert.equal(JSON.stringify(run),before);
 }
});

test('2360 validates node targets and gives live Python the same graph',()=>{
 for(const input of ['', '1,', '[1,null]', '[true]', '[-2]', '[1]', '[0.5]', 'a',Array(13).fill(-1)])assert.throws(()=>problem.builder(input),/2360:/);
 assert.deepEqual(problem.liveArgs('3,3,4,2,3'),[[3,3,4,2,3]]);assert.deepEqual(problem.liveArgs([-1]),[[-1]]);
});
