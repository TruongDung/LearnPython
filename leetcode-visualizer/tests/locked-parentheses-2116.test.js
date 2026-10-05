const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const problem = SUPPORTED[2116], view = step => step.lockedParentheses2116View;

function valid(s) {
  let depth = 0;
  for (const ch of s) {
    depth += ch === '(' ? 1 : -1;
    if (depth < 0) return false;
  }
  return depth === 0;
}
function oracle(s, locked) {
  // Try every permitted assignment; independent of directional capacity scans.
  const free = [...locked].flatMap((bit, i) => bit === '0' ? [i] : []);
  for (let mask = 0; mask < 2 ** free.length; mask++) {
    const candidate = [...s];
    free.forEach((index, bit) => candidate[index] = mask & (1 << bit) ? '(' : ')');
    if (valid(candidate.join(''))) return true;
  }
  return false;
}
function casesThrough(max) {
  const output = [];
  for (let n = 1; n <= max; n++) {
    for (let chars = 0; chars < 2 ** n; chars++) {
      const s = Array.from({ length: n }, (_, i) => chars & (1 << i) ? '(' : ')').join('');
      for (let bits = 0; bits < 2 ** n; bits++) {
        const locked = Array.from({ length: n }, (_, i) => bits & (1 << i) ? '1' : '0').join('');
        output.push([s, locked]);
      }
    }
  }
  return output;
}

test('2116 validates paired inputs and matches published examples and boundary behavior', () => {
  assert.equal(problem.slug, 'check-if-a-parentheses-string-can-be-valid');
  assert.equal(problem.extraParams[0].type, 'string');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.ok(problem.tags.some(tag => tag.key === 'parentheses'));
  assert.deepEqual(problem.liveArgs(' ))())) ', { locked: ' 010100 ' }), ['))()))', '010100']);
  for (const [s, locked, answer] of [['))()))', '010100', true], ['()()', '0000', true], [')', '0', false], ['(((())(((())', '111111010111', true], ['((', '11', false], ['))', '11', false], ['()', '11', true], [')(', '00', true], ['('.repeat(80), '0'.repeat(80), true], ['('.repeat(80), '1'.repeat(80), false]]) {
    assert.equal(problem.builder(s, { locked }).answer, answer, `${s}/${locked}`);
  }
  for (const [s, params] of [['', { locked: '' }], ['()', {}], ['()', { locked: 0 }], ['()', { locked: '0' }], ['()', { locked: '02' }], ['(x', { locked: '00' }], ['() ()', { locked: '00000' }], [null, { locked: '0' }]]) {
    assert.throws(() => problem.builder(s, params));
    assert.throws(() => problem.liveArgs(s, params));
  }
  assert.throws(() => problem.builder('('.repeat(81), { locked: '0'.repeat(81) }), /80/);
  assert.equal(problem.liveArgs('('.repeat(100000), { locked: '0'.repeat(100000) })[0].length, 100000);
  assert.throws(() => problem.liveArgs('('.repeat(100001), { locked: '0'.repeat(100001) }));
});

test('2116 checks every s/locked combination through length six against exhaustive assignments', () => {
  for (const [s, locked] of casesThrough(6)) {
    const run = problem.builder(s, { locked }), final = view(run.steps.at(-1));
    assert.equal(run.answer, oracle(s, locked), `${s}/${locked}`);
    assert.equal(final.answer, run.answer);
    assert.ok(run.steps.at(-1).final);
    assert.ok(run.steps.slice(0, -1).every(step => !step.final && view(step).answer === null && view(step).witness === null));
    if (run.answer) {
      assert.ok(valid(final.witness), `${s}/${locked} → ${final.witness}`);
      assert.equal(final.witness.length, s.length);
      [...s].forEach((ch, i) => { if (locked[i] === '1') assert.equal(final.witness[i], ch); });
      assert.equal(final.forward.status, 'passed');
      assert.equal(final.backward.status, 'passed');
      assert.equal(final.forward.trail.length, s.length);
      assert.equal(final.backward.trail.length, s.length);
    } else assert.equal(final.witness, null);
  }
});

test('2116 detects odd length and distinguishes unrepairable prefixes from suffixes', () => {
  const odd = view(problem.builder(')', { locked: '0' }).steps.at(-1));
  assert.equal(odd.failure.kind, 'odd-length');
  assert.equal(odd.forward.status, 'pending');
  assert.equal(odd.backward.status, 'pending');
  const left = view(problem.builder('))', { locked: '11' }).steps.at(-1));
  assert.deepEqual(left.failure, { kind: 'forward', index: 0, start: 0, end: 0 });
  assert.equal(left.forward.status, 'failed');
  assert.equal(left.backward.status, 'pending');
  assert.equal(left.line, 13);
  const right = view(problem.builder('((', { locked: '11' }).steps.at(-1));
  assert.deepEqual(right.failure, { kind: 'backward', index: 1, start: 1, end: 1 });
  assert.equal(right.forward.status, 'passed');
  assert.equal(right.backward.status, 'failed');
  assert.equal(right.line, 21);
});

