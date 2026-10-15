"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE = Object.freeze([
  "class Solution:",
  "    def findKthPositive(self, arr: list[int], k: int) -> int:",
  "        left, right = 0, len(arr)",
  "",
  "        while left < right:",
  "            mid = (left + right) // 2",
  "",
  "            missing = arr[mid] - (mid + 1)",
  "",
  "            if missing < k:",
  "                left = mid + 1",
  "            else:",
  "                right = mid",
  "",
  "        return left + k",
]);

const MAX_LENGTH = 24;
const MAX_VALUE = 10000;

function parseInput(input, params = {}) {
  if (!Array.isArray(input) || input.length < 1 || input.length > MAX_LENGTH) {
    throw new RangeError(`1539: arr must contain 1..${MAX_LENGTH} values / arr cần 1..${MAX_LENGTH} số.`);
  }
  if (input.some((value) => !Number.isInteger(value) || value < 1 || value > MAX_VALUE)) {
    throw new RangeError(`1539: arr values must be integers in [1, ${MAX_VALUE}] / phần tử arr phải là số nguyên dương hợp lệ.`);
  }
  for (let index = 1; index < input.length; index += 1) {
    if (input[index] <= input[index - 1]) {
      throw new RangeError("1539: arr must be strictly increasing / arr phải tăng nghiêm ngặt.");
    }
  }
  const rawK = params.k === undefined ? 5 : params.k;
  if (typeof rawK !== "number" && (typeof rawK !== "string" || !/^\d+$/.test(rawK.trim()))) {
    throw new TypeError("1539: k must be a positive integer / k phải là số nguyên dương.");
  }
  const k = Number(rawK);
  if (!Number.isInteger(k) || k < 1 || k > MAX_VALUE) {
    throw new RangeError(`1539: k must be in [1, ${MAX_VALUE}] / k phải nằm trong giới hạn.`);
  }
  return { arr: [...input], k };
}

function kthMissingOracle(arr, k) {
  let missing = 0;
  let cursor = 1;
  let index = 0;
  while (missing < k) {
    if (index < arr.length && arr[index] === cursor) index += 1;
    else missing += 1;
    if (missing < k) cursor += 1;
  }
  return cursor;
}

function buildSteps(input, params = {}) {
  const { arr, k } = parseInput(input, params);
  const answer = kthMissingOracle(arr, k);
  const steps = [];
  const history = [];
  let left = 0;
  let right = arr.length;
  let mid = null;
  let missing = null;
  let decision = "idle";

  function emit(line, phase, action, extra = {}) {
    const view = {
      problemId: 1539,
      phase,
      action,
      source: { line, text: CODE[line - 1] },
      input: { arr: [...arr], k },
      search: { left, right, mid, missing, decision },
      history: history.map((item) => ({ ...item })),
      final: false,
      answer: null,
      insertionIndex: null,
      ...extra,
    };
    steps.push({
      arr: [...arr],
      highlight: mid === null ? [] : [mid],
      mark: [],
      codeLines: [line],
      final: Boolean(extra.final),
      title: bi("Số dương bị thiếu thứ k", "Kth Missing Positive Number"),
      note: bi("", ""),
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        ...(mid === null ? [] : [{ name: "mid", value: mid }]),
        ...(missing === null ? [] : [{ name: "missing", value: missing }]),
      ],
      kthMissing1539View: view,
    });
  }

  emit(3, "setup", "set-range");
  while (left < right) {
    decision = "idle";
    emit(5, "search", "range-open");
    mid = Math.floor((left + right) / 2);
    missing = null;
    emit(6, "search", "choose-mid");
    missing = arr[mid] - (mid + 1);
    emit(8, "count", "count-holes");
    decision = missing < k ? "right" : "left";
    emit(10, "decide", decision === "right" ? "too-few" : "enough");
    history.push({ mid, value: arr[mid], missing, decision });
    if (decision === "right") {
      left = mid + 1;
      emit(11, "search", "move-right");
    } else {
      right = mid;
      emit(13, "search", "move-left");
    }
  }
  mid = null;
  missing = null;
  decision = "done";
  emit(15, "done", "answer", { final: true, answer: left + k, insertionIndex: left });
  return { original: arr, answer, steps };
}

module.exports = {
  1539: {
    id: 1539,
    difficulty: "easy",
    slug: "kth-missing-positive-number",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    tags: [
      { key: "binary-search", vi: "Binary Search", en: "Binary Search" },
      { key: "array", vi: "Mảng", en: "Array" },
    ],
    title: bi("Kth Missing Positive Number", "Kth Missing Positive Number"),
    titleVi: bi("Số dương bị thiếu thứ k", "Kth missing positive number"),
    statement: bi(
      "Cho mảng số dương tăng nghiêm ngặt arr và số k. Tìm số dương bị thiếu thứ k.",
      "Given a strictly increasing positive array arr and k, find the kth missing positive number.",
    ),
    defaultInput: [2, 3, 4, 7, 11],
    inputKind: "positive",
    inputLabel: bi("arr · dãy tăng nghiêm ngặt", "arr · strictly increasing"),
    extraParams: [
      { key: "k", type: "number", min: 1, max: MAX_VALUE, default: 5, label: bi("k · ô trống cần tìm", "k · missing slot to find") },
    ],
    approach: [
      bi("Tại index mid, đã thiếu arr[mid] - (mid + 1) số.", "At mid, arr[mid] - (mid + 1) values are missing."),
      bi("Thiếu ít hơn k → đi phải; ngược lại giữ nửa trái.", "Fewer than k missing → go right; otherwise keep the left half."),
      bi("Kết quả là left + k.", "The answer is left + k."),
    ],
    complexity: { time: "O(log n)", space: "O(1)", note: bi("Mỗi bước bỏ một nửa mảng.", "Each step discards half the array.") },
    code: CODE,
    debugMode: "line-by-line",
    builder: buildSteps,
    liveArgs: (input, params) => {
      const parsed = parseInput(input, params);
      return [parsed.arr, parsed.k];
    },
    parseInput,
  },
};
