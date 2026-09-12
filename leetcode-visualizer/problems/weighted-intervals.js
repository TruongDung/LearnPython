// LeetCode 3414 — Maximum Score of Non-overlapping Intervals.
// Weighted interval scheduling with a four-column DP and lexicographic ties.

const DP_CATEGORY = { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" };
const DP_TAG = { key: "dynamic-programming", vi: "Quy hoạch động", en: "Dynamic Programming" };
const BINARY_SEARCH_TAG = { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" };
const SORTING_TAG = { key: "sorting", vi: "Sắp xếp", en: "Sorting" };
const INTERVAL_TAG = { key: "interval", vi: "Đoạn", en: "Interval" };

function parseIntervals3414(input) {
  const message = "Enter 1–12 intervals as l,r,w; l,r,w or as a JSON array [[l,r,w],...].";
  let intervals = input;
  if (!Array.isArray(intervals)) {
    const raw = String(input ?? "").trim();
    if (!raw) throw new Error(message);
    if (raw.startsWith("[")) {
      try {
        intervals = JSON.parse(raw);
      } catch (_error) {
        throw new Error(message);
      }
    } else {
      intervals = raw.split(";").map((part) => part.split(",").map((value) => Number(value.trim())));
    }
  }
  if (!Array.isArray(intervals) || intervals.length < 1 || intervals.length > 12
      || intervals.some((interval) => !Array.isArray(interval) || interval.length !== 3
        || interval.some((value) => !Number.isInteger(Number(value)))
        || Number(interval[0]) < 1 || Number(interval[0]) > Number(interval[1])
        || Number(interval[2]) < 1)) {
    throw new Error(message);
  }
  return intervals.map((interval) => interval.map(Number));
}

function lexCompare(left, right) {
  const size = Math.min(left.length, right.length);
  for (let index = 0; index < size; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return left.length - right.length;
}

function better3414(left, right) {
  if (left.score !== right.score) return left.score > right.score ? left : right;
  return lexCompare(left.picks, right.picks) <= 0 ? left : right;
}

function buildSteps3414(input) {
  const original = parseIntervals3414(input);
  const sorted = original
    .map(([start, end, weight], id) => ({ id, start, end, weight, prev: null }))
    .sort((a, b) => a.end - b.end || a.start - b.start || a.weight - b.weight || a.id - b.id);
  const ends = sorted.map((interval) => interval.end);
  const predecessors = new Array(sorted.length).fill(null);
  const dp = Array.from({ length: sorted.length + 1 }, () => Array(5).fill(null));
  for (let capacity = 0; capacity <= 4; capacity += 1) dp[0][capacity] = { score: 0, picks: [] };
  for (let row = 1; row <= sorted.length; row += 1) dp[row][0] = { score: 0, picks: [] };
  const steps = [];
  const stages = [
    { vi: "Sort theo end", en: "Sort by end" },
    { vi: "Tìm prev", en: "Find prev" },
    { vi: "DP Take / Skip", en: "DP Take / Skip" },
    { vi: "Trả đáp án", en: "Return answer" },
  ];

  const cloneCandidate = (candidate) => candidate ? { score: candidate.score, picks: [...candidate.picks] } : null;
  const snapshot = ({
    phase, stage, event, codeLines, title, note, activeRow = null, prevRow = null,
    activeCapacity = null, decision = null, final = false,
  }) => {
    const answer = dp[sorted.length][4];
    steps.push({
      title, note, codeLines, final,
      arr: sorted.map((interval) => interval.weight),
      highlight: Number.isInteger(activeRow) ? [activeRow] : [],
      mark: [],
      vars: [
        { name: "i", value: Number.isInteger(activeRow) ? activeRow : "—" },
        { name: "k", value: Number.isInteger(activeCapacity) ? activeCapacity : "—" },
        { name: "prev[i]", value: Number.isInteger(activeRow) ? (predecessors[activeRow] ?? "—") : "—" },
        { name: "best score", value: decision?.winner?.score ?? answer?.score ?? 0 },
        { name: "indices", value: decision?.winner ? [...decision.winner.picks] : answer ? [...answer.picks] : [] },
      ],
      weightedIntervals3414View: {
        stages,
        stage,
        phase,
        event,
        original: original.map((interval) => [...interval]),
        intervals: sorted.map((interval, row) => ({ ...interval, prev: predecessors[row] })),
        predecessors: [...predecessors],
        dp: dp.map((dpRow) => dpRow.map(cloneCandidate)),
        activeRow,
        prevRow,
        activeCapacity,
        decision: decision ? {
          skip: cloneCandidate(decision.skip),
          take: cloneCandidate(decision.take),
          winner: cloneCandidate(decision.winner),
          choice: decision.choice,
          reason: decision.reason,
        } : null,
        answer: final && answer ? [...answer.picks] : null,
        answerScore: final && answer ? answer.score : null,
      },
    });
  };

  snapshot({
    phase: "sort", stage: 0, event: "sort", codeLines: [4],
    title: { vi: "Sort các interval theo điểm kết thúc", en: "Sort intervals by ending point" },
    note: {
      vi: `Nhãn # giữ index gốc. Sau sort: ${sorted.map((interval) => `#${interval.id}[${interval.start},${interval.end}]`).join(" · ")}.`,
      en: `The # labels retain original indices. Sorted order: ${sorted.map((interval) => `#${interval.id}[${interval.start},${interval.end}]`).join(" · ")}.`,
    },
  });

  for (let index = 0; index < sorted.length; index += 1) {
    const interval = sorted[index];
    let low = 0;
    let high = index;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (ends[middle] < interval.start) low = middle + 1;
      else high = middle;
    }
    const predecessor = low - 1;
    predecessors[index] = predecessor;
    sorted[index].prev = predecessor;
    snapshot({
      phase: "predecessor", stage: 1, event: "find-prev", codeLines: [6], activeRow: index,
      prevRow: predecessor >= 0 ? predecessor : null,
      title: predecessor >= 0
        ? { vi: `prev[${index}] = ${predecessor}`, en: `prev[${index}] = ${predecessor}` }
        : { vi: `prev[${index}] = −1`, en: `prev[${index}] = −1` },
      note: predecessor >= 0
        ? {
          vi: `#${sorted[predecessor].id} kết thúc ở ${sorted[predecessor].end} < ${interval.start}, nên là interval tương thích gần nhất trước #${interval.id}.`,
          en: `#${sorted[predecessor].id} ends at ${sorted[predecessor].end} < ${interval.start}, so it is the nearest compatible interval before #${interval.id}.`,
        }
        : {
          vi: `Không có end < ${interval.start}. Dùng dấu < nghiêm ngặt vì hai interval chạm biên vẫn bị xem là overlap.`,
          en: `No ending point is < ${interval.start}. The strict < matters because intervals touching at a boundary still overlap.`,
        },
    });
  }

  snapshot({
    phase: "initialize", stage: 2, event: "init-dp", codeLines: [7],
    title: { vi: "Khởi tạo hàng DP rỗng", en: "Initialize the empty DP row" },
    note: {
      vi: "dp[i][k] lưu lựa chọn tốt nhất khi chỉ dùng i interval đầu trong thứ tự đã sort và được chọn tối đa k interval.",
      en: "dp[i][k] stores the best choice using only the first i intervals in sorted order and selecting at most k intervals.",
    },
  });

  for (let index = 0; index < sorted.length; index += 1) {
    const interval = sorted[index];
    for (let capacity = 1; capacity <= 4; capacity += 1) {
      const skip = dp[index][capacity];
      const base = dp[predecessors[index] + 1][capacity - 1];
      const take = {
        score: base.score + interval.weight,
        picks: [...base.picks, interval.id].sort((a, b) => a - b),
      };
      const winner = better3414(skip, take);
      const choice = winner === take ? "take" : "skip";
      let reason;
      if (skip.score !== take.score) reason = choice === "take" ? "higher-score" : "lower-score";
      else reason = choice === "take" ? "lexicographically-smaller-take" : "lexicographically-smaller-skip";
      dp[index + 1][capacity] = cloneCandidate(winner);
      snapshot({
        phase: "dp", stage: 2, event: choice, codeLines: [19],
        activeRow: index, prevRow: predecessors[index] >= 0 ? predecessors[index] : null,
        activeCapacity: capacity, decision: { skip, take, winner, choice, reason },
        title: choice === "take"
          ? { vi: `dp[${index + 1}][${capacity}]: TAKE #${interval.id}`, en: `dp[${index + 1}][${capacity}]: TAKE #${interval.id}` }
          : { vi: `dp[${index + 1}][${capacity}]: SKIP #${interval.id}`, en: `dp[${index + 1}][${capacity}]: SKIP #${interval.id}` },
        note: skip.score === take.score
          ? {
            vi: `Cùng score ${skip.score}; so [${skip.picks.join(",")}] với [${take.picks.join(",")}], giữ mảng index nhỏ hơn theo thứ tự từ điển.`,
            en: `Both score ${skip.score}; compare [${skip.picks.join(",")}] with [${take.picks.join(",")}], keeping the lexicographically smaller index array.`,
          }
          : {
            vi: `SKIP được ${skip.score}; TAKE lấy dp[${predecessors[index] + 1}][${capacity - 1}] + ${interval.weight} = ${take.score}. Chọn score lớn hơn.`,
            en: `SKIP scores ${skip.score}; TAKE uses dp[${predecessors[index] + 1}][${capacity - 1}] + ${interval.weight} = ${take.score}. Keep the larger score.`,
          },
      });
    }
  }

  const result = dp[sorted.length][4];
  snapshot({
    phase: "done", stage: 3, event: "done", codeLines: [20], final: true,
    title: { vi: `Đáp án [${result.picks.join(", ")}] · score ${result.score}`, en: `Answer [${result.picks.join(", ")}] · score ${result.score}` },
    note: {
      vi: "Các index được trả theo thứ tự tăng dần; nếu nhiều lựa chọn cùng tổng trọng số, DP đã giữ mảng nhỏ nhất theo thứ tự từ điển.",
      en: "Returned indices are sorted increasingly; whenever total weights tied, the DP retained the lexicographically smallest array.",
    },
  });
  return { input, original, answer: [...result.picks], score: result.score, steps };
}

module.exports = {
  3414: {
    id: 3414,
    difficulty: "hard",
    slug: "maximum-score-of-non-overlapping-intervals",
    category: DP_CATEGORY,
    tags: [DP_TAG, BINARY_SEARCH_TAG, SORTING_TAG, INTERVAL_TAG],
    title: { vi: "Maximum Score of Non-overlapping Intervals", en: "Maximum Score of Non-overlapping Intervals" },
    titleVi: { vi: "Tổng điểm lớn nhất của các interval không chồng nhau", en: "Maximum score from non-overlapping intervals" },
    statement: {
      vi: "Cho intervals[i] = [lᵢ, rᵢ, weightᵢ]. Chọn tối đa 4 interval không chồng nhau để tổng weight lớn nhất; nếu hòa, trả mảng index nhỏ nhất theo thứ tự từ điển. Hai interval chạm chung một điểm vẫn overlap.",
      en: "Given intervals[i] = [lᵢ, rᵢ, weightᵢ], choose at most four non-overlapping intervals with maximum total weight; on ties, return the lexicographically smallest index array. Intervals sharing a point still overlap.",
    },
    defaultInput: "1,3,2;4,5,2;1,5,5;6,9,3;6,7,1;8,9,1",
    inputKind: "string",
    inputLabel: { vi: "intervals: l,r,weight; …", en: "intervals: l,r,weight; …" },
    extraParams: [],
    approach: [
      { vi: "Gắn index gốc rồi sort interval theo end tăng dần.", en: "Attach original indices, then sort intervals by increasing end." },
      { vi: "Dùng binary search tìm prev[i]: interval cuối có end < start[i].", en: "Use binary search to find prev[i], the last interval with end < start[i]." },
      { vi: "DP với k = 1..4: SKIP interval i hoặc TAKE nó sau trạng thái prev[i].", en: "For k = 1..4, DP either SKIPs interval i or TAKEs it after state prev[i]." },
      { vi: "So sánh theo score trước, rồi theo mảng index tăng dần để xử lý tie-break.", en: "Compare by score first, then by the sorted index array for lexicographic tie-breaking." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: { vi: "Sort và n lần binary search chi phối; bảng DP chỉ có 5 cột.", en: "Sorting and n binary searches dominate; the DP table has only five columns." },
    },
    code: [
      "from bisect import bisect_left",
      "class Solution:",
      "    def maximumWeight(self, intervals):",
      "        items = sorted((r, l, w, i) for i, (l, r, w) in enumerate(intervals))",
      "        ends = [r for r, l, w, i in items]",
      "        prev = [bisect_left(ends, l) - 1 for r, l, w, i in items]",
      "        dp = [[(0, []) for _ in range(5)] for _ in range(len(items) + 1)]",
      "",
      "        def better(a, b):",
      "            if a[0] != b[0]:",
      "                return a if a[0] > b[0] else b",
      "            return a if a[1] < b[1] else b",
      "",
      "        for i, (r, l, w, original_i) in enumerate(items):",
      "            for k in range(1, 5):",
      "                skip = dp[i][k]",
      "                score, picked = dp[prev[i] + 1][k - 1]",
      "                take = (score + w, sorted(picked + [original_i]))",
      "                dp[i + 1][k] = better(skip, take)",
      "        return dp[len(items)][4][1]",
    ],
    liveArgs: (input) => [parseIntervals3414(input)],
    builder: buildSteps3414,
  },
};
