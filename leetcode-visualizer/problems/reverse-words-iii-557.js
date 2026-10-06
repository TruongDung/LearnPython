"use strict";

const bi=(vi,en)=>({vi,en});
const SOURCE=[
  "class Solution:",
  "    def reverseWords(self, s: str) -> str:",
  "        chars = list(s)",
  "        start = 0",
  "        for end in range(len(chars) + 1):",
  "            if end == len(chars) or chars[end] == ' ':",
  "                left, right = start, end - 1",
  "                while left < right:",
  "                    chars[left], chars[right] = chars[right], chars[left]",
  "                    left += 1",
  "                    right -= 1",
  "                start = end + 1",
  "        return ''.join(chars)",
];

function parseInput(input){
  if(typeof input!=="string" || input.length<1 || input.length>80 || input.match(/^[\x20-\x7e]+$/)?.[0]!==input || !/[^ ]/.test(input)){
    throw new Error("557: visualization accepts 1–80 printable ASCII characters with at least one word / mô phỏng nhận 1–80 ký tự ASCII in được, có ít nhất một từ.");
  }
  return input;
}

function buildSteps(input){
  const s=parseInput(input);
  const chars=[...s];
  const segments=[...s.matchAll(/[^ ]+| +/g)].map(match=>({text:match[0],start:match.index,end:match.index+match[0].length-1,space:match[0][0]===" "}));
  const steps=[];
  const locals={s,chars};
  let start=null,end=null,left=null,right=null,wordRange=null,swap=null;
  let completedWords=0;
  const emit=(line,phase,title,note,final=false)=>steps.push({
    arr:[],codeLines:[line],title,note,final,
    vars:Object.entries(locals).map(([name,value])=>({name,value:Array.isArray(value)?[...value]:value})),
    reverseWords557View:{s,chars:[...chars],segments,start,end,left,right,wordRange,swap,completedWords,phase},
  });
  emit(3,"init",bi("Tạo mảng ký tự", "Create a character array"),bi("Đảo ký tự bên trong từng từ, giữ nguyên thứ tự từ và vị trí khoảng trắng.", "Reverse characters within each word, preserving word order and space positions."));
  start=0;locals.start=start;
  emit(4,"start",bi("start = 0", "start = 0"),bi("start đánh dấu đầu từ tiếp theo. end sẽ quét tìm khoảng trắng hoặc cuối chuỗi.", "start marks the next word's beginning. end scans for a space or the end of the string."));
  for(end=0;end<=chars.length;end++){
    locals.end=end;left=null;right=null;wordRange=null;swap=null;
    emit(5,"scan",bi(end===chars.length?`end = ${end}: đến cuối chuỗi`:`end = ${end}: đọc ${JSON.stringify(chars[end])}`,end===chars.length?`end = ${end}: reached the end`:`end = ${end}: read ${JSON.stringify(chars[end])}`),bi("Chưa đảo từ cho tới khi tìm thấy ranh giới.", "Do not reverse the word until its boundary is found."));
    const boundary=end===chars.length || chars[end]===" ";
    if(boundary && start<end) wordRange={start,end:end-1};
    emit(6,"boundary",bi(`Cuối chuỗi hoặc khoảng trắng → ${boundary?"True":"False"}`, `End of string or space → ${boundary?"True":"False"}`),bi(boundary?start<end?`Từ nằm ở [${start}…${end-1}]. Không đưa khoảng trắng vào phần đảo.`:"Không có từ giữa hai ranh giới: giữ khoảng trắng, không đổi cặp nào.":"Vẫn ở trong từ: tiếp tục quét.",boundary?start<end?`The word occupies [${start}…${end-1}]. Exclude the space from the reversal.`:"No word between these boundaries: preserve the space without swapping.":"Still inside a word: continue scanning."));
    if(boundary){
      left=start;right=end-1;locals.left=left;locals.right=right;
      emit(7,"pointers",bi(`left = ${left}, right = ${right}`, `left = ${left}, right = ${right}`),bi("Hai con trỏ giới hạn đúng từ hiện tại. Khoảng trắng nằm ngoài phạm vi.", "The pointers bound only the current word. Spaces are outside this range."));
      while(true){
        swap=null;
        const more=left<right;
        if(!more && start<end)completedWords++;
        emit(8,more?"check":"word-done",bi(`left < right → ${more?"True: đổi cặp":"False: từ đã xong"}`, `left < right → ${more?"True: swap a pair":"False: word complete"}`),bi(more?"Đổi hai ký tự ở hai đầu, rồi dịch con trỏ vào giữa.":"Không còn cặp cần đổi. Tiếp tục với từ sau ranh giới này.",more?"Swap the two ends, then move inward.":"No pairs remain. Continue with the next word after this boundary."));
        if(!more)break;
        swap={left,right,before:[chars[left],chars[right]]};
        [chars[left],chars[right]]=[chars[right],chars[left]];
        emit(9,"swap",bi(`Đổi ${JSON.stringify(swap.before[0])} ↔ ${JSON.stringify(swap.before[1])}`, `Swap ${JSON.stringify(swap.before[0])} ↔ ${JSON.stringify(swap.before[1])}`),bi(`Chỉ đổi vị trí ${left} và ${right} trong từ này. Những từ khác và khoảng trắng giữ nguyên.`, `Swap only positions ${left} and ${right} within this word. Other words and spaces stay unchanged.`));
        swap=null;left++;locals.left=left;
        emit(10,"move-left",bi(`left += 1 → ${left}`, `left += 1 → ${left}`),bi("Dịch left vào giữa một vị trí.", "Move left one position inward."));
        right--;locals.right=right;
        emit(11,"move-right",bi(`right -= 1 → ${right}`, `right -= 1 → ${right}`),bi("Dịch right vào giữa, rồi kiểm tra lại.", "Move right inward, then check again."));
      }
      start=end+1;locals.start=start;
      emit(12,"advance",bi(`start = end + 1 = ${start}`, `start = end + 1 = ${start}`),bi(end===chars.length?"Đã xử lý từ cuối; vòng for sẽ kết thúc.":"Bỏ qua khoảng trắng đã giữ nguyên. Từ tiếp theo bắt đầu sau nó.",end===chars.length?"The final word is processed; the for loop will finish.":"Skip the preserved space. The next word starts after it."));
    }
  }
  const answer=chars.join("");
  end=null;left=null;right=null;wordRange=null;swap=null;
  emit(13,"done",bi(`Kết quả: ${answer}`, `Result: ${answer}`),bi("Mỗi từ đã đảo riêng. Thứ tự từ, độ dài chuỗi và vị trí khoảng trắng không đổi.", "Each word is reversed separately. Word order, string length and space positions are unchanged."),true);
  return {original:s,answer,steps};
}

