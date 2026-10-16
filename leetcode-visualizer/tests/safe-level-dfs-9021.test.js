"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), vm = require("node:vm"), { spawnSync } = require("node:child_process");
const p = require("../problems").SUPPORTED[9021];
const { extractLiveMethod } = require("../live-args");
const PYTHON = "C:/Users/david.truong/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const run = input => p.builder(input, { approach: 4 }), view = step => step.safeDfs9021View;
const cases = [JSON.parse(p.defaultInput), {n:2,edges:[[0,1,1]],u:0,v:1}, {n:2,edges:[[0,1,99]],u:1,v:0}, {n:3,edges:[],u:1,v:1}, {n:3,edges:[],u:0,v:2}, {n:4,edges:[[0,1,2],[2,3,3]],u:0,v:3}, {n:4,edges:[[0,1,5],[1,2,5],[0,2,5],[2,3,5]],u:0,v:3}];
function reachable(input, level) {
  const seen = new Set([input.u]), queue = [input.u];
  for (let i = 0; i < queue.length; i++) for (const [a,b,w] of input.edges) {
    const next = a === queue[i] ? b : b === queue[i] ? a : -1;
    if (next >= 0 && w <= level && !seen.has(next)) { seen.add(next); queue.push(next); }
  }
  return seen.has(input.v);
}
function oracle(input) { for (const s of [...new Set([0,...input.edges.map(e=>e[2])])].sort((a,b)=>a-b)) if(reachable(input,s)) return s; return -1; }
function python(program, input) {
  const result = spawnSync(PYTHON, ["-c",program], {encoding:"utf8",input:JSON.stringify(input),maxBuffer:32*1024*1024});
  assert.equal(result.status,0,result.stderr); return JSON.parse(result.stdout);
}

test("9021 Binary Search + DFS agrees with independent threshold BFS and all three prior approaches", () => {
  let seed=49021;const random=()=>seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const inputs=[...cases];
  for(let i=0;i<100;i++){const n=2+random()%8,edges=[];for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)if(random()%3===0&&edges.length<16)edges.push([a,b,1+random()%99]);inputs.push({n,edges,u:random()%n,v:random()%n});}
  for(const input of inputs){
    const original=JSON.stringify(input),result=run(input),final=view(result.steps.at(-1));
    assert.equal(result.answer,oracle(input));assert.equal(JSON.stringify(input),original);assert.equal(final.answer,result.answer);
    for(const approach of [1,2,3])assert.equal(p.builder(input,{approach}).answer,result.answer);
    if(result.answer<0){assert.deepEqual(final.pathNodes,[]);continue;}
    assert.equal(final.pathNodes[0],input.u);assert.equal(final.pathNodes.at(-1),input.v);
    final.pathEdges.forEach((id,i)=>assert.deepEqual(input.edges[id].slice(0,2).sort((a,b)=>a-b),[final.pathNodes[i],final.pathNodes[i+1]].sort((a,b)=>a-b)));
    assert.equal(Math.max(0,...final.pathEdges.map(id=>input.edges[id][2])),result.answer);
    if(result.answer>0)assert.equal(reachable(input,result.answer-1),false);
  }
});

test("9021 DFS every source event and main/helper local matches CPython before executing the line", () => {
  const program=p.code4.join("\n")+`\nimport sys,json
def clean(value):
    if isinstance(value,set):return sorted(value)
    if isinstance(value,(list,tuple)):return [clean(x) for x in value]
    return value
results=[]
for case in json.load(sys.stdin):
    events=[]
    def trace(frame,event,arg):
        if frame.f_code.co_name in ('minimumSafeLevel','can_reach') and event=='line':
            events.append({'line':frame.f_lineno,'scope':frame.f_code.co_name,'locals':{k:clean(v) for k,v in frame.f_locals.items() if k not in ('self','edges') and not callable(v)}})
        return trace
    sys.settrace(trace)
    answer=Solution().minimumSafeLevel(case['n'],case['edges'],case['u'],case['v'])
    sys.settrace(None)
    results.append({'answer':answer,'events':events})
print(json.dumps(results))
`;
  python(program,cases).forEach((expected,i)=>{
    const result=run(cases[i]);assert.equal(result.answer,expected.answer);
    assert.deepEqual(result.steps.map(s=>({line:s.codeLines[0],scope:view(s).source.scope,locals:view(s).locals})),expected.events);
    for(const s of result.steps){const v=view(s);assert.equal(s.codeBlock,4);assert.deepEqual(s.codeLines,[v.source.line]);assert.equal(v.source.text,p.code4[v.source.line-1]);assert.equal(v.source.timing,'before');}
  });
});

