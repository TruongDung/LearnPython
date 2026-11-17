"use strict";

const bi = (vi, en) => ({ vi, en });
const CODE = [
  "class Solution:",
  "    def minimumChanges(self, s, k):",
  "        n = len(s)",
  "        cost = [[n] * (n + 1) for _ in range(n)]",
  "        for length in range(2, n + 1):",
  "            for left in range(n - length + 1):",
  "                right = left + length",
  "                for d in range(1, length):",
  "                    if length % d: continue",
  "                    changes = 0",
  "                    for offset in range(d):",
  "                        a, b = left + offset, right - d + offset",
  "                        while a < b:",
  "                            changes += s[a] != s[b]",
  "                            a, b = a + d, b - d",
  "                    cost[left][right] = min(cost[left][right], changes)",
  "        dp = [[n] * (n + 1) for _ in range(k + 1)]",
  "        dp[0][0] = 0",
  "        for parts in range(1, k + 1):",
  "            for end in range(2 * parts, n + 1):",
  "                for cut in range(2 * (parts - 1), end - 1):",
  "                    dp[parts][end] = min(dp[parts][end], dp[parts - 1][cut] + cost[cut][end])",
  "        return dp[k][n]",
];
const DFS_CODE = [...CODE.slice(0, 16),
  "        from functools import lru_cache",
  "        @lru_cache(None)",
  "        def dfs(start, parts):",
  "            if parts == 0:",
  "                return 0 if start == n else n",
  "            if n - start < 2 * parts:",
  "                return n",
  "            best = n",
  "            for end in range(start + 2, n + 1):",
  "                candidate = cost[start][end] + dfs(end, parts - 1)",
  "                best = min(best, candidate)",
  "            return best",
  "        return dfs(0, k)",
];

function parseInput(input, params = {}) {
  let s = input;
  let embeddedK;
  if (input && typeof input === "object") ({ s, k: embeddedK } = input);
  if (typeof s === "string" && s.trim().startsWith('{')) {
    try { ({ s, k: embeddedK } = JSON.parse(s)); }
    catch { throw new Error('2911: JSON không hợp lệ / Invalid JSON.'); }
  }
  const k = Number(params.k ?? embeddedK ?? 2);
  if (typeof s !== "string" || !/^[a-z]{2,200}$/.test(s)
    || !Number.isInteger(k) || k < 1 || k > Math.floor(s.length / 2)) {
    throw new Error('2911: s cần 2–200 chữ a–z; 1 ≤ k ≤ floor(n/2). / Use 2–200 lowercase letters and 1 ≤ k ≤ floor(n/2).');
  }
  return { s, k };
}

// End is exclusive. Each mismatched mirrored pair costs exactly one change.
function inspect(s, start, end, d) {
  const groups = [];
  const repaired = s.slice(start, end).split('');
  let cost = 0;
  for (let offset = 0; offset < d; offset++) {
    const indices = [];
    const pairs = [];
    for (let i = start + offset; i < end; i += d) indices.push(i);
    for (let a = 0, b = indices.length - 1; a < b; a++, b--) {
      const left = indices[a], right = indices[b];
      const mismatch = s[left] !== s[right];
      pairs.push({ left, right, mismatch });
      if (mismatch) { cost++; repaired[right - start] = s[left]; }
    }
    groups.push({ indices, pairs });
  }
  return { start, end, d, cost, groups, original: s.slice(start, end), repaired: repaired.join('') };
}

