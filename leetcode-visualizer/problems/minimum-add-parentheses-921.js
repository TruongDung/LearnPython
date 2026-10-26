"use strict";

const bi = (vi, en) => ({ vi, en });
const MAX_LENGTH = 80;
const SOURCE = Object.freeze([
  "class Solution:",
  "    def minAddToMakeValid(self, s: str) -> int:",
  "        stack = []",
  "        additions = 0",
  "        for i, ch in enumerate(s):",
  "            if ch == '(':",
  "                stack.append(i)",
  "            elif stack:",
  "                stack.pop()",
  "            else:",
  "                additions += 1",
  "",
  "        return additions + len(stack)",
]);

function parseInput921(input, limit = MAX_LENGTH) {
  if (typeof input !== "string") throw new TypeError("#921: s phải là chuỗi / s must be a string.");
  const s = input.trim();
  if (s.length > limit || /[^()]/.test(s)) {
    throw new RangeError(`#921: nhập tối đa ${limit} dấu ngoặc ( hoặc ) / enter up to ${limit} parentheses.`);
  }
  return s;
}

function buildSteps921(input = "()))((") {
  const s = parseInput921(input), state = { s }, steps = [], tokens = [], pairs = [];
  let processed = 0, answer = null, insertionId = 0;
  const titles = {
    init: bi("Khởi tạo", "Initialize"), read: bi("Đọc một dấu ngoặc", "Read one parenthesis"),
    branch: bi("Dấu mở?", "Opening parenthesis?"), push: bi("Giữ dấu mở để chờ ghép", "Keep the opening for a match"),
    "stack-check": bi("Có dấu mở đang chờ?", "Is an opening waiting?"), pop: bi("Ghép một cặp", "Match one pair"),
    insert: bi("Thêm '(' ngay trước ')'", "Insert '(' just before ')'"),
    exhausted: bi("Đã duyệt hết", "Scan complete"), done: bi("Số ngoặc cần thêm", "Minimum additions"),
  };
  const py = value => value ? "True" : "False";
  function emit(line, phase, equation, extra = {}) {
    const stack = state.stack ? [...state.stack] : null;
    const missingOpen = state.additions ?? null, missingClose = stack?.length ?? null;
    const total = missingOpen === null || missingClose === null ? null : missingOpen + missingClose;
    const locals = { ...state, ...(stack === null ? {} : { stack }) };
    steps.push({
      title: titles[phase], note: bi("", ""), arr: [], highlight: [], mark: [], codeLines: [line], final: phase === "done",
      vars: [
        { name: "i", value: state.i ?? "—" }, { name: "ch", value: state.ch ?? "—" },
        { name: "additions", value: missingOpen ?? "—" },
        { name: "len(stack)", value: missingClose ?? "—" },
        { name: "additions + len(stack)", value: total ?? "—" },
      ],
      parentheses921View: {
        s, phase, equation, locals, source: { line, text: SOURCE[line - 1], timing: "after" },
        index: ["done", "exhausted"].includes(phase) ? null : state.i ?? null,
        ch: state.ch ?? null, stack, missingOpen, missingClose, total, processed,
        tokens: tokens.map(token => ({ ...token })), pairs: pairs.map(pair => ({ ...pair })),
        focusPair: extra.pair ? { ...extra.pair } : null, popped: extra.popped ?? null,
        condition: extra.condition ?? null, answer,
        repaired: phase === "done" ? tokens.map(token => token.ch).join("") : null,
      },
    });
  }
  const original = index => ({ id: `o${index}`, ch: s[index], index, inserted: false });
  const inserted = (ch, before, kind) => ({ id: `a${insertionId++}`, ch, index: null, inserted: true, before, kind });
  state.stack = []; emit(3, "init", "stack = []");
  state.additions = 0; emit(4, "init", "additions = 0");
  for (let i = 0; i < s.length; i++) {
    state.i = i; state.ch = s[i];
    emit(5, "read", `i = ${i}, ch = '${state.ch}'`);
    const opening = state.ch === "(";
    emit(6, "branch", `ch == '(' → ${py(opening)}`, { condition: opening });
    if (opening) {
      state.stack.push(i); tokens.push(original(i)); processed++;
      emit(7, "push", `stack.append(${i})`);
    } else {
      const canMatch = state.stack.length > 0;
      emit(8, "stack-check", `bool(stack) → ${py(canMatch)}`, { condition: canMatch });
      if (canMatch) {
        const left = state.stack.pop(), pair = { open: `o${left}`, close: `o${i}`, left, right: i, kind: "original" };
        tokens.push(original(i)); pairs.push(pair); processed++;
        emit(9, "pop", `stack.pop() → #${left}`, { pair, popped: left });
      } else {
        state.additions++;
        const token = inserted("(", i, "insert-open"), pair = { open: token.id, close: `o${i}`, left: null, right: i, kind: "insert-open" };
        tokens.push(token, original(i)); pairs.push(pair); processed++;
        emit(11, "insert", `additions += 1 → ${state.additions}`, { pair });
      }
    }
  }
  emit(5, "exhausted", "for … ✓");
  // Construct a balanced witness; the Python return expression does not mutate stack.
  for (const left of [...state.stack].reverse()) {
    const token = inserted(")", s.length, "insert-close");
    tokens.push(token); pairs.push({ open: `o${left}`, close: token.id, left, right: null, kind: "insert-close" });
  }
  answer = state.additions + state.stack.length;
  emit(13, "done", `${state.additions} + ${state.stack.length} = ${answer}`);
  return { original: s, answer, steps };
}

module.exports = {
  921: {
    ...require("./string")[921],
    titleVi: bi("Thêm ít ngoặc nhất để chuỗi hợp lệ", "Minimum additions for valid parentheses"),
    statement: bi("Chèn ít dấu '(' hoặc ')' nhất để mọi dấu ngoặc được ghép đúng thành cặp ().", "Insert the fewest '(' or ')' so every parenthesis is correctly paired."),
    tags: [{ key: "string", vi: "Chuỗi", en: "String" }, { key: "parentheses", vi: "Ngoặc", en: "Parentheses" }, { key: "stack", vi: "Ngăn xếp", en: "Stack" }],
    inputLabel: bi("s · tối đa 80 dấu ngoặc để minh họa", "s · up to 80 parentheses for visualization"),
    approach: [
      bi("'(' → push; ')' → ghép với dấu mở ở TOP.", "'(' → push; ')' → match the TOP opening."),
      bi("Stack rỗng mà gặp ')' → cần thêm '('.", "Empty stack at ')' → insert '('."),
      bi("Cuối chuỗi: mỗi '(' còn lại cần thêm một ')'.", "At the end, each remaining '(' needs one ')'."),
    ],
    complexity: { time: "O(n)", space: "O(n)", note: bi("Duyệt một lần; stack lưu các vị trí dấu mở chưa ghép.", "Scan once; the stack stores unmatched opening positions.") },
    debugMode: "line-by-line", code: SOURCE, builder: buildSteps921,
    visualizationLimits: { maxLength: MAX_LENGTH }, liveArgs: input => [parseInput921(input, 1000)],
  },
};
