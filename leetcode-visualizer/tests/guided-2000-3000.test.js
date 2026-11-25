'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const lessons=require('../problems/guided-2000-3000'),data=require('../problems/guided-2000-3000.json');
const close=(a,b)=>typeof a==='number'&&typeof b==='number'?Math.abs(a-b)<=Math.max(1e-6,Math.abs(b)*1e-6):Array.isArray(a)&&Array.isArray(b)?a.length===b.length&&a.every((v,i)=>close(v,b[i])):a&&b&&typeof a==='object'&&typeof b==='object'?Object.keys(a).length===Object.keys(b).length&&Object.keys(a).every(k=>close(a[k],b[k])):a===b;
test('837 new lessons complete the registry through 3000 and all default examples execute without truncation',()=>{
 const {SUPPORTED}=require('../problems');assert.equal(Object.keys(lessons).length,837);for(let id=1;id<=3000;id++)assert.equal(typeof SUPPORTED[id]?.builder,'function',`Missing ${id}`);
 let count=0;for(const p of Object.values(lessons)){assert.equal(p,SUPPORTED[p.id]);const r=p.builder(p.defaultInput);assert.ok(close(r.answer,p.__catalog.expected),`#${p.id}: ${JSON.stringify(r.answer)} != ${JSON.stringify(p.__catalog.expected)}`);assert.equal(r.steps.filter(s=>s.final).length,1);assert.equal(r.steps.at(-1).catalogLessonView.trace.truncated,false);assert.equal(p.__catalog.teaching.mode,'guided');for(const step of r.steps)assert.equal(step.catalogLessonView.source,p.code[step.codeLines[0]-1],`Line mismatch ${p.id}`);if(++count%100===0)process.stdout.write(`Checked ${count}/837 examples\n`);}
});
test('every new frame renders a safe scene in VI/EN; playback is reversible and does not mutate traces',()=>{
 const host={innerHTML:'',querySelectorAll:()=>[]},ctx=vm.createContext({lang:'vi',$:()=>host,problemData:{code:[]}});
 for(const file of ['../public/renderer-guided-scenes.js','../public/renderer-catalog-lessons.js'])vm.runInContext(fs.readFileSync(require.resolve(file),'utf8'),ctx);
 let count=0,frames=0;for(const p of Object.values(lessons)){const r=p.builder(p.defaultInput),before=JSON.stringify(r);ctx.problemData=p;
  for(const language of['vi','en']){ctx.lang=language;for(const step of r.steps){ctx.renderCatalogLesson(step);assert.match(host.innerHTML,new RegExp(`data-guided-id="${p.id}"`));assert.doesNotMatch(host.innerHTML,/\[object Object\]|<script|<img|(?:cx|cy|rx|ry|width|height|x|y)="(?:NaN|undefined)"/);assert.equal(host.innerHTML.includes('class="cl-result"'),step.final,`Future result ${p.id}`);frames++;}}
  ctx.renderCatalogLesson(r.steps[0]);const first=host.innerHTML;ctx.renderCatalogLesson(r.steps.at(-1));ctx.renderCatalogLesson(r.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(r),before);
  if(++count%50===0)process.stdout.write(`Rendered ${count}/837 lessons, ${frames} frames\n`);
 }
});
test('JavaScript instrumentation preserves actual uninstrumented V8 results and virtual completion times',()=>{
 const {runTrace}=require('../problems/wasm-picture-trace');for(const entry of data.filter(e=>e.engine==='javascript')){const payload={engine:'javascript',code:entry.code,harness:entry.harness,args:entry.sample,maxEvents:12000};const original=runTrace({...payload,noInstrumentation:true}),traced=runTrace(payload);assert.deepEqual(traced.answer,original.answer,`JavaScript result ${entry.id}`);assert.equal(traced.trace.virtualTime,original.trace.virtualTime,`Timer order ${entry.id}`);}
});
test('scene/table/timer assets are lazy and registered for all new IDs',()=>{
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');for(const asset of['guided-scenes.css','renderer-guided-scenes.js','catalog-lessons.css','renderer-catalog-lessons.js']){const line=html.split('\n').find(l=>l.includes(asset));const ids=new Set(line.match(/data-problem-ids="([^"]+)"/)[1].split(' '));for(const id of Object.keys(lessons))assert.ok(ids.has(id),`${asset} ${id}`);}
 const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-guided-scenes.js'),'utf8'),ctx);const p=lessons[2627],r=p.builder(p.defaultInput),v=r.steps.find(s=>s.catalogLessonView.locals.pendingTimers?.length)?.catalogLessonView;assert.ok(v);assert.match(ctx.renderGuidedScene(v,'vi'),/Timer timeline/);
});
