'use strict';
const base=require('./graph')[1245];
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const code=[
  'from collections import defaultdict, deque',
  'class Solution:',
  '    def treeDiameter(self, edges):',
  '        if not edges:',
  '            return 0',
  '        graph = defaultdict(list)',
  '        for u, v in edges:',
  '            graph[u].append(v)',
  '            graph[v].append(u)',
  '        def bfs(start):',
  '            visited = {start}',
  '            queue = deque([(start, 0)])',
  '            far_node, far_dist = start, 0',
  '            while queue:',
  '                node, dist = queue.popleft()',
  '                if dist > far_dist:',
  '                    far_node, far_dist = node, dist',
  '                for nei in graph[node]:',
  '                    if nei not in visited:',
  '                        visited.add(nei)',
  '                        queue.append((nei, dist + 1))',
  '            return far_node, far_dist',
  '        a, _ = bfs(0)',
  '        b, diameter = bfs(a)',
  '        return diameter',
];
const copy=value=>JSON.parse(JSON.stringify(value));
function parse(input) {
  let edges;
  try {
    if(Array.isArray(input))edges=copy(input);
    else if(typeof input==='string') {
      const raw=input.trim();
      edges=!raw?[]:raw.startsWith('[')?JSON.parse(raw):raw.split(';').map(pair=>pair.trim()).filter(Boolean).map(pair=>pair.split(',').map(value=>value.trim()===''?NaN:Number(value)));
    } else throw Error();
  } catch {throw new TypeError('#1245: nhập 0,1;1,2 hoặc [[0,1],[1,2]] / enter edge pairs or a JSON array.');}
  if(!Array.isArray(edges)||edges.length>39||edges.some(pair=>!Array.isArray(pair)||pair.length!==2||pair.some(id=>!Number.isSafeInteger(id)||id<0||id>edges.length)))
    throw new RangeError('#1245: cây 1–40 đỉnh, đánh số 0…n−1 / use a tree with 1–40 vertices numbered 0…n−1.');
  const parent=Array.from({length:edges.length+1},(_,i)=>i),find=id=>parent[id]===id?id:find(parent[id]);
  for(const [u,v]of edges) {const a=find(u),b=find(v);if(a===b)throw new RangeError('#1245: cạnh phải tạo thành cây, không lặp hoặc có chu trình / edges must form a tree without duplicates or cycles.');parent[a]=b;}
  return edges;
}
function pathTo(pass,node) {
  if(node===null||node===undefined||pass.distances[node]===null)return [];
  const path=[];
  for(let at=node;at!==null;at=pass.parents[at])path.unshift(at);
  return path;
}
function builder(input) {
  const edges=parse(input),n=edges.length+1;
  const trace=runTrace({code:code.join('\n'),method:'treeDiameter',args:[edges]});
  const passes=[];let phase=0,active=null,neighbor=null;
  const steps=trace.events.map((record,index)=>{
    const x={...record.outer,...record.locals},line=record.line,helper=record.scope==='bfs';
    let event='step',change=null;
    if(!helper) {
      if(line===4)event='empty-check';
      if(line===6)event='graph';
      if(line===7)event='edge';
      if(line===8||line===9){event='arc';change={from:line===8?x.u:x.v,to:line===8?x.v:x.u};}
      if(line===23){event='endpoint-a';active=neighbor=null;}
      if(line===24){event='endpoint-b';active=neighbor=null;}
    } else {
      if(line===11) {
        phase++;active=neighbor=null;event='start';
        passes.push({start:x.start,visited:[],queue:null,settled:[],distances:Array(n).fill(null),parents:Array(n).fill(null),farNode:null,farDist:null,bestPath:[],returned:null,complete:false});
      }
      const pass=passes[phase-1];
      pass.visited=x.visited??[];pass.queue=x.queue??null;
      pass.farNode=x.far_node??null;pass.farDist=x.far_dist??null;
      if(line===12){event='enqueue-start';pass.distances[x.start]=0;}
      if(line===13){event='seed-farthest';pass.bestPath=[x.start];}
      if(line===14)event='queue-check';
      if(line===15){event='pop';active=x.node;neighbor=null;pass.settled.push(x.node);}
      if(line===16)event='distance-check';
      if(line===17){event='farthest';pass.bestPath=pathTo(pass,x.far_node);}
      if(line===18){event='neighbor';neighbor=record.branch?x.nei:null;}
      if(line===19)event='visited-check';
      if(line===20)event='visit';
      if(line===21){event='enqueue';pass.parents[x.nei]=x.node;pass.distances[x.nei]=x.queue.at(-1)[1];change={from:x.node,to:x.nei,distance:pass.distances[x.nei]};}
      if(record.returning){event='bfs-return';pass.returned=record.returned;pass.complete=true;active=neighbor=null;}
    }
    const final=index===trace.events.length-1;
    if(final){event='return';active=neighbor=null;}
    const graph=Array.from({length:n},()=>[]);
    for(const [id,neighbors]of x.graph?.__pairs__??[])graph[id]=[...neighbors];
    const finalPath=x.b!==undefined&&passes[1]?pathTo(passes[1],x.b):final&&!edges.length?[0]:[];
    const names=helper?['start','node','dist','far_node','far_dist','nei']:['u','v','a','b','diameter'];
    return {arr:[],codeBlock:1,codeLines:[line],final,title:bi(`L${line} · ${event}`,`L${line} · ${event}`),note:bi('',''),
      vars:names.map(name=>({name,value:Object.hasOwn(record.locals,name)?record.locals[name]:'—'})),
      diameter1245View:{source:{line,text:code[line-1].trim(),timing:'after'},scope:record.scope,locals:record.locals,outer:record.outer,frames:record.frames,
        branch:record.branch,returning:record.returning,returned:record.returned,event,phase,n,edges,graph,
        active,neighbor,change,passes:copy(passes),a:x.a??null,b:x.b??null,diameter:x.diameter??(final?trace.answer:null),finalPath,
        done:final,answer:final?trace.answer:null},
    };
  });
  return {original:edges,answer:trace.answer,steps};
}
module.exports={1245:{...base,code,builder,debugMode:'line-by-line',allowEmptyInput:true,
  defaultInput:'0,1;1,2;2,3;1,4;4,5',
  inputLabel:bi('edges · u,v;… hoặc JSON · tối đa 40 đỉnh','edges · u,v;… or JSON · up to 40 vertices'),
  approach:[bi('0 → A xa nhất. A → B xa nhất. Đường kính = số cạnh từ A đến B.','0 → farthest A. A → farthest B. Diameter = the number of edges from A to B.')],
  liveArgs:input=>[parse(input)],
}};
