"use strict";
const bi=(vi,en)=>({vi,en});
const CODE=[
  "from typing import List",
  "",
  "class Solution:",
  "    def minEatingSpeed(self, piles: List[int], h: int) -> int:",
  "        lo, hi = 1, max(piles)",
  "        while lo < hi:",
  "            mid = (lo + hi) // 2",
  "            hours = 0",
  "            for pile in piles:",
  "                hours += (pile + mid - 1) // mid",
  "            if hours <= h:",
  "                hi = mid",
  "            else:",
  "                lo = mid + 1",
  "",
  "        return lo",
];
const CODE2=["class Solution:","    def minEatingSpeed(self, piles, h):","        start = 1","        end = max(piles)","","        while start < end:","            mid = (start + end) // 2","","            hours = 0","","            for pile in piles:","                if pile % mid == 0:","                    hours += pile // mid","                else:","                    hours += pile // mid + 1","","            if hours > h:","                start = mid + 1","            else:","                end = mid","","        return start"];
function parseInput(input, params={}) {
  if(!Array.isArray(input)||!input.length||input.length>10000||input.some(p=>!Number.isInteger(p)||p<1||p>1000000000))throw new RangeError("875: piles must contain 1..10000 positive integers, each ≤ 10^9.");
  const h=params.h===undefined?8:Number(params.h);
  if(!Number.isInteger(h)||h<input.length||h>1000000000)throw new RangeError("875: h must be an integer between piles.length and 10^9.");
  return {piles:[...input],h};
}
function buildSteps(input,params={}) {
  const {piles,h}=parseInput(input,params),maximum=Math.max(...piles);
  const alternate=Number(params.approach)===2,source=alternate?CODE2:CODE;
  let lo,hi,mid,hours,pile,index=-1,processed=0,round=0,calculating=false;
  const steps=[],tested=[];
  let truncated=false;
  const displayIds=piles.length<=8?piles.map((_,i)=>i):[0,1,2,3,piles.length-2,piles.length-1];
  function emit(line,phase,extra={}) {
    if(steps.length>=450&&!extra.final){truncated=true;return;}
    const locals={};
    for(const [name,value] of Object.entries(alternate?{start:lo,end:hi,mid,hours,pile}:{lo,hi,mid,hours,pile}))if(value!==undefined)locals[name]=value;
    const ids=[...new Set([...displayIds,...(index>=0?[index]:[])])].sort((a,b)=>a-b);
    const speed=extra.final?lo:mid;
    const view={phase,source:{line,text:source[line-1],timing:"before"},lowerName:alternate?"start":"lo",upperName:alternate?"end":"hi",h,maximum,n:piles.length,lo:lo??null,hi:hi??null,mid:mid??null,speed:speed??null,
      hours:hours??null,locals:{...locals},index,processed,round,calculating,truncated,
      piles:ids.map(i=>({index:i,pile:piles[i],done:calculating&&i<processed,active:i===index,needed:speed?Math.ceil(piles[i]/speed):null})),
      tested:tested.map(t=>({...t})),answer:null,final:false,...extra};
    steps.push({arr:[],highlight:[],mark:[],codeBlock:alternate?2:1,codeLines:[line],title:bi("Tìm tốc độ ăn nhỏ nhất","Find the minimum eating speed"),note:bi("",""),vars:Object.entries(locals).map(([name,value])=>({name,value})),final:!!extra.final,koko875View:view});
  }
  if(alternate){emit(3,"init");lo=1;emit(4,"init");hi=maximum;}
  else{emit(5,"init");lo=1;hi=maximum;}
  while(true) {
    emit(6,"while");if(!(lo<hi))break;
    emit(7,"mid");mid=Math.floor((lo+hi)/2);round++;calculating=false;processed=0;index=-1;
    emit(alternate?9:8,"reset");hours=0;calculating=true;
    for(let i=0;;i++) {
      emit(alternate?11:9,"loop");if(i===piles.length)break;
      pile=piles[i];index=i;
      if(alternate)emit(12,"remainder");
      emit(alternate?(pile%mid===0?13:15):10,"add");hours+=Math.floor((pile+mid-1)/mid);processed=i+1;
    }
    index=-1;
    emit(alternate?17:11,"check");
    const feasible=hours<=h;
    tested.push({speed:mid,hours,feasible});
    if(feasible) {emit(alternate?20:12,"shrink-hi",{nextLo:lo,nextHi:mid,feasible});hi=mid;}
    else {emit(alternate?18:14,"shrink-lo",{nextLo:mid+1,nextHi:hi,feasible});lo=mid+1;}
  }
  const sumAt=k=>piles.reduce((total,p)=>total+Math.floor((p+k-1)/k),0);
  emit(alternate?22:16,"result",{final:true,answer:lo,answerHours:sumAt(lo),slowerHours:lo>1?sumAt(lo-1):null});
  return {original:piles,answer:lo,steps};
}
module.exports={code:CODE,builder:buildSteps,parseInput};
