const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const problem = SUPPORTED[2232], view = step => step.minimizeExpression2232View;

function evaluate(expression) {
  // Parse the returned expression independently with exact integer arithmetic.
  const match = expression.match(/^(\d*)\((\d+)\+(\d+)\)(\d*)$/);
  assert.ok(match, expression);
  return Number(BigInt(match[1] || '1') * (BigInt(match[2]) + BigInt(match[3])) * BigInt(match[4] || '1'));
}
function oracle(expression) {
  const plus = expression.indexOf('+'), options = [];
  for (let open = 0; open < plus; open++) {
    for (let close = plus + 2; close <= expression.length; close++) {
      const wrapped = expression.slice(0, open) + '(' + expression.slice(open, close) + ')' + expression.slice(close);
      options.push({ expression: wrapped, value: evaluate(wrapped) });
    }
  }
  return { minimum: Math.min(...options.map(item => item.value)), options };
}
const smallNumbers = Array.from({ length: 99 }, (_, i) => String(i + 1)).filter(number => !number.includes('0'));

test('2232 accepts the complete original input range and returns expressions for published examples', () => {
  assert.equal(problem.slug, 'minimize-result-by-adding-parentheses-to-expression');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.ok(problem.tags.some(tag => tag.key === 'parentheses'));
  assert.deepEqual(problem.liveArgs(' 247+38 '), ['247+38']);
  for (const [input, expected, value] of [['247+38', '2(47+38)', 170], ['12+34', '1(2+3)4', 20], ['999+999', '(999+999)', 1998], ['1+1', '(1+1)', 2], ['5+13', '(5+1)3', 18]]) {
    const run = problem.builder(input);
    assert.equal(run.answer, expected);
    assert.equal(run.minimumValue, value);
    assert.equal(evaluate(run.answer), value);
  }
  for (const input of ['1234+56789', '99999999+9', '9+99999999']) assert.equal(problem.builder(input).minimumValue, oracle(input).minimum);
  for (const bad of ['', '1', '1+', '+1', '1++2', '1+2+3', '0+1', '10+2', '01+2', '1 + 2', '(1+2)', '12345+67891', null, [], 123]) {
    assert.throws(() => problem.builder(bad));
    assert.throws(() => problem.liveArgs(bad));
  }
});

test('2232 checks every allowed placement and reaches the exact integer minimum for 8100 small expressions', () => {
  for (const left of smallNumbers) {
    for (const right of smallNumbers) {
      const input = left + '+' + right, run = problem.builder(input), expected = oracle(input), final = view(run.steps.at(-1));
      assert.equal(run.minimumValue, expected.minimum, input);
      assert.equal(evaluate(run.answer), expected.minimum, input);
      assert.equal(run.answer.replace(/[()]/g, ''), input);
      assert.equal(final.history.length, left.length * right.length);
      assert.deepEqual(final.history.map(item => ({ expression: item.expression, value: item.value })), expected.options);
      assert.equal(final.history.filter(item => item.status === 'best').length, 1);
      assert.equal(final.bestExpression, run.answer);
      assert.equal(final.answer, run.answer);
    }
  }
});

