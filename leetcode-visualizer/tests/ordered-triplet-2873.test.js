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
 assert.match(problem.code2.join('\n'),/prefix\[j-1\]/);assert.match(problem.code2.join('\n'),/suffix\[j\+1\]/);assert.match(problem.code3.join('\n'),/result = max\(result, max_diff \* num\)/);
});

test('2873 three algorithms agree with brute-force oracle including ordered-index traps and ties',()=>{
 const cases=[[12,6,1,2,7],[1,10,3,4,19],[1,2,3],[3,3,3],[1e6,1,1e6],[9,8,7,6],[5,1,5,1,5],[2,9,1,10],[1,100,99],[10,1,2]];
 let seed=2873;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};for(let sample=0;sample<25;sample++)cases.push(Array.from({length:3+rand(10)},()=>1+rand(1e6)));
 for(const nums of cases)for(let method=1;method<=3;method++){const original=JSON.stringify(nums),result=build(nums,method);assert.equal(result.answer,oracle(nums));assert.equal(JSON.stringify(nums),original);witness(nums,result);assert.equal(result.steps.filter(s=>s.final).length,1);}
});

test('2873 prefix/suffix store real values, start at zero and exclude the middle index',()=>{
 const nums=[12,6,1,2,7],result=build(nums,2);
 for(const s of result.steps){
  const v=s.orderedTriplet2873View;
  assert.equal(v.left,null);assert.equal(v.right,null);
  if(v.prefix)for(let p=0;p<v.prefix.length;p++)if(v.prefix[p]!==0)assert.equal(v.prefix[p],Math.max(...nums.slice(0,p+1)));
  if(v.suffix)for(let p=0;p<v.suffix.length;p++)if(v.suffix[p]!==0)assert.equal(v.suffix[p],Math.max(...nums.slice(p)));
  if(v.trial){const[i,j,k]=v.trial.ids;assert.equal(nums[i],v.prefix[j-1]);assert.equal(nums[k],v.suffix[j+1]);assert.equal(v.trial.value,(v.prefix[j-1]-nums[j])*v.suffix[j+1]);}
  assert.deepEqual(s.vars.map(w=>w.name),['n','i','j','value','result','prefix','suffix']);
  const watched=Object.fromEntries(s.vars.map(w=>[w.name,w.value]));
  assert.equal(watched.result,v.answer??'—');
  if(v.prefix)assert.deepEqual(watched.prefix,v.prefix);
  if(v.suffix)assert.deepEqual(watched.suffix,v.suffix);
 }
 assert.deepEqual(result.steps.find(s=>s.orderedTriplet2873View.source==='prefix = [0] * n').orderedTriplet2873View.prefix,[0,0,0,0,0]);
 assert.deepEqual(result.steps.find(s=>s.orderedTriplet2873View.source==='prefix[0] = nums[0]').orderedTriplet2873View.prefix,[12,0,0,0,0]);
 assert.deepEqual(result.steps.find(s=>s.orderedTriplet2873View.source==='suffix[n-1] = nums[n-1]').orderedTriplet2873View.suffix,[0,0,0,0,7]);
 assert.deepEqual(result.steps.at(-1).orderedTriplet2873View.prefix,[12,12,12,12,12]);
 assert.deepEqual(result.steps.at(-1).orderedTriplet2873View.suffix,[12,7,7,7,7]);
});

test('2873 method 2 preserves the requested typed Python, result updates and inferred witnesses',()=>{
 const requested=`class Solution:
    def maximumTripletValue(self, nums: List[int]) -> int:
        n = len(nums)

        prefix = [0] * n
        suffix = [0] * n

        prefix[0] = nums[0]
        for i in range(1, n):
            prefix[i] = max(prefix[i-1], nums[i])

        suffix[n-1] = nums[n-1]
        for i in range(n-2, -1, -1):
            suffix[i] = max(suffix[i+1], nums[i])

        result = 0

        for j in range(1, n-1):
            value = (prefix[j-1] - nums[j]) * suffix[j+1]
            result = max(result, value)

        return result`;
 assert.equal(problem.code2.join('\n'),'from typing import List\n\n'+requested);
 const nums=[1,10,3,4,19],result=build(nums,2);
 let maximum=0;
 for(const s of result.steps){const v=s.orderedTriplet2873View;if(v.source==='value = (prefix[j-1] - nums[j]) * suffix[j+1]')assert.equal(v.answer,maximum);if(v.source==='result = max(result, value)'){maximum=Math.max(maximum,v.trial.value);assert.equal(v.answer,maximum);}}
 assert.equal(maximum,133);assert.deepEqual(result.steps.at(-1).orderedTriplet2873View.best,[1,2,4]);
 const final=result.steps.at(-1);assert.equal(final.vars.find(w=>w.name==='i').value,0);assert.equal(final.vars.some(w=>w.name==='k'||w.name==='best'||w.name==='answer'),false);
});

