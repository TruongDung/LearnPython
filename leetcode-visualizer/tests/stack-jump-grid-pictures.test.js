'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../problems').SUPPORTED,ids=[3221,2617,2104,1475,1504],view=s=>s.stackJumpGridView,run=(id,a=p[id].defaultInput)=>p[id].builder(a);
const methods={3221:'maxScore',2617:'minimumVisitedCells',2104:'subArrayRanges',1475:'finalPrices',1504:'numSubmat'};
let seed=3221;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
function hops(a){const dp=Array(a.length).fill(-Infinity);dp[0]=0;for(let j=1;j<a.length;j++)for(let i=0;i<j;i++)dp[j]=Math.max(dp[j],dp[i]+(j-i)*a[j]);return dp.at(-1);}
function prices(a){return a.map((price,i)=>{const next=a.slice(i+1).find(x=>x<=price);return price-(next??0);});}
function ranges(a){let total=0;for(let i=0;i<a.length;i++)for(let j=i;j<a.length;j++){const sub=a.slice(i,j+1);total+=Math.max(...sub)-Math.min(...sub);}return total;}
function visited(g){const m=g.length,n=g[0].length,dp=Array.from({length:m},()=>Array(n).fill(-1)),q=[[0,0]];dp[0][0]=1;for(let h=0;h<q.length;h++){const[r,c]=q[h];for(const[dr,dc]of[[0,1],[1,0]])for(let k=1;k<=g[r][c];k++){const nr=r+dr*k,nc=c+dc*k;if(nr>=m||nc>=n)break;if(dp[nr][nc]===-1){dp[nr][nc]=dp[r][c]+1;q.push([nr,nc]);}}}return dp;}
function rectangles(g,end=null){let total=0;for(let top=0;top<g.length;top++)for(let left=0;left<g[0].length;left++)for(let bottom=top;bottom<g.length;bottom++)for(let right=left;right<g[0].length;right++){if(end&&(bottom!==end[0]||right!==end[1]))continue;let good=true;for(let r=top;r<=bottom;r++)for(let c=left;c<=right;c++)good&&=g[r][c]===1;if(good)total++;}return total;}
function ui(lang='vi',extra={}){const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang,document:{getElementById:()=>host},...extra};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-stack-jump-grid.js'),'utf8'),ctx);return {ctx,render:(s,options)=>{ctx.renderStackJumpGrid(s,options);return host.innerHTML;}};}
test('all five lessons use complete actual Python statement replay, preserve metadata, and return correct defaults',()=>{
  const expected={3221:42,2617:4,2104:4,1475:[4,2,4,2,3],1504:13};
  for(const id of ids){const r=run(id);assert.deepEqual(r.answer,expected[id]);assert.equal(p[id].debugMode,'line-by-line');assert.equal(view(r.steps.at(-1)).trace.truncated,false);assert.equal(r.steps.filter(s=>s.final).length,1);for(const s of r.steps){assert.deepEqual(s.codeLines,[view(s).source.line]);assert.equal(p[id].code[s.codeLines[0]-1].trim(),view(s).source.text);}}
  assert.equal(p[3221].complexity.space,'O(1)');assert.equal(p[2617].complexity.time,'O(mn log(m+n))');assert.equal(p[1504].complexity.time,'O(mn)');assert.equal(p[3221].premium,true);
});
test('3221 unit credits, landing owners and grouped hops match independent quadratic path DP',()=>{
  const cases=[[4,5,2,8,9,1,3],[1,5,8],[9,8,7,6],[5,5,5,5],[100000,1,1,1],[1,100000],Array(14).fill(100000)];
  for(let k=0;k<60;k++)cases.push(Array.from({length:2+rand(13)},()=>1+rand(30)));
  for(const a of cases){const r=run(3221,a),last=view(r.steps.at(-1));assert.equal(r.answer,hops(a));assert.equal(last.units.length,a.length-1);for(const s of r.steps){const v=view(s);for(const u of v.units){assert.equal(u.points,Math.max(...a.slice(u.index)));assert.equal(a[u.owner],u.points);assert.ok(u.owner>=u.index);assert.equal(u.after-u.before,u.points);}if(v.locals.answer!==undefined)assert.equal(v.units.reduce((sum,u)=>sum+u.points,0),v.locals.answer);for(const g of v.groups){assert.equal(g.to,g.owner);assert.equal(g.points,(g.to-g.from)*a[g.owner]);}}assert.equal(last.groups.reduce((sum,g)=>sum+g.points,0),r.answer);assert.equal(last.groups[0].from,0);assert.equal(last.groups.at(-1).to,a.length-1);}
});
test('1475 always chooses the first smaller-or-equal price and writes only when the Python subtraction executes',()=>{
  const cases=[[8,4,6,2,3],[1,2,3,4,5],[5,5,5],[10,1,1,6],[7]];for(let k=0;k<60;k++)cases.push(Array.from({length:1+rand(14)},()=>1+rand(20)));
  for(const a of cases){const r=run(1475,a);assert.deepEqual(r.answer,prices(a));let previous;for(const s of r.steps){const v=view(s);for(const d of v.discounts){assert.equal(d.to,a.findIndex((x,j)=>j>d.index&&x<=a[d.index]));assert.equal(d.after,a[d.index]-a[d.to]);}if(v.change?.kind==='write'){const expected=[...previous.locals.answer];expected[v.locals.i]-=v.locals.price;assert.deepEqual(v.locals.answer,expected);}previous=v;}}
});
test('2104 handles negatives, equal extrema and large values without double-counting any subarray',()=>{
  const cases=[[1,2,3],[1,3,3],[4,-2,-3,4,1],[5,5,5],[7],[-1e9,1e9,-1e9],Array(14).fill(1e9)];for(let k=0;k<65;k++)cases.push(Array.from({length:1+rand(14)},()=>rand(15)-7));
  for(const a of cases){const r=run(2104,a),last=view(r.steps.at(-1));assert.equal(r.answer,ranges(a),String(a));for(const phase of ['min','max']){const owned=new Map();for(const row of last.ledger.filter(row=>row.phase===phase)){assert.equal(row.count,(row.index-row.left)*(row.right-row.index));assert.equal(row.value,a[row.index]*row.count);for(let l=row.left+1;l<=row.index;l++)for(let rr=row.index;rr<row.right;rr++){const sub=a.slice(l,rr+1),extreme=phase==='min'?Math.min(...sub):Math.max(...sub);assert.equal(a[row.index],extreme);assert.equal(row.index,a.findLastIndex((x,k)=>k>=l&&k<=rr&&x===extreme));const key=l+':'+rr;assert.ok(!owned.has(key));owned.set(key,row.index);}}assert.equal(owned.size,a.length*(a.length+1)/2);}assert.equal(last.totals.max-last.totals.min,r.answer);assert.ok(r.steps.filter(s=>view(s).returning&&view(s).scope==='contribution').every(s=>!s.final));}
});
test('2617 heaps agree with independent BFS at every settled cell and produce legal shortest parent routes',()=>{
  const cases=[[[3,4,2,1],[4,2,3,1],[2,1,0,0],[2,4,0,0]],[[3,4,2,1],[4,2,1,1],[2,1,1,0],[3,4,1,0]],[[2,1,0],[1,0,0]],[[0]],[[3,0,0,0]],[[0,0],[0,0]]];
  for(let k=0;k<45;k++){const m=1+rand(6),n=1+rand(6),g=Array.from({length:m},()=>Array.from({length:n},()=>rand(m*n)));g.at(-1)[n-1]=0;cases.push(g);}
  for(const g of cases){const r=run(2617,g),expected=visited(g),last=view(r.steps.at(-1));assert.equal(r.answer,expected.at(-1).at(-1));for(const s of r.steps){const v=view(s),x=v.locals;if(v.change?.kind==='push'&&v.change.heap==='col'){const[a,b]=v.change.cell;assert.equal(x.dp[a][b],expected[a][b]);}if(v.change?.kind==='write'&&v.pendingParent)assert.deepEqual(v.path,[]);if(v.proposal){const {from,to,steps}=v.proposal;assert.ok(from[0]===to[0]&&to[1]>from[1]||from[1]===to[1]&&to[0]>from[0]);assert.ok(to[0]-from[0]+to[1]-from[1]<=g[from[0]][from[1]]);assert.equal(steps,x.dp[from[0]][from[1]]);}for(let i=1;i<v.path.length;i++){const[a,b]=v.path[i-1],[c,d]=v.path[i];assert.ok(a===c&&d>b||b===d&&c>a);assert.ok(c-a+d-b<=g[a][b]);assert.deepEqual(x.parent[c][d],[a,b]);}if(v.path.length){assert.deepEqual(v.path[0],[0,0]);const end=v.path.at(-1);assert.equal(v.path.length,x.dp[end[0]][end[1]]);}}
    if(r.answer===-1)assert.deepEqual(last.path,[]);else assert.equal(last.path.length,r.answer);
  }
});
test('2617 expiry uses inclusive reach, allows jumping over zeroes and never treats an unreachable cell as a source',()=>{
  const r=run(2617,[[3,0,0,0]]);assert.equal(r.answer,2);let expired=false;for(const s of run(2617).steps){const v=view(s);if(v.change?.kind==='pop'){expired=true;assert.ok(v.change.entry[1]<(v.change.heap==='row'?v.locals.c:v.locals.r));}if(v.change?.kind==='push')assert.notEqual(v.locals.dp[v.locals.r][v.locals.c],'∞');}assert.ok(expired);
});
test('1504 histogram group sums equal the count of all-one rectangles ending at each cell',()=>{
  const cases=[[[1,0,1],[1,1,0],[1,1,0]],[[0,1,1,0],[0,1,1,1],[1,1,1,0]],[[1,1],[1,1]],[[0,0],[0,0]],[[1]],Array.from({length:6},()=>Array(6).fill(1))];for(let k=0;k<45;k++){const m=1+rand(5),n=1+rand(5);cases.push(Array.from({length:m},()=>Array.from({length:n},()=>rand(2))));}
  for(const g of cases){const r=run(1504,g);assert.equal(r.answer,rectangles(g));let total=0;for(const row of view(r.steps.at(-1)).ledger){assert.equal(row.count,rectangles(g,row.cell));total+=row.count;assert.equal(row.total,total);}for(const s of r.steps){const v=view(s),x=v.locals;if(v.change?.kind==='height'){const[a,b]=v.change.cell;let height=0;for(let r=a;r>=0&&g[r][b];r--)height++;assert.equal(x.heights[b],height);}if(v.change?.kind==='row')assert.equal(x.row_sum,x.stack.reduce((sum,[h,w])=>sum+h*w,0));if(v.source.text==='for r in range(rows):'&&v.branch)assert.deepEqual(v.heightColumns,[]);}}
});
test('all five Python solutions match exhaustive small input enumeration',()=>{
  const source=ids.map(id=>p[id].code.join('\n').replace('class Solution:',`class Solution${id}:`)).join('\n');
  const script=`from itertools import product\n${source}\nfor n in range(1,6):\n for a in product(range(1,4),repeat=n):\n  if n>1:\n   dp=[0]*n\n   for j in range(1,n): dp[j]=max(dp[i]+(j-i)*a[j] for i in range(j))\n   assert Solution3221().maxScore(list(a))==dp[-1]\n  expected=[a[i]-next((a[j] for j in range(i+1,n) if a[j]<=a[i]),0) for i in range(n)]\n  assert Solution1475().finalPrices(list(a))==expected\n  b=[x-2 for x in a]\n  expected=sum(max(b[i:j])-min(b[i:j]) for i in range(n) for j in range(i+1,n+1))\n  assert Solution2104().subArrayRanges(b)==expected\nfor values in product(range(2),repeat=6):\n g=[list(values[:3]),list(values[3:])]\n count=0\n for a in range(2):\n  for b in range(3):\n   for c in range(a,2):\n    for d in range(b,3):\n     count+=all(g[r][s] for r in range(a,c+1) for s in range(b,d+1))\n assert Solution1504().numSubmat(g)==count\nfor a,b,c in product(range(4),repeat=3):\n g=[[a,b],[c,0]]\n d=[[1,float('inf')],[float('inf'),float('inf')]]\n for r in range(2):\n  for col in range(2):\n   for k in range(1,g[r][col]+1):\n    if col+k<2:d[r][col+k]=min(d[r][col+k],d[r][col]+1)\n    if r+k<2:d[r+k][col]=min(d[r+k][col],d[r][col]+1)\n expected=d[-1][-1] if d[-1][-1]!=float('inf') else -1\n assert Solution2617().minimumVisitedCells(g)==expected\nprint('all exhaustive cases passed')`;
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{encoding:'utf8'});assert.equal(ref.status,0,ref.stderr);
});
test('all source lines, locals, suspended frames, branches and returns agree with CPython for five algorithms',()=>{
  const items=ids.map(id=>({code:p[id].code.join('\n'),method:methods[id],args:p[id].liveArgs(p[id].defaultInput)}));
  const script="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(x)) for x in p['items']]))";
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:64e6});assert.equal(ref.status,0,ref.stderr);
  JSON.parse(ref.stdout).forEach((native,i)=>{const r=run(ids[i]);assert.deepEqual(r.answer,native.answer);assert.equal(r.steps.length,native.events.length);native.events.forEach((e,j)=>{const v=view(r.steps[j]);for(const key of ['locals','outer','frames','scope','branch','returning','returned'])assert.deepEqual(v[key],e[key],`${ids[i]}/${j}/${key}`);for(const w of r.steps[j].vars)assert.deepEqual(w.rawValue,e.locals[w.name]);});});
});
test('every preset renders all native frames deterministically in VI and EN without altering captured data',()=>{
  for(const id of ids){const cases=vm.runInContext(`JG_CASES[${id}]`,ui().ctx);for(const [input]of cases){const r=run(id,input),saved=JSON.stringify(r.steps);for(const lang of ['vi','en']){const renderer=ui(lang),first=renderer.render(r.steps[0]);for(const s of r.steps){const html=renderer.render(s);assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object/);assert.ok(html.includes(`data-source-line="${s.codeLines[0]}"`));}assert.equal(renderer.render(r.steps[0]),first);}assert.equal(JSON.stringify(r.steps),saved);}}
});
test('selecting subarray and rectangle witnesses does not mutate Python snapshots',()=>{
  for(const id of [2104,1504]){const s=run(id).steps.findLast(s=>view(s).change?.kind==='write'),saved=JSON.stringify(s),renderer=ui();for(let i=0;i<5;i++)assert.doesNotMatch(renderer.render(s,{pair:[i,i],rectangle:[i,1]}),/undefined|NaN/);assert.equal(JSON.stringify(s),saved);}
});
test('input bounds, sparse values, grid shape, destination zero and immutable live arguments are enforced',()=>{
  for(const id of ids)for(const a of ['',[],[true],[NaN],Array(2),'1,,2'])assert.throws(()=>run(id,a));
  for(const id of [3221,1475,2104])assert.throws(()=>run(id,Array(15).fill(1)));
  assert.throws(()=>run(3221,[1]));assert.throws(()=>run(3221,[1,0]));assert.throws(()=>run(1475,[1001]));assert.throws(()=>run(2104,[1e9+1]));
  for(const id of [1504,2617])for(const g of [[[0],[0,0]],[[true]],Array.from({length:7},()=>[0]),[Array(2)],'1,0;'])assert.throws(()=>run(id,g));
  assert.throws(()=>run(1504,[[2]]));assert.throws(()=>run(2617,[[1]]));assert.throws(()=>run(2617,[[2,0]]));
  for(const id of ids){const a=p[id].liveArgs(p[id].defaultInput)[0],saved=JSON.stringify(a);run(id,a);assert.equal(JSON.stringify(a),saved);assert.deepEqual(p[id].liveArgs(JSON.stringify(a)),[a]);}
});
test('controls navigate to actual source, pop, update and final events and disable missing events',()=>{
  for(const id of ids){const r=run(id),renderer=ui('vi',{steps:r.steps,stepIndex:0,stopPlay(){},renderStep(){}});for(const kind of ['line','write','result',...(id===3221?[]:['pop'])]){renderer.ctx.stepIndex=0;const target=renderer.ctx.jgNext(kind);assert.ok(target>0,`${id}/${kind}`);renderer.ctx.jgGo(target);assert.equal(renderer.ctx.stepIndex,target);}renderer.ctx.stepIndex=r.steps.length-1;for(const kind of ['line','pop','write','result'])assert.equal(renderer.ctx.jgNext(kind),-1);}
});
test('new renderer and styles are lazy and apply only to the five selected lessons',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/renderer-stack-jump-grid|stack-jump-grid\.css/);
  for(const asset of ['renderer-stack-jump-grid.js','stack-jump-grid.css','tree-replay-pictures.css']){const tag=html.split('\n').find(line=>line.includes(asset));for(const id of ids)assert.ok(tag.includes(String(id)));}
});
