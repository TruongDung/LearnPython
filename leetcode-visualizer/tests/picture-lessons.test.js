const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync,spawn}=require('node:child_process'),path=require('node:path');
const P=require('../problems').SUPPORTED;
const ids=[739,173,3170,2444,2242,864];
const defaults=id=>Object.fromEntries(P[id].extraParams.map(p=>[p.key,p.default]));
const samples={739:[[[73,74,75,71,69,72,76,73],{}],[[70,70,71],{}],[[80,70,60,90],{}],[[100],{}],[[90,80,70,60],{}]],
173:[[P[173].defaultInput,defaults(173)],['1,null,2,3',{operations:'next()'}],['3,2,null,1',{operations:'next();hasNext();next();next();hasNext()'}],['1,null,2,null,3',{operations:'next();next();next();hasNext()'}]],
3170:[['aaba*',{}],['aba*',{}],['bbac**',{}],['abc',{}],['a*',{}],['zzzz****',{}]],
2444:[[[1,3,5,2,7,5],{minK:1,maxK:5}],[[1,1,1,1],{minK:1,maxK:1}],[[1,5,7,1,5],{minK:1,maxK:5}],[[3,3],{minK:1,maxK:5}]],
2242:[[P[2242].defaultInput,defaults(2242)],[[1,2,3,4],{edges:'[[0,1],[1,2],[2,3]]'}],[[9,9,9,9],{edges:'[[0,1],[1,2],[2,0]]'}],[[9,9,9,9],{edges:'[]'}]],
864:[['@.a..;###.#;b.A.B',{}],['@..aA;..B#.;....b',{}],['@Aa',{}],['@.a;.#.;b.A',{}],['@.f',{}],['@',{}]]};
// This tree has a value 3 in the left subtree of 2, which is not a valid BST.
samples[173][1]=['1,null,3,2',{operations:'next();next();hasNext();next();hasNext()'}];
function bruteTemp(a){return a.map((t,i)=>{for(let j=i+1;j<a.length;j++)if(a[j]>t)return j-i;return 0;});}
function bruteBounds(a,min,max){let count=0;for(let i=0;i<a.length;i++){let lo=Infinity,hi=-Infinity;for(let j=i;j<a.length;j++){lo=Math.min(lo,a[j]);hi=Math.max(hi,a[j]);if(lo===min&&hi===max)count++;}}return count;}
function bruteStars(s){const at=s.indexOf('*');if(at<0)return s;const smallest=[...s.slice(0,at)].filter(c=>c!=='*').sort()[0];return [...s.slice(0,at)].flatMap((c,i)=>c===smallest?[bruteStars(s.slice(0,i)+s.slice(i+1,at)+s.slice(at+1))]:[]).sort()[0];}
function bruteScore(scores,raw){const edges=typeof raw==='string'?JSON.parse(raw):raw,adj=scores.map(()=>new Set());for(const [u,v]of edges){adj[u].add(v);adj[v].add(u);}let best=-1;for(let a=0;a<scores.length;a++)for(const b of adj[a])for(const c of adj[b])for(const d of adj[c])if(new Set([a,b,c,d]).size===4)best=Math.max(best,scores[a]+scores[b]+scores[c]+scores[d]);return best;}
function keyOracle(input){const grid=input.split(';'),letters=[...new Set((input.match(/[a-f]/g)||[]))].sort().join(''),front=[];for(let r=0;r<grid.length;r++)for(let c=0;c<grid[0].length;c++)if(grid[r][c]==='@')front.push([0,r,c,'']);const best=new Map();while(front.length){front.sort((a,b)=>b[0]-a[0]);const[d,r,c,keys]=front.pop(),id=[r,c,keys].join(',');if(best.has(id))continue;best.set(id,d);if(keys===letters)return d;for(const[dr,dc]of[[0,1],[1,0],[0,-1],[-1,0]]){const nr=r+dr,nc=c+dc,ch=grid[nr]?.[nc];if(!ch||ch==='#'||/[A-F]/.test(ch)&&!keys.includes(ch.toLowerCase()))continue;const next=/[a-f]/.test(ch)?[...new Set(keys+ch)].sort().join(''):keys;front.push([d+1,nr,nc,next]);}}return-1;}

test('six picture lessons are registered, use dedicated assets and return the published examples',()=>{
  const expected={739:[1,1,4,2,1,1,0,0],173:[true,3,7,9,15,20,false],3170:'aab',2444:2,2242:24,864:8};
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');assert.match(html,/data-problem-ids="739 173 3170 2444 2242 864"/);
  for(const id of ids){const p=P[id],r=p.builder(p.defaultInput,defaults(id));assert.deepEqual(r.answer,expected[id]);assert.equal(p.debugMode,'line-by-line');assert.equal(r.steps.filter(s=>s.final).length,1);assert.ok(r.steps[0].pictureView||r.steps[0].daily739View);}
});

