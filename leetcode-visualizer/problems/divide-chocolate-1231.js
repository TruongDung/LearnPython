"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE = Object.freeze([
  "class Solution:",
  "    def maximizeSweetness(self, sweetness: list[int], k: int) -> int:",
  "        pieces = k + 1",
  "        left = min(sweetness)",
  "        right = sum(sweetness) // pieces",
  "",
  "        def can_share(target: int) -> bool:",
  "            made = 0",
  "            current = 0",
  "            for value in sweetness:",
  "                current += value",
  "                if current >= target:",
  "                    made += 1",
  "                    current = 0",
  "            return made >= pieces",
  "",
  "        while left < right:",
  "            mid = (left + right + 1) // 2",
  "            if can_share(mid):",
  "                left = mid",
  "            else:",
  "                right = mid - 1",
  "",
  "        return left",
]);

const MAX_LENGTH = 24;
const MAX_SWEETNESS = 100000;

function parseInput(input, params = {}) {
  if (!Array.isArray(input) || input.length < 1 || input.length > MAX_LENGTH) {
    throw new RangeError(`1231: sweetness must contain 1..${MAX_LENGTH} values / sweetness cần 1..${MAX_LENGTH} phần.`);
  }
  if (input.some((value) => !Number.isInteger(value) || value < 1 || value > MAX_SWEETNESS)) {
    throw new RangeError(`1231: sweetness values must be integers in [1, ${MAX_SWEETNESS}] / mỗi độ ngọt phải là số nguyên hợp lệ.`);
  }
  const rawK = params.k === undefined ? Math.min(5, input.length - 1) : params.k;
  if (typeof rawK !== "number" && (typeof rawK !== "string" || !/^\d+$/.test(rawK.trim()))) {
    throw new TypeError("1231: k must be an integer / k phải là số nguyên.");
  }
  const k = Number(rawK);
  if (!Number.isInteger(k) || k < 0 || k >= input.length) {
    throw new RangeError("1231: k must be in [0, sweetness.length - 1] / k phải từ 0 đến n - 1.");
  }
  return { sweetness: [...input], k, pieces: k + 1 };
}

function exactPartition(sweetness, target, pieces) {
  const cuts = [];
  let current = 0;
  for (let index = 0; index < sweetness.length - 1 && cuts.length < pieces - 1; index += 1) {
    current += sweetness[index];
    if (current >= target) {
      cuts.push(index + 1);
      current = 0;
    }
  }
  const boundaries = [0, ...cuts, sweetness.length];
  return boundaries.slice(0, -1).map((start, piece) => {
    const end = boundaries[piece + 1];
    const values = sweetness.slice(start, end);
    return { piece, start, end, values, sum: values.reduce((total, value) => total + value, 0) };
  });
}

