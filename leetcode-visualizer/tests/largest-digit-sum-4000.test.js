'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const problem=require('../problems').SUPPORTED[4000];
const solve=(n,s)=>problem.builder([n],{s});

test('4000 uses actual Python line execution and accepts the existing visual input domain',()=>{
 assert.equal(problem.debugMode,'line-by-line');assert.equal(problem.slug,'largest-integer-with-given-digit-sum');
 assert.equal(problem.inputKind,'nonneg');
 assert.deepEqual(problem.liveArgs([3],{s:20}),[3,20]);assert.equal(problem.builder(problem.defaultInput).answer,992);
 for(const n of[-1,6,1.5,'3',[],[2,3],null])assert.throws(()=>problem.builder(n,{s:20}));
 for(const s of[-1,101,2.5,'20'])assert.throws(()=>solve(3,s));
 for(const[n,s,expected]of[[3,20,992],[2,9,90],[1,9,9],[5,45,99999],[3,0,0],[2,19,-1],[0,0,0],[0,1,-1]])assert.equal(solve(n,s).answer,expected);
});

test('4000 agrees with exhaustive enumeration for every allowed n and s',()=>{
 const largest=Array.from({length:6},()=>Array(101).fill(-1));
 for(let number=0;number<100000;number++){
  const digits=String(number);let sum=0;for(const digit of digits)sum+=Number(digit);
  for(let n=digits.length;n<=5;n++)largest[n][sum]=number;
 }
 largest[0][0]=0;
 for(let n=0;n<=5;n++)for(let s=0;s<=100;s++)assert.equal(solve(n,s).answer,largest[n][s],`n=${n}, s=${s}`);
});

test('4000 separates choosing, appending, and subtracting without revealing a future result',()=>{
 const run=solve(3,20),saved=JSON.stringify(run),placed=[];let previousRemaining=20,previousAnswer=0;
 for(const step of run.steps){const v=step.digitSum4000View;assert.equal(step.codeLines.length,1);assert.equal(v.source,problem.code[v.line-1]);
  if(v.line===7){assert.equal(v.transfer.amount,Math.min(9,v.remaining));assert.deepEqual(v.digits,placed);assert.equal(v.remaining,previousRemaining);}
  if(v.line===8){placed.push(v.transfer.amount);assert.deepEqual(v.digits,placed);assert.equal(v.currentAnswer,previousAnswer*10+v.transfer.amount);assert.equal(v.remaining,previousRemaining);previousAnswer=v.currentAnswer;}
  if(v.line===9){assert.equal(v.change.kind,'subtract');assert.equal(v.change.before,previousRemaining);assert.equal(v.remaining,previousRemaining-placed.at(-1));previousRemaining=v.remaining;}
  assert.equal(v.result,step.final?run.answer:null);
 }
 assert.equal(run.steps.filter(step=>step.final).length,1);assert.deepEqual(run.steps.at(-1).digitSum4000View.digits,[9,9,2]);assert.equal(previousRemaining,0);
 const end=solve(3,0).steps.at(-1).digitSum4000View;assert.deepEqual(end.digits,[0,0,0]);assert.equal(end.result,0);
 const impossible=solve(2,23);assert.deepEqual(impossible.steps.map(s=>s.codeLines[0]),[3,4]);assert.deepEqual(impossible.steps.at(-1).digitSum4000View.digits,[]);assert.equal(JSON.stringify(run),saved);
});

test('4000 renderer is bilingual, replays snapshots, shows pending digits, and supports impossible and zero cases',()=>{
 const host={innerHTML:'',querySelectorAll:()=>[]},ctx=vm.createContext({lang:'vi',$:()=>host,problemData:problem});
 vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-largest-digit-sum-4000.js'),'utf8'),ctx);
 for(const[n,s]of[[3,20],[3,0],[2,23],[5,45],[5,100],[0,0],[0,1]]){const run=solve(n,s),before=JSON.stringify(run);
  for(const language of['vi','en']){ctx.lang=language;for(const step of run.steps){ctx.renderLargestDigitSum4000(step);assert.equal(host.innerHTML.includes('class="ds4000-result '),step.final);assert.match(host.innerHTML,new RegExp(`data-code-line="${step.codeLines[0]}" aria-current="step"`));assert.doesNotMatch(host.innerHTML,/undefined|NaN|\[object Object\]|<script/);}}
  ctx.renderLargestDigitSum4000(run.steps[0]);const initial=host.innerHTML;ctx.renderLargestDigitSum4000(run.steps.at(-1));ctx.renderLargestDigitSum4000(run.steps[0]);assert.equal(host.innerHTML,initial);assert.equal(JSON.stringify(run),before);
 }
 const run=solve(3,20);ctx.renderLargestDigitSum4000(run.steps.find(s=>s.codeLines[0]===7));assert.match(host.innerHTML,/ds4000-slot active  pending/);assert.equal((host.innerHTML.match(/data-committed="true"/g)||[]).length,0);
 ctx.renderLargestDigitSum4000(run.steps.find(s=>s.codeLines[0]===8));assert.equal((host.innerHTML.match(/data-committed="true"/g)||[]).length,1);
 ctx.lang='vi';ctx.renderLargestDigitSum4000(run.steps.at(-1));assert.match(host.innerHTML,/Số lớn nhất/);ctx.lang='en';ctx.renderLargestDigitSum4000(run.steps.at(-1));assert.match(host.innerHTML,/Largest integer/);
});

test('4000 registers lazy picture assets, line controls, source-cache version, and both theme palettes',()=>{
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');for(const asset of['renderer-largest-digit-sum-4000.js','largest-digit-sum-4000.css']){const line=html.split('\n').find(line=>line.includes(asset));assert.match(line,/data-problem-ids="4000"/);}
 assert.match(html,/script\.js\?digitSum4000=/);assert.match(fs.readFileSync(require.resolve('../public/script.js'),'utf8'),/step\.digitSum4000View/);
 const css=fs.readFileSync(require.resolve('../public/largest-digit-sum-4000.css'),'utf8');assert.match(css,/\[data-theme="light"\] \.ds4000-viz/);assert.match(css,/@media\(max-width:480px\)/);assert.match(css,/--ds-done/);
});