module.exports={
  557:{
    id:557,slug:"reverse-words-in-a-string-iii",difficulty:"easy",
    category:{key:"string",vi:"Chuỗi",en:"String"},tags:[{key:"two-pointer",vi:"Hai con trỏ",en:"Two Pointers"}],
    title:bi("Reverse Words in a String III", "Reverse Words in a String III"),titleVi:bi("Đảo ký tự trong từng từ, giữ thứ tự từ", "Reverse each word, preserve word order"),
    statement:bi("Cho câu s. Đảo thứ tự ký tự trong từng từ, giữ nguyên khoảng trắng và thứ tự các từ. Ví dụ: Mr Ding → rM gniD. Dấu câu thuộc từ cũng được đảo.", "Given sentence s, reverse the characters within each word while preserving whitespace and word order. Example: Mr Ding → rM gniD. Punctuation within a word is reversed too."),
    inputKind:"string",preserveInputWhitespace:true,inputLabel:bi("s — câu ASCII, tối đa 80 ký tự để mô phỏng", "s — ASCII sentence, up to 80 characters for visualization"),defaultInput:"Let's take LeetCode contest",extraParams:[],debugMode:"line-by-line",
    approach:[
      bi("end quét tới khoảng trắng hoặc cuối chuỗi; từ hiện tại nằm ở [start, end−1].", "Scan end to a space or the string's end; the current word occupies [start, end−1]."),
      bi("Đặt left = start, right = end−1. Đổi từng cặp và dịch hai con trỏ vào giữa.", "Set left = start and right = end−1. Swap pairs and move both pointers inward."),
      bi("Khoảng trắng không nằm trong phần đảo. start = end+1 để chuyển sang từ sau.", "Spaces are outside the reversal range. Set start = end+1 to continue with the next word."),
      bi("Mô phỏng tối đa 80 ký tự để xem từng bước; mã Python hỗ trợ giới hạn gốc 50.000 ký tự.", "The visualization accepts up to 80 characters to show every step; the Python solution supports the original 50,000-character limit."),
    ],
    complexity:{time:"O(n)",space:"O(n)",note:bi("Quét mỗi ký tự một lần và đổi mỗi cặp một lần. chars dùng O(n) vì chuỗi Python không sửa trực tiếp được; không tính các khung mô phỏng.", "Scan each character once and swap each pair once. chars uses O(n) space because Python strings are immutable; excludes visualization frames.")},
    code:SOURCE,builder:buildSteps,liveArgs:input=>[parseInput(input)],
  },
};
