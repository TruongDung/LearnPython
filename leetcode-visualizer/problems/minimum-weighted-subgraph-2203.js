'use strict';
const base=require('./graph')[2203];
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en=vi)=>({vi,en});
const lines=text=>text.trimEnd().split('\n');
const buildGraph=`        graph = [[] for _ in range(n)]
        reverse = [[] for _ in range(n)]
        for u, v, weight in edges:
            graph[u].append((v, weight))
            reverse[v].append((u, weight))`;
const combine=`        answer = float('inf')
        meeting = -1
        for node in range(n):
            total = d1[node] + d2[node] + dt[node]
            if total < answer:
                answer = total
                meeting = node
        return -1 if answer == float('inf') else answer`;
const helpers={
1:`        def dijkstra(start, adjacency):
            dist = [float('inf')] * n
            dist[start] = 0
            heap = [(0, start)]
            while heap:
                distance, u = heapq.heappop(heap)
                if distance != dist[u]:
                    continue
                for v, weight in adjacency[u]:
                    candidate = distance + weight
                    if candidate < dist[v]:
                        dist[v] = candidate
                        heapq.heappush(heap, (candidate, v))
            return dist`,
2:`        def bellman(start, adjacency):
            dist = [float('inf')] * n
            dist[start] = 0
            for pass_index in range(n - 1):
                changed = False
                for u in range(n):
                    for v, weight in adjacency[u]:
                        candidate = dist[u] + weight
                        if candidate < dist[v]:
                            dist[v] = candidate
                            changed = True
                if not changed:
                    break
            return dist`,
4:`        def scan(start, adjacency):
            dist = [float('inf')] * n
            dist[start] = 0
            used = [False] * n
            for _ in range(n):
                u = -1
                for node in range(n):
                    if not used[node] and (u == -1 or dist[node] < dist[u]):
                        u = node
                if u == -1 or dist[u] == float('inf'):
                    break
                used[u] = True
                for v, weight in adjacency[u]:
                    candidate = dist[u] + weight
                    if candidate < dist[v]:
                        dist[v] = candidate
            return dist`,
5:`        def spfa(start, adjacency):
            dist = [float('inf')] * n
            dist[start] = 0
            q = deque([start])
            in_queue = [False] * n
            in_queue[start] = True
            while q:
                u = q.popleft()
                in_queue[u] = False
                for v, weight in adjacency[u]:
                    candidate = dist[u] + weight
                    if candidate < dist[v]:
                        dist[v] = candidate
                        if not in_queue[v]:
                            q.append(v)
                            in_queue[v] = True
            return dist`};
