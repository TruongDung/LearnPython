'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[3331];

function oracle(parent,s) {
  const changed=[...parent];
  for(let x=1;x<parent.length;x++) for(let p=parent[x];p!==-1;p=parent[p]) if(s[p]===s[x]) {changed[x]=p;break;}
  const children=parent.map(()=>[]), size=parent.map(()=>1);
  for(let x=1;x<parent.length;x++) children[changed[x]].push(x);
  function count(x){for(const child of children[x])size[x]+=count(child);return size[x];}
  count(0);return {changed,size};
}

test('3331 recursive implementation matches independent simultaneous-reparenting oracle',()=>{
  const cases=[{p:[-1,0,0,1,1,1],s:'abaabc'},{p:[-1,0,1,2],s:'abab'},{p:[-1,2,0],s:'aaa'},{p:[-1],s:'z'}];
  let seed=1234567;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
  for(let n=2;n<=31;n++)for(let trial=0;trial<5;trial++)cases.push({p:Array.from({length:n},(_,x)=>x?random()%x:-1),s:Array.from({length:n},()=>String.fromCharCode(97+random()%4)).join('')});
  for(const {p,s} of cases) {
    const result=problem.builder(JSON.stringify(p),{s}), expected=oracle(p,s);
    assert.deepEqual(result.answer,expected.size,JSON.stringify({p,s}));
    const end=result.steps.at(-1);
    assert.deepEqual(end.subtree3331View.newParent,expected.changed);
    assert.deepEqual(end.subtree3331View.last,{});
    assert.deepEqual(end.subtree3331View.frames,[]);
    assert.equal(end.final,true);
    assert.equal(result.steps.filter(x=>x.final).length,1);
    assert.ok(result.steps.every(x=>x.codeLines.length===1));
  }
});

test('3331 uses original ancestors, restores previous node 0, and keeps snapshots isolated',()=>{
  const result=problem.builder('[-1,0,1,2]',{s:'abab'});
  assert.deepEqual(result.answer,[4,2,1,1]);
  const finds=result.steps.filter(s=>s.subtree3331View.phase==='find');
  assert.equal(finds.find(s=>s.subtree3331View.current===3).subtree3331View.newParent[3],1);
  const restore=result.steps.find(s=>s.codeLines[0]===33&&s.subtree3331View.current===2);
  assert.equal(restore.subtree3331View.last.a,0);
  assert.equal(restore.vars.find(v=>v.name==='prev').value,0);
  const firstPush=result.steps.find(s=>s.codeLines[0]===24);
  assert.deepEqual(firstPush.subtree3331View.last,{a:0});
  assert.deepEqual(firstPush.subtree3331View.size,[1,1,1,1]);
  for(const step of result.steps.filter(s=>s.subtree3331View.phase==='add')) {
    const v=step.subtree3331View,t=v.transfer;
    assert.equal(v.size[t.to],t.before+t.amount);
    assert.equal(v.size[t.from],t.amount);
    assert.equal(v.last[v.s[t.from]],v.frames.at(-1).prev??undefined);
  }
  const siblings=problem.builder('[-1,0,0,1]',{s:'abaa'});
  assert.equal(siblings.steps.find(s=>s.subtree3331View.phase==='find'&&s.subtree3331View.current===2).subtree3331View.last.a,0);
});

test('3331 displayed user Python and trace agree on lines, frame locals, last and size',()=>{
  const cases=[{parent:[-1],s:'a'},{parent:[-1,0,0,1,1,1],s:'abaabc'},{parent:[-1,0,1,2],s:'abab'},{parent:[-1,0,0,1],s:'abaa'},{parent:[-1,2,0],s:'aaa'}];
  const runner=`import sys,json,copy
source,cases=json.load(sys.stdin)
ns={}
exec(compile(source,'<solution>','exec'),ns)
out=[]
for case in cases:
    events=[]
    pending={}
    def snapshot(frame):
        return copy.deepcopy({k:v for k,v in frame.f_locals.items() if k in ('n','i','graph','size','last','x','c','new_parent','prev','child')})
    def trace(frame,event,arg):
        if frame.f_code.co_name in ('findSubtreeSizes','dfs') and event in ('line','return'):
            key=id(frame)
            if key in pending: events[pending[key]]['after']=snapshot(frame)
            if event=='line':
                pending[key]=len(events)
                events.append({'line':frame.f_lineno,'before':snapshot(frame)})
            else: pending.pop(key,None)
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().findSubtreeSizes(case['parent'],case['s'])
    sys.settrace(None)
    out.append({'answer':answer,'events':events})
print(json.dumps(out))`;
  const run=spawnSync('python3',['-c',runner],{input:JSON.stringify([problem.code.join('\n'),cases]),encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  JSON.parse(run.stdout).forEach((python,index)=>{
    const c=cases[index],result=problem.builder(JSON.stringify(c.parent),{s:c.s});
    assert.deepEqual(result.answer,python.answer);
    assert.deepEqual(result.steps.map(s=>s.codeLines[0]),python.events.map(e=>e.line));
    python.events.forEach((event,i)=>{
      const vars=Object.fromEntries(result.steps[i].vars.map(v=>[v.name,v.value]));
      const expected=[27,39].includes(event.line)?event.before:event.after;
      for(const [name,value] of Object.entries(expected))assert.deepEqual(vars[name],value,`case ${index}, step ${i}, L${event.line}, ${name}`);
    });
  });
  assert.ok(problem.code.includes('            new_parent = last.get(c, parent[x])'));
  assert.ok(problem.code.includes('                size[new_parent] += size[x]'));
  assert.equal(problem.code[0],'from typing import List');
});

test('3331 validates tree structure and labels without changing the inputs',()=>{
  for(const [p,s] of [['[]',''],['[0]','a'],['[-1,2,1]','aaa'],['[-1,1]','ab'],['[-1,3]','ab'],['[-1,0]','a\n'],['[-1]','A'],['bad','a'],[JSON.stringify([-1,...Array(31).fill(0)]),'a'.repeat(32)]])assert.throws(()=>problem.builder(p,{s}),/3331/);
  assert.deepEqual(problem.liveArgs('[-1,0]',{s:'aa'}),[[-1,0],'aa']);
});

test('3331 renderer handles both languages, find, restore and transfer states',()=>{
  const host={innerHTML:'',querySelectorAll:()=>[]};
  const context={lang:'vi',$:()=>host,escapeHtml:String,stepIndex:0,steps:[]};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-subtree-sizes-3331.js'),'utf8'),context);
  for(const lang of ['vi','en']) for(const [p,s] of [['[-1,0,0,1,1,1]','abaabc'],['[-1]','a'],['[-1,0,1,2,3]','ababa']]) {
    context.lang=lang;context.steps=problem.builder(p,{s}).steps;
    context.steps.forEach((step,index)=>{
      context.stepIndex=index;context.renderSubtreeSizes3331(step);
      assert.doesNotMatch(host.innerHTML,/undefined|NaN/);
      assert.match(host.innerHTML,/s3331-trees/);assert.match(host.innerHTML,/s3331-last/);
      if(step.subtree3331View.transfer)assert.match(host.innerHTML,/s3331-focus transfer/);
    });
    assert.match(host.innerHTML,/last<\/b>/);
  }
});
