'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const problem=require('../problems').SUPPORTED[2304];
const host={innerHTML:'',dataset:{},querySelector:()=>null,querySelectorAll:()=>[]},ctx={lang:'vi',$:()=>host};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-minimum-path-cost-2304.js'),'utf8'),ctx);
const plain=x=>JSON.parse(JSON.stringify(x)),presets=plain(vm.runInContext('MP2304_PRESETS',ctx));
const build=(grid,cost)=>problem.builder(grid,{moveCost:cost});
function oracle(grid,cost){const best=grid.map(row=>row.map(()=>Infinity));function visit(r,c,total){total+=grid[r][c];best[r][c]=Math.min(best[r][c],total);if(r+1<grid.length)for(let next=0;next<grid[0].length;next++)visit(r+1,next,total+cost[grid[r][c]][next]);}for(let c=0;c<grid[0].length;c++)visit(0,c,0);return best;}
let seed=2304;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
const samples=[...presets];
for(let k=0;k<15;k++){const rows=2+rand(3),cols=2+rand(2),values=Array.from({length:rows*cols},(_,i)=>i);for(let i=values.length-1;i>0;i--){const j=rand(i+1);[values[i],values[j]]=[values[j],values[i]];}samples.push({grid:Array.from({length:rows},(_,r)=>values.slice(r*cols,(r+1)*cols)),moveCost:values.map(()=>Array.from({length:cols},()=>1+rand(10)))});}

test('2304 matches exhaustive paths and settled DP costs for both examples and shuffled grids',()=>{
  assert.equal(build(presets[0].grid,presets[0].moveCost).answer,17);assert.equal(build(presets[1].grid,presets[1].moveCost).answer,6);
  for(const {grid,moveCost}of samples){const expected=oracle(grid,moveCost),r=build(grid,moveCost);assert.equal(r.answer,Math.min(...expected.at(-1)));
    for(const step of r.steps){const v=step.minPathCost2304View;assert.equal(step.codeLines[0],v.line);assert.equal(problem.code[v.line-1].trim(),v.sourceText);assert.equal(v.trace.truncated,false);if(v.dp)for(let row=0;row<=v.readyRows;row++)assert.deepEqual(v.dp[row],expected[row]);}
    const v=r.steps.at(-1).minPathCost2304View;assert.equal(v.history.length,(grid.length-1)*grid[0].length**2);assert.equal(ctx.mp2304Sum(v,v.path),r.answer);assert.equal(v.path.length,grid.length);
  }
});

test('2304 transitions charge the source VALUE and destination COLUMN, count target cells once and expose pending parent writes',()=>{
  for(const {grid,moveCost}of samples.slice(0,7)){const r=build(grid,moveCost);for(const step of r.steps){const v=step.minPathCost2304View;if(v.candidate===null)continue;const [row,col]=v.source,[nextRow,nextCol]=v.target;
    assert.equal(nextRow,row+1);assert.equal(v.stepCost,moveCost[grid[row][col]][nextCol]);assert.equal(v.candidate,v.dp[row][col]+v.stepCost+grid[nextRow][nextCol]);assert.equal(ctx.mp2304Sum(v,v.candidatePath),v.candidate);
    if(v.phase==='keep'){assert.ok(v.before!==null&&v.candidate>=v.before);assert.equal(v.dp[nextRow][nextCol],v.before);}
    if(v.phase==='improve')assert.ok(v.before===null||v.candidate<v.before);
    if(v.phase==='write'){assert.equal(v.dp[nextRow][nextCol],v.candidate);assert.equal(v.pendingParent,true);}
    if(v.phase==='accept'){assert.equal(v.parent[nextRow][nextCol],col);assert.equal(v.dp[nextRow][nextCol],v.candidate);}
  }}
});

test('2304 permits any start column, ignores last-row outgoing costs and resolves equal paths deterministically',()=>{
  const trap=build(presets[2].grid,presets[2].moveCost);assert.equal(trap.answer,4);assert.deepEqual(trap.steps.at(-1).minPathCost2304View.path,[[0,1],[1,0]]);
  const {grid,moveCost}=presets[0],other=moveCost.map(row=>[...row]);for(const value of grid.at(-1))other[value]=Array(grid[0].length).fill(100);assert.equal(build(grid,other).answer,17);
  const tied=build([[0,1],[2,3]],[[4,3],[3,2],[99,99],[99,99]]);assert.equal(tied.answer,6);assert.deepEqual(tied.steps.at(-1).minPathCost2304View.path,[[0,0],[1,0]]);
});

test('2304 final exploration reconstructs the cheapest route to every destination without changing the global answer',()=>{
  for(const {grid,moveCost}of samples){const r=build(grid,moveCost),v=r.steps.at(-1).minPathCost2304View,before=JSON.stringify(v);for(let col=0;col<v.cols;col++){const scene=ctx.mp2304Scene(v,col);assert.equal(scene.selectedEnd,col);assert.equal(scene.routeCost,v.dp.at(-1)[col]);assert.equal(scene.path.length,v.rows);assert.equal(scene.path.at(-1)[1],col);}assert.equal(JSON.stringify(v),before);}
});

