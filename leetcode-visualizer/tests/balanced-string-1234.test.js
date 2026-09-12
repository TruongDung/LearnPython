const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[1234];

function oracle(s) {
  const chars = ['Q', 'W', 'E', 'R'];
  const target = s.length / 4;
  const total = Object.fromEntries(chars.map(char => [char, 0]));
  for (const char of s) total[char] += 1;
  if (chars.every(char => total[char] === target)) return 0;
  let best = s.length;
  for (let left = 0; left < s.length; left++) {
    const outside = { ...total };
    for (let right = left; right < s.length; right++) {
      outside[s[right]] -= 1;
      if (chars.every(char => outside[char] <= target)) best = Math.min(best, right - left + 1);
    }
  }
  return best;
}

test('1234 is registered with complete sliding-window metadata', () => {
  assert.equal(problem.id, 1234);
  assert.equal(problem.slug, 'replace-the-substring-for-balanced-string');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.match(problem.code.join('\n'), /outside\[ch\] -= 1[\s\S]*while all\(outside\[x\] <= target/);
});

test('1234 matches the official examples and representative cases', () => {
  for (const [s, expected] of [['QWER', 0], ['QQWE', 1], ['QQQW', 2], ['WQWRQQQW', 3], ['QQQQ', 3]]) {
    const result = problem.builder(s);
    assert.equal(result.answer, expected, s);
    assert.equal(result.steps.at(-1).balanced1234View.best, expected);
    assert.equal(result.steps.at(-1).final, true);
  }
});

test('1234 agrees with an independent brute-force oracle', () => {
  let seed = 1234;
  const alphabet = 'QWER';
  for (const length of [4, 8, 12]) {
    for (let sample = 0; sample < 30; sample++) {
      let s = '';
      for (let i = 0; i < length; i++) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        s += alphabet[seed % 4];
      }
      assert.equal(problem.builder(s).answer, oracle(s), s);
    }
  }
});

test('1234 trace keeps outside counts separate from the replacement window', () => {
  const result = problem.builder('QQWE');
  assert.ok(result.steps.every(step => step.balanced1234View));
  assert.ok(result.steps.every(step => step.codeLines.length === 1));
  assert.ok(result.steps.every(step => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  const valid = result.steps.find(step => step.balanced1234View.event === 'valid-check');
  assert.ok(valid);
  assert.equal(valid.balanced1234View.valid, true);
  assert.ok(Object.values(valid.balanced1234View.outside).every(count => count <= 1));
  const improved = result.steps.find(step => step.balanced1234View.event === 'update-best' && step.balanced1234View.improved);
  assert.ok(improved);
  assert.deepEqual(improved.balanced1234View.bestWindow, { left: 0, right: 0 });
});

test('1234 displayed Python agrees with the visualization', () => {
  const cases = [['QWER', 0], ['QQWE', 1], ['QQQW', 2], ['WQWRQQQW', 3]];
  const assertions = cases.map(([s, expected]) => `assert Solution().balancedString(${JSON.stringify(s)}) == ${expected}`).join('\n');
  const source = `from collections import Counter\n${problem.code.join('\n')}\n${assertions}`;
  const python = spawnSync('python', ['-c', source], { encoding: 'utf8' });
  assert.equal(python.status, 0, python.stderr);
});

test('1234 custom renderer handles every event in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderBalanced1234View(step)');
  const end = source.indexOf('\nfunction renderNice1248View(step)', start);
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: String,
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of problem.builder('WQWRQQQW').steps) {
      context.renderBalanced1234View(step);
      assert.match(element.innerHTML, /bal1234-viz/);
      assert.match(element.innerHTML, /bal1234-counts/);
      assert.match(element.innerHTML, /bal1234-check/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('1234 validates input and includes responsive scoped styles', () => {
  assert.throws(() => problem.builder('QWE'), /multiple of 4/);
  assert.throws(() => problem.builder('QWEX'), /only Q, W, E, and R/);
  assert.throws(() => problem.builder('QWER'.repeat(7)), /at most 24/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.bal1234-viz \{/);
  assert.match(css, /\.bal1234-cell\.replace \{/);
  assert.match(css, /\.bal1234-count\.excess \{/);
  assert.match(css, /@container \(max-width: 430px\)/);
});
