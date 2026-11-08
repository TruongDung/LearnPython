'use strict';
const base=require('./monotonic-stack'),{runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en}),copy=v=>JSON.parse(JSON.stringify(v));
const CODES={
  2355:`from typing import List

class Solution:
    def maximumBooks(self, books: List[int]) -> int:
        n = len(books)
        dp = [0] * n
        stack = []
        answer = 0
        for i, limit in enumerate(books):
            while stack and books[stack[-1]] - stack[-1] >= limit - i:
                popped = stack.pop()
            previous = stack[-1] if stack else -1
            length = min(limit, i - previous)
            first = limit - length + 1
            block_sum = (first + limit) * length // 2
            prefix_sum = dp[previous] if previous != -1 else 0
            dp[i] = prefix_sum + block_sum
            answer = max(answer, dp[i])
            stack.append(i)
        return answer`,
  2454:`from typing import List

class Solution:
    def secondGreaterElement(self, nums: List[int]) -> List[int]:
        answer = [-1] * len(nums)
        first = []
        second = []
        for i, value in enumerate(nums):
            while second and nums[second[-1]] < value:
                index = second.pop()
                answer[index] = value
            moved = []
            while first and nums[first[-1]] < value:
                index = first.pop()
                moved.append(index)
            while moved:
                index = moved.pop()
                second.append(index)
            first.append(i)
        return answer`,
  2487:`from typing import Optional

class Solution:
    def removeNodes(self, head: Optional[ListNode]) -> Optional[ListNode]:
        stack = []
        current = head
        while current:
            while stack and stack[-1].val < current.val:
                removed = stack.pop()
            if stack:
                stack[-1].next = current
            stack.append(current)
            current = current.next
        return stack[0] if stack else None`,
};
function parse(input,id){
  let values=input;try{if(typeof values==='string'){const raw=values.trim();values=raw.startsWith('[')?JSON.parse(raw):raw?raw.split(',').map(t=>t.trim()?Number(t):NaN):[];}}catch{values=null;}
  const low=id===2487?1:0,high=id===2454?1e9:100000;
  if(!Array.isArray(values)||!values.length||values.length>14||!Array.from(values).every(v=>Number.isInteger(v)&&v>=low&&v<=high))throw new RangeError(`#${id}: 1–14 integers from ${low} to ${high}`);
  return [...values];
}
const nodeIndex=node=>node?Number(node.id.split(':').at(-1)):null;
function listResult(head,nodes){
  const map=new Map(nodes.map(n=>[n.id,n])),seen=new Set(),ids=[],values=[];
  for(let node=head;node;node=map.get(node.next)){
    if(seen.has(node.id))throw new Error('Unexpected cycle in the returned linked list');
    seen.add(node.id);ids.push(nodeIndex(node));values.push(node.val);
    if(node.next!==null&&!map.has(node.next))throw new Error('Missing node in the returned linked list');
  }
  return {ids,values};
}
function build(id,input){
  const values=parse(input,id),code=CODES[id].split('\n'),method={2355:'maximumBooks',2454:'secondGreaterElement',2487:'removeNodes'}[id];
  const trace=runTrace({code:CODES[id],method,args:[values],...(id===2487?{linkedArgs:[0],captureLinked:true}:{})});
  const plans={},knownDp=[],ledger=[],firstGreater=new Map(),resolved=new Map(),removed=new Set();
  let current=null,comparison=null,popped=null,held=null,scratch={},bestEnd=null,previous=null;
  const result=id===2487?listResult(trace.answer,trace.events.at(-1).linked):{values:trace.answer,ids:[]};
  const steps=trace.events.map((r,step)=>{
    const x=r.locals,text=code[r.line-1].trim(),final=r.returning;
    let change=null;
    if(id!==2487&&text.startsWith('for i, ')&&r.branch){current=x.i;comparison=null;popped=null;held=null;scratch={};}
    if(id===2487)current=nodeIndex(x.current);
    if(id===2355){
      if(text==='while stack and books[stack[-1]] - stack[-1] >= limit - i:'){
        const top=x.stack.at(-1);comparison={kind:'books',top:top??null,left:top===undefined?null:values[top]-top,right:x.limit-x.i,op:'≥',pass:r.branch,line:r.line};popped=null;
      }
      if(text==='popped = stack.pop()'){popped=x.popped;change={kind:'pop',index:x.popped};}
      if(/^(previous|length|first|block_sum|prefix_sum) = /.test(text)){const name=text.split(' = ')[0];scratch[name]=x[name];}
      if(text==='dp[i] = prefix_sum + block_sum'){
        const prefix=x.previous>=0?plans[x.previous]:[],start=x.i-x.length+1;
        plans[x.i]=[...prefix,...Array.from({length:x.length},(_,offset)=>({index:start+offset,take:x.first+offset,owner:x.i}))];
        knownDp.push(x.i);ledger.push({i:x.i,step,previous:x.previous,length:x.length,first:x.first,last:x.limit,blockSum:x.block_sum,prefixSum:x.prefix_sum,total:x.dp[x.i],plan:copy(plans[x.i])});
        change={kind:'dp',index:x.i,value:x.dp[x.i]};
      }
      if(text==='answer = max(answer, dp[i])'){
        if(x.answer>(previous?.locals.answer??0))bestEnd=x.i;
        change={kind:'best',index:x.i,before:previous?.locals.answer??0,after:x.answer};
      }
      if(text==='stack.append(i)')change={kind:'push',index:x.i};
    }
    if(id===2454){
      if(text.startsWith('while second and')||text.startsWith('while first and')){
        const name=text.startsWith('while second')?'second':'first',top=x[name].at(-1);
        comparison={kind:name,top:top??null,left:top===undefined?null:values[top],right:x.value,op:'<',pass:r.branch,line:r.line};
      }
      if(text==='index = second.pop()'){held={index:x.index,kind:'answer'};change={kind:'pop-second',index:x.index};}
      if(text==='answer[index] = value'){
        const row={index:x.index,first:firstGreater.get(x.index).first,second:x.i,value:x.value,step};resolved.set(x.index,row);ledger.push(row);held=null;change={kind:'answer',index:x.index,value:x.value};
      }
      if(text==='index = first.pop()'){
        held={index:x.index,kind:'first'};firstGreater.set(x.index,{index:x.index,first:x.i,step});change={kind:'first',index:x.index,to:x.i};
      }
      if(text==='moved.append(index)'){held=null;change={kind:'buffer',index:x.index};}
      if(text==='index = moved.pop()'){held={index:x.index,kind:'transfer'};change={kind:'pop-buffer',index:x.index};}
      if(text==='second.append(index)'){held=null;change={kind:'transfer',index:x.index};}
      if(text==='first.append(i)')change={kind:'push',index:x.i};
    }
    if(id===2487){
      if(text==='while stack and stack[-1].val < current.val:'){
        const top=x.stack.at(-1);comparison={kind:'list',top:nodeIndex(top),left:top?.val??null,right:x.current.val,op:'<',pass:r.branch,line:r.line};
      }
      if(text==='removed = stack.pop()'){
        const index=nodeIndex(x.removed),killer=nodeIndex(x.current);removed.add(index);popped=index;
        ledger.push({index,killer,value:x.removed.val,greater:x.current.val,step});change={kind:'remove',index,killer};
      }
      if(text==='stack[-1].next = current'){
        const from=nodeIndex(x.stack.at(-1)),before=previous.linked.find(n=>nodeIndex(n)===from).next;
        change={kind:'link',from,before,to:nodeIndex(x.current)};
      }
      if(text==='stack.append(current)')change={kind:'push',index:nodeIndex(x.current)};
    }
    if(final)current=null;
    const view={id,values,current,scratch:copy(scratch),comparison:copy(comparison),popped,held:copy(held),plans:copy(plans),knownDp:[...knownDp],bestEnd,ledger:copy(ledger),
      firstGreater:copy([...firstGreater.values()]),resolved:copy([...resolved.values()]),removed:[...removed],linked:r.linked??null,
      source:{line:r.line,text,timing:'after'},change,locals:x,outer:r.outer,frames:r.frames,scope:r.scope,branch:r.branch,returning:r.returning,returned:r.returned,trace:trace.trace,
      result:final?result.values:null,resultIds:final?result.ids:null};
    previous=view;
    return {arr:[],codeBlock:1,codeLines:[r.line],final,title:bi(`L${r.line} · ${text}`,`L${r.line} · ${text}`),note:bi('',''),vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),stackSequenceView:view};
  });
  return {original:values,answer:result.values,steps};
}
const summaries={2355:bi('Chọn các kệ liên tiếp và lấy số sách dương tăng nghiêm ngặt từ trái sang phải. Tối đa tổng sách lấy được.','Choose consecutive shelves and take positive, strictly increasing counts from left to right. Maximize the total.'),
  2454:bi('Với mỗi số, tìm lần xuất hiện thứ hai ở bên phải có giá trị lớn hơn nó. Không có thì trả −1.','For each number, find the second position to its right with a larger value. Return −1 if none exists.'),
  2487:bi('Loại nút nếu có một nút lớn hơn ở bất kỳ vị trí nào bên phải. Nối lại các nút còn giữ.','Remove a node if any larger node lies to its right. Reconnect the retained nodes.')};
