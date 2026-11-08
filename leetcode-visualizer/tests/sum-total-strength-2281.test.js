const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const vm = require('node:vm');
const fs = require('node:fs');

const { SUPPORTED } = require('../problems');
const {
  readFrontendIndex,
  readFrontendJavaScript,
  readFrontendStyles,
} = require('./helpers/frontend-source');

const problem = SUPPORTED[2281];
const MOD = 1_000_000_007;

function bruteTotalStrength(strength) {
  let answer = 0;
  for (let start = 0; start < strength.length; start += 1) {
    let minimum = Infinity;
    let sum = 0;
    for (let end = start; end < strength.length; end += 1) {
      minimum = Math.min(minimum, strength[end]);
      sum += strength[end];
      answer = (answer + minimum * sum) % MOD;
    }
  }
  return answer;
}

test('2281 solves the official examples and duplicate-heavy edge cases', () => {
  assert.equal(problem.builder('1,3,1,2').answer, 44);
  assert.equal(problem.builder('5,4,6').answer, 213);
  assert.equal(problem.builder('2,2').answer, 16);
  assert.equal(problem.builder('7').answer, 49);
});

test('2281 agrees with an independent brute-force oracle', () => {
  let seed = 2281;
  const random = (max) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };

  for (let caseIndex = 0; caseIndex < 180; caseIndex += 1) {
    const length = 1 + random(7);
    const strength = Array.from({ length }, () => 1 + random(9));
    const run = problem.builder(strength.join(','));
    assert.equal(run.answer, bruteTotalStrength(strength), JSON.stringify(strength));
  }
});

test('2281 trace exposes asymmetric boundaries, both prefixes, and every contribution', () => {
  const run = problem.builder('1,3,1,2');
  const phases = new Set(run.steps.map((step) => step.totalStrength2281View.phase));
  assert.deepEqual(phases, new Set(['left', 'right', 'prefix', 'contribution', 'done']));

  const final = run.steps.at(-1);
  const view = final.totalStrength2281View;
  assert.deepEqual(view.left, [-1, 0, -1, 2]);
  assert.deepEqual(view.right, [2, 2, 4, 4]);
  assert.deepEqual(view.prefix, [0, 1, 4, 5, 7]);
  assert.deepEqual(view.prefix2, [0, 0, 1, 5, 10, 17]);
  assert.deepEqual(view.contributions, [5, 9, 26, 4]);
  assert.equal(view.total, 44);
  assert.equal(final.final, true);

  const equalTie = run.steps.find((step) => (
    step.totalStrength2281View.phase === 'right'
    && step.totalStrength2281View.action === '1 = 1 → KEEP'
  ));
  assert.ok(equalTie, 'the right pass must keep equal values');

  const leftEqualityPop = run.steps.find((step) => (
    step.totalStrength2281View.phase === 'left'
    && step.totalStrength2281View.action === '1 ≥ 1 → POP'
  ));
  assert.ok(leftEqualityPop, 'the left pass must pop equal values');
});

test('2281 assigns every subarray to exactly one minimum owner', () => {
  const strength = [2, 2, 1, 2];
  const run = problem.builder(strength.join(','));
  const ownershipSteps = run.steps.filter((step) => (
    step.totalStrength2281View.phase === 'contribution'
    && step.stackStudyView.source.text === 'right_i = right[i]'
  ));
  const owned = new Map();

  for (const step of ownershipSteps) {
    const owner = step.totalStrength2281View.current;
    for (const range of step.totalStrength2281View.ownedRanges) {
      const key = `${range.start}:${range.end}`;
      assert.equal(owned.has(key), false, `duplicate owner for ${key}`);
      owned.set(key, owner);
      assert.equal(strength[owner], Math.min(...strength.slice(range.start, range.end + 1)));
    }
  }

  assert.equal(owned.size, strength.length * (strength.length + 1) / 2);
});

test('2281 displayed Python solves representative cases', () => {
  const code = problem.code.join('\n');
  const harness = `
cases = [
    ([1, 3, 1, 2], 44),
    ([5, 4, 6], 213),
    ([2, 2], 16),
    ([7], 49),
]
for strength, expected in cases:
    got = Solution().totalStrength(strength)
    assert got == expected, (strength, got, expected)
`;
  const run = spawnSync('python3', ['-c', `${code}\n${harness}`], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('2281 validates input and keeps trace lines aligned with the displayed source', () => {
  assert.throws(() => problem.builder(''), /non-empty/);
  assert.throws(() => problem.builder('0,2'), /between 1 and 1,000,000/);
  assert.throws(() => problem.builder('1000001'), /between 1 and 1,000,000/);
  assert.throws(() => problem.builder('1,2,3,4,5,6,7,8'), /up to 7 wizards/);

  const run = problem.builder('1,3,1,2');
  assert.ok(run.steps.length > 20);
  for (const step of run.steps) {
    assert.ok(step.title.vi && step.title.en);
    assert.equal(typeof step.note.vi, 'string');
    assert.equal(typeof step.note.en, 'string');
    assert.ok(step.totalStrength2281View);
    assert.ok(step.codeLines.every((line) => line >= 1 && line <= problem.code.length));
  }
  assert.equal(run.steps.filter((step) => step.final).length, 1);
});

test('2281 is registered with the intended metadata', () => {
  assert.equal(problem.id, 2281);
  assert.equal(problem.slug, 'sum-of-total-strength-of-wizards');
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(n)');
  assert.ok(problem.tags.some((tag) => tag.key === 'monotonic-stack'));
  assert.ok(problem.tags.some((tag) => tag.key === 'prefix-sum'));
  assert.match(problem.code.join('\n'), /prefix2/);
});

test('2281 dedicated native renderer is lazy, responsive, bilingual and deterministic', () => {
  const index=readFrontendIndex(),script=readFrontendJavaScript(),styles=readFrontendStyles();
  assert.match(index,/renderer-stack-study-pictures\.js[^>]*data-problem-ids="2281 2289"/);
  assert.match(script,/step\.stackStudyView/);assert.match(script,/renderStackStudyPictures\(step\)/);
  assert.match(styles,/\.st-matrix/);assert.match(styles,/@container\(max-width:340px\)/);
  const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},context={lang:'vi',document:{getElementById:()=>host}};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-stack-study-pictures.js'),'utf8'),context);
  for(const lang of ['vi','en']){context.lang=lang;for(const input of ['1,3,1,2','2,2,1,2']){const run=problem.builder(input),saved=JSON.stringify(run.steps);
    context.renderStackStudyPictures(run.steps[0]);const first=host.innerHTML;
    for(const step of run.steps){context.renderStackStudyPictures(step);assert.match(host.innerHTML,/st-viz/);assert.match(host.innerHTML,/st-phases/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);}
    context.renderStackStudyPictures(run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run.steps),saved);
  }}
});
