// LeetCode 674: longest increasing window, tracked by left and right pointers.

const label = (vi, en) => ({ vi, en });
const MAX_STEPS = 400;

function buildSteps674(input) {
  const nums = Array.isArray(input)
    ? [...input]
    : String(input ?? "").split(/[\s,;]+/).filter(Boolean).map(Number);
  if (nums.length > 10000 || nums.some((value) => !Number.isInteger(value))) {
    throw new Error("nums must contain at most 10000 integers");
  }

  const n = nums.length;
  const steps = [];
  let left = 0;
  let right = null;
  let maxLen = n ? 1 : 0;
  let bestStart = n ? 0 : null;
  let windowStart = n ? 0 : null;
  let windowEnd = n ? 0 : null;
  let scannedThrough = n ? 0 : -1;

  const range = (start, end) => {
    if (start === null || end === null || end < start) return [];
    return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
  };
  const bestRange = () => range(bestStart, bestStart === null ? null : bestStart + maxLen - 1);

  function record(title, note, codeLine, options = {}) {
    if (steps.length >= MAX_STEPS && !options.final) return;
    const currentLeft = options.left ?? left;
    const currentRight = options.right === undefined ? right : options.right;
    const currentStart = Object.hasOwn(options, "windowStart") ? options.windowStart : windowStart;
    const currentEnd = Object.hasOwn(options, "windowEnd") ? options.windowEnd : windowEnd;
    const bestEnd = bestStart === null ? null : bestStart + maxLen - 1;
    const cur = currentStart === null || currentEnd === null ? 0 : currentEnd - currentStart + 1;
    const increasing = options.increasing ?? null;
    const view = {
      action: options.action || "scan",
      n,
      index: currentRight,
      left: currentLeft,
      right: currentRight,
      previousIndex: currentRight === null || currentRight <= 0 ? null : currentRight - 1,
      previousValue: currentRight === null || currentRight <= 0 ? null : nums[currentRight - 1],
      value: currentRight === null ? null : nums[currentRight],
      increasing,
      runStart: currentStart,
      runEnd: currentEnd,
      cur,
      best: maxLen,
      bestStart,
      bestEnd,
      improved: Boolean(options.improved),
      scannedThrough: options.scannedThrough ?? scannedThrough,
      maxLen,
      final: Boolean(options.final),
    };
    steps.push({
      title,
      note,
      arr: [...nums],
      highlight: options.highlight || [],
      mark: bestRange(),
      sub: [],
      codeLines: [codeLine],
      vars: options.vars || [],
      final: Boolean(options.final),
      continuous674View: view,
    });
  }

  if (n === 0) {
    record(
      label("return 0", "return 0"),
      label("Mảng rỗng.", "Empty input."),
      4,
      {
        action: "done",
        left: null,
        windowStart: null,
        windowEnd: null,
        scannedThrough: -1,
        final: true,
        vars: [{ name: "answer", value: 0 }],
      },
    );
    return { original: nums, answer: 0, steps };
  }

  record(
    label("left = 0 · max_len = 1", "left = 0 · max_len = 1"),
    label("Bắt đầu từ phần tử đầu tiên.", "Start at the first value."),
    7,
    {
      action: "seed",
      left: 0,
      right: 0,
      windowStart: 0,
      windowEnd: 0,
      scannedThrough: 0,
      highlight: [0],
      vars: [{ name: "left", value: 0 }, { name: "max_len", value: 1 }],
    },
  );

  for (let index = 1; index < n; index += 1) {
    right = index;
    const grows = nums[right] > nums[right - 1];
    record(
      label(`${nums[right - 1]} ${grows ? "<" : "≥"} ${nums[right]}`, `${nums[right - 1]} ${grows ? "<" : "≥"} ${nums[right]}`),
      label(grows ? "✓" : "↻"),
      10,
      {
        action: "compare",
        left,
        right,
        increasing: grows,
        windowStart: left,
        windowEnd: right - 1,
        scannedThrough: right - 1,
        highlight: [right - 1, right],
        vars: [{ name: "left", value: left }, { name: "right", value: right }],
      },
    );

    if (!grows) {
      left = right;
      windowStart = left;
      windowEnd = right;
      scannedThrough = right;
      record(
        label(`left = right = ${right}`, `left = right = ${right}`),
        label("Tạo cửa sổ mới tại right.", "Restart the window at right."),
        11,
        {
          action: "reset",
          left,
          right,
          increasing: false,
          windowStart: left,
          windowEnd: right,
          highlight: [right],
          vars: [{ name: "left", value: left }],
        },
      );
    } else {
      windowStart = left;
      windowEnd = right;
      scannedThrough = right;
      record(
        label(`right = ${right}`, `right = ${right}`),
        label("Số mới nối dài đoạn tăng.", "The new value extends the window."),
        10,
        {
          action: "extend",
          left,
          right,
          increasing: true,
          windowStart: left,
          windowEnd: right,
          highlight: range(left, right),
          vars: [{ name: "left", value: left }, { name: "right", value: right }],
        },
      );
    }

    const windowLength = right - left + 1;
    const improved = windowLength > maxLen;
    if (improved) {
      maxLen = windowLength;
      bestStart = left;
    }
    record(
      label(`max_len = ${maxLen}`, `max_len = ${maxLen}`),
      label(improved ? "★" : "·"),
      12,
      {
        action: "best",
        left,
        right,
        increasing: grows,
        windowStart: left,
        windowEnd: right,
        improved,
        scannedThrough: right,
        highlight: range(left, right),
        vars: [
          { name: "left", value: left },
          { name: "right", value: right },
          { name: "max_len", value: maxLen },
        ],
      },
    );
  }

  record(
    label(`return ${maxLen}`, `return ${maxLen}`),
    label("★", "★"),
    14,
    {
      action: "done",
      left,
      right: n - 1,
      windowStart: left,
      windowEnd: n - 1,
      scannedThrough: n - 1,
      highlight: bestRange(),
      final: true,
      vars: [{ name: "answer", value: maxLen }],
    },
  );

  return { original: nums, answer: maxLen, steps };
}

