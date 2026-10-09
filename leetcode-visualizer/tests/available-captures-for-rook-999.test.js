"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const { SUPPORTED } = require("../problems");
const { readFrontendIndex, readFrontendJavaScript, readFrontendStyles } = require("./helpers/frontend-source");
const problem = SUPPORTED[999];

const boards = [
  ["........|...p....|...R...p|........|........|...p....|........|........", 3],
  ["........|.p.p.p..|...p....|.p.R.p..|...p....|.p.p.p..|........|........", 4],
  ["........|........|........|..BRp...|........|........|........|........", 1],
  ["...p....|...B....|........|p..R..Bp|........|...B....|...p....|........", 1],
  ["R.......|........|........|........|........|........|........|.......p", 0],
];

function parse(input) {
  return input.split("|").map((row) => [...row]);
}

function oracle(input) {
  const board = parse(input);
  let rook;
  for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) if (board[row][col] === "R") rook = [row, col];
  let answer = 0;
  for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    let row = rook[0] + dr; let col = rook[1] + dc;
    while (row >= 0 && row < 8 && col >= 0 && col < 8) {
      if (board[row][col] === "B") break;
      if (board[row][col] === "p") { answer++; break; }
      row += dr; col += dc;
    }
  }
  return answer;
}

test("999 registers the matrix simulation and returns known capture counts", () => {
  assert.equal(problem.id, 999);
  assert.equal(problem.slug, "available-captures-for-rook");
  assert.equal(problem.difficulty, "easy");
  assert.equal(problem.category.key, "array");
  assert.equal(problem.debugMode, "line-by-line");
  for (const [input, expected] of boards) {
    const run = problem.builder(input);
    assert.equal(run.answer, expected);
    assert.equal(run.answer, oracle(input));
    assert.deepEqual(problem.liveArgs(input), [parse(input)]);
    assert.equal(run.steps.filter((step) => step.final).length, 1);
    assert.equal(run.steps.at(-1).rook999View.captures, expected);
  }
});

test("999 rejects malformed boards outside the original constraints", () => {
  for (const input of [
    "", "R.......", "R.......|........|........|........|........|........|........",
    "R.......|........|........|........|........|........|........|........|........",
    "R.......|........|........|........|........|........|........|.......x",
    "........|........|........|........|........|........|........|........",
    "RR......|........|........|........|........|........|........|........",
    null, [], 999,
  ]) {
    assert.throws(() => problem.builder(input));
    assert.throws(() => problem.liveArgs(input));
  }
});

test("999 trace scans each ray until the first bishop, pawn, or board edge", () => {
  for (const [input, expected] of boards) {
    const run = problem.builder(input);
    const final = run.steps.at(-1).rook999View;
    assert.equal(final.captures, expected);
    assert.equal(final.scanned.filter((cell) => cell.piece === "p" && final.captured.some(([row, col]) => row === cell.row && col === cell.col)).length, expected);
    assert.equal(Object.values(final.directionStates).filter((state) => state === "captured").length, expected);
    for (const step of run.steps) {
      const view = step.rook999View;
      assert.equal(step.codeLines.length, 1);
      assert.equal(view.source, problem.code[step.codeLines[0] - 1]);
      assert.ok(Object.isFrozen(view));
      assert.ok(view.scanned.every((cell) => cell.row >= 0 && cell.row < 8 && cell.col >= 0 && cell.col < 8));
      const rayCells = new Map();
      for (const cell of view.scanned) {
        assert.ok(!rayCells.has(`${cell.direction}:${cell.row},${cell.col}`), "a ray must not inspect one square twice");
        rayCells.set(`${cell.direction}:${cell.row},${cell.col}`, true);
      }
    }
  }
  const bishopCase = problem.builder(boards[3][0]);
  const edgeCase = problem.builder(boards[4][0]);
  assert.ok(bishopCase.steps.some((step) => step.rook999View.event === "bishop-stop"));
  assert.ok(bishopCase.steps.some((step) => step.rook999View.event === "pawn-stop"));
  assert.ok(edgeCase.steps.some((step) => step.rook999View.event === "edge-stop"));
});

test("999 displayed Python matches the repository solution and visualization", () => {
  const repositoryPath = path.resolve(__dirname, "../../Leetcode-sln/array/Leetcode_999.py");
  const repository = fs.readFileSync(repositoryPath, "utf8").replace(/\r\n/g, "\n").trimEnd();
  assert.equal(repository, problem.code.join("\n"));
  const checks = boards.map(([input, expected]) => `assert Solution().numRookCaptures(${JSON.stringify(parse(input))}) == ${expected}`);
  const run = spawnSync(process.env.PYTHON || "python3", ["-c", `${repository}\n${checks.join("\n")}`], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
});

test("999 dedicated renderer covers board, rays, direction outcomes, and both languages", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "../public/renderer-available-captures-for-rook-999.js"), "utf8");
  const element = {};
  const context = { lang: "en", $: () => element };
  vm.createContext(context);
  vm.runInContext(source, context);
  const run = problem.builder(boards[3][0]);
  const edgeRun = problem.builder(boards[4][0]);
  const samples = [
    run.steps[0],
    run.steps.find((step) => step.rook999View.event === "rook-found"),
    run.steps.find((step) => step.rook999View.event === "bishop-stop"),
    run.steps.find((step) => step.rook999View.event === "capture"),
    edgeRun.steps.find((step) => step.rook999View.event === "edge-stop"),
    run.steps.at(-1),
  ];
  for (const language of ["en", "vi"]) {
    context.lang = language;
    for (const step of samples) {
      context.renderAvailableCapturesForRook999View(step);
      assert.match(element.innerHTML, /rook999-viz/);
      assert.match(element.innerHTML, /rook999-board/);
      assert.match(element.innerHTML, /rook999-directions/);
      assert.match(element.innerHTML, /rook999-ray/);
      assert.equal((element.innerHTML.match(/class="rook999-cell/g) || []).length, 64);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
  context.lang = "en";
  context.renderAvailableCapturesForRook999View(run.steps.at(-1));
  assert.match(element.innerHTML, /rook999-result is-final/);
});

test("999 frontend loads its dedicated renderer and responsive styles", () => {
  const html = readFrontendIndex();
  const javascript = readFrontendJavaScript();
  const css = readFrontendStyles();
  assert.equal(html.split("available-captures-for-rook-999.css?").length - 1, 1);
  assert.equal(html.split("renderer-available-captures-for-rook-999.js?").length - 1, 1);
  assert.match(javascript, /step\.rook999View/);
  assert.match(javascript, /renderAvailableCapturesForRook999View\(step\)/);
  assert.match(css, /\.rook999-viz \{/);
  assert.match(css, /\[data-theme="light"\] \.rook999-viz/);
  assert.match(css, /@container \(max-width:540px\)/);
});
