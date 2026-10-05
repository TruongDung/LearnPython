const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const problem = SUPPORTED[3481], view = step => step.substitutions3481View;
const params = pairs => ({ replacements: JSON.stringify(pairs) });

function oracle(pairs, text) {
  // Expand whole strings in repeated passes, without DFS or caching.
  const values = Object.fromEntries(pairs);
  while (/%[A-Z]%/.test(text)) text = text.replace(/%([A-Z])%/g, (_, key) => values[key]);
  return text;
}
function cases() {
  const result = [
    [[['A', 'abc'], ['B', 'def']], '%A%_%B%'],
    [[['A', 'bce'], ['B', 'ace'], ['C', 'abc%B%']], '%A%_%B%_%C%'],
    [[['A', '%B%x'], ['B', '%C%y'], ['C', 'z']], '%A%_%B%_%C%'],
    [[['A', '%B%%B%'], ['B', '%C%_%C%'], ['C', 'end']], '%A%_%C%_%B%'],
    [[['Z', '<img>']], '%Z%'],
  ];
  let seed = 3481;
  const random = max => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % max; };
  for (let sample = 0; sample < 60; sample++) {
    const count = 1 + random(8), pairs = [];
    for (let i = 0; i < count; i++) {
      const key = String.fromCharCode(65 + i), remaining = count - i - 1;
      const ref = () => '%' + String.fromCharCode(65 + i + 1 + random(remaining)) + '%';
      const value = !remaining || random(3) === 0 ? 'xyz'[random(3)] : random(2) ? ref() + ref() : 'x' + ref() + 'y';
      pairs.push([key, value]);
    }
    const text = [...pairs].reverse().map(([key]) => '%' + key + '%').join('_');
    result.push([pairs, text]);
  }
  const chain = Array.from({ length: 10 }, (_, i) => [String.fromCharCode(65 + i), i === 9 ? 'z' : '%' + String.fromCharCode(66 + i) + '%%' + String.fromCharCode(66 + i) + '%']);
  result.push([chain, chain.map(([key]) => '%' + key + '%').join('_')]);
  return result;
}

test('3481 examples, nested references and repeated placeholders agree with whole-string expansion', () => {
  assert.equal(problem.slug, 'apply-substitutions');
  assert.equal(problem.premium, true);
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.builder(problem.defaultInput).answer, 'zyx_zy_z');
  for (const [pairs, text] of cases()) {
    const run = problem.builder(text, params(pairs));
    assert.equal(run.answer, oracle(pairs, text));
    assert.equal(view(run.steps.at(-1)).answer, run.answer);
    assert.deepEqual(problem.liveArgs(' ' + text + ' ', params(pairs)), [pairs, text]);
    assert.equal(view(run.steps.at(-1)).stack.length, 0);
    for (const row of view(run.steps.at(-1)).mappings) {
      assert.equal(row.expanded, oracle(pairs, '%' + row.key + '%'));
      assert.equal(row.status, 'done');
    }
  }
});

test('3481 invalid mappings and cyclic or unknown references are rejected before DFS', () => {
  const bad = [
    ['%A%', 'not JSON'], ['%A%', '[]'], ['%A%', '{}'],
    ['%A%', JSON.stringify([['A', 'x'], ['A', 'y']])],
    ['%A%', JSON.stringify([['a', 'x']])], ['%A%', JSON.stringify([['AB', 'x']])],
    ['%A%', JSON.stringify([['A', '']])], ['%A%', JSON.stringify([['A', '123456789']])],
    ['%A%', JSON.stringify([['A', '%B%']])], ['%A%', JSON.stringify([['A', '%A%']])],
    ['%A%_%B%', JSON.stringify([['A', '%B%'], ['B', '%A%']])],
    ['%A%', JSON.stringify([['A', '%a%']])], ['%A%', JSON.stringify([['A', 'a%']])],
    ['', JSON.stringify([['A', 'x']])], ['%B%', JSON.stringify([['A', 'x']])],
    ['%A%_%A%', JSON.stringify([['A', 'x'], ['B', 'y']])],
    ['%A%', JSON.stringify([['A', 'x'], ['B', 'y']])],
  ];
  for (const [text, replacements] of bad) {
    assert.throws(() => problem.builder(text, { replacements }));
    assert.throws(() => problem.liveArgs(text, { replacements }));
  }
  assert.throws(() => problem.builder(null));
  assert.notEqual(problem.builder('%A%', params([['A', 'one']])).answer, problem.builder('%A%', params([['A', 'two']])).answer);
});

