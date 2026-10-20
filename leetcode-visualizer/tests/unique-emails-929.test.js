const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[929];

function oracle(emails) {
  return new Set(emails.map(email => {
    let result = "", at = email.indexOf("@");
    for (let i = 0; i < at; i++) {
      if (email[i] === "+") break;
      if (email[i] !== ".") result += email[i];
    }
    return result + email.slice(at);
  })).size;
}

const cases = [problem.defaultInput, ["a@leetcode.com", "b@leetcode.com", "c@leetcode.com"],
  ["a.b+x.y+z@lee.tcode.com", "ab@lee.tcode.com", "ab@leetcode.com"],
  ["a@b.com", "a@b.com"], ["a+b.c@d+e.com", "a@d+e.com", "a@de.com"],
  ["a..b@x.com", "ab@x.com", "a.b+one@x.com"], [".@x.com", ".+a@x.com"]];
let seed = 929;
function random(n) { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % n; }
for (let trial = 0; trial < 80; trial++) cases.push(Array.from({ length: 1 + random(8) }, () => {
  let local = "abc"[random(3)];
  for (let j = 0, n = random(12); j < n; j++) local += "abc.+"[random(5)];
  return `${local}@${["x.com", "x.y.com", "xy.com", "x+y.com"][random(4)]}`;
}));

test("929 normalizes only local and counts unique destinations against a character scanner", () => {
  assert.equal(problem.builder(problem.defaultInput).answer, 2);
  for (const emails of cases) {
    const before = [...emails], run = problem.builder(emails);
    assert.equal(run.answer, oracle(emails));
    assert.deepEqual(emails, before);
    assert.equal(run.steps.at(-1).final, true);
    assert.equal(run.steps.at(-1).uniqueEmail929View.seen.length, run.answer);
    for (const step of run.steps) {
      const view = step.uniqueEmail929View;
      assert.equal(step.codeLines.length, 1);
      assert.equal(view.source, problem.code[step.codeLines[0] - 1].trim());
      assert.equal(view.seen.length, oracle(view.history.map(item => item.email)));
      if (view.domain !== null) assert.equal(view.domain, emails[view.index].split("@")[1]);
    }
  }
});

test("929 every line and actual local variable agrees with CPython, including set snapshots", () => {
  const script = `import sys, json
data = json.load(sys.stdin)
ns = {}
exec(compile(data['source'], '<emails929>', 'exec'), ns)
results = []
for emails in data['cases']:
    events, pending = [], [None]
    def trace(frame, event, arg):
        if frame.f_code.co_filename == '<emails929>' and frame.f_code.co_name == 'numUniqueEmails' and event in ('line', 'return'):
            if pending[0] is not None:
                values = {k: v for k, v in frame.f_locals.items() if k != 'self'}
                events.append({'line': pending[0], 'locals': json.loads(json.dumps(values, default=lambda value: sorted(value)))})
            pending[0] = frame.f_lineno if event == 'line' else None
        return trace
    sys.settrace(trace)
    answer = ns['Solution']().numUniqueEmails(list(emails))
    sys.settrace(None)
    results.append({'answer': answer, 'events': events})
print(json.dumps(results))
`;
  const inputs = cases.slice(0, 12);
  const python = spawnSync(process.env.PYTHON || "python", ["-c", script], { input: JSON.stringify({ source: problem.code.join("\n"), cases: inputs }), encoding: "utf8" });
  assert.equal(python.status, 0, python.stderr);
  JSON.parse(python.stdout).forEach((actual, index) => {
    const run = problem.builder(inputs[index]);
    assert.equal(run.answer, actual.answer);
    const events = run.steps.map(step => ({ line: step.codeLines[0], locals: Object.fromEntries(step.vars.map(variable => [variable.name, variable.name === "seen" ? [...variable.rawValue].sort() : variable.value])) }));
    assert.deepEqual(events, actual.events, JSON.stringify(inputs[index]));
  });
});

test("929 insertions, duplicates, and transformation stages appear only after their executed lines", () => {
  const run = problem.builder(["t.e+st+more@x.y.com", "te@x.y.com"]);
  const find = (phase, index) => run.steps.find(step => step.uniqueEmail929View.phase === phase && step.uniqueEmail929View.index === index).uniqueEmail929View;
  assert.equal(find("split", 0).cutLocal, null);
  assert.equal(find("cut", 0).cutLocal, "t.e");
  assert.equal(find("cut", 0).cleanLocal, null);
  assert.equal(find("dots", 0).cleanLocal, "te");
  assert.equal(find("dots", 0).normalized, null);
  assert.deepEqual(find("join", 0).seen, []);
  assert.deepEqual(find("add", 0).seen, ["te@x.y.com"]);
  assert.equal(find("join", 1).duplicate, true);
  assert.equal(find("add", 1).seen.length, 1);
  assert.equal(find("add", 1).history.length, 2);
  assert.deepEqual(run.steps[0].vars.find(variable => variable.name === "seen").rawValue, []);
  assert.deepEqual(run.steps[0].uniqueEmail929View.history, []);
});

test("929 every frame renders in both languages, with removed local characters and separate domains", () => {
  const host = { innerHTML: "" };
  const context = { lang: "vi", $: () => host, escapeHtml: value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;") };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-unique-emails-929.js"), "utf8"), context);
  const run = problem.builder(problem.defaultInput);
  for (const language of ["vi", "en"]) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderUniqueEmail929View(step);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
      assert.match(host.innerHTML, /ue929-line/);
      if (step.uniqueEmail929View.phase === "dots") {
        if (step.uniqueEmail929View.cutLocal.includes(".")) assert.match(host.innerHTML, /ue929-char removed/);
        assert.match(host.innerHTML, /ue929-char ignored/);
      }
    }
    assert.match(host.innerHTML, /len\(seen\) = <b>2<\/b>/);
    assert.match(host.innerHTML, /testemail@leetcode.com/);
    assert.match(host.innerHTML, /testemail@lee.tcode.com/);
    assert.match(host.innerHTML, /(?:trùng|duplicate) · \+0/);
  }
});

test("929 validates the stated visualization bounds and supplies live Python arguments", () => {
  for (const input of [[], ["invalid"], ["+a@x.com"], ["a@@x.com"], ["A@x.com"], ["a@x.org"], ["a@.com"], ["a".repeat(95) + "@x.com"], Array(21).fill("a@x.com")]) {
    assert.throws(() => problem.builder(input), /#929/);
  }
  assert.equal(problem.builder(Array(20).fill("a@x.com")).answer, 1);
  assert.deepEqual(problem.liveArgs(problem.defaultInput), [problem.defaultInput]);
  const { extractLiveMethod } = require("../live-args");
  assert.deepEqual(extractLiveMethod(problem), { name: "numUniqueEmails", params: ["emails"] });
  assert.equal(problem.debugMode, "line-by-line");
});
