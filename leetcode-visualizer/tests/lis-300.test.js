const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { SUPPORTED } = require("../problems");
const problem = SUPPORTED[300];
const plusOneSample = [2, 1, 3, 2, 4, 3, 2, 5, 4, 5];
const plusKSample = [1, 3, 5, 2, 4, 6, 8];
const runApproach = (nums, approach, k = 2) => problem.builder(nums, { approach, k });

function exhaustive(nums, difference = null) {
  let best = 0;
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    let previous = -Infinity, size = 0, valid = true;
    for (let i = 0; i < nums.length; i++) if (mask & 1 << i) {
      if (size && (difference === null ? nums[i] <= previous : nums[i] !== previous + difference)) { valid = false; break; }
      previous = nums[i]; size++;
    }
    if (valid) best = Math.max(best, size);
  }
  return best;
}

function validPath(nums, path, difference = null) {
  return path.every((index, i) => index >= 0 && index < nums.length && (!i || index > path[i - 1] && (difference === null ? nums[index] > nums[path[i - 1]] : nums[index] === nums[path[i - 1]] + difference)));
}

test("300 exposes approaches 1 through 7", () => {
  assert.equal(SUPPORTED[9024], undefined);
  assert.deepEqual(problem.extraParams[0].options.map(option => option.value), [1, 2, 3, 4, 5, 6, 7]);
  assert.match(problem.extraParams[0].options[3].label.vi, /Biến thể \+1/);
  assert.ok(problem.code4);
  assert.ok(problem.code5);
  assert.ok(problem.code6);
  assert.ok(problem.code7);
  assert.ok(problem.builder4);
  assert.ok(problem.builder5);
  assert.ok(problem.builder6);
  assert.ok(problem.builder7);
  assert.equal(problem.extraParams[1].key, "k");
  assert.equal(problem.extraParams[1].default, 2);
  assert.match(problem.code4.join("\n"), /def lengthOfLIS\(self, nums\):/);
  for (const step of runApproach(plusOneSample, 4).steps) {
    assert.equal(step.lis300View.problemId, 300);
    assert.equal(step.lis300View.source, problem.code4[step.codeLines[0] - 1].trim());
  }
  for (const step of runApproach(plusOneSample, 5).steps) {
    assert.equal(step.lis300View.problemId, 300);
    assert.equal(step.lis300View.source, problem.code5[step.codeLines[0] - 1].trim());
  }
  for (const step of runApproach(plusKSample, 6, 2).steps) {
    assert.equal(step.lis300View.problemId, 300);
    assert.equal(step.lis300View.source, problem.code6[step.codeLines[0] - 1].trim());
  }
  for (const step of runApproach(plusKSample, 7, 2).steps) {
    assert.equal(step.lis300View.problemId, 300);
    assert.equal(step.lis300View.source, problem.code7[step.codeLines[0] - 1].trim());
  }
});

