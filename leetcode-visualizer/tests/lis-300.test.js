const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { SUPPORTED } = require("../problems");
const problem = SUPPORTED[300];
const plusOneSample = [2, 1, 3, 2, 4, 3, 2, 5, 4, 5];
const runApproach = (nums, approach) => problem.builder(nums, { approach });

function exhaustive(nums, unitStep = false) {
  let best = 0;
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    let previous = -Infinity, size = 0, valid = true;
    for (let i = 0; i < nums.length; i++) if (mask & 1 << i) {
      if (size && (unitStep ? nums[i] !== previous + 1 : nums[i] <= previous)) { valid = false; break; }
      previous = nums[i]; size++;
    }
    if (valid) best = Math.max(best, size);
  }
  return best;
}

function validPath(nums, path, unitStep = false) {
  return path.every((index, i) => index >= 0 && index < nums.length && (!i || index > path[i - 1] && (unitStep ? nums[index] === nums[path[i - 1]] + 1 : nums[index] > nums[path[i - 1]])));
}

test("300 exposes approaches 1, 2, 3 and 4", () => {
  assert.equal(SUPPORTED[9024], undefined);
  assert.deepEqual(problem.extraParams[0].options.map(option => option.value), [1, 2, 3, 4]);
  assert.match(problem.extraParams[0].options[3].label.vi, /Biến thể \+1/);
  assert.ok(problem.code4);
  assert.equal(problem.code5, undefined);
  assert.equal(problem.code6, undefined);
  assert.ok(problem.builder4);
  assert.equal(problem.builder5, undefined);
  assert.equal(problem.builder6, undefined);
  assert.match(problem.code4.join("\n"), /def lengthOfLIS\(self, nums\):/);
  for (const step of runApproach(plusOneSample, 4).steps) {
    assert.equal(step.lis300View.problemId, 300);
    assert.equal(step.lis300View.source, problem.code4[step.codeLines[0] - 1].trim());
  }
});

test("Subsequence visualizations keep the remaining approaches correct", () => {
  let seed = 300;
  const cases = [problem.defaultInput, [1], [2, 2, 2], [3, 5, 6, 2], [-3, -2, -2, 0], [5, 4, 3, 2], [1, 2, 3, 4]];
  for (let trial = 0; trial < 100; trial++) cases.push(Array.from({ length: 1 + trial % 8 }, () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % 11 - 5; }));
  for (const nums of cases) for (const approach of [1, 2, 3, 4]) {
    const original = [...nums], run = runApproach(nums, approach);
    const returnsIndices = approach === 3;
    assert.equal(returnsIndices ? run.answer.length : run.answer, exhaustive(nums, approach === 4));
    if (returnsIndices) assert.deepEqual(run.answer, run.chain);
    assert.deepEqual(nums, original);
    assert.equal(run.chain.length, returnsIndices ? run.answer.length : run.answer);
    assert.ok(validPath(nums, run.chain, approach === 4));
    for (const step of run.steps) {
      assert.equal(step.codeLines.length, 1);
      assert.equal(step.codeBlock, approach);
      assert.ok(validPath(nums, step.lis300View.witness, approach === 4));
      if (approach !== 2 && approach !== 4 && step.lis300View.event !== "update" && step.lis300View.dp.length && step.lis300View.end >= 0) {
        assert.equal(step.lis300View.witness.length, step.lis300View.dp[step.lis300View.end]);
      }
    }
  }
  const tailCase = problem.builder([3, 5, 6, 2], { approach: 2 });
  assert.deepEqual(tailCase.steps.at(-1).lis300View.tails, [2, 5, 6]);
  assert.deepEqual(tailCase.chain.map(i => [3, 5, 6, 2][i]), [3, 5, 6]);
});

