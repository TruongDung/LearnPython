const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const p=require('../problems').SUPPORTED[329];
const coordinates=path=>path.map(cell=>[cell.r,cell.c]);
function oracle(matrix) {
  const paths=new Set();let longest=0;
  function visit(r,c,path) {
    const next=[...path,[r,c]];paths.add(JSON.stringify(next));longest=Math.max(longest,next.length);
    for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]])if(matrix[r+dr]?.[c+dc]>matrix[r][c])visit(r+dr,c+dc,next);
  }
  matrix.forEach((row,r)=>row.forEach((_,c)=>visit(r,c,[])));return {paths,longest};
}
test('329 second method returns the longest length and all distinct paths',()=>{
  const matrices=[[[9,9,4],[6,6,8],[2,1,1]],[[1]],[[2,2],[2,2]],[[1,2,3],[6,5,4]],[[-4,-3],[-1,-2]],[[0,1],[0,2]]];
  for(let value=0;value<81;value++) {let x=value;const cells=Array.from({length:4},()=>{const n=x%3;x=Math.floor(x/3);return n;});matrices.push([cells.slice(0,2),cells.slice(2)]);}
  for(const matrix of matrices) {
    const expected=oracle(matrix),before=JSON.stringify(matrix),result=p.builder2(matrix);
    assert.equal(result.answer,expected.longest);assert.equal(result.answer,p.builder(matrix).answer);
    assert.equal(result.allPaths.length,expected.paths.size);
    assert.deepEqual(new Set(result.allPaths.map(path=>JSON.stringify(coordinates(path)))),expected.paths);
    assert.equal(JSON.stringify(matrix),before);
    const final=result.steps.at(-1).longestIncreasingPath329View;
    assert.equal(final.groups.reduce((sum,g)=>sum+g.paths.length,0),expected.paths.size);
    assert.deepEqual(final.groups.filter(g=>g.longest).map(g=>g.length),[expected.longest]);
    assert.equal(final.longestCount,result.allPaths.filter(path=>path.length===expected.longest).length);
  }
});
test('329 default groups distinguish 23 paths from the answer 4',()=>{
  const result=p.builder2(p.defaultInput),v=result.steps.at(-1).longestIncreasingPath329View;
  assert.equal(result.answer,4);assert.equal(result.allPaths.length,23);
  assert.deepEqual(v.groups.map(group=>[group.length,group.paths.length]),[[1,9],[2,9],[3,4],[4,1]]);
  assert.deepEqual(v.groups.at(-1).paths[0].map(cell=>cell.value),[1,2,6,9]);
  const two=p.builder2('1,1;3,4').steps.at(-1).longestIncreasingPath329View.groups[0].paths;
  assert.deepEqual(two.slice(0,2).map(path=>path.map(cell=>cell.value)),[[1],[1]]);assert.notDeepEqual(coordinates(two[0]),coordinates(two[1]));
});
test('329 path snapshots survive backtracking and res changes only at its source lines',()=>{
  const result=p.builder2(p.defaultInput);let recorded=0;
  for(const [i,step] of result.steps.entries()) {
    const v=step.longestIncreasingPath329View;assert.equal(step.codeBlock,2);assert.ok(step.codeLines.every(line=>line>=1&&line<=p.code2.length));
    if(v.phase==='record') {recorded++;assert.equal(v.count,recorded);assert.deepEqual(coordinates(result.allPaths[recorded-1]),v.path);assert.deepEqual(v.lastPath,v.path);}
    if(v.phase==='pop')assert.deepEqual(v.path,result.steps[i-1].longestIncreasingPath329View.path.slice(0,-1));
    if(i&&v.res!==result.steps[i-1].longestIncreasingPath329View.res)assert.ok(['res-init','res-update'].includes(v.phase));
    if(v.phase==='res-update') {assert.equal(v.res,Math.max(v.calculation.before,v.calculation.length));assert.deepEqual(step.codeLines,[16]);}
  }
  assert.equal(recorded,23);assert.deepEqual(result.steps.at(-1).longestIncreasingPath329View.path,[]);
});
test('329 condensed playback still returns every path and explicit output limits',()=>{
  const matrix=Array.from({length:4},(_,r)=>Array.from({length:4},(_,c)=>r*4+c));
  const result=p.builder2(matrix),expected=oracle(matrix),final=result.steps.at(-1).longestIncreasingPath329View;
  assert.equal(result.answer,7);assert.equal(result.allPaths.length,226);assert.equal(result.allPaths.length,expected.paths.size);
  assert.ok(result.steps.length<=601);assert.ok(final.omitted>0);assert.equal(final.groups.reduce((sum,g)=>sum+g.paths.length,0),226);
  const large=Array.from({length:6},(_,r)=>Array.from({length:6},(_,c)=>r*6+(r%2?6-c:c+1)));
  assert.throws(()=>p.builder2(large),/5000/);assert.equal(p.builder(large).answer,36);
  for(const input of ['',null,[],[[1],[2,3]],[[NaN]],Array.from({length:7},()=>[1])])assert.throws(()=>p.builder2(input),/329/);
});
test('329 second Python prints all paths and returns the same longest length',()=>{
  const source=fs.readFileSync(require.resolve('../../Leetcode-sln/graph/Leetcode_329_paths.py'),'utf8').replace(/\r\n/g,'\n').trimEnd();
  assert.equal(source,p.code2.join('\n'));
  const run=spawnSync('python3',['-c',source+'\nassert Solution().longestIncreasingPath([[9,9,4],[6,6,8],[2,1,1]]) == 4'],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  const lines=run.stdout.trim().split(/\r?\n/);assert.equal(lines.length,4);
  assert.equal(lines[0],'Paths with length 1: [9], [9], [4], [6], [6], [8], [2], [1], [1].');
  assert.equal(lines[3],'Paths with length 4: [1 -> 2 -> 6 -> 9].');
});
test('329 renderer presents all groups and marks the longest in both languages',()=>{
  const element={innerHTML:''},context={lang:'en',$:()=>element,escapeHtml:String,pick:value=>value[context.lang]};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-longest-increasing-path-329.js'),'utf8'),context);
  for(const lang of ['en','vi']) {context.lang=lang;for(const step of p.builder2(p.defaultInput).steps) {
    context.renderLongestIncreasingPath329View(step);assert.doesNotMatch(element.innerHTML,/undefined|NaN|object Object/);assert.match(element.innerHTML,/data-method="2"/);
    if(step.final) {assert.match(element.innerHTML,/23/);assert.match(element.innerHTML,/lip329-longest-tag/);assert.match(element.innerHTML,/\[1 → 2 → 6 → 9\]/);assert.match(element.innerHTML,/<details>/);}
  }}
  assert.deepEqual(p.extraParams.find(param=>param.key==='approach').options.map(option=>option.value),[1,2]);
  assert.equal(p.complexity2.time,'O(k + S)');assert.deepEqual(p.liveArgs('1,1;3,4'),[[[1,1],[3,4]]]);
});
