const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[1096];
const solve = (expression) => problem.builder(expression);

test('1096 is registered as a hard recursive-descent parsing lesson', () => {
  assert.equal(problem.id, 1096);
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.category.key, 'string');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.deepEqual(problem.liveArgs('{a,b}c'), ['{a,b}c']);
  assert.ok(problem.tags.some((tag) => tag.key === 'parsing'));
});

test('1096 handles the published examples and grammar operations', () => {
  assert.deepEqual(solve('{a,b}{c,{d,e}}').answer,
    ['ac', 'ad', 'ae', 'bc', 'bd', 'be']);
  assert.deepEqual(solve('{{a,z},a{b,c},{ab,z}}').answer,
    ['a', 'ab', 'ac', 'z']);
  assert.deepEqual(solve('a').answer, ['a']);
  assert.deepEqual(solve('abcd').answer, ['abcd']);
  assert.deepEqual(solve('{a,b,c}').answer, ['a', 'b', 'c']);
  assert.deepEqual(solve('a{b,c}{d,e}f{g,h}').answer,
    ['abdfg', 'abdfh', 'abefg', 'abefh', 'acdfg', 'acdfh', 'acefg', 'acefh']);
});

test('1096 gives concatenation higher precedence and removes duplicates', () => {
  assert.deepEqual(solve('{a,b},c{d,e}').answer, ['a', 'b', 'cd', 'ce']);
  assert.deepEqual(solve('{{a,b},{b,c}}').answer, ['a', 'b', 'c']);
  assert.deepEqual(solve('{a,a,a}{b,b}').answer, ['ab']);
  assert.deepEqual(solve('{{a,b}c,d{e,f}}g').answer, ['acg', 'bcg', 'deg', 'dfg']);
});

test('1096 trace exposes union, concatenation, recursion, and one Python line per step', () => {
  const run = solve('{a,b}{c,{d,e}}');
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
  assert.ok(run.steps.some((step) => step.braceExpansion1096View.operation === 'union'));
  assert.ok(run.steps.some((step) => step.braceExpansion1096View.operation === 'concat'));
  assert.ok(run.steps.some((step) => step.braceExpansion1096View.frames.length >= 5));
  assert.deepEqual(run.steps.at(-1).braceExpansion1096View.answer, run.answer);
  assert.equal(run.steps.at(-1).codeLines[0], 27);
  assert.equal(run.steps.at(-1).final, true);
});

test('1096 displayed Python agrees with the visualizer builder', () => {
  const assertions = [
    's = Solution()',
    'assert s.braceExpansionII("{a,b}{c,{d,e}}") == ["ac","ad","ae","bc","bd","be"]',
    'assert s.braceExpansionII("{{a,z},a{b,c},{ab,z}}") == ["a","ab","ac","z"]',
    'assert s.braceExpansionII("{{a,b},{b,c}}") == ["a","b","c"]',
    'assert s.braceExpansionII("a{b,c}{d,e}f{g,h}") == ["abdfg","abdfh","abefg","abefh","acdfg","acdfh","acefg","acefh"]',
  ].join('\n');
  const result = spawnSync('python', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});

test('1096 validates input and bounds the teaching trace', () => {
  for (const invalid of ['', '{}', '{a,}', '{,a}', '{a', 'a}', 'A', 'a b', 123]) {
    assert.throws(() => solve(invalid));
  }
  assert.throws(() => solve('a'.repeat(61)), /60/);
  const run = solve('{a,b}'.repeat(12));
  assert.equal(run.answer.length, 4096);
  assert.ok(run.steps.length <= 361);
  assert.equal(run.steps.at(-1).braceExpansion1096View.shortened, true);
});

test('1096 custom renderer covers every step in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderBraceExpansion1096View(step)');
  const end = source.indexOf('\nfunction renderWeakCharacters1996View(step)', start);
  assert.ok(start >= 0 && end > start);
  const element = {};
  const context = { lang: 'en', $: () => element, escapeHtml: String,
    pick: (value) => value?.en ?? value?.vi ?? value ?? '' };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of solve('{a,b}{c,{d,e}}').steps) {
      context.renderBraceExpansion1096View(step);
      assert.match(element.innerHTML, /be1096-viz/);
      assert.match(element.innerHTML, /be1096-token/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.be1096-viz \{/);
  assert.match(css, /\.be1096-token\.current/);
  assert.match(css, /\.be1096-frame\.active/);
});
