const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/**
 * Generate steps for LeetCode 1846:
 * Maximum Element After Decreasing and Rearranging.
 *
 * Algorithm:
 *  1. Sort the array in ascending order.
 *  2. arr[0] = 1.
 *  3. For each i: arr[i] = min(arr[i], arr[i-1] + 1).
 *  4. The answer is the last (largest) element.
 */
function buildSteps1846(input) {
  const original = [...input];
  const sorted = [...input].sort((a, b) => a - b);
  const steps = [];

  // Initialization step: original array
  steps.push({
    title: { vi: "Mảng ban đầu", en: "Initial array" },
    arr: [...original],
    highlight: [],
    codeLines: [2],
    vars: [
      { name: "n", value: original.length },
      { name: "arr", value: [...original] },
    ],
    note: {
      vi: `Mảng đầu vào: [${original.join(", ")}]. Ta được phép giảm bất kỳ phần tử nào và sắp xếp lại.`,
      en: `Input array: [${original.join(", ")}]. We may decrease any element and rearrange freely.`,
    },
  });

  // Sorting step
  steps.push({
    title: { vi: "Bước 1: Sắp xếp tăng dần", en: "Step 1: Sort ascending" },
    arr: [...sorted],
    highlight: sorted.map((_, i) => i),
    codeLines: [3],
    vars: [{ name: "arr", value: [...sorted] }],
    note: {
      vi: `Sắp xếp giúp mỗi phần tử chỉ cần lớn hơn phần tử trước tối đa 1 đơn vị: [${sorted.join(", ")}].`,
      en: `Sorting lets each element exceed the previous one by at most 1: [${sorted.join(", ")}].`,
    },
  });

  const work = [...sorted];

  // Set first element = 1
  const before0 = work[0];
  work[0] = 1;
  steps.push({
    title: { vi: "Bước 2: Ép arr[0] = 1", en: "Step 2: Force arr[0] = 1" },
    arr: [...work],
    highlight: [0],
    codeLines: [4],
    vars: [
      { name: "before", value: before0 },
      { name: "arr[0]", value: 1 },
      { name: "arr", value: [...work] },
    ],
    note: {
      vi: `Theo yêu cầu arr[0] phải bằng 1, nên giảm ${before0} → 1.`,
      en: `The constraint requires arr[0] = 1, so decrease ${before0} → 1.`,
    },
  });

  // Loop: assign arr[i] = min(arr[i], arr[i-1] + 1)
  for (let i = 1; i < work.length; i++) {
    const cur = work[i];
    const cap = work[i - 1] + 1;
    const next = Math.min(cur, cap);
    work[i] = next;

    let note;
    if (next < cur) {
      note = {
        vi: `i=${i}: arr[i]=${cur} > arr[i-1]+1=${cap}, nên giảm xuống ${next} để giữ |arr[i]-arr[i-1]| ≤ 1.`,
        en: `i=${i}: arr[i]=${cur} > arr[i-1]+1=${cap}, so decrease to ${next} to keep |arr[i]-arr[i-1]| ≤ 1.`,
      };
    } else {
      note = {
        vi: `i=${i}: arr[i]=${cur} ≤ arr[i-1]+1=${cap}, giữ nguyên ${next}.`,
        en: `i=${i}: arr[i]=${cur} ≤ arr[i-1]+1=${cap}, keep it as ${next}.`,
      };
    }

    steps.push({
      title: { vi: `Bước 3.${i}: Xét vị trí i=${i}`, en: `Step 3.${i}: Inspect index i=${i}` },
      arr: [...work],
      highlight: [i - 1, i],
      codeLines: [5, 6],
      vars: [
        { name: "i", value: i },
        { name: "arr[i-1]", value: work[i - 1] },
        { name: "arr[i] (old)", value: cur },
        { name: "cap = arr[i-1]+1", value: cap },
        { name: "arr[i] (new)", value: next },
        { name: "arr", value: [...work] },
      ],
      note,
    });
  }

  const answer = work[work.length - 1];
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...work],
    highlight: [],
    mark: [work.length - 1],
    final: true,
    codeLines: [7],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Phần tử cuối cùng là giá trị lớn nhất có thể đạt được = ${answer}.`,
      en: `The last element is the maximum achievable value = ${answer}.`,
    },
  });

  return { original, sorted, answer, steps };
}

/**
 * Generate steps for LeetCode 1004: Max Consecutive Ones III.
 *
 * Sliding window algorithm:
 *  - Expand the window by incrementing j.
 *  - Count zeros in the window. When exceeding k, shrink from the left (increment i).
 *  - The answer is the maximum window length achieved.
 */
function buildSteps1004(nums, params) {
  const k = params.k;
  const steps = [];

  const inWindow = (i, j) => Array.from({ length: j - i + 1 }, (_, t) => i + t);

  steps.push({
    title: { vi: "Mảng ban đầu", en: "Initial array" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [{ name: "k", value: k }],
    note: {
      vi: `Mảng nhị phân: [${nums.join(", ")}], k = ${k}. Được phép lật tối đa ${k} số 0 thành 1.`,
      en: `Binary array: [${nums.join(", ")}], k = ${k}. You may flip at most ${k} zeros to ones.`,
    },
  });

  let i = 0;
  let zeroCount = 0;
  let maxLength = 0;
  let bestI = 0;
  let bestJ = -1;

  for (let j = 0; j < nums.length; j++) {
    if (nums[j] === 0) zeroCount += 1;

    // Expand window to j
    steps.push({
      title: { vi: `Mở rộng: j = ${j}`, en: `Expand: j = ${j}` },
      arr: [...nums],
      highlight: inWindow(i, j),
      mark: [],
      codeLines: [6, 7, 8],
      vars: [
        { name: "i", value: i },
        { name: "j", value: j },
        { name: "zeroCount", value: zeroCount },
        { name: "maxLength", value: maxLength },
      ],
      note: {
        vi: `Thêm phần tử ${nums[j]} ở vị trí ${j}. Số 0 trong cửa sổ [${i}..${j}] = ${zeroCount}.`,
        en: `Add element ${nums[j]} at index ${j}. Zeros in window [${i}..${j}] = ${zeroCount}.`,
      },
    });

    // Shrink window when zeros exceed k
    while (zeroCount > k) {
      const removed = nums[i];
      if (nums[i] === 0) zeroCount -= 1;
      i += 1;
      steps.push({
        title: { vi: `Co cửa sổ: i = ${i}`, en: `Shrink: i = ${i}` },
        arr: [...nums],
        highlight: inWindow(i, j),
        mark: [],
        codeLines: [9, 10, 11, 12],
        vars: [
          { name: "i", value: i },
          { name: "j", value: j },
          { name: "zeroCount", value: zeroCount },
          { name: "maxLength", value: maxLength },
        ],
        note: {
          vi: `Số 0 (${zeroCount + (removed === 0 ? 1 : 0)}) vượt quá k=${k}. Bỏ phần tử ${removed} ở trái, dời i → ${i}. Số 0 còn ${zeroCount}.`,
          en: `Zeros exceeded k=${k}. Drop element ${removed} on the left, move i → ${i}. Zeros now ${zeroCount}.`,
        },
      });
    }

    const length = j - i + 1;
    if (length > maxLength) {
      maxLength = length;
      bestI = i;
      bestJ = j;
      steps.push({
        title: { vi: `Cập nhật max = ${maxLength}`, en: `Update max = ${maxLength}` },
        arr: [...nums],
        highlight: inWindow(i, j),
        mark: [],
        codeLines: [13],
        vars: [
          { name: "i", value: i },
          { name: "j", value: j },
          { name: "maxLength", value: maxLength },
          { name: "zeroCount", value: zeroCount },
        ],
        note: {
          vi: `Cửa sổ hợp lệ [${i}..${j}] dài ${length} > kỷ lục cũ. Cập nhật đáp án = ${maxLength}.`,
          en: `Valid window [${i}..${j}] of length ${length} beats the record. Update answer = ${maxLength}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: bestJ >= 0 ? inWindow(bestI, bestJ) : [],
    final: true,
    codeLines: [14],
    vars: [
      { name: "maxLength", value: maxLength },
      { name: "window", value: bestJ >= 0 ? `[${bestI}..${bestJ}]` : "-" },
    ],
    note: {
      vi: `Cửa sổ dài nhất là [${bestI}..${bestJ}] với độ dài ${maxLength}. Đáp án = ${maxLength}.`,
      en: `The longest window is [${bestI}..${bestJ}] with length ${maxLength}. Answer = ${maxLength}.`,
    },
  });

  return { original: [...nums], k, answer: maxLength, steps };
}

/**
 * Generate steps for LeetCode 746: Min Cost Climbing Stairs.
 *
 * Dynamic programming:
 *  - dp[i] = minimum cost to reach step i (0-indexed, with "top" = n).
 *  - dp[0] = dp[1] = 0 (allowed to start at step 0 or 1).
 *  - dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]).
 *  - The answer is dp[n].
 */
