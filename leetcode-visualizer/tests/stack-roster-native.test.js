'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),fs=require('node:fs'),vm=require('node:vm');
const {SUPPORTED:p}=require('../problems'),ids=[402,503,768,769];
const view=s=>s.removeKDigits402View??s.circularNext503View??s.chunkPartitionsView;
const run=(id,input=p[id].defaultInput,params={})=>p[id].builder(input,params);
let seed=503;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
function removalOracle(num,k){let best=null;function choose(i,s,left){if(left===0){const candidate=(s+num.slice(i)).replace(/^0+/,'')||'0';if(best===null||candidate.length<best.length||candidate.length===best.length&&candidate<best)best=candidate;return;}if(i===num.length)return;choose(i+1,s,left-1);if(num.length-i>left)choose(i+1,s+num[i],left);}choose(0,'',k);return best;}
function nextOracle(a){return a.map((v,i)=>{for(let d=1;d<a.length;d++){const j=(i+d)%a.length;if(a[j]>v)return j;}return null;});}
function chunkOracle(a){const target=[...a].sort((x,y)=>x-y);let count=0;for(let i=0;i<a.length;i++)if(JSON.stringify(a.slice(0,i+1).sort((x,y)=>x-y))===JSON.stringify(target.slice(0,i+1)))count++;return count;}
function ui(id,lang='vi',extra={}){const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang,document:{getElementById:()=>host},...extra};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/'+({402:'renderer-remove-k-digits-402.js',503:'renderer-circular-next-503.js',768:'renderer-chunk-partitions.js',769:'renderer-chunk-partitions.js'}[id])),'utf8'),ctx);return {ctx,render(s){ctx[id===402?'renderRemoveKDigits402':id===503?'renderCircularNext503':'renderChunkPartitions'](s);return host.innerHTML;}};}
test('all four requested lessons preserve difficulty and provide complete actual Python line replay',()=>{
  const expected={402:'1219',503:[2,-1,2],768:1,769:4};
  for(const id of ids){const r=run(id);assert.deepEqual(r.answer,expected[id]);assert.equal(p[id].difficulty,id===768?'hard':'medium');assert.equal(p[id].debugMode,'line-by-line');assert.equal(p[id].complexity.time,'O(n)');assert.equal(view(r.steps.at(-1)).trace.truncated,false);assert.equal(r.steps.filter(s=>s.final).length,1);for(const s of r.steps){const v=view(s);assert.deepEqual(s.codeLines,[v.source.line]);assert.equal(p[id].code[v.source.line-1].trim(),v.source.text);}}
});
test('402 matches independent deletion enumeration, retaining precision for long digit strings',()=>{
  const cases=[['1432219',3],['10200',1],['12345',2],['10',2],['112',1],['1321',1],['0',0],['0',1],['999999999999999999',0],['111111111111111111',9],['100000000000000000',1]];
  for(let t=0;t<50;t++){const num=Array.from({length:1+rand(8)},()=>String(rand(10))).join('');cases.push([num,rand(num.length+1)]);}
  for(const [num,k]of cases)assert.equal(run(402,num,{k}).answer,removalOracle(num,k),`${num}/${k}`);
});
test('402 IDs follow the native stack; POP, decrement, tail slicing and zero normalization are distinct',()=>{
  for(const [num,k]of [['1432219',3],['10200',1],['12345',2],['10',2],['1321',1],['0',0]]){
    const r=run(402,num,{k});let previous;
    for(const s of r.steps){const v=view(s);assert.deepEqual(v.stackIds.map(i=>num[i]),v.locals.stack);assert.equal(v.k,v.locals.k);
      assert.equal(new Set([...v.stackIds,...v.deleted.map(d=>d.index)]).size,v.stackIds.length+v.deleted.length);
      if(v.change?.kind==='pop'){assert.equal(v.k,previous.k);assert.equal(v.deleted.length,previous.deleted.length+1);assert.equal(num[v.pending],v.locals.removed);}
      if(v.change?.kind==='budget'){assert.equal(v.k,previous.k-1);assert.deepEqual(v.stack,previous.stack);}
      if(v.change?.kind==='trim'){assert.equal(v.k,previous.k);assert.equal(v.change.indices.length,v.k);}
      if(v.stripped!==null){assert.equal(v.leadingIds.map(i=>num[i]).join(''),'0'.repeat(v.raw.length-v.stripped.length));assert.ok(v.leadingIds.every(i=>!v.deleted.some(d=>d.index===i)));}
      previous=v;
    }
    assert.equal(previous.deleted.length,k);assert.equal(previous.stackIds.length,num.length-k);
  }
  const tail=view(run(402,'12345',{k:2}).steps.at(-1));assert.equal(tail.k,2);assert.equal(tail.result,'123');
  const zero=view(run(402,'10200',{k:1}).steps.at(-1));assert.deepEqual(zero.stack,['0','2','0','0']);assert.deepEqual(zero.leadingIds,[1]);assert.equal(zero.deleted.length,1);
});
test('402 does not claim a comparison executed after the budget reaches zero',()=>{
  const r=run(402,'1321',{k:1}),skipped=r.steps.map(view).filter(v=>v.source.text.startsWith('while ')&&v.k===0);
  assert.ok(skipped.length);for(const v of skipped){assert.equal(v.comparison.evaluatedTop,false);assert.equal(v.comparison.pass,false);}
  assert.deepEqual(view(r.steps.at(-1)).stack,['1','2','1']);
});
test('503 finds the first strictly greater circular neighbor, including real answers equal to −1',()=>{
  const cases=[[1,2,1],[1,2,3,4,3],[5,4,3,2,1],[2,2,2],[-2,-1,-3],[7],[-1e9,1e9,-1e9]];
  for(let t=0;t<65;t++)cases.push(Array.from({length:1+rand(14)},()=>rand(11)-5));
  for(const a of cases){const r=run(503,a),last=view(r.steps.at(-1)),targets=nextOracle(a);assert.deepEqual(last.targets,targets);assert.deepEqual(r.answer,targets.map(j=>j===null?-1:a[j]));
    assert.equal(r.steps.filter(s=>view(s).change?.kind==='push').length,a.length);assert.ok(r.steps.filter(s=>view(s).change?.kind==='push').every(s=>view(s).round===1));
    for(const s of r.steps){const v=view(s);assert.deepEqual(v.answer,v.locals.answer??null);assert.deepEqual(v.stack,v.locals.stack??null);if(v.change?.kind==='write'){assert.equal(v.change.to,targets[v.change.from]);assert.equal(v.change.wrapped,v.change.to<v.change.from);}}
  }
  const v=view(run(503,[-2,-1]).steps.at(-1));assert.equal(v.answer[0],-1);assert.equal(v.targets[0],1);assert.equal(v.targets[1],null);
});
test('503 POP does not write the answer early, even when its old and new values are both −1',()=>{
  for(const a of [[1,2,1],[-2,-1,-3]]){let previous;for(const s of run(503,a).steps){const v=view(s);if(v.change?.kind==='pop'){assert.deepEqual(v.answer,previous.answer);assert.deepEqual(v.targets,previous.targets);assert.equal(v.pending,v.locals.j);}if(v.change?.kind==='write')assert.equal(v.targets[v.locals.j],v.locals.idx);previous=v;}}
});
test('768 chunks track actual stack maxima through in-flight merges and sort independently',()=>{
  const cases=[[5,4,3,2,1],[2,1,3,4,4],[1,2,3,4],[1,5,3,4,2],[0,0,0],[7],Array(16).fill(1e8)];
  for(let t=0;t<50;t++)cases.push(Array.from({length:1+rand(10)},()=>rand(7)));
  for(const a of cases){const r=run(768,a);assert.equal(r.answer,chunkOracle(a));for(const s of r.steps){const v=view(s);
    assert.deepEqual(v.chunks.map(g=>g.max),v.maxima);assert.equal(v.mx,v.locals.mx??null);
    let next=0;for(const g of v.chunks){assert.equal(g.start,next);assert.equal(g.max,Math.max(...a.slice(g.start,g.end+1)));next=g.end+1;}
    if(v.pending){assert.equal(v.pending.start,next);assert.equal(v.pending.end,v.locals.i);}
  }const last=view(r.steps.at(-1));assert.deepEqual(last.illustration.flatMap(g=>g.after.map(n=>n.value)),[...a].sort((x,y)=>x-y));}
});
test('769 commits a cut only on the native increment and requires a real permutation',()=>{
  const cases=[[1,0,2,3,4],[4,3,2,1,0],[0,1,2,3],[2,0,1,4,3],[0]];
  for(let t=0;t<60;t++){const a=Array.from({length:1+rand(10)},(_,i)=>i);for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];}cases.push(a);}
  for(const a of cases){const r=run(769,a);assert.equal(r.answer,chunkOracle(a));let previous;
    for(const s of r.steps){const v=view(s);assert.equal(v.count,v.locals.chunks??null);assert.equal(v.chunks.length,v.count??0);if(v.change?.kind==='cut'){assert.equal(v.source.text,'chunks += 1');assert.equal(v.chunks.length,previous.chunks.length+1);assert.equal(v.locals.max_so_far,v.locals.i);}else if(previous)assert.equal(v.chunks.length,previous.chunks.length);previous=v;}
    assert.deepEqual(previous.illustration.flatMap(g=>g.after.map(n=>n.value)),[...a].sort((x,y)=>x-y));
  }
});
test('both chunk solutions are maximal against all partitions of exhaustive small inputs',()=>{
  const source=`from itertools import product,permutations\n${p[768].code.join('\n').replace('class Solution:','class Solution768:')}\n${p[769].code.join('\n').replace('class Solution:','class Solution769:')}\ndef expected(a):\n best=0\n for mask in range(1 << (len(a)-1)):\n  out=[];start=0;count=0\n  for i in range(len(a)):\n   if i==len(a)-1 or mask >> i & 1:\n    out+=sorted(a[start:i+1]);start=i+1;count+=1\n  if out==sorted(a):best=max(best,count)\n return best\nfor n in range(1,7):\n for a in product(range(3),repeat=n):assert Solution768().maxChunksToSorted(a)==expected(a),a\n for a in permutations(range(n)):assert Solution769().maxChunksToSorted(a)==expected(a),a\nprint('passed')`;
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',source],{encoding:'utf8'});assert.equal(ref.status,0,ref.stderr);
});
test('all native source events, branches, locals and suspended frames match CPython for four algorithms',()=>{
  const cases=[[402,'1432219',{k:3}],[402,'10200',{k:1}],[402,'12345',{k:2}],[503,'1,2,1',{}],[503,'-2,-1,-3',{}],[768,'2,1,3,4,4',{}],[768,'1,5,3,4,2',{}],[769,'1,0,2,3,4',{}]],items=cases.map(([id,input,params])=>p[id].tracePayload(input,params));
  const script="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(x)) for x in p['items']]))";
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:64e6});assert.equal(ref.status,0,ref.stderr);
  JSON.parse(ref.stdout).forEach((native,i)=>{const r=run(...cases[i]);assert.deepEqual(r.answer,native.answer);assert.equal(r.steps.length,native.events.length);native.events.forEach((e,j)=>{const v=view(r.steps[j]);for(const key of ['locals','outer','frames','scope','branch','returning','returned'])assert.deepEqual(v[key],e[key],`${i}/${j}/${key}`);assert.deepEqual(r.steps[j].codeLines,[e.line]);for(const variable of r.steps[j].vars)assert.deepEqual(variable.rawValue,e.locals[variable.name]);});});
});
test('every preset renders all native frames in VI/EN and rewinds without changing recorded data',()=>{
  for(const id of ids){const renderer=ui(id),cases=vm.runInContext(id===402?'RK402_CASES':id===503?'NG503_CASES':`CP_CASES[${id}]`,renderer.ctx);
    for(const c of cases){const r=run(id,c[0],id===402?{k:c[1]}:{}),saved=JSON.stringify(r.steps);for(const lang of ['vi','en']){const u=ui(id,lang,{steps:r.steps,stepIndex:0}),first=u.render(r.steps[0]);for(let i=0;i<r.steps.length;i++){u.ctx.stepIndex=i;const html=u.render(r.steps[i]);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object/);assert.ok(html.includes(`data-source-line="${view(r.steps[i]).source.line}"`));}u.ctx.stepIndex=0;assert.equal(u.render(r.steps[0]),first);}assert.equal(JSON.stringify(r.steps),saved);}
  }
});
test('parsing is strict, live arguments match the trace, and caller arrays remain unchanged',()=>{
  for(const input of ['',123,'12a','1234567890123456789'])assert.throws(()=>run(402,input,{k:1}));
  for(const k of [-1,4,1.5,'1',null])assert.throws(()=>run(402,'123',{k}));
  for(const id of [503,768,769])for(const input of ['',[],Array(2),'1,,2',[NaN],[null],[true],[1.5],Array(17).fill(0)])assert.throws(()=>run(id,input));
  for(const input of [[1,1],[1,2],[0,2],[-1,0],Array.from({length:11},(_,i)=>i)])assert.throws(()=>run(769,input));
  for(const input of [[-1],[100000001]])assert.throws(()=>run(768,input));
  for(const id of ids){const input=p[id].defaultInput,args=p[id].liveArgs(input,{});assert.deepEqual(args,p[id].tracePayload(input,{}).args);if(id!==402){const a=args[0],saved=JSON.stringify(a);run(id,a);assert.equal(JSON.stringify(a),saved);}}
});
test('native navigation stops at the requested event and disables all future actions at the end',()=>{
  for(const id of ids){const r=run(id),prefix=id===402?'rk402':id===503?'ng503':'cp',u=ui(id,'vi',{steps:r.steps,stepIndex:0,stopPlay(){},renderStep(){}}),kinds=id===402?['line','pop','budget','normalize','result']:id===503?['line','pop','write','wrap','result']:id===768?['line','merge','max','result']:['line','cut','max','result'];
    for(const kind of kinds){u.ctx.stepIndex=0;const index=u.ctx[prefix+'Next'](kind);assert.ok(index>0,`${id}/${kind}`);u.ctx[prefix+'Go'](index);assert.equal(u.ctx.stepIndex,index);}u.ctx.stepIndex=r.steps.length-1;for(const kind of kinds)assert.equal(u.ctx[prefix+'Next'](kind),-1);
  }
});
