const test = require('node:test');
const assert = require('node:assert/strict');

const problem = require('../problems/string.js')[1111];

function splitStats(seq, answer, group) {
  let depth = 0;
  let maxDepth = 0;
  for (let i = 0; i < seq.length; i++) {
    if (answer[i] !== group) continue;
    depth += seq[i] === '(' ? 1 : -1;
    if (depth < 0) return { valid: false, maxDepth };
    maxDepth = Math.max(maxDepth, depth);
  }
  return { valid: depth === 0, maxDepth };
}

function maxDepth(seq) {
  let depth = 0;
  let best = 0;
  for (const ch of seq) {
    depth += ch === '(' ? 1 : -1;
    best = Math.max(best, depth);
  }
  return best;
}

function validParenthesesStrings(pairs, prefix = '', open = 0, close = 0, out = []) {
  if (prefix.length === pairs * 2) {
    out.push(prefix);
    return out;
  }
  if (open < pairs) validParenthesesStrings(pairs, `${prefix}(`, open + 1, close, out);
  if (close < open) validParenthesesStrings(pairs, `${prefix})`, open, close + 1, out);
  return out;
}

test('1111 metadata and live arguments are registered', () => {
  assert.equal(problem.id, 1111);
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.slug, 'maximum-nesting-depth-of-two-valid-parentheses-strings');
  assert.deepEqual(problem.liveArgs(' (()()) '), ['(()())']);
});

test('1111 default example creates two valid optimal strings', () => {
  const run = problem.builder('(()())');
  const statsA = splitStats(run.input, run.answer, 0);
  const statsB = splitStats(run.input, run.answer, 1);

  assert.equal(statsA.valid, true);
  assert.equal(statsB.valid, true);
  assert.equal(Math.max(statsA.maxDepth, statsB.maxDepth), 1);
  assert.equal(run.sourceMaxDepth, 2);
  assert.equal(run.optimalMaxDepth, 1);
});

test('1111 is valid and optimal for every valid sequence through seven pairs', () => {
  let checked = 0;
  for (let pairs = 1; pairs <= 7; pairs++) {
    for (const seq of validParenthesesStrings(pairs)) {
      const run = problem.builder(seq);
      const statsA = splitStats(seq, run.answer, 0);
      const statsB = splitStats(seq, run.answer, 1);
      const optimum = Math.ceil(maxDepth(seq) / 2);

      assert.equal(statsA.valid, true, `${seq}: A must be valid`);
      assert.equal(statsB.valid, true, `${seq}: B must be valid`);
      assert.equal(Math.max(statsA.maxDepth, statsB.maxDepth), optimum, `${seq}: split must be optimal`);
      assert.equal(run.optimalMaxDepth, optimum, `${seq}: reported optimum must match`);
      checked++;
    }
  }
  assert.equal(checked, 625);
});

test('1111 trace exposes the complete renderer contract', () => {
  const run = problem.builder('(()())');
  const processFirst = run.steps.find((step) => step.parentheses1111View.phase === 'process');
  const updatedFirst = run.steps.find((step) => (
    step.parentheses1111View.phase === 'updated'
    && step.parentheses1111View.pointer === 0
  ));
  const finalStep = run.steps.at(-1);

  for (const step of run.steps) {
    const view = step.parentheses1111View;
    assert.deepEqual(view.seq, [...run.input]);
    assert.ok(Array.isArray(view.answer));
    assert.ok(Array.isArray(view.stackA));
    assert.ok(Array.isArray(view.stackB));
    assert.ok(Number.isInteger(view.pointer));
    assert.ok(Number.isInteger(view.maxDepthA));
    assert.ok(Number.isInteger(view.maxDepthB));
  }

  assert.equal(processFirst.parentheses1111View.splitType, 'A');
  assert.deepEqual(updatedFirst.parentheses1111View.stackA, [0]);
  assert.equal(updatedFirst.parentheses1111View.depthA, 1);
  assert.equal(finalStep.parentheses1111View.maxDepthA, 1);
  assert.equal(finalStep.parentheses1111View.maxDepthB, 1);
  assert.deepEqual(finalStep.parentheses1111View.stackA, []);
  assert.deepEqual(finalStep.parentheses1111View.stackB, []);
  assert.match(finalStep.note.en, /ceil\(2\/2\) = 1/);
});

test('1111 rejects malformed and oversized inputs', () => {
  for (const input of ['', '(()', '())', '(a)', '()'.repeat(26)]) {
    assert.throws(() => problem.builder(input));
  }
});
