"use strict";

const base = require("./tree")[102];
const { runTrace } = require("./wasm-picture-trace");
const bi = (vi, en) => ({ vi, en });
// Preserve the frontier-list algorithm; give each guard and append its own line.
const code = base.code.join("\n")
  .replace("if not root: return []", "if not root:\n            return []")
  .replace("if n.left: nxt.append(n.left)", "if n.left:\n                    nxt.append(n.left)")
  .replace("if n.right: nxt.append(n.right)", "if n.right:\n                    nxt.append(n.right)").split("\n");
const copy = value => JSON.parse(JSON.stringify(value));
const ids = values => values === undefined ? null : values.map(node => node.id);

function parse(input) {
  let values = input;
  if (typeof values === "string") {
    const raw = values.trim();
    try { values = !raw ? [] : raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => {
      const text = s.trim(); return ["null", "None"].includes(text) ? null : text ? Number(text) : NaN;
    }); } catch { values = null; }
  }
  const error = () => new RangeError("#102: cây level-order gồm 0–31 nút, số nguyên −1000…1000, null cho nhánh trống / use 0–31 connected integer nodes, −1000…1000, with null for missing children.");
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
  const trace = runTrace({ code: code.join("\n"), method: "levelOrder", args: [values], treeArgs: [0] });
  const resultIds = []; let levelIds = null, current = null, round = 0, alias = null;
  const steps = trace.events.map(record => {
    const { line, locals: x } = record, queue = ids(x.queue), nxt = ids(x.nxt);
    let change = null, probe = null;
    if (line === 6 && record.branch) { round++; current = null; }
    if (line === 7) { levelIds = [...queue]; change = { kind: "collect", ids: [...levelIds] }; }
    if (line === 8) { resultIds.push([...levelIds]); change = { kind: "record", ids: [...levelIds], index: x.res.length - 1 }; }
    if (line === 9) { alias = false; change = { kind: "reset" }; }
    if (line === 10) current = record.branch ? x.n.id : null;
    if (line === 11 || line === 13 || line === 12 || line === 14) {
      const side = line <= 12 ? "left" : "right", child = byId.get(x.n.id)[side];
      probe = { parent: x.n.id, side, child, exists: child !== null, appended: line === 12 || line === 14 };
      if (probe.appended) change = { kind: "enqueue", parent: x.n.id, child, side, index: nxt.length - 1 };
    }
    if (line === 15) { alias = true; current = null; change = { kind: "advance", ids: [...queue] }; }
    const phase = line === 3 ? bi("Kiểm tra root", "Check root") : line === 4 ? bi("Cây rỗng → []", "Empty tree → []")
      : line === 5 ? bi("Tạo res và queue", "Initialize res and queue") : line === 6 ? record.branch ? bi(`Tầng ${round}`, `Level ${round}`) : bi("queue rỗng", "queue is empty")
        : line === 7 ? bi("queue → level", "queue → level") : line === 8 ? bi("level → res", "level → res")
          : line === 9 ? bi("Tạo nxt rỗng", "Create an empty nxt") : line === 10 ? record.branch ? bi(`n ← ${x.n.val}`, `n ← ${x.n.val}`) : bi("Đã duyệt hết queue", "Finished scanning queue")
            : line === 11 || line === 13 ? bi(`Kiểm tra con ${probe.side === "left" ? "trái" : "phải"}`, `Check the ${probe.side} child`)
              : line === 12 || line === 14 ? bi(`Thêm ${byId.get(probe.child).value} vào nxt`, `Append ${byId.get(probe.child).value} to nxt`)
                : line === 15 ? bi("queue ← nxt", "queue ← nxt") : bi("Trả các tầng", "Return all levels");
    const view = {
      nodes, queue, nxt, levelIds: levelIds ? [...levelIds] : null, resultIds: copy(resultIds),
      res: x.res ?? null, level: x.level ?? null, current, cursor: current === null ? null : queue.indexOf(current),
      round, alias, probe, change, recorded: resultIds.flat(),
      queueLevel: queue?.length ? byId.get(queue[0]).depth + 1 : null,
      levelNumber: levelIds?.length ? byId.get(levelIds[0]).depth + 1 : null,
      source: { line, text: code[line - 1].trim(), timing: "after" }, phase, answer: record.returning ? trace.answer : null,
      scope: record.scope, locals: x, outer: record.outer, frames: record.frames, branch: record.branch,
      returning: record.returning, returned: record.returned, trace: trace.trace,
    };
    return { arr: [], codeBlock: 1, codeLines: [line], final: record.returning, title: bi(`L${line} · ${phase.vi}`, `L${line} · ${phase.en}`), note: bi("", ""),
      vars: ["root", "res", "queue", "level", "nxt", "n"].map(name => ({ name, value: x[name] ?? (name === "root" ? "None" : "—"), rawValue: x[name] ?? null })), levelOrder102View: view };
  });
  return { original: values, answer: trace.answer, steps };
}

module.exports = { 102: {
  ...base, code, builder, debugMode: "line-by-line", allowEmptyInput: true,
  defaultInput: "3,9,20,null,null,15,7",
  statement: bi("Duyệt từng tầng từ trái sang phải. queue giữ tầng đang duyệt; nxt gom các con cho tầng kế tiếp.", "Visit each level from left to right. queue holds the current frontier; nxt collects children for the next level."),
  inputLabel: bi("Cây level-order · 0–31 nút · −1000…1000 · null cho nhánh trống", "Level-order tree · 0–31 nodes · −1000…1000 · null for missing children"),
  approach: [bi("queue → level → res. Gom con trái rồi con phải vào nxt. Cuối vòng lặp: queue = nxt.", "queue → level → res. Collect left then right children in nxt. At the end of the round: queue = nxt.")],
  codeLabel: bi("BFS hai danh sách · từng dòng Python", "BFS with two frontier lists · Python line by line"),
  visualizationLimits: { maxNodes: 31, completeTrace: true },
  liveArgs: input => [{ __viz_type: "binary_tree", values: parse(input).values, tree_id: "root" }],
} };
