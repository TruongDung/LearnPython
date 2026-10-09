const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[1750];
const cases = [['ca',2],['cabaabac',0],['aabccabba',3],['a',1],['aa',0],['aaa',0],['abca',2],['abcba',1],['aabaaa',1]];
const cache = new Map();
// Explore every allowed nonoverlapping prefix/suffix pair, not just maximal runs.
function oracle(s) {
  if (cache.has(s)) return cache.get(s);
  let best = s.length;
  for (let left = 1; left < s.length; left++) {
    if (![...s.slice(0,left)].every(ch=>ch===s[0])) break;
    for (let right = 1; left + right <= s.length; right++) {
      if (![...s.slice(-right)].every(ch=>ch===s[0])) break;
      best = Math.min(best,oracle(s.slice(left,s.length-right)));
    }
  }
  cache.set(s,best); return best;
}
test('1750 agrees with exhaustive deletion choices for short strings', () => {
  for (const [s,answer] of cases) assert.equal(problem.builder(s).answer,answer);
  for (let length=1; length<=7; length++) for(let value=0;value<3**length;value++) {
    let x=value; const s=Array.from({length},()=>{const ch='abc'[x%3];x=Math.floor(x/3);return ch;}).join('');
    assert.equal(problem.builder(s).answer,oracle(s),s);
  }
});
test('1750 rounds never overlap and snapshots preserve original indices', () => {
  for (const [s] of cases) {
    const result = problem.builder(s);
    for(const step of result.steps) {
      const v=step.similarEnds1750View;
      assert.equal(v.remaining,Math.max(0,v.right-v.left+1)); assert.equal(v.remainingPreview,s.slice(v.left,v.right+1));
      assert.ok(step.codeLines.every(line=>line>=1&&line<=problem.code.length));
      for(const item of v.history) { assert.ok(item.leftCount>0);assert.ok(item.rightCount>0); }
      for(const cell of v.cells) assert.equal(cell.char,s[cell.index]);
    }
    assert.equal(result.steps[0].similarEnds1750View.left,0);assert.equal(result.steps[0].similarEnds1750View.right,s.length-1);
    assert.equal(result.steps.at(-1).final,true); assert.equal(result.steps.at(-1).similarEnds1750View.answer,result.answer);
    assert.deepEqual(problem.liveArgs(s),[s]);
  }
});
test('1750 supports 100000 letters with bounded trace snapshots', () => {
  for(const s of ['a'.repeat(100000),'ab'.repeat(25000)+'ba'.repeat(25000)]) {
    const result=problem.builder(s);assert.equal(result.answer,0);assert.ok(result.steps.length<=1001);
    assert.ok(result.steps.at(-1).similarEnds1750View.omitted>0);assert.ok(JSON.stringify(result).length<4000000);
  }
  for(const s of ['', 'abcd','A','a b', 'a'.repeat(100001),null,1750]) assert.throws(()=>problem.builder(s),/1750/);
});
test('1750 Python and both renderer languages match all edge cases', () => {
  const source=fs.readFileSync(require.resolve('../../Leetcode-sln/two-pointer/Leetcode_1750.py'),'utf8').replace(/\r\n/g,'\n').trimEnd(); assert.equal(source,problem.code.join('\n'));
  const run=spawnSync('python3',['-c',source+'\n'+cases.map(([s,answer])=>`assert Solution().minimumLength(${JSON.stringify(s)}) == ${answer}`).join('\n')+"\nassert Solution().minimumLength('a'*100000) == 0"],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);
  const element={innerHTML:''},context={lang:'vi',$:()=>element,escapeHtml:value=>String(value).replace(/</g,'&lt;'),pick:value=>value[context.lang]};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-minimum-length-1750.js'),'utf8'),context);
  for(const language of ['vi','en']) { context.lang=language; for(const [s] of cases) for(const step of problem.builder(s).steps) { context.renderSimilarEnds1750View(step);assert.doesNotMatch(element.innerHTML,/undefined|NaN|object Object/); } }
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');assert.match(html,/renderer-minimum-length-1750.js/);
});
