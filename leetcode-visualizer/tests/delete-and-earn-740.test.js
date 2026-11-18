'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[740];
const examples=[[[3,4,2],6],[[2,2,3,3,3,4],9],[[1],1],[[1,1,4,4],10],[[1,2,3,4,5,6],12],[[8,8,8],24],[[1,10000],10001]];

// Brute-force the original rule over sets of distinct values, independently of DP.
function brute(nums){
  const values=[...new Set(nums)];let best=0;
  for(let mask=0;mask<2**values.length;mask++){
    const selected=values.filter((_,i)=>mask>>i&1);
    if(selected.some(value=>selected.includes(value+1)))continue;
    best=Math.max(best,nums.reduce((sum,value)=>sum+(selected.includes(value)?value:0),0));
  }
  return best;
}
function verify(nums){
  const run=p.builder(nums),selected=new Set(run.chosen);
  assert.equal(run.answer,brute(nums));
  assert.equal(nums.reduce((sum,value)=>sum+(selected.has(value)?value:0),0),run.answer);
  assert.ok(!run.chosen.some(value=>selected.has(value+1)));
  assert.equal(run.steps.filter(step=>step.final).length,1);
  for(const step of run.steps){
    const v=step.earn740PictureView;
    assert.ok(v.buckets.length<=11);
    assert.ok(v.selected.values.length<=12);
    for(const b of v.buckets){
      if(v.pointsReady)assert.equal(b.points,b.count*b.value);
      else {assert.equal(b.points,null);assert.equal(b.count,null);}
      if(b.value>v.settled)assert.equal(b.dp,null);
      assert.equal(b.selected&&b.blocked,false);
    }
    if(v.phase==='compare'){
      assert.equal(v.choice,null);
      assert.equal(v.take,v.candidates.base+v.candidates.gain);
      assert.equal(v.take,v.candidates.take.values.reduce((sum,item)=>sum+item.points,0));
      assert.equal(v.skip,v.candidates.skip.values.reduce((sum,item)=>sum+item.points,0));
    }
    if(v.phase==='choose')assert.equal(v.best,Math.max(v.take,v.skip));
  }
  return run;
}

test('740 official examples and nonconsecutive values reconstruct a legal optimal selection',()=>{
  for(const [nums,answer]of examples)assert.equal(verify(nums).answer,answer);
  assert.deepEqual(verify([2,2,3,3,3,4]).chosen,[3]);
  const trace=p.builder([2,2,3,3,3,4]).steps,first=trace[0].earn740PictureView;
  assert.deepEqual(trace.find(step=>step.earn740PictureView.phase==='ready').earn740PictureView.buckets.map(b=>b.points),[4,9,4]);
  assert.equal(first.answer,null);
  assert.deepEqual(verify([3,4,2]).chosen,[2,4]);
});

test('740 agrees with exhaustive selections across all counts 0..3 for values 1..5',()=>{
  for(let code=1;code<4**5;code++){
    let rest=code;const nums=[];
    for(let value=1;value<=5;value++){nums.push(...Array(rest%4).fill(value));rest=Math.floor(rest/4);}
    verify(nums);
  }
});

test('740 supports official maximum inputs with bounded snapshots and honest hidden-column counts',()=>{
  for(const nums of [Array(20000).fill(10000),Array.from({length:20000},(_,i)=>1+i%10000)]){
    const run=p.builder(nums),v=run.steps.at(-1).earn740PictureView;
    assert.equal(run.answer,nums[0]===10000?200000000:50010000);
    assert.ok(run.steps.length<=80);
    assert.ok(JSON.stringify(run).length<350000);
    assert.equal(v.omittedBuckets+v.buckets.length,v.totalBuckets);
    assert.equal(v.selected.omitted+v.selected.values.length,run.chosen.length);
  }
  for(const input of [[],[0],[-1],[1.5],[10001],['2'],null,Array(20001).fill(1)])assert.throws(()=>p.builder(input),/740:/);
});

