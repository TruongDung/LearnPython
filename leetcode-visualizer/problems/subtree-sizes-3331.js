'use strict';

const bi = (vi, en) => ({vi, en});
const maxNodes = 31;
const defaultInput = '[-1,0,0,1,1,1]';
const defaultLabels = 'abaabc';
const code = [
  'from typing import List',
  '',
  'class Solution:',
  '    def findSubtreeSizes(',
  '        self, parent: List[int], s: str',
  '    ) -> List[int]:',
  '        n = len(parent)',
  '        graph = [[] for _ in range(n)]',
  '',
  '        for i in range(1, n):',
  '            graph[parent[i]].append(i)',
  '',
  '        size = [1] * n',
  '        last = {}',
  '',
  '        def dfs(x):',
  '            c = s[x]',
  '',
  '            # Find closest ancestor with same character',
  '            new_parent = last.get(c, parent[x])',
  '',
  '            # Save previous ancestor for backtracking',
  '            prev = last.get(c)',
  '            last[c] = x',
  '',
  '            for child in graph[x]:',
  '                dfs(child)',
  '',
  '            # Restore ancestor state',
  '            if prev is None:',
  '                del last[c]',
  '            else:',
  '                last[c] = prev',
  '',
  '            # Accumulate subtree size into new parent',
  '            if new_parent != -1:',
  '                size[new_parent] += size[x]',
  '',
  '        dfs(0)',
  '        return size',
];

function parse(input, {s = defaultLabels} = {}) {
  let parent;
  try { parent = Array.isArray(input) ? [...input] : JSON.parse(input.trim().startsWith('[') ? input : '[' + input + ']'); }
  catch { throw new TypeError('3331 · parent: [-1,0,0,1,…]'); }
  if (!Array.isArray(parent) || parent.length < 1 || parent.length > maxNodes || parent[0] !== -1 ||
      !parent.slice(1).every(p => Number.isInteger(p) && p >= 0 && p < parent.length)) {
    throw new RangeError(`3331 · parent: 1–${maxNodes} nodes, parent[0] = -1`);
  }
  if (typeof s !== 'string' || /[^a-z]/.test(s) || s.length !== parent.length) throw new TypeError('3331 · s: a–z, len(s) = len(parent)');
  const children = parent.map(() => []);
  for (let x = 1; x < parent.length; x++) children[parent[x]].push(x);
  const reachable = [0];
  for (let i = 0; i < reachable.length; i++) reachable.push(...children[reachable[i]]);
  if (reachable.length !== parent.length) throw new RangeError('3331 · parent: tree rooted at 0');
  return {parent, s};
}

