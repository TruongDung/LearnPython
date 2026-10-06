const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const problem = SUPPORTED[241], view = step => step.differentParentheses241View;
const sorted = numbers => [...numbers].sort((a, b) => a - b);

function oracle(expression) {
  // Bottom-up interval DP, independent of call frames and character recursion.
  const nums = expression.split(/[+*-]/).map(BigInt), ops = expression.match(/[+*-]/g) || [];
  const dp = nums.map(value => [[value]]);
  for (let length = 2; length <= nums.length; length++) {
    for (let left = 0; left + length <= nums.length; left++) {
      const right = left + length - 1, values = [];
      for (let split = left; split < right; split++) {
        for (const a of dp[left][split - left]) {
          for (const b of dp[split + 1][right - split - 1]) values.push(ops[split] === '+' ? a + b : ops[split] === '-' ? a - b : a * b);
        }
      }
      dp[left][right - left] = values;
    }
  }
  return dp[0][nums.length - 1].map(Number);
}
function evaluateGrouping(form) {
  let i = 0;
  function read() {
    if (form[i] !== '(') {
      const start = i;
      while (/\d/.test(form[i] || '')) i++;
      assert.ok(i > start, form);
      return BigInt(form.slice(start, i));
    }
    i++;
    const a = read(), op = form[i++], b = read();
    assert.equal(form[i++], ')');
    return op === '+' ? a + b : op === '-' ? a - b : a * b;
  }
  const result = Number(read());
  assert.equal(i, form.length);
  return result;
}
function smallCases(maxOperators = 3) {
  const output = [];
  for (let k = 0; k <= maxOperators; k++) {
    for (let numbers = 0; numbers < 2 ** (k + 1); numbers++) {
      const nums = Array.from({ length: k + 1 }, (_, i) => numbers & (1 << i) ? '2' : '0');
      for (let operations = 0; operations < 3 ** k; operations++) {
        let bits = operations, expression = nums[0];
        for (let j = 0; j < k; j++) { expression += '+-*'[bits % 3] + nums[j + 1]; bits = Math.floor(bits / 3); }
        output.push(expression);
      }
    }
  }
  return output;
}

test('241 examples preserve multiplicities and validate the original number/length limits', () => {
  assert.equal(problem.slug, 'different-ways-to-add-parentheses');
  assert.equal(problem.category.key, 'divide-and-conquer');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.deepEqual(problem.liveArgs(' 2*3-4*5 '), ['2*3-4*5']);
  for (const [s, answer] of [['2-1-1', [0, 2]], ['2*3-4*5', [-34, -14, -10, -10, 10]], ['99', [99]], ['0', [0]], ['0-2*0', [0, 0]], ['10+5*2', [20, 30]], ['00+01', [1]]]) {
    assert.deepEqual(sorted(problem.builder(s).answer), sorted(answer), s);
  }
  assert.equal(problem.builder('1+2+3+4+5').answer.length, 14);
  for (const bad of ['', ' ', '1+', '+1', '-1', '2**3', '1/2', '(1+2)', '100+1', '2 3', '1'.repeat(21), null, [], 123]) {
    assert.throws(() => problem.builder(bad));
    assert.throws(() => problem.liveArgs(bad));
  }
  assert.throws(() => problem.builder('1+1+1+1+1+1'), /4/);
  assert.deepEqual(problem.liveArgs('1+1+1+1+1+1+1+1+1+1'), ['1+1+1+1+1+1+1+1+1+1']);
});

test('241 recursion agrees with interval DP and every illustrated grouping has its stated value', () => {
  for (const s of [...smallCases(), '2*3-4*5', '12*3-4*5+6', '99*99-99+99*99', '1+2+3+4+5']) {
    const run = problem.builder(s), final = view(run.steps.at(-1)), root = final.nodes[0];
    assert.deepEqual(sorted(run.answer), sorted(oracle(s)), s);
    assert.deepEqual(final.answer, run.answer);
    assert.equal(root.status, 'returned');
    assert.equal(root.results.length, run.answer.length);
    assert.equal(new Set(root.results.map(entry => entry.form)).size, root.results.length);
    root.results.forEach(entry => {
      assert.equal(evaluateGrouping(entry.form), entry.value);
      assert.equal(entry.form.replace(/[()]/g, ''), s);
    });
    assert.equal(final.groups.length, (s.match(/[+*-]/g) || []).length);
    if (final.groups.length) assert.equal(final.groups.reduce((count, group) => count + group.results.length, 0), root.results.length);
    final.groups.forEach(group => assert.equal(group.results.length, group.left.length * group.right.length));
  }
});