function renderer(language){
  const handlers={},input={value:''};
  const host={innerHTML:'',querySelectorAll(selector){
    const attr=selector.slice(1,-1),key=attr.replace(/^data-/,'').replace(/-([a-z])/g,(_,ch)=>ch.toUpperCase());
    return [...this.innerHTML.matchAll(new RegExp(`${attr}="([^"]+)"`,'g'))].map(match=>({dataset:{[key]:match[1]},addEventListener(type,fn){handlers[`${attr}:${match[1]}`]=fn;}}));
  }};
  const context={lang:language,document:{getElementById:id=>id==='arrInput'?input:host},runViz:()=>context.ran=true};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-delete-and-earn-740.js'),'utf8'),context);
  context.renderStep=()=>context.renderEarn740Pictures(context.steps[context.stepIndex]);
  return {context,host,handlers,input,render(step,steps,index=0){if(steps){context.steps=steps;context.stepIndex=index;}context.renderEarn740Pictures(step);return host.innerHTML;}};
}

test('740 renders every snapshot in VI/EN, final selected columns, conflict links and true value gaps',()=>{
  for(const language of ['vi','en']){
    const ui=renderer(language);
    for(const [nums]of examples){
      const run=p.builder(nums);
      for(const step of run.steps){
        const html=ui.render(step);
        assert.doesNotMatch(html,/undefined|NaN|Infinity|\[object Object\]/);
        assert.match(html,/s740-board/);
      }
      assert.equal([...ui.host.innerHTML.matchAll(/data-state="picked"/g)].length,run.chosen.length);
    }
    const gap=p.builder([1,1,4,4]);assert.match(ui.render(gap.steps.at(-1)),/class="s740-link gap"/);
    assert.doesNotMatch(ui.host.innerHTML,/class="s740-link conflict"/);
  }
});

test('740 column interaction, grouping/choice/result jumps and reverse snapshots stay synchronized',()=>{
  const run=p.builder(p.defaultInput),ui=renderer('vi');
  ui.render(run.steps[0],run.steps);
  ui.handlers['data-s740-jump:group']();assert.equal(run.steps[ui.context.stepIndex].earn740PictureView.phase,'ready');
  ui.handlers['data-s740-value:4']();assert.match(ui.host.innerHTML,/Thử lấy 4: xóa mọi 3 và 5/);
  ui.handlers['data-s740-jump:decision']();assert.equal(run.steps[ui.context.stepIndex].earn740PictureView.phase,'choose');
  ui.handlers['data-s740-jump:result']();assert.equal(ui.context.stepIndex,run.steps.length-1);
  assert.match(ui.host.innerHTML,/s740-loot/);
  ui.render(run.steps[0],run.steps);assert.doesNotMatch(ui.host.innerHTML,/s740-loot/);
  ui.handlers['data-s740-example:2']();assert.equal(ui.input.value,'1,1,4,4');assert.equal(ui.context.ran,true);
});

test('740 displayed Python and live arguments agree with generated solutions',()=>{
  const inputs=examples.map(([nums])=>nums);
  const run=spawnSync('python',['-c',`${p.code.join('\n')}\nprint([Solution().deleteAndEarn(nums) for nums in ${JSON.stringify(inputs)}])`],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);assert.deepEqual(JSON.parse(run.stdout),examples.map(([,answer])=>answer));
  assert.deepEqual(p.liveArgs([3,4,2]),[[3,4,2]]);
});

