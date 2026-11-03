"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[3171];

function brute(nums, k) {
  let best = Infinity;
  for (let left = 0; left < nums.length; left++) {
    let value = 0;
    for (let right = left; right < nums.length; right++) {
      value |= nums[right];
      best = Math.min(best, Math.abs(value - k));
    }
  }
  return best;
}

test("3171 returns the minimum OR difference, including single-value and tie cases", () => {
  const cases = [
    [[1, 2, 4, 5], 6],
    [[1, 2, 4], 3],
    [[8, 1, 2], 0],
    [[0, 0, 0], 5],
    [[10], 0],
  ];
  for (const [nums, k] of cases) {
    const run = problem.builder(nums, { k });
    assert.equal(run.answer, brute(nums, k));
    assert.equal(run.steps.length, nums.length);
    assert.equal(run.steps.at(-1).subarrayOr3171View.best, run.answer);
  }
});

test("3171 compressed suffix OR states contain every distinct subarray OR", () => {
  for (let mask = 1; mask < 1 << 8; mask++) {
    const nums = Array.from({ length: 4 }, (_, index) => (mask >> (index * 2)) & 3);
    for (let k = 0; k <= 7; k++) {
      const run = problem.builder(nums, { k });
      assert.equal(run.answer, brute(nums, k));
      for (let right = 0; right < nums.length; right++) {
        const actual = run.steps[right].subarrayOr3171View.candidates.map(({ value }) => value);
        const expected = new Set();
        let value = 0;
        for (let left = right; left >= 0; left--) {
          value |= nums[left];
          expected.add(value);
        }
        assert.deepEqual(new Set(actual), expected);
      }
    }
  }
});

test("3171 validates the visualization inputs and wires the Python arguments", () => {
  for (const [nums, k] of [[[], 0], [[-1], 0], [[1.5], 0], [[1], -1], [[1], 1_000_000_001], [Array(19).fill(1), 1]]) {
    assert.throws(() => problem.builder(nums, { k }), /3171:/);
  }
  assert.deepEqual(problem.liveArgs([1, 2, 4, 5], { k: 6 }), [[1, 2, 4, 5], 6]);
});

test("3171 visualization is bilingual, picture-led, and supports restoring old steps", () => {
  const context = { escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-subarray-or-3171.js"), "utf8"), context);
  const Visualizer = vm.runInContext("SubarrayOr3171Visualizer", context);
  const run = problem.builder([1, 2, 4, 5], { k: 6 });
  for (const language of ["vi", "en"]) {
    const host = { innerHTML: "" };
    const renderer = new Visualizer({ host, language });
    for (const step of run.steps) {
      renderer.render(JSON.parse(JSON.stringify(step)));
      assert.match(host.innerHTML, /sor3171-viz/);
      assert.match(host.innerHTML, /sor3171-window/);
      assert.match(host.innerHTML, /sor3171-bit/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
    }
    assert.match(host.innerHTML, /ANSWER|ĐÁP ÁN/);
    renderer.render(run.steps[0]);
    const first = host.innerHTML;
    renderer.render(run.steps.at(-1));
    renderer.render(run.steps[0]);
    assert.equal(host.innerHTML, first);
  }
});

test("3171 lazy assets and renderer dispatch are registered", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  assert.match(html, /renderer-subarray-or-3171\.js/);
  assert.match(html, /subarray-or-3171\.css/);
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  assert.match(script, /subarrayOr3171View[\s\S]*?renderSubarrayOr3171View\(step\)/);
});
