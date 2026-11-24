'use strict';
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({ vi, en });
const copy = value => JSON.parse(JSON.stringify(value));
const twoPointerBase=require('./two-pointer');
const twoSumBase=require('./hashmap')[1];
const CODES = {
  1: `${twoSumBase.code.join('\n')}\n        return []`,
  11: `class Solution:
    def maxArea(self, height):
        left, right = 0, len(height) - 1
        best = 0
        while left < right:
            width = right - left
            water_height = min(height[left], height[right])
            area = width * water_height
            best = max(best, area)
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        return best`,
  15: `class Solution:
    def threeSum(self, nums):
        nums = sorted(nums)
        ans = []
        n = len(nums)
        for i in range(n - 2):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            left, right = i + 1, n - 1
            while left < right:
                total = nums[i] + nums[left] + nums[right]
                if total < 0:
                    left += 1
                elif total > 0:
                    right -= 1
                else:
                    triplet = [nums[i], nums[left], nums[right]]
                    ans.append(triplet)
                    left += 1
                    right -= 1
                    while left < right and nums[left] == nums[left - 1]:
                        left += 1
                    while left < right and nums[right] == nums[right + 1]:
                        right -= 1
        return ans`,
  16: `class Solution:
    def threeSumClosest(self, nums, target):
        nums = sorted(nums)
        closest = nums[0] + nums[1] + nums[2]
        for i in range(len(nums) - 2):
            left, right = i + 1, len(nums) - 1
            while left < right:
                total = nums[i] + nums[left] + nums[right]
                if abs(total - target) < abs(closest - target):
                    closest = total
                if total < target:
                    left += 1
                elif total > target:
                    right -= 1
                else:
                    return total
        return closest`,
  80: `class Solution:
    def removeDuplicates(self, nums):
        write = 0
        for read in range(len(nums)):
            if write < 2 or nums[read] != nums[write - 2]:
                nums[write] = nums[read]
                write += 1
        return write`,
  26: twoPointerBase[26].code.join('\n'),
  18: `class Solution:
    def fourSum(self, nums, target):
        nums = sorted(nums)
        ans = []
        n = len(nums)
        for i in range(n - 3):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            for j in range(i + 1, n - 2):
                if j > i + 1 and nums[j] == nums[j - 1]:
                    continue
                left, right = j + 1, n - 1
                while left < right:
                    total = nums[i] + nums[j] + nums[left] + nums[right]
                    if total < target:
                        left += 1
                    elif total > target:
                        right -= 1
                    else:
                        quad = [nums[i], nums[j], nums[left], nums[right]]
                        ans.append(quad)
                        left += 1
                        right -= 1
                        while left < right and nums[left] == nums[left - 1]:
                            left += 1
                        while left < right and nums[right] == nums[right + 1]:
                            right -= 1
        return ans`,
  917: require('./reverse-only-letters-917')[917].code.join('\n'),
  3799: `class Solution:
    def wordSquares(self, words):
        words = sorted(words)
        ans = []
        for top in words:
            for left in words:
                if left == top or left[0] != top[0]:
                    continue
                for right in words:
                    if right in (top, left) or right[0] != top[3]:
                        continue
                    for bottom in words:
                        if bottom in (top, left, right):
                            continue
                        if bottom[0] != left[3]:
                            continue
                        if bottom[3] != right[3]:
                            continue
                        square = [top, left, right, bottom]
                        ans.append(square)
        return ans`,
  1947: `class Solution:
    def maxCompatibilitySum(self, students, mentors):
        m, n = len(students), len(students[0])
        score = [[0] * m for _ in range(m)]
        for i in range(m):
            for j in range(m):
                for q in range(n):
                    score[i][j] += int(students[i][q] == mentors[j][q])
        dp = [-1] * (1 << m)
        dp[0] = 0
        for mask in range(1 << m):
            i = bin(mask).count('1')
            if i == m:
                continue
            for j in range(m):
                if mask & (1 << j):
                    continue
                new_mask = mask | (1 << j)
                candidate = dp[mask] + score[i][j]
                dp[new_mask] = max(dp[new_mask], candidate)
        return dp[-1]`,
  4060: `class Solution:
    def countEvenlyGoodIntegers(self, l, r):
        def count(bound):
            digits = str(bound)
            dp = {(True, False, 0): 1}
            for pos, char in enumerate(digits):
                next_dp = {}
                for (tight, started, parity), ways in dp.items():
                    limit = int(char) if tight else 9
                    for digit in range(limit + 1):
                        next_started = started or digit != 0
                        next_parity = parity ^ int(next_started and digit % 2 == 0)
                        state = (tight and digit == limit, next_started, next_parity)
                        next_dp[state] = next_dp.get(state, 0) + ways
                dp = next_dp
            return sum(ways for (_, started, parity), ways in dp.items() if started and parity == 0)
        right = count(r)
        left = count(l - 1)
        return right - left`,
};

