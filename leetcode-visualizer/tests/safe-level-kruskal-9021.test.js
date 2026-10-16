"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),{spawnSync}=require("node:child_process");
const p=require("../problems").SUPPORTED[9021];
const PYTHON="C:/Users/david.truong/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const compression={n:9,edges:[[0,1,1],[2,3,2],[2,0,3],[4,5,4],[6,7,5],[6,4,6],[6,2,7],[1,8,8]],u:8,v:7};
const cases=[JSON.parse(p.defaultInput),{n:2,edges:[[0,1,42]],u:0,v:1},{n:3,edges:[],u:1,v:1},{n:3,edges:[],u:0,v:2},{n:4,edges:[[0,1,2],[2,3,3]],u:0,v:3},{n:4,edges:[[0,1,5],[1,2,5],[0,2,5],[2,3,5]],u:0,v:3},compression];
const run=input=>p.builder(input,{approach:"3"}),view=step=>step.safeKruskal9021View;
function reachable(input,level,ids=input.edges.map((_,i)=>i)) {
  const seen=new Set([input.u]),queue=[input.u];
  for(let i=0;i<queue.length;i++)for(const id of ids){const [a,b,w]=input.edges[id],next=a===queue[i]?b:b===queue[i]?a:-1;if(w<=level&&next>=0&&!seen.has(next)){seen.add(next);queue.push(next);}}
  return seen.has(input.v);
}
function oracle(input) {for(const level of [...new Set([0,...input.edges.map(e=>e[2])])].sort((a,b)=>a-b))if(reachable(input,level))return level;return -1;}
function python(program,input) {
  const result=spawnSync(PYTHON,["-c",program],{encoding:"utf8",input:JSON.stringify(input),maxBuffer:16*1024*1024});
  assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);
}

test("9021 Kruskal agrees with independent threshold BFS and returns a real minimax route",()=>{
  let seed=39021;const random=()=>seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const inputs=[...cases];
  for(let i=0;i<130;i++){const n=2+random()%8,edges=[];for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)if(random()%3===0&&edges.length<16)edges.push([a,b,1+random()%99]);inputs.push({n,edges,u:random()%n,v:random()%n});}
  for(const input of inputs){
    const original=JSON.stringify(input),result=run(input),final=view(result.steps.at(-1));
    assert.equal(result.answer,oracle(input));assert.equal(JSON.stringify(input),original);
    assert.equal(final.answer,result.answer);
    if(result.answer<0){assert.deepEqual(final.pathNodes,[]);continue;}
    assert.equal(final.pathNodes[0],input.u);assert.equal(final.pathNodes.at(-1),input.v);
    final.pathEdges.forEach((id,i)=>assert.deepEqual(input.edges[id].slice(0,2).sort((a,b)=>a-b),[final.pathNodes[i],final.pathNodes[i+1]].sort((a,b)=>a-b)));
    assert.equal(Math.max(0,...final.pathEdges.map(id=>input.edges[id][2])),result.answer);
    if(result.answer>0)assert.equal(reachable(input,result.answer-1),false);
  }
});

test("9021 Kruskal every main, find, union and sort-key line event matches CPython locals",()=>{
  const program=p.code3.join("\n")+`\nimport sys,json
def clean(value):
    if isinstance(value,(list,tuple)): return [clean(x) for x in value]
    return value
results=[]
for case in json.load(sys.stdin):
    events=[]
    def trace(frame,event,arg):
        if frame.f_code.co_name in ('minimumSafeLevel','find','union','<lambda>') and event=='line':
            events.append({'line':frame.f_lineno,'scope':frame.f_code.co_name,'locals':{k:clean(v) for k,v in frame.f_locals.items() if k not in ('self','edges') and not callable(v)}})
        return trace
    sys.settrace(trace)
    answer=Solution().minimumSafeLevel(case['n'],case['edges'],case['u'],case['v'])
    sys.settrace(None)
    results.append({'answer':answer,'events':events})
print(json.dumps(results))
`;
  python(program,cases).forEach((expected,i)=>{const result=run(cases[i]);assert.equal(result.answer,expected.answer);assert.deepEqual(result.steps.map(s=>({line:s.codeLines[0],scope:view(s).source.scope,locals:view(s).locals})),expected.events);});
});

