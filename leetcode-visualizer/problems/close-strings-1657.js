"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def closeStrings(self, word1: str, word2: str) -> bool:",
  "        if len(word1) != len(word2):",
  "            return False",
  "        count1, count2 = {}, {}",
  "        for ch in word1:",
  "            count1[ch] = count1.get(ch, 0) + 1",
  "        for ch in word2:",
  "            count2[ch] = count2.get(ch, 0) + 1",
  "        if count1.keys() != count2.keys():",
  "            return False",
  "        freq1 = sorted(count1.values())",
  "        freq2 = sorted(count2.values())",
  "        return freq1 == freq2",
];

function parseInput(input, params = {}) {
  for (const [name, value] of [["word1", input], ["word2", params.word2]]) {
    if (typeof value !== "string" || !/^[a-z]{1,100}$/.test(value)) {
      throw new Error(`1657: ${name} must contain 1–100 lowercase English letters for visualization / ${name} phải gồm 1–100 chữ thường a–z để mô phỏng.`);
    }
  }
  return { word1: input, word2: params.word2 };
}

function buildSteps(input, params) {
  const { word1, word2 } = parseInput(input, params);
  const letters = [...new Set(word1 + word2)].sort(), count1 = {}, count2 = {}, steps = [];
  let initialized = false, source = null, index = null, ch = null, processed1 = 0, processed2 = 0;
  let sameLetters = null, freq1 = null, freq2 = null, rank = null, checked = 0, answer = null;
  const emit = (line, phase, title, note, final = false) => steps.push({
    arr: [], codeLines: [line], title, note, final,
    vars: [{ name: "word1", value: word1 }, { name: "word2", value: word2 },
      ...(initialized ? [{ name: "count1", value: JSON.stringify(count1) }, { name: "count2", value: JSON.stringify(count2) }] : []),
      ...(ch === null ? [] : [{ name: "ch", value: ch }]),
      ...(freq1 === null ? [] : [{ name: "freq1", value: [...freq1] }]),
      ...(freq2 === null ? [] : [{ name: "freq2", value: [...freq2] }])],
    close1657View: { word1, word2, letters, count1: { ...count1 }, count2: { ...count2 }, source, index, ch,
      processed1, processed2, sameLetters, freq1: freq1 === null ? null : [...freq1], freq2: freq2 === null ? null : [...freq2], rank, checked, answer, phase },
  });
  const finish = (line, value, reason) => {
    answer = value;
    emit(line, "done", bi(`${value ? "True" : "False"}: ${reason.vi}`, `${value ? "True" : "False"}: ${reason.en}`), reason, true);
    return { original: word1, word2, answer, steps };
  };
  emit(3, "length", bi("Kiểm tra độ dài", "Check lengths"), bi(`word1 có ${word1.length} ký tự; word2 có ${word2.length} ký tự. Hai phép đổi đều giữ độ dài.`, `word1 has ${word1.length} characters; word2 has ${word2.length}. Both operations preserve length.`));
  if (word1.length !== word2.length) return finish(4, false, bi("Hai chuỗi khác độ dài.", "The strings have different lengths."));
  initialized = true;
  emit(5, "init", bi("Tạo hai bảng đếm rỗng", "Create two empty counters"), bi("Đếm riêng từng chuỗi để tìm tập chữ và các tần suất.", "Count each string separately to find its letter set and frequencies."));
  for (const name of ["word1", "word2"]) {
    source = name;
    const word = name === "word1" ? word1 : word2, counter = name === "word1" ? count1 : count2;
    for (index = 0; index < word.length; index++) {
      ch = word[index];
      emit(name === "word1" ? 6 : 8, "read", bi(`Đọc ${name}[${index}] = '${ch}'`, `Read ${name}[${index}] = '${ch}'`), bi("Chữ đang xét được tô tím. Tăng bộ đếm ở bước tiếp theo.", "The current letter is purple. Increment the counter next."));
      const before = counter[ch] || 0;
      counter[ch] = before + 1;
      if (name === "word1") processed1++; else processed2++;
      emit(name === "word1" ? 7 : 9, "count", bi(`'${ch}': ${before} → ${counter[ch]}`, `'${ch}': ${before} → ${counter[ch]}`), bi(`Đã đếm ${name === "word1" ? processed1 : processed2}/${word.length} ký tự của ${name}.`, `Counted ${name === "word1" ? processed1 : processed2}/${word.length} characters in ${name}.`));
    }
  }
  source = null; index = null; ch = null;
  sameLetters = letters.every(letter => Boolean(count1[letter]) === Boolean(count2[letter]));
  emit(10, "letters", bi("So sánh tập chữ xuất hiện", "Compare existing letter sets"), bi(sameLetters ? "Cùng tập chữ. Đổi toàn bộ hai chữ đã có sẽ hoán đổi tần suất; không tạo chữ mới." : "Tập chữ khác nhau. Chỉ được đổi hai chữ đã có, nên không thể tạo chữ đang thiếu.", sameLetters ? "The letter sets match. Swapping two existing letter identities exchanges their frequencies; it introduces no new letter." : "The letter sets differ. Only existing letters may exchange identities, so a missing letter cannot be introduced."));
  if (!sameLetters) return finish(11, false, bi("Tập chữ xuất hiện khác nhau.", "The existing letter sets differ."));
  freq1 = Object.values(count1).sort((a, b) => a - b);
  emit(12, "sort1", bi("Sắp xếp các tần suất của word1", "Sort word1 frequencies"), bi("Giữ đủ mọi tần suất, kể cả các giá trị lặp. Chưa so sánh với word2.", "Keep every frequency, including repeated values. word2 has not been compared yet."));
  freq2 = Object.values(count2).sort((a, b) => a - b);
  emit(13, "sort2", bi("Sắp xếp các tần suất của word2", "Sort word2 frequencies"), bi("So sánh danh sách tần suất; tần suất của cùng một chữ không nhất thiết bằng nhau.", "Compare frequency lists; the same letter need not have the same frequency in both strings."));
  for (rank = 0; rank < freq1.length; rank++) {
    const same = freq1[rank] === freq2[rank];
    if (same) checked++;
    emit(14, "compare", bi(`Vị trí ${rank}: ${freq1[rank]} ${same ? "=" : "≠"} ${freq2[rank]}`, `Position ${rank}: ${freq1[rank]} ${same ? "=" : "≠"} ${freq2[rank]}`), bi(same ? "Cặp tần suất này khớp. Các chữ ghi dưới cặp có thể đổi tên cho nhau qua các phép đổi chữ." : "Có tần suất không thể ghép cặp. Phép đổi chữ chỉ hoán vị các tần suất sẵn có.", same ? "This frequency pair matches. The letters underneath can be reassigned through letter-identity swaps." : "A frequency has no matching partner. Letter-identity swaps only permute existing frequencies."));
    if (!same) return finish(14, false, bi("Danh sách tần suất khác nhau.", "The frequency lists differ."));
  }
  rank = null;
  return finish(14, true, bi("Cùng tập chữ và cùng danh sách tần suất. Có thể đổi tên các chữ, rồi đổi vị trí để tạo word2.", "The letter sets and frequency lists match. Reassign letter identities, then rearrange positions to obtain word2."));
}

