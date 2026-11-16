"use strict";

const bi = (vi, en) => ({ vi, en });
const {runTrace} = require('./wasm-picture-trace');
const CODE = [
  "from typing import List",
  "",
  "class Solution:",
  "    def cherryPickup(self, grid: List[List[int]]) -> int:",
  "        rows, cols = len(grid), len(grid[0])",
  "        # next_dp[c1][c2]: best total from the next row down",
  "        next_dp = [[0] * cols for _ in range(cols)]",
  "",
  "        for row in range(rows - 1, -1, -1):",
  "            current = [[0] * cols for _ in range(cols)]",
  "            for c1 in range(cols):",
  "                for c2 in range(cols):",
  "                    cherries = grid[row][c1]",
  "                    if c1 != c2:",
  "                        cherries += grid[row][c2]",
  "",
  "                    best_next = 0",
  "                    for n1 in range(max(0, c1 - 1), min(cols, c1 + 2)):",
  "                        for n2 in range(max(0, c2 - 1), min(cols, c2 + 2)):",
  "                            best_next = max(best_next, next_dp[n1][n2])",
  "                    current[c1][c2] = cherries + best_next",
  "            next_dp = current",
  "",
  "        return next_dp[0][cols - 1]",
];

function parseGrid(input) {
  if (typeof input !== "string" || !input.trim()) throw new TypeError("1463: Grid must be a non-empty string / Grid phải là chuỗi không rỗng.");
  const tokens = input.split(";").map(row => row.split(",").map(value => value.trim()));
  const rows = tokens.length, cols = tokens[0].length;
  if (rows < 2 || rows > 70 || cols < 2 || cols > 70) throw new RangeError("1463: Grid size must be 2..70 rows and columns / Grid có 2..70 hàng và cột.");
  if (tokens.some(row => row.length !== cols)) throw new TypeError("1463: All rows must have the same length / Các hàng phải có cùng số cột.");
  if (tokens.some(row => row.some(value => !/^\d+$/.test(value) || Number(value) > 100))) throw new RangeError("1463: Each cell must be an integer in [0, 100] / Mỗi ô là số nguyên trong [0, 100].");
  return tokens.map(row => row.map(Number));
}

function windowIndices(size, centers, radius, limit) {
  if (size <= limit) return Array.from({ length: size }, (_, i) => i);
  const selected = new Set([0, size - 1]);
  for (const center of centers) for (let d = -radius; d <= radius; d++) if (center + d >= 0 && center + d < size) selected.add(center + d);
  return [...selected].sort((a, b) => a - b);
}

