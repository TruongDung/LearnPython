"use strict";

const bi = (vi, en) => ({ vi, en });
const isLetter = (char) => /^[A-Za-z]$/.test(char);
const SOURCE = [
  "class Solution:",
  "    def reverseOnlyLetters(self, s: str) -> str:",
  "        chars = list(s)",
  "        left, right = 0, len(chars) - 1",
  "        while left < right:",
  "            while left < right and not chars[left].isalpha():",
  "                left += 1",
  "            while left < right and not chars[right].isalpha():",
  "                right -= 1",
  "            if left < right:",
  "                chars[left], chars[right] = chars[right], chars[left]",
  "                left += 1",
  "                right -= 1",
  "        return \"\".join(chars)",
];

function parseInput(input) {
  if (typeof input !== "string" || !/^[\x21-\x7a]{1,100}$/.test(input)) {
    throw new Error("917: s must contain 1–100 ASCII characters with codes 33–122 / s phải gồm 1–100 ký tự ASCII có mã 33–122.");
  }
  return input;
}

function buildSteps(input) {
  const original = parseInput(input);
  const chars = [...original];
  const steps = [];
  const skippedLeft = [];
  const skippedRight = [];
  const swaps = [];
  let left = 0;
  let right = chars.length - 1;

  const emit = (line, phase, title, note, extra = {}) => {
    const lastSwap = extra.lastSwap ? { ...extra.lastSwap } : null;
    steps.push({
      arr: [...chars],
      highlight: [left, right].filter((index, position, values) => index >= 0 && index < chars.length && values.indexOf(index) === position),
      mark: lastSwap ? [lastSwap.left, lastSwap.right] : [],
      codeLines: [line],
      title,
      note,
      final: Boolean(extra.final),
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        { name: "chars", value: JSON.stringify(chars.join("")) },
        { name: "swaps", value: swaps.length },
      ],
      reverseLetters917View: {
        original,
        chars: [...chars],
        left,
        right,
        phase,
        activeIndex: Number.isInteger(extra.activeIndex) ? extra.activeIndex : null,
        activeSide: extra.activeSide || null,
        lastSwap,
        skippedLeft: [...skippedLeft],
        skippedRight: [...skippedRight],
        swaps: swaps.map((swap) => ({ ...swap })),
        answer: extra.answer ?? null,
      },
    });
  };

  emit(3, "copy", bi("Tạo danh sách ký tự có thể sửa", "Create a mutable character list"), bi("Python string là bất biến; chars cho phép đổi chỗ hai chữ cái tại chỗ.", "Python strings are immutable; chars allows two letters to be swapped in place."));
  emit(4, "pointers", bi(`left = 0, right = ${right}`, `left = 0, right = ${right}`), bi("Hai con trỏ tìm chữ cái tiếp theo từ hai đầu.", "The two pointers search for the next letters from opposite ends."));

  while (left < right) {
    emit(5, "loop", bi(`left < right: ${left} < ${right}`, `left < right: ${left} < ${right}`), bi("Vùng chưa xử lý vẫn có ít nhất hai vị trí.", "The unprocessed range still contains at least two positions."));

    while (left < right && !isLetter(chars[left])) {
      const skipped = left;
      emit(6, "check-left", bi(`'${chars[left]}' không phải chữ cái`, `'${chars[left]}' is not a letter`), bi("Chữ số và ký hiệu phải giữ nguyên index, nên left bỏ qua vị trí này.", "Digits and symbols must keep their indices, so left skips this position."), { activeIndex: skipped, activeSide: "left" });
      skippedLeft.push(skipped);
      left += 1;
      emit(7, "move-left", bi(`left += 1 → ${left}`, `left += 1 → ${left}`), bi(`Vị trí ${skipped} được khóa nguyên trạng.`, `Position ${skipped} is locked in place.`), { activeIndex: skipped, activeSide: "left" });
    }

    while (left < right && !isLetter(chars[right])) {
      const skipped = right;
      emit(8, "check-right", bi(`'${chars[right]}' không phải chữ cái`, `'${chars[right]}' is not a letter`), bi("Chữ số và ký hiệu phải giữ nguyên index, nên right bỏ qua vị trí này.", "Digits and symbols must keep their indices, so right skips this position."), { activeIndex: skipped, activeSide: "right" });
      skippedRight.push(skipped);
      right -= 1;
      emit(9, "move-right", bi(`right -= 1 → ${right}`, `right -= 1 → ${right}`), bi(`Vị trí ${skipped} được khóa nguyên trạng.`, `Position ${skipped} is locked in place.`), { activeIndex: skipped, activeSide: "right" });
    }

    const canSwap = left < right;
    emit(10, "pair", bi(`left < right → ${canSwap ? "True" : "False"}`, `left < right → ${canSwap ? "True" : "False"}`), canSwap
      ? bi(`'${chars[left]}' và '${chars[right]}' đều là chữ cái.`, `'${chars[left]}' and '${chars[right]}' are both letters.`)
      : bi("Hai con trỏ đã gặp nhau; không còn cặp chữ cái để đổi.", "The pointers have met; no letter pair remains."));

    if (canSwap) {
      const swap = { left, right, leftBefore: chars[left], rightBefore: chars[right] };
      [chars[left], chars[right]] = [chars[right], chars[left]];
      swap.leftAfter = chars[left];
      swap.rightAfter = chars[right];
      swaps.push(swap);
      emit(11, "swap", bi(`Đổi '${swap.leftBefore}' ↔ '${swap.rightBefore}'`, `Swap '${swap.leftBefore}' ↔ '${swap.rightBefore}'`), bi("Thứ tự chữ cái được đảo dần; mọi chữ số và ký hiệu vẫn ở index ban đầu.", "The letter order is reversed incrementally while every digit and symbol stays at its original index."), { lastSwap: swap });
      left += 1;
      emit(12, "advance-left", bi(`left += 1 → ${left}`, `left += 1 → ${left}`), bi("Chữ cái bên trái đã đúng vị trí cuối cùng.", "The left letter is now in its final position."));
      right -= 1;
      emit(13, "advance-right", bi(`right -= 1 → ${right}`, `right -= 1 → ${right}`), bi("Chữ cái bên phải đã đúng vị trí cuối cùng.", "The right letter is now in its final position."));
    }
  }

  const answer = chars.join("");
  const letterCount = [...original].filter(isLetter).length;
  emit(14, "done", bi(`Kết quả: '${answer}'`, `Result: '${answer}'`), bi(`Đã đảo ${letterCount} chữ cái bằng ${swaps.length} lần đổi chỗ; các ký tự khác không di chuyển.`, `Reversed ${letterCount} letters with ${swaps.length} swaps; all other characters remained fixed.`), { answer, final: true });
  return { original, answer, steps };
}

