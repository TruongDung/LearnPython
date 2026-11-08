"use strict";
const {runTrace}=require('./wasm-picture-trace');
const graph=require('./graph'),dp=require('./dp'),greedy=require('./greedy');
const bases={2392:graph[2392],3117:require('./hard-dp-3117')[3117],3180:require('./maximum-total-reward-3180')[3180],3181:require('./maximum-total-reward-3181')[3181],3333:require('./original-typed-string-ii-3333')[3333],354:dp[354],121:greedy[121],115:dp[115]};
const bi=(vi,en)=>({vi,en}),copy=x=>JSON.parse(JSON.stringify(x));
const roomCode=`class Solution:
    def waysToBuildRooms(self, prevRoom):
        MOD = 10**9 + 7
        n = len(prevRoom)
        children = [[] for _ in range(n)]
        for room in range(1, n):
            parent = prevRoom[room]
            children[parent].append(room)
        fact = [1] * (n + 1)
        for i in range(1, n + 1):
            fact[i] = fact[i - 1] * i % MOD
        inv_fact = [1] * (n + 1)
        inv_fact[n] = pow(fact[n], MOD - 2, MOD)
        for i in range(n, 0, -1):
            inv_fact[i - 1] = inv_fact[i] * i % MOD
        order = [0]
        for u in order:
            for v in children[u]:
                order.append(v)
        size = [1] * n
        ways = [1] * n
        for u in reversed(order):
            total = 0
            for v in children[u]:
                child_size = size[v]
                child_ways = ways[v]
                choose = fact[total + child_size] * inv_fact[total] % MOD * inv_fact[child_size] % MOD
                ways[u] = ways[u] * child_ways % MOD * choose % MOD
                total += child_size
            size[u] = total + 1
        return ways[0]`.split('\n');
const meetingCode=`from collections import deque

class Solution:
    def maximumInvitations(self, favorite):
        n = len(favorite)
        indegree = [0] * n
        for person in range(n):
            indegree[favorite[person]] += 1
        depth = [1] * n
        parent = [-1] * n
        queue = deque(i for i in range(n) if indegree[i] == 0)
        while queue:
            person = queue.popleft()
            target = favorite[person]
            candidate = depth[person] + 1
            if candidate > depth[target]:
                depth[target] = candidate
                parent[target] = person
            indegree[target] -= 1
            if indegree[target] == 0:
                queue.append(target)
        seen = [False] * n
        longest = 0
        pairs = 0
        for start in range(n):
            if indegree[start] == 0 or seen[start]:
                continue
            cycle = []
            node = start
            while not seen[node]:
                seen[node] = True
                cycle.append(node)
                node = favorite[node]
            if len(cycle) == 2:
                a, b = cycle
                pairs += depth[a] + depth[b]
            else:
                longest = max(longest, len(cycle))
        return max(longest, pairs)`.split('\n');
const matrixCode=`from collections import deque

class Solution:
    def buildMatrix(self, k, rowConditions, colConditions):
        def topo(conditions, axis):
            graph = [[] for _ in range(k + 1)]
            indegree = [0] * (k + 1)
            for a, b in conditions:
                graph[a].append(b)
                indegree[b] += 1
            queue = deque(x for x in range(1, k + 1) if indegree[x] == 0)
            order = []
            while queue:
                x = queue.popleft()
                order.append(x)
                for nxt in graph[x]:
                    indegree[nxt] -= 1
                    if indegree[nxt] == 0:
                        queue.append(nxt)
            return order if len(order) == k else []
        rows = topo(rowConditions, 'row')
        cols = topo(colConditions, 'col')
        if not rows or not cols:
            return []
        row_pos = {value: i for i, value in enumerate(rows)}
        col_pos = {value: i for i, value in enumerate(cols)}
        matrix = [[0] * k for _ in range(k)]
        for value in range(1, k + 1):
            r, c = row_pos[value], col_pos[value]
            matrix[r][c] = value
        return matrix`.split('\n');
