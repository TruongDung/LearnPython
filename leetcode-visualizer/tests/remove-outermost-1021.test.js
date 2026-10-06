const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const problem = SUPPORTED[1021];
const view = step => step.removeOutermost1021View;

function balanced(pairs, prefix = '', open = 0, close = 0, output = []) {
  if (prefix.length === pairs * 2) { output.push(prefix); return output; }
  if (open < pairs) balanced(pairs, prefix + '(', open + 1, close, output);
  if (close < open) balanced(pairs, prefix + ')', open, close + 1, output);
  return output;
}
function oracle(s) {
  let start = 0, depth = 0, output = '';
  for (let i = 0; i < s.length; i++) {
    depth += s[i] === '(' ? 1 : -1;
    if (depth === 0) { output += s.slice(start + 1, i); start = i + 1; }
  }
  return output;
}

test('1021 is registered, validates inputs and returns the published examples', () => {
  assert.equal(problem.slug, 'remove-outermost-parentheses');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.deepEqual(problem.liveArgs(' (()())(()) '), ['(()())(())']);
  for (const [input, answer] of [['(()())(())', '()()()'], ['(()())(())(()(()))', '()()()()(())'], ['()()', ''], ['()', ''], ['(())', '()'], ['((()))', '(())']]) {
    assert.equal(problem.builder(input).answer, answer);
  }
  for (const bad of ['', '   ', '((', '())', ')(', '(a)', '() ()', '[]', '('.repeat(41) + ')'.repeat(41), [], null, 12]) {
    assert.throws(() => problem.builder(bad));
    assert.throws(() => problem.liveArgs(bad));
  }
});

test('1021 agrees with a primitive-slicing oracle for every balanced string up to seven pairs', () => {
  for (let pairs = 1; pairs <= 7; pairs++) {
    for (const input of balanced(pairs)) {
      const run = problem.builder(input), last = view(run.steps.at(-1));
      assert.equal(run.answer, oracle(input), input);
      assert.equal(last.depth, 0);
      assert.equal(last.removed.length, last.groups.length * 2);
      assert.equal(last.kept.length + last.removed.length, input.length);
      assert.equal(last.kept.map(index => input[index]).join(''), run.answer);
      assert.deepEqual(last.removed, last.groups.flatMap(group => [group.start, group.end]));
    }
  }
  assert.equal(problem.builder('()'.repeat(40)).answer, '');
  assert.equal(problem.builder('('.repeat(40) + ')'.repeat(40)).answer, '('.repeat(39) + ')'.repeat(39));
});

test('1021 depth and output change only after their own Python source line executes', () => {
  const run = problem.builder('(()())(())');
  for (let i = 0; i < run.steps.length; i++) {
    const step = run.steps[i], v = view(step), old = i > 0 ? view(run.steps[i - 1]) : null;
    assert.equal(step.codeLines.length, 1);
    const line = step.codeLines[0];
    assert.ok(line >= 1 && line <= problem.code.length);
    assert.equal(line, v.line);
    if (v.event === 'read') {
      assert.equal(v.depthBefore, v.depth);
      assert.equal(v.decisions[v.index], null);
    }
    if (line === 9) assert.equal(v.depth, old.depth + 1);
    else if (line === 11) assert.equal(v.depth, old.depth - 1);
    else if (old && line !== 4) assert.equal(v.depth, old.depth);
    if (line === 8 || line === 13) {
      assert.equal(v.result, old.result + v.s[v.index]);
      assert.equal(v.decisions[v.index], 'keep');
      assert.equal(v.kept.length, old.kept.length + 1);
    } else if (old) assert.equal(v.result, old.result);
    if (v.event === 'open-check') {
      assert.equal(v.depth, v.depthBefore);
      assert.equal(v.decision, v.depthBefore > 0 ? 'keep-pending' : 'remove');
    }
    if (v.event === 'close-check') {
      assert.equal(v.depth, v.depthBefore - 1);
      assert.equal(v.decision, v.depth > 0 ? 'keep-pending' : 'remove');
    }
    if (v.decision === 'keep-pending') {
      assert.equal(v.decisions[v.index], null);
      assert.ok(!v.kept.includes(v.index));
    }
  }
  // Earlier snapshots remain immutable after the entire simulation completes.
  assert.equal(view(run.steps[0]).result, '');
  assert.deepEqual(view(run.steps[0]).removed, []);
  assert.ok(view(run.steps[0]).decisions.every(value => value === null));
});

test('1021 renderer explains groups, pending appends, discarded outer pairs and empty output', () => {
  const host = { innerHTML: '', querySelector: () => null };
  const ctx = { lang: 'vi', $: () => host, escapeHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;') };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/renderer-remove-outermost-1021.js'), 'utf8'), ctx);
  for (const language of ['vi', 'en']) {
    ctx.lang = language;
    for (const input of ['(()())(())', '()', '()'.repeat(40), '('.repeat(40) + ')'.repeat(40)]) {
      const run = problem.builder(input);
      for (const step of run.steps) {
        const v = view(step);
        ctx.renderRemoveOutermost1021View(step);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
        assert.equal((host.innerHTML.match(/data-index="/g) || []).length, input.length);
        assert.equal((host.innerHTML.match(/data-source-index="/g) || []).length, v.kept.length);
        assert.equal((host.innerHTML.match(/class="ro1021-char remove/g) || []).length, v.removed.length);
        if (v.decision === 'keep-pending') assert.match(host.innerHTML, language === 'vi' ? /CHỜ APPEND/ : /AWAIT APPEND/);
      }
      assert.equal((host.innerHTML.match(/class="ro1021-char remove/g) || []).length, view(run.steps.at(-1)).groups.length * 2);
      assert.doesNotMatch(host.innerHTML, /class="ro1021-char [^"]* current"/);
      if (!run.answer) assert.match(host.innerHTML, language === 'vi' ? /Chuỗi rỗng/ : /Empty string/);
    }
  }
});

test('1021 displayed Python computes the same results, including long inputs outside the UI cap', () => {
  const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
  const cases = [...balanced(6), '()', '()'.repeat(50000), '('.repeat(50000) + ')'.repeat(50000)];
  const script = "import json,sys\npayload=json.load(sys.stdin)\nexec(payload['code'])\nprint(json.dumps([Solution().removeOuterParentheses(s) for s in payload['cases']]))";
  const result = spawnSync(python, ['-c', script], { input: JSON.stringify({ code: problem.code.join('\n'), cases }), encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  assert.deepEqual(JSON.parse(result.stdout), cases.map(oracle));
});
