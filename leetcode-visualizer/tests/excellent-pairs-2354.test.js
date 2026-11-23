'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), { spawnSync } = require('node:child_process');
const p = require('../problems').SUPPORTED[2354];
const { prepareGenericLiveArgs } = require('../live-args');
const cases = [
  [[1, 2, 3, 1], 3], [[5, 1, 1], 10], [[7, 7, 7], 6],
  [[1], 1], [[1], 3], [[7, 1, 3, 2, 5], 4],
  [[1, 2, 4, 3, 5, 6, 7], 4], [[1000000000, 536870912, 536870911], 30],
  [[1000000000], 60], [[1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095], 12],
];
const pc = x => x.toString(2).split('1').length - 1;
function oracle(nums, k) {
  const values = [...new Set(nums)];
  return values.reduce((sum, x) => sum + values.filter(y => pc(x | y) + pc(x & y) >= k).length, 0);
}

test('2354 counts distinct ordered pairs, self pairs and 30-bit values against an OR/AND oracle', () => {
  let seed = 2354;
  const rand = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  const samples = [...cases, ...Array.from({ length: 200 }, () => [Array.from({ length: 1 + rand(12) }, () => 1 + rand(1000000000)), 1 + rand(60)])];
  for (const [nums, k] of samples) {
    const run = p.builder(nums, { k });
    assert.equal(run.answer, oracle(nums, k), JSON.stringify({ nums, k }));
    assert.equal(run.steps.filter(step => step.final).length, 1);
    assert.equal(run.steps.at(-1).final, true);
    assert.ok(run.steps.every(step => step.codeLines.length === 1));
  }
  assert.equal(p.builder([1, 2, 3, 1], { k: 3 }).answer, 5);
  assert.equal(p.builder([7, 7, 7], { k: 6 }).answer, 1);
});

test('2354 all source lines and post-statement variables match CPython, including loop exhaustion', () => {
  const python = `import sys,json
payload=json.load(sys.stdin)
ns={}
exec(compile(payload['source'],'<excellent2354>','exec'),ns)
output=[]
for nums,k in payload['cases']:
    rows=[]
    pending={}
    def trace(frame,event,arg):
        if frame.f_code.co_name!='countExcellentPairs':return None
        if event in ('line','return'):
            if frame in pending:
                values={name:value for name,value in frame.f_locals.items() if name!='self'}
                rows.append(json.loads(json.dumps({'line':pending[frame],'locals':values})))
            if event=='line':pending[frame]=frame.f_lineno
            else:pending.pop(frame,None)
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().countExcellentPairs(nums,k)
    sys.settrace(None)
    output.append({'answer':answer,'rows':rows})
print(json.dumps(output))`;
  const result = spawnSync(process.env.PYTHON || 'python3', ['-c', python], { input: JSON.stringify({ source: p.code.join('\n'), cases }), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  JSON.parse(result.stdout).forEach((expected, index) => {
    const [nums, k] = cases[index], actual = p.builder(nums, { k });
    assert.equal(actual.answer, expected.answer);
    assert.deepEqual(actual.steps.map(step => ({ line: step.codeLines[0], locals: step.excellentPairs2354View.locals })), expected.rows, `case ${index}`);
  });
});

test('2354 snapshots apply the product after the condition and account for every matrix cell once', () => {
  for (const [nums, k] of cases) {
    const run = p.builder(nums, { k }), saved = JSON.stringify(run);
    for (const [index, step] of run.steps.entries()) {
      const v = step.excellentPairs2354View;
      const applied = v.tests.filter(test => test.applied && test.accepted).reduce((sum, test) => sum + test.ways, 0);
      assert.equal(v.answer ?? 0, applied);
      assert.equal(v.groups.reduce((sum, group) => sum + group.amount, 0), v.processed);
      for (const group of v.groups) {
        assert.equal(group.amount, group.members.length);
        assert.ok(group.members.every(value => pc(value) === group.bits));
      }
      if (v.phase === 'check') {
        assert.equal(v.answer, run.steps[index - 1].excellentPairs2354View.answer);
        assert.equal(v.decision.after, null);
        assert.equal(v.tests.at(-1).applied, !v.decision.accepted);
      }
      if (v.phase === 'add') assert.equal(v.answer, v.decision.before + v.decision.ways);
    }
    const last = run.steps.at(-1).excellentPairs2354View;
    assert.equal(last.tests.length, last.groups.length ** 2);
    assert.equal(last.tests.reduce((sum, test) => sum + test.ways, 0), new Set(nums).size ** 2);
    assert.equal(JSON.stringify(run), saved);
  }
});

test('2354 validates visualization bounds and prepares the same nums/k for live Python', () => {
  assert.deepEqual(p.liveArgs('1,2,3,1', { k: '3' }), [[1, 2, 3, 1], 3]);
  assert.deepEqual(prepareGenericLiveArgs(p, [1, 2, 3, 1], { k: 3 }), [[1, 2, 3, 1], 3]);
  assert.deepEqual(p.builder('[1,2,3,1]', { k: 3 }).answer, 5);
  for (const nums of [[], [0], [-1], [1.5], [1000000001], [NaN], [true], ['1'], new Array(2), Array(17).fill(1), Array.from({ length: 13 }, (_, i) => i + 1), '', '1,,2', '1,x', '[1,']) assert.throws(() => p.builder(nums), /2354/);
  for (const k of [0, 61, 1.5, NaN, null, true, '', 'wat']) assert.throws(() => p.builder([1], { k }), /2354/);
  assert.equal(p.liveArgs(Array(100000).fill(1), { k: 2 })[0].length, 100000);
});

test('2354 renders every line in VI/EN with one matrix cell per ordered value pair', () => {
  const host = { innerHTML: '', querySelectorAll: () => [] };
  const context = { lang: 'vi', $: () => host, escapeHtml: s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;'), steps: [], stepIndex: 0 };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-excellent-pairs-2354.js'), 'utf8'), context);
  for (const lang of ['vi', 'en']) for (const [nums, k] of cases) {
    context.lang = lang; context.steps = p.builder(nums, { k }).steps;
    const saved = JSON.stringify(context.steps);
    context.steps.forEach((step, index) => {
      context.stepIndex = index; context.renderExcellentPairs2354View(step);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
      assert.equal((host.innerHTML.match(/data-ep2354-pair=/g) || []).length, new Set(nums).size ** 2);
      assert.match(host.innerHTML, new RegExp(`(?:Dòng|Line) ${step.codeLines[0]}`));
      assert.equal((host.innerHTML.match(/class="ep2354-bit-row /g) || []).length, 4);
      if (step.final) assert.equal((host.innerHTML.match(/class="ep2354-cell yes/g) || []).length, oracle(nums, k));
    });
    assert.equal(JSON.stringify(context.steps), saved);
  }
});
