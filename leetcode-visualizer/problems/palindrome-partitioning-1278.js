"use strict";

const bi = (vi, en) => ({ vi, en });
const COST_CODE = [
  'class Solution:',
  '    def palindromePartition(self, s, k):',
  '        n = len(s)',
  '        cost = [[0] * n for _ in range(n)]',
  '        for length in range(2, n + 1):',
  '            for left in range(n - length + 1):',
  '                right = left + length - 1',
  '                inner = cost[left + 1][right - 1] if length > 2 else 0',
  '                mismatch = int(s[left] != s[right])',
  '                cost[left][right] = inner + mismatch',
];
const CODE = [...COST_CODE,
  '        dp = [[n] * (n + 1) for _ in range(k + 1)]',
  '        dp[0][0] = 0',
  '        for parts in range(1, k + 1):',
  '            for end in range(parts, n + 1):',
  '                for cut in range(parts - 1, end):',
  '                    dp[parts][end] = min(dp[parts][end], dp[parts - 1][cut] + cost[cut][end - 1])',
  '        return dp[k][n]',
];
const DFS_CODE = [...COST_CODE,
  '        from functools import lru_cache',
  '        @lru_cache(None)',
  '        def dfs(start, parts):',
  '            if parts == 0:',
  '                return 0 if start == n else n',
  '            if n - start < parts:',
  '                return n',
  '            best = n',
  '            for end in range(start + 1, n + 1):',
  '                candidate = cost[start][end - 1] + dfs(end, parts - 1)',
  '                best = min(best, candidate)',
  '            return best',
  '        return dfs(0, k)',
];

function parse(input, params = {}) {
  let s = input, embeddedK;
  if (input && typeof input === 'object') ({ s, k: embeddedK } = input);
  if (typeof s === 'string' && s.trim().startsWith('{')) {
    try { ({ s, k: embeddedK } = JSON.parse(s)); }
    catch { throw new Error('1278: JSON không hợp lệ / Invalid JSON.'); }
  }
  const k = Number(params.k ?? embeddedK ?? 2);
  if (typeof s !== 'string' || !/^[a-z]{1,100}$/.test(s) || !Number.isInteger(k) || k < 1 || k > s.length) {
    throw new Error('1278: cần 1 ≤ k ≤ độ dài s ≤ 100; s chỉ gồm a–z. / Use 1 ≤ k ≤ s.length ≤ 100 and lowercase a–z.');
  }
  return { s, k };
}

function inspect(s, start, end, outerKnown = true) {
  const repaired = s.slice(start, end).split(''), pairs = [];
  for (let a = start, b = end - 1; a < b; a++, b--) {
    const known = a !== start || outerKnown;
    const mismatch = known ? s[a] !== s[b] : null;
    pairs.push({ a, b, known, mismatch });
    if (mismatch) repaired[b - start] = s[a];
  }
  return { start, end, original: s.slice(start, end), repaired: repaired.join(''), pairs,
    changes: pairs.filter(pair => pair.mismatch).length, complete: outerKnown || end - start === 1 };
}

