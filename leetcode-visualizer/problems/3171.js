'use strict';
const {runTrace}=require('./wasm-picture-trace');
const methods=require('./subarray-or-3171-methods');
const bi=(vi,en)=>({vi,en});
const watches=[['right','x','old','merged','left','current','suffix_ors','best'],['left','right','value','k','best'],['right','left','x','value','nums','best'],['left','right','bit','counts','window_or','best'],['left','right','lo','hi','mid','bit','result','best'],['left','right','lo','hi','mid','level','block','best'],['left','right','lo','hi','mid','l','r','result','best']];
function parseInput(input,params={}){
 let nums=input;
 if(typeof input==='string'){if(input.trim().startsWith('[')){try{nums=JSON.parse(input);}catch(_){nums=[];}}else nums=input.trim()?input.trim().split(/[,\s]+/).map(Number):[];}
 const k=Number(params?.k??6);
 if(!Array.isArray(nums)||nums.length<1||nums.length>18||nums.some(x=>typeof x!=='number'||!Number.isInteger(x)||x<0||x>1e9)||!Number.isInteger(k)||k<0||k>1e9)throw new RangeError('3171: nums must contain 1–18 integers in [0, 1000000000]; k must be in the same range.');
 return{nums:[...nums],k};
}
function buildSteps(input,params={},method=1){
 const{nums,k}=parseInput(input,params),definition=methods[method-1];
 const traced=runTrace({code:definition.code.join('\n'),method:'minimumDifference',args:[nums,k]});
 let witness=null,candidate=null,bitOperation=null,suffixRight=-1,previous=null,queryNodes=[];
 const steps=traced.events.map((record,index)=>{
  const root=record.outer,local=record.locals,context={...root,...local},source=definition.code[record.line-1].trim();
  const validWindow=(left,right)=>Number.isInteger(left)&&Number.isInteger(right)&&0<=left&&left<=right&&right<nums.length;
  const actualOr=(left,right)=>nums.slice(left,right+1).reduce((a,b)=>a|b,0);
  if(source==='suffix_ors = current')suffixRight=root.right;
  if(source.startsWith('best = min(')){
   const{left,right,value}=root;
   if(!validWindow(left,right)||actualOr(left,right)!==value)throw new Error(`3171: invalid candidate at method ${method}, line ${record.line}`);
   candidate={left,right,value,difference:Math.abs(value-k)};
   if(witness===null||candidate.difference<witness.difference)witness={...candidate};
  }
  const prevRoot=previous?.outer??{},prevLocal=previous?.scope===record.scope?previous.locals:{};
  const operation=(a,b,value,kind='OR')=>{if([a,b,value].every(Number.isFinite))bitOperation={a,b,value,kind,line:record.line};};
  if(source==='merged = old | x')operation(root.old,root.x,root.merged);
  if(source==='value |= nums[right]')operation(prevRoot.value,nums[root.right],root.value);
  if(source==='value = nums[left] | x')operation(root.nums[root.left],root.x,root.value);
  if(source==='value = x')operation(0,root.x,root.value);
  if(source==='window_or |= 1 << bit')operation(prevRoot.window_or,2**root.bit,root.window_or);
  if(source==='window_or &= ~(1 << bit)')operation(prevRoot.window_or,2**root.bit,root.window_or,'CLEAR');
  if(record.scope==='range_or'&&source==='result |= 1 << bit')operation(prevLocal.result??0,2**local.bit,local.result);
  if(method===6&&source.startsWith('row.append(table'))operation(root.table.at(-1)[root.i],root.table.at(-1)[root.i+root.span/2],root.row.at(-1));
  if(method===6&&record.scope==='range_or'&&record.returning)operation(local.table[local.level][local.left],local.table[local.level][local.right-local.block+1],record.returned);
  if(method===7&&source.startsWith('tree[node] ='))operation(root.tree[root.node*2],root.tree[root.node*2+1],root.tree[root.node]);
  if(method===7&&record.scope==='range_or'){
   if(source.startsWith('l, r ='))queryNodes=[];
   if(source==='result |= tree[l]'||source==='result |= tree[r]'){
    const node=source.includes('tree[l]')?local.l:local.r;
    queryNodes.push(node);operation(prevLocal.result??0,local.tree[node],local.result);
   }
  }
  const bit=Number.isInteger(context.bit)?context.bit:0,prefix=context.prefix??root.prefix;
  const candidates=(root.suffix_ors??[]).map(([value,left])=>({value,left,right:suffixRight,difference:Math.abs(value-k)}));
  const event=source==='suffix_ors = current'?'suffix-ready':source.startsWith('best = min(')?'evaluate':record.returning?'return':record.scope==='range_or'?'query':'line';
  const final=index===traced.events.length-1;
  const step={arr:[],codeLines:[record.line],codeBlock:method,final,title:bi(`Dòng ${record.line} · ${record.scope}`,`Line ${record.line} · ${record.scope}`),note:bi('',''),vars:watches[method-1].map(name=>({name,value:context[name]??'—'})),
   subarrayOr3171View:{method,line:record.line,source,event,scope:record.scope,frames:record.frames.map(f=>f.name),returning:record.returning,returned:record.returned,nums:[...nums],work:[...(root.nums??nums)],k,
    right:root.right??null,left:root.left??null,value:context.value??null,best:Number.isFinite(root.best)?root.best:null,bestWindow:witness?{...witness}:null,candidate:candidate?{...candidate}:null,candidates,current:(root.current??[]).map(pair=>[...pair]),bitOperation:bitOperation?{...bitOperation}:null,
    counts:root.counts?[...root.counts]:null,windowOr:root.window_or??null,bit,lo:root.lo??null,hi:root.hi??null,mid:root.mid??null,condition:source==='if value < k:'?record.branch:null,
    prefix:prefix?prefix.map(row=>row[bit]??null):null,prefixBit:bit,table:root.table?root.table.map(row=>[...row]):null,level:context.level??null,block:context.block??null,
    tree:root.tree?[...root.tree]:null,size:root.size??null,queryNodes:[...queryNodes],queryWindow:record.scope==='range_or'?{left:local.left,right:local.right}:null,queryResult:record.scope==='range_or'?local.result??record.returned:null,final}};
  previous=record;
  return step;
 });
 return{original:[[...nums],k],nums,k,answer:traced.answer,steps};
}
const problem={id:3171,difficulty:'hard',slug:'find-subarray-with-bitwise-or-closest-to-k',category:{key:'array',vi:'Mảng',en:'Array'},tags:[{key:'bitmask',vi:'Bitmask',en:'Bitmask'},{key:'sliding-window',vi:'Cửa sổ trượt',en:'Sliding Window'},{key:'binary-search',vi:'Tìm kiếm nhị phân',en:'Binary Search'},{key:'segment-tree',vi:'Segment Tree',en:'Segment Tree'}],
 title:bi('OR của subarray gần K nhất','Find Subarray With Bitwise OR Closest to K'),titleVi:bi('Chọn đoạn liên tiếp có |OR − k| nhỏ nhất','Choose a contiguous subarray minimizing |OR − k|'),
 statement:bi('Tìm độ lệch nhỏ nhất giữa k và OR bitwise của một subarray không rỗng.','Find the minimum absolute difference between k and the bitwise OR of a non-empty subarray.'),
 defaultInput:[1,2,4,5],inputKind:'nonneg',inputLabel:bi('nums · tối đa 18 số','nums · up to 18 values'),debugMode:'line-by-line',
 extraParams:[{key:'k',type:'number',label:bi('k','k'),default:6,min:0,max:1e9},{key:'approach',type:'select',label:bi('Cách giải','Approach'),default:1,options:methods.map((m,i)=>({value:i+1,label:bi(`${i+1}. ${m.label.vi}`,`${i+1}. ${m.label.en}`)}))}],
 approach:[bi('OR chỉ bật thêm bit khi mở rộng đoạn; khi bỏ số cần đếm bit hoặc truy vấn lại.','Extending a window can only set more bits; removing a value requires counts or a new range query.'),bi('Có 7 cách giải, mỗi cách có mã Python và hình minh họa riêng.','Seven approaches, each with its own Python code and diagram.')],
 liveArgs:(input,params)=>{const{nums,k}=parseInput(input,params);return[nums,k];}};
methods.forEach((m,i)=>{
 const suffix=i===0?'':String(i+1);
 problem[`code${suffix}`]=m.code;
 problem[`code${suffix}Label`]=bi(`Cách ${i+1}: ${m.label.vi}`,`Approach ${i+1}: ${m.label.en}`);
 problem[`builder${suffix}`]=(input,params)=>buildSteps(input,params,i+1);
 problem[`complexity${suffix}`]={time:m.time,space:m.space,note:bi('B là số bit (tối đa 30). Mã được chạy bằng Python; giới hạn minh họa 18 số.','B is the bit width (at most 30). Python executes the displayed code; visualization supports up to 18 values.')};
});
module.exports={3171:problem};
