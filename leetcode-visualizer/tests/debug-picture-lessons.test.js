'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const problems=require('../problems').SUPPORTED;
const wheel=require.resolve('../public/vendor/sortedcontainers-2.4.0-py2.py3-none-any.whl');
const pythonEnv={...process.env,PYTHONPATH:[wheel,process.env.PYTHONPATH].filter(Boolean).join(require('node:path').delimiter)};
const build=(id,m,input,params={})=>problems[id][`builder${m===1?'':m}`](input,params);
function triplet(nums){let answer=0;for(let i=0;i<nums.length;i++)for(let j=i+1;j<nums.length;j++)for(let k=j+1;k<nums.length;k++)answer=Math.max(answer,(nums[i]-nums[j])*nums[k]);return answer;}
function manager(config){const tasks=new Map(config.tasks.map(([u,id,p])=>[id,[u,p]])),out=[null];for(const[action,...args]of config.ops){let result=null;if(action==='add')tasks.set(args[1],[args[0],args[2]]);else if(action==='edit')tasks.get(args[0])[1]=args[1];else if(action==='rmv')tasks.delete(args[0]);else{const top=[...tasks].sort((a,b)=>b[1][1]-a[1][1]||b[0]-a[0])[0];result=top?top[1][0]:-1;if(top)tasks.delete(top[0]);}out.push(result);}return out;}
const configs=[JSON.parse(problems[3408].defaultInput),{tasks:[[9,1,7],[2,8,7]],ops:[['execTop'],['execTop'],['execTop']]},{tasks:[[1,0,9]],ops:[['edit',0,2],['rmv',0],['add',7,0,2],['execTop'],['execTop']]},{tasks:[[0,0,0]],ops:[['execTop'],['add',9,0,0],['execTop'],['execTop']]},{tasks:[],ops:[['execTop']]}];
test('2873 three methods and 3408 two methods match independent randomized oracles',()=>{
 const arrays=[[12,6,1,2,7],[1,10,3,4,19],[1,2,3],[3,3,3],[1e6,1,1e6]];let seed=2873;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};for(let sample=0;sample<100;sample++)arrays.push(Array.from({length:3+rand(12)},()=>1+rand(1e6)));
 const allConfigs=[...configs];for(let sample=0;sample<100;sample++){const tasks=[[rand(10),0,rand(8)],[rand(10),1,rand(8)]],config={tasks,ops:[]},state=new Map(tasks.map(([u,id,p])=>[id,[u,p]]));for(let i=0;i<12;i++){const ids=[...state.keys()],action=rand(4);if(!ids.length||action===0){const id=Array.from({length:15},(_,i)=>i).find(id=>!state.has(id)),u=rand(10),p=rand(8);config.ops.push(['add',u,id,p]);state.set(id,[u,p]);}else if(action===1){const id=ids[rand(ids.length)],p=rand(8);config.ops.push(['edit',id,p]);state.get(id)[1]=p;}else if(action===2){const id=ids[rand(ids.length)];config.ops.push(['rmv',id]);state.delete(id);}else{config.ops.push(['execTop']);const top=[...state].sort((a,b)=>b[1][1]-a[1][1]||b[0]-a[0])[0];if(top)state.delete(top[0]);}}allConfigs.push(config);}
 const source=`import json,sys
p=json.load(sys.stdin)
out=[]
for item in p:
    results=[]
    for code in item['codes']:
        scope={}
        exec(code,scope)
        results.append([getattr(scope['Solution'](),item['method'])(case) for case in item['cases']])
    out.append(results)
print(json.dumps(out))`;
 const payload=[{method:'maximumTripletValue',cases:arrays,codes:Array.from({length:3},(_,i)=>problems[2873][`code${i?i+1:''}`].join('\n'))},{method:'run',cases:allConfigs,codes:Array.from({length:2},(_,i)=>problems[3408][`code${i?i+1:''}`].join('\n'))}];const proc=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify(payload),encoding:'utf8',env:pythonEnv});assert.equal(proc.status,0,proc.stderr);const result=JSON.parse(proc.stdout);result[0].forEach(r=>assert.deepEqual(r,arrays.map(triplet)));result[1].forEach(r=>assert.deepEqual(r,allConfigs.map(manager)));
});
test('2873 trials and best triplets keep distinct ordered indices and exact products',()=>{
 for(let m=1;m<=3;m++)for(const nums of[[12,6,1,2,7],[1,10,3,4,19],[1,2,3],[3,3,3],[1e6,1,1e6]]){const before=JSON.stringify(nums),run=build(2873,m,nums);assert.equal(run.answer,triplet(nums));assert.equal(JSON.stringify(nums),before);for(const step of run.steps){const v=step.orderedTriplet2873View;assert.deepEqual(step.codeLines,[v.line]);assert.equal(step.codeBlock,m);if(v.trial){const[i,j,k]=v.trial.ids;assert.ok(i<j&&j<k);assert.equal(v.trial.value,(nums[i]-nums[j])*nums[k]);}if(v.best){const[i,j,k]=v.best;assert.ok(i<j&&j<k);assert.equal(v.bestValue,(nums[i]-nums[j])*nums[k]);assert.ok(v.bestValue<=v.answer);if(v.final||v.source.startsWith('best = ['))assert.equal(v.bestValue,v.answer);}}}
});
test('3408 has exactly two requested sources and bundles the real SortedContainers package',()=>{
 const p=problems[3408];assert.deepEqual(p.extraParams[0].options.map(o=>o.value),[1,2]);
 for(let m=3;m<=7;m++){assert.equal(p['code'+m],undefined);assert.equal(p['builder'+m],undefined);}
 assert.match(p.code.join('\n'),/heapify\(self.heap\)/);assert.match(p.code.join('\n'),/self.tasks\[taskId\] == \(userId, priority\)/);
 assert.match(p.code2.join('\n'),/from sortedcontainers import SortedList/);assert.match(p.code2.join('\n'),/self.sorted_tasks = SortedList\(\)/);
 assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(wheel)).digest('hex'),'a163dcaede0f1c021485e957a39245190e74249897e2ae4b2aa38595db237ee0');
 assert.ok(JSON.parse(fs.readFileSync(require.resolve('../vercel.json'),'utf8')).functions['server.js'].includeFiles.includes('public/vendor/sortedcontainers-2.4.0-py2.py3-none-any.whl'));
});
test('3408 captures heapify, stale user/priority tuples, real SortedList mutations and zero IDs',()=>{
 let stale=0,userMismatch=0,removal=0,heapify=0;
 for(let m=1;m<=2;m++)for(const config of configs){
  const before=JSON.stringify(config),run=build(3408,m,config);assert.deepEqual(run.answer,manager(config));assert.equal(JSON.stringify(config),before);
  for(const step of run.steps){const v=step.taskManager3408View;assert.deepEqual(step.codeLines,[v.line]);assert.equal(step.codeBlock,m);
   for(const e of v.heap){const task=v.tasks.find(t=>t.taskId===e.taskId);assert.equal(e.userId,e.key[2]);assert.equal(e.stale,!task||e.userId!==task.userId||e.priority!==task.priority);if(e.stale)stale++;if(task&&e.userId!==task.userId&&e.priority===task.priority){assert.equal(e.stale,true);userMismatch++;}}
   if(m===1&&v.source==='heapify(self.heap)'){assert.equal(v.heapReady,true);for(let i=1;i<v.heap.length;i++){const a=v.heap[Math.floor((i-1)/2)].key,b=v.heap[i].key;assert.ok(a[0]<b[0]||a[0]===b[0]&&(a[1]<b[1]||a[1]===b[1]&&a[2]<=b[2]));}heapify++;}
   if(m===1&&v.scope==='__init__'&&v.source.startsWith('self.heap.append'))assert.equal(v.heapReady,false);
   if(m===2){assert.deepEqual(v.heap,[]);assert.deepEqual(v.order,[...v.order].sort((a,b)=>a[0]-b[0]||a[1]-b[1]));if(v.source==='self.sorted_tasks.remove((oldPriority, taskId))'){const task=v.tasks.find(t=>t.taskId===step.vars.find(w=>w.name==='taskId').value);assert.ok(task);assert.ok(!v.order.some(e=>e[1]===task.taskId));removal++;}}
  }assert.deepEqual(run.steps.at(-1).taskManager3408View.answer,run.answer);
 }assert.ok(stale>0);assert.ok(userMismatch>0);assert.ok(removal>0);assert.ok(heapify>0);
});
test('native Python confirms every line, scope, watch and TaskManager attribute for all 12 approaches',()=>{
 const payload=[];for(const[id,count,method,args]of[[621,7,'leastInterval',[[...'AAABBB'],2]],[2873,3,'maximumTripletValue',[[12,6,1,2,7]]],[3408,2,'run',[configs[0]]]])for(let m=1;m<=count;m++)payload.push({id,m,code:problems[id][`code${m===1?'':m}`].join('\n'),method,args,stateClasses:id===3408?['TaskManager']:[],sequenceClasses:id===3408?['SortedList']:[]});
 const source=`import json,sys,runpy
p=json.load(sys.stdin)
trace=runpy.run_path(p['path'])['picture_trace']
print(json.dumps([json.loads(trace(item))['events'] for item in p['items']]))`;
 const proc=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items:payload}),encoding:'utf8',env:pythonEnv,maxBuffer:32*1024*1024});assert.equal(proc.status,0,proc.stderr);
 JSON.parse(proc.stdout).forEach((events,i)=>{const item=payload[i],run=build(item.id,item.m,item.args[0],{n:2});assert.equal(events.length,run.steps.length);let state={};events.forEach((event,j)=>{const s=run.steps[j],v=s[{621:'scheduler621View',2873:'orderedTriplet2873View',3408:'taskManager3408View'}[item.id]];assert.equal(v.line,event.line);if(item.id===3408){assert.equal(v.scope,event.scope);if(event.locals.self)state=event.locals.self;assert.deepEqual(v.tasks,(state.tasks?.__pairs__??[]).map(([taskId,[userId,priority]])=>({taskId,userId,priority})));assert.deepEqual(v.heap.map(e=>e.key),state.heap??[]);assert.deepEqual(v.order,state.sorted_tasks??[]);}const context={...event.outer,...event.locals};s.vars.forEach(w=>assert.deepEqual(w.value,context[w.name]??'—'));});});
});
test('renderers draw the exact schedule, arrays, tasks and heap, support both languages, and preserve replay',()=>{
 const host={innerHTML:'',clientWidth:600},context={lang:'vi',$:()=>host,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),document:{documentElement:{dataset:{theme:'light'}}}};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-debug-picture-lessons.js'),'utf8'),context);
 for(const language of['vi','en']){context.lang=language;for(const[id,count,key,renderer,input,params]of[[621,7,'scheduler621View','renderScheduler621View','AAABBB',{n:2}],[2873,3,'orderedTriplet2873View','renderOrderedTriplet2873View',[12,6,1,2,7],{}],[3408,2,'taskManager3408View','renderTaskManager3408View',configs[0],{}]])for(let m=1;m<=count;m++){const run=build(id,m,input,params),before=JSON.stringify(run);for(const s of run.steps){const v=s[key];context[renderer](s);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);assert.match(host.innerHTML,/pd-viz/);if(id===621)assert.equal((host.innerHTML.match(/class="sc621-slot/g)||[]).length,v.schedule.length);if(id===2873)assert.equal((host.innerHTML.match(/data-num-index=/g)||[]).length,v.nums.length);if(id===3408){assert.equal((host.innerHTML.match(/data-task-id=/g)||[]).length,v.tasks.length);assert.equal((host.innerHTML.match(/data-manager-heap-index=/g)||[]).length,v.heap.length);assert.equal((host.innerHTML.match(/data-manager-sorted-task=/g)||[]).length,v.order.length);assert.equal((host.innerHTML.match(/data-pd-method=/g)||[]).length,2);}}context[renderer](run.steps[0]);const first=host.innerHTML;context[renderer](run.steps.at(-1));context[renderer](run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run),before);}}
});
test('2873 and 3408 validate values and reject invalid design operations after execution',()=>{for(const input of[[1,2],[1,0,3],[1,2,1000001]])assert.throws(()=>build(2873,1,input));for(const config of[{tasks:[[1,1,2],[2,1,3]],ops:[]},{tasks:[[1,1,2]],ops:[['execTop'],['edit',1,9]]},{tasks:[[1,1,2]],ops:[['add',9,1,1]]},{tasks:[],ops:[['edit',1,2]]}])assert.throws(()=>build(3408,1,config));});
