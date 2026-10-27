"use strict";
const base = require("./backtracking")[37];
const bi = (vi, en) => ({ vi, en });
const DIGITS = "123456789";
const CODE = [
  "class Solution:",
  "    def solveSudoku(self, board):",
  "        rows = [set(row) - {'.'} for row in board]",
  "        cols = [{board[r][c] for r in range(9)} - {'.'} for c in range(9)]",
  "        boxes = [{board[r][c] for r in range(9) for c in range(9) if (r // 3) * 3 + c // 3 == b} - {'.'} for b in range(9)]",
  "        empties = [(r, c) for r in range(9) for c in range(9) if board[r][c] == '.']",
  "        def backtrack():",
  "            choices = [(len(set('123456789') - rows[r] - cols[c] - boxes[(r // 3) * 3 + c // 3]), r, c) for r, c in empties if board[r][c] == '.']",
  "            if not choices:",
  "                return True",
  "            _, r, c = min(choices)",
  "            b = (r // 3) * 3 + c // 3",
  "            for digit in '123456789':",
  "                if digit not in rows[r] and digit not in cols[c] and digit not in boxes[b]:",
  "                    board[r][c] = digit",
  "                    rows[r].add(digit)",
  "                    cols[c].add(digit)",
  "                    boxes[b].add(digit)",
  "                    if backtrack():",
  "                        return True",
  "                    board[r][c] = '.'",
  "                    rows[r].remove(digit)",
  "                    cols[c].remove(digit)",
  "                    boxes[b].remove(digit)",
  "            return False",
  "        solved = backtrack()",
  "        return",
];
const boxId = (r,c) => Math.floor(r / 3) * 3 + Math.floor(c / 3);

function parse37(input) {
  if (typeof input !== "string") throw new TypeError("#37: nhập 9 hàng cách nhau bằng ; / enter 9 rows separated by ;.");
  const board = input.trim().split(/[;|]/).map(row => row.trim().includes(",") ? row.trim().split(",").map(c => c.trim()) : [...row.trim()]);
  if (board.length !== 9 || board.some(row => row.length !== 9 || row.some(c => !/^[.0-9]$/.test(c)))) {
    throw new RangeError("#37: bảng 9×9, chỉ dùng 1–9 và . hoặc 0 cho ô trống / use a 9×9 board with 1–9 and . or 0 for blanks.");
  }
  const used = Array.from({length:27},()=>new Set());
  board.forEach((row,r) => row.forEach((cell,c) => {
    if (cell === "0") board[r][c] = ".";
    else if (cell !== ".") {
      const groups=[used[r],used[9+c],used[18+boxId(r,c)]];
      if (groups.some(s=>s.has(cell))) throw new RangeError("#37: số cho sẵn bị trùng hàng, cột hoặc box / duplicate given in a row, column or box.");
      groups.forEach(s=>s.add(cell));
    }
  }));
  return board;
}

