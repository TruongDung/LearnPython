"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), vm = require("node:vm"), { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[1631];
const PYTHON = "C:/Users/david.truong/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const view = step => step.effort1631View;
const cases = [
  [[1]], [[1000000]], [[9, 1, 7]], [[9], [1], [7]], [[7, 7], [7, 7]],
  [[1, 2, 2], [3, 8, 2], [5, 3, 5]], [[1, 2, 3], [3, 8, 4], [5, 3, 5]],
  [[1, 2, 1, 1, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 1, 1, 2, 1]],
  [[1, 1000000], [1, 1000000]], [[1, 10, 6], [7, 4, 8]],
];
function reachable(grid, threshold) {
  if (threshold < 0) return false;
  const rows = grid.length, cols = grid[0].length, seen = new Set([0]), queue = [[0, 0]];
  for (let i = 0; i < queue.length; i++) {
    const [r, c] = queue[i]; if (r === rows - 1 && c === cols - 1) return true;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc, id = nr * cols + nc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && Math.abs(grid[r][c] - grid[nr][nc]) <= threshold && !seen.has(id)) { seen.add(id); queue.push([nr, nc]); }
    }
  }
  return false;
}
function oracle(grid) {
  let low = 0, high = 999999;
  while (low < high) { const mid = Math.floor((low + high) / 2); if (reachable(grid, mid)) high = mid; else low = mid + 1; }
  return low;
}
function python(program, payload) {
  const result = spawnSync(PYTHON, ["-c", program], { encoding: "utf8", input: JSON.stringify(payload), maxBuffer: 64 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr); return JSON.parse(result.stdout);
}

test("1631 Dijkstra and Kruskal match threshold BFS, all official examples and 100 random rectangles", () => {
  let seed = 1631; const random = () => seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const grids = [...cases];
  for (let i = 0; i < 100; i++) grids.push(Array.from({ length: 1 + random() % 5 }, () => Array.from({ length: 1 + i % 5 }, () => 1 + random() % 20)));
  for (const grid of grids) for (const approach of [1, 2]) {
    const original = JSON.stringify(grid), run = problem.builder(grid, { approach }), final = view(run.steps.at(-1));
    assert.equal(run.answer, oracle(grid)); assert.equal(JSON.stringify(grid), original);
    assert.deepEqual(final.path[0].slice(0, 2), [0, 0]); assert.deepEqual(final.path.at(-1).slice(0, 2), [grid.length - 1, grid[0].length - 1]);
    let max = 0;
    final.path.slice(1).forEach((cell, i) => { assert.equal(Math.abs(cell[0] - final.path[i][0]) + Math.abs(cell[1] - final.path[i][1]), 1); max = Math.max(max, Math.abs(cell[2] - final.path[i][2])); });
    assert.equal(max, run.answer); assert.equal(final.lowerReachable, false);
  }
  assert.deepEqual(cases.slice(5, 8).map(grid => problem.builder(grid).answer), [2, 1, 0]);
});

for (const approach of [1, 2]) test(`1631 approach ${approach} matches every CPython source event, local and mutable snapshot`, () => {
  const code = approach === 1 ? problem.code : problem.code2;
  const program = code.join("\n") + `
import sys,json,math
def clean(value):
    if isinstance(value,float) and math.isinf(value):return '∞'
    if isinstance(value,(list,tuple)):return [clean(x) for x in value]
    return value
results=[]
for heights in json.load(sys.stdin):
    events=[]
    def trace(frame,event,arg):
        scope=frame.f_code.co_name
        if scope in ('minimumEffortPath','find') and event=='line':
            loc=frame.f_locals
            events.append({'line':frame.f_lineno,'scope':scope,'locals':{k:clean(x) for k,x in loc.items() if k not in ('self','heights','find','heap','best')},'heap':clean(loc.get('heap',[])),'best':clean(loc.get('best'))})
        return trace
    sys.settrace(trace)
    answer=Solution().minimumEffortPath(heights)
    sys.settrace(None)
    results.append({'answer':answer,'events':events})
print(json.dumps(results))
`;
  python(program, cases).forEach((expected, i) => {
    const run = problem.builder(cases[i], { approach }); assert.equal(run.answer, expected.answer);
    assert.deepEqual(run.steps.map(s => ({ line: s.codeLines[0], scope: view(s).source.scope, locals: view(s).locals, heap: view(s).heap })), expected.events.map(e => ({ line: e.line, scope: e.scope, locals: e.locals, heap: e.heap })));
    run.steps.forEach((s, j) => {
      const v = view(s); assert.deepEqual(s.codeLines, [v.source.line]); assert.equal(s.codeBlock, approach); assert.equal(v.source.timing, "before"); assert.equal(v.source.text, code[v.source.line - 1]);
      if (approach === 2) for (const row of v.cells) for (const cell of row) assert.equal(cell.best, expected.events[j].best?.[cell.r]?.[cell.c] ?? null);
      else if (v.parent) assert.deepEqual(v.parent, expected.events[j].locals.parent);
    });
  });
});

test("1631 Dijkstra exposes diff, max, best update, push and stale entries at the correct time", () => {
  const run = problem.builder(problem.defaultInput, { approach: 2 });
  for (let i = 0; i < run.steps.length - 1; i++) {
    const v = view(run.steps[i]), next = view(run.steps[i + 1]);
    if (v.phase === "diff") { assert.equal(v.probe.diff, null); assert.equal(next.probe.diff, Math.abs(v.probe.fromValue - v.probe.value)); }
    if (v.phase === "max") { assert.equal(v.probe.candidate, null); assert.equal(next.probe.candidate, Math.max(v.capacity, v.probe.diff)); }
    if (v.phase === "update") { const p = v.probe; assert.equal(v.cells[p.r][p.c].best, p.oldBest); assert.equal(next.cells[p.r][p.c].best, p.candidate); assert.equal(next.heap.length, v.heap.length); }
    if (v.phase === "push") assert.equal(next.heap.length, v.heap.length + 1);
    if (v.phase === "pop") { assert.deepEqual(next.current, v.heap[0].slice(1)); assert.equal(next.capacity, v.heap[0][0]); }
  }
  let skipped = false;
  for (let k = 0; k < 80 && !skipped; k++) {
    const grid = Array.from({length:4}, (_, r) => Array.from({length:4}, (_, c) => 1 + ((k * 13 + r * 17 + c * c * 7) % 50))); grid[3][3] = 1000000;
    skipped = problem.builder(grid, {approach:2}).steps.some(s => view(s).phase === "skip-stale");
  }
  assert.ok(skipped, "stale entries must actually be exercised");
});

test("1631 DSU links and grows after their lines and compresses only inside find", () => {
  const run = problem.builder(cases[7], { approach: 1 }); let linked = false, compressed = false;
  for (let i = 0; i < run.steps.length - 1; i++) {
    const v = view(run.steps[i]), next = view(run.steps[i + 1]);
    if (v.phase === "link") { const {root_a,root_b} = v.locals; assert.equal(v.parent[root_b], root_b); assert.equal(next.parent[root_b], root_a); assert.equal(next.accepted.length, v.accepted.length + 1); linked = true; }
    if (v.phase === "grow") assert.equal(next.sizes[v.locals.root_a], v.sizes[v.locals.root_a] + v.sizes[v.locals.root_b]);
    if (v.phase === "compress") { const x = v.locals.x; assert.equal(next.parent[x], v.parent[v.parent[x]]); compressed = true; }
  }
  assert.ok(linked && compressed);
});

test("1631 parses JSON, pipe and semicolon; validates official limits for both approaches", () => {
  assert.deepEqual(problem.liveArgs('1,2,3;4,5,6'), [[[1,2,3],[4,5,6]]]); assert.deepEqual(problem.liveArgs('[[1]]'), [[[1]]]);
  for (const input of ['', null, '[', '1,2|3', '1,|2,3', '0', '-1', '1.5', '1000001', [[true]], [[]], Array.from({length:101},()=>[1]), [Array(101).fill(1)]]) for (const approach of [1,2]) assert.throws(() => problem.builder(input, {approach}), /1631:/);
  assert.equal(problem.debugMode, 'line-by-line'); assert.equal(problem.extraParams[0].default,'2');
  assert.equal(require('../problems/graph').__buildSteps1631Dijkstra('1,2|3,4').answer,2);
});

for (const approach of [1, 2]) test(`1631 approach ${approach} supports 100×100 with explicit bounded trace and real coordinates`, () => {
  const grid = Array.from({length:100},(_,r)=>Array.from({length:100},(_,c)=>r*100+c+1)), run = problem.builder(grid,{approach}), final = view(run.steps.at(-1));
  assert.equal(run.answer,100); assert.equal(final.lowerReachable,false); assert.ok(final.trace.truncated && final.trace.omitted > 0); assert.ok(run.steps.length<=1601); assert.ok(JSON.stringify(run).length<24000000);
  for(const s of run.steps){const v=view(s);assert.ok(v.rows.length<=6&&v.cols.length<=6);for(const row of v.cells)for(const cell of row)assert.equal(cell.value,grid[cell.r][cell.c]);}
});

test("1631 both displayed solutions execute with the actual live editor tracer", () => {
  const source=fs.readFileSync(require.resolve('../public/live-editor.js'),'utf8'), template=source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1];
  const program=vm.runInNewContext(template)+`\nimport sys,json\npayload=json.load(sys.stdin)\nprint(json.dumps([[__viz_run_trace(code,'minimumEffortPath',[grid])['result'] for grid in payload['grids']] for code in payload['codes']]))\n`;
  const answers=cases.map(oracle); assert.deepEqual(python(program,{codes:[problem.code.join('\n'),problem.code2.join('\n')],grids:cases}),[answers,answers]);
});

