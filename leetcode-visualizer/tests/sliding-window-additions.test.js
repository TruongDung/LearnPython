const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const problem = SUPPORTED[1876];
const cases = [['xyzzaz',1],['aababcabc',4],['abcabc',4],['aaaaa',0],['a',0],['ab',0],['abc',1],['aab',0]];
const goodStarts = s => [...s].flatMap((_,i)=>i+2<s.length && s[i]!==s[i+1] && s[i]!==s[i+2] && s[i+1]!==s[i+2] ? [i] : []);

test('1876 counts every good occurrence, including overlapping and repeated text', () => {
  for (const [input,expected] of cases) {
    const result = problem.builder(input);
    assert.equal(result.answer,expected);
    assert.equal(result.steps.at(-1).triplets1876View.answer,expected);
    assert.equal(result.steps.at(-1).final,true);
    assert.deepEqual(problem.liveArgs(input),[input]);
  }
  for (let length = 1; length <= 6; length++) for (let n = 0; n < 3**length; n++) {
    let input = '', value = n;
    for (let i=0;i<length;i++) { input += 'abc'[value%3]; value=Math.floor(value/3); }
    assert.equal(problem.builder(input).answer,goodStarts(input).length);
  }
  const maximum = 'abc'.repeat(33)+'a';
  assert.equal(problem.builder(maximum).answer,98);
});

test('1876 snapshots preserve history, align source lines and increment only good windows', () => {
  const result = problem.builder('aababcabc');
  assert.deepEqual(result.steps[0].triplets1876View.history,[]);
  for (const step of result.steps) {
    const v = step.triplets1876View;
    assert.equal(v.answer,v.history.filter(entry=>entry.good).length);
    assert.deepEqual(v.history.map(entry=>entry.left),Array.from({length:v.history.length},(_,i)=>i));
    for (const entry of v.history) {
      assert.equal(entry.window,v.s.slice(entry.left,entry.left+3));
      assert.equal(entry.good,goodStarts(v.s).includes(entry.left));
    }
    assert.ok(step.codeLines.every(line=>line>=1 && line<=problem.code.length));
    if (v.window!==null) assert.equal(v.window,v.s.slice(v.left,v.left+3));
    if (v.phase==='count') { assert.equal(v.good,true); assert.deepEqual(step.codeLines,[7]); }
    if (v.phase==='compare' && v.good) assert.equal(v.history.length,v.left);
  }
  const final = result.steps.at(-1);
  assert.deepEqual(final.codeLines,[8]);
  assert.equal(final.triplets1876View.history.length,7);
  assert.deepEqual(final.triplets1876View.history.filter(entry=>entry.window==='abc').map(entry=>entry.left),[3,6]);
  for (const input of ['a','ab']) assert.deepEqual(problem.builder(input).steps.map(step=>step.codeLines[0]),[3,4,8]);
});

test('1876 rejects invalid inputs and retains the full original input limit', () => {
  for (const input of ['',null,1876,'A','a b',' a','a ','a\n','é','a'.repeat(101)]) {
    assert.throws(()=>problem.builder(input),/1876/);
    assert.throws(()=>problem.liveArgs(input),/1876/);
  }
  assert.equal(problem.builder('a'.repeat(100)).answer,0);
});

test('1876 renderer shows every character and checked window in VI and EN', () => {
  const element = {innerHTML:''};
  const escapeHtml = value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const context = {lang:'en',$:()=>element,escapeHtml,pick:value=>value[context.lang]};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-distinct-triplets-1876.js'),'utf8'),context);
  for (const language of ['en','vi']) {
    context.lang=language;
    for (const [input,expected] of cases) {
      for (const step of problem.builder(input).steps) {
        context.renderTriplets1876View(step);
        assert.doesNotMatch(element.innerHTML,/undefined|NaN|object Object/);
        assert.equal((element.innerHTML.match(/class="trip1876-char[ "]/g)||[]).length,input.length);
        assert.equal((element.innerHTML.match(/class="trip1876-entry[ "]/g)||[]).length,step.triplets1876View.history.length);
      }
      assert.ok(element.innerHTML.includes(`<strong>${expected}</strong>`));
    }
  }
});

