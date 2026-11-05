'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../problems').SUPPORTED[3505],methods=require('../problems/equal-subarrays-3505-methods');
const build=(m,nums,x,k)=>p[`builder${m===1?'':m}`](nums,{x,k});
const fixtures=[{nums:[5,-2,1,3,7,3,6,4,-1],x:3,k:2},{nums:[0,4,4,4,4,8],x:3,k:2},{nums:[2,2,2,2,2,2],x:2,k:3},{nums:[9,-2,-2,-2,1,5],x:2,k:2},{nums:[-1000000,1000000],x:2,k:1},{nums:[3,-2,8,8,1,9],x:6,k:1}];
function windowCosts(nums,x){return Array.from({length:nums.length-x+1},(_,start)=>Math.min(...nums.slice(start,start+x).map(target=>nums.slice(start,start+x).reduce((sum,value)=>sum+Math.abs(value-target),0))));}
function oracle(nums,x,k){const costs=windowCosts(nums,x);function choose(start,left){if(!left)return 0;let best=Infinity;for(let i=start;i<=nums.length-left*x;i++)best=Math.min(best,costs[i]+choose(i+x,left-1));return best;}return choose(0,k);}
test('3505 registers all seven complete approaches, typed negative inputs and feasible x/k bounds',()=>{
 assert.equal(p.debugMode,'line-by-line');assert.equal(p.extraParams.find(e=>e.key==='approach').options.length,7);assert.deepEqual(p.liveArgs('[-3,0,4,4]',{x:2,k:2}),[[-3,0,4,4],2,2]);
 for(const[nums,x,k]of[[[],2,1],[[1],2,1],[[1,2],1,1],[[1,2],2,2],[[1,2],2,0],[[1,2],2.5,1],[[1,1000001],2,1],['1,,2',2,1],[Array(19).fill(1),2,1]])for(let m=1;m<=7;m++)assert.throws(()=>build(m,nums,x,k),/3505/);
});
test('all seven displayed Python sources match exhaustive disjoint-window selection across duplicates, negatives and random inputs',()=>{
 const cases=[...fixtures];let seed=3505;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
 for(let sample=0;sample<220;sample++){const n=2+random(13),x=2+random(n-1),k=1+random(Math.floor(n/x)),nums=Array.from({length:n},()=>random(4)===0?random(2)?1000000:-1000000:random(21)-10);cases.push({nums,x,k});}
 const source=`import json,sys
p=json.load(sys.stdin)
out=[]
for code in p['codes']:
    scope={}
    exec(code,scope)
    out.append([scope['Solution']().minOperations(case['nums'],case['x'],case['k']) for case in p['cases']])
print(json.dumps(out))`;
 const proc=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify({codes:methods.map(m=>m.code.join('\n')),cases}),encoding:'utf8'});assert.equal(proc.status,0,proc.stderr);const expected=cases.map(c=>oracle(c.nums,c.x,c.k));JSON.parse(proc.stdout).forEach((actual,i)=>assert.deepEqual(actual,expected,`approach ${i+1}`));
});
test('3505 source-derived frames distinguish pending costs and DP cells, and final certificates select exactly k disjoint windows',()=>{
 for(let m=1;m<=7;m++)for(const f of fixtures){const before=JSON.stringify(f),run=build(m,f.nums,f.x,f.k),expected=oracle(f.nums,f.x,f.k),costs=windowCosts(f.nums,f.x);assert.equal(run.answer,expected);assert.equal(JSON.stringify(f),before);assert.equal(run.steps.filter(s=>s.final).length,1);
  for(const s of run.steps){const v=s.equalSubarrays3505View;assert.deepEqual(s.codeLines,[v.line]);assert.equal(s.codeBlock,m);assert.equal(v.source,methods[m-1].code[v.line-1].trim());if(v.cost)v.cost.forEach((cost,i)=>{if(cost!==null)assert.equal(cost,costs[i]);});if(v.median!==null&&v.start!==null){const sorted=f.nums.slice(v.start,v.start+f.x).sort((a,b)=>a-b);assert.equal(v.median,sorted[Math.floor((f.x-1)/2)]);}
   for(const key of v.written){const[i,j]=key.split(',').map(Number);assert.ok(v.dp?.[i]?.[j]!==undefined);}
   if(v.decision?.result!==null&&v.decision?.result!==undefined){const d=v.decision,number=a=>a==='∞'?Infinity:a;assert.equal(number(d.result),Math.min(number(d.skip),number(d.take)));}
   if(!v.final)assert.equal(v.certificate,null);
  }
  const v=run.steps.at(-1).equalSubarrays3505View,c=v.certificate;assert.equal(c.total,run.answer);assert.equal(c.groups.length,f.k);let last=-1;
  for(const group of c.groups){assert.ok(group.start>last);assert.equal(group.end-group.start+1,f.x);assert.equal(group.cost,costs[group.start]);last=group.end;for(let i=group.start;i<=group.end;i++)assert.equal(c.after[i],group.median);}
  assert.equal(c.after.reduce((sum,value,i)=>sum+Math.abs(value-f.nums[i]),0),expected);
 }
});
test('native CPython confirms every completed statement, helper scope, heap/Fenwick array and watched local in all methods',()=>{
 const f=fixtures[0],items=methods.map(m=>({code:m.code.join('\n'),method:'minOperations',args:[f.nums,f.x,f.k]}));
 const source=`import json,sys,runpy
p=json.load(sys.stdin)
trace=runpy.run_path(p['path'])['picture_trace']
print(json.dumps([json.loads(trace(item))['events'] for item in p['items']]))`;
 const proc=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:64*1024*1024});assert.equal(proc.status,0,proc.stderr);
 JSON.parse(proc.stdout).forEach((events,i)=>{const run=build(i+1,f.nums,f.x,f.k);assert.equal(events.length,run.steps.length);events.forEach((event,j)=>{const s=run.steps[j],v=s.equalSubarrays3505View,r=event.outer,context={...r,...event.locals};assert.equal(v.line,event.line);assert.equal(v.scope,event.scope);for(const watch of s.vars)assert.deepEqual(watch.value,context[watch.name]??'—');assert.deepEqual(v.cost,r.cost??null);assert.deepEqual(v.dp,r.dp??null);assert.deepEqual(v.prev,r.prev??null);assert.deepEqual(v.curr,r.curr??null);assert.deepEqual(v.low,r.low??null);assert.deepEqual(v.high,r.high??null);assert.deepEqual(v.bitCount,r.bit_count??null);assert.deepEqual(v.bitSum,r.bit_sum??null);});});
});
test('3505 diagrams preserve replay, use real source values and render zero cost correctly in both languages',()=>{
 const host={innerHTML:''},ctx={lang:'vi',$:()=>host,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;')};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-equal-subarrays-3505.js'),'utf8'),ctx);
 for(const language of['vi','en']){ctx.lang=language;for(let m=1;m<=7;m++)for(const f of[fixtures[0],fixtures[2],fixtures[4]]){const run=build(m,f.nums,f.x,f.k),before=JSON.stringify(run);for(const s of run.steps){const v=s.equalSubarrays3505View;ctx.renderEqualSubarrays3505View(s);const html=host.innerHTML;assert.doesNotMatch(html,/undefined|NaN|Infinity|<p>/);assert.match(html,/es3505-viz/);assert.deepEqual([...html.matchAll(/data-window-cost="(pending|\d+)"/g)].map(match=>match[1]==='pending'?null:Number(match[1])),v.cost??[]);
  for(const match of html.matchAll(/data-dp-i="(\d+)" data-dp-j="(\d+)" data-dp-value="([^"]+)"/g))assert.equal(match[3],String(v.dp[Number(match[1])][Number(match[2])]));
  if(v.final)assert.ok(html.includes(`data-equal-answer="${run.answer}"`));
 }ctx.renderEqualSubarrays3505View(run.steps[0]);const first=host.innerHTML;ctx.renderEqualSubarrays3505View(run.steps.at(-1));ctx.renderEqualSubarrays3505View(run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run),before);}}
});
