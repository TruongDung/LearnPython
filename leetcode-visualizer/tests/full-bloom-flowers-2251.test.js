"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[2251];

const view = (step) => step.fullBloomFlowers2251View;

test("2251 counts flowers in bloom at each person's visit time", () => {
  const result = problem.builder(problem.defaultInput);
  assert.deepEqual(result.answer, [1, 2, 2, 2]);
  assert.deepEqual(problem.liveArgs(problem.defaultInput), [
    [[1, 6], [3, 7], [9, 12], [4, 13]],
    [2, 3, 7, 11],
  ]);
  assert.deepEqual(result.steps.at(-1).fullBloomFlowers2251View.answer, [1, 2, 2, 2]);
  assert.equal(result.steps.at(-1).final, true);
});

test("2251 preserves inclusive endpoints and handles duplicate intervals", () => {
  const result = problem.builder({
    flowers: [[1, 2], [2, 2], [2, 3], [2, 2]],
    people: [0, 1, 2, 3, 4],
  });
  assert.deepEqual(result.answer, [0, 1, 4, 1, 0]);

  const oneFlower = problem.builder({ flowers: [[5, 5]], people: [4, 5, 6] });
  assert.deepEqual(oneFlower.answer, [0, 1, 0]);
});

test("2251 validates input shapes, ranges, and visualization limits", () => {
  for (const invalid of [
    "not json",
    null,
    [],
    { flowers: [], people: [1] },
    { flowers: [[1, 2]], people: [] },
    { flowers: [[2, 1]], people: [1] },
    { flowers: [[-1, 2]], people: [1] },
    { flowers: [[1, 2, 3]], people: [1] },
    { flowers: [[1, 2]], people: [1.5] },
    { flowers: Array(13).fill([1, 2]), people: [1] },
    { flowers: [[1, 2]], people: Array(9).fill(1) },
  ]) {
    assert.throws(() => problem.builder(invalid), /2251:/);
    assert.throws(() => problem.builder2(invalid), /2251:/);
  }
});

test("2251 traces upper and lower bound searches and valid source lines", () => {
  const result = problem.builder(problem.defaultInput);
  const events = result.steps.map((step) => view(step).event);
  assert.ok(events.includes("search-starts"));
  assert.ok(events.includes("starts-count"));
  assert.ok(events.includes("search-ends"));
  assert.ok(events.includes("result"));
  for (const step of result.steps) {
    assert.ok(step.codeLines.length > 0);
    for (const line of step.codeLines) {
      assert.ok(line >= 1 && line <= problem.code.length, `invalid code line ${line}`);
    }
  }
});

test("2251 renderer shows every trace step in Vietnamese and English", () => {
  const host = { innerHTML: "" };
  const context = {
    lang: "en",
    $: () => host,
    escapeHtml: (value) => String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]),
    pick: (value) => value[context.lang],
  };
  vm.createContext(context);
  const source = fs.readFileSync(
    path.join(__dirname, "../public/renderer-full-bloom-flowers-2251.js"),
    "utf8",
  );
  vm.runInContext(source, context);
  const steps = [...problem.builder(problem.defaultInput).steps, ...problem.builder2(problem.defaultInput).steps];
  for (const language of ["vi", "en"]) {
    context.lang = language;
    for (const step of steps) {
      context.renderFullBloomFlowers2251View(step);
      assert.match(host.innerHTML, /fb2251-viz/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
      assert.equal((host.innerHTML.match(/class="fb2251-flower(?: |")/g) || []).length, 4);
      assert.equal((host.innerHTML.match(/class="fb2251-visitor(?: |")/g) || []).length, 4);
      if (view(step).method === 2) {
        assert.match(host.innerHTML, /bisect_right/);
        assert.match(host.innerHTML, /bisect_left/);
        assert.match(host.innerHTML, /fb2251-counts/);
        assert.equal((host.innerHTML.match(/class="fb2251-cut"/g) || []).length, Object.values(view(step).bounds).filter((count) => count !== null).length);
      }
    }
  }
  assert.match(host.innerHTML, /\[1, 2, 2, 2\]/);
});

