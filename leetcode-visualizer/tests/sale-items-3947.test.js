'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[3947],input=items=>items.map(pair=>pair.join(',')).join(';');
function oracle(items,budget){
 let best=0;
 const choices=items.map(([factor],i)=>items.reduce((n,[f],j)=>n+(i!==j&&f%factor===0?1:0),0));
 function visit(i,left,value){if(i===items.length){best=Math.max(best,value);return;}for(let count=0;count*items[i][1]<=left;count++)visit(i+1,left-count*items[i][1],value+count+Math.min(count,choices[i]));}
 visit(0,budget,0);return best;
}
test('executed greedy source agrees with exhaustive purchase counts, including ordered-pair limits and duplicate factors',()=>{
 const cases=[];
 function enumerate(items,n){if(items.length===n){for(let b=1;b<=8;b++)cases.push({items,budget:b});return;}for(let f=1;f<=n;f++)for(let price=1;price<=3;price++)enumerate([...items,[f,price]],n);}
 for(let n=1;n<=3;n++)enumerate([],n);
 let seed=3947;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
 for(let i=0;i<400;i++)cases.push({items:Array.from({length:4},()=>[1+random(4),1+random(5)]),budget:1+random(12)});
 const script='import sys,json\np=json.load(sys.stdin)\nscope={}\nexec(p["source"],scope)\nsolve=scope["Solution"]().maximumSaleItems\nprint(json.dumps([solve(c["items"],c["budget"]) for c in p["cases"]]))';
 const local=path.resolve(__dirname,'../.viz-python',process.platform==='win32'?'Scripts/python.exe':'bin/python'),python=fs.existsSync(local)?local:process.platform==='win32'?'python':'python3';
 const result=spawnSync(python,['-c',script],{input:JSON.stringify({source:p.code.join('\n'),cases}),encoding:'utf8',windowsHide:true,timeout:30000,maxBuffer:2*1024*1024});assert.equal(result.status,0,result.stderr);const answers=JSON.parse(result.stdout);
 cases.forEach((c,i)=>assert.equal(answers[i],oracle(c.items,c.budget),JSON.stringify(c)));
 process.stdout.write(`Verified ${cases.length} independent sale optima\n`);
});
test('real Python snapshots distinguish selecting, counting copies and deducting payment; all pictures rewind exactly',()=>{
 const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-sale-items-3947.js'),'utf8'),ctx);
 for(const[items,budget,expected]of[
  [[[1,6],[2,4],[3,5]],19,5],[[[2,8],[1,10],[6,6],[4,12],[5,20],[5,17]],35,7],
  [[[1,3]],8,2],[[[1,9],[2,8]],1,0],[[[1,1],[1,1],[1,1]],10,16],
  [[[1,4],[2,2]],8,4],[[[1,3],[2,2],[3,8]],3,2],[[[1,1]],1e9,1e9]
 ]){
  const run=p.builder(input(items),{budget}),saved=JSON.stringify(run);assert.equal(run.answer,expected);assert.equal(run.steps.filter(s=>s.final).length,1);
  for(const step of run.steps){
   const v=step.catalogLessonView,x=v.locals,s=v.sale3947;assert.equal(v.source,p.code[v.line-1]);assert.equal(v.result,v.final?expected:null);assert.equal(v.trace.truncated,false);
   let paid=0,free=0,spent=0;const pairs=new Set();
   for(const batch of s.batches){paid+=batch.count;spent+=batch.count*batch.price;assert.equal(batch.price,items[batch.index][1]);assert.ok(batch.gifts.length<=batch.count);for(const j of batch.gifts){assert.notEqual(j,batch.index);assert.equal(items[j][0]%items[batch.index][0],0);const key=batch.index+','+j;assert.ok(!pairs.has(key));pairs.add(key);free++;}}
   if(x.total!==undefined)assert.equal(paid+free,x.total);
   assert.equal(spent,budget-x.budget+(s.pending?s.batches.at(-1).count*s.batches.at(-1).price:0));
   for(const language of['vi','en']){const html=ctx.renderSaleItems3947(v,language);assert.match(html,/data-guided-id="3947"/);assert.doesNotMatch(html,/NaN|undefined|\[object Object\]|iv-debug|iv-source|data-code-line/);assert.equal(html.includes('data-sale-result'),v.final);assert.equal((html.match(/data-gift-pair=/g)||[]).length,free);assert.equal(ctx.renderSaleItems3947(v,language),html);}
  }
  const final=run.steps.at(-1).catalogLessonView;assert.equal(final.locals.budget,budget-final.sale3947.batches.reduce((n,b)=>n+b.count*b.price,0));assert.equal(JSON.stringify(run),saved);
  const first=ctx.renderSaleItems3947(run.steps[0].catalogLessonView,'vi');ctx.renderSaleItems3947(final,'vi');assert.equal(ctx.renderSaleItems3947(run.steps[0].catalogLessonView,'vi'),first);
 }
 const run=p.builder(p.defaultInput,{budget:19}),selected=run.steps.find(s=>s.catalogLessonView.line===22&&s.catalogLessonView.locals.index===0).catalogLessonView,counted=run.steps.find(s=>s.catalogLessonView.line===23&&s.catalogLessonView.locals.index===0).catalogLessonView,paid=run.steps.find(s=>s.catalogLessonView.line===24&&s.catalogLessonView.locals.index===0).catalogLessonView;
 assert.equal(selected.locals.budget,19);assert.equal(selected.locals.total,0);assert.equal(selected.sale3947.batches.length,0);assert.equal(counted.locals.total,4);assert.equal(counted.locals.budget,19);assert.equal(counted.sale3947.pending,true);assert.equal(paid.locals.budget,7);assert.equal(paid.sale3947.pending,false);
 assert.equal(p.debugMode,'line-by-line');
 for(const[raw,budget]of[['',10],['1,2,3',10],['0,2',10],['2,2',10],['1,0',10],['1,2',0],['1,2',1e9+1],[Array(25).fill('1,1').join(';'),10]])assert.throws(()=>p.builder(raw,{budget}));
});
test('24-type billion-budget replay stays within a serverless response budget',()=>{
 const items=Array.from({length:24},()=>[1,1]),run=p.builder(input(items),{budget:1e9});assert.equal(run.answer,1e9+24*23);assert.ok(run.steps.length<1000);assert.ok(JSON.stringify(run).length<4.5*1024*1024);
 const v=run.steps.at(-1).catalogLessonView;assert.equal(v.locals.budget,0);assert.equal(v.sale3947.batches.reduce((n,b)=>n+b.gifts.length,0),24*23);
});
test('lazy assets register the dedicated scene before the shared dispatcher and support both themes',()=>{
 const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');
 for(const name of['sale-items-3947.css','renderer-sale-items-3947.js','illustrated-lessons.css','renderer-illustrated-lessons.js','guided-scenes.css','renderer-guided-scenes.js','catalog-lessons.css','renderer-catalog-lessons.js']){const line=html.split('\n').find(line=>line.includes(name+'?'));assert.ok(line,name);assert.ok(line.match(/data-problem-ids="([^"]+)"/)[1].split(' ').includes('3947'),name);}
 assert.ok(html.indexOf('renderer-sale-items-3947.js')<html.indexOf('renderer-illustrated-lessons.js'));
 const css=fs.readFileSync(require.resolve('../public/sale-items-3947.css'),'utf8');assert.match(css,/\[data-theme="light"\]/);assert.match(css,/@media\(max-width:600px\)/);
});
