"use strict";
const tree=require("./tree"),{runTrace}=require("./wasm-picture-trace");
const bi=(vi,en)=>({vi,en}),copy=x=>JSON.parse(JSON.stringify(x));
const ids=[129,988,1457,2096];
function parse(input,id) {
  let values = input;
  if (typeof values === "string") {
    const raw = values.trim();
    try { values = !raw ? [] : raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => {
      const text = s.trim(); return ["null", "None"].includes(text) ? null : text ? Number(text) : NaN;
    }); } catch { values = null; }
  }
  const [min,max]=id===129?[0,9]:id===988?[0,25]:id===1457?[1,9]:[1,100000];
  const error = () => new RangeError(`Tree values must be integers from ${min} to ${max}, or null`);
  if(Array.isArray(values)&&values.length>63)throw new RangeError("Use up to 31 nodes per tree");
  if (!Array.isArray(values) || values.length > 63
    || !Array.from(values).every(v => v === null || Number.isInteger(v) && v >= min && v <= max)) throw error();
  values = [...values];
  const nodes = values.length && values[0] !== null ? [{ id: "0:0", value: values[0], left: null, right: null, parent: null, depth: 0 }] : [];
  let index = 1;
  for (let head = 0; head < nodes.length && index < values.length; head++) for (const side of ["left", "right"]) {
    if (index >= values.length) break;
    const value = values[index], id = `0:${index++}`;
    if (value === null) continue;
    nodes[head][side] = id;
    nodes.push({ id, value, left: null, right: null, parent: nodes[head].id, depth: nodes[head].depth + 1 });
  }
  if(nodes.length>31)throw new RangeError("Use up to 31 nodes per tree");
  if(values.slice(index).some(v=>v!==null))throw new RangeError("Invalid level-order tree: orphan nodes");
  if(id===129&&nodes.some(n=>n.depth>=10))throw new RangeError("Root-to-leaf depth must be at most 10");
  if(id===2096&&!nodes.length)throw new RangeError("Use a non-empty binary tree");
  if(id===2096&&new Set(nodes.map(n=>n.value)).size!==nodes.length)throw new RangeError("Tree values must be unique");
  const byId = new Map(nodes.map(node => [node.id, node])); let rank = 0;
  const inorder = id => { if (id === null) return; const n = byId.get(id); inorder(n.left); n.rank = rank++; inorder(n.right); };
  if (nodes.length) inorder(nodes[0].id);
  return { values, nodes, byId };
}

