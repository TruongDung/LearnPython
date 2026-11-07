"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),{spawnSync}=require("node:child_process"),fs=require("node:fs"),vm=require("node:vm");
const p=require("../problems").SUPPORTED[144];
const cases=[[1,2,3,4,5,6,7],[1,null,2,3],[],[null],[5],[0,0,0],[-1,null,-2,null,-3],[1,2,null,3,null,4],[1,2,2,null,3,3],[1000,-1000,0]];
const run=input=>p.builder(input),last=r=>r.steps.at(-1).preorder144View;
function oracle(nodes) {
  const byId=new Map(nodes.map(n=>[n.id,n])),stack=nodes.length?[nodes[0].id]:[],ids=[],values=[];
  while(stack.length){const node=byId.get(stack.pop());ids.push(node.id);values.push(node.value);if(node.right)stack.push(node.right);if(node.left)stack.push(node.left);}
  return {ids,values};
}

test("144 traverses root-left-right, correctly parses compact level order, and distinguishes identical values",()=>{
  const inputs=[...cases];let seed=144;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
  for(let k=0;k<100;k++)inputs.push(Array.from({length:random(32)},()=>random(11)-5));
  for(const input of inputs){
    const original=[...input],r=run(input),v=last(r),ref=oracle(v.nodes);
    assert.deepEqual(r.answer,ref.values);assert.deepEqual(v.visited,ref.ids);assert.deepEqual(v.answer,r.answer);assert.deepEqual(input,original);
    assert.equal(r.steps.filter(s=>s.final).length,1);assert.equal(v.trace.truncated,false);
    assert.equal(new Set(v.visited).size,v.nodes.length);assert.equal(v.completed.length,v.nodes.length);
    assert.ok(v.states.every(s=>s.visited&&s.leftDone&&s.rightDone&&s.returned));
  }
  assert.deepEqual(run(cases[0]).answer,[1,2,4,5,3,6,7]);assert.deepEqual(run(cases[1]).answer,[1,2,3]);
  const sparse=last(run(cases[1]));assert.equal(sparse.nodes.find(n=>n.id==="0:2").left,"0:3");
  assert.deepEqual(last(run([0,0,0])).visited,["0:0","0:1","0:2"]);
});

test("144 every source line, real local, recursive frame, branch and return matches native CPython",()=>{
  const source="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f({'code':p['code'],'method':'preorderTraversal','args':[a],'treeArgs':[0]})) for a in p['inputs']]))";
  const native=spawnSync(process.env.PYTHON||"python3",["-c",source],{input:JSON.stringify({path:require.resolve("../problems/picture-trace.py"),code:p.code.join("\n"),inputs:cases}),encoding:"utf8",maxBuffer:16e6});
  assert.equal(native.status,0,native.stderr);
  JSON.parse(native.stdout).forEach((ref,i)=>{
    const r=run(cases[i]);assert.deepEqual(r.answer,ref.answer);assert.equal(r.steps.length,ref.events.length);
    ref.events.forEach((event,j)=>{
      const step=r.steps[j],v=step.preorder144View;
      assert.deepEqual(step.codeLines,[event.line]);assert.equal(v.source.text,p.code[event.line-1].trim());assert.equal(v.source.timing,"after");
      for(const name of ["locals","outer","frames","scope","branch","returning","returned"])assert.deepEqual(v[name],event[name]);
      assert.deepEqual(v.res,event.locals.res);assert.deepEqual(step.vars.find(w=>w.name==="res").rawValue,event.locals.res);
      assert.deepEqual(v.stack.map(f=>f.node),event.frames.filter(f=>f.name==="dfs").map(f=>f.locals.node?.id??null));
    });
  });
});

