// Focused array problem definitions extracted from array.js.
module.exports = {};


function parseDistantSubarrays4051Input(input, params = {}) {
  if (!Array.isArray(input) || input.length < 1) {
    throw new Error("nums must contain at least one integer.");
  }
  if (input.length > 16) {
    throw new Error("Use at most 16 values so the line-by-line Fenwick visualization stays readable.");
  }
  if (!input.every((value) => Number.isInteger(value) && Math.abs(value) <= 1_000_000_000)) {
    throw new Error("nums must contain integers from -1,000,000,000 to 1,000,000,000.");
  }
  const goal = Number(params.goal);
  const k = Number(params.k);
  if (!Number.isInteger(goal) || Math.abs(goal) > 1_000_000_000) {
    throw new Error("goal must be an integer from -1,000,000,000 to 1,000,000,000.");
  }
  if (!Number.isInteger(k) || k < 0 || k > 1_000_000_000) {
    throw new Error("k must be an integer from 0 to 1,000,000,000.");
  }
  return { nums: [...input], goal, k };
}

function buildSteps4051(input, params = {}) {
  const { nums, goal, k } = parseDistantSubarrays4051Input(input, params);
  const prefix = [];
  const values = [];
  const counts = [];
  const tree = [];
  const steps = [];
  const accepted = [];
  let answer = 0;
  let seen = 0;

  function snapshot({
    operation,
    phaseIndex,
    codeLine,
    title,
    note,
    prefixIndex = -1,
    current = null,
    low = null,
    high = null,
    leftCount = null,
    rightCount = null,
    coordinate = -1,
    currentMatches = [],
    answerBefore = answer,
    totalSubarrays = null,
    final = false,
  }) {
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      vars: [
        { name: "current", value: current ?? "—" },
        { name: "low", value: low ?? "—" },
        { name: "high", value: high ?? "—" },
        { name: "left_count", value: leftCount ?? "—" },
        { name: "right_count", value: rightCount ?? "—" },
        { name: "answer", value: answer },
      ],
      distantSubarrays4051View: {
        operation,
        phaseIndex,
        nums: [...nums],
        goal,
        k,
        prefix: [...prefix],
        values: [...values],
        counts: [...counts],
        tree: [...tree],
        prefixIndex,
        current,
        low,
        high,
        leftCount,
        rightCount,
        coordinate,
        seen,
        currentMatches: currentMatches.map((item) => ({ ...item })),
        accepted: accepted.map((item) => ({ ...item })),
        answerBefore,
        answer,
        totalSubarrays,
        final,
      },
    });
  }

  snapshot({
    operation: "k-check",
    phaseIndex: 0,
    codeLine: 21,
    title: { vi: `Kiểm tra k = ${k}`, en: `Check k = ${k}` },
    note: k === 0
      ? { vi: "Khoảng cách tuyệt đối luôn ≥ 0, nên mọi subarray đều distant.", en: "Every absolute difference is at least 0, so every subarray is distant." }
      : { vi: "Vì k > 0, hai miền prefix hợp lệ rời nhau và có thể đếm bằng Fenwick tree.", en: "Because k > 0, the two valid prefix ranges are disjoint and can be counted with a Fenwick tree." },
  });

  if (k === 0) {
    const n = nums.length;
    snapshot({
      operation: "set-n",
      phaseIndex: 4,
      codeLine: 22,
      title: { vi: `Đặt n = ${n}`, en: `Set n = ${n}` },
      note: { vi: "Một mảng dài n có n(n+1)/2 subarray không rỗng.", en: "An array of length n has n(n+1)/2 non-empty subarrays." },
    });
    answer = n * (n + 1) / 2;
    snapshot({
      operation: "return-all",
      phaseIndex: 4,
      codeLine: 23,
      title: { vi: `Trả về ${n} × ${n + 1} / 2 = ${answer}`, en: `Return ${n} × ${n + 1} / 2 = ${answer}` },
      note: { vi: "Không cần tạo prefix sum hay Fenwick tree cho nhánh đặc biệt này.", en: "This special branch needs neither prefix sums nor a Fenwick tree." },
      totalSubarrays: answer,
      final: true,
    });
    return { original: [...nums], goal, k, answer, steps };
  }

  prefix.push(0);
  snapshot({
    operation: "init-prefix",
    phaseIndex: 0,
    codeLine: 25,
    title: { vi: "Khởi tạo prefix[0] = 0", en: "Initialize prefix[0] = 0" },
    note: { vi: "Prefix rỗng cho phép đếm subarray bắt đầu tại index 0.", en: "The empty prefix lets us count subarrays starting at index 0." },
  });
  for (let index = 0; index < nums.length; index += 1) {
    snapshot({
      operation: "prefix-loop",
      phaseIndex: 0,
      codeLine: 26,
      prefixIndex: index + 1,
      current: prefix.at(-1),
      title: { vi: `Đọc nums[${index}] = ${nums[index]}`, en: `Read nums[${index}] = ${nums[index]}` },
      note: { vi: "Cộng value hiện tại vào prefix gần nhất.", en: "Add the current value to the latest prefix." },
    });
    const next = prefix.at(-1) + nums[index];
    prefix.push(next);
    snapshot({
      operation: "append-prefix",
      phaseIndex: 0,
      codeLine: 27,
      prefixIndex: index + 1,
      current: next,
      title: { vi: `prefix[${index + 1}] = ${next}`, en: `prefix[${index + 1}] = ${next}` },
      note: { vi: `${next - nums[index]} + (${nums[index]}) = ${next}.`, en: `${next - nums[index]} + (${nums[index]}) = ${next}.` },
    });
  }

  values.push(...[...new Set(prefix)].sort((a, b) => a - b));
  counts.push(...Array(values.length).fill(0));
  tree.push(...Array(values.length + 1).fill(0));
  snapshot({
    operation: "compress",
    phaseIndex: 1,
    codeLine: 29,
    title: { vi: "Nén tọa độ các prefix sum", en: "Coordinate-compress the prefix sums" },
    note: { vi: `Sắp xếp các giá trị phân biệt: [${values.join(", ")}].`, en: `Sort the distinct values: [${values.join(", ")}].` },
  });
  snapshot({
    operation: "init-bit",
    phaseIndex: 1,
    codeLine: 30,
    title: { vi: "Tạo Fenwick tree rỗng", en: "Create an empty Fenwick tree" },
    note: { vi: "Fenwick lưu tần suất của những prefix đã đi qua.", en: "The Fenwick tree stores frequencies of previously seen prefixes." },
  });
  snapshot({
    operation: "init-counters",
    phaseIndex: 1,
    codeLine: 31,
    title: { vi: "Khởi tạo answer và seen", en: "Initialize answer and seen" },
    note: { vi: "Chưa có prefix nào được insert nên cả hai đều bằng 0.", en: "No prefix has been inserted yet, so both counters are 0." },
  });

  const lowerBound = (target) => {
    let left = 0;
    let right = values.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (values[mid] < target) left = mid + 1;
      else right = mid;
    }
    return left;
  };
  const upperBound = (target) => {
    let left = 0;
    let right = values.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (values[mid] <= target) left = mid + 1;
      else right = mid;
    }
    return left;
  };
  const query = (size) => {
    let total = 0;
    for (let index = size; index > 0; index -= index & -index) total += tree[index];
    return total;
  };
  const add = (index) => {
    for (let cursor = index; cursor < tree.length; cursor += cursor & -cursor) tree[cursor] += 1;
  };
  const previousPrefixes = [];

  for (let prefixIndex = 0; prefixIndex < prefix.length; prefixIndex += 1) {
    const current = prefix[prefixIndex];
    snapshot({
      operation: "scan-prefix",
      phaseIndex: 2,
      codeLine: 32,
      prefixIndex,
      current,
      title: { vi: `Xét current = prefix[${prefixIndex}] = ${current}`, en: `Inspect current = prefix[${prefixIndex}] = ${current}` },
      note: { vi: `Chỉ ${seen} prefix đứng trước được phép tạo subarray kết thúc tại ${prefixIndex - 1}.`, en: `Only the ${seen} earlier prefixes may form subarrays ending at ${prefixIndex - 1}.` },
    });
    const low = current - goal - k;
    snapshot({
      operation: "low-threshold",
      phaseIndex: 2,
      codeLine: 33,
      prefixIndex,
      current,
      low,
      title: { vi: `Ngưỡng trái low = ${low}`, en: `Left threshold low = ${low}` },
      note: { vi: `Prefix trước p ≤ ${low} làm sum − goal ≥ ${k}.`, en: `An earlier prefix p <= ${low} makes sum - goal >= ${k}.` },
    });
    const high = current - goal + k;
    snapshot({
      operation: "high-threshold",
      phaseIndex: 2,
      codeLine: 34,
      prefixIndex,
      current,
      low,
      high,
      title: { vi: `Ngưỡng phải high = ${high}`, en: `Right threshold high = ${high}` },
      note: { vi: `Prefix trước p ≥ ${high} làm sum − goal ≤ −${k}.`, en: `An earlier prefix p >= ${high} makes sum - goal <= -${k}.` },
    });

    const currentMatches = previousPrefixes.filter((item) => item.value <= low || item.value >= high).map((item) => {
      const sum = current - item.value;
      return {
        start: item.index,
        end: prefixIndex - 1,
        sum,
        difference: Math.abs(sum - goal),
        side: item.value <= low ? "left" : "right",
      };
    });
    const leftCount = query(upperBound(low));
    snapshot({
      operation: "query-left",
      phaseIndex: 2,
      codeLine: 35,
      prefixIndex,
      current,
      low,
      high,
      leftCount,
      currentMatches,
      title: { vi: `Miền p ≤ ${low} có ${leftCount} prefix`, en: `The p <= ${low} range contains ${leftCount} prefixes` },
      note: { vi: "bisect_right bao gồm cả prefix nằm đúng trên ngưỡng low.", en: "bisect_right includes prefixes exactly equal to the low threshold." },
    });
    const rightCount = seen - query(lowerBound(high));
    snapshot({
      operation: "query-right",
      phaseIndex: 2,
      codeLine: 36,
      prefixIndex,
      current,
      low,
      high,
      leftCount,
      rightCount,
      currentMatches,
      title: { vi: `Miền p ≥ ${high} có ${rightCount} prefix`, en: `The p >= ${high} range contains ${rightCount} prefixes` },
      note: { vi: "Lấy seen trừ số prefix nhỏ hơn high để giữ cả giá trị bằng high.", en: "Subtract prefixes below high from seen to include values equal to high." },
    });

    const answerBefore = answer;
    answer += leftCount + rightCount;
    accepted.push(...currentMatches);
    snapshot({
      operation: "count",
      phaseIndex: 3,
      codeLine: 37,
      prefixIndex,
      current,
      low,
      high,
      leftCount,
      rightCount,
      currentMatches,
      answerBefore,
      title: { vi: `Cộng ${leftCount} + ${rightCount} vào answer`, en: `Add ${leftCount} + ${rightCount} to the answer` },
      note: { vi: `answer = ${answerBefore} + ${leftCount + rightCount} = ${answer}.`, en: `answer = ${answerBefore} + ${leftCount + rightCount} = ${answer}.` },
    });

    const coordinate = lowerBound(current);
    counts[coordinate] += 1;
    add(coordinate + 1);
    snapshot({
      operation: "insert",
      phaseIndex: 3,
      codeLine: 38,
      prefixIndex,
      current,
      low,
      high,
      leftCount,
      rightCount,
      coordinate,
      currentMatches,
      title: { vi: `Insert prefix ${current} vào rank ${coordinate + 1}`, en: `Insert prefix ${current} at rank ${coordinate + 1}` },
      note: { vi: "Query luôn diễn ra trước insert, nên subarray không bao giờ rỗng.", en: "Every query occurs before insertion, so an empty subarray is never counted." },
    });
    seen += 1;
    previousPrefixes.push({ index: prefixIndex, value: current });
    snapshot({
      operation: "increment-seen",
      phaseIndex: 3,
      codeLine: 39,
      prefixIndex,
      current,
      low,
      high,
      leftCount,
      rightCount,
      coordinate,
      currentMatches,
      title: { vi: `seen = ${seen}`, en: `seen = ${seen}` },
      note: { vi: "Prefix hiện tại trở thành prefix trước cho vòng lặp kế tiếp.", en: "The current prefix becomes an earlier prefix for the next iteration." },
    });
  }

  snapshot({
    operation: "return",
    phaseIndex: 4,
    codeLine: 40,
    title: { vi: `Trả về ${answer}`, en: `Return ${answer}` },
    note: { vi: "Mỗi subarray distant được đếm đúng khi prefix phải của nó được xử lý.", en: "Each distant subarray is counted exactly when its right prefix is processed." },
    final: true,
  });
  return { original: [...nums], goal, k, answer, steps };
}

