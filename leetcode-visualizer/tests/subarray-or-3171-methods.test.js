'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[3171],methods=require('../problems/subarray-or-3171-methods');
const brute=(nums,k)=>{let best=Infinity;for(let l=0;l<nums.length;l++){let value=0;for(let r=l;r<nums.length;r++){value|=nums[r];best=Math.min(best,Math.abs(value-k));}}return best;};
const build=(method,nums,k)=>p[method===1?'builder':`builder${method}`](nums,{k});
const fixtures=[[[1,2,4,5],6],[[0,0,0],5],[[1],10],[[1,3,1,3],2],[[536870912,1,2],536870914],[[1000000000,73741823,5],0]];
test('3171 exposes seven selectable methods with separate code, complexities and typed input',()=>{
 assert.deepEqual(p.extraParams.find(x=>x.key==='approach').options.map(x=>x.value),[1,2,3,4,5,6,7]);assert.equal(p.debugMode,'line-by-line');
 for(let method=1;method<=7;method++){const suffix=method===1?'':method;assert.ok(p[`code${suffix}`].length>5);assert.ok(p[`complexity${suffix}`].time);assert.equal(typeof p[`builder${suffix}`],'function');}
 assert.deepEqual(p.liveArgs('1',{k:10}),[[1],10]);assert.deepEqual(p.liveArgs('[1,2]',{k:3}),[[1,2],3]);
 for(const method of[1,2,3,4,5,6,7])assert.throws(()=>build(method,Array(19).fill(1),3),/3171/);
});
test('all seven displayed Python algorithms agree with independent exhaustive subarray enumeration',()=>{
 const cases=[];for(let mask=0;mask<64;mask++)for(let k=0;k<8;k++)cases.push([[mask&3,(mask>>2)&3,(mask>>4)&3],k]);cases.push(...fixtures);
 let seed=3171;for(let trial=0;trial<90;trial++){const nums=Array.from({length:1+trial%10},()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%1024;});cases.push([nums,(seed>>>8)%1024]);}
 const source=`import json,sys
payload=json.load(sys.stdin)
out=[]
for code in payload['codes']:
    namespace={}
    exec(code,namespace)
    out.append([namespace['Solution']().minimumDifference(list(nums),k) for nums,k in payload['cases']])
print(json.dumps(out))`;
 const run=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify({codes:methods.map(m=>m.code.join('\n')),cases}),encoding:'utf8'});assert.equal(run.status,0,run.stderr);const expected=cases.map(([nums,k])=>brute(nums,k));JSON.parse(run.stdout).forEach((answers,i)=>assert.deepEqual(answers,expected,`method ${i+1}`));
});
test('all seven builders use the real Python line trace and retain valid candidate windows, bit operations and snapshots',()=>{
 for(let method=1;method<=7;method++)for(const[nums,k]of fixtures){const before=[...nums],run=build(method,nums,k);assert.equal(run.answer,brute(nums,k));assert.deepEqual(nums,before);assert.equal(run.steps.filter(s=>s.final).length,1);
 for(const step of run.steps){const v=step.subarrayOr3171View;assert.deepEqual(step.codeLines,[v.line]);assert.equal(step.codeBlock,method);assert.equal(v.source,methods[method-1].code[v.line-1].trim());
  for(const candidate of[v.candidate,v.bestWindow])if(candidate){assert.equal(nums.slice(candidate.left,candidate.right+1).reduce((a,b)=>a|b,0),candidate.value);assert.equal(Math.abs(candidate.value-k),candidate.difference);}
  const op=v.bitOperation;if(op)assert.equal(op.value,op.kind==='CLEAR'?op.a&~op.b:op.a|op.b);
  if(v.counts)assert.ok(v.counts.every(count=>Number.isInteger(count)&&count>=0));
 }
 assert.equal(run.steps.at(-1).subarrayOr3171View.best,run.answer);}
});
test('native Python confirms every recorded source line, helper scope and watch value for all seven methods',()=>{
 const source=`import json,sys,runpy
payload=json.load(sys.stdin)
tracer=runpy.run_path(payload['path'])['picture_trace']
out=[]
for code in payload['codes']:
    trace=json.loads(tracer({'code':code,'method':'minimumDifference','args':[[1,2,4,5],6]}))
    out.append(trace['events'])
print(json.dumps(out))`;
 const run=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),codes:methods.map(m=>m.code.join('\n'))}),encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(run.status,0,run.stderr);
 JSON.parse(run.stdout).forEach((events,i)=>{const built=build(i+1,[1,2,4,5],6);assert.equal(built.steps.length,events.length);built.steps.forEach((s,j)=>{const e=events[j],context={...e.outer,...e.locals};assert.equal(s.codeLines[0],e.line);assert.equal(s.subarrayOr3171View.scope,e.scope);for(const watch of s.vars)assert.deepEqual(watch.value,context[watch.name]??'—',`method ${i+1}, event ${j}, ${watch.name}`);});});
});
test('seven diagrams show source-derived structures and restore older steps in both languages',()=>{
 const ctx={escapeHtml:String};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-subarray-or-3171.js'),'utf8'),ctx);const Visualizer=vm.runInContext('SubarrayOr3171Visualizer',ctx);
 for(const language of['vi','en'])for(let method=1;method<=7;method++){const host={innerHTML:'',clientWidth:600},renderer=new Visualizer({host,language}),run=build(method,[1,2,4,5],6),before=JSON.stringify(run);
 for(const step of run.steps){renderer.render(step);const html=host.innerHTML,v=step.subarrayOr3171View;assert.doesNotMatch(html,/undefined|NaN|Infinity|<p>/);assert.ok(html.includes(`data-method="${method}"`));if(v.bestWindow)assert.ok(html.includes(`data-best="${v.best}"`));if(v.counts)for(let bit=0;bit<v.counts.length;bit++)assert.ok(html.includes(`data-count-bit="${bit}" data-count="${v.counts[bit]}"`));if(v.tree)assert.equal((html.match(/data-segment-node=/g)||[]).length,v.tree.length-1);}
 for(const step of run.steps.filter(s=>s.subarrayOr3171View.event==='evaluate')){renderer.render(step);assert.ok(host.innerHTML.includes(`data-bit-row="=" data-bit-value="${step.subarrayOr3171View.candidate.value}"`));}
 renderer.render(run.steps[0]);const first=host.innerHTML;renderer.render(run.steps.at(-1));renderer.render(run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run),before);}
});
