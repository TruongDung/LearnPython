'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[1976];
const input = roads => roads.map(edge => edge.join(',')).join(';');
const build = (n, roads) => problem.builder(input(roads), { n });
const cases = [
  [7, problem.defaultInput.split(';').map(s => s.split(',').map(Number))],
  [4, [[0, 1, 1], [0, 2, 1], [1, 3, 1], [2, 3, 1]]],
  [4, [[0, 3, 9], [0, 1, 1], [1, 2, 1], [2, 3, 1]]],
  [4, [[0, 1, 2], [2, 3, 1]]], [1, []],
  [4, [[0, 1, 1000000000], [1, 2, 1000000000], [2, 3, 1000000000]]],
];
function renderer() {
  const host = { innerHTML: '', dataset: {}, clientWidth: 560 };
  const ctx = { $: () => host, lang: 'vi' };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-shortest-ways-1976.js'), 'utf8'), ctx);
  return { host, ctx };
}
function oracle(n, roads) {
  const graph = Array.from({ length: n }, () => []);
  roads.forEach(([u, v, w]) => { graph[u].push([v, w]); graph[v].push([u, w]); });
  let best = Infinity, count = 0;
  function visit(node, time, seen) {
    if (time > best) return;
    if (node === n - 1) {
      if (time < best) { best = time; count = 0; }
      if (time === best) count++;
      return;
    }
    for (const [next, w] of graph[node]) if (!seen.has(next)) visit(next, time + w, new Set([...seen, next]));
  }
  visit(0, 0, new Set([0]));
  return { time: best, count };
}

test('1976 route pictures agree with independent simple-path enumeration, including unreachable and zero-edge routes', () => {
  const { ctx } = renderer();
  let seed = 1976;
  const rand = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  const samples = [...cases];
  for (let sample = 0; sample < 45; sample++) {
    const n = 2 + rand(5), roads = [];
    for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (rand(3)) roads.push([u, v, 1 + rand(5)]);
    if (!roads.length) roads.push([0, 1, 1]);
    samples.push([n, roads]);
  }
  for (const [n, roads] of samples) {
    const run = build(n, roads), v = run.steps.at(-1).countPaths1976View;
    const expected = oracle(n, roads), analysis = ctx.ways1976Routes(v);
    assert.equal(run.answer, expected.count);
    assert.equal(analysis.total, String(expected.count));
    assert.equal(analysis.routes.length, Math.min(8, expected.count));
    for (const route of analysis.routes) {
      assert.equal(route.nodes[0], 0); assert.equal(route.nodes.at(-1), n - 1);
      assert.equal(new Set(route.nodes).size, route.nodes.length);
      assert.equal(route.time, expected.time);
      route.edges.forEach((edge, i) => {
        const [u, w, cost] = roads[edge], a = route.nodes[i], b = route.nodes[i + 1];
        assert.ok(u === a && w === b || u === b && w === a);
        assert.equal(route.weights[i], cost);
      });
    }
  }
});

test('1976 renders exact distances, counts, roads and heap entries in both themes languages without changing snapshots', () => {
  const { ctx, host } = renderer();
  for (const [n, roads] of cases) {
    const result = build(n, roads), before = JSON.stringify(result);
    for (const language of ['vi', 'en']) {
      ctx.lang = language;
      for (const step of result.steps) {
        const v = step.countPaths1976View;
        ctx.renderShortestWays1976Pictures(step);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
        assert.equal((host.innerHTML.match(/data-road="/g) || []).length, roads.length);
        const values = [...host.innerHTML.matchAll(/data-node="(\d+)" data-distance="([^"]+)" data-ways="(\d+)"/g)];
        assert.equal(values.length, n);
        values.forEach(([, node, time, ways]) => { assert.equal(time, v.nodes[node].distance); assert.equal(Number(ways), v.nodes[node].ways); });
        const heap = [...host.innerHTML.matchAll(/data-heap-entry="([^"]+)"/g)].map(m => m[1].split(',').map(Number));
        assert.deepEqual(heap, step.final ? [] : v.heap.map(item => [item.time, item.node]));
      }
    }
    assert.equal(JSON.stringify(result), before);
  }
});

test('1976 exact path counting is bounded in pictures and distinguishes the returned modulo count', () => {
  const { ctx, host } = renderer();
  const roads = [];
  for (let u = 0; u < 29; u++) for (let copy = 0; copy < 3; copy++) roads.push([u, u + 1, 1]);
  const result = build(30, roads), last = result.steps.at(-1), analysis = ctx.ways1976Routes(last.countPaths1976View);
  const total = 3n ** 29n;
  assert.equal(analysis.total, total.toString());
  assert.equal(BigInt(result.answer), total % 1000000007n);
  assert.equal(analysis.capped, true); assert.equal(analysis.routes.length, 8);
  ctx.renderShortestWays1976Pictures(last);
  assert.match(host.innerHTML, /10⁹\+7/);
  assert.ok(host.innerHTML.length < 110000);
});

test('1976 selecting a route and advancing its car uses cumulative edge times', () => {
  const { ctx, host } = renderer(), [n, roads] = cases[0];
  const last = build(n, roads).steps.at(-1), options = ctx.ways1976Routes(last.countPaths1976View);
  ctx.renderShortestWays1976Pictures(last);
  options.routes.forEach((route, selected) => {
    for (let progress = 0; progress <= route.edges.length; progress++) {
      host.dataset.sw1976Selected = String(selected); host.dataset.sw1976WalkPosition = String(progress);
      ctx.renderShortestWays1976Pictures(last);
      const expected = route.weights.slice(0, progress).reduce((sum, w) => sum + w, 0);
      assert.match(host.innerHTML, new RegExp(`data-sw1976-elapsed="${expected}"`));
      assert.match(host.innerHTML, /data-answer="4"/);
    }
  });
});

test('1976 default map keeps weight labels outside node badges and SVG positions finite at the size limit', () => {
  const { ctx } = renderer();
  const [n, roads] = cases[0], view = build(n, roads).steps.at(-1).countPaths1976View;
  const layout = ctx.ways1976Layout(view);
  for (const { label } of layout.curves) for (const p of layout.positions) {
    const overlap = label.x < p.x + layout.labelWidth / 2 && label.x + label.w > p.x - layout.labelWidth / 2 && label.y < p.y + 55 && label.y + label.h > p.y - 55;
    assert.equal(overlap, false);
  }
  const chain = Array.from({ length: 29 }, (_, i) => [i, i + 1, 1000000000]);
  const big = ctx.ways1976Layout(build(30, chain).steps.at(-1).countPaths1976View);
  assert.equal(big.positions.length, 30);
  for (const p of big.positions) assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y) && p.x > 50 && p.y > 60 && p.x < big.width - 45 && p.y < big.height - 55);
  assert.ok(big.curves.every(curve => !/NaN|Infinity/.test(curve.path)));
});
