'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[3286];

function damageOracle(grid) {
  const m=grid.length,n=grid[0].length,total=m*n;
  let cost=Array(total).fill(Infinity);cost[0]=grid[0][0];
  for(let turn=0;turn<total-1;turn++) {
    const next=cost.slice();
    for(let r=0;r<m;r++)for(let c=0;c<n;c++)for(const[dr,dc]of[[0,1],[1,0],[0,-1],[-1,0]]) {
      const nr=r+dr,nc=c+dc;
      if(nr>=0&&nr<m&&nc>=0&&nc<n)next[nr*n+nc]=Math.min(next[nr*n+nc],cost[r*n+c]+grid[nr][nc]);
    }
    if(next.every((value,i)=>value===cost[i]))break;
    cost=next;
  }
  return cost.at(-1);
}

function checkRoute(grid,health,result) {
  const v=result.steps.at(-1).safeWalk3286View;
  assert.equal(v.answer,result.answer);assert.equal(v.source.timing,'return');
  if(!result.answer) {assert.deepEqual(v.route,[]);assert.deepEqual(v.routeStates,[]);assert.deepEqual(v.hits,[]);return;}
  assert.deepEqual(v.route[0],[0,0]);assert.deepEqual(v.route.at(-1),[grid.length-1,grid[0].length-1]);
  assert.equal(new Set(v.route.map(cell=>cell.join(','))).size,v.route.length);
  let hp=health,hits=0;
  for(let i=0;i<v.routeStates.length;i++) {
    const[r,c,remaining]=v.routeStates[i];hp-=grid[r][c];hits+=grid[r][c];
    assert.equal(remaining,hp);assert.ok(hp>0);
    if(i)assert.equal(Math.abs(r-v.routeStates[i-1][0])+Math.abs(c-v.routeStates[i-1][1]),1);
  }
  assert.equal(hp,v.remainingHp);assert.equal(hits,v.hits.length);assert.equal(health-hp,hits);
}

test('3286 supports official examples, charges S/T, and requires strictly positive health',()=>{
  const cases=[
    [[[0,1,0,0,0],[0,1,0,1,0],[0,0,0,1,0]],1,true],
    [[[0,1,1,0,0,0],[1,0,1,0,0,0],[0,1,1,1,0,1],[0,0,1,0,1,0]],3,false],
    [[[1,1,1],[1,0,1],[1,1,1]],5,true],
    [[[1,1,1],[1,0,1],[1,1,1]],4,false],
    [[[1,0]],1,false],[[[1,0]],2,true],[[[0,1]],1,false],[[[0,1]],2,true],
    [[[0]],1,true],[[[1]],1,false],[[[1]],2,true],
  ];
  assert.equal(problem.debugMode,'line-by-line');
  for(const[grid,health,answer]of cases) {
    const original=JSON.stringify(grid),result=problem.builder(grid,{health});
    assert.equal(result.answer,answer,JSON.stringify({grid,health}));assert.equal(JSON.stringify(grid),original);
    checkRoute(grid,health,result);
    assert.equal(result.steps.filter(step=>step.final).length,1);
    for(const step of result.steps) {
      assert.deepEqual(step.codeLines,[step.safeWalk3286View.source.line]);
      assert.equal(problem.code[step.codeLines[0]-1],step.safeWalk3286View.source.text);
      assert.equal(step.note.vi,'');
    }
  }
});

test('3286 agrees with independent minimum-damage relaxation on all 2×2 grids and health boundaries',()=>{
  for(let mask=0;mask<16;mask++) {
    const values=Array.from({length:4},(_,i)=>(mask>>i)&1),grid=[values.slice(0,2),values.slice(2)];
    for(let health=1;health<=4;health++) {
      const result=problem.builder(grid,{health});
      assert.equal(result.answer,damageOracle(grid)<health,JSON.stringify({mask,health}));checkRoute(grid,health,result);
    }
  }
});

