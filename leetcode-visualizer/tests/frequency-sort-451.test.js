const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[451];
const cases = [['tree','eert'], ['cccaaa','aaaccc'], ['Aabb','bbAa'], ['2a2B','22Ba'], ['a','a'], ['Aa','Aa'], ['z9z9A','99zzA']];
const frequencies = s => [...s].reduce((map, ch) => ({...map, [ch]:(map[ch] || 0) + 1}), {});

function verifyGroups(input, output) {
  assert.deepEqual(frequencies(output), frequencies(input));
  const groups = output.match(/(.)\1*/g);
  assert.equal(new Set(groups.map(group=>group[0])).size, groups.length);
  for (let i = 1; i < groups.length; i++) assert.ok(groups[i-1].length >= groups[i].length);
}

test('451 preserves occurrences, groups identical characters, and orders frequencies', () => {
  for (const [input, expected] of cases) {
    const result = problem.builder(input);
    assert.equal(result.answer, expected);
    assert.equal(result.steps.at(-1).frequency451View.answer, expected);
    assert.equal(result.steps.at(-1).final, true);
    assert.deepEqual(problem.liveArgs(input), [input]);
    verifyGroups(input, result.answer);
  }
  for (let length = 1; length <= 5; length++) {
    for (let value = 0; value < 3 ** length; value++) {
      let n = value, input = '';
      for (let i = 0; i < length; i++) { input += 'aA1'[n % 3]; n = Math.floor(n / 3); }
      verifyGroups(input, problem.builder(input).answer);
    }
  }
  verifyGroups('a'.repeat(100), problem.builder('a'.repeat(100)).answer);
});

test('451 snapshots match Python lines and retain earlier counts and output groups', () => {
  const result = problem.builder('Aabb');
  assert.deepEqual(result.steps[0].frequency451View.count, {});
  assert.deepEqual(result.steps[0].frequency451View.result, []);
  for (const step of result.steps) {
    const v = step.frequency451View;
    assert.deepEqual(v.count, frequencies(v.s.slice(0, v.processed)));
    assert.ok(step.codeLines.every(line=>line >= 1 && line <= problem.code.length));
    if (v.ordered !== null) assert.equal(v.processed, v.s.length);
    for (const group of v.result) assert.equal(group, group[0].repeat(v.count[group[0]]));
    if (v.phase === 'count') assert.deepEqual(step.codeLines, [5]);
    if (v.phase === 'append') assert.deepEqual(step.codeLines, [9]);
  }
  assert.deepEqual(result.steps.find(step=>step.frequency451View.phase === 'sort').frequency451View.ordered, ['b','A','a']);
  assert.deepEqual(result.steps.at(-1).codeLines, [10]);
});

test('451 rejects malformed strings without silently trimming input', () => {
  for (const input of ['', null, 451, 'a b', ' a', 'a ', 'a\n', 'é', '<script>', 'a'.repeat(101)]) {
    assert.throws(()=>problem.builder(input), /451/);
    assert.throws(()=>problem.liveArgs(input), /451/);
  }
});

test('451 displayed and repository Python agree, including original maximum length', () => {
  const repository = fs.readFileSync(require.resolve('../../Leetcode-sln/string/Leetcode_451.py'),'utf8').replace(/\r\n/g,'\n');
  assert.equal(repository.split('\n\n\n')[0], problem.code.join('\n'));
  const checks = cases.map(([input,expected])=>`assert Solution().frequencySort(${JSON.stringify(input)}) == ${JSON.stringify(expected)}`).join('\n');
  const run = spawnSync('python',['-c', problem.code.join('\n')+'\n'+checks+"\nassert Solution().frequencySort('ab' * 250000) == 'a' * 250000 + 'b' * 250000\n"],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
});

test('451 renderer shows every input character and output group in VI and EN', () => {
  const element = {innerHTML:''};
  const escapeHtml = value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const context = {lang:'en', $:()=>element, escapeHtml, pick:value=>value[context.lang]};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-frequency-sort-451.js'),'utf8'),context);
  for (const language of ['en','vi']) {
    context.lang = language;
    for (const [input,expected] of cases) {
      for (const step of problem.builder(input).steps) {
        context.renderFrequency451View(step);
        assert.doesNotMatch(element.innerHTML,/undefined|NaN|object Object/);
        assert.equal((element.innerHTML.match(/class="freq451-char[ "]/g)||[]).length,input.length);
        assert.equal((element.innerHTML.match(/class="freq451-group[ "]/g)||[]).length,step.frequency451View.result.length);
      }
      assert.ok(element.innerHTML.includes(`<code>${expected}</code>`));
    }
  }
});

test('451 is registered with browser assets and its own renderer', () => {
  assert.equal(problem.category.key,'string');
  assert.ok(problem.tags.some(tag=>tag.key === 'hashmap'));
  const registry = fs.readFileSync(require.resolve('../public/script.js'),'utf8');
  const prefix = registry.slice(0,registry.indexOf('\nfunction ',registry.indexOf('const ORDERED_RENDERER_REGISTRY')));
  const context = {renderFrequency451View:step=>context.rendered=step};
  vm.createContext(context);
  vm.runInContext(prefix+'\nglobalThis.registry = ORDERED_RENDERER_REGISTRY;',context);
  const step = problem.builder('tree').steps[0];
  const renderer = context.registry.find(entry=>entry.predicate(step));
  assert.equal(renderer.surface,'treeView');
  renderer.render(step);
  assert.equal(context.rendered,step);
  const html = fs.readFileSync(require.resolve('../public/index.html'),'utf8');
  for (const asset of ['frequency-sort-451.css','renderer-frequency-sort-451.js']) assert.equal(html.split(asset+'?').length-1,1);
  assert.ok(html.includes('&bc=frequency-sort-451-v1'));
});
