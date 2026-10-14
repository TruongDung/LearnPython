"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[1011];
const cases = [
  [[1,2,3,4,5,6,7,8,9,10],5,15], [[3,2,2,4,1,4],3,6], [[1,2,3,1,1],4,3],
  [[7],1,7], [[5,5,5],3,5], [[5,5,5],1,15], [[1,1,1,1],2,2], [[500,1,500],2,501],
];

function exhaustiveCapacity(weights, days) {
  let answer = Infinity;
  for (let mask = 0; mask < 2 ** (weights.length - 1); mask++) {
    let groups = 1, load = weights[0], maxLoad = 0;
    for (let i = 1; i < weights.length; i++) {
      if (mask & (1 << (i - 1))) { maxLoad = Math.max(maxLoad, load); load = 0; groups++; }
      load += weights[i];
    }
    if (groups <= days) answer = Math.min(answer, Math.max(maxLoad, load));
  }
  return answer;
}

test("1011 greedy loading and binary search agree with exhaustive ordered partitions", () => {
  for (const [weights, days, answer] of cases) assert.equal(problem.builder(weights, { days }).answer, answer);
  let seed = 1011;
  const random = () => (seed = (Math.imul(seed,1664525)+1013904223) >>> 0);
  for (let i = 0; i < 80; i++) {
    const n = 1 + random() % 8, weights = Array.from({ length:n }, () => 1 + random() % 12), days = 1 + random() % n;
    assert.equal(problem.builder(weights,{days}).answer,exhaustiveCapacity(weights,days));
  }
});

test("1011 snapshots match all CPython line events in both outer and helper scopes", () => {
  const program = problem.code.join("\n") + "\nimport sys,json\nresults=[]\nfor weights,days,_ in json.load(sys.stdin):\n    events=[]\n    def trace(frame,event,arg):\n        scope=frame.f_code.co_name\n        if scope in ('shipWithinDays','count_days') and event=='line':\n            values={k:v for k,v in frame.f_locals.items() if k in ('days','lo','hi','mid','needed_days','capacity','used_days','load','weight')}\n            events.append({'line':frame.f_lineno,'scope':scope,'locals':values})\n        return trace\n    sys.settrace(trace)\n    answer=Solution().shipWithinDays(weights,days)\n    sys.settrace(None)\n    results.append({'answer':answer,'events':events})\nprint(json.dumps(results))\n";
  const py = spawnSync("C:/Users/david.truong/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe", ["-c",program], { encoding:"utf8", input:JSON.stringify(cases) });
  assert.equal(py.status,0,py.stderr);
  JSON.parse(py.stdout).forEach((expected,i) => {
    const [weights,days] = cases[i], run = problem.builder(weights,{days});
    assert.equal(run.answer,expected.answer);
    assert.deepEqual(run.steps.map(s => ({ line:s.codeLines[0], scope:s.shipPackages1011View.source.scope, locals:s.shipPackages1011View.locals })), expected.events);
  });
});

test("1011 pictures preserve package order, indivisible weights and partial progress", () => {
  for (const [weights,days] of cases) {
    const run = problem.builder(weights,{days});
    for (const step of run.steps) {
      const v = step.shipPackages1011View;
      assert.equal(v.source.text,problem.code[v.source.line-1]);
      assert.ok(v.lo===null || v.hi-v.lo>=0);
      if(v.nextLo!==undefined)assert.ok(v.nextHi-v.nextLo<v.hi-v.lo);
      const loaded=v.schedule.flatMap(ship=>ship.packages);
      assert.equal(loaded.length,v.processed);
      assert.deepEqual(loaded.map(p=>p.index),weights.slice(0,v.processed).map((_,i)=>i));
      for(const ship of v.schedule) {
        assert.equal(ship.load,ship.packages.reduce((sum,p)=>sum+p.weight,0));
        assert.ok(ship.load<=v.capacity);
        assert.equal(ship.count,ship.packages.length);
      }
      for(const pkg of v.queue) {assert.equal(pkg.weight,weights[pkg.index]);assert.equal(pkg.loaded,pkg.index<v.processed);}
    }
    const final=run.steps.at(-1).shipPackages1011View;
    assert.ok(final.neededDays<=days);
    if(final.smallerDays!==null)assert.ok(final.smallerDays>days);
    else assert.equal(final.answer,Math.max(...weights));
  }
});

