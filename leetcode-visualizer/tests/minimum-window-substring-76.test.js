const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[76];

// Independent oracle: scan every substring and compare full frequency tables.
// Nothing here reuses the need/missing bookkeeping the builder relies on.
function oracle(s, t) {
  if (!s || !t) return '';
  const want = new Map();
  for (const c of t) want.set(c, (want.get(c) || 0) + 1);
  let best = '';
  for (let i = 0; i < s.length; i += 1) {
    const have = new Map();
    for (let j = i; j < s.length; j += 1) {
      have.set(s[j], (have.get(s[j]) || 0) + 1);
      let covered = true;
      for (const [c, n] of want) {
        if ((have.get(c) || 0) < n) {
          covered = false;
          break;
        }
      }
      if (!covered) continue;
      const candidate = s.slice(i, j + 1);
      if (!best || candidate.length < best.length) best = candidate;
      break;
    }
  }
  return best;
}

const build = (s, t) => problem.builder(s, { t });

test('76 renders t as a text field, not a number field', () => {
  // Regression guard. Without type: "string", renderExtraParams builds
  // <input type="number">, "ABC" cannot be typed, the client sends
  // Number("") === 0, and the answer silently becomes "" for every input.
  const param = problem.extraParams.find((p) => p.key === 't');
  assert.ok(param, 't param must exist');
  assert.equal(param.type, 'string');
  assert.equal(param.default, 'ABC');
  // Anything non-alphabetic must now fail loudly instead of returning "".
  assert.throws(() => problem.builder('ADOBECODEBANC', { t: 0 }), /only English letters/);
});

test('76 keeps its signature and documents the negative-need trick', () => {
  assert.equal(problem.id, 76);
  assert.equal(problem.slug, 'minimum-window-substring');
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.category.key, 'sliding');
  assert.equal(problem.complexity.time, 'O(|s| + |t|)');
  assert.equal(problem.debugMode, 'semantic');
  assert.deepEqual(problem.liveArgs('ADOBECODEBANC', { t: 'ABC' }), ['ADOBECODEBANC', 'ABC']);

  const code = problem.code.join('\n');
  assert.match(code, /def minWindow\(self, s: str, t: str\) -> str:/);
  assert.match(code, /need\[char\] -= 1/);
  assert.match(code, /while missing == 0:/);
  // The surplus idea must be spelled out somewhere in the teaching copy.
  const approach = problem.approach.map((item) => item.en).join(' ');
  assert.match(approach, /surplus/i);
  assert.match(approach, /NEGATIVE/);
});

test('76 matches the published examples and the duplicate-character cases', () => {
  const cases = [
    ['ADOBECODEBANC', 'ABC', 'BANC'],
    ['a', 'a', 'a'],
    ['a', 'aa', ''],
    // t's duplicates must be respected, not just its distinct letters.
    ['aa', 'aa', 'aa'],
    ['bba', 'ab', 'ba'],
    // A surplus in the middle has to be shrunk away.
    ['cabwefgewcwaefgcf', 'cae', 'cwae'],
    // Case is significant.
    ['Ab', 'ab', ''],
  ];
  for (const [s, t, expected] of cases) {
    const run = build(s, t);
    assert.equal(run.answer, expected, `s=${s} t=${t}`);
    assert.equal(run.steps.at(-1).minWindow76View.answer, expected);
    assert.equal(run.steps.at(-1).final, true);
    assert.equal(run.steps.filter((step) => step.final).length, 1);
  }
});

test('76 agrees with a full-frequency-table oracle on random strings', () => {
  let seed = 76;
  const random = (max) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };
  const alphabet = 'abcd';
  for (let trial = 0; trial < 400; trial += 1) {
    const s = Array.from({ length: 1 + random(18) }, () => alphabet[random(alphabet.length)]).join('');
    const t = Array.from({ length: 1 + random(4) }, () => alphabet[random(alphabet.length)]).join('');
    const answer = build(s, t).answer;
    const expected = oracle(s, t);
    // Ties may sit at different offsets, so compare length plus validity.
    assert.equal(answer.length, expected.length, `s=${s} t=${t} got=${answer} want=${expected}`);
    if (answer) {
      assert.ok(s.includes(answer), `${answer} is not a substring of ${s}`);
      const have = new Map();
      for (const c of answer) have.set(c, (have.get(c) || 0) + 1);
      const want = new Map();
      for (const c of t) want.set(c, (want.get(c) || 0) + 1);
      for (const [c, n] of want) assert.ok((have.get(c) || 0) >= n, `${answer} lacks ${n}x${c}`);
    }
  }
});

