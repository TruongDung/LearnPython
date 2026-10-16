"use strict";
const bi=(vi,en)=>({vi,en});
const CODE=Object.freeze([
  "import heapq",
  "from typing import List",
  "",
  "class Solution:",
  "    def swimInWater(self, grid: List[List[int]]) -> int:",
  "        n = len(grid)",
  "        best = [[float('inf')] * n for _ in range(n)]",
  "        best[0][0] = grid[0][0]",
  "        heap = [(grid[0][0], 0, 0)]",
  "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
  "        while heap:",
  "            time, r, c = heapq.heappop(heap)",
  "            if time != best[r][c]:",
  "                continue",
  "            if r == n - 1 and c == n - 1:",
  "                return time",
  "            for dr, dc in directions:",
  "                nr, nc = r + dr, c + dc",
  "                if 0 <= nr < n and 0 <= nc < n:",
  "                    new_time = max(time, grid[nr][nc])",
  "                    if new_time < best[nr][nc]:",
  "                        best[nr][nc] = new_time",
  "                        heapq.heappush(heap, (new_time, nr, nc))",
  "        return -1",
]);
function parseInput(input){
  let grid=input;
  if(typeof input==="string"){
    const text=input.trim();
    if(text.startsWith("[")){try{grid=JSON.parse(text);}catch{throw new Error("778: invalid JSON grid / JSON lưới không hợp lệ.");}}
    else grid=text.split(/[|;]/).map(row=>row.split(",").map(x=>x.trim()===""?NaN:Number(x.trim())));
  }
  if(!Array.isArray(grid)||grid.length<1||grid.length>50||!grid.every(row=>Array.isArray(row)&&row.length===grid.length))throw new RangeError("778: grid must be square, 1..50 rows / lưới vuông có 1..50 hàng.");
  const values=grid.flat(),size=grid.length**2;
  if(values.some(v=>!Number.isInteger(v)||v<0||v>=size)||new Set(values).size!==size)throw new RangeError("778: elevations must be a permutation of 0..n²−1 / độ cao không trùng, từ 0 đến n²−1.");
  return grid.map(row=>[...row]);
}
const less=(a,b)=>a[0]<b[0]||(a[0]===b[0]&&(a[1]<b[1]||(a[1]===b[1]&&a[2]<b[2])));
function siftDown(heap,start,pos){const item=heap[pos];while(pos>start){const p=(pos-1)>>1;if(!less(item,heap[p]))break;heap[pos]=heap[p];pos=p;}heap[pos]=item;}
function push(heap,item){heap.push(item);siftDown(heap,0,heap.length-1);}
function pop(heap){const last=heap.pop();if(!heap.length)return last;const result=heap[0];let pos=0,child=1;while(child<heap.length){const right=child+1;if(right<heap.length&&!less(heap[child],heap[right]))child=right;heap[pos]=heap[child];pos=child;child=pos*2+1;}heap[pos]=last;siftDown(heap,0,pos);return result;}
const copy=v=>Array.isArray(v)?v.map(copy):v===Infinity?"∞":v;
function reachableAt(grid,level){
  if(grid[0][0]>level)return false;const n=grid.length,queue=[[0,0]],seen=new Set([0]);
  for(let i=0;i<queue.length;i++){const [r,c]=queue[i];if(r===n-1&&c===n-1)return true;for(const [dr,dc]of [[1,0],[-1,0],[0,1],[0,-1]]){const nr=r+dr,nc=c+dc,id=nr*n+nc;if(nr>=0&&nr<n&&nc>=0&&nc<n&&grid[nr][nc]<=level&&!seen.has(id)){seen.add(id);queue.push([nr,nc]);}}}
  return false;
}
function buildSteps(input){
  const grid=parseInput(input),size=grid.length,steps=[],settled=new Set(),parent=Array.from({length:size},()=>Array(size).fill(null));
  let n,best,heap,directions,time,r,c,dr,dc,nr,nc,new_time,rowIndex;
  let level=null,probeActive=false,oldBest=null,events=0,omitted=0,popped=0;
  const cap=2000;
  const axis=coord=>size<=8?Array.from({length:size},(_,i)=>i):[...new Set([0,1,size-1,coord===undefined?null:coord-1,coord,coord===undefined?null:coord+1])].filter(i=>Number.isInteger(i)&&i>=0&&i<size).sort((a,b)=>a-b);
  function emit(line,phase,extra={}){
    events++;if(steps.length>=cap&&!extra.final){omitted++;return;}
    const locals={};for(const [name,value]of Object.entries({n,directions,time,r,c,dr,dc,nr,nc,new_time,_:rowIndex}))if(value!==undefined)locals[name]=copy(value);
    const rows=axis(r),cols=axis(c),queued=new Set((heap||[]).map(([,r,c])=>r*size+c));
    const inside=probeActive&&nr>=0&&nr<size&&nc>=0&&nc<size;
    const probe=probeActive?{r:nr,c:nc,inside,height:inside?grid[nr][nc]:null,oldBest:inside?copy(oldBest):null,newTime:inside&&["compare","update","push"].includes(phase)?new_time:null}:null;
    const view={n:size,phase,source:{line,text:CODE[line-1],scope:"swimInWater",timing:"before"},locals,
      level,current:r===undefined?null:[r,c],probe,heap:heap?copy(heap):[],popped,rows,cols,
      cells:rows.map(rr=>cols.map(cc=>({r:rr,c:cc,height:grid[rr][cc],best:best?copy(best[rr][cc]):null,wet:level!==null&&grid[rr][cc]<=level,settled:settled.has(rr*size+cc),queued:queued.has(rr*size+cc)}))),
      cropped:rows.length<size||cols.length<size,final:false,answer:null,path:[],previousReachable:null,...extra};
    steps.push({arr:[],highlight:[],mark:[],codeLines:[line],final:!!extra.final,title:bi("Bơi với mực nước nhỏ nhất","Swim at the minimum water level"),note:bi("",""),vars:Object.entries(locals).filter(([name])=>name!=="_").map(([name,value])=>({name,value})),swimDijkstra778View:view});
  }
  emit(6,"size");n=size;
  emit(7,"best");for(rowIndex=0;rowIndex<n;rowIndex++)emit(7,"best");rowIndex=undefined;
  best=Array.from({length:n},()=>Array(n).fill(Infinity));
  emit(8,"start");best[0][0]=grid[0][0];
  emit(9,"seed");heap=[[grid[0][0],0,0]];
  emit(10,"directions");directions=[[1,0],[-1,0],[0,1],[0,-1]];
  while(true){
    emit(11,"while");if(!heap.length)break;
    probeActive=false;emit(12,"pop");[time,r,c]=pop(heap);level=time;popped++;
    emit(13,"stale");if(time!==best[r][c]){emit(14,"skip-stale");continue;}
    settled.add(r*n+c);emit(15,"target");
    if(r===n-1&&c===n-1){
      const path=[];for(let cur=[r,c];cur;cur=parent[cur[0]][cur[1]])path.push([...cur,grid[cur[0]][cur[1]]]);path.reverse();probeActive=false;
      emit(16,"found",{final:true,answer:time,path,previousReachable:reachableAt(grid,time-1)});
      const trace={events,captured:steps.length,omitted,truncated:omitted>0};for(const step of steps)step.swimDijkstra778View.trace=trace;
      return{original:grid,grid,answer:time,steps};
    }
    for(let i=0;;i++){
      emit(17,"direction");if(i===directions.length)break;[dr,dc]=directions[i];probeActive=false;
      emit(18,"neighbor");nr=r+dr;nc=c+dc;probeActive=true;
      oldBest=nr>=0&&nr<n&&nc>=0&&nc<n?best[nr][nc]:null;
      emit(19,"bounds");if(nr<0||nr>=n||nc<0||nc>=n)continue;
      emit(20,"max");new_time=Math.max(time,grid[nr][nc]);
      emit(21,"compare");if(new_time<best[nr][nc]){
        emit(22,"update");best[nr][nc]=new_time;parent[nr][nc]=[r,c];
        emit(23,"push");push(heap,[new_time,nr,nc]);
      }
    }
    probeActive=false;
  }
  throw new Error("778: a valid square grid must have a path to its target.");
}
module.exports={778:{id:778,difficulty:"hard",slug:"swim-in-rising-water",category:{key:"graph",vi:"Đồ thị",en:"Graph"},tags:[{key:"dijkstra",vi:"Dijkstra",en:"Dijkstra"},{key:"minimax",vi:"Minimax",en:"Minimax"}],title:bi("Swim in Rising Water","Swim in Rising Water"),titleVi:bi("Bơi trong nước đang dâng","Swim in rising water"),statement:bi("Tại t, chỉ bơi qua ô có độ cao ≤ t, theo 4 hướng. Tìm t nhỏ nhất để đi từ góc trên trái tới góc dưới phải.","At time t, swim through cells of elevation ≤ t in four directions. Find the earliest time to reach the bottom-right corner."),defaultInput:"0,1,2,3,4|24,23,22,21,5|12,13,14,15,16|11,17,18,19,20|10,9,8,7,6",inputKind:"string",inputLabel:bi("grid · [[0,2],[1,3]] hoặc 0,2|1,3","grid · [[0,2],[1,3]] or 0,2|1,3"),debugMode:"line-by-line",approach:[bi("best[r][c] là thời điểm tới ô sớm nhất; bắt đầu ở độ cao grid[0][0].","best[r][c] is the earliest arrival time; start at grid[0][0]."),bi("Min-heap pop thời điểm nhỏ nhất. new_time = max(time, độ cao ô kế).","Pop the smallest time from the min-heap. new_time = max(time, next elevation)."),bi("Cập nhật nếu tốt hơn; khi pop đích hợp lệ, trả time.","Update improvements; return time when the target is validly popped.")],complexity:{time:"O(n² log(n²))",space:"O(n²)",note:bi("Hỗ trợ n ≤ 50. Lưới lớn rút gọn hình và trace; tọa độ và đáp án giữ nguyên. best và heap được hiển thị riêng.","Supports n ≤ 50. Large grids condense the picture and trace; coordinates and answers stay exact. best and heap have dedicated displays.")},code:CODE,builder:buildSteps,parseInput,liveArgs:input=>[parseInput(input)]}};
