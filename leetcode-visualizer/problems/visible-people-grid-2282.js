'use strict';
const base = require('./monotonic-stack')[2282];
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({ vi, en });
const copy = value => JSON.parse(JSON.stringify(value));
const CODE = `from typing import List

class Solution:
    def seePeople(self, heights: List[List[int]]) -> List[List[int]]:
        rows, cols = len(heights), len(heights[0])
        answer = [[0] * cols for _ in range(rows)]

        def scan(cells):
            stack = []
            for r, c in reversed(cells):
                height = heights[r][c]
                while stack and heights[stack[-1][0]][stack[-1][1]] < height:
                    nr, nc = stack.pop()
                    answer[r][c] += 1
                if stack:
                    nr, nc = stack[-1]
                    answer[r][c] += 1
                    if heights[nr][nc] == height:
                        stack.pop()
                stack.append((r, c))

        for r in range(rows):
            scan([(r, c) for c in range(cols)])
        for c in range(cols):
            scan([(r, c) for r in range(rows)])
        return answer`;

function parse(input) {
  let grid = input;
  try {
    if (typeof grid === 'string') {
      const s = grid.trim();
      grid = s.startsWith('[') ? JSON.parse(s) : s ? s.split(/[;\n]/).map(row =>
        row.split(',').map(token => token.trim() ? Number(token) : NaN)) : [];
    }
  } catch { grid = null; }
  if (!Array.isArray(grid) || !grid.length || grid.length > 6 ||
      !Array.from(grid).every(row => Array.isArray(row) && row.length > 0 && row.length <= 6 &&
        row.length === grid[0].length && Array.from(row).every(h => Number.isInteger(h) && h >= 1 && h <= 100000))) {
    throw new RangeError('heights: rectangular 1–6 × 1–6 grid, integer heights 1–100000');
  }
  return grid.map(row => [...row]);
}

function payload(input) { return { code: CODE, method: 'seePeople', args: [parse(input)] }; }

function build(input) {
  const tracePayload = payload(input), grid = tracePayload.args[0], source = CODE.split('\n');
  const native = runTrace(tracePayload), zero = () => grid.map(row => row.map(() => 0));
  const right = zero(), down = zero(), ledger = [], settled = [], visits = [];
  let phase = null, lineIndex = null, current = null, focus = null, comparison = null, previousAnswer = null;
  const steps = native.events.map((event, step) => {
    const x = event.locals, text = source[event.line - 1].trim();
    const answer = x.answer ?? event.outer.answer ?? null;
    let change = null;
    if (event.scope === 'seePeople' && event.branch && (text === 'for r in range(rows):' || text === 'for c in range(cols):')) {
      phase = text.includes('for r ') ? 'row' : 'col';
      lineIndex = phase === 'row' ? x.r : x.c;
      current = null; focus = null; comparison = null; change = { kind: 'pass', phase, lineIndex };
    }
    if (text === 'stack = []') { current = null; focus = null; comparison = null; }
    if (text === 'for r, c in reversed(cells):' && event.branch) {
      current = [x.r, x.c]; focus = null; comparison = null;
      visits.push({ cell: [...current], phase, step }); change = { kind: 'visit', cell: [...current] };
    }
    if (text.startsWith('while stack and heights[')) {
      const top = x.stack.at(-1) ?? null;
      comparison = { kind: 'shorter', target: top, left: top ? grid[top[0]][top[1]] : null,
        right: x.height, op: '<', pass: event.branch };
      focus = top ? { target: top, kind: 'compare' } : null;
    }
    if (text === 'nr, nc = stack.pop()') {
      focus = { target: [x.nr, x.nc], kind: 'pop' };
      change = { kind: 'pop', cell: [x.nr, x.nc] };
    }
    if (text === 'nr, nc = stack[-1]') focus = { target: [x.nr, x.nc], kind: 'blocker' };
    if (text === 'answer[r][c] += 1') {
      const target = [x.nr, x.nc], cell = [x.r, x.c];
      const row = { cell, target, phase, before: previousAnswer[x.r][x.c], after: answer[x.r][x.c], step };
      (phase === 'row' ? right : down)[x.r][x.c] += 1;
      ledger.push(row); focus = { target, kind: 'count' }; change = { kind: 'count', ...row };
    }
    if (text === 'if heights[nr][nc] == height:') {
      comparison = { kind: 'equal', target: [x.nr, x.nc], left: grid[x.nr][x.nc], right: x.height,
        op: '==', pass: event.branch };
    }
    if (text === 'stack.pop()') {
      focus = { target: [x.nr, x.nc], kind: 'equal' };
      change = { kind: 'equal', cell: [x.nr, x.nc] };
    }
    if (text === 'stack.append((r, c))') {
      settled.push({ cell: [x.r, x.c], phase }); change = { kind: 'push', cell: [x.r, x.c] };
    }
    const final = event.returning && event.scope === 'seePeople';
    const cells = x.cells ?? (phase === 'row' ? grid[0].map((_, c) => [lineIndex, c]) :
      phase === 'col' ? grid.map((_, r) => [r, lineIndex]) : []);
    const view = { id: 2282, grid, phase, lineIndex, current: final ? null : copy(current), cells,
      answer, right: copy(right), down: copy(down), ledger: copy(ledger), settled: copy(settled), visits: copy(visits),
      stack: x.stack ?? null, focus: final ? null : copy(focus), comparison: final ? null : copy(comparison), change,
      source: { line: event.line, text, timing: 'after' }, locals: x, outer: event.outer, frames: event.frames,
      scope: event.scope, branch: event.branch, returning: event.returning, returned: event.returned,
      trace: native.trace, result: final ? native.answer : null };
    previousAnswer = answer;
    return { arr: [], codeBlock: 1, codeLines: [event.line], final,
      title: bi(`L${event.line} · ${text}`, `L${event.line} · ${text}`), note: bi('', ''),
      vars: Object.entries(x).map(([name, value]) => ({ name, value, rawValue: value })), visiblePeople2282View: view };
  });
  return { original: grid.flat(), answer: native.answer, steps };
}

module.exports = { 2282: {
  ...base, code: CODE.split('\n'), debugMode: 'line-by-line', builder: build,
  liveArgs: input => [parse(input)], tracePayload: payload,
  inputLabel: bi('heights · tối đa 6×6 · hàng cách bằng ; hoặc JSON · 1–100000',
    'heights · up to 6×6 · separate rows with ; or use JSON · 1–100000'),
  statement: bi('Mỗi người nhìn sang phải và xuống dưới. Thấy người khác khi mọi người ở giữa thấp hơn cả hai. Trả ma trận số người nhìn thấy.',
    'Each person looks right and down. A person is visible when everyone between them is shorter than both endpoints. Return the matrix of visible counts.'),
  approach: [bi('Quét mỗi hàng từ phải sang trái, mỗi cột từ dưới lên. Stack giữ người còn có thể được nhìn thấy. Khi bằng chiều cao, giữ người gần hơn.',
    'Scan each row right to left and each column bottom to top. The stack retains visible candidates. On equal heights, keep the nearer person.')],
  complexity: { time: 'O(mn)', space: 'O(mn)', note: bi('Ma trận kết quả O(mn); stack phụ O(max(m,n)).',
    'The result matrix uses O(mn); the auxiliary stack uses O(max(m,n)).') },
  visualizationLimits: { maxRows: 6, maxCols: 6, completeTrace: true },
} };
