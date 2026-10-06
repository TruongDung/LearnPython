const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');
const { readFrontendJavaScript, readFrontendStyles, readFrontendIndex } = require('./helpers/frontend-source');
const problem = SUPPORTED[448];
const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');

function oracle(nums) {
  const present = new Set(nums);
  return Array.from({ length: nums.length }, (_, i) => i + 1).filter(value => !present.has(value));
}

test('448 registers a validated array visualization and matching live arguments', () => {
  assert.equal(problem.slug, 'find-all-numbers-disappeared-in-an-array');
  assert.equal(problem.category.key, 'array');
  assert.equal(problem.difficulty, 'easy');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.deepEqual(problem.liveArgs([1, 1]), [[1, 1]]);
  assert.deepEqual(problem.builder('4,3,2,7,8,2,3,1').answer, [5, 6]);
  assert.deepEqual(problem.builder('[1,1]').answer, [2]);
  for (const input of [[], [0], [-1], [2], [1, 3], [1.5], [NaN], [Infinity], null, {}, 'bad', Array(81).fill(1)]) {
    assert.throws(() => problem.builder(input));
    assert.throws(() => problem.liveArgs(input));
  }
  assert.deepEqual(problem.builder(Array(80).fill(80)).answer, Array.from({ length: 79 }, (_, i) => i + 1));
});

test('448 matches the published examples and handles complete, duplicate, and singleton inputs', () => {
  for (const [input, expected] of [
    [[4, 3, 2, 7, 8, 2, 3, 1], [5, 6]], [[1, 1], [2]], [[1], []],
    [[2, 2], [1]], [[1, 2, 3, 4], []], [[4, 3, 2, 1], []],
    [[3, 3, 3], [1, 2]], [[1, 1, 1], [2, 3]],
  ]) {
    const original = [...input];
    const run = problem.builder(input);
    assert.deepEqual(run.answer, expected);
    assert.deepEqual(input, original, 'the teaching trace must not mutate caller input');
    assert.deepEqual(run.original, original);
    const final = run.steps.at(-1).disappearedNumbers448View;
    assert.deepEqual(final.nums.map(Math.abs), original);
    assert.deepEqual(final.nums.map((value, index) => value > 0 ? index + 1 : null).filter(value => value !== null), expected);
  }
});

test('448 agrees with an independent set oracle for all small arrays and randomized longer arrays', () => {
  for (let n = 1; n <= 4; n++) {
    for (let code = 0; code < n ** n; code++) {
      let remaining = code;
      const input = Array.from({ length: n }, () => { const value = 1 + remaining % n; remaining = Math.floor(remaining / n); return value; });
      assert.deepEqual(problem.builder(input).answer, oracle(input));
    }
  }
  let seed = 448;
  for (let sample = 0; sample < 50; sample++) {
    const n = 1 + sample;
    const input = Array.from({ length: n }, () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return 1 + seed % n;
    });
    assert.deepEqual(problem.builder(input).answer, oracle(input));
  }
});

test('448 snapshots distinguish reading, mapping, marking, skipping duplicates, and appending', () => {
  const run = problem.builder(problem.defaultInput);
  const firstMapped = run.steps.find(step => step.disappearedNumbers448View.event === 'map-index');
  assert.equal(firstMapped.disappearedNumbers448View.value, 4);
  assert.equal(firstMapped.disappearedNumbers448View.target, 3);
  assert.equal(firstMapped.disappearedNumbers448View.nums[3], 7);
  const firstMark = run.steps.find(step => step.disappearedNumbers448View.event === 'mark-negative');
  assert.equal(firstMark.disappearedNumbers448View.nums[3], -7);
  assert.equal(firstMark.disappearedNumbers448View.targetBefore, 7);
  assert.equal(firstMapped.disappearedNumbers448View.nums[3], 7, 'later mutations must not leak backward');
  const negativeRead = run.steps.find(step => step.disappearedNumbers448View.event === 'absolute' && step.disappearedNumbers448View.current === 2);
  assert.equal(negativeRead.disappearedNumbers448View.nums[2], -2);
  assert.equal(negativeRead.disappearedNumbers448View.value, 2);
  const duplicate = run.steps.find(step => step.disappearedNumbers448View.event === 'mark-check' && step.disappearedNumbers448View.current === 5);
  assert.equal(duplicate.disappearedNumbers448View.accepted, false);
  assert.equal(duplicate.disappearedNumbers448View.nums[1], -3);
  assert.ok(!run.steps.some(step => step.disappearedNumbers448View.event === 'mark-negative' && step.disappearedNumbers448View.current === 5));
  const beforeAppend = run.steps.find(step => step.disappearedNumbers448View.event === 'missing-check' && step.disappearedNumbers448View.current === 4);
  assert.deepEqual(beforeAppend.disappearedNumbers448View.missing, []);
  const appended = run.steps.find(step => step.disappearedNumbers448View.event === 'append-missing');
  assert.deepEqual(appended.disappearedNumbers448View.missing, [5]);
  assert.equal(appended.disappearedNumbers448View.nums[4], 8, 'append index + 1, not the stored value');
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.equal(step.disappearedNumbers448View.source, problem.code[step.codeLines[0] - 1]);
  }
  assert.equal(run.steps.filter(step => step.final).length, 1);
  assert.equal(run.steps[0].disappearedNumbers448View.missing, null);
  assert.doesNotThrow(() => JSON.stringify(run));
});

