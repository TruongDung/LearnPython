'use strict';
const base=require('./flood-fill')[463],bi=(vi,en)=>({vi,en});
// Edge order follows the Python loop: down, up, right, left.
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]],OPPOSITE=[1,0,3,2];
const DIRECT=[
 'class Solution:','    def islandPerimeter(self, grid):',
 '        rows, cols = len(grid), len(grid[0])','        perimeter = 0',
 '        for r in range(rows):','            for c in range(cols):',
 '                if grid[r][c] != 1:','                    continue',
 '                for delta_r, delta_c in [(1,0),(-1,0),(0,1),(0,-1)]:',
 '                    next_r, next_c = r + delta_r, c + delta_c',
 '                    out_of_bounds = next_r < 0 or next_r >= rows or next_c < 0 or next_c >= cols',
 '                    if out_of_bounds or grid[next_r][next_c] == 0:',
 '                        perimeter += 1','        return perimeter',
];
const SHARED=base.code2;
function parse(input){
 if(typeof input!=='string'||!input.trim())throw new TypeError('#463: nhập ma trận 0/1 / enter a binary matrix.');
 const grid=input.trim().split('|').map(row=>(row.trim().includes(',')?row.trim().split(','):row.trim().split('')).map(x=>x.trim().replace(/^"|"$/g,'')));
 if(!grid[0].length||grid.some(row=>row.length!==grid[0].length||row.some(x=>!/^[01]$/.test(x))))throw new TypeError('#463: ma trận chữ nhật chỉ chứa 0/1 / rectangular binary matrix required.');
 return grid.map(row=>row.map(Number));
}
const clone=value=>Array.isArray(value)?value.map(clone):value;
function build(input,shared=false){
 const grid=parse(input),rows=grid.length,cols=grid[0].length,code=shared?SHARED:DIRECT,x={grid},steps=[],history=[];
 let edges=grid.map(row=>row.map(()=>Array(4).fill('unseen'))),landAdded=0,pairsRemoved=0;
 function edge(r,c,side,status){edges=edges.map((row,i)=>i===r?row.map((cell,j)=>j===c?cell.map((s,k)=>k===side?status:s):cell):row);}
 function emit(line,phase,title,options={}){
  const locals=Object.fromEntries(Object.entries(x).map(([name,value])=>[name,name==='grid'?grid:clone(value)]));
  const names=shared?['i','j','total','n_rows','n_cols']:['r','c','perimeter','next_r','next_c','out_of_bounds'];
  steps.push({arr:[],title,note:bi('',''),codeLines:[line],final:phase==='done',vars:names.map(name=>({name,value:locals[name]??'—'})),
   perimeter463View:{id:463,mode:shared?'shared':'direct',phase,source:{line,text:code[line-1],timing:'after'},locals,grid,edges,
    total:shared?x.total??null:x.perimeter??null,landAdded,pairsRemoved,history:history.map(h=>({...h})),
    active:options.active??null,neighbor:options.neighbor??null,side:options.side??null,check:options.check??null,change:options.change??null},
  });
 }
 function change(line,delta,r,c,side=null,other=null){
  const name=shared?'total':'perimeter',from=x[name];x[name]+=delta;
  if(delta===4){landAdded++;for(let s=0;s<4;s++)edge(r,c,s,'counted');}
  else if(delta===-2){pairsRemoved++;edge(r,c,side,'removed');edge(other[0],other[1],OPPOSITE[side],'removed');}
  else edge(r,c,side,'counted');
  const update={from,to:x[name],delta,r,c,side,other};history.push(update);
  emit(line,delta<0?'subtract':'add',bi(`${name}: ${from} → ${x[name]}`,`${name}: ${from} → ${x[name]}`),{active:[r,c],neighbor:other??(side===null?null:[r+DIRS[side][0],c+DIRS[side][1]]),side,change:update});
 }
 if(shared){
  x.n_rows=rows;emit(3,'dimensions',bi('Số hàng','Rows'));x.n_cols=cols;emit(4,'dimensions',bi('Số cột','Columns'));x.total=0;emit(5,'init',bi('total = 0','total = 0'));
  for(let i=0;i<rows;i++){x.i=i;emit(6,'row',bi(`Hàng ${i}`,`Row ${i}`));for(let j=0;j<cols;j++){x.j=j;const active=[i,j];emit(7,'scan',bi(`Quét (${i}, ${j})`,`Scan (${i}, ${j})`),{active});emit(8,'land',bi(grid[i][j]?'■ Đất':'∿ Nước',grid[i][j]?'■ Land':'∿ Water'),{active});if(!grid[i][j])continue;
   change(9,4,i,j);
   for(const [side,line]of [[3,10],[1,12]]){const [dr,dc]=DIRS[side],nr=i+dr,nc=j+dc,outside=nr<0||nc<0,neighborValue=outside?null:grid[nr][nc],allowed=!outside&&neighborValue===1,check={kind:side===3?'left':'up',outside,neighborValue,allowed},options={active,neighbor:[nr,nc],side,check};
    emit(line,'check',bi(allowed?'2 cạnh chung → −2 ?':'Không trừ',allowed?'2 shared edges → −2 ?':'No subtraction'),options);
    if(allowed)change(line+1,-2,i,j,side,[nr,nc]);
   }
  }emit(7,'columns-end',bi('Hết cột','Row complete'));}emit(6,'rows-end',bi('Hết hàng','Scan complete'));emit(14,'done',bi(`Chu vi = ${x.total}`,`Perimeter = ${x.total}`));
 }else{
  x.rows=rows;x.cols=cols;emit(3,'dimensions',bi('Kích thước lưới','Grid dimensions'));x.perimeter=0;emit(4,'init',bi('perimeter = 0','perimeter = 0'));
  for(let r=0;r<rows;r++){x.r=r;emit(5,'row',bi(`Hàng ${r}`,`Row ${r}`));for(let c=0;c<cols;c++){x.c=c;const active=[r,c];emit(6,'scan',bi(`Quét (${r}, ${c})`,`Scan (${r}, ${c})`),{active});emit(7,'land',bi(grid[r][c]?'■ Đất':'∿ Nước',grid[r][c]?'■ Land':'∿ Water'),{active});if(!grid[r][c]){emit(8,'continue',bi('Bỏ qua nước','Skip water'),{active});continue;}
   for(let side=0;side<4;side++){[x.delta_r,x.delta_c]=DIRS[side];emit(9,'direction',bi('Chọn cạnh','Choose edge'),{active,side});x.next_r=r+x.delta_r;x.next_c=c+x.delta_c;const neighbor=[x.next_r,x.next_c],options={active,neighbor,side};emit(10,'neighbor',bi(`Ô kề (${neighbor.join(', ')})`,`Neighbor (${neighbor.join(', ')})`),options);
    x.out_of_bounds=x.next_r<0||x.next_r>=rows||x.next_c<0||x.next_c>=cols;emit(11,'bounds',bi(x.out_of_bounds?'Ngoài lưới':'Trong lưới',x.out_of_bounds?'Outside grid':'Inside grid'),options);
    const neighborValue=x.out_of_bounds?null:grid[x.next_r][x.next_c],allowed=x.out_of_bounds||neighborValue===0,check={kind:'boundary',outside:x.out_of_bounds,neighborValue,allowed};edge(r,c,side,allowed?'candidate':'shared');emit(12,'check',bi(allowed?'Cạnh biên → +1 ?':'Cạnh dính → +0',allowed?'Boundary edge → +1 ?':'Touching land → +0'),{...options,check});
    if(allowed)change(13,1,r,c,side);
   }emit(9,'directions-end',bi('Xong 4 cạnh','4 sides complete'),{active});
  }emit(6,'columns-end',bi('Hết cột','Row complete'));}emit(5,'rows-end',bi('Hết hàng','Scan complete'));emit(14,'done',bi(`Chu vi = ${x.perimeter}`,`Perimeter = ${x.perimeter}`));
 }
 return {original:grid,answer:shared?x.total:x.perimeter,steps};
}
module.exports={463:{...base,code:DIRECT,code2:SHARED,builder:(input,params={})=>build(input,Number(params.approach)===2),builder2:input=>build(input,true),liveArgs:input=>[parse(input)],debugMode:'line-by-line',
 statement:bi('Tính chu vi đảo: số cạnh đất tiếp giáp nước hoặc ngoài lưới.','Find the island perimeter: land edges touching water or the outside.'),
 approach:[bi('Cách 1: cạnh biên +1. Cách 2: ô đất +4, mỗi cặp cạnh chung −2.','Approach 1: +1 per boundary edge. Approach 2: +4 per land cell, −2 per shared pair.')],
}};
