const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const { SUPPORTED, PREFIX_MAX_SUBTABS } = require('../problems');
const p = SUPPORTED[3867];
const cases = [[3,6,2,8],[2,6,4],[4,4,4,4],[7],[1,2],[6,10,15,3,9],[1000000000,999999999]];
// Independent small-input oracle: enumerate all possible common divisors.
function divisorGcd(a,b){for(let d=Math.min(a,b);d>0;d--)if(a%d===0&&b%d===0)return d;}
function brute(nums){const prefix=nums.map((x,i)=>divisorGcd(x,Math.max(...nums.slice(0,i+1)))).sort((a,b)=>a-b);let result=0;for(let i=0;i<Math.floor(prefix.length/2);i++)result+=divisorGcd(prefix[i],prefix[prefix.length-1-i]);return result;}
test('3867 matches official examples, duplicate values and an independent exhaustive divisor oracle',()=>{
  assert.equal(p.debugMode,'line-by-line');assert.equal(p.slug,'sum-of-gcd-of-formed-pairs');
  assert.equal(p.builder([3,6,2,8]).answer,5);assert.equal(p.builder([2,6,4]).answer,2);
  assert.equal(p.builder([4,4,4,4]).answer,8);assert.equal(p.builder([7]).answer,0);
  for(let n=1;n<=5;n++)for(let mask=0;mask<3**n;mask++){const nums=Array.from({length:n},(_,i)=>[2,3,6][Math.floor(mask/3**i)%3]);assert.equal(p.builder(nums).answer,brute(nums));}
  let seed=3867;const rand=n=>{seed=(seed*1664525+1013904223)>>>0;return seed%n;};
  for(let i=0;i<100;i++){const nums=Array.from({length:1+rand(16)},()=>1+rand(25));assert.equal(p.builder(nums).answer,brute(nums));}
  assert.ok(p.tags.some(t=>t.key==='prefix-max'));assert.ok(PREFIX_MAX_SUBTABS.find(t=>t.key==='core').roster.find(r=>r.id===3867).available);
});
test('3867 every executed statement and all locals agree with CPython, including stale g and separate pointer assignments',()=>{
  const python=`import sys,json
data=json.load(sys.stdin)
ns={}
exec(compile(data['code'],'<lesson>','exec'),ns)
def encode(value):
    if isinstance(value,list): return list(value)
    if isinstance(value,(int,str,bool)) or value is None: return value
    return vars(value)
out=[]
for nums in data['cases']:
    pending,events={},[]
    def trace(frame,event,arg):
        if frame.f_code.co_filename!='<lesson>' or frame.f_code.co_name!='gcdSum': return trace
        if event in ('line','return'):
            if frame in pending: events.append({'line':pending.pop(frame),'locals':{key:encode(value) for key,value in frame.f_locals.items()}})
            if event=='line': pending[frame]=frame.f_lineno
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().gcdSum(nums)
    sys.settrace(None)
    out.append({'answer':answer,'events':events})
print(json.dumps(out))`;
  const run=spawnSync('python',['-c',python],{input:JSON.stringify({code:p.code.join('\n'),cases}),encoding:'utf8'});assert.equal(run.status,0,run.stderr);
  JSON.parse(run.stdout).forEach((expected,i)=>{const actual=p.builder(cases[i]);assert.equal(actual.answer,expected.answer);assert.deepEqual(actual.steps.map(s=>({line:s.codeLines[0],locals:Object.fromEntries(s.vars.map(v=>[v.name,v.rawValue]))})),expected.events);assert.equal(actual.steps.filter(s=>s.final).length,1);assert.equal(actual.steps.at(-1).codeLines[0],19);});
});
test('3867 snapshots wait for append and addition, preserve sort provenance and ignore the odd middle exactly once',()=>{
  const nums=[2,6,4],run=p.builder(nums);assert.deepEqual(nums,[2,6,4]);
  for(let i=0;i<run.steps.length;i++){
    const s=run.steps[i],v=s.gcd3867View,prev=run.steps[i-1]?.gcd3867View;
    if(v.line===9){assert.equal(v.built.length,v.i);assert.equal(v.maxima.length,v.i+1);}
    if(v.line===10)assert.equal(v.built.length,v.i+1);
    if(v.line===15){assert.equal(v.answer,prev.answer);assert.equal(v.pair.counted,false);assert.equal(v.pairCount,prev.pairCount);}
    if(v.line===16){assert.equal(v.answer,prev.answer+v.pair.g);assert.equal(v.pair.counted,true);assert.equal(v.left,prev.left);assert.equal(v.right,prev.right);}
    if(v.line===17){assert.equal(v.left,prev.left+1);assert.equal(v.right,prev.right);}
    if(v.line===18){assert.equal(v.left,prev.left);assert.equal(v.right,prev.right-1);}
  }
  const sort=run.steps.find(s=>s.codeLines[0]===11).gcd3867View;
  assert.deepEqual(sort.built,[2,6,2]);assert.deepEqual(sort.sorted.map(x=>x.value),[2,2,6]);assert.deepEqual(sort.sortOrder.map(x=>x.from),[0,2,1]);
  const final=run.steps.at(-1).gcd3867View;assert.equal(final.pairCount,1);assert.deepEqual(final.middle,{index:1,value:2});assert.deepEqual(final.pairs.map(p=>[p.left,p.right]),[[0,2]]);
  assert.equal(p.builder([7]).steps.at(-1).gcd3867View.pairCount,0);
});
test('3867 validates constraints and fully solves large arrays with bounded, explicit previews',()=>{
  for(const a of [[],null,'2,6,4',[0],[-1],[1.5],[1000000001],[true],Array(100001).fill(1)])assert.throws(()=>p.builder(a));
  assert.deepEqual(p.liveArgs([3,6,2,8]),[[3,6,2,8]]);
  const run=p.builder(Array(100000).fill(1000000000));assert.equal(run.answer,50000000000000);assert.equal(run.steps.length,1);
  const step=run.steps[0],v=step.gcd3867View;assert.equal(v.mode,'summary');assert.deepEqual(step.vars,[]);assert.deepEqual(step.codeLines,[]);assert.equal(v.nums.length,12);assert.equal(v.built.length,12);assert.equal(v.sorted.length,12);assert.equal(v.pairs.length,6);assert.equal(v.pairCount,50000);assert.equal(v.middle,null);
  assert.deepEqual(v.sorted.map(x=>x.index),[0,1,2,3,4,5,99994,99995,99996,99997,99998,99999]);
  const odd=p.builder(Array(99999).fill(1000000000));assert.equal(odd.answer,49999000000000);assert.deepEqual(odd.steps[0].gcd3867View.middle,{index:49999,value:1000000000});
});
function renderer(){
  const handlers={},input={value:''};
  const host={innerHTML:'',querySelector(s){return{clientWidth:550,focus(){},addEventListener:(e,fn)=>{handlers[s+':'+e]=fn;}};},querySelectorAll(s){const attr=s==='[data-g3867-pair]'?'pair':s==='[data-g3867-stage]'?'stage':'example';return [...this.innerHTML.matchAll(new RegExp(`data-g3867-${attr}="(\\d+)"`,'g'))].map(m=>({dataset:{[attr==='pair'?'g3867Pair':attr==='stage'?'g3867Stage':'g3867Example']:m[1]},addEventListener:(e,fn)=>{handlers[s+m[1]+':'+e]=fn;}}));}};
  const ctx={lang:'vi',$:id=>id==='arrInput'?input:host,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),steps:[],stepIndex:0,stopPlay(){},renderStep(){},runViz(){}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-gcd-pairs-3867.js'),'utf8'),ctx);return{ctx,host,handlers,input};
}
test('3867 renders all frames in both languages; stage buttons, pair replay and examples work',()=>{
  const {ctx,host,handlers,input}=renderer();
  for(const lang of ['vi','en'])for(const nums of cases){ctx.lang=lang;for(const step of p.builder(nums).steps){ctx.renderGcd3867View(step);assert.match(host.innerHTML,/g3867-diagram/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);}}
  const run=p.builder([3,6,2,8]);ctx.lang='en';ctx.steps=run.steps;ctx.stepIndex=0;ctx.renderGcd3867View(run.steps[0]);handlers['[data-g3867-next]:click']();assert.equal(run.steps[ctx.stepIndex].gcd3867View.line,10);
  ctx.stepIndex=run.steps.findLastIndex(s=>s.gcd3867View.line===10);ctx.renderGcd3867View(run.steps[ctx.stepIndex]);handlers['[data-g3867-next]:click']();assert.equal(run.steps[ctx.stepIndex].gcd3867View.line,11);
  handlers['[data-g3867-stage]2:click']();assert.equal(run.steps[ctx.stepIndex].gcd3867View.line,13);
  handlers['[data-g3867-result]:click']();assert.equal(ctx.stepIndex,run.steps.length-1);ctx.renderGcd3867View(run.steps.at(-1));
  handlers['[data-g3867-pair]1:click']();assert.match(host.innerHTML,/gcd\(3, 6\) = 3/);assert.match(host.innerHTML,/2 \+ 3 = 5/);assert.match(host.innerHTML,/Pair replay/);
  handlers['[data-g3867-example]1:click']();assert.equal(input.value,'2,6,4');ctx.renderGcd3867View(p.builder([2,6,4]).steps.at(-1));assert.match(host.innerHTML,/Ignore middle element/);
  ctx.renderGcd3867View(p.builder([7]).steps.at(-1));assert.match(host.innerHTML,/0 pairs/);assert.match(host.innerHTML,/Ignore middle element/);
  ctx.renderGcd3867View(p.builder(Array(31).fill(4)).steps[0]);assert.match(host.innerHTML,/Computed all/);assert.match(host.innerHTML,/pairs computed in full/);assert.doesNotMatch(host.innerHTML,/data-g3867-stage=/);
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');assert.match(html,/gcd-pairs-3867.css[^>]*data-problem-ids="3867"/);assert.match(html,/renderer-gcd-pairs-3867.js[^>]*data-problem-ids="3867"/);
});
test('3867 displayed Python executes in the actual editable-code runner',()=>{
  const source=fs.readFileSync(require.resolve('../public/live-editor.js'),'utf8'),tracer=vm.runInNewContext(source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1]);
  const python=tracer+`\nimport sys,json\ndata=json.load(sys.stdin)\nprint(json.dumps([__viz_run_trace(data['code'],'gcdSum',[a])['result'] for a in data['cases']]))`;
  const run=spawnSync('python',['-c',python],{input:JSON.stringify({code:p.code.join('\n'),cases}),encoding:'utf8'});assert.equal(run.status,0,run.stderr);assert.deepEqual(JSON.parse(run.stdout),cases.map(a=>p.builder(a).answer));
});
test('3867 metadata, solve, editor arguments, Prefix Max catalog and lazy assets work through HTTP',async()=>{
  const port=await new Promise((resolve,reject)=>{const probe=require('node:net').createServer();probe.on('error',reject);probe.listen(0,()=>{const n=probe.address().port;probe.close(e=>e?reject(e):resolve(n));});});
  const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:String(port)},stdio:'pipe'}),url=`http://localhost:${port}`;let logs='';server.stderr.on('data',d=>logs+=d);
  try{
    let ready=false;for(let i=0;i<100;i++){if(server.exitCode!==null)throw new Error(logs);try{ready=(await fetch(url+'/api/problem/3867')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,50));}assert.ok(ready,logs);
    const meta=await(await fetch(url+'/api/problem/3867')).json();assert.deepEqual(meta.code,p.code);assert.equal(meta.debugMode,'line-by-line');
    for(const suffix of ['solve','live-args']){const res=await fetch(url+'/api/problem/3867/'+suffix,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:[3,6,2,8]})});assert.equal(res.status,200);const data=await res.json();if(suffix==='solve'){assert.equal(data.answer,5);assert.ok(data.steps.every(s=>s.gcd3867View));}else assert.deepEqual(data.args,[[3,6,2,8]]);}
    const {groups}=await(await fetch(url+'/api/problems')).json();assert.ok(groups.find(g=>g.key==='prefix-max').problems.some(q=>q.id===3867));
    for(const file of ['renderer-gcd-pairs-3867.js','gcd-pairs-3867.css'])assert.equal((await fetch(url+'/'+file)).status,200);
    const bad=await fetch(url+'/api/problem/3867/solve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:[1.5]})});assert.equal(bad.status,400);
  }finally{server.kill();}
});
