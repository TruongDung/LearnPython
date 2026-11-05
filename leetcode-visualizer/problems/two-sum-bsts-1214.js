'use strict';
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const codes=[`from typing import Optional

class Solution:
    def twoSumBSTs(self, root1: Optional[TreeNode], root2: Optional[TreeNode], target: int) -> bool:
        def inorder(root):
            values = []
            stack = []
            node = root
            while node or stack:
                while node:
                    stack.append(node)
                    node = node.left
                node = stack.pop()
                values.append(node.val)
                node = node.right
            return values

        a = inorder(root1)
        b = inorder(root2)
        i, j = 0, len(b) - 1
        while i < len(a) and j >= 0:
            total = a[i] + b[j]
            if total == target:
                return True
            if total < target:
                i += 1
            else:
                j -= 1
        return False`,
`from typing import Optional

class Solution:
    def twoSumBSTs(self, root1: Optional[TreeNode], root2: Optional[TreeNode], target: int) -> bool:
        seen = set()
        stack1 = [root1]
        while stack1:
            node1 = stack1.pop()
            seen.add(node1.val)
            if node1.right:
                stack1.append(node1.right)
            if node1.left:
                stack1.append(node1.left)

        stack2 = [root2]
        while stack2:
            node2 = stack2.pop()
            need = target - node2.val
            if need in seen:
                return True
            if node2.right:
                stack2.append(node2.right)
            if node2.left:
                stack2.append(node2.left)
        return False`].map(source=>source.split('\n'));

