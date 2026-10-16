"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),{spawnSync}=require("node:child_process");
const {SUPPORTED}=require("../problems"),p375=SUPPORTED[375],p464=SUPPORTED[464];
const PYTHON="C:/Users/david.truong/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const cases375=[1,2,3,6,10],cases464=[[10,11],[4,6],[1,1],[10,0],[2,4],[5,7],[6,12]];
function python(program,input){const p=spawnSync(PYTHON,["-c",program],{encoding:"utf8",input:JSON.stringify(input),maxBuffer:32*1024*1024});assert.equal(p.status,0,p.stderr);return JSON.parse(p.stdout);}
function brute375(lo,hi){if(lo>=hi)return 0;let answer=Infinity;for(let x=lo;x<=hi;x++)answer=Math.min(answer,x+Math.max(brute375(lo,x-1),brute375(x+1,hi)));return answer;}
function brute464(available,remaining){for(let i=0;i<available.length;i++)if(available[i]>=remaining||!brute464(available.filter((_,j)=>i!==j),remaining-available[i]))return true;return false;}

test("375 matches exhaustive small decision trees and shows a worst-case cost certificate",()=>{
  for(let n=1;n<=8;n++)assert.equal(p375.builder([n]).answer,brute375(1,n));
  assert.equal(p375.builder([10]).answer,16);
  for(const n of cases375){const run=p375.builder([n]),v=run.steps.at(-1).guessCost375View;assert.equal(v.worstPath.at(-1).paid,0);assert.equal(v.worstPath.reduce((s,p)=>s+p.paid,0),run.answer);assert.equal(v.worstPath.at(-1).total,run.answer);assert.equal(v.trace.truncated,false);}
});

test("464 matches an independent game tree without memo or bitmasks",()=>{
  for(let m=1;m<=6;m++)for(let target=0;target<=m*(m+1)/2+1;target++){
    const expected=target<=0?true:m*(m+1)/2<target?false:brute464(Array.from({length:m},(_,i)=>i+1),target);
    assert.equal(p464.builder([m],{desiredTotal:target}).answer,expected,`${m},${target}`);
  }
  const final=p464.builder([10],{desiredTotal:11}).steps.at(-1).canIWin464View;
  assert.equal(final.answer,false);assert.equal(final.moves.length,10);
  for(const move of final.moves){assert.equal(move.winning,false);assert.equal(move.pick+move.response,11);}
});

test("375 every line and scalar local matches CPython; pictured dp cells match the actual matrix",()=>{
  const program=p375.code.join("\n")+`\nimport json,sys,math
def clean(value):
    if isinstance(value,float) and math.isinf(value):return '∞'
    if isinstance(value,(list,tuple)):return [clean(x) for x in value]
    return value
results=[]
for n in json.load(sys.stdin):
    events=[]
    def trace(frame,event,arg):
        if frame.f_code.co_name=='getMoneyAmount' and event=='line':
            events.append({'line':frame.f_lineno,'locals':{k:clean(v) for k,v in frame.f_locals.items() if k not in ('self','dp')},'dp':clean(frame.f_locals.get('dp'))})
        return trace
    sys.settrace(trace)
    answer=Solution().getMoneyAmount(n)
    sys.settrace(None)
    results.append({'answer':answer,'events':events})
print(json.dumps(results))
`;
  python(program,cases375).forEach((expected,i)=>{const run=p375.builder([cases375[i]]);assert.equal(run.answer,expected.answer);assert.deepEqual(run.steps.map(s=>({line:s.codeLines[0],locals:s.guessCost375View.locals})),expected.events.map(e=>({line:e.line,locals:e.locals})));run.steps.forEach((s,j)=>{const v=s.guessCost375View;if(v.table)for(const row of v.table)for(const c of row)assert.equal(c.value,expected.events[j].dp[c.lo][c.hi]);});});
});

test("464 all recursive line events, scalar locals and memo progress match CPython",()=>{
  const program=p464.code.join("\n")+`\nimport json,sys
results=[]
for m,target in json.load(sys.stdin):
    events=[]
    def trace(frame,event,arg):
        if frame.f_code.co_name in ('canIWin','win') and event=='line':
            values=frame.f_locals
            memo=values.get('memo',{})
            events.append({'line':frame.f_lineno,'scope':frame.f_code.co_name,'locals':{k:v for k,v in values.items() if k not in ('self','memo') and not callable(v)},'memoCount':len(memo),'memoValue':memo.get(values.get('mask',0))})
        return trace
    sys.settrace(trace)
    answer=Solution().canIWin(m,target)
    sys.settrace(None)
    results.append({'answer':answer,'events':events})
print(json.dumps(results))
`;
  python(program,cases464).forEach((expected,i)=>{const [m,target]=cases464[i],run=p464.builder([m],{desiredTotal:target});assert.equal(run.answer,expected.answer);assert.deepEqual(run.steps.map(s=>{const v=s.canIWin464View;return{line:s.codeLines[0],scope:v.source.scope,locals:v.locals,memoCount:v.memoCount,memoValue:v.memoValue};}),expected.events);});
});

