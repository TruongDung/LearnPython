"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[2291];

function bruteForce(present, future, budget) {
  let best = 0;
  for (let mask = 0; mask < 2 ** present.length; mask++) {
    let cost = 0;
    let profit = 0;
    for (let i = 0; i < present.length; i++) {
      if ((mask >> i) & 1) {
        cost += present[i];
        profit += future[i] - present[i];
      }
    }
    if (cost <= budget) best = Math.max(best, profit);
  }
  return best;
}

test("2291 is registered with line-by-line 0/1 knapsack and official examples", () => {
  assert.equal(problem.slug, "maximum-profit-from-trading-stocks");
  assert.equal(problem.debugMode, "line-by-line");
  assert.ok(problem.tags.some((tag) => tag.key === "0-1-knapsack"));
  assert.equal(problem.code.length, 9);
  const examples = [
    ["5,4,6,2,3;8,5,4,3,5", 10, 6],
    ["2,2,5;3,4,10", 6, 5],
    ["3,3,12;0,3,15", 10, 0],
  ];
  for (const [input, budget, expected] of examples) {
    const result = problem.builder(input, { budget });
    assert.equal(result.answer, expected);
    assert.ok(result.steps.every((step) => step.tradingStocks2291View));
    assert.ok(result.steps.every((step) => step.codeLines.length === 1
      && step.codeLines[0] >= 1
      && step.codeLines[0] <= problem.code.length));
    assert.equal(result.steps.filter((step) => step.final).length, 1);
    assert.equal(result.steps.at(-1).codeLines[0], 9);
  }
});

test("2291 descending capacities prevent buying one stock more than once", () => {
  const result = problem.builder("2;5", { budget: 4 });
  assert.equal(result.answer, 3);
  const updates = result.steps.filter((step) => step.tradingStocks2291View.line === 8)
    .map((step) => [step.tradingStocks2291View.money, step.tradingStocks2291View.dp[step.tradingStocks2291View.money]]);
  assert.deepEqual(updates, [[4, 3], [3, 3], [2, 3]]);
  assert.ok(result.steps.some((step) => step.tradingStocks2291View.line === 7
    && step.tradingStocks2291View.money === 4));
});

test("2291 matches an exhaustive subset oracle, including free, unprofitable, and unaffordable stocks", () => {
  const cases = [
    [[0, 2, 4], [3, 1, 10], 4],
    [[3, 3], [2, 6], 3],
    [[5], [100], 4],
    [[0], [0], 0],
  ];
  for (let seed = 1; seed <= 80; seed++) {
    let value = seed;
    const next = (max) => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value % max;
    };
    const n = 1 + next(8);
    cases.push([
      Array.from({ length: n }, () => next(8)),
      Array.from({ length: n }, () => next(12)),
      next(20),
    ]);
  }
  for (const [present, future, budget] of cases) {
    const input = { present, future };
    assert.equal(problem.builder(input, { budget }).answer, bruteForce(present, future, budget));
  }
});

test("2291 parses supported input forms, validates constraints, and condenses large traces", () => {
  assert.deepEqual(problem.liveArgs("1,7;3,4", { budget: 5 }), [[1, 7], [3, 4], 5]);
  assert.deepEqual(problem.liveArgs("[[1,7],[3,4]]", { budget: 5 }), [[1, 7], [3, 4], 5]);
  assert.deepEqual(problem.liveArgs({ present: [1, 7], future: [3, 4], budget: 5 }), [[1, 7], [3, 4], 5]);
  for (const input of ["", "1,2;3", "1;3,4", "-1;2", "0.5;1", "[invalid]", { present: [1], future: [1, 2] }]) {
    assert.throws(() => problem.builder(input), /2291:/);
  }
  assert.throws(() => problem.builder("1;2", { budget: 1001 }), /2291:/);
  const large = problem.builder({ present: Array(50).fill(1), future: Array(50).fill(2) }, { budget: 100 });
  assert.equal(large.answer, 50);
  assert.equal(large.steps.length, 1);
  assert.equal(large.steps[0].tradingStocks2291View.mode, "summary");
  assert.equal(large.steps[0].tradingStocks2291View.dp.length, 101);
});

