"use strict";
const base = require("./string")[8];
const bi = (vi, en) => ({ vi, en });
const code = [
  "class Solution:",
  "    def myAtoi(self, s):",
  "        i, n = 0, len(s)",
  "        sign = 1",
  "        value = 0",
  "        while i < n and s[i] == ' ':",
  "            i += 1",
  "        if i < n and s[i] in '+-':",
  "            sign = -1 if s[i] == '-' else 1",
  "            i += 1",
  "        limit = 2147483647 if sign == 1 else 2147483648",
  "        while i < n and '0' <= s[i] <= '9':",
  "            digit = ord(s[i]) - ord('0')",
  "            if value > (limit - digit) // 10:",
  "                return sign * limit",
  "            value = value * 10 + digit",
  "            i += 1",
  "        return sign * value",
];
function parse(input) {
  if (typeof input !== "string" || input.length > 200 || !/^[a-zA-Z0-9 +.\-]*$/.test(input)) {
    throw new Error("s: tối đa 200 ký tự gồm chữ, số, dấu cách, +, -, . / Use up to 200 letters, digits, spaces, +, -, .");
  }
  return input;
}
function builder(input) {
  const s = parse(input), locals = { self: {}, s }, steps = [], consumed = Array(s.length).fill(null);
  let stage = "spaces", math = null;
  function emit(line, event, label, extra = {}) {
    const final = Object.hasOwn(extra, "answer");
    steps.push({ title: bi(`Dòng ${line} · ${label.vi}`, `Line ${line} · ${label.en}`), codeLines: [line], codeBlock: 1,
      final, arr: [], highlight: [], mark: [], note: bi("", ""),
      vars: Object.entries(locals).map(([name, rawValue]) => ({ name, rawValue: name === "self" ? {} : rawValue, value: name === "self" ? "Solution" : rawValue })),
      atoi8View: { s, line, source: code[line - 1].trim(), event, stage: final ? "result" : stage,
        i: locals.i ?? null, sign: locals.sign ?? null, value: locals.value ?? null, limit: locals.limit ?? null,
        consumed: [...consumed], math: math && { ...math }, check: extra.check ?? null,
        answer: final ? extra.answer : null, overflow: event === "clamp", reason: extra.reason || null }
    });
  }
  locals.i = 0; locals.n = s.length; emit(3, "init", bi("Con trỏ i = 0", "Pointer i = 0"));
  locals.sign = 1; emit(4, "init-sign", bi("Mặc định dấu +", "Default sign +"));
  locals.value = 0; emit(5, "init-value", bi("Bắt đầu từ 0", "Start at 0"));
  while (true) {
    const check = locals.i < locals.n && s[locals.i] === " ";
    emit(6, "space-check", bi("Dấu cách?", "Space?"), { check });
    if (!check) break;
    consumed[locals.i] = "space"; locals.i++;
    emit(7, "skip-space", bi("Bỏ qua →", "Skip →"));
  }
  stage = "sign";
  const hasSign = locals.i < locals.n && "+-".includes(s[locals.i]);
  emit(8, "sign-check", bi("Có dấu + / −?", "Sign + / −?"), { check: hasSign });
  if (hasSign) {
    locals.sign = s[locals.i] === "-" ? -1 : 1; consumed[locals.i] = "sign";
    emit(9, "read-sign", bi(`Dấu ${locals.sign === -1 ? "−" : "+"}`, `Sign ${locals.sign === -1 ? "−" : "+"}`));
    locals.i++; emit(10, "move-sign", bi("Sang ký tự kế →", "Next character →"));
  }
  stage = "digits";
  locals.limit = locals.sign === 1 ? 2147483647 : 2147483648;
  emit(11, "limit", bi("Giới hạn độ lớn", "Magnitude limit"));
  while (true) {
    const check = locals.i < locals.n && s[locals.i] >= "0" && s[locals.i] <= "9";
    math = null;
    emit(12, "digit-check", bi("Chữ số 0…9?", "Digit 0…9?"), { check });
    if (!check) break;
    locals.digit = s.charCodeAt(locals.i) - 48;
    math = { index: locals.i, before: locals.value, digit: locals.digit, candidate: locals.value * 10 + locals.digit,
      threshold: Math.floor((locals.limit - locals.digit) / 10), appended: false };
    emit(13, "digit", bi(`'${s[locals.i]}' → ${locals.digit}`, `'${s[locals.i]}' → ${locals.digit}`));
    const overflow = locals.value > math.threshold;
    emit(14, "overflow-check", bi("Thêm số sẽ tràn?", "Would appending overflow?"), { check: overflow });
    if (overflow) {
      const answer = locals.sign * locals.limit;
      emit(15, "clamp", bi(`Chặn tại ${answer}`, `Clamp to ${answer}`), { answer, reason: "overflow" });
      return { original: s, answer, steps };
    }
    locals.value = math.candidate; consumed[locals.i] = "digit"; math.appended = true;
    emit(16, "append", bi(`Ghép → ${locals.value}`, `Append → ${locals.value}`));
    locals.i++; emit(17, "move-digit", bi("Sang ký tự kế →", "Next character →"));
  }
  const answer = locals.sign * locals.value || 0;
  emit(18, "return", bi(`Trả về ${answer}`, `Return ${answer}`), { answer, reason: locals.i === locals.n ? "end" : "non-digit" });
  return { original: s, answer, steps };
}
module.exports = { 8: { ...base, code, builder, debugMode: "line-by-line", preserveInputWhitespace: true, allowEmptyInput: true,
  defaultInput: "   -042xyz", inputLabel: bi("s · nhập trực tiếp, giữ dấu cách đầu", "s · raw text, leading spaces preserved"),
  statement: bi("Bỏ dấu cách đầu → đọc dấu → ghép chữ số. Gặp ký tự khác thì dừng; vượt 32-bit thì chặn.", "Skip leading spaces → read sign → build digits. Stop at a non-digit; clamp to 32-bit."),
  approach: [bi("␣ → bỏ qua  ·  + / − → dấu", "␣ → skip  ·  + / − → sign"), bi("value × 10 + digit → kiểm tra giới hạn", "value × 10 + digit → check the limit")],
  complexity: { time: "O(n)", space: "O(1)", note: bi("Quét một lượt; dừng ngay khi tràn số.", "One scan; stop as soon as overflow is detected.") },
  liveArgs: input => [parse(input)]
} };
