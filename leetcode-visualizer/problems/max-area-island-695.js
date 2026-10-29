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
   maxIsland695View:{id:695,mode,phase,scope:f?'dfs':'maxAreaOfIsland',source:{line,text:code[line-1],timing:'after'},locals,methodLocals,
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
module.exports={695:{...base,code:STACK_CODE,code2:RECURSIVE_CODE,builder:(input,params={})=>build(input,Number(params.approach)===2),builder2:input=>build(input,true),liveArgs:input=>[parse(input)],debugMode:'line-by-line',
 codeLabel:bi('Cách 1: DFS stack','Approach 1: DFS stack'),
 extraParams:base.extraParams.map(p=>p.key==='approach'?{...p,options:[{value:'1',label:bi('Cách 1: DFS stack','Approach 1: DFS stack')},{value:'2',label:bi('Cách 2: DFS đệ quy','Approach 2: Recursive DFS')}]}:p),
 approach:[bi('1 ô đất = 1 đơn vị diện tích. Đo hết một đảo → so area với max_area. Chỉ nối 4 cạnh.','1 land cell = 1 area unit. Finish an island → compare area with max_area. Connect across 4 edges only.')],
}};
