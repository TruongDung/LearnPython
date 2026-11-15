'use strict';
const {runTrace}=require('./wasm-picture-trace'),bi=(vi,en)=>({vi,en});
const BRUTE=`class Solution:
    def numOfSubarrays(self, arr):
        MOD = 10**9 + 7
        answer = 0
        for left in range(len(arr)):
            total = 0
            for right in range(left, len(arr)):
                total += arr[right]
                if total % 2:
                    answer = (answer + 1) % MOD
        return answer`.split('\n');
const CODE=`class Solution:
    def numOfSubarrays(self, arr):
        MOD = 10**9 + 7
        even, odd = 1, 0
        parity = 0
        answer = 0
        for i, value in enumerate(arr):
            parity = (parity + value) % 2
            if parity:
                answer = (answer + even) % MOD
                odd += 1
            else:
                answer = (answer + odd) % MOD
                even += 1
        return answer`.split('\n');
const DP=`class Solution:
    def numOfSubarrays(self, arr):
        MOD = 10**9 + 7
        odd, even = 0, 0
        answer = 0
        for i, value in enumerate(arr):
            if value % 2:
                odd, even = even + 1, odd
            else:
                even += 1
            answer = (answer + odd) % MOD
        return answer`.split('\n');
const LABELS=[bi('1. Brute Force · O(n²)','1. Brute Force · O(n²)'),bi('2. Prefix Sum + Counting · O(n)','2. Prefix Sum + Counting · O(n)'),bi('3. Dynamic Programming · O(n)','3. Dynamic Programming · O(n)')];
function parse(input){let nums=input;try{if(typeof input==='string'){const text=input.trim();nums=text.startsWith('[')?JSON.parse(text):text.split(',').map(s=>s.trim()?Number(s):NaN);}}catch{nums=null;}if(!Array.isArray(nums)||!nums.length||nums.length>24||nums.some(x=>!Number.isSafeInteger(x)||x<1||x>100))throw Error('1524: use 1–24 integers in 1…100.');return [...nums];}
function buildPrefix(input){
 const nums=parse(input),sums=[0];for(const n of nums)sums.push(sums.at(-1)+n);
 const native=runTrace({code:CODE.join('\n'),method:'numOfSubarrays',args:[nums]}),registered=[],ends=[];let current=null,lastTotal=0;
 const steps=native.events.map((e,index)=>{const x=e.locals,line=e.line,final=index===native.events.length-1;let phase='init',added=null;
  if(line===4){registered.push({index:0,sum:0,parity:0});phase='seed';}
  if(line===7){current=null;phase=e.branch?'read':'scan-end';}
  if(line===8){current={index:x.i+1,sum:sums[x.i+1],parity:x.parity};phase='parity';}
  if(line===9)phase='compare';
  const matches=current?registered.filter(p=>p.index<current.index&&p.parity!==current.parity).map(p=>p.index):[];
  if(line===10||line===13){added=matches.length;ends.push({end:current.index,starts:[...matches],count:added,before:lastTotal,after:x.answer,step:index});lastTotal=x.answer;phase='count';}
  if(line===11||line===14){registered.push({...current});phase='register';}
  if(final){current=null;phase='result';}
  const view={id:1524,method:2,nums,registered:structuredClone(registered),current:current?{...current}:null,matches,ends:structuredClone(ends),active:line>=7&&line<=14&&!(line===7&&!e.branch)?x.i??null:null,
   even:x.even??null,odd:x.odd??null,parity:x.parity??null,total:x.answer??null,added,phase,line,source:CODE[line-1].trim(),branch:e.branch,trace:native.trace,answer:final?native.answer:null,final};
  return {arr:[],codeBlock:2,codeLines:[line],title:bi(view.source,view.source),note:bi('',''),final,vars:['i','value','parity','even','odd','answer'].map(name=>({name,value:x[name]??'—'})),oddSubarrayPictureView:view};
 });return {original:nums,answer:native.answer,steps};
}
function buildBrute(input){
 const nums=parse(input),native=runTrace({code:BRUTE.join('\n'),method:'numOfSubarrays',args:[nums]}),checks=nums.map(()=>nums.map(()=>null));let current=null,checked=0;
 const steps=native.events.map((e,index)=>{const x=e.locals,line=e.line,final=index===native.events.length-1;let phase='init';
  if(line===5){current=null;phase=e.branch?'start':'scan-end';}
  if(line===6){current=null;phase='reset';}
  if(line===7){current=e.branch?{left:x.left,right:x.right,before:x.total,sum:null,odd:null}:null;phase=e.branch?'read':'row-end';}
  if(line===8){current.sum=x.total;phase='extend';}
  if(line===9){current.odd=e.branch;checks[x.left][x.right]=e.branch?1:0;checked++;phase='test';}
  if(line===10){checks[x.left][x.right]=2;phase='count';}
  if(final){current=null;phase='result';}
  const view={id:1524,method:1,nums,checks:checks.map(row=>[...row]),current:current?{...current}:null,checked,total:x.answer??null,phase,line,source:BRUTE[line-1].trim(),branch:e.branch,trace:native.trace,answer:final?native.answer:null,final};
  return {arr:[],codeBlock:1,codeLines:[line],title:bi(view.source,view.source),note:bi('',''),final,vars:['left','right','total','answer'].map(name=>({name,value:x[name]??'—'})),oddSubarrayPictureView:view};
 });return {original:nums,answer:native.answer,steps};
}
function buildDP(input){
 const nums=parse(input),native=runTrace({code:DP.join('\n'),method:'numOfSubarrays',args:[nums]}),history=[];let current=null;
 const steps=native.events.map((e,index)=>{const x=e.locals,line=e.line,final=index===native.events.length-1;let phase='init';
  if(line===6){current=e.branch?{index:x.i,value:x.value,parity:x.value%2,beforeOdd:x.odd,beforeEven:x.even,beforeAnswer:x.answer,committed:false}:null;phase=e.branch?'read':'scan-end';}
  if(line===7)phase='compare';
  if(line===8||line===10){current.committed=true;history.push({...current,odd:x.odd,even:x.even,answer:null,transitionStep:index,countStep:null});phase='transition';}
  if(line===11){history.at(-1).answer=x.answer;history.at(-1).countStep=index;phase='count';}
  if(final){current=null;phase='result';}
  const view={id:1524,method:3,nums,current:current?{...current}:null,history:structuredClone(history),odd:x.odd??null,even:x.even??null,total:x.answer??null,phase,line,source:DP[line-1].trim(),branch:e.branch,trace:native.trace,answer:final?native.answer:null,final};
  return {arr:[],codeBlock:3,codeLines:[line],title:bi(view.source,view.source),note:bi('',''),final,vars:['i','value','odd','even','answer'].map(name=>({name,value:x[name]??'—'})),oddSubarrayPictureView:view};
 });return {original:nums,answer:native.answer,steps};
}
module.exports={1524:{id:1524,difficulty:'medium',slug:'number-of-sub-arrays-with-odd-sum',category:{key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'},title:bi('Number of Sub-arrays With Odd Sum','Number of Sub-arrays With Odd Sum'),titleVi:bi('Đếm đoạn con có tổng lẻ','Count subarrays with odd sum'),statement:bi('Đếm số đoạn con liên tiếp có tổng lẻ, lấy modulo 10⁹+7.','Count contiguous subarrays with an odd sum, modulo 10⁹+7.'),defaultInput:[1,3,5],inputKind:'positive',inputLabel:bi('arr · 1–24 số trong 1…100','arr · 1–24 integers in 1…100'),extraParams:[{key:'approach',type:'select',default:'1',label:bi('Cách giải','Approach'),options:LABELS.map((label,i)=>({value:String(i+1),label}))}],code:BRUTE,codeLabel:LABELS[0],code2:CODE,code2Label:LABELS[1],code3:DP,code3Label:LABELS[2],debugMode:'line-by-line',complexity:{time:'O(n²)',space:'O(1)',note:bi('Học trước: chọn đầu trái, mở rộng đầu phải và giữ tổng đang chạy.','Start here: fix the left endpoint, extend right, and maintain the running sum.')},complexity2:{time:'O(n)',space:'O(1)',note:bi('Phù hợp phỏng vấn: đếm các tiền tố chẵn/lẻ trước đó.','Interview approach: count earlier even/odd prefixes.')},complexity3:{time:'O(n)',space:'O(1)',note:bi('odd/even đếm các đoạn kết thúc tại i; số lẻ đổi vai hai nhóm, số chẵn giữ vai.','odd/even count subarrays ending at i; an odd value swaps parity and an even value preserves it.')},approach:[bi('1. Brute Force: duyệt mọi đoạn và kiểm tra tổng lẻ.','1. Brute Force: examine each interval and test its sum.'),bi('2. Prefix Sum + Counting: P0=0 là tiền tố rỗng chẵn; ghép với nhóm đối lập rồi mới thêm tiền tố mới.','2. Prefix Sum + Counting: seed the empty even prefix P0=0; count opposite-parity prefixes before registering the new one.'),bi('3. DP: cập nhật đồng thời số đoạn chẵn/lẻ kết thúc tại i, rồi cộng odd vào đáp án.','3. DP: simultaneously update even/odd counts ending at i, then add odd to the answer.')],builder:buildBrute,builder2:buildPrefix,builder3:buildDP,liveArgs:input=>[parse(input)]}};
