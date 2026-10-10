const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[843];

const DEFAULT_WORDS = 'acckzz,ccbazz,eiowzz,abcczz';
const WORDS = ['acckzz', 'ccbazz', 'eiowzz', 'abcczz'];
const matches = (a, b) => {
  let count = 0;
  for (let k = 0; k < 6; k++) if (a[k] === b[k]) count++;
  return count;
};

// Seeded pseudo-random 6-letter words for fuzz testing.
function makeWords(count, seed) {
  let state = seed >>> 0;
  const rand = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 0x100000000; };
  const set = new Set();
  while (set.size < count) {
    let word = '';
    for (let k = 0; k < 6; k++) word += String.fromCharCode(97 + Math.floor(rand() * 6));
    set.add(word);
  }
  return [...set];
}

test('843 finds every possible secret in the default wordlist', () => {
  for (const secret of WORDS) {
    const result = problem.builder(DEFAULT_WORDS, { secret });
    assert.equal(result.answer, secret, `secret=${secret}`);
    assert.equal(result.steps.at(-1).final, true);
    const guesses = result.steps.filter((s) => s.codeLines[0] === 16).length;
    assert.ok(guesses >= 1 && guesses <= 10, `guesses=${guesses}`);
  }
});

test('843 minimax finds the secret on random wordlists within 10 guesses', () => {
  for (let seed = 1; seed <= 15; seed++) {
    const words = makeWords(12, seed);
    const secret = words[(seed * 5) % words.length];
    const result = problem.builder(words.join(','), { secret });
    assert.equal(result.answer, secret, `seed=${seed}`);
    const guesses = result.steps.filter((s) => s.codeLines[0] === 16).length;
    assert.ok(guesses <= 10, `seed=${seed} guesses=${guesses}`);
  }
});

test('843 trace filters candidates consistently with the master answers', () => {
  const secret = 'eiowzz';
  const result = problem.builder(DEFAULT_WORDS, { secret });
  let candidates = [...WORDS];
  for (const step of result.steps) {
    if (step.codeLines[0] !== 16) continue;
    const guess = step.vars.find((v) => v.name === 'guess').value;
    const x = step.vars.find((v) => v.name === 'x = số vị trí trùng').value;
    assert.equal(x, matches(guess, secret), `guess=${guess}`);
    assert.ok(candidates.includes(guess));
    candidates = candidates.filter((w) => matches(w, guess) === x);
    assert.ok(candidates.includes(secret), 'secret must survive filtering');
  }
  assert.equal(result.answer, secret);
});

test('843 minimax picks the candidate with the smallest worst-group', () => {
  const result = problem.builder(DEFAULT_WORDS, { secret: 'abcczz' });
  // First scoring round: every candidate step must show score = max(groups)
  // and the guessed word must be one of the minimal-score candidates.
  const scoring = result.steps.filter((s) => s.codeLines[0] === 12).slice(0, WORDS.length);
  assert.equal(scoring.length, WORDS.length);
  let minScore = Infinity;
  for (const step of scoring) {
    const score = step.vars.find((v) => v.name === 'score = max(groups)').value;
    const groups = JSON.parse(step.vars.find((v) => v.name === 'groups[số vị trí trùng]').value);
    assert.equal(score, Math.max(...groups));
    assert.equal(groups.reduce((a, b) => a + b, 0), WORDS.length);
    minScore = Math.min(minScore, score);
  }
  const guessStep = result.steps.find((s) => s.codeLines[0] === 16);
  const guess = guessStep.vars.find((v) => v.name === 'guess').value;
  const guessScore = scoring.find((s) => s.title.en.includes(`"${guess}"`))
    .vars.find((v) => v.name === 'score = max(groups)').value;
  assert.equal(guessScore, minScore);
});

test('843 validates wordlist and secret without silently accepting bad input', () => {
  assert.throws(() => problem.builder('', { secret: 'acckzz' }), /wordlist/);
  assert.throws(() => problem.builder('abc,defghi', { secret: 'acckzz' }), /6 chữ cái/);
  assert.throws(() => problem.builder('acckzz,acckzz', { secret: 'acckzz' }), /trùng/);
  // uppercase được chuẩn hóa thành lowercase
  const upper = problem.builder('ACCKZZ,CCBAZZ', { secret: 'ACCKZZ' });
  assert.equal(upper.answer, 'acckzz');
  assert.throws(() => problem.builder(DEFAULT_WORDS, { secret: 'zzzzzz' }), /nằm trong wordlist/);
  assert.throws(() => problem.builder(DEFAULT_WORDS, { secret: 'abc' }), /6 chữ cái/);
  assert.throws(() => problem.builder('zzzzzz,qqqqqq', {}), /nằm trong wordlist/);
  // single-word wordlist: first guess wins immediately
  const solo = problem.builder('qwerty', { secret: 'qwerty' });
  assert.equal(solo.answer, 'qwerty');
});

test('843 displayed Python runs the real minimax against a fake master', () => {
  const code = problem.code.join('\n');
  const harness = `
class Master:
    def __init__(self, secret):
        self.secret = secret
        self.guesses = []
    def guess(self, word):
        self.guesses.append(word)
        return sum(a == b for a, b in zip(word, self.secret))

for secret in ["acckzz", "ccbazz", "eiowzz", "abcczz"]:
    m = Master(secret)
    Solution().findSecretWord(["acckzz", "ccbazz", "eiowzz", "abcczz"], m)
    assert secret in m.guesses, secret
    assert len(m.guesses) <= 10, (secret, m.guesses)
`;
  const run = spawnSync('python3', ['-c', `${code}\n${harness}\n`], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('843 trace uses single code lines within the displayed source', () => {
  const result = problem.builder(DEFAULT_WORDS, { secret: 'ccbazz' });
  assert.ok(result.steps.length > 5);
  for (const step of result.steps) {
    assert.ok(step.codeLines.length >= 1);
    assert.ok(step.codeLines.every((line) => line >= 1 && line <= problem.code.length));
    assert.ok(step.title.vi && step.title.en);
    assert.ok(step.note.vi && step.note.en);
  }
  assert.equal(result.steps.filter((s) => s.final).length, 1);
});

test('843 is registered under interview with Google-relevant metadata', () => {
  assert.equal(problem.id, 843);
  assert.equal(problem.slug, 'guess-the-word');
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.category.key, 'string');
  assert.ok(problem.tags.some((t) => t.key === 'minimax'));
  assert.ok(problem.extraParams.some((p) => p.key === 'secret'));
  assert.equal(problem.code.length, 19);
});
