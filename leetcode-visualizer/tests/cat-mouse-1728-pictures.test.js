const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const {test}=require('node:test');
const problem=require('../problems').SUPPORTED[1728];
const examples=[['####F|#C...|M....',1,2,true],['M.C...F',1,4,true],['M.C...F',1,3,false],['MCF',1,1,false],['MFC',1,1,true],['M#F|C##',1,1,false]];

test('1728 main and move-helper line snapshots match CPython, with exact queue and table projections',()=>{
 const python=`import sys,json
data=json.load(sys.stdin)
ns={}
exec(data['code'],ns)
names={'grid','catJump','mouseJump','rows','cols','cells','mouse','cat','food','c','turn','m','distance','pm','pc','pt','state','p','jump','r','result','dr','dc','k','nr','nc'}
def clean(value):
    if isinstance(value,(list,tuple)): return [clean(v) for v in value]
    return value
results=[]
for grid,cj,mj in data['inputs']:
    rows=[]
    pending={}
    owner=None
    def trace(frame,event,arg):
        global owner
        if frame.f_code.co_name not in ('canMouseWin','moves'): return None
        if frame.f_code.co_name=='canMouseWin': owner=frame
        def snapshot(line):
            main=owner.f_locals
            wins=main.get('win',{})
            queue=main.get('queue',[])
            child=(main['m'],main['c'],main['turn']) if 'm' in main else None
            parent=main.get('state')
            projection={'winCount':len(wins) if 'win' in main else None,'queueLength':len(queue) if 'queue' in main else None,'queueHead':clean(list(queue)[:6]),'childRank':wins.get(child),'parentRank':wins.get(parent),'parentDegree':main.get('degree',{}).get(parent[:2]) if parent else None}
            rows.append({'line':line,'scope':frame.f_code.co_name,'locals':{key:clean(value) for key,value in frame.f_locals.items() if key in names},'projection':projection})
        if event=='line':
            if frame in pending: snapshot(pending[frame])
            pending[frame]=frame.f_lineno
        elif event=='return':
            snapshot(pending.pop(frame))
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().canMouseWin(grid,cj,mj)
    sys.settrace(None)
    results.append({'answer':answer,'rows':rows})
print(json.dumps(results))`;
 const inputs=examples.map(([input,cj,mj])=>problem.liveArgs(input,{catJump:cj,mouseJump:mj}));
 const output=spawnSync(process.env.PYTHON||'python3',['-c',python],{input:JSON.stringify({code:problem.code.join('\n'),inputs}),encoding:'utf8',maxBuffer:64*1024*1024});
 assert.equal(output.status,0,output.stderr);const expected=JSON.parse(output.stdout);
 examples.forEach(([input,catJump,mouseJump],index)=>{
  const run=problem.builder(input,{catJump,mouseJump}),reference=expected[index];assert.equal(run.answer,reference.answer);assert.equal(run.steps.at(-1).catMouse1728View.frame,reference.rows.length,`total frames ${input}`);
  run.steps.forEach(step=>{
   const v=step.catMouse1728View,row=reference.rows[v.frame-1];assert.deepEqual(step.codeLines,[row.line],`${input} frame ${v.frame}`);assert.equal(v.source.scope,row.scope);
   assert.deepEqual(v.locals,row.locals,`${input} ${row.scope}:${row.line} frame ${v.frame}`);assert.deepEqual(v.projection,row.projection,`${input} projection frame ${v.frame}`);
  });
 });
});

function independent(grid,catJump,mouseJump){
 const rows=grid.length,cols=grid[0].length,cells=[];let m0,c0,food;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(grid[r][c]!=='#'){const id=r*cols+c;cells.push(id);if(grid[r][c]==='M')m0=id;if(grid[r][c]==='C')c0=id;if(grid[r][c]==='F')food=id;}
 const k=cells.length,position=new Map(cells.map((p,i)=>[p,i])),moves=jump=>cells.map(p=>{const result=[position.get(p)],r=Math.floor(p/cols),c=p%cols;for(const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]])for(let d=1;d<=jump;d++){const nr=r+dr*d,nc=c+dc*d;if(nr<0||nr>=rows||nc<0||nc>=cols||grid[nr][nc]==='#')break;result.push(position.get(nr*cols+nc));}return result;});
 const mm=moves(mouseJump),cm=moves(catJump),foodIndex=position.get(food),index=(m,c,t)=>(m*k+c)*2+t;
 let previous=new Uint8Array(k*k*2);
 for(let m=0;m<k;m++)for(let c=0;c<k;c++)if(m===foodIndex&&c!==foodIndex)previous[index(m,c,0)]=previous[index(m,c,1)]=1;
 for(let turns=1;turns<=1000;turns++){
  const next=previous.slice();let changed=false;
  for(let m=0;m<k;m++)for(let c=0;c<k;c++)if(m!==c&&c!==foodIndex&&m!==foodIndex){
   if(!previous[index(m,c,0)]&&mm[m].some(to=>previous[index(to,c,1)])){next[index(m,c,0)]=1;changed=true;}
   if(!previous[index(m,c,1)]&&cm[c].every(to=>previous[index(m,to,0)])){next[index(m,c,1)]=1;changed=true;}
  }
  previous=next;if(!changed)break;
 }
 return !!previous[index(position.get(m0),position.get(c0),0)];
}
test('1728 matches official examples and independent finite-horizon game DP',()=>{
 for(const [input,catJump,mouseJump,answer] of examples){const run=problem.builder(input,{catJump,mouseJump});assert.equal(run.answer,answer,input);assert.equal(run.answer,independent(run.original,catJump,mouseJump));}
 let seed=1728;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
 for(let trial=0;trial<35;trial++){
  const rows=2+Math.floor(random()*2),cols=3,chars=Array(rows*cols).fill('.');
  const positions=Array.from({length:rows*cols},(_,i)=>i);for(let i=positions.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[positions[i],positions[j]]=[positions[j],positions[i]];}
  ['M','C','F'].forEach((ch,i)=>{chars[positions[i]]=ch;});positions.slice(3).forEach(p=>{if(random()<.3)chars[p]='#';});
  const grid=Array.from({length:rows},(_,r)=>chars.slice(r*cols,(r+1)*cols).join('')),cj=1+Math.floor(random()*3),mj=1+Math.floor(random()*3);
  assert.equal(problem.builder(grid,{catJump:cj,mouseJump:mj}).answer,independent(grid,cj,mj),`${grid} / ${cj},${mj}`);
 }
});

