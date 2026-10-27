const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const {test}=require('node:test');
const problem=require('../problems').SUPPORTED[980];
const examples=[problem.defaultInput,'1,0,0,0|0,0,0,0|0,0,0,2','0,1|2,0','1,2','1,2,0','1,-1,2','0,1,0|0,0,2'];

test('980 every executed line and bound local matches recursive CPython',()=>{
 const python=`import sys,json
data=json.load(sys.stdin)
ns={}
exec(data['code'],ns)
names={'grid','rows','cols','start','total','visited','path','answer','r','c','remain','dr','dc'}
def clean(value):
    if isinstance(value,set): return [clean(v) for v in sorted(value)]
    if isinstance(value,(list,tuple)): return [clean(v) for v in value]
    return value
results=[]
for grid in data['inputs']:
    rows=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_name not in ('uniquePathsIII','dfs'): return None
        def snapshot(line):
            rows.append({'line':line,'scope':frame.f_code.co_name,'locals':{key:clean(value) for key,value in frame.f_locals.items() if key in names}})
        if event=='line':
            if frame in pending: snapshot(pending[frame])
            pending[frame]=frame.f_lineno
        elif event=='return':
            snapshot(pending.pop(frame))
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().uniquePathsIII(grid)
    sys.settrace(None)
    results.append({'answer':answer,'rows':rows})
print(json.dumps(results))`;
 const output=spawnSync(process.env.PYTHON||'python3',['-c',python],{input:JSON.stringify({code:problem.code.join('\n'),inputs:examples.map(input=>problem.liveArgs(input)[0])}),encoding:'utf8',maxBuffer:64*1024*1024});
 assert.equal(output.status,0,output.stderr);
 const expected=JSON.parse(output.stdout);
 examples.forEach((input,index)=>{
  const run=problem.builder(input),reference=expected[index];
  assert.equal(run.answer,reference.answer);assert.equal(run.steps.length,reference.rows.length,`frames ${input}`);
  run.steps.forEach((step,i)=>{
   const row=reference.rows[i],v=step.uniquePaths980View;
   assert.deepEqual(step.codeLines,[row.line],`${input} frame ${i}`);
   assert.equal(v.source.scope,row.scope);assert.equal(v.source.timing,'after');
   assert.deepEqual(v.locals,row.locals,`${input} frame ${i} line ${row.line}`);
  });
 });
});

// Independent bitmask DP counts only full-coverage walks ending at E.
function reference(grid){
 const cells=grid.flatMap((row,r)=>row.map((value,c)=>value===-1?null:{r,c,value})).filter(Boolean);
 const start=cells.findIndex(cell=>cell.value===1),end=cells.findIndex(cell=>cell.value===2),full=(1<<cells.length)-1,memo=new Map();
 const edges=cells.map(cell=>cells.map((other,i)=>Math.abs(cell.r-other.r)+Math.abs(cell.c-other.c)===1?i:-1).filter(i=>i>=0));
 function visit(index,mask){
  if(index===end)return mask===full?1:0;
  const key=mask*cells.length+index;if(memo.has(key))return memo.get(key);
  let count=0;for(const next of edges[index])if(!(mask&(1<<next)))count+=visit(next,mask|(1<<next));
  memo.set(key,count);return count;
 }
 return visit(start,1<<start);
}
test('980 matches independent DP on official examples and randomized obstacle grids',()=>{
 const expected=[2,4,0,1,0,0];expected.forEach((answer,i)=>assert.equal(problem.builder(examples[i]).answer,answer));
 let seed=980;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
 for(let i=0;i<50;i++){
  const rows=2+Math.floor(random()*2),cols=2+Math.floor(random()*2),grid=Array.from({length:rows},()=>Array.from({length:cols},()=>random()<.25?-1:0));
  let start=Math.floor(random()*rows*cols),end=Math.floor(random()*rows*cols);if(start===end)end=(end+1)%(rows*cols);
  grid[Math.floor(start/cols)][start%cols]=1;grid[Math.floor(end/cols)][end%cols]=2;
  const input=grid.map(row=>row.join(',')).join('|');assert.equal(problem.builder(input).answer,reference(grid),input);
 }
});

