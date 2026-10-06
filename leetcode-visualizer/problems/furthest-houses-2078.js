"use strict";

const { bi, parseIntegerArray } = require("./hard-viz-shared");
const SOURCE = Object.freeze([
  "class Solution:",
  "    def maxDistance(self, colors: list[int]) -> int:",
  "        n = len(colors)",
  "        right = n - 1",
  "        while colors[right] == colors[0]:",
  "            right -= 1",
  "        left = 0",
  "        while colors[left] == colors[n - 1]:",
  "            left += 1",
  "        from_first = right",
  "        from_last = n - 1 - left",
  "        answer = max(from_first, from_last)",
  "        return answer",
]);
const SOURCE2 = Object.freeze([
  "class Solution:",
  "    def maxDistance(self, colors):",
  "        n = len(colors)",
  "        left = right = 0",
  "",
  "        for i in range(n):",
  "            if colors[i] != colors[n - 1]:",
  "                right = max(right, n - 1 - i)",
  "",
  "            if colors[n - 1 - i] != colors[0]:",
  "                left = max(left, n - 1 - i)",
  "",
  "        return max(left, right)",
]);

function parseColors(input) {
  const colors = parseIntegerArray(input, { problemId: 2078, name: "colors", minLength: 2, maxLength: 100, minValue: 0, maxValue: 100 });
  if (new Set(colors).size < 2) throw new RangeError("#2078: cần ít nhất hai màu khác nhau / at least two different colors are required.");
  return colors;
}

