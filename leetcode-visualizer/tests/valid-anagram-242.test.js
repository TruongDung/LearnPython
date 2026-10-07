const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[242];
const cases = [
  ['anagram', 'nagaram', true], ['rat', 'car', false],
  ['a', 'a', true], ['a', 'b', false], ['ab', 'a', false],
  ['aab', 'abb', false], ['aabb', 'bbaa', true], ['abc', 'abd', false],
  ['a'.repeat(100), 'a'.repeat(100), true],
];

test('242 agrees with a sorting oracle across examples and all short binary words', () => {
  for (const [s, t, answer] of cases) {
    const result = problem.builder(s, { t });
    assert.equal(result.answer, answer);
    assert.equal(result.steps.at(-1).anagram242View.answer, answer);
    assert.equal(result.steps.at(-1).final, true);
    assert.deepEqual(problem.liveArgs(s, { t }), [s, t]);
  }
  const words = [];
  for (let length = 1; length <= 4; length++) {
    for (let value = 0; value < 2 ** length; value++) {
      words.push(Array.from({length}, (_, i) => 'ab'[(value >> i) & 1]).join(''));
    }
  }
  for (const s of words) for (const t of words) {
    assert.equal(problem.builder(s, { t }).answer, [...s].sort().join('') === [...t].sort().join(''), `${s}/${t}`);
  }
});

test('242 snapshots follow the displayed code and preserve earlier counter values', () => {
  const result = problem.builder('aab', { t: 'aba' });
  const frequency = word => [...word].reduce((counts, ch) => { counts[ch] = (counts[ch] || 0) + 1; return counts; }, {});
  for (const step of result.steps) {
    const v = step.anagram242View;
    assert.deepEqual(v.countS, frequency(v.s.slice(0, v.processedS)));
    assert.deepEqual(v.countT, frequency(v.t.slice(0, v.processedT)));
    for (const ch of v.checked) assert.equal(v.countS[ch], v.countT[ch]);
    if (v.phase === 'compare') assert.equal(v.processedS + v.processedT, 6);
    assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
  }
  assert.deepEqual(result.steps[0].anagram242View.countS, {});
  assert.equal(result.steps[0].vars.some(variable => variable.name === 'count_s'), false);
  assert.equal(result.steps.at(-1).vars.find(variable => variable.name === 'count_s').value, '{"a":2,"b":1}');
  assert.deepEqual(result.steps.find(step => step.anagram242View.phase === 'read').codeLines, [6]);
  assert.deepEqual(result.steps.find(step => step.anagram242View.phase === 'count').anagram242View.countS, { a: 1 });
  assert.deepEqual(result.steps.at(-1).codeLines, [13]);
  const length = problem.builder('ab', { t: 'a' });
  assert.equal(length.steps.length, 2);
  assert.deepEqual(length.steps.at(-1).codeLines, [4]);
  const mismatch = problem.builder('aab', { t: 'abb' });
  assert.equal(mismatch.steps.filter(step => step.anagram242View.phase === 'compare').length, 1);
  assert.deepEqual(mismatch.steps.at(-1).codeLines, [12]);
  assert.equal(mismatch.steps.at(-1).anagram242View.ch, 'a');
});

test('242 validates both strings without silently trimming or accepting nonletters', () => {
  for (const invalid of ['', 'A', 'a b', 'a\n', 'é', '<script>', 'a'.repeat(101), null, 242]) {
    assert.throws(() => problem.builder(invalid, { t: 'a' }), /242/);
    assert.throws(() => problem.builder('a', { t: invalid }), /242/);
    assert.throws(() => problem.liveArgs('a', { t: invalid }), /242/);
  }
  assert.throws(() => problem.builder('a'), /242/);
});

test('242 displayed Python handles examples and the original 50000-character limit', () => {
  const assertions = cases.map(([s, t, answer]) => `assert Solution().isAnagram(${JSON.stringify(s)}, ${JSON.stringify(t)}) is ${answer ? 'True' : 'False'}`).join('\n');
  const code = problem.code.join('\n') + '\n' + assertions + "\nassert Solution().isAnagram('ab' * 25000, 'ba' * 25000) is True\nassert Solution().isAnagram('a' * 50000, 'a' * 49999 + 'b') is False\n";
  const run = spawnSync('python', ['-c', code], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('242 renderer displays every letter and all phases in both languages', () => {
  const element = { innerHTML: '' };
  const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const context = { lang: 'en', $: () => element, escapeHtml, pick: value => value[context.lang] };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-valid-anagram-242.js'), 'utf8'), context);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const [s, t, answer] of cases) {
      for (const step of problem.builder(s, { t }).steps) {
        context.renderAnagram242View(step);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
        assert.equal((element.innerHTML.match(/class="ana242-char[ "]/g) || []).length, s.length + t.length);
      }
      assert.match(element.innerHTML, new RegExp(`>${answer ? 'True' : 'False'}</strong>`));
      if (s.length === t.length && !answer) assert.match(element.innerHTML, /ana242-frequency current mismatch/);
    }
  }
});

test('242 appears in the String catalog and selects its dedicated renderer', () => {
  assert.equal(problem.category.key, 'string');
  assert.ok(problem.tags.some(tag => tag.key === 'hashmap'));
  const registry = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const prefix = registry.slice(0, registry.indexOf('\nfunction ', registry.indexOf('const ORDERED_RENDERER_REGISTRY')));
  const context = { renderAnagram242View: step => context.rendered = step };
  vm.createContext(context);
  vm.runInContext(prefix + '\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;', context);
  const step = problem.builder('ab', { t: 'ba' }).steps[0];
  const renderer = context.registry.find(entry => entry.predicate(step));
  assert.equal(renderer.surface, 'treeView');
  renderer.render(step);
  assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  for (const asset of ['valid-anagram-242.css', 'renderer-valid-anagram-242.js']) assert.equal(html.split(asset + '?').length - 1, 1);
  assert.ok(html.includes('&ay=valid-anagram-242-v1'));
});
