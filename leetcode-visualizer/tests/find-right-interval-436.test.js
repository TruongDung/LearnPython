'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[436],methods=require('../problems/find-right-interval-436-methods');
const fixtures=[[[3,4],[2,3],[1,2]],[[1,2]],[[0,0]],[[2,2],[-2,0],[0,2]],[[1,4],[2,3],[3,4]],[[-1000000,-999999],[0,1000000],[1000000,1000000]],[[-3,8],[-2,8],[2,8],[9,10]]];
const oracle=intervals=>intervals.map(([,end])=>{const valid=intervals.map(([start],i)=>({start,i})).filter(x=>x.start>=end).sort((a,b)=>a.start-b.start);return valid[0]?.i??-1;});
const build=(method,input)=>p[method===1?'builder':`builder${method}`](input);
test('436 registers seven selectable line-by-line methods, validates unique starts and accepts zero-length intervals',()=>{
 assert.equal(p.debugMode,'line-by-line');assert.deepEqual(p.extraParams[0].options.map(x=>x.value),[1,2,3,4,5,6,7]);assert.deepEqual(p.liveArgs('3,4;2,3;1,2'),[fixtures[0]]);assert.deepEqual(p.liveArgs('[[0,0]]'),[[[0,0]]]);
 for(const input of[[],[[1,0]],[[1,2],[1,3]],[[0,1000001]],[[1.2,3]],Array.from({length:19},(_,i)=>[i,i+1]),'1,;2,3','bad'])for(let method=1;method<=7;method++)assert.throws(()=>build(method,input),/436/);
});
test('all seven displayed algorithms agree with an independent minimum-start oracle on shuffled, negative and boundary cases',()=>{
 const cases=[...fixtures];let seed=436;
 for(let sample=0;sample<180;sample++){const n=1+sample%18,starts=new Set();while(starts.size<n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;starts.add(seed%101-50);}const rows=[...starts].map(start=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return[start,start+seed%30];});cases.push(rows);}
 const source=`import json,sys
payload=json.load(sys.stdin)
out=[]
for code in payload['codes']:
    scope={}
    exec(code,scope)
    out.append([scope['Solution']().findRightInterval([list(row) for row in intervals]) for intervals in payload['cases']])
print(json.dumps(out))`;
 const proc=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify({codes:methods.map(m=>m.code.join('\n')),cases}),encoding:'utf8'});assert.equal(proc.status,0,proc.stderr);const expected=cases.map(oracle);JSON.parse(proc.stdout).forEach((answers,i)=>assert.deepEqual(answers,expected,`method ${i+1}`));
});
test('436 exposes pending versus confirmed -1, preserves original IDs and handles self links in every method',()=>{
 for(let method=1;method<=7;method++)for(const intervals of fixtures){const before=JSON.stringify(intervals),run=build(method,intervals);assert.deepEqual(run.answer,oracle(intervals));assert.equal(run.steps.filter(s=>s.final).length,1);assert.equal(JSON.stringify(intervals),before);
 for(const step of run.steps){const v=step.rightInterval436View;assert.deepEqual(step.codeLines,[v.line]);assert.equal(step.codeBlock,method);assert.equal(v.source,methods[method-1].code[v.line-1].trim());for(let i=0;i<intervals.length;i++){assert.equal(v.known[i]===null,!v.finished.includes(i));if(v.known[i]!==null){assert.equal(v.known[i],oracle(intervals)[i]);assert.equal(v.known[i],v.answer[i]);}}
 for(const id of[v.active,v.probe,v.candidate])assert.ok(id===null||Number.isInteger(id)&&id>=0&&id<intervals.length);
 if(method===4)for(const heap of[v.starts,v.ends])for(let i=1;i<heap.length;i++)assert.ok(heap[Math.floor((i-1)/2)][0]<=heap[i][0]);
 }assert.deepEqual(run.steps.at(-1).rightInterval436View.known,run.answer);}
 for(let method=1;method<=7;method++)assert.deepEqual(build(method,[[0,0]]).answer,[0]);
});
test('native Python confirms every source event, recursive scope and watched local for all seven approaches',()=>{
 const source=`import sys,json,runpy
payload=json.load(sys.stdin)
trace=runpy.run_path(payload['path'])['picture_trace']
out=[]
for code in payload['codes']:
    out.append(json.loads(trace({'code':code,'method':'findRightInterval','args':[[[3,4],[2,3],[1,2]]]}))['events'])
print(json.dumps(out))`;
 const proc=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),codes:methods.map(m=>m.code.join('\n'))}),encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(proc.status,0,proc.stderr);
 JSON.parse(proc.stdout).forEach((events,i)=>{const run=build(i+1,fixtures[0]);assert.equal(run.steps.length,events.length);run.steps.forEach((step,j)=>{const record=events[j],context={...record.outer,...record.locals};assert.equal(step.codeLines[0],record.line);assert.equal(step.rightInterval436View.scope,record.scope);for(const watch of step.vars)assert.deepEqual(watch.value,context[watch.name]??'—');});});
});
test('436 pictures draw only confirmed answers, exact original-index mappings, live heap/BST nodes and real suffix cells',()=>{
 const host={innerHTML:'',clientWidth:600},ctx={lang:'vi',$:()=>host,escapeHtml:String};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-find-right-interval-436.js'),'utf8'),ctx);
 for(const language of['vi','en']){ctx.lang=language;for(let method=1;method<=7;method++)for(const intervals of[fixtures[0],fixtures[2],fixtures[3]]){const run=build(method,intervals),before=JSON.stringify(run);for(const step of run.steps){const v=step.rightInterval436View;ctx.renderRightInterval436View(step);const html=host.innerHTML;assert.doesNotMatch(html,/undefined|NaN|Infinity|<p>/);assert.ok(html.includes(`data-method="${method}"`));assert.deepEqual([...html.matchAll(/data-answer-index="(\d+)" data-answer-value="(pending|-?\d+)"/g)].map(m=>m[2]==='pending'?null:Number(m[2])),v.known);
 const links=[...html.matchAll(/data-link-from="(\d+)" data-link-to="(\d+)"/g)].map(m=>[Number(m[1]),Number(m[2])]);assert.deepEqual(links,v.known.flatMap((id,i)=>id!==null&&id>=0?[[i,id]]:[]));
 if(method===4)assert.equal((html.match(/data-heap-type=/g)||[]).length,v.starts.length+v.ends.length);
 if(method===5)assert.equal((html.match(/data-bst-id=/g)||[]).length,v.built.length);
 if(method===6&&v.coords)assert.deepEqual([...html.matchAll(/data-next-index="(pending|-?\d+)"/g)].map(m=>m[1]==='pending'?null:Number(m[1])),v.coords.map((_,i)=>v.nextIndex?.[i]??null));
 }ctx.renderRightInterval436View(run.steps[0]);const first=host.innerHTML;ctx.renderRightInterval436View(run.steps.at(-1));ctx.renderRightInterval436View(run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run),before);}}
});
