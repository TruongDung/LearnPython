'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const {SUPPORTED}=require('../problems');
const ids=[1797,1823,430,707,1472,3507,2296];
const host={innerHTML:'',dataset:{},querySelector:()=>null,querySelectorAll:()=>[]};
const ctx={lang:'vi',$:()=>host};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-linked-story-pictures.js'),'utf8'),ctx);
const plain=x=>JSON.parse(JSON.stringify(x));
const build=(id,input=SUPPORTED[id].defaultInput,params={})=>SUPPORTED[id].builder(input,params);
const view=ctx.lsView;
let seed=3507;
const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};

test('1797 pictures use the real token map, strict expiry, ignored renewals and renewed TTL in both approaches',()=>{
  const samples=[SUPPORTED[1797].defaultInput,'renew missing 1 | generate a 2 | renew a 7 | countUnexpiredTokens 8','generate a 1 | renew a 3 | countUnexpiredTokens 7 | countUnexpiredTokens 8','generate a 1 | generate b 2 | renew a 3 | countUnexpiredTokens 6 | countUnexpiredTokens 8'];
  for(const input of samples)for(const approach of [1,2]){
    const r=build(1797,input,{ttl:5,approach}),m=new Map(),expected=[],states=[];
    for(const part of input.split('|')){const [op,a,b]=part.trim().split(/\s+/),t=Number(b??a);
      if(op==='generate')m.set(a,t+5);
      if(op==='renew'&&(m.get(a)??0)>t)m.set(a,t+5);
      if(op==='countUnexpiredTokens'&&approach===2)for(const [id,exp]of m)if(exp<=t)m.delete(id);
      expected.push(op==='countUnexpiredTokens'?[...m.values()].filter(exp=>exp>t).length:null);
      states.push([...m].sort());
    }
    assert.deepEqual(r.answer,expected);
    const targets=ctx.lsTargets(r.steps);
    states.forEach((state,i)=>{const v=view(r.steps[targets.operations.get(i)]);assert.deepEqual(plain(v.entries.map(e=>[e.id,e.expiry]).sort()),state);assert.equal(v.operationIndex,i);});
    for(const step of r.steps){const v=view(step);assert.ok(v.entries.every(e=>Number.isFinite(e.expiry)));assert.equal(v.time,v.operations[v.operationIndex]?.time??null);}
  }
});

test('1823 fixed-seat circle follows Josephus elimination, including wrapping and a single player',()=>{
  for(let n=1;n<=8;n++)for(const k of new Set([1,Math.min(2,n),n])){
    const r=build(1823,n,{k}),a=Array.from({length:n},(_,i)=>i+1),out=[];let pos=0;
    while(a.length>1){pos=(pos+k-1)%a.length;out.push(a.splice(pos,1)[0]);}
    assert.equal(r.answer,a[0]);const v=view(r.steps.at(-1)),state=ctx.lsCircleState(v,r.steps,r.steps.length-1);
    assert.deepEqual(plain(state.history.map(x=>x.value)),out);assert.equal(state.removed.size,n-1);
    const active=v.nodes.filter(node=>!state.removed.has(node.id));assert.deepEqual(plain(active.map(n=>n.value)),a);assert.equal(active[0].next,active[0].id);
  }
});

test('430 pictures preserve every recorded edge and finish with DFS order and reciprocal links',()=>{
  const cases=[['1,2,3,4,5,6','3:7,8,9,10;8:11,12',[1,2,3,7,8,11,12,9,10,4,5,6]],['1,2,3','1:4,5;4:6',[1,4,6,5,2,3]],['1,2,3','',[1,2,3]],['','',[]]];
  for(const [input,children,expected]of cases){const r=build(430,input,{children});
    for(const step of r.steps){const v=view(step),layout=ctx.lsMultilevelLayout(v);assert.equal(layout.points.size,v.nodes.length);
      for(const n of v.nodes)for(const field of ['next','prev','child'])assert.equal(n[field],step.graph.edges.find(e=>e.u===n.id&&e.w===field)?.v??null);
    }
    const v=view(r.steps.at(-1)),byId=new Map(v.nodes.map(n=>[n.id,n])),out=[];let prior=null;
    for(let id=v.head;id!==null;){const n=byId.get(id);assert.ok(n);assert.equal(n.prev,prior);assert.equal(n.child,null);out.push(n.value);prior=id;id=n.next;assert.ok(out.length<=v.nodes.length);}
    assert.deepEqual(out,expected);
  }
});