test('739/2444/3170/2242 match exhaustive oracles, including equal temperatures, shared bounds and duplicate endpoints',()=>{
  let seed=739;const rand=n=>{seed=(seed*1664525+1013904223)>>>0;return seed%n;};
  for(let t=0;t<80;t++){
    const a=Array.from({length:1+rand(12)},()=>30+rand(6));assert.deepEqual(P[739].builder(a).answer,bruteTemp(a));
    const b=Array.from({length:2+rand(10)},()=>1+rand(6)),min=1+rand(6),max=1+rand(6);assert.equal(P[2444].builder(b,{minK:min,maxK:max}).answer,bruteBounds(b,min,max));
    let s='',balance=0;for(let i=0;i<7;i++){const star=balance>0&&rand(3)===0;s+=star?'*':String.fromCharCode(97+rand(3));balance+=star?-1:1;}assert.equal(P[3170].builder(s).answer,bruteStars(s));
    const scores=Array.from({length:4+rand(3)},()=>1+rand(6)),edges=[];for(let i=0;i<scores.length;i++)for(let j=i+1;j<scores.length;j++)if(rand(3)===0)edges.push([i,j]);assert.equal(P[2242].builder(scores,{edges:JSON.stringify(edges)}).answer,bruteScore(scores,edges));
  }
});

test('864 uses cell plus keys as the visited state, opens matching doors and matches a string-key shortest-route oracle',()=>{
  for(const[input]of samples[864])assert.equal(P[864].builder(input).answer,keyOracle(input));
  const r=P[864].builder('@.a;.#.;b.A'),v=r.steps.at(-1).pictureView;
  assert.equal(v.path.length-1,r.answer);assert.equal(v.path.at(-1)[2],v.target);
  const masks=new Map();for(const[a,b,k]of v.visited){const id=[a,b].join(',');if(!masks.has(id))masks.set(id,new Set());masks.get(id).add(k);}assert.ok([...masks.values()].some(s=>s.size>1));
  for(let i=1;i<v.path.length;i++){const[a,b]=v.path[i-1],[c,d]=v.path[i];assert.equal(Math.abs(a-c)+Math.abs(b-d),1);}
  assert.equal(P[864].builder('@aA').answer,1);assert.equal(P[864].builder('@Aa').answer,-1);
});

for(const id of ids)test(`${id}: every executed statement and all local variables match CPython`,()=>{
  const method={739:'dailyTemperatures',173:'',3170:'clearStars',2444:'countSubarrays',2242:'maximumScore',864:'shortestPathAllKeys'}[id];
  const chosen=samples[id],calls=chosen.map(([input,params])=>id===173?{input,operations:P[id].parsePicture173(input,params).operations}:P[id].liveArgs(input,params));
  const python=`import sys,json
from collections import deque
data=json.load(sys.stdin)
class TreeNode:
    def __init__(self,val): self.val,self.left,self.right=val,None,None
def tree(values):
    root=TreeNode(values[0]);q=[root];i=1
    for parent in q:
        for side in ('left','right'):
            if i<len(values) and values[i] is not None:
                node=TreeNode(values[i]);setattr(parent,side,node);q.append(node)
            i+=1
    return root
def encode(v):
    if isinstance(v,TreeNode): return {'val':v.val,'left':encode(v.left),'right':encode(v.right)}
    if isinstance(v,(list,tuple,deque)): return [encode(x) for x in v]
    if isinstance(v,set): return sorted([encode(x) for x in v])
    if isinstance(v,dict): return {str(k):encode(x) for k,x in v.items()}
    if isinstance(v,(str,int,bool)) or v is None: return v
    return {k:encode(x) for k,x in vars(v).items()}
ns={'deque':deque,'TreeNode':TreeNode}
exec(compile(data['code'],'<lesson>','exec'),ns)
out=[]
for call in data['calls']:
    pending,events={},[]
    def trace(frame,event,arg):
        name=frame.f_code.co_name
        if frame.f_code.co_filename!='<lesson>' or name not in data['methods']: return trace
        if event in ('line','return'):
            if frame in pending:
                events.append({'line':pending[frame],'locals':encode(dict(frame.f_locals))})
                del pending[frame]
            if event=='line': pending[frame]=frame.f_lineno
        return trace
    if data['id']==173:
        raw=call['input']
        values=json.loads(raw) if raw.strip().startswith('[') else [None if x.strip()=='null' else int(x) for x in raw.split(',')]
        root=tree(values)
        sys.settrace(trace)
        instance=ns['BSTIterator'](root)
        result=[getattr(instance,op)() for op in call['operations']]
        sys.settrace(None)
    else:
        sys.settrace(trace)
        result=getattr(ns['Solution'](),data['methods'][0])(*call)
        sys.settrace(None)
    out.append({'events':events,'answer':result})
print(json.dumps(out))`;
  const run=spawnSync('python',['-c',python],{input:JSON.stringify({id,code:P[id].code.join('\n'),calls,methods:id===173?['__init__','_push_left','next','hasNext']:[method]}),encoding:'utf8',maxBuffer:64*1024*1024});assert.equal(run.status,0,run.stderr);
  JSON.parse(run.stdout).forEach((actual,i)=>{const expected=P[id].builder(...chosen[i]);assert.deepEqual(expected.answer,actual.answer);assert.deepEqual(expected.steps.map(s=>({line:s.codeLines[0],locals:Object.fromEntries(s.vars.map(v=>[v.name,v.rawValue]))})),actual.events,JSON.stringify(chosen[i]));});
});

