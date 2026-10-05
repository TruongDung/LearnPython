const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[709];

test('709 handles examples, ASCII boundaries and whitespace without losing characters', () => {
  const inputs = ['Hello', 'here', 'LOVELY', ' AZ az 09 @ [ ` { ! ', ' ', 'A'.repeat(100), Array.from({length:95}, (_, i) => String.fromCharCode(32+i)).join('')];
  for (const input of inputs) {
    const result = problem.builder(input);
    assert.equal(result.answer, input.toLowerCase());
    assert.equal(result.answer.length, input.length);
    assert.deepEqual(problem.liveArgs(input), [input]);
    const appended = result.steps.filter(step => step.lowerCase709View.phase === 'append');
    assert.equal(appended.length, input.length);
    appended.forEach((step, i) => assert.equal(step.lowerCase709View.result.join(''), input.slice(0,i+1).toLowerCase()));
  }
});

test('709 only writes output after append and snapshots can be replayed', () => {
  const result = problem.builder('A!');
  const conversion = result.steps.find(step => step.lowerCase709View.phase === 'convert');
  assert.equal(conversion.lowerCase709View.ch, 'a');
  assert.deepEqual(conversion.lowerCase709View.result, []);
  assert.deepEqual(conversion.codeLines, [6]);
  assert.equal(result.steps.filter(step => step.lowerCase709View.phase === 'convert').length, 1);
  assert.deepEqual(result.steps.at(-1).lowerCase709View.result, ['a', '!']);
  assert.equal(result.steps.at(-1).final, true);
  assert.deepEqual(result.steps[0].lowerCase709View.result, []);
});

test('709 validates original printable ASCII limits', () => {
  for (const input of ['', 'a'.repeat(101), '\n', 'é', 123]) assert.throws(() => problem.builder(input), /1–100/);
});

test('709 renders special characters safely in both languages', () => {
  const element = { innerHTML: '', querySelector: () => ({querySelector: () => null}) };
  const escapeHtml = value => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const context = { lang:'en', $: () => element, escapeHtml, pick: value => value[context.lang] };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-to-lower-case-709.js'),'utf8'),context);
  for (const language of ['vi','en']) {
    context.lang = language;
    for (const step of problem.builder('<B> "A" & ').steps) {
      context.renderLowerCase709View(step);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|<B>|<b>\"/);
      assert.match(element.innerHTML, /lc709-viz/);
    }
  }
});
