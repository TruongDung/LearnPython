'use strict';
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en}),lines=s=>s.split('\n');
const CODE2065=lines(`import heapq

class Solution:
    def maximalPathQuality(self, values, edges, maxTime):
        graph = [[] for _ in values]
        for u, v, cost in edges:
            graph[u].append((v, cost))
            graph[v].append((u, cost))
        distance = [float('inf')] * len(values)
        distance[0] = 0
        heap = [(0, 0)]
        while heap:
            time, node = heapq.heappop(heap)
            if time != distance[node]:
                continue
            for nxt, cost in graph[node]:
                new_time = time + cost
                if new_time < distance[nxt]:
                    distance[nxt] = new_time
                    heapq.heappush(heap, (new_time, nxt))
        visited = [0] * len(values)
        visited[0] = 1
        answer = 0
        def dfs(node, elapsed, score):
            nonlocal answer
            if node == 0:
                answer = max(answer, score)
            for nxt, cost in graph[node]:
                if elapsed + cost + distance[nxt] > maxTime:
                    continue
                gain = values[nxt] if visited[nxt] == 0 else 0
                visited[nxt] += 1
                dfs(nxt, elapsed + cost, score + gain)
                visited[nxt] -= 1
        dfs(0, 0, values[0])
        return answer`);
const CODE2087=lines(`class Solution:
    def minCost(self, startPos, homePos, rowCosts, colCosts):
        row, col = startPos
        home_row, home_col = homePos
        total = 0
        row_step = 1 if home_row > row else -1
        while row != home_row:
            row += row_step
            total += rowCosts[row]
        col_step = 1 if home_col > col else -1
        while col != home_col:
            col += col_step
            total += colCosts[col]
        return total`);
const CODE2510=lines(`class Solution:
    def isThereAPath(self, grid):
        rows, cols = len(grid), len(grid[0])
        length = rows + cols - 1
        if length % 2:
            return False
        dp = [[set() for _ in range(cols)] for _ in range(rows)]
        for row in range(rows):
            for col in range(cols):
                value = 1 if grid[row][col] else -1
                previous = {0} if row == 0 and col == 0 else set()
                if row > 0:
                    previous |= dp[row - 1][col]
                if col > 0:
                    previous |= dp[row][col - 1]
                dp[row][col] = {balance + value for balance in previous}
        return 0 in dp[-1][-1]`);
