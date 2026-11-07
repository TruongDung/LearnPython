"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),{spawnSync}=require("node:child_process"),fs=require("node:fs"),vm=require("node:vm");
const p=require("../problems").SUPPORTED[104];
const cases=[[3,9,20,null,null,15,7],[0],[],[null],[7,7,7,null,7],[1,null,2,3],[-8,-3,-10,null,null,-5,-1],[1,2,3],[1,null,2,null,3,null,4]];
const run=input=>p.builder(input),last=r=>r.steps.at(-1).maxDepth104View;
function oracle(nodes){
  if(!nodes.length)return 0;const byId=new Map(nodes.map(n=>[n.id,n])),queue=[[nodes[0].id,1]];let answer=0;
  for(let i=0;i<queue.length;i++){const [id,level]=queue[i],n=byId.get(id);answer=Math.max(answer,level);for(const child of [n.left,n.right])if(child)queue.push([child,level+1]);}return answer;
}
function checkPath(v,path,root,height){
  assert.equal(path.length,height);assert.equal(new Set(path).size,path.length);if(!height)return;
  assert.equal(path[0],root);const byId=new Map(v.nodes.map(n=>[n.id,n]));
  path.slice(1).forEach((id,i)=>assert.equal(byId.get(id).parent,path[i]));
  const leaf=byId.get(path.at(-1));assert.equal(leaf.left,null);assert.equal(leaf.right,null);
}

test("104 agrees with breadth-first levels, counts nodes instead of edges or values, and parses compact trees",()=>{
  const inputs=[...cases];let seed=104;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
  for(let i=0;i<100;i++)inputs.push(Array.from({length:random(32)},()=>random(2001)-1000));
  for(const input of inputs){const original=[...input],r=run(input),v=last(r);assert.equal(r.answer,oracle(v.nodes));assert.equal(v.answer,r.answer);assert.deepEqual(input,original);
    checkPath(v,v.path,v.nodes[0]?.id??null,r.answer);assert.equal(v.completed.length,v.nodes.length);assert.equal(r.steps.filter(s=>s.final).length,1);assert.equal(v.trace.truncated,false);
  }
  assert.equal(run(cases[0]).answer,3);assert.equal(run([0]).answer,1);assert.equal(run([]).answer,0);assert.equal(run([-1000,-1000,-1000]).answer,2);
  const sparse=last(run([1,null,2,3]));assert.equal(sparse.nodes.find(n=>n.id==="0:2").left,"0:3");assert.equal(sparse.answer,3);
});

test("104 native source lines, recursive method frames, locals, branches and scalar returns match CPython",()=>{
  const source="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f({'code':p['code'],'method':'maxDepth','args':[a],'treeArgs':[0]})) for a in p['inputs']]))";
  const native=spawnSync(process.env.PYTHON||"python3",["-c",source],{input:JSON.stringify({path:require.resolve("../problems/picture-trace.py"),code:p.code.join("\n"),inputs:cases}),encoding:"utf8",maxBuffer:16e6});assert.equal(native.status,0,native.stderr);
  JSON.parse(native.stdout).forEach((ref,i)=>{const r=run(cases[i]);assert.equal(r.answer,ref.answer);assert.equal(r.steps.length,ref.events.length);
    ref.events.forEach((event,j)=>{const step=r.steps[j],v=step.maxDepth104View;assert.deepEqual(step.codeLines,[event.line]);assert.equal(v.source.text,p.code[event.line-1].trim());assert.equal(v.source.timing,"after");
      for(const name of ["locals","outer","frames","scope","branch","returning","returned"])assert.deepEqual(v[name],event[name]);
      assert.deepEqual(v.stack.map(f=>[f.node,f.left,f.right]),event.frames.map(f=>[f.locals.root?.id??null,f.locals.left??null,f.locals.right??null]));
      for(const name of ["left","right"])assert.equal(step.vars.find(w=>w.name===name).rawValue,event.locals[name]??null);
      assert.equal(step.vars.find(w=>w.name==="↩ return").rawValue,event.returning?event.returned:null);
    });
  });
});

