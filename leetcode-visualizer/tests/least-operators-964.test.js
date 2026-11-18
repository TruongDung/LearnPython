'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[964];
const examples=[[3,19,5],[5,501,8],[100,100000000,3],[3,2,2],[2,1,1],[5,5,0],[2,200000000,113]];

// Independent bottom-up base-x digit DP: positive and negative carry costs.
function oracle(x,target){
  let positive=0,negative=0,k=0;
  while(target){
    const digit=target%x;target=Math.floor(target/x);
    if(!k){positive=digit*2;negative=(x-digit)*2;}
    else{
      const nextPositive=Math.min(positive+digit*k,negative+(digit+1)*k);
      negative=Math.min(positive+(x-digit)*k,negative+(x-digit-1)*k);
      positive=nextPositive;
    }
    k++;
  }
  return Math.min(positive,negative+k)-1;
}
function verify(x,target){
  const run=p.builder([x],{target}),w=run.witness;
  assert.equal(run.answer,oracle(x,target),`${x},${target}`);
  assert.match(w.expression,new RegExp(`^${x}(?:[+*/-]${x})*$`));
  assert.equal(vm.runInNewContext(w.expression),target);
  assert.equal(w.operatorCount,run.answer);
  assert.equal(w.expression.match(/[+*/-]/g)?.length??0,run.answer);
  assert.equal(w.terms.reduce((sum,term)=>sum+term.coefficient*x**term.position,0),target);
  assert.ok(run.steps.length<=1000);
  assert.equal(run.steps.filter(step=>step.final).length,1);
  for(const step of run.steps){
    const v=step.leastOps964View;
    assert.equal(v.witness!==null,step.final);
    assert.ok(v.memo.length<=12);
    if(v.quotient!==null){
      assert.equal(v.quotient*x+v.remainder,v.remaining);
      assert.equal((v.quotient+1)*x-(x-v.remainder),v.remaining);
    }
    if(v.phaseIndex<3)assert.equal(v.lowCost,null);
    if(v.phaseIndex<4)assert.equal(v.carryCost,null);
  }
  return run;
}

test('964 reconstructs legal optimal expressions for examples, powers and boundary inputs',()=>{
  for(const [x,target,answer]of examples){const run=verify(x,target);assert.equal(run.answer,answer);}
  assert.equal(verify(5,501).witness.expression,'5*5*5*5-5*5*5+5/5');
  for(const x of [2,3,5,10,99,100])for(const target of [1,x-1,x,x+1,199999999,200000000])verify(x,target);
});

test('964 agrees with digit DP across small inputs and deterministic random targets',()=>{
  for(let x=2;x<=8;x++)for(let target=1;target<=150;target++)verify(x,target);
  let seed=964;
  for(let i=0;i<120;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;verify(2+seed%99,1+seed%200000000);}
});

function renderer(language){
  const handlers={},inputs={arrInput:{value:''},'param-target':{value:''}};
  const host={innerHTML:'',querySelectorAll(selector){
    const attr=selector.slice(1,-1),key=attr.replace(/^data-/,'').replace(/-([a-z])/g,(_,ch)=>ch.toUpperCase());
    return [...this.innerHTML.matchAll(new RegExp(`${attr}="([^"]+)"`,'g'))].map(match=>({dataset:{[key]:match[1]},addEventListener(type,fn){handlers[`${attr}:${match[1]}`]=fn;}}));
  }};
  const context={lang:language,document:{getElementById:id=>inputs[id]||host},runViz:()=>context.ran=true};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-least-operators-964.js'),'utf8'),context);
  context.renderStep=()=>context.renderLeastOps964View(context.steps[context.stepIndex]);
  return {context,host,handlers,inputs,render(step,steps,index=0){if(steps){context.steps=steps;context.stepIndex=index;}context.renderLeastOps964View(step);return host.innerHTML;}};
}

test('964 renders every DFS snapshot in Vietnamese and English and counts visible expression operators',()=>{
  for(const language of ['vi','en']){
    const ui=renderer(language);
    for(const [x,target]of examples){
      const run=p.builder([x],{target});
      for(const step of run.steps){
        const html=ui.render(step);
        assert.doesNotMatch(html,/undefined|NaN|Infinity|\[object Object\]/);
        assert.match(html,/o964-insight/);
        if(step.final){
          assert.equal([...html.matchAll(/class="operator"/g)].length,run.answer);
          assert.doesNotMatch(html,/o964-state/);
        }
      }
    }
  }
});

