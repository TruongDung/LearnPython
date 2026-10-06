const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const {spawnSync} = require('node:child_process');
const problem = require('../problems').SUPPORTED[541];

function oracle(s,k) {
  const blocks=[];
  for(let start=0;start<s.length;start+=2*k) blocks.push([...s.slice(start,start+k)].reverse().join('')+s.slice(start+k,start+2*k));
  return blocks.join('');
}

test('541 matches examples and all remainder sizes around k and 2k', () => {
  assert.equal(problem.builder('abcdefg',{k:2}).answer,'bacdfeg');
  assert.equal(problem.builder('abcd',{k:2}).answer,'bacd');
  for(let n=1;n<=40;n++) {
    const s=Array.from({length:n},(_,i)=>String.fromCharCode(97+i%26)).join('');
    for(let k=1;k<=45;k++) {
      const result=problem.builder(s,{k});
      assert.equal(result.answer,oracle(s,k),`n=${n}, k=${k}`);
      assert.equal(result.answer.length,s.length);
      for(let i=0;i<s.length;i++) if(i%(2*k)>=k) assert.equal(result.answer[i],s[i]);
    }
  }
});

test('541 trace swaps only inside the first k characters and preserves snapshots', () => {
  const result=problem.builder('abcdefg',{k:2});
  const swaps=result.steps.filter(step=>step.reverseString541View.phase==='swap');
  assert.deepEqual(swaps.map(step=>[step.reverseString541View.left,step.reverseString541View.right]),[[0,1],[4,5]]);
  assert.deepEqual(swaps.map(step=>step.codeLines),[[8],[8]]);
  assert.equal(swaps[0].reverseString541View.chars.join(''),'bacdefg');
  assert.equal(swaps[1].reverseString541View.chars.join(''),'bacdfeg');
  assert.equal(result.steps[0].reverseString541View.chars.join(''),'abcdefg');
  assert.equal(result.steps.at(-1).final,true);
  assert.deepEqual(result.steps.at(-1).codeLines,[11]);
  assert.deepEqual(problem.liveArgs('abc',{k:5}),['abc',5]);
  assert.equal(problem.builder('abc',{k:1}).steps.some(step=>step.reverseString541View.phase==='swap'),false);
});

test('541 validates visual input limits and supports k larger than the string', () => {
  for(const s of ['', 'a'.repeat(81), 'ABC', 'ab c', 'abc\n', null]) assert.throws(()=>problem.builder(s,{k:2}),/541/);
  for(const k of [0,-1,1.5,10001,'2',undefined]) assert.throws(()=>problem.builder('abc',{k}),/541/);
  assert.equal(problem.builder('abc',{k:10000}).answer,'cba');
  const s='abcdefghijklmnopqrstuvwxyz'.repeat(3)+'ab';
  assert.equal(problem.builder(s,{k:10000}).answer,[...s].reverse().join(''));
});

test('541 displayed Python and repository solution match boundaries and original length limit', () => {
  const repository=fs.readFileSync(require.resolve('../../Leetcode-sln/string/Leetcode_541.py'),'utf8');
  assert.equal(repository.split('\n\n\n')[0],problem.code.join('\n'));
  const checks="\nassert Solution().reverseStr('abcdefg',2) == 'bacdfeg'\nassert Solution().reverseStr('abcd',2) == 'bacd'\nassert Solution().reverseStr('abc',1) == 'abc'\nassert Solution().reverseStr('abc',10000) == 'cba'\ns = 'abcd' * 2500\nassert Solution().reverseStr(s,10000) == s[::-1]\n";
  const run=spawnSync('python',['-c',problem.code.join('\n')+checks],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
});

test('541 renderer shows pointers, swaps and kept ranges in VI and EN', () => {
  const element={innerHTML:'',querySelector:()=>({querySelector:()=>null})};
  const context={lang:'en',$:()=>element,escapeHtml:String,pick:value=>value[context.lang]};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-reverse-string-ii-541.js'),'utf8'),context);
  for(const language of ['vi','en']) {
    context.lang=language;
    for(const [s,k] of [['abcdefg',2],['abc',1],['abc',5]]) {
      for(const step of problem.builder(s,{k}).steps) {
        context.renderReverseString541View(step);
        assert.doesNotMatch(element.innerHTML,/undefined|NaN/);
        if(step.reverseString541View.phase==='swap') assert.match(element.innerHTML,/swapped/);
      }
      assert.match(element.innerHTML,new RegExp(oracle(s,k)));
    }
  }
});