function buildSteps746(cost) {
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
function buildSteps70(input) {
  const n = input[0];
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
      vi: `n = ${n}. dp[0] = dp[1] = 1 (có 1 cách đứng yên ở bậc 0, và 1 cách lên bậc 1).`,
      en: `n = ${n}. dp[0] = dp[1] = 1 (one way to stay at step 0, one way to reach step 1).`,
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
        { name: "dp", value: [...dp] },
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
function buildSteps509(input) {
  const n = input[0];
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
      vi: `n = ${n}. F(0) = 0 và F(1) = 1 là hai giá trị cơ sở.`,
      en: `n = ${n}. F(0) = 0 and F(1) = 1 are the base cases.`,
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
 * Generate steps for LeetCode 1: Two Sum (using hash map).
 *
 *  - For each i, check if (target - nums[i]) has already appeared.
 *  - If yes: found the pair of indices.
 *  - If no: store nums[i] -> i in the hash map.
 */
function buildSteps1(nums, params) {
  const target = params.target;
  const steps = [];
  const seen = {};

  const dictStr = () => {
    const entries = Object.keys(seen).map((k) => `${k}:${seen[k]}`);
    return `{${entries.join(", ")}}`;
  };

  steps.push({
    title: { vi: "Khởi tạo hash map", en: "Initialize hash map" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "target", value: target },
      { name: "d", value: dictStr() },
    ],
    note: {
      vi: `target = ${target}. Dùng hash map d (giá trị → chỉ số), ban đầu rỗng {}.`,
      en: `target = ${target}. Use a hash map d (value → index), initially empty {}.`,
    },
  });

  let answer = null;
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (Object.prototype.hasOwnProperty.call(seen, comp)) {
      const j = seen[comp];
      answer = [i, j];
      steps.push({
        title: { vi: `Tìm thấy tại i=${i}`, en: `Found at i=${i}` },
        arr: [...nums],
        highlight: [j, i],
        mark: [j, i],
        final: true,
        codeLines: [5, 6],
        vars: [
          { name: "i", value: i },
          { name: "comp", value: comp },
          { name: "j", value: j },
          { name: "d", value: dictStr() },
        ],
        note: {
          vi: `target - nums[${i}] = ${target} - ${nums[i]} = ${comp} đã có trong d tại chỉ số ${j}. Trả về [${i}, ${j}].`,
          en: `target - nums[${i}] = ${target} - ${nums[i]} = ${comp} is already in d at index ${j}. Return [${i}, ${j}].`,
        },
      });
      break;
    }

    seen[nums[i]] = i;
    steps.push({
      title: { vi: `Xét i=${i}`, en: `Inspect i=${i}` },
      arr: [...nums],
      highlight: [i],
      mark: [],
      codeLines: [4, 7],
      vars: [
        { name: "i", value: i },
        { name: "comp", value: comp },
        { name: "d", value: dictStr() },
      ],
      note: {
        vi: `Cần ${comp} (= ${target} - ${nums[i]}) nhưng chưa có trong d. Lưu nums[${i}]=${nums[i]} → ${i}. d = ${dictStr()}.`,
        en: `Need ${comp} (= ${target} - ${nums[i]}) but it is not in d. Store nums[${i}]=${nums[i]} → ${i}. d = ${dictStr()}.`,
      },
    });
  }

  if (!answer) {
    steps.push({
      title: { vi: "Không tìm thấy", en: "Not found" },
      arr: [...nums],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [7],
      vars: [{ name: "d", value: dictStr() }],
      note: {
        vi: "Không có cặp nào có tổng bằng target.",
        en: "No pair sums to the target.",
      },
    });
  }

  return { original: [...nums], target, answer: answer ? `[${answer[0]}, ${answer[1]}]` : "none", steps };
}

/**
 * Generate steps for LeetCode 1208: Get Equal Substrings Within Budget.
 *
 * Sliding window on cost array cost[i] = |s[i] - t[i]|:
 *  - Expand right, add cost[right] to windowCost.
 *  - When windowCost > maxCost, shrink left and subtract cost[left].
 *  - The answer is the maximum valid window length.
 */
function buildSteps1208(s, params) {
  const t = params.t;
  const maxCost = params.maxCost;
  const n = Math.min(s.length, t.length);

  const cost = [];
  const pair = [];
  for (let i = 0; i < n; i++) {
    cost.push(Math.abs(s.charCodeAt(i) - t.charCodeAt(i)));
    pair.push(`${s[i]}\u2192${t[i]}`);
  }

  const steps = [];
  const inWindow = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, x) => lo + x);

  steps.push({
    title: { vi: "Mảng chi phí", en: "Cost array" },
    arr: [...cost],
    sub: [...pair],
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5, 6],
    vars: [
      { name: "s", value: s },
      { name: "t", value: t },
      { name: "maxCost", value: maxCost },
    ],
    note: {
      vi: `cost[i] = |s[i] - t[i]|. Chuyển "${s}" → "${t}" tốn [${cost.join(", ")}]. Ngân sách maxCost = ${maxCost}.`,
      en: `cost[i] = |s[i] - t[i]|. Converting "${s}" → "${t}" costs [${cost.join(", ")}]. Budget maxCost = ${maxCost}.`,
    },
  });

  let left = 0;
  let windowCost = 0;
  let maxLength = 0;
  let bestL = 0;
  let bestR = -1;

  for (let right = 0; right < n; right++) {
    windowCost += cost[right];

    steps.push({
      title: { vi: `Mở rộng: right = ${right}`, en: `Expand: right = ${right}` },
      arr: [...cost],
      sub: [...pair],
      highlight: inWindow(left, right),
      mark: [],
      codeLines: [7, 8],
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "windowCost", value: windowCost },
        { name: "maxCost", value: maxCost },
        { name: "maxLength", value: maxLength },
      ],
      note: {
        vi: `Thêm cost[${right}] = ${cost[right]} (${pair[right]}). windowCost = ${windowCost}, ngân sách ${maxCost}.`,
        en: `Add cost[${right}] = ${cost[right]} (${pair[right]}). windowCost = ${windowCost}, budget ${maxCost}.`,
      },
    });

    while (windowCost > maxCost) {
      windowCost -= cost[left];
      left += 1;
      steps.push({
        title: { vi: `Co cửa sổ: left = ${left}`, en: `Shrink: left = ${left}` },
        arr: [...cost],
        sub: [...pair],
        highlight: left <= right ? inWindow(left, right) : [],
        mark: [],
        codeLines: [9, 10, 11],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "windowCost", value: windowCost },
          { name: "maxCost", value: maxCost },
          { name: "maxLength", value: maxLength },
        ],
        note: {
          vi: `windowCost vượt ngân sách. Bỏ cost[${left - 1}] ở trái, dời left → ${left}. windowCost = ${windowCost}.`,
          en: `windowCost exceeded the budget. Drop cost[${left - 1}] on the left, move left → ${left}. windowCost = ${windowCost}.`,
        },
      });
    }

    const length = right - left + 1;
    if (length > maxLength) {
      maxLength = length;
      bestL = left;
      bestR = right;
      steps.push({
        title: { vi: `Cập nhật max = ${maxLength}`, en: `Update max = ${maxLength}` },
        arr: [...cost],
        sub: [...pair],
        highlight: inWindow(left, right),
        mark: [],
        codeLines: [12],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "windowCost", value: windowCost },
          { name: "maxLength", value: maxLength },
        ],
        note: {
          vi: `Cửa sổ hợp lệ [${left}..${right}] dài ${length} > kỷ lục cũ. maxLength = ${maxLength}.`,
          en: `Valid window [${left}..${right}] of length ${length} beats the record. maxLength = ${maxLength}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...cost],
    sub: [...pair],
    highlight: [],
    mark: bestR >= 0 ? inWindow(bestL, bestR) : [],
    final: true,
    codeLines: [13],
    vars: [
      { name: "maxLength", value: maxLength },
      { name: "window", value: bestR >= 0 ? `[${bestL}..${bestR}]` : "-" },
    ],
    note: {
      vi: `Đoạn dài nhất chuyển được trong ngân sách là [${bestL}..${bestR}], độ dài ${maxLength}. Đáp án = ${maxLength}.`,
      en: `The longest convertible substring within budget is [${bestL}..${bestR}], length ${maxLength}. Answer = ${maxLength}.`,
    },
  });

  return { original: s, t, maxCost, answer: maxLength, steps };
}

/**
 * Generate steps for LeetCode 208: Implement Trie (Prefix Tree).
 *
 * Visualize the prefix tree when:
 *  - insert(word): traverse/create nodes for each character, mark the last node as is_word.
 *  - search(word): traverse characters, return is_word of the last node.
 *  - startsWith(prefix): traverse characters, return True if traversal completes.
 */
function buildSteps208(input, params) {
  const words = String(input)
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
  const searchWord = (params.search || "").trim();
  const prefixWord = (params.prefix || "").trim();

  let idCounter = 0;
  const makeNode = (label, parentId) => ({
    id: idCounter++,
    label,
    parentId,
    isWord: false,
    children: {},
  });
  const root = makeNode("\u2022", null);
  const steps = [];

  // Tree layout: x by leaf order, y by depth.
  function snapshot(opts) {
    const nodes = [];
    let nextX = 0;
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort();
      let x;
      if (keys.length === 0) {
        x = nextX++;
      } else {
        const xs = keys.map((k) => dfs(node.children[k], depth + 1));
        x = (xs[0] + xs[xs.length - 1]) / 2;
      }
      nodes.push({
        id: node.id,
        label: node.label,
        x,
        y: depth,
        parentId: node.parentId,
        isWord: node.isWord,
        hl: opts.highlight ? opts.highlight.includes(node.id) : false,
      });
      return x;
    }
    dfs(root, 0);

    steps.push({
      title: opts.title,
      arr: [],
      tree: { nodes },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  snapshot({
    title: { vi: "Khởi tạo Trie", en: "Initialize Trie" },
    codeLines: [7, 8],
    highlight: [root.id],
    vars: [{ name: "words", value: `[${words.join(", ")}]` }],
    note: {
      vi: `Tạo Trie rỗng chỉ có nút gốc. Sẽ chèn: [${words.join(", ")}].`,
      en: `Create an empty Trie with just a root node. Will insert: [${words.join(", ")}].`,
    },
  });

  for (const word of words) {
    let node = root;
    const path = [root.id];
    for (const ch of word) {
      let created = false;
      if (!node.children[ch]) {
        node.children[ch] = makeNode(ch, node.id);
        created = true;
      }
      node = node.children[ch];
      path.push(node.id);
      snapshot({
        title: { vi: `insert("${word}") · '${ch}'`, en: `insert("${word}") · '${ch}'` },
        codeLines: created ? [12, 13, 14, 15] : [12, 13, 15],
        highlight: [...path],
        vars: [
          { name: "op", value: `insert("${word}")` },
          { name: "ch", value: ch },
          { name: "newNode", value: created ? "yes" : "no" },
        ],
        note: {
          vi: created
            ? `Ký tự '${ch}' chưa có → tạo nút mới rồi đi xuống.`
            : `Ký tự '${ch}' đã tồn tại → đi theo nút có sẵn.`,
          en: created
            ? `Character '${ch}' is missing → create a node and descend.`
            : `Character '${ch}' already exists → follow the existing node.`,
        },
      });
    }
    node.isWord = true;
    snapshot({
      title: { vi: `insert("${word}") · xong`, en: `insert("${word}") · done` },
      codeLines: [16],
      highlight: [...path],
      vars: [
        { name: "op", value: `insert("${word}")` },
        { name: "is_word", value: "True" },
      ],
      note: {
        vi: `Đánh dấu nút cuối là kết thúc của từ "${word}" (is_word = True).`,
        en: `Mark the final node as the end of word "${word}" (is_word = True).`,
      },
    });
  }

  function traverse(target, isSearch, opLabel) {
    let node = root;
    const path = [root.id];
    for (const ch of target) {
      if (!node.children[ch]) {
        snapshot({
          title: { vi: `${opLabel} · thiếu '${ch}'`, en: `${opLabel} · missing '${ch}'` },
          codeLines: isSearch ? [20, 21, 22] : [28, 29, 30],
          highlight: [...path],
          vars: [
            { name: "op", value: opLabel },
            { name: "ch", value: ch },
            { name: "result", value: "False" },
          ],
          note: {
            vi: `Không có nhánh cho '${ch}' → trả về False.`,
            en: `No branch for '${ch}' → return False.`,
          },
        });
        return false;
      }
      node = node.children[ch];
      path.push(node.id);
      snapshot({
        title: { vi: `${opLabel} · '${ch}'`, en: `${opLabel} · '${ch}'` },
        codeLines: isSearch ? [20, 21, 23] : [28, 29, 31],
        highlight: [...path],
        vars: [
          { name: "op", value: opLabel },
          { name: "ch", value: ch },
        ],
        note: {
          vi: `Đi theo ký tự '${ch}'.`,
          en: `Follow character '${ch}'.`,
        },
      });
    }
    const result = isSearch ? node.isWord : true;
    snapshot({
      title: { vi: `${opLabel} · kết quả`, en: `${opLabel} · result` },
      codeLines: isSearch ? [24] : [32],
      highlight: [...path],
      vars: [
        { name: "op", value: opLabel },
        { name: "result", value: result ? "True" : "False" },
      ],
      note: {
        vi: isSearch
          ? `Hết "${target}": is_word = ${node.isWord ? "True" : "False"} → trả về ${result ? "True" : "False"}.`
          : `Đi hết tiền tố "${target}" → trả về True.`,
        en: isSearch
          ? `End of "${target}": is_word = ${node.isWord ? "True" : "False"} → return ${result ? "True" : "False"}.`
          : `Reached the end of prefix "${target}" → return True.`,
      },
    });
    return result;
  }

  const summary = [];
  if (searchWord) {
    const r = traverse(searchWord, true, `search("${searchWord}")`);
    summary.push(`search("${searchWord}") = ${r}`);
  }
  if (prefixWord) {
    const r = traverse(prefixWord, false, `startsWith("${prefixWord}")`);
    summary.push(`startsWith("${prefixWord}") = ${r}`);
  }

  if (steps.length) steps[steps.length - 1].final = true;
  const answer = summary.length ? summary.join("  |  ") : `inserted ${words.length} word(s)`;

  return { words, answer, steps };
}

/**
 * Generate steps for LeetCode 1804: Implement Trie II (Prefix Tree).
 *
 * Each node tracks:
 *  - prefixCount: how many words pass through this node.
 *  - wordCount: how many words end exactly at this node.
 *
 * Operations: insert, countWordsEqualTo, countWordsStartingWith, erase.
 */
function buildSteps1804(input, params) {
  const words = String(input)
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
  const countWord = (params.countWord || "").trim();
  const countPrefix = (params.countPrefix || "").trim();
  const eraseWord = (params.erase || "").trim();

  let idCounter = 0;
  const makeNode = (label, parentId) => ({
    id: idCounter++,
    label,
    parentId,
    prefixCount: 0,
    wordCount: 0,
    children: {},
  });
  const root = makeNode("\u2022", null);
  const steps = [];

  // Tree layout helper
  function snapshot(opts) {
    const nodes = [];
    let nextX = 0;
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort();
      let x;
      if (keys.length === 0) {
        x = nextX++;
      } else {
        const xs = keys.map((k) => dfs(node.children[k], depth + 1));
        x = (xs[0] + xs[xs.length - 1]) / 2;
      }
      const nodeLabel = node.label === "\u2022"
        ? "\u2022"
        : `${node.label} (p${node.prefixCount}${node.wordCount > 0 ? " w" + node.wordCount : ""})`;
      nodes.push({
        id: node.id,
        label: nodeLabel,
        x,
        y: depth,
        parentId: node.parentId,
        isWord: node.wordCount > 0,
        hl: opts.highlight ? opts.highlight.includes(node.id) : false,
      });
      return x;
    }
    dfs(root, 0);

    steps.push({
      title: opts.title,
      arr: [],
      tree: { nodes },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  snapshot({
    title: { vi: "Khởi tạo Trie II", en: "Initialize Trie II" },
    codeLines: [6, 7],
    highlight: [root.id],
    vars: [{ name: "words", value: `[${words.join(", ")}]` }],
    note: {
      vi: `Trie II: mỗi nút có prefixCount và wordCount. Sẽ chèn: [${words.join(", ")}].`,
      en: `Trie II: each node has prefixCount and wordCount. Will insert: [${words.join(", ")}].`,
    },
  });

  // insert
  for (const word of words) {
    let node = root;
    const path = [root.id];
    for (const ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = makeNode(ch, node.id);
      }
      node = node.children[ch];
      node.prefixCount++;
      path.push(node.id);
    }
    node.wordCount++;

    snapshot({
      title: { vi: `insert("${word}")`, en: `insert("${word}")` },
      codeLines: [9, 10, 11, 12, 13, 14, 15],
      highlight: [...path],
      vars: [
        { name: "op", value: `insert("${word}")` },
        { name: "endNode.prefixCount", value: node.prefixCount },
        { name: "endNode.wordCount", value: node.wordCount },
      ],
      note: {
        vi: `Chèn "${word}": đi qua từng ký tự, tăng prefixCount; cuối cùng tăng wordCount. wordCount = ${node.wordCount}.`,
        en: `Insert "${word}": traverse each char, increment prefixCount; finally increment wordCount. wordCount = ${node.wordCount}.`,
      },
    });
  }

  const summary = [];

  // countWordsEqualTo
  if (countWord) {
    let node = root;
    const path = [root.id];
    let found = true;
    for (const ch of countWord) {
      if (!node.children[ch]) {
        found = false;
        break;
      }
      node = node.children[ch];
      path.push(node.id);
    }
    const result = found ? node.wordCount : 0;
    summary.push(`countWordsEqualTo("${countWord}") = ${result}`);
    snapshot({
      title: { vi: `countWordsEqualTo("${countWord}") = ${result}`, en: `countWordsEqualTo("${countWord}") = ${result}` },
      codeLines: [17, 18, 19, 20, 21, 22],
      highlight: [...path],
      vars: [
        { name: "op", value: `countWordsEqualTo("${countWord}")` },
        { name: "result", value: result },
      ],
      note: {
        vi: found
          ? `Đi hết "${countWord}", wordCount tại nút cuối = ${result}.`
          : `Không tìm thấy đường đi cho "${countWord}" → trả về 0.`,
        en: found
          ? `Reached end of "${countWord}", wordCount at the last node = ${result}.`
          : `Could not traverse "${countWord}" → return 0.`,
      },
    });
  }

  // countWordsStartingWith
  if (countPrefix) {
    let node = root;
    const path = [root.id];
    let found = true;
    for (const ch of countPrefix) {
      if (!node.children[ch]) {
        found = false;
        break;
      }
      node = node.children[ch];
      path.push(node.id);
    }
    const result = found ? node.prefixCount : 0;
    summary.push(`countWordsStartingWith("${countPrefix}") = ${result}`);
    snapshot({
      title: { vi: `countWordsStartingWith("${countPrefix}") = ${result}`, en: `countWordsStartingWith("${countPrefix}") = ${result}` },
      codeLines: [24, 25, 26, 27, 28, 29],
      highlight: [...path],
      vars: [
        { name: "op", value: `countWordsStartingWith("${countPrefix}")` },
        { name: "result", value: result },
      ],
      note: {
        vi: found
          ? `Đi hết "${countPrefix}", prefixCount tại nút cuối = ${result}.`
          : `Không tìm thấy đường đi cho "${countPrefix}" → trả về 0.`,
        en: found
          ? `Reached end of "${countPrefix}", prefixCount at the last node = ${result}.`
          : `Could not traverse "${countPrefix}" → return 0.`,
      },
    });
  }

  // erase
  if (eraseWord) {
    let node = root;
    const path = [root.id];
    let canErase = true;
    for (const ch of eraseWord) {
      if (!node.children[ch]) {
        canErase = false;
        break;
      }
      node = node.children[ch];
      path.push(node.id);
    }
    if (canErase && node.wordCount > 0) {
      // Perform erase: decrement prefixCount along path, decrement wordCount
      let cur = root;
      for (const ch of eraseWord) {
        cur = cur.children[ch];
        cur.prefixCount--;
      }
      cur.wordCount--;
      summary.push(`erase("${eraseWord}") → done`);
      snapshot({
        title: { vi: `erase("${eraseWord}")`, en: `erase("${eraseWord}")` },
        codeLines: [31, 32, 33, 34, 35, 36],
        highlight: [...path],
        vars: [
          { name: "op", value: `erase("${eraseWord}")` },
          { name: "endNode.prefixCount", value: cur.prefixCount },
          { name: "endNode.wordCount", value: cur.wordCount },
        ],
        note: {
          vi: `Xóa 1 bản "${eraseWord}": giảm prefixCount trên đường đi, giảm wordCount ở nút cuối. wordCount = ${cur.wordCount}.`,
          en: `Erase one copy of "${eraseWord}": decrement prefixCount along path, decrement wordCount at end. wordCount = ${cur.wordCount}.`,
        },
      });
    } else {
      summary.push(`erase("${eraseWord}") → word not found`);
      snapshot({
        title: { vi: `erase("${eraseWord}") - không tìm thấy`, en: `erase("${eraseWord}") - not found` },
        codeLines: [31, 32],
        highlight: [...path],
        vars: [
          { name: "op", value: `erase("${eraseWord}")` },
          { name: "result", value: "not found" },
        ],
        note: {
          vi: `Từ "${eraseWord}" không tồn tại trong Trie (wordCount = 0), không thể xóa.`,
          en: `Word "${eraseWord}" does not exist in the Trie (wordCount = 0), cannot erase.`,
        },
      });
    }
  }

  if (steps.length) steps[steps.length - 1].final = true;
  const answer = summary.length ? summary.join("  |  ") : `inserted ${words.length} word(s)`;

  return { words, answer, steps };
}

/**
 * Generate steps for LeetCode 211: Design Add and Search Words Data Structure.
 *
 * Trie + DFS with wildcard '.':
 *  - addWord: standard trie insert.
 *  - search: DFS; when encountering '.', branch into all children.
 */
function buildSteps211(input, params) {
  const words = String(input)
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
  const searchPattern = (params.search || "").trim();

  let idCounter = 0;
  const makeNode = (label, parentId) => ({
    id: idCounter++,
    label,
    parentId,
    isWord: false,
    children: {},
  });
  const root = makeNode("\u2022", null);
  const steps = [];

  // Tree layout helper
  function snapshot(opts) {
    const nodes = [];
    let nextX = 0;
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort();
      let x;
      if (keys.length === 0) {
        x = nextX++;
      } else {
        const xs = keys.map((k) => dfs(node.children[k], depth + 1));
        x = (xs[0] + xs[xs.length - 1]) / 2;
      }
      nodes.push({
        id: node.id,
        label: node.label,
        x,
        y: depth,
        parentId: node.parentId,
        isWord: node.isWord,
        hl: opts.highlight ? opts.highlight.includes(node.id) : false,
      });
      return x;
    }
    dfs(root, 0);

    steps.push({
      title: opts.title,
      arr: [],
      tree: { nodes },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  // Initialize
  snapshot({
    title: { vi: "Khởi tạo WordDictionary", en: "Initialize WordDictionary" },
    codeLines: [6, 7],
    highlight: [root.id],
    vars: [{ name: "words", value: `[${words.join(", ")}]` }],
    note: {
      vi: `Tạo Trie rỗng. Sẽ thêm: [${words.join(", ")}]. Pattern tìm kiếm: "${searchPattern}".`,
      en: `Create an empty Trie. Will add: [${words.join(", ")}]. Search pattern: "${searchPattern}".`,
    },
  });

  // addWord
  for (const word of words) {
    let node = root;
    const path = [root.id];
    for (const ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = makeNode(ch, node.id);
      }
      node = node.children[ch];
      path.push(node.id);
    }
    node.isWord = true;

    snapshot({
      title: { vi: `addWord("${word}")`, en: `addWord("${word}")` },
      codeLines: [10, 11, 12, 13, 14, 15],
      highlight: [...path],
      vars: [
        { name: "op", value: `addWord("${word}")` },
        { name: "is_word", value: "True" },
      ],
      note: {
        vi: `Chèn "${word}" vào Trie, đánh dấu nút cuối is_word = True.`,
        en: `Insert "${word}" into the Trie, mark the end node is_word = True.`,
      },
    });
  }

  // search with wildcard support
  if (searchPattern) {
    const searchPath = [];
    let searchResult = false;

    function dfsSearch(node, i, path) {
      if (i === searchPattern.length) {
        if (node.isWord) {
          searchResult = true;
          snapshot({
            title: { vi: `search("${searchPattern}") · kết thúc ✓`, en: `search("${searchPattern}") · end ✓` },
            codeLines: [19, 20],
            highlight: [...path],
            vars: [
              { name: "op", value: `search("${searchPattern}")` },
              { name: "i", value: i },
              { name: "is_word", value: "True" },
              { name: "result", value: "True" },
            ],
            note: {
              vi: `Đã duyệt hết pattern, nút hiện tại là kết thúc từ → True.`,
              en: `Reached end of pattern, current node is end of word → True.`,
            },
          });
          return true;
        }
        snapshot({
          title: { vi: `search("${searchPattern}") · kết thúc ✗`, en: `search("${searchPattern}") · end ✗` },
          codeLines: [19, 20],
          highlight: [...path],
          vars: [
            { name: "op", value: `search("${searchPattern}")` },
            { name: "i", value: i },
            { name: "is_word", value: "False" },
            { name: "result", value: "False (backtrack)" },
          ],
          note: {
            vi: `Đã duyệt hết pattern, nhưng nút hiện tại KHÔNG phải kết thúc từ → quay lui.`,
            en: `Reached end of pattern, but current node is NOT end of word → backtrack.`,
          },
        });
        return false;
      }

      const ch = searchPattern[i];

      if (ch === ".") {
        const childKeys = Object.keys(node.children).sort();
        snapshot({
          title: { vi: `search · '.' tại i=${i}`, en: `search · '.' at i=${i}` },
          codeLines: [21, 22, 23],
          highlight: [...path],
          vars: [
            { name: "op", value: `search("${searchPattern}")` },
            { name: "i", value: i },
            { name: "char", value: "." },
            { name: "branches", value: childKeys.join(", ") },
          ],
          note: {
            vi: `Gặp '.': thử tất cả nhánh con [${childKeys.join(", ")}].`,
            en: `Encountered '.': try all child branches [${childKeys.join(", ")}].`,
          },
        });

        for (const key of childKeys) {
          const child = node.children[key];
          const newPath = [...path, child.id];
          snapshot({
            title: { vi: `search · '.' → thử '${key}'`, en: `search · '.' → try '${key}'` },
            codeLines: [22, 23],
            highlight: [...newPath],
            vars: [
              { name: "op", value: `search("${searchPattern}")` },
              { name: "i", value: i },
              { name: "trying", value: key },
            ],
            note: {
              vi: `'.' khớp '${key}': đi xuống nhánh '${key}'.`,
              en: `'.' matches '${key}': descend into branch '${key}'.`,
            },
          });
          if (dfsSearch(child, i + 1, newPath)) return true;
        }
        return false;
      }

      // Regular character
      if (!node.children[ch]) {
        snapshot({
          title: { vi: `search · thiếu '${ch}'`, en: `search · missing '${ch}'` },
          codeLines: [26, 27],
          highlight: [...path],
          vars: [
            { name: "op", value: `search("${searchPattern}")` },
            { name: "i", value: i },
            { name: "char", value: ch },
            { name: "result", value: "False" },
          ],
          note: {
            vi: `Không có nhánh '${ch}' → trả về False.`,
            en: `No branch for '${ch}' → return False.`,
          },
        });
        return false;
      }

      const child = node.children[ch];
      const newPath = [...path, child.id];
      snapshot({
        title: { vi: `search · '${ch}' tại i=${i}`, en: `search · '${ch}' at i=${i}` },
        codeLines: [28],
        highlight: [...newPath],
        vars: [
          { name: "op", value: `search("${searchPattern}")` },
          { name: "i", value: i },
          { name: "char", value: ch },
        ],
        note: {
          vi: `Đi theo ký tự '${ch}'.`,
          en: `Follow character '${ch}'.`,
        },
      });
      return dfsSearch(child, i + 1, newPath);
    }

    dfsSearch(root, 0, [root.id]);

    // Final result step
    snapshot({
      title: { vi: `search("${searchPattern}") = ${searchResult}`, en: `search("${searchPattern}") = ${searchResult}` },
      codeLines: [29],
      highlight: [root.id],
      vars: [
        { name: "op", value: `search("${searchPattern}")` },
        { name: "result", value: searchResult ? "True" : "False" },
      ],
      note: {
        vi: `Kết quả: search("${searchPattern}") = ${searchResult}. ${searchResult ? "Tìm thấy từ khớp pattern." : "Không có từ nào khớp pattern."}`,
        en: `Result: search("${searchPattern}") = ${searchResult}. ${searchResult ? "A matching word was found." : "No word matches the pattern."}`,
      },
    });

    if (steps.length) steps[steps.length - 1].final = true;
    return { words, answer: `search("${searchPattern}") = ${searchResult}`, steps };
  }

  if (steps.length) steps[steps.length - 1].final = true;
  return { words, answer: `added ${words.length} word(s)`, steps };
}

/**
 * Generate steps for LeetCode 648: Replace Words.
 *
 * Build a Trie from dictionary roots, then for each word in the sentence,
 * traverse the Trie to find the shortest root prefix.
 */
function buildSteps648(input, params) {
  const roots = String(input)
    .split(",")
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
  const sentence = (params.sentence || "").trim();
  const sentenceWords = sentence.split(/\s+/).filter((w) => w.length > 0);

  let idCounter = 0;
  const makeNode = (label, parentId) => ({
    id: idCounter++,
    label,
    parentId,
    isRoot: false,
    rootWord: "",
    children: {},
  });
  const trieRoot = makeNode("\u2022", null);
  const steps = [];

  // Tree layout helper
  function snapshot(opts) {
    const nodes = [];
    let nextX = 0;
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort();
      let x;
      if (keys.length === 0) {
        x = nextX++;
      } else {
        const xs = keys.map((k) => dfs(node.children[k], depth + 1));
        x = (xs[0] + xs[xs.length - 1]) / 2;
      }
      nodes.push({
        id: node.id,
        label: node.label,
        x,
        y: depth,
        parentId: node.parentId,
        isWord: node.isRoot,
        hl: opts.highlight ? opts.highlight.includes(node.id) : false,
      });
      return x;
    }
    dfs(trieRoot, 0);

    steps.push({
      title: opts.title,
      arr: [],
      tree: { nodes },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  // Initialize
  snapshot({
    title: { vi: "Khởi tạo Trie từ dictionary", en: "Build Trie from dictionary" },
    codeLines: [8, 9],
    highlight: [trieRoot.id],
    vars: [
      { name: "dictionary", value: `[${roots.join(", ")}]` },
      { name: "sentence", value: sentence },
    ],
    note: {
      vi: `Xây Trie từ các gốc từ: [${roots.join(", ")}]. Sau đó thay thế từng từ trong câu.`,
      en: `Build a Trie from roots: [${roots.join(", ")}]. Then replace each word in the sentence.`,
    },
  });

  // Insert all roots into Trie
  for (const rootWord of roots) {
    let node = trieRoot;
    const path = [trieRoot.id];
    for (const ch of rootWord) {
      if (!node.children[ch]) {
        node.children[ch] = makeNode(ch, node.id);
      }
      node = node.children[ch];
      path.push(node.id);
    }
    node.isRoot = true;
    node.rootWord = rootWord;

    snapshot({
      title: { vi: `Chèn gốc "${rootWord}"`, en: `Insert root "${rootWord}"` },
      codeLines: [10, 11, 12, 13, 14, 15, 16, 17],
      highlight: [...path],
      vars: [
        { name: "root_word", value: rootWord },
        { name: "is_root", value: "True" },
      ],
      note: {
        vi: `Chèn "${rootWord}" vào Trie, đánh dấu nút cuối là gốc từ.`,
        en: `Insert "${rootWord}" into the Trie, mark the end node as a root.`,
      },
    });
  }

  // Process each word in the sentence
  const resultWords = [];
  for (const word of sentenceWords) {
    let node = trieRoot;
    const path = [trieRoot.id];
    let foundRoot = null;

    for (const ch of word) {
      if (node.isRoot) {
        foundRoot = node.rootWord;
        break;
      }
      if (!node.children[ch]) {
        break;
      }
      node = node.children[ch];
      path.push(node.id);
    }

    if (!foundRoot && node.isRoot) {
      foundRoot = node.rootWord;
    }

    const replacement = foundRoot || word;
    resultWords.push(replacement);

    snapshot({
      title: {
        vi: foundRoot ? `"${word}" → "${foundRoot}"` : `"${word}" (giữ nguyên)`,
        en: foundRoot ? `"${word}" → "${foundRoot}"` : `"${word}" (unchanged)`,
      },
      codeLines: foundRoot ? [20, 21, 22, 23, 24, 27, 28] : [20, 21, 22, 25, 26, 28],
      highlight: [...path],
      vars: [
        { name: "word", value: word },
        { name: "found_root", value: foundRoot || "none" },
        { name: "replacement", value: replacement },
      ],
      note: {
        vi: foundRoot
          ? `Từ "${word}" có gốc "${foundRoot}" là tiền tố → thay thế thành "${foundRoot}".`
          : `Từ "${word}" không khớp gốc nào trong Trie → giữ nguyên.`,
        en: foundRoot
          ? `Word "${word}" has root "${foundRoot}" as prefix → replace with "${foundRoot}".`
          : `Word "${word}" has no matching root in the Trie → keep unchanged.`,
      },
    });
  }

  const answer = resultWords.join(" ");
  snapshot({
    title: { vi: "Kết quả", en: "Result" },
    codeLines: [29],
    highlight: [trieRoot.id],
    vars: [{ name: "result", value: answer }],
    note: {
      vi: `Câu sau khi thay thế: "${answer}".`,
      en: `Sentence after replacement: "${answer}".`,
    },
  });
  steps[steps.length - 1].final = true;

  return { roots, sentence, answer, steps };
}

/**
 * Generate steps for LeetCode 53: Maximum Subarray (Kadane's algorithm).
 *  - cur = max(nums[i], cur + nums[i])  (extend current subarray or start fresh).
 *  - best = max(best, cur).
 */
function buildSteps53(nums) {
  const steps = [];
  const inWindow = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, x) => lo + x);

  let cur = nums[0];
  let best = nums[0];
  let curStart = 0;
  let bestL = 0;
  let bestR = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    highlight: [0],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "cur", value: cur },
      { name: "best", value: best },
    ],
    note: {
      vi: `Bắt đầu tại nums[0] = ${nums[0]}: cur = best = ${nums[0]}.`,
      en: `Start at nums[0] = ${nums[0]}: cur = best = ${nums[0]}.`,
    },
  });

  for (let i = 1; i < nums.length; i++) {
    const num = nums[i];
    const restart = cur + num < num;
    if (restart) {
      cur = num;
      curStart = i;
    } else {
      cur = cur + num;
    }

    let updated = false;
    if (cur > best) {
      best = cur;
      bestL = curStart;
      bestR = i;
      updated = true;
    }

    steps.push({
      title: { vi: `Xét nums[${i}] = ${num}`, en: `Inspect nums[${i}] = ${num}` },
      arr: [...nums],
      highlight: inWindow(curStart, i),
      mark: [],
      codeLines: [5, 6, 7],
      vars: [
        { name: "i", value: i },
        { name: "num", value: num },
        { name: "cur", value: cur },
        { name: "best", value: best },
      ],
      note: {
        vi: `${restart ? `cur + ${num} < ${num} → bắt đầu lại đoạn tại i=${i}` : `mở rộng đoạn: cur += ${num}`}. cur = ${cur}. best = ${best}${updated ? " (cập nhật)" : ""}.`,
        en: `${restart ? `cur + ${num} < ${num} → restart the run at i=${i}` : `extend the run: cur += ${num}`}. cur = ${cur}. best = ${best}${updated ? " (updated)" : ""}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: inWindow(bestL, bestR),
    final: true,
    codeLines: [8],
    vars: [
      { name: "best", value: best },
      { name: "subarray", value: `[${bestL}..${bestR}]` },
    ],
    note: {
      vi: `Tổng lớn nhất của một dãy con liên tiếp = ${best}, đạt tại đoạn [${bestL}..${bestR}] = [${nums.slice(bestL, bestR + 1).join(", ")}].`,
      en: `Maximum contiguous subarray sum = ${best}, on segment [${bestL}..${bestR}] = [${nums.slice(bestL, bestR + 1).join(", ")}].`,
    },
  });

  return { original: [...nums], answer: best, steps };
}

/**
 * Generate steps for LeetCode 3020: Find the Maximum Number of Elements in a Subset.
 *
 * Valid subsets follow the pattern [x, x², x⁴, …, x^k, …, x⁴, x², x].
 * For each base x: follow the power chain, each level needs >= 2 copies (except the peak needs >= 1).
 * Special case x = 1 is handled separately (needs odd count).
 */
