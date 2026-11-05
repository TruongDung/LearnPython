'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[1928];
const run=(T,edges,fees)=>p.builder2(edges,{maxTime:T,passingFees:fees});
const roads=[[0,1,10],[1,2,10],[2,5,10],[0,3,1],[3,4,10],[4,5,15]],fees=[5,1,2,20,20,3];
const cases=[[30,roads,fees],[29,roads,fees],[25,roads,fees],[8,[[0,1,1],[1,3,1],[0,2,5],[2,3,1],[3,4,5]],[1,100,1,1,1]],[3,[[0,1,2]],[5,7]],[1,[[0,1,2]],[5,7]]];
function oracle(T,edges,fees){
 const graph=fees.map(()=>[]);for(const[u,v,t]of edges){graph[u].push([v,t]);graph[v].push([u,t]);}
 let minimum=Infinity;
 function visit(node,time,cost,seen){if(node===fees.length-1){minimum=Math.min(minimum,cost);return;}for(const[next,t]of graph[node])if(time+t<=T&&!seen.has(next)){seen.add(next);visit(next,time+t,cost+fees[next],seen);seen.delete(next);}}
 visit(0,0,fees[0],new Set([0]));return Number.isFinite(minimum)?minimum:-1;
}
function path(view,state){let cost=view.passingFees[0],time=0;assert.equal(state.path[0],0);assert.equal(state.path.at(-1),state.node);for(let i=1;i<state.path.length;i++){const a=state.path[i-1],b=state.path[i],road=view.edges.find(([u,v])=>u===a&&v===b||u===b&&v===a);assert.ok(road);time+=road[2];cost+=view.passingFees[b];}assert.equal(time,state.time);assert.equal(cost,state.cost);}

test('1928 preserves the heap and adds selectable typed time-based DP with the requested source',()=>{
 assert.deepEqual(p.extraParams.find(x=>x.key==='approach').options.map(x=>Number(x.value)),[1,2,3]);assert.equal(Number(p.extraParams.find(x=>x.key==='approach').default),1);
 assert.equal(typeof p.builder2,'function');assert.ok(p.codeLabel&&p.code2Label);assert.equal(p.complexity2.space,'O(VT)');
 const expected=String.raw`from typing import List

class Solution:
    def minCost(self, maxTime: int, edges: List[List[int]],
                passingFees: List[int]) -> int:

        n = len(passingFees)

        dp = [[float('inf')] * n
              for _ in range(maxTime + 1)]

        dp[0][0] = passingFees[0]

        for time in range(1, maxTime + 1):
            for u, v, travel_time in edges:

                if time >= travel_time:
                    dp[time][v] = min(
                        dp[time][v],
                        dp[time - travel_time][u] + passingFees[v]
                    )

                    dp[time][u] = min(
                        dp[time][u],
                        dp[time - travel_time][v] + passingFees[u]
                    )

        return min(dp[time][n - 1]
                   for time in range(maxTime + 1)) \
               if min(dp[time][n - 1]
                      for time in range(maxTime + 1)) != float('inf') \
               else -1`;
 assert.equal(p.code2.join('\n'),expected);assert.equal(p.code[0],'from heapq import heappush, heappop');
 const direct=p.builder('0,1,2',{maxTime:3,passingFees:'5,7',approach:2});assert.equal(direct.steps[0].codeBlock,2);assert.equal(direct.answer,12);
});

test('1928 DP agrees with exhaustive simple-path enumeration and the separate heap implementation',()=>{
 let seed=19282;const rand=n=>(seed=(Math.imul(seed,1664525)+1013904223)>>>0)%n;
 const all=[...cases];for(let sample=0;sample<24;sample++){const n=2+rand(5),edges=[];for(let node=1;node<n;node++)edges.push([rand(node),node,1+rand(5)]);for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)if(rand(3)===0&&!edges.some(([u,v])=>u===a&&v===b))edges.push([a,b,1+rand(5)]);all.push([1+rand(14),edges,Array.from({length:n},()=>1+rand(25))]);}
 for(const[T,edges,fees]of all){const original=JSON.stringify([edges,fees]),r=run(T,edges,fees),v=r.steps.at(-1).costTime1928View;assert.equal(r.answer,oracle(T,edges,fees));assert.equal(r.answer,p.builder(edges,{maxTime:T,passingFees:fees}).answer);assert.equal(JSON.stringify([edges,fees]),original);assert.equal(r.steps.filter(s=>s.final).length,1);if(v.winner){path(v,v.winner);assert.equal(v.winner.cost,r.answer);assert.ok(v.winner.time<=T);}else assert.equal(r.answer,-1);}
});

