'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[1245];
const samples=[[],[[0,1]],[[0,1],[0,2]],[[0,1],[1,2],[2,3],[1,4],[4,5]],[[0,1],[0,2],[0,3],[0,4]],[[2,1],[3,2],[1,0],[4,1],[5,4]]];
function diameter(edges) {
  const n=edges.length+1,graph=Array.from({length:n},()=>[]);for(const[a,b]of edges){graph[a].push(b);graph[b].push(a);}
  let best=0;
  for(let root=0;root<n;root++){const distances=Array(n).fill(-1),q=[root];distances[root]=0;for(let i=0;i<q.length;i++)for(const next of graph[q[i]])if(distances[next]<0){distances[next]=distances[q[i]]+1;q.push(next);}best=Math.max(best,...distances);}
  return best;
}
function* words(n,length,prefix=[]) {if(!length){yield prefix;return;}for(let id=0;id<n;id++)yield* words(n,length-1,[...prefix,id]);}
function prufer(word,n) {const degree=Array(n).fill(1),edges=[];word.forEach(id=>degree[id]++);for(const id of word){const leaf=degree.indexOf(1);edges.push([leaf,id]);degree[leaf]--;degree[id]--;}const last=degree.flatMap((value,id)=>value===1?[id]:[]);edges.push(last);return edges;}

test('1245 matches all-pairs shortest distances for every labeled tree through five vertices, ties and maximum-size chains/stars',()=>{
  const cases=[...samples,Array.from({length:39},(_,i)=>[i,i+1]),Array.from({length:39},(_,i)=>[0,i+1])];
  for(let n=2;n<=5;n++)for(const word of words(n,n-2))cases.push(prufer(word,n));
  for(const edges of cases){const saved=JSON.stringify(edges),run=problem.builder(edges),last=run.steps.at(-1).diameter1245View;assert.deepEqual(edges,JSON.parse(saved));assert.equal(run.answer,diameter(edges));assert.equal(run.steps.filter(s=>s.final).length,1);assert.equal(last.finalPath.length,run.answer+1);assert.equal(new Set(last.finalPath).size,last.finalPath.length);for(let i=1;i<last.finalPath.length;i++)assert.ok(edges.some(([a,b])=>a===last.finalPath[i-1]&&b===last.finalPath[i]||b===last.finalPath[i-1]&&a===last.finalPath[i]));}
});

