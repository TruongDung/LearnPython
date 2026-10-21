const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync, spawn } = require("node:child_process");
const fs = require("node:fs"), vm = require("node:vm"), path = require("node:path");
const problem = require("../problems").SUPPORTED[560];
const cases = [[[1,1,1],2], [[1,2,3],3], [[1,-1,0],0], [[0,0,0],0], [[0],0], [[1],0], [[-1],-1], [[-1,-1,1],-1], [[1,2],9], [[3,4,7,2,-3,1,4,2],7], [[1000,-1000,1000],1000], [Array(30).fill(0),0], [Array(30).fill(-1000),-30000]];
let seed = 560;
for (let t = 0; t < 100; t++) {
  const nums = [];
  for (let i = 0; i <= t % 17; i++) { seed = (seed * 1664525 + 1013904223) >>> 0; nums.push(seed % 11 - 5); }
  cases.push([nums, t % 15 - 7]);
}
function oracle(nums, k) {
  const ranges = [];
  for (let end = 0; end < nums.length; end++) for (let start = 0; start <= end; start++) {
    let sum = 0; for (let i = start; i <= end; i++) sum += nums[i];
    if (sum === k) ranges.push({ start, end });
  }
  return ranges;
}

test("560 answers and every counted non-empty interval match an independent exhaustive oracle", () => {
  for (const [nums, k] of cases) {
    const input = [...nums], run = problem.builder(input, { k }), expected = oracle(nums, k);
    assert.equal(run.answer, expected.length, JSON.stringify([nums, k]));
    assert.deepEqual(run.steps.at(-1).subarray560View.found, expected);
    assert.deepEqual(input, nums); assert.equal(run.steps.filter(s => s.final).length, 1);
    for (const step of run.steps) {
      const v = step.subarray560View;
      assert.deepEqual(step.codeLines, [v.line]); assert.equal(v.source, problem.code[v.line - 1].trim());
      if (v.res !== null) assert.equal(v.found.length, v.res);
      for (const entry of v.entries) {
        assert.equal(entry.frequency, entry.positions.length);
        for (const boundary of entry.positions) assert.equal(v.prefixes[boundary], entry.sum);
      }
      if (v.lookup) {
        const old = v.prefixes.map((sum, b) => sum === v.lookup.need && b <= v.i ? b : null).filter(b => b !== null);
        assert.deepEqual(v.lookup.positions, old); assert.equal(v.lookup.hits, old.length);
      }
    }
  }
});

