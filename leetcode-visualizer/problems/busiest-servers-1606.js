'use strict';
const base = require('./server-heap')[1606];
const {runTrace} = require('./wasm-picture-trace');
const bi = (vi,en) => ({vi,en}), clone = v => JSON.parse(JSON.stringify(v));
const CODE = `from heapq import heapify, heappop, heappush

class Solution:
    def busiestServers(self, k, arrival, load):
        free = list(range(k))
        heapify(free)
        busy = []
        handled = [0] * k
        dropped = 0
        for i, (time, duration) in enumerate(zip(arrival, load)):
            while busy and busy[0][0] <= time:
                finished, server = heappop(busy)
                heappush(free, i + (server - i) % k)
            if not free:
                dropped += 1
                continue
            slot = heappop(free)
            server = slot % k
            handled[server] += 1
            heappush(busy, (time + duration, server))
        best = max(handled)
        return [server for server, count in enumerate(handled) if count == best]`;
function array(input,name) {
  let a=input;
  try {if(typeof a==='string'){const s=a.trim();a=s.startsWith('[')?JSON.parse(s):s?s.split(',').map(t=>t.trim()?Number(t):NaN):[];}} catch {a=null;}
  if(!Array.isArray(a)||!a.length||a.length>100000||!Array.from(a).every(x=>Number.isInteger(x)&&x>=1&&x<=1e9))throw new RangeError(`${name}: 1–100000 positive integers up to 10⁹`);
  return [...a];
}
function args(input,params={}) {
  if(!params||typeof params!=='object'||Array.isArray(params))throw new TypeError('Invalid parameters');
  const k=params.k===undefined?3:params.k,arrival=array(input,'arrival'),load=array(params.load===undefined?'5,2,3,3,3':params.load,'load');
  if(typeof k!=='number'||!Number.isInteger(k)||k<1||k>100000)throw new RangeError('k: an integer from 1 to 100000');
  if(load.length!==arrival.length)throw new RangeError('arrival and load must have the same length');
  if(arrival.some((t,i)=>i&&t<=arrival[i-1]))throw new RangeError('arrival must be strictly increasing');
  return [k,arrival,load];
}
const read=(x,name)=>({values:x[name]??x[`list(${name})[:16]`]??null,count:x[name]?.length??x[`len(${name})`]??null});
function build(input,params) {
  const [k,arrival,load]=args(input,params),large=k>8||arrival.length>16;
  const payload={code:CODE,method:'busiestServers',args:[k,arrival,load],...(large?{maxEvents:600,summarizeLocals:{arrival:16,load:16,free:16,busy:16,handled:16}}:{})};
  const native=runTrace(payload),code=CODE.split('\n'),requests=[],jobs=[],ledger=[];
  let current=null,release=null,reserved=null,chosen=null,comparison=null,phase='init';
  const steps=native.events.map((e,step)=>{
    const x=e.locals,text=code[e.line-1].trim(),final=e.returning;
    const free=read(x,'free'),busy=read(x,'busy'),handled=read(x,'handled');
    let change=null,virtual=null;
    if(text.startsWith('for i, ')&&e.branch){
      current=x.i;release=null;reserved=null;chosen=null;comparison=null;phase='request';
      requests.push({index:x.i,time:x.time,duration:x.duration,state:'arriving',server:null,slot:null,step});
    }
    const request=current===null?null:requests.find(r=>r.index===current);
    if(text==='while busy and busy[0][0] <= time:'){
      phase='release-check';const top=busy.values?.[0];comparison={kind:'release',finish:top?.[0]??null,server:top?.[1]??null,time:x.time,pass:e.branch};
    }
    if(text==='finished, server = heappop(busy)'){
      phase='release';release={server:x.server,finished:x.finished};change={kind:'release',...release};ledger.push({...change,step});
    }
    if(text==='heappush(free, i + (server - i) % k)'){
      phase='requeue';virtual=x.i+(x.server-x.i)%k;if(virtual<x.i)virtual+=k;
      change={kind:'requeue',server:x.server,slot:virtual};ledger.push({...change,step});release=null;
    }
    if(text==='if not free:'){phase='free-check';comparison={kind:'free',count:free.count,pass:e.branch};}
    if(text==='dropped += 1'){phase='drop';request.state='dropped';change={kind:'drop',index:current};ledger.push({...change,step});}
    if(text==='continue')phase='drop';
    if(text==='slot = heappop(free)'){phase='pick-slot';reserved=x.slot;request.state='choosing';request.slot=x.slot;change={kind:'slot',slot:x.slot};}
    if(text==='server = slot % k'){phase='pick-server';chosen=x.server;request.state='chosen';request.server=x.server;change={kind:'choose',server:x.server,slot:x.slot};}
    if(text==='handled[server] += 1'){phase='count';request.state='counted';change={kind:'count',server:x.server};}
    if(text==='heappush(busy, (time + duration, server))'){
      phase='busy';request.state='accepted';const job={index:current,server:x.server,start:x.time,end:x.time+x.duration,step};
      jobs.push(job);change={kind:'assign',...job};ledger.push({...change,step});reserved=null;
    }
    if(text==='best = max(handled)')phase='best';
    if(final){phase='done';if(native.trace.truncated){release=null;reserved=null;chosen=null;comparison=null;}}
    const ids=Array.from({length:Math.min(k,8)},(_,i)=>i),clock=x.time??null;
    const servers=ids.map(id=>{
      const freeSlot=free.values?.find(slot=>slot%k===id),job=busy.values?.find(([,server])=>server===id);
      let state='unknown';
      if(freeSlot!==undefined)state='free';
      else if(job)state=clock!==null&&job[0]<=clock?'ready':'busy';
      else if(release?.server===id)state='returning';
      else if(reserved!==null&&reserved%k===id)state='reserved';
      return {id,state,count:handled.values?.[id]??null,until:job?.[0]??null,slot:freeSlot??null};
    });
    const view={id:1606,k,arrival:arrival.slice(0,16),load:load.slice(0,16),requestCount:arrival.length,
      phase,i:final?null:current,time:final?null:clock,clock,duration:final?null:x.duration??null,
      preferred:final||current===null?null:current%k,slot:virtual??reserved,server:chosen,
      released:change?.kind==='requeue'?change.server:release?.server??null,release:clone(release),reserved,
      dropped:!final&&request?.state==='dropped',droppedCount:x.dropped??0,
      free:free.values,busy:busy.values,handled:handled.values,freeCount:free.count,busyCount:busy.count,
      freeSlots:(free.values??[]).map(slot=>({virtual:slot,server:slot%k})),busyJobs:(busy.values??[]).map(([until,server])=>({until,server})),
      servers,requests:clone(requests.filter(r=>r.index<16)),jobs:clone(jobs),ledger:clone(ledger),comparison:clone(comparison),change,
      best:x.best??null,answer:final?native.answer:null,winnerCount:final?native.answer.length:null,
      omitted:native.trace.truncated,preview:large,source:{line:e.line,text,timing:'after'},locals:x,outer:e.outer,frames:e.frames,
      scope:e.scope,branch:e.branch,returning:e.returning,returned:e.returned,trace:native.trace,result:final?native.answer:null};
    return {arr:[],codeBlock:1,codeLines:[e.line],final,title:bi(`L${e.line} · ${text}`,`L${e.line} · ${text}`),note:bi('',''),
      vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),serverSchedulingView:view,serverHeap1606View:view};
  });
  return {original:arrival,arrival,load,k,answer:native.answer,steps};
}
module.exports={1606:{...base,code:CODE.split('\n'),debugMode:'line-by-line',builder:build,liveArgs:args,
  inputLabel:bi('arrival · thời điểm tăng dần · hình đầy đủ ≤16 request, ≤8 server','arrival · strictly increasing times · full picture ≤16 requests, ≤8 servers'),
  extraParams:[{key:'k',label:bi('k · số server','k · servers'),default:3,min:1,max:100000},
    {key:'load',type:'string',label:bi('load · thời gian xử lý, cùng độ dài arrival','load · durations, same length as arrival'),default:'5,2,3,3,3'}],
  approach:[bi('Giải phóng job xong → chọn server rảnh theo vòng → đếm request. Hai heap đổi đúng từng dòng Python.',
    'Release finished jobs → choose a free server cyclically → count the request. Both heaps replay actual Python statements.')],
  visualizationLimits:{maxServers:8,maxRequests:16,completeTraceForPreview:true,largeTraceLimit:600},
}};
