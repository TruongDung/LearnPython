const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const pourWater = SUPPORTED[755];
const champagneTower = SUPPORTED[799];

function pourWaterOracle(terrain, volume, source) {
  const heights = [...terrain];
  for (let drop = 0; drop < volume; drop += 1) {
    let destination = source;
    let index = source - 1;
    while (index >= 0 && heights[index] <= heights[index + 1]) {
      if (heights[index] < heights[destination]) destination = index;
      index -= 1;
    }
    if (destination !== source) {
      heights[destination] += 1;
      continue;
    }
    index = source + 1;
    while (index < heights.length && heights[index] <= heights[index - 1]) {
      if (heights[index] < heights[destination]) destination = index;
      index += 1;
    }
    heights[destination] += 1;
  }
  return heights;
}

function champagneOracle(poured, queryRow, queryGlass) {
  let row = [poured];
  for (let level = 0; level < queryRow; level += 1) {
    const next = Array(level + 2).fill(0);
    row.forEach((amount, glass) => {
      const overflow = Math.max(0, amount - 1) / 2;
      next[glass] += overflow;
      next[glass + 1] += overflow;
    });
    row = next;
  }
  return Math.min(1, row[queryGlass]);
}

test('755 and 799 are registered with complete metadata and dedicated visualizations', () => {
  assert.equal(pourWater.slug, 'pour-water');
  assert.equal(pourWater.difficulty, 'medium');
  assert.equal(pourWater.premium, true);
  assert.equal(pourWater.complexity.time, 'O(volume × n)');
  assert.equal(champagneTower.slug, 'champagne-tower');
  assert.equal(champagneTower.difficulty, 'medium');
  assert.equal(champagneTower.complexity.time, 'O(query_row²)');

  assert.ok(pourWater.builder(pourWater.defaultInput, { volume: 4, k: 3 }).steps.every(step => step.pourWater755View));
  assert.ok(champagneTower.builder(champagneTower.defaultInput, { query_row: 2, query_glass: 1 }).steps.every(step => step.champagne799View));
});

test('755 matches the three published example test cases', () => {
  const cases = [
    [[2, 1, 1, 2, 1, 2, 2], 4, 3, [2, 2, 2, 3, 2, 2, 2]],
    [[1, 2, 3, 4], 2, 2, [2, 3, 3, 4]],
    [[3, 1, 3], 5, 1, [4, 4, 4]],
  ];
  for (const [terrain, volume, k, expected] of cases) {
    const frozen = Object.freeze([...terrain]);
    const run = pourWater.builder(frozen, { volume, k });
    assert.deepEqual(run.answer, expected);
    assert.deepEqual(frozen, terrain);
    assert.deepEqual(run.steps.at(-1).pourWater755View.heights, expected);
  }
});

test('755 agrees with an independent deterministic oracle', () => {
  let seed = 755;
  const random = max => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed % max;
  };
  for (let caseIndex = 0; caseIndex < 140; caseIndex += 1) {
    const length = 1 + random(9);
    const terrain = Array.from({ length }, () => random(7));
    const volume = random(13);
    const source = random(length);
    const run = pourWater.builder(terrain, { volume, k: source });
    assert.deepEqual(run.answer, pourWaterOracle(terrain, volume, source), JSON.stringify({ terrain, volume, source }));
  }
});

test('755 trace covers left priority, right fallback, source settling, and completion', () => {
  const runs = [
    pourWater.builder([2, 1, 1, 2, 1, 2, 2], { volume: 4, k: 3 }),
    pourWater.builder([1, 2, 3, 4], { volume: 2, k: 2 }),
    pourWater.builder([3, 1, 3], { volume: 3, k: 1 }),
  ];
  const events = runs.flatMap(run => run.steps.map(step => step.pourWater755View.event));
  for (const event of ['intro', 'drop-start', 'left-check', 'right-start', 'right-check', 'settle-left', 'settle-right', 'settle-source', 'done']) {
    assert.ok(events.includes(event), `missing Pour Water event: ${event}`);
  }
  for (const run of runs) {
    for (const step of run.steps) {
      assert.ok(step.codeLines.every(line => line >= 1 && line <= pourWater.code.length));
    }
  }
});

