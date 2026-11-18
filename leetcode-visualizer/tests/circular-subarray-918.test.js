'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[918];
const examples=[[[5,-3,5],10],[[1,-2,3,-2],3],[[-3,-2,-3],-2],[[0],0],[[1],1],[[-1],-1],[[3,-2,2,-3],3],[[1,2,3],6],[[2,-2,2,7,8,0],19]];
function brute(nums){let best=-Infinity;for(let start=0;start<nums.length;start++){let sum=0;for(let length=1;length<=nums.length;length++){sum+=nums[(start+length-1)%nums.length];best=Math.max(best,sum);}}return best;}
function verify(nums){
  const run=p.builder(nums),w=run.witness,indices=w.ranges.flatMap(([l,r])=>Array.from({length:r-l+1},(_,i)=>l+i));
  assert.equal(run.answer,brute(nums),String(nums));assert.equal(w.sum,run.answer);
  assert.ok(w.length>=1&&w.length<=nums.length);assert.equal(indices.length,w.length);assert.equal(new Set(indices).size,indices.length);
  assert.equal(indices.reduce((sum,i)=>sum+nums[i],0),run.answer);
  indices.forEach((index,i)=>{if(i)assert.equal(index,(indices[i-1]+1)%nums.length);});
  assert.equal(run.steps.filter(step=>step.final).length,1);
  for(const step of run.steps){assert.equal(step.codeLines.length,1);assert.equal(step.debugLine,step.codeLines[0]);const v=step.circular918PictureView;assert.ok(v.cells.length<=12);assert.equal(v.answer!==null,step.final);}
  return run;
}
test('918 official examples, zeros, all-negative and full arrays produce a legal optimal circular path',()=>{
  for(const [nums,answer]of examples)assert.equal(verify(nums).answer,answer);
  assert.deepEqual(verify([5,-3,5]).witness.ranges,[[2,2],[0,0]]);
  assert.deepEqual(verify([-3,-2,-3]).witness.ranges,[[1,1]]);
});
test('918 matches exhaustive circular intervals for all arrays over -2..2 through length 5',()=>{
  for(let n=1;n<=5;n++)for(let code=0;code<5**n;code++){let value=code;const nums=Array.from({length:n},()=>{const x=value%5-2;value=Math.floor(value/5);return x;});verify(nums);}
});
test('918 every line and scalar variable matches Python before execution',()=>{
  const inputs=[...examples.map(([nums])=>nums),Array(40).fill(-1)],keys=['total','cur_max','max_sum','cur_min','min_sum','i','x','circular_sum'];
  const source=`${p.code.join('\n')}\nimport sys,json\nresults=[]\nfor nums in json.load(sys.stdin):\n    frames=[]\n    def trace(frame,event,arg):\n        if frame.f_code.co_name=='maxSubarraySumCircular' and event=='line':\n            frames.append({'line':frame.f_lineno,'locals':{key:frame.f_locals.get(key) for key in ${JSON.stringify(keys)}}})\n        return trace\n    sys.settrace(trace)\n    Solution().maxSubarraySumCircular(nums)\n    sys.settrace(None)\n    results.append(frames)\nprint(json.dumps(results))`;
  const py=spawnSync('python',['-c',source],{encoding:'utf8',input:JSON.stringify(inputs),maxBuffer:8*1024*1024});assert.equal(py.status,0,py.stderr);assert.equal(p.debugMode,'line');
  assert.deepEqual(inputs.map(nums=>p.builder(nums).steps.map(step=>({line:step.debugLine,locals:step.circular918PictureView.pythonLocals}))),JSON.parse(py.stdout));
});
test('918 maximum inputs use bounded snapshots and preserve valid nonempty results',()=>{
  for(const [nums,answer]of [[Array(30000).fill(30000),900000000],[Array(30000).fill(-30000),-30000],[Array(30000).fill(0),0]]){
    const run=p.builder(nums);assert.equal(run.answer,answer);assert.ok(run.witness.length>0);assert.ok(run.steps.length<60);assert.ok(JSON.stringify(run).length<500000);assert.equal(run.steps[0].circular918PictureView.detailed,false);
  }
  for(const nums of [[],null,[30001],[-30001],[1.2],['2'],Array(30001).fill(1)])assert.throws(()=>p.builder(nums),/918:/);
});
function renderer(language){
  const handlers={},input={value:''};
  const host={innerHTML:'',querySelectorAll(selector){const attr=selector.slice(1,-1),key=attr.replace(/^data-/,'').replace(/-([a-z])/g,(_,c)=>c.toUpperCase());return [...this.innerHTML.matchAll(new RegExp(`${attr}="([^"]+)"`,'g'))].map(m=>({dataset:{[key]:m[1]},addEventListener(type,fn){handlers[`${attr}:${m[1]}`]=fn;}}));}};
  const context={lang:language,document:{getElementById:id=>id==='arrInput'?input:host},runViz:()=>context.ran=true};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-circular-subarray-918.js'),'utf8'),context);
  context.renderStep=()=>context.renderCircular918Pictures(context.steps[context.stepIndex]);
  return{host,handlers,input,context,render(step,steps,index=0){if(steps){context.steps=steps;context.stepIndex=index;}context.renderCircular918Pictures(step);return host.innerHTML;}};
}
test('918 draws every snapshot in VI/EN, a real seam and an invalid empty complement',()=>{
  for(const language of ['vi','en']){
    const ui=renderer(language);
    for(const [nums]of examples){for(const step of p.builder(nums).steps){const html=ui.render(step);assert.match(html,/r918-circle/);assert.doesNotMatch(html,/undefined|NaN|Infinity|\[object Object\]/);}}
    const wrap=p.builder([5,-3,5]);assert.match(ui.render(wrap.steps.at(-1)),/r918-edge selected seam/);
    const normal=p.builder([1,2,3]);assert.doesNotMatch(ui.render(normal.steps.at(-1)),/r918-edge selected seam/);
    for(const nums of [[-3,-2,-3],[0]])assert.match(ui.render(p.builder(nums).steps.at(-1)),/∅ ✕/);
  }
});
test('918 line jumps, reverse snapshots, mode selection and example presets work',()=>{
  const run=p.builder(p.defaultInput),ui=renderer('vi');ui.render(run.steps[0],run.steps);
  ui.handlers['data-r918-jump:line']();assert.equal(ui.context.stepIndex,1);
  ui.handlers['data-r918-jump:compare']();assert.equal(run.steps[ui.context.stepIndex].debugLine,12);
  ui.handlers['data-r918-jump:result']();assert.equal(ui.context.stepIndex,run.steps.length-1);assert.match(ui.host.innerHTML,/r918-result/);
  ui.handlers['data-r918-mode:cut']();assert.match(ui.host.innerHTML,/r918-circle cut/);
  ui.render(run.steps[0],run.steps);assert.doesNotMatch(ui.host.innerHTML,/r918-result/);
  ui.handlers['data-r918-example:2']();assert.equal(ui.input.value,'-3,-2,-3');assert.equal(ui.context.ran,true);
  assert.deepEqual(p.liveArgs([5,-3,5]),[[5,-3,5]]);
});
test('918 light/dark state colors have readable contrast',()=>{
  const css=fs.readFileSync(require.resolve('../public/circular-subarray-918.css'),'utf8');const lum=hex=>{const c=hex.match(/\w\w/g).map(c=>parseInt(c,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
  for(const palette of [css.match(/^\.r918-viz\{([^}]+)/)[1],css.match(/\[data-theme="light"\] \.r918-viz\{([^}]+)/)[1]]){const colors=Object.fromEntries([...palette.matchAll(/--r-([a-z-]+):#([a-f0-9]{6})/g)].map(m=>[m[1],m[2]]));for(const [fg,bg]of [['text','bg'],['muted','panel'],['blue','blue-bg'],['green','green-bg'],['red','red-bg'],['gold','gold-bg']]){const a=lum(colors[fg]),b=lum(colors[bg]);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,`${fg}/${bg}`);}}
});