Object.assign(module.exports, {
  4051: {
    id: 4051,
    difficulty: "hard",
    slug: "count-subarrays-with-distant-sums",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [
      { key: "prefix-sum", vi: "Tiền tố", en: "Prefix Sum" },
      { key: "binary-indexed-tree", vi: "Fenwick Tree", en: "Fenwick Tree" },
      { key: "coordinate-compression", vi: "Nén tọa độ", en: "Coordinate Compression" },
    ],
    title: { vi: "Count Subarrays with Distant Sums", en: "Count Subarrays with Distant Sums" },
    titleVi: { vi: "Đếm subarray có tổng cách xa goal", en: "Count subarrays with distant sums" },
    statement: {
      vi: "Cho nums, goal và k. Subarray nums[i..j] là distant nếu |sum(nums[i..j]) − goal| ≥ k. Trả về số subarray distant.",
      en: "Given nums, goal, and k, a subarray nums[i..j] is distant when |sum(nums[i..j]) - goal| >= k. Return the number of distant subarrays.",
    },
    defaultInput: [1, 2, 1],
    inputKind: "integer",
    inputLabel: { vi: "nums (tối đa 16 phần tử cho visualization)", en: "nums (up to 16 values for visualization)" },
    extraParams: [
      { key: "goal", type: "number", allowNegative: true, label: { vi: "goal", en: "goal" }, default: 4, min: -1_000_000_000, max: 1_000_000_000 },
      { key: "k", type: "number", label: { vi: "k", en: "k" }, default: 1, min: 0, max: 1_000_000_000 },
    ],
    approach: [
      { vi: "Với prefix hiện tại s và prefix trước p, sum của subarray là s−p.", en: "For current prefix s and earlier prefix p, the subarray sum is s-p." },
      { vi: "Điều kiện distant tách thành hai miền rời nhau: p ≤ s−goal−k hoặc p ≥ s−goal+k.", en: "The distant condition splits into two disjoint ranges: p <= s-goal-k or p >= s-goal+k." },
      { vi: "Nén tọa độ mọi prefix sum; Fenwick tree đếm số prefix đã thấy trong hai miền trước khi insert s.", en: "Coordinate-compress all prefix sums; a Fenwick tree counts seen prefixes in both ranges before inserting s." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: {
        vi: "Mỗi prefix thực hiện hai binary search, hai Fenwick query và một Fenwick update.",
        en: "Each prefix performs two binary searches, two Fenwick queries, and one Fenwick update.",
      },
    },
    debugMode: "semantic",
    code: [
      "from bisect import bisect_left, bisect_right",
      "",
      "class Fenwick:",
      "    def __init__(self, size: int):",
      "        self.tree = [0] * (size + 1)",
      "",
      "    def add(self, index: int, delta: int) -> None:",
      "        while index < len(self.tree):",
      "            self.tree[index] += delta",
      "            index += index & -index",
      "",
      "    def query(self, index: int) -> int:",
      "        total = 0",
      "        while index > 0:",
      "            total += self.tree[index]",
      "            index -= index & -index",
      "        return total",
      "",
      "class Solution:",
      "    def distantSubarrays(self, nums: list[int], goal: int, k: int) -> int:",
      "        if k == 0:",
      "            n = len(nums)",
      "            return n * (n + 1) // 2",
      "",
      "        prefix = [0]",
      "        for value in nums:",
      "            prefix.append(prefix[-1] + value)",
      "",
      "        values = sorted(set(prefix))",
      "        bit = Fenwick(len(values))",
      "        answer = seen = 0",
      "        for current in prefix:",
      "            low = current - goal - k",
      "            high = current - goal + k",
      "            left_count = bit.query(bisect_right(values, low))",
      "            right_count = seen - bit.query(bisect_left(values, high))",
      "            answer += left_count + right_count",
      "            bit.add(bisect_left(values, current) + 1, 1)",
      "            seen += 1",
      "        return answer",
    ],
    liveArgs: (input, params) => {
      const parsed = parseDistantSubarrays4051Input(input, params);
      return [parsed.nums, parsed.goal, parsed.k];
    },
    builder: buildSteps4051,
  },
});

// ─── 2569: Handling Sum Queries After Update ────────────────────────────────
//
// Three query kinds over a binary array nums1 and a value array nums2:
//   [1, l, r] flip nums1[l..r]
//   [2, p, 0] nums2[i] += nums1[i] * p  for every i
//   [3, 0, 0] report sum(nums2)
//
// Key insight: we never materialise the per-element additions. Because a type-2
// query adds p to nums2[i] exactly when nums1[i] == 1, its whole effect on the
// sum is  p * (number of ones in nums1).  So we only need
//   * a running scalar  total = sum(nums2), and
//   * a lazy segment tree over nums1 that reports the count of ones and
//     supports range flip.
// Flipping a node is  ones = size - ones,  and the lazy tag is a boolean that
// toggles (flip twice = identity).

function parseQueries2569(value, label) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} is required`);
  let rows;
  try {
    rows = text.startsWith("[")
      ? JSON.parse(text)
      : text.split(/[;\n]/).filter((r) => r.trim()).map((r) => r.split(",").map((x) => Number(x.trim())));
  } catch (_error) {
    throw new Error(`${label} must be JSON like [[1,1,1],[2,1,0],[3,0,0]] or rows "1,1,1;2,1,0;3,0,0"`);
  }
  if (!Array.isArray(rows) || !rows.length || rows.some((r) => !Array.isArray(r) || r.length !== 3 || r.some((v) => !Number.isInteger(v)))) {
    throw new Error(`${label} rows must each be exactly three integers`);
  }
  return rows.map((r) => [...r]);
}

function parseIntList2569(value, label) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} is required`);
  let arr;
  try {
    arr = text.startsWith("[") ? JSON.parse(text) : text.split(",").map((x) => Number(x.trim()));
  } catch (_error) {
    throw new Error(`${label} must be a comma-separated integer list`);
  }
  if (!Array.isArray(arr) || !arr.length || arr.some((v) => !Number.isInteger(v))) {
    throw new Error(`${label} must be a non-empty list of integers`);
  }
  return arr;
}

