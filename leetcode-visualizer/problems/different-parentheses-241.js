"use strict";

const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  'class Solution:',
  '    def diffWaysToCompute(self, expression: str) -> list[int]:',
  '        if expression.isdigit():',
  '            return [int(expression)]',
  '        results = []',
  '        for i, op in enumerate(expression):',
  "            if op not in '+-*':",
  '                continue',
  '            left = self.diffWaysToCompute(expression[:i])',
  '            right = self.diffWaysToCompute(expression[i + 1:])',
  '            for a in left:',
  '                for b in right:',
  "                    if op == '+':",
  '                        value = a + b',
  "                    elif op == '-':",
  '                        value = a - b',
  '                    else:',
  '                        value = a * b',
  '                    results.append(value)',
  '        return results',
];

function parseInput(input, visualize = false) {
  if (typeof input !== 'string') throw new TypeError('#241: expression must be a string / expression phải là chuỗi.');
  const expression = input.trim();
  if (!expression.length || expression.length > 20 || !/^\d+(?:[+*-]\d+)*$/.test(expression) || expression.split(/[+*-]/).some(number => Number(number) > 99)) throw new Error('#241: use numbers 0–99 and +, -, *; 1–20 characters, no spaces / dùng số 0–99 và +, -, *; 1–20 ký tự, không có khoảng trắng.');
  if (visualize && (expression.match(/[+*-]/g) || []).length > 4) throw new Error('#241: step visualization allows up to 4 operators / mô phỏng từng bước hỗ trợ tối đa 4 toán tử.');
  return expression;
}

