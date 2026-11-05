'use strict';

const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en = vi) => ({ vi, en });
const CODE = Object.freeze([
  'from collections import deque',
  '',
  'class Solution:',
  '    def minimumObstacles(self, grid):',
  '        m, n = len(grid), len(grid[0])',
  '        dirs = [(0,1), (0,-1), (1,0), (-1,0)]',
  "        dist = [[float('inf')]*n for _ in range(m)]",
  '        parent = {}',
  '        dist[0][0] = 0',
  '        dq = deque([(0, 0, 0)])',
  '        while dq:',
  '            cost, r, c = dq.popleft()',
  '            if cost != dist[r][c]:',
  '                continue',
  '            if (r, c) == (m-1, n-1):',
  '                return cost',
  '            for dr, dc in dirs:',
  '                nr, nc = r+dr, c+dc',
  '                if not (0 <= nr < m and 0 <= nc < n):',
  '                    continue',
  '                w = grid[nr][nc]',
  '                nd = cost + w',
  '                if nd < dist[nr][nc]:',
  '                    dist[nr][nc] = nd',
  '                    parent[(nr,nc)] = (r,c)',
  '                    if w == 0:',
  '                        dq.appendleft((nd,nr,nc))',
  '                    else:',
  '                        dq.append((nd,nr,nc))',
  '        return dist[-1][-1]',
]);

function parseInput(input) {
  let grid = input;
  if (typeof input === 'string') {
    const text = input.trim();
    if (text.startsWith('[')) {
      try { grid = JSON.parse(text); } catch { throw new RangeError('2290: JSON lưới không hợp lệ / Invalid grid JSON.'); }
    } else grid = text.split(/[|;\n]/).map(row => row.split(',').map(cell => cell.trim() ? Number(cell.trim()) : NaN));
  }
  if (!Array.isArray(grid) || !grid.length || !Array.isArray(grid[0]) || !grid[0].length || grid.length*grid[0].length>100000 ||
      !Array.from(grid).every(row => Array.isArray(row) && row.length===grid[0].length && Array.from(row).every(value => value===0 || value===1))) {
    throw new RangeError('2290: lưới chữ nhật 0/1, tối đa 100.000 ô / Rectangular 0/1 grid, at most 100,000 cells.');
  }
  if (grid[0][0]!==0 || grid.at(-1).at(-1)!==0) throw new RangeError('2290: S và T phải là 0 / S and T must be 0.');
  return grid.map(row => [...row]);
}

function build(input) {
  const grid = parseInput(input);
  const result = runTrace({ profile:'obstacle2290', code:CODE.join('\n'), method:'minimumObstacles', args:[grid], approach:3, maxEvents:1600 });
  let previous = new Map();
  const steps = result.events.map(view => {
    const updated = view.cells.flat().filter(cell => previous.has(`${cell.r},${cell.c}`) && previous.get(`${cell.r},${cell.c}`)!==cell.distance)
      .map(cell => ({ cell:[cell.r,cell.c], before:previous.get(`${cell.r},${cell.c}`), after:cell.distance }));
    previous = new Map(view.cells.flat().map(cell => [`${cell.r},${cell.c}`,cell.distance]));
    return { arr:[], highlight:[], mark:[], codeBlock:1, codeLines:[view.source.line], final:view.final,
      title:bi(`0-1 BFS · dòng ${view.source.line}`,`0-1 BFS · line ${view.source.line}`), note:bi(''),
      vars:Object.entries(view.locals).map(([name,value]) => ({name,value})),
      obstacle2290View:{...view,updated,trace:result.trace} };
  });
  return { original:grid, answer:result.answer, steps };
}

module.exports = { 2290: {
  id:2290, difficulty:'hard', slug:'minimum-obstacle-removal-to-reach-corner',
  category:{key:'graph',vi:'Đồ thị',en:'Graph'},
  tags:[{key:'bfs',vi:'BFS',en:'BFS'},{key:'0-1-bfs',vi:'0-1 BFS',en:'0-1 BFS'},{key:'dijkstra',vi:'Dijkstra',en:'Dijkstra'}],
  title:bi('Minimum Obstacle Removal to Reach Corner'),
  titleVi:bi('Xóa ít vật cản nhất để tới đích','Remove the fewest obstacles to reach T'),
  statement:bi('S → T, đi 4 hướng. Vào ô trống: 0. Vào vật cản: +1. Tìm số vật cản ít nhất cần xóa.','Move S → T in four directions. Enter an empty cell: 0. Enter an obstacle: +1. Remove as few obstacles as possible.'),
  defaultInput:'0,1,1|1,1,0|1,1,0', inputKind:'string', debugMode:'line-by-line',
  inputLabel:bi('grid · 0 = trống, 1 = vật cản · JSON hoặc hàng ngăn bởi | / ;','grid · 0 = empty, 1 = obstacle · JSON or rows separated by | / ;'),
  approach:[bi('0 → đầu deque · 1 → cuối deque. Chi phí nằm ở ô sắp bước vào.','0 → deque front · 1 → deque back. The cost belongs to the cell you enter.')],
  complexity:{time:'O(MN)',space:'O(MN)',note:bi('M × N = số ô. Lưới lớn rút gọn hình/trace; kết quả và đường đi được tính đầy đủ.','M × N = cells. Large grids condense pictures/traces; the answer and path are computed in full.')},
  code:CODE, builder:build, parseInput, liveArgs:input=>[parseInput(input)],
} };
