'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[1224];
const cases=[[2,2,1,1,5,3,3,5],[1,1,1,2,2,2,3,3,3,4,4,4,5],[1,1,2,2],[1,1,2,2,3,3,3],[1,2,3,4],[4,4,4,4],[100000],[1,1,1,1,2,2,2,3],Array(20).fill(5),Array.from({length:20},(_,i)=>100000-i)];
function removals(nums){return [...new Set(nums)].filter(value=>{const counts=new Map();let removed=false;for(const x of nums){if(x===value&&!removed){removed=true;continue;}counts.set(x,(counts.get(x)||0)+1);}return new Set(counts.values()).size<=1;});}
function oracle(nums){let answer=0;for(let length=1;length<=nums.length;length++)if(removals(nums.slice(0,length)).length)answer=length;return answer;}

test('1224 matches exhaustive deletion of exactly one occurrence, including equal columns and empty remainders',()=>{
  for(const nums of cases)assert.equal(p.builder(nums).answer,oracle(nums));
  function enumerate(prefix,depth){if(prefix.length)assert.equal(p.builder(prefix).answer,oracle(prefix),String(prefix));if(!depth)return;for(let value=1;value<=3;value++)enumerate([...prefix,value],depth-1);}
  enumerate([],6);
  assert.equal(p.builder(cases[0]).answer,7);assert.equal(p.builder(cases[1]).answer,13);assert.equal(p.builder([1,1,2,2]).answer,3);assert.equal(p.builder([100000]).answer,1);
});

test('1224 every Counter, loop, condition and answer line and local matches CPython',()=>{
  const python=`import sys,json
payload=json.load(sys.stdin)
ns={}
exec(compile(payload['source'],'<frequency1224>','exec'),ns)
output=[]
for nums in payload['cases']:
    rows=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_name!='maxEqualFreq':return None
        if event in ('line','return'):
            if frame in pending:rows.append(json.loads(json.dumps({'line':pending[frame],'locals':{key:value for key,value in frame.f_locals.items() if key!='self'}})))
            if event=='line':pending[frame]=frame.f_lineno
            else:pending.pop(frame,None)
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().maxEqualFreq(nums)
    sys.settrace(None)
    output.append({'answer':answer,'rows':rows})
print(json.dumps(output))`;
  const reference=spawnSync(process.env.PYTHON||'python3',['-c',python],{input:JSON.stringify({source:p.code.join('\n'),cases}),encoding:'utf8',maxBuffer:8e6});assert.equal(reference.status,0,reference.stderr);
  JSON.parse(reference.stdout).forEach((expected,index)=>{const actual=p.builder(cases[index]);assert.equal(actual.answer,expected.answer);assert.deepEqual(actual.steps.map(step=>({line:step.codeLines[0],locals:step.equalFreq1224View.locals})),expected.rows,`case ${index}`);});
});

test('1224 moves one column between buckets before testing shapes and commits a valid prefix only on answer assignment',()=>{
  for(const nums of cases){const run=p.builder(nums);let expectedAnswer=0;
    for(const step of run.steps){const v=step.equalFreq1224View;
      assert.deepEqual(step.codeLines,[v.line]);assert.equal(v.source,p.code[v.line-1].trim());
      if(v.line===22)expectedAnswer=v.length;assert.equal(v.answer??0,expectedAnswer);
      if([10,11,12,13,14,15,16].includes(v.line)&&v.phase!=='end')assert.deepEqual(v.checks,{once:null,single:null,tallest:null});
      if(v.line===15){const expected=new Map();for(const item of v.counts)expected.set(item.amount,(expected.get(item.amount)||0)+1);for(const item of v.frequencies)assert.equal(item.amount,expected.get(item.frequency)||0);assert.equal(v.counts.reduce((sum,item)=>sum+item.amount,0),v.length);}
      if(v.line===16)assert.equal(v.maxFreq,Math.max(...v.counts.map(item=>item.amount)));
      if(v.change?.added!==undefined)assert.equal(v.change.after,v.change.before+v.change.added);
      if(v.line===21){const record=v.history.at(-1),validRemovals=removals(nums.slice(0,v.length));assert.equal(record.valid,validRemovals.length>0);assert.equal(record.counted,false);if(record.valid)assert.ok(validRemovals.includes(record.remove));else assert.equal(record.remove,null);}
    }
    assert.equal(run.steps.at(-1).equalFreq1224View.history.length,nums.length);assert.equal(run.steps.filter(step=>step.final).length,1);
  }
});

test('1224 all three pictures have witnesses and zero-frequency Counter entries remain visible',()=>{
  const run=p.builder(cases[0]),best=run.steps.find(step=>step.equalFreq1224View.line===22&&step.equalFreq1224View.length===7).equalFreq1224View;
  assert.deepEqual(best.checks,{once:false,single:true,tallest:false});assert.equal(best.history.at(-1).remove,5);
  const tall=p.builder([1,1,2,2,3,3,3]).steps.findLast(step=>step.equalFreq1224View.line===21).equalFreq1224View;
  assert.equal(tall.checks.tallest,true);assert.equal(tall.history.at(-1).remove,3);
  assert.equal(p.builder([1,2,3]).steps.findLast(step=>step.equalFreq1224View.line===21).equalFreq1224View.checks.once,true);
  assert.ok(p.builder([8,8]).steps.at(-1).equalFreq1224View.frequencies.some(item=>item.frequency===1&&item.amount===0));
});

test('1224 VI/EN pictures show all occurrences, one deletion and the source line without mutating captures',()=>{
  const host={innerHTML:'',querySelectorAll:()=>[]},ctx={lang:'vi',$:()=>host,steps:[],stepIndex:0,escapeHtml:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-maximum-equal-frequency-1224.js'),'utf8'),ctx);
  for(const nums of cases){ctx.steps=p.builder(nums).steps;const saved=JSON.stringify(ctx.steps);for(const lang of ['vi','en']){ctx.lang=lang;ctx.steps.forEach((step,index)=>{ctx.stepIndex=index;ctx.renderEqualFreq1224View(step);const v=step.equalFreq1224View;assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);assert.match(host.innerHTML,new RegExp(`data-source-line="${v.line}"`));assert.equal((host.innerHTML.match(/data-ef1224-prefix=/g)||[]).length,nums.length);assert.equal((host.innerHTML.match(/data-ef1224-remove=/g)||[]).length,v.counts.length);if(v.history.some(item=>item.length===v.length))assert.equal((host.innerHTML.match(/filled cut/g)||[]).length,1);});}assert.equal(JSON.stringify(ctx.steps),saved);}
});

test('1224 parser rejects invalid visual data and supplies full-size live Python arguments',()=>{
  for(const input of ['',[],[0],[-1],[1.5],[100001],[NaN],[true],['1'],new Array(2),'1,,2','wat','[1,',Array(21).fill(1)])assert.throws(()=>p.builder(input),/1224/);
  assert.equal(p.builder('[2,2,1,1,5,3,3,5]').answer,7);assert.deepEqual(p.liveArgs('1,2,3'),[[1,2,3]]);assert.equal(p.liveArgs(Array(100000).fill(100000))[0].length,100000);
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/renderer-maximum-equal-frequency-1224|maximum-equal-frequency-1224\.css/);assert.match(html,/trie-picture-ui\.js[^>]+data-problem-ids="[^"]*1224/);
});
