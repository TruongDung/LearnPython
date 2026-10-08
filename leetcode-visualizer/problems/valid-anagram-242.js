"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def isAnagram(self, s: str, t: str) -> bool:",
  "        if len(s) != len(t):",
  "            return False",
  "        count_s, count_t = {}, {}",
  "        for ch in s:",
  "            count_s[ch] = count_s.get(ch, 0) + 1",
  "        for ch in t:",
  "            count_t[ch] = count_t.get(ch, 0) + 1",
  "        for ch in sorted(count_s.keys() | count_t.keys()):",
  "            if count_s.get(ch, 0) != count_t.get(ch, 0):",
  "                return False",
  "        return True",
];

function parseInput(input, params = {}) {
  for (const [name, value] of [["s", input], ["t", params.t]]) {
    if (typeof value !== "string" || !/^[a-z]{1,100}$/.test(value)) {
      throw new Error(`242: ${name} must contain 1–100 lowercase English letters for visualization / ${name} phải gồm 1–100 chữ cái thường a–z để mô phỏng.`);
    }
  }
  return { s: input, t: params.t };
}

function buildSteps(input, params) {
  const { s, t } = parseInput(input, params);
  const letters = [...new Set(s + t)].sort();
  const countS = {}, countT = {};
  const checked = [];
  const steps = [];
  let source = null, index = null, ch = null, answer = null;
  let processedS = 0, processedT = 0, same = null, initialized = false;
  const emit = (line, phase, title, note, final = false) => {
    steps.push({
      arr: [], codeLines: [line], title, note, final,
      vars: [{ name: "s", value: s }, { name: "t", value: t },
        ...(initialized ? [{ name: "count_s", value: JSON.stringify(countS) }, { name: "count_t", value: JSON.stringify(countT) }] : []),
        ...(ch === null ? [] : [{ name: "ch", value: ch }])],
      anagram242View: { s, t, letters, countS: { ...countS }, countT: { ...countT },
        processedS, processedT, checked: [...checked], source, index, ch, same, answer, phase },
    });
  };
  const differentLength = s.length !== t.length;
  emit(3, "length", bi("Kiểm tra độ dài", "Check lengths"), bi(
    differentLength ? `len(s) = ${s.length}, len(t) = ${t.length}: khác độ dài.` : `Cùng độ dài ${s.length}. Cần kiểm tra số lần xuất hiện của từng chữ.`,
    differentLength ? `len(s) = ${s.length}, len(t) = ${t.length}: different lengths.` : `Both lengths are ${s.length}. Every letter's frequency must also match.`));
  if (differentLength) {
    answer = false;
    emit(4, "done", bi("False: khác độ dài", "False: different lengths"), bi("Hoán vị giữ nguyên số ký tự. Dừng trước khi đếm.", "Rearranging letters preserves length. Stop before counting."), true);
    return { original: s, t, answer, steps };
  }
  initialized = true;
  emit(5, "init", bi("Tạo hai bảng đếm rỗng", "Create two empty counters"), bi("Số 0 là số lần đã đếm, chưa phải tần suất cuối cùng.", "Zero means no occurrences counted yet, not the final frequency."));
  for (const name of ["s", "t"]) {
    source = name;
    const word = name === "s" ? s : t;
    const counts = name === "s" ? countS : countT;
    for (index = 0; index < word.length; index++) {
      ch = word[index];
      emit(name === "s" ? 6 : 8, "read", bi(`Đọc ${name}[${index}] = '${ch}'`, `Read ${name}[${index}] = '${ch}'`), bi("Chữ đang xét được tô tím. Tăng bộ đếm ở bước tiếp theo.", "The current letter is purple. Increment its counter in the next step."));
      const previous = counts[ch] || 0;
      counts[ch] = previous + 1;
      if (name === "s") processedS++; else processedT++;
      emit(name === "s" ? 7 : 9, "count", bi(`count_${name}['${ch}']: ${previous} → ${counts[ch]}`, `count_${name}['${ch}']: ${previous} → ${counts[ch]}`), bi(`Đã đếm ${name === "s" ? processedS : processedT}/${word.length} ký tự của ${name}.`, `Counted ${name === "s" ? processedS : processedT}/${word.length} characters in ${name}.`));
    }
  }
  source = null; index = null;
  for (ch of letters) {
    same = null;
    emit(10, "select", bi(`Chọn chữ '${ch}' để so sánh`, `Select '${ch}' for comparison`), bi("Đã đếm xong cả hai chuỗi. Chữ không xuất hiện có tần suất 0.", "Both strings have been counted. An absent letter has frequency zero."));
    same = (countS[ch] || 0) === (countT[ch] || 0);
    if (same) checked.push(ch);
    emit(11, "compare", bi(`'${ch}': ${countS[ch] || 0} ${same ? "=" : "≠"} ${countT[ch] || 0}`, `'${ch}': ${countS[ch] || 0} ${same ? "=" : "≠"} ${countT[ch] || 0}`), bi(same ? "Số lần xuất hiện bằng nhau. Tiếp tục với chữ kế tiếp." : "Số lần xuất hiện khác nhau. Hai chuỗi không phải anagram.", same ? "Frequencies match. Continue with the next letter." : "Frequencies differ. The strings are not anagrams."));
    if (!same) {
      answer = false;
      emit(12, "done", bi(`False: tần suất '${ch}' khác nhau`, `False: different frequency for '${ch}'`), bi("Một chữ lệch tần suất là đủ để dừng; không cần kiểm tra các chữ còn lại.", "One frequency mismatch is enough to stop; other letters do not need checking."), true);
      return { original: s, t, answer, steps };
    }
  }
  ch = null; same = null; answer = true;
  emit(13, "done", bi("True: hai chuỗi là anagram", "True: the strings are anagrams"), bi("Cùng độ dài và mọi chữ đều có cùng tần suất. Thứ tự các chữ có thể khác nhau.", "The lengths and all frequencies match. Letter order may differ."), true);
  return { original: s, t, answer, steps };
}

