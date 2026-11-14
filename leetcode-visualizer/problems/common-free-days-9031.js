'use strict';
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({ vi, en });
const code = [
  'class Solution:',
  '    def findAvailability(self, blocks):',
  '        busy = sorted((start, finish) for _, start, finish in blocks)',
  '        free = []',
  '        end = 0',
  '        for start, finish in busy:',
  '            if start > end:',
  '                free.append([end, start])',
  '            end = max(end, finish)',
  '        free.append([end, float("inf")])',
  '        return free',
];
function parse(input) {
  let blocks = input;
  if (typeof input === 'string') { try { blocks = JSON.parse(input); } catch (_) { throw Error('9031: use JSON [[personId,start,end], ...].'); } }
  if (blocks && !Array.isArray(blocks)) blocks = blocks.blocks;
  if (!Array.isArray(blocks) || blocks.length > 24) throw Error('9031: use at most 24 busy blocks.');
  blocks = blocks.map(block => Array.isArray(block) ? [...block] : [block?.personId, block?.unavailable_date?.startDay ?? block?.startDay, block?.unavailable_date?.endDay ?? block?.endDay]);
  if (blocks.some(block => block.length !== 3 || !['string', 'number'].includes(typeof block[0]) || !/^[A-Za-z0-9_-]{1,8}$/.test(String(block[0])) || !Number.isSafeInteger(block[1]) || !Number.isSafeInteger(block[2]) || block[1] < 0 || block[2] <= block[1] || block[2] > 1000000000) || new Set(blocks.map(block => String(block[0]))).size > 8) throw Error('9031: up to 8 people, 0 ≤ start < end ≤ 10⁹; intervals are [start,end).');
  return blocks;
}
function builder(input) {
  const blocks = parse(input), trace = runTrace({ code: code.join('\n'), method: 'findAvailability', args: [blocks] });
  let processed = 0, current = null;
  const steps = trace.events.map((record, index) => {
    const x = record.locals, source = code[record.line - 1].trim(), final = index === trace.events.length - 1;
    let event = 'line';
    if (record.line === 3) event = 'sort';
    if (record.line === 6 && record.branch) { current = [x.start, x.finish]; event = 'scan'; }
    if (record.line === 7) event = record.branch ? 'gap' : 'overlap';
    if (record.line === 8) event = 'free';
    if (record.line === 9) { processed++; event = 'merge'; }
    if (record.line === 10) { current = null; event = 'tail'; }
    const merged = [];
    for (const interval of (x.busy || []).slice(0, processed)) {
      const last = merged.at(-1);
      if (last && interval[0] <= last[1]) last[1] = Math.max(last[1], interval[1]);
      else merged.push([...interval]);
    }
    return { arr: [], title: bi(`Dòng ${record.line}`, `Line ${record.line}`), codeLines: [record.line], note: bi('', ''), final,
      vars: ['start', 'finish', 'end', 'free'].map(name => ({ name, value: x[name] ?? '—' })),
      commonFree9031View: { blocks: blocks.map(block => [...block]), sorted: x.busy || [], merged, current: current && [...current], end: x.end ?? 0, free: (x.free || []).map(interval => [...interval]), event: final ? 'result' : event, line: record.line, source, final, answer: final ? trace.answer : null },
    };
  });
  return { original: blocks, answer: trace.answer, steps };
}
module.exports = { 9031: {
  id: 9031, difficulty: 'medium', slug: null,
  category: { key: 'interview', vi: 'Phỏng vấn', en: 'Interview' },
  tags: [{ key: 'interval', vi: 'Khoảng', en: 'Intervals' }, { key: 'sorting', vi: 'Sắp xếp', en: 'Sorting' }],
  title: bi('Calendar — Common Free Days', 'Calendar — Common Free Days'),
  titleVi: bi('Các khoảng ngày mọi người cùng rảnh', 'Days when everyone is free'),
  statement: bi('Mỗi block [personId,start,end] là lịch bận [start,end). Tìm mọi khoảng rảnh chung từ ngày 0 đến ∞, gồm cả khoảng trước và sau các lịch bận.', 'Each [personId,start,end] block marks a busy half-open interval [start,end). Find all common free ranges on [0,∞), including the initial and final gaps.'),
  defaultInput: '[[1,2,6],[1,9,10],[2,2,7]]', inputKind: 'string', inputLabel: bi('JSON [[người, bắt đầu, kết thúc], …]', 'JSON [[person, start, end], …]'),
  approach: [bi('Gộp lịch bận của mọi người. Các khoảng trống còn lại là rảnh chung.', 'Merge everyone’s busy blocks. Gaps in their union are common free time.')],
  complexity: { time: 'O(B log B)', space: 'O(B)' }, debugMode: 'line-by-line', code, builder, liveArgs: input => [parse(input)],
} };
