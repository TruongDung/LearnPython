"use strict";
const { test } = require("node:test"), assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process"), fs = require("node:fs"), vm = require("node:vm");
const p = require("../problems").SUPPORTED[124];
const examples = [[-10,9,20,null,null,15,7],[1,2,3],[-8,-3,-10],[2,-1,-2],[-3],[-1,null,2,null,3,null,-2,null,4],[0,0,0],[1,2,2],[1,null,2,3],[5,-10,6,20,30]];
const run = input => p.builder(input), last = r => r.steps.at(-1).maxPathSum124View;
function oracle(nodes) {
  const graph = new Map(nodes.map(n => [n.id, []])), values = new Map(nodes.map(n => [n.id, n.value]));
  for (const n of nodes) if (n.parent) { graph.get(n.parent).push(n.id); graph.get(n.id).push(n.parent); }
  let answer = -Infinity;
  const visit = (id, previous, sum) => { sum += values.get(id); answer = Math.max(answer, sum); for (const next of graph.get(id)) if (next !== previous) visit(next, id, sum); };
  for (const n of nodes) visit(n.id, null, 0);
  return answer;
}
function pathSum(nodes, path) {
  assert.ok(path.length); assert.equal(new Set(path).size, path.length);
  const byId = new Map(nodes.map(n => [n.id, n]));
  for (let i = 1; i < path.length; i++) assert.ok(byId.get(path[i]).parent === path[i-1] || byId.get(path[i-1]).parent === path[i]);
  return path.reduce((sum, id) => sum + byId.get(id).value, 0);
}

test("124 agrees with all simple paths, including paths below the root and all-negative trees", () => {
  const cases = [...examples]; let seed = 124;
  const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  for (let i = 0; i < 100; i++) cases.push(Array.from({ length: 1 + random(31) }, () => random(101) - 50));
  for (const input of cases) {
    const original = [...input], r = run(input), v = last(r);
    assert.equal(r.answer, oracle(v.nodes)); assert.equal(pathSum(v.nodes, v.best.path), r.answer);
    assert.equal(v.answer, r.answer); assert.deepEqual(input, original); assert.equal(v.trace.truncated, false);
    assert.equal(r.steps.filter(s => s.final).length, 1); assert.equal(v.ledger.length, v.nodes.length);
  }
  const sample = last(run(examples[0])); assert.equal(sample.answer, 42); assert.equal(sample.rootReturn, 25);
  assert.deepEqual(sample.best.path, ["0:5","0:2","0:6"]);
  const negative = last(run(examples[2])); assert.equal(negative.answer, -3); assert.deepEqual(negative.best.path, ["0:1"]);
  assert.equal(last(run([0,0,0])).best.path.length, 1);
  const compact = last(run([1,null,2,3])); assert.equal(compact.nodes.find(n => n.id === "0:2").left, "0:3");
});

test("124 every completed Python statement and recursive frame agrees with native CPython", () => {
  const source = "import json,sys,runpy\np=json.load(sys.stdin)\nf=runpy.run_path(p['path'])['picture_trace']\nprint(json.dumps([json.loads(f({'code':p['code'],'method':'maxPathSum','args':[a],'treeArgs':[0],'stateClasses':['Solution']})) for a in p['inputs']]))";
  const native = spawnSync(process.env.PYTHON || "python3", ["-c", source], { input: JSON.stringify({ path: require.resolve("../problems/picture-trace.py"), code: p.code.join("\n"), inputs: examples }), encoding: "utf8", maxBuffer: 16e6 });
  assert.equal(native.status, 0, native.stderr);
  JSON.parse(native.stdout).forEach((ref, i) => {
    const r = run(examples[i]); assert.equal(r.answer, ref.answer); assert.equal(r.steps.length, ref.events.length);
    ref.events.forEach((event, j) => {
      const step = r.steps[j], v = step.maxPathSum124View;
      assert.deepEqual(step.codeLines, [event.line]); assert.equal(v.source.text, p.code[event.line - 1].trim()); assert.equal(v.source.timing, "after");
      for (const name of ["locals","outer","frames","scope","branch","returning","returned"]) assert.deepEqual(v[name], event[name]);
      assert.equal(v.best.value, event.locals.self.max_sum);
      assert.deepEqual(v.stack, event.frames.filter(f => f.name === "gain").map(f => ({ node: f.locals.node?.id ?? null, value: f.locals.node?.val ?? null, left: f.locals.left_gain ?? null, right: f.locals.right_gain ?? null })));
      assert.equal(step.vars.find(w => w.name === "self.max_sum").rawValue, event.locals.self.max_sum);
    });
  });
});

