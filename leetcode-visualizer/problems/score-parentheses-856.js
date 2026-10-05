"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = Object.freeze([
  "class Solution:",
  "    def scoreOfParentheses(self, s: str) -> int:",
  "        stack = [0]",
  "        for i, ch in enumerate(s):",
  "            if ch == '(':",
  "                stack.append(0)",
  "            else:",
  "                inner = stack.pop()",
  "                pair_score = max(1, 2 * inner)",
  "                stack[-1] += pair_score",
  "        return stack[0]",
]);

function parseInput(input) {
  if (typeof input !== "string") throw new TypeError("#856: s must be a string / s phải là chuỗi.");
  const s = input.trim();
  if (s.length < 2 || s.length > 50 || !/^[()]+$/.test(s)) throw new Error("#856: enter 2–50 parentheses / nhập 2–50 dấu ngoặc ( hoặc ).");
  let depth = 0;
  for (const ch of s) {
    depth += ch === "(" ? 1 : -1;
    if (depth < 0) throw new Error("#856: s must be balanced / chuỗi ngoặc phải hợp lệ.");
  }
  if (depth !== 0) throw new Error("#856: s must be balanced / chuỗi ngoặc phải hợp lệ.");
  return s;
}

function buildSteps(input) {
  const s = parseInput(input), steps = [], stack = [], frames = [], pairs = [];
  const locals = { s };
  let index = null, closing = null;
  function emit(line, event, title, note, final = false) {
    steps.push({ arr: [], highlight: [], mark: [], codeLines: [line], final, title, note,
      vars: Object.entries(locals).map(([name, value]) => ({ name, value: Array.isArray(value) ? [...value] : value })),
      scoreParentheses856View: {
        s, index, event, line, stack: [...stack],
        frames: frames.map((frame, level) => ({ open: frame.open, level, score: stack[level], children: frame.children.map(child => ({ ...child })) })),
        pairs: pairs.map(pair => ({ ...pair })),
        closing: closing ? { ...closing } : null,
        answer: final ? stack[0] : null,
      },
    });
  }
  emit(2, "call", bi("Tính điểm từ trong ra ngoài", "Score from the inside out"), bi("() = 1; (A) = 2 × A; các nhóm nối nhau cộng điểm. Không phải chỉ đếm số cặp ngoặc.", "() = 1; (A) = 2 × A; adjacent groups add. This is not simply a count of parentheses pairs."));
  stack.push(0); frames.push({ open: null, children: [] }); locals.stack = stack;
  emit(3, "init", bi("stack = [0]: ô gốc cho toàn chuỗi", "stack = [0]: a root frame for the whole string"), bi("Ô gốc không ứng với dấu '('. Nó cộng điểm của các nhóm ngoài cùng.", "The root frame does not represent a '('. It adds scores of top-level groups."));
  for (index = 0; index < s.length; index++) {
    const ch = s[index]; closing = null; locals.i = index; locals.ch = ch;
    emit(4, "read", bi(`Đọc s[${index}] = '${ch}'`, `Read s[${index}] = '${ch}'`), bi("Stack chưa thay đổi ở dòng đọc ký tự.", "Reading a character does not change the stack."));
    const opening = ch === "(";
    emit(5, "branch", bi(`ch == '(' → ${opening ? 'True' : 'False'}`, `ch == '(' → ${opening ? 'True' : 'False'}`), bi(opening ? "Sắp mở một ô mới với tổng điểm bên trong bằng 0." : "Sắp đóng ô trên đỉnh stack; xử lý nó trước ô cha.", opening ? "About to open a new frame with inside score 0." : "About to close the stack top; process it before its parent."));
    if (opening) {
      stack.push(0); frames.push({ open: index, children: [] });
      emit(6, "push", bi(`Mở '(' tại ${index}: push 0`, `Open '(' at ${index}: push 0`), bi("Ô mới chỉ cộng các nhóm đã hoàn tất bên trong; chưa nhân đôi cho đến khi đóng ô.", "The new frame adds completed inner groups; it is not doubled until the frame closes."));
    } else {
      emit(7, "close-branch", bi("Gặp ')': đóng cặp gần nhất", "On ')': close the nearest open pair"), bi("Đọc điểm trong ô con, tính điểm cặp, rồi cộng vào ô cha qua ba dòng riêng.", "Read the child frame, calculate its pair score, then add it to the parent on three separate lines."));
      const inner = stack.pop(), frame = frames.pop(); locals.inner = inner;
      closing = { open: frame.open, close: index, inner, score: null, parentOpen: frames.at(-1).open,
        parentBefore: stack.at(-1), childScores: frame.children.map(child => child.score), merged: false };
      emit(8, "pop", bi(`Pop ô tại ${frame.open}: inner = ${inner}`, `Pop frame at ${frame.open}: inner = ${inner}`), bi("Ô con đã rời stack. Điểm cặp chưa được tính và ô cha chưa nhận thêm điểm.", "The child frame has left the stack. Its pair score has not been calculated and the parent is unchanged."));
      const pairScore = Math.max(1, 2 * inner); locals.pair_score = pairScore; closing.score = pairScore;
      pairs.push({ ...closing, childScores: [...closing.childScores] });
      emit(9, "calculate", bi(`max(1, 2 × ${inner}) = ${pairScore}`, `max(1, 2 × ${inner}) = ${pairScore}`), bi(inner === 0 ? "Bên trong rỗng → cặp () được 1 điểm. Chưa cộng vào ô cha." : `Bên trong có ${inner} điểm → cặp bao ngoài được 2 × ${inner} = ${pairScore}. Chưa cộng vào ô cha.`, inner === 0 ? "The inside is empty → () scores 1. Not added to the parent yet." : `The inside scores ${inner} → its enclosing pair scores 2 × ${inner} = ${pairScore}. Not added to the parent yet.`));
      stack[stack.length - 1] += pairScore;
      frames.at(-1).children.push({ open: frame.open, close: index, score: pairScore });
      closing.merged = true; pairs.at(-1).merged = true;
      emit(10, "merge", bi(`Ô cha: ${closing.parentBefore} + ${pairScore} = ${stack.at(-1)}`, `Parent: ${closing.parentBefore} + ${pairScore} = ${stack.at(-1)}`), bi("Cộng điểm vì các nhóm trong cùng một ô nằm cạnh nhau. Ô cha sẽ nhân đôi tổng này khi chính nó đóng, trừ ô gốc.", "Add because groups inside the same frame are adjacent. The parent doubles its total when it closes, unless it is the root."));
    }
  }
  index = s.length - 1;
  emit(11, "return", bi(`return stack[0] = ${stack[0]}`, `return stack[0] = ${stack[0]}`), bi("Chỉ còn ô gốc. Đây là tổng điểm các nhóm ngoài cùng; không nhân đôi ô gốc.", "Only the root remains. This is the sum of top-level group scores; do not double the root."), true);
  return { original: s, answer: stack[0], steps };
}