test("144 mutates res only on append and waits for child return before marking either arm complete",()=>{
  let sawEmpty=false,sawImplicit=false;
  for(const input of cases){
    const r=run(input);let previous=null;
    for(const step of r.steps){
      const v=step.preorder144View,line=v.source.line,state=v.states.find(s=>s.id===v.active);
      assert.equal(v.visited.length,v.res.length);assert.deepEqual(v.output.map(item=>item.value),v.res);assert.deepEqual(v.output.map(item=>item.id),v.visited);
      if(line===7){assert.equal(v.append.index,previous.res.length);assert.deepEqual(v.res,[...previous.res,v.append.value]);assert.equal(state.order,v.append.index);assert.equal(state.visited,true);assert.equal(state.leftDone,false);}
      else if(previous){assert.deepEqual(v.res,previous.res);assert.equal(v.append,null);}
      if(line===5&&v.active!==null)assert.deepEqual(state,{id:v.active,order:null,visited:false,leftDone:false,rightDone:false,returned:false});
      if(line===8){assert.equal(state.leftDone,true);assert.equal(state.rightDone,false);assert.equal(state.returned,false);}
      if(line===9){sawImplicit=true;assert.equal(state.leftDone,true);assert.equal(state.rightDone,true);assert.equal(state.returned,true);assert.equal(v.returning,true);assert.equal(v.returned,null);}
      if(v.emptyCall){sawEmpty=true;assert.equal(state,undefined);assert.equal(v.emptyCall.returned,line===6);assert.ok(!v.visited.includes(null));
        if(v.emptyCall.parent){const parent=v.states.find(s=>s.id===v.emptyCall.parent);assert.equal(parent[v.emptyCall.side==="left"?"leftDone":"rightDone"],false);}
      }
      assert.ok(!Object.hasOwn(v.locals,"visited")&&!Object.hasOwn(v.locals,"phase"));previous=v;
    }
  }
  assert.ok(sawEmpty&&sawImplicit);
});

test("144 call identities match nesting, including distinct left/right None calls and immutable snapshots",()=>{
  for(const input of cases){
    const r=run(input),saved=JSON.stringify(r.steps[0]),v=last(r);
    assert.equal(v.calls.length,2*v.nodes.length+1);assert.equal(new Set(v.calls.map(c=>c.id)).size,v.calls.length);
    for(const call of v.calls){
      const enter=r.steps[call.enterStep].preorder144View,leave=r.steps[call.returnStep].preorder144View;
      assert.equal(enter.source.line,5);assert.equal(enter.callId,call.id);assert.equal(enter.active,call.node);
      assert.equal(leave.callId,call.id);assert.equal(leave.returning,true);assert.equal(leave.returned,null);
      assert.equal(leave.source.line,call.node===null?6:9);assert.ok(call.returnStep>call.enterStep);
      if(call.parent){const parent=v.calls.find(c=>c.node===call.parent);assert.ok(parent.enterStep<call.enterStep&&parent.returnStep>call.returnStep);}
    }
    assert.equal(JSON.stringify(r.steps[0]),saved);
  }
  const leaf=last(run([1]));assert.ok(leaf.calls.some(c=>c.id==="null:0:0:left"));assert.ok(leaf.calls.some(c=>c.id==="null:0:0:right"));
});

test("144 validates connected integer trees, accepts empty inputs and completely traces 31 levels",()=>{
  for(const input of [null,{},1,[null,1],[1,null,null,2],[NaN],[Infinity],[1.5],[-1001],[1001],Array(2),Array(32).fill(1),"1,,2","[1,]","abc"])assert.throws(()=>run(input),RangeError);
  for(const empty of [[],[null],[null,null],""," ","[]","null","None"])assert.deepEqual(run(empty).answer,[]);
  assert.deepEqual(run("1,None,2,3").answer,[1,2,3]);
  for(const side of ["left","right"]){const values=[0];for(let i=1;i<31;i++)values.push(...side==="left"?[i,null]:[null,i]);
    const r=run(values),v=last(r);assert.deepEqual(r.answer,Array.from({length:31},(_,i)=>i));assert.equal(v.nodes.at(-1).depth,30);assert.equal(v.trace.truncated,false);assert.equal(v.trace.captured,r.steps.length);assert.equal(v.calls.length,63);assert.equal(Math.max(...r.steps.map(s=>s.preorder144View.stack.length)),32);
  }
  assert.deepEqual(p.liveArgs("1,null,2,3"),[{__viz_type:"binary_tree",values:[1,null,2,3],tree_id:"root"}]);assert.equal(p.allowEmptyInput,true);assert.equal(p.debugMode,"line-by-line");
});

