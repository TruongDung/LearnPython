'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[2243];

function oracle(input,k){
 const rounds=[];let s=input;
 while(s.length>k){
  const sums=Array.from({length:Math.ceil(s.length/k)},()=>0);
  [...s].forEach((digit,i)=>{sums[Math.floor(i/k)]+=Number(digit);});
  s=sums.map(String).join('');rounds.push(s);
 }
 return {answer:s,rounds};
}
function cases(){
 const inputs=[['11111222223',3],['00000000',3],['9999',2],['12345',3],['123',3],['0',2],['000',100],['9'.repeat(48),2],['9'.repeat(48),47]];
 let seed=2243;
 for(let i=0;i<32;i++){
  const s=Array.from({length:1+i%24},()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%10;}).join('');
  inputs.push([s,2+i%8]);
 }
 return inputs;
}
test('native rounds agree with independent digit buckets, including zeros and sums of multiple digits',()=>{
 for(const[s,k]of cases()){
  const run=problem.builder(s,{k}),expected=oracle(s,k),final=run.steps.at(-1).digitSumString2243View;
  assert.equal(run.answer,expected.answer);assert.equal(typeof run.answer,'string');
  assert.deepEqual(final.rounds.map(r=>r.output),expected.rounds);
  assert.ok(final.answer.length<=k);
  for(const step of run.steps){
   const v=step.digitSumString2243View,c=v.current;
   assert.equal(v.trace.truncated,false);assert.equal(v.source.text,problem.code[v.source.line-1].trim());assert.deepEqual(step.codeLines,[v.source.line]);
   assert.equal(v.working,[...v.rounds].reverse().find(r=>r.output!==null)?.output??s);
   for(let r=0;r<v.rounds.length;r++){
    const round=v.rounds[r];assert.ok(round.input.length>k);
    assert.equal(round.groups.map(g=>g.text).join(''),round.input);
    assert.equal(round.input,r?expected.rounds[r-1]:s);
    assert.deepEqual(round.parts,round.groups.filter(g=>g.part!==null).map(g=>g.part));
    for(const group of round.groups){
     assert.ok(group.text.length>=1&&group.text.length<=k);
     if(group.part!==null){
      const total=[...group.text].reduce((sum,d)=>sum+Number(d),0);
      assert.equal(group.total,total);assert.equal(group.part,String(total));
      assert.equal(run.steps[group.step].digitSumString2243View.phase,'append');
     }
    }
    if(round.output!==null){assert.equal(round.output,round.parts.join(''));assert.equal(run.steps[round.joinStep].digitSumString2243View.phase,'join');}
   }
   if(c){
    const group=v.rounds[c.round].groups[c.group];
    if(c.text!==null)assert.equal(c.text,group.text);
    if(c.total!==null)assert.equal(c.total,[...group.text.slice(0,c.processed)].reduce((sum,d)=>sum+Number(d),0));
    assert.equal(group.part,c.appended?String(c.total):null);
   }
  }
 }
});
test('snapshots keep sums pending until append and the next string pending until join',()=>{
 const run=problem.builder('11111222223',{k:3});
 const sum=run.steps.find(s=>{const v=s.digitSumString2243View;return v.phase==='add'&&v.current.total===13;}).digitSumString2243View;
 assert.equal(sum.rounds[1].groups[0].part,null);assert.equal(sum.rounds[1].output,null);assert.equal(sum.working,'3465');
 const append=run.steps.find(s=>{const v=s.digitSumString2243View;return v.phase==='append'&&v.current.total===13;}).digitSumString2243View;
 assert.equal(append.rounds[1].groups[0].part,'13');assert.equal(append.rounds[1].output,null);
 assert.equal(problem.builder('00000000',{k:3}).answer,'000');
 for(const s of['0','123','000']){
  const short=problem.builder(s,{k:3});assert.equal(short.answer,s);assert.ok(short.steps.every(s=>s.digitSumString2243View.rounds.length===0));
 }
});
test('renderer preserves every native frame and selectable groups retain their entire sum',()=>{
 const host={innerHTML:'',dataset:{},querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang:'vi',document:{getElementById:()=>host}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-digit-sum-string-2243.js'),'utf8'),ctx);
 function freeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);Object.values(x).forEach(freeze);}return x;}
 for(const[s,k]of [['11111222223',3],['00000000',3],['9999',2],['123',3],['9'.repeat(48),47]]){
  const run=freeze(problem.builder(s,{k})),before=JSON.stringify(run);ctx.steps=run.steps;
  for(const lang of['vi','en']){
   ctx.lang=lang;
   for(const step of run.steps){ctx.renderDigitSumString2243Pictures(step);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);}
  }
  const final=run.steps.at(-1).digitSumString2243View;
  for(let r=0;r<final.rounds.length;r++)for(let g=0;g<final.rounds[r].groups.length;g++){
   const scene=ctx.ds2243Scene(final,`${r}:${g}`),group=final.rounds[r].groups[g];
   assert.equal(scene.text,group.text);assert.equal(scene.total,Number(group.part));assert.equal(scene.processed,group.text.length);
  }
  assert.equal(JSON.stringify(run),before);
 }
 const big=problem.builder('9'.repeat(48),{k:47});ctx.lang='en';ctx.renderDigitSumString2243Pictures(big.steps.at(-1));assert.match(host.innerHTML,/Keep all 3 digits/);
});
test('input validation respects both the visual limit and original problem constraints',()=>{
 for(const input of['','123a','1 2','１２',null,123,['1'], '9'.repeat(49)])assert.throws(()=>problem.builder(input,{k:3}),/2243/);
 for(const k of[1,0,101,2.5,true,'3'])assert.throws(()=>problem.builder('123',{k}),/2243/);
 assert.equal(problem.builder('123').answer,'123');
 assert.deepEqual(problem.liveArgs('9'.repeat(100),{k:100}),['9'.repeat(100),100]);
 assert.throws(()=>problem.liveArgs('9'.repeat(101),{k:2}),/2243/);
});
test('displayed Python executes original-size cases and returns strings without losing leading zeros',()=>{
 const inputs=[['9'.repeat(100),2],['9'.repeat(100),99],['0'.repeat(100),3],['000123',100]];
 const payload={code:problem.code.join('\n'),cases:inputs.map(([s,k])=>[s,k,oracle(s,k).answer])};
 const script="import json,sys\np=json.load(sys.stdin);ns={};exec(p['code'],ns)\nfor s,k,expected in p['cases']:\n answer=ns['Solution']().digitSum(s,k)\n assert isinstance(answer,str) and answer==expected,(s,k,answer,expected)";
 const r=spawnSync('python3',['-c',script],{input:JSON.stringify(payload),encoding:'utf8'});assert.equal(r.status,0,r.stderr);
});
