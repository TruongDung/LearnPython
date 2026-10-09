const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[2713];

// Independent graph oracle: recursively search every smaller cell sharing an axis.
function oracle(mat) {
  const rows=mat.length,cols=mat[0].length,memo=mat.map(row=>row.map(()=>0));
  function ending(r,c) {
    if(memo[r][c])return memo[r][c];
    let best=1;
    for(let nr=0;nr<rows;nr++)for(let nc=0;nc<cols;nc++)
      if((nr===r||nc===c)&&mat[nr][nc]<mat[r][c])best=Math.max(best,1+ending(nr,nc));
    return memo[r][c]=best;
  }
  let answer=0;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)answer=Math.max(answer,ending(r,c));
  return {answer,dp:memo};
}
function checkWitness(result) {
  assert.equal(result.path.length,result.answer);
  for(let i=1;i<result.path.length;i++) {
    const [r,c]=result.path[i],[pr,pc]=result.path[i-1];
    assert.ok(r===pr||c===pc);assert.ok(result.original[pr][pc]<result.original[r][c]);
  }
}
test('2713 matches an independent graph oracle, including nonadjacent jumps and equal values',()=>{
  const cases=[[[3,1],[3,4]],[[1,1],[1,1]],[[3,1,6],[-9,5,7]],[[1,100,2]],[[1,2],[2,3]],[[-100000]],[[0]]];
  for(let code=0;code<81;code++) {let x=code;cases.push(Array.from({length:2},()=>Array.from({length:2},()=>{const v=x%3;x=Math.floor(x/3);return v;})));}
  for(let seed=1;seed<=40;seed++) {let x=seed;cases.push(Array.from({length:3},()=>Array.from({length:3},()=>{x=(x*1664525+1013904223)>>>0;return x%7-3;})));}
  for(const mat of cases) {
    const before=JSON.stringify(mat),result=problem.builder(mat),expected=oracle(mat);
    assert.equal(result.answer,expected.answer);assert.deepEqual(result.dp,expected.dp);
    assert.equal(JSON.stringify(mat),before);checkWitness(result);
  }
  assert.equal(problem.builder('1,100,2').answer,3);
});
test('2713 computes every equal-valued cell before committing summaries and snapshots remain independent',()=>{
  const result=problem.builder('3,1;3,4'),committed=new Set();let value=null,base=null,committing=false;
  for(const step of result.steps) {
    const v=step.increasingCells2713View;
    assert.ok(step.codeLines.every(line=>line>=1&&line<=23));
    if(v.phase==='pending-init') {value=v.groupValue;base={row:v.rowView,col:v.colView};committing=false;}
    if(['cell','compute','pending-add'].includes(v.phase)) {
      assert.equal(committing,false);assert.equal(v.groupValue,value);
      assert.deepEqual(v.rowView,base.row);assert.deepEqual(v.colView,base.col);
    }
    if(v.phase==='compute') {
      const [r,c]=v.current;assert.equal(v.read.length,1+Math.max(v.read.row,v.read.col));
      assert.equal(v.read.row,v.rowView.find(item=>item.index===r).best);
      assert.equal(v.read.col,v.colView.find(item=>item.index===c).best);
      for(const source of [v.rowSource,v.colSource].filter(Boolean)) {
        assert.ok(source[0]===r||source[1]===c);assert.ok(result.original[source[0]][source[1]]<value);
      }
    }
    if(v.phase==='commit')committing=true;
    if(v.phase==='res-update') {assert.ok(!committed.has(v.current.join(',')));committed.add(v.current.join(','));}
    if(v.calculation)assert.equal(v.calculation.after,Math.max(v.calculation.before,v.calculation.length));
  }
  assert.equal(committed.size,4);
  const threes=result.steps.filter(step=>step.increasingCells2713View.phase==='compute'&&step.increasingCells2713View.groupValue===3);
  assert.deepEqual(threes.map(step=>step.increasingCells2713View.read.length),[2,1]);
  assert.equal(result.steps[0].increasingCells2713View.res,null);
  assert.ok(result.steps[0].increasingCells2713View.window.flat().every(cell=>cell.length===null));
  assert.equal(result.steps.at(-1).increasingCells2713View.completedGroups,3);
});
test('2713 handles 100000 cells and deep one-dimensional paths with bounded visualization snapshots',()=>{
  for(const mat of [Array.from({length:100},()=>Array(1000).fill(-100000)),[Array.from({length:100000},(_,c)=>c-50000)],Array.from({length:100000},(_,r)=>[r-50000])]) {
    const result=problem.builder(mat),last=result.steps.at(-1).increasingCells2713View;
    assert.equal(result.answer,mat[0].length===1000?1:100000);checkWitness(result);
    assert.equal(last.processed,100000);assert.equal(last.answer,result.answer);assert.ok(last.omitted>0);
    assert.ok(result.steps.length<=601);assert.ok(last.witness.length<=32);
    assert.equal(last.witness.at(-1).index,result.answer-1);
    for(const step of result.steps) {const v=step.increasingCells2713View;assert.ok(v.window.length<=6&&v.window.every(row=>row.length<=6));assert.ok(v.pending.length<=6&&v.order.length<=6);}
    assert.ok(JSON.stringify(result).length<10000000);
  }
});
test('2713 input validation accepts compact and JSON matrices and rejects unsupported shapes or values',()=>{
  assert.equal(problem.builder('[[-1,0],[1,2]]').answer,3);
  assert.equal(problem.builder('-1,0|1,2').answer,3);
  for(const input of ['',null,[],[[]],[[1],[2,3]],[[1.5]],[[100001]],[[-100001]],'1,,2','[[1]','abc',[Array(100001).fill(1)]])assert.throws(()=>problem.builder(input),/2713/);
  const mat=[[1,2]],args=problem.liveArgs(mat);args[0][0][0]=9;assert.equal(mat[0][0],1);
});
test('2713 displayed Python matches the saved solution and produces the same results',()=>{
  const source=fs.readFileSync(require.resolve('../../Leetcode-sln/dp/Leetcode_2713.py'),'utf8').replace(/\r\n/g,'\n').trimEnd();
  assert.equal(source,problem.code.join('\n'));
  const mats=[[[3,1],[3,4]],[[1,1],[1,1]],[[3,1,6],[-9,5,7]],[[1,100,2]]];
  const checks=mats.map(mat=>`assert Solution().maxIncreasingCells(${JSON.stringify(mat)}) == ${oracle(mat).answer}`);
  checks.push('assert Solution().maxIncreasingCells([list(range(-50000, 50000))]) == 100000');
  const run=spawnSync('python3',['-c',source+'\n'+checks.join('\n')],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);
});
test('2713 renderer supports all trace phases and both languages without invalid output',()=>{
  const element={innerHTML:''},context={lang:'en',$:()=>element,escapeHtml:String,pick:value=>value[context.lang]};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-increasing-cells-2713.js'),'utf8'),context);
  const results=[problem.builder('3,1;3,4'),problem.builder([Array.from({length:100},(_,c)=>c)])];
  for(const language of ['en','vi']) {context.lang=language;for(const result of results)for(const step of result.steps) {
    context.renderIncreasingCells2713View(step);assert.doesNotMatch(element.innerHTML,/undefined|NaN|object Object/);
    assert.match(element.innerHTML,/mic2713-stages/);assert.match(element.innerHTML,/row_best/);
    if(step.final)assert.match(element.innerHTML,/mic2713-witness/);
  }}
});
