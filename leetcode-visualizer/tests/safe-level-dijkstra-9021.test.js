"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), vm = require("node:vm"), { spawnSync } = require("node:child_process");
const p = require("../problems").SUPPORTED[9021];
const PYTHON = "C:/Users/david.truong/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const view = s => s.safeDijkstra9021View;
const staleCase = {n:5,edges:[[0,1,9],[0,2,2],[2,1,3],[1,3,4]],u:0,v:4};
const cases = [JSON.parse(p.defaultInput),{n:2,edges:[[0,1,42]],u:0,v:1},{n:3,edges:[],u:1,v:1},{n:3,edges:[],u:0,v:2},staleCase,{n:5,edges:[[0,1,8],[0,2,3],[2,3,3],[3,1,3],[1,4,4]],u:0,v:4},{n:4,edges:[[0,1,5],[0,2,5],[1,3,5],[2,3,5]],u:0,v:3}];
function run(input) { return p.builder(input,{approach:"2"}); }
function oracle({n,edges,u,v}) {
  for(const limit of [...new Set([0,...edges.map(e=>e[2])])].sort((a,b)=>a-b)) {
    const seen=new Set([u]),queue=[u];
    for(let i=0;i<queue.length;i++)for(const [a,b,w] of edges) {
      const next=a===queue[i]?b:b===queue[i]?a:-1;
      if(w<=limit&&next>=0&&!seen.has(next)){seen.add(next);queue.push(next);}
    }
    if(seen.has(v))return limit;
  }
  return -1;
}
function python(program,input) {
  const result=spawnSync(PYTHON,["-c",program],{encoding:"utf8",input:JSON.stringify(input),maxBuffer:16*1024*1024});
  assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);
}

test("9021 approach 2 matches threshold BFS on edge cases and random graphs",()=>{
  let seed=9021;const random=()=>seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const inputs=[...cases];
  for(let k=0;k<120;k++) {
    const n=2+random()%8,edges=[];
    for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)if(random()%3===0&&edges.length<16)edges.push([a,b,1+random()%99]);
    inputs.push({n,edges,u:random()%n,v:random()%n});
  }
  for(const input of inputs) {
    const before=JSON.stringify(input),result=run(input),final=view(result.steps.at(-1));
    assert.equal(result.answer,oracle(input));assert.equal(JSON.stringify(input),before);
    assert.equal(final.answer,result.answer);assert.ok(final.final);
    if(result.answer<0)assert.deepEqual(final.pathNodes,[]);
    else {
      assert.equal(final.pathNodes[0],input.u);assert.equal(final.pathNodes.at(-1),input.v);
      assert.equal(final.pathEdges.length,final.pathNodes.length-1);
      final.pathEdges.forEach((id,i)=>assert.deepEqual([...input.edges[id].slice(0,2)].sort(),[final.pathNodes[i],final.pathNodes[i+1]].sort()));
      assert.equal(Math.max(0,...final.pathEdges.map(id=>input.edges[id][2])),result.answer);
    }
  }
});

test("9021 all main-method line events and locals, including heapq array layout, match CPython",()=>{
  const program=p.code2.join("\n")+`\nimport json,sys,math
def clean(value):
    if isinstance(value,float) and math.isinf(value): return '∞'
    if isinstance(value,(list,tuple)): return [clean(x) for x in value]
    return value
results=[]
for case in json.load(sys.stdin):
    events=[]
    def trace(frame,event,arg):
        if frame.f_code.co_name=='minimumSafeLevel' and event=='line':
            events.append({'line':frame.f_lineno,'locals':{k:clean(v) for k,v in frame.f_locals.items() if k not in ('self','edges')}})
        return trace
    sys.settrace(trace)
    answer=Solution().minimumSafeLevel(case['n'],case['edges'],case['u'],case['v'])
    sys.settrace(None)
    results.append({'answer':answer,'events':events})
print(json.dumps(results))
`;
  python(program,cases).forEach((expected,i)=>{
    const result=run(cases[i]);assert.equal(result.answer,expected.answer);
    assert.deepEqual(result.steps.map(s=>({line:s.codeLines[0],locals:view(s).locals})),expected.events);
  });
});