function buildSteps(input, params = {}, approach = 1) {
  const { s, k } = parseInput(input, params);
  const n = s.length;
  let cost = null;
  const bestD = Array.from({ length: n }, () => Array(n + 1).fill(1));
  let dp = null;
  const parent = Array.from({ length: k + 1 }, () => Array(n + 1).fill(-1));
  const steps = [];
  const detailed = n <= 12;
  const code = approach === 2 ? DFS_CODE : CODE;
  const locals = { s, k };
  const memo = new Map(), decisions = new Map(), stack = [];
  let hits = 0, focus = null, activePair = null, checked = [];
  let omitted = !detailed;
  function record(phase, line, event, extra = {}) {
    if (!detailed && phase !== 'setup' && phase !== 'done') return;
    // Bounded full traces for short teaching inputs; the solver always finishes.
    if (steps.length >= 20000 && phase !== 'done') { omitted = true; return; }
    const table = detailed && dp ? dp.map(row => row.map(value => value === n ? null : value)) : null;
    const activeLocals = phase === 'dfs' && stack.length ? { s, k, n, ...stack.at(-1) } : locals;
    steps.push({
      title: bi(`Dòng ${line} · ${event.vi}`, `Line ${line} · ${event.en}`),
      codeLines: [line], codeBlock: approach, arr: [], highlight: [], mark: [],
      final: phase === 'done', note: bi('', ''),
      vars: Object.entries(activeLocals).map(([name, value]) => ({ name, value })),
      semi2911View: JSON.parse(JSON.stringify({
        s, k, n, approach, phase, line, source: code[line - 1], event, focus, activePair,
        table, costTable: detailed && cost ? cost.map(row => row.map(value => value === n ? null : value)) : null,
        stack, memo: detailed ? [...memo].map(([key, value]) => ({ key, value })) : [],
        cacheSize: memo.size, hits, detailed, omitted, ...extra,
      })),
    });
  }
  function partial(complete = false) {
    if (!detailed) { focus = null; return; }
    const { left, right, d } = locals;
    if (!Number.isInteger(right) || !Number.isInteger(d)) { focus = null; return; }
    const valid = d < right - left && (right - left) % d === 0;
    const original = s.slice(left, right), repaired = original.split('');
    const groups = valid ? Array.from({ length: d }, (_, offset) => ({
      indices: Array.from({ length: (right - left) / d }, (_, j) => left + offset + j * d),
      pairs: checked.filter(pair => (pair.left - left) % d === offset),
    })) : [];
    checked.filter(pair => pair.mismatch).forEach(pair => { repaired[pair.right - left] = s[pair.left]; });
    focus = { start: left, end: right, d, valid, complete, groups, original, repaired: repaired.join(''), cost: checked.filter(pair => pair.mismatch).length };
  }
  record('setup', 1, bi('Khai báo Solution', 'Define Solution'));
  record('setup', 2, bi('Gọi minimumChanges', 'Call minimumChanges'));
  locals.n = n;
  record('setup', 3, bi(`n = ${n}`, `n = ${n}`));
  cost = Array.from({ length: n }, () => Array(n + 1).fill(n));
  record('setup', 4, bi('Khởi tạo cost', 'Allocate cost'));
  for (let length = 2; length <= n; length++) {
    locals.length = length; focus = null; activePair = null;
    record('cost', 5, bi(`Độ dài ${length}`, `Length ${length}`));
    for (let left = 0; left + length <= n; left++) {
      locals.left = left; focus = null;
      record('cost', 6, bi(`left = ${left}`, `left = ${left}`));
      const right = left + length;
      locals.right = right;
      record('cost', 7, bi(`right = ${right}`, `right = ${right}`));
      for (let d = 1; d < length; d++) {
        locals.d = d; checked = []; activePair = null; partial();
        record('cost', 8, bi(`Thử d = ${d}`, `Try d = ${d}`));
        const invalid = length % d !== 0;
        record('cost', 9, invalid ? bi('Không chia hết → continue', 'Not a divisor → continue') : bi('Chia hết → xét các nhóm', 'Divides evenly → inspect groups'), { condition: invalid });
        if (invalid) continue;
        let changes = 0;
        locals.changes = changes;
        record('cost', 10, bi('changes = 0', 'changes = 0'));
        for (let offset = 0; offset < d; offset++) {
          locals.offset = offset; activePair = null;
          record('cost', 11, bi(`Nhóm ${offset + 1}`, `Group ${offset + 1}`));
          let a = left + offset, b = right - d + offset;
          locals.a = a; locals.b = b;
          activePair = a < b ? { left: a, right: b } : null;
          record('cost', 12, bi(`a = ${a}, b = ${b}`, `a = ${a}, b = ${b}`));
          while (true) {
            record('cost', 13, bi(`${a} < ${b} → ${a < b ? 'True' : 'False'}`, `${a} < ${b} → ${a < b ? 'True' : 'False'}`), { condition: a < b });
            if (a >= b) break;
            const mismatch = s[a] !== s[b], before = changes;
            changes += mismatch; locals.changes = changes;
            if (detailed) checked.push({ left: a, right: b, mismatch });
            partial();
            record('cost', 14, bi(`“${s[a]}” ${mismatch ? '≠' : '='} “${s[b]}” · changes ${before} → ${changes}`, `“${s[a]}” ${mismatch ? '≠' : '='} “${s[b]}” · changes ${before} → ${changes}`), { comparison: { a, b, mismatch, before, after: changes } });
            a += d; b -= d; locals.a = a; locals.b = b;
            activePair = a < b ? { left: a, right: b } : null;
            record('cost', 15, bi('Dịch hai con trỏ vào trong', 'Move both pointers inward'));
          }
        }
        record('cost', 11, bi('Đã xét hết các nhóm', 'All groups processed'), { condition: false });
        activePair = null; partial(true);
        if (changes < cost[left][right]) { cost[left][right] = changes; bestD[left][right] = d; }
        record('cost', 16, bi(`cost[${left}][${right}] = ${cost[left][right]}`, `cost[${left}][${right}] = ${cost[left][right]}`), { bestCost: cost[left][right], bestD: bestD[left][right] });
      }
      record('cost', 8, bi('Đã thử hết d', 'All strides tried'), { condition: false });
    }
    record('cost', 6, bi('Hết đoạn ở độ dài này', 'All substrings of this length processed'), { condition: false });
  }
  record('cost', 5, bi('Đã xét hết độ dài', 'All lengths processed'), { condition: false });
  focus = null; activePair = null;
  function segments(parts, end) {
    const result = [];
    while (parts > 0) {
      const cut = parent[parts][end];
      if (cut < 0) return [];
      result.unshift(inspect(s, cut, end, bestD[cut][end]));
      end = cut; parts--;
    }
    return result;
  }
  if (approach === 1) {
  dp = Array.from({ length: k + 1 }, () => Array(n + 1).fill(n));
  record('dp', 17, bi('Khởi tạo dp', 'Allocate dp'));
  dp[0][0] = 0;
  record('dp', 18, bi('dp[0][0] = 0', 'dp[0][0] = 0'));
  for (let parts = 1; parts <= k; parts++) {
    locals.parts = parts;
    record('dp', 19, bi(`parts = ${parts}`, `parts = ${parts}`));
    for (let end = 2 * parts; end <= n; end++) {
      locals.end = end;
      record('dp', 20, bi(`end = ${end}`, `end = ${end}`), { parts, end });
      const candidates = [];
      for (let cut = 2 * (parts - 1); cut < end - 1; cut++) {
        locals.cut = cut;
        focus = detailed ? inspect(s, cut, end, bestD[cut][end]) : null;
        record('dp', 21, bi(`cut = ${cut}`, `cut = ${cut}`), { parts, end, cut });
        const previous = dp[parts - 1][cut], gain = cost[cut][end];
        const total = previous + gain;
        const updated = total < dp[parts][end];
        const before = dp[parts][end];
        if (updated) { dp[parts][end] = total; parent[parts][end] = cut; }
        candidates.push({ cut, previous, gain, total });
        if (detailed) record('partition', 22,
          bi(`dp[${parts}][${end}] = min(${before}, ${previous} + ${gain}) = ${dp[parts][end]}`, `dp[${parts}][${end}] = min(${before}, ${previous} + ${gain}) = ${dp[parts][end]}`), {
            parts, end, cut, previous, gain, total, updated, before, reachable: previous !== n,
            best: dp[parts][end], bestCut: parent[parts][end],
            prefix: segments(parts - 1, cut), candidates: candidates.map(item => ({ ...item })),
          });
      }
      record('dp', 21, bi('Đã thử hết chỗ cắt', 'All cuts tried'), { parts, end, condition: false });
    }
    record('dp', 20, bi('Đã xét hết end', 'All ends processed'), { parts, condition: false });
  }
  record('dp', 19, bi('Đã xét hết số đoạn', 'All part counts processed'), { condition: false });
  const selected = segments(k, n);
  const answer = dp[k][n];
  focus = selected[0];
  record('done', 23, bi(`Trả về ${answer}`, `Return ${answer}`), { answer, selected });
  return { original: s, answer, selected, steps };
  }

  record('dfs', 17, bi('Import lru_cache', 'Import lru_cache'));
  record('dfs', 18, bi('Tạo cache cho dfs', 'Create dfs cache'));
  record('dfs', 19, bi('Khai báo dfs(start, parts)', 'Define dfs(start, parts)'));
  const keyOf = (start, parts) => `${start},${parts}`;
  function dfs(start, parts) {
    const key = keyOf(start, parts);
    if (memo.has(key)) return memo.get(key);
    const frame = { start, parts };
    stack.push(frame);
    focus = null;
    record('dfs', 20, bi(`dfs(${start}, ${parts}) · parts == 0 → ${parts === 0}`, `dfs(${start}, ${parts}) · parts == 0 → ${parts === 0}`), { operation: 'enter-call', condition: parts === 0, cacheKey: key });
    const finish = (value, line) => {
      memo.set(key, value);
      record('dfs', line, bi(`Trả ${value} · lưu cache (${start}, ${parts})`, `Return ${value} · cache (${start}, ${parts})`), { operation: 'return-call', cacheKey: key, returnValue: value });
      stack.pop();
      return value;
    };
    if (parts === 0) return finish(start === n ? 0 : n, 21);
    const impossible = n - start < 2 * parts;
    record('dfs', 22, bi(`Còn ${n - start} ký tự, cần ≥ ${2 * parts}`, `${n - start} letters left, need ≥ ${2 * parts}`), { condition: impossible });
    if (impossible) return finish(n, 23);
    frame.best = n;
    record('dfs', 24, bi(`best = n = ${n}`, `best = n = ${n}`));
    for (let end = start + 2; end <= n; end++) {
      frame.end = end;
      focus = detailed ? inspect(s, start, end, bestD[start][end]) : null;
      record('dfs', 25, bi(`Thử đoạn [${start}, ${end})`, `Try substring [${start}, ${end})`));
      const childKey = keyOf(end, parts - 1), cached = memo.has(childKey);
      record('dfs', 26, bi(`Gọi dfs(${end}, ${parts - 1})`, `Call dfs(${end}, ${parts - 1})`), { operation: 'call-child', cacheKey: childKey });
      const child = dfs(end, parts - 1);
      if (cached) hits++;
      frame.candidate = cost[start][end] + child;
      focus = detailed ? inspect(s, start, end, bestD[start][end]) : null;
      record('dfs', 26, cached ? bi(`Cache hit (${end}, ${parts - 1}) → ${child}`, `Cache hit (${end}, ${parts - 1}) → ${child}`) : bi(`candidate = ${cost[start][end]} + ${child}`, `candidate = ${cost[start][end]} + ${child}`), {
        operation: cached ? 'cache-hit' : 'resolve-call', cacheKey: childKey, childValue: child, gain: cost[start][end], candidate: frame.candidate,
      });
      const before = frame.best;
      if (frame.candidate < frame.best) { frame.best = frame.candidate; decisions.set(key, end); }
      record('dfs', 27, bi(`best = min(${before}, ${frame.candidate}) = ${frame.best}`, `best = min(${before}, ${frame.candidate}) = ${frame.best}`), { operation: 'keep-best', before, candidate: frame.candidate, best: frame.best });
    }
    record('dfs', 25, bi('Đã thử hết đoạn tiếp theo', 'All next substrings tried'), { condition: false });
    return finish(frame.best, 28);
  }
  record('dfs', 29, bi(`Gọi dfs(0, ${k})`, `Call dfs(0, ${k})`), { operation: 'call-root' });
  const answer = dfs(0, k);
  const selected = [];
  for (let start = 0, parts = k; parts > 0; parts--) {
    const end = decisions.get(keyOf(start, parts));
    selected.push(inspect(s, start, end, bestD[start][end]));
    start = end;
  }
  focus = selected[0];
  record('done', 29, bi(`Trả về ${answer}`, `Return ${answer}`), { answer, selected });
  return { original: s, answer, selected, steps };
}

