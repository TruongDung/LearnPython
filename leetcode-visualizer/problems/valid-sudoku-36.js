'use strict';
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({ vi, en });
const CODE = `class Solution:
    def isValidSudoku(self, board: list[list[str]]) -> bool:
        rows = [set() for _ in range(9)]
        cols = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]
        for r in range(9):
            for c in range(9):
                digit = board[r][c]
                if digit == ".":
                    continue
                box = (r // 3) * 3 + c // 3
                if digit in rows[r] or digit in cols[c] or digit in boxes[box]:
                    return False
                rows[r].add(digit)
                cols[c].add(digit)
                boxes[box].add(digit)
        return True`;
const DEFAULT = '53..7....;6..195...;.98....6.;8...6...3;4..8.3..1;7...2...6;.6....28.;...419..5;....8..79';
function parse(input) {
  let board = input;
  try {
    if (typeof input === 'string') board = input.trim().startsWith('[') ? JSON.parse(input) : input.trim().split(/[;|\n]/).map(row => [...row.trim()]);
  } catch { board = null; }
  if (!Array.isArray(board) || board.length !== 9 || board.some(row => !(Array.isArray(row) || typeof row === 'string') || row.length !== 9 || [...row].some(value => typeof value !== 'string' || !/^[1-9.]$/.test(value)))) throw new RangeError('36: enter a 9×9 board using digits 1–9 and . for blanks; use nine rows separated by ; or a JSON board.');
  return board.map(row => [...row]);
}
function build(input) {
  const board = parse(input), code = CODE.split('\n');
  const trace = runTrace({ code: CODE, method: 'isValidSudoku', args: [board] });
  const checked = [];
  let active = null, checks = null, conflict = null;
  const steps = trace.events.map((record, index) => {
    const x = record.outer, source = code[record.line - 1].trim(), final = index === trace.events.length - 1;
    let event = 'prepare';
    if (source === 'for c in range(9):') { active = null; checks = null; }
    if (source === 'digit = board[r][c]') { active = { r: x.r, c: x.c, digit: x.digit, box: Math.floor(x.r / 3) * 3 + Math.floor(x.c / 3) }; checks = null; event = x.digit === '.' ? 'empty' : 'inspect'; }
    if (source.startsWith('if digit in rows[r]')) {
      const matches = type => checked.filter(cell => cell.digit === x.digit && (type === 'row' ? cell.r === x.r : type === 'col' ? cell.c === x.c : cell.box === active.box));
      checks = Object.fromEntries(['row','col','box'].map(type => [type, matches(type).map(cell => ({ r:cell.r, c:cell.c }))]));
      event = record.branch ? 'conflict' : 'check';
      if (record.branch) conflict = { active: { ...active }, checks: Object.fromEntries(Object.entries(checks).map(([type,cells]) => [type,cells.map(cell => ({...cell}))])) };
    }
    if (source === 'boxes[box].add(digit)') { checked.push({ ...active }); event = 'register'; }
    if (final) { event = trace.answer ? 'done' : 'invalid'; if (!conflict) active = null; }
    const cell = active ? `(${active.r + 1}, ${active.c + 1})` : '';
    const titles = {
      prepare: bi('Kiểm tra số đã điền, bỏ qua ô trống', 'Validate filled digits; ignore blank cells'),
      inspect: bi(`Ô ${cell}: kiểm tra số ${active?.digit}`, `Cell ${cell}: check digit ${active?.digit}`),
      empty: bi(`Ô ${cell} trống → bỏ qua`, `Cell ${cell} is blank → skip`),
      check: bi(`Số ${active?.digit} chưa trùng hàng, cột hay box`, `Digit ${active?.digit} does not repeat in its row, column or box`),
      conflict: bi(`Số ${active?.digit} đã xuất hiện → False`, `Digit ${active?.digit} already exists → False`),
      register: bi(`Ghi nhớ số ${active?.digit} ở cả 3 nơi`, `Remember digit ${active?.digit} in all 3 sets`),
      done: bi('Không có số trùng → True', 'No repeated digits → True'),
      invalid: bi('Hai ô trùng số → False', 'Two cells repeat a digit → False'),
    };
    return {
      arr:[], codeBlock:1, codeLines:[record.line], final, title:titles[event] || bi(`Dòng ${record.line} · kiểm tra Sudoku`, `Line ${record.line} · validate Sudoku`), note:bi('',''),
      vars:['r','c','digit','box'].map(name => ({name,value:x[name] ?? '—'})),
      sudoku36View: {
        board:board.map(row=>row.join('')), event, source,
        active:active ? {...active} : null,
        checked:checked.map(cell=>({...cell})), checks:checks ? Object.fromEntries(Object.entries(checks).map(([type,cells])=>[type,cells.map(cell=>({...cell}))])) : null,
        conflict:conflict ? JSON.parse(JSON.stringify(conflict)) : null,
        sets:active ? {row:[...(x.rows?.[active.r] ?? [])],col:[...(x.cols?.[active.c] ?? [])],box:[...(x.boxes?.[active.box] ?? [])]} : null,
        final, answer:final ? trace.answer : null,
      },
    };
  });
  return {original:board,answer:trace.answer,steps};
}
module.exports = {36:{
  id:36, difficulty:'medium', slug:'valid-sudoku', title:bi('Valid Sudoku','Valid Sudoku'),
  titleVi:bi('Một số không được lặp trong hàng, cột hoặc box','A digit cannot repeat in its row, column or box'),
  category:{key:'array',vi:'Mảng',en:'Array'}, tags:[{key:'hashmap',vi:'Hash Map',en:'Hash Map'},{key:'matrix',vi:'Ma trận',en:'Matrix'}],
  statement:bi('Kiểm tra các số đã điền trên bảng Sudoku 9×9: mỗi hàng, cột và box 3×3 không có số trùng. Dấu . là ô trống và được bỏ qua. Bảng hợp lệ chưa chắc có lời giải; bài này chỉ kiểm tra ràng buộc hiện tại.','Validate the filled digits on a 9×9 Sudoku board: no repeated digit in any row, column or 3×3 box. Dots are blanks and are ignored. A valid partial board is not necessarily solvable; this problem checks current constraints only.'),
  inputKind:'string',inputLabel:bi('board · 9 hàng cách nhau bằng ; hoặc JSON · . là ô trống','board · 9 rows separated by ; or JSON · . means blank'),defaultInput:DEFAULT,
  code:CODE.split('\n'),debugMode:'line-by-line',complexity:{time:'O(9²)',space:'O(9²)'},
  approach:[bi('Mỗi ô đã điền phải qua 3 kiểm tra: hàng, cột, box. Chỉ một nơi có số trùng là trả False.','Each filled cell must pass 3 checks: row, column and box. A duplicate in any one of them returns False.'),bi('Nhớ các số đã gặp bằng 27 tập hợp; box = (r // 3) * 3 + c // 3.','Remember seen digits in 27 sets; box = (r // 3) * 3 + c // 3.')],
  builder:build,liveArgs:input=>[parse(input)],
}};
