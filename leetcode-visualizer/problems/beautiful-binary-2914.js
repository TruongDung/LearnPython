'use strict';

const bi = (vi, en) => ({ vi, en });
const CODE = [
  'class Solution:',
  '    def minChanges(self, s):',
  '        changes = 0',
  '        for i in range(0, len(s), 2):',
  '            if s[i] != s[i + 1]:',
  '                changes += 1',
  '        return changes',
];

function parse(input) {
  if (typeof input !== 'string' || input.length < 2 || input.length > 100000
    || input.length % 2 || !/^[01]+$/.test(input)) {
    throw new Error('2914: s chỉ gồm 0/1, độ dài chẵn từ 2 đến 100000. / Use a binary string of even length, from 2 to 100000.');
  }
  return input;
}

function buildSteps(input) {
  const s = parse(input), n = s.length, pairCount = n / 2, detailed = n <= 80;
  const visible = detailed ? Array.from({ length: pairCount }, (_, i) => i)
    : [...Array.from({ length: 6 }, (_, i) => i), ...Array.from({ length: 4 }, (_, i) => pairCount - 4 + i)];
  const pairs = new Map(visible.map(index => [index, {
    index, start: index * 2, original: s.slice(index * 2, index * 2 + 2),
    compared: false, done: false, needed: null, output: null,
  }]));
  const steps = [], repaired = s.split('');
  let changes = null, processed = 0, i = null, currentPair = null;
  const emit = (line, phase, event, condition = null) => {
    if (!detailed && !['setup','done'].includes(phase)) return;
    const final = phase === 'done';
    const vars = [{ name: 's', value: n <= 80 ? s : `${s.slice(0,32)}…${s.slice(-16)}` }];
    if (changes !== null) vars.push({ name: 'changes', value: changes });
    if (i !== null) vars.push({ name: 'i', value: i }, { name: 's[i]', value: s[i] }, { name: 's[i + 1]', value: s[i+1] });
    steps.push({
      title: bi(`Dòng ${line} · ${event.vi}`, `Line ${line} · ${event.en}`),
      codeLines: [line], codeBlock: 1, final, arr: [], highlight: [], mark: [], note: bi('', ''), vars,
      beautiful2914View: {
        n, pairCount, detailed, omittedPairs: pairCount - visible.length,
        changes, processed, currentPair, phase, line, source: CODE[line-1], event, condition,
        pairs: [...pairs.values()].map(pair => ({ ...pair })), answer: final ? changes : null,
      },
    });
  };
  emit(1,'setup',bi('Khai báo Solution','Define Solution'));
  emit(2,'setup',bi('Gọi minChanges','Call minChanges'));
  changes = 0;
  emit(3,'setup',bi('Bắt đầu: changes = 0','Start: changes = 0'));
  for (i = 0; i < n; i += 2) {
    currentPair = i / 2;
    const pair = pairs.get(currentPair);
    emit(4,'read',bi(`Đọc cặp [${i}, ${i+1}]`,`Read pair [${i}, ${i+1}]`));
    const different = s[i] !== s[i+1];
    if (pair) { pair.compared = true; pair.needed = Number(different); }
    if (!different) {
      processed++;
      if (pair) { pair.done = true; pair.output = pair.original; }
    }
    emit(5,'compare',different
      ? bi(`${s[i]} ≠ ${s[i+1]} → cần sửa 1 bit`,`${s[i]} ≠ ${s[i+1]} → one bit must change`)
      : bi(`${s[i]} = ${s[i+1]} → giữ nguyên`,`${s[i]} = ${s[i+1]} → keep both`),different);
    if (different) {
      changes++; processed++; repaired[i+1] = s[i];
      if (pair) { pair.done = true; pair.output = s[i].repeat(2); }
      emit(6,'count',bi(`changes += 1 → ${changes}`,`changes += 1 → ${changes}`));
    }
  }
  // Python leaves i at the last yielded value after the for loop.
  i = n - 2; currentPair = null;
  emit(4,'loop-end',bi('Đã xét hết các cặp','All pairs processed'),false);
  emit(7,'done',bi(`Chỉ cần đổi ${changes} bit`,`Only ${changes} bit changes needed`));
  return { original: s, answer: changes, repaired: repaired.join(''), steps };
}

module.exports = { 2914: {
  id: 2914, slug: 'minimum-number-of-changes-to-make-binary-string-beautiful', difficulty: 'medium',
  category: { key: 'string', vi: 'Chuỗi', en: 'String' },
  tags: [{ key: 'greedy', vi: 'Tham lam', en: 'Greedy' }],
  title: bi('Minimum Number of Changes to Make Binary String Beautiful','Minimum Number of Changes to Make Binary String Beautiful'),
  titleVi: bi('Đổi ít bit nhất để chuỗi nhị phân đẹp','Minimum bit changes for a beautiful binary string'),
  statement: bi('Cho chuỗi nhị phân s có độ dài chẵn. Đổi ít bit nhất để chia chuỗi thành các đoạn có độ dài chẵn, mỗi đoạn chỉ gồm 0 hoặc chỉ gồm 1. Có thể chia mọi đoạn hợp lệ thành các cặp 00 hoặc 11.', 'Given an even-length binary string, change the fewest bits so it can be partitioned into even-length substrings, each containing only zeros or only ones. Every valid part can be divided into pairs 00 or 11.'),
  defaultInput: '10010011', inputKind: 'string', inputLabel: bi('Chuỗi nhị phân s · độ dài chẵn','Binary string s · even length'), extraParams: [],
  debugMode: 'line-by-line', code: CODE, builder: buildSteps, liveArgs: input => [parse(input)],
  approach: [
    bi('Ghép cặp cố định từ đầu chuỗi: (0,1), (2,3), (4,5), …','Use fixed pairs from the start: (0,1), (2,3), (4,5), …'),
    bi('00 hoặc 11: giữ nguyên. 01 hoặc 10: đổi đúng 1 bit để hai bit giống nhau.','00 or 11: keep both. 01 or 10: change exactly one bit to make them equal.'),
    bi('Số cặp lệch là cận dưới; sửa mỗi cặp lệch một lần đạt được cận dưới đó.','The number of unequal pairs is a lower bound; one change in each unequal pair achieves it.'),
  ],
  complexity: { time: 'O(n)', space: 'O(1)', note: bi('Mỗi cặp xét một lần. Debug từng dòng khi n ≤ 80; chuỗi lớn vẫn tính đủ tới n = 100000.','Inspect every pair once. Line-by-line debug for n ≤ 80; full results up to n = 100000.') },
} };
