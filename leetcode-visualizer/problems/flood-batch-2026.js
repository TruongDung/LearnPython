'use strict';
const {runTrace}=require('./wasm-picture-trace'),sources=require('./picture-batch-sources.json');
const graph=require('./graph'),uf=require('./union-find'),tree=require('./tree'),bi=(vi,en)=>({vi,en});
const IDs=[529,1034,1992,2658,711,1559,407,4003,3310,261,305,310,675,947,990,1284,1466];
const kinds=['mines','border','farmland','fish','shapes','cycle','water','parity','methods','valid-tree','dynamic-islands','centers','forest','stones','equations','flips','roads'];
const titles={529:'Minesweeper',1034:'Coloring A Border',1992:'Find All Groups of Farmland',2658:'Maximum Number of Fish in a Grid',711:'Number of Distinct Islands II',1559:'Detect Cycles in 2D Grid'};
const slugs={529:'minesweeper',1034:'coloring-a-border',1992:'find-all-groups-of-farmland',2658:'maximum-number-of-fish-in-a-grid',711:'number-of-distinct-islands-ii',1559:'detect-cycles-in-2d-grid'};
const defaults={529:'EEEEE|EEMEE|EEEEE|EEEEE',1034:'1,1,1|1,1,1|1,1,1',1992:'1,0,0|0,1,1|0,1,1',2658:'0,2,1,0|4,0,0,3|1,0,0,4|0,3,2,0',711:'1,0,0,0,1,1|1,1,0,0,1,0|0,0,0,0,0,0|0,1,1,1,0,0',1559:'aaaa|abba|abba|aaaa'};
const param=(key,label,value)=>({key,label:bi(label,label),default:value});
const watches={529:['r','c','mines','nr','nc','q'],1034:['r','c','old','color','is_border','border'],1992:['x','y','top','left','bottom','right'],2658:['x','y','fish','best','r','c'],711:['r','c','mode','points','normalized','signatures'],1559:['x','y','pr','pc','nr','nc'],407:['r','c','height','trapped','water','heap'],4003:['r','c','par','cost','pen','nc_cost'],3310:['node','nxt','k','suspicious','a','b'],261:['n','u','v','root_u','root_v','parent'],305:['row','col','node','islands','parent','answer'],310:['remaining','leaf','neighbor','leaves','next_leaves','graph'],675:['sr','sc','tr','tc','d','ans'],947:['row','col','parent'],990:['equation','root_a','root_b','parent','size'],1284:['mask','d','index','flip','nxt','q'],1466:['city','parent','nxt','cost','answer','stack']};
const text={529:'Bấm ô → đếm mìn trong 8 hướng → chỉ lan từ ô trống.',1034:'Duyệt vùng cùng màu → đánh dấu biên → tô sau khi duyệt xong.',1992:'Duyệt từng nhóm ruộng → mở khung nhỏ nhất bao quanh nhóm.',2658:'Cộng cá trong từng vùng nước → giữ tổng lớn nhất.',711:'Thử 8 phép xoay/lật → đưa về gốc → so hình chuẩn.',1559:'Duyệt 4 hướng cùng ký tự; bỏ cạnh về cha, phát hiện cạnh khép chu trình.',407:'Mở từ tường thấp nhất → nước = max(0, tường − đất).',4003:'Mỗi ô có hai parity; so chi phí di chuyển và đứng chờ.',3310:'Lan từ method lỗi → kiểm tra cạnh gọi từ bên ngoài trước khi xóa.',261:'Cần n−1 cạnh và không có cạnh nối hai đỉnh đã cùng nhóm.',305:'Thêm đất từng ô → gộp những đảo kề cạnh → ghi số đảo.',310:'Bóc từng lớp lá → còn lại một hoặc hai tâm.',675:'Chọn cây thấp nhất tiếp theo → BFS tìm đường → cộng số bước.',947:'Nối hàng với cột của từng viên đá → giữ một đá trong mỗi nhóm.',990:'Gộp tất cả dấu bằng trước → kiểm tra từng dấu khác.',1284:'Mỗi trạng thái là một bitmask; BFS qua các phép lật hình dấu cộng.',1466:'Duyệt từ thành phố 0 → đếm cạnh đang hướng ra xa gốc.'};
const clone=v=>JSON.parse(JSON.stringify(v));
function matrix(input,id){
 let grid;
 try{if(Array.isArray(input))grid=clone(input);else if(typeof input==='string'){const s=input.trim();grid=s.startsWith('[')?JSON.parse(s):s.split(/[|;]/).map(row=>row.trim()).map(row=>row.includes(',')?row.split(',').map(x=>x.trim()):[529,1559,1992,711,1284].includes(id)?[...row]:[row]);}else throw Error();}catch{throw new TypeError(`#${id}: rectangular grid required.`);}
 if(!Array.isArray(grid)||!grid.length||!Array.isArray(grid[0])||!grid[0].length||grid.some(row=>!Array.isArray(row)||row.length!==grid[0].length))throw new TypeError(`#${id}: rectangular grid required.`);
 if(grid.length>(id===407?8:id===1284?3:12)||grid[0].length>(id===407?8:id===1284?3:12))throw new RangeError(id===407?'407: supports at most an 8×8 grid.':`#${id}: use at most ${id===1284?'3×3':'12×12'} cells for the interactive picture.`);
 if(id===529||id===1559){grid=grid.map(row=>row.map(String));if(grid.some(row=>row.some(v=>id===529?!/^[MEBX1-8]$/.test(v):!/^\p{L}$/u.test(v))))throw new TypeError(`#${id}: invalid grid character.`);return grid;}
 const binary=[1992,711,1284].includes(id),max=id===407?20000:1000000;
 grid=grid.map(row=>row.map(v=>{if(typeof v==='boolean'||v===null||String(v).trim()==='')throw new TypeError('Invalid grid value');const n=Number(v);if(!Number.isSafeInteger(n)||n<0||n>(binary?1:max))throw new RangeError(id===407?'407: heights must be between 0 and 20000.':`#${id}: invalid cell value.`);return n;}));return grid;
}
function pairs(input,hyphen=false){let list;try{list=Array.isArray(input)?clone(input):String(input).trim().startsWith('[')?JSON.parse(input):!String(input).trim()?[]:hyphen&&String(input).includes('-')?String(input).split(/[;,\s]+/).filter(Boolean).map(s=>s.split('-').map(Number)):String(input).split(';').filter(s=>s.trim()).map(s=>s.split(',').map(Number));}catch{throw new TypeError('Enter pairs as a,b;c,d or JSON.');}if(!Array.isArray(list)||list.some(p=>!Array.isArray(p)||p.length!==2||p.some(x=>!Number.isSafeInteger(x)||x<0)))throw new TypeError('Invalid coordinate or edge pair.');return list;}
function integer(value,min,max,label){const n=Number(value);if(!Number.isSafeInteger(n)||n<min||n>max)throw new RangeError(`${label}: expected ${min}…${max}.`);return n;}
function graphArgs(input,params,id){
 if(id===947){const stones=pairs(input);if(stones.length>25||new Set(stones.map(p=>p.join(','))).size!==stones.length||stones.some(p=>p.some(x=>x>10000)))throw new RangeError('947: use up to 25 distinct stones with coordinates 0…10000.');return [stones];}
 if(id===990){let equations;try{equations=Array.isArray(input)?input:String(input).trim().startsWith('[')?JSON.parse(input):String(input).split(/[;,]/).map(s=>s.trim()).filter(Boolean);}catch{throw new TypeError('990: enter equations a==b,a!=c.');}if(equations.length>40||equations.some(s=>typeof s!=='string'||!/^[a-z](==|!=)[a-z]$/.test(s)))throw new TypeError('990: use at most 40 equations such as a==b,a!=c.');return [equations];}
 if(id===305){let m,n,positions;if(typeof input==='string'&&!input.trim().startsWith('[')){const segments=input.split(';');[m,n]=segments.shift().split(',').map(Number);positions=pairs(segments.join(';'));}else if(input&&typeof input==='object'&&!Array.isArray(input)){({m,n,positions}=input);positions=pairs(positions);}else throw new TypeError('305: enter m,n;r,c;r,c…');m=integer(m,1,8,'m');n=integer(n,1,8,'n');if(positions.length>64||positions.some(([r,c])=>r>=m||c>=n))throw new RangeError('305: invalid added land coordinate.');return [m,n,positions];}
 let n,edges;
 if(id===1466){n=integer(Array.isArray(input)?input[0]:input,1,20,'n');edges=pairs(params.connections??'[[0,1],[1,3],[2,3],[4,0],[4,5]]');}
 else{n=integer(params.n??(id===3310?4:id===310?6:5),1,id===310?15:20,'n');edges=pairs(input,[310,3310].includes(id));}
 if(edges.length>64||edges.some(p=>p.some(x=>x>=n)))throw new RangeError(`#${id}: edge endpoints must be in 0…n−1.`);
 if([310,1466].includes(id)){if(edges.length!==n-1)throw new RangeError(`#${id}: a tree needs n−1 edges.`);const parent=Array.from({length:n},(_,i)=>i),find=x=>parent[x]===x?x:find(parent[x]);for(const[a,b]of edges){const ra=find(a),rb=find(b);if(ra===rb)throw new RangeError(`#${id}: edges must form a tree.`);parent[ra]=rb;}}
 return id===3310?[n,integer(params.k??1,0,n-1,'k'),edges]:[n,edges];
}
function argsFor(id,input,params={}){
 if([3310,261,305,310,947,990,1466].includes(id))return graphArgs(input,params,id);
 const grid=matrix(input,id),rows=grid.length,cols=grid[0].length;
 if(id===529)return [grid,[integer(params.sr??3,0,rows-1,'click row'),integer(params.sc??0,0,cols-1,'click col')]];
 if(id===1034)return [grid,integer(params.row??1,0,rows-1,'row'),integer(params.col??1,0,cols-1,'col'),integer(params.color??3,0,1000000,'color')];
 return id===4003?[rows,cols,grid]:[grid];
}
function classify(source,record){
 if(record.returning)return 'return';
 if(/^if |^elif |^while /.test(source))return 'check';if(/^for /.test(source))return 'loop';
 if(/answer\.append|answer\[.*\] =/.test(source))return 'answer';if(/best = max/.test(source))return 'best';
 if(/signatures\.add/.test(source))return 'signature';if(/normalized =/.test(source))return 'normalize';if(/shape\.append|forms\.append/.test(source))return 'transform';
 if(/\b(?:board|grid|forest)\[.+\] =/.test(source))return 'paint';if(/^dist\[/.test(source))return 'relax';
 if(/^parent\[/.test(source))return record.scope==='find'?'compress':'union';if(/seen\.add|(?:seen|visited|queued)\[.+\] = True/.test(source))return 'visit';
 if(/heappop|popleft|\.pop\(/.test(source))return 'pop';if(/border\.append/.test(source))return 'border';if(/heappush|\.append\(|\.extend\(/.test(source))return 'push';
 if(/\+=|-=/.test(source))return 'count';if(/nxt =|nc_cost =|wait_cost =/.test(source))return 'candidate';return 'step';
}
const key=p=>p.join(','),equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function buildViews(id,args,trace){
 const gridIndex=id===4003?2:[529,1034,1992,2658,711,1559,407,675,1284].includes(id)?0:null,originalGrid=gridIndex===null?null:args[gridIndex];
 let owners=originalGrid?.map(row=>row.map(()=>0)),group=0,formsGroup=0,canonicalGroup=0,waterAt=originalGrid?.map(row=>row.map(()=>0)),surfaceAt=clone(originalGrid),settled=originalGrid?.map(row=>row.map(()=>false));
 const previous={},parents=new Map(),stateParents=new Map(),removed=new Set(),reversed=new Set();let route=[],cycle=[],waterDecision=null,flipPreview=null,layer=0,boundsGroup=0,bestGroup=0,oldBest=0;
 const list=trace.events.map((record,index)=>{
  const source=sources[id][record.line-1].trim(),event=classify(source,record),x={...record.outer,...record.locals};
  const coordinate=x.x!==undefined&&x.y!==undefined&&[1992,2658,711,1559].includes(id)?[x.x,x.y]:x.r!==undefined&&x.c!==undefined?[x.r,x.c]:id===305&&x.row!==undefined?[x.row,x.col]:null;
  const neighbor=x.nr!==undefined&&x.nc!==undefined?[x.nr,x.nc]:null;
  if(originalGrid&&/^(q = deque|stack = \[\(r, c)/.test(source)&&[529,1034,1992,2658,711,1559,675].includes(id)){group++;if(id===675){parents.clear();route=[];parents.set(key([x.sr,x.sc]),null);}}
  if(id===711&&source==='forms = []')formsGroup=group;
  if(id===711&&source.startsWith('canonical ='))canonicalGroup=group;
  if(id===1992&&source.startsWith('top, left, bottom, right ='))boundsGroup=group;
  if(id===2658&&source.startsWith('best = max')){if(x.best>oldBest)bestGroup=group;oldBest=x.best;}
  const mark=x.seen??x.queued??x.visited;
  if(owners&&Array.isArray(mark)&&Array.isArray(mark[0])&&typeof mark[0][0]==='boolean')mark.forEach((row,r)=>row.forEach((value,c)=>{if(value&&!owners[r][c])owners[r][c]=group||1;}));
  const live=x.grid??x.board??x.land??x.heightMap??x.forest??x.penalty??x.mat;
  if(id===711&&live&&previous.grid)live.forEach((row,r)=>row.forEach((value,c)=>{if(value===0&&previous.grid[r][c]===1)owners[r][c]=group;}));
  if(originalGrid&&live)previous.grid=live;
  if(/\.append\(\(nr, nc/.test(source)&&coordinate&&neighbor)parents.set(key(neighbor),coordinate);
  if(id===1559&&source.startsWith('stack.append')&&neighbor)parents.set(key(neighbor),coordinate);
  function path(cell){const out=[],seen=new Set();for(let p=cell;p&&!seen.has(key(p));p=parents.get(key(p))){seen.add(key(p));out.unshift(p);}return out;}
  if(id===1559&&record.returning&&record.returned===true&&coordinate&&neighbor){const a=path(coordinate),b=path(neighbor);let common=0;while(common<a.length&&common<b.length&&equal(a[common],b[common]))common++;cycle=[...a.slice(Math.max(0,common-1)),...b.slice(common).reverse(),a[Math.max(0,common-1)]];}
  if(id===675&&record.scope==='bfs'&&record.returning&&record.returned>=0)route=path([x.tr,x.tc]);
  if(id===407){if(source.startsWith('nr, nc ='))waterDecision=null;if(source.startsWith('trapped ='))waterDecision={r:x.nr,c:x.nc,wall:x.height,ground:x.heightMap[x.nr][x.nc],trapped:x.trapped,counted:false,newHeight:null};if(source.startsWith('water +=')){waterAt[x.nr][x.nc]+=x.trapped;waterDecision={...waterDecision,counted:true};}if(source.startsWith('new_height =')){surfaceAt[x.nr][x.nc]=x.new_height;if(waterDecision)waterDecision.newHeight=x.new_height;}if(source.includes('heappop'))settled[x.r][x.c]=true;}
  if(id===4003&&source.startsWith('dist[')&&source.includes('nc_cost'))stateParents.set(key([x.nr,x.nc,1-x.par]),[x.r,x.c,x.par]);
  if(id===4003&&source.startsWith('dist[')&&source.includes('wait_cost'))stateParents.set(key([x.r,x.c,1-x.par]),[x.r,x.c,x.par]);
  if(id===4003&&record.returning){const out=[],seenKeys=new Set();for(let at=[x.r,x.c,x.par];at&&!seenKeys.has(key(at));at=stateParents.get(key(at))){seenKeys.add(key(at));out.unshift(at);}route=out;}
  if(id===1284){if(source.includes('popleft'))flipPreview=null;if(source.startsWith('for index, flip'))flipPreview=null;if(source.startsWith('nxt ='))flipPreview={from:x.mask,to:x.nxt,index:x.index,flip:x.flip};if(source.startsWith('q.append')&&x.nxt!==undefined&&!stateParents.has(String(x.nxt)))stateParents.set(String(x.nxt),{from:x.mask,index:x.index});if(record.returning&&record.returned>=0){const moves=[];let at=x.mask;while(stateParents.has(String(at))){const p=stateParents.get(String(at));moves.unshift(p.index);at=p.from;}route=moves;}}
  if(id===310){if(source.startsWith('remaining -='))layer++;if(source.includes('.remove(leaf)'))removed.add(x.leaf);}
  if(id===1466&&source==='answer += cost'&&x.cost===1)reversed.add(`${x.city},${x.nxt}`);
  const state={owners:owners?clone(owners):null,group,formsGroup,canonicalGroup,boundsGroup,bestGroup,route:clone(route),cycle:clone(cycle),waterAt:waterAt?clone(waterAt):null,surfaceAt:surfaceAt?clone(surfaceAt):null,settled:settled?clone(settled):null,waterDecision:waterDecision?{...waterDecision}:null,flipPreview:flipPreview?{...flipPreview}:null,removed:[...removed],reversed:[...reversed],layer};
  const final=index===trace.events.length-1,watch=record.frames.length>1?Object.keys(record.locals).filter(k=>!['parent','graph','grid','forest','dist','heightMap','mat','penalty'].includes(k)).slice(0,6):watches[id];
  const step={arr:[],codeLines:[record.line],codeBlock:1,final,title:bi(final?'Kết quả':`L${record.line} · ${event}`,final?'Result':`L${record.line} · ${event}`),note:bi('',''),vars:watch.map(name=>({name,value:Object.hasOwn(record.locals,name)?record.locals[name]:'—'})),
   floodBatchView:{id,kind:kinds[IDs.indexOf(id)],event,source:{line:record.line,text:source,timing:'after'},scope:record.scope,locals:record.locals,outer:record.outer,frames:record.frames,branch:record.branch,returning:record.returning,returned:record.returned,input:args,originalGrid,active:coordinate,neighbor,state,answer:final?trace.answer:null,done:final}};
  if(id===407){const heap=(x.heap??[]).map(([height,r,c])=>({height,wall:height,r,c})),d=waterDecision,compatEvent=final?'done':source.includes('heappop')?'pop-lowest-wall':source.startsWith('water +=')?(x.trapped>0?'trap-neighbor':'raise-boundary'):'init';step.trapRain2View={rows:originalGrid.length,cols:originalGrid[0].length,heightMap:originalGrid,visited:x.visited??originalGrid.map(row=>row.map(()=>false)),settled:state.settled,processed:state.settled,settledCount:state.settled.flat().filter(Boolean).length,visitedCount:(x.visited??[]).flat().filter(Boolean).length,processedCount:state.settled.flat().filter(Boolean).length,heapSize:heap.length,heap,frontier:heap,waterAt:state.waterAt,surfaceAt:state.surfaceAt,total:x.water??0,event:compatEvent,phase:final?'done':compatEvent==='pop-lowest-wall'?'pop':'init',popped:coordinate?{r:coordinate[0],c:coordinate[1]}:null,neighbor:neighbor?{r:neighbor[0],c:neighbor[1]}:null,wall:d?.wall??null,cellHeight:d?.ground??null,trapped:d?.trapped??0,newWall:d?.newHeight??null};}
  return step;
 });
 return {original:args.length===1?args[0]:id===4003?args[2]:args,answer:trace.answer,steps:list};
}
const exported={};
for(const id of IDs){
 const base=id===310?require('./minimum-height-trees-310')[310]:graph[id]??uf[id]??tree[id];
 const method=sources[id].find(s=>/^    def /.test(s)).match(/def (\w+)/)[1];
 const fresh={id,title:bi(titles[id],titles[id]),titleVi:bi(titles[id],titles[id]),slug:slugs[id],difficulty:[711].includes(id)?'hard':'medium',category:{key:'graph',vi:'Đồ thị',en:'Graph'},tags:[{key:'flood-fill',vi:'Flood Fill',en:'Flood Fill'}],inputKind:'string',inputLabel:bi('Ma trận · hàng cách | hoặc ;','Grid · rows separated by | or ;'),defaultInput:defaults[id],extraParams:[],statement:bi(text[id],text[id]),complexity:{time:id===711?'O(R·C·log(R·C))':'O(R·C)',space:'O(R·C)',note:bi('','')}};
 const entry={...(base??fresh),code:sources[id],debugMode:'line-by-line',pictureBatch:true,approach:[bi(text[id],text[id])],liveArgs:(input,params)=>argsFor(id,input,params),builder(input,params={}){const args=argsFor(id,input,params);return buildViews(id,args,runTrace({code:sources[id].join('\n'),method,args}));}};
 if(id===529){entry.difficulty='medium';entry.extraParams=[param('sr','click row',3),param('sc','click col',0)];}
 if(id===1034)entry.extraParams=[param('row','row',1),param('col','col',1),param('color','color',3)];
 exported[id]=entry;
}
module.exports=exported;
