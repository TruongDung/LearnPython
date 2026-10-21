const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync, spawn } = require("node:child_process");
const fs = require("node:fs"), vm = require("node:vm"), path = require("node:path");
const problem = require("../problems").SUPPORTED[114];
const cases = [[], [0], [1,2,5,3,4,null,6], [1,null,2,3], [1,2,null,3,null,4], [1,null,2,null,3,null,4], [7,7,7,7,7], [-1,-2,3,null,4], [1,2,3,null,4,null,5,6], [1,null,2,3,4,null,5]];
let seed = 114;
for (let t = 0; t < 48; t++) {
  const values = [t % 9 - 4]; let slots = 2, count = 1;
  while (slots && count < 2 + t % 17) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const value = seed % 5 === 0 ? null : seed % 11 - 5;
    values.push(value); slots--;
    if (value !== null) { slots += 2; count++; }
  }
  while (values.at(-1) === null) values.pop();
  cases.push(values);
}
function oracle(values) {
  if (!values.length || values[0] === null) return { nodes: [], ids: [], answer: [] };
  const nodes = [{ id: 0, value: values[0], left: null, right: null }];
  let cursor = 1;
  for (const node of nodes) for (const side of ["left", "right"]) {
    if (cursor < values.length && values[cursor] !== null) {
      node[side] = nodes.length; nodes.push({ id: nodes.length, value: values[cursor], left: null, right: null });
    }
    cursor++;
  }
  const stack = [0], ids = [];
  while (stack.length) {
    const id = stack.pop(), node = nodes[id]; ids.push(id);
    if (node.right !== null) stack.push(node.right);
    if (node.left !== null) stack.push(node.left);
  }
  return { nodes, ids, answer: ids.map(id => nodes[id].value) };
}

test("114 preserves every node identity and value, builds preorder right links and clears every left", () => {
  for (const input of cases) {
    const expected = oracle(input), run = problem.builder(input), v = run.steps.at(-1).flatten114View;
    assert.deepEqual(run.answer, expected.answer);
    assert.deepEqual(v.chain, expected.ids);
    assert.deepEqual(v.original, expected.nodes);
    assert.equal(run.steps.filter(step => step.final).length, 1);
    for (const node of v.nodes) {
      assert.equal(node.left, null); assert.equal(node.value, expected.nodes[node.id].value);
      assert.equal(node.right, v.chain[v.chain.indexOf(node.id) + 1] ?? null);
    }
    for (const step of run.steps) {
      const view = step.flatten114View;
      assert.deepEqual(step.codeLines, [view.line]); assert.equal(view.source, problem.code[view.line - 1].trim());
      assert.equal(view.nodes.length, expected.nodes.length);
      assert.equal(new Set(view.nodes.map(node => node.id)).size, view.nodes.length);
      assert.ok(view.completed.every((id, i) => id === expected.ids[i]));
    }
  }
  assert.deepEqual(problem.builder("1,null,2,3,4,null,5").answer, [1,2,3,5,4]);
  assert.deepEqual(problem.builder("[]").steps.map(s => s.codeLines[0]), [3,4,13]);
});

