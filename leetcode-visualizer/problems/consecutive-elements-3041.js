'use strict';
const bi=(vi,en)=>({vi,en});
const CODE=[
  'from collections import defaultdict',
  '',
  'class Solution:',
  '    def maxSelectedElements(self, nums):',
  '        nums.sort()',
  '        dp = defaultdict(int)',
  '        for x in nums:',
  '            dp[x + 1] = dp[x] + 1',
  '            dp[x] = dp[x - 1] + 1',
  '        return max(dp.values())',
];
function parse(input){if(!Array.isArray(input)||input.length<1||input.length>100000||input.some(x=>!Number.isInteger(x)||x<1||x>1000000))throw new Error('3041: cần 1..100000 số nguyên trong [1, 10^6]. / Use 1..100000 integers in [1, 10^6].');return input;}
function buildSteps(input){
  const original=parse(input),n=original.length,detailed=n<=24,steps=[],py={nums:[...original],dp:null,x:null};
  let tagged=original.map((value,id)=>({value,id})),sorted=false,index=-1,options=null,best=null;
  const chains=new Map(),sampled=new Set([0,1,n-2,n-1]);
  function path(node){if(!node)return{length:0,nodes:[],omitted:0};const full=[];for(let p=node;p;p=p.previous)full.push({id:p.id,sortedIndex:p.sortedIndex,from:p.from,to:p.to});full.reverse();const chosen=full.length<=12?full:full.slice(0,3).concat(full.slice(-3));return{length:node.length,nodes:chosen,omitted:full.length-chosen.length};}
  function preview(option){return option?{target:option.target,source:option.source,before:option.before,length:option.length,previousLength:option.length-1,prefix:option.prefix,choice:option.choice}:null;}
  function tail(node){const nodes=[];for(let p=node;p&&nodes.length<4;p=p.previous)nodes.push({id:p.id,sortedIndex:p.sortedIndex,from:p.from,to:p.to});nodes.reverse();return{length:node?.length??0,nodes,omitted:Math.max(0,(node?.length??0)-nodes.length)};}
  function emit(line,{pending=null,force=false,final=false}={}){
    if(!detailed&&!force)return;
    const indices=n<=12?tagged.map((_,i)=>i):[...new Set([0,1,index-1,index,index+1,n-2,n-1].filter(i=>i>=0&&i<n))].sort((a,b)=>a-b);
    const keys=py.dp?(detailed?[...new Set([...py.dp.keys(),...(py.x===null?[]:[py.x-1,py.x,py.x+1])])].sort((a,b)=>a-b):py.x===null?[]:[...new Set([py.x-2,py.x-1,py.x,py.x+1,py.x+2,best?.to-1,best?.to,best?.to+1].filter(x=>Number.isInteger(x)&&x>=0))].sort((a,b)=>a-b)):[];
    const answer=final?best.length:null,witness=final?path(best):null;
    steps.push({title:bi(`Dòng ${line} · ${final?'Dãy liên tiếp dài nhất':line===8?'Tăng 1 trước':line===9?'Giữ nguyên sau':line===5?'Sắp xếp':'Xét số kế tiếp'}`,`Line ${line} · ${final?'Longest consecutive selection':line===8?'Increment first':line===9?'Keep second':line===5?'Sort':'Process the next value'}`),note:bi('',''),codeBlock:1,codeLines:[line],debugLine:line,final,arr:[],highlight:[],mark:[],
      vars:py.x===null?[]:[{name:'x',value:py.x}],
      consecutive3041View:{n,detailed,line,source:CODE[line-1],timing:'before',sorted,index,x:py.x,pending,
        pythonLocals:{nums:detailed?[...py.nums]:null,dp:detailed&&py.dp?[...py.dp].sort(([a],[b])=>a-b):null,x:py.x},
        cells:indices.map(i=>({index:i,id:tagged[i].id,value:tagged[i].value})),omitted:n-indices.length,
        states:keys.map(key=>({key,value:py.dp.get(key)??0,stored:py.dp.has(key)})),stateCount:py.dp?.size??0,
        options:options?{increment:preview(options.increment),keep:preview(options.keep)}:null,
        best:best?{length:best.length,to:best.to}:null,answer,witness,
      }});
  }
  emit(5,{force:true});tagged.sort((a,b)=>a.value-b.value||a.id-b.id);py.nums=tagged.map(item=>item.value);sorted=true;
  emit(6,{force:true});py.dp=new Map();emit(7,{force:true});
  for(index=0;index<n;index++){
    const item=tagged[index],x=item.value,keep=sampled.has(index);py.x=x;
    options={increment:{choice:'increment',source:x,target:x+1,before:py.dp.get(x+1)??0,length:(py.dp.get(x)??0)+1,prefix:tail(chains.get(x)),previous:chains.get(x)||null},keep:{choice:'keep',source:x-1,target:x,before:py.dp.get(x)??0,length:(py.dp.get(x-1)??0)+1,prefix:tail(chains.get(x-1)),previous:chains.get(x-1)||null}};
    for(const [key,line]of [['increment',8],['keep',9]]){
      const option=options[key];emit(line,{force:keep,pending:{target:`dp[${option.target}]`,before:option.before,after:option.length,source:option.source,sourceLength:option.length-1}});
      if(!py.dp.has(option.source))py.dp.set(option.source,0);
      py.dp.set(option.target,option.length);
      const node={id:item.id,sortedIndex:index,from:x,to:option.target,length:option.length,previous:option.previous};chains.set(option.target,node);if(!best||node.length>best.length)best=node;
    }
    emit(7,{force:keep});
  }
  index=n-1;emit(10,{force:true,final:true,pending:{target:'return',after:best.length}});
  return{original:[...original],answer:best.length,witness:path(best),steps};
}
module.exports={3041:{id:3041,difficulty:'hard',slug:'maximize-consecutive-elements-in-an-array-after-modification',category:{key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'},tags:[{key:'sorting',vi:'Sắp xếp',en:'Sorting'},{key:'array',vi:'Mảng',en:'Array'}],title:bi('Maximize Consecutive Elements in an Array After Modification','Maximize Consecutive Elements in an Array After Modification'),titleVi:bi('Giữ hoặc +1 · ghép dãy liên tiếp dài nhất','Keep or +1 · build the longest consecutive sequence'),
  statement:bi('Mỗi phần tử được giữ nguyên hoặc tăng 1. Chọn các phần tử sao cho sau khi sắp xếp, chúng liên tiếp và không trùng nhau. Tìm số phần tử chọn được nhiều nhất.','Keep each element or increment it by 1. Select as many elements as possible so their sorted values are consecutive and distinct.'),
  defaultInput:[2,1,5,1,1],inputKind:'positive',inputLabel:bi('nums · số nguyên dương','nums · positive integers'),extraParams:[],debugMode:'line',code:CODE,builder:buildSteps,liveArgs:input=>[[...parse(input)]],limits:{maxLength:100000,minValue:1,maxValue:1000000},
  approach:[bi('dp[k] là độ dài dãy liên tiếp tốt nhất kết thúc ở k.','dp[k] is the best consecutive sequence length ending at k.'),bi('Sắp xếp. Với x: cập nhật x+1 trước, rồi x; tránh dùng một phần tử hai lần.','Sort. For each x, update x+1 first, then x, so one element is never used twice.')],
  complexity:{time:'O(n log n)',space:'O(n)',note:bi('Debug mọi dòng với ≤ 24 số; mảng lớn gộp các vòng lặp trung gian, vẫn tính đủ.','Every line is traced for ≤ 24 values; larger arrays summarize middle iterations and are fully processed.')},
}};
