'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {test}=require('node:test');
const p=require('../problems').SUPPORTED;
const field={36:'sudoku36View',128:'consecutive128View',1411:'paint1411View',1931:'paint1931View'};
const blank=()=>Array.from({length:9},()=>Array(9).fill('.'));
const run36=b=>p[36].builder(JSON.stringify(b));
function makeRenderer(language='en'){
  const host={},context=vm.createContext({lang:language,$:()=>host,escapeHtml:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')});
  for(const file of ['renderer-valid-sudoku-36.js','renderer-grid-coloring-1411-1931.js','renderer-longest-consecutive-128.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../public',file),'utf8'),context);
  const functions={36:'renderValidSudoku36View',128:'renderLongestConsecutive128View',1411:'renderPaintGrid1411View',1931:'renderPaintGrid1931View'};
  return(id,step)=>{context[functions[id]](step);return host.innerHTML;};
}

test('36 detects row, column and box conflicts with exact previous coordinates',()=>{
  for(const [type,r,c] of [['row',0,4],['col',4,0],['box',1,1]]){
    const b=blank();b[0][0]='5';b[r][c]='5';
    const run=run36(b),v=run.steps.at(-1).sudoku36View;
    assert.equal(run.answer,false);assert.deepEqual(v.conflict.checks[type],[{r:0,c:0}]);
    assert.equal(v.active.r,r);assert.equal(v.active.c,c);assert.equal(v.active.digit,'5');
    const html=makeRenderer()(36,run.steps.at(-1));
    assert.match(html,/cc-result bad/);assert.match(html,/Duplicate 5/);
    assert.equal((html.match(/<td class="[^"]*conflict/g)||[]).length,2);
  }
});
test('36 ignores blanks, does not solve the board, and accepts a valid unsatisfiable partial board',()=>{
  assert.equal(run36(blank()).answer,true);
  const unsolvable=blank();unsolvable[0]=[...'.12345678'];unsolvable[1][0]='9';
  const before=JSON.stringify(unsolvable),run=run36(unsolvable);
  assert.equal(run.answer,true);assert.equal(JSON.stringify(unsolvable),before);
  assert.deepEqual(run.steps.at(-1).sudoku36View.board,unsolvable.map(row=>row.join('')));
  assert.equal(run.steps.at(-1).sudoku36View.checked.length,9);
  assert.equal(p[36].builder(p[36].defaultInput).answer,true);
});

const MOD=1000000007;
function patterns(m){const all=[];function go(row){if(row.length===m){all.push(row);return;}for(let c=0;c<3;c++)if(!row.length||row.at(-1)!==c)go([...row,c]);}go([]);return all;}
function explicitDP(m,n){const states=patterns(m);let counts=states.map(()=>1);for(let col=1;col<n;col++)counts=states.map(right=>states.reduce((sum,left,i)=>left.every((c,r)=>c!==right[r])?(sum+counts[i])%MOD:sum,0));return counts.reduce((a,b)=>(a+b)%MOD,0);}
function bruteGrid(m,n){const cells=Array(m*n).fill(-1);let total=0;function go(i){if(i===cells.length){total++;return;}for(let c=0;c<3;c++){if(i%n&&cells[i-1]===c||i>=n&&cells[i-n]===c)continue;cells[i]=c;go(i+1);}}go(0);return total;}

test('1411 explains all four transition coefficients using actual compatible rows',()=>{
  const run=p[1411].builder('3'),v=run.steps.at(-1).paint1411View;
  assert.equal(run.answer,246);assert.deepEqual(v.transitions.map(t=>t.choices.length),[3,2,2,2]);
  for(const tr of v.transitions)for(const right of tr.choices){
    assert.ok(right.every((c,i)=>c!==tr.left[i]));
    assert.equal(right[0]===right[2],tr.to==='ABA');
  }
  assert.deepEqual(v.history.map(h=>h.total),[12,54,246]);
  for(let n=1;n<=12;n++)assert.equal(p[1411].builder(String(n)).answer,explicitDP(3,n));
});

