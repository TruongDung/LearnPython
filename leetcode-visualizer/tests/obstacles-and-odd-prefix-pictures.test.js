'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const {SUPPORTED:P}=require('../problems'),build=(id,input=P[id].defaultInput)=>id===1524?P[id].builder2(input,{}):P[id].builder(input,{});
function paths(grid){const found=[],route=[];function walk(r,c){if(grid[r][c])return;route.push([r,c]);if(r===grid.length-1&&c===grid[0].length-1)found.push(route.map(x=>[...x]));else{if(r+1<grid.length)walk(r+1,c);if(c+1<grid[0].length)walk(r,c+1);}route.pop();}walk(0,0);return found;}
function oddRanges(nums){const ranges=[];for(let l=0;l<nums.length;l++){let sum=0;for(let r=l;r<nums.length;r++){sum+=nums[r];if(sum%2)ranges.push({start:l,end:r+1,sum});}}return ranges;}
let seed=1524;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
const grids=[[[0,0,0],[0,1,0],[0,0,0]],[[0]],[[1]],[[1,0],[0,0]],[[0,0],[0,1]],[[0,1,0,0]],[[0],[1],[0]],[[0,1],[1,0]],Array.from({length:6},()=>Array(6).fill(0)),Array.from({length:6},()=>Array(6).fill(1))];
for(let i=0;i<18;i++){const m=1+rand(4),n=1+rand(4);grids.push(Array.from({length:m},()=>Array.from({length:n},()=>rand(4)===0?1:0)));}
const arrays=[[1,3,5],[2,4,6],[1,2,3,4,5,6,7],[1],[100],[100,99,100,99],Array(24).fill(1),Array(24).fill(100),...Array.from({length:18},()=>Array.from({length:1+rand(12)},()=>1+rand(100)))];
test('63 counts and every completed DP prefix agree with exhaustive obstacle-avoiding routes',()=>{
 for(const grid of grids){const r=build(63,grid),expected=paths(grid);assert.equal(r.answer,expected.length);const v=r.steps.at(-1).gridPathPictureView;assert.deepEqual(v.paths,expected);assert.equal(v.writes.length,grid.length*grid[0].length);assert.equal(new Set(v.writes.map(w=>w.cell.join(':'))).size,v.writes.length);
  for(const step of r.steps){const v=step.gridPathPictureView;assert.equal(v.source,P[63].code[v.line-1].trim());assert.equal(v.trace.truncated,false);if(v.counts)for(let a=0;a<v.rows;a++)for(let b=0;b<v.cols;b++){const value=v.counts[a][b][0];assert.equal(value===null,!v.known[a][b][0]);if(value!==null)assert.equal(value,paths(grid.slice(0,a+1).map(row=>row.slice(0,b+1))).length);}if(v.phase==='write'){const[a,b]=v.active;if(grid[a][b]){assert.equal(v.counts[a][b][0],0);assert.equal(v.neighbors.length,0);}else if(a||b)assert.equal(v.counts[a][b][0],v.neighbors.reduce((sum,n)=>sum+n.value,0));else assert.equal(v.counts[0][0][0],1);}}
 }
});
test('1524 reveals, counts and registers each prefix in the actual Python statement order',()=>{
 for(const nums of arrays){const r=build(1524,nums);assert.equal(r.answer,oddRanges(nums).length);for(const step of r.steps){const v=step.oddSubarrayPictureView;assert.equal(v.source,P[1524].code2[v.line-1].trim());assert.equal(v.trace.truncated,false);for(const p of v.registered){assert.equal(p.sum,nums.slice(0,p.index).reduce((a,b)=>a+b,0));assert.equal(p.parity,p.sum%2);}if(v.even!==null){assert.equal(v.even,v.registered.filter(p=>!p.parity).length);assert.equal(v.odd,v.registered.filter(p=>p.parity).length);}if(v.total!==null)assert.equal(v.total,v.ends.reduce((sum,e)=>sum+e.count,0));if(v.current){assert.equal(v.current.sum,nums.slice(0,v.current.index).reduce((a,b)=>a+b,0));assert.deepEqual(v.matches,v.registered.filter(p=>p.index<v.current.index&&p.parity!==v.current.parity).map(p=>p.index));}if(v.phase==='count'){assert.ok([10,13].includes(v.line));assert.equal(v.added,v.matches.length);assert.ok(!v.registered.some(p=>p.index===v.current.index));}if(v.phase==='register')assert.equal(v.registered.at(-1).index,v.current.index);}
  const v=r.steps.at(-1).oddSubarrayPictureView;assert.equal(v.even*v.odd,r.answer);assert.equal(v.registered.length,nums.length+1);assert.equal(v.ends.length,nums.length);assert.deepEqual(v.registered[0],{index:0,sum:0,parity:0});
 }
});
test('1524 prefix-pair explorer represents each odd subarray once, with correct bounds and sums',()=>{
 const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-odd-subarray-pictures-1524.js'),'utf8'),ctx);
 for(const nums of arrays){const v=build(1524,nums).steps.at(-1).oddSubarrayPictureView,pairs=[];for(const e of v.registered.filter(p=>!p.parity))for(const o of v.registered.filter(p=>p.parity)){const start=Math.min(e.index,o.index),end=Math.max(e.index,o.index),scene=ctx.opScene(v,end,start);assert.equal(scene.start.index,start);assert.equal(scene.end,end);assert.equal(scene.sum,nums.slice(start,end).reduce((a,b)=>a+b,0));assert.equal(scene.sum%2,1);pairs.push(`${start}:${end}`);}assert.equal(new Set(pairs).size,v.answer);assert.deepEqual(pairs.sort(),oddRanges(nums).map(p=>`${p.start}:${p.end}`).sort());}
});
test('both renderers accept every immutable native frame in VI and EN',()=>{
 const host={innerHTML:'',dataset:{},querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang:'vi',$:()=>host};vm.createContext(ctx);for(const file of['renderer-grid-path-pictures.js','renderer-odd-subarray-pictures-1524.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);
 function freeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);Object.values(x).forEach(freeze);}return x;}
 for(const[id,inputs]of[[63,grids.slice(0,10)],[1524,arrays.slice(0,8)]])for(const input of inputs){const r=freeze(build(id,input)),before=JSON.stringify(r);ctx.steps=r.steps;for(const locale of['vi','en']){ctx.lang=locale;r.steps.forEach((step,i)=>{ctx.stepIndex=i;if(id===63)ctx.renderGridPathPictures(step);else ctx.renderOddSubarrayPictures1524(step);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);});}assert.equal(JSON.stringify(r),before);}
});
test('Python solution files match the displayed code and support full-sized counts and modulo arithmetic',()=>{
 const code={};for(const id of[63,1524]){code[id]=(id===1524?P[id].code2:P[id].code).join('\n');assert.equal(fs.readFileSync(require.resolve('../../Leetcode-sln/dynamic-programming/Leetcode_'+id+(id===1524?'_prefix':'')+'.py'),'utf8').trim(),code[id]);}
 const script="import json,sys,math\np=json.load(sys.stdin)\nns={};exec(p['63'],ns);assert ns['Solution']().uniquePathsWithObstacles([[0]*100 for _ in range(100)])==math.comb(198,99)\nassert ns['Solution']().uniquePathsWithObstacles([[1]])==0\nns={};exec(p['1524'],ns);assert ns['Solution']().numOfSubarrays([1]*100000)==(50001*50000)%(10**9+7)\nassert ns['Solution']().numOfSubarrays([100]*100000)==0";
 const out=spawnSync('python3',['-c',script],{input:JSON.stringify(code),encoding:'utf8'});assert.equal(out.status,0,out.stderr);
 assert.deepEqual(P[63].liveArgs('0,0;1,0'),[[[0,0],[1,0]]]);assert.deepEqual(P[1524].liveArgs('1,3,5'),[[1,3,5]]);
});
test('binary obstacle grids and positive odd-sum inputs reject malformed or oversized examples',()=>{
 for(const input of[[],[[2]],[[true]],[[0],[0,1]],'0,,1',Array.from({length:7},()=>[0])])assert.throws(()=>build(63,input),/63/);
 for(const input of[[],[0],[-1],[101],[1.5],Array(25).fill(1),'1,,3'])assert.throws(()=>build(1524,input),/1524/);
 assert.equal(build(63,'0,0,0|0,1,0|0,0,0').answer,2);assert.equal(build(63,'[[0]]').answer,1);
});
