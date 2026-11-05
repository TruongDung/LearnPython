'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[1928],run=(T,edges,fees)=>p.builder3(edges,{maxTime:T,passingFees:fees});
const roads=[[0,1,10],[1,2,10],[2,5,10],[0,3,1],[3,4,10],[4,5,15]],fees=[5,1,2,20,20,3];
const improvement=[3,[[0,1,1],[1,3,2],[0,2,2],[2,3,1]],[1,100,1,1]];
const cases=[[30,roads,fees],[29,roads,fees],[25,roads,fees],improvement,[2,[[1,0,1],[1,2,1]],[5,2,3]],[3,[[0,1,2]],[5,7]],[1,[[0,1,2]],[5,7]]];
function oracle(T,edges,fees){const g=fees.map(()=>[]);for(const[u,v,t]of edges){g[u].push([v,t]);g[v].push([u,t]);}let best=Infinity;function visit(node,time,cost,seen){if(node===fees.length-1){best=Math.min(best,cost);return;}for(const[next,t]of g[node])if(time+t<=T&&!seen.has(next)){seen.add(next);visit(next,time+t,cost+fees[next],seen);seen.delete(next);}}visit(0,0,fees[0],new Set([0]));return Number.isFinite(best)?best:-1;}
function path(v,s){let time=0,cost=v.passingFees[0];assert.equal(s.path[0],0);assert.equal(s.path.at(-1),s.node);for(let i=1;i<s.path.length;i++){const a=s.path[i-1],b=s.path[i],edge=v.edges.find(([u,w])=>u===a&&w===b||u===b&&w===a);assert.ok(edge);time+=edge[2];cost+=v.passingFees[b];}assert.equal(time,s.time);assert.equal(cost,s.cost);}

test('1928 adds the third approach and preserves the exact requested forward DP source',()=>{
 assert.deepEqual(p.extraParams.find(x=>x.key==='approach').options.map(x=>Number(x.value)),[1,2,3]);assert.equal(Number(p.extraParams.find(x=>x.key==='approach').default),1);assert.equal(p.complexity3.space,'O(VT)');assert.ok(p.code3Label&&p.builder3);
 const expected=`from typing import List

class Solution:
    def minCost(self, maxTime: int, edges: List[List[int]],
                passingFees: List[int]) -> int:

        n = len(passingFees)
        INF = float('inf')

        dp = [[INF] * n for _ in range(maxTime + 1)]
        dp[0][0] = passingFees[0]

        for time in range(maxTime + 1):
            for u, v, travel_time in edges:

                if time + travel_time > maxTime:
                    continue

                new_time = time + travel_time

                if dp[time][u] != INF:
                    dp[new_time][v] = min(
                        dp[new_time][v],
                        dp[time][u] + passingFees[v]
                    )

                if dp[time][v] != INF:
                    dp[new_time][u] = min(
                        dp[new_time][u],
                        dp[time][v] + passingFees[u]
                    )

        answer = min(dp[t][n - 1] for t in range(maxTime + 1))

        return answer if answer != INF else -1`;
 assert.equal(p.code3.join('\n'),expected);const r=p.builder('0,1,2',{maxTime:3,passingFees:'5,7',approach:3});assert.equal(r.steps[0].codeBlock,3);assert.equal(r.answer,12);
});

test('1928 forward DP matches exhaustive paths and both existing algorithms, including every exact-time cost',()=>{
 let seed=19283;const rand=n=>(seed=(Math.imul(seed,1664525)+1013904223)>>>0)%n;const all=[...cases];
 for(let sample=0;sample<18;sample++){const n=2+rand(5),edges=[];for(let i=1;i<n;i++)edges.push([rand(i),i,1+rand(5)]);for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)if(rand(3)===0&&!edges.some(([u,v])=>u===a&&v===b))edges.push([a,b,1+rand(5)]);all.push([1+rand(14),edges,Array.from({length:n},()=>1+rand(50))]);}
 for(const[T,edges,fees]of all){const saved=JSON.stringify([edges,fees]),r=run(T,edges,fees),v=r.steps.at(-1).costTime1928View;assert.equal(r.answer,oracle(T,edges,fees));assert.equal(r.answer,p.builder(edges,{maxTime:T,passingFees:fees}).answer);const pull=p.builder2(edges,{maxTime:T,passingFees:fees});assert.deepEqual(v.dp,pull.steps.at(-1).costTime1928View.dp);assert.equal(JSON.stringify([edges,fees]),saved);assert.equal(r.steps.filter(s=>s.final).length,1);if(v.winner)path(v,v.winner);else assert.equal(r.answer,-1);}
});

