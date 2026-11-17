'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {spawn,spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[1278];
const BUILDERS=[[1,p.builder],[2,p.builder2]];
const EXAMPLES=[['abc',2,1],['aabbc',3,0],['leetcode',8,0],['a',1,0],['abcba',1,0],['abcdef',2,2]];

function price(s) {return [...s].filter((ch,i)=>ch!==s[s.length-1-i]).length/2;}
function brute(s,k) {
  if(k===1)return price(s);
  let best=Infinity;
  for(let end=1;end<=s.length-k+1;end++)best=Math.min(best,price(s.slice(0,end))+brute(s.slice(end),k-1));
  return best;
}
function randomCases(count) {
  let seed=1278;
  const next=max=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return(seed>>>8)%max;};
  return Array.from({length:count},()=>{const n=1+next(9);return[Array.from({length:n},()=>'abcd'[next(4)]).join(''),1+next(n)];});
}

test('1278 registration, official examples, single letters and valid reconstruction in both approaches',()=>{
  assert.equal(p.slug,'palindrome-partitioning-iii');
  assert.equal(p.debugMode,'line-by-line');
  assert.equal(p.extraParams.find(param=>param.key==='approach').options.length,2);
  assert.deepEqual(p.liveArgs({s:'abc',k:2}),['abc',2]);
  for(const[approach,build]of BUILDERS)for(const[s,k,expected]of EXAMPLES){
    const run=build(s,{k});
    assert.equal(run.answer,expected,`${s}, k=${k}, approach=${approach}`);
    assert.equal(run.selected.length,k);
    assert.equal(run.selected.map(f=>f.original).join(''),s);
    assert.equal(run.selected.reduce((sum,f)=>sum+f.changes,0),expected);
    for(const f of run.selected){
      assert.ok(f.original.length>=1);
      assert.equal(f.repaired,[...f.repaired].reverse().join(''));
      assert.equal([...f.original].filter((ch,i)=>ch!==f.repaired[i]).length,f.changes);
    }
    assert.equal(run.steps.filter(step=>step.final).length,1);
    assert.equal(run.steps.at(-1).palindrome1278View.answer,expected);
    assert.ok(run.steps.every(step=>step.codeBlock===approach&&step.codeLines.length===1));
  }
});

test('1278 matches an independent exhaustive partition oracle on 180 small strings',()=>{
  for(const[s,k]of randomCases(180))for(const[,build]of BUILDERS)assert.equal(build(s,{k}).answer,brute(s,k),`${s}, k=${k}`);
});

test('1278 validates official constraints and fully computes large inputs with bounded traces',()=>{
  for(const[s,k]of[['',1],['A',1],['abc',0],['abc',4],['abc',1.5],['a'.repeat(101),1],['{invalid',1]])assert.throws(()=>p.builder(s,{k}),/1278:/);
  for(const[,build]of BUILDERS){
    const allSingles=build('a'.repeat(100),{k:100});
    assert.equal(allSingles.answer,0);
    assert.equal(allSingles.selected.length,100);
    assert.equal(allSingles.steps.length,5);
    assert.equal(build('ab'.repeat(50),{k:1}).answer,50);
    const detailed=build('abcdefghijkl',{k:6});
    assert.ok(detailed.steps.length<6000);
    assert.equal(detailed.steps.at(-1).palindrome1278View.detailed,true);
  }
});

