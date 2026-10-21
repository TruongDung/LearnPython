"use strict";
const base = require("./tree")[114];
const bi = (vi, en) => ({ vi, en });
const code = [
  "class Solution:",
  "    def flatten(self, root):",
  "        cur = root",
  "        while cur:",
  "            if cur.left:",
  "                pred = cur.left",
  "                while pred.right:",
  "                    pred = pred.right",
  "                pred.right = cur.right",
  "                cur.right = cur.left",
  "                cur.left = None",
  "            cur = cur.right",
  "        return",
];
function parse(input) {
  let values;
  const invalid = () => new Error("root: nhập level-order như 1,2,5,3,4,null,6 hoặc []. Tối đa 2000 node, giá trị -100…100. / Use level-order with null for empty children.");
  try {
    if (Array.isArray(input)) values = [...input];
    else if (typeof input === "string") {
      const text = input.trim();
      if (text === "" || text === "[]") values = [];
      else if (text.startsWith("[")) values = JSON.parse(text);
      else values = text.split(",").map(item => /^(null|none|#)$/i.test(item.trim()) ? null : item.trim() === "" ? NaN : Number(item));
    } else throw invalid();
  } catch { throw invalid(); }
  if (!Array.isArray(values) || values.length > 4001 || !values.every(value => value === null || Number.isInteger(value) && value >= -100 && value <= 100)) throw invalid();
  let slots = values.length ? 1 : 0, count = 0;
  for (const value of values) {
    if (!slots) { if (value !== null) throw invalid(); continue; }
    slots--;
    if (value !== null) { slots += 2; count++; }
  }
  if (count > 2000) throw invalid();
  while (values.at(-1) === null) values.pop();
  return values;
}
function makeTree(values) {
  const nodes = [];
  const add = value => { const node = { id: nodes.length, value, left: null, right: null }; nodes.push(node); return node.id; };
  if (!values.length) return nodes;
  add(values[0]);
  let index = 1;
  for (let head = 0; head < nodes.length && index < values.length; head++) {
    for (const side of ["left", "right"]) {
      if (index < values.length && values[index] !== null) nodes[head][side] = add(values[index]);
      index++;
    }
  }
  return nodes;
}
function builder(input) {
  const values = parse(input), nodes = makeTree(values), original = nodes.map(node => ({ ...node }));
  const root = nodes.length ? 0 : null, pointers = { root }, steps = [], completed = [];
  const detailed = nodes.length <= 18;
  let round = 0, splice = null;
  const label = id => id === null ? "None" : `#${id + 1} (${nodes[id].value})`;
  function encode(id) {
    if (id === null) return null;
    const node = nodes[id];
    return { val: node.value, left: encode(node.left), right: encode(node.right) };
  }
  function rightChain() {
    const result = [];
    for (let id = root; id !== null; id = nodes[id].right) result.push(id);
    return result;
  }
  function emit(line, event, title, options = {}) {
    if (!detailed) return;
    steps.push({ title: bi(`Dòng ${line} · ${title.vi}`, `Line ${line} · ${title.en}`), codeLines: [line], codeBlock: 1,
      final: event === "return", arr: [], highlight: [], mark: [], note: bi("", ""),
      vars: [{ name: "self", value: "Solution", rawValue: {} }, ...Object.entries(pointers).map(([name, id]) => ({ name, value: label(id), rawValue: encode(id) }))],
      flatten114View: { mode: "trace", line, source: code[line - 1].trim(), event, round, total: nodes.length,
        nodes: nodes.map(node => ({ ...node })), original: original.map(node => ({ ...node })), pointers: { ...pointers },
        completed: [...completed], chain: rightChain(), splice: splice && { ...splice }, change: options.change || null, check: options.check ?? null }
    });
  }
  function connect(from, side, to, line) {
    const before = nodes[from][side]; nodes[from][side] = to;
    emit(line, "rewire", bi(`${label(from)}.${side} → ${label(to)}`, `${label(from)}.${side} → ${label(to)}`), { change: { from, side, before, after: to } });
  }
  pointers.cur = root;
  emit(3, "init", bi("cur → root", "cur → root"));
  while (true) {
    const active = pointers.cur !== null;
    if (active) round++;
    emit(4, "while", bi(active ? "Xử lý cur" : "cur = None → dừng", active ? "Process cur" : "cur = None → stop"), { check: active });
    if (!active) break;
    const cur = nodes[pointers.cur], hasLeft = cur.left !== null;
    emit(5, "left-check", bi("Có cây trái?", "Left subtree?"), { check: hasLeft });
    if (hasLeft) {
      pointers.pred = cur.left;
      splice = { cur: cur.id, left: cur.left, oldRight: cur.right, pred: pointers.pred };
      emit(6, "pred", bi("pred → cây trái", "pred → left subtree"));
      while (true) {
        const check = nodes[pointers.pred].right !== null;
        emit(7, "pred-check", bi(check ? "pred còn nhánh phải →" : "Đã tới node phải nhất", check ? "pred has a right child →" : "Reached the rightmost node"), { check });
        if (!check) break;
        pointers.pred = nodes[pointers.pred].right; splice.pred = pointers.pred;
        emit(8, "move-pred", bi("pred → right", "pred → right"));
      }
      connect(pointers.pred, "right", cur.right, 9);
      connect(cur.id, "right", cur.left, 10);
      connect(cur.id, "left", null, 11);
    }
    completed.push(cur.id); pointers.cur = cur.right; splice = null;
    emit(12, "advance", bi("Xong node · cur → right", "Node done · cur → right"));
  }
  const order = rightChain(), answer = order.map(id => nodes[id].value);
  emit(13, "return", bi("root đã đổi · return None", "root mutated · return None"));
  if (!detailed) {
    const visible = order.slice(0, 12), visibleSet = new Set(visible);
    steps.push({ title: bi("Cây đã làm phẳng", "Tree flattened"), codeLines: [], codeBlock: 1, final: true,
      arr: [], highlight: [], mark: [], vars: [], note: bi("", ""),
      flatten114View: { mode: "summary", line: null, source: "", event: "return", round, total: nodes.length,
        nodes: visible.map(id => ({ ...nodes[id] })), original: [], pointers: {}, completed: [...visible], chain: visible,
        clipped: order.length > visibleSet.size, splice: null, change: null, check: null }
    });
  }
  return { original: values, answer, steps };
}
module.exports = { 114: { ...base, code, builder, debugMode: "line-by-line", allowEmptyInput: true,
  inputLabel: bi("root · level-order · null = node rỗng", "root · level-order · null = empty child"),
  statement: bi("Gốc → Trái → Phải. Giữ nguyên node, nối bằng right; mọi left = None.", "Root → Left → Right. Keep the same nodes, connect with right; every left = None."),
  approach: [bi("① pred.right → phải cũ  ② cur.right → trái  ③ cur.left → None", "① pred.right → old right  ② cur.right → left  ③ cur.left → None"),
    bi("Sửa root tại chỗ; hàm trả về None.", "Mutate root in-place; the function returns None.")],
  complexity: { time: "O(n)", space: "O(1)", note: bi("Debug từng dòng với ≤18 node. Cây lớn vẫn xử lý đủ; hình cuối xem trước 12 node.", "Line debug for ≤18 nodes. Larger trees are fully processed; the final picture previews 12 nodes.") },
  liveArgs: input => [{ __viz_type: "binary_tree", values: parse(input), tree_id: "root" }]
} };
