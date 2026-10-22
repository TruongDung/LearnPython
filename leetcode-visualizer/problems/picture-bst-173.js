"use strict";
const base=require("./bst")[173],{trace,bi}=require("./picture-trace"),code=[...base.code];
function parse(input,params={}){
  let values;
  try{values=Array.isArray(input)?[...input]:typeof input==="string"&&input.trim().startsWith("[")?JSON.parse(input):typeof input==="string"?input.split(",").map(s=>s.trim()==="null"?null:s.trim()===""?NaN:Number(s)):null;}catch{values=null;}
  if(!Array.isArray(values)||!values.length||values.length>200001||values[0]===null||!values.every(v=>v===null||Number.isInteger(v)&&v>=0&&v<=1000000))throw new Error("BST: level-order, null cho ô rỗng; 1–100000 node, giá trị 0–10⁶.");
  const nodes=[{id:0,val:values[0],left:null,right:null}];let index=1;
  for(let head=0;head<nodes.length&&index<values.length;head++)for(const side of ["left","right"]){if(index<values.length&&values[index]!==null){const child={id:nodes.length,val:values[index],left:null,right:null};nodes.push(child);nodes[head][side]=child;}index++;}
  if(values.slice(index).some(v=>v!==null)||nodes.length>100000)throw new Error("Cây có node không nối được tới root.");
  let node=nodes[0],last=-Infinity;const stack=[];
  while(node||stack.length){while(node){stack.push(node);node=node.left;}node=stack.pop();if(node.val<last)throw new Error("Cây phải là BST.");last=node.val;node=node.right;}
  const text=params.operations===undefined?base.extraParams[0].default:params.operations;
  if(typeof text!=="string")throw new Error("operations: next(); hasNext()");
  const operations=text.trim()?text.split(";").filter(s=>s.trim()).map(s=>{const match=/^\s*(next|hasNext)\s*\(\s*\)\s*$/.exec(s);if(!match)throw new Error("Chỉ nhận next(); hasNext().");return match[1];}):[];
  if(operations.length>100000||operations.filter(op=>op==="next").length>nodes.length)throw new Error("next() không được gọi sau khi hết node; tối đa 100000 thao tác.");
  return {nodes,operations};
}
function builder(input,params){
  const {nodes,operations}=parse(input,params),T=trace(173,code,nodes.length<=20&&operations.length<=30),stack=[],outputs=[],returned=[];
  let current=null,op=-1,method="__init__";
  const encode=node=>node===null?null:{val:node.val,left:encode(node.left),right:encode(node.right)};
  const view=()=>({nodes:nodes.slice(0,T.active?20:12).map(n=>({id:n.id,value:n.val,left:n.left?.id??null,right:n.right?.id??null})),total:nodes.length,
    stack:stack.slice(-20).map(n=>n.id),current,outputs:outputs.slice(0,T.active?30:12),outputTotal:outputs.length,returned:returned.slice(0,T.active?20:12),
    operations:operations.slice(0,T.active?30:12),operationTotal:operations.length,op,method});
  const E=(line,event,frame={})=>{if(!T.active)return;T.emit(line,event,{self:{stack:stack.map(encode)},...Object.fromEntries(Object.entries(frame).map(([k,v])=>[k,encode(v)]))},view);};
  function pushLeft(start){
    const parent=method;method="_push_left";let node=start;
    while(true){current=node?.id??null;E(6,node?"True":"False",{node});if(!node)break;stack.push(node);E(7,"push node",{node});node=node.left;current=node?.id??null;E(8,"go left",{node});}
    method=parent;
  }
  E(3,"stack = []",{root:nodes[0]});pushLeft(nodes[0]);E(4,"left path ready",{root:nodes[0]});
  for(op=0;op<operations.length;op++){
    method=operations[op];current=null;
    if(method==="hasNext"){outputs.push(stack.length>0);E(14,stack.length?"True":"False");}
    else{const node=stack.pop();current=node.id;E(10,"pop smallest",{node});pushLeft(node.right);current=node.id;E(11,"right subtree ready",{node});outputs.push(node.val);returned.push(node.id);E(12,"return node.val",{node});}
  }
  return T.finish(outputs,view,input);
}
module.exports={173:{...base,code,builder,debugMode:"line-by-line",parsePicture173:parse,
  statement:bi("next() lấy giá trị nhỏ nhất còn lại. hasNext() kiểm tra stack còn node.","next() returns the smallest remaining value. hasNext() checks whether the stack has nodes."),
  approach:[bi("Trái → node → phải. TOP luôn là node nhỏ nhất chưa trả về.","Left → node → right. TOP is the smallest node not yet returned."),bi("Pop → sang cây phải → push đường trái.","Pop → enter the right subtree → push its left path.")],
  complexity:{...base.complexity,note:bi("Debug ≤20 node, ≤30 thao tác. Cây lớn xử lý đủ và xem trước 12 node.","Line debug ≤20 nodes and ≤30 operations. Larger inputs are fully processed with a 12-node preview.")}
}};
