"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE = Object.freeze([
  "class Solution:",
  "    def maxDistance(self, position: list[int], m: int) -> int:",
  "        position.sort()",
  "        left, right = 1, position[-1] - position[0]",
  "",
  "        def can_place(distance):",
  "            balls = 1",
  "            last = position[0]",
  "",
  "            for current in position[1:]:",
  "                if current - last >= distance:",
  "                    balls += 1",
  "                    last = current",
  "",
  "            return balls >= m",
  "",
  "        while left <= right:",
  "            mid = (left + right) // 2",
  "",
  "            if can_place(mid):",
  "                left = mid + 1",
  "            else:",
  "                right = mid - 1",
  "",
  "        return right",
]);

const MAX_LENGTH = 60;
const MAX_POSITION = 1000000000;

function parseInput(input, params = {}) {
  if (!Array.isArray(input) || input.length < 2 || input.length > MAX_LENGTH) {
    throw new RangeError(`1552: position must contain 2..${MAX_LENGTH} values / position cần 2..${MAX_LENGTH} vị trí.`);
  }
  if (input.some((value) => !Number.isInteger(value) || value < 1 || value > MAX_POSITION)) {
    throw new RangeError(`1552: positions must be integers in [1, ${MAX_POSITION}] / vị trí phải là số nguyên hợp lệ.`);
  }
  if (new Set(input).size !== input.length) {
    throw new RangeError("1552: positions must be distinct / các vị trí không được trùng nhau.");
  }
  const rawM = params.m === undefined ? Math.min(3, input.length) : params.m;
  if (typeof rawM !== "number" && (typeof rawM !== "string" || !/^\d+$/.test(rawM.trim()))) {
    throw new TypeError("1552: m must be an integer / m phải là số nguyên.");
  }
  const m = Number(rawM);
  if (!Number.isInteger(m) || m < 2 || m > input.length) {
    throw new RangeError("1552: m must be in [2, position.length] / m phải nằm trong [2, số vị trí].");
  }
  return { position: [...input], m };
}

function placementAt(position, distance) {
  const placed = [0];
  let lastIndex = 0;
  for (let index = 1; index < position.length; index += 1) {
    if (position[index] - position[lastIndex] >= distance) {
      placed.push(index);
      lastIndex = index;
    }
  }
  return placed;
}

function buildSteps(input, params = {}) {
  const parsed = parseInput(input, params);
  const original = [...parsed.position];
  const position = [...parsed.position].sort((a, b) => a - b);
  const { m } = parsed;
  const initialLeft = 1;
  const initialRight = position.at(-1) - position[0];
  const steps = [];
  const tested = [];
  let left = initialLeft;
  let right = initialRight;
  let mid = null;
  let distance = null;
  let balls = 0;
  let lastIndex = null;
  let currentIndex = null;
  let processedCount = 0;
  let placed = [];
  let gap = null;
  let accepted = null;
  let decision = "idle";

  function emit(line, phase, action, extra = {}) {
    const view = {
      problemId: 1552,
      phase,
      action,
      source: { line, text: CODE[line - 1] },
      input: { original: [...original], position: [...position], m },
      search: { initialLeft, initialRight, left, right, mid, distance, decision },
      scan: {
        currentIndex,
        processedCount,
        lastIndex,
        balls,
        gap,
        accepted,
        placed: [...placed],
      },
      tested: tested.map((attempt) => ({ ...attempt })),
      final: false,
      answer: null,
      ...extra,
    };
    steps.push({
      arr: [...position],
      highlight: currentIndex === null ? [] : [currentIndex],
      mark: [...placed],
      codeLines: [line],
      final: Boolean(extra.final),
      title: bi("Lực từ giữa hai quả bóng", "Magnetic Force Between Two Balls"),
      note: bi("", ""),
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        ...(mid === null ? [] : [{ name: "mid", value: mid }]),
        { name: "balls", value: balls },
        ...(lastIndex === null ? [] : [{ name: "last", value: position[lastIndex] }]),
      ],
      magnetic1552View: view,
    });
  }

  emit(3, "sort", "sort-positions");
  emit(4, "range", "set-range");
  while (left <= right) {
    decision = "idle";
    currentIndex = null;
    accepted = null;
    gap = null;
    emit(17, "range", "range-open");
    mid = Math.floor((left + right) / 2);
    distance = mid;
    balls = 0;
    lastIndex = null;
    processedCount = 0;
    placed = [];
    emit(18, "try", "choose-distance");

    balls = 1;
    placed = [0];
    processedCount = 1;
    emit(7, "place", "place-first");
    lastIndex = 0;
    emit(8, "place", "remember-last");

    for (let index = 1; index < position.length; index += 1) {
      currentIndex = index;
      processedCount = index;
      accepted = null;
      gap = position[index] - position[lastIndex];
      emit(10, "place", "pick-basket");
      accepted = gap >= distance;
      processedCount = index + 1;
      emit(11, "place", accepted ? "gap-fits" : "too-close");
      if (accepted) {
        balls += 1;
        placed.push(index);
        emit(12, "place", "place-ball");
        lastIndex = index;
        emit(13, "place", "move-last");
      }
    }

    currentIndex = null;
    accepted = null;
    gap = null;
    processedCount = position.length;
    decision = balls >= m ? "feasible" : "too-far";
    emit(15, "decide", decision === "feasible" ? "enough" : "not-enough");
    tested.push({ distance: mid, balls, feasible: decision === "feasible" });
    if (decision === "feasible") {
      left = mid + 1;
      emit(21, "range", "try-farther");
    } else {
      right = mid - 1;
      emit(23, "range", "come-closer");
    }
  }

  const answer = right;
  const finalPlaced = placementAt(position, answer);
  const higherPlaced = placementAt(position, answer + 1);
  mid = answer;
  distance = answer;
  balls = finalPlaced.length;
  placed = finalPlaced;
  lastIndex = finalPlaced.at(-1);
  currentIndex = null;
  processedCount = position.length;
  gap = null;
  accepted = null;
  decision = "done";
  emit(25, "done", "answer", {
    final: true,
    answer,
    higherBalls: higherPlaced.length,
  });
  return { original, answer, steps };
}

