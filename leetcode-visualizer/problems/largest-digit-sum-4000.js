'use strict';
const base=require('./greedy')[4000];
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const SOURCE=Object.freeze([
 'class Solution:',
 '    def largestInteger(self, n: int, s: int) -> int:',
 '        if s > 9 * n:',
 '            return -1',
 '        answer = 0',
 '        for position in range(n):',
 '            digit = min(9, s)',
 '            answer = answer * 10 + digit',
 '            s -= digit',
 '        return answer',
]);
function parse(input,params={}){
 const n=Array.isArray(input)&&input.length===1?input[0]:input,s=params.s??20;
 if(!Number.isInteger(n)||n<0||n>5)throw new RangeError('#4000: n phải là số nguyên từ 0 đến 5 / n must be an integer from 0 to 5.');
 if(!Number.isInteger(s)||s<0||s>100)throw new RangeError('#4000: s phải là số nguyên từ 0 đến 100 / s must be an integer from 0 to 100.');
 return [n,s];
}
function builder(input,params={}){
 const[n,target]=parse(input,params);
 const trace=runTrace({engine:'native',code:SOURCE.join('\n'),method:'largestInteger',args:[n,target],maxEvents:200,failOnTruncate:true});
 const digits=[];
 let previous={};
 const steps=trace.events.map((event,index)=>{
  const x=event.locals,line=event.line,final=index===trace.events.length-1;
  if(line===8)digits.push(x.digit);
  const position=Number.isInteger(x.position)&&[6,7,8,9].includes(line)&&!(line===6&&event.branch===false)?x.position:null;
  const transfer=[7,8].includes(line)?{amount:x.digit,position:x.position,appended:line===8}:null;
  const change=line===8?{kind:'append',before:previous.answer,digit:x.digit,after:x.answer}:line===9?{kind:'subtract',before:previous.s,digit:x.digit,after:x.s}:null;
  const view={n,target,capacity:9*n,remaining:x.s,digits:[...digits],position,transfer,change,currentAnswer:x.answer??null,line,source:SOURCE[line-1],branch:event.branch,final,result:final?trace.answer:null};
  previous={...x};
  return {arr:[],codeLines:[line],codeBlock:1,final,title:bi('Dòng '+line,'Line '+line),note:bi('',''),vars:Object.entries(x).filter(([name])=>name!=='self').map(([name,value])=>({name,value,rawValue:value})),digitSum4000View:view};
 });
 return {original:{n,s:target},answer:trace.answer,steps};
}
module.exports={4000:{...base,inputKind:'nonneg',defaultInput:[3],extraParams:[{...base.extraParams[0],default:20}],code:SOURCE,debugMode:'line-by-line',codeLabel:bi('Python · mỗi thay đổi khớp một dòng','Python · each change follows one line'),
 approach:[bi('Mỗi ô chứa một chữ số từ 0 đến 9.','Each slot holds a digit from 0 to 9.'),bi('Ưu tiên ô bên trái: lấy min(9, s).','Fill the leftmost slot first: take min(9, s).'),bi('Ghép chữ số rồi trừ khỏi tổng còn lại.','Append the digit, then subtract it from the remaining sum.')],
 complexity:{time:'O(n)',space:'O(1)',note:bi('Không tính các snapshot dùng để tua lại.','Excludes replay snapshots.')},builder,liveArgs:parse,sourceLanguage:'python'}};