test('964 decision/result controls, examples and backward snapshots stay in sync',()=>{
  const run=p.builder([3],{target:19}),ui=renderer('vi');
  ui.render(run.steps[0],run.steps);assert.doesNotMatch(ui.host.innerHTML,/o964-result/);
  ui.handlers['data-o964-jump:decision']();assert.equal(run.steps[ui.context.stepIndex].leastOps964View.phaseIndex,5);
  ui.handlers['data-o964-jump:result']();assert.equal(ui.context.stepIndex,run.steps.length-1);
  ui.render(run.steps[0],run.steps);assert.doesNotMatch(ui.host.innerHTML,/o964-result/);
  ui.handlers['data-o964-example:5:501']();assert.equal(ui.inputs.arrInput.value,'5');assert.equal(ui.inputs['param-target'].value,'501');assert.equal(ui.context.ran,true);
});

test('964 displayed cached Python matches the visualization',()=>{
  const inputs=examples.map(([x,target])=>[x,target]);
  const run=spawnSync('python',['-c',`${p.code.join('\n')}\nprint([Solution().leastOpsExpressTarget(x,t) for x,t in ${JSON.stringify(inputs)}])`],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);assert.deepEqual(JSON.parse(run.stdout),inputs.map(([x,target])=>oracle(x,target)));
});

test('964 DFS and cache stop on the exact Python line with the actual frame variables',()=>{
  const inputs=[[3,19],[5,501],[2,1],[3,2],[5,5],[2,200000000]];
  const keys=['x','target','position','remaining','unit_cost','quotient','remainder','use_low','use_carry'];
  const source=`${p.code.join('\n')}\nimport sys,json\nresults=[]\nfor x,target in json.load(sys.stdin):\n    frames=[]\n    def trace(frame,event,arg):\n        name=frame.f_code.co_name\n        if name in ('solve','leastOpsExpressTarget') and (event=='line' or (event=='return' and name=='leastOpsExpressTarget')):\n            frames.append({'line':frame.f_lineno,'functionName':name,'timing':'before' if event=='line' else 'return','locals':{key:frame.f_locals.get(key) for key in ${JSON.stringify(keys)}}})\n        return trace\n    sys.settrace(trace)\n    Solution().leastOpsExpressTarget(x,target)\n    sys.settrace(None)\n    results.append(frames)\nprint(json.dumps(results))`;
  const run=spawnSync('python',['-c',source],{encoding:'utf8',input:JSON.stringify(inputs),maxBuffer:8*1024*1024});
  assert.equal(run.status,0,run.stderr);assert.equal(p.debugMode,'line');
  const actual=inputs.map(([x,target])=>p.builder([x],{target}).steps.map(step=>{
    assert.equal(step.codeLines.length,1);assert.equal(step.codeLines[0],step.debugLine);
    const v=step.leastOps964View;
    return {line:v.line,functionName:v.functionName,timing:v.timing,locals:v.pythonLocals};
  }));
  assert.deepEqual(actual,JSON.parse(run.stdout));
});

test('964 cache hits reuse computed states and the line control advances one snapshot',()=>{
  const run=p.builder([3],{target:19}),ui=renderer('vi');
  const opened=run.steps.filter(step=>step.leastOps964View.functionName==='solve'&&step.debugLine===7);
  const keys=opened.map(step=>`${step.leastOps964View.position}:${step.leastOps964View.remaining}`);
  assert.equal(new Set(keys).size,keys.length);
  assert.equal(run.steps.at(-1).leastOps964View.memoSize,keys.length);
  assert.ok(run.steps.at(-1).leastOps964View.cacheHits>0);
  for(const step of run.steps)assert.equal(step.leastOps964View.traceTruncated,false);
  ui.render(run.steps[0],run.steps);ui.handlers['data-o964-jump:line']();assert.equal(ui.context.stepIndex,1);
  assert.match(ui.host.innerHTML,/Sắp chạy/);
  const cached=run.steps.find(step=>step.leastOps964View.cacheReads.length);
  assert.match(ui.render(cached),/o964-cache-hit/);
});

test('964 light/dark colors keep body, muted, and status text readable',()=>{
  const css=fs.readFileSync(require.resolve('../public/least-operators-964.css'),'utf8');
  const lum=hex=>{const rgb=hex.match(/\w\w/g).map(c=>parseInt(c,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
  for(const palette of [css.match(/^\.o964-viz\{([^}]+)/)[1],css.match(/\[data-theme="light"\] \.o964-viz\{([^}]+)/)[1]]){
    const colors=Object.fromEntries([...palette.matchAll(/--o-([a-z-]+):#([a-f0-9]{6})/g)].map(m=>[m[1],m[2]]));
    for(const [fg,bg]of [['text','bg'],['muted','panel'],['blue','blue-bg'],['red','red-bg'],['green','green-bg']]){
      const a=lum(colors[fg]),b=lum(colors[bg]);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,`${fg}/${bg}`);
    }
  }
});
