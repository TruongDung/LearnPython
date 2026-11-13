'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED, CATEGORY_ORDER } = require('../problems');
const { SWEEP_STUDY_ORDER } = require('../problems/sweep-study-path');
const { prepareGenericLiveArgs } = require('../live-args');
const ids = [57,435,986,228,1109,1943,1893,2021,2381,2772,2848,3169,3355,3356,3362,1353,1751,1942,1834,1882,502,630,857,759,1229,1272,2237,391,3453,3454,587,939,963];
const defaults = [
  [[1,2],[3,10],[12,16]],1,[[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]],['0->2','4->5','7'],
  [10,55,45,25,25],[[1,4,14],[4,7,16]],true,-1,'ace',true,7,2,true,2,2,4,10,0,[0,2,3,1],
  [2,2,0,2,1,2],4,3,105,[[3,4]],[60,68],[[0,1],[6,7]],4,true,1.625,5/3,[[1,1],[2,0],[2,4],[3,3],[4,2]],4,2,
];
const renderer = fs.readFileSync(require.resolve('../public/renderer-sweep-study.js'),'utf8');
const context = vm.createContext({});
vm.runInContext(renderer,context);
function render(step,lang) { return context.sweepStudyHTML(step,lang); }
function solve(id,input) { return SUPPORTED[id].builder(JSON.stringify(input)).answer; }
function equal(actual,expected,message) {
  if(typeof expected==='number') assert.ok(Math.abs(actual-expected)<1e-7,`${message}: ${actual} != ${expected}`);
  else assert.deepEqual(actual,expected,message);
}
test('all 56 requested lessons are available in the original study order',()=>{
  assert.equal(SWEEP_STUDY_ORDER.length,56);
  assert.deepEqual(CATEGORY_ORDER['sweep-line'].order,SWEEP_STUDY_ORDER);
  for(const id of SWEEP_STUDY_ORDER) assert.ok(SUPPORTED[id]?.tags.some(t=>t.key==='sweep-line'),`${id}`);
});
for(const [index,id] of ids.entries()) test(`${id}: default answer, source-backed frames, bilingual diagrams and live inputs`,()=>{
  const p=SUPPORTED[id],result=p.builder(p.defaultInput),saved=JSON.stringify(result);
  equal(result.answer,defaults[index],`${id} default`);
  assert.equal(result.steps.filter(s=>s.final).length,1);
  assert.ok(result.steps.at(-1).final);
  equal(result.steps.at(-1).sweepStudyView.answer,result.answer,`${id} final picture`);
  assert.ok(result.steps.length>5);
  assert.deepEqual(prepareGenericLiveArgs(p,p.defaultInput,{}),p.liveArgs(p.defaultInput));
  assert.throws(()=>p.builder('{invalid'),RangeError);
  assert.throws(()=>p.builder('{}'),RangeError);
  result.steps.forEach(step=>{
    assert.ok(step.codeLines[0]>=1 && step.codeLines[0]<=p.code.length);
    assert.equal(step.sweepStudyView.source,p.code[step.codeLines[0]-1].trim());
    for(const lang of ['en','vi']) {
      const html=render(step,lang);
      assert.match(html,new RegExp(`data-problem="${id}"`));
      assert.match(html,new RegExp(`data-source-line="${step.codeLines[0]}"`));
      assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object/);
      assert.ok(/<svg|swp-cells|<table/.test(html),`${id} has a picture`);
    }
  });
  assert.equal(JSON.stringify(result),saved,'rendering is pure and snapshots are stable');
});