test("124 child returns, parent clamps, candidates and one-arm returns appear only on their native statements", () => {
  let cut = false, emptyLeft = false, emptyRight = false;
  for (const input of examples) {
    const r = run(input); let previous = null;
    for (const step of r.steps) {
      const v = step.maxPathSum124View, row = v.current, line = v.source.line;
      if (v.scope === "gain" && v.active) {
        if (line === 5) assert.deepEqual([row.leftRaw,row.left,row.rightRaw,row.right,row.candidate,row.gain], Array(6).fill(null));
        if (line === 7) { assert.equal(row.left, v.locals.left_gain); assert.equal(row.left, Math.max(row.leftRaw, 0)); assert.equal(row.right, null); }
        if (line === 8) { assert.equal(row.right, v.locals.right_gain); assert.equal(row.right, Math.max(row.rightRaw, 0)); }
        if (line < 9) { assert.equal(row.candidate, null); assert.equal(row.gain, null); }
        if (line === 9) { assert.equal(row.candidate, row.value + v.locals.left_gain + v.locals.right_gain); assert.equal(row.gain, null); }
        if (line === 10) { assert.equal(row.gain, v.returned); assert.equal(row.gain, row.value + Math.max(row.left, row.right)); }
      }
      if (v.clamp) { assert.ok([7,8].includes(line)); if (v.clamp.raw < 0) { cut = true; assert.equal(v.clamp.value, 0); assert.equal(v.clamp.discarded, true); } }
      if (v.emptyCall) {
        if (line === 5) { assert.equal(v.branch, true); assert.equal(v.emptyCall.returned, null); }
        if (line === 6) { assert.equal(v.returning, true); assert.equal(v.emptyCall.returned, 0); }
        const parent = v.stack.at(-2), side = v.emptyCall.side;
        if (side === "left") { emptyLeft = true; assert.equal(parent.left, null); } else { emptyRight = true; assert.equal(parent.right, null); }
      }
      if (previous && line !== 9) assert.deepEqual(v.best.path, previous.best.path);
      if (line === 9) assert.equal(v.best.value, Math.max(v.best.before === "−∞" ? -Infinity : v.best.before, row.candidate));
      assert.ok(!Object.hasOwn(v.locals, "candidate") && !Object.hasOwn(v.locals, "path"));
      previous = v;
    }
  }
  assert.ok(cut && emptyLeft && emptyRight);
});

test("124 illustrated paths obey real sums, use one descending arm for a return, and retain ties", () => {
  for (const input of examples) {
    const r = run(input), saved = JSON.stringify(r.steps[0]);
    for (const step of r.steps) {
      const v = step.maxPathSum124View;
      for (const row of v.ledger) {
        if (row.candidate !== null) assert.equal(pathSum(v.nodes, row.candidatePath), row.candidate);
        if (row.gain !== null) {
          assert.equal(pathSum(v.nodes, row.path), row.gain); assert.equal(row.path[0], row.id);
          row.path.slice(1).forEach((id, i) => assert.equal(v.nodes.find(n => n.id === id).parent, row.path[i]));
        }
      }
      if (v.best.value !== "−∞") assert.equal(pathSum(v.nodes, v.best.path), v.best.value);
      if (v.source.line === 10) assert.deepEqual(v.scene.path, v.returnedGain.path);
      if (v.source.line === 9) assert.deepEqual(v.scene.path, v.current.candidatePath);
    }
    assert.equal(JSON.stringify(r.steps[0]), saved);
  }
  const ties = last(run([1,2,2])); assert.deepEqual(ties.ledger.find(r => r.id === "0:0").path, ["0:0","0:1"]);
});

test("124 accepts compact/JSON trees and completely traces the permitted 31-node depth", () => {
  for (const input of [null, {}, 1, [], [null], [null,1], [1,null,null,2], [NaN], [Infinity], [1.5], [-1001], [1001], Array(2), Array(32).fill(1), "1,,2", "[1,]", "", " "]) assert.throws(() => run(input), RangeError);
  assert.equal(run("[1,null,2,3]").answer, 6); assert.equal(run("1,None,2,3").answer, 6);
  const skewed = [1000]; for (let i = 1; i < 31; i++) skewed.push(null,1000);
  const r = run(skewed), v = last(r); assert.equal(r.answer, 31000); assert.equal(v.rootReturn, 31000);
  assert.equal(v.nodes.length, 31); assert.equal(v.nodes.at(-1).depth, 30); assert.equal(v.trace.truncated, false); assert.equal(v.trace.captured, r.steps.length);
  assert.equal(v.ledger.filter(row => row.gain !== null).length, 31);
  assert.deepEqual(p.liveArgs("1,null,2,3"), [{__viz_type:"binary_tree",values:[1,null,2,3],tree_id:"root"}]);
  assert.equal(p.debugMode, "line-by-line");
});

