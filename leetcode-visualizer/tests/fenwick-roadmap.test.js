'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const {SUPPORTED:p,CATEGORY_ORDER,FENWICK_TREE_SUBTABS}=require('../problems');
const {FENWICK_ROSTER,FENWICK_ORDER}=require('../problems/fenwick-catalog');
const ids=[2659,2907,2908,2916,3072,3187],methods={2659:'countOperationsToEmptyArray',2907:'maxProfit',2908:'minimumSum',2916:'sumCounts',3072:'resultArray',3187:'countOfPeaks'};
const run=(id,input=p[id].defaultInput,params)=>p[id].builder(input,params),view=s=>s.fenwickRoadmapView;
let seed=3072;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
function moves(a){a=[...a];let n=0;while(a.length){const min=Math.min(...a),v=a.shift();if(v!==min)a.push(v);n++;}return n;}
function triple(a,profits){let answer=profits?-1:Infinity;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)for(let k=j+1;k<a.length;k++)if(profits?a[i]<a[j]&&a[j]<a[k]:a[i]<a[j]&&a[k]<a[j])answer=profits?Math.max(answer,profits[i]+profits[j]+profits[k]):Math.min(answer,a[i]+a[j]+a[k]);return answer===Infinity?-1:answer;}
function squares(a){let answer=0;for(let i=0;i<a.length;i++){const seen=new Set();for(let j=i;j<a.length;j++){seen.add(a[j]);answer+=seen.size**2;}}return answer;}
function distribution(a){const first=[a[0]],second=[a[1]];for(const num of a.slice(2)){const g1=first.filter(v=>v>num).length,g2=second.filter(v=>v>num).length;(g1>g2||g1===g2&&first.length<=second.length?first:second).push(num);}return [...first,...second];}
function peaks(a,queries){a=[...a];const answer=[];for(const[type,l,r]of queries){if(type===2)a[l]=r;else{let count=0;for(let i=l+1;i<r;i++)count+=a[i]>a[i-1]&&a[i]>a[i+1];answer.push(count);}}return answer;}
function ui(lang='vi',extra={}){const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang,document:{getElementById:()=>host},...extra};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-fenwick-roadmap.js'),'utf8'),ctx);return {ctx,render:(s,opts)=>{ctx.renderFenwickRoadmap(s,opts);return host.innerHTML;}};}