function parseWords(input, limit = 6) {
  let words = input;
  if (typeof input === 'string') {
    try { words = input.trim().startsWith('[') ? JSON.parse(input) : input.split(',').map(s => s.trim()); }
    catch (_) { words = null; }
  }
  if (!Array.isArray(words) || words.length < 4 || words.length > limit ||
      !Array.from(words).every(word => typeof word === 'string' && /^[a-z]{4}$/.test(word)) || new Set(words).size !== words.length) {
    throw new RangeError(`3799: cần 4–${limit} từ khác nhau, mỗi từ 4 chữ a–z / use 4–${limit} distinct lowercase 4-letter words.`);
  }
  return [...words];
}
function matrix(input, name, limit) {
  let rows = input;
  if (typeof input === 'string') {
    try { rows = input.trim().startsWith('[') ? JSON.parse(input) : input.split(';').map(row => row.trim().split('').map(bit => /^[01]$/.test(bit) ? Number(bit) : NaN)); }
    catch (_) { rows = null; }
  }
  if (!Array.isArray(rows) || !rows.length || rows.length > limit || !Array.isArray(rows[0]) || !rows[0].length || rows[0].length > 8 ||
      !Array.from(rows).every(row => Array.isArray(row) && row.length === rows[0].length && Array.from(row).every(value => value === 0 || value === 1))) {
    throw new RangeError(`1947: ${name} cần 1–${limit} hàng, 1–8 cột nhị phân / use a 1–${limit} by 1–8 binary matrix.`);
  }
  return rows.map(row => [...row]);
}
function argsFor(id, input, params = {}, live = false) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) throw new TypeError(`${id}: invalid parameters`);
  if(id===1){const target=params.target??9;if(typeof target!=='number'||!Number.isInteger(target)||Math.abs(target)>1e9)throw new RangeError('1: target phải là số nguyên trong [−10^9,10^9] / invalid target.');return[numbers(input,id,live),target];}
  if([11,15,26,80].includes(id))return[numbers(input,id,live)];
  if([16,18].includes(id)){const target=params.target??(id===16?1:0),bound=id===16?10000:1e9;if(typeof target!=='number'||!Number.isInteger(target)||Math.abs(target)>bound)throw new RangeError(`${id}: target phải là số nguyên trong [−${bound},${bound}] / invalid target.`);return[numbers(input,id,live),target];}
  if (id === 917) return require('./reverse-only-letters-917')[917].liveArgs(input);
  if (id === 3799) return [parseWords(input, live ? 15 : 6)];
  if (id === 1947) {
    const students = matrix(input, 'students', live ? 8 : 6), mentors = matrix(params.mentors ?? '100;001;110', 'mentors', live ? 8 : 6);
    if (students.length !== mentors.length || students[0].length !== mentors[0].length) throw new RangeError('1947: students và mentors phải cùng kích thước / matrices must have the same shape.');
    return [students, mentors];
  }
  const number = value => typeof value === 'number' ? value : typeof value === 'string' && /^\d+$/.test(value.trim()) ? Number(value) : NaN;
  const l = number(input), r = number(params.r ?? 22);
  if (!Number.isSafeInteger(l) || !Number.isSafeInteger(r) || l < 1 || l > r || r > 1e15) throw new RangeError('4060: cần 1 ≤ l ≤ r ≤ 10^15 / require 1 ≤ l ≤ r ≤ 10^15.');
  return [l, r];
}
function dpStates(value) {
  return (value?.__pairs__ ?? []).map(([key, ways]) => ({ tight: key[0], started: key[1], parity: key[2], ways }));
}
function numbers(input,id,live){
 let a=input;if(typeof input==='string')try{a=input.trim().startsWith('[')?JSON.parse(input):input.split(',').map(part=>/^-?\d+$/.test(part.trim())?Number(part):NaN);}catch(_){a=null;}
 const limits={1:[24,10000,1e9,2],11:[24,100000,10000,2],15:[14,3000,100000,3],16:[14,500,1000,3],18:[14,200,1e9,1],26:[24,30000,100,1],80:[24,30000,10000,1]},[visual,full,bound,min]=limits[id],limit=live?full:visual;
 if(!Array.isArray(a)||a.length<min||a.length>limit||!Array.from(a).every(x=>typeof x==='number'&&Number.isInteger(x)&&Math.abs(x)<=bound&&(id!==11||x>=0)))throw new RangeError(`${id}: cần ${min}–${limit} số nguyên trong [${id===11?0:-bound},${bound}] / invalid numbers.`);
 if([26,80].includes(id)&&a.some((x,i)=>i&&a[i-1]>x))throw new RangeError(`${id}: nums phải được sắp xếp tăng dần / nums must be sorted.`);
 return [...a];
}
function build(id, input, params = {}) {
  const args = argsFor(id, input, params), code = CODES[id].split('\n');
  const method = {1:'twoSum',11:'maxArea',15:'threeSum',16:'threeSumClosest',18:'fourSum',26:'removeDuplicates',80:'removeDuplicates',917:'reverseOnlyLetters',3799:'wordSquares',1947:'maxCompatibilitySum',4060:'countEvenlyGoodIntegers'}[id];
  const native = runTrace({code:CODES[id], method, args, ...([15,18,3799].includes(id) ? {summarizeLocals:{ans:0}} : {})});
  if (native.trace.truncated) throw new Error(`${id}: incomplete source trace`);
  const placed = {top:null,left:null,right:null,bottom:null}, gallery = [], parents = [];
  const skippedLeft=[],skippedRight=[],swaps=[];
  const seenWrites=new Map();let previousSeen=new Map();
  let transition = {}, progress = null, lastSwap = null, swapCount = 0, priorNums=null,lastCopy=null,sumRecord=null,closestRecord=null,areaRecord=null,bestPair=null,bestArea=-1,latestCount = {bound:null,digits:'',pos:null,digit:null,tight:null,started:null,parity:null,ways:null,limit:null,dp:[],nextDp:[],transition:{},returned:null};
  const steps = native.events.map((event, index) => {
    const x = event.locals, line = event.line, source = code[line-1].trim();
    const final = event.scope === method && event.returning;
    let detail;
    if(id===1){
      const seen=x.seen?.__pairs__??[],hasCurrent=line>=4&&line<=8&&!(line===4&&event.branch===false),lookup=line===6?event.branch:line===7?true:line===8?false:null;
      const write=line===8?{value:x.nums[x.i],index:x.i,previous:previousSeen.get(x.nums[x.i])??null}:null;
      if(write)seenWrites.set(write.value,index);
      detail={nums:[...args[0]],target:args[1],read:hasCurrent?x.i:null,current:hasCurrent?x.nums[x.i]:null,
        complement:line>=5&&line<=8?x.complement:null,lookup,matchedIndex:lookup?seen.find(([key])=>key===x.complement)[1]:null,
        seen:seen.map(([value,index])=>({value,index,step:seenWrites.get(value)})),write,pair:final?[...native.answer]:[]};
      previousSeen=new Map(seen);
    }else if(id===11){
      if(line===8)areaRecord={left:x.left,right:x.right,width:x.width,height:x.water_height,area:x.area};
      if(line===9&&x.area>bestArea){bestArea=x.area;bestPair={...areaRecord};}
      detail={heights:[...args[0]],left:x.left??null,right:x.right??null,best:x.best??null,areaRecord:areaRecord?{...areaRecord}:null,bestPair:bestPair?{...bestPair}:null};
    }else if(id===80){
      if(line===6)lastCopy={from:x.read,to:x.write,before:priorNums[x.write],value:x.nums[x.write]};
      detail={original:[...args[0]],nums:[...x.nums],k:x.write??null,read:x.read??null,compare:x.write>=2?x.write-2:null,copy:[6,7].includes(line)&&lastCopy?{...lastCopy}:null,validPrefix:x.nums.slice(0,x.write??0)};priorNums=[...x.nums];
    }else if(id===16){
      if([5,7].includes(line)&&event.branch)sumRecord=null;
      if(line===8)sumRecord={indices:[x.i,x.left,x.right],values:[x.nums[x.i],x.nums[x.left],x.nums[x.right]],total:x.total};
      if(line===4)closestRecord={indices:[0,1,2],values:x.nums.slice(0,3),total:x.closest};
      if(line===10)closestRecord=copy(sumRecord);
      detail={original:[...args[0]],nums:[...x.nums],target:args[1],i:x.i??null,left:line>=6&&line<=16?x.left??null:null,right:line>=6&&line<=16?x.right??null:null,sumRecord:sumRecord?copy(sumRecord):null,closestRecord:closestRecord?copy(closestRecord):null,closest:x.closest??null};
    }else if(id===15){
      if([6,10].includes(line)&&event.branch)sumRecord=null;
      if(line===11)sumRecord={indices:[x.i,x.left,x.right],values:[x.nums[x.i],x.nums[x.left],x.nums[x.right]],total:x.total};
      if(line===18)gallery.push({values:[...x.triplet],step:index});
      detail={original:[...args[0]],nums:[...x.nums],target:0,i:x.i??null,j:null,left:line>=9&&line<=24?x.left??null:null,right:line>=9&&line<=24?x.right??null:null,sumRecord:sumRecord?copy(sumRecord):null,gallery:gallery.slice(-8).map(copy),count:x['len(ans)']??0};
    }else if(id===26){
      if(line===7)lastCopy={from:x.i,to:x.k,before:priorNums[x.k],value:x.nums[x.k]};
      detail={original:[...args[0]],nums:[...x.nums],k:x.k??null,read:x.i??null,copy:[7,8].includes(line)&&lastCopy?{...lastCopy}:null,validPrefix:x.nums.slice(0,x.k??0)};priorNums=[...x.nums];
    }else if(id===18){
      if([6,9,13].includes(line)&&event.branch)sumRecord=null;
      if(line===14)sumRecord={indices:[x.i,x.j,x.left,x.right],values:[x.nums[x.i],x.nums[x.j],x.nums[x.left],x.nums[x.right]],total:x.total};
      if(line===21)gallery.push({values:[...x.quad],step:index});
      detail={original:[...args[0]],nums:[...x.nums],target:args[1],i:x.i??null,j:line>=9&&line<=27?x.j??null:null,left:line>=12&&line<=27?x.left??null:null,right:line>=12&&line<=27?x.right??null:null,
        sumRecord:sumRecord?copy(sumRecord):null,gallery:gallery.slice(-8).map(copy),count:x['len(ans)']??0};
    }else if (id === 917) {
      if(line===7)skippedLeft.push(x.left-1);if(line===9)skippedRight.push(x.right+1);
      if (line === 11) {lastSwap={left:x.left,right:x.right,before:[x.chars[x.right],x.chars[x.left]],after:[x.chars[x.left],x.chars[x.right]],leftBefore:x.chars[x.right],rightBefore:x.chars[x.left],leftAfter:x.chars[x.left],rightAfter:x.chars[x.right]};swaps.push(copy(lastSwap));swapCount++;}
      detail={original:args[0],chars:x.chars?[...x.chars]:[],left:x.left??null,right:x.right??null,lastSwap:lastSwap?copy(lastSwap):null,swapCount,
        skippedLeft:[...skippedLeft],skippedRight:[...skippedRight],swaps:swaps.map(copy),answer:final?native.answer:null,
        phase:{3:'copy',4:'pointers',5:'loop',6:'check-left',7:'move-left',8:'check-right',9:'move-right',10:'pair',11:'swap',12:'advance-left',13:'advance-right',14:'done'}[line]};
    } else if (id === 3799) {
      const roles = {5:'top',6:'left',9:'right',12:'bottom'}, order = Object.values(roles);
      if (roles[line] && event.branch) { const role = roles[line]; for(const later of order.slice(order.indexOf(role))) placed[later] = null; placed[role] = x[role]; }
      if (line === 20) gallery.push({words:[...x.square],step:index});
      detail = {words:[...args[0]].sort(),placed:{...placed},count:x['len(ans)']??0,gallery:gallery.slice(-6).map(copy),saved:line===20};
    } else if (id === 1947) {
      const m = args[0].length;
      if (line === 5 && event.branch) progress = {i:x.i,j:null,q:null};
      if (line === 6 && event.branch) progress = {i:x.i,j:x.j,q:null};
      if (line === 7 && event.branch) progress = {i:x.i,j:x.j,q:x.q};
      if (line === 11 && event.branch) transition = {};
      if (line === 18) transition = {newMask:x.new_mask,j:x.j};
      if (line === 19) transition = {...transition,candidate:x.candidate,before:x.dp[x.new_mask]};
      if (line === 20) {
        const improved = x.candidate > transition.before;
        transition = {...transition,after:x.dp[x.new_mask],improved};
        if (improved) parents[x.new_mask] = {mask:x.mask,mentor:x.j,step:index};
      }
      const mask = final ? (1<<m)-1 : x.mask??0, path = [];
      let cursor = mask;
      while (cursor && parents[cursor]) {const p=parents[cursor];path.push({student:binCount(p.mask),mentor:p.mentor});cursor=p.mask;}
      path.reverse();
      detail = {students:copy(args[0]),mentors:copy(args[1]),score:x.score?copy(x.score):null,dp:x.dp?[...x.dp]:null,m,n:args[0][0].length,
        mask,i:x.i??null,j:x.j??null,q:x.q??null,scoring:line<=8,progress:progress?{...progress}:null,transition:{...transition},path,
        parentSteps:parents.map(p=>p?.step??null)};
    } else {
      if (event.scope === 'count' && line === 4) transition = {};
      if (event.scope === 'count' && line === 6 && event.branch) transition = {};
      if (event.scope === 'count' && line === 10 && event.branch) transition = {digit:x.digit};
      if (line === 11) transition = {...transition,started:x.next_started};
      if (line === 12) transition = {...transition,parity:x.next_parity};
      if (line === 13) transition = {...transition,state:[...x.state]};
      if (line === 14) transition = {...transition,added:x.ways,after:x.next_dp.__pairs__.find(([key])=>key.every((v,i)=>v===x.state[i]))[1]};
      if (event.scope === 'count') latestCount = {bound:x.bound??null,digits:x.digits??'',pos:x.pos??null,digit:transition.digit??null,
        tight:x.tight??null,started:x.started??null,parity:x.parity??null,ways:x.ways??null,limit:x.limit??null,
        dp:dpStates(x.dp),nextDp:dpStates(x.next_dp),transition:{...transition},returned:event.returning?event.returned:null};
      detail = {l:args[0],r:args[1],...latestCount,right:x.right??event.outer.right??null,left:x.left??null};
    }
    const value = final ? native.answer : null;
    const names = Object.entries(x).map(([name,value])=>({name,value}));
    const label = source.startsWith('for ') ? bi('Xét ứng viên tiếp','Read the next candidate') : source.startsWith('if ') ? bi('Kiểm tra điều kiện','Check the condition') : source.startsWith('return ') ? bi('Trả kết quả','Return the result') : bi('Cập nhật trạng thái','Update the state');
    const step = {title:bi(`Dòng ${line} · ${label.vi}`,`Line ${line} · ${label.en}`),note:bi('',''),arr:[],highlight:[],mark:[],codeLines:[line],final,vars:names,
      lessonPictureView:{id,line,source,scope:event.scope,condition:event.branch,returning:event.returning,final,value,...detail}};
    if(id===917)step.reverseLetters917View=detail;
    return step;
  });
  return {original:args[0],answer:native.answer,steps};
}
function binCount(mask) { let n=0;while(mask){mask&=mask-1;n++;}return n; }
const common = {inputKind:'string',extraParams:[],debugMode:'line-by-line'};
const definitions = {
  1: {...twoSumBase,inputKind:'string',defaultInput:'2,7,11,15',debugMode:'line-by-line',inputLabel:bi('nums · 2–24 số nguyên trong [−10⁹,10⁹]','nums · 2–24 integers in [−10⁹,10⁹]'),
    approach:[bi('Với nums[i], tìm target − nums[i] trong seen trước khi lưu nums[i] → i. Vì thế luôn chọn hai vị trí khác nhau.','For nums[i], look up target − nums[i] in seen before storing nums[i] → i. This always uses two distinct positions.')],
    complexity:{time:'O(n)',space:'O(n)',note:bi('Minh hoạ tối đa 24 số; live code hỗ trợ 10.000 số. Input tự chọn không có cặp sẽ trả [].','Visualization: up to 24 values; live code accepts 10,000. Custom inputs with no pair return [].')}},
  11: {...twoPointerBase[11],inputKind:'string',defaultInput:'1,8,6,2,5,4,8,3,7',debugMode:'line-by-line',inputLabel:bi('height · 2–24 cột cao 0…10⁴','height · 2–24 walls, heights 0…10⁴'),approach:[bi('Nước cao bằng cột thấp hơn, rộng bằng khoảng cách hai cột. Dời con trỏ ở cột thấp hơn vào trong.','Water height is the shorter wall; width is the distance between walls. Move the shorter wall inward.')],complexity:{time:'O(n)',space:'O(1)',note:bi('Minh hoạ 2–24 cột; live code hỗ trợ đến 100.000 cột.','Visualization: 2–24 walls; live code accepts up to 100,000.')}},
  15: {...twoPointerBase[15],inputKind:'string',defaultInput:'-1,0,1,2,-1,-4',debugMode:'line-by-line',inputLabel:bi('nums · 3–14 số nguyên trong [−10⁵,10⁵]','nums · 3–14 integers in [−10⁵,10⁵]'),approach:[bi('Cố định i, trượt L/R theo tổng. Bỏ qua số trùng để chỉ lưu mỗi bộ ba một lần.','Fix i and move L/R according to the sum. Skip duplicate values so each triplet is saved once.')],complexity:{time:'O(n²)',space:'O(n + output)',note:bi('Minh hoạ tối đa 14 số; live code hỗ trợ 3.000 số.','Visualization: up to 14 values; live code accepts 3,000.')}},
  16: {...twoPointerBase[16],inputKind:'string',defaultInput:'-1,2,1,-4',debugMode:'line-by-line',inputLabel:bi('nums · 3–14 số nguyên −1000…1000','nums · 3–14 integers in −1000…1000'),approach:[bi('Cố định i và trượt L/R. Giữ tổng có khoảng cách đến target nhỏ nhất; dừng khi tổng bằng target.','Fix i and move L/R. Keep the sum with the smallest distance to target; stop on an exact match.')],complexity:{time:'O(n²)',space:'O(n)',note:bi('Minh hoạ tối đa 14 số; live code hỗ trợ 500 số.','Visualization: up to 14 values; live code accepts 500.')}},
  80: {...twoPointerBase[80],inputKind:'string',defaultInput:'0,0,1,1,1,1,2,3,3',debugMode:'line-by-line',inputLabel:bi('nums đã sắp · 1–24 số nguyên −10⁴…10⁴','sorted nums · 1–24 integers in −10⁴…10⁴'),approach:[bi('Giữ hai ô đầu; sau đó so số đang đọc với nums[write−2]. Khác nhau mới ghi, nên mỗi giá trị được giữ tối đa hai lần.','Keep the first two values; then compare the current value with nums[write−2]. Write only if different, keeping each value at most twice.')],complexity:{time:'O(n)',space:'O(1)',note:bi('Sửa mảng tại chỗ. Minh hoạ tối đa 24 số; live code hỗ trợ 30.000 số.','In-place updates. Visualization: up to 24 values; live code accepts 30,000.')}},
  18: {...twoPointerBase[18],inputKind:'string',defaultInput:'1,0,-1,0,-2,2',debugMode:'line-by-line',inputLabel:bi('nums · 1–14 số nguyên trong [−10^9,10^9]','nums · 1–14 integers in [−10^9,10^9]'),
    approach:[bi('Sắp xếp, cố định i và j. Di chuyển left/right theo tổng; bỏ qua giá trị trùng để mỗi bộ bốn chỉ xuất hiện một lần.','Sort and fix i and j. Move left/right according to the sum; skip duplicate values so each quadruplet appears once.')],complexity:{time:'O(n³)',space:'O(n + output)',note:bi('Minh hoạ tối đa 14 số; live code hỗ trợ đến 200 số.','Visualization: up to 14 values; live code accepts up to 200.')}},
  26: {...twoPointerBase[26],inputKind:'string',defaultInput:'0,0,1,1,1,2,2,3,3,4',debugMode:'line-by-line',inputLabel:bi('nums đã sắp xếp · 1–24 số nguyên −100…100','sorted nums · 1–24 integers in −100…100'),
    approach:[bi('i đọc mảng; k là vị trí ghi tiếp theo. Khi gặp giá trị mới, chép nums[i] vào nums[k] rồi tăng k. Chỉ k ô đầu là kết quả.','i reads the array; k is the next write position. Copy each new value into nums[k], then increment k. Only the first k cells form the result.')],complexity:{time:'O(n)',space:'O(1)',note:bi('Mảng được sửa tại chỗ; không tính bộ nhớ dùng để minh hoạ từng bước.','The array is modified in place; excludes visualization snapshots.')}},
  917: {...require('./reverse-only-letters-917')[917],approach:[bi('Hai con trỏ bỏ qua dấu và chữ số; chỉ hai chữ cái mới được đổi chỗ.','Both pointers skip symbols and digits; only letters are swapped.')]},
  3799: {...common,id:3799,slug:'word-squares-ii',difficulty:'medium',category:{key:'backtracking',vi:'Quay lui',en:'Backtracking'},
    tags:[{key:'string',vi:'Chuỗi',en:'String'},{key:'enumeration',vi:'Liệt kê',en:'Enumeration'},{key:'sorting',vi:'Sắp xếp',en:'Sorting'}],
    title:bi('Word Squares II','Word Squares II'),titleVi:bi('Ghép bốn từ thành bốn cạnh','Arrange four words around a square'),
    statement:bi('Chọn bốn từ khác nhau cho top, left, right, bottom. Bốn góc phải trùng chữ. Trả các bộ theo thứ tự từ điển (top, left, right, bottom).','Choose four distinct words for top, left, right and bottom. Letters must agree at all four corners. Return tuples in lexicographic (top, left, right, bottom) order.'),
    defaultInput:'able,area,echo,also',inputLabel:bi('4–6 từ khác nhau, mỗi từ 4 chữ · cách bằng dấu phẩy','4–6 distinct 4-letter words · comma separated'),
    approach:[bi('Sắp xếp từ, đặt từng cạnh và bỏ nhánh ngay khi góc không khớp hoặc từ bị lặp.','Sort words, place each side and skip a branch when a corner fails or a word is repeated.')],
    complexity:{time:'O(w⁴)',space:'O(w + output)',note:bi('Minh hoạ 4–6 từ; chạy code trực tiếp hỗ trợ đến 15 từ.','Visualization: 4–6 words; live code accepts up to 15.')}},
  1947: {...common,id:1947,slug:'maximum-compatibility-score-sum',difficulty:'medium',category:{key:'bitmask',vi:'Bitmask',en:'Bitmask'},
    tags:[{key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'},{key:'array',vi:'Mảng',en:'Array'}],
    title:bi('Maximum Compatibility Score Sum','Maximum Compatibility Score Sum'),titleVi:bi('Ghép học sinh và mentor để được nhiều điểm nhất','Match students and mentors for the highest score'),
    statement:bi('Mỗi câu trả lời giống nhau được 1 điểm. Ghép mỗi học sinh với một mentor khác nhau để tổng điểm lớn nhất.','Each matching answer earns one point. Pair each student with a distinct mentor to maximize the total score.'),
    defaultInput:'110;101;001',inputLabel:bi('students · mỗi hàng nhị phân cách bằng ; · tối đa 6 hàng','students · binary rows separated by ; · up to 6 rows'),
    extraParams:[{key:'mentors',type:'string',default:'100;001;110',label:bi('mentors · cùng kích thước với students','mentors · same shape as students')}],
    approach:[bi('Đếm điểm từng cặp. dp[mask] ghép popcount(mask) học sinh đầu với các mentor có bit 1.','Score each pair. dp[mask] assigns the first popcount(mask) students to mentors whose bits are set.')],
    complexity:{time:'O(m²n + m·2ᵐ)',space:'O(m² + 2ᵐ)',note:bi('Minh hoạ m ≤ 6, n ≤ 8; live code hỗ trợ m ≤ 8.','Visualization: m ≤ 6, n ≤ 8; live code supports m ≤ 8.')}},
  4060: {...common,id:4060,slug:'count-evenly-good-integers',difficulty:'hard',premium:true,category:{key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'},
    tags:[{key:'digit-dp',vi:'Digit DP',en:'Digit DP'},{key:'math',vi:'Toán học',en:'Math'}],
    title:bi('Count Evenly Good Integers','Count Evenly Good Integers'),titleVi:bi('Đếm số có số lượng chữ số chẵn là chẵn','Count integers with an even number of even digits'),
    statement:bi('Đếm số trong [l,r] có 0, 2, 4,… chữ số chẵn. Chữ số 0 trong số được tính; số 0 đệm ở đầu không tính.','Count integers in [l,r] containing 0, 2, 4,… even digits. Zero digits inside a number count; leading padding zeros do not.'),
    defaultInput:'18',inputLabel:bi('l · 1 ≤ l ≤ r ≤ 10^15','l · 1 ≤ l ≤ r ≤ 10^15'),extraParams:[{key:'r',type:'number',default:22,min:1,max:1e15,label:bi('r · cận phải','r · upper bound')}],
    approach:[bi('Tính F(r) − F(l−1). Mỗi chữ số chẵn thực sự đảo parity; started bỏ qua số 0 đệm, tight giữ cận trên.','Compute F(r) − F(l−1). Each actual even digit flips parity; started ignores padding zeros and tight preserves the upper bound.')],
    complexity:{time:'O(log r)',space:'O(log r)',note:bi('Mỗi vị trí chỉ có tối đa 8 trạng thái và 10 chữ số để thử.','At each position there are at most 8 states and 10 digit choices.')}},
};
for(const [key,p] of Object.entries(definitions)){const id=Number(key);p.code=CODES[id].split('\n');p.builder=(input,params)=>build(id,input,params);p.liveArgs=(input,params)=>argsFor(id,input,params,true);}
module.exports = definitions;
