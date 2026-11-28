'use strict';
const {parseArguments}=require('./catalog-lesson');
const numeric=value=>value==='∞'?Infinity:value;

// Keep the submitted source unchanged. Attach paths using its executed costs;
// ties follow min's first argument (skip). Both updates read the old paths.
function attachDeletionReplay(lesson){
 const execute=lesson.builder;
 lesson.builder=function(input){
  const [nums]=parseArguments(input,lesson.__catalog);
  if(!Array.isArray(nums)||nums.length<2||nums.length>80||nums.some(n=>!Number.isInteger(n)||Math.abs(n)>1e9))throw new Error('Nhập 2–80 số nguyên trong [-10⁹, 10⁹] / Enter 2–80 integers in [-10⁹, 10⁹].');
  const run=execute(input);
  let even=0,odd=Infinity,evenIndices=[],oddIndices=null,processed=0,before=null;
  for(const step of run.steps){
   const v=step.catalogLessonView,x=v.locals,source=v.source.trim();
   if(source==='x = dravolqeni[i]')before={even:x.even,odd:x.odd};
   const committed=source==='even, odd = (';
   if(committed){
    const nextEven=numeric(x.even),nextOdd=numeric(x.odd);
    const newEven=nextEven===even?[...evenIndices]:[...oddIndices,x.i];
    const newOdd=nextOdd===odd?(oddIndices&&[...oddIndices]):[...evenIndices,x.i];
    evenIndices=newEven;oddIndices=newOdd;even=nextEven;odd=nextOdd;processed=x.i;
   }
   v.parity4123={processed,evenIndices:[...evenIndices],oddIndices:oddIndices&&[...oddIndices],before:before&&{...before},committed};
  }
  return run;
 };
 return lesson;
}
module.exports={attachDeletionReplay};