test('Fenwick roadmap has all 24 requested problems in exactly the five requested levels',()=>{
  const expected=[[303,307,1409],[1395,775,1505],[315,493,1649,327],[2179,2250,2426,2519,2659,2907,2908],[308,2916,3072,2940,3161,3187,673]];
  assert.deepEqual(FENWICK_TREE_SUBTABS.slice(1).map(t=>t.roster.map(p=>p.id)),expected);
  assert.deepEqual(FENWICK_ORDER,expected.flat());assert.equal(new Set(FENWICK_ORDER).size,24);
  for(const id of FENWICK_ORDER){assert.ok(p[id]);assert.ok(typeof p[id].builder==='function');assert.ok(p[id].code.length);assert.ok([p[id].category,...p[id].tags].some(t=>t.key==='fenwick-tree'));}
  assert.ok(FENWICK_TREE_SUBTABS.every(t=>t.roster.every(p=>p.available)));
  const all=FENWICK_TREE_SUBTABS[0].roster;assert.equal(new Set(all.map(p=>p.id)).size,all.length);for(const id of [3505,4051,4055])assert.ok(all.some(p=>p.id===id));
  assert.deepEqual(CATEGORY_ORDER['fenwick-tree'].order,FENWICK_ORDER);
});
test('foundation and aggregate exercise notes distinguish the algorithms and retain learning order',()=>{
  assert.match(FENWICK_ROSTER.find(p=>p.id===303).technique.en,/preparation/);
  assert.match(FENWICK_ROSTER.find(p=>p.id===2908).technique.en,/no BIT/);
  assert.match(FENWICK_ROSTER.find(p=>p.id===2916).technique.en,/Segment Tree/);
  assert.equal(CATEGORY_ORDER['fenwick-tree'].guide.vi.stages.length,5);
});
test('all six new lessons have runnable defaults, complete line traces and a single final return',()=>{
  const answers={2659:5,2907:19,2908:9,2916:15,3072:[2,3,1,3],3187:[0]};
  for(const id of ids){const r=run(id);assert.deepEqual(r.answer,answers[id]);assert.equal(p[id].debugMode,'line-by-line');assert.equal(view(r.steps.at(-1)).trace.truncated,false);assert.equal(r.steps.filter(s=>s.final).length,1);for(const s of r.steps){assert.deepEqual(s.codeLines,[view(s).source.line]);assert.equal(view(s).source.text,p[id].code[s.codeLines[0]-1].trim());}}
});
test('every executed statement and helper frame matches independent CPython, including nested two-BIT operations',()=>{
  const items=ids.map(id=>({code:p[id].code.join('\n'),method:methods[id],args:p[id].liveArgs(p[id].defaultInput),objectClasses:['Fenwick','FenwickMax','RangeFenwick'],stateClasses:['Fenwick','FenwickMax','RangeFenwick']}));
  const script="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(x)) for x in p['items']]))";
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:96e6});assert.equal(ref.status,0,ref.stderr);
  JSON.parse(ref.stdout).forEach((native,i)=>{const r=run(ids[i]);assert.deepEqual(r.answer,native.answer);assert.equal(r.steps.length,native.events.length);native.events.forEach((e,j)=>{const v=view(r.steps[j]);for(const name of ['locals','outer','frames','scope','branch','returning','returned'])assert.deepEqual(v[name],e[name],`${ids[i]}/${j}/${name}`);assert.deepEqual(r.steps[j].codeLines,[e.line]);for(const watch of r.steps[j].vars)assert.deepEqual(watch.rawValue,e.locals[watch.name]);});});
});
test('2659 operations match literal queue rotation/removal, and each native moves count equals its illustrated route',()=>{
  const cases=[[3,4,-1],[1,2,4,3],[1,2,3],[9],[-1000000000,1000000000,0]];
  for(let i=0;i<35;i++){const a=Array.from({length:1+rand(12)},(_,i)=>i*3-12);for(let j=a.length-1;j;j--){const k=rand(j+1);[a[j],a[k]]=[a[k],a[j]];}cases.push(a);}
  for(const a of cases){const r=run(2659,a);assert.equal(r.answer,moves(a));for(const row of view(r.steps.at(-1)).ledger){assert.equal(row.moves,row.path.length);assert.equal(row.path.at(-1),row.index);}}
});
test('2907 maximizes profits rather than prices and excludes equal prices on either side',()=>{
  const cases=[[[10,2,3,4],[100,2,7,10]],[[1,2,3,4,5],[1,5,3,4,6]],[[4,3,2,1],[33,20,19,87]],[[2,2,3,4],[9,3,2,5]]];
  for(let i=0;i<35;i++){const n=3+rand(10);cases.push([Array.from({length:n},()=>1+rand(7)),Array.from({length:n},()=>1+rand(100))]);}
  for(const[a,profits]of cases){const r=run(2907,a,{profits});assert.equal(r.answer,triple(a,profits));for(const row of view(r.steps.at(-1)).ledger){assert.ok(row.i<row.j&&row.j<row.k);assert.ok(a[row.i]<a[row.j]&&a[row.j]<a[row.k]);assert.equal(row.value,profits[row.i]+profits[row.j]+profits[row.k]);}}
});
test('2908 prefix/suffix minima agree with independent cubic mountain enumeration',()=>{
  for(const a of [[8,6,1,5,3],[5,4,8,7,10,2],[6,5,4,3,4,5],[1,3,1],...Array.from({length:40},()=>Array.from({length:3+rand(10)},()=>1+rand(50)))]){const r=run(2908,a);assert.equal(r.answer,triple(a));for(const row of view(r.steps.at(-1)).ledger){assert.ok(row.i<row.j&&row.j<row.k);assert.equal(a[row.i]+a[row.j]+a[row.k],row.value);}}
});
test('2916 ending-square increments and every illustrated subarray agree with independent distinct sets',()=>{
  for(const a of [[1,2,1],[2,2],[1,2,3,4],[7],...Array.from({length:35},()=>Array.from({length:1+rand(12)},()=>1+rand(7)))]){
    const r=run(2916,a);assert.equal(r.answer,squares(a));let previous=Array(a.length).fill(0);
    for(const row of view(r.steps.at(-1)).ledger){const expected=Array.from({length:a.length},(_,s)=>s<=row.right?new Set(a.slice(s,row.right+1)).size:0);assert.deepEqual(row.distinct,expected);assert.equal(row.oldSum,previous.slice(row.left,row.right+1).reduce((a,b)=>a+b,0));assert.equal(row.squares,expected.reduce((n,d)=>n+d*d,0));previous=expected;}
    for(const s of r.steps){const v=view(s);if(v.change?.kind!=='range-add')continue;const prefix=(bit,k)=>{let total=0;for(;k;k-=k&-k)total+=bit[k];return total;};for(let i=1;i<=a.length;i++)assert.equal(prefix(v.bits.delta,i)*i-prefix(v.bits.weighted,i),v.distinct.slice(0,i).reduce((a,b)=>a+b,0));}
  }
});
test('3072 greater-count decisions and length ties match direct array scans before append',()=>{
  for(const a of [[2,1,3,3],[5,14,3,1,2],[3,3,3,3],...Array.from({length:40},()=>Array.from({length:3+rand(10)},()=>1+rand(10)))]){const r=run(3072,a);assert.deepEqual(r.answer,distribution(a));const ids1=[0],ids2=[1];for(const row of view(r.steps.at(-1)).ledger){const d=row.decision,g1=ids1.filter(i=>a[i]>a[row.index]).length,g2=ids2.filter(i=>a[i]>a[row.index]).length;assert.equal(d.greater1,g1);assert.equal(d.greater2,g2);assert.equal(d.len1,ids1.length);assert.equal(d.len2,ids2.length);assert.equal(row.target,g1>g2||g1===g2&&ids1.length<=ids2.length?1:2);(row.target===1?ids1:ids2).push(row.index);}}
});
test('3187 updates and strict range endpoints match a naive peak scan after each query',()=>{
  const cases=[[[3,1,4,2,5],[[2,3,4],[1,0,4]]],[[4,1,4,2,1,5],[[2,2,4],[1,0,2],[1,0,4]]],[[1,2,1],[[1,1,1],[1,0,2],[2,0,3],[1,0,2]]]];
  for(let t=0;t<35;t++){const n=3+rand(10),a=Array.from({length:n},()=>1+rand(20)),queries=Array.from({length:1+rand(8)},()=>{if(rand(2))return [2,rand(n),1+rand(20)];const l=rand(n);return [1,l,l+rand(n-l)];});cases.push([a,queries]);}
  for(const[a,queries]of cases){const r=run(3187,a,{queries});assert.deepEqual(r.answer,peaks(a,queries));for(const s of r.steps){const v=view(s);if(v.scope==='is_peak'&&v.returning){const x=v.locals,i=x.i,nums=v.context.nums;assert.equal(v.returned,0<i&&i<nums.length-1&&nums[i-1]<nums[i]&&nums[i]>nums[i+1]);}}}
});
test('all native BIT writes affect one actual cell and every helper carries its real tree identity',()=>{
  for(const id of ids){let previous;for(const s of run(id).steps){const v=view(s),c=v.change;if(c?.kind==='write'){assert.deepEqual(c.after,v.bits[c.name][c.index]);assert.deepEqual(c.before,previous.bits[c.name][c.index]);const expected=JSON.parse(JSON.stringify(previous.bits[c.name]));expected[c.index]=c.after;assert.deepEqual(v.bits[c.name],expected);}if(v.scope==='query'||v.scope==='add')assert.equal(v.helper.name,v.locals.self.name);previous=v;}}
});
test('all six renderers display every native state in both languages and preserve snapshot data',()=>{
  for(const id of ids){const r=run(id),saved=JSON.stringify(r.steps);for(const lang of ['vi','en']){const renderer=ui(lang),first=renderer.render(r.steps[0]);for(const s of r.steps){const html=renderer.render(s);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object/);assert.ok(html.includes(`data-source-line="${s.codeLines[0]}"`));}assert.equal(renderer.render(r.steps[0]),first);}assert.equal(JSON.stringify(r.steps),saved);}
});
test('2916 selectable subarray diagrams use committed counts without changing the native Python frame',()=>{
  const r=run(2916),s=r.steps.at(-1),before=JSON.stringify(s),renderer=ui();for(let start=0;start<3;start++)for(let end=start;end<3;end++){const html=renderer.render(s,{range:[start,end]});assert.ok(html.includes(`data-fr-range="${start},${end}"`));assert.doesNotMatch(html,/undefined|NaN/);}assert.equal(JSON.stringify(s),before);
});
test('visual parsers reject invalid bounds, duplicates, sparse arrays and invalid query types without mutating input',()=>{
  for(const id of ids){for(const a of [[],Array(3),[true],'1,,2',Array(13).fill(1)])assert.throws(()=>run(id,a));const a=p[id].defaultInput,saved=JSON.stringify(a);run(id,a);assert.equal(JSON.stringify(a),saved);}
  assert.throws(()=>run(2659,[1,1]),/distinct/);assert.throws(()=>run(2907,[1,2,3],{profits:[1,2]}));assert.throws(()=>run(2908,[1,51,2]));
  for(const queries of [null,[],[[3,0,1]],[[1,2,1]],[[1,0,3]],[[2,0,0]],[[2,3,2]],[[1,true,2]],Array(1)])assert.throws(()=>run(3187,[1,2,1],{queries}));
});
test('catalog API wires Fenwick tiers to the existing lazy catalog without replacing other groups',()=>{
  const server=fs.readFileSync(require.resolve('../server.js'),'utf8');assert.match(server,/fenwickGroup\.subTabs = FENWICK_TREE_SUBTABS/);assert.match(server,/prefixGroup\.subTabs/);
});
test('3187 marks the actual assignment target at boundary updates and never carries the old loop position into a new query',()=>{
  const r=run(3187,[1,5,1,4,1],{queries:[[2,0,7],[2,4,9],[1,0,4]]});
  for(const s of r.steps){const v=view(s);if(v.change?.kind==='replace')assert.equal(v.current,v.locals.index);if(v.source.text==='for query_index, query in enumerate(queries):'&&v.branch)assert.equal(v.current,v.context.query[0]===2?v.context.query[1]:null);}
});
