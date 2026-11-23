'use strict';

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  'from collections import Counter',
  'from typing import List',
  '',
  'class Solution:',
  '    def countExcellentPairs(self, nums: List[int], k: int) -> int:',
  '        unique = list(dict.fromkeys(nums))',
  '        count = Counter()',
  '        for x in unique:',
  "            bits = bin(x).count('1')",
  '            count[bits] += 1',
  '',
  '        answer = 0',
  '        for a in count:',
  '            for b in count:',
  '                if a + b >= k:',
  '                    answer += count[a] * count[b]',
  '        return answer',
];

function popcount(value) {
  let total = 0;
  for (; value; value = value & (value - 1)) total++;
  return total;
}

function parse(input, params = {}, visual = true) {
  let nums = input;
  if (typeof input === 'string') {
    try {
      const raw = input.trim();
      nums = raw.startsWith('[') ? JSON.parse(raw) : raw.split(',').map(part => /^\d+$/.test(part.trim()) ? Number(part) : NaN);
    } catch (_) { nums = null; }
  }
  const limit = visual ? 16 : 100000;
  if (!Array.isArray(nums) || !nums.length || nums.length > limit || !Array.from(nums).every(x => typeof x === 'number' && Number.isInteger(x) && x >= 1 && x <= 1000000000)) {
    throw new RangeError(`2354: nums cần 1–${limit} số nguyên trong 1…10^9 / nums needs 1–${limit} integers in 1…10^9.`);
  }
  if (visual && new Set(nums).size > 12) throw new RangeError('2354: minh hoạ tối đa 12 giá trị khác nhau / at most 12 distinct values for visualization.');
  const rawK = params.k === undefined ? 3 : params.k;
  const k = typeof rawK === 'number' || typeof rawK === 'string' && /^\d+$/.test(rawK.trim()) ? Number(rawK) : NaN;
  if (!Number.isInteger(k) || k < 1 || k > 60) throw new RangeError('2354: k là số nguyên trong 1…60 / k must be an integer in 1…60.');
  return { nums: [...nums], k };
}

