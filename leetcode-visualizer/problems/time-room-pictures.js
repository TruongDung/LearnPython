'use strict';
const bases=require('./graph'),{runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en}),copy=v=>v===null?null:JSON.parse(JSON.stringify(v)),key=(time,r,c)=>`${time},${r},${c}`;
function codeFor(id){const name=id===2577?'grid':'moveTime',method=id===2577?'minimumTime':'minTimeToReach';return(`from heapq import heappop, heappush

class Solution:
    def ${method}(self, ${name}):
        rows, cols = len(${name}), len(${name}[0])
${id===2577?`        if grid[0][1] > 1 and grid[1][0] > 1:
            return -1
`:''}        dist = [[float("inf")] * cols for _ in range(rows)]
        dist[0][0] = 0
        heap = [(0, 0, 0)]
        while heap:
            time, r, c = heappop(heap)
            if time > dist[r][c]:
                continue
            if r == rows - 1 and c == cols - 1:
                return time
            for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols:
${id===2577?`                    next_time = time + 1
                    if next_time < grid[nr][nc]:
                        gap = grid[nr][nc] - next_time
                        # Each back-and-forth trip adds two seconds.
                        next_time = grid[nr][nc] + gap % 2
`:`                    duration = ${id===3342?'1 if (r + c) % 2 == 0 else 2':'1'}
                    depart = max(time, moveTime[nr][nc])
                    next_time = depart + duration
`}                    if next_time < dist[nr][nc]:
                        dist[nr][nc] = next_time
                        heappush(heap, (next_time, nr, nc))
        return -1`).split('\n');}
function parse(input,id){let grid=input;
 if(typeof input==='string'){try{grid=input.trim().startsWith('[')?JSON.parse(input):input.trim()?input.split(/[|;\n]/).map(row=>row.split(',').map(s=>s.trim()?Number(s):NaN)):[];}catch(_){grid=null;}}
 const max=id===2577?100000:1000000000;
 if(!Array.isArray(grid)||grid.length<2||grid.length>8||!Array.isArray(grid[0])||grid[0].length<2||grid[0].length>8||grid.some(row=>!Array.isArray(row)||row.length!==grid[0].length||row.some(v=>!Number.isInteger(v)||v<0||v>max))||id===2577&&grid[0][0]!==0)throw new RangeError(`${id}: enter a 2–8 × 2–8 rectangular integer grid in [0,${max}]${id===2577?', with grid[0][0] = 0':''}.`);
 return grid.map(row=>[...row]);
}
function build(input,id){const grid=parse(input,id),code=codeFor(id),rows=grid.length,cols=grid[0].length,trace=runTrace({code:code.join('\n'),method:id===2577?'minimumTime':'minTimeToReach',args:[grid]});
 const routes=new Map([[key(0,0,0),{nodes:[{r:0,c:0,time:0}],legs:[]}]]),settled=new Set();let active=null,proposal=null,trapped=null;
 const steps=trace.events.map((record,index)=>{const x=record.locals,source=code[record.line-1].trim(),final=index===trace.events.length-1;let event='line';
  if(source==='if grid[0][1] > 1 and grid[1][0] > 1:'){trapped=record.branch;event='start-check';}
  if(source==='time, r, c = heappop(heap)'){active={r:x.r,c:x.c,time:x.time,route:copy(routes.get(key(x.time,x.r,x.c)))};proposal=null;event='pop';}
  if(source==='if time > dist[r][c]:'){event=record.branch?'stale':'settle';if(!record.branch)settled.add(`${x.r},${x.c}`);}
  if(source.startsWith('for dr, dc in'))proposal=null;
  if(source==='nr, nc = r + dr, c + dc'){
   const inside=x.nr>=0&&x.nr<rows&&x.nc>=0&&x.nc<cols;
   proposal={from:[x.r,x.c],to:[x.nr,x.nc],inside,unlock:inside?grid[x.nr][x.nc]:null,base:null,gap:null,duration:null,depart:null,arrival:null,accepted:null};event='neighbor';
  }
  if(source==='next_time = time + 1'){proposal.base=x.next_time;proposal.duration=1;proposal.arrival=x.next_time;event='candidate';}
  if(source==='gap = grid[nr][nc] - next_time'){proposal.gap=x.gap;event='gap';}
  if(source==='next_time = grid[nr][nc] + gap % 2'){proposal.arrival=x.next_time;event='parity';}
  if(source.startsWith('duration =')){proposal.duration=x.duration;event='duration';}
  if(source==='depart = max(time, moveTime[nr][nc])'){proposal.depart=x.depart;event='depart';}
  if(source==='next_time = depart + duration'){proposal.arrival=x.next_time;event='candidate';}
  if(source==='if next_time < dist[nr][nc]:'){proposal.accepted=record.branch;event=record.branch?'improve':'reject';}
  let bounce=null;
  if(proposal?.inside&&proposal.arrival!==null&&id===2577){
   const path=active.route.nodes,previous=path.length>1?path.at(-2):grid[0][1]<=1?{r:0,c:1}:{r:1,c:0};
   bounce={cell:[previous.r,previous.c],cycles:Math.max(0,(proposal.arrival-active.time-1)/2)};
  }
  if(source==='dist[nr][nc] = next_time'){
   const leg={from:[x.r,x.c],to:[x.nr,x.nc],start:x.time,depart:id===2577?x.next_time-1:x.depart,arrival:x.next_time,duration:id===2577?1:x.duration,wait:x.next_time-x.time-(id===2577?1:x.duration),buddy:id===2577?bounce.cell:null};
   routes.set(key(x.next_time,x.nr,x.nc),{nodes:[...active.route.nodes,{r:x.nr,c:x.nc,time:x.next_time}],legs:[...active.route.legs,leg]});event='write';
  }
  if(source.startsWith('heappush('))event='push';
  if(record.returning)event='return';
  const view={id,line:record.line,source,event,branch:record.branch,grid:grid.map(row=>[...row]),rows,cols,active:copy(active),proposal:copy(proposal),bounce:copy(bounce),trapped,
   dist:x.dist?x.dist.map(row=>[...row]):null,heap:x.heap?x.heap.map(row=>[...row]):null,settled:[...settled],clock:active?.time??0,
   winner:final&&trace.answer>=0?copy(active.route):null,answer:final?trace.answer:null,final};
  const names=active?['time','r','c','nr','nc',...(id===2577?['gap','next_time']:['duration','depart','next_time'])]:['rows','cols'];
  return{arr:[],codeLines:[record.line],final,title:bi(`Dòng ${record.line}`,`Line ${record.line}`),note:bi('',''),vars:names.map(name=>({name,value:x[name]??'—'})),timeRoomView:view};
 });return{original:grid,answer:trace.answer,steps};}
