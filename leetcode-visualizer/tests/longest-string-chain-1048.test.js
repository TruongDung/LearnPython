const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const { test } = require('node:test');

const problem = require('../problems').SUPPORTED[1048];
const {
  JAVASCRIPT_ASSETS,
  STYLESHEET_ASSETS,
  readFrontendIndex,
  readFrontendJavaScript,
  readFrontendStyles,
} = require('./helpers/frontend-source');

function isPredecessor(shorter, longer) {
  if (longer.length !== shorter.length + 1) return false;
  let left = 0;
  let right = 0;
  let skipped = 0;
  while (right < longer.length) {
    if (left < shorter.length && shorter[left] === longer[right]) left += 1;
    else skipped += 1;
    right += 1;
  }
  return left === shorter.length && skipped === 1;
}

function oracle(words) {
  const ordered = [...words].sort((left, right) => left.length - right.length);
  const dp = Array(ordered.length).fill(1);
  for (let right = 0; right < ordered.length; right += 1) {
    for (let left = 0; left < right; left += 1) {
      if (isPredecessor(ordered[left], ordered[right])) {
        dp[right] = Math.max(dp[right], dp[left] + 1);
      }
    }
  }
  return Math.max(...dp);
}

test('1048 solves all official examples and reconstructs a valid optimal chain', () => {
  const first = problem.builder('a,b,ba,bca,bda,bdca');
  assert.equal(first.answer, 4);
  assert.equal(first.chain.length, 4);
  assert.ok(first.chain.slice(1).every((word, index) => isPredecessor(first.chain[index], word)));
  assert.equal(problem.builder('xbc,pcxbcf,xb,cxbc,pcxbc').answer, 5);
  assert.equal(problem.builder('abcd,dbqca').answer, 1);
});

test('1048 agrees with an independent pairwise-DP oracle', () => {
  const pool = [];
  const build = (prefix, remaining) => {
    if (prefix) pool.push(prefix);
    if (!remaining) return;
    for (const ch of 'abc') build(prefix + ch, remaining - 1);
  };
  build('', 5);
  let seed = 1048;
  for (let sample = 0; sample < 45; sample += 1) {
    const shuffled = [...pool];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const swap = seed % (index + 1);
      [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
    }
    const words = shuffled.slice(0, 1 + (seed % 45));
    assert.equal(problem.builder(words).answer, oracle(words));
  }
});

test('1048 trace exposes sorting, misses, hits, improvements, DP layers, and final chain', () => {
  const run = problem.builder(problem.defaultInput);
  assert.equal(run.steps[0].stringChain1048View.phase, 'sort');
  assert.ok(run.steps.some((step) => step.stringChain1048View.phase === 'miss'));
  const hit = run.steps.find((step) => step.stringChain1048View.phase === 'hit' && step.stringChain1048View.predecessor === 'bda');
  assert.equal(hit.stringChain1048View.currentWord, 'bdca');
  assert.equal(hit.stringChain1048View.predecessorLength, 3);
  assert.equal(hit.stringChain1048View.candidateLength, 4);
  assert.ok(run.steps.some((step) => step.stringChain1048View.phase === 'improve'));
  const final = run.steps.at(-1).stringChain1048View;
  assert.equal(final.phase, 'done');
  assert.equal(final.finalAnswer, 4);
  assert.deepEqual(final.chain, run.chain);
  assert.equal(final.dpEntries.length, 6);
});

test('1048 validates input type, word bounds, uniqueness, and count', () => {
  for (const input of ['', '[]', '["a",1]', 'A,ab', 'a,a', 'abcdefghijklmnopq', '{bad json}']) {
    assert.throws(() => problem.builder(input));
  }
  assert.throws(() => problem.builder(Array.from({ length: 1001 }, (_, index) => `a${index}`)));
});

test('1048 displayed Python and live args agree with the visualization', () => {
  const cases = [
    ['a', 'b', 'ba', 'bca', 'bda', 'bdca'],
    ['xbc', 'pcxbcf', 'xb', 'cxbc', 'pcxbc'],
    ['abcd', 'dbqca'],
    ['a', 'ab', 'ac', 'abc', 'abdc', 'xabdc'],
  ];
  assert.deepEqual(problem.liveArgs('a,b,ba'), [['a', 'b', 'ba']]);
  const source = `${problem.code.join('\n')}
import json, sys
cases = json.loads(sys.stdin.read())
solution = Solution()
actual = [solution.longestStrChain(words) for words in cases]
print(json.dumps(actual))
`;
  const run = spawnSync('python3', ['-c', source], { input: JSON.stringify(cases), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(JSON.parse(run.stdout), cases.map((words) => oracle(words)));
});

test('1048 is registered under String, DP, Hash Map, Sorting, and Google', () => {
  assert.equal(problem.id, 1048);
  assert.equal(problem.slug, 'longest-string-chain');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'string');
  for (const key of ['dp', 'hashmap', 'sorting']) assert.ok(problem.tags.some((tag) => tag.key === key));
  assert.ok(problem.companies.includes('google'));
  assert.equal(problem.debugMode, 'line-by-line');
});

test('1048 dedicated renderer, responsive styles, and roadmap status are wired', () => {
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-longest-string-chain-1048.js'));
  assert.ok(STYLESHEET_ASSETS.includes('longest-string-chain-1048.css'));
  const javascript = readFrontendJavaScript();
  const styles = readFrontendStyles();
  const index = readFrontendIndex();
  assert.match(javascript, /function renderLongestStringChain1048View\(step\)/);
  assert.match(javascript, /Delete one character to walk backward/);
  assert.match(styles, /\.sc1048-layer article\.chain/);
  assert.match(styles, /@container \(max-width:480px\)/);
  assert.ok(index.indexOf('renderer-longest-string-chain-1048.js') < index.indexOf('script.js?'));
  const roadmap = fs.readFileSync(require.resolve('../../docs/leetcode-string-study-roadmap.md'), 'utf8');
  assert.match(roadmap, /\[1048\. Longest String Chain\]\([^\n]+\) \| Medium \|  \| Có \|/);
});
