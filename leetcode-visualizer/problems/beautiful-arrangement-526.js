'use strict';
const base=require('./bitmask')[526],CODE=base.code;
const bi=(vi,en)=>({vi,en});
function parse(input){
  const n=Array.isArray(input)&&input.length===1?input[0]:input;
  if(!Number.isInteger(n)||n<1||n>15)throw new Error('526: n là số nguyên từ 1 đến 15. / n must be an integer from 1 to 15.');
  return n;
}
function buildSteps(input){
  const n=parse(input),detailed=n<=5,steps=[],path=[],solutions=[],memo=new Map();
  const outer={n};let found=0,backtracked=null;
  function fast(position,used){
    if(position>n)return 1;if(memo.has(used))return memo.get(used);
    let total=0;
    for(let num=1;num<=n;num++){const bit=1<<(num-1);if(!(used&bit)&&(position%num===0||num%position===0))total+=fast(position+1,used|bit);}
    memo.set(used,total);return total;
  }
  function emit(line,locals,phase,event,pending=null,final=false){
    if(!detailed&&steps.length>=320&&!final)return;
    const pythonLocals=Object.fromEntries(['n','position','used','total','num','bit'].map(key=>[key,locals[key]??null]));
    const num=locals.num??null,position=locals.position??1,used=locals.used??0;
    const check=num!==null&&position<=n?{used:Boolean(used&(1<<(num-1))),numRemainder:num%position,positionRemainder:position%num,valid:!(used&(1<<(num-1)))&&(num%position===0||position%num===0)}:null;
    steps.push({title:bi(`L${line} · ${event.vi}`,`L${line} · ${event.en}`),note:bi('',''),codeLines:[line],codeBlock:1,debugLine:line,final,arr:[],highlight:[],mark:[],
      vars:Object.entries(pythonLocals).filter(([,value])=>value!==null).map(([name,value])=>({name,value})),
      arrangement526PictureView:{n,line,source:CODE[line-1],timing:final?'return':'before',functionName:locals===outer?'countArrangement':'backtrack',pythonLocals,
        phase,event,pending,detailed,position,used,candidate:num,check,path:[...path],found,backtracked:backtracked?{...backtracked}:null,
        solutions:solutions.map(solution=>[...solution]),answer:final?found:null,
      }});backtracked=null;
  }
  emit(3,outer,'init',bi('Tạo DFS','Define DFS'));
  emit(12,outer,'init',bi('Bắt đầu ô 1','Start at slot 1'),{target:'backtrack(1, 0)',after:null,kind:'call'});
  function backtrack(position,used){
    if(!detailed&&steps.length>=320){const count=fast(position,used);found+=count;return count;}
    const locals={n,position,used};
    emit(4,locals,'enter',bi('Đã điền hết ô?','All slots filled?'),{target:'position > n',after:position>n,kind:'condition'});
    if(position>n){
      emit(5,locals,'solution',bi('✓ Một cách xếp đẹp','✓ One beautiful arrangement'),{target:'return',after:1,kind:'return'});
      found++;if(solutions.length<8)solutions.push([...path]);return 1;
    }
    emit(6,locals,'init-total',bi('Đếm nhánh này từ 0','Start this branch at 0'),{target:'total',before:null,after:0});locals.total=0;
    for(let num=1;num<=n;num++){
      emit(7,locals,backtracked?'backtrack':'loop',bi('Thử số tiếp theo','Try the next number'),{target:'num',before:locals.num??null,after:num});locals.num=num;
      const bit=1<<(num-1);
      emit(8,locals,'bit',bi(`Tạo bit cho số ${num}`,`Build a bit for number ${num}`),{target:'bit',before:locals.bit??null,after:bit});locals.bit=bit;
      const valid=!(used&bit)&&(position%num===0||num%position===0);
      emit(9,locals,'check',bi('Chưa dùng và chia hết?','Unused and divisible?'),{target:'if',after:valid,kind:'condition'});
      if(valid){
        emit(10,locals,'place',bi(`Đặt ${num} vào ô ${position}`,`Place ${num} in slot ${position}`),{target:'total',before:locals.total,after:null,formula:`${locals.total} + backtrack(${position+1}, ${used|bit})`,kind:'call'});
        path.push(num);const count=backtrack(position+1,used|bit);path.pop();locals.total+=count;
        backtracked={position,num,count};
      }
    }
    emit(7,locals,backtracked?'backtrack':'loop-end',bi('Đã thử hết số','All numbers tried'));
    emit(11,locals,'return',bi(`Trả ${locals.total} cách`,`Return ${locals.total} ways`),{target:'return',after:locals.total,kind:'return'});
    return locals.total;
  }
  const answer=backtrack(1,0);
  if(!solutions.length)solutions.push(Array.from({length:n},(_,i)=>i+1));
  emit(12,outer,'done',bi(`Có ${answer} cách xếp`,`There are ${answer} arrangements`),{target:'return',after:answer,kind:'return'},true);
  return {original:[n],answer,solutions,steps};
}
module.exports={526:{...base,builder:buildSteps,defaultInput:[3],maxInput:15,debugMode:'line',liveArgs:input=>[parse(input)],
  approach:[bi('Mỗi ô một số · mỗi số chỉ dùng một lần.','One number per slot · use each number once.'),bi('✓ nếu số chia hết cho vị trí, hoặc vị trí chia hết cho số.','✓ if the number divides the position, or the position divides the number.'),bi('Điền ô → đi sâu → quay lui → thử số khác.','Fill a slot → go deeper → backtrack → try another number.')],
}};
