'use strict';
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en}),copy=v=>JSON.parse(JSON.stringify(v));
const BIT=`from bisect import bisect_left, bisect_right
from typing import List

class Fenwick:
    def __init__(self, size: int, name: str):
        self.name = name
        self.tree = [0] * (size + 1)

    def add(self, index: int, delta: int) -> None:
        while index < len(self.tree):
            self.tree[index] += delta
            index += index & -index

    def query(self, index: int) -> int:
        total = 0
        while index > 0:
            total += self.tree[index]
            index -= index & -index
        return total
`;
const MAX_BIT=`from bisect import bisect_left
from typing import List

class FenwickMax:
    def __init__(self, size: int, name: str):
        self.name = name
        self.tree = [(-1, -1)] * (size + 1)

    def add(self, index: int, value: tuple) -> None:
        while index < len(self.tree):
            self.tree[index] = max(self.tree[index], value)
            index += index & -index

    def query(self, index: int) -> tuple:
        best = (-1, -1)
        while index > 0:
            best = max(best, self.tree[index])
            index -= index & -index
        return best
`;
const SOURCES={
  2659:`${BIT}
class Solution:
    def countOperationsToEmptyArray(self, nums: List[int]) -> int:
        n = len(nums)
        bit = Fenwick(n, "alive")
        for i in range(n):
            bit.add(i + 1, 1)
        order = sorted(range(n), key=lambda i: nums[i])
        previous = 0
        answer = 0
        for index in order:
            if index >= previous:
                end_count = bit.query(index + 1)
                before_count = bit.query(previous)
                moves = end_count - before_count
            else:
                all_count = bit.query(n)
                before_count = bit.query(previous)
                end_count = bit.query(index + 1)
                moves = all_count - before_count + end_count
            answer += moves
            bit.add(index + 1, -1)
            previous = index
        return answer`,
  2907:`${MAX_BIT}
class Solution:
    def maxProfit(self, prices: List[int], profits: List[int]) -> int:
        n = len(prices)
        values = sorted(set(prices))
        left = [(-1, -1)] * n
        right = [(-1, -1)] * n
        left_bit = FenwickMax(len(values), "left")
        for j, price in enumerate(prices):
            rank = bisect_left(values, price) + 1
            left[j] = left_bit.query(rank - 1)
            left_bit.add(rank, (profits[j], j))
        right_bit = FenwickMax(len(values), "right")
        for j in range(n - 1, -1, -1):
            rank = len(values) - bisect_left(values, prices[j])
            right[j] = right_bit.query(rank - 1)
            right_bit.add(rank, (profits[j], j))
        answer = -1
        for j in range(1, n - 1):
            if left[j][1] != -1 and right[j][1] != -1:
                i = left[j][1]
                k = right[j][1]
                value = profits[i] + profits[j] + profits[k]
                answer = max(answer, value)
        return answer`,
  2908:`from typing import List

class Solution:
    def minimumSum(self, nums: List[int]) -> int:
        n = len(nums)
        left = [0] * n
        right = [0] * n
        left[0] = nums[0]
        for i in range(1, n):
            left[i] = min(left[i - 1], nums[i])
        right[n - 1] = nums[n - 1]
        for i in range(n - 2, -1, -1):
            right[i] = min(right[i + 1], nums[i])
        answer = float("inf")
        for j in range(1, n - 1):
            if left[j - 1] < nums[j] and right[j + 1] < nums[j]:
                value = left[j - 1] + nums[j] + right[j + 1]
                answer = min(answer, value)
        return -1 if answer == float("inf") else answer`,
  2916:`${BIT}
class RangeFenwick:
    def __init__(self, size: int):
        self.first = Fenwick(size, "delta")
        self.second = Fenwick(size, "weighted")

    def add_range(self, left: int, right: int, delta: int) -> None:
        self.first.add(left, delta)
        self.first.add(right + 1, -delta)
        self.second.add(left, delta * (left - 1))
        self.second.add(right + 1, -delta * right)

    def prefix(self, index: int) -> int:
        first = self.first.query(index)
        second = self.second.query(index)
        return first * index - second

    def range_sum(self, left: int, right: int) -> int:
        right_sum = self.prefix(right)
        left_sum = self.prefix(left - 1)
        return right_sum - left_sum

class Solution:
    def sumCounts(self, nums: List[int]) -> int:
        MOD = 10**9 + 7
        bit = RangeFenwick(len(nums))
        last = {}
        squares = 0
        answer = 0
        for right, num in enumerate(nums):
            previous = last.get(num, -1)
            left = previous + 1
            old_sum = bit.range_sum(left + 1, right + 1)
            increment = 2 * old_sum + right - left + 1
            squares = (squares + increment) % MOD
            bit.add_range(left + 1, right + 1, 1)
            answer = (answer + squares) % MOD
            last[num] = right
        return answer`,
  3072:`${BIT}
class Solution:
    def resultArray(self, nums: List[int]) -> List[int]:
        values = sorted(set(nums))
        arr1 = [nums[0]]
        arr2 = [nums[1]]
        bit1 = Fenwick(len(values), "arr1")
        bit2 = Fenwick(len(values), "arr2")
        bit1.add(bisect_left(values, nums[0]) + 1, 1)
        bit2.add(bisect_left(values, nums[1]) + 1, 1)
        for j in range(2, len(nums)):
            rank = bisect_right(values, nums[j])
            not_greater1 = bit1.query(rank)
            not_greater2 = bit2.query(rank)
            greater1 = len(arr1) - not_greater1
            greater2 = len(arr2) - not_greater2
            if greater1 > greater2 or (greater1 == greater2 and len(arr1) <= len(arr2)):
                arr1.append(nums[j])
                bit1.add(rank, 1)
            else:
                arr2.append(nums[j])
                bit2.add(rank, 1)
        return arr1 + arr2`,
  3187:`${BIT}
class Solution:
    def countOfPeaks(self, nums: List[int], queries: List[List[int]]) -> List[int]:
        n = len(nums)
        bit = Fenwick(n, "peaks")
        def is_peak(i: int) -> bool:
            return 0 < i < n - 1 and nums[i - 1] < nums[i] > nums[i + 1]
        for pos in range(1, n - 1):
            if is_peak(pos):
                bit.add(pos + 1, 1)
        answer = []
        for query_index, query in enumerate(queries):
            if query[0] == 1:
                _, left, right = query
                if right - left < 2:
                    answer.append(0)
                else:
                    end_count = bit.query(right)
                    before_count = bit.query(left + 1)
                    total = end_count - before_count
                    answer.append(total)
            else:
                _, index, value = query
                for pos in range(max(1, index - 1), min(n - 1, index + 2)):
                    if is_peak(pos):
                        bit.add(pos + 1, -1)
                nums[index] = value
                for pos in range(max(1, index - 1), min(n - 1, index + 2)):
                    if is_peak(pos):
                        bit.add(pos + 1, 1)
        return answer`,
};
function array(input,name,min=1,low=1,high=1e9){
  let a=input;try{if(typeof a==='string')a=a.trim().startsWith('[')?JSON.parse(a):a.split(',').map(t=>t.trim()?Number(t):NaN);}catch{a=null;}
  if(!Array.isArray(a)||a.length<min||a.length>12||!Array.from(a).every(v=>Number.isInteger(v)&&v>=low&&v<=high))throw new RangeError(`${name}: ${min}–12 integers from ${low} to ${high}`);
  return [...a];
}
function parse(id,input,params={}){
  if(!params||typeof params!=='object'||Array.isArray(params))throw new TypeError('Parameters must be an object');
  const nums=array(input,id===2907?'prices':'nums',[2907,2908,3072,3187].includes(id)?3:1,id===2659?-1e9:1,id===2908?50:[2916,3187].includes(id)?100000:1e9);
  if(id===2659&&new Set(nums).size!==nums.length)throw new RangeError('nums must contain distinct values');
  if(id===2907){const profits=array(params.profits===undefined?'[100,2,7,10]':params.profits,'profits',3,1,1e6);if(profits.length!==nums.length)throw new RangeError('prices and profits must have the same length');return {nums,profits,args:[nums,profits]};}
  if(id===3187){let queries=params.queries===undefined?'[[2,3,4],[1,0,4]]':params.queries;try{if(typeof queries==='string')queries=JSON.parse(queries);}catch{queries=null;}
    if(!Array.isArray(queries)||!queries.length||queries.length>8||!Array.from(queries).every(q=>Array.isArray(q)&&q.length===3&&Array.from(q).every(Number.isInteger)&&[1,2].includes(q[0])&&q[1]>=0&&q[1]<nums.length&&(q[0]===1?q[2]>=q[1]&&q[2]<nums.length:q[2]>=1&&q[2]<=100000)))throw new RangeError('queries: 1–8 valid [1,left,right] or [2,index,value] triples');
    queries=queries.map(q=>[...q]);return {nums,queries,args:[nums,queries]};
  }
  return {nums,args:[nums]};
}
const METHODS={2659:'countOperationsToEmptyArray',2907:'maxProfit',2908:'minimumSum',2916:'sumCounts',3072:'resultArray',3187:'countOfPeaks'};
function collectBits(value,out){
  if(!value||typeof value!=='object')return;
  if(typeof value.name==='string'&&Array.isArray(value.tree))out[value.name]=value.tree;
  for(const name of ['first','second','bit','bit1','bit2','left_bit','right_bit','self'])if(value[name])collectBits(value[name],out);
}
function build(id,input,params){
  const parsed=parse(id,input,params),original=[...parsed.nums],code=SOURCES[id].split('\n');
  const native=runTrace({code:SOURCES[id],method:METHODS[id],args:parsed.args,objectClasses:['Fenwick','FenwickMax','RangeFenwick'],stateClasses:['Fenwick','FenwickMax','RangeFenwick']});
  const alive=new Set(),peaks=new Set(),arr1ids=[],arr2ids=[],ledger=[],distinct=original.map(()=>0),knownLeft=new Set(),knownRight=new Set();
  let helper=null,scratch={},previous=null,stage='prepare',tour=null,choice=null,decision=null,activePos=null;
  const rightLine=code.findIndex(s=>s.includes('right_bit =')||s.includes('right[n - 1] ='))+1;
  const combineLine=code.findIndex(s=>s.trim()==='answer = -1'||s.trim()==='answer = float("inf")')+1;
  const steps=native.events.map((r,step)=>{
    const x=r.locals,o=r.outer,text=code[r.line-1].trim(),main=r.scope===METHODS[id],final=main&&r.returning;
    let change=null;
    if([2907,2908].includes(id)){const line=main?r.line:r.frames.length>1?(x.self?.name==='right'?rightLine:1):r.line;stage=line<rightLine?'left':line<combineLine?'right':'combine';}
    if(main&&/^(for index in order:|for j, price|for j in range|for right, num|for query_index)/.test(text)&&r.branch){scratch={};helper=null;choice=null;decision=null;}
    if(main&&/^\w+ = /.test(text)){const name=text.split(' = ')[0];if(['rank','end_count','before_count','all_count','moves','previous','left','old_sum','increment','value','greater1','greater2','not_greater1','not_greater2','total','i','k'].includes(name))scratch[name]=x[name];}
    if(r.scope==='query'&&text==='total = 0')helper={kind:'query',name:x.self.name,start:x.index,cursor:x.index,path:[],total:0,result:null};
    if(r.scope==='query'&&text==='best = (-1, -1)')helper={kind:'max',name:x.self.name,start:x.index,cursor:x.index,path:[],best:x.best,result:null};
    if(r.scope==='query'&&['total += self.tree[index]','best = max(best, self.tree[index])'].includes(text)){
      helper.path.push(x.index);change={kind:'read',name:x.self.name,index:x.index,value:x.self.tree[x.index]};
    }
    if(r.scope==='query'&&helper){helper.cursor=x.index;if(x.total!==undefined)helper.total=x.total;if(x.best!==undefined)helper.best=x.best;if(r.returning)helper.result=r.returned;}
    if(r.scope==='add'){
      if(previous?.scope!=='add')helper={kind:'add',name:x.self.name,start:x.index,cursor:x.index,path:[],delta:x.delta??x.value};
      if(text==='self.tree[index] += delta'||text==='self.tree[index] = max(self.tree[index], value)'){
        helper.path.push(x.index);change={kind:'write',name:x.self.name,index:x.index,before:previous?.bits[x.self.name]?.[x.index]??null,after:x.self.tree[x.index]};
      }helper.cursor=x.index;
    }
    if(main&&id===2659){
      if(text==='bit.add(i + 1, 1)')alive.add(x.i);
      if(text==='for index in order:'&&r.branch){tour=[];for(let offset=0;offset<original.length;offset++){const pos=(x.previous+offset)%original.length;if(alive.has(pos))tour.push(pos);if(pos===x.index)break;}}
      if(text==='answer += moves'){ledger.push({step,index:x.index,previous:x.previous,moves:x.moves,path:[...tour],answer:x.answer});change={kind:'count',amount:x.moves};}
      if(text==='bit.add(index + 1, -1)'){alive.delete(x.index);change={kind:'remove',index:x.index};}
    }
    if(main&&id===2907){
      if(text==='left[j] = left_bit.query(rank - 1)')knownLeft.add(x.j);
      if(text==='right[j] = right_bit.query(rank - 1)')knownRight.add(x.j);
      if(text==='answer = max(answer, value)'){choice={i:x.i,j:x.j,k:x.k,value:x.value};ledger.push({step,...choice,answer:x.answer});change={kind:'count',amount:x.value};}
    }
    if(main&&id===2908){
      if(text==='left[0] = nums[0]')knownLeft.add(0);
      if(text==='right[n - 1] = nums[n - 1]')knownRight.add(x.n-1);
      if(text==='left[i] = min(left[i - 1], nums[i])')knownLeft.add(x.i);
      if(text==='right[i] = min(right[i + 1], nums[i])')knownRight.add(x.i);
      if(text==='answer = min(answer, value)'){const i=original.findIndex((v,i)=>i<x.j&&v===x.left[x.j-1]),k=original.findIndex((v,i)=>i>x.j&&v===x.right[x.j+1]);choice={i,j:x.j,k,value:x.value};ledger.push({step,...choice,answer:x.answer});change={kind:'count',amount:x.value};}
    }
    if(main&&id===2916){
      if(text==='bit.add_range(left + 1, right + 1, 1)'){for(let start=x.left;start<=x.right;start++)distinct[start]++;change={kind:'range-add',left:x.left,right:x.right};}
      if(text==='answer = (answer + squares) % MOD'){ledger.push({step,right:x.right,left:x.left,oldSum:x.old_sum,increment:x.increment,squares:x.squares,answer:x.answer,distinct:[...distinct]});change={kind:'count',amount:x.squares};}
    }
    if(main&&id===3072){
      if(text==='arr1 = [nums[0]]')arr1ids.push(0);if(text==='arr2 = [nums[1]]')arr2ids.push(1);
      if(text.startsWith('if greater1 > greater2'))decision={greater1:x.greater1,greater2:x.greater2,len1:x.arr1.length,len2:x.arr2.length,target:r.branch?1:2};
      if(text==='arr1.append(nums[j])'||text==='arr2.append(nums[j])'){const target=text.startsWith('arr1')?1:2;(target===1?arr1ids:arr2ids).push(x.j);choice={target,index:x.j,greater1:x.greater1,greater2:x.greater2};ledger.push({step,...choice,decision:copy(decision)});change={kind:'choose',target,index:x.j};}
    }
    if(main&&id===3187){
      if(text==='for query_index, query in enumerate(queries):'&&r.branch)activePos=null;
      if(text.startsWith('for pos in range('))activePos=r.branch?x.pos:null;
      if(text==='bit.add(pos + 1, 1)')peaks.add(x.pos);
      if(text==='bit.add(pos + 1, -1)')peaks.delete(x.pos);
      if(text==='nums[index] = value')change={kind:'replace',index:x.index,value:x.value};
      if(text.startsWith('answer.append(')){ledger.push({step,queryIndex:x.query_index,left:x.left,right:x.right,value:x.answer.at(-1)});change={kind:'count',amount:x.answer.at(-1)};}
    }
    const bits={};for(const f of r.frames)collectBits(f.locals,bits);
    const current=id===2659?o.index??null:id===2916?o.right??null:id===3187?
      (r.scope==='is_peak'?x.i:change?.kind==='replace'?o.index:activePos??(o.query?.[0]===2?o.query[1]:null)):o.j??o.i??null;
    const v={id,nums:original,profits:parsed.profits??null,queries:parsed.queries??null,current,stage:final?'done':stage,context:o,
      bits,helper:copy(helper),scratch:copy(scratch),alive:[...alive],peaks:[...peaks],arr1ids:[...arr1ids],arr2ids:[...arr2ids],distinct:[...distinct],tour:copy(tour),choice:copy(choice),
      knownLeft:[...knownLeft],knownRight:[...knownRight],decision:copy(decision),ledger:copy(ledger),source:{line:r.line,text,timing:'after'},change,
      locals:x,outer:r.outer,frames:r.frames,scope:r.scope,branch:r.branch,returning:r.returning,returned:r.returned,trace:native.trace,result:final?native.answer:null};
    previous=v;
    return {arr:[],codeBlock:1,codeLines:[r.line],final,title:bi(`L${r.line} · ${text}`,`L${r.line} · ${text}`),note:bi('',''),vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),fenwickRoadmapView:v};
  });
  return {original,answer:native.answer,steps};
}
const DEFINITIONS=[
  [2659,'make-array-empty','hard',[3,4,-1],bi('Xoá hết mảng','Make Array Empty'),bi('Xoá phần tử đầu nếu nó nhỏ nhất; nếu không, chuyển nó về cuối. Đếm tổng số thao tác.','Remove the front if it is the smallest; otherwise move it to the back. Count all operations.'),'O(n log n)',[]],
  [2907,'maximum-profitable-triplets-with-increasing-prices-i','medium',[10,2,3,4],bi('Bộ ba tăng giá có lợi nhuận lớn nhất I','Maximum Profitable Triplets With Increasing Prices I'),bi('Chọn i < j < k với prices[i] < prices[j] < prices[k] để tối đa profits[i] + profits[j] + profits[k]. Không có bộ ba thì trả −1.','Choose i < j < k with strictly increasing prices to maximize the sum of their profits. Return −1 if no triplet exists.'),'O(n log n)',[{key:'profits',type:'string',default:'[100,2,7,10]',label:bi('profits · cùng độ dài prices','profits · same length as prices')}]],
  [2908,'minimum-sum-of-mountain-triplets-i','easy',[8,6,1,5,3],bi('Bộ ba dạng núi có tổng nhỏ nhất I','Minimum Sum of Mountain Triplets I'),bi('Chọn i < j < k với hai đầu thấp hơn nums[j]. Tìm tổng nhỏ nhất; không có thì trả −1.','Choose i < j < k with both endpoints below nums[j]. Minimize the sum, or return −1 if none exists.'),'O(n)',[]],
  [2916,'subarrays-distinct-element-sum-of-squares-ii','hard',[1,2,1],bi('Tổng bình phương số phần tử khác nhau II','Subarrays Distinct Element Sum of Squares II'),bi('Mỗi đoạn con đóng góp bình phương số giá trị khác nhau. Cộng mọi đoạn và lấy modulo 10⁹+7.','Each subarray contributes its squared distinct count. Sum all contributions modulo 10⁹+7.'),'O(n log n)',[]],
  [3072,'distribute-elements-into-two-arrays-ii','hard',[2,1,3,3],bi('Phân phối phần tử vào hai mảng II','Distribute Elements Into Two Arrays II'),bi('Chọn mảng có nhiều phần tử lớn hơn số hiện tại. Nếu hoà, chọn mảng ngắn hơn; vẫn hoà thì chọn arr1.','Choose the array with more values greater than the current number. Break ties by shorter length, then arr1.'),'O(n log n)',[]],
  [3187,'peaks-in-array','hard',[3,1,4,2,5],bi('Đếm đỉnh trong mảng','Peaks in Array'),bi('Truy vấn đếm đỉnh nằm trong đoạn, không tính hai đầu. Khi đổi một giá trị, chỉ ba vị trí lân cận có thể đổi trạng thái đỉnh.','Count peaks strictly inside a queried range. Updating one value can affect only its position and its two neighbors.'),'O((n + q) log n)',[{key:'queries',type:'string',default:'[[2,3,4],[1,0,4]]',label:bi('queries · JSON · tối đa 8 thao tác','queries · JSON · up to 8 operations')}]],
];
module.exports=Object.fromEntries(DEFINITIONS.map(([id,slug,difficulty,defaultInput,title,statement,time,extraParams])=>[id,{
  id,slug,difficulty,defaultInput,title,titleVi:title,statement,extraParams,inputKind:'integer',debugMode:'line-by-line',premium:id===2907,
  category:{key:id===2908?'array':'fenwick-tree',...bi(id===2908?'Mảng':'Fenwick Tree',id===2908?'Array':'Fenwick Tree')},
  tags:[{key:'array',...bi('Mảng','Array')},{key:'fenwick-tree',...bi('Fenwick Tree','Fenwick Tree')}],
  inputLabel:bi(id===2659?'nums · 1–12 số nguyên khác nhau':id===2907?'prices · 3–12 số nguyên dương':id===2908?'nums · 3–12 số từ 1 đến 50':'nums · tối đa 12 số nguyên dương',id===2659?'nums · 1–12 distinct integers':id===2907?'prices · 3–12 positive integers':id===2908?'nums · 3–12 values from 1 to 50':'nums · up to 12 positive integers'),
  code:SOURCES[id].split('\n'),approach:[bi(id===2908?'Prefix minimum + suffix minimum · không cần BIT.':id===2916?'Hai BIT: range add + range sum; Δ(d²) = 2d + 1.':'Phát lại từng dòng Python, gồm truy vấn và cập nhật BIT.',id===2908?'Prefix and suffix minima · no BIT needed.':id===2916?'Two BITs: range add and range sum; Δ(d²) = 2d + 1.':'Replay every Python statement, including BIT queries and updates.')],
  complexity:{time,space:'O(n)',note:bi('Trace đầy đủ; n là số phần tử, q là số truy vấn.','Complete trace; n is the number of values, q the number of queries.')},
  visualizationLimits:{maxValues:12,completeTrace:true},builder:(input,params)=>build(id,input,params),liveArgs:(input,params)=>parse(id,input,params).args,
}]));
