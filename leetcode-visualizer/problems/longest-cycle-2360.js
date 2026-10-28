const base=require('./graph')[2360];
const bi=(vi,en)=>({vi,en});
const CODE=[...base.code];
const copy=value=>Array.isArray(value)?value.map(copy):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,copy(v)])):value;
function parse2360(input){
 let edges;
 try{
  if(Array.isArray(input))edges=[...input];
  else{
   const text=String(input??'').trim();
   if(!text)throw new Error('empty');
   edges=text.startsWith('[')?JSON.parse(text):text.split(',').map(value=>/^-?\d+$/.test(value.trim())?Number(value.trim()):NaN);
  }
 }catch(_error){throw new RangeError('2360: nhập mảng edges dạng [3,3,4,2,3] / enter an edges array.');}
 if(!Array.isArray(edges)||!edges.length||edges.length>12||edges.some(next=>!Number.isInteger(next)||next < -1||next>=edges.length))
  throw new RangeError('2360: 1–12 nút; mỗi cạnh trỏ tới một nút hợp lệ hoặc -1 / 1–12 nodes, each target is a valid node or -1.');
 return edges;
}
function buildLongestCycle2360(input){
 const edges=parse2360(input),visited=Array(edges.length).fill(false),steps=[],locals={edges};
 let longest=-1,position=new Map(),bestCycle=[],cycle=[],repeatAt=null,frame=0;
 const titles={init:bi('Khởi tạo visited','Initialize visited'),answer:bi('Chưa có chu trình','No cycle yet'),
  start:bi('Chọn nút bắt đầu','Choose a starting node'),'check-start':bi('Nút đã thăm?','Already visited?'),skip:bi('Bỏ qua nút đã thăm','Skip visited node'),
  reset:bi('Làm trống position','Clear position'),node:bi('Bắt đầu đường mới','Start a new walk'),
  inspect:bi('Còn nút chưa thăm để đi tiếp?','Can the walk continue?'),visit:bi('Đánh dấu visited ✓','Mark visited ✓'),record:bi('Ghi vị trí trên đường đi','Record the path position'),
  follow:bi('Đi theo mũi tên →','Follow the arrow →'),'check-cycle':bi('Nút có trong position hiện tại?','Node in the current position map?'),
  cycle:bi('Đo chu trình và cập nhật longest','Measure cycle and update longest'),stop:bi('Không có chu trình mới','No new cycle'),done:bi('Độ dài chu trình lớn nhất','Longest cycle length')};
 function emit(line,event,options={}){
  frame++;
  const path=[...position].map(([node,depth])=>({node,depth}));
  const view={edges:[...edges],visited:[...visited],path,event,start:locals.start??null,current:locals.node??null,next:options.move?.to??null,
   cycle:[...cycle],cycleLength:cycle.length||null,repeatAt,longest,bestCycle:[...bestCycle],final:event==='done',frame,
   source:{line,text:CODE[line-1],scope:'longestCycle',timing:'after'},locals:copy(locals),
   condition:options.condition??null,reason:options.reason??null,move:options.move??null,change:options.change??null};
  const title=titles[event];
  steps.push({title:bi(`Dòng ${line} · ${title.vi}`,`Line ${line} · ${title.en}`),note:bi('',''),arr:[],highlight:[],mark:[],final:event==='done',
   codeLines:[line],debugLine:line,vars:Object.entries(locals).map(([name,value])=>({name,value:typeof value==='object'?JSON.stringify(value):value})),cycle2360View:view});
 }
 locals.visited=visited;emit(3,'init');locals.longest=longest;emit(4,'answer');
 for(let start=0;start<edges.length;start++){
  locals.start=start;emit(5,'start',{condition:{expression:'for start',result:true}});
  emit(6,'check-start',{condition:{expression:'visited[start]',result:visited[start]}});
  if(visited[start]){emit(7,'skip',{reason:'skip'});continue;}
  position=new Map();locals.position={};cycle=[];repeatAt=null;emit(8,'reset');
  locals.node=start;emit(9,'node');
  while(true){
   const node=locals.node,proceed=node!==-1&&!visited[node];
   const reason=proceed?null:node===-1?'dead-end':position.has(node)?'repeat':'old-walk';
   emit(10,'inspect',{condition:{expression:'node != -1 and not visited[node]',result:proceed},reason});
   if(!proceed)break;
   visited[node]=true;emit(11,'visit',{change:{kind:'visited',node}});
   position.set(node,position.size);locals.position=Object.fromEntries(position);emit(12,'record',{change:{kind:'position',node,index:position.get(node)}});
   locals.node=edges[node];emit(13,'follow',{move:{from:node,to:locals.node}});
  }
  const node=locals.node,found=node!==-1&&position.has(node);
  if(found){repeatAt=position.get(node);cycle=[...position.keys()].slice(repeatAt);}
  emit(14,found?'check-cycle':'stop',{condition:{expression:'node != -1 and node in position',result:found},reason:found?'repeat':node===-1?'dead-end':'old-walk'});
  if(found){
   const previous=longest;longest=Math.max(longest,cycle.length);locals.longest=longest;
   if(longest>previous)bestCycle=[...cycle];
   emit(15,'cycle',{change:{kind:'longest',from:previous,to:longest,length:cycle.length,walkSize:position.size,repeatAt}});
  }
 }
 emit(5,'start',{condition:{expression:'for start',result:false}});emit(16,'done');
 return{original:[...edges],answer:longest,steps};
}
module.exports={2360:{...base,code:CODE,debugMode:'line-by-line',builder:buildLongestCycle2360,
 approach:[bi('Đi theo mũi tên; lưu vị trí mỗi nút trong position.','Follow arrows; record each node’s position in the current walk.'),bi('Quay lại nút trong position → chu trình. Chạm nút chỉ có visited → dừng.','Return to a node in position → cycle. Reach an earlier visited node outside position → stop.')],
 liveArgs:input=>[parse2360(input)]}};
