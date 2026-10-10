const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const { SUPPORTED } = require('../problems');
const {
  JAVASCRIPT_ASSETS,
  STYLESHEET_ASSETS,
  readFrontendIndex,
  readFrontendJavaScript,
  readFrontendStyles,
} = require('./helpers/frontend-source');

const problem = SUPPORTED[2018];

function bruteForce(board, word) {
  const rows = board.length;
  const columns = board[0].length;
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      for (const [dr, dc] of directions) {
        const beforeRow = row - dr;
        const beforeColumn = column - dc;
        if (beforeRow >= 0 && beforeRow < rows && beforeColumn >= 0 && beforeColumn < columns && board[beforeRow][beforeColumn] !== '#') continue;
        let valid = true;
        for (let index = 0; index < word.length; index += 1) {
          const nextRow = row + dr * index;
          const nextColumn = column + dc * index;
          if (nextRow < 0 || nextRow >= rows || nextColumn < 0 || nextColumn >= columns) { valid = false; break; }
          const cell = board[nextRow][nextColumn];
          if (cell === '#' || (cell !== ' ' && cell !== word[index])) { valid = false; break; }
        }
        if (!valid) continue;
        const afterRow = row + dr * word.length;
        const afterColumn = column + dc * word.length;
        if (afterRow >= 0 && afterRow < rows && afterColumn >= 0 && afterColumn < columns && board[afterRow][afterColumn] !== '#') continue;
        return true;
      }
    }
  }
  return false;
}

test('2018 solves the official example and respects exact slot boundaries', () => {
  assert.equal(problem.builder(problem.defaultInput, { word: 'abc' }).answer, true);
  assert.equal(problem.builder('[[' + '" "," "," "' + ']]', { word: 'ab' }).answer, false);
  assert.equal(problem.builder('[["#"," "," ","#"]]', { word: 'ab' }).answer, true);
  assert.equal(problem.builder('[["#","a","b"," ","#"]]', { word: 'abc' }).answer, true);
});

test('2018 supports reverse horizontal and vertical placement', () => {
  const horizontal = problem.builder('[["#","c","b","a","#"]]', { word: 'abc' });
  assert.equal(horizontal.answer, true);
  assert.equal(horizontal.steps.at(-1).crossword2018View.winningOrientation, 'reverse');
  const vertical = [["#"], ["c"], ["b"], [" "], ["#"]];
  assert.equal(problem.builder(JSON.stringify(vertical), { word: 'abc' }).answer, true);
});

test('2018 agrees with an independent four-direction brute-force oracle', () => {
  let seed = 2018;
  for (let sample = 0; sample < 100; sample += 1) {
    const rows = 1 + (sample % 6);
    const columns = 1 + ((sample * 3) % 6);
    const board = Array.from({ length: rows }, () => Array.from({ length: columns }, () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return ['#', ' ', ' ', 'a', 'b', 'c'][seed % 6];
    }));
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const word = Array.from({ length: 1 + (seed % 6) }, (_, index) => 'abc'[(seed >>> (index * 3)) % 3]).join('');
    assert.equal(problem.builder(JSON.stringify(board), { word }).answer, bruteForce(board, word), JSON.stringify({ board, word }));
  }
});

test('2018 trace shows boundary rejection, character conflict, and winning orientation', () => {
  const board = [
    [' ', ' ', ' ', ' '],
    ['#', 'a', 'x', '#'],
    ['#', 'c', 'b', 'a'],
  ];
  const run = problem.builder(JSON.stringify(board), { word: 'abc' });
  const phases = run.steps.map((step) => step.crossword2018View.phase);
  assert.ok(phases.includes('length-reject'));
  assert.ok(phases.includes('conflict'));
  assert.ok(phases.includes('match'));
  assert.equal(run.answer, true);
  assert.equal(run.steps.filter((step) => step.final).length, 1);
  assert.equal(run.steps.at(-1).crossword2018View.answer, true);
});

test('2018 validates the board shape, alphabet, dimensions, and word', () => {
  for (const input of [
    'bad',
    '[]',
    '[[" "," "],[" "]]',
    '[["."]]',
    '[["A"]]',
    JSON.stringify([Array(15).fill(' ')]),
  ]) assert.throws(() => problem.builder(input, { word: 'a' }));
  for (const word of ['', 'A', 'a1', 'a'.repeat(15), null, 3]) {
    assert.throws(() => problem.builder('[[" "]]', { word }));
  }
});

test('2018 displayed Python and live args match the JS builder', () => {
  const board = [['#', ' '], ['#', 'a'], ['#', 'b'], ['#', '#']];
  const word = 'ab';
  const args = problem.liveArgs(JSON.stringify(board), { word });
  assert.deepEqual(args, [board, word]);
  const source = `${problem.code.join('\n')}
import json, sys
args, expected = json.loads(sys.stdin.read())
actual = Solution().placeWordInCrossword(*args)
assert actual == expected, (actual, expected)
`;
  const run = spawnSync('python3', ['-c', source], {
    input: JSON.stringify([args, problem.builder(JSON.stringify(board), { word }).answer]),
    encoding: 'utf8',
  });
  assert.equal(run.status, 0, run.stderr);
});

test('2018 is registered as a Google string, matrix, and simulation lesson', () => {
  assert.equal(problem.id, 2018);
  assert.equal(problem.slug, 'check-if-word-can-be-placed-in-crossword');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'string');
  const tags = problem.tags.map((tag) => tag.key);
  assert.ok(tags.includes('matrix'));
  assert.ok(tags.includes('simulation'));
  assert.ok(problem.companies.includes('google'));
});

test('2018 dedicated crossword renderer and responsive assets are wired', () => {
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-crossword-placement-2018.js'));
  assert.ok(STYLESHEET_ASSETS.includes('crossword-placement-2018.css'));
  const javascript = readFrontendJavaScript();
  const styles = readFrontendStyles();
  const index = readFrontendIndex();
  assert.match(javascript, /function renderCrosswordPlacement2018View\(step\)/);
  assert.match(javascript, /Why is one row \+ column scan enough/);
  assert.match(styles, /\.cw2018-board/);
  assert.match(styles, /@container \(max-width:470px\)/);
  assert.ok(index.indexOf('renderer-crossword-placement-2018.js') < index.indexOf('script.js?'));
});
