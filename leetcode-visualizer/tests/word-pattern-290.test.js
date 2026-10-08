const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[290];
const cases = [
  ['abba', 'dog cat cat dog', true], ['abba', 'dog cat cat fish', false],
  ['aaaa', 'dog cat cat dog', false], ['ab', 'dog dog', false],
  ['aa', 'dog dog', true], ['a', 'dog', true], ['ab', 'dog cat', true],
  ['a', 'dog cat', false], ['ab', 'dog', false],
  ['abba', 'constructor cat cat constructor', true],
  ['abc', 'constructor tostring proto', true],
  ['a'.repeat(100), Array(100).fill('a').join(' '), true],
];

test('290 agrees with pairwise equality of letters and words, including both conflict directions', () => {
  for (const [pattern, s, answer] of cases) {
    const result = problem.builder(pattern, { s });
    assert.equal(result.answer, answer);
    assert.equal(result.steps.at(-1).wordPattern290View.answer, answer);
    assert.equal(result.steps.at(-1).final, true);
    assert.deepEqual(problem.liveArgs(pattern, { s }), [pattern, s]);
  }
  // A bijection exists iff every pair of positions agrees about equality.
  // This independent oracle also catches a forward-only map implementation.
  for (let length = 1; length <= 5; length++) {
    for (let a = 0; a < 2 ** length; a++) for (let b = 0; b < 2 ** length; b++) {
      const pattern = Array.from({length}, (_, i) => 'ab'[(a >> i) & 1]).join('');
      const words = Array.from({length}, (_, i) => ['dog','cat'][(b >> i) & 1]);
      let expected = true;
      for (let i = 0; i < length; i++) for (let j = 0; j < length; j++) {
        if ((pattern[i] === pattern[j]) !== (words[i] === words[j])) expected = false;
      }
      assert.equal(problem.builder(pattern, {s:words.join(' ')}).answer, expected);
    }
  }
});

test('290 preserves earlier maps, stores each direction on its own code line, and stops on conflict', () => {
  const result = problem.builder('abba', {s:'dog cat cat dog'});
  assert.deepEqual(result.steps[0].wordPattern290View.charToWord, []);
  const forward = result.steps.find(step => step.wordPattern290View.phase === 'store-forward');
  assert.deepEqual(forward.codeLines, [12]);
  assert.deepEqual(forward.wordPattern290View.charToWord, [['a','dog']]);
  assert.deepEqual(forward.wordPattern290View.wordToChar, []);
  const reverse = result.steps.find(step => step.wordPattern290View.phase === 'store-reverse');
  assert.deepEqual(reverse.codeLines, [13]);
  assert.deepEqual(reverse.wordPattern290View.wordToChar, [['dog','a']]);
  for (const step of result.steps) {
    const v = step.wordPattern290View;
    for (let i = 0; i < v.matched; i++) {
      assert.equal(new Map(v.charToWord).get(v.pattern[i]), v.words[i]);
      assert.equal(new Map(v.wordToChar).get(v.words[i]), v.pattern[i]);
    }
    assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
  }
  const mismatch = problem.builder('abba', {s:'dog cat cat fish'}).steps.at(-1);
  assert.deepEqual(mismatch.codeLines, [9]);
  assert.equal(mismatch.wordPattern290View.index, 3);
  assert.equal(mismatch.wordPattern290View.forwardConflict, true);
  assert.deepEqual(mismatch.wordPattern290View.charToWord, [['a','dog'],['b','cat']]);
  const duplicate = problem.builder('ab', {s:'dog dog'}).steps.at(-1);
  assert.deepEqual(duplicate.codeLines, [11]);
  assert.equal(duplicate.wordPattern290View.reverseConflict, true);
  assert.deepEqual(duplicate.wordPattern290View.charToWord, [['a','dog']]);
  const length = problem.builder('ab', {s:'dog'});
  assert.equal(length.steps.length, 3);
  assert.equal(length.steps.at(-1).wordPattern290View.initialized, false);
  assert.deepEqual(length.steps.at(-1).codeLines, [5]);
});

test('290 rejects malformed inputs and preserves the original word spacing rules', () => {
  for (const pattern of ['', 'A', 'a b', 'a\n', null, 'a'.repeat(101)]) {
    assert.throws(() => problem.builder(pattern, {s:'dog'}), /290/);
  }
  for (const s of ['', 'Dog', ' dog', 'dog ', 'dog  cat', 'dog\tcat', 'dog\ncat', '<script>', null, 'a'.repeat(301)]) {
    assert.throws(() => problem.builder('a', {s}), /290/);
    assert.throws(() => problem.liveArgs('a', {s}), /290/);
  }
  assert.throws(() => problem.builder('a'), /290/);
});

test('290 displayed and repository Python agree, including original maximum input lengths', () => {
  const repository = fs.readFileSync(require.resolve('../../Leetcode-sln/string/Leetcode_290.py'), 'utf8').replace(/\r\n/g, '\n');
  assert.equal(repository.split('\n\n\n')[0], problem.code.join('\n'));
  const assertions = cases.map(([pattern, s, answer]) => `assert Solution().wordPattern(${JSON.stringify(pattern)}, ${JSON.stringify(s)}) is ${answer ? 'True' : 'False'}`).join('\n');
  const run = spawnSync('python', ['-c', problem.code.join('\n') + '\n' + assertions + "\nassert Solution().wordPattern('a' * 300, ' '.join(['dog'] * 300)) is True\nassert Solution().wordPattern('a', 'x' * 3000) is True\n"], {encoding:'utf8'});
  assert.equal(run.status, 0, run.stderr);
});

test('290 renderer shows all positions, length mismatches, and both conflicting maps in VI and EN', () => {
  const element = {innerHTML:''};
  const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const context = {lang:'en', $:()=>element, escapeHtml, pick:value=>value[context.lang]};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-word-pattern-290.js'), 'utf8'), context);
  for (const language of ['en','vi']) {
    context.lang = language;
    for (const [pattern, s, answer] of cases) {
      for (const step of problem.builder(pattern, {s}).steps) {
        context.renderWordPattern290View(step);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|object Object/);
        assert.equal((element.innerHTML.match(/class="wp290-pair[ "]/g) || []).length, Math.max(pattern.length,s.split(' ').length));
      }
      assert.match(element.innerHTML, new RegExp(`>${answer?'True':'False'}</strong>`));
      if (!answer) assert.match(element.innerHTML, /conflict/);
      if (pattern.length !== s.split(' ').length) assert.match(element.innerHTML, /∅/);
    }
  }
});

test('290 is registered with browser assets and its own renderer', () => {
  assert.equal(problem.category.key,'string');
  assert.ok(problem.tags.some(tag=>tag.key==='hashmap'));
  const registry = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const prefix = registry.slice(0,registry.indexOf('\nfunction ',registry.indexOf('const ORDERED_RENDERER_REGISTRY')));
  const context = {renderWordPattern290View:step=>context.rendered=step};
  vm.createContext(context);
  vm.runInContext(prefix+'\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;',context);
  const step = problem.builder('a',{s:'dog'}).steps[0];
  const renderer = context.registry.find(entry=>entry.predicate(step));
  assert.equal(renderer.surface,'treeView');
  renderer.render(step);
  assert.equal(context.rendered,step);
  const html = fs.readFileSync(require.resolve('../public/index.html'),'utf8');
  for (const asset of ['word-pattern-290.css','renderer-word-pattern-290.js']) assert.equal(html.split(asset+'?').length-1,1);
  assert.ok(html.includes('&bb=word-pattern-290-v1'));
});
