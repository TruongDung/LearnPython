'use strict';
const base=require('./union-find')[1627];
const {runTrace}=require('./wasm-picture-trace');
const bi=(vi,en)=>({vi,en});
const copy=value=>JSON.parse(JSON.stringify(value));
const code=[
  'class Solution:',
  '    def areConnected(self, n, threshold, queries):',
  '        parent = list(range(n + 1))',
  '        size = [1] * (n + 1)',
  '        def find(x):',
  '            while parent[x] != x:',
  '                parent[x] = parent[parent[x]]',
  '                x = parent[x]',
  '            return x',
  '        for d in range(threshold + 1, n + 1):',
  '            for multiple in range(2 * d, n + 1, d):',
  '                left = find(d)',
  '                right = find(multiple)',
  '                if left != right:',
  '                    if size[left] < size[right]:',
  '                        left, right = right, left',
  '                    parent[right] = left',
  '                    size[left] += size[right]',
  '        answer = []',
  '        for a, b in queries:',
  '            root_a = find(a)',
  '            root_b = find(b)',
  '            connected = root_a == root_b',
  '            answer.append(connected)',
  '        return answer',
];
function parse(input,params={}) {
  const n=Array.isArray(input)?(input.length===1?Number(input[0]):NaN):Number(input),threshold=Number(params.threshold??2);
  if(!Number.isSafeInteger(n)||n<1||n>24)throw new RangeError('#1627: n phải từ 1 đến 24 / n must be between 1 and 24.');
  if(!Number.isSafeInteger(threshold)||threshold<0||threshold>n)throw new RangeError('#1627: 0 ≤ threshold ≤ n.');
  let queries=params.queries??'3,4;4,8;9,5;5,10;7,11';
  try {if(typeof queries==='string'){const text=queries.trim();queries=!text?[]:text.startsWith('[')?JSON.parse(text):text.split(';').map(pair=>pair.trim()).filter(Boolean).map(pair=>pair.split(',').map(x=>x.trim()===''?NaN:Number(x)));}}catch{throw new TypeError('#1627: queries phải là a,b;… hoặc JSON / queries must be pairs or JSON.');}
  if(!Array.isArray(queries)||queries.length>20||queries.some(pair=>!Array.isArray(pair)||pair.length!==2||pair.some(x=>!Number.isSafeInteger(x)||x<1||x>n)))throw new RangeError('#1627: tối đa 20 truy vấn, thành phố 1…n / up to 20 queries with cities 1…n.');
  return [n,threshold,copy(queries)];
}
function groupsOf(parent,n) {
  if(!parent)return [];
  const groups=new Map();
  for(let id=1;id<=n;id++){let root=id;while(parent[root]!==root)root=parent[root];if(!groups.has(root))groups.set(root,[]);groups.get(root).push(id);}
  return [...groups].map(([root,members])=>({root,members,key:members[0]})).sort((a,b)=>a.key-b.key);
}
function witness(edges,a,b) {
  const queue=[a],previous=new Map([[a,null]]);
  for(let i=0;i<queue.length&&!previous.has(b);i++)for(const edge of edges){const next=edge.a===queue[i]?edge.b:edge.b===queue[i]?edge.a:null;if(next!==null&&!previous.has(next)){previous.set(next,queue[i]);queue.push(next);}}
  if(!previous.has(b))return [];
  const path=[];for(let id=b;id!==null;id=previous.get(id))path.unshift(id);return path;
}
function builder(input,params={}) {
  const [n,threshold,queries]=parse(input,params),trace=runTrace({code:code.join('\n'),method:'areConnected',args:[n,threshold,queries]});
  let phase='sieve',divisor=null,multiple=null,query=null,find=null,findRole='left',lastScope=null;
  const edges=[],links=[];let previousParent=null;
  const steps=trace.events.map((record,index)=>{
    const line=record.line,helper=record.scope==='find',x={...record.outer,...record.locals};
    let event='step',change=null;
    if(!helper){
      if(line===3)event='parent';if(line===4)event='size';
      if(line===10){event='divisor';divisor=record.branch?x.d:null;multiple=null;find=null;}
      if(line===11){event='multiple';multiple=record.branch?x.multiple:null;findRole='left';find=null;}
      if(line===12){event='left';findRole='right';}
      if(line===13)event='right';
      if(line===14){event=record.branch?'different':'same';if(!record.branch)links.push({a:x.d,b:x.multiple,merged:false});}
      if(line===15)event='size-check';
      if(line===16)event='swap';
      if(line===17){event='merge';change={node:x.right,from:previousParent[x.right],to:x.left};edges.push({a:x.d,b:x.multiple,d:x.d});links.push({a:x.d,b:x.multiple,merged:true});}
      if(line===18)event='grow';
      if(line===19){phase='queries';divisor=multiple=null;find=null;event='answer';}
      if(line===20){event='query';find=null;findRole='root-a';if(record.branch)query={index:x.answer.length,a:x.a,b:x.b,rootA:null,rootB:null,connected:null,appended:false};}
      if(line===21){event='root-a';query.rootA=x.root_a;findRole='root-b';}
      if(line===22){event='root-b';query.rootB=x.root_b;}
      if(line===23){event='compare';query.connected=x.connected;}
      if(line===24){event='append';query.appended=true;}
    }else{
      if(lastScope!=='find')find={role:findRole,start:x.x,x:x.x,walk:[x.x],root:null};
      find.x=x.x;
      if(line===6)event='find-check';
      if(line===7){event='compress';change={node:x.x,from:previousParent[x.x],to:x.parent[x.x]};}
      if(line===8){event='climb';find.walk.push(x.x);}
      if(line===9){event='find-return';find.root=record.returned;}
    }
    const final=index===trace.events.length-1;if(final){event='return';phase='done';}
    const parent=x.parent??null,size=x.size??null,groups=groupsOf(parent,n);
    const path=query?.connected===true?witness(edges,query.a,query.b):[];
    const names=helper?['x','parent[x]']:phase==='sieve'?['d','multiple','left','right']:['a','b','root_a','root_b','connected'];
    const vars=names.map(name=>({name,value:name==='parent[x]'?(parent?.[x.x]??'—'):(Object.hasOwn(record.locals,name)?record.locals[name]:'—')}));
    previousParent=parent;lastScope=record.scope;
    return {arr:[],codeBlock:1,codeLines:[line],final,title:bi(`L${line} · ${event}`,`L${line} · ${event}`),note:bi('',''),vars,
      connectivity1627View:{source:{line,text:code[line-1].trim(),timing:'after'},scope:record.scope,locals:record.locals,outer:record.outer,frames:record.frames,branch:record.branch,returning:record.returning,returned:record.returned,
        event,phase,n,threshold,queries,divisor,multiple,parent:copy(parent),size:copy(size),groups,edges:copy(edges),links:copy(links),query:copy(query),find:copy(find),change,path,results:copy(x.answer??null),done:final,answer:final?trace.answer:null},
    };
  });
  return {original:[n],answer:trace.answer,steps};
}
module.exports={1627:{...base,code,builder,debugMode:'line-by-line',maxInput:24,
  defaultInput:[12],inputLabel:bi('n · 1–24 thành phố','n · 1–24 cities'),
  extraParams:[{key:'threshold',type:'number',label:bi('threshold · 0…n','threshold · 0…n'),default:2,min:0,max:24},{key:'queries',type:'string',label:bi('queries · a,b;… hoặc JSON','queries · a,b;… or JSON'),default:'3,4;4,8;9,5;5,10;7,11',allowEmpty:true}],
  approach:[bi('d > threshold → nối d với 2d, 3d, … ≤ n. Cùng root → có đường đi.','d > threshold → connect d to 2d, 3d, … ≤ n. Same root → a path exists.')],
  complexity:{time:'O((n log n + q) · α(n))',space:'O(n + q)',note:bi('Sàng bội + DSU theo kích thước, nén đường đi.','Divisor sieve + union by size and path halving.')},liveArgs:parse,
}};
