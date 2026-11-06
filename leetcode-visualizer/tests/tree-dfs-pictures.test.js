const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');
const { runTrace } = require('../problems/wasm-picture-trace');

function tree(input) {
  const values = Array.isArray(input) ? input : !input.trim() ? [] : input.trim().startsWith('[')
    ? JSON.parse(input) : input.split(',').map(value => value.trim() === 'null' ? null : Number(value));
  const root = values.length && values[0] !== null ? { val: values[0], left: null, right: null, parent: null } : null;
  const nodes = root ? [root] : [];
  let index = 1;
  for (let head = 0; head < nodes.length; head++) for (const side of ['left', 'right']) {
    if (index < values.length && values[index] !== null) {
      const node = { val: values[index], left: null, right: null, parent: nodes[head] };
      nodes[head][side] = node; nodes.push(node);
    }
    index++;
  }
  return { values, nodes };
}

// Deliberately enumerate paths / validate each complete subtree independently.
function oracle(id, input) {
  const { nodes } = tree(input);
  let best = 0;
  for (const start of nodes) {
    if (id === 250 || id === 979) {
      const descendants = [start];
      for (let i = 0; i < descendants.length; i++) descendants.push(...[descendants[i].left, descendants[i].right].filter(Boolean));
      if (id === 250 && descendants.every(node => node.val === start.val)) best++;
      if (id === 979 && start.parent) best += Math.abs(descendants.reduce((sum, node) => sum + node.val - 1, 0));
    } else if (id === 1372) {
      const walk = (node, previousDirection, length) => {
        best = Math.max(best, length);
        for (const direction of ['left', 'right']) if (direction !== previousDirection && node[direction]) walk(node[direction], direction, length + 1);
      };
      walk(start, null, 0);
    } else if (id === 333) {
      let count = 0;
      const valid = (node, low, high) => !node || node.val > low && node.val < high &&
        (++count, valid(node.left, low, node.val) && valid(node.right, node.val, high));
      if (valid(start, -Infinity, Infinity)) best = Math.max(best, count);
    } else {
      const walk = (node, previous, length) => {
        best = Math.max(best, length);
        for (const next of id === 298 ? [node.left, node.right] : [node.left, node.right, node.parent]) {
          if (next && next !== previous && next.val === node.val + (id === 687 ? 0 : 1)) walk(next, node, length + 1);
        }
      };
      walk(start, null, id === 687 ? 0 : 1);
    }
  }
  return best;
}

const fixtures = {
  250: [['5,1,5,5,5,null,5', 4], ['1,1,1,1,1,1,1', 7], ['1,1,1,1,2', 3], ['7', 1], ['[]', 0], ['-1,-1,-1', 3]],
  298: [['', 0], ['7', 1], ['1,2,9,3,8,10,11,4', 4], ['2,null,3,null,4', 3],
    ['-2,-1,5,0', 3], ['2,1,3', 2], ['1,1,1', 1], ['1,null,3,2,4,null,null,null,5', 3]],
  333: [['10,5,15,1,8,null,7', 3], ['4,2,6,1,3,5,7', 7], ['1', 1], ['[]', 0],
    ['2,2,3', 1], ['5,4,6,null,null,3', 2], ['10,5,15,1,12', 3], ['-2,-3,-1', 3]],
  549: [['3,2,4,1,null,null,5', 5], ['2,1,3', 3], ['2,3,3,4,null,null,4', 3],
    ['1', 1], ['[]', 0], ['1,1,1', 1], ['-1,-2,0,-3,null,null,1', 5], ['2,1,4', 2]],
  687: [['5,4,5,1,1,null,5', 2], ['1,4,5,4,4,null,5', 2], ['1,1,1,1,1,1,1', 4],
    ['9,1,8,1,1', 2], ['7', 0], ['[]', 0], ['1,2,3', 0], ['-1,null,-1,null,-1', 2]],
  979: [['3,0,0', 2], ['0,3,0', 3], ['1,0,2', 2], ['1,0,0,null,3', 4], ['1', 0], ['[]', 0], ['0,0,0,0,0,0,7', 16]],
  1372: [['1,2,3,null,4,7,null,5,null,null,null,null,6', 4], ['1,2,null,3,null,4', 1],
    ['1,1,null,null,1,1,null,null,1', 4], ['7', 0], ['[]', 0], ['1,2,3,4,5,6,7', 2]],
};

