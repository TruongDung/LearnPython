"use strict";
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const ids = [1136,2371,3481,3530,3620,3812];
const defaults = id => Object.fromEntries((SUPPORTED[id].extraParams||[]).map(p=>[p.key,p.default]));
const run = (id,input=SUPPORTED[id].defaultInput,p=defaults(id)) => SUPPORTED[id].builder(input,p);
function cases() {
  return [
    ...ids.map(id=>({id,input:SUPPORTED[id].defaultInput,p:defaults(id)})),
    {id:1136,input:'',p:{n:4}}, {id:1136,input:'1-2,2-3,3-1',p:{n:4}},
    {id:1136,input:'1-2,1-3,2-4,3-4,4-5',p:{n:5}},
    {id:2371,input:'[[9,2,7],[3,8,1]]',p:{}},{id:2371,input:'[[1]]',p:{}},
    {id:3481,input:'%A%_%B%',p:{replacements:'[["A","%B%%B%"],["B","<img>"]]'}},
    {id:3481,input:'%A%_%B%_%C%',p:{replacements:'[["A","😀%B%"],["B","%C%é"],["C","z"]]'}},
    {id:3530,input:'[]',p:{score:'[5,1,3,2]'}},{id:3530,input:'[[0,1],[1,2],[0,2]]',p:{score:'[3,2,1]'}},
    {id:3620,input:'[[0,1,5],[1,3,10],[0,2,3],[2,3,4]]',p:{n:4,online:'true,true,true,true',k:10}},
    {id:3620,input:'[[0,1,0],[1,2,0]]',p:{n:3,online:'true,true,true',k:0}},
    {id:3620,input:'[]',p:{n:2,online:'true,true',k:0}},
    {id:3620,input:'[[0,1,5],[1,2,5]]',p:{n:3,online:'true,false,true',k:100}},
    {id:3812,input:'[[0,1]]',p:{start:'00',target:'01'}},
    {id:3812,input:'[[0,1]]',p:{start:'00',target:'00'}},
    {id:3812,input:'[[0,1],[1,2]]',p:{start:'010',target:'100'}},
  ];
}
test('all six lessons match CPython after EVERY highlighted line, including recursive returns and loop exhaustion',()=>{
  const selected=cases();
  const python=process.env.PYTHON||'python';
  const script=String.raw`import sys,json,types,re
from collections import deque
payload=json.load(sys.stdin)
output=[]
def normal(v):
    if isinstance(v,re.Match): return v.group(0)
    if isinstance(v,(list,tuple,deque)): return [normal(x) for x in v]
    if isinstance(v,dict): return {str(k):normal(x) for k,x in v.items()}
    return v
for case in payload:
    namespace={}
    exec(compile(case['code'],'lesson','exec'),namespace)
    events=[]; pending={}
    def trace(f,event,arg):
        if f.f_code.co_filename!='lesson' or f.f_code.co_name in ('<module>','Solution','<genexpr>','<listcomp>'): return None
        if event in ('line','return'):
            if f in pending:
                line=pending.pop(f)
                state={k:normal(v) for k,v in f.f_locals.items() if k!='self' and not callable(v) and not isinstance(v,types.GeneratorType)}
                events.append({'line':line,'scope':f.f_code.co_name,'locals':state})
            if event=='line': pending[f]=f.f_lineno
        return trace
    sys.settrace(trace)
    answer=getattr(namespace['Solution'](),case['method'])(*case['args'])
    sys.settrace(None)
    output.append({'answer':answer,'events':events})
print(json.dumps(output))`;
  const payload=selected.map(({id,input,p})=>{const q=SUPPORTED[id];return {code:q.code.join('\n'),args:q.liveArgs(input,p),method:q.code.find(l=>/^    def /.test(l)).match(/def (\w+)/)[1]};});
  const result=spawnSync(python,['-X','utf8','-c',script],{input:JSON.stringify(payload),encoding:'utf8',maxBuffer:40*1024*1024});
  assert.equal(result.status,0,result.stderr||String(result.error));
  JSON.parse(result.stdout).forEach((ref,i)=>{
    const {id,input,p}=selected[i], actual=run(id,input,p);
    assert.deepEqual(actual.answer,ref.answer,`#${id} answer case ${i}`);
    assert.equal(actual.steps.length,ref.events.length,`#${id} frame count case ${i}`);
    actual.steps.forEach((step,j)=>{
      assert.deepEqual({line:step.codeLines[0],scope:step.source.scope,locals:step.locals},ref.events[j],`#${id} case ${i} frame ${j+1}`);
      assert.equal(step.source.text,SUPPORTED[id].code[step.source.line-1]);
      assert.equal(step.codeLines.length,1);
    });
  });
});
let seed=37;
function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
test('tree toggles match exhaustive subsets, including impossible odd parity',()=>{
  for(let iteration=0;iteration<45;iteration++){
    const n=2+rand(6),edges=Array.from({length:n-1},(_,i)=>[i+1,rand(i+1)]),start=Array.from({length:n},()=>rand(2)).join(''),target=Array.from({length:n},()=>rand(2)).join('');
    let best=null;
    for(let mask=0;mask<1<<(n-1);mask++){const bits=[...start].map(Number),chosen=[];edges.forEach(([u,v],i)=>{if(mask&1<<i){bits[u]^=1;bits[v]^=1;chosen.push(i);}});if(bits.join('')===target&&(!best||chosen.length<best.length))best=chosen;}
    assert.deepEqual(run(3812,JSON.stringify(edges),{start,target}).answer,best??[-1]);
  }
});
test('profit DP agrees with exhaustive valid orders; network agrees with exhaustive paths',()=>{
  for(let iteration=0;iteration<25;iteration++){
    const n=2+rand(4),edges=[],score=Array.from({length:n},()=>1+rand(8));
    for(let u=0;u<n;u++)for(let v=u+1;v<n;v++)if(rand(3)===0)edges.push([u,v]);
    let best=-1;
    function orders(path,used,total){if(path.length===n){best=Math.max(best,total);return;}for(let u=0;u<n;u++)if(!used.has(u)&&edges.every(([a,b])=>b!==u||used.has(a))){orders([...path,u],new Set([...used,u]),total+(path.length+1)*score[u]);}}
    orders([],new Set(),0);assert.equal(run(3530,JSON.stringify(edges),{score}).answer,best);
    const weighted=edges.map(([u,v])=>[u,v,rand(10)]),online=Array.from({length:n},()=>!!rand(2));online[0]=online[n-1]=true;const k=rand(25);let bottleneck=-1;
    function paths(u,cost,min){if(u===n-1&&cost<=k)bottleneck=Math.max(bottleneck,min);for(const [a,b,c] of weighted)if(a===u&&online[b]&&cost+c<=k)paths(b,cost+c,Math.min(min,c));}
    paths(0,0,Infinity);assert.equal(run(3620,JSON.stringify(weighted),{n,online,k}).answer,bottleneck);
  }
});
test('grid ranks equal longest chains in row/column ordering; semester layers handle cycles',()=>{
  for(let iteration=0;iteration<25;iteration++){
    const rows=1+rand(3),cols=1+rand(3),values=Array.from({length:rows*cols},(_,i)=>i+1);
    for(let i=values.length-1;i>0;i--){const j=rand(i+1);[values[i],values[j]]=[values[j],values[i]];}
    const grid=Array.from({length:rows},(_,r)=>values.slice(r*cols,(r+1)*cols)),memo={};
    function rank(r,c){const key=r+','+c;if(memo[key])return memo[key];let k=1;for(let a=0;a<rows;a++)if(grid[a][c]<grid[r][c])k=Math.max(k,1+rank(a,c));for(let b=0;b<cols;b++)if(grid[r][b]<grid[r][c])k=Math.max(k,1+rank(r,b));return memo[key]=k;}
    assert.deepEqual(run(2371,JSON.stringify(grid)).answer,grid.map((row,r)=>row.map((_,c)=>rank(r,c))));
  }
  assert.equal(run(1136,'1-2,2-3,3-1',{n:4}).answer,-1);
  assert.equal(run(1136,'',{n:12}).answer,1);
  assert.equal(run(1136,'1-2,2-3,3-4',{n:4}).answer,4);
});
test('all pictures render in both languages without unsafe HTML or undefined values; snapshots are immutable',()=>{
  const host={innerHTML:'',clientWidth:550},ctx={lang:'vi',$:()=>host};vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-topology-lessons.js'),'utf8'),ctx);
  for(const {id,input,p} of cases()){
    const result=run(id,input,p),before=JSON.stringify(result);
    for(const language of ['vi','en']){ctx.lang=language;for(const step of result.steps){ctx.renderTopologyLessonPictures(step);assert.match(host.innerHTML,/class="tl-viz"/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|<img>/);}}
    assert.equal(JSON.stringify(result),before);
  }
});
test('invalid graph/grid inputs are rejected, and large DP traces disclose omitted frames',()=>{
  assert.throws(()=>run(2371,'[[1,1]]'));
  assert.throws(()=>run(3530,'[[0,1],[1,0]]',{score:'[1,2]'}));
  assert.throws(()=>run(3812,'[[0,1],[1,0]]',{start:'000',target:'000'}));
  assert.throws(()=>run(3620,'[[0,1,1],[1,0,1]]',{n:2,online:[true,true],k:3}));
  assert.throws(()=>run(3620,'[[0,1,1]]',{n:2,online:[false,true],k:3}));
  const large=run(3530,'[]',{score:Array(8).fill(1)});assert.equal(large.answer,36);assert.ok(large.steps.at(-1).topologyLessonView.omitted>0);assert.ok(large.steps.length<=6001);
});