test('241 child calls return before assignment and arithmetic is appended only on the append line', () => {
  const run = problem.builder('2*3-4*5');
  run.steps.forEach((step, i) => {
    const v = view(step), frame = v.nodes[v.activeId], old = i ? view(run.steps[i - 1]) : null;
    assert.deepEqual(step.codeLines, [v.line]);
    assert.equal(v.stack.at(-1), v.activeId);
    v.stack.forEach((id, level) => {
      assert.equal(v.nodes[id].depth, level);
      if (level) assert.equal(v.nodes[id].parentId, v.stack[level - 1]);
    });
    v.nodes.forEach(node => assert.equal(v.expression.slice(node.start, node.start + node.expression.length), node.expression));
    if (!old) return;
    const previous = old.nodes[v.activeId];
    if (v.event === 'calculate') {
      assert.ok([14, 16, 18].includes(v.line));
      assert.deepEqual(frame.results, previous.results);
      assert.equal(evaluateGrouping(frame.pending.form), frame.pending.value);
    } else if (v.event === 'append') {
      assert.equal(v.line, 19);
      assert.equal(frame.results.length, previous.results.length + 1);
      assert.deepEqual(frame.results.at(-1), previous.pending);
    } else if (v.event === 'receive-left' || v.event === 'receive-right') {
      const side = v.event === 'receive-left' ? 'left' : 'right';
      assert.equal(v.nodes[frame[side + 'Id']].status, 'returned');
      assert.deepEqual(frame[side], v.nodes[frame[side + 'Id']].results);
    }
    if (!step.final) assert.equal(v.answer, null);
  });
  const firstCalculation = view(run.steps.find(step => view(step).event === 'calculate'));
  assert.deepEqual(firstCalculation.nodes[firstCalculation.activeId].results, []);
  assert.deepEqual(firstCalculation.nodes[0].results, []);
  assert.deepEqual(view(run.steps[0]).nodes[0].results, []);
  const final = view(run.steps.at(-1));
  const tens = final.nodes[0].results.filter(entry => entry.value === -10);
  assert.equal(tens.length, 2);
  assert.notEqual(tens[0].form, tens[1].form);
});

test('241 renderer shows call scope, child lists, pending arithmetic and duplicated root groupings', () => {
  const host = { innerHTML: '' };
  const ctx = { lang: 'vi', $: () => host, escapeHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;') };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/renderer-different-parentheses-241.js'), 'utf8'), ctx);
  for (const lang of ['vi', 'en']) {
    ctx.lang = lang;
    for (const s of ['2*3-4*5', '99', '12*3-4*5+6', '0+0+0+0+0']) {
      const run = problem.builder(s);
      for (const step of run.steps) {
        const v = view(step);
        ctx.renderDifferentParentheses241View(step);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
        assert.equal((host.innerHTML.match(/data-index="/g) || []).length, s.length);
        assert.equal((host.innerHTML.match(/data-result="/g) || []).length, v.nodes[0].results.length);
        assert.equal((host.innerHTML.match(/data-root-split="/g) || []).length, v.groups.length);
        if (v.event === 'calculate') assert.match(host.innerHTML, lang === 'vi' ? /chưa thêm vào results/ : /not appended to results/);
        if (!step.final) assert.match(host.innerHTML, lang === 'vi' ? /Stack lời gọi/ : /Call stack/);
      }
      assert.match(host.innerHTML, lang === 'vi' ? /Đáp án · tất cả cách đặt ngoặc/ : /Answer · every parenthesization/);
      assert.doesNotMatch(host.innerHTML, /data-frame="/);
      if (s === '2*3-4*5') {
        assert.match(host.innerHTML, /\(2\*\(\(3-4\)\*5\)\)/);
        assert.match(host.innerHTML, /\(\(2\*\(3-4\)\)\*5\)/);
      }
    }
  }
});

test('241 displayed Python matches interval DP including 4862 results at the original length limit', () => {
  const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
  const full = '10+1+1+1+1+1+1+1+1+1';
  assert.equal(full.length, 20);
  const cases = [...smallCases(), '2*3-4*5', '12*3-4*5+6', full];
  const script = "import json,sys\npayload=json.load(sys.stdin)\nexec(payload['code'])\nprint(json.dumps([Solution().diffWaysToCompute(expression) for expression in payload['cases']]))";
  const result = spawnSync(python, ['-c', script], { input: JSON.stringify({ code: problem.code.join('\n'), cases }), encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  const answers = JSON.parse(result.stdout);
  cases.forEach((s, i) => assert.deepEqual(sorted(answers[i]), sorted(oracle(s)), s));
  assert.equal(answers.at(-1).length, 4862);
});