module.exports = {
  917: {
    id: 917,
    slug: "reverse-only-letters",
    difficulty: "easy",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    tags: [{ key: "string", vi: "Chuỗi", en: "String" }],
    title: bi("Reverse Only Letters", "Reverse Only Letters"),
    titleVi: bi("Chỉ đảo ngược các chữ cái", "Reverse only the letters"),
    statement: bi("Cho chuỗi s gồm 1–100 ký tự ASCII có mã từ 33 đến 122. Đảo thứ tự các chữ cái tiếng Anh, nhưng giữ nguyên index của mọi chữ số và ký hiệu. Ví dụ: ab-cd → dc-ba.", "Given a string s of 1–100 ASCII characters with codes 33 through 122, reverse the English letters while keeping every digit and symbol at its original index. Example: ab-cd → dc-ba."),
    inputKind: "string",
    preserveInputWhitespace: true,
    inputLabel: bi("s — 1–100 ký tự ASCII (mã 33–122)", "s — 1–100 ASCII characters (codes 33–122)"),
    defaultInput: "a-bC-dEf-ghIj",
    extraParams: [],
    debugMode: "line-by-line",
    approach: [
      bi("Dùng left/right từ hai đầu để tìm hai chữ cái tiếp theo.", "Use left/right pointers to find the next two letters from opposite ends."),
      bi("Bỏ qua chữ số và ký hiệu để chúng giữ nguyên vị trí.", "Skip digits and symbols so they remain at their original positions."),
      bi("Đổi chỗ hai chữ cái rồi thu hẹp cả hai phía.", "Swap the two letters, then shrink from both sides."),
      bi("Cuối cùng join danh sách ký tự thành chuỗi kết quả.", "Finally join the character list into the result string."),
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: bi("Mỗi vị trí được hai con trỏ đi qua tối đa một lần. chars dùng O(n); không tính dữ liệu trace.", "Each position is crossed by the pointers at most once. chars uses O(n); excludes trace data."),
    },
    code: SOURCE,
    builder: buildSteps,
    liveArgs: (input) => [parseInput(input)],
  },
};