test('pop and removal frames retain old values until the following assignment; large inputs are fully solved',()=>{
  const r=P[739].builder([70,70,71]),pop=r.steps.find(s=>s.daily739View.event==='pop');assert.deepEqual(pop.daily739View.answer,[0,0,0]);assert.deepEqual(pop.daily739View.stack,[0]);assert.deepEqual(r.answer,[2,1,0]);
  const stars=P[3170].builder('aaba*'),chosen=stars.steps.find(s=>s.pictureView.event==='pop rightmost');assert.equal(chosen.pictureView.chosen,3);assert.equal(chosen.pictureView.removed[3],false);
  const temps=Array(100000).fill(30);temps[99999]=100;const large=P[739].builder(temps);assert.equal(large.answer[0],99999);assert.equal(large.steps[0].daily739View.mode,'summary');
  const bound=P[2444].builder(Array(100000).fill(1),{minK:1,maxK:1});assert.equal(bound.answer,5000050000);assert.deepEqual(bound.steps[0].codeLines,[]);
  assert.equal(P[3170].builder('a*'.repeat(50000)).answer,'');
  const grid=Array(30).fill('.'.repeat(30));grid[0]='@'+'.'.repeat(29);grid[29]='.'.repeat(29)+'a';const bfs=P[864].builder(grid);assert.equal(bfs.answer,58);assert.equal(bfs.steps[0].pictureView.mode,'summary');
  const bst=[0];for(let i=1;i<2001;i++)bst.push(null,i);const iterator=P[173].builder(bst,{operations:'next();'.repeat(2001)+'hasNext()'});assert.equal(iterator.answer[2000],2000);assert.equal(iterator.answer[2001],false);assert.equal(iterator.steps[0].pictureView.mode,'summary');
  const scores=Array(2000).fill(1),edges=Array.from({length:1999},(_,i)=>[i,i+1]);assert.equal(P[2242].builder(scores,{edges}).answer,4);
});

test('all six lessons reject malformed inputs, and failure never fabricates a normal trace',()=>{
  for(const input of [[],[29],[101],[30.5],[true]])assert.throws(()=>P[739].builder(input));
  for(const input of ['', '*a','a**','ABC'])assert.throws(()=>P[3170].builder(input));
  for(const input of ['', '@@a', '@..;..', '@gg', '@aa'])assert.throws(()=>P[864].builder(input));
  for(const [input,params]of [[[1,1],{minK:null,maxK:1}],[[1,0],{minK:1,maxK:1}],[[],{}]])assert.throws(()=>P[2444].builder(input,params));
  assert.throws(()=>P[173].builder('1,null,2,3',{operations:'next()'}));assert.throws(()=>P[173].builder('1',{operations:'next();next()'}));assert.throws(()=>P[173].builder('1',{operations:'unknown()'}));
  assert.throws(()=>P[2242].builder([1,2,3,4],{edges:'[[0,1],[1,0]]'}));assert.throws(()=>P[2242].builder([1,2,3,4],{edges:'[[0,4]]'}));
});

