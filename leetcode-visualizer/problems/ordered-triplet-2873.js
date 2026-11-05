'use strict';
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const make=(vi,en,time,space,body)=>({label:bi(vi,en),time,space,code:('class Solution:\n    def maximumTripletValue(self, nums):\n'+body).split('\n')});
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
make('Prefix Maximum + Suffix Maximum','Prefix Maximum + Suffix Maximum','O(N)','O(N)',`        left = [None] * len(nums)
        right = [None] * len(nums)
        left[0] = 0
        for p in range(1, len(nums)):
            if nums[p] > nums[left[p - 1]]:
                left[p] = p
            else:
                left[p] = left[p - 1]
        right[-1] = len(nums) - 1
        for p in range(len(nums) - 2, -1, -1):
            if nums[p] > nums[right[p + 1]]:
                right[p] = p
            else:
                right[p] = right[p + 1]
        answer = 0
        best = None
        for j in range(1, len(nums) - 1):
            i = left[j - 1]
            k = right[j + 1]
            value = (nums[i] - nums[j]) * nums[k]
            if value > answer:
                answer = value
                best = [i, j, k]
        return answer`),
make('One Pass – Greedy','One Pass – Greedy','O(N)','O(1)',`        answer = 0
        best = None
        max_value = nums[0]
        max_i = 0
        diff = 0
        pair = None
        for k in range(1, len(nums)):
            # Use earlier i and j before updating either state.
            if pair is not None:
                value = diff * nums[k]
                if value > answer:
                    answer = value
                    best = [pair[0], pair[1], k]
            if max_value - nums[k] > diff:
                diff = max_value - nums[k]
                pair = [max_i, k]
            if nums[k] > max_value:
                max_value = nums[k]
                max_i = k
        return answer`)
];
function parse(input){const nums=Array.isArray(input)?input:typeof input==='string'&&input.trim()?input.split(',').map(s=>s.trim()?Number(s):NaN):null;if(!Array.isArray(nums)||nums.length<3||nums.length>100||Array.from(nums).some(v=>!Number.isInteger(v)||v<1||v>1e6))throw new RangeError('2873: enter 3–100 integers from 1 to 1000000.');return[...nums];}
function build(input,params={},method=1){const nums=parse(input),definition=methods[method-1],trace=runTrace({code:definition.code.join('\n'),method:'maximumTripletValue',args:[nums],maxEvents:1600});let trial=null;
 const steps=trace.events.map((record,index)=>{const r=record.outer,source=definition.code[record.line-1].trim(),final=index===trace.events.length-1;
 if(source.startsWith('for ')&&record.branch)trial=null;
 if(source.startsWith('value =')){const ids=method===3?[...r.pair,r.k]:[r.i,r.j,r.k];trial={ids,value:r.value};}
 if(final)trial=r.best?{ids:[...r.best],value:r.answer}:null;
 const bestValue=r.best?(nums[r.best[0]]-nums[r.best[1]])*nums[r.best[2]]:null;
 const view={id:2873,method,line:record.line,source,timing:'after',trace:trace.trace,nums:[...nums],i:r.i??null,j:r.j??null,k:r.k??null,p:method===2&&r.j===undefined?r.p??null:null,trial:trial?{ids:[...trial.ids],value:trial.value}:null,best:r.best?[...r.best]:null,bestValue,answer:r.answer??null,left:r.left?[...r.left]:null,right:r.right?[...r.right]:null,maxI:r.max_i??null,maxValue:r.max_value??null,diff:r.diff??null,pair:r.pair?[...r.pair]:null,branch:record.branch,change:[r.answer??null,r.best??null,trial,r.max_value??null,r.diff??null,r.pair??null,r.left??null,r.right??null],final};
 return{arr:[],codeLines:[record.line],codeBlock:method,final,title:bi(`Dòng ${record.line}`,`Line ${record.line}`),note:bi('',''),vars:['i','j','k','p','value','answer','best','max_i','max_value','diff','pair'].map(name=>({name,value:r[name]??'—'})),orderedTriplet2873View:view};});return{original:nums,answer:trace.answer,steps};}
const problem={id:2873,difficulty:'easy',slug:'maximum-value-of-an-ordered-triplet-i',category:{key:'array',vi:'Mảng',en:'Array'},tags:[{key:'prefix-max',vi:'Prefix Max',en:'Prefix Max'}],title:bi('Giá trị lớn nhất của bộ ba có thứ tự I','Maximum Value of an Ordered Triplet I'),titleVi:bi('(nums[i] − nums[j]) × nums[k]','(nums[i] − nums[j]) × nums[k]'),statement:bi('Chọn i < j < k để (nums[i] − nums[j]) × nums[k] lớn nhất. Nếu không dương, trả 0.','Choose i < j < k to maximize (nums[i] − nums[j]) × nums[k]. Return 0 if no positive value exists.'),defaultInput:'12,6,1,2,7',inputKind:'array',inputLabel:bi('nums · 3–100 số dương','nums · 3–100 positive integers'),debugMode:'line-by-line',extraParams:[{key:'approach',type:'select',label:bi('Cách giải','Approach'),default:3,options:methods.map((m,i)=>({value:i+1,label:m.label}))}],approach:[bi('Giữ thứ tự i < j < k. Một lượt: tính tích → cập nhật hiệu → cập nhật max trái.','Keep i < j < k. One pass: update product → difference → left maximum.')],liveArgs:input=>[parse(input)]};
methods.forEach((m,i)=>{const s=i?i+1:'';problem[`code${s}`]=m.code;problem[`code${s}Label`]=m.label;problem[`builder${s}`]=(input,params)=>build(input,params,i+1);problem[`complexity${s}`]={time:m.time,space:m.space,note:bi('N = số phần tử. Các chỉ số minh họa giữ nguyên vị trí trong đầu vào.','N = array length. Illustrated indices retain their original input positions.')};});
module.exports={2873:problem};
