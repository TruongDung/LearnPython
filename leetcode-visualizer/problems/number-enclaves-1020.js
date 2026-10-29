'use strict';
const base=require('./multi-source-bfs')[1020],bi=(vi,en)=>({vi,en}),DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
const COUNT=['        enclaves = 0','        for r in range(rows):','            for c in range(cols):','                if grid[r][c] == 1:','                    enclaves += 1','        return enclaves'];
const BFS=[
 'from collections import deque','class Solution:','    def numEnclaves(self, grid):',
 '        rows, cols = len(grid), len(grid[0])','        queue = deque()',
 '        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]',
 '        for r in range(rows):','            for c in range(cols):',
 '                if r in (0, rows - 1) or c in (0, cols - 1):','                    if grid[r][c] == 1:',
 '                        grid[r][c] = 0','                        queue.append((r, c))',
 '        while queue:','            r, c = queue.popleft()',
 '            for dr, dc in directions:','                nr, nc = r + dr, c + dc',
 '                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:',
 '                    grid[nr][nc] = 0','                    queue.append((nr, nc))',...COUNT,
];
const DFS=[
 'class Solution:','    def numEnclaves(self, grid):','        rows, cols = len(grid), len(grid[0])',
 '        def dfs(r, c):','            if r < 0 or r >= rows or c < 0 or c >= cols:',
 '                return','            if grid[r][c] == 0:','                return','            grid[r][c] = 0',
 '            dfs(r + 1, c)','            dfs(r - 1, c)','            dfs(r, c + 1)','            dfs(r, c - 1)',
 '        for r in range(rows):','            dfs(r, 0)','            dfs(r, cols - 1)',
 '        for c in range(cols):','            dfs(0, c)','            dfs(rows - 1, c)',...COUNT,
];
const UF=[
 'class Solution:','    def numEnclaves(self, grid):','        rows, cols = len(grid), len(grid[0])',
 '        border = rows * cols','        parent = list(range(border + 1))','        size = [1] * (border + 1)',
 '        def find(x):','            while parent[x] != x:',
 '                parent[x] = parent[parent[x]]','                x = parent[x]','            return x',
 '        def union(a, b):','            ra = find(a)','            rb = find(b)',
 '            if ra == rb:','                return','            if size[ra] < size[rb]:',
 '                ra, rb = rb, ra','            parent[rb] = ra','            size[ra] += size[rb]',
 '        for r in range(rows):','            for c in range(cols):','                if grid[r][c] == 1:',
 '                    if r in (0, rows - 1) or c in (0, cols - 1):','                        union(r * cols + c, border)',
 '                    if r + 1 < rows and grid[r + 1][c] == 1:','                        union(r * cols + c, (r + 1) * cols + c)',
 '                    if c + 1 < cols and grid[r][c + 1] == 1:','                        union(r * cols + c, r * cols + c + 1)',
 '        root = find(border)','        enclaves = 0','        for r in range(rows):','            for c in range(cols):',
 '                if grid[r][c] == 1:','                    if find(r * cols + c) != root:',
 '                        enclaves += 1','        return enclaves',
];
function parse(input){
 if(typeof input!=='string'||!input.trim())throw new TypeError('#1020: nhập ma trận 0/1 / enter a binary matrix.');
 const raw=input.trim().split('|').map(row=>(row.trim().includes(',')?row.trim().split(','):row.trim().split('')).map(x=>x.trim().replace(/^"|"$/g,'')));
 if(!raw[0].length||raw.some(row=>row.length!==raw[0].length||row.some(x=>!/^[01]$/.test(x))))throw new TypeError('#1020: cần ma trận chữ nhật 0/1 / rectangular binary matrix required.');
 return raw.map(row=>row.map(Number));
}
const copy=value=>Array.isArray(value)?value.map(copy):value;
function build(input,approach=1){
 const original=parse(input),mode=approach===3?'union':approach===2?'recursive':'queue',code=approach===3?UF:approach===2?DFS:BFS;
 let image=copy(original),escaped=original.map(row=>row.map(()=>false)),escapeParent=original.map(row=>row.map(()=>null)),counted=original.map(row=>row.map(()=>false)),proofReady=false,stage='border',nextId=0;
 const x={grid:image},frames=[],steps=[];
 const replace=(matrix,r,c,value)=>matrix.map((row,j)=>j===r?row.map((v,k)=>k===c?value:v):row);
 const boundary=(r,c)=>r===0||c===0||r===x.rows-1||c===x.cols-1;
 function erase(r,c,parent=null){image=replace(image,r,c,0);x.grid=image;escaped=replace(escaped,r,c,true);escapeParent=replace(escapeParent,r,c,parent);}
 function guard(r,c){const row=r>=0&&r<x.rows,col=row?c>=0&&c<x.cols:null,match=row&&col?image[r][c]===1:null;return {row,col,match,allowed:Boolean(row&&col&&match)};}
 function rootOf(id){if(!x.parent)return null;let root=id;while(x.parent[root]!==root)root=x.parent[root];return root;}
 function emit(line,phase,title,options={}){
  const methodLocals=Object.fromEntries(Object.entries(x).map(([key,value])=>[key,key==='grid'?image:copy(value)])),f=frames.at(-1);
  const locals=f?f.kind==='dfs'?{r:f.r,c:f.c,grid:image,rows:x.rows,cols:x.cols}:f.kind==='find'?{x:f.x,parent:[...x.parent]}:{a:f.a,b:f.b,...(f.ra===undefined?{}:{ra:f.ra}),...(f.rb===undefined?{}:{rb:f.rb}),parent:[...x.parent],size:[...x.size]}:methodLocals;
  const scope=f?.kind||'numEnclaves',virtualRoot=x.parent?rootOf(x.border):null;
  const escapedView=mode==='union'&&x.parent?original.map((row,r)=>row.map((value,c)=>Boolean(value&&rootOf(r*x.cols+c)===virtualRoot))):escaped;
  let vars;
  if(f?.kind==='find')vars=[['x',f.x],['parent[x]',x.parent[f.x]],['parent[parent[x]]',x.parent[x.parent[f.x]]],['len(parent)',x.parent.length]];
  else if(f?.kind==='union')vars=[['a',f.a],['b',f.b],['ra',f.ra],['rb',f.rb],['size[ra]',f.ra===undefined?undefined:x.size[f.ra]],['size[rb]',f.rb===undefined?undefined:x.size[f.rb]]];
  else if(mode==='union')vars=[['r',x.r],['c',x.c],['border',x.border],['root',x.root],['enclaves',x.enclaves],['parent[border]',x.parent?.[x.border]]];
  else if(f)vars=[['r',f.r],['c',f.c],['grid[r][c]',image[f.r]?.[f.c]],['rows',x.rows],['cols',x.cols]];
  else vars=mode==='queue'?[['r',x.r],['c',x.c],['nr',x.nr],['nc',x.nc],['enclaves',x.enclaves],['len(queue)',x.queue?.length]]:[['r',x.r],['c',x.c],['rows',x.rows],['cols',x.cols],['enclaves',x.enclaves]];
  steps.push({arr:[],title,note:bi('',''),codeLines:[line],final:Boolean(options.final),vars:vars.map(([name,value])=>({name,value:value??'—'})),
   enclaves1020View:{id:1020,mode,phase,stage,proofReady,scope,source:{line,text:code[line-1],timing:'after'},locals,methodLocals,
    image,original,escaped:escapedView,escapeParent,counted,enclaves:x.enclaves??null,increment:options.increment??null,
    escapedCount:escapedView.flat().filter(Boolean).length,remaining:original.flat().filter(Boolean).length-escapedView.flat().filter(Boolean).length,
    active:options.active??null,neighbor:options.neighbor??null,direction:options.direction??null,guard:options.guard??null,boundary:options.boundary??null,paint:options.paint??null,
    frames:frames.map(frame=>({...frame})),work:mode==='recursive'?frames.map(frame=>({...frame})):x.queue?copy(x.queue):null,
    uf:x.parent?{border:x.border,parent:[...x.parent],size:x.size?[...x.size]:null,virtualRoot,change:options.change??null,edge:options.edge??null,returned:options.returned??null}:null},
  });
 }
 function countCell(line,r,c){const before=x.enclaves;x.enclaves++;counted=replace(counted,r,c,true);emit(line,'count',bi(`enclaves: ${before} → ${x.enclaves}`,`enclaves: ${before} → ${x.enclaves}`),{active:[r,c],increment:{from:before,to:x.enclaves,cell:[r,c]}});}
 function countRemaining(){proofReady=true;stage='count';x.enclaves=0;emit(20,'count-init',bi('Đếm đất còn lại','Count remaining land'));
  for(let r=0;r<x.rows;r++){x.r=r;emit(21,'count-row',bi(`Hàng ${r}`,`Row ${r}`));for(let c=0;c<x.cols;c++){x.c=c;emit(22,'count-cell',bi(`Xét (${r}, ${c})`,`Inspect (${r}, ${c})`),{active:[r,c]});const land=image[r][c]===1;emit(23,'count-check',bi(land?'✓ Ô enclave':'× Không đếm',land?'✓ Enclave cell':'× Skip'),{active:[r,c]});if(land)countCell(24,r,c);}emit(22,'count-columns-end',bi('Hết cột','Row complete'));}emit(21,'count-rows-end',bi('Đã đếm hết grid','Count complete'));emit(25,'done',bi(`Có ${x.enclaves} ô enclave`,`${x.enclaves} enclave cells`),{final:true});
 }
 x.rows=original.length;x.cols=original[0].length;emit(mode==='queue'?4:3,'dimensions',bi('Kích thước grid','Grid dimensions'));
 if(mode==='queue'){
  x.queue=[];emit(5,'queue-init',bi('queue = ∅','queue = ∅'));x.directions=DIRS;emit(6,'directions',bi('4 hướng cạnh','4 edge directions'));
  for(let r=0;r<x.rows;r++){x.r=r;emit(7,'border-row',bi(`Hàng ${r}`,`Row ${r}`));for(let c=0;c<x.cols;c++){x.c=c;const active=[r,c],edge=boundary(r,c);emit(8,'border-cell',bi(`Quét (${r}, ${c})`,`Scan (${r}, ${c})`),{active});emit(9,'border-check',bi(edge?'✓ Ô biên':'× Ô bên trong',edge?'✓ Border cell':'× Interior cell'),{active,boundary:edge});if(!edge)continue;const land=image[r][c]===1;emit(10,'seed-check',bi(land?'✓ Đất ở biên':'× Nước',land?'✓ Border land':'× Water'),{active});if(!land)continue;erase(r,c);emit(11,'erase',bi('Đất nối biên: 1 → 0','Border land: 1 → 0'),{active,paint:{r,c,seed:true}});x.queue.push([r,c]);emit(12,'append',bi('Thêm nguồn vào queue','Append border source'),{active});}emit(8,'border-columns-end',bi('Hết cột','Row complete'));}emit(7,'border-rows-end',bi('Đã quét hết biên','Border scan complete'));
  stage='spread';while(x.queue.length){emit(13,'while',bi('queue ≠ ∅','queue ≠ ∅'));[x.r,x.c]=x.queue.shift();const active=[x.r,x.c];emit(14,'take',bi(`Lấy (${x.r}, ${x.c})`,`Take (${x.r}, ${x.c})`),{active});for(const [dr,dc]of DIRS){x.dr=dr;x.dc=dc;emit(15,'direction',bi('Chọn hướng','Choose direction'),{active,direction:[dr,dc]});x.nr=x.r+dr;x.nc=x.c+dc;const options={active,neighbor:[x.nr,x.nc],direction:[dr,dc]};emit(16,'neighbor',bi(`Xét (${x.nr}, ${x.nc})`,`Inspect (${x.nr}, ${x.nc})`),options);const g=guard(x.nr,x.nc);emit(17,'guard',bi(g.allowed?'✓ Nối tới biên':'× Bỏ qua',g.allowed?'✓ Reaches border':'× Skip'),{...options,guard:g});if(!g.allowed)continue;erase(x.nr,x.nc,active);emit(18,'erase',bi('Đất nối biên: 1 → 0','Border-connected land: 1 → 0'),{...options,paint:{r:x.nr,c:x.nc,seed:false}});x.queue.push([x.nr,x.nc]);emit(19,'append',bi('Thêm vào queue','Append to queue'),options);}emit(15,'directions-end',bi('Đã xét 4 hướng','4 directions checked'));}proofReady=true;emit(13,'empty',bi('Đã loại hết đất nối biên','Border flood complete'));countRemaining();
 }else if(mode==='recursive'){
  emit(4,'define',bi('Tạo dfs','Define dfs'));
  function dfs(r,c){const f={id:nextId++,kind:'dfs',r,c};frames.push(f);const active=[r,c],g=guard(r,c);emit(5,'bounds',bi('Trong biên ?','Inside grid ?'),{active,guard:{...g,match:null,allowed:null}});if(!g.row||!g.col){emit(6,'return-outside',bi('↩ Ngoài biên','↩ Outside'),{active,guard:{...g,match:null,allowed:false}});frames.pop();return;}emit(7,'guard',bi(g.match?'✓ Đất chưa thăm':'× Nước / đã xóa',g.match?'✓ Unvisited land':'× Water / removed'),{active,guard:g});if(!g.match){emit(8,'return-water',bi('↩ Dừng nhánh','↩ Stop branch'),{active,guard:g});frames.pop();return;}
   const parent=frames.length>1?frames.at(-2):null;erase(r,c,parent?[parent.r,parent.c]:null);emit(9,'erase',bi('Đất nối biên: 1 → 0','Border-connected land: 1 → 0'),{active,paint:{r,c,seed:!parent}});DIRS.forEach(([dr,dc],j)=>{dfs(r+dr,c+dc);emit(10+j,'resume',bi('↩ Trở về ô cha','↩ Return to parent'),{active,neighbor:[r+dr,c+dc],direction:[dr,dc]});});frames.pop();
  }
  for(let r=0;r<x.rows;r++){x.r=r;emit(14,'border-row',bi(`Biên trái / phải · hàng ${r}`,`Left / right border · row ${r}`));dfs(r,0);emit(15,'border-call',bi('↩ Xong biên trái','↩ Left border returned'),{active:[r,0]});dfs(r,x.cols-1);emit(16,'border-call',bi('↩ Xong biên phải','↩ Right border returned'),{active:[r,x.cols-1]});}emit(14,'border-rows-end',bi('Xong hai cạnh dọc','Vertical edges complete'));
  for(let c=0;c<x.cols;c++){x.c=c;emit(17,'border-col',bi(`Biên trên / dưới · cột ${c}`,`Top / bottom border · column ${c}`));dfs(0,c);emit(18,'border-call',bi('↩ Xong biên trên','↩ Top border returned'),{active:[0,c]});dfs(x.rows-1,c);emit(19,'border-call',bi('↩ Xong biên dưới','↩ Bottom border returned'),{active:[x.rows-1,c]});}proofReady=true;emit(17,'border-columns-end',bi('Xong cả bốn cạnh','All four edges complete'));countRemaining();
 }else{
  x.border=x.rows*x.cols;emit(4,'virtual',bi(`BORDER = ${x.border}`,`BORDER = ${x.border}`));x.parent=Array.from({length:x.border+1},(_,i)=>i);emit(5,'parent-init',bi('Mỗi node là một gốc','Each node starts as a root'));x.size=Array(x.border+1).fill(1);emit(6,'size-init',bi('size = 1','size = 1'));emit(7,'define-find',bi('Tạo find','Define find'));emit(12,'define-union',bi('Tạo union','Define union'));
  function find(value){const f={id:nextId++,kind:'find',x:value};frames.push(f);while(x.parent[f.x]!==f.x){emit(8,'find-check',bi('Đi tới gốc','Walk to root'));const node=f.x,before=x.parent[node];x.parent[node]=x.parent[x.parent[node]];emit(9,'compress',bi('Nén đường đi','Compress path'),{change:{node,from:before,to:x.parent[node]}});f.x=x.parent[f.x];emit(10,'find-move',bi(`x = ${f.x}`,`x = ${f.x}`));}emit(8,'find-root',bi('✓ Đã tới gốc','✓ Root reached'));emit(11,'find-return',bi(`↩ ${f.x}`,`↩ ${f.x}`),{returned:f.x});frames.pop();return f.x;}
  function union(a,b){const f={id:nextId++,kind:'union',a,b};frames.push(f);f.ra=find(a);emit(13,'root-a',bi(`ra = ${f.ra}`,`ra = ${f.ra}`));f.rb=find(b);emit(14,'root-b',bi(`rb = ${f.rb}`,`rb = ${f.rb}`));emit(15,'same-root',bi(f.ra===f.rb?'Cùng gốc':'Khác gốc',f.ra===f.rb?'Same root':'Different roots'));if(f.ra===f.rb){emit(16,'union-return',bi('↩ Đã nối sẵn','↩ Already connected'));frames.pop();return;}const swap=x.size[f.ra]<x.size[f.rb];emit(17,'size-check',bi('So kích thước cây','Compare tree sizes'));if(swap){[f.ra,f.rb]=[f.rb,f.ra];emit(18,'swap',bi('Đổi hai gốc','Swap roots'));}const before=x.parent[f.rb];x.parent[f.rb]=f.ra;emit(19,'link',bi(`parent[${f.rb}] = ${f.ra}`,`parent[${f.rb}] = ${f.ra}`),{change:{node:f.rb,from:before,to:f.ra},edge:{a,b,ra:f.ra,rb:f.rb}});x.size[f.ra]+=x.size[f.rb];emit(20,'size-add',bi(`size[${f.ra}] = ${x.size[f.ra]}`,`size[${f.ra}] = ${x.size[f.ra]}`));frames.pop();}
  stage='spread';for(let r=0;r<x.rows;r++){x.r=r;emit(21,'union-row',bi(`Hàng ${r}`,`Row ${r}`));for(let c=0;c<x.cols;c++){x.c=c;const active=[r,c];emit(22,'union-cell',bi(`Quét (${r}, ${c})`,`Scan (${r}, ${c})`),{active});const land=image[r][c]===1;emit(23,'land-check',bi(land?'✓ Đất':'× Nước',land?'✓ Land':'× Water'),{active});if(!land)continue;const edge=boundary(r,c);emit(24,'border-check',bi(edge?'✓ Ô biên':'× Ô bên trong',edge?'✓ Border cell':'× Interior cell'),{active,boundary:edge});if(edge){union(r*x.cols+c,x.border);emit(25,'union-border',bi('Nối với BORDER','Connect to BORDER'),{active});}const down=r+1<x.rows&&image[r+1][c]===1;emit(26,'down-check',bi('Kiểm tra ô dưới','Check lower cell'),{active,neighbor:[r+1,c],direction:[1,0],guard:{row:r+1<x.rows,col:r+1<x.rows?true:null,match:r+1<x.rows?image[r+1][c]===1:null,allowed:down}});if(down){union(r*x.cols+c,(r+1)*x.cols+c);emit(27,'union-neighbor',bi('Nối hai ô đất','Connect two land cells'),{active,neighbor:[r+1,c],direction:[1,0]});}const right=c+1<x.cols&&image[r][c+1]===1;emit(28,'right-check',bi('Kiểm tra ô phải','Check right cell'),{active,neighbor:[r,c+1],direction:[0,1],guard:{row:true,col:c+1<x.cols,match:c+1<x.cols?image[r][c+1]===1:null,allowed:right}});if(right){union(r*x.cols+c,r*x.cols+c+1);emit(29,'union-neighbor',bi('Nối hai ô đất','Connect two land cells'),{active,neighbor:[r,c+1],direction:[0,1]});}}emit(22,'union-columns-end',bi('Hết cột','Row complete'));}emit(21,'union-rows-end',bi('Đã nối hết đất','All land connected'));
  x.root=find(x.border);proofReady=true;stage='count';emit(30,'border-root',bi(`root = ${x.root}`,`root = ${x.root}`));x.enclaves=0;emit(31,'count-init',bi('enclaves = 0','enclaves = 0'));for(let r=0;r<x.rows;r++){x.r=r;emit(32,'count-row',bi(`Hàng ${r}`,`Row ${r}`));for(let c=0;c<x.cols;c++){x.c=c;const active=[r,c];emit(33,'count-cell',bi(`Xét (${r}, ${c})`,`Inspect (${r}, ${c})`),{active});const land=image[r][c]===1;emit(34,'count-land',bi(land?'✓ Đất':'× Nước',land?'✓ Land':'× Water'),{active});if(!land)continue;const enclave=find(r*x.cols+c)!==x.root;emit(35,'count-check',bi(enclave?'✓ Khác gốc BORDER':'× Cùng gốc BORDER',enclave?'✓ Outside BORDER component':'× Same BORDER root'),{active});if(enclave)countCell(36,r,c);}emit(33,'count-columns-end',bi('Hết cột','Row complete'));}emit(32,'count-rows-end',bi('Đã đếm hết grid','Count complete'));emit(37,'done',bi(`Có ${x.enclaves} ô enclave`,`${x.enclaves} enclave cells`),{final:true});
 }
 return {original,answer:x.enclaves,steps};
}
module.exports={1020:{...base,code:BFS,code2:DFS,code3:UF,builder:(input,params={})=>build(input,Number(params.approach)||1),builder2:input=>build(input,2),builder3:input=>build(input,3),liveArgs:input=>[parse(input)],debugMode:'line-by-line',
 approach:[bi('Biên → tìm toàn bộ đất có đường ra ngoài → đếm các ô đất còn lại. Chỉ đi qua 4 cạnh.','Border → find all land that can escape → count the remaining land cells. Move across 4 edges only.')],
 complexity:{time:'O(R·C·α(R·C))',space:'O(R·C)',note:bi('BFS/DFS: O(R·C). UF: nén đường đi và nối theo kích thước.','BFS/DFS: O(R·C). UF: path compression and union by size.')},
}};