test('430 keeps saved next pointers across nested recursion and releases each call frame on return',()=>{
  const r=build(430),initial=view(r.steps[0]);assert.deepEqual(initial.frames,[]);
  const splice=r.steps.find(step=>step.codeLines.includes(17)),v=view(splice),frame=v.frames.at(-1),byId=new Map(v.nodes.map(n=>[n.id,n]));
  assert.equal(byId.get(frame.cur).value,3);assert.equal(byId.get(frame.nxt).value,4);assert.equal(byId.get(byId.get(frame.cur).next).value,7);
  const nested=r.steps.map(view).find(v=>v.frames.length===3);assert.ok(nested);assert.equal(nested.frames[0].nxt,frame.nxt);assert.equal(view(r.steps.at(-1)).frames.length,0);
});

test('707 operation tiles land on completed lists, with duplicates and empty/out-of-bounds operations',()=>{
  const cases=[[['get',0],['addAtIndex',1,9],['addAtHead',7],['deleteAtIndex',0],['get',0]],[['addAtTail',5],['addAtTail',5],['addAtIndex',1,0],['deleteAtIndex',2],['get',1]]];
  for(let c=0;c<8;c++)cases.push(Array.from({length:12},()=>{const op=['get','addAtHead','addAtTail','addAtIndex','deleteAtIndex'][rand(5)];return op==='addAtIndex'?[op,rand(5),rand(4)]:[op,rand(5)];}));
  for(const ops of cases){const r=build(707,JSON.stringify(ops)),targets=ctx.lsTargets(r.steps),a=[],expected=[];
    ops.forEach(([op,i,val],j)=>{let result=null;if(op==='get')result=a[i]??-1;if(op==='addAtHead')a.unshift(i);if(op==='addAtTail')a.push(i);if(op==='addAtIndex'&&i<=a.length)a.splice(i,0,val);if(op==='deleteAtIndex'&&i<a.length)a.splice(i,1);expected.push(result);
      const v=view(r.steps[targets.operations.get(j)]);assert.deepEqual(v.order.map(id=>v.nodes.find(n=>n.id===id).value),a);assert.equal(v.size,a.length);assert.equal(v.outputs[j],result);
    });assert.deepEqual(r.answer,expected);
  }
});

test('1472 browser rail and current URL agree between array and DLL after back, forward and branch deletion',()=>{
  const samples=[SUPPORTED[1472].defaultInput,'home | visit a | visit b | back 2 | visit c | forward 9','home | back 9 | forward 9 | visit a | back 9 | forward 9','home | visit same | visit same | back 1 | visit new | back 2'];
  for(const input of samples)for(const approach of [1,2]){const r=build(1472,input,{approach}),targets=ctx.lsTargets(r.steps),commands=input.split('|').map(s=>s.trim());let a=[commands[0]],pos=0;
    commands.forEach((part,i)=>{if(i){const [op,arg]=part.split(' ');if(op==='visit'){a=a.slice(0,pos+1);a.push(arg);pos++;}else pos=op==='back'?Math.max(0,pos-Number(arg)):Math.min(a.length-1,pos+Number(arg));}
      const v=view(r.steps[targets.operations.get(i)]);assert.deepEqual(v.order.map(id=>v.nodes.find(n=>n.id===id).url),a);assert.equal(v.nodes.find(n=>n.id===v.current).url,a[pos]);
    });
  }
});

