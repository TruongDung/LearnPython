"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def toLowerCase(self, s: str) -> str:",
  "        result = []",
  "        for i, ch in enumerate(s):",
  "            if 'A' <= ch <= 'Z':",
  "                ch = chr(ord(ch) + 32)",
  "            result.append(ch)",
  "        return ''.join(result)",
];

function parseInput(input) {
  if (typeof input !== "string" || input.length < 1 || input.length > 100 || !/^[\x20-\x7e]+$/.test(input)) {
    throw new Error("709: s must contain 1–100 printable ASCII characters / s phải có 1–100 ký tự ASCII in được.");
  }
  return input;
}

function buildSteps(input) {
  const s = parseInput(input);
  const result = [];
  const steps = [];
  let index = null;
  let ch = null;
  let uppercase = null;
  let changed = false;
  const emit = (line, phase, title, note, final = false) => {
    steps.push({
      arr: [], codeLines: [line], final, title, note,
      vars: [{ name: "s", value: s }, { name: "result", value: [...result] },
        ...(index === null ? [] : [{ name: "i", value: index }, { name: "ch", value: ch }])],
      lowerCase709View: { s, index, ch, uppercase, changed, phase, result: [...result] },
    });
  };
  emit(3, "init", bi("Khởi tạo kết quả rỗng", "Start with an empty result"), bi("Đọc từng ký tự từ trái sang phải; chỉ đổi chữ hoa A–Z.", "Read from left to right; only uppercase A–Z will change."));
  for (index = 0; index < s.length; index++) {
    ch = s[index]; uppercase = null; changed = false;
    emit(4, "read", bi(`Đọc s[${index}] = ${JSON.stringify(ch)}`, `Read s[${index}] = ${JSON.stringify(ch)}`), bi("Chưa kiểm tra và chưa thêm ký tự này vào kết quả.", "This character has not been checked or appended yet."));
    uppercase = ch >= "A" && ch <= "Z";
    emit(5, "check", bi(`'A' ≤ ch ≤ 'Z' → ${uppercase ? "True" : "False"}`, `'A' ≤ ch ≤ 'Z' → ${uppercase ? "True" : "False"}`), bi(uppercase ? "Đây là chữ hoa: đổi sang chữ thường ở bước tiếp theo." : "Không phải chữ hoa A–Z: giữ nguyên, kể cả số, dấu câu và khoảng trắng.", uppercase ? "Uppercase letter: convert it in the next step." : "Outside A–Z: keep it unchanged, including digits, punctuation and spaces."));
    if (uppercase) {
      const before = ch;
      ch = String.fromCharCode(ch.charCodeAt(0) + 32);
      changed = true;
      emit(6, "convert", bi(`${before} → ${ch}`, `${before} → ${ch}`), bi(`ASCII ${before.charCodeAt(0)} + 32 = ${ch.charCodeAt(0)}. Đã đổi ch, chưa append.`, `ASCII ${before.charCodeAt(0)} + 32 = ${ch.charCodeAt(0)}. ch has changed; it is not appended yet.`));
    }
    result.push(ch);
    emit(7, "append", bi(`Thêm ${JSON.stringify(ch)} vào kết quả`, `Append ${JSON.stringify(ch)} to the result`), bi(`Đã xử lý ${result.length}/${s.length} ký tự.`, `Processed ${result.length}/${s.length} characters.`));
  }
  index = s.length - 1;
  const answer = result.join("");
  emit(8, "done", bi(`Kết quả: ${JSON.stringify(answer)}`, `Result: ${JSON.stringify(answer)}`), bi("Ghép các ký tự. Thứ tự, độ dài và mọi ký tự ngoài A–Z được giữ nguyên.", "Join the characters. Order, length and all characters outside A–Z are preserved."), true);
  return { original: s, answer, steps };
}

module.exports = {
  709: {
    id: 709, slug: "to-lower-case", difficulty: "easy",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: bi("To Lower Case", "To Lower Case"), titleVi: bi("Đổi chữ hoa thành chữ thường", "Convert uppercase letters to lowercase"),
    statement: bi("Cho chuỗi s gồm 1–100 ký tự ASCII in được. Đổi mọi chữ hoa thành chữ thường tương ứng; giữ nguyên các ký tự khác. Ví dụ: Hello → hello, here → here, LOVELY → lovely.", "Given s containing 1–100 printable ASCII characters, replace each uppercase letter with its lowercase equivalent. Keep other characters unchanged. Examples: Hello → hello, here → here, LOVELY → lovely."),
    inputKind: "string", preserveInputWhitespace: true,
    inputLabel: bi("s — 1–100 ký tự ASCII (giữ khoảng trắng)", "s — 1–100 ASCII characters (spaces preserved)"),
    defaultInput: "Hello", extraParams: [], debugMode: "line-by-line",
    approach: [
      bi("Duyệt từng ký tự và kiểm tra 'A' <= ch <= 'Z'.", "Scan each character and check 'A' <= ch <= 'Z'."),
      bi("Với chữ hoa, cộng 32 vào mã ASCII: A (65) → a (97), Z (90) → z (122).", "For uppercase letters, add 32 to the ASCII code: A (65) → a (97), Z (90) → z (122)."),
      bi("Thêm ký tự đã đổi hoặc giữ nguyên vào result, rồi ghép lại. Trong Python thực tế cũng có thể dùng s.lower().", "Append the converted or unchanged character to result, then join it. Python also provides s.lower()."),
    ],
    complexity: { time: "O(n)", space: "O(n)", note: bi("Mỗi ký tự xử lý một lần; danh sách kết quả chứa n ký tự. Không tính các khung mô phỏng.", "Each character is processed once; the result stores n characters. Excludes visualization frames.") },
    code: SOURCE, builder: buildSteps, liveArgs: input => [parseInput(input)],
  },
};
