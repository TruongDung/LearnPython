'use strict';
const {runTrace}=require('./wasm-picture-trace'),bi=(vi,en)=>({vi,en});
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
function parse(input){let nums=input;try{if(typeof input==='string'){const text=input.trim();nums=text.startsWith('[')?JSON.parse(text):text.split(',').map(s=>s.trim()?Number(s):NaN);}}catch{nums=null;}if(!Array.isArray(nums)||!nums.length||nums.length>24||nums.some(x=>!Number.isSafeInteger(x)||x<1||x>100))throw Error('1524: use 1–24 integers in 1…100.');return [...nums];}
function build(input){
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
  const view={id:1524,nums,registered:structuredClone(registered),current:current?{...current}:null,matches,ends:structuredClone(ends),active:line>=7&&line<=14&&!(line===7&&!e.branch)?x.i??null:null,
   even:x.even??null,odd:x.odd??null,parity:x.parity??null,total:x.answer??null,added,phase,line,source:CODE[line-1].trim(),branch:e.branch,trace:native.trace,answer:final?native.answer:null,final};
  return {arr:[],codeLines:[line],title:bi(view.source,view.source),note:bi('',''),final,vars:['i','value','parity','even','odd','answer'].map(name=>({name,value:x[name]??'—'})),oddSubarrayPictureView:view};
 });return {original:nums,answer:native.answer,steps};
}
module.exports={1524:{id:1524,difficulty:'medium',slug:'number-of-sub-arrays-with-odd-sum',category:{key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'},title:bi('Number of Sub-arrays With Odd Sum','Number of Sub-arrays With Odd Sum'),titleVi:bi('Đếm đoạn con có tổng lẻ','Count subarrays with odd sum'),statement:bi('Đếm số đoạn con liên tiếp có tổng lẻ, lấy modulo 10⁹+7.','Count contiguous subarrays with an odd sum, modulo 10⁹+7.'),defaultInput:[1,3,5],inputKind:'positive',inputLabel:bi('arr · 1–24 số trong 1…100','arr · 1–24 integers in 1…100'),extraParams:[],code:CODE,debugMode:'line-by-line',complexity:{time:'O(n)',space:'O(1)'},approach:[bi('P0=0 là tiền tố rỗng chẵn. Mỗi tiền tố mới ghép với các tiền tố trước có tính chẵn/lẻ đối lập, rồi mới được thêm vào nhóm của nó.','P0=0 is the empty even prefix. Pair each new prefix with earlier prefixes of the opposite parity, then register it in its own group.')],builder:build,liveArgs:input=>[parse(input)]}};
