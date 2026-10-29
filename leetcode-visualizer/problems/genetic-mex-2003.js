'use strict';
const base=require('./hard-tree-visualizations')[2003],bi=(vi,en)=>({vi,en}),copy=value=>Array.isArray(value)?value.map(copy):value;
function build(input,params={}){
 const {parents,nums}=base.parser(input,params),x={parents,nums},steps=[],seen=new Set(),scanned=new Set(),finalized=new Set(),history=[];let one=null;
 function emit(line,event,title,options={}){
  const locals=Object.fromEntries(Object.entries(x).map(([key,value])=>[key,key==='seen'?[...seen].sort((a,b)=>a-b):copy(value)]));
  steps.push({arr:[],title,note:bi('',''),codeLines:[line],codeBlock:1,final:event==='done',vars:['node','current','blocked','mex','seen','answer'].map(name=>({name,value:locals[name]??'—'})),
   genetic2003View:{event,source:{line,text:base.code[line-1],timing:'after'},locals,parents,nums,one,ancestor:x.node??null,current:options.current??null,blocked:x.blocked??null,mex:x.mex??null,
    answer:copy(x.answer??null),children:copy(x.children??null),work:copy(x.stack??null),seen:x.seen===undefined?null:[...seen].sort((a,b)=>a-b),scanned:[...scanned],finalized:[...finalized],history:history.map(h=>({...h,seen:[...h.seen]})),
    check:options.check??null,change:options.change??null},
  });
 }
 x.n=parents.length;emit(3,'size',bi(`n = ${x.n}`,`n = ${x.n}`));x.answer=Array(x.n).fill(1);emit(4,'init',bi('answer = [1] × n','answer = [1] × n'));emit(5,'try',bi('Tìm gene 1','Locate gene 1'));
 one=nums.indexOf(1);if(one<0){emit(6,'missing-one',bi('1 ∉ nums → ValueError','1 ∉ nums → ValueError'));emit(7,'except',bi('Bắt ValueError','Catch ValueError'));emit(8,'done',bi('Mọi cây con đều thiếu 1','Every subtree is missing 1'));return {original:{parents,nums},answer:x.answer,steps};}
 x.node=one;emit(6,'locate',bi(`nums[${one}] = 1`,`nums[${one}] = 1`));x.children=Array.from({length:x.n},()=>[]);emit(9,'children-init',bi('children = [∅, …]','children = [∅, …]'));
 for(let child=1;child<x.n;child++){x.child=child;emit(10,'child',bi(`${parents[child]} → ${child}`,`${parents[child]} → ${child}`));x.children[parents[child]].push(child);emit(11,'link',bi(`children[${parents[child]}] ← ${child}`,`children[${parents[child]}] ← ${child}`),{current:child});}emit(10,'children-end',bi('Xong danh sách con','Child lists complete'));
 x.seen=[];emit(12,'seen-init',bi('seen = ∅','seen = ∅'));x.mex=1;x.blocked=-1;emit(13,'pointers',bi('mex = 1 · blocked = −1','mex = 1 · blocked = −1'));
 while(x.node!==-1){emit(14,'ancestor',bi(`Mở cây con ${x.node}`,`Open subtree ${x.node}`),{check:true});x.stack=[x.node];emit(15,'stack-init',bi(`stack ← ${x.node}`,`stack ← ${x.node}`));
  while(x.stack.length){emit(16,'while',bi('stack ≠ ∅','stack ≠ ∅'),{check:true});x.current=x.stack.pop();emit(17,'take',bi(`Lấy ${x.current}`,`Take ${x.current}`),{current:x.current});const blocked=x.current===x.blocked;emit(18,'blocked-check',bi(blocked?'× Nhánh đã quét':'✓ Nhánh mới',blocked?'× Already scanned branch':'✓ New branch'),{current:x.current,check:blocked});if(blocked){emit(19,'skip',bi('Bỏ qua nhánh blocked','Skip blocked branch'),{current:x.current});continue;}
   seen.add(nums[x.current]);scanned.add(x.current);emit(20,'see',bi(`seen ← ${nums[x.current]}`,`seen ← ${nums[x.current]}`),{current:x.current,change:{type:'seen',node:x.current,value:nums[x.current]}});x.stack.push(...x.children[x.current]);emit(21,'extend',bi(`stack + children[${x.current}]`,`stack + children[${x.current}]`),{current:x.current});
  }emit(16,'empty',bi('stack = ∅','stack = ∅'),{check:false});
  while(seen.has(x.mex)){emit(22,'mex-check',bi(`${x.mex} ∈ seen ✓`,`${x.mex} ∈ seen ✓`),{check:true});const from=x.mex;x.mex++;emit(23,'mex',bi(`mex: ${from} → ${x.mex}`,`mex: ${from} → ${x.mex}`),{change:{type:'mex',from,to:x.mex}});}emit(22,'mex-check',bi(`${x.mex} ∉ seen`,`${x.mex} ∉ seen`),{check:false});
  const from=x.answer[x.node];x.answer[x.node]=x.mex;finalized.add(x.node);history.push({node:x.node,mex:x.mex,seen:[...seen].sort((a,b)=>a-b)});emit(24,'write',bi(`answer[${x.node}] = ${x.mex}`,`answer[${x.node}] = ${x.mex}`),{change:{type:'answer',node:x.node,from,to:x.mex}});
  const previous=x.node;x.blocked=previous;x.node=parents[previous];emit(25,'climb',bi(`${previous} ↑ ${x.node}`,`${previous} ↑ ${x.node}`),{change:{type:'climb',from:previous,to:x.node}});
 }emit(14,'ancestors-end',bi('Đã tới trên gốc','Past the root'),{check:false});emit(26,'done',bi(`answer = [${x.answer.join(', ')}]`,`answer = [${x.answer.join(', ')}]`));
 return {original:{parents,nums},answer:[...x.answer],steps};
}
module.exports={2003:{...base,builder:build,visualizationLimits:{...base.visualizationLimits,maxTraceSteps:null},
 approach:[bi('Từ node chứa 1 đi lên gốc → chỉ quét nhánh mới → tăng mex và chốt đáp án.','Climb from the node containing 1 → scan only new branches → advance mex and save the answer.')],
 complexity:{...base.complexity,note:bi('Mỗi node vào seen tối đa một lần; mex chỉ tăng.','Each node enters seen at most once; mex only increases.')},
}};