test('2116 balance changes on update/reset lines and backward assumptions do not overwrite forward snapshots', () => {
  const run = problem.builder('))()))', { locked: '010100' });
  run.steps.forEach((step, i) => {
    const v = view(step), previous = i ? view(run.steps[i - 1]) : null;
    assert.deepEqual(step.codeLines, [v.line]);
    assert.ok(v.line >= 2 && v.line <= problem.code.length);
    if (v.event === 'update') {
      const pass = v[v.phase], old = previous[v.phase], last = pass.trail.at(-1);
      assert.equal(pass.trail.length, old.trail.length + 1);
      assert.equal(v.balance, previous.balance + last.delta);
      assert.equal(last.choice, v.choice);
      assert.equal(last.flexible, v.locked[v.index] === '0');
      assert.equal(last.delta, last.choice === (v.phase === 'forward' ? '(' : ')') ? 1 : -1);
      assert.ok([9, 11, 17, 19].includes(v.line));
    } else if (v.event === 'reset') {
      assert.equal(v.balance, 0);
      assert.ok([6, 14].includes(v.line));
    } else if (previous) assert.equal(v.balance, previous.balance);
    if (v.event === 'branch') assert.equal(v[v.phase].trail.length, previous[v.phase].trail.length);
  });
  const initial = view(run.steps[0]), forwardLast = view(run.steps.findLast(step => view(step).phase === 'forward'));
  assert.equal(initial.forward.status, 'pending');
  assert.deepEqual(initial.forward.trail, []);
  assert.equal(forwardLast.forward.status, 'running');
  assert.ok(forwardLast.forward.trail.filter(item => item.flexible).every(item => item.choice === '('));
  const final = view(run.steps.at(-1));
  assert.ok(final.backward.trail.filter(item => item.flexible).every(item => item.choice === ')'));
  assert.deepEqual(final.backward.trail.map(item => item.index), [5, 4, 3, 2, 1, 0]);
  assert.deepEqual(final.forward.trail, forwardLast.forward.trail);
  assert.ok(final.balance > 0, 'maximum capacity need not finish at zero');
});

test('2116 renderer explains locking, independent scans, failure ranges and actual witness in both languages', () => {
  const host = { innerHTML: '', querySelectorAll: () => [] };
  const ctx = { lang: 'vi', $: () => host, escapeHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;') };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/renderer-locked-parentheses-2116.js'), 'utf8'), ctx);
  for (const lang of ['vi', 'en']) {
    ctx.lang = lang;
    for (const [s, locked] of [['))()))', '010100'], [')', '0'], ['((', '11'], ['))', '11'], ['('.repeat(80), '0'.repeat(80)]]) {
      const run = problem.builder(s, { locked });
      for (const step of run.steps) {
        const v = view(step);
        ctx.renderLockedParentheses2116View(step);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
        assert.equal((host.innerHTML.match(/data-index="/g) || []).length, s.length);
        assert.equal((host.innerHTML.match(/data-pass-index="/g) || []).length, s.length * 2);
        assert.equal((host.innerHTML.match(/data-witness-index="/g) || []).length, v.answer === true ? s.length : 0);
        assert.match(host.innerHTML, lang === 'vi' ? /hai giả định độc lập/ : /independent assumptions/);
      }
      assert.doesNotMatch(host.innerHTML, /class="lp2116-char[^"\n]* current/);
      if (run.answer) assert.match(host.innerHTML, lang === 'vi' ? /Một cách sửa hợp lệ/ : /One valid assignment/);
    }
  }
});

test('2116 displayed Python matches the assignment oracle and handles the original 100000-character limit', () => {
  const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
  const small = casesThrough(5);
  const cases = [...small, ['('.repeat(100000), '0'.repeat(100000)], ['('.repeat(100000), '1'.repeat(100000)], ['()'.repeat(50000), '1'.repeat(100000)]];
  const script = "import json,sys\npayload=json.load(sys.stdin)\nexec(payload['code'])\nprint(json.dumps([Solution().canBeValid(s,locked) for s,locked in payload['cases']]))";
  const result = spawnSync(python, ['-c', script], { input: JSON.stringify({ code: problem.code.join('\n'), cases }), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  assert.deepEqual(JSON.parse(result.stdout), [...small.map(([s, locked]) => oracle(s, locked)), true, false, true]);
});
