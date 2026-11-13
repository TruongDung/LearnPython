"use strict";

// LeetCode 1094 — Car Pooling.
// Difference array over stops 0..last, then a running sum compared with capacity, traced one executed Python line per step.
// Picture lives in public/renderer-car-pooling-1094.js (trip bars, diff cells with +/-, passengers-in-car bars, capacity line).

const MAX_TRIPS_1094 = 8;
const MAX_PASSENGERS_1094 = 9;
const MAX_STOP_1094 = 16; // the picture draws one cell per stop 0..last
const MAX_CAPACITY_1094 = 99;
const DEFAULT_CAPACITY_1094 = 6;
const DEFAULT_INPUT_1094 = "[[2,0,4],[3,1,6],[1,3,8],[4,6,12],[1,7,10],[1,9,14],[1,11,16]]";

const SOURCE_1094 = Object.freeze([
  "from typing import List",
  "",
  "class Solution:",
  "    def carPooling(self, trips: List[List[int]], capacity: int) -> bool:",
  "        last = max(end for _, _, end in trips)",
  "        diff = [0] * (last + 1)",
  "        for num, start, end in trips:",
  "            diff[start] += num",
  "            diff[end] -= num",
  "        curr = 0",
  "        for i in range(last + 1):",
  "            curr += diff[i]",
  "            if curr > capacity:",
  "                return False",
  "        return True",
]);

const bi = (vi, en) => ({ vi, en });

function parseInput1094(input, params = {}) {
  let value = input;
  let capacity = params && params.capacity !== undefined ? params.capacity : undefined;
  if (typeof input === "string") {
    try {
      value = JSON.parse(input.trim());
    } catch (_error) {
      throw new Error("1094: enter trips like [[2,1,5],[3,3,7]].");
    }
  }
  if (value && !Array.isArray(value) && typeof value === "object") {
    if (capacity === undefined) capacity = value.capacity;
    value = value.trips;
  }
  if (capacity === undefined) capacity = DEFAULT_CAPACITY_1094;
  capacity = Number(capacity);
  if (!Number.isSafeInteger(capacity) || capacity < 1 || capacity > MAX_CAPACITY_1094) {
    throw new Error(`1094: capacity must be an integer 1–${MAX_CAPACITY_1094}.`);
  }
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_TRIPS_1094) {
    throw new Error(`1094: enter 1–${MAX_TRIPS_1094} trips.`);
  }
  const trips = value.map((trip, index) => {
    if (!Array.isArray(trip) || trip.length !== 3 || trip.some((n) => !Number.isSafeInteger(n))
      || trip[0] < 1 || trip[0] > MAX_PASSENGERS_1094
      || trip[1] < 0 || trip[1] >= trip[2] || trip[2] > MAX_STOP_1094) {
      throw new Error(`1094: trip ${index + 1} must be [num, from, to] with 1 ≤ num ≤ ${MAX_PASSENGERS_1094}, 0 ≤ from < to ≤ ${MAX_STOP_1094}.`);
    }
    return [trip[0], trip[1], trip[2]];
  });
  return { trips, capacity };
}

