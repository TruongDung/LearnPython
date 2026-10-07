"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def findTheDifference(self, s: str, t: str) -> str:",
  "        count = {}",
  "        for ch in s:",
  "            count[ch] = count.get(ch, 0) + 1",
  "        for ch in t:",
  "            if count.get(ch, 0) == 0:",
  "                return ch",
  "            count[ch] -= 1",
];

function parseInput(input, params = {}) {
  const s = input, t = params.t;
  if (typeof s !== "string" || !/^[a-z]{0,100}$/.test(s) || typeof t !== "string" || !/^[a-z]{1,101}$/.test(t)) {
    throw new Error("389: s must contain 0–100 lowercase letters and t 1–101 / s phải gồm 0–100 chữ thường a–z (có thể rỗng), t gồm 1–101 chữ.");
  }
  const delta = {};
  for (const ch of t) delta[ch] = (delta[ch] || 0) + 1;
  for (const ch of s) delta[ch] = (delta[ch] || 0) - 1;
  const differences = Object.values(delta).filter(value => value !== 0);
  if (t.length !== s.length + 1 || differences.length !== 1 || differences[0] !== 1) {
    throw new Error("389: t must be a rearrangement of s plus exactly one letter / t phải là hoán vị của s cộng đúng một chữ cái.");
  }
  return { s, t };
}

function buildSteps(input, params) {
  const { s, t } = parseInput(input, params);
  const letters = [...new Set(s + t)].sort();
  const count = {}, total = {}, steps = [];
  let source = null, index = null, ch = null, available = null, answer = null;
  let processedS = 0, consumedT = 0;
  const emit = (line, phase, title, note, final = false) => steps.push({
    arr: [], codeLines: [line], title, note, final,
    vars: [{ name: "s", value: s }, { name: "t", value: t }, { name: "count", value: JSON.stringify(count) },
      ...(ch === null ? [] : [{ name: "ch", value: ch }])],
    difference389View: { s, t, letters, count: { ...count }, total: { ...total }, source, index, ch,
      processedS, consumedT, available, answer, phase },
  });
  emit(3, "init", bi("Khởi tạo bảng đếm", "Initialize the counter"), bi(
    s.length === 0 ? "s rỗng: không có ký tự để ghép. Ký tự duy nhất trong t chính là chữ thêm." : "Đếm các chữ của s trước. Thứ tự của t có thể khác s.",
    s.length === 0 ? "s is empty: there are no letters to match. The only letter in t is the added one." : "Count the letters in s first. Their order in t may differ."));
  source = "s";
  for (index = 0; index < s.length; index++) {
    ch = s[index];
    emit(4, "read-s", bi(`Đọc s[${index}] = '${ch}'`, `Read s[${index}] = '${ch}'`), bi("Chưa tăng bộ đếm của chữ này.", "This letter's counter has not increased yet."));
    const before = count[ch] || 0;
    count[ch] = before + 1; total[ch] = count[ch]; processedS++;
    emit(5, "count", bi(`count['${ch}']: ${before} → ${count[ch]}`, `count['${ch}']: ${before} → ${count[ch]}`), bi(`Đã đếm ${processedS}/${s.length} chữ của s.`, `Counted ${processedS}/${s.length} letters in s.`));
  }
  source = "t";
  for (index = 0; index < t.length; index++) {
    ch = t[index]; available = null;
    emit(6, "read-t", bi(`Đọc t[${index}] = '${ch}'`, `Read t[${index}] = '${ch}'`), bi("Kiểm tra còn lượt ghép của chữ này trong s hay không.", "Check whether s has a remaining occurrence of this letter."));
    available = (count[ch] || 0) > 0;
    emit(7, "check", bi(`count.get('${ch}', 0) == 0 → ${available ? "False" : "True"}`, `count.get('${ch}', 0) == 0 → ${available ? "False" : "True"}`), bi(
      available ? `Còn ${count[ch]} lượt của '${ch}'. Ghép một lượt ở bước tiếp theo.` : `Không còn lượt của '${ch}': đây là chữ được thêm, kể cả khi chữ này đã có trong s.`,
      available ? `${count[ch]} occurrence(s) of '${ch}' remain. Consume one next.` : `No occurrence of '${ch}' remains: this is the added letter, even if it already appeared in s.`));
    if (!available) {
      answer = ch;
      emit(8, "done", bi(`Ký tự thêm: '${ch}'`, `Added letter: '${ch}'`), bi(
        "Trả về chữ đầu tiên không còn lượt ghép. Đề bảo đảm t là hoán vị của s cộng đúng một chữ, nên có thể dừng ngay.",
        "Return the first letter with no remaining match. t is guaranteed to be s rearranged plus one letter, so stop immediately."), true);
      return { original: s, t, answer, steps };
    }
    const before = count[ch];
    count[ch]--; consumedT++;
    emit(9, "consume", bi(`Ghép '${ch}': ${before} → ${count[ch]}`, `Match '${ch}': ${before} → ${count[ch]}`), bi(
      `Đã ghép ${consumedT} chữ của t. count chỉ lưu các lượt còn lại.`,
      `Matched ${consumedT} letters from t. count stores only the remaining occurrences.`));
  }
}

