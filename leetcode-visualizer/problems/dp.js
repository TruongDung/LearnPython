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
        { name: "optA", value: optA },
        { name: "optB", value: optB },
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
function buildSteps300(nums) {
  const n = nums.length;
  const dp = new Array(n).fill(1);
  const prev = new Array(n).fill(-1);
  const steps = [];

  steps.push({
    title: { vi: "Khởi tạo dp", en: "Initialize dp" },
    arr: [...nums],
    sub: [...dp],
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "n", value: n },
      { name: "dp", value: [...dp] },
    ],
    note: {
      vi: `nums = [${nums.join(", ")}]. dp[i] = độ dài dãy tăng dài nhất kết thúc tại i, khởi tạo toàn 1 (mỗi phần tử tự nó là một dãy).`,
      en: `nums = [${nums.join(", ")}]. dp[i] = length of the longest increasing subsequence ending at i, all initialized to 1 (each element alone is a subsequence).`,
    },
  });

  for (let i = 1; i < n; i++) {
    let bestJ = -1;
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
        bestJ = j;
      }
    }
    prev[i] = bestJ;

    const highlight = bestJ >= 0 ? [bestJ, i] : [i];
    steps.push({
      title: { vi: `Tính dp[${i}]`, en: `Compute dp[${i}]` },
      arr: [...nums],
      sub: [...dp],
      highlight,
      mark: [],
      codeLines: [5, 6, 7, 8],
      vars: [
        { name: "i", value: i },
        { name: "nums[i]", value: nums[i] },
        { name: "bestJ", value: bestJ },
        { name: "dp[i]", value: dp[i] },
        { name: "dp", value: [...dp] },
      ],
      note:
        bestJ >= 0
          ? {
              vi: `nums[${i}]=${nums[i]} nối sau nums[${bestJ}]=${nums[bestJ]} (dãy tăng dài nhất). dp[${i}] = dp[${bestJ}] + 1 = ${dp[i]}.`,
              en: `nums[${i}]=${nums[i]} extends after nums[${bestJ}]=${nums[bestJ]} (best chain). dp[${i}] = dp[${bestJ}] + 1 = ${dp[i]}.`,
            }
          : {
              vi: `Không có phần tử trước nào nhỏ hơn nums[${i}]=${nums[i]}, nên dp[${i}] giữ nguyên = 1.`,
              en: `No earlier element is smaller than nums[${i}]=${nums[i]}, so dp[${i}] stays 1.`,
            },
    });
  }

  let answer = 0;
  let argmax = 0;
  for (let i = 0; i < n; i++) {
    if (dp[i] > answer) {
      answer = dp[i];
      argmax = i;
    }
  }

  // Reconstruct one longest subsequence by walking predecessors back from argmax.
  const chain = [];
  for (let i = argmax; i !== -1; i = prev[i]) {
    chain.push(i);
  }
  chain.reverse();
  const chainValues = chain.map((i) => nums[i]);

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    sub: [...dp],
    highlight: [],
    mark: chain,
    final: true,
    codeLines: [9],
    vars: [
      { name: "answer", value: answer },
      { name: "LIS", value: chainValues },
    ],
    note: {
      vi: `Độ dài dãy con tăng dài nhất = max(dp) = ${answer}. Một dãy đạt được: [${chainValues.join(", ")}] (các vị trí ${chain.join(", ")}).`,
      en: `Length of the longest increasing subsequence = max(dp) = ${answer}. One such subsequence: [${chainValues.join(", ")}] (indices ${chain.join(", ")}).`,
    },
  });

  return { original: [...nums], answer, chain, steps };
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
        { name: "extend?", value: `cur+nums[i] = ${extendSum} ${restart ? "<" : "≥"} nums[i] = ${num} → ${restart ? "restart" : "extend"}` },
        { name: "cur", value: cur },
        { name: "cur subarray", value: `[${curSubarray.join(", ")}]` },
        { name: "best", value: best },
        { name: "best subarray", value: `[${bestSubarray.join(", ")}] (i=${bestL}..${bestR})` },
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
function buildSteps198(nums) {
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
    ],
    note: {
      vi: `Tiền lớn nhất = dp[${n - 1}] = ${answer}. Cướp các nhà [${robbed.join(", ")}] = [${robbed.map((j) => nums[j]).join(", ")}].`,
      en: `Maximum loot = dp[${n - 1}] = ${answer}. Rob houses [${robbed.join(", ")}] = [${robbed.map((j) => nums[j]).join(", ")}].`,
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

  steps.push({
    title: { vi: "Ý tưởng: vòng tròn", en: "Idea: circular constraint" },
    arr: [...nums],
    highlight: [0, n - 1],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [{ name: "n", value: n }],
    note: {
      vi: `Nhà 0 và nhà ${n - 1} liền kề (vòng tròn). Tách thành 2 bài: bỏ nhà cuối (Pass A) và bỏ nhà đầu (Pass B).`,
      en: `House 0 and house ${n - 1} are adjacent (circular). Split into 2 sub-problems: exclude last (Pass A) and exclude first (Pass B).`,
    },
  });

  function robRange(lo, hi, passLabel) {
    const len = hi - lo + 1;
    const dp = new Array(len).fill(0);
    dp[0] = nums[lo];
    if (len >= 2) dp[1] = Math.max(nums[lo], nums[lo + 1]);

    const hlBase = lo;
    steps.push({
      title: { vi: `${passLabel}: khởi tạo dp`, en: `${passLabel}: init dp` },
      arr: [...nums],
      sub: new Array(lo).fill("").concat([...dp]).concat(new Array(n - hi - 1).fill("")),
      highlight: len >= 2 ? [lo, lo + 1] : [lo],
      mark: [],
      codeLines: [7, 8, 9],
      vars: [
        { name: "range", value: `[${lo}..${hi}]` },
        { name: "dp[0]", value: dp[0] },
        { name: "dp[1]", value: len >= 2 ? dp[1] : "-" },
      ],
      note: {
        vi: `${passLabel}: xét nums[${lo}..${hi}]. dp[0]=${dp[0]}, dp[1]=${len >= 2 ? dp[1] : "-"}.`,
        en: `${passLabel}: consider nums[${lo}..${hi}]. dp[0]=${dp[0]}, dp[1]=${len >= 2 ? dp[1] : "-"}.`,
      },
    });

    for (let j = 2; j < len; j++) {
      const idx = lo + j;
      const skip = dp[j - 1];
      const rob = dp[j - 2] + nums[idx];
      dp[j] = Math.max(skip, rob);
      const robbed = dp[j] === rob;

      steps.push({
        title: { vi: `${passLabel}: dp[${j}] (nhà ${idx})`, en: `${passLabel}: dp[${j}] (house ${idx})` },
        arr: [...nums],
        sub: new Array(lo).fill("").concat([...dp]).concat(new Array(n - hi - 1).fill("")),
        highlight: [lo + j - 2, lo + j - 1, idx],
        mark: [],
        codeLines: [10, 11],
        vars: [
          { name: "i", value: idx },
          { name: "skip", value: skip },
          { name: "rob", value: rob },
          { name: "dp[i]", value: dp[j] },
          { name: "decision", value: robbed ? "rob" : "skip" },
        ],
        note: {
          vi: `Bỏ: dp[${j - 1}]=${skip}. Cướp: dp[${j - 2}]+${nums[idx]}=${rob}. → ${dp[j]} (${robbed ? "cướp" : "bỏ"}).`,
          en: `Skip: dp[${j - 1}]=${skip}. Rob: dp[${j - 2}]+${nums[idx]}=${rob}. → ${dp[j]} (${robbed ? "rob" : "skip"}).`,
        },
      });
    }

    const result = dp[len - 1];

    // Trace back which houses
    const robbed = [];
    let k = len - 1;
    while (k >= 0) {
      if (k === 0 || dp[k] !== dp[k - 1]) {
        robbed.push(lo + k);
        k -= 2;
      } else {
        k -= 1;
      }
    }
    robbed.reverse();

    return { result, robbed, dp };
  }

  const passA = robRange(0, n - 2, "Pass A");
  steps.push({
    title: { vi: "Pass A: kết quả", en: "Pass A: result" },
    arr: [...nums],
    highlight: [],
    mark: passA.robbed,
    codeLines: [12],
    vars: [
      { name: "passA", value: passA.result },
      { name: "robbed", value: passA.robbed },
    ],
    note: {
      vi: `Pass A (bỏ nhà ${n - 1}): max = ${passA.result}. Cướp nhà [${passA.robbed.join(",")}].`,
      en: `Pass A (exclude house ${n - 1}): max = ${passA.result}. Rob houses [${passA.robbed.join(",")}].`,
    },
  });

  const passB = robRange(1, n - 1, "Pass B");
  steps.push({
    title: { vi: "Pass B: kết quả", en: "Pass B: result" },
    arr: [...nums],
    highlight: [],
    mark: passB.robbed,
    codeLines: [12],
    vars: [
      { name: "passB", value: passB.result },
      { name: "robbed", value: passB.robbed },
    ],
    note: {
      vi: `Pass B (bỏ nhà 0): max = ${passB.result}. Cướp nhà [${passB.robbed.join(",")}].`,
      en: `Pass B (exclude house 0): max = ${passB.result}. Rob houses [${passB.robbed.join(",")}].`,
    },
  });

  const answer = Math.max(passA.result, passB.result);
  const bestRobbed = passA.result >= passB.result ? passA.robbed : passB.robbed;
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: bestRobbed,
    final: true,
    codeLines: [13],
    vars: [
      { name: "passA", value: passA.result },
      { name: "passB", value: passB.result },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Đáp án = max(${passA.result}, ${passB.result}) = ${answer}. Cướp nhà [${bestRobbed.join(", ")}] = [${bestRobbed.map((j) => nums[j]).join(", ")}].`,
      en: `Answer = max(${passA.result}, ${passB.result}) = ${answer}. Rob houses [${bestRobbed.join(", ")}] = [${bestRobbed.map((j) => nums[j]).join(", ")}].`,
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
    vars: [{ name: "answer", value: answer }, { name: "target", value: target }],
    note: {
      vi: answer ? `dp[${target}] = True → có thể chia thành 2 tập bằng nhau (mỗi tập tổng ${target}).` : `dp[${target}] = False → không thể chia đều.`,
      en: answer ? `dp[${target}] = True → can partition into two equal subsets (each sum ${target}).` : `dp[${target}] = False → cannot partition equally.`,
    },
  });

  return { original: [...nums], answer, steps };
}

module.exports = {
  // Category metadata: recommended learning order + detailed guide.
  // Picked up by problems/index.js and exposed to server.js via CATEGORY_ORDER.
  __meta: {
    order: [509, 70, 746, 198, 213, 740, 53, 152, 300, 322, 518, 279, 139, 91, 62, 64, 120, 931, 1143, 72, 416],
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
            problems: [53, 152, 300],
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
            problems: [53, 152, 300],
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
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Điền bảng dp một lần nên O(n) thời gian. Bảng dp dài n nên O(n) bộ nhớ (có thể tối ưu xuống O(1) bằng 2 biến).",
        en: "A single pass to fill dp gives O(n) time. The dp table of length n is O(n) memory (optimizable to O(1) with two variables).",
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
      space: "O(1) / O(n)",
      note: {
        vi: "Approach 1: Kadane O(n) time, O(1) space. Approach 2: DP array O(n) time, O(n) space.",
        en: "Approach 1: Kadane O(n) time, O(1) space. Approach 2: DP array O(n) time, O(n) space.",
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
    inputKind: "integer", // cho phép số âm
    extraParams: [],
    complexity: {
      time: "O(n²)",
      space: "O(n)",
      note: {
        vi: "Hai vòng lặp lồng nhau (mỗi i so với mọi j < i) cho O(n²) thời gian. Bảng dp dài n nên O(n) bộ nhớ. (Có bản O(n log n) dùng tìm kiếm nhị phân.)",
        en: "Two nested loops (each i compared with every j < i) give O(n²) time. The dp table of length n is O(n) memory. (An O(n log n) version exists using binary search.)",
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
};
