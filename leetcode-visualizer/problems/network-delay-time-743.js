'use strict';

const base=require('./graph')[743];
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en=vi)=>({vi,en});

function parseInput(input,params={}) {
  const n=Number(params.n??4),k=Number(params.k??2);
  if(!Number.isInteger(n)||n<1||n>100||!Number.isInteger(k)||k<1||k>n)throw new RangeError('743: 1 ≤ k ≤ n ≤ 100.');
  let times=input;
  if(typeof input==='string') {
    const text=input.trim();
    if(text.startsWith('[')) {try{times=JSON.parse(text);}catch{throw new RangeError('743: JSON cạnh không hợp lệ / Invalid edge JSON.');}}
    else times=text?text.split(',').map(edge=>edge.trim().split('-').map(value=>value.trim()?Number(value.trim()):NaN)):[];
  }
  if(!Array.isArray(times)||times.length>6000||!Array.from(times).every(edge=>Array.isArray(edge)&&edge.length===3&&Array.from(edge).every(Number.isInteger)&&edge[0]>=1&&edge[0]<=n&&edge[1]>=1&&edge[1]<=n&&edge[0]!==edge[1]&&edge[2]>=0&&edge[2]<=100))throw new RangeError('743: tối đa 6000 cạnh u-v-w; u,v thuộc 1..n, u ≠ v, w nguyên 0..100 / Up to 6000 directed edges; integer weights 0..100.');
  if(new Set(times.map(([u,v])=>`${u},${v}`)).size!==times.length)throw new RangeError('743: mỗi cặp u→v chỉ có một cạnh / Each directed pair must be unique.');
  return {times:times.map(edge=>[...edge]),n,k};
}

function title(view) {
  const x=view.locals,s=view.source.text.trim();
  if(s==='graph = defaultdict(list)')return bi('Tạo danh sách kề','Create the adjacency list');
  if(s==='for u, v, w in times:')return view.activeEdge?bi(`Đọc cạnh ${x.u} → ${x.v}`,`Read edge ${x.u} → ${x.v}`):bi('Đã dựng mạng','Graph ready');
  if(s==='graph[u].append((v, w))')return bi(`graph[${x.u}].append((${x.v}, ${x.w}))`);
  if(s.startsWith('dist ='))return bi('Khởi tạo khoảng cách ∞','Initialize every distance to ∞');
  if(s==='dist[k] = 0')return bi(`dist[${view.k}] = 0`);
  if(s==='minHeap = [(0, k)]')return bi('Đưa nguồn vào min-heap','Push the source into the min-heap');
  if(s==='while minHeap:')return view.heapSize?bi('Heap chưa rỗng','The heap is not empty'):bi('Heap đã rỗng','The heap is empty');
  if(s.startsWith('time, node ='))return bi(`heappop → (${x.time}, ${x.node})`);
  if(s==='continue')return bi('Bỏ bản ghi cũ','Skip the stale entry');
  if(s.startsWith('answer ='))return bi(`ans = ${x.answer}`);
  return bi(`Dòng ${view.source.line} · ${view.phase}`,`Line ${view.source.line} · ${view.phase}`);
}

function build(input,params={}) {
  const {times,n,k}=parseInput(input,params);
  const result=runTrace({profile:'network743',code:base.code.join('\n'),method:'networkDelayTime',args:[times,n,k],maxEvents:1600});
  let previous=new Map();
  const steps=result.events.map(view=>{
    const changed=view.distances.filter(item=>previous.has(item.node)&&previous.get(item.node)!==item.value)
      .map(item=>({node:item.node,before:previous.get(item.node),after:item.value}));
    previous=new Map(view.distances.map(item=>[item.node,item.value]));
    const legacy={phase:view.phase,source:k,distances:view.distances.map(item=>({...item,value:String(item.value),isSource:item.node===k,isCurrent:!view.final&&item.node===view.currentNode,isFinalized:view.settled.includes(item.node),isCandidate:item.node===view.activeEdge?.v})),
      heap:view.heap.map(([distance,node],index)=>({distance,node,index})),finalized:view.settled,currentNode:view.final?null:view.currentNode,
      activeEdge:view.activeEdge,candidate:view.candidate,oldDistance:view.oldDistance,improves:view.improves,answer:view.answer};
    return {arr:[],highlight:[],mark:[],codeBlock:1,codeLines:[view.source.line],final:view.final,title:title(view),note:bi(''),
      vars:Object.entries(view.locals).map(([name,value])=>({name,value})),network743View:{...view,changed,trace:result.trace},networkDelayView:legacy,
      graph:{nodes:view.nodes.map(id=>({id,label:String(id),dist:String(view.distances[id-1].value)})),edges:view.edges.map(([u,v,w])=>({u,v,w})),
        hlNodes:view.currentNode?[view.currentNode]:[],hlEdges:view.activeEdge?[[view.activeEdge.u,view.activeEdge.v]]:[],visitedNodes:view.settled,annotations:{[k]:'source'},dimUnfocused:true}};
  });
  return {original:times,edges:times,n,k,answer:result.answer,steps};
}

module.exports={743:{...base,builder:build,parseInput,allowEmptyInput:true,
  statement:bi('Tín hiệu bắt đầu ở k. Cạnh u → v tốn w thời gian. Tìm lúc mọi nút nhận được tín hiệu; có nút không tới được thì trả −1.','Start the signal at k. Edge u → v takes w time. Find when every node has received it; return −1 if any node is unreachable.'),
  inputLabel:bi('times · u-v-w, cách bởi dấu phẩy; hoặc JSON [[u,v,w],…]','times · comma-separated u-v-w, or JSON [[u,v,w],…]'),
  approach:[bi('Heap lấy thời gian nhỏ nhất. Thử newTime = time + weight; chỉ giữ đường tốt hơn.','Pop the smallest time. Try newTime = time + weight; keep improvements.')],
  extraParams:[{key:'n',label:bi('n · số nút','n · nodes'),default:4,min:1,max:100},{key:'k',label:bi('k · nguồn','k · source'),default:2,min:1,max:100}],
  liveArgs:(input,params)=>{const {times,n,k}=parseInput(input,params);return[times,n,k];},
}};
