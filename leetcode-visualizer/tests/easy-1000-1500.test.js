"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const groups=['1000-1099','1100-1199','1200-1299','1300-1399','1400-1500'];
const lessons=Object.assign({},...groups.map(g=>require('../problems/easy-'+g)));
const run=(id,args)=>lessons[id].builder(JSON.stringify(args)),answer=(id,args)=>run(id,args).answer;
function equal(actual,expected,message){if(typeof expected==='number'){assert.ok(Math.abs(actual-expected)<1e-7,`${message}: ${actual} != ${expected}`);}else assert.deepEqual(actual,expected,message);}
let seed=1000;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
const permutations=a=>a.length?a.flatMap((v,i)=>permutations(a.filter((_,j)=>j!==i)).map(p=>[v,...p])):[[]];
test('all 360 missing lessons are registered; every ID 1 through 1500 has a runnable builder',()=>{
  const {SUPPORTED}=require('../problems');assert.equal(Object.keys(lessons).length,360);assert.deepEqual(groups.map(g=>Object.keys(require('../problems/easy-'+g)).length),[72,75,66,70,77]);
  for(let id=1;id<=1500;id++)assert.equal(typeof SUPPORTED[id]?.builder,'function',`Missing #${id}`);
  for(const p of Object.values(lessons)){assert.equal(SUPPORTED[p.id],p);assert.ok(p.__catalog.teaching.vi.length>20);const r=p.builder(p.defaultInput);equal(r.answer,p.__catalog.expected,`#${p.id}`);assert.ok(r.steps.length);assert.equal(r.steps.filter(s=>s.final).length,1);for(const step of r.steps){const v=step.catalogLessonView;assert.equal(v.trace.truncated,false);assert.equal(v.source,p.code[step.codeLines[0]-1]);assert.ok(v.teaching);}assert.ok(r.steps.at(-1).final);}
});
test('every new frame renders safely in VI/EN, and replay neither mutates snapshots nor leaks future results',()=>{
  const host={innerHTML:'',querySelectorAll:()=>[]},ctx=vm.createContext({lang:'vi',$:()=>host,problemData:{code:[]}});vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-catalog-lessons.js'),'utf8'),ctx);
  for(const p of Object.values(lessons)){const r=p.builder(p.defaultInput),before=JSON.stringify(r);ctx.problemData=p;for(const lang of['vi','en']){ctx.lang=lang;for(const step of r.steps){ctx.renderCatalogLesson(step);assert.match(host.innerHTML,/cl-teaching/);assert.doesNotMatch(host.innerHTML,/NaN|undefined|\[object Object\]|<script|<img/);assert.equal(host.innerHTML.includes('class="cl-result"'),step.final,`Premature answer #${p.id}`);}}ctx.renderCatalogLesson(r.steps[0]);const first=host.innerHTML;ctx.renderCatalogLesson(r.steps.at(-1));ctx.renderCatalogLesson(r.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(r),before);}
});
test('all 360 Python solutions match native CPython answers and statement order',()=>{
  const {spawnSync}=require('node:child_process'),context=require('../problems/catalog-context');
  const cases=Object.values(lessons).map(p=>{const e=p.__catalog;return{code:p.code.join('\n'),method:e.method,args:e.sample,prelude:context+'\n_viz_config=json.loads('+JSON.stringify(JSON.stringify({kinds:e.kinds||[],answerKind:e.answerKind}))+')\n',randomSeed:e.seed??105,maxEvents:e.traceOptions?.maxEvents||6000,failOnTruncate:true,captureAllocations:['TreeNode','ListNode','Node'],stateClasses:['Solution'],objectClasses:['TreeNode','ListNode','Node'],summarizeLocals:e.traceOptions?.summarizeLocals||{}};});
  const program="import json,sys,runpy\np=json.load(sys.stdin);f=runpy.run_path(p['path'])['picture_trace'];out=[]\nfor payload in p['cases']:\n r=json.loads(f(payload));out.append({'answer':r['answer'],'events':[[e['line'],e['scope']] for e in r['events']]})\nprint(json.dumps(out))";
  const python=process.env.PYTHON||path.resolve(__dirname,'../../.venv/Scripts/python.exe');const ref=spawnSync(python,['-X','utf8','-c',program],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),cases}),encoding:'utf8',maxBuffer:40e6});assert.equal(ref.status,0,ref.stderr);
  JSON.parse(ref.stdout).forEach((native,i)=>{const p=Object.values(lessons)[i],r=p.builder(p.defaultInput);equal(r.answer,native.answer,`Native #${p.id}`);const data=([line])=>!/^\s*(?:if|elif|else|while|for|return|assert|def|class|import|from|break|continue|nonlocal|@)\b/.test(p.code[line-1]);assert.deepEqual(r.steps.map(s=>[s.catalogLessonView.line,s.catalogLessonView.frames.at(-1).name]).filter(data),native.events.filter(data),`Native order #${p.id}`);});
});
test('lazy manifest covers every new lesson, including the 256-bin statistics input exception',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');for(const asset of['catalog-lessons.css','renderer-catalog-lessons.js']){const tag=html.split('\n').find(line=>line.includes(asset));const ids=new Set(tag.match(/data-problem-ids="([^"]+)"/)[1].split(' '));for(const id of Object.keys(lessons))assert.ok(ids.has(id),`${asset} #${id}`);}
  assert.equal(lessons[1093].__catalog.maxArrayLength,256);assert.throws(()=>run(1093,[Array(257).fill(1)]),/256/);assert.throws(()=>run(1218,[Array(81).fill(1),1]),/80/);
});
