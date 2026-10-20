const assert = require("node:assert/strict");
const { test } = require("node:test");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs"), vm = require("node:vm");
const problem = require("../problems").SUPPORTED[677];
const { prepareDesignLiveRun } = require("../live-args");
const cases = [problem.defaultInput, "sum(a)", "insert(a,2);insert(a,2);sum(a)",
  "insert(apple,3);insert(app,2);sum(app);insert(app,4);sum(app);sum(apple)",
  "insert(a,5);insert(ab,3);sum(a);insert(a,0);sum(a);sum(ab)",
  "insert(apple,3);sum(az);sum(applez);insert(apple,1);sum(a)",
  'INSERT("constructor",2)|SUM("con")', "insert(abc,0);sum(ab)"];

function oracle(operations) {
  const values = new Map(), answer = [];
  for (const operation of operations) {
    if (operation.name === "insert") values.set(...operation.args);
    else answer.push([...values].filter(([key]) => key.startsWith(operation.args[0])).reduce((sum, [, value]) => sum + value, 0));
  }
  return answer;
}

test("677 agrees with a key/value scan for overwrites, zero changes, missing prefixes and shared keys", () => {
  let seed = 677;
  const samples = [...cases];
  function random(n) { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % n; }
  for (let trial = 0; trial < 100; trial++) {
    const ops = [];
    for (let j = 0; j < 10; j++) {
      const key = ["a", "ab", "abc", "b", "ba"][random(5)];
      ops.push(random(3) ? `insert(${key},${random(10)})` : `sum(${key})`);
    }
    samples.push(ops.join(";"));
  }
  for (const input of samples) {
    const operations = problem.parseMapSum677Operations(input), run = problem.builder(input);
    assert.deepEqual(run.answer, oracle(operations));
    assert.equal(run.steps.at(-1).final, true);
    for (const step of run.steps.filter(step => step.mapSum677View.line !== null)) {
      assert.equal(step.codeLines.length, 1);
      const view = step.mapSum677View;
      assert.equal(view.source, problem.code[step.codeLines[0] - 1].trim());
      if (view.event === "insert-end") {
        for (const node of view.nodes.filter(node => node.parent !== null)) {
          assert.equal(node.score, view.values.filter(entry => entry.key.startsWith(node.prefix)).reduce((sum, entry) => sum + entry.value, 0));
        }
      }
    }
  }
  assert.deepEqual(problem.builder(problem.defaultInput).answer, [3, 5, 4]);
});

test("677 every constructor, insert and sum line and local matches actual Python", () => {
  const script = `import sys, json
data = json.load(sys.stdin)
ns = {}
exec(compile(data['code'], '<ms677>', 'exec'), ns)
def encode(value):
    if isinstance(value, (str, int, bool)) or value is None: return value
    if isinstance(value, dict): return {k: encode(v) for k, v in value.items()}
    return encode(vars(value))
out = []
for operations in data['cases']:
    events, pending, answer = [], {}, []
    def trace(frame, event, arg):
        if frame.f_code.co_filename != '<ms677>': return trace
        key = id(frame)
        if event in ('line', 'return'):
            if key in pending:
                scope = frame.f_code.co_name
                if scope == '__init__': scope = type(frame.f_locals['self']).__name__ + '.__init__'
                events.append({'line': pending[key], 'scope': scope, 'locals': encode(dict(frame.f_locals))})
            if event == 'line': pending[key] = frame.f_lineno
            else: pending.pop(key, None)
        return trace
    sys.settrace(trace)
    obj = ns['MapSum']()
    for op in operations:
        value = getattr(obj, op['name'])(*op['args'])
        if op['name'] == 'sum': answer.append(value)
    sys.settrace(None)
    out.append({'events': events, 'answer': answer})
print(json.dumps(out))
`;
  const execution = spawnSync(process.env.PYTHON || "python", ["-c", script], { input: JSON.stringify({ code: problem.code.join("\n"), cases: cases.map(input => problem.parseMapSum677Operations(input)) }), encoding: "utf8" });
  assert.equal(execution.status, 0, execution.stderr);
  JSON.parse(execution.stdout).forEach((actual, index) => {
    const run = problem.builder(cases[index]);
    assert.deepEqual(run.answer, actual.answer);
    const events = run.steps.filter(step => step.mapSum677View.line !== null).map(step => ({ line: step.codeLines[0], scope: step.mapSum677View.scope,
      locals: Object.fromEntries(step.vars.map(variable => [variable.name, Object.hasOwn(variable, "rawValue") ? variable.rawValue : variable.value])) }));
    assert.deepEqual(events, actual.events, cases[index]);
  });
});

test("677 delta, values assignment and cached sums change on their exact separate lines", () => {
  const run = problem.builder(problem.defaultInput);
  const view = event => run.steps.find(step => step.mapSum677View.opIndex === 4 && step.mapSum677View.event === event).mapSum677View;
  assert.equal(view("delta").delta, -1);
  assert.equal(view("delta").values.find(entry => entry.key === "apple").value, 3);
  assert.equal(view("write-value").values.find(entry => entry.key === "apple").value, 2);
  assert.equal(view("write-value").nodes.find(node => node.prefix === "ap").score, 5);
  assert.equal(view("insert-end").nodes.find(node => node.prefix === "ap").score, 4);
  const update = run.steps.find(step => step.mapSum677View.opIndex === 4 && step.mapSum677View.event === "update");
  assert.deepEqual(update.mapSum677View.change, { id: 1, before: 5, after: 4 });
  assert.equal(run.steps.at(-1).mapSum677View.nodes[0].score, 0);
  assert.deepEqual(run.steps[0].vars[0].rawValue, { children: {} });
  assert.equal(run.steps[0].mapSum677View.nodes.length, 0);
});

test("677 large mode keeps every result without invented Python line numbers", () => {
  for (const input of [Array(13).fill("sum(a)").join(";"), Array(25).fill(`insert(${'a'.repeat(50)},1000);sum(a)`).join(";")]) {
    const run = problem.builder(input);
    assert.deepEqual(run.answer, oracle(problem.parseMapSum677Operations(input)));
    assert.equal(run.steps.length, 1);
    assert.equal(run.steps[0].mapSum677View.mode, "summary");
    assert.deepEqual(run.steps[0].codeLines, []);
  }
});

test("677 parser and Edit & Run use the same commands and validation", () => {
  const config = prepareDesignLiveRun(problem, 'INSERT("apple",3)|SUM("ap")');
  assert.equal(config.className, "MapSum");
  assert.deepEqual(config.operations, [{ name: "insert", args: ["apple", 3] }, { name: "sum", args: ["ap"] }]);
  for (const input of ["", "delete(a)", "insert(a,)", "insert(a,-1)", "insert(a,1001)", "insert(a,1.5)", "insert(A,3)", "sum()", "sum(a,b)", `sum(${'a'.repeat(51)})`, Array(51).fill("sum(a)").join(";")]) assert.throws(() => problem.builder(input), /#677/);
  assert.equal(problem.debugMode, "line-by-line");
});
