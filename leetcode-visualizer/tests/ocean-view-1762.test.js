const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const { SUPPORTED, PREFIX_MAX_SUBTABS } = require('../problems');
const p = SUPPORTED[1762];
const cases = [[4,2,3,1],[3,3,3],[1,2,3,4],[4,3,2,1],[7],[2,5,2,3,1],[1000000000,999999999,1]];
const brute = a => a.flatMap((h,i) => a.slice(i+1).every(x=>x<h) ? [i] : []);
test('1762 suffix maximum agrees with every small positive array, equal heights and both boundary orders', () => {
  assert.equal(p.debugMode,'line-by-line');assert.equal(p.premium,true);assert.equal(p.difficulty,'medium');
  for (const a of cases) assert.deepEqual(p.builder(a).answer,brute(a));
  for(let n=1;n<=6;n++)for(let mask=0;mask<3**n;mask++){const a=Array.from({length:n},(_,i)=>1+Math.floor(mask/3**i)%3);assert.deepEqual(p.builder(a).answer,brute(a));}
  assert.deepEqual(p.builder('4,2,3,1').answer,[0,2,3]);
  assert.deepEqual(p.builder('3,3,3').answer,[2]);
  assert.ok(p.tags.some(t=>t.key==='prefix-max'));
  assert.equal(PREFIX_MAX_SUBTABS.find(t=>t.key==='core').roster.find(e=>e.id===1762).available,true);
});
test('1762 every executed line and all locals match real CPython, including in-place reverse and exhausted for headers', () => {
  const python=`import sys,json
data=json.load(sys.stdin)
ns={}
exec(compile(data['code'],'<lesson>','exec'),ns)
def encode(value):
    if isinstance(value,list): return list(value)
    if isinstance(value,(int,str,bool)) or value is None: return value
    return vars(value)
out=[]
for heights in data['cases']:
    pending,events={},[]
    def trace(frame,event,arg):
        if frame.f_code.co_filename!='<lesson>' or frame.f_code.co_name!='findBuildings': return trace
        if event in ('line','return'):
            if frame in pending: events.append({'line':pending.pop(frame),'locals':{k:encode(v) for k,v in frame.f_locals.items()}})
            if event=='line': pending[frame]=frame.f_lineno
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().findBuildings(heights)
    sys.settrace(None)
    out.append({'answer':answer,'events':events})
print(json.dumps(out))`;
  const run=spawnSync('python',['-c',python],{input:JSON.stringify({code:p.code.join('\n'),cases}),encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  JSON.parse(run.stdout).forEach((expected,i)=>{const actual=p.builder(cases[i]);assert.deepEqual(actual.answer,expected.answer);assert.deepEqual(actual.steps.map(s=>({line:s.codeLines[0],locals:Object.fromEntries(s.vars.map(v=>[v.name,v.rawValue]))})),expected.events);assert.equal(actual.steps.filter(s=>s.final).length,1);});
});
test('1762 separates comparison, append, max update and reverse; sightlines stop at the first real blocking building', () => {
  const run=p.builder([4,2,3,1]);
  for(let i=0;i<run.steps.length;i++){
    const v=run.steps[i].ocean1762View;
    if(v.line===6){assert.deepEqual(v.answer,run.steps[i-1].ocean1762View.answer);assert.equal(v.highest,Math.max(0,...v.heights.slice(v.i+1)));}
    if(v.line===7){const prev=run.steps[i-1].ocean1762View;assert.equal(v.highest,prev.highest);assert.deepEqual(v.answer,[...prev.answer,v.i]);}
    if(v.line===8)assert.equal(v.highest,Math.max(...v.heights.slice(v.i)));
  }
  const beforeReverse=run.steps.find(s=>s.ocean1762View.event==='loop-end');assert.deepEqual(beforeReverse.ocean1762View.answer,[3,2,0]);
  assert.deepEqual(run.steps.find(s=>s.ocean1762View.line===9).ocean1762View.answer,[0,2,3]);
  const check=p.builder([2,3,5,1]).steps.at(-1).ocean1762View.checks.find(c=>c.i===0);
  assert.equal(check.blocker,1);assert.equal(check.maxIndex,2); // Closest obstruction differs from the right-side maximum.
  const equal=p.builder([3,3,3]).steps.at(-1).ocean1762View;
  assert.equal(equal.checks.find(c=>c.i===0).blocker,1);assert.equal(equal.checks.find(c=>c.i===0).visible,false);
  assert.equal(equal.checks.find(c=>c.i===2).maxBefore,0);assert.equal(equal.checks.find(c=>c.i===2).visible,true);
});
test('1762 rejects malformed inputs and solves full-size inputs while labeling previews honestly', () => {
  for(const input of [[],null,'','1,,2',[-1],[0],[1.5],[1000000001],[true],Array(100001).fill(1)])assert.throws(()=>p.builder(input));
  assert.deepEqual(p.liveArgs('4,2,3,1'),[[4,2,3,1]]);
  const decreasing=Array.from({length:100000},(_,i)=>100000-i),run=p.builder(decreasing);
  assert.equal(run.answer.length,100000);assert.equal(run.answer[0],0);assert.equal(run.answer.at(-1),99999);
  assert.equal(run.steps.length,1);const step=run.steps[0],v=step.ocean1762View;
  assert.equal(step.final,true);assert.deepEqual(step.codeLines,[]);assert.deepEqual(step.vars,[]);
  assert.equal(v.mode,'summary');assert.equal(v.offset,99988);assert.equal(v.heights.length,12);assert.equal(v.answerCount,100000);assert.deepEqual(v.answer,Array.from({length:12},(_,i)=>99988+i));
  assert.deepEqual(p.builder(Array(100000).fill(1000000000)).answer,[99999]);
});
function renderer(){
  const handlers={},input={value:''};
  const host={innerHTML:'',querySelector(s){return{clientWidth:550,focus(){},addEventListener:(e,fn)=>{handlers[s+':'+e]=fn;}};},querySelectorAll(s){const attr=s==='[data-o1762-building]'?'building':'example';return [...this.innerHTML.matchAll(new RegExp(`data-o1762-${attr}="(\\d+)"`,'g'))].map(m=>({dataset:{[attr==='building'?'o1762Building':'o1762Example']:m[1]},addEventListener:(e,fn)=>{handlers[s+m[1]+':'+e]=fn;}}));}};
  const ctx={lang:'vi',$:id=>id==='arrInput'?input:host,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),steps:[],stepIndex:0,stopPlay(){},renderStep(){},runViz(){}};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-ocean-view-1762.js'),'utf8'),ctx);return{ctx,host,handlers,input};
}
test('1762 renderer handles all frames, both languages, equal-height explanations, keyboard sightline inspection and controls', () => {
  const {ctx,host,handlers,input}=renderer();
  for(const lang of ['vi','en'])for(const heights of cases){ctx.lang=lang;for(const step of p.builder(heights).steps){ctx.renderOcean1762View(step);assert.match(host.innerHTML,/o1762-diagram/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);}}
  const run=p.builder([4,2,3,1]);ctx.lang='en';ctx.steps=run.steps;ctx.stepIndex=0;ctx.renderOcean1762View(run.steps[0]);
  handlers['[data-o1762-next]:click']();assert.equal(run.steps[ctx.stepIndex].ocean1762View.line,8);
  handlers['[data-o1762-result]:click']();assert.equal(ctx.stepIndex,run.steps.length-1);
  ctx.renderOcean1762View(run.steps.at(-1));handlers['[data-o1762-building]1:click']();assert.match(host.innerHTML,/First blocking building: #2/);assert.match(host.innerHTML,/o1762-ray blocked/);
  let prevented=false;handlers['[data-o1762-building]0:keydown']({key:'Enter',preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.match(host.innerHTML,/o1762-ray clear/);
  handlers['[data-o1762-example]1:click']();assert.equal(input.value,'3,3,3');
  ctx.renderOcean1762View(p.builder([3,3,3]).steps.at(-1));assert.match(host.innerHTML,/Equal to right max/);
  ctx.renderOcean1762View(p.builder(Array(31).fill(5)).steps.at(-1));assert.match(host.innerHTML,/Processed all/);assert.doesNotMatch(host.innerHTML,/data-o1762-building=/);
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');assert.match(html,/ocean-view-1762.css[^>]*data-problem-ids="1762"/);assert.match(html,/renderer-ocean-view-1762.js[^>]*data-problem-ids="1762"/);
});
test('1762 displayed solution executes in the actual editable Python runner', () => {
  const source=fs.readFileSync(require.resolve('../public/live-editor.js'),'utf8'),tracer=vm.runInNewContext(source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1]);
  const python=tracer+`\nimport sys,json\ndata=json.load(sys.stdin)\nprint(json.dumps([__viz_run_trace(data['code'],'findBuildings',[a])['result'] for a in data['cases']]))`;
  const run=spawnSync('python',['-c',python],{input:JSON.stringify({code:p.code.join('\n'),cases}),encoding:'utf8'});assert.equal(run.status,0,run.stderr);assert.deepEqual(JSON.parse(run.stdout),cases.map(brute));
});
test('1762 metadata, solve, live editor arguments, Prefix Max catalog membership and lazy assets work through HTTP', async () => {
  const port=await new Promise((resolve,reject)=>{const probe=require('node:net').createServer();probe.on('error',reject);probe.listen(0,()=>{const n=probe.address().port;probe.close(e=>e?reject(e):resolve(n));});});
  const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:String(port)},stdio:'pipe'}),url=`http://localhost:${port}`;let logs='';server.stderr.on('data',d=>logs+=d);
  try{
    let ready=false;for(let i=0;i<100;i++){if(server.exitCode!==null)throw new Error(logs);try{ready=(await fetch(url+'/api/problem/1762')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,50));}assert.ok(ready,logs);
    const meta=await(await fetch(url+'/api/problem/1762')).json();assert.deepEqual(meta.code,p.code);assert.equal(meta.debugMode,'line-by-line');assert.equal(meta.premium,true);
    for(const suffix of ['solve','live-args']){const res=await fetch(url+'/api/problem/1762/'+suffix,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:'4,2,3,1'})});assert.equal(res.status,200);const json=await res.json();if(suffix==='solve'){assert.deepEqual(json.answer,[0,2,3]);assert.ok(json.steps.every(s=>s.ocean1762View));}else assert.deepEqual(json.args,[[4,2,3,1]]);}
    const {groups}=await(await fetch(url+'/api/problems')).json();assert.ok(groups.find(g=>g.key==='prefix-max').problems.some(q=>q.id===1762));
    for(const file of ['renderer-ocean-view-1762.js','ocean-view-1762.css'])assert.equal((await fetch(url+'/'+file)).status,200);
    const bad=await fetch(url+'/api/problem/1762/solve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:'1,,2'})});assert.equal(bad.status,400);
  }finally{server.kill();}
});
