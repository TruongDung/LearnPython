"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),{spawnSync}=require("node:child_process"),fs=require("node:fs"),vm=require("node:vm");
const p=require("../problems").SUPPORTED[102],run=input=>p.builder(input),last=r=>r.steps.at(-1).levelOrder102View;
const cases=[[3,9,20,null,null,15,7],[1,2,3,4,5,6,7],[1,null,2,3],[0,0,0],[0],[],[null],[-8,-3,-10,null,null,-5,-1],[1,2,3,null,4,5,null,null,6]];
function oracle(nodes){
  const byId=new Map(nodes.map(n=>[n.id,n])),rows=[];const visit=(id,depth)=>{if(id===null)return;const n=byId.get(id);(rows[depth]??=[]).push(id);visit(n.left,depth+1);visit(n.right,depth+1);};
  if(nodes.length)visit(nodes[0].id,0);return {ids:rows,values:rows.map(row=>row.map(id=>byId.get(id).value))};
}

test("102 groups nodes left-to-right by depth and correctly parses sparse level-order trees",()=>{
  const inputs=[...cases];let seed=102;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
  for(let i=0;i<100;i++)inputs.push(Array.from({length:random(32)},()=>random(2001)-1000));
  for(const input of inputs){const saved=[...input],r=run(input),v=last(r),ref=oracle(v.nodes);assert.deepEqual(r.answer,ref.values);assert.deepEqual(v.resultIds,ref.ids);assert.deepEqual(v.answer,r.answer);assert.deepEqual(input,saved);assert.equal(v.recorded.length,v.nodes.length);assert.equal(new Set(v.recorded).size,v.nodes.length);assert.equal(r.steps.filter(s=>s.final).length,1);assert.equal(v.trace.truncated,false);}
  assert.deepEqual(run(cases[0]).answer,[[3],[9,20],[15,7]]);assert.deepEqual(run([1,null,2,3]).answer,[[1],[2],[3]]);assert.deepEqual(run([0,0,0]).answer,[[0],[0,0]]);assert.deepEqual(run([]).answer,[]);
});

test("102 source statements, comprehension scope, locals, frames, loop branches and returns match CPython",()=>{
  const source="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f({'code':p['code'],'method':'levelOrder','args':[a],'treeArgs':[0]})) for a in p['inputs']]))";
  const native=spawnSync(process.env.PYTHON||"python3",["-c",source],{input:JSON.stringify({path:require.resolve("../problems/picture-trace.py"),code:p.code.join("\n"),inputs:cases}),encoding:"utf8",maxBuffer:16e6});assert.equal(native.status,0,native.stderr);
  JSON.parse(native.stdout).forEach((ref,i)=>{const r=run(cases[i]);assert.deepEqual(r.answer,ref.answer);assert.equal(r.steps.length,ref.events.length);
    ref.events.forEach((event,j)=>{const step=r.steps[j],v=step.levelOrder102View;assert.deepEqual(step.codeLines,[event.line]);assert.equal(v.source.text,p.code[event.line-1].trim());assert.equal(v.source.timing,"after");for(const name of ["locals","outer","frames","scope","branch","returning","returned"])assert.deepEqual(v[name],event[name]);
      assert.deepEqual(v.queue,event.locals.queue?.map(n=>n.id)??null);assert.deepEqual(v.nxt,event.locals.nxt?.map(n=>n.id)??null);assert.deepEqual(v.level,event.locals.level??null);assert.deepEqual(v.res,event.locals.res??null);
      for(const watch of step.vars)assert.deepEqual(watch.rawValue,event.locals[watch.name]??null);
    });
  });
  const r=run(cases[0]),first=r.steps.find(s=>s.codeLines[0]===7).levelOrder102View;assert.equal(first.locals.n,undefined);
  const later=r.steps.find(s=>s.codeLines[0]===7&&s.levelOrder102View.round===2).levelOrder102View;assert.equal(later.locals.n.id,"0:0");assert.equal(later.current,null);
});

