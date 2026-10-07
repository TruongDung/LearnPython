"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def longestPalindrome(self, s: str) -> int:",
  "        count = {}",
  "        for ch in s:",
  "            count[ch] = count.get(ch, 0) + 1",
  "        length, has_odd = 0, False",
  "        for ch in sorted(count):",
  "            pairs = count[ch] // 2",
  "            length += pairs * 2",
  "            if count[ch] % 2:",
  "                has_odd = True",
  "        return length + int(has_odd)",
];

function parseInput(input) {
  if (typeof input !== "string" || !/^[A-Za-z]{1,100}$/.test(input)) {
    throw new Error("409: s must contain 1–100 English letters (A–Z, a–z) for visualization / s phải gồm 1–100 chữ cái A–Z, a–z để mô phỏng.");
  }
  return input;
}

function buildSteps(input) {
  const s = parseInput(input);
  const letters = [...new Set(s)].sort();
  const count = {}, used = {}, pairCounts = {}, oddLetters = [], checked = [], steps = [];
  let index = null, ch = null, processed = 0, length = null, hasOdd = null;
  let pairs = null, odd = null, center = null, left = "", answer = null;
  const emit = (line, phase, title, note, final = false) => steps.push({
    arr: [], codeLines: [line], title, note, final,
    vars: [{ name: "s", value: s }, { name: "count", value: JSON.stringify(count) },
      ...(ch === null ? [] : [{ name: "ch", value: ch }]),
      ...(length === null ? [] : [{ name: "length", value: length }, { name: "has_odd", value: hasOdd }]),
      ...(pairs === null ? [] : [{ name: "pairs", value: pairs }])],
    palindrome409View: { s, letters, count: { ...count }, used: { ...used }, pairCounts: { ...pairCounts },
      oddLetters: [...oddLetters], checked: [...checked], index, ch, processed, length, hasOdd, pairs, odd,
      center, left, answer, phase },
  });
  emit(3, "init", bi("Khởi tạo bảng đếm", "Initialize the counter"), bi("Có thể đổi thứ tự các chữ để tạo palindrome. A và a là hai ký tự khác nhau.", "Rearrange the letters to build a palindrome. A and a are different characters."));
  for (index = 0; index < s.length; index++) {
    ch = s[index];
    emit(4, "read", bi(`Đọc s[${index}] = '${ch}'`, `Read s[${index}] = '${ch}'`), bi("Đếm chữ đang xét ở bước tiếp theo; giữ nguyên hoa/thường.", "Count this letter next; preserve its case."));
    const before = count[ch] || 0;
    count[ch] = before + 1; processed++;
    emit(5, "count", bi(`count['${ch}']: ${before} → ${count[ch]}`, `count['${ch}']: ${before} → ${count[ch]}`), bi(`Đã đếm ${processed}/${s.length} ký tự.`, `Counted ${processed}/${s.length} characters.`));
  }
  index = null; ch = null; length = 0; hasOdd = false;
  emit(6, "prepare", bi("Bắt đầu ghép các cặp", "Start assembling pairs"), bi("Hai bên phải đối xứng: mỗi cặp chữ đóng góp 2 vào độ dài. Tâm chỉ có một vị trí.", "The sides must mirror each other: each equal-letter pair contributes 2. There is only one center position."));
  for (ch of letters) {
    pairs = null; odd = null;
    emit(7, "select", bi(`Xét '${ch}': ${count[ch]} lần`, `Inspect '${ch}': ${count[ch]} occurrences`), bi("Tính số cặp từ tần suất của riêng ký tự này.", "Compute pairs from this character's frequency."));
    pairs = Math.floor(count[ch] / 2); pairCounts[ch] = pairs;
    emit(8, "pairs", bi(`${count[ch]} // 2 = ${pairs} cặp`, `${count[ch]} // 2 = ${pairs} pair(s)`), bi(`Có thể đặt ${pairs} chữ '${ch}' ở mỗi bên; chưa cộng vào length.`, `Place ${pairs} '${ch}' letter(s) on each side; length has not increased yet.`));
    length += pairs * 2; used[ch] = pairs * 2; left += ch.repeat(pairs);
    emit(9, "add", bi(`length += ${pairs} × 2 → ${length}`, `length += ${pairs} × 2 → ${length}`), bi("Hai nửa của ví dụ bên dưới là ảnh gương. length hiện chỉ tính các cặp, chưa cộng tâm.", "The example's halves mirror each other. length counts only paired letters, not the center yet."));
    odd = count[ch] % 2 === 1;
    if (!odd) checked.push(ch);
    emit(10, "odd-check", bi(`count['${ch}'] % 2 → ${odd ? 1 : 0}`, `count['${ch}'] % 2 → ${odd ? 1 : 0}`), bi(odd ? "Còn dư một chữ. Đánh dấu có thể dùng một tâm ở bước tiếp theo." : "Tần suất chẵn: không dư chữ nào.", odd ? "One letter remains. Mark a possible center in the next step." : "Even frequency: no letter remains."));
    if (odd) {
      const alreadyHadCenter = hasOdd;
      hasOdd = true; oddLetters.push(ch); checked.push(ch);
      if (center === null) center = ch;
      emit(11, "center", bi("has_odd = True", "has_odd = True"), bi(
        alreadyHadCenter ? `Ví dụ đã chọn '${center}' làm tâm. '${ch}' cũng lẻ nhưng không được cộng thêm một tâm nữa.` : `Chọn '${ch}' làm tâm cho ví dụ. Khi trả kết quả sẽ cộng đúng 1.`,
        alreadyHadCenter ? `The example already uses '${center}' as center. '${ch}' is also odd, but cannot add another center.` : `Use '${ch}' as the example's center. Add exactly 1 to the final result.`));
    }
  }
  ch = null; pairs = null; odd = null;
  answer = length + Number(hasOdd);
  emit(12, "done", bi(`Độ dài lớn nhất: ${answer}`, `Maximum length: ${answer}`), bi(
    `${length} ký tự từ các cặp + ${hasOdd ? 1 : 0} ở giữa = ${answer}. Có thể có nhiều cách ghép; ví dụ chỉ là một cách.`,
    `${length} paired letters + ${hasOdd ? 1 : 0} center letter = ${answer}. Multiple arrangements may work; this is one example.`), true);
  const palindrome = left + (center || "") + [...left].reverse().join("");
  return { original: s, answer, palindrome, steps };
}

