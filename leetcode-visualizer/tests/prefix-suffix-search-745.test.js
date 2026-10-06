const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { prepareDesignLiveRun } = require('../live-args');
const { readFrontendJavaScript, readFrontendStyles, readFrontendIndex } = require('./helpers/frontend-source');
const problem = SUPPORTED[745];
const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
const brute = (words, pref, suff) => words.reduce((best, word, index) => word.startsWith(pref) && word.endsWith(suff) ? index : best, -1);

test('745 validates word/query constraints, permits duplicates and binds WordFilter live operations', () => {
  const words = ['apple', 'apple'];
  const params = { queries: '[["a","e"]]' };
  assert.deepEqual(prepareDesignLiveRun(problem, words, params), {
    className: 'WordFilter', constructorArgs: [words], operations: [{ name: 'f', args: ['a', 'e'] }],
  });
  for (const bad of [[], [''], ['Apple'], ['abcdefgh'], Array(11).fill('a'), ['a#b']]) assert.throws(() => problem.builder(bad, params));
  for (const queries of ['', 'bad', [], [['', 'a']], [['a', '']], [['A', 'e']], [['abcdefgh', 'a']], [['a']], Array(13).fill(['a', 'a'])]) {
    assert.throws(() => problem.builder(['a'], { queries }));
    assert.throws(() => prepareDesignLiveRun(problem, ['a'], { queries }));
  }
  assert.equal(problem.builder(Array(10).fill('abcdefg'), { queries: [['abcdefg', 'abcdefg']] }).answer.at(-1), 9);
});

test('745 returns the official example, largest index, missing key, overlap, and repeated queries', () => {
  const official = problem.builder(['apple'], { queries: [['a', 'e']] });
  assert.deepEqual(official.answer, [null, 0]);
  const words = ['apple', 'apply', 'apple'];
  const queries = [['a', 'e'], ['app', 'ly'], ['x', 'e'], ['apple', 'apple'], ['a', 'e']];
  const run = problem.builder(words, { queries });
  assert.deepEqual(run.answer, [null, 2, 1, -1, 2, 2]);
  assert.deepEqual(words, ['apple', 'apply', 'apple']);
  assert.equal(run.steps.filter(step => step.final).length, 1);
  assert.deepEqual(run.steps.at(-1).prefixSuffix745View.outputs, run.answer);
});

test('745 lookup results agree with scanning words over exhaustive small dictionaries and queries', () => {
  const dictionary = ['a', 'b', 'aa', 'ab', 'ba', 'bb'];
  const parts = [...dictionary, 'aaa'];
  const queries = parts.flatMap(pref => parts.map(suff => [pref, suff]));
  for (const first of dictionary) for (const second of dictionary) for (const third of dictionary) {
    const words = [first, second, third];
    for (let offset = 0; offset < queries.length; offset += 12) {
      const batch = queries.slice(offset, offset + 12);
      const run = problem.builder(words, { queries: batch });
      assert.deepEqual(run.answer, [null, ...batch.map(([pref, suff]) => brute(words, pref, suff))]);
    }
  }
});

test('745 grid shows map contents before slicing, after writing, and after duplicate-key overwrite', () => {
  const run = problem.builder(['aa', 'aa'], { queries: [['aa', 'aa']] });
  const writes = run.steps.filter(step => step.prefixSuffix745View.event === 'write');
  assert.equal(writes.length, 8);
  const first = writes[0].prefixSuffix745View;
  assert.equal(first.grid[0][0], 0);
  assert.equal(first.grid[1][1], null);
  assert.equal(first.previousIndex, null);
  const duplicate = writes[4].prefixSuffix745View;
  assert.equal(duplicate.previousIndex, 0);
  assert.equal(duplicate.grid[0][0], 1);
  assert.equal(duplicate.grid[1][1], 0);
  assert.equal(duplicate.lookupSize, 4);
  assert.equal(run.steps.at(-1).prefixSuffix745View.lookupSize, 4);
  run.steps.forEach((step, index) => {
    const view = step.prefixSuffix745View;
    assert.equal(view.source, problem.code[view.line - 1]);
    assert.equal(view.nextLine, run.steps[index + 1]?.codeLines[0] ?? null);
    assert.ok(view.recent.length <= 6);
  });
  assert.equal(first.grid[0][0], 0);
});