test('1928 DP captures exact before/after matrix values for both directions without premature writes',()=>{
 const r=run(...cases[3]);let previous=null;const directions=new Set();
 for(const step of r.steps){const v=step.costTime1928View,s=v.transition;assert.equal(step.codeBlock,2);assert.deepEqual(step.codeLines,[v.source.line]);assert.equal(v.source.text,p.code2[v.source.line-1].trim());assert.deepEqual(v.dp,v.locals.dp??null);assert.equal(v.source.timing,'after');
  assert.deepEqual(step.vars.map(w=>w.name),['n','maxTime','time','u','v','travel_time']);
  if(v.event==='dp-init')assert.ok(v.dp.every(row=>row.every(cost=>cost==='∞')));
  if(v.changed){assert.equal(v.dp[v.changed.time][v.changed.node],v.changed.after);if(previous.dp)assert.equal(previous.dp[v.changed.time][v.changed.node],v.changed.before);}
  if(s){assert.equal(s.previousTime,s.time-v.locals.travel_time);assert.equal(s.preCost,v.dp[s.previousTime][s.from]);assert.equal(s.actual,v.dp[s.time][s.to]);if(s.evaluated)assert.equal(s.candidate,typeof s.preCost==='number'?s.preCost+s.fee:'∞');else assert.equal(s.candidate,null);
   if(!s.complete)assert.equal(s.actual,s.oldCost);else assert.equal(s.actual,typeof s.candidate==='number'?(s.oldCost==='∞'?s.candidate:Math.min(s.oldCost,s.candidate)):s.oldCost);
   directions.add(`${s.from===v.locals.u?'u':'v'}→${s.to===v.locals.v?'v':'u'}`);
   if(v.active.path)path(v,v.active);
  }
  previous=v;
 }
 assert.deepEqual([...directions].sort(),['u→v','v→u']);const v=r.steps.at(-1).costTime1928View;assert.equal(v.dp[6][3],3);assert.equal(v.dp[2][3],102);assert.equal(v.answer,103);
});

test('1928 DP minimizes across all times and retains a complete result after reaching the picture cap',()=>{
 const short=run(...cases[4]),v=short.steps.at(-1).costTime1928View;assert.equal(short.answer,12);assert.equal(v.dp[3][1],'∞');assert.equal(v.winner.time,2);assert.deepEqual(v.destinationCosts,['∞','∞',12,'∞']);
 const edges=Array.from({length:11},(_,i)=>[i,i+1,1]),large=run(100,edges,[...Array(11).fill(1),1000]),final=large.steps.at(-1).costTime1928View;
 assert.ok(final.trace.truncated);assert.ok(large.steps.length<=1601);assert.equal(large.answer,1011);assert.equal(final.dp.length,101);assert.equal(final.dp[11][11],1011);path(final,final.winner);assert.equal(final.winner.time,11);
});

test('1928 DP lines, scopes, full locals and returns agree with native CPython',()=>{
 const samples=[cases[0],cases[3],cases[5]],source="import json,sys,runpy\np=json.load(sys.stdin)\ntrace=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(trace({'code':p['code'],'method':'minCost','args':args})) for args in p['cases']]))";
 const native=spawnSync(process.env.PYTHON||'python3',['-c',source],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),code:p.code2.join('\n'),cases:samples}),encoding:'utf8',maxBuffer:64e6});assert.equal(native.status,0,native.stderr);
 const allocation=p.code2.findIndex(line=>line.trim().startsWith('dp = [['))+1;
 const completed=events=>events.flatMap(e=>[allocation,allocation+1].includes(e.line)?e.locals.dp?[{...e,line:allocation}]:[]:[e]);
 JSON.parse(native.stdout).forEach((ref,index)=>{const r=run(...samples[index]);assert.equal(r.answer,ref.answer);const actual=completed(r.steps.map(s=>({line:s.codeLines[0],...s.costTime1928View}))),expected=completed(ref.events);assert.equal(actual.length,expected.length);actual.forEach((v,i)=>{const e=expected[i];assert.equal(v.line,e.line);assert.deepEqual(v.locals,e.locals);assert.deepEqual(v.outer,e.outer);assert.deepEqual(v.frames,e.frames);assert.equal(v.returned,e.returned);assert.equal(v.returning,e.returning);});});
});

function renderer(lang,extra={}){const host={innerHTML:'',querySelector:()=>null},context={lang,$:()=>host,...extra};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-minimum-cost-time-1928.js'),'utf8'),context);return{context,host,render:s=>{context.renderCostTime1928Pictures(s);return host.innerHTML;}};}
test('1928 DP renders actual time rows and city columns, transitions, all goal costs and replay in VI/EN',()=>{
 const r=run(...cases[3]);for(const lang of ['vi','en']){const saved=JSON.stringify(r),ui=renderer(lang);for(const s of r.steps){const v=s.costTime1928View,html=ui.render(s);assert.match(html,/mt1928-dp/);assert.doesNotMatch(html,/NaN|undefined|Infinity|best_time|data-heap-state/);const cells=[...html.matchAll(/data-dp-time="(\d+)" data-dp-node="(\d+)" data-dp-cost="([^"]*)"/g)].map(m=>[+m[1],+m[2],m[3]]);assert.deepEqual(cells,v.dp?.flatMap((row,time)=>row.map((cost,node)=>[time,node,String(cost)]))??[]);if(v.destinationCosts)assert.equal((html.match(/data-goal-time=/g)||[]).length,v.maxTime+1);}const first=ui.render(r.steps[0]);ui.render(r.steps.at(-1));assert.equal(ui.render(r.steps[0]),first);assert.equal(JSON.stringify(r),saved);assert.match(ui.render(r.steps.at(-1)),/data-result>103/);}
});

test('1928 DP jump controls land on real time layers, relaxations and changed cells',()=>{
 for(const[id,events]of [['mt1928NextLayer',['layer']],['mt1928NextDirection',['relax']],['mt1928NextDPUpdate',['dp-update']]]){const r=run(...cases[3]),handlers={},host={innerHTML:'',querySelector:s=>s.startsWith('#')?{addEventListener:(_,fn)=>handlers[s]=fn}:null},ui=renderer('vi',{$:()=>host,steps:r.steps,stepIndex:0,stopPlay(){},renderStep(){}});ui.render(r.steps[0]);handlers['#'+id]();assert.ok(events.includes(r.steps[ui.context.stepIndex].costTime1928View.event));for(let n=0;n<100;n++)handlers['#'+id]();assert.ok(r.steps[ui.context.stepIndex].final);}
});
