const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/**
 * Sinh các bước cho LeetCode 1846:
 * Maximum Element After Decreasing and Rearranging.
 *
 * Thuật toán:
 *  1. Sắp xếp mảng tăng dần.
 *  2. arr[0] = 1.
 *  3. Với mỗi i: arr[i] = min(arr[i], arr[i-1] + 1).
 *  4. Đáp án là phần tử cuối cùng (lớn nhất).
 */
function buildSteps1846(input) {
  const original = [...input];
  const sorted = [...input].sort((a, b) => a - b);
  const steps = [];

  // Bước khởi tạo: mảng gốc
  steps.push({
    title: { vi: "Mảng ban đầu", en: "Initial array" },
    arr: [...original],
    highlight: [],
    codeLines: [2],
    note: {
      vi: `Mảng đầu vào: [${original.join(", ")}]. Ta được phép giảm bất kỳ phần tử nào và sắp xếp lại.`,
      en: `Input array: [${original.join(", ")}]. We may decrease any element and rearrange freely.`,
    },
  });

  // Bước sắp xếp
  steps.push({
    title: { vi: "Bước 1: Sắp xếp tăng dần", en: "Step 1: Sort ascending" },
    arr: [...sorted],
    highlight: sorted.map((_, i) => i),
    codeLines: [3],
    note: {
      vi: `Sắp xếp giúp mỗi phần tử chỉ cần lớn hơn phần tử trước tối đa 1 đơn vị: [${sorted.join(", ")}].`,
      en: `Sorting lets each element exceed the previous one by at most 1: [${sorted.join(", ")}].`,
    },
  });

  const work = [...sorted];

  // Bước đặt phần tử đầu = 1
  const before0 = work[0];
  work[0] = 1;
  steps.push({
    title: { vi: "Bước 2: Ép arr[0] = 1", en: "Step 2: Force arr[0] = 1" },
    arr: [...work],
    highlight: [0],
    codeLines: [4],
    note: {
      vi: `Theo yêu cầu arr[0] phải bằng 1, nên giảm ${before0} → 1.`,
      en: `The constraint requires arr[0] = 1, so decrease ${before0} → 1.`,
    },
  });

  // Lặp gán arr[i] = min(arr[i], arr[i-1] + 1)
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
    note: {
      vi: `Phần tử cuối cùng là giá trị lớn nhất có thể đạt được = ${answer}.`,
      en: `The last element is the maximum achievable value = ${answer}.`,
    },
  });

  return { original, sorted, answer, steps };
}

/**
 * Sinh các bước cho LeetCode 1004: Max Consecutive Ones III.
 *
 * Thuật toán cửa sổ trượt (sliding window):
 *  - Mở rộng cửa sổ bằng cách tăng j.
 *  - Đếm số số 0 trong cửa sổ. Khi vượt quá k, co cửa sổ từ trái (tăng i).
 *  - Đáp án là độ dài cửa sổ lớn nhất từng đạt được.
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

    // Mở rộng cửa sổ tới j
    steps.push({
      title: { vi: `Mở rộng: j = ${j}`, en: `Expand: j = ${j}` },
      arr: [...nums],
      highlight: inWindow(i, j),
      mark: [],
      codeLines: [6, 7, 8],
      note: {
        vi: `Thêm phần tử ${nums[j]} ở vị trí ${j}. Số 0 trong cửa sổ [${i}..${j}] = ${zeroCount}.`,
        en: `Add element ${nums[j]} at index ${j}. Zeros in window [${i}..${j}] = ${zeroCount}.`,
      },
    });

    // Co cửa sổ khi vượt quá k số 0
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
    note: {
      vi: `Cửa sổ dài nhất là [${bestI}..${bestJ}] với độ dài ${maxLength}. Đáp án = ${maxLength}.`,
      en: `The longest window is [${bestI}..${bestJ}] with length ${maxLength}. Answer = ${maxLength}.`,
    },
  });

  return { original: [...nums], k, answer: maxLength, steps };
}

/**
 * Sinh các bước cho LeetCode 746: Min Cost Climbing Stairs.
 *
 * Quy hoạch động:
 *  - dp[i] = chi phí nhỏ nhất để đạt tới bậc i (0-indexed, có thêm "đỉnh" = n).
 *  - dp[0] = dp[1] = 0 (được phép bắt đầu ở bậc 0 hoặc 1).
 *  - dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]).
 *  - Đáp án là dp[n].
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
    note: {
      vi: `dp[${n}] = ${dp[n]} là chi phí nhỏ nhất để leo tới đỉnh. Đáp án = ${dp[n]}.`,
      en: `dp[${n}] = ${dp[n]} is the minimum cost to reach the top. Answer = ${dp[n]}.`,
    },
  });

  return { cost: [...cost], answer: dp[n], steps };
}

/**
 * Sinh các bước cho LeetCode 152: Maximum Product Subarray.
 *
 * Vì số âm có thể biến tích nhỏ nhất thành lớn nhất, ta theo dõi đồng thời:
 *  - curMax: tích lớn nhất của dãy con kết thúc tại i.
 *  - curMin: tích nhỏ nhất của dãy con kết thúc tại i.
 *  - result: đáp án lớn nhất từng thấy.
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
    note: {
      vi: `Tích lớn nhất của một dãy con liên tiếp = ${result}.`,
      en: `The maximum product of a contiguous subarray = ${result}.`,
    },
  });

  return { original: [...nums], answer: result, steps };
}

/**
 * Sinh các bước cho LeetCode 70: Climbing Stairs.
 *
 * Quy hoạch động kiểu Fibonacci:
 *  - dp[i] = số cách leo tới bậc i.
 *  - dp[0] = dp[1] = 1.
 *  - dp[i] = dp[i-1] + dp[i-2].
 *  - Đáp án là dp[n].
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
    note: {
      vi: `Số cách leo tới bậc ${n} = dp[${n}] = ${dp[n]}.`,
      en: `Number of distinct ways to reach step ${n} = dp[${n}] = ${dp[n]}.`,
    },
  });

  return { n, answer: dp[n], steps };
}

/**
 * Sinh các bước cho LeetCode 300: Longest Increasing Subsequence (bản DP O(n^2)).
 *
 *  - dp[i] = độ dài dãy con tăng dài nhất kết thúc tại i.
 *  - dp[i] = 1 + max(dp[j]) với mọi j < i mà nums[j] < nums[i].
 *  - Đáp án là max(dp).
 */