module.exports = {
  242: {
    id: 242, slug: "valid-anagram", difficulty: "easy",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [{ key: "hashmap", vi: "Hash Map", en: "Hash Map" }],
    title: bi("Valid Anagram", "Valid Anagram"),
    titleVi: bi("Kiểm tra hai chuỗi hoán vị", "Check whether two strings are anagrams"),
    statement: bi("Cho hai chuỗi s và t gồm chữ thường a–z. Trả True nếu t là hoán vị của s: mỗi chữ xuất hiện cùng số lần, dù thứ tự khác nhau. Ví dụ: anagram / nagaram → True; rat / car → False. Đề gốc cho tối đa 50.000 ký tự mỗi chuỗi; mô phỏng nhận tối đa 100 để xem từng bước.", "Given lowercase English strings s and t, return True if t is an anagram of s: every letter occurs equally often, regardless of order. Examples: anagram / nagaram → True; rat / car → False. The original limit is 50,000 characters per string; visualization accepts up to 100 to keep individual steps readable."),
    inputKind: "string", preserveInputWhitespace: true,
    inputLabel: bi("s — 1–100 chữ thường a–z", "s — 1–100 lowercase letters a–z"),
    defaultInput: "anagram",
    extraParams: [{ key: "t", type: "string", label: bi("t — 1–100 chữ thường a–z", "t — 1–100 lowercase letters a–z"), default: "nagaram" }],
    debugMode: "line-by-line",
    approach: [
      bi("Kiểm tra độ dài trước: khác độ dài → False.", "Check lengths first: different lengths → False."),
      bi("Đếm từng chữ của s và t vào hai dictionary.", "Count each letter of s and t in two dictionaries."),
      bi("So sánh tần suất từng chữ; chữ vắng mặt được tính là 0. Dừng ở chênh lệch đầu tiên.", "Compare each letter's frequency; absent letters count as zero. Stop at the first mismatch."),
      bi("Chỉ trả True khi mọi tần suất trùng nhau. Cùng tập chữ hoặc cùng độ dài chưa đủ.", "Return True only if every frequency matches. Equal lengths or letter sets alone are insufficient."),
    ],
    complexity: { time: "O(n + m)", space: "O(1)", note: bi("n và m là độ dài hai chuỗi; mỗi bảng đếm có tối đa 26 chữ. Sắp xếp tối đa 26 khóa; không tính khung mô phỏng.", "n and m are the string lengths; each counter has at most 26 letters. Sorts at most 26 keys; excludes visualization frames.") },
    code: SOURCE, builder: buildSteps,
    liveArgs: (input, params) => { const { s, t } = parseInput(input, params); return [s, t]; },
  },
};