module.exports=Object.fromEntries([2355,2454,2487].map(id=>[id,{
  ...base[id],code:CODES[id].split('\n'),debugMode:'line-by-line',inputKind:'string',
  statement:summaries[id],inputLabel:bi(id===2355?'books · 1–14 số từ 0 đến 100000':id===2454?'nums · 1–14 số từ 0 đến 10⁹':'head · 1–14 nút, giá trị 1–100000',id===2355?'books · 1–14 values from 0 to 100000':id===2454?'nums · 1–14 values from 0 to 10⁹':'head · 1–14 nodes, values 1–100000'),
  approach:[bi(id===2355?'Stack theo books[i] − i. Ghép dp[previous] với một cấp số cộng.':id===2454?'Giải stack chờ lần 2 trước; sau đó chuyển các nút vừa gặp lần 1 qua bộ đệm.':'Stack giữ các nút chưa bị nút mới lớn hơn loại. Mỗi phép nối next được phát lại thật.',
    id===2355?'Stack by books[i] − i. Join dp[previous] with an arithmetic progression.':id===2454?'Resolve second waits first; transfer newly resolved first waits through a buffer.':'The stack retains nodes not yet removed by a larger node. Replay every actual next assignment.')],
  complexity:{time:'O(n)',space:'O(n)',note:bi('Mỗi phần tử vào / ra mỗi stack tối đa một lần.','Each item enters and leaves each stack at most once.')},
  visualizationLimits:{maxValues:14,completeTrace:true},builder:input=>build(id,input),
  liveArgs:input=>id===2487?[{__viz_type:'linked_list',values:parse(input,id)}]:[parse(input,id)],
}]));