const edges = [
  [57,{intervals:[],newInterval:[2,3]},[[2,3]]],
  [57,{intervals:[[1,2],[4,5]],newInterval:[2,4]},[[1,5]]],
  [435,[[1,2],[2,3],[3,4]],0], [435,[[1,3],[1,3],[1,3]],2],
  [986,{firstList:[],secondList:[[1,2]]},[]], [986,{firstList:[[1,2]],secondList:[[2,3]]},[[2,2]]],
  [228,[],[]], [228,[-3,-2,0],['-3->-2','0']],
  [1109,{bookings:[[1,1,3]],n:1},[3]],
  [1943,[[1,2,3],[2,3,4]],[[1,2,3],[2,3,4]]],
  [1943,[[1,3,5],[1,2,2],[2,3,3]],[[1,2,7],[2,3,8]]],
  [1893,{ranges:[[1,2],[4,5]],left:2,right:4},false],
  [2021,[[5,0],[-2,0]],-2],
  [2381,{s:'az',shifts:[[0,0,0],[1,1,1]]},'za'],
  [2772,{nums:[1,3,1,1],k:2},false], [2772,{nums:[0,0],k:2},true],
  [2848,[[1,1],[1,1]],1], [3169,{days:7,meetings:[]},7],
  [3355,{nums:[0,1],queries:[]},false], [3355,{nums:[0,0],queries:[]},true],
  [3356,{nums:[0,0],queries:[]},0], [3356,{nums:[2],queries:[[0,0,1]]},-1],
  [3362,{nums:[1,0,1],queries:[[0,0],[0,0]]},-1], [3362,{nums:[0,0],queries:[[0,1],[1,1]]},2],
  [1353,[[1,1],[1,1],[100,100]],2],
  [1751,{events:[[1,2,4],[2,3,8]],k:2},8],
  [1942,{times:[[1,2],[2,3]],targetFriend:1},0],
  [1834,[[2,2],[2,2],[10,1]],[0,1,2]],
  [1882,{servers:[2,1],tasks:[5,4,1,1]},[1,0,1,0]],
  [502,{k:2,w:0,profits:[10],capital:[1]},0],
  [630,[[5,3],[4,4],[1,5]],2],
  [857,{quality:[5],wage:[7],k:1},7],
  [759,[[[1,2]],[[2,3]]],[]],
  [1229,{slots1:[[1,4]],slots2:[[2,3]],duration:2},[]],
  [1272,{intervals:[[0,5]],toBeRemoved:[1,3]},[[0,1],[3,5]]],
  [1272,{intervals:[[0,1]],toBeRemoved:[1,2]},[[0,1]]],
  [2237,{n:2,lights:[],requirement:[0,1]},1],
  [391,[[0,0,1,2],[1,0,2,1]],false],
  [391,[[0,0,2,2],[1,0,3,2]],false],
  [3453,[[0,0,1],[2,2,1]],1], [3454,[[0,0,1],[2,2,1]],1],
  [3453,[[0,0,2],[0,0,2]],1], [3454,[[0,0,2],[0,0,2]],1],
  [587,[[0,0],[1,1],[2,2]],[[0,0],[1,1],[2,2]]],
  [939,[[0,0],[1,1],[2,2]],0], [963,[[0,0],[1,1],[2,2]],0],
];
test('endpoint ties, empty inputs, impossible cases, modulo wrap, overlap counting and lowest separating line',()=>{
  for(const [id,input,expected] of edges) equal(solve(id,input),expected,`${id} ${JSON.stringify(input)}`);
});
test('renderer escapes source, text cells and interval annotations',()=>{
  const step=SUPPORTED[2381].builder(SUPPORTED[2381].defaultInput).steps.at(-1);
  const bad=JSON.parse(JSON.stringify(step));
  bad.sweepStudyView.source='<img src=x onerror=alert(1)>';
  bad.sweepStudyView.state.letters=['<script>'];
  const html=render(bad,'en');
  assert.doesNotMatch(html,/<img|<script>/);
  assert.match(html,/&lt;img/);
  assert.match(html,/&lt;script&gt;/);
});
test('shared renderer and CSS are lazy assets for all 33 lessons; source registry is wired',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');
  const active=html.replace(/<template[\s\S]*?<\/template>/g,'');
  assert.doesNotMatch(active,/renderer-sweep-study\.js|sweep-study\.css/);
  for(const asset of ['renderer-sweep-study.js','sweep-study.css']) {
    const match=html.match(new RegExp(`${asset.replaceAll('.','\\.')}[^>]*data-problem-ids="([^"]+)"`));
    assert.ok(match);
    assert.deepEqual(match[1].split(' ').map(Number),ids);
  }
  assert.match(fs.readFileSync(require.resolve('../public/script.js'),'utf8'),/step\.sweepStudyView[\s\S]*?renderSweepStudy\(step\)/);
});