function buildSteps(input) {
  const expression = parseInput(input, true), steps = [], nodes = [], stack = [], groups = [];
  function emit(frame, line, event, title, note, final = false) {
    steps.push({ arr: [], highlight: [], mark: [], codeLines: [line], final, title, note,
      vars: Object.entries(frame.locals).map(([name, value]) => ({ name, value: Array.isArray(value) ? [...value] : value })),
      differentParentheses241View: { expression, activeId: frame.id, line, event, stack: [...stack],
        nodes: nodes.map(node => ({ id: node.id, parentId: node.parentId, expression: node.expression, start: node.start, depth: node.depth, status: node.status,
          initialized: node.initialized, i: node.i, op: node.op, split: node.split ? { ...node.split } : null,
          leftId: node.leftId, rightId: node.rightId,
          left: node.left ? node.left.map(item => ({ ...item })) : null, right: node.right ? node.right.map(item => ({ ...item })) : null,
          a: node.a, b: node.b, pending: node.pending ? { ...node.pending } : null, results: node.results.map(item => ({ ...item })) })),
        groups: groups.map(group => ({ ...group, left: group.left ? group.left.map(item => ({ ...item })) : null, right: group.right ? group.right.map(item => ({ ...item })) : null, results: group.results.map(item => ({ ...item })) })),
        answer: final ? frame.results.map(item => item.value) : null },
    });
  }
  function solve(expr, start = 0, parent = null, role = null) {
    const frame = { id: nodes.length, parentId: parent?.id ?? null, expression: expr, start, depth: stack.length,
      status: 'running', initialized: false, i: null, op: null, split: null, leftId: null, rightId: null,
      left: null, right: null, a: null, b: null, pending: null, results: [], locals: { expression: expr } };
    nodes.push(frame); stack.push(frame.id);
    if (parent) parent[role + 'Id'] = frame.id;
    emit(frame, 2, 'call', bi(`Gọi f('${expr}')`, `Call f('${expr}')`), bi('Mỗi lời gọi trả về một danh sách: một phần tử cho mỗi cách đặt ngoặc.', 'Each call returns a list: one entry per parenthesization.'));
    const numeric = /^\d+$/.test(expr);
    emit(frame, 3, 'base-check', bi(`expression.isdigit() → ${numeric ? 'True' : 'False'}`, `expression.isdigit() → ${numeric ? 'True' : 'False'}`), bi(numeric ? 'Không còn toán tử để chia. Trả về một số trong danh sách.' : 'Có toán tử. Thử từng toán tử làm phép tính cuối cùng.', numeric ? 'No operator remains to split. Return the number in a list.' : 'Operators remain. Try each one as the final operation.'));
    if (numeric) {
      frame.results.push({ value: Number(expr), form: expr }); frame.status = 'returned';
      emit(frame, 4, 'return-number', bi(`return [${Number(expr)}]`, `return [${Number(expr)}]`), bi('Dừng ở số nguyên, kể cả số có hai chữ số. Chưa ghép nó vào kết quả của cha.', 'Stop at an integer, including a two-digit number. It has not yet been combined into the parent results.'), parent === null);
      stack.pop(); return frame.results;
    }
    frame.initialized = true; frame.locals.results = [];
    emit(frame, 5, 'init', bi('results = []', 'results = []'), bi('Danh sách riêng của lời gọi này, ban đầu rỗng.', 'This call has its own initially empty result list.'));
    for (let i = 0; i < expr.length; i++) {
      const op = expr[i]; frame.i = i; frame.op = op; frame.locals.i = i; frame.locals.op = op;
      frame.split = null; frame.leftId = frame.rightId = null; frame.left = frame.right = null; frame.a = frame.b = frame.pending = null;
      emit(frame, 6, 'scan', bi(`Xét '${op}' tại vị trí ${start + i}`, `Inspect '${op}' at position ${start + i}`), bi('Chỉ chia tại toán tử, không chia giữa các chữ số của một số.', 'Split only at operators, never between digits of one number.'));
      const digit = !'+-*'.includes(op);
      if (!digit) frame.split = { index: start + i, op, leftExpression: expr.slice(0, i), rightExpression: expr.slice(i + 1) };
      emit(frame, 7, 'operator-check', bi(`op not in '+-*' → ${digit ? 'True' : 'False'}`, `op not in '+-*' → ${digit ? 'True' : 'False'}`), bi(digit ? 'Đây là chữ số, bỏ qua.' : `Chọn '${op}' làm phép tính cuối cùng; giải hai đoạn hai bên trước.`, digit ? 'This is a digit; skip it.' : `Choose '${op}' as the last operation; solve both sides first.`));
      if (digit) {
        emit(frame, 8, 'continue', bi('continue: không chia tại chữ số', 'continue: do not split at a digit'), bi('Chuyển sang ký tự tiếp theo.', 'Move to the next character.'));
        continue;
      }
      let group = null;
      if (parent === null) { group = { index: start + i, op, leftExpression: expr.slice(0, i), rightExpression: expr.slice(i + 1), left: null, right: null, results: [] }; groups.push(group); }
      emit(frame, 9, 'call-left', bi(`Giải nhánh trái '${expr.slice(0, i)}'`, `Solve left '${expr.slice(0, i)}'`), bi('Cha chờ lời gọi con trả về. Chưa có danh sách left mới.', 'The parent waits for its child. The new left list is not available yet.'));
      frame.left = solve(expr.slice(0, i), start, frame, 'left'); frame.locals.left = frame.left.map(item => item.value); if (group) group.left = frame.left;
      emit(frame, 9, 'receive-left', bi(`left = [${frame.locals.left.join(', ')}]`, `left = [${frame.locals.left.join(', ')}]`), bi('Con trái đã trả về, gán danh sách left trong lời gọi cha.', 'The left child returned; assign its list to left in the parent.'));
      emit(frame, 10, 'call-right', bi(`Giải nhánh phải '${expr.slice(i + 1)}'`, `Solve right '${expr.slice(i + 1)}'`), bi('Nhánh trái đã xong. Cha chờ danh sách right mới.', 'The left side is ready. The parent now waits for the new right list.'));
      frame.right = solve(expr.slice(i + 1), start + i + 1, frame, 'right'); frame.locals.right = frame.right.map(item => item.value); if (group) group.right = frame.right;
      emit(frame, 10, 'receive-right', bi(`right = [${frame.locals.right.join(', ')}]`, `right = [${frame.locals.right.join(', ')}]`), bi('Hai danh sách đều có. Bây giờ ghép mọi phần tử trái với mọi phần tử phải.', 'Both lists are ready. Combine every left entry with every right entry.'));
      for (const a of frame.left) {
        frame.a = a.value; frame.b = null; frame.pending = null; frame.locals.a = a.value;
        emit(frame, 11, 'choose-a', bi(`Chọn a = ${a.value}`, `Choose a = ${a.value}`), bi(`Cách đặt ngoặc bên trái: ${a.form}.`, `Left parenthesization: ${a.form}.`));
        for (const b of frame.right) {
          frame.b = b.value; frame.pending = null; frame.locals.b = b.value;
          emit(frame, 12, 'choose-b', bi(`Chọn b = ${b.value}`, `Choose b = ${b.value}`), bi(`Cách đặt ngoặc bên phải: ${b.form}. Chưa tính value hoặc append.`, `Right parenthesization: ${b.form}. value has not been calculated or appended yet.`));
          emit(frame, 13, 'plus-check', bi(`op == '+' → ${op === '+' ? 'True' : 'False'}`, `op == '+' → ${op === '+' ? 'True' : 'False'}`), bi('Kiểm tra phép cộng.', 'Check addition.'));
          if (op !== '+') emit(frame, 15, 'minus-check', bi(`op == '-' → ${op === '-' ? 'True' : 'False'}`, `op == '-' → ${op === '-' ? 'True' : 'False'}`), bi('Kiểm tra phép trừ.', 'Check subtraction.'));
          if (op === '*') emit(frame, 17, 'else', bi('else: phép nhân', 'else: multiplication'), bi('Sắp nhân hai kết quả con.', 'About to multiply the two child results.'));
          const computed = op === '+' ? a.value + b.value : op === '-' ? a.value - b.value : a.value * b.value;
          const value = computed === 0 ? 0 : computed; // Match Python integer zero, including negative × zero.
          frame.pending = { value, form: `(${a.form}${op}${b.form})` }; frame.locals.value = value;
          emit(frame, op === '+' ? 14 : op === '-' ? 16 : 18, 'calculate', bi(`${a.value} ${op === '*' ? '×' : op} ${b.value} = ${value}`, `${a.value} ${op === '*' ? '×' : op} ${b.value} = ${value}`), bi('Đã tính value, nhưng results chưa nhận phần tử này.', 'value is calculated, but it has not been appended to results.'));
          frame.results.push({ ...frame.pending }); frame.locals.results.push(value); if (group) group.results.push({ ...frame.pending });
          emit(frame, 19, 'append', bi(`results.append(${value})`, `results.append(${value})`), bi(`Thêm cách ${frame.pending.form}. Giữ kết quả trùng vì cách đặt ngoặc khác nhau.`, `Append grouping ${frame.pending.form}. Keep duplicate values from different parenthesizations.`));
        }
      }
    }
    frame.status = 'returned';
    emit(frame, 20, 'return', bi(`return [${frame.locals.results.join(', ')}]`, `return [${frame.locals.results.join(', ')}]`), bi(parent === null ? 'Đã thử tất cả toán tử làm gốc. Mỗi phần tử là một cách đặt ngoặc; thứ tự bất kỳ đều hợp lệ.' : 'Trả toàn bộ danh sách cho cha. Cha sẽ ghép nó với danh sách của nhánh còn lại.', parent === null ? 'Every root operator has been tried. Each entry represents one grouping; any result order is valid.' : 'Return the complete list to the parent, which combines it with the opposite child list.'), parent === null);
    stack.pop(); return frame.results;
  }
  const results = solve(expression);
  return { original: expression, answer: results.map(item => item.value), steps };
}

