const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs'), vm = require('node:vm');
const problem = require('../problems').SUPPORTED[24];
const cases = [[], [0], [1], [1,2], [1,2,3], [1,2,3,4], [1,2,3,4,5], [7,7,7,7], [0,0,0,0,0], [0,100,0,100]];
let seed = 24;
function random(n) { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % n; }
for (let i = 0; i < 80; i++) cases.push(Array.from({ length: random(13) }, () => random(5)));
const swappedIds = n => Array.from({ length: n }, (_, i) => i % 2 ? i - 1 : i + 1 < n ? i + 1 : i);
function walk(nodes, id) {
  const byId = new Map(nodes.map(node => [node.id, node])), out = [], seen = new Set();
  while (id !== null) { assert.ok(!seen.has(id), 'pointer cycle'); seen.add(id); out.push(id); id = byId.get(id).next; }
  return out;
}

test('24 preserves node identities and values while swapping every pair, including empty and odd lists', () => {
  for (const values of [...cases, Array.from({ length: 13 }, (_, i) => i), Array.from({ length: 100 }, (_, i) => i)]) {
    const run = problem.builder(JSON.stringify(values)), expectedIds = swappedIds(values.length);
    assert.deepEqual(run.answer, expectedIds.map(id => values[id]));
    assert.deepEqual(run.steps.at(-1).swap24View.order, expectedIds);
    assert.equal(run.steps.at(-1).final, true);
    for (const step of run.steps) {
      const v = step.swap24View;
      for (const node of v.nodes.filter(node => node.id !== -1)) { assert.equal(node.value, values[node.id]); walk(v.nodes, node.id); }
      const root = v.nodes.find(node => node.id === -1);
      assert.deepEqual(v.order, walk(v.nodes, root.next));
      if (v.mode === 'trace') assert.equal(v.source, problem.code[v.line - 1].trim());
      else { assert.deepEqual(step.codeLines, []); assert.equal(run.steps.length, 1); }
    }
  }
});