function fail(id,message){throw new RangeError(`${id}: ${message}`);}
function number(x){return typeof x==='number'?x:typeof x==='string'&&x.trim()?Number(x):NaN;}
function array(input,id,limit,max){let a=input;try{if(typeof input==='string'){const s=input.trim();a=s.startsWith('[')?JSON.parse(s):s.split(',').map(number);}}catch{a=null;}if(!Array.isArray(a)||!a.length||a.length>limit||!Array.from(a).every(x=>Number.isInteger(x)&&x>=0&&x<=max))fail(id,`use 1–${limit} nonnegative integers, at most ${max}.`);return [...a];}
function graphInput(input,params={}){const values=array(input,2065,8,100000000),budget=number(params.maxTime??49);let edges=params.edges??'0,1,10;1,2,15;0,3,10';try{if(typeof edges==='string'){const s=edges.trim();edges=!s?[]:s.startsWith('[')?JSON.parse(s):s.split(';').map(row=>row.split(',').map(number));}}catch{edges=null;}
 if(!Number.isInteger(budget)||budget<10||budget>100)fail(2065,'maxTime must be in 10…100.');
 if(!Array.isArray(edges)||edges.length>12||!Array.from(edges).every(e=>Array.isArray(e)&&e.length===3&&e.every(Number.isInteger)&&e[0]>=0&&e[0]<values.length&&e[1]>=0&&e[1]<values.length&&e[0]!==e[1]&&e[2]>=10&&e[2]<=100))fail(2065,'use up to 12 edges u,v,time; valid node indices and time in 10…100.');
 edges=edges.map(e=>[...e]);if(new Set(edges.map(([u,v])=>[Math.min(u,v),Math.max(u,v)].join(':'))).size!==edges.length)fail(2065,'each undirected edge must be unique.');
 const adj=values.map(()=>[]);for(const[u,v,cost]of edges){adj[u].push([v,cost]);adj[v].push([u,cost]);}if(adj.some(a=>a.length>4))fail(2065,'each node may have at most four neighbors.');
 // Bound replay size without truncating Python execution or its call stack.
 const distance=values.map(()=>Infinity),done=new Set();distance[0]=0;for(let i=0;i<values.length;i++){let node=-1;for(let j=0;j<values.length;j++)if(!done.has(j)&&(node<0||distance[j]<distance[node]))node=j;if(node<0||!Number.isFinite(distance[node]))break;done.add(node);for(const[nxt,cost]of adj[node])distance[nxt]=Math.min(distance[nxt],distance[node]+cost);}
 let calls=0;function count(node,elapsed){if(++calls>500)fail(2065,'use fewer edges or a smaller maxTime to keep the complete replay within 500 DFS calls.');for(const[nxt,cost]of adj[node])if(elapsed+cost+distance[nxt]<=budget)count(nxt,elapsed+cost);}count(0,0);
 return {values,edges,budget,args:[values,edges,budget]};
}
function robotInput(input,params={}){const rows=array(input,2087,8,10000),cols=array(params.colCosts??'8,2,6,7',2087,8,10000),start=[number(params.startRow??1),number(params.startCol??0)],home=[number(params.homeRow??2),number(params.homeCol??3)];for(const point of[start,home])if(!point.every(Number.isInteger)||point[0]<0||point[0]>=rows.length||point[1]<0||point[1]>=cols.length)fail(2087,'start and home must be inside the cost grid.');return {rows,cols,start,home,args:[start,home,rows,cols]};}
function gridInput(input){let grid=input;try{if(typeof input==='string'){const s=input.trim();grid=s.startsWith('[')?JSON.parse(s):s.split(/[;|\n]/).map(row=>row.split(',').map(number));}}catch{grid=null;}if(!Array.isArray(grid)||!grid.length||grid.length>6||!Array.isArray(grid[0])||!grid[0].length||grid[0].length>6||!Array.from(grid).every(row=>Array.isArray(row)&&row.length===grid[0].length&&Array.from(row).every(x=>x===0||x===1)))fail(2510,'use a rectangular binary grid, at most 6 × 6.');grid=grid.map(row=>[...row]);return {grid,args:[grid]};}
function step(view,code,e){return {arr:[],codeBlock:1,codeLines:[e.line],final:view.final,title:bi(code[e.line-1].trim(),code[e.line-1].trim()),note:bi('',''),vars:Object.entries(view.scalars??{}).map(([name,value])=>({name,value:value??'—'})),pathTripsView:view};}
function buildGraph(input,params={}){const data=graphInput(input,params),native=runTrace({code:CODE2065.join('\n'),method:'maximalPathQuality',args:data.args,traceCalls:['dfs'],summarizeLocals:{graph:0,edges:0,values:0}}),records=[];let best=null,homeReady=false,closedCount=0;
 const steps=native.events.map((e,index)=>{const x=e.locals,o=e.outer,all={...o,...x},text=CODE2065[e.line-1].trim(),after=e.timing!=='before',inDFS=e.scope==='dfs',path=e.frames.filter(f=>f.name==='dfs').map(f=>({node:f.locals.node,elapsed:f.locals.elapsed,score:f.locals.score}));let change=null;
  if(after&&text==='while heap:'&&e.branch===false)homeReady=true;
  if(inDFS&&after&&text==='answer = max(answer, score)'){closedCount++;if(best===null||all.answer>best.score){best={path:path.map(p=>p.node),elapsed:x.elapsed,score:all.answer,step:index};records.push(structuredClone(best));change='best';}else change='home';}
  let phase=!homeReady?'distance':inDFS?'visit':'init';if(e.timing==='before')phase='call';else if(e.returning&&inDFS)phase='return';else if(inDFS&&text==='if node == 0:')phase='home-check';else if(inDFS&&text.startsWith('if elapsed'))phase=e.branch?'prune':'allowed';else if(inDFS&&text.startsWith('gain ='))phase='gain';else if(inDFS&&text==='visited[nxt] += 1')phase='mark';else if(inDFS&&text==='visited[nxt] -= 1')phase='undo';else if(inDFS&&text.startsWith('dfs(nxt,'))phase='resume';if(change)phase=change;
  const candidate=inDFS&&x.nxt!==undefined&&!(text==='for nxt, cost in graph[node]:'&&!e.branch)?{node:x.nxt,cost:x.cost,back:all.distance?.[x.nxt]??null,gain:['gain','mark','call','resume','undo'].includes(phase)?x.gain??null:null,first:['gain','undo'].includes(phase)?all.visited?.[x.nxt]===0:['mark','call','resume'].includes(phase)?all.visited?.[x.nxt]===1:null}:null;
  const final=index===native.events.length-1,view={id:2065,values:data.values,edges:data.edges,budget:data.budget,homeReady,distance:all.distance??null,visited:all.visited??null,path,active:x.node??null,candidate,elapsed:inDFS?x.elapsed:null,score:inDFS?x.score:null,best:best?structuredClone(best):null,records:structuredClone(records),closedCount,phase,change,scalars:Object.fromEntries(['node','elapsed','score','gain','answer'].filter(k=>all[k]!==undefined).map(k=>[k,all[k]])),source:{line:e.line,text,timing:e.timing??'after'},branch:e.branch,trace:native.trace,final,answer:final?native.answer:null};return step(view,CODE2065,e);
 });return {original:data.values,answer:native.answer,steps};}
