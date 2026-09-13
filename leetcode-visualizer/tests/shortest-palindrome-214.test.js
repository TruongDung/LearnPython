const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[214];

function oracle(s) {
  let prefixLength = s.length;
  while (prefixLength > 0) {
    const prefix = s.slice(0, prefixLength);
    if (prefix === [...prefix].reverse().join('')) break;
    prefixLength -= 1;
  }
  const suffix = s.slice(prefixLength);
  return [...suffix].reverse().join('') + s;
}

test('214 is registered with the KMP solution and official signature', () => {
  assert.equal(problem.id, 214);
  assert.equal(problem.slug, 'shortest-palindrome');
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.match(problem.code.join('\n'), /def shortestPalindrome\(self, s: str\) -> str/);
  assert.ok(problem.tags.some((tag) => tag.key === 'kmp'));
});

test('214 matches the official examples and empty input', () => {
  const cases = [
    ['aacecaaa', 'aaacecaaa'],
    ['abcd', 'dcbabcd'],
    ['', ''],
  ];
  for (const [s, expected] of cases) {
    const built = problem.builder(s);
    assert.equal(built.answer, expected);
    assert.equal(built.steps.at(-1).shortestPalindrome214View.answer, expected);
    assert.equal(built.steps.at(-1).final, true);
  }
});

test('214 builder agrees with a direct longest-palindromic-prefix oracle', () => {
  let seed = 214;
  for (let n = 0; n <= 12; n += 1) {
    for (let sample = 0; sample < 80; sample += 1) {
      let s = '';
      for (let i = 0; i < n; i += 1) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        s += String.fromCharCode(97 + seed % 5);
      }
      assert.equal(problem.builder(s).answer, oracle(s), s);
    }
  }
});

test('214 trace exposes KMP comparisons, fallback, lps writes, and construction', () => {
  const built = problem.builder('aacecaaa');
  assert.ok(built.steps.length > 50);
  assert.ok(built.steps.every((step) => step.codeLines.length === 1));
  const operations = new Set(built.steps.map((step) => step.shortestPalindrome214View.operation));
  for (const operation of ['reverse', 'combine', 'init-lps', 'loop', 'mismatch', 'fallback', 'match-check', 'extend', 'write-lps', 'palindrome-prefix', 'suffix', 'return']) {
    assert.ok(operations.has(operation), operation);
  }
  const final = built.steps.at(-1).shortestPalindrome214View;
  assert.equal(final.palindromeLength, 7);
  assert.equal(final.palindromePrefix, 'aacecaa');
  assert.equal(final.suffix, 'a');
  assert.equal(final.addFront, 'a');
});

test('214 displayed Python and solution file agree with the oracle', () => {
  let seed = 21;
  const cases = [['', '']];
  for (let n = 1; n <= 12; n += 1) {
    for (let sample = 0; sample < 12; sample += 1) {
      let s = '';
      for (let i = 0; i < n; i += 1) {
        seed = (seed * 1103515245 + 12345) >>> 0;
        s += String.fromCharCode(97 + seed % 6);
      }
      cases.push([s, oracle(s)]);
    }
  }
  const assertions = cases.map(([s, expected]) => `assert Solution().shortestPalindrome(${JSON.stringify(s)}) == ${JSON.stringify(expected)}`).join('\n');
  const displayed = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = path.resolve(__dirname, '../../Leetcode-sln/string/Leetcode_214.py');
  const source = fs.readFileSync(solutionPath, 'utf8').split('if __name__ == "__main__":')[0];
  const fileRun = spawnSync('python3', ['-c', `${source}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(fileRun.status, 0, fileRun.stderr);
});

test('214 custom renderer covers every phase in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderShortestPalindrome214View(step)');
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
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const s of ['aacecaaa', 'abcd', '']) {
      for (const step of problem.builder(s).steps) {
        context.renderShortestPalindrome214View(step);
        assert.match(element.innerHTML, /sp214-viz/);
        assert.match(element.innerHTML, /s \+ # \+ reverse\(s\)/);
        assert.match(element.innerHTML, new RegExp(`(?:LINE|DÒNG) ${step.codeLines[0]}`));
        assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
      }
    }
  }
});

test('214 validates visual input and includes responsive scoped styles', () => {
  assert.throws(() => problem.builder('Aba'), /lowercase/);
  assert.throws(() => problem.builder('a b'), /lowercase/);
  assert.throws(() => problem.builder('a'.repeat(17)), /at most 16/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.sp214-viz \{/);
  assert.match(css, /\.sp214-cell\.mismatch/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
