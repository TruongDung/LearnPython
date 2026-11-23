'use strict';
const base=require('./monotonic-stack')[1526],bi=(vi,en)=>({vi,en});
function parse(input,visual=true) {
  let target=input;
  if(typeof input==='string')try{const raw=input.trim();target=raw.startsWith('[')?JSON.parse(raw):raw.split(',').map(part=>/^\d+$/.test(part.trim())?Number(part):NaN);}catch(_){target=null;}
  const length=visual?10:100000,high=visual?12:100000;
  if(!Array.isArray(target)||!target.length||target.length>length||!Array.from(target).every(value=>typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=high))throw new RangeError(`1526: target cần 1–${length} số nguyên 0…${high} / use 1–${length} integers in 0…${high}.`);
  return [...target];
}
function builder(input) {
  const target=parse(input),contributions=target.map(()=>null),plan=[],steps=[];
  for(let start=0;start<target.length;start++)for(let level=(target[start-1]??0)+1;level<=target[start];level++){
    let end=start;while(end+1<target.length&&target[end+1]>=level)end++;
    plan.push({id:plan.length,start,end,level});
  }
  let answer,i,current=0;
  function emit(line,phase,condition=null,change=null){
    const locals={target:[...target],answer};if(i!==undefined)locals.i=i;
    const previous=current===0?0:target[current-1],delta=target[current]-previous;
    const labels={init:['Tạo các lớp đầu tiên','Create the first layers'],choose:['Chọn cột tiếp','Choose next column'],check:['Cột này có cao hơn?','Is this column taller?'],add:['Mở thêm lớp mới','Start new layers'],end:['Đã duyệt hết target','End of target'],done:['Số phép tăng tối thiểu','Minimum increments']};
    steps.push({title:bi(`Dòng ${line} · ${labels[phase][0]}`,`Line ${line} · ${labels[phase][1]}`),note:bi('',''),arr:[],highlight:[],mark:[],codeLines:[line],final:line===7,
      vars:Object.entries(locals).map(([name,value])=>({name,value})),
      incrementLayers1526View:{target:[...target],contributions:[...contributions],operations:plan.map(operation=>({...operation,known:contributions[operation.start]!==null})),answer,current,previous,delta,line,source:base.code[line-1].trim(),phase,condition,change,locals,final:line===7},
    });
  }
  answer=target[0];contributions[0]=target[0];emit(3,'init',null,{before:0,added:target[0],after:answer});
  for(let index=1;index<target.length;index++){
    i=index;current=i;emit(4,'choose');
    const rise=target[i]>target[i-1];if(!rise)contributions[i]=0;emit(5,'check',rise);
    if(rise){const before=answer,added=target[i]-target[i-1];answer+=added;contributions[i]=added;emit(6,'add',null,{before,added,after:answer});}
  }
  emit(4,'end',false);emit(7,'done');return {original:target,answer,steps};
}
module.exports={1526:{...base,builder,debugMode:'line-by-line',inputKind:'string',inputLabel:bi('target · 1–10 số nguyên 0…12','target · 1–10 integers in 0…12'),
  approach:[bi('Lớp đã mở có thể đi tiếp sang phải. Chỉ phần cao hơn cột trước cần phép +1 mới.','Existing layers can extend to the right. Only height above the previous column needs new +1 operations.')],
  liveArgs:input=>[parse(input,false)],
}};
