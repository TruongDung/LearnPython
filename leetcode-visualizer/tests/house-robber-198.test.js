const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript, JAVASCRIPT_ASSETS, STYLESHEET_ASSETS } = require('./helpers/frontend-source');
const problem = SUPPORTED[198];
const run = (nums, approach) => problem.builder(nums, { approach });
const sum = (nums, path) => path.reduce((total, index) => total + nums[index], 0);
function brute(nums) {
  let best = 0;
  for (let mask = 0; mask < 2 ** nums.length; mask++) {
    if (mask & (mask << 1)) continue;
    best = Math.max(best, nums.reduce((total, value, i) => total + (mask & (1 << i) ? value : 0), 0));
  }
  return best;
}
function valid(path, end) {
  assert.equal(new Set(path).size, path.length);
  assert.ok(path.every((index, i) => index >= 0 && index <= end && (i === 0 || index - path[i - 1] > 1)));
}

test('198 both approaches match exhaustive legal subsets, including ties and zeros', () => {
  for (let n = 1; n <= 5; n++) for (let encoded = 0; encoded < 4 ** n; encoded++) {
    let value = encoded;
    const nums = Array.from({ length: n }, () => { const digit = value % 4; value = Math.floor(value / 4); return digit; });
    for (const approach of [1, 2]) {
      const result = run(nums, approach);
      assert.equal(result.answer, brute(nums));
      for (const step of result.steps) {
        const view = step.houseRobberView;
        valid(view.robbed, view.currentIndex);
        assert.equal(sum(nums, view.robbed), brute(nums.slice(0, view.currentIndex + 1)));
        if (view.formula) {
          const f = view.formula;
          const skip = approach === 1 ? f.skip.houses : f.skipHouses;
          const rob = approach === 1 ? f.rob.houses : f.robHouses;
          valid(skip, view.currentIndex - 1);
          valid(rob, view.currentIndex);
          assert.ok(rob.includes(view.currentIndex));
          assert.ok(!rob.includes(view.currentIndex - 1));
          assert.equal(sum(nums, skip), approach === 1 ? f.skip.value : f.maxRob);
          assert.equal(sum(nums, rob), approach === 1 ? f.rob.total : f.robVal);
          assert.deepEqual(view.robbed, f.chosen === 'skip' ? skip : rob);
        }
      }
    }
  }
});

test('198 default rolling trace never marks adjacent local winners as a valid plan', () => {
  for (const approach of [1, '2']) {
    const result = run([2, 7, 9, 3, 1], approach);
    assert.equal(result.answer, 12);
    assert.deepEqual(result.steps.at(-1).houseRobberView.robbed, [0, 2, 4]);
  }
  assert.equal(run([1, 2, 3, 1], 1).answer, 4);
  assert.equal(run(Array(100).fill(400), 2).answer, 20000);
  for (const input of [[], null, [-1], [1.2], [NaN]]) assert.throws(() => run(input, 1), /198:/);
});

test('198 both displayed Python implementations match the visualizer', () => {
  const cases = [[0], [400], [1, 1], [2, 7, 9, 3, 1], [1, 2, 3, 1], [2, 1, 1, 2], Array(100).fill(400)];
  for (const approach of [1, 2]) {
    const code = approach === 1 ? problem.code : problem.code2;
    const source = `from typing import List\n${code.join('\n')}\nimport json,sys\nfor case in json.load(sys.stdin):\n    assert Solution().rob(case['nums']) == case['expected']`;
    const result = spawnSync('python3', ['-c', source], { encoding: 'utf8', input: JSON.stringify(cases.map(nums => ({ nums, expected: run(nums, approach).answer }))) });
    assert.equal(result.status, 0, result.stderr);
  }
});

test('198 rolling snapshots match live Python variables before and after simultaneous assignment', () => {
  const nums = [2, 7, 9, 3, 1];
  const source = `from typing import List\n${problem.code2.join('\n')}\nimport sys,json\nframes=[]\ndef trace(frame,event,arg):\n    if frame.f_code.co_name == 'rob' and event == 'line':\n        state=frame.f_locals\n        if frame.f_lineno == 8 or (frame.f_lineno == 6 and 'temp' in state):\n            frames.append({name: state[name] for name in ['prev_rob','max_rob','temp']})\n    return trace\nsys.settrace(trace)\nSolution().rob(${JSON.stringify(nums)})\nsys.settrace(None)\nprint(json.dumps(frames))`;
  const result = spawnSync('python3', ['-c', source], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const snapshots = run(nums, 2).steps.filter(step => ['compute', 'shift'].includes(step.houseRobberView.phase)).map(step => {
    const r = step.houseRobberView.rolling;
    return { prev_rob: r.prevRob, max_rob: r.maxRob, temp: r.temp };
  });
  assert.deepEqual(snapshots, JSON.parse(result.stdout));
});

test('198 pictures show chosen legal houses and both candidate plans without long rules', () => {
  const host = { innerHTML: '' };
  const context = { lang: 'en', $: () => host, escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-house-robber-198.js'), 'utf8'), context);
  for (const nums of [[0], [5], [1, 1], [2, 7, 9, 3, 1], [2, 1, 1, 2], Array(100).fill(400)]) for (const approach of [1, 2]) {
    const result = run(nums, approach);
    const before = JSON.stringify(result);
    for (const language of ['en', 'vi']) for (const step of result.steps) {
      context.lang = language;
      context.renderHouseRobber198View(step);
      assert.match(host.innerHTML, /h198-street/);
      assert.match(host.innerHTML, /<svg/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object|CORE RULE|<p>/);
      assert.ok((host.innerHTML.match(/class="h198-house /g) || []).length <= 10);
      if (step.houseRobberView.formula) assert.match(host.innerHTML, /h198-choices/);
      if (step.final) assert.match(host.innerHTML, new RegExp(`<output>= ${result.answer}</output>`));
    }
    assert.equal(JSON.stringify(result), before);
  }
});

test('198 uses its own lazy renderer while 213 keeps the circular renderer', () => {
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-house-robber-198.js'));
  assert.ok(STYLESHEET_ASSETS.includes('house-robber-198.css'));
  assert.match(readFrontendJavaScript(), /method !== "circular"[^}]+renderHouseRobber198View\(step\)/);
  assert.match(readFrontendJavaScript(), /method === "circular"[^}]+renderHouseRobberView\(step\)/);
  assert.doesNotMatch(readFrontendIndex().replace(/<template[\s\S]*?<\/template>/g, ''), /(?:renderer-)?house-robber-198\.(?:js|css)/);
  assert.equal(SUPPORTED[213].builder([2, 3, 2]).answer, 3);
  assert.equal(SUPPORTED[213].builder([1, 2, 3, 1]).answer, 4);
});
