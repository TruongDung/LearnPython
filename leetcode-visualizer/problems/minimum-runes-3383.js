"use strict";
const bi=(vi,en)=>({vi,en}),copy=x=>JSON.parse(JSON.stringify(x));
const PROGRAM=[
 ['import','from collections import deque'],
 ['class','class Solution:'],
 ['method','    def minRunesToAdd(self, n, crystals, flowFrom, flowTo):'],
 ['graph','        graph = list([] for _ in range(n))'],
 ['edge','        for u, v in zip(flowFrom, flowTo):'],
 ['link','            graph[u].append(v)'],
 ['powered','        powered = [False] * n'],
 ['define-spread','        def spread(start):'],
 ['queue','            queue = deque([start])'],
 ['while-queue','            while queue:'],
 ['pop','                u = queue.popleft()'],
 ['already-lit','                if powered[u]:'],
 ['skip-lit','                    continue'],
 ['light','                powered[u] = True'],
 ['neighbor','                for v in graph[u]:'],
 ['enqueue','                    queue.append(v)'],
 ['crystal','        for u in crystals:'],
 ['spread-crystal','            spread(u)'],
 ['seen','        seen = powered.copy()'],
 ['order','        order = []'],
 ['define-finish','        def finish(start):'],
 ['stack','            stack = [(start, False)]'],
 ['while-stack','            while stack:'],
 ['stack-pop','                u, done = stack.pop()'],
 ['done-test','                if done:'],
 ['finish-node','                    order.append(u)'],
 ['seen-test','                elif not seen[u]:'],
 ['visit','                    seen[u] = True'],
 ['exit-frame','                    stack.append((u, True))'],
 ['reverse-neighbor','                    for v in reversed(graph[u]):'],
 ['neighbor-test','                        if not seen[v]:'],
 ['enter-frame','                            stack.append((v, False))'],
 ['root','        for u in range(n):'],
 ['root-test','            if not seen[u]:'],
 ['finish-call','                finish(u)'],
 ['added','        added = []'],
 ['candidate','        for u in reversed(order):'],
 ['dark-test','            if not powered[u]:'],
 ['new-rune','                added.append((crystals[0], u))'],
 ['spread-rune','                spread(u)'],
 ['result','        return len(added)'],
];
const CODE=PROGRAM.map(([,code])=>code),LINE=Object.fromEntries(PROGRAM.map(([tag],i)=>[tag,i+1]));
function parse(input,params={}){
 const n=Number(params.n??7);let edges,crystals;
 try{const text=String(input??'').trim();edges=Array.isArray(input)?copy(input):!text?[]:text.startsWith('[')?JSON.parse(text):text.split(/[,;\n]+/).map(s=>s.trim().split(/\s*-\s*/).map(part=>part.trim()===''?NaN:Number(part)));
  const raw=params.crystals??'[3,5]';crystals=Array.isArray(raw)?[...raw]:String(raw).trim().startsWith('[')?JSON.parse(raw):String(raw).split(',').map(part=>part.trim()===''?NaN:Number(part));
 }catch(_){throw new RangeError('3383: nhập edges [[0,1],...] và crystals [0,...] / enter JSON edges and crystals.');}
 if(!Number.isInteger(n)||n<2||n>12||!Array.isArray(crystals)||crystals.length<1||crystals.length>n||crystals.some(u=>!Number.isInteger(u)||u<0||u>=n)||!Array.isArray(edges)||edges.length>66||edges.some(e=>!Array.isArray(e)||e.length!==2||e.some(u=>!Number.isInteger(u)||u<0||u>=n)||e[0]===e[1])||new Set(edges.map(e=>e.join(','))).size!==edges.length)
  throw new RangeError('3383: minh họa 2–12 đỉnh, ≤66 cạnh khác nhau, không tự nối; crystals không rỗng / 2–12 nodes, ≤66 unique non-self edges, nonempty crystals.');
 return{n,crystals,edges,flowFrom:edges.map(e=>e[0]),flowTo:edges.map(e=>e[1])};
}
function build(input,params={}){
 const {n,crystals,edges,flowFrom,flowTo}=parse(input,params),s={n,crystals,flowFrom,flowTo},calls=[],steps=[];
 let frame=0,phase='graph',initialPowered=Array(n).fill(false);
 function emit(tag,final=false){
  const f=calls.at(-1),line=LINE[tag],locals=copy(f?f.kind==='spread'?{...f.locals,graph:s.graph,powered:s.powered}:{...f.locals,graph:s.graph,order:s.order,seen:s.seen}:s);
  const active=f?.locals.u??f?.locals.start??s.u??null;
  const next=f?f.locals.v:s.v;
  const activeEdge=['neighbor','enqueue','reverse-neighbor','neighbor-test','enter-frame','link'].includes(tag)&&Number.isInteger(next)?[active,next]:null;
  steps.push({arr:[],highlight:[],mark:[],codeLines:[line],source:{line,text:CODE[line-1],scope:f?.kind??'minRunesToAdd'},locals,
   vars:Object.entries(locals).map(([name,value])=>({name,value})),title:bi(final?'Kết quả':`Dòng ${line}`,final?'Result':`Line ${line}`),note:bi('',''),final,
   runes3383View:copy({n,crystals,edges,frame:++frame,event:tag,phase,active,activeEdge,powered:s.powered??Array(n).fill(false),initialPowered,seen:s.seen??[],order:s.order??[],added:s.added??[],
    queue:f?.kind==='spread'?f.locals.queue??[]:[],stack:f?.kind==='finish'?f.locals.stack??[]:[],scope:f?.kind??'minRunesToAdd'})});
 }
 s.graph=Array.from({length:n},()=>[]);emit('graph');for(const[u,v]of edges){Object.assign(s,{u,v});emit('edge');s.graph[u].push(v);emit('link');}emit('edge');
 s.powered=Array(n).fill(false);emit('powered');emit('define-spread');
 function spread(start){const f={kind:'spread',locals:{start}};calls.push(f);const x=f.locals;x.queue=[start];emit('queue');
  while(x.queue.length){emit('while-queue');x.u=x.queue.shift();emit('pop');emit('already-lit');if(s.powered[x.u]){emit('skip-lit');continue;}s.powered[x.u]=true;emit('light');
   for(const v of s.graph[x.u]){x.v=v;emit('neighbor');x.queue.push(v);emit('enqueue');}emit('neighbor');
  }emit('while-queue');calls.pop();
 }
 phase='initial';for(const u of crystals){s.u=u;emit('crystal');spread(u);emit('spread-crystal');}emit('crystal');initialPowered=[...s.powered];
 phase='finish';s.seen=[...s.powered];emit('seen');s.order=[];emit('order');emit('define-finish');
 function finish(start){const f={kind:'finish',locals:{start}};calls.push(f);const x=f.locals;x.stack=[[start,false]];emit('stack');
  while(x.stack.length){emit('while-stack');[x.u,x.done]=x.stack.pop();emit('stack-pop');emit('done-test');if(x.done){s.order.push(x.u);emit('finish-node');}
   else{emit('seen-test');if(!s.seen[x.u]){s.seen[x.u]=true;emit('visit');x.stack.push([x.u,true]);emit('exit-frame');
    for(const v of [...s.graph[x.u]].reverse()){x.v=v;emit('reverse-neighbor');emit('neighbor-test');if(!s.seen[v]){x.stack.push([v,false]);emit('enter-frame');}}emit('reverse-neighbor');
   }}
  }emit('while-stack');calls.pop();
 }
 for(let u=0;u<n;u++){s.u=u;emit('root');emit('root-test');if(!s.seen[u]){finish(u);emit('finish-call');}}emit('root');
 phase='add';s.added=[];emit('added');for(const u of [...s.order].reverse()){s.u=u;emit('candidate');emit('dark-test');if(!s.powered[u]){s.added.push([crystals[0],u]);emit('new-rune');spread(u);emit('spread-rune');}}emit('candidate');
 phase='done';emit('result',true);return{original:copy(edges),n,answer:s.added.length,steps};
}
module.exports={3383:{id:3383,slug:'minimum-runes-to-add-to-cast-spell',premium:true,difficulty:'hard',
 title:bi('Minimum Runes to Add to Cast Spell','Minimum Runes to Add to Cast Spell'),titleVi:bi('Thêm ít rune nhất để truyền năng lượng','Add the fewest runes to power every point'),
 category:{key:'graph',vi:'Đồ thị',en:'Graph'},tags:[{key:'dfs',vi:'DFS',en:'DFS'},{key:'bfs',vi:'BFS',en:'BFS'}],
 statement:bi('Tinh thể là nguồn năng lượng. Rune u → v chỉ truyền theo một chiều. Thêm ít rune nhất để mọi đỉnh nhận được năng lượng từ ít nhất một tinh thể. Minh họa: 2–12 đỉnh, tối đa 66 cạnh.','Crystals supply energy. A rune u → v carries energy in one direction. Add the fewest runes so every node is reachable from a crystal. Illustration: 2–12 nodes, up to 66 edges.'),
 approach:[bi('Lan năng lượng từ các tinh thể trước.','First spread energy from the crystals.'),bi('DFS phần tối, đảo thứ tự kết thúc. Gặp đỉnh còn tối thì nối từ nguồn và lan tiếp.','DFS the dark region, then reverse finish order. Connect each still-dark candidate to a source and spread again.')],
 inputKind:'string',allowEmptyInput:true,inputLabel:bi('runes · ví dụ 0-1,1-2 hoặc [[0,1],[1,2]]','runes · e.g. 0-1,1-2 or [[0,1],[1,2]]'),defaultInput:'0-1,1-2,2-0,3-4,5-6',
 extraParams:[{key:'n',type:'number',label:bi('n · 2–12 đỉnh','n · 2–12 nodes'),default:7,min:2,max:12},{key:'crystals',type:'string',label:bi('crystals · đỉnh có tinh thể','crystals · source nodes'),default:'[3,5]'}],
 code:CODE,debugMode:'line-by-line',builder:build,liveArgs:(input,params)=>{const p=parse(input,params);return[p.n,p.crystals,p.flowFrom,p.flowTo];},
 complexity:{time:'O(n + m)',space:'O(n + m)',note:bi('DFS dùng stack để tránh giới hạn đệ quy. Mọi bước của input minh họa đều được giữ lại.','DFS uses an explicit stack to avoid recursion limits. Every illustrated execution step is retained.')},
}};
