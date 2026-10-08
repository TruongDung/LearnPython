"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[9006];

function renderer() {
  const element = { innerHTML: "" };
  const context = {
    lang: "en", $: () => element,
    escapeHtml: (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, "../public/renderer-requested-visualizations.js"), "utf8"), context);
  return { context, element };
}

test("9006 shows first discovery, distance and enqueue on their own instructions", () => {
  const run = problem.builder("A-B,A-C,B-D,C-D,D-E", { start: "A", target: "E" });
  const queueInit = run.steps.find((step) => step.bfs9006View.operation === "queue-init").bfs9006View;
  assert.equal(queueInit.queueReady, true);
  assert.equal(queueInit.parentReady, false);
  assert.equal(queueInit.distanceReady, false);
  assert.equal(queueInit.nodes.filter((node) => node.discovered).length, 0);
  let previous = run.steps[0].bfs9006View;
  for (const step of run.steps.slice(1)) {
    const view = step.bfs9006View;
    const neighbor = view.nodes.find((node) => node.id === view.neighbor);
    if (view.operation === "set-parent") {
      assert.equal(neighbor.discovered, true);
      assert.equal(neighbor.distance, null);
      assert.equal(neighbor.parent, view.nodes.find((node) => node.id === view.current).name);
      assert.deepEqual(view.queue, previous.queue);
    }
    if (view.operation === "set-distance") {
      assert.equal(neighbor.distance, view.nodes.find((node) => node.id === view.current).distance + 1);
      assert.deepEqual(view.queue, previous.queue);
    }
    if (view.operation === "enqueue") {
      assert.deepEqual(view.queue.map((item) => item.id), [...previous.queue.map((item) => item.id), view.neighbor]);
    }
    if (view.operation === "dequeue") {
      assert.equal(view.current, previous.queue[0].id);
      assert.deepEqual(view.queue, previous.queue.slice(1));
    }
    if (view.operation === "continue") {
      assert.deepEqual(view.nodes.map((node) => [node.parent, node.distance]), previous.nodes.map((node) => [node.parent, node.distance]));
      assert.deepEqual(view.queue, previous.queue);
    }
    previous = view;
  }
  assert.equal(previous.nodes.find((node) => node.name === "D").parent, "B");
});

test("9006 renders cycles, disconnected targets and start equal to target in both languages", () => {
  const { context, element } = renderer();
  for (const [input, start, target, answer] of [
    ["A-B,A-C,B-D,C-D,D-E", "A", "E", ["A", "B", "D", "E"]],
    ["A-B,B-C,C-A,C-D", "A", "D", ["A", "C", "D"]],
    ["A-B,C-D", "A", "D", []],
    ["A-B", "A", "A", ["A"]],
  ]) {
    const run = problem.builder(input, { start, target });
    assert.deepEqual(run.answer, answer);
    for (const language of ["en", "vi"]) {
      context.lang = language;
      for (const step of run.steps) {
        context.renderBfs9006View(step);
        assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity|rv-bfs-workspace|rv-table-scroll/);
        const view = step.bfs9006View;
        if (view.operation === "set-parent") assert.match(element.innerHTML, /rv-bfs-neighbor-facts.*class="focus"/s);
        if (view.operation === "continue") assert.match(element.innerHTML, /∈ parent/);
        if (view.phase === "done") {
          assert.doesNotMatch(element.innerHTML, /rv-bfs-queue-panel|rv-bfs-instruction/);
          assert.match(element.innerHTML, answer.length ? /rv-bfs-result-note found/ : /rv-bfs-result-note unreachable/);
          assert.equal(view.distance, answer.length ? answer.length - 1 : null);
        }
      }
    }
  }
});

test("9006 keeps the backward parent chain distinct from the final route", () => {
  const run = problem.builder("A-B,B-C,C-D", { start: "A", target: "D" });
  const { context, element } = renderer();
  const collected = [];
  for (const step of run.steps) {
    const view = step.bfs9006View;
    context.renderBfs9006View(step);
    if (view.operation === "path-append") {
      collected.push(view.nodes.find((node) => node.id === view.current).name);
      assert.deepEqual(view.path, collected);
      assert.match(element.innerHTML, /Collect path · target → start/);
      assert.doesNotMatch(element.innerHTML, /Route · start → target/);
    }
    if (view.operation === "reachable-check") assert.doesNotMatch(element.innerHTML, /rv-bfs-route/);
    if (view.operation === "path-reverse") {
      assert.deepEqual(view.path, ["A", "B", "C", "D"]);
      assert.match(element.innerHTML, /Route · start → target/);
    }
  }
  assert.deepEqual(collected, ["D", "C", "B", "A"]);
});

test("9006 keeps a wide queue's front and new back visible and escapes full node names", () => {
  const names = Array.from({ length: 23 }, (_, i) => i === 0 ? "<node&name>" : `long_node_${String(i).padStart(2, "0")}_abcdefghijklmnop`);
  const run = problem.builder(JSON.stringify(names.map((name) => ["S", name])), { start: "S", target: names.at(-1) });
  const { context, element } = renderer();
  const append = run.steps.filter((step) => step.bfs9006View.operation === "enqueue").at(-1);
  context.renderBfs9006View(append);
  const mainQueue = element.innerHTML.split('class="rv-bfs-queue-items">')[1].split("</div>")[0];
  assert.match(mainQueue, /rv-bfs-q-item front/);
  assert.match(mainQueue, /rv-bfs-q-item focus/);
  assert.ok(mainQueue.includes(append.bfs9006View.queue.at(-1).name));
  assert.doesNotMatch(element.innerHTML, /<node&name>|NaN|undefined/);
  assert.match(element.innerHTML, /&lt;node&amp;name&gt;/);
  const graph = context.requestedBfsGraph(append.bfs9006View);
  assert.equal((graph.match(/class="rv-bfs-map-node /g) || []).length, 24);
  assert.equal((graph.match(/class="rv-bfs-map-edge /g) || []).length, 23);
  assert.doesNotMatch(graph, /NaN|undefined|Infinity/);
});
