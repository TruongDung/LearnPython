"use strict";
const base = require("./backtracking")[39];
const bi = (vi, en) => ({ vi, en });
const CODE = Object.freeze([...base.code]);

function parse39(input, params = {}) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 30 ||
      input.some(n => !Number.isSafeInteger(n) || n < 1 || n > 40) || new Set(input).size !== input.length) {
    throw new RangeError("#39: nhập 1–30 số nguyên khác nhau trong 1–40 / enter 1–30 distinct integers from 1 to 40.");
  }
  const target = params?.target;
  if (!Number.isSafeInteger(target) || target < 1 || target > 40) {
    throw new RangeError("#39: target phải là số nguyên từ 1 đến 40 / target must be an integer from 1 to 40.");
  }
  return { candidates: [...input], target };
}

function buildSteps39(input, params) {
  const { candidates, target } = parse39(input, params);
  const result = [], current = [], indices = [], stack = [], nodes = [], children = new Map(), steps = [];
  let currentReady = false;
  function emit(line, phase, title, detail = {}, final = false) {
    if (steps.length >= 12000) throw new RangeError("#39: trace quá dài; giảm target hoặc bớt candidates / trace too long; reduce target or candidates.");
    const f = stack.at(-1), from = final ? 0 : Math.max(0, result.length - 12);
    const locals = { candidates: [...candidates], ...(!f ? { target } : {}), ...(currentReady ? { current: [...current] } : {}),
      ...(f ? { start: f.start, remain: f.remain, ...(f.i === undefined ? {} : { i: f.i }) } : {}) };
    // Keep the active branch and its visited siblings; the execution trace stays complete.
    const anchors = f ? stack.slice(-4).map(frame => frame.id) : nodes.length ? [0] : [];
    const shown = new Set(anchors);
    for (const id of anchors.slice(-2)) for (const child of children.get(id) || []) shown.add(child);
    const active = new Set(stack.map(frame => frame.id));
    steps.push({ title, note: bi("", ""), arr: [], codeLines: [line], final,
      vars: [
        { name: "start", value: f?.start ?? "—" }, { name: "i", value: f?.i ?? "—" },
        { name: "remain", value: f?.remain ?? "—" }, { name: "current", value: currentReady ? [...current] : "—" },
        { name: "sum(current)", value: currentReady ? current.reduce((sum,n) => sum+n, 0) : "—" }, { name: "len(result)", value: result.length },
      ], combination39View: {
        candidates: [...candidates], target, phase, source: { line, text: CODE[line-1], timing: "after" },
        scope: f ? "backtrack" : "combinationSum", locals, currentReady, indices: [...indices],
        stack: stack.map(frame => ({ ...frame, currentLength: current.length })), currentId: f?.id ?? null,
        tree: [...shown].sort((a,b) => a-b).map(id => ({ ...nodes[id], state: id === f?.id ? "current" : active.has(id) ? "ancestor" : nodes[id].status })),
        visitedCount: nodes.length, shownFrom: from, results: result.slice(from).map(row => [...row]), resultCount: result.length, ...detail,
      },
    });
  }
  emit(3, "result-init", bi("result = []", "result = []"));
  currentReady = true; emit(4, "current-init", bi("current = []", "current = []"));
  emit(6, "define", bi("Tạo hàm backtrack", "Define backtrack"));
  function backtrack(start, remain, parentId = null, via = null) {
    const node = { id: nodes.length, parentId, start, remain, via, depth: stack.length, status: "explored" };
    nodes.push(node); if (parentId !== null) { if (!children.has(parentId)) children.set(parentId, []); children.get(parentId).push(node.id); }
    const f = { id: node.id, start, remain }; stack.push(f);
    emit(7, "zero-check", bi(remain === 0 ? "✓ Đủ target" : "remain ≠ 0", remain === 0 ? "✓ Target reached" : "remain ≠ 0"));
    if (remain === 0) {
      result.push([...current]); node.status = "solution";
      emit(8, "save", bi(`Lưu [${current.join(", ")}]`, `Save [${current.join(", ")}]`));
      emit(9, "return-solution", bi("↩ Về nhánh cha", "↩ Return to parent")); stack.pop(); return;
    }
    if (remain < 0) node.status = "overshoot";
    emit(10, "negative-check", bi(remain < 0 ? "✕ Vượt target" : "Còn thiếu", remain < 0 ? "✕ Over target" : "Still below target"));
    if (remain < 0) { emit(11, "return-overshoot", bi("↩ Bỏ nhánh vượt tổng", "↩ Return from overshoot")); stack.pop(); return; }
    for (let i = start; i < candidates.length; i++) {
      f.i = i; emit(12, "choose", bi(`Thử ${candidates[i]}`, `Try ${candidates[i]}`));
      current.push(candidates[i]); indices.push(i); emit(13, "append", bi(`Thêm ${candidates[i]}`, `Append ${candidates[i]}`));
      backtrack(i, remain - candidates[i], node.id, i);
      emit(14, "resume", bi("↩ Nhánh con hoàn tất", "↩ Child branch returned"));
      const removed = current.pop(); indices.pop(); emit(15, "pop", bi(`Bỏ ${removed}, thử nhánh khác`, `Remove ${removed}, try the next branch`), { removed });
    }
    emit(12, "exhausted", bi("Đã thử hết lựa chọn", "All choices explored")); stack.pop();
  }
  backtrack(0, target);
  emit(17, "root-return", bi("↩ Đã duyệt mọi nhánh", "↩ All branches returned"));
  emit(18, "done", bi(`${result.length} tổ hợp`, `${result.length} combinations`), {}, true);
  return { original: [...candidates], target, answer: result.map(row => [...row]), steps };
}

module.exports = {39: {...base, code: CODE, builder: buildSteps39, debugMode: "line-by-line",
  liveArgs: (input, params) => { const {candidates,target} = parse39(input,params); return [candidates,target]; },
  inputLabel: bi("candidates · số khác nhau, 1–40", "candidates · distinct values, 1–40"),
  statement: bi("Chọn các số có tổng bằng target. Mỗi số được dùng lại nhiều lần; mỗi tổ hợp chỉ lưu một lần.", "Choose numbers that sum to target. Each value can be reused; save each combination once."),
  approach: [bi("Thêm số → đi sâu với start = i để dùng lại → lưu khi remain = 0 → pop để thử nhánh khác.", "Append → recurse with start = i to reuse → save at remain = 0 → pop for the next branch.")],
  complexity: {time:"O(nᵈ · d)",space:"O(d) + output",note:bi("n là số candidates; d = ⌊target / min(candidates)⌋ + 1 là độ sâu tối đa.", "n is the candidate count; d = ⌊target / min(candidates)⌋ + 1 is the maximum depth.")},
}};
