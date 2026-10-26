"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[1275];
const examples = [
  { moves: [[0, 0], [2, 0], [1, 1], [2, 1], [2, 2]], answer: "A" },
  { moves: [[0, 0], [1, 1], [0, 1], [1, 0], [2, 2], [1, 2]], answer: "B" },
  { moves: [[0, 0], [1, 1], [2, 0], [1, 0], [1, 2], [2, 1], [0, 1], [0, 2], [2, 2]], answer: "Draw" },
  { moves: [[0, 0], [1, 1]], answer: "Pending" }, { moves: [], answer: "Pending" },
];
const masks = [0b000000111, 0b000111000, 0b111000000, 0b001001001, 0b010010010, 0b100100100, 0b100010001, 0b001010100];
function oracle(moves) {
  const boards = [0, 0];
  moves.forEach(([r, c], i) => { boards[i % 2] |= 1 << (r * 3 + c); });
  for (let p = 0; p < 2; p++) if (masks.some(mask => (boards[p] & mask) === mask)) return p ? "B" : "A";
  return moves.length === 9 ? "Draw" : "Pending";
}
const seeds = [
  [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]],
  [[1, 0], [0, 0], [1, 1], [0, 1], [1, 2]],
  examples[0].moves,
  [[1, 0], [0, 0], [2, 1], [0, 1], [2, 2], [0, 2]],
  examples[1].moves,
  [[0, 1], [0, 0], [1, 0], [1, 1], [2, 1], [2, 2]],
];
const winningGames = seeds.flatMap(moves => [false, true].flatMap(reflect => Array.from({ length: 4 }, (_, rotations) => moves.map(([r, c]) => {
  if (reflect) c = 2 - c;
  for (let i = 0; i < rotations; i++) [r, c] = [c, 2 - r];
  return [r, c];
}))));

test("1275 agrees with a bitboard oracle for all winning geometries and every legal prefix", () => {
  const coverage = new Set();
  for (const moves of [...examples.map(e => e.moves), ...winningGames]) {
    const before = JSON.stringify(moves);
    for (let length = 0; length <= moves.length; length++) {
      const prefix = moves.slice(0, length), run = problem.builder(prefix), expected = oracle(prefix);
      assert.equal(run.answer, expected);
      assert.equal(run.steps.filter(step => step.final).length, 1);
      const end = run.steps.at(-1).ticTacToe1275View;
      assert.equal(end.placed, length);
      assert.equal(end.board.flat().filter(Boolean).length, length);
      if (["A", "B"].includes(expected)) {
        const line = end.lines[end.activeLine].cells;
        assert.ok(line.every(cell => end.board[Math.floor(cell / 3)][cell % 3] === expected));
        coverage.add(`${expected}:${line.reduce((mask, cell) => mask | (1 << cell), 0)}`);
      } else assert.equal(end.activeLine, null);
    }
    assert.equal(JSON.stringify(moves), before);
  }
  assert.equal(coverage.size, 16, "both players can win on all 8 line geometries");
  for (const e of examples) assert.equal(problem.builder(e.moves).answer, e.answer);
});

