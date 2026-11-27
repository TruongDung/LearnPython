"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../problems').SUPPORTED[3946];
const solve=(items,budget)=>p.builder(JSON.stringify([items,budget]));
const line=text=>p.code.findIndex(s=>s.trim()===text)+1;

test('3946 runs from the bundled WebAssembly runtime without a native Python installation',()=>{
 const {spawnSync}=require('node:child_process'),path=require('node:path'),os=require('node:os');
 const source=`
  const assert=require('node:assert/strict');
  const Module=require('node:module'),resolve=Module._resolveFilename;
  Module._resolveFilename=function(request,...args){
   if(request.includes('picture-native-worker'))throw new Error('Native Python is unavailable in this deployment');
   return resolve.call(this,request,...args);
  };
  const p=require(${JSON.stringify(require.resolve('../problems'))}).SUPPORTED[3946];
  assert.equal(p.__catalog.engine,'wasm');assert.equal(p.__catalog.prelude,'');
  const first=p.builder(p.defaultInput);
  const second=p.builder(JSON.stringify([[[2,4],[3,2],[4,1],[6,4],[12,4]],8]));
  assert.equal(first.answer,4);assert.equal(second.answer,10);
  assert.equal(first.steps.at(-1).catalogLessonView.trace.truncated,false);
  assert.equal(second.steps.at(-1).catalogLessonView.trace.truncated,false);
  console.log(JSON.stringify({answers:[first.answer,second.answer],steps:first.steps.length}));
 `;
 const result=spawnSync(process.execPath,['-e',source],{encoding:'utf8',windowsHide:true,timeout:30000,env:{...process.env,LEETCODE_PYTHON_NATIVE:path.join(os.tmpdir(),'unavailable-sale-3946-python')}});
 assert.equal(result.status,0,result.stderr||result.error?.message);assert.deepEqual(JSON.parse(result.stdout).answers,[4,10]);
});

function enumerate(items,budget){
 let best=0;
 function visit(i,left,paid){
  if(i===items.length){let count=paid.reduce((a,b)=>a+b,0);for(let a=0;a<items.length;a++)if(paid[a])for(let b=0;b<items.length;b++)if(a!==b&&items[b][0]%items[a][0]===0)count++;best=Math.max(best,count);return;}
  for(let copies=0;copies*items[i][1]<=left;copies++)visit(i+1,left-copies*items[i][1],[...paid,copies]);
 }
 visit(0,budget,[]);return best;
}
function checkCart(result,items,budget){
 const x=result.steps.at(-1).catalogLessonView.locals;
 const paid=x.paid_counts,free=x.free_counts;assert.equal(paid.length,items.length);assert.equal(free.length,items.length);
 assert.ok(paid.every(n=>Number.isInteger(n)&&n>=0));const expected=items.map((_,b)=>items.reduce((n,[factor],a)=>n+(a!==b&&paid[a]>0&&items[b][0]%factor===0?1:0),0));assert.deepEqual(free,expected);
 const spent=paid.reduce((cost,count,i)=>cost+count*items[i][1],0);assert.equal(x.spent,spent);assert.ok(spent<=budget);assert.equal(x.remaining,budget-spent);assert.equal(paid.reduce((a,b)=>a+b,0)+free.reduce((a,b)=>a+b,0),result.answer);
}