module.exports = {
  856: {
    id: 856, difficulty: "medium", slug: "score-of-parentheses",
    category: { key: "stack-queue", vi: "Stack / Queue", en: "Stack / Queue" },
    tags: [{ key: "string", vi: "Chuỗi", en: "String" }, { key: "parentheses", vi: "Ngoặc", en: "Parentheses" }, { key: "stack", vi: "Ngăn xếp", en: "Stack" }],
    title: bi("Score of Parentheses", "Score of Parentheses"), titleVi: bi("Tính điểm chuỗi ngoặc", "Score a balanced parentheses string"),
    statement: bi("Cho chuỗi ngoặc hợp lệ s. Tính điểm theo quy tắc: () = 1; AB = A + B; (A) = 2 × A. Ví dụ (()(())) = 2 × (1 + 2) = 6.", "Given a balanced parentheses string s, compute its score: () = 1; AB = A + B; (A) = 2 × A. Example: (()(())) = 2 × (1 + 2) = 6."),
    inputKind: "string", inputLabel: bi("s — chuỗi ngoặc hợp lệ (2–50 ký tự)", "s — balanced parentheses (2–50 characters)"),
    defaultInput: "(()(()))", extraParams: [], debugMode: "line-by-line",
    approach: [
      bi("stack = [0] có một ô gốc cộng điểm toàn chuỗi. Mỗi '(' push một ô 0 để cộng điểm bên trong cặp đó.", "stack = [0] has a root frame for the whole string. Each '(' pushes a zero frame to add scores inside that pair."),
      bi("Gặp ')': pop inner. Nếu inner = 0 thì cặp () được 1; nếu không, điểm cặp = 2 × inner.", "On ')', pop inner. If inner = 0, the empty pair () scores 1; otherwise the pair scores 2 × inner."),
      bi("Cộng điểm cặp vừa đóng vào ô cha: stack[-1] += pair_score. Tách rõ pop → tính → cộng.", "Add the closed pair's score to its parent: stack[-1] += pair_score. Separate pop → calculate → add."),
      bi("Kết thúc chỉ còn stack[0], là tổng các nhóm ngoài cùng. Không nhân đôi ô gốc.", "At the end only stack[0] remains: the sum of top-level groups. Do not double the root."),
    ],
    complexity: { time: "O(n)", space: "O(n)", note: bi("Mỗi ký tự xử lý một lần. Stack chứa O(d) ô, với d là độ sâu lồng ngoặc; xấu nhất O(n). Không tính các khung mô phỏng.", "Each character is processed once. The stack stores O(d) frames for nesting depth d, at worst O(n). Excludes visualization frames.") },
    code: SOURCE, builder: buildSteps, liveArgs: input => [parseInput(input)],
  },
};
