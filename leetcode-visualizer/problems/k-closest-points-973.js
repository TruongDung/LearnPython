'use strict';
const {runTrace}=require('./wasm-picture-trace'),methods=require('./k-closest-points-973-methods');
const bi=(vi,en)=>({vi,en});
const watches=[['index','x','y','d2','heap','removed','k','answer'],['index','d2','entries','entry','k','answer'],['index','d2','heap','take','entry','k','answer'],['point','x','y','k','answer'],['lo','hi','scan','store','pivot','target','entries','answer'],['lo','hi','less','scan','greater','pivot','entries','answer'],['low','high','mid','count','threshold','entry','k','answer']];
function parseInput(input,params={}){
 let points=input;
 if(typeof input==='string'){
  if(input.trim().startsWith('[')){try{points=JSON.parse(input);}catch(_){points=null;}}
  else points=input.trim()?input.split(/[;|\n]/).map(row=>row.split(',').map(value=>value.trim()?Number(value):NaN)):[];
 }
 const k=Number(params?.k??Math.min(2,Array.isArray(points)?points.length:2));
 if(!Array.isArray(points)||points.length<1||points.length>18||points.some(p=>!Array.isArray(p)||p.length!==2||p.some(x=>typeof x!=='number'||!Number.isInteger(x)||Math.abs(x)>10000))||!Number.isInteger(k)||k<1||k>points.length)throw new RangeError('973: enter 1–18 [x,y] integer points in [-10000,10000] and 1 ≤ k ≤ points.length.');
 return{points:points.map(p=>[...p]),k};
}
function buildSteps(input,params={},method=1){
 const {points,k}=parseInput(input,params),definition=methods[method-1],distances=points.map(([x,y])=>x*x+y*y);
 const traced=runTrace({code:definition.code.join('\n'),method:'kClosest',args:[points,k]});
 const seen=new Set(),evicted=new Set();let active=null,selected=[],previous=null,tested=[],inside=[],heapReady=method===1;
 const normalize=(entry,maxHeap=false)=>({id:maxHeap?(-entry[1]||0):entry[1],d2:Math.abs(entry[0]),key:entry[0],x:entry[2],y:entry[3]});
 const matchPoint=(p,used=new Set())=>points.findIndex((original,i)=>!used.has(i)&&original[0]===p[0]&&original[1]===p[1]);
 const steps=traced.events.map((record,index)=>{
  const root=record.outer,local=record.locals,context={...root,...local},source=definition.code[record.line-1].trim();
  let event='line';
  if(source.startsWith('for index, (x, y)'))active=record.branch?root.index:null;
  if(source==='d2 = x * x + y * y'){active=root.index;seen.add(active);event='distance';}
  if(method===4&&record.scope==='distance'){
   if(source==='x, y = point')active=matchPoint(local.point,seen);
   if(record.returning){if(active!==null&&active>=0)seen.add(active);event='distance';}
  }
  if(source.startsWith('heappush(')){active=root.index;event='push';}
  if(source==='removed = heappop(heap)'){active=-root.removed[1]||0;evicted.add(active);event='pop';}
  if(source==='entry = heappop(heap)'){active=root.entry[1];event='pop';}
  if(source==='heapify(heap)'||source==='entries.sort()'){active=null;event=source==='entries.sort()'?'sort':'heapify';if(source==='heapify(heap)')heapReady=true;}
  if(source.startsWith('for entry in '))active=record.branch?(method===1?(-root.entry[1]||0):root.entry[1]):null;
  if(source==='answer = []')selected=[];
  if(source.startsWith('answer.append(')){active=method===1?(-root.entry[1]||0):root.entry[1];selected.push(active);event='select';}
  if(source.startsWith('answer = nsmallest(')){
   const used=new Set();selected=root.answer.map(p=>{const id=matchPoint(p,used);used.add(id);return id;});active=null;event='select';
  }
  if(method===5&&source.startsWith('pivot =')){active=root.entries[root.hi][1];event='pivot';}
  if(method===6&&source.startsWith('pivot =')){active=root.entries[Math.floor((root.lo+root.hi)/2)][1];event='pivot';}
  if(source==='d2 = entries[scan][0]'||source.startsWith('if entries[scan][0]'))active=root.entries[root.scan]?.[1]??null;
  if((method===5||method===6)&&source.startsWith('entries[')&&source.includes(' = entries['))event='swap';
  if(method===7){
   if(source==='mid = (low + high) // 2'){tested=[];inside=[];active=null;event='probe';}
   if(source==='if entry[0] <= mid:'){active=root.entry[1];tested.push(active);if(record.branch)inside.push(active);event='condition';}
   if(source==='threshold = low'){tested=[];inside=[];active=null;event='threshold';}
  }
  if(record.returning&&record.scope==='kClosest')event='return';
  const heap=(root.heap??[]).map(entry=>normalize(entry,method===1));
  const entries=(root.entries??[]).map(entry=>normalize(entry));
  let ring=null;
  if(method===7&&Number.isFinite(root.threshold??root.mid))ring={d2:root.threshold??root.mid,label:root.threshold===undefined?'mid':'threshold'};
  else if((method===5||method===6)&&Number.isFinite(root.pivot))ring={d2:root.pivot,label:'pivot'};
  else if(heap.length&&heapReady)ring={d2:heap[0].d2,label:method===1?'MAX heap d²':'MIN heap d²'};
  else if(active!==null&&seen.has(active))ring={d2:distances[active],label:`d²(P${active})`};
  const final=index===traced.events.length-1;
  if(final&&method!==7&&selected.length)ring={d2:Math.max(...selected.map(id=>distances[id])),label:'max selected d²'};
  const snapshot={method,line:record.line,source,event,scope:record.scope,frames:record.frames.map(frame=>frame.name),branch:record.branch,
   points:points.map(p=>[...p]),distances:[...distances],k,seen:[...seen],active,selected:[...selected],evicted:[...evicted],heap,heapReady,entries,
   answer:root.answer?root.answer.map(p=>[...p]):null,removed:source==='removed = heappop(heap)'?active:null,ring,
   beforeHeap:previous?.heap?.map(entry=>normalize(entry,method===1))??[],
   lo:root.lo??null,hi:root.hi??null,scan:root.scan??null,store:root.store??null,less:root.less??null,greater:root.greater??null,pivot:root.pivot??null,target:root.target??null,
   low:root.low??null,high:root.high??null,mid:root.mid??null,count:root.count??null,threshold:root.threshold??null,tested:[...tested],inside:root.threshold===undefined?[...inside]:[],final};
  previous=root;
  return{arr:[],codeLines:[record.line],codeBlock:method,final,title:bi(`Dòng ${record.line} · ${record.scope}`,`Line ${record.line} · ${record.scope}`),note:bi('',''),vars:watches[method-1].map(name=>({name,value:context[name]??'—'})),closestPoints973View:snapshot};
 });
 return{original:{points:points.map(p=>[...p]),k},answer:traced.answer,steps};
}
const problem={id:973,difficulty:'medium',slug:'k-closest-points-to-origin',category:{key:'heap',vi:'Heap / Hàng đợi ưu tiên',en:'Heap / Priority Queue'},tags:[{key:'sorting',vi:'Sắp xếp',en:'Sorting'},{key:'heap',vi:'Heap',en:'Heap'},{key:'divide-conquer',vi:'Chia để trị',en:'Divide and Conquer'}],
 title:bi('K điểm gần gốc tọa độ nhất','K Closest Points to Origin'),titleVi:bi('So sánh d² = x² + y²','Compare squared distances x² + y²'),
 statement:bi('Trả về k điểm gần (0,0) nhất. Thứ tự kết quả tùy ý; so sánh x²+y² để tránh khai căn.','Return the k closest points to (0,0), in any order. Compare x²+y² without taking square roots.'),
 defaultInput:'1,3;-2,2;5,8;0,1',inputKind:'string',inputLabel:bi('points: x,y;… hoặc JSON · tối đa 18 điểm','points: x,y;… or JSON · up to 18 points'),debugMode:'line-by-line',
 extraParams:[{key:'k',type:'number',label:bi('k','k'),default:2,min:1,max:18},{key:'approach',type:'select',label:bi('Cách giải','Approach'),default:1,options:methods.map((m,i)=>({value:i+1,label:bi(`${i+1}. ${m.label.vi}`,`${i+1}. ${m.label.en}`)}))}],
 approach:[bi('Khoảng cách² không âm: x²+y². Hình dùng cùng tỷ lệ trên hai trục.','Squared distance is x²+y². The plot uses equal scales on both axes.'),bi('Max-heap giữ k điểm và bỏ điểm xa nhất; Quickselect chia vùng; binary search tìm ngưỡng khoảng cách².','A size-k max-heap discards the farthest point; quickselect partitions; binary search finds the squared-distance threshold.')],
 liveArgs:(input,params)=>{const{points,k}=parseInput(input,params);return[points,k];}};
methods.forEach((method,index)=>{
 const suffix=index===0?'':String(index+1);
 problem[`code${suffix}`]=method.code;
 problem[`code${suffix}Label`]=bi(`Cách ${index+1}: ${method.label.vi}`,`Approach ${index+1}: ${method.label.en}`);
 problem[`builder${suffix}`]=(input,params)=>buildSteps(input,params,index+1);
 problem[`complexity${suffix}`]={time:method.time,space:method.space,note:bi('n = số điểm, D = khoảng cách² lớn nhất. Quickselect dùng bản sao entries để giữ ID gốc.','n = point count, D = maximum squared distance. Quickselect uses an entries copy to preserve original IDs.')};
});
module.exports={973:problem};