function buildOverview(input) {
  const grid = parseGrid(input), rows = grid.length, cols = grid[0].length;
  let nextDp = Array.from({ length: cols }, () => Array(cols).fill(0));
  let current = null;
  // Only the visual replay retains choices. The displayed solution uses two layers.
  const choices = Array.from({ length: rows - 1 }, () => new Uint16Array(cols * cols));
  const steps = [];
  const rowGain = (row, a, b) => grid[row][a] + (a === b ? 0 : grid[row][b]);

  function emit({ phase, row, c1, c2, line, candidates = [], bestNext = null, total = null, path = [], collected = null, final = false }) {
    const boardRows = windowIndices(rows, [row, Math.min(row + 1, rows - 1)], 1, 8);
    const boardCols = windowIndices(cols, [c1, c2], 1, 9);
    const matrixCols = windowIndices(cols, [c1, c2], 1, 8);
    const title = {
      intro: bi("Hai robot cùng đi xuống", "Two robots move downward"),
      focus: bi(`Hàng ${row}: đặt A và B`, `Row ${row}: place A and B`),
      compare: bi("Chọn bước tiếp theo tốt nhất", "Choose the best next move"),
      write: bi("Lưu tổng tốt nhất", "Save the best total"),
      path: bi(`Đường tối ưu · hàng ${row}`, `Optimal path · row ${row}`),
      result: bi(`Kết quả: ${total} cherry`, `Result: ${total} cherries`),
    }[phase];
    steps.push({ arr: [], highlight: [], mark: [], title, note: bi("", ""), codeLines: [line], final,
      vars: [{ name: "row", value: row }, { name: "c1", value: c1 }, { name: "c2", value: c2 }, { name: "cherries", value: rowGain(row, c1, c2) }, { name: "best_next", value: bestNext ?? "—" }],
      cherryPickup1463View: {
        phase, rows, cols, row, c1, c2, gain: rowGain(row, c1, c2), bestNext, total, collected, final,
        board: { rowIndices: boardRows, colIndices: boardCols, cells: boardRows.map(r => boardCols.map(c => grid[r][c])), cropped: boardRows.length < rows || boardCols.length < cols },
        candidates: candidates.map(candidate => ({ ...candidate })),
        path: path.map(pair => ({ ...pair })),
        matrix: current && !["intro", "path", "result"].includes(phase) ? { indices: matrixCols, cells: matrixCols.map(a => matrixCols.map(b => current[a][b])), row } : null,
        answer: final ? total : null,
      },
    });
  }

  emit({ phase: "intro", row: 0, c1: 0, c2: cols - 1, line: 7 });
  for (let row = rows - 1; row >= 0; row--) {
    current = Array.from({ length: cols }, () => Array(cols).fill(null));
    for (let c1 = 0; c1 < cols; c1++) for (let c2 = 0; c2 < cols; c2++) {
      const pictured = (c1 === 0 && c2 === cols - 1) || (row === Math.floor(rows / 2) && c1 === Math.floor(cols / 2) && c1 === c2);
      const gain = rowGain(row, c1, c2);
      if (pictured) emit({ phase: "focus", row, c1, c2, line: c1 === c2 ? 13 : 15 });
      let bestNext = 0, nextPair = null;
      const candidates = [];
      for (let d1 = -1; d1 <= 1; d1++) for (let d2 = -1; d2 <= 1; d2++) {
        const n1 = c1 + d1, n2 = c2 + d2;
        const valid = n1 >= 0 && n1 < cols && n2 >= 0 && n2 < cols;
        const future = valid ? nextDp[n1][n2] : null;
        if (valid && (nextPair === null || future > bestNext)) { bestNext = future; nextPair = { c1: n1, c2: n2 }; }
        if (pictured && row < rows - 1) candidates.push({ d1, d2, c1: n1, c2: n2, valid, future, best: false });
      }
      for (const candidate of candidates) candidate.best = candidate.valid && candidate.c1 === nextPair.c1 && candidate.c2 === nextPair.c2;
      if (pictured && row < rows - 1) emit({ phase: "compare", row, c1, c2, line: 20, candidates, bestNext });
      current[c1][c2] = gain + bestNext;
      if (row < rows - 1) choices[row][c1 * cols + c2] = nextPair.c1 * cols + nextPair.c2;
      if (pictured) emit({ phase: "write", row, c1, c2, line: 21, candidates, bestNext, total: current[c1][c2] });
    }
    nextDp = current;
  }
  const answer = nextDp[0][cols - 1];
  let c1 = 0, c2 = cols - 1, collected = 0;
  const path = [];
  for (let row = 0; row < rows; row++) {
    collected += rowGain(row, c1, c2);
    path.push({ row, c1, c2, gain: rowGain(row, c1, c2), collected });
    emit({ phase: "path", row, c1, c2, line: 24, path, collected });
    if (row < rows - 1) { const encoded = choices[row][c1 * cols + c2]; c1 = Math.floor(encoded / cols); c2 = encoded % cols; }
  }
  emit({ phase: "result", row: rows - 1, c1, c2, line: 24, path, collected, total: answer, final: true });
  return { original: input, answer, steps };
}