test("9021 DFS marks on discovery, pushes and pops LIFO after their exact lines, and resets each probe", () => {
  const result=run(p.defaultInput);let popped=false,locked=false,seen=false;
  for(let i=0;i<result.steps.length-1;i++){
    const v=view(result.steps[i]),next=view(result.steps[i+1]);
    assert.equal(new Set(v.stack).size,v.stack.length);
    if(v.phase==='stack'){assert.deepEqual(v.stack,[]);assert.deepEqual(v.seen,[]);assert.equal(v.current,null);}
    if(v.phase==='mark'){assert.ok(!v.seen.includes(v.neighbor));assert.ok(next.seen.includes(v.neighbor));assert.deepEqual(next.stack,v.stack);assert.equal(v.neighborSeen,false);}
    if(v.phase==='push'){assert.ok(v.seen.includes(v.neighbor));assert.deepEqual(next.stack,[...v.stack,v.neighbor]);}
    if(v.phase==='pop'){popped=true;assert.equal(next.current,v.stack.at(-1));assert.deepEqual(next.stack,v.stack.slice(0,-1));}
    if(v.phase==='locked'){locked=true;assert.ok(v.edges[v.activeEdge][2]>v.limit);}
    if(v.phase==='seen'){seen=true;assert.ok(v.neighborSeen);}
    if(v.source.scope==='can_reach') {assert.deepEqual(v.stack,v.locals.stack||[]);assert.deepEqual(v.seen,v.locals.visited||[]);}
  }
  assert.ok(popped&&locked&&seen);
});

test("9021 binary search keeps the first reachable key inside the interval and updates bounds afterward", () => {
  const result=run(p.defaultInput);const history=view(result.steps.at(-1)).history;
  assert.deepEqual(history,[{limit:10,reachable:true,kind:'precheck'},{limit:5,reachable:false,kind:'search'},{limit:8,reachable:true,kind:'search'},{limit:7,reachable:false,kind:'search'}]);
  for(let i=0;i<result.steps.length-1;i++){
    const v=view(result.steps[i]),next=view(result.steps[i+1]);
    if(v.left!==null){assert.ok(v.left<=8&&v.right>=8);}
    if(v.phase==='lower-right'){assert.equal(next.right,v.mid);assert.equal(next.left,v.left);}
    if(v.phase==='raise-left'){assert.equal(next.left,v.mid+1);assert.equal(next.right,v.right);}
  }
  assert.equal(view(run(cases[5]).steps.at(-1)).history.length,1);
  assert.ok(run(cases[3]).steps.every(s=>[5,6].includes(s.codeLines[0])));
});

test("9021 fourth source is selectable by method extraction and the actual live Python tracer", () => {
  const source=fs.readFileSync(require.resolve('../public/live-editor.js'),'utf8'),template=source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1];
  const program=vm.runInNewContext(template)+`\nimport sys,json\npayload=json.load(sys.stdin)\nprint(json.dumps([__viz_run_trace(payload['code'],'minimumSafeLevel',[x['n'],x['edges'],x['u'],x['v']])['result'] for x in payload['cases']]))\n`;
  assert.deepEqual(python(program,{code:p.code4.join('\n'),cases}),cases.map(oracle));
  assert.deepEqual(extractLiveMethod(p,4),{name:'minimumSafeLevel',params:['n','edges','u','v']});
  assert.deepEqual(extractLiveMethod({code:['class Solution:','    def old(self, x): pass'],code4:['class Solution:','    def fourth(self, target): pass']},4),{name:'fourth',params:['target']});
  assert.ok(p.extraParams[0].options.some(option=>option.value==='4'));assert.ok(p.complexity4);
  assert.doesNotMatch(p.code4.join('\n'),/can_reach\(nei\)/);
});

test("9021 DFS graph, search rail and stack render and restore all snapshots in both languages", () => {
  const context={escapeHtml:String};vm.createContext(context);
  for(const file of ['renderer-safe-level-path-9021.js','renderer-safe-level-dfs-9021.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),context);
  const Renderer=vm.runInContext('SafeDfs9021Visualizer',context);
  for(const language of ['vi','en']){
    const host={innerHTML:''},renderer=new Renderer({host,language});
    for(const input of cases){const result=run(input);for(const s of result.steps){renderer.render(JSON.parse(JSON.stringify(s)));assert.match(host.innerHTML,/sf9021-graph/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);}
      renderer.render(result.steps[0]);const first=host.innerHTML;renderer.render(result.steps.at(-1));renderer.render(result.steps[0]);assert.equal(host.innerHTML,first);
    }
    renderer.render(run(p.defaultInput).steps.at(-1));assert.match(host.innerHTML,/bottleneck/);assert.match(host.innerHTML,/max = 8/);
  }
});

test("9021 DFS assets remain lazy and load after their graph geometry base", () => {
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');assert.ok(html.indexOf('src="renderer-safe-level-path-9021.js')<html.indexOf('src="renderer-safe-level-dfs-9021.js'));assert.match(html,/safe-level-dfs-9021\.css/);assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/(?:renderer-)?safe-level-dfs-9021\.(?:js|css)/);
  const core=fs.readFileSync(require.resolve('../public/app-core.js'),'utf8');assert.match(core,/row\.dataset\.line4/);assert.match(core,/attachBreakpoint\(row, 4,/);
});
