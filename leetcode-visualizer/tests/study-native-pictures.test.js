"use strict";
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const {SUPPORTED:p,TOPOLOGICAL_SORT_SUBTABS}=require('../problems'),ids=[1916,2127,2392,3117,3180,3181,3333,354,121,115];
const run=(id,input=p[id].defaultInput,params={})=>p[id].builder(input,params),last=r=>r.steps.at(-1).studyNativeView,methods=id=>id===121?[1,2,3]:id===354?[1,2]:[1];
let seed=1916;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
function roomOracle(a){const full=(1<<a.length)-1,memo=new Map();const visit=mask=>{if(mask===full)return 1;if(memo.has(mask))return memo.get(mask);let total=0;for(let i=1;i<a.length;i++)if(!(mask>>i&1)&&(mask>>a[i]&1))total+=visit(mask|1<<i);memo.set(mask,total);return total;};return visit(1);}
function invitationOracle(a){for(let count=a.length;count>=2;count--)for(let mask=0;mask<1<<a.length;mask++){const list=a.map((_,i)=>i).filter(i=>mask>>i&1);if(list.length!==count||list.some(i=>!(mask>>a[i]&1)))continue;const visit=order=>{if(order.length===count)return order.every((id,i)=>a[id]===order[(i+1)%count]||a[id]===order[(i+count-1)%count]);for(const id of list)if(!order.includes(id)&&visit([...order,id]))return true;return false;};if(visit([list[0]]))return count;}return 0;}
function partitionOracle(a,targets){let best=Infinity;function visit(start,j,cost){if(j===targets.length){if(start===a.length)best=Math.min(best,cost);return;}let and=-1;for(let end=start;end<a.length;end++){and&=a[end];if(and===targets[j])visit(end+1,j+1,cost+a[end]);}}visit(0,0,0);return best===Infinity?-1:best;}
function rewardsOracle(a){let best=0;const seen=new Set();function visit(mask,total){const key=mask+','+total;if(seen.has(key))return;seen.add(key);best=Math.max(best,total);for(let i=0;i<a.length;i++)if(!(mask>>i&1)&&a[i]>total)visit(mask|1<<i,total+a[i]);}visit(0,0);return best;}
function stringOracle(word,k){const groups=[];for(const c of word){if(groups.at(-1)?.c===c)groups.at(-1).n++;else groups.push({c,n:1});}let answer=0;function visit(i,length){if(i===groups.length){answer+=Number(length>=k);return;}for(let count=1;count<=groups[i].n;count++)visit(i+1,length+count);}visit(0,0);return answer;}
function envelopeOracle(a){const memo=new Map();function visit(i){if(memo.has(i))return memo.get(i);let answer=1;for(let j=0;j<a.length;j++)if(a[j][0]>a[i][0]&&a[j][1]>a[i][1])answer=Math.max(answer,1+visit(j));memo.set(i,answer);return answer;}return Math.max(...a.map((_,i)=>visit(i)));}
function subsequenceOracle(s,t){let answer=0;for(let mask=0;mask<1<<s.length;mask++){let word='';for(let i=0;i<s.length;i++)if(mask>>i&1)word+=s[i];answer+=Number(word===t);}return answer;}
test('ten lessons register native code, selected approaches, actual final results and the two formerly missing topo entries',()=>{
 for(const id of ids){assert.equal(p[id].debugMode,'line-by-line');for(const approach of methods(id)){const r=run(id,undefined,{approach}),v=last(r);assert.equal(v.id,id);assert.equal(v.method,approach);assert.equal(r.steps.filter(s=>s.final).length,1);assert.ok(r.steps.every(s=>s.codeLines.length===1&&s.studyNativeView));assert.deepEqual(v.answer,r.answer);}}
 assert.ok(TOPOLOGICAL_SORT_SUBTABS[0].roster.find(e=>e.id===1916).available);assert.ok(TOPOLOGICAL_SORT_SUBTABS[0].roster.find(e=>e.id===2127).available);
});
test('1916 counts valid parent-before-child permutations, including non-topological room IDs',()=>{
 for(let trial=0;trial<25;trial++){const n=2+random(6),a=[-1,...Array.from({length:n-1},(_,i)=>random(i+1))];const r=run(1916,a);assert.equal(r.answer,roomOracle(a));for(const order of r.witness??[])assert.ok(order.every((id,i)=>id===0||order.indexOf(a[id])<i));}
 assert.equal(run(1916,[-1,2,0]).answer,1);assert.equal(run(1916).answer,6);assert.equal(run(1916,[-1,0,0,0,0]).answer,24);
});
test('2127 matches exhaustive circular seating and its final witness satisfies every favorite',()=>{
 for(let trial=0;trial<25;trial++){const n=2+random(5),a=Array.from({length:n},(_,i)=>{const v=random(n-1);return v>=i?v+1:v;});const r=run(2127,a);assert.equal(r.answer,invitationOracle(a),JSON.stringify(a));assert.equal(r.witness.length,r.answer);assert.equal(new Set(r.witness).size,r.answer);assert.ok(r.witness.every((id,i,order)=>a[id]===order[(i+1)%order.length]||a[id]===order[(i+order.length-1)%order.length]));}
 assert.equal(run(2127,[1,0,3,2]).answer,4);assert.equal(run(2127,[1,0,0,2,1,4]).answer,6);assert.equal(run(2127,[1,2,0]).answer,3);
});
function validMatrix(matrix,k,rows,cols){assert.equal(matrix.length,k);assert.ok(matrix.every(row=>row.length===k));const pos=new Map();for(let r=0;r<k;r++)for(let c=0;c<k;c++)if(matrix[r][c]){assert.ok(!pos.has(matrix[r][c]));pos.set(matrix[r][c],[r,c]);}assert.equal(pos.size,k);for(let v=1;v<=k;v++)assert.ok(pos.has(v));for(const [a,b]of rows)assert.ok(pos.get(a)[0]<pos.get(b)[0]);for(const [a,b]of cols)assert.ok(pos.get(a)[1]<pos.get(b)[1]);}
test('2392 respects independent orders, duplicate conditions, missing constraints and cycles on either axis',()=>{
 for(const [k,rowConditions,colConditions]of[[3,[[1,2],[3,2]],[[2,1],[3,2]]],[4,[],[]],[3,[[1,2],[1,2],[2,3]],[[3,1]]]]){const r=run(2392,[k],{rowConditions:JSON.stringify(rowConditions),colConditions:JSON.stringify(colConditions)});validMatrix(r.answer,k,rowConditions,colConditions);const placed=r.steps.filter(s=>s.studyNativeView.change?.kind==='place');assert.equal(placed.length,k);for(const s of placed){const v=s.studyNativeView;assert.equal(v.locals.matrix[v.change.row][v.change.col],v.change.value);}}
 for(const [r,c]of[[[[1,2],[2,1]],[]],[[],[[1,2],[2,1]]]])assert.deepEqual(run(2392,[3],{rowConditions:JSON.stringify(r),colConditions:JSON.stringify(c)}).answer,[]);
});
test('3117 agrees with exhaustive contiguous cuts; native reconstructed segments have the exact AND and last-value cost',()=>{
 for(let trial=0;trial<35;trial++){const a=Array.from({length:1+random(7)},()=>random(8)),m=1+random(Math.min(4,a.length)),targets=Array.from({length:m},()=>random(8)),r=run(3117,a,{andValues:targets});assert.equal(r.answer,partitionOracle(a,targets));if(r.answer!==-1){const segments=last(r).locals.segments;assert.equal(segments.length,m);assert.equal(segments[0][0],0);assert.equal(segments.at(-1)[1],a.length-1);let sum=0;segments.forEach(([start,end],j)=>{assert.equal(a.slice(start,end+1).reduce((x,y)=>x&y,-1),targets[j]);if(j)assert.equal(start,segments[j-1][1]+1);sum+=a[end];});assert.equal(sum,r.answer);}}
 assert.equal(run(3117,[2,3,5,7,7,7,5],{andValues:[0,7,5]}).answer,17);assert.equal(run(3117,[7,7,7],{andValues:[7,7]}).answer,14);
});
test('3180 and 3181 match exhaustive reward choices, including duplicates and the strict sum < reward boundary',()=>{
 for(let trial=0;trial<30;trial++){const a=Array.from({length:1+random(7)},()=>1+random(12)),expected=rewardsOracle(a);for(const id of[3180,3181])assert.equal(run(id,a).answer,expected);}
 for(const id of[3180,3181]){assert.equal(run(id,[1,1,3,3]).answer,4);assert.equal(run(id,[1,2,4,8]).answer,15);}
});
test('3333 matches enumeration of each run length, with early returns and prefix-sum transitions',()=>{
 for(let trial=0;trial<30;trial++){let word='';for(let g=0;g<1+random(4);g++)word+=String.fromCharCode(97+g).repeat(1+random(3));const k=1+random(Math.min(24,word.length));assert.equal(run(3333,word,{k}).answer,stringOracle(word,k));}
 for(const s of run(3333).steps){const v=s.studyNativeView,x=v.locals;if(v.source.text.startsWith('new_dp[j] ='))assert.equal(x.new_dp[x.j],(x.prefix[x.j]-x.prefix[x.left]+1000000007)%1000000007);}
 assert.equal(run(3333,'abcd',{k:3}).answer,1);
});
test('354 preserves equal-width descending ties and returns an actual strictly nested witness for both approaches',()=>{
 for(let trial=0;trial<25;trial++){const a=Array.from({length:1+random(7)},()=>[1+random(8),1+random(8)]),expected=envelopeOracle(a);for(const approach of[1,2]){const r=run(354,JSON.stringify(a),{approach});assert.equal(r.answer,expected);assert.equal(r.witness.length,expected);assert.ok(r.witness.every((p,i)=>!i||p[0]>r.witness[i-1][0]&&p[1]>r.witness[i-1][1]));}}
 for(const approach of[1,2])assert.equal(run(354,'2,3;2,4;2,5',{approach}).answer,1);
});
test('121 all three approaches match every buy-before-sell pair, and displayed witness days are valid',()=>{
 for(let trial=0;trial<35;trial++){const a=Array.from({length:1+random(12)},()=>random(30));let best=0;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)best=Math.max(best,a[j]-a[i]);for(const approach of[1,2,3]){const r=run(121,a,{approach}),v=last(r);assert.equal(r.answer,best);if(best){assert.ok(v.bestBuy<v.bestSell);assert.equal(a[v.bestSell]-a[v.bestBuy],best);}}}
});
test('115 matches enumeration of index subsequences, including empty strings and repeated letters',()=>{
 for(let trial=0;trial<40;trial++){const s=Array.from({length:random(9)},()=>String.fromCharCode(97+random(3))).join(''),t=Array.from({length:random(5)},()=>String.fromCharCode(97+random(3))).join('');assert.equal(run(115,s,{t}).answer,subsequenceOracle(s,t));}
 assert.equal(p[115].extraParams.find(param=>param.key==='t').allowEmpty,true);for(const [s,t] of [['rabbbit','rabbit'],['babgbag','bag'],['abc',''],['abc','z']]){const r=run(115,s,{t});assert.equal(r.witness.length,Math.min(8,r.answer));for(const indices of r.witness){assert.equal(indices.map(i=>s[i]).join(''),t);assert.ok(indices.every((value,i)=>!i||value>indices[i-1]));}}assert.equal(run(115,'',{t:''}).answer,1);assert.equal(run(115,'aaa',{t:'aa'}).answer,3);
});
test('every native statement, variable, branch and frame matches CPython for all 13 algorithm variants',()=>{
 const cases=[];for(const id of ids)for(const approach of methods(id)){const code=p[id][approach===1?'code':'code'+approach],args=p[id].liveArgs(p[id].defaultInput),summarizeLocals=id===3117?{nums:0,andValues:0,choice:0}:id===2392?{graph:0,conditions:0,rowConditions:0,colConditions:0}:id===1916?{children:0}:{};cases.push({id,approach,payload:{code:code.join('\n'),method:code.find(s=>/^    def /.test(s)).match(/def (\w+)/)[1],args,maxEvents:[3117,115].includes(id)?800:1600,summarizeLocals}});}
 const script="import sys,json,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(c['payload'])) for c in p['cases']]))",ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),cases}),encoding:'utf8',maxBuffer:40e6});assert.equal(ref.status,0,ref.stderr);
 JSON.parse(ref.stdout).forEach((native,i)=>{const {id,approach}=cases[i],r=run(id,undefined,{approach});assert.deepEqual(r.answer,native.answer);assert.equal(r.steps.length,native.events.length);native.events.forEach((e,j)=>{const s=r.steps[j],v=s.studyNativeView;assert.equal(s.codeBlock,approach);assert.deepEqual(s.codeLines,[e.line]);for(const key of['locals','outer','frames','scope','branch','returned','returning'])assert.deepEqual(v[key],e[key],`${id}/${approach}/${j}/${key}`);for(const w of s.vars)assert.deepEqual(w.rawValue,e.locals[w.name]);});});
});
test('large room/employee inputs avoid recursion, preserve full answers, and disclose condensed replay',()=>{
 const n=100000,chain=[-1,...Array.from({length:n-1},(_,i)=>i)],star=[-1,...Array(n-1).fill(0)];assert.equal(run(1916,chain).answer,1);let expected=1n;for(let i=1n;i<BigInt(n);i++)expected=expected*i%1000000007n;const r=run(1916,star);assert.equal(r.answer,Number(expected));assert.equal(last(r).trace.truncated,true);assert.ok(last(r).model.cropped);
 const a=Array.from({length:n},(_,i)=>i===0?1:i===1?0:i-1),meeting=run(2127,a);assert.equal(meeting.answer,n);assert.ok(last(meeting).trace.truncated);assert.equal(meeting.witness,null);
});
test('bounded DFS and larger tables still return complete results and validated reconstructions',()=>{
 const r=run(3117,Array(32).fill(1),{andValues:Array(10).fill(1)});assert.equal(r.answer,10);assert.equal(last(r).locals.segments.length,10);assert.ok(last(r).trace.truncated);
 assert.equal(run(115,'a'.repeat(32),{t:'a'.repeat(16)}).answer,601080390);
});
test('invalid dependency trees, favorites, matrices, envelopes, strings and empty price arrays are rejected',()=>{
 for(const a of[[],[0,0],[-1,2,1],[-1,0,-1],[-1,1]])assert.throws(()=>run(1916,a));for(const a of[[0],[0,0],[1,3]])assert.throws(()=>run(2127,a));assert.throws(()=>run(2392,[8]));assert.throws(()=>run(354,'1,0'));assert.throws(()=>run(121,[]));assert.throws(()=>run(115,'a'.repeat(33),{t:'a'}));
});
function renderer(lang,extra={}){const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang,document:{getElementById:()=>host},...extra};vm.createContext(ctx);for(const file of['renderer-tree-replay-pictures.js','renderer-study-native-pictures.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);return {ctx,render:s=>{ctx.renderStudyNativePictures(s);return host.innerHTML;}};}
test('all frames render in both themes/languages without invented values and rewind deterministically',()=>{
 for(const id of ids)for(const approach of methods(id)){const r=run(id,undefined,{approach}),saved=JSON.stringify(r.steps[0]);for(const lang of['vi','en']){const ui=renderer(lang),first=ui.render(r.steps[0]);for(const s of r.steps){const v=s.studyNativeView,html=ui.render(s);assert.doesNotMatch(html,/undefined|NaN|Infinity/);assert.ok(html.includes(`data-problem-id="${id}"`));assert.ok(html.includes(`data-source-line="${v.source.line}"`));}assert.equal(ui.render(r.steps[0]),first);}assert.equal(JSON.stringify(r.steps[0]),saved);}
});
test('keyboard and jump controls land on an actual statement/update/return',()=>{
 for(const id of ids){const r=run(id);for(const kind of['step','update','result']){const ui=renderer('vi',{steps:r.steps,stepIndex:0,renderStep(){},stopPlay(){}});ui.ctx.snJump(kind);assert.ok(ui.ctx.stepIndex>0);if(kind==='result')assert.equal(r.steps[ui.ctx.stepIndex].final,true);}}
});
