"use strict";
const bi = (vi, en) => ({ vi, en });
const code = [
  "class Solution:",
  "    def swapPairs(self, head):",
  "        dummy = ListNode(0, head)",
  "        prev = dummy",
  "        while prev.next and prev.next.next:",
  "            first = prev.next",
  "            second = first.next",
  "            first.next = second.next",
  "            second.next = first",
  "            prev.next = second",
  "            prev = first",
  "        return dummy.next",
];
function parse(input) {
  let values;
  try {
    if (Array.isArray(input)) values = [...input];
    else {
      const text = String(input).trim();
      values = text === "" ? [] : text.startsWith("[") ? JSON.parse(text) : text.split(",").map(item => item.trim() === "" ? NaN : Number(item.trim()));
    }
  } catch (_) { throw new Error("head: nhập 1,2,3,4 hoặc [] cho danh sách rỗng."); }
  if (!Array.isArray(values) || values.length > 100 || !values.every(value => Number.isInteger(value) && value >= 0 && value <= 100)) throw new Error("head: tối đa 100 node, giá trị nguyên từ 0 đến 100.");
  return values;
}
function builder(input) {
  const values = parse(input), detailed = values.length <= 12;
  const nodes = values.map((value, id) => ({ id, value, next: id + 1 < values.length ? id + 1 : null }));
  const byId = new Map(nodes.map(node => [node.id, node]));
  const pointers = { head: values.length ? 0 : null }, steps = [], completed = new Set();
  let pair = [], round = 0;
  const nodeName = id => id === null ? "None" : id === -1 ? "D" : `#${id + 1}`;
  function order(start) {
    const ids = [], seen = new Set();
    for (let id = start; id !== null; id = byId.get(id).next) {
      if (seen.has(id)) throw new Error("Unexpected pointer cycle.");
      seen.add(id); ids.push(id);
    }
    return ids;
  }
  function encode(id) {
    if (id === null) return null;
    const node = byId.get(id);
    return { val: node.value, next: encode(node.next) };
  }
  function emit(line, event, title, options = {}) {
    if (!detailed) return;
    const reachable = order(byId.get(-1).next);
    steps.push({ title: bi(`Dòng ${line} · ${title.vi}`, `Line ${line} · ${title.en}`), codeLines: [line], final: event === "return",
      arr: [], highlight: [], mark: [], note: bi("", ""),
      vars: [{ name: "self", value: "Solution", rawValue: {} }, ...Object.entries(pointers).map(([name, id]) => ({ name, value: nodeName(id) + (id !== null && id !== -1 ? ` (${byId.get(id).value})` : ""), rawValue: encode(id) }))],
      swap24View: { mode: "trace", line, source: code[line - 1].trim(), event, round, pair: [...pair], pointers: { ...pointers },
        nodes: [...byId.values()].map(node => ({ ...node })), order: reachable, original: [...values], completed: [...completed],
        detached: nodes.filter(node => !reachable.includes(node.id)).map(node => node.id), change: options.change || null, condition: options.condition ?? null }
    });
  }
  function connect(from, to, line) {
    const before = byId.get(from).next;
    byId.get(from).next = to;
    emit(line, "rewire", bi(`${nodeName(from)}.next: ${nodeName(before)} → ${nodeName(to)}`, `${nodeName(from)}.next: ${nodeName(before)} → ${nodeName(to)}`), { change: { from, before, after: to } });
  }
  byId.set(-1, { id: -1, value: 0, next: pointers.head }); pointers.dummy = -1;
  emit(3, "dummy", bi("D → head", "D → head"));
  pointers.prev = -1;
  emit(4, "prev", bi("prev → D", "prev → D"));
  while (true) {
    const first = byId.get(pointers.prev).next, second = first === null ? null : byId.get(first).next;
    const canSwap = first !== null && second !== null;
    pair = canSwap ? [first, second] : [];
    if (canSwap) round++;
    emit(5, "check", bi(canSwap ? `Cặp ${round}: ${nodeName(first)}, ${nodeName(second)}` : "Không còn đủ 2 node", canSwap ? `Pair ${round}: ${nodeName(first)}, ${nodeName(second)}` : "Fewer than 2 nodes remain"), { condition: canSwap });
    if (!canSwap) break;
    pointers.first = first;
    emit(6, "first", bi(`first → ${nodeName(first)}`, `first → ${nodeName(first)}`));
    pointers.second = second;
    emit(7, "second", bi(`second → ${nodeName(second)}`, `second → ${nodeName(second)}`));
    connect(first, byId.get(second).next, 8);
    connect(second, first, 9);
    connect(pointers.prev, second, 10);
    completed.add(first); completed.add(second);
    pointers.prev = first;
    emit(11, "advance", bi(`prev → ${nodeName(first)} · xong cặp ${round}`, `prev → ${nodeName(first)} · pair ${round} done`));
  }
  const resultIds = order(byId.get(-1).next), answer = resultIds.map(id => byId.get(id).value);
  emit(12, "return", bi(`Trả về ${nodeName(byId.get(-1).next)}`, `Return ${nodeName(byId.get(-1).next)}`));
  if (!detailed) steps.push({ title: bi("Đã hoán đổi từng cặp node", "Adjacent node pairs swapped"), codeLines: [], final: true, vars: [], note: bi("", ""), arr: [], highlight: [], mark: [],
    swap24View: { mode: "summary", line: null, source: "", event: "return", round, pair: [], pointers: {}, nodes: [...byId.values()].map(node => ({ ...node })),
      order: resultIds, original: [...values], completed: [...completed], detached: [], change: null, condition: null }
  });
  return { original: values, answer, steps };
}
module.exports = { 24: {
  id: 24, difficulty: "medium", slug: "swap-nodes-in-pairs", category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
  title: bi("Swap Nodes in Pairs", "Swap Nodes in Pairs"), titleVi: bi("Đổi chỗ từng cặp node", "Swap adjacent node pairs"),
  statement: bi("Đổi mũi tên next, giữ nguyên giá trị node. Node lẻ cuối cùng giữ nguyên.", "Rewire next pointers while keeping node values unchanged. Leave an odd final node in place."),
  defaultInput: "1,2,3,4", inputKind: "string", allowEmptyInput: true, inputLabel: bi("head · các giá trị cách nhau bằng dấu phẩy · [] nếu rỗng", "head · comma-separated values · [] for empty"), extraParams: [],
  approach: [bi("first → phần còn lại · second → first · prev → second", "first → rest · second → first · prev → second"), bi("D là node giả; # là số hiệu node, không phải giá trị", "D is the dummy node; # identifies a node, not its value")],
  complexity: { time: "O(n)", space: "O(1)", note: bi("Debug đầy đủ với ≤12 node. Danh sách dài vẫn đổi đủ, hình chỉ xem trước 12 node.", "Full debug for ≤12 nodes. Longer lists swap all nodes; pictures preview 12 nodes.") },
  code, debugMode: "line-by-line", builder, parseSwap24: parse, liveArgs: input => [{ __viz_type: "linked_list", values: parse(input) }]
} };
