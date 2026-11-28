"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[4123];
function renderer(){const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-math-replays.js'),'utf8'),ctx);return ctx;}
const memo=new Map();
function brute(a){
 if(!a.length)return 0;if(a.length===1)return Infinity;
 const key=JSON.stringify(a);if(memo.has(key))return memo.get(key);
 let best=Infinity;for(let l=0;l<a.length;l++)for(let r=l+1;r<a.length;r++)best=Math.min(best,a[l]+a[r]+brute([...a.slice(0,l),...a.slice(r+1)]));
 memo.set(key,best);return best;
}
test('pictures reconstruct legal optimal deletions from executed DP states, including negative costs and duplicates',()=>{
 const cases=[];
 function enumerate(a,n){if(a.length===n){cases.push(a);return;}for(const v of[-2,0,3])enumerate([...a,v],n);}
 for(let n=2;n<=6;n++)enumerate([],n);
 let seed=4123;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
 for(let i=0;i<150;i++)cases.push(Array.from({length:2+random(7)},()=>random(15)-7));
 cases.push([2,-7,3,-5],[4,0,-5,2],[7,-8,1],[1e9,-1e9,1e9,-1e9],Array(12).fill(-1));
 const script='import json,sys,math\np=json.load(sys.stdin)\nscope={"inf":math.inf}\nexec(p["source"],scope)\nstate={}\ndef capture(frame,event,arg):\n if event=="return" and frame.f_code.co_name=="run":\n  state.update({"full":frame.f_locals["full"],"free":frame.f_locals["free"]})\nanswers=[]\nfor nums in p["cases"]:\n sys.setprofile(capture)\n answer=scope["Solution"]().run(nums)\n sys.setprofile(None)\n answers.append({"answer":answer,"full":[[x if math.isfinite(x) else "∞" for x in row] for row in state["full"]],"free":state["free"]})\nprint(json.dumps(answers))';
 const local=path.resolve(__dirname,'../.viz-python',process.platform==='win32'?'Scripts/python.exe':'bin/python'),python=fs.existsSync(local)?local:process.platform==='win32'?'python':'python3';
 const result=spawnSync(python,['-c',script],{input:JSON.stringify({source:problem.code.join('\n'),cases}),encoding:'utf8',windowsHide:true,maxBuffer:12*1024*1024,timeout:30000});assert.equal(result.status,0,result.stderr);
 const answers=JSON.parse(result.stdout),ctx=renderer();
 cases.forEach((nums,i)=>{
  const {answer,full,free}=answers[i],plan=ctx.deletion4123Plan(nums,full,free);let remaining=nums.map((_,i)=>i),total=0;
  for(const op of plan){assert.deepEqual(Array.from(op.before),remaining);const l=remaining.indexOf(op.left),r=remaining.indexOf(op.end);assert.ok(r>l);const removed=remaining.splice(l,r-l+1);assert.deepEqual(Array.from(op.removed),removed);assert.deepEqual(Array.from(op.after),remaining);assert.equal(op.charge,nums[op.left]+nums[op.end]);total+=op.charge;assert.equal(op.total,total);}
  assert.equal(remaining.length,0);assert.equal(total,answer);if(nums.length<=8)assert.equal(answer,brute(nums),JSON.stringify(nums));else assert.equal(answer,-12);
 });
 process.stdout.write(`Verified ${cases.length} optimal deletion pictures\n`);
});
test('every source line renders reversible signed snapshots without premature candidates or optimal plans',()=>{
 const ctx=renderer();
 for(const nums of[[2,-7,3,-5],[4,0,-5,2],[7,-8,1],[0,0],[3,3,3,3],[-5,-5,-5,-5],[1e9,-1e9,1e9,-1e9]]){
  const run=problem.builder(JSON.stringify([nums])),saved=JSON.stringify(run);
  for(const language of['vi','en'])for(const step of run.steps){
   const v=step.catalogLessonView,html=ctx.mathPicture(v,language);assert.equal(v.source,problem.code[v.line-1]);assert.match(html,/data-math-id="4123"/);assert.doesNotMatch(html,/NaN|undefined|\[object Object\]|iv-debug|iv-source|data-code-line/);
   assert.equal(html.includes('data-deletion-operation'),v.final);assert.equal(html.includes('data-deletion-result'),v.final);
   if([11,12,15,16].includes(v.line))assert.ok(!html.includes('data-deletion-candidate'),v.source);
   if(v.line===14||v.line===18){const x=v.locals,expected=v.line===14?[nums[x.left],nums[x.end],x.inside,x.tail]:[x.full[x.left][x.end],x.tail];const candidate=expected.every(Number.isFinite)?expected.reduce((a,b)=>a+b,0):'∞';assert.ok(html.includes(`data-deletion-candidate="${candidate}"`));}
   if(!v.final)assert.ok(!html.includes('del4123-operation'));
   assert.equal(ctx.mathPicture(v,language),html);
  }
  const first=ctx.mathPicture(run.steps[0].catalogLessonView,'vi');ctx.mathPicture(run.steps.at(-1).catalogLessonView,'vi');assert.equal(ctx.mathPicture(run.steps[0].catalogLessonView,'vi'),first);assert.equal(JSON.stringify(run),saved);
 }
 assert.equal(problem.debugMode,'line-by-line');
 for(const nums of[[],[1],Array(13).fill(0)])assert.throws(()=>problem.builder(JSON.stringify([nums])));
});
