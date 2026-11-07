"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs"), vm = require("node:vm");
const problem = require("../problems").SUPPORTED[25];
const run = (values, k) => problem.builder(JSON.stringify(values), { k });
const cases = [[[], 2], [[1], 1], [[1, 2], 3], [[1, 2, 3, 4, 5], 2], [[1, 2, 3, 4, 5], 3],
  [[1, 2, 3, 4], 1], [[1, 2, 3, 4], 4], [[7, 7, 2, 7, 2], 2], [[0, 1000, 0, 1000], 3]];
function expectedIds(n, k) {
  const ids = Array.from({ length: n }, (_, i) => i), result = [];
  for (let i = 0; i < n; i += k) { const group = ids.slice(i, i + k); result.push(...(group.length === k ? group.reverse() : group)); }
  return result;
}
function walk(nodes, start) {
  const byId = new Map(nodes.map(n => [n.id, n])), result = [];
  for (let id = start; id !== null; id = byId.get(id).next) {
    assert.ok(!result.includes(id), "no intermediate cycle"); assert.ok(byId.has(id)); result.push(id);
  }
  return result;
}

test("25 reverses node identities, preserves values and keeps every incomplete group", () => {
  const inputs = [...cases, [Array.from({ length: 20 }, (_, i) => i % 3), 1], [Array(20).fill(7), 20], [Array(20).fill(0), 3]];
  for (let n = 0; n <= 10; n++) for (let k = 1; k <= n + 2; k++) inputs.push([Array.from({ length: n }, (_, i) => i % 4), k]);
  for (const [values, k] of inputs) {
    const result = run(values, k), last = result.steps.at(-1).reverseGroup25View, expected = expectedIds(values.length, k);
    assert.deepEqual(result.answer, expected.map(id => values[id])); assert.deepEqual(last.order, expected);
    assert.deepEqual(last.remainder, Array.from({ length: values.length % k }, (_, i) => values.length - values.length % k + i));
    assert.equal(result.steps.filter(s => s.final).length, 1);
    for (const step of result.steps) {
      const v = step.reverseGroup25View;
      assert.equal(v.nodes.length, values.length + 1);
      assert.deepEqual(v.nodes.filter(n => n.id !== -1).map(n => n.value), values);
      for (const node of v.nodes) walk(v.nodes, node.id);
      assert.deepEqual(v.order, walk(v.nodes, v.nodes.find(n => n.id === -1).next));
      assert.deepEqual(v.detached, values.map((_, id) => id).filter(id => !v.order.includes(id)));
      assert.deepEqual(step.codeLines, [v.source.line]); assert.equal(v.source.text, problem.code[v.source.line - 1].trim());
      assert.equal(v.source.timing, "after");
      assert.deepEqual(Object.fromEntries(step.vars.map(w => [w.name, w.rawValue])), v.locals);
    }
  }
});

test("25 every executed source line, local, alias and next link agrees with independent CPython tracing", () => {
  const source = `import ast,json,sys
data=json.load(sys.stdin)
class ListNode:
    def __init__(self,val=0,next=None): self.val,self.next=val,next
scope={'ListNode':ListNode}
exec(compile(data['code'],'<native25>','exec'),scope)
branches={n.lineno:{l for s in n.body for l in range(s.lineno,s.end_lineno+1)} for n in ast.walk(ast.parse(data['code'])) if isinstance(n,(ast.If,ast.For,ast.While))}
results=[]
for values,k in data['cases']:
    nodes=[ListNode(v) for v in values]
    for a,b in zip(nodes,nodes[1:]): a.next=b
    ids={id(node):i for i,node in enumerate(nodes)}
    def ref(node): return None if node is None else ids.get(id(node),-1)
    def encode(v): return {'id':ref(v),'value':v.val} if isinstance(v,ListNode) else v
    events=[]
    pending=None
    def trace(frame,event,arg):
        global pending
        if frame.f_code.co_filename!='<native25>' or frame.f_code.co_name!='reverseKGroup': return trace
        if event in ('line','return'):
            if pending is not None:
                state={n:encode(v) for n,v in frame.f_locals.items() if n!='self'}
                graph=nodes+([frame.f_locals['dummy']] if 'dummy' in frame.f_locals else [])
                pointers={n:ref(v) for n,v in frame.f_locals.items() if isinstance(v,ListNode) or v is None}
                events.append({'line':pending,'locals':state,'pointers':pointers,'nodes':[{'id':ref(n),'value':n.val,'next':ref(n.next)} for n in graph],
                    'branch':frame.f_lineno in branches[pending] if pending in branches else None,'returning':event=='return','returned':encode(arg) if event=='return' else None})
            pending=frame.f_lineno if event=='line' else None
        return trace
    sys.settrace(trace)
    head=scope['Solution']().reverseKGroup(nodes[0] if nodes else None,k)
    sys.settrace(None)
    order=[]
    while head: order.append(ref(head)); head=head.next
    results.append({'events':events,'order':order})
print(json.dumps(results))`;
  const native = spawnSync(process.env.PYTHON || "python3", ["-c", source], {
    input: JSON.stringify({ code: problem.code.join("\n"), cases }), encoding: "utf8", maxBuffer: 32e6,
  });
  assert.equal(native.status, 0, native.stderr);
  JSON.parse(native.stdout).forEach((ref, index) => {
    const result = run(...cases[index]); assert.deepEqual(result.steps.at(-1).reverseGroup25View.order, ref.order);
    assert.equal(result.steps.length, ref.events.length);
    ref.events.forEach((event, i) => {
      const v = result.steps[i].reverseGroup25View; assert.deepEqual(result.steps[i].codeLines, [event.line]);
      for (const key of ["locals", "nodes", "pointers", "branch", "returned", "returning"]) assert.deepEqual(v[key], event[key]);
    });
  });
});