function buildSteps3020(nums) {
  const steps = [];
  const freq = {};
  nums.forEach((v) => {
    freq[v] = (freq[v] || 0) + 1;
  });
  const freqStr = (f) =>
    `{${Object.keys(f)
      .map((k) => `${k}:${f[k]}`)
      .join(", ")}}`;
  const idxOf = (val) => nums.map((v, i) => (v === val ? i : -1)).filter((i) => i >= 0);

  let ans = 1;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "ans", value: ans },
      { name: "freq", value: freqStr(freq) },
    ],
    note: {
      vi: "Đếm tần suất các số. Mẫu hợp lệ: [x, x², x⁴, …, x^k, …, x⁴, x², x]. Tìm tập con dài nhất.",
      en: "Count value frequencies. Valid pattern: [x, x², x⁴, …, x^k, …, x⁴, x², x]. Find the longest such subset.",
    },
  });

  const bases = [...new Set(nums)].sort((a, b) => a - b);
  for (const x of bases) {
    if (x === 1) {
      const cnt = freq[1];
      const val = cnt % 2 === 0 ? cnt - 1 : cnt;
      if (val > ans) ans = val;
      steps.push({
        title: { vi: "Trường hợp x = 1", en: "Case x = 1" },
        arr: [...nums],
        highlight: idxOf(1),
        mark: [],
        codeLines: [6, 7, 8],
        vars: [
          { name: "x", value: 1 },
          { name: "freq[1]", value: cnt },
          { name: "ans", value: ans },
        ],
        note: {
          vi: `Có ${cnt} số 1. Mẫu chỉ gồm số 1 cần số lượng lẻ → dùng ${val}. ans = ${ans}.`,
          en: `There are ${cnt} ones. A subset of only 1s needs an odd count → use ${val}. ans = ${ans}.`,
        },
      });
      continue;
    }

    let cnt = 0;
    let cur = x;
    while ((freq[cur] || 0) >= 2) {
      cnt += 2;
      steps.push({
        title: { vi: `Cơ số x = ${x}: lũy thừa ${cur}`, en: `Base x = ${x}: power ${cur}` },
        arr: [...nums],
        highlight: idxOf(cur),
        mark: [],
        codeLines: [12, 13, 14],
        vars: [
          { name: "x", value: x },
          { name: "cur", value: cur },
          { name: "freq[cur]", value: freq[cur] || 0 },
          { name: "cnt", value: cnt },
          { name: "ans", value: ans },
        ],
        note: {
          vi: `freq[${cur}] = ${freq[cur]} ≥ 2 → thêm một cặp (cnt += 2 = ${cnt}), tiếp tục với ${cur * cur}.`,
          en: `freq[${cur}] = ${freq[cur]} ≥ 2 → add a pair (cnt += 2 = ${cnt}), continue with ${cur * cur}.`,
        },
      });
      cur = cur * cur;
    }

    const hasPeak = (freq[cur] || 0) >= 1;
    cnt += hasPeak ? 1 : -1;
    if (cnt > ans) ans = cnt;
    steps.push({
      title: { vi: `Cơ số x = ${x}: đỉnh`, en: `Base x = ${x}: peak` },
      arr: [...nums],
      highlight: hasPeak ? idxOf(cur) : [],
      mark: [],
      codeLines: [15, 16],
      vars: [
        { name: "x", value: x },
        { name: "cur", value: cur },
        { name: "freq[cur]", value: freq[cur] || 0 },
        { name: "cnt", value: cnt },
        { name: "ans", value: ans },
      ],
      note: {
        vi: hasPeak
          ? `freq[${cur}] ≥ 1 → có phần tử đỉnh, cnt += 1 = ${cnt}. ans = ${ans}.`
          : `freq[${cur}] = 0 → thiếu đỉnh, bỏ bớt một phần tử (cnt -= 1 = ${cnt}). ans = ${ans}.`,
        en: hasPeak
          ? `freq[${cur}] ≥ 1 → peak element exists, cnt += 1 = ${cnt}. ans = ${ans}.`
          : `freq[${cur}] = 0 → no peak, drop one element (cnt -= 1 = ${cnt}). ans = ${ans}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [17],
    vars: [{ name: "ans", value: ans }],
    note: {
      vi: `Số phần tử lớn nhất của một tập con hợp lệ = ${ans}.`,
      en: `Maximum number of elements in a valid subset = ${ans}.`,
    },
  });

  return { original: [...nums], answer: ans, steps };
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
 * LeetCode 676: Implement Magic Dictionary.
 * Trie + search with exactly one character changed.
 */
function buildSteps676(input, params) {
  const words = String(input).split(",").map((w) => w.trim()).filter(Boolean);
  const searchWords = (params.search || "").split(",").map((w) => w.trim()).filter(Boolean);

  let idCounter = 0;
  const makeNode = (label, parentId) => ({ id: idCounter++, label, parentId, isWord: false, children: {} });
  const root = makeNode("\u2022", null);
  const steps = [];

  function snapshot(opts) {
    const nodes = [];
    let nextX = 0;
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort();
      let x;
      if (keys.length === 0) { x = nextX++; }
      else { const xs = keys.map((k) => dfs(node.children[k], depth + 1)); x = (xs[0] + xs[xs.length - 1]) / 2; }
      nodes.push({ id: node.id, label: node.label, x, y: depth, parentId: node.parentId, isWord: node.isWord, hl: opts.highlight ? opts.highlight.includes(node.id) : false });
      return x;
    }
    dfs(root, 0);
    steps.push({ title: opts.title, arr: [], tree: { nodes }, highlight: [], mark: [], codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note });
  }

  snapshot({ title: { vi: "Khởi tạo", en: "Initialize" }, highlight: [root.id], vars: [{ name: "words", value: words.join(", ") }], note: { vi: `Chèn từ điển: [${words.join(", ")}].`, en: `Build dictionary: [${words.join(", ")}].` } });

  for (const word of words) {
    let node = root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = makeNode(ch, node.id);
      node = node.children[ch];
    }
    node.isWord = true;
  }
  snapshot({ title: { vi: "Trie đã xây", en: "Trie built" }, highlight: [], vars: [{ name: "words", value: words.join(", ") }], note: { vi: "Tất cả từ đã chèn vào Trie.", en: "All words inserted into Trie." } });

  function dfsSearch(node, word, idx, misses, path) {
    if (idx === word.length) return node.isWord && misses === 1;
    const ch = word[idx];
    for (const key of Object.keys(node.children).sort()) {
      const newMiss = misses + (key !== ch ? 1 : 0);
      if (newMiss > 1) continue;
      if (dfsSearch(node.children[key], word, idx + 1, newMiss, path)) {
        path.push(node.children[key].id);
        return true;
      }
    }
    return false;
  }

  const results = [];
  for (const sw of searchWords) {
    const path = [];
    const found = dfsSearch(root, sw, 0, 0, path);
    path.push(root.id);
    path.reverse();
    results.push(`search("${sw}") = ${found}`);
    snapshot({
      title: { vi: `search("${sw}")`, en: `search("${sw}")` },
      highlight: found ? path : [],
      vars: [{ name: "word", value: sw }, { name: "result", value: found ? "True" : "False" }],
      note: {
        vi: found ? `"${sw}" có thể đạt được bằng cách đổi đúng 1 ký tự → True.` : `"${sw}" không thể đổi đúng 1 ký tự để khớp → False.`,
        en: found ? `"${sw}" can be reached by changing exactly 1 character → True.` : `"${sw}" cannot match with exactly 1 change → False.`,
      },
    });
  }

  if (steps.length) steps[steps.length - 1].final = true;
  return { words, answer: results.join(" | "), steps };
}

/**
 * LeetCode 1268: Search Suggestions System.
 * Trie + DFS to find top-3 suggestions for each prefix while typing.
 */
function buildSteps1268(input, params) {
  const products = String(input).split(",").map((w) => w.trim()).filter(Boolean).sort();
  const searchWord = (params.searchWord || "").trim();

  let idCounter = 0;
  const makeNode = (label, parentId) => ({ id: idCounter++, label, parentId, isWord: false, children: {} });
  const root = makeNode("\u2022", null);
  const steps = [];

  // Map word → terminal node id (for highlighting suggestions)
  const wordNodeId = {};

  function snapshot(opts) {
    const nodes = [];
    let nextX = 0;
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort();
      let x;
      if (keys.length === 0) { x = nextX++; }
      else { const xs = keys.map((k) => dfs(node.children[k], depth + 1)); x = (xs[0] + xs[xs.length - 1]) / 2; }
      nodes.push({ id: node.id, label: node.label, x, y: depth, parentId: node.parentId, isWord: node.isWord, hl: opts.highlight ? opts.highlight.includes(node.id) : false });
      return x;
    }
    dfs(root, 0);
    steps.push({ title: opts.title, arr: [], tree: { nodes }, highlight: [], mark: [], codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note });
  }

  // Insert all products and show each insertion
  for (const word of products) {
    let node = root;
    const insertPath = [root.id];
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = makeNode(ch, node.id);
      node = node.children[ch];
      insertPath.push(node.id);
    }
    node.isWord = true;
    wordNodeId[word] = node.id;
    snapshot({
      title: { vi: `Chèn "${word}"`, en: `Insert "${word}"` },
      codeLines: [5, 6, 7, 8, 9],
      highlight: insertPath,
      vars: [{ name: "word", value: word }],
      note: { vi: `Chèn "${word}" vào Trie. Đánh dấu nút cuối là is_word.`, en: `Insert "${word}" into Trie. Mark the end node as is_word.` },
    });
  }

  snapshot({
    title: { vi: "Trie hoàn chỉnh", en: "Trie complete" },
    codeLines: [4],
    highlight: [],
    vars: [{ name: "products", value: products.join(", ") }],
    note: { vi: `Đã chèn ${products.length} sản phẩm (đã sắp xếp). Bắt đầu gõ "${searchWord}".`, en: `Inserted ${products.length} products (sorted). Start typing "${searchWord}".` },
  });

  function collectWords(node, prefix, result) {
    if (result.length >= 3) return;
    if (node.isWord) result.push(prefix);
    for (const ch of Object.keys(node.children).sort()) {
      collectWords(node.children[ch], prefix + ch, result);
      if (result.length >= 3) return;
    }
  }

  const allSuggestions = [];
  let node = root;
  let prefix = "";
  const path = [root.id];
  for (const ch of searchWord) {
    prefix += ch;
    if (!node.children[ch]) {
      allSuggestions.push([]);
      snapshot({
        title: { vi: `Gõ "${prefix}" — không có`, en: `Type "${prefix}" — missing` },
        codeLines: [13, 14],
        highlight: [...path],
        vars: [
          { name: "prefix", value: prefix },
          { name: "suggestions", value: "[]" },
          { name: "reason", value: `no branch '${ch}'` },
        ],
        note: { vi: `Không có nhánh '${ch}' → gợi ý rỗng. Các ký tự sau cũng rỗng.`, en: `No branch '${ch}' → empty suggestions. All subsequent characters too.` },
      });
      // Remaining characters also empty
      for (let k = prefix.length; k < searchWord.length; k++) {
        allSuggestions.push([]);
      }
      node = null;
      break;
    }
    node = node.children[ch];
    path.push(node.id);
    const sugg = [];
    collectWords(node, prefix, sugg);
    allSuggestions.push(sugg);

    // Highlight path + suggestion word-end nodes
    const suggHl = sugg.map((w) => wordNodeId[w]).filter(Boolean);
    snapshot({
      title: { vi: `Gõ "${prefix}"`, en: `Type "${prefix}"` },
      codeLines: [11, 12, 15, 16],
      highlight: [...path, ...suggHl],
      vars: [
        { name: "prefix", value: prefix },
        { name: "suggestions", value: `[${sugg.join(", ")}]` },
        { name: "count", value: sugg.length },
      ],
      note: {
        vi: `Tiền tố "${prefix}" → top-3 gợi ý: [${sugg.join(", ")}]. DFS trên nhánh '${ch}' thu được ${sugg.length} kết quả.`,
        en: `Prefix "${prefix}" → top-3 suggestions: [${sugg.join(", ")}]. DFS from branch '${ch}' collected ${sugg.length} result(s).`,
      },
    });
  }

  if (steps.length) steps[steps.length - 1].final = true;
  return { products, searchWord, answer: allSuggestions, steps };
}

/**
 * LeetCode 1166: Design File System.
 * Trie on paths: createPath(path, value), get(path).
 */
function buildSteps1166(input, params) {
  const ops = String(input).split(";").map((s) => s.trim()).filter(Boolean);

  let idCounter = 0;
  const makeNode = (label, parentId) => ({ id: idCounter++, label, parentId, value: null, children: {} });
  const root = makeNode("/", null);
  const steps = [];

  function snapshot(opts) {
    const nodes = [];
    let nextX = 0;
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort();
      let x;
      if (keys.length === 0) { x = nextX++; }
      else { const xs = keys.map((k) => dfs(node.children[k], depth + 1)); x = (xs[0] + xs[xs.length - 1]) / 2; }
      const lbl = node.value !== null ? `${node.label}=${node.value}` : node.label;
      nodes.push({ id: node.id, label: lbl, x, y: depth, parentId: node.parentId, isWord: node.value !== null, hl: opts.highlight ? opts.highlight.includes(node.id) : false });
      return x;
    }
    dfs(root, 0);
    steps.push({ title: opts.title, arr: [], tree: { nodes }, highlight: [], mark: [], codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note });
  }

  snapshot({ title: { vi: "Khởi tạo File System", en: "Init File System" }, highlight: [root.id], vars: [], note: { vi: "Hệ thống file rỗng, chỉ có root /.", en: "Empty file system with root /." } });

  const results = [];
  for (const op of ops) {
    const m = op.match(/^(create|get)\(([^,]+?)(?:,\s*(\d+))?\)$/i);
    if (!m) continue;
    const cmd = m[1].toLowerCase();
    const path = m[2].trim();
    const val = m[3] !== undefined ? Number(m[3]) : undefined;
    const parts = path.split("/").filter(Boolean);

    if (cmd === "create") {
      let node = root;
      const pathIds = [root.id];
      let ok = true;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!node.children[parts[i]]) { ok = false; break; }
        node = node.children[parts[i]];
        pathIds.push(node.id);
      }
      const last = parts[parts.length - 1];
      if (ok && !node.children[last]) {
        node.children[last] = makeNode(last, node.id);
        node.children[last].value = val;
        pathIds.push(node.children[last].id);
        results.push(`create("${path}",${val}) = true`);
      } else {
        ok = false;
        results.push(`create("${path}",${val}) = false`);
      }
      snapshot({ title: { vi: `create("${path}", ${val})`, en: `create("${path}", ${val})` }, highlight: pathIds, vars: [{ name: "op", value: `create("${path}",${val})` }, { name: "result", value: ok }], note: { vi: ok ? `Tạo đường dẫn thành công.` : `Thất bại (cha không tồn tại hoặc đã có).`, en: ok ? `Path created successfully.` : `Failed (parent missing or path exists).` } });
    } else {
      let node = root;
      const pathIds = [root.id];
      let found = true;
      for (const p of parts) {
        if (!node.children[p]) { found = false; break; }
        node = node.children[p];
        pathIds.push(node.id);
      }
      const v = found ? node.value : -1;
      results.push(`get("${path}") = ${v}`);
      snapshot({ title: { vi: `get("${path}")`, en: `get("${path}")` }, highlight: pathIds, vars: [{ name: "op", value: `get("${path}")` }, { name: "result", value: v }], note: { vi: found ? `Giá trị = ${v}.` : `Đường dẫn không tồn tại → -1.`, en: found ? `Value = ${v}.` : `Path not found → -1.` } });
    }
  }

  if (steps.length) steps[steps.length - 1].final = true;
  return { ops, answer: results.join(" | "), steps };
}

/**
 * LeetCode 588: Design In-Memory File System.
 * Trie: mkdir, addContentToFile, readContentFromFile, ls.
 */
function buildSteps588(input, params) {
  const ops = String(input).split(";").map((s) => s.trim()).filter(Boolean);

  let idCounter = 0;
  const makeNode = (label, parentId) => ({ id: idCounter++, label, parentId, content: null, children: {} });
  const root = makeNode("/", null);
  const steps = [];

  function snapshot(opts) {
    const nodes = [];
    let nextX = 0;
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort();
      let x;
      if (keys.length === 0) { x = nextX++; }
      else { const xs = keys.map((k) => dfs(node.children[k], depth + 1)); x = (xs[0] + xs[xs.length - 1]) / 2; }
      const lbl = node.content !== null ? `📄${node.label}` : node.label;
      nodes.push({ id: node.id, label: lbl, x, y: depth, parentId: node.parentId, isWord: node.content !== null, hl: opts.highlight ? opts.highlight.includes(node.id) : false });
      return x;
    }
    dfs(root, 0);
    steps.push({ title: opts.title, arr: [], tree: { nodes }, highlight: [], mark: [], codeLines: opts.codeLines || [], vars: opts.vars || [], note: opts.note });
  }

  snapshot({ title: { vi: "Khởi tạo File System", en: "Init File System" }, highlight: [root.id], vars: [], note: { vi: "Hệ thống file rỗng.", en: "Empty file system." } });

  function navigate(path, create) {
    const parts = path.split("/").filter(Boolean);
    let node = root;
    const ids = [root.id];
    for (const p of parts) {
      if (!node.children[p]) {
        if (!create) return { node: null, ids };
        node.children[p] = makeNode(p, node.id);
      }
      node = node.children[p];
      ids.push(node.id);
    }
    return { node, ids };
  }

  const results = [];
  for (const op of ops) {
    let m;
    if ((m = op.match(/^ls\(([^)]*)\)$/i))) {
      const path = m[1].trim() || "/";
      const { node, ids } = navigate(path, false);
      let listing = [];
      if (node) {
        if (node.content !== null) {
          listing = [node.label];
        } else {
          listing = Object.keys(node.children).sort();
        }
      }
      results.push(`ls("${path}") = [${listing.join(",")}]`);
      snapshot({ title: { vi: `ls("${path}")`, en: `ls("${path}")` }, highlight: ids, vars: [{ name: "op", value: `ls("${path}")` }, { name: "result", value: `[${listing.join(", ")}]` }], note: { vi: `Liệt kê: [${listing.join(", ")}].`, en: `List: [${listing.join(", ")}].` } });
    } else if ((m = op.match(/^mkdir\(([^)]+)\)$/i))) {
      const path = m[1].trim();
      const { ids } = navigate(path, true);
      results.push(`mkdir("${path}")`);
      snapshot({ title: { vi: `mkdir("${path}")`, en: `mkdir("${path}")` }, highlight: ids, vars: [{ name: "op", value: `mkdir("${path}")` }], note: { vi: "Tạo thư mục (và cha nếu cần).", en: "Create directory (and parents if needed)." } });
    } else if ((m = op.match(/^add\(([^,]+),\s*"([^"]*)"\)$/i))) {
      const path = m[1].trim();
      const content = m[2];
      const { node, ids } = navigate(path, true);
      node.content = (node.content || "") + content;
      results.push(`addContent("${path}", "${content}")`);
      snapshot({ title: { vi: `addContent("${path}")`, en: `addContent("${path}")` }, highlight: ids, vars: [{ name: "op", value: `add("${path}","${content}")` }, { name: "content", value: node.content }], note: { vi: `Nội dung file: "${node.content}".`, en: `File content: "${node.content}".` } });
    } else if ((m = op.match(/^read\(([^)]+)\)$/i))) {
      const path = m[1].trim();
      const { node, ids } = navigate(path, false);
      const c = node ? node.content || "" : "";
      results.push(`read("${path}") = "${c}"`);
      snapshot({ title: { vi: `read("${path}")`, en: `read("${path}")` }, highlight: ids, vars: [{ name: "op", value: `read("${path}")` }, { name: "content", value: c }], note: { vi: `Đọc file: "${c}".`, en: `Read file: "${c}".` } });
    }
  }

  if (steps.length) steps[steps.length - 1].final = true;
  return { ops, answer: results.join(" | "), steps };
}

/**
 * LeetCode 1295: Find Numbers with Even Number of Digits.
 * Count how many numbers in the array have an even number of digits.
 */
function buildSteps1295(nums) {
  const steps = [];
  let count = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [{ name: "count", value: 0 }],
    note: {
      vi: `Duyệt từng số, đếm số lượng chữ số. Nếu chẵn → count += 1.`,
      en: `Iterate each number, count its digits. If even → count += 1.`,
    },
  });

  const evenIndices = [];
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const digits = String(num).length;
    const isEven = digits % 2 === 0;
    if (isEven) {
      count++;
      evenIndices.push(i);
    }

    steps.push({
      title: { vi: `Xét nums[${i}] = ${num}`, en: `Check nums[${i}] = ${num}` },
      arr: [...nums],
      highlight: [i],
      mark: [...evenIndices],
      codeLines: [4, 5, 6],
      vars: [
        { name: "i", value: i },
        { name: "num", value: num },
        { name: "digits", value: digits },
        { name: "even?", value: isEven ? "yes" : "no" },
        { name: "count", value: count },
      ],
      note: {
        vi: `${num} có ${digits} chữ số (${isEven ? "chẵn → count++" : "lẻ → bỏ qua"}). count = ${count}.`,
        en: `${num} has ${digits} digit(s) (${isEven ? "even → count++" : "odd → skip"}). count = ${count}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: [...evenIndices],
    final: true,
    codeLines: [7],
    vars: [
      { name: "count", value: count },
      { name: "even numbers", value: evenIndices.map((i) => nums[i]) },
    ],
    note: {
      vi: `Có ${count} số có số lượng chữ số chẵn: [${evenIndices.map((i) => nums[i]).join(", ")}].`,
      en: `${count} number(s) have an even number of digits: [${evenIndices.map((i) => nums[i]).join(", ")}].`,
    },
  });

  return { original: [...nums], answer: count, steps };
}

/**
 * LeetCode 977: Squares of a Sorted Array.
 * Two-pointer: compare abs(left) vs abs(right), place larger square at the end of result.
 */
function buildSteps977(nums) {
  const n = nums.length;
  const result = new Array(n).fill(0);
  const steps = [];
  let left = 0;
  let right = n - 1;
  let pos = n - 1;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    sub: [...result],
    highlight: [left, right],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "left", value: left },
      { name: "right", value: right },
      { name: "pos", value: pos },
    ],
    note: {
      vi: `Hai con trỏ: left = 0, right = ${right}. Điền result từ cuối (pos = ${pos}).`,
      en: `Two pointers: left = 0, right = ${right}. Fill result from the end (pos = ${pos}).`,
    },
  });

  while (left <= right) {
    const absL = Math.abs(nums[left]);
    const absR = Math.abs(nums[right]);
    let chosen;
    if (absL > absR) {
      result[pos] = absL * absL;
      chosen = "left";
      steps.push({
        title: { vi: `|nums[${left}]| > |nums[${right}]|`, en: `|nums[${left}]| > |nums[${right}]|` },
        arr: [...nums],
        sub: [...result],
        highlight: [left, right],
        mark: [left],
        codeLines: [7, 8, 9],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "|left|", value: absL },
          { name: "|right|", value: absR },
          { name: "result[pos]", value: result[pos] },
          { name: "pos", value: pos },
        ],
        note: {
          vi: `|${nums[left]}| = ${absL} > |${nums[right]}| = ${absR}. result[${pos}] = ${absL}² = ${result[pos]}. Di chuyển left →.`,
          en: `|${nums[left]}| = ${absL} > |${nums[right]}| = ${absR}. result[${pos}] = ${absL}² = ${result[pos]}. Move left →.`,
        },
      });
      left++;
    } else {
      result[pos] = absR * absR;
      chosen = "right";
      steps.push({
        title: { vi: `|nums[${right}]| ≥ |nums[${left}]|`, en: `|nums[${right}]| ≥ |nums[${left}]|` },
        arr: [...nums],
        sub: [...result],
        highlight: [left, right],
        mark: [right],
        codeLines: [10, 11, 12],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "|left|", value: absL },
          { name: "|right|", value: absR },
          { name: "result[pos]", value: result[pos] },
          { name: "pos", value: pos },
        ],
        note: {
          vi: `|${nums[right]}| = ${absR} ≥ |${nums[left]}| = ${absL}. result[${pos}] = ${absR}² = ${result[pos]}. Di chuyển ← right.`,
          en: `|${nums[right]}| = ${absR} ≥ |${nums[left]}| = ${absL}. result[${pos}] = ${absR}² = ${result[pos]}. Move right ←.`,
        },
      });
      right--;
    }
    pos--;
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...result],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [13],
    vars: [{ name: "result", value: [...result] }],
    note: {
      vi: `Mảng bình phương đã sắp xếp: [${result.join(", ")}].`,
      en: `Sorted squares array: [${result.join(", ")}].`,
    },
  });

  return { original: [...nums], answer: result, steps };
}

/**
 * LeetCode 88: Merge Sorted Array.
 * Three pointers from the back: p1 = m-1, p2 = n-1, write = m+n-1.
 * Compare nums1[p1] vs nums2[p2], place the larger at write position.
 */
function buildSteps88(input, params) {
  const m = params.m;
  const n = params.n;
  const nums2Str = String(params.nums2 || "");
  const nums2 = nums2Str.split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x));
  const nums1 = [...input]; // already has trailing zeros

  const steps = [];
  let p1 = m - 1;
  let p2 = n - 1;
  let write = m + n - 1;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums1],
    sub: [...nums2, ...new Array(m).fill("")],
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "m", value: m },
      { name: "n", value: n },
      { name: "p1", value: p1 },
      { name: "p2", value: p2 },
      { name: "write", value: write },
      { name: "nums2", value: `[${nums2.join(",")}]` },
    ],
    note: {
      vi: `nums1 = [${nums1.join(",")}] (m=${m} phần tử + ${n} chỗ trống). nums2 = [${nums2.join(",")}]. Điền từ cuối.`,
      en: `nums1 = [${nums1.join(",")}] (m=${m} elements + ${n} slots). nums2 = [${nums2.join(",")}]. Fill from end.`,
    },
  });

  while (p1 >= 0 && p2 >= 0) {
    const v1 = nums1[p1];
    const v2 = nums2[p2];
    if (v1 > v2) {
      nums1[write] = v1;
      steps.push({
        title: { vi: `nums1[${p1}]=${v1} > nums2[${p2}]=${v2}`, en: `nums1[${p1}]=${v1} > nums2[${p2}]=${v2}` },
        arr: [...nums1],
        highlight: [p1, write],
        mark: [],
        codeLines: [6, 7, 8],
        vars: [
          { name: "p1", value: p1 },
          { name: "p2", value: p2 },
          { name: "write", value: write },
          { name: "placed", value: v1 },
        ],
        note: {
          vi: `${v1} > ${v2} → đặt ${v1} tại vị trí ${write}. p1--.`,
          en: `${v1} > ${v2} → place ${v1} at position ${write}. p1--.`,
        },
      });
      p1--;
    } else {
      nums1[write] = v2;
      steps.push({
        title: { vi: `nums2[${p2}]=${v2} ≥ nums1[${p1}]=${v1}`, en: `nums2[${p2}]=${v2} ≥ nums1[${p1}]=${v1}` },
        arr: [...nums1],
        highlight: [write],
        mark: [],
        codeLines: [9, 10, 11],
        vars: [
          { name: "p1", value: p1 },
          { name: "p2", value: p2 },
          { name: "write", value: write },
          { name: "placed", value: v2 },
        ],
        note: {
          vi: `${v2} ≥ ${v1} → đặt ${v2} (từ nums2) tại vị trí ${write}. p2--.`,
          en: `${v2} ≥ ${v1} → place ${v2} (from nums2) at position ${write}. p2--.`,
        },
      });
      p2--;
    }
    write--;
  }

  // Copy remaining nums2 elements
  while (p2 >= 0) {
    nums1[write] = nums2[p2];
    steps.push({
      title: { vi: `Copy nums2[${p2}]=${nums2[p2]}`, en: `Copy nums2[${p2}]=${nums2[p2]}` },
      arr: [...nums1],
      highlight: [write],
      mark: [],
      codeLines: [12, 13],
      vars: [
        { name: "p2", value: p2 },
        { name: "write", value: write },
        { name: "placed", value: nums2[p2] },
      ],
      note: {
        vi: `p1 hết. Copy nums2[${p2}]=${nums2[p2]} vào vị trí ${write}.`,
        en: `p1 exhausted. Copy nums2[${p2}]=${nums2[p2]} into position ${write}.`,
      },
    });
    p2--;
    write--;
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums1],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [14],
    vars: [{ name: "nums1", value: [...nums1] }],
    note: {
      vi: `Mảng đã gộp: [${nums1.join(", ")}].`,
      en: `Merged array: [${nums1.join(", ")}].`,
    },
  });

  return { original: input, answer: nums1, steps };
}

/**
 * LeetCode 27: Remove Element.
 * Two-pointer in-place: write pointer k, read pointer i.
 * If nums[i] != val, copy to nums[k] and advance k.
 */
function buildSteps27(nums, params) {
  const val = params.val;
  const arr = [...nums];
  const steps = [];
  let k = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...arr],
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [
      { name: "val", value: val },
      { name: "k", value: 0 },
    ],
    note: {
      vi: `Xóa tất cả phần tử bằng ${val}. k = vị trí ghi tiếp theo.`,
      en: `Remove all elements equal to ${val}. k = next write position.`,
    },
  });

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== val) {
      arr[k] = arr[i];
      steps.push({
        title: { vi: `nums[${i}]=${nums[i]} ≠ ${val} → giữ`, en: `nums[${i}]=${nums[i]} ≠ ${val} → keep` },
        arr: [...arr],
        highlight: [i],
        mark: Array.from({ length: k + 1 }, (_, x) => x),
        codeLines: [4, 5, 6],
        vars: [
          { name: "i", value: i },
          { name: "nums[i]", value: nums[i] },
          { name: "k", value: k + 1 },
          { name: "action", value: "keep" },
        ],
        note: {
          vi: `${nums[i]} ≠ ${val} → copy vào nums[${k}]. k → ${k + 1}.`,
          en: `${nums[i]} ≠ ${val} → copy into nums[${k}]. k → ${k + 1}.`,
        },
      });
      k++;
    } else {
      steps.push({
        title: { vi: `nums[${i}]=${nums[i]} == ${val} → bỏ`, en: `nums[${i}]=${nums[i]} == ${val} → skip` },
        arr: [...arr],
        highlight: [i],
        mark: Array.from({ length: k }, (_, x) => x),
        codeLines: [4],
        vars: [
          { name: "i", value: i },
          { name: "nums[i]", value: nums[i] },
          { name: "k", value: k },
          { name: "action", value: "skip" },
        ],
        note: {
          vi: `${nums[i]} == ${val} → bỏ qua, không copy. k giữ nguyên = ${k}.`,
          en: `${nums[i]} == ${val} → skip, don't copy. k stays at ${k}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...arr],
    highlight: [],
    mark: Array.from({ length: k }, (_, x) => x),
    final: true,
    codeLines: [7],
    vars: [
      { name: "k", value: k },
      { name: "result", value: arr.slice(0, k) },
    ],
    note: {
      vi: `Sau khi xóa: ${k} phần tử còn lại = [${arr.slice(0, k).join(", ")}].`,
      en: `After removal: ${k} elements remain = [${arr.slice(0, k).join(", ")}].`,
    },
  });

  return { original: [...nums], answer: k, steps };
}

/**
 * LeetCode 487: Max Consecutive Ones II.
 * Sliding window: allow flipping at most one 0 to 1.
 */
function buildSteps487(nums) {
  const steps = [];
  const inWindow = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, x) => lo + x);

  let left = 0;
  let zeroCount = 0;
  let maxLen = 0;
  let bestL = 0;
  let bestR = -1;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "left", value: 0 },
      { name: "zeroCount", value: 0 },
      { name: "maxLen", value: 0 },
    ],
    note: {
      vi: `Mảng nhị phân. Được lật tối đa 1 số 0 thành 1. Tìm dãy 1 liên tiếp dài nhất.`,
      en: `Binary array. May flip at most one 0 to 1. Find the longest consecutive-ones run.`,
    },
  });

  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeroCount++;

    steps.push({
      title: { vi: `Mở rộng: right = ${right}`, en: `Expand: right = ${right}` },
      arr: [...nums],
      highlight: inWindow(left, right),
      mark: [],
      codeLines: [6, 7, 8],
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "zeroCount", value: zeroCount },
        { name: "maxLen", value: maxLen },
      ],
      note: {
        vi: `Thêm nums[${right}]=${nums[right]}. Số 0 trong cửa sổ = ${zeroCount}.`,
        en: `Add nums[${right}]=${nums[right]}. Zeros in window = ${zeroCount}.`,
      },
    });

    while (zeroCount > 1) {
      if (nums[left] === 0) zeroCount--;
      left++;
      steps.push({
        title: { vi: `Co: left = ${left}`, en: `Shrink: left = ${left}` },
        arr: [...nums],
        highlight: left <= right ? inWindow(left, right) : [],
        mark: [],
        codeLines: [9, 10, 11],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "zeroCount", value: zeroCount },
          { name: "maxLen", value: maxLen },
        ],
        note: {
          vi: `zeroCount > 1 → co trái. Bỏ nums[${left - 1}]. zeroCount = ${zeroCount}.`,
          en: `zeroCount > 1 → shrink left. Drop nums[${left - 1}]. zeroCount = ${zeroCount}.`,
        },
      });
    }

    const len = right - left + 1;
    if (len > maxLen) {
      maxLen = len;
      bestL = left;
      bestR = right;
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: bestR >= 0 ? inWindow(bestL, bestR) : [],
    final: true,
    codeLines: [12],
    vars: [
      { name: "maxLen", value: maxLen },
      { name: "window", value: `[${bestL}..${bestR}]` },
    ],
    note: {
      vi: `Dãy 1 liên tiếp dài nhất (lật ≤1 số 0) = ${maxLen}, đoạn [${bestL}..${bestR}].`,
      en: `Longest consecutive ones (flipping ≤1 zero) = ${maxLen}, segment [${bestL}..${bestR}].`,
    },
  });

  return { original: [...nums], answer: maxLen, steps };
}

/**
 * LeetCode 941: Valid Mountain Array.
 * Walk up from the left, walk down to the right.
 * Valid if peak is not at either end.
 */
function buildSteps941(nums) {
  const n = nums.length;
  const steps = [];

  if (n < 3) {
    steps.push({
      title: { vi: "Quá ngắn", en: "Too short" },
      arr: [...nums],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      vars: [{ name: "result", value: false }],
      note: { vi: `Mảng cần ít nhất 3 phần tử. Trả về False.`, en: `Array needs at least 3 elements. Return False.` },
    });
    return { original: [...nums], answer: false, steps };
  }

  steps.push({
    title: { vi: "Bắt đầu leo lên", en: "Start climbing up" },
    arr: [...nums],
    highlight: [0],
    mark: [],
    codeLines: [4, 5],
    vars: [{ name: "i", value: 0 }, { name: "phase", value: "climb" }],
    note: { vi: "Bắt đầu từ trái, đi lên bao lâu nums[i] < nums[i+1].", en: "Start from the left, climb while nums[i] < nums[i+1]." },
  });

  let i = 0;
  while (i + 1 < n && nums[i] < nums[i + 1]) {
    i++;
    steps.push({
      title: { vi: `Leo lên: i = ${i}`, en: `Climb: i = ${i}` },
      arr: [...nums],
      highlight: Array.from({ length: i + 1 }, (_, x) => x),
      mark: [],
      codeLines: [5, 6],
      vars: [
        { name: "i", value: i },
        { name: "nums[i]", value: nums[i] },
        { name: "phase", value: "climb" },
      ],
      note: {
        vi: `nums[${i - 1}]=${nums[i - 1]} < nums[${i}]=${nums[i]} → tiếp tục leo.`,
        en: `nums[${i - 1}]=${nums[i - 1]} < nums[${i}]=${nums[i]} → keep climbing.`,
      },
    });
  }

  const peak = i;
  if (peak === 0 || peak === n - 1) {
    steps.push({
      title: { vi: "Không có đỉnh hợp lệ", en: "No valid peak" },
      arr: [...nums],
      highlight: [peak],
      mark: [],
      final: true,
      codeLines: [7],
      vars: [{ name: "peak", value: peak }, { name: "result", value: false }],
      note: {
        vi: `Đỉnh ở biên (i=${peak}) → không phải núi. Trả về False.`,
        en: `Peak at boundary (i=${peak}) → not a mountain. Return False.`,
      },
    });
    return { original: [...nums], answer: false, steps };
  }

  steps.push({
    title: { vi: `Đỉnh tại i = ${peak}`, en: `Peak at i = ${peak}` },
    arr: [...nums],
    highlight: [peak],
    mark: [peak],
    codeLines: [7, 8],
    vars: [{ name: "peak", value: peak }, { name: "nums[peak]", value: nums[peak] }],
    note: { vi: `Đỉnh = nums[${peak}] = ${nums[peak]}. Bây giờ đi xuống.`, en: `Peak = nums[${peak}] = ${nums[peak]}. Now descend.` },
  });

  while (i + 1 < n && nums[i] > nums[i + 1]) {
    i++;
    steps.push({
      title: { vi: `Xuống: i = ${i}`, en: `Descend: i = ${i}` },
      arr: [...nums],
      highlight: Array.from({ length: i - peak + 1 }, (_, x) => peak + x),
      mark: [peak],
      codeLines: [8, 9],
      vars: [
        { name: "i", value: i },
        { name: "nums[i]", value: nums[i] },
        { name: "phase", value: "descend" },
      ],
      note: {
        vi: `nums[${i - 1}]=${nums[i - 1]} > nums[${i}]=${nums[i]} → tiếp tục xuống.`,
        en: `nums[${i - 1}]=${nums[i - 1]} > nums[${i}]=${nums[i]} → keep descending.`,
      },
    });
  }

  const valid = i === n - 1;
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: valid ? Array.from({ length: n }, (_, x) => x) : [peak],
    final: true,
    codeLines: [10],
    vars: [
      { name: "i", value: i },
      { name: "n-1", value: n - 1 },
      { name: "result", value: valid },
    ],
    note: {
      vi: valid
        ? `Đã xuống tới cuối (i=${i} == n-1). Đây là núi hợp lệ → True.`
        : `Dừng sớm tại i=${i} (chưa tới cuối). Không phải núi → False.`,
      en: valid
        ? `Descended to the end (i=${i} == n-1). Valid mountain → True.`
        : `Stopped early at i=${i} (not at end). Not a mountain → False.`,
    },
  });

  return { original: [...nums], answer: valid, steps };
}

/**
 * LeetCode 1299: Replace Elements with Greatest Element on Right Side.
 * Traverse right to left, track running max. Replace each element with the max to its right.
 * Last element becomes -1.
 */
function buildSteps1299(nums) {
  const n = nums.length;
  const original = [...nums];
  const arr = [...nums];
  const steps = [];

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...arr],
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [{ name: "rightMax", value: -1 }],
    note: {
      vi: `Duyệt từ phải qua trái. rightMax = -1 (phía sau phần tử cuối không có gì).`,
      en: `Traverse right to left. rightMax = -1 (nothing to the right of the last element).`,
    },
  });

  let rightMax = -1;
  for (let i = n - 1; i >= 0; i--) {
    const cur = arr[i];
    arr[i] = rightMax;
    rightMax = Math.max(rightMax, cur);

    steps.push({
      title: { vi: `i = ${i}: thay ${cur} → ${arr[i]}`, en: `i = ${i}: replace ${cur} → ${arr[i]}` },
      arr: [...arr],
      highlight: [i],
      mark: [],
      codeLines: [5, 6, 7, 8],
      vars: [
        { name: "i", value: i },
        { name: "original", value: cur },
        { name: "arr[i]", value: arr[i] },
        { name: "rightMax", value: rightMax },
      ],
      note: {
        vi: `arr[${i}] = rightMax cũ = ${arr[i]}. Cập nhật rightMax = max(${arr[i] === -1 && i === n - 1 ? -1 : rightMax === cur ? cur : rightMax}, ${cur}) = ${rightMax}.`,
        en: `arr[${i}] = old rightMax = ${arr[i]}. Update rightMax = max(prev, ${cur}) = ${rightMax}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...arr],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [9],
    vars: [{ name: "result", value: [...arr] }],
    note: {
      vi: `Kết quả: [${arr.join(", ")}].`,
      en: `Result: [${arr.join(", ")}].`,
    },
  });

  return { original, answer: arr, steps };
}

