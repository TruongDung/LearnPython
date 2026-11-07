"use strict";
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../problems').SUPPORTED[103],cases=[[1,2,3,4,5,6,7],[3,9,20,null,null,15,7],[1,null,2,3],[0,0,0],[0],[],[-8,-3,-10,null,null,-5,-1]];
const run=(a,m=1)=>p.builder(a,{approach:String(m)}),last=r=>r.steps.at(-1).zigzag103View;
function oracle(nodes){const byId=new Map(nodes.map(n=>[n.id,n])),rows=[];const visit=(id,d)=>{if(id===null)return;const n=byId.get(id);(rows[d]??=[]).push(id);visit(n.left,d+1);visit(n.right,d+1);};if(nodes.length)visit(nodes[0].id,0);return rows.map((row,i)=>i%2?[...row].reverse():row);}
test('103 both approaches alternate output rows while preserving BFS child order and node identities',()=>{
 const inputs=[...cases];let seed=103;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};for(let i=0;i<40;i++)inputs.push(Array.from({length:random(32)},()=>random(11)-5));
 for(const method of [1,2])for(const input of inputs){const saved=[...input],r=run(input,method),v=last(r),byId=new Map(v.nodes.map(n=>[n.id,n])),ids=oracle(v.nodes),values=ids.map(row=>row.map(id=>byId.get(id).value));assert.equal(r.answer,JSON.stringify(values));assert.deepEqual(v.answer,values);assert.deepEqual(v.resultIds,ids);assert.deepEqual(input,saved);assert.equal(r.steps.filter(s=>s.final).length,1);assert.equal(v.trace.truncated,false);}
 for(const m of [1,2]){assert.equal(run(cases[0],m).answer,'[[1],[3,2],[4,5,6,7]]');assert.deepEqual(last(run([0,0,0],m)).resultIds,[["0:0"],["0:2","0:1"]]);}
});
test('103 each approach matches CPython source, code block, locals, frames, conditions and return',()=>{
 const source="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f({'code':p['code'],'method':'zigzagLevelOrder','args':[a],'treeArgs':[0]})) for a in p['inputs']]))";
 for(const m of [1,2]){const code=m===1?p.code:p.code2,ref=spawnSync(process.env.PYTHON||'python3',['-c',source],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),code:code.join('\n'),inputs:cases}),encoding:'utf8',maxBuffer:16e6});assert.equal(ref.status,0,ref.stderr);JSON.parse(ref.stdout).forEach((native,i)=>{const r=run(cases[i],m);assert.equal(r.answer,JSON.stringify(native.answer));assert.equal(r.steps.length,native.events.length);native.events.forEach((e,j)=>{const s=r.steps[j],v=s.zigzag103View;assert.equal(s.codeBlock,m);assert.deepEqual(s.codeLines,[e.line]);assert.equal(v.source.text,code[e.line-1].trim());for(const k of ['locals','outer','frames','scope','branch','returned','returning'])assert.deepEqual(v[k],e[k]);assert.deepEqual(v.queue,e.locals.queue?.map(n=>n.id)??null);for(const w of s.vars)assert.deepEqual(w.rawValue,e.locals[w.name]??null);});});}
});
test('103 recording uses the old flag/parity; flipping does not change the just-recorded row or raw buffer',()=>{
 let divergent=false;for(const m of [1,2])for(const input of cases){const r=run(input,m);let previous=null;for(const s of r.steps){const v=s.zigzag103View,raw=m===1?v.locals.vals:v.locals.lst,result=m===1?v.locals.res:v.locals.result;assert.deepEqual(v.buffer,raw??null);assert.deepEqual(v.result,result??null);assert.equal(v.flag,m===1?v.locals.ltr??null:v.locals.level===undefined?null:v.locals.level%2===0);
 if(v.change?.kind==='record'){const dir=m===1?v.locals.ltr:v.locals.level%2===0;assert.deepEqual(result.at(-1),dir?[...raw]:[...raw].reverse());assert.equal(v.lastRecord.direction,dir);assert.equal(v.directions.at(-1),dir);assert.deepEqual(v.lastRecord.sourceIds,v.bufferIds);assert.deepEqual(v.lastRecord.ids,dir?[...v.bufferIds]:[...v.bufferIds].reverse());}
 if(v.change?.kind==='flip'){assert.deepEqual(v.result,previous.result);assert.deepEqual(v.buffer,previous.buffer);assert.deepEqual(v.lastRecord,previous.lastRecord);assert.equal(v.flag,!previous.flag);if(v.lastRecord){assert.notEqual(v.flag,v.lastRecord.direction);divergent=true;}}
 if(v.bufferIds!==null){const byId=new Map(v.nodes.map(n=>[n.id,n]));assert.deepEqual(v.bufferIds.map(id=>byId.get(id).value),v.buffer);}
 if(v.result!==null){const byId=new Map(v.nodes.map(n=>[n.id,n]));assert.deepEqual(v.resultIds.map(row=>row.map(id=>byId.get(id).value)),v.result);}
 assert.ok(!Object.hasOwn(v.locals,'rowDirection')&&!Object.hasOwn(v.locals,'flag'));previous=v;
 }}assert.ok(divergent);
});
test('103 list queue remains fixed, deque pops stay in the locked frontier, and None is never enqueued',()=>{
 let mixed=false;for(const m of [1,2])for(const input of cases){let previous=null;for(const s of run(input,m).steps){const v=s.zigzag103View,l=v.source.line;
 if(m===1&&previous&&![5,16].includes(l))assert.deepEqual(v.queue,previous.queue);
 if(m===2&&l===15){assert.equal(v.current,previous.queue[0]);assert.deepEqual(v.queue,previous.queue.slice(1));assert.ok(v.roundIds.includes(v.current));}
 if(m===2&&v.limit!==null){assert.equal(v.limit,v.locals.size);assert.equal(v.queueRoles.filter(role=>role==='current').length,v.limit-v.popped.length);}
 if(m===2&&v.queueRoles?.includes('current')&&v.queueRoles.includes('next'))mixed=true;
 if(v.probe?.appended){const before=m===1?previous.nxt:previous.queue,after=m===1?v.nxt:v.queue;assert.deepEqual(after,[...before,v.probe.child]);}
 if(v.probe&&!v.probe.exists){assert.equal(v.branch,false);assert.equal(v.probe.appended,false);}
 previous=v;
 }}assert.ok(mixed);
});
test('103 complete replay handles empty, sparse, zero, deep and wide inputs with immutable history',()=>{
 for(const m of [1,2]){for(const input of [null,{},[null,1],[1,null,null,2],[NaN],[1001],[-1001],Array(32).fill(0)])assert.throws(()=>run(input,m),RangeError);for(const input of ['',[],[null]])assert.equal(run(input,m).answer,'[]');
 const deep=[0];for(let i=1;i<31;i++)deep.push(null,i);for(const input of [deep,Array.from({length:31},(_,i)=>i)]){const r=run(input,m),saved=JSON.stringify(r.steps[0]),v=last(r);assert.equal(v.recorded.length,31);assert.equal(v.trace.truncated,false);assert.equal(v.trace.captured,r.steps.length);assert.equal(JSON.stringify(r.steps[0]),saved);}}
 assert.deepEqual(p.liveArgs('1,null,2,3'),[{__viz_type:'binary_tree',values:[1,null,2,3],tree_id:'root'}]);assert.equal(p.extraParams[0].key,'approach');
});
function renderer(language,extra={}){const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang:language,document:{getElementById:()=>host},...extra};vm.createContext(ctx);for(const file of ['renderer-level-order-bottom-107.js','renderer-zigzag-103.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);return {ctx,render:s=>{ctx.renderZigzag103Pictures(s);return host.innerHTML;}};}
test('103 both pictures display actual flags, raw lists, zigzag rows and separate row direction in VI/EN',()=>{
 for(const m of [1,2])for(const lang of ['vi','en'])for(const input of cases){const r=run(input,m),ui=renderer(lang),first=ui.render(r.steps[0]);for(const s of r.steps){const v=s.zigzag103View,html=ui.render(s);assert.doesNotMatch(html,/NaN|undefined|Infinity/);assert.match(html,/LEETCODE 103 · ZIGZAG BFS/);assert.ok(html.includes(`data-method="${m}"`));assert.ok(html.includes(`data-flag-direction="${v.flag}"`));assert.ok(html.includes(`data-buffer-direction="${v.rowDirection}"`));
 assert.deepEqual([...html.matchAll(/data-raw-index="(\d+)" data-raw-value="(-?\d+)"/g)].map(x=>[+x[1],+x[2]]),(v.buffer??[]).map((n,i)=>[i,n]));assert.deepEqual([...html.matchAll(/data-result-index="(\d+)" data-result-value="(-?\d+)"/g)].map(x=>[+x[1],+x[2]]),(v.answer??v.result??[]).flatMap((row,i)=>row.map(n=>[i,n])));
 if(v.lastRecord)assert.ok(html.includes(`data-last-index="${v.lastRecord.index}" data-last-direction="${v.lastRecord.direction}"`));
 }assert.equal(ui.render(r.steps[0]),first);}
});
test('103 navigation replays the selected approach’s actual flag and record source lines',()=>{
 for(const m of [1,2]){const r=run(cases[0],m);for(const kind of ['level','record','flip','result']){const ui=renderer('vi',{steps:r.steps,stepIndex:0,renderStep(){},stopPlay(){}});ui.ctx.z103Jump(kind);const v=r.steps[ui.ctx.stepIndex].zigzag103View;assert.ok(kind==='level'?v.source.line===(m===1?6:11):kind==='record'?v.change?.kind==='record':kind==='flip'?v.change?.kind==='flip':v.answer!==null);}
 for(const key of ['Enter',' ']){const events={},node={dataset:{z103Node:'0:6'},addEventListener:(n,f)=>{events[n]=f;}},ui=renderer('en',{steps:r.steps,stepIndex:0,renderStep(){}});let a=0,b=0;ui.ctx.z103Bind({querySelectorAll:s=>s==='[data-z103-node]'?[node]:[]});events.keydown({key,preventDefault:()=>a++,stopPropagation:()=>b++});const v=r.steps[ui.ctx.stepIndex].zigzag103View;assert.equal(v.current,'0:6');assert.equal(v.source.line,m===1?11:15);assert.equal(a,1);assert.equal(b,1);}}
});
