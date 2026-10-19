"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const problem = require("../problems").SUPPORTED[621];

function verify(input, n, expected) {
  const result = problem.builder(input, { n });
  const final = result.steps.at(-1).taskSchedulerView;
  const schedule = final.schedule;
  assert.equal(result.answer, expected);
  assert.equal(schedule.length, expected);
  const counts = {};
  const last = {};
  for (const [index, entry] of schedule.entries()) {
    assert.equal(entry.time, index + 1);
    const before = index ? schedule[index - 1] : { remaining: final.counts, cooldown: {} };
    if (entry.task === null) {
      assert.ok(Object.keys(before.remaining).every(task => !before.remaining[task] || before.cooldown[task] > 0));
    } else {
      assert.ok(last[entry.task] === undefined || index - last[entry.task] - 1 >= n);
      assert.equal(before.cooldown[entry.task] || 0, 0);
      last[entry.task] = index;
      counts[entry.task] = (counts[entry.task] || 0) + 1;
    }
  }
  assert.deepEqual(counts, final.counts);
  assert.ok(schedule.at(-1).task, "no trailing idle");
  const ticks = result.steps.filter(step => step.taskSchedulerView.phase === "schedule");
  assert.equal(ticks.length, expected);
  assert.ok(ticks.every((step, i) => step.taskSchedulerView.cursor === i && step.codeLines.length === 0));
  return result;
}

test("621 creates real schedules for idle, no-idle, unique and tied tasks", () => {
  verify("AAABBB", 2, 8);
  verify("AAABBB", 0, 6);
  verify("AAABBB", 3, 10);
  verify("AAAAAABCDEFG", 2, 16);
  verify("AAABBBCCC", 1, 9); // more tied maxima than n+1
  verify("ABCDEFGH", 8, 8);
  verify("A", 8, 1);
  verify("A".repeat(18), 8, 154); // every slot must remain visible
});

// Independent search over remaining copies and cooldown counters.
function shortest(counts, n, cooldown = counts.map(() => 0), memo = new Map()) {
  if (counts.every(count => count === 0)) return 0;
  const key = `${counts};${cooldown}`;
  if (memo.has(key)) return memo.get(key);
  const ready = counts.map((count, i) => count > 0 && !cooldown[i] ? i : -1).filter(i => i >= 0);
  let answer;
  if (ready.length === 0) {
    const wait = Math.min(...cooldown.filter((_, i) => counts[i] > 0));
    answer = wait + shortest(counts, n, cooldown.map(value => Math.max(0, value - wait)), memo);
  } else {
    answer = 1 + Math.min(...ready.map(i => shortest(counts.map((value, j) => value - (i === j ? 1 : 0)), n, cooldown.map((value, j) => i === j ? n : Math.max(0, value - 1)), memo)));
  }
  memo.set(key, answer);
  return answer;
}

test("621 visual schedule matches an exhaustive scheduling oracle", () => {
  for (let a = 0; a <= 3; a++) for (let b = 0; b <= 3; b++) for (let c = 0; c <= 3; c++) {
    if (!a && !b && !c) continue;
    for (let n = 0; n <= 3; n++) verify("A".repeat(a) + "B".repeat(b) + "C".repeat(c), n, shortest([a, b, c], n));
  }
});

test("621 validates the visualization limits", () => {
  for (const [input, n] of [["", 2], ["A1", 2], ["A".repeat(19), 2], ["A", -1], ["A", 9], ["A", 1.5]]) {
    assert.throws(() => problem.builder(input, { n }));
  }
});

test("621 renderer shows every time slot and supports cooldown selection in both languages", () => {
  const source = fs.readFileSync(require.resolve("../public/renderers-03.js"), "utf8");
  const renderer = source.slice(source.indexOf("function renderTaskSchedulerView(step)"), source.indexOf("function renderHappyNumberView(step)"));
  const listeners = [];
  const host = { innerHTML: "", querySelectorAll: () => [{ dataset: { ts621Slot: "2" }, addEventListener: (_, fn) => listeners.push(fn) }], querySelector: () => ({ focus() {} }) };
  const context = { lang: "vi", $: () => host, escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(renderer, context);
  for (const lang of ["vi", "en"]) {
    context.lang = lang;
    for (const input of ["AAABBB", "AAABBBCCC", "A".repeat(18)]) {
      const result = problem.builder(input, { n: 2 });
      for (const step of result.steps) {
        context.renderTaskSchedulerView(step);
        assert.match(host.innerHTML, /ts621-viz/);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
      }
      assert.equal((host.innerHTML.match(/data-ts621-slot=/g) || []).length, result.answer);
    }
    context.renderTaskSchedulerView(problem.builder("AAABBB", { n: 2 }).steps.at(-1));
    assert.match(host.innerHTML, /2 (ô ở giữa|slots between)/);
    listeners.at(-1)(); // Select t=3, which must be an idle interval.
    assert.match(host.innerHTML, /CPU (nghỉ|idle)/);
    assert.equal((host.innerHTML.match(/ts621-pool-item[^\"]*is-cooling/g) || []).length, 2);
  }
});
