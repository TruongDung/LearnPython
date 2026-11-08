"use strict";

// Pictures project the completed statements of the displayed Python program.
// Membership sets below identify visual witnesses; they never compute the answer.
const { runTrace } = require('./wasm-picture-trace');
const bases = {
  4051: require('./array-range-queries')[4051],
  4055: require('./shadow-pairs')[4055],
  2426: require('./hard-range-visualizations')[2426],
  1649: require('./array')[1649],
};
const bi = (vi, en) => ({ vi, en });
const copy = value => JSON.parse(JSON.stringify(value));
const pairs = value => value?.__pairs__ ?? [];
const bound = value => value === '∞' ? Infinity : value === '−∞' ? -Infinity : value;
const FENWICK = `from bisect import bisect_left, bisect_right
from typing import List

class Fenwick:
    def __init__(self, size: int):
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
const sources = {
  775: `class Solution:
    def isIdealPermutation(self, nums: List[int]) -> bool:
        n = len(nums)
        max_value = -1
        max_index = -1
        for j in range(2, n):
            candidate_index = j - 2
            if nums[candidate_index] > max_value:
                max_value = nums[candidate_index]
                max_index = candidate_index
            if max_value > nums[j]:
                return False
        return True`.replace('class Solution:', 'from typing import List\n\nclass Solution:'),
  1395: `${FENWICK}
class Solution:
    def numTeams(self, rating: List[int]) -> int:
        n = len(rating)
        values = sorted(set(rating))
        left_less = [0] * n
        left_greater = [0] * n
        bit = Fenwick(len(values))
        for j, value in enumerate(rating):
            rank = bisect_left(values, value) + 1
            left_less[j] = bit.query(rank - 1)
            left_greater[j] = j - bit.query(rank)
            bit.add(rank, 1)
        bit = Fenwick(len(values))
        answer = 0
        for j in range(n - 1, -1, -1):
            rank = bisect_left(values, rating[j]) + 1
            right_less = bit.query(rank - 1)
            right_greater = n - 1 - j - bit.query(rank)
            increasing = left_less[j] * right_greater
            decreasing = left_greater[j] * right_less
            answer += increasing + decreasing
            bit.add(rank, 1)
        return answer`,
  1505: `${FENWICK}
from collections import deque

class Solution:
    def minInteger(self, num: str, k: int) -> str:
        positions = [deque() for _ in range(10)]
        for i, ch in enumerate(num):
            positions[int(ch)].append(i + 1)
        bit = Fenwick(len(num))
        answer = []
        for output_index in range(len(num)):
            for digit in range(10):
                if not positions[digit]:
                    continue
                position = positions[digit][0]
                removed_before = bit.query(position)
                swaps = position - 1 - removed_before
                if swaps > k:
                    continue
                k -= swaps
                chosen = positions[digit].popleft()
                answer.append(str(digit))
                bit.add(position, 1)
                break
        return "".join(answer)`,
  2179: `${FENWICK}
class Solution:
    def goodTriplets(self, nums1: List[int], nums2: List[int]) -> int:
        n = len(nums1)
        positions = {value: i for i, value in enumerate(nums2)}
        mapped = [positions[value] for value in nums1]
        values = list(range(n))
        bit = Fenwick(n)
        answer = 0
        for j, rank in enumerate(mapped):
            left_count = bit.query(rank)
            right_count = n - 1 - rank - (j - left_count)
            contribution = left_count * right_count
            answer += contribution
            bit.add(rank + 1, 1)
        return answer`,
  2519: `${FENWICK}
class Solution:
    def kBigIndices(self, nums: List[int], k: int) -> int:
        n = len(nums)
        values = sorted(set(nums))
        left_count = [0] * n
        bit = Fenwick(len(values))
        for j, value in enumerate(nums):
            rank = bisect_left(values, value) + 1
            left_count[j] = bit.query(rank - 1)
            bit.add(rank, 1)
        bit = Fenwick(len(values))
        answer = 0
        for j in range(n - 1, -1, -1):
            rank = bisect_left(values, nums[j]) + 1
            right_count = bit.query(rank - 1)
            if left_count[j] >= k and right_count >= k:
                answer += 1
            bit.add(rank, 1)
        return answer`,
  2250: `${FENWICK}
