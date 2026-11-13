"use strict";

// LeetCode 2406 — Divide Intervals Into Minimum Number of Groups.
// Sort + min-heap of group end times, traced one executed Python line per step.
// Picture lives in public/renderer-min-groups-2406.js (groups = colored lanes on a number line).

const MAX_INTERVALS_2406 = 10;
const MAX_VALUE_2406 = 1_000_000;
const MAX_SPAN_2406 = 40;
const DEFAULT_INPUT_2406 = "[[5,8],[1,4],[7,10],[2,6],[11,13],[4,7],[3,5],[10,12],[6,9]]";

const SOURCE_2406 = Object.freeze([
  "import heapq",
  "from typing import List",
  "",
  "class Solution:",
  "    def minGroups(self, intervals: List[List[int]]) -> int:",
  "        intervals.sort()",
  "        ends = []  # min-heap: end of each group",
  "        for left, right in intervals:",
  "            if ends and ends[0] < left:",
  "                heapq.heappop(ends)",
  "            heapq.heappush(ends, right)",
  "        return len(ends)",
]);

const bi = (vi, en) => ({ vi, en });

function parseInput2406(input) {
  let value = input;
  if (typeof input === "string") {
    try {
      value = JSON.parse(input.trim());
    } catch (_error) {
      throw new Error("2406: enter intervals like [[1,4],[2,6],[5,8]].");
    }
  }
  if (value && !Array.isArray(value) && typeof value === "object") value = value.intervals;
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_INTERVALS_2406) {
    throw new Error(`2406: enter 1–${MAX_INTERVALS_2406} intervals.`);
  }
  const intervals = value.map((pair, index) => {
    if (!Array.isArray(pair) || pair.length !== 2
      || pair.some((number) => !Number.isSafeInteger(number) || number < 1 || number > MAX_VALUE_2406)
      || pair[0] > pair[1]) {
      throw new Error(`2406: interval ${index + 1} must be [left, right] with 1 ≤ left ≤ right ≤ ${MAX_VALUE_2406}.`);
    }
    return [pair[0], pair[1]];
  });
  const lo = Math.min(...intervals.map((pair) => pair[0]));
  const hi = Math.max(...intervals.map((pair) => pair[1]));
  if (hi - lo + 1 > MAX_SPAN_2406) {
    throw new Error(`2406: the number line is drawn cell by cell; keep max(right) − min(left) + 1 ≤ ${MAX_SPAN_2406}.`);
  }
  return intervals;
}

// Python's heapq on group ends; each entry also carries its group id for the picture.
// Comparisons look at `end` only, so the end values sit exactly where Python puts them.
function heapPush(heap, item) {
  heap.push(item);
  let pos = heap.length - 1;
  while (pos > 0) {
    const parent = (pos - 1) >> 1;
    if (item.end < heap[parent].end) {
      heap[pos] = heap[parent];
      pos = parent;
    } else break;
  }
  heap[pos] = item;
}

function heapPop(heap) {
  const last = heap.pop();
  if (!heap.length) return last;
  const top = heap[0];
  heap[0] = last;
  const end = heap.length;
  let pos = 0;
  let child = 1;
  while (child < end) {
    const right = child + 1;
    if (right < end && !(heap[child].end < heap[right].end)) child = right;
    heap[pos] = heap[child];
    pos = child;
    child = 2 * pos + 1;
  }
  heap[pos] = last;
  while (pos > 0) {
    const parent = (pos - 1) >> 1;
    if (last.end < heap[parent].end) {
      heap[pos] = heap[parent];
      pos = parent;
    } else break;
  }
  heap[pos] = last;
  return top;
}

// Largest number of intervals covering one integer point (the answer), and the first such point.
function peakOverlap2406(intervals) {
  let best = { point: null, count: 0 };
  const points = [...new Set(intervals.map((pair) => pair[0]))].sort((a, b) => a - b);
  for (const point of points) {
    const count = intervals.filter(([left, right]) => left <= point && point <= right).length;
    if (count > best.count) best = { point, count };
  }
  return best;
}

