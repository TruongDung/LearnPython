"use strict";

const text = (vi, en) => ({ vi, en });
const MAX_INTERVALS_1851 = 9;
const MAX_QUERIES_1851 = 8;
const MAX_VALUE_1851 = 10_000_000;

const SOURCE_1851 = [
  "from typing import List",
  "from heapq import heappush, heappop",
  "",
  "class Solution:",
  "    def minInterval(self, intervals: List[List[int]], queries: List[int]) -> List[int]:",
  "        intervals.sort()",
  "        ordered_queries = sorted((query, index) for index, query in enumerate(queries))",
  "        answer = [-1] * len(queries)",
  "        heap = []  # (length, right)",
  "        interval_index = 0",
  "",
  "        for query, query_index in ordered_queries:",
  "            while interval_index < len(intervals) and intervals[interval_index][0] <= query:",
  "                left, right = intervals[interval_index]",
  "                heappush(heap, (right - left + 1, right))",
  "                interval_index += 1",
  "            while heap and heap[0][1] < query:",
  "                heappop(heap)",
  "            if heap:",
  "                answer[query_index] = heap[0][0]",
  "        return answer",
];

function parseInput1851(input) {
  let value = input;
  if (typeof input === "string") {
    try {
      value = JSON.parse(input);
    } catch (_error) {
      throw new Error('1851: enter JSON like {"intervals":[[1,4],[2,4]],"queries":[2,3]}.');
    }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("1851: input must contain intervals and queries arrays.");
  }
  const { intervals, queries } = value;
  if (!Array.isArray(intervals) || intervals.length < 1 || intervals.length > MAX_INTERVALS_1851) {
    throw new Error(`1851: enter 1–${MAX_INTERVALS_1851} intervals.`);
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > MAX_QUERIES_1851) {
    throw new Error(`1851: enter 1–${MAX_QUERIES_1851} queries.`);
  }
  const parsedIntervals = intervals.map((interval, index) => {
    if (!Array.isArray(interval) || interval.length !== 2
      || interval.some((number) => !Number.isSafeInteger(number) || number < 1 || number > MAX_VALUE_1851)
      || interval[0] > interval[1]) {
      throw new Error(`1851: interval ${index + 1} must be [left, right] with 1 ≤ left ≤ right ≤ ${MAX_VALUE_1851}.`);
    }
    return [...interval];
  });
  if (queries.some((query) => !Number.isSafeInteger(query) || query < 1 || query > MAX_VALUE_1851)) {
    throw new Error(`1851: every query must be an integer from 1 to ${MAX_VALUE_1851}.`);
  }
  return { intervals: parsedIntervals, queries: [...queries] };
}

