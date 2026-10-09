const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[524];
const cases = [
  ['abpcplea', ['ale', 'apple', 'monkey', 'plea'], 'apple'],
  ['abpcplea', ['c', 'b', 'a'], 'a'],
  ['ab', ['ba', 'aaa'], ''],
  ['bab', ['ba', 'ab'], 'ab'],
  ['ab', ['ab', 'ab', 'a'], 'ab'],
  ['aaaa', ['aaa', 'aaaaa', 'aa', 'aaaa'], 'aaaa'],
  ['xyz', ['a', 'x', 'xyz'], 'xyz'],
];
// Enumerate all subsequences, independently of the two-pointer algorithm.
function oracle(s, words) {
  const subsequences = new Set(['']);
  for (const char of s) for (const value of [...subsequences]) subsequences.add(value + char);
  return words.filter(word => subsequences.has(word)).sort((a, b) => b.length - a.length || (a < b ? -1 : a > b ? 1 : 0))[0] || '';
}
test('524 chooses the longest subsequence and breaks ties lexicographically', () => {
  for (const [s, dictionary, answer] of cases) {
    const result = problem.builder(s, { dictionary: JSON.stringify(dictionary) });
    assert.equal(result.answer, answer);
    assert.equal(result.answer, oracle(s, dictionary));
    assert.deepEqual(problem.liveArgs(s, { dictionary }), [s, dictionary]);
    assert.equal(result.steps.at(-1).final, true);
    assert.equal(result.steps.at(-1).dictionary524View.answer, answer);
  }
  const words = ['aa', 'ab', 'ba', 'bb', 'aba', 'bab', 'a', 'b'];
  for (let length = 1; length <= 7; length++) {
    for (let bits = 0; bits < 2 ** length; bits++) {
      const s = Array.from({ length }, (_, i) => bits & (1 << i) ? 'a' : 'b').join('');
      assert.equal(problem.builder(s, { dictionary: words }).answer, oracle(s, words));
    }
  }
});
test('524 trace advances j only on matches and changes best only after selection', () => {
  for (const [s, dictionary] of cases) {
    const result = problem.builder(s, { dictionary });
    for (let k = 0; k < result.steps.length; k++) {
      const step = result.steps[k], view = step.dictionary524View;
      assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
      for (let n = 0; n < view.matches.length; n++) {
        assert.equal(s[view.matches[n]], view.word[n + view.matchOffset]);
        if (n) assert.ok(view.matches[n] > view.matches[n - 1]);
      }
      if (view.phase === 'compare') {
        const previous = view, next = result.steps[k + 1].dictionary524View;
        if (view.compared.equal) { assert.equal(next.phase, 'match'); assert.equal(next.j, previous.j + 1); assert.equal(next.i, previous.i); }
        else { assert.equal(next.phase, 'advance'); assert.equal(next.j, previous.j); assert.equal(next.i, previous.i + 1); }
      }
      if (k && view.best !== result.steps[k - 1].dictionary524View.best) {
        assert.equal(view.phase, 'update'); assert.deepEqual(step.codeLines, [16]); assert.equal(view.j, view.word.length);
      }
    }
    assert.equal(result.steps[0].dictionary524View.best, '');
  }
});
test('524 supports original maximum sizes with bounded detailed traces', () => {
  const s = 'a'.repeat(1000), dictionary = Array(1000).fill('a'.repeat(999));
  dictionary[999] = s;
  const result = problem.builder(s, { dictionary });
  assert.equal(result.answer, s);
  assert.ok(result.steps.length < 7505);
  const end = result.steps.at(-1).dictionary524View;
  assert.equal(end.inspected, 1000); assert.equal(end.validCount, 1000);
  assert.ok(end.omitted > 0); assert.equal(end.matches.length, 1000);
  assert.ok(JSON.stringify(result).length < 25000000);
});
test('524 rejects malformed dictionaries and inputs outside original constraints', () => {
  for (const s of ['', 'Ab', 'a b', 'a'.repeat(1001), null, 524]) assert.throws(() => problem.builder(s, { dictionary: ['a'] }), /524/);
  for (const dictionary of [undefined, null, 'a,b', '{}', [], [''], ['A'], ['a b'], [1], ['a'.repeat(1001)], Array(1001).fill('a')]) {
    assert.throws(() => problem.builder('abc', { dictionary }), /524/);
    assert.throws(() => problem.liveArgs('abc', { dictionary }), /524/);
  }
});
test('524 Python source matches the repository solution and runs the examples', () => {
  const repository = fs.readFileSync(require.resolve('../../Leetcode-sln/two-pointer/Leetcode_524.py'), 'utf8').replace(/\r\n/g, '\n').trimEnd();
  assert.equal(repository, problem.code.join('\n'));
  const checks = cases.map(([s, dictionary, answer]) => `assert Solution().findLongestWord(${JSON.stringify(s)}, ${JSON.stringify(dictionary)}) == ${JSON.stringify(answer)}`);
  const run = spawnSync('python3', ['-c', repository + '\n' + checks.join('\n')], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});
test('524 renderer covers every phase, both languages, and bounded character windows', () => {
  const element = { innerHTML: '' };
  const context = { lang: 'en', $: () => element, escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])), pick: value => value[context.lang] };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-longest-dictionary-word-524.js'), 'utf8'), context);
  for (const lang of ['en', 'vi']) {
    context.lang = lang;
    for (const [s, dictionary] of [...cases, ['a'.repeat(1000), ['a'.repeat(1000)]]]) {
      for (const step of problem.builder(s, { dictionary }).steps) {
        context.renderDictionary524View(step);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|object Object/);
        assert.ok((element.innerHTML.match(/class="ldw524-cell /g) || []).length <= 20);
      }
    }
  }
});
test('524 catalog and browser assets use the dedicated renderer', () => {
  const registry = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const prefix = registry.slice(0, registry.indexOf('\nfunction ', registry.indexOf('const ORDERED_RENDERER_REGISTRY')));
  const context = { renderDictionary524View: step => { context.rendered = step; } };
  vm.createContext(context); vm.runInContext(prefix + '\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;', context);
  const step = problem.builder('abc', { dictionary: ['ab'] }).steps[0];
  const renderer = context.registry.find(entry => entry.predicate(step));
  assert.equal(renderer.surface, 'treeView'); renderer.render(step); assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  for (const asset of ['longest-dictionary-word-524.css', 'renderer-longest-dictionary-word-524.js']) assert.equal(html.split(asset + '?').length - 1, 1);
  assert.equal(problem.category.key, 'two-pointer'); assert.ok(problem.tags.some(tag => tag.key === 'string'));
});
