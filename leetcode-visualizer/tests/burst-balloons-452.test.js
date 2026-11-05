'use strict';
const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[452];
const fixtures=[[[10,16],[2,8],[1,6],[7,12]],[[1,2],[3,4],[5,6],[7,8]],[[1,2],[2,3],[3,4],[4,5]],[[1,10],[2,9],[3,8],[4,7]],[[-6,-2],[-4,0],[1,3],[2,5]],[[1,2],[1,2],[0,2],[2,3]],[],[[-2147483648,-2147483647],[2147483646,2147483647]],[[-2147483648,2147483647],[0,1]],[[0,1]]];
function oracle(points){if(!points.length)return 0;const masks=[...new Set(points.flat())].map(x=>points.reduce((mask,[a,b],i)=>a<=x&&x<=b?mask|1<<i:mask,0)),dp=Array(1<<points.length).fill(Infinity);dp[0]=0;for(let mask=0;mask<dp.length;mask++)for(const cover of masks)dp[mask|cover]=Math.min(dp[mask|cover],dp[mask]+1);return dp.at(-1);}
const python=(source,payload)=>{const r=spawnSync(process.env.PYTHON||'python',['-c',source],{input:JSON.stringify(payload),encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);};
test('452 uses native line debugging, preserves caller input and prepares typed live arguments',()=>{
 assert.equal(p.debugMode,'line-by-line');assert.match(p.code.join('\n'),/points.sort\(key=lambda p: p\[1\]\)/);assert.match(p.code.join('\n'),/if start > arrow_x:/);
 assert.deepEqual(p.liveArgs('10,16;2,8;1,6;7,12'),[fixtures[0]]);assert.equal(p.builder(p.defaultInput).answer,2);assert.equal(p.builder([]).answer,0);
});
test('displayed greedy Python matches independent minimum endpoint-cover DP on 160 random sets, touching endpoints and int32 boundaries',()=>{
 const cases=[...fixtures];let seed=452;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};for(let i=0;i<160;i++)cases.push(Array.from({length:1+rand(8)},()=>{const start=rand(21)-10;return[start,start+1+rand(10)];}));
 const answers=python(`import json,sys
p=json.load(sys.stdin)
scope={}
exec(p['code'],scope)
print(json.dumps([scope['Solution']().findMinArrowShots([row[:] for row in points]) for points in p['cases']]))`,{code:p.code.join('\n'),cases});assert.deepEqual(answers,cases.map(oracle));
 for(const points of cases){const before=JSON.stringify(points),run=p.builder(points);assert.equal(run.answer,oracle(points));assert.equal(JSON.stringify(points),before);}
});
test('every source line, watched value, stable sort and duplicate balloon identity matches native Python',()=>{
 const items=fixtures.map(points=>({code:p.code.join('\n'),method:'findMinArrowShots',args:[points]}));
 const native=python(`import json,sys,runpy
p=json.load(sys.stdin)
trace=runpy.run_path(p['path'])['picture_trace']
print(json.dumps([json.loads(trace(item)) for item in p['items']]))`,{path:require.resolve('../problems/picture-trace.py'),items});
 native.forEach((n,i)=>{const run=p.builder(fixtures[i]);assert.equal(run.steps.length,n.events.length);n.events.forEach((event,j)=>{const s=run.steps[j],v=s.balloon452View;assert.deepEqual(s.codeLines,[event.line]);assert.equal(v.source,p.code[event.line-1].trim());s.vars.forEach(w=>assert.deepEqual(w.value,event.locals[w.name]??'—'));assert.deepEqual(v.order.map(id=>v.original[id]),event.locals.points);assert.equal(new Set(v.order).size,fixtures[i].length);if(v.sorted){const expected=fixtures[i].map((point,id)=>({point,id})).sort((a,b)=>a.point[1]-b.point[1]).map(x=>x.id);assert.deepEqual(v.order,expected);}});});
});
test('arrow positions appear only after their actual assignment and comparisons retain the previous x',()=>{
 let pending=0,reused=0,equal=0;
 for(const points of fixtures){const run=p.builder(points);let count=0;
  for(const [index,s]of run.steps.entries()){const v=s.balloon452View;if(v.shots.length!==count){assert.equal(v.source,'arrow_x = end');assert.equal(v.shots.length,count+1);assert.equal(v.shots.at(-1).step,index);assert.equal(v.shots.at(-1).x,v.arrowX);count=v.shots.length;}
   if(v.pending){assert.equal(v.source,'arrows += 1');assert.equal(v.count,v.shots.length+1);pending++;}
   if(v.comparison){const c=v.comparison;assert.equal(c.newShot,c.x==='−∞'||c.start>c.x);if(v.event==='reuse'){assert.ok(c.start<=c.x&&c.x<=c.end);reused++;if(c.start===c.x)equal++;}if(v.event==='shoot'){assert.equal(v.shots.at(-1).x,c.end);assert.ok(c.x==='−∞'||v.arrowX>c.x);}}
   for(const[id,group]of v.assigned){const[a,b]=v.original[id],x=v.shots[group].x;assert.ok(a<=x&&x<=b);}
  }
  const v=run.steps.at(-1).balloon452View;assert.equal(v.shots.length,run.answer);assert.equal(v.assigned.length,points.length);
  for(let i=1;i<v.shots.length;i++){const previous=points[v.shots[i-1].trigger],next=points[v.shots[i].trigger];assert.ok(previous[1]<next[0]);}
 }assert.ok(pending&&reused&&equal);
});
test('24 disjoint or nested balloons retain every interval and the complete optimality witness',()=>{
 for(const points of[Array.from({length:24},(_,i)=>[i*3,i*3+1]),Array.from({length:24},(_,i)=>[i,100-i])]){const run=p.builder(points),v=run.steps.at(-1).balloon452View;assert.equal(v.order.length,24);assert.equal(v.assigned.length,24);assert.equal(run.answer,points[0][1]===1?24:1);assert.equal(v.shots.length,run.answer);}
});
test('both languages render exact balloon rows, assigned arrows, groups and witnesses and preserve rewind snapshots',()=>{
 const host={innerHTML:''},context={lang:'vi',$:()=>host,escapeHtml:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-burst-balloons-452.js'),'utf8'),context);
 for(const lang of['vi','en'])for(const points of fixtures){context.lang=lang;const run=p.builder(points),before=JSON.stringify(run);context.steps=run.steps;for(const[index,s]of run.steps.entries()){context.stepIndex=index;const v=s.balloon452View;context.renderBalloon452View(s);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);assert.equal((host.innerHTML.match(/data-ba-balloon=/g)||[]).length,points.length);assert.equal((host.innerHTML.match(/data-ba-arrow=/g)||[]).length,v.shots.length);assert.equal((host.innerHTML.match(/data-ba-order=/g)||[]).length,points.length);assert.equal((host.innerHTML.match(/data-ba-witness=/g)||[]).length,v.final?v.shots.length:0);if(v.final)assert.match(host.innerHTML,new RegExp(`data-ba-answer="${run.answer}"`));}
  context.stepIndex=0;context.renderBalloon452View(run.steps[0]);const first=host.innerHTML;context.stepIndex=run.steps.length-1;context.renderBalloon452View(run.steps.at(-1));context.stepIndex=0;context.renderBalloon452View(run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run),before);
 }
});
test('parser rejects malformed/reversed/equal intervals, overflow and oversized demos',()=>{
 for(const points of[null,{},'bad',[[1]],[[1,2,3]],[[2,1]],[[2,2]],[[1.5,2]],[[-2147483649,0]],[[0,2147483648]],Array.from({length:25},(_,i)=>[i,i+1]),'1,;2,3'])assert.throws(()=>p.builder(points));
});
