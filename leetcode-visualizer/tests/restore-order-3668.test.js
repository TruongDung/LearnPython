'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[3668];
const examples=[
  {order:[3,1,2,5,4],friends:[1,3,4],answer:[3,1,4]},
  {order:[1,4,5,3,2],friends:[2,5],answer:[5,2]},
  {order:[1],friends:[1],answer:[1]},
  {order:[4,3,2,1],friends:[1],answer:[1]},
  {order:[4,3,2,1],friends:[1,2,3,4],answer:[4,3,2,1]},
];
function oracle(order,friends) {const rank=new Map(order.map((id,index)=>[id,index]));return [...friends].sort((a,b)=>rank.get(a)-rank.get(b));}
function* permutations(values) {if (!values.length) {yield [];return;}for (let i=0;i<values.length;i++) for (const rest of permutations(values.filter((_,index)=>index!==i))) yield [values[i],...rest];}

test('3668 matches independent rank sorting for every permutation and nonempty friend subset up to four runners, examples and 100-runner input',()=>{
  const cases=[...examples,{order:Array.from({length:100},(_,i)=>100-i),friends:[1,2,3,4,5,6,7,8]}];
  for(let n=1;n<=4;n++) for(const order of permutations(Array.from({length:n},(_,i)=>i+1))) for(let mask=1;mask<1<<n;mask++) cases.push({order,friends:Array.from({length:n},(_,i)=>i+1).filter(id=>mask>>(id-1)&1)});
  for(const c of cases) {
    const saved=JSON.stringify(c),run=problem.builder(c.order,{friends:c.friends});
    assert.deepEqual(run.answer,c.answer??oracle(c.order,c.friends));assert.equal(JSON.stringify(c),saved);
    assert.deepEqual(run.original,c.order);assert.equal(run.steps.filter(s=>s.final).length,1);assert.ok(run.steps.at(-1).final);
  }
  assert.equal(problem.inputKind,'positive');assert.equal(problem.debugMode,'line-by-line');assert.equal(problem.difficulty,'easy');
});

