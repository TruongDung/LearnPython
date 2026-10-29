'use strict';
const base=require('./tree')[1973],bi=(vi,en)=>({vi,en});
function parse(input){
 let values;
 try{if(Array.isArray(input))values=[...input];else if(typeof input==='string'){const text=input.trim();values=text.startsWith('[')?JSON.parse(text):text.split(',').map(s=>s.trim());}else throw Error();}catch{throw new TypeError('Enter a non-empty binary tree in level-order');}
 if(!Array.isArray(values)||!values.length||values.every(v=>v===''))throw new TypeError('Enter a non-empty binary tree');
 values=values.map(v=>{if(v===null||typeof v==='string'&&/^(null|)$/i.test(v))return null;const value=typeof v==='number'||typeof v==='string'?Number(v):NaN;if(!Number.isInteger(value)||value<0||value>100000)throw new TypeError('Tree values must be integers from 0 to 100000, or null');return value;});
 if(values[0]===null)throw new TypeError('The root cannot be null');
 const nodes=[{id:0,val:values[0],left:null,right:null,parentId:null,depth:0}];let cursor=1;
 for(let head=0;head<nodes.length&&cursor<values.length;head++)for(const side of ['left','right']){if(cursor<values.length&&values[cursor]!==null){nodes[head][side]=nodes.length;nodes.push({id:nodes.length,val:values[cursor],left:null,right:null,parentId:head,depth:nodes[head].depth+1});}cursor++;}
 if(values.slice(cursor).some(v=>v!==null))throw new TypeError('Invalid level-order tree: values remain after all parents are null');
 if(nodes.length>31)throw new TypeError('Visualization supports at most 31 tree nodes');
 while(values.at(-1)===null)values.pop();
 return {values,nodes};
}
function build(input){
 const {values,nodes}=parse(input),steps=[],frames=[],stats=nodes.map(()=>({leftSum:null,rightSum:null,descendantSum:null,subtreeSum:null,match:null,counted:false}));let answer,frameId=0;
 const encode=id=>id===null?null:{val:nodes[id].val,left:encode(nodes[id].left),right:encode(nodes[id].right)};
 function frameLocals(f){return {node:encode(f.node),...Object.fromEntries(['left_sum','right_sum','descendant_sum'].filter(k=>f[k]!==undefined).map(k=>[k,f[k]])),answer};}
 function emit(line,event,title,options={}){
  const frame=frames.at(-1),current=frame?.node??null,methodLocals={root:encode(0),answer},locals=frame?frameLocals(frame):methodLocals,focus=frame?(frame.node??frame.parentId):null;
  const viewNodes=nodes.map(node=>({...node,value:node.val,x:node.id,y:node.depth,...stats[node.id],state:stats[node.id].match!==null?(stats[node.id].match?'match':'miss'):stats[node.id].descendantSum!==null?'combine':frames.some(f=>f.node===node.id)?'waiting':'unvisited'}));
  const results=viewNodes.filter(node=>node.match!==null).map(node=>({id:node.id,value:node.val,descendantSum:node.descendantSum,subtreeSum:node.subtreeSum,match:node.match,counted:node.counted}));
  const stat=current===null?null:stats[current],formula=stat?.subtreeSum!==null&&stat?{nodeValue:nodes[current].val,leftSum:stat.leftSum,rightSum:stat.rightSum,descendantSum:stat.descendantSum,subtreeSum:stat.subtreeSum,match:stat.match}:null;
  const names=frame?['node','left_sum','right_sum','descendant_sum','answer']:['root','answer'];
  steps.push({arr:[],title,note:bi('',''),codeLines:[line],codeBlock:1,final:event==='done',vars:names.map(name=>({name,value:name==='node'||name==='root'?locals[name]===null?'None':`#${(name==='root'?0:current)+1} (${locals[name].val})`:locals[name]??'—',rawValue:locals[name]??(name==='node'?null:'—')})),
   descendantSum1973View:{debug:true,phase:event==='done'?'done':event==='combine'?'combine':['match','miss','count'].includes(event)?'compare':'postorder',phaseIndex:event==='done'?3:['match','miss','count'].includes(event)?2:event==='combine'?1:0,
    event,source:{line,text:base.code[line-1],timing:'after'},scope:frame?'dfs':'equalToDescendants',locals,methodLocals,nodes:viewNodes,stack:frames.filter(f=>f.node!==null).map(f=>f.node),
    frames:frames.map(f=>({...f,locals:frameLocals(f)})),current,focus,parent:frame?.parentId??null,side:frame?.side??null,formula,answer,processed:results.length,totalNodes:nodes.length,results,
    check:options.check??null,returned:options.returned??null,transfer:options.transfer??null,increment:options.increment??null},
  });
 }
 answer=0;emit(3,'start',bi('answer = 0','answer = 0'));emit(4,'define',bi('Tạo dfs trả tổng cây con','Define subtree-sum DFS'));
 function dfs(node,parentId=null,side='root'){
  const f={id:frameId++,node,parentId,side};frames.push(f);emit(6,node===null?'null':'enter',bi(node===null?'node = None':`dfs(#${node+1})`,node===null?'node = None':`dfs(#${node+1})`),{check:node===null});
  if(node===null){emit(7,'return-null',bi('∅ → 0','∅ → 0'),{returned:0,transfer:{from:null,to:parentId,side,value:0}});frames.pop();return 0;}
  const n=nodes[node],stat=stats[node];
  f.left_sum=dfs(n.left,node,'left');stat.leftSum=f.left_sum;emit(8,'left',bi(`left_sum = ${f.left_sum}`,`left_sum = ${f.left_sum}`),{returned:f.left_sum,transfer:{from:n.left,to:node,side:'left',value:f.left_sum}});
  f.right_sum=dfs(n.right,node,'right');stat.rightSum=f.right_sum;emit(9,'right',bi(`right_sum = ${f.right_sum}`,`right_sum = ${f.right_sum}`),{returned:f.right_sum,transfer:{from:n.right,to:node,side:'right',value:f.right_sum}});
  f.descendant_sum=f.left_sum+f.right_sum;stat.descendantSum=f.descendant_sum;emit(10,'combine',bi(`${f.left_sum} + ${f.right_sum} = ${f.descendant_sum}`,`${f.left_sum} + ${f.right_sum} = ${f.descendant_sum}`));
  stat.match=n.val===f.descendant_sum;emit(11,stat.match?'match':'miss',bi(`${n.val} ${stat.match?'=':'≠'} ${f.descendant_sum}`,`${n.val} ${stat.match?'=':'≠'} ${f.descendant_sum}`),{check:stat.match});
  if(stat.match){const from=answer;answer++;stat.counted=true;emit(12,'count',bi(`answer: ${from} → ${answer}`,`answer: ${from} → ${answer}`),{increment:{from,to:answer,node}});}
  const sum=n.val+f.descendant_sum;stat.subtreeSum=sum;emit(13,'return',bi(`↩ ${n.val} + ${f.descendant_sum} = ${sum}`,`↩ ${n.val} + ${f.descendant_sum} = ${sum}`),{returned:sum,transfer:{from:node,to:parentId,side,value:sum}});frames.pop();return sum;
 }
 dfs(0);emit(15,'complete',bi('dfs(root) đã xong','dfs(root) complete'));emit(16,'done',bi(`Có ${answer} node thỏa`,`${answer} matching nodes`));
 return {original:values,input,answer,steps};
}
module.exports={1973:{...base,builder:build,debugMode:'line-by-line',liveArgs:input=>[{__viz_type:'binary_tree',values:parse(input).values,tree_id:'root'}],
 approach:[bi('Trái + phải → so với node.val → trả tổng kèm node cho cha.','Left + right → compare with node.val → return the sum including this node.')],
}};
