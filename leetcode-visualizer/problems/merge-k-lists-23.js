"use strict";
const base=require("./heap")[23],bi=(vi,en)=>({vi,en});
const code=[
  "import heapq",
  "",
  "class Solution:",
  "    def mergeKLists(self, lists):",
  "        heap = []",
  "        for i, node in enumerate(lists):",
  "            if node:",
  "                heapq.heappush(heap, (node.val, i, node))",
  "        dummy = ListNode(0)",
  "        tail = dummy",
  "        while heap:",
  "            _, i, node = heapq.heappop(heap)",
  "            tail.next = node",
  "            tail = tail.next",
  "            if node.next:",
  "                heapq.heappush(heap, (node.next.val, i, node.next))",
  "        return dummy.next",
];
const code2=[
  "class Solution:",
  "    def mergeKLists(self, lists):",
  "        if not lists:",
  "            return None",
  "        width = 1",
  "        while width < len(lists):",
  "            for i in range(0, len(lists) - width, 2 * width):",
  "                left, right = lists[i], lists[i + width]",
  "                dummy = ListNode(0)",
  "                tail = dummy",
  "                while left and right:",
  "                    if left.val <= right.val:",
  "                        tail.next = left",
  "                        left = left.next",
  "                    else:",
  "                        tail.next = right",
  "                        right = right.next",
  "                    tail = tail.next",
  "                tail.next = left or right",
  "                lists[i] = dummy.next",
  "            width *= 2",
  "        return lists[0]",
];
function parse(input){
  let lists=input;
  const row=text=>{const s=text.trim();if(!s||s==='[]')return [];if(!/^-?\d+(\s*,\s*-?\d+)*$/.test(s))throw Error('Mỗi list: các số cách nhau dấu phẩy / use comma-separated integers per list.');return s.split(',').map(Number);};
  if(typeof input==='string'){
    const text=input.trim();
    if(text.includes(';')) lists=text.split(';').map(row);
    else if(text.startsWith('[')){try{lists=JSON.parse(text);}catch{throw Error('lists: JSON không hợp lệ / invalid JSON.');}}
    else lists=text?[row(text)]:[];
  }
  if(!Array.isArray(lists)||lists.length>10000||lists.some(values=>!Array.isArray(values)||values.length>500||values.some((v,i)=>!Number.isInteger(v)||v < -10000||v > 10000||i>0&&values[i-1]>v))||lists.reduce((n,row)=>n+row.length,0)>10000)throw Error('Nhập các list tăng dần; ≤10000 list, ≤500 node/list, tổng ≤10000 node; giá trị nguyên trong [-10000,10000] / enter sorted lists within these limits.');
  return lists.map(values=>[...values]);
}
function less(a,b){return a[0]<b[0]||a[0]===b[0]&&a[1]<b[1];}
function push(heap,item){let pos=heap.length;heap.push(item);while(pos>0){const parent=(pos-1)>>1;if(!less(item,heap[parent]))break;heap[pos]=heap[parent];pos=parent;}heap[pos]=item;}
function pop(heap){const root=heap[0],last=heap.pop();if(!heap.length)return root;let pos=0,child=1;while(child<heap.length){if(child+1<heap.length&&!less(heap[child],heap[child+1]))child++;heap[pos]=heap[child];pos=child;child=pos*2+1;}while(pos>0){const parent=(pos-1)>>1;if(!less(last,heap[parent]))break;heap[pos]=heap[parent];pos=parent;}heap[pos]=last;return root;}
function build(input,approach){
  const values=parse(input),source=approach===1?code:code2,nodes=[],original=[],steps=[];
  for(let origin=0;origin<values.length;origin++){
    const row=values[origin].map((value,index)=>{const node={id:nodes.length,val:value,next:null,origin,index};nodes.push(node);return node;});
    for(let i=1;i<row.length;i++)row[i-1].next=row[i];original.push(row.map(node=>node.id));
  }
  const totalNodes=nodes.length,detailed=values.length<=6&&totalNodes<=16;
  const locals={self:{},lists:original.map(ids=>ids.length?nodes[ids[0]]:null)};
  let dummyId=-1,phase=approach===1?'seed':'pairs',selected=null,change=null,round=0,pair=[],stitched=false;
  const name=node=>node===null?'None':node.id<0?`D${-node.id}`:`#${node.id+1}`;
  function walk(node){const out=[],seen=new Set();while(node){if(seen.has(node.id))throw Error('Unexpected pointer cycle.');seen.add(node.id);out.push(node.id);node=node.next;}return out;}
  function encode(value){if(value&&typeof value==='object'&&Object.hasOwn(value,'id'))return {val:value.val,next:encode(value.next)};if(Array.isArray(value))return value.map(encode);if(value&&typeof value==='object')return {...value};return value;}
  function makeDummy(){const node={id:dummyId--,val:0,next:null,origin:null,index:null};nodes.push(node);return node;}
  function emit(line,event,title,check=null){
    if(!detailed)return;
    const final=event==='return',root=final?(approach===1?locals.dummy.next:locals.lists[0]??null):locals.dummy?.next??null;
    const chain=walk(root),tail=locals.tail?.id??null,tailIndex=chain.indexOf(tail),confirmed=final||stitched?chain:chain.slice(0,tailIndex+1);
    const pointers=Object.fromEntries(['dummy','tail','node','left','right'].filter(key=>Object.hasOwn(locals,key)).map(key=>[key,locals[key]?.id??null]));
    steps.push({title:bi(`Dòng ${line} · ${title.vi}`,`Line ${line} · ${title.en}`),codeLines:[line],codeBlock:approach,final,arr:[],highlight:[],mark:[],note:bi('',''),
      vars:Object.entries(locals).map(([key,value])=>({name:key,rawValue:encode(value),value:key==='self'?'Solution':['dummy','tail','node','left','right'].includes(key)?name(value):key==='lists'?value.map(name):key==='heap'?value.map(([val,i,node])=>`(${val}, L${i}, ${name(node)})`):value})),
      merge23View:{mode:'trace',approach,phase,event,line,source:source[line-1].trim(),original:original.map(row=>[...row]),rowLengths:values.map(row=>row.length),totalNodes,totalLists:values.length,
        nodes:nodes.map(node=>({id:node.id,value:node.val,origin:node.origin,index:node.index,next:node.next?.id??null})),heads:locals.lists.map(node=>node?.id??null),
        heap:(locals.heap??[]).map(([value,origin,node])=>({value,origin,id:node.id})),pointers,chain:[...chain],confirmed:[...confirmed],selected,change:change&&{...change},check,round,pair:[...pair],width:locals.width??null}
    });
  }
  function link(to,line,event){const before=locals.tail.next?.id??null;locals.tail.next=to;change={from:locals.tail.id,before,after:to?.id??null};emit(line,event,bi(`${name(locals.tail)}.next → ${name(to)}`,`${name(locals.tail)}.next → ${name(to)}`));change=null;}
  function finish(root,line){
    const order=walk(root),answer=order.map(id=>nodes[id].val);
    emit(line,'return',bi(answer.length?`Gộp đủ ${answer.length} node`:'Danh sách rỗng → None',answer.length?`All ${answer.length} nodes merged`:'Empty list → None'));
    if(!detailed){const shown=new Set([...original.slice(0,4).flatMap(ids=>ids.slice(0,5)),...order.slice(0,12)]);steps.push({title:bi('Kết quả · đã gộp đủ toàn bộ đầu vào','Result · full input merged'),codeLines:[],codeBlock:approach,final:true,vars:[],arr:[],highlight:[],mark:[],note:bi('',''),
      merge23View:{mode:'summary',approach,phase:'done',event:'return',line:null,source:'',original:original.slice(0,4).map(ids=>ids.slice(0,5)),rowLengths:values.slice(0,4).map(row=>row.length),totalNodes,totalLists:values.length,nodes:nodes.filter(node=>shown.has(node.id)).map(node=>({id:node.id,value:node.val,origin:node.origin,index:node.index,next:node.next?.id??null})),heads:[],heap:[],pointers:{},chain:order.slice(0,12),confirmed:order.slice(0,12),selected:null,change:null,check:null,round,pair:[],width:null}
    });}
    return {original:values,answer,steps};
  }
  if(approach===1){
    locals.heap=[];emit(5,'heap-init',bi('Heap rỗng','Empty heap'));
    for(let i=0;i<locals.lists.length;i++){
      locals.i=i;locals.node=locals.lists[i];emit(6,'seed-node',bi(`Đầu L${i}: ${name(locals.node)}`,`Head of L${i}: ${name(locals.node)}`));
      emit(7,'seed-check',bi(locals.node?'Có node đầu':'List rỗng',locals.node?'Head exists':'Empty list'),Boolean(locals.node));
      if(locals.node){push(locals.heap,[locals.node.val,i,locals.node]);emit(8,'push-head',bi(`Đưa ${name(locals.node)} vào heap`,`Push ${name(locals.node)} into heap`));}
    }
    emit(6,'seed-end',bi('Đã xét hết list','All list heads considered'));
    locals.dummy=makeDummy();emit(9,'dummy',bi('Tạo node giả D1','Create dummy D1'));
    locals.tail=locals.dummy;emit(10,'tail-init',bi('tail → D1','tail → D1'));phase='merge';
    while(true){
      selected=null;const active=locals.heap.length>0;emit(11,'while',bi(active?'Heap còn node':'Heap rỗng → xong',active?'Heap has nodes':'Heap empty → done'),active);if(!active)break;
      [locals._,locals.i,locals.node]=pop(locals.heap);selected=locals.node.id;round++;emit(12,'pop',bi(`Lấy nhỏ nhất: ${locals.node.val} · L${locals.i}`,`Pop smallest: ${locals.node.val} · L${locals.i}`));
      link(locals.node,13,'link');locals.tail=locals.tail.next;emit(14,'tail',bi(`tail → ${name(locals.tail)}`,`tail → ${name(locals.tail)}`));
      const more=Boolean(locals.node.next);emit(15,'next-check',bi(more?'Còn node kế trong cùng list':'List này đã hết',more?'Successor in the same list':'This list is exhausted'),more);
      if(more){push(locals.heap,[locals.node.next.val,locals.i,locals.node.next]);emit(16,'push-next',bi(`Đưa ${name(locals.node.next)} vào heap`,`Push ${name(locals.node.next)} into heap`));}
    }
    return finish(locals.dummy.next,17);
  }
  const empty=locals.lists.length===0;emit(3,'empty-check',bi(empty?'Không có list':'Có list để gộp',empty?'No lists':'Lists available'),empty);if(empty)return finish(null,4);
  locals.width=1;emit(5,'width',bi('Bắt đầu gộp cặp','Start merging pairs'));
  while(true){
    const active=locals.width<locals.lists.length;emit(6,'round-check',bi(active?`width = ${locals.width}`:'Đã gộp tất cả',active?`width = ${locals.width}`:'All lists merged'),active);if(!active)break;
    for(let i=0;i<locals.lists.length-locals.width;i+=2*locals.width){
      locals.i=i;pair=[i,i+locals.width];round++;emit(7,'pair',bi(`Ghép L${pair[0]} + L${pair[1]}`,`Merge L${pair[0]} + L${pair[1]}`));
      locals.left=locals.lists[i];locals.right=locals.lists[i+locals.width];emit(8,'pair-heads',bi('left ↔ right','left ↔ right'));
      locals.dummy=makeDummy();stitched=false;emit(9,'dummy',bi(`Tạo ${name(locals.dummy)}`,`Create ${name(locals.dummy)}`));locals.tail=locals.dummy;emit(10,'tail-init',bi(`tail → ${name(locals.dummy)}`,`tail → ${name(locals.dummy)}`));
      while(true){
        selected=null;const active=Boolean(locals.left&&locals.right);emit(11,'pair-while',bi(active?'So hai node đầu':'Một phía đã hết',active?'Compare both heads':'One side is exhausted'),active);if(!active)break;
        const chooseLeft=locals.left.val<=locals.right.val;emit(12,'compare',bi(`${locals.left.val} ≤ ${locals.right.val}? ${chooseLeft?'✓':'✕'}`,`${locals.left.val} ≤ ${locals.right.val}? ${chooseLeft?'✓':'✕'}`),chooseLeft);
        if(chooseLeft){selected=locals.left.id;link(locals.left,13,'link');locals.left=locals.left.next;emit(14,'advance-left',bi(`left → ${name(locals.left)}`,`left → ${name(locals.left)}`));}
        else{selected=locals.right.id;link(locals.right,16,'link');locals.right=locals.right.next;emit(17,'advance-right',bi(`right → ${name(locals.right)}`,`right → ${name(locals.right)}`));}
        locals.tail=locals.tail.next;emit(18,'tail',bi(`tail → ${name(locals.tail)}`,`tail → ${name(locals.tail)}`));
      }
      stitched=true;link(locals.left||locals.right,19,'stitch');locals.lists[i]=locals.dummy.next;emit(20,'store',bi(`L${i} → kết quả cặp`,`L${i} → merged pair`));
    }
    emit(7,'pair-end',bi('Hết cặp ở vòng này','No more pairs this round'));
    locals.width*=2;emit(21,'width',bi(`width → ${locals.width}`,`width → ${locals.width}`));
  }
  return finish(locals.lists[0],22);
}
module.exports={23:{...base,code,code2,builder:input=>build(input,1),builder2:input=>build(input,2),debugMode:'line-by-line',allowEmptyInput:true,
  codeLabel:bi('Cách 1 · Min-heap','Approach 1 · Min-heap'),code2Label:bi('Cách 2 · Gộp từng cặp','Approach 2 · Pairwise merging'),
  extraParams:[{key:'approach',type:'select',default:1,label:bi('Cách giải','Approach'),options:[{value:1,label:bi('Cách 1 · Min-heap','Approach 1 · Min-heap')},{value:2,label:bi('Cách 2 · Gộp từng cặp','Approach 2 · Pairwise merging')}]}],
  titleVi:bi('Chọn node nhỏ nhất → nối vào đuôi','Take the smallest node → append to the tail'),
  statement:bi('Gộp các list tăng dần bằng cách nối lại next. Giữ nguyên node và giá trị; node giả D không thuộc kết quả.','Merge sorted lists by rewiring next. Preserve nodes and values; dummy D is excluded from the result.'),
  inputLabel:bi('lists · 1,4,5;1,3,4;2,6 hoặc JSON [[1,4,5],[1,3,4],[2,6]]','lists · 1,4,5;1,3,4;2,6 or JSON [[1,4,5],[1,3,4],[2,6]]'),
  approach:[bi('Heap: mỗi list chỉ đưa một node đang chờ vào heap.','Heap: keep at most one waiting node per list.'),bi('Cách 2: gộp từng cặp, rồi gộp các nhóm lớn dần.','Approach 2: merge pairs, then merge progressively larger groups.')],
  complexity:{time:'O(k + N log(k + 1))',space:'O(k) / O(1)',note:bi('N node, k list. Cách 1 / Cách 2; tính cả list rỗng. Debug ≤6 list và ≤16 node. Đầu vào lớn tính đủ; hình xem trước 4 list, 12 node kết quả.','N nodes, k lists. Approach 1 / Approach 2; includes empty lists. Full debug for ≤6 lists and ≤16 nodes. Larger inputs compute fully; pictures preview 4 lists and 12 result nodes.')},
  liveArgs:input=>[parse(input).map(values=>({__viz_type:'linked_list',values}))]
}};