function parse2569Data(input, params = {}) {
  const nums1 = parseIntList2569(input, "nums1");
  if (nums1.length > 8) throw new Error("use at most 8 elements so the segment tree stays readable");
  if (nums1.some((v) => v !== 0 && v !== 1)) throw new Error("nums1 must contain only 0 and 1");
  const nums2 = parseIntList2569(params.nums2, "nums2");
  if (nums2.length !== nums1.length) throw new Error("nums1 and nums2 must have the same length");
  if (nums2.some((v) => v < 0)) throw new Error("nums2 values must be non-negative");
  const queries = parseQueries2569(params.queries, "queries");
  if (queries.length > 8) throw new Error("use at most 8 queries so the trace stays readable");
  const n = nums1.length;
  queries.forEach(([kind, a, b], i) => {
    if (![1, 2, 3].includes(kind)) throw new Error(`query ${i}: kind must be 1, 2 or 3`);
    if (kind === 1) {
      if (a < 0 || b < 0 || a >= n || b >= n) throw new Error(`query ${i}: l and r must be within 0..${n - 1}`);
      if (a > b) throw new Error(`query ${i}: need l <= r`);
    }
    if (kind === 2 && a < 0) throw new Error(`query ${i}: p must be non-negative`);
  });
  if (!queries.some(([kind]) => kind === 3)) throw new Error("include at least one type-3 query so there is an answer to show");
  return { n, nums1, nums2, queries };
}