module.exports = { 2911: {
  id: 2911, slug: 'minimum-changes-to-make-k-semi-palindromes', difficulty: 'hard',
  category: { key: 'dp', vi: 'Quy hoạch động', en: 'Dynamic Programming' },
  tags: [{ key: 'string', vi: 'Chuỗi', en: 'String' }, { key: 'dp', vi: 'Quy hoạch động', en: 'Dynamic Programming' }],
  title: bi('Minimum Changes to Make K Semi-palindromes', 'Minimum Changes to Make K Semi-palindromes'),
  titleVi: bi('Ít thay đổi nhất để tạo K đoạn semi-palindrome', 'Minimum changes for K semi-palindromes'),
  statement: bi(
    'Chia s thành đúng k đoạn liên tiếp. Mỗi đoạn dài ít nhất 2. Chọn ước d nhỏ hơn độ dài đoạn; các ký tự cách nhau d vị trí phải tạo thành từng chuỗi đối xứng. Tìm tổng số ký tự cần đổi ít nhất.',
    'Split s into exactly k contiguous substrings, each at least two letters long. For each substring choose a proper divisor d of its length; each group of letters spaced d positions apart must be a palindrome. Minimize the total letter changes.'),
  defaultInput: 'abcac', inputKind: 'string', inputLabel: bi('Chuỗi s (a–z)', 'String s (a–z)'),
  extraParams: [
    { key: 'k', label: bi('Số đoạn k', 'Number of parts k'), default: 2, min: 1, max: 100 },
    { key: 'approach', label: bi('Cách giải', 'Approach'), type: 'select', default: '1', options: [
      { value: '1', label: bi('Cách 1: DP từ dưới lên', 'Approach 1: Bottom-up DP') },
      { value: '2', label: bi('Cách 2: DFS + cache', 'Approach 2: DFS + cache') },
    ] },
  ],
  debugMode: 'line-by-line',
  code: CODE, code2: DFS_CODE, builder: buildSteps,
  builder2: (input, params) => buildSteps(input, params, 2),
  codeLabel: bi('Cách 1 · Bottom-up DP', 'Approach 1 · Bottom-up DP'),
  code2Label: bi('Cách 2 · DFS + lru_cache', 'Approach 2 · DFS + lru_cache'),
  liveArgs: (input, params) => { const { s, k } = parseInput(input, params); return [s, k]; },
  approach: [
    bi('Chọn d là ước thực sự của độ dài. Xếp các ký tự cùng phần dư thành một hàng.', 'Choose a proper divisor d of the length. Put letters with the same offset modulo d in a row.'),
    bi('Mỗi cặp đối xứng khác nhau cần 1 lần sửa. Lấy chi phí nhỏ nhất trong các d cho từng đoạn.', 'Each unequal mirrored pair needs one change. Minimize over d for every substring.'),
    bi('DP thử chỗ cắt cuối: chi phí các đoạn trước + chi phí đoạn mới. Mỗi đoạn dài ít nhất 2.', 'DP tries the last cut: earlier partition cost + new substring cost. Every part has length at least two.'),
    bi('DFS(start, parts) thử đoạn tiếp theo rồi gọi phần còn lại; lru_cache chỉ tính mỗi trạng thái một lần.', 'DFS(start, parts) tries the next substring then solves the suffix; lru_cache computes each state once.'),
  ],
  complexity: { time: 'O(n³ log n + k·n²)', space: 'O(n² + k·n)', note: bi('Debug từng dòng với n ≤ 12; chuỗi dài hơn vẫn tính đủ kết quả tới n = 200.', 'Line-by-line debug for n ≤ 12; larger strings still compute the full answer up to n = 200.') },
  complexity2: { time: 'O(n³ log n + k·n²)', space: 'O(n² + k·n)', note: bi('DFS + lru_cache; n ≤ 12 hiện đầy đủ lời gọi, cache và so sánh ký tự.', 'DFS + lru_cache; n ≤ 12 shows every call, cache hit and letter comparison.') },
  __inspect: inspect,
} };
