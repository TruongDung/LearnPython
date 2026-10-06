const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { readFrontendJavaScript, readFrontendStyles, readFrontendIndex } = require('./helpers/frontend-source');
const problem = SUPPORTED[2301];
const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
const examples = [
  ['fool3e7bar', 'leet', [['e', '3'], ['t', '7'], ['t', '8']], true],
  ['fooleetbar', 'f00l', [['o', '0']], false],
  ['Fool33tbaR', 'leetd', [['e', '3'], ['t', '7'], ['t', '8'], ['d', 'b'], ['p', 'b']], true],
  ['c', 'a', [['a', 'b'], ['b', 'c']], false],
  ['a', 'b', [['a', 'b']], false],
  ['aa', 'a', [], true], ['aa', 'b', [], false],
  ['abc', 'bc', [], true], ['a', 'A', [], false],
  ['9', 'A', [['A', '9']], true],
  ['ba', 'aa', [['a', 'b'], ['a', 'b']], true],
];
const runCase = ([s, sub, mappings]) => problem.builder(s, { sub, mappings });

// Independent oracle: enumerate every string obtainable by at most one replacement per position.
function enumerateReplacementOracle(s, sub, mappings) {
  let candidates = [''];
  for (const old of sub) {
    const choices = new Set([old, ...mappings.filter(pair => pair[0] === old).map(pair => pair[1])]);
    candidates = candidates.flatMap(prefix => [...choices].map(next => prefix + next));
  }
  return candidates.some(candidate => s.includes(candidate));
}

test('2301 validates case-sensitive inputs, direct pairs, disclosed bounds, and live args', () => {
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.category.key, 'string');
  assert.deepEqual(problem.liveArgs('abc', { sub: 'a', mappings: '[]' }), ['abc', 'a', []]);
  for (const bad of ['', 123, [], 'a b', 'é', 'a'.repeat(81)]) assert.throws(() => problem.builder(bad, { sub: 'a', mappings: [] }));
  for (const sub of ['', 3, 'a b', 'ab', 'a'.repeat(25)]) assert.throws(() => problem.builder('a', { sub, mappings: [] }));
  for (const mappings of [undefined, null, {}, 'oops', [[]], [['a']], [['a', 'a']], [['ab', 'c']], [['a', 2]], [['a', '#']], [['a', 'b', 'c']], Array(61).fill(['a', 'b'])]) {
    assert.throws(() => problem.liveArgs('a', { sub: 'a', mappings }));
  }
  assert.throws(() => problem.builder('a', null));
  assert.equal(problem.builder('a'.repeat(80), { sub: 'a'.repeat(24), mappings: Array(60).fill(['a', 'b']) }).answer, true);
});

test('2301 handles official examples, reversed mappings, no chaining, unchanged and repeated characters', () => {
  for (const entry of examples) {
    const original = JSON.stringify(entry);
    const run = runCase(entry);
    assert.equal(run.answer, entry[3], JSON.stringify(entry));
    assert.equal(JSON.stringify(entry), original);
    assert.equal(run.steps.filter(step => step.final).length, 1);
    const view = run.steps.at(-1).matchReplacement2301View;
    assert.equal(view.answer, entry[3]);
    if (run.answer) {
      assert.equal(view.statuses.length, entry[1].length);
      assert.ok(view.statuses.every(status => status === 'exact' || status === 'mapped'));
      assert.equal(enumerateReplacementOracle(entry[0].slice(view.start, view.start + entry[1].length), entry[1], entry[2]), true);
    }
  }
  assert.equal(runCase(examples[0]).steps.at(-1).matchReplacement2301View.start, 3);
});

test('2301 agrees with replacement enumeration for every short abc string and directed mapping graph', () => {
  const words = ['a', 'b', 'c'];
  for (const first of ['a', 'b', 'c']) for (const second of ['a', 'b', 'c']) words.push(first + second);
  const edges = [['a', 'b'], ['a', 'c'], ['b', 'a'], ['b', 'c'], ['c', 'a'], ['c', 'b']];
  for (let mask = 0; mask < 64; mask++) {
    const mappings = edges.filter((_, index) => mask & (1 << index));
    for (const s of words) for (const sub of words) if (sub.length <= s.length) {
      assert.equal(problem.builder(s, { sub, mappings }).answer, enumerateReplacementOracle(s, sub, mappings), JSON.stringify([s, sub, mappings]));
    }
  }
});

