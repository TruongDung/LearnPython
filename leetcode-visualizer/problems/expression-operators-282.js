"use strict";

const base = require("./backtracking")[282];
const { bi, parsePlainParams, parseInteger } = require("./hard-viz-shared");
const CODE = Object.freeze([
  "class Solution:",
  "    def addOperators(self, num, target):",
  "        result = []",
  "        def bt(i, expr, cur, last):",
  "            if i == len(num):",
  "                if cur == target:",
  "                    result.append(expr)",
  "                return",
  "            for j in range(i, len(num)):",
  "                if j > i and num[i] == '0':",
  "                    break",
  "                piece = num[i:j + 1]",
  "                operand = int(piece)",
  "                if i == 0:",
  "                    bt(j + 1, piece, operand, operand)",
  "                else:",
  "                    bt(j + 1, expr + '+' + piece, cur + operand, operand)",
  "                    bt(j + 1, expr + '-' + piece, cur - operand, -operand)",
  "                    bt(j + 1, expr + '*' + piece, cur - last + last * operand, last * operand)",
  "        bt(0, '', 0, 0)",
  "        return result",
]);

function parse282(input, params) {
  const options = parsePlainParams(params, 282);
  if (typeof input !== "string" || !/^\d{1,6}$/.test(input)) throw new RangeError("#282: nhập 1–6 chữ số để debug đủ mọi nhánh / enter 1–6 digits for a complete trace.");
  const target = parseInteger(options.target === undefined ? 6 : options.target, { problemId: 282, name: "target", min: -2147483648, max: 2147483647 });
  return [input, target];
}

