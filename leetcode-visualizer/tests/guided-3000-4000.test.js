'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const lessons=require('../problems/guided-3000-4000'),data=require('../problems/guided-3000-4000.json');
const {verifyAnswer}=require('./helpers/guided-answers');
const specializedLessons=require('../problems/stone-removal-game-3360');

test('904 illustrated lessons fill the registry through 4000 and execute their examples on real source lines',()=>{
 const{SUPPORTED}=require('../problems');assert.equal(data.length,904);
 for(let id=3000;id<=4000;id++)assert.equal(typeof SUPPORTED[id]?.builder,'function',`Missing #${id}`);
 let count=0;for(const entry of data){const p=lessons[entry.id];assert.equal(specializedLessons[entry.id]||p,SUPPORTED[entry.id]);const r=p.builder(p.defaultInput);verifyAnswer(entry,r.answer);
  assert.equal(p.debugMode,'line-by-line');assert.equal(r.steps.filter(s=>s.final).length,1);assert.equal(r.steps.at(-1).catalogLessonView.trace.truncated,false);
  for(const step of r.steps){assert.ok(step.codeLines[0]>0&&step.codeLines[0]<=p.code.length);assert.equal(step.catalogLessonView.source,p.code[step.codeLines[0]-1]);}
  assert.ok(entry.guideVi&&entry.guideEn&&entry.provenance);if(++count%100===0)process.stdout.write(`Verified ${count}/904 examples\n`);
 }
});

test('all frames render bilingual pictures and the active source line; replay is reversible and never reveals a future result',()=>{
 const host={innerHTML:'',querySelectorAll:()=>[]},ctx=vm.createContext({lang:'vi',$:()=>host,problemData:{code:[]}});
 for(const file of['renderer-illustrated-lessons.js','renderer-guided-scenes.js','renderer-catalog-lessons.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);
 let count=0,frames=0;for(const entry of data){const p=lessons[entry.id],r=p.builder(p.defaultInput),before=JSON.stringify(r);ctx.problemData=p;
  for(const lang of['vi','en']){ctx.lang=lang;for(const step of r.steps){ctx.renderCatalogLesson(step);assert.match(host.innerHTML,new RegExp(`data-guided-id="${p.id}"`));assert.match(host.innerHTML,new RegExp(`data-code-line="${step.codeLines[0]}" aria-current="step"`));assert.equal(host.innerHTML.includes('class="cl-result"'),step.final);assert.doesNotMatch(host.innerHTML,/\[object Object\]|<script|<img|(?:cx|cy|rx|ry|width|height|x|y)="(?:NaN|undefined)"/);frames++;}}
  ctx.renderCatalogLesson(r.steps[0]);const first=host.innerHTML;ctx.renderCatalogLesson(r.steps.at(-1));ctx.renderCatalogLesson(r.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(r),before);
  if(++count%100===0)process.stdout.write(`Rendered ${count}/904 lessons, ${frames} frames\n`);
 }
});

test('every additional parsed reference example matches, including constructive and unordered results',()=>{
 const examples=require('./fixtures/guided-3000-4000-examples.json');let checked=0;
 for(const item of examples){const p=lessons[item.id],entry=data.find(e=>e.id===item.id);for(const example of item.examples){const result=p.builder(JSON.stringify(example.args));verifyAnswer({...entry,expected:example.expected},result.answer,example.args);checked++;}}
 assert.ok(checked>900);process.stdout.write(`Verified ${checked} additional examples\n`);
});

test('new scripts and theme styles are lazy, correctly ordered, and registered for every new lesson',()=>{
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');
 for(const asset of['illustrated-lessons.css','renderer-illustrated-lessons.js','guided-scenes.css','renderer-guided-scenes.js','catalog-lessons.css','renderer-catalog-lessons.js']){const line=html.split('\n').find(l=>l.includes(asset)),ids=new Set(line.match(/data-problem-ids="([^"]+)"/)[1].split(' '));for(const entry of data)assert.ok(ids.has(String(entry.id)),`${asset} #${entry.id}`);}
 assert.ok(html.indexOf('renderer-illustrated-lessons.js')<html.indexOf('renderer-guided-scenes.js'));assert.ok(html.indexOf('renderer-guided-scenes.js')<html.indexOf('renderer-catalog-lessons.js'));
 const css=fs.readFileSync(require.resolve('../public/illustrated-lessons.css'),'utf8');for(const variable of['--cl-panel','--cl-fg','--cl-current','--cl-change'])assert.ok(css.includes(variable));assert.match(css,/@media\(max-width:600px\)/);assert.match(html,/English \(US\)/);
});

test('specialized pictures show readable letters, visible node arrows, circles, and numeric scales with collapsed inputs',()=>{
 const host={innerHTML:'',querySelectorAll:()=>[]},ctx=vm.createContext({lang:'vi',$:()=>host,problemData:{code:[]}});
 for(const file of['renderer-illustrated-lessons.js','renderer-guided-scenes.js','renderer-catalog-lessons.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);
 for(const id of[3001,3235,3294,3337,3648,3879]){const p=lessons[id],r=p.builder(p.defaultInput);ctx.problemData=p;
  for(const language of['vi','en']){ctx.lang=language;for(const step of r.steps){ctx.renderCatalogLesson(step);assert.doesNotMatch(host.innerHTML,/\[object Object\]|(?:cx|cy|width|height)="(?:NaN|undefined)"|class="cl-input" open/);assert.match(host.innerHTML,new RegExp(`data-code-line="${step.codeLines[0]}" aria-current="step"`));}}
  if(id===3001)assert.match(host.innerHTML,/iv-chess/);
  if(id===3235)assert.match(host.innerHTML,/iv-obstacle/);
  if(id===3294){assert.match(host.innerHTML,/refX="32"/);assert.match(host.innerHTML,/ Q[\d.,]+ /);}
  if(id===3337)assert.match(host.innerHTML,/<code>[a-z]<\/code>/);
  if(id===3648)assert.match(host.innerHTML,/iv-numbers/);
 }
});
