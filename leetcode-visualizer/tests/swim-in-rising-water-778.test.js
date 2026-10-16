"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),{spawnSync}=require("node:child_process");
const problem=require("../problems").SUPPORTED[778];
const PYTHON="C:/Users/david.truong/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const cases=[[[0]],[[0,2],[1,3]],[[3,0],[1,2]],[[4,8,0],[5,7,1],[6,3,2]],problem.parseInput(problem.defaultInput)];
const view=step=>step.swimDijkstra778View;
function reachable(grid,t){const n=grid.length;if(grid[0][0]>t)return false;const seen=new Set([0]),queue=[[0,0]];for(let i=0;i<queue.length;i++){const [r,c]=queue[i];if(r===n-1&&c===n-1)return true;for(const [dr,dc]of [[1,0],[-1,0],[0,1],[0,-1]]){const nr=r+dr,nc=c+dc,id=nr*n+nc;if(nr>=0&&nr<n&&nc>=0&&nc<n&&grid[nr][nc]<=t&&!seen.has(id)){seen.add(id);queue.push([nr,nc]);}}}return false;}
function oracle(grid){let lo=0,hi=grid.length**2-1;while(lo<hi){const mid=Math.floor((lo+hi)/2);if(reachable(grid,mid))hi=mid;else lo=mid+1;}return lo;}
function python(program,input){const result=spawnSync(PYTHON,["-c",program],{encoding:"utf8",input:JSON.stringify(input),maxBuffer:32*1024*1024});assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);}

test("778 minimax Dijkstra matches independent water-threshold flood fill",()=>{
  const grids=[...cases];let seed=778;const random=()=>seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  for(let sample=0;sample<80;sample++){const n=2+sample%5,values=Array.from({length:n*n},(_,i)=>i);for(let i=values.length-1;i>0;i--){const j=random()%(i+1);[values[i],values[j]]=[values[j],values[i]];}grids.push(Array.from({length:n},(_,r)=>values.slice(r*n,(r+1)*n)));}
  for(const grid of grids){const original=JSON.stringify(grid),run=problem.builder(grid),final=view(run.steps.at(-1));assert.equal(run.answer,oracle(grid));assert.equal(JSON.stringify(grid),original);assert.deepEqual(final.path[0].slice(0,2),[0,0]);assert.deepEqual(final.path.at(-1).slice(0,2),[grid.length-1,grid.length-1]);assert.equal(Math.max(...final.path.map(c=>c[2])),run.answer);final.path.slice(1).forEach(([r,c],i)=>assert.equal(Math.abs(r-final.path[i][0])+Math.abs(c-final.path[i][1]),1));assert.equal(final.previousReachable,false);}
});

test("778 every executable line, scalar local, heapq layout and pictured best cell matches CPython",()=>{
  const program=problem.code.join("\n")+`\nimport sys,json,math
def clean(value):
    if isinstance(value,float) and math.isinf(value):return '∞'
    if isinstance(value,(list,tuple)):return [clean(x) for x in value]
    return value
results=[]
for grid in json.load(sys.stdin):
    events=[]
    def trace(frame,event,arg):
        if frame.f_code.co_name=='swimInWater' and event=='line':
            v=frame.f_locals
            events.append({'line':frame.f_lineno,'locals':{k:clean(x) for k,x in v.items() if k not in ('self','grid','best','heap')},'heap':clean(v.get('heap',[])),'best':clean(v.get('best'))})
        return trace
    sys.settrace(trace)
    answer=Solution().swimInWater(grid)
    sys.settrace(None)
    results.append({'answer':answer,'events':events})
print(json.dumps(results))
`;
  python(program,cases).forEach((expected,i)=>{const run=problem.builder(cases[i]);assert.equal(run.answer,expected.answer);assert.deepEqual(run.steps.map(s=>({line:s.codeLines[0],locals:view(s).locals,heap:view(s).heap})),expected.events.map(e=>({line:e.line,locals:e.locals,heap:e.heap})));run.steps.forEach((s,j)=>{for(const row of view(s).cells)for(const cell of row)assert.equal(cell.best,expected.events[j].best?.[cell.r]?.[cell.c]??null);});});
});

test("778 updates best after assignment and enqueues only after heappush",()=>{
  const run=problem.builder('0,2|1,3');
  for(let i=0;i<run.steps.length-1;i++){const s=run.steps[i],v=view(s),next=view(run.steps[i+1]);assert.deepEqual(s.codeLines,[v.source.line]);assert.equal(v.source.text,problem.code[v.source.line-1]);assert.equal(v.source.timing,'before');if(v.phase==='update'){const p=v.probe;assert.equal(v.cells[p.r][p.c].best,p.oldBest);assert.equal(next.cells[p.r][p.c].best,p.newTime);assert.equal(next.heap.length,v.heap.length);assert.equal(next.cells[p.r][p.c].queued,false);}if(v.phase==='push'){const p=v.probe;assert.equal(next.heap.length,v.heap.length+1);assert.equal(next.cells[p.r][p.c].queued,true);}if(v.phase==='pop'){const top=[...v.heap].sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2])[0];assert.equal(next.level,top[0]);assert.deepEqual(next.current,top.slice(1));assert.equal(next.heap.length,v.heap.length-1);}}
});

