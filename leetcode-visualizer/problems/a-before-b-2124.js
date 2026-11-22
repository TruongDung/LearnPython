"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def checkString(self, s: str) -> bool:",
  "        seen_b = False",
  "        for i, ch in enumerate(s):",
  "            if ch == 'b':",
  "                seen_b = True",
  "            elif seen_b:",
  "                return False",
  "        return True",
];

function parseInput(input) {
  if (typeof input !== "string" || input.length < 1 || input.length > 100 || /[^ab]/.test(input)) {
    throw new Error("2124: s chỉ gồm 1–100 ký tự a hoặc b / s must contain 1–100 characters, a or b only.");
  }
  return input;
}

function buildSteps(input) {
  const s = parseInput(input);
  const steps = [];
  let seenB = false;
  let firstB = null;
  let i = null;
  let ch = null;
  let processed = 0;
  let conflict = null;
  const emit = (line, phase, title, condition = null, answer = null) => {
    const vars = [{ name: "seen_b", value: seenB }];
    if (i !== null) vars.push({ name: "i", value: i }, { name: "ch", value: ch });
    steps.push({
      arr: [], highlight: [], mark: [], codeLines: [line], title, note: bi("", ""),
      vars, final: answer !== null,
      aBeforeB2124View: {
        s, i, ch, seenB, firstB, processed, phase, line,
        source: SOURCE[line - 1].trim(),
        condition: condition ? { ...condition } : null,
        conflict: conflict ? { ...conflict } : null,
        answer,
      },
    });
  };

  emit(3, "init", bi("Khởi tạo seen_b = False", "Initialize seen_b = False"));
  for (i = 0; i < s.length; i += 1) {
    ch = s[i];
    emit(4, "read", bi(`Đọc s[${i}] = '${ch}'`, `Read s[${i}] = '${ch}'`));
    emit(5, "check-b", bi(`ch == 'b' → ${ch === "b" ? "True" : "False"}`, `ch == 'b' → ${ch === "b" ? "True" : "False"}`), { expression: "ch == 'b'", value: ch === "b" });
    if (ch === "b") {
      seenB = true;
      if (firstB === null) firstB = i;
      processed = i + 1;
      emit(6, "remember-b", bi("Ghi nhớ: đã gặp b", "Remember: b has appeared"));
    } else {
      if (seenB) conflict = { b: firstB, a: i };
      else processed = i + 1;
      emit(7, "check-order", bi(`seen_b → ${seenB ? "True" : "False"}`, `seen_b → ${seenB ? "True" : "False"}`), { expression: "seen_b", value: seenB });
      if (seenB) {
        processed = i + 1;
        emit(8, "done", bi("a đứng sau b → False", "a follows b → False"), null, false);
        return { original: s, answer: false, steps };
      }
    }
  }
  // Python keeps the final loop variables after iteration ends.
  i = s.length - 1;
  emit(4, "exhausted", bi("Đã đọc hết chuỗi", "End of string"));
  emit(9, "done", bi("Đúng thứ tự → True", "Correct order → True"), null, true);
  return { original: s, answer: true, steps };
}

module.exports = {
  2124: {
    id: 2124,
    slug: "check-if-all-as-appears-before-all-bs",
    difficulty: "easy",
    category: { key: "string", vi: "Chuỗi", en: "String" },
    title: bi("Check if All A's Appears Before All B's", "Check if All A's Appears Before All B's"),
    titleVi: bi("Kiểm tra mọi a đứng trước mọi b", "Check that every a comes before every b"),
    statement: bi("Cho chuỗi s chỉ gồm a và b. Trả về True nếu mọi a đều đứng trước mọi b. Chuỗi chỉ có a hoặc chỉ có b cũng hợp lệ.", "Given a string s containing only a and b, return True if every a appears before every b. Strings with only a or only b are valid too."),
    inputKind: "string",
    preserveInputWhitespace: true,
    inputLabel: bi("s · 1–100 ký tự a / b", "s · 1–100 characters a / b"),
    defaultInput: "aababb",
    extraParams: [],
    debugMode: "line-by-line",
    approach: [bi("Gặp b: bật seen_b. Sau đó gặp a: trả về False.", "On b, set seen_b. If an a follows, return False.")],
    complexity: { time: "O(n)", space: "O(1)", note: bi("Một lượt quét, một cờ boolean. Không tính dữ liệu minh hoạ.", "One scan, one boolean flag. Excludes visualization data.") },
    code: SOURCE,
    builder: buildSteps,
    liveArgs: input => [parseInput(input)],
  },
};
