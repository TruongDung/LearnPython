const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs'), vm = require('node:vm');
const problem = require('../problems').SUPPORTED[801];
function brute(a,b) {
  let best = a.length + 1;
  for (let mask = 0; mask < 2 ** a.length; mask++) {
    let swaps = 0, valid = true, top = -1, bottom = -1;
    for (let i = 0; i < a.length; i++) {
      const flip = (mask >> i) & 1, x = flip ? b[i] : a[i], y = flip ? a[i] : b[i];
      if (top >= x || bottom >= y) { valid = false; break; }
      swaps += flip; top = x; bottom = y;
    }
    if (valid) best = Math.min(best, swaps);
  }
  return best;
}
const cases = [
  [[1,3,5,4],[1,2,3,7]], [[0,3,5,8,9],[2,1,4,6,9]],
  [[1,2,3,4],[2,3,4,5]], [[0,4,2,6,4],[1,1,5,3,7]],
  [[0,0],[1,1]], [[0,1],[0,1]], [[0,1],[3,4]], [[0,4],[3,1]],
];
let seed = 801;
const random = n => { seed = (Math.imul(seed,1664525) + 1013904223) >>> 0; return seed % n; };
for (let k = 0; k < 160; k++) {
  const n = 2 + random(7), a = [], b = []; let top = random(3), bottom = random(4);
  for (let i = 0; i < n; i++) { top += 1 + random(5); bottom += 1 + random(5); const flip = random(2); a.push(flip ? bottom : top); b.push(flip ? top : bottom); }
  cases.push([a,b]);
}
const validCases = cases.filter(([a,b]) => brute(a,b) <= a.length);

test('801 minimum count and illustrated swaps match exhaustive search', () => {
  for (const [a,b] of cases) {
    const expected = brute(a,b);
    if (expected > a.length) { assert.throws(() => problem.builder(a,{nums2:b}), /no valid/); continue; }
    const original = JSON.stringify([a,b]), run = problem.builder(a,{nums2:b}), last = run.steps.at(-1).minSwaps801View;
    assert.equal(run.answer, expected);
    assert.equal(last.swapped.length, expected);
    const swaps = new Set(last.swapped), x = a.map((value,i) => swaps.has(i) ? b[i] : value), y = b.map((value,i) => swaps.has(i) ? a[i] : value);
    assert.ok(x.every((value,i) => i === 0 || x[i-1] < value));
    assert.ok(y.every((value,i) => i === 0 || y[i-1] < value));
    assert.equal(JSON.stringify([a,b]), original);
    assert.ok(run.steps.slice(0,-1).every(s => s.minSwaps801View.answer === null && s.minSwaps801View.swapped.length === 0));
  }
});

test('801 every executed line and all local values match CPython', () => {
  const python = `import json, sys
data = json.load(sys.stdin)
ns = {}
exec(compile(data['code'], '<801>', 'exec'), ns)
out = []
for a,b in data['cases']:
    events, pending = [], None
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_filename != '<801>': return trace
        if event in ('line','return'):
            if pending is not None:
                values = dict(frame.f_locals)
                values['self'] = {}
                events.append({'line': pending, 'locals':values})
            pending = frame.f_lineno if event == 'line' else None
        return trace
    sys.settrace(trace)
    answer = ns['Solution']().minSwap(a,b)
    sys.settrace(None)
    out.append({'events':events, 'answer':answer})
print(json.dumps(out))`;
  const result = spawnSync('python',['-c',python], {input:JSON.stringify({code:problem.code.join('\n'),cases:validCases}),encoding:'utf8',maxBuffer:32*1024*1024});
  assert.equal(result.status,0,result.stderr);
  JSON.parse(result.stdout).forEach((actual,index) => {
    const [a,b] = validCases[index], run = problem.builder(a,{nums2:b});
    assert.equal(run.answer, actual.answer);
    assert.deepEqual(run.steps.map(s => ({line:s.codeLines[0],locals:Object.fromEntries(s.vars.map(v => [v.name,v.rawValue]))})),actual.events,JSON.stringify([a,b]));
  });
});

