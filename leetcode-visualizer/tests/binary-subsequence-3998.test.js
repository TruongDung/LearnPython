'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../problems').SUPPORTED[3998];
const solve=(s,patterns)=>p.builder(JSON.stringify([s,patterns]));
function reachable(source){const seen=new Set([source]),queue=[source];for(const state of queue)for(let mask=1;mask<1<<state.length;mask++){
 const indices=[...state].map((_,i)=>i).filter(i=>mask>>i&1),bits=indices.map(i=>state[i]).sort(),next=[...state];indices.forEach((i,k)=>next[i]=bits[k]);const target=next.join('');if(!seen.has(target)){seen.add(target);queue.push(target);}
 }return seen;}
function strings(alphabet,length){let result=[''];for(let i=0;i<length;i++)result=result.flatMap(s=>[...alphabet].map(c=>s+c));return result;}

test('3998 matches exhaustive legal subsequence sorts and wildcard assignments for all binary sources through length four',()=>{
 assert.equal(p.debugMode,'line-by-line');assert.equal(p.category.key,'string');assert.deepEqual(solve('101',['1?1','0?1','0?0']).answer,[true,true,false]);
 for(let n=1;n<=4;n++)for(const source of strings('01',n)){const states=reachable(source),patterns=strings('01?',n);for(let start=0;start<patterns.length;start+=20){const batch=patterns.slice(start,start+20),expected=batch.map(pattern=>[...states].some(target=>[...pattern].every((c,i)=>c==='?'||c===target[i])));assert.deepEqual(solve(source,batch).answer,expected,source+' '+batch.join(','));}}
});

test('3998 traces real wildcard decisions, prefix failure, and two-index sorting witnesses',()=>{
 const run=solve('1010',['0?1?','1?0?','11??','000?']),sources=['1010','1010','1010','1010'];
 assert.deepEqual(run.answer,[true,true,false,false]);assert.equal(run.steps.filter(s=>s.final).length,1);
 for(const step of run.steps){const v=step.catalogLessonView,x=v.locals;assert.equal(v.source,p.code[v.line-1]);assert.equal(step.codeLines.length,1);if(!v.final)assert.equal(v.result,null);
  if(v.line===31){const old=v.oldValues.current;assert.equal(old[x.index],'1');assert.equal(old[x.zero_index],'0');assert.ok(x.index<x.zero_index);assert.equal(x.current[x.index],'0');assert.equal(x.current[x.zero_index],'1');assert.equal(x.current.filter(c=>c==='0').length,2);for(let i=0;i<old.length;i++)if(i!==x.index&&i!==x.zero_index)assert.equal(x.current[i],old[i]);}
  if(v.line===33&&x.possible)assert.equal(x.current.join(''),x.target.join(''));
  if(v.line===23)assert.ok(x.target_zeroes<x.source_zeroes);
 }
 assert.ok(run.steps.some(s=>s.catalogLessonView.line===31));assert.ok(run.steps.some(s=>s.catalogLessonView.line===23));assert.ok(run.steps.some(s=>s.catalogLessonView.line===8));
 assert.equal(run.steps.at(-1).catalogLessonView.trace.truncated,false);
 for(const [source,patterns]of[['10',['?']],['1?',['??']],['10',['1x']],['10',[]]])assert.throws(()=>solve(source,patterns),/#3998/);
});

test('3998 pictures are bilingual, show only executed answers and moves, and replay without changing snapshots',()=>{
 const host={innerHTML:'',querySelectorAll:()=>[]},ctx=vm.createContext({lang:'vi',$:()=>host,problemData:p});
 for(const file of['renderer-binary-subsequence-3998.js','renderer-rotation-groups-3999.js','renderer-illustrated-lessons.js','renderer-guided-scenes.js','renderer-catalog-lessons.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);
 for(const [source,patterns]of[['1010',['0?1?','1?0?','11??','000?']],['0',['?','1']],['1',['?','0']]]){const run=solve(source,patterns),before=JSON.stringify(run);
  for(const language of['vi','en']){ctx.lang=language;for(const step of run.steps){ctx.renderCatalogLesson(step);assert.match(host.innerHTML,/data-binary-subsequence="3998"/);assert.match(host.innerHTML,new RegExp(`data-code-line="${step.codeLines[0]}" aria-current="step"`));assert.equal(host.innerHTML.includes('class="cl-result"'),step.final);assert.doesNotMatch(host.innerHTML,/<script|<img|undefined|NaN|\[object Object\]/);
    const v=step.catalogLessonView;if(v.line===3)assert.doesNotMatch(host.innerHTML,/bs3998-status/);if(v.line===31)assert.match(host.innerHTML,/bs3998-move/);if(v.line===23)assert.match(host.innerHTML,/bs3998-comparison blocked/);
   }}ctx.renderCatalogLesson(run.steps[0]);const first=host.innerHTML;ctx.renderCatalogLesson(run.steps.at(-1));ctx.renderCatalogLesson(run.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(run),before);
 }
 ctx.lang='vi';ctx.renderCatalogLesson(solve('10',['01']).steps.at(-1));assert.match(host.innerHTML,/Biến đổi được/);ctx.lang='en';ctx.renderCatalogLesson(solve('01',['10']).steps.at(-1));assert.match(host.innerHTML,/Unreachable/);
});

test('3998 registers lazy drawing assets, source order, and independent light/dark colors',()=>{
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');for(const asset of['renderer-binary-subsequence-3998.js','binary-subsequence-3998.css']){const line=html.split('\n').find(line=>line.includes(asset));assert.match(line,/data-problem-ids="3998"/);}
 assert.ok(html.indexOf('renderer-binary-subsequence-3998.js')<html.indexOf('src="renderer-illustrated-lessons.js'));
 const css=fs.readFileSync(require.resolve('../public/binary-subsequence-3998.css'),'utf8');assert.match(css,/\[data-theme="light"\] \.bs3998/);assert.match(css,/@media\(max-width:480px\)/);
});
