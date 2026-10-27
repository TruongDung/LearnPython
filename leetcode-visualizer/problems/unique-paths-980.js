const base=require('./backtracking')[980];
const bi=(vi,en)=>({vi,en});
const copy=value=>Array.isArray(value)?value.map(copy):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,copy(v)])):value;
const DIRECTIONS=[[1,0,'↓'],[-1,0,'↑'],[0,1,'→'],[0,-1,'←']];
const CODE=[
 'class Solution:',
 '    def uniquePathsIII(self, grid):',
 '        rows, cols = len(grid), len(grid[0])',
 '        start = next((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == 1)',
 '        total = sum(cell != -1 for row in grid for cell in row)',
 '        visited = set()',
 '        path = []',
 '        answer = 0',
 '        def dfs(r, c, remain):',
 '            nonlocal answer',
 '            if r < 0 or r >= rows or c < 0 or c >= cols:',
 '                return',
 '            if grid[r][c] == -1 or (r, c) in visited:',
 '                return',
 '            visited.add((r, c))',
 '            path.append((r, c))',
 '            remain -= 1',
 '            if grid[r][c] == 2:',
 '                if remain == 0:',
 '                    answer += 1',
 '            else:',
 '                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):',
 '                    dfs(r + dr, c + dc, remain)',
 '            path.pop()',
 '            visited.remove((r, c))',
 '        dfs(start[0], start[1], total)',
 '        return answer',
];
function parse980(input){
 const rows=String(input).split(/[|;]/).map(row=>row.trim());
 if(!rows.length||rows.some(row=>!row))throw new RangeError('980: grid phải là bảng chữ nhật / grid must be rectangular.');
 const grid=rows.map(row=>row.split(',').map(cell=>/^-?\d+$/.test(cell.trim())?Number(cell.trim()):NaN));
 const cols=grid[0].length,values=grid.flat();
 if(!cols||grid.length*cols>20||grid.some(row=>row.length!==cols)||values.some(cell=>![-1,0,1,2].includes(cell))||values.filter(cell=>cell===1).length!==1||values.filter(cell=>cell===2).length!==1)
  throw new RangeError('980: tối đa 20 ô; chỉ dùng -1, 0, 1, 2; đúng một S=1 và một E=2 / at most 20 cells, values -1/0/1/2, exactly one start and one end.');
 return grid;
}
function buildUniquePaths980(input){
 const grid=parse980(input),rows=grid.length,cols=grid[0].length,steps=[],stack=[],path=[],visited=new Set(),solutions=[],outer={grid};
 const start=grid.flatMap((row,r)=>row.map((cell,c)=>cell===1?[r,c]:null)).find(Boolean);
 const total=grid.flat().filter(cell=>cell!==-1).length;
 let answer=0,frames=0,omitted=0;
 const titles={
  dimensions:bi('Đọc kích thước bảng','Read board size'),start:bi('Tìm ô bắt đầu S','Find start S'),total:bi('Đếm các ô phải đi qua','Count walkable cells'),
  'init-visited':bi('Chưa đánh dấu ô nào','No cells visited'),'init-path':bi('Đường đi đang trống','Empty path'),'init-answer':bi('Chưa có đường hợp lệ','No valid paths yet'),define:bi('Chuẩn bị DFS','Define DFS'),
  bounds:bi('Kiểm tra biên','Check bounds'),blocked:bi('Ô bị chặn hoặc đã đi?','Wall or already visited?'),reject:bi('Bỏ nhánh ×','Reject branch ×'),
  visit:bi('Đánh dấu ô ●','Mark visited ●'),append:bi('Thêm ô vào đường đi','Append cell to path'),remaining:bi('Giảm remain một ô','Decrease remain by one'),
  end:bi('Đã tới E?','Reached E?'),complete:bi('Đã đi đủ mọi ô?','Covered every cell?'),save:bi('Thêm một đường hợp lệ ✓','Count one valid path ✓'),
  direction:bi('Thử hướng tiếp theo','Try next direction'),'child-return':bi('Nhánh con đã xong ↶','Child finished ↶'),
  pop:bi('Bỏ ô cuối đường đi ↶','Pop the last cell ↶'),unvisit:bi('Bỏ đánh dấu ô ↶','Unmark cell ↶'),done:bi('Duyệt xong','Search finished'),final:bi('Tổng số đường hợp lệ','Total valid paths'),
 };
 const inside=(r,c)=>r>=0&&r<rows&&c>=0&&c<cols;
 const visitedArray=()=>[...visited].map(key=>key.split(',').map(Number)).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 function emit(line,action,options={}){
  frames++;
  if(steps.length>=8000&&action!=='final'){omitted++;return;}
  const frame=stack.at(-1),seen=visitedArray();
  const locals=copy(frame?{...frame.locals,grid,rows,cols,visited:seen,path,answer}:outer);
  const view={source:{line,text:CODE[line-1],timing:'after',scope:frame?'dfs':'uniquePathsIII'},frame:frames,omitted,
   grid:copy(grid),rows,cols,start:[...start],total,locals,path:copy(path),visited:seen,solutions:copy(solutions),answer,
   current:frame?[frame.locals.r,frame.locals.c]:null,remain:frame?.locals.remain??null,
   stack:stack.map(item=>({...item.locals})),action,condition:options.condition??null,reason:options.reason??null,change:options.change??null};
  const title=titles[action];
  steps.push({title:bi(`Dòng ${line} · ${title.vi}`,`Line ${line} · ${title.en}`),note:bi('',''),arr:[],highlight:[],mark:[],codeLines:[line],debugLine:line,final:action==='final',
   vars:Object.entries(locals).map(([name,value])=>({name,value:typeof value==='object'?JSON.stringify(value):value})),uniquePaths980View:view});
 }
 outer.rows=rows;outer.cols=cols;emit(3,'dimensions');outer.start=start;emit(4,'start');outer.total=total;emit(5,'total');
 outer.visited=[];emit(6,'init-visited');outer.path=path;emit(7,'init-path');outer.answer=answer;emit(8,'init-answer');emit(9,'define');
 function dfs(r,c,remain){
  const frame={locals:{r,c,remain}};stack.push(frame);
  const outside=!inside(r,c);emit(11,'bounds',{condition:{expression:'outside grid',result:outside},reason:outside?'outside':null});
  if(outside){emit(12,'reject',{reason:'outside'});stack.pop();return;}
  const reason=grid[r][c]===-1?'wall':visited.has(`${r},${c}`)?'visited':null;
  emit(13,'blocked',{condition:{expression:'wall or visited',result:!!reason},reason});
  if(reason){emit(14,'reject',{reason});stack.pop();return;}
  visited.add(`${r},${c}`);emit(15,'visit',{change:{kind:'visit',cell:[r,c]}});
  path.push([r,c]);emit(16,'append',{change:{kind:'append',cell:[r,c]}});
  frame.locals.remain=remain-1;emit(17,'remaining',{change:{kind:'remain',from:remain,to:remain-1}});
  const atEnd=grid[r][c]===2;emit(18,'end',{condition:{expression:'grid[r][c] == 2',result:atEnd}});
  if(atEnd){
   const full=frame.locals.remain===0;emit(19,'complete',{condition:{expression:'remain == 0',result:full},reason:full?null:'early'});
   if(full){answer++;solutions.push(copy(path));emit(20,'save',{change:{kind:'save',index:answer-1}});}
  }else{
   for(const [dr,dc] of DIRECTIONS){
    frame.locals.dr=dr;frame.locals.dc=dc;emit(22,'direction',{condition:{expression:'for dr, dc',result:true}});
    dfs(r+dr,c+dc,frame.locals.remain);emit(23,'child-return');
   }
   emit(22,'direction',{condition:{expression:'for dr, dc',result:false}});
  }
  const cell=path.pop();emit(24,'pop',{change:{kind:'pop',cell}});
  visited.delete(`${r},${c}`);emit(25,'unvisit',{change:{kind:'unvisit',cell:[r,c]}});stack.pop();
 }
 dfs(start[0],start[1],total);outer.visited=visitedArray();outer.answer=answer;emit(26,'done');emit(27,'final');
 return {original:copy(grid),answer,steps};
}
module.exports={980:{...base,code:CODE,debugMode:'line-by-line',builder:buildUniquePaths980,
 approach:[bi('S → E: đi qua mọi ô trống đúng một lần.','S → E: cover every walkable cell exactly once.'),bi('Đánh dấu → thử 4 hướng → quay lui và bỏ đánh dấu.','Mark → try four directions → backtrack and unmark.')],
 liveArgs:input=>[parse980(input)]}};
