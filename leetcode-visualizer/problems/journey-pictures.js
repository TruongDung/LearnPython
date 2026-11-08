"use strict";

const graph = require('./graph');
const tree = require('./tree');
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({ vi, en });
const copy = value => JSON.parse(JSON.stringify(value));
const BASES = {499: graph[499], 2492: graph[2492], 851: graph[851], 1197: graph[1197], 637: tree[637]};

const UNION_CODE = `class Solution:
    def minScore(self, n, roads):
        parent = list(range(n + 1))
        size = [1] * (n + 1)
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for a, b, d in roads:
            ra = find(a)
            rb = find(b)
            if ra != rb:
                if size[ra] < size[rb]:
                    ra, rb = rb, ra
                parent[rb] = ra
                size[ra] += size[rb]
        root = find(1)
        ans = float('inf')
        for a, b, d in roads:
            if find(a) == root:
                ans = min(ans, d)
        return ans`.split('\n');
const KNIGHT_CODE = `from collections import deque

class Solution:
    def minKnightMoves(self, x: int, y: int) -> int:
        x, y = abs(x), abs(y)
        bounds = (-2, x + 2, -2, y + 2)
        moves = [(-2,-1),(-2,1),(-1,-2),(-1,2),(1,-2),(1,2),(2,-1),(2,1)]
        queue = deque([(0, 0)])
        distance = {(0, 0): 0}
        parent = {(0, 0): None}
        while queue:
            current = queue.popleft()
            steps = distance[current]
            if current == (x, y):
                break
            for dx, dy in moves:
                nxt = (current[0] + dx, current[1] + dy)
                if not (bounds[0] <= nxt[0] <= bounds[1] and bounds[2] <= nxt[1] <= bounds[3]):
                    continue
                if nxt in distance:
                    continue
                new_distance = steps + 1
                distance[nxt] = new_distance
                parent[nxt] = current
                queue.append(nxt)
        path = []
        node = (x, y)
        while node is not None:
            path.append(node)
            node = parent[node]
        path.reverse()
        self.path = path
        return distance[(x, y)]`.split('\n');
const AVERAGE_CODE = `class Solution:
    def averageOfLevels(self, root):
        if not root:
            return []
        res = []
        queue = [root]
        while queue:
            vals = [node.val for node in queue]
            total = sum(vals)
            count = len(vals)
            average = total / count
            res.append(average)
            nxt = []
            for node in queue:
                if node.left:
                    nxt.append(node.left)
                if node.right:
                    nxt.append(node.right)
            queue = nxt
        return res`.split('\n');
const CODES = {499:[BASES[499].code],2492:[UNION_CODE],1197:[KNIGHT_CODE],637:[AVERAGE_CODE],851:[]};
for (let method=1; method<=5; method++) {
  const code = BASES[851][method===1?'code':'code'+method].join('\n')
    .replace('for rich in richer_map[i]:', 'for rich in sorted(richer_map[i]):');
  CODES[851].push(['from collections import defaultdict, deque','import collections','',...code.split('\n')]);
}

