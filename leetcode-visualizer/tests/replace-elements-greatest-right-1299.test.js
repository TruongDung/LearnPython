const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[1299];
const view = step => step.replaceGreatestView;

function render(step, language = 'en') {
  const host = { innerHTML: '' };
  const context = {
    lang: language,
    $: () => host,
    pick: field => typeof field === 'string' ? field : field?.[language] ?? field?.en ?? '',
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderers-04.js'), 'utf8'), context);
  context.renderReplaceGreatestView(step);
  return host.innerHTML;
}

test('1299 replaces each value with the strict-right maximum', () => {
  const cases = [
    { nums: [17, 18, 5, 4, 6, 1], expected: [18, 6, 6, 6, 1, -1] },
    { nums: [400], expected: [-1] },
    { nums: [5, 4, 3], expected: [4, 3, -1] },
    { nums: [1, 2, 3], expected: [3, 3, -1] },
  ];
  for (const { nums, expected } of cases) {
    assert.deepEqual(problem.builder(nums).answer, expected);
  }
});

test('1299 trace follows exactly one executable Python line per step', () => {
  const run = problem.builder(problem.defaultInput);
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(problem.code[step.codeLines[0] - 1]?.trim());
  }
  const write = run.steps.find(step => view(step).phase === 'write' && view(step).currentI === 4);
  assert.equal(view(write).writeValue, 1);
  assert.equal(view(write).cur, 6);
  assert.equal(view(write).previousRightMax, 1);
  const update = run.steps.find(step => view(step).phase === 'update' && view(step).currentI === 4);
  assert.equal(view(update).rightMax, 6);
  assert.equal(view(update).maxUpdated, true);
});

test('1299 displayed Python agrees with the visualization', () => {
  const cases = [[17, 18, 5, 4, 6, 1], [400], [5, 4, 3], [1, 2, 3]];
  const source = `${problem.code.join('\n')}\nimport json, sys\nfor arr, expected in json.load(sys.stdin):\n    assert Solution().replaceElements(arr) == expected`;
  const input = cases.map(nums => [nums, problem.builder(nums).answer]);
  const execution = spawnSync('python3', ['-c', source], { encoding: 'utf8', input: JSON.stringify(input) });
  assert.equal(execution.status, 0, execution.stderr);
});

test('1299 renderer is picture-first and keeps the interview invariant visible', () => {
  const run = problem.builder(problem.defaultInput);
  for (const language of ['en', 'vi']) {
    for (const step of run.steps) {
      const html = render(step, language);
      assert.match(html, /rg1299-stage/);
      assert.match(html, /rg1299-lane source/);
      assert.match(html, /rg1299-machine/);
      assert.match(html, /rg1299-lane result/);
      assert.match(html, /MAX = max\(arr\[i\+1…n−1\]\)/);
      assert.doesNotMatch(html, /rg1299-debug|rg1299-flow-step|rg1299-status|rg1299-metrics/);
      assert.doesNotMatch(html, /undefined|NaN|object Object/);
    }
  }
  const write = run.steps.find(step => view(step).phase === 'write' && view(step).currentI === 4);
  const html = render(write);
  assert.match(html, /rg1299-card drop active/);
  assert.match(html, /<small>arr\[i\]<\/small><strong>1<\/strong>/);
  assert.match(html, /<strong>6<\/strong><\/div>/);
  assert.match(html, /rg1299-cell output written current-write/);
  const finalHtml = render(run.steps.at(-1));
  assert.match(finalHtml, /rg1299-finish/);
  assert.match(finalHtml, /\[18, 6, 6, 6, 1, -1\]/);
});
