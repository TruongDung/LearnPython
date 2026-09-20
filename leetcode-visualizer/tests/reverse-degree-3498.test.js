const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[3498];

// Independent oracle: build the reversed alphabet as an explicit lookup table
// from the letters themselves, rather than reusing the 26 - rank arithmetic.
const REVERSED = new Map(
  [...'abcdefghijklmnopqrstuvwxyz'].reverse().map((letter, index) => [letter, index + 1]),
);

function oracle(s) {
  let total = 0;
  for (let index = 0; index < s.length; index += 1) {
    total += (index + 1) * REVERSED.get(s[index]);
  }
  return total;
}

test('3498 is registered in the string catalog with the expected signature', () => {
  assert.equal(problem.id, 3498);
  assert.equal(problem.slug, 'reverse-degree-of-a-string');
  assert.equal(problem.difficulty, 'easy');
  assert.equal(problem.category.key, 'string');
  assert.deepEqual(problem.tags.map((tag) => tag.key), ['simulation', 'math']);
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(1)');
  // The trace steps one source line at a time, so it must not be "semantic".
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.defaultInput, 'abc');
  assert.deepEqual(problem.extraParams, []);

  const code = problem.code.join('\n');
  assert.match(code, /def reverseDegree\(self, s: str\) -> int:/);
  // 1-indexed positions and the exact reversal constant are the whole problem.
  assert.match(code, /enumerate\(s, 1\)/);
  assert.match(code, /26 - \(ord\(char\) - ord\("a"\)\)/);
  assert.doesNotMatch(code, /25 - \(ord|27 - \(ord/);
  assert.deepEqual(problem.liveArgs('abc'), ['abc']);
});

test('3498 matches the published examples and the boundary letters', () => {
  const cases = [
    // LeetCode example 1: 26 + 50 + 72.
    ['abc', 148],
    // LeetCode example 2: 1 + 52 + 3 + 104.
    ['zaza', 160],
    // 'a' is the most valuable letter, 'z' the least.
    ['a', 26],
    ['z', 1],
    ['az', 26 + 2],
    ['za', 1 + 52],
  ];
  for (const [s, expected] of cases) {
    const run = problem.builder(s);
    assert.equal(run.answer, expected, `"${s}"`);
    assert.equal(run.steps.at(-1).reverseDegree3498View.answer, expected);
    assert.equal(run.steps.at(-1).final, true);
    assert.equal(run.steps.filter((step) => step.final).length, 1);
  }
});

test('3498 agrees with a lookup-table oracle on deterministic random strings', () => {
  let seed = 3498;
  const random = (max) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };
  for (let trial = 0; trial < 400; trial += 1) {
    const length = 1 + random(24);
    const s = Array.from({ length }, () => String.fromCharCode(97 + random(26))).join('');
    assert.equal(problem.builder(s).answer, oracle(s), `"${s}"`);
  }
});

test('3498 reverses the alphabet so that a=26 and z=1 with no off-by-one', () => {
  // A single character of each letter isolates the mapping exactly.
  for (let rank = 0; rank < 26; rank += 1) {
    const letter = String.fromCharCode(97 + rank);
    assert.equal(problem.builder(letter).answer, 26 - rank, letter);
  }
  // The whole alphabet in order must equal sum of i * (27 - i) for i = 1..26.
  const expected = Array.from({ length: 26 }, (_unused, index) => (index + 1) * (27 - (index + 1)))
    .reduce((sum, term) => sum + term, 0);
  assert.equal(problem.builder('abcdefghijklmnopqrstuvwxyz').answer, expected);
});

