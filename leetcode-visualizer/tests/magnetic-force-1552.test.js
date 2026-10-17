"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { SUPPORTED, CATEGORY_ORDER } = require("../problems");

const problem = SUPPORTED[1552];
const view = (step) => step.magnetic1552View;

function ballsAt(input, distance) {
  const position = [...input].sort((a, b) => a - b);
  let balls = 1;
  let last = position[0];
  for (const current of position.slice(1)) {
    if (current - last >= distance) {
      balls += 1;
      last = current;
    }
  }
  return balls;
}

function oracle(position, m) {
  const sorted = [...position].sort((a, b) => a - b);
  let answer = 1;
  for (let distance = 1; distance <= sorted.at(-1) - sorted[0]; distance += 1) {
    if (ballsAt(sorted, distance) >= m) answer = distance;
  }
  return answer;
}

function render(step, language = "vi") {
  const host = { innerHTML: "" };
  const context = { lang: language, document: { getElementById: (id) => id === "treeView" ? host : null } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-magnetic-force-1552.js"), "utf8"), context);
  context.renderMagneticForce1552View(JSON.parse(JSON.stringify(step)));
  return host.innerHTML;
}

test("1552 is registered as a Google-style maximize-minimum lesson", () => {
  assert.ok(problem);
  assert.equal(problem.slug, "magnetic-force-between-two-balls");
  assert.equal(problem.debugMode, "line-by-line");
  assert.equal(problem.complexity.time, "O(n log n + n log W)");
  assert.equal(problem.complexity.space, "O(1)");
  assert.ok(problem.tags.some((tag) => tag.key === "binary-search-on-answer"));
  assert.ok(problem.tags.some((tag) => tag.key === "greedy"));
  assert.ok(problem.companies.includes("google"));
  assert.ok(CATEGORY_ORDER["binary-search"].order.includes(1552));
});

test("1552 matches official examples, edge cases, and an independent oracle", () => {
  const cases = [
    [[1, 2, 3, 4, 7], 3, 3],
    [[5, 4, 3, 2, 1, 1000000000], 2, 999999999],
    [[1, 2], 2, 1],
    [[1, 2, 8, 12, 17], 3, 7],
    [[10, 20, 30, 40], 4, 10],
  ];
  for (const [position, m, answer] of cases) {
    const original = [...position];
    assert.equal(problem.builder(position, { m }).answer, answer);
    assert.deepEqual(position, original);
  }

  let seed = 1552;
  const random = () => seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  for (let sample = 0; sample < 180; sample += 1) {
    const length = 2 + random() % 9;
    const values = new Set();
    while (values.size < length) values.add(1 + random() % 45);
    const position = [...values];
    const m = 2 + random() % (length - 1);
    assert.equal(problem.builder(position, { m }).answer, oracle(position, m));
  }
});

test("1552 displayed Python runs and agrees with the JavaScript builder", () => {
  const cases = [
    [[1, 2, 3, 4, 7], 3, 3],
    [[5, 4, 3, 2, 1, 1000000000], 2, 999999999],
    [[1, 2, 8, 12, 17], 3, 7],
    [[10, 20, 30, 40], 4, 10],
  ];
  const program = `${problem.code.join("\n")}\nimport json,sys\nprint(json.dumps([Solution().maxDistance(position, m) for position, m in json.load(sys.stdin)]))`;
  const run = spawnSync("python3", ["-c", program], { input: JSON.stringify(cases.map(([position, m]) => [position, m])), encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(JSON.parse(run.stdout), cases.map(([, , expected]) => expected));
});

test("1552 trace preserves greedy placement, last-true bounds, and source lines", () => {
  const run = problem.builder([1, 2, 3, 4, 7], { m: 3 });
  assert.equal(run.answer, 3);
  assert.ok(run.steps.some((step) => view(step).action === "place-ball"));
  assert.ok(run.steps.some((step) => view(step).action === "too-close"));
  assert.ok(run.steps.some((step) => view(step).action === "enough"));
  assert.ok(run.steps.some((step) => view(step).action === "not-enough"));
  for (const step of run.steps) {
    const current = view(step);
    assert.deepEqual(step.codeLines, [current.source.line]);
    assert.equal(current.source.text, problem.code[current.source.line - 1]);
    assert.ok(current.search.left >= 1);
    assert.ok(current.search.left <= current.search.initialRight + 1);
    assert.ok(current.search.right >= 0);
    assert.ok(current.search.right <= current.search.initialRight);
    assert.equal(current.scan.balls, current.scan.placed.length);
    assert.deepEqual([...current.input.position].sort((a, b) => a - b), current.input.position);
    if (current.search.distance !== null) {
      for (let index = 1; index < current.scan.placed.length; index += 1) {
        const before = current.input.position[current.scan.placed[index - 1]];
        const after = current.input.position[current.scan.placed[index]];
        assert.ok(after - before >= current.search.distance);
      }
    }
  }
  const final = view(run.steps.at(-1));
  assert.equal(final.answer, 3);
  assert.ok(final.scan.balls >= final.input.m);
  assert.ok(final.higherBalls < final.input.m);
});

test("1552 picture-first renderer shows range, baskets, balls, gaps, and maximality proof", () => {
  const run = problem.builder([1, 2, 3, 4, 7], { m: 3 });
  const samples = [
    run.steps.find((step) => view(step).action === "choose-distance"),
    run.steps.find((step) => view(step).action === "gap-fits"),
    run.steps.find((step) => view(step).action === "too-close"),
    run.steps.find((step) => view(step).action === "place-ball"),
    run.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    for (const step of samples) {
      const html = render(step, language);
      assert.match(html, /mf1552-viz/);
      assert.match(html, /mf1552-range/);
      assert.match(html, /mf1552-yard/);
      assert.match(html, /mf1552-basket/);
      assert.match(html, /mf1552-placement/);
      assert.doesNotMatch(html, /undefined|NaN|Infinity/);
      assert.doesNotMatch(html, /<table|long explanation|invariant-list/);
    }
  }
  const final = render(run.steps.at(-1), "vi");
  assert.match(final, /mf1552-proof/);
  assert.match(final, /d = 3/);
  assert.match(final, /d = 4/);
  assert.match(final, /Xa nhất: d = 3/);
});

test("1552 validates distinct positions and returns typed live arguments", () => {
  for (const position of [[], [1], [0, 1], [-1, 1], [1.5, 2], [1, 1], [1, 1000000001], Array.from({ length: 61 }, (_, index) => index + 1)]) {
    assert.throws(() => problem.builder(position, { m: 2 }), /1552: position/);
  }
  for (const m of [0, 1, 4, 2.5, true, null, "", "2.5"]) {
    assert.throws(() => problem.builder([1, 2, 3], { m }), /1552: m/);
  }
  assert.deepEqual(problem.liveArgs([7, 1, 4], { m: "2" }), [[7, 1, 4], 2]);
});

test("1552 responsive light/dark assets are lazy and routed before generic renderers", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/magnetic-force-1552.css"), "utf8");
  const activeHtml = html.replace(/<template[\s\S]*?<\/template>/g, "");
  assert.match(html, /magnetic-force-1552\.css\?v=magnetic-force-1552-v1/);
  assert.match(html, /renderer-magnetic-force-1552\.js\?v=magnetic-force-1552-v1/);
  assert.match(html, /magnetic=1552-v1/);
  assert.doesNotMatch(activeHtml, /(?:renderer-)?magnetic-force-1552\.(?:js|css)/);
  assert.ok(script.indexOf("step.magnetic1552View") < script.indexOf("step.bfsGrid"));
  assert.match(css, /\[data-theme="light"\] \.mf1552-viz/);
  assert.match(css, /@container mf1552 \(max-width: 330px\)/);
});
