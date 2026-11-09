'use strict';
const base = require('./monotonic-stack')[654];
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({ vi, en });
const CODE = `from typing import List, Optional

class TreeNode:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

class Solution:
    def constructMaximumBinaryTree(self, nums: List[int]) -> Optional[TreeNode]:
        stack = []
        for i, value in enumerate(nums):
            node = TreeNode(value)
            while stack and stack[-1].val < value:
                popped = stack.pop()
                node.left = popped
            if stack:
                stack[-1].right = node
            stack.append(node)
        return stack[0] if stack else None`;
function parse(input) {
  let a = input;
  try {
    if (typeof a === 'string') {
      const s = a.trim();
      a = s.startsWith('[') ? JSON.parse(s) : s ? s.split(',').map(t => t.trim() ? Number(t) : NaN) : [];
    }
  } catch { a = null; }
  if (!Array.isArray(a) || !a.length || a.length > 14 ||
      !Array.from(a).every(x => Number.isInteger(x) && x >= 0 && x <= 1000)) {
    throw new RangeError('#654: use 1–14 distinct integers from 0 to 1000');
  }
  if (new Set(a).size !== a.length) throw new RangeError('#654: nums must contain distinct values');
  return [...a];
}
function serialize(root) {
  if (!root) return [];
  const queue = [root], result = [];
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i]; result.push(node ? node.val : null);
    if (node) queue.push(node.left, node.right);
  }
  while (result.at(-1) === null) result.pop();
  return result;
}
function build(input) {
  const values = parse(input), code = CODE.split('\n'), indexOf = new Map(values.map((value, i) => [value, i]));
  const idx = node => node == null ? null : indexOf.get(node.val);
  const native = runTrace({ code: CODE, method: 'constructMaximumBinaryTree', args: [values],
    objectClasses: ['TreeNode'], stateClasses: ['TreeNode'] });
  const answer = serialize(native.answer), ledger = [];
  let comparison = null, held = null, current = null, previous = null;
  const steps = native.events.map((event, step) => {
    const x = event.locals, outer = event.outer, text = code[event.line - 1].trim();
    const final = event.returning && event.scope === 'constructMaximumBinaryTree';
    const found = new Map();
    const walk = object => {
      if (Array.isArray(object)) { object.forEach(walk); return; }
      if (!object || object.type !== 'TreeNode') return;
      const id = idx(object);
      if (found.has(id)) return;
      found.set(id, { id, value: object.val, left: idx(object.left), right: idx(object.right) });
      walk(object.left); walk(object.right);
    };
    for (const frame of event.frames) {
      Object.values(frame.locals).forEach(walk);
      if (frame.name === '__init__' && frame.locals.self) walk({ type: 'TreeNode', ...frame.locals.self });
    }
    walk(event.returned);
    const nodes = [...found.values()].sort((a, b) => a.id - b.id);
    const incoming = new Map(nodes.map(n => [n.id, 0]));
    for (const node of nodes) for (const side of ['left', 'right']) {
      if (node[side] !== null) incoming.set(node[side], incoming.get(node[side]) + 1);
    }
    const roots = nodes.filter(n => !incoming.get(n.id)).map(n => n.id), depth = new Map(roots.map(id => [id, 0]));
    // All actual edges point from larger to smaller values, including temporary shared children.
    for (const node of [...nodes].sort((a, b) => b.value - a.value)) for (const side of ['left', 'right']) {
      if (node[side] !== null) depth.set(node[side], Math.max(depth.get(node[side]) ?? 0, depth.get(node.id) + 1));
    }
    let change = null;
    if (text === 'for i, value in enumerate(nums):' && event.branch) { current = x.i; comparison = null; held = null; }
    if (event.scope === '__init__' && text === 'self.val, self.left, self.right = val, None, None') {
      change = { kind: 'create', index: idx(x.self) };
    }
    if (text === 'node = TreeNode(value)') change = { kind: 'bind', index: idx(x.node) };
    if (text === 'while stack and stack[-1].val < value:') {
      const top = x.stack.at(-1);
      comparison = { top: idx(top), left: top?.val ?? null, right: x.value, pass: event.branch };
    }
    if (text === 'popped = stack.pop()') { held = idx(x.popped); change = { kind: 'pop', index: held }; }
    if (text === 'node.left = popped' || text === 'stack[-1].right = node') {
      const side = text === 'node.left = popped' ? 'left' : 'right';
      const from = idx(side === 'left' ? x.node : x.stack.at(-1)), to = idx(side === 'left' ? x.popped : x.node);
      const before = previous.nodes.find(n => n.id === from)[side];
      change = { kind: 'link', from, to, side, before }; ledger.push({ ...change, step });
      if (side === 'left') held = null;
    }
    if (text === 'stack.append(node)') change = { kind: 'push', index: idx(x.node) };
    const inorder = [];
    if (roots.length === 1 && nodes.every(n => incoming.get(n.id) <= 1)) {
      const read = id => { if (id === null) return; const node = found.get(id); read(node.left); inorder.push(node.value); read(node.right); };
      read(roots[0]);
    }
    const stack = outer.stack ?? x.stack;
    const view = { id: 654, values, current: final ? null : current,
      nodes: nodes.map(n => ({ ...n, depth: depth.get(n.id), incoming: incoming.get(n.id) })), roots,
      stack: stack ? stack.map(idx) : null, node: idx(outer.node ?? x.node),
      constructing: event.scope === '__init__' ? idx(x.self) : null,
      root: final ? idx(native.answer) : null, popped: idx(outer.popped ?? x.popped), held,
      comparison: comparison ? { ...comparison } : null,
      inorder, ledger: ledger.map(row => ({ ...row })), change,
      source: { line: event.line, text, timing: 'after' }, locals: x, outer, frames: event.frames,
      scope: event.scope, branch: event.branch, returning: event.returning, returned: event.returned,
      trace: native.trace, result: final ? answer : null };
    previous = view;
    return { arr: [], codeBlock: 1, codeLines: [event.line], final,
      title: bi(`L${event.line} · ${text}`, `L${event.line} · ${text}`), note: bi('', ''),
      vars: Object.entries(x).map(([name, value]) => ({ name, value, rawValue: value })), maximumTreeView: view };
  });
  return { original: values, answer, nativeAnswer: native.answer, steps };
}
module.exports = { 654: { ...base, code: CODE.split('\n'), debugMode: 'line-by-line', inputKind: 'string', extraParams: [],
  inputLabel: bi('nums · 1–14 số khác nhau từ 0 đến 1000', 'nums · 1–14 distinct integers from 0 to 1000'),
  statement: bi('Nút gốc là số lớn nhất. Các số bên trái tạo cây con trái; các số bên phải tạo cây con phải.',
    'The largest value becomes the root. Values to its left form the left subtree; values to its right form the right subtree.'),
  approach: [bi('Stack giảm dần. Pop các nút nhỏ hơn làm nhánh trái; gắn nút mới làm con phải của TOP còn lại.',
    'A decreasing stack. Popped smaller nodes become the left subtree; attach the new node as the remaining TOP’s right child.')],
  complexity: { time: 'O(n)', space: 'O(n)', note: bi('Mỗi nút vào và ra stack tối đa một lần.', 'Each node enters and leaves the stack at most once.') },
  visualizationLimits: { maxValues: 14, completeTrace: true }, builder: build, liveArgs: input => [parse(input)],
} };
