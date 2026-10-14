"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[2594];
const PYTHON = "C:/Users/david.truong/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const cases = [ [[4,2,3,1],10,16], [[5,1,8],6,16], [[1],1,1], [[100],1000000,100000000000000], [[1],1000000,1000000000000], [[4,4],5,36], [[2,1,2,3,1],9,8] ];
function python(program,input) {
  const run = spawnSync(PYTHON,["-c",program],{encoding:"utf8",input:JSON.stringify(input),maxBuffer:32*1024*1024});
  assert.equal(run.status,0,run.stderr);return JSON.parse(run.stdout);
}
// Brute force counts each car by its exact completion time, without square roots or binary search.
function brute(ranks,cars) {
  for(let time=0;;time++) {
    let total=0;
    for(const rank of ranks)for(let k=1;rank*k*k<=time;k++)total++;
    if(total>=cars)return time;
  }
}

test("2594 grouped binary search matches samples and an independent exhaustive clock", () => {
  for(const [ranks,cars,answer] of cases)assert.equal(problem.builder(ranks,{cars}).answer,answer);
  let seed=2594;const random=()=>seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  for(let i=0;i<120;i++) {
    const ranks=Array.from({length:1+random()%6},()=>1+random()%10),cars=1+random()%14;
    assert.equal(problem.builder(ranks,{cars}).answer,brute(ranks,cars));
  }
});

test("2594 every source line and local snapshot matches CPython, including repeated ranks and large times", () => {
  const program=problem.code.join("\n")+`\nimport sys,json
results=[]
for ranks,cars,_ in json.load(sys.stdin):
    events=[]
    def trace(frame,event,arg):
        if frame.f_code.co_name=='repairCars' and event=='line':
            events.append({'line':frame.f_lineno,'locals':{k:v for k,v in frame.f_locals.items() if k not in ('self','ranks')}})
        return trace
    sys.settrace(trace)
    answer=Solution().repairCars(ranks,cars)
    sys.settrace(None)
    results.append({'answer':answer,'events':events})
print(json.dumps(results))
`;
  python(program,cases).forEach((expected,i)=>{
    const [ranks,cars]=cases[i],run=problem.builder(ranks,{cars});
    assert.equal(run.answer,expected.answer);
    assert.deepEqual(run.steps.map(s=>({line:s.codeLines[0],locals:s.repairCars2594View.locals})),expected.events);
  });
});

test("2594 addition occurs after its source line and all groups work at the same trial time", () => {
  for(const [ranks,cars] of cases) {
    const run=problem.builder(ranks,{cars});
    for(let i=0;i<run.steps.length;i++) {
      const v=run.steps[i].repairCars2594View;
      assert.equal(v.source.text,problem.code[v.source.line-1]);assert.equal(v.source.timing,"before");
      if(v.phase==="add") {
        const next=run.steps[i+1].repairCars2594View;
        const g=v.groups.find(g=>g.active),k=g.preview;
        assert.equal(g.done,false);
        assert.equal(next.locals.repaired,v.locals.repaired+g.count*k);
        assert.equal(next.processed,v.processed+1);
        assert.ok(g.rank*k*k<=v.time&&g.rank*(k+1)**2>v.time);
      }
      for(const g of v.groups.filter(g=>g.done))assert.ok(g.rank*g.capacity*g.capacity<=v.time&&g.rank*(g.capacity+1)**2>v.time);
      if(v.nextLo!==undefined)assert.ok(v.nextHi-v.nextLo<v.hi-v.lo);
      if(v.complete&&!v.final)assert.equal(v.repaired,v.locals.repaired);
    }
    const final=run.steps.at(-1).repairCars2594View;
    assert.ok(final.repaired>=cars&&final.previousCapacity<cars);
    assert.equal(final.proofTime,final.answer-1);
  }
});