test("104 waits for actual assignments and returns; missing branches never masquerade as zero-valued nodes",()=>{
  let nullLeft=false,nullRight=false;
  for(const input of cases){const r=run(input);for(const step of r.steps){const v=step.maxDepth104View,row=v.current,line=v.source.line;
    if(v.active!==null){
      if(line===3)assert.deepEqual([row.left,row.right,row.height],[null,null,null]);
      if(line===5){assert.equal(row.left,v.locals.left);assert.equal(row.right,null);assert.equal(row.height,null);}
      if(line===6){assert.equal(row.left,v.locals.left);assert.equal(row.right,v.locals.right);assert.equal(row.height,null);}
      if(line===7){assert.equal(row.height,1+Math.max(v.locals.left,v.locals.right));assert.equal(v.returnedHeight,row.height);assert.equal(v.returning,true);}
    }else{
      assert.equal(row,null);assert.ok([3,4].includes(line));assert.equal(v.emptyCall.returned,line===4?0:null);
      const parent=v.stack.at(-2);if(parent){if(v.emptyCall.side==="left"){nullLeft=true;assert.equal(parent.left,null);}else{nullRight=true;assert.equal(parent.right,null);}}
    }
    if(!v.returning){assert.equal(v.returnedHeight,null);assert.equal(v.answer,null);}
    if(line===7&&v.stack.length>1){const parent=v.stack.at(-2),call=v.stack.at(-1);assert.equal(call.side==="left"?parent.left:parent.right,null);}
    assert.ok(!Object.hasOwn(v.locals,"path")&&!Object.hasOwn(v.locals,"height")&&!Object.hasOwn(v.locals,"visualMax"));
  }}assert.ok(nullLeft&&nullRight);
  const leaf=run([0]);assert.equal(leaf.steps[0].maxDepth104View.branch,false);assert.equal(last(leaf).ledger[0].height,1);
});

test("104 paths witness the returned subtree heights, calls retain identity, and earlier frames remain immutable",()=>{
  for(const input of cases){const r=run(input),saved=JSON.stringify(r.steps[0]),final=last(r);
    assert.equal(final.calls.length,2*final.nodes.length+1);assert.equal(new Set(final.calls.map(c=>c.id)).size,final.calls.length);
    for(const call of final.calls){const enter=r.steps[call.enterStep].maxDepth104View,leave=r.steps[call.returnStep].maxDepth104View;assert.equal(enter.source.line,3);assert.equal(enter.callId,call.id);assert.equal(leave.callId,call.id);assert.equal(leave.returning,true);assert.equal(leave.returned,call.value);assert.equal(leave.source.line,call.node===null?4:7);
      if(call.parent){const parent=final.calls.find(c=>c.node===call.parent);assert.ok(parent.enterStep<call.enterStep&&parent.returnStep>call.returnStep);}}
    for(const step of r.steps){const v=step.maxDepth104View;for(const row of v.ledger)if(row.height!==null)checkPath(v,row.path,row.id,row.height);if(v.source.line===7)assert.deepEqual(v.path,v.current.path);else assert.deepEqual(v.path,[]);}
    assert.equal(JSON.stringify(r.steps[0]),saved);
  }
  const ties=last(run([1,2,3]));assert.deepEqual(ties.path,["0:0","0:1"]);
});

test("104 validates connected trees and completely traces both 31-level orientations",()=>{
  for(const input of [null,{},1,[null,1],[1,null,null,2],[NaN],[Infinity],[1.5],[-1001],[1001],Array(2),Array(32).fill(1),"1,,2","[1,]","abc"])assert.throws(()=>run(input),RangeError);
  for(const input of [[],[null],""," ","[]","null","None"])assert.equal(run(input).answer,0);
  for(const side of ["left","right"]){const values=[1000];for(let i=1;i<31;i++)values.push(...side==="left"?[1000,null]:[null,1000]);const r=run(values),v=last(r);assert.equal(r.answer,31);assert.equal(v.path.length,31);assert.equal(v.calls.length,63);assert.equal(v.trace.truncated,false);assert.equal(v.trace.captured,r.steps.length);assert.equal(r.steps.length,188);assert.equal(Math.max(...r.steps.map(s=>s.maxDepth104View.stack.length)),32);}
  assert.deepEqual(p.liveArgs("1,null,2,3"),[{__viz_type:"binary_tree",values:[1,null,2,3],tree_id:"root"}]);assert.equal(p.debugMode,"line-by-line");assert.equal(p.allowEmptyInput,true);
});
function renderer(language,extra={}){
  const host={innerHTML:"",querySelector:()=>null,querySelectorAll:()=>[]},context={lang:language,document:{getElementById:()=>host},...extra};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-maximum-depth-104.js"),"utf8"),context);
  return {context,host,render:step=>{context.renderMaxDepth104Pictures(step);return host.innerHTML;}};
}

