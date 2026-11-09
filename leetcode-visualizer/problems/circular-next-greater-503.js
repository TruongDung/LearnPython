'use strict';
const base = require('./hashmap')[503];
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi,en) => ({vi,en}), copy = x => JSON.parse(JSON.stringify(x));
const CODE = `class Solution:
    def nextGreaterElements(self, nums):
        answer = [-1] * len(nums)
        stack = []
        for i in range(2 * len(nums)):
            idx = i % len(nums)
            while stack and nums[stack[-1]] < nums[idx]:
                j = stack.pop()
                answer[j] = nums[idx]
            if i < len(nums):
                stack.append(idx)
        return answer`;
function parse(input) {
  let a=input;
  try {if(typeof a==='string'){const s=a.trim();a=s.startsWith('[')?JSON.parse(s):s?s.split(',').map(t=>t.trim()?Number(t):NaN):[];}}catch{a=null;}
  if(!Array.isArray(a)||!a.length||a.length>14||!Array.from(a).every(x=>Number.isInteger(x)&&x>=-1e9&&x<=1e9))throw new RangeError('#503: use 1–14 integers from −10⁹ to 10⁹');
  return [...a];
}
function payload(input){return {code:CODE,method:'nextGreaterElements',args:[parse(input)]};}
function build(input){
  const request=payload(input),values=request.args[0],code=CODE.split('\n'),native=runTrace(request),targets=values.map(()=>null),writes=[],visits=[];
  let current=null,pending=null,comparison=null,edge=null;
  const steps=native.events.map((e,step)=>{
    const x=e.locals,text=code[e.line-1].trim();let change=null;
    if(text==='for i in range(2 * len(nums)):'){current=null;comparison=null;edge=null;pending=null;}
    if(text==='idx = i % len(nums)'){current=x.idx;visits.push({index:x.idx,round:Math.floor(x.i/values.length)+1,step});change={kind:'visit',index:x.idx};}
    if(text.startsWith('while stack ')){const top=x.stack.at(-1)??null;comparison={top,left:top===null?null:values[top],right:values[x.idx],pass:e.branch};}
    if(text==='j = stack.pop()'){pending=x.j;edge={from:x.j,to:x.idx,committed:false};change={kind:'pop',index:x.j};}
    if(text==='answer[j] = nums[idx]'){
      const row={from:x.j,to:x.idx,value:x.answer[x.j],round:Math.floor(x.i/values.length)+1,wrapped:x.idx<x.j,step};
      writes.push(row);targets[x.j]=x.idx;pending=null;edge={from:x.j,to:x.idx,committed:true};change={kind:'write',...row};
    }
    if(text==='stack.append(idx)')change={kind:'push',index:x.idx};
    const final=e.returning&&e.scope==='nextGreaterElements';
    const v={id:503,values,current:final?null:current,round:x.i===undefined?null:Math.floor(x.i/values.length)+1,
      iteration:x.i??null,idx:x.idx??null,stack:x.stack??null,answer:x.answer??null,targets:[...targets],writes:copy(writes),visits:copy(visits),
      pending,comparison:copy(comparison),edge:copy(edge),change,source:{line:e.line,text,timing:'after'},locals:x,outer:e.outer,frames:e.frames,
      scope:e.scope,branch:e.branch,returning:e.returning,returned:e.returned,trace:native.trace,result:final?native.answer:null};
    return {arr:[],codeBlock:1,codeLines:[e.line],final,title:bi(`L${e.line} · ${text}`,`L${e.line} · ${text}`),note:bi('',''),vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),circularNext503View:v};
  });return {original:values,answer:native.answer,steps};
}
module.exports={503:{...base,code:CODE.split('\n'),debugMode:'line-by-line',builder:build,tracePayload:payload,liveArgs:input=>[parse(input)],
  inputLabel:bi('nums · 1–14 số, −10⁹…10⁹','nums · 1–14 integers, −10⁹…10⁹'),
  approach:[bi('Quét 2n bước với idx = i % n. Chỉ push ở lượt đầu; mỗi POP được gán phần tử lớn hơn đầu tiên ở dòng riêng.',
    'Scan 2n steps with idx = i % n. Push only during the first pass; each POP receives its first greater value on a separate line.')],visualizationLimits:{maxValues:14,completeTrace:true}}};
