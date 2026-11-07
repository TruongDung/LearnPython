"use strict";

const base = require("./tree-bfs")[107];
const { runTrace } = require("./wasm-picture-trace");
const bi = (vi, en) => ({ vi, en });
const code = ["from collections import deque", "", ...base.code].join("\n")
  .replace("if not root: return []", "if not root:\n            return []")
  .replace("if node.left: queue.append(node.left)", "if node.left:\n                    queue.append(node.left)")
  .replace("if node.right: queue.append(node.right)", "if node.right:\n                    queue.append(node.right)").split("\n");
const copy = value => JSON.parse(JSON.stringify(value));

function parse(input) {
  let values = input;
  if (typeof values === "string") {
    const raw = values.trim();
    try { values = !raw ? [] : raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => {
      const text = s.trim(); return ["null", "None"].includes(text) ? null : text ? Number(text) : NaN;
    }); } catch { values = null; }
  }
  const error = () => new RangeError("#107: cây level-order gồm 0–31 nút, số nguyên −1000…1000, null cho nhánh trống / use 0–31 connected integer nodes, −1000…1000, with null for missing children.");
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
  const trace = runTrace({ code: code.join("\n"), method: "levelOrderBottom", args: [values], treeArgs: [0] });
  const resultIds = []; let round = 0, roundIds = [], popped = [], levelIds = null, levelNumber = null, limit = null, current = null;
  const steps = trace.events.map(record => {
    const { line, locals: x } = record, queue = x.queue?.map(n => n.id) ?? null;
    let change = null, probe = null;
    if (line === 8 && record.branch) { round++; roundIds = [...queue]; popped = []; limit = null; current = null; }
    if (line === 9) { levelIds = []; levelNumber = round; change = { kind: "reset" }; }
    if (line === 10) {
      current = null;
      if (record.branch && limit === null) limit = queue.length;
    }
    if (line === 11) { current = x.node.id; popped.push(current); change = { kind: "pop", node: current }; }
    if (line === 12) { levelIds.push(current); change = { kind: "collect", node: current, index: x.level.length - 1 }; }
    if ([13,14,15,16].includes(line)) {
      const side = line <= 14 ? "left" : "right", child = byId.get(x.node.id)[side];
      probe = { parent: x.node.id, side, child, exists: child !== null, appended: line === 14 || line === 16 };
      if (probe.appended) change = { kind: "enqueue", parent: x.node.id, child, side, index: queue.length - 1 };
    }
    if (line === 17) { resultIds.push([...levelIds]); change = { kind: "record", index: x.result.length - 1 }; }
    const reversed = line === 18 && record.returning;
    const answerIds = reversed ? [...resultIds].reverse().map(row => [...row]) : record.returning ? [] : null;
    const phase = line === 5 ? bi("Kiểm tra root", "Check root") : line === 6 ? bi("Cây rỗng → []", "Empty tree → []")
      : line === 7 ? bi("Tạo queue và result", "Initialize queue and result") : line === 8 ? record.branch ? bi(`Tầng ${round}`, `Level ${round}`) : bi("queue rỗng", "queue is empty")
        : line === 9 ? bi("level = []", "level = []") : line === 10 ? record.branch ? bi(`Lượt ${x._ + 1}/${limit}`, `Iteration ${x._ + 1}/${limit}`) : bi("Đủ số nút của tầng", "Level boundary reached")
          : line === 11 ? bi(`Lấy ${x.node.val} khỏi queue`, `Pop ${x.node.val} from queue`) : line === 12 ? bi(`Thêm ${x.node.val} vào level`, `Append ${x.node.val} to level`)
            : line === 13 || line === 15 ? bi(`Kiểm tra con ${probe.side === "left" ? "trái" : "phải"}`, `Check the ${probe.side} child`)
              : line === 14 || line === 16 ? bi(`Đưa ${byId.get(probe.child).value} vào queue`, `Enqueue ${byId.get(probe.child).value}`)
                : line === 17 ? bi(`Ghi tầng ${round}`, `Record level ${round}`) : bi("Đảo thứ tự các tầng", "Reverse the level order");
    const view = {
      nodes, queue, queueRoles: queue?.map(id => roundIds.length ? roundIds.includes(id) ? "current" : "next" : "current") ?? null,
      round, roundIds: [...roundIds], limit, popped: [...popped], remaining: limit === null ? null : limit - popped.length,
      current, level: x.level ?? null, levelIds: levelIds ? [...levelIds] : null, levelNumber,
      result: x.result ?? null, resultIds: copy(resultIds), recorded: resultIds.flat(), probe, change, reversed, answerIds,
      source: { line, text: code[line - 1].trim(), timing: "after" }, phase, answer: record.returning ? trace.answer : null,
      scope: record.scope, locals: x, outer: record.outer, frames: record.frames, branch: record.branch,
      returning: record.returning, returned: record.returned, trace: trace.trace,
    };
    return { arr: [], codeBlock: 1, codeLines: [line], final: record.returning, title: bi(`L${line} · ${phase.vi}`, `L${line} · ${phase.en}`), note: bi("", ""),
      vars: ["root", "queue", "result", "level", "_", "node"].map(name => ({ name, value: x[name] ?? (name === "root" ? "None" : "—"), rawValue: x[name] ?? null })), levelOrder107View: view };
  });
  // Preserve the existing display/API answer format; replay keeps Python's list.
  return { original: values, answer: JSON.stringify(trace.answer), steps };
}

module.exports = { 107: {
  ...base, code, builder, debugMode: "line-by-line", allowEmptyInput: true,
  statement: bi("BFS đọc từng tầng từ trên xuống. Trả về thứ tự tầng từ dưới lên; trong mỗi tầng vẫn giữ trái → phải.", "BFS reads levels from top to bottom. Return the levels from bottom to top, preserving left-to-right order within every row."),
  inputLabel: bi("Cây level-order · 0–31 nút · −1000…1000 · null cho nhánh trống", "Level-order tree · 0–31 nodes · −1000…1000 · null for missing children"),
  approach: [bi("Khóa số lượt lấy đầu queue cho mỗi tầng. Gom level vào result, rồi trả result[::-1].", "Lock the number of queue pops per level. Collect level in result, then return result[::-1].")],
  codeLabel: bi("Deque + đảo tầng · từng dòng Python", "Deque + reverse levels · Python line by line"),
  visualizationLimits: { maxNodes: 31, completeTrace: true },
  liveArgs: input => [{ __viz_type: "binary_tree", values: parse(input).values, tree_id: "root" }],
} };