test("Subsequence visualizations keep the remaining approaches correct", () => {
  let seed = 300;
  const cases = [problem.defaultInput, [1], [2, 2, 2], [3, 5, 6, 2], [-3, -2, -2, 0], [5, 4, 3, 2], [1, 2, 3, 4]];
  for (let trial = 0; trial < 100; trial++) cases.push(Array.from({ length: 1 + trial % 8 }, () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % 11 - 5; }));
  for (const nums of cases) for (const approach of [1, 2, 3, 4, 5, 6, 7]) {
    const original = [...nums], run = runApproach(nums, approach);
    const returnsIndices = approach === 3 || approach === 5 || approach === 7;
    const difference = approach === 4 || approach === 5 ? 1 : approach === 6 || approach === 7 ? 2 : null;
    assert.equal(returnsIndices ? run.answer.length : run.answer, exhaustive(nums, difference));
    if (returnsIndices) assert.deepEqual(run.answer, run.chain);
    assert.deepEqual(nums, original);
    assert.equal(run.chain.length, returnsIndices ? run.answer.length : run.answer);
    assert.ok(validPath(nums, run.chain, difference));
    for (const step of run.steps) {
      assert.equal(step.codeLines.length, 1);
      assert.equal(step.codeBlock, approach);
      assert.ok(validPath(nums, step.lis300View.witness, difference));
      if ((approach === 1 || approach === 3) && step.lis300View.event !== "update" && step.lis300View.dp.length && step.lis300View.end >= 0) {
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
for spec in data['sources']:
    source = spec['code']
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
        answer = method(list(nums), *spec['args'])
        sys.settrace(None)
        results.append({'answer': answer, 'events': events})
print(json.dumps(results))
`;
  const sources = [problem.code, problem.code2, problem.code3, problem.code4, problem.code5]
    .map(code => ({ code: code.join("\n"), args: [] }));
  sources.push({ code: problem.code6.join("\n"), args: [2] });
  sources.push({ code: problem.code7.join("\n"), args: [2] });
  const execution = spawnSync(process.env.PYTHON || "python3", ["-c", script], { input: JSON.stringify({ sources, cases }), encoding: "utf8" });
  assert.equal(execution.status, 0, execution.stderr);
  const expected = JSON.parse(execution.stdout);
  let index = 0;
  for (const approach of [1, 2, 3, 4, 5, 6, 7]) for (const nums of cases) {
    const run = runApproach(nums, approach), real = expected[index++];
    assert.deepEqual(run.answer, real.answer);
    assert.deepEqual(run.steps.map(step => ({ line: step.codeLines[0], locals: Object.fromEntries(step.vars.map(v => [v.name, v.value])) })), real.events, `approach ${approach}, nums=${nums}`);
  }
});

test("300 renderer shows candidate comparisons, dp transitions and truthful tails in both languages", () => {
  const host = { innerHTML: "" };
  const context = { lang: "vi", $: () => host, escapeHtml: value => String(value).replaceAll("<", "&lt;").replaceAll(">", "&gt;") };
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  assert.match(html, /renderer-lis-300\.js\?v=subsequence-300-plus-k-indices-v3/);
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-lis-300.js"), "utf8"), context);
  for (const lang of ["vi", "en"]) for (const approach of [1, 2, 3, 4, 5, 6, 7]) {
    context.lang = lang;
    const sample = approach === 4 || approach === 5 ? plusOneSample : approach === 6 || approach === 7 ? plusKSample : problem.defaultInput;
    const run = runApproach(sample, approach, 2);
    for (const step of run.steps) {
      context.renderLis300View(step);
      assert.match(host.innerHTML, /l300-line/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
      if (step.lis300View.event === "compare" && (approach === 1 || approach === 3) && !step.lis300View.comparison) assert.match(host.innerHTML, approach === 3 ? /Bỏ qua dòng 10|Skip line 10/ : /Bỏ qua dòng 8|Skip line 8/);
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
    if (approach === 5) {
      assert.match(host.innerHTML, /end_at/);
      assert.match(host.innerHTML, /parent/);
      assert.match(host.innerHTML, /(?:Trả về index|Return indices).*\[1, 3, 5, 8, 9\]/s);
    }
    if (approach === 6) {
      assert.match(host.innerHTML, /dp\[num\] = dp\.get\(num - k, 0\) \+ 1/);
      assert.match(host.innerHTML, /k=2/);
      assert.match(host.innerHTML, /max_len = <strong>4<\/strong>/);
      assert.match(host.innerHTML, /dp\[8\]/);
    }
    if (approach === 7) {
      assert.match(host.innerHTML, /dp\[num\] = dp\.get\(num - k, 0\) \+ 1/);
      assert.match(host.innerHTML, /end_at/);
      assert.match(host.innerHTML, /parent/);
      assert.match(host.innerHTML, /k=2/);
      assert.match(host.innerHTML, /(?:Trả về index|Return indices).*\[3, 4, 5, 6\]/s);
    }
  }
});

test("300 code view keeps both scroll directions for long approach 5 lines", () => {
  const css = fs.readFileSync(require.resolve("../public/lis-300.css"), "utf8");
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  assert.match(css, /#vizPanel:has\(\.l300-viz\) \.code-panel \{[^}]*max-height:min\(58vh,520px\);[^}]*overflow:auto;/);
  assert.match(css, /#vizPanel:has\(\.l300-viz\) \.code-line \{[^}]*width:max-content;[^}]*white-space:pre;/);
  assert.match(css, /#vizPanel:has\(\.l300-viz\) \.code-line \.txt \{[^}]*min-width:max-content;[^}]*overflow-wrap:normal;/);
  assert.doesNotMatch(css, /#vizPanel:has\(\.l300-viz\) \.code-panel \{[^}]*overflow:visible/);
  assert.match(html, /lis-300\.css\?v=lis-300-fullscreen-editor-v3/);
});

test("300 opens the editor full-screen without wrapping for approaches 1 through 7", () => {
  const css = fs.readFileSync(require.resolve("../public/lis-300.css"), "utf8");
  const editor = fs.readFileSync(require.resolve("../public/live-editor.js"), "utf8");
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  assert.match(css, /body:has\(\.l300-viz\) \.viz-split\.live-editing \{[^}]*position:fixed;[^}]*inset:0;[^}]*width:100vw;[^}]*height:100dvh;/);
  assert.match(css, /\.viz-split\.live-editing \.live-editor-wrap \{[^}]*grid-template-rows:minmax\(0,1fr\) auto auto;[^}]*height:100%;/);
  assert.match(css, /\.viz-split\.live-editing \.monaco-editor-host \{[^}]*height:100%;/);
  assert.match(editor, /wordWrap: "off"/);
  assert.match(editor, /horizontal: "auto"/);
  assert.match(editor, /horizontalScrollbarSize: 10/);
  assert.match(html, /live-editor\.js\?[^"\n]*lis-fullscreen=v3/);
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
    assert.ok(validPath(nums, run.chain, 1));
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

test("300 approach 5 backtracks the hash-map variant into indices", () => {
  const source = problem.code5.join("\n");
  assert.match(source, /dp\[num\] = dp\.get\(num - 1, 0\) \+ 1/);
  assert.match(source, /parent\[i\] = end_at\.get\(num - 1, -1\)/);
  assert.match(source, /indices\.append\(best_end\)[\s\S]*indices\.reverse\(\)[\s\S]*return indices/);
  const cases = [
    [plusOneSample, [1, 3, 5, 8, 9]],
    [[1, 2, 3, 2, 4, 3, 5], [0, 1, 2, 4, 6]],
    [[-3, -2, -1, -2, 0, 1], [0, 1, 2, 4, 5]],
    [[2, 2, 2], [0]],
    [[3, 2, 1], [0]],
  ];
  for (const [nums, expected] of cases) {
    const run = problem.builder5(nums);
    assert.deepEqual(run.answer, expected);
    assert.deepEqual(run.chain, expected);
    assert.ok(validPath(nums, run.answer, 1));
    assert.ok(run.steps.every(step => step.codeBlock === 5 && step.lis300View.source === problem.code5[step.codeLines[0] - 1].trim()));
  }
  const { extractLiveMethod } = require("../live-args");
  assert.deepEqual(extractLiveMethod(problem, 5), { name: "lengthOfLIS", params: ["nums"] });
  const editorSource = fs.readFileSync(require.resolve("../public/live-editor.js"), "utf8");
  const context = { problemData: problem, $: () => ({ querySelector: () => ({ value: "5" }) }) };
  vm.createContext(context);
  vm.runInContext(editorSource.slice(editorSource.indexOf("function selectedLiveCodeBlock()"), editorSource.indexOf("function clearedSolutionSkeleton(")), context);
  assert.equal(context.selectedLiveCodeBlock(), 5);
  assert.equal(context.currentPrimaryCode(), problem.code5.join("\n"));
});

test("300 approach 6 generalizes the hash-map recurrence from +1 to +k", () => {
  const source = problem.code6.join("\n");
  assert.match(source, /def lengthOfLIS\(self, nums, k\):/);
  assert.match(source, /dp\[num\] = dp\.get\(num - k, 0\) \+ 1/);
  const cases = [
    [plusKSample, 2, 4],
    [[7, 5, 3, 1], -2, 4],
    [[2, 2, 2], 0, 3],
    [[1, 2, 4, 7], 3, 3],
  ];
  for (const [nums, k, expected] of cases) {
    const run = problem.builder6(nums, { k });
    assert.equal(run.answer, expected);
    assert.equal(run.chain.length, expected);
    assert.ok(validPath(nums, run.chain, k));
    assert.ok(run.steps.every(step => step.codeBlock === 6 && step.lis300View.gap === k && step.lis300View.source === problem.code6[step.codeLines[0] - 1].trim()));
  }
  assert.deepEqual(problem.liveArgs(plusKSample, { approach: 6, k: 2 }), [plusKSample, 2]);
  const { extractLiveMethod } = require("../live-args");
  assert.deepEqual(extractLiveMethod(problem, 6), { name: "lengthOfLIS", params: ["nums", "k"] });
  const editorSource = fs.readFileSync(require.resolve("../public/live-editor.js"), "utf8");
  const context = { problemData: problem, $: () => ({ querySelector: () => ({ value: "6" }) }) };
  vm.createContext(context);
  vm.runInContext(editorSource.slice(editorSource.indexOf("function selectedLiveCodeBlock()"), editorSource.indexOf("function clearedSolutionSkeleton(")), context);
  assert.equal(context.selectedLiveCodeBlock(), 6);
  assert.equal(context.currentPrimaryCode(), problem.code6.join("\n"));
});

test("300 approach 7 backtracks the +k hash-map variant into indices", () => {
  const source = problem.code7.join("\n");
  assert.match(source, /def lengthOfLIS\(self, nums, k\):/);
  assert.match(source, /dp\[num\] = dp\.get\(num - k, 0\) \+ 1/);
  assert.match(source, /parent\[i\] = end_at\.get\(num - k, -1\)/);
  assert.match(source, /indices\.append\(best_end\)[\s\S]*indices\.reverse\(\)[\s\S]*return indices/);
  const cases = [
    [plusKSample, 2, [3, 4, 5, 6]],
    [[7, 5, 3, 1], -2, [0, 1, 2, 3]],
    [[2, 2, 2], 0, [0, 1, 2]],
    [[1, 2, 4, 7], 3, [0, 2, 3]],
  ];
  for (const [nums, k, expected] of cases) {
    const run = problem.builder7(nums, { k });
    assert.deepEqual(run.answer, expected);
    assert.deepEqual(run.chain, expected);
    assert.ok(validPath(nums, run.answer, k));
    assert.ok(run.steps.every(step => step.codeBlock === 7 && step.lis300View.gap === k && step.lis300View.source === problem.code7[step.codeLines[0] - 1].trim()));
  }
  assert.deepEqual(problem.liveArgs(plusKSample, { approach: 7, k: 2 }), [plusKSample, 2]);
  const { extractLiveMethod } = require("../live-args");
  assert.deepEqual(extractLiveMethod(problem, 7), { name: "lengthOfLIS", params: ["nums", "k"] });
  const editorSource = fs.readFileSync(require.resolve("../public/live-editor.js"), "utf8");
  const context = { problemData: problem, $: () => ({ querySelector: () => ({ value: "7" }) }) };
  vm.createContext(context);
  vm.runInContext(editorSource.slice(editorSource.indexOf("function selectedLiveCodeBlock()"), editorSource.indexOf("function clearedSolutionSkeleton(")), context);
  assert.equal(context.selectedLiveCodeBlock(), 7);
  assert.equal(context.currentPrimaryCode(), problem.code7.join("\n"));

  const appCore = fs.readFileSync(require.resolve("../public/app-core.js"), "utf8");
  const server = fs.readFileSync(require.resolve("../server.js"), "utf8");
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  assert.match(appCore, /const code7 = .*problemData\.code7/);
  assert.match(appCore, /row\.dataset\.line7 = idx \+ 1/);
  assert.match(appCore, /codeBlock === 7 \? "line7"/);
  assert.match(server, /complexity7: problem\.complexity7/);
  assert.match(server, /requestedApproach === 7 && typeof problem\.builder7/);
  assert.match(html, /app-core\.js\?[^"\n]*code7=v1/);
  assert.match(html, /live-editor\.js\?[^"\n]*code7=v1/);
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
  for (const approach of [6, 7]) for (const k of [1.5, -10001, 10001, "x"]) assert.throws(() => problem.builder(plusKSample, { approach, k }), /#300/);
  assert.equal(problem.debugMode, "line-by-line");
});
