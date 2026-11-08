'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const fs=require('node:fs');
const vm=require('node:vm');
const problem=require('../problems').SUPPORTED[1519];
const run=(n=7,edges=[[0,1],[0,2],[1,4],[1,5],[2,3],[2,6]],labels='abaedcd')=>problem.builder([n],{edges,labels});
const view=s=>s.sameLabel1519View;
const chain=n=>Array.from({length:n-1},(_,i)=>[i,i+1]);
function oracle(n,edges,labels){
  const graph=Array.from({length:n},()=>[]);for(const[u,v]of edges){graph[u].push(v);graph[v].push(u);}
  const parents=Array(n).fill(null),queue=[0];parents[0]=-1;
  for(let head=0;head<queue.length;head++)for(const child of graph[queue[head]])if(parents[child]===null){parents[child]=queue[head];queue.push(child);}
  // Count each equal-label node by walking its ancestor chain, independently of frequency merging.
  const out=Array(n).fill(0),matches=Array.from({length:n},()=>[]);
  for(let node=0;node<n;node++)for(let ancestor=node;ancestor>=0;ancestor=parents[ancestor])if(labels[node]===labels[ancestor]){out[ancestor]++;matches[ancestor].push(node);}
  return {answer:out,matches,parents};
}
function ui(lang='vi',extra={}){
  const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]};
  const ctx={lang,document:{getElementById:()=>host},...extra};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-same-label-1519.js'),'utf8'),ctx);
  return {ctx,render:(s,options)=>{ctx.renderSameLabel1519(s,options);return host.innerHTML;}};
}
const fixtures=[
  [7,[[0,1],[0,2],[1,4],[1,5],[2,3],[2,6]],'abaedcd',[2,1,1,1,1,1,1]],
  [4,[[0,1],[1,2],[0,3]],'bbbb',[4,2,1,1]],
  [5,[[0,1],[0,2],[1,3],[0,4]],'aabab',[3,2,1,1,1]],
  [1,[],'z',[1]],
  [3,[[2,0],[1,0]],'zaz',[2,1,1]],
  [12,chain(12),'zzzzzzzzzzzz',Array.from({length:12},(_,i)=>12-i)],
  [12,Array.from({length:11},(_,i)=>[0,i+1]),'abcdefghijkl',Array(12).fill(1)],
];
test('1519 registers complete Python statement debugging and preserves its input API',()=>{
  assert.equal(problem.id,1519);assert.equal(problem.debugMode,'line-by-line');
  assert.equal(problem.maxInput,12);assert.equal(problem.singleInput,true);
  assert.equal(problem.complexity.time,'O(26n)');assert.equal(problem.visualizationLimits.completeTrace,true);
  assert.deepEqual(problem.liveArgs([1],{edges:'[]',labels:'z'}),[1,[],'z']);
  assert.doesNotMatch(problem.code.join('\n'),/;|if .*: continue|for .*: count/);
});
test('1519 matches all official examples, singleton, high labels, long chains and wide trees',()=>{
  for(const[n,edges,labels,answer]of fixtures){const r=run(n,edges,labels);assert.deepEqual(r.answer,answer);assert.equal(view(r.steps.at(-1)).trace.truncated,false);assert.equal(r.steps.filter(s=>s.final).length,1);assert.deepEqual(view(r.steps.at(-1)).result,answer);}
});
test('native results match independent ancestor enumeration on reordered and reversed random tree edges',()=>{
  let seed=1519;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
  for(let trial=0;trial<60;trial++){
    const n=1+rand(12),edges=Array.from({length:n-1},(_,i)=>rand(2)?[i+1,rand(i+1)]:[rand(i+1),i+1]);
    for(let i=edges.length-1;i>0;i--){const j=rand(i+1);[edges[i],edges[j]]=[edges[j],edges[i]];}
    const labels=Array.from({length:n},()=>rand(5)===0?'z':String.fromCharCode(97+rand(5))).join('');
    const r=run(n,edges,labels),ref=oracle(n,edges,labels);assert.deepEqual(r.answer,ref.answer,JSON.stringify({n,edges,labels}));
    for(const row of view(r.steps.at(-1)).ledger)assert.deepEqual([...row.matches].sort((a,b)=>a-b),ref.matches[row.node]);
  }
});
test('every line, local, branch, return and suspended frame exactly matches CPython',()=>{
  const selected=[fixtures[0],fixtures[3],fixtures[5]],items=selected.map(([n,edges,labels])=>({code:problem.code.join('\n'),method:'countSubTrees',args:[n,edges,labels]}));
  const script="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(x)) for x in p['items']]))";
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:128e6});
  assert.equal(ref.status,0,ref.stderr);
  JSON.parse(ref.stdout).forEach((native,i)=>{const r=run(...selected[i].slice(0,3));assert.deepEqual(r.answer,native.answer);assert.equal(r.steps.length,native.events.length);native.events.forEach((record,j)=>{const s=r.steps[j],v=view(s);assert.deepEqual(s.codeLines,[record.line]);assert.equal(v.source.text,problem.code[record.line-1].trim());for(const key of ['locals','outer','frames','scope','branch','returning','returned'])assert.deepEqual(v[key],record[key],`${i}/${j}/${key}`);for(const watch of s.vars)assert.deepEqual(watch.rawValue,record.locals[watch.name]);});});
});
test('each intermediate frequency is explained by exactly its actual contributing node IDs',()=>{
  for(const fixture of [fixtures[0],fixtures[1],fixtures[4],fixtures[5]])for(const s of run(...fixture.slice(0,3)).steps){const v=view(s);
    for(const[node,count]of Object.entries(v.counts))for(let i=0;i<26;i++){const ids=v.witnesses[node][i];assert.equal(ids.length,count[i],`${node}/${i}/${v.source.text}`);assert.equal(new Set(ids).size,ids.length);for(const id of ids){assert.equal(v.labels[id],String.fromCharCode(97+i));assert.ok(v.nodes[node].descendants.includes(id));}}
    if(v.change?.kind==='enter')assert.ok(v.witnesses[v.current].every(ids=>ids.length===0));
    if(v.change?.kind==='self')assert.ok(v.witnesses[v.current][v.change.index].includes(v.current));
  }
});
test('each tree edge merges exactly 26 native cells, including zeros, and each node adds itself once',()=>{
  const r=run(),merges=r.steps.filter(s=>view(s).change?.kind==='merge'),self=r.steps.filter(s=>view(s).change?.kind==='self');
  assert.equal(merges.length,6*26);assert.equal(self.length,7);
  const edges=new Map();for(const s of merges){const v=view(s),m=v.change,key=m.parent+','+m.child;assert.equal(m.after,m.before+m.addend);assert.equal(m.after,v.locals.count[m.index]);assert.equal(m.addend,v.locals.child_count[m.index]);if(!edges.has(key))edges.set(key,[]);edges.get(key).push(m.index);}
  for(const indices of edges.values())assert.deepEqual(indices,Array.from({length:26},(_,i)=>i));
  assert.ok(merges.some(s=>view(s).change.addend===0));
});
test('parent waits while child returns, then merges cells only after child_count assignment',()=>{
  const r=run();for(let i=0;i<r.steps.length;i++){const v=view(r.steps[i]);if(v.change?.kind==='return'&&v.change.parent>=0){const p=v.change.parent,next=view(r.steps[i+1]);assert.equal(next.change.kind,'receive');assert.equal(next.change.child,v.current);assert.deepEqual(v.counts[p],next.counts[p]);assert.deepEqual(next.childCount,v.returned);}if(v.source.text==='continue'){assert.equal(v.check.skip,true);assert.equal(v.locals.child,v.locals.parent);assert.equal(v.change,null);}}
  assert.equal(r.steps.filter(s=>view(s).source.text==='continue').length,6);
});
test('answers become committed only on their actual assignment and their witnesses exclude sibling branches',()=>{
  const r=run(5,[[0,1],[0,2],[1,3],[2,4]],'aabaa'),done=[];
  for(const s of r.steps){const v=view(s);if(v.change?.kind==='answer'){done.push(v.current);const row=v.ledger.at(-1);assert.equal(row.count,v.locals.count[v.locals.index]);assert.equal(row.matches.length,row.count);}assert.deepEqual(v.completed,done);if(v.answer)for(let node=0;node<5;node++)if(!done.includes(node))assert.equal(v.answer[node],0);}
  const final=view(r.steps.at(-1)),one=final.ledger.find(row=>row.node===1);assert.deepEqual([...one.matches].sort((a,b)=>a-b),[1,3]);assert.ok(!one.matches.includes(4));
});
test('malformed, sparse, cyclic, duplicate and disconnected inputs are rejected before tracing',()=>{
  for(const input of [[],[1,2],[null],[true],Array(1),0,13,'','1.5',NaN])assert.throws(()=>problem.builder(input,{edges:[],labels:'a'}));
  for(const edges of [null,'bad',{},[[0,0]],[[0,2]],[[0,1,2]],[[0,true]],Array(1)])assert.throws(()=>run(2,edges,'aa'));
  assert.throws(()=>run(3,[[0,1],[1,0]],'aaa'),/duplicate/);
  assert.throws(()=>run(4,[[0,1],[1,2],[2,0]],'aaaa'),/connected/);
  for(const labels of [null,123,'A','ab','é',''])assert.throws(()=>run(1,[],labels),/labels/);
  for(const params of [null,[],1])assert.throws(()=>problem.builder([1],params));
});
test('input objects remain immutable and JSON custom parameters agree with live arguments',()=>{
  const edges=[[1,0],[0,2]],params={edges,labels:'aza'},before=JSON.stringify(params);run(3,edges,params.labels);assert.equal(JSON.stringify(params),before);
  assert.deepEqual(problem.liveArgs('3',{edges:JSON.stringify(edges),labels:'aza'}),[3,edges,'aza']);
});
test('every native frame renders in VI/EN with faithful arrays, stable rewind, and no mutated snapshots',()=>{
  for(const fixture of [fixtures[0],fixtures[3],fixtures[4]]){const r=run(...fixture.slice(0,3)),before=JSON.stringify(r.steps);for(const lang of ['vi','en']){const renderer=ui(lang),first=renderer.render(r.steps[0]);for(const s of r.steps){const v=view(s),html=renderer.render(s);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object/);assert.ok(html.includes(`data-source-line="${v.source.line}"`));for(const[name,value]of [['answer',v.answer]])assert.ok(html.includes(`data-native-${name}="${JSON.stringify(value)}"`));}assert.equal(renderer.render(r.steps[0]),first);}assert.equal(JSON.stringify(r.steps),before);}
});
test('label inspection preserves Python locals and keeps the merge equation on the actual source index',()=>{
  const r=run(),s=r.steps.find(s=>view(s).change?.kind==='merge'&&view(s).change.addend>0),saved=JSON.stringify(s),renderer=ui();
  for(let i=0;i<26;i++){const html=renderer.render(s,{letter:i,fit:true});assert.ok(html.includes(`data-proof-letter="${String.fromCharCode(97+i)}"`));assert.ok(html.includes(`data-merge-letter="${view(s).locals.i}"`));assert.doesNotMatch(html,/undefined|NaN/);}assert.equal(JSON.stringify(s),saved);
});
test('line, nonzero merge, answer, return and result jumps all target real native events',()=>{
  const r=run(),renderer=ui('vi',{steps:r.steps,stepIndex:0,stopPlay(){},renderStep(){}});
  for(const kind of ['line','merge','answer','return','result']){renderer.ctx.stepIndex=0;const next=renderer.ctx.sl1519Next(kind);assert.ok(next>0);renderer.ctx.sl1519Go(next);assert.equal(renderer.ctx.stepIndex,next);const v=view(r.steps[next]);if(kind==='merge')assert.ok(v.change.addend>0);if(kind==='answer'||kind==='return')assert.equal(v.change.kind,kind);if(kind==='result')assert.equal(r.steps[next].final,true);}
});
test('completed merge arrows and child tables disappear while adding self or assigning an answer',()=>{
  const renderer=ui();for(const s of run().steps){const v=view(s),html=renderer.render(s);if(['self','answer'].includes(v.change?.kind)){assert.ok(!html.includes('data-count-name="child_count'));assert.ok(!html.includes('class="sl-flow-edge"'));}if(v.change?.kind==='merge'){assert.ok(html.includes('data-count-name="child_count'));assert.ok(html.includes('class="sl-flow-edge"'));}}
});