test("1631 renderer draws only genuine adjacency, restores snapshots and marks bottleneck edges", () => {
  const context={escapeHtml:String};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-minimum-effort-path-1631.js'),'utf8'),context);const Renderer=vm.runInContext('Effort1631Visualizer',context);
  for(const language of ['vi','en'])for(const approach of [1,2]){
    const host={innerHTML:''}, renderer=new Renderer({host,language});
    for(const grid of [cases[0],cases[4],cases[5],cases[7]]){
      const run=problem.builder(grid,{approach});
      for(const s of run.steps){renderer.render(JSON.parse(JSON.stringify(s)));assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);for(const match of host.innerHTML.matchAll(/data-edge="(\d+):(\d+)" data-diff="(\d+)"/g)){const [,a,b,d]=match.map(Number);assert.equal(Math.abs(Math.floor(a/grid[0].length)-Math.floor(b/grid[0].length))+Math.abs(a%grid[0].length-b%grid[0].length),1);assert.equal(d,Math.abs(grid[Math.floor(a/grid[0].length)][a%grid[0].length]-grid[Math.floor(b/grid[0].length)][b%grid[0].length]));}}
      renderer.render(run.steps[0]);const first=host.innerHTML;renderer.render(run.steps.at(-1));if(grid.length*grid[0].length>1)assert.match(host.innerHTML,/ef1631-edge [^"]*path bottleneck/);renderer.render(run.steps[0]);assert.equal(host.innerHTML,first);
    }
  }
});

test("1631 dedicated assets stay lazy and precede legacy effort and Kruskal views", () => {
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8');assert.match(html,/renderer-minimum-effort-path-1631\.js/);assert.match(html,/minimum-effort-path-1631\.css/);assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/(?:renderer-)?minimum-effort-path-1631\.(?:js|css)/);
  const source=fs.readFileSync(require.resolve('../public/script.js'),'utf8');assert.ok(source.indexOf('step.effort1631View')<source.indexOf('step.kruskalEffortView'));
});
