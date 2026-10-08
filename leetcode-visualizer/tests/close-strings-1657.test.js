const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[1657];
const cases = [['abc','bca',true], ['a','aa',false], ['cabbba','abbccc',true], ['aaab','bccc',false], ['aabbcc','aaaabc',false], ['aabbccc','abbbccc',false], ['a','b',false], ['aa','aa',true]];
const frequencies = s => [...s].reduce((map,ch)=>({...map,[ch]:(map[ch]||0)+1}),{});

// Explore the two legal operations directly, independently of the frequency criterion.
function reachable(start) {
  const seen = new Set([start]), queue = [start];
  for (let head = 0; head < queue.length; head++) {
    const s = queue[head], letters = [...new Set(s)];
    const add = next => { if (!seen.has(next)) { seen.add(next); queue.push(next); } };
    for (let i = 0; i < s.length; i++) for (let j = i+1; j < s.length; j++) {
      const next = [...s]; [next[i],next[j]] = [next[j],next[i]]; add(next.join(''));
    }
    for (let i = 0; i < letters.length; i++) for (let j = i+1; j < letters.length; j++) {
      const a = letters[i], b = letters[j];
      add([...s].map(ch=>ch===a?b:ch===b?a:ch).join(''));
    }
  }
  return seen;
}

test('1657 agrees with actual reachable strings under both legal operations', () => {
  for (const [word1,word2,expected] of cases) {
    const result = problem.builder(word1,{word2});
    assert.equal(result.answer,expected);
    assert.equal(result.steps.at(-1).close1657View.answer,expected);
    assert.equal(result.steps.at(-1).final,true);
    assert.deepEqual(problem.liveArgs(word1,{word2}),[word1,word2]);
  }
  for (let length = 1; length <= 4; length++) {
    const strings = Array.from({length:3**length},(_,value)=>{
      let s = '', n = value;
      for (let i = 0; i < length; i++) { s += 'abc'[n%3]; n = Math.floor(n/3); }
      return s;
    });
    for (const word1 of strings) {
      const possible = reachable(word1);
      for (const word2 of strings) assert.equal(problem.builder(word1,{word2}).answer,possible.has(word2),`${word1} / ${word2}`);
    }
  }
});

test('1657 snapshots preserve counts and distinguish all three rejection reasons', () => {
  const result = problem.builder('cabbba',{word2:'abbccc'});
  for (const step of result.steps) {
    const v = step.close1657View;
    assert.deepEqual(v.count1,frequencies(v.word1.slice(0,v.processed1)));
    assert.deepEqual(v.count2,frequencies(v.word2.slice(0,v.processed2)));
    assert.ok(step.codeLines.every(line=>line>=1 && line<=problem.code.length));
    if (v.phase==='sort1') { assert.deepEqual(step.codeLines,[12]); assert.equal(v.freq2,null); }
    if (v.phase==='sort2') assert.deepEqual(step.codeLines,[13]);
    if (v.phase==='compare') assert.deepEqual(step.codeLines,[14]);
  }
  assert.deepEqual(result.steps[0].close1657View.count1,{});
  const final = result.steps.at(-1).close1657View;
  assert.deepEqual(final.freq1,[1,2,3]); assert.deepEqual(final.freq2,[1,2,3]);
  assert.notDeepEqual(final.count1,final.count2);
  const length = problem.builder('a',{word2:'aa'}).steps;
  assert.equal(length.length,2); assert.deepEqual(length.at(-1).codeLines,[4]);
  const letters = problem.builder('aaab',{word2:'bccc'}).steps.at(-1);
  assert.deepEqual(letters.codeLines,[11]); assert.equal(letters.close1657View.freq1,null);
  const counts = problem.builder('aabbccc',{word2:'abbbccc'}).steps.at(-1);
  assert.equal(counts.close1657View.sameLetters,true);
  assert.deepEqual(counts.close1657View.freq1,[2,2,3]);
  assert.deepEqual(counts.close1657View.freq2,[1,3,3]);
  assert.equal(counts.close1657View.rank,0);
});

test('1657 validates both inputs and does not trim invalid whitespace', () => {
  for (const bad of ['',null,123,'A','a b',' a','a ','a\n','é','a'.repeat(101)]) {
    assert.throws(()=>problem.builder(bad,{word2:'a'}),/1657/);
    assert.throws(()=>problem.builder('a',{word2:bad}),/1657/);
    assert.throws(()=>problem.liveArgs('a',{word2:bad}),/1657/);
  }
  assert.throws(()=>problem.builder('a'),/1657/);
  assert.equal(problem.builder('a'.repeat(100),{word2:'a'.repeat(100)}).answer,true);
});

test('1657 displayed Python matches the repository and supports the original limit', () => {
  const repository = fs.readFileSync(require.resolve('../../Leetcode-sln/string/Leetcode_1657.py'),'utf8').replace(/\r\n/g,'\n');
  assert.equal(repository.split('\n\n\n')[0],problem.code.join('\n'));
  const checks = cases.map(([a,b,yes])=>`assert Solution().closeStrings(${JSON.stringify(a)}, ${JSON.stringify(b)}) is ${yes?'True':'False'}`).join('\n');
  const run = spawnSync('python',['-c',problem.code.join('\n')+'\n'+checks+"\nassert Solution().closeStrings('a' * 70000 + 'b' * 30000, 'a' * 30000 + 'b' * 70000) is True\n"],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
});

test('1657 renders both strings, repeated frequency pairs and verdicts in VI and EN', () => {
  const element = {innerHTML:''};
  const escapeHtml = value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const context = {lang:'en',$:()=>element,escapeHtml,pick:value=>value[context.lang]};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-close-strings-1657.js'),'utf8'),context);
  for (const language of ['en','vi']) {
    context.lang = language;
    for (const [word1,word2,yes] of cases) {
      for (const step of problem.builder(word1,{word2}).steps) {
        context.renderClose1657View(step);
        assert.doesNotMatch(element.innerHTML,/undefined|NaN|object Object/);
        assert.equal((element.innerHTML.match(/class="close1657-char[ "]/g)||[]).length,word1.length+word2.length);
        assert.equal((element.innerHTML.match(/class="close1657-pair[ "]/g)||[]).length,step.close1657View.freq1?.length||0);
      }
      assert.match(element.innerHTML,new RegExp(`>${yes?'True':'False'}</strong>`));
    }
  }
});

test('1657 integrates with catalog, frontend assets and renderer selection', () => {
  assert.equal(problem.category.key,'string');
  assert.ok(problem.tags.some(tag=>tag.key==='hashmap'));
  const source = fs.readFileSync(require.resolve('../public/script.js'),'utf8');
  const prefix = source.slice(0,source.indexOf('\nfunction ',source.indexOf('const ORDERED_RENDERER_REGISTRY')));
  const context = {renderClose1657View:step=>context.rendered=step};
  vm.createContext(context);
  vm.runInContext(prefix+'\nglobalThis.registry=ORDERED_RENDERER_REGISTRY;',context);
  const step = problem.builder('a',{word2:'a'}).steps[0];
  const entry = context.registry.find(entry=>entry.predicate(step));
  assert.equal(entry.surface,'treeView'); entry.render(step); assert.equal(context.rendered,step);
  const html = fs.readFileSync(require.resolve('../public/index.html'),'utf8');
  for (const asset of ['close-strings-1657.css','renderer-close-strings-1657.js']) assert.equal(html.split(asset+'?').length-1,1);
  assert.ok(html.includes('&bd=close-strings-1657-v1'));
});
