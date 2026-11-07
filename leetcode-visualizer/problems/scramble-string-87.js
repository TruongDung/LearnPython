"use strict";

const { runTrace } = require("./wasm-picture-trace");
const bi = (vi, en) => ({ vi, en });
const CODE = `from collections import Counter

class Solution:
    def isScramble(self, s1: str, s2: str) -> bool:
        memo = {}

        def dfs(i, j, length):
            key = (i, j, length)
            if key in memo:
                return memo[key]
            a = s1[i:i + length]
            b = s2[j:j + length]
            if a == b:
                memo[key] = True
                return True
            if Counter(a) != Counter(b):
                memo[key] = False
                return False
            for cut in range(1, length):
                if dfs(i, j, cut) and dfs(i + cut, j + cut, length - cut):
                    memo[key] = True
                    return True
                if dfs(i, j + length - cut, cut) and dfs(i + cut, j, length - cut):
                    memo[key] = True
                    return True
            memo[key] = False
            return False

        return dfs(0, 0, len(s1))`.split("\n");
const keyOf = (i, j, length) => `${i},${j},${length}`;
const memoEntries = value => value?.__pairs__ ?? [];

function parse(input, params = {}) {
  if (!params || typeof params !== "object" || Array.isArray(params)) throw new RangeError("#87: params phải là object / params must be an object.");
  const s2 = params.s2 === undefined ? "rgeat" : params.s2;
  if (typeof input !== "string" || !/^[a-z]{1,8}$/.test(input)
    || typeof s2 !== "string" || !/^[a-z]{1,8}$/.test(s2)) {
    throw new RangeError("#87: s1 và s2 gồm 1–8 chữ a-z để debug đầy đủ / use 1–8 lowercase letters for complete line replay.");
  }
  if (input.length !== s2.length) throw new RangeError("#87: s1 và s2 phải cùng độ dài / s1 and s2 must have equal length.");
  return [input, s2];
}

const PHASES = {
  5: bi("memo = {}", "memo = {}"), 7: bi("Tạo hàm dfs", "Define dfs"),
  8: bi("Trạng thái (i, j, length)", "State (i, j, length)"), 9: bi("Đã có trong memo?", "Already in memo?"),
  10: bi("Dùng lại memo ↩", "Reuse memo ↩"), 11: bi("Cắt đoạn từ s1", "Slice from s1"), 12: bi("Cắt đoạn từ s2", "Slice from s2"),
  13: bi("Hai đoạn giống nhau?", "Identical substrings?"), 14: bi("Lưu True vào memo", "Save True in memo"),
  15: bi("Giống nhau → True", "Identical → True"), 16: bi("Số lượng chữ khác nhau?", "Different character counts?"),
  17: bi("Loại sớm · lưu False", "Prune · save False"), 18: bi("Khác số lượng chữ → False", "Different counts → False"),
  19: bi("Thử điểm cắt mới", "Try the next cut"), 20: bi("Thử giữ thứ tự ↓", "Try keeping the order ↓"),
  21: bi("Nhánh giữ thành công", "Keep branch succeeds"), 22: bi("Giữ thứ tự → True", "Keep order → True"),
  23: bi("Thử đổi chỗ ⤨", "Try swapping ⤨"), 24: bi("Nhánh đổi thành công", "Swap branch succeeds"),
  25: bi("Đổi chỗ → True", "Swap → True"), 26: bi("Hết điểm cắt · lưu False", "All cuts failed · save False"),
  27: bi("Không có cách ghép → False", "No matching split → False"), 29: bi("Trả kết quả cuối", "Return the final result"),
};