test('2232 calculations, comparisons, number assignments and expression assignments have distinct snapshots', () => {
  const run = problem.builder('247+38');
  run.steps.forEach((step, i) => {
    const v = view(step), old = i ? view(run.steps[i - 1]) : null;
    assert.deepEqual(step.codeLines, [v.line]);
    assert.ok(v.line >= 2 && v.line <= problem.code.length);
    if (!old) return;
    if (v.event === 'update-best') {
      assert.equal(v.bestValue, v.candidate.value);
      assert.equal(v.bestExpression, old.bestExpression);
      assert.deepEqual(v.bestPair, old.bestPair);
      assert.equal(v.updating, true);
      assert.equal(v.history.at(-1).status, 'updating');
      assert.equal(v.line, 14);
    } else assert.equal(v.bestValue, old.bestValue);
    if (v.event === 'update-answer') {
      assert.equal(v.bestExpression, v.candidate.expression);
      assert.deepEqual(v.bestPair, { i: v.i, j: v.j });
      assert.equal(v.updating, false);
      assert.equal(v.history.at(-1).status, 'best');
      assert.equal(v.line, 15);
    } else assert.equal(v.bestExpression, old.bestExpression);
    if (v.event === 'calculate') {
      assert.equal(v.candidate.value, v.candidate.a * (v.candidate.b + v.candidate.c) * v.candidate.d);
      assert.equal(v.history.length, old.history.length + 1);
      assert.equal(v.history.at(-1).status, 'pending');
      assert.equal(v.line, 12);
    }
    if (v.event === 'compare') assert.equal(v.candidate.better, v.candidate.value < (old.bestValue ?? Infinity));
    if (v.event === 'right-position') for (const field of ['a', 'b', 'c', 'd', 'value']) assert.equal(v.candidate[field], null);
  });
  const firstCalculation = view(run.steps.find(step => view(step).event === 'calculate'));
  assert.equal(firstCalculation.bestValue, null);
  assert.equal(firstCalculation.bestExpression, '');
  assert.equal(firstCalculation.history[0].status, 'pending', 'earlier history must remain unchanged');
  assert.deepEqual(view(run.steps[0]).history, []);
  const tie = problem.builder('5+13'), equalComparison = tie.steps.find(step => view(step).event === 'compare' && view(step).candidate.value === view(step).bestValue);
  assert.ok(equalComparison);
  assert.equal(view(equalComparison).candidate.better, false);
  assert.equal(tie.answer, '(5+1)3');
});

test('2232 renderer exposes missing factors as 1, pending answer updates and all grid cells in both languages', () => {
  const host = { innerHTML: '' };
  const ctx = { lang: 'vi', $: () => host, escapeHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;') };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/renderer-minimize-expression-2232.js'), 'utf8'), ctx);
  for (const lang of ['vi', 'en']) {
    ctx.lang = lang;
    for (const input of ['247+38', '1+1', '999+999', '1234+56789', '5+13']) {
      const run = problem.builder(input);
      for (const step of run.steps) {
        const v = view(step);
        ctx.renderMinimizeExpression2232View(step);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
        assert.equal((host.innerHTML.match(/data-cell="/g) || []).length, v.left === null ? 0 : v.left.length * v.right.length);
        assert.equal((host.innerHTML.match(/data-trial="/g) || []).length, v.history.length);
        if (v.event === 'update-best') assert.match(host.innerHTML, lang === 'vi' ? /Đang cập nhật answer/ : /answer will be updated/);
        const emptyOuter = step.final ? v.bestPair.i === 0 || v.bestPair.j === v.right.length : v.candidate && (!v.candidate.prefix || !v.candidate.suffix);
        if (emptyOuter) assert.match(host.innerHTML, lang === 'vi' ? /Rỗng dùng hệ số 1/ : /Empty means multiplier 1/);
      }
      assert.match(host.innerHTML, lang === 'vi' ? /Đáp án tối ưu/ : /Optimal answer/);
      assert.doesNotMatch(host.innerHTML, /<td class="[^"]*\bcurrent\b/);
      assert.match(host.innerHTML, new RegExp(run.answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      if (input === '247+38') assert.match(host.innerHTML, /2 × \(47 \+ 38\) × 1 = 170/);
    }
  }
});

test('2232 displayed Python agrees with exact minima and keeps the earliest tied optimum', () => {
  const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
  const cases = [...smallNumbers.flatMap(left => smallNumbers.map(right => left + '+' + right)), '247+38', '999+999', '1234+56789', '99999999+9', '9+99999999', '5+13'];
  const script = "import json,sys\npayload=json.load(sys.stdin)\nexec(payload['code'])\nprint(json.dumps([Solution().minimizeResult(expression) for expression in payload['cases']]))";
  const result = spawnSync(python, ['-c', script], { input: JSON.stringify({ code: problem.code.join('\n'), cases }), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  const answers = JSON.parse(result.stdout);
  assert.equal(answers.length, cases.length);
  cases.forEach((input, i) => { assert.equal(evaluate(answers[i]), oracle(input).minimum, input); assert.equal(answers[i], problem.builder(input).answer); });
  assert.equal(answers.at(-1), '(5+1)3');
});
