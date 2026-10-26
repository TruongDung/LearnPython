const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {test}=require('node:test');
const problem=require('../problems').SUPPORTED[2162];
function renderer(width=550){
 const host={innerHTML:'',clientWidth:width},context={lang:'vi',$:()=>host};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-cooking-time-2162.js'),'utf8'),context);
 return {host,context};
}
const cases=['1,2,1,600','0,1,2,76','5,10,10,5','0,1,1,6039','0,100000,100000,3599','0,1,1,60'];
test('2162 picture replay matches every key event and the entered microwave display',()=>{
 const {context}=renderer();
 for(const input of cases){
  const run=problem.builder(input),step=run.steps.at(-1);
  const best=context.cooking2162PictureModel(step);
  assert.equal(best.plan.cost,run.answer);
  step.cookingTime2162View.plans.forEach((plan,planIndex)=>{
   if(!plan.valid)return;
   plan.events.forEach((event,pressIndex)=>{
    const model=context.cooking2162PictureModel(step,planIndex,pressIndex);
    assert.equal(model.finger,event.after);
    assert.equal(model.running,event.total);
    assert.equal(model.typed,plan.digits.slice(0,pressIndex+1));
    assert.equal(Number(model.display.replace(':','')),Number(model.typed));
    assert.equal(event.moveCharge,event.before===event.digit?0:step.cookingTime2162View.moveCost);
    if(pressIndex===plan.events.length-1){
     const [m,s]=model.display.split(':').map(Number);
     assert.equal(m*60+s,step.cookingTime2162View.targetSeconds);
    }
   });
  });
 }
});
test('2162 repeated presses keep the finger still and charge only pushing',()=>{
 const {host,context}=renderer();
 const step=problem.builder('1,2,1,600').steps.at(-1);
 const repeated=context.cooking2162PictureModel(step,0,2);
 assert.equal(repeated.event.moved,false);assert.equal(repeated.event.moveCharge,0);
 context.renderCookingTime2162View(step);
 host._micro2162Plan=0;host._micro2162Press=2;
 context.renderCookingTime2162View(step);
 assert.doesNotMatch(host.innerHTML,/class="micro2162-movement"/);
 assert.match(host.innerHTML,/01:00/);
 host._micro2162Press=1;context.renderCookingTime2162View(step);
 assert.match(host.innerHTML,/class="micro2162-movement"/);
});
test('2162 every picture renders in both languages without leaking unfinished costs or mutating snapshots',()=>{
 const {host,context}=renderer(250);
 for(const input of cases){
  const run=problem.builder(input),before=JSON.stringify(run);
  for(const language of ['en','vi'])for(const step of run.steps){
   context.lang=language;context.renderCookingTime2162View(step);
   assert.match(host.innerHTML,/<svg/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);
   assert.equal((host.innerHTML.match(/data-digit=/g)||[]).length,10);
   assert.ok((host.innerHTML.match(/data-micro2162-press=/g)||[]).length<=4);
  }
  assert.equal(JSON.stringify(run),before);
 }
});