function buildSteps2569(input, params = {}) {
  const { n, nums1, nums2, queries } = parse2569Data(input, params);
  const steps = [];

  const bits = [...nums1];             // live nums1, kept in sync for display only
  const ones = new Array(4 * n).fill(0);
  const lazy = new Array(4 * n).fill(false);
  const span = {};                     // node -> { lo, hi, depth }

  let total = nums2.reduce((a, b) => a + b, 0);
  const answers = [];
  let queryIndex = -1;
  let flipRange = null;
  let pValue = null;

  // Snapshot of every existing node, ordered by depth then lo, for the renderer.
  function treeSnapshot() {
    return Object.keys(span).map(Number).sort((a, b) => {
      const A = span[a];
      const B = span[b];
      return A.depth - B.depth || A.lo - B.lo;
    }).map((node) => ({
      node,
      lo: span[node].lo,
      hi: span[node].hi,
      depth: span[node].depth,
      size: span[node].hi - span[node].lo + 1,
      ones: ones[node],
      lazy: lazy[node],
    }));
  }

  function snap(o) {
    steps.push({
      title: o.title,
      note: o.note,
      arr: [],
      highlight: [],
      mark: [],
      final: o.final || false,
      codeLines: o.codeLines || [],
      vars: [
        { name: "total", value: total },
        { name: "ones[1]", value: ones[1] || 0 },
        ...(o.vars || []),
      ],
      sumQueriesView: {
        n,
        nums1: [...bits],
        nums2: [...nums2],
        total,
        queries: queries.map((q) => [...q]),
        queryIndex,
        phase: o.phase,
        decision: o.decision || "",
        tree: treeSnapshot(),
        activeNodes: o.activeNodes || [],
        pushedNodes: o.pushedNodes || [],
        coveredNodes: o.coveredNodes || [],
        flipRange: flipRange ? [...flipRange] : null,
        p: pValue,
        answers: [...answers],
        answer: o.final ? [...answers] : null,
      },
    });
  }

  snap({
    title: { vi: `nums1 = [${nums1.join(", ")}], nums2 = [${nums2.join(", ")}]`, en: `nums1 = [${nums1.join(", ")}], nums2 = [${nums2.join(", ")}]` },
    note: {
      vi: "Ý tưởng chính: type-2 cộng p vào nums2[i] đúng khi nums1[i] = 1, nên tác động lên TỔNG chỉ là p × (số bit 1). Vậy chỉ cần giữ total = sum(nums2) và một segment tree lazy đếm số bit 1 của nums1.",
      en: "Key idea: a type-2 query adds p to nums2[i] exactly when nums1[i] = 1, so its effect on the SUM is just p × (count of ones). We only need a running total = sum(nums2) plus a lazy segment tree counting ones in nums1.",
    },
    codeLines: [3, 4, 5], phase: "intro", decision: "intro",
    vars: [{ name: "n", value: n }],
  });

  // ── build ────────────────────────────────────────────────────────────────
  function build(node, lo, hi, depth) {
    span[node] = { lo, hi, depth };
    if (lo === hi) {
      ones[node] = bits[lo];
      snap({
        title: { vi: `Lá node ${node} ← nums1[${lo}] = ${bits[lo]}`, en: `Leaf node ${node} ← nums1[${lo}] = ${bits[lo]}` },
        note: { vi: `Lá phủ đúng index ${lo}, nên ones = ${bits[lo]}.`, en: `The leaf covers index ${lo} only, so ones = ${bits[lo]}.` },
        codeLines: [8, 9, 10], phase: "build", decision: "build-leaf",
        activeNodes: [node],
      });
      return;
    }
    const mid = Math.floor((lo + hi) / 2);
    build(2 * node, lo, mid, depth + 1);
    build(2 * node + 1, mid + 1, hi, depth + 1);
    ones[node] = ones[2 * node] + ones[2 * node + 1];
    snap({
      title: { vi: `node ${node} [${lo},${hi}] ← ${ones[2 * node]} + ${ones[2 * node + 1]} = ${ones[node]}`, en: `node ${node} [${lo},${hi}] ← ${ones[2 * node]} + ${ones[2 * node + 1]} = ${ones[node]}` },
      note: { vi: `Gộp hai con: số bit 1 trong [${lo},${hi}] là ${ones[node]}.`, en: `Merge both children: the count of ones in [${lo},${hi}] is ${ones[node]}.` },
      codeLines: [11, 12, 13, 14], phase: "build", decision: "build-merge",
      activeNodes: [node, 2 * node, 2 * node + 1],
    });
  }

  build(1, 0, n - 1, 0);

  snap({
    title: { vi: `total = sum(nums2) = ${total}`, en: `total = sum(nums2) = ${total}` },
    note: { vi: `Cây đã sẵn sàng: ones[1] = ${ones[1]} là số bit 1 trên toàn mảng. total giữ tổng nums2 hiện tại.`, en: `The tree is ready: ones[1] = ${ones[1]} is the number of ones over the whole array. total holds the current sum of nums2.` },
    codeLines: [38, 39, 40], phase: "ready", decision: "ready",
  });

  // ── lazy push ────────────────────────────────────────────────────────────
  function push(node, lo, hi) {
    if (!lazy[node]) return [];
    const mid = Math.floor((lo + hi) / 2);
    const kids = [[2 * node, lo, mid], [2 * node + 1, mid + 1, hi]];
    kids.forEach(([child, a, b]) => {
      ones[child] = (b - a + 1) - ones[child];
      lazy[child] = !lazy[child];
    });
    lazy[node] = false;
    snap({
      title: { vi: `push(${node}): đẩy lazy xuống hai con`, en: `push(${node}): push the lazy flag to both children` },
      note: {
        vi: `node ${node} đang mang lazy=true. Trước khi đi sâu, phải áp dụng flip cho hai con: ones = size − ones, và đảo lazy của chúng. Sau đó xóa lazy ở ${node}.`,
        en: `node ${node} carries lazy=true. Before descending we must apply the flip to both children: ones = size − ones, and toggle their lazy. Then clear the flag on ${node}.`,
      },
      codeLines: [16, 17, 19, 20, 21, 22, 23], phase: "push", decision: "push-down",
      activeNodes: [node], pushedNodes: kids.map(([c]) => c),
    });
    return kids.map(([c]) => c);
  }

  // ── range flip ───────────────────────────────────────────────────────────
  function flip(node, lo, hi, l, r) {
    if (r < lo || hi < l) {
      snap({
        title: { vi: `node ${node} [${lo},${hi}] không giao [${l},${r}] → return`, en: `node ${node} [${lo},${hi}] disjoint from [${l},${r}] → return` },
        note: { vi: "Ngoài phạm vi cần flip, bỏ qua nhánh này.", en: "Outside the flip range, skip this branch." },
        codeLines: [26, 27], phase: "flip", decision: "flip-disjoint",
        activeNodes: [node],
      });
      return;
    }
    if (l <= lo && hi <= r) {
      const before = ones[node];
      ones[node] = (hi - lo + 1) - ones[node];
      lazy[node] = !lazy[node];
      snap({
        title: { vi: `node ${node} [${lo},${hi}] phủ trọn → ones ${before} → ${ones[node]}`, en: `node ${node} [${lo},${hi}] fully covered → ones ${before} → ${ones[node]}` },
        note: {
          vi: `Cả đoạn nằm trong [${l},${r}]. Flip toàn bộ: ones = ${hi - lo + 1} − ${before} = ${ones[node]}. Đặt lazy=true và DỪNG — không đi sâu nữa, đó chính là cái hay của lazy.`,
          en: `The whole segment lies inside [${l},${r}]. Flip it wholesale: ones = ${hi - lo + 1} − ${before} = ${ones[node]}. Set lazy=true and STOP — not descending further is the whole point of lazy propagation.`,
        },
        codeLines: [28, 29, 30, 31], phase: "flip", decision: "flip-cover",
        activeNodes: [node], coveredNodes: [node],
      });
      return;
    }
    push(node, lo, hi);
    const mid = Math.floor((lo + hi) / 2);
    snap({
      title: { vi: `node ${node} [${lo},${hi}] giao một phần → chia tại ${mid}`, en: `node ${node} [${lo},${hi}] partially overlaps → split at ${mid}` },
      note: { vi: `Chỉ một phần của [${lo},${hi}] cần flip, nên đi vào cả hai con.`, en: `Only part of [${lo},${hi}] needs flipping, so recurse into both children.` },
      codeLines: [32, 33], phase: "flip", decision: "flip-split",
      activeNodes: [node],
    });
    flip(2 * node, lo, mid, l, r);
    flip(2 * node + 1, mid + 1, hi, l, r);
    ones[node] = ones[2 * node] + ones[2 * node + 1];
    snap({
      title: { vi: `node ${node} ← ${ones[2 * node]} + ${ones[2 * node + 1]} = ${ones[node]}`, en: `node ${node} ← ${ones[2 * node]} + ${ones[2 * node + 1]} = ${ones[node]}` },
      note: { vi: "Sau khi hai con đã cập nhật, gộp lại cho node cha.", en: "Once both children are updated, recombine into the parent." },
      codeLines: [34, 35, 36], phase: "flip", decision: "flip-recombine",
      activeNodes: [node, 2 * node, 2 * node + 1],
    });
  }

  // ── process the queries ──────────────────────────────────────────────────
  for (let qi = 0; qi < queries.length; qi++) {
    queryIndex = qi;
    const [kind, a, b] = queries[qi];
    flipRange = null;
    pValue = null;

    if (kind === 1) {
      flipRange = [a, b];
      snap({
        title: { vi: `Query ${qi}: [1, ${a}, ${b}] — flip nums1[${a}..${b}]`, en: `Query ${qi}: [1, ${a}, ${b}] — flip nums1[${a}..${b}]` },
        note: { vi: "Đảo bit trên một đoạn. Dùng lazy để không phải sửa từng phần tử.", en: "Flip the bits over a range. Lazy propagation avoids touching each element." },
        codeLines: [41, 42, 43], phase: "flip", decision: "query-flip",
      });
      flip(1, 0, n - 1, a, b);
      for (let i = a; i <= b; i++) bits[i] = 1 - bits[i];
      snap({
        title: { vi: `Flip xong: ones[1] = ${ones[1]}`, en: `Flip done: ones[1] = ${ones[1]}` },
        note: { vi: `nums1 giờ là [${bits.join(", ")}]. Root cho biết toàn mảng có ${ones[1]} bit 1.`, en: `nums1 is now [${bits.join(", ")}]. The root reports ${ones[1]} ones across the whole array.` },
        codeLines: [43], phase: "flip", decision: "flip-done",
        activeNodes: [1],
      });
    } else if (kind === 2) {
      pValue = a;
      const gained = a * ones[1];
      const before = total;
      total += gained;
      snap({
        title: { vi: `Query ${qi}: [2, ${a}, 0] — total += ${a} × ${ones[1]} = ${gained}`, en: `Query ${qi}: [2, ${a}, 0] — total += ${a} × ${ones[1]} = ${gained}` },
        note: {
          vi: `Không cần sửa nums2 từng phần tử: mỗi index có bit 1 sẽ nhận thêm ${a}, và có ${ones[1]} index như vậy. total: ${before} → ${total}.`,
          en: `No need to touch nums2 element by element: every index whose bit is 1 gains ${a}, and there are ${ones[1]} such indices. total: ${before} → ${total}.`,
        },
        codeLines: [44, 45], phase: "add", decision: "query-add",
        activeNodes: [1],
        vars: [{ name: "p", value: a }, { name: "gained", value: gained }],
      });
    } else {
      answers.push(total);
      snap({
        title: { vi: `Query ${qi}: [3, 0, 0] → ${total}`, en: `Query ${qi}: [3, 0, 0] → ${total}` },
        note: { vi: `Trả về total hiện tại = ${total}.`, en: `Report the current total = ${total}.` },
        codeLines: [46, 47], phase: "sum", decision: "query-sum",
        vars: [{ name: "answer so far", value: `[${answers.join(", ")}]` }],
      });
    }
  }

  queryIndex = -1;
  flipRange = null;
  pValue = null;
  snap({
    title: { vi: `Kết quả: [${answers.join(", ")}]`, en: `Result: [${answers.join(", ")}]` },
    note: {
      vi: "Mỗi type-1 là O(log n) nhờ lazy, type-2 và type-3 chỉ là O(1) vì total và ones[1] luôn có sẵn.",
      en: "Each type-1 costs O(log n) thanks to lazy propagation; type-2 and type-3 are O(1) because total and ones[1] are always on hand.",
    },
    codeLines: [48], phase: "done", decision: "done", final: true,
    vars: [{ name: "answer", value: `[${answers.join(", ")}]` }],
  });

  return { original: nums1, answer: answers, steps };
}

