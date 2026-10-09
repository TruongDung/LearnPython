const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { prepareDesignLiveRun } = require('../live-args');
const { readFrontendJavaScript, readFrontendStyles, readFrontendIndex } = require('./helpers/frontend-source');
const problem = SUPPORTED[745];
const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
const brute = (words, pref, suff) => words.reduce((best, word, index) => word.startsWith(pref) && word.endsWith(suff) ? index : best, -1);

test('745 approach 2 registers Trie code and uses the same validation and live WordFilter operations', () => {
  assert.ok(problem.tags.some(tag => tag.key === 'trie'));
  assert.equal(problem.extraParams.find(param => param.key === 'approach').options.length, 3);
  assert.match(problem.code2.join('\n'), /word\[:p\] \+ '\{' \+ word\[::-1\]/);
  assert.deepEqual(prepareDesignLiveRun(problem, ['apple'], { queries: '[["a","e"]]', approach: 2 }, 2), {
    className: 'WordFilter', constructorArgs: [['apple']], operations: [{ name: 'f', args: ['a', 'e'] }],
  });
  for (const bad of [[], [''], ['Apple'], ['abcdefgh'], Array(11).fill('a')]) assert.throws(() => problem.builder2(bad, { queries: [['a', 'a']] }));
  for (const queries of ['', 'bad', [], [['', 'a']], [['a', '']], [['A', 'e']], [['abcdefgh', 'a']], [['a']], Array(13).fill(['a', 'a'])]) assert.throws(() => problem.builder2(['a'], { queries }));
});

test('745 corrected Trie handles short prefixes, short suffixes, overlap, duplicates and absent edges', () => {
  const words = ['apple', 'apply', 'apple'];
  const queries = [['a', 'e'], ['app', 'ly'], ['x', 'e'], ['apple', 'apple'], ['appl', 'ple'], ['ap', 'y'], ['apple', 'z']];
  const run = problem.builder2(words, { queries });
  assert.deepEqual(run.answer, [null, 2, 1, -1, 2, 2, 1, -1]);
  assert.deepEqual(run.answer, problem.builder(words, { queries }).answer);
  assert.deepEqual(words, ['apple', 'apply', 'apple']);
  assert.equal(run.steps.filter(step => step.final).length, 1);
  assert.deepEqual(run.steps.at(-1).prefixSuffix745TrieView.outputs, run.answer);
  const originalWords = ['apple'];
  assert.deepEqual(problem.builder2(originalWords, { queries: [['a', 'e'], ['apple', 'e'], ['apple', 'apple']] }).answer, [null, 0, 0, 0]);
});

test('745 Trie outputs agree with scanning every small dictionary and prefix/suffix query', () => {
  const dictionary = ['a', 'b', 'aa', 'ab', 'ba', 'bb'];
  const parts = [...dictionary, 'aaa'];
  const queries = parts.flatMap(pref => parts.map(suff => [pref, suff]));
  for (const first of dictionary) for (const second of dictionary) {
    const words = [first, second];
    for (let offset = 0; offset < queries.length; offset += 12) {
      const batch = queries.slice(offset, offset + 12);
      assert.deepEqual(problem.builder2(words, { queries: batch }).answer, [null, ...batch.map(([pref, suff]) => brute(words, pref, suff))]);
    }
  }
});

test('745 Trie snapshots distinguish creation, pointer movement and index writes, and retain largest indices', () => {
  const run = problem.builder2(['aa', 'aa'], { queries: [['a', 'a'], ['aa', 'aa'], ['b', 'a']] });
  run.steps.forEach((step, index) => {
    const view = step.prefixSuffix745TrieView;
    assert.equal(step.codeBlock, 2);
    assert.equal(view.source, problem.code2[view.line - 1]);
    assert.equal(view.nextLine, run.steps[index + 1]?.codeLines[0] ?? null);
    assert.ok(view.recent.length <= 6);
    if (view.event === 'create-node') {
      assert.equal(view.created.index, -1);
      assert.notEqual(view.cursor, view.created.id);
      assert.ok(view.children.some(child => child.id === view.created.id));
      const next = run.steps[index + 1].prefixSuffix745TrieView;
      assert.equal(next.event, 'move-node');
      assert.equal(next.cursor, view.created.id);
      assert.equal(next.path.at(-1).index, -1);
      assert.equal(run.steps[index + 2].prefixSuffix745TrieView.path.at(-1).index, view.wordIndex);
    }
    if (view.event === 'query-check' && !view.exists) assert.equal(view.nextLine, 24);
    if (view.event === 'query-end') assert.equal(view.nextLine, 26);
  });
  const last = run.steps.at(-1).prefixSuffix745TrieView;
  assert.equal(last.path[0].index, 1);
  assert.equal(last.query.result, -1);
  const found = run.steps.find(step => step.prefixSuffix745TrieView.event === 'query-return' && step.prefixSuffix745TrieView.query.index === 0).prefixSuffix745TrieView;
  assert.equal(found.path.at(-1).index, 1);
  assert.ok(found.children.length > 0, 'a successful short suffix query can stop at an internal node');
});

