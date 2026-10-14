"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[441];
const triangular = k => BigInt(k) * BigInt(k + 1) / 2n;

test("441 returns exactly the largest complete staircase on examples and boundaries", () => {
  const cases = [[1,1],[5,2],[8,3],[2147483647,65535]];
  for (const k of [2,3,10,50,255,999,4096,65535]) {
    const t = Number(triangular(k));
    cases.push([t-1,k-1],[t,k],[t+1,k]);
  }
  for (const [n, answer] of cases) assert.equal(problem.builder([n]).answer, answer);
  for (let n = 1; n <= 200; n++) {
    let left = n, rows = 0;
    while (left >= rows + 1) left -= ++rows;
    assert.equal(problem.builder([n]).answer, rows);
  }
});

test("441 source lines and local values exactly match CPython debugger events", () => {
  const cases = [1,2,5,6,8,9,36,2147483647];
  const program = problem.code.join("\n") + "\nimport sys,json\nresults=[]\nfor n in json.load(sys.stdin):\n    events=[]\n    def trace(frame,event,arg):\n        if frame.f_code.co_name=='arrangeCoins' and event=='line':\n            values={k:(str(v) if k=='needed' else v) for k,v in frame.f_locals.items() if k in ('n','lo','hi','mid','needed')}\n            events.append({'line':frame.f_lineno,'locals':values})\n        return trace\n    sys.settrace(trace)\n    answer=Solution().arrangeCoins(n)\n    sys.settrace(None)\n    results.append({'answer':answer,'events':events})\nprint(json.dumps(results))\n";
  const py = spawnSync("C:/Users/david.truong/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe", ["-c", program], { encoding:"utf8", input:JSON.stringify(cases) });
  assert.equal(py.status,0,py.stderr);
  JSON.parse(py.stdout).forEach((expected,i) => {
    const run = problem.builder([cases[i]]);
    assert.equal(run.answer,expected.answer);
    assert.deepEqual(run.steps.map(s=>({line:s.codeLines[0],locals:s.arrangingCoins441View.locals})),expected.events);
  });
});

test("441 upper mid shrinks both branches and exact costs exceed JS safe integers", () => {
  const run = problem.builder([2147483647]), answer = BigInt(run.answer), n = 2147483647n;
  assert.ok(triangular(Number(answer)) <= n && triangular(Number(answer)+1) > n);
  assert.ok(run.steps.length <= 158);
  assert.ok(JSON.stringify(run).length < 300000);
  const huge = run.steps.find(s=>s.arrangingCoins441View.phase==="compare").arrangingCoins441View;
  assert.ok(BigInt(huge.needed)>BigInt(Number.MAX_SAFE_INTEGER));
  for (const step of run.steps) {
    const v = step.arrangingCoins441View;
    assert.equal(v.source.text,problem.code[v.source.line-1]);
    if(v.phase==="calculate") { assert.ok(v.mid>v.lo&&v.mid<=v.hi); assert.equal(v.mid,Math.floor((v.lo+v.hi+1)/2)); }
    if(v.needed!==null)assert.equal(v.needed,triangular(v.mid).toString());
    if(v.nextLo!==undefined)assert.ok(v.nextHi-v.nextLo<v.hi-v.lo);
  }
});

test("441 pictures retain exact row counts and never include incomplete rows in the answer", () => {
  for (const n of [1,5,8,36,1000,2147483647]) {
    const run = problem.builder([n]);
    for (const {arrangingCoins441View:v} of run.steps) {
      assert.ok(v.picture.length<=7 || v.candidateRows<=8);
      for (const p of v.picture) {
        const remaining=BigInt(n)-triangular(p.row-1);
        const filled=remaining<=0n?0:Number(remaining<BigInt(p.row)?remaining:BigInt(p.row));
        assert.equal(p.filled,filled); assert.equal(p.filled+p.missing,p.row);
      }
    }
    const final=run.steps.at(-1).arrangingCoins441View;
    assert.equal(final.remaining,n-final.used);
    const partial=final.picture.at(-1);
    assert.equal(partial.row,run.answer+1);assert.equal(partial.incomplete,true);
    assert.ok(partial.missing>0);assert.equal(partial.filled,final.remaining);
  }
});

test("441 rejects malformed or out-of-range input and binds one integer for live Python", () => {
  for(const input of [[],[0],[-1],[1.5],[2147483648],[1,2],[NaN],["5"],5])assert.throws(()=>problem.builder(input),/441:/);
  assert.deepEqual(problem.liveArgs([8]),[8]);
});

test("441 renders both languages and restores previous JSON snapshots", () => {
  const context={escapeHtml:String};vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-arranging-coins-441.js"),"utf8"),context);
  const Klass=vm.runInContext("ArrangingCoins441Visualizer",context);
  for(const language of ["vi","en"]) {
    const host={innerHTML:""},renderer=new Klass({host,language});
    for(const n of [1,5,8,36,2147483647]) {
      const run=problem.builder([n]);
      for(const step of run.steps) {renderer.render(JSON.parse(JSON.stringify(step)));assert.match(host.innerHTML,/ac441-viz/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);}
      assert.match(host.innerHTML,/next-row/);
      renderer.render(run.steps[0]);const first=host.innerHTML;
      renderer.render(run.steps.at(-1));renderer.render(run.steps[0]);assert.equal(host.innerHTML,first);
    }
  }
});

test("441 assets are lazy and its dedicated renderer precedes shared renderers", () => {
  const html=fs.readFileSync(require.resolve("../public/index.html"),"utf8");
  assert.match(html,/renderer-arranging-coins-441\.js/);assert.match(html,/arranging-coins-441\.css/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,""),/(?:renderer-)?arranging-coins-441\.(?:js|css)/);
  const script=fs.readFileSync(require.resolve("../public/script.js"),"utf8");
  assert.match(script,/arrangingCoins441View[\s\S]*?renderArrangingCoins441View\(step\)/);
});
