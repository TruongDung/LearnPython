"use strict";

const base = require("./tree")[104];
const { runTrace } = require("./wasm-picture-trace");
const bi = (vi, en) => ({ vi, en });
const code = [...base.code];
const copy = value => JSON.parse(JSON.stringify(value));

function parse(input) {
  let values = input;
  if (typeof values === "string") {
    const raw = values.trim();
    try { values = !raw ? [] : raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => {
      const text = s.trim(); return ["null", "None"].includes(text) ? null : text ? Number(text) : NaN;
    }); } catch { values = null; }
  }
  const error = () => new RangeError("#104: cây level-order gồm 0–31 nút, số nguyên −1000…1000, null cho nhánh trống / use 0–31 connected integer nodes, −1000…1000, with null for missing children.");
  if (!Array.isArray(values) || values.length > 63
    || !Array.from(values).every(v => v === null || Number.isInteger(v) && Math.abs(v) <= 1000)) throw error();
  values = [...values];
  const nodes = values.length && values[0] !== null ? [{ id: "0:0", value: values[0], left: null, right: null, parent: null, depth: 0 }] : [];
  let index = 1;
  for (let head = 0; head < nodes.length && index < values.length; head++) for (const side of ["left", "right"]) {
    if (index >= values.length) break;
    const value = values[index], id = `0:${index++}`;
    if (value === null) continue;
    nodes[head][side] = id;
    nodes.push({ id, value, left: null, right: null, parent: nodes[head].id, depth: nodes[head].depth + 1 });
  }
  if (nodes.length > 31 || values.slice(index).some(v => v !== null)) throw error();
  const byId = new Map(nodes.map(node => [node.id, node])); let rank = 0;
  const inorder = id => { if (id === null) return; const n = byId.get(id); inorder(n.left); n.rank = rank++; inorder(n.right); };
  if (nodes.length) inorder(nodes[0].id);
  return { values, nodes, byId };
}

function builder(input) {
  const { values, nodes, byId } = parse(input);
  const trace = runTrace({ code: code.join("\n"), method: "maxDepth", args: [values], treeArgs: [0] });
  const rows = new Map(), calls = new Map(), returned = new Map();
  const steps = trace.events.map((record, index) => {
    const { line, locals: x } = record, active = x.root?.id ?? null;
    const descriptions = record.frames.map((frame, depth) => {
      const local = frame.locals, node = local.root?.id ?? null, parentLocal = record.frames[depth - 1]?.locals;
      const parent = parentLocal?.root?.id ?? null;
      const side = parent === null ? "root" : node === null ? Object.hasOwn(parentLocal, "left") ? "right" : "left" : byId.get(parent).left === node ? "left" : "right";
      return { id: node === null ? `null:${parent ?? "root"}:${side}` : `node:${node}`, node, value: local.root?.val ?? null, parent, side, depth,
        left: local.left ?? null, right: local.right ?? null };
    });
    const call = descriptions.at(-1);
    if (line === 3) {
      calls.set(call.id, { id: call.id, node: active, parent: call.parent, side: call.side, depth: call.depth, enterStep: index, returnStep: null, value: null });
      if (active !== null) rows.set(active, { id: active, value: x.root.val, left: null, right: null, height: null, path: [], chosen: null });
    }
    const row = rows.get(active);
    if (line === 5) row.left = x.left;
    if (line === 6) row.right = x.right;
    if (line === 7) {
      row.height = record.returned;
      row.chosen = x.left <= 0 && x.right <= 0 ? "none" : x.left >= x.right ? "left" : "right";
      row.path = [active, ...(row.chosen === "none" ? [] : returned.get(byId.get(active)[row.chosen]).path)];
      returned.set(active, { height: row.height, path: [...row.path] });
    }
    if (record.returning) Object.assign(calls.get(call.id), { returnStep: index, value: record.returned });
    const final = record.returning && record.frames.length === 1;
    const phase = line === 3 ? active === null ? bi("Nhánh trống", "Empty branch") : bi(`Vào maxDepth(${x.root.val})`, `Enter maxDepth(${x.root.val})`)
      : line === 4 ? bi("None → 0", "None → 0") : line === 5 ? bi(`Trái trả về ${x.left}`, `Left returns ${x.left}`)
        : line === 6 ? bi(`Phải trả về ${x.right}`, `Right returns ${x.right}`) : bi(`Trả độ sâu ${record.returned}`, `Return depth ${record.returned}`);
    const view = {
      nodes, active, callId: call.id, stack: descriptions, calls: copy([...calls.values()]), current: row ? copy(row) : null,
      emptyCall: active === null ? { parent: call.parent, side: call.side, returned: record.returning ? record.returned : null } : null,
      ledger: copy([...rows.values()]), completed: [...returned.keys()],
      path: line === 7 ? [...row.path] : [], returnedHeight: record.returning ? record.returned : null,
      source: { line, text: code[line - 1].trim(), timing: "after" }, phase, answer: final ? trace.answer : null,
      scope: record.scope, locals: x, outer: record.outer, frames: record.frames, branch: record.branch,
      returning: record.returning, returned: record.returned, trace: trace.trace,
    };
    return { arr: [], codeBlock: 1, codeLines: [line], final, title: bi(`L${line} · ${phase.vi}`, `L${line} · ${phase.en}`), note: bi("", ""),
      vars: [{ name: "root", value: x.root ?? "None", rawValue: x.root },
        ...["left", "right"].map(name => ({ name, value: x[name] ?? "—", rawValue: x[name] ?? null })),
        { name: "↩ return", value: record.returning ? record.returned : "—", rawValue: record.returning ? record.returned : null }], maxDepth104View: view };
  });
  return { original: values, answer: trace.answer, steps };
}

module.exports = { 104: {
  ...base, code, builder, debugMode: "line-by-line", allowEmptyInput: true,
  defaultInput: "3,9,20,null,null,15,7",
  statement: bi("Độ sâu là số nút trên một đường dài nhất từ gốc đến lá. Cây rỗng trả 0; mỗi nút trả 1 + max(độ sâu trái, độ sâu phải).", "Depth counts nodes on a longest root-to-leaf path. An empty tree returns 0; each node returns 1 + max(left depth, right depth)."),
  inputLabel: bi("Cây level-order · 0–31 nút · −1000…1000 · null cho nhánh trống", "Level-order tree · 0–31 nodes · −1000…1000 · null for missing children"),
  approach: [bi("Đợi kết quả trái và phải → chọn nhánh sâu hơn → cộng 1 cho nút hiện tại.", "Wait for both child results → choose a deeper arm → add 1 for the current node.")],
  codeLabel: bi("DFS tính độ sâu · từng dòng Python", "Depth DFS · Python line by line"),
  visualizationLimits: { maxNodes: 31, completeTrace: true },
  liveArgs: input => [{ __viz_type: "binary_tree", values: parse(input).values, tree_id: "root" }],
} };