test('3286 traces actual damage, rejects hp=0, skips dominated states and records best improvements',()=>{
  const grid=[[0,1,0],[0,0,0],[0,0,0]],result=problem.builder(grid,{health:3});
  const views=result.steps.map(step=>step.safeWalk3286View),phases=new Set(views.map(v=>v.phase));
  for(const phase of ['damage','alive','improve','update','enqueue','dominated','stale-skip','outside'])assert.ok(phases.has(phase),phase);
  assert.ok(views.some(v=>v.updated.some(change=>change.before===-1&&change.after>0)));
  for(let i=0;i<views.length;i++) {
    const v=views[i],next=views[i+1];
    if(v.probe?.inside) {
      const[nr,nc]=v.probe.to;
      assert.equal(v.probe.cost,grid[nr][nc]);
      if(v.probe.nextHp!==null)assert.equal(v.probe.nextHp,v.locals.hp-grid[nr][nc]);
      if(v.phase==='parent'||v.phase==='enqueue')assert.equal(v.probe.bestHp,v.locals.nhp);
    }
    assert.ok(v.queue.every(([r,c,hp])=>r>=0&&r<3&&c>=0&&c<3&&hp>0));
    if(v.phase==='pop') {assert.deepEqual(next.current,v.queue[0].slice(0,2));assert.equal(next.queueSize,v.queueSize-1);}
    if(v.phase==='enqueue') {assert.equal(next.queueSize,v.queueSize+1);if(next.queueSize<=12)assert.deepEqual(next.queue.at(-1),[v.locals.nr,v.locals.nc,v.locals.nhp]);}
  }
  const dead=problem.builder('0,1',{health:1});assert.ok(dead.steps.some(step=>step.safeWalk3286View.phase==='dead'&&step.safeWalk3286View.probe.nextHp===0));
  const first=JSON.stringify(result.steps[0]);views.at(-1).cells[0][0].bestHp=99;assert.equal(JSON.stringify(result.steps[0]),first);
});

test('3286 completes large searches after the picture budget is exhausted',()=>{
  for(const[value,health,answer]of[[0,1,true],[1,100,true],[1,99,false]]) {
    const grid=Array.from({length:50},()=>Array(50).fill(value)),result=problem.builder(grid,{health}),v=result.steps.at(-1).safeWalk3286View;
    assert.equal(result.answer,answer);checkRoute(grid,health,result);
    assert.equal(v.trace.truncated,true);assert.ok(v.trace.events>1600);assert.ok(result.steps.length<=1601);
    assert.equal(v.trace.events,v.trace.captured+v.trace.omitted);assert.equal(v.cropped,true);assert.ok(v.cells.flat().length<=25);
    if(answer)assert.equal(v.route.length,99);
  }
});

test('3286 source runs in native CPython, including exact health-zero boundaries',()=>{
  const grids=[[[1,0]],[[0,1]],[[1,1,1],[1,0,1],[1,1,1]]],healths=[1,1,5];
  const source="import json,sys\np=json.load(sys.stdin)\nscope={}\nexec(p['code'],scope)\nprint(json.dumps([scope['Solution']().findSafeWalk(g,h) for g,h in zip(p['grids'],p['healths'])]))";
  const run=spawnSync(process.env.PYTHON||'python3',['-c',source],{input:JSON.stringify({code:problem.code.join('\n'),grids,healths}),encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);assert.deepEqual(JSON.parse(run.stdout),[false,false,true]);
});

test('3286 validates input/health and prepares both arguments for live editing',()=>{
  assert.deepEqual(problem.parseInput('1,0|0,1'),[[1,0],[0,1]]);
  assert.deepEqual(problem.liveArgs('[[1,0],[0,1]]',{health:3}),[[[1,0],[0,1]],3]);
  for(const bad of ['',[],[[]],[[0,2]],[[1],[0,1]],'[[0],',Array(2),[Array(51).fill(0)]])assert.throws(()=>problem.parseInput(bad),/3286/);
  for(const health of [0,-1,5,1.5,'oops'])assert.throws(()=>problem.builder('0,0|0,0',{health}),/health/);
  assert.ok(JSON.parse(fs.readFileSync(require.resolve('../vercel.json'),'utf8')).functions['server.js'].includeFiles.includes('problems/safe-walk-trace.py'));
});

test('3286 renders HP bars, hazard cells, the health queue, real routes and failures in both languages',()=>{
  const result=problem.builder('1,1,1|1,0,1|1,1,1',{health:5}),host={innerHTML:''};
  const context={lang:'vi',$:()=>host,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-safe-walk-3286.js'),'utf8'),context);
  for(const language of ['vi','en'])for(const step of [result.steps[0],result.steps.find(s=>s.safeWalk3286View.phase==='alive'),result.steps.at(-1)]) {
    context.lang=language;context.renderSafeWalk3286View(step);
    assert.match(host.innerHTML,/sw3286-grid/);assert.match(host.innerHTML,/role="meter"/);assert.match(host.innerHTML,/QUEUE · \(r,c,hp\)/);
    assert.doesNotMatch(host.innerHTML,/undefined|NaN|object Object/);
  }
  assert.match(host.innerHTML,/data-answer="true"/);assert.match(host.innerHTML,/hp 1 > 0/);assert.match(host.innerHTML,/sw3286-hits/);
  for(const[input,health]of[['1,0',1],['0,1',1]]) {
    context.renderSafeWalk3286View(problem.builder(input,{health}).steps.at(-1));
    assert.match(host.innerHTML,/data-answer="false"/);assert.doesNotMatch(host.innerHTML,/sw3286-route-link|sw3286-hits/);
  }
});
