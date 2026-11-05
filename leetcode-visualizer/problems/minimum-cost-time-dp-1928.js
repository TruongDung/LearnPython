'use strict';
const base=require('./hard-graph-visualizations')[1928];
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const code=String.raw`from typing import List

class Solution:
    def minCost(self, maxTime: int, edges: List[List[int]],
                passingFees: List[int]) -> int:

        n = len(passingFees)

        dp = [[float('inf')] * n
              for _ in range(maxTime + 1)]

        dp[0][0] = passingFees[0]

        for time in range(1, maxTime + 1):
            for u, v, travel_time in edges:

                if time >= travel_time:
                    dp[time][v] = min(
                        dp[time][v],
                        dp[time - travel_time][u] + passingFees[v]
                    )

                    dp[time][u] = min(
                        dp[time][u],
                        dp[time - travel_time][v] + passingFees[u]
                    )

        return min(dp[time][n - 1]
                   for time in range(maxTime + 1)) \
               if min(dp[time][n - 1]
                      for time in range(maxTime + 1)) != float('inf') \
               else -1`.split('\n');
const forwardCode=`from typing import List

class Solution:
    def minCost(self, maxTime: int, edges: List[List[int]],
                passingFees: List[int]) -> int:

        n = len(passingFees)
        INF = float('inf')

        dp = [[INF] * n for _ in range(maxTime + 1)]
        dp[0][0] = passingFees[0]

        for time in range(maxTime + 1):
            for u, v, travel_time in edges:

                if time + travel_time > maxTime:
                    continue

                new_time = time + travel_time

                if dp[time][u] != INF:
                    dp[new_time][v] = min(
                        dp[new_time][v],
                        dp[time][u] + passingFees[v]
                    )

                if dp[time][v] != INF:
                    dp[new_time][u] = min(
                        dp[new_time][u],
                        dp[time][v] + passingFees[u]
                    )

        answer = min(dp[t][n - 1] for t in range(maxTime + 1))

        return answer if answer != INF else -1`.split('\n');