module.exports = {
  1657: {
    id: 1657, slug: "determine-if-two-strings-are-close", difficulty: "medium",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [{ key: "hashmap", vi: "Hash Map", en: "Hash Map" }, { key: "sorting", vi: "Sắp xếp", en: "Sorting" }],
    title: bi("Determine if Two Strings Are Close", "Determine if Two Strings Are Close"),
    titleVi: bi("Kiểm tra hai chuỗi có thể biến đổi", "Check whether two strings are close"),
    statement: bi("Cho word1 và word2 gồm chữ thường a–z. Được đổi vị trí hai ký tự bất kỳ, hoặc đổi toàn bộ lần xuất hiện của hai chữ đã có cho nhau. Trả True nếu biến đổi được chuỗi này thành chuỗi kia. Ví dụ: abc / bca → True; a / aa → False; cabbba / abbccc → True. Đề gốc nhận tối đa 100.000 ký tự mỗi chuỗi; mô phỏng nhận tối đa 100.", "Given lowercase strings word1 and word2, you may swap any two positions or exchange all occurrences of two existing letters. Return True if one string can become the other. Examples: abc / bca → True; a / aa → False; cabbba / abbccc → True. The original limit is 100,000 characters per string; visualization accepts up to 100."),
    inputKind: "string", preserveInputWhitespace: true,
    inputLabel: bi("word1 — 1–100 chữ thường a–z", "word1 — 1–100 lowercase letters a–z"), defaultInput: "cabbba",
    extraParams: [{ key: "word2", type: "string", label: bi("word2 — 1–100 chữ thường a–z", "word2 — 1–100 lowercase letters a–z"), default: "abbccc" }],
    debugMode: "line-by-line",
    approach: [
      bi("Khác độ dài → False. Đếm từng chữ của hai chuỗi.", "Different lengths → False. Count each letter in both strings."),
      bi("Tập chữ phải giống nhau: không phép nào tạo thêm hoặc xóa hẳn một chữ.", "The letter sets must match: neither operation adds or removes a letter identity."),
      bi("Sắp xếp các tần suất và so sánh cả danh sách, giữ các giá trị lặp.", "Sort and compare the complete frequency lists, retaining duplicates."),
      bi("Cả hai điều kiện đúng → đổi tên các chữ để khớp tần suất, rồi đổi vị trí.", "When both conditions hold, reassign letters to match frequencies, then rearrange positions."),
    ],
    complexity: { time: "O(n + m + k log k)", space: "O(k)", note: bi("n, m là độ dài hai chuỗi; k ≤ 26 chữ thường. Với bảng chữ cố định, thời gian O(n + m), bộ nhớ O(1); không tính các khung mô phỏng.", "n and m are the string lengths; k ≤ 26 lowercase letters. For this fixed alphabet, time is O(n + m) and space O(1); excludes visualization frames.") },
    code: SOURCE, builder: buildSteps,
    liveArgs: (input, params) => { const { word1, word2 } = parseInput(input, params); return [word1, word2]; },
  },
};