Object.assign(module.exports, {
  2569: {
    id: 2569,
    difficulty: "hard",
    slug: "handling-sum-queries-after-update",
    category: { key: "segment-tree", vi: "Segment Tree", en: "Segment Tree" },
    tags: [
      { key: "lazy-propagation", vi: "Lazy Propagation", en: "Lazy Propagation" },
      { key: "segment-tree", vi: "Segment Tree", en: "Segment Tree" },
    ],
    title: { vi: "Handling Sum Queries After Update", en: "Handling Sum Queries After Update" },
    titleVi: { vi: "Xử lý truy vấn tổng sau cập nhật (lazy flip)", en: "Handling sum queries after update (lazy flip)" },
    statement: {
      vi:
        "Cho nums1 (chỉ gồm 0/1) và nums2 cùng độ dài. Có 3 loại truy vấn: " +
        "[1,l,r] đảo mọi bit nums1[l..r]; [2,p,0] với mọi i gán nums2[i] += nums1[i] * p; [3,0,0] trả về tổng nums2. " +
        "Trả về mảng đáp án của các truy vấn loại 3.",
      en:
        "Given nums1 (containing only 0/1) and nums2 of equal length, handle three query kinds: " +
        "[1,l,r] flip every bit in nums1[l..r]; [2,p,0] set nums2[i] += nums1[i] * p for every i; [3,0,0] return the sum of nums2. " +
        "Return the answers to all type-3 queries.",
    },
    defaultInput: "1,0,1",
    inputKind: "string",
    inputLabel: { vi: "nums1 (chỉ 0/1, tối đa 8 phần tử)", en: "nums1 (0/1 only, up to 8 elements)" },
    extraParams: [
      { key: "nums2", type: "string", label: { vi: "nums2 (cùng độ dài)", en: "nums2 (same length)" }, default: "0,0,0" },
      { key: "queries", type: "string", label: { vi: "queries: kind,a,b; ... hoặc JSON", en: "queries: kind,a,b; ... or JSON" }, default: "1,1,1;2,1,0;3,0,0" },
    ],
    approach: [
      { vi: "Không bao giờ cập nhật nums2 từng phần tử. Type-2 cộng p vào nums2[i] đúng khi nums1[i]=1, nên tổng chỉ tăng p × (số bit 1).", en: "Never update nums2 element by element. A type-2 query adds p to nums2[i] exactly when nums1[i]=1, so the sum only grows by p × (count of ones)." },
      { vi: "Giữ một scalar total = sum(nums2), và một segment tree lazy trên nums1 lưu số bit 1 mỗi đoạn.", en: "Keep one scalar total = sum(nums2), plus a lazy segment tree over nums1 storing the count of ones per segment." },
      { vi: "Flip một đoạn phủ trọn: ones = size − ones, rồi đặt lazy=true và DỪNG (không đi sâu) — đó là điểm cốt lõi của lazy propagation.", en: "Flipping a fully covered segment: ones = size − ones, then set lazy=true and STOP (do not descend) — the core of lazy propagation." },
      { vi: "Lazy là boolean vì flip hai lần là phép đồng nhất. Trước khi đi sâu vào node có lazy, phải push xuống hai con.", en: "The lazy tag is a boolean because flipping twice is the identity. Before descending into a lazy node, push the flag down to both children." },
      { vi: "Type-2 và type-3 chỉ là O(1): đọc ones[1] ở root và cộng vào total.", en: "Type-2 and type-3 are O(1): read ones[1] at the root and add into total." },
    ],
    complexity: {
      time: "O(n + q log n)",
      space: "O(n)",
      note: {
        vi: "Build O(n); mỗi type-1 flip O(log n) nhờ lazy; type-2 và type-3 O(1).",
        en: "Build is O(n); each type-1 flip is O(log n) thanks to lazy propagation; type-2 and type-3 are O(1).",
      },
    },
    code: [
      "class Solution:",
      "    def handleQuery(self, nums1, nums2, queries):",
      "        n = len(nums1)",
      "        ones = [0] * (4 * n)",
      "        lazy = [False] * (4 * n)",
      "",
      "        def build(node, lo, hi):",
      "            if lo == hi:",
      "                ones[node] = nums1[lo]",
      "                return",
      "            mid = (lo + hi) // 2",
      "            build(2 * node, lo, mid)",
      "            build(2 * node + 1, mid + 1, hi)",
      "            ones[node] = ones[2 * node] + ones[2 * node + 1]",
      "",
      "        def push(node, lo, hi):",
      "            if not lazy[node]:",
      "                return",
      "            mid = (lo + hi) // 2",
      "            for child, a, b in ((2 * node, lo, mid), (2 * node + 1, mid + 1, hi)):",
      "                ones[child] = (b - a + 1) - ones[child]",
      "                lazy[child] = not lazy[child]",
      "            lazy[node] = False",
      "",
      "        def flip(node, lo, hi, l, r):",
      "            if r < lo or hi < l:",
      "                return",
      "            if l <= lo and hi <= r:",
      "                ones[node] = (hi - lo + 1) - ones[node]",
      "                lazy[node] = not lazy[node]",
      "                return",
      "            push(node, lo, hi)",
      "            mid = (lo + hi) // 2",
      "            flip(2 * node, lo, mid, l, r)",
      "            flip(2 * node + 1, mid + 1, hi, l, r)",
      "            ones[node] = ones[2 * node] + ones[2 * node + 1]",
      "",
      "        build(1, 0, n - 1)",
      "        total = sum(nums2)",
      "        answer = []",
      "        for kind, a, b in queries:",
      "            if kind == 1:",
      "                flip(1, 0, n - 1, a, b)",
      "            elif kind == 2:",
      "                total += a * ones[1]",
      "            else:",
      "                answer.append(total)",
      "        return answer",
    ],
    liveArgs(input, params = {}) {
      const { nums1, nums2, queries } = parse2569Data(input, params);
      return [nums1, nums2, queries];
    },
    builder: buildSteps2569,
  },
});