test("104 pictures show actual heights, unbound locals, subtree formulas, level labels and zero answers in VI/EN",()=>{
  for(const language of ["vi","en"])for(const input of cases){const r=run(input),saved=JSON.stringify(r),ui=renderer(language),first=ui.render(r.steps[0]);
    for(const step of r.steps){const v=step.maxDepth104View,html=ui.render(step);assert.doesNotMatch(html,/NaN|undefined|Infinity/);assert.match(html,/LEETCODE 104 · DEPTH DFS/);
      assert.deepEqual([...html.matchAll(/data-node-id="([^"]+)" data-node-value="(-?\d+)" data-node-height="([^"]+)" data-node-level="(\d+)"/g)].map(m=>[m[1],+m[2],m[3],+m[4]]),v.nodes.map(n=>[n.id,n.value,String(v.ledger.find(r=>r.id===n.id)?.height??null),n.depth+1]));
      assert.deepEqual([...html.matchAll(/data-frame-index="(\d+)" data-frame-node="([^"]+)" data-frame-left="([^"]+)" data-frame-right="([^"]+)"/g)].map(m=>[+m[1],m[2],m[3],m[4]]),v.stack.map((f,i)=>[i,String(f.node),String(f.left),String(f.right)]));
      assert.deepEqual([...html.matchAll(/data-ledger-node="([^"]+)" data-ledger-field="([^"]+)" data-ledger-value="([^"]+)"/g)].map(m=>[m[1],m[2],m[3]]),v.ledger.flatMap(row=>["left","right","height"].map(name=>[row.id,name,String(row[name])])));
      if(v.current){assert.ok(html.includes(`data-return-height="${v.current.height}"`));assert.match(html,/>\+1<\/text>/);}
      if(v.emptyCall)assert.ok(html.includes(`data-empty-return="${v.emptyCall.returned}"`));
      if(v.answer!==null){assert.ok(html.includes(`data-answer="${v.answer}"`));assert.deepEqual([...html.matchAll(/data-witness-node="([^"]+)"/g)].map(m=>m[1]),v.path);}
    }assert.equal(ui.render(r.steps[0]),first);assert.equal(JSON.stringify(r),saved);
  }
});

test("104 call/child-result/return/result controls and keyboard selection replay real method statements",()=>{
  const r=run(cases[0]);for(const [kind,predicate]of [["call",v=>v.source.line===3],["receive",v=>[5,6].includes(v.source.line)],["return",v=>v.returning],["result",v=>v.answer!==null]]){let rendered=0,stopped=0;const ui=renderer("vi",{steps:r.steps,stepIndex:0,renderStep:()=>rendered++,stopPlay:()=>stopped++});ui.context.d104Jump(kind);assert.ok(predicate(r.steps[ui.context.stepIndex].maxDepth104View));assert.equal(rendered,1);assert.equal(stopped,1);ui.context.stepIndex=r.steps.length-1;ui.context.d104Jump(kind);assert.equal(ui.context.stepIndex,r.steps.length-1);}
  for(const callId of ["node:0:6","null:0:1:left","null:0:1:right"])for(const key of ["Enter"," "]){const handlers={},node={dataset:{d104Call:callId},addEventListener:(name,fn)=>{handlers[name]=fn;}},host={querySelectorAll:s=>s==="[data-d104-call]"?[node]:[]};const ui=renderer("en",{steps:r.steps,stepIndex:0,renderStep(){}});let prevented=0,stopped=0;ui.context.d104Bind(host);handlers.keydown({key,preventDefault:()=>prevented++,stopPropagation:()=>stopped++});const v=r.steps[ui.context.stepIndex].maxDepth104View;assert.equal(v.source.line,3);assert.equal(v.callId,callId);assert.equal(prevented,1);assert.equal(stopped,1);}
});
