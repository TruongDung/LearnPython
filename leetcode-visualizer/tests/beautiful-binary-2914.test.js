'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {spawn,spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[2914];
const EXAMPLES=[['1001',2],['10',1],['0000',0],['10010011',2],['010101',3],['11',0]];

// Uses the original definition: every maximal uniform run has even length.
function isBeautiful(s){
  let length=1;
  for(let i=1;i<=s.length;i++){
    if(i<s.length&&s[i]===s[i-1])length++;
    else{if(length%2)return false;length=1;}
  }
  return true;
}
function allBinary(n){return Array.from({length:2**n},(_,i)=>i.toString(2).padStart(n,'0'));}

test('2914 is registered with line-by-line debug and matches the official examples',()=>{
  assert.equal(p.slug,'minimum-number-of-changes-to-make-binary-string-beautiful');
  assert.equal(p.debugMode,'line-by-line');
  assert.deepEqual(p.liveArgs('1001'),['1001']);
  for(const[s,answer]of EXAMPLES){
    const run=p.builder(s);
    assert.equal(run.answer,answer);
    assert.ok(isBeautiful(run.repaired));
    assert.equal([...s].filter((bit,i)=>bit!==run.repaired[i]).length,answer);
    assert.equal(run.steps.filter(step=>step.final).length,1);
    assert.equal(run.steps.at(-1).beautiful2914View.answer,answer);
    assert.equal(run.steps.filter(step=>step.codeLines[0]===6).length,answer);
  }
  assert.equal(p.builder('1001').repaired,'1100');
});

test('2914 matches exhaustive Hamming distance to every valid beautiful target through length 8',()=>{
  for(const n of [2,4,6,8]){
    const strings=allBinary(n),targets=strings.filter(isBeautiful);
    for(const s of strings){
      const best=Math.min(...targets.map(target=>[...s].filter((bit,i)=>bit!==target[i]).length));
      assert.equal(p.builder(s).answer,best,s);
    }
  }
});

test('2914 trace keeps original input, counter updates and repair previews synchronized',()=>{
  const run=p.builder(p.defaultInput);
  assert.deepEqual([...new Set(run.steps.map(step=>step.codeLines[0]))].sort((a,b)=>a-b),[1,2,3,4,5,6,7]);
  let previous=null;
  for(const step of run.steps){
    const v=step.beautiful2914View;
    assert.equal(step.codeLines.length,1);
    if(previous&&v.changes!==previous.changes)assert.ok([3,6].includes(v.line));
    assert.equal(v.processed,v.pairs.filter(pair=>pair.done).length);
    assert.equal(v.changes??0,v.pairs.filter(pair=>pair.done&&pair.needed===1).length);
    for(const pair of v.pairs){
      assert.equal(pair.original,p.defaultInput.slice(pair.start,pair.start+2));
      if(!pair.compared){assert.equal(pair.needed,null);assert.equal(pair.output,null);}
      if(pair.compared&&!pair.done){assert.equal(v.line,5);assert.equal(pair.needed,1);assert.equal(pair.output,null);}
      if(pair.done){assert.equal(pair.output[0],pair.output[1]);assert.equal(pair.output[0],pair.original[0]);}
    }
    previous=v;
  }
  assert.equal(run.steps[0].beautiful2914View.pairs.every(pair=>!pair.compared),true);
});

test('2914 validates binary even strings and supports the official maximum with small summary snapshots',()=>{
  for(const input of ['', '1', '101', '10a0', ' 10', '0'.repeat(100002),null,['1','0']])assert.throws(()=>p.builder(input),/2914:/);
  const run=p.builder('10'.repeat(50000));
  assert.equal(run.answer,50000);
  assert.equal(run.repaired,'11'.repeat(50000));
  assert.equal(run.steps.length,4);
  const last=run.steps.at(-1).beautiful2914View;
  assert.equal(last.pairs.length,10);
  assert.equal(last.omittedPairs,49990);
  assert.equal(last.processed,50000);
  assert.ok(JSON.stringify(run.steps).length<30000);
  assert.ok(p.builder('10'.repeat(40)).steps.length<=125);
});

