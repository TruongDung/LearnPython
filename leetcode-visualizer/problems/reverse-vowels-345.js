"use strict";

const bi = (vi, en) => ({ vi, en });
const VOWELS = new Set("aeiouAEIOU");
const SOURCE = [
  "class Solution:",
  "    def reverseVowels(self, s: str) -> str:",
  "        vowels = set(\"aeiouAEIOU\")",
  "        chars = list(s)",
  "        left, right = 0, len(chars) - 1",
  "        while left < right:",
  "            while left < right and chars[left] not in vowels:",
  "                left += 1",
  "            while left < right and chars[right] not in vowels:",
  "                right -= 1",
  "            if left < right:",
  "                chars[left], chars[right] = chars[right], chars[left]",
  "                left += 1",
  "                right -= 1",
  "        return \"\".join(chars)",
];

function parseInput(input) {
  if (typeof input !== "string" || !/^[\x20-\x7e]{1,100}$/.test(input)) {
    throw new Error("345: s must contain 1–100 printable ASCII characters / s phải gồm 1–100 ký tự ASCII in được.");
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
    const activeIndex = Number.isInteger(extra.activeIndex) ? extra.activeIndex : null;
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
      reverseVowels345View: {
        original,
        chars: [...chars],
        left,
        right,
        phase,
        activeIndex,
        activeSide: extra.activeSide || null,
        lastSwap,
        skippedLeft: [...skippedLeft],
        skippedRight: [...skippedRight],
        swaps: swaps.map((swap) => ({ ...swap })),
        answer: extra.answer ?? null,
      },
    });
  };

  emit(3, "vowels", bi("Tạo tập hợp 10 nguyên âm", "Create the 10-vowel set"), bi("Tập hợp nhận cả nguyên âm viết thường và viết hoa để kiểm tra membership trong O(1).", "The set contains lowercase and uppercase vowels for O(1) membership checks."));
  emit(4, "copy", bi("Đổi chuỗi bất biến thành danh sách ký tự", "Copy the immutable string into a character list"), bi("Python string không sửa tại chỗ được; chars là vùng làm việc có thể hoán đổi.", "Python strings are immutable; chars is the mutable workspace used for swaps."));
  emit(5, "pointers", bi(`left = 0, right = ${right}`, `left = 0, right = ${right}`), bi("Hai con trỏ bắt đầu ở hai đầu và chỉ đi vào giữa.", "The two pointers start at opposite ends and only move inward."));

  while (left < right) {
    emit(6, "loop", bi(`left < right: ${left} < ${right}`, `left < right: ${left} < ${right}`), bi("Vẫn còn ít nhất hai vị trí có thể tạo thành một cặp nguyên âm.", "At least two positions remain that may form a vowel pair."));

    while (left < right && !VOWELS.has(chars[left])) {
      const skipped = left;
      emit(7, "check-left", bi(`'${chars[left]}' không phải nguyên âm`, `'${chars[left]}' is not a vowel`), bi("Ký tự không phải nguyên âm phải giữ nguyên vị trí, nên left bỏ qua nó.", "A non-vowel must stay in place, so the left pointer skips it."), { activeIndex: skipped, activeSide: "left" });
      skippedLeft.push(skipped);
      left += 1;
      emit(8, "move-left", bi(`left += 1 → ${left}`, `left += 1 → ${left}`), bi(`Đã loại vị trí ${skipped} khỏi các ứng viên cần đổi chỗ.`, `Position ${skipped} is no longer a swap candidate.`), { activeIndex: skipped, activeSide: "left" });
    }

    while (left < right && !VOWELS.has(chars[right])) {
      const skipped = right;
      emit(9, "check-right", bi(`'${chars[right]}' không phải nguyên âm`, `'${chars[right]}' is not a vowel`), bi("Ký tự không phải nguyên âm phải giữ nguyên vị trí, nên right bỏ qua nó.", "A non-vowel must stay in place, so the right pointer skips it."), { activeIndex: skipped, activeSide: "right" });
      skippedRight.push(skipped);
      right -= 1;
      emit(10, "move-right", bi(`right -= 1 → ${right}`, `right -= 1 → ${right}`), bi(`Đã loại vị trí ${skipped} khỏi các ứng viên cần đổi chỗ.`, `Position ${skipped} is no longer a swap candidate.`), { activeIndex: skipped, activeSide: "right" });
    }

    const canSwap = left < right;
    emit(11, "pair", bi(`left < right → ${canSwap ? "True" : "False"}`, `left < right → ${canSwap ? "True" : "False"}`), canSwap
      ? bi(`Đã tìm thấy cặp nguyên âm '${chars[left]}' và '${chars[right]}'.`, `Found the vowel pair '${chars[left]}' and '${chars[right]}'.`)
      : bi("Hai con trỏ đã gặp nhau; không còn cặp nguyên âm để đổi.", "The pointers have met; no vowel pair remains."));

    if (canSwap) {
      const swap = { left, right, leftBefore: chars[left], rightBefore: chars[right] };
      [chars[left], chars[right]] = [chars[right], chars[left]];
      swap.leftAfter = chars[left];
      swap.rightAfter = chars[right];
      swaps.push(swap);
      emit(12, "swap", bi(`Đổi '${swap.leftBefore}' ↔ '${swap.rightBefore}'`, `Swap '${swap.leftBefore}' ↔ '${swap.rightBefore}'`), bi("Chỉ hai nguyên âm đổi vị trí; mọi ký tự khác vẫn nằm đúng chỗ ban đầu.", "Only the two vowels exchange positions; every other character stays at its original index."), { lastSwap: swap });
      left += 1;
      emit(13, "advance-left", bi(`left += 1 → ${left}`, `left += 1 → ${left}`), bi("Nguyên âm bên trái đã được đặt xong, nên tiếp tục vào trong.", "The left vowel is finalized, so continue inward."));
      right -= 1;
      emit(14, "advance-right", bi(`right -= 1 → ${right}`, `right -= 1 → ${right}`), bi("Nguyên âm bên phải đã được đặt xong, nên tiếp tục vào trong.", "The right vowel is finalized, so continue inward."));
    }
  }

  const answer = chars.join("");
  emit(15, "done", bi(`Kết quả: '${answer}'`, `Result: '${answer}'`), bi(`Đã đảo thứ tự ${[...original].filter((char) => VOWELS.has(char)).length} nguyên âm bằng ${swaps.length} lần đổi chỗ.`, `Reversed ${[...original].filter((char) => VOWELS.has(char)).length} vowels using ${swaps.length} swaps.`), { answer, final: true });
  return { original, answer, steps };
}

