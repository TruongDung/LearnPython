'use strict';

const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const CODE=`class Solution:
    def candy(self, ratings):
        n = len(ratings)
        candies = [1] * n
        for i in range(1, n):
            if ratings[i] > ratings[i - 1]:
                candies[i] = candies[i - 1] + 1
        for i in range(n - 2, -1, -1):
            if ratings[i] > ratings[i + 1]:
                candies[i] = max(candies[i], candies[i + 1] + 1)
        return sum(candies)`.split('\n');

function parse(input,limit=12){
 let ratings=input;
 try{if(typeof input==='string'){const text=input.trim();ratings=text.startsWith('[')?JSON.parse(text):text.split(',').map(x=>x.trim()?Number(x):NaN);}}catch{ratings=null;}
 if(!Array.isArray(ratings)||!ratings.length||ratings.length>limit||!Array.from(ratings).every(n=>Number.isInteger(n)&&n>=0&&n<=50000))throw new RangeError(`135: use 1–${limit} ratings in 0…50000 / nhập 1–${limit} điểm trong 0…50000.`);
 return [...ratings];
}

function build(input){
 const ratings=parse(input),native=runTrace({code:CODE.join('\n'),method:'candy',args:[ratings]}),left=ratings.map(()=>null),right=ratings.map(()=>null),decisions=[];
 let current=null,pass='init';
 const steps=native.events.map((event,index)=>{
  const x=event.locals,line=event.line,final=index===native.events.length-1;
  let phase='init';
  if(line===4){left[0]=1;phase='baseline';}
  if(line===5){
   pass=event.branch?'left':'left-done';
   current=event.branch?{i:x.i,neighbor:x.i-1,direction:'left',condition:null,candidate:null,before:x.candies[x.i],after:null}:null;
   phase=event.branch?'visit-left':'left-done';
  }
  if(line===6){
   current.condition=event.branch;current.candidate=event.branch?x.candies[current.neighbor]+1:1;
   phase=event.branch?'check-left':'settle-left';
   if(!event.branch){left[x.i]=x.candies[x.i];current.after=x.candies[x.i];}
  }
  if(line===7){left[x.i]=x.candies[x.i];current.after=x.candies[x.i];phase='settle-left';}
  if(line===8){
   right[ratings.length-1]=1;pass=event.branch?'right':'right-done';
   current=event.branch?{i:x.i,neighbor:x.i+1,direction:'right',condition:null,candidate:null,before:x.candies[x.i],after:null}:null;
   phase=event.branch?'visit-right':'right-done';
  }
  if(line===9){
   current.condition=event.branch;current.candidate=event.branch?x.candies[current.neighbor]+1:1;right[x.i]=current.candidate;
   phase=event.branch?'check-right':'settle-right';
   if(!event.branch)current.after=x.candies[x.i];
  }
  if(line===10){current.after=x.candies[x.i];phase='settle-right';}
  if(phase==='settle-left'||phase==='settle-right')decisions.push({...current,step:index});
  if(final){current=null;pass='done';phase='done';}
  const view={ratings,candies:x.candies?[...x.candies]:null,left:[...left],right:[...right],current:current?{...current}:null,decisions:structuredClone(decisions),pass,phase,source:{line,text:CODE[line-1].trim()},trace:native.trace,final,answer:final?native.answer:null};
  return {arr:[],codeBlock:1,codeLines:[line],final,title:bi(view.source.text,view.source.text),note:bi('',''),vars:['n','i','candies'].filter(name=>x[name]!==undefined).map(name=>({name,value:structuredClone(x[name])})),candy135View:view};
 });
 return {original:ratings,answer:native.answer,steps};
}

module.exports={135:{id:135,difficulty:'hard',slug:'candy',category:{key:'greedy',vi:'Tham lam',en:'Greedy'},tags:[{key:'array',vi:'Mảng',en:'Array'},{key:'greedy',vi:'Tham lam',en:'Greedy'}],title:bi('Candy','Candy'),titleVi:bi('Phát ít kẹo nhất cho các bé','Give children the fewest candies'),statement:bi('Mỗi bé ít nhất một viên. Bé có điểm cao hơn hàng xóm phải có nhiều kẹo hơn. Tìm tổng kẹo nhỏ nhất.','Every child gets at least one candy. A child with a higher rating than a neighbor must get more candies. Minimize the total.'),defaultInput:[1,0,2],inputKind:'nonneg',inputLabel:bi('ratings · 1–12 bé · điểm từ 0 đến 50000','ratings · 1–12 children · ratings from 0 to 50000'),extraParams:[],code:CODE,debugMode:'line-by-line',approach:[bi('→ Đảm bảo bé điểm cao hơn bên trái có nhiều kẹo hơn. ← Sửa yêu cầu từ bên phải bằng max.','→ Satisfy the left neighbor. ← Satisfy the right neighbor using max.'),bi('Bằng điểm không bắt buộc bằng kẹo. Mỗi bé nhận max(yêu cầu từ trái, yêu cầu từ phải).','Equal ratings do not require equal candies. Each child receives max(left requirement, right requirement).')],complexity:{time:'O(n)',space:'O(n)',note:bi('Hai lượt quét; một mảng candies. Hai hàng yêu cầu chỉ phục vụ minh hoạ.','Two passes and one candies array. The two requirement rows belong to the visualization only.')},visualizationLimits:{maxLength:12,completeTrace:true},builder:build,liveArgs:input=>[parse(input,50000)]}};