test('2873 method 3 preserves the requested typed greedy source',()=>{
 const requested=`class Solution:
    def maximumTripletValue(self, nums: List[int]) -> int:
        max_i = 0
        max_diff = 0
        result = 0

        for num in nums:
            result = max(result, max_diff * num)
            max_diff = max(max_diff, max_i - num)
            max_i = max(max_i, num)

        return result`;
 assert.equal(problem.code3.join('\n'),'from typing import List\n\n'+requested);
});

test('2873 greedy line states match earlier maxima, ordered pairs and triplets without invented Python locals',()=>{
 const diff=values=>{let maximum=0;for(let i=0;i<values.length;i++)for(let j=i+1;j<values.length;j++)maximum=Math.max(maximum,values[i]-values[j]);return maximum;};
 for(const nums of [[1,10,3,4,19],[12,6,1,2,7],[9,8,7,6],[1,2,3],[5,1,5,1,5]]){
  const run=build(nums,3);let position=-1;
  for(const step of run.steps){
   const v=step.orderedTriplet2873View,watch=Object.fromEntries(step.vars.map(w=>[w.name,w.value]));
   assert.deepEqual(Object.keys(watch),['num','max_i','max_diff','result']);
   assert.deepEqual(watch,{num:v.num??'—',max_i:v.maxI??'—',max_diff:v.maxDiff??'—',result:v.answer??'—'});
   if(v.source==='for num in nums:'&&v.branch){position++;assert.equal(v.num,nums[position]);assert.equal(v.scanIndex,position);}
   if(v.source==='result = max(result, max_diff * num)'){
    assert.equal(v.maxI,Math.max(0,...nums.slice(0,position)));
    assert.equal(v.maxDiff,diff(nums.slice(0,position)));
    assert.equal(v.answer,oracle(nums.slice(0,position+1)));
    assert.equal(v.operation.before,oracle(nums.slice(0,position)));
    assert.equal(v.operation.left,v.maxDiff);assert.equal(v.operation.right,v.num);
    if(position<2)assert.equal(v.trial,null);
    if(v.trial){const[i,j,k]=v.trial.ids;assert.ok(i<j&&j<k);assert.equal(k,position);assert.equal(v.trial.value,v.maxDiff*v.num);}
   }
   if(v.source==='max_diff = max(max_diff, max_i - num)'){
    assert.equal(v.maxI,Math.max(0,...nums.slice(0,position)));
    assert.equal(v.maxDiff,diff(nums.slice(0,position+1)));
    assert.equal(v.operation.before,diff(nums.slice(0,position)));
    assert.equal(v.operation.after,v.maxDiff);
   }
   if(v.source==='max_i = max(max_i, num)'){
    assert.equal(v.maxI,Math.max(...nums.slice(0,position+1)));
    assert.equal(v.maxDiff,diff(nums.slice(0,position+1)));
    assert.equal(nums[v.maxIndex],v.maxI);
   }
   assert.equal(v.left,null);assert.equal(v.right,null);assert.equal(v.prefix,null);assert.equal(v.suffix,null);
  }
  assert.equal(position,nums.length-1);witness(nums,run);
 }
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
 for(const lang of ['vi','en'])for(let method=1;method<=3;method++){context.lang=lang;const result=build([12,6,1,2,7],method);for(const s of [result.steps[0],result.steps.find(s=>s.orderedTriplet2873View.trial),result.steps.at(-1)]){context.renderOrderedTriplet2873View(s);assert.equal((host.innerHTML.match(/data-pd-method=/g)||[]).length,3);assert.equal((host.innerHTML.match(/data-num-index=/g)||[]).length,5);assert.doesNotMatch(host.innerHTML,/undefined|NaN/);}assert.match(host.innerHTML,/data-triplet-answer="77"/);assert.match(host.innerHTML,/data-triplet-value="77"/);assert.match(host.innerHTML,/i = 0/);assert.match(host.innerHTML,/j = 2/);assert.match(host.innerHTML,/k = 4/);if(method===2)assert.match(host.innerHTML,/Prefix Maximum/);if(method===3){assert.equal((host.innerHTML.match(/data-greedy-state=/g)||[]).length,3);assert.match(host.innerHTML,/data-greedy-name="max_i" data-greedy-value="12"/);assert.match(host.innerHTML,/data-greedy-name="max_diff" data-greedy-value="11"/);assert.match(host.innerHTML,/data-greedy-name="result" data-greedy-value="77"/);}}
 context.renderOrderedTriplet2873View(build([1,2,3],3).steps.at(-1));assert.match(host.innerHTML,/data-triplet-answer="0"/);assert.doesNotMatch(host.innerHTML,/data-triplet-value=/);
});