test("25 saves nxt before each overwrite and separates reversing from attaching the group", () => {
  const result = run([1, 2, 3, 4, 5], 3), first = line => result.steps.find(s => s.codeLines[0] === line).reverseGroup25View;
  assert.equal(first(14).pointers.nxt, 1); assert.deepEqual(first(14).order, [0, 1, 2, 3, 4]);
  assert.deepEqual(first(15).change, { from: 0, before: 1, after: 3 });
  assert.deepEqual(first(15).order, [0, 3, 4]); assert.deepEqual(first(15).detached, [1, 2]);
  assert.equal(first(15).pointers.nxt, 1); assert.equal(first(15).pointers.cur, 0);
  assert.deepEqual(first(19).change, { from: -1, before: 0, after: 2 });
  assert.deepEqual(first(19).order, [2, 1, 0, 3, 4]); assert.deepEqual(first(19).detached, []);
  assert.deepEqual(first(19).completed, []); assert.deepEqual(first(20).completed, [0, 1, 2]);
  assert.equal(first(20).pointers.prev_group, 0);
  let previous = null;
  for (const step of result.steps) {
    const v = step.reverseGroup25View;
    if (v.change) for (const node of v.nodes) {
      const before = previous.nodes.find(n => n.id === node.id);
      assert.equal(node.next, node.id === v.change.from ? v.change.after : before.next);
    }
    if (v.exhausted) assert.equal(v.branch, false);
    if (v.source.line === 14) assert.equal(v.pointers.nxt, v.nodes.find(n => n.id === v.pointers.cur).next);
    previous = v;
  }
  const unchanged = run([1, 2], 1).steps.filter(s => s.reverseGroup25View.change);
  assert.ok(unchanged.length); assert.ok(unchanged.every(s => s.reverseGroup25View.change.before === s.reverseGroup25View.change.after));
});

test("25 validates visualization limits and builds real linked-list live arguments", () => {
  for (const input of [null, 5, "1,,2", "[1,null]", "[-1]", "[1001]", "[1.5]", "oops", Array(21).fill(1)]) assert.throws(() => problem.builder(input, { k: 2 }), RangeError);
  for (const k of [0, -1, 1.5, 21, "2", null, NaN, Infinity]) assert.throws(() => run([1, 2], k), RangeError);
  for (const params of [null, [], 2]) assert.throws(() => problem.builder("1,2", params), RangeError);
  assert.deepEqual(problem.liveArgs("7,7,2", { k: 2 }), [{ __viz_type: "linked_list", values: [7, 7, 2] }, 2]);
  assert.deepEqual(problem.liveArgs("", { k: 1 }), [{ __viz_type: "linked_list", values: [] }, 1]);
  assert.equal(problem.debugMode, "line-by-line"); assert.ok(problem.allowEmptyInput);
});

function renderer(language, extra = {}) {
  const host = { innerHTML: "", querySelector: () => null, querySelectorAll: () => [] };
  const context = { lang: language, document: { getElementById: () => host }, ...extra };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-reverse-k-group-25.js"), "utf8"), context);
  return { context, host, render: step => { context.renderReverseGroup25Pictures(step); return host.innerHTML; } };
}

