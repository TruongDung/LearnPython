const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const problem = SUPPORTED[1541], view = step => step.minInsertions1541View;

const targets = [['']];
function balancedTargets(pairs) {
  if (targets[pairs]) return targets[pairs];
  return targets[pairs] = Array.from({ length: pairs }, (_, inner) =>
    balancedTargets(inner).flatMap(a => balancedTargets(pairs - 1 - inner).map(b => '(' + a + '))' + b))).flat();
}
function oracle(s) {
  // Enumerate balanced strings via S = '(' S '))' S, then find the shortest
  // containing the original as a subsequence. This does not use need/greedy.
  for (let pairs = Math.ceil(s.length / 3); pairs <= s.length; pairs++) {
    for (const target of balancedTargets(pairs)) {
      let i = 0;
      for (const ch of target) if (ch === s[i]) i++;
      if (i === s.length) return target.length - s.length;
    }
  }
  throw new Error('No balanced supersequence');
}
function isBalanced(s) {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else {
      if (depth === 0 || s[++i] !== ')') return false;
      depth--;
    }
  }
  return depth === 0;
}

test('1541 examples, input validation, and visualization limit are explicit', () => {
  assert.equal(problem.slug, 'minimum-insertions-to-balance-a-parentheses-string');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.ok(problem.tags.some(tag => tag.key === 'parentheses'));
  for (const [s, answer] of [['(()))', 1], ['())', 0], ['))())(', 3], [')()(', 5], ['(', 2], [')', 2], ['()', 1], ['('.repeat(80), 160], [')'.repeat(80), 40]]) {
    assert.equal(problem.builder(s).answer, answer, s);
  }
  assert.deepEqual(problem.liveArgs(' )()( '), [')()(']);
  for (const bad of ['', '  ', '[]', '() ()', 'a', null, [], 123]) {
    assert.throws(() => problem.builder(bad));
    assert.throws(() => problem.liveArgs(bad));
  }
  assert.throws(() => problem.builder('('.repeat(81)), /80/);
  assert.equal(problem.liveArgs('('.repeat(100000))[0].length, 100000);
  assert.throws(() => problem.liveArgs('('.repeat(100001)));
});

test('1541 produces a minimum balanced supersequence for every string up to seven characters', () => {
  for (let length = 1; length <= 7; length++) {
    for (let mask = 0; mask < 2 ** length; mask++) {
      const s = Array.from({ length }, (_, i) => mask & (1 << i) ? '(' : ')').join('');
      const run = problem.builder(s), final = view(run.steps.at(-1));
      assert.equal(run.answer, oracle(s), s);
      assert.ok(isBalanced(final.tokens.map(token => token.ch).join('')), s);
      assert.equal(final.tokens.filter(token => !token.inserted).map(token => token.ch).join(''), s);
      assert.equal(final.tokens.length - s.length, run.answer);
      assert.equal(final.fixes.length, run.answer);
    }
  }
});

test('1541 code lines update counters separately and preserve snapshots', () => {
  const run = problem.builder(')()('), seen = new Set();
  run.steps.forEach((step, i) => {
    const v = view(step), previous = i ? view(run.steps[i - 1]) : null;
    seen.add(v.event);
    assert.deepEqual(step.codeLines, [v.line]);
    assert.ok(v.line >= 2 && v.line <= problem.code.length);
    if (['insert-open', 'insert-close'].includes(v.event)) {
      assert.equal(v.insertions, previous.insertions + 1);
      assert.equal(v.need, previous.need);
      assert.equal(v.fixes.length, previous.fixes.length + 1);
    } else if (['finish-pair', 'close'].includes(v.event)) {
      assert.equal(v.need, previous.need - 1);
      assert.equal(v.insertions, previous.insertions);
    } else if (v.event === 'open') assert.equal(v.need, previous.need + 2);
    else if (v.event === 'reset-need') assert.equal(v.need, 1);
    else if (['read', 'branch', 'check-odd', 'close-branch', 'check-missing'].includes(v.event)) {
      assert.equal(v.need, previous.need);
      assert.equal(v.insertions, previous.insertions);
      assert.deepEqual(v.tokens, previous.tokens);
    }
    if (!step.final && v.insertions !== null) assert.equal(v.tokens.filter(token => token.inserted).length, v.insertions);
    const originalTokens = v.tokens.filter(token => !token.inserted);
    assert.deepEqual(originalTokens.map(token => token.index), originalTokens.map((_, index) => index));
  });
  for (const event of ['insert-open', 'insert-close', 'reset-need', 'finish-pair', 'return']) assert.ok(seen.has(event));
  assert.deepEqual(view(run.steps[0]).tokens, []);
  const before = view(run.steps.find(step => view(step).event === 'check-missing'));
  assert.equal(before.need, -1);
  assert.equal(before.insertions, 0);
  assert.equal(before.tokens.length, 1);
  const final = view(run.steps.at(-1));
  assert.equal(final.insertions, 3);
  assert.equal(final.need, 2, 'return must not reset the Python need variable');
  assert.equal(final.answer, 5);
});

test('1541 renderer distinguishes original, inserted, suffix and incomplete prefixes in both languages', () => {
  const host = { innerHTML: '', querySelector: () => null };
  const ctx = { lang: 'vi', $: () => host, escapeHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;') };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/renderer-min-insertions-1541.js'), 'utf8'), ctx);
  for (const lang of ['vi', 'en']) {
    ctx.lang = lang;
    for (const s of [')()(', '())', '(()))', '('.repeat(80)]) {
      const run = problem.builder(s);
      for (const step of run.steps) {
        ctx.renderMinInsertions1541View(step);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
        assert.equal((host.innerHTML.match(/data-index="/g) || []).length, s.length);
        assert.equal((host.innerHTML.match(/data-token="/g) || []).length, view(step).tokens.length);
        assert.equal((host.innerHTML.match(/data-fix="/g) || []).length, view(step).fixes.length);
        if (!step.final) assert.match(host.innerHTML, lang === 'vi' ? /Phần chuỗi đã xử lý/ : /Processed prefix/);
      }
      assert.match(host.innerHTML, lang === 'vi' ? /Chuỗi đã sửa, hợp lệ/ : /Repaired balanced string/);
      assert.doesNotMatch(host.innerHTML, /class="mi1541-char[^"\n]* current/);
    }
  }
});

test('1541 displayed Python agrees with independent small-case oracle and original 100000 limit', () => {
  const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
  const small = Array.from({ length: 128 }, (_, mask) => Array.from({ length: 7 }, (_, i) => mask & (1 << i) ? '(' : ')').join(''));
  const cases = [...small, '('.repeat(100000), ')'.repeat(100000), '())'.repeat(33333)];
  const script = "import json,sys\npayload=json.load(sys.stdin)\nexec(payload['code'])\nprint(json.dumps([Solution().minInsertions(s) for s in payload['cases']]))";
  const result = spawnSync(python, ['-c', script], { input: JSON.stringify({ code: problem.code.join('\n'), cases }), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  assert.deepEqual(JSON.parse(result.stdout), [...small.map(oracle), 200000, 50000, 0]);
});
