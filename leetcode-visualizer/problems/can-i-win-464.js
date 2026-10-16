"use strict";
const bi=(vi,en)=>({vi,en});
const CODE=Object.freeze([
  "class Solution:",
  "    def canIWin(self, maxChoosableInteger: int, desiredTotal: int) -> bool:",
  "        if desiredTotal <= 0:",
  "            return True",
  "        if maxChoosableInteger * (maxChoosableInteger + 1) // 2 < desiredTotal:",
  "            return False",
  "        memo = {}",
  "        def win(mask: int, remaining: int) -> bool:",
  "            if mask in memo:",
  "                return memo[mask]",
  "            for pick in range(1, maxChoosableInteger + 1):",
  "                bit = 1 << (pick - 1)",
  "                if mask & bit:",
  "                    continue",
  "                if pick >= remaining or not win(mask | bit, remaining - pick):",
  "                    memo[mask] = True",
  "                    return True",
  "            memo[mask] = False",
  "            return False",
  "        return win(0, desiredTotal)",
]);
function parseInput(input,params={}){
  if(!Array.isArray(input)||input.length!==1||!Number.isInteger(input[0])||input[0]<1||input[0]>20)throw new RangeError("464: maxChoosableInteger must be one integer in [1,20] / số nguyên từ 1 đến 20.");
  const raw=params.desiredTotal===undefined?11:params.desiredTotal;
  if(typeof raw!=="number"&&(typeof raw!=="string"||!/^\d+$/.test(raw.trim())))throw new TypeError("464: desiredTotal must be an integer / phải là số nguyên.");
  const desiredTotal=Number(raw);if(!Number.isInteger(desiredTotal)||desiredTotal<0||desiredTotal>300)throw new RangeError("464: desiredTotal must be in [0,300] / từ 0 đến 300.");
  return{maxChoosableInteger:input[0],desiredTotal};
}
function buildSteps(input,params={}){
  const {maxChoosableInteger:m,desiredTotal:target}=parseInput(input,params),memo=new Map(),policy=new Map(),steps=[],stack=[];
  let memoReady=false,events=0,omitted=0,cacheHits=0;const cap=3500;
  function emit(line,phase,frame=null,extra={}){
    events++;if(steps.length>=cap&&!extra.final){omitted++;return;}
    const locals=frame?{mask:frame.mask,remaining:frame.remaining,maxChoosableInteger:m}:{maxChoosableInteger:m,desiredTotal:target};
    if(frame){if(frame.pick!==undefined)locals.pick=frame.pick;if(frame.bit!==undefined)locals.bit=frame.bit;}
    const mask=frame?.mask??0,remaining=frame?.remaining??target;
    const recent=[...memo.entries()].slice(-6).map(([mask,result])=>({mask,result,pick:policy.get(mask)??null}));
    const view={m,target,phase,source:{line,text:CODE[line-1],scope:frame?"win":"canIWin",timing:"before"},locals,
      mask,remaining,pick:frame?.pick??null,bit:frame?.bit??null,player:frame?stack.length%2===1?1:2:1,
      moves:frame?frame.moves.map(move=>({...move})):[],path:stack.slice(1).map(f=>f.via),
      stack:stack.map((f,i)=>({mask:f.mask,remaining:f.remaining,via:f.via??null,player:i%2+1})),
      childResult:frame?.childResult??null,memoReady,memoCount:memo.size,memoValue:memo.has(mask)?memo.get(mask):null,memoRecent:recent,cacheHits,
      final:false,answer:null,winningPick:null,...extra};
    steps.push({arr:[],highlight:[],mark:[],codeLines:[line],final:!!extra.final,title:bi("Chọn nước đi khiến đối thủ thua","Choose a move that makes the opponent lose"),note:bi("",""),vars:Object.entries(locals).map(([name,value])=>({name,value})),canIWin464View:view});
  }
  function finishEarly(line,phase,answer){emit(line,phase,null,{final:true,answer});return finish(answer);}
  function finish(answer){const trace={events,captured:steps.length,omitted,truncated:omitted>0};for(const step of steps)step.canIWin464View.trace=trace;return{original:[m],answer,steps};}
  emit(3,"zero");if(target<=0)return finishEarly(4,"early-win",true);
  emit(5,"sum");if(m*(m+1)/2<target)return finishEarly(6,"unreachable",false);
  emit(7,"memo");memoReady=true;emit(8,"define");
  function win(mask,remaining,via){
    const frame={mask,remaining,via,moves:[],childResult:null};stack.push(frame);
    emit(9,"cache",frame);
    if(memo.has(mask)){cacheHits++;emit(10,"cache-return",frame);const answer=memo.get(mask);stack.pop();return answer;}
    for(let pick=1;;pick++){
      emit(11,"choose",frame);if(pick>m)break;frame.pick=pick;frame.childResult=null;
      emit(12,"bit",frame);frame.bit=1<<(pick-1);
      emit(13,"used",frame);if(mask&frame.bit){emit(14,"skip",frame);continue;}
      emit(15,"try",frame);
      let succeeds,reason;
      if(pick>=remaining){succeeds=true;reason="reach";}
      else{const opponent=win(mask|frame.bit,remaining-pick,pick);frame.childResult=opponent;succeeds=!opponent;reason=opponent?"opponent-wins":"opponent-loses";}
      frame.moves.push({pick,winning:succeeds,reason,response:policy.get(mask|frame.bit)??null});
      if(succeeds){
        emit(16,"save-win",frame);memo.set(mask,true);policy.set(mask,pick);
        const final=stack.length===1;emit(17,"return-win",frame,{final,answer:final?true:null,winningPick:pick});stack.pop();return true;
      }
    }
    emit(18,"save-loss",frame);memo.set(mask,false);
    const final=stack.length===1;emit(19,"return-loss",frame,{final,answer:final?false:null});stack.pop();return false;
  }
  emit(20,"start");return finish(win(0,target));
}
module.exports={464:{id:464,difficulty:"medium",slug:"can-i-win",category:{key:"dp",vi:"Quy hoạch động",en:"Dynamic Programming"},tags:[{key:"minimax",vi:"Minimax",en:"Minimax"},{key:"bitmask",vi:"Bitmask",en:"Bitmask"}],title:bi("Can I Win","Can I Win"),titleVi:bi("Người đi trước có thể chắc thắng?","Can the first player force a win?"),statement:bi("Hai người thay phiên chọn số từ 1 đến maxChoosableInteger; mỗi số dùng một lần. Ai làm tổng đạt hoặc vượt desiredTotal thắng. Cả hai chơi tối ưu: người đi trước có chắc thắng không?","Players take turns choosing unused numbers from 1 to maxChoosableInteger. Reaching or exceeding desiredTotal wins. With optimal play, can the first player force a win?"),defaultInput:[10],inputKind:"integer",inputLabel:bi("maxChoosableInteger · 1–20","maxChoosableInteger · 1–20"),extraParams:[{key:"desiredTotal",type:"number",min:0,max:300,default:11,label:bi("desiredTotal · tổng cần đạt","desiredTotal · target total")}],debugMode:"line-by-line",approach:[bi("Thắng nếu chọn đủ tổng ngay, hoặc đưa đối thủ vào trạng thái thua.","Win by reaching the target now or leaving the opponent a losing state."),bi("mask ghi các số đã dùng; cùng mask có cùng tổng còn thiếu nên memo chỉ cần mask.","mask records used numbers; it determines the remaining target, so memo only needs mask."),bi("WIN / LOSE luôn xét từ người đang tới lượt.","WIN / LOSE always describes the player whose turn it is.")],complexity:{time:"O(m · 2^m)",space:"O(2^m)",note:bi("m ≤ 20; độ sâu gọi hàm ≤ m. Input lớn rút gọn trace, tính đầy đủ đáp án.","m ≤ 20; recursion depth ≤ m. Large inputs condense the trace but compute the complete answer.")},code:CODE,builder:buildSteps,parseInput,liveArgs:(input,params)=>{const p=parseInput(input,params);return[p.maxChoosableInteger,p.desiredTotal];}}};