test("102 the shared-list badge agrees with actual Python object identity before/after nxt resets",()=>{
  const source=`import json,sys,runpy
p=json.load(sys.stdin)
lib=runpy.run_path(p['path'])
ns={}
exec(compile(p['code'],'<identity>','exec'),ns)
results=[]
for values in p['inputs']:
    checkpoints={6:[],10:[]}
    def observe(frame,event,arg):
        if frame.f_code.co_filename=='<identity>' and event=='line' and frame.f_lineno in checkpoints:
            x=frame.f_locals
            checkpoints[frame.f_lineno].append(x['queue'] is x['nxt'] if 'queue' in x and 'nxt' in x else None)
        return observe
    try:
        sys.settrace(observe)
        ns['Solution']().levelOrder(lib['picture_tree'](values,0))
    finally:
        sys.settrace(None)
    results.append(checkpoints)
print(json.dumps(results))`;
  const native=spawnSync(process.env.PYTHON||"python3",["-c",source],{input:JSON.stringify({path:require.resolve("../problems/picture-trace.py"),code:p.code.join("\n"),inputs:cases}),encoding:"utf8"});assert.equal(native.status,0,native.stderr);
  JSON.parse(native.stdout).forEach((checkpoints,i)=>{const r=run(cases[i]);for(const line of [6,10])assert.deepEqual(r.steps.filter(s=>s.codeLines[0]===line).map(s=>s.levelOrder102View.alias),checkpoints[line]);});
});

test("102 queue never pops during for; level, res, nxt and queue change on their own physical statements",()=>{
  let sawSkip=false,sawZeroChild=false;
  for(const input of cases){const r=run(input);let previous=null;for(const step of r.steps){const v=step.levelOrder102View,line=v.source.line;
    if(previous){if(![5,15].includes(line))assert.deepEqual(v.queue,previous.queue);if(![5,8].includes(line))assert.deepEqual(v.res,previous.res);if(line!==7)assert.deepEqual(v.level,previous.level);if(![9,12,14].includes(line))assert.deepEqual(v.nxt,previous.nxt);}
    if(line===7){assert.deepEqual(v.levelIds,v.queue);assert.deepEqual(v.level,v.locals.queue.map(n=>n.val));}
    if(line===8){assert.deepEqual(v.res,[...previous.res,previous.level]);assert.deepEqual(v.resultIds.at(-1),v.levelIds);}
    if(line===9){assert.deepEqual(v.nxt,[]);assert.equal(v.alias,false);}
    if(line===12||line===14){assert.deepEqual(v.nxt,[...previous.nxt,v.change.child]);assert.equal(v.probe.appended,true);const child=v.nodes.find(n=>n.id===v.change.child);assert.equal(child.parent,v.current);if(child.value===0)sawZeroChild=true;}
    if(line===15){assert.deepEqual(v.queue,previous.nxt);assert.deepEqual(v.queue,v.nxt);assert.equal(v.alias,true);assert.equal(v.current,null);}
    if(line===10){if(v.branch){assert.equal(v.current,v.locals.n.id);assert.equal(v.queue[v.cursor],v.current);}else{assert.equal(v.current,null);assert.ok(v.locals.n);}}
    if(v.probe&&!v.probe.exists){sawSkip=true;assert.ok([11,13].includes(line));assert.equal(v.branch,false);assert.ok(!v.nxt.includes(null));}
    assert.ok(!Object.hasOwn(v.locals,"round")&&!Object.hasOwn(v.locals,"alias")&&!Object.hasOwn(v.locals,"current"));previous=v;
  }}assert.ok(sawSkip&&sawZeroChild);
});

test("102 snapshots retain historical level IDs, unbound variables and native final empty returns",()=>{
  for(const input of cases){const r=run(input),saved=JSON.stringify(r.steps[0]);for(const step of r.steps){const v=step.levelOrder102View,byId=new Map(v.nodes.map(n=>[n.id,n]));
    if(v.res!==null)assert.deepEqual(v.resultIds.map(row=>row.map(id=>byId.get(id).value)),v.res);
    if(v.level!==null)assert.deepEqual(v.levelIds.map(id=>byId.get(id).value),v.level);
    for(const row of v.resultIds)assert.ok(row.every(id=>byId.get(id).depth===byId.get(row[0]).depth));
    if(v.source.line===3){assert.equal(v.queue,null);assert.equal(v.nxt,null);assert.equal(v.level,null);assert.equal(v.res,null);}
    if(v.source.line===4){assert.deepEqual(v.answer,[]);assert.equal(v.locals.res,undefined);assert.equal(v.res,null);}
  }assert.equal(JSON.stringify(r.steps[0]),saved);}
});

