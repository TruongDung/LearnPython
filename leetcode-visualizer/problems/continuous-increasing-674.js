// LeetCode 674: Longest Continuous Increasing Subsequence — one pass, picture-first.

const label = (vi, en) => ({ vi, en });
const MAX_STEPS = 400;

function buildSteps674(input) {
  const nums = Array.isArray(input)
    ? [...input]
    : String(input ?? "").split(/[\s,;]+/).filter(Boolean).map(Number);
  if (nums.length > 10000 || nums.some((v) => !Number.isInteger(v))) {
    throw new Error("nums must contain at most 10000 integers");
  }
  const n = nums.length;
  const steps = [];
  const runEnds = Array(n).fill(null); // run length ending at each index (null = not scanned yet)
  let best = 0;
  let cur = 0;
  let bestStart = 0;
  let curStart = 0;

  const range = (a, b) => {
    const out = [];
    for (let k = a; k <= b && k < n; k += 1) out.push(k);
    return out;
  };
  const bestRange = () => (best > 0 ? range(bestStart, bestStart + best - 1) : []);

  function record(title, note, codeLine, opts = {}) {
    if (steps.length >= MAX_STEPS && !opts.final) return;
    steps.push({
      title,
      note,
      arr: [...nums],
      highlight: opts.highlight || [],
      mark: opts.mark || [],
      sub: runEnds.map((v) => (v === null ? "" : v)),
      codeLines: [codeLine],
      vars: opts.vars || [],
      final: !!opts.final,
    });
  }

  if (n === 0) {
    record(
      label("nums rỗng → return 0", "nums is empty → return 0"),
      label("Không có phần tử nào.", "There are no elements."),
      4,
      { final: true, vars: [{ name: "answer", value: 0 }] },
    );
    return { original: nums, answer: 0, steps };
  }
  record(
    label(`len(nums) = ${n} > 0`, `len(nums) = ${n} > 0`),
    label("Mảng không rỗng, bắt đầu quét.", "The array is non-empty; start scanning."),
    3,
    { vars: [{ name: "n", value: n }] },
  );

  best = 1;
  cur = 1;
  bestStart = 0;
  curStart = 0;
  runEnds[0] = 1;
  record(
    label("best = cur = 1", "best = cur = 1"),
    label("Phần tử đầu tiên tự nó là đoạn tăng dài 1.", "The first element alone is a run of length 1."),
    5,
    { highlight: [0], mark: [0], vars: [{ name: "best", value: 1 }, { name: "cur", value: 1 }] },
  );

  for (let i = 1; i < n; i += 1) {
    const grows = nums[i] > nums[i - 1];
    record(
      label(`${nums[i]} > ${nums[i - 1]}? ${grows ? "✓" : "✗"}`, `${nums[i]} > ${nums[i - 1]}? ${grows ? "✓" : "✗"}`),
      grows
        ? label("Tăng nghiêm ngặt → đoạn hiện tại dài thêm.", "Strictly increasing → the current run grows.")
        : label("Không tăng → đoạn hiện tại đứt tại đây.", "Not increasing → the current run breaks here."),
      7,
      {
        highlight: [i - 1, i],
        mark: bestRange(),
        vars: [{ name: "i", value: i }, { name: "nums[i]", value: nums[i] }],
      },
    );
    if (grows) {
      cur += 1;
      runEnds[i] = cur;
      record(
        label(`cur += 1 → ${cur}`, `cur += 1 → ${cur}`),
        label("Nối nums[i] vào đoạn đang chạy.", "Append nums[i] to the running segment."),
        8,
        { highlight: range(curStart, i), mark: bestRange(), vars: [{ name: "cur", value: cur }] },
      );
    } else {
      cur = 1;
      curStart = i;
      runEnds[i] = 1;
      record(
        label("cur = 1", "cur = 1"),
        label("Bắt đầu đoạn tăng mới tại nums[i].", "Start a new increasing run at nums[i]."),
        10,
        { highlight: [i], mark: bestRange(), vars: [{ name: "cur", value: 1 }] },
      );
    }
    const improved = cur > best;
    if (improved) {
      best = cur;
      bestStart = curStart;
    }
    record(
      label(`best = max(best, cur) = ${best}`, `best = max(best, cur) = ${best}`),
      improved
        ? label("Phá kỷ lục → đoạn xanh là đoạn tốt nhất mới.", "New record → the green segment is the new best.")
        : label("Chưa phá kỷ lục; đoạn xanh vẫn tốt nhất.", "No record; the green segment stays the best."),
      11,
      { highlight: range(curStart, i), mark: bestRange(), vars: [{ name: "best", value: best }, { name: "cur", value: cur }] },
    );
  }

  record(
    label(`Đáp án: ${best}`, `Answer: ${best}`),
    label(`Đoạn tăng liên tục dài nhất có ${best} phần tử (tô xanh).`, `The longest continuous increasing run has ${best} element(s) (green).`),
    12,
    { final: true, mark: bestRange(), vars: [{ name: "answer", value: best }] },
  );

  return { original: nums, answer: best, steps };
}

module.exports = {
  674: {
    id: 674,
    difficulty: "easy",
    slug: "longest-continuous-increasing-subsequence",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
    ],
    title: label("Longest Continuous Increasing Subsequence", "Longest Continuous Increasing Subsequence"),
    titleVi: label("Dãy con tăng liên tục dài nhất", "Longest continuous increasing subsequence"),
    statement: label(
      "Tìm độ dài dãy con liên tục tăng nghiêm ngặt dài nhất.",
      "Find the length of the longest continuous strictly increasing subsequence.",
    ),
    defaultInput: [1, 3, 5, 4, 7],
    inputKind: "integer",
    inputLabel: label("nums", "nums"),
    approach: [
      label("Quét một lần: cur là độ dài đoạn tăng đang chạy, best là kỷ lục.", "One pass: cur is the running segment length, best is the record."),
      label("nums[i] > nums[i-1] thì cur += 1, ngược lại cur = 1.", "If nums[i] > nums[i-1] then cur += 1, else cur = 1."),
      label("Sau mỗi bước, best = max(best, cur).", "After each step, best = max(best, cur)."),
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: label("Chỉ giữ hai biến cur và best.", "Only two variables, cur and best, are kept."),
    },
    code: [
      "class Solution:",
      "    def findLengthOfLCIS(self, nums):",
      "        if not nums:",
      "            return 0",
      "        best = cur = 1",
      "        for i in range(1, len(nums)):",
      "            if nums[i] > nums[i - 1]:",
      "                cur += 1",
      "            else:",
      "                cur = 1",
      "            best = max(best, cur)",
      "        return best",
    ],
    builder: buildSteps674,
  },
};
