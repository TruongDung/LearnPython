"use strict";
const {runTrace}=require('./wasm-picture-trace'),sources=require('./math-replay-sources.json');
const bi=(vi,en)=>({vi,en});
const scalar=input=>Array.isArray(input)&&input.length===1?input[0]:typeof input==='string'&&/^-?\d+$/.test(input.trim())?Number(input):input;
const integer=(v,min=-(2**31),max=2**31-1)=>Number.isInteger(v)&&v>=min&&v<=max;
function parse(id,input,params){
 if(id===13){const s=typeof input==='string'?input.trim().toUpperCase():'';if(!s||!/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(s))throw Error('Nhập số La Mã hợp lệ 1–3999 / Enter a valid Roman numeral from 1 to 3999.');return[s];}
 if(id===29){const a=scalar(input),b=params.divisor??3;if(!integer(a)||!integer(b)||b===0)throw Error('Hai số nguyên 32 bit; số chia khác 0 / Use 32-bit integers and a nonzero divisor.');return[a,b];}
 if(id===50){const n=scalar(input),x=params.x??2;if(!integer(n)||typeof x!=='number'||!Number.isFinite(x)||x===0&&n<0)throw Error('Cơ số hữu hạn, số mũ nguyên 32 bit; 0 không có số mũ âm / Use a finite base and 32-bit exponent; zero cannot have a negative exponent.');return[x,n];}
 if(id===60){const n=scalar(input),k=params.k??3;let fact=1;for(let i=2;i<=Math.min(n,9);i++)fact*=i;if(!integer(n,1,9)||!integer(k,1,fact))throw Error('1 ≤ n ≤ 9; 1 ≤ k ≤ n! / Rank k must be within 1..n!.');return[n,k];}
 let args;try{args=typeof input==='string'?JSON.parse(input):input;}catch{throw Error('Nhập mảng tham số JSON / Enter a JSON argument list.');}if(!Array.isArray(args))args=[args];
 const expected=id===166?2:1;if(args.length!==expected)throw Error('Sai số lượng tham số / Incorrect argument count.');
 if(id===166&&(!args.every(v=>integer(v))||!integer(args[1],-1000,1000)||args[1]===0))throw Error('Số nguyên 32 bit; 0 < |mẫu số| ≤ 1000 / Use integers and a nonzero denominator with magnitude ≤1000.');
 if(id===168&&!integer(args[0],1))throw Error('Số cột nguyên dương 32 bit / Use a positive 32-bit column number.');
 if(id===171&&(typeof args[0]!=='string'||!/^[A-Z]{1,7}$/.test(args[0])))throw Error('Tên cột gồm 1–7 chữ A–Z / Use 1–7 uppercase A–Z letters.');
 if(id===172&&!integer(args[0],0,10**9))throw Error('0 ≤ n ≤ 10⁹ / Use an integer within 0..10⁹.');
 if(id===204&&!integer(args[0],0,300))throw Error('Giới hạn lưới: 0 ≤ n ≤ 300 / Visual grid limit: 0..300.');
 return args;
}
module.exports=function upgrade(base){
 const id=base.id,code=sources[id].trim().split('\n'),method=code[1].match(/def (\w+)/)[1];
 function builder(input,params={}){
  const args=parse(id,input,params),trace=runTrace({engine:'wasm',code:code.join('\n'),method,args,maxEvents:12000,failOnTruncate:true});
  let previous={};const history=[];
  const steps=trace.events.map((event,i)=>{
   const x=event.locals,source=code[event.line-1].trim(),final=i===trace.events.length-1;
   if(id===13&&/^result [+-]=/.test(source))history.push({index:x.i,symbol:x.s[x.i],delta:x.result-previous.result,before:previous.result,after:x.result});
   if(id===29&&source==='remaining -= block')history.push({block:x.block,copies:x.copies,before:previous.remaining,after:x.remaining});
   if(id===50&&source==='result *= x')history.push({before:previous.result,base:x.x,after:x.result});
   if(id===166&&source==="answer += str(digit)")history.push({scaled:x.remainder,digit:x.digit,answer:x.answer});
   if(id===172&&source==='zeros += groups')history.push({power:x.power,groups:x.groups,before:previous.zeros,after:x.zeros});
   const oldValues=Object.fromEntries(Object.keys(x).filter(k=>JSON.stringify(x[k])!==JSON.stringify(previous[k])&&Object.hasOwn(previous,k)).map(k=>[k,previous[k]]));previous=x;
   return{arr:[],highlight:[],mark:[],codeLines:[event.line],codeBlock:1,final,title:bi('Dòng '+event.line,'Line '+event.line),note:bi('',''),vars:Object.entries(x).filter(([k])=>k!=='self').map(([name,value])=>({name,value,rawValue:value})),mathReplayView:{id,args,locals:x,oldValues,line:event.line,source:code[event.line-1],branch:event.branch,final,result:final?trace.answer:null,history:history.map(h=>({...h}))}};
  });return{original:args,answer:trace.answer,steps};
 }
 return{...base,code,debugMode:'line-by-line',sourceLanguage:'python',liveEditorDisabled:true,builder,liveArgs:(input,params={})=>parse(id,input,params),codeLabel:bi('Python · từng dòng thực thi','Python · actual source execution')};
};
