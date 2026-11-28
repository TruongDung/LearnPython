'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const problems=require('../problems').SUPPORTED;
const mex=a=>{const set=new Set(a);let m=0;while(set.has(m))m++;return m;};
const lex=(a,b)=>{for(let i=0;i<Math.min(a.length,b.length);i++)if(a[i]!==b[i])return a[i]-b[i];return a.length-b.length;};
function partitionOracle(a){let best=null;for(let mask=0;mask<2**(a.length-1);mask++){const out=[];let start=0;for(let i=0;i<a.length;i++)if(i===a.length-1||mask&(1<<i)){out.push(mex(a.slice(start,i+1)));start=i+1;}if(!best||lex(out,best)>0)best=out;}return best;}
function kadane(a){let best=-Infinity,current=-Infinity;for(const n of a){current=Math.max(n,current+n);best=Math.max(best,current);}return best;}
function swapOracle(a,k){let states=new Map([[JSON.stringify(a),a]]),best=kadane(a);for(let count=0;count<k;count++){const next=new Map(states);for(const values of states.values())for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const v=[...values];[v[i],v[j]]=[v[j],v[i]];const key=JSON.stringify(v);if(!next.has(key)){next.set(key,v);best=Math.max(best,kadane(v));}}if(next.size===states.size)break;states=next;}return best;}
function arithmeticOracle(a){let count=0;for(let l=0;l<a.length;l++)for(let r=l+2;r<a.length;r++){let valid=true;for(let i=l+2;i<=r;i++)if(a[i]-a[i-1]!==a[l+1]-a[l])valid=false;if(valid)count++;}return count;}
function enumerate(values,max,visit){function go(a,n){if(a.length===n){visit(a);return;}for(const n2 of values)go([...a,n2],n);}for(let n=1;n<=max;n++)go([],n);}
function runBatch(id,cases){
 const script='import sys,json\np=json.load(sys.stdin)\nscope={"inf":float("inf")}\nexec(p["source"],scope)\nsolve=getattr(scope["Solution"](),p["method"])\nprint(json.dumps([solve(*args) for args in p["cases"]]))';
 const local=path.resolve(__dirname,'../.viz-python',process.platform==='win32'?'Scripts/python.exe':'bin/python'),python=fs.existsSync(local)?local:process.platform==='win32'?'python':'python3',p=problems[id];
 const r=spawnSync(python,['-c',script],{input:JSON.stringify({source:p.code.join('\n'),method:p.__catalog.method,cases}),encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024,timeout:30000});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);
}
test('3948: source matches exhaustive partitions, including the longer-array lexicographic tie rule',()=>{
 const cases=[];enumerate([0,1,2],7,a=>cases.push([a]));let seed=3948;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};for(let i=0;i<150;i++)cases.push([Array.from({length:1+random(8)},()=>random(6))]);cases.push([[100000,100000]]);
 const answers=runBatch(3948,cases);cases.forEach(([a],i)=>assert.deepEqual(answers[i],partitionOracle(a),JSON.stringify(a)));process.stdout.write(`3948: ${cases.length} exhaustive-partition optima\n`);
});
test('3962: source matches an independent BFS of every reachable swapped array and Kadane sums',()=>{
 const cases=[];enumerate([-2,0,3],5,a=>{for(let k=0;k<=Math.min(2,a.length);k++)cases.push([a,k]);});let seed=3962;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};for(let i=0;i<100;i++){const a=Array.from({length:1+random(6)},()=>random(11)-5);cases.push([a,random(Math.min(a.length,2)+1)]);}cases.push([[1,-1,0,2],1],[[4,3,2,4],2],[[-1,-2],0]);
 const answers=runBatch(3962,cases);cases.forEach(([a,k],i)=>assert.equal(answers[i],swapOracle(a,k),JSON.stringify({a,k})));process.stdout.write(`3962: ${cases.length} reachable-array optima\n`);
});
test('413: source matches every candidate arithmetic interval for exhaustive signed arrays',()=>{
 const cases=[];enumerate([-1,0,1],8,a=>cases.push([a]));cases.push([[1,2,3,4]],[[3,-1,-5,-9]],[[1000,-1000,1000]]);
 const answers=runBatch(413,cases);cases.forEach(([a],i)=>assert.equal(answers[i],arithmeticOracle(a),JSON.stringify(a)));process.stdout.write(`413: ${cases.length} exhaustive interval counts\n`);
});
const files={3948:'renderer-mex-3948.js',3962:'renderer-subarray-swaps-3962.js',413:'renderer-arithmetic-slices-413.js'},names={3948:'renderMex3948',3962:'renderSubarraySwaps3962',413:'renderArithmetic413'};
function context(){const ctx=vm.createContext({});for(const file of Object.values(files))vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);return ctx;}
function swapped(a,pairs){const copy=[...a];for(const p of pairs)[copy[p.inside],copy[p.outside]]=[copy[p.outside],copy[p.inside]];return copy;}
test('3948 / 3962 / 413: every bilingual picture follows actual source commits and rewinds without revealing future results',()=>{
 const ctx=context(),cases={3948:[[[0,1,0]],[[3,1]],[[1,0,2]],[[0]],[[100000]],[[0,1,0,1,2,0]],[[4,4,4,4]]],3962:[[[1,-1,0,2],1],[[4,3,2,4],2],[[-1,-2],0],[[0],1],[[2,-8,2,-8,2],2],[[1,1,1],3]],413:[[[1,2,3,4]],[[1]],[[1,2]],[[7,7,7,7]],[[3,-1,-5,-9]],[[1,2,3,8,9,10]]]};
 for(const[idString,inputs]of Object.entries(cases)){const id=Number(idString),p=problems[id];assert.equal(p.debugMode,'line-by-line');for(const args of inputs){const nums=args[0],run=p.builder(JSON.stringify(args)),saved=JSON.stringify(run);
  for(const step of run.steps){const v=step.catalogLessonView,x=v.locals;assert.equal(v.source,p.code[v.line-1]);assert.equal(v.trace.truncated,false);
   if(id===3948){let end=0;for(const cut of v.mex3948.cuts){assert.equal(cut.left,end);assert.ok(cut.right>cut.left);assert.equal(cut.mex,mex(nums.slice(cut.left,cut.right)));end=cut.right;}assert.deepEqual(v.mex3948.cuts.map(c=>c.mex),x.answer);if(v.final)assert.equal(end,nums.length);if(v.mex3948.phase==='collect')assert.equal(x.mex,mex(nums.slice(v.mex3948.start)));}
   if(id===3962){const s=v.swap3962;if(v.line>=8&&v.line<=13){const a=swapped(nums,s.swaps);assert.equal(a.slice(x.left,x.right+1).reduce((a,b)=>a+b,0),x.score);assert.ok(s.swaps.length<=args[1]);}if(s.best){const a=swapped(nums,s.best.swaps);assert.equal(a.slice(s.best.left,s.best.right+1).reduce((a,b)=>a+b,0),s.best.score);assert.equal(s.best.score,x.answer);assert.ok(s.best.swaps.length<=args[1]);}for(const pair of s.swaps){assert.ok(pair.gain>0);assert.ok(pair.inside>=x.left&&pair.inside<=x.right);assert.ok(pair.outside<x.left||pair.outside>x.right);}}
   if(id===413){assert.equal(v.arithmetic413.groups.reduce((n,g)=>n+g.count,0),x.answer);for(const g of v.arithmetic413.groups){let count=0;for(let l=0;l<g.right-1;l++)if(arithmeticOracle(nums.slice(l,g.right+1))-arithmeticOracle(nums.slice(l,g.right))>0){const a=nums.slice(l,g.right+1);if(a.every((n,i)=>i<2||n-a[i-1]===a[1]-a[0]))count++;}assert.equal(count,g.count);}}
   for(const lang of['vi','en']){const html=ctx[names[id]](v,lang);assert.match(html,new RegExp(`data-guided-id="${id}"`));assert.doesNotMatch(html,/NaN|undefined|\[object Object\]|iv-debug|iv-source|data-code-line/);const result=id===3948?'data-mex-result':id===3962?'data-swap-result':'data-arithmetic-result';assert.equal(html.includes(result),v.final);assert.equal(ctx[names[id]](v,lang),html);}
  }
  const first=ctx[names[id]](run.steps[0].catalogLessonView,'vi');ctx[names[id]](run.steps.at(-1).catalogLessonView,'vi');assert.equal(ctx[names[id]](run.steps[0].catalogLessonView,'vi'),first);assert.equal(JSON.stringify(run),saved);
 }}
});
test('3948 / 3962 / 413: maximum visual inputs fit serverless trace and response limits; invalid inputs fail early',()=>{
 for(const[id,args,expected]of [[3948,[Array(60).fill(100000)],Array(60).fill(0)],[3948,[Array.from({length:60},(_,i)=>i)],[60]],[3962,[Array.from({length:12},(_,i)=>i%2?100000:-100000),12],600000],[413,[Array(80).fill(7)],3081]]){const run=problems[id].builder(JSON.stringify(args));assert.deepEqual(run.answer,expected);assert.ok(run.steps.length<4000);assert.ok(JSON.stringify(run).length<4.5*1024*1024,JSON.stringify({id,steps:run.steps.length,mb:JSON.stringify(run).length/1048576}));}
 for(const[id,args]of[[3948,[[]]],[3948,[[-1]]],[3948,[Array(61).fill(0)]],[3962,[[1,2],3]],[3962,[Array(13).fill(1),1]],[3962,[[1.5],0]],[413,[[]]],[413,[[1001]]],[413,[Array(81).fill(0)]]])assert.throws(()=>problems[id].builder(JSON.stringify(args)));
});
test('all three dedicated pictures are lazy, ordered before dispatch, and have separate light/dark palettes',()=>{
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),styles={3948:'mex-3948.css',3962:'subarray-swaps-3962.css',413:'arithmetic-slices-413.css'};
 for(const id of[3948,3962,413]){for(const asset of[files[id],styles[id],'renderer-illustrated-lessons.js','illustrated-lessons.css','renderer-guided-scenes.js','guided-scenes.css','renderer-catalog-lessons.js','catalog-lessons.css']){const line=html.split('\n').find(l=>l.includes(asset+'?'));assert.ok(line);assert.ok(line.match(/data-problem-ids="([^"]+)"/)[1].split(' ').includes(String(id)));}assert.ok(html.indexOf(files[id])<html.indexOf('renderer-illustrated-lessons.js'));const css=fs.readFileSync(require.resolve('../public/'+styles[id]),'utf8');assert.match(css,/data-theme="light"/);assert.match(css,/@media\(max-width:600px\)/);}
});
