const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[905];
const view = step => step.parity905View;

function render(step) {
  const host = { innerHTML: '' };
  const context = {
    lang: 'en',
    $: () => host,
    pick: field => typeof field === 'string' ? field : field?.en ?? '',
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderers-04.js'), 'utf8'), context);
  context.renderSortParity905View(step);
  return host.innerHTML;
}

function isValidParityOrder(values) {
  const firstOdd = values.findIndex(value => value % 2 === 1);
  const boundary = firstOdd === -1 ? values.length : firstOdd;
  return values.slice(0, boundary).every(value => value % 2 === 0)
    && values.slice(boundary).every(value => value % 2 === 1);
}

test('905 partitions in place with evens before odds', () => {
  const cases = [[3, 1, 2, 4], [0], [2, 4, 6], [1, 3, 5], [1, 2, 3, 4, 5, 6]];
  for (const nums of cases) {
    const result = problem.builder(nums).answer;
    assert.equal(isValidParityOrder(result), true);
    assert.deepEqual([...result].sort((a, b) => a - b), [...nums].sort((a, b) => a - b));
  }
});

test('905 trace is line-by-line and exposes the interview pointer states', () => {
  const run = problem.builder(problem.defaultInput);
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(problem.code[step.codeLines[0] - 1]?.trim());
    assert.ok(view(step));
  }
  const phases = run.steps.map(step => view(step).phase);
  for (const phase of ['check-left', 'check-right', 'pair', 'swap', 'move-both', 'meet', 'done']) {
    assert.ok(phases.includes(phase), `missing ${phase}`);
  }
  assert.deepEqual(run.answer, [4, 2, 1, 3]);
});

test('905 displayed Python agrees with every tested visualization result', () => {
  const cases = [[3, 1, 2, 4], [0], [2, 4, 6], [1, 3, 5], [1, 2, 3, 4, 5, 6]];
  const source = `${problem.code.join('\n')}\nimport json, sys\nfor nums, expected in json.load(sys.stdin):\n    assert Solution().sortArrayByParity(nums) == expected`;
  const input = cases.map(nums => [nums, problem.builder(nums).answer]);
  const execution = spawnSync('python3', ['-c', source], { encoding: 'utf8', input: JSON.stringify(input) });
  assert.equal(execution.status, 0, execution.stderr);
});

test('905 renderer uses parity shapes, pointer markers, and a swap picture', () => {
  const run = problem.builder(problem.defaultInput);
  for (const step of run.steps) {
    const html = render(step);
    assert.match(html, /p905-road/);
    assert.match(html, /p905-cell/);
    assert.match(html, /p905-action/);
    assert.doesNotMatch(html, /undefined|NaN|object Object/);
  }
  const pairHtml = render(run.steps.find(step => view(step).phase === 'pair'));
  assert.match(pairHtml, /p905-swap pair/);
  assert.match(pairHtml, /<b>⇄<\/b>/);
  assert.match(pairHtml, /p905-cell odd focus swap/);
  const finalHtml = render(run.steps.at(-1));
  assert.match(finalHtml, /p905-finish/);
  assert.match(finalHtml, /4　2/);
  assert.match(finalHtml, /1　3/);
});
