const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const problem = require('../problems').SUPPORTED[730];
const source = fs.readFileSync(require.resolve('../public/renderer-count-different-palindromic-subsequences-730.js'), 'utf8');

function oracle(s) {
  const result = new Set();
  for(let mask=1;mask<2**s.length;mask++) {
    const text=[...s].filter((_,i)=>mask&(1<<i)).join('');
    if(text===[...text].reverse().join(''))result.add(text);
  }
  return result;
}
function renderer(width=550) {
  const host={innerHTML:'',clientWidth:width};
  const context={lang:'vi',$:()=>host};
  vm.createContext(context); vm.runInContext(source,context);
  return {host,context};
}

test('730 picture groups explain all four recurrences with exactly the distinct strings',()=>{
  const {context}=renderer();
  const branches=new Set();
  for(const s of ['a','abcd','bccb','aaa','aaaa','aacaa','abcbac']) {
    const run=problem.builder(s);
    assert.equal(run.answer,oracle(s).size);
    for(const step of run.steps) {
      const model=context.cps730PictureModel(step);
      if(!model.groups.length)continue;
      branches.add(model.kind);
      const expected=oracle(s.slice(model.i,model.j+1));
      const shown=new Set(model.groups.flatMap(group=>group.values.filter(text=>!group.crossed?.includes(text))));
      assert.deepEqual(shown,expected);
      const [a,operator,b,op,c]=model.arithmetic;
      assert.equal(operator,'+');
      assert.equal(a+b+(op==='−'?-c:c),expected.size);
      if(model.value!==null)assert.equal(model.value,expected.size);
    }
  }
  assert.deepEqual(branches,new Set(['unequal','zero','one','multiple']));
});

test('730 bccb ends with six distinct palindromes and a noncontiguous bcb example',()=>{
  const {host,context}=renderer();
  const step=problem.builder('bccb').steps.at(-1);
  context.renderCountPalindromicSubsequences730View(step);
  const model=context.cps730PictureModel(step);
  assert.equal(model.value,6);
  assert.deepEqual(new Set(model.evidence.entries.map(e=>e.palindrome)),new Set(['b','bb','bcb','bccb','c','cc']));
  const selected=model.evidence.entries.find(e=>e.palindrome==='bcb');
  assert.equal(selected.indexTuple.map(i=>'bccb'[i]).join(''),'bcb');
  host._pal730Selection='bcb';
  context.renderCountPalindromicSubsequences730View(step);
  assert.equal((host.innerHTML.match(/pal730-letter chosen/g)||[]).length,3);
  assert.match(host.innerHTML,/pal730-link/);
  assert.match(host.innerHTML,/aria-pressed="true"/);
});

test('730 pictures preserve snapshots, hide unwritten cells, and bound output',()=>{
  const {host,context}=renderer(260);
  for(const s of ['a','bccb','aacaa','abcdabcdab']) {
    const run=problem.builder(s);
    const snapshot=JSON.stringify(run);
    for(const language of ['en','vi']) for(const step of run.steps) {
      context.lang=language;
      context.renderCountPalindromicSubsequences730View(step);
      assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);
      assert.ok((host.innerHTML.match(/data-pal730-word=/g)||[]).length<=12);
      assert.match(host.innerHTML,/<svg/);
      if(!step.countPalindromicSubsequences730View.activeEvidence&&!step.final) {
        assert.doesNotMatch(host.innerHTML,/data-pal730-word=/);
      }
    }
    assert.equal(JSON.stringify(run),snapshot);
  }
});
