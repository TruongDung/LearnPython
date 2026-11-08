'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../problems').SUPPORTED,ids=[2355,2454,2487],run=(id,a=p[id].defaultInput)=>p[id].builder(a),view=s=>s.stackSequenceView;
const methods={2355:'maximumBooks',2454:'secondGreaterElement',2487:'removeNodes'};
let seed=2355;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
function books(a,end=null){let best=0;for(let right=0;right<a.length;right++){if(end!==null&&right!==end)continue;for(let left=0;left<=right;left++){let total=0,previous=Infinity;for(let i=right;i>=left;i--){const take=Math.min(a[i],previous-1);if(take<=0){total=-1;break;}total+=take;previous=take;}best=Math.max(best,total);}}return best;}
function second(a){return a.map((value,i)=>{const found=a.flatMap((v,j)=>j>i&&v>value?[j]:[]);return found.length>1?a[found[1]]:-1;});}
function kept(a){return a.flatMap((value,i)=>a.slice(i+1).every(v=>v<=value)?[i]:[]);}
function ui(lang='vi',extra={}){const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang,document:{getElementById:()=>host},...extra};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-stack-sequences-pictures.js'),'utf8'),ctx);return {ctx,render:(s,options)=>{ctx.renderStackSequences(s,options);return host.innerHTML;}};}

