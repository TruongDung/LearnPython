'use strict';
const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED,base1570=require('../problems/sparse-vector')[1570];
const build=(id,m,input,params={})=>p[id][m===1?'builder':'builder'+m](input,{...params,approach:m});
const rotations=nums=>nums.map((_,k)=>nums.reduce((sum,value,i)=>sum+((i+k)%nums.length)*value,0));
function andOracle(arr,target){let best=Infinity;for(let left=0;left<arr.length;left++){let value=arr[left];for(let right=left;right<arr.length;right++){value&=arr[right];best=Math.min(best,Math.abs(value-target));}}return best;}
function andRange(arr,l,r){return arr.slice(l,r+1).reduce((a,b)=>a&b);}
const vectorInput=(a,b)=>a.join(',')+'|'+b.join(','),dot=(a,b)=>a.reduce((total,value,i)=>total+value*b[i],0);
const python=(source,payload)=>{const r=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify(payload),encoding:'utf8',maxBuffer:64*1024*1024});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);};
test('396/1521 expose two approaches and 1570 preserves all five original SparseVector class implementations',()=>{
 for(const[id,count]of[[396,2],[1521,2],[1570,5]]){assert.equal(p[id].debugMode,'line-by-line');assert.equal(p[id].extraParams.find(x=>x.key==='approach').options.length,count);}
 for(let m=1;m<=5;m++){const key='code'+(m===1?'':m);assert.deepEqual(p[1570][key].slice(0,base1570[key].length),base1570[key]);}
 assert.deepEqual(p[1570].liveArgs('1,0,-2|3,4,5'),[[1,0,-2],[3,4,5]]);
});
test('all nine displayed Python algorithms match independent definitions on random rotations, bitwise subarrays and sparse dot products',()=>{
 let seed=396;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
 const rotateCases=[[4,3,2,6],[-2,-3,-1],[100],[0,0],[5,5,5]],andCases=[[[9,12,3,7,15],5],[[1,2,4,8,16],0],[[1000000,1000000,1000000],1],[[7,7,7],6]],vectorCases=[[[0,0],[0,0]],[[1,0,2],[0,3,4]],[[-2,0,3],[4,0,-5]],[[1],[0]],[[0],[1]]];
 for(let i=0;i<100;i++){rotateCases.push(Array.from({length:1+rand(10)},()=>rand(201)-100));andCases.push([Array.from({length:1+rand(10)},()=>1+rand(1e6)),rand(1e7+1)]);const n=1+rand(12);vectorCases.push([Array.from({length:n},()=>rand(3)?0:rand(15)-7),Array.from({length:n},()=>rand(3)?0:rand(15)-7)]);}
 const items=[];for(const[id,count,method,cases]of[[396,2,'maxRotateFunction',rotateCases.map(a=>[a])],[1521,2,'closestToTarget',andCases],[1570,5,'run',vectorCases]])for(let m=1;m<=count;m++)items.push({id,m,method,cases,code:p[id]['code'+(m===1?'':m)].join('\n')});
 const result=python(`import json,sys
p=json.load(sys.stdin)
out=[]
for item in p:
    scope={}
    exec(item['code'],scope)
    out.append([getattr(scope['Solution'](),item['method'])(*args) for args in item['cases']])
print(json.dumps(out))`,items);
 items.forEach((item,i)=>{const expected=item.id===396?rotateCases.map(a=>Math.max(...rotations(a))):item.id===1521?andCases.map(([a,t])=>andOracle(a,t)):vectorCases.map(([a,b])=>dot(a,b));assert.deepEqual(result[i],expected);});
 for(const a of rotateCases.slice(0,25))for(const m of[1,2])assert.equal(build(396,m,a).answer,Math.max(...rotations(a)));
 for(const[a,t]of andCases.slice(0,25))for(const m of[1,2])assert.equal(build(1521,m,a,{target:t}).answer,andOracle(a,t));
 for(const[a,b]of vectorCases.slice(0,20))for(let m=1;m<=5;m++)assert.equal(build(1570,m,vectorInput(a,b)).answer,dot(a,b));
});
test('every native CPython line and watched local matches replay across all nine approaches',()=>{
 const items=[];for(const[id,count,method,args]of[[396,2,'maxRotateFunction',[[4,3,2,6]]],[1521,2,'closestToTarget',[[9,12,3,7,15],5]],[1570,5,'run',[[1,0,0,2,3],[0,3,0,4,0]]]])for(let m=1;m<=count;m++)items.push({id,m,method,args,code:p[id]['code'+(m===1?'':m)].join('\n'),stateClasses:id===1570?['SparseVector']:[],objectClasses:id===1570?['SparseVector']:[]});
 const native=python(`import json,sys,runpy
p=json.load(sys.stdin)
trace=runpy.run_path(p['path'])['picture_trace']
print(json.dumps([json.loads(trace(item)) for item in p['items']]))`,{path:require.resolve('../problems/picture-trace.py'),items});
 native.forEach((n,i)=>{const item=items[i],input=item.id===1570?vectorInput(...item.args):item.args[0],run=build(item.id,item.m,input,item.id===1521?{target:item.args[1]}:{});assert.equal(run.answer,n.answer);assert.equal(run.steps.length,n.events.length);const states=[{},{}];n.events.forEach((event,j)=>{const s=run.steps[j],v=s.numericPicture;assert.deepEqual(s.codeLines,[event.line]);assert.equal(s.codeBlock,item.m);s.vars.forEach(w=>assert.deepEqual(w.value,event.locals[w.name]??'—'));
  if(item.id===1521){assert.deepEqual(v.previous,event.locals.previous?.__pairs__??[]);assert.deepEqual(v.current,event.locals.current?.__pairs__??[]);}
  if(item.id===1570){if(event.scope==='__init__'&&event.locals.self)states[Object.hasOwn(event.outer,'left')?1:0]=event.locals.self;if(event.scope==='dotProduct'&&event.locals.self)states[0]=event.locals.self;
   const entries=state=>item.m===1?(state.nums??[]).map((v,i)=>[i,v]):item.m<=3?(state[item.m===2?'nums':'values']?.__pairs__??[]):state.pairs??[];assert.deepEqual(v.storage,states.map(entries));
  }
 });});
});
test('396 shows clockwise identities, exact partial sums, recurrence operands and the first maximizing rotation, including all-negative inputs',()=>{
 for(const nums of[[4,3,2,6],[-2,-3,-1],[100],[0,0],[5,5,5]])for(const m of[1,2]){const before=JSON.stringify(nums),scores=rotations(nums),run=build(396,m,nums);assert.equal(JSON.stringify(nums),before);
  for(const s of run.steps){const v=s.numericPicture;assert.deepEqual(v.values,v.ids.map(id=>nums[id]));assert.deepEqual(v.ids,nums.map((_,i)=>(i-v.k+nums.length)%nums.length));if(v.current!==null)assert.equal(v.current,v.values.slice(0,v.done).reduce((a,b,i)=>a+i*b,0));for(const h of v.history){assert.equal(h.value,scores[h.k]);assert.equal(run.steps[h.step].numericPicture.current,h.value);}
   if(v.transition){const q=v.transition;assert.equal(q.before,scores[q.k-1]);assert.equal(q.total,nums.reduce((a,b)=>a+b,0));if(q.moved!==null)assert.equal(q.moved,nums[nums.length-q.k]);if(q.after!==null)assert.equal(q.after,q.before+q.total-nums.length*q.moved);}
   if(v.winner!==null)assert.equal(scores[v.winner],v.best);
  }const v=run.steps.at(-1).numericPicture;assert.equal(v.history.length,nums.length);assert.equal(v.winner,scores.indexOf(Math.max(...scores)));
 }
});
test('1521 AND operations, deduplication, actual distance checks and winning subarray witnesses obey every bit',()=>{
 let duplicates=0,zeros=0;
 for(const[arr,target]of[[[9,12,3,7,15],5],[[7,7,7],6],[[1,2,4,8,16],0],[[1000000],10000000]])for(const m of[1,2]){const before=JSON.stringify(arr),run=build(1521,m,arr,{target});assert.equal(JSON.stringify(arr),before);
  for(const s of run.steps){const v=s.numericPicture;if(v.operation?.result!==null&&v.operation){assert.equal(v.operation.result,v.operation.a&v.operation.b);assert.equal((v.operation.result|v.operation.a),v.operation.a);if(v.operation.result===0)zeros++;}
   if(v.event==='deduplicate'){assert.ok(v.operation.duplicate);assert.equal(new Set(v.current.map(([value])=>value)).size,v.current.length);duplicates++;}
   if(v.probe){assert.equal(v.probe.value,andRange(arr,v.probe.left,v.probe.right));assert.equal(v.probe.difference,Math.abs(v.probe.value-target));}
   if(v.winner){assert.equal(v.winner.value,andRange(arr,v.winner.left,v.winner.right));assert.equal(v.winner.difference,v.best);}
  }
 }assert.ok(duplicates&&zeros);
});
test('1570 stores only real constructor entries, adds only true same-index products, and follows each binary search range',()=>{
 for(const[a,b]of[[[1,0,0,2,3],[0,3,0,4,0]],[[0,0],[0,0]],[[-2,0,3],[4,0,-5]],[[1,0,2,0],[0,3,0,4]]])for(let m=1;m<=5;m++){
  const run=build(1570,m,vectorInput(a,b));let previousTotal=0;
  for(const s of run.steps){const v=s.numericPicture;if(m!==1)for(const entries of v.storage)assert.ok(entries.every(([,value])=>value!==0));if(v.product){assert.equal(v.product.a,v.product.b);assert.equal(v.product.left,a[v.product.a]);assert.equal(v.product.right,b[v.product.b]);assert.equal(v.product.value,v.product.left*v.product.right);}
   if(v.event==='add'){assert.equal(v.total,previousTotal+v.product.value);assert.equal(run.steps[v.product.step].numericPicture.event,'add');}
   if(v.total!==null)previousTotal=v.total;
   if(v.range){assert.ok(v.range[0]>=0);assert.ok(v.range[1]<v.storage[1].length);}
  }assert.equal(run.answer,dot(a,b));assert.equal(run.steps.at(-1).numericPicture.history.reduce((sum,h)=>sum+h.value,0),run.answer);
 }
});
test('every renderer frame in both languages preserves actual cells and rewind state',()=>{
 const host={innerHTML:''},context={lang:'vi',$:()=>host,escapeHtml:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-numerical-pictures.js'),'utf8'),context);
 for(const lang of['vi','en'])for(const[id,count]of[[396,2],[1521,2],[1570,5]])for(let m=1;m<=count;m++){context.lang=lang;const run=build(id,m,p[id].defaultInput),before=JSON.stringify(run);context.steps=run.steps;for(const[index,s]of run.steps.entries()){context.stepIndex=index;context.renderNumericPicture(s);const v=s.numericPicture;assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);if(id===396)assert.equal((host.innerHTML.match(/data-np-weight=/g)||[]).length,v.nums.length);if(id===1521)assert.equal((host.innerHTML.match(/data-np-arr=/g)||[]).length,v.arr.length);if(id===1570){assert.equal((host.innerHTML.match(/data-np-dense=/g)||[]).length,v.dense[0].length*2);assert.equal((host.innerHTML.match(/data-np-entry=/g)||[]).length,v.storage.flat().length);}assert.equal((host.innerHTML.match(/data-np-method=/g)||[]).length,count);}
  context.stepIndex=0;context.renderNumericPicture(run.steps[0]);const first=host.innerHTML;context.stepIndex=run.steps.length-1;context.renderNumericPicture(run.steps.at(-1));context.stepIndex=0;context.renderNumericPicture(run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run),before);
 }
});
test('maximum visual inputs retain complete answers and input validation enforces numeric boundaries',()=>{
 for(const m of[1,2]){const a=Array.from({length:20},(_,i)=>i-10);assert.equal(build(396,m,a).answer,Math.max(...rotations(a)));const b=Array.from({length:20},(_,i)=>1e6-i);assert.equal(build(1521,m,b,{target:1e7}).answer,andOracle(b,1e7));}
 for(let m=1;m<=5;m++){const a=Array(24).fill(1e6);assert.equal(build(1570,m,vectorInput(a,a)).answer,24e12);}
 for(const a of[[],[101],[-101],[1.5],Array(21).fill(1)])assert.throws(()=>build(396,1,a));for(const a of[[],[0],[1000001],[true],Array(21).fill(1)])assert.throws(()=>build(1521,1,a));for(const target of['',true,-1,10000001,1.1])assert.throws(()=>build(1521,1,[1],{target}));for(const input of['1,2|1','1,|1,2','1000001|1','1.5|2'])assert.throws(()=>build(1570,1,input));
});
