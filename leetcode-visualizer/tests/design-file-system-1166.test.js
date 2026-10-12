const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');
const { prepareDesignLiveRun } = require('../live-args');
const { readFrontendIndex, readFrontendJavaScript, JAVASCRIPT_ASSETS, STYLESHEET_ASSETS } = require('./helpers/frontend-source');
const problem = SUPPORTED[1166];

function oracle(operations) {
  const values = new Map();
  return operations.map(([name, path, value]) => {
    if (name === 'get') return values.get(path) ?? -1;
    const parent = path.slice(0, path.lastIndexOf('/'));
    if (!path || path === '/' || values.has(path) || parent && !values.has(parent)) return false;
    values.set(path, value);
    return true;
  });
}

test('1166 handles the examples, missing parents, duplicates, and absent paths', () => {
  assert.deepEqual(problem.builder('create(/a,1);get(/a)').answer, [true, 1]);
  assert.deepEqual(problem.builder('createPath("/leet",1);createPath("/leet/code",2);get("/leet/code");createPath("/c/d",1);get("/c")').answer, [true, true, 2, false, -1]);
  assert.deepEqual(problem.builder(problem.defaultInput).answer, [true, true, 2, false, false, -1]);
  const run = problem.builder([['createPath', '/a/b', 8], ['get', '/a'], ['createPath', '/a', 3], ['createPath', '/a/b', 8], ['createPath', '/a/b', 9], ['get', '/a/b']]);
  assert.deepEqual(run.answer, [false, -1, true, true, false, 8]);
  assert.equal(run.steps.at(-1).fileSystem1166View.nodes.find((node) => node.path === '/a/b').value, 8);
});

test('1166 walks exact path segments and never auto-creates missing ancestors', () => {
  const operations = [['createPath', '/a', 1], ['createPath', '/ab/c', 2], ['createPath', '/constructor', 3], ['createPath', '/constructor/prototype', 4], ['get', '/constructor/prototype'], ['createPath', '/', 1], ['createPath', '', 1], ['get', '/'], ['get', '']];
  const run = problem.builder(operations);
  assert.deepEqual(run.answer, oracle(operations));
  assert.deepEqual(run.answer, [true, false, true, true, 4, false, false, -1, -1]);
  assert.ok(!run.steps.at(-1).fileSystem1166View.nodes.some((node) => node.path === '/ab'));
});

test('1166 agrees with an independent hash-map oracle across deterministic operation streams', () => {
  let seed = 1166;
  const paths = ['/a', '/b', '/a/c', '/a/d', '/b/c', '/a/c/e', '/missing/x'];
  for (let sample = 0; sample < 25; sample++) {
    const operations = [];
    for (let index = 0; index < 60; index++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const path = paths[(seed >>> 3) % paths.length];
      operations.push(seed % 3 ? ['createPath', path, 1 + (seed >>> 12) % 1000] : ['get', path]);
    }
    assert.deepEqual(problem.builder(JSON.stringify(operations)).answer, oracle(operations));
  }
});

test('1166 snapshots isolate old states, highlight traversal, and preserve failed calls', () => {
  const run = problem.builder(problem.defaultInput);
  const reasons = new Set(run.steps.map((step) => step.fileSystem1166View.reason));
  assert.ok(reasons.has('exists'));
  assert.ok(reasons.has('missing-parent'));
  assert.ok(reasons.has('missing-path'));
  let previousNodes;
  for (const step of run.steps) {
    const view = step.fileSystem1166View;
    assert.ok(step.codeLines.every((line) => problem.code[line - 1]?.trim()));
    if (previousNodes && ['rejected', 'not-found', 'found'].includes(view.phase)) assert.deepEqual(view.nodes, previousNodes);
    assert.ok(view.visited.every((path) => view.nodes.some((node) => node.path === path)));
    previousNodes = view.nodes;
  }
  assert.deepEqual(run.steps[0].fileSystem1166View.nodes, [{ path: '/', parent: null, name: '/', value: null, depth: 0 }]);
  assert.equal(run.steps.at(-1).final, true);
  assert.deepEqual(run.steps.at(-1).fileSystem1166View.answer, run.answer);
});

