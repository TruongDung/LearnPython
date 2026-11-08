"use strict";

const SOURCE_999 = Object.freeze([
  "from typing import List",
  "",
  "",
  "class Solution:",
  "    def numRookCaptures(self, board: List[List[str]]) -> int:",
  "        rook_row = rook_col = -1",
  "        for row in range(8):",
  "            for col in range(8):",
  "                if board[row][col] == \"R\":",
  "                    rook_row, rook_col = row, col",
  "",
  "        captures = 0",
  "        directions = ((1, 0), (-1, 0), (0, 1), (0, -1))",
  "        for row_step, col_step in directions:",
  "            row, col = rook_row + row_step, rook_col + col_step",
  "            while 0 <= row < 8 and 0 <= col < 8:",
  "                piece = board[row][col]",
  "                if piece == \"B\":",
  "                    break",
  "                if piece == \"p\":",
  "                    captures += 1",
  "                    break",
  "                row += row_step",
  "                col += col_step",
  "        return captures",
]);

const DIRECTIONS_999 = Object.freeze([
  Object.freeze({ key: "down", dr: 1, dc: 0, symbol: "↓", vi: "Xuống", en: "Down" }),
  Object.freeze({ key: "up", dr: -1, dc: 0, symbol: "↑", vi: "Lên", en: "Up" }),
  Object.freeze({ key: "right", dr: 0, dc: 1, symbol: "→", vi: "Phải", en: "Right" }),
  Object.freeze({ key: "left", dr: 0, dc: -1, symbol: "←", vi: "Trái", en: "Left" }),
]);

const text999 = (vi, en) => ({ vi, en });
const key999 = (row, col) => `${row},${col}`;

function freeze999(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze999);
  return Object.freeze(value);
}

function parseBoard999(input) {
  if (typeof input !== "string") throw new TypeError("999 board must be a string.");
  const rows = input.trim().split(/[|;\n]/).map((row) => row.replace(/[\s,]/g, "")).filter(Boolean);
  if (rows.length !== 8 || rows.some((row) => row.length !== 8)) {
    throw new Error("999 board must contain exactly 8 rows of 8 cells.");
  }
  if (rows.some((row) => !/^[.RBp]{8}$/.test(row))) {
    throw new Error("999 board cells must be '.', 'R', 'B', or 'p'.");
  }
  const board = rows.map((row) => [...row]);
  const rooks = [];
  board.forEach((row, r) => row.forEach((piece, c) => {
    if (piece === "R") rooks.push([r, c]);
  }));
  if (rooks.length !== 1) throw new Error("999 board must contain exactly one rook 'R'.");
  return { board, rook: rooks[0] };
}

