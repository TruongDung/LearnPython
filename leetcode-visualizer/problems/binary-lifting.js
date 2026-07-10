/**
 * LeetCode 3534: Path Existence Queries in a Graph II — Binary Lifting.
 * Line-by-line debug: each Next press = one code statement.
 */
function buildSteps3534(input, params) {
  const nums = String(input || "").split(",").map((s) => Number(s.trim()));
  const maxDiff = params && Number.isFinite(Number(params.maxDiff)) ? Number(params.maxDiff) : 2;
  const queriesRaw = String(params.queries || "").split(";").map((q) => q.trim()).filter(Boolean)
    .map((q) => q.split(",").map(Number));
  const n = nums.length;
  const steps = [];
  const LOG = Math.ceil(Math.log2(n + 1)) + 1;

  function push(title, codeLines, vars, note, highlight, mark) {
    steps.push({
      title,
      arr: sorted ? sorted.map((node) => nums[node]) : nums.slice(),
      sub: sorted ? sorted.map((node, i) => `n${node}`) : nums.map((_, i) => `n${i}`),
      highlight: highlight || [], mark: mark || [],
      codeLines: codeLines || [], vars: vars || [], note,
    });
  }

  // ─── Line: sorted_idx = sorted(range(n), key=lambda i: nums[i]) ───
  var sorted = Array.from({ length: n }, (_, i) => i);
  sorted.sort((a, b) => nums[a] - nums[b]);
  const pos = new Array(n);
  sorted.forEach((node, idx) => { pos[node] = idx; });

  push(
    { vi: "sorted_idx = sorted(range(n), key=nums)", en: "sorted_idx = sorted(range(n), key=nums)" },
    [4],
    [
      { name: "sorted_idx", value: sorted.map((node) => `n${node}(${nums[node]})`).join(", ") },
      { name: "n", value: n },
      { name: "maxDiff", value: maxDiff },
    ],
    { vi: `Sắp xếp node theo giá trị: [${sorted.map((node) => `n${node}=${nums[node]}`).join(", ")}].`, en: `Sort nodes by value: [${sorted.map((node) => `n${node}=${nums[node]}`).join(", ")}].` }
  );

  // ─── Line: for i, node in enumerate(sorted_idx): pos[node] = i ───
  push(
    { vi: "pos[node] = i cho mỗi node", en: "pos[node] = i for each node" },
    [6],
    [{ name: "pos[]", value: `[${pos.join(",")}]` }],
    { vi: `pos[node] = vị trí của node trong sorted order. pos = [${pos.join(",")}].`, en: `pos[node] = position of node in sorted order. pos = [${pos.join(",")}].` }
  );

  // ─── Build up[0] — line by line for each i ───
  const up = Array.from({ length: LOG }, () => new Array(n).fill(0));
  let j = 0;

  for (let i = 0; i < n; i++) {
    if (j < i) j = i;
    while (j + 1 < n && nums[sorted[j + 1]] - nums[sorted[i]] <= maxDiff) j++;
    up[0][i] = j;

    push(
      { vi: `up[0][${i}] = ${j}`, en: `up[0][${i}] = ${j}` },
      [14],
      [
        { name: "i", value: i },
        { name: "nums[sorted[i]]", value: nums[sorted[i]] },
        { name: "j (furthest)", value: j },
        { name: "nums[sorted[j]]", value: nums[sorted[j]] },
        { name: "diff", value: nums[sorted[j]] - nums[sorted[i]] },
        { name: "up[0][i]", value: j },
      ],
      {
        vi: `Từ vị trí ${i} (val=${nums[sorted[i]]}), xa nhất có thể tới vị trí ${j} (val=${nums[sorted[j]]}). Chênh lệch = ${nums[sorted[j]] - nums[sorted[i]]} ≤ ${maxDiff}.`,
        en: `From pos ${i} (val=${nums[sorted[i]]}), furthest reachable is pos ${j} (val=${nums[sorted[j]]}). Diff = ${nums[sorted[j]] - nums[sorted[i]]} ≤ ${maxDiff}.`,
      },
      [i, j]
    );
  }

  // ─── Build sparse table: up[k][i] = up[k-1][up[k-1][i]] ───
  for (let k = 1; k < LOG; k++) {
    for (let i = 0; i < n; i++) {
      up[k][i] = up[k - 1][up[k - 1][i]];
    }
    push(
      { vi: `up[${k}][i] = up[${k-1}][up[${k-1}][i]]  (2^${k}=${1<<k} bước)`, en: `up[${k}][i] = up[${k-1}][up[${k-1}][i]]  (2^${k}=${1<<k} steps)` },
      [17],
      [
        { name: "k", value: k },
        { name: `up[${k}]`, value: `[${up[k].join(",")}]` },
      ],
      { vi: `Nhân đôi bước nhảy: up[${k}] mỗi ô nhảy 2^${k}=${1<<k} bước.`, en: `Double the jump: up[${k}] each cell jumps 2^${k}=${1<<k} steps.` }
    );
  }

  // ─── Process each query — line by line ───
  const answers = [];
  for (const [u, v] of queriesRaw) {
    if (u >= n || v >= n || u < 0 || v < 0) { answers.push(-1); continue; }
    if (u === v) { answers.push(0); continue; }

    let pu = pos[u];
    let pv = pos[v];
    if (pu > pv) { const tmp = pu; pu = pv; pv = tmp; }

    // Line 19: for u, v in queries
    push(
      { vi: `Query(${u},${v})`, en: `Query(${u},${v})` },
      [19],
      [{ name: "u", value: u }, { name: "v", value: v }],
      { vi: `Bắt đầu query: u=${u}, v=${v}.`, en: `Start query: u=${u}, v=${v}.` },
      []
    );

    // Line 20: pu, pv = pos[u], pos[v]
    push(
      { vi: `pu, pv = pos[${u}], pos[${v}] = ${pu}, ${pv}`, en: `pu, pv = pos[${u}], pos[${v}] = ${pu}, ${pv}` },
      [20],
      [{ name: "pu = pos[u]", value: pu }, { name: "pv = pos[v]", value: pv }],
      { vi: `Vị trí sorted: pu=${pu}, pv=${pv}.`, en: `Sorted positions: pu=${pu}, pv=${pv}.` },
      [pu, pv]
    );

    // Line 21: if pu > pv: swap
    push(
      { vi: `if pu > pv: swap → pu=${pu}, pv=${pv}`, en: `if pu > pv: swap → pu=${pu}, pv=${pv}` },
      [21],
      [{ name: "pu", value: pu }, { name: "pv", value: pv }, { name: "swapped?", value: pos[u] > pos[v] ? "yes" : "no" }],
      { vi: `${pos[u] > pos[v] ? "Đã swap để pu < pv." : "Không cần swap (pu ≤ pv)."}`, en: `${pos[u] > pos[v] ? "Swapped so pu < pv." : "No swap needed (pu ≤ pv)."}` },
      [pu, pv]
    );

    // Line: check reachability
    if (up[LOG - 1][pu] < pv) {
      answers.push(-1);
      push(
        { vi: `up[${LOG-1}][${pu}] = ${up[LOG-1][pu]} < ${pv} → -1`, en: `up[${LOG-1}][${pu}] = ${up[LOG-1][pu]} < ${pv} → -1` },
        [22],
        [
          { name: `up[${LOG-1}][${pu}]`, value: up[LOG-1][pu] },
          { name: "pv", value: pv },
          { name: "reachable?", value: "NO → -1" },
        ],
        { vi: `Nhảy tối đa từ ${pu} chỉ tới ${up[LOG-1][pu]} < ${pv}. Không kết nối → -1.`, en: `Max jump from ${pu} only reaches ${up[LOG-1][pu]} < ${pv}. Unreachable → -1.` },
        [pu]
      );
      continue;
    }

    // Line: dist, cur = 0, pu
    let dist = 0;
    let cur = pu;
    push(
      { vi: `dist=0, cur=${pu}`, en: `dist=0, cur=${pu}` },
      [23],
      [{ name: "dist", value: 0 }, { name: "cur", value: pu }],
      { vi: `Bắt đầu binary lifting: dist=0, cur=pos ${pu}.`, en: `Start binary lifting: dist=0, cur=pos ${pu}.` },
      [pu, pv]
    );

    // Lines: for k in range(LOG-1, -1, -1): if up[k][cur] < pv: ...
    for (let k = LOG - 1; k >= 0; k--) {
      if (up[k][cur] < pv) {
        const oldCur = cur;
        cur = up[k][cur];
        dist += (1 << k);
        push(
          { vi: `k=${k}: up[${k}][${oldCur}]=${cur} < ${pv} → nhảy! dist+=${1<<k}`, en: `k=${k}: up[${k}][${oldCur}]=${cur} < ${pv} → jump! dist+=${1<<k}` },
          [26],
          [
            { name: "k", value: k },
            { name: `up[${k}][${oldCur}]`, value: cur },
            { name: "cur (new)", value: cur },
            { name: "dist", value: dist },
          ],
          { vi: `up[${k}][${oldCur}] = ${cur} < pv=${pv} → nhảy 2^${k}=${1<<k} bước. cur: ${oldCur}→${cur}, dist=${dist}.`, en: `up[${k}][${oldCur}] = ${cur} < pv=${pv} → jump 2^${k}=${1<<k} steps. cur: ${oldCur}→${cur}, dist=${dist}.` },
          [cur, pv]
        );
      } else {
        push(
          { vi: `k=${k}: up[${k}][${cur}]=${up[k][cur]} ≥ ${pv} → bỏ qua`, en: `k=${k}: up[${k}][${cur}]=${up[k][cur]} ≥ ${pv} → skip` },
          [25],
          [
            { name: "k", value: k },
            { name: `up[${k}][${cur}]`, value: up[k][cur] },
            { name: "pv", value: pv },
            { name: "action", value: "skip (would overshoot)" },
          ],
          { vi: `up[${k}][${cur}] = ${up[k][cur]} ≥ ${pv}. Không nhảy (vượt quá đích).`, en: `up[${k}][${cur}] = ${up[k][cur]} ≥ ${pv}. Don't jump (would overshoot).` },
          [cur, pv]
        );
      }
    }

    // Final step for this query
    if (cur < pv) dist += 1;
    answers.push(dist);
    push(
      { vi: `Query(${u},${v}) = ${dist}`, en: `Query(${u},${v}) = ${dist}` },
      [27],
      [
        { name: "final dist", value: dist },
        { name: "cur", value: cur },
        { name: "pv", value: pv },
        { name: "+1 final?", value: cur < pv ? "yes (cur < pv)" : "no (cur == pv)" },
      ],
      { vi: `Kết quả query(${u},${v}) = ${dist} bước.`, en: `Result query(${u},${v}) = ${dist} steps.` },
      [pu, pv]
    );
  }

  // Final result
  steps[steps.length - 1].final = true;
  const lastStep = steps[steps.length - 1];
  lastStep.vars.push({ name: "answers", value: `[${answers.join(", ")}]` });

  return { original: nums, answer: answers, steps };
}