function buildSteps1851(input) {
  const { intervals, queries } = parseInput1851(input);
  const orderedIntervals = intervals.map(([left, right], originalIndex) => ({
    id: originalIndex,
    left,
    right,
    length: right - left + 1,
  })).sort((first, second) => first.left - second.left || first.right - second.right || first.id - second.id);
  const orderedQueries = queries.map((query, originalIndex) => ({ query, originalIndex }))
    .sort((first, second) => first.query - second.query || first.originalIndex - second.originalIndex);
  const answers = Array(queries.length).fill(null);
  const heap = [];
  const steps = [];
  let intervalIndex = 0;
  let queryOrderIndex = null;
  let activeIntervalId = null;
  let poppedIntervalId = null;

  const compare = (first, second) => first.length - second.length
    || first.right - second.right || first.left - second.left || first.id - second.id;
  const snapshotHeap = () => heap.map((item) => ({ ...item }));

  function emit(event, title, codeLines, { final = false } = {}) {
    const currentQuery = queryOrderIndex === null ? null : orderedQueries[queryOrderIndex];
    steps.push({
      title,
      note: text("", ""),
      codeLines,
      final,
      arr: queries.map((query) => query),
      highlight: currentQuery ? [currentQuery.originalIndex] : [],
      mark: [],
      vars: [
        { name: "q", value: currentQuery?.query ?? "—" },
        { name: "next interval", value: intervalIndex },
        { name: "heap size", value: heap.length },
        { name: "answer", value: answers.map((answer) => answer ?? "?").join(", ") },
      ],
      minimumInterval1851View: {
        event,
        intervals: orderedIntervals.map((interval) => ({ ...interval })),
        queries: [...queries],
        orderedQueries: orderedQueries.map((query) => ({ ...query })),
        answers: [...answers],
        heap: snapshotHeap(),
        intervalIndex,
        queryOrderIndex,
        activeIntervalId,
        poppedIntervalId,
        final,
        answer: final ? [...answers] : null,
      },
    });
  }

  emit("sort", text("Xếp đoạn và query từ trái sang phải", "Sort intervals and queries left to right"), [6, 7, 8]);

  orderedQueries.forEach((current, orderIndex) => {
    queryOrderIndex = orderIndex;
    activeIntervalId = null;
    poppedIntervalId = null;
    emit("query", text(`Đặt kim tại q = ${current.query}`, `Place the needle at q = ${current.query}`), [12]);

    while (intervalIndex < orderedIntervals.length && orderedIntervals[intervalIndex].left <= current.query) {
      const interval = orderedIntervals[intervalIndex];
      activeIntervalId = interval.id;
      emit("eligible", text(`Đoạn [${interval.left}, ${interval.right}] đã chạm q`, `Interval [${interval.left}, ${interval.right}] reaches q`), [13, 14]);
      heap.push(interval);
      heap.sort(compare);
      intervalIndex += 1;
      emit("push", text(`Đưa độ dài ${interval.length} vào heap`, `Push length ${interval.length} into the heap`), [15, 16]);
    }
    activeIntervalId = null;

    while (heap.length && heap[0].right < current.query) {
      poppedIntervalId = heap[0].id;
      emit("expired", text(`Root kết thúc trước ${current.query}`, `The root ends before ${current.query}`), [17]);
      const removed = heap.shift();
      emit("pop", text(`Bỏ đoạn [${removed.left}, ${removed.right}]`, `Drop interval [${removed.left}, ${removed.right}]`), [18]);
    }
    poppedIntervalId = null;

    if (heap.length) {
      answers[current.originalIndex] = heap[0].length;
      emit("answer", text(`Root ngắn nhất = ${heap[0].length}`, `Shortest root = ${heap[0].length}`), [19, 20]);
    } else {
      answers[current.originalIndex] = -1;
      emit("empty", text("Không đoạn nào phủ q", "No interval covers q"), [19]);
    }
  });

  queryOrderIndex = null;
  activeIntervalId = null;
  poppedIntervalId = null;
  emit("done", text("Đặt đáp án về thứ tự query ban đầu", "Restore the original query order"), [21], { final: true });
  return { original: { intervals, queries }, answer: answers, steps };
}

const DEFAULT_INPUT_1851 = {
  intervals: [[1, 4], [2, 4], [3, 6], [4, 4]],
  queries: [2, 3, 4, 5],
};

module.exports = {
  1851: {
    id: 1851,
    difficulty: "hard",
    slug: "minimum-interval-to-include-each-query",
    category: { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" },
    tags: [
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
      { key: "heap", vi: "Heap", en: "Heap" },
      { key: "offline-query", vi: "Query offline", en: "Offline Query" },
    ],
    title: text("Minimum Interval to Include Each Query", "Minimum Interval to Include Each Query"),
    titleVi: text("Khoảng ngắn nhất chứa mỗi query", "Minimum interval containing each query"),
    statement: text(
      `Với mỗi query, tìm độ dài nhỏ nhất của một khoảng đóng chứa query đó; trả -1 nếu không có. Visualization hỗ trợ tối đa ${MAX_INTERVALS_1851} khoảng và ${MAX_QUERIES_1851} query.`,
      `For each query, return the smallest length of an inclusive interval containing it, or -1 if none exists. This visualization supports up to ${MAX_INTERVALS_1851} intervals and ${MAX_QUERIES_1851} queries.`,
    ),
    inputKind: "string",
    inputLabel: text(
      'JSON: {"intervals":[[1,4],[2,4]],"queries":[2,3]}',
      'JSON: {"intervals":[[1,4],[2,4]],"queries":[2,3]}',
    ),
    defaultInput: JSON.stringify(DEFAULT_INPUT_1851),
    debugMode: "line-by-line",
    approach: [
      text("Sắp xếp interval theo đầu trái và query theo giá trị.", "Sort intervals by left endpoint and queries by value."),
      text("Khi kim tới q, đưa mọi interval có left ≤ q vào min-heap theo độ dài.", "At q, push every interval with left ≤ q into a min-heap by length."),
      text("Bỏ root đã hết hạn (right < q); root còn lại là đoạn ngắn nhất phủ q.", "Remove expired roots (right < q); the remaining root is the shortest interval covering q."),
    ],
    complexity: {
      time: "O((n + q) log n)",
      space: "O(n + q)",
      note: text("Mỗi interval vào và ra heap nhiều nhất một lần.", "Each interval enters and leaves the heap at most once."),
    },
    code: SOURCE_1851,
    builder: buildSteps1851,
    liveArgs: (input) => {
      const { intervals, queries } = parseInput1851(input);
      return [intervals, queries];
    },
  },
};
