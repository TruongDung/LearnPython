const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');
const { readFrontendJavaScript, readFrontendStyles, readFrontendIndex } = require('./helpers/frontend-source');
const problem = SUPPORTED[3121];
const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');

function oracle(word) {
  let answer = 0;
  for (const lower of 'abcdefghijklmnopqrstuvwxyz') {
    const upper = lower.toUpperCase();
    if (!word.includes(lower) || !word.includes(upper)) continue;
    let seenUpper = false;
    let valid = true;
    for (const ch of word) {
      if (ch === upper) seenUpper = true;
      if (ch === lower && seenUpper) valid = false;
    }
    if (valid) answer++;
  }
  return answer;
}

test('3121 is registered with a line-by-line solution and validated live arguments', () => {
  assert.equal(problem.slug, 'count-the-number-of-special-characters-ii');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'string');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.deepEqual(problem.liveArgs('aaAbcBC'), ['aaAbcBC']);
  for (const bad of ['', 'a b', 'a1A', 'éÉ', 'a'.repeat(81), [], 123, null]) {
    assert.throws(() => problem.builder(bad));
    assert.throws(() => problem.liveArgs(bad));
  }
  assert.equal(problem.builder(' aA ').original, 'aA');
  assert.equal(problem.builder('a'.repeat(79) + 'A').answer, 1);
});