test("560 every Python statement, exhausted for header and complete immutable locals match CPython", () => {
  const python = `import sys,json
data=json.load(sys.stdin)
ns={}
exec(compile(data['code'],'<560>','exec'),ns)
out=[]
for nums,k in data['cases']:
    events,pending=[],None
    def trace(frame,event,arg):
        global pending
        if frame.f_code.co_filename!='<560>' or frame.f_code.co_name!='subarraySum': return trace
        if event in ('line','return'):
            if pending is not None:
                values=dict(frame.f_locals);values['self']={}
                events.append({'line':pending,'locals':json.loads(json.dumps(values))})
            pending=frame.f_lineno if event=='line' else None
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().subarraySum(nums,k)
    sys.settrace(None)
    out.append({'events':events,'answer':answer})
print(json.dumps(out))`;
  const execution = spawnSync("python", ["-c", python], { input: JSON.stringify({ code: problem.code.join("\n"), cases }), encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  assert.equal(execution.status, 0, execution.stderr);
  JSON.parse(execution.stdout).forEach((actual, i) => {
    const [nums, k] = cases[i], run = problem.builder(nums, { k });
    assert.equal(run.answer, actual.answer);
    assert.deepEqual(run.steps.map(step => ({ line: step.codeLines[0], locals: Object.fromEntries(step.vars.map(v => [v.name, v.rawValue])) })), actual.events, JSON.stringify(cases[i]));
  });
});

test("560 looks up before inserting the current prefix: duplicate sums count multiple ranges but never an empty one", () => {
  const run = problem.builder([0,0,0], { k: 0 }), at = event => run.steps.find(s => s.subarray560View.i === 2 && s.subarray560View.event === event).subarray560View;
  assert.deepEqual(at("lookup").lookup, { need: 0, hits: 3, positions: [0,1,2] });
  assert.equal(at("lookup").res, 3); assert.equal(at("lookup").entries[0].frequency, 3);
  assert.deepEqual(at("count").addition, { before: 3, hits: 3, after: 6 });
  assert.equal(at("count").entries[0].frequency, 3);
  assert.equal(at("store").entries[0].frequency, 4); assert.equal(at("store").lookup.hits, 3);
  assert.deepEqual(at("store").lookup.positions, [0,1,2]); assert.deepEqual(at("store").store, { sum: 0, boundary: 3, before: 3, after: 4 });
  assert.deepEqual(run.steps[0].subarray560View.entries, [{ sum: 0, frequency: 1, positions: [0] }]);
  assert.deepEqual(run.steps[0].vars.map(v => v.name), ["self", "nums", "k", "count"]);
  const loop = run.steps.find(s => s.subarray560View.event === "loop" && s.subarray560View.i === 1);
  assert.equal(loop.subarray560View.lookup, null); assert.equal(loop.subarray560View.need, null);
  assert.ok(loop.vars.some(v => v.name === "hits" && v.rawValue === 1)); // Actual old local remains until reassigned.
});

test("560 validates official bounds consistently for solve/editor and preserves signed inputs without truncating k", () => {
  assert.deepEqual(problem.liveArgs([-1,0,1], { k: -1 }), [[-1,0,1],-1]);
  assert.deepEqual(problem.liveArgs([1,1,1]), [[1,1,1],2]);
  for (const nums of [null, [], "1,2", [true], [null], [1.2], [1001], [-1001], Array(20001).fill(0)]) {
    assert.throws(() => problem.builder(nums, { k: 0 })); assert.throws(() => problem.liveArgs(nums, { k: 0 }));
  }
  for (const k of ["2", 1.2, true, null, NaN, Infinity, 10000001, -10000001]) {
    assert.throws(() => problem.builder([1], { k })); assert.throws(() => problem.liveArgs([1], { k }));
  }
});

test("560 counts all 20000 numbers and huge numbers of intervals while explicitly bounding only the picture", () => {
  const n = 20000;
  for (const [nums, k, answer] of [[Array(n).fill(0),0,n*(n+1)/2], [Array(n).fill(1000),10000000,10001], [Array(n).fill(-1000),-10000000,10001], [Array.from({ length:n }, (_,i) => i%2 ? -1 : 1),0,100000000]]) {
    const run = problem.builder(nums, { k }), v = run.steps[0].subarray560View;
    assert.equal(run.answer, answer); assert.equal(run.steps.length, 1); assert.equal(v.total, n); assert.equal(v.mode, "summary");
    assert.equal(v.nums.length, 12); assert.deepEqual(run.steps[0].codeLines, []); assert.deepEqual(run.steps[0].vars, []);
  }
});

function renderer() {
  const listeners = {}, examples = [], input = { value: null }, k = { value: null };
  const host = { innerHTML: "", querySelector: selector => ({ clientWidth: 600, addEventListener: (_, cb) => { listeners[selector] = cb; } }), querySelectorAll: () => Array.from({ length: 6 }, (_, i) => ({ dataset: { s560Example: String(i) }, addEventListener: (_, cb) => { examples[i] = cb; } })) };
  const context = { lang: "vi", $: id => id === "arrInput" ? input : id === "extraParams" ? { querySelector: () => k } : host, escapeHtml: s => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;"), stopPlay() {}, renderStep() {}, runViz() {}, steps: [], stepIndex: 0 };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-subarray-sum-560.js"), "utf8"), context);
  return { context, host, listeners, examples, input, k };
}

