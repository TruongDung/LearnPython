const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[213];
const sum = (nums, path) => path.reduce((total, i) => total + nums[i], 0);
function brute(nums, lo = 0, hi = nums.length - 1, circle = true) {
  let best = 0;
  for (let mask = 0; mask < 2 ** nums.length; mask++) {
    if (mask & (mask << 1)) continue;
    if (circle && nums.length > 1 && (mask & 1) && (mask & (1 << (nums.length - 1)))) continue;
    if (nums.some((_, i) => (i < lo || i > hi) && (mask & (1 << i)))) continue;
    best = Math.max(best, nums.reduce((total, value, i) => total + ((mask & (1 << i)) ? value : 0), 0));
  }
  return best;
}
function legal(nums, path) {
  assert.equal(new Set(path).size, path.length);
  for (const i of path) {
    assert.ok(i >= 0 && i < nums.length);
    if (nums.length > 1) assert.ok(!path.includes((i + 1) % nums.length));
  }
}
test('213 every snapshot has a legal optimal prefix plan, including zeros and ties', () => {
  for (let n = 1; n <= 6; n++) for (let encoded = 0; encoded < 3 ** n; encoded++) {
    let digits = encoded;
    const nums = Array.from({length:n}, () => { const value = digits % 3; digits = Math.floor(digits / 3); return value; });
    const run = problem.builder(nums);
    assert.equal(run.answer, brute(nums));
    for (const step of run.steps) {
      const v = step.houseRobberView;
      legal(nums, v.robbed);
      assert.ok(step.codeLines.every(line => line > 0 && line <= problem.code.length));
      if (v.formula) {
        const f = v.formula;
        for (const option of [f.skip, f.rob]) legal(nums, option.houses);
        assert.equal(sum(nums, f.skip.houses), f.skip.value);
        assert.equal(sum(nums, f.rob.houses), f.rob.total);
        assert.ok(f.rob.houses.includes(f.i));
        assert.ok(!f.rob.houses.includes(f.i - 1));
        assert.equal(sum(nums, v.robbed), brute(nums, v.range[0], f.i, false));
      }
      if (v.phase === 'done') assert.equal(sum(nums, v.robbed), run.answer);
    }
  }
});
test('213 only reveals computed DP cells and completed pass results', () => {
  const run = problem.builder([2, 7, 9, 3, 1]);
  const first = run.steps[0].houseRobberView;
  assert.equal(first.passA, null); assert.equal(first.passB, null);
  assert.ok(first.passes.A.dp.every(value => value === null));
  assert.ok(first.passes.B.dp.every(value => value === null));
  for (const step of run.steps) {
    const v = step.houseRobberView;
    if (v.pass === 'A') assert.equal(v.passB, null);
    if (v.formula) assert.ok(v.dp.slice(v.currentIndex + 1).every(value => value === null));
  }
  assert.equal(run.answer, 11);
  assert.deepEqual(run.steps.at(-1).houseRobberView.robbed, [0, 2]);
  for (const input of [[], null, [-1], [1.2], [1001], Array(101).fill(1)]) assert.throws(() => problem.builder(input), /213:/);
});
test('213 displayed Python works for one-house subranges and official examples', () => {
  const cases = [[0], [5], [1, 2], [2, 3, 2], [1, 2, 3, 1], [2, 1, 1, 2], Array(100).fill(1000)];
  const source = `${problem.code.join('\n')}\nimport json,sys\nfor case in json.load(sys.stdin):\n    assert Solution().rob(case['nums']) == case['expected']`;
  const run = spawnSync('python3', ['-c', source], {encoding:'utf8',input:JSON.stringify(cases.map(nums => ({nums,expected:problem.builder(nums).answer})))});
  assert.equal(run.status, 0, run.stderr);
});
test('213 circle, two excluded endpoints, candidate plans and final total render in both languages', () => {
  const host = {innerHTML:''};
  const ctx = {lang:'vi',$:()=>host,escapeHtml:String};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-house-robber-213.js'),'utf8'),ctx);
  for (const nums of [[0], [5], [1,2], [2,3,2], [1,2,3,1], Array(100).fill(1000)]) {
    const run = problem.builder(nums), before = JSON.stringify(run);
    for (const language of ['vi','en']) for (const step of run.steps) {
      ctx.lang = language; ctx.renderHouseRobber213View(step);
      assert.match(host.innerHTML, /h213-circle/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object|CORE RULE/);
      assert.ok((host.innerHTML.split('class="h213-circle"')[1].split('</svg>')[0].match(/class="h213-house /g)||[]).length <= 10);
      if (nums.length > 1) assert.match(host.innerHTML, /h213-cases/);
      if (step.houseRobberView.formula) assert.match(host.innerHTML, /h213-choices/);
      if (step.final) assert.match(host.innerHTML,new RegExp(`<output>= ${run.answer}</output>`));
    }
    assert.equal(JSON.stringify(run),before);
  }
});