function buildSteps282(input, params) {
  const [num, target] = parse282(input, params), result = [], steps = [], stack = [];
  let nextId = 0;
  const copyFrame = f => ({ id: f.id, i: f.i, expr: f.expr, cur: f.cur, last: f.last,
    ...Object.fromEntries(["j", "piece", "operand"].filter(key => Object.hasOwn(f, key)).map(key => [key, f[key]])) });
  function emit(line, phase, title, detail = {}, final = false) {
    const frame = stack.at(-1), locals = { num, target, ...(frame ? Object.fromEntries(Object.entries(copyFrame(frame)).filter(([key]) => key !== "id")) : {}) };
    const shownFrom = final ? 0 : Math.max(0, result.length - 12);
    steps.push({ title, note: bi("", ""), arr: [], codeLines: [line], final,
      vars: [
        { name: "i", value: frame?.i ?? "—" }, { name: "j", value: frame?.j ?? "—" },
        { name: "piece", value: frame?.piece ?? "—" }, { name: "operand", value: frame?.operand ?? "—" },
        { name: "cur", value: frame?.cur ?? "—" }, { name: "last", value: frame?.last ?? "—" },
        { name: "expr", value: frame ? frame.expr || "''" : "—" }, { name: "len(result)", value: result.length },
      ],
      expression282View: {
        num, target, phase, source: { line, text: CODE[line - 1], timing: "after" },
        scope: frame ? "bt" : "addOperators", locals, stack: stack.map(copyFrame),
        expr: frame?.expr ?? "", cur: frame?.cur ?? null, last: frame?.last ?? null,
        i: frame?.i ?? null, j: frame?.j ?? null, piece: frame?.piece ?? null, operand: frame?.operand ?? null,
        resultCount: result.length, shownFrom, results: result.slice(shownFrom),
        transition: frame?.transition ? { ...frame.transition } : null, ...detail,
      },
    });
  }
  emit(3, "init", bi("result = []", "result = []"));
  emit(4, "define", bi("Tạo hàm bt", "Define bt"));
  function bt(i, expr, cur, last, transition = null) {
    const frame = { id: nextId++, i, expr, cur, last, transition };
    stack.push(frame);
    emit(5, "enter", bi(i === num.length ? "Đã dùng hết chữ số" : "Mở một nhánh", i === num.length ? "All digits consumed" : "Enter a branch"), { atEnd: i === num.length });
    if (i === num.length) {
      const match = cur === target;
      emit(6, "compare", bi(match ? "Đúng target ✓" : "Chưa đúng target", match ? "Target matched ✓" : "Target missed"), { match });
      if (match) { result.push(expr); emit(7, "save", bi(`Lưu biểu thức #${result.length}`, `Save expression #${result.length}`), { match: true }); }
      emit(8, "return", bi("Quay về nhánh cha", "Return to parent"));
      stack.pop(); return;
    }
    for (let j = i; j < num.length; j++) {
      frame.j = j; emit(9, "range", bi("Chọn đoạn chữ số", "Select a digit range"));
      const leadingZero = j > i && num[i] === "0";
      emit(10, "zero-check", bi(leadingZero ? "Số bắt đầu bằng 0 ✕" : "Đoạn số hợp lệ", leadingZero ? "Leading zero ✕" : "Valid digit range"), { leadingZero });
      if (leadingZero) { emit(11, "break", bi("Không ghép 0 ở đầu", "Stop at a leading zero"), { leadingZero: true }); break; }
      frame.piece = num.slice(i, j + 1); emit(12, "piece", bi("Ghép thành một số", "Join digits into one number"));
      frame.operand = Number(frame.piece); emit(13, "operand", bi("Đổi đoạn thành số", "Read the operand"));
      emit(14, "first-check", bi(i === 0 ? "Số đầu tiên" : "Thử +, −, ×", i === 0 ? "First operand" : "Try +, −, ×"));
      function branch(operator, line) {
        const operand = frame.operand, piece = frame.piece;
        const nextCur = operator === "+" ? cur + operand : operator === "-" ? cur - operand : operator === "*" ? cur - last + last * operand : operand;
        // Python ints have one zero; normalize JavaScript's -0 as well.
        const nextLast = (operator === "-" ? -operand : operator === "*" ? last * operand : operand) || 0;
        const nextExpr = operator ? expr + operator + piece : piece;
        const change = { operator, fromExpr: expr, fromCur: cur, fromLast: last, piece, operand, nextExpr, nextCur, nextLast };
        bt(j + 1, nextExpr, nextCur, nextLast, change);
        emit(line, "resume", bi("Quay lại · thử nhánh tiếp", "Resume · try next branch"), { returned: change });
      }
      if (i === 0) branch("", 15);
      else { branch("+", 17); branch("-", 18); branch("*", 19); }
    }
    // A leading-zero break does not execute the loop header again.
    if (!(frame.j > i && num[i] === "0")) emit(9, "exhausted", bi("Hết đoạn để chọn", "No more digit ranges"));
    stack.pop();
  }
  bt(0, "", 0, 0);
  emit(20, "root-return", bi("Đã duyệt mọi nhánh", "All branches explored"));
  emit(21, "done", bi(`${result.length} biểu thức hợp lệ`, `${result.length} matching expressions`), {}, true);
  return { original: num, target, answer: [...result], steps };
}

module.exports = { 282: { ...base, code: CODE, builder: buildSteps282, debugMode: "line-by-line", liveArgs: parse282,
  inputLabel: bi("num · 1–6 chữ số", "num · 1–6 digits"),
  extraParams: [{ key: "target", type: "number", allowNegative: true, min: -2147483648, max: 2147483647, default: 6, label: bi("target", "target") }],
  statement: bi("Giữ thứ tự các chữ số; ghép số hoặc chèn +, −, × để được target. Không ghép số nhiều chữ số bắt đầu bằng 0.", "Keep digit order; join digits or insert +, −, × to reach target. No multi-digit operand may start with 0."),
  approach: [bi("Đi sâu từng nhánh. Khi nhân, giữ cur − last rồi thay last bằng last × operand.", "Explore each branch. For multiplication, keep cur − last and replace last with last × operand.")],
  complexity: { time: "O(n · 4ⁿ)", space: "O(n²) auxiliary + output",
    note: bi("Mỗi khe có 4 lựa chọn: nối, +, −, ×. Minh hoạ tối đa 6 chữ số, duyệt đủ mọi nhánh và mọi dòng; chuỗi expr nằm trên stack đệ quy.", "Each gap has 4 choices: join, +, −, ×. Up to 6 digits are traced completely; expression strings are stored along the recursion stack.") },
} };
