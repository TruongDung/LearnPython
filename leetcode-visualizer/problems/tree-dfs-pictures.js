'use strict';

const { runTrace } = require('./wasm-picture-trace');
const legacy = require('./tree');
const bi = (vi, en) => ({ vi, en });
const clone = value => JSON.parse(JSON.stringify(value));
const codes = {
  250: legacy[250].code,
  298: legacy[298].code,
  333: legacy[333].code,
  687: `class Solution:
    def longestUnivaluePath(self, root):
        self.best = 0

        def dfs(node):
            if not node:
                return 0
            left = dfs(node.left)
            right = dfs(node.right)
            left_arrow = 0
            right_arrow = 0
            if node.left and node.left.val == node.val:
                left_arrow = left + 1
            if node.right and node.right.val == node.val:
                right_arrow = right + 1

            # Join both arms here, but return only one arm.
            self.best = max(self.best, left_arrow + right_arrow)
            return max(left_arrow, right_arrow)

        dfs(root)
        return self.best`.split('\n'),
  979: legacy[979].code,
  1372: legacy[1372].code,
  549: `class Solution:
    def longestConsecutive(self, root):
        self.best = 0

        def dfs(node):
            if not node:
                return 0, 0

            left_inc, left_dec = dfs(node.left)
            right_inc, right_dec = dfs(node.right)
            inc = dec = 1

            # Lengths start at this node and go downward.
            if node.left:
                if node.left.val == node.val + 1:
                    inc = max(inc, left_inc + 1)
                if node.left.val == node.val - 1:
                    dec = max(dec, left_dec + 1)

            if node.right:
                if node.right.val == node.val + 1:
                    inc = max(inc, right_inc + 1)
                if node.right.val == node.val - 1:
                    dec = max(dec, right_dec + 1)

            # Count the joining node only once.
            self.best = max(self.best, inc + dec - 1)
            return inc, dec

        dfs(root)
        return self.best`.split('\n'),
};

function parse(input) {
  let values = input;
  if (typeof values === 'string') {
    const raw = values.trim();
    try {
      values = raw.startsWith('[') ? JSON.parse(raw) : raw ? raw.split(',').map(token => {
        const value = token.trim();
        return /^(null|none)$/i.test(value) ? null : value ? Number(value) : NaN;
      }) : [];
    } catch { values = null; }
  }
  if (!Array.isArray(values) || values.length > 63 || values.some(value => value !== null &&
      (!Number.isInteger(value) || Math.abs(value) > 1e9))) {
    throw new RangeError('Use level-order integers (−10⁹…10⁹) and null; at most 31 connected nodes in the visual demo.');
  }
  const nodes = [], byId = new Map();
  let index = 1;
  if (values.length && values[0] !== null) {
    nodes.push({ id: '0:0', value: values[0], left: null, right: null, parent: null, depth: 0 });
    byId.set('0:0', nodes[0]);
  } else if (values.some(value => value !== null)) {
    throw new RangeError('Every node must be connected to a root.');
  }
  for (let head = 0; head < nodes.length && index < values.length; head++) {
    for (const side of ['left', 'right']) {
      if (index >= values.length) break;
      const value = values[index], id = `0:${index++}`;
      if (value === null) continue;
      const child = { id, value, left: null, right: null, parent: nodes[head].id, depth: nodes[head].depth + 1 };
      nodes[head][side] = id;
      nodes.push(child);
      byId.set(id, child);
    }
  }
  if (nodes.length > 31 || values.slice(index).some(value => value !== null)) {
    throw new RangeError('Use at most 31 connected nodes in the visual demo.');
  }
  const stack = [];
  let node = nodes[0], rank = 0;
  while (node || stack.length) {
    while (node) { stack.push(node); node = byId.get(node.left); }
    node = stack.pop(); node.rank = rank++;
    node = byId.get(node.right);
  }
  return { values: [...values], nodes, byId };
}

