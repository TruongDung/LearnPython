"use strict";
const base=require("./backtracking")[52];
const bi=(vi,en)=>({vi,en});
const CODE=Object.freeze([
  "class Solution:",
  "    def totalNQueens(self, n):",
  "        count = 0",
  "        placement = []",
  "        cols = set()",
  "        diag_down = set()",
  "        diag_up = set()",
  "        def backtrack(row):",
  "            nonlocal count",
  "            if row == n:",
  "                count += 1",
  "                return",
  "            for col in range(n):",
  "                if col not in cols and row - col not in diag_down and row + col not in diag_up:",
  "                    placement.append(col)",
  "                    cols.add(col)",
  "                    diag_down.add(row - col)",
  "                    diag_up.add(row + col)",
  "                    backtrack(row + 1)",
  "                    placement.pop()",
  "                    cols.remove(col)",
  "                    diag_down.remove(row - col)",
  "                    diag_up.remove(row + col)",
  "        backtrack(0)",
  "        return count",
]);
function parse52(input){const n=Array.isArray(input)&&input.length===1?input[0]:input;if(!Number.isInteger(n)||n<1||n>8)throw new RangeError("#52: n phải là số nguyên từ 1 đến 8 / n must be an integer from 1 to 8.");return n;}
function buildSteps52(input){
  const n=parse52(input),placement=[],cols=new Set(),down=new Set(),up=new Set(),stack=[],moves=[],samples=[],steps=[];
  let count=0,placementReady=false,colsReady=false,downReady=false,upReady=false,nextId=0;
  const values=set=>[...set].sort((a,b)=>a-b);
  function emit(line,phase,title,check=null,final=false){
    const f=stack.at(-1),queens=placement.map((col,row)=>[row,col]);
    const active=f?.row<n&&f.col!==undefined?{row:f.row,col:f.col}:null;
    const attacks=active?queens.filter(([r,c])=>r!==active.row||c!==active.col).filter(([r,c])=>c===active.col||r-c===active.row-active.col||r+c===active.row+active.col):[];
    const state={cols:colsReady?values(cols):null,diag_down:downReady?values(down):null,diag_up:upReady?values(up):null};
    const locals={n,count,...(placementReady?{placement:[...placement]}:{}),...(f?{row:f.row,...(f.col===undefined?{}:{col:f.col})}:{})};
    steps.push({title,note:bi("",""),arr:[],codeLines:[line],final,
      vars:[{name:"row",value:f?.row??"—"},{name:"col",value:f?.col??"—"},{name:"cols",value:state.cols??"—"},{name:"diag_down",value:state.diag_down??"—"},{name:"diag_up",value:state.diag_up??"—"},{name:"count",value:count}],
      nQueens52View:{n,phase,source:{line,text:CODE[line-1],timing:"after"},scope:f?"backtrack":"totalNQueens",locals,
        board:placementReady?Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>placement[r]===c?'Q':'.').join('')):null,
        queens,activeRow:f&&f.row<n?f.row:null,active,attacks,check:check?{...check}:null,sets:state,count,
        increment:phase==='count'?{from:count-1,to:count}:null,
        stack:stack.map(frame=>({...frame,queenCount:placement.length,count})),moves:moves.slice(-6).map(move=>({...move})),
        samples:samples.map(sample=>({number:sample.number,placement:[...sample.placement]}))},
    });
  }
  emit(3,"count-init",bi("count = 0","count = 0"));
  placementReady=true;emit(4,"placement-init",bi("placement = []","placement = []"));
  colsReady=true;emit(5,"cols-init",bi("cols = ∅","cols = ∅"));
  downReady=true;emit(6,"down-init",bi("diag_down = ∅","diag_down = ∅"));
  upReady=true;emit(7,"up-init",bi("diag_up = ∅","diag_up = ∅"));
  emit(8,"define",bi("Tạo hàm backtrack","Define backtrack"));
  function backtrack(row){
    const f={id:nextId++,row};stack.push(f);
    emit(10,"complete-check",bi(row===n?"✓ Đủ n quân hậu":"Xét hàng tiếp theo",row===n?"✓ All queens placed":"Inspect the next row"));
    if(row===n){count++;samples.push({number:count,placement:[...placement]});if(samples.length>3)samples.shift();emit(11,"count",bi(`count: ${count-1} → ${count}`,`count: ${count-1} → ${count}`));emit(12,"return-counted",bi("↩ Tiếp tục tìm cách khác","↩ Continue searching"));stack.pop();return;}
    for(let col=0;col<n;col++){
      f.col=col;emit(13,"choose",bi(`Thử (${row}, ${col})`,`Try (${row}, ${col})`));
      const column=!cols.has(col),diagonalDown=column?!down.has(row-col):null,diagonalUp=column&&diagonalDown?!up.has(row+col):null;
      const check={column,down:diagonalDown,up:diagonalUp,allowed:Boolean(column&&diagonalDown&&diagonalUp)};
      emit(14,check.allowed?"allow":"blocked",bi(check.allowed?"✓ Ô an toàn":"✕ Ô bị khống chế",check.allowed?"✓ Safe square":"✕ Attacked square"),check);
      if(check.allowed){
        placement.push(col);moves.push({type:"place",row,col});emit(15,"place",bi(`Đặt hậu (${row}, ${col})`,`Place queen at (${row}, ${col})`));
        cols.add(col);emit(16,"cols-add",bi(`Khoá cột ${col}`,`Occupy column ${col}`));
        down.add(row-col);emit(17,"down-add",bi(`Khoá chéo row-col = ${row-col}`,`Occupy diagonal row-col = ${row-col}`));
        up.add(row+col);emit(18,"up-add",bi(`Khoá chéo row+col = ${row+col}`,`Occupy diagonal row+col = ${row+col}`));
        backtrack(row+1);emit(19,"resume",bi("↩ Nhánh con hoàn tất","↩ Child branch returned"));
        placement.pop();moves.push({type:"undo",row,col});emit(20,"remove",bi(`Bỏ hậu (${row}, ${col})`,`Remove queen at (${row}, ${col})`));
        cols.delete(col);emit(21,"cols-remove",bi(`Mở cột ${col}`,`Release column ${col}`));
        down.delete(row-col);emit(22,"down-remove",bi(`Mở chéo row-col = ${row-col}`,`Release diagonal row-col = ${row-col}`));
        up.delete(row+col);emit(23,"up-remove",bi(`Mở chéo row+col = ${row+col}`,`Release diagonal row+col = ${row+col}`));
      }
    }
    emit(13,"exhausted",bi("Đã thử hết cột","All columns tried"));stack.pop();
  }
  backtrack(0);emit(24,"root-return",bi("↩ Đã duyệt mọi nhánh","↩ All branches returned"));
  emit(25,"done",bi(`Có ${count} cách đặt`,`${count} placements`),null,true);
  return {original:n,n,answer:count,steps};
}
module.exports={52:{...base,code:CODE,builder:buildSteps52,liveArgs:input=>[parse52(input)],debugMode:"line-by-line",
  inputLabel:bi("n · 1–8 quân hậu","n · 1–8 queens"),
  statement:bi("Đếm các cách đặt n hậu: mỗi hàng một hậu, không chung cột hay đường chéo.","Count arrangements of n queens: one per row, with no shared column or diagonal."),
  approach:[bi("Đặt hậu → đi xuống. Đủ n hàng: count += 1. Bỏ hậu và mở lại cột, đường chéo để thử cách khác.","Place a queen → recurse. At n rows: count += 1. Remove the queen and release its column and diagonals to try another arrangement.")],
  complexity:{time:"O(n · n!)",space:"O(n)",note:bi("Chỉ giữ placement, ba tập và biến count. Trace đầy đủ cho n từ 1 đến 8.","Keep placement, three sets and count. Complete trace for n from 1 to 8.")},
}};
