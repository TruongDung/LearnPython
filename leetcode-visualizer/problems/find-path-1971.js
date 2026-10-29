'use strict';
const base=require('./graph')[1971],bi=(vi,en)=>({vi,en});
const clone=value=>Array.isArray(value)?value.map(clone):value;
function parse(input,params={}){
 const n=Number(params.n??6),source=Number(params.source??0),destination=Number(params.destination??5);
 if(!Number.isSafeInteger(n)||n<1||![source,destination].every(v=>Number.isSafeInteger(v)&&v>=0&&v<n))throw new TypeError('#1971: n nguyên dương; source, destination nằm trong 0..n−1 / invalid vertex range.');
 if(typeof input!=='string')throw new TypeError('#1971: nhập cạnh a,b; c,d / enter edges as a,b; c,d.');
 const edges=input.split(';').map(s=>s.trim()).filter(Boolean).map(pair=>pair.split(',').map(s=>s.trim()));
 if(edges.some(pair=>pair.length!==2||pair.some(s=>!/^\d+$/.test(s)||!Number.isSafeInteger(Number(s))||Number(s)>=n)))throw new TypeError('#1971: mỗi cạnh gồm hai đỉnh trong 0..n−1 / edge endpoints must be valid vertices.');
 return [n,edges.map(pair=>pair.map(Number)),source,destination];
}
function build(input,params={},approach=1){
 const [n,edges,source,destination]=parse(input,params),recursive=approach===2,bfs=approach===3,code=base[approach===1?'code':'code'+approach];
 const x={n,edges,source,destination},frames=[],steps=[];let arcs=edges.map(()=>[false,false]),visited=null,parents=Array(n).fill(null),foundPath=null,answer=null,nextFrame=0;
 function pathTo(node){if(node===null||node===undefined)return [];const path=[],seen=new Set();for(let at=node;at!==null&&!seen.has(at);at=parents[at]){seen.add(at);path.unshift(at);if(at===source)return path;}return [];}
 function emit(line,phase,title,options={}){
  const frame=frames.at(-1),methodLocals=Object.fromEntries(Object.entries(x).map(([name,value])=>[name,clone(value)]));
  const locals=frame?{node:frame.node,...(frame.nb===undefined?{}:{nb:frame.nb}),adj:clone(x.adj),destination,visited:[...visited].sort((a,b)=>a-b)}:methodLocals;
  const work=recursive?frames.map(f=>({...f})):clone(x[bfs?'q':'stack']??null),visitedNodes=visited===null?[]:recursive?[...visited].sort((a,b)=>a-b):visited.flatMap((v,j)=>v?[j]:[]);
  const names=frame?['node','nb','destination','visited']:recursive?['n','source','destination','visited']:['node','nb','source','destination','visited',bfs?'q':'stack'];
  if(options.final)answer=options.returned;
  steps.push({arr:[],title,note:bi('',''),codeLines:[line],codeBlock:approach,final:Boolean(options.final),vars:names.map(name=>({name,value:locals[name]??'—'})),
   path1971View:{id:1971,mode:recursive?'recursive':bfs?'queue':'stack',phase,scope:frame?'dfs':'validPath',sourceLine:{line,text:code[line-1],timing:'after'},locals,methodLocals,
    n,edges,source,destination,adj:clone(x.adj??null),arcs:clone(arcs),visited:visitedNodes,visitedReady:visited!==null,work,frames:frames.map(f=>({...f})),parents:[...parents],
    active:options.active??null,neighbor:options.neighbor??null,building:options.building??null,check:options.check??null,returned:options.returned??null,answer,
    route:foundPath?[...foundPath]:recursive?frames.map(f=>f.node):pathTo(options.active),foundPath:foundPath?[...foundPath]:null},
  });
 }
 function returnTrue(line,options={}){if(!foundPath)foundPath=recursive?frames.map(f=>f.node):options.active===undefined?[source]:pathTo(options.active);emit(line,'return-true',bi('↩ True','↩ True'),{...options,returned:true});}
 function mark(node,parent,line){if(recursive)visited.add(node);else visited[node]=true;if(node!==source)parents[node]=parent;emit(line,'visit',bi(`✓ Thăm ${node}`,`✓ Visit ${node}`),{active:node,neighbor:parent});}
 if(!recursive){const same=source===destination;emit(4,'same',bi('source = destination ?','source = destination ?'),{check:same});if(same){returnTrue(5,{active:source,final:true});return {original:{n,edges,source,destination},answer,steps};}}
 const init=recursive?3:6,loop=recursive?4:7;
 x.adj=Array.from({length:n},()=>[]);emit(init,'adj-init',bi('adj = [∅, …]','adj = [∅, …]'));
 edges.forEach(([a,b],index)=>{x.a=a;x.b=b;emit(loop,'edge',bi(`${a} ↔ ${b}`,`${a} ↔ ${b}`),{active:a,neighbor:b,building:{index,direction:null}});
  x.adj[a].push(b);arcs[index][0]=true;emit(loop+1,'arc',bi(`adj[${a}] ← ${b}`,`adj[${a}] ← ${b}`),{active:a,neighbor:b,building:{index,direction:0}});
  x.adj[b].push(a);arcs[index][1]=true;emit(loop+2,'arc',bi(`adj[${b}] ← ${a}`,`adj[${b}] ← ${a}`),{active:b,neighbor:a,building:{index,direction:1}});
 });emit(loop,'edges-end',bi('Xong danh sách kề','Adjacency complete'));
 if(recursive){
  visited=new Set();x.visited=[];emit(7,'visited-init',bi('visited = ∅','visited = ∅'));emit(9,'define',bi('Tạo dfs(node)','Define dfs(node)'));
  function dfs(node){const parent=frames.at(-1)?.node??null,f={id:nextFrame++,node};frames.push(f);const same=node===destination;emit(10,'target-check',bi(`${node} = ${destination} ?`,`${node} = ${destination} ?`),{active:node,check:same});
   if(same){returnTrue(11,{active:node});frames.pop();return true;}
   const seen=visited.has(node);emit(12,'visited-check',bi(seen?'Đã thăm ? ✓':'Đã thăm ? ×',seen?'Visited ? ✓':'Visited ? ×'),{active:node,check:seen});
   if(seen){emit(13,'return-false',bi('↩ False · nhánh này','↩ False · this branch'),{active:node,returned:false});frames.pop();return false;}
   visited.add(node);x.visited=[...visited].sort((a,b)=>a-b);if(node!==source)parents[node]=parent;emit(14,'visit',bi(`✓ Thăm ${node}`,`✓ Visit ${node}`),{active:node,neighbor:parent});
   for(const nb of x.adj[node]){f.nb=nb;emit(15,'neighbor',bi(`${node} → ${nb}`,`${node} → ${nb}`),{active:node,neighbor:nb});const result=dfs(nb);emit(16,'child-result',bi(`dfs(${nb}) → ${result?'True':'False'}`,`dfs(${nb}) → ${result?'True':'False'}`),{active:node,neighbor:nb,returned:result,check:result});if(result){returnTrue(17,{active:node});frames.pop();return true;}}
   emit(15,'neighbors-end',bi('Hết hàng xóm','No more neighbors'),{active:node});emit(18,'return-false',bi('↩ False · nhánh này','↩ False · this branch'),{active:node,returned:false});frames.pop();return false;
  }
  const result=dfs(source);emit(20,'done',bi(`validPath → ${result?'True':'False'}`,`validPath → ${result?'True':'False'}`),{returned:result,final:true});
 }else{
  visited=Array(n).fill(false);x.visited=visited;emit(10,'visited-init',bi('visited = False × n','visited = False × n'));
  const workName=bfs?'q':'stack';x[workName]=[source];emit(11,'work-init',bi(`${workName} ← ${source}`,`${workName} ← ${source}`),{active:source});mark(source,null,12);
  while(x[workName].length){emit(13,'while',bi(`${workName} ≠ ∅`,`${workName} ≠ ∅`));x.node=bfs?x.q.shift():x.stack.pop();const node=x.node;emit(14,'take',bi(`Lấy ${node}`,`Take ${node}`),{active:node});const same=node===destination;emit(15,'target-check',bi(`${node} = ${destination} ?`,`${node} = ${destination} ?`),{active:node,check:same});if(same){returnTrue(16,{active:node,final:true});return {original:{n,edges,source,destination},answer,steps};}
   for(const nb of x.adj[node]){x.nb=nb;emit(17,'neighbor',bi(`${node} → ${nb}`,`${node} → ${nb}`),{active:node,neighbor:nb});const fresh=!visited[nb];emit(18,'visited-check',bi(fresh?'Chưa thăm ✓':'Đã thăm ×',fresh?'Unvisited ✓':'Visited ×'),{active:node,neighbor:nb,check:fresh});if(!fresh)continue;visited[nb]=true;parents[nb]=node;emit(19,'visit',bi(`✓ Thăm ${nb}`,`✓ Visit ${nb}`),{active:node,neighbor:nb});x[workName].push(nb);emit(20,'append',bi(`${workName} ← ${nb}`,`${workName} ← ${nb}`),{active:node,neighbor:nb});}
   emit(17,'neighbors-end',bi('Hết hàng xóm','No more neighbors'),{active:node});
  }emit(13,'empty',bi(`${workName} = ∅`,`${workName} = ∅`));emit(21,'done',bi('validPath → False','validPath → False'),{returned:false,final:true});
 }
 return {original:{n,edges,source,destination},answer,steps};
}
module.exports={1971:{...base,builder:(input,params={})=>build(input,params,[2,3].includes(Number(params.approach))?Number(params.approach):1),builder2:(input,params)=>build(input,params,2),builder3:(input,params)=>build(input,params,3),liveArgs:parse,debugMode:'line-by-line',
 statement:bi('Có đường đi từ source tới destination trong đồ thị không hướng không? Nhập cạnh a,b; c,d.','Can source reach destination in this undirected graph? Enter edges as a,b; c,d.'),
 approach:[bi('Xây adj hai chiều → duyệt từ source → gặp destination thì True.','Build both adjacency directions → explore from source → return True at destination.')],
}};
