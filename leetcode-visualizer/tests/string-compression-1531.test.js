"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[1531];

function encodedLength(value) {
  return value.replace(/(.)\1*/g, (run, char) => `${char}${run.length > 1 ? run.length : ""}`).length;
}

function bruteForce(s, k) {
  let best = Infinity;
  for (let mask = 0; mask < 2 ** s.length; mask += 1) {
    let deleted = 0;
    let kept = "";
    for (let i = 0; i < s.length; i += 1) {
      if (mask & (1 << i)) deleted += 1;
      else kept += s[i];
    }
    if (deleted <= k) best = Math.min(best, encodedLength(kept));
  }
  return best;
}

function createRenderer(language) {
  const host = { innerHTML: "" };
  const context = { escapeHtml: value => String(value ?? "") };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-string-compression-1531.js"), "utf8"), context);
  const Visualizer = vm.runInContext("StringCompression1531Visualizer", context);
  return { host, visualizer: new Visualizer({ host, language }) };
}

test("1531 DP matches brute-force deletion choices and reconstructs an optimal RLE", () => {
  const cases = [
    ["aaabcccd", 2],
    ["aabbaa", 2],
    ["aaaaaaaaaa", 0],
    ["aaaaaaaaaaa", 0],
    ["abc", 3],
    ["abc", 0],
    ["aabbcc", 2],
  ];
  let seed = 1531;
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  for (let testCase = 0; testCase < 40; testCase += 1) {
    const s = Array.from({ length: 3 + next() % 6 }, () => "abc"[next() % 3]).join("");
    cases.push([s, next() % (s.length + 1)]);
  }

  for (const [s, k] of cases) {
    const run = problem.builder(s, { k });
    const answer = bruteForce(s, k);
    assert.equal(run.answer, answer, `${s}, k=${k}`);
    const final = run.steps.at(-1).stringCompression1531View;
    assert.equal(final.compressed.length, answer, `${s}, k=${k}: ${final.compressed}`);
    assert.ok(final.kept.length >= s.length - k);
  }
});

test("1531 renderer shows the current string, branch comparison and final deletion result", () => {
  const run = problem.builder("aaabcccd", { k: 2 });
  const comparison = run.steps.find(step => step.stringCompression1531View.phase === "compare");
  const final = run.steps.at(-1);

  for (const language of ["en", "vi"]) {
    const { host, visualizer } = createRenderer(language);
    visualizer.render(comparison);
    assert.match(host.innerHTML, /sc1531-viz/);
    assert.match(host.innerHTML, /sc1531-char/);
    assert.match(host.innerHTML, /sc1531-choices/);
    assert.match(host.innerHTML, /sc1531-budget/);
    visualizer.render(final);
    assert.match(host.innerHTML, /sc1531-result/);
    assert.match(host.innerHTML, /a3c3/);
    assert.match(host.innerHTML, /<output>4<\/output>/);
    assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
  }
});

test("1531 dedicated assets are lazy-loaded and registered for its custom view", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const source = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  assert.match(html, /renderer-string-compression-1531\.js/);
  assert.match(html, /string-compression-1531\.css/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /renderer-string-compression-1531\.(?:js|css)/);
  assert.match(source, /Boolean\(step\.stringCompression1531View\)/);
});