test('1278 debug covers every executable line; cost and DP mutate only on their assignment lines',()=>{
  for(const[approach,build]of BUILDERS){
    const run=build('abc',{k:2}),code=approach===2?p.code2:p.code;
    assert.deepEqual([...new Set(run.steps.map(step=>step.codeLines[0]))].sort((a,b)=>a-b),code.map((_,i)=>i+1));
    for(let i=1;i<run.steps.length;i++){
      const v=run.steps[i].palindrome1278View,previous=run.steps[i-1].palindrome1278View;
      if(JSON.stringify(v.costs)!==JSON.stringify(previous.costs))assert.ok([4,10].includes(v.line));
      if(JSON.stringify(v.known)!==JSON.stringify(previous.known))assert.ok([4,10].includes(v.line));
      if(JSON.stringify(v.dp)!==JSON.stringify(previous.dp))assert.ok([11,12,16].includes(v.line));
      if(v.phase==='cost'&&v.line===7){
        assert.equal(v.focus.pairs[0].known,false);
        assert.equal(v.known[v.focus.start][v.focus.end-1],false);
      }
      if(v.phase==='cost'&&v.line===8&&v.innerCell){
        const[a,b]=v.innerCell;
        assert.equal(v.known[a][b],true);
        assert.equal(v.inner,v.costs[a][b]);
      }
      if(v.phase==='cost'&&v.line===9)assert.equal(v.mismatch,Number(v.s[v.outer.a]!==v.s[v.outer.b]));
      if(v.phase==='cost'&&v.line===10)assert.equal(v.written,v.inner+v.mismatch);
      if(v.phase==='partition')assert.equal(v.best,Math.min(v.before,v.previous+v.gain));
    }
  }
});

test('1278 DFS saves only completed states and cache hits never enter a duplicate frame',()=>{
  const run=p.builder2('aabbc',{k:3}),returned=new Set();
  let size=0,hits=0;
  for(let i=0;i<run.steps.length;i++){
    const v=run.steps[i].palindrome1278View;
    if(v.operation==='return-call'){
      assert.ok(!returned.has(v.cacheKey));returned.add(v.cacheKey);size++;
    }
    assert.equal(v.cacheSize,size);
    if(v.operation==='cache-hit'){
      assert.ok(returned.has(v.cacheKey));hits++;
      assert.equal(v.childValue,v.memo.find(entry=>entry.key===v.cacheKey).value);
      assert.equal(v.stack.length,run.steps[i-1].palindrome1278View.stack.length);
    }
    assert.equal(v.hits,hits);
  }
  assert.ok(hits>0);
  assert.equal(run.steps.at(-1).palindrome1278View.stack.length,0);
  assert.equal(run.steps[0].palindrome1278View.memo.length,0);
});

