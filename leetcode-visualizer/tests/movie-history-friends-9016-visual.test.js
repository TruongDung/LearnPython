"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const problem = require("../problems").SUPPORTED[9016];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createRenderer() {
  const source = fs.readFileSync(path.resolve(__dirname, "../public/renderer-requested-visualizations.js"), "utf8");
  const element = {
    innerHTML: "",
    querySelector: () => null,
  };
  const context = {
    lang: "en",
    escapeHtml,
    pick: (value) => typeof value === "object" ? value.en : value,
    $: () => element,
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, element };
}

test("9016 compact renderer switches content by phase without scroll containers", () => {
  const run = problem.builder(problem.defaultInput, { k: 3, m: 3 });
  const { context, element } = createRenderer();

  for (const language of ["en", "vi"]) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderFriends9016View(step);
      assert.match(element.innerHTML, /rv-friends-9016/);
      assert.match(element.innerHTML, /rv-friend-summary/);
      assert.match(element.innerHTML, /rv-friend-histories/);
      assert.doesNotMatch(element.innerHTML, /rv-table-scroll|rv-index-list|undefined|NaN/);
      assert.ok((element.innerHTML.match(/class="rv-history/g) || []).length <= 6);
      assert.ok((element.innerHTML.match(/class="rv-index-bucket/g) || []).length <= 5);
    }
  }
});

test("9016 compact renderer keeps only the teaching surface relevant to each phase", () => {
  const run = problem.builder(problem.defaultInput, { k: 3, m: 3 });
  const { context, element } = createRenderer();
  const init = run.steps.find((step) => step.friends9016View.phase === "init");
  const index = run.steps.find((step) => step.friends9016View.phase === "index" && step.friends9016View.buckets.length);
  const evaluate = run.steps.find((step) => step.friends9016View.phase === "evaluate" && step.friends9016View.activePair);
  const done = run.steps.at(-1);

  context.renderFriends9016View(init);
  assert.match(element.innerHTML, /rv-friend-tip/);
  assert.doesNotMatch(element.innerHTML, /rv-friend-index|rv-friend-pairs|rv-friend-result/);

  context.renderFriends9016View(index);
  assert.match(element.innerHTML, /rv-friend-index/);
  assert.doesNotMatch(element.innerHTML, /rv-friend-pairs|rv-friend-result/);

  context.renderFriends9016View(evaluate);
  assert.match(element.innerHTML, /rv-friend-pairs/);
  assert.doesNotMatch(element.innerHTML, /rv-friend-index|rv-friend-result/);

  context.renderFriends9016View(done);
  assert.match(element.innerHTML, /rv-friend-done/);
  assert.match(element.innerHTML, /ann/);
  assert.match(element.innerHTML, /dan/);
  assert.doesNotMatch(element.innerHTML, /rv-friend-index|rv-friend-pairs/);
});

test("9016 scoped CSS uses compact wrapping instead of scrollable subpanels", () => {
  const css = fs.readFileSync(path.resolve(__dirname, "../public/requested-visualizations.css"), "utf8");
  assert.match(css, /\.rv-friends-9016 \{[^}]*container-type: inline-size;/);
  assert.match(css, /\.rv-friends-9016 \.rv-history > div \{[^}]*overflow: hidden;/);
  assert.match(css, /\.rv-friend-index \{[^}]*display: grid;/);
  assert.match(css, /\.rv-friend-result \{[^}]*grid-template-columns:/);
  assert.match(css, /@container \(max-width: 360px\)/);
});