test("102 validates trees and completely traces both 31 levels and a 16-node-wide frontier",()=>{
  for(const input of [null,{},1,[null,1],[1,null,null,2],[NaN],[Infinity],[1.5],[-1001],[1001],Array(2),Array(32).fill(1),"1,,2","[1,]","abc"])assert.throws(()=>run(input),RangeError);
  for(const input of [[],[null],""," ","[]","null","None"])assert.deepEqual(run(input).answer,[]);
  const skew=[0];for(let i=1;i<31;i++)skew.push(null,i);
  for(const input of [skew,Array.from({length:31},(_,i)=>i)]){const r=run(input),v=last(r);assert.equal(v.trace.truncated,false);assert.equal(v.trace.captured,r.steps.length);assert.equal(v.recorded.length,31);assert.deepEqual(r.answer,oracle(v.nodes).values);}
  assert.equal(run(skew).answer.length,31);assert.equal(run(Array(31).fill(0)).answer.at(-1).length,16);
  assert.deepEqual(p.liveArgs("1,null,2,3"),[{__viz_type:"binary_tree",values:[1,null,2,3],tree_id:"root"}]);assert.equal(p.debugMode,"line-by-line");assert.equal(p.allowEmptyInput,true);
});
function renderer(language,extra={}){
  const host={innerHTML:"",querySelector:()=>null,querySelectorAll:()=>[]},context={lang:language,document:{getElementById:()=>host},...extra};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-level-order-102.js"),"utf8"),context);
  return {context,host,render:step=>{context.renderLevelOrder102Pictures(step);return host.innerHTML;}};
}

test("102 pictures show real frontier IDs, level values, res rows and alias/child states in VI/EN",()=>{
  for(const language of ["vi","en"])for(const input of cases){const r=run(input),saved=JSON.stringify(r),ui=renderer(language),first=ui.render(r.steps[0]);
    for(const step of r.steps){const v=step.levelOrder102View,html=ui.render(step);assert.doesNotMatch(html,/NaN|undefined|Infinity/);assert.match(html,/LEETCODE 102 · LEVEL ORDER BFS/);
      assert.deepEqual([...html.matchAll(/data-buffer="([^"]+)" data-buffer-ids="([^"]+)"/g)].map(m=>[m[1],m[2]]),["queue","nxt"].map(name=>[name,ui.context.b102Escape(JSON.stringify(v[name]))]));
      assert.deepEqual([...html.matchAll(/data-level-index="(\d+)" data-level-value="(-?\d+)"/g)].map(m=>[+m[1],+m[2]]),(v.level??[]).map((value,i)=>[i,value]));
      assert.deepEqual([...html.matchAll(/data-result-index="(\d+)" data-result-value="(-?\d+)"/g)].map(m=>[+m[1],+m[2]]),(v.res??[]).flatMap((row,i)=>row.map(value=>[i,value])));
      assert.equal(html.includes('data-queue-alias="true"'),v.alias===true);
      if(v.probe)assert.ok(html.includes(`data-probe-child="${v.probe.child}" data-probe-appended="${v.probe.appended}"`));
      if(v.answer!==null)assert.ok(html.includes(`data-answer="${JSON.stringify(v.answer)}"`));
    }assert.equal(ui.render(r.steps[0]),first);assert.equal(JSON.stringify(r),saved);
  }
});

test("102 level/record/child/result jumps and keyboard node/row selection replay actual loop and append statements",()=>{
  const r=run(cases[0]);for(const [kind,predicate]of [["level",v=>v.source.line===6&&v.branch],["record",v=>v.source.line===8],["child",v=>v.change?.kind==="enqueue"],["result",v=>v.answer!==null]]){let rendered=0,stopped=0;const ui=renderer("vi",{steps:r.steps,stepIndex:0,renderStep:()=>rendered++,stopPlay:()=>stopped++});ui.context.b102Jump(kind);assert.ok(predicate(r.steps[ui.context.stepIndex].levelOrder102View));assert.equal(rendered,1);assert.equal(stopped,1);ui.context.stepIndex=r.steps.length-1;ui.context.b102Jump(kind);assert.equal(ui.context.stepIndex,r.steps.length-1);}
  for(const [selector,dataset,predicate]of [["[data-b102-node]",{b102Node:"0:6"},v=>v.source.line===10&&v.current==="0:6"],["[data-b102-result]",{b102Result:"1"},v=>v.source.line===8&&v.change.index===1]])for(const key of ["Enter"," "]){const handlers={},node={dataset,addEventListener:(name,fn)=>{handlers[name]=fn;}},host={querySelectorAll:s=>s===selector?[node]:[]};const ui=renderer("en",{steps:r.steps,stepIndex:0,renderStep(){}});let prevented=0,stopped=0;ui.context.b102Bind(host);handlers.keydown({key,preventDefault:()=>prevented++,stopPropagation:()=>stopped++});assert.ok(predicate(r.steps[ui.context.stepIndex].levelOrder102View));assert.equal(prevented,1);assert.equal(stopped,1);}
});