// Independent small-input oracles. Exhaustive subsets catch greedy/heap choices;
// direct per-index/per-unit coverage catches end+1 and union-area mistakes.
let seed=20261113;
function rand(n) { seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n; }
function range(n,fn) { return Array.from({length:n},(_,i)=>fn(i)); }
function subsets(values) { return range(1<<values.length,mask=>values.filter((_,i)=>mask>>i&1)); }
function disjoint(items,closed=false) { const a=[...items].sort((a,b)=>a[0]-b[0]);return a.every((r,i)=>!i||(closed?a[i-1][1]<r[0]:a[i-1][1]<=r[0])); }
function sufficient(nums,queries) { return nums.every((need,i)=>queries.reduce((sum,q)=>sum+(q[0]<=i&&i<=q[1]?(q[2]??1):0),0)>=need); }
function maxEvents(events) {
  const visit=(i,used)=>i===events.length?0:Math.max(visit(i+1,used),...range(events[i][1]-events[i][0]+1,k=>{
    const day=events[i][0]+k;return used.has(day)?0:1+visit(i+1,new Set([...used,day]));
  }));
  return visit(0,new Set());
}
function maxCourses(courses,time=0,mask=0) {
  let best=0;
  courses.forEach(([d,end],i)=>{if(!(mask>>i&1)&&time+d<=end) best=Math.max(best,1+maxCourses(courses,time+d,mask|1<<i));});
  return best;
}
function squareCut(squares,union) {
  const maxY=Math.max(...squares.map(r=>r[1]+r[2])), maxX=Math.max(...squares.map(r=>r[0]+r[2]));
  const widths=range(maxY,y=>range(maxX,x=>{
    const count=squares.filter(([a,b,l])=>a<=x&&x<a+l&&b<=y&&y<b+l).length;return union?Number(count>0):count;
  }).reduce((a,b)=>a+b,0));
  const half=widths.reduce((a,b)=>a+b,0)/2;let area=0;
  for(let y=0;y<widths.length;y++) { if(area+widths[y]>=half) return y+(half-area)/widths[y];area+=widths[y]; }
}
test('random difference arrays and greedy query selection match direct coverage / exhaustive subsets',()=>{
  for(let trial=0;trial<35;trial++) {
    const n=1+rand(6),nums=range(n,()=>rand(4)),queries=range(rand(7),()=>{const a=rand(n),b=rand(n);return [Math.min(a,b),Math.max(a,b)];});
    const weighted=queries.map(q=>[...q,1+rand(3)]);
    equal(solve(3355,{nums,queries}),sufficient(nums,queries),'3355 random');
    const prefix=range(weighted.length+1,k=>k).find(k=>sufficient(nums,weighted.slice(0,k)))??-1;
    equal(solve(3356,{nums,queries:weighted}),prefix,'3356 random');
    const valid=subsets(queries).filter(q=>sufficient(nums,q));
    equal(solve(3362,{nums,queries}),valid.length?queries.length-Math.min(...valid.map(q=>q.length)):-1,'3362 random');
    const k=1+rand(n),starts=n-k+1;
    function possible(i,values) {
      if(i===starts) return values.every(x=>x===0);
      for(let count=0;count<=Math.min(...values.slice(i,i+k));count++) {
        const next=values.map((x,j)=>j>=i&&j<i+k?x-count:x);
        if(possible(i+1,next)) return true;
      }
      return false;
    }
    equal(solve(2772,{nums,k}),possible(0,nums),'2772 random');
    const trips=range(1+rand(5),()=>{const a=1+rand(n),b=1+rand(n);return [Math.min(a,b),Math.max(a,b),1+rand(9)];});
    equal(solve(1109,{bookings:trips,n}),range(n,i=>trips.reduce((sum,[a,b,w])=>sum+(a<=i+1&&i+1<=b?w:0),0)),'1109 random');
    const lights=range(rand(6),()=>[rand(n),rand(5)]),requirement=range(n,()=>rand(5));
    equal(solve(2237,{n,lights,requirement}),requirement.filter((need,i)=>lights.filter(([p,r])=>Math.abs(i-p)<=r).length>=need).length,'2237 random');
  }
});
test('random scheduling, weighted event DP, courses and hiring costs match exhaustive choices',()=>{
  for(let trial=0;trial<25;trial++) {
    const n=1+rand(6),events=range(n,()=>{const a=1+rand(5),b=1+rand(5);return [Math.min(a,b),Math.max(a,b)];});
    equal(solve(1353,events),maxEvents(events),'1353 random');
    const weighted=events.map(e=>[...e,1+rand(9)]),k=1+rand(n);
    equal(solve(1751,{events:weighted,k}),Math.max(...subsets(weighted).filter(a=>a.length<=k&&disjoint(a,true)).map(a=>a.reduce((sum,r)=>sum+r[2],0))),'1751 random');
    const intervals=events.map(([a,b])=>[a,b+1]);
    equal(solve(435,intervals),n-Math.max(...subsets(intervals).filter(a=>disjoint(a)).map(a=>a.length)),'435 random');
    const courses=range(n,()=>[1+rand(6),1+rand(12)]);
    equal(solve(630,courses),maxCourses(courses),'630 random');
    const quality=range(n,()=>1+rand(10)),wage=range(n,()=>1+rand(30));
    const cost=Math.min(...subsets(range(n,i=>i)).filter(a=>a.length===k).map(a=>a.reduce((sum,i)=>sum+quality[i],0)*Math.max(...a.map(i=>wage[i]/quality[i]))));
    equal(solve(857,{quality,wage,k}),cost,'857 random');
  }
});
test('random square cuts and perfect rectangle checks match unit-cell area oracles',()=>{
  for(let trial=0;trial<25;trial++) {
    const squares=range(1+rand(5),()=>[rand(5),rand(5),1+rand(3)]);
    equal(solve(3453,squares),squareCut(squares,false),'3453 grid area');
    equal(solve(3454,squares),squareCut(squares,true),'3454 union grid area');
    const rectangles=squares.map(([x,y,l])=>[x,y,x+l,y+l]);
    const x0=Math.min(...rectangles.map(r=>r[0])),x1=Math.max(...rectangles.map(r=>r[2]));
    const y0=Math.min(...rectangles.map(r=>r[1])),y1=Math.max(...rectangles.map(r=>r[3]));
    let perfect=true;
    for(let x=x0;x<x1;x++) for(let y=y0;y<y1;y++) if(rectangles.filter(([a,b,c,d])=>a<=x&&x<c&&b<=y&&y<d).length!==1) perfect=false;
    equal(solve(391,rectangles),perfect,'391 grid tiling');
  }
});
test('random interval / light / paint / letter sweeps match direct coordinate simulation',()=>{
  for(let trial=0;trial<25;trial++) {
    const intervals=range(5,i=>[3*i,3*i+1]).filter(()=>rand(2));
    const a=rand(16),b=rand(16),newInterval=[Math.min(a,b),Math.max(a,b)];
    const covered=new Set();
    for(const [start,end] of [...intervals,newInterval]) for(let x=2*start;x<=2*end;x++) covered.add(x);
    const merged=[];let run=null;
    for(let x=0;x<=32;x++) {if(covered.has(x)) {if(run===null) run=x;}else if(run!==null){merged.push([run/2,(x-1)/2]);run=null;}}
    if(run!==null) merged.push([run/2,16]);
    equal(solve(57,{intervals,newInterval}),merged,'57 discrete union');
    const firstList=intervals,secondList=range(5,i=>[3*i+1,3*i+2]).filter(()=>rand(2));
    const intersections=[];
    for(const [a,b] of firstList) for(const [c,d] of secondList) if(Math.max(a,c)<=Math.min(b,d)) intersections.push([Math.max(a,c),Math.min(b,d)]);
    equal(solve(986,{firstList,secondList}),intersections,'986 all pairs');
    const segments=range(1+rand(5),i=>{const a=rand(7),b=rand(7);return [Math.min(a,b)+1,Math.max(a,b)+2,2**i];});
    const endpoints=[...new Set(segments.flatMap(r=>r.slice(0,2)))].sort((a,b)=>a-b);
    const paint=endpoints.slice(0,-1).flatMap((x,i)=>{const color=segments.reduce((sum,[a,b,c])=>sum+(a<=x&&x<b?c:0),0);return color?[[x,endpoints[i+1],color]]:[];});
    equal(solve(1943,segments),paint,'1943 endpoint spans');
    const lights=range(1+rand(5),()=>[rand(11)-5,rand(4)]);
    let best=-1,position=null;
    for(let x=-10;x<=10;x++) {const brightness=lights.filter(([p,r])=>Math.abs(x-p)<=r).length;if(brightness>best){best=brightness;position=x;}}
    equal(solve(2021,lights),position,'2021 direct brightness');
    const ranges=segments.map(r=>r.slice(0,2));
    equal(solve(2848,ranges),range(10,i=>i).filter(x=>ranges.some(([a,b])=>a<=x&&x<=b)).length,'2848 covered points');
    equal(solve(3169,{days:10,meetings:ranges}),range(10,i=>i+1).filter(x=>!ranges.some(([a,b])=>a<=x&&x<=b)).length,'3169 free days');
    equal(solve(1893,{ranges,left:2,right:7}),range(6,i=>i+2).every(x=>ranges.some(([a,b])=>a<=x&&x<=b)),'1893 coverage');
    const chars=range(5,()=>rand(26)),s=String.fromCharCode(...chars.map(x=>x+97));
    const shifts=range(rand(7),()=>{const a=rand(5),b=rand(5);return [Math.min(a,b),Math.max(a,b),rand(2)];});
    const result=chars.slice();
    for(const [a,b,d] of shifts) for(let i=a;i<=b;i++) result[i]=(result[i]+(d?1:25))%26;
    equal(solve(2381,{s,shifts}),String.fromCharCode(...result.map(x=>x+97)),'2381 direct shifts');
  }
});
test('random CPU / server / chair / capital choices match simple scanning schedulers',()=>{
  for(let trial=0;trial<25;trial++) {
    const tasks=range(1+rand(6),()=>[rand(6)+1,rand(5)+1]);
    const remaining=tasks.map((task,i)=>[...task,i]),order=[];let time=0;
    while(remaining.length) {
      const ready=remaining.filter(t=>t[0]<=time).sort((a,b)=>a[1]-b[1]||a[2]-b[2]);
      if(!ready.length){time=Math.min(...remaining.map(t=>t[0]));continue;}
      const next=ready[0];order.push(next[2]);time+=next[1];remaining.splice(remaining.indexOf(next),1);
    }
    equal(solve(1834,tasks),order,'1834 scan');
    const servers=range(1+rand(4),()=>1+rand(4)),durations=range(1+rand(7),()=>1+rand(6));
    const ends=servers.map(()=>0),answer=[];time=0;
    durations.forEach((duration,i)=>{
      time=Math.max(time,i);if(ends.every(end=>end>time)) time=Math.min(...ends);
      const index=range(servers.length,i=>i).filter(i=>ends[i]<=time).sort((a,b)=>servers[a]-servers[b]||a-b)[0];
      answer.push(index);ends[index]=time+duration;
    });
    equal(solve(1882,{servers,tasks:durations}),answer,'1882 scan');
    const times=range(1+rand(6),i=>[i+1,i+2+rand(5)]),targetFriend=rand(times.length),chairs=[];
    const assigned=[];
    times.forEach(([start,end],friend)=>{let chair=0;while((chairs[chair]||0)>start) chair++;chairs[chair]=end;assigned[friend]=chair;});
    equal(solve(1942,{times,targetFriend}),assigned[targetFriend],'1942 scan');
    const profits=range(1+rand(5),()=>rand(6)),capital=profits.map(()=>rand(8)),w=rand(4),k=rand(4);
    function invest(funds,remaining,mask=0) {
      let best=funds;
      if(remaining) profits.forEach((p,i)=>{if(!(mask>>i&1)&&capital[i]<=funds) best=Math.max(best,invest(funds+p,remaining-1,mask|1<<i));});
      return best;
    }
    equal(solve(502,{k,w,profits,capital}),invest(w,k),'502 exhaustive projects');
  }
});
test('random geometry finds the hull boundary and rotated rectangles by independent predicates',()=>{
  for(let trial=0;trial<30;trial++) {
    const points=[...new Map(range(4+rand(6),()=>[rand(5),rand(5)]).map(p=>[p.join(','),p])).values()];
    const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
    const boundary=points.filter(p=>points.length===1||points.some(q=>p!==q&&(points.every(r=>cross(p,q,r)>=0)||points.every(r=>cross(p,q,r)<=0)))).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
    equal(solve(587,points),boundary,'587 supporting lines');
    const keys=new Set(points.map(p=>p.join(',')));let aligned=Infinity,rotated=Infinity;
    for(const a of points) for(const b of points) {
      if(a[0]!==b[0]&&a[1]!==b[1]&&keys.has([a[0],b[1]].join(','))&&keys.has([b[0],a[1]].join(','))) aligned=Math.min(aligned,Math.abs((a[0]-b[0])*(a[1]-b[1])));
      for(const c of points) {
        if(a===b||a===c||b===c) continue;
        const u=[b[0]-a[0],b[1]-a[1]],v=[c[0]-a[0],c[1]-a[1]];
        if(u[0]*v[0]+u[1]*v[1]===0&&keys.has([b[0]+c[0]-a[0],b[1]+c[1]-a[1]].join(','))) rotated=Math.min(rotated,Math.abs(u[0]*v[1]-u[1]*v[0]));
      }
    }
    equal(solve(939,points),aligned===Infinity?0:aligned,'939 four-corner search');
    equal(solve(963,points),rotated===Infinity?0:rotated,'963 perpendicular edge triples');
  }
});
test('3356 final diagram retains the successful prefix check without inventing live locals',()=>{
  const result=SUPPORTED[3356].builder(SUPPORTED[3356].defaultInput),step=result.steps.at(-1);
  assert.equal(step.sweepStudyView.check.count,result.answer);
  assert.deepEqual(step.sweepStudyView.check.capacity,[2,2,2]);
  assert.ok(!Object.hasOwn(step.sweepStudyView.state,'capacity'));
  assert.match(render(step,'en'),/Retained picture from checked prefix/);
  assert.equal((render(step,'en').match(/data-coverage=/g)||[]).length,3);
});
