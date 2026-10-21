const {test} = require('node:test');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const fs = require('node:fs'), vm = require('node:vm');
const problem = require('../problems').SUPPORTED[475];
const oracle = (houses,heaters) => Math.max(...houses.map(house => Math.min(...heaters.map(heater => Math.abs(heater-house)))));
const cases = [
  [[1,2,3],[2]],[[1,2,3,4],[1,4]],[[1,5],[2]],[[1,2,3,5,15],[2,9]],
  [[9,1,4],[8,2]],[[4,4,8],[8,4]],[[1],[1000000000]],[[1000000000],[1]],
  [[1],[1]],[[6],[4,8]],[[3,1,2],[9,9]],[[8,9],[1,2]],[[10],[11,8,8,12]],
];
let seed = 475;
function random(n) {seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
for (let i=0;i<150;i++) cases.push([Array.from({length:1+random(7)},()=>1+random(35)),Array.from({length:1+random(7)},()=>1+random(35))]);

test('475 answers, coverage and bottleneck prove the minimum radius against an independent oracle',()=>{
  for (const [houses,heaters] of cases) {
    const before=JSON.stringify([houses,heaters]), run=problem.builder(houses,{heaters});
    assert.equal(run.answer,oracle(houses,heaters));
    const last=run.steps.at(-1).heaters475View;
    assert.equal(last.bottleneck.nearest,run.answer);
    assert.equal(Math.abs(last.bottleneck.house-last.bottleneck.heaterPosition),run.answer);
    assert.ok(houses.every(h=>heaters.some(t=>Math.abs(h-t)<=run.answer)));
    if(run.answer>0) assert.ok(houses.some(h=>heaters.every(t=>Math.abs(h-t)>run.answer-1)));
    assert.equal(JSON.stringify([houses,heaters]),before);
    assert.ok(run.steps.at(-1).final);
  }
});

test('475 every executed line, sorting mutation and complete local snapshots match CPython',()=>{
  const python=`import json,sys
data=json.load(sys.stdin)
ns={}
exec(compile(data['code'],'<475>','exec'),ns)
out=[]
for houses,heaters in data['cases']:
    events,pending=[],None
    def trace(frame,event,arg):
        global pending
        if frame.f_code.co_filename!='<475>': return trace
        if event in ('line','return'):
            if pending is not None:
                values=dict(frame.f_locals)
                values['self']={}
                events.append(json.loads(json.dumps({'line':pending,'locals':values})))
            pending=frame.f_lineno if event=='line' else None
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().findRadius(houses,heaters)
    sys.settrace(None)
    out.append({'answer':answer,'events':events})
print(json.dumps(out))`;
  const result=spawnSync('python',['-c',python],{input:JSON.stringify({code:problem.code.join('\n'),cases}),encoding:'utf8',maxBuffer:48*1024*1024});
  assert.equal(result.status,0,result.stderr);
  JSON.parse(result.stdout).forEach((actual,i)=>{
    const run=problem.builder(cases[i][0],{heaters:cases[i][1]});
    assert.equal(run.answer,actual.answer);
    assert.deepEqual(run.steps.map(s=>({line:s.codeLines[0],locals:Object.fromEntries(s.vars.map(v=>[v.name,v.rawValue]))})),actual.events,JSON.stringify(cases[i]));
  });
});

test('475 trace does not invent binary-search locals or future radius/distance updates',()=>{
  const run=problem.builder([15,1,4],{heaters:'9,2'}), first=run.steps[0];
  assert.deepEqual(first.heaters475View.heaters,[2,9]);
  assert.deepEqual(first.heaters475View.originalHeaters,[9,2]);
  assert.equal(first.heaters475View.radius,null);
  assert.deepEqual(first.vars.map(v=>v.name),['self','houses','heaters']);
  for(const step of run.steps) {
    const v=step.heaters475View;
    assert.equal(v.source,problem.code[v.line-1].trim());
    assert.notEqual(v.line,11);
    if(v.event==='house') {assert.equal(v.left,null);assert.equal(v.nearest,null);assert.deepEqual(v.distances,{left:null,right:null});}
    if(v.event==='mid') assert.ok(v.left<=v.mid && v.mid<v.right);
    if(v.event==='position') {assert.equal(v.left,v.right);assert.ok(v.heaters.slice(0,v.left).every(t=>t<v.house));assert.ok(v.heaters.slice(v.left).every(t=>t>=v.house));}
    if(v.update) {assert.equal(v.update.after,Math[v.update.operator](v.update.before,v.update.candidate));if(v.update.name==='radius') assert.equal(v.radius,v.update.after);else assert.equal(v.nearest,v.update.after);}
  }
  assert.equal(first.heaters475View.history.length,0);
  assert.equal(run.steps.find(s=>s.heaters475View.event==='radius').heaters475View.history.length,1);
});

test('475 validation, string heater input and live arguments preserve both unsorted arrays',()=>{
  assert.equal(problem.extraParams[0].type,'string');
  assert.deepEqual(problem.liveArgs([3,1,2],{heaters:'9,2'}),[[3,1,2],[9,2]]);
  assert.deepEqual(problem.liveArgs('[3,1,2]',{heaters:'[9,2]'}),[[3,1,2],[9,2]]);
  assert.deepEqual(problem.liveArgs([1]),[[1],[2,9]]);
  for(const [houses,heaters] of [[[],[2]],[[1],[]],[[0],[1]],[[1],[1000000001]],[[1.5],[2]],[[true],[2]],[[1],'1,,2'],[[1],''],[[1],'[false]'],[null,[1]],[[1],Array(30001).fill(2)]]) {
    assert.throws(()=>problem.builder(houses,{heaters}));
    assert.throws(()=>problem.liveArgs(houses,{heaters}));
  }
});

test('475 large input computes all houses and heaters with an explicitly labeled bounded preview',()=>{
  const houses=Array(30000).fill(1);houses[29999]=1000000000;
  const run=problem.builder(houses,{heaters:[1]});
  assert.equal(run.answer,999999999);
  assert.equal(run.steps.length,1);
  const last=run.steps[0];
  assert.deepEqual(last.codeLines,[]);assert.deepEqual(last.vars,[]);
  assert.equal(last.heaters475View.bottleneck.index,29999);
  assert.equal(last.heaters475View.houses.length,12);
  const heaters=Array.from({length:29999},(_,i)=>i+1).concat(1000000000);
  const hidden=problem.builder([1000000000],{heaters});
  assert.equal(hidden.answer,0);
  assert.equal(hidden.steps[0].heaters475View.bottleneck.heaterPosition,1000000000);
});

function rendererContext() {
  const listeners={}, controls={};
  const host={innerHTML:'',querySelector:selector=>({clientWidth:500,addEventListener:(_,callback)=>{listeners[selector]=callback;}}),querySelectorAll:selector=>controls[selector]||[]};
  const context={lang:'vi',$:()=>host,escapeHtml:s=>String(s).replaceAll('<','&lt;').replaceAll('"','&quot;'),stopPlay(){},renderStep(){},steps:[],stepIndex:0};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-heaters-475.js'),'utf8'),context);
  return {context,listeners,controls,host};
}
test('475 diagram geometry keeps coordinate order, zero-radius coverage, duplicates and billion-scale gaps correct',()=>{
  const {context}=rendererContext();
  for(const [houses,heaters] of cases) {
    const g=context.heaters475Geometry(houses,heaters);
    assert.ok(g.positions.every((p,i)=>i===0 || g.x(g.positions[i-1])<g.x(p)));
    for(const value of g.positions) {assert.ok(g.x(value)>=20 && g.x(value)<=g.width-20);assert.ok(Number.isFinite(g.x(value)));}
    for(const h of houses) for(const t of heaters) for(const radius of [0,1,Math.abs(t-h)]) {
      if(Math.abs(t-h)<=radius) assert.ok(g.x(t-radius)<=g.x(h) && g.x(h)<=g.x(t+radius));
    }
  }
  assert.equal(context.heaters475Geometry([1,2,1000000000],[1]).proportional,false);
});

test('475 pictures render all frames in both languages and radius previews expose uncovered houses',()=>{
  const {context,listeners,controls,host}=rendererContext();
  for(const language of ['vi','en']) for(const [houses,heaters] of cases.slice(0,13)) {
    context.lang=language;
    for(const step of problem.builder(houses,{heaters}).steps) {
      context.renderHeaters475Pictures(step);
      assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);
      assert.match(host.innerHTML,/h475-road/);
      if(step.final) assert.match(host.innerHTML,/h475-proof/);
    }
  }
  context.lang='en';context.steps=problem.builder([1,5],{heaters:'2'}).steps;
  context.renderHeaters475Pictures(context.steps[0]);
  listeners['[data-h475-next]']();assert.equal(context.steps[context.stepIndex].heaters475View.event,'house');
  listeners['[data-h475-result]']();assert.equal(context.stepIndex,context.steps.length-1);
  let preview;
  controls['[data-h475-radius]']=[{dataset:{h475Radius:'2'},addEventListener:(_,cb)=>{preview=cb;}}];
  const final=context.steps.at(-1);
  context.renderHeaters475Pictures(final);
  assert.match(host.innerHTML,/All houses covered/);
  preview();assert.match(host.innerHTML,/1 houses uncovered/);assert.match(host.innerHTML,/Preview radius/);
  assert.equal(final.heaters475View.radius,3);
  context.renderHeaters475Pictures(problem.builder(Array(13).fill(1),{heaters:'2'}).steps[0]);
  assert.match(host.innerHTML,/off-screen heaters may cover houses/);
  assert.doesNotMatch(host.innerHTML,/All houses covered/);
});

test('475 actual editable-code tracer receives both arrays and returns the same answer',()=>{
  const source=fs.readFileSync(require.resolve('../public/live-editor.js'),'utf8');
  const tracer=vm.runInNewContext(source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1]);
  const python=tracer+`\nimport json,sys\ndata=json.load(sys.stdin)\nprint(json.dumps([__viz_run_trace(data['code'],'findRadius',args) for args in data['args']]))`;
  const selected=cases.slice(0,13);
  const execution=spawnSync('python',['-c',python],{input:JSON.stringify({code:problem.code.join('\n'),args:selected.map(([houses,heaters])=>problem.liveArgs(houses,{heaters}))}),encoding:'utf8',maxBuffer:8*1024*1024});
  assert.equal(execution.status,0,execution.stderr);
  JSON.parse(execution.stdout).forEach((run,i)=>{assert.equal(run.result,oracle(...selected[i]));assert.ok(run.trace.length>0);assert.deepEqual(run.trace.at(-1).vars.houses,selected[i][0]);assert.deepEqual(run.trace.at(-1).vars.heaters,[...selected[i][1]].sort((a,b)=>a-b));});
});
