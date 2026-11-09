'use strict';
const base=require('./monotonic-stack'),{runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en}),copy=x=>JSON.parse(JSON.stringify(x));
const CODES={3430:`class Solution:
    def minMaxSubarraySum(self, nums, k):
        def contribution(is_min):
            total = 0
            stack = []
            for right in range(len(nums) + 1):
                current = nums[right] if right < len(nums) else (-float('inf') if is_min else float('inf'))
                while stack and (nums[stack[-1]] >= current if is_min else nums[stack[-1]] <= current):
                    mid = stack.pop()
                    left = stack[-1] if stack else -1
                    a = min(mid - left, k)
                    b = min(right - mid, k)
                    excess = max(0, a + b - 1 - k)
                    count = a * b - excess * (excess + 1) // 2
                    value = nums[mid] * count
                    total += value
                if right < len(nums):
                    stack.append(right)
            return total
        minimum_sum = contribution(True)
        maximum_sum = contribution(False)
        return minimum_sum + maximum_sum`,
3359:base[3359].code.join('\n'),2945:base[2945].code.join('\n'),
1856:`class Solution:
    def maxSumMinProduct(self, nums):
        prefix = [0]
        for i, value in enumerate(nums):
            prefix.append(prefix[-1] + value)
        stack = []
        best = 0
        for right in range(len(nums) + 1):
            current = nums[right] if right < len(nums) else 0
            while stack and nums[stack[-1]] >= current:
                mid = stack.pop()
                left = stack[-1] if stack else -1
                window_sum = prefix[right] - prefix[left + 1]
                product = nums[mid] * window_sum
                best = max(best, product)
            if right < len(nums):
                stack.append(right)
        return best % 1000000007`,
975:`class Solution:
    def oddEvenJumps(self, arr):
        n = len(arr)
        def make_next(order):
            nxt = [-1] * n
            stack = []
            for i in order:
                while stack and stack[-1] < i:
                    j = stack.pop()
                    nxt[j] = i
                stack.append(i)
            return nxt
        odd_order = sorted(range(n), key=lambda i: (arr[i], i))
        odd_next = make_next(odd_order)
        even_order = sorted(range(n), key=lambda i: (-arr[i], i))
        even_next = make_next(even_order)
        odd = [False] * n
        even = [False] * n
        odd[-1] = True
        even[-1] = True
        for i in range(n - 2, -1, -1):
            odd[i] = odd_next[i] != -1 and even[odd_next[i]]
            even[i] = even_next[i] != -1 and odd[even_next[i]]
        return sum(odd)`};
const METHODS={3430:'minMaxSubarraySum',3359:'countSubmatrices',2945:'findMaximumLength',1856:'maxSumMinProduct',975:'oddEvenJumps'};
function array(input,min,max,limit){let a=input;try{if(typeof a==='string'){const s=a.trim();a=s.startsWith('[')?JSON.parse(s):s?s.split(',').map(t=>t.trim()?Number(t):NaN):[];}}catch{a=null;}
  if(!Array.isArray(a)||!a.length||a.length>limit||!Array.from(a).every(x=>Number.isInteger(x)&&x>=min&&x<=max))throw new RangeError(`Use 1–${limit} integers from ${min} to ${max}`);return [...a];}
