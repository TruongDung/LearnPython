'use strict';
const base=require('./hard-graph-visualizations')[1928];
const {runTrace}=require('./wasm-picture-trace');
const dpMethod=require('./minimum-cost-time-dp-1928');
const bi=(vi,en)=>({vi,en});
const copy=value=>JSON.parse(JSON.stringify(value));
const key=(cost,time,node)=>`${cost},${time},${node}`;
const code=`from heapq import heappush, heappop
from typing import List

class Solution:
    def minCost(
        self,
        maxTime: int,
        edges: List[List[int]],
        passingFees: List[int]
    ) -> int:

        n = len(passingFees)

        graph = [[] for _ in range(n)]

        for u, v, t in edges:
            graph[u].append((v, t))
            graph[v].append((u, t))

        dist = [[float('inf')] * (maxTime + 1)
                for _ in range(n)]

        dist[0][0] = passingFees[0]

        heap = [(passingFees[0], 0, 0)]

        while heap:
            cost, time, node = heappop(heap)

            if cost != dist[node][time]:
                continue

            if node == n - 1:
                return cost

            for nei, travel_time in graph[node]:

                new_time = time + travel_time

                if new_time > maxTime:
                    continue

                new_cost = cost + passingFees[nei]

                if new_cost < dist[nei][new_time]:
                    dist[nei][new_time] = new_cost
                    heappush(
                        heap,
                        (new_cost, new_time, nei)
                    )

        return -1`.split('\n');
