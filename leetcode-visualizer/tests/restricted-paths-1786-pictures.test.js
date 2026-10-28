const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const {test}=require('node:test');
const problem=require('../problems').SUPPORTED[1786];
const cases=[
 [5,problem.liveArgs(problem.defaultInput,{n:5})[1]],
 [2,[[1,2,7]]],[3,[[1,2,1],[2,3,1],[1,3,3]]],
 [3,[[1,3,10],[2,3,1],[1,2,1]]],[3,[[1,3,1],[2,3,1],[1,2,1]]],
 [4,[[1,2,1],[3,4,1]]],[9,Array.from({length:8},(_,i)=>[i+1,i+2,100000])],
];

test('1786 every source line, local and actual heap array matches CPython',()=>{
 const python=`import sys,json,math
data=json.load(sys.stdin)
ns={}
exec(data['code'],ns)
names={'n','edges','MOD','graph','u','v','weight','dist','heap','distance','candidate','order','ways','_'}
def clean(value):
    if isinstance(value,float) and math.isinf(value): return '∞'
    if isinstance(value,(list,tuple)): return [clean(v) for v in value]
    return value
results=[]
for n,edges in data['inputs']:
    rows=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_name!='countRestrictedPaths': return None
        def snapshot(line):
            rows.append({'line':line,'locals':{key:clean(value) for key,value in frame.f_locals.items() if key in names}})
        if event=='line':
            if frame in pending: snapshot(pending[frame])
            pending[frame]=frame.f_lineno
        elif event=='return':
            snapshot(pending.pop(frame))
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().countRestrictedPaths(n,edges)
    sys.settrace(None)
    results.append({'answer':answer,'rows':rows})
print(json.dumps(results))`;
 const output=spawnSync(process.env.PYTHON||'python3',['-c',python],{input:JSON.stringify({code:problem.code.join('\n'),inputs:cases}),encoding:'utf8',maxBuffer:32*1024*1024});
 assert.equal(output.status,0,output.stderr);const expected=JSON.parse(output.stdout);
 cases.forEach(([n,edges],index)=>{
  const run=problem.builder(edges,{n}),reference=expected[index];assert.equal(run.answer,reference.answer);assert.equal(run.steps.length,reference.rows.length,`frames ${n}/${edges}`);
  run.steps.forEach((step,i)=>{
   const row=reference.rows[i],v=step.restricted1786View;
   assert.deepEqual(step.codeLines,[row.line],`${n} frame ${i}`);assert.deepEqual(v.locals,row.locals,`${n} frame ${i} line ${row.line}`);
   assert.equal(v.source.timing,'after');
   if(row.locals.heap)assert.deepEqual(v.heap.map(item=>[item.distance,item.node]),row.locals.heap);
  });
 });
});

function reference(n,edges){
 const d=Array.from({length:n+1},(_,u)=>Array.from({length:n+1},(_,v)=>u===v?0:Infinity)),neighbors=Array.from({length:n+1},()=>[]);
 for(const [u,v,w] of edges){d[u][v]=d[v][u]=w;neighbors[u].push(v);neighbors[v].push(u);}
 for(let k=1;k<=n;k++)for(let u=1;u<=n;u++)for(let v=1;v<=n;v++)d[u][v]=Math.min(d[u][v],d[u][k]+d[k][v]);
 const paths=[];function dfs(u,path){if(u===n){paths.push(path);return;}for(const v of neighbors[u])if(d[v][n]<d[u][n])dfs(v,[...path,v]);}dfs(1,[1]);
 return{paths,dist:Array.from({length:n},(_,i)=>d[i+1][n]===Infinity?'∞':d[i+1][n])};
}
test('1786 matches independent Floyd-Warshall distances and enumerated restricted paths',()=>{
 let seed=1786;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32),samples=[...cases];
 for(let i=0;i<80;i++){
  const n=2+Math.floor(random()*8),pairs=[];
  for(let u=1;u<=n;u++)for(let v=u+1;v<=n;v++)if(random()<.35)pairs.push([u,v,1+Math.floor(random()*30)]);
  if(!pairs.length)pairs.push([1,n,1]);samples.push([n,pairs.slice(0,18)]);
 }
 for(const [n,edges] of samples){
  const run=problem.builder(edges,{n}),last=run.steps.at(-1).restricted1786View,expected=reference(n,edges);
  assert.equal(run.answer,expected.paths.length);assert.deepEqual(last.distances.map(item=>item.value),expected.dist);
  assert.deepEqual(last.witnessPaths.map(JSON.stringify).sort(),expected.paths.map(JSON.stringify).sort());
  for(const path of last.witnessPaths){assert.equal(path[0],1);assert.equal(path.at(-1),n);path.slice(1).forEach((node,i)=>assert.ok(expected.dist[path[i]-1]>expected.dist[node-1]));}
 }
 assert.equal(problem.debugMode,'line-by-line');
});

