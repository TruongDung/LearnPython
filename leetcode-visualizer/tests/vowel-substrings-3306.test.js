const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { readFrontendJavaScript, readFrontendStyles, readFrontendIndex } = require('./helpers/frontend-source');
const problem = SUPPORTED[3306];
const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
const examples = [
  ['aeioqq', 1, 0], ['aeiou', 0, 1], ['ieaouqqieaouqq', 1, 3],
  ['aeiouaeiou', 0, 21], ['aaeioub', 1, 2], ['baeiou', 1, 1],
  ['bbbaeiouccc', 3, 4], ['bcdfgh', 0, 0], ['aeioua', 1, 0],
  ['bbaeiouc', 3, 1], ['aeioubbb', 0, 1],
];

function oracle(word, k) {
  const perRight = [Array(word.length).fill(0), Array(word.length).fill(0)];
  const exact = [];
  for (let start = 0; start < word.length; start++) {
    const vowels = new Set(); let consonants = 0;
    for (let end = start; end < word.length; end++) {
      if ('aeiou'.includes(word[end])) vowels.add(word[end]); else consonants++;
      if (vowels.size !== 5) continue;
      if (consonants >= k) perRight[0][end]++;
      if (consonants >= k + 1) perRight[1][end]++;
      if (consonants === k) exact.push([start, end]);
    }
  }
  return { answer: exact.length, perRight, exact, totals: perRight.map(row => row.reduce((sum, count) => sum + count, 0)) };
}

test('3306 validates lowercase words and k, discloses visualization bounds and exposes live args', () => {
  assert.equal(problem.category.key, 'sliding');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.deepEqual(problem.liveArgs('aeiou', { k: '0' }), ['aeiou', 0]);
  for (const word of ['', 'aeio', 'Aeiou', 'aeio1', 'aei ou', 'a'.repeat(81), 123, []]) assert.throws(() => problem.builder(word, { k: 0 }));
  for (const k of [-1, 1, 0.5, NaN, Infinity, true, null, undefined, '', 'oops', '1.2', [], {}]) assert.throws(() => problem.liveArgs('aeiou', { k }));
  assert.throws(() => problem.builder('aeiou', null));
  assert.equal(problem.builder('aeiou' + 'b'.repeat(75), { k: 75 }).answer, 1);
});

test('3306 handles official examples, k=0, repeated vowels and consonants at either end', () => {
  for (const [word, k, expected] of examples) {
    const run = problem.builder(word, { k });
    const brute = oracle(word, k);
    assert.equal(brute.answer, expected, JSON.stringify([word, k]));
    assert.equal(run.answer, expected, JSON.stringify([word, k]));
    assert.equal(run.steps.filter(step => step.final).length, 1);
    assert.deepEqual(run.steps.at(-1).vowelSubstrings3306View.totals, brute.totals);
    assert.deepEqual(run.steps.at(-1).vowelSubstrings3306View.perRight, brute.perRight);
  }
});

test('3306 agrees with quadratic enumeration for vowel permutations, inserted consonants and seeded random words', () => {
  const words = new Set();
  function permute(prefix, remaining) {
    if (!remaining.length) {
      for (const word of [prefix, 'b' + prefix, prefix + 'b', 'b' + prefix + 'b']) words.add(word);
      return;
    }
    for (let index = 0; index < remaining.length; index++) permute(prefix + remaining[index], remaining.slice(0, index) + remaining.slice(index + 1));
  }
  permute('', 'aeiou');
  let seed = 3306;
  const random = max => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % max; };
  for (let trial = 0; trial < 300; trial++) {
    let word = '';
    const length = 5 + random(14);
    for (let index = 0; index < length; index++) word += 'aeioubc'[random(7)];
    words.add(word);
  }
  for (const word of words) for (let k = 0; k <= Math.min(word.length - 5, 3); k++) {
    const run = problem.builder(word, { k }); const brute = oracle(word, k);
    assert.equal(run.answer, brute.answer, JSON.stringify([word, k]));
    assert.deepEqual(run.steps.at(-1).vowelSubstrings3306View.perRight, brute.perRight);
  }
});