module.exports = {
  3534: {
    id: 3534,
    difficulty: "hard",
    slug: "path-existence-queries-in-a-graph-ii",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Path Existence Queries in a Graph II", en: "Path Existence Queries in a Graph II" },
    titleVi: { vi: "Truy vấn đường đi (Binary Lifting)", en: "Path queries via Binary Lifting" },
    statement: {
      vi:
        "Cho n node với giá trị nums[i] và maxDiff. Cạnh tồn tại giữa i và j khi |nums[i]-nums[j]| ≤ maxDiff. " +
        "Với mỗi query [u, v], tìm đường đi ngắn nhất (số cạnh) hoặc -1.",
      en:
        "Given n nodes with values nums[i] and maxDiff. Edge exists between i and j iff |nums[i]-nums[j]| ≤ maxDiff. " +
        "For each query [u, v], find shortest path (edges) or -1.",
    },
    defaultInput: "1,3,5,7,2",
    inputKind: "string",
    inputLabel: { vi: "nums (phẩy ngăn)", en: "nums (comma separated)" },
    extraParams: [
      { key: "maxDiff", label: { vi: "maxDiff", en: "maxDiff" }, default: 2 },
      { key: "queries", type: "string", label: { vi: "queries (u,v;u,v;...)", en: "queries (u,v;u,v;...)" }, default: "0,3;1,4;0,4" },
    ],
    complexity: {
      time: "O(n log n + q log n)",
      space: "O(n log n)",
      note: { vi: "Sort + sparse table O(n log n). Mỗi query O(log n).", en: "Sort + sparse table O(n log n). Each query O(log n)." },
    },
    code: [
      "class Solution:",
      "    def pathExistenceQueries(self, n, nums, maxDiff, queries):",
      "        LOG = n.bit_length() + 1",
      "        sorted_idx = sorted(range(n), key=lambda i: nums[i])",
      "        pos = [0] * n",
      "        for i, node in enumerate(sorted_idx): pos[node] = i",
      "        # up[0][i] = rightmost reachable in 1 step",
      "        up = [[0]*n for _ in range(LOG)]",
      "        j = 0",
      "        for i in range(n):",
      "            j = max(j, i)",
      "            while j+1<n and nums[sorted_idx[j+1]]-nums[sorted_idx[i]]<=maxDiff:",
      "                j += 1",
      "            up[0][i] = j",
      "        for k in range(1, LOG):",
      "            for i in range(n):",
      "                up[k][i] = up[k-1][up[k-1][i]]",
      "        ans = []",
      "        for u, v in queries:",
      "            pu, pv = pos[u], pos[v]",
      "            if pu > pv: pu, pv = pv, pu",
      "            if up[LOG-1][pu] < pv: ans.append(-1); continue",
      "            dist, cur = 0, pu",
      "            for k in range(LOG-1, -1, -1):",
      "                if up[k][cur] < pv:",
      "                    cur = up[k][cur]; dist += 1<<k",
      "            ans.append(dist + (1 if cur < pv else 0))",
      "        return ans",
    ],
    builder: buildSteps3534,
  },
};
