"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def frequencySort(self, s: str) -> str:",
  "        count = {}",
  "        for ch in s:",
  "            count[ch] = count.get(ch, 0) + 1",
  "        ordered = sorted(count, key=lambda ch: (-count[ch], ch))",
  "        result = []",
  "        for ch in ordered:",
  "            result.append(ch * count[ch])",
  "        return ''.join(result)",
];

function parseInput(input) {
  if (typeof input !== "string" || !/^[A-Za-z0-9]{1,100}$/.test(input)) {
    throw new Error("451: s must contain 1–100 English letters or digits for visualization / s phải gồm 1–100 chữ cái A–Z, a–z hoặc chữ số 0–9 để mô phỏng.");
  }
  return input;
}

function buildSteps(input) {
  const s = parseInput(input);
  const letters = [...new Set(s)], count = {}, result = [], steps = [];
  let index = null, ch = null, processed = 0, ordered = null, initializedResult = false, answer = null;
  const emit = (line, phase, title, note, final = false) => steps.push({
    arr: [], codeLines: [line], title, note, final,
    vars: [{ name: "s", value: s }, { name: "count", value: JSON.stringify(count) },
      ...(ch === null ? [] : [{ name: "ch", value: ch }]),
      ...(ordered === null ? [] : [{ name: "ordered", value: [...ordered] }]),
      ...(initializedResult ? [{ name: "result", value: [...result] }] : [])],
    frequency451View: { s, letters, count: { ...count }, index, ch, processed, ordered: ordered === null ? null : [...ordered], result: [...result], answer, phase },
  });
  emit(3, "init", bi("Khởi tạo bảng đếm", "Initialize the counter"), bi("Đếm riêng chữ hoa, chữ thường và chữ số. A và a là hai ký tự khác nhau.", "Count uppercase letters, lowercase letters and digits separately. A and a are different characters."));
  for (index = 0; index < s.length; index++) {
    ch = s[index];
    emit(4, "read", bi(`Đọc s[${index}] = '${ch}'`, `Read s[${index}] = '${ch}'`), bi("Ký tự đang xét được tô tím. Chưa tăng tần suất ở bước này.", "The current character is purple. Its frequency has not increased yet."));
    const before = count[ch] || 0;
    count[ch] = before + 1; processed++;
    emit(5, "count", bi(`count['${ch}']: ${before} → ${count[ch]}`, `count['${ch}']: ${before} → ${count[ch]}`), bi(`Đã đếm ${processed}/${s.length} ký tự.`, `Counted ${processed}/${s.length} characters.`));
  }
  index = null; ch = null;
  ordered = [...letters].sort((a, b) => count[b] - count[a] || (a < b ? -1 : a > b ? 1 : 0));
  emit(6, "sort", bi("Sắp xếp theo tần suất giảm dần", "Sort by decreasing frequency"), bi("Khóa -count[ch] đưa chữ xuất hiện nhiều lên trước. Khi bằng tần suất, mô phỏng chọn thứ tự mã ký tự; đề chấp nhận mọi thứ tự giữa các nhóm bằng nhau.", "The key -count[ch] puts frequent characters first. Ties use character-code order here; the problem accepts any order among equal-frequency groups."));
  initializedResult = true;
  emit(7, "prepare", bi("Tạo danh sách kết quả rỗng", "Create an empty result list"), bi("Mỗi nhóm ký tự giống nhau phải nằm liền nhau trong kết quả.", "Identical characters must form one contiguous group in the output."));
  for (ch of ordered) {
    emit(8, "select", bi(`Chọn '${ch}': ${count[ch]} lần`, `Select '${ch}': ${count[ch]} occurrences`), bi(`Tạo nhóm '${ch}' × ${count[ch]} ở bước tiếp theo.`, `Build the group '${ch}' × ${count[ch]} next.`));
    const chunk = ch.repeat(count[ch]); result.push(chunk);
    emit(9, "append", bi(`Thêm nhóm ${JSON.stringify(chunk)}`, `Append group ${JSON.stringify(chunk)}`), bi("Ghép đủ tất cả lần xuất hiện của ký tự này, rồi chuyển sang nhóm kế tiếp.", "Append every occurrence of this character, then move to the next group."));
  }
  ch = null; answer = result.join("");
  emit(10, "done", bi(`Kết quả: ${answer}`, `Result: ${answer}`), bi("Các nhóm có tần suất không tăng từ trái sang phải. Mọi ký tự đầu vào được giữ đủ, không thêm hoặc bỏ chữ.", "Group frequencies never increase from left to right. Every input occurrence is preserved; no characters are added or removed."), true);
  return { original: s, answer, steps };
}

module.exports = {
  451: {
    id: 451, slug: "sort-characters-by-frequency", difficulty: "medium",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    tags: [{ key: "hashmap", vi: "Hash Map", en: "Hash Map" }, { key: "sorting", vi: "Sắp xếp", en: "Sorting" }],
    title: bi("Sort Characters By Frequency", "Sort Characters By Frequency"),
    titleVi: bi("Sắp xếp ký tự theo tần suất", "Sort characters by frequency"),
    statement: bi("Cho s gồm chữ cái hoa/thường và chữ số. Ghép các ký tự giống nhau thành nhóm, rồi sắp xếp các nhóm theo tần suất giảm dần. Các nhóm bằng tần suất có thể đổi thứ tự; A khác a. Ví dụ: tree → eert hoặc eetr; cccaaa → aaaccc hoặc cccaaa; Aabb → bbAa. Đề gốc nhận tối đa 500.000 ký tự; mô phỏng nhận tối đa 100.", "Given s containing uppercase/lowercase English letters and digits, group identical characters and order the groups by decreasing frequency. Equal-frequency groups may appear in any order; A differs from a. Examples: tree → eert or eetr; cccaaa → aaaccc or cccaaa; Aabb → bbAa. The original limit is 500,000 characters; visualization accepts up to 100."),
    inputKind: "string", preserveInputWhitespace: true,
    inputLabel: bi("s — 1–100 chữ cái A–Z, a–z hoặc chữ số 0–9", "s — 1–100 letters A–Z, a–z or digits 0–9"),
    defaultInput: "tree", extraParams: [], debugMode: "line-by-line",
    approach: [
      bi("Đếm số lần xuất hiện của từng ký tự bằng dictionary.", "Count each character's occurrences in a dictionary."),
      bi("Sắp xếp các ký tự khác nhau theo -count[ch]; thứ tự phụ theo ch giúp kết quả ổn định khi hòa.", "Sort distinct characters by -count[ch]; use ch as a secondary key for deterministic ties."),
      bi("Với mỗi ký tự, tạo nhóm ch * count[ch], thêm vào result rồi nối các nhóm.", "For each character, append ch * count[ch] to result, then join the groups."),
      bi("Tần suất bằng nhau cho phép nhiều đáp án, nhưng cùng ký tự phải nằm liền nhau.", "Tied frequencies allow multiple answers, but identical characters must stay together."),
    ],
    complexity: { time: "O(n + k log k)", space: "O(n + k)", note: bi("n là độ dài s, k là số ký tự khác nhau (tối đa 62). Đếm n ký tự, sắp xếp k khóa và lưu kết quả dài n; không tính các khung mô phỏng.", "n is the input length; k is the distinct character count (at most 62). Count n characters, sort k keys and store n output characters; excludes visualization frames.") },
    code: SOURCE, builder: buildSteps, liveArgs: input => [parseInput(input)],
  },
};