function buildSteps(input, params = {}) {
  const { sweetness, k, pieces } = parseInput(input, params);
  const total = sweetness.reduce((sum, value) => sum + value, 0);
  const initialLeft = Math.min(...sweetness);
  const initialRight = Math.floor(total / pieces);
  const steps = [];
  const tested = [];
  let left = initialLeft;
  let right = initialRight;
  let mid = null;
  let target = null;
  let index = null;
  let processed = 0;
  let current = 0;
  let made = 0;
  let groupOf = Array(sweetness.length).fill(null);
  let trialPieces = [];
  let cuts = [];
  let feasible = null;

  function emit(line, phase, action, extra = {}) {
    const view = {
      problemId: 1231,
      phase,
      action,
      source: { line, text: CODE[line - 1] },
      input: { sweetness: [...sweetness], k, pieces },
      search: { initialLeft, initialRight, left, right, mid, target, feasible },
      scan: {
        index,
        processed,
        current,
        made,
        groupOf: [...groupOf],
        cuts: [...cuts],
        pieces: trialPieces.map((piece) => ({ ...piece, values: [...piece.values] })),
      },
      tested: tested.map((attempt) => ({ ...attempt })),
      final: false,
      answer: null,
      partition: [],
      ...extra,
    };
    steps.push({
      arr: [...sweetness],
      highlight: index === null ? [] : [index],
      mark: cuts.map((cut) => cut - 1),
      codeLines: [line],
      final: Boolean(extra.final),
      title: bi("Chia Chocolate", "Divide Chocolate"),
      note: bi("", ""),
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        ...(mid === null ? [] : [{ name: "mid", value: mid }]),
      ],
      divideChocolate1231View: view,
    });
  }

  function canShare(candidate) {
    target = candidate;
    index = null;
    processed = 0;
    current = 0;
    made = 0;
    groupOf = Array(sweetness.length).fill(null);
    trialPieces = [];
    cuts = [];
    feasible = null;
    emit(7, "cut", "start-trial");
    emit(8, "cut", "empty-counter");
    emit(9, "cut", "empty-piece");

    let start = 0;
    for (let cursor = 0; cursor < sweetness.length; cursor += 1) {
      index = cursor;
      emit(10, "cut", "pick-block");
      current += sweetness[cursor];
      groupOf[cursor] = made;
      processed = cursor + 1;
      emit(11, "cut", "add-block");
      emit(12, "cut", current >= candidate ? "enough" : "need-more");
      if (current >= candidate) {
        made += 1;
        trialPieces.push({
          piece: made - 1,
          start,
          end: cursor + 1,
          values: sweetness.slice(start, cursor + 1),
          sum: current,
          complete: true,
        });
        cuts.push(cursor + 1);
        emit(13, "cut", "make-cut");
        current = 0;
        start = cursor + 1;
        emit(14, "cut", "new-piece");
      }
    }
    if (start < sweetness.length) {
      trialPieces.push({
        piece: made,
        start,
        end: sweetness.length,
        values: sweetness.slice(start),
        sum: current,
        complete: false,
      });
    }
    feasible = made >= pieces;
    emit(15, "decide", feasible ? "shareable" : "not-shareable");
    return feasible;
  }

  emit(3, "setup", "count-pieces");
  emit(4, "setup", "lower-bound");
  emit(5, "setup", "upper-bound");
  while (left < right) {
    emit(17, "search", "range-open");
    mid = Math.floor((left + right + 1) / 2);
    emit(18, "search", "try-mid");
    const works = canShare(mid);
    tested.push({ target: mid, made, feasible: works });
    if (works) {
      emit(19, "decide", "keep-mid");
      left = mid;
      emit(20, "search", "move-left-up");
    } else {
      emit(21, "decide", "reject-mid");
      right = mid - 1;
      emit(22, "search", "move-right-down");
    }
  }

  const answer = left;
  const partition = exactPartition(sweetness, answer, pieces);
  target = answer;
  mid = answer;
  feasible = true;
  index = null;
  processed = sweetness.length;
  made = pieces;
  current = 0;
  cuts = partition.slice(0, -1).map((piece) => piece.end);
  groupOf = Array(sweetness.length).fill(null);
  partition.forEach((piece) => {
    for (let cursor = piece.start; cursor < piece.end; cursor += 1) groupOf[cursor] = piece.piece;
  });
  trialPieces = partition.map((piece) => ({ ...piece, complete: true }));
  emit(24, "done", "answer", { final: true, answer, partition });
  return { original: sweetness, answer, steps };
}

module.exports = {
  1231: {
    id: 1231,
    difficulty: "hard",
    slug: "divide-chocolate",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    tags: [
      { key: "binary-search", vi: "Binary Search", en: "Binary Search" },
      { key: "greedy", vi: "Tham lam", en: "Greedy" },
    ],
    title: bi("Divide Chocolate", "Divide Chocolate"),
    titleVi: bi("Chia chocolate", "Divide chocolate"),
    statement: bi(
      "Chia thanh chocolate thành k + 1 phần liền nhau. Bạn nhận phần ít ngọt nhất; hãy làm độ ngọt của phần đó lớn nhất.",
      "Split the chocolate into k + 1 contiguous pieces. You keep the least-sweet piece; maximize its sweetness.",
    ),
    defaultInput: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    inputKind: "positive",
    inputLabel: bi("sweetness · độ ngọt từng miếng", "sweetness · sweetness per chunk"),
    extraParams: [
      { key: "k", type: "number", min: 0, max: MAX_LENGTH - 1, default: 5, label: bi("k · số người bạn", "k · friends") },
    ],
    approach: [
      bi("Đoán độ ngọt nhỏ nhất target.", "Guess the minimum sweetness target."),
      bi("Quét trái → phải; đủ target thì cắt ngay.", "Scan left → right; cut as soon as target is reached."),
      bi("Tạo đủ k + 1 phần → thử target lớn hơn.", "Made k + 1 pieces → try a larger target."),
    ],
    complexity: {
      time: "O(n log(sum(sweetness)))",
      space: "O(1)",
      note: bi("Mỗi target cần một lượt quét.", "Each target needs one scan."),
    },
    code: CODE,
    debugMode: "line-by-line",
    builder: buildSteps,
    liveArgs: (input, params) => {
      const parsed = parseInput(input, params);
      return [parsed.sweetness, parsed.k];
    },
    parseInput,
  },
};