/**
 * LeetCode 905: Sort Array By Parity.
 * Two pointers: left finds odd, right finds even, swap them.
 */
function buildSteps905(nums) {
  const arr = [...nums];
  const n = arr.length;
  const steps = [];
  let left = 0;
  let right = n - 1;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...arr],
    highlight: [left, right],
    mark: [],
    codeLines: [3, 4],
    vars: [{ name: "left", value: left }, { name: "right", value: right }],
    note: {
      vi: `Hai con trỏ: left = 0 (tìm lẻ), right = ${right} (tìm chẵn). Khi gặp → hoán đổi.`,
      en: `Two pointers: left = 0 (find odd), right = ${right} (find even). When found → swap.`,
    },
  });

  while (left < right) {
    if (arr[left] % 2 === 0) {
      steps.push({
        title: { vi: `left=${left}: ${arr[left]} chẵn → tiến`, en: `left=${left}: ${arr[left]} even → advance` },
        arr: [...arr],
        highlight: [left],
        mark: Array.from({ length: left }, (_, x) => x),
        codeLines: [5, 6],
        vars: [{ name: "left", value: left }, { name: "right", value: right }, { name: "arr[left]", value: arr[left] }],
        note: { vi: `${arr[left]} chẵn, đúng vị trí. left++.`, en: `${arr[left]} is even, correct side. left++.` },
      });
      left++;
    } else if (arr[right] % 2 === 1) {
      steps.push({
        title: { vi: `right=${right}: ${arr[right]} lẻ → lùi`, en: `right=${right}: ${arr[right]} odd → retreat` },
        arr: [...arr],
        highlight: [right],
        mark: [],
        codeLines: [7, 8],
        vars: [{ name: "left", value: left }, { name: "right", value: right }, { name: "arr[right]", value: arr[right] }],
        note: { vi: `${arr[right]} lẻ, đúng vị trí. right--.`, en: `${arr[right]} is odd, correct side. right--.` },
      });
      right--;
    } else {
      const tmp = arr[left];
      arr[left] = arr[right];
      arr[right] = tmp;
      steps.push({
        title: { vi: `Hoán đổi [${left}]↔[${right}]`, en: `Swap [${left}]↔[${right}]` },
        arr: [...arr],
        highlight: [left, right],
        mark: [],
        codeLines: [9, 10],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "swapped", value: `${arr[left]}↔${arr[right]}` },
        ],
        note: {
          vi: `arr[${left}]=${arr[right]} (lẻ) và arr[${right}]=${arr[left]} (chẵn) → hoán đổi. left++, right--.`,
          en: `arr[${left}]=${arr[right]} (odd) and arr[${right}]=${arr[left]} (even) → swap. left++, right--.`,
        },
      });
      left++;
      right--;
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...arr],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [11],
    vars: [{ name: "result", value: [...arr] }],
    note: {
      vi: `Tất cả chẵn ở trái, lẻ ở phải: [${arr.join(", ")}].`,
      en: `All evens on the left, odds on the right: [${arr.join(", ")}].`,
    },
  });

  return { original: [...nums], answer: arr, steps };
}

/**
 * LeetCode 1089: Duplicate Zeros.
 * In-place: first pass counts zeros to find effective end, then fill from right to left.
 * When we encounter a zero, write it twice.
 */
function buildSteps1089(nums) {
  const n = nums.length;
  const original = [...nums];
  const arr = [...nums];
  const steps = [];

  // Pass 1: count zeros to find where the "write" pointer would land
  let zeros = 0;
  for (let i = 0; i < n; i++) {
    if (arr[i] === 0) zeros++;
  }

  steps.push({
    title: { vi: "Đếm số 0", en: "Count zeros" },
    arr: [...arr],
    highlight: arr.map((v, i) => v === 0 ? i : -1).filter((i) => i >= 0),
    mark: [],
    codeLines: [3, 4, 5],
    vars: [{ name: "zeros", value: zeros }, { name: "n", value: n }],
    note: {
      vi: `Có ${zeros} số 0 cần nhân đôi. Mỗi số 0 chiếm 2 chỗ → phần cuối sẽ bị đẩy ra.`,
      en: `Found ${zeros} zeros to duplicate. Each zero takes 2 slots → tail elements get pushed out.`,
    },
  });

  // Pass 2: fill from right to left
  let read = n - 1;
  let write = n + zeros - 1;

  // Adjust: skip elements that would write beyond the array
  // We need to handle the edge case where a zero's duplicate lands exactly at n-1
  let r = n - 1;
  let w = n + zeros - 1;

  // Simpler approach: use the standard two-pointer from-right technique
  // First, find the last element that fits
  let possibleDuplicates = 0;
  let length_ = n - 1;
  for (let i = 0; i <= length_ - possibleDuplicates; i++) {
    if (arr[i] === 0) {
      if (i === length_ - possibleDuplicates) {
        // Edge case: this zero can't be fully duplicated, just copy once at end
        arr[length_] = 0;
        length_--;
        break;
      }
      possibleDuplicates++;
    }
  }

  // Now fill from the end
  const last = length_ - possibleDuplicates;
  let j = length_;
  for (let i = last; i >= 0; i--) {
    if (arr[i] === 0) {
      arr[j] = 0;
      arr[j - 1] = 0;
      steps.push({
        title: { vi: `Nhân đôi 0 tại i=${i}`, en: `Duplicate 0 at i=${i}` },
        arr: [...arr],
        highlight: [j - 1, j],
        mark: [],
        codeLines: [9, 10, 11],
        vars: [
          { name: "i (read)", value: i },
          { name: "j (write)", value: j },
          { name: "action", value: "duplicate 0" },
        ],
        note: {
          vi: `arr[${i}]=0 → ghi 0 tại vị trí ${j} và ${j - 1}.`,
          en: `arr[${i}]=0 → write 0 at positions ${j} and ${j - 1}.`,
        },
      });
      j -= 2;
    } else {
      arr[j] = arr[i];
      steps.push({
        title: { vi: `Copy arr[${i}]=${original[i]} → [${j}]`, en: `Copy arr[${i}]=${original[i]} → [${j}]` },
        arr: [...arr],
        highlight: [j],
        mark: [],
        codeLines: [12, 13],
        vars: [
          { name: "i (read)", value: i },
          { name: "j (write)", value: j },
          { name: "action", value: `copy ${arr[j]}` },
        ],
        note: {
          vi: `arr[${i}]=${original[i]} (khác 0) → copy sang vị trí ${j}.`,
          en: `arr[${i}]=${original[i]} (non-zero) → copy to position ${j}.`,
        },
      });
      j--;
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...arr],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [14],
    vars: [{ name: "result", value: [...arr] }],
    note: {
      vi: `Kết quả: [${arr.join(", ")}].`,
      en: `Result: [${arr.join(", ")}].`,
    },
  });

  return { original, answer: arr, steps };
}

/**
 * LeetCode 283: Move Zeroes.
 * Two-pointer: write pointer places non-zeros, then fill remaining with 0.
 */
function buildSteps283(nums) {
  const arr = [...nums];
  const n = arr.length;
  const steps = [];
  let write = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...arr],
    highlight: [],
    mark: [],
    codeLines: [3],
    vars: [{ name: "write", value: 0 }],
    note: {
      vi: `Di chuyển tất cả số 0 về cuối, giữ thứ tự các số khác 0. write = vị trí ghi tiếp.`,
      en: `Move all zeros to the end, maintaining relative order of non-zeros. write = next write position.`,
    },
  });

  for (let i = 0; i < n; i++) {
    if (arr[i] !== 0) {
      arr[write] = arr[i];
      if (write !== i) arr[i] = 0;
      steps.push({
        title: { vi: `nums[${i}]=${nums[i]} ≠ 0 → ghi tại [${write}]`, en: `nums[${i}]=${nums[i]} ≠ 0 → write at [${write}]` },
        arr: [...arr],
        highlight: [write],
        mark: Array.from({ length: write + 1 }, (_, x) => x),
        codeLines: [4, 5, 6],
        vars: [
          { name: "i", value: i },
          { name: "write", value: write + 1 },
          { name: "placed", value: nums[i] },
        ],
        note: {
          vi: `${nums[i]} khác 0 → đặt tại vị trí ${write}. write → ${write + 1}.`,
          en: `${nums[i]} is non-zero → place at position ${write}. write → ${write + 1}.`,
        },
      });
      write++;
    } else {
      steps.push({
        title: { vi: `nums[${i}]=0 → bỏ qua`, en: `nums[${i}]=0 → skip` },
        arr: [...arr],
        highlight: [i],
        mark: Array.from({ length: write }, (_, x) => x),
        codeLines: [4],
        vars: [
          { name: "i", value: i },
          { name: "write", value: write },
        ],
        note: {
          vi: `nums[${i}]=0 → bỏ qua, write giữ nguyên.`,
          en: `nums[${i}]=0 → skip, write stays at ${write}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...arr],
    highlight: [],
    mark: Array.from({ length: write }, (_, x) => x),
    final: true,
    codeLines: [7],
    vars: [{ name: "result", value: [...arr] }],
    note: {
      vi: `Kết quả: [${arr.join(", ")}]. ${write} phần tử khác 0 ở đầu, ${n - write} số 0 ở cuối.`,
      en: `Result: [${arr.join(", ")}]. ${write} non-zeros at front, ${n - write} zeros at end.`,
    },
  });

  return { original: [...nums], answer: arr, steps };
}

/**
 * LeetCode 209: Minimum Size Subarray Sum.
 * Sliding window: expand right, shrink left while sum >= target, track min length.
 */
function buildSteps209(nums, params) {
  const target = params.target;
  const n = nums.length;
  const steps = [];
  const inWindow = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, x) => lo + x);

  let left = 0;
  let sum = 0;
  let minLen = Infinity;
  let bestL = 0;
  let bestR = -1;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "target", value: target },
      { name: "left", value: 0 },
      { name: "sum", value: 0 },
      { name: "minLen", value: "∞" },
    ],
    note: {
      vi: `Tìm đoạn con ngắn nhất có tổng ≥ ${target}. Cửa sổ trượt: mở rộng rồi co.`,
      en: `Find shortest subarray with sum ≥ ${target}. Sliding window: expand then shrink.`,
    },
  });

  for (let right = 0; right < n; right++) {
    sum += nums[right];

    steps.push({
      title: { vi: `Mở rộng: right=${right}`, en: `Expand: right=${right}` },
      arr: [...nums],
      highlight: inWindow(left, right),
      mark: [],
      codeLines: [6, 7],
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "sum", value: sum },
        { name: "minLen", value: minLen === Infinity ? "∞" : minLen },
      ],
      note: {
        vi: `Thêm nums[${right}]=${nums[right]}. sum=${sum}${sum >= target ? " ≥ target → co cửa sổ" : ""}.`,
        en: `Add nums[${right}]=${nums[right]}. sum=${sum}${sum >= target ? " ≥ target → shrink" : ""}.`,
      },
    });

    while (sum >= target) {
      const len = right - left + 1;
      if (len < minLen) {
        minLen = len;
        bestL = left;
        bestR = right;
      }
      sum -= nums[left];
      left++;

      steps.push({
        title: { vi: `Co: left=${left}, len=${len}`, en: `Shrink: left=${left}, len=${len}` },
        arr: [...nums],
        highlight: left <= right ? inWindow(left, right) : [],
        mark: [],
        codeLines: [8, 9, 10, 11],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "sum", value: sum },
          { name: "minLen", value: minLen },
          { name: "windowLen", value: len },
        ],
        note: {
          vi: `sum cũ ≥ ${target}. Bỏ nums[${left - 1}]=${nums[left - 1]}. Đoạn dài ${len}${len === minLen ? " → cập nhật minLen" : ""}. sum=${sum}.`,
          en: `sum was ≥ ${target}. Drop nums[${left - 1}]=${nums[left - 1]}. Window was ${len}${len === minLen ? " → update minLen" : ""}. sum=${sum}.`,
        },
      });
    }
  }

  const answer = minLen === Infinity ? 0 : minLen;
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: bestR >= 0 ? inWindow(bestL, bestR) : [],
    final: true,
    codeLines: [12],
    vars: [
      { name: "minLen", value: answer },
      { name: "window", value: bestR >= 0 ? `[${bestL}..${bestR}]` : "none" },
    ],
    note: {
      vi: answer === 0
        ? `Không có đoạn con nào có tổng ≥ ${target}. Trả về 0.`
        : `Đoạn ngắn nhất có tổng ≥ ${target}: [${bestL}..${bestR}] = [${nums.slice(bestL, bestR + 1).join(",")}], dài ${answer}.`,
      en: answer === 0
        ? `No subarray sums to ≥ ${target}. Return 0.`
        : `Shortest subarray with sum ≥ ${target}: [${bestL}..${bestR}] = [${nums.slice(bestL, bestR + 1).join(",")}], length ${answer}.`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * LeetCode 713: Subarray Product Less Than K.
 * Sliding window: expand right (multiply), shrink left (divide) while product >= k.
 * Count of valid subarrays ending at right = right - left + 1.
 */
function buildSteps713(nums, params) {
  const k = params.k;
  const n = nums.length;
  const steps = [];
  const inWindow = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, x) => lo + x);

  if (k <= 1) {
    steps.push({
      title: { vi: "k ≤ 1 → 0", en: "k ≤ 1 → 0" },
      arr: [...nums],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [3],
      vars: [{ name: "k", value: k }, { name: "answer", value: 0 }],
      note: { vi: `k ≤ 1: không có tích dương nào < ${k}. Trả về 0.`, en: `k ≤ 1: no positive product < ${k}. Return 0.` },
    });
    return { original: [...nums], answer: 0, steps };
  }

  let left = 0;
  let product = 1;
  let count = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [4, 5, 6],
    vars: [{ name: "k", value: k }, { name: "left", value: 0 }, { name: "product", value: 1 }, { name: "count", value: 0 }],
    note: {
      vi: `Đếm đoạn con có tích < ${k}. Cửa sổ trượt: nhân khi mở rộng, chia khi co.`,
      en: `Count subarrays with product < ${k}. Sliding window: multiply to expand, divide to shrink.`,
    },
  });

  for (let right = 0; right < n; right++) {
    product *= nums[right];

    while (product >= k && left <= right) {
      product /= nums[left];
      left++;
    }

    const added = right - left + 1;
    count += added;

    steps.push({
      title: { vi: `right=${right}: +${added} đoạn`, en: `right=${right}: +${added} subarrays` },
      arr: [...nums],
      highlight: inWindow(left, right),
      mark: [],
      codeLines: [7, 8, 9, 10, 11],
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "product", value: product },
        { name: "added", value: added },
        { name: "count", value: count },
      ],
      note: {
        vi: `Cửa sổ [${left}..${right}], tích = ${product} < ${k}. Có ${added} đoạn con mới kết thúc tại ${right}. Tổng = ${count}.`,
        en: `Window [${left}..${right}], product = ${product} < ${k}. ${added} new subarray(s) ending at ${right}. Total = ${count}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [12],
    vars: [{ name: "count", value: count }],
    note: {
      vi: `Tổng số đoạn con có tích < ${k} = ${count}.`,
      en: `Total subarrays with product < ${k} = ${count}.`,
    },
  });

  return { original: [...nums], answer: count, steps };
}

/**
 * Generate steps for LeetCode 13: Roman to Integer.
 *
 * Scan left to right:
 *  - If current value < next value → subtract current.
 *  - Else → add current.
 */
function buildSteps13(input) {
  const s = String(input).toUpperCase();
  const roman = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  const steps = [];
  const chars = s.split("");
  const values = chars.map((ch) => roman[ch] || 0);

  let result = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    codeLines: [2, 3, 4],
    vars: [
      { name: "s", value: s },
      { name: "result", value: 0 },
    ],
    note: {
      vi: `Chuỗi La Mã: "${s}". Giá trị từng ký tự: [${values.join(", ")}]. Duyệt từ trái sang phải.`,
      en: `Roman string: "${s}". Character values: [${values.join(", ")}]. Scan left to right.`,
    },
  });

  for (let i = 0; i < s.length; i++) {
    const cur = values[i];
    const next = i + 1 < s.length ? values[i + 1] : 0;
    const subtract = cur < next;

    if (subtract) {
      result -= cur;
      steps.push({
        title: { vi: `i=${i}: ${chars[i]}(${cur}) < ${chars[i + 1]}(${next}) → trừ`, en: `i=${i}: ${chars[i]}(${cur}) < ${chars[i + 1]}(${next}) → subtract` },
        arr: values,
        sub: chars,
        highlight: [i, i + 1],
        mark: [],
        codeLines: [5, 6, 7],
        vars: [
          { name: "i", value: i },
          { name: "s[i]", value: `${chars[i]} = ${cur}` },
          { name: "s[i+1]", value: `${chars[i + 1]} = ${next}` },
          { name: "action", value: `subtract ${cur}` },
          { name: "result", value: result },
        ],
        note: {
          vi: `${chars[i]}(${cur}) < ${chars[i + 1]}(${next}) → result -= ${cur}. result = ${result}.`,
          en: `${chars[i]}(${cur}) < ${chars[i + 1]}(${next}) → result -= ${cur}. result = ${result}.`,
        },
      });
    } else {
      result += cur;
      steps.push({
        title: { vi: `i=${i}: ${chars[i]}(${cur}) → cộng`, en: `i=${i}: ${chars[i]}(${cur}) → add` },
        arr: values,
        sub: chars,
        highlight: [i],
        mark: [],
        codeLines: [5, 6, 8, 9],
        vars: [
          { name: "i", value: i },
          { name: "s[i]", value: `${chars[i]} = ${cur}` },
          { name: "s[i+1]", value: i + 1 < s.length ? `${chars[i + 1]} = ${next}` : "end" },
          { name: "action", value: `add ${cur}` },
          { name: "result", value: result },
        ],
        note: {
          vi: i + 1 < s.length
            ? `${chars[i]}(${cur}) >= ${chars[i + 1]}(${next}) → result += ${cur}. result = ${result}.`
            : `${chars[i]}(${cur}) là ký tự cuối → result += ${cur}. result = ${result}.`,
          en: i + 1 < s.length
            ? `${chars[i]}(${cur}) >= ${chars[i + 1]}(${next}) → result += ${cur}. result = ${result}.`
            : `${chars[i]}(${cur}) is the last character → result += ${cur}. result = ${result}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: values,
    sub: chars,
    highlight: [],
    mark: [],
    final: true,
    codeLines: [10],
    vars: [{ name: "answer", value: result }],
    note: {
      vi: `"${s}" = ${result}.`,
      en: `"${s}" = ${result}.`,
    },
  });

  return { original: s, answer: result, steps };
}

/**
 * Generate steps for LeetCode 205: Isomorphic Strings.
 *
 * Use two hash maps (s→t and t→s) to enforce bijective mapping:
 *  - If s[i] already mapped, check it maps to t[i].
 *  - If not mapped, check t[i] is not already mapped to another char in s.
 *  - If any conflict → False. Otherwise → True.
 */
function buildSteps205(input, params) {
  const s = String(input);
  const t = String(params.t || "");
  const steps = [];

  // Display arrays: show both strings as paired characters
  const sChars = s.split("");
  const tChars = t.split("");

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: sChars.map((c, i) => 0),
    sub: sChars.map((c, i) => `${c}→${tChars[i] || "?"}`),
    highlight: [],
    mark: [],
    codeLines: [2, 3, 4, 5],
    vars: [
      { name: "s", value: s },
      { name: "t", value: t },
      { name: "map_s", value: "{}" },
      { name: "map_t", value: "{}" },
    ],
    note: {
      vi: `So sánh "${s}" và "${t}". Dùng 2 hash map: map_s (s→t) và map_t (t→s) để kiểm tra ánh xạ 1-1.`,
      en: `Compare "${s}" and "${t}". Use 2 hash maps: map_s (s→t) and map_t (t→s) to verify bijective mapping.`,
    },
  });

  if (s.length !== t.length) {
    steps.push({
      title: { vi: "Độ dài khác nhau → False", en: "Different lengths → False" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [2, 3],
      vars: [
        { name: "len(s)", value: s.length },
        { name: "len(t)", value: t.length },
        { name: "result", value: false },
      ],
      note: {
        vi: `len(s)=${s.length} ≠ len(t)=${t.length} → không thể đẳng cấu → False.`,
        en: `len(s)=${s.length} ≠ len(t)=${t.length} → cannot be isomorphic → False.`,
      },
    });
    return { s, t, answer: false, steps };
  }

  const mapS = {};
  const mapT = {};
  let answer = true;

  const fmtMap = (m) => {
    const entries = Object.entries(m).map(([k, v]) => `${k}→${v}`);
    return `{${entries.join(", ")}}`;
  };

  for (let i = 0; i < s.length; i++) {
    const c1 = s[i];
    const c2 = t[i];

    if (c1 in mapS) {
      if (mapS[c1] !== c2) {
        // Conflict: c1 already maps to something else
        answer = false;
        steps.push({
          title: { vi: `i=${i}: xung đột → False`, en: `i=${i}: conflict → False` },
          arr: sChars.map((_, j) => j <= i ? 1 : 0),
          sub: sChars.map((c, j) => `${c}→${tChars[j]}`),
          highlight: [i],
          mark: [i],
          final: true,
          codeLines: [6, 7, 8, 9],
          vars: [
            { name: "i", value: i },
            { name: "c1", value: c1 },
            { name: "c2", value: c2 },
            { name: "map_s[c1]", value: mapS[c1] },
            { name: "conflict", value: `${c1}→${mapS[c1]} but need ${c1}→${c2}` },
            { name: "map_s", value: fmtMap(mapS) },
            { name: "result", value: false },
          ],
          note: {
            vi: `'${c1}' đã ánh xạ sang '${mapS[c1]}', nhưng bây giờ cần ánh xạ sang '${c2}' → xung đột → False.`,
            en: `'${c1}' already maps to '${mapS[c1]}', but now needs to map to '${c2}' → conflict → False.`,
          },
        });
        return { s, t, answer: false, steps };
      }
      // Consistent mapping
      steps.push({
        title: { vi: `i=${i}: ${c1}→${c2} (đã ánh xạ) ✓`, en: `i=${i}: ${c1}→${c2} (existing) ✓` },
        arr: sChars.map((_, j) => j <= i ? 1 : 0),
        sub: sChars.map((c, j) => `${c}→${tChars[j]}`),
        highlight: [i],
        mark: [],
        codeLines: [6, 7, 8],
        vars: [
          { name: "i", value: i },
          { name: "c1", value: c1 },
          { name: "c2", value: c2 },
          { name: "map_s[c1]", value: mapS[c1] },
          { name: "map_s", value: fmtMap(mapS) },
          { name: "map_t", value: fmtMap(mapT) },
        ],
        note: {
          vi: `'${c1}' đã ánh xạ sang '${c2}' → nhất quán, tiếp tục.`,
          en: `'${c1}' already maps to '${c2}' → consistent, continue.`,
        },
      });
    } else {
      if (c2 in mapT) {
        // Conflict: c2 already mapped from another char
        answer = false;
        steps.push({
          title: { vi: `i=${i}: xung đột ngược → False`, en: `i=${i}: reverse conflict → False` },
          arr: sChars.map((_, j) => j <= i ? 1 : 0),
          sub: sChars.map((c, j) => `${c}→${tChars[j]}`),
          highlight: [i],
          mark: [i],
          final: true,
          codeLines: [6, 7, 11, 12],
          vars: [
            { name: "i", value: i },
            { name: "c1", value: c1 },
            { name: "c2", value: c2 },
            { name: "map_t[c2]", value: mapT[c2] },
            { name: "conflict", value: `${c2} already mapped from '${mapT[c2]}', cannot map from '${c1}'` },
            { name: "map_t", value: fmtMap(mapT) },
            { name: "result", value: false },
          ],
          note: {
            vi: `'${c2}' đã được ánh xạ từ '${mapT[c2]}', không thể ánh xạ từ '${c1}' nữa → xung đột → False.`,
            en: `'${c2}' is already mapped from '${mapT[c2]}', cannot also map from '${c1}' → conflict → False.`,
          },
        });
        return { s, t, answer: false, steps };
      }
      // New mapping
      mapS[c1] = c2;
      mapT[c2] = c1;
      steps.push({
        title: { vi: `i=${i}: ${c1}→${c2} (mới)`, en: `i=${i}: ${c1}→${c2} (new)` },
        arr: sChars.map((_, j) => j <= i ? 1 : 0),
        sub: sChars.map((c, j) => `${c}→${tChars[j]}`),
        highlight: [i],
        mark: [],
        codeLines: [6, 7, 11, 13, 14, 15],
        vars: [
          { name: "i", value: i },
          { name: "c1", value: c1 },
          { name: "c2", value: c2 },
          { name: "map_s", value: fmtMap(mapS) },
          { name: "map_t", value: fmtMap(mapT) },
        ],
        note: {
          vi: `Tạo ánh xạ mới: '${c1}' ↔ '${c2}'. map_s = ${fmtMap(mapS)}.`,
          en: `Create new mapping: '${c1}' ↔ '${c2}'. map_s = ${fmtMap(mapS)}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Kết quả: True", en: "Result: True" },
    arr: sChars.map(() => 1),
    sub: sChars.map((c, i) => `${c}→${tChars[i]}`),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [16],
    vars: [
      { name: "map_s", value: fmtMap(mapS) },
      { name: "result", value: true },
    ],
    note: {
      vi: `Tất cả ký tự ánh xạ 1-1 không xung đột → "${s}" và "${t}" đẳng cấu → True.`,
      en: `All characters map bijectively without conflict → "${s}" and "${t}" are isomorphic → True.`,
    },
  });

  return { s, t, answer: true, steps };
}

/**
 * Generate steps for LeetCode 246: Strobogrammatic Number.
 *
 * Two pointers from both ends:
 *  - Check if num[left] has a valid rotated pair.
 *  - Check if the pair matches num[right].
 *  - Move pointers inward until they meet.
 */
function buildSteps246(input) {
  const num = String(input);
  const pairs = { "0": "0", "1": "1", "6": "9", "8": "8", "9": "6" };
  const steps = [];
  const digits = num.split("");
  const digitNums = digits.map(Number);

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: digitNums,
    sub: digits,
    highlight: [],
    mark: [],
    codeLines: [2, 3],
    vars: [
      { name: "num", value: num },
      { name: "pairs", value: "0↔0, 1↔1, 6↔9, 8↔8, 9↔6" },
      { name: "left", value: 0 },
      { name: "right", value: num.length - 1 },
    ],
    note: {
      vi: `Kiểm tra "${num}" có phải strobogrammatic không. Dùng 2 con trỏ: left=0, right=${num.length - 1}.`,
      en: `Check if "${num}" is strobogrammatic. Use two pointers: left=0, right=${num.length - 1}.`,
    },
  });

  let left = 0;
  let right = num.length - 1;
  let answer = true;

  while (left <= right) {
    const lChar = num[left];
    const rChar = num[right];

    if (!(lChar in pairs)) {
      answer = false;
      steps.push({
        title: { vi: `'${lChar}' không hợp lệ → False`, en: `'${lChar}' invalid → False` },
        arr: digitNums,
        sub: digits,
        highlight: [left],
        mark: [left],
        final: true,
        codeLines: [4, 5, 6],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "num[left]", value: lChar },
          { name: "valid_digits", value: "0,1,6,8,9" },
          { name: "result", value: false },
        ],
        note: {
          vi: `'${lChar}' không nằm trong tập {0,1,6,8,9} nên không thể xoay 180° → False.`,
          en: `'${lChar}' is not in {0,1,6,8,9} so it cannot be rotated 180° → False.`,
        },
      });
      return { num, answer: false, steps };
    }

    if (pairs[lChar] !== rChar) {
      answer = false;
      steps.push({
        title: { vi: `'${lChar}'↔'${rChar}' không khớp → False`, en: `'${lChar}'↔'${rChar}' mismatch → False` },
        arr: digitNums,
        sub: digits,
        highlight: [left, right],
        mark: [left, right],
        final: true,
        codeLines: [4, 7, 8],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "num[left]", value: lChar },
          { name: "num[right]", value: rChar },
          { name: "expected", value: pairs[lChar] },
          { name: "result", value: false },
        ],
        note: {
          vi: `'${lChar}' xoay 180° thành '${pairs[lChar]}', nhưng num[right]='${rChar}' ≠ '${pairs[lChar]}' → False.`,
          en: `'${lChar}' rotated 180° becomes '${pairs[lChar]}', but num[right]='${rChar}' ≠ '${pairs[lChar]}' → False.`,
        },
      });
      return { num, answer: false, steps };
    }

    // Match
    steps.push({
      title: { vi: `'${lChar}'↔'${rChar}' ✓`, en: `'${lChar}'↔'${rChar}' ✓` },
      arr: digitNums,
      sub: digits,
      highlight: [left, right],
      mark: [],
      codeLines: [4, 7, 9, 10],
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "num[left]", value: lChar },
        { name: "num[right]", value: rChar },
        { name: "pairs[left]", value: pairs[lChar] },
      ],
      note: {
        vi: left === right
          ? `Ký tự giữa '${lChar}' xoay 180° vẫn là '${pairs[lChar]}' = '${rChar}' ✓.`
          : `'${lChar}' xoay 180° = '${pairs[lChar]}' khớp với num[${right}]='${rChar}' ✓. Dời con trỏ.`,
        en: left === right
          ? `Middle character '${lChar}' rotated 180° is still '${pairs[lChar]}' = '${rChar}' ✓.`
          : `'${lChar}' rotated 180° = '${pairs[lChar]}' matches num[${right}]='${rChar}' ✓. Move pointers.`,
      },
    });

    left++;
    right--;
  }

  steps.push({
    title: { vi: "Kết quả: True", en: "Result: True" },
    arr: digitNums,
    sub: digits,
    highlight: [],
    mark: [],
    final: true,
    codeLines: [11],
    vars: [{ name: "result", value: true }],
    note: {
      vi: `Tất cả cặp ký tự đều hợp lệ → "${num}" là strobogrammatic → True.`,
      en: `All character pairs are valid → "${num}" is strobogrammatic → True.`,
    },
  });

  return { num, answer: true, steps };
}