test('740 stops before every Python line with exactly matching variables, points and dp',()=>{
  const inputs=[p.defaultInput,[3,4,2],[1],[2,2],[1,1,4,4],[4,4,4],[1,2,3],Array(40).fill(40)];
  const keys=['largest','value','skip','take','points','dp'];
  const source=`${p.code.join('\n')}\nimport sys,json\nresults=[]\nfor nums in json.load(sys.stdin):\n    frames=[]\n    def trace(frame,event,arg):\n        if frame.f_code.co_name == 'deleteAndEarn' and event == 'line':\n            frames.append({'line':frame.f_lineno, 'locals':json.loads(json.dumps({key:frame.f_locals.get(key) for key in ${JSON.stringify(keys)}}))})\n        return trace\n    sys.settrace(trace)\n    Solution().deleteAndEarn(nums)\n    sys.settrace(None)\n    results.append(frames)\nprint(json.dumps(results))`;
  const run=spawnSync('python',['-c',source],{encoding:'utf8',input:JSON.stringify(inputs),maxBuffer:8*1024*1024});
  assert.equal(run.status,0,run.stderr);assert.equal(p.debugMode,'line');
  const actual=inputs.map(nums=>p.builder(nums).steps.map(step=>{
    assert.equal(step.codeLines.length,1);assert.equal(step.debugLine,step.codeLines[0]);
    const v=step.earn740PictureView;
    assert.equal(v.timing,'before');assert.equal(v.source,p.code[v.line-1]);
    return {line:v.line,locals:v.pythonLocals};
  }));
  assert.deepEqual(actual,JSON.parse(run.stdout));
});

test('740 pending point/DP writes commit only on the following line, and line controls advance once',()=>{
  const run=p.builder(p.defaultInput),ui=renderer('vi');
  for(let i=0;i<run.steps.length-1;i++){
    const step=run.steps[i],v=step.earn740PictureView,next=run.steps[i+1].earn740PictureView;
    if(v.line===6){
      assert.equal(v.buckets.find(b=>b.value===v.pending.value).points,v.pending.before);
      assert.equal(next.pythonLocals.points[v.pending.value],v.pending.after);
      assert.equal(next.processed,v.processed+1);
      assert.match(ui.render(step),/s740-incoming/);
    }
    if(v.line===12){
      assert.equal(v.choice,null);assert.equal(v.pythonLocals.dp[v.current],v.pending.before);
      assert.equal(next.pythonLocals.dp[v.current],v.pending.after);
      assert.equal(next.best,v.pending.after);
      assert.equal(next.settled,v.current);
    }
  }
  ui.render(run.steps[0],run.steps);
  ui.handlers['data-s740-jump:line']();assert.equal(ui.context.stepIndex,1);
  assert.match(ui.host.innerHTML,/Sắp chạy/);
  assert.match(ui.host.innerHTML,/points = \[0\] \* \(largest \+ 1\)/);
  const pointIndex=run.steps.findIndex(step=>step.earn740PictureView.pending?.target==='points[3]'&&step.earn740PictureView.pending.before===6);
  ui.render(run.steps[pointIndex],run.steps,pointIndex);const before=ui.host.innerHTML;
  ui.handlers['data-s740-jump:line']();
  ui.render(run.steps[pointIndex],run.steps,pointIndex);assert.equal(ui.host.innerHTML,before);
});

test('740 light/dark text and state colors meet readable contrast',()=>{
  const css=fs.readFileSync(require.resolve('../public/delete-and-earn-740.css'),'utf8');
  const lum=hex=>{const rgb=hex.match(/\w\w/g).map(c=>parseInt(c,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
  for(const palette of [css.match(/^\.s740-viz\s*\{([^}]+)/)[1],css.match(/\[data-theme="light"\] \.s740-viz\s*\{([^}]+)/)[1]]){
    const colors=Object.fromEntries([...palette.matchAll(/--s-([a-z-]+):#([a-f0-9]{6})/g)].map(m=>[m[1],m[2]]));
    for(const [fg,bg]of [['text','bg'],['muted','panel'],['good','good-bg'],['bad','bad-bg'],['blue','blue-bg'],['gold','gold-bg']]){
      const a=lum(colors[fg]),b=lum(colors[bg]);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,`${fg}/${bg}`);
    }
  }
});
