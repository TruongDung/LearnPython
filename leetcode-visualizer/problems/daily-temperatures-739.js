"use strict";
const base = require("./array")[739];
const bi = (vi, en) => ({ vi, en });
const code = [...base.code];
function parse(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 100000 || !input.every(t => Number.isInteger(t) && t >= 30 && t <= 100)) {
    throw new Error("temperatures: cần 1–100000 số nguyên trong [30,100]. / Use 1–100000 integers in [30,100].");
  }
  return [...input];
}
function builder(input) {
  const temperatures = parse(input), detailed = temperatures.length <= 30;
  const locals = { self: {}, temperatures }, steps = [], nextWarmer = Array(temperatures.length).fill(null);
  let compare = null, connection = null;
  function emit(line, event, title) {
    if (!detailed) return;
    steps.push({ title: bi(`Dòng ${line} · ${title.vi}`, `Line ${line} · ${title.en}`), codeLines: [line], codeBlock: 1,
      final: event === "return", arr: [], highlight: [], mark: [], note: bi("", ""),
      vars: Object.entries(locals).map(([name, value]) => ({ name, rawValue: Array.isArray(value) ? [...value] : name === "self" ? {} : value,
        value: name === "self" ? "Solution" : Array.isArray(value) ? `[${value.join(", ")}]` : value })),
      daily739View: { mode: "trace", line, source: code[line - 1].trim(), event, temperatures: [...temperatures], total: temperatures.length,
        i: locals.i ?? null, temp: locals.temp ?? null, answer: [...locals.answer], stack: locals.stack ? [...locals.stack] : null,
        nextWarmer: [...nextWarmer], compare: compare && { ...compare }, connection: connection && { ...connection } }
    });
  }
  locals.answer = Array(temperatures.length).fill(0);
  emit(3, "init-answer", bi("answer bắt đầu bằng 0", "answer starts at 0"));
  locals.stack = []; emit(4, "init-stack", bi("Stack rỗng", "Empty stack"));
  for (let i = 0; i < temperatures.length; i++) {
    locals.i = i; locals.temp = temperatures[i]; compare = null; connection = null;
    emit(5, "day", bi(`Ngày ${i} · ${locals.temp}°`, `Day ${i} · ${locals.temp}°`));
    while (true) {
      const top = locals.stack.length ? locals.stack.at(-1) : null;
      const warmer = top !== null && temperatures[top] < locals.temp;
      compare = { top, topTemp: top === null ? null : temperatures[top], current: i, currentTemp: locals.temp, warmer };
      connection = null;
      emit(6, "check", bi(top === null ? "Stack rỗng → ngừng pop" : `${temperatures[top]}° < ${locals.temp}°? ${warmer ? "Đúng" : "Sai"}`, top === null ? "Empty stack → stop popping" : `${temperatures[top]}° < ${locals.temp}°? ${warmer ? "True" : "False"}`));
      if (!warmer) break;
      locals.prev = locals.stack.pop(); compare = null;
      connection = { from: locals.prev, to: i, days: i - locals.prev, recorded: false };
      emit(7, "pop", bi(`prev = pop() → ${locals.prev}`, `prev = pop() → ${locals.prev}`));
      locals.answer[locals.prev] = i - locals.prev; nextWarmer[locals.prev] = i; connection.recorded = true;
      emit(8, "write", bi(`answer[${locals.prev}] = ${i} − ${locals.prev}`, `answer[${locals.prev}] = ${i} − ${locals.prev}`));
    }
    compare = null; connection = null; locals.stack.push(i);
    emit(9, "push", bi(`Push index ${i}`, `Push index ${i}`));
  }
  compare = null; connection = null;
  emit(5, "loop-end", bi("Hết ngày để xét", "All days processed"));
  emit(10, "return", bi("Còn trong stack → giữ 0", "Still in stack → keep 0"));
  if (!detailed) steps.push({ title: bi("Đã tìm ngày ấm hơn cho toàn bộ mảng", "Computed warmer-day waits for the entire array"), codeLines: [], codeBlock: 1,
    final: true, vars: [], arr: [], highlight: [], mark: [], note: bi("", ""),
    daily739View: { mode: "summary", line: null, source: "", event: "return", total: temperatures.length, temperatures: temperatures.slice(0, 12),
      i: null, temp: null, answer: locals.answer.slice(0, 12), stack: null, remaining: locals.stack.length,
      nextWarmer: nextWarmer.slice(0, 12), compare: null, connection: null }
  });
  return { original: temperatures, answer: [...locals.answer], steps };
}
module.exports = { 739: { ...base, code, builder, debugMode: "line-by-line",
  statement: bi("Mỗi ngày chờ bao lâu để gặp ngày ấm hơn đầu tiên? Bằng nhiệt độ chưa tính; không có thì 0.", "How many days until the first warmer day? Equal temperatures do not qualify; use 0 if none exists."),
  approach: [bi("Stack giữ index đang chờ · nhiệt độ từ đáy ≥ đỉnh.", "Stack stores waiting indices · temperatures are non-increasing from bottom to top."),
    bi("Hôm nay ấm hơn đỉnh → pop prev → ghi i − prev. Sau cùng push i.", "Today is warmer than the top → pop prev → write i − prev. Then push i.")],
  complexity: { time: "O(n)", space: "O(n)", note: bi("Mỗi index vào/ra stack tối đa 1 lần. Debug với ≤30 ngày; mảng lớn vẫn tính đủ, hình xem trước 12 ngày.", "Each index enters/exits the stack at most once. Line debug for ≤30 days; larger arrays are fully computed with a 12-day picture preview.") },
  liveArgs: input => [parse(input)]
} };
