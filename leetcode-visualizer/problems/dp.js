// Auto-generated: do not edit headers manually.
// Module of LeetCode Visualizer — category-specific builders and problem entries.

/**
 * Generate steps for LeetCode 746: Min Cost Climbing Stairs.
 *
 * Dynamic programming:
 *  - dp[i] = minimum cost to reach step i (0-indexed, with "top" = n).
 *  - dp[0] = dp[1] = 0 (allowed to start at step 0 or 1).
 *  - dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]).
 *  - The answer is dp[n].
 */
function buildSteps746(cost, params) {
  const approach = (params && params.approach) || 1;
  if (approach === 2) return buildSteps746B(cost);

  const n = cost.length;
  const dp = new Array(n + 1).fill(0);
  const steps = [];

  steps.push({
    title: { vi: "Khởi tạo bảng dp", en: "Initialize dp table" },
    arr: [...dp],
    highlight: [0, 1],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "n", value: n },
      { name: "dp", value: [...dp] },
    ],
    note: {
      vi: `cost = [${cost.join(", ")}]. dp có ${n + 1} ô, dp[0]=dp[1]=0 vì được phép bắt đầu ở bậc 0 hoặc 1.`,
      en: `cost = [${cost.join(", ")}]. dp has ${n + 1} cells; dp[0]=dp[1]=0 since you may start at step 0 or 1.`,
    },
  });

  for (let i = 2; i <= n; i++) {
    const optA = dp[i - 1] + cost[i - 1];
    const optB = dp[i - 2] + cost[i - 2];
    dp[i] = Math.min(optA, optB);

    steps.push({
      title: { vi: `Tính dp[${i}]`, en: `Compute dp[${i}]` },
      arr: [...dp],
      highlight: [i - 2, i - 1, i],
      mark: [],
      codeLines: [5, 6],
      vars: [
        { name: "i", value: i },
        { name: "dp[i-1] + cost[i-1]", value: optA },
        { name: "dp[i-2] + cost[i-2]", value: optB },
        { name: "dp[i]", value: dp[i] },
        { name: "dp", value: [...dp] },
      ],
      note: {
        vi: `dp[${i}] = min(dp[${i - 1}]+cost[${i - 1}], dp[${i - 2}]+cost[${i - 2}]) = min(${dp[i - 1]}+${cost[i - 1]}, ${dp[i - 2]}+${cost[i - 2]}) = min(${optA}, ${optB}) = ${dp[i]}.`,
        en: `dp[${i}] = min(dp[${i - 1}]+cost[${i - 1}], dp[${i - 2}]+cost[${i - 2}]) = min(${dp[i - 1]}+${cost[i - 1]}, ${dp[i - 2]}+${cost[i - 2]}) = min(${optA}, ${optB}) = ${dp[i]}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...dp],
    highlight: [],
    mark: [n],
    final: true,
    codeLines: [7],
    vars: [{ name: "answer", value: dp[n] }],
    note: {
      vi: `dp[${n}] = ${dp[n]} là chi phí nhỏ nhất để leo tới đỉnh. Đáp án = ${dp[n]}.`,
      en: `dp[${n}] = ${dp[n]} is the minimum cost to reach the top. Answer = ${dp[n]}.`,
    },
  });

  return { cost: [...cost], answer: dp[n], steps };
}

/**
 * LeetCode 746 — Approach 2: Optimized O(1) space.
 * Track only prev2 = cost to land on i-2, prev1 = cost to land on i-1.
 * curr = cost[i] + min(prev1, prev2); shift prev2 = prev1, prev1 = curr.
 * Answer = min(prev1, prev2).
 */
function buildSteps746B(cost) {
  const n = cost.length;
  const steps = [];

  // History array tracks the value at each index (for bar chart visualization)
  const history = [cost[0], cost[1]];
  let prev2 = cost[0];
  let prev1 = cost[1];

  steps.push({
    title: { vi: "Khởi tạo prev2, prev1", en: "Initialize prev2, prev1" },
    arr: [...history],
    sub: ["prev2", "prev1"],
    highlight: [0, 1],
    mark: [],
    codeBlock: 2,
    codeLines: [3, 4],
    vars: [
      { name: "n", value: n },
      { name: "prev2", value: `cost[0] = ${prev2}` },
      { name: "prev1", value: `cost[1] = ${prev1}` },
    ],
    note: {
      vi: `Approach 2 (O(1) space): chỉ dùng 2 biến.\nprev2 = cost[0] = ${prev2} (chi phí đứng trên bậc 0)\nprev1 = cost[1] = ${prev1} (chi phí đứng trên bậc 1)`,
      en: `Approach 2 (O(1) space): only 2 variables.\nprev2 = cost[0] = ${prev2} (cost to stand on stair 0)\nprev1 = cost[1] = ${prev1} (cost to stand on stair 1)`,
    },
  });

  for (let i = 2; i < n; i++) {
    const curr = cost[i] + Math.min(prev1, prev2);
    history.push(curr);

    // Sub labels showing pointer positions
    const subLabels = history.map((_, idx) => {
      const labels = [];
      if (idx === i - 2) labels.push("prev2");
      if (idx === i - 1) labels.push("prev1");
      if (idx === i) labels.push("curr");
      return labels.length > 0 ? labels.join(",") : `c[${idx}]`;
    });

    steps.push({
      title: { vi: `Bước i=${i}`, en: `Step i=${i}` },
      arr: [...history],
      sub: subLabels,
      highlight: [i - 2, i - 1, i],
      mark: [i],
      codeBlock: 2,
      codeLines: [6, 7, 8, 9],
      vars: [
        { name: "i", value: i },
        { name: "cost[i]", value: cost[i] },
        { name: "curr", value: `cost[${i}] + min(prev1, prev2) = ${cost[i]} + min(${prev1}, ${prev2}) = ${curr}` },
        { name: "prev2", value: `← ${prev1}` },
        { name: "prev1", value: `← ${curr}` },
      ],
      note: {
        vi: `curr = cost[${i}] + min(prev1, prev2) = ${cost[i]} + min(${prev1}, ${prev2}) = ${curr}\nprev2 ← ${prev1}\nprev1 ← ${curr}`,
        en: `curr = cost[${i}] + min(prev1, prev2) = ${cost[i]} + min(${prev1}, ${prev2}) = ${curr}\nprev2 ← ${prev1}\nprev1 ← ${curr}`,
      },
    });

    prev2 = prev1;
    prev1 = curr;
  }

  const answer = Math.min(prev1, prev2);

  // Final sub labels — last two are prev2 and prev1
  const finalLabels = history.map((_, idx) => {
    if (idx === n - 2) return "prev2";
    if (idx === n - 1) return "prev1";
    return `c[${idx}]`;
  });

  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: [...history],
    sub: finalLabels,
    highlight: [],
    mark: [n - 2, n - 1],
    final: true,
    codeBlock: 2,
    codeLines: [11],
    vars: [
      { name: "prev2", value: prev2 },
      { name: "prev1", value: prev1 },
      { name: "answer", value: `min(prev1, prev2) = min(${prev1}, ${prev2}) = ${answer}` },
      { name: "space", value: "O(1)" },
    ],
    note: {
      vi: `Đáp án = min(prev1, prev2) = min(${prev1}, ${prev2}) = ${answer}.\nChỉ dùng O(1) bộ nhớ (2 biến) thay vì mảng dp.`,
      en: `Answer = min(prev1, prev2) = min(${prev1}, ${prev2}) = ${answer}.\nUsed only O(1) memory (2 variables) instead of a dp array.`,
    },
  });

  return { cost: [...cost], answer, steps };
}

/**
 * Generate steps for LeetCode 152: Maximum Product Subarray.
 *
 * Since a negative number can turn the smallest product into the largest, track both:
 *  - curMax: largest product of subarray ending at i.
 *  - curMin: smallest product of subarray ending at i.
 *  - result: the largest answer seen so far.
 */
function buildSteps152(nums) {
  const steps = [];
  let curMax = nums[0];
  let curMin = nums[0];
  let result = nums[0];
  let bestEnd = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    highlight: [0],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "curMax", value: curMax },
      { name: "curMin", value: curMin },
      { name: "result", value: result },
    ],
    note: {
      vi: `Bắt đầu tại nums[0]=${nums[0]}: curMax=curMin=result=${nums[0]}.`,
      en: `Start at nums[0]=${nums[0]}: curMax=curMin=result=${nums[0]}.`,
    },
  });

  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    const a = x;
    const b = curMax * x;
    const c = curMin * x;
    const newMax = Math.max(a, b, c);
    const newMin = Math.min(a, b, c);
    curMax = newMax;
    curMin = newMin;

    let updated = false;
    if (curMax > result) {
      result = curMax;
      bestEnd = i;
      updated = true;
    }

    steps.push({
      title: { vi: `Xét nums[${i}] = ${x}`, en: `Inspect nums[${i}] = ${x}` },
      arr: [...nums],
      highlight: [i],
      mark: [],
      codeLines: [5, 6, 7, 8, 9],
      vars: [
        { name: "i", value: i },
        { name: "x", value: x },
        { name: "curMax", value: curMax },
        { name: "curMin", value: curMin },
        { name: "result", value: result },
      ],
      note: {
        vi: `Ứng viên: (${a}, curMax·x=${b}, curMin·x=${c}) → curMax=${curMax}, curMin=${curMin}. result=${result}${updated ? " (cập nhật)" : ""}.`,
        en: `Candidates: (${a}, curMax·x=${b}, curMin·x=${c}) → curMax=${curMax}, curMin=${curMin}. result=${result}${updated ? " (updated)" : ""}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: [bestEnd],
    final: true,
    codeLines: [10],
    vars: [{ name: "result", value: result }],
    note: {
      vi: `Tích lớn nhất của một dãy con liên tiếp = ${result}.`,
      en: `The maximum product of a contiguous subarray = ${result}.`,
    },
  });

  return { original: [...nums], answer: result, steps };
}

/**
 * Generate steps for LeetCode 70: Climbing Stairs.
 *
 * Fibonacci-style dynamic programming:
 *  - dp[i] = number of ways to reach step i.
 *  - dp[0] = dp[1] = 1.
 *  - dp[i] = dp[i-1] + dp[i-2].
 *  - The answer is dp[n].
 */
function buildSteps70(input, params) {
  const n = input[0];
  const approach = (params && params.approach) || 1;

  if (approach === 2) {
    return buildSteps70Optimized(n);
  }

  const dp = new Array(n + 1).fill(0);
  const steps = [];

  dp[0] = 1;
  if (n >= 1) dp[1] = 1;

  steps.push({
    title: { vi: "Khởi tạo bảng dp", en: "Initialize dp table" },
    arr: [...dp],
    highlight: n >= 1 ? [0, 1] : [0],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "n", value: n },
      { name: "dp", value: [...dp] },
    ],
    note: {
      vi: `Approach 1: DP array. n = ${n}. dp[0] = dp[1] = 1.`,
      en: `Approach 1: DP array. n = ${n}. dp[0] = dp[1] = 1.`,
    },
  });

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    steps.push({
      title: { vi: `Tính dp[${i}]`, en: `Compute dp[${i}]` },
      arr: [...dp],
      highlight: [i - 2, i - 1, i],
      mark: [],
      codeLines: [6, 7],
      vars: [
        { name: "i", value: i },
        { name: "dp[i-1]", value: dp[i - 1] },
        { name: "dp[i-2]", value: dp[i - 2] },
        { name: "dp[i]", value: dp[i] },
      ],
      note: {
        vi: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}.`,
        en: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...dp],
    highlight: [],
    mark: [n],
    final: true,
    codeLines: [8],
    vars: [{ name: "answer", value: dp[n] }],
    note: {
      vi: `Số cách leo tới bậc ${n} = dp[${n}] = ${dp[n]}.`,
      en: `Number of distinct ways to reach step ${n} = dp[${n}] = ${dp[n]}.`,
    },
  });

  return { n, answer: dp[n], steps };
}

/**
 * Generate steps for LeetCode 70 Approach 2: Optimized O(1) space.
 * Climbing stairs is Fibonacci-like: ways(n) = ways(n-1) + ways(n-2).
 */
function buildSteps70Optimized(n) {
  const steps = [];

  if (n <= 2) {
    steps.push({
      title: { vi: `n ≤ 2 → return ${n}`, en: `n ≤ 2 → return ${n}` },
      arr: [n],
      highlight: [0],
      mark: [0],
      final: true,
      codeBlock: 2,
      codeLines: [4, 5],
      vars: [
        { name: "n", value: n },
        { name: "answer", value: n },
      ],
      note: {
        vi: `Approach 2 (O(1) space): n=${n} ≤ 2 → trả về ${n} trực tiếp.`,
        en: `Approach 2 (O(1) space): n=${n} ≤ 2 → return ${n} directly.`,
      },
    });
    return { n, answer: n, steps };
  }

  let prev2 = 1; // ways(1)
  let prev1 = 2; // ways(2)
  const history = [0, 1, 2]; // ways(0)=dummy, ways(1)=1, ways(2)=2

  steps.push({
    title: { vi: "Khởi tạo prev2=1, prev1=2", en: "Initialize prev2=1, prev1=2" },
    arr: [...history],
    sub: ["—", "prev2", "prev1"],
    highlight: [1, 2],
    mark: [],
    codeBlock: 2,
    codeLines: [4, 5, 6],
    vars: [
      { name: "n", value: n },
      { name: "prev2", value: `ways(1) = ${prev2}` },
      { name: "prev1", value: `ways(2) = ${prev1}` },
    ],
    note: {
      vi: `Approach 2 (O(1) space): prev2 = ways(1) = 1, prev1 = ways(2) = 2.`,
      en: `Approach 2 (O(1) space): prev2 = ways(1) = 1, prev1 = ways(2) = 2.`,
    },
  });

  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;
    history.push(curr);

    const subLabels = history.map((_, idx) => {
      const labels = [];
      if (idx === i - 2) labels.push("prev2");
      if (idx === i - 1) labels.push("prev1");
      if (idx === i) labels.push("curr");
      return labels.length > 0 ? labels.join(",") : idx === 0 ? "—" : `(${idx})`;
    });

    steps.push({
      title: { vi: `Bước i=${i}`, en: `Step i=${i}` },
      arr: [...history],
      sub: subLabels,
      highlight: [i - 2, i - 1, i],
      mark: [i],
      codeBlock: 2,
      codeLines: [7, 8, 9, 10],
      vars: [
        { name: "i", value: i },
        { name: "curr", value: `prev1 + prev2 = ${prev1} + ${prev2} = ${curr}` },
        { name: "prev2", value: `← ${prev1}` },
        { name: "prev1", value: `← ${curr}` },
      ],
      note: {
        vi: `Tính ways(${i}): curr = prev1 + prev2, dời pointers sang phải.`,
        en: `Compute ways(${i}): curr = prev1 + prev2, shift pointers right.`,
      },
    });

    prev2 = prev1;
    prev1 = curr;
  }

  const finalLabels = history.map((_, idx) => {
    if (idx === n - 1) return "prev2";
    if (idx === n) return "prev1";
    return idx === 0 ? "—" : `(${idx})`;
  });

  steps.push({
    title: { vi: `Kết quả: ways(${n}) = ${prev1}`, en: `Result: ways(${n}) = ${prev1}` },
    arr: [...history],
    sub: finalLabels,
    highlight: [],
    mark: [n],
    final: true,
    codeBlock: 2,
    codeLines: [11],
    vars: [
      { name: "answer", value: prev1 },
      { name: "space", value: "O(1)" },
    ],
    note: {
      vi: `ways(${n}) = ${prev1}. Chỉ dùng O(1) bộ nhớ.`,
      en: `ways(${n}) = ${prev1}. Used only O(1) memory.`,
    },
  });

  return { n, answer: prev1, steps };
}

/**
 * Generate steps for LeetCode 300: Longest Increasing Subsequence (DP O(n^2) version).
 *
 *  - dp[i] = length of the longest increasing subsequence ending at i.
 *  - dp[i] = 1 + max(dp[j]) for all j < i where nums[j] < nums[i].
 *  - The answer is max(dp).
 */
function buildSteps300(nums, params) {
  const approach = (params && Number(params.approach)) || 1;
  if (approach === 2) return buildSteps300BinarySearch(nums);
  // ── Approach 1: O(n²) DP ──
  const n = nums.length;
  const dp = new Array(n).fill(1);
  const prev = new Array(n).fill(-1);
  const steps = [];

  steps.push({
    title: { vi: "Khởi tạo dp", en: "Initialize dp" },
    arr: [...nums],
    sub: [...dp],
    highlight: [], mark: [],
    codeLines: [3, 4], codeBlock: 1,
    vars: [
      { name: "n", value: n },
      { name: "i", value: "-" },
      { name: "j", value: "-" },
      { name: "dp", value: [...dp] },
    ],
    note: {
      vi: `nums = [${nums.join(", ")}]. dp[i] = độ dài dãy tăng dài nhất kết thúc tại i, khởi tạo toàn 1 (mỗi phần tử tự nó là một dãy).`,
      en: `nums = [${nums.join(", ")}]. dp[i] = length of the longest increasing subsequence ending at i, all initialized to 1.`,
    },
  });

  for (let i = 1; i < n; i++) {
    let bestJ = -1;
    for (let j = 0; j < i; j++) {
      const canExtend = nums[j] < nums[i];
      const candidate = canExtend ? dp[j] + 1 : "-";
      const oldDpi = dp[i];
      let updated = false;
      if (canExtend && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
        bestJ = j;
        updated = true;
      }

      steps.push({
        title: { vi: `So sánh i=${i}, j=${j}`, en: `Compare i=${i}, j=${j}` },
        arr: [...nums],
        sub: [...dp],
        highlight: [j, i],
        mark: bestJ >= 0 ? [bestJ] : [],
        codeLines: updated ? [5, 6, 7, 8] : [5, 6, 7],
        codeBlock: 1,
        vars: [
          { name: "i", value: i },
          { name: "j", value: j },
          { name: "nums[i]", value: nums[i] },
          { name: "nums[j]", value: nums[j] },
          { name: "nums[j] < nums[i]", value: canExtend },
          { name: "dp[j]", value: dp[j] },
          { name: "dp[j] + 1", value: candidate },
          { name: "dp[i] (before)", value: oldDpi },
          { name: "dp[i]", value: dp[i] },
          { name: "bestJ", value: bestJ },
          { name: "dp", value: [...dp] },
        ],
        note: updated
          ? {
              vi: `nums[${j}]=${nums[j]} < nums[${i}]=${nums[i]}, candidate = dp[${j}] + 1 = ${candidate}. Cập nhật dp[${i}]: ${oldDpi} → ${dp[i]}.`,
              en: `nums[${j}]=${nums[j]} < nums[${i}]=${nums[i]}, candidate = dp[${j}] + 1 = ${candidate}. Update dp[${i}]: ${oldDpi} → ${dp[i]}.`,
            }
          : canExtend
            ? {
                vi: `Có thể nối nums[${j}] trước nums[${i}], nhưng candidate ${candidate} không tốt hơn dp[${i}] hiện tại (${dp[i]}).`,
                en: `nums[${j}] can extend into nums[${i}], but candidate ${candidate} does not improve current dp[${i}] (${dp[i]}).`,
              }
            : {
                vi: `Không nối được vì nums[${j}]=${nums[j]} không nhỏ hơn nums[${i}]=${nums[i]}.`,
                en: `Cannot extend because nums[${j}]=${nums[j]} is not smaller than nums[${i}]=${nums[i]}.`,
              },
      });
    }
    prev[i] = bestJ;
    steps.push({
      title: { vi: `Tính dp[${i}]`, en: `Compute dp[${i}]` },
      arr: [...nums], sub: [...dp],
      highlight: bestJ >= 0 ? [bestJ, i] : [i], mark: [],
      codeLines: [5, 6, 7, 8], codeBlock: 1,
      vars: [
        { name: "i", value: i },
        { name: "j", value: i - 1 },
        { name: "nums[i]", value: nums[i] },
        { name: "nums[j]", value: nums[i - 1] },
        { name: "bestJ", value: bestJ },
        { name: "nums[bestJ]", value: bestJ >= 0 ? nums[bestJ] : "-" },
        { name: "dp[i]", value: dp[i] },
        { name: "dp", value: [...dp] },
      ],
      note: bestJ >= 0
        ? { vi: `nums[${i}]=${nums[i]} nối sau nums[${bestJ}]=${nums[bestJ]}. dp[${i}] = dp[${bestJ}] + 1 = ${dp[i]}.`, en: `nums[${i}]=${nums[i]} extends after nums[${bestJ}]=${nums[bestJ]}. dp[${i}] = dp[${bestJ}] + 1 = ${dp[i]}.` }
        : { vi: `Không có phần tử trước nào nhỏ hơn ${nums[i]}, dp[${i}] = 1.`, en: `No earlier element smaller than ${nums[i]}, dp[${i}] stays 1.` },
    });
  }

  let answer = 0, argmax = 0;
  for (let i = 0; i < n; i++) { if (dp[i] > answer) { answer = dp[i]; argmax = i; } }
  const chain = []; for (let i = argmax; i !== -1; i = prev[i]) chain.push(i); chain.reverse();
  const chainValues = chain.map((i) => nums[i]);
  steps.push({ title: { vi: "Kết quả", en: "Result" }, arr: [...nums], sub: [...dp], highlight: [], mark: chain, final: true, codeLines: [9], codeBlock: 1, vars: [{ name: "i", value: "-" }, { name: "j", value: "-" }, { name: "answer", value: answer }, { name: "LIS", value: chainValues }], note: { vi: `LIS = ${answer}. Một dãy đạt được: [${chainValues.join(", ")}].`, en: `LIS = ${answer}. One such subsequence: [${chainValues.join(", ")}].` } });
  return { original: [...nums], answer, chain, steps };
}

// ── Approach 2: Patience Sorting — O(n log n) ──
function buildSteps300BinarySearch(nums) {
  const n = nums.length;
  const tails = []; // tails[i] = smallest tail of all IS of length i+1
  const steps = [];

  steps.push({
    title: { vi: "Patience Sorting: tìm vị trí chèn bằng Binary Search", en: "Patience Sorting: find insertion position via Binary Search" },
    arr: [...nums], sub: Array(n).fill(-1),
    highlight: [], mark: [],
    codeLines: [5], codeBlock: 2,
    vars: [{ name: "tails", value: "[]" }],
    note: {
      vi:
        `Duy trì mảng tails[] (không phải LIS thực sự, nhưng len(tails) = độ dài LIS):\n` +
        `• tails[i] = phần tử NHỎ NHẤT có thể làm đuôi của dãy tăng dài i+1.\n` +
        `• Với mỗi num: Binary Search tìm vị trí i đầu tiên sao cho tails[i] ≥ num.\n` +
        `  - Nếu không tìm thấy → num > tất cả → thêm vào cuối (dãy dài hơn 1).\n` +
        `  - Nếu tìm thấy → thay tails[i] = num (tối ưu đuôi nhỏ hơn).\n` +
        `Đáp án = len(tails).`,
      en:
        `Maintain tails[] (not the actual LIS, but len(tails) = LIS length):\n` +
        `• tails[i] = the SMALLEST possible tail element of any increasing seq. of length i+1.\n` +
        `• For each num: Binary Search for the first i where tails[i] ≥ num.\n` +
        `  - Not found → num > all → append (extend by 1).\n` +
        `  - Found → replace tails[i] = num (keep a smaller tail, more room to grow).\n` +
        `Answer = len(tails).`,
    },
  });

  for (let k = 0; k < n; k++) {
    const num = nums[k];
    // Binary search: find leftmost index where tails[idx] >= num
    let lo = 0, hi = tails.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (tails[mid] < num) lo = mid + 1; else hi = mid; }
    const pos = lo;
    const extended = pos === tails.length;
    if (extended) tails.push(num); else tails[pos] = num;

    const tailsCopy = [...tails];
    const sub = Array(n).fill(-1);
    tails.forEach((v, idx) => { sub[idx] = v; });

    steps.push({
      title: { vi: `num=${num}: chèn tại pos=${pos} → tails=[${tailsCopy.join(",")}]`, en: `num=${num}: insert at pos=${pos} → tails=[${tailsCopy.join(",")}]` },
      arr: [...nums], sub,
      highlight: [k], mark: Array.from({ length: n }, (_, i) => i < k ? i : -1).filter(x => x >= 0),
      codeLines: extended ? [7, 8, 9] : [7, 10, 11], codeBlock: 2,
      vars: [
        { name: "num", value: num },
        { name: "pos (bisect_left)", value: pos },
        { name: "action", value: extended ? `append → dài hơn 1` : `replace tails[${pos}]` },
        { name: "tails", value: `[${tailsCopy.join(",")}]` },
        { name: "LIS length", value: tails.length },
      ],
      note: {
        vi: extended
          ? `num=${num} LỚN HƠN mọi đuôi hiện tại → thêm vào cuối. Dãy dài nhất có thể dài hơn 1 → LIS length = ${tails.length}.`
          : `Binary search tìm được tails[${pos}]=${tails[pos] !== num ? "?" : num} ≥ ${num} → thay bằng ${num} (đuôi nhỏ hơn → tốt hơn). LIS length vẫn = ${tails.length}.`,
        en: extended
          ? `num=${num} is LARGER than all current tails → append. Longest possible sequence grows by 1 → LIS length = ${tails.length}.`
          : `Binary search found tails[${pos}] ≥ ${num} → replace with ${num} (smaller tail = more room to grow). LIS length stays = ${tails.length}.`,
      },
    });
  }

  const answer = tails.length;
  const sub = Array(n).fill(-1); tails.forEach((v, i) => { sub[i] = v; });
  const fs = { title: { vi: `LIS length = ${answer}`, en: `LIS length = ${answer}` }, arr: [...nums], sub, highlight: [], mark: Array.from({ length: answer }, (_, i) => i), final: true, codeLines: [12], codeBlock: 2, vars: [{ name: "answer", value: answer }, { name: "tails", value: `[${tails.join(",")}]` }], note: { vi: `len(tails) = ${answer}. Lưu ý: tails[] không phải LIS thực sự, chỉ là công cụ đếm.`, en: `len(tails) = ${answer}. Note: tails[] is not the actual LIS, just a counting tool.` } };
  fs.final = true; steps.push(fs);
  return { original: [...nums], answer, chain: [], steps };
}

/**
 * Generate steps for LeetCode 509: Fibonacci Number.
 *
 *  - F(0) = 0, F(1) = 1.
 *  - F(n) = F(n-1) + F(n-2).
 */
function buildSteps509(input, params) {
  const n = input[0];
  const approach = (params && params.approach) || 1;

  if (approach === 2) {
    return buildSteps509Optimized(n);
  }

  const dp = new Array(n + 1).fill(0);
  const steps = [];

  if (n >= 1) dp[1] = 1;

  steps.push({
    title: { vi: "Khởi tạo bảng dp", en: "Initialize dp table" },
    arr: [...dp],
    highlight: n >= 1 ? [0, 1] : [0],
    mark: [],
    codeLines: n >= 1 ? [3, 4, 5] : [3],
    vars: [
      { name: "n", value: n },
      { name: "dp", value: [...dp] },
    ],
    note: {
      vi: `Approach 1: DP array. n = ${n}. F(0) = 0 và F(1) = 1 là hai giá trị cơ sở.`,
      en: `Approach 1: DP array. n = ${n}. F(0) = 0 and F(1) = 1 are the base cases.`,
    },
  });

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    steps.push({
      title: { vi: `Tính F(${i})`, en: `Compute F(${i})` },
      arr: [...dp],
      highlight: [i - 2, i - 1, i],
      mark: [],
      codeLines: [6, 7],
      vars: [
        { name: "i", value: i },
        { name: "F(i-1)", value: dp[i - 1] },
        { name: "F(i-2)", value: dp[i - 2] },
        { name: "F(i)", value: dp[i] },
        { name: "dp", value: [...dp] },
      ],
      note: {
        vi: `F(${i}) = F(${i - 1}) + F(${i - 2}) = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}.`,
        en: `F(${i}) = F(${i - 1}) + F(${i - 2}) = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...dp],
    highlight: [],
    mark: [n],
    final: true,
    codeLines: [8],
    vars: [{ name: "answer", value: dp[n] }],
    note: {
      vi: `F(${n}) = ${dp[n]}.`,
      en: `F(${n}) = ${dp[n]}.`,
    },
  });

  return { n, answer: dp[n], steps };
}

/**
 * Generate steps for LeetCode 509 Approach 2: Optimized O(1) space.
 * Only track prev2, prev1, curr.
 */
function buildSteps509Optimized(n) {
  const steps = [];

  if (n <= 1) {
    steps.push({
      title: { vi: `n ≤ 1 → return ${n}`, en: `n ≤ 1 → return ${n}` },
      arr: [n],
      highlight: [0],
      mark: [0],
      final: true,
      codeBlock: 2,
      codeLines: [4, 5],
      vars: [
        { name: "n", value: n },
        { name: "answer", value: n },
      ],
      note: {
        vi: `Approach 2 (O(1) space): n=${n} ≤ 1 → trả về ${n} trực tiếp.`,
        en: `Approach 2 (O(1) space): n=${n} ≤ 1 → return ${n} directly.`,
      },
    });
    return { n, answer: n, steps };
  }

  let prev2 = 0;
  let prev1 = 1;

  // Track history for bar visualization
  const history = [0, 1];

  steps.push({
    title: { vi: "Khởi tạo prev2=0, prev1=1", en: "Initialize prev2=0, prev1=1" },
    arr: [...history],
    sub: ["prev2", "prev1"],
    highlight: [0, 1],
    mark: [],
    codeBlock: 2,
    codeLines: [4, 5, 6],
    vars: [
      { name: "n", value: n },
      { name: "prev2", value: prev2 },
      { name: "prev1", value: prev1 },
    ],
    note: {
      vi: `Approach 2 (O(1) space): chỉ dùng 2 biến. prev2 = F(0) = 0, prev1 = F(1) = 1.`,
      en: `Approach 2 (O(1) space): only 2 variables. prev2 = F(0) = 0, prev1 = F(1) = 1.`,
    },
  });

  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    history.push(curr);

    // Build sub labels showing which variable points to which index
    const subLabels = history.map((_, idx) => {
      const labels = [];
      if (idx === i - 2) labels.push("prev2");
      if (idx === i - 1) labels.push("prev1");
      if (idx === i) labels.push("curr");
      return labels.length > 0 ? labels.join(",") : `F(${idx})`;
    });

    steps.push({
      title: { vi: `Bước i=${i}`, en: `Step i=${i}` },
      arr: [...history],
      sub: subLabels,
      highlight: [i - 2, i - 1, i],
      mark: [i],
      codeBlock: 2,
      codeLines: [7, 8, 9, 10],
      vars: [
        { name: "i", value: i },
        { name: "curr", value: `prev1 + prev2 = ${prev1} + ${prev2} = ${curr}` },
        { name: "prev2", value: `← ${prev1}` },
        { name: "prev1", value: `← ${curr}` },
      ],
      note: {
        vi: `Tính F(${i}): curr = prev1 + prev2, sau đó dời prev2 và prev1 sang phải.`,
        en: `Compute F(${i}): curr = prev1 + prev2, then shift prev2 and prev1 to the right.`,
      },
    });

    prev2 = prev1;
    prev1 = curr;
  }

  // Build final sub labels
  const finalLabels = history.map((_, idx) => {
    if (idx === n - 1) return "prev2";
    if (idx === n) return "prev1";
    return `F(${idx})`;
  });

  steps.push({
    title: { vi: `Kết quả: F(${n}) = ${prev1}`, en: `Result: F(${n}) = ${prev1}` },
    arr: [...history],
    sub: finalLabels,
    highlight: [],
    mark: [n],
    final: true,
    codeBlock: 2,
    codeLines: [11],
    vars: [
      { name: "answer", value: prev1 },
      { name: "space used", value: "O(1) — only prev2, prev1" },
    ],
    note: {
      vi: `F(${n}) = ${prev1}. Chỉ dùng O(1) bộ nhớ (2 biến) thay vì mảng dp dài ${n + 1}.`,
      en: `F(${n}) = ${prev1}. Used only O(1) memory (2 variables) instead of a dp array of size ${n + 1}.`,
    },
  });

  return { n, answer: prev1, steps };
}

/**
 * Generate steps for LeetCode 53: Maximum Subarray (Kadane's algorithm).
 *  - cur = max(nums[i], cur + nums[i])  (extend current subarray or start fresh).
 *  - best = max(best, cur).
 */