test("25 pictures render every real link, stable identity, alias and reachable chain in VI/EN", () => {
  for (const language of ["vi", "en"]) for (const args of cases) {
    const result = run(...args), saved = JSON.stringify(result), ui = renderer(language), initial = ui.render(result.steps[0]);
    for (const step of result.steps) {
      const html = ui.render(step), v = step.reverseGroup25View;
      assert.doesNotMatch(html, /undefined|NaN|Infinity/);
      const links = [...html.matchAll(/data-link-kind="(?:normal|new)" data-link-from="(-?\d+)" data-link-to="(null|-?\d+)"/g)].map(m => [+m[1], m[2] === "null" ? null : +m[2]]);
      assert.deepEqual(links, v.nodes.map(n => [n.id, n.next]));
      const nodes = [...html.matchAll(/data-node-id="(-?\d+)" data-node-value="(\d+)" data-node-next="(null|-?\d+)"/g)].map(m => [+m[1], +m[2], m[3] === "null" ? null : +m[3]]);
      assert.deepEqual(nodes, [v.nodes.at(-1), ...v.nodes.slice(0, -1)].map(n => [n.id, n.value, n.next]));
      assert.deepEqual([...html.matchAll(/data-chain-node="(\d+)"/g)].map(m => +m[1]), v.order);
      if (v.change && v.change.before !== v.change.after) assert.ok(html.includes(`data-link-kind="old" data-link-from="${v.change.from}" data-link-to="${v.change.before}"`));
      for (const name of ["prev_group", "kth", "prev", "cur", "nxt", "next_group"]) assert.ok(html.includes(`data-pointer="${name}" data-pointer-node="${Object.hasOwn(v.pointers, name) ? v.pointers[name] : "unbound"}"`));
    }
    assert.equal(ui.render(result.steps[0]), initial); assert.equal(JSON.stringify(result), saved);
    assert.equal(ui.context.rg25Escape('<script>"&'), "&lt;script&gt;&quot;&amp;");
  }
});

test("25 jump buttons select real rewires, completed groups and the return line", () => {
  const result = run([1, 2, 3, 4, 5], 2);
  for (const [kind, predicate] of [["rewire", v => Boolean(v.change)], ["group", v => v.source.line === 20], ["result", v => v.answer !== null]]) {
    let stopped = 0, rendered = 0;
    const ui = renderer("vi", { steps: result.steps, stepIndex: 0, stopPlay: () => stopped++, renderStep: () => rendered++ });
    ui.context.rg25Jump(kind); assert.ok(predicate(result.steps[ui.context.stepIndex].reverseGroup25View));
    assert.equal(stopped, 1); assert.equal(rendered, 1);
    ui.context.stepIndex = result.steps.length - 1; ui.context.rg25Jump(kind); assert.equal(ui.context.stepIndex, result.steps.length - 1);
  }
});

test("25 keyboard controls act once and prevent the global Space playback shortcut", () => {
  for (const key of ["Enter", " "]) {
    const handlers = {}, node = { dataset: { rg25Jump: "group" }, addEventListener: (name, fn) => { handlers[name] = fn; } };
    const host = { querySelectorAll: selector => selector === "[data-rg25-jump]" ? [node] : [] };
    const result = run([1, 2, 3], 2), ui = renderer("vi", { steps: result.steps, stepIndex: 0, renderStep() {} });
    let prevented = 0, stopped = 0;
    ui.context.rg25Bind(host); handlers.keydown({ key, preventDefault: () => prevented++, stopPropagation: () => stopped++ });
    assert.equal(result.steps[ui.context.stepIndex].codeLines[0], 20); assert.equal(prevented, 1); assert.equal(stopped, 1);
  }
});

test("25 linked-list trace resets identities between runs and shares its worker with ordinary lessons", () => {
  const { runTrace } = require("../problems/wasm-picture-trace");
  for (let index = 0; index < 3; index++) {
    const ordinary = runTrace({ method: "add", code: "class Solution:\n    def add(self, a, b):\n        return a + b", args: [index, 10] });
    assert.equal(ordinary.answer, index + 10);
    const linked = runTrace({ profile: "linked25", method: "reverseKGroup", code: problem.code.join("\n"), args: [[9, 9, index], 2], auditRound: index });
    assert.deepEqual(linked.order, [1, 0, 2]); assert.equal(linked.events[0].nodes.length, 4);
    assert.deepEqual(linked.events.at(-1).returned, { id: 1, value: 9 });
  }
});