class Solution:
    def countRectangles(self, rectangles: List[List[int]], points: List[List[int]]) -> List[int]:
        ordered_rectangles = sorted(enumerate(rectangles), key=lambda item: item[1][0], reverse=True)
        ordered_points = sorted(enumerate(points), key=lambda item: item[1][0], reverse=True)
        values = sorted(set(height for width, height in rectangles))
        bit = Fenwick(len(values))
        answer = [0] * len(points)
        rect_index = 0
        for point_index, (x, y) in ordered_points:
            while rect_index < len(rectangles) and ordered_rectangles[rect_index][1][0] >= x:
                rect_id, (width, height) = ordered_rectangles[rect_index]
                rank = bisect_left(values, height) + 1
                bit.add(rank, 1)
                rect_index += 1
            below = bit.query(bisect_left(values, y))
            answer[point_index] = rect_index - below
        return answer`,
  4051: `${FENWICK}
class Solution:
    def distantSubarrays(self, nums: list[int], goal: int, k: int) -> int:
        if k == 0:
            n = len(nums)
            return n * (n + 1) // 2
        prefix = [0]
        for value in nums:
            prefix.append(prefix[-1] + value)
        values = sorted(set(prefix))
        bit = Fenwick(len(values))
        answer = 0
        seen = 0
        for prefix_index, current in enumerate(prefix):
            low = current - goal - k
            high = current - goal + k
            left_rank = bisect_right(values, low)
            left_count = bit.query(left_rank)
            right_rank = bisect_left(values, high)
            below_high = bit.query(right_rank)
            right_count = seen - below_high
            increment = left_count + right_count
            answer += increment
            insert_rank = bisect_left(values, current) + 1
            bit.add(insert_rank, 1)
            seen += 1
        return answer`,
  2426: `${FENWICK}
class Solution:
    def numberOfPairs(self, nums1: list[int], nums2: list[int], diff: int) -> int:
        differences = []
        for a, b in zip(nums1, nums2):
            differences.append(a - b)
        values = sorted(set(differences))
        bit = Fenwick(len(values))
        answer = 0
        for j, current in enumerate(differences):
            threshold = current + diff
            query_index = bisect_right(values, threshold)
            count = bit.query(query_index)
            answer += count
            update_index = bisect_left(values, current) + 1
            bit.add(update_index, 1)
        return answer`,
  1649: `${FENWICK}
class Solution:
    def createSortedArray(self, instructions):
        MOD = 10**9 + 7
        values = sorted(set(instructions))
        bit = Fenwick(len(values))
        answer = 0
        for inserted, value in enumerate(instructions):
            rank = bisect_left(values, value) + 1
            less = bit.query(rank - 1)
            not_greater = bit.query(rank)
            greater = inserted - not_greater
            cost = min(less, greater)
            answer = (answer + cost) % MOD
            bit.add(rank, 1)
        return answer`,
  // Split recursive and helper expressions so each completed assignment is visible.
  4055: bases[4055].code.join('\n')
    .replace('            answer = solve(left, middle) + solve(middle + 1, right)',
      '            left_answer = solve(left, middle)\n            right_answer = solve(middle + 1, right)\n            answer = left_answer + right_answer')
    .replace(/                upper\[i\] = \([\s\S]*?\n                \)/,
      '                if not_greater < inserted:\n                    successor_rank = bit.kth(not_greater + 1)\n                    upper[i] = values[successor_rank - 1]\n                else:\n                    upper[i] = float("inf")')
    .replace(/                lower\[j\] = \([\s\S]*?\n                \)/,
      '                if smaller:\n                    predecessor_rank = bit.kth(smaller)\n                    lower[j] = values[predecessor_rank - 1]\n                else:\n                    lower[j] = float("-inf")'),
  1409: `${FENWICK}
