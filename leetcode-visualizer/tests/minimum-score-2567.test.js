'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[2567];
const examples=[[1,5,6,7,20],[1,4,7,8,5],[1,2,98,99,100],[1,2,3,100,101],[1,4,3],[5,5,5,5],[8,1,8,2,9,2]];
function score(a){let low=Infinity,high=0;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const gap=Math.abs(a[i]-a[j]);low=Math.min(low,gap);high=Math.max(high,gap);}return low+high;}
// Independent search of the original operation and pairwise score, without sorting.
function brute(a){let best=Infinity;const limit=Math.max(...a)+1;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)for(let x=0;x<=limit;x++)for(let y=0;y<=limit;y++){const b=[...a];b[i]=x;b[j]=y;best=Math.min(best,score(b));}return best;}
function verify(a){const before=[...a],run=p.builder(a),changed=[...a];assert.deepEqual(a,before);assert.equal(run.witness.changes.length,2);assert.equal(new Set(run.witness.changes.map(c=>c.originalIndex)).size,2);for(const c of run.witness.changes){assert.equal(a[c.originalIndex],c.from);changed[c.originalIndex]=c.to;}assert.equal(score(changed),run.answer);assert.equal(run.witness.lowScore,0);assert.equal(run.witness.highScore,run.answer);assert.equal(run.steps.filter(s=>s.final).length,1);assert.deepEqual(run.steps.map(s=>s.debugLine),[3,4,5,6,7,8]);return run;}
test('2567 gives valid two-entry changes for examples, all three winners, ties and duplicates',()=>{
  assert.equal(p.debugMode,'line');for(const a of examples)verify(a);
  assert.equal(verify(examples[0]).answer,2);assert.equal(verify(examples[0]).witness.caseIndex,1);
  assert.equal(verify(examples[1]).answer,3);assert.equal(verify(examples[2]).witness.caseIndex,0);assert.equal(verify(examples[3]).witness.caseIndex,2);
  assert.equal(verify(examples[4]).answer,0);assert.equal(verify(examples[5]).answer,0);
});
test('2567 agrees with exhaustive replacements and pairwise scores for every small array',()=>{
  for(const n of [3,4])for(let encoded=0;encoded<4**n;encoded++){let value=encoded;const a=Array.from({length:n},()=>{const digit=1+value%4;value=Math.floor(value/4);return digit;});assert.equal(verify(a).answer,brute(a),JSON.stringify(a));}
});
test('2567 debug matches actual Python line events and locals before each statement',()=>{
  const keys=['nums','n','left','middle','right'];
  const source=`${p.code.join('\n')}\nimport sys,json\nresults=[]\nfor nums in json.load(sys.stdin):\n    frames=[]\n    def trace(frame,event,arg):\n        if frame.f_code.co_name=='minimizeSum' and event=='line':\n            frames.append({'line':frame.f_lineno,'locals':json.loads(json.dumps({key:frame.f_locals.get(key) for key in ${JSON.stringify(keys)}}))})\n        return trace\n    sys.settrace(trace)\n    answer=Solution().minimizeSum(nums)\n    sys.settrace(None)\n    results.append({'answer':answer,'frames':frames})\nprint(json.dumps(results))`;
  const py=spawnSync('python',['-c',source],{encoding:'utf8',input:JSON.stringify(examples)});assert.equal(py.status,0,py.stderr);
  const expected=JSON.parse(py.stdout);examples.forEach((a,i)=>{const run=p.builder(a);assert.equal(run.answer,expected[i].answer);assert.deepEqual(run.steps.map(s=>({line:s.debugLine,locals:s.score2567PictureView.pythonLocals})),expected[i].frames);for(const s of run.steps){assert.deepEqual(s.codeLines,[s.debugLine]);assert.equal(s.score2567PictureView.source,p.code[s.debugLine-1]);assert.equal(s.score2567PictureView.answer!==null,s.final);}});
});
test('2567 supports the full input limits with six bounded frames and rejects invalid inputs',()=>{
  for(const [a,answer]of [[Array.from({length:100000},(_,i)=>100000-i),99997],[Array(100000).fill(1e9),0],[[1,...Array(99998).fill(500000),1e9],0]]){
    const run=p.builder(a);assert.equal(run.answer,answer);assert.equal(run.steps.length,6);assert.ok(JSON.stringify(run).length<1500000);for(const step of run.steps){const v=step.score2567PictureView;assert.equal(v.fullArray,false);assert.equal(v.pythonLocals.nums,null);assert.equal(v.cells.length,8);assert.equal(v.omitted,99992);}
    assert.equal(run.witness.changes.length,2);assert.deepEqual(p.liveArgs(a),[a]);
  }
  for(const a of [[],[1,2],null,'1,2,3',[0,2,3],[-1,2,3],[1.1,2,3],['1',2,3],[1e9+1,2,3],Array(100001).fill(1)])assert.throws(()=>p.builder(a),/2567:/);
});
function renderer(language){const handlers={},input={value:''};const host={innerHTML:'',querySelectorAll(selector){const attr=selector.slice(1,-1),key=attr.replace(/^data-/,'').replace(/-([a-z])/g,(_,c)=>c.toUpperCase());return [...this.innerHTML.matchAll(new RegExp(`${attr}="([^"]+)"`,'g'))].map(m=>({dataset:{[key]:m[1]},addEventListener(type,fn){handlers[`${attr}:${m[1]}`]=fn;}}));}};const context={lang:language,document:{getElementById:id=>id==='arrInput'?input:host},runViz:()=>context.ran=true};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-minimum-score-2567.js'),'utf8'),context);context.renderStep=()=>context.renderScore2567Pictures(context.steps[context.stepIndex]);return{host,handlers,input,context,render(step,steps,index=0){if(steps){context.steps=steps;context.stepIndex=index;}context.renderScore2567Pictures(step);return host.innerHTML;}};}
test('2567 renders every VI/EN frame and every retained/changed value without missing data',()=>{
  for(const language of ['vi','en']){const ui=renderer(language);for(const a of [...examples,Array(100).fill(1e9)]){const run=p.builder(a);for(const step of run.steps){const html=ui.render(step);assert.doesNotMatch(html,/undefined|NaN|Infinity|\[object Object\]/);assert.match(html,/q2567-array/);if(step.debugLine>=4){assert.equal((html.match(/q2567-cell changed/g)||[]).length,2);assert.match(html,/q2567-score/);}}}}
});
test('2567 navigation, reversible snapshots, three-case inspection and presets stay synchronized',()=>{
  const run=p.builder(examples[0]),ui=renderer('vi'),before=JSON.stringify(run);ui.render(run.steps[0],run.steps);ui.handlers['data-q2567-jump:line']();assert.equal(ui.context.stepIndex,1);ui.handlers['data-q2567-jump:case']();assert.equal(run.steps[ui.context.stepIndex].debugLine,5);ui.handlers['data-q2567-jump:result']();assert.equal(ui.context.stepIndex,5);assert.match(ui.host.innerHTML,/Thử B/);assert.equal((ui.host.innerHTML.match(/ winner/g)||[]).length,1);
  ui.handlers['data-q2567-case:0']();assert.match(ui.host.innerHTML,/Thử A/);assert.match(ui.host.innerHTML,/1 → <b>6/);assert.match(ui.host.innerHTML,/<output>= 14/);assert.match(ui.host.innerHTML,/<strong>2<\/strong><span>điểm nhỏ nhất/);
  ui.handlers['data-q2567-case:2']();assert.match(ui.host.innerHTML,/Thử C/);assert.match(ui.host.innerHTML,/<output>= 5/);assert.equal(JSON.stringify(run),before);
  ui.render(run.steps[0],run.steps);assert.equal((ui.host.innerHTML.match(/aria-pressed="true"/g)||[]).length,0);assert.doesNotMatch(ui.host.innerHTML,/ winner/);ui.handlers['data-q2567-example:4']();assert.equal(ui.input.value,'1,4,3');assert.equal(ui.context.ran,true);
  const tie=p.builder([1,4,3]);assert.equal((ui.render(tie.steps.at(-1)).match(/ winner/g)||[]).length,3);
});
test('2567 light/dark numbers and states meet readable text contrast',()=>{
  const css=fs.readFileSync(require.resolve('../public/minimum-score-2567.css'),'utf8'),lum=hex=>{const c=hex.match(/\w\w/g).map(c=>parseInt(c,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
  for(const palette of [css.match(/^\.q2567-viz\{([^}]+)/)[1],css.match(/\[data-theme="light"\] \.q2567-viz\{([^}]+)/)[1]]){const colors=Object.fromEntries([...palette.matchAll(/--q-([a-z-]+):#([a-f0-9]{6})/g)].map(m=>[m[1],m[2]]));for(const [fg,bg]of [['text','bg'],['muted','panel'],['blue','blue-bg'],['green','green-bg'],['gold','gold-bg'],['green','gold-bg']]){const a=lum(colors[fg]),b=lum(colors[bg]);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,`${fg}/${bg}`);}}
});