module.exports = {
  1552: {
    id: 1552,
    difficulty: "medium",
    slug: "magnetic-force-between-two-balls",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    tags: [
      { key: "binary-search", vi: "Binary Search", en: "Binary Search" },
      { key: "binary-search-on-answer", vi: "Binary Search đáp án", en: "Binary Search on Answer" },
      { key: "greedy", vi: "Tham lam", en: "Greedy" },
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
    ],
    title: bi("Magnetic Force Between Two Balls", "Magnetic Force Between Two Balls"),
    titleVi: bi("Khoảng cách nhỏ nhất lớn nhất", "Maximum minimum distance"),
    statement: bi(
      "Đặt m quả bóng vào các vị trí khác nhau sao cho khoảng cách nhỏ nhất giữa hai quả bóng bất kỳ là lớn nhất.",
      "Place m balls at distinct positions so the minimum distance between any two balls is as large as possible.",
    ),
    defaultInput: [1, 2, 3, 4, 7],
    inputKind: "positive",
    inputLabel: bi("position · vị trí rổ", "position · basket positions"),
    extraParams: [
      { key: "m", type: "number", min: 2, max: MAX_LENGTH, default: 3, label: bi("m · số bóng", "m · balls") },
    ],
    approach: [
      bi("Sắp xếp vị trí. Luôn đặt bóng đầu tiên ở vị trí nhỏ nhất.", "Sort positions. Always place the first ball at the smallest position."),
      bi("Với khoảng cách thử mid, tham lam đặt bóng vào vị trí sớm nhất đủ xa bóng trước.", "For trial distance mid, greedily place each ball at the earliest position far enough from the previous ball."),
      bi("Đặt đủ m bóng: thử xa hơn. Không đủ: giảm khoảng cách.", "Placed at least m balls: try farther. Otherwise reduce the distance."),
    ],
    complexity: {
      time: "O(n log n + n log W)",
      space: "O(1)",
      note: bi("W = max(position) − min(position); mỗi khoảng cách thử quét một lần.", "W = max(position) − min(position); each trial scans once."),
    },
    code: CODE,
    debugMode: "line-by-line",
    builder: buildSteps,
    parseInput,
    liveArgs: (input, params) => {
      const parsedInput = parseInput(input, params);
      return [parsedInput.position, parsedInput.m];
    },
  },
};
