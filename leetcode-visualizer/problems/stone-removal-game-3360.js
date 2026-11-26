"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = Object.freeze([
  "class Solution:",
  "",
  "    def canAliceWin(self, n):",
  "        for stones in range(10, -1, -1):",
  "            if stones > n:",
  "                return bool(stones % 2 == 1)",
  "            n -= stones",
]);
const MAX_STONES = 54;

function parseStones(input) {
  const value = Array.isArray(input) && input.length === 1 ? input[0] : input;
  if (!Number.isInteger(value) || value < 1 || value > MAX_STONES) {
    throw new RangeError(`#3360: n must be an integer in [1, ${MAX_STONES}] / n phải là số nguyên từ 1 đến ${MAX_STONES}.`);
  }
  return value;
}

function buildSteps(input) {
  const original = parseStones(input);
  const steps = [];
  const turns = [];
  let n = original;
  let stones = null;
  let possible = null;
  let winner = null;
  let currentPlayer = "Alice";

  function emit(line, event, final = false) {
    const view = {
      original,
      remaining: n,
      turns: turns.map((turn) => ({ ...turn })),
      current: stones === null || line === 7 ? null : { stones, player: currentPlayer, possible },
      event,
      winner,
      source: SOURCE[line - 1],
      line,
    };
    steps.push({
      arr: [],
      codeLines: [line],
      final,
      title: bi(event.vi, event.en),
      note: bi("", ""),
      vars: [
        { name: "n", value: n },
        ...(stones === null ? [] : [{ name: "stones", value: stones }]),
      ],
      stoneRemoval3360View: view,
    });
  }

  emit(3, bi("Bắt đầu", "Start"));
  for (stones = 10; stones >= 0; stones -= 1) {
    currentPlayer = turns.length % 2 === 0 ? "Alice" : "Bob";
    possible = null;
    emit(4, bi("Đến lượt", "Next turn"));
    possible = stones <= n;
    emit(5, bi(possible ? "Đủ đá" : "Không đủ đá", possible ? "Enough stones" : "Not enough stones"));
    if (!possible) {
      winner = stones % 2 === 1 ? "Alice" : "Bob";
      emit(6, bi(`${winner} thắng`, `${winner} wins`), true);
      return { original, answer: winner === "Alice", steps };
    }

    n -= stones;
    turns.push({ stones, player: currentPlayer });
    emit(7, bi("Lấy đá", "Remove stones"));
  }

  throw new Error("#3360: expected a player to run out of stones before the game ends.");
}

module.exports = {
  3360: {
    id: 3360,
    difficulty: "easy",
    slug: "stone-removal-game",
    category: { key: "math", vi: "Toán học", en: "Math" },
    tags: [
      { key: "math", vi: "Toán học", en: "Math" },
      { key: "simulation", vi: "Mô phỏng", en: "Simulation" },
    ],
    title: bi("Stone Removal Game", "Stone Removal Game"),
    titleVi: bi("Mỗi lượt lấy ít hơn 1 viên", "Remove one fewer stone each turn"),
    statement: bi(
      "Alice lấy 10 viên trước; mỗi lượt sau lấy ít hơn lượt trước 1 viên. Ai không lấy đủ số đá của lượt mình sẽ thua.",
      "Alice takes 10 stones first; each next turn takes one fewer. A player who cannot take the required number loses.",
    ),
    defaultInput: [12],
    inputKind: "positive",
    inputLabel: bi("n · 1–54 viên đá", "n · 1–54 stones"),
    singleInput: true,
    maxInput: MAX_STONES,
    extraParams: [],
    debugMode: "line-by-line",
    code: SOURCE,
    approach: [
      bi("Mỗi lượt cần lấy 10, 9, 8, … viên.", "Each turn must take 10, 9, 8, … stones."),
      bi("Dừng ngay khi số đá còn lại không đủ.", "Stop as soon as the pile is too small."),
      bi("Dòng code sáng lên khớp với từng thay đổi trên bàn đá.", "The highlighted code line follows each change on the stone table."),
    ],
    complexity: { time: "O(1)", space: "O(1)", note: bi("Tối đa 11 lượt.", "At most 11 turns.") },
    builder: buildSteps,
    liveArgs: (input) => [parseStones(input)],
  },
};
