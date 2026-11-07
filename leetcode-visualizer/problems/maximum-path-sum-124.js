"use strict";

const base = require("./tree")[124];
const { runTrace } = require("./wasm-picture-trace");
const bi = (vi, en) => ({ vi, en });
// Separate the base case onto two physical lines so its test and return each
// have their own native Python event. The original algorithm is unchanged.
const code = base.code.join("\n").replace("if not node: return 0", "if not node:\n                return 0").split("\n");
const copy = value => JSON.parse(JSON.stringify(value));

function parse(input) {
  let values = input;
  if (typeof values === "string") {
    const raw = values.trim();
    try { values = raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => {
      const text = s.trim(); return ["null", "None"].includes(text) ? null : text ? Number(text) : NaN;
    }); } catch { values = null; }
  }
  const error = () => new RangeError("#124: level-order gồm 1–31 nút, số nguyên −1000…1000, null cho nhánh trống / use 1–31 connected integer nodes, −1000…1000, with null for missing children.");
  if (!Array.isArray(values) || !values.length || values.length > 63 || values[0] === null
    || !Array.from(values).every(v => v === null || Number.isInteger(v) && Math.abs(v) <= 1000)) throw error();
  values = [...values];
  const nodes = [{ id: "0:0", value: values[0], left: null, right: null, parent: null, depth: 0 }];
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
  inorder(nodes[0].id);
  return { values, nodes, byId };
}

