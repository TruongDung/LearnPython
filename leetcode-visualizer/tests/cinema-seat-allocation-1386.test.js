const assert = require("node:assert/strict");
const { test } = require("node:test");
const { spawnSync } = require("node:child_process");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const vm = require("node:vm");
const problem = require("../problems").SUPPORTED[1386];

const builders = [
  problem.builder,
  problem.builder2,
  problem.builder3,
  problem.builder4,
  problem.builder5,
  problem.builder6,
];

function bruteForce(n, reservations) {
  const rows = new Map();
  for (const [row, seat] of reservations) {
    if (!rows.has(row)) rows.set(row, new Set());
    rows.get(row).add(seat);
  }
  const windows = [[2, 5], [4, 7], [6, 9]];
  let answer = 0;
  for (let row = 1; row <= n; row += 1) {
    const reserved = rows.get(row) || new Set();
    const valid = windows.filter(([start, end]) => {
      for (let seat = start; seat <= end; seat += 1) {
        if (reserved.has(seat)) return false;
      }
      return true;
    });
    let best = 0;
    for (let subset = 0; subset < (1 << valid.length); subset += 1) {
      const selected = valid.filter((_, index) => subset & (1 << index));
      const compatible = selected.every((a, index) =>
        selected.slice(index + 1).every((b) => a[1] < b[0] || b[1] < a[0])
      );
      if (compatible) best = Math.max(best, selected.length);
    }
    answer += best;
  }
  return answer;
}

function encodeReservations(reservations) {
  return reservations.map(([row, seat]) => `${row},${seat}`).join(";");
}

test("1386 registers six selectable approaches and builders", () => {
  const selector = problem.extraParams.find((param) => param.key === "approach");
  assert.equal(selector.type, "select");
  assert.deepEqual(selector.options.map((option) => Number(option.value)), [1, 2, 3, 4, 5, 6]);
  assert.equal(builders.length, 6);
  for (const builder of builders) assert.equal(typeof builder, "function");
});

test("all six approaches agree on examples and reservation edge cases", () => {
  const cases = [
    { n: 3, seats: [[1, 2], [1, 3], [1, 8], [2, 6], [3, 1], [3, 10]], expected: 4 },
    { n: 2, seats: [], expected: 4 },
    { n: 1, seats: [[1, 4], [1, 5]], expected: 1 },
    { n: 1, seats: [[1, 2], [1, 6]], expected: 0 },
    { n: 4, seats: [[1, 1], [2, 10], [4, 5]], expected: 7 },
  ];
  for (const { n, seats, expected } of cases) {
    for (const [index, builder] of builders.entries()) {
      const run = builder(n, { reserved: encodeReservations(seats) });
      assert.equal(run.answer, expected, `approach ${index + 1}; n=${n}; seats=${encodeReservations(seats)}`);
      assert.equal(run.steps.at(-1).final, true);
    }
  }
});

test("all six approaches agree with a brute-force oracle on deterministic cases", () => {
  let seed = 1386;
  const random = (limit) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % limit;
  };
  for (let sample = 0; sample < 35; sample += 1) {
    const n = 1 + random(6);
    const seats = [];
    for (let row = 1; row <= n; row += 1) {
      for (let seat = 1; seat <= 10; seat += 1) {
        if (random(4) === 0) seats.push([row, seat]);
      }
    }
    const expected = bruteForce(n, seats);
    for (const [index, builder] of builders.entries()) {
      const run = builder(n, { reserved: encodeReservations(seats) });
      assert.equal(run.answer, expected, `approach ${index + 1}; sample=${sample}`);
    }
  }
});

test("each displayed Python approach returns the sample answer", () => {
  const seats = [[1, 2], [1, 3], [1, 8], [2, 6], [3, 1], [3, 10]];
  for (let approach = 1; approach <= 6; approach += 1) {
    const code = problem[`code${approach === 1 ? "" : approach}`].join("\n");
    const source = `${code}\nprint(Solution().maxNumberOfFamilies(3, ${JSON.stringify(seats)}))`;
    const run = spawnSync("python3", ["-c", source], { encoding: "utf8" });
    assert.equal(run.status, 0, `approach ${approach}: ${run.stderr}`);
    assert.equal(run.stdout.trim(), "4", `approach ${approach}`);
  }
});

test("1386 renderer explains the active window and highlights conflicts", () => {
  const host = { innerHTML: "" };
  const context = {
    lang: "en",
    escapeHtml: String,
    $: () => host,
  };
  vm.createContext(context);
  vm.runInContext(readFileSync(join(__dirname, "..", "public", "renderers-05.js"), "utf8"), context);
  const run = problem.builder(3, { reserved: "1,2;1,3;1,8" });
  const step = run.steps.find((item) => item.cinemaSeatView.activeWindow === "left");
  context.renderCinemaSeatView(step);
  assert.match(host.innerHTML, /cin1386-viz/);
  assert.match(host.innerHTML, /NOW CHECKING · 2–5/);
  assert.match(host.innerHTML, /active-window conflict/);
  assert.match(host.innerHTML, /Blocked by reserved seat/);
  assert.match(readFileSync(join(__dirname, "..", "public", "style-06.css"), "utf8"), /\.cin1386-seat\.active-window\.conflict/);
});