module.exports = {
  409: {
    id: 409, slug: "longest-palindrome", difficulty: "easy",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [{ key: "hashmap", vi: "Hash Map", en: "Hash Map" }, { key: "greedy", vi: "Tham lam", en: "Greedy" }],
    title: bi("Longest Palindrome", "Longest Palindrome"),
    titleVi: bi("Độ dài palindrome có thể ghép", "Length of a palindrome you can build"),
    statement: bi("Cho s gồm chữ cái hoa và thường. Trả độ dài palindrome dài nhất có thể tạo bằng cách sắp xếp lại các chữ của s; không nhất thiết dùng hết. Phân biệt hoa/thường: A khác a. Ví dụ: abccccdd → 7; a → 1; Aa → 1. Đề gốc nhận tối đa 2.000 ký tự; mô phỏng nhận tối đa 100.", "Given uppercase and lowercase English letters in s, return the longest palindrome length obtainable by rearranging them; you need not use every letter. Case matters: A differs from a. Examples: abccccdd → 7; a → 1; Aa → 1. The original limit is 2,000 characters; visualization accepts up to 100."),
    inputKind: "string", preserveInputWhitespace: true,
    inputLabel: bi("s — 1–100 chữ cái A–Z, a–z (phân biệt hoa/thường)", "s — 1–100 letters A–Z, a–z (case sensitive)"),
    defaultInput: "abccccdd", extraParams: [], debugMode: "line-by-line",
    approach: [
      bi("Đếm tần suất riêng cho từng ký tự, giữ nguyên hoa/thường.", "Count each character's frequency, preserving case."),
      bi("Mỗi chữ có count // 2 cặp; cộng 2 cho mỗi cặp để đặt đối xứng hai bên.", "Each character provides count // 2 pairs; add 2 per pair for the mirrored sides."),
      bi("Nếu có bất kỳ tần suất lẻ nào, cộng đúng 1 cho tâm. Các chữ lẻ khác không thêm tâm được.", "If any frequency is odd, add exactly 1 for the center. Other odd letters cannot add more centers."),
      bi("Bài hỏi độ dài có thể ghép lại, không hỏi chuỗi con đối xứng có sẵn trong s.", "The problem asks for a length after rearrangement, rather than an existing palindromic substring of s."),
    ],
    complexity: { time: "O(n)", space: "O(1)", note: bi("Đếm n ký tự, rồi xét tối đa 52 chữ hoa/thường. Dictionary và sắp xếp tối đa 52 khóa dùng bộ nhớ hằng số; không tính ví dụ ghép và các khung mô phỏng.", "Count n characters, then inspect at most 52 case-sensitive letters. The dictionary and sorting at most 52 keys use constant space; excludes the example arrangement and visualization frames.") },
    code: SOURCE, builder: buildSteps, liveArgs: input => [parseInput(input)],
  },
};
