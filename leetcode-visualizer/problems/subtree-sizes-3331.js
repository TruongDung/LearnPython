'use strict';

const bi = (vi, en) => ({ vi, en });
const maxNodes = 31;
const defaultInput = '[-1,0,0,1,1,1]';
const defaultLabels = 'abaabc';

const code = [
  'class Solution:',
  '    def findSubtreeSizes(self, parent, s):',
  '        n = len(parent)',
  '        children = [[] for _ in range(n)]',
  '        for u in range(1, n):',
  '            children[parent[u]].append(u)',
  '        new_parent = parent[:]',
  '        path = {c: [] for c in s}',
  '        order = []',
  '        stack = [(0, False)]',
  '        while stack:',
  '            u, exiting = stack.pop()',
  '            same = path[s[u]]',
  '            if exiting:',
  '                same.pop()',
  '                continue',
  '            if same:',
  '                new_parent[u] = same[-1]',
  '            same.append(u)',
  '            order.append(u)',
  '            stack.append((u, True))',
  '            for v in reversed(children[u]):',
  '                stack.append((v, False))',
  '        size = [1] * n',
  '        for u in reversed(order[1:]):',
  '            p = new_parent[u]',
  '            size[p] += size[u]',
  '        return size',
];

function parse(input, { s = defaultLabels } = {}) {
  let parent;
  try {
    parent = Array.isArray(input) ? [...input] : JSON.parse(
      input.trim().startsWith('[') ? input : '[' + input + ']',
    );
  } catch {
    throw new TypeError('parent: [-1,0,0,1,…]');
  }
  if (!Array.isArray(parent) || parent.length < 1 || parent.length > maxNodes ||
      parent[0] !== -1 || !parent.slice(1).every(p => Number.isInteger(p) && p >= 0 && p < parent.length)) {
    throw new RangeError(`parent: 1–${maxNodes} nodes, parent[0] = -1`);
  }
  if (typeof s !== 'string' || !/^[a-z]+$/.test(s) || s.length !== parent.length) {
    throw new TypeError('s: a–z, len(s) = len(parent)');
  }
  const children = parent.map(() => []);
  for (let u = 1; u < parent.length; u++) children[parent[u]].push(u);
  const reachable = [0];
  for (let i = 0; i < reachable.length; i++) reachable.push(...children[reachable[i]]);
  if (reachable.length !== parent.length) throw new RangeError('parent: tree rooted at 0');
  return { parent, s };
}

