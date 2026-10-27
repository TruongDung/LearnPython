const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const {test}=require('node:test');
const problem=require('../problems').SUPPORTED[1240];
const examples=[[1,1],[1,4],[4,1],[2,3],[3,2],[3,5],[4,4],[5,8]];

test('1240 every executed line and bound local matches recursive CPython',()=>{
 const python=`import sys,json
data=json.load(sys.stdin)
ns={}
exec(data['code'],ns)
names={'n','m','heights','placed','best','best_layout','count','low','col','run','limit','size','j'}
def clean(value):
    if isinstance(value,(list,tuple)): return [clean(v) for v in value]
    return value
results=[]
for n,m in data['inputs']:
    rows=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_name not in ('tilingRectangle','dfs'): return None
        def snapshot(line):
            rows.append({'line':line,'scope':frame.f_code.co_name,'locals':{key:clean(value) for key,value in frame.f_locals.items() if key in names}})
        if event=='line':
            if frame in pending: snapshot(pending[frame])
            pending[frame]=frame.f_lineno
        elif event=='return':
            snapshot(pending.pop(frame))
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().tilingRectangle(n,m)
    sys.settrace(None)
    results.append({'answer':answer,'rows':rows})
print(json.dumps(results))`;
 const output=spawnSync(process.env.PYTHON||'python3',['-c',python],{input:JSON.stringify({code:problem.code.join('\n'),inputs:examples}),encoding:'utf8',maxBuffer:64*1024*1024});
 assert.equal(output.status,0,output.stderr);
 const expected=JSON.parse(output.stdout);
 examples.forEach(([n,m],index)=>{
  const run=problem.builder([n],{m}),reference=expected[index];
  assert.equal(run.answer,reference.answer);assert.equal(run.steps.length,reference.rows.length,`frames ${n}x${m}`);
  run.steps.forEach((step,i)=>{
   const row=reference.rows[i],v=step.tiling1240View;
   assert.deepEqual(step.codeLines,[row.line],`${n}x${m} frame ${i}`);
   assert.equal(v.source.scope,row.scope);assert.equal(v.source.timing,'after');
   assert.deepEqual(v.locals,row.locals,`${n}x${m} frame ${i} line ${row.line}`);
  });
 });
});

function exactCover(n,m){
 const full=(1<<(n*m))-1,memo=new Map();
 function solve(mask){
  if(mask===full)return 0;if(memo.has(mask))return memo.get(mask);
  let index=0;while(mask&(1<<index))index++;
  const row=Math.floor(index/m),col=index%m;let best=n*m;
  for(let size=1;size<=Math.min(n-row,m-col);size++){
   let bits=0;for(let r=row;r<row+size;r++)for(let c=col;c<col+size;c++)bits|=1<<(r*m+c);
   if(mask&bits)break;best=Math.min(best,1+solve(mask|bits));
  }
  memo.set(mask,best);return best;
 }
 return solve(0);
}
function validateLayout(n,m,layout){
 const cells=Array.from({length:n},()=>Array(m).fill(0));
 for(const [row,col,size] of layout){
  assert.ok(size>0&&row>=0&&col>=0&&row+size<=n&&col+size<=m);
  for(let r=row;r<row+size;r++)for(let c=col;c<col+size;c++)cells[r][c]++;
 }
 assert.ok(cells.flat().every(count=>count===1));
}
test('1240 agrees with independent exact-cover DP on small rectangles',()=>{
 for(let n=1;n<=4;n++)for(let m=1;m<=5;m++)assert.equal(problem.builder([n],{m}).answer,exactCover(n,m),`${n}x${m}`);
 assert.equal(problem.builder([2],{m:3}).answer,3);
 assert.equal(problem.builder([5],{m:8}).answer,5);
});

test('1240 every supported rectangle has a complete tiling proof, with an empty restored search state',()=>{
 const answers=new Map();
 for(let n=1;n<=8;n++)for(let m=1;m<=8;m++){
  const run=problem.builder([n],{m}),last=run.steps.at(-1),v=last.tiling1240View;
  assert.equal(last.final,true);assert.equal(v.bestLayout.length,run.answer);validateLayout(n,m,v.bestLayout);
  assert.deepEqual(v.heights,Array(m).fill(0));assert.deepEqual(v.placed,[]);
  answers.set(`${n},${m}`,run.answer);
 }
 for(let n=1;n<=8;n++)for(let m=1;m<=8;m++)assert.equal(answers.get(`${n},${m}`),answers.get(`${m},${n}`));
 const capped=problem.builder([7],{m:8}),last=capped.steps.at(-1).tiling1240View;
 assert.equal(capped.steps.length,8001);assert.ok(last.omitted>0);assert.equal(capped.answer,7);
 assert.equal(problem.debugMode,'line-by-line');
});

test('1240 per-column changes match heights and prune only when count cannot improve best',()=>{
 const run=problem.builder([3],{m:5});
 assert.ok(run.steps.some(step=>step.tiling1240View.action==='reject'));
 assert.ok(run.steps.some(step=>step.tiling1240View.action==='undo'));
 for(const step of run.steps){
  const v=step.tiling1240View;
  if(v.change?.kind==='height')assert.equal(v.heights[v.change.col],v.change.to);
  if(v.action==='reject')assert.ok(v.count>=v.best);
  if(v.action==='save'){assert.equal(v.bestLayout.length,v.best);validateLayout(v.n,v.m,v.bestLayout);}
  assert.ok(v.heights.every(height=>height>=0&&height<=v.n));
 }
});

test('1240 pictures preserve partial column updates, dimensions and source snapshots in both languages',()=>{
 const host={innerHTML:'',clientWidth:240},context={lang:'vi',$:()=>host};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-tiling-1240.js'),'utf8'),context);
 for(const [n,m] of [[1,1],[2,3],[3,2],[3,5],[8,1]]){
  const run=problem.builder([n],{m}),before=JSON.stringify(run);
  for(const language of ['vi','en'])for(const step of run.steps){
   context.lang=language;context.renderTiling1240Pictures(step);const v=step.tiling1240View;
   assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);
   assert.equal((host.innerHTML.match(/data-square=/g)||[]).length,step.final?v.bestLayout.length:v.placed.length);
   assert.equal((host.innerHTML.match(/data-height-col=/g)||[]).length,step.final?0:m);
   if(!step.final)v.heights.forEach((height,c)=>assert.ok(host.innerHTML.includes(`data-height-col="${c}" data-height="${height}"`)));
  }
  assert.equal(JSON.stringify(run),before);
 }
 const partial=problem.builder([2],{m:3}).steps.find(step=>step.tiling1240View.action==='fill'&&step.tiling1240View.locals.size===2);
 context.renderTiling1240Pictures(partial);assert.match(host.innerHTML,/data-full="false"/);
});

test('1240 validates the 1–8 visualization bounds and preserves input orientation for live Python',()=>{
 for(const side of [0,9,-1,1.5,NaN]){assert.throws(()=>problem.builder([side],{m:2}),/1240:/);assert.throws(()=>problem.builder([2],{m:side}),/1240:/);}
 assert.deepEqual(problem.liveArgs([3],{m:'2'}),[3,2]);
 assert.equal(problem.builder([2]).answer,3);
});
