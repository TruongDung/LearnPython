"use strict";

const bi = (vi, en) => ({ vi, en });
const CODE = Object.freeze([
  "class Solution:",
  "    def arrangeCoins(self, n: int) -> int:",
  "        lo, hi = 0, n",
  "        while lo < hi:",
  "            mid = (lo + hi + 1) // 2",
  "            needed = mid * (mid + 1) // 2",
  "            if needed <= n:",
  "                lo = mid",
  "            else:",
  "                hi = mid - 1",
  "        return lo",
]);

function parseInput(input) {
  if (!Array.isArray(input) || input.length !== 1 || !Number.isInteger(input[0]) || input[0] < 1 || input[0] > 2147483647) {
    throw new RangeError("441: n must be one integer in [1, 2147483647] / n là một số nguyên từ 1 đến 2147483647.");
  }
  return input[0];
}

const triangular = rows => BigInt(rows) * (BigInt(rows) + 1n) / 2n;

function buildSteps(input) {
  const n = parseInput(input), budget = BigInt(n);
  let lo, hi, mid, needed, neededForMid, round = 0;
  const steps = [];
  function emit(line, phase, extra = {}) {
    const locals = { n };
    for (const [name, value] of Object.entries({ lo, hi, mid, needed })) {
      if (value !== undefined) locals[name] = typeof value === "bigint" ? value.toString() : value;
    }
    const candidateRows = extra.final ? lo : mid;
    const rowNumbers = candidateRows === undefined ? [] : candidateRows <= 8
      ? Array.from({ length: candidateRows }, (_, i) => i + 1)
      : [1, 2, 3, 4, candidateRows - 1, candidateRows];
    if (extra.final) rowNumbers.push(lo + 1);
    const picture = rowNumbers.map(row => {
      const remaining = budget - triangular(row - 1);
      const filled = remaining <= 0n ? 0 : Number(remaining < BigInt(row) ? remaining : BigInt(row));
      return { row, filled, missing: row - filled, incomplete: !!extra.final && row === lo + 1 };
    });
    const evaluated = needed !== undefined && neededForMid === mid;
    const view = {
      phase, source: { line, text: CODE[line - 1], timing: "before" },
      n, lo: lo ?? null, hi: hi ?? null, mid: mid ?? null, round, locals,
      candidateRows: candidateRows ?? null,
      needed: evaluated ? needed.toString() : null,
      feasible: evaluated ? needed <= budget : null,
      difference: evaluated ? (budget - needed).toString() : null,
      picture, cropped: candidateRows > 8,
      answer: null, final: false, ...extra,
    };
    steps.push({
      arr: [], highlight: [], mark: [], codeLines: [line], final: !!extra.final,
      title: bi("Xếp các hàng đồng xu", "Arrange rows of coins"), note: bi("", ""),
      vars: Object.entries(locals).map(([name, value]) => ({ name, value })),
      arrangingCoins441View: view,
    });
  }
  emit(3, "init"); lo = 0; hi = n;
  while (true) {
    emit(4, "while"); if (!(lo < hi)) break;
    emit(5, "mid"); mid = Math.floor((lo + hi + 1) / 2); round++;
    // Python integers are exact; BigInt keeps large trial costs exact too.
    emit(6, "calculate"); needed = triangular(mid); neededForMid = mid;
    emit(7, "compare");
    if (needed <= budget) { emit(8, "keep", { nextLo: mid, nextHi: hi }); lo = mid; }
    else { emit(10, "discard", { nextLo: lo, nextHi: mid - 1 }); hi = mid - 1; }
  }
  const used = Number(triangular(lo));
  emit(11, "result", { final: true, answer: lo, used, remaining: n - used, nextNeeded: Number(triangular(lo + 1)), missingNext: lo + 1 - (n - used) });
  return { original: [n], n, answer: lo, steps };
}

module.exports = { 441: {
  id: 441, difficulty: "easy", slug: "arranging-coins",
  category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
  tags: [{ key: "math", vi: "Toán học", en: "Math" }],
  title: bi("Arranging Coins", "Arranging Coins"),
  titleVi: bi("Xếp đồng xu thành bậc thang", "Build a coin staircase"),
  statement: bi("Có n đồng xu. Hàng thứ i cần i đồng xu. Trả về số hàng đầy đủ; hàng cuối còn thiếu không được tính.", "You have n coins. Row i needs i coins. Return the number of complete rows; an incomplete last row does not count."),
  defaultInput: [8], inputKind: "integer", inputLabel: bi("n · 1–2147483647", "n · 1–2147483647"), extraParams: [],
  approach: [
    bi("Thử k hàng: cần 1 + 2 + … + k = k(k+1)/2 xu.", "Try k rows: need 1 + 2 + … + k = k(k+1)/2 coins."),
    bi("Đủ xu → giữ k, thử nhiều hàng hơn. Thiếu xu → bỏ k và các số lớn hơn.", "Enough coins → keep k and try more rows. Not enough → discard k and larger counts."),
    bi("Dùng mid làm tròn lên để khoảng có hai số vẫn thu hẹp. lo = hi là đáp án.", "Round mid upward so an interval of two values still shrinks. lo = hi is the answer."),
  ],
  complexity: { time: "O(log n)", space: "O(1)", note: bi("Python dùng số nguyên chính xác. Hình rút gọn hàng lớn nhưng giữ đúng số xu.", "Python uses exact integers. Large rows are condensed visually while counts remain exact.") },
  code: CODE, debugMode: "line-by-line", builder: buildSteps,
  liveArgs: input => [parseInput(input)], parseInput,
} };
