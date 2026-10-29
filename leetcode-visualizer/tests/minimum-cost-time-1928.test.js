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
  const source=`import json,sys,math,types
code=json.loads(sys.stdin.readline());cases=json.load(sys.stdin);runs=[]
def enc(v):
 if isinstance(v,(list,tuple)):return [enc(x) for x in v]
 if isinstance(v,float) and not math.isfinite(v):return '∞'
 return v
def local(f):return {k:enc(v) for k,v in f.f_locals.items() if k!='self' and not callable(v) and not isinstance(v,types.ModuleType)}
for args in cases:
 scope={};exec(compile(code,'<lesson>','exec'),scope);pending={};events=[]
 def trace(f,event,arg):
  if f.f_code.co_filename!='<lesson>' or f.f_code.co_name.startswith('<'):return trace
  if event in ('line','return'):
   if f in pending:events.append({'line':pending.pop(f),'locals':local(f),'returned':enc(arg) if event=='return' else None,'returning':event=='return'})
   if event=='line':pending[f]=f.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().minCost(*args);sys.settrace(None);runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const native=spawnSync('python3',['-c',source],{input:JSON.stringify(problem.code.join('\n'))+'\n'+JSON.stringify(samples),encoding:'utf8',maxBuffer:20e6});assert.equal(native.status,0,native.stderr);
  JSON.parse(native.stdout).forEach((reference,index)=>{const result=run(...samples[index]);assert.equal(result.answer,reference.answer);assert.equal(result.steps.length,reference.events.length);result.steps.forEach((step,j)=>{const v=step.costTime1928View,e=reference.events[j];assert.deepEqual(step.codeLines,[e.line]);assert.deepEqual(v.locals,e.locals,`L${e.line}`);assert.deepEqual(v.outer,e.locals);assert.deepEqual(v.frames,[{name:'minCost',locals:e.locals}]);assert.equal(v.returned,e.returned);assert.equal(v.returning,e.returning);assert.equal(v.source.timing,'after');});});
});
test('only actual pops update active routes, only settle updates best_time, destination and path fees are never predicted',()=>{
  for(const args of samples){let previous=null;const result=run(...args);assert.equal(result.steps.filter(s=>s.final).length,1);
    for(const step of result.steps){const v=step.costTime1928View;assert.deepEqual(v.heap,v.locals.heap??null);assert.deepEqual(v.bestTime,v.locals.best_time??null);assert.equal(v.answer===null,!step.final);assert.equal(v.winner!==null,step.final&&result.answer!==-1);
      if(previous&&JSON.stringify(v.bestTime)!==JSON.stringify(previous.bestTime))assert.ok([10,15].includes(v.source.line));
      if(previous&&v.active?.node!==previous.active?.node)assert.equal(v.event,'pop');
      if(v.active)checkPath(v,v.active);for(const state of v.frontier??[])checkPath(v,state);
      const sorted=[...(v.heap??[])].sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);assert.deepEqual(v.frontier?.map(s=>[s.cost,s.time,s.node])??[],sorted);
      if(v.event==='neighbor'&&v.branch){assert.equal(v.proposal.arrival,null);assert.equal(v.proposal.cost,null);}if(v.event==='arrival')assert.equal(v.proposal.cost,null);if(v.event==='fee')assert.equal(v.proposal.cost,v.locals.candidate);
      if(v.event==='reject')assert.ok(v.reason==='overtime'||v.reason==='dominated');
      if(v.winner){assert.equal(v.winner.node,v.n-1);assert.equal(v.winner.cost,result.answer);assert.ok(v.winner.time<=v.maxTime);}
      previous=v;
    }
  }
  const result=run(...tradeoff),states=result.steps.at(-1).costTime1928View.processed.filter(s=>s.node===3);assert.deepEqual(states,[{node:3,time:6,cost:3},{node:3,time:2,cost:102}]);assert.equal(result.answer,103);
});
function renderer(lang,extra={}){const host={innerHTML:'',querySelector:()=>null},context={lang,$:()=>host,...extra};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-minimum-cost-time-1928.js'),'utf8'),context);return {context,host,render:step=>{context.renderCostTime1928Pictures(step);return host.innerHTML;}};}
test('both languages have finite stable maps, exact fees, native best times, heap pop order and rewindable road/path drawings',()=>{
  for(const lang of ['vi','en'])for(const args of samples){const result=run(...args),saved=JSON.stringify(result),{context,render}=renderer(lang),layout=JSON.stringify(context.mt1928Layout(result.steps[0].costTime1928View));
    for(const step of result.steps){const v=step.costTime1928View,html=render(step);assert.doesNotMatch(html,/NaN|undefined|Infinity|object Object|<p\b|<table\b/);assert.equal(JSON.stringify(context.mt1928Layout(v)),layout);const nodes=[...html.matchAll(/data-city="(\d+)" data-fee="(\d+)"/g)].map(m=>[+m[1],+m[2]]);assert.deepEqual(nodes,v.passingFees.map((fee,id)=>[id,fee]));const heap=[...html.matchAll(/data-heap-state="(\d+),(\d+),(\d+)"/g)].map(m=>m.slice(1).map(Number));assert.deepEqual(heap,v.frontier?.map(s=>[s.cost,s.time,s.node])??[]);const times=[...html.matchAll(/data-time-city="(\d+)" data-best-time="([^"]*)"/g)].map(m=>m[2]);assert.deepEqual(times,v.bestTime?.map(String)??Array(v.n).fill(''));const path=[...html.matchAll(/data-path-city="(\d+)"/g)].map(m=>+m[1]);assert.deepEqual(path,v.proposal?[]:v.winner?.path??v.active?.path??[]);}
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
