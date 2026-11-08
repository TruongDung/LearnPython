"use strict";
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const {SUPPORTED:p,CATEGORY_ORDER}=require('../problems');
const ids=[199,671,515,513,662,116,117,1609,2415,2471,2583,2641,545],methods=id=>id===199?[1,2,3]:[1];
const run=(id,input=p[id].defaultInput,params={})=>p[id].builder(input,{k:2,...params}),last=r=>r.steps.at(-1).treeReplayView;
function rows(v){const out=[];for(const n of v.nodes)(out[n.depth]??=[]).push(n);return out;}
function oracle(id,v,k=2){const a=rows(v),byId=new Map(v.nodes.map(n=>[n.id,n])),original=n=>n.original;
 if(id===199)return a.map(row=>row.at(-1).original);
 if(id===671){const values=[...new Set(v.nodes.map(original))].sort((a,b)=>a-b);return values[1]??-1;}
 if(id===515)return a.map(row=>Math.max(...row.map(original)));
 if(id===513)return a.at(-1)[0].original;
 if(id===662){const levels=[];const visit=(id,d,pos)=>{if(id===null)return;const n=byId.get(id);(levels[d]??=[]).push(pos);visit(n.left,d+1,2*pos);visit(n.right,d+1,2*pos+1);};if(v.nodes.length)visit(v.nodes[0].id,0,0);return Math.max(0,...levels.map(row=>row.at(-1)-row[0]+1));}
 if(id===1609)return a.every((row,d)=>row.every((n,i)=>Math.abs(n.original%2)===(d%2?0:1)&&(i===0||(d%2?n.original<row[i-1].original:n.original>row[i-1].original))));
 if(id===2471){let count=0;for(const row of a){const values=row.map(original),target=[...values].sort((a,b)=>a-b);for(let i=0;i<values.length;i++)if(values[i]!==target[i]){const j=values.indexOf(target[i]);[values[i],values[j]]=[values[j],values[i]];count++;}}return count;}
 if(id===2583){const sums=a.map(row=>row.reduce((s,n)=>s+n.original,0)).sort((a,b)=>b-a);return sums[k-1]??-1;}
 if(id===545){if(!v.nodes.length)return [];const root=v.nodes[0],leaf=n=>n.left===null&&n.right===null;if(leaf(root))return [root.original];const result=[root.original],right=[];for(let n=byId.get(root.left);n;n=byId.get(n.left??n.right))if(!leaf(n))result.push(n.original);const visit=id=>{if(id===null)return;const n=byId.get(id);if(leaf(n))result.push(n.original);else{visit(n.left);visit(n.right);}};visit(root.id);for(let n=byId.get(root.right);n;n=byId.get(n.right??n.left))if(!leaf(n))right.push(n.original);return [...result,...right.reverse()];}
 return null;
}
let seed=51;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
function samples(id){const out=[p[id].defaultInput];if(id===671){out.push([2,2,2],[1]);for(let i=0;i<12;i++){const depth=random(5),a=Array(2**(depth+1)-1).fill(0);for(let j=2**depth-1;j<a.length;j++)a[j]=1+random(20);for(let j=2**depth-2;j>=0;j--)a[j]=Math.min(a[2*j+1],a[2*j+2]);out.push(a);}return out;}
 for(let i=0;i<15;i++){const length=[116,2415].includes(id)?2**(1+random(4))-1:1+random(31),a=Array.from({length},(_,j)=>id===2471?j*3-20:random(51)-25);if(id===2471)for(let j=a.length-1;j;j--){const k=random(j+1);[a[j],a[k]]=[a[k],a[j]];}out.push(a);}
 if(![513,671,2415,2471].includes(id))out.push([]);return out;
}
test('13 tree lessons register native Python replay, lazy pictures, stable tree identity and complete traces',()=>{
 for(const id of ids){assert.ok(CATEGORY_ORDER['binary-tree'].order.includes(id));assert.equal(p[id].debugMode,'line-by-line');for(const method of methods(id)){const r=run(id,undefined,{approach:method}),v=last(r);assert.ok(r.steps.length>1);assert.equal(v.problemId,id);assert.equal(v.method,method);assert.equal(v.trace.truncated,false);assert.equal(v.trace.captured,r.steps.length);assert.equal(r.steps.filter(s=>s.final).length,1);assert.ok(r.steps.every(s=>s.treeReplayView&&s.codeLines.length===1));}}
});
test('all scalar/list algorithms agree with independent tree oracles, including all three 199 methods',()=>{
 for(const id of ids.filter(id=>![116,117,2415,2641].includes(id)))for(const input of samples(id))for(const method of methods(id)){const r=run(id,input,{approach:method}),v=last(r),expected=oracle(id,v);assert.deepEqual(v.answer,expected,`${id}/${method}/${input}`);assert.deepEqual(r.answer,[199,515].includes(id)?JSON.stringify(expected):expected);}
 for(const input of ['1,2,3,4,null,null,null,5','0,0,0','1,null,2,3'])for(const method of methods(199)){const v=last(run(199,input,{approach:method}));assert.deepEqual(v.selected,rows(v).map(row=>row.at(-1).id));}
});
test('mutating lessons capture actual next links and node values after every source assignment',()=>{
 for(const id of [116,117,2415,2641])for(const input of samples(id)){const r=run(id,input),v=last(r),a=rows(v);
 if([116,117].includes(id))for(const row of a)row.forEach((n,i)=>assert.equal(n.next,row[i+1]?.id??null));
 if(id===2415)for(const [d,row] of a.entries())assert.deepEqual(row.map(n=>n.value),(d%2?[...row].reverse():row).map(n=>n.original));
 if(id===2641)for(const row of a){const sum=row.reduce((s,n)=>s+n.original,0);for(const n of row){const family=row.filter(o=>o.parent===n.parent).reduce((s,o)=>s+o.original,0);assert.equal(n.value,n.parent===null?0:sum-family);}}
 let previous=null;for(const s of r.steps){const current=s.treeReplayView;if(previous)for(const n of current.nodes){const old=previous.nodes.find(o=>o.id===n.id);if(n.value!==old.value||n.next!==old.next)assert.ok(current.changed.some(c=>c.id===n.id));}previous=current;}
 }
});
test('native frames, locals, branch decisions, return values and captured trees match CPython for every code block',()=>{
 const cases=[];for(const id of ids)for(const method of methods(id)){const code=p[id][method===1?'code':'code'+method],args=p[id].liveArgs(p[id].defaultInput,{k:2}),captureNext=[116,117].includes(id);cases.push({id,method,payload:{code:code.join('\n'),method:code.find(s=>s.includes('    def ')).match(/def (\w+)/)[1],args:[args[0].values,...args.slice(1)],treeArgs:[0],captureTrees:true,...(captureNext?{captureNext:true}:{})}});}
 const script="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(c['payload'])) for c in p['cases']]))",ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),cases}),encoding:'utf8',maxBuffer:32e6});assert.equal(ref.status,0,ref.stderr);
 JSON.parse(ref.stdout).forEach((native,i)=>{const {id,method}=cases[i],r=run(id,undefined,{approach:method});assert.equal(r.steps.length,native.events.length,`${id}/${method}`);native.events.forEach((event,j)=>{const s=r.steps[j],v=s.treeReplayView;assert.deepEqual(s.codeLines,[event.line]);assert.equal(s.codeBlock,method);for(const key of ['locals','outer','frames','branch','scope','returned','returning'])assert.deepEqual(v[key],event[key],`${id}/${method}/${j}/${key}`);for(const n of v.nodes){const original=event.trees.find(o=>o.id===n.id);assert.equal(n.value,original.val);if([116,117].includes(id))assert.equal(n.next,original.next);}for(const variable of s.vars)assert.deepEqual(variable.rawValue,event.locals[variable.name]);});});
});
test('515 locks size, resets to negative infinity, compares once per pop, and commits only after a whole level',()=>{
 const r=run(515,'-1,-2,-3,-4,-5');let previous=null;for(const s of r.steps){const v=s.treeReplayView;if(v.source.text.startsWith('level_max = float'))assert.equal(v.locals.level_max,'−∞');if(v.change?.kind==='compare'){const c=v.change;assert.equal(c.after,Math.max(c.before==='−∞'?-Infinity:c.before,c.value));assert.deepEqual(v.locals.answer,previous.locals.answer);}if(v.source.text==='answer.append(level_max)')assert.equal(v.popped.length,v.limit);if(v.limit!==null)assert.equal(v.queueRoles.filter(k=>k==='current').length,v.limit-v.popped.length);previous=v;}assert.equal(r.answer,'[-1,-2,-4]');
});
test('199 DFS records each depth once; 513 overwrites only for the first node, preserving earlier history',()=>{
 const r=run(199,undefined,{approach:3});for(const s of r.steps){const v=s.treeReplayView;if(v.change?.kind==='record'){assert.equal(v.decision.pass,true);assert.equal(v.decision.left,v.decision.right);assert.equal(v.locals.res.length,v.decision.right+1);}}
 const left=run(513,'1,2,3,4,null,5,6,null,null,7');for(const s of left.steps){const v=s.treeReplayView;if(v.source.text==='answer = node.val')assert.equal(v.locals.i,0);}assert.equal(left.answer,7);assert.ok(last(left).selections.length>1);
});
test('671 pruning skips every descendant; DFS return values merge and -1 is not a second minimum',()=>{
 const r=run(671),v=last(r);assert.equal(r.answer,5);assert.deepEqual(v.pruned,['0:5','0:6']);assert.deepEqual(v.candidates,['0:2']);assert.ok(v.pruned.every(id=>!v.visited.includes(id)));assert.ok(r.steps.some(s=>s.treeReplayView.returning&&s.treeReplayView.returned===-1));assert.equal(run(671,'2,2,2').answer,-1);
});
test('DFS pictures place None calls on their actual left/right edge in traversal order',()=>{
 for(const id of [199,671])for(const input of [p[id].defaultInput,id===671?'2,2,2':'1,2,3,4']){
  const r=run(id,input,{approach:3}),v=last(r),byId=new Map(v.nodes.map(n=>[n.id,n])),expected=[];
  const visit=(node,parent=null,side='root')=>{if(node===null){expected.push([parent,side]);return;}const n=byId.get(node);if(id===671&&n.original>v.nodes[0].original)return;for(const direction of(id===199?['right','left']:['left','right']))visit(n[direction],n.id,direction);};
  visit(v.nodes[0].id);const actual=r.steps.map(s=>s.treeReplayView).filter(v=>v.scope==='dfs'&&v.source.text==='if not node:'&&v.locals.node===null).map(v=>[v.probe.parent,v.probe.side]);assert.deepEqual(actual,expected);
 }
});
test('662 normalized gaps include null slots and remain exact for deep sparse trees',()=>{
 assert.equal(run(662,'1,2,3,4,null,null,5').answer,4);const chain=[1];for(let i=1;i<31;i++)chain.push(null,i);const r=run(662,chain);assert.equal(r.answer,1);assert.equal(last(r).trace.truncated,false);assert.ok(r.steps.some(s=>s.treeReplayView.source.text==='pos -= first'&&s.treeReplayView.locals.pos===0&&s.treeReplayView.locals.first>0));
});
test('heap can temporarily exceed k before pop; even/odd validation stops on its actual failing line',()=>{
 const r=run(2583);assert.ok(r.steps.some(s=>s.treeReplayView.locals.heap?.length===3));assert.equal(run(2583,'1',{k:2}).answer,-1);for(const input of ['2','5,4,2,3,3,7','1,4,10']){const bad=run(1609,input);assert.equal(bad.answer,false);assert.ok(last(bad).checks.parity||last(bad).checks.order);assert.equal(last(bad).source.text,'return False');}
});
test('validation enforces connected bounded trees, special/perfect trees, uniqueness and k',()=>{
 for(const id of ids)for(const input of [[1,null,null,2],[null,1],Array(32).fill(1),[NaN],[2147483648]])assert.throws(()=>run(id,input));
 for(const id of [513,671,2415,2471])assert.throws(()=>run(id,[]),/non-empty/);
 assert.throws(()=>run(671,[3,2,4]),/parent/);assert.throws(()=>run(671,[2,2]),/two children/);assert.throws(()=>run(671,[0]),/integers from/);
 for(const id of [116,2415])assert.throws(()=>run(id,[1,2]),/perfect/);assert.throws(()=>run(2471,[1,1,2]),/distinct/);assert.throws(()=>run(2583,[1],{k:0}),/k must/);
 assert.equal(p[117].liveArgs('1,2,3')[0].__viz_type,'binary_tree_next');assert.equal(p[671].liveArgs('2,2,5')[0].__viz_type,'binary_tree');
});
function renderer(lang,extra={}){const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang,document:{getElementById:()=>host},...extra};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-tree-replay-pictures.js'),'utf8'),ctx);return {ctx,render:s=>{ctx.renderTreeReplayPictures(s);return host.innerHTML;}};}
test('all native frames render pictorial tree/queue/stack panels in VI and EN, with deterministic backwards replay',()=>{
 for(const id of ids)for(const method of methods(id)){const r=run(id,undefined,{approach:method}),saved=JSON.stringify(r.steps[0]);for(const lang of ['vi','en']){const ui=renderer(lang),first=ui.render(r.steps[0]);for(const s of r.steps){const html=ui.render(s);assert.doesNotMatch(html,/undefined|NaN|Infinity/);assert.ok(html.includes(`data-problem-id="${id}"`));assert.ok(html.includes(`data-source-line="${s.codeLines[0]}"`));for(const n of s.treeReplayView.nodes)assert.ok(html.includes(`data-tr-node="${n.id}" data-node-value="${n.value}"`));}assert.equal(ui.render(r.steps[0]),first);}assert.equal(JSON.stringify(r.steps[0]),saved);}
});
test('keyboard source navigation stops playback and selects an actual update or return',()=>{
 for(const id of ids){const r=run(id);for(const kind of ['step','update','result']){const ui=renderer('vi',{steps:r.steps,stepIndex:0,renderStep(){},stopPlay(){}});ui.ctx.trJump(kind);assert.ok(ui.ctx.stepIndex>0);if(kind==='result')assert.equal(r.steps[ui.ctx.stepIndex].final,true);}}
 for(const key of ['Enter',' ']){const events={},node={dataset:{trNode:'0:2'},addEventListener:(n,f)=>{events[n]=f;}},r=run(199),ui=renderer('en',{steps:r.steps,stepIndex:0,renderStep(){},stopPlay(){}});ui.ctx.trBind({querySelectorAll:selector=>selector==='[data-tr-node]'?[node]:[]});let prevented=0,stopped=0;events.keydown({key,preventDefault(){prevented++;},stopPropagation(){stopped++;}});assert.ok(ui.ctx.stepIndex>0);assert.equal(prevented,1);assert.equal(stopped,1);}
});
