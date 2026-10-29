'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[2115];
const defaults=[['bread','sandwich','burger'],[['yeast','flour'],['bread','meat'],['sandwich','bread','meat']],['yeast','flour','meat']];
const samples=[defaults,[defaults[0],defaults[1],['flour','meat']],[['soup','sauce','bread'],[['sauce'],['soup'],['flour']],['flour']],[['starter','meal'],[[],['starter']],[]],[['a','b'],[['a'],['a']],[]],[['a','b'],[['x','x'],['a']],['x','x']],[['a','b'],[['x'],['a']],['a','x']],[[],[],[]],[['__proto__','constructor'],[['x'],['__proto__']],['x']],[['<img src=x onerror=alert(1)>'],[['<svg/onload=alert(1)>']],['<svg/onload=alert(1)>']],[['bánh mì 🥖'],[['bột mì']],['bột mì']]];
const run=(recipes,ingredients,supplies)=>problem.builder(recipes,{ingredients,supplies});
function oracle(recipes,ingredients,supplies){const available=new Set(supplies),made=new Set();let changed=true;while(changed){changed=false;recipes.forEach((recipe,i)=>{if(!made.has(recipe)&&ingredients[i].every(item=>available.has(item))){made.add(recipe);available.add(recipe);changed=true;}});}return [...made].sort();}
test('2115 matches independent fixed-point closure for every three-recipe dependency graph, seed subsets, cycles and empty recipes',()=>{
  for(const args of samples)assert.deepEqual([...run(...args).answer].sort(),oracle(...args));
  const recipes=['a','b','c'];
  for(let mask=0;mask<512;mask++){const ingredients=recipes.map((_,r)=>recipes.filter((__,i)=>mask&(1<<(r*3+i))));if(mask%3===0)ingredients[0].push('x');const supplies=mask%2===0?['x']:['x','a'];const result=run(recipes,ingredients,supplies);assert.deepEqual([...result.answer].sort(),oracle(recipes,ingredients,supplies));assert.equal(new Set(result.answer).size,result.answer.length);}
  const maxRecipes=Array.from({length:8},(_,i)=>'r'+i),items=Array.from({length:10},(_,i)=>'i'+i),ingredients=maxRecipes.map((_,i)=>[...items,...maxRecipes.slice(0,i)]);assert.equal(run(maxRecipes,ingredients,items).answer.length,8);
});
test('every highlighted Python line, deque, set, dictionary mutation and return matches native CPython',()=>{
  const source=`import json,sys,types,collections
code=json.loads(sys.stdin.readline());cases=json.load(sys.stdin);runs=[]
def enc(v):
 if isinstance(v,dict):return {k:enc(x) for k,x in v.items()}
 if isinstance(v,(list,tuple,collections.deque)):return [enc(x) for x in v]
 if isinstance(v,set):return sorted(v)
 return v
def local(f):return {k:enc(v) for k,v in f.f_locals.items() if k!='self' and not callable(v) and not isinstance(v,types.ModuleType)}
for args in cases:
 scope={};exec(compile(code,'<lesson>','exec'),scope);pending={};events=[]
 def trace(f,event,arg):
  if f.f_code.co_filename!='<lesson>' or f.f_code.co_name.startswith('<'):return trace
  if event in ('line','return'):
   if f in pending:events.append({'line':pending.pop(f),'locals':local(f),'returning':event=='return','returned':enc(arg) if event=='return' else None})
   if event=='line':pending[f]=f.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().findAllRecipes(*args);sys.settrace(None);runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const parsed=samples.map(args=>problem.liveArgs(args[0],{ingredients:args[1],supplies:args[2]})),native=spawnSync('python3',['-c',source],{input:JSON.stringify(problem.code.join('\n'))+'\n'+JSON.stringify(parsed),encoding:'utf8',maxBuffer:24e6});assert.equal(native.status,0,native.stderr);
  JSON.parse(native.stdout).forEach((reference,index)=>{const result=run(...samples[index]);assert.deepEqual(result.answer,reference.answer);assert.equal(result.steps.length,reference.events.length);result.steps.forEach((step,j)=>{const v=step.recipes2115View,e=reference.events[j];assert.deepEqual(step.codeLines,[e.line]);assert.deepEqual(v.locals,e.locals,`L${e.line}`);assert.deepEqual(v.outer,e.locals);assert.deepEqual(v.frames,[{name:'findAllRecipes',locals:e.locals}]);assert.equal(v.returning,e.returning);assert.deepEqual(v.returned,e.returned);assert.equal(v.source.timing,'after');});});
});
test('supplies, pending notifications, need, made, availability and enqueue are distinct source states',()=>{
  for(const args of samples){let previous=null;for(const step of run(...args).steps){const v=step.recipes2115View,x=v.locals,line=v.source.line;assert.deepEqual(v.queue,x.queue??null);assert.deepEqual(v.available,x.available??null);assert.deepEqual(v.need,x.need??null);assert.deepEqual(v.made,x.made??null);assert.equal(v.answer===null,!step.final);
      if(v.queue)assert.equal(new Set(v.queue).size,v.queue.length);
      for(const state of v.state){const assigned=x.need&&Object.hasOwn(x.need,state.name);assert.equal(state.need,assigned?x.need[state.name]:null);if(assigned)assert.equal(state.need,state.ingredients.filter(item=>!item.delivered).length);assert.equal(state.made,x.made?.includes(state.name)??false);assert.equal(state.available,x.available?.includes(state.name)??false);assert.equal(state.queued,x.queue?.includes(state.name)??false);}
      if(previous){for(let i=0;i<v.state.length;i++)if(v.state[i].ingredients.filter(item=>item.delivered).length!==previous.state[i].ingredients.filter(item=>item.delivered).length)assert.equal(line,22);if(JSON.stringify(v.made)!==JSON.stringify(previous.made))assert.ok([12,15,24].includes(line));if(JSON.stringify(v.available)!==JSON.stringify(previous.available))assert.ok([11,17,26].includes(line));}
      if(v.event==='decrement'){assert.equal(v.change.before-v.change.after,1);assert.equal(v.change.ingredient,v.active);assert.equal(v.state.find(s=>s.name===v.change.recipe).ingredients[v.change.slot].delivered,true);}
      previous=v;
    }}
  const result=run(...defaults),make=result.steps.find(s=>s.recipes2115View.event==='make'),v=make.recipes2115View;assert.equal(v.target,'bread');assert.ok(v.made.includes('bread'));assert.ok(!v.available.includes('bread'));assert.ok(!v.queue.includes('bread'));const available=result.steps[result.steps.indexOf(make)+2].recipes2115View;assert.equal(available.event,'available');assert.ok(available.available.includes('bread'));assert.ok(!available.queue.includes('bread'));
});
function renderer(lang,extra={}){const host={innerHTML:'',querySelector:()=>null},context={lang,$:()=>host,...extra};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-possible-recipes-2115.js'),'utf8'),context);return {context,host,render:step=>{context.renderRecipes2115Pictures(step);return host.innerHTML;}};}
function decode(text){return text.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');}
test('both languages draw exact recipe counters, ingredient notifications, FIFO and made order with escaped names and stable rewind',()=>{
  for(const lang of ['vi','en'])for(const args of samples){const result=run(...args),saved=JSON.stringify(result),{render}=renderer(lang);for(const step of result.steps){const v=step.recipes2115View,html=render(step);assert.doesNotMatch(html,/NaN|undefined|Infinity|object Object|<p\b|<table\b|<img\b|<svg\/onload/);const states=[...html.matchAll(/data-recipe-index="(\d+)" data-need="([^"]*)" data-made="([^"]*)" data-available="([^"]*)" data-queued="([^"]*)"/g)].map(m=>m.slice(1));assert.deepEqual(states,v.state.map((s,i)=>[String(i),String(s.need??''),String(s.made),String(s.available),String(s.queued)]));const queue=[...html.matchAll(/data-queue-index="\d+" data-queue-name="([^"]*)"/g)].map(m=>decode(m[1]));assert.deepEqual(queue,v.queue??[]);const made=[...html.matchAll(/data-made-index="\d+" data-made-name="([^"]*)"/g)].map(m=>decode(m[1]));assert.deepEqual(made,v.made??[]);const slots=[...html.matchAll(/data-slot="(\d+),(\d+)" data-delivered="([^"]*)" data-built="([^"]*)"/g)].map(m=>m.slice(1));assert.deepEqual(slots,v.state.flatMap((s,i)=>s.ingredients.map((p,j)=>[String(i),String(j),String(p.delivered),String(p.built)])));}
    const first=render(result.steps[0]);render(result.steps.at(-1));assert.equal(render(result.steps[0]),first);assert.equal(JSON.stringify(result),saved);
  }
});
test('pop, decrement and made controls use exact trace events, and example buttons run complete coherent inputs',()=>{
  for(const args of samples)for(const[id,event]of [['rp2115NextPop','pop'],['rp2115NextNeed','decrement'],['rp2115NextMade','make']]){const result=run(...args),handlers={},host={innerHTML:'',querySelector:selector=>selector.startsWith('#')?{addEventListener:(_,fn)=>handlers[selector]=fn}:null},r=renderer('vi',{$:()=>host,steps:result.steps,stepIndex:0,stopPlay(){},renderStep(){}});r.render(result.steps[0]);handlers['#'+id]();assert.ok(result.steps[r.context.stepIndex].final||result.steps[r.context.stepIndex].recipes2115View.event===event);for(let i=0;i<60;i++)handlers['#'+id]();assert.equal(r.context.stepIndex,result.steps.length-1);}
  const buttons=['chain','missing','cycle'].map(kind=>({dataset:{recipePreset:kind},addEventListener:(_,fn)=>buttons.find(b=>b.dataset.recipePreset===kind).click=fn})),fields={arrInput:{},'param-ingredients':{},'param-supplies':{},runBtn:{click(){fields.answer=problem.builder(fields.arrInput.value,{ingredients:fields['param-ingredients'].value,supplies:fields['param-supplies'].value}).answer;}}},host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>buttons};renderer('vi',{$:id=>id==='treeView'?host:fields[id]}).render(run(...defaults).steps[0]);buttons[0].click();assert.deepEqual(fields.answer,['bread','sandwich','burger']);buttons[1].click();assert.deepEqual(fields.answer,[]);buttons[2].click();assert.deepEqual(fields.answer,['bread']);
});
test('JSON/array inputs, finite bounds, cache isolation and scoped lazy light/dark styles preserve the shared app',()=>{
  assert.equal(problem.debugMode,'line-by-line');assert.deepEqual(problem.liveArgs(JSON.stringify(defaults[0]),{ingredients:JSON.stringify(defaults[1]),supplies:JSON.stringify(defaults[2])}),defaults);
  for(const args of [[['x','x'],[[],[]],[]],[['x'],[],[]],[['x'],[['']],[]],[Array.from({length:9},(_,i)=>'r'+i),Array(9).fill([]),[]],[['x'],[Array(19).fill('a')],[]],[['x'.repeat(49)],[[]],[]],[['a'],[['b']],Array.from({length:18},(_,i)=>'s'+i)]])assert.throws(()=>run(...args));assert.throws(()=>problem.builder('bad JSON'));
  const r=run(...defaults),saved=JSON.stringify(r);r.steps[0].recipes2115View.state[0].ingredients[0].delivered=true;assert.equal(JSON.stringify(run(...defaults)),saved);
  const board={clientHeight:410,offsetTop:500,scrollTop:0},target={offsetTop:700,offsetHeight:150},host={innerHTML:'',querySelector:selector=>selector==='.rp2115-board-scroll'?board:selector==='.rp2115-recipe.target'?target:null};renderer('vi',{$:()=>host}).render(run(...defaults).steps[0]);assert.equal(board.scrollTop,570,'focus uses coordinates within the positioned board, including lower recipe rows');
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/possible-recipes-2115.css'),'utf8');for(const asset of ['possible-recipes-2115.css','renderer-possible-recipes-2115.js'])assert.ok(html.split('\n').some(line=>line.includes(asset)&&line.includes('data-problem-ids="2115"')));assert.match(css,/\[data-theme="light"\] \.rp2115-viz/);assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);
});
