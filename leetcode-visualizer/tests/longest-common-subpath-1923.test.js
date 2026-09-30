const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const problem = require('../problems').SUPPORTED[1923];

function oracle(paths) {
  const shortest = paths.reduce((best, path) => path.length < best.length ? path : best);
  for (let length = shortest.length; length >= 1; length -= 1) {
    for (let start = 0; start + length <= shortest.length; start += 1) {
      const candidate = shortest.slice(start, start + length);
      const appearsEverywhere = paths.every((path) => {
        for (let index = 0; index + length <= path.length; index += 1) {
          if (candidate.every((city, offset) => city === path[index + offset])) return true;
        }
        return false;
      });
      if (appearsEverywhere) return length;
    }
  }
  return 0;
}

function sourceLine(fragment) {
  const index = problem.code.findIndex((line) => line.includes(fragment));
  assert.notEqual(index, -1, fragment);
  return index + 1;
}

test('1923 opts into true line-by-line debugging', () => {
  assert.equal(problem.id, 1923);
  assert.equal(problem.slug, 'longest-common-subpath');
  assert.equal(problem.debugMode, 'line-by-line');

  const run = problem.builder(problem.defaultInput, { n: 5 });
  assert.equal(run.answer, 2);
  assert.ok(run.steps.length > 20);
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
  assert.ok(run.steps.every((step) => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  assert.ok(run.steps.every((step) => step.title.en.startsWith(`Line ${step.codeLines[0]}:`)));
  assert.ok(run.steps.every((step) => step.title.vi.startsWith(`Dòng ${step.codeLines[0]}:`)));
  assert.equal(run.steps.filter((step) => step.final).length, 1);
  assert.equal(run.steps.at(-1).final, true);
  assert.equal(run.steps.at(-1).hardProblemView.answer, 2);
});

test('1923 highlights only the binary-search branch that executed', () => {
  const run = problem.builder(problem.defaultInput, { n: 5 });
  const activeLines = new Set(run.steps.map((step) => step.codeLines[0]));
  const ifLine = sourceLine('if exists(middle)');
  const lowLine = sourceLine('low = middle');
  const highLine = sourceLine('high = middle - 1');
  const commentLine = sourceLine('Hashes filter candidates');

  assert.ok(activeLines.has(ifLine));
  assert.ok(activeLines.has(lowLine), 'the successful mid=2 probe must execute low = middle');
  assert.ok(activeLines.has(highLine), 'the failed mid=3 probe must execute high = middle - 1');
  assert.ok(!activeLines.has(commentLine), 'the debugger must not stop on a comment');

  for (const step of run.steps) {
    if (step.hardProblemView.formula.en.startsWith('low = mid')) {
      assert.ok([ifLine, lowLine].includes(step.codeLines[0]));
    }
    if (step.hardProblemView.formula.en.startsWith('high = mid')) {
      assert.ok([ifLine, highLine].includes(step.codeLines[0]));
    }
  }
});

test('1923 agrees with examples and an independent brute-force oracle', () => {
  const examples = [
    { n: 5, paths: [[0, 1, 2, 3, 4], [2, 3, 4], [4, 0, 1, 2, 3]], answer: 2 },
    { n: 3, paths: [[0], [1], [2]], answer: 0 },
    { n: 4, paths: [[0, 1, 2, 3], [1, 2, 3, 0], [3, 1, 2, 3]], answer: 3 },
  ];
  for (const example of examples) {
    assert.equal(problem.builder(JSON.stringify(example.paths), { n: example.n }).answer, example.answer);
  }

  let seed = 1923;
  for (let sample = 0; sample < 30; sample += 1) {
    const paths = Array.from({ length: 2 + (sample % 3) }, () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const length = 1 + (seed % 6);
      return Array.from({ length }, () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed % 5;
      });
    });
    assert.equal(problem.builder(JSON.stringify(paths), { n: 5 }).answer, oracle(paths), JSON.stringify(paths));
  }
});

test('1923 displayed Python solution matches the visualizer', () => {
  const cases = [
    { n: 5, paths: [[0, 1, 2, 3, 4], [2, 3, 4], [4, 0, 1, 2, 3]], answer: 2 },
    { n: 3, paths: [[0], [1], [2]], answer: 0 },
    { n: 4, paths: [[1, 2, 1, 2], [0, 1, 2, 3], [1, 2]], answer: 2 },
  ];
  const source = `${problem.code.join('\n')}
import json, sys
for case in json.load(sys.stdin):
    assert Solution().longestCommonSubpath(case['n'], case['paths']) == case['answer'], case
`;
  const python = spawnSync('python', ['-c', source], {
    input: JSON.stringify(cases),
    encoding: 'utf8',
  });
  assert.equal(python.status, 0, python.stderr);
});