function argumentsFor(input,id,params={}){
 const parsed=parse(input,id),args=[parsed.values];
 if(id===2096){const start=Number(params.startValue??3),dest=Number(params.destValue??6);
  if(!Number.isInteger(start)||!Number.isInteger(dest))throw new RangeError("startValue and destValue must be integers");
  if(start===dest)throw new RangeError("startValue and destValue must be different nodes");
  if(![start,dest].every(value=>parsed.nodes.some(n=>n.value===value)))throw new RangeError("Both values must exist in the tree");
  args.push(start,dest);
 }
 return {...parsed,args};
}
function compare(candidate,best){
 if(best===null)return {index:null,reason:"first",pass:true};
 let index=0;while(index<candidate.length&&index<best.length&&candidate[index]===best[index])index++;
 return {index,reason:index===candidate.length&&index===best.length?"equal":index===candidate.length||index===best.length?"prefix":"letter",pass:candidate<best};
}
function build(id,code,input,params={}){
 const {values,nodes,byId,args}=argumentsFor(input,id,params),method=code.find(s=>s.includes("    def ")).match(/def (\w+)/)[1],helper=id===2096?"path_to":"dfs";
 const trace=runTrace({code:code.join("\n"),method,args,treeArgs:[0]});
 const calls=new Map(),returns=new Map(),visited=new Set(),firstDone=new Set(),leaves=[];let comparison=null,bestNode=null,prefixDone=false;
 const metricName=id===129?"current":id===988?"path":id===1457?"mask":null;
 const key=(node,target)=>`${target??""}:${node}`;
 const steps=trace.events.map((record,index)=>{
  const x=record.locals,o=record.outer,text=code[record.line-1].trim(),isHelper=record.scope===helper,active=isHelper?x.node?.id??null:null;
  const frames=record.frames.filter(f=>f.name===helper),stack=frames.map((f,i)=>{const local=f.locals,node=local.node?.id??null,parent=frames[i-1]?.locals.node?.id??null;
   return {node,value:local.node?.val??null,depth:i,parent,side:parent===null?"root":node===null?firstDone.has(key(parent,local.target))?"right":"left":byId.get(parent).left===node?"left":"right",metric:metricName?local[metricName]??null:null,target:local.target??null};
  }),pathIds=stack.filter(f=>f.node!==null).map(f=>f.node),callKey=key(active,x.target),leaf=active!==null&&byId.get(active).left===null&&byId.get(active).right===null;
  let change=null;
  if(isHelper&&text==="if not node:"&&active!==null){visited.add(active);calls.set(callKey,{node:active,target:x.target??null,incoming:metricName?x[metricName]:null,metric:metricName?x[metricName]:null,expanded:false,enterStep:index,updateStep:null,returnStep:null,returned:null});change={kind:"enter",node:active};}
  if(isHelper&&active!==null&&text.match(/^(current = current \* 10|path = chr|mask \^=)/)){
   const state=calls.get(callKey);Object.assign(state,{metric:x[metricName],expanded:true,updateStep:index});change={kind:"append",node:active,before:state.incoming,after:x[metricName],digit:x.node.val};
  }
  if(isHelper&&active!==null&&(/^(left = (dfs|path_to)\(node.left|dfs\(node.left)/.test(text)))firstDone.add(callKey);
  const best=id===988?(Object.hasOwn(x,"best")?x.best:o.best)??null:null;
  if(id===988&&text==="if best is None or path < best:"){
   comparison={node:active,candidate:x.path,before:best,...compare(x.path,best),step:index};
   leaves.push({node:active,pathIds:[...pathIds],value:x.path,comparison:copy(comparison),step:index,updated:false});change={kind:"compare",node:active};
  }
  if(id===988&&text==="best = path"){
   bestNode=active;leaves.at(-1).updated=true;change={kind:"best",node:active};
  }
  if(isHelper&&record.returning){
   if(active!==null){const state=calls.get(callKey);Object.assign(state,{returnStep:index,returned:record.returned});returns.set(callKey,{node:active,target:x.target??null,value:record.returned,step:index});}
   if(leaf&&[129,1457].includes(id)){leaves.push({node:active,pathIds:[...pathIds],value:record.returned,mask:id===1457?x.mask:null,valid:id===1457?record.returned===1:null,step:index});change={kind:"leaf",node:active};}
  }
  if(id===2096&&text.startsWith("while common ")&&record.branch===false)prefixDone=true;
  const startPath=o.start_path??null,destPath=o.dest_path??null,common=o.common??null;
  let lca=null,routeIds=[],route=null;
  const walk=path=>{let current=nodes[0]?.id;const list=current?[current]:[];for(const direction of path){current=byId.get(current)[direction==="L"?"left":"right"];list.push(current);}return list;};
  if(id===2096&&prefixDone){const start=walk(startPath),dest=walk(destPath);lca=start[common];routeIds=[...start.slice(common).reverse(),...dest.slice(common+1)];route="U".repeat(startPath.length-common)+destPath.slice(common).join("");}
  const final=record.scope===method&&record.returning,state=active!==null?calls.get(callKey):null;
  const view={problemId:id,nodes,active,pathIds,stack,visited:[...visited],calls:copy([...calls.values()]),returns:copy([...returns.values()]),leaves:copy(leaves),state:state?copy(state):null,
   metricName,metric:metricName&&isHelper?x[metricName]??null:null,leaf,best,bestNode,comparison:comparison?copy(comparison):null,
   startValue:id===2096?args[1]:null,destValue:id===2096?args[2]:null,startPath,destPath,common,prefixDone,lca,routeIds,route,
   emptyCall:stack.at(-1)?.node===null?copy(stack.at(-1)):null,change,answer:final?trace.answer:null,
   source:{line:record.line,text,timing:"after"},scope:record.scope,locals:x,outer:o,frames:record.frames,branch:record.branch,returning:record.returning,returned:record.returned,trace:trace.trace};
  return {arr:[],codeBlock:1,codeLines:[record.line],final,title:bi(`L${record.line} · ${text}`,`L${record.line} · ${text}`),note:bi("",""),vars:Object.entries(x).map(([name,value])=>({name,value:value===null?"None":value,rawValue:value})),rootPathView:view};
 });
 return {original:values,answer:trace.answer,steps};
}
const summaries={129:bi("Mỗi đường gốc → lá ghép thành một số. Cộng các số đó.","Each root-to-leaf path forms a number. Add those numbers."),988:bi("Đọc chữ từ lá → gốc. Chọn chuỗi nhỏ nhất theo thứ tự từ điển.","Read letters from leaf to root. Choose the lexicographically smallest string."),1457:bi("Một đường gốc → lá sắp xếp được thành palindrome khi tối đa một chữ số xuất hiện lẻ.","A root-to-leaf path can form a palindrome if at most one digit has an odd count."),2096:bi("Đi từ start lên tổ tiên chung, rồi xuống dest theo U, L, R.","Go from start up to the common ancestor, then down to dest using U, L, R.")};
const guides={129:bi("current × 10 + digit → lá trả số → cha cộng trái + phải.","current × 10 + digit → leaf returns number → parent adds left + right."),988:bi("letter + path → so sánh tại lá → cập nhật best.","letter + path → compare at leaf → update best."),1457:bi("Toggle bit của digit → tại lá kiểm tra mask & (mask−1) == 0.","Toggle the digit bit → at a leaf check mask & (mask−1) == 0."),2096:bi("Tìm hai path từ gốc → bỏ tiền tố chung → ghép U và đường xuống.","Find two root paths → remove the shared prefix → combine U and the downward path.")};
const result={};for(const id of ids){const base=tree[id],code=base.code.join("\n").replace("if not node: return","if not node:\n                return").split("\n");result[id]={...base,code,...(id===988?{complexity:{...base.complexity,space:"O(h²)",note:bi("Mỗi frame giữ một chuỗi riêng dài theo độ sâu.","Each frame retains its own string whose length grows with depth.")}}:id===2096?{complexity:{...base.complexity,time:"O(n + h²)",space:"O(h)",note:bi("Ghép [L] + left hoặc [R] + right sao chép path khi trả về.","Prepending [L] or [R] copies the returned path while unwinding.")}}:{}),debugMode:"line-by-line",allowEmptyInput:id!==2096,statement:summaries[id],approach:[guides[id]],inputLabel:bi(`Cây level-order · tối đa 31 nút · ${id===988?"0–25 = a–z":id===2096?"giá trị khác nhau":id===1457?"digit 1–9":"digit 0–9 · sâu ≤ 10"}`,`Level-order tree · up to 31 nodes · ${id===988?"0–25 = a–z":id===2096?"unique values":id===1457?"digits 1–9":"digits 0–9 · depth ≤ 10"}`),visualizationLimits:{maxNodes:31,...(id===129?{maxDepth:10}:{}),completeTrace:true},builder:(input,params)=>build(id,code,input,params),liveArgs:(input,params)=>{const {args}=argumentsFor(input,id,params);return [{__viz_type:"binary_tree",values:args[0],tree_id:"root"},...args.slice(1)];}};}
module.exports=result;