test('1876 integrates with its renderer, catalog and browser assets', () => {
  assert.equal(problem.category.key,'sliding');
  const source = fs.readFileSync(require.resolve('../public/script.js'),'utf8');
  const prefix = source.slice(0,source.indexOf('\nfunction ',source.indexOf('const ORDERED_RENDERER_REGISTRY')));
  const context = {renderTriplets1876View:step=>context.rendered=step};
  vm.createContext(context); vm.runInContext(prefix+'\nglobalThis.registry=ORDERED_RENDERER_REGISTRY;',context);
  const step=problem.builder('abc').steps[0], entry=context.registry.find(entry=>entry.predicate(step));
  assert.equal(entry.surface,'treeView'); entry.render(step); assert.equal(context.rendered,step);
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');
  for (const asset of ['distinct-triplets-1876.css','renderer-distinct-triplets-1876.js']) assert.equal(html.split(asset+'?').length-1,1);
  assert.ok(html.includes('&be=distinct-triplets-1876-v1'));
  const python=fs.readFileSync(require.resolve('../../Leetcode-sln/sliding-window/Leetcode_1876.py'),'utf8').replace(/\r\n/g,'\n');
  assert.equal(python.split('\n\n\n')[0],problem.code.join('\n'));
});

test('all five added Python solutions match brute-force answers on small strings', () => {
  const python = `
import itertools
import runpy
from pathlib import Path
root = Path(${JSON.stringify(path.resolve(__dirname,'../../Leetcode-sln/sliding-window'))})
solutions = {i: runpy.run_path(str(root / f'Leetcode_{i}.py'))['Solution']() for i in [1456,1876,567,159,1358]}
assert solutions[1456].maxVowels('abciiidef',3) == 3
assert solutions[567].checkInclusion('ab','eidbaooo') is True
assert solutions[567].checkInclusion('ab','eidboaoo') is False
assert solutions[159].lengthOfLongestSubstringTwoDistinct('eceba') == 3
assert solutions[159].lengthOfLongestSubstringTwoDistinct('ccaabbb') == 5
assert solutions[1358].numberOfSubstrings('abcabc') == 10
assert solutions[1358].numberOfSubstrings('aaacb') == 3
for n in range(1,7):
    for letters in itertools.product('abc',repeat=n):
        s = ''.join(letters)
        substrings = [s[i:j] for i in range(n) for j in range(i+1,n+1)]
        assert solutions[1876].countGoodSubstrings(s) == sum(len(t)==3 and len(set(t))==3 for t in substrings)
        assert solutions[159].lengthOfLongestSubstringTwoDistinct(s) == max(len(t) for t in substrings if len(set(t))<=2)
        assert solutions[1358].numberOfSubstrings(s) == sum(set(t)==set('abc') for t in substrings)
        for k in range(1,n+1):
            assert solutions[1456].maxVowels(s,k) == max(sum(ch in 'aeiou' for ch in s[i:i+k]) for i in range(n-k+1))
        for pattern in ['a','b','ab','aa','abc','aab','abcd']:
            expected = any(sorted(s[i:i+len(pattern)])==sorted(pattern) for i in range(n-len(pattern)+1))
            assert solutions[567].checkInclusion(pattern,s) == expected
assert solutions[1456].maxVowels('aeiou'*20000,100000) == 100000
assert solutions[567].checkInclusion('a'*10000,'b'+'a'*10000) is True
assert solutions[159].lengthOfLongestSubstringTwoDistinct('ab'*50000) == 100000
assert solutions[1358].numberOfSubstrings('abc'*16666+'ab') == (50000-1)*(50000-2)//2
`;
  const run=spawnSync('python',['-c',python],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
});

test('the requested sliding-window group has visualization and Python coverage for all 11 IDs', () => {
  const ids=[1456,1876,3,438,567,424,159,340,1358,76,30];
  const files=[];
  const walk=directory=>{for(const entry of fs.readdirSync(directory,{withFileTypes:true})) {
    const full=path.join(directory,entry.name);
    if(entry.isDirectory()) walk(full); else files.push(entry.name);
  }};
  walk(path.resolve(__dirname,'../../Leetcode-sln'));
  for(const id of ids) {
    assert.ok(SUPPORTED[id],`Missing visualization ${id}`);
    assert.ok(files.includes(`Leetcode_${id}.py`),`Missing Python ${id}`);
  }
});
