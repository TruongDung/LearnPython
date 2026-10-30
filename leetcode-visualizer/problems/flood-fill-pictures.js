'use strict';
const base=require('./flood-fill');
const bi=(vi,en)=>({vi,en});
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
function iterativeCode(queue=false){const work=queue?'queue':'stack';return [
  ...(queue?['from collections import deque']:[]),
  'class Solution:',
  '    def floodFill(self, image, sr, sc, color):',
  '        rows, cols = len(image), len(image[0])',
  '        old = image[sr][sc]',
  '        if old == color:',
  '            return image',
  '        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]',
  `        ${work} = ${queue?'deque([(sr, sc)])':'[(sr, sc)]'}`,
  '        image[sr][sc] = color',
  `        while ${work}:`,
  `            r, c = ${work}.${queue?'popleft':'pop'}()`,
  '            for dr, dc in directions:',
  '                nr, nc = r + dr, c + dc',
  '                if 0 <= nr < rows and 0 <= nc < cols and image[nr][nc] == old:',
  '                    image[nr][nc] = color',
  `                    ${work}.append((nr, nc))`,
  '        return image',
];}
const RECURSIVE=[
  'class Solution:',
  '    def floodFill(self, image, sr, sc, color):',
  '        rows, cols = len(image), len(image[0])',
  '        old = image[sr][sc]',
  '        if old == color:',
  '            return image',
  '        def dfs(r, c):',
  '            if r < 0 or r >= rows or c < 0 or c >= cols:',
  '                return',
  '            if image[r][c] != old:',
  '                return',
  '            image[r][c] = color',
  '            dfs(r + 1, c)',
  '            dfs(r - 1, c)',
  '            dfs(r, c + 1)',
  '            dfs(r, c - 1)',
  '        dfs(sr, sc)',
  '        return image',
];
const ISLANDS=[
  'class Solution:',
  '    def numIslands(self, grid):',
  '        rows, cols = len(grid), len(grid[0])',
  '        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]',
  '        islands = 0',
  '        for r in range(rows):',
  '            for c in range(cols):',
  "                if grid[r][c] == '1':",
  '                    islands += 1',
  '                    stack = [(r, c)]',
  "                    grid[r][c] = '0'",
  '                    while stack:',
  '                        cr, cc = stack.pop()',
  '                        for dr, dc in directions:',
  '                            nr, nc = cr + dr, cc + dc',
  "                            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1':",
  "                                grid[nr][nc] = '0'",
  '                                stack.append((nr, nc))',
  '        return islands',
];
const ISLANDS_RECURSIVE=[
  'class Solution:',
  '    def numIslands(self, grid):',
  '        rows, cols = len(grid), len(grid[0])',
  '        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]',
  '        islands = 0',
  '        def dfs(r, c):',
  '            if r < 0 or r >= rows or c < 0 or c >= cols:',
  '                return',
  "            if grid[r][c] != '1':",
  '                return',
  "            grid[r][c] = '0'",
  '            for dr, dc in directions:',
  '                dfs(r + dr, c + dc)',
  '        for r in range(rows):',
  '            for c in range(cols):',
  "                if grid[r][c] == '1':",
  '                    islands += 1',
  '                    dfs(r, c)',
  '        return islands',
];
const ISLANDS_QUEUE=[
  'from collections import deque',
  'class Solution:',
  '    def numIslands(self, grid):',
  '        rows, cols = len(grid), len(grid[0])',
  '        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]',
  '        islands = 0',
  '        for r in range(rows):',
  '            for c in range(cols):',
  "                if grid[r][c] != '1':",
  '                    continue',
  '                islands += 1',
  '                queue = deque([(r, c)])',
  "                grid[r][c] = '0'",
  '                while queue:',
  '                    cr, cc = queue.popleft()',
  '                    for dr, dc in directions:',
  '                        nr, nc = cr + dr, cc + dc',
  "                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1':",
  "                            grid[nr][nc] = '0'",
  '                            queue.append((nr, nc))',
  '        return islands',
];
const ISLANDS_VISITED=[
  'class Solution:',
  '    def numIslands(self, grid):',
  '        rows, cols = len(grid), len(grid[0])',
  '        visited = [[False] * cols for _ in range(rows)]',
  '        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]',
  '        islands = 0',
  '        for r in range(rows):',
  '            for c in range(cols):',
  "                if grid[r][c] != '1' or visited[r][c]:",
  '                    continue',
  '                islands += 1',
  '                stack = [(r, c)]',
  '                visited[r][c] = True',
  '                while stack:',
  '                    cr, cc = stack.pop()',
  '                    for dr, dc in directions:',
  '                        nr, nc = cr + dr, cc + dc',
  "                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1' and not visited[nr][nc]:",
  '                            visited[nr][nc] = True',
  '                            stack.append((nr, nc))',
  '        return islands',
];
const ISLANDS_UNION_FIND=[
  'class Solution:',
  '    def numIslands(self, grid):',
  '        rows, cols = len(grid), len(grid[0])',
  '        parent = list(range(rows * cols))',
  '        islands = sum(cell == "1" for row in grid for cell in row)',
  '        def find(x):',
  '            while parent[x] != x:',
  '                x = parent[x]',
  '            return x',
  '        for r in range(rows):',
  '            for c in range(cols):',
  "                if grid[r][c] != '1':",
  '                    continue',
  '                for dr, dc in [(1, 0), (0, 1)]:',
  '                    nr, nc = r + dr, c + dc',
  "                    if nr < rows and nc < cols and grid[nr][nc] == '1':",
  '                        root1 = find(r * cols + c)',
  '                        root2 = find(nr * cols + nc)',
  '                        if root1 != root2:',
  '                            parent[root2] = root1',
  '                            islands -= 1',
  '        return islands',
];
function parse(input,id){
  if(typeof input!=='string'||!input.trim())throw new TypeError(`#${id}: nhập ma trận chữ nhật / enter a rectangular matrix.`);
  const raw=input.trim().split('|').map(row=>row.trim()).map(row=>(row.includes(',')?row.split(','):row.split('')).map(x=>x.trim().replace(/^"|"$/g,'')));
  if(!raw[0].length||raw.some(row=>row.length!==raw[0].length||row.some(x=>id===200?!/^[01]$/.test(x):!/^[-+]?\d+$/.test(x)||!Number.isSafeInteger(Number(x)))))throw new TypeError(`#${id}: ma trận không hợp lệ / invalid matrix.`);
  return id===200?raw:raw.map(row=>row.map(Number));
}
function args733(input,params={}){
  const image=parse(input,733),sr=Number(params.start_row??params.sr??1),sc=Number(params.start_col??params.sc??1),color=Number(params.color??2);
  if(!Number.isInteger(sr)||!Number.isInteger(sc)||sr<0||sc<0||sr>=image.length||sc>=image[0].length||!Number.isSafeInteger(color))throw new RangeError('#733: sr/sc phải nằm trong image; color là số nguyên / sr/sc must be inside image; color must be an integer.');
  return [image,sr,sc,color];
}
const copy=value=>Array.isArray(value)?value.map(copy):value;
function recorder(id,code,original,locals,mode,start=null,approach=1){
  const steps=[],frames=[];let image=copy(original),owners=original.map(row=>row.map(()=>0)),nextId=0;
  function paint(r,c,value,owner=0){image=image.map((row,j)=>j===r?row.map((x,k)=>k===c?value:x):row);locals[id===200?'grid':'image']=image;if(owner)owners=owners.map((row,j)=>j===r?row.map((x,k)=>k===c?owner:x):row);}
  function setOwners(next){owners=copy(next);}
  locals[id===200?'grid':'image']=image;
  function emit(line,phase,title,options={}){
    const f=frames.at(-1),scope=f?'dfs':locals.inFind?'find':id===200?'numIslands':'floodFill';
    const actual=f&&id!==200?{r:f.r,c:f.c,rows:locals.rows,cols:locals.cols,old:locals.old,color:locals.color,image}:Object.fromEntries(Object.entries(locals).map(([k,v])=>[k,k==='image'||k==='grid'?image:copy(v)]));
    if(f&&id===200)Object.assign(actual,{r:f.r,c:f.c,rows:locals.rows,cols:locals.cols,image});
    const names=id===200?(approach===3?['islands','r','c','nr','nc','len(queue)']:approach===4?['islands','r','c','nr','nc','len(stack)']:approach===5?['islands','r','c','nr','nc','root1','root2']:['islands','r','c','nr','nc']):f?['r','c','old','color','rows','cols']:['r','c','nr','nc','old','color'];
    const work=mode==='recursive'?frames.map(frame=>({id:frame.id,r:frame.r,c:frame.c})):(locals[mode==='queue'?'queue':'stack']??null);
    steps.push({arr:[],title,note:bi('',''),codeLines:[line],final:Boolean(options.final),vars:names.map(name=>({name,value:name==='len(stack)'?locals.stack?.length??'—':name==='len(queue)'?locals.queue?.length??'—':actual[name]??'—'})),
      floodPicturesView:{id,mode,approach,phase,source:{line,text:code[line-1],timing:'after'},scope,locals:actual,image,original,owners,start,
        old:locals.old??null,color:locals.color??null,count:locals.islands??null,
        change:phase==='island'?{from:locals.islands-1,to:locals.islands}:phase==='merge'?{from:locals.islands+1,to:locals.islands}:null,
        increment:phase==='island'?{from:locals.islands-1,to:locals.islands}:null,
        frames:frames.map(frame=>({...frame})),work:copy(work),active:options.active??null,neighbor:options.neighbor??null,direction:options.direction??null,guard:options.guard??null,
        paint:options.paint??null,returned:options.returned??null,visited:copy(locals.visited??null),parent:copy(locals.parent??null),
        filled:id===200?owners.flat().filter(Boolean).length:image.reduce((sum,row,r)=>sum+row.filter((x,c)=>x!==original[r][c]).length,0)},
    });
  }
  return {steps,frames,paint,setOwners,emit,get image(){return image;},frame(r,c){return {id:nextId++,r,c};}};
}
function build733(input,params={}){
  const [original,sr,sc,color]=args733(input,params),approach=Number(params.approach)||1;
  const mode=approach===2?'recursive':approach===3?'queue':'stack',code=mode==='recursive'?RECURSIVE:iterativeCode(mode==='queue');
  const x={sr,sc,color},rec=recorder(733,code,original,x,mode,[sr,sc]),{emit,paint,frames}=rec;
  const offset=mode==='queue'?1:0,L=line=>line+offset;
  x.rows=original.length;x.cols=original[0].length;emit(L(3),'dimensions',bi('Kích thước image','Image dimensions'));
  x.old=rec.image[sr][sc];emit(L(4),'old',bi('Lưu màu gốc','Read source color'),{active:[sr,sc]});
  emit(L(5),'same-check',bi('old == color ?','old == color ?'),{active:[sr,sc]});
  if(x.old===color){emit(L(6),'same',bi('Cùng màu → trả ngay','Same color → return'),{active:[sr,sc],final:true});return {original,answer:rec.image,steps:rec.steps};}
  const guard=(r,c)=>{const row=r>=0&&r<x.rows,col=row?c>=0&&c<x.cols:null,match=row&&col?rec.image[r][c]===x.old:null;return {row,col,match,allowed:Boolean(row&&col&&match)};};
  if(mode==='recursive'){
    emit(7,'define',bi('Tạo dfs','Define dfs'));
    function dfs(r,c){const f=rec.frame(r,c);frames.push(f);const g=guard(r,c),active=[r,c];
      emit(8,'bounds',bi('Trong biên ?','Inside image ?'),{active,guard:{...g,match:null,allowed:null}});
      if(!g.row||!g.col){emit(9,'return-outside',bi('↩ Ngoài biên','↩ Out of bounds'),{active,guard:{...g,match:null,allowed:false}});frames.pop();return 'outside';}
      emit(10,'guard',bi('image[r][c] == old ?','image[r][c] == old ?'),{active,guard:g});
      if(!g.match){emit(11,'return-color',bi('↩ Màu khác / đã tô','↩ Different / already filled'),{active,guard:g});frames.pop();return 'color';}
      paint(r,c,color);emit(12,'paint',bi(`Tô (${r}, ${c})`,`Paint (${r}, ${c})`),{active,paint:{r,c,from:x.old,to:color}});
      DIRS.forEach(([dr,dc],j)=>{const returned=dfs(r+dr,c+dc);emit(13+j,'resume',bi('↩ Trở về ô cha','↩ Return to parent'),{active,direction:[dr,dc],neighbor:[r+dr,c+dc],returned});});
      frames.pop();return 'complete';
    }
    dfs(sr,sc);emit(17,'root-return',bi('↩ Vùng đã tô xong','↩ Region filled'));emit(18,'done',bi('return image','return image'),{final:true});
  }else{
    const work=mode==='queue'?'queue':'stack';x.directions=DIRS;emit(L(7),'directions',bi('4 hướng cạnh','4 edge directions'));
    x[work]=[[sr,sc]];emit(L(8),'work-init',bi(`${work} ← (${sr}, ${sc})`,`${work} ← (${sr}, ${sc})`));
    paint(sr,sc,color);emit(L(9),'paint',bi(`Tô (${sr}, ${sc})`,`Paint (${sr}, ${sc})`),{active:[sr,sc],paint:{r:sr,c:sc,from:x.old,to:color}});
    while(x[work].length){emit(L(10),'while',bi(`${work} ≠ ∅`,`${work} ≠ ∅`));
      [x.r,x.c]=mode==='queue'?x[work].shift():x[work].pop();const active=[x.r,x.c];emit(L(11),'take',bi(`Lấy (${x.r}, ${x.c})`,`Take (${x.r}, ${x.c})`),{active});
      for(const [dr,dc]of DIRS){x.dr=dr;x.dc=dc;emit(L(12),'direction',bi('Chọn hướng','Choose direction'),{active,direction:[dr,dc]});
        x.nr=x.r+dr;x.nc=x.c+dc;const neighbor=[x.nr,x.nc],options={active,neighbor,direction:[dr,dc]};emit(L(13),'neighbor',bi(`Xét (${x.nr}, ${x.nc})`,`Inspect (${x.nr}, ${x.nc})`),options);
        const g=guard(x.nr,x.nc);emit(L(14),'guard',bi(g.allowed?'✓ Lan sang ô này':'× Bỏ qua',g.allowed?'✓ Spread here':'× Skip'),{...options,guard:g});
        if(g.allowed){paint(x.nr,x.nc,color);emit(L(15),'paint',bi(`Tô (${x.nr}, ${x.nc})`,`Paint (${x.nr}, ${x.nc})`),{...options,paint:{r:x.nr,c:x.nc,from:x.old,to:color}});
          x[work].push([x.nr,x.nc]);emit(L(16),'append',bi(`Thêm vào ${work}`,`Append to ${work}`),options);}
      }
      emit(L(12),'directions-end',bi('Đã xét 4 hướng','4 directions checked'),{active});
    }
    emit(L(10),'empty',bi(`${work} = ∅`,`${work} = ∅`));emit(L(17),'done',bi('return image','return image'),{final:true});
  }
  return {original,answer:rec.image,steps:rec.steps};
}
function build200(input,params={}){
  const approach=Math.max(1,Math.min(5,Number(params.approach)||1)),original=parse(input,200);
  if(approach===1)return build200Stack(original,approach);
  if(approach===2)return build200Recursive(original,approach);
  if(approach===3)return build200Queue(original,approach);
  if(approach===4)return build200Visited(original,approach);
  return build200UnionFind(original,approach);
}
function build200Stack(original,approach){
  const x={},rec=recorder(200,ISLANDS,original,x,'stack',null,approach),{emit,paint}=rec;
  x.rows=original.length;x.cols=original[0].length;emit(3,'dimensions',bi('Kích thước grid','Grid dimensions'));
  x.directions=DIRS;emit(4,'directions',bi('4 hướng cạnh','4 edge directions'));
  x.islands=0;emit(5,'count-init',bi('islands = 0','islands = 0'));
  for(let r=0;r<x.rows;r++){x.r=r;emit(6,'scan-row',bi(`Hàng ${r}`,`Row ${r}`));
    for(let c=0;c<x.cols;c++){x.c=c;const scan=[r,c];emit(7,'scan',bi(`Quét (${r}, ${c})`,`Scan (${r}, ${c})`),{active:scan});
      const land=rec.image[r][c]==='1';emit(8,'land-check',bi(land?'✓ Đất chưa thăm':'× Nước / đã thăm',land?'✓ Unvisited land':'× Water / visited'),{active:scan});
      if(!land)continue;
      x.islands++;emit(9,'island',bi(`Đảo #${x.islands}`,`Island #${x.islands}`),{active:scan});
      x.stack=[[r,c]];emit(10,'work-init',bi('stack ← ô đầu đảo','stack ← island seed'),{active:scan});
      paint(r,c,'0',x.islands);emit(11,'paint',bi('Đánh dấu đã thăm','Mark visited'),{active:scan,paint:{r,c,from:'1',to:'0',owner:x.islands}});
      while(x.stack.length){emit(12,'while',bi('stack ≠ ∅','stack ≠ ∅'),{active:scan});
        [x.cr,x.cc]=x.stack.pop();const active=[x.cr,x.cc];emit(13,'take',bi(`Lấy (${x.cr}, ${x.cc})`,`Take (${x.cr}, ${x.cc})`),{active});
        for(const [dr,dc]of DIRS){x.dr=dr;x.dc=dc;emit(14,'direction',bi('Chọn hướng','Choose direction'),{active,direction:[dr,dc]});
          x.nr=x.cr+dr;x.nc=x.cc+dc;const neighbor=[x.nr,x.nc],options={active,neighbor,direction:[dr,dc]};emit(15,'neighbor',bi(`Xét (${x.nr}, ${x.nc})`,`Inspect (${x.nr}, ${x.nc})`),options);
          const row=x.nr>=0&&x.nr<x.rows,col=row?x.nc>=0&&x.nc<x.cols:null,match=row&&col?rec.image[x.nr][x.nc]==='1':null,g={row,col,match,allowed:Boolean(row&&col&&match)};
          emit(16,'guard',bi(g.allowed?'✓ Thuộc đảo này':'× Bỏ qua',g.allowed?'✓ Same island':'× Skip'),{...options,guard:g});
          if(g.allowed){paint(x.nr,x.nc,'0',x.islands);emit(17,'paint',bi('Đánh dấu đã thăm','Mark visited'),{...options,paint:{r:x.nr,c:x.nc,from:'1',to:'0',owner:x.islands}});
            x.stack.push([x.nr,x.nc]);emit(18,'append',bi('Thêm ô vào stack','Append to stack'),options);}
        }
        emit(14,'directions-end',bi('Đã xét 4 hướng','4 directions checked'),{active});
      }
      emit(12,'empty',bi('Đã thăm hết đảo','Island fully visited'),{active:scan});
    }
    emit(7,'columns-end',bi('Hết cột trong hàng','Row scan complete'));
  }
  emit(6,'rows-end',bi('Đã quét hết grid','Grid scan complete'));emit(19,'done',bi(`Có ${x.islands} đảo`,`${x.islands} islands`),{final:true});
  return {original,answer:x.islands,steps:rec.steps};
}
function build200Recursive(original,approach){
  const code=ISLANDS_RECURSIVE,x={islands:0},rec=recorder(200,code,original,x,'recursive',null,approach),{emit,paint,frames}=rec;
  x.rows=original.length;x.cols=original[0].length;emit(3,'dimensions',bi('Kích thước grid','Grid dimensions'));
  x.directions=DIRS;emit(4,'directions',bi('4 hướng cạnh','4 edge directions'));
  emit(5,'define',bi('Định nghĩa dfs','Define dfs'));
  function dfs(r,c){
    const frame=rec.frame(r,c);frames.push(frame);const active=[r,c];
    const row=r>=0&&r<x.rows,col=row?c>=0&&c<x.cols:null;
    emit(6,'bounds',bi(row&&col?'Trong biên':'Ngoài biên',row&&col?'Inside grid':'Out of bounds'),{active,guard:{row,col,match:null,allowed:Boolean(row&&col)}});
    if(!row||!col){emit(7,'return-outside',bi('↩ Ngoài biên','↩ Out of bounds'),{active});frames.pop();return;}
    const match=rec.image[r][c]==='1';
    emit(8,'land-check',bi(match?'✓ Đất chưa thăm':'× Nước / đã thăm',match?'✓ Unvisited land':'× Water / visited'),{active,guard:{row:true,col:true,match,allowed:match}});
    if(!match){emit(9,'return-water',bi('↩ Bỏ qua','↩ Skip'),{active});frames.pop();return;}
    paint(r,c,'0',x.islands);emit(10,'paint',bi('Đánh dấu đã thăm','Mark visited'),{active,paint:{r,c,from:'1',to:'0',owner:x.islands}});
    for(const [dr,dc]of DIRS){emit(11,'direction',bi('Chọn hướng','Choose direction'),{active,direction:[dr,dc]});dfs(r+dr,c+dc);emit(11,'resume',bi('↩ Trở về ô cha','↩ Return to parent'),{active,neighbor:[r+dr,c+dc],direction:[dr,dc],returned:true});}
    frames.pop();
  }
  for(let r=0;r<x.rows;r++){x.r=r;emit(13,'scan-row',bi(`Hàng ${r}`,`Row ${r}`));
    for(let c=0;c<x.cols;c++){x.c=c;const active=[r,c];emit(14,'scan',bi(`Quét (${r}, ${c})`,`Scan (${r}, ${c})`),{active});
      const land=rec.image[r][c]==='1';emit(15,'land-check',bi(land?'✓ Đất chưa thăm':'× Nước / đã thăm',land?'✓ Unvisited land':'× Water / visited'),{active,guard:{row:true,col:true,match:land,allowed:land}});
      if(!land)continue;x.islands++;emit(16,'island',bi(`Đảo #${x.islands}`,`Island #${x.islands}`),{active});dfs(r,c);
    }
  }
  emit(18,'done',bi(`Có ${x.islands} đảo`,`${x.islands} islands`),{final:true});
  return {original,answer:x.islands,steps:rec.steps};
}
function build200Queue(original,approach){
  const code=ISLANDS_QUEUE,x={islands:0},rec=recorder(200,code,original,x,'queue',null,approach),{emit,paint}=rec;
  x.rows=original.length;x.cols=original[0].length;emit(3,'dimensions',bi('Kích thước grid','Grid dimensions'));
  x.directions=DIRS;emit(4,'directions',bi('4 hướng cạnh','4 edge directions'));
  for(let r=0;r<x.rows;r++){x.r=r;emit(6,'scan-row',bi(`Hàng ${r}`,`Row ${r}`));
    for(let c=0;c<x.cols;c++){x.c=c;const active=[r,c];emit(7,'scan',bi(`Quét (${r}, ${c})`,`Scan (${r}, ${c})`),{active});
      const land=rec.image[r][c]==='1';emit(8,'land-check',bi(land?'✓ Đất chưa thăm':'× Nước / đã thăm',land?'✓ Unvisited land':'× Water / visited'),{active,guard:{row:true,col:true,match:land,allowed:land}});
      if(!land){emit(9,'continue',bi('Tiếp tục quét','Continue scan'),{active});continue;}
      x.islands++;emit(10,'island',bi(`Đảo #${x.islands}`,`Island #${x.islands}`),{active});
      x.queue=[[r,c]];emit(11,'work-init',bi('queue ← ô đầu đảo','queue ← island seed'),{active});
      paint(r,c,'0',x.islands);emit(12,'paint',bi('Đánh dấu đã thăm','Mark visited'),{active,paint:{r,c,from:'1',to:'0',owner:x.islands}});
      while(x.queue.length){emit(13,'while',bi('queue ≠ ∅','queue ≠ ∅'),{active});
        [x.cr,x.cc]=x.queue.shift();const from=[x.cr,x.cc];emit(14,'take',bi(`Lấy đầu hàng đợi (${x.cr}, ${x.cc})`,`Take queue front (${x.cr}, ${x.cc})`),{active:from});
        for(const [dr,dc]of DIRS){x.dr=dr;x.dc=dc;emit(15,'direction',bi('Chọn hướng','Choose direction'),{active:from,direction:[dr,dc]});
          x.nr=x.cr+dr;x.nc=x.cc+dc;const neighbor=[x.nr,x.nc],row=x.nr>=0&&x.nr<x.rows,col=row?x.nc>=0&&x.nc<x.cols:null,match=row&&col?rec.image[x.nr][x.nc]==='1':null,g={row,col,match,allowed:Boolean(row&&col&&match)};
          emit(16,'neighbor',bi(`Xét (${x.nr}, ${x.nc})`,`Inspect (${x.nr}, ${x.nc})`),{active:from,neighbor,direction:[dr,dc]});
          emit(17,'guard',bi(g.allowed?'✓ Cùng đảo':'× Bỏ qua',g.allowed?'✓ Same island':'× Skip'),{active:from,neighbor,direction:[dr,dc],guard:g});
          if(g.allowed){paint(x.nr,x.nc,'0',x.islands);emit(18,'paint',bi('Đánh dấu đã thăm','Mark visited'),{active:from,neighbor,paint:{r:x.nr,c:x.nc,from:'1',to:'0',owner:x.islands}});
            x.queue.push(neighbor);emit(19,'append',bi('Thêm cuối hàng đợi','Append to queue'),{active:from,neighbor});}
        }
      }
    }
  }
  emit(20,'done',bi(`Có ${x.islands} đảo`,`${x.islands} islands`),{final:true});
  return {original,answer:x.islands,steps:rec.steps};
}
function build200Visited(original,approach){
  const code=ISLANDS_VISITED,x={islands:0},rec=recorder(200,code,original,x,'visited',null,approach),{emit,setOwners}=rec;
  x.rows=original.length;x.cols=original[0].length;x.visited=original.map(row=>row.map(()=>false));x.owners=original.map(row=>row.map(()=>0));emit(3,'visited-init',bi('Khởi tạo visited','Initialize visited'));
  x.directions=DIRS;emit(4,'directions',bi('4 hướng cạnh','4 edge directions'));
  for(let r=0;r<x.rows;r++){x.r=r;emit(6,'scan-row',bi(`Hàng ${r}`,`Row ${r}`));
    for(let c=0;c<x.cols;c++){x.c=c;const active=[r,c];emit(7,'scan',bi(`Quét (${r}, ${c})`,`Scan (${r}, ${c})`),{active});
      const land=rec.image[r][c]==='1'&&!x.visited[r][c];emit(8,'land-check',bi(land?'✓ Đất chưa thăm':'× Nước / đã thăm',land?'✓ Unvisited land':'× Water / visited'),{active,guard:{row:true,col:true,match:rec.image[r][c]==='1',allowed:land}});
      if(!land){emit(9,'continue',bi('Tiếp tục quét','Continue scan'),{active});continue;}
      x.islands++;emit(10,'island',bi(`Đảo #${x.islands}`,`Island #${x.islands}`),{active});
      x.stack=[[r,c]];emit(11,'work-init',bi('stack ← ô đầu đảo','stack ← island seed'),{active});
      x.visited[r][c]=true;x.owners[r][c]=x.islands;setOwners(x.owners);emit(12,'visit',bi('Đánh dấu visited','Mark visited'),{active});
      while(x.stack.length){emit(13,'while',bi('stack ≠ ∅','stack ≠ ∅'),{active});
        [x.cr,x.cc]=x.stack.pop();const from=[x.cr,x.cc];emit(14,'take',bi(`Lấy (${x.cr}, ${x.cc})`,`Take (${x.cr}, ${x.cc})`),{active:from});
        for(const [dr,dc]of DIRS){x.dr=dr;x.dc=dc;emit(15,'direction',bi('Chọn hướng','Choose direction'),{active:from,direction:[dr,dc]});
          x.nr=x.cr+dr;x.nc=x.cc+dc;const neighbor=[x.nr,x.nc],row=x.nr>=0&&x.nr<x.rows,col=row?x.nc>=0&&x.nc<x.cols:null,match=row&&col?rec.image[x.nr][x.nc]==='1'&&!x.visited[x.nr][x.nc]:null,g={row,col,match,allowed:Boolean(row&&col&&match)};
          emit(16,'neighbor',bi(`Xét (${x.nr}, ${x.nc})`,`Inspect (${x.nr}, ${x.nc})`),{active:from,neighbor,direction:[dr,dc]});
          emit(17,'guard',bi(g.allowed?'✓ Chưa thăm, là đất':'× Bỏ qua',g.allowed?'✓ Unvisited land':'× Skip'),{active:from,neighbor,direction:[dr,dc],guard:g});
          if(g.allowed){x.visited[x.nr][x.nc]=true;x.owners[x.nr][x.nc]=x.islands;setOwners(x.owners);emit(18,'visit',bi('Đánh dấu visited trước khi thêm','Mark visited before push'),{active:from,neighbor});
            x.stack.push(neighbor);emit(19,'append',bi('Thêm ô vào stack','Append to stack'),{active:from,neighbor});}
        }
      }
    }
  }
  emit(20,'done',bi(`Có ${x.islands} đảo`,`${x.islands} islands`),{final:true});
  return {original,answer:x.islands,steps:rec.steps};
}
function build200UnionFind(original,approach){
  const code=ISLANDS_UNION_FIND,x={islands:original.flat().filter(value=>value==='1').length},rec=recorder(200,code,original,x,'union-find',null,approach),{emit,setOwners}=rec;
  x.rows=original.length;x.cols=original[0].length;x.parent=Array.from({length:x.rows*x.cols},(_,i)=>i);
  x.processed=original.map(row=>row.map(()=>false));x.owners=original.map(row=>row.map(()=>0));emit(3,'parent-init',bi('Mỗi ô có parent riêng','Each cell starts as its own parent'));
  emit(4,'count-init',bi(`${x.islands} ô đất`,` ${x.islands} land cells`));
  emit(5,'define-find',bi('Định nghĩa find','Define find'));
  function find(value){x.inFind=true;while(x.parent[value]!==value){emit(6,'find-check',bi('Đi lên parent','Follow parent'));value=x.parent[value];emit(7,'find-step',bi(`parent → ${value}`,`parent → ${value}`));}emit(8,'find-root',bi(`Gốc = ${value}`,`Root = ${value}`));x.inFind=false;return value;}
  function refreshOwners(){x.owners=original.map((row,r)=>row.map((value,c)=>value==='1'&&x.processed[r][c]?find(r*x.cols+c)+1:0));setOwners(x.owners);}
  for(let r=0;r<x.rows;r++){x.r=r;emit(9,'scan-row',bi(`Hàng ${r}`,`Row ${r}`));
    for(let c=0;c<x.cols;c++){x.c=c;const active=[r,c];emit(10,'scan',bi(`Quét (${r}, ${c})`,`Scan (${r}, ${c})`),{active});
      const land=rec.image[r][c]==='1';emit(11,'land-check',bi(land?'✓ Ô đất':'× Nước',land?'✓ Land cell':'× Water'),{active,guard:{row:true,col:true,match:land,allowed:land}});
      if(!land){emit(12,'water',bi('Tiếp tục quét','Continue scan'),{active});continue;}
      x.processed[r][c]=true;refreshOwners();
      for(const [dr,dc]of [[1,0],[0,1]]){x.dr=dr;x.dc=dc;emit(13,'direction',bi('Xét phải / xuống','Check right / down'),{active,direction:[dr,dc]});
        x.nr=r+dr;x.nc=c+dc;const neighbor=[x.nr,x.nc],row=x.nr<x.rows,col=x.nc<x.cols,match=row&&col&&rec.image[x.nr][x.nc]==='1',g={row,col,match,allowed:Boolean(row&&col&&match)};
        emit(14,'neighbor',bi(`Xét (${x.nr}, ${x.nc})`,`Inspect (${x.nr}, ${x.nc})`),{active,neighbor,direction:[dr,dc]});
        emit(15,'guard',bi(g.allowed?'✓ Có thể nối':'× Bỏ qua',g.allowed?'✓ Can connect':'× Skip'),{active,neighbor,direction:[dr,dc],guard:g});
        if(!g.allowed)continue;
        const id1=r*x.cols+c,id2=x.nr*x.cols+x.nc;x.root1=find(id1);emit(16,'find-root1',bi(`Tìm gốc ${id1}`,`Find root ${id1}`),{active,neighbor});
        x.root2=find(id2);emit(17,'find-root2',bi(`Tìm gốc ${id2}`,`Find root ${id2}`),{active,neighbor});
        const connected=x.root1!==x.root2;emit(18,'union-check',bi(connected?'Hai gốc khác nhau':'Đã cùng component',connected?'Different roots':'Already connected'),{active,neighbor,guard:{row:true,col:true,match:connected,allowed:connected}});
        if(connected){x.parent[x.root2]=x.root1;refreshOwners();emit(19,'union',bi(`parent[${x.root2}] = ${x.root1}`,`parent[${x.root2}] = ${x.root1}`),{active,neighbor});x.islands--;emit(20,'merge',bi(`Gộp component → ${x.islands}`,`Merge components → ${x.islands}`),{active,neighbor});}
      }
    }
  }
  emit(21,'done',bi(`Có ${x.islands} đảo`,`${x.islands} islands`),{final:true});
  return {original,answer:x.islands,steps:rec.steps};
}
module.exports={
  733:{...base[733],code:iterativeCode(),code2:RECURSIVE,code3:iterativeCode(true),builder:build733,liveArgs:args733,debugMode:'line-by-line',
    approach:[bi('Tô ô khi phát hiện → xét 4 ô cạnh. Stack: lấy cuối; queue: lấy đầu; đệ quy: đi sâu rồi trở về.','Recolor on discovery → inspect 4 edge neighbors. Stack: take last; queue: take first; recursion: go deeper, then return.')],
  },
  200:{...base[200],code:ISLANDS,code2:ISLANDS_RECURSIVE,code3:ISLANDS_QUEUE,code4:ISLANDS_VISITED,code5:ISLANDS_UNION_FIND,builder:build200,liveArgs:input=>[parse(input,200)],debugMode:'line-by-line',
    extraParams:[{key:'approach',label:bi('Cách giải','Approach'),type:'select',default:'1',options:[
      {value:'1',label:bi('Cách 1: DFS stack','Approach 1: Iterative DFS (stack)')},
      {value:'2',label:bi('Cách 2: DFS đệ quy','Approach 2: Recursive DFS')},
      {value:'3',label:bi('Cách 3: BFS queue','Approach 3: BFS (queue)')},
      {value:'4',label:bi('Cách 4: DFS + visited','Approach 4: DFS + visited set')},
      {value:'5',label:bi('Cách 5: Union-Find','Approach 5: Union-Find')},
    ]}],
    approach:[bi('Gặp đất chưa thăm → +1 đảo. Thăm hết đảo bằng stack rồi quét tiếp. Chỉ nối 4 cạnh.','Unvisited land → +1 island. Visit the entire island using a stack, then resume scanning. Connect only across 4 edges.'),bi('DFS đệ quy: tô nước khi vào dfs để chặn thăm lại.','Recursive DFS: sink land when entering dfs to prevent revisits.'),bi('BFS: hàng đợi mở rộng theo từng lớp.','BFS: a queue expands the island one layer at a time.'),bi('DFS + ma trận visited riêng: giữ nguyên grid, đánh dấu ô đã thăm.','DFS + a separate visited matrix: keep the grid unchanged and mark visited cells separately.'),bi('Union-Find: gộp các ô đất cạnh nhau; mỗi lần gộp giảm component đi 1.','Union-Find: merge adjacent land cells; each successful union reduces the component count by one.')],
  },
};