test("1011 day increment, load reset and package addition occur only after their source lines", () => {
  const run=problem.builder([3,2,2,4,1,4],{days:3});
  const change=run.steps.findIndex(s=>s.shipPackages1011View.phase==="new-day");
  const before=run.steps[change].shipPackages1011View, reset=run.steps[change+1].shipPackages1011View, add=run.steps[change+2].shipPackages1011View;
  assert.equal(before.source.line,9);assert.equal(reset.source.line,10);assert.equal(add.source.line,11);
  assert.equal(reset.locals.used_days,before.locals.used_days+1);
  assert.equal(reset.locals.load,before.locals.load);
  assert.equal(add.locals.load,0);
  assert.equal(add.processed,before.processed);
  const after=run.steps[change+3].shipPackages1011View;
  assert.equal(after.locals.load,add.locals.weight);
  assert.equal(after.processed,add.processed+1);
});

test("1011 enforces official constraints and provides typed live arguments", () => {
  for(const weights of [[],[0],[-1],[1.5],[501],[NaN],Array(50001).fill(1)])assert.throws(()=>problem.builder(weights,{days:1}),/1011: weights/);
  for(const days of [0,4,1.5,true,null,"", "2.5"])assert.throws(()=>problem.builder([1,2,3],{days}),/1011: days/);
  assert.deepEqual(problem.liveArgs([3,2,2,4,1,4],{days:"3"}),[[3,2,2,4,1,4],3]);
});

test("1011 full-size input keeps trace and displayed groups bounded without changing the answer", () => {
  const weights=Array(50000).fill(500), run=problem.builder(weights,{days:50000});
  assert.equal(run.answer,500);assert.ok(run.steps.length<=451);
  assert.ok(JSON.stringify(run).length<2000000);
  const final=run.steps.at(-1).shipPackages1011View;
  assert.equal(final.neededDays,50000);assert.equal(final.truncated,true);
  for(const step of run.steps) {
    const v=step.shipPackages1011View;assert.ok(v.queue.length<=9&&v.schedule.length<=6);
    for(const ship of v.schedule) {assert.ok(ship.packages.length<=8);assert.equal(ship.count,ship.first===null?0:ship.last-ship.first+1);}
  }
});

test("1011 renders both languages from JSON and Prev restores the same picture", () => {
  const context={escapeHtml:String};vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-ship-packages-1011.js"),"utf8"),context);
  const Klass=vm.runInContext("ShipPackages1011Visualizer",context);
  for(const language of ["vi","en"]) {
    const host={innerHTML:""},renderer=new Klass({host,language});
    for(const [weights,days] of cases) {
      const run=problem.builder(weights,{days});
      for(const step of run.steps) {renderer.render(JSON.parse(JSON.stringify(step)));assert.match(host.innerHTML,/s1011-viz/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);}
      renderer.render(run.steps[0]);const first=host.innerHTML;
      renderer.render(run.steps.at(-1));renderer.render(run.steps[0]);assert.equal(host.innerHTML,first);
    }
  }
});

test("1011 dedicated assets load lazily and the new renderer takes priority", () => {
  const html=fs.readFileSync(require.resolve("../public/index.html"),"utf8");
  assert.match(html,/renderer-ship-packages-1011\.js/);assert.match(html,/ship-packages-1011\.css/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,""),/(?:renderer-)?ship-packages-1011\.(?:js|css)/);
  const script=fs.readFileSync(require.resolve("../public/script.js"),"utf8");
  assert.ok(script.indexOf("step.shipPackages1011View")<script.indexOf("step.shipCapacityView"));
});
