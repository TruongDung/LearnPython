'use strict';

const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const CODE=`class Solution:
    def triangularSum(self, nums):
        length = len(nums)
        while length > 1:
            for i in range(length - 1):
                left = nums[i]
                right = nums[i + 1]
                total = left + right
                digit = total % 10
                nums[i] = digit
            length -= 1
        return nums[0]`.split('\n');

function parse(input,limit=12){
 let nums=input;
 try{if(typeof input==='string'){const text=input.trim();nums=text.startsWith('[')?JSON.parse(text):text.split(',').map(x=>x.trim()?Number(x):NaN);}}catch{nums=null;}
 if(!Array.isArray(nums)||!nums.length||nums.length>limit||!Array.from(nums).every(n=>Number.isInteger(n)&&n>=0&&n<=9))throw new RangeError(`2221: use 1–${limit} digits in 0…9 / nhập 1–${limit} chữ số trong 0…9.`);
 return [...nums];
}

function build(input){
 const nums=parse(input),native=runTrace({code:CODE.join('\n'),method:'triangularSum',args:[nums]}),rows=Array.from({length:nums.length},(_,r)=>r?Array(nums.length-r).fill(null):[...nums]),writes=[];
 let current=null,level=0;
 const steps=native.events.map((event,index)=>{
  const x=event.locals,line=event.line,final=index===native.events.length-1;let phase='init';
  if(line===4){current=null;if(event.branch){level=nums.length-x.length+1;phase='row-start';}else phase='done';}
  if(line===5){current=event.branch?{row:level,col:x.i,left:null,right:null,total:null,digit:null,written:false}:null;phase=event.branch?'pair':'row-ready';}
  if(line===6){current.left=x.left;phase='read-left';}
  if(line===7){current.right=x.right;phase='read-right';}
  if(line===8){current.total=x.total;phase='sum';}
  if(line===9){current.digit=x.digit;phase='mod';}
  if(line===10){rows[level][x.i]=x.nums[x.i];current.written=true;writes.push({...current,step:index});phase='write';}
  if(line===11){current=null;phase='row-end';}
  if(final){current=null;phase='done';}
  const view={nums,rows:rows.map(row=>[...row]),working:[...x.nums],length:x.length??nums.length,current:current?{...current}:null,writes:structuredClone(writes),phase,source:{line,text:CODE[line-1].trim()},trace:native.trace,final,answer:final?native.answer:null};
  return {arr:[],codeBlock:1,codeLines:[line],final,title:bi(view.source.text,view.source.text),note:bi('',''),vars:['length','i','left','right','total','digit'].map(name=>({name,value:x[name]??'—'})),triangularSum2221View:view};
 });
 return {original:nums,answer:native.answer,steps};
}

module.exports={2221:{id:2221,difficulty:'medium',slug:'find-triangular-sum-of-an-array',category:{key:'math',vi:'Toán',en:'Math'},tags:[{key:'array',vi:'Mảng',en:'Array'},{key:'simulation',vi:'Mô phỏng',en:'Simulation'}],title:bi('Find Triangular Sum of an Array','Find Triangular Sum of an Array'),titleVi:bi('Cộng hai số kề nhau, thu về một chữ số','Add neighbors until one digit remains'),statement:bi('Mỗi tầng mới: cộng hai số kề nhau và lấy % 10. Lặp đến khi chỉ còn một số.','For each new layer, add adjacent digits modulo 10. Repeat until one digit remains.'),defaultInput:[1,2,3,4,5],inputKind:'integer',inputLabel:bi('nums · 1–12 chữ số từ 0 đến 9','nums · 1–12 digits from 0 to 9'),extraParams:[],code:CODE,debugMode:'line-by-line',approach:[bi('new[i] = (old[i] + old[i+1]) % 10. Hai mũi tên đi vào mỗi ô là hai số được cộng.','new[i] = (old[i] + old[i+1]) % 10. Each cell receives its two adjacent parents.'),bi('Code ghi từ trái sang phải ngay trên nums; length xác định phần mảng còn đang dùng.','The code writes left to right in nums; length marks the active prefix.')],complexity:{time:'O(n²)',space:'O(1)',note:bi('n(n−1)/2 phép cộng. Code cập nhật tại chỗ; các tầng lưu thêm chỉ phục vụ minh hoạ.','n(n−1)/2 additions. The solution updates in place; saved layers belong to the visualization only.')},visualizationLimits:{maxLength:12,completeTrace:true},builder:build,liveArgs:input=>[parse(input,1000)]}};
