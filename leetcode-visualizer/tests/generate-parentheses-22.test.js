"use strict";
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[22];
const build = (n, approach = 1) => (approach === 1 ? problem.builder : problem.builder2)([n]);

function oracle(n) {
  const answer = [];
  for (let mask = 0; mask < 2 ** (2*n); mask++) {
    const s = mask.toString(2).padStart(2*n,'0').replace(/0/g,'(').replace(/1/g,')');
    let balance = 0, valid = true;
    for (const char of s) { balance += char === '(' ? 1 : -1; if (balance < 0) valid = false; }
    if (valid && balance === 0) answer.push(s);
  }
  return answer;
}

test('22 returns all Catalan strings for both complete approaches, with no duplicate or missing answers', () => {
  const counts = [0,1,2,5,14,42];
  for (let n = 1; n <= 5; n++) {
    const expected = oracle(n);
    assert.equal(expected.length, counts[n]);
    for (const approach of [1,2]) {
      const run = build(n,approach);
      assert.deepEqual([...run.answer].sort(), expected.sort());
      assert.equal(new Set(run.answer).size, counts[n]);
      assert.deepEqual(run.steps.at(-1).generateParentheses22View.results, run.answer);
      assert.equal(run.steps.filter(step => step.final).length, 1);
    }
  }
  assert.deepEqual(build(3).answer, ['((()))','(()())','(())()','()(())','()()()']);
});

