'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[3181];
const build=(method,input=p.defaultInput)=>p[method===1?'builder':'builder'+method](input);
function oracle(input){let best=0;function visit(mask,total){best=Math.max(best,total);for(let i=0;i<input.length;i++)if(!(mask>>i&1)&&total<input[i])visit(mask|1<<i,total+input[i]);}visit(0,0);return best;}
function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);Object.values(value).forEach(freeze);}return value;}
test('3181 all five approaches agree with exhaustive original-index choices, including strict equality and duplicates',()=>{
 const cases=[[1],[12],[2,2],[1,1,3,3],[1,6,4,3,2],[1,2,4,8],[2,3,4,5],[3,1,2,12,6,6],[1,2,3,4,5,6,7,8]];let seed=3181;for(let i=0;i<10;i++)cases.push(Array.from({length:1+i%6},()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return 1+seed%12;}));
 for(const input of cases){const expected=oracle(input);for(let method=1;method<=5;method++){const original=[...input],run=build(method,input),v=run.steps.at(-1).rewardFive3181View;assert.equal(run.answer,expected);assert.deepEqual(input,original);assert.equal(v.answer,expected);let total=0;for(const reward of v.witness){assert.ok(total<reward);assert.ok(input.includes(reward));total+=reward;}assert.equal(total,expected);assert.equal(new Set(v.witness).size,v.witness.length);}}
});
test('3181 native cache hits do not enter DFS again and only completed calls fill memo',()=>{
 const run=build(2),written=new Map();let hits=0;
 for(let i=0;i<run.steps.length;i++){const v=run.steps[i].rewardFive3181View;if(v.phase==='return'){const key=v.active.join(':');assert.ok(!written.has(key));written.set(key,v.result);}
  for(let row=0;row<v.memo.length;row++)for(let total=0;total<v.M;total++)assert.equal(v.memo[row][total],written.get(row+':'+total)??null);
  if(v.cacheHit){const previous=run.steps[i-1].rewardFive3181View;hits++;assert.ok(previous.pending?.cached);assert.equal(v.stack.length,previous.stack.length);assert.equal(v.calls.length,previous.calls.length);assert.equal(v.cacheHit.value,written.get(v.cacheHit.cell.join(':')));}
  assert.equal(v.cacheHits,hits);if(v.pending)assert.equal(v.execution.timing,'before');
 }
 assert.ok(hits>0);assert.ok(run.steps.at(-1).rewardFive3181View.calls.length<build(1).steps.at(-1).rewardFive3181View.calls.length);
});
test('3181 table, rolling row and bit operations reveal exactly their executed assignments',()=>{
 for(let method=1;method<=5;method++)for(const step of build(method).steps){const v=step.rewardFive3181View,code=p[method===1?'code':'code'+method];assert.equal(v.source,code[v.line-1].trim());assert.deepEqual(step.codeLines,[v.line]);assert.equal(step.codeBlock,method);assert.equal(v.trace.truncated,false);if(!v.final)assert.equal(v.answer,null);
  if(method===3&&v.phase==='write'){assert.equal(v.result,v.skip||v.take);assert.equal(v.dp[v.active[0]][v.active[1]],v.result);for(const dep of v.neighbors){assert.equal(dep.cell[0],v.active[0]-1);if(dep.role==='take')assert.ok(dep.cell[1]<v.reward);}}
  if(method===4&&v.phase==='write'){assert.equal(v.neighbors[0].value,true);assert.ok(v.neighbors[0].cell[1]<v.reward);assert.equal(v.active[1],v.neighbors[0].cell[1]+v.reward);}
  if(method===5){if(v.phase==='mask')assert.equal(v.eligible,v.beforeBits&(2**v.reward-1));if(v.phase==='shift')assert.equal(v.shifted,v.eligible*2**v.reward);if(v.phase==='merge')assert.equal(v.bits,v.beforeBits|v.shifted);}
 }
});
test('3181 every recorded frame renders immutably in VI/EN with the appropriate state structure',()=>{
 const host={innerHTML:'',dataset:{},querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang:'vi',$:()=>host};vm.createContext(ctx);for(const file of ['renderer-dp-table-lessons.js','renderer-reward-five-3181.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);
 for(let method=1;method<=5;method++){const run=freeze(build(method)),before=JSON.stringify(run);ctx.steps=run.steps;for(const lang of ['vi','en']){ctx.lang=lang;run.steps.forEach((step,i)=>{ctx.stepIndex=i;ctx.renderRewardFive3181(step);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);assert.match(host.innerHTML,new RegExp('data-rf-method="'+method+'"'));if(method===2||method===3){const dp=method===2?step.rewardFive3181View.memo:step.rewardFive3181View.dp,values=Array.from(host.innerHTML.matchAll(/data-dtp-value="([^"]*)"/g),m=>m[1]);assert.deepEqual(values,dp?dp.flat().map(String):[]);}});}assert.equal(JSON.stringify(run),before);}
});
test('3181 saved snippets run independently; bitset handles official input size, and metadata lists all five complexities',()=>{
 const payload=[];for(let method=1;method<=5;method++){const suffix=['','dfs','memo','dp2d','dp1d','bitset'][method],saved=fs.readFileSync(require.resolve('../../Leetcode-sln/dynamic-programming/Leetcode_3181_'+suffix+'.py'),'utf8');assert.equal(saved.trim(),p[method===1?'code':'code'+method].join('\n'));payload.push(saved);}
 const py=spawnSync('python3',['-c',"import sys,json\np=json.load(sys.stdin)\nfor code in p:\n ns={};exec(code,ns);assert ns['Solution']().maxTotalReward([1,6,4,3,2])==11\nns={};exec(p[4],ns);assert ns['Solution']().maxTotalReward(list(range(1,50001)))==99999\nprint('ok')"],{input:JSON.stringify(payload),encoding:'utf8'});assert.equal(py.status,0,py.stderr);
 assert.deepEqual(p.extraParams[0].options.map(option=>option.value),[1,2,3,4,5]);assert.equal(p.extraParams[0].default,5);assert.equal(p.complexity3.space,'O(nM)');assert.equal(p.complexity4.space,'O(M)');assert.equal(p.complexity5.space,'O(M / w)*');
 for(const input of [[],[0],[-1],[13],[1.5],Array(9).fill(1),null])for(let method=1;method<=5;method++)assert.throws(()=>build(method,input),/3181/);
});