class Solution:
    def processQueries(self, queries: List[int], m: int) -> List[int]:
        q = len(queries)
        bit = Fenwick(q + m)
        positions = {}
        for value in range(1, m + 1):
            positions[value] = q + value
            bit.add(positions[value], 1)
        front = q
        answer = []
        for j, value in enumerate(queries):
            position = positions[value]
            index = bit.query(position - 1)
            answer.append(index)
            bit.add(position, -1)
            positions[value] = front
            bit.add(front, 1)
            front -= 1
        return answer`,
};

function array(input, name, min, max, low, high) {
  let values = input;
  if (typeof values === 'string') {
    try { values = values.trim().startsWith('[') ? JSON.parse(values) : values.split(',').map(s => s.trim() ? Number(s) : NaN); }
    catch { values = null; }
  }
  if (!Array.isArray(values) || values.length < min) throw new RangeError(`${name} must contain at least ${min === 1 ? 'one' : min} integer${min === 1 ? '' : 's'}`);
  if (values.length > max) throw new RangeError(`Use at most ${max} values for a complete visual replay`);
  if (!Array.from(values).every(v => Number.isInteger(v) && v >= low && v <= high)) {
    throw new RangeError(`${name}: integers from ${low.toLocaleString('en-US')} to ${high.toLocaleString('en-US')}`);
  }
  return [...values];
}
function integer(value, name, low, high) {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  if (!Number.isInteger(n) || n < low || n > high) throw new RangeError(`${name} must be an integer from ${low} to ${high}`);
  return n;
}
function parse(id, input, params = {}) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) throw new TypeError('Parameters must be an object');
  if (id === 1505) {
    if (typeof input !== 'string' || !/^(0|[1-9][0-9]{0,11})$/.test(input)) throw new RangeError('num: 1–12 digits with no leading zeros');
    const k=integer(params.k??4,'k',0,1e9);
    return {nums:[...input].map(Number),num:input,k,args:[input,k]};
  }
  if (id === 2250) {
    const matrix=(value,name,max,limit)=>{
      let a=value;try{if(typeof a==='string')a=JSON.parse(a);}catch{a=null;}
      if(!Array.isArray(a)||!a.length||a.length>max||!Array.from(a).every(row=>Array.isArray(row)&&row.length===2&&Array.from(row).every(v=>Number.isInteger(v)&&v>=1&&v<=limit)))throw new RangeError(`${name}: 1–${max} pairs of positive integers ≤ ${limit}`);
      return a.map(row=>[...row]);
    };
    const rectangles=matrix(input,'rectangles',10,100),points=matrix(params.points??'[[1,1],[2,3]]','points',10,100);
    return {nums:rectangles,points,args:[rectangles,points]};
  }
  if ([775,1395,2179,2519].includes(id)) {
    const nums=array(input,id===1395?'rating':'nums',id===775||id===2519?1:3,id===775?16:12,id===775||id===2179?0:1,100000);
    const permutation=a=>a.length===nums.length&&new Set(a).size===a.length&&a.every(v=>v>=0&&v<a.length);
    if ((id===775||id===2179)&&!permutation(nums))throw new RangeError('Use a permutation of 0…n−1');
    if(id===1395&&new Set(nums).size!==nums.length)throw new RangeError('rating values must be unique');
    if(id===2179){const nums2=array(params.nums2??'[0,1,2,3]','nums2',3,12,0,100000);if(!permutation(nums2))throw new RangeError('nums2 must be a permutation of the same length');return {nums,nums2,args:[nums,nums2]};}
    if(id===2519){const k=integer(params.k??2,'k',1,nums.length);return {nums,k,args:[nums,k]};}
    return {nums,args:[nums]};
  }
  if (id === 1409) {
    const m = integer(params.m ?? 5, 'm', 1, 16);
    const nums = array(input, 'queries', 1, Math.min(12,m), 1, m);
    return { nums, m, args: [nums, m] };
  }
  const nums = array(input, id === 1649 ? 'instructions' : id === 2426 ? 'nums1' : 'nums', id === 4055 ? 3 : 1,
    id === 2426 ? 40 : 16, id === 4055 || id === 1649 ? 1 : -1e9, id === 1649 ? 100000 : 1e9);
  if (id === 4051) {
    const goal = integer(params.goal ?? 4, 'goal', -1e9, 1e9), k = integer(params.k ?? 1, 'k', 0, 1e9);
    return { nums, goal, k, args: [nums, goal, k] };
  }
  if (id === 2426) {
    const nums2 = array(params.nums2 ?? '[2,2,1]', 'nums2', 1, 40, -1e9, 1e9);
    if (nums2.length !== nums.length) throw new RangeError('nums1 and nums2 must have the same length');
    const diff = integer(params.diff ?? 1, 'diff', -1e9, 1e9);
    return { nums, nums2, diff, args: [nums, nums2, diff] };
  }
  return { nums, args: [nums] };
}
const methods = { 4051: 'distantSubarrays', 4055: 'shadowPairs', 2426: 'numberOfPairs', 1649: 'createSortedArray', 1409: 'processQueries',
  775:'isIdealPermutation',1395:'numTeams',1505:'minInteger',2179:'goodTriplets',2250:'countRectangles',2519:'kBigIndices' };

function build(id, input, params) {
  const parsed = parse(id, input, params), { nums } = parsed, code = sources[id].split('\n');
  const trace = runTrace({ code: sources[id], method: methods[id], args: parsed.args, objectClasses: ['Fenwick'], stateClasses: ['Fenwick'] });
  const members = new Set(), accepted = [], ledger = [], calls = new Map(), segmentState = new Map();
  let scratch = {}, helper = null, previousScope = null, previousTree = null, lastContext = {}, phase = 'prepare', queries = 0;
  const steps = trace.events.map((r, step) => {
    const x = r.locals, text = code[r.line - 1].trim(), final = r.returning && r.scope === methods[id];
    const solveFrames = r.frames.filter(f => f.name === 'solve');
    let ctx = id === 4055 ? solveFrames.at(-1)?.locals ?? lastContext : r.outer;
    if (id === 4055 && solveFrames.length) lastContext = ctx;
    const main = r.scope === (id === 4055 ? 'solve' : methods[id]);
    const current = id === 4051 ? ctx.prefix_index ?? null : id === 1649 ? ctx.inserted ?? null : id === 4055 ? ctx.j ?? ctx.i ?? null : id===1505?ctx.output_index??null:id===2250?ctx.point_index??null:ctx.j ?? null;
    let change = null, newlyCounted = [], operation = text;
    if(id!==4055&&r.scope==='__init__'&&text==='self.tree = [0] * (size + 1)')members.clear();
    let state = null, key = null;
    if (id === 4055 && ctx.left !== undefined) {
      key = `${ctx.left},${ctx.right}`;
      if (!calls.has(key)) calls.set(key, { key, left: ctx.left, right: ctx.right, depth: solveFrames.length - 1,
        parent: solveFrames.length > 1 ? `${solveFrames.at(-2).locals.left},${solveFrames.at(-2).locals.right}` : null, step, total: null });
      const call = calls.get(key);
      if (ctx.middle !== undefined) call.middle = ctx.middle;
      if (!segmentState.has(key)) segmentState.set(key, { upper: new Set(), lower: new Set(), sweep: new Set() });
      state = segmentState.get(key);
      phase = ctx.left_indices ? 'sweep' : ctx.lower ? 'lower' : ctx.upper ? 'upper' : 'split';
      if (main && r.returning) { call.total = r.returned; change = { kind: 'return', value: r.returned }; }
    } else if (id !== 4055) {
      if (main && /^(for prefix_index, current|for j, current|for inserted, value|for j, value|for j, rank|for j in range|for output_index|for digit|for point_index)/.test(text)) {
        if(r.branch){scratch = {}; helper = null; queries = 0; phase = 'query';}
      }
      if(main&&text==='bit = Fenwick(len(values))'){members.clear();helper=null;}
      if([1395,2519].includes(id))phase=ctx.answer===undefined?'left':'right';
      if (id === 1409 && main && text === 'for value in range(1, m + 1):') phase = 'prepare';
      if (main && /^\w+ = /.test(text)) {
        const name = text.split(' = ')[0];
        if (['low','high','left_rank','right_rank','left_count','right_count','below_high','increment','threshold',
          'query_index','count','update_index','insert_rank','rank','less','not_greater','greater','cost','position','index',
          'right_less','right_greater','increasing','decreasing','left_count','right_count','contribution','removed_before','swaps','chosen','below'].includes(name)) scratch[name] = x[name];
      }
      if(main&&text==='left_less[j] = bit.query(rank - 1)')scratch.left_less=ctx.left_less[ctx.j];
      if(main&&text==='left_greater[j] = j - bit.query(rank)')scratch.left_greater=ctx.left_greater[ctx.j];
      if(main&&text==='left_count[j] = bit.query(rank - 1)')scratch.left_count=ctx.left_count[ctx.j];
    }
    if (r.scope === 'query' || r.scope === 'prefix_sum') {
      if (text === 'total = 0') {
        queries++;
        if(![4055,1395,2519].includes(id))phase='query';
        const purposes={1395:`${phase} · ${queries===1?'<':'≤'} value`,2519:'< value',2179:'pos2 < rank',
          2250:'height < y',1409:'slot < position',1505:'removed ≤ position',
          4055:phase==='upper'?'≤ nums[i]':phase==='lower'?'< nums[j]':'< lower[j]'};
        helper = { kind: 'query', path: [], start: x.index ?? x.length, total: 0, result: null,
          purpose: id === 4051 ? queries === 1 ? '≤ low' : '< high' : id === 1649 ? queries === 1 ? '< value' : '≤ value' : purposes[id]??phase };
      }
      if (text.startsWith('total += self.tree[')) {
        const index = x.index ?? x.length;
        helper.path.push(index);
        change = { kind: 'read', index, value: x.self.tree[index] };
      }
      if (helper) { helper.total = x.total; helper.cursor = x.index ?? x.length; if (r.returning) helper.result = r.returned; }
    }
    if (r.scope === 'kth') {
      if (text === 'index = 0') helper = { kind: 'kth', path: [], start: x.order, result: null, purpose: phase };
      if (text === 'next_index = index + step') helper.path.push(x.next_index);
      if (helper) { helper.cursor = x.index; helper.order = x.order; helper.jump = x.step; helper.next = x.next_index; if (r.returning) helper.result = r.returned; }
    }
    if (r.scope === 'add') {
      if(![4055,1395,2519].includes(id))phase=id===1409&&ctx.j===undefined?'prepare':'insert';
      if (previousScope !== 'add') { helper = { kind: 'add', start: x.index, cursor: x.index, delta: x.delta, path: [], purpose: phase }; }
      if (text === 'self.tree[index] += delta') {
        helper.path.push(x.index);
        change = { kind: 'write', index: x.index, before: previousTree?.[x.index] ?? null, after: x.self.tree[x.index], delta: x.delta };
      }
      helper.cursor = x.index;
    }
    const tree = x.self?.tree ?? ctx.bit?.tree ?? null;
    // A bag changes only once the actual add() has returned to its caller.
    if (main && text.startsWith('bit.add(')) {
      phase = id === 4055 ? phase : id === 1409 && ctx.j === undefined ? 'prepare' : 'insert';
      if (id === 4055) {
        if (phase === 'upper') state.upper.add(ctx.i);
        else if (phase === 'lower') state.lower.add(ctx.j);
        else if (text.endsWith('-1)')) state.sweep.delete(ctx.i);
        else state.sweep.add(ctx.i);
      } else if(id===2250)members.add(ctx.rect_id);
      else if(id===1505)members.add(ctx.position-1);
      else if (id === 1409) {
        if (text === 'bit.add(position, -1)') members.delete(ctx.value);
        else members.add(ctx.value);
      } else members.add(current);
      change = { kind: 'insert', index: current, delta: helper?.delta ?? 1 };
    }
    if (main && (text === 'answer += increment' || text === 'answer += count' || text === 'answer += active - below_lower')) {
      if (id === 4051) {
        newlyCounted = [...members].filter(i => i < ctx.prefix_index && Math.abs(ctx.current - ctx.prefix[i] - parsed.goal) >= parsed.k)
          .map(i => ({ start: i, end: ctx.prefix_index - 1, sum: ctx.current - ctx.prefix[i],
            difference: Math.abs(ctx.current - ctx.prefix[i] - parsed.goal), step }));
      } else if (id === 2426) {
        newlyCounted = [...members].filter(i => ctx.differences[i] <= ctx.threshold).map(i => ({ i, j: ctx.j, step }));
      } else {
        const low = new Map(pairs(ctx.lower)).get(ctx.j);
        newlyCounted = [...state.sweep].filter(i => nums[i] >= bound(low)).map(i => ({ i, j: ctx.j, segment: key, step }));
      }
      accepted.push(...newlyCounted);
      const amount = id === 4051 ? ctx.increment : id === 2426 ? ctx.count : ctx.active - ctx.below_lower;
      ledger.push({ step, current, amount, answer: ctx.answer, segment: key });
      change = { kind: 'count', amount };
    }
    if (main && text === 'answer = (answer + cost) % MOD') {
      ledger.push({ step, current, amount: ctx.cost, answer: ctx.answer, less: ctx.less, greater: ctx.greater });
      change = { kind: 'count', amount: ctx.cost };
    }
    if (main && text === 'answer.append(index)') {
      ledger.push({ step, current, amount: ctx.index, value: ctx.value }); change = { kind: 'count', amount: ctx.index };
    }
    if(main&&text==='answer += increasing + decreasing'){
      for(let i=0;i<ctx.j;i++)for(let k=ctx.j+1;k<nums.length;k++)if(nums[i]<nums[ctx.j]&&nums[ctx.j]<nums[k]||nums[i]>nums[ctx.j]&&nums[ctx.j]>nums[k])newlyCounted.push({i,j:ctx.j,k,step});
      accepted.push(...newlyCounted);ledger.push({step,current,amount:ctx.increasing+ctx.decreasing,answer:ctx.answer});change={kind:'count',amount:ctx.increasing+ctx.decreasing};
    }
    if(main&&text==='answer += contribution'){
      for(let i=0;i<ctx.j;i++)for(let k=ctx.j+1;k<nums.length;k++)if(ctx.mapped[i]<ctx.mapped[ctx.j]&&ctx.mapped[ctx.j]<ctx.mapped[k])newlyCounted.push({i,j:ctx.j,k,step});
      accepted.push(...newlyCounted);ledger.push({step,current,amount:ctx.contribution,answer:ctx.answer});change={kind:'count',amount:ctx.contribution};
    }
    if(main&&id===2519&&text==='answer += 1'){
      newlyCounted=[{index:ctx.j,step}];accepted.push(...newlyCounted);change={kind:'count',amount:1};ledger.push({step,current,amount:1,answer:ctx.answer});
    }
    if(main&&text==='answer[point_index] = rect_index - below'){
      newlyCounted=[...members].filter(i=>nums[i][1]>=ctx.y).map(i=>({rect:i,point:ctx.point_index,step}));accepted.push(...newlyCounted);change={kind:'count',amount:ctx.answer[ctx.point_index]};ledger.push({step,current,amount:ctx.answer[ctx.point_index]});
    }
    if(main&&text==='answer.append(str(digit))'){
      const before=nums.map((_,i)=>i).filter(i=>!members.has(i)),from=before.indexOf(ctx.chosen-1);
      ledger.push({step,current,amount:ctx.swaps,digit:ctx.digit,position:ctx.chosen-1,before,from,k:ctx.k,answer:[...ctx.answer]});change={kind:'count',amount:ctx.swaps};
    }
    if(main&&id===775&&text==='if max_value > nums[j]:'){
      ledger.push({step,current,maxIndex:ctx.max_index,max:ctx.max_value,value:nums[ctx.j],fail:r.branch});change={kind:'check',fail:r.branch};
    }
    if (id === 4051 && final && parsed.k === 0) {
      for (let i = 0; i < nums.length; i++) for (let j = i; j < nums.length; j++) {
        const sum = nums.slice(i, j + 1).reduce((a,b) => a+b, 0);
        accepted.push({ start:i, end:j, sum, difference:Math.abs(sum-parsed.goal), step });
      }
    }
    if (final) phase = 'done';
    const bag = id === 4055 ? [...(state?.[phase] ?? state?.sweep ?? [])] : [...members];
    const view = { id, nums, nums2: parsed.nums2 ?? null, points:parsed.points??null,num:parsed.num??null,goal: parsed.goal ?? null, k: parsed.k ?? null,
      diff: parsed.diff ?? null, m: parsed.m ?? null, current, phase, context: ctx,
      coordinates: ctx.values ?? null, tree, helper: copy(helper), scratch: copy(scratch), members: bag,
      accepted: copy(accepted), newlyCounted, ledger: copy(ledger), calls: copy([...calls.values()]),
      upper: pairs(ctx.upper), lower: pairs(ctx.lower), left: ctx.left ?? null, right: ctx.right ?? null, middle: ctx.middle ?? null,
      active: state ? [...state.sweep] : [], qualifying: newlyCounted.map(p => p.i), subtotal: ctx.answer ?? (final ? trace.answer : null),
      source: { line: r.line, text, timing: 'after' }, locals: x, outer: r.outer, frames: r.frames,
      scope: r.scope, branch: r.branch, returned: r.returned, returning: r.returning, trace: trace.trace,
      change, operation, answer: final ? trace.answer : null };
    previousScope = r.scope; previousTree = tree;
    const result = { arr: [], codeBlock: 1, codeLines: [r.line], final,
      title: bi(`L${r.line} · ${text}`, `L${r.line} · ${text}`), note: bi('', ''),
      vars: Object.entries(x).map(([name,value]) => ({ name, value, rawValue:value })), fenwickCountView: view };
    if (id === 4051) result.distantSubarrays4051View = view;
    if (id === 4055) result.shadowPairs4055View = view;
    return result;
  });
  return { original: nums, answer: trace.answer, steps };
}

const descriptions = {
  4051: bi('Hai miền prefix · query rồi insert', 'Two prefix ranges · query before insert'),
  4055: bi('Chia đôi · dựng biên · đếm cặp chéo', 'Split · build bounds · count crossing pairs'),
  2426: bi('d[i] = nums1[i] − nums2[i] · đếm d[i] ≤ d[j] + diff', 'd[i] = nums1[i] − nums2[i] · count d[i] ≤ d[j] + diff'),
  1649: bi('Đếm nhỏ hơn và lớn hơn · chèn vào giữa', 'Count smaller and greater · insert between them'),
};
const result = {};
for (const id of [4051,4055,2426,1649]) result[id] = {
  ...bases[id], code: sources[id].split('\n'), debugMode: 'line-by-line',
  approach: [descriptions[id]], builder: (input,params) => build(id,input,params),
  complexity: { ...bases[id].complexity, note: bi('Phát lại đầy đủ từng dòng Python, gồm cả Fenwick.', 'Complete Python line replay, including Fenwick helpers.') },
  liveArgs: (input,params) => parse(id,input,params).args,
};
result[1649].inputLabel = bi('instructions · 1–16 số từ 1 đến 100000', 'instructions · 1–16 values from 1 to 100000');
result[1409] = {
  id:1409, slug:'queries-on-a-permutation-with-key', difficulty:'medium',
  category:{key:'fenwick-tree',...bi('Fenwick Tree','Fenwick Tree')},
  tags:[{key:'array',...bi('Mảng','Array')},{key:'fenwick-tree',...bi('Fenwick Tree','Fenwick Tree')}],
  title:bi('Truy vấn trên hoán vị','Queries on a Permutation With Key'),
  titleVi:bi('Tìm vị trí · đưa lên đầu','Find its position · move to front'),
  statement:bi('Ban đầu P = [1, 2, …, m]. Với mỗi query, ghi chỉ số của phần tử (từ 0), rồi đưa nó lên đầu P.',
    'Start with P = [1, 2, …, m]. For each query, record its zero-based index, then move it to the front.'),
  defaultInput:[3,1,2,1],inputKind:'integer',inputLabel:bi('queries · 1–12 truy vấn','queries · 1–12 queries'),
  extraParams:[{key:'m',type:'number',min:1,max:16,default:5,label:bi('m · kích thước hoán vị','m · permutation size')}],
  code:sources[1409].split('\n'),debugMode:'line-by-line',
  approach:[bi('Fenwick đếm vị trí có phần tử. Dành trước q ô trống để đưa từng query lên đầu.',
    'Fenwick counts occupied slots. Reserve q empty slots for move-to-front operations.')],
  complexity:{time:'O((m + q) log(m + q))',space:'O(m + q)',note:bi('q = số truy vấn','q = number of queries')},
  liveArgs:(input,params)=>parse(1409,input,params).args,builder:(input,params)=>build(1409,input,params),
};
const extraLessons = [
  [775,'global-and-local-inversions','medium',[1,0,2],bi('Nghịch thế toàn cục và cục bộ','Global and Local Inversions'),
    bi('Mọi nghịch thế phải liền kề. Kiểm tra xem có nums[i] > nums[j] với j − i ≥ 2 không.','Every inversion must be adjacent. Check for nums[i] > nums[j] with j − i ≥ 2.'),'O(n)','O(1)',[]],
  [1395,'count-number-of-teams','medium',[2,5,3,4,1],bi('Đếm số đội','Count Number of Teams'),
    bi('Chọn i < j < k có rating tăng nghiêm ngặt hoặc giảm nghiêm ngặt.','Choose i < j < k with strictly increasing or strictly decreasing ratings.'),'O(n log n)','O(n)',[]],
  [1505,'minimum-possible-integer-after-at-most-k-adjacent-swaps-on-digits','hard','4321',bi('Số nhỏ nhất sau k lần đổi chỗ liền kề','Minimum Possible Integer After at Most K Adjacent Swaps'),
    bi('Dùng tối đa k lần đổi chỗ hai chữ số liền nhau để tạo chuỗi số nhỏ nhất. Kết quả có thể bắt đầu bằng 0.','Use at most k adjacent digit swaps to form the smallest string. The result may start with zero.'),'O(n log n)','O(n)',
    [{key:'k',type:'number',min:0,max:1e9,default:4,label:bi('k · số lần đổi chỗ','k · swap budget')}]],
  [2179,'count-good-triplets-in-an-array','hard',[2,0,1,3],bi('Đếm bộ ba tốt trong hai hoán vị','Count Good Triplets in an Array'),
    bi('Đếm bộ ba giá trị xuất hiện theo cùng thứ tự trong nums1 và nums2.','Count triples of values that appear in the same order in nums1 and nums2.'),'O(n log n)','O(n)',
    [{key:'nums2',type:'string',default:'[0,1,2,3]',label:bi('nums2 · hoán vị cùng độ dài','nums2 · permutation of the same length')}]],
  [2250,'count-number-of-rectangles-containing-each-point','medium','[[1,2],[2,3],[2,5]]',bi('Đếm hình chữ nhật chứa mỗi điểm','Count Number of Rectangles Containing Each Point'),
    bi('Hình [w,h] có góc (0,0) và (w,h). Đếm số hình chứa mỗi điểm, kể cả trên biên.','Rectangle [w,h] has corners (0,0) and (w,h). Count the rectangles containing each point, including the boundary.'),'O((R + P) log(R + P))','O(R + P)',
    [{key:'points',type:'string',default:'[[1,1],[2,3]]',label:bi('points · JSON · 1–10 điểm, toạ độ 1–100','points · JSON · 1–10 points, coordinates 1–100')}]],
  [2519,'count-the-number-of-k-big-indices','hard',[2,3,6,5,2,3],bi('Đếm chỉ số k-big','Count the Number of K-Big Indices'),
    bi('Một chỉ số hợp lệ khi có ít nhất k phần tử nhỏ hơn nó ở bên trái và ít nhất k phần tử nhỏ hơn nó ở bên phải.','An index qualifies when at least k strictly smaller values lie on each side.'),'O(n log n)','O(n)',
    [{key:'k',type:'number',min:1,max:12,default:2,label:bi('k · tối thiểu mỗi phía','k · minimum on each side')}]],
];
for(const[id,slug,difficulty,defaultInput,title,statement,time,space,extraParams]of extraLessons)result[id]={
  id,slug,difficulty,defaultInput,title,titleVi:title,statement,extraParams,
  category:id===775?{key:'array',...bi('Mảng','Array')}:{key:'fenwick-tree',...bi('Fenwick Tree','Fenwick Tree')},
  tags:id===775?[{key:'array',...bi('Mảng','Array')}]:[{key:'array',...bi('Mảng','Array')},{key:'fenwick-tree',...bi('Fenwick Tree','Fenwick Tree')}],
  inputKind:typeof defaultInput==='string'?'string':'integer',debugMode:'line-by-line',code:sources[id].split('\n'),
  inputLabel:bi(id===1505?'num · 1–12 chữ số':id===2250?'rectangles · JSON · 1–10 hình, cạnh 1–100':id===775?'nums · hoán vị 0…n−1 · 1–16 số':id===2519?'nums · 1–12 số':'nums / rating · 3–12 số',
    id===1505?'num · 1–12 digits':id===2250?'rectangles · JSON · 1–10 rectangles, sides 1–100':id===775?'nums · permutation of 0…n−1 · 1–16 values':id===2519?'nums · 1–12 values':'nums / rating · 3–12 values'),
  approach:[statement],complexity:{time,space,note:bi('Đầy đủ từng dòng Python, không rút gọn trace.','Complete Python statement replay, without trace sampling.')},
  builder:(input,params)=>build(id,input,params),liveArgs:(input,params)=>parse(id,input,params).args,
};
module.exports = result;