/**
 * Generate steps for LeetCode 734: Sentence Similarity.
 *
 * Build a set of similar pairs (both directions), then check each word pair.
 */
function buildSteps734(input, params) {
  const s1 = String(input).split(",").map((w) => w.trim()).filter((w) => w.length > 0);
  const s2 = String(params.sentence2 || "").split(",").map((w) => w.trim()).filter((w) => w.length > 0);
  const pairsRaw = String(params.pairs || "").split(",").map((p) => p.trim()).filter((p) => p.length > 0);
  const pairs = pairsRaw.map((p) => {
    const parts = p.split("-");
    return [parts[0] || "", parts[1] || ""];
  });

  const steps = [];

  // Build pair set
  const pairSet = new Set();
  for (const [a, b] of pairs) {
    pairSet.add(`${a}|${b}`);
    pairSet.add(`${b}|${a}`);
  }

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: s1.map(() => 0),
    sub: s1.map((w, i) => `${w}↔${s2[i] || "?"}`),
    highlight: [],
    mark: [],
    codeLines: [2, 4, 5, 6, 7],
    vars: [
      { name: "sentence1", value: `[${s1.join(", ")}]` },
      { name: "sentence2", value: `[${s2.join(", ")}]` },
      { name: "pairs", value: pairs.map(([a, b]) => `(${a},${b})`).join(", ") },
      { name: "pairSet size", value: pairSet.size },
    ],
    note: {
      vi: `sentence1 = [${s1.join(", ")}], sentence2 = [${s2.join(", ")}]. Xây set từ ${pairs.length} cặp tương đồng.`,
      en: `sentence1 = [${s1.join(", ")}], sentence2 = [${s2.join(", ")}]. Build set from ${pairs.length} similar pairs.`,
    },
  });

  // Check length
  if (s1.length !== s2.length) {
    steps.push({
      title: { vi: "Độ dài khác nhau → False", en: "Different lengths → False" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [2, 3],
      vars: [
        { name: "len(s1)", value: s1.length },
        { name: "len(s2)", value: s2.length },
        { name: "result", value: false },
      ],
      note: {
        vi: `len(sentence1)=${s1.length} ≠ len(sentence2)=${s2.length} → False.`,
        en: `len(sentence1)=${s1.length} ≠ len(sentence2)=${s2.length} → False.`,
      },
    });
    return { s1, s2, pairs, answer: false, steps };
  }

  // Check each word
  for (let i = 0; i < s1.length; i++) {
    const w1 = s1[i];
    const w2 = s2[i];

    if (w1 === w2) {
      steps.push({
        title: { vi: `i=${i}: "${w1}" == "${w2}" ✓`, en: `i=${i}: "${w1}" == "${w2}" ✓` },
        arr: s1.map((_, j) => j <= i ? 1 : 0),
        sub: s1.map((w, j) => `${w}↔${s2[j]}`),
        highlight: [i],
        mark: [],
        codeLines: [8, 9, 10],
        vars: [
          { name: "i", value: i },
          { name: "s1[i]", value: w1 },
          { name: "s2[i]", value: w2 },
          { name: "match", value: "identical" },
        ],
        note: {
          vi: `"${w1}" == "${w2}" → giống nhau, bỏ qua.`,
          en: `"${w1}" == "${w2}" → identical, skip.`,
        },
      });
      continue;
    }

    const inSet = pairSet.has(`${w1}|${w2}`);
    if (!inSet) {
      steps.push({
        title: { vi: `i=${i}: "${w1}"↔"${w2}" không tương đồng → False`, en: `i=${i}: "${w1}"↔"${w2}" not similar → False` },
        arr: s1.map((_, j) => j <= i ? 1 : 0),
        sub: s1.map((w, j) => `${w}↔${s2[j]}`),
        highlight: [i],
        mark: [i],
        final: true,
        codeLines: [8, 11, 12],
        vars: [
          { name: "i", value: i },
          { name: "s1[i]", value: w1 },
          { name: "s2[i]", value: w2 },
          { name: "inPairSet", value: false },
          { name: "result", value: false },
        ],
        note: {
          vi: `"${w1}" ≠ "${w2}" và cặp ("${w1}","${w2}") không có trong similarPairs → False.`,
          en: `"${w1}" ≠ "${w2}" and pair ("${w1}","${w2}") is not in similarPairs → False.`,
        },
      });
      return { s1, s2, pairs, answer: false, steps };
    }

    steps.push({
      title: { vi: `i=${i}: "${w1}"↔"${w2}" tương đồng ✓`, en: `i=${i}: "${w1}"↔"${w2}" similar ✓` },
      arr: s1.map((_, j) => j <= i ? 1 : 0),
      sub: s1.map((w, j) => `${w}↔${s2[j]}`),
      highlight: [i],
      mark: [],
      codeLines: [8, 11],
      vars: [
        { name: "i", value: i },
        { name: "s1[i]", value: w1 },
        { name: "s2[i]", value: w2 },
        { name: "inPairSet", value: true },
      ],
      note: {
        vi: `"${w1}" ≠ "${w2}" nhưng cặp ("${w1}","${w2}") có trong similarPairs → tương đồng ✓.`,
        en: `"${w1}" ≠ "${w2}" but pair ("${w1}","${w2}") is in similarPairs → similar ✓.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả: True", en: "Result: True" },
    arr: s1.map(() => 1),
    sub: s1.map((w, i) => `${w}↔${s2[i]}`),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [13],
    vars: [{ name: "result", value: true }],
    note: {
      vi: `Mọi cặp từ đều giống nhau hoặc tương đồng → hai câu tương đồng → True.`,
      en: `All word pairs are identical or similar → the sentences are similar → True.`,
    },
  });

  return { s1, s2, pairs, answer: true, steps };
}

/**
 * Generate steps for LeetCode 760: Find Anagram Mappings.
 * Build a hash map from nums2 (value → index), then map each element of nums1.
 */
function buildSteps760(input, params) {
  const nums1 = String(input).split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
  const nums2 = String(params.nums2 || "").split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
  const steps = [];

  // Build index map from nums2
  const indexMap = {};
  for (let i = 0; i < nums2.length; i++) {
    indexMap[nums2[i]] = i;
  }

  const fmtMap = () => {
    const entries = Object.entries(indexMap).map(([k, v]) => `${k}:${v}`);
    return `{${entries.join(", ")}}`;
  };

  steps.push({
    title: { vi: "Xây hash map từ nums2", en: "Build hash map from nums2" },
    arr: [...nums2],
    highlight: nums2.map((_, i) => i),
    mark: [],
    codeLines: [2, 3, 4],
    vars: [
      { name: "nums1", value: `[${nums1.join(", ")}]` },
      { name: "nums2", value: `[${nums2.join(", ")}]` },
      { name: "index_map", value: fmtMap() },
    ],
    note: {
      vi: `Xây hash map: value → index từ nums2. index_map = ${fmtMap()}.`,
      en: `Build hash map: value → index from nums2. index_map = ${fmtMap()}.`,
    },
  });

  const result = [];
  for (let i = 0; i < nums1.length; i++) {
    const val = nums1[i];
    const j = indexMap[val];
    result.push(j);

    steps.push({
      title: { vi: `nums1[${i}]=${val} → index ${j}`, en: `nums1[${i}]=${val} → index ${j}` },
      arr: [...nums2],
      highlight: [j],
      mark: [],
      codeLines: [5],
      vars: [
        { name: "i", value: i },
        { name: "nums1[i]", value: val },
        { name: "index_map[val]", value: j },
        { name: "result", value: `[${result.join(", ")}]` },
      ],
      note: {
        vi: `nums1[${i}]=${val} nằm ở vị trí ${j} trong nums2 → mapping[${i}] = ${j}.`,
        en: `nums1[${i}]=${val} is at position ${j} in nums2 → mapping[${i}] = ${j}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...result],
    highlight: [],
    mark: [],
    final: true,
    codeLines: [5],
    vars: [{ name: "answer", value: `[${result.join(", ")}]` }],
    note: {
      vi: `Mapping: [${result.join(", ")}].`,
      en: `Mapping: [${result.join(", ")}].`,
    },
  });

  return { nums1, nums2, answer: `[${result.join(", ")}]`, steps };
}

/**
 * Generate steps for LeetCode 771: Jewels and Stones.
 * Build a set from jewels, then count stones that are in the set.
 */
function buildSteps771(input, params) {
  const jewels = String(input);
  const stones = String(params.stones || "");
  const steps = [];
  const jewelSet = new Set(jewels.split(""));

  steps.push({
    title: { vi: "Xây set đá quý", en: "Build jewel set" },
    arr: stones.split("").map(() => 0),
    sub: stones.split(""),
    highlight: [],
    mark: [],
    codeLines: [2],
    vars: [
      { name: "jewels", value: jewels },
      { name: "stones", value: stones },
      { name: "jewel_set", value: `{${jewels.split("").join(", ")}}` },
    ],
    note: {
      vi: `Đá quý: "${jewels}" → set = {${jewels.split("").join(", ")}}. Đếm trong "${stones}".`,
      en: `Jewels: "${jewels}" → set = {${jewels.split("").join(", ")}}. Count in "${stones}".`,
    },
  });

  let count = 0;
  const stoneChars = stones.split("");
  for (let i = 0; i < stoneChars.length; i++) {
    const s = stoneChars[i];
    const isJewel = jewelSet.has(s);
    if (isJewel) count++;

    steps.push({
      title: { vi: `i=${i}: '${s}' ${isJewel ? "→ đá quý ✓" : "→ không"}`, en: `i=${i}: '${s}' ${isJewel ? "→ jewel ✓" : "→ not jewel"}` },
      arr: stoneChars.map((c, j) => j <= i ? (jewelSet.has(c) ? 1 : 0) : 0),
      sub: stoneChars,
      highlight: [i],
      mark: isJewel ? [i] : [],
      codeLines: [3, 4, 5, 6],
      vars: [
        { name: "i", value: i },
        { name: "stone", value: s },
        { name: "isJewel", value: isJewel },
        { name: "count", value: count },
      ],
      note: {
        vi: isJewel
          ? `'${s}' ∈ jewel_set → count = ${count}.`
          : `'${s}' ∉ jewel_set → bỏ qua. count = ${count}.`,
        en: isJewel
          ? `'${s}' ∈ jewel_set → count = ${count}.`
          : `'${s}' ∉ jewel_set → skip. count = ${count}.`,
      },
    });
  }

  steps.push({
    title: { vi: `Kết quả: ${count}`, en: `Result: ${count}` },
    arr: stoneChars.map((c) => (jewelSet.has(c) ? 1 : 0)),
    sub: stoneChars,
    highlight: [],
    mark: stoneChars.map((c, i) => (jewelSet.has(c) ? i : -1)).filter((i) => i >= 0),
    final: true,
    codeLines: [7],
    vars: [{ name: "answer", value: count }],
    note: {
      vi: `Có ${count} viên đá là đá quý trong "${stones}".`,
      en: `There are ${count} jewels among the stones in "${stones}".`,
    },
  });

  return { jewels, stones, answer: count, steps };
}

/**
 * Generate steps for LeetCode 1275: Find Winner on a Tic Tac Toe Game.
 * Simulate each move on a 3x3 board and check for a winner.
 */
function buildSteps1275(input) {
  const movesRaw = String(input).split(",").map((m) => m.trim()).filter((m) => m.length > 0);
  const moves = movesRaw.map((m) => {
    const parts = m.split("-");
    return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
  });
  const steps = [];

  const board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];

  const boardStr = () => board.map((r) => r.map((c) => c || ".").join("")).join("|");

  function checkWin(player) {
    for (let i = 0; i < 3; i++) {
      if (board[i][0] === player && board[i][1] === player && board[i][2] === player) return true;
      if (board[0][i] === player && board[1][i] === player && board[2][i] === player) return true;
    }
    if (board[0][0] === player && board[1][1] === player && board[2][2] === player) return true;
    if (board[0][2] === player && board[1][1] === player && board[2][0] === player) return true;
    return false;
  }

  // Flatten board to 9-cell array for bar visualization
  const flatBoard = () => {
    const flat = [];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        flat.push(board[r][c] === "A" ? 1 : board[r][c] === "B" ? -1 : 0);
    return flat;
  };
  const flatLabels = () => {
    const flat = [];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        flat.push(board[r][c] || ".");
    return flat;
  };

  steps.push({
    title: { vi: "Bàn cờ trống", en: "Empty board" },
    arr: flatBoard(),
    sub: flatLabels(),
    highlight: [],
    mark: [],
    codeLines: [2],
    vars: [
      { name: "moves", value: movesRaw.join(", ") },
      { name: "board", value: boardStr() },
    ],
    note: {
      vi: `Bàn 3×3 trống. A đi trước (nước lẻ), B đi sau (nước chẵn).`,
      en: `Empty 3×3 board. A goes first (odd moves), B goes second (even moves).`,
    },
  });

  let winner = null;
  for (let i = 0; i < moves.length; i++) {
    const [r, c] = moves[i];
    const player = i % 2 === 0 ? "A" : "B";
    board[r][c] = player;
    const cellIdx = r * 3 + c;

    const won = checkWin(player);
    if (won) winner = player;

    steps.push({
      title: { vi: `Nước ${i + 1}: ${player} → (${r},${c})${won ? " 🏆" : ""}`, en: `Move ${i + 1}: ${player} → (${r},${c})${won ? " 🏆" : ""}` },
      arr: flatBoard(),
      sub: flatLabels(),
      highlight: [cellIdx],
      mark: won ? flatBoard().map((v, idx) => (v === (player === "A" ? 1 : -1) ? idx : -1)).filter((x) => x >= 0) : [],
      final: won,
      codeLines: [3, 4],
      vars: [
        { name: "move", value: i + 1 },
        { name: "player", value: player },
        { name: "cell", value: `(${r},${c})` },
        { name: "board", value: boardStr() },
        { name: "winner", value: won ? player : "none" },
      ],
      note: {
        vi: won
          ? `${player} đánh ô (${r},${c}) và THẮNG! 🏆`
          : `${player} đánh ô (${r},${c}). Board: ${boardStr()}.`,
        en: won
          ? `${player} plays (${r},${c}) and WINS! 🏆`
          : `${player} plays (${r},${c}). Board: ${boardStr()}.`,
      },
    });

    if (won) {
      return { moves: movesRaw, answer: winner, steps };
    }
  }

  const answer = moves.length === 9 ? "Draw" : "Pending";
  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: flatBoard(),
    sub: flatLabels(),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [16],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: answer === "Draw"
        ? "Hết ô mà không ai thắng → Hòa."
        : `Còn ô trống và chưa ai thắng → Pending.`,
      en: answer === "Draw"
        ? "All cells filled with no winner → Draw."
        : `Empty cells remain and no winner → Pending.`,
    },
  });

  return { moves: movesRaw, answer, steps };
}

/**
 * Generate steps for LeetCode 1394: Find Lucky Integer in an Array.
 * Count frequencies, then find the largest number whose frequency equals itself.
 */
function buildSteps1394(nums) {
  const steps = [];

  // Count frequencies
  const freq = {};
  for (const num of nums) {
    freq[num] = (freq[num] || 0) + 1;
  }

  const fmtFreq = () => {
    const entries = Object.entries(freq).map(([k, v]) => `${k}:${v}`);
    return `{${entries.join(", ")}}`;
  };

  steps.push({
    title: { vi: "Đếm tần suất", en: "Count frequencies" },
    arr: [...nums],
    highlight: [],
    mark: [],
    codeLines: [2, 3, 4],
    vars: [
      { name: "arr", value: `[${nums.join(", ")}]` },
      { name: "freq", value: fmtFreq() },
    ],
    note: {
      vi: `Đếm tần suất từng số: ${fmtFreq()}.`,
      en: `Count frequency of each number: ${fmtFreq()}.`,
    },
  });

  // Find lucky numbers
  let result = -1;
  const luckyNums = [];
  const entries = Object.entries(freq).sort(([a], [b]) => Number(a) - Number(b));

  for (const [numStr, count] of entries) {
    const num = Number(numStr);
    const isLucky = num === count;
    if (isLucky) {
      luckyNums.push(num);
      result = Math.max(result, num);
    }

    steps.push({
      title: { vi: `${num}: freq=${count} ${isLucky ? "= num → lucky ✓" : "≠ num"}`, en: `${num}: freq=${count} ${isLucky ? "= num → lucky ✓" : "≠ num"}` },
      arr: [...nums],
      highlight: nums.map((v, i) => v === num ? i : -1).filter((i) => i >= 0),
      mark: isLucky ? nums.map((v, i) => v === num ? i : -1).filter((i) => i >= 0) : [],
      codeLines: [5, 6, 7, 8],
      vars: [
        { name: "num", value: num },
        { name: "count", value: count },
        { name: "isLucky", value: isLucky },
        { name: "result", value: result },
      ],
      note: {
        vi: isLucky
          ? `${num} xuất hiện ${count} lần = chính nó → lucky! result = ${result}.`
          : `${num} xuất hiện ${count} lần ≠ ${num} → không phải lucky.`,
        en: isLucky
          ? `${num} appears ${count} times = itself → lucky! result = ${result}.`
          : `${num} appears ${count} times ≠ ${num} → not lucky.`,
      },
    });
  }

  steps.push({
    title: { vi: `Kết quả: ${result}`, en: `Result: ${result}` },
    arr: [...nums],
    highlight: [],
    mark: result > 0 ? nums.map((v, i) => v === result ? i : -1).filter((i) => i >= 0) : [],
    final: true,
    codeLines: [9],
    vars: [
      { name: "lucky_numbers", value: luckyNums.length ? `[${luckyNums.join(", ")}]` : "none" },
      { name: "answer", value: result },
    ],
    note: {
      vi: result === -1
        ? "Không có số lucky nào → trả về -1."
        : `Số lucky lớn nhất = ${result}.`,
      en: result === -1
        ? "No lucky number exists → return -1."
        : `Largest lucky number = ${result}.`,
    },
  });

  return { original: [...nums], answer: result, steps };
}

/**
 * Generate steps for LeetCode 1399: Count Largest Group.
 * Group numbers 1..n by digit sum, find how many groups have the max size.
 */