function buildSteps999(input) {
  const {board,rook}=parseBoard999(input);
  const {runTrace}=require('./wasm-picture-trace');
  const trace=runTrace({code:SOURCE_999.join('\n'),method:'numRookCaptures',args:[board]});
  const scanned=[],captured=[],directionStates=Object.fromEntries(DIRECTIONS_999.map(d=>[d.key,'pending']));
  let locatedRook=null,current=null,direction=null,piece=null,checks={bounds:null,bishop:null,pawn:null},previous=null;
  const inBounds=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
  const steps=trace.events.map(record=>{
    const {line,locals:x}=record;let event='line',change=null;
    const phase=record.returning?'done':line<=10?'locate':'scan';
    if(line===6)event='init-rook';
    if(line===7){current=null;event='scan-row';}
    if(line===8)current=record.branch?[x.row,x.col]:null;
    if(line===9)event='rook-check';
    if(line===10){locatedRook=[x.rook_row,x.rook_col];event='rook-found';change={kind:'rook',cell:[...locatedRook]};}
    if(line===12){current=null;piece=null;event='init-captures';}
    if(line===14){direction=record.branch?DIRECTIONS_999.find(d=>d.dr===x.row_step&&d.dc===x.col_step):null;current=null;piece=null;checks={bounds:null,bishop:null,pawn:null};if(direction){directionStates[direction.key]='active';event='direction-start';}}
    if(line===15||line===23||line===24){current=inBounds(x.row,x.col)?[x.row,x.col]:null;piece=null;checks={bounds:null,bishop:null,pawn:null};event=line===15?'first-square':line===23?'advance-row':'advance-col';}
    if(line===16){checks.bounds=record.branch;current=record.branch?[x.row,x.col]:null;event=record.branch?'bounds-check':'edge-stop';if(!record.branch)directionStates[direction.key]='edge';}
    if(line===17){piece=x.piece;checks.bishop=null;checks.pawn=null;scanned.push({row:x.row,col:x.col,direction:direction.key,piece:x.piece});event='read-piece';}
    if(line===18){checks.bishop=record.branch;event='bishop-check';}
    if(line===19){directionStates[direction.key]='blocked';event='bishop-stop';change={kind:'stop',cell:[x.row,x.col]};}
    if(line===20){checks.pawn=record.branch;event='pawn-check';}
    if(line===21){captured.push([x.row,x.col]);directionStates[direction.key]='captured';event='capture';change={kind:'capture',cell:[x.row,x.col],before:previous.locals.captures,after:x.captures};}
    if(line===22)event='pawn-stop';
    if(record.returning){current=null;direction=null;piece=null;event='return';}
    const condition=record.branch===null?null:{expression:SOURCE_999[line-1].trim().replace(/^if |^while |:$/g,''),result:record.branch};
    const view={board,phase,event,line,source:SOURCE_999[line-1],timing:'after',rook:locatedRook?[...locatedRook]:null,expectedRook:rook,
      current:current?[...current]:null,cursor:Number.isInteger(x.row)&&Number.isInteger(x.col)?[x.row,x.col]:null,direction:direction?{...direction}:null,piece,
      captures:x.captures??null,scanned:scanned.map(c=>({...c})),captured:captured.map(c=>[...c]),directionStates:{...directionStates},checks:{...checks},condition,change,
      final:record.returning,answer:record.returning?trace.answer:null,locals:x,outer:record.outer,scope:record.scope,frames:record.frames,branch:record.branch,returning:record.returning,returned:record.returned,trace:trace.trace};
    freeze999(view);previous=view;
    return {arr:[],title:text999(`L${line} · ${SOURCE_999[line-1].trim()}`,`L${line} · ${SOURCE_999[line-1].trim()}`),note:text999('',''),codeBlock:1,codeLines:[line],
      vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),final:record.returning,rook999View:view};
  });
  return {original:board,answer:trace.answer,steps};
}

module.exports = {
  999: {
    id: 999,
    difficulty: "easy",
    slug: "available-captures-for-rook",
    category: { key: "array", vi: "Mảng / Ma trận", en: "Array / Matrix" },
    tags: [
      { key: "matrix", vi: "Ma trận", en: "Matrix" },
      { key: "simulation", vi: "Mô phỏng", en: "Simulation" },
    ],
    title: text999("Available Captures for Rook", "Available Captures for Rook"),
    titleVi: text999("Số tốt quân xe có thể bắt", "Available captures for a rook"),
    statement: text999(
      "Trên bàn cờ 8×8 có một xe trắng R, các tượng trắng B và tốt đen p. Đếm số tốt mà xe có thể bắt trong một nước. Nhập 8 hàng cách nhau bởi '|'.",
      "On an 8×8 board, one white rook R shares the board with white bishops B and black pawns p. Count the pawns the rook can capture in one move. Separate rows with '|'."
    ),
    defaultInput: "........|...p....|...R...p|........|........|...p....|........|........",
    inputKind: "string",
    inputLabel: text999("board 8×8 (hàng cách bởi '|'; dùng . R B p)", "8×8 board (rows separated by '|'; use . R B p)"),
    extraParams: [],
    approach: [text999("Bốn tia: bỏ ô trống · gặp B thì dừng · gặp p thì +1 rồi dừng.", "Four rays: skip empty squares · B stops · p adds one capture and stops.")],
    complexity: {
      time: "O(8²)",
      space: "O(1)",
      note: text999("Tìm xe bằng một lượt quét 64 ô; bốn tia chỉ đi trên cùng hàng và cột.", "Locate the rook by scanning 64 squares; the four rays only traverse its row and column."),
    },
    debugMode: "line-by-line",
    code: SOURCE_999,
    liveArgs(input) {
      return [parseBoard999(input).board];
    },
    builder: buildSteps999,
  },
};