function buildSteps2406(input) {
  const raw = parseInput2406(input);
  const items = raw.map(([left, right], id) => ({ id, left, right, group: null }));
  const sorted = [...items].sort((a, b) => a.left - b.left || a.right - b.right || a.id - b.id);
  const steps = [];
  const heap = [];
  let isSorted = false;
  let current = null;
  let groups = 0;
  const show = (list) => `[${list.join(", ")}]`;

  const emit = ({ line, event, title, note, condition = null, popped = null, pushed = null, final = false, peak = null }) => {
    const order = isSorted ? sorted : items;
    const cur = current === null ? null : sorted[current];
    steps.push({
      title,
      note,
      arr: [],
      highlight: [],
      mark: [],
      codeLines: [line],
      vars: [
        { name: "left", value: cur ? cur.left : "—" },
        { name: "right", value: cur ? cur.right : "—" },
        { name: "ends", value: show(heap.map((entry) => entry.end)) },
        { name: "len(ends)", value: heap.length },
      ],
      final,
      minGroups2406View: JSON.parse(JSON.stringify({
        version: 1,
        problemId: 2406,
        line,
        event,
        condition,
        sorted: isSorted,
        intervals: order.map(({ id, left, right, group }) => ({ id, left, right, group })),
        current: cur ? cur.id : null,
        heap: heap.map(({ end, group }) => ({ end, group })),
        popped,
        pushed,
        groups,
        peak,
        final,
      })),
    });
  };

  emit({ line: 1, event: "import", title: bi("import heapq", "import heapq"), note: bi("Dùng heap của Python.", "Python's heap module.") });
  emit({ line: 2, event: "import", title: bi("from typing import List", "from typing import List"), note: bi("Kiểu List.", "Type hints.") });
  emit({ line: 4, event: "class", title: bi("class Solution", "class Solution"), note: bi("Định nghĩa lớp.", "Class defined.") });
  emit({ line: 5, event: "call", title: bi("Gọi minGroups", "Call minGroups"), note: bi(`${raw.length} đoạn, chưa xếp.`, `${raw.length} intervals, unsorted.`) });
  isSorted = true;
  emit({ line: 6, event: "sort", title: bi("intervals.sort()", "intervals.sort()"), note: bi("Xếp theo left.", "Sorted by left.") });
  emit({ line: 7, event: "init", title: bi("ends = []", "ends = []"), note: bi("Heap: điểm cuối mỗi nhóm.", "Heap: end of each group.") });

  sorted.forEach((item, index) => {
    current = index;
    emit({ line: 8, event: "for", title: bi(`Xét [${item.left}, ${item.right}]`, `Take [${item.left}, ${item.right}]`), note: bi(`Xét [${item.left},${item.right}].`, `Take [${item.left},${item.right}].`) });
    const free = heap.length > 0 && heap[0].end < item.left;
    const top = heap.length ? heap[0] : null;
    emit({
      line: 9,
      event: "check",
      condition: free,
      title: bi("if ends and ends[0] < left", "if ends and ends[0] < left"),
      note: !top
        ? bi("Heap rỗng → False.", "Heap empty → False.")
        : free
          ? bi(`G${top.group + 1} đã xong → True.`, `G${top.group + 1} is done → True.`)
          : bi("Còn trùng → False.", "Still overlaps → False."),
    });
    let group;
    let popped = null;
    if (free) {
      popped = heapPop(heap);
      group = popped.group;
      emit({ line: 10, event: "pop", popped, title: bi("heapq.heappop(ends)", "heapq.heappop(ends)"), note: bi(`Lấy G${group + 1} ra để dùng lại.`, `Pop G${group + 1} to reuse it.`) });
    } else {
      group = groups;
      groups += 1;
    }
    item.group = group;
    heapPush(heap, { end: item.right, group });
    emit({
      line: 11,
      event: popped ? "push-reuse" : "push-new",
      popped,
      pushed: group,
      title: bi("heapq.heappush(ends, right)", "heapq.heappush(ends, right)"),
      note: popped
        ? bi(`G${group + 1}: end → ${item.right}.`, `G${group + 1}: end → ${item.right}.`)
        : bi(`Nhóm mới G${group + 1}, end ${item.right}.`, `New G${group + 1}, end ${item.right}.`),
    });
  });

  current = null;
  const peak = peakOverlap2406(raw);
  emit({
    line: 12,
    event: "return",
    final: true,
    peak,
    title: bi(`return ${heap.length}`, `return ${heap.length}`),
    note: bi(`Cần ${heap.length} nhóm.`, `${heap.length} groups needed.`),
  });
  return { input, answer: heap.length, steps };
}

module.exports = {
  2406: {
    id: 2406,
    difficulty: "medium",
    slug: "divide-intervals-into-minimum-number-of-groups",
    category: { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" },
    tags: [
      { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" },
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
      { key: "greedy", vi: "Tham lam", en: "Greedy" },
    ],
    title: { vi: "Divide Intervals Into Minimum Number of Groups", en: "Divide Intervals Into Minimum Number of Groups" },
    titleVi: { vi: "Chia đoạn vào ít nhóm nhất", en: "Fewest groups of non-overlapping intervals" },
    statement: {
      vi: "Cho các đoạn đóng [left, right]. Chia vào ít nhóm nhất sao cho trong mỗi nhóm không có hai đoạn giao nhau (chung cả một điểm cũng là giao). Visualization: tối đa 10 đoạn, max(right) − min(left) + 1 ≤ 40.",
      en: "Given closed intervals [left, right], split them into the fewest groups so no two intervals in a group intersect (sharing one point counts). Visualization: up to 10 intervals, max(right) − min(left) + 1 ≤ 40.",
    },
    defaultInput: DEFAULT_INPUT_2406,
    inputKind: "string",
    inputLabel: { vi: "intervals: [[left,right], ...]", en: "intervals: [[left,right], ...]" },
    extraParams: [],
    debugMode: "line-by-line",
    approach: [
      { vi: "Xếp đoạn theo left.", en: "Sort intervals by left." },
      { vi: "Min-heap giữ điểm cuối của mỗi nhóm; ends[0] là nhóm xong sớm nhất.", en: "A min-heap keeps each group's end; ends[0] is the group that finishes first." },
      { vi: "Nếu ends[0] < left: nhóm đó đã xong, pop rồi push right (dùng lại). Nếu không: push right (nhóm mới).", en: "If ends[0] < left that group is done: pop, then push right (reuse). Otherwise push right (new group)." },
      { vi: "Số phần tử trong heap = số nhóm = số đoạn chồng nhau nhiều nhất tại một điểm.", en: "Heap size = groups = the most intervals overlapping at one point." },
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      note: { vi: "Sắp xếp O(n log n); mỗi đoạn push một lần, pop tối đa một lần.", en: "Sorting is O(n log n); each interval is pushed once and popped at most once." },
    },
    code: [...SOURCE_2406],
    builder: buildSteps2406,
    liveArgs: (input) => [parseInput2406(input)],
  },
};

Object.defineProperty(module.exports, "__internals2406", {
  value: { parseInput2406, peakOverlap2406, SOURCE_2406, MAX_SPAN_2406 },
  enumerable: false,
});
