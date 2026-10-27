const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const {test}=require('node:test');
const problem=require('../problems').SUPPORTED[77];
const cases=[];for(let n=1;n<=8;n++)for(let k=1;k<=n;k++)cases.push([n,k]);

test('77 every line and local matches CPython for all supported n and k',()=>{
 const python=`import sys,json
data=json.load(sys.stdin)
ns={}
exec(data['code'],ns)
names={'n','k','result','current','start','i','needed','remaining'}
def clean(value):
    if isinstance(value,list): return [clean(v) for v in value]
    return value
results=[]
for n,k in data['inputs']:
    rows=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_name not in ('combine','backtrack'): return None
        def snapshot(line):
            rows.append({'line':line,'scope':frame.f_code.co_name,'locals':{key:clean(value) for key,value in frame.f_locals.items() if key in names}})
        if event=='line':
            if frame in pending: snapshot(pending[frame])
            pending[frame]=frame.f_lineno
        elif event=='return':
            snapshot(pending.pop(frame))
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().combine(n,k)
    sys.settrace(None)
    results.append({'answer':answer,'rows':rows})
print(json.dumps(results))`;
 const output=spawnSync(process.env.PYTHON||'python3',['-c',python],{input:JSON.stringify({code:problem.code.join('\n'),inputs:cases}),encoding:'utf8',maxBuffer:32*1024*1024});
 assert.equal(output.status,0,output.stderr);
 const expected=JSON.parse(output.stdout);
 cases.forEach(([n,k],index)=>{
  const run=problem.builder([n],{k}),reference=expected[index];
  assert.deepEqual(run.answer,reference.answer,`answer ${n}/${k}`);
  assert.equal(run.steps.length,reference.rows.length,`frame count ${n}/${k}`);
  run.steps.forEach((step,i)=>{
   const row=reference.rows[i],view=step.combinations77View;
   assert.deepEqual(step.codeLines,[row.line],`line ${n}/${k} frame ${i}`);
   assert.equal(view.source.scope,row.scope);assert.equal(view.source.timing,'after');
   assert.deepEqual(view.locals,row.locals,`locals ${n}/${k} frame ${i} line ${row.line}`);
  });
 });
});

test('77 generates each valid combination exactly once, with accurate pick, copy and undo snapshots',()=>{
 for(const [n,k] of cases){
  const run=problem.builder([n],{k}),expected=[];
  for(let mask=0;mask<1<<n;mask++){
   const values=Array.from({length:n},(_,i)=>i+1).filter(value=>mask&(1<<(value-1)));
   if(values.length===k)expected.push(values.join(','));
  }
  assert.deepEqual(run.answer.map(values=>values.join(',')).sort(),expected.sort());
  assert.equal(new Set(run.answer.map(JSON.stringify)).size,run.answer.length);
  const last=run.steps.at(-1);assert.equal(last.final,true);assert.deepEqual(last.combinations77View.current,[]);
  assert.equal(last.combinations77View.total,expected.length);
  assert.ok(run.steps.length<2000);
  for(const step of run.steps){
   const v=step.combinations77View;
   assert.ok(v.current.length<=k);
   if(v.change?.kind==='append')assert.equal(v.current.at(-1),v.change.value);
   if(v.change?.kind==='pop')assert.ok(!v.current.includes(v.change.value));
   if(v.change?.kind==='save')assert.deepEqual(v.result.at(-1),v.current);
   if(v.action==='prune')assert.ok(v.remaining<v.needed);
  }
 }
 assert.deepEqual(problem.builder([4],{k:2}).answer,[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]);
 assert.equal(problem.debugMode,'line-by-line');
});

test('77 pictures show k slots, the actual branch and immutable result copies in both languages',()=>{
 const host={innerHTML:'',clientWidth:240},context={lang:'vi',$:()=>host};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-combinations-77.js'),'utf8'),context);
 for(const [n,k] of [[1,1],[4,2],[4,4],[8,4],[8,8]]){
  const run=problem.builder([n],{k}),before=JSON.stringify(run);
  for(const language of ['vi','en'])for(const step of run.steps){
   context.lang=language;context.renderCombinations77Pictures(step);
   const v=step.combinations77View;
   assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);
   assert.equal((host.innerHTML.match(/data-number=/g)||[]).length,n);
   assert.equal((host.innerHTML.match(/data-slot=/g)||[]).length,k);
   assert.equal((host.innerHTML.match(/data-frame=/g)||[]).length,v.stack.length);
   assert.equal((host.innerHTML.match(/data-result-index=/g)||[]).length,v.result.length);
  }
  assert.equal(JSON.stringify(run),before);
 }
});

test('77 validates visualization limits and passes scalar arguments to live Python',()=>{
 for(const n of [0,9,-1,1.5,NaN])assert.throws(()=>problem.builder([n],{k:1}),/77:/);
 for(const k of [0,-1,5,1.5,NaN])assert.throws(()=>problem.builder([4],{k}),/77:/);
 assert.deepEqual(problem.liveArgs([4],{k:'2'}),[4,2]);
 assert.deepEqual(problem.builder([4]).answer,problem.builder([4],{k:2}).answer);
});
