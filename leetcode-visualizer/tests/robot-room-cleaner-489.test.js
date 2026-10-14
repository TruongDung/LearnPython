"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const { SUPPORTED } = require("../problems");
const { readFrontendIndex, readFrontendJavaScript } = require("./helpers/frontend-source");
const problem = SUPPORTED[489];
const INPUT = "1,1,1;1,0,1;1,1,1";

test("489 registers a line-by-line DFS simulation and cleans every reachable cell", () => {
  assert.equal(problem.id, 489);
  assert.equal(problem.slug, "robot-room-cleaner");
  assert.equal(problem.debugMode, "line-by-line");
  const result = problem.builder(INPUT);
  assert.equal(result.answer, 8);
  assert.equal(result.steps.filter((step) => step.final).length, 1);
  assert.ok(result.steps.every((step) => step.robotRoomCleaner489View));
  assert.ok(result.steps.every((step) => step.codeLines.every((line) => line >= 1 && line <= problem.code.length)));
  assert.ok(result.steps.some((step) => step.robotRoomCleaner489View.action === "move"));
  assert.ok(result.steps.some((step) => step.robotRoomCleaner489View.action === "check"));
  assert.ok(result.steps.some((step) => step.robotRoomCleaner489View.action === "backtrack"));
  assert.ok(result.steps.some((step) => step.robotRoomCleaner489View.action === "blocked"));
  assert.ok(result.steps.some((step) => step.robotRoomCleaner489View.action === "turn"));
  for (const line of [5, 6, 7, 10, 11, 12, 13, 14, 15, 16]) {
    assert.ok(result.steps.some((step) => step.codeLines.includes(line)), `line ${line} should be traceable`);
  }
  assert.deepEqual(result.steps.at(-1).robotRoomCleaner489View.cleaned.sort(), [
    "0,0", "0,1", "0,2", "1,0", "1,2", "2,0", "2,1", "2,2",
  ]);
});

test("489 snapshots preserve robot position, facing, DFS stack, and attempted edge", () => {
  const { steps } = problem.builder(INPUT);
  const check = steps.find((step) => step.robotRoomCleaner489View.action === "check");
  assert.deepEqual(check.robotRoomCleaner489View.current, [0, 0]);
  assert.deepEqual(check.robotRoomCleaner489View.attempt.from, [0, 0]);
  assert.deepEqual(check.robotRoomCleaner489View.attempt.to, [0, 1]);
  assert.equal(check.robotRoomCleaner489View.attempt.outcome, "move");
  assert.equal(check.robotRoomCleaner489View.path.length, 1);

  const entering = steps.find((step) => step.robotRoomCleaner489View.action === "move");
  assert.deepEqual(entering.robotRoomCleaner489View.current, [0, 1]);
  assert.equal(entering.codeLines.length, 1);

  const child = steps.find((step) => step.title.en === "clean (0,1)");
  assert.deepEqual(child.robotRoomCleaner489View.current, [0, 1]);
  assert.equal(child.robotRoomCleaner489View.path.length, 2);

  const returnStep = steps.find((step) =>
    step.robotRoomCleaner489View.action === "backtrack" &&
    step.robotRoomCleaner489View.attempt.from.join(",") === "0,1");
  assert.deepEqual(returnStep.robotRoomCleaner489View.current, [0, 0]);
  assert.equal(returnStep.robotRoomCleaner489View.attempt.outcome, "backtrack");
});

test("489 dedicated renderer shows the room, robot, DFS stack, and current source line", () => {
  const host = { innerHTML: "" };
  const context = {
    lang: "en",
    $: () => host,
    escapeHtml: (value) => String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]),
  };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, "../public/renderer-robot-room-cleaner-489.js"), "utf8"),
    context,
  );

  const { steps } = problem.builder(INPUT);
  const samples = [
    steps[0],
    steps.find((step) => step.robotRoomCleaner489View.action === "move"),
    steps.find((step) => step.robotRoomCleaner489View.action === "backtrack"),
    steps.find((step) => step.robotRoomCleaner489View.action === "blocked"),
    steps.at(-1),
  ];
  for (const language of ["en", "vi"]) {
    context.lang = language;
    for (const step of samples) {
      context.renderRobotRoomCleaner489View(step);
      assert.match(host.innerHTML, /rrc489-board/);
      assert.match(host.innerHTML, /rrc489-stack/);
      assert.match(host.innerHTML, /rrc489-debug/);
      assert.equal((host.innerHTML.match(/class="rrc489-cell/g) || []).length, 9);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test("489 renderer and responsive stylesheet are loaded before app dispatch", () => {
  const html = readFrontendIndex();
  const javascript = readFrontendJavaScript();
  const styles = fs.readFileSync(path.join(__dirname, "../public/robot-room-cleaner-489.css"), "utf8");
  assert.equal(html.split("robot-room-cleaner-489.css?").length - 1, 1);
  assert.equal(html.split("renderer-robot-room-cleaner-489.js?").length - 1, 1);
  assert.ok(html.indexOf("renderer-robot-room-cleaner-489.js") < html.indexOf("script.js?"));
  assert.match(javascript, /step\.robotRoomCleaner489View/);
  assert.match(javascript, /renderRobotRoomCleaner489View\(step\)/);
  assert.match(styles, /\.rrc489-viz\{/);
  assert.match(styles, /@container \(max-width:620px\)/);
});