test("9021 union links and size increments happen after their lines; find performs real path halving",()=>{
  let compressed=false,swapped=false,cycle=false;
  for(const input of cases) {
    const result=run(input);
    for(let i=0;i<result.steps.length;i++){
      const s=result.steps[i],v=view(s),next=result.steps[i+1]&&view(result.steps[i+1]);
      assert.equal(s.codeBlock,3);assert.deepEqual(s.codeLines,[v.source.line]);assert.equal(v.source.text,p.code3[v.source.line-1]);assert.equal(v.source.timing,"before");
      if(v.phase==="link"){
        const {rootA,rootB}=v.union;assert.equal(v.parent[rootB],rootB);assert.equal(next.parent[rootB],rootA);assert.ok(v.size[rootA]>=v.size[rootB]);assert.equal(next.accepted.length,v.accepted.length+1);assert.deepEqual(next.size,v.size);
      }
      if(v.phase==="grow"){const {rootA,rootB}=v.union;assert.equal(next.size[rootA],v.size[rootA]+v.size[rootB]);}
      if(v.phase==="compress"){
        const x=v.find.x,old=v.parent[x],grand=v.parent[old];assert.equal(next.parent[x],grand);assert.equal(next.locals.x,x);assert.deepEqual(next.roots,v.roots);if(old!==grand)compressed=true;
      }
      if(v.phase==="climb")assert.equal(next.locals.x,v.parent[v.find.x]);
      if(v.phase==="swap"){swapped=true;assert.equal(next.union.rootA,v.union.rootB);assert.equal(next.union.rootB,v.union.rootA);}
      if(v.phase==="cycle"){cycle=true;assert.equal(v.union.rootA,v.union.rootB);assert.equal(next.accepted.length,v.accepted.length);assert.ok(next.skipped.includes(v.activeEdge));}
      if(v.parent){
        assert.equal(v.accepted.length,input.n-v.components.length);
        for(const group of v.components){assert.ok(group.nodes.every(node=>v.roots[node]===group.root));if(v.size&&v.phase!=="grow")assert.equal(v.size[group.root],group.nodes.length);}
        for(const id of v.accepted){const [a,b]=input.edges[id];assert.equal(v.roots[a],v.roots[b]);}
      }
    }
  }
  assert.ok(compressed&&swapped&&cycle);
});

test("9021 sorted edge list is stable at equal weights and early stop leaves later edges untouched",()=>{
  const result=run(p.defaultInput),final=view(result.steps.at(-1));
  assert.deepEqual(final.ordered.map(e=>e.id),[9,0,4,2,6,1,5,8,3,7]);
  assert.equal(final.activeEdge,8);assert.ok(!final.accepted.includes(3)&&!final.skipped.includes(3));
  assert.equal(final.connected,true);assert.equal(final.weight,8);
  assert.ok(run(cases[2]).steps.every(s=>[5,6].includes(s.codeLines[0])));
});

test("9021 real live Python tracer executes approach 3, including nested helpers",()=>{
  const text=fs.readFileSync(require.resolve("../public/live-editor.js"),"utf8"),template=text.match(/const TRACER_PY = (`[\s\S]*?`);/)[1];
  const program=vm.runInNewContext(template)+`\nimport json,sys
payload=json.load(sys.stdin)
print(json.dumps([__viz_run_trace(payload['code'],'minimumSafeLevel',[x['n'],x['edges'],x['u'],x['v']])['result'] for x in payload['cases']]))
`;
  assert.deepEqual(python(program,{code:p.code3.join("\n"),cases}),cases.map(oracle));
  const input=cases[0];assert.deepEqual(p.liveArgs(input),[input.n,input.edges,input.u,input.v]);
  assert.ok(p.builder(p.defaultInput).steps[0].safePath9021View);assert.ok(p.builder(p.defaultInput,{approach:2}).steps[0].safeDijkstra9021View);
  assert.ok(p.extraParams.find(x=>x.key==="approach").options.some(option=>option.value==="3"));
});

test("9021 DSU pictures render every frame in both languages and restore exactly on Prev",()=>{
  const context={escapeHtml:String};vm.createContext(context);
  for(const file of ["renderer-safe-level-path-9021.js","renderer-safe-level-kruskal-9021.js"])vm.runInContext(fs.readFileSync(require.resolve("../public/"+file),"utf8"),context);
  const Klass=vm.runInContext("SafeKruskal9021Visualizer",context);
  for(const language of ["vi","en"]){const host={innerHTML:""},renderer=new Klass({host,language});for(const input of cases){const result=run(input);for(const s of result.steps){renderer.render(JSON.parse(JSON.stringify(s)));assert.match(host.innerHTML,/sk9021-graph/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);if(view(s).find)assert.match(host.innerHTML,/sk9021-find/);}renderer.render(result.steps[0]);const first=host.innerHTML;renderer.render(result.steps.at(-1));renderer.render(result.steps[0]);assert.equal(host.innerHTML,first);}
    renderer.render(run(p.defaultInput).steps.at(-1));assert.match(host.innerHTML,/sk9021-edge accepted active route bottleneck/);assert.match(host.innerHTML,/max = 8/);
  }
});

test("9021 Kruskal assets stay lazy and take precedence over generic graph rendering",()=>{
  const html=fs.readFileSync(require.resolve("../public/index.html"),"utf8");
  assert.ok(html.indexOf('src="renderer-safe-level-path-9021.js')<html.indexOf('src="renderer-safe-level-kruskal-9021.js'));
  assert.match(html,/safe-level-kruskal-9021\.css/);assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,""),/(?:renderer-)?safe-level-kruskal-9021\.(?:js|css)/);
  const source=fs.readFileSync(require.resolve("../public/script.js"),"utf8");assert.ok(source.indexOf("step.safeKruskal9021View")<source.indexOf("step.safeDijkstra9021View"));
});
