// LeetCode 3350: one pass over maximal strictly increasing runs.

const label = (vi, en) => ({ vi, en });
const MAX_TRACE_STEPS = 700;

function buildSteps3350(input) {
  const nums = Array.isArray(input) ? [...input] : [];
  if (nums.length < 2 || nums.length > 200000
    || nums.some((value) => !Number.isInteger(value) || value < -1e9 || value > 1e9)) {
    throw new Error("nums must contain 2..200000 integers in [-10^9, 10^9]");
  }

  const steps = [];
  let previous = 0;
  let current = 1;
  let best = 0;
  let inside = null;
  let across = null;
  let i = null;
  let candidate = null;
  let witness = null;
  let omitted = false;

  function pair(kind, length) {
    if (length < 1 || i === null) return null;
    const runStart = i - current + 1;
    const leftStart = kind === "inside" ? i - 2 * length + 1 : runStart - length;
    const rightStart = leftStart + length;
    return { kind, k: length, leftStart, rightStart };
  }

  function record(phase, title, line, note, options = {}) {
    if (steps.length >= MAX_TRACE_STEPS && !options.final) {
      omitted = true;
      return;
    }
    const indices = new Set();
    if (nums.length <= 46) {
      for (let index = 0; index < nums.length; index++) indices.add(index);
    } else {
      for (let index = 0; index < Math.min(12, nums.length); index++) indices.add(index);
      for (let index = Math.max(0, (i ?? 0) - 5); index <= Math.min(nums.length - 1, (i ?? 0) + 3); index++) indices.add(index);
      for (const selected of [candidate, witness]) {
        if (!selected) continue;
        for (const start of [selected.leftStart, selected.rightStart]) {
          for (let index = start; index < Math.min(start + 3, nums.length); index++) indices.add(index);
          indices.add(Math.min(start + selected.k - 1, nums.length - 1));
        }
      }
    }
    const stableRun = i !== null && !["visit", "compare", "close"].includes(phase);
    const runStart = stableRun ? i - current + 1 : null;
    const previousRun = phase === "close" ? [i - current, i - 1]
      : previous > 0 && runStart !== null ? [runStart - previous, runStart - 1] : null;
    const cells = [...indices].filter((index) => index >= 0 && index < nums.length)
      .sort((a, b) => a - b).map((index) => ({ index, value: nums[index] }));
    const vars = [
      { name: "previous", value: previous }, { name: "current", value: current },
      { name: "best", value: best },
    ];
    if (i !== null) vars.push({ name: "i", value: i });
    if (inside !== null) vars.push({ name: "inside", value: inside });
    if (across !== null) vars.push({ name: "across", value: across });
    if (options.final) vars.push({ name: "answer", value: best });
    steps.push({
      title, arr: [], highlight: [], mark: [], codeLines: [line], vars, note,
      final: Boolean(options.final),
      adjacentRuns3350View: {
        phase, n: nums.length, i, previous, current, inside, across, best,
        currentRun: runStart === null ? null : [runStart, i], previousRun,
        candidate: candidate ? { ...candidate } : null,
        witness: witness ? { ...witness } : null,
        cells, omitted,
      },
    });
  }

  record("init", label("previous = 0", "previous = 0"), 3,
    label("Chưa có run tăng nào ở bên trái.", "There is no preceding increasing run yet."));
  record("init", label("current = 1", "current = 1"), 4,
    label("Một phần tử tự nó tạo thành run tăng dài 1.", "One element alone forms a run of length 1."));
  record("init", label("best = 0", "best = 0"), 5,
    label("Chưa xét cặp đoạn liền kề nào.", "No adjacent pair has been considered yet."));

  for (let index = 1; index < nums.length; index++) {
    i = index;
    candidate = null;
    inside = null;
    across = null;
    record("visit", label(`Xét nums[${i}] = ${nums[i]}`, `Inspect nums[${i}] = ${nums[i]}`), 6,
      label("So sánh phần tử này với phần tử ngay trước.", "Compare this value with the previous value."));
    const grows = nums[i] > nums[i - 1];
    record("compare", label(`${nums[i]} > ${nums[i - 1]}? ${grows}`, `${nums[i]} > ${nums[i - 1]}? ${grows}`), 7,
      grows
        ? label("Run hiện tại tiếp tục tăng nghiêm ngặt.", "The current run remains strictly increasing.")
        : label("Run cũ kết thúc; bắt đầu run mới tại i.", "The old run ends; a new run starts at i."));
    if (grows) {
      current++;
      record("grow", label(`current = ${current}`, `current = ${current}`), 8,
        label("Nối thêm phần tử vào run hiện tại.", "Extend the current increasing run."));
    } else {
      previous = current;
      record("close", label(`previous = ${previous}`, `previous = ${previous}`), 10,
        label("Lưu độ dài run vừa kết thúc để ghép qua ranh giới.",
          "Keep the just-ended run length for a pair across the boundary."));
      current = 1;
      record("restart", label("current = 1", "current = 1"), 11,
        label("Run mới hiện chỉ chứa nums[i].", "The new run currently contains only nums[i]."));
    }
    inside = Math.floor(current / 2);
    candidate = pair("inside", inside);
    record("inside", label(`Trong một run: k = ${inside}`, `Inside one run: k = ${inside}`), 12,
      label("Một run dài current có thể tách thành hai đoạn liền kề dài ⌊current/2⌋.",
        "A run of length current can be split into two adjacent pieces of length floor(current/2)."));
    across = Math.min(previous, current);
    candidate = pair("across", across);
    record("across", label(`Qua ranh giới: k = ${across}`, `Across the boundary: k = ${across}`), 13,
      label("Lấy phần cuối run trước và phần đầu run hiện tại, mỗi bên dài min(previous,current).",
        "Use the end of the previous run and start of the current run, each of length min(previous,current)."));
    if (inside > best || across > best) {
      candidate = inside >= across ? pair("inside", inside) : pair("across", across);
      witness = { ...candidate };
    } else candidate = null;
    best = Math.max(best, inside, across);
    record("best", label(`best = ${best}`, `best = ${best}`), 14,
      label("Giữ cặp đoạn tốt nhất đã thấy; nếu không tăng, cặp cũ vẫn là đáp án tạm thời.",
        "Keep the best pair seen so far; if k does not improve, the previous pair remains."));
  }

  i = null;
  candidate = null;
  record("done", label(`Đáp án: k = ${best}`, `Answer: k = ${best}`), 15,
    omitted
      ? label("Trace dài đã rút gọn; phép quét và đáp án vẫn được tính đủ.",
        "The long trace was shortened; the scan and answer are still complete.")
      : label("Hai đoạn tô màu trong cặp tốt nhất có cùng độ dài và đứng sát nhau.",
        "The two highlighted best subarrays have equal length and are adjacent."),
    { final: true });
  return { original: nums, answer: best, witness, steps };
}