test('76 exposes need as still-owed / exactly-met / surplus', () => {
  const run = build('ADOBECODEBANC', 'ABC');
  const views = run.steps.map((step) => step.minWindow76View);
  // At the start nothing is in the window, so all three letters are owed.
  assert.deepEqual(views[0].need, [
    { char: 'A', count: 1, state: 'missing' },
    { char: 'B', count: 1, state: 'missing' },
    { char: 'C', count: 1, state: 'missing' },
  ]);
  assert.equal(views[0].missing, 3);

  // need is only ever reported for the distinct characters of t.
  assert.ok(views.every((view) => view.need.length === 3));
  assert.ok(views.every((view) => view.need.every((entry) => (
    (entry.count > 0 && entry.state === 'missing')
    || (entry.count === 0 && entry.state === 'exact')
    || (entry.count < 0 && entry.state === 'surplus')
  ))));

  // missing must be 0 exactly on the steps that record or shrink a window.
  for (const view of views) {
    if (view.phase === 'record') assert.equal(view.missing, 0, 'a recorded window must cover t');
  }
  // The surplus state has to actually occur, otherwise the teaching point is moot.
  assert.ok(
    views.some((view) => view.need.some((entry) => entry.state === 'surplus')),
    'some step must show a surplus need entry',
  );
});

test('76 only reduces missing for a character that was genuinely owed', () => {
  const run = build('ADOBECODEBANC', 'ABC');
  const expands = run.steps.filter((step) => step.minWindow76View.phase === 'expand');
  assert.equal(expands.length, 13, 'one expand step per character of s');
  // Line 13 (missing -= 1) must appear only on the steps that claim it ran.
  for (const step of expands) {
    const needed = step.minWindow76View.event === 'expand-needed';
    assert.equal(step.codeLines.includes(13), needed, JSON.stringify(step.codeLines));
    assert.match(problem.code[12], /missing -= 1/);
  }
  // A character becomes owed AGAIN once left has passed it, so this is not just
  // "the first occurrence of each letter": A@0, B@3, C@5 cover t the first time,
  // then shrinking gives A and C back and they are owed again at 10 and 12.
  const neededAt = expands
    .filter((step) => step.minWindow76View.event === 'expand-needed')
    .map((step) => step.minWindow76View.right);
  assert.deepEqual(neededAt, [0, 3, 5, 10, 12]);
  assert.deepEqual(neededAt.map((index) => 'ADOBECODEBANC'[index]), ['A', 'B', 'C', 'A', 'C']);
  // The re-owed occurrences must come after left moved past the earlier one.
  const firstShrink = run.steps.findIndex((step) => step.minWindow76View.phase === 'shrink');
  const reNeeded = run.steps.findIndex(
    (step) => step.minWindow76View.event === 'expand-needed' && step.minWindow76View.right === 10,
  );
  assert.ok(firstShrink >= 0 && reNeeded > firstShrink);
});

test('76 shrinks through surplus characters and stops on a real debt', () => {
  const run = build('ADOBECODEBANC', 'ABC');
  const shrinks = run.steps.filter((step) => step.minWindow76View.phase === 'shrink');
  assert.ok(shrinks.length > 0);
  for (const step of shrinks) {
    const breaks = step.minWindow76View.event === 'shrink-breaks';
    // Line 20 (missing += 1) only runs when the debt is real.
    assert.equal(step.codeLines.includes(20), breaks, JSON.stringify(step.codeLines));
    assert.match(problem.code[19], /missing \+= 1/);
    if (breaks) assert.ok(step.minWindow76View.missing > 0);
    else assert.equal(step.minWindow76View.missing, 0);
  }
  // left only ever moves forward.
  const lefts = run.steps.map((step) => step.minWindow76View.left);
  for (let i = 1; i < lefts.length; i += 1) assert.ok(lefts[i] >= lefts[i - 1]);
  // The best window never gets longer.
  let previous = Infinity;
  for (const step of run.steps) {
    const best = step.minWindow76View.best;
    if (!best) continue;
    assert.ok(best.length <= previous);
    previous = best.length;
  }
});

test('76 codeLines are 1-based and point at the line each step performs', () => {
  const run = build('ADOBECODEBANC', 'ABC');
  assert.ok(run.steps.every((step) => step.codeLines.length > 0));
  assert.ok(run.steps.every((step) => step.codeLines.every((line) => line >= 1 && line <= problem.code.length)));
  const firstLineFor = (phase) => problem.code[
    run.steps.find((step) => step.minWindow76View.phase === phase).codeLines[0] - 1
  ];
  assert.match(firstLineFor('init'), /need = Counter\(t\)/);
  assert.match(firstLineFor('expand'), /for right, char in enumerate\(s\)/);
  assert.match(firstLineFor('record'), /while missing == 0:/);
  assert.match(firstLineFor('shrink'), /need\[s\[left\]\] \+= 1/);
  assert.match(firstLineFor('done'), /return s\[start:end\]/);
});

test('76 shows the empty-input guard as its own branch', () => {
  const run = problem.builder('ABC', { t: '' });
  assert.equal(run.answer, '');
  assert.equal(run.steps.length, 1);
  assert.deepEqual(run.steps[0].codeLines, [5, 6]);
  assert.match(problem.code[4], /if not s or not t:/);
  assert.match(problem.code[5], /return ""/);
  assert.equal(run.steps[0].final, true);
});

