const base=require('./bitmask')[1342];
const bi=(vi,en)=>({vi,en});
const CODE=[...base.code];
function parse1342(input){
 const raw=Array.isArray(input)?input[0]:input,num=Number(raw);
 if(Array.isArray(input)&&input.length!==1||raw===null||raw===undefined||typeof raw==='string'&&!raw.trim()||!Number.isInteger(num)||num<0||num>1000000)
  throw new RangeError('1342: num là số nguyên từ 0 đến 1 000 000 / num must be an integer from 0 to 1,000,000.');
 return num;
}
function buildReduceZero1342(input){
 const original=parse1342(input),history=[],snapshots=[];
 let num=original,count=0,branch=null,frame=0;
 const titles={init:bi('Bắt đầu đếm','Start counting'),while:bi('num còn khác 0?','Is num nonzero?'),parity:bi('Đọc bit cuối','Read the last bit'),
  subtract:bi('Lẻ → trừ 1','Odd → subtract 1'),halve:bi('Chẵn → chia 2','Even → divide by 2'),count:bi('Đếm thêm một bước','Count one more step'),return:bi('Đã về 0 ✓','Reached zero ✓')};
 function emit(line,action,condition=null,change=null){
  frame++;const locals={num,steps:count},title=titles[action];
  snapshots.push({title:bi(`Dòng ${line} · ${title.vi}`,`Line ${line} · ${title.en}`),note:bi('',''),arr:[],highlight:[],mark:[],
   codeLines:[line],debugLine:line,final:action==='return',vars:Object.entries(locals).map(([name,value])=>({name,value})),
   reduceZero1342View:{original,num,count,width:original.toString(2).length,frame,locals:{...locals},action,branch,condition,change:change?{...change}:null,
    source:{line,text:CODE[line-1],scope:'numberOfSteps',timing:'after'},history:history.map(item=>({...item}))}});
 }
 emit(3,'init');
 while(true){
  branch=null;emit(4,'while',{expression:'num != 0',result:num!==0});if(num===0)break;
  const before=num;branch=num%2;emit(5,'parity',{expression:'num & 1',result:!!branch,value:branch});
  const kind=branch?'subtract':'halve';num=branch?num-1:Math.floor(num/2);
  const operation={id:count+1,before,after:num,kind};history.push(operation);
  emit(branch?6:8,kind,null,{kind:'num',from:before,to:num});
  const previous=count;count++;emit(9,'count',null,{kind:'steps',from:previous,to:count});
 }
 emit(10,'return');return{original,answer:count,steps:snapshots};
}
module.exports={1342:{...base,code:CODE,maxInput:1000000,debugMode:'line-by-line',builder:buildReduceZero1342,
 approach:[bi('Bit cuối 0 → chẵn → chia 2. Bit cuối 1 → lẻ → trừ 1.','Last bit 0 → even → divide by 2. Last bit 1 → odd → subtract 1.'),bi('Mỗi phép toán xong mới tăng steps. Dừng ở num = 0.','Increment steps after each operation. Stop at num = 0.')],
 liveArgs:input=>[parse1342(input)]}};
