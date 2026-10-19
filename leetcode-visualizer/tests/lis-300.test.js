const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[300];

function exhaustive(nums) {
  let best = 0;
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    let previous = -Infinity, size = 0, valid = true;
    for (let i = 0; i < nums.length; i++) if (mask & 1 << i) {
      if (nums[i] <= previous) { valid = false; break; }
      previous = nums[i]; size++;
    }
    if (valid) best = Math.max(best, size);
  }
  return best;
}

function validPath(nums, path) {
  return path.every((index, i) => index >= 0 && index < nums.length && (!i || index > path[i - 1] && nums[index] > nums[path[i - 1]]));
}

test("300 keeps both approaches correct, including negatives, duplicates and actual LIS witnesses", () => {
  let seed = 300;
  const cases = [problem.defaultInput, [1], [2, 2, 2], [3, 5, 6, 2], [-3, -2, -2, 0], [5, 4, 3, 2], [1, 2, 3, 4]];
  for (let trial = 0; trial < 100; trial++) cases.push(Array.from({ length: 1 + trial % 8 }, () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % 11 - 5; }));
  for (const nums of cases) for (const approach of [1, 2]) {
    const original = [...nums], run = problem.builder(nums, { approach });
    assert.equal(run.answer, exhaustive(nums));
    assert.deepEqual(nums, original);
    assert.equal(run.chain.length, run.answer);
    assert.ok(validPath(nums, run.chain));
    for (const step of run.steps) {
      assert.equal(step.codeLines.length, 1);
      assert.equal(step.codeBlock, approach);
      assert.ok(validPath(nums, step.lis300View.witness));
      if (approach === 1 && step.lis300View.dp.length && step.lis300View.end >= 0) {
        assert.equal(step.lis300View.witness.length, step.lis300View.dp[step.lis300View.end]);
      }
    }
  }
  const tailCase = problem.builder([3, 5, 6, 2], { approach: 2 });
  assert.deepEqual(tailCase.steps.at(-1).lis300View.tails, [2, 5, 6]);
  assert.deepEqual(tailCase.chain.map(i => [3, 5, 6, 2][i]), [3, 5, 6]);
});

test("300 line numbers and every variable snapshot match actual Python execution", () => {
  const cases = [problem.defaultInput, [1], [2, 2, 2], [-2, -1, -1, 0], [3, 5, 6, 2], [3, 2, 1]];
  const script = `import sys, json
data = json.load(sys.stdin)
results = []
for source in data['sources']:
    namespace = {}
    exec(compile(source, '<lis300>', 'exec'), namespace)
    for nums in data['cases']:
        events = []
        pending = [None]
        def trace(frame, event, arg):
            if frame.f_code.co_filename == '<lis300>' and frame.f_code.co_name == 'lengthOfLIS':
                if event in ('line', 'return'):
                    if pending[0] is not None:
                        values = {k: v for k, v in frame.f_locals.items() if k != 'self'}
                        events.append({'line': pending[0], 'locals': json.loads(json.dumps(values))})
                    pending[0] = frame.f_lineno if event == 'line' else None
            return trace
        sys.settrace(trace)
        answer = namespace['Solution']().lengthOfLIS(list(nums))
        sys.settrace(None)
        results.append({'answer': answer, 'events': events})
print(json.dumps(results))
`;
  const execution = spawnSync(process.env.PYTHON || "python", ["-c", script], { input: JSON.stringify({ sources: [problem.code.join("\n"), problem.code2.join("\n")], cases }), encoding: "utf8" });
  assert.equal(execution.status, 0, execution.stderr);
  const expected = JSON.parse(execution.stdout);
  let index = 0;
  for (const approach of [1, 2]) for (const nums of cases) {
    const run = problem.builder(nums, { approach }), real = expected[index++];
    assert.equal(run.answer, real.answer);
    assert.deepEqual(run.steps.map(step => ({ line: step.codeLines[0], locals: Object.fromEntries(step.vars.map(v => [v.name, v.value])) })), real.events, `approach ${approach}, nums=${nums}`);
  }
});

test("300 renderer shows candidate comparisons, dp transitions and truthful tails in both languages", () => {
  const host = { innerHTML: "" };
  const context = { lang: "vi", $: () => host, escapeHtml: value => String(value).replaceAll("<", "&lt;").replaceAll(">", "&gt;") };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-lis-300.js"), "utf8"), context);
  for (const lang of ["vi", "en"]) for (const approach of [1, 2]) {
    context.lang = lang;
    const run = problem.builder(problem.defaultInput, { approach });
    for (const step of run.steps) {
      context.renderLis300View(step);
      assert.match(host.innerHTML, /l300-line/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
      if (step.lis300View.event === "compare" && approach === 1 && !step.lis300View.comparison) assert.match(host.innerHTML, /Bỏ qua dòng 8|Skip line 8/);
      if (approach === 2) assert.match(host.innerHTML, /tails is not necessarily|tails không nhất thiết/);
    }
    assert.match(host.innerHTML, /l300-result/);
  }
});

test("300 validates explicit visualization bounds", () => {
  for (const input of [[], [1.5], [10001], [-10001], Array(41).fill(1)]) assert.throws(() => problem.builder(input), /#300/);
  assert.equal(problem.debugMode, "line-by-line");
});
