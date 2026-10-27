"use strict";
const base = require("./backtracking")[40];
const bi = (vi, en) => ({ vi, en });
const CODE = Object.freeze([
  "class Solution:",
  "    def combinationSum2(self, candidates, target):",
  "        candidates.sort()",
  "        result = []",
  "        current = []",
  "",
  "        def backtrack(start, remain):",
  "            if remain == 0:",
  "                result.append(current[:])",
  "                return",
  "            for i in range(start, len(candidates)):",
  "                if i == start or candidates[i] != candidates[i - 1]:",
  "                    if candidates[i] > remain:",
  "                        return",
  "                    current.append(candidates[i])",
  "                    backtrack(i + 1, remain - candidates[i])",
  "                    current.pop()",
  "",
  "        backtrack(0, target)",
  "        return result",
]);
function parse40(input, params = {}) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 100 || input.some(n => !Number.isSafeInteger(n) || n < 1 || n > 50)) {
    throw new RangeError("#40: nhập 1–100 số nguyên trong 1–50, có thể trùng / enter 1–100 integers from 1 to 50, duplicates allowed.");
  }
  const target = params?.target;
  if (!Number.isSafeInteger(target) || target < 1 || target > 50) throw new RangeError("#40: target phải là số nguyên từ 1 đến 50 / target must be an integer from 1 to 50.");
  return {candidates:[...input],target};
}
function buildSteps40(input,params) {
  const {candidates,target}=parse40(input,params),original=[...candidates];
  const result=[],current=[],indices=[],stack=[],nodes=[],children=new Map(),steps=[];
  let resultReady=false,currentReady=false;
  candidates.sort((a,b)=>a-b);
  function emit(line,phase,title,detail={},final=false) {
    if(steps.length>=12000)throw new RangeError("#40: trace quá dài; giảm target hoặc bớt candidates / trace too long; reduce target or candidates.");
    const f=stack.at(-1),from=final?0:Math.max(0,result.length-12);
    const locals={candidates:[...candidates],...(!f?{target}:{}),...(currentReady?{current:[...current]}:{}),...(f?{start:f.start,remain:f.remain,...(f.i===undefined?{}:{i:f.i})}:{})};
    const anchors=f?stack.slice(-4).map(frame=>frame.id):nodes.length?[0]:[],shown=new Set(anchors),active=new Set(stack.map(frame=>frame.id));
    for(const id of anchors.slice(-2))for(const child of (children.get(id)||[]).slice(-16))shown.add(child);
    steps.push({title,note:bi("",""),arr:[],codeLines:[line],final,
      vars:[{name:"start",value:f?.start??"—"},{name:"i",value:f?.i??"—"},{name:"remain",value:f?.remain??"—"},
        {name:"current",value:currentReady?[...current]:"—"},{name:"sum(current)",value:currentReady?current.reduce((a,b)=>a+b,0):"—"},{name:"len(result)",value:resultReady?result.length:"—"}],
      combination40View:{original,candidates:[...candidates],target,phase,source:{line,text:CODE[line-1],timing:"after"},scope:f?"backtrack":"combinationSum2",locals,resultReady,currentReady,
        indices:[...indices],duplicate:f?.duplicate?{...f.duplicate}:null,tooLarge:f?.tooLarge??null,skipped:f?[...f.skipped]:[],
        stack:stack.map(frame=>({id:frame.id,start:frame.start,remain:frame.remain,...(frame.i===undefined?{}:{i:frame.i}),currentLength:current.length})),currentId:f?.id??null,
        tree:[...shown].sort((a,b)=>a-b).map(id=>({...nodes[id],state:id===f?.id?"current":active.has(id)?"ancestor":nodes[id].status})),visitedCount:nodes.length,
        results:result.slice(from).map(row=>[...row]),shownFrom:from,resultCount:resultReady?result.length:null,...detail},
    });
  }
  emit(3,"sort",bi("Sắp xếp candidates","Sort candidates"));
  resultReady=true;emit(4,"result-init",bi("result = []","result = []"));
  currentReady=true;emit(5,"current-init",bi("current = []","current = []"));
  emit(7,"define",bi("Tạo hàm backtrack","Define backtrack"));
  function backtrack(start,remain,parentId=null,via=null) {
    const node={id:nodes.length,parentId,start,remain,via,depth:stack.length,status:"explored"};nodes.push(node);
    if(parentId!==null){if(!children.has(parentId))children.set(parentId,[]);children.get(parentId).push(node.id);}
    const f={id:node.id,start,remain,skipped:[],duplicate:null,tooLarge:null};stack.push(f);
    emit(8,"zero-check",bi(remain===0?"✓ Đủ target":"remain ≠ 0",remain===0?"✓ Target reached":"remain ≠ 0"));
    if(remain===0){result.push([...current]);node.status="solution";emit(9,"save",bi(`Lưu [${current.join(", ")}]`,`Save [${current.join(", ")}]`));emit(10,"return-solution",bi("↩ Về frame cha","↩ Return to parent"));stack.pop();return;}
    for(let i=start;i<candidates.length;i++) {
      f.i=i;f.duplicate=null;f.tooLarge=null;emit(11,"choose",bi(`Xét [${i}] = ${candidates[i]}`,`Inspect [${i}] = ${candidates[i]}`));
      const first=i===start,different=first?null:candidates[i]!==candidates[i-1],allowed=first||different;
      f.duplicate={first,different,allowed};if(!allowed)f.skipped.push(i);
      emit(12,allowed?"allow":"skip-duplicate",bi(allowed?"✓ Nhánh mới":"↷ Bỏ nhánh trùng",allowed?"✓ New branch":"↷ Skip duplicate branch"));
      if(allowed) {
        f.tooLarge=candidates[i]>remain;emit(13,"prune-check",bi(f.tooLarge?`${candidates[i]} > ${remain} → dừng`:`${candidates[i]} ≤ ${remain}`,f.tooLarge?`${candidates[i]} > ${remain} → stop`:`${candidates[i]} ≤ ${remain}`));
        if(f.tooLarge){if(!(children.get(node.id)||[]).length)node.status="pruned";emit(14,"return-pruned",bi("↩ Các số sau cũng quá lớn","↩ Later values are also too large"));stack.pop();return;}
        current.push(candidates[i]);indices.push(i);emit(15,"append",bi(`Thêm [${i}] = ${candidates[i]}`,`Append [${i}] = ${candidates[i]}`));
        backtrack(i+1,remain-candidates[i],node.id,i);
        emit(16,"resume",bi("↩ Nhánh con hoàn tất","↩ Child branch returned"));
        const removed=current.pop();indices.pop();emit(17,"pop",bi(`Bỏ ${removed}, thử vị trí khác`,`Remove ${removed}, try another index`),{removed,removedIndex:i});
      }
    }
    emit(11,"exhausted",bi("Đã xét hết vị trí","All indices explored"));stack.pop();
  }
  backtrack(0,target);emit(19,"root-return",bi("↩ Đã duyệt mọi nhánh","↩ All branches returned"));
  emit(20,"done",bi(`${result.length} tổ hợp`,`${result.length} combinations`),{},true);
  return {original:[...original],target,answer:result.map(row=>[...row]),steps};
}
module.exports={40:{...base,code:CODE,builder:buildSteps40,debugMode:"line-by-line",liveArgs:(input,params)=>{const {candidates,target}=parse40(input,params);return [candidates,target];},
  inputLabel:bi("candidates · có thể trùng, mỗi vị trí dùng 1 lần","candidates · duplicates allowed, each index once"),
  statement:bi("Tìm các tổ hợp có tổng bằng target. Mỗi vị trí chỉ dùng một lần; kết quả không trùng nhau.","Find combinations summing to target. Use each index once; keep unique combinations."),
  approach:[bi("Sắp xếp → bỏ nhánh bằng số trước ở cùng cấp → chọn i rồi đi sâu từ i + 1. Dừng khi số tiếp theo lớn hơn remain.","Sort → skip equal siblings → choose i and recurse from i + 1. Stop when the next value exceeds remain.")],
  complexity:{time:"O(n log n + n · 2ⁿ)",space:"O(n) + output",note:bi("Sắp xếp và DFS; lưu bản sao cho mỗi tổ hợp đúng.","Sorting and DFS; copy each completed combination.")},
}};
