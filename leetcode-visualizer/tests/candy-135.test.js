'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[135];

// A dependency graph orders each child above every lower-rated neighbor.
// Its longest downward path proves a pointwise lower bound on every allocation.
function oracle(ratings){
 const cache=new Map();
 function need(i){
  if(cache.has(i))return cache.get(i);
  const lower=[i-1,i+1].filter(j=>j>=0&&j<ratings.length&&ratings[j]<ratings[i]);
  const value=1+Math.max(0,...lower.map(need));cache.set(i,value);return value;
 }
 return ratings.map((_,i)=>need(i));
}
function directional(ratings,i,delta){
 let count=1;
 while(i+delta>=0&&i+delta<ratings.length&&ratings[i]>ratings[i+delta]){count++;i+=delta;}
 return count;
}
function cases(){
 const inputs=[];
 for(let n=1;n<=5;n++)for(let mask=0;mask<3**n;mask++){let value=mask;inputs.push(Array.from({length:n},()=>{const digit=value%3;value=Math.floor(value/3);return digit;}));}
 inputs.push([1,2,3,4,2,1],[1,2,5,4,3,2,1],Array.from({length:12},(_,i)=>i),Array.from({length:12},(_,i)=>12-i));
 return inputs;
}
test('two native passes attain independent graph lower bounds for all short rating patterns',()=>{
 for(const ratings of cases()){
  const before=JSON.stringify(ratings),run=problem.builder(ratings),expected=oracle(ratings),final=run.steps.at(-1).candy135View;
  assert.deepEqual(final.candies,expected);assert.equal(run.answer,expected.reduce((a,b)=>a+b,0));
  assert.equal(JSON.stringify(ratings),before);
  for(const step of run.steps){
   const v=step.candy135View,c=v.current;
   assert.equal(v.trace.truncated,false);assert.equal(v.source.text,problem.code[v.source.line-1].trim());assert.deepEqual(step.codeLines,[v.source.line]);
   for(let i=0;i<ratings.length;i++){
    if(v.left[i]!==null)assert.equal(v.left[i],directional(ratings,i,-1));
    if(v.right[i]!==null)assert.equal(v.right[i],directional(ratings,i,1));
   }
   if(c){
    assert.equal(c.neighbor,c.i+(c.direction==='left'?-1:1));
    if(c.condition!==null){assert.equal(c.condition,ratings[c.i]>ratings[c.neighbor]);assert.equal(c.candidate,directional(ratings,c.i,c.direction==='left'?-1:1));}
    if(c.after!==null){
     assert.equal(v.candies[c.i],c.after);
     assert.equal(c.after,c.direction==='left'?c.candidate:Math.max(c.before,c.candidate));
    }else assert.equal(v.candies[c.i],c.before);
   }
  }
  for(let i=0;i<ratings.length;i++)assert.equal(final.candies[i],Math.max(final.left[i],final.right[i]));
 }
});
test('equal ratings impose no equal-candy rule and max preserves either side of an asymmetric peak',()=>{
 assert.deepEqual(problem.builder([1,2,2]).steps.at(-1).candy135View.candies,[1,2,1]);
 assert.deepEqual(problem.builder([1,2,3,4,2,1]).steps.at(-1).candy135View.candies,[1,2,3,4,2,1]);
 assert.deepEqual(problem.builder([1,2,5,4,3,2,1]).steps.at(-1).candy135View.candies,[1,2,5,4,3,2,1]);
 const run=problem.builder([1,0,2]),check=run.steps.find(s=>s.candy135View.phase==='check-right').candy135View;
 assert.equal(check.current.candidate,2);assert.equal(check.current.after,null);assert.equal(check.candies[0],1);
 const written=run.steps.find(s=>s.candy135View.phase==='settle-right'&&s.candy135View.current.i===0).candy135View;
 assert.equal(written.current.after,2);assert.equal(written.candies[0],2);
 const single=problem.builder([0]);assert.equal(single.answer,1);assert.ok(single.steps.every(s=>!s.candy135View.current));
});
test('renderer accepts immutable native histories and each selected child has a minimal max witness',()=>{
 const host={innerHTML:'',dataset:{},querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang:'vi',document:{getElementById:()=>host}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-candy-135.js'),'utf8'),ctx);
 function freeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);Object.values(x).forEach(freeze);}return x;}
 for(const ratings of[[1,0,2],[1,2,2],[1,2,3,4,2,1],[1,2,5,4,3,2,1],[0],Array.from({length:12},(_,i)=>12-i)]){
  const run=freeze(problem.builder(ratings)),before=JSON.stringify(run);ctx.steps=run.steps;
  for(const lang of['vi','en']){
   ctx.lang=lang;
   for(const step of run.steps){ctx.renderCandy135Pictures(step);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);}
  }
  const final=run.steps.at(-1).candy135View;
  for(let i=0;i<ratings.length;i++){
   const chosen=ctx.ca135Choice(final,String(i));assert.equal(chosen,i);
   const html=ctx.ca135Proof(final,chosen);assert.match(html,new RegExp(`data-ca135-proof-result="${final.candies[i]}"`));
  }
  assert.equal(JSON.stringify(run),before);
 }
});
test('invalid ratings fail explicitly while live execution accepts original-size inputs',()=>{
 for(const input of[[],[-1],[50001],[1.5],[true],Array(13).fill(0),'1,,2','[1,','',null])assert.throws(()=>problem.builder(input),/135/);
 assert.equal(problem.builder('1,0,2').answer,5);assert.equal(problem.builder('[1,2,2]').answer,4);
 assert.equal(problem.liveArgs(Array(50000).fill(0))[0].length,50000);
 assert.throws(()=>problem.liveArgs(Array(50001).fill(0)),/135/);
});
test('displayed Python handles 50000 children in linear passes',()=>{
 const script="import json,sys\nns={};exec(json.load(sys.stdin),ns);sol=ns['Solution']();n=50000\nassert sol.candy(list(range(n)))==n*(n+1)//2\nassert sol.candy(list(range(n,0,-1)))==n*(n+1)//2\nassert sol.candy([0]*n)==n\nassert sol.candy([1,2,2])==4";
 const r=spawnSync('python3',['-c',script],{input:JSON.stringify(problem.code.join('\n')),encoding:'utf8'});assert.equal(r.status,0,r.stderr);
});
