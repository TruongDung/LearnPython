const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[917];

const isLetter = char => /^[A-Za-z]$/.test(char);
const oracle = s => {
  const chars = [...s];
  const letters = chars.filter(isLetter).reverse();
  let index = 0;
  return chars.map(char => isLetter(char) ? letters[index++] : char).join('');
};
const cases = [
  ['ab-cd', 'dc-ba'],
  ['a-bC-dEf-ghIj', 'j-Ih-gfE-dCba'],
  ['Test1ng-Leet=code-Q!', 'Qedo1ct-eeLg=ntse-T!'],
  ['7_28]', '7_28]'],
  ['A1b', 'b1A'],
  ['z', 'z'],
];

test('917 reverses exactly the English letters and preserves every other index', () => {
  for (const [s, answer] of cases) {
    const result = problem.builder(s);
    assert.equal(result.answer, answer);
    assert.equal(result.answer, oracle(s));
    assert.equal(result.original, s);
    assert.deepEqual(problem.liveArgs(s), [s]);
    assert.equal(result.steps.at(-1).final, true);
    assert.equal(result.steps.at(-1).reverseLetters917View.answer, answer);
    for (let index = 0; index < s.length; index++) {
      if (!isLetter(s[index])) assert.equal(answer[index], s[index], `${JSON.stringify(s)} at ${index}`);
    }
    assert.deepEqual([...answer].filter(isLetter), [...s].filter(isLetter).reverse());
  }
});

test('917 agrees with an independent oracle across short mixed strings', () => {
  const alphabet = 'aB1-';
  for (let length = 1; length <= 5; length++) {
    for (let value = 0; value < alphabet.length ** length; value++) {
      let rest = value;
      let s = '';
      for (let index = 0; index < length; index++, rest = Math.floor(rest / alphabet.length)) s += alphabet[rest % alphabet.length];
      assert.equal(problem.builder(s).answer, oracle(s), JSON.stringify(s));
    }
  }
});

test('917 trace skips only non-letters, swaps letter pairs, and preserves snapshots', () => {
  const result = problem.builder('a-1B_c!');
  const firstChars = [...result.steps[0].reverseLetters917View.chars];
  for (const step of result.steps) {
    const view = step.reverseLetters917View;
    assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
    for (const index of [...view.skippedLeft, ...view.skippedRight]) assert.equal(isLetter(view.original[index]), false);
    for (const swap of view.swaps) {
      assert.equal(isLetter(swap.leftBefore), true);
      assert.equal(isLetter(swap.rightBefore), true);
      assert.equal(swap.leftAfter, swap.rightBefore);
      assert.equal(swap.rightAfter, swap.leftBefore);
    }
    if (view.phase === 'swap') {
      assert.equal(view.chars[view.lastSwap.left], view.lastSwap.rightBefore);
      assert.equal(view.chars[view.lastSwap.right], view.lastSwap.leftBefore);
      assert.deepEqual(step.codeLines, [11]);
    }
  }
  assert.deepEqual(result.steps[0].reverseLetters917View.chars, firstChars);
  assert.deepEqual(result.steps.at(-1).codeLines, [14]);
  assert.ok(result.steps.some(step => step.reverseLetters917View.phase === 'check-left'));
  assert.ok(result.steps.some(step => step.reverseLetters917View.phase === 'check-right'));
});

test('917 enforces the original ASCII range and visualizer length', () => {
  for (const invalid of ['', 'has space', '\n', '~', 'é', 'a'.repeat(101), null, 917]) {
    assert.throws(() => problem.builder(invalid), /917/);
    assert.throws(() => problem.liveArgs(invalid), /917/);
  }
  assert.equal(problem.builder('!-AZz').answer, '!-zZA');
  assert.equal(problem.preserveInputWhitespace, true);
});

test('917 displayed Python matches the repository solution at the original maximum length', () => {
  const repository = fs.readFileSync(require.resolve('../../Leetcode-sln/two-pointer/Leetcode_917.py'), 'utf8').replace(/\r\n/g, '\n').trimEnd();
  assert.equal(repository, problem.code.join('\n'));
  const assertions = cases.map(([s, answer]) => `assert Solution().reverseOnlyLetters(${JSON.stringify(s)}) == ${JSON.stringify(answer)}`).join('\n');
  const code = problem.code.join('\n') + '\n' + assertions + "\ns = 'a-1B' * 25\nassert len(s) == 100\nr = Solution().reverseOnlyLetters(s)\nassert len(r) == 100\nassert all(r[i] == s[i] for i, c in enumerate(s) if not c.isalpha())\n";
  const run = spawnSync('python3', ['-c', code], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('917 renderer covers every phase in Vietnamese and English', () => {
  const element = { innerHTML: '' };
  const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const context = { lang: 'en', $: () => element, escapeHtml, pick: value => value[context.lang] };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-reverse-only-letters-917.js'), 'utf8'), context);
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const [s, answer] of cases) {
      for (const step of problem.builder(s).steps) {
        context.renderReverseLetters917View(step);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|object Object/);
        assert.equal((element.innerHTML.match(/class="rol917-char/g) || []).length, s.length * 2);
      }
      assert.ok(element.innerHTML.includes(escapeHtml(answer)));
    }
  }
});

test('917 is registered with dedicated browser assets and an updated roadmap row', () => {
  assert.equal(problem.category.key, 'two-pointer');
  assert.ok(problem.tags.some(tag => tag.key === 'string'));
  const registry = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const prefix = registry.slice(0, registry.indexOf('\nfunction ', registry.indexOf('const ORDERED_RENDERER_REGISTRY')));
  const context = { renderReverseLetters917View: step => { context.rendered = step; } };
  vm.createContext(context);
  vm.runInContext(prefix + '\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;', context);
  const step = problem.builder('ab-cd').steps[0];
  const renderer = context.registry.find(entry => entry.predicate(step));
  assert.equal(renderer.surface, 'treeView');
  renderer.render(step);
  assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  for (const asset of ['reverse-only-letters-917.css', 'renderer-reverse-only-letters-917.js']) {
    assert.equal(html.split(asset + '?').length - 1, 1);
    assert.ok(fs.existsSync(require.resolve('../public/' + asset)));
  }
  assert.ok(html.includes('&bg=reverse-only-letters-917-v1'));
  const roadmap = fs.readFileSync(require.resolve('../../docs/leetcode-string-study-roadmap.md'), 'utf8');
  assert.match(roadmap, /\| 27 \| \[917\. Reverse Only Letters\][^\n]+\| Có \|/);
});
