const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync, spawn } = require("node:child_process");
const fs = require("node:fs"), vm = require("node:vm"), path = require("node:path");
const problem = require("../problems").SUPPORTED[8];
const cases = ["", " ", "   ", "+", "-", "42", "   -042", "   -042xyz", "1337c0d3", "0-1", "words and 987", "+-12", "--12", "-+12", "  +0 1", ".1", "1.2", "-0", "00000", "2147483646", "2147483647", "2147483648", "-2147483647", "-2147483648", "-2147483649", "0000000000000000000000001", "9".repeat(200), "0".repeat(200), " ".repeat(199) + "1"];
const expected = s => {
  const match = /^ *([+-]?)([0-9]+)/.exec(s);
  if (!match) return 0;
  const value = BigInt((match[1] === "-" ? "-" : "") + match[2]);
  return Number(value < -2147483648n ? -2147483648n : value > 2147483647n ? 2147483647n : value);
};

test("8 parses spaces, one sign and contiguous digits, clamps exact 32-bit boundaries without precision loss", () => {
  let seed = 8;
  const alphabet = "0123456789   +-abc.";
  const random = [];
  for (let i = 0; i < 500; i++) {
    let s = "";
    for (let j = 0; j < i % 70; j++) { seed = (seed * 1664525 + 1013904223) >>> 0; s += alphabet[seed % alphabet.length]; }
    random.push(s);
  }
  for (const s of [...cases, ...random]) {
    const run = problem.builder(s);
    assert.equal(run.answer, expected(s), JSON.stringify(s));
    assert.equal(run.steps.at(-1).final, true);
    assert.equal(run.steps.filter(step => step.final).length, 1);
    for (const step of run.steps) {
      const v = step.atoi8View;
      assert.deepEqual(step.codeLines, [v.line]);
      assert.equal(v.source, problem.code[v.line - 1].trim());
      assert.equal(v.s, s);
      assert.ok(v.i >= 0 && v.i <= s.length);
      assert.ok(v.value === null || Number.isSafeInteger(v.value) && v.value <= 2147483648);
      if (!step.final) assert.equal(v.answer, null);
      if (v.math) assert.equal(v.math.candidate, v.math.before * 10 + v.math.digit);
    }
  }
  assert.doesNotMatch(problem.code.join("\n"), /\bint\(|\.isdigit\(/);
});

test("8 every executed line and complete post-statement locals match CPython, including loop exits", () => {
  const python = `import sys,json
data=json.load(sys.stdin)
ns={}
exec(compile(data['code'],'<atoi8>','exec'),ns)
out=[]
for s in data['cases']:
    events,pending=[],None
    def trace(frame,event,arg):
        global pending
        if frame.f_code.co_filename!='<atoi8>' or frame.f_code.co_name!='myAtoi': return trace
        if event in ('line','return'):
            if pending is not None:
                values=dict(frame.f_locals)
                values['self']={}
                events.append({'line':pending,'locals':values})
            pending=frame.f_lineno if event=='line' else None
        return trace
    sys.settrace(trace)
    answer=ns['Solution']().myAtoi(s)
    sys.settrace(None)
    out.append({'events':events,'answer':answer})
print(json.dumps(out))`;
  const execution = spawnSync("python", ["-c", python], { input: JSON.stringify({ code: problem.code.join("\n"), cases }), encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  assert.equal(execution.status, 0, execution.stderr);
  JSON.parse(execution.stdout).forEach((actual, i) => {
    const run = problem.builder(cases[i]);
    assert.equal(run.answer, actual.answer);
    assert.deepEqual(run.steps.map(step => ({ line: step.codeLines[0], locals: Object.fromEntries(step.vars.map(v => [v.name, v.rawValue])) })), actual.events, JSON.stringify(cases[i]));
  });
});

test("8 pictures distinguish candidate from stored value, overflow from accepted digits, and the sign from spaces", () => {
  const run = problem.builder("   -042xyz");
  assert.deepEqual(run.steps.find(s => s.atoi8View.event === "read-sign").atoi8View.consumed.slice(0, 4), ["space", "space", "space", "sign"]);
  const append = run.steps.find(s => s.atoi8View.event === "append" && s.atoi8View.value === 4).atoi8View;
  assert.equal(append.i, 5); assert.equal(append.math.index, 5); assert.equal(append.math.appended, true);
  assert.equal(run.steps.at(-1).atoi8View.reason, "non-digit");
  assert.deepEqual(run.steps.at(-1).atoi8View.consumed, ["space", "space", "space", "sign", "digit", "digit", "digit", null, null, null]);
  assert.deepEqual(run.steps[0].atoi8View.consumed, Array(10).fill(null));
  for (const s of ["2147483648", "-2147483649"]) {
    const last = problem.builder(s).steps.at(-1), v = last.atoi8View;
    assert.equal(v.overflow, true); assert.equal(v.consumed[v.i], null);
    assert.ok(v.math.candidate > v.limit); assert.ok(v.value < v.limit);
    assert.equal(v.math.appended, false);
  }
  assert.equal(problem.builder("-2147483648").steps.at(-1).atoi8View.overflow, false);
});

test("8 preserves raw leading/trailing spaces and empty string for the editor; rejects invalid inputs consistently", () => {
  assert.equal(problem.preserveInputWhitespace, true); assert.equal(problem.allowEmptyInput, true);
  for (const s of cases) assert.deepEqual(problem.liveArgs(s), [s]);
  assert.deepEqual(problem.liveArgs("  +42  "), ["  +42  "]);
  for (const input of [null, undefined, 42, [], "x".repeat(201), "\t42", "２", '"42"']) {
    assert.throws(() => problem.builder(input)); assert.throws(() => problem.liveArgs(input));
  }
});

function renderer() {
  const listeners = {}, examples = [], input = { value: null };
  const host = { innerHTML: "", querySelector: selector => ({ addEventListener: (_, cb) => { listeners[selector] = cb; } }), querySelectorAll: () => Array.from({ length: 7 }, (_, i) => ({ dataset: { a8Example: String(i) }, addEventListener: (_, cb) => { examples[i] = cb; } })) };
  const context = { lang: "vi", $: id => id === "arrInput" ? input : host, escapeHtml: s => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;"), stopPlay() {}, renderStep() {}, runViz() {}, steps: [], stepIndex: 0 };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-atoi-8.js"), "utf8"), context);
  return { context, host, listeners, examples, input };
}

test("8 renders all frames in both languages, keeps pointer visible on 200 characters, and navigates actual trace steps", () => {
  const { context, host, listeners, examples, input } = renderer();
  for (const lang of ["vi", "en"]) for (const s of cases) for (const step of problem.builder(s).steps) {
    context.lang = lang; context.renderAtoi8Pictures(step);
    assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
    assert.match(host.innerHTML, /a8-pointer/);
    assert.ok(host.innerHTML.includes(`i = ${step.atoi8View.i}`));
    assert.ok((host.innerHTML.match(/class="a8-char/g) || []).length <= 11);
    if (step.final) assert.ok(host.innerHTML.includes(`return ${step.atoi8View.answer}`));
  }
  context.steps = problem.builder(problem.defaultInput).steps;
  context.renderAtoi8Pictures(context.steps[0]); listeners["[data-a8-next]"]();
  assert.equal(context.steps[context.stepIndex].atoi8View.i, 1);
  listeners["[data-a8-result]"](); assert.equal(context.stepIndex, context.steps.length - 1);
  examples[0](); assert.equal(input.value, "   -042xyz"); examples[6](); assert.equal(input.value, "");
});

test("8 actual editable-code tracer accepts raw strings, returns numbers and follows user edits", () => {
  const source = fs.readFileSync(require.resolve("../public/live-editor.js"), "utf8"), tracer = vm.runInNewContext(source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1]);
  const python = tracer + `\nimport json,sys\ndata=json.load(sys.stdin)\nprint(json.dumps([__viz_run_trace(data['code'],'myAtoi',args) for args in data['args']]))`;
  for (const edited of [false, true]) {
    const code = edited ? problem.code.join("\n").replace("return sign * value", "return sign * value + 1") : problem.code.join("\n");
    const execution = spawnSync("python", ["-c", python], { input: JSON.stringify({ code, args: cases.slice(0, 26).map(s => problem.liveArgs(s)) }), encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
    assert.equal(execution.status, 0, execution.stderr);
    JSON.parse(execution.stdout).forEach((run, i) => {
      const overflow = problem.builder(cases[i]).steps.at(-1).atoi8View.overflow;
      assert.equal(run.result, expected(cases[i]) + (edited && !overflow ? 1 : 0));
      assert.ok(run.trace.length > 0);
      assert.equal(run.trace[0].line, 3);
    });
  }
});

test("8 HTTP metadata, solve, live arguments and lazy visual assets agree with the displayed code", async () => {
  const port = 42000 + Math.floor(Math.random() * 10000), root = path.resolve(__dirname, "..");
  const server = spawn(process.execPath, ["server.js"], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: "pipe" });
  let logs = ""; server.stderr.on("data", data => { logs += data; });
  const url = `http://localhost:${port}`;
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      if (server.exitCode !== null) throw new Error(logs);
      try { ready = (await fetch(url + "/api/problem/8")).ok; } catch {}
      if (ready) break;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    assert.equal(ready, true, logs);
    const meta = await (await fetch(url + "/api/problem/8")).json();
    assert.equal(meta.preserveInputWhitespace, true); assert.equal(meta.allowEmptyInput, true); assert.deepEqual(meta.code, problem.code);
    for (const s of ["", "   -042xyz", "2147483648", "-2147483648", "0-1"]) {
      const post = suffix => fetch(url + "/api/problem/8/" + suffix, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input: s, params: {} }) });
      const solved = await post("solve"); assert.equal(solved.status, 200);
      const run = await solved.json(); assert.equal(run.answer, expected(s)); assert.equal(run.steps[0].atoi8View.s, s);
      const args = await post("live-args"); assert.deepEqual((await args.json()).args, [s]);
    }
    const html = await (await fetch(url)).text();
    assert.match(html, /<template[^>]+data-problem-assets="styles">[\s\S]*atoi-8\.css/);
    assert.match(html, /<template[^>]+data-problem-assets="scripts">[\s\S]*renderer-atoi-8\.js/);
    for (const asset of ["atoi-8.css", "renderer-atoi-8.js"]) assert.equal((await fetch(url + "/" + asset)).status, 200);
  } finally { server.kill(); }
});
