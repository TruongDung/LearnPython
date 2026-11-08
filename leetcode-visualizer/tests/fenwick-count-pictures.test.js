'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const p = require('../problems').SUPPORTED;
const ids = [4051,4055,2426,1649,1409,775,1395,1505,2179,2250,2519];
const methods = {4051:'distantSubarrays',4055:'shadowPairs',2426:'numberOfPairs',1649:'createSortedArray',1409:'processQueries',775:'isIdealPermutation',1395:'numTeams',1505:'minInteger',2179:'goodTriplets',2250:'countRectangles',2519:'kBigIndices'};
const run = (id,input=p[id].defaultInput,params) => p[id].builder(input,params);
const view = step => step.fenwickCountView;
let seed = 2426;
const rand = n => { seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed%n; };
function brutePairs(a,b,diff){let out=0;for(let j=0;j<a.length;j++)for(let i=0;i<j;i++)out+=a[i]-b[i]<=a[j]-b[j]+diff;return out;}
function bruteInsertion(a){let out=0;for(let j=0;j<a.length;j++)out+=Math.min(a.slice(0,j).filter(n=>n<a[j]).length,a.slice(0,j).filter(n=>n>a[j]).length);return out;}
function bruteMoves(queries,m){const a=Array.from({length:m},(_,i)=>i+1),answer=[];for(const q of queries){const i=a.indexOf(q);answer.push(i);a.splice(i,1);a.unshift(q);}return answer;}
function ui(lang='vi',extra={}){
  const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang,document:{getElementById:()=>host},...extra};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-fenwick-count-pictures.js'),'utf8'),ctx);
  return {ctx,render:(s,opts)=>{ctx.renderFenwickCountPictures(s,opts);return host.innerHTML;}};
}

