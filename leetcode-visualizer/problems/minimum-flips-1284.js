'use strict';
const {runTrace}=require('./wasm-picture-trace'),methods=require('./minimum-flips-1284-methods');
const bi=(vi,en)=>({vi,en});
const traceOptions={summarizeLocals:{q:6,seen:0,front:6,back:6,next_front:0,seen_front:0,seen_back:0}};
const watches=[['start','mask','index','flip','nxt','path','len(q)','len(seen)'],['board','index','nxt','path','len(q)','len(seen)'],['forward','mask','index','nxt','path','len(front)','len(back)'],['press','index','mask','path','best','solution'],['index','mask','path','best','solution'],['first','r','c','above','mask','path','best'],['rank','col','pivot','free_cols','choice','press','parity','best']];
function parse(input){
 let mat=input;
 if(typeof input==='string'){
  const text=input.trim();
  if(text.startsWith('[')){try{mat=JSON.parse(text);}catch(_){mat=null;}}
  else mat=text?text.split(/[;|\n]/).map(row=>row.includes(',')?row.split(',').map(s=>s.trim()?Number(s):NaN):[...row.replace(/\s/g,'')].map(Number)):[];
 }
 if(!Array.isArray(mat)||mat.length<1||mat.length>3||!Array.isArray(mat[0])||mat[0].length<1||mat[0].length>3||mat.some(row=>!Array.isArray(row)||row.length!==mat[0].length||row.some(v=>v!==0&&v!==1)))throw new RangeError('1284: enter a rectangular binary matrix, 1–3 rows × 1–3 columns, e.g. 00;01 or [[0,0],[0,1]].');
 return mat.map(row=>[...row]);
}
function pack(mat){return mat.flat().reduce((mask,bit,index)=>mask|(bit<<index),0);}
function stencils(rows,cols){return Array.from({length:rows*cols},(_,index)=>{const r=Math.floor(index/cols),c=index%cols;let flip=0;for(const[dr,dc]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(r+dr>=0&&r+dr<rows&&c+dc>=0&&c+dc<cols)flip|=1<<((r+dr)*cols+c+dc);return flip;});}
function build(input,params={},method=1){
 const mat=parse(input),rows=mat.length,cols=mat[0].length,total=rows*cols,start=pack(mat),allFlips=stencils(rows,cols),definition=methods[method-1];
 const trace=runTrace({code:definition.code.join('\n'),method:'minFlips',args:[mat],...traceOptions});
 let transition=null,solution=null,above=null;
 const steps=trace.events.map((record,at)=>{
  const root=record.outer,local=record.locals,x={...root,...local},source=definition.code[record.line-1].trim(),final=at===trace.events.length-1;
  let event='line';
  if(source.includes('popleft()')){transition=null;event='pop';}
  if(source.startsWith('for index')||source.startsWith('for press')||source.startsWith('for first')||source==='mask = start'||source==='for mask, path in front.items():'){transition=null;event='choose';}
  if(source.startsWith('for first'))above=null;
  if(source.startsWith('above =')){above=root.above;event='force';}
  if(source.startsWith('nxt =')){
   const from=method===2?pack(root.board):root.mask,to=method===2?pack(root.nxt):root.nxt;
   transition={from,to,index:root.index,flip:allFlips[root.index]};event='flip';
  }
  if(source==='mask ^= flip'||source==='mask ^= flips[index]'){
   transition={from:x.mask^allFlips[x.index],to:x.mask,index:x.index,flip:allFlips[x.index]};event='flip';
  }
  if(method===5){
   transition=null;
   const frames=record.frames.filter(frame=>frame.name==='dfs'),parent=frames.at(-2)?.locals;
   if(local.mask!==undefined&&parent){
    const skip=local.path.length===parent.path.length,index=parent.index;
    transition={from:parent.mask,to:local.mask,index,flip:skip?0:allFlips[index],skip};
    if(source==='if mask == 0:')event=skip?'skip':'flip';
   }
  }
  if(source.startsWith('q.append')||source.startsWith('next_front[')){event='enqueue';}
  if(source==='solution = path[:]'||source.startsWith('solution = path +')||source.startsWith('solution = seen_back')){solution=[...root.solution];event='best';}
  if(record.returning&&record.scope==='minFlips'){
   event='return';
   if(record.returned>=0){if(method<=2)solution=[...(root.path??[])];else if(method===3)solution=[...(root.solution??[])];else solution=[...root.solution];}
   else solution=null;
  }
  if(source==='equations[rank], equations[pivot] = equations[pivot], equations[rank]')event='swap';
  if(source==='equations[r] ^= equations[rank]')event='eliminate';
  const prep=method!==2&&(root.flips?.length??0)<total;
  let current=method===2?root.board?pack(root.board):start:prep?start:x.mask??start;
  if(method===7&&root.press!==undefined){current=start;for(let i=0;i<total;i++)if(root.press&(1<<i))current^=allFlips[i];}
  const queue=(root['list(q)[:6]']??[]).map(([state,path])=>({mask:method===2?pack(state):state,path:[...path]}));
  const frontier=name=>(root[`list(${name}.items())[:6]`]??[]).map(([mask,path])=>({mask,path:[...path]}));
  const front=frontier('front'),back=frontier('back');
  const origin=(entries,fallback)=>entries.length?entries[0].path.reduce((mask,index)=>mask^allFlips[index],start)===entries[0].mask?'mat':'0':fallback;
  const active=prep&&Number.isInteger(root.r)&&Number.isInteger(root.c)?root.r*cols+root.c:transition?.index??(Number.isInteger(x.index)&&x.index<total?x.index:null);
  const view={method,line:record.line,source,scope:record.scope,event,branch:record.branch,rows,cols,total,mat:mat.map(row=>[...row]),start,current,
   phase:prep?'encode':method===7?root.free_cols?'free':'eliminate':'search',active,above:method===6?above:null,transition:transition?{...transition}:null,
   encoded:typeof root.start==='number'?root.start:null,buildingFlip:prep?root.flip??null:null,flips:root.flips?[...root.flips]:[],allFlips:[...allFlips],
   path:x.path?[...x.path]:[],solution:solution?[...solution]:null,best:root.best??null,answer:final?trace.answer:null,
   queue,queueSize:root['len(q)']??null,seenSize:root['len(seen)']??null,front,back,frontOrigin:origin(front,root.forward?'mat':'0'),backOrigin:origin(back,root.forward?'0':'mat'),frontSize:root['len(front)']??null,backSize:root['len(back)']??null,seenFrontSize:root['len(seen_front)']??null,seenBackSize:root['len(seen_back)']??null,forward:root.forward??true,
   press:root.press??null,first:root.first??null,index:x.index??null,
   stack:record.frames.filter(f=>f.name==='dfs').map(f=>({index:f.locals.index,mask:f.locals.mask,path:f.locals.path})),
   equations:root.equations?[...root.equations]:null,rank:root.rank??null,col:root.col??null,pivot:root.pivot??null,pivotCols:root.pivot_cols?[...root.pivot_cols]:[],freeCols:root.free_cols?[...root.free_cols]:null,choice:root.choice??null,
   final};
  const names=prep?['r','c','nr','nc','start','flip']:watches[method-1];
  return{arr:[],codeLines:[record.line],codeBlock:method,final,title:bi(`Dòng ${record.line} · ${record.scope}`,`Line ${record.line} · ${record.scope}`),note:bi('',''),vars:names.map(name=>({name,value:x[name]??'—'})),flips1284View:view};
 });return{original:mat,answer:trace.answer,steps};
}
const problem={id:1284,difficulty:'hard',slug:'minimum-number-of-flips-to-convert-binary-matrix-to-zero-matrix',category:{key:'graph',vi:'Đồ thị',en:'Graph'},tags:[{key:'bfs',vi:'BFS',en:'BFS'},{key:'bitmask',vi:'Bitmask',en:'Bitmask'},{key:'backtracking',vi:'Quay lui',en:'Backtracking'}],title:bi('Ít lần lật nhất để ma trận toàn 0','Minimum Flips to Zero Matrix'),titleVi:bi('Bấm một ô → lật dấu cộng','Press one cell → toggle a cross'),statement:bi('Bấm một ô để lật chính nó và các ô kề cạnh. Đưa ma trận về toàn 0 với ít lần bấm nhất; không thể thì trả -1.','Press a cell to toggle it and its edge neighbors. Reach an all-zero matrix with the fewest presses, or return -1 if impossible.'),defaultInput:'00;01',inputKind:'string',inputLabel:bi('mat · 1×1 đến 3×3 · 00;01 hoặc JSON','mat · 1×1 to 3×3 · 00;01 or JSON'),debugMode:'line-by-line',traceOptions,
 extraParams:[{key:'approach',type:'select',label:bi('Cách giải','Approach'),default:1,options:methods.map((m,i)=>({value:i+1,label:bi(`${i+1}. ${m.label.vi}`,`${i+1}. ${m.label.en}`)}))}],
 approach:[bi('Lật hai lần cùng ô sẽ triệt tiêu: chỉ cần chọn bấm hoặc không.','Pressing the same cell twice cancels out: each cell is either pressed or skipped.'),bi('BFS tìm số bước ít nhất. Gauss tìm các nghiệm XOR rồi chọn nghiệm ít ô bấm nhất.','BFS finds a shortest path. Gaussian elimination finds XOR solutions, then minimizes the number of pressed cells.')],liveArgs:input=>[parse(input)]};
methods.forEach((method,i)=>{const suffix=i?i+1:'';problem[`code${suffix}`]=method.code;problem[`code${suffix}Label`]=method.label;problem[`builder${suffix}`]=(input,params)=>build(input,params,i+1);problem[`complexity${suffix}`]={time:method.time,space:method.space,note:bi('N=R×C≤9 · C=số cột · F=số biến tự do. Các bản BFS lưu đường đi trong hàng đợi; matrix BFS tạo N ô cho mỗi cạnh.','N=R×C≤9 · C=columns · F=free variables. BFS versions store paths in their queues; matrix BFS copies N cells per edge.')};});
module.exports={1284:problem};