function buildSteps300(nums) {
  const n = nums.length;
  const dp = new Array(n).fill(1);
  const steps = [];

  steps.push({
    title: { vi: "Khởi tạo dp", en: "Initialize dp" },
    arr: [...nums],
    sub: [...dp],
    highlight: [],
    mark: [],
    codeLines: [3, 4],
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

    const highlight = bestJ >= 0 ? [bestJ, i] : [i];
    steps.push({
      title: { vi: `Tính dp[${i}]`, en: `Compute dp[${i}]` },
      arr: [...nums],
      sub: [...dp],
      highlight,
      mark: [],
      codeLines: [5, 6, 7, 8],
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

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    sub: [...dp],
    highlight: [],
    mark: [argmax],
    final: true,
    codeLines: [9],
    note: {
      vi: `Độ dài dãy con tăng dài nhất = max(dp) = ${answer} (đạt tại vị trí ${argmax}).`,
      en: `Length of the longest increasing subsequence = max(dp) = ${answer} (achieved at index ${argmax}).`,
    },
  });

  return { original: [...nums], answer, steps };
}

/**
 * Sinh các bước cho LeetCode 509: Fibonacci Number.
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
    note: {
      vi: `F(${n}) = ${dp[n]}.`,
      en: `F(${n}) = ${dp[n]}.`,
    },
  });

  return { n, answer: dp[n], steps };
}

/**
 * Sinh các bước cho LeetCode 1: Two Sum (dùng hash map).
 *
 *  - Với mỗi i, kiểm tra xem (target - nums[i]) đã từng xuất hiện chưa.
 *  - Nếu rồi: tìm thấy cặp chỉ số.
 *  - Nếu chưa: lưu nums[i] -> i vào hash map.
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
      note: {
        vi: "Không có cặp nào có tổng bằng target.",
        en: "No pair sums to the target.",
      },
    });
  }

  return { original: [...nums], target, answer: answer ? `[${answer[0]}, ${answer[1]}]` : "none", steps };
}

const SUPPORTED = {
  1846: {
    id: 1846,
    category: { key: "greedy", vi: "Tham lam & Sắp xếp", en: "Greedy & Sorting" },
    title: { vi: "Maximum Element After Decreasing and Rearranging", en: "Maximum Element After Decreasing and Rearranging" },
    titleVi: { vi: "Giá trị lớn nhất sau khi giảm và sắp xếp lại", en: "Maximum value after decreasing and rearranging" },
    statement: {
      vi: "Cho mảng số nguyên dương arr. Bạn được phép: (1) giảm bất kỳ phần tử nào về một số nguyên dương nhỏ hơn; (2) sắp xếp lại mảng tùy ý. Sao cho arr[0] = 1 và |arr[i] - arr[i-1]| ≤ 1 với mọi i. Trả về giá trị lớn nhất có thể của một phần tử trong mảng sau khi thực hiện.",
      en: "You are given an array of positive integers arr. Perform some operations (possibly none) on arr so that it satisfies these conditions: (1) The value of the first element in arr must be 1. (2) The absolute difference between any 2 adjacent elements must be less than or equal to 1, i.e. abs(arr[i] - arr[i-1]) <= 1 for each i where 1 <= i < arr.length (0-indexed). There are 2 types of operations you can perform any number of times: decrease the value of any element of arr to a smaller positive integer; rearrange the elements of arr in any order. Return the maximum possible value of an element in arr after performing the operations to satisfy the conditions.",
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
    builder: buildSteps300,
  },
  509: {
    id: 509,
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
};

app.get("/api/problems", (req, res) => {
  // Gom các bài theo nhóm thuật toán
  const groupsMap = {};
  for (const key of Object.keys(SUPPORTED)) {
    const p = SUPPORTED[key];
    const cat = p.category || { key: "other", vi: "Khác", en: "Other" };
    if (!groupsMap[cat.key]) {
      groupsMap[cat.key] = { key: cat.key, vi: cat.vi, en: cat.en, problems: [] };
    }
    groupsMap[cat.key].problems.push({ id: p.id, title: p.title, titleVi: p.titleVi });
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
    title: problem.title,
    titleVi: problem.titleVi,
    statement: problem.statement,
    defaultInput: problem.defaultInput,
    inputKind: problem.inputKind,
    extraParams: problem.extraParams || [],
    inputLabel: problem.inputLabel || null,
    complexity: problem.complexity || null,
    code: problem.code || [],
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

  // Kiểm tra các tham số phụ
  for (const p of problem.extraParams || []) {
    const v = params[p.key];
    if (!Number.isInteger(v) || (!p.allowNegative && v < 0)) {
      return res.status(400).json({
        error: `Tham số "${p.key}" phải là số nguyên${p.allowNegative ? "" : " không âm"}.`,
      });
    }
  }

  res.json(problem.builder(input, params));
});

app.listen(PORT, () => {
  console.log(`LeetCode Visualizer chạy tại http://localhost:${PORT}`);
});