function build(input, params = {}, approach = 1) {
  const { s, k } = parse(input, params), n = s.length, detailed = n <= 12;
  const source = approach === 2 ? DFS_CODE : CODE;
  const steps = [], locals = { s, k }, stack = [], memo = new Map(), choice = new Map();
  const parents = Array.from({ length: k + 1 }, () => Array(n + 1).fill(-1));
  let cost = null, known = null, dp = null, focus = null, hits = 0;
  function emit(phase, line, event, extra = {}) {
    if (!detailed && phase !== 'setup' && phase !== 'done') return;
    const currentLocals = phase === 'dfs' && stack.length ? { s, k, n, ...stack.at(-1) } : locals;
    steps.push({
      title: bi(`Dòng ${line} · ${event.vi}`, `Line ${line} · ${event.en}`),
      codeLines: [line], codeBlock: approach, final: phase === 'done', arr: [], highlight: [], mark: [], note: bi('', ''),
      vars: Object.entries(currentLocals).map(([name, value]) => ({ name, value })),
      palindrome1278View: JSON.parse(JSON.stringify({
        s, k, n, phase, line, source: source[line - 1], event, approach, detailed, focus,
        costs: detailed ? cost : null, known: detailed ? known : null,
        dp: detailed && dp ? dp.map(row => row.map(value => value === n ? null : value)) : null,
        stack, memo: detailed ? [...memo].map(([key, value]) => ({ key, value })) : [], hits, cacheSize: memo.size, ...extra,
      })),
    });
  }
  emit('setup', 1, bi('Khai báo Solution', 'Define Solution'));
  emit('setup', 2, bi('Gọi palindromePartition', 'Call palindromePartition'));
  locals.n = n;
  emit('setup', 3, bi(`n = ${n}`, `n = ${n}`));
  cost = Array.from({ length: n }, () => Array(n).fill(0));
  known = Array.from({ length: n }, (_, a) => Array.from({ length: n }, (_, b) => a >= b));
  emit('setup', 4, bi('Một ký tự đã đối xứng: cost[i][i] = 0', 'One letter is already a palindrome: cost[i][i] = 0'));
  for (let length = 2; length <= n; length++) {
    locals.length = length; focus = null;
    emit('cost', 5, bi(`Độ dài ${length}`, `Length ${length}`));
    for (let left = 0; left + length <= n; left++) {
      locals.left = left; focus = null;
      emit('cost', 6, bi(`left = ${left}`, `left = ${left}`));
      const right = left + length - 1;
      locals.right = right;
      focus = detailed ? inspect(s, left, right + 1, false) : null;
      emit('cost', 7, bi(`Xét s[${left}:${right + 1}]`, `Inspect s[${left}:${right + 1}]`), { outer: { a: left, b: right } });
      const inner = length > 2 ? cost[left + 1][right - 1] : 0;
      locals.inner = inner;
      emit('cost', 8, bi(`Phần giữa cần ${inner} lần sửa`, `The inner substring needs ${inner} changes`), { outer: { a: left, b: right }, inner, innerCell: length > 2 ? [left + 1, right - 1] : null });
      const mismatch = Number(s[left] !== s[right]);
      locals.mismatch = mismatch;
      focus = detailed ? inspect(s, left, right + 1) : null;
      emit('cost', 9, bi(`“${s[left]}” ${mismatch ? '≠' : '='} “${s[right]}” → +${mismatch}`, `“${s[left]}” ${mismatch ? '≠' : '='} “${s[right]}” → +${mismatch}`), { outer: { a: left, b: right }, inner, mismatch });
      cost[left][right] = inner + mismatch; known[left][right] = true;
      emit('cost', 10, bi(`cost[${left}][${right}] = ${inner} + ${mismatch} = ${cost[left][right]}`, `cost[${left}][${right}] = ${inner} + ${mismatch} = ${cost[left][right]}`), { outer: { a: left, b: right }, inner, mismatch, written: cost[left][right] });
    }
    focus = null;
    emit('cost', 6, bi('Hết đoạn ở độ dài này', 'All substrings of this length processed'), { condition: false });
  }
  emit('cost', 5, bi('Đã tính hết chi phí', 'All substring costs computed'), { condition: false });
  focus = null;
  function witness(parts, end) {
    const selected = [];
    while (parts > 0) {
      const cut = parents[parts][end];
      if (cut < 0) return [];
      selected.unshift(inspect(s, cut, end)); parts--; end = cut;
    }
    return selected;
  }
  if (approach === 1) {
    dp = Array.from({ length: k + 1 }, () => Array(n + 1).fill(n));
    emit('dp', 11, bi('Khởi tạo bảng DP', 'Allocate DP table'));
    dp[0][0] = 0;
    emit('dp', 12, bi('dp[0][0] = 0', 'dp[0][0] = 0'));
    for (let parts = 1; parts <= k; parts++) {
      locals.parts = parts;
      emit('dp', 13, bi(`parts = ${parts}`, `parts = ${parts}`));
      for (let end = parts; end <= n; end++) {
        locals.end = end;
        emit('dp', 14, bi(`end = ${end}`, `end = ${end}`), { parts, end });
        const candidates = [];
        for (let cut = parts - 1; cut < end; cut++) {
          locals.cut = cut;
          focus = detailed ? inspect(s, cut, end) : null;
          emit('dp', 15, bi(`Cắt tại ${cut}`, `Cut at ${cut}`), { parts, end, cut });
          const previous = dp[parts - 1][cut], gain = cost[cut][end - 1], total = previous + gain;
          const before = dp[parts][end], updated = total < before;
          if (updated) { dp[parts][end] = total; parents[parts][end] = cut; }
          if (detailed) {
            candidates.push({ cut, previous, gain, total });
            emit('partition', 16, bi(`dp[${parts}][${end}] = min(${before}, ${previous} + ${gain}) = ${dp[parts][end]}`, `dp[${parts}][${end}] = min(${before}, ${previous} + ${gain}) = ${dp[parts][end]}`), {
              parts, end, cut, previous, gain, total, before, updated, reachable: previous !== n,
              best: dp[parts][end], bestCut: parents[parts][end], prefix: witness(parts - 1, cut), candidates,
            });
          }
        }
        emit('dp', 15, bi('Đã thử hết chỗ cắt', 'All cuts tried'), { parts, end, condition: false });
      }
      emit('dp', 14, bi('Đã xét hết end', 'All ends processed'), { parts, condition: false });
    }
    emit('dp', 13, bi('Đã xét đủ k đoạn', 'All part counts processed'), { condition: false });
    const selected = witness(k, n), answer = dp[k][n];
    focus = selected[0];
    emit('done', 17, bi(`Trả về ${answer}`, `Return ${answer}`), { selected, answer });
    return { original: s, answer, selected, steps };
  }
  emit('dfs', 11, bi('Import lru_cache', 'Import lru_cache'));
  emit('dfs', 12, bi('Tạo cache', 'Create cache'));
  emit('dfs', 13, bi('Khai báo dfs(start, parts)', 'Define dfs(start, parts)'));
  const keyOf = (start, parts) => `${start},${parts}`;
  function dfs(start, parts) {
    const key = keyOf(start, parts);
    if (memo.has(key)) return memo.get(key);
    const frame = { start, parts };
    stack.push(frame); focus = null;
    emit('dfs', 14, bi(`dfs(${start}, ${parts}) · parts == 0`, `dfs(${start}, ${parts}) · parts == 0`), { operation: 'enter-call', condition: parts === 0, cacheKey: key });
    function finish(value, line) {
      memo.set(key, value);
      emit('dfs', line, bi(`Trả ${value} · lưu cache (${key})`, `Return ${value} · cache (${key})`), { operation: 'return-call', returnValue: value, cacheKey: key });
      stack.pop(); return value;
    }
    if (parts === 0) return finish(start === n ? 0 : n, 15);
    const impossible = n - start < parts;
    emit('dfs', 16, bi(`Còn ${n - start} ký tự, cần ${parts} đoạn`, `${n - start} letters left, need ${parts} parts`), { condition: impossible });
    if (impossible) return finish(n, 17);
    frame.best = n;
    emit('dfs', 18, bi(`best = n = ${n}`, `best = n = ${n}`));
    for (let end = start + 1; end <= n; end++) {
      frame.end = end; focus = detailed ? inspect(s, start, end) : null;
      emit('dfs', 19, bi(`Thử đoạn [${start}, ${end})`, `Try substring [${start}, ${end})`));
      const childKey = keyOf(end, parts - 1), cached = memo.has(childKey);
      emit('dfs', 20, bi(`Gọi dfs(${end}, ${parts - 1})`, `Call dfs(${end}, ${parts - 1})`), { operation: 'call-child', cacheKey: childKey });
      const childValue = dfs(end, parts - 1);
      if (cached) hits++;
      frame.candidate = cost[start][end - 1] + childValue;
      focus = detailed ? inspect(s, start, end) : null;
      emit('dfs', 20, cached ? bi(`Cache hit (${childKey}) → ${childValue}`, `Cache hit (${childKey}) → ${childValue}`) : bi(`candidate = ${cost[start][end - 1]} + ${childValue}`, `candidate = ${cost[start][end - 1]} + ${childValue}`), {
        operation: cached ? 'cache-hit' : 'resolve-call', cacheKey: childKey, childValue, gain: cost[start][end - 1], candidate: frame.candidate,
      });
      const before = frame.best;
      if (frame.candidate < frame.best) { frame.best = frame.candidate; choice.set(key, end); }
      emit('dfs', 21, bi(`best = min(${before}, ${frame.candidate}) = ${frame.best}`, `best = min(${before}, ${frame.candidate}) = ${frame.best}`), { operation: 'keep-best', before, candidate: frame.candidate, best: frame.best });
    }
    emit('dfs', 19, bi('Đã thử hết đoạn tiếp theo', 'All next substrings tried'), { condition: false });
    return finish(frame.best, 22);
  }
  emit('dfs', 23, bi(`Gọi dfs(0, ${k})`, `Call dfs(0, ${k})`), { operation: 'call-root' });
  const answer = dfs(0, k), selected = [];
  for (let start = 0, parts = k; parts > 0; parts--) {
    const end = choice.get(keyOf(start, parts));
    selected.push(inspect(s, start, end)); start = end;
  }
  focus = selected[0];
  emit('done', 23, bi(`Trả về ${answer}`, `Return ${answer}`), { selected, answer });
  return { original: s, answer, selected, steps };
}

