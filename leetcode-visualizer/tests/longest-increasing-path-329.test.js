const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[329];
const cases = [
  [[[9,9,4],[6,6,8],[2,1,1]], 4],
  [[[3,4,5],[3,2,6],[2,2,1]], 4],
  [[[1]], 1], [[[2,2],[2,2]], 1],
  [[[1,2,3],[6,5,4]], 6], [[[-4,-3],[-1,-2]], 4],
];
// Independent dynamic program: process cells by descending value, no DFS.
function oracle(matrix) {
  const dp = matrix.map(row => row.map(() => 1));
  const cells = matrix.flatMap((row, r) => row.map((value, c) => ({ r, c, value }))).sort((a,b) => b.value - a.value);
  for (const { r, c, value } of cells) {
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = r + dr, nc = c + dc;
      if (matrix[nr] && nc >= 0 && nc < matrix[0].length && matrix[nr][nc] > value) dp[r][c] = Math.max(dp[r][c], 1 + dp[nr][nc]);
    }
  }
  return dp;
}
test('329 matches a descending-value oracle and returns a valid illustrative path', () => {
  const matrices = cases.map(([matrix]) => matrix);
  for (let value = 0; value < 81; value++) {
    let x = value; const cells = Array.from({ length: 4 }, () => { const digit = x % 3; x = Math.floor(x / 3); return digit; });
    matrices.push([cells.slice(0,2), cells.slice(2)]);
  }
  matrices.push(Array.from({length:6}, (_,r) => Array.from({length:6},(_,c) => r*6 + (r%2 ? 5-c : c))));
  for (const matrix of matrices) {
    const result = problem.builder(matrix), expected = oracle(matrix);
    assert.deepEqual(result.dp, expected);
    assert.equal(result.answer, Math.max(...expected.flat()));
    assert.equal(result.path.length, result.answer);
    for (let i = 1; i < result.path.length; i++) {
      const [r,c] = result.path[i-1], [nr,nc] = result.path[i];
      assert.equal(Math.abs(r-nr)+Math.abs(c-nc),1); assert.ok(matrix[nr][nc] > matrix[r][c]);
    }
    assert.equal(result.steps.at(-1).final, true); assert.deepEqual(result.steps.at(-1).codeLines,[30]);
    assert.equal(result.steps.at(-1).longestIncreasingPath329View.writes, matrix.length * matrix[0].length);
  }
});
test('329 trace writes dp once, waits for child returns, and updates res only at line 27', () => {
  const result = problem.builder(cases[0][0]);
  const writes = new Set();
  for (let i = 0; i < result.steps.length; i++) {
    const step = result.steps[i], v = step.longestIncreasingPath329View;
    assert.ok(step.codeLines.every(line => problem.code[line-1].trim()));
    if (v.phase === 'dp-write') {
      assert.deepEqual(step.codeLines,[21]); const [r,c] = v.current;
      assert.ok(!writes.has(`${r},${c}`)); writes.add(`${r},${c}`);
      assert.equal(v.dp[r][c], v.stack.at(-1).best);
    }
    if (v.phase === 'best-update') {
      assert.deepEqual(step.codeLines,[20]); assert.equal(v.stack.at(-1).best, Math.max(v.calculation.before, 1+v.calculation.child));
      assert.ok(['return','cache-return'].includes(result.steps[i-1].longestIncreasingPath329View.phase));
    }
    if (v.phase === 'cache-return') {
      assert.deepEqual(step.codeLines,[12]); const [r,c] = v.current;
      assert.ok(v.dp[r][c] > 0); assert.equal(v.stack.at(-1).best,null);
    }
    if (i && v.res !== result.steps[i-1].longestIncreasingPath329View.res) { assert.equal(v.phase,'res-update'); assert.deepEqual(step.codeLines,[27]); }
    if (v.phase === 'call') assert.equal(v.stack.at(-1).waiting,true);
    if (v.phase !== 'done') assert.deepEqual(v.path,[]);
  }
  assert.equal(writes.size,9);
  assert.ok(result.steps.at(-1).longestIncreasingPath329View.cacheHits > 0);
  assert.ok(result.steps[0].longestIncreasingPath329View.dp === null);
  assert.deepEqual(result.steps.find(step=>step.longestIncreasingPath329View.phase==='allocate').longestIncreasingPath329View.dp,Array.from({length:3},()=>[0,0,0]));
  const directions = result.steps.filter(step => step.longestIncreasingPath329View.phase === 'direction' && step.longestIncreasingPath329View.stack.length === 1 && step.longestIncreasingPath329View.current.join(',') === '0,0').map(step => step.longestIncreasingPath329View.stack[0].direction);
  assert.deepEqual(directions,[0,1,2,3]);
});
test('329 accepts existing compact and JSON formats and validates matrices', () => {
  for (const input of ['9,9,4;6,6,8;2,1,1','9,9,4|6,6,8|2,1,1',JSON.stringify(cases[0][0])]) {
    assert.equal(problem.builder(input).answer,4); assert.deepEqual(problem.liveArgs(input),[cases[0][0]]);
  }
  for (const input of ['', '1,;2,3', '1;;2', '[]', '[[1],[2,3]]', [[NaN]], [[1.5]], Array.from({length:7},()=>[1]), [Array(7).fill(1)], null]) assert.throws(()=>problem.builder(input),/329/);
});
test('329 displayed Python is the requested DFS, matches the saved solution and executes', () => {
  const source = fs.readFileSync(require.resolve('../../Leetcode-sln/graph/Leetcode_329.py'),'utf8').trimEnd().replace(/\r\n/g,'\n');
  assert.equal(source,problem.code.join('\n'));
  assert.match(source,/res = 0/); assert.match(source,/directions = \[\(1,0\), \(-1,0\), \(0,1\), \(0,-1\)\]/);
  assert.doesNotMatch(source,/next_cell|memo|cached|path =/);
  const checks = cases.map(([matrix,answer])=>`assert Solution().longestIncreasingPath(${JSON.stringify(matrix)}) == ${answer}`).join('\n');
  const run = spawnSync('python3',['-c',source+'\n'+checks],{encoding:'utf8'}); assert.equal(run.status,0,run.stderr);
});
test('329 renders every source phase in both languages with no stale witness', () => {
  const element = { innerHTML: '' }, context = {lang:'vi',$:()=>element,escapeHtml:value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])),pick:value=>value[context.lang]};
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-longest-increasing-path-329.js'),'utf8'),context);
  for (const language of ['vi','en']) {
    context.lang = language;
    for (const [matrix] of cases) for (const step of problem.builder(matrix).steps) {
      context.renderLongestIncreasingPath329View(step); assert.doesNotMatch(element.innerHTML,/undefined|NaN|object Object/);
      assert.equal(element.innerHTML.includes('lip329-witness'),step.final);
      assert.equal((element.innerHTML.match(/<td /g)||[]).length,matrix.length*matrix[0].length*2);
    }
  }
  const html = fs.readFileSync(require.resolve('../public/index.html'),'utf8');
  assert.match(html,/renderer-longest-increasing-path-329.js\?v=longest-increasing-path-329-v2/);
});
