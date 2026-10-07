const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[151];
const oracle = s => s.trim().split(/ +/).reverse().join(' ');
const examples = [
  ['the sky is blue', 'blue is sky the'],
  ['  hello world  ', 'world hello'],
  ['a good   example', 'example good a'],
  ['  A1   b2 C3  ', 'C3 b2 A1'],
  ['a', 'a'], [' a ', 'a'], ['  single  ', 'single'],
];

test('151 reverses word order, preserves letters, and normalizes all space positions', () => {
  for (const [s, answer] of [...examples, ['a'.repeat(100), 'a'.repeat(100)]]) {
    const result = problem.builder(s);
    assert.equal(result.answer, answer);
    assert.equal(result.original, s);
    assert.deepEqual(problem.liveArgs(s), [s]);
    assert.equal(result.steps.at(-1).final, true);
    assert.deepEqual(result.steps.at(-1).codeLines, [13]);
  }
  // Enumerate short inputs so adjacent spaces, single-letter words and both
  // boundaries are covered independently of the right-to-left implementation.
  for (let length = 1; length <= 5; length++) {
    for (let value = 0; value < 4 ** length; value++) {
      let s = '', rest = value;
      for (let i = 0; i < length; i++, rest = Math.floor(rest / 4)) s += 'aB9 '[rest % 4];
      if (s.trim()) assert.equal(problem.builder(s).answer, oracle(s), JSON.stringify(s));
    }
  }
});

test('151 appends only complete words and replay does not mutate earlier snapshots', () => {
  const result = problem.builder('  ab   CD  ');
  const appended = result.steps.filter(step => step.reverseWords151View.phase === 'append');
  assert.deepEqual(appended.map(step => step.reverseWords151View.words.map(word => word.text)), [['CD'], ['CD', 'ab']]);
  assert.deepEqual(appended.map(step => step.codeLines), [[12], [12]]);
  assert.deepEqual(result.steps[0].reverseWords151View.words, []);
  for (const step of result.steps) {
    const v = step.reverseWords151View;
    for (const word of v.words) {
      assert.equal(word.text, v.s.slice(word.start, word.end + 1));
      assert.ok(word.start === 0 || v.s[word.start - 1] === ' ');
      assert.ok(word.end === v.s.length - 1 || v.s[word.end + 1] === ' ');
    }
    if (v.range) assert.equal(v.s.slice(v.range.start, v.range.end + 1).includes(' '), false);
    if (v.phase === 'space-check') assert.ok(v.i >= 0 && v.i < v.s.length);
  }
  assert.ok(result.steps.some(step => step.reverseWords151View.i === -1));
  assert.deepEqual(appended[0].reverseWords151View.words, [{ text: 'CD', start: 7, end: 8 }]);
});

test('151 rejects missing words, invalid characters and inputs beyond the displayed limit', () => {
  for (const s of ['', '   ', '\tword', 'a\nb', 'é', '<script>', 'a'.repeat(101), null, 151]) {
    assert.throws(() => problem.builder(s), /151/);
    assert.throws(() => problem.liveArgs(s), /151/);
  }
});

test('151 displayed Python and repository solution agree through the original 10000-character limit', () => {
  const repository = fs.readFileSync(require.resolve('../../Leetcode-sln/string/Leetcode_151.py'), 'utf8').replace(/\r\n/g, '\n');
  assert.equal(repository.split('\n\n\n')[0], problem.code.join('\n'));
  const assertions = examples.map(([s, answer]) => `assert Solution().reverseWords(${JSON.stringify(s)}) == ${JSON.stringify(answer)}`).join('\n');
  const code = problem.code.join('\n') + '\n' + assertions + "\ns = 'ab  ' * 2500\nassert len(s) == 10000\nassert Solution().reverseWords(s) == ' '.join(['ab'] * 2500)\n";
  const run = spawnSync('python', ['-c', code], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('151 renders every phase in Vietnamese and English, including the -1 boundary', () => {
  const element = { innerHTML: '', querySelector: () => ({ querySelector: () => null }) };
  const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const context = { lang: 'en', $: () => element, escapeHtml, pick: value => value[context.lang] };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-reverse-words-151.js'), 'utf8'), context);
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const [s, answer] of examples) {
      for (const step of problem.builder(s).steps) {
        context.renderReverseWords151View(step);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
        assert.match(element.innerHTML, /rw151-viz/);
      }
      assert.ok(element.innerHTML.includes(escapeHtml(JSON.stringify(answer))));
      assert.match(element.innerHTML, /rw151-before pointer/);
    }
  }
});

test('151 is wired to the String catalog, renderer registry and browser assets', () => {
  assert.equal(problem.category.key, 'string');
  assert.equal(problem.preserveInputWhitespace, true);
  const registry = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const prefix = registry.slice(0, registry.indexOf('\nfunction ', registry.indexOf('const ORDERED_RENDERER_REGISTRY')));
  const context = { renderReverseWords151View: step => context.rendered = step };
  vm.createContext(context);
  vm.runInContext(prefix + '\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;', context);
  const step = problem.builder('ab cd').steps[0];
  const renderer = context.registry.find(entry => entry.predicate(step));
  assert.equal(renderer.surface, 'treeView');
  renderer.render(step);
  assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  for (const asset of ['reverse-words-151.css', 'renderer-reverse-words-151.js']) {
    assert.equal(html.split(asset + '?').length - 1, 1);
    assert.ok(fs.existsSync(require.resolve('../public/' + asset)));
  }
  assert.ok(html.includes('&ax=reverse-words-151-v1'));
});
