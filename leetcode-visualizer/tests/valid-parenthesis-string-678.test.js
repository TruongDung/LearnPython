const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');
const { readFrontendJavaScript, readFrontendStyles, readFrontendIndex } = require('./helpers/frontend-source');
const problem = SUPPORTED[678];
const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');

function possibilities(s) {
  let states = new Set([0]);
  const prefixes = [];
  for (const ch of s) {
    const next = new Set();
    const changes = ch === '*' ? [-1, 0, 1] : [ch === '(' ? 1 : -1];
    for (const count of states) for (const change of changes) if (count + change >= 0) next.add(count + change);
    states = next;
    prefixes.push([...states].sort((a, b) => a - b));
  }
  return { answer: states.has(0), prefixes };
}

function checkWitness(s, witness) {
  assert.equal(witness.assigned.length, s.length);
  witness.assigned.forEach((ch, index) => {
    if (s[index] === '*') assert.ok(['(', ')', ''].includes(ch));
    else assert.equal(ch, s[index]);
  });
  assert.equal(witness.assigned.join(''), witness.resolved);
  let balance = 0;
  for (const ch of witness.resolved) { balance += ch === '(' ? 1 : -1; assert.ok(balance >= 0); }
  assert.equal(balance, 0);
}

test('678 registers a greedy string visualization with the official input limits', () => {
  assert.equal(problem.slug, 'valid-parenthesis-string');
  assert.equal(problem.category.key, 'greedy');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.deepEqual(problem.liveArgs('(*))'), ['(*))']);
  for (const bad of ['', 'abc', '( )', '[]', '*'.repeat(101), [], 1, null]) {
    assert.throws(() => problem.builder(bad));
    assert.throws(() => problem.liveArgs(bad));
  }
  assert.equal(problem.builder('*'.repeat(100)).answer, true);
  assert.equal(problem.builder('('.repeat(100)).answer, false);
  assert.equal(problem.builder('()'.repeat(50)).answer, true);
});

test('678 matches examples, early closing failures, leftover opens, and every star interpretation', () => {
  for (const [s, answer] of [
    ['()', true], ['(*)', true], ['(*))', true], ['(', false],
    ['*', true], ['(*', true], ['*)', true], ['**', true], ['**))', true],
    ['*(', false], [')*', false], ['())*', false], ['((*)', true], ['((**', true],
  ]) {
    const run = problem.builder(s);
    assert.equal(run.answer, answer, s);
    const final = run.steps.at(-1).validParenthesis678View;
    if (answer) checkWitness(s, final.witness);
    else assert.equal(final.witness, null);
  }
});

test('678 bounds match an independent set of all possibilities on every short string', () => {
  for (let length = 1; length <= 6; length++) {
    for (let code = 0; code < 3 ** length; code++) {
      let remaining = code;
      const s = Array.from({ length }, () => { const ch = '()*'[remaining % 3]; remaining = Math.floor(remaining / 3); return ch; }).join('');
      const expected = possibilities(s);
      const run = problem.builder(s);
      assert.equal(run.answer, expected.answer, s);
      for (const step of run.steps) {
        const view = step.validParenthesis678View;
        if (view.event !== 'clamp') continue;
        const counts = expected.prefixes[view.index];
        assert.equal(view.committed.low, counts[0]);
        assert.equal(view.committed.high, counts.at(-1));
        assert.deepEqual(Array.from({ length: view.high - view.low + 1 }, (_, index) => view.low + index), counts);
      }
      if (run.answer) checkWitness(s, run.steps.at(-1).validParenthesis678View.witness);
    }
  }
});

test('678 snapshots distinguish raw updates, finalized prefixes, and early return', () => {
  const star = problem.builder('*');
  const raw = star.steps.find(step => step.codeLines[0] === 12).validParenthesis678View;
  assert.equal(raw.low, -1);
  assert.equal(raw.high, 0);
  assert.equal(raw.calculating, true);
  assert.deepEqual(raw.committed, { low: 0, high: 0, length: 0, feasible: true });
  const clamped = star.steps.find(step => step.codeLines[0] === 16).validParenthesis678View;
  assert.deepEqual(clamped.committed, { low: 0, high: 1, length: 1, feasible: true });
  assert.equal(clamped.calculating, false);
  assert.deepEqual(raw.history, []);
  assert.equal(star.steps.at(-1).validParenthesis678View.high, 1, 'True does not require high == 0');
  const bad = problem.builder(')*');
  const final = bad.steps.at(-1);
  assert.equal(final.codeLines[0], 15);
  assert.equal(final.validParenthesis678View.high, -1);
  assert.equal(final.validParenthesis678View.index, 0);
  assert.equal(final.validParenthesis678View.committed.feasible, false);
  assert.ok(!bad.steps.some(step => step.validParenthesis678View.index === 1));
  for (const step of star.steps) {
    assert.equal(step.codeLines.length, 1);
    const view = step.validParenthesis678View;
    assert.equal(view.source, problem.code[step.codeLines[0] - 1]);
    assert.ok(view.index === null || view.index < view.s.length);
  }
  assert.equal(star.steps.filter(step => step.final).length, 1);
  assert.doesNotThrow(() => JSON.stringify(star));
});

