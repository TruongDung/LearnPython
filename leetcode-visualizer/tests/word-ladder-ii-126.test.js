const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const problem = require('../problems').SUPPORTED[126];

function normalize(paths) {
  return paths.map(pathItems => pathItems.join('>')).sort();
}

function differsByOne(first, second) {
  let differences = 0;
  for (let index = 0; index < first.length; index += 1) {
    if (first[index] !== second[index]) differences += 1;
  }
  return differences === 1;
}

function pathBfsOracle(beginWord, endWord, wordList) {
  const remaining = new Set(wordList);
  if (!remaining.has(endWord)) return [];
  let paths = [[beginWord]];

  while (paths.length > 0) {
    const nextPaths = [];
    const reachedThisLayer = new Set();
    const answers = [];
    for (const currentPath of paths) {
      const last = currentPath.at(-1);
      for (const candidate of remaining) {
        if (!differsByOne(last, candidate)) continue;
        const nextPath = [...currentPath, candidate];
        reachedThisLayer.add(candidate);
        if (candidate === endWord) answers.push(nextPath);
        else nextPaths.push(nextPath);
      }
    }
    if (answers.length > 0) return answers;
    for (const word of reachedThisLayer) remaining.delete(word);
    paths = nextPaths;
  }
  return [];
}

test('126 is registered as layered BFS plus parent-DAG backtracking', () => {
  assert.equal(problem.id, 126);
  assert.equal(problem.slug, 'word-ladder-ii');
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.debugMode, 'semantic');
  assert.ok(problem.tags.some(tag => tag.key === 'bfs'));
  assert.ok(problem.tags.some(tag => tag.key === 'backtracking'));
  assert.match(problem.code.join('\n'), /parents\[new_word\]\.add\(word\)/);
  assert.match(problem.code.join('\n'), /def dfs/);
});

test('126 matches the official examples', () => {
  const built = problem.builder('hot,dot,dog,lot,log,cog', {
    beginWord: 'hit',
    endWord: 'cog',
  });
  assert.deepEqual(normalize(built.answer), normalize([
    ['hit', 'hot', 'dot', 'dog', 'cog'],
    ['hit', 'hot', 'lot', 'log', 'cog'],
  ]));
  assert.equal(built.steps.at(-1).final, true);

  const missing = problem.builder('hot,dot,dog,lot,log', {
    beginWord: 'hit',
    endWord: 'cog',
  });
  assert.deepEqual(missing.answer, []);
  assert.equal(missing.steps[0].wordLadder126View.operation, 'missing-end');
  assert.equal(missing.steps[0].final, true);
});

test('126 agrees with an independent full-path BFS oracle', () => {
  const universe = [];
  for (const first of 'abc') {
    for (const second of 'abc') {
      for (const third of 'abc') universe.push(first + second + third);
    }
  }
  const candidates = universe.filter(word => word !== 'aaa' && word !== 'ccc');
  let seed = 126;
  const random = max => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };

  for (let caseIndex = 0; caseIndex < 80; caseIndex += 1) {
    const shuffled = [...candidates];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const target = random(index + 1);
      [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
    }
    const wordList = [...shuffled.slice(0, 5 + random(6)), 'ccc'];
    const expected = pathBfsOracle('aaa', 'ccc', wordList);
    const actual = problem.builder(wordList.join(','), {
      beginWord: 'aaa',
      endWord: 'ccc',
    }).answer;
    assert.deepEqual(normalize(actual), normalize(expected), JSON.stringify(wordList));
  }
});

test('126 trace clearly separates BFS, multiple parents, DFS, and answers', () => {
  const built = problem.builder(problem.defaultInput, {
    beginWord: 'hit',
    endWord: 'cog',
  });
  const operations = new Set(built.steps.map(step => step.wordLadder126View.operation));
  for (const operation of [
    'init', 'layer-check', 'remove-layer', 'next-layer', 'scan-word',
    'candidate', 'discover', 'add-parent', 'found-end', 'finish-layer',
    'dfs-start', 'dfs-enter', 'choose-parent', 'emit-path', 'backtrack', 'done',
  ]) {
    assert.ok(operations.has(operation), operation);
  }
  assert.ok(built.steps.every(step => step.codeLines.length === 1));
  assert.ok(built.steps.every(step => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));

  const secondParent = built.steps.find(step => step.wordLadder126View.operation === 'add-parent');
  assert.ok(secondParent);
  const child = secondParent.wordLadder126View.candidateWord;
  assert.equal(secondParent.wordLadder126View.parents[child].length, 2);

  const finalView = built.steps.at(-1).wordLadder126View;
  assert.equal(finalView.answers.length, 2);
  assert.equal(finalView.levels.cog, 4);
});

test('126 validates dictionary size and word shape consistently', () => {
  assert.throws(
    () => problem.builder('hot,COG', { beginWord: 'hit', endWord: 'cog' }),
    /lowercase letters/,
  );
  assert.throws(
    () => problem.builder('hot,dots,cog', { beginWord: 'hit', endWord: 'cog' }),
    /same length/,
  );
  assert.throws(
    () => problem.builder(Array.from({ length: 13 }, (_, index) => `a${String.fromCharCode(97 + index)}a`).join(','), { beginWord: 'aaa', endWord: 'aba' }),
    /1 to 12/,
  );
  assert.throws(
    () => problem.builder('hit', { beginWord: 'hit', endWord: 'hit' }),
    /must be different/,
  );
});

test('126 displayed Python, live args, and solution file agree', () => {
  assert.deepEqual(
    problem.liveArgs('hot,dot,dog,lot,log,cog', { beginWord: 'hit', endWord: 'cog' }),
    ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']],
  );
  const assertions = [
    "paths = Solution().findLadders('hit', 'cog', ['hot','dot','dog','lot','log','cog'])",
    "assert sorted(paths) == sorted([['hit','hot','dot','dog','cog'], ['hit','hot','lot','log','cog']])",
    "assert Solution().findLadders('hit', 'cog', ['hot','dot']) == []",
  ].join('\n');
  const displayed = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = path.resolve(__dirname, '../../Leetcode-sln/graph/Leetcode_126.py');
  const solution = spawnSync('python3', [solutionPath], { encoding: 'utf8' });
  assert.equal(solution.status, 0, solution.stderr);
});

test('126 custom renderer handles every state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderWordLadder126View(step)');
  const end = source.indexOf('\nfunction renderHouseRobberView(step)', start);
  assert.ok(start >= 0 && end > start);

  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value),
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);

  const traces = [
    problem.builder(problem.defaultInput, { beginWord: 'hit', endWord: 'cog' }).steps,
    problem.builder('hot,dot,dog', { beginWord: 'hit', endWord: 'cog' }).steps,
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const trace of traces) {
      for (const step of trace) {
        context.renderWordLadder126View(step);
        assert.match(element.innerHTML, /wl126-viz/);
        assert.match(element.innerHTML, /PARENT DAG/);
        assert.match(element.innerHTML, /SHORTEST PATHS FOUND|ĐƯỜNG NGẮN NHẤT ĐÃ TÌM/);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
      }
    }
  }
});

test('126 includes scoped responsive styles for every teaching state', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.wl126-viz/);
  assert.match(css, /\.wl126-node\.is-frontier/);
  assert.match(css, /\.wl126-node\.is-path/);
  assert.match(css, /\.wl126-transform/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
