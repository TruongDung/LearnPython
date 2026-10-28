"use strict";
const bi=(vi,en)=>({vi,en}),copy=x=>JSON.parse(JSON.stringify(x));
const PROGRAM=[
 ['import','from collections import deque'],
 ['class','class Solution:'],
 ['method','    def collectTheCoins(self, coins, edges):'],
 ['n','        n = len(coins)'],
 ['graph','        graph = list([] for _ in range(n))'],
 ['degree','        degree = [0] * n'],
 ['edge','        for u, v in edges:'],
 ['link-u','            graph[u].append(v)'],
 ['link-v','            graph[v].append(u)'],
 ['degree-u','            degree[u] += 1'],
 ['degree-v','            degree[v] += 1'],
 ['removed','        removed = [False] * n'],
 ['empty-queue','        queue = deque(i for i in range(n) if degree[i] <= 1 and coins[i] == 0)'],
 ['empty-while','        while queue:'],
 ['empty-pop','            u = queue.popleft()'],
 ['empty-remove','            removed[u] = True'],
 ['empty-neighbor','            for v in graph[u]:'],
 ['empty-alive','                if not removed[v]:'],
 ['empty-degree','                    degree[v] -= 1'],
 ['empty-test','                    if degree[v] == 1 and coins[v] == 0:'],
 ['empty-push','                        queue.append(v)'],
 ['leaf-queue','        queue = deque(i for i in range(n) if not removed[i] and degree[i] <= 1)'],
 ['layer','        for layer in range(2):'],
 ['size','            size = len(queue)'],
 ['batch','            for _ in range(size):'],
 ['leaf-pop','                u = queue.popleft()'],
 ['leaf-remove','                removed[u] = True'],
 ['leaf-neighbor','                for v in graph[u]:'],
 ['leaf-alive','                    if not removed[v]:'],
 ['leaf-degree','                        degree[v] -= 1'],
 ['leaf-test','                        if degree[v] == 1:'],
 ['leaf-push','                            queue.append(v)'],
 ['remaining','        remaining = sum(not removed[u] and not removed[v] for u, v in edges)'],
 ['result','        return remaining * 2'],
];
const CODE=PROGRAM.map(([,s])=>s),LINE=Object.fromEntries(PROGRAM.map(([tag],i)=>[tag,i+1]));
function parse(input,params={}){
 let coins,edges;
 try{const text=String(input??'').trim();coins=Array.isArray(input)?[...input]:text.startsWith('[')?JSON.parse(text):/^[01]+$/.test(text)?[...text].map(Number):text.split(',').map(x=>x.trim()===''?NaN:Number(x));
  const raw=params.edges??'[[0,1],[1,2],[2,3],[3,4],[4,5]]',s=String(raw).trim();edges=Array.isArray(raw)?copy(raw):!s?[]:s.startsWith('[')?JSON.parse(s):s.split(/[,;\n]+/).map(x=>x.trim().split(/\s*-\s*/).map(u=>u.trim()===''?NaN:Number(u)));
 }catch(_){throw new RangeError('2603: coins dạng 1,0,1; edges dạng [[0,1],[1,2]] / use binary coins and JSON edges.');}
 if(!Array.isArray(coins)||coins.length<1||coins.length>16||coins.some(x=>!Number.isInteger(x)||![0,1].includes(x)))throw new RangeError('2603: minh họa 1–16 đỉnh, coins chỉ gồm 0/1 / 1–16 nodes with binary coins.');
 const n=coins.length;
 if(!Array.isArray(edges)||edges.length!==n-1||edges.some(e=>!Array.isArray(e)||e.length!==2||e.some(u=>!Number.isInteger(u)||u<0||u>=n)||e[0]===e[1])||new Set(edges.map(([u,v])=>[Math.min(u,v),Math.max(u,v)].join(','))).size!==edges.length)throw new RangeError('2603: edges cần tạo cây có n−1 cạnh khác nhau / edges must form a tree with n−1 unique edges.');
 const seen=new Set([0]);for(let k=0;k<n;k++)for(const[u,v]of edges){if(seen.has(u))seen.add(v);if(seen.has(v))seen.add(u);}if(seen.size!==n)throw new RangeError('2603: cây phải liên thông / the tree must be connected.');
 return{coins,edges,n};
}
function proof(n,coins,edges,removed){
 const graph=Array.from({length:n},()=>[]);edges.forEach(([u,v])=>{graph[u].push(v);graph[v].push(u);});
 const distances=Array.from({length:n},(_,start)=>{const d=Array(n).fill(-1),queue=[start];d[start]=0;for(let h=0;h<queue.length;h++)for(const v of graph[queue[h]])if(d[v]<0){d[v]=d[queue[h]]+1;queue.push(v);}return d;});
 const coreEdges=edges.filter(([u,v])=>!removed[u]&&!removed[v]);
 let start=coreEdges.length?Math.min(...coreEdges.flat()):0;
 if(!coreEdges.length){let best=Infinity;for(let u=0;u<n;u++){const radius=Math.max(0,...coins.flatMap((coin,v)=>coin?[distances[u][v]]:[]));if(radius<best){best=radius;start=u;}}}
 const walk=[start];function visit(u,parent){for(const v of graph[u])if(v!==parent&&!removed[v]&&!removed[u]){walk.push(v);visit(v,u);walk.push(u);}}visit(start,-1);
 return{start,walk,distances,coreEdges};
}
function build(input,params={}){
 const{coins,edges,n}=parse(input,params),s={coins,edges},steps=[],reason=Array(n).fill(null);
 let phase='build',frame=0,pending=[],batch=[],analysis=null,layersFinished=false;
 function emit(tag,final=false){const line=LINE[tag],locals=copy(s),removed=s.removed??Array(n).fill(false),queue=s.queue??[];
  const active=['empty-pop','empty-remove','empty-neighbor','empty-alive','empty-degree','empty-test','empty-push','leaf-pop','leaf-remove','leaf-neighbor','leaf-alive','leaf-degree','leaf-test','leaf-push'].includes(tag)?s.u:null;
  steps.push({arr:[],highlight:[],mark:[],codeLines:[line],source:{line,text:CODE[line-1],scope:'collectTheCoins'},locals,
   vars:Object.entries(locals).map(([name,value])=>({name,value})),title:bi(final?'Kết quả':`Dòng ${line}`,final?'Result':`Line ${line}`),note:bi('',''),final,
   coins2603View:copy({n,coins,edges,frame:++frame,event:tag,phase,removed,reason,degree:s.degree??[],queue,active,activeEdge:active!==null&&Number.isInteger(s.v)&&['empty-neighbor','empty-alive','empty-degree','empty-test','empty-push','leaf-neighbor','leaf-alive','leaf-degree','leaf-test','leaf-push'].includes(tag)?[active,s.v]:null,
    round:phase==='layers'&&s.layer!==undefined?s.layer+1:null,batch,pending,next:phase==='layers'?queue.slice(pending.length):[],layersFinished,remaining:edges.filter(([u,v])=>!removed[u]&&!removed[v]).length,analysis})});
 }
 s.n=n;emit('n');s.graph=Array.from({length:n},()=>[]);emit('graph');s.degree=Array(n).fill(0);emit('degree');
 for(const[u,v]of edges){Object.assign(s,{u,v});emit('edge');s.graph[u].push(v);emit('link-u');s.graph[v].push(u);emit('link-v');s.degree[u]++;emit('degree-u');s.degree[v]++;emit('degree-v');}emit('edge');
 s.removed=Array(n).fill(false);emit('removed');phase='empty';s.queue=Array.from({length:n},(_,i)=>i).filter(i=>s.degree[i]<=1&&!coins[i]);emit('empty-queue');
 while(s.queue.length){emit('empty-while');s.u=s.queue.shift();emit('empty-pop');s.removed[s.u]=true;reason[s.u]='empty';emit('empty-remove');
  for(const v of s.graph[s.u]){s.v=v;emit('empty-neighbor');emit('empty-alive');if(!s.removed[v]){s.degree[v]--;emit('empty-degree');emit('empty-test');if(s.degree[v]===1&&!coins[v]){s.queue.push(v);emit('empty-push');}}}emit('empty-neighbor');
 }emit('empty-while');
 phase='layers';s.queue=Array.from({length:n},(_,i)=>i).filter(i=>!s.removed[i]&&s.degree[i]<=1);emit('leaf-queue');
 for(let layer=0;layer<2;layer++){s.layer=layer;emit('layer');s.size=s.queue.length;pending=[...s.queue];batch=[...s.queue];emit('size');
  for(let i=0;i<s.size;i++){s._=i;emit('batch');s.u=s.queue.shift();pending.shift();emit('leaf-pop');s.removed[s.u]=true;reason[s.u]=layer;emit('leaf-remove');
   for(const v of s.graph[s.u]){s.v=v;emit('leaf-neighbor');emit('leaf-alive');if(!s.removed[v]){s.degree[v]--;emit('leaf-degree');emit('leaf-test');if(s.degree[v]===1){s.queue.push(v);emit('leaf-push');}}}emit('leaf-neighbor');
  }emit('batch');
 }layersFinished=true;emit('layer');phase='count';s.remaining=edges.filter(([u,v])=>!s.removed[u]&&!s.removed[v]).length;emit('remaining');
 analysis=proof(n,coins,edges,s.removed);phase='done';emit('result',true);return{original:coins,edges,n,answer:s.remaining*2,steps};
}
module.exports={2603:{id:2603,slug:'collect-coins-in-a-tree',difficulty:'hard',title:bi('Collect Coins in a Tree','Collect Coins in a Tree'),titleVi:bi('Nhặt coin trong cây','Collect coins in a tree'),
 category:{key:'graph',vi:'Đồ thị',en:'Graph'},tags:[{key:'tree',vi:'Cây',en:'Tree'},{key:'bfs',vi:'BFS',en:'BFS'}],
 statement:bi('Chọn điểm xuất phát bất kỳ. Mỗi lần đứng tại một đỉnh, có thể nhặt mọi coin cách tối đa 2 cạnh. Tìm số bước đi ít nhất để nhặt hết coin và quay về điểm xuất phát.','Start at any node. Collect every coin within two edges of your current node. Minimize traversed edges while collecting all coins and returning to the start.'),
 approach:[bi('Bỏ lá không coin, rồi bỏ đúng hai lớp lá vì có thể nhặt từ xa 2 cạnh.','Prune coinless leaves, then exactly two leaf layers because collection reaches two edges.'),bi('Mỗi cạnh còn lại phải đi và về: đáp án = 2 × số cạnh.','Traverse each remaining edge out and back: answer = 2 × remaining edges.')],
 inputKind:'string',inputLabel:bi('coins · 0/1, ví dụ 1,0,0,0,0,1','coins · binary values, e.g. 1,0,0,0,0,1'),defaultInput:'1,0,0,0,0,1',
 extraParams:[{key:'edges',type:'string',label:bi('edges · cây có n−1 cạnh','edges · tree with n−1 edges'),default:'[[0,1],[1,2],[2,3],[3,4],[4,5]]'}],code:CODE,debugMode:'line-by-line',builder:build,liveArgs:(input,params)=>{const p=parse(input,params);return[p.coins,p.edges];},
 complexity:{time:'O(n)',space:'O(n)',note:bi('Minh họa 1–16 đỉnh; giữ toàn bộ bước chạy. Hình đường đi và khoảng cách được tính riêng để minh họa.','Illustration: 1–16 nodes, every execution step retained. Route and distance illustrations are computed separately.')},
}};
