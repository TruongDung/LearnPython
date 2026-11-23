'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), { spawnSync } = require('node:child_process');
const p = require('../problems').SUPPORTED[2832];
const cases = [[1,5,4,3,6], [1,2,3,4,5], [5,4,3,2,1], [5,1,4,2,3], [42], [100000,1], [1,100000], [3,1,5,2,4], Array.from({length:14}, (_,i) => 14-i), [9,2,13,4,11,1,7,14,8,3,12,5,10,6]];
function oracle(nums) {
  return nums.map(value => {
    let answer = 0;
    for (let l = 0; l < nums.length; l++) {
      let max = -Infinity;
      for (let r = l; r < nums.length; r++) { max = Math.max(max, nums[r]); if (max === value) answer = Math.max(answer, r-l+1); }
    }
    return answer;
  });
}

test('2832 matches all subarrays for all permutations up to six values and boundary examples', () => {
  for (const nums of cases) assert.deepEqual(p.builder(nums).answer, oracle(nums));
  function permute(prefix, remaining) {
    if (!remaining.length) { assert.deepEqual(p.builder(prefix).answer, oracle(prefix), String(prefix)); return; }
    remaining.forEach((x,index) => permute([...prefix,x], remaining.filter((_,i) => i!==index)));
  }
  for (let n=1;n<=6;n++) permute([], Array.from({length:n},(_,i)=>i+1));
  assert.deepEqual(p.builder(cases[0]).answer,[1,4,2,1,5]);
});

test('2832 every executed statement and post-statement local matches CPython, including while/for exhaustion and infinity', () => {
  const python = `import sys,json,math
payload=json.load(sys.stdin)
ns={}
exec(compile(payload['source'],'<range2832>','exec'),ns)
def clean(x):
    if isinstance(x,float) and math.isinf(x):return '∞'
    if isinstance(x,list):return [clean(v) for v in x]
    if isinstance(x,dict):return {k:clean(v) for k,v in x.items()}
    return x
output=[]
for nums in payload['cases']:
    rows=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_name!='maximumLengthOfRanges':return None
        if event in ('line','return'):
            if frame in pending:rows.append(clean({'line':pending[frame],'locals':{k:v for k,v in frame.f_locals.items() if k!='self'}}))
            if event=='line':pending[frame]=frame.f_lineno
            else:pending.pop(frame,None)
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().maximumLengthOfRanges(nums)
    sys.settrace(None)
    output.append({'answer':answer,'rows':rows})
print(json.dumps(output))`;
  const reference = spawnSync(process.env.PYTHON || 'python3', ['-c', python], { input:JSON.stringify({source:p.code.join('\n'),cases}),encoding:'utf8',maxBuffer:8e6 });
  assert.equal(reference.status,0,reference.stderr);
  JSON.parse(reference.stdout).forEach((expected,index) => { const actual=p.builder(cases[index]); assert.deepEqual(actual.answer,expected.answer); assert.deepEqual(actual.steps.map(step=>({line:step.codeLines[0],locals:step.range2832View.locals})),expected.rows,`case ${index}`); });
});

