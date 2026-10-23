"use strict";

const { trace, bi } = require("./picture-trace");

const CODE = [
  "class Solution:",
  "    def makesquare(self, matchsticks):",
  "        total = sum(matchsticks)",
  "        if total % 4 != 0:",
  "            return False",
  "        target = total // 4",
  "        matchsticks.sort(reverse=True)",
  "        if matchsticks[0] > target:",
  "            return False",
  "        sides = [0] * 4",
  "        def dfs(i):",
  "            if i == len(matchsticks):",
  "                return True",
  "            stick = matchsticks[i]",
  "            seen = set()",
  "            for side in range(4):",
  "                if sides[side] in seen:",
  "                    continue",
  "                seen.add(sides[side])",
  "                if sides[side] + stick > target:",
  "                    continue",
  "                sides[side] += stick",
  "                if dfs(i + 1):",
  "                    return True",
  "                sides[side] -= stick",
  "                if sides[side] == 0:",
  "                    break",
  "            return False",
  "        return dfs(0)",
];

function parseMatchsticks(input) {
  let values;
  if (typeof input === "string") {
    const raw = input.trim();
    try {
      values = raw.startsWith("[") ? JSON.parse(raw) : raw.split(/[\s,]+/).filter(Boolean).map(Number);
    } catch {
      throw new Error("473: Nhập các que cách nhau bằng dấu phẩy, ví dụ 2,2,2,2,3,3,7,7.");
    }
  } else if (Array.isArray(input)) {
    values = input;
  }
  if (!Array.isArray(values) || values.length < 1 || values.length > 15
    || !values.every((value) => Number.isSafeInteger(value) && value >= 1 && value <= 100_000_000)) {
    throw new Error("473: Cần 1–15 số nguyên dương trong [1, 100000000]. / Use 1–15 positive integers in [1, 100000000].");
  }
  return [...values];
}

function buildSteps(input) {
  const original = parseMatchsticks(input);
  const matchsticks = [...original];
  const total = matchsticks.reduce((sum, value) => sum + value, 0);
  const detailed = true;
  const run = trace(473, CODE, detailed);
  const sides = [0, 0, 0, 0];
  const placements = [];
  const callStack = [];
  const locals = { self: {}, matchsticks, total, target: null, sides, i: null, stick: null, side: null, seen: [] };
  let target = null;
  let answer = null;
  let probe = null;
  let phase = "start";

  const picture = () => ({
    original: [...original],
    sticks: [...matchsticks],
    total,
    target,
    sides: [...sides],
    placements: placements.map((item) => ({ ...item })),
    index: Number.isInteger(locals.i) ? locals.i : null,
    stick: Number.isInteger(locals.stick) ? locals.stick : null,
    activeSide: Number.isInteger(locals.side) ? locals.side : null,
    seen: [...locals.seen],
    probe: probe ? { ...probe } : null,
    callStack: callStack.map((frame) => ({ i: frame.i, stick: frame.stick, side: frame.side })),
    answer,
    phase,
    detailed: run.active,
  });
  const emit = (line, event) => run.emit(line, event, locals, picture);

  emit(1, "Solution");
  emit(2, "makesquare");
  emit(3, "sum(matchsticks)");
  emit(4, "chia tổng cho 4");
  if (total % 4 !== 0) {
    answer = false;
    phase = "not-divisible";
    emit(5, "tổng không chia hết cho 4");
  } else {
    target = total / 4;
    locals.target = target;
    emit(6, `mỗi cạnh = ${target}`);
    matchsticks.sort((a, b) => b - a);
    emit(7, "xếp que dài trước");
    emit(8, "kiểm tra que dài nhất");
    if (matchsticks[0] > target) {
      answer = false;
      phase = "stick-too-long";
      emit(9, "que dài hơn cạnh");
    } else {
      emit(10, "tạo 4 cạnh rỗng");
      emit(11, "định nghĩa dfs");

      function dfs(i) {
        const frame = { i, stick: null, side: null, seen: new Set() };
        callStack.push(frame);
        locals.i = i;
        locals.stick = null;
        locals.side = null;
        locals.seen = [];
        phase = "check-end";
        emit(12, `đã dùng ${i}/${matchsticks.length} que?`);
        if (i === matchsticks.length) {
          answer = true;
          phase = "square-complete";
          emit(13, "đủ tất cả que");
          callStack.pop();
          return true;
        }

        const stick = matchsticks[i];
        frame.stick = stick;
        locals.stick = stick;
        phase = "pick-stick";
        emit(14, `lấy que ${stick}`);
        emit(15, "các cạnh đã thử");

        for (let side = 0; side < 4; side++) {
          frame.side = side;
          locals.side = side;
          locals.seen = [...frame.seen];
          probe = { index: i, stick, side, kind: "try" };
          phase = "try-side";
          emit(16, `thử cạnh ${side + 1}`);
          emit(17, `cạnh ${side + 1} đã có tổng ${sides[side]}?`);
          if (frame.seen.has(sides[side])) {
            probe = { index: i, stick, side, kind: "same-sum", current: sides[side] };
            phase = "skip-symmetric-side";
            emit(18, "bỏ cạnh trùng tổng");
            continue;
          }
          frame.seen.add(sides[side]);
          locals.seen = [...frame.seen];
          emit(19, `đánh dấu tổng ${sides[side]}`);
          emit(20, `${sides[side]} + ${stick} ≤ ${target}?`);
          if (sides[side] + stick > target) {
            probe = { index: i, stick, side, kind: "overflow", current: sides[side], attempted: sides[side] + stick };
            phase = "over-target";
            emit(21, "que làm cạnh quá dài");
            continue;
          }

          sides[side] += stick;
          placements.push({ index: i, side, value: stick });
          probe = { index: i, stick, side, kind: "placed", current: sides[side] };
          phase = "place-stick";
          emit(22, `đặt ${stick} vào cạnh ${side + 1}`);
          emit(23, `gọi dfs(${i + 1})`);
          const completed = dfs(i + 1);
          locals.i = i;
          locals.stick = stick;
          locals.side = side;
          locals.seen = [...frame.seen];
          if (completed) {
            probe = { index: i, stick, side, kind: "kept", current: sides[side] };
            phase = "keep-choice";
            answer = true;
            emit(24, "giữ cách xếp này");
            callStack.pop();
            return true;
          }

          sides[side] -= stick;
          placements.pop();
          probe = { index: i, stick, side, kind: "backtrack", current: sides[side] };
          phase = "undo-stick";
          emit(25, `lấy ${stick} ra · thử lại`);
          emit(26, `cạnh ${side + 1} còn trống?`);
          if (sides[side] === 0) {
            probe = { index: i, stick, side, kind: "empty-break", current: 0 };
            phase = "skip-empty-symmetry";
            emit(27, "cạnh rỗng giống nhau");
            break;
          }
        }

        phase = "no-side-fits";
        emit(28, "que không vừa cạnh nào");
        callStack.pop();
        return false;
      }

      answer = dfs(0);
      locals.i = null;
      locals.stick = null;
      locals.side = null;
      locals.seen = [];
      phase = answer ? "square-complete" : "no-square";
      emit(29, "trả kết quả");
    }
  }

  const result = run.finish(answer, picture, { matchsticks: original });
  for (const step of result.steps) {
    step.matchsticks473View = step.pictureView;
    delete step.pictureView;
  }
  return result;
}