test('3507 merge pictures follow the minimum adjacent sum with leftmost ties, even with zero and negative values',()=>{
  const samples=[[5,2,3,1],[2,1,2,1],[1,2,3],[-2,3,-1,0],[1,0],[0,-1,1],...Array.from({length:45},()=>Array.from({length:1+rand(8)},()=>rand(13)-6))];
  for(const input of samples){const r=build(3507,input),a=[...input],states=[];
    while(a.some((n,i)=>i&&a[i-1]>n)){let best=0;for(let i=1;i<a.length-1;i++)if(a[i]+a[i+1]<a[best]+a[best+1])best=i;a.splice(best,2,a[best]+a[best+1]);states.push([...a]);}
    assert.equal(r.answer,states.length);const targets=ctx.lsTargets(r.steps);assert.equal(targets.milestones.length,states.length);
    targets.milestones.forEach((m,i)=>assert.deepEqual(view(r.steps[m.index]).nodes.map(n=>n.value),states[i]));
  }
});

test('2296 caret sits after its exact node, context and returned strings match an independent text editor',()=>{
  const samples=[JSON.parse(SUPPORTED[2296].defaultInput),[['addText','abcd'],['cursorLeft',2],['addText','xy'],['cursorRight',9],['deleteText',2]],[['deleteText',5],['addText','abc'],['cursorLeft',9],['deleteText',9],['cursorRight',9]]];
  for(const ops of samples){const r=build(2296,JSON.stringify(ops)),targets=ctx.lsTargets(r.steps),out=[];let text='',cursor=0;
    ops.forEach(([op,x],i)=>{let result=null;if(op==='addText'){text=text.slice(0,cursor)+x+text.slice(cursor);cursor+=x.length;}else if(op==='deleteText'){result=Math.min(cursor,x);text=text.slice(0,cursor-result)+text.slice(cursor);cursor-=result;}else{cursor=op==='cursorLeft'?Math.max(0,cursor-x):Math.min(text.length,cursor+x);result=text.slice(Math.max(0,cursor-10),cursor);}out.push(result);
      const v=view(r.steps[targets.operations.get(i)]),nodes=v.order.map(id=>v.nodes.find(n=>n.id===id));assert.equal(nodes.map(n=>n.value).join(''),text);const boundary=v.current===v.sentinels[0]?0:nodes.findIndex(n=>n.id===v.current)+1;assert.equal(boundary,cursor);assert.equal(v.outputs[i],result);
    });assert.deepEqual(r.answer,out);
  }
});

test('all seven lessons render every immutable frame in Vietnamese and English without broken values',()=>{
  for(const id of ids)for(const approach of [1,2]){const r=build(id,undefined,{approach,ttl:5}),before=JSON.stringify(r);ctx.steps=r.steps;
    for(const language of ['vi','en']){ctx.lang=language;r.steps.forEach((step,i)=>{ctx.stepIndex=i;ctx.renderLinkedStoryPictures(step);assert.match(host.innerHTML,new RegExp(`data-story-id="${id}"`));assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);});}
    assert.equal(JSON.stringify(r),before);ctx.stepIndex=0;ctx.renderLinkedStoryPictures(r.steps[0]);const first=host.innerHTML;ctx.renderLinkedStoryPictures(r.steps.at(-1));ctx.renderLinkedStoryPictures(r.steps[0]);assert.equal(host.innerHTML,first);
    if(![1797,1472].includes(id))break;
  }
});

test('every interactive example is accepted by its problem, including both selectable approaches',()=>{
  const presets=vm.runInContext('LS_PRESETS',ctx);
  for(const id of ids)for(const [input,params]of presets[id])for(const approach of [1,2]){
    const r=build(id,input,{...params,approach});assert.ok(r.steps.length);assert.equal(r.steps.at(-1).final,true);assert.equal(view(r.steps.at(-1)).id,id);
    if(![1797,1472].includes(id))break;
  }
});