const ids = [250, 298, 333, 549, 687, 979, 1372];
const methods = {250: 'countUnivalSubtrees', 298: 'longestConsecutive', 333: 'largestBSTSubtree',
  549: 'longestConsecutive', 687: 'longestUnivaluePath', 979: 'distributeCoins', 1372: 'longestZigZag'};
for (const id of ids) {
  const problem = SUPPORTED[id];
  test(`${id} registers real Python debug and runnable tree arguments`, () => {
    assert.equal(problem.debugMode, 'line-by-line');
    assert.deepEqual(problem.liveArgs('1,null,2'), [{ __viz_type: 'binary_tree', values: [1, null, 2], tree_id: 'root' }]);
    for (const [input, answer] of fixtures[id]) assert.equal(problem.builder(input).answer, answer, input);
  });

  test(`${id} agrees with an independent enumeration oracle on deterministic trees`, () => {
    let seed = id;
    for (let trial = 0; trial < 30; trial++) {
      const size = 1 + trial % 15;
      const values = Array.from({ length: size }, () => {
        seed = (seed * 1664525 + 1013904223) >>> 0; return seed % 11 - 5;
      });
      if (id === 979) {
        values.fill(0);
        for (let coin = 0; coin < size; coin++) { seed = (seed * 1664525 + 1013904223) >>> 0; values[seed % size]++; }
      }
      assert.equal(problem.builder(values).answer, oracle(id, values), JSON.stringify(values));
    }
  });

  test(`${id} highlights and watches exactly match completed Python statements`, () => {
    for (const input of [problem.defaultInput, '[]', id === 979 ? '0,3,0' : '2,null,3,null,4']) {
      const run = problem.builder(input);
      const trace = runTrace({ code: problem.code.join('\n'), method: methods[id],
        args: [tree(input).values], treeArgs: [0], stateClasses: ['Solution'] });
      assert.equal(run.answer, trace.answer);
      assert.equal(run.steps.length, trace.events.length);
      run.steps.forEach((step, index) => {
        const record = trace.events[index], view = step.treeDfsPicture;
        assert.deepEqual(step.codeLines, [record.line]);
        assert.equal(view.source, problem.code[record.line - 1].trim());
        assert.equal(view.current, record.scope === 'dfs' ? record.locals.node?.id ?? null : null);
        assert.deepEqual(step.vars, Object.entries(record.locals).map(([name, value]) => ({ name, value })));
        assert.equal(view.best, id === 250 ? record.locals.count ?? record.outer.count ?? 0
          : id === 979 ? record.locals.self?.moves ?? record.outer.self?.moves ?? 0
          : id === 298 ? record.locals.self?.longest ?? record.outer.self?.longest ?? 0
          : id === 333 ? record.locals.best ?? record.outer.best ?? 0 : record.locals.self?.best ?? record.outer.self?.best ?? 0);
        assert.equal(view.final, index === trace.events.length - 1);
      });
    }
  });

  test(`${id} validates disconnected, oversized and invalid input`, () => {
    for (const input of ['1,nope,3', '[null,1]', '[true]', '[1, null, null, 2]', '[1.5]', Array(32).fill(1)]) {
      assert.throws(() => problem.builder(input), RangeError);
    }
    assert.equal(problem.builder(Array(31).fill(1)).answer, oracle(id, Array(31).fill(1)));
  });
}

