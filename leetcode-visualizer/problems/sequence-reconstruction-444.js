"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE = [
  "class Solution:",
  "    def sequenceReconstruction(self, nums, sequences):",
  "        graph = {x: set() for x in nums}",
  "        indegree = {x: 0 for x in nums}",
  "        seen = set()",
  "        for seq in sequences:",
  "            seen.update(seq)",
  "            for a, b in zip(seq, seq[1:]):",
  "                if b not in graph[a]:",
  "                    graph[a].add(b)",
  "                    indegree[b] += 1",
  "        queue = [x for x in nums if indegree[x] == 0]",
  "        order = []",
  "        while queue:",
  "            if len(queue) != 1: return False",
  "            cur = queue.pop(0)",
  "            order.append(cur)",
  "            for nxt in graph[cur]:",
  "                indegree[nxt] -= 1",
  "                if indegree[nxt] == 0: queue.append(nxt)",
  "        return seen == set(nums) and order == nums",
];

function parseList(value, label) {
  if (Array.isArray(value)) return value.map(Number);
  if (typeof value !== "string") throw new RangeError(`#444: ${label} is required.`);
  const values = value.trim() ? value.trim().split(/[\s,]+/).map(Number) : [];
  if (values.some((n) => !Number.isInteger(n))) throw new RangeError(`#444: ${label} must contain integers.`);
  return values;
}

function parseSequences(value) {
  if (Array.isArray(value)) {
    if (value.every((item) => Array.isArray(item))) return value.map((row) => row.map(Number));
    if (value.every((item) => Number.isInteger(Number(item)))) return [value.map(Number)];
  }
  if (typeof value === "string") {
    return value.trim() ? value.split(";").map((row) => row.trim() ? row.trim().split(/[\s,]+/).map(Number) : []) : [];
  }
  throw new RangeError("#444: sequences use rows separated by ;, such as 1,2; 2,3.");
}

function parseInput(input, params = {}) {
  let nums = input;
  let sequences = params.sequences ?? "1,2; 2,3; 3,4";
  if (input && !Array.isArray(input) && typeof input === "object") {
    nums = input.nums;
    sequences = input.sequences ?? sequences;
  }
  nums = parseList(nums, "nums");
  sequences = parseSequences(sequences);
  if (nums.length < 1 || nums.length > 8 || new Set(nums).size !== nums.length
    || nums.some((n) => n < 1 || n > 8)
    || sequences.length > 20 || sequences.some((seq) => seq.length > 8
      || seq.some((n) => !Number.isInteger(n) || !nums.includes(n)))) {
    throw new RangeError("#444: Use 1–8 unique nums from 1–8 and up to 20 subsequences containing only those nums.");
  }
  return { nums, sequences };
}

