'use strict';
const base = require('./stack-jump-grid-pictures')[1504];
const bi = (vi, en) => ({ vi, en });

function rectanglesAt(mat, r, c) {
  const rectangles = [], minima = [];
  let height = mat.length;
  for (let left = c; left >= 0; left--) {
    let columnHeight = 0;
    for (let row = r; row >= 0 && mat[row][left] === 1; row--) columnHeight++;
    height = Math.min(height, columnHeight);
    minima.unshift({ left, height });
    for (let h = 1; h <= height; h++) rectangles.push({ key: `${left}:${h}`, top: r - h + 1, bottom: r, left, right: c, height: h, width: c - left + 1 });
  }
  return { rectangles, minima };
}

const phases = {
  5: ['Đọc kích thước', 'Read dimensions'], 6: ['Khởi tạo heights', 'Initialize heights'],
  7: ['Khởi tạo answer', 'Initialize answer'], 8: ['Chọn hàng', 'Choose row'],
  9: ['Tạo stack mới', 'Create a new stack'], 10: ['Đặt row_sum = 0', 'Reset row_sum'],
  11: ['Chọn góc phải dưới', 'Choose bottom-right corner'], 12: ['Cập nhật cột cao', 'Update column height'],
  13: ['Một cạnh trái mới', 'One new left edge'], 14: ['So chiều cao với TOP', 'Compare height with TOP'],
  15: ['POP nhóm cao hơn hoặc bằng', 'POP a taller or equal group'], 16: ['Bỏ đóng góp cũ', 'Remove the old contribution'],
  17: ['Gộp các cạnh trái', 'Merge left-edge choices'], 18: ['PUSH nhóm mới', 'PUSH the new group'],
  19: ['Đếm hình ở góc này', 'Count rectangles at this corner'], 20: ['Cộng vào answer', 'Add to answer'],
  21: ['Hoàn tất', 'Finished'],
};

function builder(input) {
  const run = base.builder(input);
  let previous = null;
  const steps = run.steps.map(step => {
    const v = step.stackJumpGridView, x = v.locals, mat = v.model, line = v.source.line;
    const focus = v.current ? [...v.current] : step.final ? [...v.ledger.at(-1).cell] : null;
    const heightReady = Boolean(focus && v.heightRow === focus[0] && v.heightColumns.includes(focus[1]));
    const counted = focus ? v.ledger.find(entry => entry.cell[0] === focus[0] && entry.cell[1] === focus[1]) : null;
    const ready = heightReady && (line === 19 || Boolean(counted));
    const geometry = ready ? rectanglesAt(mat, ...focus) : { rectangles: [], minima: [] };
    const contributions = mat.map((row, r) => row.map((_, c) => v.ledger.find(entry => entry.cell[0] === r && entry.cell[1] === c)?.count ?? null));
    let from = 0;
    const groups = (x.stack || []).map(([height, width], index) => {
      const group = { index, height, width, from, to: from + width - 1, contribution: height * width };
      from += width; return group;
    });
    let transition = null;
    if (line === 12) transition = { name: `heights[${x.c}]`, before: previous.locals.heights[x.c], after: x.heights[x.c], amount: mat[x.r][x.c] ? 1 : null, reset: mat[x.r][x.c] === 0 };
    if (line === 16 || line === 19) transition = { name: 'row_sum', before: previous.locals.row_sum, after: x.row_sum, amount: line === 16 ? -x.old_height * x.old_width : x.heights[x.c] * x.width, reset: false };
    if (line === 17) transition = { name: 'width', before: previous.locals.width, after: x.width, amount: x.old_width, reset: false };
    if (line === 20) transition = { name: 'answer', before: previous.locals.answer, after: x.answer, amount: x.row_sum, reset: false };
    const phase = step.final ? 'done' : line === 20 ? 'commit' : ready ? 'ready' : line >= 14 && line <= 18 ? 'stack' : line === 12 ? 'height' : 'setup';
    const label = v.branch === false && [8, 11].includes(line)
      ? line === 8 ? ['Đã duyệt hết hàng', 'End of rows'] : ['Đã duyệt hết cột', 'End of columns'] : phases[line];
    const view = {
      mat, rows: mat.length, cols: mat[0].length, line, source: v.source.text, phase, focus,
      heightRow: v.heightRow, updatedColumns: [...v.heightColumns], heights: x.heights ?? null,
      groups, stackInitialized: Array.isArray(x.stack), rowSum: x.row_sum ?? null, width: x.width ?? null,
      answer: x.answer ?? null, ready, counted: Boolean(counted), contributions, ...geometry,
      comparison: line === 14 ? v.comparison : null,
      popped: line >= 15 && line <= 17 ? { height: x.old_height, width: x.old_width, contribution: x.old_height * x.old_width } : null,
      transition, locals: x, branch: v.branch, final: step.final,
    };
    previous = v;
    return { ...step, title: bi(`Dòng ${line} · ${label[0]}`, `Line ${line} · ${label[1]}`), allOnes1504View: view };
  });
  return { ...run, steps };
}

module.exports = { 1504: { ...base, builder,
  approach: [bi('Mỗi hình có một góc phải dưới. Histogram và stack đếm các hình tại góc đó; cộng một lần vào answer.', 'Each rectangle has one bottom-right corner. The histogram and stack count rectangles at that corner; add them once to answer.')],
  inputLabel: bi('mat · tối đa 6×6 · 0/1 · hàng cách nhau bằng ;', 'mat · up to 6×6 · 0/1 · separate rows with ;'),
} };
