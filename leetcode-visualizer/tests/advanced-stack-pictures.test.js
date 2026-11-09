'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../problems').SUPPORTED,ids=[3430,3359,2945,1856,975,3205],view=s=>s.advancedStackView??s.stackJumpGridView,run=(id,input=p[id].defaultInput,params={})=>p[id].builder(input,params);
let seed=3430;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
function bounded(a,k){let min=0,max=0;for(let l=0;l<a.length;l++)for(let r=l;r<Math.min(a.length,l+k);r++){const s=a.slice(l,r+1);min+=Math.min(...s);max+=Math.max(...s);}return {min,max};}
function rectangles(g,k,end=null){let count=0;for(let top=0;top<g.length;top++)for(let bottom=top;bottom<g.length;bottom++)for(let left=0;left<g[0].length;left++)for(let right=left;right<g[0].length;right++){
  if(end&&(bottom!==end[0]||right!==end[1]))continue;let good=true;for(let r=top;r<=bottom;r++)for(let c=left;c<=right;c++)if(g[r][c]>k||c>left&&g[r][c-1]<g[r][c])good=false;if(good)count++;
}return count;}
function partitionOracle(a){let best=0,last=Infinity;for(let mask=0;mask<(1<<(a.length-1));mask++){const sums=[];let sum=0;for(let i=0;i<a.length;i++){sum+=a[i];if(i===a.length-1||mask>>i&1){sums.push(sum);sum=0;}}if(sums.every((v,i)=>!i||sums[i-1]<=v)){if(sums.length>best){best=sums.length;last=sums.at(-1);}else if(sums.length===best)last=Math.min(last,sums.at(-1));}}return {best,last};}
function productOracle(a){let best=0n;for(let l=0;l<a.length;l++)for(let r=l;r<a.length;r++){const s=a.slice(l,r+1),product=BigInt(Math.min(...s))*s.reduce((sum,v)=>sum+BigInt(v),0n);if(product>best)best=product;}return best;}
function jumpsOracle(a){const odd=a.map((v,i)=>{const choices=a.map((x,j)=>({x,j})).filter(o=>o.j>i&&o.x>=v).sort((x,y)=>x.x-y.x||x.j-y.j);return choices[0]?.j??-1;}),even=a.map((v,i)=>{const choices=a.map((x,j)=>({x,j})).filter(o=>o.j>i&&o.x<=v).sort((x,y)=>y.x-x.x||x.j-y.j);return choices[0]?.j??-1;});const good=a.map((_,start)=>{let i=start,turn=true;while(i!==a.length-1){i=(turn?odd:even)[i];if(i===-1)return false;turn=!turn;}return true;});return {odd,even,good};}
function hops(a){const dp=Array(a.length).fill(-Infinity);dp[0]=0;for(let j=1;j<a.length;j++)for(let i=0;i<j;i++)dp[j]=Math.max(dp[j],dp[i]+(j-i)*a[j]);return dp.at(-1);}
function ui(id,lang='vi',extra={}){const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang,document:{getElementById:()=>host},...extra};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/'+(id===3205?'renderer-stack-jump-grid.js':'renderer-advanced-stack-pictures.js')),'utf8'),ctx);return {ctx,render(s,options){ctx[id===3205?'renderStackJumpGrid':'renderAdvancedStackPictures'](s,options);return host.innerHTML;}};}
test('six lessons use complete Python statements with the correct sample answers',()=>{
  for(const [id,answer]of [[3430,20],[3359,44],[2945,3],[1856,14],[975,2],[3205,16]]){const r=run(id);assert.equal(r.answer,answer);assert.equal(p[id].debugMode,'line-by-line');assert.equal(view(r.steps.at(-1)).trace.truncated,false);assert.equal(r.steps.filter(s=>s.final).length,1);for(const s of r.steps){assert.deepEqual(s.codeLines,[view(s).source.line]);assert.equal(p[id].code[s.codeLines[0]-1].trim(),view(s).source.text);}}
});
test('3430 bounded contributions assign every legal interval exactly once per min/max phase',()=>{
  const cases=[[[1,2,3],2],[[1,-3,1],2],[[2,2,2],2],[[3,1,4],1],[[3,1,4],3],[[-1000000,1000000,-1000000],3],[Array(12).fill(1000000),12]];
  for(let t=0;t<40;t++){const a=Array.from({length:1+rand(10)},()=>rand(15)-7);cases.push([a,1+rand(a.length)]);}
  for(const [a,k]of cases){const r=run(3430,a,{k}),expected=bounded(a,k),v=view(r.steps.at(-1));assert.equal(r.answer,expected.min+expected.max);
    for(const phase of ['min','max']){const owned=new Set();for(const row of v.ledger.filter(r=>r.phase===phase)){let count=0;for(let l=row.left+1;l<=row.mid;l++)for(let rr=row.mid;rr<row.right;rr++)if(rr-l+1<=k){const s=a.slice(l,rr+1),extreme=phase==='min'?Math.min(...s):Math.max(...s);assert.equal(a[row.mid],extreme);assert.equal(row.mid,a.findLastIndex((x,i)=>i>=l&&i<=rr&&x===extreme));const key=l+':'+rr;assert.ok(!owned.has(key));owned.add(key);count++;}assert.equal(row.count,count);assert.equal(row.value,a[row.mid]*count);}assert.equal(owned.size,Array.from({length:k},(_,i)=>a.length-i).reduce((x,y)=>x+y,0));assert.equal(v.totals[phase],expected[phase]);}
  }
});
test('3359 totals and every bottom-right add agree with direct rectangular enumeration',()=>{
  const cases=[[[[3,2,2,1],[4,3,1,1],[3,3,2,1]],3],[[[3,2],[2,1]],3],[[[1,2,1],[2,1,1]],2],[[[5,5],[5,5]],3],[[[2,2],[2,2]],2],[Array.from({length:6},()=>Array(6).fill(1000000000)),1000000000]];
  for(let t=0;t<25;t++){const cols=1+rand(4);cases.push([Array.from({length:1+rand(4)},()=>Array.from({length:cols},()=>rand(6))),1+rand(5)]);}
  for(const [g,k]of cases){const r=run(3359,g,{k});assert.equal(r.answer,rectangles(g,k));let total=0;for(const row of view(r.steps.at(-1)).ledger){assert.equal(row.add,rectangles(g,k,row.cell));total+=row.add;assert.equal(row.total,total);}assert.equal(total,r.answer);}
});
test('2945 parent chains are valid optimal nondecreasing partitions for every computed prefix',()=>{
  const cases=[[4,3,2,6],[5,2,2],[1,2,3,4],[2,2,2],[7],Array(12).fill(1)];for(let t=0;t<40;t++)cases.push(Array.from({length:1+rand(10)},()=>1+rand(9)));
  for(const a of cases){const r=run(2945,a);assert.equal(r.answer,partitionOracle(a).best);for(const s of r.steps){const v=view(s);if(v.change?.kind==='write'){
    const i=v.locals.i,expected=partitionOracle(a.slice(0,i));assert.equal(v.locals.dp[i],expected.best);assert.equal(v.parts.length,expected.best);assert.equal(v.parts.at(-1).sum,v.locals.last[i]);assert.equal(v.locals.last[i],expected.last);assert.equal(v.parts[0].start,0);assert.equal(v.parts.at(-1).end,i-1);assert.ok(v.parts.every((part,j)=>!j||v.parts[j-1].sum<=part.sum));
  }if(v.change?.kind==='push'){const q=v.locals.q;assert.ok(q.every((j,k)=>!k||v.locals.need[q[k-1]]<v.locals.need[j]));}}}
});
test('1856 maximizes before modulo and records exact prefix-difference witnesses',()=>{
  const cases=[[1,2,3,2],[2,3,3,1,2],[3,1,5,6,4,2],[7],Array(14).fill(10000000)];for(let t=0;t<50;t++)cases.push(Array.from({length:1+rand(12)},()=>1+rand(20)));
  for(const a of cases){const r=run(1856,a),expected=productOracle(a),last=view(r.steps.at(-1));assert.equal(r.answer,Number(expected%1000000007n));assert.equal(BigInt(last.locals.best),expected);assert.equal(BigInt(last.bestWitness.product),expected);
    for(const row of last.ledger){const sub=a.slice(row.left+1,row.right);assert.equal(a[row.mid],Math.min(...sub));assert.equal(row.sum,sub.reduce((x,y)=>x+y,0));assert.equal(row.product,row.sum*a[row.mid]);}
  }
});
test('975 tie-breaking, alternating transitions and good starts match an independent direct search',()=>{
  const cases=[[10,13,12,14,15],[2,3,1,1,4],[5,1,3,4,2],[2,2,2],[7],[0,100000,0]];for(let t=0;t<55;t++)cases.push(Array.from({length:1+rand(14)},()=>rand(10)));
  for(const a of cases){const r=run(975,a),expected=jumpsOracle(a),last=view(r.steps.at(-1));assert.equal(r.answer,expected.good.filter(Boolean).length);assert.deepEqual(last.locals.odd_next,expected.odd);assert.deepEqual(last.locals.even_next,expected.even);assert.deepEqual(last.locals.odd,expected.good);
    for(const s of r.steps){const v=view(s);for(const e of v.ledger)assert.equal(e.to,(e.phase==='odd'?expected.odd:expected.even)[e.from]);if(v.jumpPath){const path=v.jumpPath;assert.equal(path.success,expected.good[path.nodes[0]]);assert.ok(path.nodes.every((j,k)=>!k||path.nodes[k-1]<j));for(const e of path.edges)assert.equal(e.to,(e.phase==='odd'?expected.odd:expected.even)[e.from]);}}
  }
});
test('3205 reuses a complete suffix-max replay and displays the requested problem ID',()=>{
  for(const a of [[1,5,8],[4,5,2,8,9,1,3],[9,8,7,6],[5,5,5,5],[100000,1,1,1],Array(14).fill(100000)]){const r=run(3205,a);assert.equal(r.answer,hops(a));assert.ok(r.steps.every(s=>s.stackJumpGridView.displayId===3205));const html=ui(3205).render(r.steps.at(-1));assert.ok(html.includes('data-problem-id="3205"'));assert.ok(!html.includes('LEETCODE 3221'));}
  assert.ok(run(3221).steps.every(s=>!s.stackJumpGridView.displayId));
});
test('all native events, frames, branches and returned values agree with CPython',()=>{
  const cases=[[3430,'1,-3,1',{k:2}],[3359,p[3359].defaultInput,{k:3}],[2945,'4,3,2,6',{}],[1856,'10000000,10000000',{}],[975,'2,3,1,1,4',{}],[3205,'1,5,8',{}]],items=cases.map(([id,input,params])=>p[id].tracePayload(input,params));
  const script="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(x)) for x in p['items']]))";
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:64e6});assert.equal(ref.status,0,ref.stderr);
  JSON.parse(ref.stdout).forEach((native,i)=>{const r=run(...cases[i]);assert.deepEqual(r.answer,native.answer);assert.equal(r.steps.length,native.events.length);native.events.forEach((e,j)=>{const v=view(r.steps[j]);assert.deepEqual(r.steps[j].codeLines,[e.line]);for(const key of ['locals','outer','frames','scope','branch','returning','returned'])assert.deepEqual(v[key],e[key],`${i}/${j}/${key}`);for(const variable of r.steps[j].vars)assert.deepEqual(variable.rawValue,e.locals[variable.name]);});});
});
test('all advanced presets render every native frame in VI/EN and rewind without modifying snapshots',()=>{
  for(const id of ids.filter(id=>id!==3205)){const cases=vm.runInContext(`AW_CASES[${id}]`,ui(id).ctx);for(const c of cases){const r=run(id,c[0],[3430,3359].includes(id)?{k:c[1]}:{}),saved=JSON.stringify(r.steps);for(const lang of ['vi','en']){const renderer=ui(id,lang,{steps:r.steps,stepIndex:0}),first=renderer.render(r.steps[0]);for(let i=0;i<r.steps.length;i++){renderer.ctx.stepIndex=i;const html=renderer.render(r.steps[i]);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object/);assert.ok(html.includes(`data-source-line="${view(r.steps[i]).source.line}"`));}renderer.ctx.stepIndex=0;assert.equal(renderer.render(r.steps[0]),first);}assert.equal(JSON.stringify(r.steps),saved);}}
});
test('subarray and rectangle inspection changes only the illustration, never native values',()=>{
  for(const id of [3430,3359]){const r=run(id),s=r.steps.find(s=>view(s).scratch[id===3430?'count':'add']!==undefined),saved=JSON.stringify(s),renderer=ui(id);renderer.render(s,id===3430?{range:[0,0]}:{rect:[0,0,0,0]});assert.equal(JSON.stringify(s),saved);}
});
test('input validation and live arguments preserve the exact numeric models and parameter limits',()=>{
  for(const id of ids)for(const input of ['',[],Array(2),'1,,2'])assert.throws(()=>run(id,input));
  for(const [id,input,params]of [[3430,'1,2',{k:0}],[3430,'1,2',{k:3}],[3430,'1,2',{k:'1'}],[3359,'1,2;3',{k:3}],[3359,'1',{k:0}],[2945,'0',{}],[1856,'0',{}],[975,'-1',{}],[3205,'0,1',{}]])assert.throws(()=>run(id,input,params));
  for(const id of ids){const params=[3430,3359].includes(id)?{k:id===3430?2:3}:{},args=p[id].liveArgs(p[id].defaultInput,params);assert.deepEqual(args,p[id].tracePayload(p[id].defaultInput,params).args);const saved=JSON.stringify(args[0]);run(id,args[0],params);assert.equal(JSON.stringify(args[0]),saved);}
});
test('advanced controls land on actual source events and disable absent future actions',()=>{
  for(const id of ids.filter(id=>id!==3205)){const r=run(id),u=ui(id,'vi',{steps:r.steps,stepIndex:0,stopPlay(){},renderStep(){}});for(const kind of ['line','pop','write','result']){u.ctx.stepIndex=0;const next=u.ctx.awNext(kind);assert.ok(next>0,`${id}/${kind}`);u.ctx.awGo(next);assert.equal(u.ctx.stepIndex,next);}u.ctx.stepIndex=r.steps.length-1;for(const kind of ['line','pop','write','result'])assert.equal(u.ctx.awNext(kind),-1);}
});
