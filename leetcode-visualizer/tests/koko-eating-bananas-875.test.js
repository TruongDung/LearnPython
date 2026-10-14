"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[875];

function oracle(piles, h) {
  for (let speed = 1; speed <= Math.max(...piles); speed++) {
    const hours = piles.reduce((total, pile) => total + Math.ceil(pile / speed), 0);
    if (hours <= h) return speed;
  }
  return Math.max(...piles);
}

test("875 explicit loop uses one precise before-execution frame per Python line", () => {
  assert.equal(problem.debugMode,"line-by-line");
  const run=problem.builder([3,6,7,11],{h:8});
  assert.equal(run.answer,4);
  assert.ok(run.steps.every(s=>s.codeBlock===1&&s.codeLines.length===1&&s.koko875View.source.text===problem.code[s.codeLines[0]-1]));
  assert.equal(run.steps.find(s=>s.koko875View.phase==="mid").codeLines[0],7);
  assert.equal(run.steps.find(s=>s.koko875View.phase==="add").codeLines[0],10);
  assert.equal(run.steps.find(s=>s.koko875View.phase==="check").codeLines[0],11);
  assert.equal(run.steps.at(-1).codeLines[0],16);
  assert.equal(run.steps.filter(s=>s.final).length,1);
});
test("875 binary search finds the smallest feasible speed across edge and varied inputs", () => {
  const examples = [
    [[3, 6, 7, 11], 8],
    [[30, 11, 23, 4, 20], 5],
    [[30, 11, 23, 4, 20], 6],
    [[312884470], 312884469],
    [[1, 1, 1], 3],
  ];
  for (let seed = 1; seed <= 50; seed++) {
    let value = seed;
    const next = (max) => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value % max + 1;
    };
    const piles = Array.from({ length: next(8) }, () => next(30));
    examples.push([piles, piles.length + next(40)]);
  }
  for (const [piles, h] of examples) {
    assert.equal(problem.builder(piles, { h }).answer, oracle(piles, h));
  }
});

test("875 rejects invalid piles and impossible hour limits without silent correction", () => {
  for (const piles of [[], [0], [-2], [1.5], [1000000001], [1, Number.NaN]]) {
    assert.throws(() => problem.builder(piles, { h: Math.max(8, piles.length) }), /875: piles/);
  }
  for (const h of [0, 2.5, 1000000001, 2]) {
    assert.throws(() => problem.builder([3, 6, 7], { h }), /875: h/);
  }
});

test("875 keeps the alternate manual-ceiling trace mapped to its own code block", () => {
  const result = problem.builder([3, 6, 7, 11], { h: 8, approach: 2 });
  assert.equal(result.answer, 4);
  assert.ok(result.steps.every((step) => step.codeBlock === 2
    && step.codeLines.length >= 1
    && step.codeLines.every((line) => line >= 1 && line <= problem.code2.length)));
});


test("875 debug lines and Python locals exactly match CPython line events", () => {
  const {spawnSync}=require("node:child_process");
  const cases=[[[3,6,7,11],8],[[30,11,23,4,20],5],[[30,11,23,4,20],6],[[1],1],[[312884470],312884469]];
  for(const approach of [1,2]) {
  const program=(approach===1?problem.code:problem.code2).join("\n")+"\nimport sys,json\nresults=[]\nfor piles,h in json.load(sys.stdin):\n    events=[]\n    def trace(frame,event,arg):\n        if frame.f_code.co_name=='minEatingSpeed' and event=='line':\n            events.append({'line':frame.f_lineno,'locals':{k:v for k,v in frame.f_locals.items() if k in ('lo','hi','start','end','mid','hours','pile')}})\n        return trace\n    sys.settrace(trace)\n    answer=Solution().minEatingSpeed(piles,h)\n    sys.settrace(None)\n    results.append({'answer':answer,'events':events})\nprint(json.dumps(results))\n";
  const py=spawnSync("C:/Users/david.truong/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe",["-c",program],{encoding:"utf8",input:JSON.stringify(cases)});
  assert.equal(py.status,0,py.stderr);
  const expected=JSON.parse(py.stdout);
  cases.forEach(([piles,h],i)=>{
    const run=problem.builder(piles,{h,approach});
    assert.equal(run.answer,expected[i].answer);
    assert.deepEqual(run.steps.map(s=>({line:s.codeLines[0],locals:s.koko875View.locals})),expected[i].events);
  });
  }
});
test("875 bounds large inputs and preserves minimum-speed proof", () => {
  const run=problem.builder(Array(10000).fill(1000000000),{h:10000});
  assert.equal(run.answer,1000000000);
  assert.ok(run.steps.length<=451);
  const final=run.steps.at(-1).koko875View;
  assert.equal(final.answerHours,10000);assert.equal(final.slowerHours,20000);
  assert.equal(final.truncated,true);
  assert.ok(JSON.stringify(run).length<2000000);
});
test("875 renders every frame in both languages and Prev restores the exact view", () => {
  const fs=require("node:fs"),vm=require("node:vm"),context={escapeHtml:String};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-koko-eating-bananas-875.js"),"utf8"),context);
  const Klass=vm.runInContext("Koko875Visualizer",context);
  for(const language of ["vi","en"]) {
    const host={innerHTML:""},renderer=new Klass({host,language});
    for(const approach of [1,2]) for(const piles of [[3,6,7,11],[1],[1000000000]]) {
      const run=problem.builder(piles,{h:Math.max(8,piles.length),approach});
      for(const step of run.steps){renderer.render(JSON.parse(JSON.stringify(step)));assert.match(host.innerHTML,/k875-viz/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);}
      renderer.render(run.steps[0]);const first=host.innerHTML;
      renderer.render(run.steps.at(-1));renderer.render(run.steps[0]);assert.equal(host.innerHTML,first);
    }
  }
});