test('each completed Python statement, set, list, local, branch frame and return matches independent native CPython',()=>{
  const script=`import sys,json,types
code=sys.stdin.readline();source=json.loads(code);runs=[]
def encode(v):
 if isinstance(v,(list,tuple)):return [encode(x) for x in v]
 if isinstance(v,set):return sorted(v)
 return v
def local(f):return {k:encode(v) for k,v in f.f_locals.items() if k!='self' and not callable(v) and not isinstance(v,types.ModuleType)}
for case in json.load(sys.stdin):
 scope={};exec(compile(source,'<lesson>','exec'),scope);pending={};events=[]
 def trace(f,event,arg):
  if f.f_code.co_filename!='<lesson>':return trace
  if event in ('line','return'):
   if f in pending:
    frames=[];outer=f;cursor=f
    while cursor:
     if cursor.f_code.co_filename=='<lesson>':outer=cursor;frames.append({'name':cursor.f_code.co_name,'locals':local(cursor)})
     cursor=cursor.f_back
    events.append({'line':pending.pop(f),'scope':f.f_code.co_name,'locals':local(f),'outer':local(outer),'frames':list(reversed(frames)),'returning':event=='return','returned':encode(arg) if event=='return' else None})
   if event=='line':pending[f]=f.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().recoverOrder(case['order'],case['friends']);sys.settrace(None);runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const p=spawnSync('python3',['-c',script],{input:JSON.stringify(problem.code.join('\n'))+'\n'+JSON.stringify(examples),encoding:'utf8',maxBuffer:32e6});assert.equal(p.status,0,p.stderr);
  JSON.parse(p.stdout).forEach((reference,index)=>{
    const run=problem.builder(examples[index].order,{friends:examples[index].friends});assert.deepEqual(run.answer,reference.answer);assert.equal(run.steps.length,reference.events.length);
    run.steps.forEach((step,j)=>{const v=step.finishing3668View,e=reference.events[j];assert.deepEqual(step.codeLines,[e.line]);for(const name of ['scope','locals','outer','frames','returning','returned'])assert.deepEqual(v[name],e[name],`L${e.line} ${name}`);for(const variable of step.vars)assert.deepEqual(variable.value,Object.hasOwn(e.locals,variable.name)?e.locals[variable.name]:'—');assert.equal(v.source.timing,'after');});
  });
});

test('lookup, scan progress, rejection and result changes occur only at the real source statement, without premature filled slots or stale verdicts',()=>{
  for(const c of examples) {
    const run=problem.builder(c.order,{friends:c.friends});let previous=null,scanned=0,added=0;
    for(const step of run.steps) {
      const v=step.finishing3668View,x=v.locals,line=v.source.line;
      assert.deepEqual(v.result,x.result??null);assert.deepEqual(v.friendSet,x.friend_set??null);assert.equal(v.answer===null,!step.final);
      assert.deepEqual((v.result??[]),v.added.map(position=>c.order[position]));
      if(previous&&JSON.stringify(previous.result)!==JSON.stringify(v.result))assert.ok(line===4||line===8);
      if(line===5){assert.equal(v.verdict,null);assert.equal(v.active,v.branch?x.position:null);}
      if(line===6){scanned++;assert.equal(v.verdict,c.friends.includes(x.runner));assert.equal(v.active,x.position);}
      if(line===7){assert.equal(v.branch,x.is_friend);assert.equal(v.event,x.is_friend?'accept':'skip');}
      if(line===8){added++;assert.deepEqual(v.move,{from:x.position,to:added-1,runner:x.runner});}
      else assert.equal(v.move,null);
      assert.equal(v.checked.length,scanned);assert.equal(v.added.length,added);previous=v;
    }
  }
});

function renderer(lang,extra={}) {const host={innerHTML:'',querySelector:()=>null},context={lang,$:()=>host,...extra};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-restore-order-3668.js'),'utf8'),context);return {context,host,render:step=>{context.renderFinishing3668Pictures(step);return host.innerHTML;}};}
test('both languages show exact jersey IDs, global finish ranks, actual set and only written answers, with stable replay',()=>{
  for(const lang of ['vi','en']) for(const c of examples) {
    const run=problem.builder(c.order,{friends:c.friends}),saved=JSON.stringify(run),{render}=renderer(lang);
    for(const step of run.steps) {
      const v=step.finishing3668View,html=render(step);assert.match(html,/r3668-runner/);assert.match(html,/r3668-fork/);assert.doesNotMatch(html,/NaN|undefined|Infinity|object Object|<p\b|<table\b/);
      const order=[...html.matchAll(/data-order-slot="\d+" data-runner="([^"]*)"/g)].map(m=>Number(m[1]));assert.deepEqual(order,c.order);
      const result=[...html.matchAll(/data-result-slot="\d+" data-runner="([^"]*)"/g)].map(m=>m[1]);assert.deepEqual(result,c.friends.map((_,index)=>v.result?.[index]===undefined?'':String(v.result[index])));
      const set=[...html.matchAll(/data-friend="(\d+)"/g)].map(m=>+m[1]);assert.deepEqual(set,v.friendSet??[]);
      v.added.forEach((position,index)=>assert.ok(html.includes('🏁 '+(position+1))));
    }
    const first=render(run.steps[0]);render(run.steps.at(-1));assert.equal(render(run.steps[0]),first);assert.equal(JSON.stringify(run),saved);
  }
});

test('next lookup, append and skip navigate actual events and terminate safely with all friends or one runner',()=>{
  for(const c of examples) for(const [id,event] of [['r3668NextCheck','lookup'],['r3668NextAdd','append'],['r3668NextSkip','skip']]) {
    const run=problem.builder(c.order,{friends:c.friends}),handlers={},host={innerHTML:'',querySelector:selector=>({addEventListener:(_,fn)=>handlers[selector]=fn})};
    const {context,render}=renderer('vi',{$:()=>host,steps:run.steps,stepIndex:0,stopPlay(){},renderStep(){}});render(run.steps[0]);handlers['#'+id]();assert.ok(run.steps[context.stepIndex].finishing3668View.event===event||run.steps[context.stepIndex].final);
    for(let i=0;i<15;i++)handlers['#'+id]();assert.equal(context.stepIndex,run.steps.length-1);
  }
});

test('3668 validates permutations and increasing friend IDs, uses typed live arguments and lazy day/night assets with horizontal code and sticky watches',()=>{
  for(const order of [[],[0],[2],[1,1],[1,3],[true],[1.5],Array(101).fill(1)])assert.throws(()=>problem.builder(order,{friends:[1]}));
  for(const friends of [[],[0],[6],[3,1],[1,1],[true],['1'],'1,,3','broken'])assert.throws(()=>problem.builder(problem.defaultInput,{friends}));
  assert.throws(()=>problem.builder(Array.from({length:9},(_,i)=>i+1),{friends:Array.from({length:9},(_,i)=>i+1)}));
  assert.deepEqual(problem.liveArgs(problem.defaultInput,{friends:'[1,3,4]'}),[problem.defaultInput,[1,3,4]]);
  const one=problem.builder(problem.defaultInput),saved=JSON.stringify(one);one.steps[0].finishing3668View.friendSet.push(100);assert.equal(JSON.stringify(problem.builder(problem.defaultInput)),saved);
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/restore-order-3668.css'),'utf8'),script=fs.readFileSync(require.resolve('../public/script.js'),'utf8');
  for(const asset of ['restore-order-3668.css','renderer-restore-order-3668.js'])assert.ok(html.split('\n').some(line=>line.includes(asset)&&line.includes('data-problem-ids="3668"')));
  assert.match(script,/Boolean\(step.finishing3668View\)[^\n]*renderFinishing3668Pictures\(step\)/);assert.match(css,/\[data-theme="light"\] \.r3668-viz/);assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);assert.match(css,/#varsPanel[^}]*position:sticky/);
});
