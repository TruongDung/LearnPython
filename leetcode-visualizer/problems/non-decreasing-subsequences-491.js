"use strict";

const base = require("./backtracking")[491];
const bi = (vi, en) => ({ vi, en });

function parseNums491(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 8 || !input.every(Number.isSafeInteger)) {
    throw new RangeError("#491: nhập 1–8 số nguyên để debug đủ từng dòng / enter 1–8 safe integers for a complete line trace.");
  }
  return [...input];
}

// Snapshots follow completed Python statements, including the exhausted for
// and the caller's resumed call line. No synthetic call at the def statement.
function buildSteps491(input) {
  const nums = parseNums491(input), steps = [], result = [], savedIndices = [], selected = [], stack = [];
  let current = null, nextFrameId = 0;
  function emit(line, action, title, extra = {}, final = false) {
    const frame = stack.at(-1), i = frame?.i;
    const shownFrom = final ? 0 : Math.max(0, result.length - 12);
    const view = {
      nums: [...nums], line, action, scope: frame ? "backtrack" : "findSubsequences",
      current: current === null ? null : [...current], selected: [...selected],
      stack: stack.map(f => ({ ...f, indices: [...f.indices], ...(f.used ? { used: [...f.used] } : {}),
        gates: JSON.parse(JSON.stringify(f.gates)) })),
      start: frame?.start ?? null, i: i ?? null,
      used: frame?.used ? [...frame.used] : null,
      gates: frame ? JSON.parse(JSON.stringify(frame.gates)) : { duplicate: null, order: null },
      results: result.slice(shownFrom).map((values, index) => ({ values: [...values], indices: [...savedIndices[shownFrom + index]], number: shownFrom + index + 1 })),
      resultCount: result.length, shownFrom, ...extra,
    };
    steps.push({ title, note: bi("", ""), arr: [], codeLines: [line], final,
      vars: [
        { name: "start", value: frame?.start ?? "—" }, { name: "i", value: i ?? "—" },
        { name: "nums[i]", value: i === undefined ? "—" : nums[i] },
        { name: "current", value: current === null ? "—" : [...current] },
        { name: "used", value: frame?.used ? `{${[...frame.used].join(", ")}}` : "—" },
        { name: "len(result)", value: result.length },
      ], subsequences491View: view,
    });
  }
  emit(3, "init", bi("result = []", "result = []"));
  current = []; emit(4, "init", bi("current = []", "current = []"));
  emit(6, "define", bi("Tạo hàm backtrack", "Define backtrack"));
  function visit(start) {
    const frame = { id: nextFrameId++, start, indices: [...selected], gates: { duplicate: null, order: null } };
    stack.push(frame);
    emit(7, "length", bi(`Độ dài ${current.length} ${current.length >= 2 ? "≥" : "<"} 2`, `Length ${current.length} ${current.length >= 2 ? "≥" : "<"} 2`), { canSave: current.length >= 2 });
    if (current.length >= 2) {
      result.push([...current]); savedIndices.push([...selected]);
      emit(8, "save", bi(`Lưu dãy #${result.length}`, `Save sequence #${result.length}`));
    }
    frame.used = new Set(); emit(10, "used-init", bi("used riêng cho frame này", "This frame's own used set"));
    for (let i = start; i < nums.length; i++) {
      frame.i = i; frame.gates = { duplicate: null, order: null };
      emit(11, "candidate", bi(`Xét nums[${i}]`, `Inspect nums[${i}]`));
      const duplicate = frame.used.has(nums[i]);
      frame.gates.duplicate = { pass: !duplicate, values: [...frame.used], value: nums[i] };
      emit(12, "duplicate", bi(duplicate ? "Đã thử ở frame này" : "Chưa thử ở frame này", duplicate ? "Already tried in this frame" : "New to this frame"));
      if (duplicate) { emit(13, "skip-duplicate", bi("Bỏ nhánh trùng", "Skip duplicate branch")); continue; }
      const last = current.at(-1) ?? null, pass = last === null || nums[i] >= last;
      frame.gates.order = { left: last, right: nums[i], pass };
      emit(14, "order", bi(pass ? "Giữ dãy không giảm" : "Số mới nhỏ hơn số cuối", pass ? "Sequence stays non-decreasing" : "New value is smaller"));
      if (!pass) { emit(15, "skip-order", bi("Bỏ nhánh giảm", "Skip decreasing branch")); continue; }
      frame.used.add(nums[i]); emit(17, "used-add", bi(`Đánh dấu đã thử ${nums[i]}`, `Mark ${nums[i]} as tried`));
      current.push(nums[i]); selected.push(i);
      emit(18, "append", bi(`Chọn ${nums[i]}`, `Choose ${nums[i]}`));
      visit(i + 1);
      emit(19, "resume", bi("Trở về frame cha", "Resume parent frame"), { returnedStart: i + 1 });
      const removedIndex = selected.pop(); current.pop();
      emit(20, "pop", bi(`Quay lui: bỏ ${nums[i]}`, `Backtrack: remove ${nums[i]}`), { removedIndex });
    }
    emit(11, "return", bi("Hết ứng viên · quay về", "No candidates left · return"));
    stack.pop();
  }
  visit(0);
  emit(22, "root-return", bi("Đã duyệt mọi nhánh", "All branches explored"));
  emit(23, "done", bi(`${result.length} dãy khác nhau`, `${result.length} distinct sequences`), {}, true);
  return { original: nums, answer: result.map(values => [...values]), steps };
}

module.exports = { 491: { ...base, builder: buildSteps491, debugMode: "line-by-line", liveArgs: input => [parseNums491(input)],
  inputLabel: bi("nums · 1–8 số nguyên", "nums · 1–8 integers"),
  statement: bi("Chọn các số theo thứ tự index để tạo dãy không giảm, dài ít nhất 2. Chỉ giữ các dãy khác nhau.", "Choose values in index order to build non-decreasing sequences of length ≥ 2. Keep distinct sequences only."),
  approach: [bi("Chọn → đi sâu → pop để quay lại. Mỗi frame có used riêng để bỏ nhánh trùng.", "Choose → recurse → pop to return. Each frame owns a used set to skip duplicate branches.")],
  complexity: { time: "O(n · 2ⁿ)", space: "O(n²) auxiliary + O(n · 2ⁿ) output",
    note: bi("Mỗi frame giữ một set used; tổng các set trên stack tối đa O(n²). Minh hoạ đủ từng dòng với tối đa 8 số, không cắt trace.", "Each frame keeps a used set; all sets on the stack can occupy O(n²). Up to 8 values are traced completely, with no skipped steps.") },
} };