function build(id, input) {
  const { values, nodes, byId } = parse(input), code = codes[id];
  if (id === 979 && (nodes.some(node => node.value < 0) || nodes.reduce((sum, node) => sum + node.value, 0) !== nodes.length)) {
    throw new RangeError('Coin counts must be nonnegative; total coins must equal the number of nodes.');
  }
  const method = { 250: 'countUnivalSubtrees', 298: 'longestConsecutive', 333: 'largestBSTSubtree',
    549: 'longestConsecutive', 687: 'longestUnivaluePath', 979: 'distributeCoins', 1372: 'longestZigZag' }[id];
  const trace = runTrace({ code: code.join('\n'), method, args: [values], treeArgs: [0], stateClasses: ['Solution'] });
  const summaries = {}, chains = {}, comparisons = {};
  let best = 0, bestIds = [], bestRoot = null;
  const counted = [], flows = [];
  const subtree = root => root === null ? [] : [root, ...subtree(byId.get(root).left), ...subtree(byId.get(root).right)];
  const steps = trace.events.map((record, index) => {
    const local = record.locals, source = code[record.line - 1].trim();
    const node = record.scope === 'dfs' ? local.node?.id ?? null : null;
    const current = byId.get(node), parent = current?.parent ?? null;
    const final = index === trace.events.length - 1;
    const frames = record.frames.filter(frame => frame.name === 'dfs').map(frame => ({
      node: frame.locals.node?.id ?? null, value: frame.locals.node?.val ?? null,
      length: frame.locals.length ?? null,
    }));
    let event = 'visit', check = null, returned = null, chain = [], incChain = [], decChain = [];
    let leftPath = [], rightPath = [], returnPath = [], added = null;
    if (source === 'if not node:') event = record.branch ? 'empty' : 'visit';
    if (id === 298) {
      if (source === 'if node.val == parent_val + 1:') {
        event = 'check'; comparisons[node] = record.branch;
      }
      if (source === 'length += 1' || source === 'length = 1') {
        event = source.includes('+=') ? 'extend' : 'reset';
        chains[node] = event === 'extend' ? [...(chains[parent] || []), node] : [node];
      }
      chain = chains[node] || chains[parent] || [];
      if (current && comparisons[node] !== undefined) {
        check = { parent, parentValue: local.parent_val, value: current.value, passed: comparisons[node] };
      }
      const actual = local.self?.longest ?? record.outer.self?.longest ?? 0;
      if (source === 'self.longest = max(self.longest, length)') {
        event = 'best';
        if (actual > best) { bestIds = [...chain]; bestRoot = bestIds[0]; }
      }
      best = actual;
    } else if (id === 333) {
      if (source.startsWith('if left_bst and')) event = 'check';
      if (current && local.left_bst !== undefined && local.right_bst !== undefined) {
        check = {
          leftBst: local.left_bst, rightBst: local.right_bst,
          leftMax: local.left_max, value: current.value, rightMin: local.right_min,
        };
        // Python encodes infinities as strings; empty children impose no bound.
        check.passed = local.left_bst && local.right_bst &&
          (current.left === null || local.left_max < current.value) &&
          (current.right === null || current.value < local.right_min);
      }
      if (source === 'size = left_size + 1 + right_size') event = 'combine';
      const actual = local.best ?? record.outer.best ?? 0;
      if (source === 'best = max(best, size)') {
        event = 'best';
        if (actual > best) { bestRoot = node; bestIds = subtree(node); }
      }
      best = actual;
    } else if (id === 549) {
      if (source === 'inc = dec = 1') { event = 'reset'; chains[node] = { inc: [node], dec: [node] }; }
      const match = source.match(/^(inc|dec) = max\(\1, (left|right)_(inc|dec) \+ 1\)$/);
      if (match) {
        event = 'extend';
        const [, direction, side] = match, child = current[side];
        if (local[direction] > chains[node][direction].length) {
          chains[node][direction] = [node, ...chains[child][direction]];
        }
      }
      if (source.startsWith('if node.') && source.includes('.val ==')) {
        event = 'check';
        const side = source.includes('node.left') ? 'left' : 'right', child = byId.get(current[side]);
        check = { parent: node, child: child.id, parentValue: current.value, value: child.value,
          direction: source.includes('+ 1') ? 'inc' : 'dec', passed: record.branch };
      }
      incChain = chains[node]?.inc || [];
      decChain = chains[node]?.dec || [];
      chain = [...decChain].reverse().concat(incChain.slice(1));
      const actual = local.self?.best ?? record.outer.self?.best ?? 0;
      if (source === 'self.best = max(self.best, inc + dec - 1)') {
        event = 'combine';
        if (actual > best) { bestRoot = node; bestIds = [...chain]; }
      }
      best = actual;
    } else if (id === 687) {
      if (source === 'left_arrow = 0') chains[node] = { left: [node], right: [node] };
      if (source === 'left_arrow = 0' || source === 'right_arrow = 0') event = 'reset';
      if (source.startsWith('if node.')) {
        event = 'check';
        const side = source.includes('node.left') ? 'left' : 'right', child = byId.get(current[side]);
        check = { side, child: child?.id ?? null, value: child?.value ?? null, parentValue: current.value, passed: record.branch };
      }
      if (source === 'left_arrow = left + 1' || source === 'right_arrow = right + 1') {
        event = 'extend';
        const side = source.startsWith('left') ? 'left' : 'right';
        chains[node][side] = [node, ...chains[current[side]].returned];
      }
      leftPath = chains[node]?.left || []; rightPath = chains[node]?.right || [];
      chain = [...leftPath].reverse().concat(rightPath.slice(1));
      if (local.left_arrow !== undefined && local.right_arrow !== undefined) {
        returnPath = local.left_arrow >= local.right_arrow ? leftPath : rightPath;
      }
      const actual = local.self?.best ?? record.outer.self?.best ?? 0;
      if (source === 'self.best = max(self.best, left_arrow + right_arrow)') {
        event = 'combine';
        if (actual > best || !bestIds.length) { bestRoot = node; bestIds = [...chain]; }
      }
      best = actual;
      if (record.returning && current) chains[node].returned = [...returnPath];
    } else if (id === 1372) {
      if (source === 'go_left = 1 + left_r') {
        event = 'extend';
        chains[node] = { left: current.left === null ? [node] : [node, ...chains[current.left].right], right: [] };
      }
      if (source === 'go_right = 1 + right_l') {
        event = 'extend';
        chains[node].right = current.right === null ? [node] : [node, ...chains[current.right].left];
      }
      leftPath = chains[node]?.left || []; rightPath = chains[node]?.right || [];
      chain = (local.go_left ?? -1) >= (local.go_right ?? -1) ? leftPath : rightPath;
      returnPath = chain;
      const actual = local.self?.best ?? record.outer.self?.best ?? 0;
      if (source === 'self.best = max(self.best, go_left, go_right)') {
        event = 'best';
        if (actual > best || !bestIds.length) { bestRoot = node; bestIds = [...chain]; }
      }
      best = actual;
    } else if (id === 979) {
      if (source === 'self.moves += abs(left) + abs(right)') {
        event = 'flow'; added = Math.abs(local.left) + Math.abs(local.right);
        for (const side of ['left', 'right']) if (current[side] !== null) {
          const balance = local[side];
          flows.push({ parent: node, child: current[side], balance, coins: Math.abs(balance), step: index });
        }
      }
      best = local.self?.moves ?? record.outer.self?.moves ?? 0;
    } else if (id === 250) {
      if (source.startsWith('left_matches =') || source.startsWith('right_matches =') || source === 'if is_uni:') event = 'check';
      if (local.left_matches !== undefined && local.right_matches !== undefined) {
        check = { leftUni: local.left_is_uni, rightUni: local.right_is_uni,
          leftMatch: local.left_matches, rightMatch: local.right_matches, passed: local.is_uni ?? null };
      }
      if (source === 'count += 1') { event = 'count'; counted.push(node); }
      best = local.count ?? record.outer.count ?? 0;
      chain = current && local.is_uni === true ? subtree(node) : [];
    }
    if (record.returning && record.scope === 'dfs') {
      event = 'return'; returned = record.returned;
      if (current) summaries[node] = id === 333 ? { bst: returned[0], min: returned[1], max: returned[2], size: returned[3] }
        : id === 549 ? { inc: returned[0], dec: returned[1] } : id === 1372 ? { goLeft: returned[0], goRight: returned[1] }
        : id === 687 ? { gain: returned } : id === 979 ? { balance: returned } : id === 250 ? { uni: returned } : { length: local.length };
    }
    const received = side => id === 333 ? local[`${side}_bst`] === undefined ? null : {
      bst: local[`${side}_bst`], min: local[`${side}_min`], max: local[`${side}_max`], size: local[`${side}_size`],
    } : id === 549 && local[`${side}_inc`] !== undefined ? {
      inc: local[`${side}_inc`], dec: local[`${side}_dec`],
    } : id === 687 || id === 979 ? local[side] === undefined ? null : { gain: local[side] }
      : id === 1372 && local[`${side}_l`] !== undefined ? { goLeft: local[`${side}_l`], goRight: local[`${side}_r`] }
      : id === 250 && local[`${side}_is_uni`] !== undefined ? { uni: local[`${side}_is_uni`] } : null;
    const view = { id, nodes, line: record.line, source, scope: record.scope, event: final ? 'done' : event,
      current: node, frames, parent, check, chain, incChain, decChain, best, bestIds, bestRoot,
      length: local.length ?? null, inc: local.inc ?? null, dec: local.dec ?? null,
      size: local.size ?? null, left: received('left'), right: received('right'), returned,
      leftPath, rightPath, returnPath, leftArrow: local.left_arrow ?? null, rightArrow: local.right_arrow ?? null,
      goLeft: local.go_left ?? null, goRight: local.go_right ?? null, added, flows, counted,
      isUni: local.is_uni ?? null, leftMatches: local.left_matches ?? null, rightMatches: local.right_matches ?? null,
      summaries: clone(summaries), answer: final ? trace.answer : null, final };
    return { arr: [], codeLines: [record.line], final, title: bi(`Dòng ${record.line} · ${record.scope}`, `Line ${record.line} · ${record.scope}`),
      note: bi('', ''), vars: Object.entries(local).map(([name, value]) => ({ name, value })), treeDfsPicture: clone(view) };
  });
  return { original: values, answer: trace.answer, steps };
}

