const base=require('./backtracking')[79];
const bi=(vi,en)=>({vi,en});
const CODE=[
 'from collections import Counter',
 'class Solution:',
 '    def exist(self, board, word):',
 '        rows, cols = len(board), len(board[0])',
 '        available = Counter(ch for row in board for ch in row)',
 '        needed = Counter(word)',
 '        if needed - available:',
 '            return False',
 '        def dfs(r, c, i):',
 '            if i == len(word):',
 '                return True',
 '            if r < 0 or r >= rows or c < 0 or c >= cols:',
 '                return False',
 '            if board[r][c] != word[i]:',
 '                return False',
 '            saved = board[r][c]',
 "            board[r][c] = '#'",
 '            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):',
 '                found = dfs(r + dr, c + dc, i + 1)',
 '                if found:',
 '                    board[r][c] = saved',
 '                    return True',
 '            board[r][c] = saved',
 '            return False',
 '        for r in range(rows):',
 '            for c in range(cols):',
 '                if dfs(r, c, 0):',
 '                    return True',
 '        return False',
];
const DIRECTIONS=[[1,0,'↓'],[-1,0,'↑'],[0,1,'→'],[0,-1,'←']];
function parse79(input,params={}){
 const board=String(input).split(/[;|]/).map(row=>row.trim()).filter(Boolean).map(row=>row.includes(',')?row.split(',').map(ch=>ch.trim()):[...row.replace(/\s+/g,'')]);
 const word=String(params.word??'ABCCED');
 if(!board.length||board.length>6||!board[0].length||board[0].length>6||board.some(row=>row.length!==board[0].length||row.some(ch=>!(/^[A-Za-z]$/).test(ch))))
  throw new Error('79: bảng chữ nhật 1…6 hàng/cột, mỗi ô một chữ cái / use a rectangular 1…6 by 1…6 board of letters.');
 if(!/^[A-Za-z]{1,15}$/.test(word))throw new Error('79: word gồm 1…15 chữ cái / word must contain 1…15 letters.');
 return {board,word};
}
function buildWordSearch79(input,params={}){
 const parsed=parse79(input,params),board=parsed.board.map(row=>[...row]),original=parsed.board,word=parsed.word;
 const rows=board.length,cols=board[0].length,outer={board,word},steps=[],stack=[],triedStarts=[];
 let available=null,needed=null,winningPath=[],missing={},calls=0,omitted=0,frames=0;
 const copy=value=>Array.isArray(value)?value.map(copy):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,copy(v)])):value;
 const count=text=>{const out={};for(const ch of text)out[ch]=(out[ch]??0)+1;return out;};
 const inside=(r,c)=>r>=0&&r<rows&&c>=0&&c<cols;
 const titles={
  dimensions:bi('Đọc kích thước bảng','Read board size'),'count-board':bi('Đếm chữ trên bảng','Count board letters'),
  'count-word':bi('Đếm chữ cần tìm','Count target letters'),'check-counts':bi('Đủ số chữ không?','Enough copies of each letter?'),
  'define-dfs':bi('Chuẩn bị DFS','Define DFS'),'check-complete':bi('Ghép đủ từ?','Word complete?'),
  'check-bounds':bi('Kiểm tra biên','Check bounds'),'check-letter':bi('So sánh ký tự','Compare letters'),
  save:bi('Giữ ký tự gốc','Save original letter'),mark:bi("Đánh dấu ô '#'","Mark cell '#'"),
  direction:bi('Thử hướng tiếp theo','Try the next direction'),'child-result':bi('Nhận kết quả nhánh con','Child call returns'),
  'check-found':bi('Nhánh con tìm được?','Did the child succeed?'),restore:bi('Khôi phục ô ↶','Restore cell ↶'),
  'row-loop':bi('Chọn hàng bắt đầu','Choose starting row'),'col-loop':bi('Chọn ô bắt đầu','Choose starting cell'),
  'start-result':bi('Kiểm tra điểm bắt đầu','Check starting call'),found:bi('Tìm thấy ✓','Found ✓'),reject:bi('Bỏ nhánh ×','Reject branch ×'),
  'return-dfs':bi('Trả kết quả DFS','Return DFS result'),'return-true':bi('return True ✓','return True ✓'),'return-false':bi('return False ×','return False ×'),
 };
 function emit(line,action,options={}){
  const frame=stack.at(-1);frames++;
  if(steps.length>=4000&&!options.final){omitted++;return;}
  const locals=copy(frame?{...frame.locals,board,word,rows,cols}:outer);
  const activePath=stack.filter(item=>item.marked).map(item=>({r:item.locals.r,c:item.locals.c}));
  const index=frame?.locals.i??0,current=frame?{r:frame.locals.r,c:frame.locals.c}:Number.isInteger(outer.r)&&Number.isInteger(outer.c)?{r:outer.r,c:outer.c}:null;
  const parent=stack.at(-2),direction=frame&&parent?DIRECTIONS.find(([dr,dc])=>parent.locals.r+dr===current.r&&parent.locals.c+dc===current.c):null;
  const view={
   source:{line,text:CODE[line-1],timing:'after',scope:frame?'dfs':'exist'},frame:frames,locals,
   board:board.map(row=>[...row]),original:original.map(row=>[...row]),rows,cols,word,
   path:options.final&&options.result?copy(winningPath):copy(activePath),activePath:copy(activePath),winningPath:copy(winningPath),
   current,target:current,rejected:options.reason?current:null,restored:action==='restore'?current:null,
   stack:stack.map(item=>({...item.locals,marked:item.marked})),triedStarts:triedStarts.map(cell=>[...cell]),
   index,action,reason:options.reason??null,direction:direction?{dr:direction[0],dc:direction[1],symbol:direction[2]}:null,
   condition:options.condition??null,change:options.change??null,result:options.result??null,
   available:available?{...available}:null,needed:needed?{...needed}:null,missing:{...missing},calls,omitted,traceTruncated:omitted>0,
  };
  const title=titles[action]??bi(action,action);
  steps.push({title:bi(`Dòng ${line} · ${title.vi}`,`Line ${line} · ${title.en}`),note:bi('',''),arr:[],highlight:[],mark:[],
   final:!!options.final,codeLines:[line],debugLine:line,
   vars:Object.entries(locals).map(([name,value])=>({name,value:typeof value==='object'?JSON.stringify(value):value})),wordSearchView:view});
 }
 outer.rows=rows;outer.cols=cols;emit(4,'dimensions');
 available=count(board.flat().join(''));outer.available=available;emit(5,'count-board');
 needed=count(word);outer.needed=needed;emit(6,'count-word');
 missing=Object.fromEntries(Object.entries(needed).filter(([ch,n])=>n>(available[ch]??0)).map(([ch,n])=>[ch,n-(available[ch]??0)]));
 const insufficient=Object.keys(missing).length>0;
 emit(7,'check-counts',{condition:{expression:'needed - available',result:insufficient}});
 if(insufficient){emit(8,'return-false',{final:true,result:false,reason:'count'});return {original:parsed.board,answer:false,steps};}
 emit(9,'define-dfs');
 function dfs(r,c,i){
  const frame={locals:{r,c,i},marked:false};stack.push(frame);calls++;
  const complete=i===word.length;
  emit(10,'check-complete',{condition:{expression:'i == len(word)',result:complete}});
  if(complete){
   winningPath=stack.filter(item=>item.marked).map(item=>({r:item.locals.r,c:item.locals.c}));
   emit(11,'found',{result:true});stack.pop();return true;
  }
  const outside=!inside(r,c);
  emit(12,'check-bounds',{condition:{expression:'outside board',result:outside},reason:outside?'outside':null});
  if(outside){emit(13,'reject',{result:false,reason:'outside'});stack.pop();return false;}
  const mismatch=board[r][c]!==word[i],reason=board[r][c]==='#'?'reused':'mismatch';
  emit(14,'check-letter',{condition:{expression:'board[r][c] != word[i]',result:mismatch},reason:mismatch?reason:null});
  if(mismatch){emit(15,'reject',{result:false,reason});stack.pop();return false;}
  frame.locals.saved=board[r][c];emit(16,'save');
  board[r][c]='#';frame.marked=true;
  emit(17,'mark',{change:{from:frame.locals.saved,to:'#',r,c}});
  for(const [dr,dc] of DIRECTIONS){
   frame.locals.dr=dr;frame.locals.dc=dc;
   emit(18,'direction',{condition:{expression:'for dr, dc',result:true}});
   frame.locals.found=dfs(r+dr,c+dc,i+1);emit(19,'child-result');
   emit(20,'check-found',{condition:{expression:'found',result:frame.locals.found}});
   if(frame.locals.found){
    board[r][c]=frame.locals.saved;frame.marked=false;
    emit(21,'restore',{change:{from:'#',to:frame.locals.saved,r,c}});
    emit(22,'return-dfs',{result:true});stack.pop();return true;
   }
  }
  emit(18,'direction',{condition:{expression:'for dr, dc',result:false}});
  board[r][c]=frame.locals.saved;frame.marked=false;
  emit(23,'restore',{change:{from:'#',to:frame.locals.saved,r,c}});
  emit(24,'return-dfs',{result:false});stack.pop();return false;
 }
 for(let r=0;r<rows;r++){
  outer.r=r;emit(25,'row-loop',{condition:{expression:'for r',result:true}});
  for(let c=0;c<cols;c++){
   outer.c=c;emit(26,'col-loop',{condition:{expression:'for c',result:true}});triedStarts.push([r,c]);
   const found=dfs(r,c,0);emit(27,'start-result',{condition:{expression:'dfs(r, c, 0)',result:found}});
   if(found){emit(28,'return-true',{final:true,result:true});return {original:parsed.board,answer:true,steps};}
  }
  emit(26,'col-loop',{condition:{expression:'for c',result:false}});
 }
 emit(25,'row-loop',{condition:{expression:'for r',result:false}});
 emit(29,'return-false',{final:true,result:false});return {original:parsed.board,answer:false,steps};
}
module.exports={79:{...base,code:CODE,debugMode:'line-by-line',builder:buildWordSearch79,
 approach:[bi('Khớp từng ký tự, chỉ đi ngang hoặc dọc.','Match each letter; move horizontally or vertically.'),bi("Đánh dấu '#' khi dùng ô và khôi phục khi quay về.","Mark a cell '#' while in use and restore it on return.")],
 liveArgs:(input,params)=>{const {board,word}=parse79(input,params);return [board,word];}}};
