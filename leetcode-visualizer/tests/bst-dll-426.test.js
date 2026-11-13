'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript } = require('./helpers/frontend-source');

const problem = SUPPORTED[426];
const RENDERER = fs.readFileSync(require.resolve('../public/renderer-bst-dll-426.js'), 'utf8');
const CSS = fs.readFileSync(require.resolve('../public/bst-dll-426.css'), 'utf8');

function renderer(lang) {
  const host = { innerHTML: '' };
  const context = { lang, document: { getElementById: () => host } };
  vm.createContext(context);
  vm.runInContext(RENDERER, context);
  return {
    cases: vm.runInContext('DL426_CASES', context),
    render(step, steps, index) {
      context.steps = steps;
      context.stepIndex = index;
      context.renderBstDll426View(step);
      return host.innerHTML;
    },
  };
}

// Sorted values of a level-order (heap-indexed) tree, as parseBST reads it.
function sortedValues(input) {
  return input.split(',').map((s) => s.trim()).filter((s) => s && s !== 'null').map(Number).sort((a, b) => a - b);
}

test('426 presets give the sorted circular list; default walks every line but the empty-tree return, presets cover all', () => {
  const { cases } = renderer('en');
  assert.equal(cases[0][0], problem.defaultInput);
  const visited = new Set();
  for (const [input] of cases) {
    const result = problem.builder(input);
    const values = sortedValues(input);
    assert.equal(result.answer, values.length ? `DLL: ${values.join(' ↔ ')} (circular)` : null, input);
    assert.equal(result.steps.filter((step) => step.final).length, 1);
    assert.ok(result.steps.at(-1).final);
    result.steps.forEach((step) => {
      assert.equal(step.codeLines.length, 1);
      visited.add(step.codeLines[0]);
    });
    const view = result.steps.at(-1).bstDll426View;
    if (values.length) {
      const order = view.visited;
      const val = new Map(view.tree.map((node) => [node.id, node.val]));
      assert.deepEqual(order.map((id) => val.get(id)), values);
      order.forEach((id, i) => {
        const next = order[(i + 1) % order.length];
        assert.equal(view.links.right[id], next, `${input} ${id}.right`);
        assert.equal(view.links.left[next], id, `${input} ${next}.left`);
      });
      assert.equal(view.head, order[0]);
    }
  }
  const nonBlank = problem.code.flatMap((text, index) => (text.trim() ? [index + 1] : []));
  assert.deepEqual(nonBlank.filter((line) => !visited.has(line)), []);
  const defaultLines = new Set(problem.builder(problem.defaultInput).steps.map((step) => step.codeLines[0]));
  assert.deepEqual(nonBlank.filter((line) => !defaultLines.has(line)), [4]);
  assert.ok(sortedValues(problem.defaultInput).length >= 8, 'default example is more than a toy tree');
});

test('426 renders every frame in both languages with the executed line and short notes', () => {
  for (const lang of ['vi', 'en']) {
    const ui = renderer(lang);
    for (const [input] of ui.cases) {
      const { steps } = problem.builder(input);
      const saved = JSON.stringify(steps);
      steps.forEach((step, index) => {
        const html = ui.render(step, steps, index);
        const view = step.bstDll426View;
        const line = step.codeLines[0];
        assert.ok(step.note[lang].length <= 40, `short note: ${step.note[lang]}`);
        assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object/, `${lang} ${input} #${index}`);
        assert.ok(html.includes(`data-source-line="${line}"`));
        assert.ok(html.includes(`<div class="dl426-now" data-code-line="${line}" aria-current="step"><span class="dl426-lineno">L${line}</span>`), `line ${line} shown`);
        assert.equal((html.match(/data-code-line=/g) || []).length, 1);
        assert.doesNotMatch(html, /def inorder|nonlocal head/, 'source is shown only in the shared #codePanel');
        for (const node of view.tree) {
          assert.ok(html.includes(`data-tree-node="${node.id}"`), `tree node ${node.id}`);
          assert.ok(html.includes(`data-list-node="${node.id}"`), `list slot ${node.id}`);
        }
        const pointers = Object.keys(view.links.right).length + Object.keys(view.links.left).length;
        assert.equal((html.match(/class="dl426-ptr /g) || []).length, pointers, 'one arrow per written pointer');
        if (view.write && (view.write.field === 'right' || view.write.field === 'left')) {
          assert.ok(html.includes(`dl426-ptr is-${view.write.field}`) && html.includes('is-written'), `written pointer at #${index}`);
        }
        if (view.condition !== null) assert.match(html, /dl426-branch is-(true|false)/);
        if (view.nullSlot) assert.ok(html.includes(`data-null-slot="${view.nullSlot.side}"`));
      });
      const last = ui.render(steps.at(-1), steps, steps.length - 1);
      if (steps.at(-1).bstDll426View.tree.length) assert.match(last, /dl426-ptr is-(right|left) is-close/);
      assert.equal(JSON.stringify(steps), saved, 'rendering does not mutate steps');
    }
  }
});

test('426 assets are wired with light and dark theme tokens and no code-panel height cap', () => {
  const index = readFrontendIndex();
  assert.match(index, /bst-dll-426\.css\?v=bst-dll-426-v1/);
  assert.match(index, /renderer-bst-dll-426\.js\?v=bst-dll-426-v1/);
  assert.match(readFrontendJavaScript(), /step\.bstDll426View\), surface: "treeView", render: \(step\) => \{\s*renderBstDll426View\(step\)/);
  assert.match(CSS, /\.dl426-viz \{[^}]*--dl426-bg:/s);
  assert.match(CSS, /\[data-theme="light"\] \.dl426-viz \{[^}]*--dl426-bg:/s);
  assert.match(CSS, /\.dl426-viz\) #codePanel \{[^}]*max-height: none;/s);
  assert.equal(problem.debugMode, 'line-by-line');
});
