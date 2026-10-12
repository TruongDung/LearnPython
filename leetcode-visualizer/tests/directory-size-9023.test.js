const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { extractLiveMethod } = require('../live-args');
const { readFrontendIndex, readFrontendJavaScript, JAVASCRIPT_ASSETS, STYLESHEET_ASSETS } = require('./helpers/frontend-source');
const problem = SUPPORTED[9023];
const snapshot = step => step.directorySize9023View;

function oracle({ files, queries }) {
  return queries.map(query => {
    const target = query.replace(/\/+$/, '').slice(5).split('/');
    return files.reduce((total, [size, path]) => {
      const parts = path.slice(5).split('/');
      return total + (target.every((part, i) => parts[i] === part) ? size : 0);
    }, 0);
  });
}

test('9023 both methods return sample totals, file sizes, bucket sums and zero for misses', () => {
  const sample = JSON.parse(problem.defaultInput);
  assert.deepEqual(sample.files.map(([size]) => size), [2400, 800, 350]);
  assert.deepEqual(sample.queries, ['gs://acme-assets.example.com/training', 'gs://acme-assets.example.com/podcasts/welcome.mp3', 'gs://acme-assets.example.com', 'gs://acme-assets.example.com/unavailable']);
  assert.doesNotMatch(problem.defaultInput, /bucket\.storage\.google\.com|\/video\b|\/music\b/);
  for (const builder of [problem.builder, problem.builder2]) {
    const run = builder(problem.defaultInput);
    assert.deepEqual(run.answer, [3200, 350, 3550, 0]);
    assert.deepEqual(snapshot(run.steps.at(-1)).answers, run.answer);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('9023 respects whole path segments, nested directories, bucket boundaries, trailing slashes and zero sizes', () => {
  const input = { files: [[1000, 'gs://b/video/movie.mkv'], [500, 'gs://b/video/deep/short.mp4'], [7, 'gs://b/video2/other.mp4'], [0, 'gs://b/empty.txt'], [90, 'gs://bb/video/movie.mkv']], queries: ['gs://b/video', 'gs://b/video///', 'gs://b/video/movie.mkv', 'gs://b/video/deep', 'gs://b', 'gs://bb', 'gs://b/empty.txt', 'gs://b/vid'] };
  const before = JSON.stringify(input);
  for (const builder of [problem.builder, problem.builder2]) assert.deepEqual(builder(input).answer, [1500, 1500, 1000, 500, 1507, 90, 0, 0]);
  assert.equal(JSON.stringify(input), before);
  for (const builder of [problem.builder, problem.builder2]) assert.deepEqual(builder({ files: [], queries: ['gs://b'] }).answer, [0]);
});

test('9023 deterministic cases match a segment-based independent oracle', () => {
  let seed = 9023;
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  for (let i = 0; i < 60; i++) {
    const input = { files: Array.from({ length: next() % 13 }, (_, index) => [next() % 10000, `gs://bucket${next() % 2}/dir${next() % 3}/f${index}.txt`]), queries: ['gs://bucket0', 'gs://bucket1', 'gs://bucket0/dir0', 'gs://bucket1/dir1', 'gs://bucket', 'gs://bucket0/dir', 'gs://bucket0/missing'] };
    for (const builder of [problem.builder, problem.builder2]) assert.deepEqual(builder(input).answer, oracle(input));
  }
});

test('9023 trace preserves old sums, accumulates ancestors and reads the cached total', () => {
  const run = problem.builder2(problem.defaultInput);
  const initial = snapshot(run.steps[0]);
  assert.deepEqual(initial.nodes.map(node => node.total), [0]);
  const built = snapshot(run.steps.findLast(step => snapshot(step).phase === 'build'));
  const sums = new Map(built.nodes.map(node => [node.path, node.total]));
  assert.equal(sums.get('gs://acme-assets.example.com/training'), 3200);
  assert.equal(sums.get('gs://acme-assets.example.com'), 3550);
  for (const step of run.steps) {
    assert.equal(step.codeBlock, 2);
    assert.ok(step.codeLines.every(line => problem.code2[line - 1]?.trim()));
    const frame = snapshot(step);
    assert.ok(frame.visited.every(path => frame.nodes.some(node => node.path === path)));
    if (frame.phase === 'result' && !frame.missing) assert.equal(frame.total, frame.nodes.find(node => node.path === frame.current).total);
  }
  const missing = snapshot(run.steps.find(step => snapshot(step).missing));
  assert.equal(missing.total, 0);
  assert.ok(!missing.nodes.some(node => node.path === missing.missing));
  const scan = problem.builder(problem.defaultInput);
  const added = scan.steps.filter(step => snapshot(step).phase === 'add' && snapshot(step).queryIndex === 0);
  assert.deepEqual(added.map(step => snapshot(step).total), [2400, 3200]);
  assert.deepEqual(snapshot(added[0]).matched, [0]);
});

test('9023 rejects ambiguous, duplicate or noncanonical files and oversized input', () => {
  const bad = [null, [], '{', {}, { files: [], queries: [] }, { files: [[-1, 'gs://b/a']], queries: ['gs://b'] }, { files: [[1.5, 'gs://b/a']], queries: ['gs://b'] }, { files: [[1, 'gs://b/a'], [2, 'gs://b/a']], queries: ['gs://b'] }, { files: [[1, 'gs://b/a'], [2, 'gs://b/a/b']], queries: ['gs://b'] }, { files: [[1, 'gs://b/a/']], queries: ['gs://b'] }, { files: [[1, 'gs://b']], queries: ['gs://b'] }, { files: [[1, 'gs://b/../a']], queries: ['gs://b'] }, { files: [], queries: ['gs://'] }, { files: [], queries: ['gs://b//a'] }, { files: [], queries: [null] }, { files: Array.from({ length: 13 }, (_, i) => [1, `gs://b/f${i}`]), queries: ['gs://b'] }, { files: [], queries: Array(9).fill('gs://b') }];
  for (const input of bad) for (const builder of [problem.builder, problem.builder2]) assert.throws(() => builder(input), /9023:/);
});

test('9023 both displayed Python APIs and Edit & Run arguments match the visualizer', () => {
  const cases = [JSON.parse(problem.defaultInput), { files: [[0, 'gs://b/zero'], [1000000000000, 'gs://b/video/f'], [5, 'gs://b/video2/g'], [10, 'gs://bb/video/f']], queries: ['gs://b/video/', 'gs://b/zero', 'gs://b', 'gs://b/missing', 'gs://bb'] }, { files: [], queries: ['gs://b'] }];
  for (const method of [1, 2]) {
    const source = `${(method === 1 ? problem.code : problem.code2).join('\n')}\nimport json, sys\nfor case in json.load(sys.stdin):\n    actual = Solution().calculateSizes(case['files'], case['queries'])\n    assert actual == case['expected'], (actual, case['expected'])\n    index = FileSizeIndex(case['files'])\n    assert [index.calculate_size(q) for q in case['queries']] == actual`;
    const execution = spawnSync('python3', ['-c', source], { encoding: 'utf8', input: JSON.stringify(cases.map(input => ({ ...input, expected: oracle(input) }))) });
    assert.equal(execution.status, 0, execution.stderr);
    for (const input of cases) {
      assert.deepEqual(problem.liveArgs(input), [input.files, input.queries]);
      assert.deepEqual(extractLiveMethod(problem, method), { name: 'calculateSizes', params: ['files', 'queries'] });
    }
  }
});

test('9023 renderer shows scan addition, cached values, and missing branches in both languages', () => {
  const host = { innerHTML: '' };
  const context = { lang: 'en', $: () => host, escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-directory-size-9023.js'), 'utf8'), context);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const builder of [problem.builder, problem.builder2]) for (const step of builder(problem.defaultInput).steps) {
      context.renderDirectorySize9023View(step);
      assert.match(host.innerHTML, /ds9023-tree/);
      assert.match(host.innerHTML, /<svg/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|object Object/);
      if (snapshot(step).method === 1 && snapshot(step).phase === 'add') assert.match(host.innerHTML, /ds9023-equation/);
      if (snapshot(step).missing) assert.match(host.innerHTML, /× → 0/);
    }
  }
});

test('9023 is registered as a custom interview problem with two lazy visualizations', () => {
  assert.deepEqual(problem.title, { vi: 'Directory / File Size', en: 'Directory / File Size' });
  assert.equal(problem.category.key, 'interview');
  assert.equal(problem.slug, null); // A screenshot interview problem, not a LeetCode URL.
  assert.equal(problem.extraParams[0].options.length, 2);
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-directory-size-9023.js'));
  assert.ok(STYLESHEET_ASSETS.includes('directory-size-9023.css'));
  assert.match(readFrontendJavaScript(), /renderDirectorySize9023View\(step\)/);
  const active = readFrontendIndex().replace(/<template[\s\S]*?<\/template>/g, '');
  assert.doesNotMatch(active, /(?:renderer-)?directory-size-9023\.(?:js|css)/);
});
