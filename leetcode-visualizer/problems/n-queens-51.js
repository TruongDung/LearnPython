"use strict";
const base=require("./backtracking")[51];
const bi=(vi,en)=>({vi,en});
const CODE=Object.freeze([
  "class Solution:",
  "    def solveNQueens(self, n):",
  "        result = []",
  "        board = [['.'] * n for _ in range(n)]",
  "        cols = set()",
  "        diag_down = set()",
  "        diag_up = set()",
  "        def backtrack(row):",
  "            if row == n:",
  "                result.append([''.join(r) for r in board])",
  "                return",
  "            for col in range(n):",
  "                if col not in cols and row - col not in diag_down and row + col not in diag_up:",
  "                    board[row][col] = 'Q'",
  "                    cols.add(col)",
  "                    diag_down.add(row - col)",
  "                    diag_up.add(row + col)",
  "                    backtrack(row + 1)",
  "                    board[row][col] = '.'",
  "                    cols.remove(col)",
  "                    diag_down.remove(row - col)",
  "                    diag_up.remove(row + col)",
  "        backtrack(0)",
  "        return result",
]);
function parse51(input){const n=Array.isArray(input)&&input.length===1?input[0]:input;if(!Number.isInteger(n)||n<1||n>8)throw new RangeError("#51: n phải là số nguyên từ 1 đến 8 / n must be an integer from 1 to 8.");return n;}
function buildSteps51(input){
  const n=parse51(input),board=Array.from({length:n},()=>Array(n).fill('.')),cols=new Set(),down=new Set(),up=new Set(),result=[],stack=[],moves=[],steps=[];
  let boardReady=false,colsReady=false,downReady=false,upReady=false,nextId=0;
  const values=set=>[...set].sort((a,b)=>a-b);
  function emit(line,phase,title,check=null,final=false){
    const f=stack.at(-1),from=final?0:Math.max(0,result.length-3),rows=board.map(row=>row.join(''));
    const locals={n,...(f?{row:f.row,...(f.col===undefined?{}:{col:f.col})}:{})};
    const queens=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(board[r][c]==='Q')queens.push([r,c]);
    const active=f?.row<n&&f.col!==undefined?{row:f.row,col:f.col}:null;
    const attacks=active?queens.filter(([r,c])=>r!==active.row||c!==active.col).filter(([r,c])=>c===active.col||r-c===active.row-active.col||r+c===active.row+active.col):[];
    const state={cols:colsReady?values(cols):null,diag_down:downReady?values(down):null,diag_up:upReady?values(up):null};
    steps.push({title,note:bi("",""),arr:[],codeLines:[line],final,
      vars:[{name:"row",value:f?.row??"—"},{name:"col",value:f?.col??"—"},{name:"cols",value:state.cols??"—"},{name:"diag_down",value:state.diag_down??"—"},{name:"diag_up",value:state.diag_up??"—"},{name:"len(result)",value:result.length}],
      nQueens51View:{n,phase,source:{line,text:CODE[line-1],timing:"after"},scope:f?"backtrack":"solveNQueens",locals,board:boardReady?rows:null,sets:state,
        activeRow:f&&f.row<n?f.row:null,active,queens,attacks,check:check?{...check}:null,
        stack:stack.map(frame=>({...frame,queenCount:queens.length})),moves:moves.slice(-6).map(move=>({...move})),
        resultCount:result.length,shownFrom:from,results:result.slice(from).map(rows=>[...rows])},
    });
  }
  emit(3,"result-init",bi("result = []","result = []"));
  boardReady=true;emit(4,"board-init",bi(`Bàn cờ ${n}×${n}`,`${n}×${n} board`));
  colsReady=true;emit(5,"cols-init",bi("cols = ∅","cols = ∅"));
  downReady=true;emit(6,"down-init",bi("diag_down = ∅","diag_down = ∅"));
  upReady=true;emit(7,"up-init",bi("diag_up = ∅","diag_up = ∅"));
  emit(8,"define",bi("Tạo hàm backtrack","Define backtrack"));
  function backtrack(row){
    const f={id:nextId++,row};stack.push(f);
    emit(9,"complete-check",bi(row===n?"✓ Đủ n quân hậu":"Xét hàng tiếp theo",row===n?"✓ All queens placed":"Inspect the next row"));
    if(row===n){result.push(board.map(row=>row.join('')));emit(10,"save",bi(`Lưu bàn cờ #${result.length}`,`Save board #${result.length}`));emit(11,"return-solution",bi("↩ Về hàng trước","↩ Return to previous row"));stack.pop();return;}
    for(let col=0;col<n;col++){
      f.col=col;emit(12,"choose",bi(`Thử (${row}, ${col})`,`Try (${row}, ${col})`));
      const column=!cols.has(col),diagonalDown=column?!down.has(row-col):null,diagonalUp=column&&diagonalDown?!up.has(row+col):null;
      const check={column,down:diagonalDown,up:diagonalUp,allowed:Boolean(column&&diagonalDown&&diagonalUp)};
      emit(13,check.allowed?"allow":"blocked",bi(check.allowed?"✓ Ô an toàn":"✕ Ô bị khống chế",check.allowed?"✓ Safe square":"✕ Attacked square"),check);
      if(check.allowed){
        board[row][col]='Q';moves.push({type:"place",row,col});emit(14,"place",bi(`Đặt hậu (${row}, ${col})`,`Place queen at (${row}, ${col})`));
        cols.add(col);emit(15,"cols-add",bi(`Khoá cột ${col}`,`Occupy column ${col}`));
        down.add(row-col);emit(16,"down-add",bi(`Khoá chéo row-col = ${row-col}`,`Occupy diagonal row-col = ${row-col}`));
        up.add(row+col);emit(17,"up-add",bi(`Khoá chéo row+col = ${row+col}`,`Occupy diagonal row+col = ${row+col}`));
        backtrack(row+1);emit(18,"resume",bi("↩ Nhánh con hoàn tất","↩ Child branch returned"));
        board[row][col]='.';moves.push({type:"undo",row,col});emit(19,"remove",bi(`Bỏ hậu (${row}, ${col})`,`Remove queen at (${row}, ${col})`));
        cols.delete(col);emit(20,"cols-remove",bi(`Mở cột ${col}`,`Release column ${col}`));
        down.delete(row-col);emit(21,"down-remove",bi(`Mở chéo row-col = ${row-col}`,`Release diagonal row-col = ${row-col}`));
        up.delete(row+col);emit(22,"up-remove",bi(`Mở chéo row+col = ${row+col}`,`Release diagonal row+col = ${row+col}`));
      }
    }
    emit(12,"exhausted",bi("Đã thử hết cột","All columns tried"));stack.pop();
  }
  backtrack(0);emit(23,"root-return",bi("↩ Đã duyệt mọi nhánh","↩ All branches returned"));
  emit(24,"done",bi(`${result.length} bàn cờ hợp lệ`,`${result.length} valid boards`),null,true);
  return {original:n,n,answer:result.map(rows=>[...rows]),steps};
}
module.exports={51:{...base,code:CODE,builder:buildSteps51,liveArgs:input=>[parse51(input)],debugMode:"line-by-line",
  inputLabel:bi("n · 1–8 quân hậu","n · 1–8 queens"),
  statement:bi("Mỗi hàng đặt một hậu. Các hậu không chung cột hay đường chéo. Tìm mọi bàn cờ hợp lệ.","Place one queen per row. No queens share a column or diagonal. Find every valid board."),
  approach:[bi("Thử một ô → kiểm tra cột và hai đường chéo → đặt hậu → đi xuống. Quay lui để thử ô khác.","Try a square → check its column and two diagonals → place a queen → recurse. Undo to try another square.")],
  complexity:{time:"O(n · n! + n² · R)",space:"O(n²) + output",note:bi("R là số lời giải. Giữ đủ trace và mọi kết quả cho n từ 1 đến 8.","R is the solution count. Keep the complete trace and all results for n from 1 to 8.")},
}};
