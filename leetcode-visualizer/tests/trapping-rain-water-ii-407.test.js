const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[407];

function bruteTrapRainWater(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  if (rows < 3 || cols < 3) return 0;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const frontier = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) {
        frontier.push([grid[r][c], r, c]);
        visited[r][c] = true;
      }
    }
  }
  let water = 0;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (frontier.length) {
    frontier.sort((a, b) => a[0] - b[0]);
    const [wall, r, c] = frontier.shift();
    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || visited[nr][nc]) continue;
      visited[nr][nc] = true;
      water += Math.max(0, wall - grid[nr][nc]);
      frontier.push([Math.max(wall, grid[nr][nc]), nr, nc]);
    }
  }
  return water;
}

const encode = grid => grid.map(row => row.join(',')).join(';');

test('407 keeps the optimal min-heap solution and dedicated outside-in visualization', () => {
  assert.equal(problem.id, 407);
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.slug, 'trapping-rain-water-ii');
  assert.equal(problem.complexity.time, 'O(rows·cols·log(rows·cols))');
  assert.match(problem.code.join('\n'), /heapq\.heappop|heapq\.heappush/);

  const run = problem.builder(problem.defaultInput);
  assert.ok(run.steps.every(step => step.trapRain2View));
  assert.ok(run.steps.every(step => Array.isArray(step.trapRain2View.settled)));
});

test('407 matches the official examples and the no-interior edge case', () => {
  const cases = [
    ['1,4,3,1,3,2;3,2,1,3,2,4;2,3,3,2,3,1', 4],
    ['3,3,3,3,3;3,2,2,2,3;3,2,1,2,3;3,2,2,2,3;3,3,3,3,3', 10],
    ['1,2,1;2,1,2', 0],
  ];
  for (const [input, expected] of cases) {
    const run = problem.builder(input);
    assert.equal(run.answer, expected);
    assert.equal(run.steps.at(-1).trapRain2View.total, expected);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('407 agrees with an independent priority-frontier oracle on random maps', () => {
  let seed = 407;
  const random = max => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };
  for (let caseIndex = 0; caseIndex < 120; caseIndex += 1) {
    const rows = 2 + random(5);
    const cols = 2 + random(5);
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => random(9)));
    assert.equal(problem.builder(encode(grid)).answer, bruteTrapRainWater(grid), encode(grid));
  }
});

test('407 trace explains pop, fill-or-raise, and the running total', () => {
  const run = problem.builder(problem.defaultInput);
  const events = run.steps.map(step => step.trapRain2View.event);
  for (const event of ['init', 'pop-lowest-wall', 'trap-neighbor', 'raise-boundary', 'done']) {
    assert.ok(events.includes(event), `missing trace event: ${event}`);
  }
  for (const step of run.steps) {
    const view = step.trapRain2View;
    assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
    assert.equal(view.visited.length, view.rows);
    assert.equal(view.settled.length, view.rows);
    assert.ok(view.total >= 0);
  }
});

test('407 validates shape, height range, and visualization size', () => {
  assert.throws(() => problem.builder('1,2;3'), /rectangular grid/);
  assert.throws(() => problem.builder('1,-1;2,3'), /between 0 and 20000/);
  assert.throws(() => problem.builder(Array.from({ length: 9 }, () => '1').join(';')), /at most an 8×8 grid/);
});

test('407 simplified renderer handles every step in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderTrapRain2View(step)');
  const end = script.indexOf('\nfunction renderAverageSubtree2265View(step)', start);
  assert.ok(start >= 0 && end > start);

  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of [problem.builder(problem.defaultInput), problem.builder('1,2;3,4')]) {
      for (const step of run.steps) {
        context.renderTrapRain2View(step);
        assert.match(element.innerHTML, /trw407-viz/);
        assert.match(element.innerHTML, /trw407-map/);
        assert.match(element.innerHTML, /trw407-rule/);
        assert.match(element.innerHTML, /trw407-focus/);
        assert.match(element.innerHTML, /trw407-result/);
        assert.match(element.innerHTML, /water = max\(0,/);
        assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity/);
      }
    }
  }
});

test('407 height map fits its frame instead of forcing max-content width', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  const start = css.indexOf('/* ---- Trapping Rain Water II: outside-in flood model (#407) ---- */');
  const end = css.indexOf('/* ---- Count Nodes Equal to Average of Subtree (#2265) ---- */', start);
  const styles = css.slice(start, end);

  assert.ok(start >= 0 && end > start);
  assert.match(styles, /\.trw407-grid\s*\{[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;/);
  assert.match(styles, /grid-template-columns:\s*repeat\(var\(--trw407-cols\),\s*minmax\(112px,\s*1fr\)\);/);
  assert.doesNotMatch(styles, /\.trw407-grid\s*\{[\s\S]*?min-width:\s*max-content;/);
});
