const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[1089];

function render(step, language = 'en') {
  const host = { innerHTML: '' };
  const context = {
    lang: language,
    $: () => host,
    pick: field => typeof field === 'string' ? field : field?.[language] ?? field?.en ?? '',
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderers-03.js'), 'utf8'), context);
  context.renderDuplicateZerosView(step);
  return host.innerHTML;
}

test('1089 duplicates zeros in place and truncates overflow', () => {
  const cases = [
    { nums: [1, 0, 2, 3, 0, 4, 5, 0], expected: [1, 0, 0, 2, 3, 0, 0, 4] },
    { nums: [1, 2, 3], expected: [1, 2, 3] },
    { nums: [0, 0, 0, 0], expected: [0, 0, 0, 0] },
    { nums: [1, 0, 0, 2], expected: [1, 0, 0, 0] },
  ];
  for (const { nums, expected } of cases) assert.deepEqual(problem.builder(nums).answer, expected);
});

test('1089 trace executes exactly one valid Python line in every frame', () => {
  const run = problem.builder(problem.defaultInput);
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(problem.code[step.codeLines[0] - 1]?.trim());
  }
  assert.ok(run.steps.some(step => step.codeLines[0] === 6 && step.vars.some(variable => variable.name === 'condition' && variable.value === 'True')));
  assert.ok(run.steps.some(step => step.codeLines[0] === 6 && step.vars.some(variable => variable.name === 'condition' && variable.value === 'False')));
});

test('1089 displayed Python agrees with all visualization results', () => {
  const cases = [[1, 0, 2, 3, 0, 4, 5, 0], [1, 2, 3], [0, 0, 0, 0], [1, 0, 0, 2]];
  const source = `${problem.code.join('\n')}\nimport json, sys\nfor nums, expected in json.load(sys.stdin):\n    arr = list(nums)\n    Solution().duplicateZeros(arr)\n    assert arr == expected`;
  const input = cases.map(nums => [nums, problem.builder(nums).answer]);
  const execution = spawnSync('python3', ['-c', source], { encoding: 'utf8', input: JSON.stringify(input) });
  assert.equal(execution.status, 0, execution.stderr);
});

test('1089 renderer shows a duplication machine, fixed boundary, and discarded overflow', () => {
  const run = problem.builder(problem.defaultInput);
  for (const language of ['en', 'vi']) {
    for (const step of run.steps) {
      const html = render(step, language);
      assert.match(html, /dz1089-viz/);
      assert.match(html, /dz1089-machine/);
      assert.match(html, /dz1089-tape/);
      assert.doesNotMatch(html, /duplicate-zeros-viz|dz-head|dz-range|write space/);
      assert.doesNotMatch(html, /undefined|NaN|object Object/);
    }
  }
  const outside = run.steps.find(step => step.duplicateZerosView.write >= step.duplicateZerosView.visibleLength);
  assert.match(render(outside), /dz1089-slot overflow cursor dropped/);
  const zeroStep = run.steps.find(step => step.duplicateZerosView.read >= 0 && step.duplicateZerosView.source[step.duplicateZerosView.read] === 0);
  assert.match(render(zeroStep), /<span class=zero>0<\/span><span class=zero>0<\/span>/);
  const finalHtml = render(run.steps.at(-1));
  assert.match(finalHtml, /dz1089-finish/);
  assert.match(finalHtml, /\[1, 0, 0, 2, 3, 0, 0, 4\]/);
});