test("2251 bisect approach keeps equal end times in bloom and preserves visitor order", () => {
  const cases = [
    { flowers: [[1, 2], [2, 2], [2, 3], [2, 2]], people: [4, 2, 0, 3, 1, 2] },
    { flowers: [[5, 5]], people: [4, 5, 6] },
    { flowers: [[0, 0], [0, 1000000000], [1000000000, 1000000000]], people: [1000000000, 0, 1] },
    JSON.parse(problem.defaultInput),
  ];
  for (const input of cases) {
    const original = JSON.stringify(input);
    const run = problem.builder2(input);
    const expected = input.people.map((time) => input.flowers.filter(([start, end]) => start <= time && time <= end).length);
    assert.deepEqual(run.answer, expected);
    assert.deepEqual(run.answer, problem.builder(input).answer);
    assert.equal(JSON.stringify(input), original);
    for (const step of run.steps) {
      const frame = view(step);
      assert.equal(step.codeBlock, 2);
      assert.ok(step.codeLines.every((line) => problem.code2[line - 1]?.trim()));
      if (frame.activePerson !== null) {
        const time = input.people[frame.activePerson];
        if (frame.bounds.starts !== null) assert.equal(frame.bounds.starts, input.flowers.filter(([start]) => start <= time).length);
        if (frame.bounds.ends !== null) assert.equal(frame.bounds.ends, input.flowers.filter(([, end]) => end < time).length);
      }
      if (frame.event === "person") assert.deepEqual(frame.bounds, { starts: null, ends: null });
    }
    assert.deepEqual(view(run.steps[0]).answers, Array(input.people.length).fill(null));
    assert.deepEqual(view(run.steps.at(-1)).answer, expected);
    const firstBound = run.steps.find((step) => view(step).event === "bisect-starts");
    assert.equal(view(firstBound).bounds.ends, null);
  }
});

test("2251 both approaches agree with a brute-force oracle on deterministic random intervals", () => {
  let seed = 2251;
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  for (let sample = 0; sample < 100; sample++) {
    const input = {
      flowers: Array.from({ length: 1 + next() % 12 }, () => { const a = next() % 10, b = next() % 10; return [Math.min(a, b), Math.max(a, b)]; }),
      people: Array.from({ length: 1 + next() % 8 }, () => next() % 12),
    };
    const expected = input.people.map((time) => input.flowers.filter(([start, end]) => start <= time && time <= end).length);
    for (const builder of [problem.builder, problem.builder2]) assert.deepEqual(builder(JSON.stringify(input)).answer, expected);
  }
});

test("2251 displayed bisect Python returns the same answers and insertion indices", () => {
  const cases = [JSON.parse(problem.defaultInput), { flowers: [[2, 2], [2, 2], [1, 2]], people: [3, 2, 0, 1, 2] }, { flowers: [[0, 1000000000]], people: [0, 1000000000] }];
  const source = `${problem.code2.join("\n")}\nimport json, sys\nresults = []\nfor case in json.load(sys.stdin):\n    starts = sorted(s for s, e in case['flowers'])\n    ends = sorted(e for s, e in case['flowers'])\n    results.append({'answer': Solution().fullBloomFlowers(*[case['flowers'], case['people']]), 'bounds': [[bisect_right(starts, t), bisect_left(ends, t)] for t in case['people']]})\nprint(json.dumps(results))`;
  const execution = spawnSync("python3", ["-c", source], { input: JSON.stringify(cases), encoding: "utf8" });
  assert.equal(execution.status, 0, execution.stderr);
  const results = JSON.parse(execution.stdout);
  cases.forEach((input, index) => {
    const run = problem.builder2(input);
    assert.deepEqual(run.answer, results[index].answer);
    assert.deepEqual(run.steps.filter((step) => view(step).event === "result").map((step) => [view(step).bounds.starts, view(step).bounds.ends]), results[index].bounds);
    assert.deepEqual(problem.liveArgs(input), [input.flowers, input.people]);
  });
});

test("2251 is registered with problem-lazy assets and its renderer", () => {
  const root = path.resolve(__dirname, "..");
  const html = fs.readFileSync(path.join(root, "public/index.html"), "utf8");
  const activeHtml = html.replace(/<template[\s\S]*?<\/template>/g, "");
  const script = fs.readFileSync(path.join(root, "public/script.js"), "utf8");
  const problemIndex = fs.readFileSync(path.join(root, "problems/index.js"), "utf8");
  assert.match(html, /<template id="problemVisualizationStyles"[\s\S]*full-bloom-flowers-2251\.css[\s\S]*<\/template>/);
  assert.match(html, /<template id="problemVisualizationScripts"[\s\S]*renderer-full-bloom-flowers-2251\.js[\s\S]*<\/template>/);
  assert.doesNotMatch(activeHtml, /full-bloom-flowers-2251\.(?:css|js)/);
  assert.match(script, /step\.fullBloomFlowers2251View[\s\S]*renderFullBloomFlowers2251View\(step\)/);
  assert.match(problemIndex, /require\("\.\/full-bloom-flowers-2251"\)/);
});
