'use strict';
function attach(base,id){
 return {...base,builder:(input,params={})=>{
  const result=base.builder(input,params),method=Number(params.approach)||1,k=id===525?null:Number(params.k??(id===523?6:5)),code=base[method===1?'code':'code'+method]??base.code;
  for(const step of result.steps){
   const frame=step.prefixRemainderView;if(!frame)continue;
   if(id===525&&step.final)step.codeLines=[code.length];
   const vars=Object.fromEntries((step.vars??[]).map(variable=>[variable.name,variable.value]));
   const sums=[0,...frame.prefixSums],keys=[0,...(id===525?frame.prefixSums:frame.remainders)];
   const current=frame.current>=0?frame.current+1:null;
   const groups=frame.entries.map(entry=>({key:entry.remainder,value:entry.index,positions:id===974?keys.map((key,index)=>key===entry.remainder?index:-1).filter(index=>index>=0).slice(0,entry.index):[entry.index+1]}));
   const pairs=[];
   if(id===974&&step.final){for(const group of groups)for(let a=0;a<group.positions.length;a++)for(let b=a+1;b<group.positions.length;b++){if(pairs.length>=200)break;pairs.push([group.positions[a],group.positions[b]]);}}
   const match=frame.matchStart>=0&&frame.matchEnd>=frame.matchStart?[frame.matchStart,frame.matchEnd+1]:null;
   const currentKey=current===null?null:keys[current],prior=currentKey===null||current===null?[]:keys.map((key,index)=>key===currentKey&&index<current?index:-1).filter(index=>index>=0);
   const count=id===974?vars.total??vars.sum_count??vars.answer??0:id===525?vars.max_len??(match?match[1]-match[0]:0):null;
   step.prefixCollisionView={id,method,nums:frame.nums,k,sums,keys,current,groups,match,matchState:frame.matchState??null,proof:frame.proof??null,prior,
    gain:id===974?prior.length:null,count,pairs,line:step.codeLines?.[0]??null,source:(step.codeLines??[]).map(line=>code[line-1]).filter(Boolean).join('\n'),final:Boolean(step.final),answer:step.final?result.answer:null};
  }
  return result;
 }};
}
module.exports={attach};
