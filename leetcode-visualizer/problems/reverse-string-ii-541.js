"use strict";

const bi = (vi,en) => ({vi,en});
const MAX_VISUAL_LENGTH = 80;
const SOURCE = [
  "class Solution:",
  "    def reverseStr(self, s: str, k: int) -> str:",
  "        chars = list(s)",
  "        for start in range(0, len(chars), 2 * k):",
  "            left = start",
  "            right = min(start + k, len(chars)) - 1",
  "            while left < right:",
  "                chars[left], chars[right] = chars[right], chars[left]",
  "                left += 1",
  "                right -= 1",
  "        return ''.join(chars)",
];

function parseInput(input, params = {}) {
  if (typeof input !== "string" || input.length < 1 || input.length > MAX_VISUAL_LENGTH || input.match(/^[a-z]+$/)?.[0] !== input) {
    throw new Error(`541: visualization accepts 1–${MAX_VISUAL_LENGTH} lowercase letters / mô phỏng nhận 1–${MAX_VISUAL_LENGTH} chữ thường.`);
  }
  const k = params.k;
  if (!Number.isInteger(k) || k < 1 || k > 10000) throw new Error("541: k must be an integer from 1 to 10000 / k phải là số nguyên từ 1 đến 10000.");
  return {s:input,k};
}

function buildSteps(input, params) {
  const {s,k} = parseInput(input,params);
  const chars = [...s];
  const steps = [];
  const locals = {s,k,chars};
  let start = null;
  let left = null;
  let right = null;
  let swap = null;
  const emit = (line,phase,title,note,final=false) => steps.push({
    arr:[],codeLines:[line],title,note,final,
    vars:Object.entries(locals).map(([name,value])=>({name,value:Array.isArray(value)?[...value]:value})),
    reverseString541View:{s,k,chars:[...chars],start,left,right,swap,phase},
  });
  emit(3,"init",bi("Tạo mảng ký tự có thể đổi chỗ", "Create a mutable character array"),bi("Mỗi đoạn dài 2k: đảo tối đa k ký tự đầu, giữ nguyên phần sau.", "For each 2k block, reverse up to the first k characters and keep the rest unchanged."));
  for (start=0;start<chars.length;start+=2*k) {
    left=null;right=null;swap=null;locals.start=start;
    const end = Math.min(start+2*k,chars.length)-1;
    const reverseEnd = Math.min(start+k,chars.length)-1;
    const remaining = chars.length-start;
    const rule = remaining<k
      ? bi(`Còn ${remaining} < k=${k}: đảo toàn bộ ${remaining} ký tự cuối.`, `Only ${remaining} < k=${k} remain: reverse all ${remaining} remaining characters.`)
      : remaining<2*k
        ? bi(`Còn ${remaining} ký tự, từ k đến dưới 2k: đảo ${k} ký tự đầu; giữ ${remaining-k} ký tự sau.`, `${remaining} characters remain, between k and 2k: reverse the first ${k}; keep the last ${remaining-k}.`)
        : bi(`Đoạn đủ 2k=${2*k} ký tự: đảo ${k} ký tự đầu; giữ ${k} ký tự sau.`, `Full 2k=${2*k} block: reverse the first ${k} characters; keep the next ${k}.`);
    emit(4,"block",bi(`Chọn đoạn [${start}…${end}]`, `Select block [${start}…${end}]`),rule);
    left=start;locals.left=left;
    emit(5,"left",bi(`left = ${left}`, `left = ${left}`),bi("Con trỏ trái ở đầu phần cần đảo.", "The left pointer starts at the beginning of the reversal range."));
    right=reverseEnd;locals.right=right;
    emit(6,"right",bi(`right = min(${start}+${k}, ${chars.length}) − 1 = ${right}`, `right = min(${start}+${k}, ${chars.length}) − 1 = ${right}`),bi("Chặn right ở cuối chuỗi; chỉ đảo phần đầu, không chạm phần giữ nguyên.", "Clamp right to the end of the string; reverse only the first part and leave the kept part untouched."));
    while (true) {
      swap=null;
      const more=left<right;
      emit(7,more?"check":"block-done",bi(`left < right → ${more ? "True: đổi cặp" : "False: đoạn đã xong"}`, `left < right → ${more ? "True: swap a pair" : "False: block complete"}`),bi(more?"Đổi cặp ở hai đầu, rồi thu hẹp vào giữa.":`Không còn cặp để đổi. Vòng for chọn start tiếp theo bằng cách cộng 2k=${2*k}.`,more?"Swap the two ends, then move inward.":`No pairs remain. The for loop selects the next start by adding 2k=${2*k}.`));
      if (!more) break;
      swap={left,right,before:[chars[left],chars[right]]};
      [chars[left],chars[right]]=[chars[right],chars[left]];
      emit(8,"swap",bi(`Đổi '${swap.before[0]}' ↔ '${swap.before[1]}'`, `Swap '${swap.before[0]}' ↔ '${swap.before[1]}'`),bi(`Đổi vị trí ${left} và ${right}. Input gốc s vẫn giữ nguyên; chars đã cập nhật.`, `Swap positions ${left} and ${right}. Original s is unchanged; chars has been updated.`));
      swap=null;left++;locals.left=left;
      emit(9,"move-left",bi(`left += 1 → ${left}`, `left += 1 → ${left}`),bi("Dịch con trỏ trái vào giữa một vị trí.", "Move the left pointer one position inward."));
      right--;locals.right=right;
      emit(10,"move-right",bi(`right -= 1 → ${right}`, `right -= 1 → ${right}`),bi("Dịch con trỏ phải vào giữa, rồi kiểm tra left < right lần nữa.", "Move the right pointer inward, then check left < right again."));
    }
  }
  const answer=chars.join("");
  start=null;left=null;right=null;swap=null;
  emit(11,"done",bi(`Kết quả: ${answer}`, `Result: ${answer}`),bi("Các phần đầu đã đảo; phần sau trong mỗi đoạn 2k được giữ nguyên. Ghép chars thành chuỗi.", "The first parts are reversed; the second parts of each 2k block remain unchanged. Join chars into a string."),true);
  return {original:s,k,answer,steps};
}