function builder(input) {
  const { values, nodes, byId } = parse(input);
  const trace = runTrace({ code: code.join("\n"), method: "maxPathSum", args: [values], treeArgs: [0], stateClasses: ["Solution"] });
  const rows = new Map(), returns = new Map();
  let bestPath = [], bestPivot = null, previousBest = "−∞";
  const steps = trace.events.map(record => {
    const { line, locals: x } = record, helper = record.scope === "gain", active = helper ? x.node?.id ?? null : null;
    const node = byId.get(active), bestValue = x.self.max_sum, before = previousBest;
    const stack = record.frames.filter(f => f.name === "gain").map(f => ({
      node: f.locals.node?.id ?? null, value: f.locals.node?.val ?? null,
      left: f.locals.left_gain ?? null, right: f.locals.right_gain ?? null,
    }));
    const parentFrame = stack.at(-2), parent = helper && active === null ? byId.get(parentFrame?.node) : null;
    const emptyCall = parent ? { parent: parent.id, side: parentFrame.left === null ? "left" : "right", returned: record.returning ? record.returned : null } : null;
    if (line === 5 && node) rows.set(active, { id: active, value: node.value, leftRaw: null, left: null, rightRaw: null, right: null, candidate: null, candidatePath: [], gain: null, path: [], chosen: null });
    const row = rows.get(active); let clamp = null, improved = false, returnedGain = null;
    if (line === 7 || line === 8) {
      const side = line === 7 ? "left" : "right", child = node[side], result = returns.get(child);
      row[side] = x[`${side}_gain`]; row[`${side}Raw`] = result?.gain ?? 0;
      clamp = { side, child, raw: row[`${side}Raw`], value: row[side], discarded: row[`${side}Raw`] < 0 };
    }
    if (line === 9) {
      const leftPath = row.left > 0 ? returns.get(node.left).path : [], rightPath = row.right > 0 ? returns.get(node.right).path : [];
      row.candidate = node.value + x.left_gain + x.right_gain;
      row.candidatePath = [...leftPath].reverse().concat(active, rightPath);
      improved = before === "−∞" || row.candidate > before;
      if (improved) { bestPath = [...row.candidatePath]; bestPivot = active; }
    }
    if (line === 10 && record.returning) {
      row.chosen = x.left_gain <= 0 && x.right_gain <= 0 ? "none" : x.left_gain >= x.right_gain ? "left" : "right";
      row.gain = record.returned;
      row.path = [active, ...(row.chosen === "none" ? [] : returns.get(node[row.chosen]).path)];
      returns.set(active, { gain: row.gain, path: [...row.path] });
      returnedGain = { value: row.gain, path: [...row.path], chosen: row.chosen };
    }
    const final = record.scope === "maxPathSum" && record.returning;
    const scene = line === 9 ? { kind: "through", path: [...row.candidatePath] }
      : line === 10 ? { kind: "return", path: [...row.path] } : { kind: "best", path: [...bestPath] };
    const phase = line === 3 ? bi("Khởi tạo best", "Initialize best") : line === 4 ? bi("Định nghĩa gain", "Define gain")
      : line === 5 ? node ? bi(`Thăm nút ${node.value}`, `Visit node ${node.value}`) : bi("Nhánh trống", "Empty branch")
        : line === 6 ? bi("None → 0", "None → 0") : line === 7 || line === 8 ? bi(`${line === 7 ? "Trái" : "Phải"}: ${clamp.raw} → ${clamp.value}`, `${line === 7 ? "Left" : "Right"}: ${clamp.raw} → ${clamp.value}`)
          : line === 9 ? bi(improved ? "Best mới" : "Giữ best", improved ? "New best" : "Keep best")
            : line === 10 ? bi(`Trả một nhánh: ${record.returned}`, `Return one arm: ${record.returned}`)
              : line === 11 ? bi("Đã duyệt cây", "Tree processed") : bi("Trả tổng lớn nhất", "Return the maximum sum");
    const view = {
      version: 2, nodes, active, stack, emptyCall, clamp, current: row ? copy(row) : null, scene,
      best: { value: bestValue, before, improved, pivot: bestPivot, path: [...bestPath] },
      returnedGain, ledger: copy([...rows.values()]), rootReturn: returns.get("0:0")?.gain ?? null,
      source: { line, text: code[line - 1].trim(), timing: "after" }, phase, answer: final ? trace.answer : null,
      scope: record.scope, locals: x, outer: record.outer, frames: record.frames, branch: record.branch,
      returning: record.returning, returned: record.returned, trace: trace.trace,
    };
    previousBest = bestValue;
    return { arr: [], codeBlock: 1, codeLines: [line], final, title: bi(`L${line} · ${phase.vi}`, `L${line} · ${phase.en}`), note: bi("", ""),
      vars: [{ name: helper ? "node" : "root", value: helper ? x.node ?? "None" : x.root, rawValue: helper ? x.node : x.root },
        ...["left_gain", "right_gain"].map(name => ({ name, value: x[name] ?? "—", rawValue: x[name] ?? null })),
        { name: "self.max_sum", value: bestValue, rawValue: bestValue }], maxPathSum124View: view };
  });
  return { original: values, answer: trace.answer, steps };
}

module.exports = { 124: {
  ...base, code, builder, debugMode: "line-by-line",
  titleVi: bi("Tổng đường đi lớn nhất trong cây", "Maximum path sum in a binary tree"),
  statement: bi("Chọn một đường liên tiếp, không lặp nút, có tổng lớn nhất. Đường phải chứa ít nhất một nút và có thể không đi qua gốc.", "Find a maximum-sum path of adjacent, unrepeated nodes. A path contains at least one node and need not pass through the root."),
  inputLabel: bi("Cây level-order · 1–31 nút · −1000…1000 · null cho nhánh trống", "Level-order tree · 1–31 nodes · −1000…1000 · null for missing children"),
  approach: [bi("Qua nút: node + trái + phải. Trả lên cha: node + max(trái, phải). Nhánh âm → 0.", "Through a node: node + left + right. Return to parent: node + max(left, right). Negative arms → 0.")],
  codeLabel: bi("DFS hậu tự · từng dòng Python", "Postorder DFS · Python line by line"),
  visualizationLimits: { maxNodes: 31, completeTrace: true },
  liveArgs: input => [{ __viz_type: "binary_tree", values: parse(input).values, tree_id: "root" }],
} };
