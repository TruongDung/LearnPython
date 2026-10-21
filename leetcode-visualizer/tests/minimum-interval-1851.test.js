"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const problem = require("../problems").SUPPORTED[1851];
const root = path.resolve(__dirname, "..");
const view = (step) => step.minimumInterval1851View;

function bruteForce(intervals, queries) {
  return queries.map((query) => {
    const lengths = intervals.filter(([left, right]) => left <= query && query <= right)
      .map(([left, right]) => right - left + 1);
    return lengths.length ? Math.min(...lengths) : -1;
  });
}

test("1851 solves official examples and preserves original query order", () => {
  const examples = [
    [{ intervals: [[1, 4], [2, 4], [3, 6], [4, 4]], queries: [2, 3, 4, 5] }, [3, 3, 1, 4]],
    [{ intervals: [[2, 3], [2, 5], [1, 8], [20, 25]], queries: [2, 19, 5, 22] }, [2, -1, 4, 6]],
  ];
  for (const [input, expected] of examples) {
    const run = problem.builder(input);
    assert.deepEqual(run.answer, expected);
    assert.deepEqual(view(run.steps.at(-1)).answer, expected);
    assert.deepEqual(problem.liveArgs(input), [input.intervals, input.queries]);
  }
});

test("1851 agrees with a deterministic brute-force oracle", () => {
  let seed = 1851;
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  for (let sample = 0; sample < 180; sample += 1) {
    const intervals = Array.from({ length: 1 + next() % 9 }, () => {
      const first = 1 + next() % 15;
      const second = 1 + next() % 15;
      return [Math.min(first, second), Math.max(first, second)];
    });
    const queries = Array.from({ length: 1 + next() % 8 }, () => 1 + next() % 18);
    assert.deepEqual(problem.builder({ intervals, queries }).answer, bruteForce(intervals, queries));
  }
});

test("1851 trace shows sorting, heap admission, expiry, and answers", () => {
  const run = problem.builder({ intervals: [[1, 2], [1, 10], [5, 5]], queries: [1, 5, 11] });
  const events = new Set(run.steps.map((step) => view(step).event));
  for (const event of ["sort", "query", "eligible", "push", "expired", "pop", "answer", "empty", "done"]) {
    assert.ok(events.has(event), event);
  }
  for (const step of run.steps) {
    assert.ok(step.codeLines.every((line) => line >= 1 && line <= problem.code.length));
    const frame = view(step);
    for (let index = 1; index < frame.heap.length; index += 1) {
      assert.ok(frame.heap[index - 1].length <= frame.heap[index].length);
    }
  }
});

test("1851 validates visualization inputs", () => {
  for (const input of [
    "bad json", null, [], { intervals: [], queries: [1] }, { intervals: [[1, 2]], queries: [] },
    { intervals: [[2, 1]], queries: [1] }, { intervals: [[0, 1]], queries: [1] },
    { intervals: [[1, 2, 3]], queries: [1] }, { intervals: [[1, 2]], queries: [1.5] },
    { intervals: Array(10).fill([1, 2]), queries: [1] }, { intervals: [[1, 2]], queries: Array(9).fill(1) },
  ]) assert.throws(() => problem.builder(input), /1851:/);
});

test("1851 displayed Python returns the same answers", () => {
  const cases = [
    JSON.parse(problem.defaultInput),
    { intervals: [[1, 2], [1, 2], [3, 9]], queries: [2, 8, 0 + 1, 10] },
  ];
  const source = `${problem.code.join("\n")}\nimport json, sys\nprint(json.dumps([Solution().minInterval(case['intervals'], case['queries']) for case in json.load(sys.stdin)]))`;
  const execution = spawnSync("python3", ["-c", source], { input: JSON.stringify(cases), encoding: "utf8" });
  assert.equal(execution.status, 0, execution.stderr);
  assert.deepEqual(JSON.parse(execution.stdout), cases.map(({ intervals, queries }) => bruteForce(intervals, queries)));
});

test("1851 renderer produces picture-first frames in both languages", () => {
  const host = { innerHTML: "" };
  const context = { lang: "en", $: () => host, Set };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, "public/renderer-minimum-interval-1851.js"), "utf8"), context);
  const steps = problem.builder(problem.defaultInput).steps;
  for (const language of ["en", "vi"]) {
    context.lang = language;
    for (const step of steps) {
      context.renderMinimumInterval1851View(step);
      assert.match(host.innerHTML, /mi1851-viz/);
      assert.match(host.innerHTML, /mi1851-road/);
      assert.match(host.innerHTML, /mi1851-heap/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
      assert.equal((host.innerHTML.match(/class="mi1851-lane"/g) || []).length, 4);
    }
  }
});

test("1851 assets are registered lazily and styles are responsive", () => {
  const html = fs.readFileSync(path.join(root, "public/index.html"), "utf8");
  const activeHtml = html.replace(/<template[\s\S]*?<\/template>/g, "");
  const script = fs.readFileSync(path.join(root, "public/script.js"), "utf8");
  const css = fs.readFileSync(path.join(root, "public/minimum-interval-1851.css"), "utf8");
  assert.match(html, /minimum-interval-1851\.css[^>]+data-problem-ids="1851"/);
  assert.match(html, /renderer-minimum-interval-1851\.js[^>]+data-problem-ids="1851"/);
  assert.doesNotMatch(activeHtml, /minimum-interval-1851/);
  assert.match(script, /step\.minimumInterval1851View[\s\S]*renderMinimumInterval1851View\(step\)/);
  assert.match(css, /\.mi1851-bar\.best/);
  assert.match(css, /@container\(max-width:540px\)/);
});
