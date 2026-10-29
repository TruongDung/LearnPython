'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[1627];
const run=(n,threshold,queries)=>problem.builder([n],{threshold,queries});
const gcd=(a,b)=>b?gcd(b,a%b):a;
function oracle(n,threshold,queries){const graph=Array.from({length:n+1},()=>[]);for(let a=1;a<=n;a++)for(let b=a+1;b<=n;b++)if(gcd(a,b)>threshold){graph[a].push(b);graph[b].push(a);}return queries.map(([a,b])=>{const queue=[a],seen=new Set(queue);for(let i=0;i<queue.length;i++)for(const id of graph[queue[i]])if(!seen.has(id)){seen.add(id);queue.push(id);}return seen.has(b);});}
const samples=[[12,2,[[3,4],[4,8],[9,5],[5,10],[7,11]]],[1,0,[[1,1]]],[1,1,[]],[6,0,[[1,6],[2,3]]],[6,6,[[1,1],[1,2]]],[24,2,[[3,4],[8,21],[1,24]]]];
test('1627 matches independent gcd graph reachability for all pairs and thresholds through n=10, plus maximum-size boundaries',()=>{
  for(let n=1;n<=10;n++)for(let threshold=0;threshold<=n;threshold++){
    const pairs=Array.from({length:n*n},(_,i)=>[Math.floor(i/n)+1,i%n+1]);
    for(let i=0;i<pairs.length;i+=20){const queries=pairs.slice(i,i+20),result=run(n,threshold,queries);assert.deepEqual(result.answer,oracle(n,threshold,queries));assert.equal(result.steps.filter(s=>s.final).length,1);}
  }
  for(const [n,t,q]of [...samples,[24,0,[[1,24],[17,23],[24,24]]],[24,24,[[1,24],[24,24]]]])assert.deepEqual(run(n,t,q).answer,oracle(n,t,q));
});
test('all source lines and complete helper/outer snapshots match independent native CPython, including swaps and path halving',()=>{
  const source=`import json,sys,types
code=json.loads(sys.stdin.readline());cases=json.load(sys.stdin);runs=[]
def enc(v):
 if isinstance(v,(list,tuple)):return [enc(x) for x in v]
 return v
def local(f):return {k:enc(v) for k,v in f.f_locals.items() if k!='self' and not callable(v) and not isinstance(v,types.ModuleType)}
for args in cases:
 scope={};exec(compile(code,'<lesson>','exec'),scope);events=[];pending={}
 def trace(f,event,arg):
  if f.f_code.co_filename!='<lesson>':return trace
  if event in ('line','return'):
   if f in pending:
    cursor=f;outer=f;frames=[]
    while cursor:
     if cursor.f_code.co_filename=='<lesson>':outer=cursor;frames.append({'name':cursor.f_code.co_name,'locals':local(cursor)})
     cursor=cursor.f_back
    events.append({'line':pending.pop(f),'scope':f.f_code.co_name,'locals':local(f),'outer':local(outer),'frames':list(reversed(frames)),'returning':event=='return','returned':enc(arg) if event=='return' else None})
   if event=='line':pending[f]=f.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().areConnected(*args);sys.settrace(None);runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const native=spawnSync('python3',['-c',source],{input:JSON.stringify(problem.code.join('\n'))+'\n'+JSON.stringify(samples),encoding:'utf8',maxBuffer:32e6});assert.equal(native.status,0,native.stderr);
  JSON.parse(native.stdout).forEach((expected,index)=>{const result=run(...samples[index]);assert.deepEqual(result.answer,expected.answer);assert.equal(result.steps.length,expected.events.length);result.steps.forEach((step,j)=>{const v=step.connectivity1627View,e=expected.events[j];assert.deepEqual(step.codeLines,[e.line]);for(const key of ['scope','locals','outer','frames','returning','returned'])assert.deepEqual(v[key],e[key],`L${e.line} ${key}`);assert.equal(v.source.timing,'after');});});
});
test('parent, size, query roots, comparison, appended answers and valid road witnesses appear at their actual statements',()=>{
  let swaps=0,changedCompression=0,redundant=0;
  for(const args of samples){let previous=null;for(const step of run(...args).steps){const v=step.connectivity1627View,x={...v.outer,...v.locals};assert.deepEqual(v.parent,x.parent??null);assert.deepEqual(v.size,x.size??null);assert.deepEqual(v.results,x.answer??null);assert.equal(v.answer===null,!step.final);
    assert.deepEqual(v.groups.flatMap(g=>g.members).sort((a,b)=>a-b),Array.from({length:v.n},(_,i)=>i+1));
    for(const g of v.groups)for(const id of g.members){let root=id;while(v.parent[root]!==root)root=v.parent[root];assert.equal(root,g.root);}
    if(previous&&JSON.stringify(v.parent)!==JSON.stringify(previous.parent))assert.ok([7,17].includes(v.source.line));
    if(v.event==='swap')swaps++;
    if(v.event==='same')redundant++;
    if(v.event==='compress'&&v.change.from!==v.change.to)changedCompression++;
    if(v.query){const q=v.query;if(v.event==='query'&&v.branch){assert.equal(q.rootA,null);assert.equal(q.rootB,null);assert.equal(q.connected,null);assert.equal(q.appended,false);}if(v.event==='root-a'){assert.equal(q.rootA,x.root_a);assert.equal(q.rootB,null);assert.equal(q.connected,null);}if(v.event==='root-b'){assert.equal(q.rootB,x.root_b);assert.equal(q.connected,null);}if(v.event==='compare'){assert.equal(q.connected,x.connected);assert.equal(v.results.length,q.index);}if(v.event==='append')assert.equal(v.results.length,q.index+1);}
    for(const edge of v.edges){assert.ok(edge.d>v.threshold);assert.equal(edge.a%edge.d,0);assert.equal(edge.b%edge.d,0);}
    if(v.path.length){assert.equal(v.query.connected,true);assert.equal(v.path[0],v.query.a);assert.equal(v.path.at(-1),v.query.b);for(let i=1;i<v.path.length;i++)assert.ok(gcd(v.path[i-1],v.path[i])>v.threshold);}
    previous=v;
  }}assert.ok(swaps>0);assert.ok(changedCompression>0);assert.ok(redundant>0);
});
function renderer(lang,extra={}){const host={innerHTML:'',querySelector:()=>null},context={lang,$:()=>host,...extra};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-connectivity-threshold-1627.js'),'utf8'),context);return {context,host,render:step=>{context.renderConnectivity1627Pictures(step);return host.innerHTML;}};}
test('both languages render exactly one copy of each city, real parent arrows, safe finite SVG geometry and rewindable snapshots',()=>{
  for(const lang of ['vi','en'])for(const args of samples){const result=run(...args),saved=JSON.stringify(result),{render}=renderer(lang);for(const step of result.steps){const v=step.connectivity1627View,html=render(step);assert.doesNotMatch(html,/NaN|undefined|Infinity|object Object|<p\b|<table\b/);const cities=[...html.matchAll(/data-(?:single-city|city)="(\d+)"/g)].map(m=>+m[1]).sort((a,b)=>a-b);assert.deepEqual(cities,Array.from({length:v.n},(_,i)=>i+1));const links=[...html.matchAll(/data-link="(\d+),(\d+)"/g)].map(m=>[+m[1],+m[2]]);assert.deepEqual(links.sort((a,b)=>a[0]-b[0]),v.parent.slice(1).flatMap((p,i)=>p===i+1?[]:[[i+1,p]]));const path=[...html.matchAll(/data-path-city="(\d+)"/g)].map(m=>+m[1]);if(v.phase!=='sieve')assert.deepEqual(path,v.path);}
    const first=render(result.steps[0]);render(result.steps.at(-1));assert.equal(render(result.steps[0]),first);assert.equal(JSON.stringify(result),saved);
  }
});
test('event navigation and completed query chips go to exact source events and remain safe at the end',()=>{
  for(const args of samples)for(const [id,event]of [['ct1627NextMerge','merge'],['ct1627NextQuery','append'],['ct1627NextCompress','compress']]){const result=run(...args),handlers={},host={innerHTML:'',querySelector:selector=>selector.startsWith('#')?{addEventListener:(_,fn)=>handlers[selector]=fn}:null,querySelectorAll:()=>[]},context=renderer('vi',{$:()=>host,steps:result.steps,stepIndex:0,stopPlay(){},renderStep(){}});context.render(result.steps[0]);handlers['#'+id]();assert.ok(result.steps[context.context.stepIndex].final||result.steps[context.context.stepIndex].connectivity1627View.event===event);for(let i=0;i<30;i++)handlers['#'+id]();assert.equal(context.context.stepIndex,result.steps.length-1);}
  const result=run(...samples[0]),buttons=Array.from({length:5},(_,index)=>({dataset:{queryIndex:String(index)},addEventListener:(_,fn)=>buttons[index].click=fn})),host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>buttons},r=renderer('vi',{$:()=>host,steps:result.steps,stepIndex:result.steps.length-1,stopPlay(){},renderStep(){}});r.render(result.steps.at(-1));buttons.forEach((button,index)=>{button.click();const v=result.steps[r.context.stepIndex].connectivity1627View;assert.equal(v.event,'append');assert.equal(v.query.index,index);});
});
test('input bounds, empty queries, defaults, immutable trace cache and lazy scoped themes preserve the shared app',()=>{
  assert.equal(problem.debugMode,'line-by-line');assert.deepEqual(problem.liveArgs([6],{threshold:2,queries:'1,4;2,5;3,6'}),[6,2,[[1,4],[2,5],[3,6]]]);assert.deepEqual(run(6,2,'[]').answer,[]);assert.deepEqual(run(6,2,'').answer,[]);
  for(const args of [[0,0,[]],[25,0,[]],[6,-1,[]],[6,7,[]],[6,1.5,[]],[6,1,'0,1'],[6,1,'1,7'],[6,1,'1,'],[6,1,'not JSON'],[6,1,Array(21).fill([1,2])]])assert.throws(()=>run(...args));
  const one=run(...samples[0]),saved=JSON.stringify(one);one.steps[0].connectivity1627View.parent.push(99);assert.equal(JSON.stringify(run(...samples[0])),saved);
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/connectivity-threshold-1627.css'),'utf8');for(const asset of ['connectivity-threshold-1627.css','renderer-connectivity-threshold-1627.js'])assert.ok(html.split('\n').some(line=>line.includes(asset)&&line.includes('data-problem-ids="1627"')));assert.match(css,/\[data-theme="light"\] \.ct1627-viz/);assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);
});
