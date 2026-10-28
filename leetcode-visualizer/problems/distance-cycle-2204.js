"use strict";
const bi=(vi,en)=>({vi,en}),copy=x=>JSON.parse(JSON.stringify(x));
const PROGRAM=[
 ['import','from collections import deque'],
 ['class','class Solution:'],
 ['method','    def distanceToCycle(self, n, edges):'],
 ['graph','        graph = list([] for _ in range(n))'],
 ['degree','        degree = [0] * n'],
 ['edge','        for u, v in edges:'],
 ['link-u','            graph[u].append(v)'],
 ['link-v','            graph[v].append(u)'],
 ['degree-u','            degree[u] += 1'],
 ['degree-v','            degree[v] += 1'],
 ['removed','        removed = [False] * n'],
 ['leaves','        queue = deque(i for i in range(n) if degree[i] == 1)'],
 ['peel-while','        while queue:'],
 ['peel-pop','            u = queue.popleft()'],
 ['prune','            removed[u] = True'],
 ['peel-neighbor','            for v in graph[u]:'],
 ['still-present','                if not removed[v]:'],
 ['decrement','                    degree[v] -= 1'],
 ['new-leaf','                    if degree[v] == 1:'],
 ['leaf-push','                        queue.append(v)'],
 ['cycle','        cycle = tuple(i for i in range(n) if not removed[i])'],
 ['dist','        dist = [-1] * n'],
 ['seed-queue','        queue = deque(cycle)'],
 ['seed-node','        for u in cycle:'],
 ['zero','            dist[u] = 0'],
 ['bfs-while','        while queue:'],
 ['bfs-pop','            u = queue.popleft()'],
 ['bfs-neighbor','            for v in graph[u]:'],
 ['unseen','                if dist[v] == -1:'],
 ['assign','                    dist[v] = dist[u] + 1'],
 ['bfs-push','                    queue.append(v)'],
 ['result','        return dist'],
];
const CODE=PROGRAM.map(([,s])=>s),LINE=Object.fromEntries(PROGRAM.map(([tag],i)=>[tag,i+1]));
function parse(input,params={}){
 const n=Number(params.n??7);let edges;
 try{const s=String(input??'').trim();edges=Array.isArray(input)?copy(input):s.startsWith('[')?JSON.parse(s):s.split(/[,;\n]+/).map(x=>x.trim().split(/\s*-\s*/).map(u=>u.trim()===''?NaN:Number(u)));}catch(_){throw new RangeError('2204: nhập edges dạng [[0,1],...] hoặc 0-1,... / use JSON edges or 0-1,... .');}
 if(!Number.isInteger(n)||n<3||n>16||!Array.isArray(edges)||edges.length!==n||edges.some(e=>!Array.isArray(e)||e.length!==2||e.some(u=>!Number.isInteger(u)||u<0||u>=n)||e[0]===e[1])||new Set(edges.map(([u,v])=>[Math.min(u,v),Math.max(u,v)].join(','))).size!==edges.length)
  throw new RangeError('2204: 3–16 đỉnh, đúng n cạnh khác nhau, không tự nối / 3–16 nodes, exactly n unique non-self edges.');
 const seen=new Set([0]);for(let k=0;k<n;k++)for(const[u,v]of edges){if(seen.has(u))seen.add(v);if(seen.has(v))seen.add(u);}if(seen.size!==n)throw new RangeError('2204: cần đồ thị liên thông có đúng một chu trình / a connected graph with exactly one cycle is required.');
 return{n,edges};
}
function build(input,params={}){
 const{n,edges}=parse(input,params),s={n,edges},steps=[],pruned=[];let phase='build',frame=0,analysis=null;
 function emit(tag,extra={},final=false){const line=LINE[tag],locals=copy(s),active=['peel-pop','prune','peel-neighbor','still-present','decrement','new-leaf','leaf-push','seed-node','zero','bfs-pop','bfs-neighbor','unseen','assign','bfs-push'].includes(tag)?s.u:null;
  const activeEdge=Number.isInteger(s.v)&&['peel-neighbor','still-present','decrement','new-leaf','leaf-push','bfs-neighbor','unseen','assign','bfs-push'].includes(tag)?[s.u,s.v]:null;
  steps.push({arr:[],highlight:[],mark:[],codeLines:[line],source:{line,text:CODE[line-1],scope:'distanceToCycle'},locals,
   vars:Object.entries(locals).map(([name,value])=>({name,value})),title:bi(final?'Kết quả':`Dòng ${line}`,final?'Result':`Line ${line}`),note:bi('',''),final,
   distanceCycle2204View:copy({n,edges,frame:++frame,event:tag,phase,degree:s.degree??[],removed:s.removed??Array(n).fill(false),pruned,cycle:s.cycle??[],dist:s.dist??[],queue:s.queue??[],active,activeEdge,analysis,...extra})});
 }
 s.graph=Array.from({length:n},()=>[]);emit('graph');s.degree=Array(n).fill(0);emit('degree');
 for(const[u,v]of edges){Object.assign(s,{u,v});emit('edge');s.graph[u].push(v);emit('link-u');s.graph[v].push(u);emit('link-v');s.degree[u]++;emit('degree-u');s.degree[v]++;emit('degree-v');}emit('edge');
 s.removed=Array(n).fill(false);emit('removed');phase='peel';s.queue=Array.from({length:n},(_,i)=>i).filter(i=>s.degree[i]===1);emit('leaves');
 while(s.queue.length){emit('peel-while');s.u=s.queue.shift();emit('peel-pop');s.removed[s.u]=true;pruned.push(s.u);emit('prune');
  for(const v of s.graph[s.u]){s.v=v;emit('peel-neighbor');emit('still-present',{condition:{expression:'not removed[v]',result:!s.removed[v]}});if(!s.removed[v]){s.degree[v]--;emit('decrement');emit('new-leaf',{condition:{expression:'degree[v] == 1',result:s.degree[v]===1}});if(s.degree[v]===1){s.queue.push(v);emit('leaf-push');}}}emit('peel-neighbor');
 }emit('peel-while');phase='seed';s.cycle=Array.from({length:n},(_,i)=>i).filter(i=>!s.removed[i]);emit('cycle');
 s.dist=Array(n).fill(-1);emit('dist');s.queue=[...s.cycle];emit('seed-queue');for(const u of s.cycle){s.u=u;emit('seed-node');s.dist[u]=0;emit('zero');}emit('seed-node');
 phase='bfs';while(s.queue.length){emit('bfs-while');s.u=s.queue.shift();emit('bfs-pop');for(const v of s.graph[s.u]){s.v=v;emit('bfs-neighbor');const unseen=s.dist[v]===-1;emit('unseen',{condition:{expression:'dist[v] == -1',result:unseen}});if(unseen){s.dist[v]=s.dist[s.u]+1;emit('assign',{change:{node:v,from:-1,to:s.dist[v],parent:s.u,base:s.dist[s.u]}});s.queue.push(v);emit('bfs-push');}}emit('bfs-neighbor');}emit('bfs-while');
 const paths=Array.from({length:n},(_,start)=>{const path=[start];while(s.dist[path.at(-1)]>0){const u=path.at(-1),next=s.graph[u].find(v=>s.dist[v]===s.dist[u]-1);path.push(next);}return path;});
 analysis={paths};phase='done';emit('result',{},true);return{original:copy(edges),n,answer:s.dist,steps};
}
module.exports={2204:{id:2204,slug:'distance-to-a-cycle-in-undirected-graph',premium:true,difficulty:'hard',title:bi('Distance to a Cycle in Undirected Graph','Distance to a Cycle in Undirected Graph'),titleVi:bi('Khoảng cách tới chu trình','Distance to the cycle'),
 category:{key:'graph',vi:'Đồ thị',en:'Graph'},tags:[{key:'bfs',vi:'BFS',en:'BFS'}],
 statement:bi('Đồ thị vô hướng liên thông có đúng một chu trình. Tính số cạnh ít nhất từ mỗi đỉnh tới một đỉnh trên vòng. Đỉnh thuộc vòng có khoảng cách 0.','The connected undirected graph has exactly one cycle. Find the fewest edges from each node to any cycle node. Cycle nodes have distance 0.'),
 approach:[bi('Gọt các lá: phần không bị gọt chính là chu trình.','Peel the leaves: the remaining nodes form the cycle.'),bi('Gán mọi đỉnh trên vòng bằng 0, rồi BFS trên đồ thị gốc: dist[v] = dist[u] + 1.','Set every cycle node to 0, then BFS on the original graph: dist[v] = dist[u] + 1.')],
 inputKind:'string',inputLabel:bi('edges · ví dụ 0-1,1-2,2-0','edges · e.g. 0-1,1-2,2-0'),defaultInput:'1-2,2-4,4-3,3-1,0-1,5-2,6-5',extraParams:[{key:'n',type:'number',label:bi('n · 3–16 đỉnh','n · 3–16 nodes'),default:7,min:3,max:16}],
 code:CODE,debugMode:'line-by-line',builder:build,liveArgs:(input,params)=>{const p=parse(input,params);return[p.n,p.edges];},
 complexity:{time:'O(n)',space:'O(n)',note:bi('Minh họa 3–16 đỉnh, giữ toàn bộ bước chạy. Code không dùng đệ quy.','Illustration: 3–16 nodes, every executed step retained. The code uses no recursion.')},
}};