module.exports = Object.fromEntries([250, 298, 333, 549, 687, 979, 1372].map(id => [id, {
  ...legacy[id], debugMode: 'line-by-line', code: codes[id], builder: input => build(id, input), allowEmptyInput: true,
  defaultInput: id === 549 ? '3,2,4,1,null,null,5' : legacy[id].defaultInput,
  inputLabel: bi('Cây level-order · tối đa 31 nút · null = rỗng', 'Level-order tree · up to 31 nodes · null = empty'),
  statement: id === 549 ? bi('Tìm đường đi dài nhất tăng hoặc giảm đúng 1 mỗi bước. Có thể nối hai nhánh qua một nút.',
    'Find the longest path whose values consistently increase or decrease by one. It may join two branches through a node.') : legacy[id].statement,
  approach: [id === 250 ? bi('Hai cây con đồng giá trị + khớp nút cha → count + 1.', 'Two uniform child subtrees + matching child values → count + 1.')
    : id === 687 ? bi('Ghép hai nhánh cùng giá trị: left_arrow + right_arrow. Trả lên cha một nhánh dài hơn.', 'Join matching arms: left_arrow + right_arrow. Return only the longer arm.')
    : id === 979 ? bi('Dư xu → gửi lên. Thiếu xu → nhận xuống. Mỗi xu qua một cạnh tốn một lượt.', 'Surplus → send up. Deficit → receive down. One coin across one edge costs one move.')
    : id === 1372 ? bi('Đi trái → tiếp tục phải. Đi phải → tiếp tục trái. Độ dài tính bằng số cạnh.', 'Go left → continue right. Go right → continue left. Length counts edges.')
    : id === 298 ? bi('Con = cha + 1 → nối chuỗi. Khác → bắt đầu lại từ 1.', 'Child = parent + 1 → extend. Otherwise → restart at 1.')
    : id === 333 ? bi('Hai con là BST và max(trái) < nút < min(phải) → gộp.', 'Both children are BSTs and max(left) < node < min(right) → combine.')
    : bi('inc: nhánh xuống tăng 1. dec: nhánh xuống giảm 1. Ghép: inc + dec − 1.', 'inc: downward +1. dec: downward −1. Join: inc + dec − 1.')],
  liveArgs: input => [{ __viz_type: 'binary_tree', values: parse(input).values, tree_id: 'root' }],
}]));
