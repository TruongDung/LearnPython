"use strict";
const bi=(vi,en)=>({vi,en});
const LIMIT=600, TREE_LIMIT=63;
function parse(input) {
  let values=input;
  if(typeof input==="string") {
    const raw=input.trim();
    if(raw.startsWith("[")) {try{values=JSON.parse(raw);}catch{throw new Error("653: Invalid JSON tree / Cây JSON không hợp lệ.");}}
    else values=raw?raw.split(",").map(s=>{const v=s.trim();if(v==="null"||v==="None")return null;if(!v)throw new Error("653: Empty entry / Có ô rỗng.");return Number(v);}):[];
  }
  if(!Array.isArray(values)||values.length>20001||values.some(v=>v!==null&&(!Number.isInteger(v)||v < -10000||v > 10000)))throw new Error("653: Use level-order integers -10000..10000 and null / Nhập cây level-order, giá trị -10000..10000 hoặc null.");
  if(!values.length||values[0]===null){if(values.slice(1).some(v=>v!==null))throw new Error("653: Nodes without a root / Thiếu nút gốc.");return {root:null,nodes:[],sorted:[]};}
  const root={id:0,val:values[0],parent:null,depth:0,left:null,right:null},nodes=[root];let index=1;
  for(let i=0;i<nodes.length&&index<values.length;i++) {
    for(const side of ["left","right"]) {
      if(index>=values.length)break;const id=index++,val=values[id];
      if(val!==null){const child={id,val,parent:nodes[i].id,depth:nodes[i].depth+1,left:null,right:null};nodes[i][side]=child;nodes.push(child);}
    }
  }
  if(nodes.length>10000||values.slice(index).some(v=>v!==null))throw new Error("653: At most 10000 connected nodes / Tối đa 10000 nút nối với gốc.");
  const sorted=[],stack=[];let current=root;
  while(current||stack.length){while(current){stack.push(current);current=current.left;}current=stack.pop();current.rank=sorted.length;sorted.push(current);current=current.right;}
  for(let i=1;i<sorted.length;i++)if(sorted[i].val<sorted[i-1].val)throw new Error("653: Input must be a BST / Cần nhập cây BST.");
  return {root,nodes,sorted};
}
function build(input,params={},method=1) {
  const {root,nodes,sorted}=parse(input),target=Number(params.k??9);
  if(!Number.isInteger(target)||target < -100000||target > 100000)throw new Error("653: k must be an integer -100000..100000 / k phải là số nguyên -100000..100000.");
  const steps=[],seen=new Map(),base=nodes.slice(0,TREE_LIMIT).map(n=>({id:n.id,value:n.val,parent:n.parent,depth:n.depth,rank:n.rank}));
  let omitted=0,left=-1,right=-1,appended=0,current=null,need=null,pair=null,answer=null;
  const window=()=>{
    const count=method===1?appended:sorted.length;
    if(count<=24)return sorted.slice(0,count).map(n=>({index:n.rank,id:n.id,value:n.val}));
    const start=Math.max(0,Math.min(left>=0?left:count-12,count-12)),end=right>=0?Math.max(0,Math.min(right-11,count-12)):start;
    const ids=new Set([...Array.from({length:12},(_,i)=>start+i),...Array.from({length:12},(_,i)=>end+i)]);
    return [...ids].sort((a,b)=>a-b).map(i=>({index:i,id:sorted[i].id,value:sorted[i].val}));
  };
  function emit(phase,line,title,extra={}) {
    if(steps.length>=LIMIT&&phase!=="done"){omitted++;return;}
    const found=pair!==null;
    const pointerIds=method===1?[sorted[left]?.id,sorted[right]?.id]:[current?.id,extra.checked===true?seen.get(need)?.id:undefined];
    const pairIds=pair?.map(n=>n.id)||[];
    const visits=new Set([...seen.values()].map(n=>n.id));
    const shownSeen=[...seen.values()];const visibleSeen=shownSeen.slice(-24);
    if(need!==null&&seen.has(need)&&!visibleSeen.some(n=>n.val===need)){visibleSeen.shift();visibleSeen.push(seen.get(need));}
    steps.push({arr:[],codeBlock:method,codeLines:[line],title,final:phase==="done",
      vars:[{name:"k",value:target},...(method===1?[{name:"left",value:left},{name:"right",value:right}]:[{name:"node",value:current?.val??"—"},{name:"need",value:need??"—"},{name:"seen.size",value:seen.size}]),...(answer===null?[]:[{name:"answer",value:answer}])],
      note:bi("Hai nút phải khác nhau.","The two nodes must be distinct."),
      bstTwoSum653View:{method,phase,target,total:nodes.length,tree:base.map(n=>({...n,visited:method===1?n.rank<appended:visits.has(n.id),role:pairIds.includes(n.id)?"match":n.id===pointerIds[0]?(method===1?"left":"current"):n.id===pointerIds[1]?(method===1?"right":"partner"):n.id===current?.id?"current":""})),
        values:window(),appended,left,right,current:current?{id:current.id,value:current.val}:null,need,
        sum:extra.sum??null,move:extra.move??null,seen:visibleSeen.map(n=>({id:n.id,value:n.val})),seenSize:seen.size,
        checked:extra.checked??null,pair:pair?pair.map(n=>({id:n.id,value:n.val})):null,answer,omitted,found}
    });
  }
  if(method===1) {
    emit("init",3,bi("BST → inorder","BST → inorder"));
    for(const node of sorted){current=node;appended++;emit("inorder",8,bi(`Thêm ${node.val}`,`Append ${node.val}`));}
    current=null;left=0;right=sorted.length-1;
    emit("pointers",11,bi("L → ← R","L → ← R"));
    while(left<right) {
      emit("compare",12,bi("Hai nút khác nhau","Two distinct nodes"));
      const sum=sorted[left].val+sorted[right].val;
      emit("sum",13,bi(`${sorted[left].val} + ${sorted[right].val} = ${sum}`,`${sorted[left].val} + ${sorted[right].val} = ${sum}`),{sum});
      if(sum===target){pair=[sorted[left],sorted[right]];answer=true;emit("done",15,bi(`✓ ${sum} = k`,`✓ ${sum} = k`),{sum});return {input,answer,steps};}
      if(sum<target){emit("move",17,bi("L →","L →"),{sum,move:"left"});left++;}
      else{emit("move",19,bi("← R","← R"),{sum,move:"right"});right--;}
    }
    answer=false;emit("done",20,bi("Không có cặp","No pair"));return {input,answer,steps};
  }
  emit("init",3,bi("seen = ∅","seen = ∅"));
  const stack=root?[root]:[];
  while(stack.length) {
    current=stack.pop();need=target-current.val;
    emit("need",7,bi(`${target} − ${current.val} = ${need}`,`${target} − ${current.val} = ${need}`));
    const exists=seen.has(need);
    emit("check",8,bi(exists?"✓ seen":"× seen",exists?"✓ seen":"× seen"),{checked:exists});
    if(exists){pair=[seen.get(need),current];answer=true;emit("found",9,bi("✓ Hai nút","✓ Two nodes"),{checked:true});break;}
    seen.set(current.val,current);
    emit("add",10,bi(`seen ← ${current.val}`,`seen ← ${current.val}`),{checked:false});
    if(current.right)stack.push(current.right);if(current.left)stack.push(current.left);
  }
  answer=Boolean(pair);
  // Keep the matching nodes visible in the return frame.
  emit("done",12,bi(answer?"✓ Tìm thấy cặp":"Không có cặp",answer?"✓ Pair found":"No pair"));
  return {input,answer,steps};
}
module.exports={buildSteps:(input,params)=>build(input,params,1),buildStepsHash:(input,params)=>build(input,params,2)};

