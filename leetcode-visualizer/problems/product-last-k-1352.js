'use strict';

const bi = (vi, en) => ({ vi, en });
const CODE = [
  'class ProductOfNumbers:',
  '    def __init__(self):',
  '        self.prefix = [1]',
  '',
  '    def add(self, num: int) -> None:',
  '        if num == 0:',
  '            self.prefix = [1]',
  '            return',
  '        self.prefix.append(self.prefix[-1] * num)',
  '',
  '    def getProduct(self, k: int) -> int:',
  '        if k >= len(self.prefix):',
  '            return 0',
  '        return self.prefix[-1] // self.prefix[-k - 1]',
];
const DEFAULT = 'add(3);add(0);add(2);add(5);add(4);getProduct(2);getProduct(3);getProduct(4);add(8);getProduct(2)';
const fail = message => { throw new RangeError(`1352 · ${message}`); };

function parseOperations(input, limit = 24) {
  let rows = input;
  if (typeof input === 'string') {
    const raw = input.trim();
    if (!raw) fail('Nhập add(num);getProduct(k) / Enter add(num);getProduct(k).');
    if (raw.startsWith('[')) {
      try { rows = JSON.parse(raw); }
      catch (_) {
        try { rows = raw.split(/\r?\n/).filter(line => line.trim()).map(line => JSON.parse(line)); }
        catch (_) { fail('JSON không hợp lệ / Invalid JSON.'); }
      }
    } else {
      const parts = raw.split(';'); if (!parts.at(-1).trim()) parts.pop();
      rows = parts.map(part => {
        const match = /^\s*(add|getProduct|get|ProductOfNumbers)\(\s*(\d*)\s*\)\s*$/.exec(part);
        if (!match) fail('Cú pháp: add(3);getProduct(1) / Use add(3);getProduct(1).');
        return [match[1], ...(match[2] === '' ? [] : [Number(match[2])])];
      });
    }
  }
  // Accept the two arrays used by LeetCode as well as rows of operations.
  if (Array.isArray(rows) && rows.length === 2 && Array.isArray(rows[0]) && Array.isArray(rows[1]) &&
      rows[0].every(name => typeof name === 'string') && rows[1].every(args => Array.isArray(args))) {
    if (rows[0].length !== rows[1].length) fail('Tên lệnh và args phải cùng độ dài / Operation and argument counts must match.');
    rows = rows[0].map((name, index) => [name, ...rows[1][index]]);
  }
  if (!Array.isArray(rows)) fail('Cần danh sách lệnh / Expected operations.');
  rows = [...rows];
  if (Array.isArray(rows[0]) && rows[0].length === 1 && rows[0][0] === 'ProductOfNumbers') rows.shift();
  if (!rows.length || rows.length > limit) fail(`Minh hoạ 1–${limit} lệnh / Use 1–${limit} operations.`);
  let count = 0, product = 1;
  return Array.from(rows, (row, index) => {
    if (!Array.isArray(row) || row.length !== 2 || !Number.isSafeInteger(row[1])) fail(`Lệnh ${index+1} không hợp lệ / Invalid operation ${index+1}.`);
    const name = row[0] === 'get' ? 'getProduct' : row[0], value = row[1];
    if (name === 'add') {
      if (value < 0 || value > 100) fail('add nhận số nguyên 0…100 / add accepts integers in 0…100.');
      count++; product = value === 0 ? 1 : product * value;
      if (product > 2147483647) fail('Tích một đoạn vượt số nguyên 32-bit / A contiguous product exceeds a 32-bit integer.');
    } else if (name === 'getProduct') {
      if (value < 1 || value > count) fail(`getProduct(${value}): k phải từ 1 đến ${count} số đã thêm / k must be in 1…${count} added values.`);
    } else fail(`Không hỗ trợ ${String(name)} / Unsupported operation.`);
    return { name, args: [value], label: `${name}(${value})` };
  });
}