function buildSteps1094(input, params) {
  const { trips, capacity } = parseInput1094(input, params);
  const steps = [];
  let last = null;
  let diff = null;
  let trip = null; // index into trips during the first loop
  let i = null;
  let curr = null;
  let answer = null;
  const prefix = []; // curr after each visited stop i (the passengers-in-car bars)
  const end = Math.max(...trips.map((t) => t[2]));
  // Chart scale known up front so the picture keeps one height: the most riders at any stop, or capacity if higher.
  let peak = 0;
  for (let stop = 0; stop <= end; stop++) {
    peak = Math.max(peak, trips.reduce((sum, [num, from, to]) => sum + (from <= stop && stop < to ? num : 0), 0));
  }
  const dash = (value) => (value === null ? "—" : value);

  const emit = ({ line, event, title, note, condition = null, changed = null, delta = null, final = false }) => {
    const t = trip === null ? null : trips[trip];
    steps.push({
      title,
      note,
      arr: [],
      highlight: [],
      mark: [],
      codeLines: [line],
      vars: [
        { name: "capacity", value: capacity },
        { name: "last", value: dash(last) },
        { name: "num", value: t ? t[0] : "—" },
        { name: "start", value: t ? t[1] : "—" },
        { name: "end", value: t ? t[2] : "—" },
        { name: "diff", value: diff ? `[${diff.join(", ")}]` : "—" },
        { name: "i", value: dash(i) },
        { name: "curr", value: dash(curr) },
      ],
      final,
      carPool1094View: JSON.parse(JSON.stringify({
        version: 1,
        problemId: 1094,
        line,
        event,
        condition,
        trips: trips.map(([num, from, to], id) => ({ id, num, from, to })),
        capacity,
        end,
        last,
        trip,
        diff,
        changed,
        delta,
        i,
        curr,
        prefix,
        peak,
        answer,
        final,
      })),
    });
  };

  emit({ line: 1, event: "import", title: bi("from typing import List", "from typing import List"), note: bi("Kiểu List.", "Type hints.") });
  emit({ line: 3, event: "class", title: bi("class Solution", "class Solution"), note: bi("Định nghĩa lớp.", "Class defined.") });
  emit({ line: 4, event: "call", title: bi("Gọi carPooling", "Call carPooling"), note: bi(`${trips.length} chuyến, chứa ${capacity}.`, `${trips.length} trips, capacity ${capacity}.`) });
  last = end;
  emit({ line: 5, event: "last", title: bi(`last = ${last}`, `last = ${last}`), note: bi(`Điểm xa nhất: ${last}.`, `Farthest stop: ${last}.`) });
  diff = new Array(last + 1).fill(0);
  emit({ line: 6, event: "diff", title: bi(`diff = [0] * ${diff.length}`, `diff = [0] * ${diff.length}`), note: bi(`${diff.length} ô, tất cả 0.`, `${diff.length} cells, all 0.`) });

  trips.forEach(([num, from, to], index) => {
    trip = index;
    emit({ line: 7, event: "for-trip", title: bi(`T${index + 1}: [${num}, ${from}, ${to}]`, `T${index + 1}: [${num}, ${from}, ${to}]`), note: bi(`T${index + 1}: ${num} khách, ${from}→${to}.`, `T${index + 1}: ${num} riders, ${from}→${to}.`) });
    diff[from] += num;
    emit({ line: 8, event: "plus", changed: from, delta: num, title: bi(`diff[${from}] += ${num}`, `diff[${from}] += ${num}`), note: bi(`Lên ở ${from}: +${num}.`, `Pick up at ${from}: +${num}.`) });
    diff[to] -= num;
    emit({ line: 9, event: "minus", changed: to, delta: -num, title: bi(`diff[${to}] -= ${num}`, `diff[${to}] -= ${num}`), note: bi(`Xuống ở ${to}: -${num}.`, `Drop off at ${to}: -${num}.`) });
  });
  emit({ line: 7, event: "for-trip-done", title: bi("Hết trips", "trips done"), note: bi("Đã đánh dấu hết.", "All marked.") });
  trip = null;

  curr = 0;
  emit({ line: 10, event: "init", title: bi("curr = 0", "curr = 0"), note: bi("Xe trống.", "Car is empty.") });

  for (let index = 0; index <= last; index++) {
    i = index;
    emit({ line: 11, event: "for-stop", title: bi(`i = ${index}`, `i = ${index}`), note: bi(`Điểm ${index}.`, `Stop ${index}.`) });
    curr += diff[index];
    prefix.push(curr);
    emit({ line: 12, event: "add", title: bi(`curr += diff[${index}]`, `curr += diff[${index}]`), note: bi(`Trên xe: ${curr}.`, `In car: ${curr}.`) });
    const over = curr > capacity;
    emit({
      line: 13,
      event: "check",
      condition: over,
      title: bi(`if ${curr} > ${capacity}`, `if ${curr} > ${capacity}`),
      note: over
        ? bi(`${curr} > ${capacity} → quá tải!`, `${curr} > ${capacity} → over!`)
        : curr === capacity
          ? bi("Vừa đủ chỗ → OK.", "Exactly full → OK.")
          : bi(`${curr} ≤ ${capacity} → OK.`, `${curr} ≤ ${capacity} → OK.`),
    });
    if (over) {
      answer = false;
      emit({ line: 14, event: "return-false", final: true, title: bi("return False", "return False"), note: bi(`Quá tải ở điểm ${index}.`, `Over at stop ${index}.`) });
      return { input, answer, steps };
    }
  }
  emit({ line: 11, event: "for-stop-done", title: bi("Hết điểm dừng", "stops done"), note: bi("Hết điểm dừng.", "All stops done.") });
  i = null;
  answer = true;
  emit({ line: 15, event: "return-true", final: true, title: bi("return True", "return True"), note: bi("Không lần nào quá tải.", "Never over capacity.") });
  return { input, answer, steps };
}

