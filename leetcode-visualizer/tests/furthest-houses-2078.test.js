const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { readFrontendJavaScript, readFrontendStyles, readFrontendIndex } = require('./helpers/frontend-source');
const problem = SUPPORTED[2078];
const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');

function bruteForce(colors) {
  let answer = 0;
  for (let i = 0; i < colors.length; i++) for (let j = i + 1; j < colors.length; j++) {
    if (colors[i] !== colors[j]) answer = Math.max(answer, j - i);
  }
  return answer;
}

test('2078 validates official constraints and accepts color zero in array and CSV inputs', () => {
  assert.equal(problem.slug, 'two-furthest-houses-with-different-colors');
  assert.equal(problem.category.key, 'greedy');
  assert.equal(problem.inputKind, 'nonneg');
  assert.deepEqual(problem.liveArgs('0,100'), [[0, 100]]);
  assert.deepEqual(problem.liveArgs('[0,100]'), [[0, 100]]);
  assert.equal(problem.extraParams[0].key, 'approach');
  assert.deepEqual(problem.extraParams[0].options.map(option => option.value), [1, 2]);
  assert.equal(problem.code2[1], '    def maxDistance(self, colors):');
  for (const bad of [[], [1], [1, 1], [0, 0, 0], [-1, 0], [0, 101], [0, 0.1], [0, null], null, 'nope', Array(101).fill(1)]) {
    assert.throws(() => problem.builder(bad));
    assert.throws(() => problem.builder2(bad));
    assert.throws(() => problem.liveArgs(bad));
  }
  const maximum = [...Array(99).fill(0), 100];
  assert.equal(problem.builder(maximum).answer, 99);
  assert.equal(problem.builder2(maximum).answer, 99);
});

test('2078 matches examples, either winning endpoint, ties, and long matching runs', () => {
  for (const [colors, answer] of [
    [[1, 1, 1, 6, 1, 1, 1], 3], [[1, 8, 3, 8, 3], 4], [[0, 1], 1],
    [[1, 2, 1, 1, 1], 3], [[1, 1, 1, 2, 1], 3], [[0, 1, 0], 1],
    [[0, 100, ...Array(98).fill(0)], 98], [[...Array(98).fill(0), 100, 0], 98],
  ]) {
    const original = [...colors];
    const result = problem.builder(colors);
    assert.equal(result.answer, answer);
    assert.deepEqual(colors, original);
    const view = result.steps.at(-1).furthestHouses2078View;
    assert.ok([view.firstPair, view.lastPair].some(([i, j]) => j - i === answer));
    for (const [i, j] of [view.firstPair, view.lastPair]) assert.notEqual(colors[i], colors[j]);
  }
});

test('2078 endpoint candidates match brute force over every short three-color street', () => {
  for (let n = 2; n <= 7; n++) for (let encoded = 0; encoded < 3 ** n; encoded++) {
    let code = encoded;
    const colors = Array.from({ length: n }, () => { const color = code % 3; code = Math.floor(code / 3); return color; });
    if (new Set(colors).size < 2) continue;
    const run = problem.builder(colors);
    assert.equal(run.answer, bruteForce(colors), JSON.stringify(colors));
    const view = run.steps.at(-1).furthestHouses2078View;
    const candidates = colors.map((color, i) => ({ color, i }));
    assert.equal(view.right, candidates.filter(h => h.color !== colors[0]).at(-1).i);
    assert.equal(view.left, candidates.find(h => h.color !== colors[n - 1]).i);
    const scan = problem.builder2(colors);
    assert.equal(scan.answer, bruteForce(colors), JSON.stringify(colors));
    const scanView = scan.steps.at(-1).furthestHouses2078ScanView;
    assert.equal(scanView.left, view.right);
    assert.equal(scanView.right, n - 1 - view.left);
  }
});

