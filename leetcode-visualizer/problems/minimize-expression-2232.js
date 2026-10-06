"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def minimizeResult(self, expression: str) -> str:",
  "        left, right = expression.split('+')",
  "        best = float('inf')",
  "        answer = ''",
  "        for i in range(len(left)):",
  "            for j in range(1, len(right) + 1):",
  "                a = int(left[:i]) if i else 1",
  "                b = int(left[i:])",
  "                c = int(right[:j])",
  "                d = int(right[j:]) if j < len(right) else 1",
  "                value = a * (b + c) * d",
  "                if value < best:",
  "                    best = value",
  "                    answer = left[:i] + '(' + left[i:] + '+' + right[:j] + ')' + right[j:]",
  "        return answer",
];

function parseInput(input) {
  if (typeof input !== 'string') throw new TypeError('#2232: expression must be a string / expression phải là chuỗi.');
  const expression = input.trim();
  if (expression.length > 10 || !/^[1-9]+\+[1-9]+$/.test(expression)) throw new Error('#2232: enter num1+num2, 3–10 characters; digits 1–9 only / nhập num1+num2, 3–10 ký tự; chỉ dùng chữ số 1–9.');
  return expression;
}

function buildSteps(input) {
  const expression = parseInput(input), steps = [], history = [], locals = { expression };
  let left = null, right = null, best = Infinity, answer = '', bestPair = null, candidate = null, i = null, j = null, updating = false;
  function emit(line, event, title, note, final = false) {
    steps.push({ arr: [], highlight: [], mark: [], codeLines: [line], final, title, note,
      vars: Object.entries(locals).map(([name, value]) => ({ name, value })),
      minimizeExpression2232View: { expression, left, right, i, j, line, event,
        candidate: candidate ? { ...candidate } : null,
        bestValue: Number.isFinite(best) ? best : null, bestExpression: answer,
        bestPair: bestPair ? { ...bestPair } : null, updating,
        history: history.map(item => ({ ...item })), answer: final ? answer : null },
    });
  }
  emit(2, 'call', bi('Thử mọi cặp vị trí bao quanh dấu +', 'Try every pair of positions around +'), bi("Dấu '(' phải ở bên trái + và ')' phải ở bên phải +. Hai phần nằm trong ngoặc đều phải có ít nhất một chữ số.", "'(' must be left of + and ')' must be right of +. Both numbers inside the parentheses must contain at least one digit."));
  [left, right] = expression.split('+'); locals.left = left; locals.right = right;
  emit(3, 'split', bi(`left = '${left}', right = '${right}'`, `left = '${left}', right = '${right}'`), bi('i là số chữ số bên trái nằm ngoài ngoặc; j là số chữ số bên phải nằm trong ngoặc.', 'i counts left-side digits outside the parentheses; j counts right-side digits inside them.'));
  locals.best = 'inf';
  emit(4, 'init-best', bi('best = ∞', 'best = ∞'), bi('Chưa tính cách nào, nên chưa có giá trị tốt nhất hữu hạn.', 'No candidate has been evaluated, so there is no finite best value yet.'));
  locals.answer = answer;
  emit(5, 'init-answer', bi("answer = ''", "answer = ''"), bi('Chưa chọn biểu thức kết quả.', 'No result expression has been chosen.'));
  for (i = 0; i < left.length; i++) {
    j = null; candidate = null; locals.i = i;
    emit(6, 'left-position', bi(`Đặt '(' trước left[${i}]`, `Place '(' before left[${i}]`), bi(`Có ${i} chữ số bên trái nằm ngoài ngoặc. Tiếp tục thử mọi vị trí đóng ở bên phải.`, `${i} left-side digits stay outside. Try every closing position on the right next.`));
    for (j = 1; j <= right.length; j++) {
      locals.j = j;
      candidate = { i, j, prefix: left.slice(0, i), innerLeft: left.slice(i), innerRight: right.slice(0, j), suffix: right.slice(j),
        expression: `${left.slice(0, i)}(${left.slice(i)}+${right.slice(0, j)})${right.slice(j)}`,
        a: null, b: null, c: null, d: null, value: null, better: null };
      emit(7, 'right-position', bi(`Đặt ')' sau ${j} chữ số của right`, `Place ')' after ${j} right-side digits`), bi(`Đang thử ${candidate.expression}. Chưa tính các phần A, B, C, D.`, `Trying ${candidate.expression}. A, B, C and D have not been calculated yet.`));
      candidate.a = i ? Number(candidate.prefix) : 1; locals.a = candidate.a;
      emit(8, 'a', bi(`A = ${candidate.a}`, `A = ${candidate.a}`), bi(i ? `Phần trước '(' là ${candidate.prefix}, trở thành hệ số nhân bên trái.` : "Không có chữ số trước '(' → hệ số A = 1, không phải 0.", i ? `The prefix before '(' is ${candidate.prefix}, the left multiplier.` : "No digits before '(' → multiplier A = 1, not 0."));
      candidate.b = Number(candidate.innerLeft); locals.b = candidate.b;
      emit(9, 'b', bi(`B = ${candidate.b}`, `B = ${candidate.b}`), bi('Phần bên trái dấu + nằm trong ngoặc.', 'The left number inside the parentheses.'));
      candidate.c = Number(candidate.innerRight); locals.c = candidate.c;
      emit(10, 'c', bi(`C = ${candidate.c}`, `C = ${candidate.c}`), bi('Phần bên phải dấu + nằm trong ngoặc.', 'The right number inside the parentheses.'));
      candidate.d = j < right.length ? Number(candidate.suffix) : 1; locals.d = candidate.d;
      emit(11, 'd', bi(`D = ${candidate.d}`, `D = ${candidate.d}`), bi(candidate.suffix ? `Phần sau ')' là ${candidate.suffix}, trở thành hệ số nhân bên phải.` : "Không có chữ số sau ')' → hệ số D = 1, không phải 0.", candidate.suffix ? `The suffix after ')' is ${candidate.suffix}, the right multiplier.` : "No digits after ')' → multiplier D = 1, not 0."));
      candidate.value = candidate.a * (candidate.b + candidate.c) * candidate.d; locals.value = candidate.value;
      history.push({ i, j, expression: candidate.expression, value: candidate.value, status: 'pending' });
      emit(12, 'calculate', bi(`${candidate.a} × (${candidate.b} + ${candidate.c}) × ${candidate.d} = ${candidate.value}`, `${candidate.a} × (${candidate.b} + ${candidate.c}) × ${candidate.d} = ${candidate.value}`), bi('Đã tính value. best và answer chưa thay đổi; dòng tiếp theo mới so sánh.', 'value is calculated. best and answer are unchanged; comparison happens on the next line.'));
      candidate.better = candidate.value < best;
      if (!candidate.better) history.at(-1).status = 'rejected';
      emit(13, 'compare', bi(`${candidate.value} < ${Number.isFinite(best) ? best : '∞'} → ${candidate.better ? 'True' : 'False'}`, `${candidate.value} < ${Number.isFinite(best) ? best : '∞'} → ${candidate.better ? 'True' : 'False'}`), bi(candidate.better ? 'Cách này nhỏ hơn. Chưa gán best hoặc answer ở dòng điều kiện.' : candidate.value === best ? 'Bằng best: giữ cách đã chọn trước đó; nhiều đáp án tối ưu đều hợp lệ.' : 'Lớn hơn best: giữ nguyên đáp án tốt nhất.', candidate.better ? 'This candidate is smaller. The condition itself has not assigned best or answer.' : candidate.value === best ? 'Ties best: keep the earlier choice; any optimal answer is valid.' : 'Larger than best: keep the current best answer.'));
      if (candidate.better) {
        best = candidate.value; locals.best = best; updating = true; history.at(-1).status = 'updating';
        emit(14, 'update-best', bi(`best = ${best}`, `best = ${best}`), bi('Đã cập nhật số best. answer vẫn là giá trị cũ; dòng tiếp theo mới chọn biểu thức.', 'The best number is updated. answer still has its old value; the expression is assigned on the next line.'));
        answer = candidate.expression; locals.answer = answer; updating = false;
        history.forEach(item => { if (item.status === 'best') item.status = 'superseded'; });
        history.at(-1).status = 'best'; bestPair = { i, j };
        emit(15, 'update-answer', bi(`answer = '${answer}'`, `answer = '${answer}'`), bi('Số best và biểu thức answer đã đồng bộ. Tiếp tục thử các vị trí còn lại.', 'best and answer now agree. Continue trying the remaining positions.'));
      }
    }
  }
  i = left.length - 1; j = right.length;
  emit(16, 'return', bi(`Kết quả: ${answer} = ${best}`, `Result: ${answer} = ${best}`), bi(`Đã thử đủ ${left.length * right.length} cách. Trả về biểu thức, không phải số ${best}.`, `All ${left.length * right.length} placements were checked. Return the expression, not the number ${best}.`), true);
  return { original: expression, answer, minimumValue: best, steps };
}