function builder(input,params={},method=2) {
  const pushing=method===3,definition=pushing?forwardCode:code;
  const returnLine=definition.findIndex(line=>line.trim().startsWith(pushing?'answer = min(':'return min('))+1;
  const {maxTime,edges,passingFees}=base.parseMinCost1928Input(input,params),n=passingFees.length;
  const result=runTrace({code:definition.join('\n'),method:'minCost',args:[maxTime,edges,passingFees],maxEvents:1600});
  let previous=null,transition=null,guard=null,bound=null;
  function recover(dp,node,time) {
    if(typeof dp?.[time]?.[node]!=='number')return null;
    const path=[node];let current=node,elapsed=time;
    while(current!==0||elapsed!==0){
      const cost=dp[elapsed][current];
      const road=edges.find(([u,v,t])=>{
        const prev=u===current?v:v===current?u:null;
        return prev!==null&&elapsed>=t&&typeof dp[elapsed-t][prev]==='number'
          &&dp[elapsed-t][prev]+passingFees[current]===cost;
      });
      if(!road)return null;
      elapsed-=road[2];current=road[0]===current?road[1]:road[0];path.push(current);
    }
    return path.reverse();
  }
  const steps=result.events.map((record,index)=>{
    const x=record.locals,line=record.line,source=definition[line-1].trim(),final=index===result.events.length-1;
    const dp=x.dp??null;
    let event='step',changed=null,road=null;
    if(source==='n = len(passingFees)')event='cities';
    if(dp&&!previous)event='dp-init';
    if(source===(pushing?'for time in range(maxTime + 1):':'for time in range(1, maxTime + 1):')){event=record.branch?'layer':'scan-done';transition=guard=bound=null;}
    if(source==='for u, v, travel_time in edges:'){
      event=record.branch?'edge':'scan-done';transition=guard=bound=null;
      if(record.branch)road={from:x.u,to:x.v,travel:x.travel_time};
    }
    if(source==='if time >= travel_time:'){
      event=record.branch?'allowed':'skip';road={from:x.u,to:x.v,travel:x.travel_time};
    }
    if(pushing&&source==='if time + travel_time > maxTime:'){
      event=record.branch?'overtime':'allowed';
      bound={time:x.time,travel:x.travel_time,arrival:x.time+x.travel_time,allowed:!record.branch};
      road={from:x.u,to:x.v,travel:x.travel_time};
    }
    if(pushing&&source==='continue'){event='overtime';road={from:x.u,to:x.v,travel:x.travel_time};}
    if(pushing&&source==='new_time = time + travel_time'){event='arrival';}
    if(pushing&&(source==='if dp[time][u] != INF:'||source==='if dp[time][v] != INF:')){
      const from=source.includes('[u]')?x.u:x.v,to=source.includes('[u]')?x.v:x.u;
      guard={node:from,to,time:x.time,arrival:x.new_time,cost:dp[x.time][from],passes:record.branch};
      transition=null;event=record.branch?'reachable':'unreached';road={from,to,travel:x.travel_time};
    }
    const forward=source===(pushing?'dp[new_time][v] = min(':'dp[time][v] = min(');
    const backward=source===(pushing?'dp[new_time][u] = min(':'dp[time][u] = min(');
    if(forward||backward){
      const from=forward?x.u:x.v,to=forward?x.v:x.u,targetTime=pushing?x.new_time:x.time;
      if(!transition||transition.from!==from||transition.to!==to||transition.time!==targetTime){
        const previousTime=pushing?x.time:x.time-x.travel_time;
        transition={from,to,time:targetTime,previousTime,travel:x.travel_time,oldCost:dp[targetTime][to],
          preCost:dp[previousTime][from],fee:passingFees[to],candidate:null,evaluated:false,complete:false};
      }else if(transition.evaluated)transition.complete=true;
      event=transition.complete?'keep':'relax';
    }
    const operand=pushing?/^dp\[time\]\[[uv]\] \+ passingFees\[[uv]\]$/:/^dp\[time - travel_time\]\[[uv]\] \+ passingFees\[[uv]\]$/;
    if(transition&&operand.test(source)){
      transition.evaluated=true;
      transition.candidate=typeof transition.preCost==='number'?transition.preCost+transition.fee:'∞';
      event='calculate';
    }
    if(previous&&dp){
      for(let time=0;time<dp.length;time++)for(let node=0;node<n;node++){
        if(dp[time][node]!==previous[time][node])changed={node,time,before:previous[time][node],after:dp[time][node]};
      }
      if(changed){event='dp-update';if(transition)transition.complete=true;}
    }
    if(line>=returnLine){event='result';transition=guard=bound=null;}
    if(final){event=result.answer===-1?'unreachable':'return';transition=guard=bound=null;}
    const target=transition?{...transition,actual:dp[transition.time][transition.to]}:null;
    const active=target?{node:target.from,time:target.previousTime,cost:target.preCost,path:recover(dp,target.from,target.previousTime)}
      :guard?{node:guard.node,time:guard.time,cost:guard.cost,path:recover(dp,guard.node,guard.time)}:null;
    const destinationCosts=dp&&line>=returnLine?dp.map(row=>row[n-1]):null;
    const winnerTime=final&&result.answer!==-1?dp.findIndex(row=>row[n-1]===result.answer):null;
    const winner=winnerTime!==null?{node:n-1,time:winnerTime,cost:result.answer,path:recover(dp,n-1,winnerTime)}:null;
    const view={method,source:{line,text:source,timing:'after'},scope:record.scope,locals:x,outer:record.outer,
      frames:record.frames,branch:record.branch,returned:record.returned,returning:record.returning,
      event,n,maxTime,edges,passingFees,dp,changed,transition:target,active,winner,road,guard:guard?{...guard}:null,bound:bound?{...bound}:null,minimum:x.answer??null,
      proposal:target?{from:target.from,to:target.to,travel:target.travel,arrival:target.time,cost:target.candidate}:null,
      timeLayer:x.time??null,destinationCosts,done:final,answer:final?result.answer:null,trace:result.trace};
    previous=dp;
    return {arr:[],codeBlock:method,codeLines:[line],final,title:bi(`L${line} · ${event}`,`L${line} · ${event}`),note:bi('',''),
      vars:(pushing?['n','maxTime','time','u','v','travel_time','new_time','INF','answer']:['n','maxTime','time','u','v','travel_time']).map(name=>({name,value:Object.hasOwn(x,name)?x[name]:'—'})),costTime1928View:view};
  });
  return {original:edges,answer:result.answer,steps};
}
module.exports={code,forwardCode,builder,builder3:(input,params)=>builder(input,params,3)};
