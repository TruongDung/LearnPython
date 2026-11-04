'use strict';
const {runTrace}=require('./wasm-picture-trace'),methods=require('./task-scheduler-621-methods');
const bi=(vi,en)=>({vi,en});
function parse(input,params={}){
 let tasks=input;
 if(typeof tasks==='string'){
  if(tasks.trim().startsWith('[')){try{tasks=JSON.parse(tasks);}catch(_){tasks=null;}}
  else tasks=tasks.includes(',')?tasks.split(',').map(s=>s.trim()):[...tasks.replace(/\s/g,'')];
 }
 const n=Number(params.n??2);
 if(!Array.isArray(tasks)||tasks.length<1||tasks.length>18||tasks.some(t=>typeof t!=='string'||!/^[A-Z]$/.test(t))||!Number.isInteger(n)||n<0||n>8)throw new RangeError('621: enter 1–18 uppercase tasks A–Z and cooldown n from 0 to 8.');
 return{tasks:[...tasks],n};
}
// A separate witness for the two counting methods, revealed only at return.
function witness(tasks,n){const left={},ready={},schedule=[];tasks.forEach(t=>{left[t]=(left[t]||0)+1;ready[t]=1;});let time=0;while(Object.values(left).some(c=>c>0)){time++;const task=Object.keys(left).filter(t=>left[t]>0&&ready[t]<=time).sort((a,b)=>left[b]-left[a]||a.localeCompare(b))[0];schedule.push(task??'_');if(task){left[task]--;ready[task]=time+n+1;}}return schedule;}
const watches=[['freq','max_freq','max_count','frame','answer'],['counts','max_freq','count','idle','answer'],['time','neg_count','task','heap','wait'],['time','slots','neg_count','task','heap','used'],['time','task','chosen','left','remaining','ready'],['time','gap','heap','wait','neg_count','task'],['time','slots','count','task','counts','used']];
function build(input,params={},method=1){
 const {tasks,n}=parse(input,params),definition=methods[method-1],trace=runTrace({code:definition.code.join('\n'),method:'leastInterval',args:[tasks,n]});const counts={};tasks.forEach(t=>counts[t]=(counts[t]||0)+1);
 const steps=trace.events.map((record,index)=>{const root=record.outer,source=definition.code[record.line-1].trim(),final=index===trace.events.length-1;
  const schedule=root.schedule?[...root.schedule]:final?witness(tasks,n):[];
  const freq=root.freq??root.remaining??null;
  const view={method,line:record.line,source,branch:record.branch,tasks:[...tasks],n,counts:{...counts},freq:freq?{...freq}:null,
   maxFreq:root.max_freq??null,maxCount:root.max_count??null,frame:root.frame??null,idle:root.idle??null,time:root.time??null,slots:root.slots??null,
   schedule,example:method<=2,heap:(root.heap??[]).map(e=>[...e]),heapReady:method>=3&&record.line>=definition.code.indexOf('        heapify(heap)')+1,
   wait:(root.wait??[]).map(e=>[...e]),used:(root.used??[]).map(e=>[...e]),countsList:root.counts??null,ready:root.ready?{...root.ready}:null,
   task:root.chosen??root.task??null,negCount:root.neg_count??null,answer:root.answer??(final?trace.answer:null),change:[schedule.length,root.frame??null,root.idle??null,root.answer??null],final};
  return{arr:[],codeLines:[record.line],codeBlock:method,final,title:bi(`Dòng ${record.line}`,`Line ${record.line}`),note:bi('',''),vars:watches[method-1].map(name=>({name,value:root[name]??'—'})),scheduler621View:view};
 });return{original:tasks,n,answer:trace.answer,steps};
}
const problem={id:621,difficulty:'medium',slug:'task-scheduler',category:{key:'greedy',vi:'Tham lam',en:'Greedy'},tags:[{key:'heap',vi:'Heap',en:'Heap'},{key:'counting',vi:'Đếm tần suất',en:'Counting'}],title:bi('Task Scheduler','Task Scheduler'),titleVi:bi('Xếp task, cách nhau n ô','Schedule tasks n slots apart'),statement:bi('Mỗi ô chạy một task hoặc nghỉ. Hai chữ giống nhau cần ít nhất n ô ở giữa. Tìm số ô ít nhất.','Each slot runs one task or idles. Matching letters need at least n slots between them. Minimize the total slots.'),defaultInput:'A,A,A,B,B,B',inputKind:'string',inputLabel:bi('tasks · 1–18 chữ A–Z','tasks · 1–18 letters A–Z'),debugMode:'line-by-line',
 extraParams:[{key:'n',type:'number',label:bi('Cooldown n (0–8)','Cooldown n (0–8)'),default:2,min:0,max:8},{key:'approach',type:'select',label:bi('Cách giải','Approach'),default:1,options:methods.map((m,i)=>({value:i+1,label:bi(`${i+1}. ${m.label.vi}`,`${i+1}. ${m.label.en}`)}))}],approach:[bi('Cooldown n = n ô ở giữa, nên task chạy lại tại time + n + 1.','Cooldown n means n slots between repeats, so the next ready time is time + n + 1.')],liveArgs:(input,params)=>{const{tasks,n}=parse(input,params);return[tasks,n];}};
methods.forEach((m,i)=>{const suffix=i?i+1:'';problem[`code${suffix}`]=m.code;problem[`code${suffix}Label`]=m.label;problem[`builder${suffix}`]=(input,params)=>build(input,params,i+1);problem[`complexity${suffix}`]={time:m.time,space:m.space,note:bi('T: số task · U: số chữ khác nhau ≤ 26 · L: số ô gồm cả nghỉ. Các bản mô phỏng lưu timeline.','T: tasks · U: distinct labels ≤ 26 · L: slots including idle. Simulations store the timeline.')};});
module.exports={621:problem};