test("375 dp writes and 464 memo writes occur only after the highlighted source line",()=>{
  const run=p375.builder([6]);for(let i=0;i<run.steps.length-1;i++){const v=run.steps[i].guessCost375View,next=run.steps[i+1].guessCost375View;if(v.phase==='save'){const before=v.table.flat().find(c=>c.lo===v.locals.lo&&c.hi===v.locals.hi);assert.equal(before.value,0);const after=next.table.flat().find(c=>c.lo===v.locals.lo&&c.hi===v.locals.hi);assert.equal(after.value,v.locals.best);}if(v.phase==='min')assert.equal(next.locals.best,Math.min(v.locals.best==='∞'?Infinity:v.locals.best,v.locals.worst));}
  const game=p464.builder([6],{desiredTotal:12});let cache=false;
  for(let i=0;i<game.steps.length-1;i++){const v=game.steps[i].canIWin464View,next=game.steps[i+1].canIWin464View;if(['save-win','save-loss'].includes(v.phase)){assert.equal(v.memoValue,null);assert.equal(next.memoCount,v.memoCount+1);assert.equal(next.memoValue,v.phase==='save-win');}if(v.phase==='cache-return'){cache=true;assert.equal(typeof v.memoValue,'boolean');}if(v.source.scope==='win'){let sum=0;for(let bit=0;bit<v.m;bit++)if(v.mask&(1<<bit))sum+=bit+1;assert.equal(v.remaining,v.target-sum);assert.equal(v.path.reduce((a,b)=>a+b,0),sum);}}
  assert.ok(cache);
});

test("both games validate official constraints and supply typed live arguments",()=>{
  for(const input of [[],[0],[201],[1.5],[true],[1,2]])assert.throws(()=>p375.builder(input),/375:/);
  for(const input of [[],[0],[21],[1.5],[true]])assert.throws(()=>p464.builder(input),/464:/);
  for(const desiredTotal of [-1,301,1.5,true,null,'','2.5'])assert.throws(()=>p464.builder([10],{desiredTotal}),/464:/);
  assert.deepEqual(p375.liveArgs([10]),[10]);assert.deepEqual(p464.liveArgs([10],{desiredTotal:'11'}),[10,11]);
  for(const p of [p375,p464]){assert.ok(p.tags.some(t=>t.key==='minimax'));assert.equal(p.debugMode,'line-by-line');}
});

test("large inputs compute complete answers and disclose trace omissions",()=>{
  const run=p375.builder([200]),v=run.steps.at(-1).guessCost375View;assert.equal(run.answer,952);assert.ok(v.trace.truncated&&v.trace.omitted>0);assert.ok(run.steps.length<=3501);assert.ok(v.indices.length<=7);assert.ok(JSON.stringify(run).length<10000000);
  const game=p464.builder([20],{desiredTotal:210}),g=game.steps.at(-1).canIWin464View;assert.equal(game.answer,false);assert.ok(g.trace.truncated&&g.trace.omitted>0);assert.ok(game.steps.length<=3501);assert.ok(g.memoCount>1000);
  assert.equal(p464.builder([20],{desiredTotal:300}).answer,false);
});

test("both snippets execute using the actual live editor tracer",()=>{
  const source=fs.readFileSync(require.resolve('../public/live-editor.js'),'utf8'),template=source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1];
  const program=vm.runInNewContext(template)+`\nimport json,sys
payload=json.load(sys.stdin)
print(json.dumps([__viz_run_trace(x['code'],x['method'],x['args'])['result'] for x in payload]))
`;
  const payload=[{code:p375.code.join('\n'),method:'getMoneyAmount',args:[10]},{code:p464.code.join('\n'),method:'canIWin',args:[10,11]},{code:p464.code.join('\n'),method:'canIWin',args:[4,6]}];
  assert.deepEqual(python(program,payload),[16,false,true]);
});

test("both renderers cover every default frame in both languages and Prev restores exactly",()=>{
  const context={escapeHtml:String};vm.createContext(context);
  for(const [p,file,name,key,css]of [[p375,'renderer-guess-number-ii-375.js','GuessCost375Visualizer','guessCost375View','gc375-viz'],[p464,'renderer-can-i-win-464.js','CanIWin464Visualizer','canIWin464View','ci464-viz']]){
    vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),context);const Klass=vm.runInContext(name,context);
    const runs=p.id===375?cases375.map(n=>p.builder([n])):cases464.map(([m,target])=>p.builder([m],{desiredTotal:target}));
    for(const language of ['vi','en']){const host={innerHTML:''},renderer=new Klass({host,language});for(const run of runs){for(const step of run.steps){renderer.render(JSON.parse(JSON.stringify(step)));assert.match(host.innerHTML,new RegExp(css));assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);assert.equal(step.codeLines[0],step[key].source.line);}renderer.render(run.steps[0]);const first=host.innerHTML;renderer.render(run.steps.at(-1));renderer.render(run.steps[0]);assert.equal(host.innerHTML,first);}}
  }
});

test("both game assets are lazy and registered before generic renderers",()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),active=html.replace(/<template[\s\S]*?<\/template>/g,'');
  for(const name of ['guess-number-ii-375','can-i-win-464']){assert.match(html,new RegExp('renderer-'+name+'\\.js'));assert.match(html,new RegExp(name+'\\.css'));assert.doesNotMatch(active,new RegExp('(?:renderer-)?'+name+'\\.(?:js|css)'));}
  const source=fs.readFileSync(require.resolve('../public/script.js'),'utf8');assert.ok(source.indexOf('step.guessCost375View')<source.indexOf('step.predictWinnerView'));assert.ok(source.indexOf('step.canIWin464View')<source.indexOf('step.predictWinnerView'));
});