test('799 matches the official examples supported by the visualization and core edge cases', () => {
  const cases = [
    [1, 1, 1, 0],
    [2, 1, 1, 0.5],
    [0, 0, 0, 0],
    [1, 0, 0, 1],
    [4, 2, 1, 0.5],
    [100000009, 12, 6, 1],
  ];
  for (const [poured, queryRow, queryGlass, expected] of cases) {
    const run = champagneTower.builder([poured], { query_row: queryRow, query_glass: queryGlass });
    assert.ok(Math.abs(run.answer - expected) < 1e-12, JSON.stringify({ poured, queryRow, queryGlass }));
    assert.equal(run.steps.at(-1).champagne799View.answer, run.answer);
  }
});

test('799 agrees with a rolling-row DP oracle', () => {
  for (let poured = 0; poured <= 18; poured += 1) {
    for (let row = 0; row <= 7; row += 1) {
      for (let glass = 0; glass <= row; glass += 1) {
        const run = champagneTower.builder([poured], { query_row: row, query_glass: glass });
        const expected = champagneOracle(poured, row, glass);
        assert.ok(Math.abs(run.answer - expected) < 1e-12, JSON.stringify({ poured, row, glass }));
      }
    }
  }
});

test('799 trace records inspect, hold, split, and final states with valid code lines', () => {
  const run = champagneTower.builder([4], { query_row: 3, query_glass: 1 });
  const events = run.steps.map(step => step.champagne799View.event);
  for (const event of ['intro', 'inspect', 'hold', 'split', 'done']) {
    assert.ok(events.includes(event), `missing Champagne Tower event: ${event}`);
  }
  for (const step of run.steps) {
    assert.ok(step.codeLines.every(line => line >= 1 && line <= champagneTower.code.length));
  }
});

test('755 and 799 validate their visualization inputs', () => {
  assert.throws(() => pourWater.builder([1, 2], { volume: -1, k: 0 }), /volume/);
  assert.throws(() => pourWater.builder([1, 2], { volume: 1, k: 2 }), /k must/);
  assert.throws(() => pourWater.builder(Array(17).fill(1), { volume: 1, k: 0 }), /at most 16/);
  assert.throws(() => champagneTower.builder([1], { query_row: 13, query_glass: 0 }), /between 0 and 12/);
  assert.throws(() => champagneTower.builder([1], { query_row: 2, query_glass: 3 }), /query_glass/);
});

test('755 and 799 custom renderers handle every trace step in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const pourStart = script.indexOf('function renderPourWater755View(step)');
  const champagneStart = script.indexOf('function renderChampagne799View(step)', pourStart);
  const end = script.indexOf('\nfunction renderMaximizeScore2818View(step)', champagneStart);
  assert.ok(pourStart >= 0 && champagneStart > pourStart && end > champagneStart);

  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(script.slice(pourStart, end), context);

  const pourRuns = [
    pourWater.builder([2, 1, 1, 2, 1, 2, 2], { volume: 4, k: 3 }),
    pourWater.builder([3, 1, 3], { volume: 3, k: 1 }),
  ];
  const champagneRuns = [
    champagneTower.builder([1], { query_row: 1, query_glass: 1 }),
    champagneTower.builder([4], { query_row: 3, query_glass: 1 }),
  ];

  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of pourRuns) {
      for (const step of run.steps) {
        context.renderPourWater755View(step);
        assert.match(element.innerHTML, /pw755-viz/);
        assert.match(element.innerHTML, /pw755-terrain/);
        assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity/);
      }
    }
    for (const run of champagneRuns) {
      for (const step of run.steps) {
        context.renderChampagne799View(step);
        assert.match(element.innerHTML, /ct799-viz/);
        assert.match(element.innerHTML, /ct799-tower/);
        assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity/);
      }
    }
  }
});
