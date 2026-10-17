"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE = Object.freeze([
  "class Solution:",
  "    def minDays(self, bloomDay: list[int], m: int, k: int) -> int:",
  "        if m * k > len(bloomDay):",
  "            return -1",
  "",
  "        left, right = min(bloomDay), max(bloomDay)",
  "",
  "        def can_make(day):",
  "            bouquets = 0",
  "            consecutive = 0",
  "",
  "            for bloom in bloomDay:",
  "                if bloom <= day:",
  "                    consecutive += 1",
  "",
  "                    if consecutive == k:",
  "                        bouquets += 1",
  "                        consecutive = 0",
  "                else:",
  "                    consecutive = 0",
  "",
  "            return bouquets >= m",
  "",
  "        while left < right:",
  "            mid = (left + right) // 2",
  "",
  "            if can_make(mid):",
  "                right = mid",
  "            else:",
  "                left = mid + 1",
  "",
  "        return left",
]);

const MAX_LENGTH = 60;
const MAX_VALUE = 1000000000;
const MAX_PARAMETER = 1000000;

function parsePositiveInteger(value, fallback, name) {
  const raw = value === undefined ? fallback : value;
  if (typeof raw !== "number" && (typeof raw !== "string" || !/^\d+$/.test(raw.trim()))) {
    throw new TypeError(`1482: ${name} must be an integer / ${name} phải là số nguyên.`);
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_PARAMETER) {
    throw new RangeError(`1482: ${name} must be in [1, ${MAX_PARAMETER}] / ${name} phải nằm trong [1, ${MAX_PARAMETER}].`);
  }
  return parsed;
}

function parseInput(input, params = {}) {
  if (!Array.isArray(input) || input.length < 1 || input.length > MAX_LENGTH) {
    throw new RangeError(`1482: bloomDay must contain 1..${MAX_LENGTH} values / bloomDay cần 1..${MAX_LENGTH} số.`);
  }
  if (input.some((value) => !Number.isInteger(value) || value < 1 || value > MAX_VALUE)) {
    throw new RangeError(`1482: bloomDay values must be integers in [1, ${MAX_VALUE}] / ngày nở phải là số nguyên hợp lệ.`);
  }
  return {
    bloomDay: [...input],
    m: parsePositiveInteger(params.m, 2, "m"),
    k: parsePositiveInteger(params.k, 2, "k"),
  };
}

function analyzeGarden(bloomDay, day, k) {
  const groups = [];
  let consecutive = 0;
  for (let index = 0; index < bloomDay.length; index += 1) {
    if (bloomDay[index] <= day) {
      consecutive += 1;
      if (consecutive === k) {
        groups.push(Array.from({ length: k }, (_, offset) => index - k + 1 + offset));
        consecutive = 0;
      }
    } else {
      consecutive = 0;
    }
  }
  return { bouquets: groups.length, groups, consecutive };
}

