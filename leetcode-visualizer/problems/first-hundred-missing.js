"use strict";

// The eleven missing lessons in LeetCode 1–100. Views contain data only;
// the browser renderer owns markup and escaping.
const bi = (vi, en = vi) => ({ vi, en });
const copy = value => JSON.parse(JSON.stringify(value));
const tile = (text, tone = "", sub = "") => ({ text, tone, sub });
const row = (vi, en, items, linked = false) => ({ label: bi(vi, en), items, linked });
const int = (value, min, max, name) => {
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${name}: ${min} ≤ ${name} ≤ ${max} (số nguyên / integer).`);
  return value;
};
function scalar(input, min, max, name = "n") {
  if (!Array.isArray(input) || input.length !== 1) throw new Error(`${name}: nhập đúng một số / enter one integer.`);
  return int(input[0], min, max, name);
}
function trace(id, original) {
  const steps = [];
  const emit = (source, vi, en, view = {}, vars = {}, final = false) => {
    const code = lessons[id].code;
    const index = code.findIndex(line => line.trim() === source);
    if (index < 0) throw new Error(`Unknown source line: ${source}`);
    steps.push({ arr: [], highlight: [], mark: [], codeLines: [index + 1],
      title: bi(vi, en), note: bi("", ""), final,
      vars: Object.entries(vars).map(([name, value]) => ({ name, value, rawValue: copy(value) })),
      firstHundredView: copy({ id, ...view }) });
  };
  return { emit, done: answer => ({ original, answer, steps }) };
}
const cat = {
  string: ["Chuỗi", "String"], greedy: ["Tham lam", "Greedy"], array: ["Mảng", "Array"],
  math: ["Toán học", "Math"], backtracking: ["Quay lui", "Backtracking"],
  "linked-list": ["Danh sách liên kết", "Linked List"], bitmask: ["Bitmask", "Bitmask"],
  bst: ["Cây tìm kiếm nhị phân", "Binary Search Tree"], dp: ["Quy hoạch động", "Dynamic Programming"],
};
const lessons = {};
function lesson(id, title, slug, category, viTitle, statement, example, kind, source, builder, time, space, options = {}) {
  lessons[id] = { id, title: bi(title), titleVi: viTitle, slug, difficulty: "medium",
    category: { key: category, vi: cat[category][0], en: cat[category][1] },
    statement, defaultInput: example, inputKind: kind, extraParams: [],
    approach: [viTitle], complexity: { time, space, note: bi("Không tính lịch sử khung mô phỏng.", "Excludes visualization-frame history.") },
    code: source.trim().split("\n"), debugMode: "semantic", builder, ...options };
}
const param = (key, vi, en, value, min, max) => ({ key, label: bi(vi, en), default: value, min, max });

function zigzagArgs(input, params = {}) {
  if (typeof input !== "string" || !/^[A-Za-z,.]{1,120}$/.test(input)) throw new Error("s: 1–120 ký tự A–Z, a–z, dấu phẩy hoặc dấu chấm / letters, commas or periods.");
  return [input, int(params.numRows ?? 3, 1, 20, "numRows")];
}
function zigzag(input, params) {
  const [s, n] = zigzagArgs(input, params), { emit, done } = trace(6, s);
  const rows = Array.from({ length: Math.min(n, s.length) }, () => []), cells = [];
  let r = 0, direction = 1, col = 0;
  const view = () => ({ rows: rows.map((items, i) => row(`Hàng ${i}`, `Row ${i}`, items)), grid: { rows: rows.length, cols: col + 1, cells } });
  if (n === 1 || n >= s.length) {
    s.split("").forEach((c, i) => { const rr = n === 1 ? 0 : i; rows[rr].push(tile(c)); cells.push({ r: rr, c: n === 1 ? i : 0, text: c }); });
    col = n === 1 ? s.length - 1 : 0;
    emit("return s", "Một hàng hoặc mỗi ký tự một hàng → giữ nguyên", "One row or one character per row → unchanged", { ...view(), result: s }, {}, true);
    return done(s);
  }
  for (let i = 0; i < s.length; i++) {
    rows[r].push(tile(s[i], "active", i)); cells.push({ r, c: col, text: s[i], active: true });
    if (cells.length > 1) cells[cells.length - 2].active = false;
    emit("rows[r].append(ch)", `${s[i]} → hàng ${r}`, `${s[i]} → row ${r}`, view(), { i, r, direction });
    if (r === 0) direction = 1;
    if (r === n - 1) direction = -1;
    if (direction === -1) col++;
    r += direction;
  }
  const answer = rows.map(items => items.map(item => item.text).join("")).join("");
  emit('return "".join("".join(row) for row in rows)', "Đọc từng hàng từ trên xuống", "Read rows from top to bottom", { ...view(), result: answer }, {}, true);
  return done(answer);
}
lesson(6, "Zigzag Conversion", "zigzag-conversion", "string", bi("Xếp chữ theo đường zigzag", "Write characters along a zigzag"),
  bi("Xếp s xuống rồi chéo lên qua numRows hàng; nối các hàng từ trên xuống. Hình hỗ trợ s ≤ 120 ký tự, numRows ≤ 20.", "Write s down and diagonally up over numRows rows, then concatenate the rows. Visual limits: 120 characters, 20 rows."), "PAYPALISHIRING", "string", `
class Solution:
    def convert(self, s: str, numRows: int) -> str:
        if numRows == 1 or numRows >= len(s):
            return s
        rows = [[] for _ in range(numRows)]
        r, direction = 0, 1
        for ch in s:
            rows[r].append(ch)
            if r == 0:
                direction = 1
            if r == numRows - 1:
                direction = -1
            r += direction
        return "".join("".join(row) for row in rows)
`, zigzag, "O(|s|)", "O(|s| + numRows)", { extraParams: [param("numRows", "Số hàng", "Rows", 3, 1, 20)], liveArgs: zigzagArgs });

function roman(input) {
  let n = scalar(input, 1, 3999, "num"); const original = n, { emit, done } = trace(12, input), output = [];
  const values = [1000,900,500,400,100,90,50,40,10,9,5,4,1], symbols = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
  for (let i = 0; i < values.length; i++) while (n >= values[i]) {
    n -= values[i]; output.push(symbols[i]);
    emit("num -= value", `${n + values[i]} − ${values[i]} → ${n}`, `${n + values[i]} − ${values[i]} → ${n}`, {
      rows: [row("Chọn giá trị lớn nhất còn vừa", "Choose largest fitting value", values.map((v, j) => tile(symbols[j], i === j ? "active" : "", v))), row("Ghép ký hiệu", "Append symbols", output.map(v => tile(v, "done")))],
      equation: `${original} = ${original - n} + ${n}`, result: output.join("") }, { num: n, value: values[i], symbol: symbols[i] });
  }
  const answer = output.join("");
  emit('return "".join(answer)', "Đã đổi hết số thành ký hiệu La Mã", "All value converted to Roman symbols", { result: answer, rows: [row("Kết quả", "Result", output.map(v => tile(v, "done")))] }, { num: n }, true);
  return done(answer);
}
lesson(12, "Integer to Roman", "integer-to-roman", "math", bi("Trừ dần và ghép số La Mã", "Subtract values and append Roman symbols"),
  bi("Đổi số nguyên 1–3999 thành số La Mã. Thử giá trị từ lớn xuống nhỏ, kể cả CM, CD, XC, XL, IX, IV.", "Convert an integer from 1 to 3999 to Roman numerals, considering values in descending order including subtractive pairs."), "1994", "positive", `
class Solution:
    def intToRoman(self, num: int) -> str:
        pairs = [(1000,"M"),(900,"CM"),(500,"D"),(400,"CD"),(100,"C"),(90,"XC"),(50,"L"),(40,"XL"),(10,"X"),(9,"IX"),(5,"V"),(4,"IV"),(1,"I")]
        answer = []
        for value, symbol in pairs:
            while num >= value:
                answer.append(symbol)
                num -= value
        return "".join(answer)
`, roman, "O(1)", "O(1)", { singleInput: true, maxInput: 3999, liveArgs: input => [scalar(input, 1, 3999, "num")] });

function countSay(input) {
  const n = scalar(input, 1, 10), { emit, done } = trace(38, input); let s = "1";
  emit('s = "1"', "Bắt đầu: 1", "Start: 1", { rows: [row("Lượt 1", "Term 1", [tile("1", "done")])] });
  for (let turn = 2; turn <= n; turn++) {
    let out = ""; const groups = [];
    for (let i = 0; i < s.length;) {
      let j = i + 1; while (j < s.length && s[j] === s[i]) j++;
      out += String(j - i) + s[i]; groups.push(tile(`${j - i} × ${s[i]}`, "done", `${j - i}${s[i]}`));
      emit("out += str(j - i) + s[i]", `Đọc ${j-i} chữ số ${s[i]}`, `Say ${j-i} copies of ${s[i]}`, {
        rows: [row(`Lượt ${turn-1}`, `Term ${turn-1}`, s.split("").map((c,k) => tile(c, k >= i && k < j ? "active" : ""))), row("Nhóm liên tiếp → số lượng + chữ số", "Run → count + digit", groups), row(`Lượt ${turn}`, `Term ${turn}`, out.split("").map(c => tile(c,"done")))] }, { turn, i, j, out });
      i = j;
    }
    s = out;
  }
  emit("return s", `Lượt ${n}: ${s}`, `Term ${n}: ${s}`, { result: s, rows: [row("Kết quả", "Result", s.split("").map(c => tile(c,"done")))] }, {}, true);
  return done(s);
}
lesson(38, "Count and Say", "count-and-say", "string", bi("Đọc các nhóm chữ số liên tiếp", "Read consecutive digit runs"),
  bi("Bắt đầu từ 1. Mỗi lượt đọc số lượng rồi chữ số của từng nhóm liên tiếp. Hình hỗ trợ n = 1–10.", "Start at 1. Each term describes consecutive runs in the previous term as count followed by digit. Visual limit: n = 1–10."), "5", "positive", `
class Solution:
    def countAndSay(self, n: int) -> str:
        s = "1"
        for _ in range(n - 1):
            out = ""
            i = 0
            while i < len(s):
                j = i + 1
                while j < len(s) and s[j] == s[i]:
                    j += 1
                out += str(j - i) + s[i]
                i = j
            s = out
        return s
`, countSay, "O(2ⁿ)", "O(2ⁿ)", { singleInput: true, maxInput: 10, liveArgs: input => [scalar(input,1,10)] });

function jumpArgs(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 100 || !input.every(v => Number.isInteger(v) && v >= 0 && v <= 1000)) throw new Error("nums: 1–100 số nguyên trong [0,1000] / integers in [0,1000].");
  let reach = 0;
  for (let i=0; i<input.length; i++) { if (i>reach) throw new Error("Không thể tới cuối mảng / Last index is unreachable."); reach=Math.max(reach,i+input[i]); }
  return [input];
}
function jump(input) {
  jumpArgs(input); const { emit, done } = trace(45, input); let end=0, farthest=0, jumps=0, start=0;
  const view = (i) => ({ rows: [row("Vùng nhảy hiện tại", "Current jump frontier", input.map((v,k) => tile(v, k === i ? "active" : k>=start && k<=end ? "done" : "", k)))], ranges: [{ from:start, to:end, label:bi("Vùng hiện tại", "Current frontier") }, { from:end+1, to:Math.min(farthest,input.length-1), label:bi("Vùng kế tiếp", "Next frontier") }], result:jumps });
  emit("jumps = end = farthest = 0", "Bắt đầu ở vị trí 0", "Start at index 0", view(0));
  for(let i=0; i<input.length-1; i++) {
    farthest=Math.max(farthest,i+input[i]);
    emit("farthest = max(farthest, i + nums[i])", `Từ ${i} vươn tới ${i+input[i]}`, `Index ${i} reaches ${i+input[i]}`, view(i), {i,end,farthest,jumps});
    if(i===end) { start=end+1; end=farthest; jumps++;
      emit("end = farthest", `Nhảy ${jumps}: mở vùng tới ${end}`, `Jump ${jumps}: extend frontier to ${end}`, view(i), {i,end,farthest,jumps}); }
  }
  emit("return jumps", `Số lần nhảy ít nhất: ${jumps}`, `Minimum jumps: ${jumps}`, view(input.length-1), {jumps}, true); return done(jumps);
}
lesson(45,"Jump Game II","jump-game-ii","greedy",bi("Mở rộng vùng tới được sau mỗi lần nhảy", "Expand reachable frontiers one jump at a time"),
  bi("Tìm số lần nhảy ít nhất tới cuối mảng. nums[i] là bước nhảy tối đa từ i. Hỗ trợ 1–100 phần tử, đảm bảo tới được cuối.", "Find the fewest jumps to the last index. nums[i] is the maximum jump from i. Supports 1–100 entries; the last index must be reachable."),"2,3,1,1,4","nonneg",`
class Solution:
    def jump(self, nums: list[int]) -> int:
        jumps = end = farthest = 0
        for i in range(len(nums) - 1):
            farthest = max(farthest, i + nums[i])
            if i == end:
                jumps += 1
                end = farthest
        return jumps
`,jump,"O(n)","O(1)",{liveArgs:jumpArgs});

function spiral(input) {
  const n=scalar(input,1,12), {emit,done}=trace(59,input), a=Array.from({length:n},()=>Array(n).fill(0));
  let top=0,bottom=n-1,left=0,right=n-1,value=1;
  const put=(r,c,line,arrow)=>{a[r][c]=value++; emit(line,`Đi ${arrow}: ghi ${value-1} vào (${r},${c})`,`Move ${arrow}: write ${value-1} at (${r},${c})`,{ grid:{rows:n,cols:n,cells:a.flatMap((row,r1)=>row.map((v,c1)=>({r:r1,c:c1,text:v||"·",active:r===r1&&c===c1,done:v>0})))}, equation:`${top} ≤ row ≤ ${bottom} · ${left} ≤ col ≤ ${right}` },{value:value-1,top,bottom,left,right});};
  while(top<=bottom && left<=right){
    for(let c=left;c<=right;c++)put(top,c,"matrix[top][c] = value; value += 1","→"); top++;
    for(let r=top;r<=bottom;r++)put(r,right,"matrix[r][right] = value; value += 1","↓"); right--;
    if(top<=bottom){for(let c=right;c>=left;c--)put(bottom,c,"matrix[bottom][c] = value; value += 1","←");bottom--;}
    if(left<=right){for(let r=bottom;r>=top;r--)put(r,left,"matrix[r][left] = value; value += 1","↑");left++;}
  }
  emit("return matrix","Đã điền đủ n² ô theo xoắn ốc","All n² cells filled in spiral order",{ grid:{rows:n,cols:n,cells:a.flatMap((row,r)=>row.map((v,c)=>({r,c,text:v,done:true})))}, result:a },{},true); return done(a);
}
lesson(59,"Spiral Matrix II","spiral-matrix-ii","array",bi("Điền số theo đường xoắn ốc", "Fill numbers along a spiral"),bi("Tạo ma trận n × n chứa 1 đến n² theo chiều kim đồng hồ. Hình hỗ trợ n = 1–12.","Generate an n × n matrix of 1 through n² clockwise. Visual limit: n = 1–12."),"3","positive",`
class Solution:
    def generateMatrix(self, n: int) -> list[list[int]]:
        matrix = [[0] * n for _ in range(n)]
        top, bottom, left, right = 0, n - 1, 0, n - 1
        value = 1
        while top <= bottom and left <= right:
            for c in range(left, right + 1):
                matrix[top][c] = value; value += 1
            top += 1
            for r in range(top, bottom + 1):
                matrix[r][right] = value; value += 1
            right -= 1
            if top <= bottom:
                for c in range(right, left - 1, -1):
                    matrix[bottom][c] = value; value += 1
                bottom -= 1
            if left <= right:
                for r in range(bottom, top - 1, -1):
                    matrix[r][left] = value; value += 1
                left += 1
        return matrix
`,spiral,"O(n²)","O(n²)",{singleInput:true,maxInput:12,liveArgs:input=>[scalar(input,1,12)]});

const factorial=n=>{let f=1;for(let i=2;i<=n;i++)f*=i;return f;};
function permArgs(input,params={}){const n=scalar(input,1,9);return[n,int(params.k??3,1,factorial(n),"k")];}
function permutation(input,params){const[n,k]=permArgs(input,params),{emit,done}=trace(60,input),digits=Array.from({length:n},(_,i)=>i+1),chosen=[];let rank=k-1;
  while(digits.length){const block=factorial(digits.length-1),index=Math.floor(rank/block),before=[...digits]; chosen.push(digits.splice(index,1)[0]);
    emit("answer += str(digits.pop(index))",`Bỏ qua ${index} nhóm, mỗi nhóm ${block} hoán vị`,`Skip ${index} blocks of ${block} permutations`,{ rows:[row("Chọn chữ số đầu của nhóm", "Choose the block's first digit",before.map((d,i)=>tile(d,i===index?"active":"",`${i*block+1}–${(i+1)*block}`))),row("Tiền tố đã chọn", "Chosen prefix",chosen.map(d=>tile(d,"done")))],equation:`${rank} = ${index} × ${block} + ${rank%block}`,result:chosen.join("") },{rank,block,index});rank%=block;}
  const answer=chosen.join("");emit("return answer",`Hoán vị thứ ${k}`,`Permutation #${k}`,{result:answer,rows:[row("Kết quả", "Result",chosen.map(d=>tile(d,"done")))]},{},true);return done(answer);}
lesson(60,"Permutation Sequence","permutation-sequence","math",bi("Chọn nhóm bằng giai thừa", "Choose permutation blocks using factorials"),bi("Tìm hoán vị thứ k (từ 1) theo thứ tự từ điển của 1..n. n = 1–9; k ≤ n!.","Find the kth (1-based) lexicographic permutation of 1..n. n = 1–9; k ≤ n!."),"3","positive",`
class Solution:
    def getPermutation(self, n: int, k: int) -> str:
        from math import factorial
        digits = list(range(1, n + 1))
        k -= 1
        answer = ""
        while digits:
            block = factorial(len(digits) - 1)
            index, k = divmod(k, block)
            answer += str(digits.pop(index))
        return answer
`,permutation,"O(n²)","O(n)",{singleInput:true,maxInput:9,extraParams:[param("k","Thứ tự k (từ 1)","Rank k (1-based)",3,1,362880)],liveArgs:permArgs,difficulty:"hard"});

function partitionArgs(input,params={}){if(typeof input!=="string")throw new Error("head: chuỗi các số / comma-separated numbers.");let a;try{a=input.trim()===""?[]:input.trim().startsWith("[")?JSON.parse(input):input.split(",").map(s=>s.trim()===""?NaN:Number(s));}catch{throw new Error("head: ví dụ / example: 1,4,3,2,5,2 hoặc / or []");}if(!Array.isArray(a)||a.length>60||!a.every(v=>Number.isInteger(v)&&v>=-100&&v<=100))throw new Error("head: ≤60 số nguyên trong [-100,100] / integers in [-100,100].");return[a,int(params.x??3,-100,100,"x")];}
function partition(input,params){const[a,x]=partitionArgs(input,params),{emit,done}=trace(86,a),small=[],large=[];
  const view=(i)=>({rows:[row("Danh sách gốc · # là số hiệu node", "Original list · # identifies each node",a.map((v,k)=>tile(v,k===i?"active":"",`#${k}`)),true),row(`< ${x}`,`< ${x}`,small,true),row(`≥ ${x}`,`≥ ${x}`,large,true)]});
  emit("small = low = ListNode(0)","Tạo hai chuỗi node rỗng", "Create two empty node chains",view(-1));
  a.forEach((v,i)=>{(v<x?small:large).push(tile(v,v<x?"done":"warm",`#${i}`));emit(v<x?"low.next = head; low = head":"high.next = head; high = head",`${v} ${v<x?"<":"≥"} ${x} → nối vào đuôi`,`${v} ${v<x?"<":"≥"} ${x} → append to tail`,view(i),{x,current:v});});
  emit("high.next = None", "Ngắt đuôi chuỗi ≥ x để tránh chu trình", "Terminate the ≥ x chain to prevent a cycle",view(-1));
  const answer=[...small,...large].map(v=>v.text);emit("return small.next", "Nối chuỗi < x → chuỗi ≥ x", "Join the < x chain → the ≥ x chain",{rows:[row("Giữ thứ tự node trong mỗi nhóm", "Preserve node order inside each group",[...small,...large],true)],result:answer},{},true);return done(answer);}
lesson(86,"Partition List","partition-list","linked-list",bi("Tách node thành hai chuỗi rồi nối lại", "Split nodes into two chains, then join"),bi("Đưa node < x lên trước node ≥ x, giữ nguyên thứ tự trong mỗi nhóm. Hỗ trợ ≤60 node, giá trị và x trong [-100,100].", "Place nodes < x before nodes ≥ x, preserving order inside each group. Supports ≤60 nodes; values and x in [-100,100]."),"1,4,3,2,5,2","string",`
class Solution:
    def partition(self, head: Optional[ListNode], x: int) -> Optional[ListNode]:
        small = low = ListNode(0)
        large = high = ListNode(0)
        while head:
            if head.val < x:
                low.next = head; low = head
            else:
                high.next = head; high = head
            head = head.next
        high.next = None
        low.next = large.next
        return small.next
`,partition,"O(n)","O(1)",{allowEmptyInput:true,inputLabel:bi("head · ví dụ 1,4,3,2,5,2 hoặc []", "head · e.g. 1,4,3,2,5,2 or []"),extraParams:[{...param("x","Ngưỡng x","Threshold x",3,-100,100),allowNegative:true}],liveArgs:(input,params)=>{const[a,x]=partitionArgs(input,params);return[{__viz_type:"linked_list",values:a},x];}});

function gray(input){const n=scalar(input,1,8),{emit,done}=trace(89,input),answer=[];const bits=v=>v.toString(2).padStart(n,"0");
  for(let i=0;i<2**n;i++){const g=i^(i>>1),prev=answer.at(-1);answer.push(g);emit("answer.append(i ^ (i >> 1))",`${bits(i)} XOR ${bits(i>>1)} = ${bits(g)}`,`${bits(i)} XOR ${bits(i>>1)} = ${bits(g)}`,{rows:[row("i", "i",bits(i).split("").map(c=>tile(c))),row("i >> 1", "i >> 1",bits(i>>1).split("").map(c=>tile(c))),row("Mã Gray · bit đổi được tô màu", "Gray code · changed bit highlighted",bits(g).split("").map((c,k)=>tile(c,prev!==undefined&&bits(prev)[k]!==c?"active":"done")))],sequence:answer.map(v=>bits(v)),equation:prev===undefined?"0":`${bits(prev)} → ${bits(g)}`},{i,gray:g});}
  emit("return answer", "Mỗi cặp kề nhau đổi đúng một bit, kể cả cuối → đầu", "Every adjacent pair differs by one bit, including last → first",{sequence:answer.map(v=>bits(v)),result:answer},{},true);return done(answer);}
lesson(89,"Gray Code","gray-code","bitmask",bi("Đổi đúng một bit mỗi bước", "Change exactly one bit at each step"),bi("Tạo dãy Gray n bit bắt đầu bằng 0. Hai số kề nhau, kể cả cuối và đầu, khác đúng một bit. Hình hỗ trợ n = 1–8.","Generate an n-bit Gray sequence starting at 0. Adjacent numbers, including last and first, differ in exactly one bit. Visual limit: n = 1–8."),"3","positive",`
class Solution:
    def grayCode(self, n: int) -> list[int]:
        answer = []
        for i in range(1 << n):
            answer.append(i ^ (i >> 1))
        return answer
`,gray,"O(2ⁿ)","O(2ⁿ)",{singleInput:true,maxInput:8,liveArgs:input=>[scalar(input,1,8)]});

function ipArgs(input){if(typeof input!=="string"||!/^\d{1,20}$/.test(input))throw new Error("s: 1–20 chữ số / digits.");return[input];}
function restore(input){const[s]=ipArgs(input),{emit,done}=trace(93,s),answer=[],parts=[];
  function dfs(pos){const remaining=s.length-pos,slots=4-parts.length;
    const view=(candidate="",bad=false,at=pos)=>({rows:[row("Bốn phần của IP", "Four IP parts",Array.from({length:4},(_,i)=>tile(parts[i]??(i===parts.length?candidate:"?"),i===parts.length?bad?"bad":"active":"done"))),row("Chữ số còn lại", "Remaining digits",s.slice(at).split("").map(c=>tile(c)))],sequence:[...answer],equation:`${s.length-at} digits · ${4-parts.length} slots`});
    if(remaining<slots||remaining>3*slots){emit("return", "Cắt nhánh: số chữ số không vừa số phần còn lại", "Prune: remaining digits cannot fit remaining parts",view(),{pos,parts:[...parts]});return;}
    if(parts.length===4){answer.push(parts.join("."));emit('answer.append(".".join(parts))',`Tìm thấy ${answer.at(-1)}`,`Found ${answer.at(-1)}`,view(),{pos,parts:[...parts]});return;}
    for(let size=1;size<=3&&pos+size<=s.length;size++){const part=s.slice(pos,pos+size);if((part.length>1&&part[0]==="0")||Number(part)>255){emit("break",`Loại ${part}: số 0 đầu hoặc >255`,`Reject ${part}: leading zero or >255`,view(part,true),{pos,part});break;}
      parts.push(part);emit("parts.append(part)",`Chọn ${part}`,`Choose ${part}`,view("",false,pos+size),{pos,parts:[...parts]});dfs(pos+size);parts.pop();emit("parts.pop()",`Quay lui: bỏ ${part}`,`Backtrack: remove ${part}`,view(),{pos,parts:[...parts]});}
  }dfs(0);emit("return answer",`Tìm được ${answer.length} địa chỉ`,`Found ${answer.length} addresses`,{sequence:answer,result:answer},{},true);return done(answer);}
lesson(93,"Restore IP Addresses","restore-ip-addresses","backtracking",bi("Thử bốn phần IP và cắt nhánh sai", "Try four IP parts and prune invalid branches"),bi("Chèn ba dấu chấm để tạo mọi IP hợp lệ: mỗi phần 0–255, không có số 0 đầu trừ số 0. Hỗ trợ 1–20 chữ số.","Insert three dots to form every valid IPv4 address: each part is 0–255, with no leading zeros except 0 itself. Supports 1–20 digits."),"25525511135","string",`
class Solution:
    def restoreIpAddresses(self, s: str) -> list[str]:
        answer, parts = [], []
        def dfs(pos):
            remaining, slots = len(s) - pos, 4 - len(parts)
            if remaining < slots or remaining > 3 * slots:
                return
            if len(parts) == 4:
                answer.append(".".join(parts))
                return
            for size in range(1, 4):
                if pos + size > len(s):
                    break
                part = s[pos:pos + size]
                if (len(part) > 1 and part[0] == "0") or int(part) > 255:
                    break
                parts.append(part)
                dfs(pos + size)
                parts.pop()
        dfs(0)
        return answer
`,restore,"O(3⁴)","O(1) + output",{liveArgs:ipArgs});

function serialize(tree){if(!tree)return[];const q=[tree],out=[];for(let i=0;i<q.length;i++){const t=q[i];out.push(t?t.val:null);if(t)q.push(t.left,t.right);}while(out.at(-1)===null)out.pop();return out;}
function generate(input){const n=scalar(input,1,5),{emit,done}=trace(95,input),memo=new Map();
  function build(lo,hi){if(lo>hi)return[null];const key=`${lo}:${hi}`;if(memo.has(key))return memo.get(key);const trees=[];
    for(let root=lo;root<=hi;root++){const left=build(lo,root-1),right=build(root+1,hi);for(const l of left)for(const r of right){trees.push({val:root,left:l,right:r});emit("trees.append(TreeNode(root, left, right))",`Gốc ${root}: ghép một cây trái và một cây phải`,`Root ${root}: combine one left and one right tree`,{forest:trees.slice(-6),equation:`[${lo}..${root-1}] ← ${root} → [${root+1}..${hi}]`,rows:[row("Các giá trị trong khoảng", "Values in this interval",Array.from({length:hi-lo+1},(_,i)=>tile(lo+i,lo+i===root?"active":lo+i<root?"done":"warm")))]},{lo,hi,root,count:trees.length});}}memo.set(key,trees);return trees;}
  const trees=build(1,n),answer=trees.map(serialize);emit("return list(build(1, n))",`${answer.length} cây BST khác nhau`,`${answer.length} unique BSTs`,{forest:trees,result:`${answer.length} BSTs`},{count:answer.length},true);return done(answer);}
lesson(95,"Unique Binary Search Trees II","unique-binary-search-trees-ii","bst",bi("Ghép mọi cặp cây con để tạo BST", "Combine all pairs of subtrees to build BSTs"),bi("Sinh mọi BST chứa 1..n. Chọn gốc, ghép mọi cây trái với mọi cây phải. Hình hỗ trợ n = 1–5; kết quả là các mảng level-order, null là node trống.","Generate all BSTs containing 1..n. Choose a root and combine every left subtree with every right subtree. Visual limit: n = 1–5; results are level-order arrays with null for absent nodes."),"3","positive",`
class Solution:
    def generateTrees(self, n: int) -> list[Optional[TreeNode]]:
        from functools import lru_cache
        @lru_cache(None)
        def build(lo, hi):
            if lo > hi:
                return (None,)
            trees = []
            for root in range(lo, hi + 1):
                for left in build(lo, root - 1):
                    for right in build(root + 1, hi):
                        trees.append(TreeNode(root, left, right))
            return tuple(trees)
        return list(build(1, n))
`,generate,"O(n · Cₙ)","O(n · Cₙ)",{singleInput:true,maxInput:5,liveArgs:input=>[scalar(input,1,5)]});

function countTrees(input){const n=scalar(input,1,19),{emit,done}=trace(96,input),dp=Array(n+1).fill(0);dp[0]=1;
  emit("dp[0] = 1", "Cây rỗng có 1 cách", "An empty tree has 1 arrangement",{rows:[row("dp · số cây", "dp · tree counts",dp.map((v,i)=>tile(v,i===0?"active":"",i)))]});
  for(let size=1;size<=n;size++)for(let left=0;left<size;left++){const right=size-1-left,add=dp[left]*dp[right];dp[size]+=add;emit("dp[size] += dp[left] * dp[right]",`${size} node: ${left} trái × ${right} phải`,`${size} nodes: ${left} left × ${right} right`,{rows:[row("Trái", "Left",Array.from({length:left},()=>tile("●","done"))),row("Gốc", "Root",[tile("●","active")]),row("Phải", "Right",Array.from({length:right},()=>tile("●","warm"))),row("dp · số cây", "dp · tree counts",dp.map((v,i)=>tile(v,i===size?"active":i===left||i===right?"done":"",i)))],equation:`dp[${size}] += ${dp[left]} × ${dp[right]} = ${add}`,result:dp[size]},{size,left,right,dp:[...dp]});}
  emit("return dp[n]",`${dp[n]} cây BST`,`${dp[n]} unique BSTs`,{rows:[row("dp", "dp",dp.map((v,i)=>tile(v,i===n?"active":"",i)))],result:dp[n]},{},true);return done(dp[n]);}
lesson(96,"Unique Binary Search Trees","unique-binary-search-trees","dp",bi("Đếm cây bằng số node bên trái và bên phải", "Count trees using left and right subtree sizes"),bi("Đếm số BST khác nhau chứa 1..n, n = 1–19. Với mỗi gốc: số cách = số cây trái × số cây phải. dp[0] = 1.","Count distinct BSTs containing 1..n, n = 1–19. For each root, multiply the number of left and right subtrees. dp[0] = 1."),"3","positive",`
class Solution:
    def numTrees(self, n: int) -> int:
        dp = [0] * (n + 1)
        dp[0] = 1
        for size in range(1, n + 1):
            for left in range(size):
                right = size - 1 - left
                dp[size] += dp[left] * dp[right]
        return dp[n]
`,countTrees,"O(n²)","O(n)",{singleInput:true,maxInput:19,liveArgs:input=>[scalar(input,1,19)]});

module.exports = lessons;
