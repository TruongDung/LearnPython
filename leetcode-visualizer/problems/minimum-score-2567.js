'use strict';
const bi=(vi,en)=>({vi,en});
const CODE=[
  'class Solution:',
  '    def minimizeSum(self, nums):',
  '        nums.sort()',
  '        n = len(nums)',
  '        left = nums[n - 1] - nums[2]',
  '        middle = nums[n - 2] - nums[1]',
  '        right = nums[n - 3] - nums[0]',
  '        return min(left, middle, right)',
];
function parse(input){
  if(!Array.isArray(input)||input.length<3||input.length>100000||input.some(value=>!Number.isInteger(value)||value<1||value>1000000000))throw new Error('2567: cần 3..100000 số nguyên trong [1, 10^9]. / Use 3..100000 integers in [1, 10^9].');
  return input;
}
function buildSteps(input){
  const original=parse(input),n=original.length,steps=[],fullArray=n<=40;
  let nums=[...original],tagged=null,sorted=false,cases=null,answer=null,witness=null;
  const py={n:null,left:null,middle:null,right:null};
  function emit(line,pending=null,final=false){
    const visible=n<=12?Array.from({length:n},(_,index)=>index):[0,1,2,3,n-4,n-3,n-2,n-1];
    steps.push({title:bi(`L${line} · ${line===3?'Sắp xếp':line===8?'Chọn điểm nhỏ nhất':'So sánh ba cách đổi'}`,`L${line} · ${line===3?'Sort':line===8?'Choose the minimum score':'Compare three choices'}`),note:bi('',''),
      codeLines:[line],codeBlock:1,debugLine:line,final,arr:[],highlight:[],mark:[],vars:Object.entries(py).filter(([,value])=>value!==null).map(([name,value])=>({name,value})),
      score2567PictureView:{n,line,source:CODE[line-1],timing:'before',sorted,fullArray,pending,
        pythonLocals:{nums:fullArray?[...nums]:null,...py},cells:visible.map(index=>({index,value:nums[index]})),omitted:n-visible.length,
        cases:cases?cases.map((item,index)=>({...item,changed:[...item.changed],value:py[['left','middle','right'][index]]})):null,
        answer:final?answer:null,witness:final?{...witness,changes:witness.changes.map(item=>({...item}))}:null,
      }});
  }
  emit(3,{target:'nums',before:bi('chưa sắp','unsorted'),after:bi('tăng dần','ascending'),kind:'sort'});
  tagged=nums.map((value,originalIndex)=>({value,originalIndex})).sort((a,b)=>a.value-b.value||a.originalIndex-b.originalIndex);
  nums=tagged.map(item=>item.value);sorted=true;
  cases=[{key:'left',from:2,to:n-1,anchor:nums[2],changed:[0,1]},
    {key:'middle',from:1,to:n-2,anchor:nums[1],changed:[0,n-1]},
    {key:'right',from:0,to:n-3,anchor:nums[n-3],changed:[n-2,n-1]}]
    .map(item=>({...item,low:nums[item.from],high:nums[item.to],width:nums[item.to]-nums[item.from]}));
  emit(4,{target:'n',before:null,after:n});py.n=n;
  for(let index=0;index<3;index++){
    const item=cases[index];emit(5+index,{target:item.key,before:null,after:item.width,formula:`${item.high} − ${item.low}`});py[item.key]=item.width;
  }
  answer=Math.min(py.left,py.middle,py.right);
  const caseIndex=cases.findIndex(item=>item.width===answer),chosen=cases[caseIndex];
  witness={caseIndex,lowScore:0,highScore:answer,anchor:chosen.anchor,lower:chosen.low,upper:chosen.high,
    changes:chosen.changed.map(index=>({sortedIndex:index,originalIndex:tagged[index].originalIndex,from:nums[index],to:chosen.anchor})),
  };
  emit(8,{target:'return',after:answer,kind:'return'},true);
  return{original:[...original],answer,witness,steps};
}
module.exports={2567:{id:2567,difficulty:'medium',slug:'minimum-score-by-changing-two-elements',
  category:{key:'greedy',vi:'Tham lam',en:'Greedy'},tags:[{key:'sorting',vi:'Sắp xếp',en:'Sorting'},{key:'array',vi:'Mảng',en:'Array'}],
  title:bi('Minimum Score by Changing Two Elements','Minimum Score by Changing Two Elements'),titleVi:bi('Đổi hai phần tử để điểm nhỏ nhất','Change two entries for the minimum score'),
  statement:bi('Điểm = (lớn nhất − nhỏ nhất) + khoảng cách nhỏ nhất giữa hai phần tử. Được đổi hai phần tử; tìm điểm nhỏ nhất.','Score = (max − min) + the smallest pairwise gap. Change two entries to minimize it.'),
  defaultInput:[1,5,6,7,20],inputKind:'positive',inputLabel:bi('nums · ít nhất 3 số','nums · at least 3 numbers'),extraParams:[],debugMode:'line',code:CODE,builder:buildSteps,liveArgs:input=>[[...parse(input)]],
  limits:{maxLength:100000,minValue:1,maxValue:1000000000},
  approach:[bi('Cho hai số bằng nhau → khoảng cách nhỏ nhất = 0.','Make a pair equal → minimum pairwise gap = 0.'),bi('Sau khi sắp xếp, chỉ cần thử: đổi 2 nhỏ nhất, mỗi đầu 1 số, hoặc 2 lớn nhất.','After sorting, try changing the two smallest, one at each end, or the two largest.'),bi('Đưa hai số vào trong khoảng giữ lại; chọn khoảng hẹp nhất.','Move the two values inside the retained range; choose the narrowest range.')],
  complexity:{time:'O(n log n)',space:'O(n)',note:bi('Sắp xếp, rồi so sánh đúng ba khoảng.','Sort, then compare exactly three ranges.')},
}};