test('3481 snapshots cache only completed children and append only when the parent resumes', () => {
  const run = problem.builder(problem.defaultInput), saves = [];
  let previousMemo = {};
  for (const [index, step] of run.steps.entries()) {
    const v = view(step), f = v.stack.at(-1);
    assert.equal(v.line, step.codeLines[0]);
    assert.ok(v.line >= 1 && v.line <= problem.code.length);
    if (v.event === 'memo-save') {
      assert.equal(v.line, 9); saves.push(f.key);
      assert.equal(v.memo[f.key], f.result);
      assert.doesNotMatch(f.result, /%[A-Z]%/);
      assert.deepEqual(v.memo, { ...previousMemo, [f.key]: f.result });
    } else assert.deepEqual(v.memo, previousMemo);
    previousMemo = v.memo;
    if (v.event === 'expand-key') assert.equal(Object.hasOwn(v.memo, f.key), false);
    if (v.event === 'append-child') {
      assert.equal(v.line, 16);
      const old = view(run.steps[index - 1]).stack.find(frame => frame.id === f.id);
      assert.ok(old);
      assert.equal(f.parts.length, old.parts.length + 1);
      assert.deepEqual(f.parts.slice(0, -1), old.parts);
      assert.equal(f.parts.at(-1).value, v.memo[f.match.key]);
      assert.equal(f.cursor, f.match.to);
    }
    if (v.event === 'call-child') assert.equal(f.match.appended, false);
    if (v.event === 'cache-return') {
      assert.equal(v.line, 8);
      assert.equal(f.result, v.memo[f.key]);
      assert.equal(v.stack.at(-2).kind, 'expand');
    }
    if (!step.final) assert.equal(v.answer, null);
  }
  assert.deepEqual(saves, ['C', 'B', 'A']);
  assert.deepEqual(view(run.steps.at(-1)).history.filter(item => item.event === 'hit').map(item => item.key), ['B', 'C']);
  assert.deepEqual(view(run.steps[0]).memo, {});
  const deepest = Math.max(...run.steps.map(step => view(step).stack.filter(f => f.kind === 'resolve').length));
  assert.equal(deepest, 3);
});

test('3481 renderer shows DFS waiting, memo state, reuse and safely escaped output in both languages', () => {
  const host = { innerHTML: '' };
  const ctx = { lang: 'vi', $: () => host, escapeHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;') };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/renderer-apply-substitutions-3481.js'), 'utf8'), ctx);
  for (const lang of ['vi', 'en']) {
    ctx.lang = lang;
    for (const [pairs, text] of cases().slice(0, 5)) {
      const run = problem.builder(text, params(pairs));
      for (const step of run.steps) {
        ctx.renderSubstitutions3481View(step);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|<img>/);
        assert.equal((host.innerHTML.match(/data-key="/g) || []).length, pairs.length);
        assert.equal((host.innerHTML.match(/data-frame="/g) || []).length, view(step).stack.length);
        if (view(step).event === 'call-child') assert.match(host.innerHTML, lang === 'vi' ? /chờ resolve trả về/ : /waiting for resolve/);
      }
      assert.match(host.innerHTML, lang === 'vi' ? /Đáp án/ : /Answer/);
      if (pairs.length === 1) assert.match(host.innerHTML, /&lt;img>/);
    }
  }
});

test('3481 displayed Python agrees with expansion oracle and preserves replacements/text argument order', () => {
  const localPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
  const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : 'python');
  const inputCases = cases().map(([pairs, text]) => problem.liveArgs(text, params(pairs)));
  const script = "import json,sys\npayload=json.load(sys.stdin)\nexec(payload['code'])\nprint(json.dumps([Solution().applySubstitutions(*args) for args in payload['cases']]))";
  const result = spawnSync(python, ['-c', script], { input: JSON.stringify({ code: problem.code.join('\n'), cases: inputCases }), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  assert.deepEqual(JSON.parse(result.stdout), inputCases.map(([pairs, text]) => oracle(pairs, text)));
});