test('all three lessons replace generic templates with complete Python statement replay',()=>{
  for(const id of ids){assert.equal(p[id].debugMode,'line-by-line');assert.equal(p[id].complexity.time,'O(n)');assert.equal(p[id].visualizationLimits.completeTrace,true);const r=run(id);assert.equal(view(r.steps.at(-1)).trace.truncated,false);assert.equal(r.steps.filter(s=>s.final).length,1);for(const s of r.steps){assert.deepEqual(s.codeLines,[view(s).source.line]);assert.equal(p[id].code[s.codeLines[0]-1].trim(),view(s).source.text);}}
});
test('2355 optimal totals and every dp endpoint agree with independent segment enumeration',()=>{
  const cases=[[8,5,2,7,9],[7,0,3,4,5],[8,2,3,7,3,4,0,1,4,3],[0],[0,0,0],[1,2,3,4],[5,5,5,5],Array(14).fill(100000)];
  for(let i=0;i<65;i++)cases.push(Array.from({length:1+rand(14)},()=>rand(25)));
  for(const a of cases){const r=run(2355,a),last=view(r.steps.at(-1));assert.equal(r.answer,books(a),JSON.stringify(a));for(const row of last.ledger){assert.equal(row.total,books(a,row.i));assert.equal(row.plan.reduce((sum,p)=>sum+p.take,0),row.total);for(let i=0;i<row.plan.length;i++){const item=row.plan[i];assert.ok(item.take>0&&item.take<=a[item.index]);if(i){assert.equal(item.index,row.plan[i-1].index+1);assert.ok(item.take>row.plan[i-1].take);}}}}
});
test('2355 matches exhaustive positive-count choices for every small capacity array',()=>{
  const script=`from itertools import product\n${p[2355].code.join('\n')}\nfor n in range(1,5):\n for a in product(range(4),repeat=n):\n  best=0\n  for take in product(*(range(cap+1) for cap in a)):\n   positions=[i for i,v in enumerate(take) if v]\n   if not positions: continue\n   if positions != list(range(positions[0],positions[-1]+1)): continue\n   if any(take[i]>=take[j] for i,j in zip(positions,positions[1:])): continue\n   best=max(best,sum(take))\n  assert Solution().maximumBooks(list(a))==best,(a,best)\nprint('exhaustive capacity choices passed')`;
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{encoding:'utf8'});assert.equal(ref.status,0,ref.stderr);
});
test('2355 transform comparisons, pops, arithmetic blocks and prefix joins follow real assignments',()=>{
  for(const a of [[8,5,2,7,9],[1,2,3,4],[0,0,0]])for(const s of run(2355,a).steps){const v=view(s),x=v.locals;
    if(v.change?.kind==='dp'){assert.equal(x.block_sum,x.length*(x.first+x.limit)/2);assert.equal(x.prefix_sum,x.previous<0?0:x.dp[x.previous]);assert.equal(x.dp[x.i],x.prefix_sum+x.block_sum);}
    if(v.source.text==='stack.append(i)'){const keys=x.stack.map(i=>a[i]-i);assert.ok(keys.every((v,i)=>!i||keys[i-1]<v));}
    if(v.source.text==='for i, limit in enumerate(books):'&&v.branch)assert.deepEqual(v.scratch,{});
  }
});
test('2454 uses the second greater by position, preserves equals, and matches direct enumeration',()=>{
  const cases=[[2,4,0,9,6],[3,3],[1,2,4,3],[5,4,3,2,1],[2,2,3,3,4],[0],[1000000000,0,1000000000]];
  for(let i=0;i<100;i++)cases.push(Array.from({length:1+rand(14)},()=>rand(13)));
  for(const a of cases){const r=run(2454,a);assert.deepEqual(r.answer,second(a));for(const row of view(r.steps.at(-1)).resolved){const matches=a.flatMap((n,i)=>i>row.index&&n>a[row.index]?[i]:[]);assert.equal(row.first,matches[0]);assert.equal(row.second,matches[1]);assert.equal(row.value,a[row.second]);}}
});
test('2454 first/second stacks, buffer, held index and resolved answers never duplicate or lose a processed index',()=>{
  for(const a of [[2,4,0,9,6],[1,2,4,3],[8,6,4,2,10,11],[2,2,3,3,4]])for(const s of run(2454,a).steps){const v=view(s),x=v.locals;if(x.i===undefined)continue;
    const tracked=[...(x.first??[]),...(x.second??[]),...(x.moved??[]),...(v.held?[v.held.index]:[]),...v.resolved.map(r=>r.index)];
    assert.equal(new Set(tracked).size,tracked.length,`${a}/${v.source.text}`);for(let i=0;i<x.i;i++)assert.ok(tracked.includes(i),`${i}/${v.source.text}`);
    for(const row of v.resolved)assert.ok(row.first<row.second);
    if(v.change?.kind==='answer')assert.equal(x.answer[v.change.index],x.value);
  }
});
test('2487 keeps exactly suffix maxima including equal duplicates, and returns the actual surviving node identities',()=>{
  const cases=[[5,2,13,3,8],[1,1,1,1],[1,2,3,4],[9,7,5,3],[7],[100000,1,100000]];
  for(let i=0;i<100;i++)cases.push(Array.from({length:1+rand(14)},()=>1+rand(15)));
  for(const a of cases){const r=run(2487,a),end=view(r.steps.at(-1)),expected=kept(a);assert.deepEqual(r.answer,expected.map(i=>a[i]));assert.deepEqual(end.resultIds,expected);assert.equal(end.returned.id,'0:'+expected[0]);for(const row of end.ledger){assert.ok(row.killer>row.index);assert.ok(a[row.killer]>a[row.index]);}}
});
test('2487 each next assignment changes only the native predecessor pointer; popping never rewrites links',()=>{
  for(const a of [[5,2,13,3,8],[1,1,1,1],[10,2,4,3,9]]){let previous;for(const s of run(2487,a).steps){const v=view(s);assert.equal(v.linked.length,a.length);if(v.change?.kind==='link'){const expected=JSON.parse(JSON.stringify(previous.linked));expected[v.change.from].next='0:'+v.change.to;assert.deepEqual(v.linked,expected);assert.equal(v.locals.stack.at(-1).next,v.locals.current.id);}if(v.change?.kind==='remove')assert.deepEqual(v.linked,previous.linked);previous=v;}}
});
test('all source lines, variables, branches, frames, returns and linked snapshots match CPython',()=>{
  const items=ids.map(id=>({code:p[id].code.join('\n'),method:methods[id],args:[id===2355?[8,5,2,7,9]:id===2454?[2,4,0,9,6]:[5,2,13,3,8]],...(id===2487?{linkedArgs:[0],captureLinked:true}:{})}));
  const script="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(x)) for x in p['items']]))";
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:32e6});assert.equal(ref.status,0,ref.stderr);
  JSON.parse(ref.stdout).forEach((native,i)=>{const r=run(ids[i],items[i].args[0]);assert.equal(r.steps.length,native.events.length);native.events.forEach((e,j)=>{const s=r.steps[j],v=view(s);assert.deepEqual(s.codeLines,[e.line]);for(const key of ['locals','outer','frames','scope','branch','returning','returned'])assert.deepEqual(v[key],e[key],`${ids[i]}/${j}/${key}`);if(ids[i]===2487)assert.deepEqual(v.linked,e.linked);for(const watch of s.vars)assert.deepEqual(watch.rawValue,e.locals[watch.name]);});});
});
test('linked snapshots are opt-in and include detached nodes without changing the default trace schema',()=>{
  const {runTrace}=require('../problems/wasm-picture-trace'),code=p[2487].code.join('\n'),args=[[5,2,13,3,8]];
  const normal=runTrace({code,method:'removeNodes',args,linkedArgs:[0]}),captured=runTrace({code,method:'removeNodes',args,linkedArgs:[0],captureLinked:true});
  assert.equal(normal.events.length,captured.events.length);assert.ok(normal.events.every(e=>!Object.hasOwn(e,'linked')));assert.ok(captured.events.every(e=>e.linked.length===5));
  for(let i=0;i<normal.events.length;i++){const {linked,...event}=captured.events[i];assert.deepEqual(event,normal.events[i]);}
});
test('all rendered frames remain faithful, deterministic and valid in both VI and EN',()=>{
  for(const[id,a]of [[2355,[8,5,2,7,9]],[2355,[0,0,0]],[2355,Array(14).fill(100000)],[2454,[2,4,0,9,6]],[2487,[5,2,13,3,8]],[2487,[1,1,1,1]]]){const r=run(id,a),saved=JSON.stringify(r.steps);for(const lang of ['vi','en']){const renderer=ui(lang),first=renderer.render(r.steps[0]);for(const s of r.steps){const html=renderer.render(s);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object/);assert.ok(html.includes(`data-source-line="${s.codeLines[0]}"`));}assert.equal(renderer.render(r.steps[0]),first);}assert.equal(JSON.stringify(r.steps),saved);}
});
test('selecting proof indices never changes captured Python data',()=>{
  for(const id of [2454,2487]){const s=run(id).steps.at(-1),saved=JSON.stringify(s),renderer=ui();for(let index=0;index<view(s).values.length;index++)assert.doesNotMatch(renderer.render(s,{index}),/undefined|NaN/);assert.equal(JSON.stringify(s),saved);}
});
test('input limits, zeros, sparse input and actual linked-list live args are enforced',()=>{
  for(const id of ids){for(const a of [[],Array(2),[true],[NaN],Array(15).fill(1),'1,,2',''])assert.throws(()=>run(id,a));const a=id===2487?[1,2,3]:[0,2,3],saved=JSON.stringify(a);run(id,a);assert.equal(JSON.stringify(a),saved);}
  assert.throws(()=>run(2487,[0]));assert.throws(()=>run(2355,[100001]));assert.throws(()=>run(2454,[-1]));
  assert.deepEqual(p[2487].liveArgs('5,2,13,3,8'),[{__viz_type:'linked_list',values:[5,2,13,3,8]}]);
});
test('navigation selects actual native events for all three lessons',()=>{
  for(const id of ids){const r=run(id),renderer=ui('vi',{steps:r.steps,stepIndex:0,stopPlay(){},renderStep(){}});for(const kind of ['line','pop','write','result']){renderer.ctx.stepIndex=0;const i=renderer.ctx.sqNext(kind);assert.ok(i>0);renderer.ctx.sqGo(i);assert.equal(renderer.ctx.stepIndex,i);if(kind==='result')assert.equal(r.steps[i].final,true);}}
});
test('2454 highlights the answer cell being written rather than the scanned input index',()=>{
  const renderer=ui();for(const s of run(2454).steps){const v=view(s),html=renderer.render(s);if(v.change?.kind==='answer'){assert.ok(html.includes(`data-native-write-index="${v.locals.index}"`));if(v.locals.index!==v.locals.i)assert.ok(!html.includes(`data-native-write-index="${v.locals.i}"`));}else assert.ok(!html.includes('data-native-write-index='));}
});