test("114 each executed Python line, complete locals, pointer identities and actual graph match CPython", () => {
  const python = `import sys,json
data=json.load(sys.stdin)
registry=[]
class TreeNode:
    def __init__(self,val):
        self.val,self.left,self.right,self.ident=val,None,None,len(registry)
        registry.append(self)
ns={}
exec(compile(data['code'],'<114>','exec'),ns)
def encode(v):
    if isinstance(v,TreeNode): return {'val':v.val,'left':encode(v.left),'right':encode(v.right)}
    if v is None: return None
    return {}
out=[]
for values in data['cases']:
    registry=[]
    root=TreeNode(values[0]) if values else None
    index,head=1,0
    while head<len(registry) and index<len(values):
        parent=registry[head];head+=1
        for side in ('left','right'):
            if index<len(values) and values[index] is not None: setattr(parent,side,TreeNode(values[index]))
            index+=1
    events,pending=[],None
    def trace(frame,event,arg):
        global pending
        if frame.f_code.co_filename!='<114>' or frame.f_code.co_name!='flatten': return trace
        if event in ('line','return'):
            if pending is not None:
                values_now=dict(frame.f_locals)
                events.append({'line':pending,'locals':{k:encode(v) for k,v in values_now.items()},'pointers':{k:(v.ident if v is not None else None) for k,v in values_now.items() if k!='self'},'nodes':[{'id':n.ident,'value':n.val,'left':n.left.ident if n.left is not None else None,'right':n.right.ident if n.right is not None else None} for n in registry]})
            pending=frame.f_lineno if event=='line' else None
        return trace
    sys.settrace(trace)
    result=ns['Solution']().flatten(root)
    sys.settrace(None)
    out.append({'events':events,'result':result})
print(json.dumps(out))`;
  const execution = spawnSync("python", ["-c", python], { input: JSON.stringify({ code: problem.code.join("\n"), cases }), encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  assert.equal(execution.status, 0, execution.stderr);
  JSON.parse(execution.stdout).forEach((actual, i) => {
    assert.equal(actual.result, null);
    assert.deepEqual(problem.builder(cases[i]).steps.map(step => ({ line: step.codeLines[0], locals: Object.fromEntries(step.vars.map(v => [v.name, v.rawValue])), pointers: step.flatten114View.pointers, nodes: step.flatten114View.nodes })), actual.events, JSON.stringify(cases[i]));
  });
});

test("114 keeps temporary shared children on lines 9 and 10; only line 11 removes cur.left", () => {
  const run = problem.builder(problem.defaultInput);
  const at = line => run.steps.find(s => s.codeLines[0] === line).flatten114View;
  assert.equal(at(9).nodes[0].right, 2); assert.equal(at(9).nodes[4].right, 2);
  assert.equal(at(9).nodes[0].left, 1); assert.equal(at(10).nodes[0].left, 1); assert.equal(at(10).nodes[0].right, 1);
  assert.equal(at(11).nodes[0].left, null);
  assert.deepEqual(at(9).change, { from: 4, side: "right", before: null, after: 2 });
  assert.deepEqual(at(10).change, { from: 0, side: "right", before: 2, after: 1 });
  assert.deepEqual(at(11).change, { from: 0, side: "left", before: 1, after: null });
  assert.equal(run.steps[0].flatten114View.nodes[4].right, null);
  assert.deepEqual(run.steps[0].flatten114View.completed, []);
  assert.ok(run.steps.some(s => s.flatten114View.event === "pred-check" && s.flatten114View.check === false));
});

test("114 reads sparse LeetCode level-order consistently for pictures and live arguments and validates malformed trees", () => {
  assert.deepEqual(problem.liveArgs("[1,null,2,3]"), [{ __viz_type: "binary_tree", values: [1,null,2,3], tree_id: "root" }]);
  for (const s of ["", "[]", "null", "None", "#", "null,null"]) {
    assert.deepEqual(problem.builder(s).answer, []); assert.deepEqual(problem.liveArgs(s)[0].values, []);
  }
  assert.deepEqual(problem.liveArgs("1, null, 2, 3, null, null, null")[0].values, [1,null,2,3]);
  for (const value of [null, true, 0, {}, "[1,]", "1,,2", "1,null,null,2", "null,1", [1,true], [1,"2"], [101], [-101], [0.5], Array(2001).fill(1)]) {
    assert.throws(() => problem.builder(value)); assert.throws(() => problem.liveArgs(value));
  }
});

test("114 computes all 2000 nodes for deep and broad trees, bounds only the explicitly labelled picture preview", () => {
  const left = [0], right = [0];
  for (let i = 1; i < 2000; i++) { left.push(i % 201 - 100, null); right.push(null, i % 201 - 100); }
  for (const values of [left, right, Array.from({ length: 2000 }, (_, i) => i % 201 - 100)]) {
    const run = problem.builder(values), v = run.steps[0].flatten114View;
    assert.deepEqual(run.answer, oracle(values).answer); assert.equal(run.answer.length, 2000);
    assert.equal(run.steps.length, 1); assert.equal(v.mode, "summary"); assert.equal(v.total, 2000);
    assert.deepEqual(run.steps[0].codeLines, []); assert.deepEqual(run.steps[0].vars, []);
    assert.equal(v.nodes.length, 12); assert.equal(v.clipped, true); assert.ok(v.nodes.every(node => node.left === null));
  }
});

function renderer() {
  const listeners = {}, examples = [], input = { value: null };
  const host = { innerHTML: "", querySelector: selector => ({ clientWidth: 600, clientHeight: 430, addEventListener: (_, cb) => { listeners[selector] = cb; } }), querySelectorAll: () => Array.from({ length: 6 }, (_, i) => ({ dataset: { f114Example: String(i) }, addEventListener: (_, cb) => { examples[i] = cb; } })) };
  const context = { lang: "vi", $: id => id === "arrInput" ? input : host, escapeHtml: s => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;"), stopPlay() {}, renderStep() {}, runViz() {}, steps: [], stepIndex: 0 };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-flatten-tree-114.js"), "utf8"), context);
  return { context, host, listeners, examples, input };
}

