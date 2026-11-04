'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test'),{spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[621],methods=require('../problems/task-scheduler-621-methods');
const build=(m,input,n)=>problem[`builder${m===1?'':m}`](input,{n});
function shortest(counts,n,cooldown=counts.map(()=>0),memo=new Map()){
 if(counts.every(c=>c===0))return 0;const key=`${counts};${cooldown}`;if(memo.has(key))return memo.get(key);
 const ready=counts.map((c,i)=>c>0&&!cooldown[i]?i:-1).filter(i=>i>=0);let answer;
 if(!ready.length){const wait=Math.min(...cooldown.filter((_,i)=>counts[i]>0));answer=wait+shortest(counts,n,cooldown.map(v=>Math.max(0,v-wait)),memo);}
 else answer=1+Math.min(...ready.map(i=>shortest(counts.map((c,j)=>c-(i===j?1:0)),n,cooldown.map((v,j)=>i===j?n:Math.max(0,v-1)),memo)));
 memo.set(key,answer);return answer;
}
test('621 has seven methods and validates inputs',()=>{assert.equal(methods.length,7);for(const[input,n]of[['',2],['A1',2],['A'.repeat(19),2],['A',-1],['A',9],['A',1.5]])assert.throws(()=>build(1,input,n));assert.deepEqual(problem.liveArgs('["A","B"]',{n:0}),[['A','B'],0]);});
test('621 all displayed algorithms match exhaustive optimal scheduling for small frequency combinations',()=>{
 const cases=[];for(let a=0;a<=3;a++)for(let b=0;b<=3;b++)for(let c=0;c<=3;c++)if(a+b+c)for(let n=0;n<=3;n++)cases.push({tasks:[...'A'.repeat(a)+'B'.repeat(b)+'C'.repeat(c)],n,answer:shortest([a,b,c],n)});
 const source=`import json,sys
p=json.load(sys.stdin)
out=[]
for code in p['codes']:
    scope={}
    exec(code,scope)
    out.append([scope['Solution']().leastInterval(case['tasks'],case['n']) for case in p['cases']])
print(json.dumps(out))`;
 const proc=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify({codes:methods.map(m=>m.code.join('\n')),cases}),encoding:'utf8'});assert.equal(proc.status,0,proc.stderr);JSON.parse(proc.stdout).forEach((answers,i)=>assert.deepEqual(answers,cases.map(c=>c.answer),`method ${i+1}`));
});
test('621 source frames and schedules preserve task copies, cooldowns and optimum length, including 154 slots',()=>{
 for(let m=1;m<=7;m++)for(const[input,n,expected]of[['AAABBB',2,8],['AAABBB',0,6],['AAABBBCCC',1,9],['A',8,1],['A'.repeat(18),8,154],['ABCDEFGH',8,8]]){
  const run=build(m,input,n),final=run.steps.at(-1).scheduler621View;assert.equal(run.answer,expected);assert.equal(run.steps.filter(s=>s.final).length,1);assert.equal(final.schedule.length,expected);const tally={},last={};
  for(const[time,task]of final.schedule.entries())if(task!=='_'){assert.ok(last[task]===undefined||time-last[task]>n);last[task]=time;tally[task]=(tally[task]||0)+1;}assert.deepEqual(tally,final.counts);assert.notEqual(final.schedule.at(-1),'_');
  for(const s of run.steps){const v=s.scheduler621View;assert.deepEqual(s.codeLines,[v.line]);assert.equal(s.codeBlock,m);assert.equal(v.source,methods[m-1].code[v.line-1].trim());if(m<=2&&!s.final)assert.deepEqual(v.schedule,[]);else assert.deepEqual(v.schedule,final.schedule.slice(0,v.schedule.length));if(v.heapReady)for(let i=1;i<v.heap.length;i++)assert.ok(v.heap[Math.floor((i-1)/2)][0]<=v.heap[i][0]);}
 }
});
