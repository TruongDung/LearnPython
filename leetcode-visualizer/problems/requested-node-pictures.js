'use strict';
const {runTrace}=require('./wasm-picture-trace');
const bst=require('./bst'),bi=(vi,en)=>({vi,en}),copy=x=>structuredClone(x);
const lines=s=>s.split('\n');
const sources={
98:lines(`class Solution:
    def isValidBST(self, root):
        def validate(node, lo, hi):
            if node is None:
                return True
            if not lo < node.val < hi:
                return False
            left = validate(node.left, lo, node.val)
            if not left:
                return False
            return validate(node.right, node.val, hi)
        return validate(root, float('-inf'), float('inf'))`),
230:bst[230].code,
2302:lines(`class Solution:
    def kthSmallest(self, root, k):
        self.count = 0
        self.answer = None
        def inorder(node):
            if node is None or self.answer is not None:
                return
            inorder(node.left)
            if self.answer is not None:
                return
            self.count += 1
            if self.count == k:
                self.answer = node.val
                return
            inorder(node.right)
        inorder(root)
        return self.answer`),
1448:lines(`class Solution:
    def goodNodes(self, root):
        def dfs(node, maximum):
            if node is None:
                return 0
            good = int(node.val >= maximum)
            maximum = max(maximum, node.val)
            left = dfs(node.left, maximum)
            right = dfs(node.right, maximum)
            return good + left + right
        return dfs(root, float('-inf'))`),
2098:lines(`class Solution:
    def largestEvenSum(self, nums, k):
        ranked = sorted(enumerate(nums), key=lambda pair: pair[1], reverse=True)
        chosen = ranked[:k]
        total = sum(value for _, value in chosen)
        if total % 2 == 0:
            return total
        best = -1
        for parity in (0, 1):
            remove = min((pair for pair in chosen if pair[1] % 2 == parity), key=lambda pair: pair[1], default=None)
            add = max((pair for pair in ranked[k:] if pair[1] % 2 != parity), key=lambda pair: pair[1], default=None)
            if remove is not None and add is not None:
                candidate = total - remove[1] + add[1]
                best = max(best, candidate)
        return best`),
952:lines(`class Solution:
    def largestComponentSize(self, nums):
        parent = list(range(len(nums)))
        size = [1] * len(nums)
        def find(a):
            while a != parent[a]:
                parent[a] = parent[parent[a]]
                a = parent[a]
            return a
        def union(a, b):
            a, b = find(a), find(b)
            if a == b:
                return
            if size[a] < size[b]:
                a, b = b, a
            parent[b] = a
            size[a] += size[b]
        owner = {}
        for i, value in enumerate(nums):
            remaining, divisor = value, 2
            factors = []
            while divisor * divisor <= remaining:
                if remaining % divisor == 0:
                    factors.append(divisor)
                    while remaining % divisor == 0:
                        remaining //= divisor
                divisor += 1
            if remaining > 1:
                factors.append(remaining)
            for factor in factors:
                if factor in owner:
                    union(i, owner[factor])
                owner[factor] = i
        return max(size)`)
};
function parseTree(input,id){
 let values=input;
 try{if(typeof input==='string'){const s=input.trim();values=!s?[]:s.startsWith('[')?JSON.parse(s):s.split(',').map(x=>['null','None'].includes(x.trim())?null:x.trim()?Number(x):NaN);}}catch{values=null;}
 if(!Array.isArray(values)||values.length>63||values.some(x=>x!==null&&(!Number.isInteger(x)||Math.abs(x)>2147483648)))throw Error(`${id}: use a level-order tree with up to 31 integer nodes or null.`);
 values=[...values];const nodes=values.length&&values[0]!==null?[{id:'0:0',value:values[0],parent:null,left:null,right:null,depth:0}]:[];let at=1;
 for(let head=0;head<nodes.length&&at<values.length;head++)for(const side of ['left','right']){if(at>=values.length)break;const value=values[at],nodeId=`0:${at++}`;if(value===null)continue;nodes[head][side]=nodeId;nodes.push({id:nodeId,value,parent:nodes[head].id,left:null,right:null,depth:nodes[head].depth+1});}
 if(nodes.length>31||values.slice(at).some(x=>x!==null))throw Error(`${id}: tree is oversized or has orphan nodes.`);
 if(id!==98&&!nodes.length)throw Error(`${id}: use a non-empty tree.`);
 const byId=new Map(nodes.map(x=>[x.id,x])),order=[];function walk(key){if(!key)return;const n=byId.get(key);walk(n.left);n.rank=order.length;order.push(n);walk(n.right);}walk(nodes[0]?.id);
 if(id===230&&order.some((n,i)=>i&&order[i-1].value>=n.value))throw Error('230: use a strict BST with unique values.');
 return {values,nodes,byId};
}
function parseNumbers(input,id){let nums=input;try{if(typeof input==='string')nums=input.trim().startsWith('[')?JSON.parse(input):input.split(',').map(s=>s.trim()?Number(s):NaN);}catch{nums=null;}
 if(!Array.isArray(nums)||!nums.length||nums.length>24||nums.some(x=>!Number.isInteger(x)||x<(id===952?1:0)||x>100000))throw Error(`${id}: use 1–24 ${id===952?'unique positive':'nonnegative'} integers, at most 100000.`);
 if(id===952&&new Set(nums).size!==nums.length)throw Error('952: values must be unique.');return [...nums];}
