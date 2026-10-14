"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[374];
const PYTHON = "C:/Users/david.truong/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const cases = [[10,6],[1,1],[2,1],[2,2],[20,1],[20,20],[2147483647,1],[2147483647,2147483647],[2147483647,1073741824],[2147483647,1073741825]];
function python(program, input) {
  const run = spawnSync(PYTHON,["-c",program],{encoding:"utf8",input:JSON.stringify(input)});
  assert.equal(run.status,0,run.stderr);
  return JSON.parse(run.stdout);
}

test("374 finds every small hidden number and large boundary picks using logarithmic API calls", () => {
  const inputs = [...cases];
  for(let n=1;n<=70;n++)for(let pick=1;pick<=n;pick++)inputs.push([n,pick]);
  for(const [n,pick] of inputs) {
    const run=problem.builder([n],{pick});
    assert.equal(run.answer,pick);
    assert.ok(run.calls<=Math.floor(Math.log2(n))+1);
    assert.equal(run.steps.filter(s=>s.codeLines[0]===6).length,run.calls);
    for(const step of run.steps) {
      const v=step.guessNumber374View;
      assert.equal(v.source.text,problem.code[v.source.line-1]);
      assert.equal(v.source.timing,"before");
      if(v.lo!==null)assert.ok(v.lo<=pick&&pick<=v.hi);
      if(v.nextLo!==undefined)assert.ok(v.nextLo<=pick&&pick<=v.nextHi&&v.nextHi-v.nextLo<v.hi-v.lo);
      assert.ok(!("pick" in v)&&!("pick" in v.locals));
      for(const call of v.history) {
        assert.equal(call.number,call.lo+Math.floor((call.hi-call.lo)/2));
        assert.equal(call.feedback,call.number>pick?-1:call.number<pick?1:0);
      }
    }
    assert.ok(run.steps.length<=187);
  }
});

test("374 line numbers and variable snapshots match CPython exactly", () => {
  const program=problem.code.join("\n")+`\nimport sys,json
results=[]
for n,pick in json.load(sys.stdin):
    def guess(number):
        return -1 if number>pick else 1 if number<pick else 0
    events=[]
    def trace(frame,event,arg):
        if frame.f_code.co_name=='guessNumber' and event=='line':
            events.append({'line':frame.f_lineno,'locals':{k:v for k,v in frame.f_locals.items() if k!='self'}})
        return trace
    sys.settrace(trace)
    result=Solution().guessNumber(n)
    sys.settrace(None)
    results.append({'answer':result,'events':events})
print(json.dumps(results))
`;
  python(program,cases).forEach((expected,i)=>{
    const [n,pick]=cases[i],run=problem.builder([n],{pick});
    assert.equal(run.answer,expected.answer);
    assert.deepEqual(run.steps.map(s=>({line:s.codeLines[0],locals:s.guessNumber374View.locals})),expected.events);
  });
});

test("374 does not show the preceding guess's API response for a new midpoint", () => {
  const run=problem.builder([10],{pick:6});
  const calls=run.steps.filter(s=>s.guessNumber374View.phase==="call").map(s=>s.guessNumber374View);
  assert.deepEqual(calls.map(v=>v.mid),[5,8,6]);
  assert.deepEqual(calls.map(v=>v.feedback),[null,null,null]);
  assert.equal(calls[1].locals.feedback,1);
  assert.deepEqual(run.steps.filter(s=>s.guessNumber374View.phase==="check-equal").map(s=>s.guessNumber374View.feedback),[1,-1,0]);
});