for (const approach of [1,2]) test(`22 approach ${approach} matches every completed CPython line and its actual local variables`, () => {
  const code = approach === 1 ? problem.code : problem.code2;
  const python = `import sys,json,copy
scope={};filename='<gp22>';exec(compile(json.load(sys.stdin),filename,'exec'),scope)
runs=[]
for n in range(1,6):
 events=[];pending={}
 def trace(frame,event,arg):
  if frame.f_code.co_filename!=filename or frame.f_code.co_name not in ('generateParenthesis','backtrack'):return trace
  if event in ('line','return'):
   if frame in pending:
    x=frame.f_locals;callers=[];cursor=frame
    while cursor:
     if cursor.f_code.co_filename==filename and cursor.f_code.co_name=='backtrack':callers.append({k:copy.deepcopy(cursor.f_locals[k]) for k in ('path','opened','closed')})
     cursor=cursor.f_back
    events.append({'line':pending.pop(frame),'scope':frame.f_code.co_name,'locals':copy.deepcopy({k:x[k] for k in ('n','result','path','opened','closed','width','mask','i','balance','valid') if k in x}),'stack':list(reversed(callers))})
   if event=='line':pending[frame]=frame.f_lineno
  return trace
 sys.settrace(trace);answer=scope['Solution']().generateParenthesis(n);sys.settrace(None)
 runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const proc = spawnSync('python3',['-c',python],{ input:JSON.stringify(code.join('\n')), encoding:'utf8', maxBuffer:48*1024*1024 });
  assert.equal(proc.status,0,proc.stderr);
  JSON.parse(proc.stdout).forEach((reference,c) => {
    const n = c+1, run = build(n,approach);
    assert.deepEqual(run.answer,reference.answer); assert.equal(run.steps.length, reference.events.length, `n=${n}`);
    run.steps.forEach((step,i) => {
      const v=step.generateParentheses22View, e=reference.events[i];
      assert.deepEqual(step.codeLines,[e.line],`n=${n}, event=${i}`);
      assert.deepEqual(v.locals,e.locals,`n=${n}, event=${i}, line=${e.line}`);
      assert.equal(v.scope,e.scope); assert.equal(v.source.timing,'after'); assert.equal(v.source.line,e.line);
      assert.deepEqual(v.results,e.locals.result);
      if (approach === 1) {
        assert.deepEqual(v.stack.map(f => ({path:[...f.path],opened:f.opened,closed:f.closed})),e.stack);
        assert.deepEqual(step.vars.map(w => w.value),[n,e.locals.path??'—',e.locals.opened??'—',e.locals.closed??'—',e.locals.path?.length??'—',e.locals.result.length]);
      } else assert.deepEqual(step.vars.map(w => w.value),[e.locals.mask??'—',e.locals.i??'—',e.locals.path??'—',e.locals.balance??'—',e.locals.valid??'—',e.locals.result.length]);
    });
  });
});

test('22 append and pop mutate only path; caller counts and copied saved strings remain correct', () => {
  const run=build(3), original=JSON.stringify(run); let previous;
  for (const step of run.steps) {
    const v=step.generateParentheses22View;
    for (const node of v.nodes) {
      assert.ok(node.closed <= node.opened && node.opened <= v.n);
      assert.equal(node.path.length,node.opened+node.closed);
    }
    if (v.phase.startsWith('append-')) {
      assert.equal(v.path,previous.path+v.added);
      assert.equal(v.opened,previous.opened); assert.equal(v.closed,previous.closed);
      assert.equal(v.path.length,v.opened+v.closed+1);
    }
    if (v.phase.startsWith('pop-')) assert.equal(v.path,previous.path.slice(0,-1));
    if (v.phase==='save-result') assert.equal(v.results.at(-1),v.path);
    if (previous && v.phase!=='save-result') assert.deepEqual(v.results,previous.results);
    previous=v;
  }
  assert.equal(run.steps.at(-1).generateParentheses22View.stack.length,0);
  assert.deepEqual(run.steps.find(s=>s.generateParentheses22View.phase==='save-result').generateParentheses22View.results,['((()))']);
  assert.equal(JSON.stringify(run),original);
});

test('22 bitmask preserves variable lifetimes between masks, rejects bad prefixes, and includes exhausted loop headers', () => {
  const run=build(2,2);
  assert.ok(run.steps.some(s=>s.generateParentheses22View.phase==='mark-invalid'));
  assert.ok(run.steps.some(s=>s.generateParentheses22View.phase==='bits-exhausted'));
  assert.equal(run.steps.at(-2).generateParentheses22View.phase,'masks-exhausted');
  const second=run.steps.find(s=>s.generateParentheses22View.phase==='next-mask' && s.generateParentheses22View.mask===1);
  assert.deepEqual(second.generateParentheses22View.locals.path,[')']);
  const a=run.steps.find(s=>s.generateParentheses22View.phase==='append-close');
  assert.equal(a.generateParentheses22View.balance,0);
  assert.equal(a.generateParentheses22View.path,')');
  assert.equal(run.steps.at(-1).generateParentheses22View.inspected.length,10);
});

test('22 validates the same bounded input for both traces and live Python arguments', () => {
  assert.deepEqual(problem.liveArgs([3]),[3]);
  for (const value of [0,6,-1,1.5,NaN,Infinity,'abc','',null,undefined,true,{},[],[1,2]]) {
    assert.throws(()=>problem.builder(value),/22/);
    assert.throws(()=>problem.builder2(value),/22/);
    assert.throws(()=>problem.liveArgs(value),/22/);
  }
});

function renderer(lang) {
  const element={innerHTML:'',querySelector:()=>null};
  const context={lang,$:()=>element,escapeHtml:x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-generate-parentheses-22.js'),'utf8'),context);
  return step=>{context.renderGenerateParentheses22View(step);return element.innerHTML;};
}

test('22 renders colored pair arcs, balance paths, connected tree, shared frames, bit decoding and every saved result in both languages',()=>{
  for (const language of ['en','vi']) {
    const render=renderer(language);
    for (const approach of [1,2]) {
      const run=build(3,approach), original=JSON.stringify(run);
      for (const step of run.steps) {
        const html=render(step),v=step.generateParentheses22View;
        assert.match(html,/gp22-viz/); assert.doesNotMatch(html,/undefined|NaN|Infinity|object Object|<p\b|<ol\b|<table\b/);
        assert.deepEqual([...html.matchAll(/data-result="([()]+)"/g)].map(m=>m[1]),v.results);
        if (!step.final) { assert.match(html,/gp22-pairs/);assert.match(html,/gp22-balance-picture/); }
        if (approach===1) {
          assert.match(html,/gp22-tree/);
          assert.equal((html.match(/data-node-id=/g)||[]).length,v.nodes.length);
          assert.deepEqual([...html.matchAll(/data-frame-id="(\d+)"/g)].map(m=>Number(m[1])),v.stack.map(f=>f.id));
          if(v.nodes.length>1) assert.match(html,/gp22-edge /);
        } else assert.match(html,/gp22-mask-window/);
      }
      const first=render(run.steps[0]);render(run.steps.at(-1));assert.equal(render(run.steps[0]),first);
      assert.equal(JSON.stringify(run),original);
    }
    const n5=render(build(5).steps.at(-1));assert.equal((n5.match(/data-result=/g)||[]).length,42);
    assert.match(n5,/data-pair="0-9"/);
  }
});

test('22 loads scoped assets lazily, supports light/dark, sticky watches and horizontal code scrolling',()=>{
  const html=fs.readFileSync(require.resolve('../public/index.html'),'utf8'),css=fs.readFileSync(require.resolve('../public/generate-parentheses-22.css'),'utf8');
  assert.equal(problem.debugMode,'line-by-line'); assert.equal(typeof problem.builder2,'function');
  assert.match(html,/generate-parentheses-22\.css[^\n]*data-problem-ids="22"/);
  assert.match(html,/renderer-generate-parentheses-22\.js[^\n]*data-problem-ids="22"/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g,''),/(?:renderer-)?generate-parentheses-22\.(?:css|js)/);
  assert.match(css,/\[data-theme="light"\] \.gp22-viz/);
  assert.match(css,/#varsPanel[^}]*position:sticky/);
  assert.match(css,/\.code-panel\s*\{[^}]*overflow-x:auto/);
  assert.match(css,/\.code-line\s*\{[^}]*white-space:pre/);
  assert.match(css,/@container gp22 \(max-width:650px\)/);
});
