"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const problem = require("../problems").SUPPORTED[629];
const root = path.resolve(__dirname, "..");
const frame = (step) => step.inversePairs629View;

function oracle(n, k) {
  let dp = [1];
  for (let size = 1; size <= n; size += 1) {
    const next = Array(size * (size - 1) / 2 + 1).fill(0);
    for (let previous = 0; previous < dp.length; previous += 1) {
      for (let added = 0; added < size; added += 1) next[previous + added] += dp[previous];
    }
    dp = next;
  }
  return dp[k] ?? 0;
}

test("629 matches known examples and every visualized input", () => {
  assert.equal(problem.builder([3], { k: 0 }).answer, 1);
  assert.equal(problem.builder([3], { k: 1 }).answer, 2);
  assert.equal(problem.builder([4], { k: 5 }).answer, 3);
  for (let n = 1; n <= 8; n += 1) {
    for (let k = 0; k <= 28; k += 1) assert.equal(problem.builder([n], { k }).answer, oracle(n, k), `${n},${k}`);
  }
});

test("629 trace keeps exact DP cells and a valid witness", () => {
  const run = problem.builder([6], { k: 8 });
  assert.ok(run.steps.every((step) => step.codeLines.length === 1 && step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  assert.ok(run.steps.some((step) => frame(step).event === "add-window-right"));
  assert.ok(run.steps.some((step) => frame(step).event === "remove-window-left"));
  assert.ok(run.steps.some((step) => frame(step).event === "write-next-cell"));
  const final = frame(run.steps.at(-1));
  assert.equal(final.witness.inversionCount, 8);
  assert.equal(final.witness.pairs.length, 8);
  assert.equal(final.witness.valid, true);
  assert.equal(final.answer, oracle(6, 8));
});

test("629 validates inputs and displayed Python agrees", () => {
  for (const [input, params] of [[[], { k: 1 }], [[0], { k: 1 }], [[9], { k: 1 }], [[3], { k: -1 }], [[3], { k: 29 }]]) {
    assert.throws(() => problem.builder(input, params), /K Inverse Pairs/);
  }
  const cases = [[3, 0], [3, 1], [4, 5], [8, 14], [2, 2]];
  const source = `${problem.code.join("\n")}\nimport json, sys\nprint(json.dumps([Solution().kInversePairs(n, k) for n, k in json.load(sys.stdin)]))`;
  const execution = spawnSync("python3", ["-c", source], { input: JSON.stringify(cases), encoding: "utf8" });
  assert.equal(execution.status, 0, execution.stderr);
  assert.deepEqual(JSON.parse(execution.stdout), cases.map(([n, k]) => oracle(n, k)));
});

test("629 renderer is picture-first in Vietnamese and English", () => {
  const host = { innerHTML: "" };
  const context = { lang: "en", $: () => host };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, "public/renderer-k-inverse-pairs-629.js"), "utf8"), context);
  const steps = problem.builder([4], { k: 5 }).steps;
  for (const language of ["en", "vi"]) {
    context.lang = language;
    for (const step of steps) {
      context.renderKInversePairs629View(step);
      assert.match(host.innerHTML, /kip629-viz/);
      assert.match(host.innerHTML, /kip629-(?:insert|pairs-picture)/);
      assert.match(host.innerHTML, /kip629-matrix/);
      assert.doesNotMatch(host.innerHTML, /kip629-rail|kip629-counters|undefined|NaN|Infinity/);
    }
  }
  context.renderKInversePairs629View(steps.at(-1));
  assert.equal((host.innerHTML.match(/data-pair=/g) || []).length, 5);
  assert.match(host.innerHTML, /kip629-witness/);
  assert.doesNotMatch(host.innerHTML, /<strong>\?<\/strong>/);
});

test("629 uses responsive, lazy visualization assets", () => {
  const html = fs.readFileSync(path.join(root, "public/index.html"), "utf8");
  const css = fs.readFileSync(path.join(root, "public/k-inverse-pairs-629.css"), "utf8");
  assert.match(html, /k-inverse-pairs-629\.css\?v=k-inverse-pairs-629-pictures-v2/);
  assert.match(html, /renderer-k-inverse-pairs-629\.js\?v=k-inverse-pairs-629-pictures-v2/);
  assert.match(css, /\.kip629-arcs path/);
  assert.match(css, /@container kip629 \(max-width:620px\)/);
  assert.match(css, /\[data-theme="light"\] \.kip629-viz/);
});
