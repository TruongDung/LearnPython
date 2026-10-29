'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {spawnSync} = require('node:child_process');
const problem = require('../problems').SUPPORTED[3667];
const builders = [problem.builder,problem.builder2];
const examples = [[3,-1,-4,1,5],[-100,100],[0],[-5,-4,-3,-2,-1],[-2,2,-2,2],[0,-1,0,1,-100,100],[100,-100,0],Array.from({length:100},(_,i)=>i-50)];
const oracle = nums => Array.from({length:101},(_,key)=>nums.filter(value=>Math.abs(value)===key)).flat();

test('3667 both displayed algorithms match magnitude buckets, preserve signs and stable ties, and never mutate the input',()=>{
  const cases = [...examples];
  for (const a of [-2,-1,0,1,2]) for (const b of [-2,-1,0,1,2]) for (const c of [-2,-1,0,1,2]) cases.push([a,b,c]);
  for (const nums of cases) for (const builder of builders) {
    const before = [...nums], run = builder(nums);
    assert.deepEqual(run.answer,oracle(nums)); assert.deepEqual(nums,before);
    assert.deepEqual(run.original,before); assert.equal(run.steps.filter(step=>step.final).length,1);
    assert.equal(run.steps.at(-1).absolute3667View.done,true);
  }
  assert.equal(problem.difficulty,'easy'); assert.equal(problem.premium,true);
  assert.equal(problem.debugMode,'line-by-line'); assert.equal(problem.inputKind,'integer');
});

