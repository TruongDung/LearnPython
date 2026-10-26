const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {test}=require('node:test');
const problem=require('../problems').SUPPORTED[753];
const source=fs.readFileSync(require.resolve('../public/renderer-cracking-safe-753.js'),'utf8');
function renderer(width=550){
 const host={innerHTML:'',clientWidth:width};
 const context={lang:'vi',$:()=>host};vm.createContext(context);vm.runInContext(source,context);
 return {host,context};
}
const inputs=[];
for(let n=1;n<=4;n++)for(let k=1;k<=10;k++)if(k**n<=16)inputs.push([n,k]);

test('753 every supported input produces a shortest sequence covering exactly all passwords',()=>{
 const {context}=renderer();
 for(const [n,k]of inputs){
  const run=problem.builder([n,k]);
  assert.equal(run.answer.length,k**n+n-1);
  const final=run.steps.at(-1);
  const base=context.cs753PictureModel(final);
  assert.equal(base.verified.length,k**n);
  assert.equal(new Set(base.verified.map(w=>w.word)).size,k**n);
  for(const edge of base.state.graph.edges){
   const model=context.cs753PictureModel(final,edge.word);
   assert.equal(model.window.word,edge.word);
   assert.equal(model.edge.from,edge.word.slice(0,-1));
   assert.equal(model.edge.to,edge.word.slice(1));
   assert.equal(model.selectedIndices.map(i=>model.digits[i]).join(''),edge.word);
   assert.deepEqual(Array.from(model.selectedIndices),Array.from({length:n},(_,i)=>model.window.index+i));
  }
 }
});

test('753 traversal pictures never show an answer before assembly, and write only on return',()=>{
 const {context,host}=renderer();
 const run=problem.builder([2,2]);
 let previous='';
 for(const step of run.steps){
  const model=context.cs753PictureModel(step),raw=step.crackingSafe753View;
  const post=raw.output.postorderDigits.join('');
  if(post!==previous){
   assert.equal(raw.event,'emit-postorder-digit');
   assert.equal(post,previous+model.edge.digit);
  }
  if(!step.final){assert.equal(model.window,null);assert.equal(model.verified.length,0);}
  context.renderCrackingSafe753View(step);
  if(raw.event==='emit-postorder-digit')assert.match(host.innerHTML,/newest/);
  previous=post;
 }
 assert.equal(run.answer,'01100');
});

test('753 all frames render in both languages at narrow widths without mutating the trace',()=>{
 const {context,host}=renderer(250);
 for(const input of [[1,1],[1,10],[2,2],[2,4],[3,2],[4,1],[4,2]]){
  const run=problem.builder(input),before=JSON.stringify(run);
  for(const language of ['en','vi'])for(const step of run.steps){
   context.lang=language;context.renderCrackingSafe753View(step);
   assert.match(host.innerHTML,/<svg/);
   assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);
   assert.equal((host.innerHTML.match(/data-safe753-word=/g)||[]).length,input[1]**input[0]);
   assert.ok((host.innerHTML.match(/class="safe753-digit /g)||[]).length<=19);
  }
  assert.equal(JSON.stringify(run),before);
 }
});