function fail(id, message) { throw new RangeError(`#${id}: ${message}`); }
function number(value) { return typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN; }
function parseGrid(input) {
  let maze=input;
  try { if(typeof input==='string') { const s=input.trim(); maze=s.startsWith('[')?JSON.parse(s):s.split(/[|;\n]/).map(row=>{
    const text=row.trim(),parts=text.includes(',')?text.split(','):/^[01]+$/.test(text)?[...text]:text.split(/\s+/); return parts.map(number);
  }); }} catch { maze=null; }
  if(!Array.isArray(maze)||!maze.length||maze.length>8||!Array.isArray(maze[0])||!maze[0].length||maze[0].length>8
    ||!Array.from(maze).every(row=>Array.isArray(row)&&row.length===maze[0].length&&Array.from(row).every(cell=>cell===0||cell===1))) fail(499,'use a rectangular 0/1 maze with 1–8 rows and columns');
  return maze.map(row=>[...row]);
}
function parseEdges(input, width, id) {
  let edges=input;
  try { if(typeof input==='string') { const s=input.trim(); edges=!s?[]:s.startsWith('[')?JSON.parse(s):width===3?s.split(';').map(row=>row.split(',').map(number)):s.split(',').map(row=>row.trim().split('-').map(number)); }} catch { edges=null; }
  if(!Array.isArray(edges)||!Array.from(edges).every(edge=>Array.isArray(edge)&&edge.length===width&&Array.from(edge).every(Number.isInteger))) fail(id, width===3?'roads: use a,b,weight; a,b,weight or JSON':'richer: use a-b,c-d or JSON');
  return edges.map(edge=>[...edge]);
}
function parseTree(input) {
  let values=input;
  try { if(typeof input==='string') { const s=input.trim(); values=!s?[]:s.startsWith('[')?JSON.parse(s):s.split(',').map(t=>['null','None'].includes(t.trim())?null:number(t)); }} catch { values=null; }
  if(!Array.isArray(values)||values.length>63||!Array.from(values).every(x=>x===null||Number.isInteger(x)&&x>=-2147483648&&x<=2147483647)) fail(637,'use 0–31 connected integer nodes (32-bit), null for missing children');
  values=[...values]; const nodes=values.length&&values[0]!==null?[{id:'0:0',value:values[0],left:null,right:null,parent:null,depth:0}]:[]; let index=1;
  for(let head=0;head<nodes.length&&index<values.length;head++)for(const side of ['left','right']) {
    if(index>=values.length)break; const value=values[index],id=`0:${index++}`; if(value===null)continue;
    nodes[head][side]=id; nodes.push({id,value,left:null,right:null,parent:nodes[head].id,depth:nodes[head].depth+1});
  }
  if(nodes.length>31||values.slice(index).some(x=>x!==null))fail(637,'tree nodes must be connected; at most 31 nodes');
  const byId=new Map(nodes.map(node=>[node.id,node])); let rank=0;
  function inorder(id) { if(id===null)return;const node=byId.get(id);inorder(node.left);node.rank=rank++;inorder(node.right); }
  if(nodes.length)inorder(nodes[0].id);
  return {values,nodes};
}
function parse(id,input,params={}) {
  if(id===499) {
    const maze=parseGrid(input),ball=[number(params.ballR??4),number(params.ballC??3)],hole=[number(params.holeR??0),number(params.holeC??1)];
    for(const point of [ball,hole])if(!point.every(Number.isInteger)||point[0]<0||point[0]>=maze.length||point[1]<0||point[1]>=maze[0].length||maze[point[0]][point[1]]!==0)fail(id,'ball and hole must be valid empty cells');
    if(ball.join(',')===hole.join(','))fail(id,'ball and hole must be different cells');
    return {args:[maze,ball,hole],model:{maze,ball,hole,rows:maze.length,cols:maze[0].length}};
  }
  if(id===2492) {
    const n=number(params.n??4),roads=parseEdges(input,3,id);
    if(!Number.isInteger(n)||n<2||n>100000||!roads.length||roads.length>100000||roads.some(([a,b,d])=>a<1||a>n||b<1||b>n||a===b||d<1||d>10000))fail(id,'2 ≤ n ≤ 100000; 1–100000 unique undirected roads with weights 1–10000');
    if(new Set(roads.map(([a,b])=>[Math.min(a,b),Math.max(a,b)].join(','))).size!==roads.length)fail(id,'duplicate roads are invalid');
    const adj=Array.from({length:n+1},()=>[]);for(const[a,b,d]of roads){adj[a].push([b,d]);adj[b].push([a,d]);}
    const order=[1],seen=new Set(order);for(let i=0;i<order.length;i++)for(const [v]of adj[order[i]])if(!seen.has(v)){seen.add(v);order.push(v);}
    if(!seen.has(n))fail(id,'cities 1 and n must be connected');
    const ids=n<=14?Array.from({length:n},(_,i)=>i+1):[...new Set([1,...order.slice(1,12),n])],shown=new Set(ids);
    const edges=roads.map((edge,index)=>({index,u:edge[0],v:edge[1],weight:edge[2]})).filter(edge=>shown.has(edge.u)&&shown.has(edge.v)).slice(0,48);
    return {args:[n,roads],model:{n,ids,edges,cropped:n>14||roads.length>48}};
  }
  if(id===851) {
    let quiet=params.quiet??BASES[id].extraParams[0].default;
    try {if(typeof quiet==='string')quiet=quiet.trim().startsWith('[')?JSON.parse(quiet):quiet.split(',').map(number);}catch{quiet=null;}
    if(!Array.isArray(quiet)||!quiet.length||quiet.length>500||!Array.from(quiet).every(q=>Number.isInteger(q)&&q>=0&&q<quiet.length)||new Set(quiet).size!==quiet.length)fail(id,'quiet must be a permutation of 0..n−1; 1 ≤ n ≤ 500');
    quiet=[...quiet];const n=quiet.length,richer=parseEdges(input,2,id);
    if(richer.length>n*(n-1)/2||richer.some(([a,b])=>a<0||b<0||a>=n||b>=n||a===b)||new Set(richer.map(edge=>edge.join(','))).size!==richer.length)fail(id,'richer needs unique valid pairs a-b, a ≠ b');
    const adj=Array.from({length:n},()=>[]),degree=Array(n).fill(0);for(const[a,b]of richer){adj[a].push(b);degree[b]++;}
    const order=degree.flatMap((d,i)=>d===0?[i]:[]);for(let i=0;i<order.length;i++)for(const v of adj[order[i]])if(--degree[v]===0)order.push(v);
    if(order.length!==n)fail(id,'richer must be acyclic');
    const levels=Array(n).fill(0);for(const u of order)for(const v of adj[u])levels[v]=Math.max(levels[v],levels[u]+1);
    const ids=order.slice(0,14),shown=new Set(ids),edges=richer.map(([u,v],index)=>({u,v,index})).filter(edge=>shown.has(edge.u)&&shown.has(edge.v)).slice(0,48);
    return {args:[richer,quiet],model:{n,ids,edges,quiet:quiet.slice(0,14),quietById:Object.fromEntries(ids.map(i=>[i,quiet[i]])),levels:Object.fromEntries(ids.map(u=>[u,levels[u]])),cropped:n>14||richer.length>48}};
  }
  if(id===1197) {
    const x=number(input),y=number(params.y);
    if(!Number.isInteger(x)||!Number.isInteger(y)||Math.abs(x)>20||Math.abs(y)>20)fail(id,'x and y must be integers from −20 to 20');
    return {args:[x,y],model:{original:[x,y],target:[Math.abs(x),Math.abs(y)]}};
  }
  const {values,nodes}=parseTree(input);return {args:[values],model:{nodes}};
}
function get(record,name) { const x=record.locals,o=record.outer;return Object.hasOwn(x,name)?x[name]:Object.hasOwn(o,name)?o[name]:x[`list(${name})[:16]`]??o[`list(${name})[:16]`]; }
function pairs(value) { return value?.__pairs__??[]; }
function key(point) { return point?.join(','); }
function mazeRoute(model,path) {
  if(path==='impossible')return null;let [r,c]=model.ball;const cells=[[r,c]],stops=[[r,c]];
  for(const letter of path){const [dr,dc]={d:[1,0],l:[0,-1],r:[0,1],u:[-1,0]}[letter];while(r+dr>=0&&r+dr<model.rows&&c+dc>=0&&c+dc<model.cols&&!model.maze[r+dr][c+dc]){r+=dr;c+=dc;cells.push([r,c]);if(key([r,c])===key(model.hole))break;}stops.push([r,c]);}
  return {cells,stops,distance:cells.length-1,path};
}
function roadWitness(n,roads,score) {
  const adj=Array.from({length:n+1},()=>[]);for(const[a,b]of roads){adj[a].push(b);adj[b].push(a);}
  const parents=(source)=>{const p=Array(n+1).fill(-1),q=[source];p[source]=source;for(let i=0;i<q.length;i++)for(const v of adj[q[i]])if(p[v]===-1){p[v]=q[i];q.push(v);}return p;};
  const from1=parents(1),[a,b]=roads.find(([a,,d])=>d===score&&from1[a]!==-1),fromB=parents(b);
  const pathTo=(p,v)=>{const path=[v];while(p[v]!==v){v=p[v];path.push(v);}return path.reverse();};
  return {nodes:[...pathTo(from1,a),...pathTo(fromB,n)],edge:[a,b,score]};
}
function build(id,input,params={}) {
  const {args,model}=parse(id,input,params),method=id===851?Number(params.approach??1):1;
  if(!Number.isInteger(method)||method<1||method>CODES[id].length)fail(id,'invalid approach');
  const code=CODES[id][method-1],large=[2492,851].includes(id)&&model.n>14;
  const summaries=id===499?{maze:0}:id===1197?{distance:0,parent:0,queue:16}:id===851?{richer:0,graph:0,...(large?{quiet:16,answer:16,richer_map:0,indegree:16,q:16,stack:16}:{})}:large?{roads:0,parent:16,size:16}:id===2492?{roads:0}:{};
  const maxEvents=id===1197&&model.target.every(x=>x<=7)?12000:id===499?5000:1600;
  const payload={code:code.join('\n'),method:code.find(line=>/^    def /.test(line)).match(/def (\w+)/)[1],args,summarizeLocals:summaries,maxEvents,
    ...(id===637?{treeArgs:[0]}:{}),...(id===1197?{stateClasses:['Solution']}:{})};
  const trace=runTrace(payload),known=new Map(),done=new Set(),history=[];let roll=[],proposal=null,round=-1,level=[],previous=null,active=null,levelState=null;
  const steps=trace.events.map((record,index)=>{
    const x=record.locals,text=code[record.line-1].trim();let change=null;
    if(id===499){
      if(text==='for dr, dc, letter in directions:'&&record.branch){roll=[];proposal=null;}
      if(text==='distance, path, row, col = heapq.heappop(heap)'){active=[x.row,x.col];roll=[];proposal=null;}
      if(text==="nr, nc, steps = row, col, 0"){roll=[[x.nr,x.nc]];proposal=null;}
      if(text==='nr, nc = nr + dr, nc + dc'){roll=[...roll,[x.nr,x.nc]];change={kind:'move',point:[x.nr,x.nc]};}
      if(text==='if [row, col] == hole:'&&!record.branch)done.add(key(active));
      if(text==='state = (nr, nc)'){const best=new Map(pairs(x.best).map(([p,v])=>[key(p),v]));proposal={point:[x.nr,x.nc],candidate:x.candidate,old:best.get(key(x.state))??['∞',''],accepted:null};}
      if(text.startsWith('if steps and candidate')&&proposal)proposal.accepted=record.branch;
      if(text==='best[state] = candidate')change={kind:'write',point:[x.nr,x.nc]};
    }
    if(id===2492){
      if(text==='parent[rb] = ra'||text==='parent[x] = parent[parent[x]]')change={kind:'union',from:x.rb??x.x,to:get(record,'parent')?.[x.rb??x.x]};
      if(text==='ans = min(ans, d)'){change={kind:'score',before:previous?.locals.ans??previous?.outer.ans??'∞',after:x.ans,edge:[x.a,x.b,x.d]};if(change.before!==change.after)history.push({step:index,value:x.ans,edge:[x.a,x.b,x.d]});}
    }
    if(id===851){
      if(text.startsWith('if quiet[')||text.startsWith('if answer[richer_person] != -1')){
        const answer=get(record,'answer'),from=method===1?x.neighbor:method===2?x.u:method===3?x.richer_person:method===4?x.rich:x.rich,to=method===1?x.node:method===2?x.v:method===3?x.node:method===4?x.i:x.poor;
        const person=method===4?from:answer?.[from],oldPerson=[3,4].includes(method)?x.best:answer?.[to];
        if(person!==undefined&&person!==-1&&oldPerson!==undefined&&oldPerson!==-1)proposal={from,to,person,oldPerson,quiet:args[1][person],oldQuiet:args[1][oldPerson],accepted:record.branch,line:record.line};
      }
      if(/^(u|cur|rich) = q.popleft\(\)$/.test(text))active=x.u??x.cur??x.rich;
      if(text==='node, expanded = stack.pop()')active=x.node;
      if(record.scope==='dfs')active=x.node;
      if(/answer\[.*\] = (answer\[|best)/.test(text)){const node=method===2?x.v:method===5?x.poor:x.node,answer=get(record,'answer');change={kind:'quiet',node,person:answer?.[node]};}
      if(text==='answer.append(best)')change={kind:'quiet',node:x.i,person:x.best};
      if(record.scope==='dfs'&&record.returning)done.add(x.node);
      if(text==='indegree[v] -= 1')done.add(x.u);if(text==='indegree[nei] -= 1')done.add(x.cur);if(text==='indegree[poor] -= 1')done.add(x.rich);
    }
    if(id===1197){
      if(text==='for dx, dy in moves:'&&record.branch)proposal=null;
      if(text==='distance = {(0, 0): 0}')known.set('0,0',0);
      if(text==='current = queue.popleft()'){active=x.current;proposal=null;}
      if(text==='nxt = (current[0] + dx, current[1] + dy)')proposal={point:x.nxt,allowed:null,seen:null};
      if(text.startsWith('if not (bounds')&&proposal)proposal.allowed=!record.branch;
      if(text==='if nxt in distance:'&&proposal)proposal.seen=record.branch;
      if(text==='distance[nxt] = new_distance'){known.set(key(x.nxt),x.new_distance);change={kind:'discover',point:x.nxt,value:x.new_distance};}
      if(text==='path.append(node)')change={kind:'path',point:x.node};
    }
    if(id===637){
      if(text==='while queue:'&&record.branch){round++;level=x.queue.map(node=>node.id);levelState={values:null,total:null,count:null,average:null};}
      if(text==='for node in queue:')active=record.branch?x.node.id:null;
      if(text==='vals = [node.val for node in queue]')levelState.values=x.vals;
      if(text==='total = sum(vals)')levelState.total=x.total;
      if(text==='count = len(vals)')levelState.count=x.count;
      if(text==='average = total / count')levelState.average=x.average;
      if(text==='res.append(average)')change={kind:'average',round,value:x.average};
    }
    const final=record.returning&&record.scope===payload.method;
    let board=null;
    if(id===1197){const focus=final?model.target:active??[0,0],minX=Math.min(Math.max(-2,focus[0]-5),Math.max(-2,model.target[0]+3-11)),minY=Math.min(Math.max(-2,focus[1]-5),Math.max(-2,model.target[1]+3-11));board={minX,minY,maxX:Math.min(model.target[0]+2,minX+10),maxY:Math.min(model.target[1]+2,minY+10),known:[...known].filter(([p])=>{const[a,b]=p.split(',').map(Number);return a>=minX&&a<=minX+10&&b>=minY&&b<=minY+10;}).map(([p,d])=>[...p.split(',').map(Number),d])};}
    const view={id,method,model,source:{line:record.line,text,timing:'after'},locals:x,outer:record.outer,scope:record.scope,frames:record.frames,branch:record.branch,returning:record.returning,returned:record.returned,trace:trace.trace,
      active:copy(active),done:[...done],roll:copy(roll),proposal:copy(proposal),history:copy(history),round,level:[...level],levelState:copy(levelState),layers:id===1197?[...known.values()].reduce((counts,d)=>{counts[d]=(counts[d]??0)+1;return counts;},[]):null,board,change,answer:final?trace.answer:null};
    previous=view;return {arr:[],codeBlock:method,codeLines:[record.line],final,title:bi(`L${record.line} · ${text}`,`L${record.line} · ${text}`),note:bi('',''),vars:Object.entries(x).map(([name,value])=>({name,value,rawValue:value})),journeyView:view};
  });
  const final=steps.at(-1).journeyView;
  final.witness=id===499?mazeRoute(model,trace.answer):id===2492?roadWitness(args[0],args[1],trace.answer):id===1197?final.locals.self.path:null;
  return {original:args[0],answer:trace.answer,steps,...(id===1197?{path:final.witness}:{}),...(id===499?{maze:model.maze,ball:model.ball,hole:model.hole}:{})};
}
const statements={499:bi('Lăn đến tường hoặc rơi vào lỗ. Ưu tiên (số ô đi, chuỗi hướng).','Roll to a wall or into the hole. Minimize (travel distance, direction string).'),2492:bi('Được đi lặp cạnh. Tìm cạnh nhỏ nhất trong thành phần liên thông chứa 1 và n.','Repeated roads are allowed. Find the smallest road in the connected component containing 1 and n.'),851:bi('answer[x] là ID người ít nói nhất trong x và mọi người chắc chắn giàu hơn x.','answer[x] is the quietest person ID among x and everyone known to be richer.'),1197:bi('Mỗi nước mã có cùng chi phí. BFS mở rộng theo số bước.','Every knight move has equal cost. BFS expands by move count.'),637:bi('Mỗi tầng: tổng giá trị ÷ số nút.','Each level: sum of values ÷ node count.')};
const exported={};for(const id of [499,2492,851,1197,637]){
  const base=BASES[id],codes=CODES[id];exported[id]={...base,builder:(input,params)=>build(id,input,params),builder2:undefined,builder3:undefined,builder4:undefined,builder5:undefined,debugMode:'line-by-line',statement:statements[id],approach:[statements[id]],allowEmptyInput:[851,637].includes(id),
    ...(id===637?{defaultInput:'3,9,20,null,null,15,7'}:{}),code:codes[0],...Object.fromEntries(codes.slice(1).map((code,i)=>['code'+(i+2),code])),
    liveArgs:(input,params)=>{const {args}=parse(id,input,params);return id===637?[{__viz_type:'binary_tree',values:args[0],tree_id:'root'}]:args;},
    ...(id===1197?{extraParams:[{...base.extraParams[0],allowNegative:true,min:-20,max:20}]}:{}),
    ...(id===2492?{complexity:{time:'O((n+m) α(n))',space:'O(n)',note:bi('Union theo kích thước + nén đường đi.','Union by size with path compression.')}}:{}),
    ...(id===851?{complexity:{time:'O(V+E)',space:'O(V+E)'},complexity4:{time:'O(VE + V² log V)',space:'O(V²+E)',note:bi('Tập tổ tiên có thể chứa O(V²) phần tử.','Transitive ancestor sets can contain O(V²) elements.')}}:{}),
  };
}
module.exports=exported;
