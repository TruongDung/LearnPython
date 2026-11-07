"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),{spawnSync}=require("node:child_process"),fs=require("node:fs"),vm=require("node:vm");
const {SUPPORTED,CATEGORY_ORDER}=require("../problems"),p=SUPPORTED[107],run=input=>p.builder(input),last=r=>r.steps.at(-1).levelOrder107View;
const cases=[[3,9,20,null,null,15,7],[1,2,3,4,5,6,7],[1,null,2,3],[0,0,0],[0],[],[null],[-8,-3,-10,null,null,-5,-1],[1,2,3,null,4,5,null,null,6]];
function oracle(nodes){const byId=new Map(nodes.map(n=>[n.id,n])),rows=[];const visit=(id,d)=>{if(id===null)return;const n=byId.get(id);(rows[d]??=[]).push(id);visit(n.left,d+1);visit(n.right,d+1);};if(nodes.length)visit(nodes[0].id,0);return {ids:rows,values:rows.map(row=>row.map(id=>byId.get(id).value))};}
test("107 is registered and reverses only the levels, retaining every row's left-to-right node identity",()=>{
 assert.ok(CATEGORY_ORDER['binary-tree'].order.includes(107));assert.ok(p.tags.some(t=>t.key==="bfs"));const inputs=[...cases];let seed=107;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};for(let i=0;i<60;i++)inputs.push(Array.from({length:random(32)},()=>random(21)-10));
 for(const input of inputs){const original=[...input],r=run(input),v=last(r),ref=oracle(v.nodes);assert.equal(r.answer,JSON.stringify([...ref.values].reverse()));assert.deepEqual(v.answer,[...ref.values].reverse());assert.deepEqual(v.answerIds,[...ref.ids].reverse());assert.deepEqual(v.resultIds,ref.ids);if(v.nodes.length)assert.deepEqual(v.result,ref.values);assert.deepEqual(input,original);assert.equal(r.steps.filter(s=>s.final).length,1);assert.equal(v.trace.truncated,false);}
 assert.equal(run(cases[0]).answer,'[[15,7],[9,20],[3]]');assert.equal(run([1,null,2,3]).answer,'[[3],[2],[1]]');
});
test("107 all source events, imports, deque locals, loop branches and returns agree with CPython",()=>{
 const source="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f({'code':p['code'],'method':'levelOrderBottom','args':[a],'treeArgs':[0]})) for a in p['inputs']]))";
 const ref=spawnSync(process.env.PYTHON||"python3",["-c",source],{input:JSON.stringify({path:require.resolve("../problems/picture-trace.py"),code:p.code.join("\n"),inputs:cases}),encoding:"utf8",maxBuffer:16e6});assert.equal(ref.status,0,ref.stderr);
 JSON.parse(ref.stdout).forEach((native,i)=>{const r=run(cases[i]);assert.equal(r.answer,JSON.stringify(native.answer));assert.equal(r.steps.length,native.events.length);native.events.forEach((e,j)=>{const s=r.steps[j],v=s.levelOrder107View;assert.deepEqual(s.codeLines,[e.line]);assert.equal(v.source.text,p.code[e.line-1].trim());for(const k of ["locals","outer","frames","scope","branch","returned","returning"])assert.deepEqual(v[k],e[k]);assert.deepEqual(v.queue,e.locals.queue?.map(n=>n.id)??null);for(const watch of s.vars)assert.deepEqual(watch.rawValue,e.locals[watch.name]??null);});});
});
test("107 locks the range once, pops only original frontier nodes, and allows mixed queue roles",()=>{
 let mixed=false,grew=false;for(const input of cases){const r=run(input);let previous=null;for(const s of r.steps){const v=s.levelOrder107View,l=v.source.line;if(previous&&previous.round===v.round&&v.limit!==null&&previous.limit!==null)assert.equal(v.limit,previous.limit);
 if(l===11){assert.equal(v.current,previous.queue[0]);assert.deepEqual(v.queue,previous.queue.slice(1));assert.ok(v.roundIds.includes(v.current));assert.equal(v.popped.length,previous.popped.length+1);}
 if(l===14||l===16){assert.deepEqual(v.queue,[...previous.queue,v.probe.child]);assert.equal(v.probe.appended,true);if(v.queue.length>v.limit)grew=true;}
 if(v.limit!==null){assert.equal(v.remaining,v.limit-v.popped.length);assert.equal(v.queueRoles.filter(role=>role==="current").length,v.remaining);}
 if(v.queueRoles?.includes("current")&&v.queueRoles.includes("next"))mixed=true;
 if(l===10&&!v.branch){assert.deepEqual(v.popped,v.roundIds);assert.equal(v.remaining,0);assert.equal(v.current,null);assert.ok(v.locals.node);}
 previous=v;}}assert.ok(mixed&&grew);
});
test("107 collection, result appends and reversal each occur on the actual Python statement",()=>{
 for(const input of cases){const r=run(input);let previous=null;for(const s of r.steps){const v=s.levelOrder107View,l=v.source.line;if(previous){if(![7,11,14,16].includes(l))assert.deepEqual(v.queue,previous.queue);if(![7,17].includes(l))assert.deepEqual(v.result,previous.result);if(![9,12].includes(l))assert.deepEqual(v.level,previous.level);}
 if(l===9){assert.deepEqual(v.level,[]);assert.equal(v.limit,null);}
 if(l===12){assert.deepEqual(v.level,[...previous.level,v.locals.node.val]);assert.equal(v.change.node,v.current);}
 if(l===17){assert.deepEqual(v.result,[...previous.result,v.level]);assert.equal(v.popped.length,v.limit);}
 if(l===18){assert.equal(v.reversed,true);assert.deepEqual(v.result,previous.result);assert.deepEqual(v.answer,[...v.result].reverse());}
 else if(l!==6){assert.equal(v.reversed,false);assert.equal(v.answer,null);assert.equal(v.answerIds,null);}
 assert.ok(!Object.hasOwn(v.locals,"limit")&&!Object.hasOwn(v.locals,"roundIds"));previous=v;
 }}
});
test("107 preserves unbound variables and historical snapshots with stable duplicate IDs",()=>{
 for(const input of cases){const r=run(input),saved=JSON.stringify(r.steps[0]);for(const s of r.steps){const v=s.levelOrder107View,byId=new Map(v.nodes.map(n=>[n.id,n]));if(v.result!==null)assert.deepEqual(v.resultIds.map(row=>row.map(id=>byId.get(id).value)),v.result);if(v.level!==null)assert.deepEqual(v.levelIds.map(id=>byId.get(id).value),v.level);if(v.source.line===5){assert.equal(v.queue,null);assert.equal(v.result,null);assert.equal(v.level,null);}if(v.source.line===6){assert.deepEqual(v.answer,[]);assert.equal(v.locals.result,undefined);}}
 assert.equal(JSON.stringify(r.steps[0]),saved);}
 assert.deepEqual(last(run([0,0,0])).answerIds,[["0:1","0:2"],["0:0"]]);
});
test("107 validates trees and completely replays 31 levels and a 16-node frontier",()=>{
 for(const input of [null,{},1,[null,1],[1,null,null,2],[NaN],[Infinity],[1.5],[-1001],[1001],Array(2),Array(32).fill(1),"1,,2","[1,]","abc"])assert.throws(()=>run(input),RangeError);
 for(const input of [[],[null],""," ","[]","null","None"])assert.equal(run(input).answer,'[]');const chain=[0];for(let i=1;i<31;i++)chain.push(null,i);
 for(const input of [chain,Array.from({length:31},(_,i)=>i)]){const r=run(input),v=last(r);assert.equal(v.trace.truncated,false);assert.equal(v.trace.captured,r.steps.length);assert.equal(v.recorded.length,31);assert.deepEqual(v.answer,[...oracle(v.nodes).values].reverse());}assert.equal(last(run(chain)).answer.length,31);
 assert.deepEqual(p.liveArgs("1,null,2,3"),[{__viz_type:"binary_tree",values:[1,null,2,3],tree_id:"root"}]);assert.equal(p.debugMode,"line-by-line");
});
function renderer(language,extra={}){const host={innerHTML:"",querySelector:()=>null,querySelectorAll:()=>[]},context={lang:language,document:{getElementById:()=>host},...extra};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-level-order-bottom-107.js"),"utf8"),context);return {context,host,render:s=>{context.renderLevelOrder107Pictures(s);return host.innerHTML;}};}
test("107 pictures show actual queue/level values and keep original and reversed boards separate",()=>{
 for(const language of ["vi","en"])for(const input of cases){const r=run(input),saved=JSON.stringify(r),ui=renderer(language),first=ui.render(r.steps[0]);for(const s of r.steps){const v=s.levelOrder107View,html=ui.render(s);assert.doesNotMatch(html,/NaN|undefined|Infinity/);assert.match(html,/LEETCODE 107 · BOTTOM-UP BFS/);assert.ok(html.includes(`data-queue-ids="${ui.context.r107Escape(JSON.stringify(v.queue))}"`));assert.ok(html.includes(`data-range-limit="${v.limit}"`));
 assert.deepEqual([...html.matchAll(/data-level-index="(\d+)" data-level-value="(-?\d+)"/g)].map(m=>[+m[1],+m[2]]),(v.level??[]).map((n,i)=>[i,n]));
 for(const name of ["result","return"]){const rows=name==="result"?v.result:v.answer;if(name==="return"&&v.answer===null||name==="result"&&v.result===null&&v.answer!==null)continue;assert.ok(html.includes(`data-board="${name}" data-board-values="${ui.context.r107Escape(JSON.stringify(rows))}"`));}
 assert.equal(html.includes('class="r107-reverse"'),v.reversed);if(v.reversed)assert.deepEqual([...html.matchAll(/data-reverse-from="(\d+)" data-reverse-to="(\d+)"/g)].map(m=>[+m[1],+m[2]]),v.resultIds.map((_,i)=>[i,v.resultIds.length-1-i]));
 }assert.equal(ui.render(r.steps[0]),first);assert.equal(JSON.stringify(r),saved);}
});
test("107 jumps, keyboard node selection and row selection use real pop and record events",()=>{
 const r=run(cases[0]);for(const [kind,predicate]of [["level",v=>v.source.line===8&&v.branch],["pop",v=>v.source.line===11],["record",v=>v.source.line===17],["result",v=>v.answer!==null]]){const ui=renderer("vi",{steps:r.steps,stepIndex:0,renderStep(){},stopPlay(){}});ui.context.r107Jump(kind);assert.ok(predicate(r.steps[ui.context.stepIndex].levelOrder107View));}
 for(const [selector,dataset,predicate]of [["[data-r107-node]",{r107Node:"0:6"},v=>v.source.line===11&&v.current==="0:6"],["[data-r107-result]",{r107Result:"1"},v=>v.source.line===17&&v.change.index===1]])for(const key of ["Enter"," "]){const handlers={},node={dataset,addEventListener:(n,f)=>{handlers[n]=f;}},ui=renderer("en",{steps:r.steps,stepIndex:0,renderStep(){}});let prevented=0,stopped=0;ui.context.r107Bind({querySelectorAll:s=>s===selector?[node]:[]});handlers.keydown({key,preventDefault:()=>prevented++,stopPropagation:()=>stopped++});assert.ok(predicate(r.steps[ui.context.stepIndex].levelOrder107View));assert.equal(prevented,1);assert.equal(stopped,1);}
});