function buildRobot(input,params={}){const data=robotInput(input,params),native=runTrace({code:CODE2087.join('\n'),method:'minCost',args:data.args}),moves=[];
 const steps=native.events.map((e,index)=>{const x=e.locals,text=CODE2087[e.line-1].trim();if(text==='total += rowCosts[row]')moves.push({axis:'row',at:x.row,from:moves.at(-1)?.to??data.start,to:[x.row,x.col],cost:data.rows[x.row],total:x.total,step:index});if(text==='total += colCosts[col]')moves.push({axis:'col',at:x.col,from:moves.at(-1)?.to??data.start,to:[x.row,x.col],cost:data.cols[x.col],total:x.total,step:index});const final=index===native.events.length-1,view={id:2087,rows:data.rows,cols:data.cols,start:data.start,home:data.home,current:x.row===undefined?null:[x.row,x.col],total:x.total??null,moves:structuredClone(moves),phase:text.startsWith('total +=')?'pay':text==='row += row_step'||text==='col += col_step'?'move':final?'result':'read',scalars:Object.fromEntries(['row','col','total'].filter(k=>x[k]!==undefined).map(k=>[k,x[k]])),source:{line:e.line,text,timing:'after'},trace:native.trace,final,answer:final?native.answer:null};return step(view,CODE2087,e);});return{original:data.rows,answer:native.answer,steps};}
function buildGrid(input){const data=gridInput(input),native=runTrace({code:CODE2510.join('\n'),method:'isThereAPath',args:data.args}),known=data.grid.map(row=>row.map(()=>false)),writes=[];
 const steps=native.events.map((e,index)=>{const x=e.locals,text=CODE2510[e.line-1].trim(),final=index===native.events.length-1;if(text.startsWith('dp[row][col] =')){known[x.row][x.col]=true;writes.push({row:x.row,col:x.col,step:index});}const view={id:2510,grid:data.grid,dp:x.dp??null,known:known.map(row=>[...row]),writes:structuredClone(writes),active:e.line>=9&&e.line<=16&&(e.line!==9||e.branch)?[x.row,x.col]:null,value:e.line>=10&&e.line<=16?x.value??null:null,previous:e.line>=11&&e.line<=16?x.previous??null:null,length:data.grid.length+data.grid[0].length-1,phase:text.startsWith('dp[row][col] =')?'write':final?'result':'read',scalars:Object.fromEntries(['row','col','value','length'].filter(k=>x[k]!==undefined).map(k=>[k,x[k]])),source:{line:e.line,text,timing:'after'},trace:native.trace,final,answer:final?native.answer:null};return step(view,CODE2510,e);});return{original:data.grid,answer:native.answer,steps};}
