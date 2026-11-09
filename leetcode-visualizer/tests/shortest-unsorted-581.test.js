'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const fs=require('node:fs'),vm=require('node:vm');
const p=require('../problems').SUPPORTED[581];
const run=(input=p.defaultInput)=>p.builder(input),view=s=>s.shortestUnsorted581View;
let seed=581;
function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
function oracle(a){const sorted=[...a].sort((x,y)=>x-y),bad=a.map((x,i)=>x===sorted[i]?-1:i).filter(i=>i>=0);return bad.length?bad.at(-1)-bad[0]+1:0;}
function ui(lang='vi',extra={}){
  const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang,document:{getElementById:()=>host},...extra};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-shortest-unsorted-581.js'),'utf8'),ctx);
  return {ctx,render(s){ctx.renderShortestUnsorted581(s);return host.innerHTML;}};
}
test('581 preserves the solution and metadata while replaying every actual Python statement',()=>{
  const r=run();assert.equal(r.answer,5);assert.equal(p.difficulty,'medium');assert.equal(p.debugMode,'line-by-line');
  assert.equal(p.complexity.time,'O(n)');assert.equal(p.complexity.space,'O(n)');
  assert.deepEqual(p.code,require('../problems/monotonic-stack')[581].code);
  assert.equal(view(r.steps.at(-1)).trace.truncated,false);assert.equal(r.steps.filter(s=>s.final).length,1);
  assert.equal(r.steps.filter(s=>view(s).change?.kind==='reset').length,1);
  for(const s of r.steps){const v=view(s);assert.deepEqual(s.codeLines,[v.source.line]);assert.equal(p.code[v.source.line-1].trim(),v.source.text);}
});
test('boundaries agree with independently sorted positions for negatives, duplicates and randomized arrays',()=>{
  const cases=[[2,6,4,8,10,9,15],[1,2,3,4],[7],[1,3,2,2,2],[5,4,3,2,1],[-1,-3,-2,0],[0,0,0],[2,1],
    [-100000,100000,-100000,100000],Array(14).fill(-100000),Array.from({length:14},(_,i)=>i-7)];
  for(let k=0;k<80;k++)cases.push(Array.from({length:1+rand(14)},()=>rand(15)-7));
  for(const a of cases){const r=run(a),v=view(r.steps.at(-1));assert.equal(r.answer,oracle(a),String(a));
    const sorted=[...a].sort((x,y)=>x-y);assert.deepEqual(v.illustration.map(x=>x.value),sorted);
    if(r.answer){const bad=a.map((x,i)=>x===sorted[i]?-1:i).filter(i=>i>=0);assert.equal(v.left,bad[0]);assert.equal(v.right,bad.at(-1));}
    else{assert.equal(v.left,a.length);assert.equal(v.right,0);assert.equal(v.window,null);}
  }
});
test('displayed Python is minimal against every possible sorted interval on exhaustive small arrays',()=>{
  const code=`from itertools import product\n${p.code.join('\n')}\nfor n in range(1,7):\n for a in product(range(-1,2),repeat=n):\n  expected=0 if list(a)==sorted(a) else n\n  for l in range(n):\n   for r in range(l,n):\n    b=list(a[:l])+sorted(a[l:r+1])+list(a[r+1:])\n    if b==sorted(a):expected=min(expected,r-l+1)\n  assert Solution().findUnsortedSubarray(list(a))==expected,a\nprint('passed')`;
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',code],{encoding:'utf8'});assert.equal(ref.status,0,ref.stderr);
});
test('each POP proves a real inversion; POP and boundary assignments remain separate native steps',()=>{
  for(const a of [[2,6,4,8,10,9,15],[1,3,2,2,2],[-1,-3,-2,0],[2,1]]){
    const r=run(a);let previous=null;
    for(const s of r.steps){const v=view(s),x=v.locals;
      assert.equal(v.left,x.left??null);assert.equal(v.right,x.right??null);assert.deepEqual(v.stack,x.stack??null);
      for(const e of v.evidence){assert.ok(e.from<e.to);assert.ok(a[e.from]>a[e.to]);}
      const leftPops=v.writes.filter(w=>w.name==='left').map(w=>w.index),rightPops=v.writes.filter(w=>w.name==='right').map(w=>w.index);
      assert.equal(v.left,Math.min(a.length,...leftPops));assert.equal(v.right,Math.max(0,...rightPops));
      if(v.change?.kind==='pop'){
        assert.equal(v.source.text,'j = stack.pop()');assert.equal(v.held,x.j);assert.deepEqual(v.stack,previous.stack.slice(0,-1));
        assert.equal(v.left,previous.left);assert.equal(v.right,previous.right);
      }
      if(v.change?.kind==='bound'){
        const c=v.change;assert.deepEqual(v.stack,previous.stack);assert.equal(c.before,previous[c.name]);
        assert.equal(c.after,v[c.name]);assert.equal(c.after,c.name==='left'?Math.min(c.before,x.j):Math.max(c.before,x.j));
      }
      if(v.change?.kind==='push')for(let i=1;i<v.stack.length;i++)assert.ok(v.phase==='left'?a[v.stack[i-1]]<=a[v.stack[i]]:a[v.stack[i-1]]>=a[v.stack[i]]);
      if(v.change?.kind==='reset'){assert.equal(v.phase,'right');assert.deepEqual(v.stack,[]);assert.equal(v.current,null);}
      if(!s.final)assert.equal(v.illustration,null);
      previous=v;
    }
  }
});
test('duplicate values keep separate original IDs and the final illustration only sorts the selected segment',()=>{
  for(const a of [[1,3,2,2,2],[2,6,4,8,10,9,15],[5,5,5],[-2,-3,-2,0]]){
    const r=run(a),v=view(r.steps.at(-1)),nodes=v.illustration;
    assert.equal(new Set(nodes.map(n=>n.index)).size,a.length);
    for(let i=0;i<a.length;i++){assert.equal(nodes[i].value,a[nodes[i].index]);if(!v.window||i<v.left||i>v.right)assert.equal(nodes[i].index,i);}
    for(let i=1;i<nodes.length;i++)if(nodes[i].value===nodes[i-1].value)assert.ok(nodes[i].index>nodes[i-1].index);
    assert.deepEqual(v.locals.nums,a);
  }
});
test('line events, locals, frames, branches and return values match CPython exactly',()=>{
  const inputs=[p.defaultInput,'1,3,2,2,2','-1,-3,-2,0','7'],items=inputs.map(p.tracePayload);
  const script="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(x)) for x in p['items']]))";
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:64e6});assert.equal(ref.status,0,ref.stderr);
  JSON.parse(ref.stdout).forEach((native,i)=>{const r=run(inputs[i]);assert.equal(r.answer,native.answer);assert.equal(r.steps.length,native.events.length);
    native.events.forEach((e,j)=>{const s=r.steps[j],v=view(s);assert.deepEqual(s.codeLines,[e.line]);for(const key of ['locals','outer','frames','scope','branch','returning','returned'])assert.deepEqual(v[key],e[key],`${i}/${j}/${key}`);for(const variable of s.vars)assert.deepEqual(variable.rawValue,e.locals[variable.name]);});
  });
});
test('all presets and extreme values render every frame in VI/EN and rewind without mutating Python snapshots',()=>{
  const cases=vm.runInContext('SU581_CASES',ui().ctx).map(c=>c[0]);cases.push(Array.from({length:14},(_,i)=>i%2?100000:-100000));
  for(const a of cases){const r=run(a),saved=JSON.stringify(r.steps);for(const lang of ['vi','en']){
    const renderer=ui(lang,{steps:r.steps,stepIndex:0}),first=renderer.render(r.steps[0]);
    for(let i=0;i<r.steps.length;i++){const s=r.steps[i],v=view(s);renderer.ctx.stepIndex=i;const html=renderer.render(s);
      assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object/);assert.ok(html.includes(`data-source-line="${v.source.line}"`));
      for(let j=0;j<v.values.length;j++)assert.ok(html.includes(`data-bar-index="${j}" data-bar-value="${v.values[j]}"`));
      if(v.illustration)for(let j=0;j<v.illustration.length;j++){const n=v.illustration[j];assert.ok(html.includes(`data-preview-index="${j}" data-preview-value="${n.value}" data-preview-origin="${n.index}"`));}
    }
    renderer.ctx.stepIndex=0;assert.equal(renderer.render(r.steps[0]),first);
  }assert.equal(JSON.stringify(r.steps),saved);}
});
test('strict parser rejects malformed or oversized input and live editor receives the same immutable array',()=>{
  for(const a of ['',[],Array(2),'1,,2','1,2,','[1,]',[NaN],[null],[true],[-100001],[100001],[1.5],Array(15).fill(1)]){assert.throws(()=>run(a));assert.throws(()=>p.liveArgs(a));}
  const a=[2,6,4,8,10,9,15],saved=JSON.stringify(a);run(a);assert.equal(JSON.stringify(a),saved);
  for(const input of [a,JSON.stringify(a),a.join(',')])assert.deepEqual(p.liveArgs(input),[a]);
});
test('navigation selects real POP, boundary, reset and return events, disabling unavailable future events',()=>{
  const r=run(),renderer=ui('vi',{steps:r.steps,stepIndex:0,stopPlay(){},renderStep(){}});
  for(const kind of ['line','pop','bound','reset','result']){
    renderer.ctx.stepIndex=0;const next=renderer.ctx.su581Next(kind);assert.ok(next>0);renderer.ctx.su581Go(next);assert.equal(renderer.ctx.stepIndex,next);
    if(!['line','result'].includes(kind))assert.equal(view(r.steps[next]).change.kind,kind);
  }
  renderer.ctx.stepIndex=r.steps.length-1;for(const kind of ['line','pop','bound','reset','result'])assert.equal(renderer.ctx.su581Next(kind),-1);
});
