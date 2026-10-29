'use strict';
const base=require('./hard-graph-visualizations')[1928];
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const copy=value=>JSON.parse(JSON.stringify(value));
const key=(cost,time,node)=>`${cost},${time},${node}`;
const code=[
  'from heapq import heappop, heappush',
  'from math import inf',
  'class Solution:',
  '    def minCost(self, maxTime, edges, passingFees):',
  '        n = len(passingFees)',
  '        graph = [[] for _ in range(n)]',
  '        for u, v, travel in edges:',
  '            graph[u].append((v, travel))',
  '            graph[v].append((u, travel))',
  '        best_time = [inf] * n',
  '        heap = [(passingFees[0], 0, 0)]',
  '        while heap:',
  '            cost, elapsed, node = heappop(heap)',
  '            if elapsed < best_time[node]:',
  '                best_time[node] = elapsed',
  '                if node == n - 1:',
  '                    return cost',
  '                for nxt, travel in graph[node]:',
  '                    arrival = elapsed + travel',
  '                    if arrival <= maxTime and arrival < best_time[nxt]:',
  '                        candidate = cost + passingFees[nxt]',
  '                        heappush(heap, (candidate, arrival, nxt))',
  '        return -1',
];
function builder(input,params={}) {
  const parsed=base.parseMinCost1928Input(input,params),{maxTime,edges,passingFees}=parsed,n=passingFees.length;
  const trace=runTrace({code:code.join('\n'),method:'minCost',args:[maxTime,edges,passingFees]});
  const routes=new Map(),processed=[],pops=[];
  let active=null,proposal=null,road=null;
  const steps=trace.events.map((record,index)=>{
    const x=record.locals,line=record.line;let event='step',reason=null;
    if(line===5)event='cities';if(line===6)event='graph';
    if(line===7){event='road';road=record.branch?{from:x.u,to:x.v,travel:x.travel}:null;}
    if(line===8||line===9){event='arc';road={from:line===8?x.u:x.v,to:line===8?x.v:x.u,travel:x.travel};}
    if(line===10){event='best-time';road=null;}
    if(line===11){event='start';routes.set(key(passingFees[0],0,0),{nodes:[0],time:0,cost:passingFees[0]});}
    if(line===12)event='heap-check';
    if(line===13){event='pop';proposal=road=null;active={node:x.node,time:x.elapsed,cost:x.cost,path:copy(routes.get(key(x.cost,x.elapsed,x.node)).nodes)};pops.push({node:x.node,time:x.elapsed,cost:x.cost});}
    if(line===14){event=record.branch?'faster':'stale';if(!record.branch)reason='dominated';}
    if(line===15){event='settle';processed.push({node:x.node,time:x.elapsed,cost:x.cost});}
    if(line===16)event='destination-check';
    if(line===18){event='neighbor';proposal=record.branch?{from:x.node,to:x.nxt,travel:x.travel,arrival:null,cost:null,decision:null}:null;}
    if(line===19){event='arrival';proposal.arrival=x.arrival;}
    if(line===20){event=record.branch?'allowed':'reject';reason=x.arrival>maxTime?'overtime':x.arrival>=x.best_time[x.nxt]?'dominated':null;proposal.decision=record.branch;}
    if(line===21){event='fee';proposal.cost=x.candidate;}
    if(line===22){event='push';const state=key(x.candidate,x.arrival,x.nxt);if(!routes.has(state))routes.set(state,{nodes:[...active.path,x.nxt],time:x.arrival,cost:x.candidate});}
    const final=index===trace.events.length-1;if(final){event=trace.answer===-1?'unreachable':'return';proposal=road=null;}
    const heap=x.heap??null,sorted=heap?[...heap].sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]):null;
    const names=final?['node','cost','elapsed']:line<13?['n','maxTime']:['node','cost','elapsed','nxt','arrival','candidate'];
    return {arr:[],codeBlock:1,codeLines:[line],final,title:bi(`L${line} · ${event}`,`L${line} · ${event}`),note:bi('',''),vars:names.map(name=>({name,value:Object.hasOwn(x,name)?x[name]:'—'})),
      costTime1928View:{source:{line,text:code[line-1].trim(),timing:'after'},scope:record.scope,locals:x,outer:record.outer,frames:record.frames,branch:record.branch,returning:record.returning,returned:record.returned,
        event,reason,n,maxTime,edges,passingFees,graph:x.graph??null,bestTime:x.best_time??null,heap,frontier:sorted?.map(([cost,time,node])=>({cost,time,node,path:copy(routes.get(key(cost,time,node)).nodes)}))??null,
        active:copy(active),proposal:copy(proposal),road:copy(road),processed:copy(processed),pops:copy(pops),
        winner:final&&trace.answer!==-1?copy(active):null,done:final,answer:final?trace.answer:null},
    };
  });
  return {original:edges,answer:trace.answer,steps};
}
module.exports={1928:{...base,code,builder,debugMode:'line-by-line',
  tags:[...base.tags,{key:'dijkstra',vi:'Dijkstra',en:'Dijkstra'}],
  titleVi:bi('Phí nhỏ nhất · heap chi phí & thời gian','Minimum fee · cost and time heap'),
  statement:bi('Đi từ 0 tới n−1 trong maxTime. Cạnh ghi thời gian; mỗi lần vào thành phố phải trả phí, kể cả lúc bắt đầu. Tìm tổng phí nhỏ nhất, hoặc −1.','Travel from 0 to n−1 within maxTime. Roads cost time; pay a city fee on every entry, including the start. Return the minimum total fee, or −1.'),
  inputLabel:bi('roads · u,v,time;… hoặc JSON · 2–12 thành phố','roads · u,v,time;… or JSON · 2–12 cities'),
  approach:[bi('Heap lấy phí nhỏ nhất trước. Giữ lượt tới nhanh hơn ở mỗi thành phố. Lấy được đích → chốt phí.','Pop the cheapest route first. Process a city again when arrival is faster. Pop the destination → return its fee.')],
  complexity:{time:'O(T·E·log(T·E))',space:'O(T·E + V)',note:bi('T = maxTime; best_time chỉ cập nhật khi pop.','T = maxTime; best_time changes only after a pop.')},
  visualizationLimits:{maxNodes:12,maxEdges:30,maxTime:100,maxStates:1500},
}};
