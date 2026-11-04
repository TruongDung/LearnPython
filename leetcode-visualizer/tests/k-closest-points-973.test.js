'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[973],methods=require('../problems/k-closest-points-973-methods');
const d2=point=>point[0]**2+point[1]**2;
const fixtures=[[[[1,3],[-2,2],[5,8],[0,1]],2],[[[0,0]],1],[[[1,0],[0,1],[-1,0],[0,-1],[0,0]],3],[[[0,0],[0,0],[2,-2],[10000,-10000]],2],[[[-10000,10000],[10000,10000],[-1,-1],[1,0]],4]];
const build=(method,points,k)=>p[method===1?'builder':`builder${method}`](points,{k});
function valid(points,k,answer){assert.equal(answer.length,k);const remaining=points.map(p=>JSON.stringify(p));for(const point of answer){const index=remaining.indexOf(JSON.stringify(point));assert.ok(index>=0);remaining.splice(index,1);}assert.deepEqual(answer.map(d2).sort((a,b)=>a-b),points.map(d2).sort((a,b)=>a-b).slice(0,k));}
test('973 provides seven typed, line-by-line methods and rejects invalid point/k inputs consistently',()=>{
 assert.equal(p.debugMode,'line-by-line');assert.deepEqual(p.extraParams.find(x=>x.key==='approach').options.map(x=>x.value),[1,2,3,4,5,6,7]);assert.deepEqual(p.liveArgs('1,3;-2,2',{k:1}),[[[1,3],[-2,2]],1]);assert.deepEqual(p.liveArgs('[[0,0]]',{k:1}),[[[0,0]],1]);
 for(const[input,k]of [[[],1],[[[1]],1],[[[1.5,2]],1],[[[10001,0]],1],[[[0,0]],0],[[[0,0]],2],['0,;1,2',1],['bad',1],[Array(19).fill([1,1]),1]])for(let method=1;method<=7;method++)assert.throws(()=>build(method,input,k),/973/);
});
test('all seven Python algorithms return exactly the nearest k occurrences, including ties, duplicates and extreme coordinates',()=>{
 const cases=[...fixtures];let seed=973;
 for(let sample=0;sample<150;sample++){const n=1+sample%18,points=Array.from({length:n},()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed%15-7;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return[x,seed%15-7];});cases.push([points,1+seed%n]);}
 const source=`import json,sys
payload=json.load(sys.stdin)
out=[]
for code in payload['codes']:
    scope={}
    exec(code,scope)
    out.append([scope['Solution']().kClosest([list(p) for p in points],k) for points,k in payload['cases']])
print(json.dumps(out))`;
 const proc=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify({codes:methods.map(m=>m.code.join('\n')),cases}),encoding:'utf8'});assert.equal(proc.status,0,proc.stderr);JSON.parse(proc.stdout).forEach(answers=>answers.forEach((answer,i)=>valid(...cases[i],answer)));
});
test('973 builders retain exact heap keys, point IDs, selected prefixes and immutable snapshots for every method',()=>{
 for(let method=1;method<=7;method++)for(const[points,k]of fixtures){const before=JSON.stringify(points),run=build(method,points,k);valid(points,k,run.answer);assert.equal(JSON.stringify(points),before);assert.equal(run.steps.filter(s=>s.final).length,1);
 for(const step of run.steps){const v=step.closestPoints973View;assert.deepEqual(step.codeLines,[v.line]);assert.equal(step.codeBlock,method);assert.equal(v.source,methods[method-1].code[v.line-1].trim());assert.ok(v.active===null||v.active>=0&&v.active<points.length);assert.equal(new Set(v.selected).size,v.selected.length);assert.deepEqual(v.answer??[],v.selected.map(id=>points[id]));
 for(const entry of v.heap){assert.deepEqual([entry.x,entry.y],points[entry.id]);assert.equal(entry.d2,d2(points[entry.id]));assert.equal(entry.key,method===1?(-entry.d2||0):entry.d2);}
 if(v.heapReady)for(let i=1;i<v.heap.length;i++)assert.ok(v.heap[Math.floor((i-1)/2)].key<=v.heap[i].key);
 if(v.ring)assert.ok(v.ring.d2>=0);
 }assert.equal(run.steps.at(-1).closestPoints973View.selected.length,k);}
});
test('native Python confirms every recorded source line, helper scope and watch value',()=>{
 const source=`import json,sys,runpy
payload=json.load(sys.stdin)
trace=runpy.run_path(payload['path'])['picture_trace']
out=[]
for code in payload['codes']:
    out.append(json.loads(trace({'code':code,'method':'kClosest','args':[[[1,3],[-2,2],[5,8],[0,1]],2]}))['events'])
print(json.dumps(out))`;
 const proc=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),codes:methods.map(m=>m.code.join('\n'))}),encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(proc.status,0,proc.stderr);
 JSON.parse(proc.stdout).forEach((events,i)=>{const run=build(i+1,...fixtures[0]);assert.equal(run.steps.length,events.length);run.steps.forEach((step,j)=>{const e=events[j],context={...e.outer,...e.locals};assert.equal(step.codeLines[0],e.line);assert.equal(step.closestPoints973View.scope,e.scope);for(const watch of step.vars)assert.deepEqual(watch.value,context[watch.name]??'—');});});
});
test('973 diagrams use equal coordinate scales, actual squared radii and correct heap/selection IDs in both languages',()=>{
 const host={innerHTML:'',clientWidth:600},ctx={lang:'vi',$:()=>host,escapeHtml:String};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-k-closest-points-973.js'),'utf8'),ctx);
 for(const language of['vi','en']){ctx.lang=language;for(let method=1;method<=7;method++){const run=build(method,...fixtures[0]),before=JSON.stringify(run);for(const step of run.steps){ctx.renderClosestPoints973View(step);const html=host.innerHTML,v=step.closestPoints973View;assert.doesNotMatch(html,/undefined|NaN|Infinity|<p>/);assert.ok(html.includes(`data-method="${method}"`));assert.deepEqual([...html.matchAll(/data-answer-id="(\d+)"/g)].map(m=>Number(m[1])),v.selected);assert.equal((html.match(/data-point-id=/g)||[]).length,v.points.length);
 const scale=Number(html.match(/data-unit-scale="([^\"]+)"/)[1]);for(const match of html.matchAll(/data-point-id="(\d+)"[^>]*cx="([^\"]+)" cy="([^\"]+)"/g)){const point=v.points[Number(match[1])];assert.ok(Math.abs(Number(match[2])-200-point[0]*scale)<1e-8);assert.ok(Math.abs(Number(match[3])-200+point[1]*scale)<1e-8);}
 if(v.ring){const radius=Number(html.match(/data-radius-pixels="([^\"]+)"/)[1]);assert.ok(Math.abs(radius-Math.sqrt(v.ring.d2)*scale)<1e-8);}
 assert.equal((html.match(/data-heap-index=/g)||[]).length,(method===1||method===3)?v.heap.length:0);
 }ctx.renderClosestPoints973View(run.steps[0]);const first=host.innerHTML;ctx.renderClosestPoints973View(run.steps.at(-1));ctx.renderClosestPoints973View(run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run),before);}}
});
