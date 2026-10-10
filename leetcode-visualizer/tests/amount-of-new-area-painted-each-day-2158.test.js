const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[2158];

// Brute-force oracle: simulate unit painting with a set.
function brute(paint) {
  const seen = new Set();
  return paint.map(([s, e]) => {
    let fresh = 0;
    for (let u = s; u < e; u++) {
      if (!seen.has(u)) {
        seen.add(u);
        fresh++;
      }
    }
    return fresh;
  });
}

const toInput = (paint) => paint.map(([s, e]) => `${s}-${e}`).join(',');

test('2158 solves the LeetCode examples', () => {
  assert.deepEqual(problem.builder('1-4,4-7,1-7').answer, [3, 3, 0]);
  assert.deepEqual(problem.builder('1-4,5-8,4-7').answer, [3, 3, 1]);
  // fully repainted day and adjacent (half-open) segments
  assert.deepEqual(problem.builder('1-4,1-4').answer, [3, 0]);
  assert.deepEqual(problem.builder('1-4,4-7').answer, [3, 3]);
});

test('2158 matches brute force on random paints', () => {
  let state = 2158;
  const rand = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 0x100000000; };
  for (let t = 0; t < 40; t++) {
    const n = 1 + Math.floor(rand() * 10);
    const paint = [];
    for (let i = 0; i < n; i++) {
      const s = Math.floor(rand() * 12);
      const e = s + 1 + Math.floor(rand() * 6);
      paint.push([s, e]);
    }
    const result = problem.builder(toInput(paint));
    assert.deepEqual(result.answer, brute(paint), `t=${t} paint=${toInput(paint)}`);
  }
});

test('2158 trace appends answers consistently with brute force', () => {
  const paint = [[1, 4], [4, 7], [1, 7], [2, 5], [0, 9]];
  const result = problem.builder(toInput(paint));
  const expected = brute(paint);
  const appends = result.steps.filter((s) => s.codeLines[0] === 19);
  assert.equal(appends.length, paint.length);
  appends.forEach((step, d) => {
    const ans = JSON.parse(step.vars.find((v) => v.name === 'ans').value);
    assert.deepEqual(ans, expected.slice(0, d + 1), `day=${d}`);
  });
});

test('2158 trace subtracts exactly the overlapped units', () => {
  const result = problem.builder('1-4,5-8,4-7');
  // day 2 paints [4,7): overlaps [1,4)? no (adjacent half-open). overlaps [5,8) by 2 → new = 3-2 = 1
  const day2 = result.steps.filter((s) => s.title.vi.startsWith('Ngày 2'));
  const overlapSteps = result.steps.filter((s) => s.codeLines[0] === 13);
  const day2Overlap = overlapSteps.filter((s) => s.vars.some((v) => v.name === 'new' && String(v.value).endsWith('= 1')));
  assert.ok(day2Overlap.length >= 1, 'day 2 must subtract overlap down to new=1');
  assert.ok(day2.length >= 1);
});

test('2158 validates paint input without silently accepting bad segments', () => {
  assert.throws(() => problem.builder(''), /rỗng/);
  assert.throws(() => problem.builder('4-1'), /start < end/);
  assert.throws(() => problem.builder('2-2'), /start < end/);
  assert.throws(() => problem.builder('a-b'), /số nguyên/);
  assert.throws(() => problem.builder('1-4-5'), /dạng start-end/);
  assert.throws(() => problem.builder('[[-1,4]]'), /≥ 0/);
  assert.throws(() => problem.builder('[[1,4]'), /mảng các \[start, end\]/);
  // JSON input is accepted
  assert.deepEqual(problem.builder('[[1,4],[4,7]]').answer, [3, 3]);
  // too many segments
  assert.throws(() => problem.builder(Array.from({ length: 17 }, (_, i) => `${i}-${i + 1}`).join(',')), /1–16/);
});

test('2158 displayed Python matches brute force', () => {
  const code = problem.code.join('\n');
  const harness = `
cases = [
    ([[1, 4], [4, 7], [1, 7]], [3, 3, 0]),
    ([[1, 4], [5, 8], [4, 7]], [3, 3, 1]),
    ([[1, 10], [2, 3], [4, 5]], [9, 0, 0]),
]
for paint, expected in cases:
    got = Solution().amountPainted([list(p) for p in paint])
    assert got == expected, (paint, got)
`;
  const run = spawnSync('python3', ['-c', `${code}\n${harness}\n`], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('2158 trace stays within the displayed source', () => {
  const result = problem.builder('1-4,4-7,1-7');
  assert.ok(result.steps.length > 5);
  for (const step of result.steps) {
    assert.ok(step.codeLines.length >= 1);
    assert.ok(step.codeLines.every((line) => line >= 1 && line <= problem.code.length));
    assert.ok(step.title.vi && step.title.en);
    assert.ok(step.note.vi && step.note.en);
  }
  assert.equal(result.steps.filter((s) => s.final).length, 1);
});

test('2158 is registered under interview with Google-relevant metadata', () => {
  assert.equal(problem.id, 2158);
  assert.equal(problem.slug, 'amount-of-new-area-painted-each-day');
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.category.key, 'interval');
  assert.ok(problem.tags.some((t) => t.key === 'sweep-line'));
  assert.equal(problem.code.length, 20);
});