const make=(id,title,slug,key,statement,code,input,inputKind,complexity)=>({id,title:bi(title,title),titleVi:bi(title,title),slug,category:{key,...({graph:bi('Đồ thị','Graph'),greedy:bi('Tham lam','Greedy'),dp:bi('Quy hoạch động','Dynamic Programming')}[key])},difficulty:id===2065?'hard':'medium',statement:bi(...statement),code,defaultInput:input,inputKind,debugMode:'line-by-line',extraParams:[],approach:[],complexity});
const p2065=make(2065,'Maximum Path Quality of a Graph','maximum-path-quality-of-a-graph','graph',['Xuất phát và kết thúc ở nút 0 trong maxTime. Mỗi nút chỉ cộng điểm một lần, dù được ghé lại.','Start and finish at node 0 within maxTime. Count each node value once, even when revisiting.'],CODE2065,[0,32,10,43],'integer',{time:'O((n + e) log n + 4ᴰ)',space:'O(n + e + D)',note:bi('D ≤ maxTime / min(edge time). Dijkstra cho khoảng cách về 0; DFS thử các chuyến còn kịp về.','D ≤ maxTime / min(edge time). Dijkstra gives return distances; DFS explores trips that can still return.')});
p2065.extraParams=[{key:'edges',type:'string',label:bi('Cạnh u,v,time · ngăn bằng ;','Edges u,v,time · separate with ;'),default:'0,1,10;1,2,15;0,3,10'},{key:'maxTime',label:bi('maxTime','maxTime'),default:49,min:10,max:100}];p2065.inputLabel=bi('values · 1–8 nút · tối đa 500 lời gọi DFS','values · 1–8 nodes · up to 500 DFS calls');p2065.builder=buildGraph;p2065.liveArgs=(input,params)=>graphInput(input,params).args;p2065.visualizationLimits={maxNodes:8,maxEdges:12,maxDFSCalls:500,completeTrace:true};p2065.approach=[bi('Quãng đã đi + cạnh tiếp + đường ngắn nhất về 0 ≤ maxTime. visited là bộ đếm: tăng khi đi, giảm khi quay lui.','Elapsed + next edge + shortest return to 0 ≤ maxTime. visited is a counter: increment on descent, decrement on backtrack.')];
const p2087=make(2087,'Minimum Cost Homecoming of a Robot in a Grid','minimum-cost-homecoming-of-a-robot-in-a-grid','greedy',['Đi tới home bằng bước ngắn nhất. Đi dọc trả phí hàng mới, đi ngang trả phí cột mới; không trả phí ô xuất phát.','Take a direct route home. Vertical moves pay the new row; horizontal moves pay the new column. The start costs nothing.'],CODE2087,[5,4,3],'integer',{time:'O(|Δrow| + |Δcol|)',space:'O(1)',note:bi('Mọi phí không âm: đi vòng không làm giảm tổng.','All fees are nonnegative: detours cannot reduce the total.')});p2087.extraParams=[{key:'colCosts',type:'string',label:bi('colCosts · 1–8 cột','colCosts · 1–8 columns'),default:'8,2,6,7'},...['startRow','startCol','homeRow','homeCol'].map((key,i)=>({key,label:bi(key,key),default:[1,0,2,3][i],min:0,max:7}))];p2087.inputLabel=bi('rowCosts · 1–8 hàng','rowCosts · 1–8 rows');p2087.builder=buildRobot;p2087.liveArgs=(input,params)=>robotInput(input,params).args;
const p2510=make(2510,"Check if There Is a Path With Equal Number of 0's and 1's",'check-if-there-is-a-path-with-equal-number-of-0s-and-1s','dp',['Từ góc trên trái tới góc dưới phải, chỉ đi → hoặc ↓. Có đường nào với số 0 bằng số 1 không?','From top left to bottom right, move only → or ↓. Does a path contain equal counts of zeros and ones?'],CODE2510,'0,1,0,0;0,1,0,0;1,0,1,0','string',{time:'O(mn(m + n))',space:'O(mn(m + n))',note:bi('dp[r][c] chứa các balance có thể đạt: số 1 − số 0. Đích cần balance 0.','dp[r][c] stores reachable balances: ones − zeros. The destination needs balance 0.')});p2510.premium=true;p2510.inputLabel=bi('Grid 0/1 · tối đa 6×6 · ngăn hàng bằng ;','Binary grid · up to 6×6 · separate rows with ;');p2510.builder=buildGrid;p2510.liveArgs=input=>gridInput(input).args;p2510.approach=[bi('Độ dài đường = m + n − 1 phải chẵn. Gộp balance từ trên/trái rồi +1 cho ô 1, −1 cho ô 0.','Path length m + n − 1 must be even. Merge balances from above/left, then add +1 for 1 or −1 for 0.')];
module.exports={2065:p2065,2087:p2087,2510:p2510};
