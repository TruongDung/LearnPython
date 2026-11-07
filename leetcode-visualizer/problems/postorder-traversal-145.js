"use strict";

const base = require("./tree")[145];
const { runTrace } = require("./wasm-picture-trace");
const bi = (vi, en) => ({ vi, en });
const code = base.code.join("\n").replace("if not node: return", "if not node:\n                return").split("\n");
const copy = value => JSON.parse(JSON.stringify(value));

function parse(input) {
  let values = input;
  if (typeof values === "string") {
    const raw = values.trim();
    try { values = !raw ? [] : raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => {
      const text = s.trim(); return ["null", "None"].includes(text) ? null : text ? Number(text) : NaN;
    }); } catch { values = null; }
  }
  const error = () => new RangeError("#145: cây level-order gồm 0–31 nút, số nguyên −1000…1000, null cho nhánh trống / use 0–31 connected integer nodes, −1000…1000, with null for missing children.");
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
  const trace = runTrace({ code: code.join("\n"), method: "postorderTraversal", args: [values], treeArgs: [0] });
  const rows = new Map(), calls = new Map(), visited = [];
  const steps = trace.events.map((record, index) => {
    const { line, locals: x } = record, helper = record.scope === "dfs", active = helper ? x.node?.id ?? null : null;
    const frames = record.frames.filter(f => f.name === "dfs");
    const descriptions = frames.map((f, depth) => {
      const node = f.locals.node?.id ?? null, parent = frames[depth - 1]?.locals.node?.id ?? null;
      const side = parent === null ? "root" : node === null ? rows.get(parent).leftDone ? "right" : "left" : byId.get(parent).left === node ? "left" : "right";
      return { id: node === null ? `null:${parent ?? "root"}:${side}` : `node:${node}`, node, value: f.locals.node?.val ?? null, parent, side, depth };
    });
    const currentCall = descriptions.at(-1) ?? null;
    if (helper && line === 5) {
      calls.set(currentCall.id, { ...currentCall, enterStep: index, returnStep: null });
      if (active !== null) rows.set(active, { id: active, order: null, visited: false, leftDone: false, rightDone: false, returned: false });
    }
    const row = rows.get(active); let append = null;
    if (helper && line === 7) row.leftDone = true;
    if (helper && line === 8) row.rightDone = true;
    if (helper && line === 9) {
      row.visited = true; row.order = visited.length; visited.push(active);
      append = { id: active, value: x.node.val, index: x.res.length - 1 };
      // The final append also completes this call: Python emits one completed
      // statement with an implicit None return, not an invented extra line.
      row.returned = record.returning;
    }
    if (helper && record.returning) calls.get(currentCall.id).returnStep = index;
    const stack = descriptions.map(call => {
      const state = rows.get(call.node);
      return { ...calls.get(call.id), phase: call.node === null ? "empty" : state.returned ? "return" : state.rightDone ? "visit" : state.leftDone ? "right" : "left" };
    });
    const final = record.scope === "postorderTraversal" && record.returning;
    const emptyCall = helper && active === null ? { ...currentCall, returned: record.returning } : null;
    const event = line === 3 ? "init" : line === 4 ? "define" : line === 5 ? active === null ? "empty" : "enter"
      : line === 6 ? "empty-return" : line === 7 ? "left-done" : line === 8 ? "right-done" : line === 9 ? "append-return" : line === 10 ? "root-done" : "result";
    const phase = line === 3 ? bi("res = []", "res = []") : line === 4 ? bi("Trái → Phải → Gốc", "Left → Right → Root")
      : line === 5 ? active === null ? bi("Nhánh trống", "Empty branch") : bi(`Vào dfs(${x.node.val})`, `Enter dfs(${x.node.val})`)
        : line === 6 ? bi("None → quay về", "None → return") : line === 7 ? bi("Xong trái · tiếp đến phải", "Left done · right next")
          : line === 8 ? bi("Xong hai nhánh · đến lượt gốc", "Both arms done · visit the root next") : line === 9 ? bi(`Thêm ${x.node.val} vào res`, `Append ${x.node.val} to res`)
            : line === 10 ? bi("Đã duyệt cây", "Tree processed") : bi("Trả dãy postorder", "Return the postorder list");
    const view = {
      id: 145, nodes, active, callId: currentCall?.id ?? null, emptyCall, stack, calls: copy([...calls.values()]),
      states: copy([...rows.values()]), visited: [...visited], completed: [...rows.values()].filter(r => r.returned).map(r => r.id),
      res: [...x.res], output: visited.map((id, i) => ({ id, value: x.res[i], index: i })), append, event, phase,
      source: { line, text: code[line - 1].trim(), timing: "after" }, answer: final ? trace.answer : null,
      scope: record.scope, locals: x, outer: record.outer, frames: record.frames, branch: record.branch,
      returning: record.returning, returned: record.returned, trace: trace.trace,
    };
    return { arr: [], codeBlock: 1, codeLines: [line], final, title: bi(`L${line} · ${phase.vi}`, `L${line} · ${phase.en}`), note: bi("", ""),
      vars: [{ name: helper ? "node" : "root", value: helper ? x.node ?? "None" : x.root ?? "None", rawValue: helper ? x.node : x.root },
        { name: "res", value: x.res, rawValue: x.res }], postorder145View: view };
  });
  return { original: values, answer: trace.answer, steps };
}

module.exports = { 145: {
  ...base, code, builder, debugMode: "line-by-line", allowEmptyInput: true,
  inputLabel: bi("Cây level-order · 0–31 nút · −1000…1000 · null cho nhánh trống", "Level-order tree · 0–31 nodes · −1000…1000 · null for missing children"),
  statement: bi("Duyệt cây theo thứ tự Trái → Phải → Gốc. Chỉ thêm nút vào res sau khi duyệt xong cả hai cây con.", "Traverse Left → Right → Root. Append a node only after both subtrees are processed."),
  approach: [bi("dfs(trái) → dfs(phải) → thêm gốc vào res. Gặp None thì quay về.", "dfs(left) → dfs(right) → append the root to res. Return on None.")],
  complexity: { time: "O(n)", space: "O(h)", note: bi("Stack đệ quy O(h); dãy kết quả O(n).", "Recursion stack O(h); output list O(n).") },
  codeLabel: bi("DFS hậu thứ tự · từng dòng Python", "Postorder DFS · Python line by line"),
  visualizationLimits: { maxNodes: 31, completeTrace: true },
  liveArgs: input => [{ __viz_type: "binary_tree", values: parse(input).values, tree_id: "root" }],
} };
