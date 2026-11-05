'use strict';
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const code=`from typing import List

class Solution:
    def findMinArrowShots(self, points: List[List[int]]) -> int:
        if not points:
            return 0

        points.sort(key=lambda p: p[1])
        arrows = 0
        arrow_x = float("-inf")

        for start, end in points:
            if start > arrow_x:
                arrows += 1
                arrow_x = end

        return arrows`.split('\n');
function parse(input){
 let points=input;if(typeof points==='string'){const raw=points.trim();try{points=raw.startsWith('[')?JSON.parse(raw):raw?raw.split(/[;|\n]/).map(row=>row.split(',').map(value=>value.trim()?Number(value):NaN)):[];}catch{points=null;}}
 if(!Array.isArray(points)||points.length>24||points.some(row=>!Array.isArray(row)||row.length!==2||row.some(value=>!Number.isInteger(value)||value<-(2**31)||value>2**31-1)||row[0]>=row[1]))throw new RangeError('452: Use 0–24 intervals [start,end] with −2³¹ ≤ start < end ≤ 2³¹−1. Example: [[10,16],[2,8],[1,6],[7,12]].');
 return points.map(row=>[...row]);
}
function orderedIds(points,original){
 const queues=new Map();original.forEach((p,id)=>{const key=JSON.stringify(p);if(!queues.has(key))queues.set(key,[]);queues.get(key).push(id);});
 return points.map(p=>queues.get(JSON.stringify(p)).shift());
}
function build(input){
 const points=parse(input),original=points.map(row=>[...row]),trace=runTrace({code:code.join('\n'),method:'findMinArrowShots',args:[points]});
 const shots=[],assigned=new Map();let sorted=false,cursor=-1,active=null,comparison=null;
 const steps=trace.events.map((record,index)=>{
  const x=record.locals,source=code[record.line-1].trim(),final=index===trace.events.length-1;let event='init';
  if(source==='points.sort(key=lambda p: p[1])'){sorted=true;event='sort';}
  const order=orderedIds(x.points,original);
  if(source==='for start, end in points:'){
   if(record.branch){cursor++;active=order[cursor];comparison=null;event='select';}else{active=null;event='finish';}
  }
  if(source==='if start > arrow_x:'){
   comparison={start:x.start,end:x.end,x:x.arrow_x,newShot:record.branch};event=record.branch?'new-shot':'reuse';
   if(!record.branch)assigned.set(active,shots.length-1);
  }
  if(source==='arrows += 1')event='count';
  if(source==='arrow_x = end'){shots.push({x:x.arrow_x,trigger:active,step:index});assigned.set(active,shots.length-1);event='shoot';}
  if(final){event='return';active=null;}
  const view={id:452,line:record.line,source,event,original:original.map(p=>[...p]),order:[...order],sorted,active,cursor,comparison:comparison?{...comparison}:null,count:x.arrows??null,arrowX:x.arrow_x??null,shots:shots.map(s=>({...s})),assigned:[...assigned],pending:(x.arrows??0)>shots.length,answer:final?trace.answer:null,final};
  return{arr:[],codeLines:[record.line],final,title:bi(`Dòng ${record.line} · findMinArrowShots`,`Line ${record.line} · findMinArrowShots`),note:bi('',''),vars:['points','start','end','arrows','arrow_x'].map(name=>({name,value:x[name]??'—'})),balloon452View:view};
 });return{original,answer:trace.answer,steps};
}
module.exports={452:{id:452,difficulty:'medium',slug:'minimum-number-of-arrows-to-burst-balloons',category:{key:'greedy',vi:'Tham lam',en:'Greedy'},tags:[{key:'greedy',vi:'Tham lam',en:'Greedy'},{key:'sorting',vi:'Sắp xếp',en:'Sorting'},{key:'interval',vi:'Khoảng',en:'Intervals'}],title:bi('Minimum Number of Arrows to Burst Balloons','Minimum Number of Arrows to Burst Balloons'),titleVi:bi('Ít mũi tên nhất để nổ hết bóng','Fewest arrows to burst every balloon'),statement:bi('Bóng [start,end] nổ khi start ≤ x ≤ end. Một mũi tên có thể bắn nhiều bóng.','A balloon [start,end] bursts when start ≤ x ≤ end. One arrow can burst several balloons.'),defaultInput:'[[10,16],[2,8],[1,6],[7,12]]',inputKind:'string',inputLabel:bi('Các khoảng · JSON hoặc 10,16;2,8;1,6;7,12 · tối đa 24 bóng','Intervals · JSON or 10,16;2,8;1,6;7,12 · up to 24 balloons'),debugMode:'line-by-line',code,codeLabel:bi('Greedy · sắp theo end','Greedy · sort by end'),complexity:{time:'O(N log N)',space:'O(N)'},approach:[bi('end tăng dần. start > x: bắn tại end. start ≤ x: dùng lại mũi tên.','Sort by end. start > x: shoot at end. start ≤ x: reuse the arrow.')],builder:build,liveArgs:input=>[parse(input)]}};