module.exports = {
  3350: {
    id: 3350,
    difficulty: "medium",
    slug: "adjacent-increasing-subarrays-detection-ii",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "greedy", vi: "Tham lam", en: "Greedy" },
    ],
    title: label("Adjacent Increasing Subarrays Detection II", "Adjacent Increasing Subarrays Detection II"),
    titleVi: label("Hai đoạn tăng liền kề dài nhất", "Longest adjacent increasing subarrays"),
    statement: label(
      "Tìm k lớn nhất sao cho có hai đoạn con tăng nghiêm ngặt, mỗi đoạn dài k và nằm sát nhau.",
      "Find the largest k such that two adjacent subarrays of length k are both strictly increasing."
    ),
    defaultInput: [2, 5, 7, 8, 9, 2, 3, 4, 3, 1],
    inputKind: "integer",
    inputLabel: label("nums", "nums"),
    approach: [
      label("Quét các run tăng nghiêm ngặt; giữ độ dài run hiện tại và run ngay trước.",
        "Scan strictly increasing runs, retaining only the current and preceding lengths."),
      label("Hai đoạn có thể cùng nằm trong một run: k = ⌊current/2⌋.",
        "Both subarrays can lie inside one run: k = floor(current/2)."),
      label("Hoặc chúng nằm ở hai bên ranh giới run: k = min(previous,current). Lấy max của hai trường hợp.",
        "Or they straddle a run boundary: k = min(previous,current). Take the maximum of both cases."),
    ],
    complexity: {
      time: "O(n)", space: "O(1)",
      note: label("Lời giải chỉ giữ vài biến; trace học tập và các ô hiển thị không tính vào bộ nhớ thuật toán.",
        "The solution keeps only a few variables; teaching trace and display cells are excluded from algorithmic space."),
    },
    code: [
      "class Solution:",
      "    def maxIncreasingSubarrays(self, nums):",
      "        previous = 0",
      "        current = 1",
      "        best = 0",
      "        for i in range(1, len(nums)):",
      "            if nums[i] > nums[i - 1]:",
      "                current += 1",
      "            else:",
      "                previous = current",
      "                current = 1",
      "            inside = current // 2",
      "            across = min(previous, current)",
      "            best = max(best, inside, across)",
      "        return best",
    ],
    builder: buildSteps3350,
  },
};
