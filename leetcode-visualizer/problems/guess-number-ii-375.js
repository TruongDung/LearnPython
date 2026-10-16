"use strict";
const bi=(vi,en)=>({vi,en});
const CODE=Object.freeze([
  "class Solution:",
  "    def getMoneyAmount(self, n: int) -> int:",
  "        dp = [[0] * (n + 2) for _ in range(n + 2)]",
  "        for length in range(2, n + 1):",
  "            for lo in range(1, n - length + 2):",
  "                hi = lo + length - 1",
  "                best = float('inf')",
  "                for pick in range(lo, hi + 1):",
  "                    worst = pick + max(dp[lo][pick - 1], dp[pick + 1][hi])",
  "                    best = min(best, worst)",
  "                dp[lo][hi] = best",
  "        return dp[1][n]",
]);
function parseInput(input){
  if(!Array.isArray(input)||input.length!==1||!Number.isInteger(input[0])||input[0]<1||input[0]>200)throw new RangeError("375: n must be one integer in [1, 200] / n là số nguyên từ 1 đến 200.");
  return input[0];
}
function buildSteps(input){
  const n=parseInput(input),steps=[],choice=Array.from({length:n+2},()=>Array(n+2).fill(null));
  let dp,length,lo,hi,best,pick,worst,rowIndex,completed=false,selected=null,candidates=[];
  const ready=new Set(),cap=3500;let events=0,omitted=0;
  const value=x=>x===Infinity?"∞":x;
  function emit(line,phase,extra={}){
    events++;if(steps.length>=cap&&!extra.final){omitted++;return;}
    const locals={n};for(const [key,x]of Object.entries({length,lo,hi,best,pick,worst,_:rowIndex}))if(x!==undefined)locals[key]=value(x);
    const focus=extra.focus||{lo:lo??null,hi:hi??null,pick:pick??null};
    const valid=focus.lo!==null&&focus.hi!==null&&focus.pick!==null&&focus.pick>=focus.lo&&focus.pick<=focus.hi;
    const left=valid&&dp?dp[focus.lo][focus.pick-1]:null,right=valid&&dp?dp[focus.pick+1][focus.hi]:null;
    const ids=n<=10?Array.from({length:n},(_,i)=>i+1):[...new Set([1,n,focus.lo,focus.hi,focus.pick,focus.pick===null?null:focus.pick-1,focus.pick===null?null:focus.pick+1])].filter(i=>Number.isInteger(i)&&i>=1&&i<=n).sort((a,b)=>a-b);
    const visible=candidates.length<=12?candidates:[...candidates.slice(0,4),...candidates.filter(c=>c.pick===selected&&!candidates.slice(0,4).includes(c)&&!candidates.slice(-4).includes(c)),...candidates.slice(-4)];
    const view={n,phase,source:{line,text:CODE[line-1],scope:"getMoneyAmount",timing:"before"},locals,
      focus,left,right,total:phase==="min"?worst:null,best:best===undefined?null:value(best),selected,completed,
      candidates:visible.map(c=>({...c})),candidateCount:candidates.length,
      indices:ids,table:dp?ids.map(r=>ids.map(c=>({lo:r,hi:c,value:dp[r][c],ready:r>=c||ready.has(r+":"+c)}))):null,
      final:false,answer:null,worstPath:[],...extra};
    steps.push({arr:[],highlight:[],mark:[],codeLines:[line],final:!!extra.final,title:bi("Chọn lần đoán có chi phí xấu nhất nhỏ nhất","Minimize the worst-case guessing cost"),note:bi("",""),vars:Object.entries(locals).filter(([name])=>name!=="_").map(([name,value])=>({name,value})),guessCost375View:view});
  }
  emit(3,"init");for(rowIndex=0;rowIndex<n+2;rowIndex++)emit(3,"init");rowIndex=undefined;
  dp=Array.from({length:n+2},()=>Array(n+2).fill(0));
  for(let len=2;;len++){
    emit(4,"length");if(len>n)break;length=len;
    for(let low=1;;low++){
      emit(5,"interval");if(low>n-length+1)break;lo=low;
      emit(6,"right");hi=lo+length-1;completed=false;selected=null;candidates=[];
      emit(7,"reset");best=Infinity;
      for(let guess=lo;;guess++){
        emit(8,"pick");if(guess>hi)break;pick=guess;
        emit(9,"max");worst=pick+Math.max(dp[lo][pick-1],dp[pick+1][hi]);candidates.push({pick,cost:worst});
        emit(10,"min");if(worst<best)selected=pick;best=Math.min(best,worst);
      }
      emit(11,"save");dp[lo][hi]=best;choice[lo][hi]=selected;ready.add(lo+":"+hi);completed=true;
    }
  }
  const answer=dp[1][n],worstPath=[];let a=1,b=n,paid=0;
  while(a<b){const x=choice[a][b],left=dp[a][x-1],right=dp[x+1][b];paid+=x;const lower=x>a&&(x===b||left>=right);worstPath.push({lo:a,hi:b,pick:x,paid:x,total:paid,branch:lower?"left":"right"});if(lower)b=x-1;else a=x+1;}
  worstPath.push({lo:a,hi:b,pick:a,paid:0,total:paid,branch:"correct"});
  emit(12,"result",{final:true,answer,focus:{lo:1,hi:n,pick:n===1?1:choice[1][n]},worstPath});
  const trace={events,captured:steps.length,omitted,truncated:omitted>0};for(const step of steps)step.guessCost375View.trace=trace;
  return{original:[n],answer,steps};
}
module.exports={375:{id:375,difficulty:"medium",slug:"guess-number-higher-or-lower-ii",category:{key:"dp",vi:"Quy hoạch động",en:"Dynamic Programming"},tags:[{key:"minimax",vi:"Minimax",en:"Minimax"}],title:bi("Guess Number Higher or Lower II","Guess Number Higher or Lower II"),titleVi:bi("Đoán số với chi phí bảo đảm nhỏ nhất","Minimum guaranteed guessing cost"),statement:bi("Đoán số trong [1,n]. Đoán sai số x phải trả x; đoán đúng không trả tiền. Tìm số tiền nhỏ nhất bảo đảm thắng với mọi số bí mật.","Guess a number in [1,n]. A wrong guess x costs x; a correct guess is free. Find the minimum budget that guarantees a win."),defaultInput:[10],inputKind:"integer",inputLabel:bi("n · 1–200","n · 1–200"),debugMode:"line-by-line",approach:[bi("dp[lo][hi] là chi phí bảo đảm cho khoảng [lo,hi].","dp[lo][hi] is the guaranteed cost for interval [lo,hi]."),bi("Đoán pick: pick + max(chi phí nhánh trái, nhánh phải). Chọn giá trị nhỏ nhất.","Guess pick: pick + max(left cost, right cost). Choose the minimum."),bi("Một số duy nhất: chi phí 0. Điền bảng từ khoảng ngắn tới dài.","A single number costs 0. Fill shorter intervals first.")],complexity:{time:"O(n³)",space:"O(n²)",note:bi("Input lớn rút gọn hình và trace; đáp án tính toàn bộ. Bảng dp ở hình, không lặp lại trong bảng biến.","Large inputs condense the picture and trace; the answer uses the full input. The picture shows dp instead of repeating it in locals.")},code:CODE,builder:buildSteps,parseInput,liveArgs:input=>[parseInput(input)]}};
