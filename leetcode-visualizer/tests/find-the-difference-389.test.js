const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[389];
const cases = [
  ['abcd', 'abcde', 'e'], ['', 'y', 'y'], ['a', 'aa', 'a'],
  ['abcd', 'eabcd', 'e'], ['abcd', 'ceabd', 'e'],
  ['aabb', 'bbaba', 'b'], ['zzz', 'zzzz', 'z'],
  ['ab', 'baa', 'a'], ['a'.repeat(100), 'a'.repeat(101), 'a'],
];

test('389 finds added letters regardless of position, order, or repetition', () => {
  for (const [s, t, answer] of cases) {
    const result = problem.builder(s, { t });
    assert.equal(result.answer, answer);
    assert.equal(result.steps.at(-1).difference389View.answer, answer);
    assert.equal(result.steps.at(-1).final, true);
    assert.deepEqual(problem.liveArgs(s, { t }), [s, t]);
  }
  // Exhaust all pairs of short binary words. A count difference of exactly
  // one is an independent oracle for the valid inputs.
  for (let length = 0; length <= 4; length++) {
    for (let a = 0; a < 2 ** length; a++) {
      const s = Array.from({length}, (_, i) => 'ab'[(a >> i) & 1]).join('');
      for (let b = 0; b < 2 ** (length + 1); b++) {
        const t = Array.from({length: length + 1}, (_, i) => 'ab'[(b >> i) & 1]).join('');
        const difference = [...t].filter(ch => ch === 'a').length - [...s].filter(ch => ch === 'a').length;
        if (difference === 0 || difference === 1) assert.equal(problem.builder(s, { t }).answer, difference ? 'a' : 'b');
        else assert.throws(() => problem.builder(s, { t }), /389/);
      }
    }
  }
});

test('389 counter snapshots conserve occurrences and stop before decrementing the extra letter', () => {
  for (const [s, t, answer] of cases) {
    const result = problem.builder(s, { t });
    for (const step of result.steps) {
      const v = step.difference389View;
      assert.equal(Object.values(v.count).reduce((a, b) => a + b, 0), v.processedS - v.consumedT);
      for (const ch of v.letters) {
        const counted = [...s.slice(0, v.processedS)].filter(letter => letter === ch).length;
        const consumed = [...t.slice(0, v.consumedT)].filter(letter => letter === ch).length;
        assert.equal(v.total[ch] || 0, counted);
        assert.equal(v.count[ch] || 0, counted - consumed);
        assert.ok((v.count[ch] || 0) >= 0);
      }
      assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
    }
    const last = result.steps.at(-1).difference389View;
    assert.equal(last.count[answer] || 0, 0);
    assert.equal(t[last.index], answer);
    assert.equal(last.index, last.consumedT);
    assert.deepEqual(result.steps.at(-1).codeLines, [8]);
    assert.deepEqual(result.steps[0].difference389View.count, {});
  }
  const repeated = problem.builder('a', { t: 'aa' });
  assert.equal(repeated.steps.at(-1).difference389View.index, 1);
  const early = problem.builder('abcd', { t: 'eabcd' });
  assert.equal(early.steps.some(step => step.difference389View.phase === 'consume'), false);
  assert.equal(early.steps.at(-1).difference389View.consumedT, 0);
});

test('389 accepts empty s and rejects inputs outside the rearrangement-plus-one contract', () => {
  for (const [s, t] of [['a', 'a'], ['a', 'aaa'], ['ab', 'acd'], ['a', 'bb'], ['', ''], ['A', 'aa'], ['a ', 'aaa'], ['a', 'a\n'], ['é', 'éa'], [null, 'a'], ['', null], ['a'.repeat(101), 'a'.repeat(102)]]) {
    assert.throws(() => problem.builder(s, { t }), /389/);
    assert.throws(() => problem.liveArgs(s, { t }), /389/);
  }
  assert.equal(problem.builder('', { t: 'y' }).answer, 'y');
});

test('389 displayed and repository Python agree and handle the original 1000-character limit', () => {
  const repository = fs.readFileSync(require.resolve('../../Leetcode-sln/string/Leetcode_389.py'), 'utf8').replace(/\r\n/g, '\n');
  assert.equal(repository.split('\n\n\n')[0], problem.code.join('\n'));
  const assertions = cases.map(([s, t, answer]) => `assert Solution().findTheDifference(${JSON.stringify(s)}, ${JSON.stringify(t)}) == ${JSON.stringify(answer)}`).join('\n');
  const run = spawnSync('python', ['-c', problem.code.join('\n') + '\n' + assertions + "\nassert Solution().findTheDifference('ab' * 500, 'ba' * 500 + 'b') == 'b'\n"], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('389 renderer shows all input letters, empty s, remaining counts, and the extra occurrence', () => {
  const element = { innerHTML: '' };
  const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const context = { lang: 'en', $: () => element, escapeHtml, pick: value => value[context.lang] };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-find-the-difference-389.js'), 'utf8'), context);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const [s, t, answer] of cases) {
      for (const step of problem.builder(s, { t }).steps) {
        context.renderDifference389View(step);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|object Object/);
        assert.equal((element.innerHTML.match(/class="diff389-char[ "]/g) || []).length, s.length + t.length);
      }
      assert.match(element.innerHTML, new RegExp(`diff389-answer found">${answer}</strong>`));
      assert.match(element.innerHTML, /diff389-char current extra/);
      if (!s.length) assert.match(element.innerHTML, /diff389-empty/);
    }
  }
});

test('389 is registered with assets, dedicated renderer, and opt-in empty-string input', async () => {
  assert.equal(problem.category.key, 'string');
  assert.equal(problem.allowEmptyInput, true);
  const registry = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const prefix = registry.slice(0, registry.indexOf('\nfunction ', registry.indexOf('const ORDERED_RENDERER_REGISTRY')));
  const context = { renderDifference389View: step => context.rendered = step };
  vm.createContext(context);
  vm.runInContext(prefix + '\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;', context);
  const step = problem.builder('', { t: 'y' }).steps[0];
  const renderer = context.registry.find(entry => entry.predicate(step));
  assert.equal(renderer.surface, 'treeView');
  renderer.render(step);
  assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  for (const asset of ['find-the-difference-389.css', 'renderer-find-the-difference-389.js']) assert.equal(html.split(asset + '?').length - 1, 1);
  assert.ok(html.includes('&az=find-the-difference-389-v1'));
  // Exercise the real input-collection code: 389 may submit an empty string,
  // while existing problems such as 242 must still reject it.
  const core = fs.readFileSync(require.resolve('../public/app-core.js'), 'utf8');
  const start = core.indexOf('async function runViz() {');
  const end = core.indexOf('// Collect extra params', start);
  const inputContext = { problemData: { id: 389, inputKind: 'string', allowEmptyInput: true },
    hide: () => {}, $: () => ({ value: '' }), t: () => ({ errArr: 'empty' }), showError: () => 'rejected' };
  vm.createContext(inputContext);
  vm.runInContext(core.slice(start, end) + '\nreturn input;\n}', inputContext);
  assert.equal(await inputContext.runViz(), '');
  inputContext.problemData = { id: 242, inputKind: 'string' };
  assert.equal(await inputContext.runViz(), 'rejected');
});
