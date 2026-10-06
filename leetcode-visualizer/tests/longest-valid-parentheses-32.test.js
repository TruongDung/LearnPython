const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const vm = require('node:vm');
const { readFrontendJavaScript } = require('./helpers/frontend-source');
const problem = require('../problems').SUPPORTED[32];

const cases = [
  ['', 0], ['(()', 2], [')()())', 4], ['()()', 4], ['(())', 4],
  [')))', 0], ['(((', 0], ['())()', 2], ['()(())', 6],
  [')(()())(', 6], ['()'.repeat(11), 22],
];

function oracle(s) {
  let best = 0;
  for (let left = 0; left < s.length; left++) {
    let balance = 0;
    for (let right = left; right < s.length; right++) {
      balance += s[right] === '(' ? 1 : -1;
      if (balance < 0) break;
      if (balance === 0) best = Math.max(best, right - left + 1);
    }
  }
  return best;
}

test('32 preserves the input and returns correct answers, including empty strings', () => {
  assert.equal(problem.debugMode, 'line-by-line');
  for (const [s, answer] of cases) {
    const result = problem.builder(s);
    assert.equal(result.original, s);
    assert.equal(result.answer, answer, s);
    assert.equal(result.steps.at(-1).paren32View.best, answer);
    assert.equal(result.steps.filter(step => step.final).length, 1);
    assert.deepEqual(result.steps.at(-1).codeLines, [14]);
    for (const step of result.steps) {
      assert.equal(step.codeLines.length, 1);
      assert.ok(step.codeLines[0] >= 2 && step.codeLines[0] <= problem.code.length);
      assert.equal(step.paren32View.debugLine, step.codeLines[0]);
    }
  }
});

test('32 agrees with an independent oracle for all parentheses strings up to length 7', () => {
  for (let size = 0; size <= 7; size++) {
    for (let mask = 0; mask < 2 ** size; mask++) {
      const s = Array.from({ length: size }, (_, i) => (mask & (1 << i)) ? '(' : ')').join('');
      assert.equal(problem.builder(s).answer, oracle(s), s);
    }
  }
});

test('32 condition snapshots precede mutations and locals use Python variable names', () => {
  const steps = problem.builder(')()').steps;
  const at = (event, i) => steps.find(step => step.paren32View.event === event && step.paren32View.currentIndex === i);
  assert.deepEqual(steps.slice(0, 3).map(step => step.codeLines[0]), [2, 3, 4]);
  assert.deepEqual(steps[0].vars.map(v => v.name), ['s']);
  assert.deepEqual(steps[1].vars.map(v => v.name), ['s', 'best']);
  assert.deepEqual(at('char-check', 0).paren32View.stack, [-1]);
  assert.deepEqual(at('pop', 0).paren32View.stack, []);
  assert.deepEqual(at('empty-check', 0).paren32View.stack, []);
  assert.deepEqual(at('reset', 0).paren32View.stack, [0]);
  assert.deepEqual(at('char-check', 1).paren32View.stack, [0]);
  assert.deepEqual(at('push', 1).paren32View.stack, [0, 1]);
  assert.equal(at('measure-branch', 2).paren32View.best, 0);
  assert.equal(at('best', 2).paren32View.best, 2);
  const locals = Object.fromEntries(at('best', 2).vars.map(v => [v.name, v.value]));
  assert.deepEqual(locals, { s: '")()"', best: 2, stack: [0], i: 2, ch: ')' });
  assert.equal(steps.at(-2).paren32View.event, 'loop-exit');
  assert.deepEqual(steps.at(-2).codeLines, [5]);
  assert.deepEqual(steps.at(-2).vars, steps.at(-1).vars);
});

test('32 statement order and local values match execution of the displayed Python', () => {
  const inputs = cases.map(([s]) => s);
  const source = `import sys, json
${problem.code.join('\n')}
traces = []
previous = None
current = []
def trace(frame, event, arg):
    global previous
    if frame.f_code.co_name != 'longestValidParentheses':
        return trace
    if event in ('line', 'return'):
        if previous is not None:
            values = {key: value for key, value in frame.f_locals.items() if key in ('s', 'best', 'stack', 'i', 'ch')}
            current.append({'line': previous - 1, 'locals': json.loads(json.dumps(values))})
        previous = frame.f_lineno if event == 'line' else None
    return trace
for s in ${JSON.stringify(inputs)}:
    current = []
    previous = None
    sys.settrace(trace)
    answer = Solution().longestValidParentheses(s)
    sys.settrace(None)
    traces.append({'answer': answer, 'steps': current})
print(json.dumps(traces))
`;
  const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
  const result = spawnSync(python, ['-c', source], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  const traces = JSON.parse(result.stdout);
  inputs.forEach((s, index) => {
    const built = problem.builder(s);
    // else headers and function entry are explanatory stops, not Python statements.
    const snapshots = built.steps.filter(step => ![2, 8, 12].includes(step.codeLines[0])).map(step => ({
      line: step.codeLines[0],
      locals: Object.fromEntries(step.vars.map(v => [v.name, v.name === 's' ? JSON.parse(v.value) : v.value])),
    }));
    assert.equal(built.answer, traces[index].answer, s);
    assert.deepEqual(snapshots, traces[index].steps, s);
  });
});

test('32 frontend expansion and breakpoints retain each statement snapshot', () => {
  const source = readFrontendJavaScript();
  const start = source.indexOf('function shouldUseLineByLineDebug()');
  const end = source.indexOf('\n// ---- Run algorithm ----', start);
  const context = { problemData: { id: 32, debugMode: problem.debugMode }, debugBreakpoints: new Set(['1:6']) };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const raw = problem.builder('()').steps;
  context.steps = context.expandStepsLineByLine(raw);
  assert.equal(context.shouldUseLineByLineDebug(), true);
  assert.equal(context.steps.length, raw.length);
  const breakpoint = context.findBreakpointStep(0, 1);
  assert.equal(context.steps[breakpoint].paren32View.event, 'char-check');
  assert.deepEqual(context.steps[breakpoint].paren32View.stack, [-1]);
  assert.equal(context.steps.filter(step => step.final).length, 1);
});

test('32 renderer handles every new debug stop in Vietnamese and English', () => {
  const source = readFrontendJavaScript();
  const start = source.indexOf('function renderParen32View(step)');
  const end = source.indexOf('\nfunction renderWordBreakIIView(step)', start);
  const element = {};
  const context = { lang: 'vi', $: () => element, escapeHtml: String };
  context.pick = value => value[context.lang];
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const [s] of cases) {
      for (const step of problem.builder(s).steps) {
        context.renderParen32View(step);
        assert.match(element.innerHTML, /p32-viz/);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
        if (step.paren32View.event === 'char-check') assert.ok(element.innerHTML.includes(step.title[language]));
      }
    }
  }
});

test('32 rejects invalid input instead of silently rewriting or truncating it', () => {
  assert.throws(() => problem.builder('(a)'), /only/);
  assert.throws(() => problem.builder('('.repeat(23)), /at most 22/);
});