test('3498 trace steps one source line at a time through the loop', () => {
  const run = problem.builder('abc');
  assert.equal(run.steps.length, 12);
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
  // intro, init, then (loop header, value, accumulate) per character, then return.
  assert.deepEqual(run.steps.map((step) => step.codeLines[0]), [1, 2, 3, 4, 5, 3, 4, 5, 3, 4, 5, 6]);
  assert.deepEqual(run.steps.map((step) => step.reverseDegree3498View.event), [
    'rule', 'init',
    'take-char', 'reverse-value', 'accumulate',
    'take-char', 'reverse-value', 'accumulate',
    'take-char', 'reverse-value', 'accumulate',
    'return',
  ]);
  const at = (index) => run.steps[index].reverseDegree3498View;
  // total is unassigned until its own line runs.
  assert.equal(at(0).total, null);
  assert.equal(at(1).total, 0);
  // The loop header binds position and char but computes no value yet.
  assert.equal(at(2).position, 1);
  assert.equal(at(2).char, 'a');
  assert.equal(at(2).reversePosition, null);
  assert.equal(at(3).alphaIndex, 0);
  assert.equal(at(3).reversePosition, 26);
  assert.equal(at(3).product, null, 'the product belongs to the next line');
  assert.equal(at(4).product, 26);
  assert.equal(at(4).total, 26);
  // Second character: 'b' is rank 1, so 25, at position 2 → 50.
  assert.equal(at(6).reversePosition, 25);
  assert.equal(at(7).total, 76);
  const final = run.steps.at(-1).reverseDegree3498View;
  assert.deepEqual(final.terms, [26, 50, 72]);
  assert.equal(final.total, 148);
  assert.equal(final.stage, 2);
});

test('3498 cells reveal a value only once its line has executed', () => {
  const run = problem.builder('abc');
  const states = run.steps.map((step) => step.reverseDegree3498View.cells.map((cell) => cell.state));
  // Before the loop every cell is pending; at the end every cell is done.
  assert.deepEqual(states[1], ['pending', 'pending', 'pending']);
  assert.deepEqual(states.at(-1), ['done', 'done', 'done']);
  // The current cell moves left to right and never goes back.
  const currentIndexes = run.steps
    .map((step) => step.reverseDegree3498View.cells.findIndex((cell) => cell.state === 'current'))
    .filter((index) => index >= 0);
  assert.deepEqual(currentIndexes, [0, 0, 0, 1, 1, 1, 2, 2, 2]);
  // A pending cell must not leak its product.
  for (const step of run.steps) {
    for (const cell of step.reverseDegree3498View.cells) {
      if (cell.state === 'pending') {
        assert.equal(cell.product, null);
        assert.equal(cell.reversePosition, null);
        assert.equal(cell.alphaIndex, null);
      }
      if (cell.state === 'done') assert.equal(cell.product, cell.position * cell.reversePosition);
    }
  }
});

test('3498 validates the input', () => {
  assert.throws(() => problem.builder(''), /non-empty string/);
  assert.throws(() => problem.builder('   '), /non-empty string/);
  assert.throws(() => problem.builder('Abc'), /only lowercase English letters/);
  assert.throws(() => problem.builder('ab c'), /only lowercase English letters/);
  assert.throws(() => problem.builder('ab1'), /only lowercase English letters/);
  assert.throws(() => problem.builder('a'.repeat(41)), /up to 40 characters/);
  // The cap must leave room for the full 26-letter alphabet.
  assert.equal(problem.builder('abcdefghijklmnopqrstuvwxyz').steps.length, 26 * 3 + 3);
  // Surrounding whitespace is trimmed rather than rejected.
  assert.equal(problem.builder('  abc  ').answer, 148);
});

test('3498 displayed Python and the solution file agree with the visualizer', () => {
  const assertions = [
    'assert Solution().reverseDegree("abc") == 148',
    'assert Solution().reverseDegree("zaza") == 160',
    'assert Solution().reverseDegree("a") == 26',
    'assert Solution().reverseDegree("z") == 1',
    'assert Solution().reverseDegree("abcdefghijklmnopqrstuvwxyz") == sum(i * (27 - i) for i in range(1, 27))',
  ].join('\n');
  const displayed = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = path.resolve(__dirname, '../../Leetcode-sln/string/Leetcode_3498.py');
  const solution = spawnSync('python3', [solutionPath], { encoding: 'utf8' });
  assert.equal(solution.status, 0, solution.stderr);
});

