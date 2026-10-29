'use strict';
const base=require('./flood-fill')[1905],bi=(vi,en)=>({vi,en}),DIRS=[[1,0,'down'],[-1,0,'up'],[0,1,'right'],[0,-1,'left']];
const STACK=[
 'class Solution:','    def countSubIslands(self, grid1, grid2):',
 '        rows, cols = len(grid2), len(grid2[0])',
 '        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]','        count = 0',
 '        for r in range(rows):','            for c in range(cols):','                if grid2[r][c] == 1:',
 '                    stack = [(r, c)]','                    grid2[r][c] = 0','                    is_sub = True',
 '                    while stack:','                        cr, cc = stack.pop()',
 '                        if grid1[cr][cc] == 0:','                            is_sub = False',
 '                        for dr, dc in directions:','                            nr, nc = cr + dr, cc + dc',
 '                            if 0 <= nr < rows and 0 <= nc < cols and grid2[nr][nc] == 1:',
 '                                grid2[nr][nc] = 0','                                stack.append((nr, nc))',
 '                    if is_sub:','                        count += 1','        return count',
];
const RECURSIVE=[
 'class Solution:','    def countSubIslands(self, grid1, grid2):','        rows, cols = len(grid2), len(grid2[0])',
 '        def dfs(r, c):','            if r < 0 or r >= rows or c < 0 or c >= cols:',
 '                return True','            if grid2[r][c] == 0:','                return True',
 '            is_sub = grid1[r][c] == 1','            grid2[r][c] = 0',
 '            down = dfs(r + 1, c)','            up = dfs(r - 1, c)',
 '            right = dfs(r, c + 1)','            left = dfs(r, c - 1)',
 '            return is_sub and down and up and right and left','        count = 0',
 '        for r in range(rows):','            for c in range(cols):','                if grid2[r][c] == 1:',
 '                    if dfs(r, c):','                        count += 1','        return count',
];
const copy=value=>Array.isArray(value)?value.map(copy):value;
function parse(input){
 if(typeof input!=='string'||input.split(';').length!==2)throw new TypeError('#1905: nhập grid1;grid2 / enter grid1;grid2.');
 const grids=input.split(';').map(part=>part.trim().split('|').map(row=>(row.trim().includes(',')?row.trim().split(','):row.trim().split('')).map(value=>value.trim().replace(/^"|"$/g,''))));
 if(grids.some(grid=>!grid.length||!grid[0].length||grid.some(row=>row.length!==grid[0].length||row.some(value=>!/^[01]$/.test(value))))||grids[0].length!==grids[1].length||grids[0][0].length!==grids[1][0].length)throw new TypeError('#1905: hai ma trận chữ nhật 0/1 phải cùng kích thước / binary matrices must have equal dimensions.');
 return grids.map(grid=>grid.map(row=>row.map(Number)));
}
function build(input,recursive=false){
 const [grid1,initial2]=parse(input),original={grid1,grid2:initial2},code=recursive?RECURSIVE:STACK,mode=recursive?'recursive':'stack';
 let grid2=copy(initial2),owners=initial2.map(row=>row.map(()=>0)),checks=initial2.map(row=>row.map(()=>null)),group=null,flagOwner=null,rootResult=null,resultOwner=null,nextId=0;
 const x={grid1,grid2},frames=[],history=[],steps=[];
 const replace=(matrix,r,c,value)=>matrix.map((row,j)=>j===r?row.map((v,k)=>k===c?value:v):row);
 function start(r,c){group={id:history.length+1,seed:[r,c],discovered:0,checked:0,complete:false,verdict:null,witness:null,counted:false};history.push(group);}
 function mark(r,c){grid2=replace(grid2,r,c,0);x.grid2=grid2;owners=replace(owners,r,c,group.id);group.discovered++;}
 function compare(r,c){const covered=grid1[r][c]===1;checks=replace(checks,r,c,covered);group.checked++;if(!covered&&group.witness===null)group.witness=[r,c];return {r,c,grid1:grid1[r][c],original2:initial2[r][c],live2:grid2[r][c],covered};}
 function guard(r,c){const row=r>=0&&r<x.rows,col=row?c>=0&&c<x.cols:null,match=row&&col?grid2[r][c]===1:null;return {row,col,match,allowed:Boolean(row&&col&&match)};}
 function emit(line,phase,title,options={}){
  const f=frames.at(-1),methodLocals=Object.fromEntries(Object.entries(x).map(([name,value])=>[name,name==='grid1'?grid1:name==='grid2'?grid2:copy(value)]));
  const locals=f?{r:f.r,c:f.c,...Object.fromEntries(['is_sub','down','up','right','left'].filter(name=>f[name]!==undefined).map(name=>[name,f[name]])),grid1,grid2,rows:x.rows,cols:x.cols}:methodLocals;
  const names=f?['r','c','is_sub','rows','cols']:recursive?['r','c','count','rows','cols']:['cr','cc','is_sub','count','nr','nc'];
  steps.push({arr:[],title,note:bi('',''),codeLines:[line],final:Boolean(options.final),vars:names.map(name=>({name,value:locals[name]??'—'})),
   subIslands1905View:{id:1905,mode,phase,scope:f?'dfs':'countSubIslands',source:{line,text:code[line-1],timing:'after'},locals,methodLocals,
    grid1,grid2,original2:initial2,owners,checks,count:x.count??null,currentId:group?.id??null,
    status:{name:f||!recursive?'is_sub':'dfs()',value:f?f.is_sub??null:recursive?rootResult:x.is_sub??null,owner:f?group.id:recursive?resultOwner:flagOwner,cell:f?[f.r,f.c]:null},
    history:history.map(h=>({...h,seed:[...h.seed],witness:h.witness?[...h.witness]:null})),
    frames:frames.map(frame=>({...frame})),work:recursive?frames.map(frame=>({...frame})):x.stack?copy(x.stack):null,
    active:options.active??null,neighbor:options.neighbor??null,direction:options.direction??null,guard:options.guard??null,
    paint:options.paint??null,comparison:options.comparison??null,returned:options.returned??null,returnName:options.returnName??null,increment:options.increment??null},
  });
 }
 function decide(line,result){group.verdict=result;rootResult=result;resultOwner=group.id;emit(line,result?'accept':'reject',bi(result?`✓ Đảo #${group.id} nằm trọn trong grid1`:`× Đảo #${group.id} có ô lệch`,result?`✓ Island #${group.id} fits grid1`:`× Island #${group.id} has a mismatch`),{active:group.seed});}
 function increment(line){const before=x.count;x.count++;group.counted=true;emit(line,'count',bi(`count: ${before} → ${x.count}`,`count: ${before} → ${x.count}`),{active:group.seed,increment:{from:before,to:x.count,owner:group.id}});}
 x.rows=grid2.length;x.cols=grid2[0].length;emit(3,'dimensions',bi('Hai lưới cùng kích thước','Two equal-sized grids'));
 if(recursive){
  emit(4,'define',bi('Tạo dfs trả boolean','Define boolean DFS'));
  function dfs(r,c){const f={id:nextId++,r,c};frames.push(f);const active=[r,c],g=guard(r,c);emit(5,'bounds',bi('Trong biên ?','Inside grid ?'),{active,guard:{...g,match:null,allowed:null}});
   if(!g.row||!g.col){emit(6,'return-neutral',bi('↩ True · ngoài biên','↩ True · outside'),{active,returned:true});frames.pop();return true;}
   emit(7,'guard',bi(g.match?'✓ Đất chưa thăm':'↩ Nước / đã thăm',g.match?'✓ Unvisited land':'↩ Water / visited'),{active,guard:g});
   if(!g.match){emit(8,'return-neutral',bi('↩ True · bỏ qua ô này','↩ True · skip this cell'),{active,returned:true});frames.pop();return true;}
   const comparison=compare(r,c);f.is_sub=comparison.covered;emit(9,'compare',bi(f.is_sub?'✓ Ô này nằm trên đất grid1':'× Ô này nằm trên nước grid1',f.is_sub?'✓ This cell lies over grid1 land':'× This cell lies over grid1 water'),{active,comparison});
   mark(r,c);emit(10,'mark',bi('grid2: 1 → 0','grid2: 1 → 0'),{active,paint:{r,c}});
   DIRS.forEach(([dr,dc,name],j)=>{f[name]=dfs(r+dr,c+dc);emit(11+j,'resume',bi(`↩ ${name} = ${f[name]?'True':'False'}`,`↩ ${name} = ${f[name]?'True':'False'}`),{active,neighbor:[r+dr,c+dc],direction:[dr,dc],returned:f[name],returnName:name});});
   const result=f.is_sub&&f.down&&f.up&&f.right&&f.left;if(frames.length===1)group.complete=true;emit(15,'return-result',bi(`↩ ${result?'True':'False'}`,`↩ ${result?'True':'False'}`),{active,returned:result});frames.pop();return result;
  }
  x.count=0;emit(16,'count-init',bi('count = 0','count = 0'));
  for(let r=0;r<x.rows;r++){x.r=r;emit(17,'scan-row',bi(`Hàng ${r}`,`Row ${r}`));for(let c=0;c<x.cols;c++){x.c=c;const active=[r,c];emit(18,'scan',bi(`Quét (${r}, ${c})`,`Scan (${r}, ${c})`),{active});const land=grid2[r][c]===1;emit(19,'land-check',bi(land?'✓ Bắt đầu đảo grid2':'× Bỏ qua',land?'✓ Start grid2 island':'× Skip'),{active});if(!land)continue;start(r,c);const result=dfs(r,c);decide(20,result);if(result)increment(21);}emit(18,'columns-end',bi('Hết cột','Row complete'));}emit(17,'rows-end',bi('Đã quét hết grid2','grid2 scan complete'));emit(22,'done',bi(`Có ${x.count} đảo con`,`${x.count} sub-islands`),{final:true});
 }else{
  x.directions=DIRS.map(([dr,dc])=>[dr,dc]);emit(4,'directions',bi('4 hướng cạnh','4 edge directions'));x.count=0;emit(5,'count-init',bi('count = 0','count = 0'));
  for(let r=0;r<x.rows;r++){x.r=r;emit(6,'scan-row',bi(`Hàng ${r}`,`Row ${r}`));for(let c=0;c<x.cols;c++){x.c=c;const active=[r,c];emit(7,'scan',bi(`Quét (${r}, ${c})`,`Scan (${r}, ${c})`),{active});const land=grid2[r][c]===1;emit(8,'land-check',bi(land?'✓ Bắt đầu đảo grid2':'× Bỏ qua',land?'✓ Start grid2 island':'× Skip'),{active});if(!land)continue;
    start(r,c);x.stack=[[r,c]];emit(9,'stack-init',bi(`Đảo #${group.id} → stack`,`Island #${group.id} → stack`),{active});mark(r,c);emit(10,'mark',bi('grid2: 1 → 0','grid2: 1 → 0'),{active,paint:{r,c}});x.is_sub=true;flagOwner=group.id;emit(11,'flag-init',bi('is_sub = True','is_sub = True'));
    while(x.stack.length){emit(12,'while',bi('Thăm tiếp cả đảo','Continue through the whole island'));[x.cr,x.cc]=x.stack.pop();const here=[x.cr,x.cc];emit(13,'take',bi(`Lấy (${x.cr}, ${x.cc})`,`Take (${x.cr}, ${x.cc})`),{active:here});const comparison=compare(x.cr,x.cc);emit(14,'compare',bi(comparison.covered?'✓ Ô này nằm trên đất grid1':'× Ô này nằm trên nước grid1',comparison.covered?'✓ This cell lies over grid1 land':'× This cell lies over grid1 water'),{active:here,comparison});if(!comparison.covered){x.is_sub=false;emit(15,'flag-false',bi('is_sub = False','is_sub = False'),{active:here});}
     for(const [dr,dc]of x.directions){x.dr=dr;x.dc=dc;emit(16,'direction',bi('Chọn hướng','Choose direction'),{active:here,direction:[dr,dc]});x.nr=x.cr+dr;x.nc=x.cc+dc;const options={active:here,neighbor:[x.nr,x.nc],direction:[dr,dc]};emit(17,'neighbor',bi(`Xét (${x.nr}, ${x.nc})`,`Inspect (${x.nr}, ${x.nc})`),options);const g=guard(x.nr,x.nc);emit(18,'guard',bi(g.allowed?'✓ Cùng đảo grid2':'× Bỏ qua',g.allowed?'✓ Same grid2 island':'× Skip'),{...options,guard:g});if(!g.allowed)continue;mark(x.nr,x.nc);emit(19,'mark',bi('grid2: 1 → 0','grid2: 1 → 0'),{...options,paint:{r:x.nr,c:x.nc}});x.stack.push([x.nr,x.nc]);emit(20,'append',bi('Thêm vào stack','Append to stack'),options);}
     emit(16,'directions-end',bi('Đã xét 4 hướng','4 directions checked'),{active:here});
    }
    group.complete=true;emit(12,'empty',bi('Đã thăm hết đảo','Whole island visited'));decide(21,x.is_sub);if(x.is_sub)increment(22);
   }emit(7,'columns-end',bi('Hết cột','Row complete'));}emit(6,'rows-end',bi('Đã quét hết grid2','grid2 scan complete'));emit(23,'done',bi(`Có ${x.count} đảo con`,`${x.count} sub-islands`),{final:true});
 }
 return {original,answer:x.count,steps};
}
module.exports={1905:{...base,code:STACK,code2:RECURSIVE,builder:(input,params={})=>build(input,Number(params.approach)===2),builder2:input=>build(input,true),liveArgs:parse,debugMode:'line-by-line',
 statement:bi('Một đảo grid2 được tính khi mọi ô của nó đều nằm trên đất grid1. Nhập grid1;grid2.','Count a grid2 island only when all of its cells lie over grid1 land. Enter grid1;grid2.'),
 approach:[bi('So từng ô → gặp một ô lệch thì loại cả đảo. Vẫn duyệt hết đảo, rồi mới xét +1.','Compare each cell → one mismatch rejects the whole island. Still visit every cell, then decide whether to add 1.')],
}};
