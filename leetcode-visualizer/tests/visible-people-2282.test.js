'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs'), vm = require('node:vm');
const p = require('../problems').SUPPORTED[2282];
const run = (input = p.defaultInput) => p.builder(input);
const view = step => step.visiblePeople2282View;
let seed = 2282;
function rand(n) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; }
function visible(grid, cell, target) {
  const [r,c] = cell, [nr,nc] = target;
  if (!(r === nr && nc > c || c === nc && nr > r)) return false;
  const dr = nr === r ? 0 : 1, dc = nc === c ? 0 : 1;
  for (let a=r+dr,b=c+dc;a!==nr||b!==nc;a+=dr,b+=dc) if (grid[a][b] >= Math.min(grid[r][c],grid[nr][nc])) return false;
  return true;
}
function oracle(grid) {
  return grid.map((row,r)=>row.map((_,c)=>grid.reduce((sum,line,nr)=>sum+line.filter((_,nc)=>visible(grid,[r,c],[nr,nc])).length,0)));
}
function ui(lang='vi',extra={}) {
  const host={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang,document:{getElementById:()=>host},...extra};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-visible-people-2282.js'),'utf8'),ctx);
  return {ctx,render(step){ctx.renderVisiblePeople2282(step);return host.innerHTML;}};
}
test('2282 replaces the generic template with complete Python replay and a matrix answer',()=>{
  const r=run();assert.equal(p.debugMode,'line-by-line');assert.equal(p.premium,true);assert.equal(p.difficulty,'medium');
  assert.equal(p.complexity.time,'O(mn)');assert.equal(p.complexity.space,'O(mn)');
  assert.deepEqual(r.answer,oracle([[3,1,4],[2,5,1],[6,2,3]]));assert.equal(r.steps.filter(s=>s.final).length,1);
  assert.equal(view(r.steps.at(-1)).trace.truncated,false);
  assert.ok(r.steps.some(s=>view(s).scope==='scan'&&view(s).returning&&!s.final));
  for(const s of r.steps){const v=view(s);assert.deepEqual(s.codeLines,[v.source.line]);assert.equal(p.code[v.source.line-1].trim(),v.source.text);}
});
test('visible counts agree with direct endpoint/intermediate-height checks for duplicates and random grids',()=>{
  const cases=[[[5,3,3]],[[3,3,3]],[[3,3],[3,3]],[[10,6,8,5,11,9]],[[1],[2],[3],[4]],[[7]],
    [[100000,1,100000,1,100000]],Array.from({length:6},()=>Array(6).fill(100000))];
  for(let t=0;t<45;t++){const rows=1+rand(6),cols=1+rand(6);cases.push(Array.from({length:rows},()=>Array.from({length:cols},()=>1+rand(5))));}
  for(const grid of cases){
    const result=run(grid);assert.deepEqual(result.answer,oracle(grid),JSON.stringify(grid));
  }
  assert.deepEqual(run('5,3,3').answer,[[1,1,0]]);
  assert.deepEqual(run('3,3;3,3').answer,[[2,1],[1,0]]);
});
test('displayed Python passes exhaustive small sequences against a brute-force oracle in both orientations',()=>{
  const code=`from itertools import product\n${p.code.join('\n')}\nfor n in range(1,8):\n for a in product(range(1,4),repeat=n):\n  expected=[sum(all(a[k]<min(a[i],a[j]) for k in range(i+1,j)) for j in range(i+1,n)) for i in range(n)]\n  assert Solution().seePeople([list(a)])==[expected],a\n  assert Solution().seePeople([[x] for x in a])==[[x] for x in expected],a\nprint('passed')`;
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',code],{encoding:'utf8'});assert.equal(ref.status,0,ref.stderr);
});
test('every counted pair is visible, each matrix update is native, and row/down contributions add up',()=>{
  for(const input of [p.defaultInput,'5,3,3','10,6,8,5,11,9','3,3;3,3']){
    const r=run(input);let previous=null;
    for(const s of r.steps){const v=view(s);
      assert.deepEqual(v.answer,v.locals.answer??v.outer.answer??null);
      assert.deepEqual(v.stack,v.locals.stack??null);
      if(v.answer)for(let a=0;a<v.grid.length;a++)for(let b=0;b<v.grid[0].length;b++)assert.equal(v.answer[a][b],v.right[a][b]+v.down[a][b]);
      for(const edge of v.ledger){assert.ok(visible(v.grid,edge.cell,edge.target));assert.equal(edge.after,edge.before+1);assert.equal(edge.phase==='row',edge.cell[0]===edge.target[0]);}
      if(v.change?.kind==='count'){const c=v.change,expected=previous.answer.map(row=>[...row]);expected[c.cell[0]][c.cell[1]]++;assert.deepEqual(v.answer,expected);assert.equal(v.source.text,'answer[r][c] += 1');}
      if(['pop','equal'].includes(v.change?.kind)){assert.deepEqual(v.answer,previous.answer);assert.equal(v.stack.length,previous.stack.length-1);}
      if(v.change?.kind==='push')for(let i=1;i<v.stack.length;i++)assert.ok(v.grid[v.stack[i-1][0]][v.stack[i-1][1]]>v.grid[v.stack[i][0]][v.stack[i][1]]);
      previous=v;
    }
    const v=view(r.steps.at(-1)),keys=v.ledger.map(e=>JSON.stringify([e.cell,e.target]));assert.equal(new Set(keys).size,keys.length);
    assert.equal(v.settled.length,v.grid.length*v.grid[0].length*2);
  }
});
test('equal-height removal preserves the count and keeps the nearer candidate for later observers',()=>{
  const r=run('5,3,3'),removed=r.steps.filter(s=>view(s).change?.kind==='equal');assert.equal(removed.length,1);
  const v=view(removed[0]);assert.deepEqual(v.current,[0,1]);assert.deepEqual(v.change.cell,[0,2]);assert.equal(v.answer[0][1],1);assert.deepEqual(v.stack,[]);
  const last=view(r.steps.at(-1));assert.ok(!last.ledger.some(e=>e.cell[1]===0&&e.target[1]===2));
});
test('source lines, closures, suspended comprehension frames and branches match CPython',()=>{
  const inputs=[p.defaultInput,'5,3,3','1;2;3'],items=inputs.map(p.tracePayload);
  const script="import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f(x)) for x in p['items']]))";
  const ref=spawnSync(process.env.PYTHON||'python3',['-c',script],{input:JSON.stringify({path:require.resolve('../problems/picture-trace.py'),items}),encoding:'utf8',maxBuffer:64e6});assert.equal(ref.status,0,ref.stderr);
  JSON.parse(ref.stdout).forEach((native,i)=>{const r=run(inputs[i]);assert.deepEqual(r.answer,native.answer);assert.equal(r.steps.length,native.events.length);
    native.events.forEach((e,j)=>{const s=r.steps[j],v=view(s);assert.deepEqual(s.codeLines,[e.line]);for(const key of ['locals','outer','frames','scope','branch','returning','returned'])assert.deepEqual(v[key],e[key],`${i}/${j}/${key}`);for(const variable of s.vars)assert.deepEqual(variable.rawValue,e.locals[variable.name]);});
  });
});
test('all presets render every frame in VI/EN, keep snapshots immutable, and rewind deterministically',()=>{
  const cases=vm.runInContext('VP2282_CASES',ui().ctx).map(c=>c[0]);cases.push(Array.from({length:6},()=>Array(6).fill(100000)));
  for(const input of cases){const r=run(input),saved=JSON.stringify(r.steps);for(const lang of ['vi','en']){
    const renderer=ui(lang,{steps:r.steps,stepIndex:0}),first=renderer.render(r.steps[0]);
    for(let i=0;i<r.steps.length;i++){const s=r.steps[i],v=view(s);renderer.ctx.stepIndex=i;const html=renderer.render(s);
      assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object/);assert.ok(html.includes(`data-source-line="${v.source.line}"`));
      for(let a=0;a<v.grid.length;a++)for(let b=0;b<v.grid[0].length;b++)assert.ok(html.includes(`data-cell-r="${a}" data-cell-c="${b}" data-height="${v.grid[a][b]}" data-count="${v.answer?.[a]?.[b]??''}"`));
    }
    renderer.ctx.stepIndex=0;assert.equal(renderer.render(r.steps[0]),first);
  }assert.equal(JSON.stringify(r.steps),saved);}
});
test('grid parser rejects malformed, sparse and oversized input; live editor uses the same matrix',()=>{
  for(const input of ['',[],[[]],Array(2),'1,,2','1,2;3','1,2;','[1,2]',[[0]],[[100001]],[[true]],[[1.5]],[[null]],[[NaN]],Array.from({length:7},()=>[1]),[Array(2)],[[1,2],[3]]]){
    assert.throws(()=>run(input));assert.throws(()=>p.liveArgs(input));
  }
  const grid=[[3,1],[2,4]],saved=JSON.stringify(grid);run(grid);assert.equal(JSON.stringify(grid),saved);
  for(const input of [grid,'3,1;2,4','[[3,1],[2,4]]','3,1\n2,4'])assert.deepEqual(p.liveArgs(input),[grid]);
});
test('jump controls select actual source events and disable unavailable future actions',()=>{
  const r=run('5,3,3'),renderer=ui('vi',{steps:r.steps,stepIndex:0,stopPlay(){},renderStep(){}});
  for(const kind of ['line','pop','count','equal','pass','result']){
    renderer.ctx.stepIndex=0;const next=renderer.ctx.vp2282Next(kind);assert.ok(next>0);renderer.ctx.vp2282Go(next);assert.equal(renderer.ctx.stepIndex,next);
    if(!['line','result'].includes(kind))assert.equal(view(r.steps[next]).change.kind,kind);
  }
  renderer.ctx.stepIndex=r.steps.length-1;for(const kind of ['line','pop','count','equal','pass','result'])assert.equal(renderer.ctx.vp2282Next(kind),-1);
});
