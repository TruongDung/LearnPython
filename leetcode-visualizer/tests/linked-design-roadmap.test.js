'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const fs=require('node:fs'),vm=require('node:vm');
const {SUPPORTED}=require('../problems');
const {prepareDesignLiveRun}=require('../live-args');
const {runTrace}=require('../problems/wasm-picture-trace');
const ids=[707,146,2296,1206,1823];
const view=s=>s.linkedDesignView??s.dllRoadmapView;
const run=(id,input=SUPPORTED[id].defaultInput,params={})=>SUPPORTED[id].builder(input,params);
const ref=x=>x?.id??null;
let seed=707;
function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
function listOracle(ops){const a=[];return ops.map(([op,i,val])=>{
  if(op==='get')return a[i]??-1;
  if(op==='addAtHead')a.unshift(i);
  if(op==='addAtTail')a.push(i);
  if(op==='addAtIndex'&&i<=a.length)a.splice(i,0,val);
  if(op==='deleteAtIndex'&&i<a.length)a.splice(i,1);
  return null;
});}
function cacheOracle(ops,capacity){const m=new Map();return ops.map(([op,k,val])=>{
  if(op==='get'&&!m.has(k))return -1;
  const result=op==='get'?m.get(k):null;
  if(op==='get')val=m.get(k);
  m.delete(k);m.set(k,val);
  if(m.size>capacity)m.delete(m.keys().next().value);
  return result;
});}
function textOracle(ops){let text='',cursor=0;return ops.map(([op,x])=>{
  if(op==='addText'){text=text.slice(0,cursor)+x+text.slice(cursor);cursor+=x.length;return null;}
  if(op==='deleteText'){const removed=Math.min(x,cursor);text=text.slice(0,cursor-removed)+text.slice(cursor);cursor-=removed;return removed;}
  cursor=op==='cursorLeft'?Math.max(0,cursor-x):Math.min(text.length,cursor+x);
  return text.slice(Math.max(0,cursor-10),cursor);
});}
function skipOracle(ops){const a=[];return ops.map(([op,x])=>{
  const i=a.indexOf(x);
  if(op==='search')return i>=0;
  if(op==='erase'){if(i>=0)a.splice(i,1);return i>=0;}
  a.push(x);return null;
});}
function python(items){
  const source="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(x)) for x in p['items']]))";
  const r=spawnSync(process.env.PYTHON||'python3',['-c',source],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:128e6});
  assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);
}
function renderer(lang='vi',extra={}){
  const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]};
  const ctx={lang,document:{getElementById:()=>host},...extra};vm.createContext(ctx);
  for(const file of ['renderer-linked-design.js','renderer-dll-roadmap.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);
  return {ctx,render(s,options){ctx[s.linkedDesignView?'renderLinkedDesign':'renderDllRoadmap'](s,options);return host.innerHTML;}};
}
test('all 15 requested problems have working visualizations and the stated LeetCode difficulty',()=>{
  const medium=[707,146,1472,430,1797,355,1823,641,1670,622],hard=[460,432,2296,1206,381];
  for(const [difficulty,roster]of [['medium',medium],['hard',hard]])for(const id of roster){
    const p=SUPPORTED[id];assert.ok(p,`${id} is registered`);assert.equal(p.difficulty,difficulty);
    const r=p.builder(p.defaultInput,{});assert.ok(r.steps.length,`${id} has steps`);
    assert.ok(r.steps.some(s=>s.graph||s.arr?.length||Object.keys(s).some(k=>k.endsWith('View'))),`${id} has visual data`);
  }
});
test('five native lessons return the official sample answers, with complete statement-level traces',()=>{
  const expected={707:[null,null,null,2,null,3],146:[null,null,1,null,-1,null,-1,3,4],2296:[null,4,null,'etpractice','leet',4,'','practi'],1206:[null,null,null,false,null,true,false,true,false],1823:3};
  for(const id of ids){const p=SUPPORTED[id],r=run(id);assert.deepEqual(r.answer,expected[id]);assert.equal(p.debugMode,'line-by-line');assert.equal(r.steps.filter(s=>s.final).length,1);
    assert.equal(view(r.steps.at(-1)).trace.truncated,false);
    for(const s of r.steps){const v=view(s);assert.deepEqual(s.codeLines,[v.source.line]);assert.equal(p.code[v.source.line-1].trim(),v.source.text);assert.deepEqual(v.nodes,v.objects.map(o=>({id:o.id,type:o.type,fields:o.fields})));}
    if(id!==1823)assert.deepEqual(view(r.steps.at(-1)).outputs,expected[id]);
  }
});
test('707 handles invalid indices, duplicate values, emptying and randomized operations',()=>{
  const cases=[[['get',0],['deleteAtIndex',0],['addAtIndex',1,9],['addAtHead',0],['addAtTail',0],['deleteAtIndex',0],['get',0]],
    [['addAtHead',1],['deleteAtIndex',0],['addAtIndex',0,5],['get',0]]];
  for(let t=0;t<18;t++)cases.push(Array.from({length:12},()=>{const op=['get','addAtHead','addAtTail','addAtIndex','deleteAtIndex'][rand(5)];return op==='addAtIndex'?[op,rand(7),rand(4)]:[op,rand(7)];}));
  for(const ops of cases)assert.deepEqual(run(707,ops).answer,listOracle(ops));
});
test('146 agrees with an independent ordered map, including replacement, misses and eviction',()=>{
  for(let t=0;t<24;t++){const capacity=1+rand(4),ops=Array.from({length:14},()=>rand(3)?['put',rand(5),rand(10)]:['get',rand(6)]);
    assert.deepEqual(run(146,ops,{capacity}).answer,cacheOracle(ops,capacity));
  }
  const r=run(146,[['put',1,5],['put',1,5],['get',1]],{capacity:1}),v=view(r.steps.at(-1));
  assert.equal(v.nodes.length,4);assert.equal(new Set(v.nodes.map(n=>n.id)).size,4);assert.equal(v.items.length,1);
  assert.ok(run(146).steps.some(s=>view(s).cycle),'intermediate cycles are retained rather than repaired');
});
test('2296 agrees with a string and cursor model at both boundaries and through middle insertions',()=>{
  const cases=[[['addText','abcdefghijklmnopqrstuvwx'],['cursorLeft',1],['cursorRight',40],['deleteText',40],['cursorLeft',40]],
    [['addText','aaaa'],['cursorLeft',2],['addText','xy'],['deleteText',1],['cursorRight',40]]];
  for(let t=0;t<14;t++)cases.push(Array.from({length:12},()=>{const op=['addText','deleteText','cursorLeft','cursorRight'][rand(4)];return [op,op==='addText'?'ab':1+rand(40)];}));
  for(const ops of cases)assert.deepEqual(run(2296,ops).answer,textOracle(ops));
});
test('1206 uses ordered forward pointers and erases one occurrence of a duplicate',()=>{
  const cases=[[['add',5],['add',5],['erase',5],['search',5],['erase',5],['search',5],['erase',5]],
    [['add',0],['add',20000],['search',0],['search',20000],['erase',0],['search',0]]];
  for(let t=0;t<15;t++)cases.push(Array.from({length:14},()=>[['add','search','erase'][rand(3)],rand(7)]));
  for(const ops of cases){const r=run(1206,ops);assert.deepEqual(r.answer,skipOracle(ops));
    for(const s of r.steps){const v=view(s);if(!v.returning||!['search','add','erase'].includes(v.scope))continue;
      const m=new Map(v.nodes.map(n=>[n.id,n]));
      for(let level=0;level<(v.state.height??0);level++){let node=m.get(v.sentinels[0]),last=-1;const seen=new Set();
        while(node){assert.ok(!seen.has(node.id));seen.add(node.id);assert.ok(node.fields.val>=last);last=node.fields.val;node=m.get(ref(node.fields.forward[level]));}
      }
    }
  }
});
test('1823 circular DLL agrees with Josephus recurrence for small circles and k = n',()=>{
  assert.equal(run(1823,[5],{k:2}).answer,3);assert.deepEqual(SUPPORTED[1823].liveArgs([5],{k:2}),[5,2]);
  for(let n=1;n<=12;n++)for(const k of new Set([1,Math.max(1,Math.floor(n/2)),n])){
    let expected=0;for(let size=1;size<=n;size++)expected=(expected+k)%size;
    const r=run(1823,n,{k});assert.equal(r.answer,expected+1);
    for(const s of r.steps){const v=view(s);if(v.change?.kind!=='remove')continue;
      assert.equal(v.chain.length,v.locals.remaining);const m=new Map(v.nodes.map(x=>[x.id,x]));
      for(const id of v.chain){const node=m.get(id);assert.equal(ref(m.get(ref(node.fields.next)).fields.prev),id);assert.equal(ref(m.get(ref(node.fields.prev)).fields.next),id);}
    }
  }
});
test('completed DLL operations have matching next/prev links, size and cache membership',()=>{
  for(const id of [707,146,2296])for(const [index,s]of run(id).steps.entries()){const v=view(s);
    if(!v.history.length||v.history.at(-1).step!==index)continue;
    const byId=new Map(v.nodes.map(n=>[n.id,n]));assert.equal(new Set(v.chain).size,v.chain.length);
    for(let i=1;i<v.chain.length;i++)assert.equal(ref(byId.get(v.chain[i]).fields.prev),v.chain[i-1]);
    if(id===707)assert.equal(v.size,v.items.length);
    if(id===146)assert.deepEqual(v.cache.map(([,x])=>x.id).sort(),[...v.items].sort());
  }
});
test('native pointer changes affect one field at a time and preserve detached node identities',()=>{
  for(const id of [707,146,2296]){const r=run(id);let previous;
    for(const s of r.steps){const v=view(s);if(previous){const writes=[];
      for(const node of v.nodes){const before=previous.nodes.find(n=>n.id===node.id);if(!before)continue;
        for(const field of ['next','prev'])if(Object.hasOwn(before.fields,field)&&Object.hasOwn(node.fields,field)&&ref(before.fields[field])!==ref(node.fields[field]))writes.push({node:node.id,field,before:ref(before.fields[field]),after:ref(node.fields[field])});
      }
      assert.ok(writes.length<=1);if(writes.length)for(const key of ['node','field','before','after'])assert.deepEqual(v.change[key],writes[0][key]);
      assert.ok(previous.nodes.every(n=>v.nodes.some(x=>x.id===n.id)));
    }previous=v;}
  }
});
test('all statement events, suspended frames, branches and allocated objects match CPython',()=>{
  const payloads=ids.map(id=>SUPPORTED[id].tracePayload(SUPPORTED[id].defaultInput,{}));
  python(payloads).forEach((native,i)=>{const id=ids[i],r=run(id),events=native.events.filter(e=>e.line<=SUPPORTED[id].code.length);
    assert.deepEqual(r.answer,native.answer);assert.equal(r.steps.length,events.length);
    events.forEach((e,j)=>{const s=r.steps[j],v=view(s);assert.deepEqual(s.codeLines,[e.line]);
      for(const key of ['locals','outer','frames','scope','branch','returning','returned','objects'])assert.deepEqual(v[key],e[key],`${id}/${j}/${key}`);
      for(const variable of s.vars)assert.deepEqual(variable.rawValue,e.locals[variable.name]);
    });
  });
});
test('allocation capture is opt-in, snapshots partial construction, cycles and equal-valued objects',()=>{
  const code='class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\nclass Solution:\n    def example(self):\n        a = Node(7)\n        b = Node(7)\n        a.next = b\n        b.next = a\n        a.next = None\n        return a.val';
  const payload={code,method:'example',args:[],captureAllocations:['Node'],stateClasses:['Node']},r=runTrace(payload);
  assert.equal(r.answer,7);assert.ok(r.events.some(e=>e.objects.some(n=>!Object.hasOwn(n.fields,'next'))));
  const end=r.events.at(-1).objects;assert.equal(end.length,2);assert.notEqual(end[0].id,end[1].id);assert.equal(end[0].fields.next,null);assert.equal(end[1].fields.next.id,end[0].id);
  assert.deepEqual(r,python([payload])[0]);
  const plain=runTrace({code:'class Solution:\n    def example(self):\n        return 1',method:'example',args:[]});assert.ok(plain.events.every(e=>!Object.hasOwn(e,'objects')));
});
test('live editor design calls share parsing and execute the displayed source with identical results',()=>{
  for(const id of ids.filter(n=>n!==1823)){const p=SUPPORTED[id],design=prepareDesignLiveRun(p,p.defaultInput,{});
    assert.deepEqual(design,p.prepareLiveDesign(p.defaultInput,{}));
    const payload=p.tracePayload(p.defaultInput,{});assert.deepEqual(payload.args[0],design.operations.map(op=>[op.name,op.args]));
    assert.deepEqual(runTrace(payload).answer,run(id).answer);
  }
  for(const id of [707,146,2296,1206])for(const input of ['',[],Array(2),'[null]','[["__init__",1]]']){
    assert.throws(()=>run(id,input));assert.throws(()=>prepareDesignLiveRun(SUPPORTED[id],input,{}));
  }
  for(const capacity of [0,1.5,'2',null,3001])assert.throws(()=>run(146,[['get',1]],{capacity}));
  for(const [n,k]of [[0,1],[13,2],[3,0],[3,4],[2.5,1]])assert.throws(()=>run(1823,n,{k}));
});
test('every frame renders in both languages, preserves source and objects, and rewinds deterministically',()=>{
  for(const id of ids){const r=run(id),saved=JSON.stringify(r.steps);for(const lang of ['vi','en']){
    const ui=renderer(lang,{steps:r.steps,stepIndex:0}),first=ui.render(r.steps[0]);
    for(let i=0;i<r.steps.length;i++){ui.ctx.stepIndex=i;const s=r.steps[i],v=view(s),html=ui.render(s);
      assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object/);assert.ok(html.includes(`data-source-line="${s.codeLines[0]}"`));
      for(const n of v.nodes)assert.ok(html.includes(`data-node-id="${n.id}"`));
      for(const op of v.history.filter(x=>x.index>=0))assert.ok(html.includes(`data-operation-index="${op.index}" data-operation-result="`));
    }
    ui.ctx.stepIndex=0;assert.equal(ui.render(r.steps[0]),first);
  }assert.equal(JSON.stringify(r.steps),saved);}
});
test('native jump controls stop at valid source events and disable at the final frame',()=>{
  for(const id of ids){const r=run(id),ui=renderer('vi',{steps:r.steps,stepIndex:0,stopPlay(){},renderStep(){}}),custom=[1206,1823].includes(id),next=custom?'drNext':'ldNext';
    for(const kind of ['line','link','result']){const target=ui.ctx[next](kind);assert.ok(target>0);ui.ctx.ldGo(target);assert.equal(ui.ctx.stepIndex,target);ui.ctx.stepIndex=0;}
    ui.ctx.stepIndex=r.steps.length-1;for(const kind of ['line','link','result'])assert.equal(ui.ctx[next](kind),-1);
    if(!custom)for(let i=0;i<r.steps.length;i++){
      ui.ctx.stepIndex=i;assert.equal(ui.ctx.ldNext('return'),r.steps.findIndex((s,j)=>j>i&&view(s).history.at(-1)?.step===j));
    }
  }
});