test("1275 board state and actual local watches agree with Python after each displayed statement", () => {
  const python = `import sys,json,copy
${problem.code.join("\n")}
out=[]
for moves in json.load(sys.stdin):
    events,pending=[],None
    def snapshot(frame,line):
        s=frame.f_locals
        events.append({'line':line-1,'board':copy.deepcopy(s['board']),'watches':[s.get('i','—'),s.get('r','—'),s.get('c','—'),s.get('player','—'),len(s['moves'])]})
    def trace(frame,event,arg):
        global pending
        if frame.f_code.co_name!='tictactoe': return trace
        if event=='line':
            if pending is not None: snapshot(frame,pending)
            pending=frame.f_lineno
        elif event=='return':
            snapshot(frame,pending)
            pending=None
        return trace
    sys.settrace(trace)
    answer=Solution().tictactoe(moves)
    sys.settrace(None)
    out.append({'answer':answer,'events':events})
print(json.dumps(out))`;
  const cases = [...examples.map(e => e.moves), ...winningGames];
  const proc = spawnSync("python3", ["-c", python], { input: JSON.stringify(cases), encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  assert.equal(proc.status, 0, proc.stderr);
  JSON.parse(proc.stdout).forEach((reference, i) => {
    const run = problem.builder(cases[i]); let cursor = 0;
    assert.equal(run.answer, reference.answer);
    for (const step of run.steps) {
      assert.deepEqual(step.vars.map(v => v.name), ["i", "r", "c", "player", "len(moves)", "line match"]);
      assert.equal(step.codeLines.length, 1);
      while (cursor < reference.events.length && reference.events[cursor].line !== step.codeLines[0]) cursor++;
      assert.ok(cursor < reference.events.length, `case ${i}, line ${step.codeLines[0]}`);
      const e = reference.events[cursor++];
      assert.deepEqual(step.vars.slice(0, 5).map(v => v.value), e.watches, `case ${i}, line ${step.codeLines[0]}`);
      assert.deepEqual(step.ticTacToe1275View.board, e.board);
    }
  });
});

test("1275 accepts row-col and JSON moves, and rejects overwritten cells or moves after a win", () => {
  for (const input of [problem.defaultInput, JSON.stringify(examples[0].moves), examples[0].moves]) {
    assert.deepEqual(problem.liveArgs(input), [examples[0].moves]);
    assert.equal(problem.builder(input).answer, "A");
  }
  for (const input of ["", "[]", []]) assert.equal(problem.builder(input).answer, "Pending");
  const frozen = Object.freeze(examples[0].moves.map(point => Object.freeze([...point])));
  assert.equal(problem.builder(frozen).answer, "A");
  for (const input of [null, {}, "0-0junk", "0-0,", "3-0", "-1-0", "0-0,0-0", "[[0,0],[1]]", "[[0,0,1]]", [[1.5, 0]], [["0", 0]], [...examples[0].moves, [0, 1]], Array.from({ length: 10 }, () => [0, 0])]) {
    assert.throws(() => problem.builder(input)); assert.throws(() => problem.liveArgs(input));
  }
});

function renderer() {
  const host = { innerHTML: "" }, context = { lang: "vi", $: () => host, escapeHtml: value => String(value).replace(/[&<>"']/g,
    char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-tic-tac-toe-1275.js"), "utf8"), context);
  return { context, render: step => { context.renderTicTacToe1275(step); return host.innerHTML; } };
}

test("1275 pictures preserve all 9 cells, order badges and eight check patterns in both languages", () => {
  const { context, render } = renderer();
  for (const lang of ["vi", "en"]) for (const { moves } of examples) {
    context.lang = lang;
    const run = problem.builder(moves), original = JSON.stringify(run);
    for (const step of run.steps) {
      const v = step.ticTacToe1275View, html = render(step);
      assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object|<p[ >]|<table[ >]/);
      const cells = [...html.matchAll(/data-cell="(\d),(\d)" data-player="([AB]?)"/g)];
      assert.equal(cells.length, 9);
      for (const [, r, c, player] of cells) assert.equal(player, v.board[Number(r)][Number(c)]);
      assert.equal((html.match(/class="tt1275-order"/g) || []).length, v.placed);
      assert.equal((html.match(/data-pattern="/g) || []).length, 8);
      assert.equal((html.match(/data-move-index="/g) || []).length, moves.length);
      for (const m of html.matchAll(/data-pattern="(\d)" data-result="(true|false|null)"/g)) {
        assert.equal(m[2], String(v.player ? v.tests[v.player][Number(m[1])] : null));
      }
      if (["A", "B"].includes(v.answer)) assert.match(html, /class="tt1275-winning-line/);
      else assert.doesNotMatch(html, /class="tt1275-winning-line/);
    }
    const first = render(run.steps[0]); render(run.steps.at(-1)); assert.equal(render(run.steps[0]), first);
    assert.equal(JSON.stringify(run), original);
  }
});

test("1275 previews a move before placement and reveals each check result only when its guard executes", () => {
  const { render } = renderer(), steps = problem.builder(problem.defaultInput).steps;
  let lastPlaced = 0;
  for (const step of steps) {
    const v = step.ticTacToe1275View, html = render(step);
    if (v.phase === "choose") {
      assert.equal(v.placed, lastPlaced);
      const [r, c] = v.moves[v.moveIndex]; assert.equal(v.board[r][c], "");
      assert.match(html, /tt1275-mark [AB] preview/);
    }
    if (v.phase === "place") { assert.equal(v.placed, lastPlaced + 1); lastPlaced = v.placed; }
    if (["init", "choose", "place"].includes(v.phase)) {
      assert.ok([...v.tests.A, ...v.tests.B].every(result => result === null));
      assert.doesNotMatch(html, /tt1275-winning-line/);
    }
    if (v.phase === "line") assert.equal(v.tests[v.player][v.activeLine], null);
    if (v.phase === "check") {
      const line = v.lines[v.activeLine];
      assert.equal(v.match, line.cells.every(cell => v.board[Math.floor(cell / 3)][cell % 3] === v.player));
      assert.equal(v.tests[v.player][v.activeLine], v.match);
    }
  }
});

test("1275 loads its own scoped renderer and keeps code unwrapped with horizontal scrolling", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8"), script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/tic-tac-toe-1275.css"), "utf8");
  assert.match(html, /tic-tac-toe-1275\.css[^\n]*data-problem-ids="1275"/);
  assert.match(html, /renderer-tic-tac-toe-1275\.js[^\n]*data-problem-ids="1275"/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /(?:renderer-)?tic-tac-toe-1275\.(?:css|js)/);
  assert.match(script, /Boolean\(step.ticTacToe1275View\)[^\n]*renderTicTacToe1275\(step\)/);
  assert.match(css, /\.code-panel\s*\{[^}]*overflow-x:auto/);
  assert.match(css, /\.code-line\s*\{[^}]*width:max-content; min-width:100%; white-space:pre/);
  assert.match(css, /\.code-line \.txt\s*\{[^}]*flex:0 0 auto; white-space:pre; overflow-wrap:normal/);
  assert.match(css, /\[data-theme="light"\] \.tt1275-viz/);
});
