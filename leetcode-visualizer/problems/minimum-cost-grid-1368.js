'use strict';

const { runTrace } = require('./wasm-picture-trace');
const methods = require('./minimum-cost-grid-1368-methods');
const bi = (vi, en = vi) => ({ vi, en });

function parseInput(input) {
  let grid = input;
  if (typeof input === 'string') {
    const text = input.trim();
    if (text.startsWith('[')) {
      try { grid = JSON.parse(text); } catch { throw new RangeError('1368: JSON lưới không hợp lệ / Invalid grid JSON.'); }
    } else {
      grid = text.split(/[;|\n]/).map(row => row.split(',').map(cell => cell.trim() ? Number(cell.trim()) : NaN));
    }
  }
  if (!Array.isArray(grid) || !grid.length || grid.length > 100 || !Array.isArray(grid[0]) || !grid[0].length || grid[0].length > 100 ||
      !Array.from(grid).every(row => Array.isArray(row) && row.length === grid[0].length && Array.from(row).every(cell => Number.isInteger(cell) && cell >= 1 && cell <= 4))) {
    throw new RangeError('1368: lưới chữ nhật 1..100 hàng/cột; hướng 1→, 2←, 3↓, 4↑ / Rectangular grid, 1..100 rows/columns; values 1..4.');
  }
  return grid.map(row => [...row]);
}

function build(input, approach = 3) {
  const grid = parseInput(input), definition = methods[approach-1];
  if (!definition) throw new RangeError('1368: chọn cách 1..5 / Select approach 1..5.');
  if (definition.maxCells && grid.length * grid[0].length > definition.maxCells) {
    throw new RangeError(`1368: ${definition.label.en}: demo tối đa ${definition.maxCells} ô / demo limit ${definition.maxCells} cells. Dùng cách / Use approach 2, 3, 4 for larger grids.`);
  }
  const result = runTrace({ profile: 'arrow1368', code: definition.code.join('\n'), method: 'minCost', args: [grid], approach, maxEvents: 1600, queueCoordinates: approach === 3 });
  const steps = result.events.map(view => ({
    arr: [], highlight: [], mark: [], codeBlock: approach, codeLines: [view.source.line], final: view.final,
    title: bi(`${definition.label.vi} · dòng ${view.source.line}`, `${definition.label.en} · line ${view.source.line}`), note: bi(''),
    vars: Object.entries(view.locals).map(([name, value]) => ({ name, value })),
    arrow1368View: { ...view, trace: result.trace },
  }));
  return { original: grid, answer: result.answer, steps };
}

const problem = {
  id: 1368, difficulty: 'hard', slug: 'minimum-cost-to-make-at-least-one-valid-path-in-a-grid',
  category: { key: 'graph', vi: 'Đồ thị', en: 'Graph' },
  tags: ['bfs', 'dfs', 'dijkstra', '0-1-bfs', 'bellman-ford'].map(key => ({ key, vi: key === '0-1-bfs' ? '0-1 BFS' : key.toUpperCase(), en: key === '0-1-bfs' ? '0-1 BFS' : key.toUpperCase() })),
  title: bi('Minimum Cost to Make at Least One Valid Path in a Grid'),
  titleVi: bi('Ít đổi mũi tên nhất · 5 cách giải', 'Fewest arrow changes · 5 approaches'),
  statement: bi('S → T, đi 4 hướng. Thuận mũi tên: 0. Đổi mũi tên tại ô đang rời: +1. Tìm tổng chi phí nhỏ nhất.', 'Move S → T in four directions. Follow the arrow: 0. Change the arrow at the cell you leave: +1. Minimize total cost.'),
  defaultInput: '1,1,3;3,2,2;1,2,4', inputKind: 'string', debugMode: 'line-by-line',
  inputLabel: bi('grid · 1→ 2← 3↓ 4↑ · JSON hoặc hàng ngăn bởi ;', 'grid · 1→ 2← 3↓ 4↑ · JSON or rows separated by ;'),
  extraParams: [{ key: 'approach', type: 'select', label: bi('Cách giải', 'Approach'), default: 3,
    options: methods.map((method, i) => ({ value: i+1, label: bi(`${i+1}. ${method.label.vi}`, `${i+1}. ${method.label.en}`) })) }],
  approach: [bi('Cạnh có trọng số 0 hoặc 1. Ô T không cần đổi mũi tên.', 'Each edge costs 0 or 1. The arrow at T does not need changing.')],
  parseInput, liveArgs: input => [parseInput(input)],
  builder: (input, params = {}) => build(input, Number(params.approach ?? 3)),
};
methods.forEach((method, i) => {
  const suffix = i ? i+1 : '';
  problem[`code${suffix}`] = method.code;
  problem[`code${suffix}Label`] = method.label;
  problem[`complexity${suffix}`] = { time: method.time, space: method.space,
    note: bi(`M × N = số ô · ${method.rating.vi}${method.maxCells ? ` · Demo ≤ ${method.maxCells} ô` : ''}`, `M × N = cells · ${method.rating.en}${method.maxCells ? ` · Demo ≤ ${method.maxCells} cells` : ''}`) };
  if (i) problem[`builder${i+1}`] = input => build(input, i+1);
});

module.exports = { 1368: problem };
