// Auto-generated: do not edit headers manually.
// Module of LeetCode Visualizer — category-specific builders and problem entries.

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

  let left = 0;
  let zeroCount = 0;
  let maxLength = 0;
  let bestL = 0;
  let bestR = -1;

  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeroCount += 1;

    // Expand window to right
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
        { name: "maxLength", value: maxLength },
      ],
      note: {
        vi: `Thêm nums[${right}]=${nums[right]}. Số 0 trong cửa sổ [${left}..${right}] = ${zeroCount}.`,
        en: `Add nums[${right}]=${nums[right]}. Zeros in window [${left}..${right}] = ${zeroCount}.`,
      },
    });

    // Shrink window when zeros exceed k
    while (zeroCount > k) {
      const removed = nums[left];
      if (nums[left] === 0) zeroCount -= 1;
      left += 1;
      steps.push({
        title: { vi: `Co cửa sổ: left = ${left}`, en: `Shrink: left = ${left}` },
        arr: [...nums],
        highlight: inWindow(left, right),
        mark: [],
        codeLines: [9, 10, 11, 12],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "zeroCount", value: zeroCount },
          { name: "maxLength", value: maxLength },
        ],
        note: {
          vi: `Zeros vượt k=${k}. Bỏ nums[${left - 1}]=${removed} ở trái, left → ${left}. Zeros = ${zeroCount}.`,
          en: `Zeros exceeded k=${k}. Drop nums[${left - 1}]=${removed} on left, left → ${left}. Zeros = ${zeroCount}.`,
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
        arr: [...nums],
        highlight: inWindow(left, right),
        mark: [],
        codeLines: [13],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "maxLength", value: maxLength },
          { name: "zeroCount", value: zeroCount },
        ],
        note: {
          vi: `Cửa sổ [${left}..${right}] dài ${length} > kỷ lục cũ. maxLength = ${maxLength}.`,
          en: `Window [${left}..${right}] of length ${length} beats the record. maxLength = ${maxLength}.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [...nums],
    highlight: [],
    mark: bestR >= 0 ? inWindow(bestL, bestR) : [],
    final: true,
    codeLines: [14],
    vars: [
      { name: "maxLength", value: maxLength },
      { name: "window", value: bestR >= 0 ? `[${bestL}..${bestR}]` : "-" },
    ],
    note: {
      vi: `Cửa sổ dài nhất là [${bestL}..${bestR}] với độ dài ${maxLength}. Đáp án = ${maxLength}.`,
      en: `The longest window is [${bestL}..${bestR}] with length ${maxLength}. Answer = ${maxLength}.`,
    },
  });

  return { original: [...nums], k, answer: maxLength, steps };
}

/**
 * LeetCode 1100: Find K-Length Substrings With No Repeated Characters.
 * Sliding window with a frequency map:
 *  - Expand right and count s[right].
 *  - Shrink while the window has a duplicate of s[right] or is longer than k.
 *  - Count windows whose length is exactly k.
 */
function buildSteps1100(input, params) {
  const s = typeof input === "string" ? input.trim() : String(input);
  const k = params.k;
  const n = s.length;
  const chars = s.split("");
  const arr = chars.map((ch) => Math.max(1, ch.charCodeAt(0) - 96));
  const steps = [];
  const count = {};
  let left = 0;
  let answer = 0;
  const validStarts = [];

  const inWindow = (lo, hi) => (
    lo <= hi ? Array.from({ length: hi - lo + 1 }, (_, x) => lo + x) : []
  );
  const countText = () => {
    const entries = Object.entries(count).filter(([, v]) => v > 0);
    return entries.length ? `{${entries.map(([ch, v]) => `${ch}:${v}`).join(", ")}}` : "{}";
  };

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [...arr],
      sub: [...chars],
      highlight: opts.highlight || [],
      mark: opts.mark || validStarts.flatMap((start) => inWindow(start, start + k - 1)),
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  snap({
    title: { vi: "Khởi tạo", en: "Initialize" },
    codeLines: [3],
    vars: [
      { name: "s", value: `"${s}"` },
      { name: "k", value: k },
      { name: "n", value: n },
    ],
    note: {
      vi: "Đếm substring liên tiếp độ dài k mà không có ký tự lặp.",
      en: "Count contiguous substrings of length k with no repeated characters.",
    },
  });

  if (k <= 0 || k > n) {
    snap({
      title: { vi: "Không thể có cửa sổ hợp lệ", en: "No valid window possible" },
      codeLines: [3],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: `k=${k} không tạo được substring hợp lệ trong chuỗi dài ${n}.`,
        en: `k=${k} cannot form a valid substring in a string of length ${n}.`,
      },
      final: true,
    });
    return { s, k, answer: 0, steps };
  }

  snap({
    title: { vi: "left = 0", en: "left = 0" },
    codeLines: [4],
    vars: [{ name: "left", value: left }],
    note: {
      vi: "left là đầu cửa sổ hiện tại.",
      en: "left is the start of the current window.",
    },
  });

  snap({
    title: { vi: "count = {}", en: "count = {}" },
    codeLines: [5],
    vars: [{ name: "count", value: countText() }],
    note: {
      vi: "count lưu số lần xuất hiện của từng ký tự trong cửa sổ.",
      en: "count stores each character's frequency inside the window.",
    },
  });

  snap({
    title: { vi: "answer = 0", en: "answer = 0" },
    codeLines: [6],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: "answer đếm số cửa sổ hợp lệ độ dài k.",
      en: "answer counts valid windows of length k.",
    },
  });

  for (let right = 0; right < n; right++) {
    const ch = s[right];
    snap({
      title: { vi: `for right=${right}, ch='${ch}'`, en: `for right=${right}, ch='${ch}'` },
      codeLines: [7],
      highlight: inWindow(left, right),
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "ch", value: ch },
        { name: "window", value: `"${s.slice(left, right + 1)}"` },
      ],
      note: {
        vi: `Mở rộng cửa sổ sang phải, thêm s[${right}]='${ch}'.`,
        en: `Expand the window to the right, adding s[${right}]='${ch}'.`,
      },
    });

    count[ch] = (count[ch] || 0) + 1;
    snap({
      title: { vi: `count['${ch}'] = ${count[ch]}`, en: `count['${ch}'] = ${count[ch]}` },
      codeLines: [8],
      highlight: inWindow(left, right),
      vars: [
        { name: "ch", value: ch },
        { name: "count", value: countText() },
      ],
      note: {
        vi: `Tăng tần suất của '${ch}' trong cửa sổ.`,
        en: `Increase the frequency of '${ch}' in the window.`,
      },
    });

    while ((count[ch] || 0) > 1 || right - left + 1 > k) {
      const tooMany = (count[ch] || 0) > 1;
      const tooLong = right - left + 1 > k;
      snap({
        title: { vi: `while invalid -> true`, en: `while invalid -> true` },
        codeLines: [9],
        highlight: inWindow(left, right),
        vars: [
          { name: `count['${ch}'] > 1`, value: tooMany },
          { name: "window length > k", value: tooLong },
          { name: "window length", value: right - left + 1 },
          { name: "k", value: k },
        ],
        note: {
          vi: tooMany
            ? `Cửa sổ có ký tự '${ch}' bị lặp, cần co trái.`
            : `Cửa sổ dài hơn k=${k}, cần co trái.`,
          en: tooMany
            ? `The window repeats '${ch}', so shrink from the left.`
            : `The window is longer than k=${k}, so shrink from the left.`,
        },
      });

      const removed = s[left];
      count[removed] -= 1;
      snap({
        title: { vi: `count[s[left]] -= 1`, en: `count[s[left]] -= 1` },
        codeLines: [10],
        highlight: inWindow(left, right),
        vars: [
          { name: "removed", value: removed },
          { name: "count", value: countText() },
        ],
        note: {
          vi: `Bỏ s[${left}]='${removed}' khỏi cửa sổ.`,
          en: `Remove s[${left}]='${removed}' from the window.`,
        },
      });

      left += 1;
      snap({
        title: { vi: `left = ${left}`, en: `left = ${left}` },
        codeLines: [11],
        highlight: inWindow(left, right),
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "window", value: `"${s.slice(left, right + 1)}"` },
          { name: "count", value: countText() },
        ],
        note: {
          vi: `Dời left sang ${left}.`,
          en: `Move left to ${left}.`,
        },
      });
    }

    const windowLen = right - left + 1;
    const isValidK = windowLen === k;
    snap({
      title: { vi: `if window length == k -> ${isValidK}`, en: `if window length == k -> ${isValidK}` },
      codeLines: [12],
      highlight: inWindow(left, right),
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "window", value: `"${s.slice(left, right + 1)}"` },
        { name: "window length", value: windowLen },
        { name: "k", value: k },
      ],
      note: isValidK
        ? {
            vi: "Cửa sổ hiện tại có đúng độ dài k và không có ký tự lặp.",
            en: "The current window has exactly length k and no repeated characters.",
          }
        : {
            vi: "Cửa sổ chưa đủ độ dài k.",
            en: "The window is not length k yet.",
          },
    });

    if (isValidK) {
      answer += 1;
      validStarts.push(left);
      snap({
        title: { vi: `answer = ${answer}`, en: `answer = ${answer}` },
        codeLines: [13],
        highlight: inWindow(left, right),
        mark: validStarts.flatMap((start) => inWindow(start, start + k - 1)),
        vars: [
          { name: "valid substring", value: `"${s.slice(left, right + 1)}"` },
          { name: "answer", value: answer },
        ],
        note: {
          vi: `Đếm substring "${s.slice(left, right + 1)}".`,
          en: `Count substring "${s.slice(left, right + 1)}".`,
        },
      });
    }
  }

  snap({
    title: { vi: `return ${answer}`, en: `return ${answer}` },
    codeLines: [14],
    highlight: [],
    mark: validStarts.flatMap((start) => inWindow(start, start + k - 1)),
    vars: [
      { name: "answer", value: answer },
      { name: "valid windows", value: validStarts.map((start) => `"${s.slice(start, start + k)}"`).join(", ") || "none" },
    ],
    note: {
      vi: `Có ${answer} substring độ dài ${k} không có ký tự lặp.`,
      en: `There are ${answer} substring(s) of length ${k} with no repeated characters.`,
    },
    final: true,
  });

  return { s, k, answer, steps };
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
 * LeetCode 1358: Number of Substrings Containing All Three Characters.
 * Sliding window: expand right until window has all 3 chars, then
 * all substrings starting from left..current_left ending at right..n-1 are valid.
 * Count += n - right for each valid window position after shrinking.
 */
function buildSteps1358(input, params) {
  const approach = (params && params.approach) || 1;
  if (approach === 2) return buildSteps1358Last(input);

  const s = typeof input === "string" ? input : String(input);
  const n = s.length;
  const steps = [];

  const count = { a: 0, b: 0, c: 0 };
  let left = 0;
  let total = 0;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: s.split("").map((ch) => ch.charCodeAt(0) - 96), // a=1,b=2,c=3 for bar heights
    sub: s.split(""),
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "s", value: s },
      { name: "count", value: "{a:0, b:0, c:0}" },
      { name: "total", value: 0 },
    ],
    note: {
      vi: `Đếm số substring chứa ít nhất 1 'a', 1 'b', 1 'c'. Dùng cửa sổ trượt: khi cửa sổ hợp lệ → mọi mở rộng sang phải cũng hợp lệ.`,
      en: `Count substrings containing at least one 'a', 'b', and 'c'. Sliding window: once valid, all extensions to the right are also valid.`,
    },
  });

  const inWindow = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, x) => lo + x);

  for (let right = 0; right < n; right++) {
    count[s[right]]++;

    // Shrink while all three present
    while (count.a >= 1 && count.b >= 1 && count.c >= 1) {
      const added = n - right;
      total += added;

      steps.push({
        title: { vi: `Hợp lệ: left=${left}, right=${right}`, en: `Valid: left=${left}, right=${right}` },
        arr: s.split("").map((ch) => ch.charCodeAt(0) - 96),
        sub: s.split(""),
        highlight: inWindow(left, right),
        mark: [],
        codeLines: [6, 7, 8, 9, 10],
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "count", value: `{a:${count.a}, b:${count.b}, c:${count.c}}` },
          { name: "+substrings", value: `${added} (n - right = ${n} - ${right})` },
          { name: "total", value: total },
        ],
        note: {
          vi: `Cửa sổ [${left}..${right}] chứa cả a,b,c → ${added} substring hợp lệ bắt đầu tại left=${left} (kéo dài đến cuối). total = ${total}. Co left.`,
          en: `Window [${left}..${right}] has all a,b,c → ${added} valid substrings starting at left=${left} (extend to end). total = ${total}. Shrink left.`,
        },
      });

      count[s[left]]--;
      left++;
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: s.split("").map((ch) => ch.charCodeAt(0) - 96),
    sub: s.split(""),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [11],
    vars: [{ name: "total", value: total }],
    note: {
      vi: `Tổng số substring chứa cả 'a', 'b', 'c' = ${total}.`,
      en: `Total substrings containing all three characters = ${total}.`,
    },
  });

  return { original: s, answer: total, steps };
}

/**
 * LeetCode 1358 — Approach 2: Last Index Tracking (tối ưu hơn).
 * Thay vì sliding window, theo dõi vị trí cuối cùng của mỗi ký tự.
 * Khi cả 3 đã xuất hiện, số substring hợp lệ kết thúc tại i = min(last) + 1.
 */
function buildSteps1358Last(input) {
  const s = typeof input === "string" ? input : String(input);
  const n = s.length;
  const steps = [];
  const last = { a: -1, b: -1, c: -1 };
  let res = 0;

  steps.push({
    title: { vi: "Khởi tạo (Last Index)", en: "Initialize (Last Index)" },
    arr: s.split("").map((ch) => ch.charCodeAt(0) - 96),
    sub: s.split(""),
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "last", value: "{a:-1, b:-1, c:-1}" },
      { name: "res", value: 0 },
    ],
    note: {
      vi: `Ý tưởng: last[ch] = vị trí cuối cùng thấy ch.\nKhi cả 3 đã xuất hiện: số substring hợp lệ KẾT THÚC tại i = min(last['a'], last['b'], last['c']) + 1.\n(Vì bất kỳ vị trí bắt đầu nào từ 0..min(last) đều tạo substring chứa cả 3.)`,
      en: `Idea: last[ch] = last seen position of ch.\nOnce all 3 have appeared: valid substrings ENDING at i = min(last['a'], last['b'], last['c']) + 1.\n(Any start from 0..min(last) yields a substring with all 3.)`,
    },
  });

  for (let i = 0; i < n; i++) {
    const ch = s[i];
    last[ch] = i;

    if (last.a !== -1 && last.b !== -1 && last.c !== -1) {
      const minLast = Math.min(last.a, last.b, last.c);
      const added = minLast + 1;
      res += added;

      steps.push({
        title: { vi: `i=${i} '${ch}': +${added}`, en: `i=${i} '${ch}': +${added}` },
        arr: s.split("").map((c) => c.charCodeAt(0) - 96),
        sub: s.split(""),
        highlight: [last.a, last.b, last.c],
        mark: [i],
        codeLines: [5, 6, 7, 8],
        vars: [
          { name: "i", value: i },
          { name: "last", value: `{a:${last.a}, b:${last.b}, c:${last.c}}` },
          { name: "min(last)", value: minLast },
          { name: "+substrings", value: `min(last)+1 = ${added}` },
          { name: "res", value: res },
        ],
        note: {
          vi: `last = {a:${last.a}, b:${last.b}, c:${last.c}}. min = ${minLast}.\nSố substring mới = min+1 = ${added} (start từ 0..${minLast} đều hợp lệ).\nres = ${res}.`,
          en: `last = {a:${last.a}, b:${last.b}, c:${last.c}}. min = ${minLast}.\nNew substrings = min+1 = ${added} (start 0..${minLast} are all valid).\nres = ${res}.`,
        },
      });
    } else {
      steps.push({
        title: { vi: `i=${i} '${ch}': chưa đủ 3`, en: `i=${i} '${ch}': not all 3 yet` },
        arr: s.split("").map((c) => c.charCodeAt(0) - 96),
        sub: s.split(""),
        highlight: [i],
        mark: [],
        codeLines: [5, 6],
        vars: [
          { name: "i", value: i },
          { name: "last", value: `{a:${last.a}, b:${last.b}, c:${last.c}}` },
          { name: "res", value: res },
        ],
        note: {
          vi: `Chưa đủ cả 3 ký tự → bỏ qua.`,
          en: `Not all 3 chars seen yet → skip.`,
        },
      });
    }
  }

  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: s.split("").map((c) => c.charCodeAt(0) - 96),
    sub: s.split(""),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [9],
    vars: [{ name: "res", value: res }],
    note: {
      vi: `Tổng = ${res}.`,
      en: `Total = ${res}.`,
    },
  });

  return { original: s, answer: res, steps };
}

module.exports = {
  1358: {
    id: 1358,
    difficulty: "medium",
    slug: "number-of-substrings-containing-all-three-characters",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Number of Substrings Containing All Three Characters", en: "Number of Substrings Containing All Three Characters" },
    titleVi: { vi: "Số substring chứa cả a, b, c", en: "Substrings with all three chars" },
    statement: {
      vi: "Cho chuỗi s chỉ gồm 'a', 'b', 'c'. Trả về số lượng substring chứa ít nhất một 'a', một 'b', và một 'c'.",
      en: "Given a string s consisting only of 'a', 'b', and 'c', return the number of substrings containing at least one occurrence of all three characters.",
    },
    defaultInput: "abcabc",
    inputKind: "string",
    inputLabel: { vi: "Chuỗi s (chỉ a,b,c)", en: "String s (only a,b,c)" },
    extraParams: [
      { key: "approach", label: { vi: "Cách (1=sliding window, 2=last index)", en: "Approach (1=sliding window, 2=last index)" }, default: 1 },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Mỗi ký tự được thêm/bỏ khỏi cửa sổ tối đa 1 lần → O(n). Chỉ dùng 3 biến đếm.",
        en: "Each character added/removed at most once → O(n). Only 3 counters used.",
      },
    },
    code: [
      "class Solution:",
      "    def numberOfSubstrings(self, s):",
      "        count = {'a': 0, 'b': 0, 'c': 0}",
      "        left = 0",
      "        total = 0",
      "        for right in range(len(s)):",
      "            count[s[right]] += 1",
      "            while count['a'] > 0 and count['b'] > 0 and count['c'] > 0:",
      "                total += len(s) - right",
      "                count[s[left]] -= 1",
      "                left += 1",
      "        return total",
    ],
    builder: buildSteps1358,
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
  1100: {
    id: 1100,
    difficulty: "medium",
    premium: true,
    slug: "find-k-length-substrings-with-no-repeated-characters",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    title: { vi: "Find K-Length Substrings With No Repeated Characters", en: "Find K-Length Substrings With No Repeated Characters" },
    titleVi: { vi: "Đếm substring độ dài K không lặp ký tự", en: "K-length substrings with no repeated characters" },
    statement: {
      vi: "Cho chuỗi s và số nguyên k. Trả về số substring liên tiếp có độ dài k mà không có ký tự nào lặp lại.",
      en: "Given a string s and an integer k, return the number of contiguous substrings of length k with no repeated characters.",
    },
    defaultInput: "havefunonleetcode",
    inputKind: "string",
    inputLabel: { vi: "Chuỗi s", en: "String s" },
    extraParams: [
      { key: "k", type: "number", label: { vi: "k", en: "k" }, default: 5 },
    ],
    complexity: {
      time: "O(n)",
      space: "O(min(n, charset))",
      note: {
        vi: "Mỗi ký tự vào/ra cửa sổ tối đa một lần. Bảng đếm giữ ký tự trong cửa sổ.",
        en: "Each character enters and leaves the window at most once. The frequency map stores characters in the window.",
      },
    },
    code: [
      "class Solution:",
      "    def numKLenSubstrNoRepeats(self, s: str, k: int) -> int:",
      "        if k <= 0 or k > len(s): return 0",
      "        left = 0",
      "        count = {}",
      "        answer = 0",
      "        for right, ch in enumerate(s):",
      "            count[ch] = count.get(ch, 0) + 1",
      "            while count[ch] > 1 or right - left + 1 > k:",
      "                count[s[left]] -= 1",
      "                left += 1",
      "            if right - left + 1 == k:",
      "                answer += 1",
      "        return answer",
    ],
    builder: buildSteps1100,
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
      "        left = 0",
      "        max_length = 0",
      "        zero_count = 0",
      "        for right in range(len(nums)):",
      "            if nums[right] == 0:",
      "                zero_count += 1",
      "                while zero_count > k:",
      "                    if nums[left] == 0:",
      "                        zero_count -= 1",
      "                    left += 1",
      "            max_length = max(max_length, right - left + 1)",
      "        return max_length",
    ],
    builder: buildSteps1004,
  },
};