test('448 simulated states match Python after every statement and Python handles the original size limit', () => {
  const cases = [problem.defaultInput, [1, 1], [1], [2, 2], [4, 3, 2, 1], [3, 3, 3]];
  const source = `import json, sys, copy
namespace = {}
exec(compile(${JSON.stringify(problem.code.join('\n'))}, 'solution448.py', 'exec'), namespace)
results = []
for nums in json.load(sys.stdin):
    records = []
    pending = None
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_filename != 'solution448.py' or frame.f_code.co_name != 'findDisappearedNumbers':
            return trace
        if event in ('line', 'return'):
            if pending is not None:
                records.append({'line':pending, 'locals':copy.deepcopy({k:v for k,v in frame.f_locals.items() if k != 'self'})})
            pending = frame.f_lineno if event == 'line' else None
        return trace
    sys.settrace(trace)
    answer = namespace['Solution']().findDisappearedNumbers(nums)
    sys.settrace(None)
    results.append({'answer':answer, 'records':records})
assert namespace['Solution']().findDisappearedNumbers([1] * 100000) == list(range(2, 100001))
print(json.dumps(results))
`;
  const run = spawnSync(python, ['-c', source], { encoding: 'utf8', input: JSON.stringify(cases) });
  assert.equal(run.status, 0, run.stderr);
  const actual = JSON.parse(run.stdout);
  const ignored = new Set([2, 3, 10]); // Python also visits loop headers once when each loop ends.
  cases.forEach((input, index) => {
    const visual = problem.builder(input);
    assert.deepEqual(visual.answer, actual[index].answer);
    const frames = visual.steps.filter(s => !ignored.has(s.codeLines[0]));
    const records = actual[index].records.filter(r => !ignored.has(r.line));
    assert.equal(frames.length, records.length);
    frames.forEach((frame, i) => {
      assert.equal(frame.codeLines[0], records[i].line);
      assert.deepEqual(Object.fromEntries(frame.vars.map(v => [v.name, v.value])), records[i].locals, `input ${input}, line ${records[i].line}`);
    });
  });
});

function rendererHarness() {
  const source = fs.readFileSync(path.join(__dirname, '..', 'public', 'renderer-disappeared-numbers-448.js'), 'utf8');
  const element = { querySelector: () => ({ querySelector: () => null }) };
  const context = { lang: 'vi', $: () => element, escapeHtml: String };
  context.pick = value => value[context.lang];
  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, element };
}

test('448 renders sign states, mapping arrows, and missing outputs at every frame in both languages', () => {
  const { context, element } = rendererHarness();
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const input of [problem.defaultInput, [1, 1], [1], [2, 2]]) {
      for (const step of problem.builder(input).steps) {
        context.renderDisappearedNumbers448View(step);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
        assert.equal((element.innerHTML.match(/data-index=/g) || []).length, input.length);
        const view = step.disappearedNumbers448View;
        view.nums.forEach((value, index) => {
          assert.ok(element.innerHTML.includes(`data-index="${index}" data-value="${value}"`));
          const status = value < 0 ? 'seen' : ['collect', 'done'].includes(view.phase) ? 'missing' : 'unmarked';
          assert.ok(element.innerHTML.includes(`data-number="${index + 1}" data-status="${status}"`));
        });
        if (view.phase === 'mark' && view.target !== null) assert.match(element.innerHTML, /marker-end="url\(#dn448-arrowhead\)"/);
        if (view.event === 'mark-negative') assert.match(element.innerHTML, /changed/);
        if (view.event === 'append-missing') assert.match(element.innerHTML, /dn448-output/);
      }
    }
  }
  context.lang = 'en';
  const duplicate = problem.builder([1, 1]).steps.find(s => s.disappearedNumbers448View.event === 'mark-check' && s.disappearedNumbers448View.accepted === false);
  context.renderDisappearedNumbers448View(duplicate);
  assert.match(element.innerHTML, /Already negative → keep unchanged \(duplicate\)/);
  context.renderDisappearedNumbers448View(problem.builder([1]).steps.at(-1));
  assert.match(element.innerHTML, /No missing numbers/);
});

test('448 assets and renderer registration support scrollable arrays, light theme, and reduced motion', () => {
  const registry = readFrontendJavaScript().slice(readFrontendJavaScript().indexOf('const ORDERED_RENDERER_REGISTRY'));
  assert.ok(registry.indexOf('step.disappearedNumbers448View') < registry.indexOf('step.hardProblemView'));
  assert.match(readFrontendIndex(), /renderer-disappeared-numbers-448\.js/);
  assert.match(readFrontendIndex(), /disappeared-numbers-448\.css/);
  const css = readFrontendStyles();
  assert.match(css, /\[data-theme="light"\] \.dn448-viz/);
  assert.match(css, /\.dn448-scroll \{[^}]*overflow-x: auto/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});