test('2078 approach 2 keeps maximum distances and retained pairs when later candidates are closer', () => {
  const colors = [0, 1, 2, 0];
  const original = [...colors];
  const run = problem.builder2(colors);
  assert.deepEqual(colors, original);
  assert.equal(run.answer, 2);
  assert.equal(run.steps.filter(step => step.final).length, 1);
  const rounds = run.steps.filter(step => step.furthestHouses2078ScanView.event === 'round');
  assert.deepEqual(rounds.map(step => step.furthestHouses2078ScanView.i), [0, 1, 2, 3]);
  const initial = run.steps[1].furthestHouses2078ScanView;
  assert.equal(initial.left, 0);
  assert.equal(initial.right, 0);
  assert.equal(initial.firstPair, null);
  assert.equal(initial.lastPair, null);
  for (const branch of ['left', 'right']) {
    const closer = run.steps.find(step => {
      const view = step.furthestHouses2078ScanView;
      return view.event === `update-${branch}` && view.updated === false;
    }).furthestHouses2078ScanView;
    assert.equal(closer.before, 2);
    assert.equal(closer.mirrored, 1);
    assert.equal(closer[branch], 2);
  }
  const final = run.steps.at(-1).furthestHouses2078ScanView;
  assert.deepEqual(final.firstPair, [0, 2]);
  assert.deepEqual(final.lastPair, [1, 3]);
  assert.equal(final.i, null);
  for (const step of run.steps) {
    const view = step.furthestHouses2078ScanView;
    assert.equal(view.source, problem.code2[view.line - 1]);
    assert.ok(view.i === null || (view.i >= 0 && view.i < colors.length));
    if (view.event.startsWith('check-')) assert.equal(view.updated, null);
  }
});

test('2078 approach 2 preserves the submitted Python code and matches its executed locals', () => {
  const cases = [[1, 1, 1, 6, 1, 1, 1], [0, 1, 2, 0], [0, 1], [1, 2, 1, 1, 1], [...Array(99).fill(0), 100]];
  const script = `import json, sys, copy
namespace = {}
exec(compile(${JSON.stringify(problem.code2.join('\n'))}, 'scan2078.py', 'exec'), namespace)
results = []
for colors in json.load(sys.stdin):
    records = []
    pending = None
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_filename != 'scan2078.py' or frame.f_code.co_name != 'maxDistance':
            return trace
        if event in ('line', 'return'):
            if pending is not None:
                records.append({'line':pending, 'locals':copy.deepcopy({k:v for k,v in frame.f_locals.items() if k != 'self'})})
            pending = frame.f_lineno if event == 'line' else None
        return trace
    sys.settrace(trace)
    answer = namespace['Solution']().maxDistance(colors)
    sys.settrace(None)
    results.append({'answer':answer, 'records':records})
print(json.dumps(results))
`;
  const executed = spawnSync(python, ['-c', script], { encoding: 'utf8', input: JSON.stringify(cases) });
  assert.equal(executed.status, 0, executed.stderr);
  const results = JSON.parse(executed.stdout);
  cases.forEach((colors, index) => {
    const visual = problem.builder2(colors);
    assert.equal(visual.answer, results[index].answer);
    const frames = visual.steps;
    const records = results[index].records;
    assert.equal(frames.length, records.length);
    frames.forEach((step, i) => {
      assert.equal(step.codeLines[0], records[i].line);
      assert.deepEqual(Object.fromEntries(step.vars.map(v => [v.name, v.value])), records[i].locals);
      const before = i === 0 ? { colors } : records[i - 1].locals;
      assert.deepEqual(Object.fromEntries(step.furthestHouses2078ScanView.beforeVars.map(v => [v.name, v.value])), before);
    });
    assert.equal(Object.hasOwn(Object.fromEntries(visual.steps.at(-1).vars.map(v => [v.name, v.value])), 'answer'), false);
  });
});

