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
function recorder(id,code,original,locals,mode,start=null){
  const steps=[],frames=[];let image=copy(original),owners=original.map(row=>row.map(()=>0)),nextId=0;
  function paint(r,c,value,owner=0){image=image.map((row,j)=>j===r?row.map((x,k)=>k===c?value:x):row);locals[id===200?'grid':'image']=image;if(owner)owners=owners.map((row,j)=>j===r?row.map((x,k)=>k===c?owner:x):row);}
  locals[id===200?'grid':'image']=image;
  function emit(line,phase,title,options={}){
    const f=frames.at(-1),scope=f?'dfs':id===200?'numIslands':'floodFill';
    const actual=f?{r:f.r,c:f.c,rows:locals.rows,cols:locals.cols,old:locals.old,color:locals.color,image}:Object.fromEntries(Object.entries(locals).map(([k,v])=>[k,k==='image'||k==='grid'?image:copy(v)]));
    const names=id===200?['islands','r','c','nr','nc','len(stack)']:f?['r','c','old','color','rows','cols']:['r','c','nr','nc','old','color'];
    const work=mode==='recursive'?frames.map(frame=>({id:frame.id,r:frame.r,c:frame.c})):(locals[mode==='queue'?'queue':'stack']??null);
    steps.push({arr:[],title,note:bi('',''),codeLines:[line],final:Boolean(options.final),vars:names.map(name=>({name,value:name==='len(stack)'?locals.stack?.length??'—':actual[name]??'—'})),
      floodPicturesView:{id,mode,phase,source:{line,text:code[line-1],timing:'after'},scope,locals:actual,image,original,owners,start,
        old:locals.old??null,color:locals.color??null,count:locals.islands??null,increment:phase==='island'?{from:locals.islands-1,to:locals.islands}:null,
        frames:frames.map(frame=>({...frame})),work:copy(work),active:options.active??null,neighbor:options.neighbor??null,direction:options.direction??null,guard:options.guard??null,
        paint:options.paint??null,returned:options.returned??null,
        filled:image.reduce((sum,row,r)=>sum+row.filter((x,c)=>x!==original[r][c]).length,0)},
    });
  }
  return {steps,frames,paint,emit,get image(){return image;},frame(r,c){return {id:nextId++,r,c};}};
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
function build200(input){
  const original=parse(input,200),x={},rec=recorder(200,ISLANDS,original,x,'stack'),{emit,paint}=rec;
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
module.exports={
  733:{...base[733],code:iterativeCode(),code2:RECURSIVE,code3:iterativeCode(true),builder:build733,liveArgs:args733,debugMode:'line-by-line',
    approach:[bi('Tô ô khi phát hiện → xét 4 ô cạnh. Stack: lấy cuối; queue: lấy đầu; đệ quy: đi sâu rồi trở về.','Recolor on discovery → inspect 4 edge neighbors. Stack: take last; queue: take first; recursion: go deeper, then return.')],
  },
  200:{...base[200],code:ISLANDS,builder:build200,liveArgs:input=>[parse(input,200)],debugMode:'line-by-line',
    approach:[bi('Gặp đất chưa thăm → +1 đảo. Thăm hết đảo bằng stack rồi quét tiếp. Chỉ nối 4 cạnh.','Unvisited land → +1 island. Visit the entire island using a stack, then resume scanning. Connect only across 4 edges.')],
  },
};