test('1931 agrees with tiny exhaustive grids and known larger results',()=>{
  for(const [m,n]of [[1,1],[1,2],[2,2],[2,3],[3,3]])assert.equal(p[1931].builder(String(m),{n}).answer,bruteGrid(m,n));
  assert.equal(p[1931].builder('5',{n:5}).answer,580986);
  assert.equal(p[1931].builder('5',{n:8}).answer,explicitDP(5,8));
  for(let n=1;n<=8;n++)assert.equal(p[1931].builder('3',{n}).answer,p[1411].builder(String(n)).answer);
});
test('1931 records every compatible predecessor and sums exact prior-column counts',()=>{
  const run=p[1931].builder('3',{n:3});
  for(const step of run.steps){const v=step.paint1931View;
    assert.equal(v.states.length,12);
    if(v.event==='sum'||v.event==='append'){
      const compatible=v.previousFor[v.target];
      for(let i=0;i<v.states.length;i++)assert.equal(compatible.includes(i),v.states[i].every((c,r)=>c!==v.states[v.target][r]));
      assert.equal(v.ways,compatible.reduce((sum,i)=>(sum+v.dp[i])%MOD,0));
      if(v.event==='append')assert.equal(v.nextDp[v.target],v.ways);
    }
  }
  assert.deepEqual(run.steps.at(-1).paint1931View.history.map(h=>h.total),[12,54,246]);
});

const consecutiveCases=[[[100,4,200,1,3,2],4],[[1,0,1,2],3],[[-3,-2,-1,1,2,50],3],[[1,2,1000000000],2],[[],0],[[7,7,7],1],[[10,20,30],1],[Array.from({length:24},(_,i)=>12-i),24]];
test('128 handles duplicates, negatives, large gaps and empty input without sorting the Python algorithm',()=>{
  assert.doesNotMatch(p[128].code.join('\n'),/sorted\(|\.sort\(/);
  for(const [nums,answer]of consecutiveCases){
    const run=p[128].builder(nums),v=run.steps.at(-1).consecutive128View;
    assert.equal(run.answer,answer);assert.equal(v.bestRun?.length??0,answer);
    assert.equal(v.duplicates,nums.length-new Set(nums).size);
    for(const counted of v.runs){assert.ok(!nums.includes(counted.start-1));for(let j=0;j<counted.length;j++)assert.ok(nums.includes(counted.start+j));}
    assert.equal(new Set(v.runs.map(r=>r.start)).size,v.runs.length);
    assert.equal(v.runs.reduce((sum,r)=>sum+r.length,0),new Set(nums).size);
  }
});
test('128 preserves predecessor and successor query timing for skip and stop decisions',()=>{
  const run=p[128].builder([3,1,2,100]),set=new Set([3,1,2,100]);
  for(const s of run.steps){const v=s.consecutive128View;if(v.query)assert.equal(v.query.exists,set.has(v.query.value));if(v.event==='skip')assert.ok(set.has(v.num-1));if(v.event==='stop')assert.ok(!set.has(v.query.value));}
  const empty=p[128].builder('[]');assert.equal(empty.answer,0);assert.match(makeRenderer()(128,empty.steps.at(-1)),/No numbers → length 0/);
});

test('all four lessons render native line snapshots in both languages',()=>{
  for(const language of ['en','vi']){const render=makeRenderer(language);
    for(const id of [36,128,1411,1931]){
      const run=p[id].builder(p[id].defaultInput,{n:3});
      assert.equal(p[id].debugMode,'line-by-line');
      for(const s of run.steps){const v=s[field[id]];assert.equal(s.codeLines.length,1);assert.equal(p[id].code[s.codeLines[0]-1].trim(),v.source);const html=render(id,s);assert.doesNotMatch(html,/undefined|NaN|Infinity/);}
      assert.equal(run.steps.at(-1).final,true);
    }
  }
});
test('new input boundaries and live editor arguments stay aligned',()=>{
  assert.throws(()=>p[36].builder('123'),/36:/);const b=blank();b[0][0]='0';assert.throws(()=>run36(b),/36:/);
  for(const n of ['','0','13','1.5','[]'])assert.throws(()=>p[1411].builder(n),/1411:/);
  for(const [m,n]of [['0',3],['6',3],['3',0],['3',9],['2.5',3]])assert.throws(()=>p[1931].builder(m,{n}),/1931:/);
  for(const input of ['1,,2','x','[1,null]','1000000001'])assert.throws(()=>p[128].builder(input),/128:/);
  assert.deepEqual(p[128].liveArgs('1,2,2'),[[1,2,2]]);assert.deepEqual(p[1411].liveArgs('3'),[3]);assert.deepEqual(p[1931].liveArgs('3',{n:2}),[3,2]);
});
