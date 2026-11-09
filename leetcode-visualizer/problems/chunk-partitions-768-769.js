'use strict';
const base=require('./monotonic-stack');
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en}),copy=x=>JSON.parse(JSON.stringify(x));
const CODES={768:`class Solution:
    def maxChunksToSorted(self, arr):
        stack = []
        for i, value in enumerate(arr):
            mx = value
            while stack and stack[-1] > value:
                popped = stack.pop()
                mx = max(mx, popped)
            stack.append(mx)
        return len(stack)`,769:base[769].code.join('\n')};
function parse(id,input){
  let a=input;try{if(typeof a==='string'){const s=a.trim();a=s.startsWith('[')?JSON.parse(s):s?s.split(',').map(t=>t.trim()?Number(t):NaN):[];}}catch{a=null;}
  const limit=id===769?10:16;
  if(!Array.isArray(a)||!a.length||a.length>limit||!Array.from(a).every(v=>Number.isInteger(v)&&v>=0&&v<=(id===769?a.length-1:1e8)))throw new RangeError(`#${id}: use 1–${limit} valid nonnegative integers`);
  if(id===769&&new Set(a).size!==a.length)throw new RangeError('#769 requires a permutation of 0…n−1');
  return [...a];
}
function payload(id,input){return {code:CODES[id],method:'maxChunksToSorted',args:[parse(id,input)]};}
function build(id,input){
  const request=payload(id,input),values=request.args[0],source=CODES[id].split('\n'),native=runTrace(request),chunks=[],visits=[],events=[];
  let current=null,pending=null,comparison=null,owner=null;
  const steps=native.events.map((e,step)=>{
    const x=e.locals,text=source[e.line-1].trim();let change=null;
    if(text==='for i, value in enumerate(arr):'){
      current=e.branch?x.i:null;comparison=null;
      if(e.branch){const start=id===768?x.i:(chunks.at(-1)?.end??-1)+1;pending={start,end:x.i};visits.push({index:x.i,step});change={kind:'visit',index:x.i};}
    }
    if(id===768){
      if(text==='while stack and stack[-1] > value:')comparison={left:x.stack.at(-1)??null,right:x.value,op:'>',pass:e.branch};
      if(text==='popped = stack.pop()'){
        const chunk=chunks.pop();pending={start:chunk.start,end:x.i};
        const row={kind:'merge',chunk:copy(chunk),start:chunk.start,end:x.i,step};events.push(row);change=row;
      }
      if(text==='mx = max(mx, popped)')change={kind:'max',value:x.mx};
      if(text==='stack.append(mx)'){
        const chunk={start:pending.start,end:x.i,max:x.mx};chunks.push(chunk);pending=null;change={kind:'commit',chunk:copy(chunk)};
      }
    }else{
      if(text==='max_so_far = max(max_so_far, value)'){owner=values.indexOf(x.max_so_far);change={kind:'max',value:x.max_so_far};}
      if(text==='if max_so_far == i:')comparison={left:x.max_so_far,right:x.i,op:'==',pass:e.branch};
      if(text==='chunks += 1'){
        const chunk={start:pending.start,end:x.i,max:x.max_so_far};chunks.push(chunk);pending=null;
        const row={kind:'cut',chunk:copy(chunk),step};events.push(row);change=row;
      }
    }
    const final=e.returning&&e.scope==='maxChunksToSorted';
    const illustration=final?chunks.map(chunk=>({start:chunk.start,end:chunk.end,
      before:values.slice(chunk.start,chunk.end+1).map((value,k)=>({value,index:chunk.start+k})),
      after:values.slice(chunk.start,chunk.end+1).map((value,k)=>({value,index:chunk.start+k})).sort((a,b)=>a.value-b.value||a.index-b.index)})):null;
    const v={id,values,current:final?null:current,pending:copy(pending),chunks:copy(chunks),maxima:x.stack??null,
      count:id===768?(x.stack?.length??null):(x.chunks??null),mx:x.mx??null,maxSoFar:x.max_so_far??null,owner,
      comparison:copy(comparison),events:copy(events),visits:copy(visits),change,illustration,
      source:{line:e.line,text,timing:'after'},locals:x,outer:e.outer,frames:e.frames,scope:e.scope,branch:e.branch,
      returned:e.returned,returning:e.returning,trace:native.trace,result:final?native.answer:null};
    return {arr:[],codeBlock:1,codeLines:[e.line],final,title:bi(`L${e.line} · ${text}`,`L${e.line} · ${text}`),note:bi('',''),vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),chunkPartitionsView:v};
  });return {original:values,answer:native.answer,steps};
}
module.exports=Object.fromEntries([768,769].map(id=>[id,{...base[id],code:CODES[id].split('\n'),debugMode:'line-by-line',builder:input=>build(id,input),tracePayload:input=>payload(id,input),liveArgs:input=>[parse(id,input)],
  inputLabel:bi(id===768?'arr · 1–16 số, 0…10⁸':'arr · hoán vị 0…n−1 · 1–10 phần tử',id===768?'arr · 1–16 integers, 0…10⁸':'arr · permutation of 0…n−1 · 1–10 elements'),
  visualizationLimits:{maxValues:id===768?16:10,completeTrace:true}}]));
