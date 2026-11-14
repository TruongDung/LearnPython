'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const cutCases = [[7, [1, 3, 4, 5]], [9, [5, 6, 1, 4, 2]], [8, [3]], [10, [1, 2, 8, 9]], [5, []], [1, []], [1000000, [1, 2, 999999]]];
const stoneCases = [[6, 2, 3, 4, 5, 5], [7, 7, 7, 7], [2, 1, 1, 2], [9], [1, 2, 3], [3, 1, 2], [5, 1], [10000, 20000, 10000]];
const distributeCases = [
  [[1, 1, 2, 2, 3, 3, 3], [2, 3, 1]], [[1, 1, 1, 1, 2, 2, 2], [3, 2, 2]],
  [[1, 1, 2, 2, 3, 3], [3, 3]], [[1, 1, 1, 2, 2, 2, 3, 3], [2, 2, 2, 2]],
  [[-8, -8, 4, 4, 4, 12], [1, 2, 3]], [[1], [1]], [[1, 2], [2]],
  [[...Array(6).fill(1), ...Array(6).fill(2), ...Array(4).fill(3)], [4, 4, 3, 3, 2]],
];
function cutOracle(n, cuts) {
  let best = Infinity;
  function visit(done, remaining, cost) {
    if (!remaining.length) { best = Math.min(best, cost); return; }
    remaining.forEach((cut, i) => { const boundaries = [0, ...done, n].sort((a, b) => a - b), right = boundaries.findIndex(value => value > cut); visit([...done, cut], remaining.filter((_, j) => i !== j), cost + boundaries[right] - boundaries[right - 1]); });
  }
  visit([], cuts, 0); return best;
}
function stoneOracle(stones) {
  if (stones.length < 2) return 0;
  let best = 0;
  for (let split = 1; split < stones.length; split++) {
    const left = stones.slice(0, split), right = stones.slice(split), a = left.reduce((s, n) => s + n, 0), b = right.reduce((s, n) => s + n, 0);
    if (a <= b) best = Math.max(best, a + stoneOracle(left)); if (b <= a) best = Math.max(best, b + stoneOracle(right));
  }
  return best;
}
function distributeOracle(nums, quantity) {
  const counts = [...new Set(nums)].map(value => nums.filter(n => n === value).length);
  function place(i) { if (i === quantity.length) return true; for (let bucket = 0; bucket < counts.length; bucket++) if (counts[bucket] >= quantity[i]) { counts[bucket] -= quantity[i]; if (place(i + 1)) return true; counts[bucket] += quantity[i]; } return false; }
  return place(0);
}
function renderer() {
  const host = { innerHTML: '', dataset: {} }, context = { lang: 'vi', $: () => host };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-interval-decisions.js'), 'utf8'), context);
  return { host, ctx: context };
}
const plain = value => JSON.parse(JSON.stringify(value));

test('1547 compares cutting orders and replays only real current pieces, charging their lengths', () => {
  const { ctx } = renderer();
  for (const [n, cuts] of cutCases) {
    const run = SUPPORTED[1547].builder(cuts, { n }); assert.equal(run.answer, cutOracle(n, cuts));
    const v = run.steps.at(-1).cutStick1547View, plan = ctx.ipCutPlan(v.points, v.choice), boundaries = [0, n]; let total = 0;
    for (const cut of plan) { const sorted = [...boundaries].sort((a, b) => a - b), right = sorted.findIndex(value => value > cut.cut); assert.equal(cut.cost, sorted[right] - sorted[right - 1]); boundaries.push(cut.cut); total += cut.cost; assert.equal(cut.total, total); }
    assert.equal(total, run.answer); assert.deepEqual(Array.from(plan, item => item.cut).sort((a, b) => a - b), [...cuts].sort((a, b) => a - b));
    for (const step of run.steps) for (const option of step.cutStick1547View.options) assert.equal(option.cost, option.length + option.left + option.right);
  }
  assert.throws(() => SUPPORTED[1547].builder([1], { n: NaN }));
});