test('3306 counts all and only starts before left after shrinking, removes zero keys, and preserves transient states', () => {
  for (const [word, k] of examples) {
    const run = problem.builder(word, { k });
    run.steps.forEach((step, index) => {
      const view = step.vowelSubstrings3306View;
      assert.equal(view.source, problem.code[view.line - 1]);
      assert.equal(view.nextLine, run.steps[index + 1]?.codeLines[0] ?? null);
      if (view.event.startsWith('remove-')) {
        assert.equal(view.removedPending, true);
        assert.equal(view.guard, null);
      }
      if (view.event === 'move-left') {
        assert.equal(view.removedPending, false);
        assert.equal(view.nextLine, 14);
      }
      if (view.event === 'while-stop') assert.equal(view.nextLine, 23);
      if (view.event === 'count') {
        assert.equal(view.addition, view.left);
        assert.ok(Object.values(view.freq).every(count => count > 0));
        for (let start = 0; start <= view.right; start++) {
          const substring = word.slice(start, view.right + 1);
          const present = [...'aeiou'].every(vowel => substring.includes(vowel));
          const consonants = [...substring].filter(char => !'aeiou'.includes(char)).length;
          assert.equal(present && consonants >= view.minimum, start < view.left, JSON.stringify([word, k, view.pass, view.right, start]));
        }
        const window = word.slice(view.left, view.right + 1);
        assert.equal(view.consonants, [...window].filter(char => !'aeiou'.includes(char)).length);
        for (const vowel of 'aeiou') assert.equal(view.freq[vowel] ?? 0, [...window].filter(char => char === vowel).length);
      }
    });
  }
  const repeated = problem.builder('aaeioub', { k: 1 }).steps;
  assert.ok(repeated.some(step => step.vowelSubstrings3306View.event === 'remove-vowel' && step.vowelSubstrings3306View.freq.a === 1));
  assert.ok(repeated.some(step => step.vowelSubstrings3306View.event === 'remove-vowel' && step.vowelSubstrings3306View.freq.a === 0));
  assert.ok(repeated.some(step => step.vowelSubstrings3306View.event === 'delete-vowel' && !Object.hasOwn(step.vowelSubstrings3306View.freq, 'a')));
});

test('3306 each code line and before/after locals match Python; official maximum length supports large answers', () => {
  const cases = [...examples, ['aeiou'.repeat(16), 0, 2926]];
  const source = `import json, sys, copy
namespace = {}
exec(compile(${JSON.stringify(problem.code.join('\n'))}, 'vowels3306.py', 'exec'), namespace)
results = []
for word, k, expected in json.load(sys.stdin):
    records = []
    pending = None
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_filename != 'vowels3306.py' or frame.f_code.co_name != 'countOfSubstrings':
            return trace
        if event in ('line', 'return'):
            if pending is not None:
                records.append({'line':pending, 'locals':copy.deepcopy({key:value for key,value in frame.f_locals.items() if key != 'self'})})
            pending = frame.f_lineno if event == 'line' else None
        return trace
    sys.settrace(trace)
    answer = namespace['Solution']().countOfSubstrings(word, k)
    sys.settrace(None)
    results.append({'answer':answer, 'records':records})
assert namespace['Solution']().countOfSubstrings('aeiou' * 40000, 0) == 19999300006
print(json.dumps(results))
`;
  const executed = spawnSync(python, ['-c', source], { encoding: 'utf8', input: JSON.stringify(cases), maxBuffer: 12 * 1024 * 1024 });
  assert.equal(executed.status, 0, executed.stderr);
  const results = JSON.parse(executed.stdout);
  cases.forEach(([word, k], index) => {
    const run = problem.builder(word, { k }); const actual = results[index];
    assert.equal(run.answer, actual.answer);
    assert.equal(run.steps.length, actual.records.length);
    run.steps.forEach((step, i) => {
      assert.equal(step.codeLines[0], actual.records[i].line);
      assert.deepEqual(Object.fromEntries(step.vars.map(v => [v.name, v.value])), actual.records[i].locals);
      assert.deepEqual(Object.fromEntries(step.vowelSubstrings3306View.beforeVars.map(v => [v.name, v.value])), i === 0 ? { word, k } : actual.records[i - 1].locals);
    });
  });
});

test('3306 renderer shows both thresholds, counts by right, transient removals and exact witnesses in VI/EN', () => {
  const element = { querySelector: () => null };
  const context = { lang: 'vi', $: () => element, escapeHtml: String };
  context.pick = value => value[context.lang];
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'public', 'renderer-vowel-substrings-3306.js'), 'utf8'), context);
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const [word, k] of examples) for (const step of problem.builder(word, { k }).steps) {
      context.renderVowelSubstrings3306View(step);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
      assert.match(element.innerHTML, /vs3306-debug/);
      assert.equal((element.innerHTML.match(/data-right=/g) || []).length, word.length);
      if (step.vowelSubstrings3306View.removedPending) assert.match(element.innerHTML, /vs3306-pending/);
      if (step.final) assert.match(element.innerHTML, /vs3306-result/);
    }
  }
  const run = problem.builder('ieaouqqieaouqq', { k: 1 });
  context.renderVowelSubstrings3306View(run.steps.at(-1));
  for (const [start, end] of [[0, 5], [6, 11], [7, 12]]) assert.ok(element.innerHTML.includes(`[${start},${end}]`));
});

test('3306 frontend loads the dedicated renderer, scrolls both axes and supports light/mobile styles', () => {
  const registry = readFrontendJavaScript().split('const ORDERED_RENDERER_REGISTRY')[1];
  assert.ok(registry.indexOf('step.vowelSubstrings3306View') < registry.indexOf('step.hardProblemView'));
  assert.match(readFrontendIndex(), /renderer-vowel-substrings-3306\.js/);
  assert.match(readFrontendIndex(), /vowel-substrings-3306\.css/);
  assert.match(readFrontendStyles(), /\[data-theme="light"\] \.vs3306-viz/);
  assert.match(readFrontendStyles(), /\.vs3306-strip \{[^}]*overflow-x: auto/);
  assert.match(readFrontendStyles(), /\.vs3306-table \{[^}]*overflow-x: auto/);
});