test("300 line numbers and every variable snapshot match actual Python execution", () => {
  const cases = [problem.defaultInput, plusOneSample, [1], [2, 2, 2], [-2, -1, -1, 0], [3, 5, 6, 2], [3, 2, 1], [1, 3, 2, 4, 3, 5, 4]];
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
            if frame.f_code.co_filename == '<lis300>' and frame.f_code.co_name in ('lengthOfLIS', 'longestSubsequence'):
                if event in ('line', 'return'):
                    if pending[0] is not None:
                        values = {k: v for k, v in frame.f_locals.items() if k != 'self'}
                        events.append({'line': pending[0], 'locals': json.loads(json.dumps(values))})
                    pending[0] = frame.f_lineno if event == 'line' else None
            return trace
        sys.settrace(trace)
        solution = namespace['Solution']()
        method = getattr(solution, 'longestSubsequence', None) or solution.lengthOfLIS
        answer = method(list(nums))
        sys.settrace(None)
        results.append({'answer': answer, 'events': events})
print(json.dumps(results))
`;
  const execution = spawnSync(process.env.PYTHON || "python3", ["-c", script], { input: JSON.stringify({ sources: [problem.code, problem.code2, problem.code3, problem.code4].map(code => code.join("\n")), cases }), encoding: "utf8" });
  assert.equal(execution.status, 0, execution.stderr);
  const expected = JSON.parse(execution.stdout);
  let index = 0;
  for (const approach of [1, 2, 3, 4]) for (const nums of cases) {
    const run = runApproach(nums, approach), real = expected[index++];
    assert.deepEqual(run.answer, real.answer);
    assert.deepEqual(run.steps.map(step => ({ line: step.codeLines[0], locals: Object.fromEntries(step.vars.map(v => [v.name, v.value])) })), real.events, `approach ${approach}, nums=${nums}`);
  }
});

test("300 renderer shows candidate comparisons, dp transitions and truthful tails in both languages", () => {
  const host = { innerHTML: "" };
  const context = { lang: "vi", $: () => host, escapeHtml: value => String(value).replaceAll("<", "&lt;").replaceAll(">", "&gt;") };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-lis-300.js"), "utf8"), context);
  for (const lang of ["vi", "en"]) for (const approach of [1, 2, 3, 4]) {
    context.lang = lang;
    const run = runApproach(approach === 4 ? plusOneSample : problem.defaultInput, approach);
    for (const step of run.steps) {
      context.renderLis300View(step);
      assert.match(host.innerHTML, /l300-line/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
      if (step.lis300View.event === "compare" && approach !== 2 && !step.lis300View.comparison) assert.match(host.innerHTML, approach === 3 ? /Bỏ qua dòng 10|Skip line 10/ : /Bỏ qua dòng 8|Skip line 8/);
      if (step.lis300View.reconstructing && !step.final) assert.match(host.innerHTML, /l300-reconstruction/);
      if (approach === 2) assert.match(host.innerHTML, /tails is not necessarily|tails không nhất thiết/);
    }
    assert.match(host.innerHTML, /l300-result/);
    if (approach === 3) {
      assert.match(host.innerHTML, /index = \[2, 3, 5, 6\]/);
      assert.match(host.innerHTML, /(?:giá trị|values) = \[2, 5, 7, 101\]/);
      assert.match(host.innerHTML, /l300-index-history/);
      assert.match(host.innerHTML, /(?:Trả về index|Return indices).*\[2, 3, 5, 6\]/s);
    }
    if (approach === 4) {
      assert.match(host.innerHTML, /dp\[num\] = dp\.get\(num - 1, 0\) \+ 1/);
      assert.match(host.innerHTML, /max_len = <strong>5<\/strong>/);
      assert.match(host.innerHTML, /dp\[5\]/);
    }
  }
});

test("300 approach 4 uses the concise dp.get recurrence", () => {
  assert.match(problem.code4.join("\n"), /dp = \{\}[\s\S]*max_len = 0/);
  assert.match(problem.code4.join("\n"), /for num in nums:[\s\S]*dp\[num\] = dp\.get\(num - 1, 0\) \+ 1/);
  assert.doesNotMatch(problem.code4.join("\n"), /max\(dp\.get/);
  const cases = [
    [plusOneSample, 5],
    [[1, 2, 3, 2, 4, 3, 5], 5],
    [[-3, -2, -1, -2, 0, 1], 5],
    [[2, 2, 2], 1],
    [[3, 2, 1], 1],
  ];
  for (const [nums, expected] of cases) {
    const run = problem.builder4(nums);
    assert.equal(run.answer, expected);
    assert.equal(run.chain.length, expected);
    assert.ok(validPath(nums, run.chain, true));
    assert.ok(run.steps.every(step => step.codeBlock === 4 && step.lis300View.source === problem.code4[step.codeLines[0] - 1].trim()));
  }
  const { extractLiveMethod } = require("../live-args");
  assert.deepEqual(extractLiveMethod(problem, 4), { name: "lengthOfLIS", params: ["nums"] });
  const source = fs.readFileSync(require.resolve("../public/live-editor.js"), "utf8");
  const context = { problemData: problem, $: () => ({ querySelector: () => ({ value: "4" }) }) };
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf("function selectedLiveCodeBlock()"), source.indexOf("function clearedSolutionSkeleton(")), context);
  assert.equal(context.selectedLiveCodeBlock(), 4);
  assert.equal(context.currentPrimaryCode(), problem.code4.join("\n"));
});

test("300 approach 3 uses range(n) and lists only eligible indices checked so far", () => {
  assert.equal(problem.code3[4], "        parent = [-1] * n");
  assert.equal(problem.code3[6], "        for i in range(n):");
  assert.equal(problem.code3.at(-1), "        return indices");
  const nums = [3, 1, 2, 2, 4];
  const run = problem.builder3(nums);
  assert.equal(run.steps.find(step => step.lis300View.event === "outer").lis300View.i, 0);
  for (const step of run.steps) {
    const view = step.lis300View;
    view.eligibleByEnd.forEach((eligible, end) => {
      const expected = Array.from({ length: view.checkedByEnd[end] }, (_, j) => j).filter(j => nums[j] < nums[end]);
      assert.deepEqual(eligible, expected);
      assert.ok(eligible.every((j, k) => j < end && (!k || j > eligible[k - 1])));
    });
  }
  assert.deepEqual(run.steps.at(-1).lis300View.eligibleByEnd, [[], [], [1], [1], [0, 1, 2, 3]]);
  assert.deepEqual(run.chain, [1, 2, 4]);
  assert.deepEqual(run.answer, [1, 2, 4]);
  const sample = problem.builder3(problem.defaultInput);
  assert.deepEqual(sample.answer, [2, 3, 5, 6]);
  assert.deepEqual(sample.steps.filter(step => step.lis300View.event === "trace-append").map(step => step.lis300View.indices), [[6], [6, 5], [6, 5, 3], [6, 5, 3, 2]]);
  assert.deepEqual(sample.steps.at(-1).lis300View.indices, [2, 3, 5, 6]);
});

test("300 validates explicit visualization bounds", () => {
  for (const input of [[], [1.5], [10001], [-10001], Array(41).fill(1)]) assert.throws(() => problem.builder(input), /#300/);
  assert.equal(problem.debugMode, "line-by-line");
});
