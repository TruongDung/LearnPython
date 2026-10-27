"use strict";
const base = require("./backtracking")[46];
const bi = (vi,en) => ({vi,en});
const CODE = Object.freeze([
  "class Solution:",
  "    def permute(self, nums):",
  "        result = []",
  "        current = []",
  "        used = [False] * len(nums)",
  "",
  "        def backtrack():",
  "            if len(current) == len(nums):",
  "                result.append(current[:])",
  "                return",
  "            for i in range(len(nums)):",
  "                if not used[i]:",
  "                    used[i] = True",
  "                    current.append(nums[i])",
  "                    backtrack()",
  "                    current.pop()",
  "                    used[i] = False",
  "",
  "        backtrack()",
  "        return result",
]);
function parse46(input) {
  if(!Array.isArray(input)||input.length<1||input.length>6||!input.every(Number.isSafeInteger)||new Set(input).size!==input.length) {
    throw new RangeError("#46: nhập 1–6 số nguyên khác nhau / enter 1–6 distinct safe integers.");
  }
  return [...input];
}
function buildSteps46(input) {
  const nums=parse46(input),current=[],used=nums.map(()=>false),indices=[],result=[],stack=[],nodes=[],children=new Map(),steps=[];
  const total=nums.reduce((p,_,i)=>p*(i+1),1);
  let currentReady=false,usedReady=false;
  function emit(line,phase,title,detail={},final=false) {
    const f=stack.at(-1),from=final?0:Math.max(0,result.length-12);
    const locals={nums:[...nums],...(currentReady?{current:[...current]}:{}),...(usedReady?{used:[...used]}:{}),...(f?.i===undefined?{}:{i:f.i})};
    const anchors=f?stack.slice(-4).map(frame=>frame.id):nodes.length?[0]:[],shown=new Set(anchors),active=new Set(stack.map(frame=>frame.id));
    for(const id of anchors.slice(-2))for(const child of children.get(id)||[])shown.add(child);
    steps.push({title,note:bi("",""),arr:[],codeLines:[line],final,
      vars:[{name:"i",value:f?.i??"—"},{name:"nums[i]",value:f?.i===undefined?"—":nums[f.i]},
        {name:"used[i]",value:f?.i===undefined||!usedReady?"—":used[f.i]},{name:"current",value:currentReady?[...current]:"—"},
        {name:"used",value:usedReady?[...used]:"—"},{name:"len(result)",value:result.length}],
      permutations46View:{nums:[...nums],phase,source:{line,text:CODE[line-1],timing:"after"},scope:f?"backtrack":"permute",locals,currentReady,usedReady,
        indices:[...indices],stack:stack.map(frame=>({...frame,currentLength:current.length})),currentId:f?.id??null,
        tree:[...shown].sort((a,b)=>a-b).map(id=>({...nodes[id],path:[...nodes[id].path],state:id===f?.id?"current":active.has(id)?"ancestor":nodes[id].status})),
        visitedCount:nodes.length,results:result.slice(from).map(row=>[...row]),shownFrom:from,resultCount:result.length,total,...detail},
    });
  }
  emit(3,"result-init",bi("result = []","result = []"));
  currentReady=true;emit(4,"current-init",bi("current = []","current = []"));
  usedReady=true;emit(5,"used-init",bi("Mọi vị trí chưa dùng","All indices are unused"));
  emit(7,"define",bi("Tạo hàm backtrack","Define backtrack"));
  function backtrack(parentId=null,via=null) {
    const node={id:nodes.length,parentId,via,path:[...indices],depth:stack.length,status:"explored"};nodes.push(node);
    if(parentId!==null){if(!children.has(parentId))children.set(parentId,[]);children.get(parentId).push(node.id);}
    const f={id:node.id};stack.push(f);
    const complete=current.length===nums.length;
    emit(8,"complete-check",bi(complete?"✓ Đủ mọi vị trí":"Còn ô cần điền",complete?"✓ Every slot filled":"Slots remain"));
    if(complete){result.push([...current]);node.status="solution";emit(9,"save",bi(`Lưu [${current.join(", ")}]`,`Save [${current.join(", ")}]`));emit(10,"return-solution",bi("↩ Về frame cha","↩ Return to parent"));stack.pop();return;}
    for(let i=0;i<nums.length;i++) {
      f.i=i;emit(11,"choose",bi(`Xét nums[${i}] = ${nums[i]}`,`Inspect nums[${i}] = ${nums[i]}`));
      const allowed=!used[i];emit(12,allowed?"allow":"blocked",bi(allowed?"✓ Chưa dùng":"✕ Đã dùng trong current",allowed?"✓ Not used":"✕ Already used in current"));
      if(allowed) {
        used[i]=true;emit(13,"reserve",bi(`Đánh dấu used[${i}] = True`,`Mark used[${i}] = True`));
        current.push(nums[i]);indices.push(i);emit(14,"append",bi(`Thêm ${nums[i]} vào ô ${current.length-1}`,`Append ${nums[i]} to slot ${current.length-1}`));
        backtrack(node.id,i);emit(15,"resume",bi("↩ Nhánh con hoàn tất","↩ Child branch returned"));
        const removed=current.pop();indices.pop();emit(16,"pop",bi(`Bỏ ${removed} khỏi current`,`Pop ${removed} from current`),{removed,removedIndex:i});
        used[i]=false;emit(17,"release",bi(`Mở lại used[${i}] = False`,`Release used[${i}] = False`));
      }
    }
    emit(11,"exhausted",bi("Đã xét hết vị trí","All indices explored"));stack.pop();
  }
  backtrack();emit(19,"root-return",bi("↩ Đã duyệt mọi nhánh","↩ All branches returned"));
  emit(20,"done",bi(`${result.length} hoán vị`,`${result.length} permutations`),{},true);
  return {original:[...nums],answer:result.map(row=>[...row]),steps};
}
module.exports={46:{...base,code:CODE,builder:buildSteps46,liveArgs:input=>[parse46(input)],debugMode:"line-by-line",
  inputLabel:bi("nums · 1–6 số nguyên khác nhau","nums · 1–6 distinct integers"),
  statement:bi("Xếp tất cả các số vào các vị trí. Mỗi số dùng đúng một lần; đổi thứ tự tạo hoán vị khác.","Arrange every number into a slot. Use each number once; a different order is a different permutation."),
  approach:[bi("Chọn số chưa used → đánh dấu → thêm vào current → đi sâu. Đủ ô thì lưu; pop và mở lại used để thử thứ tự khác.","Choose an unused number → mark used → append → recurse. Save a full order; pop and release used for another order.")],
  complexity:{time:"O(n · n!)",space:"O(n) + output",note:bi("Giữ đủ mọi dòng đã chạy và toàn bộ n! kết quả, với 1–6 phần tử.","Keep every executed line and all n! results for inputs of 1–6 elements.")},
}};