function buildSteps(input, params = {}) {
  const { nums, sequences } = parseInput(input, params);
  const graph = new Map(nums.map((n) => [n, new Set()]));
  const indegree = new Map(nums.map((n) => [n, 0]));
  const seen = new Set();
  const queue = [];
  const order = [];
  const edges = [];
  const steps = [];
  let phase = "start"; let active = null; let activeEdge = null; let unique = true;
  let answer = null; let reason = null;

  function emit(line, final = false) {
    const ready = nums.filter((n) => indegree.get(n) === 0 && !order.includes(n));
    steps.push({
      title: bi(
        phase === "start" ? "Thứ tự cần khôi phục" : phase === "init" ? "Tạo nút" : phase === "scan" ? "Đọc dãy con" : phase === "edge" ? "Thêm ràng buộc" : phase === "duplicate" ? "Ràng buộc đã có" : phase === "ready" ? `Nút bậc 0: ${queue.join(", ") || "∅"}` : phase === "choose" ? `Chọn ${active}` : phase === "unlock" ? `Mở khóa ${active}` : phase === "ambiguous" ? "Có nhiều lựa chọn" : phase === "result" ? "Thứ tự dựng xong" : "Kiểm tra kết quả",
        phase === "start" ? "Target order" : phase === "init" ? "Create node" : phase === "scan" ? "Read subsequence" : phase === "edge" ? "Add constraint" : phase === "duplicate" ? "Constraint already exists" : phase === "ready" ? `Zero-indegree: ${queue.join(", ") || "∅"}` : phase === "choose" ? `Choose ${active}` : phase === "unlock" ? `Unlock ${active}` : phase === "ambiguous" ? "More than one choice" : phase === "result" ? "Order complete" : "Check result",
      ),
      note: bi("", ""), arr: [...nums], highlight: active === null ? [] : [nums.indexOf(active)], mark: order.map((n) => nums.indexOf(n)), codeLines: [line], final,
      vars: [{ name: "ready", value: queue.join(",") || "∅" }, { name: "order", value: order.join(",") || "∅" }, { name: "unique", value: unique }],
      sequenceReconstruction444View: {
        nums: [...nums], sequences: sequences.map((seq) => [...seq]), edges: edges.map((edge) => ({ ...edge })),
        indegree: Object.fromEntries(indegree), seen: [...seen], queue: [...queue], ready: [...ready], order: [...order],
        phase, active, activeEdge: activeEdge ? { ...activeEdge } : null, unique, answer, reason,
      },
    });
  }

  emit(2); phase = "init"; emit(3); emit(4); emit(5);
  for (let si = 0; si < sequences.length; si++) {
    const seq = sequences[si]; phase = "scan"; active = null; emit(6);
    for (const value of seq) seen.add(value);
    emit(7);
    for (let i = 0; i + 1 < seq.length; i++) {
      const a = seq[i]; const b = seq[i + 1]; active = b; activeEdge = { a, b, sequence: si };
      emit(8);
      if (!graph.get(a).has(b)) {
      phase = "edge"; emit(9);
        graph.get(a).add(b); edges.push({ a, b, sequence: si, active: true }); emit(10);
        indegree.set(b, indegree.get(b) + 1); emit(11);
      } else { phase = "duplicate"; emit(9); }
      edges.forEach((edge) => { edge.active = false; });
    }
  }

  phase = "ready";
  nums.forEach((n) => { if (indegree.get(n) === 0) queue.push(n); });
  emit(12); emit(13);
  while (queue.length) {
    phase = "ready"; active = null; emit(14);
    if (queue.length !== 1) {
      unique = false; phase = "ambiguous"; answer = false; reason = "ambiguous"; emit(15, true);
      return { original: { nums, sequences }, answer, steps };
    }
    active = queue.shift(); phase = "choose"; emit(16);
    order.push(active); phase = "unlock"; emit(17);
    const neighbors = [...graph.get(active)];
    for (const next of neighbors) {
      activeEdge = { a: active, b: next }; phase = "unlock"; emit(18);
      indegree.set(next, indegree.get(next) - 1); emit(19);
      if (indegree.get(next) === 0) { queue.push(next); active = next; emit(20); }
    }
  }
  const covered = nums.every((n) => seen.has(n));
  const sameOrder = order.length === nums.length && order.every((n, i) => n === nums[i]);
  answer = covered && sameOrder;
  reason = !covered ? "missing" : order.length !== nums.length ? "cycle" : sameOrder ? "match" : "mismatch";
  phase = "result"; active = null; activeEdge = null; emit(21, true);
  return { original: { nums, sequences }, answer, steps };
}

module.exports = { 444: {
  id: 444, slug: "sequence-reconstruction", difficulty: "medium", category: { key: "graph", vi: "Đồ thị", en: "Graph" },
  tags: [{ key: "graph", vi: "Đồ thị", en: "Graph" }, { key: "topological-sort", vi: "Sắp xếp topo", en: "Topological Sort" }],
  title: bi("Sequence Reconstruction", "Sequence Reconstruction"), titleVi: bi("Khôi phục thứ tự duy nhất", "Unique sequence reconstruction"),
  statement: bi("Các dãy con có xác định được duy nhất thứ tự nums không?", "Do the subsequences determine nums as the only possible order?"),
  defaultInput: "1,2,3,4", inputKind: "string", inputLabel: bi("nums · thứ tự đích", "nums · target order"),
  extraParams: [{ key: "sequences", type: "string", label: bi("sequences · các dãy con, ngăn bằng ;", "sequences · subsequences separated by ;"), default: "1,2; 2,3; 3,4" }],
  debugMode: "line-by-line",
  approach: [bi("Mỗi cặp liền nhau tạo mũi tên a → b.", "Each adjacent pair creates an arrow a → b."), bi("Chỉ đúng một nút bậc 0 mỗi lượt thì thứ tự là duy nhất.", "Exactly one zero-indegree node at each step means the order is unique.")],
  complexity: { time: "O(V + E)", space: "O(V + E)", note: bi("Bản minh họa giới hạn 8 số để sơ đồ gọn.", "Visualization limits the graph to 8 values for a compact diagram.") },
  code: CODE, builder: buildSteps, liveArgs: (input, params) => [parseInput(input, params)],
} };