test('1786 separates distance updates, heap pushes, stale skips and DP additions',()=>{
 const run=problem.builder(problem.defaultInput,{n:5});
 assert.ok(run.steps.some(step=>step.restricted1786View.event==='stale'));
 for(const [index,step] of run.steps.entries()){
  const v=step.restricted1786View,previous=run.steps[index-1]?.restricted1786View;
  if(v.event==='relax-improve'){assert.equal(v.locals.dist[v.change.node],v.change.to);assert.deepEqual(v.locals.heap,previous.locals.heap);}
  if(v.event==='heap-push'){assert.deepEqual(v.locals.dist,previous.locals.dist);assert.equal(v.heap.length,previous.heap.length+1);}
  if(v.event==='dp-update'){assert.equal(v.locals.ways[v.dpTarget],(v.beforeWays+v.contribution)%1000000007);assert.ok(v.locals.dist[v.dpSource]<v.locals.dist[v.dpTarget]);}
 }
 const equal=problem.builder(cases[4][1],{n:3});assert.equal(equal.answer,1);
 assert.ok(equal.steps.some(step=>{const v=step.restricted1786View;return v.event==='dp-skip'&&v.locals.dist[v.locals.u]===v.locals.dist[v.locals.v];}));
 assert.equal(problem.builder(cases[5][1],{n:4}).answer,0);
});

test('1786 pictures expose all nodes, actual heap positions and valid final path choices without mutating traces',()=>{
 const host={innerHTML:'',clientWidth:240,dataset:{}},context={lang:'vi',$:()=>host};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-restricted-paths-1786.js'),'utf8'),context);
 for(const [n,edges] of cases){
  const run=problem.builder(edges,{n}),before=JSON.stringify(run);
  for(const language of ['vi','en'])for(const step of run.steps){
   context.lang=language;context.renderRestrictedPaths1786Pictures(step);const v=step.restricted1786View;
   assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);
   assert.equal((host.innerHTML.match(/data-node=/g)||[]).length,n);assert.equal((host.innerHTML.match(/data-edge=/g)||[]).length,edges.length);
   assert.equal((host.innerHTML.match(/data-heap-index=/g)||[]).length,v.phase==='dijkstra'?v.heap.length:0);
   for(const item of v.heap)if(v.phase==='dijkstra')assert.ok(host.innerHTML.includes(`data-heap-index="${item.index}" data-pair="${item.distance},${item.node}"`));
   const model=context.restricted1786PictureLayout(v,220);model.positions.slice(1).forEach(p=>assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y)));
  }
  assert.equal(JSON.stringify(run),before);
 }
});

test('1786 validates weighted simple graphs and supplies identical inputs to live Python',()=>{
 for(const [edges,n] of [['',5],['1,2,0',2],['1,2,-1',2],['1,2,100001',2],['1,1,1',2],['1,3,1',2],['1,2,1;2,1,2',2],['1,2,',2],['1,2,1',10],['[[1,2,null]]',2]])assert.throws(()=>problem.builder(edges,{n}),/1786:/);
 assert.deepEqual(problem.liveArgs('1,2,7',{n:'2'}),[2,[[1,2,7]]]);
 assert.equal(problem.builder('[[1,2,7]]',{n:2}).answer,1);
});
