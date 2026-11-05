'use strict';
const {runTrace}=require('./wasm-picture-trace'),bi=(vi,en)=>({vi,en});
const rotateCodes=[`from typing import List

class Solution:
    def maxRotateFunction(self, nums: List[int]) -> int:
        n = len(nums)
        total = sum(nums)
        current = 0
        for i in range(n):
            current += i * nums[i]
        best = current
        for k in range(1, n):
            moved = nums[n - k]
            current = current + total - n * moved
            best = max(best, current)
        return best`,
`from typing import List

class Solution:
    def maxRotateFunction(self, nums: List[int]) -> int:
        n = len(nums)
        best = float("-inf")
        for k in range(n):
            rotated = nums[-k:] + nums[:-k] if k else nums[:]
            current = 0
            for i in range(n):
                current += i * rotated[i]
            best = max(best, current)
        return best`].map(s=>s.split('\n'));
const andCodes=[`from typing import List

class Solution:
    def closestToTarget(self, arr: List[int], target: int) -> int:
        previous = {}
        best = float("inf")
        for right, x in enumerate(arr):
            current = {x: right}
            for value, left in previous.items():
                merged = value & x
                current[merged] = left
            for value, left in current.items():
                difference = abs(value - target)
                best = min(best, difference)
            previous = current
        return best`,
`from typing import List

class Solution:
    def closestToTarget(self, arr: List[int], target: int) -> int:
        best = float("inf")
        for left in range(len(arr)):
            value = arr[left]
            for right in range(left, len(arr)):
                value &= arr[right]
                difference = abs(value - target)
                best = min(best, difference)
        return best`].map(s=>s.split('\n'));
