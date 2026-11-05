'use strict';
const base2699=require('./hard-graph-2699')[2699],base9030=require('./dijkstra-file-visualization')[9030],{runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en}),copy=v=>v===null?null:JSON.parse(JSON.stringify(v)),stateKey=(phase,d,node)=>`${phase},${d},${node}`;
const code2699=base2699.code.flatMap(line=>line==='        if dijkstra(source)[destination] != target:'?['        verified = dijkstra(source)','        if verified[destination] != target:']:[line]);
const code9030=[...base9030.code.slice(0,base9030.code.indexOf('# Demo graph')),
 'class Solution:','    def shortestPaths(self, n, edges, start):','        graph = [[] for _ in range(n)]','        for u, v, w in edges:','            graph[u].append((v, w))','        answer = dijkstra(n, graph, start)','        return answer'];
function parse9030(input,params={}){const n=Number(params.n??5),start=Number(params.start??0);let edges=input;
 if(typeof input==='string'){try{edges=input.trim().startsWith('[')?JSON.parse(input):input.trim()?input.split(',').map(row=>row.split('-').map(value=>value.trim()?Number(value):NaN)):[];}catch(_){edges=null;}}
 if(!Number.isInteger(n)||n<1||n>10||!Number.isInteger(start)||start<0||start>=n||!Array.isArray(edges)||edges.length>35||edges.some(edge=>!Array.isArray(edge)||edge.length!==3||edge.some(value=>!Number.isInteger(value))||edge[0]<0||edge[0]>=n||edge[1]<0||edge[1]>=n||edge[2]<0||edge[2]>1e6))throw new RangeError('9030: n = 1–10, 0 ≤ start < n, up to 35 directed u-v-w edges, 0 ≤ w ≤ 1000000.');
 return{n,source:start,destination:null,target:null,edges:edges.map(edge=>[...edge])};
}
function build(input,params={},id=2699){
 const parsed=id===2699?base2699.parser(input,params):parse9030(input,params),{n,edges,source,destination,target}=parsed,original=edges.map(edge=>[...edge]),code=id===2699?code2699:code9030;
 const trace=runTrace({code:code.join('\n'),method:id===2699?'modifiedGraphEdges':'shortestPaths',args:id===2699?[n,edges,source,destination,target]:[n,edges,source]});
 let phase='build',active=null,proposal=null,previous=original.map(edge=>[...edge]);const history=[],routes=new Map(),settled=new Set();
 const steps=trace.events.map((record,index)=>{const root=record.outer,x={...root,...record.locals},text=code[record.line-1].trim(),final=index===trace.events.length-1;let event='line',nextPhase=phase;
  if(record.scope==='dijkstra')nextPhase=id===9030?'search':root.dist_to_destination===undefined?'lower':'verify';
  else if(id===2699){if(root.verified!==undefined)nextPhase='verify';else if(text==='for edge in edges:')nextPhase='seal';else if(root.dist_from_source!==undefined&&phase!=='seal'&&phase!=='verify')nextPhase='assign';else if(root.dist_to_destination!==undefined&&phase==='lower')nextPhase='check';}
  if(nextPhase!==phase){phase=nextPhase;active=null;proposal=null;settled.clear();}
  const helper=record.scope==='dijkstra',distance=id===9030?x.dist??root.answer??null:helper?x.distance:phase==='assign'||phase==='seal'?root.dist_from_source??null:phase==='verify'?root.verified??null:root.dist_to_destination??null;
  const heap=helper?(id===9030?x.pq:x.heap):phase==='assign'||phase==='seal'?root.heap:null;
  if(text==='heap = [(0, start)]'||text==='pq = [(0, start)]')routes.set(stateKey(phase,0,x.start),{nodes:[x.start],segments:[]});
  if(text==='heap = [(0, source)]')routes.set(stateKey(phase,0,source),{nodes:[source],segments:[]});
  const pop=text==='current_distance, node = heappop(heap)'||text==='d, u = heapq.heappop(pq)';
  if(pop){const node=id===9030?x.u:x.node,d=id===9030?x.d:x.current_distance;active={node,d,route:copy(routes.get(stateKey(phase,d,node)))};proposal=null;event='pop';}
  if(text==='if current_distance != distance[node]:'||text==='if current_distance != dist_from_source[node]:'||text==='if d > dist[u]:'){
   event=record.branch?'stale':'settle';if(!record.branch)settled.add(active.node);
  }
  if(text==='for nxt, edge_index in graph[node]:'||text==='for v, w in graph[u]:'){
   if(record.branch){const from=active.node,to=id===9030?x.v:x.nxt,edgeIndex=id===9030?original.findIndex(([a,b,w])=>a===from&&b===to&&w===x.w):x.edge_index;
    proposal={from,to,index:edgeIndex,weight:id===9030?x.w:null,needed:null,candidate:null,accepted:null,oldDistance:distance?.[to]??null};event='edge';
   }else proposal=null;
  }
  if(text==='weight = edges[edge_index][2]'){proposal.weight=x.weight;event='weight';}
  if(text==='weight = 1'){proposal.weight=x.weight;event='virtual';}
  if(text==='needed = target - current_distance - dist_to_destination[nxt]'){proposal.needed=x.needed;event='needed';}
  if(text==='weight = min(MAX_WEIGHT, max(1, needed))'){proposal.weight=x.weight;event='choose-weight';}
  if(text==='candidate = current_distance + weight'||text==='new_dist = d + w'){proposal.candidate=id===9030?x.new_dist:x.candidate;event='candidate';}
  if(text==='if candidate < distance[nxt]:'||text==='if candidate < dist_from_source[nxt]:'||text==='if new_dist < dist[v]:'){proposal.accepted=record.branch;event=record.branch?'improve':'reject';}
  if(text==='distance[nxt] = candidate'||text==='dist_from_source[nxt] = candidate'||text==='dist[v] = new_dist'){
   const route={nodes:[...active.route.nodes,proposal.to],segments:[...active.route.segments,{from:proposal.from,to:proposal.to,index:proposal.index,weight:proposal.weight}]};routes.set(stateKey(phase,proposal.candidate,proposal.to),route);event='write';
  }
  if(text.startsWith('heappush(')||text.startsWith('heapq.heappush('))event='push';
  const currentEdges=id===2699?root.edges:original;
  currentEdges.forEach((edge,i)=>{if(edge[2]!==previous[i][2]){history.push({index:i,from:previous[i][2],to:edge[2],phase});event='assign-edge';}});previous=currentEdges.map(edge=>[...edge]);
  let winner=null,reason=null;
  if(final){event='return';if(id===2699){if(trace.answer.length)winner=copy(routes.get(stateKey('verify',root.verified[destination],destination)));else reason=root.dist_to_destination?.[source]==='∞'||root.dist_to_destination?.[source]>target?'lower-too-large':'verify-mismatch';}else{active=null;proposal=null;}}
  const view={id,line:record.line,source:text,scope:record.scope,event,phase,branch:record.branch,n,sourceNode:source,destination,target,originalEdges:original.map(edge=>[...edge]),edges:currentEdges.map(edge=>[...edge]),graph:root.graph?root.graph.map(row=>row.map(edge=>[...edge])):null,
   active:copy(active),proposal:copy(proposal),dist:distance?[...distance]:null,heap:heap?heap.map(entry=>[...entry]):null,settled:[...settled],lower:root.dist_to_destination?[...root.dist_to_destination]:null,forward:root.dist_from_source?[...root.dist_from_source]:null,verified:root.verified?[...root.verified]:null,
   history:history.map(item=>({...item})),winner,reason,answer:final?copy(trace.answer):null,final};
  const names=id===9030?['start','d','u','v','w','new_dist']:['node','current_distance','nxt','edge_index','weight','needed','candidate','target'];
  return{arr:[],codeLines:[record.line],final,title:bi(`Dòng ${record.line} · ${record.scope}`,`Line ${record.line} · ${record.scope}`),note:bi('',''),vars:names.map(name=>({name,value:x[name]??'—'})),shortestGraphView:view};
 });return{original:original.map(edge=>[...edge]),answer:trace.answer,steps};
}
module.exports={2699:{...base2699,visualizationLimits:{maxNodes:24,maxEdges:80,maxEdgeWeight:2000000000},code:code2699,debugMode:'line-by-line',approach:[bi('Tạm coi -1 là 1 để tính cận dưới từ đích. Gán cạnh để bù phần còn thiếu; chạy lại Dijkstra để kiểm tra đúng target.','Use 1 for unknown edges to compute destination lower bounds. Assign weights to fill the remaining gap, then verify the final shortest path equals target.')],builder:(input,params)=>build(input,params,2699)},9030:{...base9030,code:code9030,debugMode:'line-by-line',liveArgs:(input,params)=>{const{n,edges,source}=parse9030(input,params);return[n,edges,source];},builder:(input,params)=>build(input,params,9030)}};
