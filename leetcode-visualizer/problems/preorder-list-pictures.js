"use strict";
const base=require('./monotonic-stack'),{runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en}),copy=x=>JSON.parse(JSON.stringify(x));
const BST_CODE=`class TreeNode:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

class Solution:
    def bstFromPreorder(self, preorder):
        index = 0
        def build(lower, upper):
            nonlocal index
            if index == len(preorder):
                return None
            value = preorder[index]
            if not lower < value < upper:
                return None
            node = TreeNode(value)
            index += 1
            node.left = build(lower, value)
            node.right = build(value, upper)
            return node
        return build(float('-inf'), float('inf'))`.split('\n');
const LIST_CODE=base[1019].code.join('\n').replace('answer[stack.pop()] = value','index = stack.pop()\n                answer[index] = value').split('\n');
function parse(input,id){let a=input;try{if(typeof input==='string'){const s=input.trim();a=s.startsWith('[')?JSON.parse(s):s.split(',').map(t=>t.trim()?Number(t):NaN);}}catch{a=null;}const limit=id===1008?100:10000,max=id===1008?1000:1000000000;
 if(!Array.isArray(a)||!a.length||a.length>limit||!Array.from(a).every(x=>Number.isInteger(x)&&x>=1&&x<=max))throw new RangeError(`#${id}: 1–${limit} positive integer values, at most ${max}`);
 a=[...a];if(id===1008){if(new Set(a).size!==a.length)throw new RangeError('#1008: preorder values must be distinct');const stack=[];let lower=-Infinity;for(const value of a){if(value<=lower)throw new RangeError('#1008: invalid BST preorder');while(stack.length&&value>stack.at(-1))lower=stack.pop();stack.push(value);}}
 return a;
}
function get(record,name){return Object.hasOwn(record.locals,name)?record.locals[name]:record.outer[name]??record.locals[`list(${name})[:16]`]??record.outer[`list(${name})[:16]`];}
function serialize(root){if(!root)return [];const q=[root],out=[];for(let i=0;i<q.length;i++){const node=q[i];out.push(node?node.val:null);if(node)q.push(node.left,node.right);}while(out.at(-1)===null)out.pop();return out;}
function buildBST(input){const values=parse(input,1008),trace=runTrace({code:BST_CODE.join('\n'),method:'bstFromPreorder',args:[values],objectClasses:['TreeNode'],...(values.length>31?{maxEvents:600,summarizeLocals:{preorder:0}}:{})}),nodes=new Map();
 const steps=trace.events.map((r,index)=>{const x=r.locals,source=BST_CODE[r.line-1].trim(),calls=r.frames.filter(f=>f.name==='build');
  const walk=(node,depth)=>{if(!node||node.type!=='TreeNode')return;const previous=nodes.get(node.val);nodes.set(node.val,{id:node.val,value:node.val,left:node.left?.val??null,right:node.right?.val??null,depth:previous?.depth??depth,created:previous?.created??index});walk(node.left,depth+1);walk(node.right,depth+1);};
  for(let i=0;i<calls.length;i++)walk(calls[i].locals.node,i);if(r.returning&&r.scope==='bstFromPreorder')walk(r.returned,0);
  const all=[...nodes.values()],parents=new Map();for(const n of all)for(const side of ['left','right'])if(n[side]!==null)parents.set(n[side],{id:n.id,side});
  const shown=all.slice(0,31),shownIds=new Set(shown.map(n=>n.id)),ranks=new Map([...shown].sort((a,b)=>a.value-b.value).map((n,i)=>[n.id,i]));
  const links=[];for(let i=1;i<calls.length;i++){const parent=calls[i-1].locals.node,child=calls[i].locals.node;if(parent&&child&&!parents.has(child.val)&&parent.val!==child.val&&shownIds.has(parent.val)&&shownIds.has(child.val))links.push({from:parent.val,to:child.val,side:child.val<parent.val?'left':'right'});}
  const final=r.scope==='bstFromPreorder'&&r.returning;
  const view={id:1008,input:values,source:{line:r.line,text:source,timing:'after'},scope:r.scope,locals:x,outer:r.outer,frames:r.frames,branch:r.branch,returning:r.returning,returned:r.returned,trace:trace.trace,
    index:get(r,'index')??0,nodes:shown.map(n=>({...n,rank:ranks.get(n.id),parent:parents.get(n.id)?.id??null})),nodeTotal:all.length,pending:links,active:x.node?.val??calls.at(-1)?.locals.node?.val??null,calls:calls.map(f=>({lower:f.locals.lower,upper:f.locals.upper,value:f.locals.value??null,node:f.locals.node?.val??null})),
    range:calls.length?{lower:calls.at(-1).locals.lower,upper:calls.at(-1).locals.upper,value:calls.at(-1).locals.value??null,accepted:source==='if not lower < value < upper:'?!r.branch:null}:null,
    change:source==='node = TreeNode(value)'?{kind:'create',node:x.node.val}:source.startsWith('node.left =')||source.startsWith('node.right =')?{kind:'link',node:x.node.val,side:source.startsWith('node.left')?'left':'right'}:null,
    answer:final?serialize(trace.answer):null,nativeAnswer:final?trace.answer:null,cropped:all.length>31};
  return {arr:[],codeBlock:1,codeLines:[r.line],final,title:bi(`L${r.line} · ${source}`,`L${r.line} · ${source}`),note:bi('',''),vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),preorderListView:view};
 });return {original:values,answer:serialize(trace.answer),nativeAnswer:trace.answer,steps};
}
function buildList(input){const values=parse(input,1019),large=values.length>24,payload={code:LIST_CODE.join('\n'),method:'nextLargerNodes',args:[values],linkedArgs:[0],...(large?{maxEvents:1600,summarizeLocals:{values:16,answer:16,stack:16}}:{})},trace=runTrace(payload),resolved=new Map();let comparison=null,popped=null;
 const steps=trace.events.map((r,step)=>{const x=r.locals,source=LIST_CODE[r.line-1].trim();let change=null;
  if(source==='for i, value in enumerate(values):'&&r.branch){comparison=null;popped=null;}
  if(source==='while stack and values[stack[-1]] < value:'){const stack=get(r,'stack');popped=null;comparison=stack.length&&(x['len(stack)']??stack.length)===stack.length?{index:stack.at(-1),left:values[stack.at(-1)],right:x.value,accepted:r.branch,line:r.line}:null;}
  if(source==='index = stack.pop()'){popped=x.index;change={kind:'pop',index:x.index};}
  if(source==='answer[index] = value'){resolved.set(x.index,{from:x.index,to:x.i,value:x.value,step});change={kind:'answer',from:x.index,to:x.i,value:x.value};}
  if(source==='stack.append(i)'){change={kind:'push',index:x.i};popped=null;}
  const final=r.returning,view={id:1019,input:values.slice(0,24),n:values.length,cropped:large,source:{line:r.line,text:source,timing:'after'},scope:r.scope,locals:x,outer:r.outer,frames:r.frames,branch:r.branch,returning:r.returning,returned:r.returned,trace:trace.trace,
    phase:x.answer===undefined&&x['len(answer)']===undefined?'copy':final?'done':'stack',head:x.head??null,current:x.i??null,comparison:copy(comparison),popped,resolved:copy([...resolved.values()].filter(r=>r.from<24&&r.to<24)),change,answer:final?trace.answer:null};
  return {arr:[],codeBlock:1,codeLines:[r.line],final,title:bi(`L${r.line} · ${source}`,`L${r.line} · ${source}`),note:bi('',''),vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),preorderListView:view};
 });return {original:values,answer:trace.answer,steps};
}
module.exports={1008:{...base[1008],code:BST_CODE,builder:buildBST,debugMode:'line-by-line',inputKind:'string',inputLabel:bi('preorder · 1–100 số khác nhau (1–1000) · hình/debug đầy đủ ≤31 nút','preorder · 1–100 distinct values (1–1000) · full picture/replay ≤31 nodes'),
 statement:bi('Đọc Gốc → Trái → Phải, dựng BST với trái < gốc < phải.','Read Root → Left → Right to construct a BST with left < root < right.'),
 approach:[bi('Mỗi lời gọi nhận khoảng (lower, upper); không khớp thì trả None và giữ nguyên index.','Each call receives (lower, upper); a mismatch returns None without consuming the value.')],complexity:{time:'O(n)',space:'O(h)',note:bi('Stack đệ quy O(h); cây kết quả O(n).','Recursive stack O(h); output tree O(n).')},liveArgs:input=>[parse(input,1008)]},
1019:{...base[1019],code:LIST_CODE,builder:buildList,debugMode:'line-by-line',inputLabel:bi('head · 1–10000 số (1–10⁹) · hình đầy đủ ≤24 nút','head · 1–10000 values (1–10⁹) · full picture ≤24 nodes'),
 approach:[bi('Stack giữ index đang chờ. Giá trị mới lớn hơn → pop index → ghi answer[index].','The stack stores waiting indices. A larger value pops an index, then writes answer[index].')],liveArgs:input=>[{__viz_type:'linked_list',values:parse(input,1019)}]}};