test('1563 keeps only the smaller sum or either tied sum, including the better future on ties', () => {
  const { ctx } = renderer();
  for (const stones of stoneCases) {
    const run = SUPPORTED[1563].builder(stones); assert.equal(run.answer, stoneOracle(stones));
    const v = run.steps.at(-1).stoneSplit1563View, plan = ctx.ipStonePlan(v); let total = 0;
    for (const turn of plan) { assert.ok(turn.side === 'left' ? turn.leftSum <= turn.rightSum : turn.rightSum <= turn.leftSum); total += turn.gain; assert.equal(turn.total, total); assert.equal(turn.gain, Math.min(turn.leftSum, turn.rightSum)); assert.ok(turn.next[1] - turn.next[0] < turn.right - turn.left); }
    assert.equal(total, run.answer);
    if (plan.length) assert.equal(plan.at(-1).next[0], plan.at(-1).next[1]);
  }
  for (const stones of [[1, 2, 3], [3, 1, 2]]) { const v = SUPPORTED[1563].builder(stones).steps.at(-1).stoneSplit1563View; const first = ctx.ipStonePlan(v)[0]; assert.equal(first.leftSum, first.rightSum); assert.equal(first.gain + Math.max(first.leftFuture, first.rightFuture), 4); }
  for (const stones of [[], [0], [-1], Array(11).fill(1)]) assert.throws(() => SUPPORTED[1563].builder(stones), /1563/);
});

test('1621 gallery enumerates every unique non-overlapping set and its stars-and-bars encoding', () => {
  const { ctx } = renderer();
  const choose = (n, k) => { let result = 1n; for (let i = 1; i <= k; i++) result = result * BigInt(n - k + i) / BigInt(i); return Number(result); };
  for (let n = 2; n <= 10; n++) for (let k = 1; k < n; k++) {
    const configs = ctx.ipSegmentConfigs(n, k), expected = choose(n + k - 1, 2 * k);
    assert.equal(configs.length, expected); assert.equal(new Set(configs.map(JSON.stringify)).size, expected);
    for (const config of configs) {
      assert.equal(config.length, k); config.forEach(([left, right], i) => { assert.ok(left >= 0 && right < n && left < right); if (i) assert.ok(config[i - 1][1] <= left); });
      const parts = ctx.ipSegmentParts(n, config); assert.equal(parts.reduce((s, part) => s + part.value, 0), n - 1); assert.equal(parts.length, 2 * k + 1);
      assert.ok(parts.every(part => part.value >= (part.kind === 'segment' ? 1 : 0)));
      assert.equal(parts.reduce((s, part) => s + part.value - (part.kind === 'segment' ? 1 : 0), 0), n - 1 - k);
    }
  }
  assert.ok(ctx.ipSegmentConfigs(4, 2).some(config => config[0][1] === config[1][0]));
});

test('1655 pictures represent one feasible assignment per mask or backtracking branch, with exact restored stock', () => {
  const { ctx } = renderer(); let sawUndo = false, sawPruning = false, sawTruncated = false;
  for (const [nums, quantity] of distributeCases) for (const method of ['builder', 'builder2']) {
    const run = SUPPORTED[1655][method](nums, { quantity: quantity.join(',') }); assert.equal(run.answer, distributeOracle(nums, quantity));
    for (const step of run.steps) {
      const raw = step.distribute1655View || step.distribute1655BacktrackView;
      const choices = step.final && raw.reachableAssignments ? raw.reachableAssignments.map(entry => entry.mask) : [null];
      for (const mask of choices) {
        const v = ctx.ipDistributionScene(step, mask); assert.equal(new Set(v.assignments.map(entry => entry.customer)).size, v.assignments.length);
        v.groups.forEach((group, i) => { assert.ok(v.remaining[i] >= 0); assert.equal(v.used[i] + v.remaining[i], group.count); });
        v.assignments.forEach(entry => { assert.equal(v.quantity[entry.customer], quantity[v.order[entry.customer]]); assert.ok(v.groups[entry.bucket]); });
        if (v.bt) assert.deepEqual(Array.from(v.remaining), raw.counts);
        if (step.final && run.answer && (v.bt || mask === raw.fullMask)) assert.equal(v.assignments.length, quantity.length);
      }
      sawUndo ||= raw.phase === 'undo'; sawPruning ||= raw.phase === 'skip-seen'; sawTruncated ||= raw.traceTruncated;
    }
  }
  assert.ok(sawUndo); assert.ok(sawPruning); assert.ok(sawTruncated);
});

