const base=require('./backtracking')[1240];
const bi=(vi,en)=>({vi,en});
const copy=value=>Array.isArray(value)?value.map(copy):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,copy(v)])):value;
const CODE=[
 'class Solution:',
 '    def tilingRectangle(self, n, m):',
 '        heights = [0] * m',
 '        placed = []',
 '        best = n * m',
 '        best_layout = list((r, c, 1) for r in range(n) for c in range(m))',
 '        def dfs(count):',
 '            nonlocal best, best_layout',
 '            if count >= best:',
 '                return',
 '            low = min(heights)',
 '            if low == n:',
 '                best = count',
 '                best_layout = placed[:]',
 '                return',
 '            col = heights.index(low)',
 '            run = 0',
 '            while col + run < m and heights[col + run] == low:',
 '                run += 1',
 '            limit = min(run, n - low)',
 '            for size in range(limit, 0, -1):',
 '                placed.append((low, col, size))',
 '                for j in range(size):',
 '                    heights[col + j] += size',
 '                dfs(count + 1)',
 '                for j in range(size):',
 '                    heights[col + j] -= size',
 '                placed.pop()',
 '        dfs(0)',
 '        return best',
];
function parse1240(input,params={}){
 const n=Number(Array.isArray(input)?input[0]:input),m=Number(params.m??3);
 if(!Number.isInteger(n)||!Number.isInteger(m)||n<1||m<1||n>8||m>8)throw new RangeError('1240: n và m là số nguyên từ 1 đến 8 / rectangle sides must be integers from 1 to 8.');
 return {n,m};
}
function buildTiling1240(input,params={}){
 const {n,m}=parse1240(input,params),heights=Array(m).fill(0),placed=[],steps=[],stack=[],outer={n,m};
 let best=n*m,bestLayout=[],frames=0,omitted=0;
 const titles={
  heights:bi('Các cột đang trống','Empty columns'),placed:bi('Chưa đặt hình vuông','No squares placed'),bound:bi('Mốc ban đầu: toàn ô 1×1','Initial bound: unit squares'),
  'init-layout':bi('Phương án ban đầu','Initial tiling'),define:bi('Chuẩn bị DFS','Define DFS'),prune:bi('Có thể dùng ít hơn best?','Can this beat best?'),reject:bi('Cắt nhánh ×','Prune branch ×'),
  low:bi('Tìm độ cao thấp nhất','Find the lowest height'),full:bi('Đã lấp kín?','Completely filled?'),'update-best':bi('Giảm best ✓','Improve best ✓'),
  save:bi('Lưu cách lát tốt hơn ✓','Save the better tiling ✓'),return:bi('Trở về nhánh cha ↶','Return to parent ↶'),col:bi('Chọn cột thấp nhất bên trái','Choose the leftmost lowest column'),
  run:bi('Bắt đầu đo đoạn ngang','Start measuring the plateau'),'check-run':bi('Cột tiếp còn cùng độ cao?','Next column at the same height?'),'grow-run':bi('Thêm một cột vào đoạn ngang','Extend the plateau'),
  limit:bi('Cỡ lớn nhất vừa chỗ trống','Largest square that fits'),size:bi('Thử cỡ từ lớn xuống nhỏ','Try larger squares first'),append:bi('Thêm hình vuông vào placed','Append a square to placed'),
  'fill-loop':bi('Chọn cột cần nâng','Choose a column to raise'),fill:bi('Nâng một cột','Raise one column'),'child-return':bi('Nhánh con đã xong ↶','Child finished ↶'),
  'undo-loop':bi('Chọn cột cần trả lại','Choose a column to restore'),undo:bi('Hạ một cột ↶','Restore one column ↶'),pop:bi('Bỏ hình vuông vừa thử ↶','Remove the trial square ↶'),
  done:bi('Duyệt xong','Search finished'),final:bi('Cách lát ít hình vuông nhất ✓','Fewest-square tiling ✓'),
 };
 function emit(line,action,options={}){
  frames++;if(steps.length>=8000&&action!=='final'){omitted++;return;}
  const frame=stack.at(-1),locals=copy(frame?{...frame.locals,n,m,heights,placed,best,best_layout:bestLayout}:outer);
  const view={n,m,heights:[...heights],placed:copy(placed),bestLayout:copy(bestLayout),best,frame:frames,omitted,locals,
   source:{line,text:CODE[line-1],scope:frame?'dfs':'tilingRectangle',timing:'after'},stack:stack.map(item=>({...item.locals})),
   count:frame?.locals.count??null,action,condition:options.condition??null,change:options.change??null};
  const title=titles[action];
  steps.push({title:bi(`Dòng ${line} · ${title.vi}`,`Line ${line} · ${title.en}`),note:bi('',''),arr:[],highlight:[],mark:[],codeLines:[line],debugLine:line,final:action==='final',
   vars:Object.entries(locals).map(([name,value])=>({name,value:typeof value==='object'?JSON.stringify(value):value})),tiling1240View:view});
 }
 outer.heights=heights;emit(3,'heights');outer.placed=placed;emit(4,'placed');outer.best=best;emit(5,'bound');
 bestLayout=Array.from({length:n},(_,r)=>Array.from({length:m},(_,c)=>[r,c,1])).flat();outer.best_layout=bestLayout;emit(6,'init-layout');emit(7,'define');
 function dfs(count){
  const frame={locals:{count}};stack.push(frame);
  const prune=count>=best;emit(9,'prune',{condition:{expression:'count >= best',result:prune}});
  if(prune){emit(10,'reject');stack.pop();return;}
  const low=Math.min(...heights);frame.locals.low=low;emit(11,'low');
  const full=low===n;emit(12,'full',{condition:{expression:'low == n',result:full}});
  if(full){
   const previous=best;best=count;emit(13,'update-best',{change:{kind:'best',from:previous,to:best}});
   bestLayout=copy(placed);emit(14,'save');emit(15,'return');stack.pop();return;
  }
  const col=heights.indexOf(low);frame.locals.col=col;emit(16,'col');
  frame.locals.run=0;emit(17,'run');
  while(true){
   const pass=col+frame.locals.run<m&&heights[col+frame.locals.run]===low;
   emit(18,'check-run',{condition:{expression:'next column at low',result:pass}});
   if(!pass)break;
   frame.locals.run++;emit(19,'grow-run');
  }
  const limit=Math.min(frame.locals.run,n-low);frame.locals.limit=limit;emit(20,'limit');
  for(let size=limit;size>=1;size--){
   frame.locals.size=size;emit(21,'size',{condition:{expression:'for size',result:true}});
   placed.push([low,col,size]);emit(22,'append',{change:{kind:'append',square:[low,col,size]}});
   for(let j=0;j<size;j++){
    frame.locals.j=j;emit(23,'fill-loop',{condition:{expression:'for j',result:true}});
    const before=heights[col+j];heights[col+j]+=size;emit(24,'fill',{change:{kind:'height',col:col+j,from:before,to:heights[col+j]}});
   }
   emit(23,'fill-loop',{condition:{expression:'for j',result:false}});
   dfs(count+1);emit(25,'child-return');
   for(let j=0;j<size;j++){
    frame.locals.j=j;emit(26,'undo-loop',{condition:{expression:'for j',result:true}});
    const before=heights[col+j];heights[col+j]-=size;emit(27,'undo',{change:{kind:'height',col:col+j,from:before,to:heights[col+j]}});
   }
   emit(26,'undo-loop',{condition:{expression:'for j',result:false}});
   const square=placed.pop();emit(28,'pop',{change:{kind:'pop',square}});
  }
  emit(21,'size',{condition:{expression:'for size',result:false}});stack.pop();
 }
 dfs(0);outer.best=best;outer.best_layout=bestLayout;emit(29,'done');emit(30,'final');
 return {n,m,answer:best,steps};
}
module.exports={1240:{...base,code:CODE,debugMode:'line-by-line',builder:buildTiling1240,
 approach:[bi('Lấp chỗ thấp nhất bên trái, thử hình vuông lớn trước.','Fill the leftmost lowest gap; try larger squares first.'),bi('Đặt → tìm tiếp → tháo ra. Dừng nhánh khi count ≥ best.','Place → search → undo. Prune when count ≥ best.')],
 complexity:{time:'Exponential',space:'O(n·m)',note:bi('DFS và cắt nhánh. Lưu các hình vuông đang thử, cách lát tốt nhất và ngăn xếp đệ quy.','DFS with branch pruning. Store trial squares, the best layout and the recursion stack.')},
 liveArgs:(input,params)=>{const {n,m}=parse1240(input,params);return[n,m];}}};