function builder(input,params={}) {
  if(Number(params.approach)===2)return dpMethod.builder(input,params);
  if(Number(params.approach)===3)return dpMethod.builder3(input,params);
  const parsed=base.parseMinCost1928Input(input,params),{maxTime,edges,passingFees}=parsed,n=passingFees.length;
  const trace=runTrace({code:code.join('\n'),method:'minCost',args:[maxTime,edges,passingFees],maxEvents:1600});
  const routes=new Map(),processed=[],pops=[];
  let active=null,proposal=null,road=null,reason=null,previousHeap=null,previousDist=null;
  function recoveredPath(x,cost,time,node) {
    const known=routes.get(key(cost,time,node));if(known)return [...known.nodes];
    if(x.dist?.[node]?.[time]!==cost)return null;
    const path=[node];let remaining=time,current=node,currentCost=cost;
    while(current!==0||remaining!==0) {
      const edge=edges.find(([u,v,t])=>{
        const previous=u===current?v:v===current?u:null;
        return previous!==null&&remaining>=t&&typeof x.dist[previous][remaining-t]==='number'
          &&x.dist[previous][remaining-t]+passingFees[current]===currentCost;
      });
      if(!edge)return null;
      remaining-=edge[2];current=edge[0]===current?edge[1]:edge[0];currentCost=x.dist[current][remaining];path.push(current);
    }
    return path.reverse();
  }
  const steps=trace.events.map((record,index)=>{
    const x=record.locals,line=record.line,source=code[line-1].trim(),final=index===trace.events.length-1;
    let event='step',changed=null;
    if(source==='n = len(passingFees)')event='cities';
    if(source==='graph = [[] for _ in range(n)]')event='graph';
    if(source==='for u, v, t in edges:'){event='road';road=record.branch?{from:x.u,to:x.v,travel:x.t}:null;}
    if(source==='graph[u].append((v, t))'||source==='graph[v].append((u, t))'){
      event='arc';road={from:source.startsWith('graph[u]')?x.u:x.v,to:source.startsWith('graph[u]')?x.v:x.u,travel:x.t};
    }
    if(x.dist&&!previousDist){event='dist-init';road=null;}
    if(source==='dist[0][0] = passingFees[0]'){
      event='distance-update';changed={node:0,time:0,before:'∞',after:passingFees[0]};
      routes.set(key(passingFees[0],0,0),{nodes:[0],time:0,cost:passingFees[0]});
    }
    if(source==='heap = [(passingFees[0], 0, 0)]')event='start';
    if(source==='while heap:')event='heap-check';
    if(source==='cost, time, node = heappop(heap)'){
      event='pop';proposal=road=null;reason=null;
      active={node:x.node,time:x.time,cost:x.cost,path:recoveredPath(x,x.cost,x.time,x.node)};
      pops.push({node:x.node,time:x.time,cost:x.cost});
    }
    if(source==='if cost != dist[node][time]:'){
      event=record.branch?'stale':'settle';reason=record.branch?'stale':null;
      if(!record.branch)processed.push({node:x.node,time:x.time,cost:x.cost});
    }
    if(source==='if node == n - 1:')event='destination-check';
    if(source==='for nei, travel_time in graph[node]:'){
      event='neighbor';reason=null;
      proposal=record.branch?{from:x.node,to:x.nei,travel:x.travel_time,arrival:null,cost:null,oldCost:null,decision:null}:null;
    }
    if(source==='new_time = time + travel_time'){event='arrival';proposal.arrival=x.new_time;}
    if(source==='if new_time > maxTime:'){
      event=record.branch?'reject':'allowed';reason=record.branch?'overtime':null;
      if(record.branch)proposal.decision=false;
    }
    if(source==='new_cost = cost + passingFees[nei]'){event='fee';proposal.cost=x.new_cost;}
    if(source==='if new_cost < dist[nei][new_time]:'){
      event=record.branch?'better':'reject';reason=record.branch?null:'not-cheaper';
      proposal.oldCost=x.dist[x.nei][x.new_time];proposal.decision=record.branch;
    }
    if(source==='dist[nei][new_time] = new_cost'){
      event='distance-update';changed={node:x.nei,time:x.new_time,before:proposal.oldCost,after:x.new_cost};
      routes.set(key(x.new_cost,x.new_time,x.nei),{nodes:[...active.path,x.nei],time:x.new_time,cost:x.new_cost});
    }
    // A multiline heappush emits several line events; only a real heap mutation is a push.
    if(previousHeap!==null&&x.heap&&x.heap.length>previousHeap.length)event='push';
    if(source==='continue')event=reason==='stale'?'stale':'reject';
    if(final){
      event=trace.answer===-1?'unreachable':'return';proposal=road=null;reason=null;
      if(trace.trace.truncated&&x.node!==undefined)active={node:x.node,time:x.time,cost:x.cost,path:recoveredPath(x,x.cost,x.time,x.node)};
    }
    const heap=x.heap??null,sorted=heap?[...heap].sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]):null;
    const names=final?['node','cost','time']:active?['node','cost','time','nei','new_time','new_cost']:['n','maxTime'];
    const view={method:1,source:{line,text:source,timing:'after'},scope:record.scope,locals:x,outer:record.outer,frames:record.frames,
      branch:record.branch,returning:record.returning,returned:record.returned,event,reason,n,maxTime,edges,passingFees,
      graph:x.graph??null,dist:x.dist??null,heap,
      frontier:sorted?.map(([cost,time,node])=>({cost,time,node,path:recoveredPath(x,cost,time,node)}))??null,
      active:copy(active),proposal:copy(proposal),road:copy(road),changed,processed:copy(processed),pops:copy(pops),
      winner:final&&trace.answer!==-1?copy(active):null,done:final,answer:final?trace.answer:null,trace:trace.trace};
    previousHeap=heap;previousDist=x.dist??null;
    return {arr:[],codeBlock:1,codeLines:[line],final,title:bi(`L${line} · ${event}`,`L${line} · ${event}`),note:bi('',''),
      vars:names.map(name=>({name,value:Object.hasOwn(x,name)?x[name]:'—'})),costTime1928View:view};
  });
  return {original:edges,answer:trace.answer,steps};
}
module.exports={1928:{...base,code,builder,debugMode:'line-by-line',
  codeLabel:bi('Cách 1 · Heap + Dijkstra','Approach 1 · Heap + Dijkstra'),
  code2:dpMethod.code,code2Label:bi('Cách 2 · DP theo thời gian','Approach 2 · Time-based DP'),builder2:dpMethod.builder,
  code3:dpMethod.forwardCode,code3Label:bi('Cách 3 · DP đẩy tới new_time','Approach 3 · Forward time DP'),builder3:dpMethod.builder3,
  extraParams:[...base.extraParams,{key:'approach',type:'select',label:bi('Cách giải','Approach'),default:1,options:[
    {value:1,label:bi('Cách 1 · Heap + Dijkstra','Approach 1 · Heap + Dijkstra')},
    {value:2,label:bi('Cách 2 · DP theo thời gian','Approach 2 · Time-based DP')},
    {value:3,label:bi('Cách 3 · DP đẩy tới new_time','Approach 3 · Forward time DP')},
  ]}],
  complexity2:{time:'O(T(V + E))',space:'O(VT)',note:bi('T = maxTime. dp[time][node] lưu phí tại đúng thời gian; lấy min ở mọi thời gian tới đích.','T = maxTime. dp[time][node] stores the fee at exact time; minimize across all destination arrival times.')},
  complexity3:{time:'O(T(V + E))',space:'O(VT)',note:bi('T = maxTime. Từ trạng thái hữu hạn ở time, đẩy chi phí tới new_time = time + travel_time.','T = maxTime. From finite states at time, push costs to new_time = time + travel_time.')},
  tags:[...base.tags,{key:'dijkstra',vi:'Dijkstra',en:'Dijkstra'}],
  titleVi:bi('Phí nhỏ nhất · Heap và DP thời gian','Minimum fee · heap and time-based DP'),
  statement:bi('Đi từ 0 tới n−1 trong maxTime. Cạnh ghi thời gian; mỗi lần vào thành phố phải trả phí, kể cả lúc bắt đầu. Tìm tổng phí nhỏ nhất, hoặc −1.','Travel from 0 to n−1 within maxTime. Roads cost time; pay a city fee on every entry, including the start. Return the minimum total fee, or −1.'),
  inputLabel:bi('roads · u,v,time;… hoặc JSON · 2–12 thành phố','roads · u,v,time;… or JSON · 2–12 cities'),
  approach:[bi('dist[node][time] giữ phí nhỏ nhất tại đúng thời gian time. Heap lấy phí nhỏ nhất; bỏ bản ghi cũ. Pop đích → trả phí.','dist[node][time] stores the lowest fee at exact time. Pop the cheapest entry; skip stale records. Pop the destination → return its fee.'),bi('Cách 2: duyệt thời gian tăng dần, relax cả u → v và v → u. Kết quả là min dp[time][n−1].','Approach 2: scan times in ascending order; relax u → v and v → u. Return min dp[time][n−1].'),bi('Cách 3: bỏ ô INF và cạnh vượt giờ; đẩy cả hai chiều tới hàng new_time.','Approach 3: skip INF states and overtime edges; push both directions into the new_time row.')],
  complexity:{time:'O(VT + ET log(VT))',space:'O(VT + ET)',note:bi('T = maxTime. Bảng dist lưu trạng thái (node, time); heap lưu bộ ba (cost, time, node).','T = maxTime. dist stores (node, time) states; the heap stores (cost, time, node) tuples.')},
  visualizationLimits:{maxNodes:12,maxEdges:30,maxTime:100,maxStates:1500,maxTraceSteps:1601},
}};
