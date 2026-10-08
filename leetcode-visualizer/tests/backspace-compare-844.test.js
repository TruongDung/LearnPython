const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[844];

const typed = source => {
  const stack = [];
  for (const char of source) char === '#' ? stack.pop() : stack.push(char);
  return stack.join('');
};
const oracle = (s, t) => typed(s) === typed(t);
const cases = [
  ['ab#c', 'ad#c', true],
  ['ab##', 'c#d#', true],
  ['a#c', 'b', false],
  ['a##c', '#a#c', true],
  ['bxj##tw', 'bxo#j##tw', true],
  ['nzp#o#g', 'b#nzp#o#g', true],
  ['####', '##', true],
  ['a', 'a', true],
  ['a', 'b', false],
];

test('844 matches stack semantics for examples and edge cases', () => {
  for (const [s, t, answer] of cases) {
    const result = problem.builder(s, { t });
    assert.equal(result.answer, answer, `${s}/${t}`);
    assert.equal(result.answer, oracle(s, t));
    assert.equal(result.original, s);
    assert.equal(result.t, t);
    assert.deepEqual(problem.liveArgs(s, { t }), [s, t]);
    assert.equal(result.steps.at(-1).final, true);
    assert.equal(result.steps.at(-1).backspace844View.answer, answer);
  }
});

test('844 agrees with an independent stack oracle across all short inputs', () => {
  const alphabet = 'ab#';
  const strings = [];
  for (let length = 1; length <= 4; length++) {
    for (let value = 0; value < alphabet.length ** length; value++) {
      let rest = value;
      let source = '';
      for (let index = 0; index < length; index++, rest = Math.floor(rest / alphabet.length)) source += alphabet[rest % alphabet.length];
      strings.push(source);
    }
  }
  for (const s of strings) for (const t of strings) {
    assert.equal(problem.builder(s, { t }).answer, oracle(s, t), `${s}/${t}`);
  }
});

test('844 trace classifies backspaces, erased letters, and visible matches without mutating snapshots', () => {
  const result = problem.builder('ab##c#d', { t: 'x#d' });
  const first = result.steps[0].backspace844View;
  for (const step of result.steps) {
    const view = step.backspace844View;
    assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
    for (const index of view.backspacesS) assert.equal(view.s[index], '#');
    for (const index of view.backspacesT) assert.equal(view.t[index], '#');
    for (const index of view.deletedS) assert.match(view.s[index], /^[a-z]$/);
    for (const index of view.deletedT) assert.match(view.t[index], /^[a-z]$/);
    for (const match of view.matches) assert.equal(match.sChar, match.tChar);
    assert.ok(view.skipS >= 0 && view.skipT >= 0);
  }
  assert.deepEqual(first.backspacesS, []);
  assert.deepEqual(first.deletedS, []);
  assert.ok(result.steps.some(step => step.backspace844View.phase === 'backspace-s'));
  assert.ok(result.steps.some(step => step.backspace844View.phase === 'delete-s'));
  assert.ok(result.steps.some(step => step.backspace844View.phase === 'compare'));
  assert.deepEqual(result.steps.at(-1).codeLines, [25]);
});

test('844 stops immediately on a visible mismatch or unequal exhaustion', () => {
  const mismatch = problem.builder('a#c', { t: 'b' });
  assert.equal(mismatch.answer, false);
  assert.deepEqual(mismatch.steps.at(-1).codeLines, [27]);
  assert.equal(mismatch.steps.at(-1).backspace844View.compared.sChar, 'c');
  assert.equal(mismatch.steps.at(-1).backspace844View.compared.tChar, 'b');
  const exhaustion = problem.builder('ab#', { t: 'a#' });
  assert.equal(exhaustion.answer, false);
  assert.deepEqual(exhaustion.steps.at(-1).codeLines, [25]);
  assert.notEqual(exhaustion.steps.at(-1).backspace844View.i, exhaustion.steps.at(-1).backspace844View.j);
});

test('844 validates both inputs without silently accepting spaces or uppercase letters', () => {
  for (const invalid of ['', 'A', 'a b', '\n', 'é', 'a'.repeat(101), null, 844]) {
    assert.throws(() => problem.builder(invalid, { t: 'a' }), /844/);
    assert.throws(() => problem.builder('a', { t: invalid }), /844/);
    assert.throws(() => problem.liveArgs('a', { t: invalid }), /844/);
  }
  assert.throws(() => problem.builder('a'), /844/);
  assert.equal(problem.preserveInputWhitespace, true);
});

test('844 displayed Python matches the repository solution and original 200-character limit', () => {
  const repository = fs.readFileSync(require.resolve('../../Leetcode-sln/two-pointer/Leetcode_844.py'), 'utf8').replace(/\r\n/g, '\n').trimEnd();
  assert.equal(repository, problem.code.join('\n'));
  const assertions = cases.map(([s, t, answer]) => `assert Solution().backspaceCompare(${JSON.stringify(s)}, ${JSON.stringify(t)}) is ${answer ? 'True' : 'False'}`).join('\n');
  const code = problem.code.join('\n') + '\n' + assertions + "\ns = 'ab#c' * 50\nt = 'ac' * 50\nassert len(s) == 200 and len(t) == 100\nassert Solution().backspaceCompare(s, t) is True\n";
  const run = spawnSync('python3', ['-c', code], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('844 renderer covers all phases in Vietnamese and English', () => {
  const element = { innerHTML: '' };
  const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const context = { lang: 'en', $: () => element, escapeHtml, pick: value => value[context.lang] };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-backspace-compare-844.js'), 'utf8'), context);
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const [s, t, answer] of cases) {
      for (const step of problem.builder(s, { t }).steps) {
        context.renderBackspace844View(step);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|object Object/);
        assert.equal((element.innerHTML.match(/class="bs844-char/g) || []).length, s.length + t.length);
      }
      assert.match(element.innerHTML, new RegExp(`<strong>${answer ? 'TRUE' : 'FALSE'}</strong>`));
      assert.ok(element.innerHTML.includes(escapeHtml(typed(s)) || '∅'));
      assert.ok(element.innerHTML.includes(escapeHtml(typed(t)) || '∅'));
    }
  }
});

test('844 is registered with dedicated assets and an updated roadmap row', () => {
  assert.equal(problem.category.key, 'two-pointer');
  assert.ok(problem.tags.some(tag => tag.key === 'string'));
  const registry = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const prefix = registry.slice(0, registry.indexOf('\nfunction ', registry.indexOf('const ORDERED_RENDERER_REGISTRY')));
  const context = { renderBackspace844View: step => { context.rendered = step; } };
  vm.createContext(context);
  vm.runInContext(prefix + '\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;', context);
  const step = problem.builder('ab#c', { t: 'ad#c' }).steps[0];
  const renderer = context.registry.find(entry => entry.predicate(step));
  assert.equal(renderer.surface, 'treeView');
  renderer.render(step);
  assert.equal(context.rendered, step);
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  for (const asset of ['backspace-compare-844.css', 'renderer-backspace-compare-844.js']) {
    assert.equal(html.split(asset + '?').length - 1, 1);
    assert.ok(fs.existsSync(require.resolve('../public/' + asset)));
  }
  assert.ok(html.includes('&bh=backspace-compare-844-v1'));
  const roadmap = fs.readFileSync(require.resolve('../../docs/leetcode-string-study-roadmap.md'), 'utf8');
  assert.match(roadmap, /\| 28 \| \[844\. Backspace String Compare\][^\n]+\| Có \|/);
});