function buildSteps37(input) {
  const board=parse37(input), original=board.map(row=>[...row]), givens=board.map(row=>row.join(""));
  const rows=Array.from({length:9},()=>new Set()), cols=Array.from({length:9},()=>new Set()), boxes=Array.from({length:9},()=>new Set());
  const empties=[],stack=[],steps=[],moves=[];
  let rowsReady=false,colsReady=false,boxesReady=false,emptiesReady=false,solved;
  let nextId=0;
  const ordered = set => [...set].sort();
  const available = (r,c) => [...DIGITS].filter(d=>!rows[r].has(d)&&!cols[c].has(d)&&!boxes[boxId(r,c)].has(d));
  function emit(line,phase,title,detail={},final=false) {
    if (steps.length >= 20000) throw new RangeError("#37: trace quá dài; thêm vài số gợi ý rồi chạy lại / trace too long; add a few givens and retry.");
    const f=stack.at(-1), active=f?.r===undefined ? null : {r:f.r,c:f.c,b:boxId(f.r,f.c)};
    const localKeys=["choices","_","r","c","b","digit"];
    const locals=Object.fromEntries(localKeys.filter(k=>f && f[k]!==undefined).map(k=>[k,k==='choices'?f[k].map(row=>[...row]):f[k]]));
    if (solved!==undefined && !f) locals.solved=solved;
    const currentSets=active ? {
      row:rowsReady?ordered(rows[active.r]):null,col:colsReady?ordered(cols[active.c]):null,box:boxesReady?ordered(boxes[active.b]):null,
    } : {row:null,col:null,box:null};
    steps.push({ title,note:bi("",""),arr:[],codeLines:[line],final,
      vars:[{name:"r",value:f?.r??"—"},{name:"c",value:f?.c??"—"},{name:"b",value:f?.b??"—"},
        {name:"digit",value:f?.digit??"—"},{name:"depth",value:f?stack.length-1:"—"},{name:"solved",value:solved??"—"}],
      sudoku37View:{ phase,source:{line,timing:"after"},scope:f?"backtrack":"solveSudoku",locals,
        board:board.map(row=>row.join("")),givens,active,sets:currentSets,ready:{rows:rowsReady,cols:colsReady,boxes:boxesReady,empties:emptiesReady},
        candidates:f?.candidates?[...f.candidates]:null,check:f?.check?{...f.check}:null,
        stack:stack.map(frame=>({id:frame.id,...Object.fromEntries(["r","c","b","digit"].filter(k=>frame[k]!==undefined).map(k=>[k,frame[k]]))})),
        moves:moves.slice(-8).map(move=>({...move})),solved:solved??null,...detail,
      },
    });
  }
  board.forEach((row,r)=>row.forEach(d=>{if(d!=='.')rows[r].add(d);})); rowsReady=true;emit(3,"rows",bi("Tạo 9 tập hàng","Build 9 row sets"));
  board.forEach((row,r)=>row.forEach((d,c)=>{if(d!=='.')cols[c].add(d);})); colsReady=true;emit(4,"cols",bi("Tạo 9 tập cột","Build 9 column sets"));
  board.forEach((row,r)=>row.forEach((d,c)=>{if(d!=='.')boxes[boxId(r,c)].add(d);})); boxesReady=true;emit(5,"boxes",bi("Tạo 9 tập box","Build 9 box sets"));
  board.forEach((row,r)=>row.forEach((d,c)=>{if(d==='.')empties.push([r,c]);})); emptiesReady=true;emit(6,"empties",bi(`${empties.length} ô trống`,`${empties.length} empty cells`));
  emit(7,"define",bi("Tạo hàm backtrack","Define backtrack"));
  function backtrack() {
    const f={id:nextId++};stack.push(f);
    f.choices=empties.filter(([r,c])=>board[r][c]==='.').map(([r,c])=>[available(r,c).length,r,c]);
    emit(8,"choices",bi("Đếm ứng viên mỗi ô","Count candidates per cell"));
    emit(9,"complete-check",bi(f.choices.length?"Còn ô cần điền":"Không còn ô trống",f.choices.length?"Cells remain":"No empty cells remain"));
    if (!f.choices.length) { emit(10,"solution",bi("✓ Đã điền đủ bảng","✓ Board complete"));stack.pop();return true; }
    const [count,r,c]=[...f.choices].sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2])[0];
    Object.assign(f,{_:count,r,c,candidates:available(r,c)});emit(11,"select",bi(`Chọn ô (${r}, ${c})`,`Select (${r}, ${c})`));
    f.b=boxId(r,c);emit(12,"box-id",bi(`box = ${f.b}`,`box = ${f.b}`));
    for (const digit of DIGITS) {
      f.digit=digit;f.check=null;emit(13,"try",bi(`Thử ${digit}`,`Try ${digit}`));
      f.check={row:rows[r].has(digit),col:cols[c].has(digit),box:boxes[f.b].has(digit)};
      const blocked=Object.values(f.check).some(Boolean);
      emit(14,blocked?"blocked":"allowed",bi(blocked?`✕ ${digit} bị trùng`:`✓ Có thể đặt ${digit}`,blocked?`✕ ${digit} conflicts`:`✓ ${digit} allowed`));
      if (blocked) continue;
      board[r][c]=digit;moves.push({type:"place",r,c,digit});emit(15,"place",bi(`Đặt ${digit} vào (${r}, ${c})`,`Place ${digit} at (${r}, ${c})`));
      rows[r].add(digit);emit(16,"row-add",bi(`Thêm ${digit} vào rows[${r}]`,`Add ${digit} to rows[${r}]`));
      cols[c].add(digit);emit(17,"col-add",bi(`Thêm ${digit} vào cols[${c}]`,`Add ${digit} to cols[${c}]`));
      boxes[f.b].add(digit);emit(18,"box-add",bi(`Thêm ${digit} vào boxes[${f.b}]`,`Add ${digit} to boxes[${f.b}]`));
      const success=backtrack();emit(19,"resume",bi(success?"↩ Nhánh con tìm được nghiệm":"↩ Nhánh con thất bại",success?"↩ Child solved the board":"↩ Child branch failed"),{childResult:success});
      if(success) {emit(20,"return-true",bi("↩ True","↩ True"));stack.pop();return true;}
      board[r][c]='.';moves.push({type:"undo",r,c,digit});emit(21,"undo",bi(`Xoá ${digit}, thử lại`,`Remove ${digit}, retry`));
      rows[r].delete(digit);emit(22,"row-remove",bi(`Bỏ ${digit} khỏi rows[${r}]`,`Remove ${digit} from rows[${r}]`));
      cols[c].delete(digit);emit(23,"col-remove",bi(`Bỏ ${digit} khỏi cols[${c}]`,`Remove ${digit} from cols[${c}]`));
      boxes[f.b].delete(digit);emit(24,"box-remove",bi(`Bỏ ${digit} khỏi boxes[${f.b}]`,`Remove ${digit} from boxes[${f.b}]`));
    }
    emit(13,"exhausted",bi("Đã thử hết 1–9","All digits tried"));
    emit(25,"return-false",bi("↩ False: quay lui","↩ False: backtrack"));stack.pop();return false;
  }
  solved=backtrack();emit(26,"root-return",bi(solved?"✓ Tìm được nghiệm":"✕ Không có nghiệm",solved?"✓ Solution found":"✕ No solution"));
  emit(27,"done",bi(solved?"Sudoku hoàn tất":"Không có nghiệm",solved?"Sudoku solved":"No solution"),{},true);
  return {original,answer:board.map(row=>[...row]),steps};
}

module.exports={37:{...base,code:CODE,debugMode:"line-by-line",builder:buildSteps37,liveArgs:input=>[parse37(input)],
  approach:[bi("Chọn ô ít ứng viên nhất → thử 1–9 → đi sâu. Nhánh sai: xoá số và quay lui.","Choose the cell with the fewest candidates → try 1–9 → recurse. Undo a failed branch.")],
  complexity:{time:"O(E · 9ᴱ)",space:"O(E²)",note:bi("E là số ô trống; MRV chọn ô ít ứng viên để giảm nhánh. Mỗi frame giữ danh sách choices.","E is the empty-cell count; MRV chooses the fewest candidates. Each frame keeps a choices list.")},
}};
