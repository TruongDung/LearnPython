const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');
const problem = SUPPORTED[56];

const examples = [
  { input: [[1, 3], [2, 6], [8, 10], [15, 18]], expected: [[1, 6], [8, 10], [15, 18]] },
  { input: [[1, 4], [4, 5]], expected: [[1, 5]] },
  { input: [[4, 7], [1, 4]], expected: [[1, 7]] },
  { input: [[8, 10], [1, 10], [2, 3], [1, 10]], expected: [[1, 10]] },
  { input: [[0, 0], [0, 0], [1, 1]], expected: [[0, 0], [1, 1]] },
  { input: [[0, 10000]], expected: [[0, 10000]] },
];

test('56 supports the examples, touching endpoints, containment, duplicates, and point intervals', () => {
  for (const { input, expected } of examples) {
    assert.deepEqual(problem.builder(JSON.stringify(input)).answer, expected);
    assert.deepEqual(problem.builder(input.map(pair => pair.join('-')).join(',')).answer, expected);
  }
});

// An independent oracle: each connected component of the overlap graph becomes
// one output interval. No sort-and-merge scan is used to compute the oracle.
function overlapComponents(pairs) {
  const remaining = new Set(pairs.map((_, i) => i)), result = [];
  while (remaining.size) {
    const first = remaining.values().next().value, component = [first];
    remaining.delete(first);
    for (let cursor = 0; cursor < component.length; cursor++) {
      const [start, end] = pairs[component[cursor]];
      for (const j of remaining) {
        if (start <= pairs[j][1] && pairs[j][0] <= end) {
          remaining.delete(j);
          component.push(j);
        }
      }
    }
    result.push([Math.min(...component.map(i => pairs[i][0])), Math.max(...component.map(i => pairs[i][1]))]);
  }
  return result.sort((a, b) => a[0] - b[0]);
}

test('56 snapshots match overlap components after each update and preserve original input order', () => {
  let seed = 56;
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  for (let n = 0; n < 35; n++) {
    const input = Array.from({ length: 8 }, () => {
      const start = random() % 20;
      return [start, start + random() % 5];
    });
    const frozen = input.map(pair => Object.freeze([...pair]));
    const run = problem.builder(frozen);
    assert.deepEqual(run.original, input);
    assert.deepEqual(run.steps[0].mergeIntervalsView.intervals.map(v => [v.start, v.end]), input);
    assert.deepEqual(run.steps[0].mergeIntervalsView.merged, []);
    assert.deepEqual(run.answer, overlapComponents(input));
    for (const step of run.steps) {
      assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
      const v = step.mergeIntervalsView;
      const prefix = v.intervals.slice(0, v.processed).map(item => [item.start, item.end]);
      assert.deepEqual(v.merged, overlapComponents(prefix));
    }
    assert.equal(run.steps.at(-1).final, true);
  }
  const run = problem.builder('1-3,2-6');
  assert.deepEqual(run.steps.find(s => s.mergeIntervalsView.phase === 'append').mergeIntervalsView.merged, [[1, 3]]);
  assert.deepEqual(run.answer, [[1, 6]]);
});

test('56 validates both input formats consistently for visualization and live code', () => {
  for (const input of ['', '1-3,', 'bad', '3-1', '-1-2', '1-2-3', '1.5-2', '{}', 'null', '[]', '[1,2]', '[[1,2,3]]', '[["1",2]]', '[[0,10001]]', JSON.stringify(Array(41).fill([1, 2]))]) {
    assert.throws(() => problem.builder(input), /1–40/);
    assert.throws(() => problem.liveArgs(input), /1–40/);
  }
  assert.deepEqual(problem.liveArgs(' [[8,10], [1,3]] '), [[[8, 10], [1, 3]]]);
  assert.equal(problem.builder(Array(40).fill([1, 2])).steps.at(-1).mergeIntervalsView.processed, 40);
});

test('56 displayed Python receives the same original intervals and returns the expected result', () => {
  const cases = examples.map(({ input, expected }) => ({ args: problem.liveArgs(JSON.stringify(input)), expected }));
  const code = problem.code.join('\n') + `
import json, sys
for case in json.load(sys.stdin):
    assert Solution().merge(*case['args']) == case['expected']
`;
  const run = spawnSync('python', ['-c', code], { input: JSON.stringify(cases), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('56 renders every phase in English and Vietnamese without invalid bar coordinates', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderMergeIntervalsView(step)');
  const end = script.indexOf('\n// ---- Meeting-room', start);
  const element = {}, context = { lang: 'en', $: () => element, escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const { input } of examples) for (const step of problem.builder(input).steps) {
      context.renderMergeIntervalsView(step);
      assert.match(element.innerHTML, /mi56-track/);
      assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity/);
      for (const match of element.innerHTML.matchAll(/(?:left|width):([\d.-]+)%/g)) {
        assert.ok(Number(match[1]) >= 0 && Number(match[1]) <= 100);
      }
    }
  }
});

test('the code toolbar can blur and reveal the #56 snippet beside Edit & run code', () => {
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const editButton = html.indexOf('id="liveEditBtn"');
  const blurButton = html.indexOf('id="codeBlurBtn"');

  assert.ok(editButton >= 0 && blurButton > editButton);
  assert.match(html.slice(editButton, blurButton + 80), /liveEditBtn[\s\S]*codeBlurBtn/);
  assert.match(html.slice(editButton, blurButton), /code-toolbar-icon-btn[\s\S]*<svg/);
  assert.match(html.slice(blurButton, blurButton + 1400), /code-blur-off-icon[\s\S]*code-blur-on-icon/);
  assert.match(html.slice(editButton, blurButton + 180), /data-tooltip="Edit &amp; run code"[\s\S]*data-tooltip="Reveal code"/);
  assert.match(html.slice(blurButton, blurButton + 1800), /aria-pressed="true"[\s\S]*class="code-panel is-blurred"/);
  assert.match(css, /\.code-toolbar-icon-btn:hover::after[\s\S]*visibility:\s*visible/);
  assert.match(css, /\.code-panel\.is-blurred[\s\S]*filter:\s*blur\(5px\)/);
  assert.match(script, /codeBlurBtn[\s\S]*setCodeSnippetBlurred\(!codeSnippetBlurred, true\)/);
  assert.match(script, /let codeSnippetBlurred = true/);
  assert.match(script, /CODE_SNIPPET_BLURRED_KEY = "leetcodeCodeSnippetBlurred"/);
  assert.match(script, /function readCodeSnippetBlurPreference\(\)[\s\S]*localStorage\.getItem\(CODE_SNIPPET_BLURRED_KEY\)/);
  assert.match(script, /function resetLiveEditorState\(\)[\s\S]*setCodeSnippetBlurred\(readCodeSnippetBlurPreference\(\)\)/);
  assert.match(script, /if \(persist\) localStorage\.setItem\(CODE_SNIPPET_BLURRED_KEY, String\(codeSnippetBlurred\)\)/);
  assert.match(script, /aria-pressed/);
});