function buildSteps1399(input) {
  const n = input[0];
  const steps = [];
  const groups = {};

  // Build groups
  for (let i = 1; i <= n; i++) {
    const digitSum = String(i).split("").reduce((s, d) => s + Number(d), 0);
    if (!groups[digitSum]) groups[digitSum] = [];
    groups[digitSum].push(i);
  }

  const sortedKeys = Object.keys(groups).map(Number).sort((a, b) => a - b);
  const groupSizes = sortedKeys.map((k) => groups[k].length);
  const groupLabels = sortedKeys.map((k) => `Σ=${k}`);

  steps.push({
    title: { vi: "Nhóm theo tổng chữ số", en: "Group by digit sum" },
    arr: groupSizes,
    sub: groupLabels,
    highlight: [],
    mark: [],
    codeLines: [2, 3, 4, 5],
    vars: [
      { name: "n", value: n },
      { name: "groups", value: sortedKeys.length },
    ],
    note: {
      vi: `Nhóm các số 1..${n} theo tổng chữ số. Có ${sortedKeys.length} nhóm.`,
      en: `Group numbers 1..${n} by digit sum. There are ${sortedKeys.length} groups.`,
    },
  });

  // Show each group
  for (const key of sortedKeys) {
    const members = groups[key];
    const idx = sortedKeys.indexOf(key);
    steps.push({
      title: { vi: `Σ=${key}: [${members.join(",")}] (${members.length})`, en: `Σ=${key}: [${members.join(",")}] (${members.length})` },
      arr: groupSizes,
      sub: groupLabels,
      highlight: [idx],
      mark: [],
      codeLines: [3, 4, 5],
      vars: [
        { name: "digit_sum", value: key },
        { name: "members", value: `[${members.join(", ")}]` },
        { name: "size", value: members.length },
      ],
      note: {
        vi: `Nhóm tổng chữ số = ${key}: gồm ${members.length} số [${members.join(", ")}].`,
        en: `Group with digit sum = ${key}: contains ${members.length} numbers [${members.join(", ")}].`,
      },
    });
  }

  // Find max and count
  const maxSize = Math.max(...groupSizes);
  const largestGroups = sortedKeys.filter((k) => groups[k].length === maxSize);
  const answer = largestGroups.length;

  const maxIndices = sortedKeys.map((k, i) => groups[k].length === maxSize ? i : -1).filter((i) => i >= 0);

  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: groupSizes,
    sub: groupLabels,
    highlight: [],
    mark: maxIndices,
    final: true,
    codeLines: [6, 7],
    vars: [
      { name: "max_size", value: maxSize },
      { name: "largest_groups", value: largestGroups.map((k) => `Σ=${k}`).join(", ") },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Kích thước nhóm lớn nhất = ${maxSize}. Có ${answer} nhóm đạt kích thước này: [${largestGroups.map((k) => `Σ=${k}`).join(", ")}].`,
      en: `Largest group size = ${maxSize}. There are ${answer} groups with this size: [${largestGroups.map((k) => `Σ=${k}`).join(", ")}].`,
    },
  });

  return { n, answer, steps };
}

/**
 * Generate steps for LeetCode 50: Pow(x, n).
 *
 * Fast exponentiation (binary exponentiation):
 *  - If n < 0: x = 1/x, n = -n.
 *  - result = 1.
 *  - Loop: if n is odd then result *= x; x *= x; n = floor(n/2).
 *  - The answer is result.
 */
function buildSteps50(input, params) {
  let x = params.x;
  let n = input[0];
  const steps = [];
  const origX = x;
  const origN = n;

  // Track result history for bar visualization
  const resultHistory = [];
  const labels = [];

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [],
    highlight: [],
    mark: [],
    codeLines: [2, 3],
    vars: [
      { name: "x", value: x },
      { name: "n", value: n },
    ],
    note: {
      vi: `Tính ${x}^${n} bằng lũy thừa nhanh (Binary Exponentiation).`,
      en: `Compute ${x}^${n} using fast exponentiation (Binary Exponentiation).`,
    },
  });

  if (n < 0) {
    x = 1 / x;
    n = -n;
    steps.push({
      title: { vi: "n âm → đảo x", en: "Negative n → invert x" },
      arr: [],
      highlight: [],
      mark: [],
      codeLines: [4, 5],
      vars: [
        { name: "x", value: x },
        { name: "n", value: n },
      ],
      note: {
        vi: `n < 0 nên đổi x = 1/x = ${x}, n = -n = ${n}.`,
        en: `n < 0, so set x = 1/x = ${x}, n = -n = ${n}.`,
      },
    });
  }

  let result = 1;
  let iteration = 0;
  resultHistory.push(result);
  labels.push("init");

  steps.push({
    title: { vi: "Bắt đầu vòng lặp", en: "Start loop" },
    arr: [...resultHistory],
    highlight: [resultHistory.length - 1],
    mark: [],
    codeLines: [6],
    vars: [
      { name: "result", value: result },
      { name: "x", value: x },
      { name: "n", value: n },
      { name: "n (bin)", value: n.toString(2) },
    ],
    note: {
      vi: `result = 1. Lặp: nếu n lẻ thì nhân result với x, rồi bình phương x và chia đôi n.`,
      en: `result = 1. Loop: if n is odd, multiply result by x, then square x and halve n.`,
    },
  });

  while (n > 0) {
    iteration++;
    const nBin = n.toString(2);
    const isOdd = n % 2 === 1;

    if (isOdd) {
      result *= x;
      resultHistory.push(+result.toFixed(10));
      labels.push(`×x`);
      steps.push({
        title: { vi: `Lần ${iteration}: n lẻ → result *= x`, en: `Iter ${iteration}: n odd → result *= x` },
        arr: [...resultHistory],
        highlight: [resultHistory.length - 1],
        mark: [],
        codeLines: [7, 8],
        vars: [
          { name: "n (bin)", value: nBin },
          { name: "n", value: n },
          { name: "n % 2", value: 1 },
          { name: "result", value: +result.toFixed(10) },
          { name: "x", value: +x.toFixed(10) },
        ],
        note: {
          vi: `n=${n} (nhị phân: ${nBin}) là lẻ → result = result × x = ${+result.toFixed(10)}.`,
          en: `n=${n} (binary: ${nBin}) is odd → result = result × x = ${+result.toFixed(10)}.`,
        },
      });
    } else {
      steps.push({
        title: { vi: `Lần ${iteration}: n chẵn → bỏ qua`, en: `Iter ${iteration}: n even → skip` },
        arr: [...resultHistory],
        highlight: [],
        mark: [],
        codeLines: [7],
        vars: [
          { name: "n (bin)", value: nBin },
          { name: "n", value: n },
          { name: "n % 2", value: 0 },
          { name: "result", value: +result.toFixed(10) },
          { name: "x", value: +x.toFixed(10) },
        ],
        note: {
          vi: `n=${n} (nhị phân: ${nBin}) là chẵn → không nhân result.`,
          en: `n=${n} (binary: ${nBin}) is even → do not multiply result.`,
        },
      });
    }

    x *= x;
    n = Math.floor(n / 2);

    steps.push({
      title: { vi: `Bình phương x, chia đôi n`, en: `Square x, halve n` },
      arr: [...resultHistory],
      highlight: [],
      mark: [],
      codeLines: [9, 10],
      vars: [
        { name: "x", value: +x.toFixed(10) },
        { name: "n", value: n },
        { name: "n (bin)", value: n > 0 ? n.toString(2) : "0" },
        { name: "result", value: +result.toFixed(10) },
      ],
      note: {
        vi: `x = x² = ${+x.toFixed(10)}, n = ⌊n/2⌋ = ${n}.`,
        en: `x = x² = ${+x.toFixed(10)}, n = ⌊n/2⌋ = ${n}.`,
      },
    });
  }

  const finalResult = +result.toFixed(10);
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...resultHistory],
    highlight: [],
    mark: [resultHistory.length - 1],
    final: true,
    codeLines: [11],
    vars: [{ name: "answer", value: finalResult }],
    note: {
      vi: `${origX}^${origN} = ${finalResult}.`,
      en: `${origX}^${origN} = ${finalResult}.`,
    },
  });

  return { x: origX, n: origN, answer: finalResult, steps };
}

const SUPPORTED = {
  50: {
    id: 50,
    difficulty: "medium",
    slug: "powx-n",
    category: { key: "math", vi: "Toán / Đệ quy", en: "Math / Recursion" },
    title: { vi: "Pow(x, n)", en: "Pow(x, n)" },
    titleVi: { vi: "Lũy thừa x mũ n", en: "Power x to the n" },
    statement: {
      vi: "Cho x (số thực) và n (số nguyên), tính x^n (tức x mũ n). Sử dụng thuật toán lũy thừa nhanh (binary exponentiation) với độ phức tạp O(log n).",
      en: "Implement pow(x, n), which calculates x raised to the power n. Use fast exponentiation (binary exponentiation) in O(log n) time.",
    },
    defaultInput: [10],
    inputKind: "integer",
    inputLabel: { vi: "n (số mũ)", en: "n (exponent)" },
    singleInput: true,
    maxInput: 30,
    extraParams: [
      {
        key: "x",
        label: { vi: "x (cơ số)", en: "x (base)" },
        default: 2,
        allowNegative: true,
      },
    ],
    complexity: {
      time: "O(log n)",
      space: "O(1)",
      note: {
        vi: "Mỗi vòng lặp chia n cho 2, nên chỉ cần O(log n) phép nhân. Chỉ dùng vài biến phụ nên O(1) bộ nhớ.",
        en: "Each iteration halves n, so only O(log n) multiplications are needed. Only a few extra variables are used, so O(1) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def myPow(self, x: float, n: int) -> float:",
      "        if n < 0:",
      "            x = 1 / x",
      "            n = -n",
      "        result = 1",
      "        while n > 0:",
      "            if n % 2 == 1:",
      "                result *= x",
      "            x *= x",
      "            n //= 2",
      "        return result",
    ],
    builder: buildSteps50,
  },
  713: {
    id: 713,
    difficulty: "medium",
    slug: "subarray-product-less-than-k",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Subarray Product Less Than K", en: "Subarray Product Less Than K" },
    titleVi: { vi: "Đoạn con có tích nhỏ hơn K", en: "Subarrays with product < K" },
    statement: {
      vi: "Cho mảng số nguyên dương nums và k. Trả về số lượng đoạn con liên tiếp có tích các phần tử < k.",
      en: "Given an array of positive integers nums and an integer k, return the number of contiguous subarrays where the product of all elements is strictly less than k.",
    },
    defaultInput: [10, 5, 2, 6],
    inputKind: "positive",
    extraParams: [
      { key: "k", type: "number", label: { vi: "k", en: "k" }, default: 100 },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Mỗi phần tử được nhân/chia tối đa một lần → O(n). O(1) bộ nhớ.",
        en: "Each element multiplied/divided at most once → O(n). O(1) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def numSubarrayProductLessThanK(self, nums, k):",
      "        if k <= 1: return 0",
      "        left = 0",
      "        product = 1",
      "        count = 0",
      "        for right in range(len(nums)):",
      "            product *= nums[right]",
      "            while product >= k:",
      "                product //= nums[left]",
      "                left += 1",
      "            count += right - left + 1",
      "        return count",
    ],
    builder: buildSteps713,
  },
  209: {
    id: 209,
    difficulty: "medium",
    slug: "minimum-size-subarray-sum",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Minimum Size Subarray Sum", en: "Minimum Size Subarray Sum" },
    titleVi: { vi: "Đoạn con ngắn nhất có tổng ≥ target", en: "Shortest subarray with sum ≥ target" },
    statement: {
      vi: "Cho mảng số nguyên dương nums và target. Trả về độ dài ngắn nhất của một đoạn con liên tiếp có tổng ≥ target. Nếu không có, trả về 0.",
      en: "Given an array of positive integers nums and a target, return the minimal length of a contiguous subarray whose sum is ≥ target. If there is none, return 0.",
    },
    defaultInput: [2, 3, 1, 2, 4, 3],
    inputKind: "positive",
    extraParams: [
      { key: "target", type: "number", label: { vi: "target", en: "target" }, default: 7 },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Mỗi phần tử được thêm/bỏ khỏi cửa sổ tối đa 1 lần → O(n). O(1) bộ nhớ.",
        en: "Each element is added/removed at most once → O(n). O(1) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def minSubArrayLen(self, target, nums):",
      "        left = 0",
      "        total = 0",
      "        min_len = float('inf')",
      "        for right in range(len(nums)):",
      "            total += nums[right]",
      "            while total >= target:",
      "                min_len = min(min_len, right-left+1)",
      "                total -= nums[left]",
      "                left += 1",
      "        return min_len if min_len != float('inf') else 0",
    ],
    builder: buildSteps209,
  },
  283: {
    id: 283,
    difficulty: "easy",
    slug: "move-zeroes",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Move Zeroes", en: "Move Zeroes" },
    titleVi: { vi: "Di chuyển số 0 về cuối", en: "Move zeros to end" },
    statement: {
      vi: "Cho mảng nums. Di chuyển tất cả số 0 về cuối mảng, giữ nguyên thứ tự tương đối của các phần tử khác 0. Thực hiện tại chỗ.",
      en: "Given an integer array nums, move all 0's to the end while maintaining the relative order of the non-zero elements. Do it in-place.",
    },
    defaultInput: [0, 1, 0, 3, 12],
    inputKind: "integer",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần, ghi tại chỗ. O(1) bộ nhớ phụ.",
        en: "Single pass, in-place writes. O(1) extra memory.",
      },
    },
    code: [
      "class Solution:",
      "    def moveZeroes(self, nums):",
      "        write = 0",
      "        for i in range(len(nums)):",
      "            if nums[i] != 0:",
      "                nums[write], nums[i] = nums[i], nums[write]",
      "                write += 1",
    ],
    builder: buildSteps283,
  },
  1089: {
    id: 1089,
    difficulty: "easy",
    slug: "duplicate-zeros",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Duplicate Zeros", en: "Duplicate Zeros" },
    titleVi: { vi: "Nhân đôi các số 0", en: "Duplicate zeros in-place" },
    statement: {
      vi: "Cho mảng số nguyên arr. Nhân đôi mỗi số 0, dịch các phần tử còn lại sang phải. Kết quả cùng độ dài (bỏ phần tràn). Thực hiện tại chỗ.",
      en: "Given a fixed-length integer array arr, duplicate each occurrence of zero, shifting the remaining elements to the right. Elements beyond the original length are dropped. Do it in-place.",
    },
    defaultInput: [1, 0, 2, 3, 0, 4, 5, 0],
    inputKind: "nonneg",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Hai pass: đếm O(n) + ghi ngược O(n). Tại chỗ O(1).",
        en: "Two passes: count O(n) + fill backward O(n). In-place O(1).",
      },
    },
    code: [
      "class Solution:",
      "    def duplicateZeros(self, arr):",
      "        n = len(arr)",
      "        zeros = arr.count(0)",
      "        j = n + zeros - 1",
      "        for i in range(n-1, -1, -1):",
      "            if j < n:",
      "                arr[j] = arr[i]",
      "            if arr[i] == 0:",
      "                j -= 1",
      "                if j < n:",
      "                    arr[j] = 0",
      "            j -= 1",
    ],
    builder: buildSteps1089,
  },
  905: {
    id: 905,
    difficulty: "easy",
    slug: "sort-array-by-parity",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Sort Array By Parity", en: "Sort Array By Parity" },
    titleVi: { vi: "Sắp xếp theo tính chẵn lẻ", en: "Sort by parity (evens first)" },
    statement: {
      vi: "Cho mảng nums. Sắp xếp sao cho tất cả số chẵn đứng trước tất cả số lẻ. Có thể trả về bất kỳ đáp án hợp lệ.",
      en: "Given an integer array nums, move all even integers to the beginning followed by all odd integers. Any valid answer is accepted.",
    },
    defaultInput: [3, 1, 2, 4],
    inputKind: "nonneg",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Hai con trỏ gặp nhau ở giữa → O(n). Hoán đổi tại chỗ → O(1).",
        en: "Two pointers meet in the middle → O(n). In-place swaps → O(1).",
      },
    },
    code: [
      "class Solution:",
      "    def sortArrayByParity(self, nums):",
      "        left, right = 0, len(nums) - 1",
      "        while left < right:",
      "            if nums[left] % 2 == 0:",
      "                left += 1",
      "            elif nums[right] % 2 == 1:",
      "                right -= 1",
      "            else:",
      "                nums[left], nums[right] = nums[right], nums[left]",
      "                left += 1; right -= 1",
      "        return nums",
    ],
    builder: buildSteps905,
  },
  1299: {
    id: 1299,
    difficulty: "easy",
    slug: "replace-elements-with-greatest-element-on-right-side",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Replace Elements with Greatest Element on Right Side", en: "Replace Elements with Greatest Element on Right Side" },
    titleVi: { vi: "Thay bằng phần tử lớn nhất bên phải", en: "Replace with greatest on right" },
    statement: {
      vi: "Cho mảng arr. Thay mỗi phần tử bằng phần tử lớn nhất nằm ở bên phải nó. Phần tử cuối trở thành -1.",
      en: "Given an array arr, replace every element with the greatest element among the elements to its right. The last element becomes -1.",
    },
    defaultInput: [17, 18, 5, 4, 6, 1],
    inputKind: "integer",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần từ phải. Thay tại chỗ nên O(1) bộ nhớ phụ.",
        en: "Single right-to-left pass. In-place so O(1) extra memory.",
      },
    },
    code: [
      "class Solution:",
      "    def replaceElements(self, arr):",
      "        n = len(arr)",
      "        right_max = -1",
      "        for i in range(n-1, -1, -1):",
      "            cur = arr[i]",
      "            arr[i] = right_max",
      "            right_max = max(right_max, cur)",
      "        return arr",
    ],
    builder: buildSteps1299,
  },
  941: {
    id: 941,
    difficulty: "easy",
    slug: "valid-mountain-array",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Valid Mountain Array", en: "Valid Mountain Array" },
    titleVi: { vi: "Mảng núi hợp lệ", en: "Check if array forms a mountain" },
    statement: {
      vi: "Cho mảng arr. Trả về True nếu nó là mảng núi: tăng nghiêm ngặt tới một đỉnh, rồi giảm nghiêm ngặt. Cần ít nhất 3 phần tử.",
      en: "Given an array arr, return True if it is a valid mountain array: strictly increasing to a peak, then strictly decreasing. Needs at least 3 elements.",
    },
    defaultInput: [0, 3, 2, 1],
    inputKind: "integer",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần từ trái qua đỉnh rồi xuống. O(1) bộ nhớ.",
        en: "Single pass: climb up then descend. O(1) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def validMountainArray(self, arr):",
      "        n = len(arr)",
      "        if n < 3: return False",
      "        i = 0",
      "        while i+1 < n and arr[i] < arr[i+1]:",
      "            i += 1",
      "        if i == 0 or i == n-1: return False",
      "        while i+1 < n and arr[i] > arr[i+1]:",
      "            i += 1",
      "        return i == n - 1",
    ],
    builder: buildSteps941,
  },
  487: {
    id: 487,
    difficulty: "medium",
    slug: "max-consecutive-ones-ii",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Max Consecutive Ones II", en: "Max Consecutive Ones II" },
    titleVi: { vi: "Dãy số 1 liên tiếp dài nhất II", en: "Longest run of ones (flip 1 zero)" },
    statement: {
      vi: "Cho mảng nhị phân nums. Trả về số lượng 1 liên tiếp lớn nhất nếu bạn được lật tối đa một số 0 thành 1.",
      en: "Given a binary array nums, return the maximum number of consecutive 1's if you can flip at most one 0.",
    },
    defaultInput: [1, 0, 1, 1, 0],
    inputKind: "binary",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Cửa sổ trượt duyệt mảng một lần O(n). Chỉ dùng vài biến O(1).",
        en: "Sliding window traverses once O(n). Only a few variables O(1).",
      },
    },
    code: [
      "class Solution:",
      "    def findMaxConsecutiveOnes(self, nums):",
      "        left = 0",
      "        zero_count = 0",
      "        max_len = 0",
      "        for right in range(len(nums)):",
      "            if nums[right] == 0:",
      "                zero_count += 1",
      "            while zero_count > 1:",
      "                if nums[left] == 0:",
      "                    zero_count -= 1",
      "                left += 1",
      "            max_len = max(max_len, right-left+1)",
      "        return max_len",
    ],
    builder: buildSteps487,
  },
  27: {
    id: 27,
    difficulty: "easy",
    slug: "remove-element",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Remove Element", en: "Remove Element" },
    titleVi: { vi: "Xóa phần tử", en: "Remove element in-place" },
    statement: {
      vi: "Cho mảng nums và giá trị val. Xóa tại chỗ tất cả phần tử bằng val. Trả về số phần tử còn lại k.",
      en: "Given an array nums and a value val, remove all instances of val in-place. Return the number of elements k remaining.",
    },
    defaultInput: [3, 2, 2, 3],
    inputKind: "integer",
    extraParams: [
      { key: "val", type: "number", label: { vi: "val (giá trị cần xóa)", en: "val (value to remove)" }, default: 3, allowNegative: true },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần với 2 con trỏ. Tại chỗ nên O(1) bộ nhớ.",
        en: "Single pass with 2 pointers. In-place so O(1) extra memory.",
      },
    },
    code: [
      "class Solution:",
      "    def removeElement(self, nums, val):",
      "        k = 0",
      "        for i in range(len(nums)):",
      "            if nums[i] != val:",
      "                nums[k] = nums[i]",
      "                k += 1",
      "        return k",
    ],
    builder: buildSteps27,
  },
  88: {
    id: 88,
    difficulty: "easy",
    slug: "merge-sorted-array",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Merge Sorted Array", en: "Merge Sorted Array" },
    titleVi: { vi: "Gộp mảng đã sắp xếp", en: "Merge two sorted arrays in-place" },
    statement: {
      vi:
        "Cho mảng nums1 (kích thước m+n, m phần tử đầu đã sắp xếp, n phần tử cuối = 0 dùng làm chỗ trống) " +
        "và mảng nums2 (n phần tử đã sắp xếp). Gộp nums2 vào nums1 tại chỗ, kết quả sắp xếp tăng dần.",
      en:
        "You are given nums1 of size m+n (first m elements sorted, last n are zeros as placeholders) " +
        "and nums2 of size n (sorted). Merge nums2 into nums1 in-place so the result is sorted.",
    },
    defaultInput: [1, 2, 3, 0, 0, 0],
    inputKind: "integer",
    inputLabel: { vi: "nums1 (gồm cả chỗ trống)", en: "nums1 (including placeholders)" },
    extraParams: [
      { key: "nums2", type: "string", label: { vi: "nums2 (phẩy ngăn cách)", en: "nums2 (comma separated)" }, default: "2,5,6" },
      { key: "m", type: "number", label: { vi: "m (phần tử thực của nums1)", en: "m (real elements in nums1)" }, default: 3 },
      { key: "n", type: "number", label: { vi: "n (phần tử của nums2)", en: "n (elements in nums2)" }, default: 3 },
    ],
    complexity: {
      time: "O(m+n)",
      space: "O(1)",
      note: {
        vi: "Ba con trỏ duyệt tổng m+n lần. Gộp tại chỗ nên O(1) bộ nhớ phụ.",
        en: "Three pointers traverse m+n times total. In-place merge uses O(1) extra memory.",
      },
    },
    code: [
      "class Solution:",
      "    def merge(self, nums1, m, nums2, n):",
      "        p1 = m - 1",
      "        p2 = n - 1",
      "        write = m + n - 1",
      "        while p1 >= 0 and p2 >= 0:",
      "            if nums1[p1] > nums2[p2]:",
      "                nums1[write] = nums1[p1]",
      "                p1 -= 1",
      "            else:",
      "                nums1[write] = nums2[p2]",
      "                p2 -= 1",
      "            write -= 1",
      "        nums1[:p2+1] = nums2[:p2+1]",
    ],
    builder: buildSteps88,
  },
  977: {
    id: 977,
    difficulty: "easy",
    slug: "squares-of-a-sorted-array",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    title: { vi: "Squares of a Sorted Array", en: "Squares of a Sorted Array" },
    titleVi: { vi: "Bình phương của mảng đã sắp xếp", en: "Squares of a sorted array" },
    statement: {
      vi: "Cho mảng số nguyên nums đã sắp xếp tăng dần. Trả về mảng bình phương các phần tử, cũng sắp xếp tăng dần.",
      en: "Given an integer array nums sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.",
    },
    defaultInput: [-4, -1, 0, 3, 10],
    inputKind: "integer",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Hai con trỏ duyệt mảng một lần O(n). Mảng kết quả O(n).",
        en: "Two pointers traverse once O(n). Result array O(n).",
      },
    },
    code: [
      "class Solution:",
      "    def sortedSquares(self, nums):",
      "        n = len(nums)",
      "        result = [0] * n",
      "        left, right, pos = 0, n-1, n-1",
      "        while left <= right:",
      "            if abs(nums[left]) > abs(nums[right]):",
      "                result[pos] = nums[left] ** 2",
      "                left += 1",
      "            else:",
      "                result[pos] = nums[right] ** 2",
      "                right -= 1",
      "            pos -= 1",
      "        return result",
    ],
    builder: buildSteps977,
  },
  1295: {
    id: 1295,
    difficulty: "easy",
    slug: "find-numbers-with-even-number-of-digits",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Find Numbers with Even Number of Digits", en: "Find Numbers with Even Number of Digits" },
    titleVi: { vi: "Đếm số có chữ số chẵn", en: "Count numbers with even digit count" },
    statement: {
      vi: "Cho mảng nums chứa các số nguyên. Trả về số lượng phần tử có số lượng chữ số chẵn.",
      en: "Given an array nums of integers, return how many of them contain an even number of digits.",
    },
    defaultInput: [12, 345, 2, 6, 7896],
    inputKind: "nonneg",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần, đếm chữ số bằng log hoặc chuỗi O(1). Tổng O(n).",
        en: "Single pass, digit count via log or string is O(1). Total O(n).",
      },
    },
    code: [
      "class Solution:",
      "    def findNumbers(self, nums):",
      "        count = 0",
      "        for num in nums:",
      "            if len(str(num)) % 2 == 0:",
      "                count += 1",
      "        return count",
    ],
    builder: buildSteps1295,
  },
  676: {
    id: 676,
    difficulty: "medium",
    slug: "implement-magic-dictionary",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    title: { vi: "Implement Magic Dictionary", en: "Implement Magic Dictionary" },
    titleVi: { vi: "Từ điển ma thuật (Trie + DFS)", en: "Magic dictionary via Trie" },
    statement: {
      vi: "Xây một Trie từ danh sách từ. search(word) trả về True nếu có từ trong Trie khác word đúng 1 ký tự.",
      en: "Build a Trie from a word list. search(word) returns True if there's a word in the Trie that differs from word in exactly one character.",
    },
    defaultInput: "hello,hallo",
    inputKind: "string",
    inputLabel: { vi: "Từ điển (phẩy ngăn cách)", en: "Dictionary words (comma separated)" },
    extraParams: [{ key: "search", type: "string", label: { vi: "Từ cần tìm (phẩy ngăn cách)", en: "Words to search (comma separated)" }, default: "hello,hhllo" }],
    complexity: { time: "O(N·L²)", space: "O(N·L)", note: { vi: "Mỗi search duyệt Trie sâu L, thử thay 1 ký tự nên O(26·L) = O(L²). Bộ nhớ O(N·L) cho Trie.", en: "Each search traverses depth L, trying one swap → O(26·L). Memory O(N·L) for the Trie." } },
    code: ["class MagicDictionary:", "    def __init__(self):", "        self.root = {}", "    def buildDict(self, words):", "        for w in words:", "            node = self.root", "            for ch in w:", "                node = node.setdefault(ch, {})", "            node['$'] = True", "    def search(self, word):", "        def dfs(node, i, misses):", "            if i == len(word):", "                return '$' in node and misses == 1", "            for ch in node:", "                if ch == '$': continue", "                dfs(node[ch], i+1, misses+(ch!=word[i]))", "            return False", "        return dfs(self.root, 0, 0)"],
    builder: buildSteps676,
  },
  1268: {
    id: 1268,
    difficulty: "medium",
    slug: "search-suggestions-system",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    title: { vi: "Search Suggestions System", en: "Search Suggestions System" },
    titleVi: { vi: "Gợi ý tìm kiếm (Trie)", en: "Search suggestions via Trie" },
    statement: {
      vi: "Cho danh sách sản phẩm và searchWord. Sau mỗi ký tự gõ, trả về tối đa 3 sản phẩm có tiền tố khớp (theo thứ tự từ điển).",
      en: "Given a list of products and a searchWord, after each character typed, return up to 3 product suggestions that share the prefix (lexicographic order).",
    },
    defaultInput: "mobile,mouse,moneypot,monitor,mousepad",
    inputKind: "string",
    inputLabel: { vi: "Sản phẩm (phẩy ngăn cách)", en: "Products (comma separated)" },
    extraParams: [{ key: "searchWord", type: "string", label: { vi: "searchWord", en: "searchWord" }, default: "mouse" }],
    complexity: { time: "O(M + n·L)", space: "O(M)", note: { vi: "Xây Trie O(M) tổng ký tự sản phẩm. Mỗi ký tự gõ, DFS lấy ≤3 từ O(3·L).", en: "Build Trie O(M) total product chars. Per typed char, DFS collects ≤3 words in O(3·L)." } },
    code: ["class Solution:", "    def suggestedProducts(self, products, searchWord):", "        products.sort()", "        root = {}", "        for w in products:", "            node = root", "            for ch in w:", "                node = node.setdefault(ch, {})", "            node['$'] = True", "        res = []", "        node, prefix = root, ''", "        for ch in searchWord:", "            prefix += ch", "            node = node.get(ch)", "            if not node: break", "            sugg = []; dfs(node, prefix, sugg)", "            res.append(sugg[:3])", "        return res"],
    builder: buildSteps1268,
  },
  1166: {
    id: 1166,
    difficulty: "medium",
    slug: "design-file-system",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    title: { vi: "Design File System", en: "Design File System" },
    titleVi: { vi: "Thiết kế hệ thống file (Trie đường dẫn)", en: "File system via path Trie" },
    statement: {
      vi: "createPath(path, value) tạo đường dẫn mới (cha phải tồn tại). get(path) trả về value hoặc -1.",
      en: "createPath(path, value) creates a new path (parent must exist). get(path) returns the value or -1.",
    },
    defaultInput: 'create(/leet,1);create(/leet/code,2);get(/leet/code);get(/leet/missing)',
    inputKind: "string",
    inputLabel: { vi: "Các lệnh (;ngăn cách)", en: "Operations (semicolon separated)" },
    extraParams: [],
    complexity: { time: "O(L)", space: "O(N·L)", note: { vi: "Mỗi thao tác O(L) theo độ dài đường dẫn. Bộ nhớ O(N·L).", en: "Each operation is O(L) by path length. Memory O(N·L)." } },
    code: ["class FileSystem:", "    def __init__(self):", "        self.root = {}", "    def createPath(self, path, value):", "        parts = path.split('/')[1:]", "        node = self.root", "        for p in parts[:-1]:", "            if p not in node: return False", "            node = node[p]", "        if parts[-1] in node: return False", "        node[parts[-1]] = {'$val': value}", "        return True", "    def get(self, path):", "        node = self.root", "        for p in path.split('/')[1:]:", "            if p not in node: return -1", "            node = node[p]", "        return node.get('$val', -1)"],
    builder: buildSteps1166,
  },
  588: {
    id: 588,
    difficulty: "hard",
    slug: "design-in-memory-file-system",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    title: { vi: "Design In-Memory File System", en: "Design In-Memory File System" },
    titleVi: { vi: "Hệ thống file trong bộ nhớ (Trie)", en: "In-memory file system via Trie" },
    statement: {
      vi: "Hỗ trợ: ls(path), mkdir(path), addContentToFile(path, content), readContentFromFile(path).",
      en: "Support: ls(path), mkdir(path), addContentToFile(path, content), readContentFromFile(path).",
    },
    defaultInput: 'mkdir(/a/b/c);add(/a/b/c/d,"hello");read(/a/b/c/d);ls(/a/b/c)',
    inputKind: "string",
    inputLabel: { vi: "Các lệnh (;ngăn cách)", en: "Operations (semicolon separated)" },
    extraParams: [],
    complexity: { time: "O(L)", space: "O(N·L+C)", note: { vi: "Mỗi thao tác O(L). Bộ nhớ O(N·L + tổng nội dung file).", en: "Each operation O(L). Memory O(N·L + total file content)." } },
    code: [
      "class TrieNode:",
      "    def __init__(self):",
      "        self.children = {}",
      "        self.content = None  # None = directory, str = file",
      "",
      "class FileSystem:",
      "    def __init__(self):",
      "        self.root = TrieNode()",
      "",
      "    def ls(self, path):",
      "        node = self._navigate(path)",
      "        if node.content is not None:",
      "            return [path.split('/')[-1]]",
      "        return sorted(node.children.keys())",
      "",
      "    def mkdir(self, path):",
      "        self._navigate(path, create=True)",
      "",
      "    def addContentToFile(self, path, content):",
      "        node = self._navigate(path, create=True)",
      "        if node.content is None:",
      "            node.content = ''",
      "        node.content += content",
      "",
      "    def readContentFromFile(self, path):",
      "        node = self._navigate(path)",
      "        return node.content",
      "",
      "    def _navigate(self, path, create=False):",
      "        node = self.root",
      "        for part in path.split('/')[1:]:",
      "            if not part:",
      "                continue",
      "            if part not in node.children:",
      "                if not create:",
      "                    return None",
      "                node.children[part] = TrieNode()",
      "            node = node.children[part]",
      "        return node",
    ],
    builder: buildSteps588,
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
  3020: {
    id: 3020,
    difficulty: "medium",
    slug: "find-the-maximum-number-of-elements-in-subset",
    category: { key: "hashmap", vi: "Bảng băm (Hash Map)", en: "Hash Map" },
    title: { vi: "Find the Maximum Number of Elements in a Subset", en: "Find the Maximum Number of Elements in a Subset" },
    titleVi: { vi: "Số phần tử lớn nhất trong tập con theo mẫu lũy thừa", en: "Largest subset following the power pattern" },
    statement: {
      vi:
        "Cho mảng số nguyên dương nums. Chọn một tập con và xếp thành mảng theo mẫu " +
        "[x, x², x⁴, …, x^(k/2), x^k, x^(k/2), …, x⁴, x², x] (k là lũy thừa của 2). " +
        "Trả về số phần tử lớn nhất của một tập con như vậy.",
      en:
        "You are given an array of positive integers nums. Select a subset that can be placed in an array following the pattern " +
        "[x, x², x⁴, …, x^(k/2), x^k, x^(k/2), …, x⁴, x², x] (k is a power of 2). " +
        "Return the maximum number of elements in such a subset.",
    },
    defaultInput: [5, 4, 1, 2, 2],
    inputKind: "positive", // số nguyên dương
    extraParams: [],
    complexity: {
      time: "O(n log(max))",
      space: "O(n)",
      note: {
        vi: "Với mỗi cơ số, chuỗi lũy thừa dài tối đa O(log(max)) mức; tổng cộng O(n log(max)). Bảng tần suất tốn O(n) bộ nhớ.",
        en: "For each base, the power chain has at most O(log(max)) levels; overall O(n log(max)). The frequency map uses O(n) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def maximumLength(self, nums):",
      "        freq = Counter(nums)",
      "        ans = 1",
      "        for x in set(nums):",
      "            if x == 1:",
      "                cnt = freq[1]",
      "                ans = max(ans, cnt - (cnt % 2 == 0))",
      "                continue",
      "            cnt = 0",
      "            cur = x",
      "            while freq[cur] >= 2:",
      "                cnt += 2",
      "                cur = cur * cur",
      "            cnt += 1 if freq[cur] >= 1 else -1",
      "            ans = max(ans, cnt)",
      "        return ans",
    ],
    builder: buildSteps3020,
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
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt mảng một lần bằng thuật toán Kadane nên O(n) thời gian. Chỉ dùng vài biến nên O(1) bộ nhớ.",
        en: "A single pass with Kadane's algorithm gives O(n) time. Only a few variables are used, so O(1) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def maxSubArray(self, nums):",
      "        cur = nums[0]",
      "        best = nums[0]",
      "        for i in range(1, len(nums)):",
      "            cur = max(nums[i], cur + nums[i])",
      "            best = max(best, cur)",
      "        return best",
    ],
    builder: buildSteps53,
  },
  208: {
    id: 208,
    difficulty: "medium",
    slug: "implement-trie-prefix-tree",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    title: { vi: "Implement Trie (Prefix Tree)", en: "Implement Trie (Prefix Tree)" },
    titleVi: { vi: "Cài đặt Trie (cây tiền tố)", en: "Implement a prefix tree" },
    statement: {
      vi:
        "Cài đặt Trie với các thao tác: insert(word) chèn một từ; " +
        "search(word) trả về True nếu từ đã được chèn; " +
        "startsWith(prefix) trả về True nếu có từ nào bắt đầu bằng tiền tố. " +
        "Nhập danh sách từ cần chèn (cách nhau bởi dấu phẩy), một từ để search và một tiền tố để startsWith.",
      en:
        "Implement a Trie with: insert(word) inserts a word; " +
        "search(word) returns True if the word was inserted; " +
        "startsWith(prefix) returns True if any inserted word starts with the prefix. " +
        "Enter the words to insert (comma separated), a word to search, and a prefix to test.",
    },
    defaultInput: "apple,apply,app",
    inputKind: "string",
    inputLabel: { vi: "Các từ chèn (cách nhau bởi dấu phẩy)", en: "Words to insert (comma separated)" },
    extraParams: [
      {
        key: "search",
        type: "string",
        label: { vi: "search(word)", en: "search(word)" },
        default: "app",
      },
      {
        key: "prefix",
        type: "string",
        label: { vi: "startsWith(prefix)", en: "startsWith(prefix)" },
        default: "appl",
      },
    ],
    complexity: {
      time: "O(L)",
      space: "O(N·L)",
      note: {
        vi: "Mỗi thao tác (insert/search/startsWith) duyệt qua tối đa L ký tự nên O(L). Bộ nhớ tối đa O(N·L) với N từ, mỗi từ dài tối đa L.",
        en: "Each operation (insert/search/startsWith) walks at most L characters, so O(L). Memory is at most O(N·L) for N words of length up to L.",
      },
    },
    code: [
      "class TrieNode:",
      "    def __init__(self):",
      "        self.children = {}",
      "        self.is_word = False",
      "",
      "class Trie:",
      "    def __init__(self):",
      "        self.root = TrieNode()",
      "",
      "    def insert(self, word):",
      "        node = self.root",
      "        for ch in word:",
      "            if ch not in node.children:",
      "                node.children[ch] = TrieNode()",
      "            node = node.children[ch]",
      "        node.is_word = True",
      "",
      "    def search(self, word):",
      "        node = self.root",
      "        for ch in word:",
      "            if ch not in node.children:",
      "                return False",
      "            node = node.children[ch]",
      "        return node.is_word",
      "",
      "    def startsWith(self, prefix):",
      "        node = self.root",
      "        for ch in prefix:",
      "            if ch not in node.children:",
      "                return False",
      "            node = node.children[ch]",
      "        return True",
    ],
    builder: buildSteps208,
  },
  1804: {
    id: 1804,
    difficulty: "medium",
    slug: "implement-trie-ii-prefix-tree",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    title: { vi: "Implement Trie II (Prefix Tree)", en: "Implement Trie II (Prefix Tree)" },
    titleVi: { vi: "Cài đặt Trie II (cây tiền tố)", en: "Implement Trie II" },
    statement: {
      vi:
        "Cài đặt Trie II với các thao tác: insert(word) chèn một từ; " +
        "countWordsEqualTo(word) trả về số lần từ đó được chèn; " +
        "countWordsStartingWith(prefix) trả về số từ có tiền tố đó; " +
        "erase(word) xóa 1 bản của từ đó khỏi Trie. " +
        "Mỗi nút lưu prefixCount (số từ đi qua) và wordCount (số từ kết thúc tại đây).",
      en:
        "Implement a Trie II with: insert(word) inserts a word; " +
        "countWordsEqualTo(word) returns how many times that word was inserted; " +
        "countWordsStartingWith(prefix) returns the number of words with that prefix; " +
        "erase(word) removes one copy of the word from the Trie. " +
        "Each node stores prefixCount (words passing through) and wordCount (words ending here).",
    },
    defaultInput: "apple,apple,app,apply",
    inputKind: "string",
    inputLabel: { vi: "Các từ chèn (cách nhau bởi dấu phẩy)", en: "Words to insert (comma separated)" },
    extraParams: [
      {
        key: "countWord",
        type: "string",
        label: { vi: "countWordsEqualTo(word)", en: "countWordsEqualTo(word)" },
        default: "apple",
      },
      {
        key: "countPrefix",
        type: "string",
        label: { vi: "countWordsStartingWith(prefix)", en: "countWordsStartingWith(prefix)" },
        default: "app",
      },
      {
        key: "erase",
        type: "string",
        label: { vi: "erase(word)", en: "erase(word)" },
        default: "apple",
      },
    ],
    complexity: {
      time: "O(L)",
      space: "O(N·L)",
      note: {
        vi: "Mỗi thao tác duyệt tối đa L ký tự → O(L). Bộ nhớ O(N·L) cho N từ dài tối đa L.",
        en: "Each operation traverses at most L characters → O(L). Memory O(N·L) for N words of length up to L.",
      },
    },
    code: [
      "class TrieNode:",
      "    def __init__(self):",
      "        self.children = {}",
      "        self.prefix_count = 0",
      "        self.word_count = 0",
      "",
      "class Trie:",
      "    def __init__(self):",
      "        self.root = TrieNode()",
      "    def insert(self, word):",
      "        node = self.root",
      "        for ch in word:",
      "            if ch not in node.children:",
      "                node.children[ch] = TrieNode()",
      "            node = node.children[ch]",
      "            node.prefix_count += 1",
      "        node.word_count += 1",
      "    def countWordsEqualTo(self, word):",
      "        node = self.root",
      "        for ch in word:",
      "            if ch not in node.children:",
      "                return 0",
      "            node = node.children[ch]",
      "        return node.word_count",
      "    def countWordsStartingWith(self, prefix):",
      "        node = self.root",
      "        for ch in prefix:",
      "            if ch not in node.children:",
      "                return 0",
      "            node = node.children[ch]",
      "        return node.prefix_count",
      "    def erase(self, word):",
      "        node = self.root",
      "        for ch in word:",
      "            node = node.children[ch]",
      "            node.prefix_count -= 1",
      "        node.word_count -= 1",
    ],
    builder: buildSteps1804,
  },
  211: {
    id: 211,
    difficulty: "medium",
    slug: "design-add-and-search-words-data-structure",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    title: { vi: "Design Add and Search Words Data Structure", en: "Design Add and Search Words Data Structure" },
    titleVi: { vi: "Thiết kế cấu trúc thêm và tìm từ", en: "Add and search words data structure" },
    statement: {
      vi:
        "Thiết kế cấu trúc dữ liệu hỗ trợ: addWord(word) thêm một từ; " +
        "search(word) tìm từ, trong đó '.' khớp với bất kỳ ký tự nào. " +
        "Nhập danh sách từ cần thêm (cách nhau bởi dấu phẩy), và một pattern để search (có thể chứa '.').",
      en:
        "Design a data structure that supports: addWord(word) adds a word; " +
        "search(word) searches for a word where '.' can match any single character. " +
        "Enter words to add (comma separated), and a pattern to search (may contain '.').",
    },
    defaultInput: "bad,dad,mad",
    inputKind: "string",
    inputLabel: { vi: "Các từ thêm (cách nhau bởi dấu phẩy)", en: "Words to add (comma separated)" },
    extraParams: [
      {
        key: "search",
        type: "string",
        label: { vi: "search(pattern) - dùng '.' cho ký tự bất kỳ", en: "search(pattern) - use '.' for any char" },
        default: ".ad",
      },
    ],
    complexity: {
      time: "O(L) add / O(26^dots · L) search",
      space: "O(N·L)",
      note: {
        vi: "addWord là O(L). search tệ nhất khi có nhiều '.': mỗi '.' phân nhánh tối đa 26 con → O(26^d · L) với d là số dấu '.'. Bộ nhớ O(N·L).",
        en: "addWord is O(L). search worst case with dots: each '.' branches up to 26 children → O(26^d · L) where d is the number of dots. Memory O(N·L).",
      },
    },
    code: [
      "class TrieNode:",
      "    def __init__(self):",
      "        self.children = {}",
      "        self.is_word = False",
      "",
      "class WordDictionary:",
      "    def __init__(self):",
      "        self.root = TrieNode()",
      "",
      "    def addWord(self, word):",
      "        node = self.root",
      "        for ch in word:",
      "            if ch not in node.children:",
      "                node.children[ch] = TrieNode()",
      "            node = node.children[ch]",
      "        node.is_word = True",
      "",
      "    def search(self, word):",
      "        def dfs(node, i):",
      "            if i == len(word):",
      "                return node.is_word",
      "            if word[i] == '.':",
      "                for child in node.children.values():",
      "                    if dfs(child, i + 1):",
      "                        return True",
      "                return False",
      "            if word[i] not in node.children:",
      "                return False",
      "            return dfs(node.children[word[i]], i+1)",
      "        return dfs(self.root, 0)",
    ],
    builder: buildSteps211,
  },
  648: {
    id: 648,
    difficulty: "medium",
    slug: "replace-words",
    category: { key: "trie", vi: "Cây tiền tố (Trie)", en: "Trie" },
    title: { vi: "Replace Words", en: "Replace Words" },
    titleVi: { vi: "Thay thế từ bằng gốc từ", en: "Replace words with roots" },
    statement: {
      vi:
        "Cho danh sách gốc từ (dictionary) và một câu. Thay thế mỗi từ trong câu bằng gốc từ ngắn nhất là tiền tố của nó. " +
        "Nếu một từ có nhiều gốc là tiền tố, dùng gốc ngắn nhất. Nếu không có gốc nào, giữ nguyên từ.",
      en:
        "Given a dictionary of roots and a sentence. Replace each word in the sentence with the shortest root that is a prefix of it. " +
        "If a word has multiple roots as prefixes, use the shortest one. If no root applies, keep the word unchanged.",
    },
    defaultInput: "cat,bat,rat",
    inputKind: "string",
    inputLabel: { vi: "Danh sách gốc từ (cách nhau bởi dấu phẩy)", en: "Dictionary roots (comma separated)" },
    extraParams: [
      {
        key: "sentence",
        type: "string",
        label: { vi: "Câu cần thay thế", en: "Sentence to process" },
        default: "the cattle was rattled by the battery",
      },
    ],
    complexity: {
      time: "O(N·L + S·L)",
      space: "O(N·L)",
      note: {
        vi: "Xây Trie từ N gốc từ dài tối đa L: O(N·L). Duyệt S từ trong câu, mỗi từ tra Trie tối đa L bước: O(S·L). Bộ nhớ Trie: O(N·L).",
        en: "Build Trie from N roots of max length L: O(N·L). Process S words in sentence, each Trie lookup at most L steps: O(S·L). Trie memory: O(N·L).",
      },
    },
    code: [
      "class TrieNode:",
      "    def __init__(self):",
      "        self.children = {}",
      "        self.is_root = False",
      "        self.word = ''",
      "",
      "class Solution:",
      "    def replaceWords(self, dictionary, sentence):",
      "        root = TrieNode()",
      "        # Build Trie from dictionary",
      "        for w in dictionary:",
      "            node = root",
      "            for ch in w:",
      "                if ch not in node.children:",
      "                    node.children[ch] = TrieNode()",
      "                node = node.children[ch]",
      "            node.is_root = True",
      "            node.word = w",
      "        # Replace each word",
      "        result = []",
      "        for word in sentence.split():",
      "            node = root",
      "            for ch in word:",
      "                if node.is_root:",
      "                    break",
      "                if ch not in node.children:",
      "                    break",
      "                node = node.children[ch]",
      "            result.append(node.word if node.is_root else word)",
      "        return ' '.join(result)",
    ],
    builder: buildSteps648,
  },
  1208: {
    id: 1208,
    difficulty: "medium",
    slug: "get-equal-substrings-within-budget",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Get Equal Substrings Within Budget", en: "Get Equal Substrings Within Budget" },
    titleVi: { vi: "Đoạn con bằng nhau trong ngân sách", en: "Equal substring within budget" },
    statement: {
      vi:
        "Cho hai chuỗi s và t cùng độ dài. Chi phí đổi s[i] thành t[i] là |ASCII(s[i]) - ASCII(t[i])|. " +
        "Cho ngân sách maxCost, trả về độ dài lớn nhất của một đoạn con của s có thể đổi thành đoạn con tương ứng của t với tổng chi phí ≤ maxCost.",
      en:
        "You are given two equal-length strings s and t. The cost of changing s[i] to t[i] is |ASCII(s[i]) - ASCII(t[i])|. " +
        "Given a budget maxCost, return the maximum length of a substring of s that can be changed into the corresponding substring of t with total cost ≤ maxCost.",
    },
    defaultInput: "abcd",
    inputKind: "string",
    inputLabel: { vi: "Chuỗi s", en: "String s" },
    extraParams: [
      {
        key: "t",
        type: "string",
        label: { vi: "Chuỗi t (cùng độ dài s)", en: "String t (same length as s)" },
        default: "bcdf",
      },
      {
        key: "maxCost",
        type: "number",
        label: { vi: "maxCost (ngân sách)", en: "maxCost (budget)" },
        default: 3,
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Mỗi chỉ số left và right chỉ duyệt qua chuỗi một lần (cửa sổ trượt) nên O(n) thời gian. Mảng cost dài n nên O(n) bộ nhớ.",
        en: "Both left and right pointers traverse the string once (sliding window), so O(n) time. The cost array of length n is O(n) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def equalSubstring(self, s, t, maxCost):",
      "        cost = [abs(ord(a) - ord(b)) for a, b in zip(s, t)]",
      "        left = 0",
      "        window = 0",
      "        max_len = 0",
      "        for right in range(len(s)):",
      "            window += cost[right]",
      "            while window > maxCost:",
      "                window -= cost[left]",
      "                left += 1",
      "            max_len = max(max_len, right - left + 1)",
      "        return max_len",
    ],
    builder: buildSteps1208,
  },
  1846: {
    id: 1846,
    difficulty: "medium",
    slug: "maximum-element-after-decreasing-and-rearranging",
    category: { key: "greedy", vi: "Tham lam & Sắp xếp", en: "Greedy & Sorting" },
    title: {
      vi: "Maximum Element After Decreasing and Rearranging",
      en: "Maximum Element After Decreasing and Rearranging",
    },
    titleVi: { vi: "Giá trị lớn nhất sau khi giảm và sắp xếp lại", en: "Maximum value after decreasing and rearranging" },
    statement: {
      vi:
        "Cho mảng số nguyên dương arr. " +
        "Bạn được phép: (1) giảm bất kỳ phần tử nào về một số nguyên dương nhỏ hơn; " +
        "(2) sắp xếp lại mảng tùy ý. " +
        "Sao cho arr[0] = 1 và |arr[i] - arr[i-1]| ≤ 1 với mọi i. " +
        "Trả về giá trị lớn nhất có thể của một phần tử trong mảng sau khi thực hiện.",
      en:
        "You are given an array of positive integers arr. " +
        "Perform some operations (possibly none) on arr so that it satisfies these conditions: " +
        "(1) The value of the first element in arr must be 1. " +
        "(2) The absolute difference between any 2 adjacent elements must be less than or equal to 1, " +
        "i.e. abs(arr[i] - arr[i-1]) <= 1 for each i where 1 <= i < arr.length (0-indexed). " +
        "There are 2 types of operations you can perform any number of times: " +
        "decrease the value of any element of arr to a smaller positive integer; " +
        "rearrange the elements of arr in any order. " +
        "Return the maximum possible value of an element in arr after performing the operations to satisfy the conditions.",
    },
    defaultInput: [2, 2, 1, 2, 1],
    inputKind: "positive", // các số nguyên dương
    extraParams: [],
    complexity: {
      time: "O(n log n)",
      space: "O(1)",
      note: {
        vi: "Chi phí chính là sắp xếp O(n log n); vòng lặp gán chỉ O(n). Sắp xếp tại chỗ nên không tốn thêm bộ nhớ đáng kể.",
        en: "Sorting dominates at O(n log n); the assignment loop is only O(n). Sorting is in-place, so no significant extra memory.",
      },
    },
    code: [
      "class Solution:",
      "    def maximumElementAfterDecrementingAndRearranging(self, arr):",
      "        arr.sort()",
      "        arr[0] = 1",
      "        for i in range(1, len(arr)):",
      "            arr[i] = min(arr[i], arr[i - 1] + 1)",
      "        return arr[-1]",
    ],
    builder: buildSteps1846,
  },
  1004: {
    id: 1004,
    difficulty: "medium",
    slug: "max-consecutive-ones-iii",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Max Consecutive Ones III", en: "Max Consecutive Ones III" },
    titleVi: { vi: "Dãy số 1 liên tiếp dài nhất III", en: "Longest run of consecutive ones III" },
    statement: {
      vi: "Cho mảng nhị phân nums và số nguyên k. Trả về số lượng số 1 liên tiếp lớn nhất có thể có nếu bạn được phép lật tối đa k số 0 thành 1.",
      en: "Given a binary array nums and an integer k, return the maximum number of consecutive 1's in the array if you can flip at most k 0's.",
    },
    defaultInput: [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0],
    inputKind: "binary", // chỉ gồm 0 và 1
    extraParams: [
      {
        key: "k",
        label: { vi: "k (số 0 được phép lật)", en: "k (zeros you may flip)" },
        default: 2,
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Mỗi chỉ số i và j chỉ duyệt qua mảng đúng một lần (cửa sổ trượt), nên O(n). Chỉ dùng vài biến đếm nên bộ nhớ O(1).",
        en: "Both pointers i and j traverse the array once (sliding window), so O(n). Only a few counters are used, so O(1) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def longestOnes(self, nums, k):",
      "        i = 0",
      "        max_length = 0",
      "        zero_count = 0",
      "        for j in range(len(nums)):",
      "            if nums[j] == 0:",
      "                zero_count += 1",
      "                while zero_count > k:",
      "                    if nums[i] == 0:",
      "                        zero_count -= 1",
      "                    i += 1",
      "            max_length = max(max_length, j - i + 1)",
      "        return max_length",
    ],
    builder: buildSteps1004,
  },
  746: {
    id: 746,
    difficulty: "easy",
    slug: "min-cost-climbing-stairs",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    title: { vi: "Min Cost Climbing Stairs", en: "Min Cost Climbing Stairs" },
    titleVi: { vi: "Chi phí leo cầu thang nhỏ nhất", en: "Minimum cost to climb stairs" },
    statement: {
      vi: "Cho mảng số nguyên cost, trong đó cost[i] là chi phí của bậc thứ i trên cầu thang. Sau khi trả phí, bạn có thể leo lên 1 hoặc 2 bậc. Bạn được bắt đầu từ bậc 0 hoặc bậc 1. Trả về chi phí nhỏ nhất để lên tới đỉnh cầu thang.",
      en: "You are given an integer array cost where cost[i] is the cost of the i-th step on a staircase. Once you pay the cost, you can climb either 1 or 2 steps. You can start from step 0 or step 1. Return the minimum cost to reach the top of the floor.",
    },
    defaultInput: [1, 100, 1, 1, 1, 100, 1, 1, 100, 1],
    inputKind: "nonneg", // số nguyên không âm
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Duyệt mảng một lần để điền bảng dp nên O(n) thời gian. Bảng dp dài n+1 nên O(n) bộ nhớ (có thể tối ưu xuống O(1) bằng 2 biến).",
        en: "A single pass fills the dp table, so O(n) time. The dp table has n+1 cells, so O(n) memory (optimizable to O(1) with two variables).",
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
    inputKind: "positive", // n là số nguyên dương
    inputLabel: { vi: "n (số bậc thang)", en: "n (number of steps)" },
    singleInput: true,
    maxInput: 45,
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Điền bảng dp từ 2 đến n nên O(n) thời gian. Bảng dp dài n+1 nên O(n) bộ nhớ (có thể tối ưu xuống O(1) bằng 2 biến).",
        en: "Filling the dp table from 2 to n is O(n) time. The dp table has n+1 cells, so O(n) memory (optimizable to O(1) with two variables).",
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
    inputKind: "nonneg", // n >= 0
    inputLabel: { vi: "n", en: "n" },
    singleInput: true,
    maxInput: 30,
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Điền bảng dp từ 2 đến n nên O(n) thời gian. Bảng dp dài n+1 nên O(n) bộ nhớ (có thể tối ưu xuống O(1) bằng 2 biến).",
        en: "Filling the dp table from 2 to n is O(n) time. The dp table has n+1 cells, so O(n) memory (optimizable to O(1) with two variables).",
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
    builder: buildSteps509,
  },
  1: {
    id: 1,
    difficulty: "easy",
    slug: "two-sum",
    category: { key: "hashmap", vi: "Bảng băm (Hash Map)", en: "Hash Map" },
    title: { vi: "Two Sum", en: "Two Sum" },
    titleVi: { vi: "Tổng hai số", en: "Two sum" },
    statement: {
      vi: "Cho mảng số nguyên nums và một số nguyên target, trả về chỉ số của hai số sao cho tổng của chúng bằng target. Mỗi đầu vào có đúng một đáp án và không dùng cùng một phần tử hai lần.",
      en: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Each input has exactly one solution, and you may not use the same element twice.",
    },
    defaultInput: [2, 7, 11, 15],
    inputKind: "integer", // cho phép số âm
    extraParams: [
      {
        key: "target",
        label: { vi: "target (tổng cần tìm)", en: "target (target sum)" },
        default: 9,
        allowNegative: true,
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Duyệt mảng một lần, mỗi lần tra cứu/chèn hash map là O(1) trung bình nên O(n) thời gian. Hash map lưu tối đa n phần tử nên O(n) bộ nhớ.",
        en: "A single pass with O(1) average hash-map lookups/inserts gives O(n) time. The hash map holds up to n entries, so O(n) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def twoSum(self, nums, target):",
      "        d = {}",
      "        for i in range(len(nums)):",
      "            if target - nums[i] in d:",
      "                return [i, d[target - nums[i]]]",
      "            d[nums[i]] = i",
    ],
    builder: buildSteps1,
  },
  13: {
    id: 13,
    difficulty: "easy",
    slug: "roman-to-integer",
    category: { key: "math", vi: "Toán / Đệ quy", en: "Math / Recursion" },
    title: { vi: "Roman to Integer", en: "Roman to Integer" },
    titleVi: { vi: "Chuyển số La Mã sang số nguyên", en: "Roman numeral to integer" },
    statement: {
      vi:
        "Cho một chuỗi số La Mã, chuyển thành số nguyên. " +
        "Quy tắc: I=1, V=5, X=10, L=50, C=100, D=500, M=1000. " +
        "Nếu ký tự nhỏ hơn đứng trước ký tự lớn hơn (VD: IV=4, IX=9), ta trừ thay vì cộng.",
      en:
        "Given a Roman numeral string, convert it to an integer. " +
        "Rules: I=1, V=5, X=10, L=50, C=100, D=500, M=1000. " +
        "If a smaller value precedes a larger value (e.g. IV=4, IX=9), subtract instead of add.",
    },
    defaultInput: "MCMXCIV",
    inputKind: "string",
    inputLabel: { vi: "Số La Mã (VD: MCMXCIV)", en: "Roman numeral (e.g. MCMXCIV)" },
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt chuỗi một lần từ trái sang phải, mỗi ký tự xử lý O(1) → O(n). Chỉ dùng vài biến phụ → O(1) bộ nhớ.",
        en: "Single pass left to right, each character processed in O(1) → O(n) time. Only a few variables used → O(1) space.",
      },
    },
    code: [
      "class Solution:",
      "    def romanToInt(self, s: str) -> int:",
      "        roman = {'I':1,'V':5,'X':10,'L':50,",
      "                 'C':100,'D':500,'M':1000}",
      "        result = 0",
      "        for i in range(len(s)):",
      "            if i+1 < len(s) and roman[s[i]] < roman[s[i+1]]:",
      "                result -= roman[s[i]]",
      "            else:",
      "                result += roman[s[i]]",
      "        return result",
    ],
    builder: buildSteps13,
  },
  205: {
    id: 205,
    difficulty: "easy",
    slug: "isomorphic-strings",
    category: { key: "hashmap", vi: "Bảng băm (Hash Map)", en: "Hash Map" },
    title: { vi: "Isomorphic Strings", en: "Isomorphic Strings" },
    titleVi: { vi: "Chuỗi đẳng cấu", en: "Isomorphic strings" },
    statement: {
      vi:
        "Cho hai chuỗi s và t, xác định xem chúng có đẳng cấu không. " +
        "Hai chuỗi đẳng cấu nếu mỗi ký tự trong s có thể được ánh xạ 1-1 sang ký tự trong t (giữ nguyên thứ tự). " +
        "Không có hai ký tự khác nhau ánh xạ sang cùng một ký tự, và ngược lại.",
      en:
        "Given two strings s and t, determine if they are isomorphic. " +
        "Two strings are isomorphic if each character in s can be mapped one-to-one to a character in t (preserving order). " +
        "No two different characters may map to the same character, and vice versa.",
    },
    defaultInput: "egg",
    inputKind: "string",
    inputLabel: { vi: "Chuỗi s", en: "String s" },
    extraParams: [
      {
        key: "t",
        type: "string",
        label: { vi: "Chuỗi t", en: "String t" },
        default: "add",
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Duyệt chuỗi một lần O(n). Bảng ánh xạ tối đa 256 ký tự ASCII → O(1) bộ nhớ.",
        en: "Single pass O(n). Mapping tables hold at most 256 ASCII characters → O(1) space.",
      },
    },
    code: [
      "class Solution:",
      "    def isIsomorphic(self, s: str, t: str) -> bool:",
      "        if len(s) != len(t):",
      "            return False",
      "        map_s = {}",
      "        map_t = {}",
      "        for i in range(len(s)):",
      "            c1, c2 = s[i], t[i]",
      "            if c1 in map_s:",
      "                if map_s[c1] != c2:",
      "                    return False",
      "            else:",
      "                if c2 in map_t:",
      "                    return False",
      "                map_s[c1] = c2",
      "                map_t[c2] = c1",
      "        return True",
    ],
    builder: buildSteps205,
  },
  246: {
    id: 246,
    difficulty: "easy",
    slug: "strobogrammatic-number",
    category: { key: "math", vi: "Toán / Đệ quy", en: "Math / Recursion" },
    title: { vi: "Strobogrammatic Number", en: "Strobogrammatic Number" },
    titleVi: { vi: "Số đối xứng quay 180°", en: "Strobogrammatic number" },
    statement: {
      vi:
        "Một số strobogrammatic là số trông giống hệt khi xoay 180°. " +
        "Các chữ số hợp lệ khi xoay: 0↔0, 1↔1, 6↔9, 8↔8, 9↔6. " +
        "Cho một chuỗi num, xác định xem nó có phải số strobogrammatic không.",
      en:
        "A strobogrammatic number looks the same when rotated 180 degrees. " +
        "Valid rotated digit pairs: 0↔0, 1↔1, 6↔9, 8↔8, 9↔6. " +
        "Given a string num, determine if it is strobogrammatic.",
    },
    defaultInput: "69",
    inputKind: "string",
    inputLabel: { vi: "Số (chuỗi chữ số)", en: "Number (digit string)" },
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Dùng hai con trỏ từ hai đầu vào giữa, mỗi bước O(1) → O(n). Chỉ dùng bảng ánh xạ cố định → O(1) bộ nhớ.",
        en: "Two pointers from both ends toward center, each step O(1) → O(n). Only a fixed mapping table → O(1) space.",
      },
    },
    code: [
      "class Solution:",
      "    def isStrobogrammatic(self, num: str) -> bool:",
      "        pairs = {'0':'0','1':'1','6':'9','8':'8','9':'6'}",
      "        left, right = 0, len(num) - 1",
      "        while left <= right:",
      "            if num[left] not in pairs:",
      "                return False",
      "            if pairs[num[left]] != num[right]:",
      "                return False",
      "            left += 1",
      "            right -= 1",
      "        return True",
    ],
    builder: buildSteps246,
  },
  734: {
    id: 734,
    difficulty: "easy",
    slug: "sentence-similarity",
    category: { key: "hashmap", vi: "Bảng băm (Hash Map)", en: "Hash Map" },
    title: { vi: "Sentence Similarity", en: "Sentence Similarity" },
    titleVi: { vi: "Độ tương đồng câu", en: "Sentence similarity" },
    statement: {
      vi:
        "Cho hai câu sentence1 và sentence2 (mỗi câu là danh sách từ) và danh sách cặp từ tương đồng similarPairs. " +
        "Hai câu tương đồng nếu chúng cùng độ dài và mỗi cặp từ tương ứng hoặc giống nhau, hoặc nằm trong similarPairs. " +
        "Lưu ý: quan hệ tương đồng KHÔNG bắc cầu (similar(a,b) và similar(b,c) KHÔNG suy ra similar(a,c)).",
      en:
        "Given two sentences sentence1 and sentence2 (each a list of words) and a list of similar word pairs similarPairs. " +
        "Two sentences are similar if they have the same length and each corresponding pair of words is either identical or in similarPairs. " +
        "Note: similarity is NOT transitive (similar(a,b) and similar(b,c) does NOT imply similar(a,c)).",
    },
    defaultInput: "great,acting,skills",
    inputKind: "string",
    inputLabel: { vi: "sentence1 (từ cách nhau bởi dấu phẩy)", en: "sentence1 (words comma separated)" },
    extraParams: [
      {
        key: "sentence2",
        type: "string",
        label: { vi: "sentence2 (từ cách nhau bởi dấu phẩy)", en: "sentence2 (words comma separated)" },
        default: "fine,drama,talent",
      },
      {
        key: "pairs",
        type: "string",
        label: { vi: "similarPairs (vd: great-fine,acting-drama)", en: "similarPairs (e.g. great-fine,acting-drama)" },
        default: "great-fine,acting-drama,skills-talent",
      },
    ],
    complexity: {
      time: "O(N + P)",
      space: "O(P)",
      note: {
        vi: "Xây set từ P cặp: O(P). Duyệt N từ, mỗi từ tra set O(1): O(N). Tổng O(N+P). Bộ nhớ O(P) cho set.",
        en: "Build set from P pairs: O(P). Iterate N words, each set lookup O(1): O(N). Total O(N+P). Memory O(P) for the set.",
      },
    },
    code: [
      "class Solution:",
      "    def areSentencesSimilar(self, s1, s2, pairs):",
      "        if len(s1) != len(s2):",
      "            return False",
      "        pairSet = set()",
      "        for a, b in pairs:",
      "            pairSet.add((a, b))",
      "            pairSet.add((b, a))",
      "        for i in range(len(s1)):",
      "            if s1[i] == s2[i]:",
      "                continue",
      "            if (s1[i], s2[i]) not in pairSet:",
      "                return False",
      "        return True",
    ],
    builder: buildSteps734,
  },
  760: {
    id: 760,
    difficulty: "easy",
    slug: "find-anagram-mappings",
    category: { key: "hashmap", vi: "Bảng băm (Hash Map)", en: "Hash Map" },
    title: { vi: "Find Anagram Mappings", en: "Find Anagram Mappings" },
    titleVi: { vi: "Tìm ánh xạ Anagram", en: "Find anagram mappings" },
    statement: {
      vi:
        "Cho hai mảng nums1 và nums2, trong đó nums2 là một hoán vị (anagram) của nums1. " +
        "Trả về mảng mapping sao cho mapping[i] = j nghĩa là nums1[i] xuất hiện tại nums2[j]. " +
        "Nếu có nhiều đáp án, trả về bất kỳ đáp án hợp lệ nào.",
      en:
        "Given two arrays nums1 and nums2 where nums2 is an anagram of nums1. " +
        "Return an array mapping such that mapping[i] = j means nums1[i] appears at nums2[j]. " +
        "If there are multiple answers, return any valid one.",
    },
    defaultInput: "12,28,46,32,50",
    inputKind: "string",
    inputLabel: { vi: "nums1 (cách nhau bởi dấu phẩy)", en: "nums1 (comma separated)" },
    extraParams: [
      {
        key: "nums2",
        type: "string",
        label: { vi: "nums2 (hoán vị của nums1)", en: "nums2 (anagram of nums1)" },
        default: "50,12,32,46,28",
      },
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Xây hash map từ nums2: O(n). Duyệt nums1, mỗi phần tử tra O(1): O(n). Bộ nhớ O(n) cho map.",
        en: "Build hash map from nums2: O(n). Iterate nums1, each lookup O(1): O(n). Memory O(n) for the map.",
      },
    },
    code: [
      "class Solution:",
      "    def anagramMappings(self, nums1, nums2):",
      "        index_map = {}",
      "        for i, num in enumerate(nums2):",
      "            index_map[num] = i",
      "        return [index_map[num] for num in nums1]",
    ],
    builder: buildSteps760,
  },
  771: {
    id: 771,
    difficulty: "easy",
    slug: "jewels-and-stones",
    category: { key: "hashmap", vi: "Bảng băm (Hash Map)", en: "Hash Map" },
    title: { vi: "Jewels and Stones", en: "Jewels and Stones" },
    titleVi: { vi: "Đá quý và Đá", en: "Jewels and stones" },
    statement: {
      vi:
        "Cho chuỗi jewels chứa các loại đá quý (mỗi ký tự là một loại) và chuỗi stones chứa các viên đá bạn có. " +
        "Đếm số viên đá trong stones cũng là đá quý. Phân biệt hoa thường.",
      en:
        "Given a string jewels representing types of stones that are jewels, and a string stones representing stones you have. " +
        "Count how many of your stones are also jewels. Letters are case sensitive.",
    },
    defaultInput: "aA",
    inputKind: "string",
    inputLabel: { vi: "jewels (các loại đá quý)", en: "jewels (jewel types)" },
    extraParams: [
      {
        key: "stones",
        type: "string",
        label: { vi: "stones (các viên đá bạn có)", en: "stones (your stones)" },
        default: "aAAbbbb",
      },
    ],
    complexity: {
      time: "O(J + S)",
      space: "O(J)",
      note: {
        vi: "Xây set từ jewels: O(J). Duyệt stones, mỗi ký tự tra set O(1): O(S). Bộ nhớ O(J).",
        en: "Build set from jewels: O(J). Iterate stones, each set lookup O(1): O(S). Memory O(J).",
      },
    },
    code: [
      "class Solution:",
      "    def numJewelsInStones(self, jewels, stones):",
      "        jewel_set = set(jewels)",
      "        count = 0",
      "        for s in stones:",
      "            if s in jewel_set:",
      "                count += 1",
      "        return count",
    ],
    builder: buildSteps771,
  },
  1275: {
    id: 1275,
    difficulty: "easy",
    slug: "find-winner-on-a-tic-tac-toe-game",
    category: { key: "array", vi: "Mảng", en: "Array" },
    title: { vi: "Find Winner on a Tic Tac Toe Game", en: "Find Winner on a Tic Tac Toe Game" },
    titleVi: { vi: "Tìm người thắng Tic-Tac-Toe", en: "Find Tic-Tac-Toe winner" },
    statement: {
      vi:
        "Cho danh sách nước đi trên bàn cờ 3x3. Nước đi lẻ là của A, nước chẵn là của B. " +
        "Trả về 'A' nếu A thắng, 'B' nếu B thắng, 'Draw' nếu hòa (hết ô), hoặc 'Pending' nếu chưa kết thúc.",
      en:
        "Given a list of moves on a 3x3 board. Odd moves belong to A, even moves to B. " +
        "Return 'A' if A wins, 'B' if B wins, 'Draw' if it's a draw (all cells filled), or 'Pending' if game is not over.",
    },
    defaultInput: "0-0,2-0,1-1,2-1,2-2",
    inputKind: "string",
    inputLabel: { vi: "Nước đi (row-col, cách bởi dấu phẩy)", en: "Moves (row-col, comma separated)" },
    extraParams: [],
    complexity: {
      time: "O(M)",
      space: "O(1)",
      note: {
        vi: "Duyệt M nước đi, mỗi nước kiểm tra thắng O(1) (bàn cố định 3×3). Bộ nhớ O(1) cho bàn 3×3.",
        en: "Iterate M moves, each check for win is O(1) (fixed 3×3 board). Memory O(1) for the 3×3 board.",
      },
    },
    code: [
      "class Solution:",
      "    def tictactoe(self, moves):",
      "        board = [['' for _ in range(3)] for _ in range(3)]",
      "        for i, (r, c) in enumerate(moves):",
      "            board[r][c] = 'A' if i % 2 == 0 else 'B'",
      "        # Check rows, cols, diagonals",
      "        for player in ['A', 'B']:",
      "            for i in range(3):",
      "                if all(board[i][j]==player for j in range(3)):",
      "                    return player",
      "                if all(board[j][i]==player for j in range(3)):",
      "                    return player",
      "            if all(board[i][i]==player for i in range(3)):",
      "                return player",
      "            if all(board[i][2-i]==player for i in range(3)):",
      "                return player",
      "        return 'Draw' if len(moves)==9 else 'Pending'",
    ],
    builder: buildSteps1275,
  },
  1394: {
    id: 1394,
    difficulty: "easy",
    slug: "find-lucky-integer-in-an-array",
    category: { key: "hashmap", vi: "Bảng băm (Hash Map)", en: "Hash Map" },
    title: { vi: "Find Lucky Integer in an Array", en: "Find Lucky Integer in an Array" },
    titleVi: { vi: "Tìm số may mắn trong mảng", en: "Find lucky integer" },
    statement: {
      vi:
        "Cho mảng số nguyên arr. Một số nguyên 'lucky' nếu tần suất xuất hiện của nó trong mảng bằng chính giá trị đó. " +
        "Trả về số lucky lớn nhất. Nếu không có, trả về -1.",
      en:
        "Given an array of integers arr. An integer is 'lucky' if its frequency in the array equals its value. " +
        "Return the largest lucky number. If none exists, return -1.",
    },
    defaultInput: [2, 2, 3, 4],
    inputKind: "positive",
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: {
        vi: "Đếm tần suất O(n), duyệt map tìm lucky O(n). Bộ nhớ O(n) cho frequency map.",
        en: "Count frequencies O(n), iterate map to find lucky O(n). Memory O(n) for frequency map.",
      },
    },
    code: [
      "class Solution:",
      "    def findLucky(self, arr):",
      "        freq = {}",
      "        for num in arr:",
      "            freq[num] = freq.get(num, 0) + 1",
      "        result = -1",
      "        for num, count in freq.items():",
      "            if num == count:",
      "                result = max(result, num)",
      "        return result",
    ],
    builder: buildSteps1394,
  },
  1399: {
    id: 1399,
    difficulty: "easy",
    slug: "count-largest-group",
    category: { key: "hashmap", vi: "Bảng băm (Hash Map)", en: "Hash Map" },
    title: { vi: "Count Largest Group", en: "Count Largest Group" },
    titleVi: { vi: "Đếm nhóm lớn nhất", en: "Count largest group" },
    statement: {
      vi:
        "Cho số nguyên n. Nhóm các số từ 1 đến n theo tổng các chữ số. " +
        "Trả về số lượng nhóm có kích thước lớn nhất.",
      en:
        "Given an integer n. Group numbers from 1 to n by their digit sum. " +
        "Return the number of groups that have the largest size.",
    },
    defaultInput: [13],
    inputKind: "positive",
    singleInput: true,
    maxInput: 100,
    inputLabel: { vi: "n", en: "n" },
    extraParams: [],
    complexity: {
      time: "O(n · log₁₀(n))",
      space: "O(n)",
      note: {
        vi: "Duyệt n số, mỗi số tính tổng chữ số O(log₁₀(n)). Bộ nhớ O(n) cho map nhóm.",
        en: "Iterate n numbers, digit sum of each is O(log₁₀(n)). Memory O(n) for group map.",
      },
    },
    code: [
      "class Solution:",
      "    def countLargestGroup(self, n: int) -> int:",
      "        groups = {}",
      "        for i in range(1, n + 1):",
      "            digit_sum = sum(int(d) for d in str(i))",
      "            groups[digit_sum] = groups.get(digit_sum, 0) + 1",
      "        max_size = max(groups.values())",
      "        return sum(1 for v in groups.values() if v == max_size)",
    ],
    builder: buildSteps1399,
  },
};

app.get("/api/problems", (req, res) => {
  // Group problems by algorithm category
  const groupsMap = {};
  for (const key of Object.keys(SUPPORTED)) {
    const p = SUPPORTED[key];
    const cat = p.category || { key: "other", vi: "Khác", en: "Other" };
    if (!groupsMap[cat.key]) {
      groupsMap[cat.key] = { key: cat.key, vi: cat.vi, en: cat.en, problems: [] };
    }
    groupsMap[cat.key].problems.push({ id: p.id, title: p.title, titleVi: p.titleVi, difficulty: p.difficulty || null });
  }
  const groups = Object.values(groupsMap);
  groups.forEach((g) => g.problems.sort((a, b) => a.id - b.id));
  groups.sort((a, b) => a.key.localeCompare(b.key));
  res.json({ groups });
});

app.get("/api/problem/:id", (req, res) => {
  const id = Number(req.params.id);
  const problem = SUPPORTED[id];
  if (!problem) {
    return res.status(404).json({
      error: `Bài ${id} chưa được hỗ trợ. Hiện hỗ trợ: ${Object.keys(SUPPORTED).join(", ")}.`,
    });
  }
  res.json({
    id: problem.id,
    difficulty: problem.difficulty || null,
    slug: problem.slug || null,
    title: problem.title,
    titleVi: problem.titleVi,
    statement: problem.statement,
    defaultInput: problem.defaultInput,
    inputKind: problem.inputKind,
    extraParams: problem.extraParams || [],
    inputLabel: problem.inputLabel || null,
    complexity: problem.complexity || null,
    code: problem.code || [],
    code2: problem.code2 || null,
  });
});

app.post("/api/problem/:id/solve", (req, res) => {
  const id = Number(req.params.id);
  const problem = SUPPORTED[id];
  if (!problem) {
    return res.status(404).json({ error: `Bài ${id} chưa được hỗ trợ.` });
  }

  const input = req.body.input;
  const params = req.body.params || {};

  if (problem.inputKind === "string") {
    if (typeof input !== "string" || input.length === 0) {
      return res.status(400).json({
        error: "Đầu vào s phải là một chuỗi không rỗng.",
      });
    }
  } else {
    if (!Array.isArray(input) || input.length === 0 || !input.every((n) => Number.isInteger(n))) {
      return res.status(400).json({
        error: "Đầu vào phải là mảng các số nguyên.",
      });
    }

    if (problem.inputKind === "positive" && !input.every((n) => n > 0)) {
      return res.status(400).json({
        error: "Đầu vào phải là mảng các số nguyên dương, ví dụ: 2,2,1,2,1",
      });
    }

    if (problem.inputKind === "binary" && !input.every((n) => n === 0 || n === 1)) {
      return res.status(400).json({
        error: "Đầu vào phải là mảng nhị phân chỉ gồm 0 và 1, ví dụ: 1,1,1,0,0,1",
      });
    }

    if (problem.inputKind === "nonneg" && !input.every((n) => n >= 0)) {
      return res.status(400).json({
        error: "Đầu vào phải là mảng các số nguyên không âm, ví dụ: 1,100,1,1,1",
      });
    }

    if (problem.singleInput) {
      if (input.length !== 1) {
        return res.status(400).json({ error: "Bài này chỉ nhận đúng một số." });
      }
      if (problem.maxInput && input[0] > problem.maxInput) {
        return res.status(400).json({ error: `Giá trị tối đa cho phép là ${problem.maxInput}.` });
      }
    }
  }

  // Validate extra parameters
  for (const p of problem.extraParams || []) {
    const v = params[p.key];
    if (p.type === "string") {
      if (typeof v !== "string" || v.length === 0) {
        return res.status(400).json({ error: `Tham số "${p.key}" phải là chuỗi không rỗng.` });
      }
    } else if (!Number.isInteger(v) || (!p.allowNegative && v < 0)) {
      return res.status(400).json({
        error: `Tham số "${p.key}" phải là số nguyên${p.allowNegative ? "" : " không âm"}.`,
      });
    }
  }

  // String-type problems require s and t to have equal length
  if (problem.inputKind === "string" && typeof params.t === "string" && params.t.length !== input.length) {
    return res.status(400).json({ error: "Chuỗi s và t phải có cùng độ dài." });
  }

  res.json(problem.builder(input, params));
});

app.listen(PORT, () => {
  console.log(`LeetCode Visualizer chạy tại http://localhost:${PORT}`);
});
