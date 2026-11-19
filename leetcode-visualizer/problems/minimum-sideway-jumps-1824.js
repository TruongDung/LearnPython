'use strict';
const bi=(vi,en)=>({vi,en});
const CODE=[
  'class Solution:',
  '    def minSideJumps(self, obstacles):',
  '        INF = len(obstacles) + 1',
  '        dp = [1, 0, 1]',
  '        for i in range(1, len(obstacles)):',
  '            if obstacles[i]:',
  '                dp[obstacles[i] - 1] = INF',
  '            best = min(dp)',
  '            for lane in range(3):',
  '                if lane + 1 != obstacles[i]:',
  '                    dp[lane] = min(dp[lane], best + 1)',
  '        return min(dp)',
];
function parse(input){
  if(!Array.isArray(input)||input.length<2||input.length>500001||input[0]!==0||input.at(-1)!==0||input.some(value=>!Number.isInteger(value)||value<0||value>3))throw new Error('1824: obstacles cần 2..500001 số nguyên 0..3; hai đầu phải là 0. / Use 2..500001 integers in 0..3, with zero at both ends.');
  return input;
}
function buildSteps(input){
  const obstacles=parse(input),n=obstacles.length-1,detailed=obstacles.length<=40,steps=[],INF=obstacles.length+1;
  const py={obstacles,INF:null,dp:null,i:null,best:null,lane:null};
  const parents=new Int8Array(obstacles.length*3);parents[0]=2;parents[2]=2;
  let position=0,pivot=null,answer=null,witness=null;
  const traced=new Set([1,2,n-1,n].filter(i=>i>=1&&i<=n));
  function columns(pos){return detailed?Array.from({length:n+1},(_,i)=>i):[...new Set([0,1,...Array.from({length:5},(_,i)=>pos-2+i),n-1,n].filter(i=>i>=0&&i<=n))].sort((a,b)=>a-b);}
  function emit(line,{pending=null,condition=null,final=false}={}){
    if(!detailed&&position&&!traced.has(position)&&!final)return;
    const indices=columns(position);
    steps.push({title:bi(`L${line} · ${final?'Ít lần nhảy ngang nhất':`Xét cột ${position}`}`,`L${line} · ${final?'Fewest side jumps':`Process point ${position}`}`),note:bi('',''),codeBlock:1,codeLines:[line],debugLine:line,final,arr:[],highlight:[],mark:[],
      vars:Object.entries(py).filter(([key,value])=>!['obstacles','dp'].includes(key)&&value!==null).map(([name,value])=>({name,value})),
      side1824View:{n,INF,position,detailed,summarizedPoints:detailed?0:n-traced.size,line,source:CODE[line-1],timing:'before',pending,condition,pivot,
        pythonLocals:{...py,obstacles:detailed?[...obstacles]:null,dp:py.dp?[...py.dp]:null},
        columns:indices.map(index=>({index,obstacle:obstacles[index]})),hiddenColumns:n+1-indices.length,answer:final?answer:null,witness:final?witness:null,
      }});
  }
  emit(3,{pending:{target:'INF',after:INF}});py.INF=INF;
  emit(4,{pending:{target:'dp',after:[1,0,1]}});py.dp=[1,0,1];
  emit(5);
  for(position=1;position<=n;position++){
    py.i=position;
    emit(6,{condition:obstacles[position]!==0});
    if(obstacles[position]){const lane=obstacles[position]-1;emit(7,{pending:{target:`dp[${lane}]`,lane,before:py.dp[lane],after:INF}});py.dp[lane]=INF;parents[position*3+lane]=-1;}
    const best=Math.min(...py.dp);emit(8,{pending:{target:'best',after:best}});py.best=best;pivot=py.dp.indexOf(best);
    emit(9);
    for(let lane=0;lane<3;lane++){
      py.lane=lane;emit(10,{condition:lane+1!==obstacles[position]});
      if(lane+1!==obstacles[position]){const after=Math.min(py.dp[lane],py.best+1);emit(11,{pending:{target:`dp[${lane}]`,lane,before:py.dp[lane],after,from:pivot,via:py.best+1}});if(after<py.dp[lane])parents[position*3+lane]=pivot+1;py.dp[lane]=after;}
      emit(9);
    }
    emit(5);
  }
  position=n;answer=Math.min(...py.dp);
  const endLane=py.dp.indexOf(answer),visible=new Set(columns(n)),reverse=[];
  let point=n,lane=endLane,suffixJumps=0;
  while(true){
    if(visible.has(point))reverse.push({position:point,lane:lane+1,jumps:answer-suffixJumps});
    const from=parents[point*3+lane];
    if(from>0){suffixJumps++;lane=from-1;}
    else if(point>0)point--;
    else break;
  }
  if(suffixJumps!==answer||lane!==1)throw new Error('1824: route reconstruction mismatch');
  witness={route:reverse.reverse(),sideJumps:answer,forwardMoves:n,endLane:endLane+1,complete:detailed};
  emit(12,{pending:{target:'return',after:answer},final:true});
  return{original:[...obstacles],answer,witness,steps};
}
module.exports={1824:{id:1824,difficulty:'medium',slug:'minimum-sideway-jumps',category:{key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'},tags:[{key:'array',vi:'Mảng',en:'Array'}],
  title:bi('Minimum Sideway Jumps','Minimum Sideway Jumps'),titleVi:bi('Ếch vượt chướng ngại · nhảy ngang ít nhất','Frog on three lanes · fewest side jumps'),
  statement:bi('Ếch bắt đầu ở cột 0, làn 2. Đi tới cùng làn không tốn điểm; nhảy ngang tại cùng cột tốn 1, kể cả làn 1 ↔ 3. Không được đáp vào ô có vật cản. Tới cột cuối bằng ít lần nhảy ngang nhất.','Start at point 0 in lane 2. Moving forward in the same lane costs 0; switching lanes at the same point costs 1, including lane 1 ↔ 3. Never land on an obstacle. Reach the final point with the fewest side jumps.'),
  defaultInput:[0,1,2,3,0],inputKind:'nonneg',inputLabel:bi('obstacles · 0 = trống, 1/2/3 = làn bị chặn','obstacles · 0 = clear, 1/2/3 = blocked lane'),extraParams:[],debugMode:'line',code:CODE,builder:buildSteps,liveArgs:input=>[[...parse(input)]],limits:{maxLength:500001,minValue:0,maxValue:3},
  approach:[bi('dp = [1, 0, 1]: bắt đầu ở làn 2; sang làn 1 hoặc 3 cần một lần nhảy.','dp = [1, 0, 1]: start in lane 2; lanes 1 and 3 each need one side jump.'),bi('Mỗi cột: chặn làn có vật cản → lấy best → thử best + 1 cho các làn trống.','At each point: block the obstacle lane → find best → try best + 1 for every clear lane.')],
  complexity:{time:'O(n)',space:'O(1)',note:bi('DP giữ 3 số. Debug đủ mọi dòng với ≤ 40 cột; dữ liệu lớn gộp cột trung gian và giữ đủ dòng ở các cột cuối.','DP stores 3 numbers. Full line tracing for ≤ 40 points; larger inputs summarize middle points and retain every line at the final points.')},
}};