test('745 Trie WordFilter lines, locals, node state and counts match real Python execution', () => {
  const cases = [
    { words: ['apple'], queries: [['a', 'e'], ['apple', 'apple'], ['a', 'z']] },
    { words: ['aa', 'ab', 'aa'], queries: [['a', 'a'], ['a', 'b'], ['b', 'b']] },
    { words: ['abab', 'ab'], queries: [['aba', 'bab'], ['ab', 'ab']] },
    { words: Array(10).fill('abcdefg'), queries: [['a', 'g'], ['abcdefg', 'abcdefg']] },
  ];
  const source = `import json, sys, copy
namespace = {}
exec(compile(${JSON.stringify(problem.code2.join('\n'))}, 'trie745.py', 'exec'), namespace)
results = []
for case in json.load(sys.stdin):
    records = []
    pending = None
    def find_path(root, target, prefix=''):
        if root is target:
            return prefix
        for ch, child in root.children.items():
            found = find_path(child, target, prefix+ch)
            if found is not None:
                return found
        return None
    def node_count(root):
        return 1 + sum(node_count(child) for child in root.children.values())
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_filename != 'trie745.py' or frame.f_code.co_name not in ('__init__', 'f') or type(frame.f_locals.get('self')).__name__ != 'WordFilter':
            return trace
        if event in ('line', 'return'):
            if pending is not None:
                wf = frame.f_locals['self']
                values = {}
                for key, value in frame.f_locals.items():
                    if key == 'self':
                        continue
                    if key == 'node':
                        values[key] = {'path':find_path(wf.root, value), 'index':value.index, 'children':sorted(value.children)}
                    else:
                        values[key] = copy.deepcopy(value)
                records.append({'line':pending, 'locals':values, 'nodeCount':node_count(wf.root), 'rootIndex':wf.root.index})
            pending = frame.f_lineno if event == 'line' else None
        return trace
    sys.settrace(trace)
    wf = namespace['WordFilter'](case['words'])
    outputs = [None]
    for pref, suff in case['queries']:
        outputs.append(wf.f(pref,suff))
    sys.settrace(None)
    results.append({'outputs':outputs,'records':records})
# The single-path code originally supplied fails the official short-prefix example.
original = {}
broken = '''class TrieNode:
    def __init__(self):
        self.children = {}
        self.index = -1
class WordFilter:
    def __init__(self, words):
        self.root = TrieNode()
        for idx, word in enumerate(words):
            combined = word + '{' + word[::-1]
            node = self.root
            node.index = idx
            for ch in combined:
                if ch not in node.children:
                    node.children[ch] = TrieNode()
                node = node.children[ch]
                node.index = idx
    def f(self, pref, suff):
        node = self.root
        for ch in pref + '{' + suff[::-1]:
            if ch not in node.children:
                return -1
            node = node.children[ch]
        return node.index
'''
exec(broken, original)
assert original['WordFilter'](['apple']).f('a', 'e') == -1
assert namespace['WordFilter'](['apple']).f('a', 'e') == 0
print(json.dumps(results))
`;
  const executed = spawnSync(python, ['-c', source], { encoding: 'utf8', input: JSON.stringify(cases), maxBuffer: 16 * 1024 * 1024 });
  assert.equal(executed.status, 0, executed.stderr);
  const results = JSON.parse(executed.stdout);
  cases.forEach((entry, index) => {
    const run = problem.builder2(entry.words, { queries: entry.queries }); const actual = results[index];
    assert.deepEqual(run.answer, actual.outputs);
    assert.equal(run.steps.length, actual.records.length);
    run.steps.forEach((step, i) => {
      const record = actual.records[i]; const view = step.prefixSuffix745TrieView;
      assert.equal(step.codeLines[0], record.line);
      assert.deepEqual(Object.fromEntries(step.vars.map(v => [v.name, v.value])), record.locals);
      const before = view.line === 8 ? { words: entry.words } : view.line === 21 ? { pref: view.query.pref, suff: view.query.suff } : actual.records[i - 1].locals;
      assert.deepEqual(Object.fromEntries(view.beforeVars.map(v => [v.name, v.value])), before);
      assert.equal(view.nodeCount, record.nodeCount);
      assert.equal(view.path[0].index, record.rootIndex);
      const node = record.locals.node;
      if (node) {
        assert.equal(view.path.at(-1).path, node.path);
        assert.equal(view.path.at(-1).index, node.index);
        assert.deepEqual(view.children.map(child => child.ch), node.children);
      }
    });
  });
});

test('745 Trie renderer shows parent/child transitions, current path, results and the corrected insertion in VI/EN', () => {
  const element = { querySelector: () => null };
  const context = { lang: 'vi', $: () => element, escapeHtml: String };
  context.pick = value => value[context.lang];
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'public', 'renderer-prefix-suffix-trie-745.js'), 'utf8'), context);
  const run = problem.builder2(['apple', 'apply', 'apple'], { queries: [['a', 'e'], ['app', 'ly'], ['x', 'e']] });
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderPrefixSuffix745TrieView(step);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
      assert.match(element.innerHTML, /ps745-debug/);
      assert.match(element.innerHTML, /ps745-trie-correction/);
      assert.equal((element.innerHTML.match(/data-node=/g) || []).length, step.prefixSuffix745TrieView.path.length);
    }
  }
});

test('745 Trie frontend dispatches its renderer and loads styles with automatic path scrolling', () => {
  const registry = readFrontendJavaScript().split('const ORDERED_RENDERER_REGISTRY')[1];
  assert.ok(registry.indexOf('step.prefixSuffix745TrieView') < registry.indexOf('step.hardProblemView'));
  assert.match(readFrontendIndex(), /renderer-prefix-suffix-trie-745\.js/);
  assert.match(readFrontendIndex(), /prefix-suffix-trie-745\.css/);
  assert.match(readFrontendStyles(), /\.ps745-trie-input-scroll \{[^}]*overflow-x: auto/);
  assert.match(readFrontendStyles(), /\.ps745-trie-path-scroll \{[^}]*overflow-x: auto/);
});
