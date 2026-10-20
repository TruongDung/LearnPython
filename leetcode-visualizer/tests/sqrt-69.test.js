const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs"), vm = require("node:vm");
const problem = require("../problems").SUPPORTED[69];
const cases = [0,1,2,3,4,8,9,15,16,17,24,25,26,2147395599,2147395600,2147395601,2147483645,2147483647];
let seed = 69;
for (let i = 0; i < 80; i++) { seed = (seed * 1664525 + 1013904223) >>> 0; cases.push(seed % 2147483648); }

test("69 answers satisfy the exact integer-square bounds, including perfect squares and limits", () => {
  for (const x of [...cases, ...Array.from({ length: 513 }, (_, i) => i)]) {
    const run = problem.builder([x]), a = BigInt(run.answer), target = BigInt(x);
    assert.ok(a * a <= target && target < (a + 1n) * (a + 1n), `x=${x}`);
    assert.equal(run.steps.at(-1).final, true);
    assert.ok(run.steps.length <= 160);
    for (const step of run.steps) {
      const v = step.sqrt69View;
      assert.equal(v.source, problem.code[v.line - 1].trim());
      assert.notEqual(v.line, 12); // else is not a separately executed Python statement.
      if (v.event === "mid") assert.ok(v.lo <= v.mid && v.mid <= v.hi);
      if (v.cut) assert.ok(v.cut[0] <= v.cut[1]);
    }
  }
});

test("69 every executed line, complete locals and large square values match CPython", () => {
  const python = `import sys, json
data = json.load(sys.stdin)
ns = {}
exec(compile(data['code'], '<s69>', 'exec'), ns)
out = []
for x in data['cases']:
    events, pending = [], None
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_filename != '<s69>': return trace
        if event in ('line', 'return'):
            if pending is not None:
                values = dict(frame.f_locals)
                values['self'] = {}
                side = values['x'] if pending == 4 else values.get('mid') if pending in (7,8,9,10,11,13) else values.get('hi') if pending == 14 else None
                events.append({'line':pending, 'locals':values, 'square':str(side * side) if side is not None else None})
            pending = frame.f_lineno if event == 'line' else None
        return trace
    sys.settrace(trace)
    answer = ns['Solution']().mySqrt(x)
    sys.settrace(None)
    out.append({'events':events, 'answer':answer})
print(json.dumps(out))
`;
  const execution = spawnSync("python", ["-c", python], { input: JSON.stringify({ code: problem.code.join("\n"), cases }), encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  assert.equal(execution.status, 0, execution.stderr);
  JSON.parse(execution.stdout).forEach((actual, index) => {
    const run = problem.builder([cases[index]]);
    assert.equal(run.answer, actual.answer);
    assert.deepEqual(run.steps.map(s => ({ line: s.codeLines[0], locals: Object.fromEntries(s.vars.map(v => [v.name, v.rawValue])), square: s.sqrt69View.square })), actual.events, `x=${cases[index]}`);
  });
});

test("69 boundary updates, final hi and early returns have independent immutable snapshots", () => {
  const run = problem.builder([8]), up = run.steps.find(s => s.sqrt69View.event === 'raise-lo'), down = run.steps.find(s => s.sqrt69View.event === 'lower-hi');
  assert.equal(run.steps[1].sqrt69View.lo, 1);
  assert.equal(up.sqrt69View.lo, 3);
  assert.equal(up.sqrt69View.hi, 4);
  assert.deepEqual(up.sqrt69View.cut, [1,2]);
  assert.equal(down.sqrt69View.hi, 2);
  assert.equal(run.steps.at(-1).sqrt69View.mid, 3);
  assert.equal(run.steps.at(-1).sqrt69View.visualSide, 2);
  assert.equal(run.steps.at(-1).sqrt69View.square, '4');
  assert.equal(run.steps[0].sqrt69View.history.length, 0);
  for (const x of [0,1]) {
    const early = problem.builder([x]);
    assert.deepEqual(early.steps.map(s => s.codeLines[0]), [3,4]);
    assert.deepEqual(early.steps.at(-1).vars.map(v => v.name), ['self','x']);
  }
  for (const input of [[], [1,2], [-1], [1.5], [2147483648], '', null, true, [null], [true], [''], Infinity]) {
    assert.throws(() => problem.builder(input));
    assert.throws(() => problem.liveArgs(input));
  }
  assert.deepEqual(problem.liveArgs([8]), [8]);
  assert.deepEqual(problem.liveArgs('2147483647'), [2147483647]);
});

test("69 all frames render in both languages, preserve exact numbers, and navigation follows trace", () => {
  const listeners = {}, host = { innerHTML: '', querySelector: selector => ({ addEventListener: (_, cb) => { listeners[selector] = cb; } }), querySelectorAll: () => [] };
  const context = { lang: 'vi', $: () => host, escapeHtml: s => String(s).replaceAll('<', '&lt;').replaceAll('"', '&quot;'), stopPlay() {}, renderStep() {}, steps: [], stepIndex: 0 };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-sqrt-69.js'), 'utf8'), context);
  for (const language of ['vi','en']) for (const x of cases.slice(0, 18)) {
    context.lang = language;
    const run = problem.builder([x]);
    for (const step of run.steps) {
      context.renderSqrt69Pictures(step);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
      assert.match(host.innerHTML, /s69-square-panel/);
      if (step.sqrt69View.square !== null) assert.ok(host.innerHTML.includes(step.sqrt69View.square));
      if (step.sqrt69View.visualSide > 10) assert.match(host.innerHTML, /thu nhỏ|Scaled picture/);
    }
    assert.match(host.innerHTML, /s69-proof/);
  }
  context.steps = problem.builder([8]).steps;
  context.renderSqrt69Pictures(context.steps[0]);
  listeners['[data-s69-next]']();
  assert.equal(context.steps[context.stepIndex].sqrt69View.event, 'mid');
  listeners['[data-s69-result]']();
  assert.equal(context.stepIndex, context.steps.length - 1);
});
