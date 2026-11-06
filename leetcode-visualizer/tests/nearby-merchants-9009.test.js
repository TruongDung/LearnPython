'use strict';
const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[9009],build=(points,params={},method=1)=>p[method===1?'builder':'builder2'](points,{...params,approach:method});
const fixtures=[{points:[['Cafe',0,3],['Market',3,4],['Pharmacy',6,0],['Bakery',-4,3]],user:[0,0],radius:5},{points:[['Center',0,0],['Boundary',3,4],['Outside',0,5.000000000001]],user:[0,0],radius:5},{points:[['A',0,0],['Twin',0,0],['Near',0,1]],user:[0,0],radius:0},{points:[['Near',1,1],['Edge',3,4],['Far',18,18],['West',-12,4]],user:[0,0],radius:5},{points:[['A',2,1],['B',5,1],['C',2,4],['D',-2,1]],user:[2,1],radius:3},{points:[],user:[0,0],radius:5},{points:[['Same',1,0],['Same',1,0]],user:[0,0],radius:1},{points:[['Corner',-1.5,-2]],user:[0,0],radius:2.5}];
const params=c=>({x:c.user[0],y:c.user[1],radius:c.radius});
const oracle=c=>c.points.map(([name,x,y],id)=>({name,id,d:(x-c.user[0])**2+(y-c.user[1])**2})).filter(p=>p.d<=c.radius**2).sort((a,b)=>a.d-b.d||(a.name<b.name?-1:a.name>b.name?1:0)||a.id-b.id).map(p=>p.name);
const python=(source,payload)=>{const r=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify(payload),encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);};
function equivalent(actual,expected){if(typeof actual==='number'&&typeof expected==='number'){assert.ok(Math.abs(actual-expected)<=Math.max(1,Math.abs(expected))*1e-13,`${actual} vs ${expected}`);return;}if(Array.isArray(expected)){assert.equal(actual.length,expected.length);expected.forEach((v,i)=>equivalent(actual[i],v));return;}if(expected&&typeof expected==='object'){assert.deepEqual(Object.keys(actual),Object.keys(expected));for(const key of Object.keys(expected))equivalent(actual[key],expected[key]);return;}assert.deepEqual(actual,expected);}
test('9009 has self-contained native Python, both methods, correct default ordering and live arguments',()=>{
 assert.equal(p.debugMode,'line-by-line');assert.equal(p.extraParams.find(x=>x.key==='approach').options.length,2);assert.match(p.code.join('\n'),/from math import hypot/);assert.doesNotMatch(p.code.join('\n'),/euclidean\(/);
 assert.deepEqual(p.liveArgs(p.defaultInput,{x:0,y:0,radius:5}),[fixtures[0].points,[0,0],5]);for(const m of[1,2])assert.deepEqual(build(p.defaultInput,{},m).answer,['Cafe','Bakery','Market']);
});
test('both displayed algorithms match independent squared-distance filtering and ordering on 120 random point clouds',()=>{
 const cases=[...fixtures];let seed=9009;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};for(let i=0;i<120;i++)cases.push({points:Array.from({length:rand(20)},(_,id)=>['M'+id,rand(81)-40,rand(81)-40]),user:[rand(41)-20,rand(41)-20],radius:rand(31)});
 const answers=python(`import json,sys
p=json.load(sys.stdin)
out=[]
for code in p['codes']:
    scope={}
    exec(code,scope)
    out.append([scope['Solution']().nearbyMerchants(c['points'],c['user'],c['radius']) for c in p['cases']])
print(json.dumps(out))`,{codes:[p.code.join('\n'),p.code2.join('\n')],cases});answers.forEach(result=>assert.deepEqual(result,cases.map(oracle)));
 for(const c of cases.slice(0,50))for(const m of[1,2]){const before=JSON.stringify(c);assert.deepEqual(build(c.points,params(c),m).answer,oracle(c));assert.equal(JSON.stringify(c),before);}
});
test('every native source line, watched local, actual answer tuple, grid bucket and branch matches CPython',()=>{
 const items=fixtures.flatMap(c=>[1,2].map(m=>({m,code:(m===1?p.code:p.code2).join('\n'),method:'nearbyMerchants',args:[c.points,c.user,c.radius]})));
 const native=python(`import json,sys,runpy
p=json.load(sys.stdin)
trace=runpy.run_path(p['path'])['picture_trace']
print(json.dumps([json.loads(trace(item)) for item in p['items']]))`,{path:require.resolve('../problems/picture-trace.py'),items});
 native.forEach((n,i)=>{const item=items[i],run=build(item.args[0],{x:item.args[1][0],y:item.args[1][1],radius:item.args[2]},item.m);assert.deepEqual(run.answer,n.answer);assert.equal(run.steps.length,n.events.length);n.events.forEach((r,j)=>{const s=run.steps[j],v=s.merchant9009View;assert.deepEqual(s.codeLines,[r.line]);assert.equal(s.codeBlock,item.m);s.vars.forEach(w=>equivalent(w.value,r.locals[w.name]??'—'));equivalent(v.answerRows,r.locals.answer??null);assert.deepEqual(v.buckets,(r.locals.buckets?.__pairs__??[]).map(([cell,ids])=>({cell,ids})));if(v.event==='check'){assert.equal(v.checked,r.branch);assert.equal(v.active,r.locals.index);equivalent(v.distance,r.locals.distance);}if(v.dx!==null)equivalent(v.dx,r.locals.dx);if(v.dy!==null)equivalent(v.dy,r.locals.dy);});});
});
test('boundary points are included exactly, radius zero preserves coincident identities, and results are not populated before append',()=>{
 for(const c of fixtures)for(const m of[1,2]){const run=build(c.points,params(c),m);let old=Array(c.points.length).fill(null),oldAnswer=[];
  for(const s of run.steps){const v=s.merchant9009View;if(JSON.stringify(v.statuses)!==JSON.stringify(old))assert.equal(v.event,'check');const rows=v.answerRows??[];if(rows.length>oldAnswer.length){assert.equal(v.event,'keep');assert.equal(rows.length,oldAnswer.length+1);}for(const check of v.checks){assert.equal(check.inside,check.distance<=c.radius);assert.equal(run.steps[check.step].merchant9009View.event,'check');}assert.equal(new Set(v.checks.map(c=>c.merchant)).size,v.checks.length);old=v.statuses;oldAnswer=rows;}
  assert.deepEqual(run.answer,oracle(c));
 }
 assert.deepEqual(build(fixtures[1].points,params(fixtures[1]),1).answer,['Center','Boundary']);assert.deepEqual(build(fixtures[2].points,params(fixtures[2]),2).answer,['A','Twin']);
});
test('grid buckets use mathematical floor for negatives and prune only outside candidates, without changing results',()=>{
 let pruned=0;for(const c of fixtures){const run=build(c.points,params(c),2),v=run.steps.at(-1).merchant9009View;assert.deepEqual(v.cellSize,Math.max(c.radius,1));assert.ok(v.queried.length<=9);for(const b of v.buckets)for(const id of b.ids){assert.deepEqual(b.cell,[Math.floor(c.points[id][1]/v.cellSize),Math.floor(c.points[id][2]/v.cellSize)]);}const checked=new Set(v.checks.map(c=>c.merchant));for(const[id,p]of c.points.entries())if(!checked.has(id)){assert.ok((p[1]-c.user[0])**2+(p[2]-c.user[1])**2>c.radius**2);pruned++;}}
 assert.ok(pruned>0);const v=build(fixtures[3].points,params(fixtures[3]),2).steps.at(-1).merchant9009View;assert.equal(v.checks.length,2);assert.deepEqual(v.answer,['Near','Edge']);
});
test('24 points, nonzero/negative centers, radius 10000 and long escaped names preserve complete output',()=>{
 const points=Array.from({length:24},(_,i)=>['Store'+i,10000-i,-10000+i]);for(const m of[1,2]){const c={points,user:[10000,-10000],radius:10000},run=build(points,params(c),m);assert.deepEqual(run.answer,oracle(c));assert.equal(run.steps.at(-1).merchant9009View.points.length,24);}
 assert.deepEqual(build([['<shop> "&',0,0]],{radius:0},2).answer,['<shop> "&']);
});
test('both languages render exact points, actual result entries and a true circular radius, preserving rewind state',()=>{
 const host={innerHTML:''},context={lang:'vi',$:()=>host,escapeHtml:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-nearby-merchants-9009.js'),'utf8'),context);
 for(const lang of['vi','en'])for(const c of fixtures)for(const m of[1,2]){context.lang=lang;const run=build(c.points,params(c),m),before=JSON.stringify(run);context.steps=run.steps;for(const[index,s]of run.steps.entries()){context.stepIndex=index;context.renderNearby9009View(s);const v=s.merchant9009View;assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);assert.equal((host.innerHTML.match(/data-mc-point=/g)||[]).length,c.points.length);assert.equal((host.innerHTML.match(/data-mc-merchant=/g)||[]).length,c.points.length);assert.equal((host.innerHTML.match(/data-mc-answer=/g)||[]).length,v.answerRows?.length??0);assert.match(host.innerHTML,new RegExp(`data-mc-radius="${v.radius}"`));if(v.final)assert.match(host.innerHTML,/data-mc-final="true"/);}
  context.stepIndex=0;context.renderNearby9009View(run.steps[0]);const first=host.innerHTML;context.stepIndex=run.steps.length-1;context.renderNearby9009View(run.steps.at(-1));context.stepIndex=0;context.renderNearby9009View(run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run),before);
 }
});
test('validation rejects malformed merchant coordinates, nonfinite/blank inputs and invalid radius',()=>{
 for(const input of[null,{},'NoPoint','A:1,','A:1,2,3',[['',0,0]],[['A','1',2]],[['A',Infinity,0]],[['A',10001,0]],Array.from({length:25},(_,i)=>['M',i,0])])assert.throws(()=>build(input));
 for(const params of[{x:''},{y:true},{radius:-1},{radius:Infinity},{radius:10001},{x:10001}])assert.throws(()=>build('A:0,0',params));assert.deepEqual(build('[]').answer,[]);
});