test('all eleven lessons run complete native traces with one source line per frame',()=>{
  for(const id of ids){const r=run(id);assert.equal(p[id].debugMode,'line-by-line');assert.equal(view(r.steps.at(-1)).trace.truncated,false);assert.equal(r.steps.filter(s=>s.final).length,1);for(const s of r.steps){assert.deepEqual(s.codeLines,[view(s).source.line]);assert.equal(p[id].code[s.codeLines[0]-1].trim(),view(s).source.text);assert.ok(view(s).frames.length);}}
});
test('every statement, helper local, branch and recursive frame matches independent CPython',()=>{
  const items=ids.map(id=>({id,code:p[id].code.join('\n'),method:methods[id],args:p[id].liveArgs(p[id].defaultInput),objectClasses:['Fenwick'],stateClasses:['Fenwick']}));
  const script="import sys,json,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(x)) for x in p['items']]))";
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:64e6});
  assert.equal(ref.status,0,ref.stderr);
  JSON.parse(ref.stdout).forEach((native,i)=>{const r=run(items[i].id);assert.deepEqual(r.answer,native.answer);assert.equal(r.steps.length,native.events.length);native.events.forEach((e,j)=>{const s=r.steps[j],v=view(s);assert.deepEqual(s.codeLines,[e.line]);for(const key of ['locals','outer','frames','scope','branch','returning','returned'])assert.deepEqual(v[key],e[key],`${items[i].id}/${j}/${key}`);for(const watch of s.vars)assert.deepEqual(watch.rawValue,e.locals[watch.name]);});});
});
test('2426 native result and pair witnesses match quadratic enumeration, including equality and signed diff',()=>{
  const cases=[[[3,2,5],[2,2,1],1],[[3,-1],[-2,2],-1],[[2,2,2],[1,1,1],0],[[1],[0],0],[[1e9,-1e9],[-1e9,1e9],-1e9]];
  for(let i=0;i<40;i++){const n=1+rand(12);cases.push([Array.from({length:n},()=>rand(13)-6),Array.from({length:n},()=>rand(13)-6),rand(9)-4]);}
  for(const[a,b,diff]of cases){const r=run(2426,a,{nums2:b,diff}),v=view(r.steps.at(-1));assert.equal(r.answer,brutePairs(a,b,diff));assert.equal(v.accepted.length,r.answer);assert.equal(new Set(v.accepted.map(p=>p.i+','+p.j)).size,r.answer);for(const p of v.accepted){assert.ok(p.i<p.j);assert.ok(a[p.i]-b[p.i]<=a[p.j]-b[p.j]+diff);}for(const s of r.steps){const v=view(s);if(v.change?.kind==='count')assert.equal(v.newlyCounted.length,v.locals.count);}}
});
test('1649 costs exclude equals and match independent sorted insertion',()=>{
  const cases=[[1,5,6,2],[1,2,3,6,5,4],[1,3,3,3,2,4,2,1,2],[2,2,2],[100000,1,100000,2]];
  for(let i=0;i<50;i++)cases.push(Array.from({length:1+rand(16)},()=>1+rand(14)));
  for(const a of cases){const r=run(1649,a);assert.equal(r.answer,bruteInsertion(a));for(const s of r.steps){const v=view(s);if(v.change?.kind==='count'){const x=v.locals,before=a.slice(0,x.inserted);assert.equal(x.less,before.filter(n=>n<x.value).length);assert.equal(x.greater,before.filter(n=>n>x.value).length);assert.equal(x.cost,Math.min(x.less,x.greater));}}}
});
test('1409 all official examples and repeated front queries match actual move-to-front simulation',()=>{
  const cases=[[[3,1,2,1],5],[[4,1,2,2],4],[[7,5,5,8,3],8],[[1],1],[[2,2,2,2],4]];
  for(let k=0;k<40;k++){const m=1+rand(16);cases.push([Array.from({length:1+rand(Math.min(m,12))},()=>1+rand(m)),m]);}
  for(const[q,m]of cases){const r=run(1409,q,{m});assert.deepEqual(r.answer,bruteMoves(q,m));for(const s of r.steps){const v=view(s);if(v.source.text==='answer.append(index)')assert.equal(v.context.answer.at(-1),v.context.index);if(v.source.text==='front -= 1'){const pos=v.context.positions.__pairs__,occupied=[...pos].sort((a,b)=>a[1]-b[1]).map(p=>p[0]);assert.equal(occupied[0],v.context.value);assert.equal(new Set(pos.map(p=>p[1])).size,m);}}}
});
test('every Fenwick write changes exactly one native node by delta; query paths sum actual reads',()=>{
  for(const id of ids){let previous=null,reads=[];for(const s of run(id).steps){const v=view(s);if((v.scope==='query'||v.scope==='prefix_sum')&&v.source.text==='total = 0')reads=[];if(v.change?.kind==='write'){const {index,before,after,delta}=v.change;assert.equal(after,before+delta);assert.equal(after,v.locals.self.tree[index]);if(previous?.scope==='add'){const expected=[...previous.tree];expected[index]+=delta;assert.deepEqual(v.tree,expected);}}if(v.change?.kind==='read'){reads.push(v.change.value);assert.equal(v.locals.total,reads.reduce((a,b)=>a+b,0));assert.ok(v.helper.path.every((n,i,a)=>!i||n===a[i-1]-(a[i-1]&-a[i-1])));}previous=v;}}
});
test('4055 kth walks return the requested native frequency order statistic',()=>{
  const r=run(4055,[5,1,4,2,6]);
  for(const s of r.steps){const v=view(s);if(v.scope!=='kth'||!v.returning)continue;const frequencies=v.tree.slice(1).map((_,j)=>{const i=j+1,query=k=>{let n=0;for(;k;k-=k&-k)n+=v.tree[k];return n;};return query(i)-query(i-1);}),expanded=frequencies.flatMap((count,i)=>Array(count).fill(i+1));assert.equal(v.returned,expanded[v.helper.start-1]);}
});
test('4055 each counted pair has one recursive owner and each count matches native active - below_lower',()=>{
  for(const a of [[3,1,4,2,5],[2,2,3,3],[6,7,8,9],[5,1,4,2,6]]){const r=run(4055,a),end=view(r.steps.at(-1));assert.equal(end.accepted.length,r.answer);assert.equal(new Set(end.accepted.map(p=>p.i+','+p.j)).size,r.answer);for(const s of r.steps){const v=view(s);if(v.change?.kind==='count'){assert.equal(v.newlyCounted.length,v.locals.active-v.locals.below_lower);for(const pair of v.newlyCounted){assert.ok(pair.i<=v.middle&&pair.j>v.middle);assert.ok(a[pair.i]<a[pair.j]);assert.ok(a.slice(pair.i+1,pair.j).every(n=>n<=a[pair.i]||n>=a[pair.j]));}}}}
});
test('query-before-insert and assignment freshness prevent self pairs and stale values',()=>{
  for(const id of [4051,2426,1649]){for(const s of run(id).steps){const v=view(s);if(v.change?.kind==='count')assert.ok(!v.members.includes(v.current));if(v.source.text.startsWith('for ')&&v.branch&&/for (prefix_index|j, current|inserted, value)/.test(v.source.text))assert.deepEqual(v.scratch,{});}}
});
test('all native frames render deterministically in VI and EN, including unfinished initialization',()=>{
  for(const id of ids){const r=run(id),before=JSON.stringify(r.steps);for(const lang of ['vi','en']){const renderer=ui(lang),first=renderer.render(r.steps[0]);for(const s of r.steps){const html=renderer.render(s);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object/);assert.ok(html.includes(`data-source-line="${s.codeLines[0]}"`));const native=view(s).tree;for(let i=1;i<(native?.length??0);i++)assert.ok(html.includes(`data-native-node="${i}" data-native-value="${native[i]}"`));}assert.equal(renderer.render(r.steps[0]),first);}assert.equal(JSON.stringify(r.steps),before);}
});
test('pair proof selection never mutates native state and k=0 shows all nonempty subarrays once',()=>{
  for(const[id,input,params]of [[4051,[1,2,1],{goal:4,k:1}],[4051,[1,-1,2],{goal:3,k:0}],[2426,[3,2,5],{nums2:[2,2,1],diff:1}],[4055,[3,1,4,2,5],{}]]){const r=run(id,input,params),s=r.steps.at(-1),before=JSON.stringify(s),renderer=ui();for(const selected of view(s).accepted)assert.doesNotMatch(renderer.render(s,{selected}),/undefined|NaN/);assert.equal(JSON.stringify(s),before);if(params.k===0){assert.equal(r.steps.length,3);assert.equal(view(s).accepted.length,6);assert.equal((renderer.render(s).match(/data-fc-proof=/g)??[]).length,6);}}
});
test('parsers reject malformed, sparse and oversized input without mutating the caller',()=>{
  for(const id of ids){for(const a of [[],[NaN],Array(3),'1,,2','[true]'])assert.throws(()=>run(id,a));const a=p[id].defaultInput,before=JSON.stringify(a);run(id,a);assert.equal(JSON.stringify(a),before);}
  assert.throws(()=>run(1409,[1,2],{m:1}));assert.throws(()=>run(2426,[1,2],{nums2:[1]}),/same length/);assert.throws(()=>run(1649,[100001]));assert.throws(()=>run(4051,[1],{k:-1}));
});
test('303 and 307 are available exactly once in the Fenwick tag without replacing their algorithms',()=>{
  for(const id of [303,307])assert.equal(p[id].tags.filter(t=>t.key==='fenwick-tree').length,1);
  assert.equal(p[303].category.key,'prefix-sum');assert.equal(p[307].category.key,'segment-tree');
});

