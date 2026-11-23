'use strict';
const {runTrace}=require('./wasm-picture-trace');
const base=require('./array')[128],bi=(vi,en)=>({vi,en});
const CODE=`class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:
        num_set = set(nums)
        best = 0
        for num in num_set:
            if num - 1 not in num_set:
                length = 1
                while num + length in num_set:
                    length += 1
                best = max(best, length)
        return best`;
function parse(input){
  let nums=input;
  try{if(typeof input==='string'){const raw=input.trim();nums=raw.startsWith('[')?JSON.parse(raw):raw?raw.split(',').map(s=>s.trim()?Number(s):NaN):[];}}catch{nums=null;}
  if(!Array.isArray(nums)||nums.length>24||nums.some(n=>!Number.isInteger(n)||Math.abs(n)>1e9))throw new RangeError('128: enter up to 24 integers from -1,000,000,000 to 1,000,000,000, comma-separated or JSON; [] is allowed.');
  return [...nums];
}
function build(input){
  const nums=parse(input),unique=[...new Set(nums)].sort((a,b)=>a-b),code=CODE.split('\n');
  const trace=runTrace({code:CODE,method:'longestConsecutive',args:[nums]}),runs=[];
  let query=null,current=null,bestRun=null,bestSeen=0;
  const steps=trace.events.map((record,index)=>{
    const x=record.outer,source=code[record.line-1].trim(),final=index===trace.events.length-1;
    let event='prepare';
    if(source==='num_set = set(nums)')event='set';
    if(source==='for num in num_set:'&&record.branch){query=null;current=null;event='choose';}
    if(source==='if num - 1 not in num_set:'){query={value:x.num-1,exists:!record.branch,kind:'previous'};event=record.branch?'head':'skip';}
    if(source==='length = 1'){current={start:x.num,length:1};query=null;event='start';}
    if(source==='while num + length in num_set:'){query={value:x.num+x.length,exists:record.branch,kind:'next'};event=record.branch?'probe':'stop';}
    if(source==='length += 1'){current={start:x.num,length:x.length};event='extend';}
    if(source==='best = max(best, length)'){
      current={start:x.num,length:x.length};runs.push({...current,step:index});event='record';
      if(x.best>bestSeen){bestSeen=x.best;bestRun={...current};}
    }
    if(final){event='done';query=null;current=null;}
    const titles={prepare:bi('Chỉ đếm từ đầu dãy','Count only from run heads'),set:bi('Set bỏ số trùng, tra cứu nhanh','A set removes duplicates and supports fast lookup'),head:bi(`${x.num} là đầu dãy: thiếu ${x.num-1}`,`${x.num} starts a run: ${x.num-1} is absent`),skip:bi(`Có ${x.num-1} → bỏ ${x.num}, tránh đếm lại`,`${x.num-1} exists → skip ${x.num} to avoid recounting`),extend:bi(`Dãy từ ${x.num} đã dài ${x.length}`,`Run from ${x.num} now has length ${x.length}`),stop:bi(`Thiếu ${query?.value} → dừng dãy`,`Missing ${query?.value} → stop the run`),record:bi(`Giữ độ dài tốt nhất: ${x.best}`,`Keep the best length: ${x.best}`),done:bi(`Dãy liên tiếp dài nhất: ${trace.answer}`,`Longest consecutive run: ${trace.answer}`)};
    return{arr:[],codeBlock:1,codeLines:[record.line],final,title:titles[event]||bi(`Xét số ${x.num??'…'}`,`Inspect ${x.num??'…'}`),note:bi('',''),vars:['num','length','best','num_set'].map(name=>({name,value:x[name]??'—'})),consecutive128View:{nums:[...nums],unique:[...unique],duplicates:nums.length-unique.length,source,event,num:x.num??null,query:query?{...query}:null,current:current?{...current}:null,best:x.best??0,bestRun:bestRun?{...bestRun}:null,runs:runs.map(r=>({...r})),final,answer:final?trace.answer:null}};
  });
  return{original:nums,answer:trace.answer,steps};
}
module.exports={128:{...base,inputKind:'string',allowEmptyInput:true,defaultInput:'100,4,200,1,3,2',inputLabel:bi('nums · tối đa 24 số nguyên · cách nhau dấu phẩy hoặc JSON','nums · up to 24 integers · comma-separated or JSON'),statement:bi('Tìm độ dài dãy số liên tiếp dài nhất trong mảng không có thứ tự. Các phần tử không cần đứng cạnh nhau trong input; số trùng chỉ được tính một lần. Thuật toán dùng set, không sắp xếp. Bản trực quan hỗ trợ tối đa 24 số.','Find the longest consecutive integer sequence in an unordered array. Its members need not be adjacent in the input; duplicates count once. The algorithm uses a set without sorting. Visualization supports up to 24 numbers.'),code:CODE.split('\n'),debugMode:'line-by-line',builder:build,liveArgs:input=>[parse(input)]}};
