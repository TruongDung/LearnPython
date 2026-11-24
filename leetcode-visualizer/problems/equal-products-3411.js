'use strict';
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const CODE=`from math import gcd, lcm

class Solution:
    def maxLength(self, nums):
        n = len(nums)
        answer = 0
        for left in range(n):
            product = 1
            g = 0
            l = 1
            for right in range(left, n):
                value = nums[right]
                product *= value
                g = gcd(g, value)
                l = lcm(l, value)
                target = g * l
                if product == target:
                    answer = max(answer, right - left + 1)
                if product > target:
                    break
        return answer`;
function parse(input,live=false){
 let nums=input;
 if(typeof input==='string')try{nums=input.trim().startsWith('[')?JSON.parse(input):input.split(',').map(x=>/^\d+$/.test(x.trim())?Number(x):NaN);}catch(_){nums=null;}
 const max=live?100:12;
 if(!Array.isArray(nums)||nums.length<2||nums.length>max||!Array.from(nums).every(x=>Number.isInteger(x)&&x>=1&&x<=10))throw new RangeError(`3411: cần 2–${max} số nguyên từ 1 đến 10 / use 2–${max} integers in 1…10.`);
 return [...nums];
}
function build(input){
 const nums=parse(input),native=runTrace({code:CODE,method:'maxLength',args:[nums]}),code=CODE.split('\n'),cells=new Map();
 if(native.trace.truncated)throw new Error('3411: incomplete Python trace.');
 let left=null,right=null,productTo=null,gcdTo=null,lcmTo=null,initialized={product:false,g:false,l:false},comparison=null,best=null,bestLength=0;
 const steps=native.events.map((event,index)=>{
  const x=event.locals,line=event.line,final=event.returning;
  if(line===7&&event.branch){left=x.left;right=null;productTo=gcdTo=lcmTo=x.left-1;initialized={product:false,g:false,l:false};comparison=null;}
  if(line===8)initialized.product=true;
  if(line===9)initialized.g=true;
  if(line===10)initialized.l=true;
  if(line===11&&event.branch){right=x.right;comparison=null;}
  if(line===13)productTo=x.right;
  if(line===14)gcdTo=x.right;
  if(line===15)lcmTo=x.right;
  if(line===16)comparison={left:x.left,right:x.right,product:x.product,g:x.g,l:x.l,target:x.target,match:null,over:null};
  if(line===17){comparison.match=event.branch;cells.set(`${x.left},${x.right}`,{left:x.left,right:x.right,match:event.branch,pruned:false,step:index});}
  if(line===18){cells.get(`${x.left},${x.right}`).step=index;if(x.answer>bestLength){bestLength=x.answer;best={...comparison,step:index};}}
  if(line===19)comparison.over=event.branch;
  if(line===20)for(let r=x.right+1;r<nums.length;r++)cells.set(`${x.left},${r}`,{left:x.left,right:r,match:null,pruned:true,step:index});
  const view={line,source:code[line-1].trim(),condition:event.branch,final,nums:[...nums],left,right,
    product:initialized.product?x.product:null,g:initialized.g?x.g:null,l:initialized.l?x.l:null,
    productTo,gcdTo,lcmTo,comparison:comparison?{...comparison}:null,best:best?{...best}:null,answer:x.answer??null,
    cells:[...cells.values()].map(cell=>({...cell}))};
  return{title:bi(`Dòng ${line} · ${view.source}`,`Line ${line} · ${view.source}`),note:bi('',''),arr:[],highlight:[],mark:[],codeLines:[line],final,
    vars:Object.entries(x).map(([name,value])=>({name,value})),equalProducts3411View:view};
 });
 return{original:nums,answer:native.answer,steps};
}
module.exports={3411:{id:3411,slug:'maximum-subarray-with-equal-products',difficulty:'easy',category:{key:'math',vi:'Toán học',en:'Math'},
 title:bi('Maximum Subarray With Equal Products','Maximum Subarray With Equal Products'),titleVi:bi('Mảng con dài nhất có tích bằng GCD × LCM','Longest subarray with product equal to GCD × LCM'),
 statement:bi('Tìm độ dài mảng con liên tiếp dài nhất thỏa tích các phần tử = GCD × LCM của mảng con đó.','Find the longest contiguous subarray whose element product equals its GCD multiplied by its LCM.'),
 tags:[{key:'array',vi:'Mảng',en:'Array'},{key:'enumeration',vi:'Liệt kê',en:'Enumeration'},{key:'number-theory',vi:'Lý thuyết số',en:'Number Theory'}],
 inputKind:'string',defaultInput:'1,2,1,2,1,1,1',inputLabel:bi('nums · 2–12 số nguyên từ 1 đến 10','nums · 2–12 integers in 1…10'),extraParams:[],debugMode:'line-by-line',code:CODE.split('\n'),builder:build,liveArgs:input=>[parse(input,true)],
 approach:[bi('Giữ l, tăng r và cập nhật tích, GCD, LCM. Ghi nhận khi hai vế bằng nhau; tích đã vượt GCD × LCM thì dừng nhánh.','Fix l, advance r and update the product, GCD and LCM. Record equal products; stop the branch when the product exceeds GCD × LCM.')],
 complexity:{time:'O(n² log 2520)',space:'O(1)',note:bi('Thêm số dương không làm giảm tỉ số tích / (GCD × LCM). Minh hoạ tối đa 12 số; live code hỗ trợ 100 số.','Appending positive integers cannot decrease product / (GCD × LCM). Visualization: up to 12 values; live code accepts 100.')}}};
