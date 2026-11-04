'use strict';
const {runTrace}=require('./wasm-picture-trace'),methods=require('./find-right-interval-436-methods');
const bi=(vi,en)=>({vi,en});
const watches=[['i','end','lo','hi','mid','starts','answer'],['i','end','pos','starts','answer'],['i','end','j','starts','ends','answer'],['i','end','starts','ends','removed','answer'],['node','value','original','candidate','end','answer'],['i','end','p','coords','next_index','answer'],['i','j','end','next_start','best_start','candidate','answer']];
function parseInput(input){
 let intervals=input;
 if(typeof input==='string'){
  if(input.trim().startsWith('[')){try{intervals=JSON.parse(input);}catch(_){intervals=null;}}
  else intervals=input.trim()?input.split(/[;|\n]/).map(row=>row.split(',').map(value=>value.trim()?Number(value):NaN)):[];
 }
 if(!Array.isArray(intervals)||intervals.length<1||intervals.length>18||intervals.some(row=>!Array.isArray(row)||row.length!==2||row.some(value=>typeof value!=='number'||!Number.isInteger(value)||Math.abs(value)>1e6)||row[0]>row[1])||new Set(intervals.map(row=>row[0])).size!==intervals.length)throw new RangeError('436: enter 1–18 [start,end] pairs, -1000000 ≤ start ≤ end ≤ 1000000, with unique starts.');
 return intervals.map(row=>[...row]);
}
function buildSteps(input,params={},method=1){
 const intervals=parseInput(input),definition=methods[method-1],trace=runTrace({code:definition.code.join('\n'),method:'findRightInterval',args:[intervals]});
 const finished=new Set(),built=new Map();let active=null,probe=null,candidate=null,comparison=null;
 const steps=trace.events.map((record,index)=>{
  const root=record.outer,local=record.locals,context={...root,...local},source=definition.code[record.line-1].trim();let event='line';
  if(source.startsWith('for i, (start, end)')||source==='for end, i in ends:'){
   active=record.branch?root.i:null;probe=null;candidate=null;comparison=null;event='query';
  }
  if(source==='end, i = heappop(ends)'){active=root.i;probe=null;candidate=null;comparison=null;event='query';}
  if(source==='while ends:'&&record.branch===false)active=null;
  if(source==='mid = (lo + hi) // 2'&&record.scope!=='build'){probe=root.starts[root.mid][1];comparison=null;event='probe';}
  if(source==='pos = bisect_left(starts, (end, -1))'){
   probe=root.starts[root.pos]?.[1]??null;candidate=probe;comparison=probe===null?null:{a:intervals[probe][0],b:root.end,op:'≥',pass:true};event='probe';
  }
  if(source==='while lo < hi:'&&record.branch===false&&root.answer)candidate=root.starts[root.lo]?.[1]??null;
  if(method===3&&source.startsWith('while j < len(starts)'))probe=root.starts[root.j]?.[1]??null;
  if(method===3&&source.startsWith('while j < len(starts)')&&record.branch===false)candidate=probe;
  if(method===3&&source==='j += 1'){probe=root.starts[root.j]?.[1]??null;comparison=null;event='advance';}
  if(method===4&&source.startsWith('while starts and'))probe=root.starts[0]?.[1]??null;
  if(method===4&&source.startsWith('while starts and')&&record.branch===false)candidate=probe;
  if(method===4&&source==='removed = heappop(starts)'){probe=root.starts[0]?.[1]??null;comparison=null;event='pop';}
  if(method===5){
   if(record.scope==='build'&&local.node){const node=local.node;built.set(node[1],{id:node[1],value:node[0],left:node[2]?.[1]??null,right:node[3]?.[1]??null});event='build';}
   if(active!==null&&source.startsWith('node =')){probe=root.node?.[1]??null;comparison=null;event='visit';}
  }
  if(source==='candidate = -1')candidate=null;
  if(source==='candidate = original'||source==='candidate = j'){candidate=root.candidate;event='candidate';}
  if(source.startsWith('for j, (next_start')){probe=record.branch?root.j:null;comparison=null;event='probe';}
  const condition=(a,b,op)=>{comparison={a,b,op,pass:record.branch};event='condition';};
  if(source==='if starts[mid][0] < end:')condition(root.starts[root.mid][0],root.end,'<');
  if(method===3&&probe!==null&&source.startsWith('while j <'))condition(root.starts[root.j][0],root.end,'<');
  if(method===4&&probe!==null&&source.startsWith('while starts and'))condition(root.starts[0][0],root.end,'<');
  if(source==='if value >= end:')condition(root.value,root.end,'≥');
  if(source==='if next_start >= end and next_start < best_start:'){
   condition(root.next_start,root.end,'≥');comparison.best=root.best_start;
  }
  if(source.startsWith('answer[i] =')||source.startsWith('answer.append(')){
   finished.add(root.i);candidate=root.answer[root.i]>=0?root.answer[root.i]:null;event='write';
  }
  if(source.startsWith('next_index[')&&source.includes(' = '))event='suffix';
  if(source==='starts.sort()'||source==='ends.sort()')event='sort';
  if(record.returning&&record.scope==='findRightInterval')event='return';
  const final=index===trace.events.length-1;
  const position=value=>root.position?.__pairs__?.find(([coordinate])=>coordinate===value)?.[1]??null;
  const writeIndex=source==='next_index[position[start]] = index'?position(root.start):source==='next_index[p] = next_index[p + 1]'?root.p:null;
  const view={method,line:record.line,source,event,scope:record.scope,frames:record.frames.map(frame=>frame.name),intervals:intervals.map(row=>[...row]),active,probe,candidate,comparison:comparison?{...comparison}:null,
   starts:(root.starts??[]).map(pair=>[...pair]),ends:(root.ends??[]).map(pair=>[...pair]),answer:root.answer?[...root.answer]:null,known:intervals.map((_,i)=>finished.has(i)?root.answer[i]:null),finished:[...finished],
   lo:root.lo??null,hi:root.hi??null,mid:root.mid??null,pos:root.pos??null,j:root.j??null,nodeId:root.node?.[1]??null,built:[...built.values()].map(node=>({...node})),
   coords:root.coords?[...root.coords]:null,nextIndex:root.next_index?[...root.next_index]:null,p:root.p??null,writeIndex,lookup:active!==null?position(intervals[active][1]):null,final};
  return{arr:[],codeLines:[record.line],codeBlock:method,final,title:bi(`Dòng ${record.line} · ${record.scope}`,`Line ${record.line} · ${record.scope}`),note:bi('',''),vars:watches[method-1].map(name=>({name,value:context[name]??'—'})),rightInterval436View:view};
 });
 return{original:intervals.map(row=>[...row]),answer:trace.answer,steps};
}
const problem={id:436,difficulty:'medium',slug:'find-right-interval',category:{key:'binary-search',vi:'Tìm kiếm nhị phân',en:'Binary Search'},tags:[{key:'binary-search',vi:'Tìm kiếm nhị phân',en:'Binary Search'},{key:'sorting',vi:'Sắp xếp',en:'Sorting'},{key:'heap',vi:'Heap',en:'Heap'},{key:'bst',vi:'BST',en:'BST'}],
 title:bi('Tìm interval bên phải','Find Right Interval'),titleVi:bi('Tìm min(start[j]) ≥ end[i]','Find the smallest start[j] ≥ end[i]'),statement:bi('Với mỗi interval i, trả index gốc j có start[j] ≥ end[i] nhỏ nhất; không có thì -1. Các start khác nhau. Nếu start[i] = end[i], i có thể tự trỏ.','For each interval i, return original index j with the smallest start[j] ≥ end[i], or -1. Starts are unique; a zero-length interval can point to itself.'),
 defaultInput:'3,4;2,3;1,2',inputKind:'string',inputLabel:bi('intervals: start,end;… hoặc JSON · tối đa 18','intervals: start,end;… or JSON · up to 18'),debugMode:'line-by-line',
 extraParams:[{key:'approach',type:'select',label:bi('Cách giải','Approach'),default:1,options:methods.map((m,i)=>({value:i+1,label:bi(`${i+1}. ${m.label.vi}`,`${i+1}. ${m.label.en}`)}))}],
 approach:[bi('Tìm lower bound của end trong danh sách start. Dấu ≥ chấp nhận hai đầu chạm nhau.','Find the lower bound of end among starts. The ≥ comparison accepts touching endpoints.'),bi('Trả index trong đầu vào, không trả vị trí trong danh sách đã sort.','Return the original input index, not the sorted position.')],
 liveArgs:input=>[parseInput(input)]};
methods.forEach((method,index)=>{const suffix=index===0?'':String(index+1);problem[`code${suffix}`]=method.code;problem[`code${suffix}Label`]=bi(`Cách ${index+1}: ${method.label.vi}`,`Approach ${index+1}: ${method.label.en}`);problem[`builder${suffix}`]=(input,params)=>buildSteps(input,params,index+1);problem[`complexity${suffix}`]={time:method.time,space:method.space,note:bi('Bao gồm việc dựng cấu trúc và mảng kết quả. Nén tọa độ chỉ lưu các mốc xuất hiện.','Includes structure construction and the output array. Coordinate compression stores only observed endpoints.')};});
module.exports={436:problem};