test('76 validates s and t', () => {
  assert.throws(() => build('ADOBE 1', 'ABC'), /s must contain only English letters/);
  assert.throws(() => build('ADOBE', 'A-C'), /t must contain only English letters/);
  assert.throws(() => build('a'.repeat(25), 'a'), /up to 24 characters in s/);
  assert.throws(() => build('abc', 'a'.repeat(13)), /up to 12 characters in t/);
});

test('76 displayed Python and the solution file agree with the visualizer', () => {
  const assertions = [
    'assert Solution().minWindow("ADOBECODEBANC", "ABC") == "BANC"',
    'assert Solution().minWindow("a", "a") == "a"',
    'assert Solution().minWindow("a", "aa") == ""',
    'assert Solution().minWindow("bba", "ab") == "ba"',
    'assert Solution().minWindow("cabwefgewcwaefgcf", "cae") == "cwae"',
    'assert Solution().minWindow("Ab", "ab") == ""',
  ].join('\n');
  const displayed = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = path.resolve(__dirname, '../../Leetcode-sln/string/Leetcode_76.py');
  const solution = spawnSync('python3', [solutionPath], { encoding: 'utf8' });
  assert.equal(solution.status, 0, solution.stderr);
});

function loadRenderer() {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderMinWindow76View(step)');
  const end = script.indexOf('\nfunction renderStep()', start);
  assert.ok(start >= 0 && end > start);
  const elements = new Map();
  const elementFor = (id) => {
    if (!elements.has(id)) elements.set(id, { innerHTML: '' });
    return elements.get(id);
  };
  const context = {
    lang: 'en',
    $: elementFor,
    escapeHtml: (value) => String(value ?? ''),
    pick: (value) => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);
  return { context, elementFor, script };
}

test('76 renderer covers every trace state in English and Vietnamese', () => {
  const { context, elementFor, script } = loadRenderer();
  const runs = [
    build('ADOBECODEBANC', 'ABC'),
    build('a', 'a'),
    build('a', 'aa'),
    build('cabwefgewcwaefgcf', 'cae'),
    problem.builder('ABC', { t: '' }),
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderMinWindow76View(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /mw76-viz/);
        assert.match(html, /mw76-strip/);
        assert.match(html, /mw76-missing/);
        assert.match(html, new RegExp(`(?:LINE|DÒNG) ${step.codeLines.join(', ')}`));
        assert.doesNotMatch(html, /NaN|undefined|Infinity|null/);
        // One strip cell per character of s.
        assert.equal((html.match(/class="mw76-cell/g) || []).length, step.minWindow76View.s.length);
      }
    }
  }
  assert.match(script, /else if \(step\.minWindow76View\)/);
});

test('76 renderer marks the window, the best window and both cursors', () => {
  const { context, elementFor } = loadRenderer();
  const run = build('ADOBECODEBANC', 'ABC');

  // First time missing hits 0 the window is "ADOBEC": 6 cells, and it is the
  // new best, so those same cells are also marked as best.
  const firstRecord = run.steps.find((step) => step.minWindow76View.event === 'record-better');
  context.renderMinWindow76View(firstRecord);
  let html = elementFor('treeView').innerHTML;
  assert.equal(firstRecord.minWindow76View.windowText, 'ADOBEC');
  assert.equal((html.match(/mw76-cell in-window/g) || []).length, 6);
  assert.equal((html.match(/in-best/g) || []).length, 6);
  assert.match(html, /mw76-missing covered/);
  assert.equal((html.match(/mw76-cell[^"]*cursor/g) || []).length, 2, 'L and R sit on different cells');

  // On the final step the best window is BANC and missing is back above 0.
  context.renderMinWindow76View(run.steps.at(-1));
  html = elementFor('treeView').innerHTML;
  assert.match(html, /mw76-best found/);
  assert.match(html, /"BANC"/);
  assert.match(html, /mw76-missing short/);
  assert.equal((html.match(/in-best/g) || []).length, 4);
});

test('76 renderer colours need entries by owed / met / surplus', () => {
  const { context, elementFor } = loadRenderer();
  const run = build('ADOBECODEBANC', 'ABC');

  // Step 0: nothing consumed, so all three letters are still owed.
  context.renderMinWindow76View(run.steps[0]);
  let html = elementFor('treeView').innerHTML;
  assert.equal((html.match(/mw76-need missing/g) || []).length, 3);
  assert.equal((html.match(/mw76-need surplus/g) || []).length, 0);

  // A surplus must be visible somewhere in the run.
  const surplusStep = run.steps.find(
    (step) => step.minWindow76View.need.some((entry) => entry.state === 'surplus'),
  );
  assert.ok(surplusStep, 'the trace must reach a surplus state');
  context.renderMinWindow76View(surplusStep);
  html = elementFor('treeView').innerHTML;
  assert.match(html, /mw76-need surplus/);
  assert.match(html, /surplus|thừa/);
});

test('76 ships responsive scoped styles', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.mw76-viz \{/);
  assert.match(css, /\.mw76-cell\.in-window/);
  assert.match(css, /\.mw76-cell\.in-best/);
  assert.match(css, /\.mw76-need\.surplus/);
  assert.match(css, /\.mw76-missing\.covered/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
