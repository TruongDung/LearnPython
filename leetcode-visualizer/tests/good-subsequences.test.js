const assert = require('node:assert/strict');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const problem = SUPPORTED[1987];
function brute(s) {
  const all = new Set();
  for (let mask = 1; mask < 2 ** s.length; mask++) {
    let value = '';
    for (let i = 0; i < s.length; i++) if (mask & (1 << i)) value += s[i];
    if (value === '0' || value.startsWith('1')) all.add(value);
  }
  return all;
}
test('all binary inputs through length 8 match independently enumerated subsequences', () => {
  for (let n = 1; n <= 8; n++) for (let value = 0; value < 2 ** n; value++) {
    const input = value.toString(2).padStart(n, '0');
    const result = problem.builder(input);
    assert.equal(result.answer, brute(input).size, input);
    for (const step of result.steps) {
      const v = step.goodSubseqView;
      const expected = brute(input.slice(0, v.index + 1));
      const actual = new Set(v.buckets.flat());
      if (v.hasZero) actual.add('0');
      assert.deepEqual(actual, expected, input);
      assert.equal(v.end0, v.buckets[0].length);
      assert.equal(v.end1, v.buckets[1].length);
      if (v.transition) for (const s of v.transition.previous) assert.ok(v.buckets[v.transition.bit].includes(s));
      assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
    }
  }
});
test('long input uses modular counts and a bounded trace', () => {
  const input = '10'.repeat(50000);
  let zero = 0n, one = 0n;
  for (const bit of input) {
    if (bit === '0') zero = (zero + one) % 1000000007n;
    else one = (zero + one + 1n) % 1000000007n;
  }
  const result = problem.builder(input);
  assert.equal(result.answer, Number((zero + one + 1n) % 1000000007n));
  assert.equal(result.steps.length, 83);
  assert.equal(result.steps.at(-2).goodSubseqView.transition.skipped, 99919);
  assert.equal(result.steps.at(-1).goodSubseqView.buckets, null);
});
test('rejects invalid input and supplies the correct Python argument', () => {
  for (const input of ['', '102', ' 101', 'abc', 101, '0'.repeat(100001)]) assert.throws(() => problem.builder(input));
  assert.deepEqual(problem.liveArgs('001'), ['001']);
  assert.equal(problem.builder('001').answer, 2);
  assert.equal(problem.builder('11').answer, 2);
  assert.equal(problem.builder('101').answer, 5);
});