function buildDebug(input) {
  const grid=parseGrid(input),rows=grid.length,cols=grid[0].length;
  if(rows>5||cols>5)throw new RangeError('1463: line-by-line debug supports up to 5×5. Select Overview for grids up to 70×70 / Debug từng dòng tối đa 5×5. Chọn Tổng quan cho grid đến 70×70.');
  const native=runTrace({code:CODE.join('\n'),method:'cherryPickup',args:[grid]}),choices=new Map();
  let row=null,c1=null,pair=null,currentRow=null,nextRow=null,known=null,candidates=[],candidate=null,choice=null,gain=null,gainReady=false,bestNext=null,total=null,written=0;
  const makeCandidates=(a,b)=>Array.from({length:9},(_,i)=>{
    const d1=Math.floor(i/3)-1,d2=i%3-1,n1=a+d1,n2=b+d2;
    return {d1,d2,c1:n1,c2:n2,valid:n1>=0&&n1<cols&&n2>=0&&n2<cols,future:null,checked:false,best:false};
  });
  const pathFromChoices=()=>{
    const path=[];let a=0,b=cols-1,collected=0;
    for(let r=0;r<rows;r++){
      const cherries=grid[r][a]+(a===b?0:grid[r][b]);collected+=cherries;
      path.push({row:r,c1:a,c2:b,gain:cherries,collected});
      if(r<rows-1){const next=choices.get(`${r}:${a}:${b}`);a=next.c1;b=next.c2;}
    }
    return path;
  };
  const steps=native.events.map((event,index)=>{
    const x=event.locals,line=event.line,final=index===native.events.length-1;let phase='init';
    if(line===7){nextRow=rows;phase='base';}
    if(line===9){row=x.row??null;c1=null;pair=null;candidate=null;phase=event.branch?'row':'rows-done';}
    if(line===10){currentRow=x.row;known=Array.from({length:cols},()=>Array(cols).fill(false));phase='allocate';}
    if(line===11){c1=event.branch?x.c1:null;pair=null;candidate=null;phase=event.branch?'robot-a':'row-complete';}
    if(line===12){
      pair=event.branch?{c1:x.c1,c2:x.c2}:null;gain=null;gainReady=false;bestNext=null;total=null;candidate=null;choice=null;
      candidates=pair?makeCandidates(pair.c1,pair.c2):[];phase=event.branch?'pair':'pairs-done';
    }
    if(line===13){gain=x.cherries;phase='read-a';}
    if(line===14){gainReady=!event.branch;phase='overlap-check';}
    if(line===15){gain=x.cherries;gainReady=true;phase='read-b';}
    if(line===17){bestNext=x.best_next;phase='best-init';}
    if(line===18){candidate=null;phase=event.branch?'next-a':'candidates-done';}
    if(line===19){candidate=event.branch?{c1:x.n1,c2:x.n2,before:x.best_next,future:null,after:null}:null;phase=event.branch?'next-b':'next-b-done';}
    if(line===20){
      const future=x.next_dp[x.n1][x.n2];candidate={c1:x.n1,c2:x.n2,before:bestNext,future,after:x.best_next};bestNext=x.best_next;
      const entry=candidates.find(item=>item.c1===x.n1&&item.c2===x.n2);entry.future=future;entry.checked=true;
      if(!choice||future>choice.future)choice={c1:x.n1,c2:x.n2,future};
      for(const item of candidates)item.best=item.checked&&item.c1===choice.c1&&item.c2===choice.c2;
      phase='compare';
    }
    if(line===21){
      known[x.c1][x.c2]=true;total=x.current[x.c1][x.c2];written++;
      choices.set(`${row}:${x.c1}:${x.c2}`,{c1:choice.c1,c2:choice.c2});phase='write';
    }
    if(line===22){nextRow=x.row;phase='promote';}
    const path=final?pathFromChoices():[];
    if(final)phase='result';
    const matrix=x.current?{indices:Array.from({length:cols},(_,i)=>i),cells:structuredClone(x.current),known:known.map(values=>[...values]),row:currentRow}:null;
    const nextMatrix=x.next_dp?{indices:Array.from({length:cols},(_,i)=>i),cells:structuredClone(x.next_dp),row:nextRow}:null;
    const view={debug:true,phase,rows,cols,row,c1,c2:pair?.c2??null,pairActive:Boolean(pair),gain,gainReady,bestNext,total:final?native.answer:total,
      candidate:candidate?{...candidate}:null,candidates:structuredClone(candidates),matrix,nextMatrix,written,path,collected:final?path.at(-1).collected:null,
      board:{rowIndices:Array.from({length:rows},(_,i)=>i),colIndices:Array.from({length:cols},(_,i)=>i),cells:grid.map(values=>[...values]),cropped:false},
      source:{line,text:CODE[line-1].trim()},branch:event.branch,trace:native.trace,final,answer:final?native.answer:null};
    return {arr:[],codeBlock:1,codeLines:[line],title:bi(view.source.text,view.source.text),note:bi('',''),final,
      vars:['rows','cols','row','c1','c2','cherries','best_next','n1','n2'].map(name=>({name,value:x[name]??'—'})),cherryPickup1463View:view};
  });
  return {original:input,answer:native.answer,steps};
}
function buildSteps(input,params={}) {
  const mode=Number(params.traceMode??1);
  if(mode===1)return buildDebug(input);
  if(mode===2)return buildOverview(input);
  throw new RangeError('1463: choose Line-by-line debug or Overview / chọn Debug từng dòng hoặc Tổng quan.');
}