test('2304 renders every recorded grid value and dp state in VI and EN without mutating frozen snapshots',()=>{
  function freeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);for(const v of Object.values(x))freeze(v);}return x;}
  for(const {grid,moveCost}of samples.slice(0,7)){const r=freeze(build(grid,moveCost)),before=JSON.stringify(r);ctx.steps=r.steps;
    for(const language of['vi','en']){ctx.lang=language;r.steps.forEach((step,i)=>{ctx.stepIndex=i;ctx.renderMinimumPathCost2304(step);const v=step.minPathCost2304View;assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity|object Object/);assert.equal((host.innerHTML.match(/data-mp2304-cell=/g)||[]).length,v.rows*v.cols);
      const actual=[...host.innerHTML.matchAll(/data-row="(\d+)" data-col="(\d+)" data-value="(\d+)" data-dp="([^"]+)"/g)];for(const [,r,c,value,dp]of actual){assert.equal(Number(value),v.grid[r][c]);assert.equal(dp,v.dp?v.dp[r][c]===null?'inf':String(v.dp[r][c]):'—');}
    });}
    assert.equal(JSON.stringify(r),before);ctx.stepIndex=0;ctx.renderMinimumPathCost2304(r.steps[0]);const first=host.innerHTML;ctx.renderMinimumPathCost2304(r.steps.at(-1));ctx.renderMinimumPathCost2304(r.steps[0]);assert.equal(host.innerHTML,first);
  }
});

test('2304 accepts JSON and semicolon matrices, rejects malformed values and enforces readable visualization limits',()=>{
  assert.equal(problem.builder('5,3;4,0;2,1',{moveCost:'9,8;1,5;10,12;18,6;2,4;14,3'}).answer,17);
  const badGrids=['',null,'[[0]]','[[0,1],[2]]','0,;2,3',[[0,0],[2,3]],[[0,1],[2,4]],[[0.5,1],[2,3]],Array.from({length:7},(_,r)=>[r*2,r*2+1])];for(const grid of badGrids)assert.throws(()=>build(grid,[[1,1],[1,1],[1,1],[1,1]]),/2304/);
  for(const cost of['oops',[[1,1]],[[1,1,1],[1,1,1],[1,1,1],[1,1,1]],[[0,1],[1,1],[1,1],[1,1]],[[101,1],[1,1],[1,1],[1,1]]])assert.throws(()=>build([[0,1],[2,3]],cost),/2304/);
  const grid=Array.from({length:6},(_,r)=>Array.from({length:5},(_,c)=>r*5+c)),cost=grid.flat().map(value=>Array.from({length:5},(_,c)=>1+(value+c)%9)),r=build(grid,cost);assert.equal(r.steps.at(-1).minPathCost2304View.trace.truncated,false);assert.equal(r.answer,Math.min(...oracle(grid,cost).at(-1)));
});

test('2304 Python source, live arguments and sample answers agree with the repository solution',()=>{
  const path=require.resolve('../../Leetcode-sln/dynamic-programming/Leetcode_2304.py');assert.equal(fs.readFileSync(path,'utf8').trim(),problem.code.join('\n'));
  const script="import json,sys,runpy\np=json.load(sys.stdin)\ns=runpy.run_path(p['path'])['Solution']()\nprint(json.dumps([s.minPathCost(x['grid'],x['moveCost']) for x in p['samples']]))\ngrid=[[r*50+c for c in range(50)] for r in range(50)]\nassert s.minPathCost(grid,[[1]*50 for _ in range(2500)])==61299";
  const r=spawnSync(process.env.PYTHON||'python3',['-c',script],{encoding:'utf8',input:JSON.stringify({path,samples})});assert.equal(r.status,0,r.stderr);assert.deepEqual(JSON.parse(r.stdout),samples.map(x=>Math.min(...oracle(x.grid,x.moveCost).at(-1))));
  assert.deepEqual(problem.liveArgs(JSON.stringify(presets[0].grid),{moveCost:JSON.stringify(presets[0].moveCost)}),[presets[0].grid,presets[0].moveCost]);
});

test('2304 registers one lazy theme-aware renderer and includes all demonstration cases',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');for(const asset of['renderer-minimum-path-cost-2304.js','minimum-path-cost-2304.css'])assert.equal(html.split(asset+'?').length-1,1);
  const css=fs.readFileSync(require.resolve('../public/minimum-path-cost-2304.css'),'utf8');assert.match(css,/\[data-theme="light"\]/);assert.match(css,/@media\(max-width:480px\)/);assert.equal(problem.category.key,'dp');
  for(const p of presets)assert.ok(build(p.grid,p.moveCost).steps.at(-1).final);
});
