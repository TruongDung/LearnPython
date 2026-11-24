"use strict";
const base = require("./two-pointer")[2];
const { runTrace } = require("./wasm-picture-trace");
const context = require("./catalog-context");
const bi = (vi, en) => ({ vi, en });
const code = [...base.code];
const copy = value => JSON.parse(JSON.stringify(value));

function parse(input) {
  let lists;
  const error = () => new RangeError("#2: nhập hai danh sách chữ số, ví dụ 2,4,3;5,6,4. Mỗi danh sách gồm 1–100 chữ số từ 0 đến 9 / Enter two lists of 1–100 digits, e.g. 2,4,3;5,6,4.");
  if (typeof input !== "string") throw error();
  const raw = input.trim();
  try {
    if (raw.startsWith("[") && !raw.includes(";")) lists = JSON.parse(raw);
    else {
      const parts = raw.split(";");
      if (parts.length !== 2) throw error();
      lists = parts.map(part => {
        const text = part.trim();
        if (text.startsWith("[")) return JSON.parse(text);
        const tokens = text.split(",").map(token => token.trim());
        if (!tokens.every(token => /^[0-9]$/.test(token))) throw error();
        return tokens.map(Number);
      });
    }
  } catch (_) { throw error(); }
  if (!Array.isArray(lists) || lists.length !== 2 || !lists.every(list => Array.isArray(list) && list.length >= 1 && list.length <= 100
    && Array.from(list).every(value => Number.isInteger(value) && value >= 0 && value <= 9))) throw error();
  return lists.map(list => [...list]);
}

function builder(input) {
  const [a, b] = parse(input);
  const prelude = context + '\n_viz_config = {"kinds": ["list", "list"], "answerKind": "list"}\n';
  const trace = runTrace({ code: code.join("\n"), method: "addTwoNumbers", args: [a, b], prelude,
    captureAllocations: ["ListNode"], stateClasses: ["Solution"], maxEvents: 2000, failOnTruncate: true });
  const first = trace.events[0];
  const objects = new Map(first.objects.map(object => [object.id, object]));
  function positions(head) {
    const result = new Map();
    let id = head?.id ?? null;
    while (id !== null) {
      if (result.has(id)) throw new Error("Unexpected input cycle.");
      result.set(id, result.size);
      id = objects.get(id)?.fields.next?.id ?? null;
    }
    return result;
  }
  const indicesA = positions(first.locals.l1), indicesB = positions(first.locals.l2);
  const output = [], history = [];
  let round = -1, column = null;
  const stages = {
    3: bi("Tạo đầu giả để nối kết quả", "Create a dummy head for the result"),
    4: bi("cur đứng ở cuối danh sách kết quả", "cur points to the result tail"),
    5: bi("Bắt đầu với số nhớ bằng 0", "Start with carry = 0"),
    6: bi("Còn chữ số hoặc số nhớ?", "Digits or carry remaining?"),
    7: bi("Lấy chữ số ở danh sách A", "Read a digit from list A"),
    8: bi("Lấy chữ số ở danh sách B", "Read a digit from list B"),
    9: bi("Cộng hai chữ số và số nhớ", "Add two digits and the incoming carry"),
    10: bi("Giữ số nhớ cho cột kế tiếp", "Save the carry for the next column"),
    11: bi("Ghi chữ số vào node mới", "Write the digit into a new node"),
    12: bi("Dời cur tới node vừa tạo", "Move cur to the new node"),
    13: bi("Dời con trỏ A sang node tiếp", "Advance pointer A"),
    14: bi("Dời con trỏ B sang node tiếp", "Advance pointer B"),
    15: bi("Đọc kết quả: hàng lớn ở bên phải", "Read the result: higher places are on the right"),
  };
  const steps = trace.events.map(record => {
    const x = record.locals, line = record.line;
    if (line === 6 && record.branch) {
      round++;
      column = { index: round, a: null, b: null, total: null, carryIn: x.carry, carryOut: null, digit: null, written: false };
    }
    if (line === 7) column.a = x.val1;
    if (line === 8) column.b = x.val2;
    if (line === 9) column.total = x.total;
    if (line === 10) column.carryOut = x.carry;
    if (line === 11) {
      column.digit = x.total % 10;
      column.written = true;
      output.push(column.digit);
      history.push(copy(column));
    }
    const final = line === 15 && record.returning;
    const phase = stages[line] || bi("Theo dõi con trỏ", "Follow the pointers");
    const view = {
      a, b, output: [...output], column: copy(column), history: copy(history),
      cursorA: x.l1 ? indicesA.get(x.l1.id) ?? null : null,
      cursorB: x.l2 ? indicesB.get(x.l2.id) ?? null : null,
      carry: x.carry ?? null, cur: x.cur ?? null,
      line, source: code[line - 1].trim(), phase, branch: record.branch,
      final, answer: final ? trace.answer : null,
    };
    return { arr: [], highlight: [], mark: [], codeLines: [line], codeBlock: 1, final,
      title: bi(`L${line} · ${phase.vi}`, `L${line} · ${phase.en}`), note: bi("", ""),
      vars: Object.entries(x).map(([name, value]) => ({ name, value, rawValue: value })),
      addTwoNumbers2View: view,
    };
  });
  return { original: { l1: a, l2: b }, answer: trace.answer, steps };
}

module.exports = { 2: {
  ...base, code, builder, debugMode: "line-by-line",
  titleVi: bi("Cộng từng cột · ghi chữ số · chuyển số nhớ", "Add each column · write a digit · pass the carry"),
  statement: bi("Mỗi node chứa một chữ số; đầu danh sách là hàng đơn vị. Ví dụ 2 → 4 → 3 là số 342. Cộng cùng một hàng, ghi total % 10, rồi chuyển total // 10 sang hàng tiếp. Danh sách ngắn hơn được xem như có chữ số 0 ở các hàng còn lại.", "Each node stores one digit, with the ones digit first. For example, 2 → 4 → 3 represents 342. Add matching places, write total % 10, and pass total // 10 to the next place. Missing digits in a shorter list contribute zero."),
  inputLabel: bi("A ; B · ví dụ 2,4,3 ; 5,6,4 · chữ số hàng đơn vị trước", "A ; B · e.g. 2,4,3 ; 5,6,4 · ones digits first"),
  approach: [bi("Cùng một cột: chữ số A + chữ số B + nhớ vào.", "Same column: digit A + digit B + incoming carry."),
    bi("Ví dụ 4 + 6 + 0 = 10 → ghi 0, nhớ 1. Dù hai list đã hết, còn nhớ thì vẫn tạo node cuối.", "For example, 4 + 6 + 0 = 10 → write 0, carry 1. Create a final node if a carry remains after both lists end.")],
  complexity: { time: "O(max(m,n))", space: "O(max(m,n))", note: bi("Mỗi chữ số đi qua một lần; danh sách kết quả chứa nhiều nhất max(m,n)+1 node.", "Visit each digit once; the result has at most max(m,n)+1 nodes.") },
  liveArgs: input => parse(input).map(values => ({ __viz_type: "linked_list", values })),
  parseAddTwoNumbers2: parse,
} };