test("778 flooding, discovery and settlement are independent; candidate responses never leak from a previous neighbor",()=>{
  const run=problem.builder('4,8,0|5,7,1|6,3,2');let unreachedWet=false,last=-1;
  for(const s of run.steps){const v=view(s);if(v.level!==null){assert.ok(v.level>=last);last=v.level;}for(const row of v.cells)for(const c of row){assert.equal(c.wet,v.level!==null&&c.height<=v.level);assert.equal(c.queued,v.heap.some(([,r,col])=>r===c.r&&col===c.c));if(c.settled){assert.ok(c.best<=v.level);assert.equal(c.queued,false);}if(c.wet&&c.best==='∞'&&!c.settled)unreachedWet=true;}if(v.phase==='max'||v.phase==='bounds')assert.equal(v.probe.newTime,null);if(v.phase==='compare')assert.equal(v.probe.newTime,Math.max(v.level,v.probe.height));}
  assert.ok(unreachedWet);assert.equal(view(problem.builder('3,0|1,2').steps.at(-1)).level,3);
});

test("778 accepts both grid formats, official size 50 and typed live arguments; rejects invalid permutations",()=>{
  assert.deepEqual(problem.liveArgs('[[0,2],[1,3]]'),[[[0,2],[1,3]]]);assert.deepEqual(problem.liveArgs('0,2;1,3'),[[[0,2],[1,3]]]);
  for(const input of ['',null,'[','0,1|2','0,0|1,2','0,1|2,4','0,1|2,','-1',[[true]],Array.from({length:51},()=>Array(51).fill(0))])assert.throws(()=>problem.builder(input),/778:/);
  assert.equal(problem.debugMode,'line-by-line');assert.ok(problem.tags.some(t=>t.key==='minimax'));
});

test("778 full-size grid preserves its answer and marks bounded trace/picture condensation",()=>{
  const grid=Array.from({length:50},(_,r)=>Array.from({length:50},(_,c)=>r*50+c)),run=problem.builder(grid),final=view(run.steps.at(-1));assert.equal(run.answer,2499);assert.equal(final.previousReachable,false);assert.ok(final.trace.truncated&&final.trace.omitted>0);assert.ok(run.steps.length<=2001);assert.ok(JSON.stringify(run).length<20000000);
  for(const s of run.steps){const v=view(s);assert.ok(v.rows.length<=6&&v.cols.length<=6);for(const row of v.cells)for(const cell of row)assert.equal(cell.height,grid[cell.r][cell.c]);}
});

test("778 displayed code executes in the actual live editor tracer",()=>{
  const source=fs.readFileSync(require.resolve('../public/live-editor.js'),'utf8'),template=source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1];
  const program=vm.runInNewContext(template)+`\nimport sys,json
payload=json.load(sys.stdin)
print(json.dumps([__viz_run_trace(payload['code'],'swimInWater',[grid])['result'] for grid in payload['grids']]))
`;
  assert.deepEqual(python(program,{code:problem.code.join('\n'),grids:cases}),cases.map(oracle));
});

test("778 renderer restores each picture and retains start/target bottlenecks in both themes/languages",()=>{
  const context={escapeHtml:String};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-swim-in-rising-water-778.js'),'utf8'),context);const Klass=vm.runInContext('SwimRising778Visualizer',context);
  for(const language of ['vi','en']){const host={innerHTML:''},renderer=new Klass({host,language});for(const grid of cases){const run=problem.builder(grid);for(const s of run.steps){renderer.render(JSON.parse(JSON.stringify(s)));assert.match(host.innerHTML,/sr778-map/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);}renderer.render(run.steps[0]);const first=host.innerHTML;renderer.render(run.steps.at(-1));assert.match(host.innerHTML,/sr778-cell [^"]*path bottleneck/);assert.equal((host.innerHTML.match(/sr778-cell [^"]*path bottleneck/g)||[]).length,1);renderer.render(run.steps[0]);assert.equal(host.innerHTML,first);}}
  const css=fs.readFileSync(require.resolve('../public/swim-in-rising-water-778.css'),'utf8');assert.match(css,/\.sr778-cell\.probe \.halo/);assert.match(css,/\[data-theme="light"\] \.sr778-viz/);
});

test("778 dedicated assets stay lazy and precede the legacy renderer",()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');assert.match(html,/renderer-swim-in-rising-water-778\.js/);assert.match(html,/swim-in-rising-water-778\.css/);assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/(?:renderer-)?swim-in-rising-water-778\.(?:js|css)/);
  const source=fs.readFileSync(require.resolve('../public/script.js'),'utf8');assert.ok(source.indexOf('step.swimDijkstra778View')<source.indexOf('step.swimWater778View'));
});
