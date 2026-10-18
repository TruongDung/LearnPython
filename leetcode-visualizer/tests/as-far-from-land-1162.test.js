"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[1162];

function render(step, language = "vi") {
  const treeView = { innerHTML: "" };
  const context = {
    lang: language,
    $: id => {
      assert.equal(id, "treeView");
      return treeView;
    },
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
    })[char]),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8"), context);
  context.renderLandDistance1162View(step);
  return treeView.innerHTML;
}

test("1162 returns the farthest distance, including no-land and no-water cases", () => {
  const cases = [
    [problem.defaultInput, 2],
    ["1,0,0|0,0,0|0,0,0", 4],
    ["0,0|0,0", -1],
    ["1,1|1,1", -1],
    ["1,0,0,0|0,0,0,0|0,0,0,0|0,0,0,0", 6],
  ];
  for (const [input, expected] of cases) assert.equal(problem.builder(input).answer, expected);
});

test("1162 exposes one executable Python line and a focused BFS view per frame", () => {
  assert.equal(problem.debugMode, "line-by-line");
  assert.equal(problem.code[6], "        queue = deque()");
  assert.equal(problem.code[19], "        distance = -1");
  assert.equal(problem.code[24], "            for _ in range(len(queue)):");
  assert.equal(problem.code[34], "                        grid[nr][nc] = 1");
  assert.equal(problem.code[37], "        return distance");
  assert.ok(!problem.code.some(line => line.includes("distance = [[")));
  const run = problem.builder(problem.defaultInput);
  const events = new Set(run.steps.map(step => step.landDistance1162View?.event));
  for (const event of ["source-check", "source-enqueue", "wave-start", "dequeue", "neighbor-check", "distance-update", "enqueue", "result"]) {
    assert.ok(events.has(event), event);
  }
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(problem.code[step.codeLines[0] - 1]?.trim());
    assert.ok(step.landDistance1162View);
  }
  const first = run.steps[0].landDistance1162View;
  assert.equal(first.queue.length, 0);
  assert.equal(first.cells[0][0].distance, 0);
  assert.equal(first.cells[0][1].distance, -1);
  assert.equal(first.sourceTotal, 4);
  assert.equal(first.waterCount, 5);
  const final = run.steps.at(-1).landDistance1162View;
  assert.equal(final.phase, "result");
  assert.equal(final.answer, 2);
  assert.equal(final.knownWater, final.waterCount);
  assert.ok(final.cells.flat().some(cell => !cell.isLand && cell.distance === final.answer));
  const spread = run.steps.find(step => step.landDistance1162View.event === "distance-update").landDistance1162View;
  assert.ok(Array.isArray(spread.origin));
  assert.ok(Array.isArray(spread.direction));
  assert.equal(Math.abs(spread.direction[0]) + Math.abs(spread.direction[1]), 1);
  const otherDistanceProblem = SUPPORTED[1765].builder("0,0|0,0");
  assert.ok(otherDistanceProblem.steps.every(step => !step.landDistance1162View));
});

test("1162 displayed Python agrees with the visualizer", () => {
  const inputs = [
    problem.defaultInput,
    "1,0,0|0,0,0|0,0,0",
    "0,0|0,0",
    "1,1|1,1",
    "1,0,0,0|0,0,0,0|0,0,0,0|0,0,0,0",
  ];
  const payload = inputs.map(input => [
    input.split("|").map(row => row.split(",").map(Number)),
    problem.builder(input).answer,
  ]);
  const source = `${problem.code.join("\n")}\nimport json, sys\nfor matrix, expected in json.load(sys.stdin):\n    assert Solution().maxDistance(matrix) == expected`;
  const execution = spawnSync("python3", ["-c", source], { encoding: "utf8", input: JSON.stringify(payload) });
  assert.equal(execution.status, 0, execution.stderr);
});

test("1162 renderer is picture-first and bilingual", () => {
  const run = problem.builder(problem.defaultInput);
  const frames = [
    run.steps.find(step => step.landDistance1162View.event === "source-enqueue"),
    run.steps.find(step => step.landDistance1162View.event === "distance-update"),
    run.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    for (const frame of frames) {
      const html = render(frame, language);
      assert.match(html, /ld1162-viz/);
      assert.match(html, /ld1162-grid/);
      assert.match(html, /ld1162-waves/);
      assert.match(html, /ld1162-queue/);
      assert.match(html, /ld1162-mini-map|ld1162-empty/);
      assert.match(html, /🏝️|🌊/);
      assert.doesNotMatch(html, /undefined|NaN|object Object/);
    }
  }
  const spreadHtml = render(frames[1], "vi");
  assert.match(spreadHtml, /ld1162-cell-rings/);
  assert.match(spreadHtml, /ld1162-direction/);
  assert.match(spreadHtml, /ld1162-spark/);
  assert.doesNotMatch(spreadHtml, />QUEUE</);
  assert.doesNotMatch(spreadHtml, />FRONT</);
});

test("1162 renderer and styles are registered for lazy loading", () => {
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const manifest = JSON.parse(script.match(
    /const PHASE_FOUR_RENDERER_BUNDLES = Object\.freeze\((\{[\s\S]*?\})\);/,
  )[1].replace(/,\s*}/g, "}"));
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/requested-visualizations.css"), "utf8");
  const renderer = fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8");

  assert.ok(manifest["renderer-requested-visualizations.js"].includes("renderLandDistance1162View"));
  assert.match(script, /"requested-visualizations\.css": PHASE_FOUR_RENDERER_BUNDLES\["renderer-requested-visualizations\.js"\]/);
  assert.match(html, /requested-visualizations\.css\?v=requested-visualizations-v16-1162-code-expanded/);
  assert.match(html, /land1162=picture-v2/);
  assert.match(css, /\.ld1162-viz\s*\{/);
  assert.match(css, /body:has\(\.ld1162-viz\) #stepNote \{ display: none; \}/);
  assert.match(css, /#vizPanel:has\(\.ld1162-viz\) :is\(#codePanel, #codePanel2\) \{[\s\S]*?max-height: none;[\s\S]*?overflow: visible;[\s\S]*?position: static;/);
  assert.match(css, /#vizPanel:has\(\.ld1162-viz\) \.code-line \.txt \{[\s\S]*?overflow-wrap: anywhere;[\s\S]*?white-space: pre-wrap;/);
  assert.match(renderer, /function renderLandDistance1162View\(step\)/);
});
