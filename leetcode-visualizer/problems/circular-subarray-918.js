'use strict';
const base=require('./dp')[918],CODE=base.code;
const bi=(vi,en)=>({vi,en});
function parse(nums){
  if(!Array.isArray(nums)||!nums.length||nums.length>30000||nums.some(x=>!Number.isInteger(x)||x < -30000||x>30000))throw new Error('918: nums cần 1..30000 số nguyên trong [-30000, 30000]. / Use 1..30000 integers in [-30000, 30000].');
  return nums;
}
function buildSteps(input){
  const nums=parse(input),n=nums.length,detailed=n<=40,steps=[];
  const py={total:null,cur_max:null,max_sum:null,cur_min:null,min_sum:null,i:null,x:null,circular_sum:null};
  let maxEnd=null,minEnd=null,maxRange=null,minRange=null,guard=null,winner=null,answer=null,witness=null;
  const copy=r=>r?[...r]:null;
  function complement(){return minRange?[...(minRange[1]<n-1?[[minRange[1]+1,n-1]]:[]),...(minRange[0]>0?[[0,minRange[0]-1]]:[])]:[];}
  function emit(line,phase,event,pending=null,show=true){
    if(!show)return;
    const visible=n<=12?Array.from({length:n},(_,i)=>i):[...new Set([0,1,2,n-3,n-2,n-1,...Array.from({length:5},(_,k)=>(py.i??0)+k-2)].filter(i=>i>=0&&i<n))].sort((a,b)=>a-b);
    const final=phase==='done';
    steps.push({title:bi(`L${line} · ${event.vi}`,`L${line} · ${event.en}`),note:bi('',''),codeLines:[line],codeBlock:1,debugLine:line,final,arr:[],highlight:[],mark:[],
      vars:Object.entries(py).filter(([,value])=>value!==null).map(([name,value])=>({name,value})),
      circular918PictureView:{line,source:CODE[line-1],timing:'before',phase,event,pending,detailed,n,
        cells:visible.map(index=>({index,value:nums[index]})),omitted:n-visible.length,
        pythonLocals:{...py},maxEnd:copy(maxEnd),minEnd:copy(minEnd),maxRange:copy(maxRange),minRange:copy(minRange),
        guard,wrapRanges:complement(),wrapEmpty:minRange!==null&&minRange[0]===0&&minRange[1]===n-1,
        winner,answer:final?answer:null,witness:final?{...witness,ranges:witness.ranges.map(copy)}:null,
      }});
  }
  const pending=(target,after,options=null)=>({target,before:py[target]??null,after,options});
  emit(3,'init',bi('Bắt đầu tại ô 0','Start at cell 0'),{target:'total, cur_max, max_sum',before:null,after:nums[0]});
  py.total=py.cur_max=py.max_sum=nums[0];maxEnd=maxRange=[0,0];
  emit(4,'init',bi('Khởi tạo đoạn MIN','Initialize MIN'),{target:'cur_min, min_sum',before:null,after:nums[0]});
  py.cur_min=py.min_sum=nums[0];minEnd=minRange=[0,0];
  for(let next=1;next<n;next++){
    const show=detailed||next<=3||next>=n-3;
    emit(5,'loop',bi('Sang ô tiếp theo','Move to the next cell'),pending('i',next),show);py.i=next;
    emit(6,'read',bi('Đọc ô hiện tại','Read this cell'),pending('x',nums[next]),show);py.x=nums[next];
    const maxRestart=py.x,maxExtend=py.cur_max+py.x;
    emit(7,'max',bi('Bắt đầu mới hay nối tiếp?','Restart or extend?'),pending('cur_max',Math.max(maxRestart,maxExtend),{restart:maxRestart,extend:maxExtend,kind:'max'}),show);
    maxEnd=[maxRestart>maxExtend?next:maxEnd[0],next];py.cur_max=Math.max(maxRestart,maxExtend);
    emit(8,'max',bi('Giữ đoạn MAX tốt nhất','Keep the best MAX segment'),pending('max_sum',Math.max(py.max_sum,py.cur_max)),show);
    if(py.cur_max>py.max_sum){py.max_sum=py.cur_max;maxRange=copy(maxEnd);}
    const minRestart=py.x,minExtend=py.cur_min+py.x;
    emit(9,'min',bi('Tìm đoạn để loại','Find a segment to remove'),pending('cur_min',Math.min(minRestart,minExtend),{restart:minRestart,extend:minExtend,kind:'min'}),show);
    minEnd=[minRestart<minExtend?next:minEnd[0],next];py.cur_min=Math.min(minRestart,minExtend);
    emit(10,'min',bi('Giữ đoạn MIN nhỏ nhất','Keep the smallest MIN segment'),pending('min_sum',Math.min(py.min_sum,py.cur_min)),show);
    if(py.cur_min<py.min_sum){py.min_sum=py.cur_min;minRange=copy(minEnd);}
    emit(11,'total',bi('Cộng vào tổng','Add to total'),pending('total',py.total+py.x),show);py.total+=py.x;
  }
  emit(5,'loop-end',bi('Đã quét hết mảng','Finished scanning'));
  emit(12,'guard',bi('Toàn số âm?','All negative?'),{target:'max_sum < 0',after:py.max_sum<0,kind:'condition'});guard=py.max_sum<0;
  if(guard){winner='normal';answer=py.max_sum;}
  else{
    emit(14,'wrap',bi('Toàn mảng trừ đoạn MIN','Whole array minus MIN'),pending('circular_sum',py.total-py.min_sum));
    py.circular_sum=py.total-py.min_sum;
    winner=complement().length&&py.circular_sum>py.max_sum?'wrap':'normal';answer=Math.max(py.max_sum,py.circular_sum);
  }
  const ranges=winner==='wrap'?complement():[copy(maxRange)];
  witness={ranges,sum:answer,length:ranges.reduce((length,[left,right])=>length+right-left+1,0),wraps:ranges.length===2};
  emit(guard?13:15,'done',bi(`Chọn tổng ${answer}`,`Choose sum ${answer}`),{target:'return',after:answer,kind:'return'});
  return {original:[...nums],answer,witness,steps};
}
module.exports={918:{...base,builder:buildSteps,debugMode:'line',liveArgs:input=>[[...parse(input)]],limits:{maxLength:30000,minValue:-30000,maxValue:30000},
  approach:[bi('Cuối mảng nối về đầu: [5, −3, 5] có thể chọn 5 ↻ 5 = 10.','The end connects to the start: [5, −3, 5] can choose 5 ↻ 5 = 10.'),bi('So sánh: giữ đoạn MAX, hoặc bỏ đoạn MIN khỏi toàn mảng.','Compare: keep MAX, or remove MIN from the whole array.'),bi('Phải chọn ít nhất một ô. Toàn âm → lấy ô lớn nhất.','Choose at least one cell. All negative → take the largest cell.')],
}};
