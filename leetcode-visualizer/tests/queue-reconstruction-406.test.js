"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const problem = require("../problems").SUPPORTED[406];

function valid(queue) {
  return queue.every(([h, k], i) => queue.slice(0, i).filter(([height]) => height >= h).length === k);
}

test("406 reconstructs both examples without mutating input", () => {
  const input = [[7, 0], [4, 4], [7, 1], [5, 0], [6, 1], [5, 2]];
  const copy = structuredClone(input);
  assert.deepEqual(problem.builder(input).answer, [[5, 0], [7, 0], [5, 2], [6, 1], [4, 4], [7, 1]]);
  assert.deepEqual(input, copy);
  assert.deepEqual(problem.builder("6,0; 5,0; 4,0; 3,2; 2,2; 1,4").answer, [[4, 0], [5, 0], [2, 2], [3, 2], [1, 4], [6, 0]]);
  assert.deepEqual(problem.liveArgs(problem.defaultInput), [input]);
});

test("406 preserves every person's constraint for generated valid queues, ties and zero heights", () => {
  for (let n = 1; n <= 60; n++) {
    const heights = Array.from({ length: n }, (_, i) => (i * 13 + n) % 11);
    const pairs = heights.map((h, i) => [h, heights.slice(0, i).filter(x => x >= h).length]);
    const shuffled = [...pairs].sort((a, b) => a[1] - b[1] || a[0] - b[0]).reverse();
    const result = problem.builder(shuffled);
    assert.ok(valid(result.answer), `n=${n}`);
    assert.deepEqual([...result.answer].sort(), [...pairs].sort());
    for (const step of result.steps) {
      if (step.queue406View.phase === "insert") {
        const v = step.queue406View;
        assert.equal(v.queue[v.current.k].id, v.current.id);
        assert.ok(valid(v.queue.map(p => [p.h, p.k])));
      }
    }
  }
});

test("406 rejects malformed and impossible queues", () => {
  for (const input of ["bad", "[]", "[[1]]", "[[1,-1]]", "[[1,0.5]]", "[[1,1]]", "[[5,0],[5,0]]", "[[5,0],[4,2]]"]) {
    assert.throws(() => problem.builder(input), /#406/);
  }
});

test("406 highlights equal-height predecessors, skips shorter people, and supports selection in both languages", () => {
  const listeners = [];
  const host = { innerHTML: "", querySelectorAll: () => [{ dataset: { q406Id: "2" }, addEventListener: (_, listener) => listeners.push(listener) }], querySelector: () => ({ focus() {} }) };
  const context = { lang: "vi", $: () => host };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-queue-reconstruction-406.js"), "utf8"), context);
  const result = problem.builder(problem.defaultInput);
  for (const lang of ["vi", "en"]) {
    context.lang = lang;
    for (const step of result.steps) {
      context.renderQueue406View(step);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
      assert.match(host.innerHTML, /q406-row/);
    }
    context.renderQueue406View(result.steps.at(-1), 2); // [7,1]: only the other 7 counts.
    assert.equal((host.innerHTML.match(/q406-person is-counted/g) || []).length, 1);
    assert.equal((host.innerHTML.match(/q406-person is-shorter/g) || []).length, 4);
    assert.match(host.innerHTML, /data-q406-id="2" aria-pressed="true"/);
  }
  listeners.at(-1)();
  assert.match(host.innerHTML, /data-q406-id="2" aria-pressed="true"/);
});

test("406 illustrates before/after insertion and exactly which people shift right", () => {
  const host = { innerHTML: "", querySelectorAll: () => [] };
  const context = { lang: "vi", $: () => host };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-queue-reconstruction-406.js"), "utf8"), context);
  const trace = problem.builder(problem.defaultInput).steps;
  for (const phase of ["place", "insert"]) {
    const step = trace.find(step => step.queue406View.phase === phase && step.queue406View.current.h === 5 && step.queue406View.current.k === 2);
    context.renderQueue406View(step);
    assert.match(host.innerHTML, /q406-before/);
    assert.match(host.innerHTML, /\[2\] → \[3\]/);
    assert.match(host.innerHTML, /\[3\] → \[4\]/);
    assert.equal((host.innerHTML.match(/class="q406-shift"/g) || []).length, 2);
    assert.equal((host.innerHTML.match(/class="q406-count-dot"/g) || []).length, 2);
    assert.match(host.innerHTML, /2 \/ k=2 ✓/);
    assert.equal(host.innerHTML.includes("is-slot"), phase === "place");
  }
});

test("406 moves stable person identities and respects reduced motion", () => {
  const source = fs.readFileSync(require.resolve("../public/renderer-queue-reconstruction-406.js"), "utf8");
  for (const reduced of [false, true]) {
    const animations = [];
    const oldPerson = { dataset: { q406Move: "0" }, classList: { contains: () => true }, getBoundingClientRect: () => ({ left: 100, top: 50, width: 80, height: 200 }) };
    const newPerson = { dataset: { q406Move: "0" }, getBoundingClientRect: () => ({ left: 200, top: 80, width: 80, height: 200 }), animate: frames => animations.push(frames) };
    const host = { innerHTML: "", querySelectorAll: selector => selector === "[data-q406-move]" ? [oldPerson] : selector === ".q406-row > [data-q406-move]" ? [newPerson] : [] };
    const context = { lang: "vi", $: () => host, window: { matchMedia: () => ({ matches: reduced }) } };
    vm.createContext(context);
    vm.runInContext(source, context);
    context.renderQueue406View(problem.builder(problem.defaultInput).steps[1]);
    assert.equal(animations.length, reduced ? 0 : 1);
    if (!reduced) assert.match(animations[0][0].transform, /translate\(-100px, -30px\)/);
  }
});