test('745 every constructor/query line, locals and lookup grid match real Python execution', () => {
  const cases = [
    { words: ['apple'], queries: [['a', 'e'], ['apple', 'apple']] },
    { words: ['aa', 'ab', 'aa'], queries: [['a', 'a'], ['a', 'b'], ['b', 'b']] },
    { words: ['abab', 'ab'], queries: [['aba', 'bab'], ['ab', 'ab']] },
  ];
  const source = `import json, sys, copy
namespace = {}
exec(compile(${JSON.stringify(problem.code.join('\n'))}, 'wordfilter745.py', 'exec'), namespace)
results = []
for case in json.load(sys.stdin):
    records = []
    pending = None
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_filename != 'wordfilter745.py' or frame.f_code.co_name not in ('__init__', 'f'):
            return trace
        if event in ('line', 'return'):
            if pending is not None:
                records.append({'line':pending, 'method':frame.f_code.co_name,
                    'locals':copy.deepcopy({k:v for k,v in frame.f_locals.items() if k != 'self'}),
                    'lookup':{p+'#'+s:v for (p,s),v in frame.f_locals['self'].lookup.items()}})
            pending = frame.f_lineno if event == 'line' else None
        return trace
    sys.settrace(trace)
    obj = namespace['WordFilter'](case['words'])
    answer = [None] + [obj.f(*query) for query in case['queries']]
    sys.settrace(None)
    results.append({'records':records, 'answer':answer})
print(json.dumps(results))
`;
  const executed = spawnSync(python, ['-c', source], { encoding: 'utf8', input: JSON.stringify(cases), maxBuffer: 4 * 1024 * 1024 });
  assert.equal(executed.status, 0, executed.stderr);
  const results = JSON.parse(executed.stdout);
  cases.forEach((item, index) => {
    const run = problem.builder(item.words, { queries: item.queries });
    assert.deepEqual(run.answer, results[index].answer);
    assert.equal(run.steps.length, results[index].records.length);
    run.steps.forEach((step, i) => {
      const record = results[index].records[i];
      const view = step.prefixSuffix745View;
      assert.equal(view.line, record.line);
      assert.deepEqual(Object.fromEntries(step.vars.map(v => [v.name, v.value])), record.locals);
      assert.equal(view.lookupSize, Object.keys(record.lookup).length);
      if (view.word) view.grid.forEach((row, p) => row.forEach((value, s) => {
        assert.equal(value, record.lookup[view.word.slice(0, p + 1) + '#' + view.word.slice(-s - 1)] ?? null);
      }));
      const callStart = i === 0 || record.method !== results[index].records[i - 1].method || record.line === 12;
      const before = callStart ? record.method === 'f' ? { pref: record.locals.pref, suff: record.locals.suff } : { words: item.words } : results[index].records[i - 1].locals;
      assert.deepEqual(Object.fromEntries(view.beforeVars.map(v => [v.name, v.value])), before);
    });
  });
});

test('745 renderer shows overlap, indexed grid cells, overwrites and matching results in VI and EN', () => {
  const element = { querySelector: () => null };
  const context = { lang: 'vi', $: () => element, escapeHtml: String };
  context.pick = value => value[context.lang];
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'public', 'renderer-prefix-suffix-search-745.js'), 'utf8'), context);
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const step of problem.builder(['aa', 'aa'], { queries: [['aa', 'aa'], ['b', 'a']] }).steps) {
      context.renderPrefixSuffix745View(step);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
      assert.match(element.innerHTML, /ps745-debug/);
      const view = step.prefixSuffix745View;
      if (view.word) assert.equal((element.innerHTML.match(/data-p=/g) || []).length, 4);
      if (view.event === 'write' && view.p === 2 && view.s === 2) assert.equal((element.innerHTML.match(/class="ps745-letter both"/g) || []).length, 2);
      if (view.event === 'query-return' && view.query.result === 1) assert.match(element.innerHTML, /class="ps745-word selected match" data-index="1"/);
    }
  }
});

test('745 frontend loads its dedicated renderer with scrolling and light theme', () => {
  const registry = readFrontendJavaScript().split('const ORDERED_RENDERER_REGISTRY')[1];
  assert.ok(registry.indexOf('step.prefixSuffix745View') < registry.indexOf('step.hardProblemView'));
  assert.match(readFrontendIndex(), /renderer-prefix-suffix-search-745\.js/);
  assert.match(readFrontendIndex(), /prefix-suffix-search-745\.css/);
  assert.match(readFrontendStyles(), /\[data-theme="light"\] \.ps745-viz/);
  assert.match(readFrontendStyles(), /\.ps745-grid-scroll \{[^}]*overflow-x: auto/);
});