function build(input, params) {
  const {parent, s} = parse(input, params);
  const n = parent.length;
  const steps = [];
  const globals = {n};
  const frames = [];
  const newParent = [...parent];
  const decided = [];
  const finished = [];
  let graph;
  let size;
  let last;
  let built = 0;
  let buildCurrent = null;
  const copy = value => JSON.parse(JSON.stringify(value));
  const emit = (line, phase, title, extra = {}) => {
    const frame = frames.at(-1);
    const locals = {...globals, ...(graph ? {graph} : {}), ...(size ? {size} : {}), ...(last ? {last} : {}), ...frame};
    steps.push({
      arr: [], codeLines: [line], codeBlock: 1, title: typeof title === 'string' ? bi(title, title) : title,
      note: bi('', ''), final: line === 40,
      vars: Object.entries(locals).map(([name, value]) => ({name, value: copy(value)})),
      subtree3331View: {
        line, source: code[line - 1].trim(), phase, parent: [...parent], s, built,
        current: frame?.x ?? buildCurrent,
        frames: copy(frames), last: last ? {...last} : null,
        newParent: [...newParent], decided: [...decided], finished: [...finished],
        size: size ? [...size] : null,
        condition: null, transfer: null, ...extra,
      },
    });
  };
  emit(7, 'setup', `n = ${n}`);
  graph = Array.from({length: n}, () => []);
  emit(8, 'setup', bi('Tạo graph của cây gốc', 'Create the original tree graph'));
  for (let i = 1; i < n; i++) {
    globals.i = i; buildCurrent = i;
    emit(10, 'build', `i = ${i}`);
    graph[parent[i]].push(i); built++;
    emit(11, 'build', `${parent[i]} → ${i}`);
  }
  buildCurrent = null;
  emit(10, 'build', bi('Đã dựng cây gốc', 'Original tree ready'));
  size = Array(n).fill(1);
  emit(13, 'init', 'size = [1, …]');
  last = {};
  emit(14, 'init', 'last = {}');
  emit(16, 'define', bi('Định nghĩa dfs(x)', 'Define dfs(x)'));

  function dfs(x) {
    const frame = {x};
    frames.push(frame);
    frame.c = s[x];
    emit(17, 'enter', `dfs(${x}) · c = '${frame.c}'`);
    frame.new_parent = Object.hasOwn(last, frame.c) ? last[frame.c] : parent[x];
    newParent[x] = frame.new_parent;
    decided.push(x);
    emit(20, 'find', frame.new_parent === -1 ? bi('Node gốc: không có cha', 'Root: no parent')
      : Object.hasOwn(last, frame.c) ? bi(`Cùng '${frame.c}' gần nhất: #${frame.new_parent}`, `Nearest '${frame.c}': #${frame.new_parent}`)
      : bi(`Không trùng chữ: giữ cha #${parent[x]}`, `No matching ancestor: keep parent #${parent[x]}`), {matched: Object.hasOwn(last, frame.c)});
    frame.prev = Object.hasOwn(last, frame.c) ? last[frame.c] : null;
    emit(23, 'save', `prev = ${frame.prev === null ? 'None' : frame.prev}`);
    last[frame.c] = x;
    emit(24, 'push', `last['${frame.c}'] = ${x}`);
    for (const child of graph[x]) {
      frame.child = child;
      emit(26, 'child', `child = ${child}`);
      emit(27, 'call', `dfs(${child})`);
      dfs(child);
    }
    emit(26, 'children-done', bi(`Các con của #${x} đã xong`, `Children of #${x} complete`));
    emit(30, 'restore-check', `prev is None → ${frame.prev === null ? 'True' : 'False'}`, {condition: frame.prev === null});
    if (frame.prev === null) {
      delete last[frame.c];
      emit(31, 'restore', `del last['${frame.c}']`);
    } else {
      last[frame.c] = frame.prev;
      emit(33, 'restore', `last['${frame.c}'] = ${frame.prev}`);
    }
    emit(36, 'add-check', `new_parent != -1 → ${frame.new_parent !== -1 ? 'True' : 'False'}`, {condition: frame.new_parent !== -1});
    if (frame.new_parent !== -1) {
      const before = size[frame.new_parent];
      const amount = size[x];
      size[frame.new_parent] += amount;
      finished.push(x);
      emit(37, 'add', `size[${frame.new_parent}]: ${before} + ${amount} = ${size[frame.new_parent]}`, {
        transfer: {from: x, to: frame.new_parent, before, amount, after: size[frame.new_parent]},
      });
    } else finished.push(x);
    frames.pop();
  }
  emit(39, 'start', 'dfs(0)');
  dfs(0);
  emit(40, 'done', `size = [${size.join(', ')}]`);
  return {original: {parent, s}, answer: [...size], steps};
}

module.exports = {3331: {
  id: 3331, title: bi('Find Subtree Sizes After Changes', 'Find Subtree Sizes After Changes'),
  titleVi: bi('Kích thước cây con sau khi đổi cha', 'Subtree sizes after reparenting'),
  slug: 'find-subtree-sizes-after-changes', difficulty: 'medium',
  category: {key: 'tree', vi: 'Cây', en: 'Tree'}, tags: [{key: 'dfs', vi: 'DFS', en: 'DFS'}],
  statement: bi('Mỗi node đổi cha sang tổ tiên gần nhất cùng chữ trên cây gốc; nếu không có thì giữ cha. Các thay đổi diễn ra đồng thời. Trả về kích thước cây con mới của từng node.', 'Each node moves to its nearest same-letter ancestor in the original tree, keeping its parent if none exists. All changes happen simultaneously. Return the new subtree sizes.'),
  defaultInput, inputKind: 'string', inputLabel: bi(`parent · tối đa ${maxNodes} node`, `parent · up to ${maxNodes} nodes`),
  extraParams: [{key: 's', type: 'string', label: bi('s · chữ trên node', 's · node labels'), default: defaultLabels}],
  visualizationLimits: {maxNodes}, debugMode: 'line-by-line',
  approach: [bi('DFS cây gốc: lưu last → duyệt con → khôi phục last → cộng size vào new_parent.', 'DFS the original tree: save last → visit children → restore last → add size to new_parent.')],
  complexity: {time: 'O(n)', space: 'O(n)'}, code, builder: build,
  liveArgs(input, params) { const {parent, s} = parse(input, params); return [parent, s]; },
}};