function loadRenderer() {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderReverseDegree3498View(step)');
  const end = script.indexOf('\nfunction renderStep()', start);
  assert.ok(start >= 0 && end > start);
  const elements = new Map();
  const elementFor = (id) => {
    if (!elements.has(id)) elements.set(id, { innerHTML: '' });
    return elements.get(id);
  };
  const context = {
    lang: 'en',
    $: elementFor,
    escapeHtml: (value) => String(value ?? ''),
    pick: (value) => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);
  return { context, elementFor, script };
}

test('3498 renderer covers every trace state in English and Vietnamese', () => {
  const { context, elementFor, script } = loadRenderer();
  const runs = ['abc', 'zaza', 'a', 'z', 'abcdefghijklmnopqrstuvwxyz'].map((s) => problem.builder(s));
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderReverseDegree3498View(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /rd3498-viz/);
        assert.match(html, /rd3498-alphabet/);
        assert.match(html, /rd3498-strip/);
        assert.match(html, /rd3498-total/);
        assert.match(html, new RegExp(`(?:LINE|DÒNG) ${step.codeLines[0]}`));
        assert.doesNotMatch(html, /NaN|undefined|Infinity|null/);
        // The ruler always shows all 26 letters.
        assert.equal((html.match(/<span class="(?:active)?"><b>/g) || []).length, 26);
        if (step.final) assert.match(html, /rd3498-total ready/);
      }
    }
  }
  assert.match(script, /else if \(step\.reverseDegree3498View\)/);
});

test('3498 renderer highlights the current letter on the reversed ruler', () => {
  const { context, elementFor } = loadRenderer();
  const run = problem.builder('zaza');

  // On the 'z' steps the ruler must mark z (value 1), on the 'a' steps a (26).
  const forChar = (char, event) => run.steps.find(
    (step) => step.reverseDegree3498View.char === char && step.reverseDegree3498View.event === event,
  );
  context.renderReverseDegree3498View(forChar('z', 'reverse-value'));
  let html = elementFor('treeView').innerHTML;
  assert.match(html, /<span class="active"><b>z<\/b><small>1<\/small><\/span>/);
  assert.doesNotMatch(html, /<span class="active"><b>a<\/b>/);

  context.renderReverseDegree3498View(forChar('a', 'reverse-value'));
  html = elementFor('treeView').innerHTML;
  assert.match(html, /<span class="active"><b>a<\/b><small>26<\/small><\/span>/);

  // Exactly one letter is ever active.
  for (const step of run.steps) {
    context.renderReverseDegree3498View(step);
    const active = (elementFor('treeView').innerHTML.match(/<span class="active"><b>/g) || []).length;
    assert.ok(active <= 1, 'at most one ruler cell may be active');
  }
});

test('3498 renderer contrasts the correct reversal against both off-by-one forms', () => {
  const { context, elementFor } = loadRenderer();
  // 'b' has rank 1, so the three formulas give 24, 25 and 26.
  const step = problem.builder('abc').steps.find(
    (candidate) => candidate.reverseDegree3498View.char === 'b'
      && candidate.reverseDegree3498View.event === 'reverse-value',
  );
  context.renderReverseDegree3498View(step);
  const html = elementFor('treeView').innerHTML;
  assert.match(html, /rd3498-guard/);
  assert.match(html, /<span class="bad"><code>25 − 1<\/code><b>24<\/b>/);
  assert.match(html, /<span class="good"><code>26 − 1<\/code><b>25<\/b>/);
  assert.match(html, /<span class="bad"><code>27 − 1<\/code><b>26<\/b>/);

  // The guard is only shown while a character is being handled.
  context.renderReverseDegree3498View(problem.builder('abc').steps.at(-1));
  assert.doesNotMatch(elementFor('treeView').innerHTML, /rd3498-guard/);
});

test('3498 ships responsive scoped styles', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.rd3498-viz \{/);
  assert.match(css, /\.rd3498-cell\.current/);
  assert.match(css, /\.rd3498-cell\.pending/);
  assert.match(css, /\.rd3498-guard \.good/);
  assert.match(css, /\.rd3498-sum > span\.fresh/);
  assert.match(css, /\.rd3498-total\.ready/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
