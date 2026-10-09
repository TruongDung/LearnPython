const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[2328];
const MOD = 1000000007;
const directions = [[1,0],[-1,0],[0,1],[0,-1]];
function enumerate(grid) {
  const paths = new Set(), dp = grid.map(row=>row.map(()=>0));
  function visit(path) {
    paths.add(JSON.stringify(path));
    const [sr,sc]=path[0]; dp[sr][sc]++;
    const [r,c]=path.at(-1);
    for(const [dr,dc] of directions) {
      const nr=r+dr,nc=c+dc;
      if(grid[nr]?.[nc]>grid[r][c]) visit([...path,[nr,nc]]);
    }
  }
  grid.forEach((row,r)=>row.forEach((_,c)=>visit([[r,c]])));
  return {answer:paths.size,dp,paths};
}
test('2328 counts distinct cell sequences, single cells, and every branch',()=>{
  for(const [grid,answer] of [[[[1,1],[3,4]],8],[[[1],[2]],3],[[[5]],1],[[[7,7],[7,7]],4],[[[2,1,2],[3,2,3]],17]]) {
    const oracle=enumerate(grid),actual=problem.builder(grid);
    assert.equal(actual.answer,oracle.answer);assert.deepEqual(actual.dp,oracle.dp);assert.equal(actual.answer,answer);
  }
  for(let seed=1;seed<=60;seed++) {
    let value=seed;const grid=Array.from({length:3},()=>Array.from({length:3},()=>{value=(value*1664525+1013904223)>>>0;return value%5+1;}));
    const expected=enumerate(grid),actual=problem.builder(grid);
    assert.equal(actual.answer,expected.answer);assert.deepEqual(actual.dp,expected.dp);
  }
});
test('2328 trace reuses completed larger neighbors and accounts for each root once',()=>{
  const grid=[[1,1],[3,4]],result=problem.builder(grid),totals=[];
  assert.equal(result.steps[0].increasingPaths2328View.window[0][0].count,null);
  for(const step of result.steps) {
    const v=step.increasingPaths2328View;
    assert.ok(step.codeLines.every(line=>line>=1&&line<=problem.code.length));
    for(const row of v.window) for(const cell of row) assert.equal(cell.value,grid[cell.r][cell.c]);
    if(v.phase==='add') {
      const [r,c]=v.current,[nr,nc]=v.neighbor;
      assert.ok(grid[nr][nc]>grid[r][c]);
      const child=v.window.flat().find(cell=>cell.r===nr&&cell.c===nc);
      assert.equal(child.completed,true);assert.equal(child.count,v.calculation.child);
      assert.equal(v.calculation.after,(v.calculation.before+v.calculation.child)%MOD);
    }
    if(v.phase==='total') {totals.push(v.current.join(','));assert.equal(v.res,(v.calculation.before+v.calculation.cellCount)%MOD);}
  }
  assert.equal(new Set(totals).size,4);
  const last=result.steps.at(-1).increasingPaths2328View;
  assert.equal(last.answer,8);assert.equal(last.processed,4);
  const paths=new Set(last.examplePaths.map(path=>JSON.stringify(path.map(cell=>[cell.r,cell.c]))));
  assert.deepEqual(paths,enumerate(grid).paths);
  const order=result.steps.find(step=>step.increasingPaths2328View.phase==='sort').increasingPaths2328View.order;
  assert.deepEqual(order.map(cell=>[cell.value,cell.r,cell.c]),[[4,1,1],[3,1,0],[1,0,1],[1,0,0]]);
  assert.equal(result.steps.find(step=>step.increasingPaths2328View.phase==='init').increasingPaths2328View.window[0][0].count,1);
});
test('2328 handles full constraints with bounded trace and no recursion',()=>{
  const grid=Array.from({length:100},()=>Array(1000).fill(100000));
  const result=problem.builder(grid);
  assert.equal(result.answer,100000);assert.ok(result.steps.length<=601);
  assert.equal(result.steps.at(-1).increasingPaths2328View.processed,100000);
  assert.ok(result.steps.at(-1).increasingPaths2328View.omitted>0);
  assert.ok(JSON.stringify(result).length<8000000);
  for(const step of result.steps) { const v=step.increasingPaths2328View;assert.ok(v.window.length<=6&&v.window.every(row=>row.length<=6)); }
  assert.equal(problem.builder([Array.from({length:1000},(_,i)=>i+1)]).answer,500500);
  assert.equal(grid[0][0],100000);
});
test('2328 modulo agrees with independent BigInt DP counting paths by ending cell',()=>{
  const grid=Array.from({length:35},(_,r)=>Array.from({length:35},(_,c)=>r*35+c+1));
  const ending=grid.map(row=>row.map(()=>1n));let sum=0n;
  for(let r=0;r<35;r++) for(let c=0;c<35;c++) {
    if(r) ending[r][c]+=ending[r-1][c];if(c) ending[r][c]+=ending[r][c-1];sum+=ending[r][c];
  }
  assert.ok(sum>BigInt(MOD));assert.equal(problem.builder(grid).answer,Number(sum%BigInt(MOD)));
});
test('2328 accepts both input formats and rejects invalid grids',()=>{
  for(const input of ['1,1;3,4','1,1|3,4','[[1,1],[3,4]]']) {assert.equal(problem.builder(input).answer,8);assert.deepEqual(problem.liveArgs(input),[[[1,1],[3,4]]]);}
  for(const input of ['',null,[],[[1],[]],[[0]],[[100001]],[[1.5]],'1,;2,3','[invalid',Array.from({length:1001},()=>[1]),Array.from({length:101},()=>Array(1000).fill(1))]) assert.throws(()=>problem.builder(input),/2328/);
});
test('2328 Python source and bilingual renderer support all trace phases',()=>{
  const source=fs.readFileSync(require.resolve('../../Leetcode-sln/dp/Leetcode_2328.py'),'utf8').replace(/\r\n/g,'\n').trimEnd();
  assert.equal(source,problem.code.join('\n'));
  const run=spawnSync('python3',['-c',source+'\nassert Solution().countPaths([[1,1],[3,4]]) == 8\nassert Solution().countPaths([[1],[2]]) == 3\nassert Solution().countPaths([list(range(1,1001))]) == 500500'],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);
  const element={innerHTML:''},context={lang:'en',$:()=>element,escapeHtml:value=>String(value).replace(/</g,'&lt;'),pick:value=>value[context.lang]};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-increasing-paths-2328.js'),'utf8'),context);
  for(const language of ['vi','en']) {context.lang=language;for(const input of ['1,1;3,4','1;2','7,7;7,7',[Array.from({length:15},(_,i)=>i+1)]]) for(const step of problem.builder(input).steps) {
    context.renderIncreasingPaths2328View(step);assert.doesNotMatch(element.innerHTML,/undefined|NaN|object Object/);assert.match(element.innerHTML,/ip2328-viz/);
  }}
  assert.match(fs.readFileSync(require.resolve('../public/index.html'),'utf8'),/renderer-increasing-paths-2328.js/);
  assert.match(fs.readFileSync(require.resolve('../public/script.js'),'utf8'),/Boolean\(step.increasingPaths2328View\)/);
});