module.exports = { 2232: {
  id: 2232, difficulty: 'medium', slug: 'minimize-result-by-adding-parentheses-to-expression',
  category: { key: 'string', vi: 'Chuỗi', en: 'String' },
  tags: [{ key: 'string', vi: 'Chuỗi', en: 'String' }, { key: 'parentheses', vi: 'Ngoặc', en: 'Parentheses' }, { key: 'enumeration', vi: 'Liệt kê', en: 'Enumeration' }],
  title: bi('Minimize Result by Adding Parentheses to Expression', 'Minimize Result by Adding Parentheses to Expression'),
  titleVi: bi('Đặt một cặp ngoặc để biểu thức nhỏ nhất', 'Place one pair of parentheses to minimize the expression'),
  statement: bi("Cho expression có dạng num1+num2, dài 3–10 ký tự, chỉ gồm chữ số 1–9 và một dấu +. Đặt một cặp ngoặc bao quanh dấu + để giá trị nhỏ nhất; trả về biểu thức sau khi đặt ngoặc. Ví dụ 247+38 → 2(47+38) = 170.", "Given expression = num1+num2, with 3–10 characters using digits 1–9 and one +, place a pair of parentheses around + to minimize its value. Return the resulting expression. Example: 247+38 → 2(47+38) = 170."),
  inputKind: 'string', inputLabel: bi('expression — num1+num2, 3–10 ký tự; chữ số 1–9', 'expression — num1+num2, 3–10 characters; digits 1–9'), defaultInput: '247+38', extraParams: [], debugMode: 'line-by-line',
  approach: [
    bi('Tách left và right tại dấu +. Chọn i = 0…len(left)−1 và j = 1…len(right) để mỗi bên trong ngoặc còn ít nhất một chữ số.', 'Split at +. Choose i = 0…len(left)−1 and j = 1…len(right) so each inner number has at least one digit.'),
    bi('Mỗi cách đặt có dạng A(B+C)D, được tính A × (B + C) × D. Phần ngoài rỗng tương ứng hệ số 1.', 'Each placement has form A(B+C)D and evaluates to A × (B + C) × D. An empty outer part means multiplier 1.'),
    bi('Tính value, so sánh với best, rồi mới cập nhật best và answer qua hai dòng riêng. Khi bằng nhau, giữ cách trước.', 'Calculate value, compare with best, then update best and answer on separate lines. Keep the earlier choice on a tie.'),
    bi('Thử tất cả L × R cách rồi trả về biểu thức tốt nhất. Bảng ô cho thấy giá trị của từng cặp (i, j).', 'Check all L × R placements and return the best expression. The grid records the value for each (i, j).'),
  ],
  complexity: { time: 'O(L × R × n)', space: 'O(n)', note: bi('L, R là độ dài hai số; n = L + R. Mỗi cách cắt và chuyển chuỗi số tốn O(n). Không tính lịch sử và bản sao của visualization.', 'L and R are the two number lengths; n = L + R. Slicing and parsing each candidate costs O(n). Excludes visualization history and snapshots.') },
  code: SOURCE, builder: buildSteps, liveArgs: input => [parseInput(input)],
} };
