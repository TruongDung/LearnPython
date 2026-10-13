"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[496];

const view = (step) => step.nextGreater496View;

test("496 answers nums1 lookups from the next-greater map", () => {
  const result = problem.builder(problem.defaultInput, { nums2: "1,3,4,2" });
  assert.deepEqual(result.answer, [-1, 3, -1]);
  assert.deepEqual(result.steps.at(-1).nextGreater496View.result, [-1, 3, -1]);
});

test("496 shows each next-greater pop and map insertion", () => {
  const result = problem.builder("2,1,3", { nums2: "2,1,3" });
  const trace = result.steps.map(view);
  const resolved = trace.find((step) => step.resolved?.value === 1);
  assert.ok(resolved);
  assert.equal(resolved.value, 3);
  const inserted = trace.find((step) => step.nextGreater.some(({ from, to }) => from === 1 && to === 3));
  assert.ok(inserted);
  assert.deepEqual(result.answer, [3, 3, -1]);
});

test("496 custom renderer emphasizes array, stack, mappings, and answers", () => {
  const host = { innerHTML: "" };
  const context = {
    lang: "en",
    $: () => host,
    escapeHtml: (value) => String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]),
    pick: (value) => value[context.lang],
  };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, "../public/renderer-next-greater-496.js"), "utf8"),
    context,
  );

  const trace = problem.builder(problem.defaultInput, { nums2: "1,3,4,2" }).steps;
  for (const language of ["vi", "en"]) {
    context.lang = language;
    for (const step of trace) {
      context.renderNextGreater496View(step);
      assert.match(host.innerHTML, /nge496-viz/);
      assert.match(host.innerHTML, /nge496-array/);
      assert.match(host.innerHTML, /nge496-stack/);
      assert.match(host.innerHTML, /nge496-map/);
      assert.match(host.innerHTML, /nge496-results/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
    }
  }
  assert.match(host.innerHTML, /nge496-answer filled/);
  assert.match(host.innerHTML, />3<\/strong>/);
});

test("496 visualization styles and renderer are problem-lazy", () => {
  const root = path.resolve(__dirname, "..");
  const html = fs.readFileSync(path.join(root, "public/index.html"), "utf8");
  const activeHtml = html.replace(/<template[\s\S]*?<\/template>/g, "");
  const script = fs.readFileSync(path.join(root, "public/script.js"), "utf8");
  assert.match(html, /<template id="problemVisualizationStyles"[\s\S]*next-greater-496\.css[\s\S]*<\/template>/);
  assert.match(html, /<template id="problemVisualizationScripts"[\s\S]*renderer-next-greater-496\.js[\s\S]*<\/template>/);
  assert.doesNotMatch(activeHtml, /next-greater-496\.(?:css|js)/);
  assert.match(script, /step\.nextGreater496View[\s\S]*renderNextGreater496View\(step\)/);
});
