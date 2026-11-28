"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[4123];
function renderer(){const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-math-replays.js'),'utf8'),ctx);return ctx;}
const memo=new Map(),number=n=>n==='∞'?Infinity:n;
function brute(a){
 if(!a.length)return 0;if(a.length===1)return Infinity;
 const key=JSON.stringify(a);if(memo.has(key))return memo.get(key);
 let best=Infinity;for(let l=0;l<a.length;l++)for(let r=l+1;r<a.length;r++)best=Math.min(best,a[l]+a[r]+brute([...a.slice(0,l),...a.slice(r+1)]));
 memo.set(key,best);return best;
}
test('requested parity code matches exhaustive deletion optima and draws legal plans from executed costs',()=>{
 const cases=[];
 function enumerate(a,n){if(a.length===n){cases.push(a);return;}for(const v of[-2,0,3])enumerate([...a,v],n);}
 for(let n=2;n<=6;n++)enumerate([],n);
 let seed=4123;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
 for(let i=0;i<150;i++)cases.push(Array.from({length:2+random(7)},()=>random(15)-7));
 cases.push([2,-7,3,-5],[4,0,-5,2],[7,-8,1],[1e9,-1e9,1e9,-1e9],Array(80).fill(-1));
 const ctx=renderer();
 for(const nums of cases){
  const run=problem.builder(JSON.stringify([nums])),final=run.steps.at(-1).catalogLessonView;
  assert.equal(run.answer,nums.length<=8?brute(nums):-80,JSON.stringify(nums));
  for(const step of run.steps){
   const v=step.catalogLessonView,x=v.locals,p=v.parity4123;
   if(x.even!==undefined)assert.equal(p.evenIndices.reduce((s,i)=>s+nums[i],0),x.even);assert.equal(p.evenIndices.length%2,0);
   if(p.oddIndices!==null){assert.equal(p.oddIndices.reduce((s,i)=>s+nums[i],0),x.odd);assert.equal(p.oddIndices.length%2,1);}else if(x.odd!==undefined)assert.equal(x.odd,'∞');
   if(p.committed){assert.equal(x.even,Math.min(number(p.before.even),number(p.before.odd)+x.x));assert.equal(x.odd,Math.min(number(p.before.odd),number(p.before.even)+x.x));}
  }
  const plan=ctx.deletion4123Plan(nums,final.parity4123.evenIndices);let remaining=nums.map((_,i)=>i),total=0;
  for(const op of plan){assert.deepEqual(Array.from(op.before),remaining);const l=remaining.indexOf(op.left),r=remaining.indexOf(op.end);assert.ok(r>l);const removed=remaining.splice(l,r-l+1);assert.deepEqual(Array.from(op.removed),removed);assert.deepEqual(Array.from(op.after),remaining);assert.equal(op.charge,nums[op.left]+nums[op.end]);total+=op.charge;assert.equal(op.total,total);}
  assert.equal(remaining.length,0);assert.equal(total,run.answer);
 }
 process.stdout.write(`Verified ${cases.length} parity traces and optimal deletion plans\n`);
});
test('multiline tuple RHS reads old values and renders reversible pictures without premature updates',()=>{
 const ctx=renderer();
 for(const nums of[[2,-7,3,-5],[0,-3,-2,0],[4,0,-5,2],[7,-8,1],[0,0],[3,3,3,3],[-5,-5,-5,-5],[1e9,-1e9,1e9,-1e9]]){
  const run=problem.builder(JSON.stringify([nums])),saved=JSON.stringify(run);
  for(const language of['vi','en'])for(const step of run.steps){
   const v=step.catalogLessonView,html=ctx.mathPicture(v,language);assert.equal(v.source,problem.code[v.line-1]);assert.match(html,/data-math-id="4123"/);assert.doesNotMatch(html,/NaN|undefined|\[object Object\]|iv-debug|iv-source|data-code-line|mp-matrix/);
   assert.equal(html.includes('data-deletion-operation'),v.final);assert.equal(html.includes('data-deletion-result'),v.final);
   if(v.line===9)assert.match(html,/data-target-even="pending"[\s\S]*data-target-odd="pending"/);
   if(v.line===12)assert.match(html,/data-target-odd="pending"/);
   if(v.line===12||v.line===13){assert.equal(v.locals.even,v.parity4123.before.even);assert.equal(v.locals.odd,v.parity4123.before.odd);}
   assert.equal(ctx.mathPicture(v,language),html);
  }
  const first=ctx.mathPicture(run.steps[0].catalogLessonView,'vi');ctx.mathPicture(run.steps.at(-1).catalogLessonView,'vi');assert.equal(ctx.mathPicture(run.steps[0].catalogLessonView,'vi'),first);assert.equal(JSON.stringify(run),saved);
 }
 const r=problem.builder('[[0,-3,-2,0]]'),v=r.steps.find(s=>s.catalogLessonView.line===11&&s.catalogLessonView.locals.i===2).catalogLessonView;assert.equal(v.locals.even,-5);assert.equal(v.locals.odd,-3);
 assert.equal(problem.debugMode,'line-by-line');assert.equal(problem.complexity.time,'O(n)');assert.equal(problem.complexity.space,'O(1)');assert.equal(problem.code2,undefined);
 for(const nums of[[],[1],Array(81).fill(0),[2,1.5,3],[2,1e10,3]])assert.throws(()=>problem.builder(JSON.stringify([nums])));
});
test('80-value replay works through the bundled Vercel Python runtime',()=>{
 const source='const p=require("./problems").SUPPORTED[4123],r=p.builder(JSON.stringify([Array(80).fill(-1)]));console.log(JSON.stringify({answer:r.answer,steps:r.steps.length,mb:JSON.stringify(r).length/1048576,processed:r.steps.at(-1).catalogLessonView.parity4123.processed}));';
 const run=spawnSync(process.execPath,['-e',source],{cwd:require('node:path').resolve(__dirname,'..'),env:{...process.env,VERCEL:'1'},encoding:'utf8',windowsHide:true,timeout:25000,maxBuffer:1024*1024});assert.equal(run.status,0,run.stderr);const result=JSON.parse(run.stdout);assert.equal(result.answer,-80);assert.equal(result.processed,78);assert.ok(result.steps<500);assert.ok(result.mb<4.5,JSON.stringify(result));
});