test("560 pictures render every stage in both languages, distinguish lookup from storage, and wire examples plus navigation", () => {
  const { context, host, listeners, examples, input, k } = renderer();
  for (const lang of ["vi", "en"]) for (const [nums, k] of [...cases.slice(0, 14), [Array(31).fill(0),0]]) {
    context.lang = lang;
    for (const step of problem.builder(nums, { k }).steps) {
      context.renderSubarray560Pictures(step); const v = step.subarray560View;
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
      assert.equal((host.innerHTML.match(/class="s560-num[ "]/g) || []).length, v.nums.length);
      assert.equal((host.innerHTML.match(/class="s560-range"/g) || []).length, Math.min(6, v.lookup?.hits || 0));
      if (step.final) assert.ok(host.innerHTML.includes(`return ${v.res}`));
      if (v.mode === "summary") assert.match(host.innerHTML, /≤30/);
      if (v.store) assert.match(host.innerHTML, /s560-entry[^\"]*updated/);
      const layout = context.subarray560Geometry(v); assert.ok(layout.height >= 225);
      assert.ok(40 + v.nums.length * layout.gap < layout.width);
    }
  }
  context.steps = problem.builder([1,1,1], { k:2 }).steps; context.renderSubarray560Pictures(context.steps[0]);
  listeners["[data-s560-next]"](); assert.equal(context.steps[context.stepIndex].subarray560View.event, "store"); assert.equal(context.steps[context.stepIndex].subarray560View.i, 0);
  listeners["[data-s560-result]"](); assert.equal(context.stepIndex, context.steps.length - 1);
  examples[1](); assert.equal(input.value, "1,-1,0"); assert.equal(k.value, 0);
  examples[4](); assert.equal(input.value, "-1,-1,1"); assert.equal(k.value, -1);
});

test("560 actual editable-code runner receives nums/k, records real local values and follows code edits", () => {
  const source = fs.readFileSync(require.resolve("../public/live-editor.js"), "utf8"), tracer = vm.runInNewContext(source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1]);
  const python = tracer + `\nimport json,sys\ndata=json.load(sys.stdin)\nprint(json.dumps([__viz_run_trace(data['code'],'subarraySum',args) for args in data['args']]))`;
  for (const edited of [false, true]) {
    const code = problem.code.join("\n").replace("return res", edited ? "return res + 1" : "return res");
    const execution = spawnSync("python", ["-c", python], { input: JSON.stringify({ code, args: cases.slice(0, 13).map(([nums,k]) => problem.liveArgs(nums,{ k })) }), encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
    assert.equal(execution.status, 0, execution.stderr);
    JSON.parse(execution.stdout).forEach((run, i) => { const [nums,k] = cases[i]; assert.equal(run.result, oracle(nums,k).length + (edited ? 1 : 0)); assert.equal(run.trace[0].line, 3); assert.deepEqual(run.trace[0].vars.nums, nums); assert.equal(run.trace[0].vars.k, k); });
  }
});

test("560 HTTP metadata, signed input/k, solve results, editor arguments, validation and lazy assets agree", async () => {
  const port = 42000 + Math.floor(Math.random() * 10000), root = path.resolve(__dirname, "..");
  const server = spawn(process.execPath, ["server.js"], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: "pipe" });
  let logs = ""; server.stderr.on("data", data => { logs += data; }); const url = `http://localhost:${port}`;
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      if (server.exitCode !== null) throw new Error(logs);
      try { ready = (await fetch(url + "/api/problem/560")).ok; } catch {}
      if (ready) break; await new Promise(resolve => setTimeout(resolve, 50));
    }
    assert.equal(ready, true, logs);
    const meta = await (await fetch(url + "/api/problem/560")).json();
    assert.equal(meta.inputKind, "integer"); assert.equal(meta.debugMode, "line-by-line"); assert.deepEqual(meta.code, problem.code);
    const post = (suffix, input, k) => fetch(url + "/api/problem/560/" + suffix, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input, params: { k } }) });
    for (const [nums,k] of cases.slice(0, 11)) {
      const response = await post("solve", nums,k); assert.equal(response.status, 200);
      const run = await response.json(); assert.equal(run.answer, oracle(nums,k).length); assert.ok(run.steps[0].subarray560View);
      const args = await post("live-args", nums,k); assert.deepEqual((await args.json()).args, [nums,k]);
    }
    for (const [nums,k] of [[[],0], [[1001],0], [[1],10000001], [[1],1.5]]) for (const suffix of ["solve", "live-args"]) assert.equal((await post(suffix,nums,k)).status, 400);
    const html = await (await fetch(url)).text();
    assert.match(html, /<template[^>]+data-problem-assets="styles">[\s\S]*subarray-sum-560\.css/);
    assert.match(html, /<template[^>]+data-problem-assets="scripts">[\s\S]*renderer-subarray-sum-560\.js/);
    for (const asset of ["subarray-sum-560.css", "renderer-subarray-sum-560.js"]) assert.equal((await fetch(url + "/" + asset)).status, 200);
  } finally { server.kill(); }
});