function buildSteps(input) {
  const colors = parseColors(input);
  const n = colors.length;
  const steps = [];
  const locals = { colors, n };
  let right = null;
  let left = null;
  let phase = "initialize";
  let firstFound = false;
  let lastFound = false;
  let check = null;
  let answer = null;
  function emit(line, event, title, note, final = false) {
    steps.push({
      arr: [], codeLines: [line], final,
      title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`), note,
      vars: Object.entries(locals).map(([name, value]) => ({ name, value: Array.isArray(value) ? [...value] : value })),
      furthestHouses2078View: {
        line, source: SOURCE[line - 1], event, phase, colors: [...colors], n, right, left, check,
        firstFound, lastFound,
        firstPair: firstFound ? [0, right] : null,
        lastPair: lastFound ? [left, n - 1] : null,
        fromFirst: locals.from_first ?? null, fromLast: locals.from_last ?? null, answer,
      },
    });
  }
  emit(3, "length", bi(`n = ${n}`, `n = ${n}`), bi("Các nhà nằm tại chỉ số 0..n−1. Khoảng cách là số đoạn giữa hai chỉ số, không phải số nhà.", "Houses occupy indices 0..n−1. Distance counts the gaps between two indices, not the number of houses."));
  phase = "first";
  right = n - 1;
  locals.right = right;
  emit(4, "start-right", bi(`right = ${right}`, `right = ${right}`), bi("Giữ nhà 0 cố định. Bắt đầu từ nhà cuối và quét sang trái để tìm nhà khác màu xa nhất.", "Fix house 0. Start at the last house and scan left to find the furthest different color."));
  while (true) {
    check = colors[right] === colors[0];
    firstFound = !check;
    emit(5, "check-first", bi(`colors[${right}] == colors[0] → ${check ? "True" : "False"}`, `colors[${right}] == colors[0] → ${check ? "True" : "False"}`), bi(check ? `Cùng màu ${colors[0]}: cặp (0, ${right}) không hợp lệ. Tiếp tục sang trái.` : `Khác màu: (0, ${right}) là cặp xa nhất có nhà 0, khoảng cách ${right} − 0 = ${right}.`, check ? `Same color ${colors[0]}: pair (0, ${right}) is invalid. Continue left.` : `Different colors: (0, ${right}) is the furthest pair containing house 0; distance ${right} − 0 = ${right}.`));
    if (!check) break;
    right--;
    locals.right = right;
    check = null;
    emit(6, "move-right", bi(`right -= 1 → ${right}`, `right -= 1 → ${right}`), bi("Bỏ qua nhà vừa kiểm tra vì cùng màu. Con trỏ đã di chuyển; dòng while tiếp theo mới kiểm tra nhà mới.", "Skip the house just checked because its color matches. The pointer has moved; the next while line checks the new house."));
  }
  phase = "last";
  left = 0;
  locals.left = left;
  check = null;
  emit(7, "start-left", bi("left = 0", "left = 0"), bi(`Giữ nhà ${n - 1} cố định. Quét từ trái sang phải để tìm nhà khác màu xa nhất.`, `Fix house ${n - 1}. Scan from left to right to find its furthest different color.`));
  while (true) {
    check = colors[left] === colors[n - 1];
    lastFound = !check;
    emit(8, "check-last", bi(`colors[${left}] == colors[${n - 1}] → ${check ? "True" : "False"}`, `colors[${left}] == colors[${n - 1}] → ${check ? "True" : "False"}`), bi(check ? `Cùng màu ${colors[n - 1]}: cặp (${left}, ${n - 1}) không hợp lệ. Tiếp tục sang phải.` : `Khác màu: (${left}, ${n - 1}) là cặp xa nhất có nhà cuối, khoảng cách ${n - 1} − ${left} = ${n - 1 - left}.`, check ? `Same color ${colors[n - 1]}: pair (${left}, ${n - 1}) is invalid. Continue right.` : `Different colors: (${left}, ${n - 1}) is the furthest pair containing the last house; distance ${n - 1} − ${left} = ${n - 1 - left}.`));
    if (!check) break;
    left++;
    locals.left = left;
    check = null;
    emit(9, "move-left", bi(`left += 1 → ${left}`, `left += 1 → ${left}`), bi("Con trỏ đã sang nhà tiếp theo. Chưa kiểm tra màu của nhà mới.", "The pointer has advanced to the next house. Its color has not been checked yet."));
  }
  phase = "compare";
  check = null;
  locals.from_first = right;
  emit(10, "distance-first", bi(`from_first = ${right}`, `from_first = ${right}`), bi(`Cặp (0, ${right}): khoảng cách ${right} − 0 = ${right}.`, `Pair (0, ${right}): distance ${right} − 0 = ${right}.`));
  locals.from_last = n - 1 - left;
  emit(11, "distance-last", bi(`from_last = ${n - 1} − ${left} = ${locals.from_last}`, `from_last = ${n - 1} − ${left} = ${locals.from_last}`), bi("Hai khoảng cách có thể bằng nhau; cả hai cặp đều hợp lệ.", "The two distances may tie; both pairs are valid."));
  answer = Math.max(locals.from_first, locals.from_last);
  locals.answer = answer;
  emit(12, "maximum", bi(`answer = max(${locals.from_first}, ${locals.from_last}) = ${answer}`, `answer = max(${locals.from_first}, ${locals.from_last}) = ${answer}`), bi("Lấy khoảng cách lớn hơn. Nếu bằng nhau, cả hai cặp cùng đạt đáp án.", "Take the larger distance. If they tie, both pairs achieve the answer."));
  phase = "done";
  emit(13, "return", bi(`return ${answer}`, `return ${answer}`), bi("Đã tìm khoảng cách lớn nhất giữa hai nhà khác màu.", "Found the maximum distance between two differently colored houses."), true);
  return { original: [...colors], answer, steps };
}

function buildScanSteps(input) {
  const colors = parseColors(input);
  const n = colors.length;
  const steps = [];
  const locals = { colors, n };
  let left = null;
  let right = null;
  let i = null;
  let branch = null;
  let different = null;
  let before = null;
  let updated = null;
  let firstPair = null;
  let lastPair = null;
  let answer = null;
  let loopFinished = false;
  let previousVars = [{ name: "colors", value: [...colors] }];
  function emit(line, event, title, note, final = false) {
    const currentVars = Object.entries(locals).map(([name, value]) => ({ name, value: Array.isArray(value) ? [...value] : value }));
    steps.push({
      arr: [], codeLines: [line], codeBlock: 2, final,
      title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`), note,
      vars: currentVars,
      furthestHouses2078ScanView: {
        line, source: SOURCE2[line - 1], event, colors: [...colors], n, i,
        mirrored: i === null ? null : n - 1 - i,
        left, right, branch, different, before, updated, answer, loopFinished,
        beforeVars: previousVars.map(entry => ({ ...entry, value: Array.isArray(entry.value) ? [...entry.value] : entry.value })),
        nextLine: null, nextSource: null,
        skippedLine: event === "check-right" && !different ? 8 : event === "check-left" && !different ? 11 : null,
        firstPair: firstPair ? [...firstPair] : null,
        lastPair: lastPair ? [...lastPair] : null,
      },
    });
    previousVars = currentVars;
  }
  emit(3, "length", bi(`n = ${n}`, `n = ${n}`), bi("Cách 2 dùng một vòng for để xét đồng thời từ hai đầu đường.", "Approach 2 uses one for loop to examine the street from both ends."));
  left = right = 0;
  locals.left = left;
  locals.right = right;
  emit(4, "initialize", bi("left = right = 0", "left = right = 0"), bi("left/right là khoảng cách tốt nhất, không phải chỉ số con trỏ. Chưa tìm được cặp hợp lệ nào.", "left/right are best distances, not pointer indices. No valid pair has been found yet."));
  for (let index = 0; index < n; index++) {
    i = index;
    locals.i = i;
    const mirrored = n - 1 - i;
    branch = null;
    different = null;
    before = null;
    updated = null;
    emit(6, "round", bi(`i = ${i}; n − 1 − i = ${mirrored}`, `i = ${i}; n − 1 − i = ${mirrored}`), bi(`Vòng ${i + 1}/${n}: xét nhà ${i} với nhà cuối, rồi nhà ${mirrored} với nhà đầu. Hai vị trí có thể gặp hoặc đi qua nhau; vẫn tiếp tục đủ n vòng.`, `Round ${i + 1}/${n}: check house ${i} against the last house, then house ${mirrored} against the first. The positions may meet or cross; continue all n rounds.`));
    branch = "right";
    different = colors[i] !== colors[n - 1];
    before = right;
    emit(7, "check-right", bi(`colors[${i}] != colors[${n - 1}] → ${different ? "True" : "False"}`, `colors[${i}] != colors[${n - 1}] → ${different ? "True" : "False"}`), bi(different ? `Cặp (${i}, ${n - 1}) khác màu, khoảng cách ${mirrored}. Dòng tiếp theo mới cập nhật right.` : `Cùng màu ${colors[i]}: bỏ qua cặp (${i}, ${n - 1}); giữ right = ${right}.`, different ? `Pair (${i}, ${n - 1}) has different colors and distance ${mirrored}. The next line updates right.` : `Same color ${colors[i]}: skip pair (${i}, ${n - 1}); keep right = ${right}.`));
    if (different) {
      updated = mirrored > right;
      right = Math.max(right, mirrored);
      locals.right = right;
      if (updated) lastPair = [i, n - 1];
      emit(8, "update-right", bi(`right = max(${before}, ${mirrored}) = ${right}`, `right = max(${before}, ${mirrored}) = ${right}`), bi(updated ? "Tìm được khoảng cách lớn hơn: lưu cặp mới với nhà cuối." : "Cặp này hợp lệ nhưng gần hơn hoặc bằng: max giữ kết quả và cặp tốt nhất cũ.", updated ? "Found a larger distance: retain this new pair with the last house." : "This pair is valid but closer or tied: max preserves the previous best distance and pair."));
    }
    branch = "left";
    different = colors[mirrored] !== colors[0];
    before = left;
    updated = null;
    emit(10, "check-left", bi(`colors[${mirrored}] != colors[0] → ${different ? "True" : "False"}`, `colors[${mirrored}] != colors[0] → ${different ? "True" : "False"}`), bi(different ? `Cặp (0, ${mirrored}) khác màu, khoảng cách ${mirrored}. Dòng tiếp theo mới cập nhật left.` : `Cùng màu ${colors[mirrored]}: bỏ qua cặp (0, ${mirrored}); giữ left = ${left}.`, different ? `Pair (0, ${mirrored}) has different colors and distance ${mirrored}. The next line updates left.` : `Same color ${colors[mirrored]}: skip pair (0, ${mirrored}); keep left = ${left}.`));
    if (different) {
      updated = mirrored > left;
      left = Math.max(left, mirrored);
      locals.left = left;
      if (updated) firstPair = [0, mirrored];
      emit(11, "update-left", bi(`left = max(${before}, ${mirrored}) = ${left}`, `left = max(${before}, ${mirrored}) = ${left}`), bi(updated ? "Lưu khoảng cách lớn hơn và cặp mới với nhà đầu." : "Ứng viên không lớn hơn kết quả cũ: left và cặp tốt nhất giữ nguyên.", updated ? "Retain the larger distance and new pair with the first house." : "The candidate is no larger than the previous best: keep left and its best pair."));
    }
  }
  i = null;
  branch = null;
  different = null;
  before = null;
  updated = null;
  loopFinished = true;
  emit(6, "loop-end", bi("for: đã hết phần tử trong range(n)", "for: range(n) is exhausted"), bi(`Không còn i mới. Biến Python i vẫn là ${n - 1}; rời vòng lặp và chuyển đến return ở dòng 13.`, `No new i remains. Python's i still equals ${n - 1}; exit the loop and continue to return on line 13.`));
  answer = Math.max(left, right);
  emit(13, "return", bi(`return max(${left}, ${right}) → ${answer}`, `return max(${left}, ${right}) → ${answer}`), bi("Đã xét đủ n vòng. Trả về khoảng cách tốt nhất giữa hai nhóm cặp; các cặp xanh đạt đáp án.", "All n rounds are complete. Return the best distance across both groups; green pairs achieve the answer."), true);
  steps.forEach((step, index) => {
    const nextLine = steps[index + 1]?.codeLines[0] ?? null;
    step.furthestHouses2078ScanView.nextLine = nextLine;
    step.furthestHouses2078ScanView.nextSource = nextLine === null ? null : SOURCE2[nextLine - 1];
  });
  return { original: [...colors], answer, steps };
}

