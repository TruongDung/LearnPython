'use strict';

const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[2290];

function oracle(grid) {
  const m=grid.length,n=grid[0].length,total=m*n;
  let dist=Array(total).fill(Infinity);dist[0]=0;
  for(let turn=0;turn<total-1;turn++) {
    const next=dist.slice();
    for(let r=0;r<m;r++)for(let c=0;c<n;c++)for(const[dr,dc]of[[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr=r+dr,nc=c+dc;
      if(nr>=0&&nr<m&&nc>=0&&nc<n)next[nr*n+nc]=Math.min(next[nr*n+nc],dist[r*n+c]+grid[nr][nc]);
    }
    if(next.every((value,i)=>value===dist[i]))break;
    dist=next;
  }
  return dist.at(-1);
}

function verifyRoute(grid,result) {
  const v=result.steps.at(-1).obstacle2290View;
  assert.equal(v.final,true);assert.equal(v.answer,result.answer);
  assert.deepEqual(v.route[0],[0,0]);assert.deepEqual(v.route.at(-1),[grid.length-1,grid[0].length-1]);
  assert.equal(new Set(v.route.map(cell=>cell.join(','))).size,v.route.length);
  for(let i=1;i<v.route.length;i++)assert.equal(Math.abs(v.route[i][0]-v.route[i-1][0])+Math.abs(v.route[i][1]-v.route[i-1][1]),1);
  const removed=v.route.slice(1).filter(([r,c])=>grid[r][c]===1);
  assert.deepEqual(v.removed,removed);assert.equal(v.removed.length,result.answer);
}

test('2290 executes the displayed 0-1 BFS and preserves official examples and zero-length paths',()=>{
  assert.equal(problem.debugMode,'line-by-line');
  assert.equal(problem.complexity.time,'O(MN)');
  for(const[grid,answer]of[[[[0]],0],[[[0,0]],0],[[[0],[1],[0]],1],[[[0,1,1],[1,1,0],[1,1,0]],2],[[[0,1,0,0,0],[0,1,0,1,0],[0,0,0,1,0]],0]]) {
    const original=JSON.stringify(grid),result=problem.builder(grid);
    assert.equal(result.answer,answer);assert.equal(JSON.stringify(grid),original);verifyRoute(grid,result);
    assert.equal(result.steps.filter(step=>step.final).length,1);
    for(const step of result.steps) {
      assert.deepEqual(step.codeLines,[step.obstacle2290View.source.line]);
      assert.equal(step.obstacle2290View.source.text,problem.code[step.codeLines[0]-1]);
      assert.equal(step.codeBlock,1);assert.equal(step.note.vi,'');
    }
  }
});

test('2290 matches an independent oracle on every 3×3 binary grid with empty endpoints',()=>{
  for(let mask=0;mask<128;mask++) {
    const values=[0,...Array.from({length:7},(_,i)=>(mask>>i)&1),0];
    const grid=[values.slice(0,3),values.slice(3,6),values.slice(6)];
    const result=problem.builder(grid);
    assert.equal(result.answer,oracle(grid),`mask=${mask}`);verifyRoute(grid,result);
  }
});

test('2290 uses destination costs and shows accurate BEFORE-line distance/deque states',()=>{
  const result=problem.builder(problem.defaultInput),views=result.steps.map(step=>step.obstacle2290View);
  assert.ok(views.some(v=>v.probe?.weight===0));assert.ok(views.some(v=>v.probe?.weight===1));
  assert.ok(views.some(v=>v.updated.some(update=>update.before==='∞'&&update.after===1)));
  for(let i=0;i<views.length;i++) {
    const v=views[i],source=v.source.text.trim();
    if(v.probe?.direction) {
      const [nr,nc]=v.probe.to;
      assert.equal(v.probe.weight,result.original[nr][nc]);
    }
    if(source==='nd = cost + w')assert.equal(v.locals.w,result.original[v.locals.nr][v.locals.nc]);
    if(source==='if nd < dist[nr][nc]:')assert.equal(v.locals.nd,v.locals.cost+v.locals.w);
    if(source.startsWith('parent['))assert.equal(v.cells.flat().find(cell=>cell.r===v.locals.nr&&cell.c===v.locals.nc).distance,v.locals.nd);
    if(source.startsWith('dq.append')&&views[i+1]) {
      const q=views[i+1].queue,entry=[v.locals.nd,v.locals.nr,v.locals.nc];
      assert.equal(views[i+1].queueSize,v.queueSize+1);
      if(source.startsWith('dq.appendleft'))assert.deepEqual(q[0],entry);
      else if(views[i+1].queueSize<=12)assert.deepEqual(q.at(-1),entry);
    }
    assert.equal(v.source.timing,v.final?'return':'before');
  }
  const first=JSON.stringify(result.steps[0]);views.at(-1).cells[0][0].distance=100;
  assert.equal(JSON.stringify(result.steps[0]),first);
});

test('2290 displayed source also runs in native CPython',()=>{
  const grids=[[[0]],[[0,1,0]],[[0,1,1],[1,1,0],[1,1,0]],[[0,1,0,0,0],[0,1,0,1,0],[0,0,0,1,0]]];
  const source="import json,sys\np=json.load(sys.stdin)\nscope={}\nexec(p['code'],scope)\nprint(json.dumps([scope['Solution']().minimumObstacles(grid) for grid in p['grids']]))";
  const python=spawnSync(process.env.PYTHON||'python3',['-c',source],{input:JSON.stringify({code:problem.code.join('\n'),grids}),encoding:'utf8'});
  assert.equal(python.status,0,python.stderr);assert.deepEqual(JSON.parse(python.stdout),grids.map(oracle));
});

test('2290 supports the 100,000-cell limit with bounded pictures and a complete path',()=>{
  const row=Array(100000).fill(1);row[0]=row[row.length-1]=0;
  const result=problem.builder([row]),v=result.steps.at(-1).obstacle2290View;
  assert.equal(result.answer,99998);verifyRoute([row],result);
  assert.ok(result.steps.length<=1601);assert.equal(v.trace.truncated,true);assert.equal(v.trace.events,v.trace.captured+v.trace.omitted);
  assert.equal(v.cropped,true);assert.ok(v.cells.flat().length<=25);
  assert.equal(v.route.length,100000);assert.equal(v.removed.length,99998);
});

test('2290 validates rectangular binary grids and exposes parsed grid arguments for live debugging',()=>{
  assert.deepEqual(problem.parseInput('0,1|1,0'),[[0,1],[1,0]]);
  assert.deepEqual(problem.parseInput('[[0,1],[1,0]]'),[[0,1],[1,0]]);
  assert.deepEqual(problem.liveArgs('0,1;1,0'),[[[0,1],[1,0]]]);
  for(const input of ['',[],[[]],[[1]],[[0,1]],[[0],[0,1]],[[0,2,0]],'[[0],','0,;0,0',[[0,NaN,0]],Array(2),[Array(100001).fill(0)]])assert.throws(()=>problem.parseInput(input),/2290/);
});

test('2290 renderer shows obstacles, input weights, the deque and crossed-out removed obstacles',()=>{
  const result=problem.builder(problem.defaultInput),host={innerHTML:''};
  const context={lang:'vi',$:()=>host,escapeHtml:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-minimum-obstacle-removal-2290.js'),'utf8'),context);
  const samples=[result.steps[0],result.steps.find(step=>step.obstacle2290View.probe?.weight===1),result.steps.find(step=>step.obstacle2290View.probe?.weight===0),result.steps.at(-1)];
  for(const lang of ['vi','en'])for(const step of samples) {
    context.lang=lang;context.renderObstacleRemoval2290View(step);
    assert.match(host.innerHTML,/ob2290-grid/);assert.match(host.innerHTML,/ob2290-deque/);assert.match(host.innerHTML,/ob2290-bricks/);
    assert.doesNotMatch(host.innerHTML,/undefined|NaN|object Object/);
  }
  assert.equal((host.innerHTML.match(/class="ob2290-cell [^"]*removed/g)||[]).length,2);
  assert.match(host.innerHTML,/data-answer="2"/);
  const noRemoval=problem.builder('0,0|0,0');context.renderObstacleRemoval2290View(noRemoval.steps.at(-1));
  assert.match(host.innerHTML,/No removals needed/);assert.doesNotMatch(host.innerHTML,/class="ob2290-cell [^"]*removed/);
});