test("2291 renderer displays the stock cards, comparison, budget cells, and result in Vietnamese and English", () => {
  const host = { innerHTML: "", querySelectorAll: () => [] };
  const context = {
    lang: "vi",
    $: (id) => id === "treeView" ? host : null,
    escapeHtml: (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-trading-stocks-2291.js"), "utf8"), context);
  const result = problem.builder("2,2,5;3,4,10", { budget: 6 });
  const transition = result.steps.find((step) => step.tradingStocks2291View.line === 8);
  for (const language of ["vi", "en"]) {
    context.lang = language;
    context.renderTradingStocks2291View(transition);
    assert.match(host.innerHTML, /t2291-stock/);
    assert.match(host.innerHTML, /t2291-decision/);
    assert.match(host.innerHTML, /t2291-cells/);
    assert.doesNotMatch(host.innerHTML, /undefined|NaN|\[object Object\]/);
    context.renderTradingStocks2291View(result.steps.at(-1));
    assert.match(host.innerHTML, /t2291-result/);
    assert.match(host.innerHTML, />5</);
  }
});

test("2291 visualization assets are lazy-loaded for the problem", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  assert.match(html, /trading-stocks-2291\.css[^>]*data-problem-ids="2291"/);
  assert.match(html, /renderer-trading-stocks-2291\.js[^>]*data-problem-ids="2291"/);
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  assert.match(script, /step\.tradingStocks2291View/);
});

test("2291 displayed Python code runs in CPython and matches the visualization", () => {
  const cases = [
    [[5, 4, 6, 2, 3], [8, 5, 4, 3, 5], 10],
    [[2, 2, 5], [3, 4, 10], 6],
    [[3, 3, 12], [0, 3, 15], 10],
  ];
  const python = `import json,sys\ndata=json.load(sys.stdin)\nns={}\nexec(compile(data['code'],'<lesson>','exec'),ns)\nsolver=ns['Solution']()\nprint(json.dumps([solver.maximumProfit(*case) for case in data['cases']]))`;
  const run = spawnSync("python", ["-c", python], {
    input: JSON.stringify({ code: problem.code.join("\n"), cases }),
    encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(JSON.parse(run.stdout), cases.map(([present, future, budget]) => bruteForce(present, future, budget)));
});

test("2291 metadata, solve, live args, catalog tag, and renderer assets are served through HTTP", async () => {
  const port = await new Promise((resolve, reject) => {
    const probe = require("node:net").createServer();
    probe.on("error", reject);
    probe.listen(0, () => {
      const value = probe.address().port;
      probe.close((error) => error ? reject(error) : resolve(value));
    });
  });
  const server = spawn(process.execPath, ["server.js"], {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, PORT: String(port) },
    stdio: "pipe",
  });
  const url = `http://localhost:${port}`;
  let logs = "";
  server.stderr.on("data", (data) => { logs += data; });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null) throw new Error(logs);
      try { ready = (await fetch(`${url}/api/problem/2291`)).ok; } catch {}
      if (ready) break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    assert.ok(ready, logs);
    const metadata = await (await fetch(`${url}/api/problem/2291`)).json();
    assert.deepEqual(metadata.code, problem.code);
    assert.equal(metadata.debugMode, "line-by-line");
    const solved = await fetch(`${url}/api/problem/2291/solve`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "5,4,6,2,3;8,5,4,3,5", params: { budget: 10 } }),
    });
    assert.equal(solved.status, 200);
    const output = await solved.json();
    assert.equal(output.answer, 6);
    assert.ok(output.steps.every((step) => step.tradingStocks2291View));
    const liveArgs = await fetch(`${url}/api/problem/2291/live-args`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "1,7;3,4", params: { budget: 5 } }),
    });
    assert.equal(liveArgs.status, 200);
    assert.deepEqual((await liveArgs.json()).args, [[1, 7], [3, 4], 5]);
    const catalog = await (await fetch(`${url}/api/problems`)).json();
    const knapsack = catalog.groups.find((group) => group.key === "0-1-knapsack");
    assert.ok(knapsack.problems.some((entry) => entry.id === 2291));
    for (const asset of ["renderer-trading-stocks-2291.js", "trading-stocks-2291.css"]) {
      assert.equal((await fetch(`${url}/${asset}`)).status, 200);
    }
  } finally {
    server.kill();
  }
});
