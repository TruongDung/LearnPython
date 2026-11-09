'use strict';
const base = require('./monotonic-stack');
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi,en) => ({vi,en}), copy = v => JSON.parse(JSON.stringify(v));
const CODES = {
  3221: `from typing import List

class Solution:
    def maxScore(self, nums: List[int]) -> int:
        answer = 0
        suffix_max = 0
        for i in range(len(nums) - 1, 0, -1):
            suffix_max = max(suffix_max, nums[i])
            answer += suffix_max
        return answer`,
  1475: `from typing import List

class Solution:
    def finalPrices(self, prices: List[int]) -> List[int]:
        answer = prices[:]
        stack = []
        for j, price in enumerate(prices):
            while stack and prices[stack[-1]] >= price:
                i = stack.pop()
                answer[i] -= price
            stack.append(j)
        return answer`,
  2104: `from typing import List

class Solution:
    def subArrayRanges(self, nums: List[int]) -> int:
        n = len(nums)
        def contribution(is_min):
            total = 0
            stack = []
            for right in range(n + 1):
                current = nums[right] if right < n else (-float('inf') if is_min else float('inf'))
                while stack and (nums[stack[-1]] >= current if is_min else nums[stack[-1]] <= current):
                    mid = stack.pop()
                    left = stack[-1] if stack else -1
                    left_choices = mid - left
                    right_choices = right - mid
                    count = left_choices * right_choices
                    value = nums[mid] * count
                    total += value
                if right < n:
                    stack.append(right)
            return total
        max_sum = contribution(False)
        min_sum = contribution(True)
        return max_sum - min_sum`,
  2617: `from heapq import heappush, heappop
from typing import List

class Solution:
    def minimumVisitedCells(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        dp = [[float('inf')] * cols for _ in range(rows)]
        parent = [[None] * cols for _ in range(rows)]
        row_heaps = [[] for _ in range(rows)]
        col_heaps = [[] for _ in range(cols)]
        for r in range(rows):
            for c in range(cols):
                while row_heaps[r] and row_heaps[r][0][1] < c:
                    expired = heappop(row_heaps[r])
                while col_heaps[c] and col_heaps[c][0][1] < r:
                    expired = heappop(col_heaps[c])
                if r == 0 and c == 0:
                    dp[r][c] = 1
                if row_heaps[r]:
                    steps, reach, origin = row_heaps[r][0]
                    if steps + 1 < dp[r][c]:
                        dp[r][c] = steps + 1
                        parent[r][c] = (r, origin)
                if col_heaps[c]:
                    steps, reach, origin = col_heaps[c][0]
                    if steps + 1 < dp[r][c]:
                        dp[r][c] = steps + 1
                        parent[r][c] = (origin, c)
                if dp[r][c] != float('inf'):
                    heappush(row_heaps[r], (dp[r][c], c + grid[r][c], c))
                    heappush(col_heaps[c], (dp[r][c], r + grid[r][c], r))
        return dp[-1][-1] if dp[-1][-1] != float('inf') else -1`,
  1504: `from typing import List

class Solution:
    def numSubmat(self, mat: List[List[int]]) -> int:
        rows, cols = len(mat), len(mat[0])
        heights = [0] * cols
        answer = 0
        for r in range(rows):
            stack = []
            row_sum = 0
            for c in range(cols):
                heights[c] = heights[c] + 1 if mat[r][c] else 0
                width = 1
                while stack and stack[-1][0] >= heights[c]:
                    old_height, old_width = stack.pop()
                    row_sum -= old_height * old_width
                    width += old_width
                stack.append((heights[c], width))
                row_sum += heights[c] * width
                answer += row_sum
        return answer`,
};
const METHODS = {3221:'maxScore',1475:'finalPrices',2104:'subArrayRanges',2617:'minimumVisitedCells',1504:'numSubmat'};
function array(input, min, max, minLength=1) {
  let a=input;
  try { if(typeof a==='string'){const s=a.trim();a=s.startsWith('[')?JSON.parse(s):s?s.split(',').map(t=>t.trim()?Number(t):NaN):[];} } catch { a=null; }
  if(!Array.isArray(a)||a.length<minLength||a.length>14||!Array.from(a).every(x=>Number.isInteger(x)&&x>=min&&x<=max)) {
    throw new RangeError(`Use ${minLength}–14 integers from ${min} to ${max}`);
  }
  return [...a];
}
function parse(id,input) {
  if(id===3221)return array(input,1,100000,2);
  if(id===1475)return array(input,1,1000);
  if(id===2104)return array(input,-1e9,1e9);
  let grid=input;
  try { if(typeof grid==='string'){const s=grid.trim();grid=s.startsWith('[')?JSON.parse(s):s?s.split(/[;\n]/).map(row=>row.split(',').map(t=>t.trim()?Number(t):NaN)):[];} } catch { grid=null; }
  if(!Array.isArray(grid)||!grid.length||grid.length>6||!Array.from(grid).every(row=>Array.isArray(row)&&row.length>0&&row.length<=6&&row.length===grid[0].length))throw new RangeError('Use a rectangular grid of 1–6 rows and 1–6 columns');
  const limit=id===1504?1:grid.length*grid[0].length-1;
  if(!Array.from(grid).every(row=>Array.from(row).every(x=>Number.isInteger(x)&&x>=0&&x<=limit)))throw new RangeError(`Grid values must be integers from 0 to ${limit}`);
  if(id===2617&&grid.at(-1).at(-1)!==0)throw new RangeError('The destination cell must equal 0');
  return grid.map(row=>[...row]);
}
function path(parent,end) {
  if(!parent||!end)return [];
  const result=[];
  for(let p=end;p;p=parent[p[0]][p[1]]){result.push(p);if(p[0]===0&&p[1]===0)return result.reverse();}
  return [];
}
function groups(units) {
  const result=[];
  for(const u of [...units].sort((a,b)=>a.index-b.index)){
    const last=result.at(-1);
    if(last&&last.to===u.index-1&&last.owner===u.owner){last.to=u.index;last.points+=u.points;}
    else result.push({from:u.index-1,to:u.index,owner:u.owner,points:u.points});
  }
  return result;
}
function build(id,input) {
  const model=parse(id,input),code=CODES[id].split('\n'),method=METHODS[id];
  const native=runTrace({code:CODES[id],method,args:[model]});
  let previous=null,current=null,scratch={},comparison=null,owner=null,examinedFrom=null,phase=null,proposal=null,pendingParent=false;
  const ledger=[],units=[],totals={max:null,min:null},settled=[],discounts=[];
  let heightRow=null,heightColumns=[];
  const steps=native.events.map((e,step)=>{
    const x=e.locals,text=code[e.line-1].trim(),final=e.returning&&e.scope===method;
    let change=null;
    if(id===3221){
      if(text.startsWith('for i ')&&e.branch){current=x.i;comparison=null;}
      if(text==='suffix_max = max(suffix_max, nums[i])'){
        const before=previous.locals.suffix_max;
        if(owner===null||x.suffix_max>before)owner=x.i;
        examinedFrom=x.i;comparison={before,input:model[x.i],after:x.suffix_max,owner};
        change={kind:'max',index:x.i};
      }
      if(text==='answer += suffix_max'){
        const u={index:x.i,owner,points:x.suffix_max,before:previous.locals.answer,after:x.answer,step};
        units.push(u);ledger.push(u);change={kind:'write',index:x.i};
      }
    }
    if(id===1475){
      if(text.startsWith('for j,')&&e.branch){current=x.j;scratch={};comparison=null;}
      if(text==='while stack and prices[stack[-1]] >= price:'){
        const top=x.stack.at(-1);comparison={top:top??null,left:top===undefined?null:model[top],right:x.price,op:'≥',pass:e.branch};
      }
      if(text==='i = stack.pop()'){scratch={i:x.i};change={kind:'pop',index:x.i};}
      if(text==='answer[i] -= price'){
        const row={index:x.i,to:x.j,before:model[x.i],discount:x.price,after:x.answer[x.i],step};
        discounts.push(row);ledger.push(row);change={kind:'write',index:x.i};
      }
    }
    if(id===2104){
      const nextPhase=e.scope==='contribution'?(x.is_min?'min':'max'):phase;
      if(nextPhase!==phase){phase=nextPhase;scratch={};comparison=null;current=null;}
      if(text.startsWith('for right ')&&e.branch){current=x.right;scratch={};comparison=null;}
      if(text.startsWith('while stack and (nums[')){
        const top=x.stack.at(-1);comparison={top:top??null,left:top===undefined?null:model[top],right:x.current,op:x.is_min?'≥':'≤',pass:e.branch};
      }
      if(text==='mid = stack.pop()'){scratch={mid:x.mid,right:x.right};change={kind:'pop',index:x.mid};}
      for(const name of ['left','left_choices','right_choices','count','value'])if(text.startsWith(`${name} = `))scratch[name]=x[name];
      if(text==='total = 0')totals[phase]=0;
      if(text==='total += value'){
        const row={phase,index:x.mid,left:x.left,right:x.right,count:x.count,value:x.value,total:x.total,step};
        totals[phase]=x.total;ledger.push(row);change={kind:'write',index:x.mid};
      }
    }
    if(id===2617){
      if(text==='for r in range(rows):'&&e.branch){current=null;proposal=null;}
      if(text==='for c in range(cols):'&&e.branch){current=[x.r,x.c];proposal=null;scratch={};}
      if(text.startsWith('expired = heappop'))change={kind:'pop',heap:text.includes('row_heaps')?'row':'col',entry:x.expired};
      if(text.startsWith('steps, reach, origin = ')){
        proposal={from:text.includes('row_heaps')?[x.r,x.origin]:[x.origin,x.c],to:[x.r,x.c],steps:x.steps,reach:x.reach,kind:text.includes('row_heaps')?'row':'col',accepted:null};
      }
      if(text==='if steps + 1 < dp[r][c]:')proposal.accepted=e.branch;
      if(text==='dp[r][c] = 1'||text==='dp[r][c] = steps + 1'){
        const row={cell:[x.r,x.c],before:previous.locals.dp[x.r][x.c],after:x.dp[x.r][x.c],from:proposal?.from??null,step};
        ledger.push(row);pendingParent=text.includes('steps');change={kind:'write',cell:row.cell};
      }
      if(text.startsWith('parent[r][c] = ')){pendingParent=false;change={kind:'parent',cell:[x.r,x.c]};}
      if(text.startsWith('heappush(')){change={kind:'push',heap:text.includes('row_heaps')?'row':'col',cell:[x.r,x.c]};if(change.heap==='col')settled.push([x.r,x.c]);}
    }
    if(id===1504){
      if(text==='for r in range(rows):'&&e.branch){current=null;scratch={};comparison=null;heightRow=x.r;heightColumns=[];}
      if(text==='for c in range(cols):'&&e.branch){current=[x.r,x.c];scratch={};comparison=null;}
      if(text==='heights[c] = heights[c] + 1 if mat[r][c] else 0'){heightColumns.push(x.c);change={kind:'height',cell:[x.r,x.c]};}
      if(text==='while stack and stack[-1][0] >= heights[c]:'){
        const top=x.stack.at(-1);comparison={top:top??null,left:top?.[0]??null,right:x.heights[x.c],op:'≥',pass:e.branch};
      }
      if(text==='old_height, old_width = stack.pop()'){scratch={old_height:x.old_height,old_width:x.old_width};change={kind:'pop'};}
      if(text==='row_sum -= old_height * old_width')change={kind:'subtract',amount:x.old_height*x.old_width};
      if(text==='width = 1'||text==='width += old_width')scratch.width=x.width;
      if(text==='stack.append((heights[c], width))')change={kind:'push'};
      if(text==='row_sum += heights[c] * width')change={kind:'row',amount:x.heights[x.c]*x.width};
      if(text==='answer += row_sum'){
        const row={cell:[x.r,x.c],heights:[...x.heights],count:x.row_sum,total:x.answer,step};ledger.push(row);change={kind:'write',cell:row.cell};
      }
    }
    const end=id===2617?(final?[model.length-1,model[0].length-1]:current):null;
    const route=id===2617&&end&&x.dp?.[end[0]]?.[end[1]]!=='∞'&&!pendingParent?path(x.parent,end):[];
    const v={id,model,current:final?null:copy(current),scratch:copy(scratch),comparison:copy(comparison),owner,examinedFrom,
      units:copy(units),groups:groups(units),phase,totals:copy(totals),discounts:copy(discounts),ledger:copy(ledger),
      proposal:copy(proposal),path:route,pendingParent,settled:copy(settled),heightRow,heightColumns:[...heightColumns],change,
      source:{line:e.line,text,timing:'after'},locals:x,outer:e.outer,frames:e.frames,scope:e.scope,
      branch:e.branch,returning:e.returning,returned:e.returned,trace:native.trace,result:final?native.answer:null};
    previous=v;
    return {arr:[],codeBlock:1,codeLines:[e.line],final,title:bi(`L${e.line} · ${text}`,`L${e.line} · ${text}`),note:bi('',''),
      vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),stackJumpGridView:v};
  });
  return {original:Array.isArray(model[0])?model.flat():model,answer:native.answer,steps};
}
const statements={
  3221:bi('Nhảy từ 0 tới cuối mảng, chỉ đi sang phải. Bước i → j được (j−i) × nums[j] điểm. Tối đa tổng điểm.','Hop from 0 to the end, moving right. A hop i → j scores (j−i) × nums[j]. Maximize the total.'),
  2617:bi('Từ (0,0), nhảy sang phải hoặc xuống tối đa grid[r][c] ô. Đếm ít ô ghé nhất, gồm cả ô đầu và đích; không tới được trả −1.','From (0,0), jump right or down up to grid[r][c] cells. Minimize visited cells, including start and goal; return −1 if unreachable.'),
  2104:bi('Cộng max − min của mọi đoạn con liên tiếp.','Sum max − min over every contiguous subarray.'),
  1475:bi('Mỗi món được giảm bằng giá món đầu tiên bên phải có giá ≤ nó. Không có thì giữ nguyên giá.','Discount each item by the first price to its right that is ≤ its price. Otherwise keep its original price.'),
  1504:bi('Đếm tất cả hình chữ nhật chỉ chứa số 1.','Count every rectangular submatrix containing only ones.'),
};
module.exports=Object.fromEntries(Object.keys(CODES).map(Number).map(id=>[id,{
  ...base[id],code:CODES[id].split('\n'),debugMode:'line-by-line',statement:statements[id],inputKind:'string',extraParams:[],
  inputLabel:bi(id===2617?'grid · tối đa 6×6, 0 ≤ giá trị < số ô, đích = 0':id===1504?'mat · tối đa 6×6, chỉ 0 và 1':id===3221?'nums · 2–14 số, 1–100000':id===1475?'prices · 1–14 số, 1–1000':'nums · 1–14 số, −10⁹…10⁹',
    id===2617?'grid · up to 6×6, 0 ≤ value < cell count, goal = 0':id===1504?'mat · up to 6×6, only 0 and 1':id===3221?'nums · 2–14 values, 1–100000':id===1475?'prices · 1–14 values, 1–1000':'nums · 1–14 values, −10⁹…10⁹'),
  approach:[bi(id===3221?'Quét ngược, cộng max bên phải cho từng đơn vị khoảng cách.':id===2617?'Heap theo hàng và cột giữ các ô có thể nhảy tới ô hiện tại.':id===2104?'Stack gom đóng góp của từng max và min; khi trùng, vị trí bên phải sở hữu đoạn.':id===1475?'Stack giữ các món chưa gặp mức giảm đầu tiên.':'Mỗi hàng tạo histogram; stack gộp các chiều cao nhỏ nhất theo bề rộng.',
    id===3221?'Scan backward and add a suffix maximum for each unit of distance.':id===2617?'Row and column heaps retain earlier cells that can reach the current cell.':id===2104?'Stacks sum max and min contributions; the rightmost equal value owns each subarray.':id===1475?'A stack holds items waiting for their first discount.':'Each row builds a histogram; a stack groups minima by width.')],
  complexity:{time:id===2617?'O(mn log(m+n))':id===1504?'O(mn)':'O(n)',space:id===3221?'O(1)':id===2617?'O(mn)':id===1504?'O(n)':'O(n)',note:bi('Độ phức tạp của lời giải Python.','Complexity of the Python solution.')},
  visualizationLimits:{maxValues:14,maxRows:6,maxCols:6,completeTrace:true},builder:input=>build(id,input),liveArgs:input=>[parse(id,input)],
}]));
