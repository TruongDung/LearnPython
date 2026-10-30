'use strict';
const base=require('./flood-fill')[695];
const bi=(vi,en)=>({vi,en}),DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
const STACK_CODE=[
 'class Solution:',
 '    def maxAreaOfIsland(self, grid):',
 '        rows, cols = len(grid), len(grid[0])',
 '        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]',
 '        max_area = 0',
 '        for r in range(rows):',
 '            for c in range(cols):',
 '                if grid[r][c] == 1:',
 '                    stack = [(r, c)]',
 '                    grid[r][c] = 0',
 '                    area = 0',
 '                    while stack:',
 '                        cr, cc = stack.pop()',
 '                        area += 1',
 '                        for dr, dc in directions:',
 '                            nr, nc = cr + dr, cc + dc',
 '                            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:',
 '                                grid[nr][nc] = 0',
 '                                stack.append((nr, nc))',
 '                    max_area = max(max_area, area)',
 '        return max_area',
];
const RECURSIVE_CODE=[
 'class Solution:',
 '    def maxAreaOfIsland(self, grid):',
 '        rows, cols = len(grid), len(grid[0])',
 '        max_area = 0',
 '        def dfs(r, c):',
 '            if r < 0 or r >= rows or c < 0 or c >= cols:',
 '                return 0',
 '            if grid[r][c] == 0:',
 '                return 0',
 '            grid[r][c] = 0',
 '            area = 1',
 '            area += dfs(r + 1, c)',
 '            area += dfs(r - 1, c)',
 '            area += dfs(r, c + 1)',
 '            area += dfs(r, c - 1)',
 '            return area',
 '        for r in range(rows):',
 '            for c in range(cols):',
 '                if grid[r][c] == 1:',
 '                    area = dfs(r, c)',
 '                    max_area = max(max_area, area)',
 '        return max_area',
];
const BFS_CODE=[
 'from collections import deque',
 'class Solution:',
 '    def maxAreaOfIsland(self, grid):',
 '        rows, cols = len(grid), len(grid[0])',
 '        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]',
 '        max_area = 0',
 '        for r in range(rows):',
 '            for c in range(cols):',
 '                if grid[r][c] != 1:',
 '                    continue',
 '                queue = deque([(r, c)])',
 '                grid[r][c] = 0',
 '                area = 0',
 '                while queue:',
 '                    cr, cc = queue.popleft()',
 '                    area += 1',
 '                    for dr, dc in directions:',
 '                        nr, nc = cr + dr, cc + dc',
 '                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:',
 '                            grid[nr][nc] = 0',
 '                            queue.append((nr, nc))',
 '                max_area = max(max_area, area)',
 '        return max_area',
];
function visitedCode(queue=false){
 const work=queue?'queue':'stack';
 return [
  ...(queue?['from collections import deque']:[]),
  'class Solution:',
  '    def maxAreaOfIsland(self, grid):',
  '        rows, cols = len(grid), len(grid[0])',
  '        visited = [[False] * cols for _ in range(rows)]',
  '        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]',
  '        max_area = 0',
  '        for r in range(rows):',
  '            for c in range(cols):',
  "                if grid[r][c] != 1 or visited[r][c]:",
  '                    continue',
  `                ${work} = ${queue?'deque([(r, c)])':'[(r, c)]'}`,
  '                visited[r][c] = True',
  '                area = 0',
  `                while ${work}:`,
  `                    cr, cc = ${work}.${queue?'popleft':'pop'}()`,
  '                    area += 1',
  '                    for dr, dc in directions:',
  '                        nr, nc = cr + dr, cc + dc',
  '                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and not visited[nr][nc]:',
  '                            visited[nr][nc] = True',
  `                            ${work}.append((nr, nc))`,
  '                max_area = max(max_area, area)',
  '        return max_area',
 ];
}
const VISITED_DFS_CODE=visitedCode(false),VISITED_BFS_CODE=visitedCode(true);
const UNION_FIND_CODE=[
 'class Solution:',
 '    def maxAreaOfIsland(self, grid):',
 '        rows, cols = len(grid), len(grid[0])',
 '        parent = list(range(rows * cols))',
 '        size = [int(grid[i // cols][i % cols] == 1) for i in range(rows * cols)]',
 '        max_area = max(size, default=0)',
 '        def find(x):',
 '            while parent[x] != x:',
 '                x = parent[x]',
 '            return x',
 '        for r in range(rows):',
 '            for c in range(cols):',
 '                if grid[r][c] != 1:',
 '                    continue',
 '                for dr, dc in [(1, 0), (0, 1)]:',
 '                    nr, nc = r + dr, c + dc',
 '                    if nr < rows and nc < cols and grid[nr][nc] == 1:',
 '                        root1 = find(r * cols + c)',
 '                        root2 = find(nr * cols + nc)',
 '                        if root1 != root2:',
 '                            parent[root2] = root1',
 '                            size[root1] += size[root2]',
 '                            max_area = max(max_area, size[root1])',
 '        return max_area',
];
const LABEL_CODE=[
 'from collections import deque',
 'class Solution:',
 '    def maxAreaOfIsland(self, grid):',
 '        rows, cols = len(grid), len(grid[0])',
 '        labels = [[0] * cols for _ in range(rows)]',
 '        areas = []',
 '        label = 0',
 '        for r in range(rows):',
 '            for c in range(cols):',
 '                if grid[r][c] != 1 or labels[r][c] != 0:',
 '                    continue',
 '                label += 1',
 '                queue = deque([(r, c)])',
 '                labels[r][c] = label',
 '                area = 0',
 '                while queue:',
 '                    cr, cc = queue.popleft()',
 '                    area += 1',
 '                    for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:',
 '                        nr, nc = cr + dr, cc + dc',
 '                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and labels[nr][nc] == 0:',
 '                            labels[nr][nc] = label',
 '                            queue.append((nr, nc))',
 '                areas.append(area)',
 '        return max(areas, default=0)',
];
const APPROACHES=[STACK_CODE,RECURSIVE_CODE,BFS_CODE,VISITED_DFS_CODE,VISITED_BFS_CODE,UNION_FIND_CODE,LABEL_CODE];
function parse(input){
 if(typeof input!=='string'||!input.trim())throw new TypeError('#695: nhập ma trận 0/1 / enter a binary matrix.');
 const grid=input.trim().split('|').map(row=>(row.trim().includes(',')?row.trim().split(','):row.trim().split('')).map(x=>x.trim().replace(/^"|"$/g,'')));
 if(!grid[0].length||grid.some(row=>row.length!==grid[0].length||row.some(x=>!/^[01]$/.test(x))))throw new TypeError('#695: ma trận phải là hình chữ nhật, chỉ chứa 0 và 1 / rectangular 0/1 matrix required.');
 return grid.map(row=>row.map(Number));
}
const copy=value=>Array.isArray(value)?value.map(copy):value;
function build(input,recursive=false){
 const original=parse(input),code=recursive?RECURSIVE_CODE:STACK_CODE,mode=recursive?'recursive':'stack';
 let image=copy(original),owners=original.map(row=>row.map(()=>0)),counted=original.map(row=>row.map(()=>false)),areaOwner=null,bestOwner=null,group=null,nextFrameId=0;
 const x={grid:image},frames=[],history=[],steps=[];
 function replace(matrix,r,c,value){return matrix.map((row,j)=>j===r?row.map((v,k)=>k===c?value:v):row);}
 function mark(r,c){image=replace(image,r,c,0);x.grid=image;owners=replace(owners,r,c,group.id);group.discovered++;}
 function count(r,c){counted=replace(counted,r,c,true);group.units++;}
 function start(r,c){group={id:history.length+1,seed:[r,c],discovered:0,units:0,complete:false,area:null};history.push(group);}
 const optionsFor=(active,neighbor=null,direction=null)=>({active,neighbor,direction});
 function guard(r,c){const row=r>=0&&r<x.rows,col=row?c>=0&&c<x.cols:null,match=row&&col?image[r][c]===1:null;return {row,col,match,allowed:Boolean(row&&col&&match)};}
 function emit(line,phase,title,options={}){
  const f=frames.at(-1),methodLocals=Object.fromEntries(Object.entries(x).map(([key,value])=>[key,key==='grid'?image:copy(value)]));
  const locals=f?{r:f.r,c:f.c,...(f.area===undefined?{}:{area:f.area}),grid:image,rows:x.rows,cols:x.cols}:methodLocals;
  const area=f?f.area??null:x.area??null,maxArea=x.max_area??null;
  const names=recursive?['r','c','area','max_area','rows','cols']:['area','max_area','cr','cc','nr','nc'];
  steps.push({arr:[],title,note:bi('',''),codeLines:[line],final:Boolean(options.final),vars:names.map(name=>({name,value:name==='max_area'?maxArea??'—':locals[name]??'—'})),
   maxIsland695View:{id:695,mode,approach:recursive?2:1,phase,scope:f?'dfs':'maxAreaOfIsland',source:{line,text:code[line-1],timing:'after'},locals,methodLocals,
    image,original,owners,counted,area,maxArea,areaOwner:f?group.id:areaOwner,bestOwner,history:history.map(item=>({...item,seed:[...item.seed]})),
    active:options.active??null,neighbor:options.neighbor??null,direction:options.direction??null,guard:options.guard??null,paint:options.paint??null,
    areaDelta:options.areaDelta??null,bestDelta:options.bestDelta??null,returned:options.returned??null,
    work:recursive?frames.map(frame=>({...frame})):x.stack?copy(x.stack):null,frames:frames.map(frame=>({...frame})),filled:history.reduce((sum,h)=>sum+h.discovered,0),
   },
  });
 }
 function best(line){const before=x.max_area;x.max_area=Math.max(x.max_area,x.area);if(x.area>before)bestOwner=group.id;
  emit(line,'best',bi(`max(${before}, ${x.area}) = ${x.max_area}`,`max(${before}, ${x.area}) = ${x.max_area}`),{bestDelta:{from:before,candidate:x.area,to:x.max_area,improved:x.max_area>before,owner:group.id}});
 }
 x.rows=original.length;x.cols=original[0].length;emit(3,'dimensions',bi('Kích thước grid','Grid dimensions'));
 if(recursive){
  x.max_area=0;emit(4,'best-init',bi('max_area = 0','max_area = 0'));emit(5,'define',bi('Tạo dfs','Define dfs'));
  function dfs(r,c){const f={id:nextFrameId++,r,c};frames.push(f);const active=[r,c],g=guard(r,c);
   emit(6,'bounds',bi('Trong biên ?','Inside grid ?'),{active,guard:{...g,match:null,allowed:null}});
   if(!g.row||!g.col){emit(7,'return-outside',bi('↩ Ngoài biên: 0','↩ Outside: 0'),{active,guard:{...g,match:null,allowed:false},returned:0});frames.pop();return 0;}
   emit(8,'guard',bi(g.match?'✓ Đất chưa thăm':'× Nước / đã thăm',g.match?'✓ Unvisited land':'× Water / visited'),{active,guard:g});
   if(!g.match){emit(9,'return-water',bi('↩ Nước / đã thăm: 0','↩ Water / visited: 0'),{active,guard:g,returned:0});frames.pop();return 0;}
   mark(r,c);emit(10,'paint',bi('Đánh dấu 1 → 0','Mark 1 → 0'),{active,paint:{r,c,from:1,to:0,owner:group.id}});
   f.area=1;count(r,c);emit(11,'area-init',bi('Ô này đóng góp +1','This cell adds +1'),{active,areaDelta:{from:null,add:1,to:1,unit:[r,c]}});
   DIRS.forEach(([dr,dc],j)=>{const result=dfs(r+dr,c+dc),before=f.area;f.area+=result;emit(12+j,'resume',bi(`↩ ${before} + ${result} = ${f.area}`,`↩ ${before} + ${result} = ${f.area}`),{active,neighbor:[r+dr,c+dc],direction:[dr,dc],returned:result,areaDelta:{from:before,add:result,to:f.area}});});
   emit(16,'return-area',bi(`↩ return ${f.area}`,`↩ return ${f.area}`),{active,returned:f.area});frames.pop();return f.area;
  }
  for(let r=0;r<x.rows;r++){x.r=r;emit(17,'scan-row',bi(`Hàng ${r}`,`Row ${r}`));
   for(let c=0;c<x.cols;c++){x.c=c;const active=[r,c];emit(18,'scan',bi(`Quét (${r}, ${c})`,`Scan (${r}, ${c})`),{active});const land=image[r][c]===1;
    emit(19,'land-check',bi(land?'✓ Bắt đầu đảo':'× Bỏ qua',land?'✓ Start island':'× Skip'),{active});if(!land)continue;
    start(r,c);const before=x.area??null;x.area=dfs(r,c);areaOwner=group.id;group.complete=true;group.area=x.area;
    emit(20,'island-return',bi(`Diện tích đảo #${group.id}: ${x.area}`,`Island #${group.id} area: ${x.area}`),{active,returned:x.area,areaDelta:{from:before,to:x.area}});best(21);
   }
   emit(18,'columns-end',bi('Hết cột trong hàng','Row complete'));
  }
  emit(17,'rows-end',bi('Đã quét hết grid','Grid scan complete'));emit(22,'done',bi(`Diện tích lớn nhất: ${x.max_area}`,`Largest area: ${x.max_area}`),{final:true});
 }else{
  x.directions=DIRS;emit(4,'directions',bi('4 hướng cạnh','4 edge directions'));x.max_area=0;emit(5,'best-init',bi('max_area = 0','max_area = 0'));
  for(let r=0;r<x.rows;r++){x.r=r;emit(6,'scan-row',bi(`Hàng ${r}`,`Row ${r}`));
   for(let c=0;c<x.cols;c++){x.c=c;const active=[r,c];emit(7,'scan',bi(`Quét (${r}, ${c})`,`Scan (${r}, ${c})`),{active});const land=image[r][c]===1;
    emit(8,'land-check',bi(land?'✓ Bắt đầu đảo':'× Bỏ qua',land?'✓ Start island':'× Skip'),{active});if(!land)continue;
    start(r,c);x.stack=[[r,c]];emit(9,'work-init',bi('stack ← ô đầu đảo','stack ← island seed'),{active});mark(r,c);emit(10,'paint',bi('Đánh dấu 1 → 0','Mark 1 → 0'),{active,paint:{r,c,from:1,to:0,owner:group.id}});
    const before=x.area??null;x.area=0;areaOwner=group.id;emit(11,'area-init',bi('area = 0','area = 0'),{active,areaDelta:{from:before,to:0}});
    while(x.stack.length){emit(12,'while',bi('stack ≠ ∅','stack ≠ ∅'));[x.cr,x.cc]=x.stack.pop();const here=[x.cr,x.cc];emit(13,'take',bi(`Lấy (${x.cr}, ${x.cc})`,`Take (${x.cr}, ${x.cc})`),{active:here});
     const previous=x.area;x.area++;count(x.cr,x.cc);emit(14,'area-add',bi(`area: ${previous} → ${x.area}`,`area: ${previous} → ${x.area}`),{active:here,areaDelta:{from:previous,add:1,to:x.area,unit:here}});
     for(const [dr,dc]of DIRS){x.dr=dr;x.dc=dc;emit(15,'direction',bi('Chọn hướng','Choose direction'),{active:here,direction:[dr,dc]});x.nr=x.cr+dr;x.nc=x.cc+dc;const options=optionsFor(here,[x.nr,x.nc],[dr,dc]);emit(16,'neighbor',bi(`Xét (${x.nr}, ${x.nc})`,`Inspect (${x.nr}, ${x.nc})`),options);
      const g=guard(x.nr,x.nc);emit(17,'guard',bi(g.allowed?'✓ Thuộc đảo này':'× Bỏ qua',g.allowed?'✓ Same island':'× Skip'),{...options,guard:g});if(!g.allowed)continue;
      mark(x.nr,x.nc);emit(18,'paint',bi('Đánh dấu 1 → 0','Mark 1 → 0'),{...options,paint:{r:x.nr,c:x.nc,from:1,to:0,owner:group.id}});x.stack.push([x.nr,x.nc]);emit(19,'append',bi('Thêm vào stack','Append to stack'),options);
     }
     emit(15,'directions-end',bi('Đã xét 4 hướng','4 directions checked'),{active:here});
    }
    group.complete=true;group.area=x.area;emit(12,'empty',bi(`Đảo #${group.id}: ${x.area} ô`,`Island #${group.id}: ${x.area} cells`));best(20);
   }
   emit(7,'columns-end',bi('Hết cột trong hàng','Row complete'));
  }
  emit(6,'rows-end',bi('Đã quét hết grid','Grid scan complete'));emit(21,'done',bi(`Diện tích lớn nhất: ${x.max_area}`,`Largest area: ${x.max_area}`),{final:true});
 }
 return {original,answer:x.max_area,steps};
}
function buildAlternative(input,approach){
 const original=parse(input),code=APPROACHES[approach-1],queueMode=[3,5,7].includes(approach),visitedMode=[4,5].includes(approach),unionMode=approach===6,labelMode=approach===7;
 const mode=approach===3?'queue':approach===4?'visited-stack':approach===5?'visited-queue':approach===6?'union-find':approach===7?'labels':'stack';
 let image=copy(original),owners=original.map(row=>row.map(()=>0)),counted=original.map(row=>row.map(()=>false)),visited=original.map(row=>row.map(()=>false)),labels=original.map(row=>row.map(()=>0));
 let maxArea=0,bestOwner=null,activeGroup=null,nextGroup=0,work=null;
 const rows=original.length,cols=original[0].length,steps=[],history=[],parent=Array.from({length:rows*cols},(_,i)=>i),sizes=original.flat().map(Number);
 const line=(text,occurrence=0)=>{let from=0,index=-1;for(let i=0;i<=occurrence;i++){index=code.indexOf(text,from);if(index<0)throw new Error(`Missing #695 source line: ${text}`);from=index+text.length;}return index+1;};
 const replace=(matrix,r,c,value)=>matrix.map((row,j)=>j===r?row.map((v,k)=>k===c?value:v):row);
 const root=id=>{while(parent[id]!==id)id=parent[id];return id;};
 if(unionMode){owners=original.map((row,r)=>row.map((value,c)=>value?root(r*cols+c)+1:0));counted=original.map(row=>row.map(Boolean));}
 const groups=()=>{
  if(!unionMode)return history.map(h=>({...h,seed:[...h.seed]}));
  const found=new Map();original.forEach((row,r)=>row.forEach((value,c)=>{if(!value)return;const id=root(r*cols+c);if(!found.has(id))found.set(id,{id:id+1,seed:[Math.floor(id/cols),id%cols],discovered:0,units:0,complete:true,area:0});const h=found.get(id);h.discovered++;h.units++;h.area++;}));
  return [...found.values()];
 };
 function emit(sourceLine,phase,title,options={}){
  const islandHistory=groups(),area=activeGroup?.area??null,areaOwner=activeGroup?.id??null;
  const best=unionMode?islandHistory.reduce((winner,h)=>!winner||h.area>winner.area?h:winner,null):null;
  const currentMax=unionMode?Math.max(0,...islandHistory.map(h=>h.area)):maxArea;
  const currentBest=unionMode?best?.id??null:bestOwner;
  const locals={rows,cols,grid:copy(image),max_area:currentMax,r:options.r??null,c:options.c??null,...(work?{[queueMode?'queue':'stack']:copy(work)}:{}),...(visitedMode?{visited:copy(visited)}:{}),...(labelMode?{labels:copy(labels)}:{}),...(unionMode?{parent:[...parent],size:[...sizes]}:{})};
  steps.push({arr:[],title,note:bi('',''),codeLines:[sourceLine],final:Boolean(options.final),vars:['area','max_area','r','c','cr','cc','nr','nc'].map(name=>({name,value:name==='area'?area??'—':name==='max_area'?currentMax:locals[name]??'—'})),
   maxIsland695View:{id:695,approach,mode,phase,scope:options.scope??'maxAreaOfIsland',source:{line:sourceLine,text:code[sourceLine-1],timing:'after'},locals,methodLocals:locals,
    image:copy(image),original,owners:copy(owners),counted:copy(counted),visited:visitedMode?copy(visited):null,labels:labelMode?copy(labels):null,parent:unionMode?[...parent]:null,size:unionMode?[...sizes]:null,
    area,maxArea:currentMax,areaOwner,bestOwner:currentBest,history:islandHistory,active:options.active??null,neighbor:options.neighbor??null,direction:options.direction??null,guard:options.guard??null,
    paint:options.paint??null,areaDelta:options.areaDelta??null,bestDelta:options.bestDelta??null,returned:options.returned??null,
    work:copy(work),frames:[],filled:counted.flat().filter(Boolean).length,
   }});
 }
 function changeMax(candidate,sourceLine,owner){
  const before=maxArea;maxArea=Math.max(maxArea,candidate);if(maxArea>before)bestOwner=owner;
  emit(sourceLine,'best',bi(`max(${before}, ${candidate}) = ${maxArea}`,`max(${before}, ${candidate}) = ${maxArea}`),{bestDelta:{from:before,candidate,to:maxArea,improved:maxArea>before,owner}});
 }
 function begin(r,c){
  activeGroup={id:++nextGroup,seed:[r,c],discovered:0,units:0,complete:false,area:null};history.push(activeGroup);
 }
 function discover(r,c){
  owners=replace(owners,r,c,activeGroup.id);activeGroup.discovered++;
  if(!visitedMode&&!labelMode)image=replace(image,r,c,0);
  if(visitedMode)visited=replace(visited,r,c,true);
  if(labelMode)labels=replace(labels,r,c,activeGroup.id);
 }
 function take(r,c){
  counted=replace(counted,r,c,true);activeGroup.units++;
  const before=activeGroup.area??0;activeGroup.area=before+1;
  emit(line(approach===3?'                    area += 1':approach===4||approach===5?'                    area += 1':'                    area += 1'),'area-add',bi(`area: ${before} → ${activeGroup.area}`,`area: ${before} → ${activeGroup.area}`),{active:[r,c],areaDelta:{from:before,add:1,to:activeGroup.area,unit:[r,c]},r,c});
 }
 function flood(){
  const isVisited=visitedMode||labelMode,workName=queueMode?'queue':'stack',initLine=approach===4?line('                stack = [(r, c)]'):line('                queue = deque([(r, c)])');
  work=[[x.r,x.c]];emit(initLine,'work-init',bi(`${workName} ← ô đầu đảo`,`${workName} ← island seed`),{active:[x.r,x.c],r:x.r,c:x.c});
  const discoveryLine=approach===3?line('                grid[r][c] = 0'):approach===4||approach===5?line('                visited[r][c] = True'):line('                labels[r][c] = label');
  discover(x.r,x.c);emit(discoveryLine,approach===3?'paint':'visit',bi(approach===3?'Đánh dấu 1 → 0':labelMode?'Gán nhãn ô đầu':'Đánh dấu đã thăm',approach===3?'Mark 1 → 0':labelMode?'Label seed cell':'Mark visited'),{active:[x.r,x.c],paint:approach===3?{r:x.r,c:x.c,from:1,to:0,owner:activeGroup.id}:null,r:x.r,c:x.c});
  const initAreaLine=approach===3?line('                area = 0'):approach===4||approach===5?line('                area = 0'):line('                area = 0');
  activeGroup.area=0;emit(initAreaLine,'area-init',bi('area = 0','area = 0'),{active:[x.r,x.c],areaDelta:{from:null,to:0},r:x.r,c:x.c});
  while(work.length){
   const whileLine=approach===7?line('                while queue:'):line(queueMode?'                while queue:':'                while stack:');
   emit(whileLine,'while',bi(`${workName} ≠ ∅`,`${workName} ≠ ∅`),{r:x.r,c:x.c});
   const [r,c]=queueMode?work.shift():work.pop(),takeLine=approach===7?line('                    cr, cc = queue.popleft()'):line(queueMode?'                    cr, cc = queue.popleft()':'                    cr, cc = stack.pop()');emit(takeLine,'take',bi(`Lấy (${r}, ${c})`,`Take (${r}, ${c})`),{active:[r,c],r,c});
   take(r,c);
   for(const [dr,dc]of DIRS){
    const active=[r,c],neighbor=[r+dr,c+dc],directionSource=approach===7?'                    for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:':'                    for dr, dc in directions:';emit(line(directionSource),'direction',bi('Chọn hướng','Choose direction'),{active,direction:[dr,dc],r,c});
    const nr=r+dr,nc=c+dc,row=nr>=0&&nr<rows,col=row?nc>=0&&nc<cols:null,match=row&&col&&image[nr][nc]===1&&(labelMode?labels[nr][nc]===0:!visitedMode||!visited[nr][nc]),guard={row,col,match,allowed:Boolean(row&&col&&match)};
    const guardLine=approach===3?line('                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:'):approach===4||approach===5?line('                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and not visited[nr][nc]:'):line('                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and labels[nr][nc] == 0:');
    emit(guardLine,'guard',bi(guard.allowed?'✓ Cùng đảo':'× Bỏ qua',guard.allowed?'✓ Same island':'× Skip'),{active,neighbor,direction:[dr,dc],guard,r,c,nr,nc});
    if(!guard.allowed)continue;
    const markLine=approach===3?line('                            grid[nr][nc] = 0'):approach===4||approach===5?line('                            visited[nr][nc] = True'):line('                            labels[nr][nc] = label');
    discover(nr,nc);emit(markLine,approach===3?'paint':'visit',bi(approach===3?'Đánh dấu 1 → 0':'Đánh dấu ô đã thăm',approach===3?'Mark 1 → 0':'Mark visited'),{active,neighbor,paint:approach===3?{r:nr,c:nc,from:1,to:0,owner:activeGroup.id}:null,r,c,nr,nc});
    work.push(neighbor);emit(line(queueMode?'                            queue.append((nr, nc))':approach===4?'                            stack.append((nr, nc))':'                            queue.append((nr, nc))'),'append',bi(`Thêm vào ${workName}`,`Append to ${workName}`),{active,neighbor,r,c,nr,nc});
   }
  }
  activeGroup.complete=true;activeGroup.area=activeGroup.units;
  const bestLine=approach===3?line('                max_area = max(max_area, area)'):approach===4||approach===5?line('                max_area = max(max_area, area)'):line('                areas.append(area)');
  if(labelMode){const before=maxArea;maxArea=Math.max(maxArea,activeGroup.area);if(maxArea>before)bestOwner=activeGroup.id;emit(bestLine,'component-complete',bi(`Nhãn #${activeGroup.id}: ${activeGroup.area} ô`,`Label #${activeGroup.id}: ${activeGroup.area} cells`),{active:[x.r,x.c],bestDelta:{from:before,candidate:activeGroup.area,to:maxArea,improved:maxArea>before,owner:activeGroup.id},r:x.r,c:x.c});}
  else changeMax(activeGroup.area,bestLine,activeGroup.id);
 }
 const x={rows,cols,r:0,c:0};
 if(!unionMode){
  const dimLine=line('        rows, cols = len(grid), len(grid[0])');emit(dimLine,'dimensions',bi('Kích thước grid','Grid dimensions'));
  if(visitedMode){const lineNo=line('        visited = [[False] * cols for _ in range(rows)]');emit(lineNo,'visited-init',bi('Khởi tạo visited','Initialize visited'));}
  if(labelMode){emit(line('        labels = [[0] * cols for _ in range(rows)]'),'labels-init',bi('Khởi tạo nhãn component','Initialize component labels'));emit(line('        areas = []'),'areas-init',bi('Khởi tạo danh sách diện tích','Initialize component areas'));emit(line('        label = 0'),'label-init',bi('label = 0','label = 0'));}
  else emit(line('        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]'),'directions',bi('4 hướng cạnh','4 edge directions'));
  if(!labelMode)emit(line('        max_area = 0'),'best-init',bi('max_area = 0','max_area = 0'));
  for(let r=0;r<rows;r++){x.r=r;emit(line('        for r in range(rows):'),'scan-row',bi(`Hàng ${r}`,`Row ${r}`),{r});
   for(let c=0;c<cols;c++){x.c=c;const active=[r,c];emit(line('            for c in range(cols):'),'scan',bi(`Quét (${r}, ${c})`,`Scan (${r}, ${c})`),{active,r,c});
    const land=image[r][c]===1&&(!visitedMode||!visited[r][c])&&(!labelMode||labels[r][c]===0),check=labelMode?'                if grid[r][c] != 1 or labels[r][c] != 0:':visitedMode?'                if grid[r][c] != 1 or visited[r][c]:':'                if grid[r][c] != 1:';
    emit(line(check),'land-check',bi(land?'✓ Bắt đầu đảo':'× Bỏ qua',land?'✓ Start island':'× Skip'),{active,guard:{row:true,col:true,match:land,allowed:land},r,c});
    if(!land){emit(line('                    continue'),'continue',bi('Tiếp tục quét','Continue scan'),{active,r,c});continue;}
    if(labelMode){activeGroup=null;emit(line('                label += 1'),'label-next',bi(`label = ${nextGroup+1}`,`label = ${nextGroup+1}`),{active,r,c});}
    begin(r,c);
    if(labelMode)x.label=activeGroup.id;
    flood();
   }
  }
  if(labelMode){emit(line('        return max(areas, default=0)'),'done',bi(`Diện tích lớn nhất: ${maxArea}`,`Largest area: ${maxArea}`),{final:true});}
  else emit(line('        return max_area'),'done',bi(`Diện tích lớn nhất: ${maxArea}`,`Largest area: ${maxArea}`),{final:true});
  return {original,answer:maxArea,steps};
 }
 // Union-Find starts with one set for each land cell and unions only right/down neighbors.
 const parentInit=line('        parent = list(range(rows * cols))'),sizeInit=line('        size = [int(grid[i // cols][i % cols] == 1) for i in range(rows * cols)]');
 emit(line('        rows, cols = len(grid), len(grid[0])'),'dimensions',bi('Kích thước grid','Grid dimensions'));
 emit(parentInit,'parent-init',bi('Khởi tạo parent','Initialize parent'));
 emit(sizeInit,'size-init',bi('Mỗi ô đất có size = 1','Each land cell starts with size = 1'));
 maxArea=Math.max(0,...sizes);
 emit(line('        max_area = max(size, default=0)'),'best-init',bi(`max_area = ${maxArea}`,`max_area = ${maxArea}`));
 function find(id){
  let value=id;while(parent[value]!==value){x.find=value;emit(line('            while parent[x] != x:'),'find-check',bi(`parent[${value}] ≠ ${value}`,`parent[${value}] ≠ ${value}`),{active:[Math.floor(id/cols),id%cols],scope:'find'});value=parent[value];x.find=value;emit(line('                x = parent[x]'),'find-step',bi(`Đi lên ${value}`,`Follow parent to ${value}`),{active:[Math.floor(id/cols),id%cols],scope:'find'});}
  emit(line('            return x'),'find-root',bi(`Gốc = ${value}`,`Root = ${value}`),{active:[Math.floor(id/cols),id%cols],scope:'find'});return value;
 }
 function refreshUnionOwners(){
  owners=original.map((row,r)=>row.map((value,c)=>value?root(r*cols+c)+1:0));
  counted=original.map(row=>row.map(Boolean));
 }
 const scanR=line('        for r in range(rows):'),scanC=line('            for c in range(cols):'),landCheck=line('                if grid[r][c] != 1:'),directionLine=line('                for dr, dc in [(1, 0), (0, 1)]:'),neighborIf=line('                    if nr < rows and nc < cols and grid[nr][nc] == 1:'),rootOne=line('                        root1 = find(r * cols + c)'),rootTwo=line('                        root2 = find(nr * cols + nc)'),joinCheck=line('                        if root1 != root2:'),parentJoin=line('                            parent[root2] = root1'),sizeJoin=line('                            size[root1] += size[root2]'),maxJoin=line('                            max_area = max(max_area, size[root1])');
 for(let r=0;r<rows;r++){x.r=r;emit(scanR,'scan-row',bi(`Hàng ${r}`,`Row ${r}`),{r});
  for(let c=0;c<cols;c++){x.c=c;const active=[r,c];emit(scanC,'scan',bi(`Quét (${r}, ${c})`,`Scan (${r}, ${c})`),{active,r,c});
   const land=original[r][c]===1;emit(landCheck,'land-check',bi(land?'✓ Ô đất':'× Nước',land?'✓ Land cell':'× Water'),{active,guard:{row:true,col:true,match:land,allowed:land},r,c});if(!land){emit(line('                    continue'),'continue',bi('Tiếp tục quét','Continue scan'),{active,r,c});continue;}
   for(const[dr,dc]of [[1,0],[0,1]]){const nr=r+dr,nc=c+dc,neighbor=[nr,nc],inBounds=nr<rows&&nc<cols,match=inBounds&&original[nr][nc]===1;emit(directionLine,'direction',bi('Xét phải / xuống','Check right / down'),{active,direction:[dr,dc],r,c});
    x.nr=nr;x.nc=nc;const g={row:nr<rows,col:nc<cols,match:inBounds?match:null,allowed:Boolean(match)};emit(neighborIf,'neighbor-check',bi(g.allowed?'✓ Ô đất cạnh':'× Bỏ qua',g.allowed?'✓ Adjacent land':'× Skip'),{active,neighbor,direction:[dr,dc],guard:g,r,c,nr,nc});if(!match)continue;
    const root1=find(r*cols+c);x.root1=root1;emit(rootOne,'find-root1',bi(`root1 = ${root1}`,`root1 = ${root1}`),{active,neighbor,r,c,nr,nc});const root2=find(nr*cols+nc);x.root2=root2;emit(rootTwo,'find-root2',bi(`root2 = ${root2}`,`root2 = ${root2}`),{active,neighbor,r,c,nr,nc});
    const merged=root1!==root2;emit(joinCheck,'union-check',bi(merged?'Hai gốc khác nhau':'Đã cùng component',merged?'Different roots':'Already connected'),{active,neighbor,guard:{row:true,col:true,match:merged,allowed:merged},r,c,nr,nc});if(!merged)continue;
    parent[root2]=root1;emit(parentJoin,'union-parent',bi(`parent[${root2}] = ${root1}`,`parent[${root2}] = ${root1}`),{active,neighbor,r,c,nr,nc});sizes[root1]+=sizes[root2];refreshUnionOwners();emit(sizeJoin,'union-size',bi(`size[${root1}] = ${sizes[root1]}`,`size[${root1}] = ${sizes[root1]}`),{active,neighbor,r,c,nr,nc});
    const before=maxArea;maxArea=Math.max(maxArea,sizes[root1]);if(maxArea>before)bestOwner=root1+1;emit(maxJoin,'best',bi(`max_area = ${maxArea}`,`max_area = ${maxArea}`),{active,neighbor,bestDelta:{from:before,candidate:sizes[root1],to:maxArea,improved:maxArea>before,owner:root1+1},r,c,nr,nc});
   }
  }
 }
 emit(line('        return max_area'),'done',bi(`Diện tích lớn nhất: ${maxArea}`,`Largest area: ${maxArea}`),{final:true});
 return {original,answer:maxArea,steps};
}
const approachLabels=[
 ['DFS stack','Iterative DFS (stack)'],
 ['DFS đệ quy','Recursive DFS'],
 ['BFS queue, đổi grid tại chỗ','BFS queue, in-place marking'],
 ['DFS stack + visited','DFS stack + visited matrix'],
 ['BFS queue + visited','BFS queue + visited matrix'],
 ['Union-Find','Union-Find'],
 ['Gán nhãn component','Label components, then compare areas'],
];
module.exports={695:{...base,code:STACK_CODE,code2:RECURSIVE_CODE,code3:BFS_CODE,code4:VISITED_DFS_CODE,code5:VISITED_BFS_CODE,code6:UNION_FIND_CODE,code7:LABEL_CODE,
 builder:(input,params={})=>{const approach=Math.max(1,Math.min(7,Number(params.approach)||1));return approach<=2?build(input,approach===2):buildAlternative(input,approach);},
 builder2:input=>build(input,true),builder3:input=>buildAlternative(input,3),builder4:input=>buildAlternative(input,4),builder5:input=>buildAlternative(input,5),builder6:input=>buildAlternative(input,6),builder7:input=>buildAlternative(input,7),
 liveArgs:input=>[parse(input)],debugMode:'line-by-line',
 codeLabel:bi(`Cách 1: ${approachLabels[0][0]}`,`Approach 1: ${approachLabels[0][1]}`),
 ...Object.fromEntries(approachLabels.slice(1).map(([vi,en],i)=>[`code${i+2}Label`,bi(`Cách ${i+2}: ${vi}`,`Approach ${i+2}: ${en}`)])),
 extraParams:base.extraParams.map(p=>p.key==='approach'?{...p,options:approachLabels.map(([vi,en],i)=>({value:String(i+1),label:bi(`Cách ${i+1}: ${vi}`,`Approach ${i+1}: ${en}`)}))}:p),
 approach:approachLabels.map(([vi,en])=>bi(`${vi}: duyệt component đất 4 hướng để tìm diện tích lớn nhất.`,`${en}: traverse four-connected land components to find the largest area.`)),
}};