module.exports={
  541:{
    id:541,slug:"reverse-string-ii",difficulty:"easy",
    category:{key:"string",vi:"Chuỗi",en:"String"},tags:[{key:"two-pointer",vi:"Hai con trỏ",en:"Two Pointers"}],
    title:bi("Reverse String II", "Reverse String II"),titleVi:bi("Đảo k ký tự đầu trong mỗi đoạn 2k", "Reverse the first k characters of each 2k block"),
    statement:bi("Cho chuỗi s và số nguyên k. Trong mỗi đoạn 2k ký tự từ đầu chuỗi, đảo k ký tự đầu và giữ nguyên phần sau. Nếu còn ít hơn k ký tự, đảo tất cả phần còn lại. Ví dụ: abcdefg, k=2 → bacdfeg.", "Given s and k, reverse the first k characters in every 2k block from the beginning and keep the rest unchanged. If fewer than k remain, reverse all remaining characters. Example: abcdefg, k=2 → bacdfeg."),
    inputKind:"string",inputLabel:bi("s — 1–80 chữ thường để mô phỏng", "s — 1–80 lowercase letters for visualization"),defaultInput:"abcdefg",
    extraParams:[{key:"k",type:"number",label:bi("k — số ký tự đầu cần đảo", "k — number of leading characters to reverse"),default:2,min:1,max:10000}],debugMode:"line-by-line",
    approach:[
      bi("start = 0, 2k, 4k, …; mỗi lần chỉ xử lý k ký tự đầu của đoạn.", "Visit start = 0, 2k, 4k, …; process only the first k characters of each block."),
      bi("left = start; right = min(start+k, len(s))−1. Đổi cặp left/right rồi dịch vào giữa.", "Set left = start and right = min(start+k, len(s))−1. Swap left/right and move inward."),
      bi("Phần còn lại trong đoạn được giữ nguyên. k=1 không đổi chuỗi; k lớn hơn độ dài sẽ đảo cả chuỗi.", "Keep the rest of the block unchanged. k=1 leaves the string unchanged; k larger than the length reverses the whole string."),
      bi("Mô phỏng nhận tối đa 80 ký tự để xem từng lần đổi chỗ; mã Python hỗ trợ giới hạn gốc 10.000 ký tự.", "The visualization accepts up to 80 characters to show every swap; the Python solution supports the original 10,000-character limit."),
    ],
    complexity:{time:"O(n)",space:"O(n)",note:bi("chars dùng O(n) bộ nhớ vì chuỗi Python không sửa trực tiếp được. Hai con trỏ dùng O(1); không tính các khung mô phỏng.", "chars uses O(n) space because Python strings are immutable. The two pointers use O(1); excludes visualization frames.")},
    code:SOURCE,builder:buildSteps,liveArgs:(input,params)=>{const parsed=parseInput(input,params);return [parsed.s,parsed.k];},
  },
};
