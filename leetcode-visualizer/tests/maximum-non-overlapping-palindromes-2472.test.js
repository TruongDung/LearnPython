const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[2472];

function bruteForce(s, k) {
  const memo = new Map();
  function visit(index) {
    if (index >= s.length) return 0;
    if (memo.has(index)) return memo.get(index);
    let best = visit(index + 1);
    for (let end = index + k - 1; end < s.length; end += 1) {
      const word = s.slice(index, end + 1);
      if (word === [...word].reverse().join('')) {
        best = Math.max(best, 1 + visit(end + 1));
      }
    }
    memo.set(index, best);
    return best;
  }
  return visit(0);
}

test('2472 is registered with palindrome-table and prefix-DP metadata', () => {
  assert.equal(problem.id, 2472);
  assert.equal(problem.slug, 'maximum-number-of-non-overlapping-palindrome-substrings');
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n²)');
  assert.match(problem.code.join('\n'), /def maxPalindromes\(self, s: str, k: int\) -> int/);
  assert.ok(problem.tags.some((tag) => tag.key === 'palindrome'));
});

test('2472 matches the official examples and reconstructs a valid selection', () => {
  const examples = [
    ['abaccdbbd', 3, 2],
    ['adbcda', 2, 0],
  ];
  for (const [s, k, expected] of examples) {
    const result = problem.builder(s, { k });
    assert.equal(result.answer, expected);
    assert.equal(result.steps.at(-1).palindrome2472View.answer, expected);
    assert.equal(result.steps.at(-1).final, true);
    assert.equal(result.intervals.length, expected);
    let previousEnd = -1;
    for (const [left, right] of result.intervals) {
      const word = s.slice(left, right + 1);
      assert.ok(left > previousEnd);
      assert.ok(word.length >= k);
      assert.equal(word, [...word].reverse().join(''));
      previousEnd = right;
    }
  }
});

test('2472 agrees with an independent exhaustive oracle', () => {
  let seed = 2472;
  for (let n = 1; n <= 9; n += 1) {
    for (let sample = 0; sample < 80; sample += 1) {
      let s = '';
      for (let i = 0; i < n; i += 1) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        s += String.fromCharCode(97 + seed % 4);
      }
      for (let k = 1; k <= n; k += 1) {
        assert.equal(problem.builder(s, { k }).answer, bruteForce(s, k), `${s}, k=${k}`);
      }
    }
  }
});

test('2472 trace exposes palindrome decisions, prefix skips, candidates, and updates', () => {
  const result = problem.builder('abaccdbbd', { k: 3 });
  assert.ok(result.steps.every((step) => step.palindrome2472View));
  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  const operations = new Set(result.steps.map((step) => step.palindrome2472View.operation));
  for (const operation of ['init-palindrome', 'palindrome-yes', 'palindrome-no', 'init-dp', 'skip', 'candidate', 'reject', 'update', 'return']) {
    assert.ok(operations.has(operation), operation);
  }
  assert.deepEqual(result.intervals, [[0, 2], [5, 8]]);
});

test('2472 displayed Python agrees with the oracle', () => {
  const cases = [
    ['abaccdbbd', 3],
    ['adbcda', 2],
    ['aaaaa', 2],
    ['abcbaaba', 3],
    ['a', 1],
  ];
  const assertions = cases.map(([s, k]) => `assert Solution().maxPalindromes(${JSON.stringify(s)}, ${k}) == ${bruteForce(s, k)}`).join('\n');
  const python = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(python.status, 0, python.stderr);
});

test('2472 custom renderer covers every phase in both languages', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderPalindrome2472View(step)');
  const end = source.indexOf('\nfunction renderStep()', start);
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: String,
    pick: (value) => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const result = problem.builder('abaccdbbd', { k: 3 });
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of result.steps) {
      context.renderPalindrome2472View(step);
      assert.match(element.innerHTML, /p2472-viz/);
      assert.match(element.innerHTML, /p2472-pal-grid/);
      assert.match(element.innerHTML, /p2472-dp-grid/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('2472 validates visual inputs and includes responsive scoped styles', () => {
  assert.throws(() => problem.builder('Aba', { k: 2 }), /lowercase/);
  assert.throws(() => problem.builder('a b', { k: 2 }), /lowercase/);
  assert.throws(() => problem.builder('abc', { k: 0 }), /between 1/);
  assert.throws(() => problem.builder('abc', { k: 4 }), /between 1/);
  assert.throws(() => problem.builder('a'.repeat(17), { k: 2 }), /at most 16/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.p2472-viz \{/);
  assert.match(css, /\.p2472-pal-cell\.current/);
  assert.match(css, /@container \(max-width: 430px\)/);
});

