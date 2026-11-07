"use strict";

const base = require("./two-pointer")[25];
const { runTrace } = require("./wasm-picture-trace");
const bi = (vi, en) => ({ vi, en });
const CODE = `class Solution:
    def reverseKGroup(self, head, k):
        dummy = ListNode(0, head)
        prev_group = dummy
        while True:
            kth = prev_group
            for _ in range(k):
                kth = kth.next
                if not kth:
                    return dummy.next
            next_group = kth.next
            prev, cur = next_group, prev_group.next
            for _ in range(k):
                nxt = cur.next
                cur.next = prev
                prev = cur
                cur = nxt
            tmp = prev_group.next
            prev_group.next = kth
            prev_group = tmp`.split("\n");

function parse(input, params = {}) {
  if (!params || typeof params !== "object" || Array.isArray(params)) {
    throw new RangeError("#25: params phải là object / params must be an object.");
  }
  let values;
  try {
    if (Array.isArray(input)) values = [...input];
    else if (typeof input === "string") {
      const text = input.trim();
      values = !text ? [] : text.startsWith("[") ? JSON.parse(text)
        : text.split(",").map(item => item.trim() ? Number(item.trim()) : NaN);
    }
  } catch (_) { values = null; }
  if (!Array.isArray(values) || values.length > 20 || !values.every(v => Number.isInteger(v) && v >= 0 && v <= 1000)) {
    throw new RangeError("#25: head gồm tối đa 20 số nguyên 0–1000, ví dụ 1,2,3 hoặc [] / head: at most 20 integers 0–1000.");
  }
  const k = params.k === undefined ? 2 : params.k;
  if (!Number.isInteger(k) || k < 1 || k > 20) throw new RangeError("#25: k là số nguyên 1–20 / k must be an integer from 1 to 20.");
  return [values, k];
}

function walk(nodes, start) {
  const byId = new Map(nodes.map(n => [n.id, n])), result = [], seen = new Set();
  for (let id = start; id !== null; id = byId.get(id).next) {
    if (seen.has(id)) throw new Error("#25: unexpected pointer cycle.");
    seen.add(id); result.push(id);
  }
  return result;
}

const PHASES = {
  3: bi("Thêm nút giả D", "Add dummy D"), 4: bi("Bắt đầu từ D", "Start at D"),
  5: bi("Tìm nhóm tiếp", "Find the next group"), 6: bi("Đếm từ prev_group", "Count from prev_group"),
  7: bi("Đếm đủ k nút?", "Count k nodes?"), 8: bi("kth tiến 1 nút", "Advance kth one node"),
  9: bi("Đã hết nút?", "Out of nodes?"), 10: bi("Giữ phần còn lại · trả về", "Keep the remainder · return"),
  11: bi("Giữ đầu nhóm sau", "Save the next group"), 12: bi("Đặt prev và cur", "Set prev and cur"),
  13: bi("Đảo từng liên kết", "Reverse each link"), 14: bi("Giữ nxt trước khi đổi", "Save nxt before rewiring"),
  15: bi("cur.next → prev", "cur.next → prev"), 16: bi("prev → cur", "prev → cur"),
  17: bi("cur → nxt", "cur → nxt"), 18: bi("Giữ đầu cũ bằng tmp", "Save the old head in tmp"),
  19: bi("Nối nhóm vừa đảo", "Attach the reversed group"), 20: bi("Xong nhóm · tiến tiếp", "Group done · advance"),
};

