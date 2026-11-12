// LeetCode 3105: longest strictly increasing or decreasing contiguous run.

const label = (vi, en) => ({ vi, en });
const MAX_STEPS = 400;

function buildSteps3105(input) {
  const nums = Array.isArray(input)
    ? [...input]
    : String(input ?? "").split(/[\s,;]+/).filter(Boolean).map(Number);
  if (nums.length > 10000 || nums.some((value) => !Number.isInteger(value))) {
    throw new Error("nums must contain at most 10000 integers");
  }

  const n = nums.length;
  const steps = [];
  let increasing = n > 0 ? 1 : 0;
  let decreasing = n > 0 ? 1 : 0;
  let increasingStart = 0;
  let decreasingStart = 0;
  let best = n > 0 ? 1 : 0;
  let bestStart = n > 0 ? 0 : null;
  let bestDirection = "single";
  let scannedThrough = n > 0 ? 0 : -1;

  const range = (start, end) => {
    if (start === null || end === null || end < start) return [];
    return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
  };
  const record = (action, line, note, options = {}) => {
    if (steps.length >= MAX_STEPS && !options.final) return;
    const index = options.index ?? null;
    const incStart = Object.hasOwn(options, "increasingStart") ? options.increasingStart : increasingStart;
    const decStart = Object.hasOwn(options, "decreasingStart") ? options.decreasingStart : decreasingStart;
    const through = options.scannedThrough ?? scannedThrough;
    const currentEnd = options.currentEnd ?? through;
    const bestEnd = bestStart === null ? null : bestStart + best - 1;
    steps.push({
      title: label(options.titleVi || note.vi, options.titleEn || note.en),
      note,
      arr: [...nums],
      highlight: options.highlight || [],
      mark: bestStart === null ? [] : range(bestStart, bestEnd),
      sub: [],
      codeLines: options.codeLines || [line],
      vars: [
        { name: "inc", value: options.increasing ?? increasing },
        { name: "dec", value: options.decreasing ?? decreasing },
        { name: "ans", value: best },
      ],
      final: Boolean(options.final),
      monotonic3105View: {
        action,
        n,
        index,
        previousIndex: index === null || index === 0 ? null : index - 1,
        previousValue: index === null || index === 0 ? null : nums[index - 1],
        value: index === null ? null : nums[index],
        relation: options.relation ?? null,
        increasing: options.increasing ?? increasing,
        decreasing: options.decreasing ?? decreasing,
        increasingRange: incStart === null ? null : [incStart, currentEnd],
        decreasingRange: decStart === null ? null : [decStart, currentEnd],
        best,
        bestStart,
        bestEnd,
        bestDirection,
        improved: Boolean(options.improved),
        scannedThrough: through,
        final: Boolean(options.final),
      },
    });
  };

  if (n === 0) {
    record("done", 4, label("Mảng rỗng nên đáp án là 0.", "The array is empty, so the answer is 0."), {
      final: true,
      increasing: 0,
      decreasing: 0,
      increasingStart: null,
      decreasingStart: null,
      currentEnd: -1,
      titleVi: "Đáp án: 0",
      titleEn: "Answer: 0",
    });
    return { original: nums, answer: 0, steps };
  }

  record("seed", 5,
    label("Một phần tử tự nó là đoạn tăng và giảm dài 1.", "One value alone is both an increasing and decreasing run of length 1."),
    { index: 0, highlight: [0], currentEnd: 0, titleVi: "Khởi tạo hai độ dài = 1", titleEn: "Initialize both lengths to 1" });

  for (let i = 1; i < n; i += 1) {
    const previousValue = nums[i - 1];
    const value = nums[i];
    const relation = value > previousValue ? "up" : value < previousValue ? "down" : "equal";
    record("compare", 7,
      relation === "up"
        ? label(`${previousValue} < ${value}: đoạn tăng tiếp tục.`, `${previousValue} < ${value}: the increasing run continues.`)
        : relation === "down"
          ? label(`${previousValue} > ${value}: đoạn giảm tiếp tục.`, `${previousValue} > ${value}: the decreasing run continues.`)
          : label(`${previousValue} = ${value}: cả hai đoạn đều bị ngắt.`, `${previousValue} = ${value}: both runs are interrupted.`),
      {
        index: i,
        relation,
        increasingStart,
        decreasingStart,
        increasing,
        decreasing,
        codeLines: [7, 8],
        scannedThrough: i - 1,
        currentEnd: i - 1,
        highlight: [i - 1, i],
        titleVi: "So sánh hai phần tử kề nhau",
        titleEn: "Compare adjacent values",
      });

    increasing = relation === "up" ? increasing + 1 : 1;
    decreasing = relation === "down" ? decreasing + 1 : 1;
    if (relation !== "up") increasingStart = i;
    if (relation !== "down") decreasingStart = i;
    scannedThrough = i;

    record("update", relation === "up" ? 7 : 8,
      relation === "up"
        ? label("Tăng: tăng độ dài increasing; giảm bắt đầu lại từ 1.", "Up: extend increasing; reset decreasing to 1.")
        : relation === "down"
          ? label("Giảm: tăng độ dài decreasing; tăng bắt đầu lại từ 1.", "Down: extend decreasing; reset increasing to 1.")
          : label("Bằng nhau: bắt đầu lại cả hai đoạn với độ dài 1.", "Equal: restart both runs at length 1."),
      {
        index: i,
        relation,
        codeLines: [7, 8],
        increasingStart,
        decreasingStart,
        currentEnd: i,
        highlight: [i],
        titleVi: "Cập nhật hai đoạn đang chạy",
        titleEn: "Update both running segments",
      });

    let improved = false;
    if (increasing > best) {
      best = increasing;
      bestStart = increasingStart;
      bestDirection = "up";
      improved = true;
    }
    if (decreasing > best) {
      best = decreasing;
      bestStart = decreasingStart;
      bestDirection = "down";
      improved = true;
    }
    record("best", 9,
      improved
        ? label(`Kỷ lục mới: đoạn ${bestDirection === "up" ? "tăng" : "giảm"} dài ${best}.`, `New record: the ${bestDirection === "up" ? "increasing" : "decreasing"} run has length ${best}.`)
        : label("Chưa có đoạn nào dài hơn kỷ lục hiện tại.", "Neither run is longer than the current record."),
      {
        index: i,
        relation,
        codeLines: [9],
        increasingStart,
        decreasingStart,
        currentEnd: i,
        improved,
        highlight: range(bestStart, bestStart + best - 1),
        titleVi: improved ? "Cập nhật kỷ lục" : "Giữ nguyên kỷ lục",
        titleEn: improved ? "Update the record" : "Keep the record",
      });
  }

  record("done", 10,
    label(`Độ dài lớn nhất là ${best}.`, `The longest length is ${best}.`),
    {
      final: true,
      index: n - 1,
      increasingStart,
      decreasingStart,
      currentEnd: n - 1,
      scannedThrough: n - 1,
      highlight: range(bestStart, bestStart + best - 1),
      titleVi: `Đáp án: ${best}`,
      titleEn: `Answer: ${best}`,
    });
  return { original: nums, answer: best, steps };
}