test('801 fresh states, branches and immutable snapshots agree with the shown source', () => {
  const run = problem.builder('1,3,5,4',{nums2:'1,2,3,7'});
  assert.deepEqual(run.steps.at(-1).minSwaps801View.swapped,[3]);
  assert.equal(run.steps[0].minSwaps801View.states.keep,null);
  assert.equal(run.steps[1].minSwaps801View.states.keep,0);
  assert.equal(run.steps[1].minSwaps801View.history.length,1);
  for (const step of run.steps) {
    const v = step.minSwaps801View;
    assert.equal(v.source,problem.code[v.line-1].trim());
    if (v.event === 'column') assert.deepEqual(v.checks,{straight:null,cross:null});
    if (v.event === 'reset') assert.equal(v.states.next_keep,v.n+1);
    if ([8,9].includes(v.line)) assert.equal(v.checks.straight,true);
    if ([11,12].includes(v.line)) assert.equal(v.checks.cross,true);
    if (v.update) {
      assert.equal(v.update.result,Math.min(v.update.left,v.update.right));
      assert.equal(v.states[v.update.name],v.update.result);
    }
  }
  const checks = validCases.flatMap(([a,b]) => problem.builder(a,{nums2:b}).steps.map(s => s.minSwaps801View.checks));
  assert.ok(checks.some(c => c.straight === true && c.cross === false));
  assert.ok(checks.some(c => c.straight === false && c.cross === true));
  assert.ok(checks.some(c => c.straight === true && c.cross === true));
});

test('801 two input arrays, validation and large input summary use the full input', () => {
  assert.deepEqual(problem.liveArgs('[1,3,5,4]',{nums2:'[1,2,3,7]'}),[[1,3,5,4],[1,2,3,7]]);
  assert.deepEqual(problem.liveArgs(problem.defaultInput),[[1,3,5,4],[1,2,3,7]]);
  for (const [a,b] of [['1,,2','1,2'],['','1,2'],[[1], [2]],[[1,2],[3]],[[true,2],[1,2]],[[-1,2],[1,2]],[[0,200001],[0,2]],[[1,1],[1,1]],[[0,1.5],[0,2]]]) {
    assert.throws(() => problem.builder(a,{nums2:b}));
    assert.throws(() => problem.liveArgs(a,{nums2:b}));
  }
  const a = Array.from({length:100000},(_,i) => i*2), b = a.map(x => x+1);
  for (let i = 1; i < a.length; i += 2) [a[i],b[i]] = [b[i],a[i]];
  // Independent gaps make every input column already increasing.
  const summary = problem.builder(a,{nums2:b});
  assert.equal(summary.answer,0);
  assert.equal(summary.steps.length,1);
  assert.deepEqual(summary.steps[0].codeLines,[]);
  assert.equal(summary.steps[0].minSwaps801View.a.length,12);
  // A far-off duplicate within each row forces a swap beyond the preview.
  a[99998] = 199997; b[99998] = 199996;
  a[99999] = 199997; b[99999] = 199998;
  const distant = problem.builder(a,{nums2:b});
  assert.equal(distant.answer,1);
  assert.equal(distant.steps[0].minSwaps801View.shownSwapped.length,0);
  assert.ok(distant.steps[0].minSwaps801View.swapped[0] >= 99998);
});

test('801 all trace pictures render in both languages with working column navigation', () => {
  const listeners = {}, host = {innerHTML:'',querySelector:selector => ({addEventListener:(_,cb) => {listeners[selector] = cb;}}),querySelectorAll:() => []};
  const context = {lang:'vi',$:() => host,escapeHtml:s => String(s).replaceAll('<','&lt;').replaceAll('"','&quot;'),stopPlay(){},renderStep(){},steps:[],stepIndex:0};
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-minimum-swaps-801.js'),'utf8'),context);
  for (const language of ['vi','en']) for (const [a,b] of validCases.slice(0,12)) {
    context.lang = language;
    for (const step of problem.builder(a,{nums2:b}).steps) {
      context.renderMinimumSwaps801Pictures(step);
      assert.doesNotMatch(host.innerHTML,/undefined|NaN|Infinity/);
      assert.match(host.innerHTML,/m801-columns/);
      if (step.final) assert.match(host.innerHTML,/m801-proof/);
      if (step.minSwaps801View.event === 'column') assert.match(host.innerHTML,/unknown/);
    }
  }
  const big = Array.from({length:41},(_,i) => i);
  context.renderMinimumSwaps801Pictures(problem.builder(big,{nums2:big}).steps[0]);
  assert.match(host.innerHTML,/preview 12 columns/);
  context.steps = problem.builder(problem.defaultInput).steps;
  context.renderMinimumSwaps801Pictures(context.steps[0]);
  listeners['[data-m801-column]']();
  assert.equal(context.steps[context.stepIndex].minSwaps801View.i,1);
  listeners['[data-m801-result]']();
  assert.equal(context.stepIndex,context.steps.length-1);
});
