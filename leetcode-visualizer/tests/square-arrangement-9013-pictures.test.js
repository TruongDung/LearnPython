const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const {test}=require('node:test');
const problem=require('../problems').SUPPORTED[9013];

test('9013 every executed line and non-callable local matches recursive CPython',()=>{
 const inputs=[1,2,7,14,15,16];
 const python=`import sys,json
data=json.load(sys.stdin)
ns={}
exec(data['code'],ns)
names={'n','values','graph','path','used','starts','start','found','value','candidates','nxt','child_ok','a','b'}
def clean(value):
    if isinstance(value,set): return sorted(value)
    if isinstance(value,list): return [clean(v) for v in value]
    if isinstance(value,dict): return {str(k):clean(v) for k,v in value.items()}
    return value
results=[]
for n in data['inputs']:
    rows=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_name not in ('arrange','dfs'): return None
        def snapshot(line):
            rows.append({'line':line,'scope':frame.f_code.co_name,'locals':{k:clean(v) for k,v in frame.f_locals.items() if k in names}})
        if event == 'line':
            if frame in pending: snapshot(pending[frame])
            pending[frame]=frame.f_lineno
        elif event == 'return':
            snapshot(pending.pop(frame))
        return trace
    sys.settrace(trace)
    answer=ns['arrange'](n)
    sys.settrace(None)
    results.append({'answer':answer,'rows':rows})
print(json.dumps(results))`;
 const result=spawnSync(process.env.PYTHON||'python3',['-c',python],{input:JSON.stringify({code:problem.code.join('\n'),inputs}),encoding:'utf8',maxBuffer:32*1024*1024});
 assert.equal(result.status,0,result.stderr);
 const expected=JSON.parse(result.stdout);
 inputs.forEach((n,index)=>{
  const run=problem.builder([n]);
  assert.deepEqual(run.answer,expected[index].answer,`answer n=${n}`);
  assert.equal(run.steps.length,expected[index].rows.length,`frame count n=${n}`);
  run.steps.forEach((step,k)=>{
   const view=step.square9013View,reference=expected[index].rows[k];
   assert.deepEqual(step.codeLines,[reference.line],`step ${k}, n=${n}`);
   assert.equal(view.source.scope,reference.scope,`scope step ${k}, n=${n}`);
   assert.deepEqual(view.locals,reference.locals,`locals after ${reference.scope}:${reference.line}, step ${k}, n=${n}`);
  });
 });
});

test('9013 complete traces cover every supported n, with unique values and square-sum edges',()=>{
 for(let n=1;n<=16;n++){
  const run=problem.builder([n]);
  assert.ok(run.steps.length<3000);
  assert.equal(run.steps.at(-1).final,true);
  assert.equal(run.steps.at(-1).square9013View.omitted,0);
  assert.equal(run.answer.length>0,[1,15,16].includes(n));
  if(run.answer.length){
   assert.equal(new Set(run.answer).size,n);assert.equal(run.answer.length,n);
   run.answer.slice(1).forEach((value,i)=>assert.ok(Number.isInteger(Math.sqrt(value+run.answer[i]))));
  }
 }
 assert.equal(problem.debugMode,'line-by-line');
});

test('9013 square pictures partition the sum into the two number colors and preserve the trace',()=>{
 const host={innerHTML:'',clientWidth:250},context={lang:'vi',$:()=>host};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-square-arrangement-9013.js'),'utf8'),context);
 for(const n of [1,2,7,15,16]){
  const run=problem.builder([n]),before=JSON.stringify(run);
  for(const language of ['vi','en'])for(const step of run.steps){
   context.lang=language;context.renderSquareArrangement9013View(step);
   assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);
   assert.equal((host.innerHTML.match(/class="sq9013-chain-node /g)||[]).length,step.square9013View.path.length);
   const model=context.square9013PictureModel(step);
   if(model.pair){
    assert.equal((host.innerHTML.match(/<i class="one"/g)||[]).length,model.pair[0]);
    assert.equal((host.innerHTML.match(/<i class="two"/g)||[]).length,model.pair[1]);
    assert.equal(model.isSquare,Number.isInteger(Math.sqrt(model.pair[0]+model.pair[1])));
    assert.equal((host.innerHTML.match(/<i class="empty"/g)||[]).length,model.root**2-model.pair[0]-model.pair[1]);
   }
  }
  assert.equal(JSON.stringify(run),before);
 }
});
