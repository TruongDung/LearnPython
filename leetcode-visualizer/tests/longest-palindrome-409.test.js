const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[409];
const cases = [
  ['abccccdd', 7], ['a', 1], ['Aa', 1], ['AaAa', 4],
  ['abc', 1], ['aabbcc', 6], ['aaabbbccc', 7], ['Abba', 3],
  ['aaaa', 4], ['aaaaa', 5], ['AaBb', 1], ['a'.repeat(100), 100],
];
const frequency = word => [...word].reduce((counts, ch) => { counts[ch] = (counts[ch] || 0) + 1; return counts; }, {});
const isPalindrome = word => word === [...word].reverse().join('');

test('409 finds optimal lengths for examples, case differences, even counts, and multiple odd counts', () => {
  for (const [s, answer] of cases) {
    const result = problem.builder(s);
    assert.equal(result.answer, answer);
    assert.equal(result.palindrome.length, answer);
    assert.ok(isPalindrome(result.palindrome));
    assert.deepEqual(problem.liveArgs(s), [s]);
    assert.equal(result.steps.at(-1).final, true);
    assert.equal(result.steps.at(-1).palindrome409View.answer, answer);
  }
  // Enumerate every subset independently. A multiset can form a palindrome
  // iff at most one character has odd multiplicity.
  const optimum = s => {
    let best = 0;
    for (let mask = 1; mask < 2 ** s.length; mask++) {
      const selected = [...s].filter((_, i) => mask & (1 << i)).join('');
      if (Object.values(frequency(selected)).filter(n => n % 2).length <= 1) best = Math.max(best, selected.length);
    }
    return best;
  };
  for (let length = 1; length <= 5; length++) {
    for (let value = 0; value < 3 ** length; value++) {
      let s = '', rest = value;
      for (let i = 0; i < length; i++, rest = Math.floor(rest / 3)) s += 'aAb'[rest % 3];
      assert.equal(problem.builder(s).answer, optimum(s), s);
    }
  }
});

test('409 snapshots preserve counts, pair totals, and exactly one center', () => {
  for (const [s] of cases) {
    const result = problem.builder(s);
    for (const step of result.steps) {
      const v = step.palindrome409View;
      assert.deepEqual(v.count, frequency(s.slice(0, v.processed)));
      const example = v.left + (v.center || '') + [...v.left].reverse().join('');
      assert.ok(isPalindrome(example));
      for (const [ch, n] of Object.entries(frequency(example))) assert.ok(n <= (v.count[ch] || 0));
      if (v.length !== null) {
        assert.equal(v.length, Object.values(v.used).reduce((a, b) => a + b, 0));
        assert.equal(v.left.length * 2, v.length);
        assert.equal(v.center !== null, v.hasOdd);
      }
      assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
    }
    assert.deepEqual(result.steps[0].palindrome409View.count, {});
    assert.deepEqual(result.steps.at(-1).codeLines, [12]);
    const final = result.steps.at(-1).palindrome409View;
    assert.equal(final.answer, final.length + Number(final.hasOdd));
  }
  const manyOdd = problem.builder('aaabbbccc');
  const centers = manyOdd.steps.filter(step => step.palindrome409View.phase === 'center');
  assert.equal(centers.length, 3);
  assert.deepEqual(centers.map(step => step.palindrome409View.center), ['a', 'a', 'a']);
  assert.equal(manyOdd.answer, 7);
  assert.equal(problem.builder('aabbcc').steps.some(step => step.palindrome409View.phase === 'center'), false);
});

test('409 validates letters and visualization limits without changing case or trimming', () => {
  for (const input of ['', 'a ', 'a1', 'a\n', 'é', '<script>', 'a'.repeat(101), null, 409]) {
    assert.throws(() => problem.builder(input), /409/);
    assert.throws(() => problem.liveArgs(input), /409/);
  }
  assert.equal(problem.builder('Aa').answer, 1);
});

test('409 displayed and repository Python agree and support the original 2000-character limit', () => {
  const repository = fs.readFileSync(require.resolve('../../Leetcode-sln/string/Leetcode_409.py'), 'utf8').replace(/\r\n/g, '\n');
  assert.equal(repository.split('\n\n\n')[0], problem.code.join('\n'));
  const assertions = cases.map(([s, answer]) => `assert Solution().longestPalindrome(${JSON.stringify(s)}) == ${answer}`).join('\n');
  const run = spawnSync('python', ['-c', problem.code.join('\n') + '\n' + assertions + "\nassert Solution().longestPalindrome('Aa' * 1000) == 2000\nassert Solution().longestPalindrome('a' * 1999 + 'b') == 1999\n"], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('409 renderer displays all input letters, paired halves, and unused odd letters in both languages', () => {
  const element = { innerHTML: '' };
  const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const context = { lang: 'en', $: () => element, escapeHtml, pick: value => value[context.lang] };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-longest-palindrome-409.js'), 'utf8'), context);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const [s, answer] of cases) {
      for (const step of problem.builder(s).steps) {
        context.renderPalindrome409View(step);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|object Object/);
        assert.equal((element.innerHTML.match(/class="pal409-char[ "]/g) || []).length, s.length);
      }
      assert.match(element.innerHTML, new RegExp(`pal409-metric"><strong>${answer}</strong>`));
      assert.equal((element.innerHTML.match(/class="pal409-piece[ "]/g) || []).length, answer);
      assert.ok((element.innerHTML.match(/class="pal409-piece center"/g) || []).length <= 1);
    }
  }
  context.renderPalindrome409View(problem.builder('abccccdd').steps.at(-1));
  assert.match(element.innerHTML, /<code>b<\/code>/);
});

test('409 is registered with dedicated renderer, browser assets, and String tags', () => {
  assert.equal(problem.category.key, 'string');
  assert.ok(problem.tags.some(tag => tag.key === 'hashmap'));
  assert.ok(problem.tags.some(tag => tag.key === 'greedy'));
  const registry = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const prefix = registry.slice(0, registry.indexOf('\nfunction ', registry.indexOf('const ORDERED_RENDERER_REGISTRY')));
  const context = { renderPalindrome409View: step => context.rendered = step };
  vm.createContext(context);
  vm.runInContext(prefix + '\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;', context);
  const step = problem.builder('a').steps[0];
  const renderer = context.registry.find(entry => entry.predicate(step));
  assert.equal(renderer.surface, 'treeView');
  renderer.render(step);
  assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  for (const asset of ['longest-palindrome-409.css', 'renderer-longest-palindrome-409.js']) assert.equal(html.split(asset + '?').length - 1, 1);
  assert.ok(html.includes('&ba=longest-palindrome-409-v1'));
});