function builder(input, params = {}) {
  const { nums, k } = parse(input, params);
  const unique = [...new Set(nums)], count = new Map(), steps = [], tests = [];
  let allocated = false, x, bits, answer, a, b, index = null, processed = 0, decision = null;
  const labels = {
    dedupe: bi('Bỏ giá trị trùng', 'Remove duplicate values'),
    allocate: bi('Tạo nhóm bit', 'Create bit-count buckets'),
    read: bi('Chọn một số', 'Choose a value'),
    bits: bi('Đếm bit 1', 'Count set bits'),
    bucket: bi('Thêm vào nhóm', 'Add to a bucket'),
    'values-end': bi('Đã nhóm hết số', 'All values grouped'),
    answer: bi('Khởi tạo đáp án', 'Initialize the answer'),
    outer: bi('Chọn nhóm a', 'Choose bucket a'),
    inner: bi('Chọn nhóm b', 'Choose bucket b'),
    check: bi('a + b ≥ k?', 'a + b ≥ k?'),
    add: bi('Cộng cả khối cặp', 'Count the entire pair block'),
    'inner-end': bi('Hết nhóm b', 'End of buckets b'),
    'outer-end': bi('Hết nhóm a', 'End of buckets a'),
    return: bi('Hoàn tất đếm cặp', 'Finished counting pairs'),
  };
  function emit(line, phase) {
    const locals = { nums: [...nums], k, unique: [...unique] };
    if (allocated) locals.count = Object.fromEntries(count);
    for (const [name, value] of Object.entries({ x, bits, answer, a, b })) if (value !== undefined) locals[name] = value;
    const groups = [...count].map(([bits, amount]) => ({ bits, amount, members: unique.slice(0, processed).filter(value => popcount(value) === bits) }));
    steps.push({
      title: bi(`Dòng ${line} · ${labels[phase].vi}`, `Line ${line} · ${labels[phase].en}`),
      note: bi('', ''), arr: [], highlight: [], mark: [], codeLines: [line], debugLine: line,
      vars: Object.entries(locals).map(([name, value]) => ({ name, value })), final: phase === 'return',
      excellentPairs2354View: {
        nums: [...nums], unique: [...unique], k, line, source: SOURCE[line - 1].trim(), phase,
        x: x ?? null, bits: bits ?? null, a: a ?? null, b: b ?? null,
        index, processed, groups, answer: answer ?? null,
        decision: decision ? { ...decision } : null, tests: tests.map(test => ({ ...test })),
        locals, final: phase === 'return',
      },
    });
  }

  emit(6, 'dedupe');
  allocated = true; emit(7, 'allocate');
  for (let i = 0; i < unique.length; i++) {
    index = i; x = unique[i]; emit(8, 'read');
    bits = popcount(x); emit(9, 'bits');
    count.set(bits, (count.get(bits) || 0) + 1); processed = i + 1; emit(10, 'bucket');
  }
  emit(8, 'values-end');
  index = null; answer = 0; emit(12, 'answer');
  for (const first of count.keys()) {
    a = first; decision = null; emit(13, 'outer');
    for (const second of count.keys()) {
      b = second; decision = null; emit(14, 'inner');
      decision = { a, b, sum: a + b, accepted: a + b >= k, ways: count.get(a) * count.get(b), before: answer, after: null };
      tests.push({ a, b, accepted: decision.accepted, applied: !decision.accepted, ways: decision.ways });
      emit(15, 'check');
      if (decision.accepted) {
        answer += decision.ways; decision.after = answer; tests.at(-1).applied = true; emit(16, 'add');
      }
    }
    decision = null; emit(14, 'inner-end');
  }
  emit(13, 'outer-end');
  emit(17, 'return');
  return { original: nums, answer, steps };
}

module.exports = { 2354: {
  id: 2354, slug: 'number-of-excellent-pairs', difficulty: 'hard',
  category: { key: 'bitmask', vi: 'Bitmask', en: 'Bitmask' },
  title: bi('Number of Excellent Pairs', 'Number of Excellent Pairs'),
  titleVi: bi('Đếm cặp số tuyệt vời', 'Count excellent pairs'),
  statement: bi('Đếm cặp giá trị (x, y) có popcount(x OR y) + popcount(x AND y) ≥ k. (x, y) và (y, x) khác nhau; cho phép x = y. Giá trị trùng trong nums chỉ tính một lần.', 'Count value pairs (x, y) with popcount(x OR y) + popcount(x AND y) ≥ k. (x, y) and (y, x) are distinct; x = y is allowed. Repeated values in nums count only once.'),
  inputKind: 'array', inputLabel: bi('nums · tối đa 16 số, 12 giá trị khác nhau · 1…10^9', 'nums · up to 16 numbers, 12 distinct values · 1…10^9'),
  defaultInput: '1,2,3,1', maxInput: 1000000000,
  extraParams: [{ key: 'k', type: 'number', default: 3, min: 1, max: 60, label: bi('k · tổng bit 1 tối thiểu', 'k · minimum total set bits') }],
  approach: [bi('Đếm bit 1 của từng giá trị khác nhau. Hai nhóm a, b đóng góp count[a] × count[b] khi a + b ≥ k.', 'Count set bits for each distinct value. Buckets a, b contribute count[a] × count[b] when a + b ≥ k.')],
  complexity: { time: 'O(n + B²)', space: 'O(U + B)', note: bi('U: số giá trị khác nhau; B ≤ 30 nhóm bit. Không tính dữ liệu minh hoạ.', 'U: distinct values; B ≤ 30 bit-count buckets. Excludes visualization data.') },
  code: SOURCE, debugMode: 'line-by-line', builder,
  liveArgs: (input, params) => { const { nums, k } = parse(input, params, false); return [nums, k]; },
} };
