'use strict';

const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const CODE=`class Solution:
    def digitSum(self, s, k):
        while len(s) > k:
            parts = []
            for start in range(0, len(s), k):
                group = s[start:start + k]
                total = 0
                for digit in group:
                    total += int(digit)
                parts.append(str(total))
            s = ''.join(parts)
        return s`.split('\n');

function parse(input,params={},limit=48){
 const k=params.k??3;
 if(typeof input!=='string'||input.length<1||input.length>limit||!/^[0-9]+$/.test(input))throw new RangeError(`2243: s must contain 1–${limit} digits / s cần có 1–${limit} chữ số.`);
 if(!Number.isInteger(k)||k<2||k>100)throw new RangeError('2243: k must be an integer from 2 to 100 / k phải là số nguyên từ 2 đến 100.');
 return {s:input,k};
}

function build(input,params){
 const {s,k}=parse(input,params),native=runTrace({code:CODE.join('\n'),method:'digitSum',args:[s,k]}),rounds=[];
 let current=null;
 const steps=native.events.map((event,index)=>{
  const x=event.locals,line=event.line,final=index===native.events.length-1;
  let phase='init';
  if(line===3){
   current=null;phase=event.branch?'round-start':'stop';
   if(event.branch)rounds.push({input:x.s,groups:Array.from({length:Math.ceil(x.s.length/k)},(_,g)=>({start:g*k,text:x.s.slice(g*k,(g+1)*k),total:null,part:null,step:null})),parts:[],output:null,step:index,joinStep:null});
  }
  const round=rounds.at(-1);
  if(line===4){round.parts=[...x.parts];phase='parts-init';}
  if(line===5){current=event.branch?{round:rounds.length-1,group:Math.floor(x.start/k),text:null,total:null,processed:0,digit:null,appended:false}:null;phase=event.branch?'choose-group':'groups-done';}
  if(line===6){current.text=x.group;phase='slice';}
  if(line===7){current.total=x.total;phase='sum-init';}
  if(line===8){current.digit=event.branch?x.digit:null;phase=event.branch?'choose-digit':'group-ready';}
  if(line===9){current.total=x.total;current.processed++;phase='add';}
  if(line===10){
   const group=round.groups[current.group];group.total=x.total;group.part=x.parts.at(-1);group.step=index;
   round.parts=[...x.parts];current.appended=true;phase='append';
  }
  if(line===11){round.output=x.s;round.joinStep=index;phase='join';}
  if(final){current=null;phase='done';}
  const view={s,k,working:x.s,rounds:structuredClone(rounds),current:current?{...current}:null,phase,source:{line,text:CODE[line-1].trim()},trace:native.trace,final,answer:final?native.answer:null};
  return {arr:[],codeBlock:1,codeLines:[line],final,title:bi(view.source.text,view.source.text),note:bi('',''),vars:['s','k','start','group','digit','total','parts'].filter(name=>x[name]!==undefined).map(name=>({name,value:structuredClone(x[name])})),digitSumString2243View:view};
 });
 return {original:s,answer:native.answer,steps};
}

module.exports={2243:{id:2243,difficulty:'easy',slug:'calculate-digit-sum-of-a-string',category:{key:'string',vi:'Chuỗi',en:'String'},tags:[{key:'string',vi:'Chuỗi',en:'String'},{key:'simulation',vi:'Mô phỏng',en:'Simulation'}],title:bi('Calculate Digit Sum of a String','Calculate Digit Sum of a String'),titleVi:bi('Chia nhóm, cộng chữ số, ghép chuỗi','Split, sum digits, join'),statement:bi('Chia s thành các nhóm tối đa k chữ số. Thay mỗi nhóm bằng tổng các chữ số, ghép lại và lặp đến khi độ dài ≤ k.','Split s into groups of at most k digits. Replace each group with its digit sum, concatenate, and repeat until the length is at most k.'),defaultInput:'11111222223',inputKind:'string',inputLabel:bi('s · 1–48 chữ số · giữ nguyên số 0 đầu','s · 1–48 digits · preserve leading zeros'),extraParams:[{key:'k',label:bi('k · số chữ số mỗi nhóm','k · digits per group'),default:3,min:2,max:100}],code:CODE,debugMode:'line-by-line',approach:[bi('Mỗi nhóm dùng một màu. Giữ nguyên toàn bộ tổng: 346 → 13.','Each group has its own color. Keep the entire sum: 346 → 13.'),bi('Ghép chuỗi theo thứ tự; nhóm cuối có thể ngắn hơn k. Dừng ngay khi len(s) ≤ k.','Join in order; the last group may be shorter than k. Stop as soon as len(s) ≤ k.')],complexity:{time:'O(n · R)',space:'O(n)',note:bi('n là độ dài ban đầu, R là số vòng. Mỗi vòng duyệt chuỗi hiện tại; đây là cận trên.','n is the original length and R the number of rounds. Each round scans the current string; this is an upper bound.')},visualizationLimits:{maxLength:48,completeTrace:true},builder:build,liveArgs:(input,params)=>{const {s,k}=parse(input,params,100);return[s,k];}}};