test('298 never joins siblings and distinguishes extend from restart', () => {
  const run = SUPPORTED[298].builder(SUPPORTED[298].defaultInput);
  for (const { treeDfsPicture: v } of run.steps) {
    const nodes = new Map(v.nodes.map(node => [node.id, node]));
    for (const ids of [v.chain, v.bestIds]) ids.forEach((id, index) => {
      if (!index) return;
      assert.equal(nodes.get(id).parent, ids[index - 1]);
      assert.equal(nodes.get(id).value, nodes.get(ids[index - 1]).value + 1);
    });
    if (v.event === 'reset') assert.deepEqual(v.chain, [v.current]);
    if (v.event === 'extend') assert.equal(v.chain.length, v.length);
  }
  assert.equal(run.steps.at(-1).treeDfsPicture.bestIds.length, 4);
});

test('333 catches a deep ordering violation and propagates invalid children', () => {
  const run = SUPPORTED[333].builder('10,5,15,1,12');
  const root = run.steps.map(step => step.treeDfsPicture).find(v => v.event === 'check' && v.current === '0:0');
  assert.equal(root.left.max, 12); assert.equal(root.check.passed, false);
  assert.equal(run.steps.at(-1).treeDfsPicture.bestRoot, '0:1');
  const invalid = SUPPORTED[333].builder('10,5,15,8,2');
  assert.ok(invalid.steps.some(({ treeDfsPicture: v }) => v.event === 'check' && !v.check.leftBst && !v.check.passed));
  for (const { treeDfsPicture: v } of run.steps) if (v.event === 'return' && v.current) {
    const s = v.summaries[v.current];
    assert.deepEqual([s.bst, s.min, s.max, s.size], v.returned);
  }
});

test('549 joins two monotonic arms, counts the middle once, and never joins two increasing arms', () => {
  for (const [input] of fixtures[549]) {
    const run = SUPPORTED[549].builder(input), v = run.steps.at(-1).treeDfsPicture;
    assert.equal(v.bestIds.length, run.answer);
    assert.equal(new Set(v.bestIds).size, v.bestIds.length);
    const nodes = new Map(v.nodes.map(node => [node.id, node]));
    v.bestIds.forEach((id, index) => {
      if (!index) return;
      const previous = nodes.get(v.bestIds[index - 1]), node = nodes.get(id);
      assert.equal(node.value, previous.value + 1);
      assert.ok(node.parent === previous.id || previous.parent === node.id);
    });
  }
  assert.match(SUPPORTED[549].code.join('\n'), /node.left.val == node.val \+ 1/);
  assert.match(SUPPORTED[549].code.join('\n'), /node.right.val == node.val - 1/);
});

