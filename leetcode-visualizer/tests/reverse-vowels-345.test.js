const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[345];

const VOWELS = new Set('aeiouAEIOU');
const oracle = s => {
  const chars = [...s];
  const vowels = chars.filter(char => VOWELS.has(char)).reverse();
  let index = 0;
  return chars.map(char => VOWELS.has(char) ? vowels[index++] : char).join('');
};
const cases = [
  ['IceCreAm', 'AceCreIm'],
  ['leetcode', 'leotcede'],
  ['hello', 'holle'],
  ['aA', 'Aa'],
  ['rhythm', 'rhythm'],
  ['a-b E!', 'E-b a!'],
  [' ', ' '],
  ['u', 'u'],
];

test('345 reverses exactly the vowels and preserves every non-vowel index', () => {
  for (const [s, answer] of cases) {
    const result = problem.builder(s);
    assert.equal(result.answer, answer);
    assert.equal(result.answer, oracle(s));
    assert.equal(result.original, s);
    assert.deepEqual(problem.liveArgs(s), [s]);
    assert.equal(result.steps.at(-1).final, true);
    assert.equal(result.steps.at(-1).reverseVowels345View.answer, answer);
    for (let index = 0; index < s.length; index++) {
      if (!VOWELS.has(s[index])) assert.equal(answer[index], s[index], `${JSON.stringify(s)} at ${index}`);
    }
    assert.deepEqual([...answer].filter(char => VOWELS.has(char)), [...s].filter(char => VOWELS.has(char)).reverse());
  }
});

test('345 agrees with an independent oracle across short mixed strings', () => {
  const alphabet = 'aEb-';
  for (let length = 1; length <= 5; length++) {
    for (let value = 0; value < alphabet.length ** length; value++) {
      let rest = value;
      let s = '';
      for (let index = 0; index < length; index++, rest = Math.floor(rest / alphabet.length)) s += alphabet[rest % alphabet.length];
      assert.equal(problem.builder(s).answer, oracle(s), JSON.stringify(s));
    }
  }
});

test('345 trace skips only non-vowels, swaps vowel pairs, and preserves snapshots', () => {
  const result = problem.builder('hEllO!');
  const firstChars = [...result.steps[0].reverseVowels345View.chars];
  for (const step of result.steps) {
    const view = step.reverseVowels345View;
    assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
    for (const index of [...view.skippedLeft, ...view.skippedRight]) assert.equal(VOWELS.has(view.original[index]), false);
    for (const swap of view.swaps) {
      assert.equal(VOWELS.has(swap.leftBefore), true);
      assert.equal(VOWELS.has(swap.rightBefore), true);
      assert.equal(swap.leftAfter, swap.rightBefore);
      assert.equal(swap.rightAfter, swap.leftBefore);
    }
    if (view.phase === 'swap') {
      assert.equal(view.chars[view.lastSwap.left], view.lastSwap.rightBefore);
      assert.equal(view.chars[view.lastSwap.right], view.lastSwap.leftBefore);
      assert.deepEqual(step.codeLines, [12]);
    }
  }
  assert.deepEqual(result.steps[0].reverseVowels345View.chars, firstChars);
  assert.deepEqual(result.steps.at(-1).codeLines, [15]);
  assert.ok(result.steps.some(step => step.reverseVowels345View.phase === 'check-left'));
  assert.ok(result.steps.some(step => step.reverseVowels345View.phase === 'check-right'));
});

test('345 validates the visualizer input without trimming meaningful spaces', () => {
  for (const invalid of ['', '\n', '\té', 'é', '<'.repeat(101), 'a'.repeat(101), null, 345]) {
    assert.throws(() => problem.builder(invalid), /345/);
    assert.throws(() => problem.liveArgs(invalid), /345/);
  }
  assert.equal(problem.builder(' a ').answer, ' a ');
  assert.equal(problem.preserveInputWhitespace, true);
});

test('345 displayed Python matches the repository solution and original input limit', () => {
  const repository = fs.readFileSync(require.resolve('../../Leetcode-sln/two-pointer/Leetcode_345.py'), 'utf8').replace(/\r\n/g, '\n').trimEnd();
  assert.equal(repository, problem.code.join('\n'));
  const assertions = cases.map(([s, answer]) => `assert Solution().reverseVowels(${JSON.stringify(s)}) == ${JSON.stringify(answer)}`).join('\n');
  const code = problem.code.join('\n') + '\n' + assertions + "\ns = 'a-bE' * 75000\nassert len(s) == 300000\nr = Solution().reverseVowels(s)\nassert len(r) == len(s)\nassert all(r[i] == s[i] for i, c in enumerate(s) if c not in set('aeiouAEIOU'))\n";
  const run = spawnSync('python3', ['-c', code], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('345 renderer covers every phase in Vietnamese and English', () => {
  const element = { innerHTML: '' };
  const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const context = { lang: 'en', $: () => element, escapeHtml, pick: value => value[context.lang] };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-reverse-vowels-345.js'), 'utf8'), context);
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const [s, answer] of cases) {
      for (const step of problem.builder(s).steps) {
        context.renderReverseVowels345View(step);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|object Object/);
        assert.equal((element.innerHTML.match(/class="rv345-char/g) || []).length, s.length * 2);
      }
      assert.ok(element.innerHTML.includes(escapeHtml(answer)));
    }
  }
});

test('345 is registered with dedicated browser assets and an updated roadmap row', () => {
  assert.equal(problem.category.key, 'two-pointer');
  assert.ok(problem.tags.some(tag => tag.key === 'string'));
  const registry = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const prefix = registry.slice(0, registry.indexOf('\nfunction ', registry.indexOf('const ORDERED_RENDERER_REGISTRY')));
  const context = { renderReverseVowels345View: step => { context.rendered = step; } };
  vm.createContext(context);
  vm.runInContext(prefix + '\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;', context);
  const step = problem.builder('hello').steps[0];
  const renderer = context.registry.find(entry => entry.predicate(step));
  assert.equal(renderer.surface, 'treeView');
  renderer.render(step);
  assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  for (const asset of ['reverse-vowels-345.css', 'renderer-reverse-vowels-345.js']) {
    assert.equal(html.split(asset + '?').length - 1, 1);
    assert.ok(fs.existsSync(require.resolve('../public/' + asset)));
  }
  assert.ok(html.includes('&bf=reverse-vowels-345-v1'));
  const roadmap = fs.readFileSync(require.resolve('../../docs/leetcode-string-study-roadmap.md'), 'utf8');
  assert.match(roadmap, /\| 26 \| \[345\. Reverse Vowels of a String\][^\n]+\| Có \|/);
});