test('1728 legal jumps include staying and jumping over Cat, but never through walls',()=>{
 const over=problem.builder('M.C...F',{catJump:1,mouseJump:4}).steps.at(-1).catMouse1728View;
 assert.deepEqual(over.analysis.mouseMoves[0],[0,1,2,3,4]);assert.ok(over.analysis.mouseMoves[0].includes(over.cat+1));
 const wall=problem.builder('M.#F|C###',{catJump:8,mouseJump:8}).steps.at(-1).catMouse1728View;
 assert.deepEqual(wall.analysis.mouseMoves[0],[0,4,1]);
 for(const [input,catJump,mouseJump] of examples){
  const v=problem.builder(input,{catJump,mouseJump}).steps.at(-1).catMouse1728View;
  for(const map of [v.analysis.mouseMoves,v.analysis.catMoves])for(const [cell,moves] of Object.entries(map)){assert.ok(moves.includes(Number(cell)));assert.equal(moves.length,new Set(moves).size);}
  assert.ok(v.analysis.wins.every(([m,c,_turn,d])=>m!==c&&c!==v.food&&d>=0&&d<=1000));
 }
});

test('1728 preserves complete 8x8 results when the visible trace is capped',()=>{
 const grid=['M......F','........','........','........','........','........','........','.......C'];
 const run=problem.builder(grid,{catJump:2,mouseJump:3}),v=run.steps.at(-1).catMouse1728View;
 assert.equal(run.answer,independent(grid,2,3));assert.ok(v.omitted>0);assert.ok(run.steps.length<=8010);assert.equal(v.projection.queueLength,0);assert.equal(v.cells.length,64);
 assert.equal(v.answer,run.answer);assert.equal(v.analysis.wins.length,v.projection.winCount);
});

test('1728 winning ranks certify existential mouse choices and universal cat choices',()=>{
 for(const [input,catJump,mouseJump] of examples){
  const run=problem.builder(input,{catJump,mouseJump}),v=run.steps.at(-1).catMouse1728View,known=new Map(v.analysis.wins.map(([m,c,t,d])=>[`${m},${c},${t}`,d]));
  for(const [m,c,t,d] of v.analysis.wins){
   if(m===v.food){assert.equal(d,0);continue;}
   const ranks=(t===0?v.analysis.mouseMoves[m]:v.analysis.catMoves[c]).map(to=>known.get(t===0?`${to},${c},1`:`${m},${to},0`));
   if(t===0)assert.equal(d,1+Math.min(...ranks.filter(rank=>rank!==undefined)));
   else{assert.ok(ranks.every(rank=>rank!==undefined));assert.equal(d,1+Math.max(...ranks));}
  }
  for(const step of run.steps){const state=step.catMouse1728View;if(state.event==='decrement')assert.equal(state.choices.filter(choice=>!choice.eliminated).length,state.projection.parentDegree);}
 }
});

test('1728 board pictures, turn and options are finite and do not alter solver snapshots',()=>{
 const host={innerHTML:'',clientWidth:240,dataset:{}},context={lang:'vi',$:()=>host};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-cat-mouse-1728.js'),'utf8'),context);
 for(const [input,catJump,mouseJump] of examples){
  const run=problem.builder(input,{catJump,mouseJump}),before=JSON.stringify(run);
  for(const language of ['vi','en'])for(const [index,step] of run.steps.entries()){
   if(index%7!==0&&!step.final)continue;
   context.lang=language;context.renderCatMouse1728Pictures(step);const v=step.catMouse1728View;
   assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);assert.equal((host.innerHTML.match(/data-cell=/g)||[]).length,v.rows*v.cols);
   if(step.final)assert.match(host.innerHTML,/data-cm1728-auto/);
  }
  assert.equal(JSON.stringify(run),before);
 }
});

test('1728 validates grid and jump limits, and is available in the problem catalog',()=>{
 for(const input of ['', 'M.C','MFCM','MF|C', 'MFXC','MFC.........'])assert.throws(()=>problem.builder(input),/1728:/);
 for(const jump of [0,9,-1,1.5])assert.throws(()=>problem.builder('MFC',{catJump:jump}),/1728:/);
 assert.deepEqual(problem.liveArgs('["M.C...F"]',{catJump:'1',mouseJump:'4'}),[['M.C...F'],1,4]);
 assert.equal(problem.debugMode,'line-by-line');assert.ok(require('../problems').TOPOLOGICAL_SORT_SUBTABS[0].roster.find(p=>p.id===1728).available);
});