test("114 renders each graph vertex once despite shared children, fits stable coordinates, and navigates genuine trace events", () => {
  const { context, host, listeners, examples, input } = renderer();
  for (const lang of ["vi", "en"]) for (const values of [...cases.slice(0, 12), Array(19).fill(1)]) {
    for (const step of problem.builder(values).steps) {
      context.lang = lang; context.renderFlatten114Pictures(step);
      const v = step.flatten114View;
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
      assert.equal((host.innerHTML.match(/class="f114-node[ "]/g) || []).length, v.nodes.length);
      const layout = context.flatten114Layout(v, step.final);
      for (const point of layout.positions.values()) assert.ok(point.x > 0 && point.x < layout.width && point.y > 0 && point.y < layout.height);
      if (step.final) assert.match(host.innerHTML, /return → None/);
      if (v.mode === "summary") assert.match(host.innerHTML, /≤18 node/);
      if (v.change) assert.match(host.innerHTML, /f114-change/);
    }
  }
  context.steps = problem.builder(problem.defaultInput).steps;
  context.renderFlatten114Pictures(context.steps[0]); listeners["[data-f114-next]"]();
  assert.equal(context.steps[context.stepIndex].flatten114View.event, "advance"); assert.equal(context.steps[context.stepIndex].flatten114View.completed.length, 1);
  listeners["[data-f114-result]"](); assert.equal(context.stepIndex, context.steps.length - 1);
  examples[1](); assert.equal(input.value, "1,null,2,3"); examples[5](); assert.equal(input.value, "[]");
});

test("114 actual editable-code runner mutates the same TreeNodes in-place, returns None and honours edited code", () => {
  const source = fs.readFileSync(require.resolve("../public/live-editor.js"), "utf8"), tracer = vm.runInNewContext(source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1]);
  const python = tracer + `
import sys,json
data=json.load(sys.stdin)
build_original=__viz_build_tree
captured=(None,[])
def capture(values):
    global captured
    captured=build_original(values)
    return captured
__viz_build_tree=capture
out=[]
for args in data['args']:
    run=__viz_run_trace(data['code'],'flatten',args)
    root,nodes=captured
    ids={id(node):i for i,node in enumerate(nodes)}
    order=[]
    while root:
        order.append(ids[id(root)])
        if root.left is not None: raise Exception('Left was not cleared')
        root=root.right
    out.append({'result':run['result'],'order':order,'trace':run['trace']})
print(json.dumps(out))`;
  for (const edited of [false, true]) {
    const code = edited ? problem.code.join("\n").replace("        return", "        return 114") : problem.code.join("\n");
    const execution = spawnSync("python", ["-c", python], { input: JSON.stringify({ code, args: cases.slice(0, 10).map(values => problem.liveArgs(values)) }), encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
    assert.equal(execution.status, 0, execution.stderr);
    JSON.parse(execution.stdout).forEach((run, i) => { assert.equal(run.result, edited ? 114 : null); assert.deepEqual(run.order, oracle(cases[i]).ids); assert.equal(run.trace[0].line, 3); });
  }
});

test("114 HTTP metadata, valid/invalid solve calls, materialized arguments and lazy assets agree", async () => {
  const port = 42000 + Math.floor(Math.random() * 10000), root = path.resolve(__dirname, "..");
  const server = spawn(process.execPath, ["server.js"], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: "pipe" });
  let logs = ""; server.stderr.on("data", data => { logs += data; });
  const url = `http://localhost:${port}`;
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      if (server.exitCode !== null) throw new Error(logs);
      try { ready = (await fetch(url + "/api/problem/114")).ok; } catch {}
      if (ready) break;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    assert.equal(ready, true, logs);
    const meta = await (await fetch(url + "/api/problem/114")).json();
    assert.equal(meta.allowEmptyInput, true); assert.equal(meta.debugMode, "line-by-line"); assert.deepEqual(meta.code, problem.code);
    const post = (suffix, input) => fetch(url + "/api/problem/114/" + suffix, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input, params: {} }) });
    for (const s of ["", "[]", "0", problem.defaultInput, "1,null,2,3,4,null,5"]) {
      const response = await post("solve", s); assert.equal(response.status, 200);
      const run = await response.json(); assert.deepEqual(run.answer, problem.builder(s).answer); assert.ok(run.steps[0].flatten114View);
      const args = await post("live-args", s); assert.deepEqual((await args.json()).args, problem.liveArgs(s));
    }
    for (const invalid of ["1,null,null,2", "null,1", "101", "1,,2"]) for (const suffix of ["solve", "live-args"]) assert.equal((await post(suffix, invalid)).status, 400);
    const html = await (await fetch(url)).text();
    assert.match(html, /<template[^>]+data-problem-assets="styles">[\s\S]*flatten-tree-114\.css/);
    assert.match(html, /<template[^>]+data-problem-assets="scripts">[\s\S]*renderer-flatten-tree-114\.js/);
    for (const asset of ["flatten-tree-114.css", "renderer-flatten-tree-114.js"]) assert.equal((await fetch(url + "/" + asset)).status, 200);
  } finally { server.kill(); }
});