function numbers(input,id){let a=input;if(typeof a==='string'){try{const s=a.trim();a=s.startsWith('[')?JSON.parse(s):s?s.split(',').map(v=>v.trim()?Number(v):NaN):null;}catch{a=null;}}const min=id===396?-100:1,max=id===396?100:1e6;if(!Array.isArray(a)||a.length<1||a.length>20||a.some(v=>!Number.isInteger(v)||v<min||v>max))throw new RangeError(`${id}: Use 1–20 integers from ${min} to ${max}.`);return[...a];}
const pairs=v=>v?.__pairs__??[],clone=v=>v===null?null:JSON.parse(JSON.stringify(v));
function rotate(input,params={},method=1){
 const nums=numbers(input,396),code=rotateCodes[method-1],trace=runTrace({code:code.join('\n'),method:'maxRotateFunction',args:[nums]});let displayK=0,done=0,active=null,ready=false,transition=null,winner=null,knownBest=null;const history=[];
 const steps=trace.events.map((r,index)=>{const x=r.locals,source=code[r.line-1].trim(),final=index===trace.events.length-1;let event='step';
  if(source==='current = 0'){done=0;ready=true;event='zero';}
  if(source==='for i in range(n):'){active=r.branch?x.i:null;event='term';}
  if(source==='current += i * nums[i]'||source==='current += i * rotated[i]'){done=x.i+1;active=x.i;event='add';}
  if(method===1&&source==='for k in range(1, n):'&&r.branch){transition={k:x.k,before:x.current,total:x.total,moved:null,after:null};active=null;event='rotate';}
  if(source==='moved = nums[n - k]'){transition.moved=x.moved;event='moved';}
  if(source==='current = current + total - n * moved'){displayK=x.k;done=nums.length;transition.after=x.current;history.push({k:x.k,value:x.current,step:index});event='update';}
  if(source==='rotated = nums[-k:] + nums[:-k] if k else nums[:]'){displayK=x.k;done=0;ready=false;active=null;event='rotate';}
  if(source==='best = current'||source==='best = max(best, current)'){
   const k=method===1?displayK:x.k;if(!history.some(h=>h.k===k))history.push({k,value:x.current,step:index});
   if(winner===null||x.current>knownBest)winner=k;knownBest=x.best;event='best';
  }
  if(final){active=null;event='return';}
  const ids=Array.from({length:nums.length},(_,i)=>(i-displayK+nums.length)%nums.length);
  const view={id:396,method,line:r.line,source,event,nums:[...nums],k:displayK,ids,values:ids.map(i=>nums[i]),done,active,current:ready?x.current??null:null,total:x.total??null,best:x.best??null,winner,transition:clone(transition),history:history.map(h=>({...h})),answer:final?trace.answer:null,final};
  return{arr:[],codeBlock:method,codeLines:[r.line],final,title:bi(`Dòng ${r.line}`,`Line ${r.line}`),note:bi('',''),vars:['n','total','i','k','moved','rotated','current','best'].map(name=>({name,value:x[name]??'—'})),numericPicture:view};
 });return{original:[...nums],answer:trace.answer,steps};
}
function targetValue(params={}){const raw=params.target??5,n=typeof raw==='string'&&raw.trim()===''?NaN:Number(raw);if(!['number','string'].includes(typeof raw)||!Number.isInteger(n)||n<0||n>1e7)throw new RangeError('1521: target must be an integer from 0 to 10000000.');return n;}
function closest(input,params={},method=1){
 const arr=numbers(input,1521),target=targetValue(params),code=andCodes[method-1],trace=runTrace({code:code.join('\n'),method:'closestToTarget',args:[arr,target]});let operation=null,probe=null,winner=null,knownBest=null,range=null;const history=[];
 const steps=trace.events.map((r,index)=>{const x=r.locals,source=code[r.line-1].trim(),final=index===trace.events.length-1;let event='step';
  if(method===1&&source==='for right, x in enumerate(arr):'&&r.branch){operation=null;probe=null;range=[x.right,x.right];event='next';}
  if(source==='current = {x: right}')event='singleton';
  if(source==='for value, left in previous.items():'&&r.branch){operation={a:x.value,b:x.x,result:null,left:x.left,right:x.right,duplicate:false};range=[x.left,x.right];event='operands';}
  if(source==='merged = value & x'){operation.result=x.merged;operation.duplicate=pairs(x.current).some(([value])=>value===x.merged);event='and';}
  if(source==='current[merged] = left')event=operation.duplicate?'deduplicate':'insert';
  if(method===2&&source==='for right in range(left, len(arr)):'&&r.branch){operation={a:x.value,b:arr[x.right],result:null,left:x.left,right:x.right,duplicate:false};range=[x.left,x.right];probe=null;event='operands';}
  if(source==='value &= arr[right]'){operation.result=x.value;event='and';}
  if(source==='for value, left in current.items():'&&r.branch){range=[x.left,x.right];probe=null;event='candidate';}
  if(source==='difference = abs(value - target)'){probe={left:x.left,right:x.right,value:x.value,difference:x.difference,step:index};range=[x.left,x.right];history.push({...probe});event='distance';}
  if(source==='best = min(best, difference)'){if(winner===null||x.difference<knownBest)winner={left:x.left,right:x.right,value:x.value,difference:x.difference};knownBest=x.best;event='best';}
  if(source==='previous = current'){operation=null;probe=null;event='commit';}
  if(final)event='return';
  const view={id:1521,method,line:r.line,source,event,arr:[...arr],target,range:range?[...range]:null,operation:clone(operation),probe:clone(probe),previous:pairs(x.previous).map(p=>[...p]),current:pairs(x.current).map(p=>[...p]),best:x.best??null,winner:clone(winner),history:history.map(h=>({...h})),answer:final?trace.answer:null,final};
  return{arr:[],codeBlock:method,codeLines:[r.line],final,title:bi(`Dòng ${r.line}`,`Line ${r.line}`),note:bi('',''),vars:['right','x','left','value','merged','difference','best','previous','current'].map(name=>({name,value:x[name]??'—'})),numericPicture:view};
 });return{original:[...arr],answer:trace.answer,steps};
}
const common=(id,title,defaultInput,labels)=>({id,title:bi(title,title),difficulty:id===1521?'hard':'medium',slug:id===396?'rotate-function':'find-a-value-of-a-mysterious-function-closest-to-target',category:{key:id===396?'array':'bitmask',vi:id===396?'Mảng':'Bitmask',en:id===396?'Array':'Bitmask'},inputKind:'string',defaultInput,inputLabel:bi(`Mảng · 1–20 số · ${id===396?'−100…100':'1…10⁶'}`,`Array · 1–20 integers · ${id===396?'−100…100':'1…10⁶'}`),debugMode:'line-by-line',extraParams:[{key:'approach',type:'select',label:bi('Cách giải','Approach'),default:1,options:labels.map((label,i)=>({value:i+1,label}))}],codeLabel:labels[0],code2Label:labels[1]});
const labels396=[bi('Công thức O(N)','Recurrence O(N)'),bi('Xoay trực tiếp O(N²)','Direct rotations O(N²)')],labels1521=[bi('Gộp AND trùng O(NB)','Distinct ANDs O(NB)'),bi('Duyệt mọi đoạn O(N²)','All subarrays O(N²)')];
module.exports={396:{...common(396,'Rotate Function','[4,3,2,6]',labels396),tags:[{key:'math',vi:'Toán',en:'Math'}],statement:bi('Xoay mảng sang phải. F(k) = tổng chỉ số × giá trị. Tìm F(k) lớn nhất.','Rotate right. F(k) is the sum of index × value. Find the maximum F(k).'),approach:[bi('Mỗi số tăng trọng số 1; số cuối về đầu mất N lần giá trị.','Every weight increases by 1; the wrapped value loses N weights.')],code:rotateCodes[0],code2:rotateCodes[1],complexity:{time:'O(N)',space:'O(1)'},complexity2:{time:'O(N²)',space:'O(N)'},builder:(input,params={})=>rotate(input,params,Number(params.approach)===2?2:1),builder2:(input,params)=>rotate(input,params,2),liveArgs:input=>[numbers(input,396)]},1521:{...common(1521,'Find a Value of a Mysterious Function Closest to Target','[9,12,3,7,15]',labels1521),tags:[{key:'bitwise',vi:'Bitwise AND',en:'Bitwise AND'}],statement:bi('Chọn đoạn liên tiếp. AND các số, rồi tối thiểu hóa |AND − target|.','Choose a contiguous subarray. Minimize |bitwise AND − target|.'),extraParams:[{key:'target',type:'number',label:bi('Giá trị đích','Target'),default:5,min:0,max:1e7},...common(1521,'','',labels1521).extraParams],approach:[bi('Giữ các AND khác nhau của đoạn kết thúc tại right. Cùng AND chỉ cần một đại diện.','Keep distinct AND values for subarrays ending at right. Equal ANDs share one representative.')],code:andCodes[0],code2:andCodes[1],complexity:{time:'O(N · B)',space:'O(B)',note:bi('B ≤ 20 bit; thêm số chỉ có thể tắt bit.','B ≤ 20 bits; extending a subarray can only clear bits.')},complexity2:{time:'O(N²)',space:'O(1)'},builder:(input,params={})=>closest(input,params,Number(params.approach)===2?2:1),builder2:(input,params)=>closest(input,params,2),liveArgs:(input,params)=>[numbers(input,1521),targetValue(params)]}};