const typedCode=`class Solution:
    def possibleStringCount(self, word, k):
        MOD = 10**9 + 7
        groups = []
        for letter in word:
            if not groups or letter != previous:
                groups.append(1)
            else:
                groups[-1] += 1
            previous = letter
        total = 1
        for length in groups:
            total = total * length % MOD
        if len(groups) >= k:
            return total
        dp = [0] * k
        dp[0] = 1
        for length in groups:
            prefix = [0]
            for ways in dp:
                prefix.append((prefix[-1] + ways) % MOD)
            new_dp = [0] * k
            for j in range(1, k):
                left = max(0, j - length)
                new_dp[j] = (prefix[j] - prefix[left]) % MOD
            dp = new_dp
        return (total - sum(dp)) % MOD`.split('\n');
function integers(input,min,max,maxLength=100000){let values=input;try{if(typeof input==='string'){const s=input.trim();values=s.startsWith('[')?JSON.parse(s):s.split(',').map(t=>t.trim()===''?NaN:Number(t.trim()));}}catch{values=null;}if(!Array.isArray(values)||!values.length||values.length>maxLength||!Array.from(values).every(v=>Number.isInteger(v)&&v>=min&&v<=max))throw new RangeError(`Use 1–${maxLength} integers from ${min} to ${max}`);return [...values];}
function roomData(input){const a=integers(input,-1,99999),n=a.length;if(a[0]!==-1||a.slice(1).some((p,i)=>p<0||p>=n||p===i+1))throw new RangeError('prevRoom[0] = -1; every other room must have a valid different parent');const children=Array.from({length:n},()=>[]);for(let i=1;i<n;i++)children[a[i]].push(i);const order=[0],depth=Array(n).fill(0);for(let i=0;i<order.length;i++)for(const child of children[order[i]]){order.push(child);depth[child]=depth[order[i]]+1;}if(order.length!==n)throw new RangeError('Every room must be reachable from room 0; cycles are invalid');const shown=order.slice(0,14),set=new Set(shown);return {args:[a],model:{n,nodes:shown.map(id=>({id,parent:a[id],depth:depth[id]})),edges:shown.filter(id=>id!==0&&set.has(a[id])).map(id=>[a[id],id]),input:a.slice(0,14),cropped:n>14}};}
function meetingData(input){const a=integers(input,0,99999),n=a.length;if(n<2||a.some((target,i)=>target>=n||target===i))throw new RangeError('favorite needs 2–100000 employees; each target must be a different valid employee');const shown=Array.from({length:Math.min(n,14)},(_,i)=>i);return {args:[a],model:{n,nodes:shown.map(id=>({id})),edges:shown.filter(i=>a[i]<14).map(i=>[i,a[i]]),input:a.slice(0,14),cropped:n>14}};}
function defaults(base,params){return {...Object.fromEntries((base.extraParams??[]).map(p=>[p.key,p.default])),...params};}
function prepare(id,input,params={}){
 if(id===1916)return roomData(input);if(id===2127)return meetingData(input);
 const base=bases[id],options=defaults(base,params);let args;
 if(id===354){let a=input;try{if(typeof a==='string')a=a.trim().startsWith('[')?JSON.parse(a):a.split(';').map(row=>row.split(',').map(Number));}catch{a=null;}if(!Array.isArray(a)||!a.length||a.length>50||!Array.from(a).every(p=>Array.isArray(p)&&p.length===2&&p.every(x=>Number.isInteger(x)&&x>0&&x<=100000)))throw new RangeError('Use 1–50 envelopes as w,h;w,h or JSON, dimensions 1–100000');args=[a.map(p=>[...p])];}
 else if(id===121)args=[integers(input,0,1000000000)];
 else if(id===115){const s=String(input??''),t=String(options.t??'');if(s.length>32||t.length>32||!(/^[a-z]*$/i.test(s)&&/^[a-z]*$/i.test(t)))throw new RangeError('s and t use at most 32 English letters each');args=[s,t];}
 else args=base.liveArgs(input,options);
 let model;
 if(id===2392)model={k:args[0],rowEdges:args[1].slice(0,64),colEdges:args[2].slice(0,64),cropped:args[1].length>64||args[2].length>64};
 else if(id===3117)model={nums:args[0],targets:args[1],cropped:false};
 else if([3180,3181,121].includes(id))model={input:args[0].slice(0,32),n:args[0].length,cropped:args[0].length>32};
 else if(id===354)model={input:args[0],n:args[0].length,cropped:false};
 else if(id===3333)model={word:args[0],k:args[1],cropped:false};
 else model={s:args[0],t:args[1],cropped:false};
 return {args,model};
}
function get(x,name){return Object.hasOwn(x,name)?x[name]:x[`list(${name})[:16]`];}
function build(id,codes,input,params={}){
 const base=bases[id],method=codes.length>1?Math.min(codes.length,Math.max(1,Number(params.approach??base.extraParams?.find(p=>p.key==='approach')?.default??1))):1,code=codes[method-1];
 const {args,model}=prepare(id,input,params),name=code.find(line=>/^    def /.test(line)).match(/def (\w+)/)[1];
 const large=[1916,2127].includes(id)&&model.n>14||id===121&&model.n>32;
 const summaries=id===3117?{nums:0,andValues:0,choice:0}:id===2392?{graph:0,conditions:0,rowConditions:0,colConditions:0}:large?Object.fromEntries(['prevRoom','favorite','fact','inv_fact','size','ways','order','indegree','depth','parent','queue','seen','cycle','prices','dp'].map(n=>[n,16])):{};
 if(id===1916){summaries.children=0;delete summaries.parent;}
 const payload={code:code.join('\n'),method:name,args,maxEvents:[3117,115].includes(id)?800:1600,summarizeLocals:summaries};
 const trace=runTrace(payload),completed=new Set(),popped=new Set(),memo=new Map(),topos={row:null,col:null},cycles=[];
 let previous=null,typedRound=-1,iteration=-1,activeDay=null,buy=null,bestBuy=null,bestSell=null,profit=0,rewardState=null,bestCycle=[],roomMerge=null,letterIndex=-1;
 const steps=trace.events.map((record,index)=>{
  const x=record.locals,o=record.outer,text=code[record.line-1].trim(),final=record.scope===name&&record.returning;let change=null;
  if(id===1916&&text==='size[u] = total + 1')completed.add(x.u);
  if(id===1916&&text.startsWith('choose ='))roomMerge={node:x.u,child:x.v,total:x.total,child_size:x.child_size,choose:x.choose};
  if(id===1916&&text.startsWith('ways[u] ='))change={kind:'merge',node:x.u,child:x.v,before:get(previous.locals,'ways')?.[x.u]??null,after:get(x,'ways')?.[x.u]??null,choose:x.choose};
  if(id===2127){if(text==='person = queue.popleft()'){popped.add(x.person);change={kind:'pop',node:x.person};}if(text==='depth[target] = candidate')change={kind:'depth',node:x.target,from:x.person,value:x.candidate};if(text==='pairs += depth[a] + depth[b]'){cycles.push({nodes:[...get(x,'cycle')],kind:'pair',value:x.pairs-(previous.locals.pairs??0)});change={kind:'pair'};}if(text.startsWith('longest = max')){const cycle=[...get(x,'cycle')];cycles.push({nodes:cycle,kind:'long',value:x['len(cycle)']??cycle.length});if(cycle.length>bestCycle.length)bestCycle=cycle;change={kind:'cycle'};}}
  if(id===2392&&record.scope==='topo')topos[x.axis]={queue:get(x,'queue')??null,order:get(x,'order')??null,indegree:get(x,'indegree')??null,returned:record.returning?record.returned:null};
  if(id===2392&&text==='matrix[r][c] = value')change={kind:'place',row:x.r,col:x.c,value:x.value};
  if(id===3117&&record.scope==='dfs'&&record.returning)memo.set([x.i,x.j,x.running_and].join(','),{i:x.i,j:x.j,and:x.running_and,value:record.returned,step:index});
  if([3180,3181].includes(id)){
   if(text==='for reward in rewards:'&&record.branch)rewardState={reward:x.reward,before:id===3180?copy(x.dp):x.bits,eligible:null,shifted:null,after:null};
   if(id===3181&&text.startsWith('eligible ='))rewardState.eligible=x.eligible;
   if(id===3181&&text.startsWith('shifted ='))rewardState.shifted=x.shifted;
   if(id===3181&&text==='bits |= shifted'){rewardState.after=x.bits;change={kind:'bits'};}
   if(id===3180&&text==='dp[total + reward] = True'){rewardState.after=copy(x.dp);change={kind:'dp',index:x.total+x.reward};}
  }
  if(id===3333&&text==='for letter in word:')letterIndex=record.branch?letterIndex+1:null;
  if(id===3333&&record.line===code.lastIndexOf('        for length in groups:')+1&&record.branch)typedRound++;
  if(id===354){if(method===2&&text==='for _, h in envelopes:'&&record.branch)iteration++;if(text==='tails.append(h)'||text==='tails[i] = h'||text.startsWith('dp[i] = max'))change={kind:'lis',index:x.i};}
  if(id===121){
   if(text==='for price in prices:'){activeDay=record.branch?++iteration:null;}else if(text.startsWith('for i in range'))activeDay=record.branch?x.i:null;
   const day=method===1?activeDay:x.i??0;
   if(text.startsWith('min_price =')&&x.min_price!=='∞'&&(buy===null||x.min_price<previous?.locals.min_price)){buy=day;change={kind:'buy',index:day};}
   const newProfit=text.startsWith('max_profit = max')?x.max_profit:text.startsWith('dp[i] = max')?get(x,'dp')?.[x.i]:text.startsWith('cur_dp = max')?x.cur_dp:null;
   if(newProfit!==null&&newProfit!==undefined&&newProfit>profit){profit=newProfit;bestBuy=buy;bestSell=day;change={kind:'profit',index:day};}
  }
  const view={id,method,model,source:{line:record.line,text,timing:'after'},locals:x,outer:o,scope:record.scope,frames:record.frames,branch:record.branch,returning:record.returning,returned:record.returned,trace:trace.trace,
   completed:[...completed],popped:[...popped],cycles:copy(cycles),bestCycle:[...bestCycle],topos:copy(topos),memo:copy([...memo.values()].slice(-16)),rewardState:rewardState?copy(rewardState):null,
   typedRound,letterIndex,roomMerge:roomMerge?copy(roomMerge):null,iteration,activeDay,buy,bestBuy,bestSell,profit,change,answer:final?trace.answer:null};
  previous=view;return {arr:[],codeBlock:method,codeLines:[record.line],final,title:bi(`L${record.line} · ${text}`,`L${record.line} · ${text}`),note:bi('',''),vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),studyNativeView:view};
 });
 let witness=null;
 if(id===2127&&!large){const v=steps.at(-1).studyNativeView,x=v.locals,parent=x.parent,segments=v.cycles.filter(c=>c.kind==='pair').map(({nodes:[a,b]})=>{const chain=u=>{const r=[u];while(parent[u]!==-1){u=parent[u];r.push(u);}return r;};return [...chain(a).reverse(),...chain(b)];});witness=trace.answer===x.pairs?segments.flat():v.bestCycle;}
 if(id===1916&&model.n<=8){const orders=[],a=args[0];const visit=(path,used)=>{if(orders.length>=12)return;if(path.length===a.length){orders.push(path);return;}for(let i=1;i<a.length;i++)if(!used.has(i)&&used.has(a[i]))visit([...path,i],new Set([...used,i]));};visit([0],new Set([0]));witness=orders;}
 if(id===354){const a=[...args[0]].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),len=a.map(()=>1),parent=a.map(()=>-1);for(let i=0;i<a.length;i++)for(let j=0;j<i;j++)if(a[j][0]<a[i][0]&&a[j][1]<a[i][1]&&len[j]+1>len[i]){len[i]=len[j]+1;parent[i]=j;}let i=len.indexOf(Math.max(...len));witness=[];while(i>=0){witness.unshift(a[i]);i=parent[i];}}
 if(id===115&&model.s.length<=14){witness=[];const visit=(from,j,path)=>{if(witness.length>=8)return;if(j===model.t.length){witness.push(path);return;}for(let i=from;i<model.s.length;i++)if(model.s[i]===model.t[j])visit(i+1,j+1,[...path,i]);};visit(0,0,[]);}
 steps.at(-1).studyNativeView.witness=witness;
 return {original:id===3117?{nums:args[0],andValues:args[1]}:args[0],answer:trace.answer,steps,witness};
}
const newMeta={1916:{id:1916,slug:'count-ways-to-build-rooms-in-an-ant-colony',defaultInput:[-1,0,0,1,2],inputKind:'integer',title:bi('Count Ways to Build Rooms in an Ant Colony','Count Ways to Build Rooms in an Ant Colony'),titleVi:bi('Đếm thứ tự xây phòng','Count room-building orders'),tags:[{key:'tree',vi:'Cây',en:'Tree'},{key:'combinatorics',vi:'Tổ hợp',en:'Combinatorics'}],complexity:{time:'O(n)',space:'O(n)'}},2127:{id:2127,slug:'maximum-employees-to-be-invited-to-a-meeting',defaultInput:[2,2,1,2],inputKind:'nonneg',title:bi('Maximum Employees to Be Invited to a Meeting','Maximum Employees to Be Invited to a Meeting'),titleVi:bi('Xếp nhiều nhân viên nhất quanh bàn','Seat the maximum employees'),tags:[{key:'functional-graph',vi:'Đồ thị hàm',en:'Functional Graph'},{key:'bfs',vi:'BFS',en:'BFS'}],complexity:{time:'O(n)',space:'O(n)'}}};
const summaries={1916:['Cha trước con · xen kẽ thứ tự của các cây con.','Parent before child · interleave the child-subtree orders.'],2127:['Tỉa cây vào chu trình · max(chu trình dài, tổng các cặp 2 kèm nhánh).','Prune trees into cycles · max(long cycle, all mutual pairs with chains).'],2392:['Topo riêng cho hàng và cột → đặt value tại giao hai vị trí.','Independent row and column topo orders → place each value at their intersection.'],3117:['Mở rộng đoạn hoặc chốt khi AND đúng đích · chỉ cộng phần tử cuối.','Extend a segment or close when its AND matches · charge only the last element.'],3180:['Chỉ lấy reward khi tổng đang có nhỏ hơn reward.','Take a reward only when the current sum is smaller than it.'],3181:['Lọc bit tổng < reward → dịch reward bit → OR vào bits.','Mask sums below reward → shift by reward → OR into bits.'],3333:['Chọn 1..length ký tự mỗi nhóm · trừ các chuỗi có độ dài < k.','Choose 1..length letters per run · subtract strings shorter than k.'],354:['Rộng tăng, cao giảm khi cùng rộng → LIS chiều cao.','Width ascending, height descending for ties → height LIS.'],121:['Ghi giá thấp nhất trước ngày bán · giữ lợi nhuận lớn nhất.','Track the lowest earlier buy price · retain the highest profit.'],115:['Ký tự trùng: dùng + bỏ · khác: chỉ bỏ ký tự của s.','Matching letters: use + skip · otherwise skip the source letter.']};
const codes={1916:[roomCode],2127:[meetingCode],2392:[matrixCode],3117:[bases[3117].code],3180:[bases[3180].code],3181:[bases[3181].code],3333:[typedCode],354:[bases[354].code,bases[354].code2],121:[bases[121].code,bases[121].code2,bases[121].code3],115:[bases[115].code]};
const result={};for(const key of Object.keys(codes)){const id=Number(key),base=bases[id]??{...newMeta[id],difficulty:'hard',category:{key:'graph',vi:'Đồ thị',en:'Graph'},extraParams:[]};result[id]={...base,code:codes[id][0],...(codes[id][1]?{code2:codes[id][1]}:{}),...(codes[id][2]?{code3:codes[id][2]}:{}),builder2:undefined,builder3:undefined,debugMode:'line-by-line',allowEmptyInput:id===115,extraParams:(base.extraParams??[]).map(param=>id===115&&param.key==='t'?{...param,allowEmpty:true}:param),statement:bi(...summaries[id]),approach:[bi(...summaries[id])],builder:(input,params)=>build(id,codes[id],input,params),liveArgs:(input,params)=>prepare(id,input,params).args,
 inputLabel:[1916,2127].includes(id)?bi(`${id===1916?'prevRoom':'favorite'} · tối đa 100000 nút · hình đầy đủ ≤14`,`${id===1916?'prevRoom':'favorite'} · up to 100000 nodes · full picture ≤14`):id===115?bi('s · tối đa 32 chữ cái','s · up to 32 English letters'):base.inputLabel,
 visualizationLimits:{completeSmallTrace:true,maxTraceEvents:[3117,115].includes(id)?800:1600}};}
module.exports=result;
