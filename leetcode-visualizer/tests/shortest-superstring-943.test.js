'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[943];
const examples=['cat,atg,tgc','alex,loves,leetcode','catg,ctaagt,gcta,ttca,atgcatc','abc','ab,ba','abc,bc,abc','abcd,bcde,cdef','aa,bb,cc'];
function brute(words){
  let best=Infinity;
  function visit(text,remaining){if(!remaining.length){best=Math.min(best,text.length);return;}for(let i=0;i<remaining.length;i++){const word=remaining[i];if(text.includes(word)){visit(text,remaining.filter((_,j)=>j!==i));continue;}let size=Math.min(text.length,word.length);while(size&&!text.endsWith(word.slice(0,size)))size--;visit(text+word.slice(size),remaining.filter((_,j)=>j!==i));}}
  visit('',words);return best;
}
function verify(input){
  const words=p.liveArgs(input)[0],run=p.builder(input);
  assert.equal(run.answer.length,brute(words),String(input));
  const raw=Array.isArray(input)?input:input.split(',').map(word=>word.trim()).filter(Boolean);
  for(const word of raw)assert.ok(run.answer.includes(word));
  assert.equal(new Set(run.order).size,words.length);assert.equal(run.placements.length,words.length);
  let length=0;
  for(const item of run.placements){assert.equal(run.answer.slice(item.start,item.start+item.word.length),item.word);assert.equal(item.start,length-item.overlap);length+=item.word.length-item.overlap;}
  assert.equal(length,run.answer.length);assert.equal(run.steps.filter(step=>step.final).length,1);
  for(const step of run.steps){assert.equal(step.codeLines.length,1);assert.equal(step.codeLines[0],step.debugLine);const v=step.shortest943PictureView;assert.equal(v.answer!==null,step.final);assert.equal(v.source,p.code[v.line-1]);if(v.merge)assert.equal(v.merge.candidate,v.merge.prefix+v.words[v.merge.b].slice(v.merge.k));}
  return run;
}
test('943 finds a shortest valid superstring for examples, contained/duplicate words and singleton input',()=>{
  for(const input of examples)verify(input);
  assert.equal(verify('cat,atg,tgc').answer,'catgc');
  assert.equal(verify(examples[2]).answer,'gctaagttcatgcatc');
  assert.equal(verify('abc,bc,abc').answer,'abc');
});
test('943 agrees with exhaustive word orders on deterministic random and greedy-trap cases',()=>{
  const pool=['abc','bca','cab','abb','bba','bac','cca','acc','cac','bab'];let seed=943;
  for(let run=0;run<100;run++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=2+seed%4,words=[];for(let i=0;i<n;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;words.push(pool[seed%pool.length]);}verify(words);}
  verify(['aab','aba','baa']);verify(['abcd','bcda','cdef','dabc']);
});
test('943 full debug follows every Python line and exact scalar, overlap and DP values',()=>{
  const inputs=examples.filter(input=>p.liveArgs(input)[0].length<=3),keys=['words','n','a','b','k','last','mask','nxt','candidate','new_mask','overlap','dp'];
  const source=`${p.code.join('\n')}\nimport sys,json\nresults=[]\nfor words in json.load(sys.stdin):\n    frames=[]\n    def trace(frame,event,arg):\n        if frame.f_code.co_name=='shortestSuperstring' and event=='line':\n            frames.append({'line':frame.f_lineno,'locals':json.loads(json.dumps({key:frame.f_locals.get(key) for key in ${JSON.stringify(keys)}}))})\n        return trace\n    sys.settrace(trace)\n    Solution().shortestSuperstring(words)\n    sys.settrace(None)\n    results.append(frames)\nprint(json.dumps(results))`;
  const py=spawnSync('python',['-c',source],{encoding:'utf8',input:JSON.stringify(inputs.map(input=>p.liveArgs(input)[0])),maxBuffer:16*1024*1024});assert.equal(py.status,0,py.stderr);assert.equal(p.debugMode,'line');
  const actual=inputs.map(input=>p.builder(input).steps.map(step=>({line:step.debugLine,locals:step.shortest943PictureView.pythonLocals})));
  const expected=JSON.parse(py.stdout);
  actual.forEach((frames,i)=>{assert.equal(frames.length,expected[i].length,inputs[i]);frames.forEach((frame,j)=>assert.deepEqual(frame,expected[i][j],`${inputs[i]} · frame ${j}`));});
});
test('943 commits overlap and DP writes only after executing the highlighted assignment',()=>{
  const run=p.builder('cat,atg,tgc');
  run.steps.forEach((step,index)=>{const v=step.shortest943PictureView,next=run.steps[index+1]?.shortest943PictureView;
    if(v.line===11){assert.equal(v.pythonLocals.overlap[v.pythonLocals.a][v.pythonLocals.b],v.pending.before);assert.equal(next.pythonLocals.overlap[v.pythonLocals.a][v.pythonLocals.b],v.pending.after);}
    if(v.line===26){const m=v.merge;assert.equal(v.pythonLocals.dp[m.toMask][m.b],m.old);assert.equal(next.pythonLocals.dp[m.toMask][m.b],m.candidate);assert.equal(v.merge.status,'draft');assert.equal(next.merge.status,'written');}
  });
});
test('943 supports 12 words of 20 letters with bounded summaries and honest minimum lengths',()=>{
  for(const [words,length]of [[Array.from({length:12},(_,i)=>String.fromCharCode(97+i).repeat(20)),240],[Array.from({length:12},(_,i)=>String.fromCharCode(97+i,97+(i+1)%12)),13]]){
    const run=p.builder(words);assert.equal(run.answer.length,length);for(const word of words)assert.ok(run.answer.includes(word));assert.ok(run.steps.length<=300);assert.ok(JSON.stringify(run).length<2000000);assert.equal(run.steps[0].shortest943PictureView.detailed,false);
  }
  for(const input of ['',[],null,['A'],['a1'],['a'.repeat(21)],Array(13).fill('abc'),[5]])assert.throws(()=>p.builder(input),/943:/);
});
function renderer(language){const handlers={},input={value:''};const host={innerHTML:'',querySelectorAll(selector){const attr=selector.slice(1,-1),key=attr.replace(/^data-/,'').replace(/-([a-z])/g,(_,c)=>c.toUpperCase());return [...this.innerHTML.matchAll(new RegExp(`${attr}="([^"]+)"`,'g'))].map(m=>({dataset:{[key]:m[1]},addEventListener(type,fn){handlers[`${attr}:${m[1]}`]=fn;}}));}};const context={lang:language,document:{getElementById:id=>id==='arrInput'?input:host},runViz:()=>context.ran=true};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-shortest-superstring-943.js'),'utf8'),context);context.renderStep=()=>context.renderShortest943Pictures(context.steps[context.stepIndex]);return{host,handlers,input,context,render(step,steps,index=0){if(steps){context.steps=steps;context.stepIndex=index;}context.renderShortest943Pictures(step);return host.innerHTML;}};}
test('943 renders every frame with aligned letter ribbons and honest pending/memory states in VI/EN',()=>{
  for(const language of ['vi','en']){const ui=renderer(language);for(const input of examples)for(const step of p.builder(input).steps){const html=ui.render(step);assert.match(html,/s943-ribbon|s943-empty/);assert.doesNotMatch(html,/undefined|NaN|Infinity|\[object Object\]/);}}
});
test('943 line/overlap/DP/result jumps, matrix inspector, examples and reverse snapshots work',()=>{
  const run=p.builder('cat,atg,tgc'),ui=renderer('vi');ui.render(run.steps[0],run.steps);ui.handlers['data-s943-jump:line']();assert.equal(ui.context.stepIndex,1);
  ui.handlers['data-s943-jump:overlap']();assert.equal(run.steps[ui.context.stepIndex].debugLine,11);
  assert.match(ui.host.innerHTML,/<small>=<\/small><span class="">c<\/span><span class="">a<\/span><span class="">t<\/span><span class="added">g<\/span>/);
  ui.handlers['data-s943-jump:write']();assert.equal(run.steps[ui.context.stepIndex].debugLine,26);
  ui.handlers['data-s943-jump:result']();assert.equal(ui.context.stepIndex,run.steps.length-1);
  ui.handlers['data-s943-pair:0:1']();assert.match(ui.host.innerHTML,/Xem overlap/);assert.match(ui.host.innerHTML,/k = 2/);
  ui.render(run.steps[0],run.steps);assert.doesNotMatch(ui.host.innerHTML,/s943-join result/);
  ui.handlers['data-s943-example:4']();assert.equal(ui.input.value,'ab,ba');assert.equal(ui.context.ran,true);
});
test('943 light/dark letter states and text meet readable contrast',()=>{
  const css=fs.readFileSync(require.resolve('../public/shortest-superstring-943.css'),'utf8'),lum=hex=>{const c=hex.match(/\w\w/g).map(c=>parseInt(c,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
  for(const palette of [css.match(/^\.s943-viz\{([^}]+)/)[1],css.match(/\[data-theme="light"\] \.s943-viz\{([^}]+)/)[1]]){const colors=Object.fromEntries([...palette.matchAll(/--s-([a-z-]+):#([a-f0-9]{6})/g)].map(m=>[m[1],m[2]]));for(const [fg,bg]of [['text','bg'],['muted','panel'],['blue','blue-bg'],['green','green-bg'],['purple','purple-bg'],['red','red-bg'],['gold','gold-bg']]){const a=lum(colors[fg]),b=lum(colors[bg]);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,`${fg}/${bg}`);}}
});
