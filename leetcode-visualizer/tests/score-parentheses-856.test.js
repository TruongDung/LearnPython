const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const problem = SUPPORTED[856];
const view = step => step.scoreParentheses856View;

function balanced(pairs, prefix = '', open = 0, close = 0, output = []) {
  if (prefix.length === pairs * 2) { output.push(prefix); return output; }
  if (open < pairs) balanced(pairs, prefix + '(', open + 1, close, output);
  if (close < open) balanced(pairs, prefix + ')', open, close + 1, output);
  return output;
}
function oracle(s) {
  // Each leaf () contributes 2^(number of enclosing pairs).
  let depth = 0, score = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else { depth--; if (s[i - 1] === '(') score += 2 ** depth; }
  }
  return score;
}

test('856 is registered with valid live arguments and handles examples and boundary scores', () => {
  assert.equal(problem.slug, 'score-of-parentheses');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.ok(problem.tags.some(tag => tag.key === 'parentheses'));
  assert.deepEqual(problem.liveArgs(' (()(())) '), ['(()(()))']);
  for (const [input, score] of [['()', 1], ['(())', 2], ['()()', 2], ['(()(()))', 6], ['(()())', 4], ['((()))', 4], ['()(())', 3], ['()'.repeat(25), 25], ['('.repeat(25) + ')'.repeat(25), 2 ** 24]]) {
    assert.equal(problem.builder(input).answer, score, input);
  }
  for (const bad of ['', ' ', '(', '((', ')(', '())', '[]', '(a)', '() ()', '()'.repeat(26), [], null, 12]) {
    assert.throws(() => problem.builder(bad));
    assert.throws(() => problem.liveArgs(bad));
  }
});

test('856 matches a depth-based leaf oracle for every balanced string up to seven pairs', () => {
  for (let pairs = 1; pairs <= 7; pairs++) {
    for (const input of balanced(pairs)) {
      const run = problem.builder(input), final = view(run.steps.at(-1));
      assert.equal(run.answer, oracle(input), input);
      assert.deepEqual(final.stack, [run.answer]);
      assert.equal(final.frames.length, 1);
      assert.equal(final.pairs.length, pairs);
      assert.ok(final.pairs.every(pair => pair.merged && pair.score === oracle(input.slice(pair.open, pair.close + 1))));
      assert.equal(final.frames[0].children.reduce((sum, child) => sum + child.score, 0), run.answer);
    }
  }
});

test('856 snapshots separate push, pop, calculation and parent addition at their source lines', () => {
  const run = problem.builder('(()(()))');
  for (let i = 0; i < run.steps.length; i++) {
    const step = run.steps[i], v = view(step), old = i ? view(run.steps[i - 1]) : null;
    assert.equal(step.codeLines.length, 1);
    assert.equal(step.codeLines[0], v.line);
    assert.ok(v.line >= 1 && v.line <= problem.code.length);
    assert.equal(v.frames.length, v.stack.length);
    v.frames.forEach((frame, level) => {
      assert.equal(frame.score, v.stack[level]);
      assert.equal(frame.children.reduce((sum, child) => sum + child.score, 0), frame.score);
    });
    if (v.event === 'push') assert.deepEqual(v.stack, [...old.stack, 0]);
    else if (v.event === 'pop') {
      assert.deepEqual(v.stack, old.stack.slice(0, -1));
      assert.equal(v.closing.inner, old.stack.at(-1));
      assert.equal(v.closing.score, null);
      assert.equal(v.pairs.length, old.pairs.length);
    } else if (v.event === 'calculate') {
      assert.deepEqual(v.stack, old.stack);
      assert.equal(v.closing.score, Math.max(1, 2 * v.closing.inner));
      assert.equal(v.closing.merged, false);
      assert.equal(v.pairs.at(-1).merged, false);
      assert.equal(v.pairs.length, old.pairs.length + 1);
    } else if (v.event === 'merge') {
      assert.deepEqual(v.stack.slice(0, -1), old.stack.slice(0, -1));
      assert.equal(v.stack.at(-1), old.stack.at(-1) + v.closing.score);
      assert.equal(v.pairs.at(-1).merged, true);
    } else if (old && v.event !== 'init') assert.deepEqual(v.stack, old.stack);
  }
  const firstCalculation = view(run.steps.find(step => view(step).event === 'calculate'));
  assert.equal(firstCalculation.pairs[0].merged, false, 'prior snapshot must not mutate after the merge');
  assert.deepEqual(view(run.steps[0]).stack, []);
  assert.deepEqual(view(run.steps[0]).pairs, []);
});

test('856 renderer makes root, stack top, pending addition and inside-out arithmetic visible', () => {
  const host = { innerHTML: '', querySelector: () => null };
  const ctx = { lang: 'vi', $: () => host, escapeHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;') };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/renderer-score-parentheses-856.js'), 'utf8'), ctx);
  for (const language of ['vi', 'en']) {
    ctx.lang = language;
    for (const input of ['()', '(())', '()()', '(()(()))', '('.repeat(25) + ')'.repeat(25)]) {
      const run = problem.builder(input);
      for (const step of run.steps) {
        const v = view(step);
        ctx.renderScoreParentheses856View(step);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
        assert.equal((host.innerHTML.match(/data-index="/g) || []).length, input.length);
        assert.equal((host.innerHTML.match(/data-level="/g) || []).length, v.stack.length);
        assert.equal((host.innerHTML.match(/data-open="/g) || []).length, v.pairs.length);
        if (v.event === 'pop') assert.match(host.innerHTML, language === 'vi' ? /Chưa tính pair_score/ : /pair_score not calculated/);
        if (v.event === 'calculate') assert.match(host.innerHTML, language === 'vi' ? /chờ cộng vào ô cha/ : /awaiting parent addition/);
      }
      assert.doesNotMatch(host.innerHTML, /class="sp856-char [^"]* current/);
      assert.match(host.innerHTML, language === 'vi' ? /Không nhân đôi ô gốc/ : /Do not double the root/);
      if (input === '(()(()))') assert.match(host.innerHTML, /2 × \(1 \+ 2\) = 6/);
    }
  }
});

test('856 displayed Python agrees with the leaf oracle, including the original 50-character limit', () => {
  const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
  const cases = [...balanced(7), '(()(()))', '()'.repeat(25), '('.repeat(25) + ')'.repeat(25)];
  const script = "import json,sys\npayload=json.load(sys.stdin)\nexec(payload['code'])\nprint(json.dumps([Solution().scoreOfParentheses(s) for s in payload['cases']]))";
  const result = spawnSync(python, ['-c', script], { input: JSON.stringify({ code: problem.code.join('\n'), cases }), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  assert.deepEqual(JSON.parse(result.stdout), cases.map(oracle));
});