test("9021 shows mutations after their lines, skips stale states and stops only on a valid target pop",()=>{
  for(const input of cases) {
    const result=run(input);
    for(let i=0;i<result.steps.length;i++) {
      const s=result.steps[i],v=view(s),next=view(result.steps[i+1]||{});
      assert.equal(s.codeBlock,2);assert.deepEqual(s.codeLines,[v.source.line]);
      assert.equal(v.source.text,p.code2[v.source.line-1]);assert.equal(v.source.timing,"before");
      if(v.phase==="update") {
        assert.ok(v.oldBest==="∞"||v.candidate<v.oldBest);
        assert.equal(v.best[v.neighbor],v.oldBest);assert.equal(next.best[v.neighbor],v.candidate);
        assert.equal(next.heap.length,v.heap.length);
      }
      if(v.phase==="push")assert.equal(next.heap.length,v.heap.length+1);
      if(v.phase==="pop") {
        const smallest=[...v.heap].sort((a,b)=>a[0]-b[0]||a[1]-b[1])[0];
        assert.equal(next.cost,smallest[0]);assert.equal(next.current,smallest[1]);
        assert.equal(next.heap.length,v.heap.length-1);
      }
      if(v.phase==="skip-stale") {assert.ok(v.stale);assert.notEqual(v.cost,v.best[v.current]);assert.equal(next.phase,"while");}
      if(v.phase==="found")assert.equal(v.cost,v.best[v.current]);
    }
  }
  assert.ok(run(staleCase).steps.some(s=>view(s).phase==="skip-stale"));
  assert.equal(run(cases[5]).answer,4); // A longer route beats the direct edge of weight 8.
});

test("9021 approach 1 stays selected by default and both code blocks share typed live arguments",()=>{
  assert.ok(p.builder(p.defaultInput).steps[0].safePath9021View);
  assert.ok(run(p.defaultInput).steps.every(s=>s.safeDijkstra9021View));
  assert.equal(p.extraParams.find(x=>x.key==="approach").default,"1");
  assert.equal(p.code2Label.en,"Approach 2: Dijkstra — Minimax Path");
  for(const input of cases)assert.deepEqual(p.liveArgs(input),[input.n,input.edges,input.u,input.v]);
  assert.throws(()=>run({n:2,edges:[[0,0,1]],u:0,v:1}),/9021:/);
});

test("9021 actual live Python tracer executes approach 2 without helper dependencies",()=>{
  const source=fs.readFileSync(require.resolve("../public/live-editor.js"),"utf8");
  const template=source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1];
  const program=vm.runInNewContext(template)+`\nimport json,sys
payload=json.load(sys.stdin)
print(json.dumps([__viz_run_trace(payload['code'],'minimumSafeLevel',[x['n'],x['edges'],x['u'],x['v']])['result'] for x in payload['cases']]))
`;
  assert.deepEqual(python(program,{code:p.code2.join("\n"),cases}),cases.map(oracle));
});

test("9021 Dijkstra renderer restores pictures, shows stale entries and marks the final bottleneck",()=>{
  const context={escapeHtml:String};vm.createContext(context);
  for(const file of ["renderer-safe-level-path-9021.js","renderer-safe-level-dijkstra-9021.js"])vm.runInContext(fs.readFileSync(require.resolve("../public/"+file),"utf8"),context);
  const Klass=vm.runInContext("SafeDijkstra9021Visualizer",context);
  for(const language of ["en","vi"]) {
    const host={innerHTML:""},renderer=new Klass({host,language});
    for(const input of cases) {
      const result=run(input);
      for(const s of result.steps){renderer.render(JSON.parse(JSON.stringify(s)));assert.match(host.innerHTML,/sd9021-graph/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);if(view(s).phase==="skip-stale")assert.match(host.innerHTML,/sd9021-stale-banner/);}
      renderer.render(result.steps[0]);const first=host.innerHTML;renderer.render(result.steps.at(-1));renderer.render(result.steps[0]);assert.equal(host.innerHTML,first);
    }
    renderer.render(run(p.defaultInput).steps.at(-1));assert.match(host.innerHTML,/sd9021-edge built route bottleneck/);assert.match(host.innerHTML,/max = 8/);
  }
});

test("9021 Dijkstra assets load lazily after shared graph geometry and before generic renderers",()=>{
  const html=fs.readFileSync(require.resolve("../public/index.html"),"utf8");
  assert.ok(html.indexOf('src="renderer-safe-level-path-9021.js')<html.indexOf('src="renderer-safe-level-dijkstra-9021.js'));
  assert.match(html,/safe-level-dijkstra-9021\.css/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,""),/(?:renderer-)?safe-level-dijkstra-9021\.(?:js|css)/);
  const source=fs.readFileSync(require.resolve("../public/script.js"),"utf8");
  assert.ok(source.indexOf("step.safeDijkstra9021View")<source.indexOf("step.safePath9021View"));
});
