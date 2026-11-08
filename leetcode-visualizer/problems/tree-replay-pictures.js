"use strict";
const tree = require("./tree"), bfs = require("./tree-bfs");
const { runTrace } = require("./wasm-picture-trace");
const ids = [199,671,515,513,662,116,117,1609,2415,2471,2583,2641,545];
const bi = (vi,en) => ({vi,en}), copy = x => JSON.parse(JSON.stringify(x));
const boundaryCode = `class Solution:
    def boundaryOfBinaryTree(self, root):
        if not root:
            return []
        def is_leaf(node):
            return node.left is None and node.right is None
        if is_leaf(root):
            return [root.val]
        boundary = [root.val]
        node = root.left
        while node:
            if not is_leaf(node):
                boundary.append(node.val)
            node = node.left if node.left else node.right
        def add_leaves(node):
            if not node:
                return
            if is_leaf(node):
                boundary.append(node.val)
            else:
                add_leaves(node.left)
                add_leaves(node.right)
        add_leaves(root)
        right = []
        node = root.right
        while node:
            if not is_leaf(node):
                right.append(node.val)
            node = node.right if node.right else node.left
        boundary.extend(right[::-1])
        return boundary`.split("\n");
function normalize(lines) {
 const out=[];
 for(const line of lines){const inline=line.match(/^(\s*)(if .+?): (.+)$/);const parts=inline?[inline[1]+inline[2]+":",...inline[3].split("; ").map(s=>inline[1]+"    "+s)]:line.includes("; ")?line.split("; ").map(s=>line.match(/^\s*/)[0]+s.trimStart()):[line];out.push(...parts);}
 const text=out.join("\n"),imports=[];
 if(/(?<!\.)\bdeque\(/.test(text))imports.push("from collections import deque");
 if(text.includes("collections.deque"))imports.push("import collections");
 if(text.includes("heapq."))imports.push("import heapq");
 return imports.length?[...imports,"",...out]:out;
}
function parse(input, id) {
  let values = input;
  if (typeof values === "string") {
    const raw = values.trim();
    try { values = !raw ? [] : raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => {
      const text = s.trim(); return ["null", "None"].includes(text) ? null : text ? Number(text) : NaN;
    }); } catch { values = null; }
  }
  const error = () => new RangeError(`#${id}: use 0–31 connected integer nodes (32-bit), null for missing children`);
  if (!Array.isArray(values) || values.length > 63
    || !Array.from(values).every(v => v === null || Number.isInteger(v) && v >= -2147483648 && v <= 2147483647)) throw error();
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
  if (nodes.length > 31 || values.slice(index).some(v => v !== null)) throw error();
  const byId = new Map(nodes.map(node => [node.id, node])); let rank = 0;
  const inorder = id => { if (id === null) return; const n = byId.get(id); inorder(n.left); n.rank = rank++; inorder(n.right); };
  if (nodes.length) inorder(nodes[0].id);
  return { values, nodes, byId };
}

