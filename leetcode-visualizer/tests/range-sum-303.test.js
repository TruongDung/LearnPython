"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[303];

function renderer(language = "en") {
  const context = { escapeHtml: value => String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-range-sum-303.js"), "utf8"), context);
  const Visualizer = vm.runInContext("RangeSum303Visualizer", context);
  const host = { innerHTML: "" };
  return { host, visualizer: new Visualizer({ host, language }) };
}

test("303 sums match direct addition for every range, including negative and zero values", () => {
  for (const nums of [[5], [0], [-2, 0, 3, -5, 2, -1], [-4, -1, -9], [10000, -10000, 0, 7]]) {
    for (let left = 0; left < nums.length; left++) for (let right = left; right < nums.length; right++) {
      const run = problem.builder(nums, { left, right });
      assert.equal(run.answer, nums.slice(left, right + 1).reduce((sum, value) => sum + value, 0));
    }
  }
});

test("303 renders unknown prefix cells until each append and uses pending addition arrows", () => {
  const { host, visualizer } = renderer();
  const trace = problem.builder([2, 3, 4], { left: 1, right: 2 }).steps;
  visualizer.render(trace[0]);
  assert.equal((host.innerHTML.match(/class="ps303-prefix[^\"]* unknown/g) || []).length, 3);
  visualizer.render(trace[1]);
  assert.match(host.innerHTML, /ps303-build-link pending/);
  visualizer.render(trace[2]);
  assert.match(host.innerHTML, /ps303-build-link committed/);
  assert.equal((host.innerHTML.match(/class="ps303-prefix[^\"]* unknown/g) || []).length, 2);
});

test("303 cancels the prefix before left and reveals the answer only after subtraction", () => {
  const { host, visualizer } = renderer();
  const trace = problem.builder(problem.defaultInput, { left: 2, right: 5 }).steps.filter(step => step.prefix1DView.query);
  for (const step of trace.slice(0, -1)) {
    visualizer.render(step);
    assert.match(host.innerHTML, /data-answer="pending"/);
    assert.doesNotMatch(host.innerHTML, /data-answer="ready"/);
  }
  visualizer.render(trace.at(-1));
  assert.match(host.innerHTML, /data-answer="ready"[^>]*><small>Sum<\/small><b>-1<\/b>/);
  assert.match(host.innerHTML, /ps303-operand green"><small>p\[6\]<\/small><b>-3<\/b>/);
  assert.match(host.innerHTML, /ps303-operand red"><small>p\[2\]<\/small><b>-2<\/b>/);
  assert.equal((host.innerHTML.match(/class="ps303-strike"/g) || []).length, 2);
});

test("303 left zero subtracts an empty prefix and renderer instances keep their own language", () => {
  const vi = renderer("vi");
  const en = renderer("en");
  const step = problem.builder([0], { left: 0, right: 0 }).steps.at(-1);
  vi.visualizer.render(step);
  en.visualizer.render(step);
  assert.match(vi.host.innerHTML, /Tổng một đoạn/);
  assert.match(en.host.innerHTML, /Range sum/);
  assert.match(en.host.innerHTML, /ps303-empty">∅/);
  assert.match(en.host.innerHTML, /ps303-operand red"><small>p\[0\]<\/small><b>0<\/b>/);
});

test("303 diagrams support longer arrays without invalid SVG coordinates or future results", () => {
  const { host, visualizer } = renderer();
  const nums = Array.from({ length: 20 }, (_, i) => i % 2 ? -i : i);
  for (const step of problem.builder(nums, { left: 8, right: 18 }).steps) {
    visualizer.render(step);
    assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
    assert.equal((host.innerHTML.match(/class="ps303-num /g) || []).length, nums.length);
    assert.equal((host.innerHTML.match(/data-prefix-index=/g) || []).length, nums.length + 1);
  }
});

test("303 dedicated renderer is lazy and no longer lives in a shared renderer bundle", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const registry = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const active = html.replace(/<template[\s\S]*?<\/template>/g, "");
  assert.match(html, /renderer-range-sum-303\.js/);
  assert.match(html, /range-sum-303\.css/);
  assert.doesNotMatch(active, /(?:renderer-)?range-sum-303\.(?:js|css)/);
  assert.match(registry, /prefix1DView\?\.kind === "range-sum-immutable"[\s\S]*renderRangeSum303View\(step\)/);
  assert.doesNotMatch(registry, /renderPrefix1DView/);
  assert.doesNotMatch(fs.readFileSync(require.resolve("../public/renderers-03.js"), "utf8"), /renderPrefix1DView/);
});