const codes={};
for(const method of [1,2,4,5]) {
  const name={1:'dijkstra',2:'bellman',4:'scan',5:'spfa'}[method];
  codes[method]=lines(`${method===1?'import heapq\n':method===5?'from collections import deque\n':''}class Solution:
    def minimumWeight(self, n, edges, src1, src2, dest):
${buildGraph}

${helpers[method]}

        d1 = ${name}(src1, graph)
        d2 = ${name}(src2, graph)
        dt = ${name}(dest, reverse)
${combine}`);
}
codes[3]=lines(`class Solution:
    def minimumWeight(self, n, edges, src1, src2, dest):
        dist = [[float('inf')] * n for _ in range(n)]
        for node in range(n):
            dist[node][node] = 0
        for u, v, weight in edges:
            dist[u][v] = min(dist[u][v], weight)
        for k in range(n):
            for u in range(n):
                for v in range(n):
                    candidate = dist[u][k] + dist[k][v]
                    if candidate < dist[u][v]:
                        dist[u][v] = candidate
        d1 = dist[src1]
        d2 = dist[src2]
        dt = [dist[node][dest] for node in range(n)]
${combine}`);
const names={1:bi('Ba lượt Dijkstra','Three Dijkstra runs'),2:bi('Bellman–Ford'),3:bi('Floyd–Warshall'),4:bi('Dijkstra quét','Array-scan Dijkstra'),5:bi('SPFA')};
function parseInput(input,params={},method=Number(params.approach??1)) {
  const n=Number(params.n??4),src1=Number(params.src1??0),src2=Number(params.src2??1),dest=Number(params.dest??3);
  if(![1,2,3,4,5].includes(method))throw new RangeError('2203: cách giải / approach 1..5.');
  if(!Number.isInteger(n)||n<3||n>100000||![src1,src2,dest].every(id=>Number.isInteger(id)&&id>=0&&id<n)||new Set([src1,src2,dest]).size!==3)throw new RangeError('2203: 3 ≤ n ≤ 100000; src1, src2, dest khác nhau và thuộc 0..n−1 / Three distinct endpoints in 0..n−1.');
  let edges=input;
  if(typeof input==='string') {
    const text=input.trim();
    if(text.startsWith('[')){try{edges=JSON.parse(text);}catch{throw new RangeError('2203: JSON cạnh không hợp lệ / Invalid edge JSON.');}}
    else edges=text?text.split(';').map(edge=>edge.trim().split(',').map(value=>value.trim()?Number(value):NaN)):[];
  }
  if(!Array.isArray(edges)||edges.length>100000||!Array.from(edges).every(edge=>Array.isArray(edge)&&edge.length===3&&Array.from(edge).every(Number.isInteger)&&edge[0]>=0&&edge[0]<n&&edge[1]>=0&&edge[1]<n&&edge[0]!==edge[1]&&edge[2]>=1&&edge[2]<=100000))throw new RangeError('2203: tối đa 100000 cạnh u,v,w; u ≠ v, trọng số nguyên 1..100000 / Up to 100000 directed edges with integer weights 1..100000.');
  if(method!==1&&(n>40||edges.length>1600))throw new RangeError('2203: cách 2–5 minh họa n ≤ 40, E ≤ 1600; dùng cách 1 cho đồ thị lớn / Use approach 1 for large graphs.');
  return {n,src1,src2,dest,edges:edges.map(edge=>[...edge]),method};
}
function build(input,params={},method=Number(params.approach??1)) {
  const {n,src1,src2,dest,edges}=parseInput(input,params,method);
  const result=runTrace({profile:'subgraph2203',code:codes[method].join('\n'),method:'minimumWeight',approach:method,args:[n,edges,src1,src2,dest],maxEvents:1600});
  const labels={build:bi('Dựng đồ thị','Build graph'),init:bi('Khởi tạo','Initialize'),pop:bi('Lấy trạng thái tiếp theo','Take next state'),stale:bi('Bỏ bản ghi cũ','Skip stale entry'),inspect:bi('Thử cạnh','Inspect edge'),calculate:bi('Tính đường mới','Calculate candidate'),compare:bi('So sánh khoảng cách','Compare distances'),update:bi('Cập nhật khoảng cách','Update distance'),push:bi('Thêm trạng thái','Add state'),scan:bi('Chọn nút nhỏ nhất','Select minimum node'),pass:bi('Lượt relax','Relaxation pass'),floyd:bi('Đi qua k','Via k'),combine:bi('Thử điểm hợp nhất','Try meeting node'),done:bi('Đồ thị con tối ưu','Minimum subgraph')};
  const steps=result.events.map(view=>{
    const legacy={...view,phase:view.phase==='floyd'?'floyd-relax':view.phase,approach:method,approachName:names[method],strategy:bi('Ba khoảng cách, một điểm hợp nhất.',method===3?'Floyd–Warshall: allow each node as an intermediate, then read the three required distances.':'Three distances, one meeting point.'),
      distances:{src1:view.rows.map(r=>({node:r.node,value:r.d1??'—'})),src2:view.rows.map(r=>({node:r.node,value:r.d2??'—'})),dest:view.rows.map(r=>({node:r.node,value:r.dt??'—'}))},combineRows:view.rows.map(r=>({...r,d3:r.dt,best:r.node===view.bestMeeting})),heap:view.heap.map(([distance,node],index)=>({distance,node,index})),pathEdges:view.routes.flat().map(id=>edges[id].slice(0,2)),matrixCheck:view.matrix};
    return {arr:[],highlight:[],mark:[],codeBlock:method,codeLines:[view.source.line],final:view.final,title:labels[view.phase]||bi(view.source.scope),note:bi(''),vars:Object.entries(view.locals).map(([name,value])=>({name,value})),
      subgraph2203View:{...view,method,methodName:names[method],trace:result.trace},multiDijkstra2203View:legacy,
      graph:{nodes:view.nodes.map(id=>({id,label:String(id)})),edges:view.edges.map(([u,v,w])=>({u,v,w})),hlNodes:view.currentNode===null?[]:[view.currentNode],hlEdges:[],visitedNodes:view.settled,annotations:{[src1]:'src1',[src2]:'src2',[dest]:'dest'}}};
  });
  return {original:edges,edges,n,src1,src2,dest,answer:result.answer,steps};
}
const lesson={...base,builder:build,parseInput,allowEmptyInput:true,defaultInput:'0,2,2;1,2,3;2,3,4;0,3,10;1,3,9',
  statement:bi('Hai nguồn cùng tới dest. Chọn đồ thị con có tổng trọng số nhỏ nhất; cạnh dùng chung chỉ tính một lần. Không thể nối thì trả −1.','Connect both sources to dest with minimum total edge weight. Count shared edges once; return −1 if impossible.'),
  inputLabel:bi('Cạnh u,v,w; … hoặc JSON [[u,v,w],…]','Edges u,v,w; … or JSON [[u,v,w],…]'),
  approach:[bi('Tính d1[x], d2[x], dt[x]. Thử mọi điểm x: min(d1[x] + d2[x] + dt[x]).','Compute d1[x], d2[x], dt[x]. Try every meeting point x: min(d1[x] + d2[x] + dt[x]).')],
  extraParams:base.extraParams.map(param=>param.key==='n'?{...param,default:4,max:100000}:param.key==='dest'?{...param,default:3}:param),
  liveArgs:(input,params)=>{const {n,edges,src1,src2,dest}=parseInput(input,params);return[n,edges,src1,src2,dest];},
};
for(let method=1;method<=5;method++){lesson[method===1?'code':`code${method}`]=codes[method];if(method>1)lesson[`builder${method}`]=(input,params)=>build(input,params,method);}
module.exports={2203:lesson};
