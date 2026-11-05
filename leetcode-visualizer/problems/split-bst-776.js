'use strict';
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const code=`from typing import List, Optional

class Solution:
    def splitBST(self, root: Optional[TreeNode], target: int) -> List[Optional[TreeNode]]:
        if not root:
            return [None, None]

        if root.val <= target:
            small, large = self.splitBST(root.right, target)
            root.right = small
            return [root, large]

        small, large = self.splitBST(root.left, target)
        root.left = large
        return [small, root]`.split('\n');
function parse(input,params={}){
 let values=input;
 if(typeof values==='string'){const raw=values.trim();try{values=raw.startsWith('[')?JSON.parse(raw):raw?raw.split(',').map(v=>v.trim()==='null'||v.trim()==='None'?null:v.trim()?Number(v):NaN):[];}catch{values=null;}}
 if(!Array.isArray(values)||values.length>101||values.some(v=>v!==null&&(!Number.isInteger(v)||v<0||v>1000)))throw new RangeError('776: Level-order BST, 0–50 nodes, values 0–1000; use null for missing children.');
 const nodes=[],byId=new Map();let index=1;
 if(values.length&&values[0]!==null){nodes.push({id:'0:0',value:values[0],left:null,right:null,parent:null,depth:0});byId.set('0:0',nodes[0]);}
 else if(values.some(v=>v!==null))throw new RangeError('776: Nodes must be connected to a root.');
 for(let head=0;head<nodes.length&&index<values.length;head++)for(const side of['left','right']){if(index>=values.length)break;const value=values[index],id=`0:${index++}`;if(value===null)continue;const child={id,value,left:null,right:null,parent:nodes[head].id,depth:nodes[head].depth+1};nodes[head][side]=id;nodes.push(child);byId.set(id,child);}
 if(nodes.length>50||values.slice(index).some(v=>v!==null))throw new RangeError('776: At most 50 connected nodes.');
 const order=[],stack=[];let node=nodes[0];while(node||stack.length){while(node){stack.push(node);node=byId.get(node.left);}node=stack.pop();node.rank=order.length;order.push(node);node=byId.get(node.right);}
 if(order.some((n,i)=>i&&n.value<order[i-1].value))throw new RangeError('776: Input must be a BST (ascending inorder).');
 const raw=params.target??2,target=typeof raw==='string'&&raw.trim()===''?NaN:Number(raw);
 if(!['number','string'].includes(typeof raw)||!Number.isInteger(target)||target<0||target>1000)throw new RangeError('776: target must be an integer from 0 to 1000.');
 return{values:[...values],nodes,target};
}
function levelOrder(rootId,nodes){
 if(rootId===null)return[];
 const byId=new Map(nodes.map(n=>[n.id,n])),queue=[rootId],values=[];
 for(let i=0;i<queue.length;i++){const id=queue[i];if(id===null){values.push(null);continue;}const node=byId.get(id);values.push(node.value);queue.push(node.left,node.right);}
 while(values.at(-1)===null)values.pop();return values;
}
function build(input,params={}){
 const{values,nodes,target}=parse(input,params),trace=runTrace({code:code.join('\n'),method:'splitBST',args:[values,target],treeArgs:[0],captureTrees:true}),original=nodes.map(n=>({...n})),history=[];
 let previous=new Map(nodes.map(n=>[n.id,n])),lastDecision=null;
 const steps=trace.events.map((record,index)=>{
  const source=code[record.line-1].trim(),local=record.locals,root=local.root?.id??null,final=index===trace.events.length-1;
  const current=record.trees.map(n=>({...nodes.find(o=>o.id===n.id),value:n.val,left:n.left,right:n.right}));let event='call',change=null;
  if(source==='if not root:'){event=record.branch?'base':'call';lastDecision=null;}
  if(source==='if root.val <= target:'){event='decide';lastDecision={root,value:local.root.val,small:record.branch,direction:record.branch?'right':'left'};}
  if(source.startsWith('small, large = ')){event='parts';lastDecision=null;}
  if(source==='root.right = small'||source==='root.left = large'){
   const side=source.includes('.right')?'right':'left',now=current.find(n=>n.id===root);event='rewire';change={node:root,side,before:previous.get(root)[side],after:now[side],step:index};history.push({...change});lastDecision=null;
  }
  if(record.returning){event='return';lastDecision=null;}
  previous=new Map(current.map(n=>[n.id,n]));
  const roots=final?trace.answer.map(n=>n?.id??null):null;
  const view={id:776,line:record.line,source,event,root,target,original:original.map(n=>({...n})),nodes:current,decision:lastDecision?{...lastDecision}:null,change,history:history.map(h=>({...h})),frames:record.frames.map(f=>({root:f.locals.root?.id??null,value:f.locals.root?.val??null})),hasParts:Object.hasOwn(local,'small'),small:local.small?.id??null,large:local.large?.id??null,returned:record.returning?record.returned.map(n=>n?.id??null):null,roots,answer:final?roots.map(id=>levelOrder(id,current)):null,final};
  return{arr:[],codeLines:[record.line],final,title:bi(`Dòng ${record.line} · splitBST`,`Line ${record.line} · splitBST`),note:bi('',''),vars:['root','target','small','large'].map(name=>({name,value:local[name]??'—'})),splitBst776View:view};
 });return{original:[...values],answer:steps.at(-1).splitBst776View.answer,steps};
}
module.exports={776:{id:776,difficulty:'medium',slug:'split-bst',category:{key:'bst',vi:'BST',en:'BST'},tags:[{key:'bst',vi:'BST',en:'BST'},{key:'recursion',vi:'Đệ quy',en:'Recursion'}],title:bi('Split BST','Split BST'),titleVi:bi('Tách BST thành ≤ target và > target','Split BST into ≤ target and > target'),statement:bi('Tách thành hai BST: ≤ target và > target. Giữ các cạnh cùng nhóm; nối lại nhánh đi qua điểm tách.','Split into two BSTs: ≤ target and > target. Preserve same-group edges; reconnect the branch crossing the split.'),inputKind:'string',inputLabel:bi('BST · level-order · 0–50 nút · null cho ô rỗng','BST · level-order · 0–50 nodes · null for missing children'),defaultInput:'[4,2,6,1,3,5,7]',extraParams:[{key:'target',type:'number',label:bi('Điểm tách','Split target'),default:2,min:0,max:1000}],code,codeLabel:bi('Đệ quy · tách rồi nối lại','Recursion · split and reconnect'),debugMode:'line-by-line',complexity:{time:'O(H)',space:'O(H)',note:bi('H: chiều cao cây. Chỉ đi theo một nhánh.','H: tree height. Follow one search path.')},approach:[bi('root ≤ target: tách nhánh phải. root > target: tách nhánh trái. Nối lại khi quay lui.','root ≤ target: split right. root > target: split left. Reconnect while returning.')],builder:build,liveArgs:(input,params)=>{const{values,target}=parse(input,params);return[{__viz_type:'binary_tree',values,tree_id:'root'},target];}}};