test("2594 maximum inputs keep every line event while condensing the picture", () => {
  for(const ranks of [Array(100000).fill(100),Array.from({length:100000},(_,i)=>i%100+1)]) {
    const run=problem.builder(ranks,{cars:1000000}),v=run.steps.at(-1).repairCars2594View;
    assert.ok(v.repaired>=1000000&&v.previousCapacity<1000000);
    assert.ok(run.steps.length<10000);
    for(const step of run.steps)assert.ok(step.repairCars2594View.groups.length<=6);
    assert.ok(JSON.stringify(run).length<35000000);
    const additions=run.steps.filter(s=>s.codeLines[0]===13).length;
    assert.equal(additions,v.round*v.groupCount);
  }
});

test("2594 enforces official input constraints and prepares typed live arguments", () => {
  for(const ranks of [[],[0],[-1],[101],[1.5],[NaN],[true],Array(100001).fill(1)])assert.throws(()=>problem.builder(ranks,{cars:1}),/2594: ranks/);
  for(const cars of [0,-1,1000001,1.5,true,null,"","1.5",NaN])assert.throws(()=>problem.builder([1],{cars}),/2594: cars/);
  assert.deepEqual(problem.liveArgs([4,2,3,1],{cars:"10"}),[[4,2,3,1],10]);
  assert.equal(problem.debugMode,"line-by-line");
  assert.match(problem.code.join("\n"),/isqrt\(mid \/\/ rank\)/);
});

test("2594 actual live editor tracer executes the code and preserves integer arithmetic", () => {
  const source=fs.readFileSync(require.resolve("../public/live-editor.js"),"utf8"),template=source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1];
  const program=vm.runInNewContext(template)+`\nimport json,sys
payload=json.load(sys.stdin)
results=[__viz_run_trace(payload['code'],'repairCars',[ranks,cars]) for ranks,cars,_ in payload['cases']]
print(json.dumps(results))
`;
  python(program,{code:problem.code.join("\n"),cases}).forEach((result,i)=>{
    const [ranks,cars,answer]=cases[i],run=problem.builder(ranks,{cars});
    assert.equal(result.result,answer);
    // Counter is repr'd by the live inspector; canonical snapshots above check its full contents.
    assert.deepEqual(result.trace.slice(0,-1).map(entry=>({line:entry.line,locals:Object.fromEntries(Object.entries(entry.vars).filter(([k])=>!['ranks','frequency'].includes(k)))})),run.steps.map(s=>({line:s.codeLines[0],locals:Object.fromEntries(Object.entries(s.repairCars2594View.locals).filter(([k])=>k!=='frequency'))})));
  });
});

test("2594 renders car illustrations in both languages and Prev restores the same picture", () => {
  const context={escapeHtml:String};vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-repair-cars-2594.js"),"utf8"),context);
  const Klass=vm.runInContext("RepairCars2594Visualizer",context);
  for(const language of ["vi","en"]) {
    const host={innerHTML:""},renderer=new Klass({host,language});
    for(const [ranks,cars] of cases) {
      const run=problem.builder(ranks,{cars});
      for(const step of run.steps) {renderer.render(JSON.parse(JSON.stringify(step)));assert.match(host.innerHTML,/rc2594-viz/);assert.match(host.innerHTML,/<svg/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);}
      renderer.render(run.steps[0]);const first=host.innerHTML;renderer.render(run.steps.at(-1));renderer.render(run.steps[0]);assert.equal(host.innerHTML,first);
    }
  }
});

test("2594 dedicated assets load lazily and renderer precedes generic binary search", () => {
  const html=fs.readFileSync(require.resolve("../public/index.html"),"utf8");
  assert.match(html,/renderer-repair-cars-2594\.js/);assert.match(html,/repair-cars-2594\.css/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,""),/(?:renderer-)?repair-cars-2594\.(?:js|css)/);
  const script=fs.readFileSync(require.resolve("../public/script.js"),"utf8");
  assert.ok(script.indexOf("step.repairCars2594View")<script.indexOf("step.guessNumber374View"));
});
