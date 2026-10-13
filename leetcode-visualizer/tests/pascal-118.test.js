const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript, JAVASCRIPT_ASSETS, STYLESHEET_ASSETS } = require('./helpers/frontend-source');
const problem = SUPPORTED[118];

function binomial(row, col) {
  let value = 1;
  for (let i = 1; i <= col; i++) value = value * (row - i + 1) / i;
  return Math.round(value);
}
function renderer(width) {
  const host = { clientWidth: width, innerHTML: '' };
  const context = { lang: 'en', $: () => host };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-pascal-118.js'), 'utf8'), context);
  return { host, context };
}

test('118 generates exact Pascal rows, empty triangles, and isolated snapshots', () => {
  for (const n of [0, 1, 2, 5, 10, 30]) {
    const run = problem.builder([n]);
    assert.equal(run.answer.length, n);
    run.answer.forEach((row, r) => {
      assert.deepEqual(row, Array.from({ length: r + 1 }, (_, c) => binomial(r, c)));
      assert.equal(row.reduce((a, b) => a + b, 0), 2 ** r);
    });
    assert.deepEqual(run.steps[0].pascalTriangleView.rows, []);
    assert.equal(run.steps.at(-1).final, true);
    assert.deepEqual(run.steps.at(-1).pascalTriangleView.rows, run.answer);
    for (const step of run.steps) if (step.pascalTriangleView.formula) {
      const view = step.pascalTriangleView;
      const f = view.formula;
      assert.equal(f.result, f.leftParent + f.rightParent);
      assert.equal(view.workingRow[f.col], f.result);
      assert.deepEqual(view.parents, [{ row: f.row - 1, col: f.col - 1 }, { row: f.row - 1, col: f.col }]);
    }
  }
});

test('118 displayed Python produces the same triangles', () => {
  const cases = [0, 1, 2, 5, 10, 30].map(n => ({ n, expected: problem.builder([n]).answer }));
  const source = `${problem.code.join('\n')}\nimport json,sys\nfor case in json.load(sys.stdin):\n    assert Solution().generate(case['n']) == case['expected']`;
  const run = spawnSync('python3', ['-c', source], { input: JSON.stringify(cases), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('118 pictures render all phases in both languages without mutating snapshots', () => {
  for (const width of [274, 340, 526]) {
    const { host, context } = renderer(width);
    for (const n of [0, 1, 2, 5, 10, 30]) {
      const run = problem.builder([n]);
      const before = JSON.stringify(run);
      for (const language of ['en', 'vi']) for (const step of run.steps) {
        context.lang = language;
        context.renderPascal118View(step);
        assert.match(host.innerHTML, /p118-triangle/);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object|CORE RULE|CURRENT ACTION|<p>/);
        assert.ok((host.innerHTML.match(/<circle/g) || []).length <= 100);
        assert.ok((host.innerHTML.match(/class="p118-cell /g) || []).length <= 42);
        if (step.pascalTriangleView.formula) {
          const f = step.pascalTriangleView.formula;
          assert.match(host.innerHTML, new RegExp(`aria-label="${f.leftParent} \\+ ${f.rightParent} = ${f.result}"`));
          for (const parent of step.pascalTriangleView.parents) assert.match(host.innerHTML, new RegExp(`data-row="${parent.row}" data-col="${parent.col}"`));
        }
      }
      assert.equal(JSON.stringify(run), before);
    }
  }
});

test('118 final default illustrates three blue plus three purple dots making six', () => {
  const { host, context } = renderer(526);
  context.renderPascal118View(problem.builder(problem.defaultInput).steps.at(-1));
  assert.match(host.innerHTML, /aria-label="3 \+ 3 = 6"/);
  const target = host.innerHTML.match(/<g class="p118-group target"[\s\S]*?<\/g>/)[0];
  assert.equal((target.match(/p118-dot left/g) || []).length, 3);
  assert.equal((target.match(/p118-dot right/g) || []).length, 3);
  assert.equal((host.innerHTML.match(/class="p118-cell /g) || []).length, 15);
  context.renderPascal118View(problem.builder([30]).steps.at(-1));
  assert.match(host.innerHTML, /77558760/);
  assert.match(host.innerHTML, /24 earlier rows/);
  assert.equal((host.innerHTML.match(/<circle/g) || []).length, 0);
});

test('118 keeps uncomputed cells unknown and registers dedicated lazy picture assets', () => {
  const { host, context } = renderer(340);
  const run = problem.builder([5]);
  context.renderPascal118View(run.steps.find(step => step.pascalTriangleView.phase === 'start-row' && step.pascalTriangleView.active.row === 4));
  assert.equal((host.innerHTML.match(/data-value="\?"/g) || []).length, 5);
  assert.doesNotMatch(host.innerHTML, /p118-merge/);
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-pascal-118.js'));
  assert.ok(STYLESHEET_ASSETS.includes('pascal-118.css'));
  assert.match(readFrontendJavaScript(), /renderPascal118View\(step\)/);
  assert.doesNotMatch(readFrontendIndex().replace(/<template[\s\S]*?<\/template>/g, ''), /(?:renderer-)?pascal-118\.(?:js|css)/);
  const css = fs.readFileSync(require.resolve('../public/pascal-118.css'), 'utf8');
  assert.match(css, /#answer[^}]+white-space:pre-wrap;overflow-wrap:anywhere/);
});