function argsFor(id,input,params={}){
  if(!params||typeof params!=='object'||Array.isArray(params))throw new TypeError('Invalid parameters');
  if(id===3359){let g=input;try{if(typeof g==='string'){const s=g.trim();g=s.startsWith('[')?JSON.parse(s):s?s.split(/[;\n]/).map(row=>row.split(',').map(t=>t.trim()?Number(t):NaN)):[];}}catch{g=null;}
    if(!Array.isArray(g)||!g.length||g.length>6||!Array.from(g).every(row=>Array.isArray(row)&&row.length>0&&row.length<=6&&row.length===g[0].length&&Array.from(row).every(x=>Number.isInteger(x)&&x>=0&&x<=1e9)))throw new RangeError('Use a rectangular 1–6 × 1–6 grid with values 0…10⁹');
    const k=params.k===undefined?3:params.k;if(!Number.isInteger(k)||k<1||k>1e9)throw new RangeError('k must be an integer from 1 to 10⁹');return [g.map(row=>[...row]),k];}
  const a=id===3430?array(input,-1e6,1e6,12):id===2945?array(input,1,1e5,12):id===1856?array(input,1,1e7,14):array(input,0,1e5,14);
  if(id!==3430)return [a];const k=params.k===undefined?2:params.k;if(!Number.isInteger(k)||k<1||k>a.length)throw new RangeError('k must satisfy 1 ≤ k ≤ nums.length');return [a,k];
}
function payload(id,input,params){return {code:CODES[id],method:METHODS[id],args:argsFor(id,input,params)};}
function partition(parent,prefix,end){const out=[];for(let i=end;i>0;){const j=parent?.[i];if(!Number.isInteger(j)||j<0||j>=i)return [];out.push({start:j,end:i-1,sum:prefix[i]-prefix[j]});i=j;}return out.reverse();}
function build(id,input,params){
  const request=payload(id,input,params),model=request.args[0],code=CODES[id].split('\n'),native=runTrace(request),ledger=[],visits=[],readyOdd=[],readyEven=[],readyParent=new Set([0]),totals={min:null,max:null};
  let current=null,phase=null,scratch={},range=null,bestWitness=null,comparison=null,previous=null,prefixDone=0;
  const steps=native.events.map((e,step)=>{
    const x=e.locals,root=e.outer,text=code[e.line-1].trim();let change=null;
    if(id===3430){
      if(x.is_min!==undefined){const next=x.is_min?'min':'max';if(phase!==next){phase=next;scratch={};current=null;range=null;comparison=null;}}
      if(text==='total = 0')totals[phase]=0;
      if(text==='for right in range(len(nums) + 1):'&&e.branch){current=x.right;scratch={};range=null;comparison=null;}
      if(text.startsWith('while stack and (nums[')){const top=x.stack.at(-1);comparison={left:top===undefined?null:model[top],right:x.current,op:x.is_min?'≥':'≤',pass:e.branch};}
      if(text==='mid = stack.pop()'){scratch={mid:x.mid};change={kind:'pop',index:x.mid};}
      if(text==='left = stack[-1] if stack else -1'){scratch.left=x.left;scratch.right=x.right;range=[x.left+1,x.right-1];}
      for(const name of ['a','b','excess','count','value'])if(text.startsWith(name+' = '))scratch[name]=x[name];
      if(text==='total += value'){const row={phase,...copy(scratch),total:x.total,step};ledger.push(row);totals[phase]=x.total;change={kind:'write',index:x.mid};}
    }
    if(id===1856){
      if(text==='for i, value in enumerate(nums):'&&e.branch){phase='prefix';current=x.i;}
      if(text==='prefix.append(prefix[-1] + value)'){prefixDone=x.prefix.length-1;change={kind:'prefix',index:x.i+1};}
      if(text==='for right in range(len(nums) + 1):'&&e.branch){phase='scan';current=x.right;scratch={};range=null;comparison=null;}
      if(text==='while stack and nums[stack[-1]] >= current:'){const top=x.stack.at(-1);comparison={left:top===undefined?null:model[top],right:x.current,op:'≥',pass:e.branch};}
      if(text==='mid = stack.pop()'){scratch={mid:x.mid};change={kind:'pop',index:x.mid};}
      if(text==='left = stack[-1] if stack else -1'){scratch.left=x.left;scratch.right=x.right;range=[x.left+1,x.right-1];}
      if(text==='window_sum = prefix[right] - prefix[left + 1]')scratch.sum=x.window_sum;
      if(text==='product = nums[mid] * window_sum')scratch.product=x.product;
      if(text==='best = max(best, product)'){const row={...copy(scratch),best:x.best,step};ledger.push(row);if(!bestWitness||x.product>bestWitness.product)bestWitness=row;change={kind:'write',index:x.mid,before:previous.locals.best,after:x.best};}
    }
    if(id===3359){
      if(text==='for j in range(n):'&&e.branch){current=[x.i,x.j];scratch={};range=null;comparison=null;}
      if(text==='stacks[j] = [(0, i, 0)]')change={kind:'reset',cell:[x.i,x.j]};
      if(text==='dp[i][j] = 1'||text==='dp[i][j] += dp[i][j - 1]')change={kind:'width',cell:[x.i,x.j]};
      if(text==='while width < stacks[j][-1][0]:')comparison={left:x.width,right:x.stacks[x.j].at(-1)[0],op:'<',pass:e.branch};
      if(text==='stacks[j].pop()')change={kind:'pop',cell:[x.i,x.j]};
      for(const name of ['width','height','add'])if(text.startsWith(name+' = '))scratch[name]=x[name];
      if(text==='ans += add'){const row={cell:[x.i,x.j],...copy(scratch),total:x.ans,step};ledger.push(row);change={kind:'write',cell:row.cell};}
    }
    if(id===2945){
      if(text==='for i, value in enumerate(nums, 1):'&&e.branch){phase='prefix';current=x.i-1;}
      if(text==='prefix[i] = prefix[i - 1] + value'){prefixDone=x.i;change={kind:'prefix',index:x.i};}
      if(text==='q = deque([0])'){phase='dp';current=null;}
      if(text==='for i in range(1, n + 1):'&&e.branch){current=x.i-1;scratch={};range=null;comparison=null;}
      if(text==='while len(q) > 1 and need[q[1]] <= prefix[i]:')comparison={left:x.q.length>1?x.need[x.q[1]]:null,right:x.prefix[x.i],op:'≤',pass:e.branch};
      if(text==='q.popleft()')change={kind:'pop-front'};
      if(text==='q.pop()')change={kind:'pop-back'};
      if(text==='j = q[0]'){scratch.j=x.j;range=[x.j,x.i-1];}
      if(text==='while q and need[q[-1]] >= need[i]:')comparison={left:x.q.length?x.need[x.q.at(-1)]:null,right:x.need[x.i],op:'≥',pass:e.branch};
      if(text==='parent[i] = j'){readyParent.add(x.i);const row={index:x.i,parent:x.j,dp:x.dp[x.i],last:x.last[x.i],need:x.need[x.i],step};ledger.push(row);change={kind:'write',index:x.i};}
      if(text==='q.append(i)')change={kind:'push',index:x.i};
    }
    if(id===975){
      if(text.startsWith('odd_order =')){phase='odd';current=null;}
      if(text.startsWith('even_order =')){phase='even';current=null;}
      if(text==='nxt = [-1] * n'){scratch={};current=null;comparison=null;}
      if(text==='for i in order:'&&e.branch){current=x.i;scratch={};comparison=null;}
      if(text==='while stack and stack[-1] < i:')comparison={left:x.stack.at(-1)??null,right:x.i,op:'<',pass:e.branch};
      if(text==='j = stack.pop()'){scratch={held:x.j};change={kind:'pop',index:x.j};}
      if(text==='nxt[j] = i'){const row={phase,from:x.j,to:x.i,step};ledger.push(row);scratch.edge=row;change={kind:'write',index:x.j};}
      if(text==='odd = [False] * n'){phase='dp';current=null;}
      if(text==='for i in range(n - 2, -1, -1):'&&e.branch){current=x.i;scratch={};}
      if(text==='odd[-1] = True'){readyOdd.push(model.length-1);change={kind:'dp',index:model.length-1,parity:'odd'};}
      if(text==='even[-1] = True'){readyEven.push(model.length-1);change={kind:'dp',index:model.length-1,parity:'even'};}
      if(text.startsWith('odd[i] =')){readyOdd.push(x.i);change={kind:'dp',index:x.i,parity:'odd'};}
      if(text.startsWith('even[i] =')){readyEven.push(x.i);change={kind:'dp',index:x.i,parity:'even'};}
    }
    if(text.startsWith('stack.append('))change=change??{kind:'push',index:current};
    if(change&&['pop','write','dp','prefix','width','reset','push','pop-front','pop-back'].includes(change.kind))visits.push({step,kind:change.kind,index:current});
    const final=e.returning&&e.scope===METHODS[id];
    const end=id===2945?(final?model.length:phase==='dp'?x.i:null):null;
    const parts=id===2945&&end!==null&&readyParent.has(end)?partition(x.parent,x.prefix,end):[];
    let jumpPath=null;
    if(id===975&&root.odd_next&&root.even_next){const start=final?[...readyOdd].sort((a,b)=>a-b).find(i=>root.odd?.[i]):current;if(start!==null&&start!==undefined&&readyOdd.includes(start)){const nodes=[start],edges=[];let i=start,parity='odd';while(i!==model.length-1){const to=(parity==='odd'?root.odd_next:root.even_next)[i];if(to===-1)break;edges.push({from:i,to,phase:parity});nodes.push(to);i=to;parity=parity==='odd'?'even':'odd';}jumpPath={nodes,edges,success:i===model.length-1};}}
    const v={id,model,k:request.args[1]??null,phase,current:final?null:copy(current),range:final&&id===1856&&bestWitness?[bestWitness.left+1,bestWitness.right-1]:copy(range),scratch:copy(scratch),comparison:copy(comparison),change,ledger:copy(ledger),visits:copy(visits),totals:copy(totals),bestWitness:copy(bestWitness),prefixDone,parts,readyOdd:[...readyOdd],readyEven:[...readyEven],jumpPath,
      source:{line:e.line,text,timing:'after'},locals:x,outer:root,frames:e.frames,scope:e.scope,branch:e.branch,returning:e.returning,returned:e.returned,trace:native.trace,result:final?native.answer:null};
    previous=v;return {arr:[],codeBlock:1,codeLines:[e.line],final,title:bi(`L${e.line} · ${text}`,`L${e.line} · ${text}`),note:bi('',''),vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),advancedStackView:v};
  });return {original:id===3359?model.flat():model,answer:native.answer,steps};
}
const labels={3430:['nums · 1–12 số, −10⁶…10⁶','nums · 1–12 integers, −10⁶…10⁶'],3359:['grid · tối đa 6×6, 0…10⁹','grid · up to 6×6, 0…10⁹'],2945:['nums · 1–12 số dương, tối đa 100000','nums · 1–12 positive integers, up to 100000'],1856:['nums · 1–14 số dương, tối đa 10⁷','nums · 1–14 positive integers, up to 10⁷'],975:['arr · 1–14 số, 0…100000','arr · 1–14 integers, 0…100000']};
const out=Object.fromEntries(Object.keys(CODES).map(Number).map(id=>[id,{...base[id],code:CODES[id].split('\n'),debugMode:'line-by-line',inputLabel:bi(...labels[id]),builder:(input,params)=>build(id,input,params),liveArgs:(input,params)=>argsFor(id,input,params),tracePayload:(input,params)=>payload(id,input,params),visualizationLimits:{...(id===3359?{maxRows:6,maxCols:6}:{maxValues:[3430,2945].includes(id)?12:14}),completeTrace:true}}]));
const hopping=require('./stack-jump-grid-pictures')[3221];
out[3205]={...base[3205],code:hopping.code,debugMode:'line-by-line',inputLabel:bi('nums · 2–14 số, 1…100000','nums · 2–14 integers, 1…100000'),liveArgs:hopping.liveArgs,
  tracePayload:input=>({code:hopping.code.join('\n'),method:'maxScore',args:hopping.liveArgs(input)}),
  builder:input=>{const r=hopping.builder(input);for(const s of r.steps)s.stackJumpGridView.displayId=3205;return r;},visualizationLimits:{maxValues:14,completeTrace:true}};
module.exports=out;
