"use strict";

const base = require("./tree")[144];
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
  const error = () => new RangeError("#144: cây level-order gồm 0–31 nút, số nguyên −1000…1000, null cho nhánh trống / use 0–31 connected integer nodes, −1000…1000, with null for missing children.");
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
  const trace = runTrace({ code: code.join("\n"), method: "preorderTraversal", args: [values], treeArgs: [0] });
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
    if (helper && line === 7) {
      row.visited = true; row.order = visited.length; visited.push(active);
      append = { id: active, value: x.node.val, index: x.res.length - 1 };
    }
    if (helper && line === 8) row.leftDone = true;
    if (helper && line === 9) { row.rightDone = true; row.returned = record.returning; }
    if (helper && record.returning) calls.get(currentCall.id).returnStep = index;
    const stack = descriptions.map(call => {
      const state = rows.get(call.node);
      return { ...calls.get(call.id), phase: call.node === null ? "empty" : state.returned ? "return" : state.leftDone ? "right" : state.visited ? "left" : "check" };
    });
    const final = record.scope === "preorderTraversal" && record.returning;
    const emptyCall = helper && active === null ? { ...currentCall, returned: record.returning } : null;
    const event = line === 3 ? "init" : line === 4 ? "define" : line === 5 ? active === null ? "empty" : "enter"
      : line === 6 ? "empty-return" : line === 7 ? "append" : line === 8 ? "left-done" : line === 9 ? "return" : line === 10 ? "root-done" : "result";
    const phase = line === 3 ? bi("res = []", "res = []") : line === 4 ? bi("Gốc → Trái → Phải", "Root → Left → Right")
      : line === 5 ? active === null ? bi("Nhánh trống", "Empty branch") : bi(`Vào dfs(${x.node.val})`, `Enter dfs(${x.node.val})`)
        : line === 6 ? bi("None → quay về", "None → return") : line === 7 ? bi(`Thêm ${x.node.val} vào res`, `Append ${x.node.val} to res`)
          : line === 8 ? bi("Xong trái · tiếp đến phải", "Left done · right next") : line === 9 ? bi("Xong hai nhánh · quay về", "Both arms done · return")
            : line === 10 ? bi("Đã duyệt cây", "Tree processed") : bi("Trả dãy preorder", "Return the preorder list");
    const view = {
      nodes, active, callId: currentCall?.id ?? null, emptyCall, stack, calls: copy([...calls.values()]),
      states: copy([...rows.values()]), visited: [...visited], completed: [...rows.values()].filter(r => r.returned).map(r => r.id),
      res: [...x.res], output: visited.map((id, i) => ({ id, value: x.res[i], index: i })), append, event, phase,
      source: { line, text: code[line - 1].trim(), timing: "after" }, answer: final ? trace.answer : null,
      scope: record.scope, locals: x, outer: record.outer, frames: record.frames, branch: record.branch,
      returning: record.returning, returned: record.returned, trace: trace.trace,
    };
    return { arr: [], codeBlock: 1, codeLines: [line], final, title: bi(`L${line} · ${phase.vi}`, `L${line} · ${phase.en}`), note: bi("", ""),
      vars: [{ name: helper ? "node" : "root", value: helper ? x.node ?? "None" : x.root ?? "None", rawValue: helper ? x.node : x.root },
        { name: "res", value: x.res, rawValue: x.res }], preorder144View: view };
  });
  return { original: values, answer: trace.answer, steps };
}

module.exports = { 144: {
  ...base, code, builder, debugMode: "line-by-line", allowEmptyInput: true,
  inputLabel: bi("Cây level-order · 0–31 nút · −1000…1000 · null cho nhánh trống", "Level-order tree · 0–31 nodes · −1000…1000 · null for missing children"),
  statement: bi("Duyệt cây theo thứ tự Gốc → Trái → Phải. Mỗi nút được thêm vào res ngay khi thăm, trước hai cây con.", "Traverse Root → Left → Right. Append each node to res when visited, before either subtree."),
  approach: [bi("Thêm gốc vào res → dfs(trái) → dfs(phải). Gặp None thì quay về.", "Append the root to res → dfs(left) → dfs(right). Return on None.")],
  complexity: { time: "O(n)", space: "O(h)", note: bi("Stack đệ quy O(h); dãy kết quả O(n).", "Recursion stack O(h); output list O(n).") },
  codeLabel: bi("DFS tiền thứ tự · từng dòng Python", "Preorder DFS · Python line by line"),
  visualizationLimits: { maxNodes: 31, completeTrace: true },
  liveArgs: input => [{ __viz_type: "binary_tree", values: parse(input).values, tree_id: "root" }],
} };