function buildSteps53(nums, params) {
  const approach = (params && params.approach) || 1;
  if (approach === 2) {
    return buildSteps53DP(nums);
  }

  const steps = [];
  const inWindow = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, x) => lo + x);

  let cur = nums[0];
  let best = nums[0];
  let curStart = 0;
  let bestL = 0;
  let bestR = 0;

  // curHistory[i] = cur value (max sum ending at i) — the implicit dp array
  const curHistory = new Array(nums.length).fill(null);
  curHistory[0] = cur;
  const subRow = () => curHistory.map((v) => (v === null ? "·" : String(v)));

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    sub: subRow(),
    highlight: [0],
    mark: [],
    codeBlock: 2,
    codeLines: [4, 5],
    vars: [
      { name: "i", value: 0 },
      { name: "nums[i]", value: nums[0] },
      { name: "cur", value: cur },
      { name: "best", value: best },
      { name: "cur subarray", value: `[${nums[0]}]` },
      { name: "best subarray", value: `[${nums[0]}]` },
    ],
    note: {
      vi: `Kadane's Algorithm:\n  dp[i] = max(dp[i-1] + nums[i],  # Mở rộng subarray hiện tại\n              nums[i])             # Bắt đầu subarray mới\n  best = max(best, dp[i])\n\ncur = dp[0] = ${cur}, best = ${best}`,
      en: `Kadane's Algorithm:\n  dp[i] = max(dp[i-1] + nums[i],  # Extend the current subarray\n              nums[i])             # Start a new subarray\n  best = max(best, dp[i])\n\ncur = dp[0] = ${cur}, best = ${best}`,
    },
  });

  for (let i = 1; i < nums.length; i++) {
    const num = nums[i];
    const extendSum = cur + num;
    const restart = extendSum < num;
    if (restart) {
      cur = num;
      curStart = i;
    } else {
      cur = extendSum;
    }
    curHistory[i] = cur;

    let updated = false;
    const prevBest = best;
    if (cur > best) {
      best = cur;
      bestL = curStart;
      bestR = i;
      updated = true;
    }

    const curSubarray = nums.slice(curStart, i + 1);
    const bestSubarray = nums.slice(bestL, bestR + 1);

    steps.push({
      title: { vi: `Xét nums[${i}] = ${num}`, en: `Inspect nums[${i}] = ${num}` },
      arr: [...nums],
      sub: subRow(),
      highlight: inWindow(curStart, i),
      mark: updated ? inWindow(bestL, bestR) : [],
      codeBlock: 2,
      codeLines: [6, 7, 8],
      vars: [
        { name: "i", value: i },
        { name: "nums[i]", value: num },
        { name: "cur + nums[i]", value: `${extendSum - num} + (${num}) = ${extendSum}` },
        { name: "decision", value: restart ? `${extendSum} < ${num} → restart` : `${extendSum} ≥ ${num} → extend` },
        { name: "cur", value: cur },
        { name: "best = max(best, cur)", value: `max(${prevBest}, ${cur}) = ${best}` },
      ],
      note: {
        vi: restart
          ? `dp[i] = max(dp[i-1]+nums[i], nums[i]) = max(${extendSum}, ${num}) = ${num} → bắt đầu subarray mới\ncur = ${cur}, best = ${best}${updated ? " ✓ cập nhật" : ""}`
          : `dp[i] = max(dp[i-1]+nums[i], nums[i]) = max(${extendSum}, ${num}) = ${extendSum} → mở rộng subarray\ncur = ${cur}, best = ${best}${updated ? " ✓ cập nhật" : ""}`,
        en: restart
          ? `dp[i] = max(dp[i-1]+nums[i], nums[i]) = max(${extendSum}, ${num}) = ${num} → start new subarray\ncur = ${cur}, best = ${best}${updated ? " ✓ updated" : ""}`
          : `dp[i] = max(dp[i-1]+nums[i], nums[i]) = max(${extendSum}, ${num}) = ${extendSum} → extend current subarray\ncur = ${cur}, best = ${best}${updated ? " ✓ updated" : ""}`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    sub: subRow(),
    highlight: [],
    mark: inWindow(bestL, bestR),
    final: true,
    codeBlock: 2,
    codeLines: [9],
    vars: [
      { name: "best", value: best },
      { name: "best subarray", value: `[${nums.slice(bestL, bestR + 1).join(", ")}]` },
      { name: "indices", value: `[${bestL}..${bestR}]` },
    ],
    note: {
      vi: `Tổng lớn nhất = ${best}\nSubarray: [${nums.slice(bestL, bestR + 1).join(", ")}] (vị trí ${bestL}..${bestR})`,
      en: `Maximum sum = ${best}\nSubarray: [${nums.slice(bestL, bestR + 1).join(", ")}] (indices ${bestL}..${bestR})`,
    },
  });

  return { original: [...nums], answer: best, steps };
}

/**
 * Generate steps for LeetCode 53 Approach 2: DP array version.
 * dp[i] = max subarray sum ending at i = max(dp[i-1] + nums[i], nums[i]).
 */
function buildSteps53DP(nums) {
  const n = nums.length;
  const dp = new Array(n).fill(0);
  const steps = [];

  // Initial step: dp = [0] * n (before any computation)
  steps.push({
    title: { vi: "Khởi tạo dp = [0] * n", en: "Initialize dp = [0] * n" },
    arr: [...dp],
    sub: nums.map((v) => String(v)),
    highlight: [],
    mark: [],
    codeBlock: 1,
    codeLines: [3, 4],
    vars: [
      { name: "n", value: n },
      { name: "dp", value: `[${dp.join(", ")}]` },
      { name: "nums", value: `[${nums.join(", ")}]` },
    ],
    note: {
      vi: `DP array: dp[i] = tổng lớn nhất của subarray kết thúc tại i.\nKhởi tạo dp = [0] * ${n}. Hàng trên = dp, hàng dưới = nums.`,
      en: `DP array: dp[i] = max subarray sum ending at i.\nInitialize dp = [0] * ${n}. Top bars = dp, bottom row = nums.`,
    },
  });

  dp[0] = nums[0];
  let maxSum = dp[0];
  let bestIdx = 0;

  steps.push({
    title: { vi: "dp[0] = nums[0]", en: "dp[0] = nums[0]" },
    arr: [...dp],
    sub: nums.map((v) => String(v)),
    highlight: [0],
    mark: [],
    codeBlock: 1,
    codeLines: [5, 6],
    vars: [
      { name: "dp[0]", value: dp[0] },
      { name: "max_sum", value: maxSum },
      { name: "dp", value: `[${dp.join(", ")}]` },
    ],
    note: {
      vi: `dp[0] = nums[0] = ${dp[0]}. max_sum = ${maxSum}.`,
      en: `dp[0] = nums[0] = ${dp[0]}. max_sum = ${maxSum}.`,
    },
  });

  for (let i = 1; i < n; i++) {
    const extend = dp[i - 1] + nums[i];
    dp[i] = Math.max(extend, nums[i]);
    let updated = false;
    if (dp[i] > maxSum) {
      maxSum = dp[i];
      bestIdx = i;
      updated = true;
    }

    steps.push({
      title: { vi: `Tính dp[${i}]`, en: `Compute dp[${i}]` },
      arr: [...dp],
      sub: nums.map((v) => String(v)),
      highlight: [i - 1, i],
      mark: updated ? [i] : [],
      codeBlock: 1,
      codeLines: [8, 9],
      vars: [
        { name: "i", value: i },
        { name: "nums[i]", value: nums[i] },
        { name: "dp[i]", value: `max(dp[${i - 1}]+nums[${i}], nums[${i}]) = max(${dp[i - 1]}+${nums[i]}, ${nums[i]}) = ${dp[i]}` },
        { name: "dp", value: `[${dp.join(", ")}]` },
        { name: "max_sum", value: maxSum },
      ],
      note: {
        vi: `dp[${i}] = max(dp[${i - 1}] + nums[${i}], nums[${i}]) = max(${extend}, ${nums[i]}) = ${dp[i]}\nmax_sum = ${maxSum}${updated ? " ✓ cập nhật" : ""}`,
        en: `dp[${i}] = max(dp[${i - 1}] + nums[${i}], nums[${i}]) = max(${extend}, ${nums[i]}) = ${dp[i]}\nmax_sum = ${maxSum}${updated ? " ✓ updated" : ""}`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...dp],
    sub: nums.map((v) => String(v)),
    highlight: [],
    mark: [bestIdx],
    final: true,
    codeBlock: 1,
    codeLines: [10],
    vars: [
      { name: "dp", value: `[${dp.join(", ")}]` },
      { name: "max_sum", value: maxSum },
    ],
    note: {
      vi: `Tổng lớn nhất = max(dp) = ${maxSum}, đạt tại dp[${bestIdx}].`,
      en: `Maximum sum = max(dp) = ${maxSum}, reached at dp[${bestIdx}].`,
    },
  });

  return { original: [...nums], answer: maxSum, steps };
}

/**
 * Generate steps for LeetCode 198: House Robber.
 *
 * dp[i] = maximum money robbed from houses 0..i.
 *  - dp[0] = nums[0]
 *  - dp[1] = max(nums[0], nums[1])
 *  - dp[i] = max(dp[i-1], dp[i-2] + nums[i])  (skip house i or rob house i)
 */
function buildSteps198(nums, params) {
  const approach = (params && Number(params.approach)) || 1;
  if (approach === 2) return buildSteps198B(nums);

  const n = nums.length;
  const dp = new Array(n).fill(0);
  const steps = [];

  dp[0] = nums[0];
  if (n >= 2) dp[1] = Math.max(nums[0], nums[1]);

  steps.push({
    title: { vi: "Khởi tạo dp", en: "Initialize dp" },
    arr: [...nums],
    sub: [...dp],
    highlight: n >= 2 ? [0, 1] : [0],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "n", value: n },
      { name: "dp[0]", value: dp[0] },
      { name: "dp[1]", value: n >= 2 ? dp[1] : "-" },
      { name: "dp", value: [...dp] },
    ],
    note: {
      vi: `nums = [${nums.join(", ")}]. dp[0] = ${dp[0]} (cướp nhà 0). ${n >= 2 ? `dp[1] = max(${nums[0]}, ${nums[1]}) = ${dp[1]}.` : ""}`,
      en: `nums = [${nums.join(", ")}]. dp[0] = ${dp[0]} (rob house 0). ${n >= 2 ? `dp[1] = max(${nums[0]}, ${nums[1]}) = ${dp[1]}.` : ""}`,
    },
  });

  for (let i = 2; i < n; i++) {
    const skip = dp[i - 1];
    const rob = dp[i - 2] + nums[i];
    dp[i] = Math.max(skip, rob);
    const robbed = dp[i] === rob;

    steps.push({
      title: { vi: `Tính dp[${i}]`, en: `Compute dp[${i}]` },
      arr: [...nums],
      sub: [...dp],
      highlight: [i - 2, i - 1, i],
      mark: [],
      codeLines: [6, 7],
      vars: [
        { name: "i", value: i },
        { name: "skip (dp[i-1])", value: skip },
        { name: "rob (dp[i-2]+nums[i])", value: rob },
        { name: "dp[i]", value: dp[i] },
        { name: "decision", value: robbed ? "rob" : "skip" },
        { name: "dp", value: [...dp] },
      ],
      note: {
        vi: `Bỏ nhà ${i}: dp[${i - 1}] = ${skip}. Cướp nhà ${i}: dp[${i - 2}] + ${nums[i]} = ${rob}. → dp[${i}] = max(${skip}, ${rob}) = ${dp[i]} (${robbed ? "cướp" : "bỏ"}).`,
        en: `Skip house ${i}: dp[${i - 1}] = ${skip}. Rob house ${i}: dp[${i - 2}] + ${nums[i]} = ${rob}. → dp[${i}] = max(${skip}, ${rob}) = ${dp[i]} (${robbed ? "rob" : "skip"}).`,
      },
    });
  }

  // Trace back which houses were robbed.
  const robbed = [];
  let i = n - 1;
  while (i >= 0) {
    if (i === 0 || dp[i] !== dp[i - 1]) {
      robbed.push(i);
      i -= 2;
    } else {
      i -= 1;
    }
  }
  robbed.reverse();

  const answer = dp[n - 1];
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    sub: [...dp],
    highlight: [],
    mark: robbed,
    final: true,
    codeLines: [8],
    vars: [
      { name: "answer", value: answer },
      { name: "robbed houses", value: robbed },
      { name: "dp", value: [...dp] },
    ],
    note: {
      vi: `Tiền lớn nhất = dp[${n - 1}] = ${answer}. Cướp các nhà [${robbed.join(", ")}] = [${robbed.map((j) => nums[j]).join(", ")}].`,
      en: `Maximum loot = dp[${n - 1}] = ${answer}. Rob houses [${robbed.join(", ")}] = [${robbed.map((j) => nums[j]).join(", ")}].`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 198 — Approach 2: Rolling variables (O(1) space).
 *
 * Instead of storing the whole dp[] array, keep only the last two values:
 *   max_rob  = best loot up to the current house
 *   prev_rob = best loot up to the house before that
 *
 * For each house `current`:
 *   temp = max(max_rob,             # skip this house
 *              prev_rob + current)  # rob this house (plus best before previous)
 *   prev_rob, max_rob = max_rob, temp
 *
 * Answer = max_rob after the loop.
 */
function buildSteps198B(nums) {
  const steps = [];
  let prevRob = 0;
  let maxRob = 0;

  // Track which houses got robbed for a final highlight (approximate: whenever
  // maxRob strictly increased and the "rob" branch won, we mark that house).
  const robbedFlags = new Array(nums.length).fill(false);

  steps.push({
    title: { vi: "Khởi tạo (O(1) space)", en: "Initialize (O(1) space)" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3],
    codeBlock: 2,
    vars: [
      { name: "prev_rob", value: prevRob },
      { name: "max_rob", value: maxRob },
    ],
    note: {
      vi:
        `Cách 2 chỉ dùng 2 biến thay cho cả bảng dp:\n` +
        `  max_rob  = tiền lớn nhất cướp được tới nhà hiện tại\n` +
        `  prev_rob = tiền lớn nhất cướp được tới nhà TRƯỚC đó\n` +
        `Với mỗi nhà current: temp = max(max_rob, prev_rob + current), rồi dời (prev_rob, max_rob) ← (max_rob, temp).`,
      en:
        `Approach 2 keeps only 2 variables instead of the whole dp array:\n` +
        `  max_rob  = best loot up to the current house\n` +
        `  prev_rob = best loot up to the house BEFORE that\n` +
        `For each house current: temp = max(max_rob, prev_rob + current), then shift (prev_rob, max_rob) ← (max_rob, temp).`,
    },
  });

  for (let i = 0; i < nums.length; i++) {
    const current = nums[i];
    const skipVal = maxRob;
    const robVal = prevRob + current;
    const temp = Math.max(skipVal, robVal);
    const chose = robVal > skipVal ? "rob" : (robVal === skipVal ? "rob=skip" : "skip");

    // Track for the final visualization: if strictly robbing this house is
    // better than skipping, mark it as robbed.
    if (robVal > skipVal) robbedFlags[i] = true;

    // 1) show the comparison BEFORE the shift
    steps.push({
      title: { vi: `Xét nhà ${i} (tiền = ${current})`, en: `House ${i} (money = ${current})` },
      arr: [...nums],
      highlight: [i],
      mark: [],
      codeLines: [5, 6],
      codeBlock: 2,
      vars: [
        { name: "i", value: i },
        { name: "current", value: current },
        { name: "prev_rob", value: prevRob },
        { name: "max_rob", value: maxRob },
        { name: "prev_rob + current", value: robVal },
        { name: "temp = max(...)", value: temp },
        { name: "decision", value: chose },
      ],
      note: {
        vi: `temp = max(max_rob=${maxRob}, prev_rob+current=${prevRob}+${current}=${robVal}) = ${temp}. Quyết định: ${chose === "skip" ? "bỏ nhà" : chose === "rob" ? "cướp nhà" : "cướp (bằng bỏ)"} ${i}.`,
        en: `temp = max(max_rob=${maxRob}, prev_rob+current=${prevRob}+${current}=${robVal}) = ${temp}. Decision: ${chose === "skip" ? "skip" : chose === "rob" ? "rob" : "rob (tie)"} house ${i}.`,
      },
    });

    // 2) apply the shift
    prevRob = maxRob;
    maxRob = temp;

    steps.push({
      title: { vi: `Dời (prev_rob, max_rob)`, en: `Shift (prev_rob, max_rob)` },
      arr: [...nums],
      highlight: [i],
      mark: robbedFlags.map((v, k) => (v ? k : -1)).filter((k) => k >= 0),
      codeLines: [7],
      codeBlock: 2,
      vars: [
        { name: "i", value: i },
        { name: "prev_rob", value: prevRob },
        { name: "max_rob", value: maxRob },
      ],
      note: {
        vi: `Sau lần dời: prev_rob = ${prevRob}, max_rob = ${maxRob} (giá trị mới sau khi xử lý nhà ${i}).`,
        en: `After the shift: prev_rob = ${prevRob}, max_rob = ${maxRob} (new value after processing house ${i}).`,
      },
    });
  }

  const answer = maxRob;
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: robbedFlags.map((v, k) => (v ? k : -1)).filter((k) => k >= 0),
    final: true,
    codeLines: [9],
    codeBlock: 2,
    vars: [
      { name: "prev_rob", value: prevRob },
      { name: "max_rob", value: maxRob },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Sau khi duyệt xong: max_rob = ${answer}. Chỉ dùng O(1) bộ nhớ so với O(n) của cách 1.`,
      en: `After the loop: max_rob = ${answer}. Uses O(1) memory vs O(n) in approach 1.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * Generate steps for LeetCode 213: House Robber II.
 *
 * Houses arranged in a circle → cannot rob both the first and last house.
 * Run House-Robber on two subarrays:
 *   Pass A: nums[0..n-2] (includes first, excludes last)
 *   Pass B: nums[1..n-1] (excludes first, includes last)
 * Answer = max(A, B).
 */
function buildSteps213(nums) {
  const n = nums.length;
  const steps = [];

  if (n === 1) {
    steps.push({
      title: { vi: "Một nhà duy nhất", en: "Only one house" },
      arr: [...nums],
      highlight: [0],
      mark: [0],
      final: true,
      codeLines: [3],
      vars: [{ name: "answer", value: nums[0] }],
      note: { vi: `Chỉ có 1 nhà → cướp nó = ${nums[0]}.`, en: `Only 1 house → rob it = ${nums[0]}.` },
    });
    return { original: [...nums], answer: nums[0], steps };
  }

  // Step 1: Explain the circular problem
  steps.push({
    title: { vi: "Vấn đề: Nhà xếp vòng tròn", en: "Problem: Houses in a circle" },
    arr: [...nums],
    highlight: [0, n - 1],
    mark: [],
    codeLines: [2, 3],
    vars: [
      { name: "n", value: n },
      { name: "nums", value: `[${nums.join(", ")}]` },
      { name: "constraint", value: `house[0] & house[${n - 1}] are adjacent` },
    ],
    note: {
      vi:
        `Nhà 0 và nhà ${n - 1} LIỀN KỀ nhau (vòng tròn) → không thể cướp cả hai.\n` +
        `Giống bài 198 House Robber nhưng thêm ràng buộc vòng.\n\n` +
        `→ Mẹo: CHIA THÀNH 2 BÀI House Robber riêng biệt:\n` +
        `  Pass A: xét nhà [0..${n - 2}] (bỏ nhà cuối)\n` +
        `  Pass B: xét nhà [1..${n - 1}] (bỏ nhà đầu)\n` +
        `  Đáp án = max(A, B)`,
      en:
        `House 0 and house ${n - 1} are ADJACENT (circle) → cannot rob both.\n` +
        `Same as 198 House Robber but with a circular constraint.\n\n` +
        `→ Trick: SPLIT into 2 separate House Robber problems:\n` +
        `  Pass A: houses [0..${n - 2}] (exclude last)\n` +
        `  Pass B: houses [1..${n - 1}] (exclude first)\n` +
        `  Answer = max(A, B)`,
    },
  });

  function robRange(lo, hi, passLabel) {
    const len = hi - lo + 1;
    const dp = new Array(len).fill(0);
    dp[0] = nums[lo];
    if (len >= 2) dp[1] = Math.max(nums[lo], nums[lo + 1]);

    // Sub-labels: show dp values at each position, blank outside range
    const subOf = () => {
      const sub = new Array(n).fill("");
      for (let i = 0; i < len; i++) sub[lo + i] = String(dp[i]);
      return sub;
    };

    steps.push({
      title: { vi: `${passLabel}: nums[${lo}..${hi}]`, en: `${passLabel}: nums[${lo}..${hi}]` },
      arr: [...nums],
      sub: subOf(),
      highlight: len >= 2 ? [lo, lo + 1] : [lo],
      mark: [],
      codeLines: [7, 8, 9],
      vars: [
        { name: "range", value: `nhà [${lo}..${hi}]` },
        { name: "dp[0]", value: `nums[${lo}] = ${dp[0]}` },
        { name: "dp[1]", value: len >= 2 ? `max(nums[${lo}], nums[${lo + 1}]) = max(${nums[lo]}, ${nums[lo + 1]}) = ${dp[1]}` : "-" },
      ],
      note: {
        vi:
          `${passLabel}: chạy House Robber trên nums[${lo}..${hi}].\n` +
          `dp[i] = max(dp[i-1], dp[i-2] + nums[i])\n` +
          `dp[0] = ${dp[0]}, dp[1] = ${len >= 2 ? dp[1] : "-"}`,
        en:
          `${passLabel}: run House Robber on nums[${lo}..${hi}].\n` +
          `dp[i] = max(dp[i-1], dp[i-2] + nums[i])\n` +
          `dp[0] = ${dp[0]}, dp[1] = ${len >= 2 ? dp[1] : "-"}`,
      },
    });

    for (let j = 2; j < len; j++) {
      const idx = lo + j;
      const skip = dp[j - 1];
      const rob = dp[j - 2] + nums[idx];
      dp[j] = Math.max(skip, rob);
      const robbed = dp[j] === rob;

      steps.push({
        title: { vi: `${passLabel}: nhà ${idx} → ${robbed ? "cướp" : "bỏ"}`, en: `${passLabel}: house ${idx} → ${robbed ? "rob" : "skip"}` },
        arr: [...nums],
        sub: subOf(),
        highlight: [idx],
        mark: robbed ? [idx] : [],
        codeLines: [10, 11],
        vars: [
          { name: "house", value: idx },
          { name: "nums[i]", value: nums[idx] },
          { name: "skip (dp[i-1])", value: skip },
          { name: "rob (dp[i-2]+nums[i])", value: `${dp[j - 2]} + ${nums[idx]} = ${rob}` },
          { name: "dp[i]", value: `max(${skip}, ${rob}) = ${dp[j]}` },
          { name: "decision", value: robbed ? "ROB ✓" : "SKIP" },
        ],
        note: {
          vi:
            `Nhà ${idx} (giá trị ${nums[idx]}):\n` +
            `  Bỏ qua: dp[${j - 1}] = ${skip}\n` +
            `  Cướp: dp[${j - 2}] + nums[${idx}] = ${dp[j - 2]} + ${nums[idx]} = ${rob}\n` +
            `  → dp[${j}] = max(${skip}, ${rob}) = ${dp[j]} (${robbed ? "CƯỚP" : "BỎ"})`,
          en:
            `House ${idx} (value ${nums[idx]}):\n` +
            `  Skip: dp[${j - 1}] = ${skip}\n` +
            `  Rob: dp[${j - 2}] + nums[${idx}] = ${dp[j - 2]} + ${nums[idx]} = ${rob}\n` +
            `  → dp[${j}] = max(${skip}, ${rob}) = ${dp[j]} (${robbed ? "ROB" : "SKIP"})`,
        },
      });
    }

    const result = dp[len - 1];

    // Trace back which houses
    const robbedHouses = [];
    let k = len - 1;
    while (k >= 0) {
      if (k === 0 || dp[k] !== dp[k - 1]) {
        robbedHouses.push(lo + k);
        k -= 2;
      } else {
        k -= 1;
      }
    }
    robbedHouses.reverse();

    return { result, robbed: robbedHouses, dp };
  }

  const passA = robRange(0, n - 2, "Pass A");
  steps.push({
    title: { vi: `Pass A xong: ${passA.result}`, en: `Pass A done: ${passA.result}` },
    arr: [...nums],
    highlight: [],
    mark: passA.robbed,
    codeLines: [12],
    vars: [
      { name: "pass A range", value: `nhà [0..${n - 2}]` },
      { name: "pass A max", value: passA.result },
      { name: "houses robbed", value: `[${passA.robbed.join(", ")}] = [${passA.robbed.map((j) => nums[j]).join(", ")}]` },
    ],
    note: {
      vi: `Pass A (bỏ nhà cuối ${n - 1}): tối đa = ${passA.result}.\nCướp nhà [${passA.robbed.join(", ")}] → tổng [${passA.robbed.map((j) => nums[j]).join(" + ")}] = ${passA.result}.`,
      en: `Pass A (exclude last house ${n - 1}): max = ${passA.result}.\nRob houses [${passA.robbed.join(", ")}] → sum [${passA.robbed.map((j) => nums[j]).join(" + ")}] = ${passA.result}.`,
    },
  });

  const passB = robRange(1, n - 1, "Pass B");
  steps.push({
    title: { vi: `Pass B xong: ${passB.result}`, en: `Pass B done: ${passB.result}` },
    arr: [...nums],
    highlight: [],
    mark: passB.robbed,
    codeLines: [12],
    vars: [
      { name: "pass B range", value: `nhà [1..${n - 1}]` },
      { name: "pass B max", value: passB.result },
      { name: "houses robbed", value: `[${passB.robbed.join(", ")}] = [${passB.robbed.map((j) => nums[j]).join(", ")}]` },
    ],
    note: {
      vi: `Pass B (bỏ nhà đầu 0): tối đa = ${passB.result}.\nCướp nhà [${passB.robbed.join(", ")}] → tổng [${passB.robbed.map((j) => nums[j]).join(" + ")}] = ${passB.result}.`,
      en: `Pass B (exclude first house 0): max = ${passB.result}.\nRob houses [${passB.robbed.join(", ")}] → sum [${passB.robbed.map((j) => nums[j]).join(" + ")}] = ${passB.result}.`,
    },
  });

  const answer = Math.max(passA.result, passB.result);
  const bestRobbed = passA.result >= passB.result ? passA.robbed : passB.robbed;
  const bestPass = passA.result >= passB.result ? "A" : "B";
  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: [...nums],
    highlight: [],
    mark: bestRobbed,
    final: true,
    codeLines: [13],
    vars: [
      { name: "pass A", value: passA.result },
      { name: "pass B", value: passB.result },
      { name: "answer", value: `max(${passA.result}, ${passB.result}) = ${answer}` },
      { name: "best pass", value: bestPass },
      { name: "rob houses", value: `[${bestRobbed.join(", ")}] = [${bestRobbed.map((j) => nums[j]).join(", ")}]` },
    ],
    note: {
      vi:
        `Đáp án = max(Pass A, Pass B) = max(${passA.result}, ${passB.result}) = ${answer}.\n` +
        `Chọn Pass ${bestPass}: cướp nhà [${bestRobbed.join(", ")}] → [${bestRobbed.map((j) => nums[j]).join(" + ")}] = ${answer}.`,
      en:
        `Answer = max(Pass A, Pass B) = max(${passA.result}, ${passB.result}) = ${answer}.\n` +
        `Pick Pass ${bestPass}: rob houses [${bestRobbed.join(", ")}] → [${bestRobbed.map((j) => nums[j]).join(" + ")}] = ${answer}.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * Generate steps for LeetCode 1143: Longest Common Subsequence.
 *
 * dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1].
 *  - If text1[i-1] == text2[j-1]: dp[i][j] = dp[i-1][j-1] + 1
 *  - Otherwise: dp[i][j] = max(dp[i-1][j], dp[i][j-1])
 */
function buildSteps1143(input, params) {
  const text1 = String(input).trim();
  const text2 = String(params.text2 || "").trim();
  const m = text1.length;
  const n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const steps = [];

  function gridSnap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: dp.map((row) => [...row]),
        text1,
        text2,
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  gridSnap({
    title: { vi: "Khởi tạo bảng DP", en: "Initialize DP table" },
    codeLines: [3, 4],
    hlCell: null,
    vars: [
      { name: "text1", value: text1 },
      { name: "text2", value: text2 },
      { name: "m", value: m },
      { name: "n", value: n },
    ],
    note: {
      vi: `Tạo bảng (${m + 1})×(${n + 1}) toàn 0. dp[i][j] = LCS của text1[0..i-1] và text2[0..j-1].`,
      en: `Create a (${m + 1})×(${n + 1}) table of zeros. dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1].`,
    },
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = text1[i - 1] === text2[j - 1];
      if (match) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }

      gridSnap({
        title: {
          vi: `dp[${i}][${j}]: '${text1[i - 1]}' vs '${text2[j - 1]}'`,
          en: `dp[${i}][${j}]: '${text1[i - 1]}' vs '${text2[j - 1]}'`,
        },
        codeLines: match ? [5, 6] : [7, 8],
        hlCell: [i, j],
        vars: [
          { name: "i", value: i },
          { name: "j", value: j },
          { name: "text1[i-1]", value: text1[i - 1] },
          { name: "text2[j-1]", value: text2[j - 1] },
          { name: "match", value: match ? "yes" : "no" },
          { name: "dp[i][j]", value: dp[i][j] },
        ],
        note: match
          ? {
              vi: `'${text1[i - 1]}' == '${text2[j - 1]}' → dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`,
              en: `'${text1[i - 1]}' == '${text2[j - 1]}' → dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`,
            }
          : {
              vi: `'${text1[i - 1]}' ≠ '${text2[j - 1]}' → dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = max(${dp[i - 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}.`,
              en: `'${text1[i - 1]}' ≠ '${text2[j - 1]}' → dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = max(${dp[i - 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}.`,
            },
      });
    }
  }

  // Trace back the LCS path.
  const pathCells = [];
  let lcs = "";
  let pi = m;
  let pj = n;
  while (pi > 0 && pj > 0) {
    if (text1[pi - 1] === text2[pj - 1]) {
      pathCells.push([pi, pj]);
      lcs = text1[pi - 1] + lcs;
      pi--;
      pj--;
    } else if (dp[pi - 1][pj] >= dp[pi][pj - 1]) {
      pi--;
    } else {
      pj--;
    }
  }
  pathCells.reverse();

  const answer = dp[m][n];
  gridSnap({
    title: { vi: "Kết quả", en: "Result" },
    codeLines: [9],
    hlCell: null,
    pathCells,
    vars: [
      { name: "LCS length", value: answer },
      { name: "LCS", value: lcs },
    ],
    note: {
      vi: `Dãy con chung dài nhất = "${lcs}" (độ dài ${answer}). Ô xanh = đường truy vết.`,
      en: `Longest common subsequence = "${lcs}" (length ${answer}). Green cells = traceback path.`,
    },
  });

  if (steps.length) steps[steps.length - 1].final = true;
  return { text1, text2, answer, lcs, steps };
}

/**
 * Generate steps for LeetCode 688: Knight Probability in Chessboard.
 * DP: dp[r][c] = probability of being at (r,c) after current number of steps.
 */
function buildSteps688(input, params) {
  const n = input[0];
  const k = params.k || 2;
  const startRow = params.row || 0;
  const startCol = params.col || 0;
  const steps = [];

  const knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

  // Initialize dp
  let dp = Array.from({ length: n }, () => new Array(n).fill(0));
  dp[startRow][startCol] = 1.0;

  function makeGrid(hlCell) {
    return {
      dp: dp.map((row) => row.map((v) => v > 0 ? v.toFixed(3) : "·")),
      text1: Array.from({ length: n }, (_, i) => String(i)),
      text2: Array.from({ length: n }, (_, i) => String(i)),
      hlCell: hlCell || null,
      pathCells: [],
    };
  }

  function totalProb() {
    let s = 0;
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++)
        s += dp[r][c];
    return s;
  }

  steps.push({
    title: { vi: "Khởi tạo dp", en: "Initialize dp" },
    arr: [],
    grid: makeGrid([startRow, startCol]),
    highlight: [],
    mark: [],
    codeLines: [4, 5],
    vars: [
      { name: "n", value: n },
      { name: "k", value: k },
      { name: "start", value: `(${startRow}, ${startCol})` },
      { name: "dp[start]", value: 1.0 },
      { name: "total prob", value: "1.000" },
    ],
    note: {
      vi: `Bàn cờ ${n}×${n}. Mã bắt đầu tại (${startRow},${startCol}) với xác suất 1.0.\nSau ${k} bước, tính xác suất còn trên bàn.`,
      en: `Board ${n}×${n}. Knight starts at (${startRow},${startCol}) with probability 1.0.\nAfter ${k} moves, compute probability of staying on board.`,
    },
  });

  for (let step = 0; step < k; step++) {
    const newDp = Array.from({ length: n }, () => new Array(n).fill(0));

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (dp[r][c] > 0) {
          for (const [dr, dc] of knightMoves) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
              newDp[nr][nc] += dp[r][c] / 8;
            }
            // else: probability "falls off" the board
          }
        }
      }
    }

    dp = newDp;
    const prob = totalProb();

    steps.push({
      title: { vi: `Bước ${step + 1}/${k}: P = ${prob.toFixed(4)}`, en: `Step ${step + 1}/${k}: P = ${prob.toFixed(4)}` },
      arr: [],
      grid: makeGrid(),
      highlight: [],
      mark: [],
      codeLines: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      vars: [
        { name: "step", value: step + 1 },
        { name: "total prob", value: prob.toFixed(6) },
        { name: "lost", value: (1 - prob).toFixed(6) },
      ],
      note: {
        vi: `Sau bước ${step + 1}: xác suất còn trên bàn = ${prob.toFixed(6)}.\nĐã rơi ra ngoài = ${(1 - prob).toFixed(6)}.`,
        en: `After step ${step + 1}: probability on board = ${prob.toFixed(6)}.\nFell off = ${(1 - prob).toFixed(6)}.`,
      },
    });
  }

  const answer = totalProb();
  steps.push({
    title: { vi: `Kết quả: ${answer.toFixed(5)}`, en: `Result: ${answer.toFixed(5)}` },
    arr: [],
    grid: makeGrid(),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [16],
    vars: [
      { name: "answer", value: answer.toFixed(6) },
    ],
    note: {
      vi: `Xác suất mã còn trên bàn ${n}×${n} sau ${k} bước từ (${startRow},${startCol}) = ${answer.toFixed(6)}.`,
      en: `Probability knight stays on ${n}×${n} board after ${k} moves from (${startRow},${startCol}) = ${answer.toFixed(6)}.`,
    },
  });

  return { n, k, answer: +answer.toFixed(5), steps };
}

/**
 * LeetCode 740: Delete and Earn.
 * Reduce to House Robber: build earn[v] = v * count(v), then dp on earn[0..maxVal].
 * dp[i] = max(dp[i-1], dp[i-2] + earn[i]) — can't take adjacent values.
 */
function buildSteps740(nums) {
  const steps = [];
  const maxVal = Math.max(...nums);
  const earn = new Array(maxVal + 1).fill(0);
  for (const num of nums) earn[num] += num;

  // Show transformation
  steps.push({
    title: { vi: "Chuyển về House Robber", en: "Reduce to House Robber" },
    arr: earn.slice(),
    sub: earn.map((_, i) => String(i)),
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "nums", value: `[${nums.join(",")}]` },
      { name: "earn", value: `[${earn.join(",")}]` },
    ],
    note: {
      vi: `earn[v] = v × count(v). Chọn v thì mất v-1 và v+1 → giống House Robber trên mảng earn.\nearn = [${earn.join(", ")}] (index = giá trị số).`,
      en: `earn[v] = v × count(v). Taking v removes v-1 and v+1 → same as House Robber on earn array.\nearn = [${earn.join(", ")}] (index = number value).`,
    },
  });

  // DP
  const dp = new Array(maxVal + 1).fill(0);
  dp[0] = earn[0];
  if (maxVal >= 1) dp[1] = Math.max(earn[0], earn[1]);

  steps.push({
    title: { vi: "Khởi tạo DP", en: "Initialize DP" },
    arr: earn.slice(),
    sub: dp.map((v) => String(v)),
    highlight: maxVal >= 1 ? [0, 1] : [0],
    mark: [],
    codeLines: [6, 7, 8],
    vars: [
      { name: "dp[0]", value: dp[0] },
      { name: "dp[1]", value: maxVal >= 1 ? dp[1] : "-" },
    ],
    note: {
      vi: `dp[0] = earn[0] = ${dp[0]}. dp[1] = max(earn[0], earn[1]) = ${dp[1]}.`,
      en: `dp[0] = earn[0] = ${dp[0]}. dp[1] = max(earn[0], earn[1]) = ${dp[1]}.`,
    },
  });

  for (let i = 2; i <= maxVal; i++) {
    const skip = dp[i - 1];
    const take = dp[i - 2] + earn[i];
    dp[i] = Math.max(skip, take);
    const took = dp[i] === take;

    steps.push({
      title: { vi: `dp[${i}]`, en: `dp[${i}]` },
      arr: earn.slice(),
      sub: dp.map((v) => String(v)),
      highlight: [i - 2, i - 1, i],
      mark: [],
      codeLines: [9, 10],
      vars: [
        { name: "i", value: i },
        { name: "earn[i]", value: earn[i] },
        { name: "skip (dp[i-1])", value: skip },
        { name: "take (dp[i-2]+earn[i])", value: take },
        { name: "dp[i]", value: dp[i] },
        { name: "decision", value: took ? "take" : "skip" },
      ],
      note: {
        vi: `dp[${i}] = max(skip=${skip}, take=${take}) = ${dp[i]} (${took ? `lấy giá trị ${i}` : `bỏ qua ${i}`}).`,
        en: `dp[${i}] = max(skip=${skip}, take=${take}) = ${dp[i]} (${took ? `take value ${i}` : `skip ${i}`}).`,
      },
    });
  }

  const answer = dp[maxVal];
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: earn.slice(),
    sub: dp.map((v) => String(v)),
    highlight: [],
    mark: [maxVal],
    final: true,
    codeLines: [11],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Điểm tối đa = dp[${maxVal}] = ${answer}.`,
      en: `Maximum points = dp[${maxVal}] = ${answer}.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 1406: Stone Game III.
 * dp[i] = best score difference current player can force from stones[i...].
 * Transition: take 1-3 stones and maximize (sum_taken - dp[next]).
 */
function buildSteps1406(stones) {
  const n = stones.length;
  const dp = new Array(n + 1).fill(0);
  const steps = [];

  steps.push({
    title: { vi: "Khởi tạo dp", en: "Initialize dp" },
    arr: [...dp],
    sub: Array.from({ length: n + 1 }, (_, i) => String(i)),
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "n", value: n },
      { name: "dp", value: [...dp] },
    ],
    note: {
      vi: `dp[i] là chênh lệch điểm tốt nhất người chơi hiện tại có thể ép được từ stones[i...]. dp[${n}] = 0 vì không còn đá.`,
      en: `dp[i] is the best score difference the current player can force from stones[i...]. dp[${n}] = 0 because no stones remain.`,
    },
  });

  for (let i = n - 1; i >= 0; i--) {
    let take = 0;
    let best = -Infinity;
    const options = [];

    for (let k = 0; k < 3 && i + k < n; k++) {
      take += stones[i + k];
      const next = i + k + 1;
      const diff = take - dp[next];
      options.push({ count: k + 1, take, next, diff });
      if (diff > best) best = diff;
    }

    dp[i] = best;

    steps.push({
      title: { vi: `Tính dp[${i}]`, en: `Compute dp[${i}]` },
      arr: [...dp],
      sub: Array.from({ length: n + 1 }, (_, idx) => String(idx)),
      highlight: [i],
      mark: [i],
      codeLines: [6, 7, 8, 9, 10],
      vars: [
        { name: "i", value: i },
        { name: "best", value: best },
        { name: "options", value: options.map((o) => `${o.count}:${o.diff}`).join(", ") },
      ],
      note: {
        vi: `Thử 1-3 viên từ vị trí ${i}: ${options.map((o) => `${o.count} viên => ${o.take} - dp[${o.next}] = ${o.diff}`).join("; ")}. Chọn lớn nhất => dp[${i}] = ${dp[i]}.`,
        en: `Try taking 1-3 stones from index ${i}: ${options.map((o) => `${o.count} stone(s) => ${o.take} - dp[${o.next}] = ${o.diff}`).join("; ")}. Pick the maximum => dp[${i}] = ${dp[i]}.`,
      },
    });
  }

  const diff = dp[0];
  const answer = diff > 0 ? "Alice" : diff < 0 ? "Bob" : "Tie";

  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: [...dp],
    sub: Array.from({ length: n + 1 }, (_, i) => String(i)),
    highlight: [],
    mark: [0],
    final: true,
    codeLines: [12],
    vars: [
      { name: "dp[0]", value: diff },
      { name: "winner", value: answer },
    ],
    note: {
      vi: `dp[0] = ${diff}. Dương => Alice thắng, âm => Bob thắng, 0 => hòa. Kết quả: ${answer}.`,
      en: `dp[0] = ${diff}. Positive => Alice wins, negative => Bob wins, 0 => tie. Result: ${answer}.`,
    },
  });

  return { stones: [...stones], answer, steps };
}

/**
 * LeetCode 877: Stone Game.
 * Interval DP on score difference:
 *   dp[i][j] = best difference current player can force from piles[i..j].
 * Transition:
 *   dp[i][j] = max(piles[i] - dp[i+1][j], piles[j] - dp[i][j-1])
 */
function buildSteps877(piles) {
  const n = piles.length;
  const steps = [];
  const dp = Array.from({ length: n }, () => Array(n).fill(0));

  function makeGrid(hlCell = null) {
    const gridDp = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(""));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        gridDp[r + 1][c + 1] = dp[r][c];
      }
    }
    return {
      dp: gridDp,
      text1: Array.from({ length: n }, (_, i) => String(i)).join(""),
      text2: Array.from({ length: n }, (_, i) => String(i)).join(""),
      hlCell,
      pathCells: [],
    };
  }

  steps.push({
    title: { vi: "Khởi tạo bảng dp", en: "Initialize dp table" },
    arr: [...piles],
    sub: piles.map((_, i) => String(i)),
    grid: makeGrid(),
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "n", value: n },
      { name: "dp", value: "n x n table" },
    ],
    note: {
      vi: `Ta dùng dp[i][j] = chênh lệch điểm tốt nhất người chơi hiện tại có thể ép được từ đoạn piles[i..j].`,
      en: `We use dp[i][j] = the best score difference the current player can force from piles[i..j].`,
    },
  });

  for (let i = 0; i < n; i++) {
    dp[i][i] = piles[i];
    steps.push({
      title: { vi: `Đáy: dp[${i}][${i}]`, en: `Base case: dp[${i}][${i}]` },
      arr: [...piles],
      sub: piles.map((_, idx) => String(idx)),
      grid: makeGrid([i + 1, i + 1]),
      highlight: [i],
      mark: [i],
      codeLines: [3, 4, 5, 6],
      vars: [
        { name: "i", value: i },
        { name: "dp[i][i]", value: dp[i][i] },
      ],
      note: {
        vi: `Đoạn chỉ có 1 đống nên dp[${i}][${i}] = piles[${i}] = ${piles[i]}.`,
        en: `A single pile means dp[${i}][${i}] = piles[${i}] = ${piles[i]}.`,
      },
    });
  }

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      const takeLeft = piles[i] - dp[i + 1][j];
      const takeRight = piles[j] - dp[i][j - 1];
      dp[i][j] = Math.max(takeLeft, takeRight);

      steps.push({
        title: { vi: `Tính dp[${i}][${j}]`, en: `Compute dp[${i}][${j}]` },
        arr: [...piles],
        sub: piles.map((_, idx) => String(idx)),
        grid: makeGrid([i + 1, j + 1]),
        highlight: [i, j],
        mark: [i, j],
        codeLines: [7, 8, 9],
        vars: [
          { name: "len", value: len },
          { name: "i", value: i },
          { name: "j", value: j },
          { name: "takeLeft", value: takeLeft },
          { name: "takeRight", value: takeRight },
          { name: "dp[i][j]", value: dp[i][j] },
        ],
        note: {
          vi: `dp[${i}][${j}] = max(piles[${i}] - dp[${i + 1}][${j}] = ${takeLeft}, piles[${j}] - dp[${i}][${j - 1}] = ${takeRight}) = ${dp[i][j]}.`,
          en: `dp[${i}][${j}] = max(piles[${i}] - dp[${i + 1}][${j}] = ${takeLeft}, piles[${j}] - dp[${i}][${j - 1}] = ${takeRight}) = ${dp[i][j]}.`,
        },
      });
    }
  }

  const answer = dp[0][n - 1] > 0;
  steps.push({
    title: { vi: answer ? "Alice thắng" : "Alice thua", en: answer ? "Alice wins" : "Alice loses" },
    arr: [...piles],
    sub: piles.map((_, i) => String(i)),
    grid: makeGrid([1, n]),
    highlight: [],
    mark: [0, n - 1],
    final: true,
    codeLines: [10, 11],
    vars: [
      { name: "dp[0][n-1]", value: dp[0][n - 1] },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `dp[0][${n - 1}] = ${dp[0][n - 1]}. Nếu chênh lệch dương thì Alice thắng; ở bài này kết quả luôn dương với input chuẩn. Alice thắng.`,
      en: `dp[0][${n - 1}] = ${dp[0][n - 1]}. A positive difference means Alice wins; for the standard problem this is always positive. Alice wins.`,
    },
  });

  return { piles: [...piles], answer, steps };
}

/**
 * LeetCode 1140: Stone Game II.
 * dp[i][m] = max stones the current player can obtain from piles[i...]
 * when the current M value is m.
 *
 * Transition:
 *   if 2m >= remaining, take all suffix stones.
 *   otherwise choose x in [1, 2m] and maximize suffixSum[i] - dp[i+x][max(m, x)].
 */
function buildSteps1140(piles) {
  const n = piles.length;
  const steps = [];
  const suffix = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) suffix[i] = suffix[i + 1] + piles[i];

  const dp = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...piles],
    sub: piles.map((_, i) => String(i)),
    grid: dp.map((row) => [...row]),
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5, 6],
    vars: [
      { name: "n", value: n },
      { name: "suffix", value: `[${suffix.slice(0, n).join(", ")}]` },
    ],
    note: {
      vi: `suffix[i] là tổng số đá còn lại từ vị trí i. dp[i][M] là số đá tối đa người chơi hiện tại có thể lấy được từ i khi M hiện tại = M.`,
      en: `suffix[i] is the remaining total from position i. dp[i][M] is the maximum stones the current player can obtain from i with current M = M.`,
    },
  });

  for (let i = n - 1; i >= 0; i--) {
    for (let m = 1; m <= n; m++) {
      const remaining = n - i;
      if (2 * m >= remaining) {
        dp[i][m] = suffix[i];
        steps.push({
          title: { vi: `dp[${i}][${m}]`, en: `dp[${i}][${m}]` },
          arr: [...piles],
          sub: piles.map((_, idx) => String(idx)),
          grid: dp.map((row) => [...row]),
          highlight: [i],
          mark: [i],
          codeLines: [8, 9],
          vars: [
            { name: "i", value: i },
            { name: "M", value: m },
            { name: "remaining", value: remaining },
            { name: "dp[i][M]", value: dp[i][m] },
          ],
          note: {
            vi: `Vì 2M = ${2 * m} >= số đá còn lại ${remaining}, người chơi hiện tại lấy hết suffix => dp[${i}][${m}] = suffix[${i}] = ${suffix[i]}.`,
            en: `Because 2M = ${2 * m} >= remaining stones ${remaining}, the current player can take the whole suffix => dp[${i}][${m}] = suffix[${i}] = ${suffix[i]}.`,
          },
        });
        continue;
      }

      let best = 0;
      const options = [];
      for (let x = 1; x <= 2 * m && i + x <= n; x++) {
        const nextM = Math.max(m, x);
        const gained = suffix[i] - dp[i + x][nextM];
        options.push({ x, nextM, gained });
        if (gained > best) best = gained;
      }
      dp[i][m] = best;

      steps.push({
        title: { vi: `Tính dp[${i}][${m}]`, en: `Compute dp[${i}][${m}]` },
        arr: [...piles],
        sub: piles.map((_, idx) => String(idx)),
        grid: dp.map((row) => [...row]),
        highlight: [i],
        mark: [i],
        codeLines: [10, 11, 12, 13],
        vars: [
          { name: "i", value: i },
          { name: "M", value: m },
          { name: "options", value: options.map((o) => `x=${o.x}: ${o.gained}`).join(", ") },
          { name: "dp[i][M]", value: dp[i][m] },
        ],
        note: {
          vi: `Thử lấy x = 1..${2 * m}. Các lựa chọn: ${options.map((o) => `x=${o.x} => suffix[${i}] - dp[${i + o.x}][${o.nextM}] = ${o.gained}`).join("; ")}. Chọn lớn nhất => dp[${i}][${m}] = ${dp[i][m]}.`,
          en: `Try x = 1..${2 * m}. Options: ${options.map((o) => `x=${o.x} => suffix[${i}] - dp[${i + o.x}][${o.nextM}] = ${o.gained}`).join("; ")}. Pick the maximum => dp[${i}][${m}] = ${dp[i][m]}.`,
        },
      });
    }
  }

  const answer = dp[0][1];
  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: [...piles],
    sub: piles.map((_, i) => String(i)),
    grid: dp.map((row) => [...row]),
    highlight: [],
    mark: [0],
    final: true,
    codeLines: [15],
    vars: [
      { name: "dp[0][1]", value: answer },
      { name: "Alice stones", value: answer },
      { name: "Bob stones", value: suffix[0] - answer },
    ],
    note: {
      vi: `Alice có thể lấy tối đa ${answer} viên. Bob nhận ${suffix[0] - answer} viên còn lại. Vì vậy Alice thắng/đạt kết quả tối ưu theo DP.`,
      en: `Alice can obtain at most ${answer} stones. Bob gets the remaining ${suffix[0] - answer}. So Alice wins or achieves the optimal DP result.`,
    },
  });

  return { piles: [...piles], answer, steps };
}

/**
 * LeetCode 322: Coin Change.
 * dp[i] = min coins to make amount i.
 * dp[0] = 0, dp[i] = min(dp[i - coin] + 1) for each coin.
 */
function buildSteps322(nums, params) {
  const coins = [...nums].sort((a, b) => a - b);
  const amount = params.amount || 11;
  const steps = [];
  const INF = amount + 1;
  const dp = new Array(amount + 1).fill(INF);
  dp[0] = 0;

  steps.push({
    title: { vi: "Khởi tạo DP", en: "Initialize DP" },
    arr: dp.map((v) => (v >= INF ? 0 : v)),
    sub: dp.map((v, i) => (i === 0 ? "0" : "∞")),
    highlight: [0],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "coins", value: `[${coins.join(",")}]` },
      { name: "amount", value: amount },
      { name: "dp[0]", value: 0 },
    ],
    note: {
      vi: `dp[i] = số xu ít nhất để tạo i.\ndp[0] = 0, dp[1..${amount}] = ∞.\nVới mỗi i, thử mỗi coin: dp[i] = min(dp[i], dp[i-coin]+1).`,
      en: `dp[i] = min coins to make amount i.\ndp[0] = 0, dp[1..${amount}] = ∞.\nFor each i, try each coin: dp[i] = min(dp[i], dp[i-coin]+1).`,
    },
  });

  for (let i = 1; i <= amount; i++) {
    let bestCoin = -1;
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;
        bestCoin = coin;
      }
    }

    // Only show steps for key amounts to keep it manageable
    if (i <= 6 || i === amount || coins.includes(i) || dp[i] < INF && i % Math.max(1, Math.floor(amount / 10)) === 0) {
      steps.push({
        title: { vi: `dp[${i}]`, en: `dp[${i}]` },
        arr: dp.slice(0, i + 1).map((v) => (v >= INF ? 0 : v)),
        sub: dp.slice(0, i + 1).map((v) => (v >= INF ? "∞" : String(v))),
        highlight: [i],
        mark: bestCoin > 0 ? [i - bestCoin] : [],
        codeLines: [6, 7, 8],
        vars: [
          { name: "i", value: i },
          { name: "dp[i]", value: dp[i] >= INF ? "∞" : dp[i] },
          { name: "best coin", value: bestCoin > 0 ? bestCoin : "none" },
          { name: "from", value: bestCoin > 0 ? `dp[${i - bestCoin}]+1 = ${dp[i]}` : "no coin fits" },
          { name: "dp", value: `[${dp.map((v) => v >= INF ? "∞" : v).join(", ")}]` },
        ],
        note: {
          vi: bestCoin > 0
            ? `dp[${i}] = dp[${i}-${bestCoin}] + 1 = dp[${i - bestCoin}] + 1 = ${dp[i]}. Dùng xu ${bestCoin}.`
            : `dp[${i}] = ∞ (không xu nào đủ nhỏ hoặc dp[i-coin] = ∞).`,
          en: bestCoin > 0
            ? `dp[${i}] = dp[${i}-${bestCoin}] + 1 = dp[${i - bestCoin}] + 1 = ${dp[i]}. Use coin ${bestCoin}.`
            : `dp[${i}] = ∞ (no coin small enough or dp[i-coin] = ∞).`,
        },
      });
    }
  }

  const answer = dp[amount] >= INF ? -1 : dp[amount];

  // Trace back coins used
  const coinsUsed = [];
  if (answer >= 0) {
    let rem = amount;
    while (rem > 0) {
      for (const coin of coins) {
        if (coin <= rem && dp[rem - coin] + 1 === dp[rem]) {
          coinsUsed.push(coin);
          rem -= coin;
          break;
        }
      }
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: dp.map((v) => (v >= INF ? 0 : v)),
    sub: dp.map((v) => (v >= INF ? "∞" : String(v))),
    highlight: [],
    mark: [amount],
    final: true,
    codeLines: [9],
    vars: [
      { name: "answer", value: answer },
      { name: "coins used", value: answer >= 0 ? `[${coinsUsed.join(", ")}]` : "impossible" },
    ],
    note: {
      vi: answer >= 0
        ? `Số xu ít nhất = ${answer}. Xu dùng: [${coinsUsed.join(", ")}] (tổng = ${amount}).`
        : `Không thể tạo được số tiền ${amount} từ các xu [${coins.join(",")}].`,
      en: answer >= 0
        ? `Minimum coins = ${answer}. Coins used: [${coinsUsed.join(", ")}] (sum = ${amount}).`
        : `Cannot make amount ${amount} from coins [${coins.join(",")}].`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 518: Coin Change II.
 * Count number of combinations (not permutations) to make amount.
 * dp[i] = number of ways to make amount i.
 * For each coin: for i = coin..amount: dp[i] += dp[i - coin].
 * Outer loop on coins avoids counting permutations.
 */
function buildSteps518(nums, params) {
  const coins = [...nums].sort((a, b) => a - b);
  const amount = params.amount || 5;
  const steps = [];
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;

  steps.push({
    title: { vi: "Khởi tạo DP", en: "Initialize DP" },
    arr: dp.slice(),
    sub: dp.map((v) => String(v)),
    highlight: [0],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "coins", value: `[${coins.join(",")}]` },
      { name: "amount", value: amount },
      { name: "dp[0]", value: 1 },
    ],
    note: {
      vi: `dp[i] = số cách tạo amount i.\ndp[0] = 1 (1 cách: không dùng xu nào).\nVòng ngoài trên coin (tránh đếm hoán vị):\n  for coin in coins:\n    for i in range(coin, amount+1):\n      dp[i] += dp[i - coin]`,
      en: `dp[i] = number of ways to make amount i.\ndp[0] = 1 (one way: use no coins).\nOuter loop on coins (avoids counting permutations):\n  for coin in coins:\n    for i in range(coin, amount+1):\n      dp[i] += dp[i - coin]`,
    },
  });

  for (const coin of coins) {
    const before = dp.slice();
    for (let i = coin; i <= amount; i++) {
      dp[i] += dp[i - coin];
    }

    steps.push({
      title: { vi: `Thêm xu ${coin}`, en: `Add coin ${coin}` },
      arr: dp.slice(),
      sub: dp.map((v) => String(v)),
      highlight: Array.from({ length: amount - coin + 1 }, (_, x) => x + coin),
      mark: [],
      codeLines: [5, 6, 7],
      vars: [
        { name: "coin", value: coin },
        { name: "dp (before)", value: `[${before.join(",")}]` },
        { name: "dp (after)", value: `[${dp.join(",")}]` },
      ],
      note: {
        vi: `Xử lý xu ${coin}: dp[i] += dp[i-${coin}] cho i = ${coin}..${amount}.\nSau khi thêm xu ${coin}: dp = [${dp.join(", ")}].`,
        en: `Process coin ${coin}: dp[i] += dp[i-${coin}] for i = ${coin}..${amount}.\nAfter adding coin ${coin}: dp = [${dp.join(", ")}].`,
      },
    });
  }

  const answer = dp[amount];
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: dp.slice(),
    sub: dp.map((v) => String(v)),
    highlight: [],
    mark: [amount],
    final: true,
    codeLines: [8],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Số cách tạo ${amount} từ xu [${coins.join(",")}] = dp[${amount}] = ${answer}.`,
      en: `Number of ways to make ${amount} from coins [${coins.join(",")}] = dp[${amount}] = ${answer}.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 279: Perfect Squares.
 * dp[i] = min perfect squares summing to i.
 * dp[i] = min(dp[i - j*j] + 1) for all j where j*j <= i.
 * Same pattern as Coin Change with coins = [1,4,9,16,...].
 */
function buildSteps279(input) {
  const n = input[0] || 12;
  const steps = [];
  const dp = new Array(n + 1).fill(Infinity);
  dp[0] = 0;

  // Available squares
  const squares = [];
  for (let j = 1; j * j <= n; j++) squares.push(j * j);

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: dp.map((v) => (v === Infinity ? 0 : v)),
    sub: dp.map((v) => (v === Infinity ? "∞" : String(v))),
    highlight: [0],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "n", value: n },
      { name: "squares", value: `[${squares.join(",")}]` },
      { name: "dp[0]", value: 0 },
    ],
    note: {
      vi: `dp[i] = số bình phương hoàn hảo ít nhất có tổng = i.\nCác bình phương ≤ ${n}: [${squares.join(", ")}].\ndp[i] = min(dp[i - j²] + 1) ∀ j² ≤ i.`,
      en: `dp[i] = min perfect squares summing to i.\nSquares ≤ ${n}: [${squares.join(", ")}].\ndp[i] = min(dp[i - j²] + 1) for all j² ≤ i.`,
    },
  });

  for (let i = 1; i <= n; i++) {
    let bestSq = -1;
    for (const sq of squares) {
      if (sq > i) break;
      if (dp[i - sq] + 1 < dp[i]) {
        dp[i] = dp[i - sq] + 1;
        bestSq = sq;
      }
    }

    // Show all steps for small n, or key steps for larger n
    if (n <= 13 || squares.includes(i) || i === n) {
      steps.push({
        title: { vi: `dp[${i}]`, en: `dp[${i}]` },
        arr: dp.slice(0, i + 1).map((v) => (v === Infinity ? 0 : v)),
        sub: dp.slice(0, i + 1).map((v) => (v === Infinity ? "∞" : String(v))),
        highlight: [i],
        mark: bestSq > 0 ? [i - bestSq] : [],
        codeLines: [5, 6, 7],
        vars: [
          { name: "i", value: i },
          { name: "dp[i]", value: dp[i] },
          { name: "best square", value: bestSq },
          { name: "from", value: bestSq > 0 ? `dp[${i - bestSq}]+1 = ${dp[i]}` : "-" },
        ],
        note: {
          vi: `dp[${i}] = dp[${i}-${bestSq}] + 1 = dp[${i - bestSq}] + 1 = ${dp[i]}. Dùng ${bestSq} (=${Math.sqrt(bestSq)}²).`,
          en: `dp[${i}] = dp[${i}-${bestSq}] + 1 = dp[${i - bestSq}] + 1 = ${dp[i]}. Use ${bestSq} (=${Math.sqrt(bestSq)}²).`,
        },
      });
    }
  }

  // Trace back
  const used = [];
  let rem = n;
  while (rem > 0) {
    for (const sq of squares) {
      if (sq <= rem && dp[rem - sq] + 1 === dp[rem]) {
        used.push(sq);
        rem -= sq;
        break;
      }
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: dp.map((v) => (v === Infinity ? 0 : v)),
    sub: dp.map((v) => (v === Infinity ? "∞" : String(v))),
    highlight: [],
    mark: [n],
    final: true,
    codeLines: [8],
    vars: [
      { name: "answer", value: dp[n] },
      { name: "decomposition", value: `[${used.map((sq) => Math.sqrt(sq) + "²").join(" + ")}] = ${n}` },
    ],
    note: {
      vi: `Số bình phương ít nhất = ${dp[n]}. Phân tích: ${used.map((sq) => Math.sqrt(sq) + "²=" + sq).join(" + ")} = ${n}.`,
      en: `Minimum perfect squares = ${dp[n]}. Decomposition: ${used.map((sq) => Math.sqrt(sq) + "²=" + sq).join(" + ")} = ${n}.`,
    },
  });

  return { original: n, answer: dp[n], steps };
}

/**
 * LeetCode 139: Word Break.
 * dp[i] = True if s[0..i-1] can be segmented into dictionary words.
 * dp[0] = True (empty string).
 * dp[i] = any(dp[j] and s[j:i] in wordDict) for j in 0..i-1.
 */
function buildSteps139(input, params) {
  const s = typeof input === "string" ? input : String(input);
  const wordDict = (params.wordDict || "").split(",").map((w) => w.trim()).filter(Boolean);
  const n = s.length;
  const steps = [];
  const wordSet = new Set(wordDict);
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: dp.map((v) => (v ? 1 : 0)),
    sub: ["ε", ...s.split("")],
    highlight: [0],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "s", value: s },
      { name: "wordDict", value: `[${wordDict.join(", ")}]` },
      { name: "dp[0]", value: true },
    ],
    note: {
      vi: `dp[i] = True nếu s[0..i-1] tách được thành từ.\ndp[0] = True (chuỗi rỗng).\ndp[i] = ∃ j: dp[j] = True ∧ s[j:i] ∈ wordDict.`,
      en: `dp[i] = True if s[0..i-1] can be segmented.\ndp[0] = True (empty string).\ndp[i] = ∃ j: dp[j] = True ∧ s[j:i] ∈ wordDict.`,
    },
  });

  for (let i = 1; i <= n; i++) {
    let matchWord = "";
    let matchJ = -1;
    for (let j = 0; j < i; j++) {
      const word = s.slice(j, i);
      if (dp[j] && wordSet.has(word)) {
        dp[i] = true;
        matchWord = word;
        matchJ = j;
        break;
      }
    }

    steps.push({
      title: { vi: `dp[${i}]: s[0..${i - 1}]="${s.slice(0, i)}"`, en: `dp[${i}]: s[0..${i - 1}]="${s.slice(0, i)}"` },
      arr: dp.map((v) => (v ? 1 : 0)),
      sub: ["ε", ...s.split("")],
      highlight: [i],
      mark: dp[i] && matchJ >= 0 ? [matchJ] : [],
      codeLines: [6, 7, 8, 9],
      vars: [
        { name: "i", value: i },
        { name: "dp[i]", value: dp[i] },
        { name: "match", value: dp[i] ? `dp[${matchJ}]=T ∧ "${matchWord}" ∈ dict` : "none" },
      ],
      note: dp[i]
        ? {
            vi: `dp[${matchJ}]=True ∧ s[${matchJ}:${i}]="${matchWord}" ∈ dict → dp[${i}]=True.`,
            en: `dp[${matchJ}]=True ∧ s[${matchJ}:${i}]="${matchWord}" ∈ dict → dp[${i}]=True.`,
          }
        : {
            vi: `Không tìm được j thỏa dp[j]=True ∧ s[j:${i}] ∈ dict → dp[${i}]=False.`,
            en: `No j found where dp[j]=True ∧ s[j:${i}] ∈ dict → dp[${i}]=False.`,
          },
    });
  }

  // Trace back segmentation
  const words = [];
  if (dp[n]) {
    let i = n;
    while (i > 0) {
      for (let j = 0; j < i; j++) {
        const w = s.slice(j, i);
        if (dp[j] && wordSet.has(w)) {
          words.unshift(w);
          i = j;
          break;
        }
      }
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: dp.map((v) => (v ? 1 : 0)),
    sub: ["ε", ...s.split("")],
    highlight: [],
    mark: dp[n] ? dp.map((v, idx) => (v ? idx : -1)).filter((v) => v >= 0) : [],
    final: true,
    codeLines: [10],
    vars: [
      { name: "answer", value: dp[n] },
      { name: "segmentation", value: dp[n] ? words.join(" | ") : "impossible" },
    ],
    note: dp[n]
      ? { vi: `Có thể tách: "${words.join('" + "')}". dp[${n}]=True.`, en: `Can segment: "${words.join('" + "')}". dp[${n}]=True.` }
      : { vi: `Không thể tách "${s}" bằng từ điển. dp[${n}]=False.`, en: `Cannot segment "${s}" using the dictionary. dp[${n}]=False.` },
  });

  return { original: s, answer: dp[n], steps };
}

/**
 * LeetCode 132: Palindrome Partitioning II.
 * dp[i] = minimum cuts needed for s[0..i-1] to be split into all palindromes.
 * isPalin[j][i] = true if s[j..i] is a palindrome.
 * Transition: dp[i] = min(dp[j] + 1) for all j where s[j..i-1] is palindrome.
 */
function buildSteps132(input) {
  const s = typeof input === "string" ? input : String(input);
  const n = s.length;
  const steps = [];

  // Build isPalin table (expand from center or DP).
  const isPalin = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i; j < n; j++) {
      if (s[i] === s[j] && (j - i <= 2 || isPalin[i + 1][j - 1])) {
        isPalin[i][j] = true;
      }
    }
  }

  // dp[i] = min cuts for s[0..i-1]. dp[0] = -1 base.
  const dp = new Array(n + 1).fill(0);
  dp[0] = -1;
  for (let i = 1; i <= n; i++) dp[i] = i - 1; // worst case: cut each char

  const sub = s.split("");

  steps.push({
    title: { vi: "Khởi tạo DP", en: "Initialize DP" },
    arr: [...dp],
    sub: ["-1", ...sub],
    highlight: [], mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "s", value: s },
      { name: "n", value: n },
      { name: "dp (worst)", value: `[${dp.join(",")}]` },
    ],
    note: {
      vi:
        `s = "${s}" (dài ${n}).\n` +
        `dp[i] = số CẮT TỐI THIỂU cho s[0..i-1] thành toàn palindrome.\n` +
        `dp[0] = -1 (base). Khởi tạo dp[i] = i-1 (worst: mỗi ký tự 1 đoạn).\n` +
        `isPalin[i][j] đã được tiền xử lý.`,
      en:
        `s = "${s}" (length ${n}).\n` +
        `dp[i] = minimum CUTS for s[0..i-1] to all be palindromes.\n` +
        `dp[0] = -1 (base). Initialize dp[i] = i-1 (worst: each char is a segment).\n` +
        `isPalin[i][j] has been precomputed.`,
    },
  });

  for (let i = 1; i <= n; i++) {
    let bestJ = i - 1; // default: dp[i-1]+1 (cut single char)
    for (let j = 0; j < i; j++) {
      if (isPalin[j][i - 1] && dp[j] + 1 < dp[i]) {
        dp[i] = dp[j] + 1;
        bestJ = j;
      }
    }

    const palinStr = s.slice(bestJ, i);
    steps.push({
      title: { vi: `dp[${i}] = ${dp[i]}`, en: `dp[${i}] = ${dp[i]}` },
      arr: [...dp],
      sub: ["-1", ...sub],
      highlight: Array.from({ length: i - bestJ }, (_, k) => bestJ + 1 + k).filter(x => x <= n),
      mark: dp[i] === 0 ? Array.from({ length: n + 1 }, (_, k) => k) : [],
      codeLines: [6, 7, 8, 9],
      vars: [
        { name: "i", value: i },
        { name: "s[0..i-1]", value: s.slice(0, i) },
        { name: "best j", value: bestJ },
        { name: "palindrome", value: `s[${bestJ}..${i-1}] = "${palinStr}"` },
        { name: "dp[i]", value: dp[i] },
      ],
      note: {
        vi:
          `Xét s[0..${i-1}] = "${s.slice(0,i)}".\n` +
          `Tìm j sao cho s[j..${i-1}] là palindrome và dp[j]+1 nhỏ nhất.\n` +
          `Tốt nhất: j=${bestJ}, s[${bestJ}..${i-1}] = "${palinStr}" (palindrome${isPalin[bestJ][i-1] ? " ✓" : ""}).\n` +
          `dp[${i}] = dp[${bestJ}] + 1 = ${dp[bestJ]} + 1 = ${dp[i]}.` +
          (dp[i] === 0 ? ` (Toàn bộ chuỗi đã là palindrome → 0 cắt!)` : ``),
        en:
          `Consider s[0..${i-1}] = "${s.slice(0,i)}".\n` +
          `Find j such that s[j..${i-1}] is a palindrome and dp[j]+1 is minimized.\n` +
          `Best: j=${bestJ}, s[${bestJ}..${i-1}] = "${palinStr}" (palindrome${isPalin[bestJ][i-1] ? " ✓" : ""}).\n` +
          `dp[${i}] = dp[${bestJ}] + 1 = ${dp[bestJ]} + 1 = ${dp[i]}.` +
          (dp[i] === 0 ? ` (Entire string is palindrome → 0 cuts!)` : ``),
      },
    });
  }

  const answer = dp[n];
  const fs = {
    title: { vi: `Kết quả: ${answer} cắt`, en: `Result: ${answer} cut(s)` },
    arr: [...dp], sub: ["-1", ...sub],
    highlight: [], mark: [n],
    final: true, codeLines: [10],
    vars: [{ name: "answer", value: answer }, { name: "dp", value: `[${dp.join(",")}]` }],
    note: {
      vi: `dp[${n}] = ${answer} → cần tối thiểu ${answer} lần cắt để "${s}" thành toàn palindrome.`,
      en: `dp[${n}] = ${answer} → minimum ${answer} cut(s) needed to split "${s}" into all palindromes.`,
    },
  };
  steps.push(fs);
  return { input: s, answer, steps };
}

/**
 * LeetCode 91: Decode Ways.
 * dp[i] = number of ways to decode s[0..i-1].
 * Single digit s[i-1] != '0': dp[i] += dp[i-1].
 * Two digits s[i-2:i] in 10..26: dp[i] += dp[i-2].
 */
function buildSteps91(input) {
  const s = typeof input === "string" ? input : String(input);
  const n = s.length;
  const steps = [];
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: dp.slice(),
    sub: ["ε", ...s.split("")],
    highlight: [0],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "s", value: s },
      { name: "dp[0]", value: 1 },
    ],
    note: {
      vi: `A=1..Z=26. dp[i] = số cách decode s[0..i-1].\ndp[0] = 1 (chuỗi rỗng = 1 cách).\nVới mỗi i:\n  - 1 chữ số s[i-1] ≠ '0': dp[i] += dp[i-1]\n  - 2 chữ số s[i-2:i] ∈ [10..26]: dp[i] += dp[i-2]`,
      en: `A=1..Z=26. dp[i] = ways to decode s[0..i-1].\ndp[0] = 1 (empty = 1 way).\nFor each i:\n  - Single digit s[i-1] ≠ '0': dp[i] += dp[i-1]\n  - Two digits s[i-2:i] ∈ [10..26]: dp[i] += dp[i-2]`,
    },
  });

  for (let i = 1; i <= n; i++) {
    const oneDigit = s[i - 1];
    const twoDigit = i >= 2 ? s.slice(i - 2, i) : "";
    const twoVal = twoDigit ? parseInt(twoDigit, 10) : 0;
    let addedFrom1 = false;
    let addedFrom2 = false;

    if (oneDigit !== "0") {
      dp[i] += dp[i - 1];
      addedFrom1 = true;
    }
    if (i >= 2 && twoVal >= 10 && twoVal <= 26) {
      dp[i] += dp[i - 2];
      addedFrom2 = true;
    }

    const parts = [];
    if (addedFrom1) parts.push(`'${oneDigit}'→dp[${i - 1}]=${dp[i - 1]}`);
    if (addedFrom2) parts.push(`'${twoDigit}'→dp[${i - 2}]=${i >= 2 ? dp[i - 2] : 0}`);

    steps.push({
      title: { vi: `dp[${i}]: "${s.slice(0, i)}"`, en: `dp[${i}]: "${s.slice(0, i)}"` },
      arr: dp.slice(),
      sub: ["ε", ...s.split("")],
      highlight: [i],
      mark: [addedFrom1 ? i - 1 : -1, addedFrom2 ? i - 2 : -1].filter((v) => v >= 0),
      codeLines: [5, 6, 7, 8],
      vars: [
        { name: "i", value: i },
        { name: "1-digit", value: `'${oneDigit}' ${oneDigit !== "0" ? "✓" : "✗ (zero)"}` },
        { name: "2-digit", value: i >= 2 ? `'${twoDigit}'=${twoVal} ${twoVal >= 10 && twoVal <= 26 ? "✓" : "✗"}` : "n/a" },
        { name: "dp[i]", value: dp[i] },
      ],
      note: {
        vi: parts.length > 0
          ? `dp[${i}] = ${parts.join(" + ")} = ${dp[i]}.`
          : `dp[${i}] = 0 (s[${i - 1}]='0' đứng một mình, không tạo 2 chữ số hợp lệ).`,
        en: parts.length > 0
          ? `dp[${i}] = ${parts.join(" + ")} = ${dp[i]}.`
          : `dp[${i}] = 0 ('${oneDigit}' alone is invalid, no valid 2-digit pair).`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: dp.slice(),
    sub: ["ε", ...s.split("")],
    highlight: [],
    mark: [n],
    final: true,
    codeLines: [9],
    vars: [{ name: "answer", value: dp[n] }],
    note: {
      vi: `Số cách decode "${s}" = dp[${n}] = ${dp[n]}.`,
      en: `Number of ways to decode "${s}" = dp[${n}] = ${dp[n]}.`,
    },
  });

  return { original: s, answer: dp[n], steps };
}

/**
 * LeetCode 62: Unique Paths.
 * dp[r][c] = number of paths from (0,0) to (r,c).
 * dp[r][c] = dp[r-1][c] + dp[r][c-1]. First row/col = 1.
 * Uses the grid renderer (like LCS) to show the 2D table filling.
 */
function buildSteps62(input, params) {
  const m = params.m || 3;
  const n = params.n || 7;
  const steps = [];
  const dp = Array.from({ length: m }, () => new Array(n).fill(0));

  // Fill first row and col with 1
  for (let r = 0; r < m; r++) dp[r][0] = 1;
  for (let c = 0; c < n; c++) dp[0][c] = 1;

  function gridSnap(opts) {
    const colHeaders = Array.from({ length: n }, (_, c) => String(c));
    const rowLabels = Array.from({ length: m }, (_, r) => String(r));
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: dp.map((row) => [...row]),
        text1: rowLabels.join(""),
        text2: colHeaders.join(""),
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  gridSnap({
    title: { vi: "Khởi tạo", en: "Initialize" },
    codeLines: [3, 4, 5],
    vars: [{ name: "m", value: m }, { name: "n", value: n }],
    note: {
      vi: `Lưới ${m}×${n}. dp[r][c] = số đường từ (0,0) đến (r,c).\nHàng đầu = cột đầu = 1 (chỉ đi phải/xuống).\ndp[r][c] = dp[r-1][c] + dp[r][c-1].`,
      en: `Grid ${m}×${n}. dp[r][c] = paths from (0,0) to (r,c).\nFirst row = first col = 1 (only right/down).\ndp[r][c] = dp[r-1][c] + dp[r][c-1].`,
    },
  });

  // Fill the rest
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1];

      // Show selected steps to keep manageable
      if (m * n <= 30 || r === m - 1 && c === n - 1 || (r + c) % 2 === 0) {
        gridSnap({
          title: { vi: `dp[${r}][${c}]`, en: `dp[${r}][${c}]` },
          hlCell: [r, c],
          codeLines: [6, 7],
          vars: [
            { name: "r", value: r },
            { name: "c", value: c },
            { name: "dp[r-1][c]", value: dp[r - 1][c] },
            { name: "dp[r][c-1]", value: dp[r][c - 1] },
            { name: "dp[r][c]", value: dp[r][c] },
          ],
          note: {
            vi: `dp[${r}][${c}] = dp[${r - 1}][${c}] + dp[${r}][${c - 1}] = ${dp[r - 1][c]} + ${dp[r][c - 1]} = ${dp[r][c]}.`,
            en: `dp[${r}][${c}] = dp[${r - 1}][${c}] + dp[${r}][${c - 1}] = ${dp[r - 1][c]} + ${dp[r][c - 1]} = ${dp[r][c]}.`,
          },
        });
      }
    }
  }

  const answer = dp[m - 1][n - 1];
  gridSnap({
    title: { vi: "Kết quả", en: "Result" },
    hlCell: [m - 1, n - 1],
    codeLines: [8],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Số đường đi duy nhất từ (0,0) đến (${m - 1},${n - 1}) = ${answer}.`,
      en: `Unique paths from (0,0) to (${m - 1},${n - 1}) = ${answer}.`,
    },
  });
  steps[steps.length - 1].final = true;

  return { original: { m, n }, answer, steps };
}

/**
 * LeetCode 64: Minimum Path Sum.
 * dp[r][c] = min cost to reach (r,c) from (0,0), only moving right or down.
 * dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1]).
 */
function buildSteps64(input, params) {
  // Parse grid: input is string "1,3,1|1,5,1|4,2,1" or flat array with rows/cols
  let grid;
  if (typeof input === "string") {
    grid = input.split("|").map((row) => row.split(",").map(Number));
  } else {
    const rows = params.rows || 3;
    const cols = params.cols || Math.ceil(input.length / rows);
    grid = [];
    for (let r = 0; r < rows; r++) grid.push(input.slice(r * cols, (r + 1) * cols));
  }
  const m = grid.length;
  const n = grid[0].length;
  const dp = Array.from({ length: m }, () => new Array(n).fill(0));
  const steps = [];

  // Fill dp
  dp[0][0] = grid[0][0];
  for (let c = 1; c < n; c++) dp[0][c] = dp[0][c - 1] + grid[0][c];
  for (let r = 1; r < m; r++) dp[r][0] = dp[r - 1][0] + grid[r][0];

  function gridSnap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: dp.map((row) => [...row]),
        text1: Array.from({ length: m }, (_, r) => String(r)).join(""),
        text2: Array.from({ length: n }, (_, c) => String(c)).join(""),
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  gridSnap({
    title: { vi: "Khởi tạo", en: "Initialize" },
    codeLines: [3, 4, 5, 6],
    vars: [{ name: "m", value: m }, { name: "n", value: n }],
    note: {
      vi: `Lưới ${m}×${n}. dp[r][c] = chi phí nhỏ nhất đến (r,c).\nHàng đầu: cộng dồn từ trái. Cột đầu: cộng dồn từ trên.\ndp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1]).`,
      en: `Grid ${m}×${n}. dp[r][c] = min cost to reach (r,c).\nFirst row: prefix sum from left. First col: prefix sum from top.\ndp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1]).`,
    },
  });

  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      const fromTop = dp[r - 1][c];
      const fromLeft = dp[r][c - 1];
      dp[r][c] = grid[r][c] + Math.min(fromTop, fromLeft);
      const dir = fromTop <= fromLeft ? "↑" : "←";

      gridSnap({
        title: { vi: `dp[${r}][${c}]`, en: `dp[${r}][${c}]` },
        hlCell: [r, c],
        codeLines: [7, 8],
        vars: [
          { name: "r", value: r },
          { name: "c", value: c },
          { name: "grid[r][c]", value: grid[r][c] },
          { name: "from top", value: fromTop },
          { name: "from left", value: fromLeft },
          { name: "dp[r][c]", value: dp[r][c] },
          { name: "direction", value: dir },
        ],
        note: {
          vi: `dp[${r}][${c}] = ${grid[r][c]} + min(${fromTop}, ${fromLeft}) = ${grid[r][c]} + ${Math.min(fromTop, fromLeft)} = ${dp[r][c]} (từ ${dir === "↑" ? "trên" : "trái"}).`,
          en: `dp[${r}][${c}] = ${grid[r][c]} + min(${fromTop}, ${fromLeft}) = ${grid[r][c]} + ${Math.min(fromTop, fromLeft)} = ${dp[r][c]} (from ${dir === "↑" ? "top" : "left"}).`,
        },
      });
    }
  }

  // Trace back path
  const pathCells = [[m - 1, n - 1]];
  let r = m - 1, c = n - 1;
  while (r > 0 || c > 0) {
    if (r === 0) { c--; }
    else if (c === 0) { r--; }
    else if (dp[r - 1][c] <= dp[r][c - 1]) { r--; }
    else { c--; }
    pathCells.push([r, c]);
  }
  pathCells.reverse();

  const answer = dp[m - 1][n - 1];
  gridSnap({
    title: { vi: "Kết quả", en: "Result" },
    hlCell: null,
    pathCells,
    codeLines: [9],
    vars: [
      { name: "answer", value: answer },
      { name: "path", value: pathCells.map(([r, c]) => `(${r},${c})`).join("→") },
    ],
    note: {
      vi: `Chi phí nhỏ nhất = ${answer}. Đường đi: ${pathCells.map(([r, c]) => grid[r][c]).join("+")} = ${answer}.`,
      en: `Minimum path sum = ${answer}. Path: ${pathCells.map(([r, c]) => grid[r][c]).join("+")} = ${answer}.`,
    },
  });
  steps[steps.length - 1].final = true;

  return { original: grid, answer, steps };
}

/**
 * LeetCode 120: Triangle.
 * Bottom-up DP: dp[r][c] = triangle[r][c] + min(dp[r+1][c], dp[r+1][c+1]).
 * Start from the bottom row, work up to dp[0][0].
 * Uses grid view to show the triangle filling from bottom.
 */
function buildSteps120(input) {
  // Parse triangle: "2|3,4|6,5,7|4,1,8,3" (rows separated by |)
  let triangle;
  if (typeof input === "string") {
    triangle = input.split("|").map((row) => row.split(",").map(Number));
  } else {
    triangle = [[input[0] || 2], [3, 4], [6, 5, 7], [4, 1, 8, 3]];
  }
  const n = triangle.length;
  const steps = [];

  // Pad to make rectangular grid for display
  const maxCols = triangle[n - 1].length;
  const dp = triangle.map((row) => [...row]);

  function gridSnap(opts) {
    // Build a padded grid for display
    const displayDp = [];
    for (let r = 0; r < n; r++) {
      const row = new Array(maxCols).fill(null);
      for (let c = 0; c < dp[r].length; c++) row[c] = dp[r][c];
      displayDp.push(row.map((v) => (v === null ? "" : v)));
    }
    steps.push({
      title: opts.title,
      arr: [],
      grid: {
        dp: displayDp,
        text1: Array.from({ length: n }, (_, r) => String(r)).join(""),
        text2: Array.from({ length: maxCols }, (_, c) => String(c)).join(""),
        hlCell: opts.hlCell || null,
        pathCells: opts.pathCells || [],
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  gridSnap({
    title: { vi: "Tam giác ban đầu", en: "Initial triangle" },
    codeLines: [3],
    vars: [{ name: "rows", value: n }],
    note: {
      vi: `Tam giác ${n} hàng. DP bottom-up:\ndp[r][c] = triangle[r][c] + min(dp[r+1][c], dp[r+1][c+1]).\nBắt đầu từ hàng cuối (đã là chính nó), lên hàng 0.`,
      en: `Triangle with ${n} rows. Bottom-up DP:\ndp[r][c] = triangle[r][c] + min(dp[r+1][c], dp[r+1][c+1]).\nStart from bottom row (unchanged), work up to row 0.`,
    },
  });

  // Bottom-up: from row n-2 up to 0
  for (let r = n - 2; r >= 0; r--) {
    for (let c = 0; c <= r; c++) {
      const below = dp[r + 1][c];
      const belowRight = dp[r + 1][c + 1];
      dp[r][c] = triangle[r][c] + Math.min(below, belowRight);
      const dir = below <= belowRight ? "↓" : "↘";

      gridSnap({
        title: { vi: `dp[${r}][${c}]`, en: `dp[${r}][${c}]` },
        hlCell: [r, c],
        codeLines: [4, 5, 6],
        vars: [
          { name: "r", value: r },
          { name: "c", value: c },
          { name: "tri[r][c]", value: triangle[r][c] },
          { name: "dp[r+1][c]", value: below },
          { name: "dp[r+1][c+1]", value: belowRight },
          { name: "dp[r][c]", value: dp[r][c] },
        ],
        note: {
          vi: `dp[${r}][${c}] = ${triangle[r][c]} + min(${below}, ${belowRight}) = ${triangle[r][c]} + ${Math.min(below, belowRight)} = ${dp[r][c]} (${dir}).`,
          en: `dp[${r}][${c}] = ${triangle[r][c]} + min(${below}, ${belowRight}) = ${triangle[r][c]} + ${Math.min(below, belowRight)} = ${dp[r][c]} (${dir}).`,
        },
      });
    }
  }

  // Trace path from top
  const pathCells = [[0, 0]];
  let pc = 0;
  for (let r = 0; r < n - 1; r++) {
    if (dp[r + 1][pc] <= dp[r + 1][pc + 1]) {
      pathCells.push([r + 1, pc]);
    } else {
      pc++;
      pathCells.push([r + 1, pc]);
    }
  }

  const answer = dp[0][0];
  gridSnap({
    title: { vi: "Kết quả", en: "Result" },
    hlCell: [0, 0],
    pathCells,
    codeLines: [7],
    vars: [
      { name: "answer", value: answer },
      { name: "path", value: pathCells.map(([r, c]) => triangle[r][c]).join(" → ") },
    ],
    note: {
      vi: `Tổng nhỏ nhất = ${answer}. Đường: ${pathCells.map(([r, c]) => triangle[r][c]).join(" + ")} = ${answer}.`,
      en: `Minimum path sum = ${answer}. Path: ${pathCells.map(([r, c]) => triangle[r][c]).join(" + ")} = ${answer}.`,
    },
  });
  steps[steps.length - 1].final = true;

  return { original: triangle, answer, steps };
}

/**
 * LeetCode 741: Cherry Pickup.
 * Two simultaneous walkers from (0,0) to (n-1,n-1).
 * State dp[c1][c2] for step t = r1+c1 = r2+c2 (r1 = t-c1, r2 = t-c2).
 * Visualization shows the grid + the two walker positions at each step.
 */
function buildSteps741(input) {
  // Parse grid: "0,1,-1|1,0,-1|1,1,1" → [[0,1,-1],[1,0,-1],[1,1,1]]
  const grid = String(input).split("|").map((row) => row.trim().split(",").map(Number));
  const n = grid.length;
  const steps = [];
  const NEG = -Infinity;

  const cellLabel = (v) => (v === -1 ? "✗" : v === 1 ? "🍒" : "·");

  function makeGrid(hlCells, pathCells) {
    return {
      dp: grid.map((row) => row.map((v) => cellLabel(v))),
      text1: Array.from({ length: n }, (_, i) => `r${i}`),
      text2: Array.from({ length: n }, (_, i) => `c${i}`),
      hlCell: null,
      pathCells: hlCells || [],
      // reuse pathCells for highlighting both walkers
      _extraPath: pathCells || [],
    };
  }

  // Intro
  steps.push({
    title: { vi: "Đề bài", en: "Problem" },
    arr: [],
    grid: makeGrid([]),
    highlight: [],
    mark: [],
    codeLines: [2, 3],
    vars: [
      { name: "size", value: `${n}×${n}` },
      { name: "cells", value: "🍒=cherry(1), ✗=thorn(-1), ·=empty(0)" },
    ],
    note: {
      vi:
        `Lưới ${n}×${n}: 1=anh đào 🍒, 0=trống, -1=gai (không đi được).\n` +
        `Đi từ (0,0) → (n-1,n-1) (chỉ phải/xuống), nhặt anh đào (ô thành 0), rồi quay về (0,0) (chỉ trái/lên).\n` +
        `Tối đa hóa số anh đào nhặt được.`,
      en:
        `Grid ${n}×${n}: 1=cherry 🍒, 0=empty, -1=thorn (blocked).\n` +
        `Go (0,0) → (n-1,n-1) (right/down only), pick cherries (cell becomes 0), then return to (0,0) (left/up).\n` +
        `Maximize cherries collected.`,
    },
  });

  // Key trick step
  steps.push({
    title: { vi: "Mẹo: 2 người cùng đi", en: "Trick: two simultaneous walkers" },
    arr: [],
    grid: makeGrid([[0, 0]]),
    highlight: [],
    mark: [],
    codeLines: [4, 5, 6],
    vars: [
      { name: "walker A", value: "(r1, c1)" },
      { name: "walker B", value: "(r2, c2)" },
      { name: "constraint", value: "r1+c1 == r2+c2 == t" },
    ],
    note: {
      vi:
        `Thay vì đi-rồi-về, coi như HAI người cùng xuất phát (0,0) → (n-1,n-1).\n` +
        `Cả hai đi cùng số bước t = r+c. Nên r1+c1 = r2+c2 = t → chỉ cần 3 biến (t, c1, c2).\n` +
        `Nếu hai người ở cùng ô → chỉ tính anh đào 1 lần.`,
      en:
        `Instead of go-then-return, treat as TWO walkers both going (0,0) → (n-1,n-1).\n` +
        `Both take t = r+c steps. So r1+c1 = r2+c2 = t → only 3 vars needed (t, c1, c2).\n` +
        `If both on the same cell → count its cherry once.`,
    },
  });

  // DP with memoization
  const memo = new Map();
  const key = (r1, c1, c2) => `${r1},${c1},${c2}`;

  function dfs(r1, c1, c2) {
    const r2 = r1 + c1 - c2;
    // Out of bounds or thorn
    if (r1 >= n || c1 >= n || r2 >= n || c2 >= n || grid[r1][c1] === -1 || grid[r2][c2] === -1) {
      return NEG;
    }
    // Reached destination
    if (r1 === n - 1 && c1 === n - 1) {
      return grid[r1][c1];
    }
    const k = key(r1, c1, c2);
    if (memo.has(k)) return memo.get(k);

    // Cherries at current positions
    let cherries = grid[r1][c1];
    if (c1 !== c2) cherries += grid[r2][c2];

    // Two walkers each move right or down: 4 combinations
    const best = Math.max(
      dfs(r1, c1 + 1, c2 + 1), // both right
      dfs(r1 + 1, c1, c2 + 1), // A down, B right
      dfs(r1, c1 + 1, c2),     // A right, B down
      dfs(r1 + 1, c1, c2),     // both down
    );

    const result = best === NEG ? NEG : cherries + best;
    memo.set(k, result);
    return result;
  }

  const raw = dfs(0, 0, 0);
  const answer = Math.max(0, raw === NEG ? 0 : raw);

  // Reconstruct the two paths for visualization
  const pathA = [];
  const pathB = [];
  if (answer > 0 || raw !== NEG) {
    let r1 = 0, c1 = 0, c2 = 0;
    while (true) {
      pathA.push([r1, c1]);
      const r2 = r1 + c1 - c2;
      pathB.push([r2, c2]);
      if (r1 === n - 1 && c1 === n - 1) break;
      // Choose the move that matches the optimal value
      const moves = [
        [r1, c1 + 1, c2 + 1],
        [r1 + 1, c1, c2 + 1],
        [r1, c1 + 1, c2],
        [r1 + 1, c1, c2],
      ];
      let chosen = null;
      let bestVal = NEG;
      for (const [nr1, nc1, nc2] of moves) {
        const nr2 = nr1 + nc1 - nc2;
        if (nr1 >= n || nc1 >= n || nr2 >= n || nc2 >= n) continue;
        if (grid[nr1][nc1] === -1 || grid[nr2][nc2] === -1) continue;
        const v = memo.has(key(nr1, nc1, nc2)) ? memo.get(key(nr1, nc1, nc2)) : dfs(nr1, nc1, nc2);
        if (v > bestVal) { bestVal = v; chosen = [nr1, nc1, nc2]; }
      }
      if (!chosen) break;
      [r1, c1, c2] = chosen;
    }
  }

  // Show a few key path steps
  const totalT = 2 * (n - 1);
  const shown = Math.min(pathA.length, 6);
  for (let idx = 0; idx < pathA.length; idx++) {
    // Only show a handful of evenly-spaced steps to keep it concise
    if (pathA.length > 6 && idx % Math.ceil(pathA.length / 6) !== 0 && idx !== pathA.length - 1) continue;
    const [ar, ac] = pathA[idx];
    const [br, bc] = pathB[idx];
    const t = ar + ac;
    const hl = ac === bc ? [[ar, ac]] : [[ar, ac], [br, bc]];

    steps.push({
      title: { vi: `t=${t}: A(${ar},${ac}) B(${br},${bc})`, en: `t=${t}: A(${ar},${ac}) B(${br},${bc})` },
      arr: [],
      grid: makeGrid(hl, pathA.slice(0, idx + 1)),
      highlight: [],
      mark: [],
      codeLines: [9, 10, 11, 12, 13, 14],
      vars: [
        { name: "t (step)", value: t },
        { name: "walker A", value: `(${ar}, ${ac}) = ${grid[ar][ac] === -1 ? "✗" : grid[ar][ac]}` },
        { name: "walker B", value: `(${br}, ${bc}) = ${grid[br][bc] === -1 ? "✗" : grid[br][bc]}` },
        { name: "same cell?", value: ac === bc },
      ],
      note: {
        vi:
          `Bước t=${t}: A ở (${ar},${ac}), B ở (${br},${bc}).\n` +
          (ac === bc
            ? `Hai người cùng ô → chỉ tính anh đào 1 lần.`
            : `Hai người khác ô → cộng anh đào của cả hai.`),
        en:
          `Step t=${t}: A at (${ar},${ac}), B at (${br},${bc}).\n` +
          (ac === bc
            ? `Both on same cell → count cherry once.`
            : `Different cells → add cherries from both.`),
      },
    });
  }

  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: [],
    grid: makeGrid([], pathA),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [15],
    vars: [
      { name: "answer", value: answer },
      { name: "states memoized", value: memo.size },
    ],
    note: {
      vi:
        `Số anh đào tối đa nhặt được = ${answer}.\n` +
        (raw === NEG ? "(Không có đường đi hợp lệ → 0)" : `Đã memo ${memo.size} trạng thái (c1, c2 theo từng t).`),
      en:
        `Maximum cherries collected = ${answer}.\n` +
        (raw === NEG ? "(No valid path → 0)" : `Memoized ${memo.size} states.`),
    },
  });

  return { original: grid, answer, steps };
}

/**
 * LeetCode 931: Minimum Falling Path Sum.
 * dp[r][c] = matrix[r][c] + min(dp[r-1][c-1], dp[r-1][c], dp[r-1][c+1]).
 * First row = matrix first row. Answer = min of last row.
 */
function buildSteps931(input) {
  let matrix;
  if (typeof input === "string") {
    matrix = input.split("|").map((row) => row.split(",").map(Number));
  } else {
    return { original: input, answer: 0, steps: [] };
  }
  const m = matrix.length;
  const n = matrix[0].length;
  const dp = matrix.map((row) => [...row]);
  const steps = [];

  function gridSnap(opts) {
    steps.push({
      title: opts.title, arr: [],
      grid: { dp: dp.map((r) => [...r]), text1: Array.from({length: m}, (_, i) => String(i)).join(""), text2: Array.from({length: n}, (_, i) => String(i)).join(""), hlCell: opts.hlCell || null, pathCells: opts.pathCells || [] },
      highlight: [], mark: [], codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note,
    });
  }

  gridSnap({
    title: { vi: "Khởi tạo (hàng đầu)", en: "Initialize (first row)" },
    codeLines: [3, 4],
    vars: [{ name: "m", value: m }, { name: "n", value: n }],
    note: { vi: `Lưới ${m}×${n}. Hàng đầu giữ nguyên.\ndp[r][c] = matrix[r][c] + min(dp[r-1][c-1], dp[r-1][c], dp[r-1][c+1]).\nĐáp án = min(hàng cuối).`, en: `Grid ${m}×${n}. First row unchanged.\ndp[r][c] = matrix[r][c] + min(dp[r-1][c-1], dp[r-1][c], dp[r-1][c+1]).\nAnswer = min(last row).` },
  });

  for (let r = 1; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const candidates = [];
      if (c > 0) candidates.push(dp[r - 1][c - 1]);
      candidates.push(dp[r - 1][c]);
      if (c < n - 1) candidates.push(dp[r - 1][c + 1]);
      dp[r][c] = matrix[r][c] + Math.min(...candidates);

      if (m * n <= 25 || c === 0 || c === n - 1 || (r === m - 1)) {
        gridSnap({
          title: { vi: `dp[${r}][${c}]`, en: `dp[${r}][${c}]` },
          hlCell: [r, c], codeLines: [5, 6, 7],
          vars: [{ name: "r", value: r }, { name: "c", value: c }, { name: "matrix[r][c]", value: matrix[r][c] }, { name: "min above", value: Math.min(...candidates) }, { name: "dp[r][c]", value: dp[r][c] }],
          note: { vi: `dp[${r}][${c}] = ${matrix[r][c]} + min(${candidates.join(",")}) = ${dp[r][c]}.`, en: `dp[${r}][${c}] = ${matrix[r][c]} + min(${candidates.join(",")}) = ${dp[r][c]}.` },
        });
      }
    }
  }

  const lastRow = dp[m - 1];
  const answer = Math.min(...lastRow);
  const bestCol = lastRow.indexOf(answer);
  // Trace back
  const pathCells = [[m - 1, bestCol]];
  let pc = bestCol;
  for (let r = m - 1; r > 0; r--) {
    const cands = [];
    if (pc > 0) cands.push([dp[r - 1][pc - 1], pc - 1]);
    cands.push([dp[r - 1][pc], pc]);
    if (pc < n - 1) cands.push([dp[r - 1][pc + 1], pc + 1]);
    cands.sort((a, b) => a[0] - b[0]);
    pc = cands[0][1];
    pathCells.push([r - 1, pc]);
  }
  pathCells.reverse();

  gridSnap({
    title: { vi: "Kết quả", en: "Result" }, hlCell: null, pathCells, codeLines: [8],
    vars: [{ name: "answer", value: answer }, { name: "path", value: pathCells.map(([r, c]) => matrix[r][c]).join("+") + "=" + answer }],
    note: { vi: `Min falling path = ${answer}. Đường: ${pathCells.map(([r, c]) => matrix[r][c]).join("+")} = ${answer}.`, en: `Min falling path = ${answer}. Path: ${pathCells.map(([r, c]) => matrix[r][c]).join("+")} = ${answer}.` },
  });
  steps[steps.length - 1].final = true;
  return { original: matrix, answer, steps };
}

/**
 * LeetCode 72: Edit Distance (Levenshtein).
 * dp[i][j] = min operations to convert word1[0..i-1] to word2[0..j-1].
 * If word1[i-1] == word2[j-1]: dp[i][j] = dp[i-1][j-1] (no op).
 * Else: dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]).
 */
function buildSteps72(input, params) {
  const word1 = typeof input === "string" ? input : String(input);
  const word2 = (params.word2 || "").trim();
  const m = word1.length;
  const n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const steps = [];

  // Base cases
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  function gridSnap(opts) {
    steps.push({
      title: opts.title, arr: [],
      grid: { dp: dp.map((r) => [...r]), text1: word1, text2: word2, hlCell: opts.hlCell || null, pathCells: opts.pathCells || [] },
      highlight: [], mark: [], codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note,
    });
  }

  gridSnap({
    title: { vi: "Khởi tạo", en: "Initialize" }, codeLines: [3, 4, 5],
    vars: [{ name: "word1", value: word1 }, { name: "word2", value: word2 }],
    note: { vi: `dp[i][j] = min ops chuyển word1[0..i-1] → word2[0..j-1].\nBase: dp[i][0]=i (xóa i ký tự), dp[0][j]=j (chèn j ký tự).\nMatch: dp[i-1][j-1]. Else: 1+min(replace, delete, insert).`, en: `dp[i][j] = min ops to convert word1[0..i-1] → word2[0..j-1].\nBase: dp[i][0]=i (delete i), dp[0][j]=j (insert j).\nMatch: dp[i-1][j-1]. Else: 1+min(replace, delete, insert).` },
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
      const match = word1[i - 1] === word2[j - 1];

      if (m * n <= 30 || i === m && j === n) {
        gridSnap({
          title: { vi: `dp[${i}][${j}]: '${word1[i-1]}' vs '${word2[j-1]}'`, en: `dp[${i}][${j}]: '${word1[i-1]}' vs '${word2[j-1]}'` },
          hlCell: [i, j], codeLines: match ? [6, 7] : [8, 9],
          vars: [
            { name: "i", value: i }, { name: "j", value: j },
            { name: "match", value: match ? "yes (free)" : "no" },
            { name: "dp[i][j]", value: dp[i][j] },
            { name: "op", value: match ? "none" : `1+min(repl=${dp[i-1][j-1]},del=${dp[i-1][j]},ins=${dp[i][j-1]})` },
          ],
          note: match
            ? { vi: `'${word1[i-1]}'=='${word2[j-1]}' → dp[${i}][${j}] = dp[${i-1}][${j-1}] = ${dp[i][j]} (miễn phí).`, en: `'${word1[i-1]}'=='${word2[j-1]}' → dp[${i}][${j}] = dp[${i-1}][${j-1}] = ${dp[i][j]} (free).` }
            : { vi: `'${word1[i-1]}'≠'${word2[j-1]}' → 1+min(${dp[i-1][j-1]},${dp[i-1][j]},${dp[i][j-1]}) = ${dp[i][j]}.`, en: `'${word1[i-1]}'≠'${word2[j-1]}' → 1+min(${dp[i-1][j-1]},${dp[i-1][j]},${dp[i][j-1]}) = ${dp[i][j]}.` },
        });
      }
    }
  }

  const answer = dp[m][n];
  gridSnap({
    title: { vi: "Kết quả", en: "Result" }, hlCell: [m, n], codeLines: [10],
    vars: [{ name: "answer", value: answer }],
    note: { vi: `Edit distance("${word1}", "${word2}") = ${answer} thao tác.`, en: `Edit distance("${word1}", "${word2}") = ${answer} operation(s).` },
  });
  steps[steps.length - 1].final = true;
  return { word1, word2, answer, steps };
}

/**
 * LeetCode 416: Partition Equal Subset Sum.
 * Can we split nums into two subsets with equal sum?
 * Equivalent to: can we find a subset summing to totalSum/2?
 * dp[j] = True if sum j is achievable using some subset.
 * For each num: for j = target..num: dp[j] |= dp[j - num].
 */
function buildSteps416(nums) {
  const steps = [];
  const total = nums.reduce((a, b) => a + b, 0);

  if (total % 2 !== 0) {
    steps.push({
      title: { vi: "Tổng lẻ → False", en: "Odd sum → False" },
      arr: [...nums], highlight: [], mark: [], final: true, codeLines: [3, 4],
      vars: [{ name: "sum", value: total }, { name: "answer", value: false }],
      note: { vi: `Tổng = ${total} (lẻ) → không thể chia đều. False.`, en: `Sum = ${total} (odd) → cannot partition equally. False.` },
    });
    return { original: [...nums], answer: false, steps };
  }

  const target = total / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: dp.map((v) => (v ? 1 : 0)),
    sub: dp.map((_, i) => String(i)),
    highlight: [0], mark: [], codeLines: [3, 4, 5, 6],
    vars: [
      { name: "nums", value: `[${nums.join(",")}]` },
      { name: "sum", value: total },
      { name: "target", value: target },
      { name: "dp[0]", value: true },
      { name: "dp", value: `[${dp.map((v) => v ? "T" : ".").join("")}]` },
    ],
    note: {
      vi: `Tổng = ${total}, target = ${target}. Bài toán: có subset tổng = ${target}?\ndp[j] = True nếu tạo được tổng j.\ndp[0] = True. Với mỗi num: dp[j] |= dp[j-num] (duyệt giảm).`,
      en: `Sum = ${total}, target = ${target}. Problem: is there a subset summing to ${target}?\ndp[j] = True if sum j is achievable.\ndp[0] = True. For each num: dp[j] |= dp[j-num] (iterate backwards).`,
    },
  });

  for (const num of nums) {
    const before = dp.slice();
    const changed = [];
    for (let j = target; j >= num; j--) {
      if (!dp[j] && dp[j - num]) {
        dp[j] = true;
        changed.push(j);
      }
    }

    steps.push({
      title: { vi: `Thêm ${num}`, en: `Add ${num}` },
      arr: dp.map((v) => (v ? 1 : 0)),
      sub: dp.map((_, i) => String(i)),
      highlight: changed,
      mark: dp[target] ? [target] : [],
      codeLines: [7, 8, 9],
      vars: [
        { name: "num", value: num },
        { name: "new sums", value: changed.length > 0 ? `[${changed.join(",")}]` : "none" },
        { name: "dp[target]", value: dp[target] },
        { name: "dp", value: `[${dp.map((v) => v ? "T" : ".").join("")}]` },
      ],
      note: {
        vi: `Xử lý num=${num}: tổng mới đạt được = [${changed.join(",")}].${dp[target] ? ` ✓ Đạt target=${target}!` : ""}`,
        en: `Process num=${num}: newly reachable sums = [${changed.join(",")}].${dp[target] ? ` ✓ Reached target=${target}!` : ""}`,
      },
    });

    if (dp[target]) break; // Early exit
  }

  const answer = dp[target];
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: dp.map((v) => (v ? 1 : 0)),
    sub: dp.map((_, i) => String(i)),
    highlight: [], mark: answer ? [target] : [], final: true, codeLines: [10],
    vars: [{ name: "answer", value: answer }, { name: "target", value: target }, { name: "dp", value: `[${dp.map((v) => v ? "T" : ".").join("")}]` }],
    note: {
      vi: answer ? `dp[${target}] = True → có thể chia thành 2 tập bằng nhau (mỗi tập tổng ${target}).` : `dp[${target}] = False → không thể chia đều.`,
      en: answer ? `dp[${target}] = True → can partition into two equal subsets (each sum ${target}).` : `dp[${target}] = False → cannot partition equally.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 1301: Number of Paths with Max Score.
 *
 * Grid characters:
 *   'S' = start (bottom-right, does NOT contribute to score)
 *   'E' = end   (top-left, does NOT contribute to score)
 *   'X' = obstacle (unreachable)
 *   '0'..'9' = digit added to the score when you step on that cell
 *
 * You move from S toward E going UP, LEFT, or UP-LEFT (diagonally). Both the
 * max total score and the number of paths that achieve it must be reported
 * (mod 1e9+7). If E is unreachable, return [0, 0].
 *
 * DP filled bottom-right → top-left:
 *   dp[r][c]  = max score to reach (r, c) starting from S
 *   cnt[r][c] = number of ways to reach (r, c) achieving dp[r][c]
 * From cell (r, c) you can come from (r+1, c), (r, c+1), or (r+1, c+1).
 */
function buildSteps1301(input) {
  const MOD = 1_000_000_007;
  // Parse: rows separated by |, cells run together ("E23|2X2|12S") or
  // separated by commas ("E,2,3|2,X,2|1,2,S"). Trim whitespace.
  const rawRows = String(input || "").split("|").map((r) => r.trim()).filter(Boolean);
  const board = rawRows.map((row) => {
    const cells = row.includes(",") ? row.split(",").map((s) => s.trim()) : row.split("");
    return cells.map((s) => s.replace(/^["']|["']$/g, ""));
  });

  const steps = [];

  const rows = board.length;
  const cols = rows > 0 ? board[0].length : 0;

  function invalid() {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeLines: [3, 4, 5],
      vars: [{ name: "answer", value: [0, 0] }],
      note: {
        vi: "Grid phải là hình chữ nhật, có đúng 1 ô 'E' (trên-trái) và 1 ô 'S' (dưới-phải). Ví dụ: E23|2X2|12S",
        en: "Grid must be rectangular with exactly one 'E' (top-left) and one 'S' (bottom-right). Example: E23|2X2|12S",
      },
    });
    return { original: board, answer: [0, 0], steps };
  }

  if (rows === 0 || cols === 0 || board.some((row) => row.length !== cols)) return invalid();
  if (board[0][0] !== "E" || board[rows - 1][cols - 1] !== "S") return invalid();

  // dp[r][c]/cnt[r][c] — dp = -1 means unreachable.
  const dp = Array.from({ length: rows }, () => Array(cols).fill(-1));
  const cnt = Array.from({ length: rows }, () => Array(cols).fill(0));
  dp[rows - 1][cols - 1] = 0;
  cnt[rows - 1][cols - 1] = 1;

  function cellLabel(r, c) {
    const raw = board[r][c];
    if (raw === "X") return "■";
    const s = dp[r][c];
    const k = cnt[r][c];
    if (s < 0) return raw; // unreached
    return `${raw}\n${s}|${k}`;
  }

  function cellClass(r, c, currentR, currentC, hlPreds) {
    const raw = board[r][c];
    if (raw === "X") return "wall";
    if (r === currentR && c === currentC) return "current";
    if (hlPreds && hlPreds.some(([pr, pc]) => pr === r && pc === c)) return "queued";
    if (raw === "S") return "start";
    if (raw === "E") return "end";
    if (dp[r][c] >= 0) return "visited";
    return "empty";
  }

  function pushStep({ title, currentR, currentC, hlPreds, codeLines, vars, note, final }) {
    const cells = board.map((row, r) =>
      row.map((_, c) => ({ label: cellLabel(r, c), cls: cellClass(r, c, currentR, currentC, hlPreds) }))
    );
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, cells },
      highlight: [],
      mark: [],
      final: !!final,
      codeLines: codeLines || [],
      vars: vars || [],
      note,
    });
  }

  pushStep({
    title: { vi: "Khởi tạo (S = 0, 1 cách)", en: "Initialize (S = 0 score, 1 way)" },
    currentR: rows - 1, currentC: cols - 1,
    codeLines: [3, 4, 5],
    vars: [
      { name: "start (S)", value: `(${rows - 1},${cols - 1})` },
      { name: "end (E)", value: "(0,0)" },
      { name: "dp[S]", value: 0 },
      { name: "cnt[S]", value: 1 },
    ],
    note: {
      vi:
        `Bắt đầu ở S=(${rows - 1},${cols - 1}) với dp=0, cnt=1. Điền bảng theo thứ tự ngược ` +
        `(dưới-phải → trên-trái). Từ mỗi ô (r,c), ba tiền nhiệm khả dĩ là (r+1,c), (r,c+1), (r+1,c+1). ` +
        `dp[r][c] = max các dp tiền nhiệm + digit tại (r,c); cnt = tổng cnt của tiền nhiệm đạt max đó.`,
      en:
        `Start at S=(${rows - 1},${cols - 1}) with dp=0, cnt=1. Fill the table in reverse order ` +
        `(bottom-right → top-left). For each cell (r,c) the three possible predecessors are (r+1,c), (r,c+1), (r+1,c+1). ` +
        `dp[r][c] = max of predecessor dp + digit at (r,c); cnt = sum of cnts of predecessors achieving that max.`,
    },
  });

  // Walk cells in reverse row-major order (skip S itself).
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = cols - 1; c >= 0; c--) {
      if (r === rows - 1 && c === cols - 1) continue;
      const raw = board[r][c];
      if (raw === "X") continue;

      const preds = [];
      if (r + 1 < rows) preds.push([r + 1, c, "↓"]);
      if (c + 1 < cols) preds.push([r, c + 1, "→"]);
      if (r + 1 < rows && c + 1 < cols) preds.push([r + 1, c + 1, "↘"]);

      let best = -1;
      let ways = 0;
      const contribs = []; // {pr,pc,arrow,score,count,used}

      for (const [pr, pc, arrow] of preds) {
        const s = dp[pr][pc];
        const k = cnt[pr][pc];
        contribs.push({ pr, pc, arrow, score: s, count: k, used: false });
        if (s < 0) continue;
        if (s > best) {
          best = s;
          ways = k;
        } else if (s === best) {
          ways = (ways + k) % MOD;
        }
      }
      contribs.forEach((c2) => {
        c2.used = c2.score === best && best >= 0;
      });

      if (best < 0) {
        // Unreachable from S
        pushStep({
          title: { vi: `(${r},${c}): không đến được`, en: `(${r},${c}): unreachable` },
          currentR: r, currentC: c,
          hlPreds: preds.map(([pr, pc]) => [pr, pc]),
          codeLines: [7, 8, 9, 10],
          vars: [
            { name: "cell", value: `(${r},${c})` },
            { name: "char", value: raw },
            { name: "predecessors", value: contribs.map((x) => `${x.arrow}(${x.pr},${x.pc})=${x.score}|${x.count}`).join(" ") },
            { name: "dp[r][c]", value: -1 },
            { name: "cnt[r][c]", value: 0 },
          ],
          note: {
            vi: `Không có tiền nhiệm nào đến được (tất cả đều -1). (${r},${c}) không đạt được từ S.`,
            en: `No predecessor is reachable (all -1). (${r},${c}) is unreachable from S.`,
          },
        });
        continue;
      }

      const digit = /^[0-9]$/.test(raw) ? Number(raw) : 0;
      dp[r][c] = best + digit;
      cnt[r][c] = ways;

      pushStep({
        title: { vi: `dp[${r}][${c}] = ${dp[r][c]}, cnt = ${cnt[r][c]}`, en: `dp[${r}][${c}] = ${dp[r][c]}, cnt = ${cnt[r][c]}` },
        currentR: r, currentC: c,
        hlPreds: preds.map(([pr, pc]) => [pr, pc]),
        codeLines: [11, 12, 13, 14, 15, 16],
        vars: [
          { name: "cell", value: `(${r},${c})` },
          { name: "char", value: raw },
          { name: "digit", value: digit },
          { name: "predecessors (score|cnt)", value: contribs.map((x) => `${x.arrow}${x.score < 0 ? "×" : ""}${x.score}|${x.count}${x.used ? "*" : ""}`).join(" ") },
          { name: "max predecessor score", value: best },
          { name: "combined cnt", value: ways },
          { name: "dp[r][c]", value: dp[r][c] },
          { name: "cnt[r][c]", value: cnt[r][c] },
        ],
        note: {
          vi:
            `Ký tự '${raw}' (digit=${digit}). Xét ${preds.length} tiền nhiệm: ` +
            contribs.map((x) => `${x.arrow}(${x.pr},${x.pc})=score ${x.score}${x.score < 0 ? " (bỏ)" : ""}, cnt ${x.count}`).join("; ") +
            `. Max score tiền nhiệm = ${best}, tổng cnt đạt max = ${ways}. ` +
            `Vậy dp[${r}][${c}] = ${best} + ${digit} = ${dp[r][c]}, cnt = ${ways}.`,
          en:
            `Char '${raw}' (digit=${digit}). ${preds.length} predecessors: ` +
            contribs.map((x) => `${x.arrow}(${x.pr},${x.pc})=score ${x.score}${x.score < 0 ? " (skip)" : ""}, cnt ${x.count}`).join("; ") +
            `. Max predecessor score = ${best}, combined cnt = ${ways}. ` +
            `So dp[${r}][${c}] = ${best} + ${digit} = ${dp[r][c]}, cnt = ${ways}.`,
        },
      });
    }
  }

  const finalScore = dp[0][0];
  const finalCnt = cnt[0][0];
  const reachable = finalScore >= 0 && finalCnt > 0;
  const answer = reachable ? [finalScore, finalCnt] : [0, 0];

  pushStep({
    title: { vi: "Kết quả", en: "Result" },
    currentR: 0, currentC: 0,
    codeLines: [17, 18],
    vars: [
      { name: "dp[0][0]", value: finalScore },
      { name: "cnt[0][0]", value: finalCnt },
      { name: "answer", value: `[${answer[0]}, ${answer[1]}]` },
    ],
    note: {
      vi: reachable
        ? `E đến được với điểm tối đa = ${finalScore}, số đường đạt điểm đó = ${finalCnt} (mod 1e9+7).`
        : `E không đến được từ S → trả về [0, 0].`,
      en: reachable
        ? `E is reachable with max score = ${finalScore}, number of paths = ${finalCnt} (mod 1e9+7).`
        : `E is unreachable from S → return [0, 0].`,
    },
    final: true,
  });

  return { original: board, answer, steps };
}

/**
 * LeetCode 1388: Pizza With 3n Slices.
 *
 * You have a circular pizza with 3n slices. Each round:
 *   1. You pick any remaining slice.
 *   2. Alice takes the slice next to yours in anti-clockwise direction.
 *   3. Bob takes the slice next to yours in clockwise direction.
 *   4. Repeat until nothing left. You get n slices total.
 *
 * KEY INSIGHT: the greedy "you pick, they pick neighbours" rule means the n
 * slices you end up with must all be non-adjacent in the original circle.
 * So the problem is:
 *   Pick n non-adjacent slices from a circular array of 3n to maximise sum.
 *
 * Circular → the standard trick: run the linear version twice
 *   maxPick(slices[0..3n-2], n)  // consider first, drop last
 *   maxPick(slices[1..3n-1], n)  // drop first, consider last
 * and take the max, so we never pick both endpoints of the original circle.
 *
 * Linear DP:
 *   dp[i][j] = max sum choosing j non-adjacent elements from arr[0..i]
 *   dp[i][j] = max(dp[i-1][j],                 # skip arr[i]
 *                  dp[i-2][j-1] + arr[i])      # take arr[i]
 * Base: dp[-1][*] = 0, dp[*][0] = 0.
 * Answer of one pass = dp[len(arr)-1][n].
 */
function buildSteps1388(slices) {
  const total = slices.length;
  const n = Math.floor(total / 3);
  const steps = [];

  // Validation
  if (total === 0 || total % 3 !== 0) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [...slices],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Số miếng phải là bội của 3 (bài yêu cầu 3n miếng).",
        en: "Slice count must be a multiple of 3 (problem states 3n slices).",
      },
    });
    return { original: [...slices], answer: 0, steps };
  }

  // --- Intro ---
  steps.push({
    title: { vi: "Ý tưởng", en: "Idea" },
    arr: [...slices],
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5, 6, 7],
    vars: [
      { name: "total slices", value: total },
      { name: "n = total/3", value: n },
    ],
    note: {
      vi:
        `Bạn được ${n} miếng trong ${total} = 3n miếng. Do Alice/Bob luôn ăn 2 miếng kề, ` +
        `${n} miếng của bạn phải không kề nhau trong vòng tròn ban đầu. ` +
        `Vòng tròn → chạy 2 lần bài tuyến tính: bỏ miếng cuối, và bỏ miếng đầu, lấy max.`,
      en:
        `You get ${n} slices out of ${total} = 3n. Because Alice/Bob always take the two neighbours, ` +
        `your ${n} slices must be non-adjacent in the original circle. ` +
        `Circular → run the linear version twice: drop last slice, then drop first, take the max.`,
    },
  });

  // --- Linear pass helper ---
  // Returns { best, picks } where picks[] is the indices (into arr) that were chosen.
  function linearPass(arr, passLabel, offset) {
    const m = arr.length;
    // dp[i][j] = max sum picking j non-adjacent from arr[0..i-1]. dp has m+1 rows.
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    // Pass intro
    steps.push({
      title: { vi: `${passLabel}: khởi tạo`, en: `${passLabel}: initialize` },
      arr: [...slices],
      highlight: arr.map((_, k) => k + offset),
      mark: [],
      codeLines: [10, 11, 12],
      vars: [
        { name: "pass", value: passLabel },
        { name: "sub-array length", value: m },
        { name: "pick n", value: n },
      ],
      note: {
        vi: `${passLabel}: xét mảng con dài ${m}, cần chọn ${n} phần tử không kề nhau để tổng lớn nhất.`,
        en: `${passLabel}: work on a subarray of length ${m}, pick ${n} non-adjacent elements to maximise the sum.`,
      },
    });

    // Fill DP with per-cell steps only for small grids; otherwise per-row.
    const cellCap = 40; // cap the number of "compute" steps per pass
    let cellStepsPushed = 0;
    for (let i = 1; i <= m; i++) {
      const val = arr[i - 1];
      for (let j = 1; j <= n; j++) {
        const skip = dp[i - 1][j];
        const take = i >= 2 ? dp[i - 2][j - 1] + val : (j === 1 ? val : -Infinity);
        // For j=1 and i=1, taking is fine (0 + val = val)
        const takeVal = i === 1 ? (j === 1 ? val : -Infinity) : dp[i - 2][j - 1] + val;
        dp[i][j] = Math.max(skip, takeVal);

        if (cellStepsPushed < cellCap && (i <= 4 || i >= m - 1 || j === n)) {
          const chose = takeVal > skip ? "take" : "skip";
          steps.push({
            title: { vi: `${passLabel}: dp[${i}][${j}]`, en: `${passLabel}: dp[${i}][${j}]` },
            arr: [...slices],
            highlight: [i - 1 + offset],
            mark: [],
            codeLines: [13, 14, 15, 16],
            vars: [
              { name: "i (in pass)", value: i },
              { name: "j", value: j },
              { name: "arr[i-1]", value: val },
              { name: "skip = dp[i-1][j]", value: skip },
              { name: "take = dp[i-2][j-1] + arr[i-1]", value: Number.isFinite(takeVal) ? takeVal : "-∞" },
              { name: "dp[i][j]", value: dp[i][j] },
              { name: "decision", value: chose },
            ],
            note: {
              vi:
                `dp[${i}][${j}] = max(skip=${skip}, take=${Number.isFinite(takeVal) ? takeVal : "-∞"}) = ${dp[i][j]}. ` +
                `${chose === "take" ? `Cướp miếng thứ ${i - 1} (giá trị ${val}).` : "Bỏ miếng này."}`,
              en:
                `dp[${i}][${j}] = max(skip=${skip}, take=${Number.isFinite(takeVal) ? takeVal : "-∞"}) = ${dp[i][j]}. ` +
                `${chose === "take" ? `Pick element ${i - 1} (value ${val}).` : "Skip this element."}`,
            },
          });
          cellStepsPushed += 1;
        }
      }
    }

    const best = dp[m][n];

    // Trace back which indices were picked
    const picks = [];
    let ci = m;
    let cj = n;
    while (ci > 0 && cj > 0) {
      const skip = dp[ci - 1][cj];
      const takeVal = ci >= 2 ? dp[ci - 2][cj - 1] + arr[ci - 1] : (cj === 1 ? arr[ci - 1] : -Infinity);
      if (takeVal >= skip) {
        // pick arr[ci-1] (index offset within the sub-array + offset in original)
        picks.push(ci - 1);
        ci -= 2;
        cj -= 1;
      } else {
        ci -= 1;
      }
    }
    picks.reverse();

    steps.push({
      title: { vi: `${passLabel}: kết quả`, en: `${passLabel}: result` },
      arr: [...slices],
      highlight: [],
      mark: picks.map((k) => k + offset),
      codeLines: [17, 18],
      vars: [
        { name: "pass", value: passLabel },
        { name: "picks (original indices)", value: picks.map((k) => k + offset).join(",") },
        { name: "best sum", value: best },
      ],
      note: {
        vi: `${passLabel} chọn ${picks.length} miếng ở vị trí gốc [${picks.map((k) => k + offset).join(", ")}], tổng = ${best}.`,
        en: `${passLabel} picks ${picks.length} slices at original indices [${picks.map((k) => k + offset).join(", ")}], sum = ${best}.`,
      },
    });

    return { best, picks: picks.map((k) => k + offset) };
  }

  // --- Pass A: drop last slice ---
  const passA = linearPass(slices.slice(0, total - 1), "Pass A (drop last)", 0);
  // --- Pass B: drop first slice ---
  const passB = linearPass(slices.slice(1), "Pass B (drop first)", 1);

  const answer = Math.max(passA.best, passB.best);
  const winnerPicks = passA.best >= passB.best ? passA.picks : passB.picks;
  const winnerLabel = passA.best >= passB.best ? "A" : "B";

  steps.push({
    title: { vi: "Kết quả cuối", en: "Final result" },
    arr: [...slices],
    highlight: [],
    mark: winnerPicks,
    final: true,
    codeLines: [19, 20],
    vars: [
      { name: "pass A best", value: passA.best },
      { name: "pass B best", value: passB.best },
      { name: "winner", value: `Pass ${winnerLabel}` },
      { name: "answer", value: answer },
    ],
    note: {
      vi:
        `Đáp án = max(Pass A = ${passA.best}, Pass B = ${passB.best}) = ${answer}. ` +
        `Chọn từ Pass ${winnerLabel}: miếng tại vị trí gốc [${winnerPicks.join(", ")}].`,
      en:
        `Answer = max(Pass A = ${passA.best}, Pass B = ${passB.best}) = ${answer}. ` +
        `Winning picks from Pass ${winnerLabel}: original indices [${winnerPicks.join(", ")}].`,
    },
  });

  return { original: [...slices], answer, steps };
}

/**
 * LeetCode 494: Target Sum.
 *
 * Assign '+' or '−' to each element of nums so the signed sum equals target.
 * Return the count of such assignments.
 *
 * REDUCTION → subset sum:
 *   Let P = subset chosen with '+' sign, N = subset chosen with '−' sign.
 *   P + N = total = sum(nums)  and  P − N = target
 *   ⇒ P = (total + target) / 2
 *
 * Answer = number of subsets of nums summing to P.
 * Feasibility: (total + target) must be non-negative and even,
 *              and |target| ≤ total.
 *
 * 1D DP (same shape as bài 416 / 518):
 *   dp[j] = number of subsets summing to j
 *   dp[0] = 1
 *   for num in nums:
 *       for j in range(P, num-1, -1):     # iterate DOWN to reuse dp[j-num]
 *           dp[j] += dp[j - num]
 */
function buildSteps494(nums, params) {
  const target = params && Number.isFinite(Number(params.target)) ? Number(params.target) : 3;
  const steps = [];
  const total = nums.reduce((a, b) => a + b, 0);

  // ── Feasibility check ───────────────────────────────────
  if (Math.abs(target) > total || ((total + target) % 2 !== 0)) {
    const reason = Math.abs(target) > total
      ? `|target| = ${Math.abs(target)} > total = ${total}`
      : `(total + target) = ${total + target} là số lẻ, không chia đôi được`;
    steps.push({
      title: { vi: "Không khả thi", en: "Infeasible" },
      arr: [...nums],
      highlight: [], mark: [],
      final: true, codeLines: [3, 4],
      vars: [
        { name: "total", value: total },
        { name: "target", value: target },
        { name: "answer", value: 0 },
      ],
      note: {
        vi: `${reason}. Không tồn tại cách gán → 0.`,
        en: `${reason.replace("là số lẻ, không chia đôi được", "is odd, cannot be halved")}. No assignment exists → 0.`,
      },
    });
    return { original: [...nums], answer: 0, steps };
  }

  const P = (total + target) / 2;

  // ── Intro / reduction ───────────────────────────────────
  steps.push({
    title: { vi: "Đưa về subset sum", en: "Reduce to subset sum" },
    arr: [...nums],
    highlight: [], mark: [],
    codeLines: [3, 4, 5, 6],
    vars: [
      { name: "nums", value: `[${nums.join(",")}]` },
      { name: "target", value: target },
      { name: "total = sum(nums)", value: total },
      { name: "P = (total + target)/2", value: P },
    ],
    note: {
      vi:
        `Đặt P = subset chọn dấu '+', N = subset chọn dấu '−'.\n` +
        `P + N = ${total} và P − N = ${target} ⇒ P = ${P}.\n` +
        `Câu hỏi trở thành: đếm số subset của nums có tổng = ${P}.`,
      en:
        `Let P = subset assigned '+', N = subset assigned '−'.\n` +
        `P + N = ${total} and P − N = ${target} ⇒ P = ${P}.\n` +
        `The problem becomes: count subsets of nums that sum to ${P}.`,
    },
  });

  // ── DP init ─────────────────────────────────────────────
  const dp = new Array(P + 1).fill(0);
  dp[0] = 1;

  steps.push({
    title: { vi: "Khởi tạo DP", en: "Initialize DP" },
    arr: dp.slice(),
    sub: dp.map((_, i) => String(i)),
    highlight: [0], mark: [],
    codeLines: [7, 8],
    vars: [
      { name: "P", value: P },
      { name: "dp[0]", value: 1 },
      { name: "dp", value: `[${dp.join(",")}]` },
    ],
    note: {
      vi:
        `dp[j] = số subset của các phần tử đã xét có tổng = j.\n` +
        `dp[0] = 1 (subset rỗng có tổng 0).\n` +
        `Với mỗi num, duyệt j từ P xuống num: dp[j] += dp[j - num] (0/1 knapsack: mỗi phần tử dùng ≤ 1 lần).`,
      en:
        `dp[j] = number of subsets (of elements processed so far) summing to j.\n` +
        `dp[0] = 1 (the empty subset sums to 0).\n` +
        `For each num, iterate j from P down to num: dp[j] += dp[j - num] (0/1 knapsack — each element used at most once).`,
    },
  });

  // ── Process each num ────────────────────────────────────
  for (const num of nums) {
    const before = dp.slice();
    // Iterate j downward so each num is used at most once (0/1 knapsack)
    const updatedIdx = [];
    for (let j = P; j >= num; j--) {
      const added = dp[j - num];
      if (added > 0) {
        dp[j] += added;
        updatedIdx.push(j);
      }
    }

    steps.push({
      title: { vi: `Thêm num = ${num}`, en: `Add num = ${num}` },
      arr: dp.slice(),
      sub: dp.map((_, i) => String(i)),
      highlight: updatedIdx,
      mark: [],
      codeLines: [9, 10, 11, 12],
      vars: [
        { name: "num", value: num },
        { name: "dp (before)", value: `[${before.join(",")}]` },
        { name: "dp (after)", value: `[${dp.join(",")}]` },
        { name: "cells changed", value: updatedIdx.join(",") || "(none)" },
      ],
      note: {
        vi:
          `Xử lý num = ${num}: dp[j] += dp[j − ${num}] cho j từ ${P} xuống ${num} (duyệt ngược để không dùng lại num).\n` +
          `Ô thay đổi: [${updatedIdx.join(", ")}]. Sau khi thêm: dp = [${dp.join(", ")}].`,
        en:
          `Process num = ${num}: dp[j] += dp[j − ${num}] for j from ${P} down to ${num} (downward to avoid reusing num).\n` +
          `Changed cells: [${updatedIdx.join(", ")}]. After: dp = [${dp.join(", ")}].`,
      },
    });
  }

  const answer = dp[P];
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: dp.slice(),
    sub: dp.map((_, i) => String(i)),
    highlight: [], mark: [P], final: true, codeLines: [13],
    vars: [
      { name: "dp", value: `[${dp.join(",")}]` },
      { name: "dp[P]", value: answer },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Số subset có tổng = ${P} = dp[${P}] = ${answer}. Đó cũng là số cách gán dấu ± để tổng = ${target}.`,
      en: `Number of subsets summing to ${P} = dp[${P}] = ${answer}. This equals the number of ± assignments totalling ${target}.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 1463: Cherry Pickup II.
 * 2 robots on a grid. Robot1 starts at (0,0), Robot2 at (0,cols-1).
 * Move row-by-row (down-left, down, down-right). Maximize total cherries.
 * dp[r][c1][c2] = max cherries collected starting from row r with positions (c1, c2).
 */
function buildSteps1463(input) {
  const grid = String(input).split(";").map((row) => row.split(",").map((s) => Number(s.trim())));
  const rows = grid.length, cols = grid[0].length;
  const steps = [];

  // DP bottom-up: dp[c1][c2] = max cherries from current row down
  let dp = Array.from({ length: cols }, () => new Array(cols).fill(0));
  let prev = Array.from({ length: cols }, () => new Array(cols).fill(0));

  // Grid snapshot for renderGrid
  function gridSnap(title, note, r, c1, c2, path1, path2, vars, codeLines) {
    // Build dp 2D as grid.dp for display, with column headers as indices
    const gDp = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push(grid[i][j]);
      }
      gDp.push(row);
    }
    const text1 = Array.from({ length: rows }, (_, i) => String(i));
    const text2 = Array.from({ length: cols }, (_, j) => String(j));
    const hlCells = [];
    if (r >= 0) { hlCells.push([r, c1]); if (c1 !== c2) hlCells.push([r, c2]); }
    const pathCells = [];
    path1.forEach((p) => pathCells.push(p));
    path2.forEach((p) => pathCells.push(p));

    return {
      title,
      arr: [],
      grid: { dp: gDp, text1, text2, hlCell: hlCells.length > 0 ? hlCells[0] : null, pathCells },
      highlight: [], mark: [],
      codeLines: codeLines || [],
      vars: vars || [],
      note,
    };
  }

  // Intro step
  const gridStr = grid.map((r) => `[${r.join(",")}]`).join(" ");
  steps.push(gridSnap(
    { vi: "Cherry Pickup II: 2 robots trên grid", en: "Cherry Pickup II: 2 robots on grid" },
    {
      vi:
        `Grid ${rows}×${cols}. Robot 1 bắt đầu tại (0, 0), Robot 2 tại (0, ${cols - 1}).\n` +
        `Cả 2 di chuyển ĐỒNG THỜI xuống mỗi bước (↙, ↓, ↘). Thu cherry tại ô đi qua.\n` +
        `Nếu cùng ô thì chỉ thu 1 lần.\n\n` +
        `DP 3D: dp[r][c1][c2] = max cherry từ hàng r trở xuống khi robot ở (c1, c2).\n` +
        `Tính bottom-up (từ hàng cuối lên).`,
      en:
        `Grid ${rows}×${cols}. Robot 1 starts at (0, 0), Robot 2 at (0, ${cols - 1}).\n` +
        `Both move SIMULTANEOUSLY down one row per step (↙, ↓, ↘). Collect cherries at visited cells.\n` +
        `If both visit the same cell, only collect once.\n\n` +
        `3D DP: dp[r][c1][c2] = max cherries from row r down when robots are at columns (c1, c2).\n` +
        `Computed bottom-up (from the last row upward).`,
    },
    -1, -1, -1, [], [],
    [{ name: "rows", value: rows }, { name: "cols", value: cols }, { name: "grid", value: gridStr }],
    [2, 3, 4]
  ));

  // Bottom-up DP
  for (let r = rows - 1; r >= 0; r--) {
    const cur = Array.from({ length: cols }, () => new Array(cols).fill(0));
    for (let c1 = 0; c1 < cols; c1++) {
      for (let c2 = c1; c2 < cols; c2++) {
        const cherries = c1 === c2 ? grid[r][c1] : grid[r][c1] + grid[r][c2];
        let best = 0;
        if (r < rows - 1) {
          for (const dc1 of [-1, 0, 1]) {
            for (const dc2 of [-1, 0, 1]) {
              const nc1 = c1 + dc1, nc2 = c2 + dc2;
              if (nc1 >= 0 && nc1 < cols && nc2 >= 0 && nc2 < cols) {
                best = Math.max(best, prev[nc1][nc2]);
              }
            }
          }
        }
        cur[c1][c2] = cherries + best;
        cur[c2][c1] = cur[c1][c2]; // symmetric
      }
    }
    prev = cur;
    dp = cur;

    // Only show a step for a few key rows to keep it concise
    if (r === rows - 1 || r === 0 || r === Math.floor(rows / 2)) {
      steps.push(gridSnap(
        { vi: `Hàng ${r}: dp tính xong`, en: `Row ${r}: dp computed` },
        {
          vi:
            `Hàng ${r}: với mỗi cặp (c1, c2), tính dp[${r}][c1][c2] = grid[${r}][c1] + grid[${r}][c2] + max(dp[${r + 1}][...]).\n` +
            `dp[${r}][0][${cols - 1}] = ${cur[0][cols - 1]}` +
            (r === 0 ? ` ← đây chính là đáp án (robot bắt đầu ở col 0 và col ${cols - 1}).` : `.`),
          en:
            `Row ${r}: for each (c1, c2) pair, dp[${r}][c1][c2] = grid[${r}][c1] + grid[${r}][c2] + max(dp[${r + 1}][...]).\n` +
            `dp[${r}][0][${cols - 1}] = ${cur[0][cols - 1]}` +
            (r === 0 ? ` ← this is the answer (robots start at col 0 and col ${cols - 1}).` : `.`),
        },
        r, 0, cols - 1, [], [],
        [{ name: "row", value: r }, { name: "dp[r][0][cols-1]", value: cur[0][cols - 1] }],
        [6, 7, 8, 9, 10]
      ));
    }
  }

  // Reconstruct path (greedy forward from dp)
  const path1 = [[0, 0]], path2 = [[0, cols - 1]];
  let pc1 = 0, pc2 = cols - 1;

  // Rebuild dp from scratch for path reconstruction
  const fullDp = Array.from({ length: rows }, () => Array.from({ length: cols }, () => new Array(cols).fill(-1)));
  // Fill fullDp bottom-up
  for (let r = rows - 1; r >= 0; r--) {
    for (let c1 = 0; c1 < cols; c1++) {
      for (let c2 = c1; c2 < cols; c2++) {
        const ch = c1 === c2 ? grid[r][c1] : grid[r][c1] + grid[r][c2];
        let best = 0;
        if (r < rows - 1) {
          for (const dc1 of [-1, 0, 1]) for (const dc2 of [-1, 0, 1]) {
            const nc1 = c1 + dc1, nc2 = c2 + dc2;
            if (nc1 >= 0 && nc1 < cols && nc2 >= 0 && nc2 < cols) best = Math.max(best, fullDp[r + 1][nc1][nc2]);
          }
        }
        fullDp[r][c1][c2] = ch + best;
        fullDp[r][c2][c1] = fullDp[r][c1][c2];
      }
    }
  }

  for (let r = 0; r < rows - 1; r++) {
    let bestVal = -1, bc1 = pc1, bc2 = pc2;
    for (const dc1 of [-1, 0, 1]) for (const dc2 of [-1, 0, 1]) {
      const nc1 = pc1 + dc1, nc2 = pc2 + dc2;
      if (nc1 >= 0 && nc1 < cols && nc2 >= 0 && nc2 < cols && fullDp[r + 1][nc1][nc2] > bestVal) {
        bestVal = fullDp[r + 1][nc1][nc2]; bc1 = nc1; bc2 = nc2;
      }
    }
    pc1 = bc1; pc2 = bc2;
    path1.push([r + 1, pc1]); path2.push([r + 1, pc2]);
  }

  const answer = fullDp[0][0][cols - 1];
  const allPath = [...path1, ...path2];
  const fs = gridSnap(
    { vi: `Kết quả: ${answer} cherry`, en: `Result: ${answer} cherries` },
    {
      vi:
        `Max cherry = dp[0][0][${cols - 1}] = ${answer}.\n` +
        `Đường đi Robot 1: ${path1.map((p) => `(${p.join(",")})`).join("→")}\n` +
        `Đường đi Robot 2: ${path2.map((p) => `(${p.join(",")})`).join("→")}`,
      en:
        `Max cherries = dp[0][0][${cols - 1}] = ${answer}.\n` +
        `Robot 1 path: ${path1.map((p) => `(${p.join(",")})`).join("→")}\n` +
        `Robot 2 path: ${path2.map((p) => `(${p.join(",")})`).join("→")}`,
    },
    -1, -1, -1, path1, path2,
    [{ name: "answer", value: answer }],
    [11]
  );
  fs.final = true;
  steps.push(fs);

  return { input, answer, steps };
}

/**
 * LeetCode 174: Dungeon Game.
 * dp[i][j] = minimum HP needed to enter cell (i,j) and still reach (m-1,n-1) alive.
 * Fill bottom-right → top-left: dp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) - dungeon[i][j]).
 */
function buildSteps174(input) {
  const grid = String(input).split(";").map((row) => row.split(",").map((s) => Number(s.trim())));
  const m = grid.length, n = grid[0].length;
  const steps = [];

  // dp[i][j] = min HP needed when entering (i,j)
  const dp = Array.from({ length: m }, () => new Array(n).fill(Infinity));

  // Base: bottom-right corner
  dp[m - 1][n - 1] = Math.max(1, 1 - grid[m - 1][n - 1]);

  // Fill last row (right→left)
  for (let j = n - 2; j >= 0; j--) dp[m - 1][j] = Math.max(1, dp[m - 1][j + 1] - grid[m - 1][j]);
  // Fill last column (bottom→up)
  for (let i = m - 2; i >= 0; i--) dp[i][n - 1] = Math.max(1, dp[i + 1][n - 1] - grid[i][n - 1]);
  // Fill rest
  for (let i = m - 2; i >= 0; i--)
    for (let j = n - 2; j >= 0; j--)
      dp[i][j] = Math.max(1, Math.min(dp[i + 1][j], dp[i][j + 1]) - grid[i][j]);

  function gridSnap(title, note, hlCell, pathCells, vars, codeLines) {
    return {
      title,
      arr: [],
      grid: { dp, text1: Array.from({ length: m }, (_, i) => String(i)), text2: Array.from({ length: n }, (_, j) => String(j)), hlCell, pathCells: pathCells || [] },
      highlight: [], mark: [],
      codeLines: codeLines || [],
      vars: vars || [],
      note,
    };
  }

  const gridStr = grid.map((r) => `[${r.join(",")}]`).join(" ");

  steps.push(gridSnap(
    { vi: "Dungeon Game: DP ngược", en: "Dungeon Game: Reverse DP" },
    {
      vi:
        `Grid ${m}×${n}: ${gridStr}\n` +
        `Hiệp sĩ đi từ (0,0) → (${m - 1},${n - 1}), chỉ đi phải hoặc xuống.\n` +
        `HP phải luôn ≥ 1 tại MỌI ô (bao gồm cả ô cuối).\n\n` +
        `Ý tưởng: DP NGƯỢC từ góc dưới-phải → trên-trái.\n` +
        `dp[i][j] = HP TỐI THIỂU cần có KHI VÀO ô (i,j) để sống tới đích.\n` +
        `dp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) − grid[i][j]).\n` +
        `Đáp án = dp[0][0].`,
      en:
        `Grid ${m}×${n}: ${gridStr}\n` +
        `Knight goes from (0,0) → (${m - 1},${n - 1}), can only move right or down.\n` +
        `HP must stay ≥ 1 at EVERY cell (including the last one).\n\n` +
        `Idea: REVERSE DP from bottom-right → top-left.\n` +
        `dp[i][j] = minimum HP required UPON ENTERING cell (i,j) to survive to the goal.\n` +
        `dp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) − grid[i][j]).\n` +
        `Answer = dp[0][0].`,
    },
    null, [],
    [{ name: "rows", value: m }, { name: "cols", value: n }, { name: "dungeon", value: gridStr }],
    [2, 3, 4]
  ));

  // Show dp filled step by step for a few key cells
  steps.push(gridSnap(
    { vi: `dp[${m-1}][${n-1}] = ${dp[m-1][n-1]}`, en: `dp[${m-1}][${n-1}] = ${dp[m-1][n-1]}` },
    {
      vi: `Ô đích (${m-1},${n-1}): dungeon=${grid[m-1][n-1]}. Cần HP ≥ 1 SAU khi chịu damage.\ndp = max(1, 1 − ${grid[m-1][n-1]}) = ${dp[m-1][n-1]}.`,
      en: `Goal cell (${m-1},${n-1}): dungeon=${grid[m-1][n-1]}. Need HP ≥ 1 AFTER taking damage.\ndp = max(1, 1 − ${grid[m-1][n-1]}) = ${dp[m-1][n-1]}.`,
    },
    [m-1, n-1], [],
    [{ name: "cell", value: `(${m-1},${n-1})` }, { name: "dungeon", value: grid[m-1][n-1] }, { name: "dp", value: dp[m-1][n-1] }],
    [5, 6]
  ));

  // Show last row and last column
  steps.push(gridSnap(
    { vi: "Điền hàng cuối & cột cuối", en: "Fill last row & last column" },
    {
      vi: `Hàng cuối (chỉ đi phải): dp[${m-1}][j] = max(1, dp[${m-1}][j+1] − grid[${m-1}][j]).\nCột cuối (chỉ đi xuống): dp[i][${n-1}] = max(1, dp[i+1][${n-1}] − grid[i][${n-1}]).`,
      en: `Last row (can only go right): dp[${m-1}][j] = max(1, dp[${m-1}][j+1] − grid[${m-1}][j]).\nLast col (can only go down): dp[i][${n-1}] = max(1, dp[i+1][${n-1}] − grid[i][${n-1}]).`,
    },
    null, [],
    [{ name: "dp last row", value: `[${dp[m-1].join(",")}]` }, { name: "dp last col", value: `[${dp.map((r) => r[n-1]).join(",")}]` }],
    [7, 8]
  ));

  // Show remaining cells
  steps.push(gridSnap(
    { vi: "Điền phần còn lại (bottom-right → top-left)", en: "Fill remaining cells (bottom-right → top-left)" },
    {
      vi: `Với mỗi ô (i,j) từ (${m-2},${n-2}) lên (0,0):\ndp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) − grid[i][j]).\nĐi theo hướng nào cần ít HP hơn.`,
      en: `For each cell (i,j) from (${m-2},${n-2}) to (0,0):\ndp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) − grid[i][j]).\nGo in the direction requiring less HP.`,
    },
    [0, 0], [],
    [{ name: "dp[0][0]", value: dp[0][0] }],
    [9, 10, 11]
  ));

  // Reconstruct path
  const path = [[0, 0]];
  let ci = 0, cj = 0;
  while (ci < m - 1 || cj < n - 1) {
    if (ci === m - 1) { cj++; }
    else if (cj === n - 1) { ci++; }
    else { if (dp[ci + 1][cj] <= dp[ci][cj + 1]) ci++; else cj++; }
    path.push([ci, cj]);
  }

  const answer = dp[0][0];
  const fs = gridSnap(
    { vi: `Đáp án: HP tối thiểu = ${answer}`, en: `Answer: minimum HP = ${answer}` },
    {
      vi: `dp[0][0] = ${answer}. Hiệp sĩ cần BẮT ĐẦU với ít nhất ${answer} HP để sống qua mọi ô.\nĐường đi: ${path.map((p) => `(${p.join(",")})`).join("→")}.`,
      en: `dp[0][0] = ${answer}. Knight must START with at least ${answer} HP to survive every cell.\nPath: ${path.map((p) => `(${p.join(",")})`).join("→")}.`,
    },
    null, path,
    [{ name: "answer", value: answer }, { name: "path", value: path.map((p) => `(${p.join(",")})`).join("→") }],
    [12]
  );
  fs.final = true;
  steps.push(fs);

  return { input, answer, steps };
}

/**
 * LeetCode 1049: Last Stone Weight II.
 * Equivalent to partitioning stones into 2 groups to minimize |sum1 - sum2|.
 * Same as 416 but find the closest-to-half subset sum.
 * dp[j] = true if we can achieve total weight j with a subset of stones.
 */
function buildSteps1049(nums) {
  const steps = [];
  const total = nums.reduce((a, b) => a + b, 0);
  const target = Math.floor(total / 2);
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;

  const trueIndices = () => dp.map((v, i) => v ? i : null).filter(x => x !== null);

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: dp.map((v) => (v ? 1 : 0)),
    sub: dp.map((_, i) => String(i)),
    highlight: [0], mark: [], codeLines: [3, 4, 5, 6],
    vars: [
      { name: "stones", value: `[${nums.join(",")}]` },
      { name: "sum", value: total },
      { name: "target", value: `floor(${total}/2) = ${target}` },
      { name: "dp (true)", value: `{${trueIndices().join(", ")}}` },
    ],
    note: {
      vi:
        `Bài toán tương đương: chia đá thành 2 nhóm sao cho |sum1 - sum2| TỐI THIỂU.\n` +
        `= Tìm subset có tổng GẦN total/2 nhất (0/1 Knapsack).\n` +
        `dp[j] = True nếu tổng j đạt được. target = floor(${total}/2) = ${target}.\n` +
        `Đáp án = total - 2 * (tổng lớn nhất đạt được ≤ target).`,
      en:
        `Equivalent: partition stones into 2 groups minimizing |sum1 - sum2|.\n` +
        `= Find a subset sum as CLOSE to total/2 as possible (0/1 Knapsack).\n` +
        `dp[j] = True if sum j is achievable. target = floor(${total}/2) = ${target}.\n` +
        `Answer = total - 2 * (largest achievable sum ≤ target).`,
    },
  });

  for (const stone of nums) {
    const changed = [];
    for (let j = target; j >= stone; j--) {
      if (!dp[j] && dp[j - stone]) {
        dp[j] = true;
        changed.push(j);
      }
    }

    steps.push({
      title: { vi: `Thêm đá ${stone}`, en: `Add stone ${stone}` },
      arr: dp.map((v) => (v ? 1 : 0)),
      sub: dp.map((_, i) => String(i)),
      highlight: changed,
      mark: [],
      codeLines: [7, 8, 9],
      vars: [
        { name: "stone", value: stone },
        { name: "new sums", value: changed.length > 0 ? `[${changed.join(",")}]` : "none" },
        { name: "dp (true)", value: `{${trueIndices().join(", ")}}` },
      ],
      note: {
        vi: `Xử lý stone=${stone}: tổng mới đạt được = [${changed.join(",")}].`,
        en: `Process stone=${stone}: newly reachable sums = [${changed.join(",")}].`,
      },
    });
  }

  // Find largest j where dp[j] is true
  let bestJ = 0;
  for (let j = target; j >= 0; j--) {
    if (dp[j]) { bestJ = j; break; }
  }
  const answer = total - 2 * bestJ;

  const fs = {
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: dp.map((v) => (v ? 1 : 0)),
    sub: dp.map((_, i) => String(i)),
    highlight: [bestJ], mark: [bestJ], final: true, codeLines: [10],
    vars: [
      { name: "best subset sum", value: bestJ },
      { name: "answer", value: `${total} - 2×${bestJ} = ${answer}` },
      { name: "dp (true)", value: `{${trueIndices().join(", ")}}` },
    ],
    note: {
      vi: `Tổng lớn nhất đạt được ≤ ${target} là ${bestJ}.\nĐáp án = ${total} - 2×${bestJ} = ${answer}.\n(Nhóm 1 nặng ${bestJ}, nhóm 2 nặng ${total - bestJ}, hiệu = ${answer}.)`,
      en: `Largest achievable sum ≤ ${target} is ${bestJ}.\nAnswer = ${total} - 2×${bestJ} = ${answer}.\n(Group 1 weighs ${bestJ}, group 2 weighs ${total - bestJ}, difference = ${answer}.)`,
    },
  };
  steps.push(fs);

  return { original: [...nums], answer, steps };
}

module.exports = {
  // Category metadata: recommended learning order + detailed guide.
  // Picked up by problems/index.js and exposed to server.js via CATEGORY_ORDER.
  __meta: {
    order: [509, 70, 746, 198, 213, 740, 1406, 53, 152, 300, 322, 518, 279, 139, 91, 62, 64, 120, 931, 1143, 72, 416, 494, 1301, 1388],
    label: {
      vi: "Thứ tự học được khuyến nghị",
      en: "Recommended learning order",
    },
    guide: {
      vi: {
        intro:
          "Nếu mục tiêu là phỏng vấn Software Engineer, đây là 20 bài LeetCode DP quan trọng nhất, sắp xếp từ dễ → khó. Sau khi nắm hết, bạn sẽ giải được khoảng 80–90% bài DP trong các cuộc phỏng vấn.",
        patterns: [
          { id: 70, name: "Climbing Stairs", pattern: "Fibonacci DP" },
          { id: 746, name: "Min Cost Climbing Stairs", pattern: "Fibonacci + Cost" },
          { id: 198, name: "House Robber", pattern: "Linear DP" },
          { id: 213, name: "House Robber II", pattern: "Linear DP + Circle" },
          { id: 740, name: "Delete and Earn", pattern: "House Robber Transform" },
          { id: 1406, name: "Stone Game III", pattern: "Suffix DP / Game DP" },
          { id: 53, name: "Maximum Subarray", pattern: "Kadane DP" },
          { id: 152, name: "Maximum Product Subarray", pattern: "DP (max/min state)" },
          { id: 300, name: "Longest Increasing Subsequence", pattern: "1D DP / Binary Search" },
          { id: 322, name: "Coin Change", pattern: "Unbounded Knapsack" },
          { id: 518, name: "Coin Change II", pattern: "Counting DP" },
          { id: 279, name: "Perfect Squares", pattern: "Complete Knapsack" },
          { id: 139, name: "Word Break", pattern: "String DP" },
          { id: 91, name: "Decode Ways", pattern: "String DP" },
          { id: 62, name: "Unique Paths", pattern: "Grid DP" },
          { id: 64, name: "Minimum Path Sum", pattern: "Grid DP" },
          { id: 120, name: "Triangle", pattern: "Grid DP" },
          { id: 931, name: "Minimum Falling Path Sum", pattern: "Matrix DP" },
          { id: 1143, name: "Longest Common Subsequence", pattern: "2D DP" },
          { id: 72, name: "Edit Distance", pattern: "2D DP" },
          { id: 416, name: "Partition Equal Subset Sum", pattern: "0/1 Knapsack" },
        ],
        stages: [
          {
            title: "Giai đoạn 1 — DP cơ bản (phải thuộc)",
            description: "Những bài xây nền tảng. Hiểu DP là gì, công thức truy hồi, lựa chọn Take / Skip.",
            problems: [70, 746, 198, 213, 740],
          },
          {
            title: "Giai đoạn 2 — DP trên mảng",
            description: "Học Kadane và pattern theo dõi cả max/min. LIS dùng 1D DP, sau đó nâng cấp O(n log n).",
            problems: [1406, 53, 152, 300],
          },
          {
            title: "Giai đoạn 3 — Knapsack",
            description: "Nhóm cực kỳ quan trọng: Unbounded Knapsack, Counting DP, 0/1 Knapsack kinh điển.",
            problems: [322, 518, 279, 416],
          },
          {
            title: "Giai đoạn 4 — String DP",
            description: "dp[i] = cắt được tới i / số cách giải mã. Trên chuỗi 1 chiều.",
            problems: [139, 91],
          },
          {
            title: "Giai đoạn 5 — Grid DP",
            description: "dp[i][j] phụ thuộc ô trên + ô trái. Bottom-up. Mở rộng cho path 3 hướng.",
            problems: [62, 64, 120, 931],
          },
          {
            title: "Giai đoạn 6 — 2D DP",
            description: "Hai chuỗi/hai chiều: LCS (so khớp), Edit Distance (3 thao tác: insert/delete/replace).",
            problems: [1143, 72],
          },
        ],
        conclusion:
          "Đây là lộ trình phổ biến cho phỏng vấn tại các công ty công nghệ. Sau khi thành thạo 20 bài, bạn sẽ nắm các pattern cốt lõi: Fibonacci, Take/Skip, Kadane, LIS, Knapsack, String DP, Grid DP và 2D DP. Tiếp theo có thể học pattern nâng cao: Bitmask DP, Interval DP, Tree DP, Digit DP.",
      },
      en: {
        intro:
          "If your goal is Software Engineer interviews, these are the 20 most important LeetCode DP problems, ordered from easy to hard. Mastering them lets you solve ~80–90% of DP interview questions.",
        patterns: [
          { id: 70, name: "Climbing Stairs", pattern: "Fibonacci DP" },
          { id: 746, name: "Min Cost Climbing Stairs", pattern: "Fibonacci + Cost" },
          { id: 198, name: "House Robber", pattern: "Linear DP" },
          { id: 213, name: "House Robber II", pattern: "Linear DP + Circle" },
          { id: 740, name: "Delete and Earn", pattern: "House Robber Transform" },
          { id: 1406, name: "Stone Game III", pattern: "Suffix DP / Game DP" },
          { id: 53, name: "Maximum Subarray", pattern: "Kadane DP" },
          { id: 152, name: "Maximum Product Subarray", pattern: "DP (max/min state)" },
          { id: 300, name: "Longest Increasing Subsequence", pattern: "1D DP / Binary Search" },
          { id: 322, name: "Coin Change", pattern: "Unbounded Knapsack" },
          { id: 518, name: "Coin Change II", pattern: "Counting DP" },
          { id: 279, name: "Perfect Squares", pattern: "Complete Knapsack" },
          { id: 139, name: "Word Break", pattern: "String DP" },
          { id: 91, name: "Decode Ways", pattern: "String DP" },
          { id: 62, name: "Unique Paths", pattern: "Grid DP" },
          { id: 64, name: "Minimum Path Sum", pattern: "Grid DP" },
          { id: 120, name: "Triangle", pattern: "Grid DP" },
          { id: 931, name: "Minimum Falling Path Sum", pattern: "Matrix DP" },
          { id: 1143, name: "Longest Common Subsequence", pattern: "2D DP" },
          { id: 72, name: "Edit Distance", pattern: "2D DP" },
          { id: 416, name: "Partition Equal Subset Sum", pattern: "0/1 Knapsack" },
        ],
        stages: [
          {
            title: "Stage 1 — DP Basics (must know)",
            description: "Foundation problems. Understand what DP is, recurrence, Take / Skip choice.",
            problems: [70, 746, 198, 213, 740],
          },
          {
            title: "Stage 2 — Array DP",
            description: "Learn Kadane and tracking both max/min state. LIS in 1D, then upgrade to O(n log n).",
            problems: [1406, 53, 152, 300],
          },
          {
            title: "Stage 3 — Knapsack",
            description: "Critical group: Unbounded Knapsack, Counting DP, classic 0/1 Knapsack.",
            problems: [322, 518, 279, 416],
          },
          {
            title: "Stage 4 — String DP",
            description: "dp[i] = can split up to i / number of decodings. On 1D string.",
            problems: [139, 91],
          },
          {
            title: "Stage 5 — Grid DP",
            description: "dp[i][j] depends on top + left. Bottom-up. Extend to 3-way paths.",
            problems: [62, 64, 120, 931],
          },
          {
            title: "Stage 6 — 2D DP",
            description: "Two strings/dimensions: LCS (matching), Edit Distance (insert/delete/replace).",
            problems: [1143, 72],
          },
        ],
        conclusion:
          "This is a popular path for tech interviews. After mastering these 20, you'll know the core patterns: Fibonacci, Take/Skip, Kadane, LIS, Knapsack, String DP, Grid DP and 2D DP. Next, advanced patterns: Bitmask DP, Interval DP, Tree DP, Digit DP.",
      },
    },
  },

  416: {
    id: 416, difficulty: "medium", slug: "partition-equal-subset-sum",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Partition Equal Subset Sum", en: "Partition Equal Subset Sum" },
    titleVi: { vi: "Chia tập bằng nhau (0/1 Knapsack)", en: "Equal partition (0/1 Knapsack)" },
    statement: { vi: "Cho mảng nums. Có thể chia thành 2 tập con có tổng bằng nhau không?", en: "Given nums, can you partition it into two subsets with equal sum?" },
    defaultInput: [1, 5, 11, 5],
    inputKind: "positive",
    extraParams: [],
    complexity: { time: "O(n × sum/2)", space: "O(sum/2)", note: { vi: "n phần tử × target ô DP.", en: "n elements × target DP cells." } },
    code: [
      "class Solution:",
      "    def canPartition(self, nums):",
      "        total = sum(nums)",
      "        if total % 2 != 0: return False",
      "        target = total // 2",
      "        dp = [False] * (target + 1)",
      "        dp[0] = True",
      "        for num in nums:",
      "            for j in range(target, num-1, -1):",
      "                dp[j] = dp[j] or dp[j-num]",
      "        return dp[target]",
    ],
    builder: buildSteps416,
  },
  72: {
    id: 72, difficulty: "medium", slug: "edit-distance",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Edit Distance", en: "Edit Distance" },
    titleVi: { vi: "Khoảng cách chỉnh sửa (Levenshtein)", en: "Edit distance (Levenshtein)" },
    statement: { vi: "Cho hai chuỗi word1, word2. Trả về số thao tác (chèn/xóa/thay) ít nhất để chuyển word1 thành word2.", en: "Given two strings word1 and word2, return the minimum number of operations (insert/delete/replace) to convert word1 into word2." },
    defaultInput: "horse", inputKind: "string", inputLabel: { vi: "word1", en: "word1" },
    extraParams: [{ key: "word2", type: "string", label: { vi: "word2", en: "word2" }, default: "ros" }],
    complexity: { time: "O(m×n)", space: "O(m×n)", note: { vi: "Bảng (m+1)×(n+1) → O(m×n).", en: "Table (m+1)×(n+1) → O(m×n)." } },
    code: ["class Solution:", "    def minDistance(self, word1, word2):", "        m, n = len(word1), len(word2)", "        dp = [[0]*(n+1) for _ in range(m+1)]", "        for i in range(m+1): dp[i][0] = i", "        for j in range(n+1): dp[0][j] = j", "        for i in range(1, m+1):", "            for j in range(1, n+1):", "                if word1[i-1] == word2[j-1]:", "                    dp[i][j] = dp[i-1][j-1]", "                else:", "                    dp[i][j] = 1+min(dp[i-1][j-1],dp[i-1][j],dp[i][j-1])", "        return dp[m][n]"],
    builder: buildSteps72,
  },
  931: {
    id: 931,
    difficulty: "medium",
    slug: "minimum-falling-path-sum",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Minimum Falling Path Sum", en: "Minimum Falling Path Sum" },
    titleVi: { vi: "Tổng đường rơi nhỏ nhất (DP 2D)", en: "Min falling path sum (2D DP)" },
    statement: {
      vi: "Cho ma trận vuông n×n. Tìm tổng nhỏ nhất của đường đi từ hàng đầu xuống hàng cuối (mỗi bước đi xuống-trái, xuống, hoặc xuống-phải).",
      en: "Given an n×n square matrix, find the minimum sum of a falling path (each step moves to the cell directly below, below-left, or below-right).",
    },
    defaultInput: "2,1,3|6,5,4|7,8,9",
    inputKind: "string",
    inputLabel: { vi: "Matrix (hàng cách bởi |)", en: "Matrix (rows separated by |)" },
    extraParams: [],
    complexity: {
      time: "O(n²)",
      space: "O(n²)",
      note: {
        vi: "Điền n×n bảng → O(n²). Có thể tối ưu O(n) bằng 1 hàng.",
        en: "Fill n×n table → O(n²). Optimizable to O(n) with one row.",
      },
    },
    code: [
      "class Solution:",
      "    def minFallingPathSum(self, matrix):",
      "        n = len(matrix)",
      "        dp = [row[:] for row in matrix]",
      "        for r in range(1, n):",
      "            for c in range(n):",
      "                above = [dp[r-1][c]]",
      "                if c>0: above.append(dp[r-1][c-1])",
      "                if c<n-1: above.append(dp[r-1][c+1])",
      "                dp[r][c] = matrix[r][c] + min(above)",
      "        return min(dp[n-1])",
    ],
    builder: buildSteps931,
  },
  741: {
    id: 741,
    difficulty: "hard",
    slug: "cherry-pickup",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Cherry Pickup", en: "Cherry Pickup" },
    titleVi: { vi: "Nhặt anh đào (DP 3 chiều)", en: "Cherry pickup (3D DP)" },
    statement: {
      vi:
        "Lưới n×n: 1=anh đào, 0=trống, -1=gai (chặn). Đi từ (0,0) đến (n-1,n-1) chỉ phải/xuống (nhặt anh đào, ô thành 0), " +
        "rồi quay về (0,0) chỉ trái/lên. Tối đa hóa số anh đào nhặt được. Nếu không có đường đi → 0. " +
        "Nhập lưới: hàng cách bởi '|', giá trị cách bởi ','.",
      en:
        "Grid n×n: 1=cherry, 0=empty, -1=thorn (blocked). Go from (0,0) to (n-1,n-1) moving right/down (pick cherries, cell becomes 0), " +
        "then return to (0,0) moving left/up. Maximize cherries collected. If no valid path → 0. " +
        "Enter grid: rows separated by '|', values by ','.",
    },
    defaultInput: "0,1,-1|1,0,-1|1,1,1",
    inputKind: "string",
    inputLabel: { vi: "Lưới (hàng cách '|')", en: "Grid (rows separated by '|')" },
    extraParams: [],
    approach: [
      { vi: "Đi-rồi-về khó tối ưu trực tiếp. Mẹo: coi như 2 người CÙNG đi từ (0,0) → (n-1,n-1).", en: "Go-then-return is hard to optimize directly. Trick: treat as 2 walkers BOTH going (0,0) → (n-1,n-1)." },
      { vi: "Hai người đi cùng số bước t = r+c. Nên r1+c1 = r2+c2 → state chỉ cần (t, c1, c2) hoặc (r1, c1, c2).", en: "Both take t = r+c steps. So r1+c1 = r2+c2 → state only needs (t, c1, c2) or (r1, c1, c2)." },
      { vi: "Mỗi bước, mỗi người chọn phải hoặc xuống → 4 tổ hợp chuyển trạng thái.", en: "Each step, each walker chooses right or down → 4 transition combinations." },
      { vi: "Nếu hai người ở CÙNG ô → chỉ tính anh đào 1 lần (tránh đếm trùng).", en: "If both on the SAME cell → count its cherry only once (avoid double-counting)." },
      { vi: "Đáp án = max(0, dp(0,0,0)). Nếu mọi đường bị gai chặn → 0.", en: "Answer = max(0, dp(0,0,0)). If all paths are blocked by thorns → 0." },
    ],
    complexity: {
      time: "O(n³)",
      space: "O(n³)",
      note: {
        vi: "State (r1, c1, c2) có O(n³) khả năng, mỗi state O(1). Memo O(n³).",
        en: "State (r1, c1, c2) has O(n³) possibilities, each O(1). Memo O(n³).",
      },
    },
    code: [
      "class Solution:",
      "    def cherryPickup(self, grid):",
      "        n = len(grid)",
      "        from functools import lru_cache",
      "        @lru_cache(None)",
      "        def dp(r1, c1, c2):",
      "            r2 = r1 + c1 - c2",
      "            if (r1>=n or c1>=n or r2>=n or c2>=n",
      "                    or grid[r1][c1]==-1 or grid[r2][c2]==-1):",
      "                return float('-inf')",
      "            if r1==n-1 and c1==n-1:",
      "                return grid[r1][c1]",
      "            cherries = grid[r1][c1]",
      "            if c1 != c2: cherries += grid[r2][c2]",
      "            cherries += max(dp(r1,c1+1,c2+1), dp(r1+1,c1,c2+1),",
      "                            dp(r1,c1+1,c2),   dp(r1+1,c1,c2))",
      "            return cherries",
      "        return max(0, dp(0, 0, 0))",
    ],
    builder: buildSteps741,
  },
  120: {
    id: 120,
    difficulty: "medium",
    slug: "triangle",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Triangle", en: "Triangle" },
    titleVi: { vi: "Tam giác (DP bottom-up)", en: "Triangle (bottom-up DP)" },
    statement: {
      vi: "Cho tam giác số. Tìm tổng nhỏ nhất của đường đi từ đỉnh xuống đáy (mỗi bước đi xuống hoặc xuống-phải).",
      en: "Given a triangle array, find the minimum path sum from top to bottom (each step moves to adjacent numbers on the row below).",
    },
    defaultInput: "2|3,4|6,5,7|4,1,8,3",
    inputKind: "string",
    inputLabel: { vi: "Triangle (hàng cách bởi |)", en: "Triangle (rows separated by |)" },
    extraParams: [],
    complexity: {
      time: "O(n²)",
      space: "O(n)",
      note: {
        vi: "n hàng, tổng n(n+1)/2 phần tử → O(n²). Có thể tối ưu O(n) bộ nhớ bằng 1 mảng.",
        en: "n rows, n(n+1)/2 elements → O(n²). Optimizable to O(n) memory with one array.",
      },
    },
    code: [
      "class Solution:",
      "    def minimumTotal(self, triangle):",
      "        dp = [row[:] for row in triangle]",
      "        for r in range(len(dp)-2, -1, -1):",
      "            for c in range(r+1):",
      "                dp[r][c] = triangle[r][c] + \\",
      "                    min(dp[r+1][c], dp[r+1][c+1])",
      "        return dp[0][0]",
    ],
    builder: buildSteps120,
  },
  64: {
    id: 64,
    difficulty: "medium",
    slug: "minimum-path-sum",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Minimum Path Sum", en: "Minimum Path Sum" },
    titleVi: { vi: "Tổng đường đi nhỏ nhất (DP 2D)", en: "Min path sum (2D grid DP)" },
    statement: {
      vi: "Cho lưới m×n chứa số không âm. Tìm đường từ trái-trên đến phải-dưới (chỉ đi phải/xuống) có tổng nhỏ nhất.",
      en: "Given an m×n grid of non-negative numbers, find a path from top-left to bottom-right (only right/down) that minimizes the sum.",
    },
    defaultInput: "1,3,1|1,5,1|4,2,1",
    inputKind: "string",
    inputLabel: { vi: "Grid (hàng cách bởi |)", en: "Grid (rows separated by |)" },
    extraParams: [],
    complexity: {
      time: "O(m×n)",
      space: "O(m×n)",
      note: {
        vi: "Điền bảng m×n → O(m×n). Có thể tối ưu O(n) bằng 1 hàng.",
        en: "Fill m×n table → O(m×n). Optimizable to O(n) with one row.",
      },
    },
    code: [
      "class Solution:",
      "    def minPathSum(self, grid):",
      "        m, n = len(grid), len(grid[0])",
      "        dp = [[0]*n for _ in range(m)]",
      "        dp[0][0] = grid[0][0]",
      "        for c in range(1,n): dp[0][c] = dp[0][c-1]+grid[0][c]",
      "        for r in range(1,m): dp[r][0] = dp[r-1][0]+grid[r][0]",
      "        for r in range(1, m):",
      "            for c in range(1, n):",
      "                dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])",
      "        return dp[m-1][n-1]",
    ],
    builder: buildSteps64,
  },
  62: {
    id: 62,
    difficulty: "medium",
    slug: "unique-paths",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Unique Paths", en: "Unique Paths" },
    titleVi: { vi: "Số đường đi duy nhất (DP 2D)", en: "Unique paths (2D grid DP)" },
    statement: {
      vi: "Robot ở góc trái trên lưới m×n. Chỉ đi phải hoặc xuống. Đếm số đường đi đến góc phải dưới.",
      en: "A robot at the top-left of an m×n grid can only move right or down. Count paths to the bottom-right corner.",
    },
    defaultInput: [3],
    inputKind: "positive",
    inputLabel: { vi: "m (số hàng)", en: "m (rows)" },
    singleInput: true,
    maxInput: 8,
    extraParams: [
      { key: "m", label: { vi: "m (hàng)", en: "m (rows)" }, default: 3 },
      { key: "n", label: { vi: "n (cột)", en: "n (cols)" }, default: 7 },
    ],
    complexity: {
      time: "O(m×n)",
      space: "O(m×n)",
      note: {
        vi: "Điền bảng m×n một lần → O(m×n). Có thể tối ưu xuống O(n) bằng 1 hàng.",
        en: "Fill m×n table once → O(m×n). Optimizable to O(n) with a single row.",
      },
    },
    code: [
      "class Solution:",
      "    def uniquePaths(self, m, n):",
      "        dp = [[1]*n for _ in range(m)]",
      "        for r in range(1, m):",
      "            for c in range(1, n):",
      "                dp[r][c] = dp[r-1][c] + dp[r][c-1]",
      "        return dp[m-1][n-1]",
    ],
    builder: buildSteps62,
  },
  91: {
    id: 91,
    difficulty: "medium",
    slug: "decode-ways",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Decode Ways", en: "Decode Ways" },
    titleVi: { vi: "Số cách giải mã (DP trên chuỗi)", en: "Decode ways (string DP)" },
    statement: {
      vi: "Cho chuỗi s chứa chữ số. A=1, B=2, ..., Z=26. Trả về số cách decode s thành chữ cái.",
      en: "Given a string s of digits. A=1, B=2, ..., Z=26. Return the number of ways to decode s into letters.",
    },
    defaultInput: "226",
    inputKind: "string",
    inputLabel: { vi: "s (chuỗi chữ số)", en: "s (digit string)" },
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Duyệt chuỗi 1 lần, mỗi vị trí kiểm tra 1-2 chữ số → O(n). Bảng dp O(n).",
        en: "Single pass, check 1-2 digits each position → O(n). DP table O(n).",
      },
    },
    code: [
      "class Solution:",
      "    def numDecodings(self, s):",
      "        n = len(s)",
      "        dp = [0] * (n + 1)",
      "        dp[0] = 1",
      "        for i in range(1, n + 1):",
      "            if s[i-1] != '0':",
      "                dp[i] += dp[i-1]",
      "            if i>=2 and 10<=int(s[i-2:i])<=26:",
      "                dp[i] += dp[i-2]",
      "        return dp[n]",
    ],
    builder: buildSteps91,
  },
  132: {
    id: 132,
    difficulty: "hard",
    slug: "palindrome-partitioning-ii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Palindrome Partitioning II", en: "Palindrome Partitioning II" },
    titleVi: { vi: "Số cắt tối thiểu (palindrome)", en: "Min cuts for palindrome partitioning" },
    statement: {
      vi: "Cho chuỗi s, trả về SỐ CẮT TỐI THIỂU để chia s thành các đoạn con đều là palindrome. Nhập chuỗi chữ thường.",
      en: "Given a string s, return the MINIMUM number of cuts so every substring in the partition is a palindrome. Enter a lowercase string.",
    },
    defaultInput: "aab",
    inputKind: "string",
    inputLabel: { vi: "Chuỗi s", en: "String s" },
    extraParams: [],
    approach: [
      { vi: "Tiền xử lý isPalin[i][j] = s[i..j] có phải palindrome không (DP 2D O(n²)).", en: "Precompute isPalin[i][j] = whether s[i..j] is a palindrome (2D DP O(n²))." },
      { vi: "dp[i] = số cắt tối thiểu cho s[0..i-1]. dp[0] = -1 (base). dp[i] = min(dp[j]+1) với mọi j mà s[j..i-1] palindrome.", en: "dp[i] = min cuts for s[0..i-1]. dp[0] = -1 (base). dp[i] = min(dp[j]+1) for all j where s[j..i-1] is a palindrome." },
      { vi: "Đáp án = dp[n].", en: "Answer = dp[n]." },
    ],
    complexity: { time: "O(n²)", space: "O(n²)", note: { vi: "n² cho isPalin + n² cho dp fill.", en: "n² for isPalin + n² for dp fill." } },
    code: [
      "class Solution:",
      "    def minCut(self, s):",
      "        n = len(s)",
      "        # Precompute isPalin[i][j]",
      "        isPalin = [[False]*n for _ in range(n)]",
      "        for i in range(n-1, -1, -1):",
      "            for j in range(i, n):",
      "                if s[i]==s[j] and (j-i<=2 or isPalin[i+1][j-1]):",
      "                    isPalin[i][j] = True",
      "        # DP",
      "        dp = list(range(-1, n))  # dp[0]=-1, dp[1]=0,...",
      "        for i in range(1, n+1):",
      "            for j in range(i):",
      "                if isPalin[j][i-1]:",
      "                    dp[i] = min(dp[i], dp[j] + 1)",
      "        return dp[n]",
    ],
    builder: buildSteps132,
  },
  139: {
    id: 139,
    difficulty: "medium",
    slug: "word-break",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Word Break", en: "Word Break" },
    titleVi: { vi: "Tách từ (DP trên chuỗi)", en: "Word break (string DP)" },
    statement: {
      vi: "Cho chuỗi s và từ điển wordDict. Trả về True nếu s có thể tách thành một hay nhiều từ trong wordDict (mỗi từ dùng nhiều lần được).",
      en: "Given a string s and a dictionary wordDict, return True if s can be segmented into one or more dictionary words (words may be reused).",
    },
    defaultInput: "leetcode",
    inputKind: "string",
    inputLabel: { vi: "s", en: "s" },
    extraParams: [
      { key: "wordDict", type: "string", label: { vi: "wordDict (phẩy ngăn)", en: "wordDict (comma separated)" }, default: "leet,code" },
    ],
    complexity: {
      time: "O(n² · L)",
      space: "O(n)",
      note: {
        vi: "Hai vòng lặp lồng O(n²), mỗi lần cắt chuỗi O(L). Bảng dp O(n).",
        en: "Two nested loops O(n²), each substring O(L). DP table O(n).",
      },
    },
    code: [
      "class Solution:",
      "    def wordBreak(self, s, wordDict):",
      "        n = len(s)",
      "        word_set = set(wordDict)",
      "        dp = [False] * (n + 1)",
      "        dp[0] = True",
      "        for i in range(1, n + 1):",
      "            for j in range(i):",
      "                if dp[j] and s[j:i] in word_set:",
      "                    dp[i] = True; break",
      "        return dp[n]",
    ],
    builder: buildSteps139,
  },
  279: {
    id: 279,
    difficulty: "medium",
    slug: "perfect-squares",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Perfect Squares", en: "Perfect Squares" },
    titleVi: { vi: "Số bình phương hoàn hảo ít nhất", en: "Least number of perfect squares" },
    statement: {
      vi: "Cho n, trả về số lượng bình phương hoàn hảo ít nhất có tổng bằng n. Ví dụ: 12 = 4+4+4 → 3.",
      en: "Given n, return the least number of perfect square numbers that sum to n. E.g. 12 = 4+4+4 → 3.",
    },
    defaultInput: [12],
    inputKind: "positive",
    inputLabel: { vi: "n", en: "n" },
    singleInput: true,
    maxInput: 50,
    extraParams: [],
    complexity: {
      time: "O(n√n)",
      space: "O(n)",
      note: {
        vi: "Với mỗi i từ 1..n, thử √n bình phương → O(n√n). Bảng dp O(n).",
        en: "For each i from 1..n, try √n squares → O(n√n). DP table O(n).",
      },
    },
    code: [
      "class Solution:",
      "    def numSquares(self, n):",
      "        dp = [float('inf')] * (n + 1)",
      "        dp[0] = 0",
      "        for i in range(1, n + 1):",
      "            j = 1",
      "            while j * j <= i:",
      "                dp[i] = min(dp[i], dp[i-j*j]+1)",
      "                j += 1",
      "        return dp[n]",
    ],
    builder: buildSteps279,
  },
  518: {
    id: 518,
    difficulty: "medium",
    slug: "coin-change-ii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Coin Change II", en: "Coin Change II" },
    titleVi: { vi: "Đổi xu II (đếm số cách)", en: "Coin change II (count combinations)" },
    statement: {
      vi: "Cho coins và amount. Trả về số cách (tổ hợp, không phải hoán vị) để tạo amount bằng các xu. Mỗi xu dùng không giới hạn.",
      en: "Given coins and an amount, return the number of combinations (not permutations) to make the amount. Each coin can be used unlimited times.",
    },
    defaultInput: [1, 2, 5],
    inputKind: "positive",
    inputLabel: { vi: "coins", en: "coins" },
    extraParams: [
      { key: "amount", label: { vi: "amount", en: "amount" }, default: 5 },
    ],
    complexity: {
      time: "O(amount × n)",
      space: "O(amount)",
      note: {
        vi: "Vòng ngoài n coins, vòng trong amount ô → O(amount × n). Bảng dp 1D O(amount).",
        en: "Outer loop n coins, inner loop amount cells → O(amount × n). 1D dp table O(amount).",
      },
    },
    code: [
      "class Solution:",
      "    def change(self, amount, coins):",
      "        dp = [0] * (amount + 1)",
      "        dp[0] = 1",
      "        for coin in coins:",
      "            for i in range(coin, amount + 1):",
      "                dp[i] += dp[i - coin]",
      "        return dp[amount]",
    ],
    builder: buildSteps518,
  },
  322: {
    id: 322,
    difficulty: "medium",
    slug: "coin-change",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Coin Change", en: "Coin Change" },
    titleVi: { vi: "Đổi xu (DP unbounded knapsack)", en: "Coin change (unbounded knapsack DP)" },
    statement: {
      vi: "Cho mảng coins (mệnh giá xu, dùng không giới hạn) và amount. Trả về số xu ít nhất để tạo amount. Nếu không được, trả -1.",
      en: "Given coins (denominations, unlimited supply) and an amount, return the fewest coins to make that amount. If impossible, return -1.",
    },
    defaultInput: [1, 5, 10, 25],
    inputKind: "positive",
    inputLabel: { vi: "coins (mệnh giá)", en: "coins (denominations)" },
    extraParams: [
      { key: "amount", label: { vi: "amount", en: "amount" }, default: 11 },
    ],
    complexity: {
      time: "O(amount × n)",
      space: "O(amount)",
      note: {
        vi: "Với mỗi amount từ 1..amount, thử n coin → O(amount × n). Bảng dp O(amount).",
        en: "For each amount 1..amount, try n coins → O(amount × n). DP table O(amount).",
      },
    },
    code: [
      "class Solution:",
      "    def coinChange(self, coins, amount):",
      "        dp = [float('inf')] * (amount + 1)",
      "        dp[0] = 0",
      "        for i in range(1, amount + 1):",
      "            for coin in coins:",
      "                if coin <= i:",
      "                    dp[i] = min(dp[i], dp[i-coin]+1)",
      "        return dp[amount] if dp[amount] != float('inf') else -1",
    ],
    builder: buildSteps322,
  },
  740: {
    id: 740,
    difficulty: "medium",
    slug: "delete-and-earn",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Delete and Earn", en: "Delete and Earn" },
    titleVi: { vi: "Xóa và kiếm điểm (House Robber biến thể)", en: "Delete and earn (House Robber variant)" },
    statement: {
      vi: "Cho mảng nums. Khi chọn nums[i], bạn kiếm nums[i] điểm và xóa mọi phần tử bằng nums[i]-1 và nums[i]+1. Trả về điểm tối đa.",
      en: "Given nums, when you pick nums[i], you earn nums[i] points and must delete every element equal to nums[i]-1 and nums[i]+1. Return the max points.",
    },
    defaultInput: [3, 4, 2],
    inputKind: "positive",
    extraParams: [],
    complexity: {
      time: "O(n + max)",
      space: "O(max)",
      note: {
        vi: "Xây earn[] O(n), DP trên earn[] O(max). Bộ nhớ O(max).",
        en: "Build earn[] in O(n), DP on earn[] in O(max). Memory O(max).",
      },
    },
    code: [
      "class Solution:",
      "    def deleteAndEarn(self, nums):",
      "        max_val = max(nums)",
      "        earn = [0] * (max_val + 1)",
      "        for num in nums:",
      "            earn[num] += num",
      "        dp = [0] * (max_val + 1)",
      "        dp[0] = earn[0]",
      "        dp[1] = max(earn[0], earn[1])",
      "        for i in range(2, max_val + 1):",
      "            dp[i] = max(dp[i-1], dp[i-2] + earn[i])",
      "        return dp[max_val]",
    ],
    builder: buildSteps740,
  },
  1140: {
    id: 1140,
    difficulty: "medium",
    slug: "stone-game-ii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Stone Game II", en: "Stone Game II" },
    titleVi: { vi: "Trò chơi đá II", en: "Stone Game II (suffix + M DP)" },
    statement: {
      vi: "Cho mảng piles. Hai người chơi lần lượt lấy x đống đá từ đầu dãy, với 1 <= x <= 2M. Sau khi lấy x, M = max(M, x). Trả về số đá tối đa Alice có thể lấy được nếu cả hai chơi tối ưu.",
      en: "Given an array piles, two players take x piles from the front where 1 <= x <= 2M. After taking x, M becomes max(M, x). Return the maximum stones Alice can obtain with optimal play.",
    },
    defaultInput: [2, 7, 9, 4, 4],
    inputKind: "positive",
    inputLabel: { vi: "piles", en: "piles" },
    extraParams: [],
    complexity: {
      time: "O(n^3)",
      space: "O(n^2)",
      note: {
        vi: "Có O(n^2) trạng thái dp[i][M], mỗi trạng thái thử tối đa 2M lựa chọn nên xấu nhất là O(n^3).",
        en: "There are O(n^2) dp[i][M] states, and each state tries up to 2M choices, giving worst-case O(n^3) time.",
      },
    },
    code: [
      "class Solution:",
      "    def stoneGameII(self, piles):",
      "        n = len(piles)",
      "        suffix = [0] * (n + 1)",
      "        for i in range(n - 1, -1, -1):",
      "            suffix[i] = suffix[i + 1] + piles[i]",
      "        dp = [[0] * (n + 1) for _ in range(n + 1)]",
      "        for i in range(n - 1, -1, -1):",
      "            for m in range(1, n + 1):",
      "                if 2 * m >= n - i:",
      "                    dp[i][m] = suffix[i]",
      "                else:",
      "                    best = 0",
      "                    for x in range(1, 2 * m + 1):",
      "                        best = max(best, suffix[i] - dp[i + x][max(m, x)])",
      "                    dp[i][m] = best",
      "        return dp[0][1]",
    ],
    builder: buildSteps1140,
  },
  877: {
    id: 877,
    difficulty: "medium",
    slug: "stone-game",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Stone Game", en: "Stone Game" },
    titleVi: { vi: "Trò chơi đá", en: "Stone Game" },
    statement: {
      vi: "Cho mảng piles có số lượng đá ở mỗi đống. Hai người chơi luân phiên lấy cả đống từ đầu hoặc cuối. Trả về true nếu Alice có thể thắng khi cả hai chơi tối ưu.",
      en: "Given an array piles of stone counts, two players take an entire pile from either the start or end on each turn. Return true if Alice can win with optimal play.",
    },
    defaultInput: [5, 3, 4, 5],
    inputKind: "positive",
    inputLabel: { vi: "piles", en: "piles" },
    extraParams: [],
    complexity: {
      time: "O(n²)",
      space: "O(n²)",
      note: {
        vi:
          "Bảng dp[i][j] kích thước n×n; mỗi ô O(1) → O(n²) thời gian và bộ nhớ.\n" +
          "Mẹo O(1): với số đống chẵn và tổng lẻ, Alice luôn thắng nên `return True` là đủ — nhưng ở đây ta trực quan hoá DP để hiểu bản chất.",
        en:
          "The dp[i][j] table has n×n cells; each is O(1) → O(n²) time and space.\n" +
          "O(1) trick: with an even number of piles and odd total, Alice always wins so `return True` suffices — but we visualize the DP here to understand the mechanics.",
      },
    },
    code: [
      "class Solution:",
      "    def stoneGame(self, piles):",
      "        n = len(piles)",
      "        # dp[i][j] = max score difference the current player",
      "        # can force on the subarray piles[i..j].",
      "        dp = [[0] * n for _ in range(n)]",
      "        for i in range(n):",
      "            dp[i][i] = piles[i]",
      "        for length in range(2, n + 1):",
      "            for i in range(n - length + 1):",
      "                j = i + length - 1",
      "                take_left  = piles[i] - dp[i + 1][j]",
      "                take_right = piles[j] - dp[i][j - 1]",
      "                dp[i][j] = max(take_left, take_right)",
      "        return dp[0][n - 1] > 0",
      "",
      "# O(1) trick: with n even and odd total, Alice always wins.",
      "#     return True",
    ],
    builder: buildSteps877,
  },
  1406: {
    id: 1406,
    difficulty: "hard",
    slug: "stone-game-iii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Stone Game III", en: "Stone Game III" },
    titleVi: { vi: "Trò chơi đá III (suffix DP)", en: "Stone Game III (suffix DP)" },
    statement: {
      vi: "Cho mảng stones. Hai người chơi lần lượt lấy 1 đến 3 viên đá từ đầu mảng. Mỗi viên đá có điểm số tương ứng. Trả về Alice, Bob hoặc Tie tùy theo ai có tổng điểm cao hơn.",
      en: "Given an array stones, two players take 1 to 3 stones from the start of the array on each turn. Each stone has a score. Return Alice, Bob, or Tie depending on who ends with the higher total.",
    },
    defaultInput: [1, 2, 3, 7],
    inputKind: "positive",
    inputLabel: { vi: "stones", en: "stones" },
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Mỗi vị trí i thử tối đa 3 lựa chọn, nên thời gian O(n). Dùng mảng dp kích thước n+1.",
        en: "Each index i tries at most 3 choices, so time is O(n). Uses a dp array of size n+1.",
      },
    },
    code: [
      "class Solution:",
      "    def stoneGameIII(self, stones):",
      "        n = len(stones)",
      "        dp = [0] * (n + 1)",
      "        for i in range(n - 1, -1, -1):",
      "            take = 0",
      "            dp[i] = float('-inf')",
      "            for k in range(3):",
      "                if i + k < n:",
      "                    take += stones[i + k]",
      "                    dp[i] = max(dp[i], take - dp[i + k + 1])",
      "        if dp[0] > 0: return 'Alice'",
      "        if dp[0] < 0: return 'Bob'",
      "        return 'Tie'",
    ],
    builder: buildSteps1406,
  },
  1143: {
    id: 1143,
    difficulty: "medium",
    slug: "longest-common-subsequence",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Longest Common Subsequence", en: "Longest Common Subsequence" },
    titleVi: { vi: "Dãy con chung dài nhất", en: "Longest common subsequence" },
    statement: {
      vi:
        "Cho hai chuỗi text1 và text2, trả về độ dài dãy con chung dài nhất. " +
        "Dãy con là chuỗi thu được bằng cách xóa một số ký tự mà giữ nguyên thứ tự.",
      en:
        "Given two strings text1 and text2, return the length of their longest common subsequence. " +
        "A subsequence is a string derived by deleting some characters without changing the order.",
    },
    defaultInput: "abcde",
    inputKind: "string",
    inputLabel: { vi: "text1", en: "text1" },
    extraParams: [
      {
        key: "text2",
        type: "string",
        label: { vi: "text2", en: "text2" },
        default: "ace",
      },
    ],
    complexity: {
      time: "O(m·n)",
      space: "O(m·n)",
      note: {
        vi: "Hai vòng lặp lồng nhau duyệt bảng (m+1)×(n+1) nên O(m·n). Bảng dp cùng kích thước nên O(m·n) bộ nhớ.",
        en: "Two nested loops fill the (m+1)×(n+1) table, giving O(m·n) time and space.",
      },
    },
    code: [
      "class Solution:",
      "    def longestCommonSubsequence(self, text1, text2):",
      "        m, n = len(text1), len(text2)",
      "        dp = [[0]*(n+1) for _ in range(m+1)]",
      "        for i in range(1, m+1):",
      "            for j in range(1, n+1):",
      "                if text1[i-1] == text2[j-1]:",
      "                    dp[i][j] = dp[i-1][j-1] + 1",
      "                else:",
      "                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
      "        return dp[m][n]",
    ],
    builder: buildSteps1143,
  },
  213: {
    id: 213,
    difficulty: "medium",
    slug: "house-robber-ii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "House Robber II", en: "House Robber II" },
    titleVi: { vi: "Tên cướp nhà II (vòng tròn)", en: "House robber II (circular)" },
    statement: {
      vi:
        "Giống bài House Robber, nhưng các nhà xếp thành vòng tròn " +
        "(nhà đầu và nhà cuối liền kề nhau). " +
        "Không được cướp hai nhà liền kề. Trả về số tiền lớn nhất có thể.",
      en:
        "Same as House Robber, but the houses are arranged in a circle " +
        "(the first and last house are adjacent). " +
        "You cannot rob two adjacent houses. Return the maximum amount you can rob.",
    },
    defaultInput: [2, 3, 2],
    inputKind: "nonneg",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Chạy House-Robber hai lần (mỗi lần O(n)) nên tổng vẫn O(n). Bộ nhớ O(n) cho dp (có thể O(1)).",
        en: "Run House-Robber twice (each O(n)), total is still O(n). O(n) memory for dp (optimizable to O(1)).",
      },
    },
    code: [
      "class Solution:",
      "    def rob(self, nums):",
      "        if len(nums) == 1:",
      "            return nums[0]",
      "        return max(self._rob(nums[:-1]),",
      "                   self._rob(nums[1:]))",
      "    def _rob(self, nums):",
      "        dp = [0] * len(nums)",
      "        dp[0] = nums[0]",
      "        dp[1] = max(nums[0], nums[1])",
      "        for i in range(2, len(nums)):",
      "            dp[i] = max(dp[i-1], dp[i-2]+nums[i])",
      "        return dp[-1]",
    ],
    builder: buildSteps213,
  },
  198: {
    id: 198,
    difficulty: "medium",
    slug: "house-robber",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "House Robber", en: "House Robber" },
    titleVi: { vi: "Tên cướp nhà", en: "House robber" },
    statement: {
      vi:
        "Cho mảng nums[i] là số tiền trong nhà i, các nhà sắp dọc một đường. " +
        "Nếu cướp hai nhà liền kề thì bị phát hiện. " +
        "Trả về số tiền lớn nhất có thể cướp mà không bị phát hiện.",
      en:
        "Given an array nums[i] representing the amount of money in house i, houses are along a street. " +
        "Robbing two adjacent houses triggers an alarm. " +
        "Return the maximum amount you can rob without alerting the police.",
    },
    defaultInput: [2, 7, 9, 3, 1],
    inputKind: "nonneg",
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn Approach", en: "Select Approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "DP Array O(n) — dp[i] = tiền tối đa tới nhà i", en: "DP Array O(n) — dp[i] = max loot up to house i" } },
          { value: 2, label: { vi: "Tối ưu O(1) — 2 biến prev_rob & max_rob", en: "Optimized O(1) — 2 vars prev_rob & max_rob" } },
        ],
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n) / O(1)",
      note: {
        vi: "Cách 1: O(n) thời gian + O(n) bộ nhớ (bảng dp). Cách 2: O(n) thời gian + O(1) bộ nhớ (2 biến prev_rob, max_rob).",
        en: "Approach 1: O(n) time + O(n) memory (dp table). Approach 2: O(n) time + O(1) memory (2 variables prev_rob, max_rob).",
      },
    },
    code: [
      "class Solution:",
      "    def rob(self, nums):",
      "        if len(nums) == 0:",
      "            return 0",
      "        if len(nums) == 1:",
      "            return nums[0]",
      "        if len(nums) == 2:",
      "            return max(nums[0], nums[1])",
      "        dp = [0] * len(nums)",
      "        dp[0] = nums[0]",
      "        dp[1] = max(nums[0], nums[1])",
      "        for i in range(2, len(nums)):",
      "            dp[i] = max(dp[i-1], dp[i-2] + nums[i])",
      "        return dp[-1]",
    ],
    code2: [
      "# Optimized O(1) space",
      "class Solution:",
      "    def rob(self, nums: List[int]) -> int:",
      "        prev_rob, max_rob = 0, 0",
      "        for current in nums:",
      "            temp = max(max_rob, prev_rob + current)",
      "            prev_rob, max_rob = max_rob, temp",
      "        return max_rob",
    ],
    codeLabel: { vi: "Cách 1: DP Array O(n) space", en: "Approach 1: DP Array O(n) space" },
    code2Label: { vi: "Cách 2: Tối ưu O(1) space", en: "Approach 2: Optimized O(1) space" },
    builder: buildSteps198,
  },
  53: {
    id: 53,
    difficulty: "medium",
    slug: "maximum-subarray",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Maximum Subarray", en: "Maximum Subarray" },
    titleVi: { vi: "Dãy con liên tiếp có tổng lớn nhất", en: "Maximum contiguous subarray sum" },
    statement: {
      vi: "Cho mảng số nguyên nums, tìm dãy con liên tiếp (gồm ít nhất một phần tử) có tổng lớn nhất và trả về tổng đó.",
      en: "Given an integer array nums, find the contiguous subarray (containing at least one element) with the largest sum and return its sum.",
    },
    defaultInput: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
    inputKind: "integer", // cho phép số âm
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn Approach", en: "Select Approach" },
        default: 2,
        options: [
          { value: 2, label: { vi: "DP Array O(n)", en: "DP Array O(n)" } },
          { value: 1, label: { vi: "Kadane O(1) space", en: "Kadane O(1) space" } },
        ],
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n) / O(1)",
      note: {
        vi: "Approach 1 (mặc định): DP array O(n) time, O(n) space. Approach 2: Kadane O(n) time, O(1) space.",
        en: "Approach 1 (default): DP array O(n) time, O(n) space. Approach 2: Kadane O(n) time, O(1) space.",
      },
    },
    code: [
      "class Solution:",
      "    def maxSubArray(self, nums: List[int]) -> int:",
      "        n = len(nums)",
      "        dp = [0] * n",
      "        dp[0] = nums[0]",
      "        max_sum = dp[0]",
      "        for i in range(1, n):",
      "            dp[i] = max(dp[i-1] + nums[i], nums[i])",
      "            max_sum = max(dp[i], max_sum)",
      "        return max_sum",
    ],
    code2: [
      "# Kadane O(1) space",
      "class Solution:",
      "    def maxSubArray(self, nums):",
      "        cur = nums[0]",
      "        best = nums[0]",
      "        for i in range(1, len(nums)):",
      "            cur = max(nums[i], cur + nums[i])",
      "            best = max(best, cur)",
      "        return best",
    ],
    codeLabel: { vi: "Cách 1: DP Array O(n) space", en: "Approach 1: DP Array O(n) space" },
    code2Label: { vi: "Cách 2: Kadane O(1) space", en: "Approach 2: Kadane O(1) space" },
    builder: buildSteps53,
  },
  746: {
    id: 746,
    difficulty: "easy",
    slug: "min-cost-climbing-stairs",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Min Cost Climbing Stairs", en: "Min Cost Climbing Stairs" },
    titleVi: { vi: "Chi phí leo cầu thang nhỏ nhất", en: "Minimum cost to climb stairs" },
    statement: {
      vi: "Cho mảng cost, cost[i] là chi phí của bậc i. Sau khi trả phí, bạn có thể leo 1 hoặc 2 bậc. Bắt đầu từ bậc 0 hoặc 1. Trả về chi phí nhỏ nhất để lên tới đỉnh cầu thang.",
      en: "Given an array cost where cost[i] is the cost of step i. After paying, you may climb 1 or 2 steps. Start from step 0 or 1. Return the minimum cost to reach the top.",
    },
    defaultInput: [1, 100, 1, 1, 1, 100, 1, 1, 100, 1],
    inputKind: "nonneg",
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn Approach", en: "Select Approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "DP Array O(n) — dp[i] = chi phí tới bậc i", en: "DP Array O(n) — dp[i] = cost to reach step i" } },
          { value: 2, label: { vi: "Optimized O(1) — chỉ 2 biến", en: "Optimized O(1) — only 2 variables" } },
        ],
      },
    ],
    approach: [
      { vi: "Có 2 cách hiểu dp: dp[i] = chi phí tới bậc i (cách 1) hoặc dp[i] = chi phí đứng trên bậc i (cách 2).", en: "Two interpretations: dp[i] = cost to REACH step i (approach 1) or dp[i] = cost to STAND ON step i (approach 2)." },
      { vi: "Cách 1: dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]). Đáp án = dp[n].", en: "Approach 1: dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]). Answer = dp[n]." },
      { vi: "Cách 2 (tối ưu): chỉ cần 2 biến prev2, prev1. curr = cost[i] + min(prev1, prev2), rồi dời pointers.", en: "Approach 2 (optimized): only need 2 vars prev2, prev1. curr = cost[i] + min(prev1, prev2), then shift pointers." },
      { vi: "Cách 2 đáp án = min(prev1, prev2) — nhảy tới đỉnh từ bậc n-1 hoặc n-2.", en: "Approach 2 answer = min(prev1, prev2) — jump to top from step n-1 or n-2." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n) / O(1)",
      note: {
        vi: "Approach 1: O(n) time, O(n) space (bảng dp). Approach 2: O(n) time, O(1) space (2 biến).",
        en: "Approach 1: O(n) time, O(n) space (dp table). Approach 2: O(n) time, O(1) space (2 variables).",
      },
    },
    code: [
      "class Solution:",
      "    def minCostClimbingStairs(self, cost):",
      "        n = len(cost)",
      "        dp = [0] * (n + 1)",
      "        for i in range(2, n + 1):",
      "            dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])",
      "        return dp[n]",
    ],
    code2: [
      "# Optimized O(1) space",
      "class Solution:",
      "    def minCostClimbingStairs(self, cost: List[int]) -> int:",
      "        prev2 = cost[0]",
      "        prev1 = cost[1]",
      "        for i in range(2, len(cost)):",
      "            curr = cost[i] + min(prev1, prev2)",
      "            prev2 = prev1",
      "            prev1 = curr",
      "        return min(prev1, prev2)",
    ],
    codeLabel: { vi: "Cách 1: DP Array O(n) space", en: "Approach 1: DP Array O(n) space" },
    code2Label: { vi: "Cách 2: Tối ưu O(1) space", en: "Approach 2: Optimized O(1) space" },
    builder: buildSteps746,
  },
  152: {
    id: 152,
    difficulty: "medium",
    slug: "maximum-product-subarray",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Maximum Product Subarray", en: "Maximum Product Subarray" },
    titleVi: { vi: "Tích lớn nhất của dãy con liên tiếp", en: "Largest product of a contiguous subarray" },
    statement: {
      vi: "Cho mảng số nguyên nums, tìm một dãy con liên tiếp (chứa ít nhất một số) có tích lớn nhất, và trả về tích đó. Mảng có thể chứa số âm và số 0.",
      en: "Given an integer array nums, find a contiguous subarray (containing at least one number) that has the largest product, and return that product. The array may contain negative numbers and zeros.",
    },
    defaultInput: [2, 3, -2, 4],
    inputKind: "integer", // số nguyên bất kỳ (cho phép âm và 0)
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng đúng một lần, mỗi bước chỉ cập nhật curMax/curMin/result nên O(n) thời gian và O(1) bộ nhớ.",
        en: "A single pass updates curMax/curMin/result at each step, giving O(n) time and O(1) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def maxProduct(self, nums):",
      "        cur_max = cur_min = result = nums[0]",
      "        for i in range(1, len(nums)):",
      "            x = nums[i]",
      "            candidates = (x, cur_max * x, cur_min * x)",
      "            cur_max = max(candidates)",
      "            cur_min = min(candidates)",
      "            result = max(result, cur_max)",
      "        return result",
    ],
    builder: buildSteps152,
  },
  70: {
    id: 70,
    difficulty: "easy",
    slug: "climbing-stairs",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Climbing Stairs", en: "Climbing Stairs" },
    titleVi: { vi: "Leo cầu thang", en: "Climbing stairs" },
    statement: {
      vi: "Bạn đang leo một cầu thang có n bậc để lên đỉnh. Mỗi lần bạn được leo 1 hoặc 2 bậc. Hỏi có bao nhiêu cách khác nhau để leo lên tới đỉnh?",
      en: "You are climbing a staircase. It takes n steps to reach the top. Each time you can climb either 1 or 2 steps. In how many distinct ways can you climb to the top?",
    },
    defaultInput: [5],
    inputKind: "positive",
    inputLabel: { vi: "n (số bậc thang)", en: "n (number of steps)" },
    singleInput: true,
    maxInput: 45,
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn Approach", en: "Select Approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "1 — DP Array O(n)", en: "1 — DP Array O(n)" } },
          { value: 2, label: { vi: "2 — Optimized O(1) space", en: "2 — Optimized O(1) space" } },
        ],
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n) / O(1)",
      note: {
        vi: "Approach 1: O(n) time, O(n) space (bảng dp). Approach 2: O(n) time, O(1) space (2 biến).",
        en: "Approach 1: O(n) time, O(n) space (dp table). Approach 2: O(n) time, O(1) space (2 variables).",
      },
    },
    code: [
      "class Solution:",
      "    def climbStairs(self, n):",
      "        dp = [0] * (n + 1)",
      "        dp[0] = 1",
      "        dp[1] = 1",
      "        for i in range(2, n + 1):",
      "            dp[i] = dp[i-1] + dp[i-2]",
      "        return dp[n]",
    ],
    code2: [
      "# Optimized O(1) space",
      "class Solution:",
      "    def climbStairs(self, n: int) -> int:",
      "        if n <= 2:",
      "            return n",
      "        prev2, prev1 = 1, 2",
      "        for i in range(3, n + 1):",
      "            curr = prev1 + prev2",
      "            prev2 = prev1",
      "            prev1 = curr",
      "        return prev1",
    ],
    codeLabel: { vi: "Cách 1: DP Array O(n) space", en: "Approach 1: DP Array O(n) space" },
    code2Label: { vi: "Cách 2: Tối ưu O(1) space", en: "Approach 2: Optimized O(1) space" },
    builder: buildSteps70,
  },
  300: {
    id: 300,
    difficulty: "medium",
    slug: "longest-increasing-subsequence",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Longest Increasing Subsequence", en: "Longest Increasing Subsequence" },
    titleVi: { vi: "Dãy con tăng dài nhất", en: "Longest increasing subsequence" },
    statement: {
      vi: "Cho mảng số nguyên nums, trả về độ dài của dãy con tăng nghiêm ngặt dài nhất. Dãy con được tạo bằng cách xóa một số phần tử (có thể không xóa) mà giữ nguyên thứ tự các phần tử còn lại.",
      en: "Given an integer array nums, return the length of the longest strictly increasing subsequence. A subsequence is derived by deleting some or no elements without changing the order of the remaining elements.",
    },
    defaultInput: [10, 9, 2, 5, 3, 7, 101, 18],
    inputKind: "integer",
    extraParams: [
      {
        key: "approach",
        label: { vi: "Cách giải", en: "Approach" },
        type: "select",
        default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: DP O(n²)", en: "Approach 1: DP O(n²)" } },
          { value: "2", label: { vi: "Cách 2: Patience Sort O(n log n)", en: "Approach 2: Patience Sort O(n log n)" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1 (O(n²)): dp[i] = độ dài LIS kết thúc tại i. dp[i] = 1 + max(dp[j]) với j<i và nums[j]<nums[i].", en: "Approach 1 (O(n²)): dp[i] = LIS length ending at i. dp[i] = 1 + max(dp[j]) for j<i and nums[j]<nums[i]." },
      { vi: "Cách 2 (O(n log n)): Patience Sorting. Duy trì tails[]: tails[k] = đuôi nhỏ nhất của mọi IS dài k+1. Binary search để tìm vị trí chèn.", en: "Approach 2 (O(n log n)): Patience Sorting. Maintain tails[]: tails[k] = smallest tail of any IS of length k+1. Binary search to find insertion position." },
    ],
    complexity: {
      time: "O(n²) / O(n log n)",
      space: "O(n)",
      note: {
        vi: "Cách 1: 2 vòng lặp lồng → O(n²). Cách 2: Patience Sorting với binary search → O(n log n).",
        en: "Approach 1: two nested loops → O(n²). Approach 2: Patience Sorting with binary search → O(n log n).",
      },
    },
    code: [
      "class Solution:",
      "    def lengthOfLIS(self, nums):",
      "        n = len(nums)",
      "        dp = [1] * n",
      "        for i in range(1, n):",
      "            for j in range(i):",
      "                if nums[j] < nums[i]:",
      "                    dp[i] = max(dp[i], dp[j] + 1)",
      "        return max(dp)",
    ],
    code2: [
      "from bisect import bisect_left",
      "",
      "class Solution:",
      "    def lengthOfLIS(self, nums):",
      "        tails = []",
      "        for num in nums:",
      "            i = bisect_left(tails, num)",
      "            if i == len(tails):",
      "                tails.append(num)",
      "            else:",
      "                tails[i] = num",
      "        return len(tails)",
    ],
    codeLabel: { vi: "Cách 1: DP O(n²)", en: "Approach 1: DP O(n²)" },
    code2Label: { vi: "Cách 2: Binary Search O(n log n)", en: "Approach 2: Binary Search O(n log n)" },
    builder: buildSteps300,
  },
  509: {
    id: 509,
    difficulty: "easy",
    slug: "fibonacci-number",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Fibonacci Number", en: "Fibonacci Number" },
    titleVi: { vi: "Số Fibonacci", en: "Fibonacci number" },
    statement: {
      vi: "Dãy Fibonacci F(n) được định nghĩa: F(0) = 0, F(1) = 1, và F(n) = F(n-1) + F(n-2) với n > 1. Cho n, trả về F(n).",
      en: "The Fibonacci numbers F(n) are defined as: F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2) for n > 1. Given n, return F(n).",
    },
    defaultInput: [10],
    inputKind: "nonneg",
    inputLabel: { vi: "n", en: "n" },
    singleInput: true,
    maxInput: 30,
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn Approach", en: "Select Approach" },
        default: 1,
        options: [
          { value: 1, label: { vi: "1 — DP Array O(n)", en: "1 — DP Array O(n)" } },
          { value: 2, label: { vi: "2 — Optimized O(1) space", en: "2 — Optimized O(1) space" } },
        ],
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n) / O(1)",
      note: {
        vi: "Approach 1: O(n) time, O(n) space (bảng dp). Approach 2: O(n) time, O(1) space (2 biến).",
        en: "Approach 1: O(n) time, O(n) space (dp table). Approach 2: O(n) time, O(1) space (2 variables).",
      },
    },
    code: [
      "class Solution:",
      "    def fib(self, n):",
      "        dp = [0] * (n + 1)",
      "        if n >= 1:",
      "            dp[1] = 1",
      "        for i in range(2, n + 1):",
      "            dp[i] = dp[i-1] + dp[i-2]",
      "        return dp[n]",
    ],
    code2: [
      "# Optimized O(1) space",
      "class Solution:",
      "    def fib(self, n: int) -> int:",
      "        if n <= 1:",
      "            return n",
      "        prev2, prev1 = 0, 1",
      "        for i in range(2, n + 1):",
      "            curr = prev1 + prev2",
      "            prev2 = prev1",
      "            prev1 = curr",
      "        return prev1",
    ],
    codeLabel: { vi: "Cách 1: DP Array O(n) space", en: "Approach 1: DP Array O(n) space" },
    code2Label: { vi: "Cách 2: Tối ưu O(1) space", en: "Approach 2: Optimized O(1) space" },
    builder: buildSteps509,
  },
  688: {
    id: 688,
    difficulty: "medium",
    slug: "knight-probability-in-chessboard",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Knight Probability in Chessboard", en: "Knight Probability in Chessboard" },
    titleVi: { vi: "Xác suất mã ở trên bàn cờ", en: "Knight probability on board" },
    statement: {
      vi:
        "Trên bàn cờ n×n, quân mã bắt đầu tại (row, col). Sau đúng k bước di chuyển (mỗi bước chọn ngẫu nhiên 1 trong 8 hướng L), " +
        "trả về xác suất mã vẫn còn trên bàn cờ. Dùng DP.",
      en:
        "On an n×n chessboard, a knight starts at (row, col). After exactly k moves (each move randomly chosen from 8 L-directions), " +
        "return the probability the knight remains on the board. Uses DP.",
    },
    defaultInput: [3],
    inputKind: "positive",
    inputLabel: { vi: "n (kích thước bàn cờ)", en: "n (board size)" },
    singleInput: true,
    maxInput: 8,
    extraParams: [
      { key: "k", label: { vi: "k (số bước)", en: "k (moves)" }, default: 2 },
      { key: "row", label: { vi: "row (hàng bắt đầu)", en: "row (start row)" }, default: 0 },
      { key: "col", label: { vi: "col (cột bắt đầu)", en: "col (start col)" }, default: 0 },
    ],
    complexity: {
      time: "O(k·n²)",
      space: "O(n²)",
      note: {
        vi: "Mỗi bước duyệt n² ô, lặp k lần → O(k·n²). Lưu 2 bảng n×n → O(n²) bộ nhớ.",
        en: "Each step iterates n² cells, repeat k times → O(k·n²). Store 2 n×n tables → O(n²) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def knightProbability(self, n, k, row, col):",
      "        moves = [(-2,-1),(-2,1),(-1,-2),(-1,2),",
      "                 (1,-2),(1,2),(2,-1),(2,1)]",
      "        dp = [[0]*n for _ in range(n)]",
      "        dp[row][col] = 1.0",
      "        for step in range(k):",
      "            new_dp = [[0]*n for _ in range(n)]",
      "            for r in range(n):",
      "                for c in range(n):",
      "                    if dp[r][c] > 0:",
      "                        for dr, dc in moves:",
      "                            nr, nc = r+dr, c+dc",
      "                            if 0<=nr<n and 0<=nc<n:",
      "                                new_dp[nr][nc] += dp[r][c]/8",
      "            dp = new_dp",
      "        return sum(dp[r][c] for r in range(n) for c in range(n))",
    ],
    builder: buildSteps688,
  },
  1301: {
    id: 1301,
    difficulty: "hard",
    slug: "number-of-paths-with-max-score",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Number of Paths with Max Score", en: "Number of Paths with Max Score" },
    titleVi: { vi: "Số đường đi đạt điểm cao nhất", en: "Number of paths achieving max score" },
    statement: {
      vi:
        "Cho bảng chữ (E ở góc trên-trái, S ở góc dưới-phải, các số 0..9 là điểm cộng khi bước lên, 'X' là chướng ngại). " +
        "Từ S đi về E, mỗi bước có thể lên/trái/lên-trái theo đường chéo. Trả về [điểm cao nhất, số đường đạt điểm đó mod 1e9+7]. " +
        "Nếu không đến được E, trả về [0, 0].",
      en:
        "You are given a square board with 'E' at the top-left, 'S' at the bottom-right, digits 0..9 that add to your score when stepped on, and 'X' for obstacles. " +
        "From S you move up, left, or diagonally up-left toward E. Return [max score, number of paths achieving it mod 1e9+7]. " +
        "If E is unreachable, return [0, 0].",
    },
    defaultInput: "E23|2X2|12S",
    inputKind: "string",
    inputLabel: { vi: "board (hàng cách bởi |; chữ liền nhau hoặc cách bởi dấu phẩy)", en: "board (rows split by |; chars run together or comma-separated)" },
    extraParams: [],
    complexity: {
      time: "O(m·n)",
      space: "O(m·n)",
      note: {
        vi: "Điền bảng dp/cnt kích thước m×n, mỗi ô O(1) → O(m·n).",
        en: "Fill an m×n dp/cnt table, O(1) per cell → O(m·n).",
      },
    },
    code: [
      "class Solution:",
      "    def pathsWithMaxScore(self, board):",
      "        MOD = 10**9 + 7",
      "        m, n = len(board), len(board[0])",
      "        # dp[r][c] = max score, cnt[r][c] = # paths",
      "        dp = [[-1]*n for _ in range(m)]",
      "        cnt = [[0]*n for _ in range(m)]",
      "        dp[m-1][n-1], cnt[m-1][n-1] = 0, 1",
      "        for r in range(m-1, -1, -1):",
      "            for c in range(n-1, -1, -1):",
      "                if (r, c) == (m-1, n-1) or board[r][c] == 'X':",
      "                    continue",
      "                best, ways = -1, 0",
      "                for dr, dc in ((1,0),(0,1),(1,1)):",
      "                    pr, pc = r+dr, c+dc",
      "                    if pr >= m or pc >= n or dp[pr][pc] < 0:",
      "                        continue",
      "                    if dp[pr][pc] > best:",
      "                        best, ways = dp[pr][pc], cnt[pr][pc]",
      "                    elif dp[pr][pc] == best:",
      "                        ways = (ways + cnt[pr][pc]) % MOD",
      "                if best < 0:",
      "                    continue",
      "                digit = int(board[r][c]) if board[r][c].isdigit() else 0",
      "                dp[r][c], cnt[r][c] = best + digit, ways",
      "        if dp[0][0] < 0:",
      "            return [0, 0]",
      "        return [dp[0][0], cnt[0][0]]",
    ],
    builder: buildSteps1301,
  },
  1388: {
    id: 1388,
    difficulty: "hard",
    slug: "pizza-with-3n-slices",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Pizza With 3n Slices", en: "Pizza With 3n Slices" },
    titleVi: { vi: "Chia bánh 3n miếng (House Robber circular tổng quát)", en: "Pizza with 3n slices" },
    statement: {
      vi:
        "Có 3n miếng pizza xếp thành vòng tròn. Mỗi lượt: bạn chọn một miếng bất kỳ; Alice ăn miếng kề bên trái theo chiều ngược kim đồng hồ; Bob ăn miếng kề bên phải theo chiều kim đồng hồ. Lặp cho đến hết. " +
        "Trả về tổng lớn nhất bạn có thể ăn.",
      en:
        "You have a pizza with 3n slices arranged in a circle. Each round: you pick any slice; Alice picks the neighbour anti-clockwise; Bob picks the neighbour clockwise. Repeat until all slices are gone. " +
        "Return the maximum total size of slices you can pick.",
    },
    defaultInput: [1, 2, 3, 4, 5, 6],
    inputKind: "nonneg",
    inputLabel: { vi: "slices (3n miếng)", en: "slices (3n slices)" },
    extraParams: [],
    complexity: {
      time: "O(n²)",
      space: "O(n²)",
      note: {
        vi:
          "Bài quy về: chọn n phần tử KHÔNG KỀ NHAU từ mảng vòng tròn 3n để tổng lớn nhất. " +
          "Vòng tròn → chạy 2 lần tuyến tính (bỏ đầu / bỏ cuối). " +
          "Mỗi lần dùng DP 2D dp[i][j] với i ≤ 3n, j ≤ n → O(n²) thời gian và bộ nhớ.",
        en:
          "Reduces to: pick n NON-ADJACENT elements from a circular array of 3n to maximise sum. " +
          "Circular → run two linear DPs (drop first / drop last). " +
          "Each pass is a 2D DP dp[i][j] with i ≤ 3n, j ≤ n → O(n²) time and space.",
      },
    },
    code: [
      "class Solution:",
      "    def maxSizeSlices(self, slices):",
      "        # Reduce to: pick n non-adjacent from circular array of 3n.",
      "        n = len(slices) // 3",
      "        def pick(arr):",
      "            m = len(arr)",
      "            # dp[i][j] = max sum picking j non-adjacent from arr[0..i-1]",
      "            dp = [[0]*(n+1) for _ in range(m+1)]",
      "            for i in range(1, m+1):",
      "                for j in range(1, n+1):",
      "                    skip = dp[i-1][j]",
      "                    take = (dp[i-2][j-1] + arr[i-1]) if i >= 2 else (arr[i-1] if j == 1 else -10**9)",
      "                    dp[i][j] = max(skip, take)",
      "            return dp[m][n]",
      "        # Circular trick: drop first or drop last, take max.",
      "        return max(pick(slices[:-1]), pick(slices[1:]))",
    ],
    builder: buildSteps1388,
  },
  494: {
    id: 494,
    difficulty: "medium",
    slug: "target-sum",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Target Sum", en: "Target Sum" },
    titleVi: { vi: "Gán ± cho tổng bằng target (subset sum)", en: "Assign ± to reach target (subset sum)" },
    statement: {
      vi:
        "Cho mảng số nguyên không âm nums và số nguyên target. Gán '+' hoặc '−' cho mỗi phần tử " +
        "để tổng có dấu bằng target. Trả về SỐ CÁCH gán.",
      en:
        "Given a non-negative integer array nums and an integer target, assign '+' or '−' to each element " +
        "so the signed sum equals target. Return the number of such assignments.",
    },
    defaultInput: [1, 1, 1, 1, 1],
    inputKind: "nonneg",
    extraParams: [
      {
        key: "target",
        type: "number",
        label: { vi: "target", en: "target" },
        default: 3,
        allowNegative: true,
      },
    ],
    complexity: {
      time: "O(n · P)",
      space: "O(P)",
      note: {
        vi:
          "Sau khi quy về subset sum, P = (sum+target)/2. Bảng dp dài P+1, mỗi num duyệt xuống một lần → O(n·P) thời gian, O(P) bộ nhớ.",
        en:
          "After reducing to subset sum, P = (sum+target)/2. A dp array of length P+1 with one downward pass per num → O(n·P) time and O(P) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def findTargetSumWays(self, nums, target):",
      "        total = sum(nums)",
      "        # Feasibility: (total+target) even AND |target| <= total",
      "        if abs(target) > total or (total + target) % 2 != 0:",
      "            return 0",
      "        P = (total + target) // 2",
      "        # dp[j] = number of subsets summing to j",
      "        dp = [0] * (P + 1)",
      "        dp[0] = 1",
      "        for num in nums:",
      "            for j in range(P, num - 1, -1):",
      "                dp[j] += dp[j - num]",
      "        return dp[P]",
    ],
    builder: buildSteps494,
  },
  1463: {
    id: 1463,
    difficulty: "hard",
    slug: "cherry-pickup-ii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Cherry Pickup II", en: "Cherry Pickup II" },
    titleVi: { vi: "Thu cherry (2 robots trên grid)", en: "2 robots collect max cherries" },
    statement: {
      vi: "Grid rows×cols, mỗi ô chứa cherry. Robot1 tại (0,0), Robot2 tại (0,cols-1). Cả 2 cùng đi xuống (↙/↓/↘). Nếu cùng ô thì chỉ thu 1 lần. Tìm tổng cherry TỐI ĐA. Nhập grid: hàng cách ';', giá trị cách ','.",
      en: "Grid rows×cols, each cell has cherries. Robot1 at (0,0), Robot2 at (0,cols-1). Both move down (↙/↓/↘). If same cell, only collect once. Find MAX total cherries. Enter grid: rows by ';', values by ','.",
    },
    defaultInput: "3,1,1;2,5,1;1,5,5;2,1,1",
    inputKind: "string",
    inputLabel: { vi: "Grid (hàng cách ';')", en: "Grid (rows by ';')" },
    extraParams: [],
    approach: [
      { vi: "DP 3D: dp[r][c1][c2] = max cherry từ hàng r trở xuống khi robots ở cột c1 và c2.", en: "3D DP: dp[r][c1][c2] = max cherries from row r downward with robots at columns c1 and c2." },
      { vi: "Base: hàng cuối, dp = grid[r][c1] + grid[r][c2] (hoặc chỉ 1 lần nếu c1==c2).", en: "Base: last row, dp = grid[r][c1] + grid[r][c2] (or once if c1==c2)." },
      { vi: "Transition: dp[r][c1][c2] = cherries + max(dp[r+1][c1±1/0][c2±1/0]) — 9 tổ hợp.", en: "Transition: dp[r][c1][c2] = cherries + max(dp[r+1][c1±1/0][c2±1/0]) — 9 combinations." },
      { vi: "Đáp án = dp[0][0][cols-1].", en: "Answer = dp[0][0][cols-1]." },
    ],
    complexity: { time: "O(rows · cols² · 9)", space: "O(cols²)", note: { vi: "Mỗi hàng xét cols² cặp × 9 di chuyển. Bộ nhớ: 2 lớp cols².", en: "Each row checks cols² pairs × 9 moves. Memory: two cols² layers." } },
    code: [
      "class Solution:",
      "    def cherryPickup(self, grid):",
      "        rows, cols = len(grid), len(grid[0])",
      "        dp = [[-1]*cols for _ in range(cols)]",
      "        dp[0][cols-1] = grid[0][0] + grid[0][cols-1]",
      "        for r in range(1, rows):",
      "            ndp = [[-1]*cols for _ in range(cols)]",
      "            for c1 in range(min(r+1, cols)):",
      "                for c2 in range(max(0, cols-1-r), cols):",
      "                    for dc1 in (-1, 0, 1):",
      "                        for dc2 in (-1, 0, 1):",
      "                            pc1, pc2 = c1-dc1, c2-dc2",
      "                            if 0<=pc1<cols and 0<=pc2<cols and dp[pc1][pc2]>=0:",
      "                                val = grid[r][c1]+(grid[r][c2] if c1!=c2 else 0)",
      "                                ndp[c1][c2] = max(ndp[c1][c2], dp[pc1][pc2]+val)",
      "            dp = ndp",
      "        return max(max(row) for row in dp)",
    ],
    builder: buildSteps1463,
  },
  174: {
    id: 174,
    difficulty: "hard",
    slug: "dungeon-game",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Dungeon Game", en: "Dungeon Game" },
    titleVi: { vi: "HP tối thiểu qua dungeon", en: "Min initial HP to survive" },
    statement: {
      vi: "Hiệp sĩ đi từ (0,0) đến (m-1,n-1), chỉ được đi PHẢI hoặc XUỐNG. Mỗi ô có giá trị (âm=mất HP, dương=hồi HP). HP phải luôn ≥ 1. Tìm HP KHỞI ĐẦU tối thiểu. Nhập grid: hàng cách ';', giá trị cách ','.",
      en: "Knight goes from (0,0) to (m-1,n-1), can only move RIGHT or DOWN. Each cell has a value (negative=damage, positive=heal). HP must always ≥ 1. Find the minimum INITIAL HP. Enter grid: rows by ';', values by ','.",
    },
    defaultInput: "-2,-3,3;-5,-10,1;10,30,-5",
    inputKind: "string",
    inputLabel: { vi: "Grid (hàng cách ';')", en: "Grid (rows by ';')" },
    extraParams: [],
    approach: [
      { vi: "DP NGƯỢC (bottom-right → top-left): dp[i][j] = HP tối thiểu khi VÀO ô (i,j) để sống tới đích.", en: "REVERSE DP (bottom-right → top-left): dp[i][j] = min HP when ENTERING cell (i,j) to survive to the goal." },
      { vi: "dp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) − grid[i][j]).", en: "dp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) − grid[i][j])." },
      { vi: "max(1,...) vì HP không được rớt dưới 1 tại bất kỳ ô nào.", en: "max(1,...) because HP cannot drop below 1 at any cell." },
      { vi: "Đáp án = dp[0][0]. Không thể dùng DP xuôi vì path tối ưu phụ thuộc cả tương lai.", en: "Answer = dp[0][0]. Cannot use forward DP because the optimal path depends on future cells." },
    ],
    complexity: { time: "O(m·n)", space: "O(m·n)", note: { vi: "1 lần fill bảng m×n.", en: "Single pass to fill the m×n table." } },
    code: [
      "class Solution:",
      "    def calculateMinimumHP(self, dungeon):",
      "        m, n = len(dungeon), len(dungeon[0])",
      "        dp = [[0]*n for _ in range(m)]",
      "        dp[m-1][n-1] = max(1, 1 - dungeon[m-1][n-1])",
      "        # Last row",
      "        for j in range(n-2, -1, -1):",
      "            dp[m-1][j] = max(1, dp[m-1][j+1] - dungeon[m-1][j])",
      "        # Last col",
      "        for i in range(m-2, -1, -1):",
      "            dp[i][n-1] = max(1, dp[i+1][n-1] - dungeon[i][n-1])",
      "        # Rest",
      "        for i in range(m-2, -1, -1):",
      "            for j in range(n-2, -1, -1):",
      "                dp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) - dungeon[i][j])",
      "        return dp[0][0]",
    ],
    builder: buildSteps174,
  },
  1049: {
    id: 1049,
    difficulty: "medium",
    slug: "last-stone-weight-ii",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Last Stone Weight II", en: "Last Stone Weight II" },
    titleVi: { vi: "Trọng lượng đá cuối (DP)", en: "Min last stone weight (DP knapsack)" },
    statement: {
      vi: "Mỗi lần lấy 2 hòn đá x, y đập nhau → còn |x-y|. Tìm trọng lượng NHỎ NHẤT có thể còn lại. Nhập mảng số nguyên dương.",
      en: "Each turn take two stones x, y and smash → |x-y| remains. Find the minimum possible weight of the last stone. Enter positive integer array.",
    },
    defaultInput: [2, 7, 4, 1, 8, 1],
    inputKind: "positive",
    inputLabel: { vi: "Trọng lượng đá (dấu phẩy)", en: "Stone weights (comma-sep)" },
    extraParams: [],
    approach: [
      { vi: "Tương đương: chia đá thành 2 nhóm sao cho |sum1 - sum2| TỐI THIỂU.", en: "Equivalent: partition stones into 2 groups minimizing |sum1 - sum2|." },
      { vi: "0/1 Knapsack: dp[j] = True nếu subset tổng j đạt được. target = floor(total/2).", en: "0/1 Knapsack: dp[j] = True if subset sum j is achievable. target = floor(total/2)." },
      { vi: "Đáp án = total - 2 × (tổng lớn nhất ≤ target đạt được).", en: "Answer = total - 2 × (largest achievable sum ≤ target)." },
    ],
    complexity: { time: "O(n · S)", space: "O(S)", note: { vi: "S = total/2. Mỗi đá duyệt S ô.", en: "S = total/2. Each stone iterates S cells." } },
    code: [
      "class Solution:",
      "    def lastStoneWeightII(self, stones):",
      "        total = sum(stones)",
      "        target = total // 2",
      "        dp = [False] * (target + 1)",
      "        dp[0] = True",
      "        for s in stones:",
      "            for j in range(target, s - 1, -1):",
      "                dp[j] = dp[j] or dp[j - s]",
      "        for j in range(target, -1, -1):",
      "            if dp[j]:",
      "                return total - 2 * j",
    ],
    builder: buildSteps1049,
  },
};
