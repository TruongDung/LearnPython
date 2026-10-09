const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const p = require('../problems').SUPPORTED[2328];
const coords = path => path.map(cell=>[cell.r,cell.c]);
function oracle(grid) {
  const paths=new Set();
  function visit(r,c,path) {
    const next=[...path,[r,c]];paths.add(JSON.stringify(next));
    for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]) if(grid[r+dr]?.[c+dc]>grid[r][c])visit(r+dr,c+dc,next);
  }
  grid.forEach((row,r)=>row.forEach((_,c)=>visit(r,c,[])));return paths;
}
test('2328 approach 3 prints the requested 4 + 3 + 1 paths without deduplicating values',()=>{
  const result=p.builder3('1,1;3,4'),v=result.steps.at(-1).increasingPaths2328View;
  assert.equal(result.answer,8);assert.equal(result.allPaths.length,8);
  assert.deepEqual(v.groups.map(g=>({length:g.length,paths:g.paths.map(path=>path.map(cell=>cell.value))})),[
    {length:1,paths:[[1],[1],[3],[4]]},{length:2,paths:[[1,3],[1,4],[3,4]]},{length:3,paths:[[1,3,4]]},
  ]);
  assert.notDeepEqual(coords(v.groups[0].paths[0]),coords(v.groups[0].paths[1]));
  assert.deepEqual(new Set(result.allPaths.map(path=>JSON.stringify(coords(path)))),oracle([[1,1],[3,4]]));
});
test('2328 backtracking records every prefix and restores the parent branch',()=>{
  const result=p.builder3('1,1;3,4');let recorded=0;
  for(const [i,step] of result.steps.entries()) {
    const v=step.increasingPaths2328View;assert.equal(step.codeBlock,3);assert.ok(step.codeLines.every(line=>line>=1&&line<=p.code3.length));
    if(v.phase==='record') {recorded++;assert.equal(v.count,recorded);assert.deepEqual(v.lastPath,v.path);assert.deepEqual(v.lastPath,result.allPaths[recorded-1]);}
    if(v.phase==='pop') {
      const prev=result.steps[i-1].increasingPaths2328View;
      assert.deepEqual(v.path,prev.path.slice(0,-1));assert.deepEqual(v.lastPath,prev.lastPath);
    }
    for(let j=1;j<v.path.length;j++) {
      const a=v.path[j-1],b=v.path[j];assert.ok(b.value>a.value);assert.equal(Math.abs(a.r-b.r)+Math.abs(a.c-b.c),1);
    }
    for(const cell of v.window.flat()) assert.equal(cell.onPath,v.path.some(item=>item.r===cell.r&&item.c===cell.c));
  }
  assert.equal(recorded,8);assert.equal(result.steps.at(-1).increasingPaths2328View.processed,4);
  assert.deepEqual(result.steps.at(-1).increasingPaths2328View.path,[]);
});
test('2328 exhaustive output stays complete when the playback trace is condensed',()=>{
  for(const grid of [[[9]],[[7,7],[7,7]],[[1],[2]],[Array.from({length:15},(_,i)=>i+1)],Array.from({length:4},(_,r)=>Array.from({length:4},(_,c)=>r*4+c+1))]) {
    const before=JSON.stringify(grid),expected=oracle(grid),result=p.builder3(grid),final=result.steps.at(-1).increasingPaths2328View;
    assert.equal(result.answer,expected.size);assert.equal(result.answer,p.builder(grid).answer);assert.equal(result.answer,p.builder2(grid).answer);
    assert.deepEqual(new Set(result.allPaths.map(path=>JSON.stringify(coords(path)))),expected);
    assert.equal(final.groups.reduce((sum,g)=>sum+g.paths.length,0),expected.size);assert.equal(JSON.stringify(grid),before);
    assert.ok(result.steps.length<=601);assert.equal(result.steps.at(-1).final,true);
    if(expected.size>16) {assert.ok(final.omitted>0);assert.ok(final.groups.flatMap(g=>g.paths).length>16);}
  }
});
test('2328 approach 3 reports limits explicitly instead of returning partial paths',()=>{
  assert.throws(()=>p.builder3([Array.from({length:37},(_,i)=>i+1)]),/36/);
  const grid=Array.from({length:6},(_,r)=>Array.from({length:6},(_,c)=>r*6+(r%2?6-c:c+1)));
  assert.throws(()=>p.builder3(grid),/5000/);assert.ok(p.builder(grid).answer>5000);assert.equal(p.builder(grid).answer,p.builder2(grid).answer);
  for(const input of ['',null,[[0]],[[1],[2,3]]]) assert.throws(()=>p.builder3(input),/2328/);
});
test('2328 approach 3 Python prints every group and returns the count',()=>{
  const source=fs.readFileSync(require.resolve('../../Leetcode-sln/dp/Leetcode_2328_paths.py'),'utf8').replace(/\r\n/g,'\n').trimEnd();
  assert.equal(source,'from typing import List\n\n'+p.code3.join('\n'));
  const run=spawnSync('python3',['-c',source+'\nassert Solution().countPaths([[1,1],[3,4]]) == 8'],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);assert.equal(run.stdout.replace(/\r\n/g,'\n').trim(),[
    'Paths with length 1: [1], [1], [3], [4].',
    'Paths with length 2: [1 -> 3], [1 -> 4], [3 -> 4].',
    'Paths with length 3: [1 -> 3 -> 4].',
  ].join('\n'));
});
test('2328 enumeration renderer shows all grouped paths and coordinate identities in both languages',()=>{
  const element={innerHTML:''},context={lang:'en',$:()=>element,escapeHtml:String,pick:value=>value[context.lang]};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-increasing-paths-2328.js'),'utf8'),context);
  for(const lang of ['en','vi']) {context.lang=lang;for(const step of p.builder3('1,1;3,4').steps) {
    context.renderIncreasingPaths2328View(step);assert.doesNotMatch(element.innerHTML,/undefined|NaN|object Object/);assert.match(element.innerHTML,/data-method="3"/);
    if(step.final) {
      assert.match(element.innerHTML,/\[1\], \[1\], \[3\], \[4\]\./);
      assert.match(element.innerHTML,/\[1 → 3\], \[1 → 4\], \[3 → 4\]\./);
      assert.match(element.innerHTML,/\[1 → 3 → 4\]\./);assert.match(element.innerHTML,/<details>/);
    }
  }}
});