test('2832 each pop exposes its right barrier, then left barrier, then commits the range on its assignment line', () => {
  for (const nums of cases) {
    const run=p.builder(nums), resolved=new Set();
    for (const step of run.steps) {
      const v=step.range2832View;
      assert.deepEqual(step.codeLines,[v.line]); assert.equal(v.source,p.code[v.line-1].trim());
      for(let j=1;j<v.stack.length;j++) assert.ok(nums[v.stack[j-1]]>nums[v.stack[j]]);
      if(v.line===13) { assert.equal(v.pop.left,null); assert.equal(v.pop.assigned,false); assert.ok(!v.stack.includes(v.pop.mid)); assert.equal(v.ranges[v.pop.mid],null); }
      if(v.line===14) { assert.equal(v.pop.left,v.stack.at(-1)??-1); assert.equal(v.ranges[v.pop.mid],null); }
      if(v.line===15) {
        const range=v.ranges[v.pop.mid]; assert.ok(!resolved.has(range.mid)); resolved.add(range.mid);
        assert.equal(range.length,range.right-range.left-1); assert.equal(v.ans[range.mid],range.length);
        for(let j=range.left+1;j<range.right;j++) assert.ok(nums[j]<=nums[range.mid]);
        if(range.left>=0) assert.ok(nums[range.left]>nums[range.mid]);
        if(range.right<nums.length) assert.ok(nums[range.right]>nums[range.mid]);
      }
      assert.equal(v.ranges.filter(Boolean).length,resolved.size);
      if(v.phase==='end') assert.equal(v.i,nums.length);
    }
    assert.equal(resolved.size,nums.length); assert.equal(run.steps.filter(step=>step.final).length,1);
    assert.deepEqual(run.steps.at(-1).range2832View.stack,[]);
    assert.equal(run.steps.filter(step=>step.range2832View.line===17).length,nums.length);
  }
});

test('2832 VI/EN renderer draws every bar, stack entry, answer and actual source line without mutating trace', () => {
  const host={innerHTML:'',querySelectorAll:()=>[]},ctx={lang:'vi',$:()=>host,steps:[],stepIndex:0,escapeHtml:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-maximum-ranges-2832.js'),'utf8'),ctx);
  for(const nums of cases) {
    ctx.steps=p.builder(nums).steps;const saved=JSON.stringify(ctx.steps);
    for(const language of ['vi','en']) { ctx.lang=language;ctx.steps.forEach((step,index)=>{
      ctx.stepIndex=index;ctx.renderMaximumRanges2832View(step);const v=step.range2832View;
      assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);
      assert.match(host.innerHTML,new RegExp(`data-source-line="${v.line}"`));
      assert.equal((host.innerHTML.match(/data-range2832-bar=/g)||[]).length,nums.length);
      assert.equal((host.innerHTML.match(/data-range2832-inspect=/g)||[]).length,nums.length);
      assert.equal((host.innerHTML.match(/class="range2832-chip/g)||[]).length,v.stack.length);
      if(v.line===15) assert.match(host.innerHTML,new RegExp(`\\[${v.pop.left+1}…${v.pop.right-1}\\]`));
      if(v.i===nums.length) assert.match(host.innerHTML,/\+∞/);
    }); }
    assert.equal(JSON.stringify(ctx.steps),saved);
  }
});

test('2832 rejects duplicates, malformed input and unsupported visual lengths; live arguments support full constraints', () => {
  for(const input of ['',[],[0],[-1],[1.5],[100001],[NaN],[Infinity],[true],['1'],new Array(2),[3,3],'1,,2','1,','[1,','wat',Array.from({length:15},(_,i)=>i+1)]) assert.throws(()=>p.builder(input),/2832/);
  assert.deepEqual(p.builder('[1,5,4,3,6]').answer,[1,4,2,1,5]);assert.deepEqual(p.liveArgs('3,1,2'),[[3,1,2]]);
  assert.equal(p.liveArgs(Array.from({length:100000},(_,i)=>i+1))[0].length,100000);
  assert.throws(()=>p.liveArgs([5,5]),/2832/);
});

test('2832 loads only its own picture assets and opts into independent light/dark code themes', () => {
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/renderer-maximum-ranges-2832|maximum-ranges-2832\.css/);
  assert.match(html,/trie-picture-ui\.js[^>]+data-problem-ids="[^"]*2832/);
  assert.match(html,/maximum-ranges-2832\.css/);assert.match(html,/renderer-maximum-ranges-2832\.js/);
  assert.match(fs.readFileSync(require.resolve('../public/trie-picture-ui.js'),'utf8'),/2354,2832,3045/);
  assert.equal(p.debugMode,'line-by-line');
});
