const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const {test}=require('node:test');
const problem=require('../problems').SUPPORTED[784];
const examples=['a1b2','3z4','12345','a','Z','aA','ABcd','a123456789Z0','012345678901'];

test('784 every line and bound local matches recursive CPython after execution',()=>{
 const python=`import sys,json
data=json.load(sys.stdin)
ns={}
exec(data['code'],ns)
names={'s','path','result','i','ch','choice'}
def clean(value):
    if isinstance(value,list): return [clean(v) for v in value]
    return value
results=[]
for s in data['inputs']:
    rows=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_name not in ('letterCasePermutation','backtrack'): return None
        def snapshot(line):
            rows.append({'line':line,'scope':frame.f_code.co_name,'locals':{key:clean(value) for key,value in frame.f_locals.items() if key in names}})
        if event=='line':
            if frame in pending: snapshot(pending[frame])
            pending[frame]=frame.f_lineno
        elif event=='return':
            snapshot(pending.pop(frame))
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().letterCasePermutation(s)
    sys.settrace(None)
    results.append({'answer':answer,'rows':rows})
print(json.dumps(results))`;
 const output=spawnSync(process.env.PYTHON||'python3',['-c',python],{input:JSON.stringify({code:problem.code.join('\n'),inputs:examples}),encoding:'utf8',maxBuffer:32*1024*1024});
 assert.equal(output.status,0,output.stderr);
 const expected=JSON.parse(output.stdout);
 examples.forEach((s,index)=>{
  const run=problem.builder(s),reference=expected[index];
  assert.deepEqual(run.answer,reference.answer,s);assert.equal(run.steps.length,reference.rows.length,`frames ${s}`);
  run.steps.forEach((step,i)=>{
   const row=reference.rows[i],v=step.letterCase784View;
   assert.deepEqual(step.codeLines,[row.line],`${s} frame ${i}`);
   assert.equal(v.source.scope,row.scope);assert.equal(v.source.timing,'after');
   assert.deepEqual(v.locals,row.locals,`${s} frame ${i} line ${row.line}`);
  });
 });
});

function independent(s){
 const positions=[...s].map((ch,i)=>/[A-Za-z]/.test(ch)?i:-1).filter(i=>i>=0);
 return Array.from({length:2**positions.length},(_,mask)=>{
  const chars=[...s];positions.forEach((position,bit)=>{chars[position]=mask&(1<<bit)?s[position].toUpperCase():s[position].toLowerCase();});return chars.join('');
 }).sort();
}
test('784 all outputs match independent bitmasks, including repeated letters and unchanged digits',()=>{
 let seed=784;
 const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
 const samples=[...examples];
 for(let i=0;i<35;i++)samples.push(Array.from({length:1+Math.floor(random()*8)},()=> 'aB0Z19'[Math.floor(random()*6)]).join(''));
 for(const s of samples){
  const run=problem.builder(s),last=run.steps.at(-1).letterCase784View;
  assert.deepEqual([...run.answer].sort(),independent(s),s);
  assert.equal(new Set(run.answer).size,run.answer.length);assert.equal(run.answer.length,last.total);
  assert.deepEqual(last.path,[]);assert.deepEqual(last.result,run.answer);
  for(const step of run.steps){const v=step.letterCase784View;if(v.change?.kind==='append')assert.equal(v.path.at(-1),v.change.value);if(v.change?.kind==='save')assert.equal(v.result.at(-1),v.path.join(''));}
 }
 assert.equal(problem.debugMode,'line-by-line');
});

test('784 large inputs keep every answer and disclose skipped debug snapshots',()=>{
 const run=problem.builder('abcdefghijkl'),last=run.steps.at(-1);
 assert.equal(run.answer.length,4096);assert.deepEqual([...run.answer].sort(),independent('abcdefghijkl'));
 assert.equal(run.steps.length,4001);assert.equal(last.final,true);assert.ok(last.letterCase784View.omitted>0);
 assert.deepEqual(last.letterCase784View.path,[]);
});

test('784 pictures show one digit branch or two letter branches and preserve snapshots',()=>{
 const host={innerHTML:'',clientWidth:240,dataset:{}},context={lang:'vi',$:()=>host};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-letter-case-784.js'),'utf8'),context);
 for(const s of examples){
  const run=problem.builder(s),before=JSON.stringify(run);
  for(const language of ['vi','en'])for(const step of run.steps){
   context.lang=language;context.renderLetterCase784Pictures(step);const v=step.letterCase784View;
   assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);
   assert.equal((host.innerHTML.match(/data-slot=/g)||[]).length,s.length);
   assert.equal((host.innerHTML.match(/data-choice=/g)||[]).length,v.ch===null?0:/[0-9]/.test(v.ch)?1:2);
   const pages=Math.max(1,Math.ceil(v.result.length/12));
   assert.equal((host.innerHTML.match(/data-result-index=/g)||[]).length,v.result.length-(pages-1)*12);
  }
  assert.equal(JSON.stringify(run),before);
 }
 const last=problem.builder('abcd').steps.at(-1);
 context.renderLetterCase784Pictures(last);assert.match(host.innerHTML,/data-result-index="12"/);
 host.dataset.lc784Page='0';context.renderLetterCase784Pictures(last);assert.match(host.innerHTML,/data-result-index="0"/);assert.doesNotMatch(host.innerHTML,/data-result-index="12"/);
});

test('784 input validation and live Python arguments match the visualization',()=>{
 for(const input of ['', 'hello!', 'a b', 'é', 'abcdefghijkl3'])assert.throws(()=>problem.builder(input),/784:/);
 assert.deepEqual(problem.liveArgs('a1B2'),['a1B2']);
 assert.deepEqual(problem.builder('a1b2').answer,['a1b2','a1B2','A1b2','A1B2']);
 assert.deepEqual(problem.builder('12345').answer,['12345']);
});
