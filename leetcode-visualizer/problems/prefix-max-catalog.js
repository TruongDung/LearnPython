"use strict";

const PREFIX_MAX_TAG = { key: 'prefix-max', vi: 'Prefix Max', en: 'Prefix Max' };
// First six entries preserve the requested learning order. Suffix maximum is
// the same running-maximum pattern in the opposite scan direction.
const PREFIX_MAX_ROSTER = [
  { id: 1762, title: 'Buildings With an Ocean View', difficulty: 'medium', kind: 'core', vi: 'Max tích lũy từ phải sang trái (suffix max)', en: 'Running maximum from right to left (suffix max)' },
  { id: 2070, title: 'Most Beautiful Item for Each Query', difficulty: 'medium', kind: 'core', vi: 'Prefix max + Binary Search', en: 'Prefix maximum + binary search' },
  { id: 2012, title: 'Sum of Beauty in the Array', difficulty: 'medium', kind: 'core', vi: 'Prefix max + Suffix min', en: 'Prefix maximum + suffix minimum' },
  { id: 2640, title: 'Find the Score of All Prefixes of an Array', difficulty: 'medium', kind: 'core', vi: 'Prefix max + Prefix sum', en: 'Prefix maximum + prefix sum' },
  { id: 42, title: 'Trapping Rain Water', difficulty: 'hard', kind: 'core', vi: 'Prefix max + Suffix max', en: 'Prefix maximum + suffix maximum' },
  // https://leetcode.com/problems/sum-of-gcd-of-formed-pairs/description/
  { id: 3867, title: 'Sum of GCD of Formed Pairs', difficulty: 'medium', kind: 'core', vi: 'Prefix max → prefixGcd → sắp xếp, ghép cặp', en: 'Prefix maximum → prefixGcd → sorting and pairing' },
  { id: 2485, title: 'Find the Pivot Integer', difficulty: 'easy', kind: 'related', vi: 'Prefix sum · bài liên quan', en: 'Prefix sum · related exercise' },
  { id: 2420, title: 'Find All Good Indices', difficulty: 'medium', kind: 'related', vi: 'Prefix/suffix độ dài dãy đơn điệu', en: 'Prefix/suffix monotonic-run lengths' },
  { id: 2615, title: 'Sum of Distances', difficulty: 'medium', kind: 'related', vi: 'Prefix sum theo nhóm index', en: 'Prefix sums grouped by value' },
  { id: 2483, title: 'Minimum Penalty for a Shop', difficulty: 'medium', kind: 'related', vi: 'Prefix/suffix tối ưu điểm đóng cửa', en: 'Prefix/suffix optimization of closing time' },
  { id: 2587, title: 'Rearrange Array to Maximize Prefix Score', difficulty: 'medium', kind: 'related', vi: 'Sắp xếp + đếm prefix sum dương', en: 'Sorting + counting positive prefix sums' },
  { id: 2281, title: 'Sum of Total Strength of Wizards', difficulty: 'hard', kind: 'related', vi: 'Monotonic Stack + Prefix Sum', en: 'Monotonic stack + prefix sums' },
  { id: 1793, title: 'Maximum Score of a Good Subarray', difficulty: 'hard', kind: 'related', vi: 'Hai con trỏ mở rộng theo minimum', en: 'Two-pointer expansion tracking the minimum' },
];
const PREFIX_MAX_ORDER = PREFIX_MAX_ROSTER.map(p => p.id);
const PREFIX_MAX_ORDER_LABEL = {
  vi: 'Ưu tiên: 1762 → 2070 → 2012 → 2640 → 42 → 3867. Sau đó luyện nhóm Mở rộng.',
  en: 'Start with 1762 → 2070 → 2012 → 2640 → 42 → 3867. Then practice Related exercises.',
};
const PREFIX_MAX_GUIDE = Object.fromEntries(['vi', 'en'].map(lang => [lang, {
  intro: lang === 'vi'
    ? 'Prefix Max lưu giá trị lớn nhất từ đầu đến mỗi index; Suffix Max quét theo chiều ngược lại. Nhóm Mở rộng luyện prefix/suffix và kỹ thuật liên quan, không phải prefix maximum trực tiếp.'
    : 'Prefix Max tracks the largest value from the beginning through each index; Suffix Max scans in reverse. Related exercises practice prefix/suffix and adjacent techniques rather than direct prefix maximum.',
  patterns: PREFIX_MAX_ROSTER.map(p => ({ id: p.id, name: p.title, pattern: p[lang] })),
  stages: [
    { title: lang === 'vi' ? '1 · Prefix/Suffix Max' : '1 · Prefix/Suffix Max',
      description: lang === 'vi' ? 'Học theo thứ tự ưu tiên, từ max tích lũy đến phối hợp binary search, prefix sum và GCD.' : 'Follow the suggested order, from running maxima to binary search, prefix sums and GCD.',
      problems: PREFIX_MAX_ROSTER.filter(p => p.kind === 'core').map(p => p.id) },
    { title: lang === 'vi' ? '2 · Mở rộng' : '2 · Related exercises',
      description: lang === 'vi' ? 'Phân biệt prefix sum, điều kiện đơn điệu, tối ưu prefix/suffix, stack và minimum.' : 'Distinguish prefix sums, monotonic conditions, prefix/suffix optimization, stacks and minima.',
      problems: PREFIX_MAX_ROSTER.filter(p => p.kind === 'related').map(p => p.id) },
  ],
  conclusion: lang === 'vi'
    ? '13 bài khác nhau. 1762 là Medium (Premium); 42 là Hard và chỉ xuất hiện một lần. Bài mờ chưa có visualization.'
    : '13 unique problems. 1762 is Medium (Premium); 42 is Hard and appears once. Dimmed problems do not have a visualization yet.',
}]));

function prefixMaxSubTabs(supported) {
  return [
    { key: 'all', vi: 'Tất cả', en: 'All' },
    { key: 'core', vi: 'Prefix/Suffix Max', en: 'Prefix/Suffix Max' },
    { key: 'related', vi: 'Mở rộng', en: 'Related' },
  ].map(tab => ({ ...tab, roster: PREFIX_MAX_ROSTER.filter(p => tab.key === 'all' || p.kind === tab.key).map(p => ({
    id: p.id, title: p.title, difficulty: supported[p.id]?.difficulty || p.difficulty,
    kind: p.kind, technique: { vi: p.vi, en: p.en }, available: Boolean(supported[p.id]),
  })) }));
}
module.exports = { PREFIX_MAX_TAG, PREFIX_MAX_ROSTER, PREFIX_MAX_ORDER, PREFIX_MAX_ORDER_LABEL, PREFIX_MAX_GUIDE, prefixMaxSubTabs };