function renderer(language){
  const handlers={},input={value:''};
  const host={innerHTML:'',querySelectorAll(selector){
    const attr=selector.slice(1,-1),key=attr.replace(/^data-/,'').replace(/-([a-z])/g,(_,ch)=>ch.toUpperCase());
    return[...this.innerHTML.matchAll(new RegExp(`${attr}="([^"]+)"`,'g'))].map(match=>({dataset:{[key]:match[1]},addEventListener(type,fn){handlers[`${attr}:${match[1]}`]=fn;}}));
  }};
  const context={lang:language,document:{getElementById:id=>id==='arrInput'?input:host},runViz:()=>{context.ran=true;}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-beautiful-binary-2914.js'),'utf8'),context);
  context.renderStep=()=>context.renderBeautiful2914View(context.steps[context.stepIndex]);
  return{host,handlers,context,input,render(step,all,index=0){if(all){context.steps=all;context.stepIndex=index;}context.renderBeautiful2914View(step);return host.innerHTML;}};
}

test('2914 renders every frame and large summaries in both languages with useful pair states',()=>{
  for(const lang of ['vi','en']){
    const ui=renderer(lang);
    for(const[s]of EXAMPLES){
      for(const step of p.builder(s).steps){
        const html=ui.render(step);
        assert.match(html,/b2914-pairs/);
        assert.doesNotMatch(html,/undefined|NaN|Infinity|\[object Object\]/);
        if(step.beautiful2914View.phase==='compare'&&step.beautiful2914View.condition)assert.match(html,/changes tăng ở dòng 6|changes increases on line 6/);
      }
    }
    const large=p.builder('10'.repeat(100));
    assert.match(ui.render(large.steps.at(-1)),/90 (cặp đã ẩn|pairs omitted)/);
  }
});

test('2914 jump controls, reverse snapshots, final pair selection and examples update correctly',()=>{
  const run=p.builder(p.defaultInput),ui=renderer('vi');
  ui.render(run.steps[0],run.steps);
  ui.handlers['data-b2914-jump:pair']();
  const index=ui.context.stepIndex;
  assert.equal(run.steps[index].codeLines[0],5);
  assert.match(ui.host.innerHTML,/data-state="tested"/);
  ui.render(run.steps[index-1],run.steps,index-1);
  assert.doesNotMatch(ui.host.innerHTML,/data-state="tested"/);
  ui.handlers['data-b2914-jump:result']();
  assert.equal(ui.context.stepIndex,run.steps.length-1);
  ui.handlers['data-b2914-pair:2']();
  assert.match(ui.host.innerHTML,/data-b2914-pair="2" aria-pressed="true"/);
  assert.match(ui.host.innerHTML,/Giữ cặp 00/);
  ui.handlers['data-b2914-example:1']();
  assert.equal(ui.input.value,'10');assert.equal(ui.context.ran,true);
});

test('2914 displayed Python agrees with exhaustive example results',()=>{
  const local=path.join(__dirname,'../../.venv/Scripts/python.exe'),python=fs.existsSync(local)?local:'python';
  const inputs=[...EXAMPLES.map(([s])=>s),...allBinary(6)];
  const run=spawnSync(python,['-c',`${p.code.join('\n')}\nimport json\nprint(json.dumps([Solution().minChanges(s) for s in ${JSON.stringify(inputs)}]))`],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  assert.deepEqual(JSON.parse(run.stdout),inputs.map(s=>p.builder(s).answer));
});

test('2914 foreground and status colors have readable contrast in light and dark themes',()=>{
  const css=fs.readFileSync(require.resolve('../public/beautiful-binary-2914.css'),'utf8');
  const luminance=hex=>{const rgb=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
  const palettes=[css.match(/^\.b2914-viz\s*\{([^}]+)/m)[1],css.match(/\[data-theme="light"\] \.b2914-viz\s*\{([^}]+)/)[1]];
  for(const block of palettes){
    const colors=Object.fromEntries([...block.matchAll(/--bb-([a-z]+):#([a-f0-9]{6})/g)].map(match=>[match[1],match[2]]));
    for(const name of ['text','muted','active','good','change']){
      const a=luminance(colors[name]),b=luminance(colors.panel);
      assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,`${name} has low contrast`);
    }
  }
});

test('2914 HTTP metadata, solve, live args, catalog and lazy assets are connected',async()=>{
  const port=await new Promise((resolve,reject)=>{const probe=require('node:net').createServer();probe.on('error',reject);probe.listen(0,()=>{const port=probe.address().port;probe.close(()=>resolve(port));});});
  const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:String(port)},stdio:'pipe'});
  let timeout;
  try{
    await new Promise((resolve,reject)=>{timeout=setTimeout(()=>reject(new Error('Server did not start')),15000);server.on('error',reject);server.once('exit',code=>reject(new Error(`Server exited: ${code}`)));server.stdout.once('data',resolve);});clearTimeout(timeout);
    const base=`http://localhost:${port}`,metadata=await(await fetch(`${base}/api/problem/2914`)).json();
    assert.equal(metadata.debugMode,'line-by-line');assert.deepEqual(metadata.code,p.code);
    const response=await fetch(`${base}/api/problem/2914/solve`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:'1001',params:{}})});
    assert.equal(response.status,200);const result=await response.json();assert.equal(result.answer,2);assert.equal(result.repaired,'1100');
    const live=await(await fetch(`${base}/api/problem/2914/live-args`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:'10',params:{}})})).json();assert.deepEqual(live.args,['10']);
    const catalog=await(await fetch(`${base}/api/problems`)).json();assert.ok(catalog.groups.find(group=>group.key==='string').problems.some(problem=>problem.id===2914));
    for(const asset of ['renderer-beautiful-binary-2914.js','beautiful-binary-2914.css'])assert.equal((await fetch(`${base}/${asset}`)).status,200);
    const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');assert.match(html,/beautiful-binary-2914\.css[^>]*data-problem-ids="2914"/);assert.match(html,/renderer-beautiful-binary-2914\.js[^>]*data-problem-ids="2914"/);
  }finally{clearTimeout(timeout);server.kill();}
});