function parseTree(values,tree){
 if(typeof values==='string'){const raw=values.trim();try{values=raw.startsWith('[')?JSON.parse(raw):raw.split(',').map(v=>v.trim()==='null'||v.trim()==='None'?null:v.trim()?Number(v):NaN);}catch{values=null;}}
 if(!Array.isArray(values)||!values.length||values.length>63||values[0]===null||values.some(v=>v!==null&&(!Number.isInteger(v)||Math.abs(v)>1e9)))throw new RangeError('1214: Each BST needs 1–31 integer nodes (−10⁹…10⁹); use level-order and null for missing children.');
 const nodes=[{id:`${tree}:0`,value:values[0],left:null,right:null,parent:null,depth:0}],byId=new Map([[nodes[0].id,nodes[0]]]);let index=1;
 for(let head=0;head<nodes.length&&index<values.length;head++)for(const side of['left','right']){if(index>=values.length)break;const value=values[index],id=`${tree}:${index++}`;if(value===null)continue;const child={id,value,left:null,right:null,parent:nodes[head].id,depth:nodes[head].depth+1};nodes[head][side]=id;nodes.push(child);byId.set(id,child);}
 if(nodes.length>31||values.slice(index).some(v=>v!==null))throw new RangeError('1214: At most 31 connected nodes per BST in the visual demo.');
 const order=[],stack=[];let node=nodes[0];while(node||stack.length){while(node){stack.push(node);node=byId.get(node.left);}node=stack.pop();node.rank=order.length;order.push(node);node=byId.get(node.right);}
 if(order.some((n,i)=>i&&n.value<order[i-1].value))throw new RangeError('1214: Both trees must be BSTs (inorder values must be ascending).');
 return{values:[...values],nodes,order};
}
function parse(input,params={}){
 let config=input;if(typeof config==='string'){try{config=JSON.parse(config);}catch{const halves=input.split('|');config=halves.length===2?{root1:halves[0],root2:halves[1]}:null;}}
 if(!config||Array.isArray(config)||typeof config!=='object')throw new RangeError('1214: Enter JSON {"root1":[2,1,4],"root2":[1,0,3]} or 2,1,4 | 1,0,3.');
 const trees=[parseTree(config.root1,0),parseTree(config.root2,1)],raw=params.target??config.target??5,target=typeof raw==='string'&&raw.trim()===''?NaN:Number(raw);
 if(!['number','string'].includes(typeof raw)||!Number.isInteger(target)||Math.abs(target)>1e9)throw new RangeError('1214: target must be an integer from −10⁹ to 10⁹.');
 return{trees,target};
}
const copy=value=>value===null?null:JSON.parse(JSON.stringify(value));
function build(input,params={},method=1){
 const{trees,target}=parse(input,params),code=codes[method-1],trace=runTrace({code:code.join('\n'),method:'twoSumBSTs',args:[...trees.map(t=>t.values),target],treeArgs:[0,1]});
 const added=[[],[]],visited=[new Set(),new Set()],firstSeen=new Map(),history=[];let phase='build-a',need=null,checked=null,comparison=null,move=null,pair=null;
 const steps=trace.events.map((record,index)=>{
  const local=record.locals,root=record.outer,x={...root,...local},source=code[record.line-1].trim(),final=index===trace.events.length-1;
  let active=null,stack=[[],[]];move=null;
  if(method===1){
   if(record.scope==='inorder'){
    const owner=Number(local.root.id.split(':')[0]);phase=owner===0?'build-a':'build-b';active=local.node?.id??null;stack[owner]=(local.stack??[]).map(n=>n.id);
    if(source==='values.append(node.val)'){added[owner].push(local.node.id);visited[owner].add(local.node.id);}
   }else{
    phase=root.i===undefined?'ready':'compare';
    if(source==='total = a[i] + b[j]'){
     comparison={a:trees[0].order[root.i].id,b:trees[1].order[root.j].id,left:root.a[root.i],right:root.b[root.j],sum:root.total};history.push({...comparison,step:index});
    }
    if(source==='i += 1'||source==='j -= 1'){comparison=null;move=source.startsWith('i')?'a':'b';}
   }
  }else{
   if(root.stack2!==undefined)phase='search-b';
   else phase='build-a';
   stack=[(root.stack1??[]).map(n=>n.id),(root.stack2??[]).map(n=>n.id)];active=phase==='build-a'?root.node1?.id??null:root.node2?.id??null;
   if(source==='seen.add(node1.val)'){visited[0].add(root.node1.id);if(!firstSeen.has(root.node1.val))firstSeen.set(root.node1.val,root.node1.id);}
   if(source==='node2 = stack2.pop()'){visited[1].add(root.node2.id);need=null;checked=null;}
   if(source==='need = target - node2.val'){need=root.need;checked=null;}
   if(source==='if need in seen:'){checked=record.branch;history.push({node:root.node2.id,value:root.node2.val,need,found:checked,step:index});}
  }
  if(record.scope==='twoSumBSTs'&&record.returning&&record.returned===true){
   pair=method===1?[trees[0].order[root.i].id,trees[1].order[root.j].id]:[firstSeen.get(root.need),root.node2.id];
  }
  if(final)phase='done';
  const arrays=method===1?trees.map((t,tree)=>({name:root[tree?'b':'a']!==undefined?(tree?'b':'a'):`inorder(${tree?'B':'A'})`,values:record.scope==='inorder'&&Number(local.root.id.split(':')[0])===tree?[...(local.values??[])]:[...(root[tree?'b':'a']??added[tree].map(id=>t.nodes.find(n=>n.id===id).value))],ids:[...added[tree]]})):[];
  const pointers=method===1?[root.i??null,root.j??null]:[null,null];
  const pointerIds=method===1?trees.map((t,i)=>t.order[pointers[i]]?.id??null):[null,null];
  const view={id:1214,method,line:record.line,source,scope:record.scope,phase,target,trees:trees.map(t=>t.nodes.map(n=>({...n}))),arrays,pointers,pointerIds,active,stack,visited:visited.map(s=>[...s]),seen:method===2?[...(root.seen??[])]:[],seenIds:[...firstSeen].map(([value,id])=>({value,id})),need,checked,comparison:copy(comparison),move,pair:copy(pair),history:copy(history),answer:final?trace.answer:null,final};
  const names=method===1?['target','root','node','values','stack','a','b','i','j','total']:['target','node1','node2','need','seen','stack1','stack2'];
  return{arr:[],codeBlock:method,codeLines:[record.line],final,title:bi(`Dòng ${record.line} · ${record.scope}`,`Line ${record.line} · ${record.scope}`),note:bi('',''),vars:names.map(name=>({name,value:x[name]??'—'})),bstPair1214View:view};
 });return{original:{root1:[...trees[0].values],root2:[...trees[1].values]},answer:trace.answer,steps};
}
const labels=[bi('Inorder + hai con trỏ','Inorder + two pointers'),bi('DFS + HashSet','DFS + HashSet')];
module.exports={1214:{id:1214,difficulty:'medium',slug:'two-sum-bsts',category:{key:'bst',vi:'BST',en:'BST'},tags:[{key:'bst',vi:'BST',en:'BST'},{key:'two-pointer',vi:'Hai con trỏ',en:'Two pointers'},{key:'hashmap',vi:'HashSet',en:'HashSet'}],title:bi('Two Sum BSTs','Two Sum BSTs'),titleVi:bi('Một nút từ mỗi cây','One node from each tree'),statement:bi('Chọn một nút từ cây A và một nút từ cây B. Tổng bằng target → true.','Choose one node from tree A and one from tree B. Sum equals target → true.'),inputKind:'string',inputLabel:bi('Hai BST · JSON root1 / root2 · 1–31 nút/cây','Two BSTs · JSON root1 / root2 · 1–31 nodes/tree'),defaultInput:JSON.stringify({root1:[2,1,4],root2:[1,0,3]}),debugMode:'line-by-line',extraParams:[{key:'target',type:'number',label:bi('Tổng cần tìm','Target sum'),default:5,min:-1e9,max:1e9},{key:'approach',type:'select',label:bi('Cách giải','Approach'),default:1,options:labels.map((label,i)=>({value:i+1,label}))}],code:codes[0],codeLabel:labels[0],code2:codes[1],code2Label:labels[1],complexity:{time:'O(N + M)',space:'O(N + M)'},complexity2:{time:'O(N + M)',space:'O(N + H₁ + H₂)',note:bi('N, M: số nút hai cây · H: chiều cao cây.','N, M: node counts · H: tree height.')},approach:[bi('Inorder → hai dãy tăng. Tổng nhỏ: tăng i. Tổng lớn: giảm j.','Inorder → two ascending lists. Small sum: increase i. Large sum: decrease j.'),bi('Lưu giá trị cây A vào seen; với mỗi nút B, tìm target − B.','Store A values in seen; for each B node, look up target − B.')],builder:(input,params)=>build(input,params,1),builder2:(input,params)=>build(input,params,2),liveArgs:(input,params)=>{const{trees,target}=parse(input,params);return[...trees.map((t,i)=>({__viz_type:'binary_tree',values:[...t.values],tree_id:`root${i+1}`})),target];}}};
