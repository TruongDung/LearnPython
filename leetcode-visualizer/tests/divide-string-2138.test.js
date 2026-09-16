const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[2138];

function oracle(s, k, fill) {
  const groups = [];
  for (let start = 0; start < s.length; start += k) {
    groups.push(s.slice(start, start + k).padEnd(k, fill));
  }
  return groups;
}

test('2138 is registered as a string simulation lesson', () => {
  assert.equal(problem.id, 2138);
  assert.equal(problem.slug, 'divide-a-string-into-groups-of-size-k');
  assert.equal(problem.difficulty, 'easy');
  assert.equal(problem.category.key, 'string');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.match(problem.code.join('\n'), /def divideString\(self, s: str, k: int, fill: str\)/);
});

test('2138 matches both official examples', () => {
  assert.deepEqual(problem.builder('abcdefghi', { k: 3, fill: 'x' }).answer, ['abc', 'def', 'ghi']);
  assert.deepEqual(problem.builder('abcdefghij', { k: 3, fill: 'x' }).answer, ['abc', 'def', 'ghi', 'jxx']);
});

test('2138 agrees with an independent chunking oracle', () => {
  const samples = ['a', 'ab', 'abcdef', 'abcdefghijklmno'];
  for (const s of samples) {
    for (let k = 1; k <= Math.min(8, s.length + 2); k += 1) {
      assert.deepEqual(problem.builder(s, { k, fill: 'z' }).answer, oracle(s, k, 'z'), `s=${s}, k=${k}`);
    }
  }
});

test('2138 trace follows window, slice, check, optional pad, append, and return', () => {
  const result = problem.builder('abcdefghij', { k: 3, fill: 'x' });
  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  const operations = result.steps.map((step) => step.divideString2138View.operation);
  for (const operation of ['init', 'window', 'slice', 'check', 'pad', 'append', 'return']) {
    assert.ok(operations.includes(operation), operation);
  }
  const lastGroup = result.steps.filter((step) => step.divideString2138View.start === 9);
  assert.deepEqual(lastGroup.map((step) => step.codeLines[0]), [4, 5, 6, 7, 8]);
  const padView = lastGroup.find((step) => step.divideString2138View.operation === 'pad').divideString2138View;
  assert.equal(padView.rawGroup, 'j');
  assert.equal(padView.currentGroup, 'jxx');
  assert.equal(padView.missing, 2);
  assert.deepEqual(result.steps.at(-1).divideString2138View.answer, ['abc', 'def', 'ghi', 'jxx']);
});

test('2138 displayed and repository Python solutions pass representative cases', () => {
  const assertions = [
    "assert Solution().divideString('abcdefghi', 3, 'x') == ['abc', 'def', 'ghi']",
    "assert Solution().divideString('abcdefghij', 3, 'x') == ['abc', 'def', 'ghi', 'jxx']",
    "assert Solution().divideString('a', 4, 'z') == ['azzz']",
  ].join('\n');
  const displayed = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = require.resolve('../../Leetcode-sln/string/Leetcode_2138.py');
  const repository = spawnSync('python3', [solutionPath], { encoding: 'utf8' });
  assert.equal(repository.status, 0, repository.stderr);
});

test('2138 custom renderer covers every state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderDivideString2138View(step)');
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
  const result = problem.builder('abcdefghij', { k: 3, fill: 'x' });
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of result.steps) {
      context.renderDivideString2138View(step);
      assert.match(element.innerHTML, /ds2138-viz/);
      assert.match(element.innerHTML, /ds2138-source/);
      assert.match(element.innerHTML, /ds2138-output/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('2138 validates visual inputs and includes scoped responsive styles', () => {
  assert.throws(() => problem.builder('', { k: 3, fill: 'x' }), /1 to 24 lowercase/);
  assert.throws(() => problem.builder('ABC', { k: 3, fill: 'x' }), /1 to 24 lowercase/);
  assert.throws(() => problem.builder('abc', { k: 0, fill: 'x' }), /between 1 and 12/);
  assert.throws(() => problem.builder('abc', { k: 3, fill: 'xy' }), /exactly one lowercase/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.ds2138-viz \{/);
  assert.match(css, /\.ds2138-slot\.fill/);
  assert.match(css, /@container \(max-width: 500px\)/);
});
