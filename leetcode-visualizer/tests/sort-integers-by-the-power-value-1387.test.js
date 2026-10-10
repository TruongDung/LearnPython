const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[1387];

const powerBrute = (x) => {
  let steps = 0;
  while (x !== 1) {
    x = x % 2 === 0 ? x / 2 : 3 * x + 1;
    steps += 1;
  }
  return steps;
};
const kthBrute = (lo, hi, k) =>
  Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
    .sort((a, b) => powerBrute(a) - powerBrute(b) || a - b)[k - 1];

test('1387 solves both LeetCode examples', () => {
  assert.equal(problem.builder([12], { hi: 15, k: 2 }).answer, 13);
  assert.equal(problem.builder([7], { hi: 11, k: 4 }).answer, 7);
});

test('1387 builder matches brute force on random ranges', () => {
  let state = 123456789;
  const rand = (n) => { state = (state * 1664525 + 1013904223) >>> 0; return state % n; };
  for (let t = 0; t < 40; t++) {
    const lo = 1 + rand(40);
    const hi = lo + rand(10);
    const k = 1 + rand(hi - lo + 1);
    const result = problem.builder([lo], { hi, k });
    assert.equal(result.answer, kthBrute(lo, hi, k), `lo=${lo} hi=${hi} k=${k}`);
    assert.equal(result.steps.at(-1).final, true);
    assert.deepEqual(result.steps.at(-1).highlight, [k - 1]);
  }
});

test('1387 displayed Python matches brute force', () => {
  const code = problem.code.join('\n');
  const harness = `
cases = [(12, 15, 2, 13), (7, 11, 4, 7), (1, 1, 1, 1), (3, 6, 2, 5), (1, 30, 10, None)]
def brute(lo, hi, k):
    def power(x):
        s = 0
        while x != 1:
            x = x // 2 if x % 2 == 0 else 3 * x + 1
            s += 1
        return s
    return sorted(range(lo, hi + 1), key=lambda v: (power(v), v))[k - 1]
for lo, hi, k, exp in cases:
    want = exp if exp is not None else brute(lo, hi, k)
    got = Solution().getKth(lo, hi, k)
    assert got == want, (lo, hi, k, got, want)
print("py-ok")
`;
  const run = spawnSync('python3', ['-c', `${code}\n${harness}\n`], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /py-ok/);
});

test('1387 trace is concise and professional: 1 step per number', () => {
  const result = problem.builder([12], { hi: 15, k: 2 });
  // 1 intro + 4 numbers + 1 sort + 1 answer = 7 steps
  assert.equal(result.steps.length, 7);
  for (const s of result.steps) {
    assert.ok(s.codeLines.length > 0, `step missing codeLines: ${s.title.vi}`);
    for (const l of s.codeLines) assert.ok(l >= 1 && l <= problem.code.length, `bad line ${l}`);
  }
  const lines = new Set(result.steps.flatMap((s) => s.codeLines));
  for (const l of [3, 5, 6, 7, 12, 14, 16, 17, 18, 19, 21]) assert.ok(lines.has(l), `line ${l} never highlighted`);
  // power bar chart fills progressively: 1, 2, 3, 4 bars
  const perNumber = result.steps.slice(1, 5);
  assert.deepEqual(perNumber.map((s) => s.arr.length), [1, 2, 3, 4]);
  assert.deepEqual(perNumber.map((s) => s.arr), [[9], [9, 9], [9, 9, 17], [9, 9, 17, 17]]);
  assert.ok(perNumber.every((s, i) => s.highlight[0] === i), 'each step highlights its own new bar');
});

test('1387 trace shows memo hits when chains overlap', () => {
  // 4 and 5 appear inside 3's Collatz chain, so their power() calls hit memo.
  const result = problem.builder([3], { hi: 6, k: 2 });
  const hits = result.steps.filter((s) => /memo hit/.test(s.title.vi));
  assert.ok(hits.length >= 2, `expected >= 2 memo hits, got ${hits.length}`);
  assert.ok(hits.every((s) => s.codeLines.includes(14)), 'memo hits must highlight line 14');
});

test('1387 per-number step shows chain text and power breakdown', () => {
  const result = problem.builder([12], { hi: 13, k: 1 });
  const step = result.steps[2]; // power(13)
  assert.match(step.title.vi, /power\(13\) = 9/);
  const chainVar = step.vars.find((v) => v.name === "chuỗi");
  assert.equal(chainVar.value, "13 → 40 → 20 → 10");
  const breakdown = step.vars.find((v) => v.name === "power(13)");
  assert.equal(breakdown.value, "3 + 6 = 9");
  assert.match(step.note.vi, /3 mắt xích mới.*memo\[10\] = 6/);
});

test('1387 rejects invalid lo/hi/k', () => {
  assert.throws(() => problem.builder([0], { hi: 15, k: 2 }), /lo/);
  assert.throws(() => problem.builder([10], { hi: 5, k: 1 }), /hi/);
  assert.throws(() => problem.builder([12], { hi: 15, k: 0 }), /k/);
  assert.throws(() => problem.builder([12], { hi: 15, k: 5 }), /k/);
  assert.throws(() => problem.builder([1], { hi: 100, k: 1 }), /tối đa/);
});

test('1387 metadata: medium, DP+hashmap+sorting tags, 21-line code', () => {
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.code.length, 21);
  const keys = problem.tags.map((t) => t.key).sort();
  assert.deepEqual(keys, ['dp', 'hashmap', 'sorting']);
  assert.equal(problem.slug, 'sort-integers-by-the-power-value');
});