test('tree renderers cover actual states in English and Vietnamese without invalid output', () => {
  const host = { innerHTML: '' }, context = { lang: 'en', $: () => host,
    escapeHtml: value => String(value).replaceAll('<', '&lt;'), steps: [], stepIndex: 0 };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/renderer-tree-dfs-pictures.js'), 'utf8'), context);
  for (const id of ids) for (const language of ['en', 'vi']) for (const input of [SUPPORTED[id].defaultInput, '[]']) {
    context.lang = language; context.steps = SUPPORTED[id].builder(input).steps;
    context.steps.forEach((step, index) => {
      context.stepIndex = index; context.renderTreeDfsPicture(step);
      assert.match(host.innerHTML, /tdp-viz/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
      const v = step.treeDfsPicture;
      if (id === 333 && v.check && (!v.check.leftBst || !v.check.rightBst)) {
        assert.match(host.innerHTML, /BST\(L\)/);
        assert.match(host.innerHTML, /BST\(R\)/);
      }
      if (id === 549 && v.check && Math.abs(v.check.value - v.check.parentValue) === 1) {
        assert.doesNotMatch(host.innerHTML, /class="bad dashed"/);
      }
    });
  }
});

test('687 joins two arms only for best, returns one arm, and counts edges', () => {
  for (const [input] of fixtures[687]) {
    const run = SUPPORTED[687].builder(input);
    for (const {treeDfsPicture: v} of run.steps) {
      const nodes = new Map(v.nodes.map(node => [node.id, node]));
      assert.equal(v.bestIds.length ? v.bestIds.length - 1 : 0, v.best);
      for (const ids of [v.bestIds, v.chain]) ids.forEach((id, i) => {
        if (!i) return;
        const a = nodes.get(ids[i - 1]), b = nodes.get(id);
        assert.equal(a.value, b.value);
        assert.ok(a.parent === b.id || b.parent === a.id);
      });
      if (v.event === 'return' && v.current) {
        assert.equal(v.returned, Math.max(v.leftArrow, v.rightArrow));
        assert.equal(v.returnPath.length - 1, v.returned);
      }
    }
  }
  const root = SUPPORTED[687].builder('1,1,1,1,1,1,1').steps.map(s => s.treeDfsPicture)
    .find(v => v.event === 'return' && v.current === '0:0');
  assert.equal(root.best, 4); assert.equal(root.returned, 2);
});

test('1372 reconstructed paths alternate downward child edges even with repeated values', () => {
  for (const [input] of fixtures[1372]) for (const {treeDfsPicture: v} of SUPPORTED[1372].builder(input).steps) {
    const nodes = new Map(v.nodes.map(node => [node.id, node]));
    assert.equal(v.bestIds.length ? v.bestIds.length - 1 : 0, v.best);
    for (const path of [v.bestIds, v.leftPath, v.rightPath]) {
      let previous = null;
      path.forEach((id, i) => {
        if (!i) return;
        const parent = nodes.get(path[i - 1]), node = nodes.get(id);
        assert.equal(node.parent, parent.id);
        const direction = parent.left === id ? 'L' : 'R';
        assert.notEqual(direction, previous); previous = direction;
      });
    }
  }
});

test('979 records each child edge once, conserves coins and charges the absolute net flow', () => {
  for (const [input] of fixtures[979]) {
    const run = SUPPORTED[979].builder(input);
    for (const {treeDfsPicture: v} of run.steps) {
      assert.equal(new Set(v.flows.map(f => f.child)).size, v.flows.length);
      assert.equal(v.flows.reduce((sum, f) => sum + f.coins, 0), v.best);
      v.flows.forEach(flow => assert.equal(flow.coins, Math.abs(flow.balance)));
      if (v.event === 'return' && v.current === '0:0') assert.equal(v.returned, 0);
    }
    const v = run.steps.at(-1).treeDfsPicture;
    assert.equal(v.flows.length, Math.max(0, v.nodes.length - 1));
  }
  assert.throws(() => SUPPORTED[979].builder('1,0,0'), /total coins/);
  assert.throws(() => SUPPORTED[979].builder('1,-1,3'), /nonnegative/);
});

test('250 counts only nonempty uniform subtrees, including nested ones', () => {
  for (const [input] of fixtures[250]) for (const {treeDfsPicture: v} of SUPPORTED[250].builder(input).steps) {
    assert.equal(v.counted.length, v.best);
    assert.equal(new Set(v.counted).size, v.best);
    const nodes = new Map(v.nodes.map(node => [node.id, node]));
    for (const root of v.counted) {
      const queue = [root];
      for (let i = 0; i < queue.length; i++) {
        const node = nodes.get(queue[i]);
        assert.equal(node.value, nodes.get(root).value);
        queue.push(...[node.left, node.right].filter(id => id !== null));
      }
    }
    if (v.event === 'count') assert.equal(v.isUni, true);
  }
});

test('tree pictures are lazy loaded with scoped responsive styles', () => {
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  assert.match(html, /renderer-tree-dfs-pictures.js[^\n]+data-problem-ids="250 298 333 549 687 979 1372"/);
  assert.match(html, /tree-dfs-pictures.css[^\n]+data-problem-ids="250 298 333 549 687 979 1372"/);
  const css = fs.readFileSync(path.join(__dirname, '../public/tree-dfs-pictures.css'), 'utf8');
  assert.match(css, /@container \(max-width: 650px\)/);
  assert.match(css, /data-theme="light"/);
});
