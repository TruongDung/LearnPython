const base=require('./graph')[1786];
const bi=(vi,en)=>({vi,en});
const copy=value=>value===Infinity?'∞':Array.isArray(value)?value.map(copy):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,copy(v)])):value;
const CODE=[
 'import heapq','',
 'class Solution:',
 '    def countRestrictedPaths(self, n, edges):',
 '        MOD = 10**9 + 7',
 '        graph = list([] for _ in range(n + 1))',
 '        for u, v, weight in edges:',
 '            graph[u].append((v, weight))',
 '            graph[v].append((u, weight))','',
 "        dist = [float('inf')] * (n + 1)",
 '        dist[n] = 0',
 '        heap = [(0, n)]',
 '        while heap:',
 '            distance, u = heapq.heappop(heap)',
 '            if distance != dist[u]:',
 '                continue',
 '            for v, weight in graph[u]:',
 '                candidate = distance + weight',
 '                if candidate < dist[v]:',
 '                    dist[v] = candidate',
 '                    heapq.heappush(heap, (candidate, v))','',
 '        order = sorted(range(1, n + 1), key=lambda node: dist[node])',
 '        ways = [0] * (n + 1)',
 '        ways[n] = 1',
 '        for u in order:',
 '            for v, _ in graph[u]:',
 '                if dist[v] < dist[u]:',
 '                    ways[u] = (ways[u] + ways[v]) % MOD',
 '        return ways[1]',
];
function parse1786(input,params={}){
 const n=Number(params.n??5);let edges;
 try{
  if(Array.isArray(input))edges=input;
  else{const text=String(input??'').trim();if(!text)throw new Error('empty');edges=text.startsWith('[')?JSON.parse(text):text.split(';').map(row=>row.trim().split(',').map(value=>/^\d+$/.test(value.trim())?Number(value.trim()):NaN));}
 }catch(_error){throw new RangeError('1786: edges dạng u,v,w;... hoặc [[u,v,w],...] / enter weighted edges.');}
 const pairs=new Set();
 if(!Number.isInteger(n)||n<2||n>9||!Array.isArray(edges)||edges.length<1||edges.length>18||edges.some(edge=>{
  if(!Array.isArray(edge)||edge.length!==3||!edge.every(Number.isInteger))return true;
  const [u,v,w]=edge,key=[Math.min(u,v),Math.max(u,v)].join(',');
  if(u<1||u>n||v<1||v>n||u===v||w<1||w>100000||pairs.has(key))return true;
  pairs.add(key);return false;
 }))throw new RangeError('1786: n từ 2–9; 1–18 cạnh khác nhau, trọng số 1–100000 / 2–9 nodes, 1–18 distinct undirected edges, weights 1–100000.');
 return{n,edges:edges.map(edge=>[...edge])};
}
const less1786=(a,b)=>a[0]<b[0]||a[0]===b[0]&&a[1]<b[1];
function siftDown1786(heap,start,pos){
 const value=heap[pos];while(pos>start){const parent=(pos-1)>>1;if(!less1786(value,heap[parent]))break;heap[pos]=heap[parent];pos=parent;}heap[pos]=value;
}
function push1786(heap,value){heap.push(value);siftDown1786(heap,0,heap.length-1);}
function pop1786(heap){
 const last=heap.pop();if(!heap.length)return last;
 const first=heap[0];heap[0]=last;let pos=0,child=1;
 while(child<heap.length){const right=child+1;if(right<heap.length&&!less1786(heap[child],heap[right]))child=right;heap[pos]=heap[child];pos=child;child=2*pos+1;}
 heap[pos]=last;siftDown1786(heap,0,pos);return first;
}
function buildRestrictedPaths1786(input,params={}){
 const {n,edges}=parse1786(input,params),MOD=1000000007,graph=Array.from({length:n+1},()=>[]),dist=Array(n+1).fill(Infinity),ways=Array(n+1).fill(0),heap=[],settled=new Set(),steps=[],locals={n,edges};
 let phase='build',order=[],frame=0,witnessPaths=[];
 const titles={mod:bi('Modulo khi đếm đường','Path-count modulus'),build:bi('Tạo danh sách kề','Create adjacency lists'),'build-edge':bi('Đọc cạnh vô hướng','Read an undirected edge'),
  'build-forward':bi('Lưu chiều đi →','Store forward edge →'),'build-reverse':bi('Lưu chiều ngược ←','Store reverse edge ←'),'build-done':bi('Đã dựng đồ thị','Graph ready'),
  'init-dist':bi('Chưa biết khoảng cách','Distances unknown'),'seed-target':bi('Đích có khoảng cách 0','Target distance is zero'),'heap-seed':bi('Đưa đích vào heap','Seed the heap'),
  'heap-loop':bi('Heap còn phần tử?','Heap nonempty?'),pop:bi('Lấy cặp nhỏ nhất khỏi heap','Pop the smallest pair'),settle:bi('Cặp hiện tại còn đúng','Current distance is valid'),
  stale:bi('Cặp đã cũ ×','Stale heap entry ×'),'skip-stale':bi('Bỏ qua cặp cũ','Skip stale entry'),'dijkstra-edge':bi('Thử cạnh kề','Try a neighboring edge'),
  candidate:bi('Tính khoảng cách đề xuất','Compute candidate distance'),'relax-test':bi('Có ngắn hơn không?','Is it shorter?'),'relax-skip':bi('Giữ khoảng cách cũ','Keep current distance'),
  'relax-improve':bi('Cập nhật dist ↓','Improve distance ↓'),'heap-push':bi('Đưa khoảng cách mới vào heap','Push the improved distance'),'dijkstra-edge-done':bi('Đã thử hết cạnh kề','Neighbors checked'),
  'dijkstra-done':bi('Khoảng cách đã xong','Shortest distances ready'),orient:bi('Sắp theo dist từ nhỏ tới lớn','Sort by increasing distance'),
  'init-ways':bi('Bắt đầu đếm đường','Initialize path counts'),'dp-seed':bi('Đứng sẵn ở đích: một cách','One way to stay at the target'),
  'dp-node':bi('Đếm đường từ nút u','Count paths from u'),'dp-edge':bi('Xét nút kề v','Inspect neighbor v'),'dp-test':bi('dist có giảm nghiêm ngặt?','Does distance strictly decrease?'),
  'dp-skip':bi('Không xuống dốc ×','Not strictly downhill ×'),'dp-update':bi('Cộng ways của nút gần đích hơn','Add paths through the nearer node'),
  'dp-edge-done':bi('Đã xét hết nút kề','Neighbors counted'),'dp-done':bi('Đã đếm xong các nút','All nodes counted'),result:bi('Số đường từ 1 tới n','Paths from 1 to n')};
 function emit(line,event,options={}){
  frame++;
  const active=options.activeEdge??null,restrictedEdges=phase==='dp'||phase==='orient'||phase==='done'?edges.flatMap(([u,v,w],index)=>dist[u]===dist[v]?[]:[{index,from:dist[u]>dist[v]?u:v,to:dist[u]>dist[v]?v:u,w}]):[];
  const view={n,phase,event,frame,source:{line,text:CODE[line-1],scope:'countRestrictedPaths',timing:'after'},locals:copy(locals),
   edges:edges.map(([u,v,w],index)=>({u,v,w,index})),distances:Array.from({length:n},(_,i)=>({node:i+1,value:locals.dist?copy(dist[i+1]):'—',settled:settled.has(i+1)})),
   ways:Array.from({length:n},(_,i)=>({node:i+1,value:locals.ways?ways[i+1]:'—'})),heap:heap.map(([distance,node],index)=>({distance,node,index})),
   order:[...order],restrictedEdges,currentNode:locals.u??null,activeEdge:active,condition:options.condition??null,change:options.change??null,
   candidate:options.candidate??null,oldDistance:options.oldDistance===Infinity?'∞':options.oldDistance??null,improves:options.improves??null,
   dpSource:options.dpSource??null,dpTarget:options.dpTarget??null,beforeWays:options.beforeWays??null,contribution:options.contribution??null,
   answer:ways[1],settledCount:settled.size,finiteCount:dist.slice(1).filter(Number.isFinite).length,witnessPaths:copy(witnessPaths)};
  const title=titles[event];steps.push({title:bi(`Dòng ${line} · ${title.vi}`,`Line ${line} · ${title.en}`),note:bi('',''),arr:[],highlight:[],mark:[],final:event==='result',codeLines:[line],debugLine:line,
   vars:Object.entries(view.locals).map(([name,value])=>({name,value:typeof value==='object'?JSON.stringify(value):value})),restricted1786View:view});
 }
 locals.MOD=MOD;emit(5,'mod');locals.graph=graph;emit(6,'build');
 for(const [u,v,weight] of edges){
  Object.assign(locals,{u,v,weight});emit(7,'build-edge',{activeEdge:{u,v,w:weight}});
  graph[u].push([v,weight]);emit(8,'build-forward',{activeEdge:{u,v,w:weight}});
  graph[v].push([u,weight]);emit(9,'build-reverse',{activeEdge:{u:v,v:u,w:weight}});
 }
 emit(7,'build-done');phase='dijkstra';locals.dist=dist;emit(11,'init-dist');dist[n]=0;emit(12,'seed-target');
 heap.push([0,n]);locals.heap=heap;emit(13,'heap-seed');
 while(true){
  const nonempty=heap.length>0;emit(14,nonempty?'heap-loop':'dijkstra-done',{condition:{expression:'bool(heap)',result:nonempty}});if(!nonempty)break;
  const [distance,u]=pop1786(heap);Object.assign(locals,{distance,u});emit(15,'pop',{change:{kind:'pop',distance,node:u}});
  const stale=distance!==dist[u];if(!stale)settled.add(u);
  emit(16,stale?'stale':'settle',{condition:{expression:'distance != dist[u]',result:stale}});
  if(stale){emit(17,'skip-stale');continue;}
  for(const [v,weight] of graph[u]){
   Object.assign(locals,{v,weight});const activeEdge={u,v,w:weight};emit(18,'dijkstra-edge',{activeEdge});
   const candidate=distance+weight;locals.candidate=candidate;emit(19,'candidate',{activeEdge,candidate});
   const oldDistance=dist[v],improves=candidate<oldDistance;
   emit(20,improves?'relax-test':'relax-skip',{activeEdge,candidate,oldDistance,improves,condition:{expression:'candidate < dist[v]',result:improves}});
   if(improves){
    dist[v]=candidate;emit(21,'relax-improve',{activeEdge,candidate,oldDistance,improves:true,change:{kind:'dist',node:v,from:copy(oldDistance),to:candidate}});
    push1786(heap,[candidate,v]);emit(22,'heap-push',{activeEdge,candidate,change:{kind:'push',distance:candidate,node:v}});
   }
  }
  emit(18,'dijkstra-edge-done');
 }
 order=Array.from({length:n},(_,i)=>i+1).sort((a,b)=>dist[a]===dist[b]?a-b:dist[a]-dist[b]);locals.order=order;phase='orient';emit(24,'orient');
 locals.ways=ways;phase='dp';emit(25,'init-ways');ways[n]=1;emit(26,'dp-seed',{change:{kind:'ways',node:n,from:0,to:1}});
 for(const u of order){
  locals.u=u;emit(27,'dp-node');
  for(const [v,weight] of graph[u]){
   locals.v=v;locals._=weight;const activeEdge={u,v,w:weight};emit(28,'dp-edge',{activeEdge});
   const pass=dist[v]<dist[u];emit(29,pass?'dp-test':'dp-skip',{activeEdge,dpSource:v,dpTarget:u,condition:{expression:'dist[v] < dist[u]',result:pass}});
   if(pass){const before=ways[u],contribution=ways[v];ways[u]=(before+contribution)%MOD;emit(30,'dp-update',{activeEdge,dpSource:v,dpTarget:u,beforeWays:before,contribution,change:{kind:'ways',node:u,from:before,to:ways[u]}});}
  }
  emit(28,'dp-edge-done');
 }
 emit(27,'dp-done');
 function proofs(node,path){if(node===n){witnessPaths.push([...path]);return;}for(const [next] of graph[node])if(dist[next]<dist[node])proofs(next,[...path,next]);}
 proofs(1,[1]);phase='done';emit(31,'result');return{original:copy(edges),edges:copy(edges),n,answer:ways[1],steps};
}
module.exports={1786:{...base,code:CODE,debugMode:'line-by-line',builder:buildRestrictedPaths1786,
 approach:[bi('Dijkstra từ n: tính khoảng cách tới đích.','Dijkstra from n: compute distances to the target.'),bi('Chỉ đi theo dist giảm. ways[u] cộng ways của các nút kề gần đích hơn.','Only follow strictly decreasing distances. Sum ways from nearer neighbors.')],
 liveArgs:(input,params)=>{const {n,edges}=parse1786(input,params);return[n,edges];}}};
