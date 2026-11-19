'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[526];
function valid(nums){return new Set(nums).size===nums.length&&nums.every((num,i)=>num>=1&&num<=nums.length&&(num%(i+1)===0||(i+1)%num===0));}
function brute(n){let count=0;function permute(prefix){if(prefix.length===n){if(valid(prefix))count++;return;}for(let num=1;num<=n;num++)if(!prefix.includes(num))permute([...prefix,num]);}permute([]);return count;}
function subsetDP(n){const dp=new Uint32Array(1<<n);dp[0]=1;for(let mask=0;mask<dp.length;mask++){let bits=mask,position=1;while(bits){position+=bits&1;bits>>=1;}for(let num=1;num<=n;num++){const bit=1<<(num-1);if(!(mask&bit)&&(num%position===0||position%num===0))dp[mask|bit]+=dp[mask];}}return dp.at(-1);}
test('526 matches exhaustive permutations through n=7 and bitmask DP through the official maximum',()=>{
  for(let n=1;n<=15;n++){
    const run=p.builder([n]);assert.equal(run.answer,subsetDP(n));if(n<=7)assert.equal(run.answer,brute(n));
    assert.ok(run.solutions.length>0&&run.solutions.length<=8);for(const solution of run.solutions)assert.ok(valid(solution));
    assert.equal(run.steps.filter(step=>step.final).length,1);assert.equal(run.steps.at(-1).arrangement526PictureView.found,run.answer);
    assert.ok(run.steps.length<1200);if(n>5){assert.equal(run.steps.length,321);assert.ok(JSON.stringify(run).length<700000);}
    for(const step of run.steps){const v=step.arrangement526PictureView;assert.equal(step.codeLines.length,1);assert.equal(step.debugLine,v.line);assert.equal(v.path.reduce((used,num)=>used|1<<(num-1),0),v.used);assert.ok(v.path.every((num,i)=>num%(i+1)===0||(i+1)%num===0));}
  }
  assert.equal(p.builder([15]).answer,24679);assert.equal(p.builder([2]).answer,2);
  for(const input of [[],[1,2],[0],[16],[1.5],['3'],null])assert.throws(()=>p.builder(input),/526:/);
});
test('526 DFS snapshots exactly match every Python line, call frame, variable and return',()=>{
  const inputs=[1,2,3,4,5],keys=['n','position','used','total','num','bit'];
  const source=`${p.code.join('\n')}\nimport sys,json\nresults=[]\nfor n in json.load(sys.stdin):\n    frames=[]\n    def trace(frame,event,arg):\n        name=frame.f_code.co_name\n        if name in ('countArrangement','backtrack') and (event=='line' or (event=='return' and name=='countArrangement')):\n            frames.append({'line':frame.f_lineno,'functionName':name,'timing':'before' if event=='line' else 'return','locals':{key:frame.f_locals.get(key) for key in ${JSON.stringify(keys)}}})\n        return trace\n    sys.settrace(trace)\n    Solution().countArrangement(n)\n    sys.settrace(None)\n    results.append(frames)\nprint(json.dumps(results))`;
  const py=spawnSync('python',['-c',source],{input:JSON.stringify(inputs),encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(py.status,0,py.stderr);assert.equal(p.debugMode,'line');
  assert.deepEqual(inputs.map(n=>p.builder([n]).steps.map(step=>{const v=step.arrangement526PictureView;return{line:v.line,functionName:v.functionName,timing:v.timing,locals:v.pythonLocals};})),JSON.parse(py.stdout));
});
test('526 choosing, finding a solution and backtracking change pictures only after the proper Python line',()=>{
  const run=p.builder([3]);let solutionCount=0;
  run.steps.forEach((step,index)=>{const v=step.arrangement526PictureView,next=run.steps[index+1]?.arrangement526PictureView;
    assert.equal(v.found,solutionCount);if(v.line===5&&v.functionName==='backtrack'){solutionCount++;assert.equal(v.path.length,3);assert.ok(valid(v.path));}
    if(v.line===10){assert.ok(v.check.valid);assert.ok(!v.path.includes(v.candidate));assert.equal(next.path.at(-1),v.candidate);assert.equal(next.used,v.used|v.pythonLocals.bit);}
    if(v.backtracked){assert.ok(!v.path.includes(v.backtracked.num));assert.equal(v.path[v.backtracked.position-1],undefined);}
  });assert.equal(solutionCount,3);
});
function renderer(language){const handlers={},input={value:''};const host={innerHTML:'',querySelectorAll(selector){const attr=selector.slice(1,-1),key=attr.replace(/^data-/,'').replace(/-([a-z])/g,(_,c)=>c.toUpperCase());return [...this.innerHTML.matchAll(new RegExp(`${attr}="([^"]+)"`,'g'))].map(m=>({dataset:{[key]:m[1]},addEventListener(type,fn){handlers[`${attr}:${m[1]}`]=fn;}}));}};const context={lang:language,document:{getElementById:id=>id==='arrInput'?input:host},runViz:()=>context.ran=true};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-beautiful-arrangement-526.js'),'utf8'),context);context.renderStep=()=>context.renderArrangement526Pictures(context.steps[context.stepIndex]);return{host,handlers,input,context,render(step,steps,index=0){if(steps){context.steps=steps;context.stepIndex=index;}context.renderArrangement526Pictures(step);return host.innerHTML;}};}
test('526 renders the slot/number pictures, rule matrix and every debug snapshot in VI/EN',()=>{
  for(const language of ['vi','en']){const ui=renderer(language);for(const n of [1,2,3,5,15])for(const step of p.builder([n]).steps){const html=ui.render(step);assert.match(html,/a526-slots/);assert.match(html,/a526-matrix/);assert.doesNotMatch(html,/undefined|NaN|Infinity|\[object Object\]/);}}
});
test('526 line/candidate/solution jumps, final example selection and reverse snapshots stay synchronized',()=>{
  const run=p.builder([3]),ui=renderer('vi');ui.render(run.steps[0],run.steps);ui.handlers['data-a526-jump:line']();assert.equal(ui.context.stepIndex,1);
  ui.handlers['data-a526-jump:candidate']();assert.equal(run.steps[ui.context.stepIndex].debugLine,9);
  ui.handlers['data-a526-jump:solution']();assert.equal(run.steps[ui.context.stepIndex].debugLine,5);
  ui.handlers['data-a526-jump:result']();assert.equal(ui.context.stepIndex,run.steps.length-1);
  ui.handlers['data-a526-solution:1']();assert.match(ui.host.innerHTML,/data-a526-solution="1" aria-pressed="true"/);
  ui.render(run.steps[0],run.steps);assert.doesNotMatch(ui.host.innerHTML,/a526-solutions/);
  ui.handlers['data-a526-example:15']();assert.equal(ui.input.value,'15');assert.equal(ui.context.ran,true);assert.deepEqual(p.liveArgs([3]),[3]);
});
test('526 light/dark foreground and state colors remain readable',()=>{
  const css=fs.readFileSync(require.resolve('../public/beautiful-arrangement-526.css'),'utf8'),lum=hex=>{const c=hex.match(/\w\w/g).map(c=>parseInt(c,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
  for(const palette of [css.match(/^\.a526-viz\{([^}]+)/)[1],css.match(/\[data-theme="light"\] \.a526-viz\{([^}]+)/)[1]]){const colors=Object.fromEntries([...palette.matchAll(/--a-([a-z-]+):#([a-f0-9]{6})/g)].map(m=>[m[1],m[2]]));for(const [fg,bg]of [['text','bg'],['muted','panel'],['blue','blue-bg'],['green','green-bg'],['red','red-bg'],['gold','gold-bg']]){const a=lum(colors[fg]),b=lum(colors[bg]);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,`${fg}/${bg}`);}}
});