function renderer(language, extra = {}) {
  const host = { innerHTML: "", querySelector: () => null, querySelectorAll: () => [] };
  const context = { lang: language, document: { getElementById: () => host }, ...extra };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-max-path-sum-124.js"), "utf8"), context);
  return { context, host, render: step => { context.renderMaxPathSum124View(step); return host.innerHTML; } };
}

test("124 pictures show every actual node, frame, partial gain and negative/zero answer in VI/EN", () => {
  for (const language of ["vi","en"]) for (const input of examples) {
    const r = run(input), saved = JSON.stringify(r), ui = renderer(language), first = ui.render(r.steps[0]);
    for (const step of r.steps) {
      const v = step.maxPathSum124View, html = ui.render(step); assert.doesNotMatch(html, /NaN|undefined|Infinity/);
      assert.ok(html.includes(`data-best-value="${v.best.value}"`));
      assert.deepEqual([...html.matchAll(/data-mps124-node="([^"]+)" data-node-value="(-?\d+)"/g)].map(m => [m[1], +m[2]]), v.nodes.map(n => [n.id,n.value]));
      assert.deepEqual([...html.matchAll(/data-frame-index="(\d+)" data-frame-node="([^"]+)" data-frame-left="([^"]+)" data-frame-right="([^"]+)"/g)].map(m => [+m[1],m[2],m[3],m[4]]), v.stack.map((f,i) => [i,String(f.node),String(f.left),String(f.right)]));
      assert.deepEqual([...html.matchAll(/data-ledger-node="([^"]+)" data-ledger-field="([^"]+)" data-ledger-value="([^"]+)"/g)].map(m => [m[1],m[2],m[3]]), v.ledger.flatMap(row => ["left","right","candidate","gain"].map(name => [row.id,name,String(row[name])])));
      if (v.clamp) assert.ok(html.includes(`data-clamp-raw="${v.clamp.raw}" data-clamp-value="${v.clamp.value}"`));
      if (v.answer !== null) assert.ok(html.includes(`data-answer="${v.answer}"`));
    }
    assert.equal(ui.render(r.steps[0]), first); assert.equal(JSON.stringify(r), saved);
  }
  assert.equal(renderer("vi").context.mps124Escape('<script>"&'), "&lt;script&gt;&quot;&amp;");
});

test("124 node/best/return/result jumps and duplicate-value node selection target native statements", () => {
  const r = run(examples[0]);
  for (const [kind, predicate] of [["node",v=>v.source.line===5&&v.active!==null],["best",v=>v.source.line===9&&v.best.improved],["return",v=>v.scope==="gain"&&v.returning],["result",v=>v.answer!==null]]) {
    let stopped = 0, rendered = 0; const ui = renderer("vi", {steps:r.steps,stepIndex:0,renderStep:()=>rendered++,stopPlay:()=>stopped++});
    ui.context.mps124Jump(kind); assert.ok(predicate(r.steps[ui.context.stepIndex].maxPathSum124View)); assert.equal(stopped,1); assert.equal(rendered,1);
    ui.context.stepIndex = r.steps.length-1; ui.context.mps124Jump(kind); assert.equal(ui.context.stepIndex,r.steps.length-1);
  }
  const duplicates = run([1,2,2]);
  for (const key of ["Enter"," "]) {
    const handlers = {}, node = {dataset:{mps124Node:"0:2"},addEventListener:(name,fn)=>{handlers[name]=fn;}};
    const host = {querySelectorAll:selector=>selector==="[data-mps124-node]"?[node]:[]};
    const ui = renderer("en", {steps:duplicates.steps,stepIndex:0,renderStep(){}});let prevented=0,stopped=0;
    ui.context.mps124Bind(host);handlers.keydown({key,preventDefault:()=>prevented++,stopPropagation:()=>stopped++});
    assert.equal(duplicates.steps[ui.context.stepIndex].maxPathSum124View.active,"0:2"); assert.equal(prevented,1);assert.equal(stopped,1);
  }
});
