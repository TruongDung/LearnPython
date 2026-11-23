'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const problems=require('../problems').SUPPORTED;
const grids=[[['X','Y','.'],['Y','.','.']],[['X','X'],['X','Y']],[['.','.'],['.','.']],[['.','X'],['Y','.']],[['Y','X']],[['X']],[['.']],[['Y']],[['X'],['Y']]];
const targets=[[1,2,3,2,1],[3,1,1,2],[3,1,5,4,2],[3,3,3],[5,4,3,2,1],[0,2,0,2],[0],[12],[0,12,0,12,0,12,0,12,0,12]];
function xyCount(grid,r,c){const chars=grid.slice(0,r+1).flatMap(row=>row.slice(0,c+1));return {x:chars.filter(ch=>ch==='X').length,y:chars.filter(ch=>ch==='Y').length};}
function xyOracle(grid){let answer=0;for(let r=0;r<grid.length;r++)for(let c=0;c<grid[0].length;c++){const {x,y}=xyCount(grid,r,c);answer+=x===y&&x>0?1:0;}return answer;}
function bfs(target){const initial=target.map(()=>0),queue=[[initial,0]],seen=new Set([initial.join(',')]);for(let head=0;head<queue.length;head++){const [state,depth]=queue[head];if(state.every((x,i)=>x===target[i]))return depth;for(let l=0;l<state.length;l++)for(let r=l;r<state.length;r++){const next=[...state];let allowed=true;for(let i=l;i<=r;i++){next[i]++;if(next[i]>target[i])allowed=false;}const key=next.join(',');if(allowed&&!seen.has(key)){seen.add(key);queue.push([next,depth+1]);}}}}
let seed=3212;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};

test('3212 counts only prefixes with equal positive X/Y counts, including a dot or Y at the origin',()=>{
  const samples=[...grids,...Array.from({length:100},()=>Array.from({length:1+rand(6)},()=>Array.from({length:6},()=>'XY.'[rand(3)])))];
  for(const grid of samples){const run=problems[3212].builder(grid);assert.equal(run.answer,xyOracle(grid));const last=run.steps.at(-1).equalXY3212View;assert.equal(last.decisions.length,grid.length*grid[0].length);assert.equal(last.decisions.filter(item=>item.counted).length,run.answer);}
  assert.equal(problems[3212].builder(grids[0]).answer,3);assert.equal(problems[3212].builder(grids[2]).answer,0);
});

test('3212 rolling arrays, short-circuit checks and pending accepted rectangles match each Python statement',()=>{
  for(const grid of grids){let total=0;const run=problems[3212].builder(grid);for(const step of run.steps){const v=step.equalXY3212View;
    if(v.line===18)total++;assert.equal(v.answer??0,total);assert.equal(v.decisions.filter(item=>item.counted).length,total);
    if(v.focus){const [r,c]=v.focus,expected=xyCount(grid,r,c);if(v.cell.readyX)assert.equal(v.prefixX[c],expected.x);if(v.cell.readyY)assert.equal(v.prefixY[c],expected.y);}
    if(v.line===17){const item=v.decisions.at(-1);assert.equal(item.equal,item.x===item.y);assert.equal(item.present,item.equal?item.x>0:null);assert.equal(item.accepted,item.x===item.y&&item.x>0);assert.equal(item.counted,false);}
    if(v.change)assert.equal(v.change.after,v.change.before+v.change.added);
  }}
});

test('1526 greedy operation counts match an exhaustive shortest-path search over incremented arrays',()=>{
  const samples=Array.from({length:100},()=>Array.from({length:1+rand(4)},()=>rand(4)));
  for(const target of samples)assert.equal(problems[1526].builder(target).answer,bfs(target),String(target));
  for(const [target,answer]of [[[1,2,3,2,1],3],[[3,1,1,2],4],[[3,1,5,4,2],7],[[3,3,3],3],[[5,4,3,2,1],5]])assert.equal(problems[1526].builder(target).answer,answer);
});

test('1526 one interval per layer reconstructs target and is counted only at its source addition',()=>{
  for(const target of targets){const run=problems[1526].builder(target);for(const step of run.steps){const v=step.incrementLayers1526View,known=v.operations.filter(op=>op.known);assert.equal(known.length,v.answer);assert.equal(v.contributions.reduce((sum,value)=>sum+(value??0),0),v.answer);if(v.change)assert.equal(v.change.after,v.change.before+v.change.added);}
    const last=run.steps.at(-1).incrementLayers1526View,initial=target.map(()=>0);
    for(const operation of last.operations){assert.ok(operation.start<=operation.end);for(let i=operation.start;i<=operation.end;i++){initial[i]++;assert.ok(initial[i]<=target[i]);}}
    assert.deepEqual(initial,target);assert.equal(last.operations.length,run.answer);
  }
});