function renderer(language){
  const handlers={},host={innerHTML:'',querySelectorAll(selector){
    const attr=selector.slice(1,-1);
    const key=attr.replace(/^data-/, '').replace(/-([a-z])/g,(_,ch)=>ch.toUpperCase());
    return[...this.innerHTML.matchAll(new RegExp(`${attr}="([^"]+)"`,'g'))].map(match=>({dataset:{[key]:match[1]},addEventListener(type,fn){handlers[`${attr}:${match[1]}`]=fn;}}));
  }};
  const context={lang:language,document:{getElementById:()=>host}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-palindrome-partitioning-1278.js'),'utf8'),context);
  context.renderStep=()=>context.renderPalindrome1278View(context.steps[context.stepIndex]);
  return{host,handlers,context,render(step,all,index=0){if(all){context.steps=all;context.stepIndex=index;}context.renderPalindrome1278View(step);return host.innerHTML;}};
}

test('1278 every debug frame renders in both languages without future comparison results',()=>{
  for(const language of ['vi','en']){
    const ui=renderer(language);
    for(const[,build]of BUILDERS)for(const[s,k]of EXAMPLES){
      for(const step of build(s,{k}).steps){
        const html=ui.render(step),v=step.palindrome1278View;
        assert.match(html,/p1278-debug/);
        assert.doesNotMatch(html,/undefined|NaN|Infinity|\[object Object\]/);
        if(v.phase==='cost'&&v.line===7)assert.match(html,/Chưa so sánh|Not compared yet/);
        if(v.focus?.original.length===1)assert.match(html,/Một ký tự đã đối xứng|One letter is a palindrome/);
        if(v.operation==='cache-hit')assert.match(html,/class="hit"/);
      }
    }
  }
});

test('1278 jump controls, backward frames and final segment selection update the picture',()=>{
  for(const[approach,build]of BUILDERS){
    const run=build('abc',{k:2}),ui=renderer('vi');
    ui.render(run.steps[0],run.steps);
    ui.handlers['data-p1278-jump:pair']();
    const index=ui.context.stepIndex;
    assert.equal(run.steps[index].codeLines[0],9);
    assert.match(ui.host.innerHTML,/b → a/);
    ui.render(run.steps[index-1],run.steps,index-1);
    assert.match(ui.host.innerHTML,/Chưa so sánh/);
    ui.handlers['data-p1278-jump:state']();
    assert.equal(approach===2?run.steps[ui.context.stepIndex].palindrome1278View.operation:run.steps[ui.context.stepIndex].palindrome1278View.phase,approach===2?'enter-call':'partition');
    ui.handlers['data-p1278-jump:result']();
    assert.equal(ui.context.stepIndex,run.steps.length-1);
    ui.handlers['data-p1278-segment:1']();
    assert.match(ui.host.innerHTML,/data-p1278-segment="1" aria-pressed="true"/);
    assert.match(ui.host.innerHTML,/“bc”/);
  }
});

test('1278 displayed Python for both approaches agrees with the exhaustive oracle',()=>{
  const local=path.join(__dirname,'../../.venv/Scripts/python.exe'),python=fs.existsSync(local)?local:'python';
  const cases=[...EXAMPLES.map(([s,k])=>[s,k]),...randomCases(30)];
  for(const code of [p.code,p.code2]){
    const result=spawnSync(python,['-c',`${code.join('\n')}\nimport json\nprint(json.dumps([Solution().palindromePartition(*args) for args in ${JSON.stringify(cases)}]))`],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
    assert.deepEqual(JSON.parse(result.stdout),cases.map(([s,k])=>brute(s,k)));
  }
});

test('1278 HTTP routes, both source blocks, live arguments and lazy assets are connected',async()=>{
  const port=await new Promise((resolve,reject)=>{const probe=require('node:net').createServer();probe.on('error',reject);probe.listen(0,()=>{const port=probe.address().port;probe.close(()=>resolve(port));});});
  const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:String(port)},stdio:'pipe'});
  let timeout;
  try{
    await new Promise((resolve,reject)=>{timeout=setTimeout(()=>reject(new Error('Server startup timed out')),15000);server.on('error',reject);server.once('exit',code=>reject(new Error(`Server exited: ${code}`)));server.stdout.once('data',resolve);});clearTimeout(timeout);
    const base=`http://localhost:${port}`,metadata=await(await fetch(`${base}/api/problem/1278`)).json();
    assert.equal(metadata.debugMode,'line-by-line');assert.deepEqual(metadata.code2,p.code2);
    for(const approach of [1,2]){
      const response=await fetch(`${base}/api/problem/1278/solve`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:'abc',params:{k:2,approach}})});
      assert.equal(response.status,200);const run=await response.json();assert.equal(run.answer,1);assert.ok(run.steps.every(step=>step.codeBlock===approach));
    }
    const live=await(await fetch(`${base}/api/problem/1278/live-args`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:'a',params:{k:1,approach:2}})})).json();assert.deepEqual(live.args,['a',1]);
    for(const asset of ['palindrome-partitioning-1278.css','renderer-palindrome-partitioning-1278.js'])assert.equal((await fetch(`${base}/${asset}`)).status,200);
    const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');assert.match(html,/palindrome-partitioning-1278\.css[^>]*data-problem-ids="1278"/);assert.match(html,/renderer-palindrome-partitioning-1278\.js[^>]*data-problem-ids="1278"/);
    assert.match(fs.readFileSync(require.resolve('../public/script.js'),'utf8'),/step\.palindrome1278View/);
  }finally{clearTimeout(timeout);server.kill();}
});
