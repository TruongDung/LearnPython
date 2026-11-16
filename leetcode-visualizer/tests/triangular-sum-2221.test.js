'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[2221];

// Pascal coefficients provide an independent oracle for the repeated additions.
function oracle(nums){
 let coefficient=1n,total=0n;
 for(let i=0;i<nums.length;i++){
  total+=coefficient*BigInt(nums[i]);
  coefficient=coefficient*BigInt(nums.length-1-i)/BigInt(i+1);
 }
 return Number(total%10n);
}
function cases(){
 const inputs=[[1,2,3,4,5],[5],[0],[9,8],[9,9,9],Array(12).fill(0),Array(12).fill(9)];
 let seed=2221;
 for(let k=0;k<32;k++)inputs.push(Array.from({length:1+k%12},()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%10;}));
 return inputs;
}
test('native trace matches Pascal coefficients and reveals each cell only after the write',()=>{
 for(const nums of cases()){
  const before=JSON.stringify(nums),run=problem.builder(nums);
  assert.equal(run.answer,oracle(nums));assert.equal(JSON.stringify(nums),before);
  for(let i=0;i<run.steps.length;i++){
   const step=run.steps[i],v=step.triangularSum2221View,c=v.current;
   assert.equal(v.trace.truncated,false);
   assert.equal(v.source.text,problem.code[v.source.line-1].trim());
   assert.deepEqual(step.codeLines,[v.source.line]);
   for(let r=0;r<v.rows.length;r++)for(let col=0;col<v.rows[r].length;col++){
    const value=v.rows[r][col];
    if(!r){assert.equal(value,nums[col]);continue;}
    const write=v.writes.find(w=>w.row===r&&w.col===col);
    if(!write){assert.equal(value,null);continue;}
    assert.equal(value,(v.rows[r-1][col]+v.rows[r-1][col+1])%10);
    assert.equal(run.steps[write.step].triangularSum2221View.phase,'write');
    assert.ok(write.step<=i);
   }
   if(c){
    if(c.left!==null)assert.equal(c.left,v.rows[c.row-1][c.col]);
    if(c.right!==null)assert.equal(c.right,v.rows[c.row-1][c.col+1]);
    if(c.total!==null)assert.equal(c.total,c.left+c.right);
    if(c.digit!==null)assert.equal(c.digit,c.total%10);
    assert.equal(v.rows[c.row][c.col],c.written?c.digit:null);
   }
   if(v.phase==='write'){
    // Earlier positions have been overwritten, later parents still retain the old row.
    assert.deepEqual(v.working.slice(0,v.length),[
     ...v.rows[c.row].slice(0,c.col+1),...v.rows[c.row-1].slice(c.col+1)
    ]);
   }
  }
  const final=run.steps.at(-1).triangularSum2221View;
  assert.equal(final.writes.length,nums.length*(nums.length-1)/2);
  assert.equal(final.rows.at(-1)[0],run.answer);
  assert.equal(final.length,1);
 }
});
test('carry and single-element frames have no invented calculation or premature value',()=>{
 const run=problem.builder([9,8]),mod=run.steps.find(s=>s.triangularSum2221View.phase==='mod').triangularSum2221View;
 assert.equal(mod.current.total,17);assert.equal(mod.current.digit,7);assert.equal(mod.rows[1][0],null);
 const write=run.steps.find(s=>s.triangularSum2221View.phase==='write').triangularSum2221View;
 assert.equal(write.rows[1][0],7);
 for(const digit of[0,5,9]){
  const single=problem.builder([digit]);assert.equal(single.answer,digit);
  assert.ok(single.steps.every(s=>!s.triangularSum2221View.current&&s.triangularSum2221View.writes.length===0));
 }
});
test('both languages render immutable native frames and every selected cell has the correct parents',()=>{
 const host={innerHTML:'',dataset:{},querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang:'vi',document:{getElementById:()=>host}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-triangular-sum-2221.js'),'utf8'),ctx);
 function freeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);Object.values(x).forEach(freeze);}return x;}
 for(const nums of[[1,2,3,4,5],[9,8],[0],[5],Array(12).fill(9)]){
  const run=freeze(problem.builder(nums)),before=JSON.stringify(run);ctx.steps=run.steps;
  for(const lang of['vi','en']){
   ctx.lang=lang;
   for(const step of run.steps){ctx.renderTriangularSum2221Pictures(step);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);}
  }
  const final=run.steps.at(-1).triangularSum2221View;
  for(let r=1;r<nums.length;r++)for(let c=0;c<final.rows[r].length;c++){
   const scene=ctx.ts2221Scene(final,`${r}:${c}`);
   assert.equal(scene.left,final.rows[r-1][c]);assert.equal(scene.right,final.rows[r-1][c+1]);
   assert.equal(scene.digit,(scene.left+scene.right)%10);
  }
  assert.equal(JSON.stringify(run),before);
 }
});
test('visual inputs validate digits and live execution accepts the full original size',()=>{
 for(const input of[[],[10],[-1],[1.5],[true],Array(13).fill(1),'1,,2','[1,','',null])assert.throws(()=>problem.builder(input),/2221/);
 assert.equal(problem.builder('1,2,3,4,5').answer,8);
 assert.equal(problem.builder('[9,8]').answer,7);
 assert.equal(problem.liveArgs(Array(1000).fill(9))[0].length,1000);
 assert.throws(()=>problem.liveArgs(Array(1001).fill(0)),/2221/);
});
test('displayed Python handles 1000 digits and agrees with an independent binomial formula',()=>{
 const code=problem.code.join('\n'),script=`import json,sys,math
ns={};exec(json.load(sys.stdin),ns)
for nums in [[5],[0],[1,2,3,4,5],[9,8],[(i*i+7*i+9)%10 for i in range(1000)]]:
 expected=sum(math.comb(len(nums)-1,i)*x for i,x in enumerate(nums))%10
 assert ns['Solution']().triangularSum(nums)==expected
 assert nums[0]==expected
`;
 const r=spawnSync('python3',['-c',script],{input:JSON.stringify(code),encoding:'utf8'});assert.equal(r.status,0,r.stderr);
});
