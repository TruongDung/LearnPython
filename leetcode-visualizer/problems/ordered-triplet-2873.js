'use strict';
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const make=(vi,en,time,space,body,typed=false)=>({label:bi(vi,en),time,space,
 code:((typed?'from typing import List\n\nclass Solution:\n    def maximumTripletValue(self, nums: List[int]) -> int:\n'
  :'class Solution:\n    def maximumTripletValue(self, nums):\n')+body).split('\n')});
const methods=[
make('Brute Force – 3 vòng lặp','Brute force – three loops','O(N³)','O(1)',`        answer = 0
        best = None
        for i in range(len(nums) - 2):
            for j in range(i + 1, len(nums) - 1):
                for k in range(j + 1, len(nums)):
                    value = (nums[i] - nums[j]) * nums[k]
                    if value > answer:
                        answer = value
                        best = [i, j, k]
        return answer`),
make('Prefix Maximum + Suffix Maximum','Prefix Maximum + Suffix Maximum','O(N)','O(N)',`        n = len(nums)

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

        return result`,true),
make('One Pass – Greedy','One Pass – Greedy','O(N)','O(1)',`        max_i = 0
        max_diff = 0
        result = 0

        for num in nums:
            result = max(result, max_diff * num)
            max_diff = max(max_diff, max_i - num)
            max_i = max(max_i, num)

        return result`,true)
];
function parse(input){const nums=Array.isArray(input)?input:typeof input==='string'&&input.trim()?input.split(',').map(s=>s.trim()?Number(s):NaN):null;if(!Array.isArray(nums)||nums.length<3||nums.length>100||Array.from(nums).some(v=>!Number.isInteger(v)||v<1||v>1e6))throw new RangeError('2873: enter 3–100 integers from 1 to 1000000.');return[...nums];}
function build(input,params={},method=1){
 const nums=parse(input),definition=methods[method-1];
 const trace=runTrace({code:definition.code.join('\n'),method:'maximumTripletValue',args:[nums],maxEvents:1600});
 let trial=null,illustratedBest=null,previousResult=0;
 let scanIndex=-1,maxIndex=null,pair=null,previousMax=0,previousDiff=0,operation=null;
 // These origins label the illustration only; the Python arrays contain maximum values.
 const prefixOrigins=[],suffixOrigins=[];
 if(method===2){
  let max=0;
  for(let index=0;index<nums.length;index++){if(nums[index]>nums[max])max=index;prefixOrigins[index]=max;}
  max=nums.length-1;
  for(let index=nums.length-1;index>=0;index--){if(nums[index]>=nums[max])max=index;suffixOrigins[index]=max;}
 }
 const steps=trace.events.map((record,index)=>{
  const r=record.outer,source=definition.code[record.line-1].trim(),final=index===trace.events.length-1;
  const answer=method!==1?r.result??null:r.answer??null;
  if(source.startsWith('for ')&&record.branch)trial=null;
  if(method===3&&source==='for num in nums:'){
   if(record.branch)scanIndex++;
   operation=null;
  }
  if(source.startsWith('value =')){
   const ids=method===2?[prefixOrigins[r.j-1],r.j,suffixOrigins[r.j+1]]:[r.i,r.j,r.k];
   trial={ids,value:r.value};
  }
  if(method===2&&source==='result = max(result, value)'){
   if(r.result>previousResult)illustratedBest=[...trial.ids];
   previousResult=r.result;
  }
  // Only the actual Python values are watched. Indices are retained for the picture, outside the solution.
  if(method===3){
   if(source==='result = max(result, max_diff * num)'){
    const product=r.max_diff*r.num;
    trial=pair?{ids:[...pair,scanIndex],value:product}:null;
    operation={stage:0,left:r.max_diff,right:r.num,candidate:product,before:previousResult,after:r.result};
    if(r.result>previousResult&&trial)illustratedBest=[...trial.ids];
    previousResult=r.result;
   }else if(source==='max_diff = max(max_diff, max_i - num)'){
    operation={stage:1,left:r.max_i,right:r.num,candidate:r.max_i-r.num,before:previousDiff,after:r.max_diff};
    if(r.max_diff>previousDiff)pair=[maxIndex,scanIndex];
    previousDiff=r.max_diff;
   }else if(source==='max_i = max(max_i, num)'){
    operation={stage:2,left:previousMax,right:r.num,candidate:r.num,before:previousMax,after:r.max_i};
    if(r.max_i>previousMax)maxIndex=scanIndex;
    previousMax=r.max_i;
   }
  }
  const best=method!==1?illustratedBest:r.best??null;
  if(final)trial=best?{ids:[...best],value:answer}:null;
  const bestValue=best?(nums[best[0]]-nums[best[1]])*nums[best[2]]:null;
  let arrayName=null,p=null;
  if(method===2&&r.j===undefined){
   if(source.startsWith('prefix[')){arrayName='prefix';p=source.startsWith('prefix[0]')?0:r.i;}
   else if(source.startsWith('suffix[')){arrayName='suffix';p=source.startsWith('suffix[n-1]')?nums.length-1:r.i;}
   else if(source.startsWith('for i')&&record.branch){arrayName=source.includes('n-2')?'suffix':'prefix';p=r.i;}
  }
  const view={id:2873,method,line:record.line,source,timing:'after',trace:trace.trace,nums:[...nums],
   i:r.i??null,j:r.j??null,k:r.k??null,p,arrayName,
   trial:trial?{ids:[...trial.ids],value:trial.value}:null,best:best?[...best]:null,bestValue,answer,
   prefix:r.prefix?[...r.prefix]:null,suffix:r.suffix?[...r.suffix]:null,
   left:null,right:null,maxI:r.max_i??null,maxDiff:r.max_diff??null,
   num:r.num??null,scanIndex:method===3&&scanIndex>=0?scanIndex:null,maxIndex,
   pair:pair?[...pair]:null,operation:method===3&&!final&&operation?{...operation}:null,branch:record.branch,
   change:[answer,best,trial,r.max_i??null,r.max_diff??null,pair,r.prefix??null,r.suffix??null],final};
  const names=method===2?['n','i','j','value','result','prefix','suffix']
   :method===3?['num','max_i','max_diff','result']:['i','j','k','p','value','answer','best','max_i','max_value','diff','pair'];
  return{arr:[],codeLines:[record.line],codeBlock:method,final,title:bi(`Dòng ${record.line}`,`Line ${record.line}`),
   note:bi('',''),vars:names.map(name=>({name,value:r[name]??'—'})),orderedTriplet2873View:view};
 });
 return{original:nums,answer:trace.answer,steps};
}
const problem={id:2873,difficulty:'easy',slug:'maximum-value-of-an-ordered-triplet-i',category:{key:'array',vi:'Mảng',en:'Array'},tags:[{key:'prefix-max',vi:'Prefix Max',en:'Prefix Max'}],title:bi('Giá trị lớn nhất của bộ ba có thứ tự I','Maximum Value of an Ordered Triplet I'),titleVi:bi('(nums[i] − nums[j]) × nums[k]','(nums[i] − nums[j]) × nums[k]'),statement:bi('Chọn i < j < k để (nums[i] − nums[j]) × nums[k] lớn nhất. Nếu không dương, trả 0.','Choose i < j < k to maximize (nums[i] − nums[j]) × nums[k]. Return 0 if no positive value exists.'),defaultInput:'12,6,1,2,7',inputKind:'array',inputLabel:bi('nums · 3–100 số dương','nums · 3–100 positive integers'),debugMode:'line-by-line',extraParams:[{key:'approach',type:'select',label:bi('Cách giải','Approach'),default:3,options:methods.map((m,i)=>({value:i+1,label:m.label}))}],approach:[bi('Giữ thứ tự i < j < k. Một lượt: tính tích → cập nhật hiệu → cập nhật max trái.','Keep i < j < k. One pass: update product → difference → left maximum.')],liveArgs:input=>[parse(input)]};
methods.forEach((m,i)=>{const s=i?i+1:'';problem[`code${s}`]=m.code;problem[`code${s}Label`]=m.label;problem[`builder${s}`]=(input,params)=>build(input,params,i+1);problem[`complexity${s}`]={time:m.time,space:m.space,note:bi('N = số phần tử. Các chỉ số minh họa giữ nguyên vị trí trong đầu vào.','N = array length. Illustrated indices retain their original input positions.')};});
module.exports={2873:problem};