test('every completed source line, actual local, suspended outer frame and helper return matches independent CPython tracing',()=>{
  const cases = examples.slice(0,-1).flatMap(nums=>[1,2].map(block=>({nums,block,code:(block===1?problem.code:problem.code2).join('\n')})));
  const script = `import json,sys,types
runs=[]
def local(f):return json.loads(json.dumps({k:v for k,v in f.f_locals.items() if k!='self' and not callable(v) and not isinstance(v,types.ModuleType)}))
for case in json.load(sys.stdin):
 scope={};exec(compile(case['code'],'<lesson>','exec'),scope);pending={};events=[]
 def trace(f,event,arg):
  if f.f_code.co_filename!='<lesson>':return trace
  if event in ('line','return'):
   if f in pending:
    frames=[];outer=f;cursor=f
    while cursor:
     if cursor.f_code.co_filename=='<lesson>':outer=cursor;frames.append({'name':cursor.f_code.co_name,'locals':local(cursor)})
     cursor=cursor.f_back
    events.append({'line':pending.pop(f),'scope':f.f_code.co_name,'locals':local(f),'outer':local(outer),'frames':list(reversed(frames)),'returning':event=='return','returned':arg if event=='return' else None})
   if event=='line':pending[f]=f.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().sortByAbsoluteValue(case['nums']);sys.settrace(None);runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const python = spawnSync('python3',['-c',script],{input:JSON.stringify(cases),encoding:'utf8',maxBuffer:32e6});
  assert.equal(python.status,0,python.stderr);
  JSON.parse(python.stdout).forEach((reference,index)=>{
    const c = cases[index], run = builders[c.block-1](c.nums);
    assert.deepEqual(run.answer,reference.answer); assert.equal(run.steps.length,reference.events.length);
    run.steps.forEach((step,j)=>{
      const view = step.absolute3667View, expected = reference.events[j];
      assert.deepEqual(step.codeLines,[expected.line]); assert.equal(step.codeBlock,c.block);
      for (const key of ['locals','outer','frames','scope','returning','returned']) assert.deepEqual(view[key],expected[key],`${c.block} L${expected.line} ${key}`);
      for (const variable of step.vars) assert.deepEqual(variable.value,expected.locals[variable.name]??'—');
      assert.equal(view.source.timing,'after');
    });
  });
});

test('the pictures move, insert, compare and reveal sorted output only at the statements that actually perform those operations',()=>{
  for (const nums of examples) for (let block=1;block<=2;block++) {
    const run = builders[block-1](nums); let previous = null, checks=0, shifts=0, placements=0;
    for (const step of run.steps) {
      const v = step.absolute3667View, x = {...v.outer,...v.locals}, line = v.source.line;
      assert.equal(v.answer===null,!step.final);
      assert.deepEqual(v.result,x.result??null); assert.deepEqual(v.keys,x.keys??[]);
      if (block===1) {
        if (previous && JSON.stringify(previous.result)!==JSON.stringify(v.result)) assert.ok([3,10,12].includes(line));
        if (line===9) {checks++; assert.equal(v.comparison.shift,x.j>=0&&Math.abs(x.result[x.j])>x.key);}
        if (line===10) {shifts++; assert.deepEqual(v.move,{from:x.j,to:x.j+1,value:x.result[x.j]}); assert.equal(v.gap,x.j);}
        if (line===12) {placements++; assert.equal(v.prefix,x.i+1); assert.equal(v.gap,null); assert.equal(v.held,null);}
        if (line===6) {assert.equal(v.held,x.value); assert.equal(v.heldKey,null); assert.equal(v.cursor,null);}
        if (line===7) assert.equal(v.heldKey,Math.abs(v.held));
        assert.equal(v.checks,checks); assert.equal(v.shifts,shifts); assert.equal(v.placed,placements);
        if (v.comparison?.shift) assert.notEqual(Math.abs(v.comparison.left),v.comparison.key,'ties do not shift');
      } else {
        if (v.result!==null) {assert.ok(v.scope==='sortByAbsoluteValue'&&line>=8); assert.equal(v.keys.length,nums.length);}
        if (v.event==='save-key') assert.deepEqual(v.keys,nums.slice(0,v.keys.length).map(Math.abs));
        if (v.scope==='distance'&&v.returning) assert.equal(v.returned,Math.abs(v.locals.value));
      }
      previous=v;
    }
  }
});

function renderer(lang,extra={}) {
  const host={innerHTML:'',querySelector:()=>null}, context={lang,escapeHtml:String,$:()=>host,...extra};
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-sort-absolute-3667.js'),'utf8'),context);
  return {context,host,render:step=>{context.renderAbsolute3667Pictures(step);return host.innerHTML;}};
}
test('both languages render exact live arrays and absolute-height bars, retain actual duplicate shift values, and replay without mutation',()=>{
  for (const lang of ['vi','en']) for (const nums of examples.slice(0,-1)) for (const builder of builders) {
    const run=builder(nums), saved=JSON.stringify(run), {render}=renderer(lang);
    for (const step of run.steps) {
      const v=step.absolute3667View, html=render(step);
      assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object|<p\b|<table\b/);
      assert.match(html,/a3667-axis/); assert.match(html,/a3667-cards/);
      const values=[...html.matchAll(/data-slot="\d+" data-value="([^"]*)"/g)].map(m=>m[1]);
      assert.deepEqual(values,[...nums.map(String),...(v.result??nums.map(()=>null)).map(value=>value===null?'':String(value))]);
      const bars=[...html.matchAll(/data-bar="\d+" data-height="([^"]*)"/g)].map(m=>m[1]);
      assert.deepEqual(bars,(v.result??nums.map(()=>null)).map(value=>value===null?'':String(Math.abs(value))));
      if (v.move?.from!=='held'&&v.move) assert.match(html,/class="a3667-move"/);
    }
    const first=render(run.steps[0]);render(run.steps.at(-1));assert.equal(render(run.steps[0]),first);assert.equal(JSON.stringify(run),saved);
  }
});

test('event navigation reaches real comparisons, shifts or placements and safely terminates for single values and equal magnitudes',()=>{
  for (const nums of [problem.defaultInput,[0],[-1,1,-1,1]]) for (const builder of builders) {
    for (const [id,events] of [['a3667NextCompare',['compare','key']],['a3667NextShift',['shift','sort']],['a3667NextPlace',['place','sort']]]) {
      const run=builder(nums), handlers={}, host={innerHTML:'',querySelector:selector=>({addEventListener:(_,fn)=>handlers[selector]=fn})};
      const {context,render}=renderer('vi',{$:()=>host,steps:run.steps,stepIndex:0,stopPlay(){},renderStep(){}});render(run.steps[0]);
      handlers['#'+id]();assert.ok(events.includes(run.steps[context.stepIndex].absolute3667View.event)||run.steps[context.stepIndex].final);
      for (let i=0;i<50;i++) handlers['#'+id]();assert.equal(context.stepIndex,run.steps.length-1);
    }
  }
});

test('3667 validates typed inputs, supports both live editors and lazy assets, and keeps theme, sticky watches and horizontal source scoped',()=>{
  for (const bad of [[],[101],[-101],[1.2],[true],['1'],[null],null,Array(101).fill(0)]) for (const builder of builders) assert.throws(()=>builder(bad));
  assert.deepEqual(problem.liveArgs(problem.defaultInput),[problem.defaultInput]);assert.deepEqual(problem.liveArgs2(problem.defaultInput),[problem.defaultInput]);
  assert.equal(problem.extraParams.find(p=>p.key==='approach').options.length,2);
  assert.equal(problem.builder(problem.defaultInput,{approach:2}).steps[0].codeBlock,2);
  const run=problem.builder(problem.defaultInput), saved=JSON.stringify(run);run.steps[0].absolute3667View.result[0]=99;
  assert.equal(JSON.stringify(problem.builder(problem.defaultInput)),saved);
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'), css=fs.readFileSync(require.resolve('../public/sort-absolute-3667.css'),'utf8'), script=fs.readFileSync(require.resolve('../public/script.js'),'utf8');
  for (const asset of ['renderer-sort-absolute-3667.js','sort-absolute-3667.css']) assert.ok(html.split('\n').some(line=>line.includes(asset)&&line.includes('data-problem-ids="3667"')));
  assert.match(script,/Boolean\(step.absolute3667View\)[^\n]*renderAbsolute3667Pictures\(step\)/);
  assert.match(css,/\[data-theme="light"\] \.a3667-viz/);assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);assert.match(css,/#varsPanel[^}]*position:sticky/);
});
