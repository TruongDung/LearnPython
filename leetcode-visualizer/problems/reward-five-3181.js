'use strict';
const {runTrace}=require('./wasm-picture-trace');
const base=require('./maximum-total-reward-3181')[3181],bi=(vi,en)=>({vi,en});
const DFS=`class Solution:
    def maxTotalReward(self, rewardValues):
        rewards = sorted(set(rewardValues))
        n = len(rewards)

        def dfs(index, total):
            if index == n:
                return total

            skip = dfs(index + 1, total)
            take = total
            if total < rewards[index]:
                take = dfs(index + 1, total + rewards[index])

            return max(skip, take)

        return dfs(0, 0)`;
const CODES={1:DFS.split('\n'),2:('from functools import lru_cache\n\n'+DFS.replace('        def dfs(', '        @lru_cache(None)\n        def dfs(')).split('\n'),
3:`class Solution:
    def maxTotalReward(self, rewardValues):
        rewards = sorted(set(rewardValues))
        rows, cols = len(rewards) + 1, 2 * max(rewards)
        dp = [[False] * cols for _ in range(rows)]
        dp[0][0] = True
        for row in range(1, rows):
            reward = rewards[row-1]
            for total in range(cols):
                skip = dp[row-1][total]
                take = False
                if reward <= total < 2 * reward:
                    take = dp[row-1][total-reward]
                dp[row][total] = skip or take
        return max(total for total in range(cols) if dp[rows-1][total])`.split('\n'),
4:`class Solution:
    def maxTotalReward(self, rewardValues):
        rewards = sorted(set(rewardValues))
        M = 2 * max(rewards)
        dp = [False] * M
        dp[0] = True
        for reward in rewards:
            for total in range(reward - 1, -1, -1):
                if dp[total]:
                    dp[total + reward] = True
        return max(total for total in range(M) if dp[total])`.split('\n'),
5:[...base.code]};
const LABELS={1:bi('1. Brute Force DFS','1. Brute Force DFS'),2:bi('2. DFS + Memoization','2. DFS + Memoization'),3:bi('3. Bottom-Up DP 2D','3. Bottom-Up DP 2D'),4:bi('4. Bottom-Up DP 1D','4. Bottom-Up DP 1D'),5:bi('5. Bitset DP','5. Bitset DP')};
function parse(input){if(!Array.isArray(input)||!input.length||input.length>8||input.some(n=>!Number.isSafeInteger(n)||n<1||n>12))throw Error('3181: visualization dùng 1–8 phần thưởng, giá trị 1–12 / use 1–8 rewards in 1–12.');return [...input];}
function witness(rewards,target){const paths=new Map([[0,[]]]);for(const reward of rewards)for(const [total,path] of [...paths])if(total<reward&&!paths.has(total+reward))paths.set(total+reward,[...path,reward]);return paths.get(target)??[];}
function build(method,input){
 const original=parse(input),code=CODES[method],rewards=[...new Set(original)].sort((a,b)=>a-b),M=2*Math.max(...rewards),n=rewards.length;
 const trace=runTrace({code:code.join('\n'),method:'maxTotalReward',args:[original],...(method<=2?{traceCalls:['dfs']}:{} )});
 const memo=Array.from({length:n+1},()=>Array(M).fill(null)),cache=new Map(),calls=new Map();let cacheHits=0,current=null,skipRead=false,takeRead=false,beforeBits=null,eligible=null,shifted=null;
 const skipLine=code.findIndex(line=>line.includes('skip = dfs('))+1,takeLine=code.findIndex(line=>line.includes('take = dfs('))+1,rootLine=code.findIndex(line=>line.includes('return dfs(0, 0)'))+1;
 const steps=trace.events.map((event,index)=>{
  const x=event.locals,line=event.line,text=code[line-1].trim(),final=index===trace.events.length-1,frames=event.frames.filter(frame=>frame.name==='dfs');
  const stack=frames.map((frame,i)=>({index:frame.locals.index,total:frame.locals.total,line:frame.line,status:i===frames.length-1?'active':'waiting'}));
  let phase='inspect',pending=null,received=null,cacheHit=null,active=null,neighbors=[],result=null;
  if(method<=2){
   if(event.scope==='dfs'){
    active=[x.index,x.total];const key=frames.map(f=>f.locals.index+','+f.locals.total).join('/');
    if(!calls.has(key))calls.set(key,{index:x.index,total:x.total,depth:frames.length-1,step:index,value:null});
    if(event.returning){calls.get(key).value=event.returned;if(method===2){memo[x.index][x.total]=event.returned;cache.set(active.join(':'),event.returned);}phase='return';result=event.returned;}
   }
   if(event.event==='call'){
    const target=line===rootLine?[0,0]:[x.index+1,x.total+(line===takeLine?rewards[x.index]:0)];pending={cell:target,kind:line===skipLine?'skip':line===takeLine?'take':'root',cached:method===2&&cache.has(target.join(':'))};phase='call';
   }else if(event.scope==='dfs'&&(line===skipLine||line===takeLine)){
    const target=[x.index+1,x.total+(line===takeLine?rewards[x.index]:0)],previous=trace.events[index-1],value=line===skipLine?x.skip:x.take;
    const expanded=previous?.returning&&previous.scope==='dfs'&&previous.locals.index===target[0]&&previous.locals.total===target[1];
    received={cell:target,kind:line===skipLine?'skip':'take',value};phase='receive';
    if(!expanded){if(method!==2||cache.get(target.join(':'))!==value)throw Error('3181: cache differs from Python.');cacheHits++;cacheHit={cell:target,value};phase='cache-hit';}
   }
  }else if(method===3){
   if(text.startsWith('for row in '))current=null;
   if(text.startsWith('for total in ')){current=event.branch?[x.row,x.total]:null;skipRead=false;takeRead=false;}
   active=current?[...current]:null;if(text==='dp[0][0] = True'){active=[0,0];phase='base';}
   if(text.startsWith('skip = ')){skipRead=true;phase='read-skip';}if(text.startsWith('take = ')){takeRead=true;phase='read-take';}
   if(text.startsWith('dp[row][total] = ')){phase='write';result=x.dp[x.row][x.total];}
   if(active&&active[0]>0){const [row,total]=active,r=rewards[row-1];neighbors=[{role:'skip',cell:[row-1,total],value:x.dp[row-1][total]}];if(r<=total&&total<2*r)neighbors.push({role:'take',cell:[row-1,total-r],value:x.dp[row-1][total-r]});}
  }else if(method===4){
   if(Number.isInteger(x.total))active=[0,x.total];if(text==='dp[0] = True'){active=[0,0];phase='base';}
   if(text==='dp[total + reward] = True'){active=[0,x.total+x.reward];neighbors=[{role:'take',cell:[0,x.total],value:x.dp[x.total]}];phase='write';result=true;}
  }else{
   if(text==='bits = 1'){beforeBits=0;phase='base';}
   if(text==='for reward in rewards:'&&event.branch){beforeBits=x.bits;eligible=null;shifted=null;phase='reward';}
   if(text.startsWith('eligible = ')){eligible=x.eligible;phase='mask';}
   if(text.startsWith('shifted = ')){shifted=x.shifted;phase='shift';}
   if(text==='bits |= shifted')phase='merge';
  }
  if(final)phase='result';
  const reward=method<=2&&active&&active[0]<n?rewards[active[0]]:x.reward??null;
  const view={id:3181,method,original,rewards,n,M,line,source:text,phase,active,neighbors,reward,stack,pending,received,cacheHit,cacheHits,
   calls:[...calls.values()].map(call=>({...call})),memo:method===2?memo.map(row=>[...row]):null,dp:method===3||method===4?x.dp??null:null,
   skip:method===3?current&&skipRead?x.skip:null:x.skip??null,take:method===3?current&&takeRead?x.take:null:x.take??null,result,
   beforeBits,eligible,shifted,bits:method===5?x.bits??null:null,trace:trace.trace,execution:{event:event.event??(event.returning?'return':'statement'),timing:event.timing??'after'},final,answer:final?trace.answer:null,witness:final?witness(rewards,trace.answer):[]};
  return {arr:[],codeBlock:method,codeLines:[line],title:bi(text,text),note:bi('',''),final,vars:['index','total','reward','skip','take','n','M','rows','cols','eligible','shifted','bits'].filter(name=>x[name]!==undefined).map(name=>({name,value:x[name]})),rewardFive3181View:view};
 });return {original,answer:trace.answer,steps};
}
const note=bi('n là số giá trị khác nhau, M = 2 × max(reward). Các cách đều sắp xếp và bỏ trùng: O(n log n), O(n) bộ nhớ phụ. Dấu * của bitset chỉ tính phần DP theo word máy w bit; Python dùng số nguyên nhiều word. Visualization: ≤8 số, mỗi số ≤12.','n is the number of distinct rewards; M = 2 × max(reward). All methods sort and deduplicate: O(n log n) time and O(n) extra storage. Bitset * measures only DP in w-bit machine words; Python uses multiword integers. Visualization: up to 8 values, each ≤12.');
const complexities={1:{time:'O(2ⁿ)',space:'O(n)',note},2:{time:'O(nM)',space:'O(nM)',note},3:{time:'O(nM)',space:'O(nM)',note},4:{time:'O(nM)',space:'O(M)',note},5:{time:'O(nM / w)*',space:'O(M / w)*',note}};
const problem={...base,extraParams:[{key:'approach',type:'select',default:5,label:bi('Cách giải','Approach'),options:Object.keys(LABELS).map(key=>({value:Number(key),label:LABELS[key]}))}],inputLabel:bi('rewardValues · 1–8 số · mỗi số 1–12','rewardValues · 1–8 values · each 1–12'),
 approach:[bi('Chỉ được lấy r khi total < r. Sau khi lấy r, các phần thưởng tiếp theo bắt buộc lớn hơn r, nên sắp xếp và bỏ trùng không làm mất lời giải.','Take r only when total < r. After taking r, any later reward must exceed r, so sorting and removing duplicates preserves every valid choice.'),bi('1: thử bỏ/lấy. 2: cache dfs(index,total). 3: bảng prefix × total. 4: giữ một hàng DP. 5: mask → shift → OR.','1: try skip/take. 2: cache dfs(index,total). 3: prefix × total table. 4: retain one DP row. 5: mask → shift → OR.')],liveArgs:input=>[parse(input)]};
for(let method=1;method<=5;method++){const suffix=method===1?'':method;problem['code'+suffix]=CODES[method];problem['code'+suffix+'Label']=LABELS[method];problem['builder'+suffix]=input=>build(method,input);problem['complexity'+suffix]=complexities[method];}
module.exports={3181:problem};
