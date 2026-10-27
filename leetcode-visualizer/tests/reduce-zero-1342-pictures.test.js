const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const {test}=require('node:test');
const problem=require('../problems').SUPPORTED[1342];
const examples=[0,1,2,3,8,14,123,524288,999999,1000000];

test('1342 every executed line and local matches CPython, including zero',()=>{
 const python=`import sys,json
data=json.load(sys.stdin)
ns={}
exec(data['code'],ns)
results=[]
for num in data['inputs']:
    rows=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_name!='numberOfSteps': return None
        def snapshot(line):
            rows.append({'line':line,'locals':{key:value for key,value in frame.f_locals.items() if key in ('num','steps')}})
        if event=='line':
            if frame in pending: snapshot(pending[frame])
            pending[frame]=frame.f_lineno
        elif event=='return':
            snapshot(pending.pop(frame))
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().numberOfSteps(num)
    sys.settrace(None)
    results.append({'answer':answer,'rows':rows})
print(json.dumps(results))`;
 const output=spawnSync(process.env.PYTHON||'python3',['-c',python],{input:JSON.stringify({code:problem.code.join('\n'),inputs:examples}),encoding:'utf8'});
 assert.equal(output.status,0,output.stderr);const expected=JSON.parse(output.stdout);
 examples.forEach((num,index)=>{
  const run=problem.builder([num]),reference=expected[index];assert.equal(run.answer,reference.answer);assert.equal(run.steps.length,reference.rows.length);
  run.steps.forEach((step,i)=>{
   const row=reference.rows[i],v=step.reduceZero1342View;
   assert.deepEqual(step.codeLines,[row.line],`num ${num} frame ${i}`);assert.deepEqual(v.locals,row.locals,`num ${num} frame ${i} line ${row.line}`);
   assert.equal(v.source.timing,'after');assert.equal(v.num,row.locals.num);assert.equal(v.count,row.locals.steps);
  });
 });
});

test('1342 matches an independent popcount formula and reaches zero without an extra operation',()=>{
 const samples=[...examples,...Array.from({length:2001},(_,i)=>i)];
 let seed=1342;for(let i=0;i<100;i++){seed=Math.imul(seed,1664525)+1013904223>>>0;samples.push(seed%1000001);}
 for(const num of samples){
  const bits=num.toString(2),expected=num===0?0:bits.length-1+[...bits].filter(bit=>bit==='1').length;
  const run=problem.builder([num]),last=run.steps.at(-1).reduceZero1342View;
  assert.equal(run.answer,expected,num);assert.equal(last.num,0);assert.equal(last.count,expected);assert.equal(last.history.length,expected);
 }
 assert.equal(problem.builder([14]).answer,6);assert.equal(problem.builder([8]).answer,4);assert.equal(problem.builder([123]).answer,12);
 assert.equal(problem.builder([0]).steps.length,3);assert.equal(problem.debugMode,'line-by-line');
});

test('1342 changes num before increasing steps and keeps a consistent operation history',()=>{
 for(const num of examples){
  const run=problem.builder([num]);
  for(const [index,step] of run.steps.entries()){
   const v=step.reduceZero1342View,pending=['subtract','halve'].includes(v.action);
   assert.equal(v.history.length,v.count+(pending?1:0));
   if(pending){const previous=run.steps[index-1].reduceZero1342View;assert.equal(v.count,previous.count);assert.equal(v.num,v.action==='halve'?previous.num/2:previous.num-1);}
   if(v.action==='count'){const previous=run.steps[index-1].reduceZero1342View;assert.equal(v.num,previous.num);assert.equal(v.count,previous.count+1);}
   if(v.action==='parity')assert.equal(v.condition.value,v.num%2);
   v.history.forEach((operation,i)=>{assert.equal(operation.id,i+1);assert.equal(operation.before,i?v.history[i-1].after:num);assert.equal(operation.after,operation.kind==='halve'?operation.before/2:operation.before-1);});
  }
 }
});

test('1342 binary arrows, exact dot quantities and pending counter pictures preserve snapshots',()=>{
 const host={innerHTML:'',clientWidth:240},context={lang:'vi',$:()=>host};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-reduce-zero-1342.js'),'utf8'),context);
 for(const num of examples){
  const run=problem.builder([num]),before=JSON.stringify(run);
  for(const language of ['vi','en'])for(const step of run.steps){
   context.lang=language;context.renderReduceZero1342Pictures(step);const v=step.reduceZero1342View;
   const operation=['subtract','halve','count'].includes(v.action)?v.history.at(-1):null,width=v.num===0&&!operation?1:v.width;
   assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);
   assert.equal((host.innerHTML.match(/data-bit-row="before"/g)||[]).length,width);
   assert.equal((host.innerHTML.match(/data-bit-row="after"/g)||[]).length,operation?width:0);
   assert.equal((host.innerHTML.match(/data-operation=/g)||[]).length,v.history.length);
   assert.equal((host.innerHTML.match(/data-counted="true"/g)||[]).length,v.count);
   if(operation&&operation.before<=24){
    const beforeDots=host.innerHTML.match(/r1342-before-dots">([\s\S]*?)<\/div>/)[1],afterDots=host.innerHTML.match(/r1342-after-dots">([\s\S]*?)<\/div>/)[1];
    assert.equal((beforeDots.match(/<i/g)||[]).length,operation.before);assert.equal((afterDots.match(/<i/g)||[]).length,operation.after);
   }
  }
  assert.equal(JSON.stringify(run),before);
 }
});

test('1342 validates the official numeric range and passes a scalar to live Python',()=>{
 for(const input of [[-1],[1000001],[1.5],[NaN],[],[1,2],'',null])assert.throws(()=>problem.builder(input),/1342:/);
 assert.deepEqual(problem.liveArgs([14]),[14]);assert.deepEqual(problem.liveArgs('0'),[0]);
});
