"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[802];

function render(step, language = "vi") {
  const treeView = { innerHTML: "" };
  const context = {
    lang: language,
    $: id => { assert.equal(id, "treeView"); return treeView; },
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
    })[char]),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8"), context);
  context.renderSafeStates802View(step);
  return treeView.innerHTML;
}

test("802 returns eventual safe nodes for cycles, chains, and terminals", () => {
  const cases = [
    ["[[1,2],[2,3],[5],[0],[5],[],[]]", [2, 4, 5, 6]],
    ["[[]]", [0]],
    ["[[0]]", []],
    ["[[1],[2],[]]", [0, 1, 2]],
    ["[[1],[2],[1],[]]", [3]],
  ];
  for (const [input, expected] of cases) {
    assert.deepEqual(problem.builder(input).answer, expected);
  }
});

test("802 emits picture-first peeling states", () => {
  const run = problem.builder(problem.defaultInput);
  const events = new Set(run.steps.map(step => step.safe802View.event));
  for (const event of ["build", "reverse-ready", "terminals", "dequeue", "mark-safe", "inspect-edge", "cut-edge", "enqueue", "result"]) {
    assert.ok(events.has(event), event);
  }
  for (const step of run.steps) {
    assert.ok(step.safe802View);
    assert.equal(step.safe802View.graph.length, 7);
    assert.equal(step.safe802View.outdegree.length, 7);
    assert.equal(step.codeLines.length, 1);
    assert.ok(problem.code[step.codeLines[0] - 1].trim(), `line ${step.codeLines[0]}`);
  }
  const cut = run.steps.find(step => step.safe802View.event === "cut-edge");
  assert.ok(Array.isArray(cut.safe802View.activeEdge));
  assert.equal(cut.safe802View.outdegreeBefore - 1, cut.safe802View.outdegreeAfter);
  assert.deepEqual(run.steps.at(-1).safe802View.answer, [2, 4, 5, 6]);
  assert.deepEqual(run.steps.at(-1).safe802View.unsafe, [0, 1, 3]);
});

test("802 displayed Python agrees with the visualizer", () => {
  const inputs = [
    [[1, 2], [2, 3], [5], [0], [5], [], []],
    [[]],
    [[0]],
    [[1], [2], []],
  ];
  const payload = inputs.map(graph => [graph, problem.builder(JSON.stringify(graph)).answer]);
  const source = `${problem.code.join("\n")}\nimport json, sys\nfor graph, expected in json.load(sys.stdin):\n    assert Solution().eventualSafeNodes(graph) == expected`;
  const execution = spawnSync("python3", ["-c", source], { encoding: "utf8", input: JSON.stringify(payload) });
  assert.equal(execution.status, 0, execution.stderr);
});

test("802 renderer shows graph, scissors, queue, shields, and unsafe loop", () => {
  const run = problem.builder(problem.defaultInput);
  const cut = run.steps.find(step => step.safe802View.event === "cut-edge");
  const result = run.steps.at(-1);
  for (const language of ["vi", "en"]) {
    const cutHtml = render(cut, language);
    assert.match(cutHtml, /safe802-viz/);
    assert.match(cutHtml, /safe802-graph/);
    assert.match(cutHtml, /safe802-edge active removed/);
    assert.match(cutHtml, /safe802-cut cut/);
    assert.match(cutHtml, /✂/);
    assert.match(cutHtml, /safe802-queue/);
    assert.match(cutHtml, /safe802-shelf/);
    assert.doesNotMatch(cutHtml, /undefined|NaN|object Object/);
  }
  const resultHtml = render(result, "vi");
  assert.match(resultHtml, /safe802-result/);
  assert.match(resultHtml, /class="bad"/);
  assert.match(resultHtml, /⟳/);
});

test("802 custom renderer and responsive styles are registered and cache-busted", () => {
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/requested-visualizations.css"), "utf8");
  const renderer = fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8");
  const manifest = JSON.parse(script.match(/const PHASE_FOUR_RENDERER_BUNDLES = Object\.freeze\((\{[\s\S]*?\})\);/)[1].replace(/,\s*}/g, "}"));
  assert.ok(manifest["renderer-requested-visualizations.js"].includes("renderSafeStates802View"));
  assert.match(script, /safe802View/);
  assert.match(html, /requested-visualizations\.css[^"\n]*safe802=picture-v1/);
  assert.match(html, /renderer-requested-visualizations\.js[^"\n]*safe802=picture-v1/);
  assert.match(html, /color1857=picture-v1&safe802=picture-v1/);
  assert.match(css, /\.safe802-viz\s*\{/);
  assert.match(css, /body:has\(\.safe802-viz\) #stepNote/);
  assert.match(renderer, /function renderSafeStates802View\(step\)/);
});
