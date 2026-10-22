const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const p = require('../problems').SUPPORTED[1793];
const solve = (nums, k) => p.builder(nums, { k });
const cases = [ [[1,4,3,7,4,5],3,15], [[5,5,4,5,4,1,1,1],0,20], [[7],0,7], [[4,2,4],1,6], [[1,2,3,4],3,6], [[4,3,2,1],0,6], [[2,2,2],1,6] ];
function brute(nums, k) {
  let best = 0;
  for (let l = 0; l <= k; l++) { let min = Infinity; for (let r = l; r < nums.length; r++) { min = Math.min(min, nums[r]); if (r >= k) best = Math.max(best, min * (r-l+1)); } }
  return best;
}
test('1793 examples and every small positive array agree with an exhaustive range oracle', () => {
  assert.equal(p.slug, 'maximum-score-of-a-good-subarray');
  assert.equal(p.debugMode, 'line-by-line');
  for (const [nums,k,answer] of cases) assert.equal(solve(nums,k).answer,answer);
  for (let n=1;n<=5;n++) for (let value=0;value<3**n;value++) {
    const nums=Array.from({length:n},(_,i)=>1+Math.floor(value/(3**i))%3);
    for(let k=0;k<n;k++) assert.equal(solve(nums,k).answer,brute(nums,k),`${nums}; k=${k}`);
  }
});
test('1793 every executed line and all actual locals match CPython, including ties and exhausted boundaries', () => {
  const python = `import sys,json
data=json.load(sys.stdin)
ns={}
exec(compile(data['code'],'<lesson>','exec'),ns)
def encode(value):
    if isinstance(value,list): return [encode(x) for x in value]
    if isinstance(value,(int,str,bool)) or value is None: return value
    return vars(value)
out=[]
for nums,k in data['calls']:
    pending,events={},[]
    def trace(frame,event,arg):
        if frame.f_code.co_filename!='<lesson>' or frame.f_code.co_name!='maximumScore': return trace
        if event in ('line','return'):
            if frame in pending:
                events.append({'line':pending.pop(frame),'locals':{key:encode(value) for key,value in frame.f_locals.items()}})
            if event=='line': pending[frame]=frame.f_lineno
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().maximumScore(nums,k)
    sys.settrace(None)
    out.append({'answer':answer,'events':events})
print(json.dumps(out))`;
  const run = spawnSync('python',['-c',python],{input:JSON.stringify({code:p.code.join('\n'),calls:cases.map(([a,k])=>[a,k])}),encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  JSON.parse(run.stdout).forEach((expected,i)=>{
    const actual=solve(cases[i][0],cases[i][1]);
    assert.equal(actual.answer,expected.answer);
    assert.deepEqual(actual.steps.map(s=>({line:s.codeLines[0],locals:Object.fromEntries(s.vars.map(v=>[v.name,v.rawValue]))})),expected.events);
    assert.equal(actual.steps.filter(s=>s.final).length,1);
    assert.equal(actual.steps.at(-1).codeLines[0],18);
  });
});
test('1793 moves, minimum, width, score and best change only on their own assignment lines', () => {
  const run=solve([1,4,3,7,4,5],3);
  const prev = index => run.steps[index-1].good1793View;
  run.steps.forEach((s,i)=>{
    const v=s.good1793View;
    if(v.left!==null) assert.ok(v.left<=v.k&&v.k<=v.right);
    if(v.line===11||v.line===13){assert.equal(v.minimum,prev(i).minimum);assert.equal(v.width,prev(i).width);assert.equal(v.score,prev(i).score);assert.equal(v.answer,prev(i).answer);}
    if(v.line===16)assert.equal(v.answer,prev(i).answer);
    if(v.line===17)assert.equal(v.answer,Math.max(prev(i).answer,v.score));
  });
  const final=run.steps.at(-1).good1793View;
  assert.deepEqual(final.best,{left:1,right:5,minimum:3,score:15});
  assert.equal(final.score,6); // The final expanded range is not the winning range.
  const tie=solve([4,2,4],1).steps.find(s=>s.good1793View.line===10).good1793View;
  assert.equal(tie.choice.side,'left'); assert.equal(tie.choice.reason,'tie');
  assert.deepEqual(solve([7],0).steps.map(s=>s.codeLines[0]),[3,4,5,6,7,8,9,18]);
});
test('1793 rejects invalid inputs and solves the full 100000-element constraint without pretending to line-debug', () => {
  for(const [input,k] of [[[],0],[[0],0],[[20001],0],[[1.1],0],[[1],-1],[[1],1],[[1],null],[[1],true],[[1],''],['1,,2',0],['',0],[Array(100001).fill(1),0]]) assert.throws(()=>solve(input,k));
  assert.deepEqual(p.liveArgs('1,4,3,7,4,5',{k:'3'}),[[1,4,3,7,4,5],3]);
  const run=solve(Array(100000).fill(20000),50000);
  assert.equal(run.answer,2000000000);assert.equal(run.steps.length,1);
  const step=run.steps[0];assert.deepEqual(step.vars,[]);assert.deepEqual(step.codeLines,[]);
  assert.equal(step.good1793View.mode,'summary');assert.equal(step.good1793View.nums.length,12);
  assert.deepEqual(step.good1793View.best,{left:0,right:99999,minimum:20000,score:2000000000});
});
function renderer() {
  const handlers={},input={value:''},field={value:''};
  const host={innerHTML:'',querySelector(s){if(s==='[data-g1793-replay]'&&!this.innerHTML.includes('data-g1793-replay'))return null;return{clientWidth:500,addEventListener:(e,fn)=>{handlers[s+':'+e]=fn;}};},querySelectorAll(s){const attr=s==='[data-g1793-round]'?'round':'example';return [...this.innerHTML.matchAll(new RegExp(`data-g1793-${attr}="(\\d+)"`,'g'))].map(m=>({dataset:{[attr==='round'?'g1793Round':'g1793Example']:m[1]},addEventListener:(e,fn)=>{handlers[s+m[1]+':'+e]=fn;}}));}};
  const ctx={lang:'vi',$:id=>id==='arrInput'?input:id==='extraParams'?{querySelector:()=>field}:host,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),steps:[],stepIndex:0,stopPlay(){},renderStep(){},runViz(){}};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-good-subarray-1793.js'),'utf8'),ctx);
  return{ctx,host,handlers,input,field};
}
test('1793 renderer handles every phase in both languages, best-range replay and real navigation/example controls', () => {
  const {ctx,host,handlers,input,field}=renderer();
  for(const lang of ['vi','en'])for(const[nums,k]of cases){ctx.lang=lang;for(const step of solve(nums,k).steps){ctx.renderGoodSubarray1793View(step);assert.match(host.innerHTML,/g1793-diagram/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);}}
  const run=solve([1,4,3,7,4,5],3);ctx.lang='en';ctx.steps=run.steps;ctx.stepIndex=0;ctx.renderGoodSubarray1793View(run.steps[0]);
  ctx.renderGoodSubarray1793View(run.steps.find(s=>s.good1793View.line===14));assert.match(host.innerHTML,/previous score/);assert.match(host.innerHTML,/<b>⋯<\/b>/);
  handlers['[data-g1793-next]:click']();assert.equal(run.steps[ctx.stepIndex].good1793View.line,17);
  handlers['[data-g1793-result]:click']();assert.equal(ctx.stepIndex,run.steps.length-1);
  ctx.renderGoodSubarray1793View(run.steps.at(-1));assert.match(host.innerHTML,/\[1 \.\. 5\]/);assert.match(host.innerHTML,/best range/);
  handlers['[data-g1793-replay]:input']({target:{value:'0'}});assert.match(host.innerHTML,/replaying a tested range/);assert.match(host.innerHTML,/\[3 \.\. 3\]/);
  handlers['[data-g1793-round]5:click']();assert.match(host.innerHTML,/\[0 \.\. 5\]/);
  handlers['[data-g1793-example]1:click']();assert.equal(input.value,'5,5,4,5,4,1,1,1');assert.equal(field.value,0);
  ctx.renderGoodSubarray1793View(solve(Array(31).fill(2),15).steps.at(-1));assert.match(host.innerHTML,/Computed all/);assert.doesNotMatch(host.innerHTML,/data-g1793-replay/);
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');
  assert.match(html,/<template id="problemVisualizationStyles"[\s\S]*good-subarray-1793.css[^>]*data-problem-ids="1793"/);
  assert.match(html,/<template id="problemVisualizationScripts"[\s\S]*renderer-good-subarray-1793.js[^>]*data-problem-ids="1793"/);
  assert.match(fs.readFileSync(require.resolve('../public/script.js'),'utf8'),/Boolean\(step.good1793View\)[^\n]+renderGoodSubarray1793View/);
});
test('1793 editable Python code runs in the real live-editor runner', () => {
  const source=fs.readFileSync(require.resolve('../public/live-editor.js'),'utf8'),tracer=vm.runInNewContext(source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1]);
  const python=tracer+`\nimport json,sys\ndata=json.load(sys.stdin)\nprint(json.dumps([__viz_run_trace(data['code'],'maximumScore',args)['result'] for args in data['calls']]))`;
  const run=spawnSync('python',['-c',python],{input:JSON.stringify({code:p.code.join('\n'),calls:cases.map(([nums,k])=>p.liveArgs(nums,{k}))}),encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);assert.deepEqual(JSON.parse(run.stdout),cases.map(c=>c[2]));
});
test('1793 metadata → solve → editor arguments and lazy assets work through real HTTP routes', async () => {
  // Let Windows choose an allowed free port instead of guessing an excluded one.
  const port=await new Promise((resolve,reject)=>{const probe=require('node:net').createServer();probe.on('error',reject);probe.listen(0,()=>{const chosen=probe.address().port;probe.close(error=>error?reject(error):resolve(chosen));});});
  const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:String(port)},stdio:'pipe'}),url=`http://localhost:${port}`;
  let logs='';server.stderr.on('data',d=>logs+=d);
  try{
    let ready=false;for(let i=0;i<100;i++){if(server.exitCode!==null)throw new Error(logs);try{ready=(await fetch(url+'/api/problem/1793')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,50));}assert.ok(ready,logs);
    const meta=await(await fetch(url+'/api/problem/1793')).json();assert.deepEqual(meta.code,p.code);assert.equal(meta.debugMode,'line-by-line');
    for(const suffix of ['solve','live-args']){const response=await fetch(url+'/api/problem/1793/'+suffix,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:'1,4,3,7,4,5',params:{k:3}})});assert.equal(response.status,200);const json=await response.json();if(suffix==='solve'){assert.equal(json.answer,15);assert.ok(json.steps.every(s=>s.good1793View));}else assert.deepEqual(json.args,[[1,4,3,7,4,5],3]);}
    for(const file of ['renderer-good-subarray-1793.js','good-subarray-1793.css'])assert.equal((await fetch(url+'/'+file)).status,200);
    const invalid=await fetch(url+'/api/problem/1793/solve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:'1,2',params:{k:7}})});assert.equal(invalid.status,400);
  } finally { server.kill(); }
});