test('2301 snapshots failed checks before matched changes, skips remaining positions, and resets each window', () => {
  const run = runCase(examples[0]);
  run.steps.forEach((step, index) => {
    const view = step.matchReplacement2301View;
    assert.equal(view.source, problem.code[view.line - 1]);
    assert.equal(view.nextLine, run.steps[index + 1]?.codeLines[0] ?? null);
    if (view.event === 'window') assert.ok(view.statuses.every(status => status === 'pending'));
    if (view.event === 'check' && view.pair.rejected) {
      assert.equal(Object.fromEntries(step.vars.map(v => [v.name, v.value])).matched, true);
      assert.equal(view.nextLine, 11);
      assert.equal(view.statuses[view.j], 'failed');
    }
    if (view.event === 'break') {
      assert.equal(view.nextLine, 13);
      assert.ok(view.statuses.slice(view.j + 1).every(status => status === 'pending'));
    }
    if (view.event === 'check' && view.pair.exact) assert.equal(view.statuses[view.j], 'exact');
  });
  assert.deepEqual(run.steps.at(-1).matchReplacement2301View.statuses, ['exact', 'mapped', 'exact', 'mapped']);
  const failed = runCase(examples[1]);
  assert.equal(failed.steps.at(-2).matchReplacement2301View.event, 'windows-end');
  assert.equal(failed.steps.at(-2).matchReplacement2301View.nextLine, 15);
});

test('2301 code lines and before/after locals match Python after every executed statement', () => {
  const cases = [...examples, ['a'.repeat(30), 'aaaaab', [['b', 'c']], false], ['a'.repeat(80), 'a'.repeat(24), [], true]];
  const source = `import json, sys, copy
namespace = {}
exec(compile(${JSON.stringify(problem.code.join('\n'))}, 'replacement2301.py', 'exec'), namespace)
results = []
for s, sub, mappings, expected in json.load(sys.stdin):
    records = []
    pending = None
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_filename != 'replacement2301.py' or frame.f_code.co_name != 'matchReplacement':
            return trace
        if event in ('line', 'return'):
            if pending is not None:
                values = copy.deepcopy({k:v for k,v in frame.f_locals.items() if k != 'self'})
                if 'allowed' in values:
                    values['allowed'] = sorted([list(pair) for pair in values['allowed']])
                records.append({'line':pending, 'locals':values})
            pending = frame.f_lineno if event == 'line' else None
        return trace
    sys.settrace(trace)
    answer = namespace['Solution']().matchReplacement(s, sub, mappings)
    sys.settrace(None)
    results.append({'answer':answer, 'records':records})
assert namespace['Solution']().matchReplacement('a' * 5000, 'a' * 5000, []) is True
print(json.dumps(results))
`;
  const executed = spawnSync(python, ['-c', source], { encoding: 'utf8', input: JSON.stringify(cases), maxBuffer: 8 * 1024 * 1024 });
  assert.equal(executed.status, 0, executed.stderr);
  const results = JSON.parse(executed.stdout);
  cases.forEach((entry, index) => {
    const run = runCase(entry); const actual = results[index];
    assert.equal(run.answer, actual.answer);
    assert.equal(run.steps.length, actual.records.length);
    run.steps.forEach((step, i) => {
      assert.equal(step.codeLines[0], actual.records[i].line);
      assert.deepEqual(Object.fromEntries(step.vars.map(v => [v.name, v.value])), actual.records[i].locals);
      assert.deepEqual(Object.fromEntries(step.matchReplacement2301View.beforeVars.map(v => [v.name, v.value])), i === 0 ? { s: entry[0], sub: entry[1], mappings: entry[2] } : actual.records[i - 1].locals);
    });
  });
});

test('2301 renderer aligns original strings and explains True/False, direct mapping and variables in VI/EN', () => {
  const element = { querySelector: () => null };
  const context = { lang: 'vi', $: () => element, escapeHtml: String };
  context.pick = value => value[context.lang];
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'public', 'renderer-match-substring-replacement-2301.js'), 'utf8'), context);
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const entry of examples) for (const step of runCase(entry).steps) {
      context.renderMatchReplacement2301View(step);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
      assert.match(element.innerHTML, /mr2301-debug/);
      assert.equal((element.innerHTML.match(/data-index=/g) || []).length, entry[0].length * 2);
      if (step.final) assert.match(element.innerHTML, /mr2301-result/);
    }
  }
});

test('2301 frontend loads its renderer before generic dispatch and supports scrolling and light theme', () => {
  const registry = readFrontendJavaScript().split('const ORDERED_RENDERER_REGISTRY')[1];
  assert.ok(registry.indexOf('step.matchReplacement2301View') < registry.indexOf('step.hardProblemView'));
  assert.match(readFrontendIndex(), /renderer-match-substring-replacement-2301\.js/);
  assert.match(readFrontendIndex(), /match-substring-replacement-2301\.css/);
  assert.match(readFrontendStyles(), /\[data-theme="light"\] \.mr2301-viz/);
  assert.match(readFrontendStyles(), /\.mr2301-strips \{[^}]*overflow-x: auto/);
});