test('3946 executes both examples and validates the small teaching domain',()=>{
 assert.equal(p.debugMode,'line-by-line');assert.equal(p.sourceLanguage,'python');
 for(const[items,budget,expected]of[[[[6,2],[2,6],[3,4]],9,4],[[[2,4],[3,2],[4,1],[6,4],[12,4]],8,10],[[[2,1],[4,8]],4,5],[[[2,2],[2,2]],4,4],[[[3,7]],6,0],[[[3,7]],0,0]]){const r=solve(items,budget);assert.equal(r.answer,expected);checkCart(r,items,budget);}
 for(const args of[[[],2],[[[0,2]],2],[[[2,0]],2],[[[2,2,3]],2],[[[2,3]],61],[[[2,3]],-1],[[[2,3]],1.5],[Array(11).fill([2,1]),2]])assert.throws(()=>solve(...args),/#3946/);
});

test('3946 matches independent exhaustive purchase counts, including duplicate factors and repeated buys',()=>{
 let count=0;
 const cases=[[[1,1]],[[2,3]],[[1,2],[2,1]],[[2,1],[4,5]],[[2,2],[2,2]],[[2,2],[3,1],[6,3]],[[1,3],[2,2],[4,1]],[[2,1],[4,1],[8,1]],[[3,3],[6,2],[12,1],[2,3]]];
 for(const items of cases)for(let budget=0;budget<=10;budget++){const result=solve(items,budget);assert.equal(result.answer,enumerate(items,budget),JSON.stringify({items,budget}));checkCart(result,items,budget);count++;}
 let seed=3946;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
 for(let i=0;i<100;i++){const items=Array.from({length:1+random(4)},()=>[1+random(8),1+random(5)]),budget=random(11);const result=solve(items,budget);assert.equal(result.answer,enumerate(items,budget),JSON.stringify({items,budget}));checkCart(result,items,budget);count++;}
 process.stdout.write(`Verified ${count} independent purchase enumerations\n`);
});

test('3946 snapshots show gift discovery, descending 0/1 updates, and executed cart reconstruction',()=>{
 const r=solve([[6,2],[2,6],[3,4]],9);let previous=null;const capacities=new Map();
 for(const step of r.steps){const v=step.catalogLessonView,x=v.locals;assert.equal(v.source,p.code[v.line-1]);assert.equal(v.result,step.final?r.answer:null);assert.equal(v.trace.truncated,false);
  if(v.line===line('free.append(other)')){assert.notEqual(x.other,x.item);assert.equal(r.original[0][x.other][0]%x.factor,0);assert.ok(x.free.includes(x.other));}
  if(v.line===line('dp[capacity] = candidate')){assert.equal(x.dp[x.capacity],x.base+x.gain[x.item]);assert.ok(v.oldValues.dp[x.capacity]<x.dp[x.capacity]);const a=capacities.get(x.item)||[];a.push(x.capacity);capacities.set(x.item,a);}
  if(v.line===line('paths[capacity] = paths[capacity - price] + [item]'))assert.equal(new Set(x.paths[x.capacity]).size,x.paths[x.capacity].length);
  if(v.line===line('free_counts[other] += 1'))assert.equal(x.free_counts[x.other],previous.locals.free_counts[x.other]+1);
  previous=v;
 }
 for(const a of capacities.values())assert.ok(a.every((v,i)=>!i||a[i-1]>v));
 assert.deepEqual(r.steps.at(-1).catalogLessonView.locals.paid_counts,[2,0,1]);assert.deepEqual(r.steps.at(-1).catalogLessonView.locals.free_counts,[1,0,0]);
 assert.equal(r.steps.filter(s=>s.final).length,1);
});

test('3946 renders actual pictures in VI/US, reversible line playback, and no future cart',()=>{
 const host={innerHTML:'',querySelectorAll:()=>[]},ctx=vm.createContext({lang:'vi',$:()=>host,problemData:p});
 for(const file of['renderer-sale-items-3946.js','renderer-illustrated-lessons.js','renderer-guided-scenes.js','renderer-catalog-lessons.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);
 for(const[items,budget]of[[[[6,2],[2,6],[3,4]],9],[[[2,4],[3,2],[4,1],[6,4],[12,4]],8],[[[2,1],[4,8]],4],[[[1,3]],0]]){
  const r=solve(items,budget),before=JSON.stringify(r);
  for(const language of['vi','en']){ctx.lang=language;for(const step of r.steps){ctx.renderCatalogLesson(step);assert.match(host.innerHTML,/data-guided-id="3946"/);assert.match(host.innerHTML,new RegExp(`data-code-line="${step.codeLines[0]}" aria-current="step"`));assert.match(host.innerHTML,/<svg class="si3946-box/);assert.equal(host.innerHTML.includes('class="cl-result"'),step.final);assert.equal(host.innerHTML.includes('data-sale-cart="final"'),step.final);assert.doesNotMatch(host.innerHTML,/\[object Object\]|NaN|<script|<img/);}}
  ctx.renderCatalogLesson(r.steps[0]);const first=host.innerHTML;ctx.renderCatalogLesson(r.steps.at(-1));ctx.renderCatalogLesson(r.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(r),before);
 }
 ctx.lang='vi';ctx.renderCatalogLesson(solve([[2,1],[4,8]],4).steps.at(-1));assert.match(host.innerHTML,/Giỏ hàng/);ctx.lang='en';ctx.renderCatalogLesson(solve([[2,1],[4,8]],4).steps.at(-1));assert.match(host.innerHTML,/Shopping cart/);
});

test('3946 lazily loads pictures before the shared renderer and uses readable theme palettes',()=>{
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/sale-items-3946.css'),'utf8');
 for(const asset of['renderer-sale-items-3946.js','sale-items-3946.css']){const line=html.split('\n').find(l=>l.includes(asset));assert.match(line,/data-problem-ids="3946"/);}
 assert.ok(html.indexOf('renderer-sale-items-3946.js')<html.indexOf('renderer-illustrated-lessons.js'));assert.match(css,/\[data-theme="light"\] \.si3946/);assert.match(css,/@media\(max-width:600px\)/);for(const name of['--si-fg','--si-card','--si-gold','--si-green'])assert.ok(css.includes(name));
});