module.exports = { 241: {
  id: 241, difficulty: 'medium', slug: 'different-ways-to-add-parentheses',
  category: { key: 'divide-and-conquer', vi: 'Chia để trị', en: 'Divide and Conquer' },
  tags: [{ key: 'string', vi: 'Chuỗi', en: 'String' }, { key: 'parentheses', vi: 'Ngoặc', en: 'Parentheses' }, { key: 'recursion', vi: 'Đệ quy', en: 'Recursion' }],
  title: bi('Different Ways to Add Parentheses', 'Different Ways to Add Parentheses'),
  titleVi: bi('Tất cả kết quả của các cách đặt ngoặc', 'All results from different parenthesizations'),
  statement: bi('Cho biểu thức chứa số nguyên 0–99 và toán tử +, -, *. Trả về kết quả của mọi cách đặt ngoặc, giữ các kết quả trùng nhau; thứ tự bất kỳ. Đề gốc dài 1–20 ký tự. Visualization hỗ trợ tối đa 4 toán tử để cây và từng bước dễ theo dõi.', 'Given an expression with integers 0–99 and +, -, *, return the results of every parenthesization, preserving duplicates; any order is valid. The original length limit is 1–20 characters. Visualization allows up to 4 operators to keep the tree and steps manageable.'),
  inputKind: 'string', inputLabel: bi('expression — số 0–99; tối đa 20 ký tự, 4 toán tử', 'expression — numbers 0–99; up to 20 characters, 4 operators'), defaultInput: '2*3-4*5', extraParams: [], debugMode: 'line-by-line',
  approach: [
    bi('Nếu đoạn chỉ là một số, trả về [số đó]. Không chia số có hai chữ số.', 'If a segment is a number, return [that number]. Never split a two-digit integer.'),
    bi('Chọn mỗi toán tử làm gốc, tức phép tính cuối cùng. Đệ quy để lấy tất cả kết quả bên trái và bên phải.', 'Choose each operator as the root, the last operation. Recursively get every left and right result.'),
    bi('Ghép tích Descartes: với mỗi a bên trái, thử mọi b bên phải và tính a op b. Tính trước, append sau.', 'Take the Cartesian product: for each left a, try every right b and compute a op b. Calculate first, append afterward.'),
    bi('Giữ các giá trị trùng: hai cách đặt ngoặc khác nhau có thể cùng ra -10. Không dùng thứ tự ưu tiên thông thường của toán tử.', 'Keep duplicate values: different parenthesizations can both produce -10. Ordinary operator precedence does not fix the grouping.'),
  ],
  complexity: { time: 'O(n × 4^k)', space: 'O(n + Cₖ)', note: bi('k là số toán tử; Cₖ là số Catalan, cũng là số cách đặt ngoặc. Đây là cận trên thời gian cho đệ quy không memo; bộ nhớ gồm ngăn xếp và các danh sách kết quả. Không tính khung và biểu thức minh họa.', 'k is the operator count; Cₖ is the Catalan number of parenthesizations. Time is an upper bound for recursion without memoization; memory includes the stack and result lists. Excludes visualization snapshots and grouping strings.') },
  code: SOURCE, builder: buildSteps, liveArgs: input => [parseInput(input)],
} };