test('1928 forward DP reads finite current states, skips overtime and writes only future time rows',()=>{
 for(const args of [improvement,cases[4],cases[6]]){const r=run(...args),directions=new Set(),layers=[];let previous=null;
  for(const step of r.steps){const v=step.costTime1928View,s=v.transition;assert.equal(step.codeBlock,3);assert.equal(v.method,3);assert.deepEqual(step.codeLines,[v.source.line]);assert.equal(v.source.text,p.code3[v.source.line-1].trim());assert.deepEqual(v.dp,v.locals.dp??null);
   const watched=Object.fromEntries(step.vars.map(w=>[w.name,w.value]));assert.deepEqual(Object.keys(watched),['n','maxTime','time','u','v','travel_time','new_time','INF','answer']);for(const[name,value]of Object.entries(watched))assert.deepEqual(value,v.locals[name]??'—');
   if(v.event==='layer')layers.push(v.timeLayer);
   if(v.event==='overtime'){assert.ok(v.bound.arrival>v.maxTime);assert.equal(v.transition,null);assert.equal(v.locals.new_time,previous.locals.new_time);}
   if(v.source.text==='new_time = time + travel_time'){assert.equal(v.locals.new_time,v.locals.time+v.locals.travel_time);assert.ok(v.locals.new_time<=v.maxTime);}
   if(v.guard){assert.equal(v.guard.cost,v.dp[v.guard.time][v.guard.node]);assert.equal(v.guard.passes,v.guard.cost!=='∞');if(!v.guard.passes)assert.equal(v.transition,null);}
   if(s){assert.equal(s.previousTime,v.locals.time);assert.equal(s.time,v.locals.new_time);assert.ok(s.time>s.previousTime);assert.equal(typeof s.preCost,'number');assert.equal(s.preCost,v.dp[s.previousTime][s.from]);if(s.evaluated)assert.equal(s.candidate,s.preCost+s.fee);if(!s.complete)assert.equal(s.actual,s.oldCost);else assert.equal(s.actual,s.oldCost==='∞'?s.candidate:Math.min(s.oldCost,s.candidate));directions.add(s.from===v.locals.u?'u→v':'v→u');}
   if(v.changed&&v.changed.time!==0){assert.equal(v.changed.time,v.locals.new_time);assert.ok(v.changed.time>v.locals.time);assert.equal(v.changed.after,s.candidate);}
   previous=v;
  }
  assert.deepEqual(layers,Array.from({length:args[0]+1},(_,t)=>t));if(args!==cases[6])assert.deepEqual([...directions].sort(),['u→v','v→u']);
 }
 const r=run(...improvement);assert.ok(r.steps.some(s=>s.costTime1928View.changed?.before===102&&s.costTime1928View.changed.after===3));assert.equal(r.answer,3);
});

test('1928 forward DP preserves finite and INF answer locals and completes after the replay cap',()=>{
 const earlier=run(...cases[5]).steps.at(-1).costTime1928View;assert.equal(earlier.answer,12);assert.equal(earlier.minimum,12);assert.equal(earlier.dp[3][1],'∞');assert.equal(earlier.winner.time,2);
 const failed=run(...cases[6]).steps.at(-1).costTime1928View;assert.equal(failed.minimum,'∞');assert.equal(failed.locals.answer,'∞');assert.equal(failed.answer,-1);assert.equal(failed.locals.INF,'∞');
 const edges=Array.from({length:11},(_,i)=>[i,i+1,1]),large=run(100,edges,[...Array(11).fill(1),1000]),v=large.steps.at(-1).costTime1928View;assert.equal(large.answer,1011);assert.equal(v.minimum,1011);assert.ok(v.trace.truncated);assert.ok(large.steps.length<=1601);assert.equal(v.dp.length,101);assert.equal(v.dp[11][11],1011);path(v,v.winner);assert.equal(v.source.text,'return answer if answer != INF else -1');
});