test('24 each executed Python line, full locals, identity references and next links match CPython', () => {
  const python = `import sys, json
data = json.load(sys.stdin)
class ListNode:
    def __init__(self, val=0, next=None): self.val, self.next = val, next
ns = {'ListNode':ListNode}
exec(compile(data['code'], '<swap24>', 'exec'), ns)
def encode(value):
    if value is None or isinstance(value, (str, int, bool)): return value
    if isinstance(value, ListNode): return {'val':value.val, 'next':encode(value.next)}
    return {}
out = []
for values in data['cases']:
    nodes = [ListNode(value) for value in values]
    for a,b in zip(nodes,nodes[1:]): a.next=b
    ids = {id(node):i for i,node in enumerate(nodes)}
    def ref(node): return None if node is None else ids.get(id(node),-1)
    events, pending = [], None
    def trace(frame,event,arg):
        global pending
        if frame.f_code.co_filename != '<swap24>': return trace
        if event in ('line','return'):
            if pending is not None:
                locals_now = dict(frame.f_locals)
                graph = nodes + ([locals_now['dummy']] if 'dummy' in locals_now else [])
                events.append({'line':pending, 'locals':{k:encode(v) for k,v in locals_now.items()}, 'pointers':{k:ref(v) for k,v in locals_now.items() if k != 'self'}, 'nodes':[{'id':ref(node),'value':node.val,'next':ref(node.next)} for node in graph]})
            pending = frame.f_lineno if event == 'line' else None
        return trace
    sys.settrace(trace)
    result=ns['Solution']().swapPairs(nodes[0] if nodes else None)
    sys.settrace(None)
    order=[]
    while result is not None: order.append(ref(result)); result=result.next
    out.append({'events':events,'order':order})
print(json.dumps(out))
`;
  const execution = spawnSync('python', ['-c', python], { input: JSON.stringify({ code: problem.code.join('\n'), cases }), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  assert.equal(execution.status, 0, execution.stderr);
  JSON.parse(execution.stdout).forEach((actual, i) => {
    const run = problem.builder(JSON.stringify(cases[i]));
    assert.deepEqual(run.steps.at(-1).swap24View.order, actual.order);
    assert.deepEqual(run.steps.map(s => ({ line: s.codeLines[0], locals: Object.fromEntries(s.vars.map(v => [v.name, v.rawValue])), pointers: s.swap24View.pointers, nodes: s.swap24View.nodes })), actual.events, JSON.stringify(cases[i]));
  });
});

test('24 separates the three rewires and keeps a detached node visible and held by second', () => {
  const run = problem.builder('1,2,3,4');
  const frame = line => run.steps.find(s => s.swap24View.round === 1 && s.codeLines[0] === line).swap24View;
  assert.deepEqual(frame(8).order, [0,2,3]);
  assert.deepEqual(frame(8).detached, [1]);
  assert.equal(frame(8).pointers.second, 1);
  assert.deepEqual(frame(8).change, { from:0, before:1, after:2 });
  assert.deepEqual(frame(9).change, { from:1, before:2, after:0 });
  assert.deepEqual(frame(10).change, { from:-1, before:0, after:1 });
  assert.deepEqual(frame(10).order, [1,0,2,3]);
  assert.deepEqual(frame(10).detached, []);
  assert.equal(frame(11).pointers.prev, 0);
  assert.equal(run.steps[0].swap24View.nodes.find(n => n.id === 0).next, 1);
  assert.equal(run.steps.at(-1).swap24View.pointers.head, 0);
  assert.equal(run.steps.at(-1).swap24View.order[0], 1);
});

test('24 validates inputs, prepares real ListNodes, and explicitly bounds picture previews', () => {
  assert.equal(problem.allowEmptyInput, true);
  assert.deepEqual(problem.liveArgs(''), [{ __viz_type:'linked_list', values:[] }]);
  assert.deepEqual(problem.liveArgs('0,100'), [{ __viz_type:'linked_list', values:[0,100] }]);
  for (const input of ['1,,2', '[null]', '-1', '101', '1.5', '[[1]]', Array(101).fill(1)]) {
    assert.throws(() => problem.builder(input)); assert.throws(() => problem.liveArgs(input));
  }
  const large = problem.builder(Array(100).fill(7));
  assert.equal(large.steps.length, 1);
  assert.equal(large.steps[0].swap24View.mode, 'summary');
  assert.deepEqual(large.steps[0].codeLines, []);
  assert.equal(large.answer.length, 100);
});

test('24 actual live editor supports nested node watches, full list results and bounded cycle snapshots', () => {
  const source = fs.readFileSync(require.resolve('../public/live-editor.js'), 'utf8');
  const tracer = vm.runInNewContext(source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1]);
  const python = tracer + `\nimport json,sys
data=json.load(sys.stdin)
results=[__viz_run_trace(data['code'],'swapPairs',[{'__viz_type':'linked_list','values':values}]) for values in data['cases']]
cycle=__viz_run_trace('class Solution:\\n    def make(self, head):\\n        head.next = head\\n        return head','make',[{'__viz_type':'linked_list','values':[5]}])
ordinary=__viz_run_trace('class Solution:\\n    def twice(self, n):\\n        return n * 2','twice',[4])
long_list=__viz_run_trace('class Solution:\\n    def same(self, head):\\n        return head','same',[{'__viz_type':'linked_list','values':list(range(201))}])
print(json.dumps({'results':results,'cycle':cycle,'ordinary':ordinary,'long':long_list}))
`;
  const values = [[], [1], [1,2,3,4], [1,2,3,4,5], [7,7,7,7]];
  const execution = spawnSync('python', ['-c', python], { input: JSON.stringify({ code: problem.code.join('\n'), cases: values }), encoding:'utf8', maxBuffer:8 * 1024 * 1024 });
  assert.equal(execution.status, 0, execution.stderr);
  const output = JSON.parse(execution.stdout);
  output.results.forEach((run, i) => assert.deepEqual(run.result, values[i].length ? swappedIds(values[i].length).map(id => values[i][id]) : null));
  const afterFirstRewire = output.results[2].trace.find(s => s.line === 9);
  assert.equal(afterFirstRewire.vars.first.next.val, 3);
  assert.equal(afterFirstRewire.vars.second.val, 2);
  assert.equal(afterFirstRewire.vars.second.next.val, 3);
  assert.deepEqual(output.cycle.result, { values:[5], cycle:true });
  assert.equal(output.cycle.trace.at(-1).vars.head.next, '<cycle>');
  assert.equal(output.ordinary.result, 8);
  assert.equal(output.long.result.length, 201);
  assert.equal(output.long.result.at(-1), '<truncated>');
});

test('24 all frames render in both languages and pair navigation uses the actual advance line', () => {
  const listeners = {}, host = { innerHTML:'', querySelector: selector => ({ addEventListener:(_, cb) => { listeners[selector] = cb; } }), querySelectorAll:() => [] };
  const context = { lang:'vi', $:() => host, escapeHtml:s => String(s).replaceAll('<','&lt;').replaceAll('"','&quot;'), stopPlay(){}, renderStep(){}, steps:[], stepIndex:0 };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-swap-nodes-24.js'),'utf8'), context);
  for (const language of ['vi','en']) for (const values of [...cases.slice(0,10), Array(13).fill(7)]) {
    context.lang = language;
    const run = problem.builder(values);
    for (const step of run.steps) {
      context.renderSwap24Pictures(step);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
      assert.match(host.innerHTML, /p24-graph/);
      if (step.swap24View.detached.length) assert.match(host.innerHTML, /p24-detached/);
      if (step.swap24View.change) { assert.match(host.innerHTML, /p24-edge removed/); assert.match(host.innerHTML, /p24-edge changed/); }
    }
    assert.match(host.innerHTML, /p24-answer/);
  }
  context.steps = problem.builder('1,2,3,4').steps;
  context.stepIndex = context.steps.findIndex(s => s.codeLines[0] === 7);
  context.renderSwap24Pictures(context.steps[context.stepIndex]);
  listeners['[data-p24-finish]']();
  assert.equal(context.steps[context.stepIndex].codeLines[0], 11);
  listeners['[data-p24-result]']();
  assert.equal(context.stepIndex, context.steps.length - 1);
});
