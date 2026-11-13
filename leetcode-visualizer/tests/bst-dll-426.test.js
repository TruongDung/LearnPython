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
        assert.ok(step.note[lang].length <= 28, `short note: ${step.note[lang]}`);
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

// Samples an arrow path (the renderer only emits M, H and C commands) into points 1px-ish apart.
function samplePath(d) {
  const tokens = d.match(/[MHC]|-?\d+(?:\.\d+)?/g);
  const points = [];
  let x = 0;
  let y = 0;
  for (let i = 0; i < tokens.length;) {
    const cmd = tokens[i++];
    const num = () => Number(tokens[i++]);
    if (cmd === 'M') { x = num(); y = num(); points.push([x, y]); }
    if (cmd === 'H') {
      const x1 = num();
      const n = Math.max(1, Math.ceil(Math.abs(x1 - x)));
      for (let k = 1; k <= n; k++) points.push([x + (x1 - x) * k / n, y]);
      x = x1;
    }
    if (cmd === 'C') {
      const [x1, y1, x2, y2, x3, y3] = [num(), num(), num(), num(), num(), num()];
      for (let k = 1; k <= 200; k++) {
        const t = k / 200;
        const u = 1 - t;
        points.push([u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]);
      }
      x = x3;
      y = y3;
    }
  }
  return points;
}

// Largest share of one arrow's points lying within 2px of another arrow: ~1 when two arrows are drawn on top of each other.
function maxArrowOverlap(html) {
  const paths = [...html.matchAll(/<path class="dl426-ptr[^"]*" d="([^"]+)" data-ptr-from="(\d+)" data-ptr-field="(\w+)"/g)]
    .map((m) => ({ name: `${m[2]}.${m[3]}`, points: samplePath(m[1]) }));
  let worst = { share: 0 };
  for (const a of paths) {
    for (const b of paths) {
      if (a === b) continue;
      const near = a.points.filter(([x, y]) => b.points.some(([u, v]) => Math.hypot(x - u, y - v) <= 2)).length;
      const share = near / a.points.length;
      if (share > worst.share) worst = { share, a: a.name, b: b.name };
    }
  }
  return worst;
}

test('426 arrows never draw on top of each other, including the 2-node closing links', () => {
  const ui = renderer('en');
  for (const input of ['2,1', '1,null,2', problem.defaultInput, '4,2,5,1,3']) {
    const { steps } = problem.builder(input);
    steps.forEach((step, index) => {
      const worst = maxArrowOverlap(ui.render(step, steps, index));
      assert.ok(worst.share < 0.1, `${input} #${index}: ${worst.a} overlaps ${worst.b} (${worst.share.toFixed(2)})`);
    });
    const last = ui.render(steps.at(-1), steps, steps.length - 1);
    assert.equal((last.match(/class="dl426-ptr [^"]*\bis-close\b/g) || []).length, 2, `${input}: both closing links use the arc`);
  }
});

test('426 shows node/prev/head once: in the shared Variables panel, not as chips in the line strip', () => {
  const ui = renderer('en');
  const { steps } = problem.builder(problem.defaultInput);
  steps.forEach((step, index) => {
    assert.deepEqual(step.vars.map((v) => v.name), ['node', 'prev', 'head', 'list']);
    assert.doesNotMatch(ui.render(step, steps, index), /dl426-locals|chip-/);
  });
});

test('426 assets are wired with light and dark theme tokens and no code-panel height cap', () => {
  const index = readFrontendIndex();
  assert.match(index, /bst-dll-426\.css\?v=bst-dll-426-v2/);
  assert.match(index, /renderer-bst-dll-426\.js\?v=bst-dll-426-v2/);
  assert.match(readFrontendJavaScript(), /step\.bstDll426View\), surface: "treeView", render: \(step\) => \{\s*renderBstDll426View\(step\)/);
  assert.match(CSS, /\.dl426-viz \{[^}]*--dl426-bg:/s);
  assert.match(CSS, /\[data-theme="light"\] \.dl426-viz \{[^}]*--dl426-bg:/s);
  assert.match(CSS, /\.dl426-viz\) #codePanel \{[^}]*max-height: none;/s);
  assert.equal(problem.debugMode, 'line-by-line');
});