module.exports = {
  473: {
    id: 473,
    slug: "matchsticks-to-square",
    difficulty: "medium",
    category: { key: "backtracking", vi: "Quay lui", en: "Backtracking" },
    tags: [{ key: "backtracking", vi: "Quay lui", en: "Backtracking" }],
    title: bi("Matchsticks to Square", "Matchsticks to Square"),
    titleVi: bi("Ghép que diêm thành hình vuông", "Make a square with matchsticks"),
    statement: bi(
      "Dùng mỗi que đúng một lần để ghép thành hình vuông. Không cắt que.",
      "Use every matchstick exactly once to make a square. Do not break a stick.",
    ),
    defaultInput: "2,2,2,2,3,3,7,7",
    inputKind: "positive",
    inputLabel: bi("Độ dài que", "Matchstick lengths"),
    debugMode: "line-by-line",
    code: CODE,
    builder: buildSteps,
    liveArgs: (input) => [parseMatchsticks(input)],
    approach: [
      bi("Chia tổng độ dài cho 4 để biết mỗi cạnh cần dài bao nhiêu.", "Divide the total length by 4 to get the target length of each side."),
      bi("Xếp que dài trước rồi thử đặt lần lượt vào 4 cạnh.", "Sort longest first, then try each stick on the four sides."),
      bi("Khi một nhánh bế tắc, lấy que ra và thử cạnh khác; các cạnh có cùng tổng là đối xứng.", "If a branch fails, remove the stick and try another side; sides with the same total are symmetric."),
    ],
    complexity: {
      time: "O(4ⁿ) worst case · n ≤ 15",
      space: "O(n)",
      note: bi("Trace từng dòng; hình vuông đánh dấu cạnh đang thử và các lần quay lui.", "Line-by-line trace; the square highlights the side being tried and each backtrack."),
    },
    examples: [
      { input: "1,1,2,2,2", answer: true },
      { input: "2,2,2,2,3,3,7,7", answer: true },
      { input: "3,3,3,3,4", answer: false },
    ],
    parseInput: parseMatchsticks,
  },
};