test('all source statements, complete helper/outer locals, sets, deque, adjacency mutations and returns match native CPython',()=>{
  const source=`import sys,json,types,collections
code=json.loads(sys.stdin.readline());cases=json.load(sys.stdin);runs=[]
def enc(v):
 if isinstance(v,dict):return {k:enc(x) for k,x in v.items()} if all(isinstance(k,str) for k in v) else {'__pairs__':[[enc(k),enc(x)] for k,x in v.items()]}
 if isinstance(v,(list,tuple,collections.deque)):return [enc(x) for x in v]
 if isinstance(v,set):return sorted(v)
 return v
def local(f):return {k:enc(v) for k,v in f.f_locals.items() if k!='self' and not callable(v) and not isinstance(v,types.ModuleType)}
for edges in cases:
 scope={};exec(compile(code,'<lesson>','exec'),scope);events=[];pending={}
 def trace(f,event,arg):
  if f.f_code.co_filename!='<lesson>':return trace
  if event in ('line','return'):
   if f in pending:
    outer=f;cursor=f;frames=[]
    while cursor:
     if cursor.f_code.co_filename=='<lesson>':outer=cursor;frames.append({'name':cursor.f_code.co_name,'locals':local(cursor)})
     cursor=cursor.f_back
    events.append({'line':pending.pop(f),'scope':f.f_code.co_name,'locals':local(f),'outer':local(outer),'frames':list(reversed(frames)),'returning':event=='return','returned':enc(arg) if event=='return' else None})
   if event=='line':pending[f]=f.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().treeDiameter(edges);sys.settrace(None);runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const python=spawnSync('python3',['-c',source],{input:JSON.stringify(problem.code.join('\n'))+'\n'+JSON.stringify(samples),encoding:'utf8',maxBuffer:32e6});assert.equal(python.status,0,python.stderr);
  JSON.parse(python.stdout).forEach((reference,index)=>{const run=problem.builder(samples[index]);assert.equal(run.answer,reference.answer);assert.equal(run.steps.length,reference.events.length);run.steps.forEach((step,j)=>{const v=step.diameter1245View,e=reference.events[j];assert.deepEqual(step.codeLines,[e.line]);for(const key of ['scope','locals','outer','frames','returning','returned'])assert.deepEqual(v[key],e[key],`L${e.line} ${key}`);for(const variable of step.vars)assert.deepEqual(variable.value,Object.hasOwn(e.locals,variable.name)?e.locals[variable.name]:'—');assert.equal(v.source.timing,'after');});});
});

test('visits, distances, parents, queue, farthest paths, phase resets and endpoints are published only after their actual statements',()=>{
  for(const edges of samples){const run=problem.builder(edges);let previous=null;
    for(const step of run.steps){const v=step.diameter1245View,x={...v.outer,...v.locals},p=v.passes.at(-1),line=v.source.line;
      assert.equal(v.a,x.a??null);assert.equal(v.b,x.b??null);assert.equal(v.answer===null,!step.final);
      const graph=Array.from({length:v.n},()=>[]);for(const[id,list]of x.graph?.__pairs__??[])graph[id]=list;assert.deepEqual(v.graph,graph);
      if(v.scope==='bfs'){
        assert.deepEqual(p.visited,x.visited);assert.deepEqual(p.queue,x.queue??null);assert.equal(p.farNode,x.far_node??null);assert.equal(p.farDist,x.far_dist??null);
        if(line===11){assert.ok(p.distances.every(d=>d===null));assert.equal(p.queue,null);assert.deepEqual(p.settled,[]);}
        if(line===12)assert.equal(p.distances[x.start],0);
        if(line===15){assert.equal(p.settled.at(-1),x.node);assert.equal(p.distances[x.node],x.dist);assert.equal(v.neighbor,null);}
        if(line===20){assert.equal(p.distances[x.nei],null);assert.ok(p.visited.includes(x.nei));}
        if(line===21){assert.equal(p.parents[x.nei],x.node);assert.equal(p.distances[x.nei],x.dist+1);}
        if(p.farNode!==null){assert.equal(p.bestPath[0],p.start);assert.equal(p.bestPath.at(-1),p.farNode);assert.equal(p.bestPath.length-1,p.farDist);}
        if(line===22){assert.equal(p.complete,true);assert.deepEqual(p.returned,[x.far_node,x.far_dist]);assert.equal(p.settled.length,v.n);}
      }
      if(previous&&v.phase===previous.phase&&v.phase>0&&p.farDist!==previous.passes.at(-1).farDist)assert.ok(line===13||line===17);
      if(v.finalPath.length&&!step.final){assert.equal(v.scope,'treeDiameter');assert.equal(line,24);}
      if(v.phase===2){assert.equal(v.passes[0].complete,true);assert.notEqual(v.a,null);assert.equal(p.start,v.a);}
      previous=v;
    }
    assert.equal(run.steps.at(-1).diameter1245View.passes.length,edges.length?2:0);
  }
});

function renderer(lang,extra={}){const host={innerHTML:'',querySelector:()=>null},context={lang,$:()=>host,...extra};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-tree-diameter-1245.js'),'utf8'),context);return {context,host,render:step=>{context.renderDiameter1245Pictures(step);return host.innerHTML;}};}
test('both languages draw exact discovered distances, FIFO order, built arcs and path, with one fixed tree layout across both passes and stable rewind',()=>{
  for(const lang of ['vi','en'])for(const edges of samples){const run=problem.builder(edges),saved=JSON.stringify(run),{context,render}=renderer(lang),layout=JSON.stringify(context.td1245Layout(run.steps[0].diameter1245View));
    for(const step of run.steps){const v=step.diameter1245View,p=v.passes.at(-1),html=render(step);assert.doesNotMatch(html,/NaN|undefined|Infinity|object Object|<p\b|<table\b/);assert.match(html,/td1245-tree/);assert.equal(JSON.stringify(context.td1245Layout(v)),layout);
      const nodes=[...html.matchAll(/data-node="(\d+)" data-distance="([^"]*)" data-visited="([^"]*)" data-settled="([^"]*)"/g)].map(m=>[+m[1],m[2],m[3],m[4]]);assert.deepEqual(nodes,Array.from({length:v.n},(_,id)=>[id,String(p?.distances[id]??''),String(p?.visited.includes(id)??false),String(p?.settled.includes(id)??false)]));
      const queue=[...html.matchAll(/data-queue-node="(\d+)" data-queue-distance="(\d+)"/g)].map(m=>[+m[1],+m[2]]);assert.deepEqual(queue,p?.queue??[]);
      const path=[...html.matchAll(/data-path-node="(\d+)"/g)].map(m=>+m[1]);assert.deepEqual(path,v.finalPath.length?v.finalPath:p?.bestPath??[]);
      for(const point of context.td1245Layout(v).points){assert.ok(point[0]>=35);assert.ok(point[1]>=35);}
    }
    const first=render(run.steps[0]);render(run.steps.at(-1));assert.equal(render(run.steps[0]),first);assert.equal(JSON.stringify(run),saved);
  }
});

test('pop, farthest update and BFS return navigation jump to real events and finish safely for a singleton and tied endpoints',()=>{
  for(const edges of samples)for(const[id,events]of [['td1245NextPop',['pop']],['td1245NextFar',['farthest']],['td1245NextPass',['bfs-return','endpoint-a','endpoint-b']]]){const run=problem.builder(edges),handlers={},host={innerHTML:'',querySelector:selector=>({addEventListener:(_,fn)=>handlers[selector]=fn})};const {context,render}=renderer('vi',{$:()=>host,steps:run.steps,stepIndex:0,stopPlay(){},renderStep(){}});render(run.steps[0]);handlers['#'+id]();assert.ok(events.includes(run.steps[context.stepIndex].diameter1245View.event)||run.steps[context.stepIndex].final);for(let i=0;i<30;i++)handlers['#'+id]();assert.equal(context.stepIndex,run.steps.length-1);}
});

test('1245 accepts empty/singleton, JSON and legacy edge inputs, rejects non-trees, preserves cache and lazily loads scoped themes and horizontal code',()=>{
  assert.equal(problem.allowEmptyInput,true);assert.equal(problem.debugMode,'line-by-line');assert.equal(problem.builder('').answer,0);assert.deepEqual(problem.liveArgs('0,1;0,2'),[[[0,1],[0,2]]]);assert.deepEqual(problem.liveArgs('[[0,1],[0,2]]'),problem.liveArgs('0,1;0,2'));
  for(const input of [null,'x','0','0,','-1,0','0,0','0,2','0,1;1,0','0,1;1,2;2,0',Array.from({length:40},(_,i)=>[i,i+1])])assert.throws(()=>problem.builder(input));
  const one=problem.builder(problem.defaultInput),saved=JSON.stringify(one);one.steps.at(-1).diameter1245View.passes[0].visited.push(99);assert.equal(JSON.stringify(problem.builder(problem.defaultInput)),saved);
  const chain=problem.builder(Array.from({length:20},(_,i)=>[i,i+1]));
  const startAgain=chain.steps.find(step=>step.diameter1245View.phase===2&&step.diameter1245View.source.line===11);
  const box={dataset:{large:'true'},clientHeight:420,clientWidth:300,scrollTop:0,scrollLeft:0},host={innerHTML:'',querySelector:selector=>selector==='.td1245-tree-scroll'?box:null};
  renderer('vi',{$:()=>host}).render(startAgain);assert.ok(box.scrollTop>1000,'the second BFS starts with its endpoint in view before far_node is initialized');
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/tree-diameter-1245.css'),'utf8'),script=fs.readFileSync(require.resolve('../public/script.js'),'utf8');for(const asset of ['tree-diameter-1245.css','renderer-tree-diameter-1245.js'])assert.ok(html.split('\n').some(line=>line.includes(asset)&&line.includes('data-problem-ids="1245"')));assert.match(script,/Boolean\(step.diameter1245View\)[^\n]*renderDiameter1245Pictures\(step\)/);assert.match(css,/\[data-theme="light"\] \.td1245-viz/);assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);assert.match(css,/#varsPanel[^}]*position:sticky/);
});
