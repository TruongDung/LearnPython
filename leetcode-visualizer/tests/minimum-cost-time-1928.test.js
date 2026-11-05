'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[1928];
const defaultEdges=[[0,1,10],[1,2,10],[2,5,10],[0,3,1],[3,4,10],[4,5,15]],fees=[5,1,2,20,20,3];
const tradeoff=[8,[[0,1,1],[1,3,1],[0,2,5],[2,3,1],[3,4,5]],[1,100,1,1,1]];
const samples=[[30,defaultEdges,fees],[29,defaultEdges,fees],[25,defaultEdges,fees],tradeoff,[1,[[0,1,1]],[9,7]],[1,[[0,1,2]],[9,7]],[5,[[0,1,1],[0,2,1],[1,3,1],[2,3,1]],[2,2,2,2]]];
const run=(maxTime,edges,passingFees)=>problem.builder(edges,{maxTime,passingFees});
function oracle(maxTime,edges,fees){const dp=Array.from({length:maxTime+1},()=>Array(fees.length).fill(Infinity));dp[0][0]=fees[0];for(let t=0;t<=maxTime;t++)for(const[a,b,w]of edges)if(t>=w){dp[t][b]=Math.min(dp[t][b],dp[t-w][a]+fees[b]);dp[t][a]=Math.min(dp[t][a],dp[t-w][b]+fees[a]);}const answer=Math.min(...dp.map(row=>row.at(-1)));return Number.isFinite(answer)?answer:-1;}
function checkPath(view,state){assert.equal(state.path[0],0);assert.equal(state.path.at(-1),state.node);let time=0,cost=view.passingFees[0];for(let i=1;i<state.path.length;i++){const road=view.edges.find(([a,b])=>a===state.path[i-1]&&b===state.path[i]||b===state.path[i-1]&&a===state.path[i]);assert.ok(road);time+=road[2];cost+=view.passingFees[state.path[i]];}assert.equal(time,state.time);assert.equal(cost,state.cost);}
test('1928 heap agrees with independent exact-time DP across every connected four-node topology and deterministic weighted graphs',()=>{
  for(const args of samples)assert.equal(run(...args).answer,oracle(...args));
  const pairs=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
  for(let mask=1;mask<64;mask++){const edges=pairs.filter((_,i)=>mask&(1<<i)).map(([a,b],i)=>[a,b,1+i%3]);const seen=new Set([0]);for(let i=0;i<4;i++)for(const[a,b]of edges){if(seen.has(a))seen.add(b);if(seen.has(b))seen.add(a);}if(seen.size!==4)continue;for(const T of [2,4,7]){const f=[2,8,1,3],r=run(T,edges,f);assert.equal(r.answer,oracle(T,edges,f));}}
  let seed=1928;const random=n=>(seed=(Math.imul(seed,1664525)+1013904223)>>>0)%n;
  for(let k=0;k<90;k++){const n=2+random(7),edges=[];for(let i=1;i<n;i++)edges.push([random(i),i,1+random(8)]);for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)if(random(4)===0&&!edges.some(([u,v])=>u===a&&v===b||u===b&&v===a))edges.push([a,b,1+random(8)]);const f=Array.from({length:n},()=>1+random(100)),T=1+random(35);assert.equal(run(T,edges,f).answer,oracle(T,edges,f));}
  const dense=[];for(let a=0;a<12;a++)for(let b=a+1;b<12&&dense.length<30;b++)dense.push([a,b,1+(a+b)%13]);const denseFees=Array.from({length:12},(_,i)=>1+i*73);assert.equal(run(100,dense,denseFees).answer,oracle(100,dense,denseFees));
  const edges=Array.from({length:11},(_,i)=>[i,i+1,9]);for(const T of [98,99,100])assert.equal(run(T,edges,Array(12).fill(1000)).answer,oracle(T,edges,Array(12).fill(1000)));
});
test('every completed statement, heap mutation, infinity, branch scope and return agrees with native Python',()=>{
  const source=`import json,sys,runpy
p=json.load(sys.stdin)
trace=runpy.run_path(p['path'])['picture_trace']
print(json.dumps([json.loads(trace({'code':p['code'],'method':'minCost','args':args})) for args in p['cases']]))`;
  const native=spawnSync(process.env.PYTHON||'python3',['-c',source],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),code:problem.code.join('\n'),cases:samples}),encoding:'utf8',maxBuffer:32e6});assert.equal(native.status,0,native.stderr);
  // Python 3.12 and 3.14 attribute the completion of this multiline comprehension to different lines.
  // Compare its completed assignment once, while retaining the real WASM events in the actual replay.
  const allocation=problem.code.findIndex(line=>line.trim().startsWith('dist = [['))+1;
  const completed=events=>events.flatMap(e=>[allocation,allocation+1].includes(e.line)
    ?e.locals.dist?[{...e,line:allocation}]:[]:[e]);
  JSON.parse(native.stdout).forEach((reference,index)=>{
    const result=run(...samples[index]);assert.equal(result.answer,reference.answer);
    const actual=completed(result.steps.map(step=>({line:step.codeLines[0],...step.costTime1928View})));
    const expected=completed(reference.events);assert.equal(actual.length,expected.length);
    actual.forEach((v,j)=>{const e=expected[j];assert.equal(v.line,e.line);assert.deepEqual(v.locals,e.locals,`L${e.line}`);assert.deepEqual(v.outer,e.locals);assert.deepEqual(v.frames,[{name:'minCost',locals:e.locals}]);assert.equal(v.returned,e.returned);assert.equal(v.returning,e.returning);assert.equal(v.source.timing,'after');});
  });
});
test('exact-time distances change only on assignments; heap events, stale checks and reconstructed routes match execution',()=>{
  for(const args of samples){let previous=null;const result=run(...args);assert.equal(result.steps.filter(s=>s.final).length,1);
    for(const step of result.steps){
      const v=step.costTime1928View,source=v.source.text;
      assert.deepEqual(v.heap,v.locals.heap??null);assert.deepEqual(v.dist,v.locals.dist??null);
      assert.equal(v.answer===null,!step.final);assert.equal(v.winner!==null,step.final&&result.answer!==-1);
      if(previous&&JSON.stringify(v.dist)!==JSON.stringify(previous.dist)){
        assert.ok(v.event==='dist-init'||source==='dist[0][0] = passingFees[0]'||source==='dist[nei][new_time] = new_cost');
        if(previous.dist){const changed=[];for(let node=0;node<v.n;node++)for(let time=0;time<=v.maxTime;time++)if(v.dist[node][time]!==previous.dist[node][time])changed.push([node,time]);assert.deepEqual(changed,[[v.changed.node,v.changed.time]]);assert.equal(v.dist[v.changed.node][v.changed.time],v.changed.after);}
      }
      if(previous&&v.active?.node!==previous.active?.node)assert.equal(v.event,'pop');
      if(v.active)checkPath(v,v.active);for(const state of v.frontier??[])checkPath(v,state);
      const sorted=[...(v.heap??[])].sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);assert.deepEqual(v.frontier?.map(s=>[s.cost,s.time,s.node])??[],sorted);
      if(v.event==='neighbor'&&v.branch){assert.equal(v.proposal.arrival,null);assert.equal(v.proposal.cost,null);}
      if(v.event==='arrival')assert.equal(v.proposal.cost,null);
      if(v.event==='fee')assert.equal(v.proposal.cost,v.locals.new_cost);
      if(v.event==='better'){assert.equal(v.proposal.cost,v.locals.new_cost);assert.equal(v.proposal.oldCost,v.dist[v.proposal.to][v.proposal.arrival]);assert.ok(v.proposal.oldCost==='∞'||v.proposal.cost<v.proposal.oldCost);}
      if(v.event==='reject')assert.ok(v.reason==='overtime'||v.reason==='not-cheaper');
      if(v.event==='stale')assert.notEqual(v.active.cost,v.dist[v.active.node][v.active.time]);
      if(v.event==='push'){assert.equal(v.heap.length,previous.heap.length+1);assert.ok(v.heap.some(([cost,time,node])=>cost===v.locals.new_cost&&time===v.locals.new_time&&node===v.locals.nei));}
      if(v.winner){assert.equal(v.winner.node,v.n-1);assert.equal(v.winner.cost,result.answer);assert.ok(v.winner.time<=v.maxTime);}
      previous=v;
    }
  }
  const result=run(...tradeoff),states=result.steps.at(-1).costTime1928View.processed.filter(s=>s.node===3);
  assert.ok(states.some(s=>s.time===6&&s.cost===3));assert.ok(states.some(s=>s.time===2&&s.cost===102));assert.equal(result.answer,103);
  const view=result.steps.at(-1).costTime1928View;assert.equal(view.dist[3][6],3);assert.equal(view.dist[3][2],102);
});
function renderer(lang,extra={}){const host={innerHTML:'',querySelector:()=>null},context={lang,$:()=>host,...extra};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-minimum-cost-time-1928.js'),'utf8'),context);return {context,host,render:step=>{context.renderCostTime1928Pictures(step);return host.innerHTML;}};}
test('both languages have finite stable maps, exact fees, exact-time costs, heap pop order and rewindable road/path drawings',()=>{
  for(const lang of ['vi','en'])for(const args of samples){const result=run(...args),saved=JSON.stringify(result),{context,render}=renderer(lang),layout=JSON.stringify(context.mt1928Layout(result.steps[0].costTime1928View));
    for(const step of result.steps){const v=step.costTime1928View,html=render(step);assert.doesNotMatch(html,/NaN|undefined|Infinity|object Object|<p\b|<table\b/);assert.equal(JSON.stringify(context.mt1928Layout(v)),layout);const nodes=[...html.matchAll(/data-city="(\d+)" data-fee="(\d+)"/g)].map(m=>[+m[1],+m[2]]);assert.deepEqual(nodes,v.passingFees.map((fee,id)=>[id,fee]));const heap=[...html.matchAll(/data-heap-state="(\d+),(\d+),(\d+)"/g)].map(m=>m.slice(1).map(Number));assert.deepEqual(heap,v.frontier?.map(s=>[s.cost,s.time,s.node])??[]);const cells=[...html.matchAll(/data-dist-node="(\d+)" data-dist-time="(\d+)" data-dist-cost="([^"]*)"/g)].map(m=>[+m[1],+m[2],m[3]]);assert.deepEqual(cells,v.dist?.flatMap((row,node)=>row.map((cost,time)=>[node,time,String(cost)]))??[]);const path=[...html.matchAll(/data-path-city="(\d+)"/g)].map(m=>+m[1]);assert.deepEqual(path,v.proposal?[]:v.winner?.path??v.active?.path??[]);}
    const first=render(result.steps[0]);render(result.steps.at(-1));assert.equal(render(result.steps[0]),first);assert.equal(JSON.stringify(result),saved);
  }
});
test('pop, push and rejection controls land on actual statements and are safe at the end',()=>{
  for(const args of samples)for(const[id,events]of [['mt1928NextPop',['pop']],['mt1928NextPush',['push']],['mt1928NextReject',['reject','stale']]]){const result=run(...args),handlers={},host={innerHTML:'',querySelector:selector=>selector.startsWith('#')?{addEventListener:(_,fn)=>handlers[selector]=fn}:null},r=renderer('vi',{$:()=>host,steps:result.steps,stepIndex:0,stopPlay(){},renderStep(){}});r.render(result.steps[0]);handlers['#'+id]();assert.ok(result.steps[r.context.stepIndex].final||events.includes(result.steps[r.context.stepIndex].costTime1928View.event));for(let i=0;i<100;i++)handlers['#'+id]();assert.equal(r.context.stepIndex,result.steps.length-1);}
});
test('legacy/JSON/object inputs retain strict boundaries, live args, cache isolation and lazy scoped day/night code scrolling',()=>{
  assert.equal(problem.debugMode,'line-by-line');const params={maxTime:30,passingFees:'5,1,2,20,20,3'},expected=run(...samples[0]);assert.deepEqual(problem.builder(problem.defaultInput,params).answer,expected.answer);assert.deepEqual(problem.builder(JSON.stringify(defaultEdges),params).answer,expected.answer);assert.deepEqual(problem.builder({maxTime:30,edges:defaultEdges,passingFees:fees}).answer,expected.answer);assert.deepEqual(problem.liveArgs(problem.defaultInput,params),samples[0]);
  for(const input of [{maxTime:0,edges:[[0,1,1]],passingFees:[1,1]},{maxTime:101,edges:[[0,1,1]],passingFees:[1,1]},{maxTime:2,edges:[[0,0,1]],passingFees:[1,1]},{maxTime:2,edges:[[0,1,0]],passingFees:[1,1]},{maxTime:2,edges:[[0,1,1],[1,0,1]],passingFees:[1,1]},{maxTime:2,edges:[[0,2,1]],passingFees:[1,1]},{maxTime:2,edges:[[0,1,1]],passingFees:[1,0]}])assert.throws(()=>problem.builder(input));
  const saved=JSON.stringify(expected);expected.steps[0].costTime1928View.edges.push([99,99,99]);assert.equal(JSON.stringify(run(...samples[0])),saved);
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/minimum-cost-time-1928.css'),'utf8');for(const asset of ['minimum-cost-time-1928.css','renderer-minimum-cost-time-1928.js'])assert.ok(html.split('\n').some(line=>line.includes(asset)&&line.includes('data-problem-ids="1928"')));assert.match(css,/\[data-theme="light"\] \.mt1928-viz/);assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);
});

test('1928 caps recorded pictures without changing the full exact-time answer or the winning path',()=>{
  const edges=Array.from({length:11},(_,i)=>[i,i+1,1]);
  const args=[100,edges,[...Array(11).fill(1),1000]],result=run(...args),view=result.steps.at(-1).costTime1928View;
  assert.equal(result.answer,oracle(...args));assert.ok(view.trace.truncated);assert.ok(result.steps.length<=1601);assert.equal(view.source.text,'return cost');checkPath(view,view.winner);
  assert.equal(view.winner.cost,result.answer);assert.equal(view.dist[view.winner.node][view.winner.time],result.answer);
  for(const lang of ['vi','en']){const html=renderer(lang).render(result.steps.at(-1));assert.match(html,/mt1928-notice/);assert.doesNotMatch(html,/undefined|NaN|Infinity/);}
});

test('1928 snippet retains the requested typed signature, exact-time checks and multiline heap push',()=>{
  const source=problem.code.join('\n');
  assert.equal(problem.code[0],'from heapq import heappush, heappop');assert.equal(problem.code[1],'from typing import List');
  assert.ok(source.includes(`    def minCost(
        self,
        maxTime: int,
        edges: List[List[int]],
        passingFees: List[int]
    ) -> int:`));
  for(const text of ["dist = [[float('inf')] * (maxTime + 1)\n                for _ in range(n)]",'dist[0][0] = passingFees[0]','cost, time, node = heappop(heap)','if cost != dist[node][time]:','if new_time > maxTime:','if new_cost < dist[nei][new_time]:','dist[nei][new_time] = new_cost'])assert.ok(source.includes(text),text);
  assert.ok(source.includes(`                    heappush(
                        heap,
                        (new_cost, new_time, nei)
                    )`));
  assert.ok(source.endsWith('        return -1'));assert.doesNotMatch(source,/best_time|\belapsed\b|\bcandidate\b/);
});
