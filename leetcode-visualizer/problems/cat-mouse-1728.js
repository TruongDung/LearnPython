const bi=(vi,en)=>({vi,en});
const CODE=[
 'from collections import deque',
 'class Solution:',
 '    def canMouseWin(self, grid, catJump, mouseJump):',
 '        rows, cols = len(grid), len(grid[0])',
 "        cells = tuple(r * cols + c for r in range(rows) for c in range(cols) if grid[r][c] != '#')",
 "        mouse = next(p for p in cells if grid[p // cols][p % cols] == 'M')",
 "        cat = next(p for p in cells if grid[p // cols][p % cols] == 'C')",
 "        food = next(p for p in cells if grid[p // cols][p % cols] == 'F')",
 '        def moves(p, jump):',
 '            r, c = divmod(p, cols)',
 '            result = [p]',
 '            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):',
 '                for k in range(1, jump + 1):',
 '                    nr, nc = r + dr * k, c + dc * k',
 "                    if not (0 <= nr < rows and 0 <= nc < cols) or grid[nr][nc] == '#':",
 '                        break',
 '                    result.append(nr * cols + nc)',
 '            return result',
 '        mouse_moves = dict((p, moves(p, mouseJump)) for p in cells)',
 '        cat_moves = dict((p, moves(p, catJump)) for p in cells)',
 '        degree = dict(((m, c), len(cat_moves[c])) for m in cells for c in cells)',
 '        win = {}',
 '        queue = deque()',
 '        for c in cells:',
 '            if c == food:',
 '                continue',
 '            for turn in (0, 1):',
 '                win[(food, c, turn)] = 0',
 '                queue.append((food, c, turn))',
 '        while queue:',
 '            m, c, turn = queue.popleft()',
 '            distance = win[(m, c, turn)]',
 '            if distance == 1000:',
 '                continue',
 '            if turn == 1:',
 '                parents = ((p, c, 0) for p in mouse_moves[m])',
 '            else:',
 '                parents = ((m, p, 1) for p in cat_moves[c])',
 '            for pm, pc, pt in parents:',
 '                state = (pm, pc, pt)',
 '                if pm == pc or pc == food or state in win:',
 '                    continue',
 '                if pt == 0:',
 '                    win[state] = distance + 1',
 '                    queue.append(state)',
 '                else:',
 '                    degree[(pm, pc)] -= 1',
 '                    if degree[(pm, pc)] == 0:',
 '                        win[state] = distance + 1',
 '                        queue.append(state)',
 '        return (mouse, cat, 0) in win',
];
function parse1728(input,params={}){
 let grid;try{if(Array.isArray(input))grid=[...input];else{const text=String(input??'').trim();grid=text.startsWith('[')?JSON.parse(text):text.split(/[|;\r\n]+/).map(row=>row.trim());}}catch(_){throw new RangeError('1728: nhập grid dạng M.C...F hoặc các hàng ngăn bằng | / enter a grid.');}
 const catJump=Number(params.catJump??1),mouseJump=Number(params.mouseJump??2);
 if(!Array.isArray(grid)||grid.length<1||grid.length>8||grid.some(row=>typeof row!=='string'||row.length!==grid[0].length||!/^[.CMF#]{1,8}$/.test(row))||['M','C','F'].some(ch=>grid.join('').split(ch).length!==2)||![catJump,mouseJump].every(jump=>Number.isInteger(jump)&&jump>=1&&jump<=8))
  throw new RangeError('1728: bảng chữ nhật 1–8 hàng/cột, đúng một M/C/F; bước nhảy 1–8 / rectangular grid up to 8×8, one M/C/F, jumps 1–8.');
 return{grid,catJump,mouseJump};
}
function buildCatMouse1728(input,params={}){
 const {grid,catJump,mouseJump}=parse1728(input,params),rows=grid.length,cols=grid[0].length,cells=[];
 let mouse,cat,food;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(grid[r][c]!=='#'){const p=r*cols+c;cells.push(p);if(grid[r][c]==='M')mouse=p;if(grid[r][c]==='C')cat=p;if(grid[r][c]==='F')food=p;}
 const main={grid,catJump,mouseJump},stack=[],mouseMoves={},catMoves={},degree=new Map(),win=new Map(),queue=[],steps=[],eliminated=new Set();
 let frame=0,omitted=0,phase='prepare',owner=0,queueHead=0;
 const clone=value=>Array.isArray(value)?value.map(clone):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clone(v)])):value;
 const key=state=>state.join(','),pair=(m,c)=>`${m},${c}`;
 const labels={size:bi('Đọc bàn cờ','Read grid'),cells:bi('Các ô có thể đứng','Walkable cells'),mouse:bi('Vị trí chuột','Mouse start'),cat:bi('Vị trí mèo','Cat start'),food:bi('Vị trí thức ăn','Food cell'),define:bi('Chuẩn bị các bước nhảy','Define legal jumps'),
  origin:bi('Ô xuất phát của bước nhảy','Jump origin'),stay:bi('Có thể đứng yên','Staying is allowed'),direction:bi('Thử hướng nhảy','Try a direction'),length:bi('Thử độ dài nhảy','Try jump length'),target:bi('Ô định nhảy tới','Candidate landing cell'),wall:bi('Có bị tường hoặc biên chặn?','Wall or boundary?'),break:bi('Dừng ở tường / biên','Stop at wall / boundary'),move:bi('Thêm ô có thể nhảy tới','Add legal destination'),'return-moves':bi('Đã tìm các nước đi','Legal moves ready'),
  'mouse-moves':bi('Nước đi của chuột đã sẵn sàng','Mouse moves ready'),'cat-moves':bi('Nước đi của mèo đã sẵn sàng','Cat moves ready'),degree:bi('Đếm lựa chọn của mèo','Count cat choices'),win:bi('Chưa có trạng thái đã giải','No resolved states yet'),queue:bi('Hàng đợi đang trống','Empty queue'),seed:bi('Chọn vị trí mèo khi chuột ở thức ăn','Seed mouse-at-food states'),'check-food':bi('Mèo cũng ở thức ăn?','Cat also at food?'),skip:bi('Bỏ qua trạng thái này','Skip state'),turn:bi('Xét lượt chuột / mèo','Mouse / cat turn'),terminal:bi('Chuột đã ở thức ăn ✓','Mouse already at food ✓'),enqueue:bi('Đưa trạng thái vào queue','Enqueue state'),
  loop:bi('Queue còn trạng thái?','Queue nonempty?'),pop:bi('Lấy trạng thái đã biết chuột thắng','Pop a known mouse win'),distance:bi('Số lượt để buộc thắng','Moves needed to force a win'),deadline:bi('Đã tới mốc 1000 lượt?','At the 1000-turn limit?'),'check-turn':bi('Lượt vừa đi là của ai?','Who moved previously?'),parents:bi('Tìm các trạng thái trước một nước','Find one-move predecessors'),parent:bi('Xét trạng thái trước','Inspect predecessor'),state:bi('Ghi bộ (chuột, mèo, lượt)','Set (mouse, cat, turn)'),guard:bi('Mèo thắng ngay hoặc đã biết?','Cat terminal or already resolved?'),'mouse-turn':bi('Đến lượt chuột?','Mouse to move?'),'mouse-win':bi('Có một nước thắng → chuột thắng ✓','One winning move → mouse wins ✓'),decrement:bi('Một lựa chọn của mèo cũng thua','One more cat choice loses'),'all-known':bi('Mọi nước của mèo đều thua?','Do all cat choices lose?'),'cat-forced':bi('Mọi nước đều thua → chuột thắng ✓','All cat choices lose → mouse wins ✓'),result:bi('Kết quả khi cả hai tối ưu','Result under optimal play')};
 function emit(line,event,extra={}){
  frame++;
  const initialParent=main.state&&key(main.state)===key([mouse,cat,0]);
  if(steps.length>=8000&&event!=='result'&&!(initialParent&&['mouse-win','cat-forced','enqueue'].includes(event))){omitted++;return;}
  const helper=stack.at(-1),locals=helper?{...helper,grid,rows,cols}:main;
  const child=Number.isInteger(main.m)?[main.m,main.c,main.turn]:null;
  const parent=Array.isArray(main.state)?main.state:null;
  const parentEvents=['parent','state','guard','skip','mouse-turn','mouse-win','decrement','all-known','cat-forced','enqueue'];
  const active=phase==='solve'&&parent&&parentEvents.includes(event)?parent:phase==='seed'&&Number.isInteger(main.c)?[food,main.c,main.turn??0]:child??[mouse,cat,0];
  const hasWin=!!active&&win.has(key(active)),terminalCat=!!active&&(active[0]===active[1]||active[1]===food);
  const legal=helper?[...helper.result??[]]:active?(active[2]===0?mouseMoves[active[0]]:catMoves[active[1]])??[]:[];
  const choices=helper?[]:legal.map(to=>{const next=active[2]===0?[to,active[1],1]:[active[0],to,0];return{to,state:next,rank:win.get(key(next))??null,catTerminal:next[0]===next[1]||next[1]===food,eliminated:eliminated.has(key(active)+'|'+key(next))};});
  const projection={winCount:main.win?win.size:null,queueLength:main.queue?queue.length-queueHead:null,queueHead:clone(queue.slice(queueHead,queueHead+6)),childRank:child?win.get(key(child))??null:null,
   parentRank:parent?win.get(key(parent))??null:null,parentDegree:parent?degree.get(pair(parent[0],parent[1]))??null:null};
  const scalar=Object.fromEntries(Object.entries(locals).filter(([name])=>!['mouse_moves','cat_moves','degree','win','queue','parents'].includes(name)));
  const view={grid:[...grid],rows,cols,cells:[...cells],mouse,cat,food,catJump,mouseJump,phase,event,frame,omitted,source:{line,text:CODE[line-1],scope:helper?'moves':'canMouseWin',timing:'after'},locals:clone(scalar),projection,
   active:[...active],child:clone(child),parent:clone(parent),rank:terminalCat?null:hasWin?win.get(key(active)):null,terminalCat,choices,legal:[...legal],owner:helper?owner:active[2],helper:helper?clone(helper):null,
   condition:extra.condition??null,change:extra.change??null,answer:event==='result'?win.has(key([mouse,cat,0])):null,
   analysis:event==='result'?{wins:[...win].map(([state,rank])=>[...state.split(',').map(Number),rank]),mouseMoves:clone(mouseMoves),catMoves:clone(catMoves)}:null};
  const title=labels[event]??bi(event,event);
  steps.push({title:bi(`Dòng ${line} · ${title.vi}`,`Line ${line} · ${title.en}`),note:bi('',''),arr:[],highlight:[],mark:[],codeLines:[line],debugLine:line,final:event==='result',
   vars:[...Object.entries(view.locals).filter(([name])=>!['grid','cells'].includes(name)).map(([name,value])=>({name,value:typeof value==='object'?JSON.stringify(value):value})),...(projection.winCount===null?[]:[{name:'len(win)',value:projection.winCount}]),...(projection.queueLength===null?[]:[{name:'len(queue)',value:projection.queueLength}])],catMouse1728View:view});
 }
 Object.assign(main,{rows,cols});emit(4,'size');main.cells=cells;emit(5,'cells');main.mouse=mouse;emit(6,'mouse');main.cat=cat;emit(7,'cat');main.food=food;emit(8,'food');emit(9,'define');
 function moves(p,jump){
  const h={p,jump,r:Math.floor(p/cols),c:p%cols};stack.push(h);emit(10,'origin');h.result=[p];emit(11,'stay');
  for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]){
   Object.assign(h,{dr,dc});emit(12,'direction',{condition:{expression:'for dr, dc',result:true}});let blocked=false;
   for(let k=1;k<=jump;k++){
    h.k=k;emit(13,'length',{condition:{expression:'for k',result:true}});h.nr=h.r+dr*k;h.nc=h.c+dc*k;emit(14,'target');
    const wall=h.nr<0||h.nr>=rows||h.nc<0||h.nc>=cols||grid[h.nr][h.nc]==='#';emit(15,'wall',{condition:{expression:'outside or wall',result:wall}});
    if(wall){emit(16,'break');blocked=true;break;}
    h.result.push(h.nr*cols+h.nc);emit(17,'move');
   }
   if(!blocked)emit(13,'length',{condition:{expression:'for k',result:false}});
  }
  emit(12,'direction',{condition:{expression:'for dr, dc',result:false}});emit(18,'return-moves');stack.pop();return h.result;
 }
 owner=0;for(const p of cells)mouseMoves[p]=moves(p,mouseJump);main.mouse_moves=mouseMoves;emit(19,'mouse-moves');
 owner=1;for(const p of cells)catMoves[p]=moves(p,catJump);main.cat_moves=catMoves;emit(20,'cat-moves');
 for(const m of cells)for(const c of cells)degree.set(pair(m,c),catMoves[c].length);main.degree=degree;emit(21,'degree');main.win=win;phase='seed';emit(22,'win');main.queue=queue;emit(23,'queue');
 for(const c of cells){
  main.c=c;emit(24,'seed',{condition:{expression:'for c',result:true}});emit(25,'check-food',{condition:{expression:'c == food',result:c===food}});
  if(c===food){emit(26,'skip');continue;}
  for(const turn of [0,1]){main.turn=turn;emit(27,'turn',{condition:{expression:'for turn',result:true}});win.set(key([food,c,turn]),0);emit(28,'terminal');queue.push([food,c,turn]);emit(29,'enqueue');}
  emit(27,'turn',{condition:{expression:'for turn',result:false}});
 }
 emit(24,'seed',{condition:{expression:'for c',result:false}});phase='solve';
 while(true){
  const nonempty=queueHead<queue.length;emit(30,'loop',{condition:{expression:'bool(queue)',result:nonempty}});if(!nonempty)break;
  [main.m,main.c,main.turn]=queue[queueHead++];emit(31,'pop');main.distance=win.get(key([main.m,main.c,main.turn]));emit(32,'distance');
  const limit=main.distance===1000;emit(33,'deadline',{condition:{expression:'distance == 1000',result:limit}});if(limit){emit(34,'skip');continue;}
  emit(35,'check-turn',{condition:{expression:'turn == 1',result:main.turn===1}});
  const parents=main.turn===1?mouseMoves[main.m].map(p=>[p,main.c,0]):catMoves[main.c].map(p=>[main.m,p,1]);main.parents=true;emit(main.turn===1?36:38,'parents');
  for(const [pm,pc,pt] of parents){
   Object.assign(main,{pm,pc,pt});emit(39,'parent',{condition:{expression:'for parent',result:true}});main.state=[pm,pc,pt];emit(40,'state');
   const skip=pm===pc||pc===food||win.has(key(main.state));emit(41,'guard',{condition:{expression:'cat terminal or state in win',result:skip}});if(skip){emit(42,'skip');continue;}
   emit(43,'mouse-turn',{condition:{expression:'pt == 0',result:pt===0}});
   if(pt===0){win.set(key(main.state),main.distance+1);emit(44,'mouse-win',{change:{kind:'win',state:[...main.state],rank:main.distance+1}});queue.push([...main.state]);emit(45,'enqueue');}
   else{
    const old=degree.get(pair(pm,pc));degree.set(pair(pm,pc),old-1);eliminated.add(key(main.state)+'|'+key([main.m,main.c,main.turn]));emit(47,'decrement',{change:{kind:'degree',from:old,to:old-1}});
    const all=degree.get(pair(pm,pc))===0;emit(48,'all-known',{condition:{expression:'degree[(pm, pc)] == 0',result:all}});
    if(all){win.set(key(main.state),main.distance+1);emit(49,'cat-forced',{change:{kind:'win',state:[...main.state],rank:main.distance+1}});queue.push([...main.state]);emit(50,'enqueue');}
   }
  }
  emit(39,'parent',{condition:{expression:'for parent',result:false}});
 }
 phase='done';emit(51,'result');return{original:[...grid],answer:win.has(key([mouse,cat,0])),steps};
}
module.exports={1728:{id:1728,difficulty:'hard',slug:'cat-and-mouse-ii',category:{key:'graph',vi:'Đồ thị',en:'Graph'},
 tags:[{key:'game-theory',vi:'Lý thuyết trò chơi',en:'Game Theory'},{key:'bfs',vi:'BFS ngược',en:'Retrograde BFS'},{key:'dp',vi:'Quy hoạch động',en:'Dynamic Programming'}],
 title:bi('Cat and Mouse II','Cat and Mouse II'),titleVi:bi('Mèo, chuột và thức ăn','Cat, mouse and food'),
 statement:bi('Chuột đi trước. Cả hai được đứng yên hoặc nhảy ngang/dọc tới giới hạn; tường chặn đường. Chuột có thể nhảy qua mèo. Mèo thắng nếu bắt chuột, tới F, hoặc giữ chuột khỏi F trong 1000 lượt. Cả hai chơi tối ưu: chuột có thể buộc thắng không?','Mouse moves first. Both may stay or jump horizontally/vertically; walls block jumps. Mouse may jump over Cat. Cat wins by catching Mouse, reaching F, or keeping Mouse from F for 1000 turns. Can Mouse force a win under optimal play?'),
 defaultInput:'####F|#C...|M....',inputKind:'string',inputLabel:bi('grid · các hàng ngăn bằng | hoặc JSON','grid · rows separated by | or JSON'),
 extraParams:[{key:'catJump',label:bi('🐱 catJump','🐱 catJump'),default:1,min:1,max:8},{key:'mouseJump',label:bi('🐭 mouseJump','🐭 mouseJump'),default:2,min:1,max:8}],
 code:CODE,debugMode:'line-by-line',codeLabel:bi('BFS ngược · thắng trong ≤1000 lượt','Retrograde BFS · win within 1000 turns'),
 approach:[bi('Giải từ các trạng thái chuột đã tới F rồi lan ngược một nước.','Start at mouse-at-food wins and propagate one move backward.'),bi('Lượt chuột: có một nước thắng. Lượt mèo: mọi nước đều phải cho chuột thắng.','Mouse turn: one winning move suffices. Cat turn: every choice must let Mouse win.')],
 complexity:{time:'O(K²·J)',space:'O(K² + K·J)',note:bi('K = số ô đi được; J = giới hạn nhảy. Chỉ lan trạng thái thắng trong tối đa 1000 lượt.','K = walkable cells; J = jump bound. Propagate only wins requiring at most 1000 turns.')},
 builder:buildCatMouse1728,liveArgs:(input,params)=>{const {grid,catJump,mouseJump}=parse1728(input,params);return[grid,catJump,mouseJump];}}};
