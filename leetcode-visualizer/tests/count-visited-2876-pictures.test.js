const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[2876];
const run = edges => problem.builder(JSON.stringify(edges));
const view = step => step.visited2876View;
const examples = [
  [1, 2, 0, 0], [1, 2, 3, 4, 0], [1, 2, 0, 0, 3, 4, 3],
  [1, 0, 3, 4, 2, 4, 5, 0], [0], [1, 0],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 10],
  Array(12).fill(0), Array.from({ length: 12 }, (_, i) => (i + 1) % 12),
];
function oracle(edges) {
  return edges.map((_, start) => {
    const seen = new Set();
    for (let node = start; !seen.has(node); node = edges[node]) seen.add(node);
    return seen.size;
  });
}
function renderer() {
  const host = { innerHTML: '', dataset: {}, clientWidth: 560 };
  const ctx = { $: () => host, lang: 'vi' };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-count-visited-2876.js'), 'utf8'), ctx);
  return { host, ctx };
}

test('2876 matches independent walks for every functional graph up to four nodes', () => {
  let checked = 0;
  for (let n = 1; n <= 4; n++) {
    for (let encoded = 0; encoded < n ** n; encoded++) {
      let remaining = encoded;
      const edges = Array.from({ length: n }, () => { const target = remaining % n; remaining = Math.floor(remaining / n); return target; });
      assert.deepEqual(run(edges).answer, oracle(edges));
      checked++;
    }
  }
  assert.equal(checked, 288);
  assert.deepEqual(run(examples[0]).answer, [3, 3, 3, 4]);
});

test('2876 snapshots preserve pruning, cycle assignments, and reverse dependencies', () => {
  for (const edges of examples) {
    const result = run(edges), assigned = new Set();
    assert.deepEqual(result.answer, oracle(edges));
    result.steps.forEach((step, index) => {
      const v = view(step);
      assert.equal(v.frame, index + 1);
      assert.deepEqual(v.edges, edges);
      assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
      if (v.event === 'decrement') {
        assert.equal(v.change.from - 1, v.change.to);
        assert.equal(v.indegree[v.next], v.change.to);
        assert.equal(v.edges[v.current], v.next);
      }
      if (v.event === 'prune') assert.ok(v.pruned.includes(v.current));
      if (v.event === 'cycle') for (const node of v.cycle) {
        assert.equal(v.answer[node], v.cycle.length);
        assert.ok(v.cycle.includes(edges[node]));
      }
      if (v.event === 'assign') {
        assert.ok(v.answer[v.next] > 0);
        assert.equal(v.answer[v.current], 1 + v.answer[v.next]);
        assert.equal(v.current, view(result.steps.at(-1)).removed.at(-1 - assigned.size));
        assigned.add(v.current);
        assert.match(problem.code[step.codeLines.at(-1) - 1], /answer\[node\] = 1 \+ answer/);
      }
    });
    assert.deepEqual(view(result.steps[0]).answer, Array(edges.length).fill(0));
    assert.deepEqual(view(result.steps.at(-1)).answer, result.answer);
    assert.ok(result.steps.at(-1).final);
  }
});

test('2876 displayed Python agrees on official examples, disconnected loops, and size limits', () => {
  const script = `import json,sys\nfrom typing import List\np=json.load(sys.stdin)\nexec(p['code'])\nprint(json.dumps([Solution().countVisitedNodes(e) for e in p['cases']]))`;
  const python = spawnSync(process.env.PYTHON || 'python3', ['-c', script], {
    input: JSON.stringify({ code: problem.code.join('\n'), cases: examples }), encoding: 'utf8',
  });
  assert.equal(python.status, 0, python.stderr);
  assert.deepEqual(JSON.parse(python.stdout), examples.map(edges => run(edges).answer));
});

test('2876 each picture keeps every node and edge, in both languages, without mutating steps', () => {
  const { ctx, host } = renderer();
  for (const edges of examples) {
    const result = run(edges), before = JSON.stringify(result);
    for (const language of ['vi', 'en']) {
      ctx.lang = language;
      for (const step of result.steps) {
        ctx.renderCountVisited2876Pictures(step);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
        assert.equal((host.innerHTML.match(/data-node="/g) || []).length, edges.length);
        assert.equal((host.innerHTML.match(/data-edge="/g) || []).length, edges.length);
      }
    }
    const last = result.steps.at(-1);
    for (let node = 0; node < edges.length; node++) {
      host.dataset.v2876Selected = String(node);
      host.dataset.v2876Progress = String(edges.length + 1);
      ctx.renderCountVisited2876Pictures(last);
      assert.match(host.innerHTML, new RegExp(`data-v2876-count="${result.answer[node]}"`));
      host.dataset.v2876Progress = '1';
      ctx.renderCountVisited2876Pictures(last);
      assert.match(host.innerHTML, /data-v2876-count="1"/);
    }
    assert.equal(JSON.stringify(result), before);
  }
});

test('2876 layouts and selectable walks handle long tails, self loops, and crowded branches', () => {
  const { ctx } = renderer();
  let seed = 2876;
  const rand = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  const cases = [...examples, ...Array.from({ length: 50 }, () => { const n = 1 + rand(12); return Array.from({ length: n }, () => rand(n)); })];
  for (const edges of cases) {
    const layout = ctx.visited2876Layout(edges);
    assert.equal(layout.positions.length, edges.length);
    layout.positions.forEach((p, node) => {
      assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
      assert.ok(p.x >= 28 && p.x + 28 <= layout.width);
      assert.ok(p.y >= 50 && p.y + 50 <= layout.height);
      layout.positions.slice(node + 1).forEach(q => assert.ok(Math.hypot(p.x - q.x, p.y - q.y) >= 58));
    });
    layout.walks.forEach((walk, start) => {
      assert.equal(walk.nodes[0], start);
      assert.equal(walk.nodes.length, oracle(edges)[start]);
      assert.equal(walk.nodes[walk.cycleAt], walk.repeat);
      assert.equal(edges[walk.nodes.at(-1)], walk.repeat);
    });
  }
});

test('2876 assets load on demand and invalid inputs retain validation', () => {
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  assert.match(html, /count-visited-2876\.css\?v=pictures-v1/);
  assert.match(html, /renderer-count-visited-2876\.js\?v=pictures-v1/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ''), /renderer-count-visited-2876\.js/);
  for (const input of ['[]', '[-1]', '[1]', '[0,2]', '[0.5]', 'oops', JSON.stringify(Array(13).fill(0))]) assert.throws(() => problem.builder(input));
});
