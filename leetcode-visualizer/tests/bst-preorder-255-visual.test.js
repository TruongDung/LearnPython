"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[255];

function render(step, language = "vi") {
  const treeView = { innerHTML: "" };
  const context = {
    lang: language,
    $: id => {
      assert.equal(id, "treeView");
      return treeView;
    },
  };
  const source = fs.readFileSync(require.resolve("../public/renderers-01.js"), "utf8");
  const start = source.indexOf("function renderBstPreorder255View(step)");
  const end = source.indexOf("\nfunction renderTotalStrength2281View(step)", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  context.renderBstPreorder255View(step);
  return treeView.innerHTML;
}

test("255 visualizes the BST, ancestor stack, and lower-bound check through every step", () => {
  for (const [input, expected] of [["8,5,1,7,10,12", true], ["8,5,1,7,10,4", false]]) {
    const run = problem.builder(input);
    assert.equal(run.answer, expected);

    for (const language of ["vi", "en"]) {
      for (const step of run.steps) {
        const html = render(step, language);
        const view = step.bstPreorder255View;
        assert.match(html, /vp255-picture/);
        assert.match(html, /vp255-tree-panel/);
        assert.match(html, /vp255-stack-picture/);
        assert.match(html, /vp255-range/);
        assert.equal((html.match(/class="vp255-tree-node/g) || []).length, view.accepted.length);
        if (view.current >= 0 && !view.accepted.includes(view.current)) {
          assert.match(html, /vp255-candidate/);
        }
        assert.doesNotMatch(html, /undefined|NaN|Infinity/);
      }

      const finalHtml = render(run.steps.at(-1), language);
      assert.match(finalHtml, expected ? /✓ TRUE/ : /× FALSE/);
    }
  }
});

test("255 labels each BST edge with its correct left or right branch", () => {
  const run = problem.builder("5,2,1,3,6");
  const html = render(run.steps.at(-1));
  const edges = [...html.matchAll(/<g class="vp255-link (left|right)" data-parent="(\d+)" data-node="(\d+)">.*?<text[^>]*>([LR])<\/text><\/g>/g)];

  assert.deepEqual(
    edges.map(([, , parent, node, side]) => [`${parent}→${node}`, side]),
    [["2→1", "L"], ["5→2", "L"], ["2→3", "R"], ["5→6", "R"]],
  );
});

test("255 picture has responsive light and dark styling", () => {
  const css = fs.readFileSync(require.resolve("../public/style-08.css"), "utf8");
  assert.match(css, /\.vp255-picture-main\s*\{/);
  assert.match(css, /\[data-theme="dark"\] \.vp255-tree-node circle/);
  assert.match(css, /@media \(max-width: 620px\)/);
});