module.exports = {
  3105: {
    id: 3105,
    difficulty: "easy",
    slug: "longest-strictly-increasing-or-strictly-decreasing-subarray",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [{ key: "array", vi: "Mảng", en: "Array" }],
    title: label("Longest Strictly Increasing or Strictly Decreasing Subarray", "Longest Strictly Increasing or Strictly Decreasing Subarray"),
    titleVi: label("Đoạn con tăng hoặc giảm nghiêm ngặt dài nhất", "Longest strictly increasing or decreasing subarray"),
    statement: label(
      "Tìm độ dài đoạn con liên tục dài nhất mà các phần tử tăng nghiêm ngặt hoặc giảm nghiêm ngặt.",
      "Find the longest contiguous subarray whose elements are strictly increasing or strictly decreasing."
    ),
    defaultInput: [1, 4, 3, 3, 2],
    inputKind: "integer",
    inputLabel: label("nums", "nums"),
    approach: [
      label("So sánh từng cặp phần tử kề nhau.", "Compare each pair of adjacent values."),
      label("Nếu tăng, kéo dài đoạn tăng và đặt đoạn giảm về 1; nếu giảm thì làm ngược lại.", "If values rise, extend the increasing run and reset the decreasing run to 1; do the opposite when they fall."),
      label("Nếu bằng nhau, cả hai đoạn đều bắt đầu lại từ 1. Cập nhật đáp án sau mỗi bước.", "If values are equal, restart both runs at 1. Update the answer after each comparison."),
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: label("Chỉ cần hai độ dài đang chạy và một đáp án lớn nhất.", "Only two running lengths and one maximum are needed."),
    },
    code: [
      "class Solution:",
      "    def longestMonotonicSubarray(self, nums):",
      "        if not nums:",
      "            return 0",
      "        inc = dec = ans = 1",
      "        for i in range(1, len(nums)):",
      "            inc = (inc + 1) if nums[i] > nums[i - 1] else 1",
      "            dec = (dec + 1) if nums[i] < nums[i - 1] else 1",
      "            ans = max(ans, inc, dec)",
      "        return ans",
    ],
    builder: buildSteps3105,
  },
};