function builder(input) {
  const operations = parseOperations(input), steps = [], stream = [], outputs = [], history = [];
  let prefix = [], beforePrefix = [], lastZero = -1, opIndex = -1, method = '__init__', num, k;
  const titles = {
    3: ['Tạo prefix với mốc 1', 'Start prefix with identity 1'],
    6: ['Số vừa thêm có bằng 0?', 'Is the added value zero?'],
    7: ['Số 0 ngắt chuỗi tích', 'Zero breaks the product chain'],
    8: ['Kết thúc add(0)', 'Finish add(0)'],
    9: ['Nối một tích mới', 'Append one new product'],
    12: ['k có đi qua số 0?', 'Does k reach across a zero?'],
    13: ['Khoảng chứa 0: trả 0', 'The range contains zero: return 0'],
    14: ['Chia hai mốc prefix', 'Divide two prefix products'],
  };
  function complete(result) { outputs.push(result); history.push({ opIndex, result }); }
  function emit(line, phase, condition = null, calculation = null, resultReady = false, result = null) {
    const locals = { self: { prefix: [...prefix] } };
    if (method === 'add') locals.num = num;
    if (method === 'getProduct') locals.k = k;
    const title = titles[line];
    steps.push({
      title: bi(`Dòng ${line} · ${title[0]}`, `Line ${line} · ${title[1]}`), note: bi('', ''),
      arr: [], highlight: [], mark: [], codeLines: [line], final: false,
      vars: [{ name: 'self.prefix', value: [...prefix] }, ...(method === 'add' ? [{ name: 'num', value: num }] : method === 'getProduct' ? [{ name: 'k', value: k }] : [])],
      product1352View: {
        line, source: CODE[line-1].trim(), phase, condition, method, opIndex, num: method === 'add' ? num : null, k: method === 'getProduct' ? k : null,
        prefix: [...prefix], beforePrefix: [...beforePrefix], stream: [...stream], lastZero,
        operations: operations.map(op => ({ ...op, args: [...op.args] })), outputs: [...outputs], history: history.map(item => ({ ...item })),
        calculation: calculation ? { ...calculation } : null, resultReady, result, locals, final: false,
      },
    });
  }
  prefix = [1]; emit(3, 'init');
  operations.forEach((op, index) => {
    opIndex = index; method = op.name; beforePrefix = [...prefix];
    if (method === 'add') {
      num = op.args[0]; emit(6, 'zero-check', num === 0);
      stream.push(num);
      if (num === 0) {
        prefix = [1]; lastZero = stream.length-1; emit(7, 'reset');
        complete(null); emit(8, 'add-done', null, null, true);
      } else {
        const before = prefix.at(-1), after = before * num; prefix.push(after);
        complete(null); emit(9, 'multiply', null, { before, num, after }, true);
      }
    } else {
      k = op.args[0]; const crossesZero = k >= prefix.length;
      emit(12, 'range-check', crossesZero);
      if (crossesZero) { complete(0); emit(13, 'zero-result', null, null, true, 0); }
      else {
        const numerator = prefix.at(-1), denominatorIndex = prefix.length-k-1, denominator = prefix[denominatorIndex], result = numerator / denominator;
        complete(result); emit(14, 'divide', null, { numerator, denominator, denominatorIndex, result }, true, result);
      }
    }
  });
  steps.at(-1).final = true; steps.at(-1).product1352View.final = true;
  return { original: operations.map(op => [op.name, ...op.args]), answer: [...outputs], steps };
}

module.exports = { 1352: {
  id: 1352, slug: 'product-of-the-last-k-numbers', difficulty: 'medium',
  category: { key: 'design', vi: 'Thiết kế hệ thống', en: 'Design' },
  tags: [{ key: 'prefix-product', vi: 'Tích prefix', en: 'Prefix Product' }, { key: 'prefix-sum', vi: 'Prefix Sum', en: 'Prefix Sum' }, { key: 'array', vi: 'Mảng', en: 'Array' }],
  title: bi('Product of the Last K Numbers', 'Product of the Last K Numbers'),
  titleVi: bi('Tích của k số cuối trong luồng', 'Product of the last k values in a stream'),
  statement: bi('add(num) thêm một số. getProduct(k) trả tích của k số cuối. Khởi tạo ProductOfNumbers() tự động; kết quả liệt kê các lệnh bên dưới.', 'add(num) appends a value. getProduct(k) returns the product of the last k values. ProductOfNumbers() is initialized automatically; results correspond to the operations below.'),
  defaultInput: DEFAULT, inputKind: 'string', preserveInputWhitespace: true,
  inputLabel: bi('add(3);getProduct(1) · tối đa 24 lệnh · hỗ trợ JSON', 'add(3);getProduct(1) · up to 24 operations · JSON supported'), extraParams: [],
  debugMode: 'line-by-line', code: CODE, builder, parseOperations,
  approach: [bi('0 đặt prefix về [1]. Nếu k vượt đoạn sau số 0 thì trả 0; còn lại chia prefix[-1] cho prefix[-k−1].', 'Zero resets prefix to [1]. If k exceeds the segment after zero, return 0; otherwise divide prefix[-1] by prefix[-k−1].')],
  complexity: { time: 'O(1) amortized / add, O(1) / getProduct', space: 'O(n)', note: bi('Minh hoạ tối đa 24 lệnh; dữ liệu tuân giới hạn tích 32-bit của đề.', 'Visualization up to 24 operations; products follow the problem’s 32-bit constraint.') },
  prepareLiveDesign: input => ({ className: 'ProductOfNumbers', constructorArgs: [], operations: parseOperations(input, 40000).map(op => ({ name: op.name, args: [...op.args] })) }),
} };
