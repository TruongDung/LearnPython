"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[628];

function oracle(nums) {
  let best = -Infinity;
  for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) for (let k = j + 1; k < nums.length; k++) best = Math.max(best, nums[i] * nums[j] * nums[k]);
  return best;
}

function renderer(language = "en") {
  const host = { innerHTML: "" };
  const context = { escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-maximum-product-628.js"), "utf8"), context);
  const Visualizer = vm.runInContext("MaximumProduct628Visualizer", context);
  return { host, visualizer: new Visualizer({ host, language }) };
}

const cases = [[-10, -10, 1, 3, 2], [1, 2, 3, 4], [-9, -4, -2, -1], [0, 0, 0], [-3, -2, -1, 0], [2, 2, 2, 2], [-1000, -1000, 1000], [1, -1, 1, -1]];

test("628 agrees with an independent triple-enumeration oracle", () => {
  let seed = 628;
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  const random = Array.from({ length: 80 }, () => Array.from({ length: 3 + next() % 8 }, () => next() % 21 - 10));
  for (const nums of [...cases, ...random]) assert.equal(problem.builder(nums).answer, oracle(nums), JSON.stringify(nums));
  assert.throws(() => problem.builder([1, 2]), /at least 3/);
});

test("628 displayed Python matches the visualizer on signs, ties and duplicates", () => {
  const code = "from typing import List\n" + problem.code.join("\n") + "\nimport json,sys\nfor case in json.load(sys.stdin):\n    assert Solution().maximumProduct(case['nums']) == case['answer']\n";
  const result = spawnSync("python3", ["-c", code], { encoding: "utf8", input: JSON.stringify(cases.map(nums => ({ nums, answer: oracle(nums) }))) });
  assert.equal(result.status, 0, result.stderr);
});

test("628 completed iterations preserve three largest and two smallest values", () => {
  for (const nums of cases) {
    const run = problem.builder(nums);
    for (const step of run.steps.filter(step => step.codeLines[0] === 5 || step.final)) {
      const view = step.multiSlotPodiumView;
      const seen = nums.slice(0, step.final ? nums.length : view.current).sort((a, b) => a - b);
      const actual = key => view.slots.find(slot => slot.key === key).value;
      assert.deepEqual([actual("first"), actual("second"), actual("third")], [seen.at(-1) ?? -Infinity, seen.at(-2) ?? -Infinity, seen.at(-3) ?? -Infinity]);
      assert.deepEqual([actual("minFirst"), actual("minSecond")], [seen[0] ?? Infinity, seen[1] ?? Infinity]);
    }
  }
});

test("628 class renders raw and JSON snapshots in both languages without premature products", () => {
  for (const language of ["vi", "en"]) {
    const { host, visualizer } = renderer(language);
    for (const nums of cases) for (const step of problem.builder(nums).steps) {
      for (const frame of [step, JSON.parse(JSON.stringify(step))]) {
        visualizer.render(frame);
        assert.match(host.innerHTML, /m628-viz/);
        assert.match(host.innerHTML, /<svg/);
        assert.doesNotMatch(host.innerHTML, /NaN|undefined|Infinity/);
        if (!step.final) assert.doesNotMatch(host.innerHTML, /data-product=/);
        else assert.equal((host.innerHTML.match(/data-candidate=/g) || []).length, 2);
      }
    }
  }
});

test("628 final view picks three distinct duplicate indices and shows both products", () => {
  const { host, visualizer } = renderer();
  const step = problem.builder(problem.defaultInput).steps.at(-1);
  visualizer.render(step);
  assert.match(host.innerHTML, /data-candidate="A" data-product="6"/);
  assert.match(host.innerHTML, /m628-candidate winner" data-candidate="B" data-product="300"/);
  const selected = [...host.innerHTML.matchAll(/class="m628-bar[^"\n]* selected" data-index="(\d+)"/g)].map(match => Number(match[1]));
  assert.deepEqual(selected, [0, 1, 3]);
  assert.match(host.innerHTML, /− × − → \+/);
  assert.match(host.innerHTML, /<b>100<\/b>/);
});

test("628 handles negative answers and marks ties without claiming the final product is positive", () => {
  const { host, visualizer } = renderer();
  visualizer.render(problem.builder([-9, -4, -2, -1]).steps.at(-1));
  assert.match(host.innerHTML, /m628-candidate winner" data-candidate="A" data-product="-8"/);
  assert.match(host.innerHTML, /Maximum product<\/span><strong>-8<\/strong>/);
  visualizer.render(problem.builder([2, 2, 2, 2]).steps.at(-1));
  assert.equal((host.innerHTML.match(/m628-candidate winner/g) || []).length, 2);
  assert.equal((host.innerHTML.match(/m628-bar[^"\n]* selected"/g) || []).length, 3);
});

test("628 assets are lazy and its renderer is extracted from the shared bundle", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const registry = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  assert.match(html, /renderer-maximum-product-628\.js/);
  assert.match(html, /maximum-product-628\.css/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /(?:renderer-)?maximum-product-628\.(?:js|css)/);
  assert.match(registry, /renderMaximumProduct628View\(step\)/);
  assert.doesNotMatch(registry, /renderMultiSlotPodiumView/);
  assert.doesNotMatch(fs.readFileSync(require.resolve("../public/renderers-03.js"), "utf8"), /renderMultiSlotPodiumView/);
});

test("628 preserves the viewport and viz panel height between steps", () => {
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const start = script.indexOf("let stableVisualizationLayout = null;");
  const end = script.indexOf("\n// ---- Utilities ----", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);

  const elements = new Map();
  let panelHeight = 0;
  const panel = {
    clientWidth: 640,
    classList: { toggle() {} },
    style: {},
    getBoundingClientRect: () => ({ height: panelHeight }),
  };
  const scrollPositions = [];
  const context = {
    steps: [
      { multiSlotPodiumView: {}, codeLines: [], panelHeight: 480 },
      { multiSlotPodiumView: {}, codeLines: [], panelHeight: 360 },
    ],
    stepIndex: 0,
    answerValue: null,
    window: {
      scrollX: 12,
      scrollY: 240,
      scrollTo: position => scrollPositions.push(position),
    },
    $: id => {
      if (id === "vizPanel") return panel;
      if (!elements.has(id)) elements.set(id, {
        disabled: false,
        textContent: "",
        classList: { add() {}, remove() {} },
      });
      return elements.get(id);
    },
    pick: value => value,
    t: () => ({ stepCounter: (index, total) => `${index}/${total}` }),
    updateCodeHighlight() {},
    renderVars() {},
    setPrimaryVisualizationSurface() {},
    ORDERED_RENDERER_REGISTRY: [{
      predicate: step => Boolean(step.multiSlotPodiumView),
      surface: "treeView",
      render: step => { panelHeight = step.panelHeight; },
    }],
    renderBars() {},
    show() {},
    hide() {},
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  context.renderStep();
  assert.equal(panel.style.minHeight, "480px");
  assert.deepEqual(JSON.parse(JSON.stringify(scrollPositions[0])), { left: 12, top: 240, behavior: "instant" });

  context.stepIndex = 1;
  context.renderStep();
  assert.equal(panel.style.minHeight, "480px");
  assert.deepEqual(JSON.parse(JSON.stringify(scrollPositions[1])), { left: 12, top: 240, behavior: "instant" });

  context.steps = [{ codeLines: [] }];
  context.stepIndex = 0;
  context.renderStep();
  assert.equal(panel.style.minHeight, "");
  assert.equal(scrollPositions.length, 2);
});