function builder(input, params = {}) {
  const [values, k] = parse(input, params);
  const trace = runTrace({ profile: "linked25", method: "reverseKGroup", code: CODE.join("\n"), args: [values, k] });
  const completed = new Set();
  let group = [], checked = [], reversed = [], round = 0, previousNodes = null, previousPointers = {};
  const nodeName = id => id === null ? "None" : id === -1 ? "D" : `#${id + 1}`;
  const steps = trace.events.map(record => {
    const { line, nodes, pointers, locals } = record, byId = new Map(nodes.map(n => [n.id, n]));
    if (line === 6) {
      group = walk(nodes, byId.get(pointers.prev_group).next).slice(0, k);
      checked = []; reversed = []; round++;
    }
    if (line === 8 && pointers.kth !== null) checked.push(pointers.kth);
    let change = null;
    if (line === 15 || line === 19) {
      const from = line === 15 ? pointers.cur : pointers.prev_group;
      const before = previousNodes.find(n => n.id === from).next, after = byId.get(from).next;
      change = { from, before, after };
      if (line === 15) reversed.push(from);
    }
    if (line === 20) group.forEach(id => completed.add(id));
    const pointerChanges = Object.entries(pointers).filter(([name, id]) => !Object.hasOwn(previousPointers, name) || previousPointers[name] !== id).map(([name, after]) => ({ name, before: previousPointers[name] ?? null, after }));
    const order = walk(nodes, byId.get(-1).next), detached = values.map((_, id) => id).filter(id => !order.includes(id));
    const exhausted = [7, 13].includes(line) && record.branch === false;
    const phase = exhausted ? bi("Hết vòng lặp ↩", "Loop exhausted ↩") : PHASES[line];
    const stage = line === 10 ? "done" : line <= 9 ? "count" : line <= 17 ? "reverse" : "connect";
    const view = {
      original: values, k, nodes, pointers, locals, branch: record.branch, returning: record.returning, returned: record.returned,
      source: { line, text: CODE[line - 1].trim(), timing: "after" }, phase, stage, exhausted,
      round, group: [...group], checked: [...checked], reversed: [...reversed], completed: [...completed],
      order, detached, change, pointerChanges, answer: record.returning ? trace.answer : null,
      remainder: record.returning ? [...group] : null,
    };
    previousNodes = nodes; previousPointers = pointers;
    return {
      arr: [], highlight: [], mark: [], codeBlock: 1, codeLines: [line], final: record.returning,
      title: bi(`L${line} · ${phase.vi}`, `L${line} · ${phase.en}`), note: bi("", ""),
      vars: Object.entries(locals).map(([name, value]) => ({ name,
        value: value && typeof value === "object" ? `${nodeName(value.id)} (${value.value})` : value === null ? "None" : value,
        rawValue: value,
      })),
      reverseGroup25View: view,
    };
  });
  return { original: values, answer: trace.answer, steps };
}

module.exports = { 25: {
  ...base, defaultInput: "1,2,3,4,5", allowEmptyInput: true, debugMode: "line-by-line",
  titleVi: bi("Đảo từng nhóm k nút", "Reverse every k-node group"),
  statement: bi("Đảo liên kết trong từng nhóm đủ k nút. Nhóm cuối thiếu k nút giữ nguyên; giá trị mỗi nút không đổi.",
    "Reverse links within each complete group of k nodes. Keep an incomplete final group and preserve every node's value."),
  inputLabel: bi("head · tối đa 20 nút · [] nếu rỗng", "head · up to 20 nodes · [] for empty"),
  extraParams: [{ key: "k", type: "int", label: bi("k · kích thước nhóm", "k · group size"), default: 2, min: 1, max: 20 }],
  approach: [bi("Đếm k nút → lưu nxt → đảo next → nối nhóm. # là số hiệu cố định của nút.",
    "Count k nodes → save nxt → reverse next → attach the group. # is the stable node identity.")],
  complexity: { time: "O(n)", space: "O(1)", note: bi("Thuật toán đổi con trỏ tại chỗ. Debug đầy đủ với tối đa 20 nút.",
    "The algorithm rewires pointers in place. Complete line replay for up to 20 nodes.") },
  visualizationLimits: { maxNodes: 20, completeTrace: true }, code: CODE, codeLabel: bi("Đảo con trỏ · từng dòng Python", "Rewire pointers · Python line by line"),
  builder, liveArgs: (input, params) => { const [values, k] = parse(input, params); return [{ __viz_type: "linked_list", values }, k]; },
} };