function renderer(){const handlers={},input={value:''},fields={};const host={innerHTML:'',querySelector(s){if(s==='[data-pl-path]'&&!this.innerHTML.includes('data-pl-path'))return null;return{clientWidth:600,addEventListener:(e,fn)=>{handlers[s+':'+e]=fn;}};},querySelectorAll(s){const matches=s==='.pl-day-pick'?[...this.innerHTML.matchAll(/data-day="(\d+)"/g)].map(m=>m[1]):s==='[data-pl-example]'?['0','1','2']:[];return matches.map(n=>({dataset:{day:n,plExample:n},addEventListener:(e,fn)=>{handlers[s+n+':'+e]=fn;}}));}};const ctx={lang:'vi',$:id=>id==='arrInput'?input:id==='extraParams'?{querySelector:s=>(fields[s]??={value:''})}:host,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),stopPlay(){},renderStep(){},runViz(){},steps:[],stepIndex:0};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-picture-lessons.js'),'utf8'),ctx);return{ctx,host,handlers,input,fields};}
test('all six lessons render every default frame in both languages and support replay, answer selection, examples and skip controls',()=>{
  const {ctx,host,handlers,input}=renderer();
  for(const lang of ['vi','en'])for(const id of ids){ctx.lang=lang;const run=P[id].builder(P[id].defaultInput,defaults(id));for(const step of run.steps){ctx.renderPictureLesson(step);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);assert.match(host.innerHTML,/pl-picture/);}assert.match(host.innerHTML,/pl-final/);ctx.steps=run.steps;ctx.stepIndex=0;ctx.renderPictureLesson(run.steps[0]);handlers['[data-pl-next]:click']();assert.ok(ctx.stepIndex>0);handlers['[data-pl-result]:click']();assert.equal(ctx.stepIndex,run.steps.length-1);handlers['[data-pl-example]1:click']();assert.ok(input.value.length>0);}
  const bfs=P[864].builder(P[864].defaultInput);ctx.renderPictureLesson(bfs.steps.at(-1));handlers['[data-pl-path]:input']({target:{value:'0'}});assert.match(host.innerHTML,/mask=000000/);
  const t=P[739].builder([70,70,71]);ctx.renderPictureLesson(t.steps.at(-1));handlers['.pl-day-pick0:click']();assert.match(host.innerHTML,/2 − 0 = 2/);
});

test('real editable Python runner executes all six displayed solutions including BST design operations',()=>{
  const source=fs.readFileSync(require.resolve('../public/live-editor.js'),'utf8'),tracer=vm.runInNewContext(source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1]);
  const calls=ids.map(id=>({id,code:P[id].code.join('\n'),method:{739:'dailyTemperatures',3170:'clearStars',2444:'countSubarrays',2242:'maximumScore',864:'shortestPathAllKeys'}[id],args:id===173?[]:P[id].liveArgs(P[id].defaultInput,defaults(id)),design:id===173?{className:'BSTIterator',constructorArgs:[{__viz_type:'binary_tree',values:[7,3,15,null,null,9,20]}],operations:P[id].parsePicture173(P[id].defaultInput,defaults(id)).operations.map(name=>({name,args:[]}))}:null}));
  const python=tracer+`\nimport json,sys\ndata=json.load(sys.stdin)\nprint(json.dumps([__viz_run_trace(x['code'],x.get('method'),x['args'],x.get('design'))['result'] for x in data]))`;
  const run=spawnSync('python',['-c',python],{input:JSON.stringify(calls),encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(run.status,0,run.stderr);assert.deepEqual(JSON.parse(run.stdout),ids.map(id=>P[id].builder(P[id].defaultInput,defaults(id)).answer));
});

test('HTTP metadata, solve, editor calls and lazy picture assets work for all six problems',async()=>{
  const port=42000+Math.floor(Math.random()*10000),root=path.resolve(__dirname,'..'),server=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:'pipe'});let logs='';server.stderr.on('data',d=>logs+=d);const url=`http://localhost:${port}`;
  try{let ready=false;for(let i=0;i<100;i++){if(server.exitCode!==null)throw new Error(logs);try{ready=(await fetch(url+'/api/problem/864')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,50));}assert.ok(ready,logs);
    for(const id of ids){const p=P[id],body=JSON.stringify({input:p.defaultInput,params:defaults(id)}),meta=await(await fetch(url+'/api/problem/'+id)).json();assert.deepEqual(meta.code,p.code);const post=s=>fetch(url+'/api/problem/'+id+'/'+s,{method:'POST',headers:{'Content-Type':'application/json'},body});const solved=await post('solve');assert.equal(solved.status,200);assert.deepEqual((await solved.json()).answer,p.builder(p.defaultInput,defaults(id)).answer);const live=await post('live-args');assert.equal(live.status,200);const args=await live.json();if(id===173)assert.equal(args.design.className,'BSTIterator');else assert.deepEqual(args.args,p.liveArgs(p.defaultInput,defaults(id)));}
    for(const name of ['renderer-picture-lessons.js','picture-lessons.css'])assert.equal((await fetch(url+'/'+name)).status,200);
  }finally{server.kill();}
});