test("374 validates constraints and passes only n into the public method", () => {
  for(const input of [[],[0],[2147483648],[1.5],[NaN],[true],["10"],[1,2]])assert.throws(()=>problem.builder(input,{pick:1}),/374: n/);
  for(const pick of [0,11,1.5,true,null,"","6.5",NaN])assert.throws(()=>problem.builder([10],{pick}),/374: pick/);
  assert.deepEqual(problem.liveArgs([10],{pick:"6"}),[10]);
  assert.deepEqual(problem.liveOracle([10],{pick:"6"}),{type:"guess-number",n:10,pick:6});
  assert.equal(problem.debugMode,"line-by-line");
  assert.doesNotMatch(problem.code.join("\n"),/\bpick\b/);
});

test("374 actual live editor tracer supports the API without exposing pick and preserves ordinary calls", () => {
  const source=fs.readFileSync(require.resolve("../public/live-editor.js"),"utf8");
  const template=source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1];
  const tracer=vm.runInNewContext(template);
  const program=tracer+`\nimport json,sys
payload=json.load(sys.stdin)
results=[__viz_run_trace(payload['code'],'guessNumber',[n],None,{'type':'guess-number','n':n,'pick':pick}) for n,pick in payload['cases']]
ordinary=__viz_run_trace('class Solution:\\n    def twice(self, n):\\n        return n * 2','twice',[4])
invalid=[]
for oracle in [{'type':'bad'},{'type':'guess-number','n':10,'pick':11}]:
    try:
        __viz_run_trace(payload['code'],'guessNumber',[10],None,oracle)
    except ValueError:
        invalid.append(True)
probe=__viz_run_trace('class Solution:\\n    def probe(self, n):\\n        return [guess(1), guess(6), guess(10), "pick" in globals()]','probe',[10],None,{'type':'guess-number','n':10,'pick':6})
print(json.dumps({'results':results,'ordinary':ordinary,'invalid':invalid,'probe':probe}))
`;
  const output=python(program,{code:problem.code.join("\n"),cases});
  output.results.forEach((result,i)=>{
    const [n,pick]=cases[i],run=problem.builder([n],{pick});
    assert.equal(result.result,pick);
    assert.deepEqual(result.trace.slice(0,-1).map(entry=>({line:entry.line,locals:entry.vars})),run.steps.map(s=>({line:s.codeLines[0],locals:s.guessNumber374View.locals})));
  });
  assert.equal(output.ordinary.result,8);
  assert.deepEqual(output.invalid,[true,true]);
  assert.deepEqual(output.probe.result,[1,0,-1,false]);
});

test("374 renders both languages, hides the secret until success and Prev restores the picture", () => {
  const context={escapeHtml:String};vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-guess-number-374.js"),"utf8"),context);
  const Klass=vm.runInContext("GuessNumber374Visualizer",context);
  for(const language of ["vi","en"]) {
    const host={innerHTML:""},renderer=new Klass({host,language});
    for(const [n,pick] of cases) {
      const run=problem.builder([n],{pick});
      for(const step of run.steps) {
        renderer.render(JSON.parse(JSON.stringify(step)));
        assert.match(host.innerHTML,/gn374-viz/);
        assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);
        const correct=step.guessNumber374View.feedback===0;
        assert.equal(host.innerHTML.includes('gn374-secret revealed'),correct);
        if(!correct)assert.match(host.innerHTML,/class="gn374-secret"[\s\S]*?<b>\?<\/b>/);
      }
      renderer.render(run.steps[0]);const first=host.innerHTML;
      renderer.render(run.steps.at(-1));renderer.render(run.steps[0]);assert.equal(host.innerHTML,first);
    }
  }
});

test("374 dedicated assets load lazily and renderer precedes generic binary search", () => {
  const html=fs.readFileSync(require.resolve("../public/index.html"),"utf8");
  assert.match(html,/renderer-guess-number-374\.js/);assert.match(html,/guess-number-374\.css/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,""),/(?:renderer-)?guess-number-374\.(?:js|css)/);
  const script=fs.readFileSync(require.resolve("../public/script.js"),"utf8");
  assert.ok(script.indexOf("step.guessNumber374View")<script.indexOf("step.shipPackages1011View"));
});
