"use strict";

const base = require("./backtracking")[17];
const { bi } = require("./hard-viz-shared");
const KEYPAD = Object.freeze({ 2: "abc", 3: "def", 4: "ghi", 5: "jkl", 6: "mno", 7: "pqrs", 8: "tuv", 9: "wxyz" });
const CODE = Object.freeze([
  "class Solution:",
  "    def letterCombinations(self, digits):",
  "        if not digits:",
  "            return []",
  "        mapping = {'2':'abc','3':'def','4':'ghi','5':'jkl','6':'mno','7':'pqrs','8':'tuv','9':'wxyz'}",
  "        result = []",
  "        current = []",
  "        def backtrack(idx):",
  "            if idx == len(digits):",
  "                result.append(''.join(current))",
  "                return",
  "            for letter in mapping[digits[idx]]:",
  "                current.append(letter)",
  "                backtrack(idx + 1)",
  "                current.pop()",
  "        backtrack(0)",
  "        return result",
]);

function parse17(input) {
  if (typeof input !== "string" || !/^[2-9]{0,4}$/.test(input)) throw new RangeError("#17: nhập 0–4 chữ số từ 2 đến 9 / enter 0–4 digits from 2 to 9.");
  return input;
}

function buildSteps17(input) {
  const digits = parse17(input), current = [], result = [], stack = [], steps = [];
  let mappingReady = false, resultReady = false, currentReady = false, nextId = 0;
  function emit(line, phase, title, detail = {}, final = false) {
    const f = stack.at(-1), idx = f?.idx, validIndex = idx !== undefined && idx < digits.length;
    const from = final ? 0 : Math.max(0, result.length - 12);
    const locals = { digits, ...(f ? { idx, ...(f.letter === undefined ? {} : { letter: f.letter }) } : {}),
      ...(currentReady ? { current: [...current] } : {}) };
    steps.push({ title, note: bi("", ""), arr: [], codeLines: [line], final,
      vars: [
        { name: "idx", value: idx ?? "—" }, { name: "digits[idx]", value: validIndex ? digits[idx] : "—" },
        { name: "mapping[digits[idx]]", value: validIndex && mappingReady ? KEYPAD[digits[idx]] : "—" },
        { name: "letter", value: f?.letter ?? "—" }, { name: "current", value: currentReady ? [...current] : "—" },
        { name: "len(result)", value: resultReady ? result.length : "—" },
      ], phone17View: {
        digits, keypad: KEYPAD, phase, source: { line, text: CODE[line - 1], timing: "after" },
        scope: f ? "backtrack" : "letterCombinations", locals, mappingReady, resultReady, currentReady,
        stack: stack.map(frame => ({ id: frame.id, idx: frame.idx, via: frame.via, tried: [...frame.tried], currentLength: current.length })),
        activeIndex: validIndex ? idx : null,
        total: mappingReady ? [...digits].reduce((count, digit) => count * KEYPAD[digit].length, 1) : digits ? null : 0,
        resultCount: result.length, shownFrom: from, results: result.slice(from), ...detail,
      },
    });
  }
  emit(3, "empty-check", bi(digits ? "digits không rỗng" : "digits rỗng", digits ? "digits is not empty" : "digits is empty"));
  if (!digits) {
    emit(4, "done", bi("Không có tổ hợp", "No combinations"), {}, true);
    return { original: digits, answer: [], steps };
  }
  mappingReady = true; emit(5, "mapping", bi("Tạo ánh xạ bàn phím", "Build the keypad mapping"));
  resultReady = true; emit(6, "result-init", bi("result = []", "result = []"));
  currentReady = true; emit(7, "current-init", bi("current = []", "current = []"));
  emit(8, "define", bi("Tạo hàm backtrack", "Define backtrack"));
  function backtrack(idx, via = null) {
    const f = { id: nextId++, idx, via, tried: [] }; stack.push(f);
    emit(9, "end-check", bi(idx === digits.length ? "Đã chọn đủ chữ" : "Chọn chữ cho phím tiếp", idx === digits.length ? "All letters chosen" : "Choose a letter for this key"), { atEnd: idx === digits.length });
    if (idx === digits.length) {
      result.push(current.join("")); emit(10, "save", bi(`Lưu “${result.at(-1)}”`, `Save “${result.at(-1)}”`));
      emit(11, "return", bi("Quay về frame cha", "Return to parent")); stack.pop(); return;
    }
    for (const letter of KEYPAD[digits[idx]]) {
      f.letter = letter; emit(12, "choose", bi(`Thử chữ “${letter}”`, `Try “${letter}”`));
      current.push(letter); emit(13, "append", bi(`Thêm “${letter}”`, `Append “${letter}”`));
      backtrack(idx + 1, letter);
      f.tried.push(letter); emit(14, "resume", bi("Trở về nhánh cha", "Resume parent branch"));
      const removed = current.pop(); emit(15, "pop", bi(`Bỏ “${removed}” để thử chữ khác`, `Remove “${removed}” to try another letter`), { removed });
    }
    emit(12, "exhausted", bi("Đã thử hết chữ của phím", "All letters for this key explored")); stack.pop();
  }
  backtrack(0);
  emit(16, "root-return", bi("Đã duyệt mọi nhánh", "All branches explored"));
  emit(17, "done", bi(`${result.length} tổ hợp`, `${result.length} combinations`), {}, true);
  return { original: digits, answer: [...result], steps };
}

module.exports = { 17: { ...base, code: CODE, builder: buildSteps17, liveArgs: input => [parse17(input)],
  debugMode: "line-by-line", allowEmptyInput: true,
  inputLabel: bi("digits · 0–4 chữ số từ 2 đến 9", "digits · 0–4 digits from 2 to 9"),
  statement: bi("Mỗi phím số cho 3–4 chữ cái. Chọn đúng một chữ ở mỗi vị trí để tạo mọi tổ hợp; chuỗi rỗng trả về [].", "Each key offers 3–4 letters. Choose one letter at each position to form every combination; empty input returns []."),
  approach: [bi("Chọn chữ → thêm vào current → đi sâu. Chọn đủ thì lưu; pop để thử chữ tiếp theo.", "Choose a letter → append to current → recurse. Save a complete choice; pop to try the next letter.")],
  complexity: { time: "O(n · 4ⁿ)", space: "O(n) + output", note: bi("Hỗ trợ đủ 0–4 chữ số, tối đa 256 tổ hợp; giữ mọi dòng và mọi kết quả.", "All inputs of 0–4 digits are supported, up to 256 combinations, with every executed line and result retained.") },
} };
