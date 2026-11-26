'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const problem=require('../problems').SUPPORTED[3999];
function solve(words){return problem.builder(JSON.stringify([words]));}
const rotations=s=>s.length?Array.from({length:s.length},(_,i)=>s.slice(i)+s.slice(0,i)):[''];
function equivalent(a,b){return a.length===b.length&&rotations([...a].filter((_,i)=>i%2===0).join('')).includes([...b].filter((_,i)=>i%2===0).join(''))&&rotations([...a].filter((_,i)=>i%2===1).join('')).includes([...b].filter((_,i)=>i%2===1).join(''));}
function oracle(words){const representatives=[];for(const word of words)if(!representatives.some(r=>equivalent(r,word)))representatives.push(word);return representatives.length;}

test('3999 groups cyclic rotations of both parities, preserving order and handling empty odd sequences',()=>{
 assert.equal(problem.debugMode,'line-by-line');assert.equal(problem.__catalog.teaching.scene.kind,'parity-rotation');
 for(const[words,expected]of[
  [['ntgwz','zwntg'],1],
  [['abcdef','cdefab','abedcf'],2],
  [['abcdef','abedcf'],2],
  [['a','a','b','ab','ba'],4],
  [['aaaaa','aaaaa','aaa'],2],
  [['abcde','cdeba','ebadc'],1],
 ])assert.equal(solve(words).answer,expected,JSON.stringify(words));
 let seed=3999;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let trial=0;trial<35;trial++){const words=Array.from({length:5},()=>Array.from({length:1+Math.floor(random()*6)},()=>String.fromCharCode(97+Math.floor(random()*3))).join(''));assert.equal(solve(words).answer,oracle(words),JSON.stringify(words));}
});

test('3999 snapshots correspond to executed splits, rotations, minima, and group insertions',()=>{
 const words=['abcdef','cdefab','abedcf'],run=solve(words);assert.equal(run.steps.filter(step=>step.final).length,1);
 for(const step of run.steps){const v=step.catalogLessonView,x=v.locals;assert.equal(step.codeLines.length,1);assert.equal(v.source,problem.code[v.line-1]);
  if(v.line===5)assert.equal(x.even,[...x.word].filter((_,i)=>i%2===0).join(''));
  if(v.line===6)assert.equal(x.odd,[...x.word].filter((_,i)=>i%2===1).join(''));
  if(v.line===11)assert.equal(x.candidate,x.text.slice(x.offset)+x.text.slice(0,x.offset));
  if(v.line===13){assert.ok(v.oldValues.best>x.best);assert.equal(x.best,x.candidate);}
  if(v.line===14)assert.equal(x.key[x.parity],rotations(x.text).sort()[0]);
  const members=(x.groups?.__pairs__||[]).flatMap(([,members])=>members);
  assert.ok(members.length<=words.length);if(v.line===18)assert.deepEqual([...members].sort(),words.slice(0,x.index+1).sort());
  if(!step.final)assert.equal(v.result,null);
 }
 assert.equal(run.steps.at(-1).catalogLessonView.locals.groups.__pairs__.length,2);
 assert.equal(run.steps.at(-1).catalogLessonView.trace.truncated,false);
});

test('3999 draws bilingual parity tiles and executed group members, with reversible source-line playback',()=>{
 const host={innerHTML:'',querySelectorAll:()=>[]},ctx=vm.createContext({lang:'vi',$:()=>host,problemData:problem});
 for(const file of['renderer-rotation-groups-3999.js','renderer-illustrated-lessons.js','renderer-guided-scenes.js','renderer-catalog-lessons.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);
 for(const input of[['abcdef','cdefab','abedcf'],['a','a','b'],['<img>','<img>']]){
  const run=solve(input),snapshot=JSON.stringify(run);
  for(const lang of['vi','en']){ctx.lang=lang;for(const step of run.steps){ctx.renderCatalogLesson(step);assert.match(host.innerHTML,/data-rotation-groups="3999"/);assert.match(host.innerHTML,new RegExp(`data-code-line="${step.codeLines[0]}" aria-current="step"`));assert.equal(host.innerHTML.includes('class="cl-result"'),step.final);assert.doesNotMatch(host.innerHTML,/<script|<img|\[object Object\]|class="cl-input" open/);
    if(step.catalogLessonView.line===2)assert.doesNotMatch(host.innerHTML,/rg3999-bucket /);
   }}
  ctx.renderCatalogLesson(run.steps[0]);const initial=host.innerHTML;ctx.renderCatalogLesson(run.steps.at(-1));ctx.renderCatalogLesson(run.steps[0]);assert.equal(host.innerHTML,initial);assert.equal(JSON.stringify(run),snapshot);
 }
 ctx.lang='vi';ctx.renderCatalogLesson(solve(['abc']).steps.at(-1));assert.match(host.innerHTML,/Chẵn|Lẻ/);
 ctx.lang='en';ctx.renderCatalogLesson(solve(['abc']).steps.at(-1));assert.match(host.innerHTML,/Even|Odd/);
});

test('3999 loads its own drawing assets before the illustrated renderer and declares both theme palettes',()=>{
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');
 for(const asset of['renderer-rotation-groups-3999.js','rotation-groups-3999.css']){const line=html.split('\n').find(line=>line.includes(asset));assert.match(line,/data-problem-ids="3999"/);}
 assert.ok(html.indexOf('renderer-rotation-groups-3999.js')<html.indexOf('src="renderer-illustrated-lessons.js'));
 const css=fs.readFileSync(require.resolve('../public/rotation-groups-3999.css'),'utf8');assert.match(css,/\[data-theme="light"\] \.rg3999/);assert.match(css,/--rg-even/);assert.match(css,/--rg-odd/);assert.match(css,/@media\(max-width:480px\)/);
});