test('every new renderer supports both languages, source lines, immutable history and backward replay', () => {
  const runs = [
    [1547, 'renderCutStick1547Pictures', SUPPORTED[1547].builder([1, 3, 4, 5], { n: 7 })],
    [1563, 'renderStoneSplit1563Pictures', SUPPORTED[1563].builder([6, 2, 3, 4, 5, 5])],
    ...[1, 2].map(approach => [1621, 'renderSegments1621Pictures', SUPPORTED[1621].builder([4], { k: 2, approach })]),
    ...['builder', 'builder2'].map(method => [1655, 'renderDistribute1655Pictures', SUPPORTED[1655][method]([1, 1, 1, 1, 2, 2, 2], { quantity: '3,2,2' })]),
  ];
  const { ctx, host } = renderer();
  for (const [id, render, run] of runs) {
    const before = JSON.stringify(run);
    for (const language of ['vi', 'en']) { ctx.lang = language; for (const step of run.steps) { ctx[render](step); assert.match(host.innerHTML, /ip-viz/); assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/); const code = step.codeBlock === 2 ? SUPPORTED[id].code2 : SUPPORTED[id].code; assert.ok(step.codeLines.every(line => line >= 1 && line <= code.length)); } }
    assert.equal(JSON.stringify(run), before); ctx[render](run.steps[0]); const first = host.innerHTML; ctx[render](run.steps.at(-1)); ctx[render](run.steps[0]); assert.equal(host.innerHTML, first);
  }
});

test('1547, 1563 and both 1655 displayed Python approaches agree with the pictures', () => {
  const payload = [
    { id: 1547, code: SUPPORTED[1547].code.join('\n'), method: 'minCost', cases: cutCases },
    { id: 1563, code: SUPPORTED[1563].code.join('\n'), method: 'stoneGameV', cases: stoneCases.map(stones => [stones]) },
    ...['code', 'code2'].map(key => ({ id: 1655, code: SUPPORTED[1655][key].join('\n'), method: 'canDistribute', cases: distributeCases })),
  ];
  const out = spawnSync(process.env.PYTHON || 'python3', ['-c', "import json,sys\nresult=[]\nfor p in json.load(sys.stdin):\n scope={}\n exec(p['code'],scope)\n fn=getattr(scope['Solution'](),p['method'])\n result.append([fn(*args) for args in p['cases']])\nprint(json.dumps(result))"], { encoding: 'utf8', input: JSON.stringify(payload) });
  assert.equal(out.status, 0, out.stderr); assert.deepEqual(JSON.parse(out.stdout), [cutCases.map(args => cutOracle(...args)), stoneCases.map(stoneOracle), ...[0, 1].map(() => distributeCases.map(args => distributeOracle(...args)))]);
});

test('four picture lessons select their dedicated assets before the legacy renderers', () => {
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8'), source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  for (const name of ['interval-decisions.css', 'renderer-interval-decisions.js']) assert.match(html, new RegExp(name.replace('.', '\\.') + '[^>]+data-problem-ids="1547 1563 1621 1655"'));
  assert.ok(source.indexOf('renderSegments1621Pictures(step)') < source.indexOf('renderLineSegments1621View(step)'));
  assert.ok(source.indexOf('renderDistribute1655Pictures(step)') < source.indexOf('renderDistribute1655View(step)'));
});
