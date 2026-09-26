const test = require('node:test');
const assert = require('node:assert/strict');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[1105];
const solve = (books, shelfWidth) => problem.builder(books, { shelfWidth });

function bruteForce(books, shelfWidth) {
  const memo = new Map();
  function from(start) {
    if (start === books.length) return 0;
    if (memo.has(start)) return memo.get(start);
    let width = 0;
    let height = 0;
    let answer = Infinity;
    for (let end = start; end < books.length; end++) {
      width += books[end][0];
      if (width > shelfWidth) break;
      height = Math.max(height, books[end][1]);
      answer = Math.min(answer, height + from(end + 1));
    }
    memo.set(start, answer);
    return answer;
  }
  return from(0);
}

test('1105 is available as an ordered prefix-DP lesson', () => {
  assert.equal(problem.id, 1105);
  assert.equal(problem.slug, 'filling-bookcase-shelves');
  assert.equal(problem.category.key, 'dp');
  assert.ok(problem.tags.some((tag) => tag.key === 'dp'));
});

test('1105 matches the published examples and single-shelf boundaries', () => {
  assert.equal(solve('[[1,1],[2,3],[2,3],[1,1],[1,1],[1,1],[1,2]]', 4).answer, 6);
  assert.equal(solve('[[1,3],[2,4],[3,2]]', 6).answer, 4);
  assert.equal(solve('1,3;2,4;3,2', 6).answer, 4);
  assert.equal(solve([[4, 7]], 4).answer, 7);
  assert.equal(solve([[2, 1], [2, 9]], 2).answer, 10);
});

test('1105 agrees with an independent partition oracle on small random cases', () => {
  let seed = 1105;
  const rand = (max) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };
  for (let trial = 0; trial < 100; trial++) {
    const shelfWidth = 2 + rand(5);
    const books = Array.from({ length: 1 + rand(7) }, () => [1 + rand(shelfWidth), 1 + rand(9)]);
    assert.equal(solve(books, shelfWidth).answer, bruteForce(books, shelfWidth),
      `books=${JSON.stringify(books)}, shelfWidth=${shelfWidth}`);
  }
});

test('1105 trace keeps its recurrence and final shelf layout consistent', () => {
  const run = solve([[1, 1], [2, 3], [2, 3], [1, 1], [1, 1], [1, 1], [1, 2]], 4);
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(step.codeLines[0] >= 3 && step.codeLines[0] <= problem.code.length);
    const view = step.shelfDp1105View;
    assert.ok(view);
    if (step.codeLines[0] === 13) assert.equal(view.candidate, view.previous + view.height);
    if (step.codeLines[0] === 14) assert.ok(view.best <= view.candidate);
  }
  const final = run.steps.at(-1).shelfDp1105View;
  assert.equal(final.answer, 6);
  assert.equal(final.shelves.reduce((sum, shelf) => sum + shelf.height, 0), run.answer);
  assert.deepEqual(final.shelves.flatMap((shelf) => shelf.books.map((book) => book.index)),
    Array.from({ length: run.original.length }, (_, index) => index));
  for (const shelf of final.shelves) {
    assert.ok(shelf.width <= run.shelfWidth);
    assert.equal(shelf.width, shelf.books.reduce((sum, book) => sum + book.thickness, 0));
    assert.equal(shelf.height, Math.max(...shelf.books.map((book) => book.height)));
  }
});

test('1105 validates book dimensions and shelf width', () => {
  assert.throws(() => solve('not books', 4));
  assert.throws(() => solve([[1, 2, 3]], 4));
  assert.throws(() => solve([[0, 2]], 4));
  assert.throws(() => solve([[5, 2]], 4));
  assert.throws(() => solve([[1, 2]], 0));
});

test('1105 bounds long traces while computing every dp state', () => {
  const books = Array.from({ length: 100 }, () => [1, 2]);
  const run = solve(books, 100);
  assert.equal(run.answer, 2);
  assert.ok(run.steps.length <= 651);
  const final = run.steps.at(-1).shelfDp1105View;
  assert.equal(final.omitted, true);
  assert.equal(final.shelves.length, 1);
  assert.equal(final.shelves[0].books.length, 100);
});
