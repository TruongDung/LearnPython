"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const vm = require("node:vm");
const problem = require("../problems").SUPPORTED[1337];
const cases = [
  { input: problem.defaultInput, k: 3 },
  { input: "0,0;0,0;0,0", k: 2 },
  { input: "1,1;1,1;1,1", k: 3 },
  { input: "1,0;0,0;1,1;1,0", k: 1 },
  { input: "1", k: 1 }, { input: "0", k: 1 },
  { input: "1,0,1;0,1,0;0,0,0", k: 3 },
];

test("1337 ranks rows by soldier count and resolves every tie by row index", () => {
  let seed = 1337;
  const rand = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  const samples = [...cases];
  for (let i = 0; i < 60; i++) {
    const m = 1 + rand(9), n = 1 + rand(10);
    samples.push({ input: Array.from({ length: m }, () => { const count = rand(n + 1); return Array.from({ length: n }, (_, c) => c < count ? 1 : 0).join(","); }).join(";"), k: 1 + rand(m) });
  }
  for (const { input, k } of samples) {
    const before = JSON.stringify(input), [mat] = problem.liveArgs(input, { k }), run = problem.builder(input, { k });
    // Count literal soldiers, then repeatedly choose the weakest remaining row without sorting.
    const remaining = mat.map((row, i) => ({ count: row.filter(x => x === 1).length, i })), expected = [];
    for (let j = 0; j < k; j++) {
      const min = remaining.reduce((a, b) => a.count < b.count || (a.count === b.count && a.i < b.i) ? a : b);
      expected.push(min.i); remaining.splice(remaining.indexOf(min), 1);
    }
    assert.deepEqual(run.answer, expected);
    assert.equal(JSON.stringify(input), before);
    assert.equal(run.steps.filter(step => step.final).length, 1);
    assert.deepEqual(run.steps.at(-1).weakRows1337View.answer, expected);
    assert.deepEqual(run.steps.filter(step => step.weakRows1337View.phase === "count").map(step => step.weakRows1337View.strength.at(-1)),
      mat.map((row, r) => [row.filter(x => x === 1).length, r]));
  }
});

test("1337 row counts, sorting, final selection and watches match CPython instructions", () => {
  const source = problem.code.join("\n");
  const python = `import sys,json
${source}
runs=[]
for mat,k in json.load(sys.stdin):
    events,pending=[],None
    def snapshot(frame,line):
        s=frame.f_locals
        events.append({'line':line-1,'watches':[s.get('r','—'),sum(s['row']) if 'row' in s else '—',len(s.get('strength',[])),s['k']], 'strength':[list(x) for x in s.get('strength',[])]})
    def trace(frame,event,arg):
        global pending
        if frame.f_code.co_name!='kWeakestRows': return trace
        if event=='line':
            if pending is not None: snapshot(frame,pending)
            pending=frame.f_lineno
        elif event=='return':
            snapshot(frame,pending)
            pending=None
        return trace
    sys.settrace(trace)
    answer=Solution().kWeakestRows(mat,k)
    sys.settrace(None)
    runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const args = cases.map(({ input, k }) => problem.liveArgs(input, { k }));
  const process = spawnSync("python3", ["-c", python], { input: JSON.stringify(args), encoding: "utf8" });
  assert.equal(process.status, 0, process.stderr);
  JSON.parse(process.stdout).forEach((reference, i) => {
    const { input, k } = cases[i], run = problem.builder(input, { k }); let cursor = 0;
    assert.deepEqual(run.answer, reference.answer);
    for (const step of run.steps) {
      assert.deepEqual(step.vars.map(x => x.name), ["r", "sum(row)", "len(strength)", "k"]);
      while (cursor < reference.events.length && reference.events[cursor].line !== step.codeLines[0]) cursor++;
      assert.ok(cursor < reference.events.length);
      const event = reference.events[cursor++];
      assert.deepEqual(step.vars.map(x => x.value), event.watches);
      assert.deepEqual(step.weakRows1337View.strength, event.strength);
      if (!step.final) assert.deepEqual(step.weakRows1337View.answer, []);
    }
  });
});

function renderer() {
  const host = { innerHTML: "" }, context = { lang: "vi", $: () => host,
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-weakest-rows-1337.js"), "utf8"), context);
  return { context, render: step => { context.renderWeakestRows1337(step); return host.innerHTML; } };
}

test("1337 pictures show every soldier and civilian, preserve row identities through sorting and rewind", () => {
  const { context, render } = renderer();
  for (const lang of ["vi", "en"]) for (const { input, k } of cases) {
    context.lang = lang;
    const run = problem.builder(input, { k }), before = JSON.stringify(run);
    for (const step of run.steps) {
      const v = step.weakRows1337View, html = render(step), mat = v.matrix;
      assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object|<p[ >]/);
      assert.equal((html.match(/data-matrix-cell="/g) || []).length, mat.length * mat[0].length);
      assert.equal((html.match(/class="wr1337-person soldier"/g) || []).length, mat.flat().filter(x => x === 1).length);
      assert.deepEqual([...html.matchAll(/data-rank-row="(\d+)"/g)].map(match => Number(match[1])), v.strength.map(([, r]) => r));
      assert.deepEqual([...html.matchAll(/data-row-link="(\d+):(\d+)"/g)].map(match => [Number(match[1]), Number(match[2])]), v.strength.map(([, r], i) => [r, i]));
      assert.equal((html.match(/class="wr1337-answer-cell /g) || []).length, k);
      assert.equal((html.match(/filled"/g) || []).length, step.final ? k : 0);
    }
    const first = render(run.steps[0]); render(run.steps.at(-1)); assert.equal(render(run.steps[0]), first);
    assert.equal(JSON.stringify(run), before);
  }
  const end = render(problem.builder(problem.defaultInput, { k: 3 }).steps.at(-1));
  assert.match(end, /wr1337-tie/); assert.match(end, /2 = 2/); assert.match(end, /#0/); assert.match(end, /#3/);
});

test("1337 rejects nonbinary matrices and invalid k consistently for solve and live code", () => {
  for (const [input, k] of [["1,2", 1], ["-1,0", 1], ["1;0,1", 1], ["", 1], ["0", 0], ["0", 2], ["0", 1.5], ["0", NaN]]) {
    assert.throws(() => problem.builder(input, { k })); assert.throws(() => problem.liveArgs(input, { k }));
  }
});

test("1337 loads dedicated assets only for the lesson and retains source line horizontal scrolling", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8"), script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/weakest-rows-1337.css"), "utf8");
  assert.match(html, /weakest-rows-1337\.css[^\n]*data-problem-ids="1337"/);
  assert.match(html, /renderer-weakest-rows-1337\.js[^\n]*data-problem-ids="1337"/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /(?:renderer-)?weakest-rows-1337\.(?:css|js)/);
  assert.match(script, /Boolean\(step.weakRows1337View\)[^\n]*renderWeakestRows1337\(step\)/);
  assert.match(css, /\.code-panel\s*\{[^}]*overflow-x:auto/);
  assert.match(css, /\.code-line\s*\{[^}]*width:max-content; white-space:pre/);
});