module.exports = {
  389: {
    id: 389, slug: "find-the-difference", difficulty: "easy",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [{ key: "hashmap", vi: "Hash Map", en: "Hash Map" }],
    title: bi("Find the Difference", "Find the Difference"),
    titleVi: bi("Tìm chữ cái được thêm", "Find the added letter"),
    statement: bi("Chuỗi t được tạo bằng cách đảo thứ tự s rồi thêm đúng một chữ thường a–z vào vị trí bất kỳ. Trả về chữ được thêm; chữ đó có thể trùng chữ đã có. Ví dụ: abcd / abcde → e; chuỗi rỗng / y → y; a / aa → a. Đề gốc cho s dài tối đa 1.000; mô phỏng nhận tối đa 100 ký tự của s.", "t is formed by shuffling s and adding exactly one lowercase English letter anywhere. Return the added letter, which may already occur in s. Examples: abcd / abcde → e; empty string / y → y; a / aa → a. The original s limit is 1,000; visualization accepts up to 100 characters in s."),
    inputKind: "string", allowEmptyInput: true, preserveInputWhitespace: true,
    inputLabel: bi("s — 0–100 chữ thường a–z, có thể để trống", "s — 0–100 lowercase letters a–z; may be empty"),
    defaultInput: "abcd",
    extraParams: [{ key: "t", type: "string", label: bi("t — hoán vị của s cộng một chữ", "t — s rearranged plus one letter"), default: "abcde" }],
    debugMode: "line-by-line",
    approach: [
      bi("Đếm số lần xuất hiện của từng chữ trong s.", "Count each letter's occurrences in s."),
      bi("Duyệt t: nếu còn lượt ghép, trừ bộ đếm của chữ đó đi 1.", "Scan t: if a matching occurrence remains, decrement its counter by 1."),
      bi("Chữ có bộ đếm 0 là chữ thêm. Chữ vắng mặt trong dictionary cũng có giá trị mặc định 0.", "A letter with count zero is the added one. Missing dictionary keys also default to zero."),
      bi("Dừng và trả về chữ đó. Cách này vẫn đúng khi s rỗng hoặc chữ thêm đã có trong s.", "Stop and return that letter. This also handles empty s and repeated added letters."),
    ],
    complexity: { time: "O(n)", space: "O(1)", note: bi("n = len(s), len(t) = n + 1; mỗi chữ được xét tối đa một lần. Dictionary có tối đa 26 khóa; không tính các khung mô phỏng.", "n = len(s), len(t) = n + 1; each letter is visited at most once. The dictionary has at most 26 keys; excludes visualization frames.") },
    code: SOURCE, builder: buildSteps,
    liveArgs: (input, params) => { const { s, t } = parseInput(input, params); return [s, t]; },
  },
};