module.exports = {
  345: {
    id: 345,
    slug: "reverse-vowels-of-a-string",
    difficulty: "easy",
    category: { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" },
    tags: [{ key: "string", vi: "Chuỗi", en: "String" }],
    title: bi("Reverse Vowels of a String", "Reverse Vowels of a String"),
    titleVi: bi("Đảo ngược các nguyên âm trong chuỗi", "Reverse only the vowels in a string"),
    statement: bi("Cho chuỗi s gồm các ký tự ASCII in được. Đảo thứ tự tất cả nguyên âm a, e, i, o, u (không phân biệt hoa thường), đồng thời giữ nguyên vị trí mọi ký tự khác. Ví dụ: IceCreAm → AceCreIm; leetcode → leotcede.", "Given a string s of printable ASCII characters, reverse all vowels a, e, i, o, u (case-insensitive) while keeping every other character at its original index. Examples: IceCreAm → AceCreIm; leetcode → leotcede."),
    inputKind: "string",
    preserveInputWhitespace: true,
    inputLabel: bi("s — 1–100 ký tự ASCII in được", "s — 1–100 printable ASCII characters"),
    defaultInput: "IceCreAm",
    extraParams: [],
    debugMode: "line-by-line",
    approach: [
      bi("Dùng left/right từ hai đầu; bỏ qua ký tự không phải nguyên âm.", "Use left/right pointers from both ends and skip non-vowels."),
      bi("Khi cả hai con trỏ đứng trên nguyên âm, đổi chỗ hai ký tự.", "When both pointers land on vowels, swap those two characters."),
      bi("Sau mỗi lần đổi, dời cả hai con trỏ vào trong cho đến khi gặp nhau.", "After each swap, move both pointers inward until they meet."),
      bi("Dùng list ký tự vì Python string là bất biến; cuối cùng join lại thành chuỗi.", "Use a character list because Python strings are immutable, then join it back into a string."),
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: bi("Mỗi con trỏ chỉ đi qua chuỗi một lần. Danh sách chars dùng O(n); không tính lịch sử các khung mô phỏng.", "Each pointer crosses the string once. The chars list uses O(n); excludes visualization-frame history."),
    },
    code: SOURCE,
    builder: buildSteps,
    liveArgs: (input) => [parseInput(input)],
  },
};
