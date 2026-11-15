'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const {SUPPORTED:P}=require('../problems');
let seed=952;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
const sum=a=>a.reduce((s,x)=>s+x,0);
function odd(a){let ans=0;for(let l=0;l<a.length;l++)for(let r=l;r<a.length;r++)ans+=sum(a.slice(l,r+1))%2;return ans;}
function even(a,k){let best=-1;function take(i,n,total){if(n===0){if(total%2===0)best=Math.max(best,total);return;}if(a.length-i<n)return;take(i+1,n-1,total+a[i]);take(i+1,n,total);}take(0,k,0);return best;}
function gcd(a,b){return b?gcd(b,a%b):a;}
function connected(a){const seen=new Set();let best=0;for(let i=0;i<a.length;i++){if(seen.has(i))continue;const q=[i];seen.add(i);for(const j of q)for(let k=0;k<a.length;k++)if(!seen.has(k)&&gcd(a[j],a[k])>1){seen.add(k);q.push(k);}best=Math.max(best,q.length);}return best;}
function knight(n,k,r,c){let a=Array.from({length:n},()=>Array(n).fill(0));a[r][c]=1;const layers=[a];for(let t=0;t<k;t++){const b=Array.from({length:n},()=>Array(n).fill(0));for(let i=0;i<n;i++)for(let j=0;j<n;j++)for(const[di,dj]of[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]){const x=i+di,y=j+dj;if(x>=0&&x<n&&y>=0&&y<n)b[x][y]+=a[i][j]/8;}a=b;layers.push(a);}return{answer:sum(a.flat()),layers};}
test('1524 all three approaches agree with exhaustive intervals; DP commits counts before adding them',()=>{
 const arrays=[[1],[2],[1,3,5],[2,4,6],Array(24).fill(1),...Array.from({length:15},()=>Array.from({length:1+rand(10)},()=>1+rand(100)))];
 for(const a of arrays)for(const method of[1,2,3]){const p=P[1524],r=p['builder'+(method===1?'':method)](a);assert.equal(r.answer,odd(a));for(const step of r.steps){const v=step.oddSubarrayPictureView;assert.equal(v.method,method);assert.equal(v.trace.truncated,false);assert.equal(v.source,(method===1?p.code:p['code'+method])[v.line-1].trim());if(method===3)for(const h of v.history){const ranges=a.slice(0,h.index+1).map((_,l)=>sum(a.slice(l,h.index+1)));assert.equal(h.odd,ranges.filter(x=>x%2).length);assert.equal(h.even,ranges.filter(x=>x%2===0).length);if(h.answer!==null)assert.equal(h.answer,odd(a.slice(0,h.index+1)));}}}
 assert.equal(fs.readFileSync(require.resolve('../../Leetcode-sln/dynamic-programming/Leetcode_1524_dp.py'),'utf8').trim(),P[1524].code3.join('\n'));assert.ok(!P[1524].code3.some(s=>s.includes('odd, even = odd,')));
});
test('2098 greedy exchanges match exhaustive subsequences, including zeros, ties and impossibility',()=>{
 const arrays=[[4,2,6,7,8],[5,5,2,4,3],[5,5,1,1,3],[0],[1],[0,1,0],[8,6,4],...Array.from({length:24},()=>Array.from({length:1+rand(8)},()=>rand(12)))];
 for(const a of arrays)for(let k=1;k<=a.length;k++){const r=P[2098].builder(a,{k});assert.equal(r.answer,even(a,k));for(const s of r.steps){const v=s.requestedNodeView;assert.equal(v.trace.truncated,false);for(const swap of v.swaps){if(swap.candidate!==null){assert.equal(swap.candidate%2,0);assert.equal(swap.candidate,v.all.total-swap.remove[1]+swap.add[1]);assert.ok(swap.remove[0]!==swap.add[0]);}}}}
});
test('1524 displayed DP and prefix Python apply modulo for full-sized inputs',()=>{
 for(const code of[P[1524].code2,P[1524].code3]){const source=code.join('\n')+"\nassert Solution().numOfSubarrays([1]*100000)==(50001*50000)%(10**9+7)\nassert Solution().numOfSubarrays([100]*100000)==0";const run=spawnSync('python3',['-c',source],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);}
});
test('952 prime factor unions agree with a pairwise GCD graph; one is isolated',()=>{
 const arrays=[[4,6,15,35],[20,50,9,63],[1],[1,2,3,5],[2,4,8,16],[99991,2,3],...Array.from({length:22},()=>[...new Set(Array.from({length:1+rand(12)},()=>1+rand(150)))])];
 for(const a of arrays){const r=P[952].builder(a);assert.equal(r.answer,connected(a));for(const s of r.steps){const v=s.requestedNodeView;assert.equal(v.trace.truncated,false);for(const e of v.relations){assert.ok(e.factor>1);assert.equal(a[e.index]%e.factor,0);}const p=v.all.parent;if(p){const counts=new Map();for(let i=0;i<p.length;i++){let j=i,hops=0;while(p[j]!==j){j=p[j];assert.ok(hops++<p.length);}counts.set(j,(counts.get(j)??0)+1);}for(const[root,count]of counts)if(v.all.size&&v.source.text!=='parent[b] = a')assert.equal(v.all.size[root],count);}}}
});
test('BST bounds include all ancestors; inorder methods stop at k and accept a zero answer',()=>{
 for(const[input,expected]of[['5,1,7,null,null,4,8',false],['2,2,3',false],['2,1,3',true],['[]',true],['0,-1,1',true]]){const r=P[98].builder(input);assert.equal(r.answer,expected);if(!expected){const v=r.steps.at(-1).requestedNodeView;assert.ok(v.checks.some(c=>!c.pass));}for(const s of r.steps)assert.equal(s.requestedNodeView.trace.truncated,false);}
 const cases=[['5,3,6,2,4,null,null,1',[1,2,3,4,5,6]],['0,-2,3',[-2,0,3]],['1,null,2,null,3',[1,2,3]]];
 for(const[input,sorted]of cases)for(let k=1;k<=sorted.length;k++)for(const method of[1,2]){const r=P[230]['builder'+(method===1?'':method)](input,{k});assert.equal(r.answer,sorted[k-1]);assert.deepEqual(r.steps.at(-1).requestedNodeView.visited.map(n=>n.value),sorted.slice(0,k));}
 for(const[input,expected]of[['3,1,4,3,null,1,5',4],['3,3,null,4,2',3],['-3,-4,-2',2],['1,null,2,null,0',2]])assert.equal(P[1448].builder(input).answer,expected);
 for(const input of['1,null,null,2','1,,2','[true]'])assert.throws(()=>P[98].builder(input));assert.throws(()=>P[230].builder('2,2,3',{k:1}));assert.throws(()=>P[952].builder([2,2]));assert.throws(()=>P[2098].builder([1,2],{k:3}));
});
test('688 every completed probability layer matches an independent DP, with k=0 and off-board mass',()=>{
 for(const[n,k,r,c]of[[3,2,0,0],[1,0,0,0],[1,1,0,0],[5,3,2,2],[8,2,7,7]]){const expected=knight(n,k,r,c),result=P[688].builder([n],{k,row:r,col:c});assert.equal(result.answer,expected.answer);const v=result.steps.at(-1).knightPictureView;assert.equal(v.layers.length,k+1);v.layers.forEach((l,i)=>assert.deepEqual(l.grid,expected.layers[i]));for(const s of result.steps){const v=s.knightPictureView;assert.equal(v.trace.truncated,false);if(v.phase==='write'){const[r,c]=v.destination;assert.ok(r>=0&&r<n&&c>=0&&c<n);}}}
 assert.throws(()=>P[688].builder([3],{k:1,row:3}));assert.throws(()=>P[688].builder([3],{k:-1}));
});
test('new renderers accept immutable native frames in both languages without revealing unknown values',()=>{
 const host={innerHTML:'',dataset:{},querySelector:()=>null,querySelectorAll:()=>[]},context={lang:'vi',document:{getElementById:()=>host},$:()=>host};vm.createContext(context);for(const f of['renderer-requested-node-pictures.js','renderer-odd-subarray-pictures-1524.js','renderer-odd-subarray-alternatives-1524.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+f),'utf8'),context);
 function freeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);Object.values(x).forEach(freeze);}return x;}
 for(const id of[98,230,1448,2098,952,688,1524])for(const method of id===1524?[1,2,3]:id===230?[1,2]:[1]){const p=P[id],r=freeze(p['builder'+(method===1?'':method)](p.defaultInput,{k:id===688?2:3})),before=JSON.stringify(r);context.steps=r.steps;for(const locale of['vi','en']){context.lang=locale;r.steps.forEach((s,i)=>{context.stepIndex=i;if(id===1524)context.renderOddSubarrayPictures1524(s);else context.renderRequestedNodePictures(s);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);});}assert.equal(JSON.stringify(r),before);}
});