function buildSteps(input, params = {}) {
  const { bloomDay, m, k } = parseInput(input, params);
  const initialLeft = Math.min(...bloomDay);
  const initialRight = Math.max(...bloomDay);
  const steps = [];
  const tested = [];
  let left = initialLeft;
  let right = initialRight;
  let mid = null;
  let day = null;
  let bouquets = 0;
  let consecutive = 0;
  let currentIndex = null;
  let processedCount = 0;
  let groups = [];
  let decision = "idle";

  function emit(line, phase, action, extra = {}) {
    const view = {
      problemId: 1482,
      phase,
      action,
      source: { line, text: CODE[line - 1] },
      input: { bloomDay: [...bloomDay], m, k },
      search: { initialLeft, initialRight, left, right, mid, day, decision },
      scan: {
        currentIndex,
        processedCount,
        bouquets,
        consecutive,
        groups: groups.map((group) => [...group]),
      },
      tested: tested.map((attempt) => ({ ...attempt })),
      final: false,
      answer: null,
      impossible: false,
      ...extra,
    };
    steps.push({
      arr: [...bloomDay],
      highlight: currentIndex === null ? [] : [currentIndex],
      mark: groups.flat(),
      codeLines: [line],
      final: Boolean(extra.final),
      title: bi("Ngày sớm nhất làm đủ bó hoa", "Minimum Days to Make Bouquets"),
      note: bi("", ""),
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        ...(mid === null ? [] : [{ name: "mid", value: mid }]),
        { name: "bouquets", value: bouquets },
        { name: "consecutive", value: consecutive },
      ],
      bouquets1482View: view,
    });
  }

  emit(3, "range", "capacity-check");
  if (m * k > bloomDay.length) {
    decision = "impossible";
    emit(4, "done", "impossible", { final: true, answer: -1, impossible: true });
    return { original: bloomDay, answer: -1, steps };
  }

  emit(6, "range", "set-range");
  while (left < right) {
    decision = "idle";
    currentIndex = null;
    processedCount = 0;
    emit(24, "range", "range-open");
    mid = Math.floor((left + right) / 2);
    day = mid;
    bouquets = 0;
    consecutive = 0;
    groups = [];
    emit(25, "try", "choose-mid");

    emit(9, "scan", "reset-bouquets");
    emit(10, "scan", "reset-streak");

    for (let index = 0; index < bloomDay.length; index += 1) {
      currentIndex = index;
      processedCount = index;
      emit(12, "scan", "pick-flower");
      processedCount = index + 1;
      if (bloomDay[index] <= day) {
        emit(13, "scan", "bloom-ready");
        consecutive += 1;
        emit(14, "scan", "grow-streak");
        emit(16, "scan", "check-group");
        if (consecutive === k) {
          bouquets += 1;
          groups.push(Array.from({ length: k }, (_, offset) => index - k + 1 + offset));
          emit(17, "scan", "make-bouquet");
          consecutive = 0;
          emit(18, "scan", "reset-after-bouquet");
        }
      } else {
        emit(19, "scan", "barrier");
        consecutive = 0;
        emit(20, "scan", "break-streak");
      }
    }

    currentIndex = null;
    processedCount = bloomDay.length;
    decision = bouquets >= m ? "feasible" : "too-early";
    emit(22, "decide", decision === "feasible" ? "enough" : "not-enough");
    tested.push({ day: mid, bouquets, feasible: decision === "feasible" });
    if (decision === "feasible") {
      right = mid;
      emit(28, "range", "try-earlier");
    } else {
      left = mid + 1;
      emit(30, "range", "wait-longer");
    }
  }

  const answer = left;
  const result = analyzeGarden(bloomDay, answer, k);
  mid = answer;
  day = answer;
  bouquets = result.bouquets;
  consecutive = result.consecutive;
  groups = result.groups;
  currentIndex = null;
  processedCount = bloomDay.length;
  decision = "done";
  const previous = analyzeGarden(bloomDay, answer - 1, k);
  emit(32, "done", "answer", {
    final: true,
    answer,
    previousBouquets: previous.bouquets,
  });
  return { original: bloomDay, answer, steps };
}

module.exports = {
  1482: {
    id: 1482,
    difficulty: "medium",
    slug: "minimum-number-of-days-to-make-m-bouquets",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    tags: [
      { key: "binary-search", vi: "Binary Search", en: "Binary Search" },
      { key: "binary-search-on-answer", vi: "Binary Search đáp án", en: "Binary Search on Answer" },
      { key: "array", vi: "Mảng", en: "Array" },
    ],
    title: bi("Minimum Number of Days to Make m Bouquets", "Minimum Number of Days to Make m Bouquets"),
    titleVi: bi("Ngày sớm nhất để làm đủ bó hoa", "Minimum days to make enough bouquets"),
    statement: bi(
      "Mỗi bông nở vào bloomDay[i]. Tìm ngày sớm nhất có thể làm m bó, mỗi bó dùng k bông đã nở liền nhau; trả về -1 nếu không thể.",
      "Each flower blooms on bloomDay[i]. Find the earliest day to make m bouquets of k adjacent bloomed flowers, or return -1 if impossible.",
    ),
    defaultInput: [1, 10, 3, 10, 2, 4, 8, 6],
    inputKind: "positive",
    inputLabel: bi("bloomDay · ngày nở", "bloomDay · bloom dates"),
    extraParams: [
      { key: "m", type: "number", min: 1, max: MAX_PARAMETER, default: 2, label: bi("m · số bó", "m · bouquets") },
      { key: "k", type: "number", min: 1, max: MAX_PARAMETER, default: 2, label: bi("k · bông liền nhau", "k · adjacent flowers") },
    ],
    approach: [
      bi("Nếu m × k lớn hơn số bông, không thể tạo đủ bó.", "If m × k exceeds the number of flowers, the answer is impossible."),
      bi("Với một ngày thử, quét vườn và gom mỗi k bông đã nở liền nhau thành một bó.", "For a trial day, scan the garden and bundle every k consecutive bloomed flowers."),
      bi("Đủ bó thì thử ngày sớm hơn; thiếu bó thì chờ lâu hơn.", "Enough bouquets means try an earlier day; otherwise wait longer."),
    ],
    complexity: {
      time: "O(n log D)",
      space: "O(1)",
      note: bi("D là khoảng ngày nở; mỗi ngày thử quét bloomDay một lần.", "D is the bloom-day range; each trial scans bloomDay once."),
    },
    code: CODE,
    debugMode: "line-by-line",
    builder: buildSteps,
    parseInput,
    liveArgs: (input, params) => {
      const parsed = parseInput(input, params);
      return [parsed.bloomDay, parsed.m, parsed.k];
    },
  },
};
