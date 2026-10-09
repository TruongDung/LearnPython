const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[2328];
const MOD = 1000000007;
test('2328 DFS is a separately selectable solution with the supplied Python code', () => {
  assert.deepEqual(problem.extraParams.find(p=>p.key==='approach').options.map(o=>o.value),[1,2,3]);
  const source = fs.readFileSync(require.resolve('../../Leetcode-sln/dp/Leetcode_2328_dfs.py'),'utf8').replace(/\r\n/g,'\n').trimEnd();
  assert.equal(source,'from typing import List\n\n'+problem.code2.join('\n'));
  assert.equal(problem.code2[1],'    def countPaths(self, grid: List[List[int]]) -> int:');
  assert.equal(problem.code2[22],'                    count += dfs(nr, nc)');
  assert.equal(problem.code2[24],'            dp[r][c] = count % MOD');
  assert.equal(problem.code2[31],'                ans = (ans + dfs(r, c)) % MOD');
  const cases = [[[1,1],[3,4]],[[1],[2]],[[8,8],[8,8]],[[1]],[[1,2,3],[6,5,4]]];
  for(let seed=1;seed<=40;seed++) {
    let x=seed;cases.push(Array.from({length:3},()=>Array.from({length:3},()=>{x=(x*1664525+1013904223)>>>0;return x%6+1;})));
  }
  const checks = cases.map(grid=>{const a=problem.builder(grid),b=problem.builder2(grid);assert.equal(b.answer,a.answer);assert.deepEqual(b.dp,a.dp);return `assert Solution().countPaths(${JSON.stringify(grid)}) == ${a.answer}`;});
  const run=spawnSync('python3',['-c',source+'\n'+checks.join('\n')],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);
});
test('2328 DFS trace preserves parent counts until children return and caches only complete results', () => {
  const result=problem.builder2('1,1;3,4'),writes=new Set(),roots=new Set();let ans=0,returns=[],hasNested=false;
  for(const [i,step] of result.steps.entries()) {
    const v=step.increasingPaths2328View;
    assert.equal(step.codeBlock,2);assert.ok(step.codeLines.every(line=>line>=1&&line<=34));
    assert.equal(v.depth,v.stack.length);hasNested ||= v.depth>1;
    for(const row of v.window) for(const cell of row) assert.equal(cell.value,result.original[cell.r][cell.c]);
    if(v.phase==='call') {assert.equal(v.stack.at(-1).waiting,true);assert.deepEqual(step.codeLines,[23]);}
    if(v.phase==='count-add') {
      assert.equal(v.calculation.child,returns.at(-1));assert.equal(v.calculation.after,v.calculation.before+v.calculation.child);
      assert.equal(v.stack.at(-1).count,v.calculation.after);
      const previous=result.steps[i-1].increasingPaths2328View;
      assert.equal(previous.depth,v.depth+1);
      assert.equal(previous.stack.at(-2).count,v.calculation.before);
    }
    if(v.phase==='dp-write') {
      const f=v.stack.at(-1);assert.ok(!writes.has(v.current.join(',')));writes.add(v.current.join(','));
      const cell=v.window.flat().find(cell=>cell.r===f.r&&cell.c===f.c);
      assert.equal(cell.count,f.count%MOD);assert.equal(cell.completed,true);
      assert.equal(v.calculation.after,v.calculation.before%MOD);
    }
    if(['return','cache-return'].includes(v.phase)) {
      const [r,c]=v.current,cell=v.window.flat().find(cell=>cell.r===r&&cell.c===c);
      assert.ok(writes.has(v.current.join(',')));returns.push(cell.count);
      if(v.phase==='cache-return') assert.equal(v.stack.at(-1).count,null);
    }
    if(v.phase==='total') {
      assert.equal(v.calculation.cellCount,returns.at(-1));assert.equal(v.res,(ans+v.calculation.cellCount)%MOD);
      ans=v.res;roots.add(v.root.join(','));
    } else if(v.phase!=='total-init') assert.equal(v.res,i<5 ? null : ans);
  }
  assert.equal(hasNested,true);assert.equal(writes.size,4);assert.equal(roots.size,4);
  assert.equal(result.steps.at(-1).increasingPaths2328View.cacheHits,3);assert.equal(ans,8);
  assert.equal(result.steps.find(step=>step.increasingPaths2328View.phase==='init').increasingPaths2328View.window[0][0].count,0);
  assert.equal(result.steps.at(-1).increasingPaths2328View.examplePaths.length,8);
});
test('2328 DFS completes full-size and deep grids with bounded snapshots',()=>{
  const grids=[Array.from({length:100},()=>Array(1000).fill(7)),Array.from({length:100},(_,r)=>Array.from({length:1000},(_,c)=>r*1000+(r%2 ? 1000-c : c+1)))];
  for(const grid of grids) {
    const before=JSON.stringify(grid),result=problem.builder2(grid),expected=problem.builder(grid);
    assert.equal(result.answer,expected.answer);assert.deepEqual(result.dp,expected.dp);assert.equal(JSON.stringify(grid),before);
    assert.ok(result.steps.length<=601);assert.ok(result.steps.at(-1).increasingPaths2328View.omitted>0);
    assert.equal(result.steps.at(-1).increasingPaths2328View.processed,100000);
    for(const step of result.steps) {const v=step.increasingPaths2328View;assert.ok(v.stack.length<=8);assert.ok(v.window.length<=6&&v.window.every(row=>row.length<=6));}
    assert.ok(JSON.stringify(result).length<8000000);
  }
  for(const input of ['',null,[[0]],[[1],[2,3]]]) assert.throws(()=>problem.builder2(input),/2328/);
});
test('2328 DFS modulo matches exact BigInt path counts',()=>{
  const grid=Array.from({length:35},(_,r)=>Array.from({length:35},(_,c)=>r*35+c+1));
  const ending=grid.map(row=>row.map(()=>1n));let sum=0n;
  for(let r=0;r<35;r++) for(let c=0;c<35;c++) {if(r)ending[r][c]+=ending[r-1][c];if(c)ending[r][c]+=ending[r][c-1];sum+=ending[r][c];}
  assert.equal(problem.builder2(grid).answer,Number(sum%BigInt(MOD)));
});
test('2328 DFS renderer presents the stack, ans, and exact modulo timing in both languages',()=>{
  const element={innerHTML:''},context={lang:'en',$:()=>element,escapeHtml:String,pick:value=>value[context.lang]};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-increasing-paths-2328.js'),'utf8'),context);
  for(const lang of ['en','vi']) {context.lang=lang;for(const step of problem.builder2('1,1;3,4').steps) {
    context.renderIncreasingPaths2328View(step);assert.doesNotMatch(element.innerHTML,/undefined|NaN|object Object/);
    assert.match(element.innerHTML,/DFS \+ MEMOIZATION/);assert.match(element.innerHTML,/ip2328-stack/);assert.doesNotMatch(element.innerHTML,/ip2328-order/);
    if(step.increasingPaths2328View.phase==='count-add') assert.match(element.innerHTML,/count \+= dfs\(nr,nc\)/);
    if(step.increasingPaths2328View.phase==='dp-write') assert.match(element.innerHTML,/dp\[r\]\[c\] = count % MOD/);
    if(step.final)assert.match(element.innerHTML,/ans = Σ/);
  }}
});
test('complexity labels follow the selected approach without changing other problems',()=>{
  const app=fs.readFileSync(require.resolve('../public/app-core.js'),'utf8');
  const fn=app.slice(app.indexOf('function renderComplexity()'),app.indexOf('// Render extra parameter inputs'));
  const elements={},selector={value:'2'};
  const context={problemData:problem,$:id=>id==='extraParams'?{querySelector:()=>selector}:(elements[id]||=( {textContent:''} )),pick:value=>value.en,show:()=>{},hide:()=>{}};
  vm.createContext(context);vm.runInContext(fn,context);context.renderComplexity();assert.equal(elements.cxTime.textContent,'O(k)');
  selector.value='1';context.renderComplexity();assert.equal(elements.cxTime.textContent,'O(k log k)');
  selector.value='3';context.renderComplexity();assert.equal(elements.cxTime.textContent,'O(k + S)');
  selector.value='2';context.problemData={complexity:{time:'O(n)',space:'O(1)',note:{en:'other'}}};context.renderComplexity();assert.equal(elements.cxTime.textContent,'O(n)');
});