function build(input, params) {
  const { parent, s } = parse(input, params);
  const n = parent.length;
  const steps = [];
  let children, newParent, path, order, stack, size, u, v, p, exiting, same;
  let phase = 'setup';
  let current;
  function emit(line, title, extra = {}) {
    const locals = {
      n, u, v, p, exiting,
      same: same?.slice(),
      new_parent: newParent?.slice(),
      order: order?.slice(),
      stack: stack?.slice(),
      size: size?.slice(),
    };
    steps.push({
      arr: [],
      title: typeof title === 'string' ? bi(title, title) : title,
      note: bi('', ''),
      codeLines: [line],
      codeBlock: 1,
      final: line === 28,
      vars: Object.entries(locals).filter(([, value]) => value !== undefined)
        .map(([name, value]) => ({ name, value })),
      subtree3331View: {
        line, phase, parent, s, current,
        same: same?.slice() ?? [],
        newParent: locals.new_parent ?? parent,
        size: locals.size,
        ...extra,
      },
    });
  }

  emit(3, `n = ${n}`);
  children = parent.map(() => []);
  emit(4, 'children = [[], …]');
  for (u = 1; u < n; u++) {
    current = u;
    emit(5, `u = ${u}`);
    children[parent[u]].push(u);
    emit(6, `${parent[u]} → ${u}`);
  }
  u = n > 1 ? n - 1 : undefined;
  current = undefined;
  emit(5, bi('Đã tạo các cạnh', 'Edges ready'));
  newParent = parent.slice();
  emit(7, 'new_parent = parent[:]');

  phase = 'move';
  path = new Map([...s].map(c => [c, []]));
  emit(8, 'path = {…}');
  order = [];
  emit(9, 'order = []');
  stack = [[0, false]];
  emit(10, 'stack = [(0, False)]');
  while (stack.length) {
    emit(11, 'stack ≠ ∅');
    [u, exiting] = stack.pop();
    current = u;
    emit(12, `${exiting ? '↑' : '↓'} ${u}`);
    same = path.get(s[u]);
    emit(13, `path['${s[u]}'] = [${same.join(', ')}]`, { match: exiting ? undefined : same.at(-1) });
    emit(14, `exiting = ${exiting ? 'True' : 'False'}`);
    if (exiting) {
      same.pop();
      emit(15, `path['${s[u]}'].pop() → ${u}`);
      emit(16, 'continue');
      continue;
    }
    const match = same.at(-1);
    emit(17, match === undefined ? 'same = ∅' : `${match} · ${s[u]}`, { match });
    if (match !== undefined) {
      newParent[u] = match;
      emit(18, `new_parent[${u}] = ${match}`, { match });
    }
    same.push(u);
    emit(19, `path['${s[u]}'] ← ${u}`);
    order.push(u);
    emit(20, `order ← ${u}`);
    stack.push([u, true]);
    emit(21, `stack ← (${u}, True)`);
    for (const child of children[u].slice().reverse()) {
      v = child;
      emit(22, `v = ${v}`);
      stack.push([v, false]);
      emit(23, `stack ← (${v}, False)`);
    }
    emit(22, bi('Đã xếp các con', 'Children queued'));
  }
  current = undefined;
  emit(11, 'stack = ∅');

  phase = 'count';
  size = Array(n).fill(1);
  emit(24, 'size = [1, …]');
  for (u of order.slice(1).reverse()) {
    current = u;
    emit(25, `u = ${u}`);
    p = newParent[u];
    emit(26, `p = ${p}`);
    const previous = size[p];
    size[p] += size[u];
    emit(27, `${previous} + ${size[u]} = ${size[p]}`, { transfer: { from: u, to: p } });
  }
  current = undefined;
  emit(25, bi('Đã cộng về gốc', 'Sizes accumulated'));
  emit(28, `size = [${size.join(', ')}]`);
  return { original: { parent, s }, answer: size, steps };
}

module.exports = {
  3331: {
    id: 3331,
    title: bi('Find Subtree Sizes After Changes', 'Find Subtree Sizes After Changes'),
    titleVi: bi('Kích thước cây con sau khi đổi cha', 'Find Subtree Sizes After Changes'),
    slug: 'find-subtree-sizes-after-changes',
    difficulty: 'medium',
    category: { key: 'tree', vi: 'Cây', en: 'Tree' },
    tags: [{ key: 'dfs', vi: 'DFS', en: 'DFS' }],
    statement: bi(
      'Trên cây gốc, tìm tổ tiên gần nhất cùng chữ cho mỗi node. Đổi cha đồng thời rồi đếm kích thước cây con.',
      'On the original tree, find each node’s nearest ancestor with the same letter. Reparent simultaneously, then count subtree sizes.',
    ),
    defaultInput,
    inputKind: 'string',
    inputLabel: bi(`parent (tối đa ${maxNodes} node)`, `parent (up to ${maxNodes} nodes)`),
    extraParams: [{ key: 's', type: 'string', label: bi('s (chữ trên node)', 's (node labels)'), default: defaultLabels }],
    visualizationLimits: { maxNodes },
    debugMode: 'line-by-line',
    approach: [bi('DFS trên cây gốc → chọn cha mới → cộng kích thước từ dưới lên.', 'DFS on the original tree → choose new parents → add sizes bottom-up.')],
    complexity: { time: 'O(n)', space: 'O(n)' },
    code,
    builder: build,
    liveArgs(input, params) {
      const { parent, s } = parse(input, params);
      return [parent, s];
    },
  },
};
