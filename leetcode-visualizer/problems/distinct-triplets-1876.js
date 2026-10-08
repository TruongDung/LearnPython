"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def countGoodSubstrings(self, s: str) -> int:",
  "        answer = 0",
  "        for left in range(len(s) - 2):",
  "            window = s[left:left + 3]",
  "            if len(set(window)) == 3:",
  "                answer += 1",
  "        return answer",
];

function parseInput(input) {
  if (typeof input !== "string" || !/^[a-z]{1,100}$/.test(input)) {
    throw new Error("1876: s must contain 1–100 lowercase English letters / s phải gồm 1–100 chữ thường a–z.");
  }
  return input;
}

function buildSteps(input) {
  const s = parseInput(input), steps = [], history = [];
  let left = null, window = null, distinct = null, good = null, answer = 0;
  const emit = (line, phase, title, note, final = false) => steps.push({
    arr: [], codeLines: [line], title, note, final,
    vars: [{ name: "s", value: s }, { name: "answer", value: answer },
      ...(left === null ? [] : [{ name: "left", value: left }]),
      ...(window === null ? [] : [{ name: "window", value: window }])],
    triplets1876View: { s, left, window, distinct, good, answer, phase, history: history.map(entry => ({ ...entry })) },
  });
  emit(3, "init", bi("Khởi tạo answer = 0", "Initialize answer = 0"), bi("Trượt cửa sổ dài đúng 3. Mỗi vị trí bắt đầu được kiểm tra một lần.", "Slide a window of exactly 3 characters. Check each starting position once."));
  if (s.length < 3) {
    emit(4, "short", bi("Không có cửa sổ đủ 3 ký tự", "No complete three-character window"), bi(`len(s) = ${s.length} < 3: vòng lặp không chạy.`, `len(s) = ${s.length} < 3: the loop has no iterations.`));
  }
  for (left = 0; left + 2 < s.length; left++) {
    window = null; distinct = null; good = null;
    emit(4, "move", bi(`Cửa sổ [${left}, ${left + 2}]`, `Window [${left}, ${left + 2}]`), bi("Hai cửa sổ liên tiếp chồng nhau 2 ký tự. Dịch sang phải đúng một vị trí.", "Consecutive windows overlap by 2 characters. Move right by one position."));
    window = s.slice(left, left + 3);
    emit(5, "window", bi(`window = '${window}'`, `window = '${window}'`), bi("Lấy 3 ký tự liền nhau, không phải chọn 3 vị trí bất kỳ.", "Take 3 adjacent characters, not any 3 positions."));
    distinct = new Set(window).size; good = distinct === 3;
    if (!good) history.push({ left, window, good });
    emit(6, "compare", bi(`${distinct} chữ khác nhau: ${good ? "đạt" : "không đạt"}`, `${distinct} distinct letters: ${good ? "good" : "not good"}`), bi(good ? "Ba chữ đều khác nhau. Tăng answer ở bước tiếp theo." : "Có chữ lặp, nên bỏ qua cửa sổ này và giữ nguyên answer.", good ? "All three letters differ. Increment answer in the next step." : "A letter repeats. Skip this window and keep answer unchanged."));
    if (good) {
      answer++; history.push({ left, window, good });
      emit(7, "count", bi(`Đếm '${window}': answer = ${answer}`, `Count '${window}': answer = ${answer}`), bi("Đếm theo vị trí. Cùng chuỗi con xuất hiện ở vị trí khác vẫn được tính thêm.", "Count occurrences by position. The same substring at another position counts again."));
    }
  }
  left = null; window = null; distinct = null; good = null;
  emit(8, "done", bi(`Kết quả: ${answer}`, `Result: ${answer}`), bi(`Đã xét ${Math.max(0, s.length - 2)} cửa sổ; ${answer} cửa sổ có đủ 3 chữ khác nhau.`, `Checked ${Math.max(0, s.length - 2)} windows; ${answer} have three distinct letters.`), true);
  return { original: s, answer, steps };
}

module.exports = {
  1876: {
    id: 1876, slug: "substrings-of-size-three-with-distinct-characters", difficulty: "easy",
    category: { key: "sliding", vi: "Cửa sổ trượt", en: "Sliding Window" },
    tags: [{ key: "string", vi: "Chuỗi", en: "String" }],
    title: bi("Substrings of Size Three with Distinct Characters", "Substrings of Size Three with Distinct Characters"),
    titleVi: bi("Đếm chuỗi con dài 3 có các chữ khác nhau", "Count length-three substrings with distinct letters"),
    statement: bi("Cho s gồm 1–100 chữ thường a–z. Đếm các chuỗi con liền nhau dài đúng 3, có 3 ký tự khác nhau. Mỗi lần xuất hiện đều được tính, kể cả chuỗi con giống nhau ở các vị trí khác. Ví dụ: xyzzaz → 1; aababcabc → 4; ab → 0.", "Given s containing 1–100 lowercase English letters, count contiguous substrings of exactly length 3 with three distinct characters. Count every occurrence, including identical substrings at different positions. Examples: xyzzaz → 1; aababcabc → 4; ab → 0."),
    inputKind: "string", preserveInputWhitespace: true,
    inputLabel: bi("s — 1–100 chữ thường a–z", "s — 1–100 lowercase letters a–z"), defaultInput: "aababcabc", extraParams: [], debugMode: "line-by-line",
    approach: [
      bi("Duyệt left từ 0 đến len(s) - 3; cửa sổ luôn có độ dài 3.", "Visit left from 0 through len(s) - 3; every window has length 3."),
      bi("Tạo set từ 3 chữ. Kích thước set bằng 3 nghĩa là không có chữ lặp.", "Build a set from the three letters. A set of size 3 means no repeated letter."),
      bi("Tăng answer cho từng cửa sổ đạt, kể cả nội dung đã xuất hiện trước đó.", "Increment answer for every good window, even if its text appeared earlier."),
      bi("Chuỗi ngắn hơn 3 không có cửa sổ đầy đủ, nên trả 0.", "A string shorter than 3 has no complete window, so return 0."),
    ],
    complexity: { time: "O(n)", space: "O(1)", note: bi("Mỗi cửa sổ chỉ có 3 ký tự. Set và chuỗi con có kích thước cố định; không tính lịch sử và các khung mô phỏng.", "Each window has just 3 characters. The set and substring use constant space; excludes history and visualization frames.") },
    code: SOURCE, builder: buildSteps, liveArgs: input => [parseInput(input)],
  },
};
