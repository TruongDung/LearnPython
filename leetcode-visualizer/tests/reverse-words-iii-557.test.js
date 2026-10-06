const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[557];
const oracle=s=>s.split(' ').map(word=>[...word].reverse().join('')).join(' ');
const examples=[["Let's take LeetCode contest","s'teL ekat edoCteeL tsetnoc"],['Mr Ding','rM gniD']];

test('557 reverses each word and preserves whitespace, order and punctuation',()=>{
  for(const [s,answer] of examples)assert.equal(problem.builder(s).answer,answer);
  for(const s of ['a','abcd','ab cd ef','abc defg h','  Ab  Cd! ','a   b','<ab> "Cd" &!',Array.from({length:80},(_,i)=>String.fromCharCode(33+i%94)).join('')]){
    const result=problem.builder(s);
    assert.equal(result.answer,oracle(s));
    assert.equal(result.answer.length,s.length);
    assert.deepEqual(problem.liveArgs(s),[s]);
    for(const step of result.steps)for(let i=0;i<s.length;i++)if(s[i]===' ')assert.equal(step.reverseWords557View.chars[i],' ');
    assert.equal(result.steps.at(-1).reverseWords557View.completedWords,s.split(' ').filter(Boolean).length);
    assert.equal(result.steps.at(-1).final,true);
  }
});

test('557 stops swaps at word boundaries and processes the final word without a trailing space',()=>{
  const result=problem.builder('ab cd');
  const swaps=result.steps.filter(step=>step.reverseWords557View.phase==='swap');
  assert.deepEqual(swaps.map(step=>[step.reverseWords557View.left,step.reverseWords557View.right]),[[0,1],[3,4]]);
  assert.deepEqual(swaps.map(step=>step.codeLines),[[9],[9]]);
  assert.equal(swaps[0].reverseWords557View.chars.join(''),'ba cd');
  assert.equal(swaps[1].reverseWords557View.chars.join(''),'ba dc');
  assert.ok(result.steps.some(step=>step.reverseWords557View.end===5 && step.reverseWords557View.wordRange?.end===4));
  assert.equal(result.steps[0].reverseWords557View.chars.join(''),'ab cd');
  assert.deepEqual(result.steps.at(-1).codeLines,[13]);
});

test('557 rejects nonprintable and oversized inputs',()=>{
  for(const input of ['', '   ', 'a'.repeat(81), 'abc\n','a\tb','é',null])assert.throws(()=>problem.builder(input),/557/);
});

test('557 displayed and repository Python preserve spaces and support the original length limit',()=>{
  const repository=fs.readFileSync(require.resolve('../../Leetcode-sln/string/Leetcode_557.py'),'utf8');
  assert.equal(repository.split('\n\n\n')[0],problem.code.join('\n'));
  const assertions=[...examples,['  Ab  Cd! ','  bA  !dC ']].map(([s,answer])=>`assert Solution().reverseWords(${JSON.stringify(s)}) == ${JSON.stringify(answer)}`).join('\n');
  const run=spawnSync('python',['-c',problem.code.join('\n')+'\n'+assertions+"\ns = 'ab ' * 16666 + 'cd'\nassert len(s) == 50000\nassert Solution().reverseWords(s) == 'ba ' * 16666 + 'dc'\n"],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
});

test('557 renderer safely shows ASCII punctuation and word states in VI and EN',()=>{
  const element={innerHTML:'',querySelector:()=>({querySelector:()=>null})};
  const escapeHtml=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const context={lang:'en',$:()=>element,escapeHtml,pick:value=>value[context.lang]};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-reverse-words-iii-557.js'),'utf8'),context);
  for(const language of ['vi','en']){
    context.lang=language;
    for(const s of ['Mr Ding','  a b ', '<B> "Cd" &!']){
      for(const step of problem.builder(s).steps){
        context.renderReverseWords557View(step);
        assert.doesNotMatch(element.innerHTML,/undefined|NaN|<B>|<script/);
        assert.match(element.innerHTML,/rw557-viz/);
      }
      assert.match(element.innerHTML,/completed/);
    }
  }
});
