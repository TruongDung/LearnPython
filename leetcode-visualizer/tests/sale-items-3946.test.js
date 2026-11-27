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
test('3946 executes both examples and validates the small teaching domain',()=>{
 assert.equal(p.debugMode,'line-by-line');assert.equal(p.sourceLanguage,'python');
 for(const[items,budget,expected]of[[[[6,2],[2,6],[3,4]],9,4],[[[2,4],[3,2],[4,1],[6,4],[12,4]],8,10],[[[2,1],[4,8]],4,5],[[[2,2],[2,2]],4,4],[[[3,7]],6,0],[[[3,7]],0,0]]){const r=solve(items,budget);assert.equal(r.answer,expected);}
 for(const args of[[[],2],[[[0,2]],2],[[[2,0]],2],[[[2,2,3]],2],[[[2,3]],61],[[[2,3]],-1],[[[2,3]],1.5],[Array(11).fill([2,1]),2]])assert.throws(()=>solve(...args),/#3946/);
});

test('3946 user-provided source matches independent exhaustive purchase counts',()=>{
 const {spawnSync}=require('node:child_process'),path=require('node:path');
 const cases=[],types=[[[1,1]],[[2,3]],[[1,2],[2,1]],[[2,1],[4,5]],[[2,2],[2,2]],[[2,2],[3,1],[6,3]],[[1,3],[2,2],[4,1]],[[2,1],[4,1],[8,1]],[[3,3],[6,2],[12,1],[2,3]]];
 for(const items of types)for(let budget=0;budget<=10;budget++)cases.push([items,budget]);
 let seed=3946;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
 for(let i=0;i<100;i++)cases.push([Array.from({length:1+random(4)},()=>[1+random(8),1+random(5)]),random(11)]);
 const local=path.resolve(__dirname,'../.viz-python',process.platform==='win32'?'Scripts/python.exe':'bin/python');
 const python=process.env.LEETCODE_PYTHON_NATIVE||(fs.existsSync(local)?local:process.platform==='win32'?'python':'python3');
 const script='import sys,json\np=json.load(sys.stdin)\nscope={}\nexec(p["code"],scope)\nprint(json.dumps([scope["Solution"]().maximumSaleItems(*args) for args in p["cases"]]))';
 const result=spawnSync(python,['-c',script],{input:JSON.stringify({code:p.code.join('\n'),cases}),encoding:'utf8',windowsHide:true,timeout:30000});
 assert.equal(result.status,0,result.stderr||result.error?.message);const answers=JSON.parse(result.stdout);
 cases.forEach(([items,budget],i)=>assert.equal(answers[i],enumerate(items,budget),JSON.stringify({items,budget})));
 process.stdout.write(`Verified ${cases.length} independent purchase enumerations\n`);
});

test('3946 traces the exact sieve, cheapest baseline and descending DP updates',()=>{
 assert.ok(p.code.includes('        m = 1500'));
 assert.ok(p.code.includes('        dp = [b // mn for b in range(budget + 1)]'));
 assert.equal(p.code.at(-1),'        return dp[budget]');
 const r=solve([[6,2],[2,6],[3,4]],9),sieveLine=line('gain[f] = sum(cnt[j] for j in range(f, m + 1, f))');
 const frequencies=new Map([[6,1],[2,1],[3,1]]),gainValues=new Map();let visits=0,previousBudget=null;
 for(const step of r.steps){const v=step.catalogLessonView,x=v.locals;assert.equal(v.source,p.code[v.line-1]);assert.equal(v.result,step.final?r.answer:null);assert.equal(v.trace.truncated,false);
  for(const name of['cnt','gain'])if(x[name]){assert.equal(x[name].__sparse__,true);assert.equal(x[name].length,1501);assert.ok(x[name].entries.every(([,value])=>value!==0));}
  if(v.line===sieveLine){visits++;const expected=[...frequencies].reduce((sum,[factor,count])=>sum+(factor%x.f===0?count:0),0);assert.equal(new Map(x.gain.entries).get(x.f)||0,expected);if(expected)gainValues.set(x.f,expected);}
  if(v.line===line('dp = [b // mn for b in range(budget + 1)]'))assert.deepEqual(x.dp,Array.from({length:10},(_,b)=>Math.floor(b/2)));
  if(v.line===line('g = gain[f]'))previousBudget=null;
  if(v.line===line('dp[b] = max(dp[b], dp[b - p] + g)')){const old=v.oldValues.dp||x.dp;assert.equal(x.dp[x.b],Math.max(old[x.b],old[x.b-x.p]+x.g));assert.ok(previousBudget===null||previousBudget>x.b);previousBudget=x.b;}
 }
 assert.equal(visits,1500);assert.deepEqual(r.steps.at(-1).catalogLessonView.locals.gain.entries,[...gainValues]);assert.equal(r.steps.filter(s=>s.final).length,1);
});

test('3946 renders count, multiples, baseline and DP pictures in VI/US with reversible playback',()=>{
 const host={innerHTML:'',querySelectorAll:()=>[]},ctx=vm.createContext({lang:'vi',$:()=>host,problemData:p});
 for(const file of['renderer-sale-items-3946.js','renderer-illustrated-lessons.js','renderer-guided-scenes.js','renderer-catalog-lessons.js'])vm.runInContext(fs.readFileSync(require.resolve('../public/'+file),'utf8'),ctx);
 for(const[items,budget]of[[[[6,2],[2,6],[3,4]],9],[[[2,4],[3,2],[4,1],[6,4],[12,4]],8],[[[2,1],[4,8]],4],[[[1,3]],0]]){
  const r=solve(items,budget),before=JSON.stringify(r);
  for(const language of['vi','en']){ctx.lang=language;for(const step of r.steps){ctx.renderCatalogLesson(step);assert.match(host.innerHTML,/data-guided-id="3946"/);assert.doesNotMatch(host.innerHTML,/class="iv-debug"|class="iv-source"|data-code-line=/);assert.match(host.innerHTML,/<svg class="si3946-box/);assert.equal(host.innerHTML.includes('class="cl-result"'),step.final);assert.equal(host.innerHTML.includes('data-sale-result='),step.final);assert.doesNotMatch(host.innerHTML,/\[object Object\]|NaN|<script|<img/);}}
  ctx.renderCatalogLesson(r.steps[0]);const first=host.innerHTML;ctx.renderCatalogLesson(r.steps.at(-1));ctx.renderCatalogLesson(r.steps[0]);assert.equal(host.innerHTML,first);assert.equal(JSON.stringify(r),before);
 }
 ctx.lang='vi';ctx.renderCatalogLesson(solve([[2,1],[4,8]],4).steps.at(-1));assert.match(host.innerHTML,/Kết quả tại đúng ngân sách/);ctx.lang='en';ctx.renderCatalogLesson(solve([[2,1],[4,8]],4).steps.at(-1));assert.match(host.innerHTML,/Result at the requested budget/);
});

test('3946 lazily loads pictures before the shared renderer and uses readable theme palettes',()=>{
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/sale-items-3946.css'),'utf8');
 for(const asset of['renderer-sale-items-3946.js','sale-items-3946.css']){const line=html.split('\n').find(l=>l.includes(asset));assert.match(line,/data-problem-ids="3946"/);}
 assert.ok(html.indexOf('renderer-sale-items-3946.js')<html.indexOf('renderer-illustrated-lessons.js'));assert.match(css,/\[data-theme="light"\] \.si3946/);assert.match(css,/@media\(max-width:600px\)/);for(const name of['--si-fg','--si-card','--si-gold','--si-green'])assert.ok(css.includes(name));
});
