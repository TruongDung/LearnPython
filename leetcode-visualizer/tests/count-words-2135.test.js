const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const { test } = require('node:test');
const problem = require('../problems').SUPPORTED[2135];
const {
  JAVASCRIPT_ASSETS,
  STYLESHEET_ASSETS,
  readFrontendIndex,
  readFrontendJavaScript,
  readFrontendStyles,
} = require('./helpers/frontend-source');

function oracle(startWords, targetWords) {
  const keys = new Set(startWords.map((word) => [...word].sort().join('')));
  return targetWords.filter((target) => [...target].some((_, index) => {
    const remainder = [...target.slice(0, index), ...target.slice(index + 1)].sort().join('');
    return keys.has(remainder);
  })).length;
}

test('2135 solves official examples and counts each target once', () => {
  assert.equal(problem.builder('ant,act,tack', { targetWords: 'tack,act,acti' }).answer, 2);
  assert.equal(problem.builder('ab,a', { targetWords: 'abc,abcd' }).answer, 1);
  assert.equal(problem.builder('ab,ac', { targetWords: 'abc' }).answer, 1);
  assert.equal(problem.builder('g,uh', { targetWords: 'u,ga' }).answer, 1);
});

test('2135 agrees with an independent sorted-signature oracle', () => {
  const cases = [
    [['ab', 'xyz', 'mn'], ['abc', 'zyxq', 'mno', 'az']],
    [['a', 'bc', 'def'], ['za', 'cbd', 'fedg', 'abcd']],
    [['ace', 'bdf', 'xy'], ['caez', 'fbda', 'xyz', 'xy']],
  ];
  for (const [starts, targets] of cases) {
    const result = problem.builder(starts, { targetWords: targets });
    assert.equal(result.answer, oracle(starts, targets));
  }
});

test('2135 trace exposes start masks, removal attempts, matches, break, and verdicts', () => {
  const result = problem.builder('ant,act,tack', { targetWords: 'tack,act,acti' });
  assert.ok(result.steps.every((step) => step.countWords2135View));
  const built = result.steps.filter((step) => step.countWords2135View.phase === 'build');
  assert.equal(built.length, 3);
  assert.deepEqual(built.at(-1).countWords2135View.startEntries.map((entry) => entry.letters), ['ant', 'act', 'ackt']);

  const match = result.steps.find((step) => step.countWords2135View.phase === 'match');
  assert.equal(match.countWords2135View.currentTarget, 'tack');
  assert.equal(match.countWords2135View.removedChar, 'k');
  assert.equal(match.countWords2135View.candidateLetters, 'act');
  assert.equal(match.countWords2135View.matchedStart, 'act');

  const verdicts = result.steps.at(-1).countWords2135View.verdicts;
  assert.deepEqual(verdicts.map(({ word, matched }) => [word, matched]), [['tack', true], ['act', false], ['acti', true]]);
});

test('2135 validates unique lowercase letters and list bounds', () => {
  assert.throws(() => problem.builder('', { targetWords: 'ab' }), /startWords/);
  assert.throws(() => problem.builder('aa', { targetWords: 'ab' }), /ký tự lặp/);
  assert.throws(() => problem.builder('a1', { targetWords: 'abc' }), /a-z/);
  assert.throws(() => problem.builder('ab,ab', { targetWords: 'abc' }), /bị trùng/);
  assert.throws(() => problem.builder('ab', { targetWords: 'abb' }), /ký tự lặp/);
  assert.throws(() => problem.builder('ab', { targetWords: '' }), /targetWords/);
});

test('2135 displayed Python agrees with the visualization', () => {
  const code = problem.code.join('\n');
  const harness = `
s = Solution()
assert s.wordCount(["ant", "act", "tack"], ["tack", "act", "acti"]) == 2
assert s.wordCount(["ab", "ac"], ["abc"]) == 1
assert s.wordCount(["ab", "xyz", "mn"], ["abc", "zyxq", "mno", "az"]) == 3
`;
  const run = spawnSync('python3', ['-c', `${code}\n${harness}`], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('2135 is registered under String and Google with live arguments', () => {
  assert.equal(problem.id, 2135);
  assert.equal(problem.slug, 'count-words-obtained-after-adding-a-letter');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'string');
  assert.ok(problem.tags.some((tag) => tag.key === 'bitmask'));
  assert.ok(problem.tags.some((tag) => tag.key === 'hash-set'));
  assert.deepEqual(problem.liveArgs('ab,a', { targetWords: 'abc,za' }), [['ab', 'a'], ['abc', 'za']]);
});

test('2135 dedicated renderer, styles, and roadmap status are wired', () => {
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-count-words-2135.js'));
  assert.ok(STYLESHEET_ASSETS.includes('count-words-2135.css'));
  const javascript = readFrontendJavaScript();
  const styles = readFrontendStyles();
  const index = readFrontendIndex();
  assert.match(javascript, /function renderCountWords2135View\(step\)/);
  assert.match(javascript, /target − one letter/);
  assert.match(styles, /\.cw2135-transform/);
  assert.match(styles, /@container \(max-width:600px\)/);
  assert.ok(index.indexOf('renderer-count-words-2135.js') < index.indexOf('script.js?'));
  const roadmap = fs.readFileSync(require.resolve('../../docs/leetcode-string-study-roadmap.md'), 'utf8');
  assert.match(roadmap, /\[2135\. Count Words Obtained After Adding a Letter\]\([^\n]+\) \| Medium \|  \| Có \|/);
});