test('1166 rejects malformed input instead of silently dropping commands', () => {
  for (const input of ['', '[', 'oops()', 'create(/a)', 'get(/a,1)', 'create(/a,-1)', 'create(/a,0)', 'create(/a,1000000001)', 'create(/a,1.5)', 'create(/a,NaN)', 'create(/a/,1)', 'get(/a//b)', [['createPath', 'relative', 1]], [['get', null]], [['delete', '/a']], [['createPath', '/a', true]], [['get', '/' + 'a'.repeat(100)]], Array.from({ length: 10001 }, () => ['get', '/a'])]) {
    assert.throws(() => problem.builder(input), /#1166/);
  }
});

test('1166 caps the trace while preserving all 10000 outputs', () => {
  const operations = Array.from({ length: 10000 }, (_, index) => index === 0 ? ['createPath', '/a', 1000000000] : ['get', '/a']);
  const run = problem.builder(operations);
  assert.equal(run.answer.length, 10000);
  assert.equal(run.answer[0], true);
  assert.equal(run.answer.at(-1), 1000000000);
  assert.equal(run.steps.length, 220);
  assert.ok(run.steps.at(-1).fileSystem1166View.omittedSteps > 0);
  assert.equal(run.steps.at(-1).fileSystem1166View.outputs.length, 10000);
});

test('1166 Python code and Edit & Run agree for compact and JSON input', () => {
  const cases = [problem.defaultInput, [['createPath', '/a', 1], ['createPath', '/a/b', 1000000000], ['get', '/a/b'], ['createPath', '/a', 2], ['createPath', '', 1], ['get', '']]];
  for (const input of cases) {
    const config = prepareDesignLiveRun(problem, input, {});
    assert.equal(config.className, 'FileSystem');
    assert.deepEqual(config.constructorArgs, []);
    const source = `${problem.code.join('\n')}\nimport json, sys\ncase = json.loads(sys.stdin.read())\nfs = FileSystem()\nactual = [getattr(fs, op['name'])(*op['args']) for op in case['config']['operations']]\nassert actual == case['expected'], (actual, case['expected'])`;
    const execution = spawnSync('python3', ['-c', source], { input: JSON.stringify({ config, expected: problem.builder(input).answer }), encoding: 'utf8' });
    assert.equal(execution.status, 0, execution.stderr);
  }
});

test('1166 dedicated renderer shows creation, missing folders, and values in both languages', () => {
  const source = fs.readFileSync(require.resolve('../public/renderer-design-file-system-1166.js'), 'utf8');
  const element = { innerHTML: '' };
  const context = { lang: 'en', $: () => element, escapeHtml: (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;') };
  vm.createContext(context);
  vm.runInContext(source, context);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of problem.builder(problem.defaultInput).steps) {
      context.renderFileSystem1166View(step);
      assert.match(element.innerHTML, /fs1166-tree/);
      assert.match(element.innerHTML, /<svg/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|object Object/);
      if (step.fileSystem1166View.phase === 'start') assert.match(element.innerHTML, /<output class="ok">—<\/output>/);
      if (step.fileSystem1166View.phase === 'created') assert.match(element.innerHTML, /fs1166-node [^"]*added/);
      if (step.fileSystem1166View.reason === 'missing-parent') assert.match(element.innerHTML, /fs1166-node [^"]*missing/);
      if (step.fileSystem1166View.phase === 'found') assert.match(element.innerHTML, /<b>2<\/b>/);
    }
  }
});

test('1166 is wired into the lazy asset pipeline and design catalog', () => {
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.ok(problem.tags.some((tag) => tag.key === 'design'));
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-design-file-system-1166.js'));
  assert.ok(STYLESHEET_ASSETS.includes('design-file-system-1166.css'));
  assert.match(readFrontendJavaScript(), /renderFileSystem1166View\(step\)/);
  const active = readFrontendIndex().replace(/<template[\s\S]*?<\/template>/g, '');
  assert.doesNotMatch(active, /(?:renderer-)?design-file-system-1166\.(?:js|css)/);
});