test('3121 matches the published examples and case-order edge cases', () => {
  for (const [word, expected] of [
    ['aaAbcBC', 3], ['abc', 0], ['AbBCab', 0], ['aA', 1], ['Aa', 0],
    ['aAa', 0], ['AaA', 0], ['aAA', 1], ['aaAA', 1], ['AaaA', 0],
    ['a', 0], ['A', 0], ['abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 26],
    ['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 0], ['aaAbcBCa', 2],
  ]) assert.equal(problem.builder(word).answer, expected, word);
});

test('3121 agrees with an independent order oracle on all short two-letter words', () => {
  for (let length = 1; length <= 4; length++) {
    for (let encoding = 0; encoding < 4 ** length; encoding++) {
      let code = encoding;
      let word = '';
      for (let j = 0; j < length; j++) { word += 'abAB'[code % 4]; code = Math.floor(code / 4); }
      assert.equal(problem.builder(word).answer, oracle(word), word);
    }
  }
});

test('3121 snapshots never leak future mutations or count before ans += 1', () => {
  const run = problem.builder('aAAa');
  const steps = run.steps;
  const first = steps.find(s => s.specialCharacters3121View.event === 'update-upper');
  assert.equal(first.specialCharacters3121View.firstUpper[0], 1);
  const repeated = steps.find(s => s.specialCharacters3121View.event === 'first-upper-check' && s.specialCharacters3121View.index === 2);
  assert.equal(repeated.specialCharacters3121View.firstUpper[0], 1);
  const late = steps.find(s => s.specialCharacters3121View.event === 'update-lower' && s.specialCharacters3121View.index === 3);
  assert.equal(late.specialCharacters3121View.lastLower[0], 3);
  assert.equal(first.specialCharacters3121View.lastLower[0], 0);
  assert.equal(steps[0].specialCharacters3121View.lastLower, null);
  assert.equal(run.answer, 0);
  const passes = problem.builder('aA').steps.find(s => s.specialCharacters3121View.event === 'compare' && s.specialCharacters3121View.activeLetter === 'a');
  assert.equal(passes.specialCharacters3121View.checked[0], true);
  assert.equal(passes.specialCharacters3121View.answer, 0);
  assert.deepEqual(passes.specialCharacters3121View.counted, []);
  for (const step of steps) {
    assert.equal(step.codeLines.length, 1);
    assert.equal(step.specialCharacters3121View.source, problem.code[step.codeLines[0] - 1]);
  }
  assert.equal(steps.filter(s => s.final).length, 1);
  assert.equal(steps.at(-1).specialCharacters3121View.checked.filter(v => v !== null).length, 26);
  assert.doesNotThrow(() => JSON.stringify(run));
});

test('3121 simulated states agree with Python after every executed statement', () => {
  const cases = ['aaAbcBC', 'AbBCab', 'aAAa', 'zZ', 'A', 'a'];
  const source = `import json, sys, copy
namespace = {}
exec(compile(${JSON.stringify(problem.code.join('\n'))}, 'solution3121.py', 'exec'), namespace)
all_results = []
for word in json.load(sys.stdin):
    records = []
    pending = None
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_filename != 'solution3121.py' or frame.f_code.co_name != 'numberOfSpecialChars':
            return trace
        if event in ('line', 'return'):
            if pending is not None:
                records.append({'line': pending, 'locals': copy.deepcopy({k:v for k,v in frame.f_locals.items() if k != 'self'})})
            pending = frame.f_lineno if event == 'line' else None
        return trace
    sys.settrace(trace)
    answer = namespace['Solution']().numberOfSpecialChars(word)
    sys.settrace(None)
    all_results.append({'answer':answer, 'records':records})
assert namespace['Solution']().numberOfSpecialChars('a' * 199999 + 'A') == 1
assert namespace['Solution']().numberOfSpecialChars('A' + 'a' * 199999) == 0
print(json.dumps(all_results))
`;
  const run = spawnSync(python, ['-c', source], { encoding: 'utf8', input: JSON.stringify(cases) });
  assert.equal(run.status, 0, run.stderr);
  const actual = JSON.parse(run.stdout);
  const ignored = new Set([2, 6, 14]); // Call/loop headers also execute once when Python exhausts a loop.
  cases.forEach((word, index) => {
    const visualization = problem.builder(word);
    assert.equal(actual[index].answer, visualization.answer);
    const frames = visualization.steps.filter(s => !ignored.has(s.codeLines[0]));
    const records = actual[index].records.filter(r => !ignored.has(r.line));
    assert.equal(frames.length, records.length, word);
    frames.forEach((frame, i) => {
      assert.equal(frame.codeLines[0], records[i].line, word);
      assert.deepEqual(Object.fromEntries(frame.vars.map(v => [v.name, v.value])), records[i].locals, `${word}: line ${records[i].line}`);
    });
  });
});

function rendererHarness() {
  const source = fs.readFileSync(path.join(__dirname, '..', 'public', 'renderer-special-characters-3121.js'), 'utf8');
  const element = { querySelector: () => ({ querySelector: () => null }) };
  const context = { lang: 'vi', $: () => element, escapeHtml: String };
  context.pick = value => value[context.lang];
  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, element };
}

test('3121 renderer shows every frame, boundary arrows, and counted letters in both languages', () => {
  const { context, element } = rendererHarness();
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const word of ['aaAbcBC', 'AbBCab', 'aAAa', 'A', 'zZ']) {
      for (const step of problem.builder(word).steps) {
        context.renderSpecialCharacters3121View(step);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
        assert.equal((element.innerHTML.match(/data-index=/g) || []).length, word.length);
        assert.match(element.innerHTML, /last_lower/);
        assert.match(element.innerHTML, /first_upper/);
        const view = step.specialCharacters3121View;
        if (!view.activeLetter || !view.lastLower || !view.firstUpper) continue;
        const k = view.activeLetter.charCodeAt(0) - 97;
        if (view.lastLower[k] >= 0 && view.firstUpper[k] < word.length) {
          assert.match(element.innerHTML, new RegExp(`sc3121-order ${view.lastLower[k] < view.firstUpper[k] ? 'valid' : 'invalid'}`));
          assert.match(element.innerHTML, /marker-end="url\(#sc3121-arrow\)"/);
        }
      }
    }
  }
  context.lang = 'en';
  const step = problem.builder('aA').steps.find(s => s.specialCharacters3121View.event === 'compare' && s.specialCharacters3121View.activeLetter === 'a');
  context.renderSpecialCharacters3121View(step);
  assert.match(element.innerHTML, /Passes, not counted yet/);
});

test('3121 assets and dedicated renderer are wired with mobile and light-theme styles', () => {
  const source = readFrontendJavaScript();
  const registry = source.slice(source.indexOf('const ORDERED_RENDERER_REGISTRY'));
  assert.ok(registry.indexOf('step.specialCharacters3121View') < registry.indexOf('step.hardProblemView'));
  assert.match(readFrontendIndex(), /renderer-special-characters-3121\.js/);
  assert.match(readFrontendIndex(), /special-characters-3121\.css/);
  const css = readFrontendStyles();
  assert.match(css, /\[data-theme="light"\] \.sc3121-viz/);
  assert.match(css, /\.sc3121-scroll \{[^}]*overflow-x: auto/);
  assert.match(css, /@container \(max-width: 400px\)/);
});