test('1928 forward DP real line events, locals, branches and returns agree with native CPython',()=>{
 const sample=[cases[0],improvement,cases[6]],source="import json,sys,runpy\np=json.load(sys.stdin)\ntrace=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(trace({'code':p['code'],'method':'minCost','args':a})) for a in p['cases']]))";
 const native=spawnSync(process.env.PYTHON||'python3',['-c',source],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),code:p.code3.join('\n'),cases:sample}),encoding:'utf8',maxBuffer:64e6});assert.equal(native.status,0,native.stderr);
 JSON.parse(native.stdout).forEach((ref,index)=>{const r=run(...sample[index]);assert.equal(r.answer,ref.answer);assert.equal(r.steps.length,ref.events.length);r.steps.forEach((step,j)=>{const v=step.costTime1928View,e=ref.events[j];assert.deepEqual(step.codeLines,[e.line]);assert.deepEqual(v.locals,e.locals);assert.deepEqual(v.outer,e.outer);assert.deepEqual(v.frames,e.frames);assert.equal(v.branch,e.branch);assert.equal(v.returned,e.returned);assert.equal(v.returning,e.returning);});});
});

function renderer(lang,extra={}){const host={innerHTML:'',querySelector:()=>null},context={lang,$:()=>host,...extra};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-minimum-cost-time-1928.js'),'utf8'),context);return{context,host,render:s=>{context.renderCostTime1928Pictures(s);return host.innerHTML;}};}
test('1928 forward DP renders real cells, guards, future updates and the answer variable in VI/EN',()=>{
 for(const lang of ['vi','en'])for(const args of [improvement,cases[6]]){const r=run(...args),saved=JSON.stringify(r),ui=renderer(lang);for(const step of r.steps){const v=step.costTime1928View,html=ui.render(step);assert.match(html,/data-method="3"/);assert.doesNotMatch(html,/NaN|undefined|Infinity|data-heap-state/);const cells=[...html.matchAll(/data-dp-time="(\d+)" data-dp-node="(\d+)" data-dp-cost="([^"]*)"/g)].map(m=>[+m[1],+m[2],m[3]]);assert.deepEqual(cells,v.dp?.flatMap((row,time)=>row.map((cost,node)=>[time,node,String(cost)]))??[]);if(v.guard&&!v.transition)assert.match(html,new RegExp(`data-dp-guard="${v.guard.passes}"`));if(v.minimum!==null)assert.ok(html.includes(`data-dp-minimum>${v.minimum}`));}const initial=ui.render(r.steps[0]);ui.render(r.steps.at(-1));assert.equal(ui.render(r.steps[0]),initial);assert.equal(JSON.stringify(r),saved);}
});

test('1928 forward DP jump controls select actual layers from zero, finite relaxations and updates',()=>{
 for(const[id,events]of [['mt1928NextLayer',['layer']],['mt1928NextDirection',['relax']],['mt1928NextDPUpdate',['dp-update']]]){const r=run(...improvement),handlers={},host={innerHTML:'',querySelector:s=>s.startsWith('#')?{addEventListener:(_,fn)=>handlers[s]=fn}:null},ui=renderer('vi',{$:()=>host,steps:r.steps,stepIndex:0,stopPlay(){},renderStep(){}});ui.render(r.steps[0]);handlers['#'+id]();const v=r.steps[ui.context.stepIndex].costTime1928View;assert.ok(events.includes(v.event));if(id==='mt1928NextLayer')assert.equal(v.timeLayer,0);for(let n=0;n<100;n++)handlers['#'+id]();assert.ok(r.steps[ui.context.stepIndex].final);}
});
