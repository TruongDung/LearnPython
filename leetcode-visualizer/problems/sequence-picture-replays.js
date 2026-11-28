'use strict';
const {parseArguments}=require('./catalog-lesson');
const bi=(vi,en)=>({vi,en});
function attachMexReplay(lesson){
 const execute=lesson.builder;
 lesson.builder=input=>{
  const [nums]=parseArguments(input,lesson.__catalog);
  if(!Array.isArray(nums)||!nums.length||nums.length>60||nums.some(n=>!Number.isInteger(n)||n<0||n>100000))throw Error('#3948: nhập 1–60 số nguyên trong [0,10⁵] / Enter 1–60 integers in [0,10⁵].');
  const run=execute(input),cuts=[];let start=0,mexReady=false,needReady=false,rightReady=false;
  for(const step of run.steps){
   const v=step.catalogLessonView,x=v.locals;
   if(v.line===6){start=x.left;mexReady=false;needReady=false;rightReady=false;}
   if(v.line===7)mexReady=true;
   if(v.line===10)needReady=true;
   if(v.line===11)rightReady=true;
   if(v.line===17)cuts.push({left:x.left,right:x.right,mex:x.mex});
   const phase=v.final?'result':v.line===17?'cut':v.line===18||v.line===5?'next':needReady&&v.line>=10&&v.line<=16?'collect':v.line>=6&&v.line<=9?'mex':'start';
   v.mex3948={start,mexReady,needReady,rightReady,phase,cuts:cuts.map(cut=>({...cut}))};
  }
  return run;
 };
 lesson.statement=bi('Mỗi lần lấy một đoạn đầu không rỗng, ghi MEX rồi xóa đoạn đó. MEX là số nguyên không âm nhỏ nhất còn thiếu. Tìm dãy kết quả lớn nhất theo thứ tự từ điển. Mô phỏng: 1–60 số.', 'Repeatedly take a nonempty prefix, append its MEX and remove it. MEX is the smallest missing nonnegative integer. Find the lexicographically greatest result. Visual limit: 1–60 values.');
 lesson.complexity={time:'O(n²)',space:'O(n)',note:bi('Bản minh hoạ tạo lại tập của từng hậu tố; không tính lịch sử debug.','This teaching version rebuilds each suffix set; excludes replay history.')};
}
function attachSwapReplay(lesson){
 const execute=lesson.builder;
 lesson.builder=input=>{
  const [nums,k]=parseArguments(input,lesson.__catalog);
  if(!Array.isArray(nums)||!nums.length||nums.length>12||nums.some(n=>!Number.isInteger(n)||Math.abs(n)>100000)||!Number.isInteger(k)||k<0||k>nums.length)throw Error('#3962: nhập 1–12 số nguyên trong ±10⁵, 0 ≤ k ≤ n / Enter 1–12 integers within ±10⁵, 0 ≤ k ≤ n.');
  const run=execute(input);let swaps=[],insideIndices=[],outsideIndices=[],best=null;
  for(const step of run.steps){
   const v=step.catalogLessonView,x=v.locals;
   if(v.line===4||v.line===5&&v.branch===true){swaps=[];insideIndices=[];outsideIndices=[];}
   if(v.line===6){
    swaps=[];
    insideIndices=nums.flatMap((_,i)=>i>=x.left&&i<=x.right?[i]:[]).sort((a,b)=>nums[a]-nums[b]||a-b);
    outsideIndices=[];
   }
   if(v.line===7)outsideIndices=nums.flatMap((_,i)=>i<x.left||i>x.right?[i]:[]).sort((a,b)=>nums[b]-nums[a]||a-b);
   if(v.line===12)swaps.push({inside:insideIndices[x.i],outside:outsideIndices[x.i],gain:x.outside[x.i]-x.inside[x.i]});
   if(v.line===13&&(!best||x.answer>best.score))best={left:x.left,right:x.right,score:x.answer,swaps:swaps.map(pair=>({...pair}))};
   v.swap3962={swaps:swaps.map(pair=>({...pair})),insideIndices:[...insideIndices],outsideIndices:[...outsideIndices],best:best&&{...best,swaps:best.swaps.map(pair=>({...pair}))}};
  }
  return run;
 };
 lesson.statement=bi('Đổi chỗ hai vị trí bất kỳ tối đa k lần. Tìm tổng lớn nhất của một đoạn liên tiếp không rỗng sau khi đổi. Mô phỏng duyệt các đoạn: 1–12 số.', 'Swap any two positions at most k times. Find the maximum sum of a nonempty contiguous subarray afterwards. Teaching replay enumerates windows of 1–12 values.');
 lesson.complexity={time:'O(n³ log n)',space:'O(n)',note:bi('Bản minh hoạ duyệt từng đoạn và sắp xếp trong/ngoài đoạn; không tính lịch sử debug.','The teaching version enumerates windows and sorts their inside/outside values; excludes replay history.')};
}
function attachArithmeticReplay(lesson){
 const execute=lesson.builder;
 lesson.builder=input=>{
  const [nums]=parseArguments(input,lesson.__catalog);
  if(!Array.isArray(nums)||!nums.length||nums.length>80||nums.some(n=>!Number.isInteger(n)||Math.abs(n)>1000))throw Error('#413: nhập 1–80 số nguyên trong [-1000,1000] / Enter 1–80 integers in [-1000,1000].');
  const run=execute(input),groups=[];
  for(const step of run.steps){
   const v=step.catalogLessonView,x=v.locals;
   if(v.line===9)groups.push({right:x.i,count:x.ending,first:x.i-x.ending-1});
   v.arithmetic413={groups:groups.map(group=>({...group}))};
  }
  return run;
 };
 lesson.statement=bi('Đếm các đoạn liên tiếp có ít nhất 3 số và hiệu giữa hai số kề nhau không đổi. Mô phỏng: 1–80 số nguyên trong [-1000,1000].','Count contiguous subarrays of at least three values whose adjacent differences are equal. Visual replay: 1–80 integers in [-1000,1000].');
 lesson.liveEditorDisabled=true;lesson.sourceLanguage='python';
 lesson.complexity.note=bi('Không tính các nhóm đoạn và lịch sử dùng để vẽ hình.','Excludes slice groups and replay snapshots used for drawing.');
}
module.exports={attachMexReplay,attachSwapReplay,attachArithmeticReplay};