function argsFor(id,input,params={}){if([98,230,1448].includes(id)){const tree=parseTree(input,id),args=[tree.values];if(id===230){const k=Number(params.k??3);if(!Number.isInteger(k)||k<1||k>tree.nodes.length)throw Error('230: k must be in 1…number of nodes.');args.push(k);}return {...tree,args};}
 const nums=parseNumbers(input,id),args=[nums];if(id===2098){const k=Number(params.k??3);if(!Number.isInteger(k)||k<1||k>nums.length)throw Error('2098: k must be in 1…nums.length.');args.push(k);}return {nums,args};}
function build(id,input,params={},method=1){
 const data=argsFor(id,input,params),code=sources[id===230&&method===2?2302:id],name={98:'isValidBST',230:'kthSmallest',1448:'goodNodes',2098:'largestEvenSum',952:'largestComponentSize'}[id];
 const tree=Boolean(data.nodes),native=runTrace({code:code.join('\n'),method:name,args:data.args,...(tree?{treeArgs:[0],captureTrees:true}:{}),traceCalls:id===98?['validate']:id===1448?['dfs']:id===230&&method===2?['inorder']:id===952?['find','union']:[],stateClasses:['Solution']});
 const visited=[],checks=[],relations=[],swaps=[];let pendingSwap=null;
 const steps=native.events.map((e,index)=>{const x=e.locals,o=e.outer,text=code[e.line-1].trim(),after=e.timing!=='before',final=index===native.events.length-1;const active=tree?(x.node?.id??null):null;
  if(tree&&active&&after){if(id===230&&((method===1&&text==='k -= 1')||(method===2&&text==='self.count += 1')))visited.push({node:active,value:x.node.val,step:index});
   if(id===98&&text==='if not lo < node.val < hi:')checks.push({node:active,lo:x.lo,hi:x.hi,pass:!e.branch,step:index});
   if(id===1448&&text==='good = int(node.val >= maximum)')checks.push({node:active,maximum:x.maximum,pass:Boolean(x.good),step:index});}
  if(id===952&&after&&text==='owner[factor] = i')relations.push({index:x.i,factor:x.factor,step:index});
  if(id===2098&&after){if(text==='for parity in (0, 1):'&&e.branch)pendingSwap={parity:x.parity,remove:null,add:null,candidate:null,step:index};if(text.startsWith('remove ='))pendingSwap.remove=x.remove;if(text.startsWith('add ='))pendingSwap.add=x.add;if(text.startsWith('if remove is')){swaps.push({...pendingSwap,possible:Boolean(e.branch),step:index});}if(text.startsWith('candidate =')){swaps.at(-1).candidate=x.candidate;swaps.at(-1).step=index;}}
  const state=x.self??o.self??{},all={...o,...x};delete all.self;
  const view={id,method,...(tree?{nodes:data.nodes,active,k:data.args[1]??null,visited:copy(visited),checks:copy(checks)}:{nums:data.nums,k:data.args[1]??null,relations:copy(relations),swaps:copy(swaps),pendingSwap:copy(pendingSwap)}),locals:x,outer:o,state,all,frames:e.frames,branch:e.branch,scope:e.scope,returning:e.returning,returned:e.returned,source:{line:e.line,text,timing:e.timing??'after'},trace:native.trace,final,answer:final?native.answer:null};
  return {arr:[],codeBlock:method,codeLines:[e.line],final,title:bi(text,text),note:bi('',''),vars:Object.entries(x).filter(([key])=>key!=='self').map(([key,value])=>({name:key,value:typeof value==='object'?JSON.stringify(value):value})),requestedNodeView:view};
 });return {original:data.args[0],answer:native.answer,steps};
}
const meta=(id,title,slug,category,difficulty,statement,input)=>({id,title:bi(title,title),titleVi:bi(title,title),slug,category:{key:category,...({'binary-tree':bi('Cây nhị phân','Binary Tree'),greedy:bi('Tham lam','Greedy'),'union-find':bi('Union-Find','Union-Find')}[category]??bi(category,category))},difficulty,statement:bi(...statement),defaultInput:input,inputKind:typeof input==='string'?'string':'integer',extraParams:[],approach:[],code:sources[id],debugMode:'line-by-line'});
const result={};
for(const id of [98,230])result[id]={...bst[id],code:sources[id],debugMode:'line-by-line',statement:bi(id===98?'Mỗi nút phải nằm trong khoảng mở do các tổ tiên truyền xuống.':'Duyệt trái → nút → phải. Dừng khi thăm nút thứ k.',id===98?'Each node must stay inside the open bounds inherited from its ancestors.':'Traverse left → node → right. Stop at the kth visited node.'),approach:[bi(id===98?'lo < value < hi · Trái nhận hi mới, phải nhận lo mới.':'Chỉ tăng bộ đếm khi thăm nút; đi vào nhánh trái chưa phải một lượt đếm.',id===98?'lo < value < hi · A left child inherits a new hi; a right child a new lo.':'Increment only when visiting a node; descending left does not count.')],allowEmptyInput:id===98};
result[230].code2=sources[2302];result[230].complexity={time:'O(h + k)',space:'O(h)',note:bi('Stack chỉ giữ đường đang duyệt.','The stack holds the current traversal path.')};result[230].complexity2=result[230].complexity;
result[230].code2Label=bi('2. Đệ quy · count + dừng sớm','2. Recursive · count + early stop');
result[230].extraParams=bst[230].extraParams.map(p=>p.key==='approach'?{...p,options:[p.options[0],{value:'2',label:result[230].code2Label}]}:p);
result[1448]=meta(1448,'Count Good Nodes in Binary Tree','count-good-nodes-in-binary-tree','binary-tree','medium',['Nút tốt có giá trị ≥ mọi nút trước nó trên đường từ gốc.','A good node is at least as large as every earlier node on its root path.'],'3,1,4,3,null,1,5');
result[1448].complexity={time:'O(n)',space:'O(h)',note:bi('Truyền maximum riêng cho từng nhánh.','Pass a separate path maximum into each branch.')};
result[2098]=meta(2098,'Subsequence of Size K With the Largest Even Sum','subsequence-of-size-k-with-the-largest-even-sum','greedy','medium',['Chọn đúng k phần tử, giữ thứ tự ban đầu, sao cho tổng chẵn lớn nhất. Không có đáp án → −1.','Choose exactly k elements in original order with the largest even sum. Return −1 if impossible.'],[4,2,6,7,8]);result[2098].premium=true;
result[2098].extraParams=[{key:'k',label:bi('k','k'),default:3}];result[2098].complexity={time:'O(n log n)',space:'O(n)',note:bi('Chọn top k; nếu tổng lẻ, thử hai phép đổi khác parity.','Take the top k; if their sum is odd, try the two opposite-parity exchanges.')};
result[952]=meta(952,'Largest Component Size by Common Factor','largest-component-size-by-common-factor','union-find','hard',['Nối các số có thừa số chung > 1. Đếm nhóm liên thông lớn nhất.','Connect numbers sharing a factor > 1. Count the largest connected component.'],[4,6,15,35]);result[952].complexity={time:'O(n√M + n log M · α(n))',space:'O(n log M)',note:bi('M = max(nums). Mỗi thừa số nguyên tố chỉ cần một owner để nối nhóm.','M = max(nums). Keep one owner per prime factor to connect components.')};
for(const[idText,p]of Object.entries(result)){const id=Number(idText);p.inputLabel=bi([98,230,1448].includes(id)?'Cây level-order · tối đa 31 nút':'nums · 1–24 số · tối đa 100000',[98,230,1448].includes(id)?'Level-order tree · up to 31 nodes':'nums · 1–24 values · up to 100000');p.builder=(input,params={})=>build(id,input,params,id===230?(Number(params.approach)===2?2:1):1);if(id===230)p.builder2=(input,params={})=>build(id,input,params,2);p.liveArgs=(input,params={})=>{const d=argsFor(id,input,params);return d.nodes?[{__viz_type:'binary_tree',values:d.values,tree_id:'root'},...d.args.slice(1)]:d.args;};}
for(const[id,base]of[[359,require('./hashmap')[359]],[1055,require('./string')[1055]]]){result[id]={...base,extraParams:[...base.extraParams,{key:'approach',type:'select',default:'1',label:bi('Cách giải','Approach'),options:[{value:'1',label:base.codeLabel},{value:'2',label:base.code2Label}]}],statement:id===359?bi('Mỗi message được in lại sau ít nhất 10 giây. Lời gọi bị chặn không đổi mốc thời gian.','Each message can print again after at least 10 seconds. Suppressed calls do not reset its clock.'):bi('Ghép target bằng ít subsequence của source nhất. Giữ thứ tự ký tự trong mỗi lượt.','Form target using the fewest subsequences of source. Preserve character order within each sweep.'),approach:id===359?[bi('Map: t ≥ next_allowed → in và đặt mốc t + 10.','Map: t ≥ next_allowed → print and set the next mark to t + 10.'),bi('Queue + set: loại mục có timestamp ≤ t − 10 rồi xét message.','Queue + set: evict timestamps ≤ t − 10, then check the message.')]:[bi('Cách 1: quét source → nhặt ký tự khớp → hết source thì bắt đầu lượt mới.','Approach 1: scan source → take matching characters → start a new sweep at its end.'),bi('Cách 2: bảng nxt nhảy thẳng tới vị trí xuất hiện tiếp theo.','Approach 2: use nxt to jump directly to the next occurrence.')],complexity2:id===359?{time:'O(1) amortized / call',space:'O(W)',note:bi('W là số message đang trong cửa sổ 10 giây.','W is the number of messages in the current 10-second window.')}:{time:'O(26n + m)',space:'O(26n)',note:bi('n = source.length, m = target.length.','n = source.length, m = target.length.')}};}
module.exports=result;