const exported={};for(const id of[2577,3341,3342])exported[id]={...bases[id],code:codeFor(id),debugMode:'line-by-line',inputLabel:bi('Lưới 2×2 đến 8×8 · hàng cách | hoặc JSON','2×2 to 8×8 grid · rows separated by | or JSON'),
 statement:bi(id===2577?'Mỗi giây phải đi 1 ô. Chỉ vào ô khi time ≥ grid[r][c]. Tìm giờ đến đích sớm nhất; không thể thì -1.':`Được đứng chờ. Bắt đầu bước vào ô khi time ≥ moveTime[r][c]. Mỗi bước tốn ${id===3342?'luân phiên 1 rồi 2':'1'} giây.`,id===2577?'Move one cell every second. Enter a cell only at time ≥ grid[r][c]. Find the earliest arrival, or -1.':`Standing wait is allowed. Begin moving into a cell at time ≥ moveTime[r][c]. Moves cost ${id===3342?'alternating 1 and 2 seconds':'1 second'}.`),
 approach:[bi(id===2577?'Chờ bằng cách đi qua lại: +2 giây mỗi vòng. Không thể đứng yên.':`depart = max(time, gate); arrival = depart + ${id===3342?'duration (1,2,1,2,…)':'1'}.`,id===2577?'Wait by moving back and forth: +2 seconds per round trip. Standing still is forbidden.':`depart = max(time, gate); arrival = depart + ${id===3342?'duration (1,2,1,2,…)':'1'}.`)],
 liveArgs:input=>[parse(input,id)],builder:input=>build(input,id)};
module.exports=exported;
