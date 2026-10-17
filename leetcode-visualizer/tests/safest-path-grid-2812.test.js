"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[2812];

const view = (step) => step.safest2812View;

function distanceMap(grid) {
  const n = grid.length;
  const distance = Array.from({ length: n }, () => Array(n).fill(-1));
  const queue = [];
  for (let r = 0; r < n; r += 1) for (let c = 0; c < n; c += 1) {
    if (grid[r][c] === 1) { distance[r][c] = 0; queue.push([r, c]); }
  }
  for (let head = 0; head < queue.length; head += 1) {
    const [r, c] = queue[head];
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && distance[nr][nc] === -1) {
        distance[nr][nc] = distance[r][c] + 1;
        queue.push([nr, nc]);
      }
    }
  }
  return distance;
}

function canReach(distance, threshold) {
  const n = distance.length;
  if (distance[0][0] < threshold) return false;
  const queue = [[0, 0]];
  const seen = new Set([0]);
  for (let head = 0; head < queue.length; head += 1) {
    const [r, c] = queue[head];
    if (r === n - 1 && c === n - 1) return true;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      const id = nr * n + nc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && distance[nr][nc] >= threshold && !seen.has(id)) {
        seen.add(id);
        queue.push([nr, nc]);
      }
    }
  }
  return false;
}

function oracle(grid) {
  const distance = distanceMap(grid);
  let low = 0;
  let high = Math.min(distance[0][0], distance.at(-1).at(-1));
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (canReach(distance, middle)) low = middle;
    else high = middle - 1;
  }
  return { answer: low, distance };
}

function renderer(language = "vi") {
  const context = { escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-safest-path-grid-2812.js"), "utf8"), context);
  const Renderer = vm.runInContext("SafestPath2812Visualizer", context);
  return { host: { innerHTML: "" }, Renderer, language };
}

test("2812 multi-source BFS and maximin path match an independent threshold oracle", () => {
  const cases = [
    [[1]],
    [[0, 1], [0, 0]],
    [[1, 0], [0, 0]],
    [[0, 0, 1], [0, 0, 0], [0, 0, 0]],
    [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
    [[0, 0, 0, 1], [0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
  ];
  let seed = 2812;
  const random = () => seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  for (let sample = 0; sample < 40; sample += 1) {
    const n = 2 + random() % 5;
    const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => random() % 5 === 0 ? 1 : 0));
    if (!grid.some((row) => row.includes(1))) grid[random() % n][random() % n] = 1;
    cases.push(grid);
  }
  for (const grid of cases) {
    const original = JSON.stringify(grid);
    const expected = oracle(grid);
    const run = problem.builder(grid);
    const final = view(run.steps.at(-1));
    assert.equal(run.answer, expected.answer);
    assert.deepEqual(run.distance, expected.distance);
    assert.equal(JSON.stringify(grid), original);
    assert.equal(final.higherReachable, false);
    assert.deepEqual(final.path[0].slice(0, 2), [0, 0]);
    assert.deepEqual(final.path.at(-1).slice(0, 2), [grid.length - 1, grid.length - 1]);
    assert.equal(Math.min(...final.path.map((cell) => cell[2])), run.answer);
  }
});

test("2812 displayed Python is runnable and returns the same answers", () => {
  const cases = [
    [[1]],
    [[0, 1], [0, 0]],
    problem.parseInput(problem.defaultInput),
    [[0, 0, 0], [1, 0, 0], [0, 0, 1]],
  ];
  const program = `${problem.code.join("\n")}\nimport json,sys\nprint(json.dumps([Solution().maximumSafenessFactor(g) for g in json.load(sys.stdin)]))`;
  const run = spawnSync("python3", ["-c", program], { input: JSON.stringify(cases), encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(JSON.parse(run.stdout), cases.map((grid) => oracle(grid).answer));
});

test("2812 trace separates distance waves from max-heap search and preserves line mapping", () => {
  const run = problem.builder(problem.defaultInput);
  assert.equal(run.answer, 2);
  assert.ok(run.steps.length > 100);
  assert.ok(run.steps.some((step) => view(step).phase === "seed-thief"));
  assert.ok(run.steps.some((step) => view(step).phase === "wave-distance"));
  assert.ok(run.steps.some((step) => view(step).phase === "heap-pop"));
  assert.ok(run.steps.some((step) => view(step).phase === "candidate"));
  assert.equal(view(run.steps.find((step) => view(step).phase === "best-init")).current, null);
  for (const step of run.steps) {
    const v = view(step);
    assert.deepEqual(step.codeLines, [v.source.line]);
    assert.equal(v.source.text, problem.code[v.source.line - 1]);
    assert.ok(v.cells.every((row) => row.every((cell) => cell.distance === null || cell.distance >= -1)));
  }
  assert.equal(view(run.steps.at(-1)).final, true);
  assert.equal(view(run.steps.at(-1)).answer, 2);
});

test("2812 validates square binary grids and exposes interview metadata", () => {
  assert.deepEqual(problem.liveArgs("0,1|0,0"), [[[0, 1], [0, 0]]]);
  for (const input of ["", null, "[", "0,1|0", "0,2|0,1", "0,0|0,0", [[true]], [], Array.from({ length: 401 }, () => Array(401).fill(1))]) {
    assert.throws(() => problem.builder(input), /2812:/);
  }
  assert.equal(problem.debugMode, "line-by-line");
  assert.equal(problem.complexity.time, "O(n² log n)");
  assert.ok(problem.tags.some((tag) => tag.key === "multi-source-bfs"));
  assert.ok(problem.tags.some((tag) => tag.key === "dijkstra"));
});

test("2812 picture-first renderer works in Vietnamese and English across key phases", () => {
  const run = problem.builder(problem.defaultInput);
  const samples = [
    run.steps.find((step) => view(step).phase === "seed-thief"),
    run.steps.find((step) => view(step).phase === "wave-distance"),
    run.steps.find((step) => view(step).phase === "candidate"),
    run.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    const { host, Renderer } = renderer(language);
    const instance = new Renderer({ host, language, escape: String });
    for (const step of samples) {
      instance.render(JSON.parse(JSON.stringify(step)));
      assert.match(host.innerHTML, /sp2812-viz/);
      assert.match(host.innerHTML, /sp2812-board/);
      assert.match(host.innerHTML, /THIEVES/);
      assert.match(host.innerHTML, /DISTANCE WAVES/);
      assert.match(host.innerHTML, /SAFEST PATH/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
    }
    instance.render(run.steps.at(-1));
    assert.match(host.innerHTML, /sp2812-result/);
    assert.match(host.innerHTML, /sp2812-proof/);
    assert.equal((host.innerHTML.match(/sp2812-cell [^\"]*path/g) || []).length, view(run.steps.at(-1)).path.length);
  }
});

test("2812 dedicated responsive light/dark assets are lazy and renderer is registered", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/safest-path-grid-2812.css"), "utf8");
  assert.match(html, /safest-path-grid-2812\.css\?v=safest-path-2812-v2/);
  assert.match(html, /renderer-safest-path-grid-2812\.js\?v=safest-path-2812-v2/);
  assert.match(html, /safest=2812-v1/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /(?:renderer-)?safest-path-grid-2812\.(?:js|css)/);
  assert.ok(script.indexOf("step.safest2812View") < script.indexOf("step.bfsGrid"));
  assert.match(css, /\[data-theme="light"\] \.sp2812-viz/);
  assert.match(css, /@container sp2812 \(max-width:430px\)/);
  assert.match(css, /#vizPanel:has\(\.sp2812-viz\) #stepNote/);
});