module.exports = { 1278: {
  id: 1278, slug: 'palindrome-partitioning-iii', difficulty: 'hard',
  category: { key: 'dp', vi: 'Quy hoạch động', en: 'Dynamic Programming' },
  tags: [{ key: 'string', vi: 'Chuỗi', en: 'String' }, { key: 'dp', vi: 'Quy hoạch động', en: 'Dynamic Programming' }],
  title: bi('Palindrome Partitioning III', 'Palindrome Partitioning III'),
  titleVi: bi('Chia K đoạn đối xứng với ít lần sửa nhất', 'Split into K palindromes with the fewest changes'),
  statement: bi('Đổi ít ký tự nhất để chia s thành đúng k đoạn liên tiếp, không rỗng; mỗi đoạn phải đối xứng. Đoạn một ký tự đã đối xứng và không cần sửa.', 'Change the fewest letters so s can be split into exactly k nonempty contiguous palindromes. A single letter is a palindrome and costs zero changes.'),
  defaultInput: 'abc', inputKind: 'string', inputLabel: bi('Chuỗi s (a–z)', 'String s (a–z)'),
  extraParams: [
    { key: 'k', label: bi('Số đoạn k', 'Number of parts k'), default: 2, min: 1, max: 100 },
    { key: 'approach', type: 'select', default: '1', label: bi('Cách giải', 'Approach'), options: [
      { value: '1', label: bi('Cách 1: Bottom-up DP', 'Approach 1: Bottom-up DP') },
      { value: '2', label: bi('Cách 2: DFS + cache', 'Approach 2: DFS + cache') },
    ] },
  ],
  debugMode: 'line-by-line', code: CODE, code2: DFS_CODE,
  codeLabel: bi('Cách 1 · Bottom-up DP', 'Approach 1 · Bottom-up DP'), code2Label: bi('Cách 2 · DFS + lru_cache', 'Approach 2 · DFS + lru_cache'),
  builder: build, builder2: (input, params) => build(input, params, 2),
  liveArgs: (input, params) => { const { s, k } = parse(input, params); return [s, k]; },
  approach: [
    bi('Một cặp đối xứng khác nhau cần đúng 1 lần sửa.', 'Each unequal mirrored pair needs exactly one letter change.'),
    bi('cost[l][r] = cost[l+1][r−1] + (s[l] ≠ s[r]). Tính đoạn ngắn trước.', 'cost[l][r] = cost[l+1][r−1] + (s[l] ≠ s[r]). Compute shorter substrings first.'),
    bi('Thử chỗ cắt cuối: chi phí các đoạn trước + chi phí đoạn mới. Giữ tổng nhỏ nhất.', 'Try the last cut: earlier partition cost + new substring cost. Keep the smallest total.'),
    bi('DFS(start, parts) thử đoạn tiếp theo; lru_cache tái sử dụng kết quả cho cùng trạng thái.', 'DFS(start, parts) tries the next substring; lru_cache reuses the result for each state.'),
  ],
  complexity: { time: 'O(n² + k·n²)', space: 'O(n² + k·n)', note: bi('Debug từng dòng khi n ≤ 12; vẫn tính đầy đủ tới n = 100.', 'Line-by-line debug for n ≤ 12; full results up to n = 100.') },
  complexity2: { time: 'O(n² + k·n²)', space: 'O(n² + k·n)', note: bi('DFS + lru_cache; hiển thị call stack và cache hit.', 'DFS + lru_cache with a call stack and cache-hit highlights.') },
} };