test('2078 approach 2 renderer separates current positions from retained best pairs in both languages', () => {
  const element = { querySelector: () => ({ querySelector: () => null }) };
  const context = { lang: 'vi', $: () => element, escapeHtml: String };
  context.pick = value => value[context.lang];
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'public', 'renderer-furthest-houses-2078.js'), 'utf8'), context);
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const step of problem.builder2([0, 1, 2, 0]).steps) {
      context.renderFurthestHouses2078View(step);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
      assert.match(element.innerHTML, /fh2078-scan-viz/);
      assert.match(element.innerHTML, /fh2078-debug/);
      assert.equal((element.innerHTML.match(/data-index=/g) || []).length, 8);
      const view = step.furthestHouses2078ScanView;
      if (view.updated === false) assert.match(element.innerHTML, /max\(2, 1\) = 2/);
      if (step.final) {
        assert.equal((element.innerHTML.match(/class="fh2078-lane winner"/g) || []).length, 2);
        assert.doesNotMatch(element.innerHTML, /class="fh2078-house[^"\n]* pointer/);
      }
    }
  }
});

test('2078 approach 2 debug follows every executed line, skipping false branches and recording loop exhaustion', () => {
  const run = problem.builder2([0, 1, 2, 0]);
  assert.deepEqual(run.steps.map(step => step.codeLines[0]), [3, 4, 6, 7, 10, 6, 7, 8, 10, 11, 6, 7, 8, 10, 11, 6, 7, 10, 6, 13]);
  run.steps.forEach((step, index) => {
    const view = step.furthestHouses2078ScanView;
    assert.equal(step.codeBlock, 2);
    assert.equal(view.nextLine, run.steps[index + 1]?.codeLines[0] ?? null);
    assert.equal(view.nextSource, view.nextLine === null ? null : problem.code2[view.nextLine - 1]);
    if (view.event === 'check-right') {
      assert.equal(view.nextLine, view.different ? 8 : 10);
      assert.equal(view.skippedLine, view.different ? null : 8);
    }
    if (view.event === 'check-left') {
      assert.equal(view.nextLine, view.different ? 11 : 6);
      assert.equal(view.skippedLine, view.different ? null : 11);
    }
  });
  const loopEnd = run.steps.at(-2);
  assert.equal(loopEnd.furthestHouses2078ScanView.event, 'loop-end');
  assert.equal(loopEnd.furthestHouses2078ScanView.i, null);
  assert.equal(loopEnd.furthestHouses2078ScanView.answer, null);
  assert.equal(loopEnd.vars.find(v => v.name === 'i').value, 3);
  assert.equal(loopEnd.furthestHouses2078ScanView.nextLine, 13);
});

test('2078 frames keep moved pointers unchecked and freeze previously emitted state', () => {
  const result = problem.builder([1, 1, 1, 6, 1, 1, 1]);
  assert.equal(result.steps.filter(s => s.final).length, 1);
  assert.deepEqual(result.steps[0].vars.map(v => v.name), ['colors', 'n']);
  const rightStart = result.steps.find(s => s.codeLines[0] === 4);
  assert.equal(rightStart.furthestHouses2078View.right, 6);
  assert.equal(rightStart.furthestHouses2078View.firstPair, null);
  for (const step of result.steps) {
    const view = step.furthestHouses2078View;
    assert.equal(step.codeLines.length, 1);
    assert.equal(view.source, problem.code[view.line - 1]);
    for (const pointer of [view.left, view.right]) assert.ok(pointer === null || (pointer >= 0 && pointer < view.n));
    if ([6, 9].includes(view.line)) assert.equal(view.check, null);
    if (view.firstPair) assert.notEqual(view.colors[view.firstPair[0]], view.colors[view.firstPair[1]]);
    if (view.lastPair) assert.notEqual(view.colors[view.lastPair[0]], view.colors[view.lastPair[1]]);
  }
  const calculateFirst = result.steps.find(s => s.codeLines[0] === 10).furthestHouses2078View;
  assert.equal(calculateFirst.fromFirst, 3);
  assert.equal(calculateFirst.fromLast, null);
  assert.equal(calculateFirst.answer, null);
  assert.doesNotThrow(() => JSON.stringify(result));
});

