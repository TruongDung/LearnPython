'use strict';
const bi=(vi,en)=>({vi,en});
const SOURCE=[
  'class Solution:',
  '    def racecar(self, target: int) -> int:',
  '        dp = [0] * (target + 1)',
  '        for distance in range(1, target + 1):',
  '            n = distance.bit_length()',
  '            full = (1 << n) - 1',
  '            if full == distance:',
  '                dp[distance] = n',
  '                continue',
  '            dp[distance] = n + 1 + dp[full - distance]',
  '            for reverse in range(n - 1):',
  '                backward = (1 << reverse) - 1',
  '                remaining = distance - ((1 << (n - 1)) - 1 - backward)',
  '                candidate = (n - 1) + 1 + reverse + 1 + dp[remaining]',
  '                if candidate < dp[distance]:',
  '                    dp[distance] = candidate',
  '        return dp[target]',
];
function parseRaceCar818Input(input){
  if(!Array.isArray(input)||input.length!==1||!Number.isInteger(input[0])||input[0]<1||input[0]>10000)throw new Error('818: target phải là một số nguyên trong [1, 10000]. / Use one integer target in [1, 10000].');
  return input[0];
}
function buildSteps818(input){
  const target=parseRaceCar818Input(input),detailed=target<=40,steps=[];
  const py={target,dp:null,distance:null,n:null,full:null,reverse:null,backward:null,remaining:null,candidate:null};
  let dp=[],choices=[],written=[],distance=0,answer=null,witness=null;
  const traced=new Set([1,2,3,target].filter(d=>d<=target));
  const copyPlan=p=>p?{...p}:null;
  function plan(d,m=null){
    const n=Math.floor(Math.log2(d))+1,full=2**n-1,short=2**(n-1)-1;
    if(full===d)return{type:'exact',distance:d,n,full,short,remainder:0,fixed:n,dependency:0,cost:n,prefix:'A'.repeat(n),turns:[0,d]};
    if(m===null){const remainder=full-d;return{type:'over',distance:d,n,full,short,remainder,fixed:n+1,dependency:dp[remainder],cost:n+1+dp[remainder],prefix:'A'.repeat(n)+'R',turns:[0,full]};}
    const backward=2**m-1,remainder=d-short+backward,fixed=n+1+m;
    return{type:'under',distance:d,n,full,short,reverse:m,backward,remainder,fixed,dependency:dp[remainder],cost:fixed+dp[remainder],prefix:'A'.repeat(n-1)+'R'+'A'.repeat(m)+'R',turns:[0,short,short-backward]};
  }
  function emit(line,{pending=null,condition=null,final=false}={}){
    if(!detailed&&distance&&!traced.has(distance)&&!final)return;
    const d=distance||null,ready=dp.length>0;
    const indices=ready?(detailed?Array.from({length:target+1},(_,i)=>i):[...new Set([0,1,2,3,...Array.from({length:7},(_,i)=>(d||0)-3+i),py.remaining,py.full===null?null:py.full-(d||0),target].filter(i=>Number.isInteger(i)&&i>=0&&i<=target))].sort((a,b)=>a-b)):[];
    const over=d&&line>=7?plan(d):null,under=d&&line>=12&&py.reverse!==null&&py.full!==d?plan(d,py.reverse):null;
    steps.push({title:bi(`L${line} · ${final?'Đến đích bằng ít lệnh nhất':d?`Tìm đường đến ${d}`:'Xe xuất phát ở 0'}`,`L${line} · ${final?'Fewest commands to the target':d?`Solve distance ${d}`:'Start at position 0'}`),
      note:bi('',''),arr:[],highlight:[],mark:[],codeBlock:1,codeLines:[line],debugLine:line,final,
      vars:Object.entries(py).filter(([key,value])=>key!=='dp'&&value!==null).map(([name,value])=>({name,value})),
      raceCar818View:{version:2,target,detailed,summarizedDistances:detailed?0:target-traced.size,line,source:SOURCE[line-1],timing:'before',distance:d,pending,condition,
        pythonLocals:{...py,dp:ready&&detailed?[...dp]:null},
        cells:indices.map(index=>({index,stored:dp[index],cost:written[index]?dp[index]:null})),hiddenCells:ready?target+1-indices.length:0,
        over,under,alternatives:final&&over?.type!=='exact'?Array.from({length:py.n-1},(_,m)=>plan(d,m)):[],best:copyPlan(choices[d]),answer:final?answer:null,witness:final?witness:null,
      }});
  }
  function write(p){dp[distance]=p.cost;choices[distance]=p;written[distance]=true;}
  emit(3,{pending:{target:'dp',kind:'allocate',after:target+1}});
  dp=Array(target+1).fill(0);choices=Array(target+1).fill(null);written=Array(target+1).fill(false);written[0]=true;py.dp=dp;
  emit(4);
  for(distance=1;distance<=target;distance++){
    py.distance=distance;
    emit(5,{pending:{target:'n',after:Math.floor(Math.log2(distance))+1}});py.n=Math.floor(Math.log2(distance))+1;
    emit(6,{pending:{target:'full',after:2**py.n-1}});py.full=2**py.n-1;
    emit(7,{condition:py.full===distance});
    if(py.full===distance){emit(8,{pending:{target:`dp[${distance}]`,after:py.n}});write(plan(distance));emit(9);emit(4);continue;}
    const over=plan(distance);emit(10,{pending:{target:`dp[${distance}]`,after:over.cost}});write(over);
    emit(11);
    for(let m=0;m<py.n-1;m++){
      py.reverse=m;
      emit(12,{pending:{target:'backward',after:2**m-1}});py.backward=2**m-1;
      const nextRemaining=distance-(2**(py.n-1)-1-py.backward);
      emit(13,{pending:{target:'remaining',after:nextRemaining}});py.remaining=nextRemaining;
      const under=plan(distance,m);
      emit(14,{pending:{target:'candidate',after:under.cost}});py.candidate=under.cost;
      emit(15,{condition:py.candidate<dp[distance]});
      if(py.candidate<dp[distance]){emit(16,{pending:{target:`dp[${distance}]`,after:py.candidate}});write(under);}
      emit(11);
    }
    emit(4);
  }
  distance=target;answer=dp[target];
  function commands(d){if(d===0)return '';const p=choices[d];return p.prefix+commands(p.remainder);}
  const sequence=commands(target),history=[{index:0,command:null,position:0,speed:1}];let position=0,speed=1;
  for(const command of sequence){if(command==='A'){position+=speed;speed*=2;}else speed=speed>0?-1:1;history.push({index:history.length,command,position,speed});}
  witness={commands:sequence,history,position,speed};
  emit(17,{pending:{target:'return',after:answer},final:true});
  return{original:[target],answer,commands:sequence,witness,steps};
}
module.exports={818:{id:818,difficulty:'hard',slug:'race-car',category:{key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'},tags:[{key:'shortest-path',vi:'Đường đi ngắn nhất',en:'Shortest Path'}],
  title:bi('Race Car','Race Car'),titleVi:bi('Xe đua · ít lệnh nhất để đến đích','Race car · reach the target with the fewest commands'),
  statement:bi('Xuất phát ở 0, tốc độ +1. A: đi theo tốc độ rồi nhân đôi. R: đứng yên, đổi hướng và đặt tốc độ về ±1. Tìm số lệnh ít nhất để đến target.','Start at 0 with speed +1. A moves by the current speed, then doubles it. R stays in place and resets speed to ±1 in the opposite direction. Find the fewest commands to reach target.'),
  defaultInput:[6],inputKind:'positive',inputLabel:bi('target · 1..10000','target · 1..10000'),singleInput:true,maxInput:10000,extraParams:[],debugMode:'line',parseRaceCar818Input,
  code:SOURCE,liveArgs:input=>[parseRaceCar818Input(input)],builder:buildSteps818,
  approach:[bi('A liên tiếp: 0 → 1 → 3 → 7 → 15. R đổi hướng, không đổi vị trí.','Consecutive A commands: 0 → 1 → 3 → 7 → 15. R changes direction, not position.'),bi('Chọn giữa vượt đích rồi quay lại và quay sớm. Phần còn lại dùng dp[k] đã tính.','Compare overshooting and turning early. Reuse dp[k] for the remaining distance.')],
  complexity:{time:'O(target · log target)',space:'O(target)',note:bi('Debug đủ mọi dòng với target ≤ 40. Target lớn: gộp các khoảng cách trung gian, giữ đủ dòng khi tính đích.','Every line is traced for target ≤ 40. Larger targets summarize intermediate distances and retain every line for the target.')},
}};