function builder(input, params = {}) {
  const [s1, s2] = parse(input, params);
  const trace = runTrace({ code: CODE.join("\n"), method: "isScramble", args: [s1, s2] });
  const nodes = [], owners = new Map(); let live = [], cacheHits = 0;
  function role(parent, child, cut) {
    if (child.i === parent.i) return { branch: child.j === parent.j ? "keep" : "swap", side: 0, cut };
    return { branch: child.j === parent.j + cut ? "keep" : "swap", side: 1, cut };
  }
  function attempt(node, cut, branch) {
    const key = `${cut}:${branch}`;
    if (!node.attempts.has(key)) node.attempts.set(key, { children: [null, null], checked: false, result: null });
    return node.attempts.get(key);
  }
  function proof(id, seen = new Set()) {
    if (seen.has(id)) throw new Error("#87: cyclic proof.");
    const node = nodes[id]; seen.add(id);
    if (node.memoHit) return proof(node.owner, seen);
    const data = { i: node.i, j: node.j, length: node.length, a: s1.slice(node.i, node.i + node.length), b: s2.slice(node.j, node.j + node.length) };
    if (node.reason === "equal") return { ...data, mode: "equal", cut: null, children: [] };
    const tried = attempt(node, node.winCut, node.reason);
    return { ...data, mode: node.reason, cut: node.winCut, children: tried.children.map(child => proof(child, new Set(seen))) };
  }
  const steps = trace.events.map((record, index) => {
    const frames = record.frames.filter(frame => frame.name === "dfs"), nextLive = [];
    for (let depth = 0; depth < frames.length; depth++) {
      const x = frames[depth].locals, key = keyOf(x.i, x.j, x.length);
      let node = nodes[live[depth]];
      if (!node || node.key !== key || node.closed) {
        const parent = depth ? nodes[nextLive[depth - 1]] : null;
        node = { id: nodes.length, key, i: x.i, j: x.j, length: x.length, parent: parent?.id ?? null,
          depth, firstStep: index, result: null, closed: false, memoHit: false, owner: null, reason: null,
          winCut: null, split: null, branch: "root", side: null, same: null, histogramMismatch: null, attempts: new Map() };
        nodes.push(node);
        if (parent) {
          const edge = role(parent, node, frames[depth - 1].locals.cut);
          Object.assign(node, edge); attempt(parent, edge.cut, edge.branch).children[edge.side] = node.id;
        }
      }
      nextLive.push(node.id);
    }
    live = nextLive;
    const activeId = live.at(-1) ?? null, node = activeId === null ? null : nodes[activeId], x = record.locals, line = record.line;
    if (node) {
      if (line === 9 && record.branch) { node.memoHit = true; node.owner = owners.get(node.key); cacheHits++; }
      if (line === 13) node.same = record.branch;
      if (line === 16) node.histogramMismatch = record.branch;
      if (line === 19 && record.branch) node.split = x.cut;
      if (line === 20 || line === 23) Object.assign(attempt(node, x.cut, line === 20 ? "keep" : "swap"), { checked: true, result: record.branch });
      if ([14, 17, 21, 24, 26].includes(line)) owners.set(node.key, node.id);
      if (record.returning) {
        node.result = record.returned; node.closed = true;
        node.reason = line === 10 ? "memo" : line === 15 ? "equal" : line === 18 ? "counts" : line === 22 ? "keep" : line === 25 ? "swap" : "exhausted";
        if (node.reason === "keep" || node.reason === "swap") node.winCut = x.cut;
      }
    }
    const final = record.scope === "isScramble" && record.returning, focus = node ?? nodes[0] ?? null;
    const split = focus?.split ? {
      cut: focus.split,
      ...Object.fromEntries(["keep", "swap"].map(branch => {
        const item = attempt(focus, focus.split, branch);
        return [branch, { checked: item.checked, result: item.result,
          children: item.children.map(id => id === null ? null : { id, result: nodes[id].result }),
          skipped: item.checked && item.children[1] === null && item.children[0] !== null && nodes[item.children[0]].result === false }];
      })),
    } : null;
    const view = {
      s1, s2, activeId, focusId: focus?.id ?? null,
      focus: focus ? { i: focus.i, j: focus.j, length: focus.length, memoHit: focus.memoHit, same: focus.same, histogramMismatch: focus.histogramMismatch, result: focus.result, reason: focus.reason } : null,
      split, stack: [...live], cacheHits,
      tree: nodes.map(n => ({ id: n.id, parent: n.parent, depth: n.depth, i: n.i, j: n.j, length: n.length,
        branch: n.branch, cut: n.cut ?? null, side: n.side, result: n.result, memoHit: n.memoHit, firstStep: n.firstStep })),
      memo: memoEntries(record.outer.memo).map(([key, result]) => ({ key, result })),
      memoChanged: node && [14, 17, 21, 24, 26].includes(line) ? [node.i, node.j, node.length] : null,
      memoRead: node?.memoHit ? [node.i, node.j, node.length] : null,
      source: { line, text: CODE[line - 1].trim(), timing: "after" },
      phase: line === 19 && !record.branch ? bi("Đã thử hết điểm cắt", "All cuts tried") : PHASES[line],
      locals: x, outer: record.outer, frames: record.frames, scope: record.scope, branch: record.branch,
      returning: record.returning, returned: record.returned, trace: trace.trace,
      answer: final ? trace.answer : null, witness: final && trace.answer ? proof(0) : null,
    };
    return { arr: [], highlight: [], mark: [], codeBlock: 1, codeLines: [line], final,
      title: bi(`L${line} · ${view.phase.vi}`, `L${line} · ${view.phase.en}`), note: bi("", ""),
      vars: (record.scope === "dfs" ? ["i", "j", "length", "cut"] : ["s1", "s2"]).map(name => ({ name, value: x[name] ?? "—", rawValue: x[name] ?? null })),
      scramble87View: view };
  });
  return { original: s1, answer: trace.answer, steps };
}

module.exports = { 87: {
  id: 87, difficulty: "hard", slug: "scramble-string", category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
  title: bi("Scramble String", "Scramble String"), titleVi: bi("Xáo trộn chuỗi", "Scramble a string"),
  tags: [{ key: "string", vi: "Chuỗi", en: "String" }, { key: "memoization", vi: "Memo", en: "Memoization" }, { key: "recursion", vi: "Đệ quy", en: "Recursion" }],
  statement: bi("Cắt s1 thành hai đoạn không rỗng, giữ hoặc đổi chỗ rồi tiếp tục đệ quy trên từng đoạn. Có thể tạo ra s2 không?",
    "Split s1 into two nonempty parts, keep or swap them, and recurse on each part. Can this produce s2?"),
  defaultInput: "great", inputKind: "string", preserveInputWhitespace: true,
  inputLabel: bi("s1 · 1–8 chữ a-z", "s1 · 1–8 lowercase letters"),
  extraParams: [{ key: "s2", type: "string", label: bi("s2 · cùng độ dài · tối đa 8 chữ", "s2 · equal length · up to 8 letters"), default: "rgeat" }],
  approach: [bi("Thử điểm cắt → giữ / đổi → ghép hai kết quả. Memo dùng lại trạng thái (i, j, length).",
    "Try a cut → keep / swap → combine both results. Memo reuses (i, j, length) states.")],
  complexity: { time: "O(n^4)", space: "O(n^3)", note: bi("Memo có O(n³) trạng thái; mỗi trạng thái thử O(n) điểm cắt hoặc đếm chữ.", "O(n³) memo states, each doing O(n) split trials or character counting.") },
  code: CODE, codeLabel: bi("DFS + memo · từng dòng Python", "DFS + memo · Python line by line"),
  debugMode: "line-by-line", visualizationLimits: { maxLength: 8, completeTrace: true }, builder, liveArgs: parse,
} };