test('2078 line-by-line frames match actual Python locals after every executed statement', () => {
  const cases = [[1, 1, 1, 6, 1, 1, 1], [1, 8, 3, 8, 3], [0, 1], [1, 2, 1, 1, 1], [1, 1, 1, 2, 1], [0, 100, ...Array(98).fill(0)]];
  const script = `import json, sys, copy
namespace = {}
exec(compile(${JSON.stringify(problem.code.join('\n'))}, 'solution2078.py', 'exec'), namespace)
results = []
for colors in json.load(sys.stdin):
    records = []
    pending = None
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_filename != 'solution2078.py' or frame.f_code.co_name != 'maxDistance':
            return trace
        if event in ('line', 'return'):
            if pending is not None:
                records.append({'line': pending, 'locals': copy.deepcopy({k:v for k,v in frame.f_locals.items() if k != 'self'})})
            pending = frame.f_lineno if event == 'line' else None
        return trace
    sys.settrace(trace)
    answer = namespace['Solution']().maxDistance(colors)
    sys.settrace(None)
    results.append({'answer': answer, 'records': records})
print(json.dumps(results))
`;
  const executed = spawnSync(python, ['-c', script], { encoding: 'utf8', input: JSON.stringify(cases) });
  assert.equal(executed.status, 0, executed.stderr);
  const actual = JSON.parse(executed.stdout);
  cases.forEach((colors, index) => {
    const visual = problem.builder(colors);
    assert.equal(visual.answer, actual[index].answer);
    assert.equal(visual.steps.length, actual[index].records.length);
    visual.steps.forEach((step, i) => {
      assert.equal(step.codeLines[0], actual[index].records[i].line);
      assert.deepEqual(Object.fromEntries(step.vars.map(v => [v.name, v.value])), actual[index].records[i].locals);
    });
  });
});

test('2078 renderer shows both streets, precise pairs, and both winners on a tie in VI and EN', () => {
  const element = { querySelector: () => ({ querySelector: () => null }) };
  const context = { lang: 'vi', $: () => element, escapeHtml: String };
  context.pick = value => value[context.lang];
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'public', 'renderer-furthest-houses-2078.js'), 'utf8'), context);
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const colors of [[1, 1, 1, 6, 1, 1, 1], [0, 1], [1, 2, 1, 1, 1], [1, 1, 1, 2, 1]]) {
      for (const step of problem.builder(colors).steps) {
        context.renderFurthestHouses2078View(step);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
        assert.equal((element.innerHTML.match(/data-index=/g) || []).length, colors.length * 2);
        if (step.final) {
          const view = step.furthestHouses2078View;
          const winners = [view.firstPair, view.lastPair].filter(([i, j]) => j - i === view.answer).length;
          assert.equal((element.innerHTML.match(/class="fh2078-lane winner"/g) || []).length, winners);
          assert.match(element.innerHTML, /fh2078-comparison/);
        }
      }
    }
  }
});

test('2078 assets register its renderer before generic views with responsive scrolling and light theme', () => {
  const source = readFrontendJavaScript();
  const registry = source.slice(source.indexOf('const ORDERED_RENDERER_REGISTRY'));
  assert.ok(registry.indexOf('step.furthestHouses2078View') < registry.indexOf('step.hardProblemView'));
  assert.match(readFrontendIndex(), /renderer-furthest-houses-2078\.js/);
  assert.match(readFrontendIndex(), /furthest-houses-2078\.css/);
  assert.match(readFrontendStyles(), /\[data-theme="light"\] \.fh2078-viz/);
  assert.match(readFrontendStyles(), /\.fh2078-street \{[^}]*overflow-x: auto/);
});