test('980 separates visited marks from the path and rejects an early arrival at E',()=>{
 const run=problem.builder(problem.defaultInput);
 assert.ok(run.steps.some(step=>step.uniquePaths980View.reason==='early'));
 assert.ok(run.steps.some(step=>step.uniquePaths980View.reason==='visited'));
 assert.ok(run.steps.some(step=>step.uniquePaths980View.reason==='wall'));
 for(const step of run.steps){
  const v=step.uniquePaths980View,key=v.current?.join(',');
  if(v.action==='visit')assert.ok(v.visited.some(cell=>cell.join(',')===key));
  if(v.action==='append')assert.deepEqual(v.path.at(-1),v.current);
  if(v.action==='pop'){assert.ok(!v.path.some(cell=>cell.join(',')===key));assert.ok(v.visited.some(cell=>cell.join(',')===key));}
  if(v.action==='unvisit')assert.ok(!v.visited.some(cell=>cell.join(',')===key));
  if(v.action==='save')assert.equal(v.remain,0);
  if(v.reason==='early')assert.ok(v.remain>0);
 }
 for(const input of examples){
  const run=problem.builder(input),last=run.steps.at(-1).uniquePaths980View;
  assert.deepEqual(last.visited,[]);assert.deepEqual(last.path,[]);assert.equal(last.solutions.length,run.answer);
  for(const path of last.solutions){
   assert.equal(path.length,last.total);assert.equal(new Set(path.map(cell=>cell.join(','))).size,last.total);
   assert.equal(last.grid[path[0][0]][path[0][1]],1);assert.equal(last.grid[path.at(-1)[0]][path.at(-1)[1]],2);
   path.slice(1).forEach((cell,i)=>assert.equal(Math.abs(cell[0]-path[i][0])+Math.abs(cell[1]-path[i][1]),1));
  }
 }
});

test('980 capped snapshots preserve the full count and all saved paths',()=>{
 const input='1,0,0,0,0|0,0,0,0,0|0,0,0,0,0|0,0,0,0,2',run=problem.builder(input),last=run.steps.at(-1).uniquePaths980View;
 assert.equal(run.answer,reference(last.grid));assert.ok(last.omitted>0);assert.equal(run.steps.length,8001);
 assert.equal(last.solutions.length,run.answer);assert.deepEqual(last.visited,[]);assert.deepEqual(last.path,[]);
});

test('980 pictures expose exact visit flags, cell counts and saved proofs without mutating steps',()=>{
 const host={innerHTML:'',clientWidth:240,dataset:{}},context={lang:'vi',$:()=>host};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-unique-paths-980.js'),'utf8'),context);
 for(const input of [problem.defaultInput,'1,2,0','1,-1,2']){
  const run=problem.builder(input),before=JSON.stringify(run);
  for(const language of ['vi','en'])for(const step of run.steps){
   context.lang=language;context.renderUniquePaths980Pictures(step);const v=step.uniquePaths980View;
   assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);
   assert.equal((host.innerHTML.match(/data-cell=/g)||[]).length,v.rows*v.cols);
   assert.equal((host.innerHTML.match(/data-visited="true"/g)||[]).length,v.visited.length);
  }
  assert.equal(JSON.stringify(run),before);
 }
 const last=problem.builder(problem.defaultInput).steps.at(-1);context.renderUniquePaths980Pictures(last);
 assert.match(host.innerHTML,/Saved path #1/);
 host.dataset.u980Path='1';context.renderUniquePaths980Pictures(last);assert.match(host.innerHTML,/Saved path #2/);
 assert.equal(problem.debugMode,'line-by-line');
});

test('980 validates rectangular grids, legal values, start/end and the 20-cell constraint',()=>{
 for(const input of ['', '1,2|0','1,2,','1,2,a','1,2,3','1,1,2','0,0','1,0','2,-1','1,2|','1,2,'+Array(19).fill(0).join(',')])assert.throws(()=>problem.builder(input),/980:/);
 assert.deepEqual(problem.liveArgs('1,0;0,2'),[[[1,0],[0,2]]]);
 const long='1,'+Array(18).fill(0).join(',')+',2';assert.equal(problem.builder(long).answer,1);
 const tall=['1',...Array(18).fill('0'),'2'].join('|');assert.equal(problem.builder(tall).answer,1);
});