test('678 trace matches Python values after every executed statement', () => {
  const cases = ['(*))', '()', '*', ')*', '*(', '((**', '())*'];
  const source = `import json, sys, copy
namespace = {}
exec(compile(${JSON.stringify(problem.code.join('\n'))}, 'solution678.py', 'exec'), namespace)
results = []
for s in json.load(sys.stdin):
    records = []
    pending = None
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_filename != 'solution678.py' or frame.f_code.co_name != 'checkValidString':
            return trace
        if event in ('line', 'return'):
            if pending is not None:
                records.append({'line':pending, 'locals':copy.deepcopy({k:v for k,v in frame.f_locals.items() if k != 'self'})})
            pending = frame.f_lineno if event == 'line' else None
        return trace
    sys.settrace(trace)
    answer = namespace['Solution']().checkValidString(s)
    sys.settrace(None)
    results.append({'answer':answer, 'records':records})
assert namespace['Solution']().checkValidString('*' * 100)
print(json.dumps(results))
`;
  const run = spawnSync(python, ['-c', source], { encoding: 'utf8', input: JSON.stringify(cases) });
  assert.equal(run.status, 0, run.stderr);
  const actual = JSON.parse(run.stdout);
  cases.forEach((s, index) => {
    const visual = problem.builder(s);
    assert.equal(visual.answer, actual[index].answer);
    const frames = visual.steps.filter(step => step.codeLines[0] !== 4);
    const records = actual[index].records.filter(record => record.line !== 4);
    assert.equal(frames.length, records.length, s);
    frames.forEach((frame, i) => {
      assert.equal(frame.codeLines[0], records[i].line, s);
      assert.deepEqual(Object.fromEntries(frame.vars.map(v => [v.name, v.value])), records[i].locals, `${s}: line ${records[i].line}`);
    });
  });
});

function rendererHarness() {
  const source = fs.readFileSync(path.join(__dirname, '..', 'public', 'renderer-valid-parenthesis-string-678.js'), 'utf8');
  const element = { querySelector: () => ({ querySelector: () => null }) };
  const context = { lang: 'vi', $: () => element, escapeHtml: String };
  context.pick = value => value[context.lang];
  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, element };
}

test('678 renderer shows exact finalized ranges, all star choices, and witnesses in both languages', () => {
  const { context, element } = rendererHarness();
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const s of ['(*))', '*', ')*', '*(', '()']) {
      for (const step of problem.builder(s).steps) {
        context.renderValidParenthesis678View(step);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
        const view = step.validParenthesis678View;
        const range = view.committed;
        const upper = Math.max(5, range.high === null ? 0 : range.high + 1);
        for (let count = 0; count <= upper; count++) {
          const possible = range.feasible && count >= range.low && count <= range.high;
          assert.ok(element.innerHTML.includes(`data-count="${count}" data-possible="${possible}"`));
        }
        if (view.ch === '*') assert.equal((element.innerHTML.match(/class="vp678-branch(?: |")/g) || []).length, 3);
        if (view.calculating) assert.match(element.innerHTML, /vp678-bounds/);
        if (view.witness) assert.match(element.innerHTML, /vp678-witness/);
      }
    }
  }
  context.lang = 'en';
  context.renderValidParenthesis678View(problem.builder('*').steps.at(-1));
  assert.match(element.innerHTML, /high can be greater than 0/);
  assert.match(element.innerHTML, /Removing ε gives/);
});

test('678 assets load the dedicated renderer with scrolling and responsive theme styles', () => {
  const source = readFrontendJavaScript();
  const registry = source.slice(source.indexOf('const ORDERED_RENDERER_REGISTRY'));
  assert.ok(registry.indexOf('step.validParenthesis678View') < registry.indexOf('step.hardProblemView'));
  assert.match(readFrontendIndex(), /renderer-valid-parenthesis-string-678\.js/);
  assert.match(readFrontendIndex(), /valid-parenthesis-string-678\.css/);
  assert.match(readFrontendStyles(), /\[data-theme="light"\] \.vp678-viz/);
  assert.match(readFrontendStyles(), /\.vp678-range-strip \{[^}]*overflow-x: auto/);
});
