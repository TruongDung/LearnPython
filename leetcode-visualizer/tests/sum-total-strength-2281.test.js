const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const vm = require('node:vm');

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
    && step.codeLines[0] === 24
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
    assert.ok(step.note.vi && step.note.en);
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

test('2281 dedicated renderer is wired, responsive, bilingual, and complete', () => {
  const index = readFrontendIndex();
  const styles = readFrontendStyles();
  const script = readFrontendJavaScript();
  assert.match(index, /renderers-01\.js/);
  assert.match(index, /style-07\.css/);
  assert.match(script, /totalStrength2281View/);
  assert.match(script, /renderTotalStrength2281View/);
  assert.match(styles, /\.ts2281-viz/);
  assert.match(styles, /@media \(max-width: 760px\)[\s\S]*?\.ts2281-blocks/);

  const start = script.indexOf('function renderTotalStrength2281View(step)');
  const end = script.indexOf('\nfunction renderVisibleMountains2345View(step)', start);
  assert.ok(start >= 0 && end > start);

  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: (value) => String(value),
    pick: (value) => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  const runs = [problem.builder('1,3,1,2'), problem.builder('2,2,1,2')];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderTotalStrength2281View(step);
        assert.match(element.innerHTML, /ts2281-viz/);
        assert.match(element.innerHTML, /ts2281-phases/);
        assert.match(element.innerHTML, /ts2281-prefix/);
        assert.match(element.innerHTML, /ts2281-owner/);
        assert.match(element.innerHTML, /ts2281-ledger/);
        assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity/);
      }
    }
  }

  context.lang = 'en';
  context.renderTotalStrength2281View(runs[0].steps.at(-1));
  assert.match(element.innerHTML, /class="ts2281-bar/);
  assert.match(element.innerHTML, /class="ts2281-matrix-empty/);
  assert.match(element.innerHTML, /<small>ANSWER<\/small>/);
  assert.match(element.innerHTML, /<strong>44<\/strong>/);
});