test('3212 and 1526 every displayed line and local matches CPython, including exhausted and singleton loops',()=>{
  const python=`import sys,json
payload=json.load(sys.stdin)
out=[]
for problem in payload:
    ns={}
    exec(compile(problem['code'],'<lesson>','exec'),ns)
    runs=[]
    for argument in problem['cases']:
        pending={}
        rows=[]
        def trace(frame,event,arg):
            if frame.f_code.co_name!=problem['method']:return None
            if event in ('line','return'):
                if frame in pending:rows.append(json.loads(json.dumps({'line':pending[frame],'locals':{key:value for key,value in frame.f_locals.items() if key!='self'}})))
                if event=='line':pending[frame]=frame.f_lineno
                else:pending.pop(frame,None)
            return trace
        sys.settrace(trace)
        answer=getattr(ns['Solution'](),problem['method'])(argument)
        sys.settrace(None)
        runs.append({'answer':answer,'rows':rows})
    out.append(runs)
print(json.dumps(out))`;
  const specs=[[3212,'numberOfSubmatrices',grids,'equalXY3212View'],[1526,'minNumberOperations',targets,'incrementLayers1526View']];
  const output=spawnSync(process.env.PYTHON||'python3',['-c',python],{input:JSON.stringify(specs.map(([id,method,cases])=>({code:problems[id].code.join('\n'),method,cases}))),encoding:'utf8'});assert.equal(output.status,0,output.stderr);
  JSON.parse(output.stdout).forEach((runs,index)=>{const [id,,cases,key]=specs[index];runs.forEach((expected,i)=>{const actual=problems[id].builder(cases[i]);assert.equal(actual.answer,expected.answer);assert.deepEqual(actual.steps.map(step=>({line:step.codeLines[0],locals:step[key].locals})),expected.rows,`${id}/${i}`);assert.equal(actual.steps.filter(step=>step.final).length,1);});});
});

test('3212 and 1526 render every frame in VI/EN without mutating captures or leaking invalid values',()=>{
  const host={innerHTML:'',querySelectorAll:()=>[]},ctx={lang:'vi',$:()=>host,steps:[],stepIndex:0,escapeHtml:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')};vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-equal-xy-submatrices-3212.js'),'utf8'),ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-increment-layers-1526.js'),'utf8'),ctx);
  for(const [id,cases,renderer,key]of [[3212,grids,'renderEqualXY3212View','equalXY3212View'],[1526,targets,'renderIncrementLayers1526View','incrementLayers1526View']])for(const input of cases){ctx.steps=problems[id].builder(input).steps;const saved=JSON.stringify(ctx.steps);for(const lang of ['vi','en']){ctx.lang=lang;ctx.steps.forEach((step,index)=>{ctx.stepIndex=index;ctx[renderer](step);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);assert.match(host.innerHTML,new RegExp(`data-source-line="${step.codeLines[0]}"`));if(id===3212)assert.equal((host.innerHTML.match(/data-xy3212-cell=/g)||[]).length,input.length*input[0].length);else assert.equal((host.innerHTML.match(/data-layer-owner=/g)||[]).length,input.reduce((sum,x)=>sum+x,0));});}assert.equal(JSON.stringify(ctx.steps),saved);}
});

test('3212 and 1526 validate visual bounds and preserve official-size live arguments',()=>{
  const xy=problems[3212],layers=problems[1526];
  assert.deepEqual(xy.liveArgs('X,Y,.;Y,.,.'),[grids[0]]);assert.deepEqual(xy.liveArgs(JSON.stringify(grids[0])),[grids[0]]);
  for(const input of ['',[],[['x']],[['X'],['X','Y']],[Array(2)],'XY;','XX;YZ',Array.from({length:7},()=>['X'])])assert.throws(()=>xy.builder(input),/3212/);
  for(const input of ['',[],[true],[NaN],[-1],[1.5],[13],Array(11).fill(1),'1,,2'])assert.throws(()=>layers.builder(input),/1526/);
  assert.deepEqual(layers.liveArgs('[1,2,3]'),[[1,2,3]]);assert.equal(layers.liveArgs(Array(100000).fill(100000))[0].length,100000);assert.equal(xy.liveArgs(Array.from({length:1000},()=>['X']))[0].length,1000);
});