module.exports = { 1463: {
  id: 1463, difficulty: "hard", slug: "cherry-pickup-ii",
  category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
  tags: [{ key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" }, { key: "matrix", vi: "Ma trận", en: "Matrix" }],
  title: bi("Cherry Pickup II", "Cherry Pickup II"),
  titleVi: bi("Hai robot thu cherry", "Two robots collect cherries"),
  statement: bi("A bắt đầu ở góc trên trái, B ở góc trên phải. Mỗi lượt, cả hai đi ↙ ↓ ↘ xuống hàng tiếp theo. Cùng ô → nhặt một lần. Tìm tổng cherry lớn nhất.", "A starts at the top left, B at the top right. Each turn both move ↙ ↓ ↘ to the next row. Same cell → collect once. Find the maximum total cherries."),
  defaultInput: "3,1,1;2,5,1;1,5,5;2,1,1", inputKind: "string",
  inputLabel: bi("Grid · hàng cách ; · Debug ≤5×5 / Tổng quan ≤70×70", "Grid · rows separated by ; · Debug ≤5×5 / Overview ≤70×70"),
  extraParams: [{key:'traceMode',type:'select',default:1,label:bi('Chế độ','Playback'),options:[
    {value:1,label:bi('Debug từng dòng · đầy đủ','Line-by-line debug · complete')},
    {value:2,label:bi('Tổng quan · grid lớn','Overview · large grids')},
  ]}],
  approach: [
    bi("Một trạng thái = hàng hiện tại + hai cột của A, B.", "One state = current row + the two columns of A and B."),
    bi("Tổng tốt nhất = cherry hàng này + tốt nhất trong tối đa 9 cặp bước tiếp theo.", "Best total = this row's cherries + the best of up to 9 next moves."),
    bi("Tính từ dưới lên. Chỉ giữ hàng hiện tại và hàng kế tiếp.", "Compute bottom up. Keep only the current and next row layers."),
  ],
  complexity: { time: "O(rows × cols²)", space: "O(cols²)", note: bi("Mỗi cặp cột xét tối đa 9 bước. Code dùng hai lớp DP. Debug ghi đủ từng dòng cho grid ≤5×5; Tổng quan minh hoạ các trạng thái tiêu biểu đến 70×70.", "Each column pair checks up to 9 moves. Code uses two DP layers. Debug records every statement for grids ≤5×5; Overview illustrates selected states up to 70×70.") },
  visualizationLimits:{debugMaxRows:5,debugMaxCols:5,overviewMaxRows:70,overviewMaxCols:70,completeDebugTrace:true},
  code: CODE, debugMode: "line-by-line", builder: buildSteps,
  liveArgs: input => [parseGrid(input)],
  parseGrid,
} };