module.exports = {
  1094: {
    id: 1094,
    difficulty: "medium",
    slug: "car-pooling",
    category: { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    tags: [
      { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "sweep-line", vi: "Đường quét", en: "Sweep Line" },
    ],
    title: { vi: "Car Pooling", en: "Car Pooling" },
    titleVi: { vi: "Đi chung xe", en: "Share one car" },
    statement: {
      vi: "trips[i] = [num, from, to]: num khách lên ở from, xuống ở to (đi trên [from, to)). Xe chỉ đi về phía trước. Trả về True nếu số khách trên xe không bao giờ vượt capacity. Visualization: tối đa 8 chuyến, num ≤ 9, to ≤ 16, capacity ≤ 99.",
      en: "trips[i] = [num, from, to]: num passengers get on at from and off at to (they ride on [from, to)). The car only drives forward. Return True if the riders never exceed capacity. Visualization: up to 8 trips, num ≤ 9, to ≤ 16, capacity ≤ 99.",
    },
    defaultInput: DEFAULT_INPUT_1094,
    inputKind: "string",
    inputLabel: { vi: "trips: [[num,from,to], ...]", en: "trips: [[num,from,to], ...]" },
    extraParams: [{ key: "capacity", label: { vi: "capacity (sức chứa)", en: "capacity" }, type: "number", default: DEFAULT_CAPACITY_1094, min: 1, max: MAX_CAPACITY_1094 }],
    debugMode: "line-by-line",
    approach: [
      { vi: "Mảng hiệu diff: +num ở điểm đón, −num ở điểm trả.", en: "Difference array diff: +num at the pick-up stop, −num at the drop-off stop." },
      { vi: "Cộng dồn diff từ trái sang phải: curr = số khách đang trên xe.", en: "Running sum of diff left to right: curr = riders in the car." },
      { vi: "Gặp curr > capacity thì trả về False ngay; đi hết thì True.", en: "Return False as soon as curr > capacity; True after the last stop." },
    ],
    complexity: {
      time: "O(n + L)",
      space: "O(L)",
      note: { vi: "n chuyến, L = last + 1 điểm dừng.", en: "n trips, L = last + 1 stops." },
    },
    code: [...SOURCE_1094],
    builder: buildSteps1094,
    liveArgs: (input, params) => {
      const { trips, capacity } = parseInput1094(input, params);
      return [trips, capacity];
    },
  },
};

Object.defineProperty(module.exports, "__internals1094", {
  value: { parseInput1094, SOURCE_1094, MAX_STOP_1094, DEFAULT_CAPACITY_1094 },
  enumerable: false,
});
