const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[941];
const view = step => step.mountainArrayView;

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
  context.renderMountainArrayView(step);
  return host.innerHTML;
}

test('941 recognizes valid mountains and the main invalid shapes', () => {
  const cases = [
    { nums: [0, 3, 2, 1], expected: true, reason: 'valid' },
    { nums: [0, 2, 2, 1], expected: false, reason: 'stopped-early' },
    { nums: [3, 2, 1], expected: false, reason: 'no-ascent' },
    { nums: [1, 2, 3], expected: false, reason: 'no-descent' },
    { nums: [1, 2], expected: false, reason: 'too-short' },
  ];
  for (const { nums, expected, reason } of cases) {
    const run = problem.builder(nums);
    assert.equal(run.answer, expected);
    assert.equal(view(run.steps.at(-1)).reason, reason);
    assert.equal(view(run.steps.at(-1)).result, expected);
  }
});

test('941 trace follows one executable Python line and marks the broken edge', () => {
  for (const nums of [[0, 3, 2, 1], [0, 2, 2, 1], [3, 2, 1]]) {
    const run = problem.builder(nums);
    for (const step of run.steps) {
      assert.equal(step.codeLines.length, 1);
      assert.ok(problem.code[step.codeLines[0] - 1]?.trim());
    }
  }
  const plateau = problem.builder([0, 2, 2, 1]);
  assert.equal(view(plateau.steps.at(-1)).failedEdge, 1);
  const fallingOnly = problem.builder([3, 2, 1]);
  assert.equal(view(fallingOnly.steps.at(-1)).failedEdge, 0);
});

test('941 displayed Python agrees with the visualization', () => {
  const cases = [[0, 3, 2, 1], [0, 2, 2, 1], [3, 2, 1], [1, 2, 3], [1, 2], [0, 1, 0]];
  const source = `${problem.code.join('\n')}\nimport json, sys\nfor arr, expected in json.load(sys.stdin):\n    assert Solution().validMountainArray(arr) == expected`;
  const input = cases.map(nums => [nums, problem.builder(nums).answer]);
  const execution = spawnSync('python3', ['-c', source], { encoding: 'utf8', input: JSON.stringify(input) });
  assert.equal(execution.status, 0, execution.stderr);
});

test('941 picture-first renderer uses one dominant mountain and compact symbols', () => {
  const run = problem.builder(problem.defaultInput);
  for (const language of ['en', 'vi']) {
    for (const step of run.steps) {
      const html = render(step, language);
      assert.match(html, /mt941-profile/);
      assert.match(html, /mt941-mountain-fill/);
      assert.match(html, /mt941-stages/);
      assert.match(html, /mt941-symbols/);
      assert.doesNotMatch(html, /mt941-debug|mt941-rules|mt941-metrics|MOUNTAIN PROFILE/);
      assert.doesNotMatch(html, /undefined|NaN|object Object/);
    }
  }
  const finalHtml = render(run.steps.at(-1));
  assert.match(finalHtml, /✓ TRUE/);
  assert.match(finalHtml, /↗  ▲  ↘/);
  assert.match(finalHtml, /mt941-edge up validated/);
  assert.match(finalHtml, /mt941-edge down validated/);
});

test('941 visually flags a plateau and a missing ascent', () => {
  const plateauHtml = render(problem.builder([0, 2, 2, 1]).steps.at(-1));
  assert.match(plateauHtml, /mt941-edge flat failed/);
  assert.match(plateauHtml, /<span class="fail"><i>↘<\/i>/);
  assert.match(plateauHtml, /✕ FALSE/);
  const noAscentHtml = render(problem.builder([3, 2, 1]).steps.at(-1));
  assert.match(noAscentHtml, /mt941-edge down failed/);
});