module.exports = {
  674: {
    id: 674,
    difficulty: "easy",
    slug: "longest-continuous-increasing-subsequence",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [{ key: "array", vi: "Mảng", en: "Array" }],
    title: label("Longest Continuous Increasing Subsequence", "Longest Continuous Increasing Subsequence"),
    titleVi: label("Đoạn tăng liên tục dài nhất", "Longest Continuous Increasing Subsequence"),
    statement: label(
      "Tìm độ dài đoạn con liên tục tăng nghiêm ngặt dài nhất.",
      "Find the length of the longest contiguous strictly increasing subarray.",
    ),
    defaultInput: [1, 3, 5, 4, 7],
    inputKind: "integer",
    inputLabel: label("nums", "nums"),
    approach: [
      label("right quét mảng, left đánh dấu đầu đoạn hiện tại.", "right scans the array; left marks the current run's start."),
      label("Nếu nums[right] ≤ nums[right−1], đặt left = right.", "If nums[right] ≤ nums[right−1], set left = right."),
      label("Độ dài đoạn hiện tại là right − left + 1.", "The window length is right − left + 1."),
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: label("Պահվում են միայն left, right և max_len։", "Only left, right, and max_len are kept."),
    },
    code: [
      "class Solution:",
      "    def findLengthOfLCIS(self, nums: list[int]) -> int:",
      "        if not nums:",
      "            return 0",
      "",
      "        left = 0",
      "        max_len = 1",
      "",
      "        for right in range(1, len(nums)):",
      "            if nums[right] <= nums[right - 1]:",
      "                left = right",
      "            max_len = max(max_len, right - left + 1)",
      "",
      "        return max_len",
    ],
    builder: buildSteps674,
  },
};