function renderer(language,extra={}){
  const host={innerHTML:"",querySelector:()=>null,querySelectorAll:()=>[]};const context={lang:language,document:{getElementById:()=>host},...extra};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-preorder-traversal-144.js"),"utf8"),context);
  return {context,host,render:step=>{context.renderPreorder144Pictures(step);return host.innerHTML;}};
}

test("144 pictures show actual visit order, partial results, stack frames and empty answers in VI/EN",()=>{
  for(const language of ["vi","en"])for(const input of cases){
    const r=run(input),saved=JSON.stringify(r),ui=renderer(language),first=ui.render(r.steps[0]);
    for(const step of r.steps){
      const v=step.preorder144View,html=ui.render(step);assert.doesNotMatch(html,/NaN|undefined|Infinity/);
      assert.deepEqual([...html.matchAll(/data-node-id="([^"]+)" data-node-value="(-?\d+)" data-node-order="([^"]+)" data-node-complete="(true|false)"/g)].map(m=>[m[1],+m[2],m[3],m[4]]),v.nodes.map(n=>[n.id,n.value,String(v.visited.includes(n.id)?v.visited.indexOf(n.id)+1:null),String(v.completed.includes(n.id))]));
      assert.deepEqual([...html.matchAll(/data-p144-output="([^"]+)" data-output-index="(\d+)" data-output-value="(-?\d+)"/g)].map(m=>[m[1],+m[2],+m[3]]),v.output.map(o=>[o.id,o.index,o.value]));
      assert.deepEqual([...html.matchAll(/data-frame-index="(\d+)" data-frame-node="([^"]+)" data-frame-side="([^"]+)" data-frame-phase="([^"]+)"/g)].map(m=>[+m[1],m[2],m[3],m[4]]),v.stack.map((f,i)=>[i,String(f.node),f.side,f.phase]));
      if(v.append)assert.ok(html.includes(`data-append-node="${v.append.id}" data-append-index="${v.append.index}"`));
      if(v.answer!==null)assert.ok(html.includes(`data-answer="${JSON.stringify(v.answer)}"`));
    }
    assert.equal(ui.render(r.steps[0]),first);assert.equal(JSON.stringify(r),saved);
  }
});

test("144 call/append/return/result navigation and keyboard selection use actual call and append statements",()=>{
  const r=run([1,null,2,3]);
  for(const [kind,predicate]of [["call",v=>v.source.line===5],["append",v=>v.source.line===7],["return",v=>v.returning&&v.scope==="dfs"],["result",v=>v.answer!==null]]){
    let stopped=0,rendered=0;const ui=renderer("vi",{steps:r.steps,stepIndex:0,stopPlay:()=>stopped++,renderStep:()=>rendered++});
    ui.context.p144Jump(kind);assert.ok(predicate(r.steps[ui.context.stepIndex].preorder144View));assert.equal(stopped,1);assert.equal(rendered,1);
    ui.context.stepIndex=r.steps.length-1;ui.context.p144Jump(kind);assert.equal(ui.context.stepIndex,r.steps.length-1);
  }
  for(const [selector,dataset,line,nodeId]of [["[data-p144-call]",{p144Call:"null:0:0:left"},5,null],["[data-p144-call]",{p144Call:"node:0:3"},5,"0:3"],["[data-p144-output]",{p144Output:"0:3"},7,"0:3"]])for(const key of ["Enter"," "]){
    const handlers={},node={dataset,addEventListener:(name,fn)=>{handlers[name]=fn;}},host={querySelectorAll:s=>s===selector?[node]:[]};
    const ui=renderer("en",{steps:r.steps,stepIndex:0,renderStep(){}});let prevented=0,stopped=0;
    ui.context.p144Bind(host);handlers.keydown({key,preventDefault:()=>prevented++,stopPropagation:()=>stopped++});
    const v=r.steps[ui.context.stepIndex].preorder144View;assert.equal(v.source.line,line);assert.equal(v.active,nodeId);assert.equal(prevented,1);assert.equal(stopped,1);
  }
});
