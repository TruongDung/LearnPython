"use strict";

const base = require("./backtracking")[131];
const { bi } = require("./hard-viz-shared");
// Avoid an undefined typing.List annotation when this snippet runs standalone.
const CODE = Object.freeze(base.code.map((line, i) => i === 1 ? "    def partition(self, s):" : line));

function parse131(input) {
  if (typeof input !== "string" || !/^[a-z]{1,24}$/.test(input)) throw new RangeError("#131: nhập 1–24 chữ thường a-z / enter 1–24 lowercase letters.");
  const ways = Array(input.length + 1).fill(0); ways[input.length] = 1;
  for (let start = input.length - 1; start >= 0; start--) for (let end = start + 1; end <= input.length; end++) {
    const piece = input.slice(start, end);
    if (piece === [...piece].reverse().join("")) ways[start] = Math.min(129, ways[start] + ways[end]);
  }
  if (ways[0] > 128) throw new RangeError("#131: quá 128 cách tách; rút gọn chuỗi để debug đủ từng dòng / more than 128 partitions; shorten s for a complete trace.");
  return input;
}

function buildSteps131(input) {
  const s = parse131(input), path = [], res = [], stack = [], steps = [];
  let nextId = 0;
  const copy = values => [...values];
  const candidatePhases = new Set(["end", "piece", "check", "append", "resume", "pop"]);
  function emit(line, phase, title, detail = {}, final = false) {
    const f = stack.at(-1), from = final ? 0 : Math.max(0, res.length - 12);
    const locals = f ? { start: f.start, path: copy(path),
      ...Object.fromEntries(["end", "piece"].filter(key => Object.hasOwn(f, key)).map(key => [key, f[key]])) } : {};
    const candidate = f && candidatePhases.has(phase) && f.end !== undefined ? {
      start: f.start, end: f.end, text: s.slice(f.start, f.end), checked: f.checked,
    } : null;
    steps.push({ title, note: bi("", ""), arr: [], codeLines: [line], final,
      vars: [
        { name: "start", value: f?.start ?? "—" }, { name: "end", value: f?.end ?? "—" },
        { name: "piece", value: f?.piece ?? "—" },
        { name: "piece[::-1]", value: f?.checked === null || f?.piece === undefined ? "—" : [...f.piece].reverse().join("") },
        { name: "len(path)", value: f ? path.length : "—" }, { name: "len(res)", value: res.length },
      ], palindrome131View: {
        s, phase, source: { line, text: CODE[line - 1], timing: "after" }, scope: f ? "bt" : "partition", locals, candidate,
        stack: stack.map(frame => ({ id: frame.id, start: frame.start, via: frame.via, pathLength: path.length })),
        results: res.slice(from).map(copy), resultCount: res.length, shownFrom: from, ...detail,
      },
    });
  }
  emit(3, "init", bi("res = []", "res = []"));
  emit(4, "define", bi("Tạo hàm bt", "Define bt"));
  function bt(start, via = null) {
    const f = { id: nextId++, start, via, checked: null }; stack.push(f);
    emit(5, "end-check", bi(start === s.length ? "Đã dùng hết chuỗi" : "Chọn điểm cắt", start === s.length ? "Entire string consumed" : "Choose a cut"), { atEnd: start === s.length });
    if (start === s.length) {
      res.push(copy(path)); emit(6, "save", bi(`Sao chép đáp án #${res.length}`, `Copy partition #${res.length}`));
      emit(7, "return", bi("Quay về frame cha", "Return to parent")); stack.pop(); return;
    }
    for (let end = start + 1; end <= s.length; end++) {
      f.end = end; f.checked = null; emit(8, "end", bi("Nới điểm cắt end", "Move the end boundary"));
      f.piece = s.slice(start, end); emit(9, "piece", bi(`Cắt “${f.piece}”`, `Slice “${f.piece}”`));
      f.checked = f.piece === [...f.piece].reverse().join("");
      emit(10, "check", bi(f.checked ? "Đọc xuôi = đọc ngược ✓" : "Đọc xuôi ≠ đọc ngược", f.checked ? "Forward = backward ✓" : "Forward ≠ backward"));
      if (!f.checked) continue;
      path.push(f.piece); emit(11, "append", bi(`Chọn “${f.piece}”`, `Choose “${f.piece}”`));
      bt(end, f.piece);
      emit(12, "resume", bi("Trở về nhánh cha", "Resume parent branch"));
      const removed = path.pop(); emit(13, "pop", bi(`Bỏ “${removed}” để thử nhánh khác`, `Remove “${removed}” to try another branch`), { removed });
    }
    emit(8, "exhausted", bi("Hết điểm cắt · quay về", "No cuts left · return")); stack.pop();
  }
  bt(0);
  emit(14, "root-return", bi("Đã duyệt mọi nhánh", "All branches explored"));
  emit(15, "done", bi(`${res.length} cách tách hợp lệ`, `${res.length} valid partitions`), {}, true);
  return { original: s, answer: res.map(copy), steps };
}

module.exports = { 131: { ...base, code: CODE, builder: buildSteps131, debugMode: "line-by-line", liveArgs: input => [parse131(input)],
  inputLabel: bi("s · 1–24 chữ thường", "s · 1–24 lowercase letters"),
  approach: [bi("Cắt đoạn → soi gương → thêm vào path. Hết chuỗi thì sao chép path; pop để thử cách cắt khác.", "Cut a piece → mirror it → append to path. At the end, copy path; pop to try another cut.")],
  complexity: { time: "O(n · 2ⁿ)", space: "O(n) + output",
    note: bi("Minh hoạ tối đa 24 ký tự, 128 cách tách; giữ đủ mọi dòng và mọi đáp án cho đầu vào được nhận.", "Up to 24 characters and 128 partitions; every executed line and every answer is retained for accepted inputs.") },
} };
