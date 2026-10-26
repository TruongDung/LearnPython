const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const {test}=require('node:test');
const problem=require('../problems').SUPPORTED[600];
function digitDP(n){
 const bits=[...n.toString(2)].map(Number),memo=new Map();
 function visit(i,prev,tight){
  if(i===bits.length)return 1;
  const key=[i,prev,tight].join(',');if(memo.has(key))return memo.get(key);
  let result=0;
  for(let digit=0;digit<=(tight?bits[i]:1);digit++)if(!(prev&&digit))result+=visit(i+1,digit,tight&&digit===bits[i]);
  memo.set(key,result);return result;
 }
 return visit(0,0,true);
}

test('600 matches exhaustive counts for 0..4096 and independent digit DP at large bounds',()=>{
 let expected=0;
 for(let n=0;n<=4096;n++){
  if(!n.toString(2).includes('11'))expected++;
  assert.equal(problem.builder([n]).answer,expected,`n=${n}`);
 }
 for(const n of [1e9,999999999,536870912,715827882,715827883,99999,123456789]){
  const run=problem.builder([n]);assert.equal(run.answer,digitDP(n));assert.ok(run.steps.length<8*n.toString(2).length+10);
 }
});

test('600 counted branches are disjoint, valid, below n, and retain accurate group totals',()=>{
 for(const n of [0,1,2,3,5,6,13,31,127,255,1e9]){
  const run=problem.builder([n]),view=run.steps.at(-1).nonConsecutive600View;
  assert.equal(view.groups.reduce((sum,g)=>sum+g.count,0)+(view.cutAt===null?1:0),run.answer);
  const seen=new Set();
  for(const group of view.groups){
   assert.ok(group.samples.length<=6);
   for(const word of group.samples){
    assert.ok(word.startsWith(group.prefix));assert.equal(word.length,view.bits.length);
    assert.equal(word.includes('11'),false);assert.ok(parseInt(word,2)<n);
    assert.equal(seen.has(word),false);seen.add(word);
   }
   if(n<=255){
    const count=Array.from({length:n+1},(_,x)=>x.toString(2).padStart(view.bits.length,'0')).filter(word=>word.startsWith(group.prefix)&&!word.includes('11')).length;
    assert.equal(group.count,count);
   }
  }
  if(view.cutAt!==null)assert.equal(view.bits.slice(view.cutAt-1,view.cutAt+1),'11');
 }
});

test('600 displayed Python returns the same results as the visualization',()=>{
 const source=problem.code.join('\n')+'\nimport json,sys\nfor item in json.load(sys.stdin):\n    assert Solution().findIntegers(item[0]) == item[1], item\n';
 const cases=[...Array.from({length:100},(_,n)=>[n,digitDP(n)]),[1e9,digitDP(1e9)]];
 const result=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify(cases),encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
});

test('600 validates bounds and renders bounded pictures without changing the trace',()=>{
 for(const input of [[],[1,2],[-1],[1.1],[1e9+1],['5'],null])assert.throws(()=>problem.builder(input),/#600/);
 const host={clientWidth:250,innerHTML:''},context={lang:'vi',$:()=>host};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-non-consecutive-600.js'),'utf8'),context);
 for(const n of [0,1,3,5,6,13,31,1000000000]){
  const run=problem.builder([n]),before=JSON.stringify(run);
  for(const language of ['vi','en'])for(const step of run.steps){
   context.lang=language;context.renderNonConsecutive600View(step);
   assert.ok(host.innerHTML.includes('<svg')||step.final);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);
   assert.ok((host.innerHTML.match(/data-nc600-value=/g)||[]).length<=32);
  }
  assert.equal(JSON.stringify(run),before);
 }
 assert.deepEqual(problem.defaultInput,[5]);
});
