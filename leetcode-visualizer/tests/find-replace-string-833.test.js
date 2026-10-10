const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const { test } = require('node:test');

const problem = require('../problems').SUPPORTED[833];
const {
  JAVASCRIPT_ASSETS,
  STYLESHEET_ASSETS,
  readFrontendIndex,
  readFrontendJavaScript,
  readFrontendStyles,
} = require('./helpers/frontend-source');

function oracle(s, indices, sources, targets) {
  const replacements = indices.map((index, order) => ({ index, source: sources[order], target: targets[order] }))
    .filter((operation) => s.startsWith(operation.source, operation.index))
    .sort((left, right) => right.index - left.index);
  let result = s;
  for (const operation of replacements) {
    result = result.slice(0, operation.index) + operation.target + result.slice(operation.index + operation.source.length);
  }
  return result;
}

test('833 solves official examples and preserves original indices', () => {
  assert.equal(problem.builder('abcd', { indices: '0,2', sources: 'a,cd', targets: 'eee,ffff' }).answer, 'eeebffff');
  assert.equal(problem.builder('abcd', { indices: '0,2', sources: 'ab,ec', targets: 'eee,ffff' }).answer, 'eeecd');
  assert.equal(problem.builder('abcdxyz', { indices: '0,4', sources: 'ab,xyz', targets: 'long,q' }).answer, 'longcdq');
  assert.equal(problem.builder('a', { indices: '0', sources: 'a', targets: 'z' }).answer, 'z');
});

test('833 agrees with an independent reverse-application oracle', () => {
  const cases = [
    ['thequickbrownfox', [0, 3, 8, 13], ['the', 'quick', 'brown', 'fox'], ['a', 'slow', 'red', 'cat']],
    ['abcdefghij', [1, 4, 8], ['bc', 'xx', 'ij'], ['b', 'no', 'tail']],
    ['mississippi', [0, 4, 7], ['miss', 'iss', 'ippi'], ['m', 'x', 'end']],
    ['aaaaabbbbb', [0, 5], ['aaaaa', 'bbbbb'], ['x', 'yyyyyyy']],
  ];
  for (const [s, indices, sources, targets] of cases) {
    assert.equal(
      problem.builder(s, { indices, sources, targets }).answer,
      oracle(s, indices, sources, targets),
    );
  }
});

test('833 trace separates validation from output construction', () => {
  const run = problem.builder('abcd', { indices: '0,2', sources: 'ab,ec', targets: 'eee,ffff' });
  const statuses = run.steps.at(-1).findReplace833View.operations.map((operation) => operation.status);
  assert.deepEqual(statuses, ['accepted', 'rejected']);
  const accept = run.steps.find((step) => step.findReplace833View.phase === 'accept').findReplace833View;
  assert.equal(accept.preview, '');
  assert.equal(accept.operations[0].observed, 'ab');
  const final = run.steps.at(-1).findReplace833View;
  assert.deepEqual(final.chunks.map(({ kind, source, text }) => [kind, source, text]), [
    ['replace', 'ab', 'eee'],
    ['copy', 'c', 'c'],
    ['copy', 'd', 'd'],
  ]);
  assert.equal(final.answer, 'eeecd');
  assert.equal(run.steps.filter((step) => step.final).length, 1);
});

test('833 validates aligned lists, lowercase input, indices, and overlap', () => {
  assert.throws(() => problem.builder('', { indices: '0', sources: 'a', targets: 'b' }), /s phải/);
  assert.throws(() => problem.builder('Ab', { indices: '0', sources: 'a', targets: 'b' }), /s phải/);
  assert.throws(() => problem.builder('abc', { indices: '0,1', sources: 'a', targets: 'b' }), /cùng có/);
  assert.throws(() => problem.builder('abc', { indices: '0,0', sources: 'a,b', targets: 'x,y' }), /khác nhau/);
  assert.throws(() => problem.builder('abc', { indices: '3', sources: 'a', targets: 'b' }), /ngoài chuỗi/);
  assert.throws(() => problem.builder('abcd', { indices: '0,1', sources: 'abc,bc', targets: 'x,y' }), /chồng lấn/);
  assert.throws(() => problem.builder('abc', { indices: '0', sources: 'A', targets: 'b' }), /a-z/);
});

test('833 displayed Python agrees with the visualization', () => {
  const cases = [
    ['abcd', [0, 2], ['a', 'cd'], ['eee', 'ffff']],
    ['abcd', [0, 2], ['ab', 'ec'], ['eee', 'ffff']],
    ['abcdxyz', [0, 4], ['ab', 'xyz'], ['LONG'.toLowerCase(), 'q']],
  ];
  const harness = `
s = Solution()
${cases.map(([text, indices, sources, targets]) => `assert s.findReplaceString(${JSON.stringify(text)}, ${JSON.stringify(indices)}, ${JSON.stringify(sources)}, ${JSON.stringify(targets)}) == ${JSON.stringify(oracle(text, indices, sources, targets))}`).join('\n')}
`;
  const run = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${harness}`], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('833 is registered under String and Google with live arguments', () => {
  assert.equal(problem.id, 833);
  assert.equal(problem.slug, 'find-and-replace-in-string');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'string');
  assert.ok(problem.tags.some((tag) => tag.key === 'sorting'));
  assert.ok(problem.tags.some((tag) => tag.key === 'simulation'));
  assert.ok(problem.companies.includes('google'));
  assert.deepEqual(problem.liveArgs('abcd', { indices: '0,2', sources: 'a,cd', targets: 'eee,ffff' }), ['abcd', [0, 2], ['a', 'cd'], ['eee', 'ffff']]);
});

test('833 dedicated renderer, styles, and roadmap status are wired', () => {
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-find-replace-string-833.js'));
  assert.ok(STYLESHEET_ASSETS.includes('find-replace-string-833.css'));
  const javascript = readFrontendJavaScript();
  const styles = readFrontendStyles();
  const index = readFrontendIndex();
  assert.match(javascript, /function renderFindReplace833View\(step\)/);
  assert.match(javascript, /validate → scan → join/);
  assert.match(styles, /\.fr833-operation/);
  assert.match(styles, /@container \(max-width:620px\)/);
  assert.ok(index.indexOf('renderer-find-replace-string-833.js') < index.indexOf('script.js?'));
  const roadmap = fs.readFileSync(require.resolve('../../docs/leetcode-string-study-roadmap.md'), 'utf8');
  assert.match(roadmap, /\[833\. Find And Replace in String\]\([^\n]+\) \| Medium \|  \| Có \|/);
});