module.exports = {
  2078: {
    id: 2078, difficulty: "easy", slug: "two-furthest-houses-with-different-colors",
    category: { key: "greedy", vi: "Tham lam", en: "Greedy" },
    tags: [{ key: "array", vi: "Mảng", en: "Array" }],
    title: bi("Hai ngôi nhà khác màu xa nhất", "Two Furthest Houses With Different Colors"),
    titleVi: bi("Giữ từng nhà ở đầu đường, rồi quét từ đầu đối diện", "Fix each endpoint and scan from the opposite end"),
    statement: bi("Cho colors gồm n nhà nằm cách đều trên một đường thẳng; colors[i] là màu của nhà i. Trả về khoảng cách |i−j| lớn nhất giữa hai nhà khác màu. Có ít nhất hai màu khác nhau.", "Given colors for n evenly spaced houses, colors[i] is house i's color. Return the maximum index distance |i−j| between two differently colored houses. At least two colors differ."),
    defaultInput: [1, 1, 1, 6, 1, 1, 1], inputKind: "nonneg",
    inputLabel: bi("colors (2–100 nhà; màu 0..100; ít nhất hai màu)", "colors (2–100 houses; colors 0..100; at least two colors)"),
    extraParams: [{
      key: "approach", type: "select", default: 1,
      label: bi("Cách giải", "Approach"),
      options: [
        { value: 1, label: bi("Cách 1: Hai lượt while", "Approach 1: Two while scans") },
        { value: 2, label: bi("Cách 2: Một vòng for, quét hai đầu", "Approach 2: One for loop, both ends") },
      ],
    }], debugMode: "line-by-line",
    approach: [
      bi("Giữ nhà 0: quét right từ n−1 sang trái, bỏ các nhà cùng màu với colors[0]. Nhà khác màu đầu tiên là xa nhất với nhà 0.", "Fix house 0: scan right from n−1 to the left, skipping its color. The first different color is the furthest valid partner for house 0."),
      bi("Giữ nhà n−1: quét left từ 0 sang phải đến nhà đầu tiên khác màu với colors[n−1].", "Fix house n−1: scan left from 0 to the right until the first different color."),
      bi("Trả về max(right, n−1−left). Đếm số đoạn giữa hai nhà, không đếm số nhà.", "Return max(right, n−1−left). Count gaps between the houses, not houses."),
      bi("Vì sao chỉ cần hai đầu? Nếu hai đầu khác màu, đáp án là n−1. Nếu cùng màu C, mọi cặp hợp lệ có một nhà khác C; kéo nhà còn lại về một đầu đường vẫn khác màu và không giảm khoảng cách.", "Why endpoints suffice: if their colors differ, distance n−1 is optimal. If both have color C, every valid pair contains a house unlike C; extend the other house to an endpoint to keep different colors without reducing the distance."),
      bi("Cách 2: trong mỗi vòng i, xét (i,n−1) để cập nhật right, rồi (0,n−1−i) để cập nhật left. left/right lưu khoảng cách lớn nhất; max không làm mất kết quả khi gặp cặp gần hơn.", "Approach 2: each round i checks (i,n−1) to update right, then (0,n−1−i) to update left. left/right retain maximum distances; max preserves the result when a closer pair appears."),
    ],
    complexity: { time: "O(n)", space: "O(1) auxiliary", note: bi("Mỗi lượt quét tối đa n nhà. Các bản sao mảng chỉ phục vụ mô phỏng.", "Each scan visits at most n houses. Array snapshots are only for the visualization.") },
    code: SOURCE, codeLabel: bi("Cách 1: Hai lượt while", "Approach 1: Two while scans"),
    code2: SOURCE2, code2Label: bi("Cách 2: Một vòng for, quét hai đầu", "Approach 2: One for loop, both ends"),
    builder: buildSteps, builder2: buildScanSteps, liveArgs: input => [parseColors(input)],
  },
};
