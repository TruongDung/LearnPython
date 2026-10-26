"use strict";

const { bi } = require("./hard-viz-shared");
const base = require("./backtracking")[78];
const copy = value => JSON.parse(JSON.stringify(value));

function parseNums78(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 6 || !input.every(Number.isSafeInteger) || new Set(input).size !== input.length) {
    throw new RangeError("#78: nhập 1–6 số nguyên khác nhau / enter 1–6 distinct safe integers.");
  }
  return [...input];
}

function tracer(nums, mode) {
  const steps = [], watches = mode === "bitmask" ? ["mask", "i", "1 << i", "mask & (1 << i)", "subset", "len(result)"]
    : ["start", "i", "nums[i]", "current", "depth", "len(result)"];
  return { steps, emit(line, phase, locals, view, final = false) {
    const source = mode === "bitmask" ? base.code : base.code2;
    steps.push({ title: bi(`${mode === "bitmask" ? "Bitmask" : "Backtracking"} · ${phase}`), note: bi("", ""), arr: [], highlight: [], mark: [],
      codeBlock: mode === "bitmask" ? 1 : 2, codeLines: [line], final,
      vars: watches.map(name => ({ name, value: copy(locals[name] ?? "—") })),
      subsets78View: copy({ mode, nums, n: nums.length, total: 2 ** nums.length, line, source: source[line - 1], phase, ...view }),
    });
  } };
}

function buildBitmask(input) {
  const nums = parseNums78(input), n = nums.length, result = [], t = tracer(nums, "bitmask");
  let mask, i, subset, selected = [], checks = [];
  const emit = (line, phase, action = null, final = false) => t.emit(line, phase,
    { mask, i, "1 << i": i === undefined ? null : 1 << i, "mask & (1 << i)": mask === undefined || i === undefined ? null : mask & (1 << i), subset, "len(result)": result.length },
    { mask, i, subset, selected, checks, result, action }, final);
  emit(3, "result = ∅"); emit(4, "n");
  for (let m = 0; m < 1 << n; m++) {
    mask = m; emit(5, "mask"); subset = []; selected = []; checks = Array(n).fill(null); emit(6, "subset = ∅");
    for (let bit = 0; bit < n; bit++) {
      i = bit; emit(7, "i"); const value = mask & (1 << i); checks[i] = Boolean(value); emit(8, "bit ?", { kind: "check", index: i, value, pass: Boolean(value) });
      if (value) { subset.push(nums[i]); selected.push(i); emit(9, "nums[i] → subset", { kind: "append", index: i, value: nums[i] }); }
    }
    emit(7, "✓"); result.push(subset); emit(10, "subset → result", { kind: "save", index: result.length - 1 });
  }
  emit(5, "✓"); emit(11, "✓", null, true);
  return { original: nums, answer: copy(result), steps: t.steps };
}

function combinationLayout(n) {
  const nodes = []; let leaves = 0;
  function visit(start, indices, parentId) {
    const node = { id: nodes.length, parentId, indices, start, depth: indices.length, children: [], status: "future", saved: false, x: 0, y: indices.length * 58 + 8 };
    nodes.push(node);
    for (let i = start; i < n; i++) node.children.push(visit(i + 1, [...indices, i], node.id));
    node.x = node.children.length ? (nodes[node.children[0]].x + nodes[node.children.at(-1)].x) / 2 : leaves++ * 94 + 47;
    return node.id;
  }
  visit(0, [], null);
  const width = Math.max(280, leaves * 94), offset = (width - leaves * 94) / 2;
  nodes.forEach(node => { node.x += offset; });
  return { nodes, width, height: (n + 1) * 58 + 12 };
}

function buildBacktracking(input) {
  const nums = parseNums78(input), result = [], current = [], selected = [], stack = [], tree = combinationLayout(nums.length), t = tracer(nums, "backtracking");
  const emit = (line, phase, action = null, final = false) => {
    const frame = stack.at(-1), i = frame?.i;
    t.emit(line, phase, { start: frame?.start, i, "nums[i]": i === undefined ? null : nums[i], current: line === 3 ? null : current,
      depth: frame ? stack.length - 1 : null, "len(result)": result.length },
    { current: line === 3 ? null : current, selected, result, stack, tree, currentId: frame?.id ?? null, action, scope: frame ? "backtrack" : "subsets" }, final);
  };
  emit(3, "result = ∅"); emit(4, "current = ∅"); emit(6, "backtrack");
  function visit(id) {
    const node = tree.nodes[id], frame = { id, start: node.start };
    stack.push(frame); node.status = "active";
    result.push([...current]); node.saved = true; emit(7, "current → result", { kind: "save", nodeId: id, index: result.length - 1 });
    for (let i = node.start; i < nums.length; i++) {
      frame.i = i; emit(8, "i");
      current.push(nums[i]); selected.push(i);
      const childId = node.children[i - node.start]; emit(9, "+ nums[i]", { kind: "append", index: i, value: nums[i], childId });
      visit(childId); emit(10, "↩", { kind: "return", fromId: childId, toId: id });
      const value = current.pop(); selected.pop(); emit(11, "pop ↩", { kind: "pop", index: i, value, fromId: childId, toId: id });
    }
    emit(8, "✓"); node.status = "done"; stack.pop();
  }
  visit(0); emit(13, "↩"); emit(14, "✓", null, true);
  return { original: nums, answer: copy(result), steps: t.steps };
}

module.exports = { 78: { ...base, builder: buildBitmask, builder2: buildBacktracking, debugMode: "line-by-line", liveArgs: input => [parseNums78(input)],
  inputLabel: bi("nums · 1–6 số nguyên khác nhau", "nums · 1–6 distinct integers"),
  statement: bi("Sinh tất cả tập con của nums, gồm cả tập rỗng ∅. Mỗi phần tử được chọn hoặc bỏ.", "Generate every subset of nums, including the empty set ∅. Each value is chosen or skipped."),
  approach: [bi("Bitmask: mỗi công tắc 0/1 ứng với một phần tử.", "Bitmask: each 0/1 switch represents one value."),
    bi("Backtracking: lưu current → thêm phần tử → đi sâu → pop để quay lại.", "Backtracking: save current → append a value → recurse → pop to return.")],
  complexity: { time: "O(n · 2ⁿ)", space: "O(n) auxiliary + O(n · 2ⁿ) output", note: bi("Hai cách đều sinh đủ 2ⁿ tập con. Minh hoạ tối đa 6 phần tử.", "Both approaches generate all 2ⁿ subsets. Visualization supports up to 6 values.") },
} };
