const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[1662];

const cases = [
  [['ab','c'], ['a','bc'], true],
  [['a','cb'], ['ab','c'], false],
  [['abc','d','defg'], ['abcddefg'], true],
  [['ab'], ['a','bc'], false],
  [['abc'], ['abd'], false],
  [['zbc'], ['abc'], false],
  [['a'], ['a'], true],
];

test('1662 compares represented strings, not array boundaries', () => {
  for (const [word1,word2,expected] of cases) {
    const result = problem.builder(word1,{word2:JSON.stringify(word2)});
    assert.equal(result.answer, expected);
    assert.equal(result.steps.at(-1).equivalent1662View.answer, expected);
    assert.equal(result.steps.at(-1).final, true);
    assert.deepEqual(problem.liveArgs(word1,{word2:JSON.stringify(word2)}),[word1,word2]);
  }
  function partitions(word) {
    return Array.from({length:1 << (word.length-1)},(_, mask) => {
      const chunks = []; let start = 0;
      for (let i=0;i<word.length-1;i++) if (mask & (1<<i)) { chunks.push(word.slice(start,i+1)); start=i+1; }
      chunks.push(word.slice(start)); return chunks;
    });
  }
  const partitionsA = partitions('abba');
  for (const left of partitionsA) {
    for (const right of partitionsA) assert.equal(problem.builder(left,{word2:right}).answer, true);
    for (const right of partitions('abab')) assert.equal(problem.builder(left,{word2:right}).answer, false);
  }
});

test('1662 checks lengths first and stops at the first unequal character', () => {
  const length = problem.builder(['abc'],{word2:'["ab"]'});
  assert.equal(length.steps.some(step=>step.equivalent1662View.phase==='compare'),false);
  assert.deepEqual(length.steps.at(-1).codeLines,[6]);
  const mismatch = problem.builder(['a','cb'],{word2:'["ab","c"]'});
  assert.equal(mismatch.steps.filter(step=>step.equivalent1662View.phase==='compare').length,2);
  assert.equal(mismatch.steps.at(-1).equivalent1662View.index,1);
  assert.equal(mismatch.steps.at(-1).equivalent1662View.matched,1);
  assert.deepEqual(mismatch.steps.at(-1).codeLines,[9]);
  const match = problem.builder(['ab','c'],{word2:'["a","bc"]'});
  assert.equal(match.steps.at(-1).equivalent1662View.matched,3);
  assert.equal(match.steps[0].equivalent1662View.s1,null);
  assert.equal(match.steps[1].equivalent1662View.s1,'abc');
  assert.equal(match.steps[1].equivalent1662View.s2,null);
  assert.deepEqual(match.steps.at(-1).codeLines,[10]);
});

test('1662 validates both arrays and accepts the original 1000-character limit', () => {
  for (const invalid of [[],[''],['A'],[1],['a'.repeat(1001)],'not json [']) {
    assert.throws(()=>problem.builder(invalid,{word2:'["a"]'}), /1662/);
    assert.throws(()=>problem.builder(['a'],{word2:invalid}), /1662/);
  }
  assert.equal(problem.builder(['a'.repeat(1000)],{word2:Array(1000).fill('a')}).answer,true);
  assert.equal(problem.builder('ab,c',{word2:'a,bc'}).answer,true);
});

test('1662 displayed Python and repository solution agree with examples and edge cases', () => {
  const repository = fs.readFileSync(require.resolve('../../Leetcode-sln/string/Leetcode_1662.py'),'utf8');
  assert.equal(repository.split('\n\n\n')[0],problem.code.join('\n'));
  const assertions = cases.map(([word1,word2,expected])=>`assert Solution().arrayStringsAreEqual(${JSON.stringify(word1)}, ${JSON.stringify(word2)}) is ${expected?'True':'False'}`).join('\n');
  const run = spawnSync('python',['-c',problem.code.join('\n')+'\n'+assertions],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
});

test('1662 renderer covers both languages, mismatch and missing characters', () => {
  const element = { innerHTML:'', querySelector:()=>({querySelector:()=>null}) };
  const context = { lang:'en', $:()=>element, escapeHtml:String, pick:value=>value[context.lang] };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-equivalent-string-arrays-1662.js'),'utf8'),context);
  for (const language of ['vi','en']) {
    context.lang = language;
    for (const [word1,word2,answer] of cases) {
      const result = problem.builder(word1,{word2});
      for (const step of result.steps) {
        context.renderEquivalent1662View(step);
        assert.doesNotMatch(element.innerHTML,/undefined|NaN/);
      }
      assert.match(element.innerHTML,new RegExp(`>${answer?'True':'False'}</strong>`));
      if (word1.join('').length !== word2.join('').length) assert.match(element.innerHTML,/extra|absent/);
      else if (!answer) assert.match(element.innerHTML,/mismatch/);
    }
  }
});
