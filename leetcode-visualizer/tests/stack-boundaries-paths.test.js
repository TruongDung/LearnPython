'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const fs = require('node:fs'), vm = require('node:vm');
const p = require('../problems').SUPPORTED;
const ids = [2334,2297], view = s => s.stackBoundaryView;
const run = (id,a=p[id].defaultInput,params) => p[id].builder(a,params);
let seed = 2297;
const rand = n => {seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
function validLengths(a,t) {
  const found = new Set();
  for(let i=0;i<a.length;i++)for(let j=i;j<a.length;j++)if(Math.min(...a.slice(i,j+1))*(j-i+1)>t)found.add(j-i+1);
  return found;
}
function legal(a,i,j) {
  return i<j && (a[i]<=a[j] ? a.slice(i+1,j).every(x=>x<a[i]) : a.slice(i+1,j).every(x=>x>=a[i]));
}
function shortest(a,costs) {
  const dp=Array(a.length).fill(Infinity);dp[0]=0;
  for(let j=1;j<a.length;j++)for(let i=0;i<j;i++)if(legal(a,i,j))dp[j]=Math.min(dp[j],dp[i]+costs[j]);
  return dp;
}
function ui(lang='vi',extra={}) {
  const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]};
  const ctx={lang,document:{getElementById:()=>host},...extra};vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-stack-boundaries-paths.js'),'utf8'),ctx);
  return {ctx,render:s=>{ctx.renderStackBoundariesPaths(s);return host.innerHTML;}};
}
test('2334 and 2297 have complete native replay and correct default results',()=>{
  for(const id of ids){
    const r=run(id);assert.equal(r.answer,id===2334?3:8);assert.equal(p[id].debugMode,'line-by-line');
    assert.equal(p[id].complexity.time,'O(n)');assert.equal(r.steps.filter(s=>s.final).length,1);
    assert.equal(view(r.steps.at(-1)).trace.truncated,false);
    for(const s of r.steps){assert.deepEqual(s.codeLines,[view(s).source.line]);assert.equal(p[id].code[s.codeLines[0]-1].trim(),view(s).source.text);}
  }
});
test('2334 returns any valid length and rejects strict equality, including duplicate minima and large products',()=>{
  const cases=[[[1,3,4,3,1],6],[[2,2,2],6],[[2,2,2],5],[[6,5,6,5,8],7],[[1],1],[[8],7],[[1,2,3,4],6],[[1,1,1],4],[Array(14).fill(1e9),1e9]];
  for(let i=0;i<90;i++)cases.push([Array.from({length:1+rand(14)},()=>1+rand(20)),1+rand(150)]);
  for(const[a,t]of cases){const r=run(2334,a,{threshold:t}),valid=validLengths(a,t);assert.ok(valid.size?valid.has(r.answer):r.answer===-1,`${a}/${t}/${r.answer}`);
    for(const c of view(r.steps.at(-1)).checks){const segment=a.slice(c.left+1,c.right);assert.equal(segment.length,c.width);assert.equal(Math.min(...segment),c.minimum);assert.equal(c.product,c.minimum*c.width);assert.equal(c.pass,c.product>t);}
  }
});
test('2334 Python algorithm matches exhaustive subarray enumeration on all small arrays and thresholds',()=>{
  const script=`from itertools import product\n${p[2334].code.join('\n')}\nfor n in range(1,6):\n for a in product(range(1,4),repeat=n):\n  for t in range(1,16):\n   valid={j-i for i in range(n) for j in range(i+1,n+1) if min(a[i:j])*(j-i)>t}\n   answer=Solution().validSubarraySize(list(a),t)\n   assert answer in valid if valid else answer==-1,(a,t,answer,valid)\nprint('exhaustive segments passed')`;
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{encoding:'utf8'});assert.equal(ref.status,0,ref.stderr);
});
test('2334 drawings only expose widths and products after their actual assignments; sentinel never enters the stack',()=>{
  for(const[a,t]of [[[1,3,4,3,1],6],[[2,2,2],6],[[1,2,3,4],100]])for(const s of run(2334,a,{threshold:t}).steps){const v=view(s),x=v.locals;
    if(v.source.text.startsWith('for ')&&v.branch)assert.deepEqual(v.scratch,{});
    if(v.change?.kind==='pop')assert.deepEqual(v.scratch,{mid:x.mid});
    for(const[name,value]of Object.entries(v.scratch))assert.equal(value,x[name]);
    assert.ok((x.stack??[]).every(i=>i<a.length));
    if(v.source.text==='stack.append(right)')assert.ok(x.stack.every((j,i)=>!i||a[x.stack[i-1]]<=a[j]));
    if(!s.final)assert.equal(v.result,null);
  }
});
test('2297 matches independently enumerated legal jumps and shortest path costs, including free start, equals and zero fees',()=>{
  const cases=[[[3,2,4,4,1],[3,7,6,4,2]],[[0,1,2],[1,1,1]],[[4,4,4],[9,2,3]],[[5,5,1],[100,8,2]],[[5,1,4,2],[100,1,10,1]],[[3,1,4,2],[10,0,0,0]],[[7],[100000]],[Array(14).fill(100000),Array(14).fill(100000)]];
  for(let i=0;i<110;i++){const n=1+rand(14);cases.push([Array.from({length:n},()=>rand(9)),Array.from({length:n},()=>rand(30))]);}
  for(const[a,costs]of cases){const r=run(2297,a,{costs}),last=view(r.steps.at(-1)),dp=shortest(a,costs);assert.equal(r.answer,dp.at(-1),`${a}/${costs}`);assert.deepEqual(last.locals.dp,dp);
    const actual=last.edges.map(e=>`${e.from}:${e.to}`).sort(),expected=[];
    for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(legal(a,i,j))expected.push(`${i}:${j}`);
    assert.deepEqual(actual,expected.sort());assert.equal(new Set(actual).size,actual.length);
    assert.equal(last.path[0],0);assert.equal(last.path.at(-1),a.length-1);assert.equal(last.path.slice(1).reduce((sum,j)=>sum+costs[j],0),r.answer);
  }
});
test('2297 every edge, relaxation, parent assignment and visible route agrees with the native state at that line',()=>{
  for(const[a,costs]of [[[3,2,4,4,1],[3,7,6,4,2]],[[5,1,4,2],[100,1,10,1]],[[3,1,4,2],[10,0,0,0]]]){let previous;
    for(const s of run(2297,a,{costs}).steps){const v=view(s),x=v.locals;
      if(v.edge)assert.ok(legal(a,v.edge.from,v.edge.to));
      if(v.change?.kind==='write'){assert.equal(v.change.before,previous.locals.dp[x.j]);assert.equal(v.change.after,x.dp[x.j]);assert.equal(x.dp[x.j],x.dp[x.i]+costs[x.j]);assert.ok(v.change.after<v.change.before||v.change.before==='∞');assert.equal(v.pendingParent,x.j);assert.deepEqual(v.path,[]);assert.deepEqual(x.parent,previous.locals.parent);}
      if(v.change?.kind==='parent'){assert.equal(x.parent[x.j],x.i);assert.equal(v.pendingParent,null);}
      for(let k=1;k<v.path.length;k++){const i=v.path[k-1],j=v.path[k];assert.equal(x.parent[j],i);assert.ok(legal(a,i,j));}
      if(v.path.length)assert.equal(v.path.slice(1).reduce((sum,j)=>sum+costs[j],0),x.dp[v.path.at(-1)]);
      if(v.source.text==='greater.append(j)')assert.ok(x.greater.every((j,k)=>!k||a[x.greater[k-1]]>a[j]));
      if(v.source.text==='smaller.append(j)')assert.ok(x.smaller.every((j,k)=>!k||a[x.smaller[k-1]]<=a[j]));
      previous=v;
    }
  }
});
test('2297 Python algorithm matches exhaustive graph enumeration for all small value arrays',()=>{
  const script=`from itertools import product\n${p[2297].code.join('\n')}\nfor n in range(1,6):\n for a in product(range(3),repeat=n):\n  for costs in ([10]+[1]*(n-1),list(range(n)),list(reversed(range(n)))):\n   dp=[float('inf')]*n\n   dp[0]=0\n   for j in range(1,n):\n    for i in range(j):\n     valid=all(x<a[i] for x in a[i+1:j]) if a[i]<=a[j] else all(x>=a[i] for x in a[i+1:j])\n     if valid: dp[j]=min(dp[j],dp[i]+costs[j])\n   assert Solution().minCost(list(a),costs)==dp[-1],(a,costs,dp)\nprint('exhaustive jumps passed')`;
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{encoding:'utf8'});assert.equal(ref.status,0,ref.stderr);
});
test('all completed source lines, branches, locals, frames and returns match CPython',()=>{
  const cases=[[2334,[1,3,4,3,1],{threshold:6}],[2334,[2,2,2],{threshold:6}],[2297,[3,2,4,4,1],{costs:[3,7,6,4,2]}],[2297,[7],{costs:[100000]}]];
  const items=cases.map(([id,a,params])=>({code:p[id].code.join('\n'),method:id===2334?'validSubarraySize':'minCost',args:p[id].liveArgs(a,params)}));
  const script="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(x)) for x in p['items']]))";
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:32e6});assert.equal(ref.status,0,ref.stderr);
  JSON.parse(ref.stdout).forEach((native,i)=>{const r=run(...cases[i]);assert.equal(r.steps.length,native.events.length);native.events.forEach((e,j)=>{const s=r.steps[j],v=view(s);assert.deepEqual(s.codeLines,[e.line]);for(const key of ['locals','outer','frames','scope','branch','returned','returning'])assert.deepEqual(v[key],e[key],`${cases[i][0]}/${j}/${key}`);for(const watch of s.vars)assert.deepEqual(watch.rawValue,e.locals[watch.name]);});});
});
test('both renderers are deterministic, preserve snapshots and support every native frame in VI and EN',()=>{
  for(const id of ids){const examples=ui();const cases=vm.runInContext(`SB_CASES[${id}]`,examples.ctx);for(const[a,param]of cases){const r=run(id,Array.from(a),id===2334?{threshold:param}:{costs:Array.from(param)}),saved=JSON.stringify(r.steps);
    for(const lang of ['vi','en']){const renderer=ui(lang),first=renderer.render(r.steps[0]);for(const s of r.steps){const html=renderer.render(s);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object/);assert.ok(html.includes(`data-source-line="${s.codeLines[0]}"`));}assert.equal(renderer.render(r.steps[0]),first);}assert.equal(JSON.stringify(r.steps),saved);
  }}
});
test('input bounds, sparse/invalid arrays, matched costs, parameter types and immutable arguments are enforced',()=>{
  for(const id of ids){for(const a of [[],Array(2),[true],[NaN],Array(15).fill(1),'1,,2',''])assert.throws(()=>run(id,a));for(const params of [null,[],false])assert.throws(()=>run(id,undefined,params));}
  for(const threshold of [0,1e9+1,'6',true,NaN,2.5,null])assert.throws(()=>run(2334,[1,2],{threshold}));
  for(const costs of [[1],[0,-1],[0,100001],[0,true],[0,1.5],'1,,2',null])assert.throws(()=>run(2297,[1,2],{costs}));
  assert.throws(()=>run(2334,[0]));assert.throws(()=>run(2297,[100001],{costs:[0]}));
  for(const id of ids){const a=[1,2,3],params=id===2334?{threshold:6}:{costs:[0,1,2]},saved=JSON.stringify([a,params]);run(id,a,params);assert.equal(JSON.stringify([a,params]),saved);assert.deepEqual(p[id].liveArgs(JSON.stringify(a),params),[a,id===2334?6:params.costs]);}
  assert.equal(p[2297].extraParams[0].type,'string');
});
test('navigation lands on actual statement events and disables jumps that do not exist',()=>{
  for(const id of ids){const r=run(id),renderer=ui('vi',{steps:r.steps,stepIndex:0,stopPlay(){},renderStep(){}});for(const kind of ['line','pop','write','result']){renderer.ctx.stepIndex=0;const i=renderer.ctx.sbNext(kind);assert.ok(i>0);renderer.ctx.sbGo(i);assert.equal(renderer.ctx.stepIndex,i);if(kind==='result')assert.equal(r.steps[i].final,true);}renderer.ctx.stepIndex=r.steps.length-1;for(const kind of ['line','pop','write','result'])assert.equal(renderer.ctx.sbNext(kind),-1);}
});
test('a rejected jump candidate is shown as greater-or-equal, including a strictly more expensive detour',()=>{
  const r=run(2297),renderer=ui();let strict=false;
  for(const s of r.steps){const v=view(s);if(v.scratch.improves===false){assert.ok(renderer.render(s).includes('≥ STOP'));assert.ok(v.scratch.candidate>=v.locals.dp[v.edge.to]);if(v.scratch.candidate>v.locals.dp[v.edge.to])strict=true;}}
  assert.ok(strict);
});
test('both lesson assets are lazy and registered for their dedicated replay surface',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),active=html.replace(/<template[\s\S]*?<\/template>/g,'');
  assert.doesNotMatch(active,/renderer-stack-boundaries-paths|stack-boundaries-paths\.css/);
  for(const file of ['renderer-stack-boundaries-paths.js','stack-boundaries-paths.css','tree-replay-pictures.css']){
    const tag=html.split('\n').find(line=>line.includes(file));assert.match(tag,/data-problem-ids="[^"]*2334[^"]*2297/);
  }
  const script=fs.readFileSync(require.resolve('../public/script.js'),'utf8');assert.match(script,/Boolean\(step.stackBoundaryView\), surface: "treeView", render: \(step\) => \{ renderStackBoundariesPaths\(step\); \}/);
});