function permutations(a){return a.length?a.flatMap((v,i)=>permutations(a.filter((_,j)=>j!==i)).map(t=>[v,...t])):[[]];}
function teams(a){let count=0;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)for(let k=j+1;k<a.length;k++)count+=a[i]<a[j]&&a[j]<a[k]||a[i]>a[j]&&a[j]>a[k];return count;}
function smallSwaps(num,budget){let best=num,front=[num],seen=new Set(front);for(let t=0;t<budget;t++){const next=[];for(const s of front)for(let i=0;i<s.length-1;i++){const a=[...s];[a[i],a[i+1]]=[a[i+1],a[i]];const v=a.join('');if(!seen.has(v)){seen.add(v);next.push(v);if(v<best)best=v;}}front=next;if(!front.length)break;}return best;}
test('775 checks every small permutation against explicit local and global inversion counts',()=>{
  for(let n=1;n<=4;n++)for(const a of permutations(Array.from({length:n},(_,i)=>i))){let global=0,local=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(a[i]>a[j]){global++;if(j===i+1)local++;}const r=run(775,a);assert.equal(r.answer,global===local,JSON.stringify(a));for(const s of r.steps){const v=view(s);if(v.change?.kind==='check'){const x=v.locals;assert.equal(x.max_value,Math.max(...a.slice(0,x.j-1)));assert.equal(a[x.max_index],x.max_value);assert.equal(v.change.fail,x.max_value>a[x.j]);}}}
});
test('1395 native products and every selected team match independent cubic enumeration',()=>{
  const cases=[[2,5,3,4,1],[2,1,3],[1,2,3,4],[4,3,2,1]];
  for(let t=0;t<25;t++){const a=Array.from({length:3+rand(8)},(_,i)=>i*2+1);for(let i=a.length-1;i;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];}cases.push(a);}
  for(const a of cases){const r=run(1395,a),v=view(r.steps.at(-1));assert.equal(r.answer,teams(a));assert.equal(v.accepted.length,r.answer);assert.equal(new Set(v.accepted.map(p=>[p.i,p.j,p.k].join(','))).size,r.answer);for(const s of r.steps)if(view(s).change?.kind==='count'){const v=view(s),x=v.locals;assert.equal(v.newlyCounted.length,x.increasing+x.decreasing);assert.equal(x.increasing,x.left_less[x.j]*x.right_greater);assert.equal(x.decreasing,x.left_greater[x.j]*x.right_less);}}
});
test('1505 matches a bounded breadth-first search of all adjacent swaps, preserving leading zeros',()=>{
  const cases=[['4321',4],['100',1],['36789',1000],['4321',0],['1111',3],['10',1]];
  for(let i=0;i<25;i++)cases.push([String(1+rand(3))+Array.from({length:1+rand(4)},()=>rand(4)).join(''),rand(6)]);
  for(const[num,k]of cases){const r=run(1505,num,{k});assert.equal(r.answer,smallSwaps(num,Math.min(k,20)),JSON.stringify({num,k}));for(const row of view(r.steps.at(-1)).ledger){assert.equal(row.from,row.amount);assert.ok(row.k>=0);assert.equal(num[row.position],String(row.digit));assert.equal(row.before[row.from],row.position);}}
});
test('2179 counts exactly the triples whose values keep their order in both permutations',()=>{
  for(let t=0;t<35;t++){const n=3+rand(8),shuffle=()=>{const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;},a=shuffle(),b=shuffle(),r=run(2179,a,{nums2:b}),pos=new Map(b.map((v,i)=>[v,i]));let expected=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)for(let k=j+1;k<n;k++)expected+=pos.get(a[i])<pos.get(a[j])&&pos.get(a[j])<pos.get(a[k]);assert.equal(r.answer,expected);assert.equal(view(r.steps.at(-1)).accepted.length,expected);for(const s of r.steps){const v=view(s);if(v.change?.kind==='count')assert.equal(v.newlyCounted.length,v.locals.left_count*v.locals.right_count);}}
});
test('2250 includes both boundaries and duplicate rectangles, matching direct geometry tests',()=>{
  const cases=[[[[2,2],[2,2]],[[2,2],[3,2],[2,3]]],[[[1,2],[2,3],[2,5]],[[1,1],[2,3]]]];
  for(let t=0;t<30;t++)cases.push([Array.from({length:1+rand(8)},()=>[1+rand(8),1+rand(8)]),Array.from({length:1+rand(8)},()=>[1+rand(9),1+rand(9)])]);
  for(const[rectangles,points]of cases){const r=run(2250,JSON.stringify(rectangles),{points:JSON.stringify(points)}),expected=points.map(([x,y])=>rectangles.filter(([w,h])=>w>=x&&h>=y).length);assert.deepEqual(r.answer,expected);for(const s of r.steps){const v=view(s);if(v.change?.kind==='count'){assert.equal(v.newlyCounted.length,v.context.answer[v.current]);for(const p of v.newlyCounted){assert.ok(rectangles[p.rect][0]>=points[p.point][0]);assert.ok(rectangles[p.rect][1]>=points[p.point][1]);}}}}
});
test('2519 requires k strictly smaller values on both sides and excludes equal values',()=>{
  for(const a of [[1],[2,1],[2,3,6,5,2,3],[1,1,1],[1,3,2],...Array.from({length:35},()=>Array.from({length:3+rand(10)},()=>1+rand(8)))]){const k=1+rand(Math.min(4,a.length)),expected=a.flatMap((num,j)=>a.slice(0,j).filter(v=>v<num).length>=k&&a.slice(j+1).filter(v=>v<num).length>=k?[j]:[]),r=run(2519,a,{k});assert.equal(r.answer,expected.length);assert.deepEqual(view(r.steps.at(-1)).accepted.map(p=>p.index).sort((a,b)=>a-b),expected);}
});
test('1505 swap illustrations follow exactly one adjacent move per slider tick without changing Python state',()=>{
  const r=run(1505,'4321',{k:4}),renderer=ui();
  for(const s of r.steps){const v=view(s);if(v.change?.kind!=='count')continue;const row=v.ledger.at(-1),before=JSON.stringify(s);let last=null;for(let t=0;t<=row.from;t++){const html=renderer.render(s,{swapTick:t}),match=html.match(/data-swap-order="([\d,]*)"/),order=match[1].split(',').map(Number);assert.equal(order[row.from-t],row.position);if(last){const different=order.flatMap((v,i)=>v!==last[i]?[i]:[]);assert.equal(different.length,2);assert.equal(different[1],different[0]+1);}last=order;}assert.equal(JSON.stringify(s),before);}
});
