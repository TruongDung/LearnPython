'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const problem=require('../problems').SUPPORTED[2873];
const build=(nums,method)=>problem[method===1?'builder':`builder${method}`](nums);
function oracle(nums){let best=0;for(let i=0;i<nums.length-2;i++)for(let j=i+1;j<nums.length-1;j++)for(let k=j+1;k<nums.length;k++)best=Math.max(best,(nums[i]-nums[j])*nums[k]);return best;}
function witness(nums,result){const v=result.steps.at(-1).orderedTriplet2873View;assert.equal(v.answer,result.answer);if(result.answer===0){assert.equal(v.best,null);assert.equal(v.trial,null);return;}const[i,j,k]=v.best;assert.ok(i<j&&j<k);assert.equal((nums[i]-nums[j])*nums[k],result.answer);assert.deepEqual(v.trial,{ids:v.best,value:result.answer});}

test('2873 offers exactly three requested approaches with matching complexity and greedy default',()=>{
 const selector=problem.extraParams.find(p=>p.key==='approach');assert.deepEqual(selector.options.map(o=>Number(o.value)),[1,2,3]);assert.equal(Number(selector.default),3);
 const expected=[['O(N³)','O(1)'],['O(N)','O(N)'],['O(N)','O(1)']];
 for(let method=1;method<=3;method++){const suffix=method===1?'':method;assert.deepEqual([problem[`complexity${suffix}`].time,problem[`complexity${suffix}`].space],expected[method-1]);assert.ok(problem[`code${suffix}`].length);assert.equal(typeof problem[`builder${suffix}`],'function');}
 assert.equal(problem.code4,undefined);assert.equal(problem.code5,undefined);assert.equal(problem.builder4,undefined);assert.equal(problem.builder5,undefined);
 assert.match(problem.code2.join('\n'),/left\[j - 1\]/);assert.match(problem.code2.join('\n'),/right\[j \+ 1\]/);assert.match(problem.code3.join('\n'),/value = diff \* nums\[k\]/);
});

test('2873 three algorithms agree with brute-force oracle including ordered-index traps and ties',()=>{
 const cases=[[12,6,1,2,7],[1,10,3,4,19],[1,2,3],[3,3,3],[1e6,1,1e6],[9,8,7,6],[5,1,5,1,5],[2,9,1,10],[1,100,99],[10,1,2]];
 let seed=2873;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};for(let sample=0;sample<25;sample++)cases.push(Array.from({length:3+rand(10)},()=>1+rand(1e6)));
 for(const nums of cases)for(let method=1;method<=3;method++){const original=JSON.stringify(nums),result=build(nums,method);assert.equal(result.answer,oracle(nums));assert.equal(JSON.stringify(nums),original);witness(nums,result);assert.equal(result.steps.filter(s=>s.final).length,1);}
});

test('2873 prefix/suffix indices point to actual maxima and exclude the middle index',()=>{
 const nums=[12,6,1,2,7],result=build(nums,2);
 for(const s of result.steps){const v=s.orderedTriplet2873View;if(v.left)for(let p=0;p<v.left.length;p++){const index=v.left[p];if(index!==null){assert.ok(index<=p);assert.equal(nums[index],Math.max(...nums.slice(0,p+1)));}}if(v.right)for(let p=0;p<v.right.length;p++){const index=v.right[p];if(index!==null){assert.ok(index>=p);assert.equal(nums[index],Math.max(...nums.slice(p)));}}if(v.trial){const[i,j,k]=v.trial.ids;assert.equal(i,v.left[j-1]);assert.equal(k,v.right[j+1]);}}
});

test('2873 greedy uses the earlier pair for multiplication before updating its two constant-size states',()=>{
 const nums=[1,10,3,4,19],result=build(nums,3),source=problem.code3.join('\n');
 assert.ok(source.indexOf('value = diff *')<source.indexOf('if max_value -'));assert.ok(source.indexOf('if max_value -')<source.indexOf('if nums[k] > max_value'));
 for(const s of result.steps){const v=s.orderedTriplet2873View;if(v.source==='value = diff * nums[k]'){assert.ok(v.pair[0]<v.pair[1]&&v.pair[1]<v.k);assert.equal(v.trial.value,v.diff*nums[v.k]);}assert.equal(v.left,null);assert.equal(v.right,null);}
 assert.equal(result.answer,133);
});

test('2873 completes 100-element brute force after a bounded replay and preserves large integer answers',()=>{
 const cases=[Array.from({length:100},(_,i)=>1+(i*7919)%1000000),Array.from({length:100},(_,i)=>i===0?1000000:i===50?1:999999)];
 for(const nums of cases)for(let method=1;method<=3;method++){const result=build(nums,method),v=result.steps.at(-1).orderedTriplet2873View;assert.equal(result.answer,oracle(nums));assert.ok(result.steps.length<=1601);witness(nums,result);if(method===1)assert.equal(v.trace.truncated,true);assert.equal(v.line,problem[method===1?'code':`code${method}`].length);}
 assert.equal(build([1e6,1,1e6],3).answer,999999000000);
});

test('2873 records real line/watch states, accepts 100 values and validates its input',()=>{
 for(let method=1;method<=3;method++)for(const s of build([12,6,1,2,7],method).steps){const v=s.orderedTriplet2873View;assert.equal(s.codeBlock,method);assert.deepEqual(s.codeLines,[v.line]);assert.equal(v.source,problem[method===1?'code':`code${method}`][v.line-1].trim());assert.equal(v.timing,'after');}
 for(const nums of [[1,2],[1,0,3],[1,2,1000001],[1,NaN,3],[1,1.5,3],Array(101).fill(1),Array(3)])assert.throws(()=>build(nums,1),/2873/);
 assert.deepEqual(problem.liveArgs('12,6,1,2,7'),[[12,6,1,2,7]]);
});

test('2873 renderer offers three choices, correct winning bars, prefix regions and greedy states in VI/EN',()=>{
 const host={innerHTML:''},context={lang:'vi',$:()=>host,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-debug-picture-lessons.js'),'utf8'),context);
 for(const lang of ['vi','en'])for(let method=1;method<=3;method++){context.lang=lang;const result=build([12,6,1,2,7],method);for(const s of [result.steps[0],result.steps.find(s=>s.orderedTriplet2873View.trial),result.steps.at(-1)]){context.renderOrderedTriplet2873View(s);assert.equal((host.innerHTML.match(/data-pd-method=/g)||[]).length,3);assert.equal((host.innerHTML.match(/data-num-index=/g)||[]).length,5);assert.doesNotMatch(host.innerHTML,/undefined|NaN/);}assert.match(host.innerHTML,/data-triplet-answer="77"/);assert.match(host.innerHTML,/data-triplet-value="77"/);assert.match(host.innerHTML,/i = 0/);assert.match(host.innerHTML,/j = 2/);assert.match(host.innerHTML,/k = 4/);if(method===2)assert.match(host.innerHTML,/Prefix Maximum/);if(method===3)assert.equal((host.innerHTML.match(/data-greedy-state=/g)||[]).length,3);}
 context.renderOrderedTriplet2873View(build([1,2,3],3).steps.at(-1));assert.match(host.innerHTML,/data-triplet-answer="0"/);assert.doesNotMatch(host.innerHTML,/data-triplet-value=/);
});
