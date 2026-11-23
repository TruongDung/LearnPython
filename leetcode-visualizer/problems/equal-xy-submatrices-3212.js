'use strict';
const bi = (vi, en) => ({ vi, en });
const CODE = [
  'from typing import List', '', 'class Solution:',
  '    def numberOfSubmatrices(self, grid: List[List[str]]) -> int:',
  '        cols = len(grid[0])',
  '        prefix_x = [0] * cols',
  '        prefix_y = [0] * cols',
  '        answer = 0',
  '        for r, row in enumerate(grid):',
  '            row_x = 0',
  '            row_y = 0',
  '            for c, ch in enumerate(row):',
  '                row_x += ch == "X"',
  '                row_y += ch == "Y"',
  '                prefix_x[c] += row_x',
  '                prefix_y[c] += row_y',
  '                if prefix_x[c] == prefix_y[c] and prefix_x[c] > 0:',
  '                    answer += 1',
  '        return answer',
];
function parse(input, limit = 6) {
  let grid = input;
  if (typeof input === 'string') {
    try {
      const raw = input.trim();
      grid = raw.startsWith('[') ? JSON.parse(raw) : raw.split(/[;\n]/).map(row => row.includes(',') ? row.split(',').map(ch => ch.trim()) : [...row.trim()]);
    } catch (_) { grid = null; }
  }
  if (!Array.isArray(grid) || !grid.length || grid.length > limit || !Array.isArray(grid[0]) || !grid[0].length || grid[0].length > limit
    || !Array.from(grid).every(row => Array.isArray(row) && row.length === grid[0].length && Array.from(row).every(ch => ['X','Y','.'].includes(ch)))) {
    throw new RangeError(`3212: grid chữ nhật 1–${limit} hàng/cột, chỉ X, Y, . / use a 1–${limit} rectangular X/Y/. grid.`);
  }
  return grid.map(row => [...row]);
}
function builder(input) {
  const grid = parse(input), cols = grid[0].length, steps = [], decisions = [];
  let prefixX, prefixY, answer, r, row, rowX, rowY, c, ch, focus = null, cell = null, change = null;
  const locals = () => {
    const values = { grid, cols };
    for (const [key,value] of Object.entries({ prefix_x:prefixX, prefix_y:prefixY, answer, r, row, row_x:rowX, row_y:rowY, c, ch })) if (value !== undefined) values[key] = value;
    return JSON.parse(JSON.stringify(values));
  };
  const titles = { 5:['Đọc số cột','Read column count'], 6:['Tạo prefix X','Create X prefixes'], 7:['Tạo prefix Y','Create Y prefixes'], 8:['Khởi tạo answer','Initialize answer'], 9:['Chọn hàng','Choose row'], 10:['Đặt row_x = 0','Reset row_x'], 11:['Đặt row_y = 0','Reset row_y'], 12:['Chọn góc phải dưới','Choose bottom-right corner'], 13:['Đếm X trong hàng','Count row Xs'], 14:['Đếm Y trong hàng','Count row Ys'], 15:['Trên + hàng → X','Above + row → X'], 16:['Trên + hàng → Y','Above + row → Y'], 17:['X = Y và X > 0?','X = Y and X > 0?'], 18:['Cộng một hình','Count one rectangle'], 19:['Hoàn tất','Finished'] };
  function emit(line, phase, condition = null) {
    const values = locals(), name = titles[line];
    steps.push({ title:bi(`Dòng ${line} · ${name[0]}`,`Line ${line} · ${name[1]}`), note:bi('',''), arr:[], highlight:[], mark:[], codeLines:[line], final:line===19,
      vars:Object.entries(values).map(([name,value])=>({name,value})),
      equalXY3212View: { grid:grid.map(row=>[...row]), cols, line, source:CODE[line-1].trim(), phase, condition, focus:focus?[...focus]:null,
        prefixX:prefixX?[...prefixX]:null, prefixY:prefixY?[...prefixY]:null, rowX:rowX??null, rowY:rowY??null, r:r??null, ch:ch??null,
        cell:cell?{...cell}:null, change:change?{...change}:null, answer:answer??null, decisions:decisions.map(item=>({...item})), locals:values, final:line===19 },
    });
    change = null;
  }
  emit(5,'init'); prefixX=Array(cols).fill(0); emit(6,'init'); prefixY=Array(cols).fill(0); emit(7,'init'); answer=0; emit(8,'init');
  for (let rr=0;rr<grid.length;rr++) {
    r=rr; row=grid[r]; focus=null; cell=null; emit(9,'row');
    rowX=0; emit(10,'row'); rowY=0; emit(11,'row');
    for (let cc=0;cc<cols;cc++) {
      c=cc; ch=row[c]; focus=[r,c]; cell={aboveX:prefixX[c],aboveY:prefixY[c],readyX:false,readyY:false}; emit(12,'cell');
      const beforeX=rowX; rowX+=ch==='X'?1:0; change={name:'row_x',before:beforeX,added:ch==='X'?1:0,after:rowX}; emit(13,'row-x');
      const beforeY=rowY; rowY+=ch==='Y'?1:0; change={name:'row_y',before:beforeY,added:ch==='Y'?1:0,after:rowY}; emit(14,'row-y');
      prefixX[c]+=rowX; cell.readyX=true; change={name:`prefix_x[${c}]`,before:cell.aboveX,added:rowX,after:prefixX[c]}; emit(15,'prefix-x');
      prefixY[c]+=rowY; cell.readyY=true; change={name:`prefix_y[${c}]`,before:cell.aboveY,added:rowY,after:prefixY[c]}; emit(16,'prefix-y');
      const equal=prefixX[c]===prefixY[c], present=equal?prefixX[c]>0:null, accepted=equal&&present;
      const decision={r,c,x:prefixX[c],y:prefixY[c],equal,present,accepted,counted:false,step:steps.length}; decisions.push(decision); emit(17,'check',accepted);
      if (accepted) { const before=answer; answer++; decision.counted=true; decision.countStep=steps.length; change={name:'answer',before,added:1,after:answer}; emit(18,'count'); }
    }
    emit(12,'columns-end',false);
  }
  emit(9,'rows-end',false); emit(19,'done');
  return { original:grid,answer,steps };
}
module.exports = { 3212: {
  id:3212,slug:'count-submatrices-with-equal-frequency-of-x-and-y',difficulty:'medium',category:{key:'array',vi:'Mảng',en:'Array'},
  tags:[{key:'matrix',vi:'Ma trận',en:'Matrix'},{key:'prefix-sum',vi:'Tổng tiền tố',en:'Prefix Sum'}],
  title:bi('Count Submatrices With Equal Frequency of X and Y','Count Submatrices With Equal Frequency of X and Y'),
  titleVi:bi('Đếm hình có số X bằng số Y','Count rectangles with equal X and Y counts'),
  statement:bi('Đếm hình chữ nhật chứa (0,0), có số X bằng số Y và ít nhất một X. Dấu . không tăng bộ đếm.','Count rectangles containing (0,0), equal numbers of X and Y, and at least one X. Dots do not affect the counts.'),
  inputKind:'string',inputLabel:bi('grid · X/Y/. · tối đa 6×6 · hàng cách bằng ;','grid · X/Y/. · up to 6×6 · separate rows with ;'),defaultInput:'XY.;Y..',extraParams:[],debugMode:'line-by-line',
  approach:[bi('Góc trên trái luôn là (0,0). Với mỗi góc phải dưới: prefix = phần ở trên + đoạn hàng hiện tại.','The top-left corner stays at (0,0). For each bottom-right corner: prefix = the part above + the current row segment.')],
  complexity:{time:'O(mn)',space:'O(n)',note:bi('Hai mảng prefix, mỗi mảng có n cột. Minh hoạ tối đa 6×6.','Two prefix arrays, each with n columns. Visualization up to 6×6.')},
  code:CODE,builder,liveArgs:input=>[parse(input,1000)],
} };