function validate(input,id){
 const parsed=parse(input,id),{nodes,byId}=parsed;
 if([513,671,2415,2471].includes(id)&&!nodes.length)throw new RangeError("Use a non-empty binary tree");
 if(id===671)for(const n of nodes){
  if(n.value<1||n.value>100000)throw new RangeError("Tree values must be integers from 1 to 100000");
  if((n.left===null)!==(n.right===null))throw new RangeError("Every non-leaf must have exactly two children");
  if(n.left!==null&&n.value!==Math.min(byId.get(n.left).value,byId.get(n.right).value))throw new RangeError("Each parent must equal the smaller value of its two children");
 }
 if([116,2415].includes(id)&&nodes.length){const depth=Math.max(...nodes.map(n=>n.depth));if(nodes.some(n=>(n.left===null)!==(n.right===null)||n.left===null&&n.depth!==depth))throw new RangeError("Use a perfect binary tree: every internal node has two children; leaves share a depth");}
 if(id===2471&&new Set(nodes.map(n=>n.value)).size!==nodes.length)throw new RangeError("Use distinct node values for the position map");
 return parsed;
}
function argumentsFor(input,id,params={}){
 const {values}=validate(input,id),args=[values];
 if(id===2583){const k=Number(params.k??2);if(!Number.isInteger(k)||k<1||k>100000)throw new RangeError("k must be an integer from 1 to 100000");args.push(k);}
 return args;
}
const nodeId=x=>x&&typeof x==="object"&&!Array.isArray(x)?x.id??null:null;
function rowValues(nodes){const out=[];for(const n of nodes)(out[n.depth]??=[]).push(n.value);return out;}
function rootOutput(id,nodes,values){
 if(id===116||id===117){const rows=rowValues(nodes).map(row=>row.join(" → ")+(id===116?" → null":" → #"));return id===116?rows.join(" | "):rows;}
 const byId=new Map(nodes.map(n=>[n.id,n.value])),out=values.map((value,i)=>value===null?null:byId.get(`0:${i}`));while(out.at(-1)===null)out.pop();return out;
}
function build(id,base,codes,input,params={}){
 const method=id===199&&[2,3].includes(Number(params.approach))?Number(params.approach):1,code=codes[method-1];
 const {values,nodes:initial,byId}=validate(input,id),args=argumentsFor(input,id,params),name=code.find(s=>s.includes("    def ")).match(/def (\w+)/)[1];
 const trace=runTrace({code:code.join("\n"),method:name,args,treeArgs:[0],captureTrees:true,...([116,117].includes(id)?{captureNext:true}:{})});
 let round=0,roundIds=[],roundPositions=[],roundNodes=[],popped=[],limit=null,previous=null,maxNode=null,selected=[],selections=[],boundaryIds=[],rightIds=[],decision=null,checks={parity:null,order:null,previous:null,level:null};
 const visited=new Set(),candidates=new Set(),pruned=new Set(),rightDone=new Set(),returns=new Map();
 const descendants=node=>{for(const side of ["left","right"]){const child=byId.get(node)[side];if(child!==null){pruned.add(child);descendants(child);}}};
 const steps=trace.events.map((record,index)=>{
  const x=record.locals,outer=record.outer,line=record.line,text=code[line-1].trim(),final=record.scope===name&&record.returning;
  const nodes=initial.map(n=>{const native=record.trees.find(t=>t.id===n.id);return {...n,original:n.value,value:native.val,next:native.next??null};});
  const queue=Array.isArray(x.queue)?x.queue.map(item=>({id:nodeId(Array.isArray(item)?item[0]:item),meta:Array.isArray(item)?item[1]:null})):null;
  if(text==="while queue:"&&record.branch){round++;roundIds=queue.map(n=>n.id);roundPositions=copy(queue);popped=[];limit=null;}
  if(text.startsWith("nodes = [queue.popleft()"))roundNodes=copy(x.nodes);
  if(text==="size = len(queue)")limit=x.size;
  if(text.startsWith("for _ in range(len(queue))")&&record.branch&&limit===null)limit=queue.length;
  if(text.includes("= queue.popleft()")){const node=nodeId(x.node??x.curr);if(node){popped.push(node);visited.add(node);}checks={parity:null,order:null,previous:x.prev??null,level:x.level??null};}
  if(text.startsWith("parity_bad ="))checks.parity=x.parity_bad;
  if(text.startsWith("order_bad ="))checks.order=x.order_bad;
  if(text==="if depth == len(res):")decision={left:x.depth,right:x.res.length,pass:record.branch,node:x.node.id};
  if(text.startsWith("for n in queue:")&&record.branch)visited.add(x.n.id);
  let active=nodeId(x.node??x.curr??x.n??x.current??x.parent??x.child),change=null,probe=null;
  if([116,117].includes(id))active=nodeId(id===116?x.node??x.leftmost:x.current);
  if(text.includes("while")&&!record.branch)active=null;
  const changed=nodes.filter(n=>{const old=previous?.nodes.find(p=>p.id===n.id);return old&&(old.value!==n.value||old.next!==n.next);}).map(n=>({id:n.id,before:previous.nodes.find(p=>p.id===n.id).value,after:n.value,next:n.next}));
  if(changed.length)change={kind:changed.some(n=>previous.nodes.find(p=>p.id===n.id).next!==n.next)?"link":"value",nodes:changed};
  const childMatch=text.match(/(?:if |append\()(node|curr|n)\.(left|right)/);
  if(childMatch&&x[childMatch[1]]){const parent=x[childMatch[1]].id,side=childMatch[2],child=byId.get(parent)[side];probe={parent,side,child,exists:child!==null,appended:text.includes("append(")};}
  if(id===515){if(text.startsWith("level_max = float"))maxNode=null;if(text.startsWith("level_max = max")){if(maxNode===null||x.node.val>previous.locals.level_max)maxNode=x.node.id;change={kind:"compare",before:previous.locals.level_max,value:x.node.val,after:x.level_max,node:x.node.id};}if(text==="answer.append(level_max)"){selected.push(maxNode);selections.push({node:maxNode,depth:byId.get(maxNode).depth,value:x.level_max});change={kind:"record",node:maxNode};}}
  if(id===513&&/answer = (node|root)\.val/.test(text)){const node=x.node??x.root;selected=[node.id];selections.push({node:node.id,depth:byId.get(node.id).depth,value:node.val});change={kind:"record",node:node.id};}
  if(id===199&&text.startsWith("res.append(")){const node=text.includes("queue[-1]")?x.queue.at(-1):x.curr??x.node;selected.push(node.id);selections.push({node:node.id,depth:byId.get(node.id).depth,value:node.val});change={kind:"record",node:node.id};}
  const leftFirst=id===671||id===545;
  const stack=record.frames.filter(f=>![name,"is_leaf"].includes(f.name)).map((f,i,a)=>{const node=nodeId(f.locals.node),parent=nodeId(a[i-1]?.locals.node);return {node,value:f.locals.node?.val??null,depth:f.locals.depth??i,parent,side:parent===null?"root":node===null?rightDone.has(parent)?leftFirst?"right":"left":leftFirst?"left":"right":byId.get(parent).left===node?"left":"right",name:f.name};});
  if(record.scope==="dfs"&&text==="if not node:"&&x.node){visited.add(x.node.id);}
  if(record.scope==="dfs"&&(id===671?text.startsWith("left = dfs(node.left"):text.startsWith("dfs(node.right")))rightDone.add(x.node.id);
  if(record.scope==="add_leaves"&&text.startsWith("add_leaves(node.left"))rightDone.add(x.node.id);
  if(id===671){
   if(text==="return node.val"){candidates.add(x.node.id);descendants(x.node.id);change={kind:"prune",node:x.node.id};}
   if(record.scope==="dfs"&&record.returning&&x.node)returns.set(x.node.id,record.returned);
  }
  if(id===545){
   if(text==="boundary = [root.val]")boundaryIds=[x.root.id];
   if(text==="boundary.append(node.val)"){boundaryIds.push(x.node.id);change={kind:"record",node:x.node.id};}
   if(text==="right.append(node.val)"){rightIds.push(x.node.id);change={kind:"right",node:x.node.id};}
   if(text==="boundary.extend(right[::-1])"){boundaryIds.push(...[...rightIds].reverse());change={kind:"reverse"};}
   if(text==="return [root.val]")boundaryIds=[x.root.id];
   selected=[...boundaryIds];
  }
  if(stack.at(-1)?.node===null){const f=stack.at(-1);probe={parent:f.parent,side:f.side,child:null,exists:false,appended:false};}
  const answer=final?([116,117,2415,2641].includes(id)?rootOutput(id,nodes,values):trace.answer):null;
  const currentResult=x.answer??x.res??outer.res??x.boundary??outer.boundary??x.best??null;
  const view={problemId:id,method,nodes,queue,queueRoles:queue?.map(n=>roundIds.includes(n.id)?"current":"next")??null,
   round,roundIds:[...roundIds],roundPositions:copy(roundPositions),roundNodes:copy(roundNodes),limit,popped:[...popped],active,selected:[...selected],selections:copy(selections),maxNode,visited:[...visited],candidates:[...candidates],pruned:[...pruned],returns:[...returns].map(([node,value])=>({node,value})),boundaryIds:[...boundaryIds],rightIds:[...rightIds],stack,probe,change,changed,checks:copy(checks),result:currentResult,answer,
   decision:decision?copy(decision):null,source:{line,text,timing:"after"},scope:record.scope,locals:x,outer,frames:record.frames,branch:record.branch,returning:record.returning,returned:record.returned,trace:trace.trace};
  const phase=change?.kind==="record"?bi("Ghi kết quả","Record result"):change?.kind==="prune"?bi("Ứng viên → bỏ qua cây con","Candidate → prune descendants"):change?.kind==="link"?bi("Nối next","Connect next"):change?.kind==="value"?bi("Đổi giá trị","Update value"):change?.kind==="compare"?bi("So sánh max","Compare maximum"):final?bi("Kết quả","Result"):bi(text,text);
  const vars=Object.entries(x).map(([key,value])=>({name:key,value:value===null?"None":value,rawValue:value}));
  previous=view;
  return {arr:[],codeBlock:method,codeLines:[line],final,title:bi(`L${line} · ${phase.vi}`,`L${line} · ${phase.en}`),note:bi("",""),vars,treeReplayView:view};
 });
 const final=steps.at(-1).treeReplayView,answer=[199,515].includes(id)?JSON.stringify(trace.answer):final.answer;
 return {original:values,answer,steps};
}
const summaries={
199:bi("Mỗi độ sâu chọn một nút nhìn thấy từ bên phải.","Choose the node visible from the right at each depth."),
671:bi("Cây đặc biệt: mỗi nút trong có hai con và bằng min(hai con). Tìm giá trị nhỏ thứ hai khác biệt.","Special tree: each internal node has two children and equals their minimum. Find the second distinct minimum."),
515:bi("Chọn giá trị lớn nhất của từng tầng, kể cả khi mọi giá trị đều âm.","Choose the maximum value at each level, including all-negative levels."),
513:bi("Tìm nút trái nhất ở tầng sâu nhất.","Find the leftmost node at the deepest level."),
662:bi("Độ rộng tính từ nút đầu đến nút cuối của tầng, gồm cả vị trí trống ở giữa.","A level's width includes the empty positions between its first and last nodes."),
116:bi("Cây hoàn hảo: nối next sang nút liền kề cùng tầng.","Perfect tree: connect next to the adjacent node on the same level."),
117:bi("Cây có thể thiếu nhánh. Nối next giữa các nút cùng tầng.","The tree may be sparse. Connect next between nodes on the same level."),
1609:bi("Tầng 0, 2…: số lẻ tăng dần. Tầng 1, 3…: số chẵn giảm dần.","Levels 0, 2…: odd values strictly increase. Levels 1, 3…: even values strictly decrease."),
2415:bi("Trong cây hoàn hảo, đảo giá trị ở các tầng lẻ; giữ nguyên liên kết cây.","Reverse values at odd levels of a perfect tree; retain the tree links."),
2471:bi("Các giá trị khác nhau. Đếm số swap ít nhất để mỗi tầng tăng dần.","Node values are distinct. Count the fewest swaps to sort every level."),
2583:bi("Tính tổng từng tầng và tìm tổng lớn thứ k.","Compute each level sum and find the kth largest."),
2641:bi("Mỗi nút nhận tổng giá trị ban đầu của các nút cùng tầng nhưng khác cha.","Replace each value with the sum of original values at the same depth with a different parent."),
545:bi("Đi quanh biên ngược chiều kim đồng hồ; mỗi lá xuất hiện một lần.","Walk the boundary anticlockwise, including each leaf once.")};
const guides={199:["BFS: queue[-1] · deque: i = size−1 · DFS: phải → trái.","BFS: queue[-1] · deque: i = size−1 · DFS: right → left."],671:["Bằng root → đi tiếp. Lớn hơn root → trả ứng viên, bỏ cây con.","Equal to root → descend. Greater than root → return candidate, prune descendants."],515:["Khóa size → max = −∞ → so từng nút → ghi max.","Lock size → max = −∞ → compare each node → record max."],513:["Khóa size → i = 0 ghi answer → sang tầng sâu hơn.","Lock size → i = 0 records answer → move one level deeper."],662:["Chuẩn hóa pos → đẩy vị trí con → width = last + 1.","Normalize pos → enqueue child positions → width = last + 1."],116:["Nối anh em → nối qua cha.next → xuống tầng.","Link siblings → bridge via parent.next → descend."],117:["dummy → tail → nối các con → current = dummy.next.","dummy → tail → link children → current = dummy.next."],1609:["Kiểm tra chẵn/lẻ → kiểm tra thứ tự → cập nhật prev.","Check parity → check ordering → update prev."],2415:["Gom nodes → đảo values → gán từng giá trị.","Collect nodes → reverse values → assign one value at a time."],2471:["values → target → tìm j → swap → tăng answer.","values → target → find j → swap → increment answer."],2583:["Tổng tầng → heappush → quá k thì heappop.","Level sum → heappush → heappop when size exceeds k."],2641:["Gom tổng tầng trước → trừ tổng anh em → gán từng con.","Collect the level sum first → subtract sibling sum → assign each child."],545:["Gốc → biên trái không lá → lá trái sang phải → biên phải đảo ngược.","Root → left boundary without leaves → leaves left to right → reversed right boundary."]};
const exported={};
for(const id of ids){
 const base=bfs[id]??tree[id],codes=id===199?[normalize(base.code),normalize(base.code2),normalize(base.code3)]:[normalize(id===545?boundaryCode:base.code)];
 exported[id]={...base,statement:summaries[id],approach:[bi(...guides[id])],code:codes[0],...(codes[1]?{code2:codes[1],code3:codes[2]}:{}),debugMode:"line-by-line",allowEmptyInput:![513,671,2415,2471].includes(id),
  inputLabel:bi("Cây level-order · tối đa 31 nút · null cho nhánh trống","Level-order tree · up to 31 nodes · null for missing children"),
  visualizationLimits:{maxNodes:31,completeTrace:true},builder:(input,params)=>build(id,base,codes,input,params),
  liveArgs:(input,params)=>{const args=argumentsFor(input,id,params);args[0]={__viz_type:[116,117].includes(id)?"binary_tree_next":"binary_tree",values:args[0],tree_id:"root"};return args;}};
}
module.exports=exported;
